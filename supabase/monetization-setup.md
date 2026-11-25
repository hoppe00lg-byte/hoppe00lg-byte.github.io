# 수익화 접수 백엔드 (Supabase)

뉴스레터 구독자와 문의(광고·B2B·사주 PDF)를 받는 테이블과 권한 설정입니다.
프로젝트는 기존 `insight-brief`(`gsyqduysdzoifvyovfsc`)를 그대로 쓰고, 댓글·조회수와 같은 공개 publishable 키를 씁니다.

| 항목 | 값 |
| --- | --- |
| API URL | `https://gsyqduysdzoifvyovfsc.supabase.co` |
| 프론트 키 | publishable 키 (`assets/js/monetize.js`의 `API.key`, 댓글과 동일) |
| 스키마 원본 | `supabase/monetization_schema.sql` (재실행 안전) |
| 프론트 스크립트 | `assets/js/monetize.js` — `[data-ib-newsletter]`, `[data-ib-inquiry]` 폼을 자동 처리 |

## 테이블

### `public.newsletter_subscribers`
| 열 | 설명 |
| --- | --- |
| `email` | 소문자로 정규화. `lower(email)` 유니크 인덱스라 대소문자만 다른 같은 주소는 1건 |
| `source_page` | 신청이 들어온 경로(`index.html`, `a/{id}.html#...`) |
| `referrer` | 유입 링크(있으면) |
| `ip_hash` | 도배 완화용 IP 해시(원본 IP는 저장하지 않음) |
| `created_at` | 접수 시각 |

### `public.inquiries`
| 열 | 설명 |
| --- | --- |
| `kind` | `ad` 광고·스폰서 / `b2b` 소싱·원가 / `saju` 사주 PDF 사전신청 / `other` |
| `name`, `email`, `phone` | 이메일·연락처 중 하나는 필수 |
| `message` | 5~4,000자 |
| `source_page` | 접수 페이지 |
| `status` | `new` → `contacted` → `closed` (또는 `spam`) |
| `ip_hash`, `created_at` | 도배 완화용 해시, 접수 시각 |

## 권한

- 두 테이블 모두 **RLS 켜짐**. `anon`/`authenticated` 권한은 **INSERT 하나뿐**이다.
- `select`는 `401 permission denied for table ...`로 막힌다(실측).
- INSERT는 before 트리거가 검증·정규화·도배 완화를 맡는다.
  - 이메일 형식 정규식, 문의 유형·길이 검증, 이메일/연락처 필수
  - 같은 IP 해시에서 10분에 구독 30건·문의 10건까지 (`rate_limited`)
  - 중복 이메일은 `23505` → 프론트가 “이미 구독 중인 주소입니다”로 안내

## 읽기 (운영자)

브라우저에는 읽기 권한이 없다. 대시보드 → SQL Editor에서 본다.

```sql
-- 새 문의
select created_at, kind, name, email, phone, left(message, 120) as message, source_page, status
  from public.inquiries
 where status = 'new'
 order by created_at desc;

-- 상태 바꾸기
update public.inquiries set status = 'contacted' where id = '...';

-- 구독자
select email, source_page, created_at from public.newsletter_subscribers order by created_at desc;

-- 요약
select (select count(*) from public.newsletter_subscribers) as subscribers,
       (select count(*) from public.inquiries where status = 'new') as new_inquiries;
```

토큰이 있으면 RPC로도 읽을 수 있다(자동 점검용, 사이트에는 링크하지 않음).

```bash
curl -s -X POST "https://gsyqduysdzoifvyovfsc.supabase.co/rest/v1/rpc/list_inquiries" \
  -H "apikey: <publishable key>" -H "Authorization: Bearer <publishable key>" \
  -H "Content-Type: application/json" \
  -d '{"p_token":"<읽기 토큰>","p_limit":20}'
```

읽기 토큰은 `public.app_secrets(name='monetize_read')`에 있고, 저장소 밖(`work/private/monetize-read-token.txt`)에 보관한다.
토큰을 바꾸려면:

```sql
update public.app_secrets set token = '<새 토큰 24자 이상>' where name = 'monetize_read';
```

## 동작 확인 (실측, 2026-11-23)

| 확인 | 결과 |
| --- | --- |
| 구독 INSERT (anon) | `201` |
| 같은 주소 다시 INSERT | `409 / 23505` |
| 구독 테이블 SELECT | `401 permission denied` |
| 문의 INSERT (ad) | `201` |
| 연락처 없이 문의 | `400 / contact_required` |
| 잘못된 이메일 | `400 / invalid_email` |
| 토큰 있는 `list_inquiries` | 정상 조회 |
| 틀린 토큰 | `400 / unauthorized` |

## 남은 일

- 무료 플랜은 1주 무활동 시 프로젝트가 일시정지된다. 정지되면 구독·문의 폼이 메일 링크로 대체 안내되고, 대시보드 **Restore project**로 1~2분 내 복구된다.
- 접수 알림 메일은 아직 붙이지 않았다. 필요하면 주 1회 `list_inquiries`를 호출하는 예약 작업으로 새 문의를 확인할 수 있다.
