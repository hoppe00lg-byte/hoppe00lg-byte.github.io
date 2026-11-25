-- =========================================================
-- INSIGHT BRIEF — 수익화 접수 백엔드 (Supabase / Postgres)
--   1) public.newsletter_subscribers : 주간 브리핑 구독자 (이메일 중복 방지 · 유입 페이지 기록)
--   2) public.inquiries              : 광고·스폰서 / B2B 소싱·원가 / 사주 PDF 사전신청 / 기타 문의
-- 공개(anon) 권한은 INSERT 하나뿐이고 SELECT 는 막는다. 읽기는 내부용 RPC 두 개로만.
-- 다시 실행해도 안전(idempotent)하도록 작성했다.
-- =========================================================

create extension if not exists pgcrypto with schema extensions;

-- ---------------------------------------------------------
-- 0. 내부 읽기 토큰 (편집실·자동 점검용, 사이트에는 노출하지 않음)
-- ---------------------------------------------------------
create table if not exists public.app_secrets (
  name       text primary key,
  token      text        not null,
  created_at timestamptz not null default now(),
  constraint app_secrets_token_len check (char_length(token) >= 24)
);

alter table public.app_secrets enable row level security;
revoke all on table public.app_secrets from anon, authenticated;

insert into public.app_secrets (name, token)
values ('monetize_read', 'kcZfrcGJyqDc3hHSia0Hdxb3HfBsE28W')
on conflict (name) do nothing;

-- ---------------------------------------------------------
-- 1. 뉴스레터 구독자
-- ---------------------------------------------------------
create table if not exists public.newsletter_subscribers (
  id          uuid primary key default gen_random_uuid(),
  email       text        not null,
  source_page text,
  referrer    text,
  ip_hash     text,
  created_at  timestamptz not null default now(),
  constraint newsletter_email_len   check (char_length(email) between 5 and 254),
  constraint newsletter_email_shape check (email ~ '^[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}$')
);

-- 대소문자만 다른 같은 주소는 한 번만 (insert 시 23505 → 프론트에서 '이미 구독 중')
create unique index if not exists newsletter_subscribers_email_key
  on public.newsletter_subscribers (lower(email));
create index if not exists newsletter_subscribers_created_idx
  on public.newsletter_subscribers (created_at desc);
create index if not exists newsletter_subscribers_ip_idx
  on public.newsletter_subscribers (ip_hash, created_at desc);

alter table public.newsletter_subscribers enable row level security;
revoke all on table public.newsletter_subscribers from anon, authenticated;
grant insert on table public.newsletter_subscribers to anon, authenticated;

drop policy if exists newsletter_insert_public on public.newsletter_subscribers;
create policy newsletter_insert_public on public.newsletter_subscribers
  for insert to anon, authenticated
  with check (true);

-- 정규화·검증·IP 해시·도배 완화 (security definer 라 RLS와 무관하게 최근 건수를 센다)
create or replace function public.newsletter_prepare()
returns trigger
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_hdr    text;
  v_ip     text;
  v_hash   text;
  v_recent integer;
begin
  new.email := lower(btrim(coalesce(new.email, '')));
  if char_length(new.email) < 5 or char_length(new.email) > 254
     or new.email !~ '^[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}$' then
    raise exception 'invalid_email';
  end if;

  new.source_page := left(regexp_replace(coalesce(new.source_page, ''), '[^A-Za-z0-9_\-./?=&%:#가-힣]', '', 'g'), 120);
  new.referrer    := left(coalesce(new.referrer, ''), 200);

  v_hdr := current_setting('request.headers', true);
  if v_hdr is not null and v_hdr <> '' then
    v_ip := v_hdr::jsonb ->> 'x-forwarded-for';
  end if;
  v_ip   := coalesce(nullif(btrim(split_part(coalesce(v_ip, ''), ',', 1)), ''), 'noip');
  v_hash := encode(digest(v_ip || '|insight-brief-newsletter', 'sha256'), 'hex');

  select count(*) into v_recent
    from public.newsletter_subscribers s
   where s.ip_hash = v_hash
     and s.created_at > now() - interval '10 minutes';
  if v_recent >= 30 then
    raise exception 'rate_limited';
  end if;

  new.ip_hash := v_hash;
  return new;
end;
$$;

drop trigger if exists newsletter_prepare_trg on public.newsletter_subscribers;
create trigger newsletter_prepare_trg
  before insert on public.newsletter_subscribers
  for each row execute function public.newsletter_prepare();

-- ---------------------------------------------------------
-- 2. 문의 접수 (광고·스폰서 / B2B / 사주 PDF / 기타)
-- ---------------------------------------------------------
create table if not exists public.inquiries (
  id          uuid primary key default gen_random_uuid(),
  kind        text        not null,
  name        text,
  email       text,
  phone       text,
  message     text        not null,
  source_page text,
  status      text        not null default 'new',
  ip_hash     text,
  created_at  timestamptz not null default now(),
  constraint inquiries_kind_chk    check (kind in ('ad', 'b2b', 'saju', 'other')),
  constraint inquiries_status_chk  check (status in ('new', 'contacted', 'closed', 'spam')),
  constraint inquiries_message_len check (char_length(message) between 5 and 4000),
  constraint inquiries_email_len   check (email is null or char_length(email) between 5 and 254)
);

create index if not exists inquiries_created_idx on public.inquiries (created_at desc);
create index if not exists inquiries_kind_idx    on public.inquiries (kind, created_at desc);
create index if not exists inquiries_ip_idx      on public.inquiries (ip_hash, created_at desc);

