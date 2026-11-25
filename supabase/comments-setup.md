# 기사 댓글 백엔드 (Supabase)

인사이트 브리프 기사 페이지 하단의 댓글은 Supabase 무료 프로젝트 하나로 동작한다.
방문자는 **이메일 + 숫자 4자리 비밀번호**로 댓글을 남기고, 같은 4자리로 본인 댓글만 삭제한다.

## 구성

| 항목 | 값 |
| --- | --- |
| 프로젝트 | `insight-brief` (조직: Insight Brief, Free 플랜) |
| 리전 | Northeast Asia (Seoul) / `ap-northeast-2` |
| 프로젝트 ref | `gsyqduysdzoifvyovfsc` |
| API URL | `https://gsyqduysdzoifvyovfsc.supabase.co` |
| 프론트에서 쓰는 키 | publishable 키 (공개 전용, `assets/js/app.js`의 `COMMENTS.key`) |

테이블은 `public.comments` 하나이고, 직접 조회 권한은 없다.
브라우저는 아래 RPC 세 개로만 접근한다.

| RPC | 역할 | 공개 범위 |
| --- | --- | --- |
| `list_comments(p_article_id)` | 댓글 목록 (최신순, 최대 200개) | 마스킹된 작성자(`ho***@gmail.com`), 본문, 작성시각 |
| `add_comment(p_article_id, p_email, p_pin, p_body)` | 댓글 등록 | 등록된 댓글 1건을 같은 마스킹 형태로 반환 |
| `delete_comment(p_id, p_pin)` | 비밀번호가 일치할 때만 삭제 | 성공 여부(boolean) |

## 보안 규칙

- `comments` 테이블은 RLS 활성 + `anon`/`authenticated` 권한 회수. `select`를 시도하면 401.
- 이메일 원문은 어떤 RPC 응답에도 나가지 않는다. `mask_email()`이 앞 2글자만 남긴다.
- 비밀번호는 `crypt(pin, gen_salt('bf', 8))` 해시로만 저장한다.
- 등록 검증: 이메일 형식, 비밀번호 `^[0-9]{4}$`, 본문 5~1,000자(제어문자 제거).
- 스팸 완화: 같은 IP 해시 기준 10분에 8건까지. 삭제 비밀번호는 댓글당 10회까지 시도 가능.
- 본문은 프론트에서 `textContent`로만 출력한다(HTML 실행 없음).

## 운영

- 댓글 확인·정리: 대시보드 → SQL Editor

  ```sql
  select id, article_id, email, body, created_at
    from public.comments
   order by created_at desc
   limit 50;
  ```

  (이메일 원문은 관리자 SQL에서만 보인다.)

- 특정 댓글 강제 삭제: `delete from public.comments where id = '...';`
- 스키마 전체 재적용: `supabase/comments_schema.sql` 내용을 SQL Editor에 붙여 실행.
- 무료 플랜은 1주일 동안 활동이 없으면 프로젝트가 일시정지된다. 정지되면 댓글 영역에
  "댓글을 불러오지 못했습니다"가 뜨고, 대시보드에서 **Restore project**를 누르면 1~2분 안에 돌아온다.
  주 1회 아래 요청을 한 번 보내 두면 정지를 피할 수 있다(자동화를 붙이려면 workflow 권한이 있는
  계정으로 저장소에 푸시해야 한다).

  ```bash
  curl -sS -X POST "https://gsyqduysdzoifvyovfsc.supabase.co/rest/v1/rpc/list_comments" \
    -H "apikey: sb_publishable_3AGJcDCF27lkTlaKYrIgKg_9kRPJZZ3" \
    -H "Authorization: Bearer sb_publishable_3AGJcDCF27lkTlaKYrIgKg_9kRPJZZ3" \
    -H "Content-Type: application/json" -d '{"p_article_id":"keep-alive"}'
  ```
