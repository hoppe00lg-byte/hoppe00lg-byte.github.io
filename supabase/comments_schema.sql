-- =========================================================
-- INSIGHT BRIEF — article comments (Supabase / Postgres)
-- 이메일 + 숫자 4자리 비밀번호로 작성, 4자리 비밀번호로 본인 댓글 삭제.
-- 공개 API(anon)에는 마스킹된 이메일·본문·작성시각만 노출한다.
-- =========================================================

create extension if not exists pgcrypto with schema extensions;

create table if not exists public.comments (
  id              uuid primary key default gen_random_uuid(),
  article_id      text        not null,
  email           text        not null,
  pin_hash        text        not null,
  body            text        not null,
  created_at      timestamptz not null default now(),
  poster_hash     text,
  delete_attempts integer     not null default 0,
  constraint comments_article_len check (char_length(article_id) between 1 and 200),
  constraint comments_body_len    check (char_length(body) between 5 and 1000),
  constraint comments_email_len   check (char_length(email) between 5 and 254)
);

create index if not exists comments_article_created_idx on public.comments (article_id, created_at desc);
create index if not exists comments_poster_created_idx   on public.comments (poster_hash, created_at desc);

-- 테이블 직접 접근 완전 차단: RLS + 권한 회수. 오직 아래 RPC로만 읽고 쓴다.
alter table public.comments enable row level security;
revoke all on table public.comments from anon, authenticated;

-- 이메일 마스킹: ho***@gmail.com
create or replace function public.mask_email(p_email text)
returns text
language sql
immutable
as $$
  select case
    when p_email is null or position('@' in p_email) = 0 then '***'
    else left(split_part(p_email, '@', 1), 2) || '***@' || split_part(p_email, '@', 2)
  end;
$$;

-- 댓글 목록 (공개)
create or replace function public.list_comments(p_article_id text)
returns table (id uuid, author text, body text, created_at timestamptz)
language sql
security definer
set search_path = public, extensions
stable
as $$
  select c.id,
         public.mask_email(c.email) as author,
         c.body,
         c.created_at
    from public.comments c
   where c.article_id = p_article_id
   order by c.created_at desc
   limit 200;
$$;

-- 댓글 등록 (공개)
create or replace function public.add_comment(
  p_article_id text,
  p_email      text,
  p_pin        text,
  p_body       text
)
returns table (id uuid, author text, body text, created_at timestamptz)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_email  text := lower(btrim(coalesce(p_email, '')));
  v_pin    text := btrim(coalesce(p_pin, ''));
  v_body   text := btrim(coalesce(p_body, ''));
  v_ip     text;
  v_hash   text;
  v_recent integer;
  v_id     uuid;
begin
  if p_article_id is null or btrim(p_article_id) = '' or char_length(p_article_id) > 200 then
    raise exception 'invalid_article';
  end if;

  if char_length(v_email) < 5 or char_length(v_email) > 254
     or v_email !~ '^[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}$' then
    raise exception 'invalid_email';
  end if;

  if v_pin !~ '^[0-9]{4}$' then
    raise exception 'invalid_pin';
  end if;

  v_body := regexp_replace(v_body, '[\r\n\t]+', ' ', 'g');
  v_body := regexp_replace(v_body, '\s{2,}', ' ', 'g');
  if char_length(v_body) < 5 then
    raise exception 'body_too_short';
  end if;
  if char_length(v_body) > 1000 then
    raise exception 'body_too_long';
  end if;

  v_ip := coalesce(current_setting('request.headers', true)::jsonb ->> 'x-forwarded-for', '');
  v_hash := encode(digest(coalesce(nullif(btrim(split_part(v_ip, ',', 1)), ''), 'noip') || '|insight-brief-comments', 'sha256'), 'hex');

  select count(*) into v_recent
    from public.comments c
   where c.poster_hash = v_hash
     and c.created_at > now() - interval '10 minutes';

  if v_recent >= 8 then
    raise exception 'rate_limited';
  end if;

  insert into public.comments (article_id, email, pin_hash, body, poster_hash)
  values (btrim(p_article_id), v_email, crypt(v_pin, gen_salt('bf', 8)), v_body, v_hash)
  returning public.comments.id into v_id;

  return query
    select c.id, public.mask_email(c.email) as author, c.body, c.created_at
      from public.comments c
     where c.id = v_id;
end;
$$;

-- 댓글 삭제 (4자리 비밀번호 일치 시에만)
create or replace function public.delete_comment(p_id uuid, p_pin text)
returns boolean
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_pin  text := btrim(coalesce(p_pin, ''));
  v_row  public.comments%rowtype;
begin
  select * into v_row from public.comments where id = p_id;
  if not found then
    raise exception 'not_found';
  end if;

  if v_row.delete_attempts >= 10 then
    raise exception 'locked';
  end if;

  if v_pin ~ '^[0-9]{4}$' and v_row.pin_hash = crypt(v_pin, v_row.pin_hash) then
    delete from public.comments where id = v_row.id;
    return true;
  end if;

  update public.comments
     set delete_attempts = delete_attempts + 1
   where id = v_row.id;
  raise exception 'wrong_pin';
end;
$$;

revoke all on function public.list_comments(text)                  from public;
revoke all on function public.add_comment(text, text, text, text)  from public;
revoke all on function public.delete_comment(uuid, text)           from public;

grant execute on function public.list_comments(text)                 to anon, authenticated;
grant execute on function public.add_comment(text, text, text, text) to anon, authenticated;
grant execute on function public.delete_comment(uuid, text)          to anon, authenticated;

-- PostgREST 스키마 캐시 갱신
notify pgrst, 'reload schema';
