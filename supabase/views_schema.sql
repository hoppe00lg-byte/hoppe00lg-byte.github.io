-- =========================================================
-- INSIGHT BRIEF — article views (Supabase / Postgres)
-- 기사 조회수를 서버에 쌓고, 홈 '인기 리포트'가 실제 조회수로 정렬되게 한다.
-- 공개 API(anon)는 RPC 두 개로만 접근한다.
--   bump_article_view(article_id, visitor) → 열람 1회 기록, 현재 조회수 반환
--   list_article_views()                   → 기사별 조회수 목록(인기순)
-- 같은 방문자가 6시간 안에 같은 기사를 다시 열면 세지 않는다(새로고침·중복 방지).
-- =========================================================

create extension if not exists pgcrypto with schema extensions;

-- 기사별 누적 조회수
create table if not exists public.article_views (
  article_id text        primary key,
  views      bigint      not null default 0,
  updated_at timestamptz not null default now(),
  constraint article_views_id_len  check (char_length(article_id) between 1 and 200),
  constraint article_views_nonneg  check (views >= 0)
);

-- 중복 집계 방지용 방문 기록 (방문자 해시 · 기사 조합당 1행)
create table if not exists public.article_view_seen (
  article_id   text        not null,
  visitor_hash text        not null,
  ip_hash      text,
  last_at      timestamptz not null default now(),
  primary key (article_id, visitor_hash),
  constraint article_view_seen_id_len check (char_length(article_id) between 1 and 200)
);

create index if not exists article_view_seen_ip_idx
  on public.article_view_seen (ip_hash, last_at desc);

-- 테이블 직접 접근 차단: RLS + 권한 회수. 오직 아래 RPC로만 읽고 쓴다.
alter table public.article_views      enable row level security;
alter table public.article_view_seen  enable row level security;
revoke all on table public.article_views     from anon, authenticated;
revoke all on table public.article_view_seen from anon, authenticated;

-- 조회수 1회 기록 (중복·도배 방지 포함)
create or replace function public.bump_article_view(
  p_article_id text,
  p_visitor    text default null
)
returns bigint
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_id       text := btrim(coalesce(p_article_id, ''));
  v_visitor  text := btrim(coalesce(p_visitor, ''));
  v_ip       text;
  v_ip_hash  text;
  v_key      text;
  v_recent   integer;
  v_hit      integer := 0;
  v_count    bigint;
begin
  if v_id = '' or char_length(v_id) > 200 then
    raise exception 'invalid_article';
  end if;

  v_ip := coalesce(current_setting('request.headers', true)::jsonb ->> 'x-forwarded-for', '');
  v_ip := btrim(split_part(v_ip, ',', 1));
  v_ip_hash := encode(digest(coalesce(nullif(v_ip, ''), 'noip') || '|insight-brief-views', 'sha256'), 'hex');

  -- 방문자 키: 브라우저가 만든 임의 id(저장 불가 시 IP 해시로 대체)
  v_key := case
             when v_visitor ~ '^[A-Za-z0-9_-]{8,64}$' then 'v:' || v_visitor
             else 'ip:' || v_ip_hash
           end;
  v_key := encode(digest(v_key || '|insight-brief-views', 'sha256'), 'hex');

  -- 같은 IP에서 10분에 300건까지만 (자동화 도배 완화)
  select count(*) into v_recent
    from public.article_view_seen s
   where s.ip_hash = v_ip_hash
     and s.last_at > now() - interval '10 minutes';
  if v_recent >= 300 then
    raise exception 'rate_limited';
  end if;

  insert into public.article_view_seen (article_id, visitor_hash, ip_hash, last_at)
  values (v_id, v_key, v_ip_hash, now())
  on conflict (article_id, visitor_hash) do update
     set last_at = now(),
         ip_hash = excluded.ip_hash
   where public.article_view_seen.last_at < now() - interval '6 hours';

  get diagnostics v_hit = row_count;

  if v_hit > 0 then
    insert into public.article_views (article_id, views, updated_at)
    values (v_id, 1, now())
    on conflict (article_id) do update
       set views = public.article_views.views + 1,
           updated_at = now();
  end if;

  select a.views into v_count from public.article_views a where a.article_id = v_id;
  return coalesce(v_count, 0);
end;
$$;

-- 기사별 조회수 목록 (인기순)
create or replace function public.list_article_views()
returns table (article_id text, views bigint)
language sql
security definer
set search_path = public, extensions
stable
as $$
  select a.article_id, a.views
    from public.article_views a
   order by a.views desc, a.updated_at desc
   limit 500;
$$;

revoke all on function public.bump_article_view(text, text) from public;
revoke all on function public.list_article_views()             from public;

grant execute on function public.bump_article_view(text, text) to anon, authenticated;
grant execute on function public.list_article_views()          to anon, authenticated;

-- PostgREST 스키마 캐시 갱신
notify pgrst, 'reload schema';
