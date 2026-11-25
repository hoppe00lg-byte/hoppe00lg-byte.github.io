# 인기 리포트 · 조회수 백엔드 (Supabase)

홈 사이드바 '인기 리포트 TOP 5'와 기사 상단의 `읽음 N`은 `data/articles.json`의 정적 값이 아니라
Supabase 프로젝트 `insight-brief`(`gsyqduysdzoifvyovfsc`)의 실제 조회수로 표시된다.

## 구성

| 항목 | 값 |
| --- | --- |
| 프로젝트 | `insight-brief` (조직: Insight Brief, Free 플랜) |
| API URL | `https://gsyqduysdzoifvyovfsc.supabase.co` |
| 프론트 키 | publishable 키 (댓글과 같은 공개 전용 키, `assets/js/app.js`의 `COMMENTS.key`) |
| 스키마 원본 | `supabase/views_schema.sql` |

테이블 두 개는 직접 조회 권한이 없고, 브라우저는 RPC 두 개로만 접근한다.

| RPC | 역할 | 공개 범위 |
| --- | --- | --- |
| `bump_article_view(p_article_id, p_visitor)` | 기사 열람 1회 기록 | 그 기사의 현재 누적 조회수(bigint) |
| `list_article_views()` | 기사별 조회수 목록 | `article_id`, `views` (인기순, 최대 500행) |

테이블은 `public.article_views`(기사별 누적 조회수)와 `public.article_view_seen`(중복 집계 방지용 방문 기록)이다.
RLS를 켜고 `anon`/`authenticated` 권한을 회수했으므로 `select`는 401이다.

## 동작

1. 기사 페이지(`/a/{id}.html`, `article.html?id=...`)를 열면 `bump_article_view`를 한 번 호출한다.
   이때 **언어별로 키가 다르다** — `/a/{id}.html`(한국어)은 `id`, `/en/`·`/zh/`·`/ja/` 기사는
   `id:en`·`id:zh`·`id:ja` 다(예: `pp-negative-spread-ncc-cuts-2026:en`). `bump_article_view` 는
   `article_id` 를 text 로 받으므로 스키마 변경 없이 그대로 동작한다(2026-11-24 `:en` 키 실호출 확인).
   기사 상단·인기 리포트의 조회수 문구도 언어에 맞춘다(읽음 / Views / 阅读 / 閲覧).
2. 같은 방문자가 **6시간** 안에 같은 기사를 다시 열면 세지 않는다(새로고침·중복 방지).
   방문자 구분은 브라우저가 만든 임의 id(`localStorage: ib-visitor-id`)를 SHA-256으로 해시한 값이다.
   저장소를 쓸 수 없는 브라우저는 IP 해시로 대신한다.
3. 도배 완화: 같은 IP에서 10분에 300건까지만 받는다(초과 시 `rate_limited`).
4. 홈은 `list_article_views`로 조회수를 받아 '인기 리포트'를 조회수 내림차순(동률이면 최신순)으로 다시 그린다.
   영어·중국어·일본어 홈은 그 언어의 키(`id:en` 등)만 반영하고, 키가 없는 기사는 0으로 둔다
   (한국어 조회수가 다른 언어 인기 순위에 섞이지 않게).
5. Supabase가 멈췄거나 오프라인이면 조회수 표시만 감추고 사이트는 그대로 동작한다.

## 운영

- 조회수 확인·보정: 대시보드 → SQL Editor

  ```sql
  select article_id, views, updated_at from public.article_views order by views desc;
  ```

- 특정 기사 조회수 초기화: `delete from public.article_views where article_id = '...';`
- 스키마 전체 재적용: `supabase/views_schema.sql` 내용을 SQL Editor에 붙여 실행(idempotent).
- 무료 플랜은 1주일 무활동 시 프로젝트가 일시정지된다. 재개 방법은 `supabase/comments-setup.md` 3절 참고.