alter table public.inquiries enable row level security;
revoke all on table public.inquiries from anon, authenticated;
grant insert on table public.inquiries to anon, authenticated;

drop policy if exists inquiries_insert_public on public.inquiries;
create policy inquiries_insert_public on public.inquiries
  for insert to anon, authenticated
  with check (true);

create or replace function public.inquiries_prepare()
returns trigger
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_hdr    text;
  v_ip     text;
  v_hash   text;
  v_recent integer;
begin
  new.kind := lower(btrim(coalesce(new.kind, '')));
  if new.kind not in ('ad', 'b2b', 'saju', 'other') then
    raise exception 'invalid_kind';
  end if;

  new.name    := left(nullif(btrim(coalesce(new.name, '')), ''), 80);
  new.phone   := left(nullif(regexp_replace(coalesce(new.phone, ''), '[^0-9+\-(). ]', '', 'g'), ''), 40);
  new.email   := nullif(lower(btrim(coalesce(new.email, ''))), '');

  if new.email is not null
     and (char_length(new.email) < 5 or char_length(new.email) > 254
          or new.email !~ '^[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}$') then
    raise exception 'invalid_email';
  end if;

  if new.email is null and new.phone is null then
    raise exception 'contact_required';
  end if;

  new.message := btrim(coalesce(new.message, ''));
  if char_length(new.message) < 5 then
    raise exception 'message_too_short';
  end if;
  if char_length(new.message) > 4000 then
    raise exception 'message_too_long';
  end if;

  new.source_page := left(regexp_replace(coalesce(new.source_page, ''), '[^A-Za-z0-9_\-./?=&%:#가-힣]', '', 'g'), 120);
  new.status      := 'new';

  v_hdr := current_setting('request.headers', true);
  if v_hdr is not null and v_hdr <> '' then
    v_ip := v_hdr::jsonb ->> 'x-forwarded-for';
  end if;
  v_ip   := coalesce(nullif(btrim(split_part(coalesce(v_ip, ''), ',', 1)), ''), 'noip');
  v_hash := encode(digest(v_ip || '|insight-brief-inquiries', 'sha256'), 'hex');

  select count(*) into v_recent
    from public.inquiries i
   where i.ip_hash = v_hash
     and i.created_at > now() - interval '10 minutes';
  if v_recent >= 10 then
    raise exception 'rate_limited';
  end if;

  new.ip_hash := v_hash;
  return new;
end;
$$;

drop trigger if exists inquiries_prepare_trg on public.inquiries;
create trigger inquiries_prepare_trg
  before insert on public.inquiries
  for each row execute function public.inquiries_prepare();

-- ---------------------------------------------------------
-- 3. 내부 읽기 RPC (토큰 필요, 사이트 어디에도 링크하지 않음)
-- ---------------------------------------------------------
create or replace function public.list_inquiries(
  p_token text,
  p_limit integer default 100
)
returns table (
  id uuid, kind text, name text, email text, phone text,
  message text, source_page text, status text, created_at timestamptz
)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_token text;
begin
  select s.token into v_token from public.app_secrets s where s.name = 'monetize_read';
  if v_token is null or p_token is null or p_token <> v_token then
    raise exception 'unauthorized';
  end if;

  return query
    select i.id, i.kind, i.name, i.email, i.phone, i.message,
           i.source_page, i.status, i.created_at
      from public.inquiries i
     order by i.created_at desc
     limit least(greatest(coalesce(p_limit, 100), 1), 500);
end;
$$;

create or replace function public.list_newsletter_subscribers(
  p_token text,
  p_limit integer default 100
)
returns table (
  email text, source_page text, created_at timestamptz
)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_token text;
begin
  select s.token into v_token from public.app_secrets s where s.name = 'monetize_read';
  if v_token is null or p_token is null or p_token <> v_token then
    raise exception 'unauthorized';
  end if;

  return query
    select s.email, s.source_page, s.created_at
      from public.newsletter_subscribers s
     order by s.created_at desc
     limit least(greatest(coalesce(p_limit, 100), 1), 1000);
end;
$$;

create or replace function public.monetize_stats(p_token text)
returns table (
  subscribers bigint, subscribers_7d bigint,
  inquiries_new bigint, inquiries_7d bigint
)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_token text;
begin
  select s.token into v_token from public.app_secrets s where s.name = 'monetize_read';
  if v_token is null or p_token is null or p_token <> v_token then
    raise exception 'unauthorized';
  end if;

  return query
    select (select count(*) from public.newsletter_subscribers),
           (select count(*) from public.newsletter_subscribers s where s.created_at > now() - interval '7 days'),
           (select count(*) from public.inquiries i where i.status = 'new'),
           (select count(*) from public.inquiries i where i.created_at > now() - interval '7 days');
end;
$$;

revoke all on function public.list_inquiries(text, integer)              from public;
revoke all on function public.list_newsletter_subscribers(text, integer) from public;
revoke all on function public.monetize_stats(text)                       from public;
revoke all on function public.newsletter_prepare()                       from public;
revoke all on function public.inquiries_prepare()                        from public;

grant execute on function public.list_inquiries(text, integer)              to anon, authenticated;
grant execute on function public.list_newsletter_subscribers(text, integer) to anon, authenticated;
grant execute on function public.monetize_stats(text)                       to anon, authenticated;

-- PostgREST 스키마 캐시 갱신
notify pgrst, 'reload schema';
