#!/usr/bin/env python3
"""INSIGHT BRIEF — IndexNow 즉시 색인 제출 도구.

IndexNow 는 Bing(그리고 Bing 이 결과를 공급하는 Yahoo·DuckDuckGo·Ecosia 등),
Yandex, Seznam, Naver 에 "이 URL 이 새로 생겼거나 바뀌었다"를 바로 알리는 공개 규약입니다.
사이트 루트에 32자 hex 키 파일({key}.txt)을 두고, 같은 키로 URL 목록을 POST 합니다.

사용 예
  python3 tools/indexnow_ping.py                 # 핵심 페이지 + 최근 변경 기사 제출
  python3 tools/indexnow_ping.py --days 30       # 최근 30일 변경분까지
  python3 tools/indexnow_ping.py --all           # sitemap.xml 의 모든 URL 제출
  python3 tools/indexnow_ping.py --url https://insightbriefnews.com/ja/ --url https://insightbriefnews.com/zh/
  python3 tools/indexnow_ping.py --dry-run       # 실제 전송 없이 대상 목록만 확인
  python3 tools/indexnow_ping.py --check         # 키 파일이 라이브에서 열리는지만 확인

응답 코드
  200 OK            제출 접수
  202 Accepted      접수했지만 키 검증이 아직 끝나지 않음(보통 정상)
  400 Bad Request   요청 형식 오류
  403 Forbidden     키 파일을 찾지 못했거나 내용이 키와 다름
  422 Unprocessable URL 의 host 가 키 파일의 host 와 다름
  429 Too Many Requests  잠시 뒤 다시
"""

from __future__ import annotations

import argparse
import datetime
import json
import os
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ENDPOINT = "https://api.indexnow.org/indexnow"
HOST = "insightbriefnews.com"
BASE = "https://" + HOST
KEY_RE = re.compile(r"^[0-9a-f]{32}\.txt$")
UA = "INSIGHT-BRIEF-IndexNow/1.0 (+https://insightbriefnews.com/)"

# 새 글이 올라오거나 구조가 바뀌면 늘 다시 알려야 하는 핵심 페이지
CORE_PATHS = [
    "/index.html",
    "/market.html",
    "/tax.html",
    "/law.html",
    "/insurance.html",
    "/forms.html",
    "/salary.html",
    "/biz.html",
    "/seller.html",
    "/saju.html",
    "/lotto.html",
    "/experts.html",
    "/links.html",
    "/ad.html",
    "/about.html",
    "/contact.html",
    "/sitemap.html",
]
LOCALE_PREFIXES = ["", "/en", "/zh", "/ja"]

CODE_MEANING = {
    200: "제출 접수(OK)",
    202: "접수됨 — 키 검증 대기(Accepted)",
    400: "요청 형식 오류(Bad Request)",
    403: "키 파일을 찾지 못했거나 내용 불일치(Forbidden)",
    422: "URL 의 host 가 키 host 와 다름(Unprocessable)",
    429: "요청이 너무 잦음(Too Many Requests) — 잠시 뒤 재시도",
}


def find_key() -> str:
    """루트의 32자 hex 키 파일 이름에서 키를 얻습니다. 환경변수 INDEXNOW_KEY 가 우선."""
    env = (os.environ.get("INDEXNOW_KEY") or "").strip()
    if env:
        return env
    found = sorted(n for n in os.listdir(ROOT) if KEY_RE.match(n))
    if not found:
        raise SystemExit(
            "IndexNow 키 파일이 없습니다. tools/indexnow_ping.py --new-key 로 만들 수 있습니다."
        )
    if len(found) > 1:
        print(f"! 키 파일이 여러 개입니다. 첫 번째를 씁니다: {found[0]} (나머지: {', '.join(found[1:])})")
    return found[0][: -len(".txt")]


def new_key() -> str:
    import secrets

    key = secrets.token_hex(16)
    path = os.path.join(ROOT, key + ".txt")
    with open(path, "w", encoding="utf-8") as f:
        f.write(key + "\n")
    print(f"키 파일 생성: {os.path.relpath(path, ROOT)}  (배포 후 {BASE}/{key}.txt 로 열립니다)")
    return key


def http_get(url: str, timeout: int = 20) -> tuple[int, str]:
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "*/*"})
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return r.status, r.read(4096).decode("utf-8", "replace")
    except urllib.error.HTTPError as e:
        return e.code, e.read(2048).decode("utf-8", "replace")
    except Exception as e:  # noqa: BLE001 — 네트워크 실패도 상태로 보고합니다
        return 0, f"{type(e).__name__}: {e}"


def check_key(key: str) -> bool:
    url = f"{BASE}/{key}.txt"
    status, body = http_get(url)
    ok = status == 200 and body.strip() == key
    print(f"키 파일 확인  {url}  →  HTTP {status}  {'OK' if ok else '확인 필요'}")
    if not ok and status == 200:
        print(f"  파일 내용이 키와 다릅니다(받은 내용: {body[:60]!r})")
    elif status == 404:
        print("  404 — 키 파일이 아직 배포되지 않았습니다. 커밋·푸시 후 GitHub Pages 반영(1~2분)을 기다리세요.")
    return ok


def sitemap_urls() -> list[tuple[str, str]]:
    """sitemap.xml 에서 (loc, lastmod) 목록. 없으면 빈 목록."""
    path = os.path.join(ROOT, "sitemap.xml")
    if not os.path.exists(path):
        return []
    ns = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}
    try:
        tree = ET.parse(path)
    except ET.ParseError as e:
        print(f"! sitemap.xml 파싱 실패: {e}")
        return []
    out: list[tuple[str, str]] = []
    for u in tree.getroot().findall("sm:url", ns):
        loc = (u.findtext("sm:loc", default="", namespaces=ns) or "").strip()
        lastmod = (u.findtext("sm:lastmod", default="", namespaces=ns) or "").strip()
        if loc:
            out.append((loc, lastmod))
    return out


def core_urls() -> list[str]:
    urls = []
    for prefix in LOCALE_PREFIXES:
        for p in CORE_PATHS:
            urls.append(f"{BASE}{prefix}{p}")
        urls.append(f"{BASE}{prefix}/")  # 폴더 인덱스(/en/ 등)
    # 사이트맵·피드 자체도 새 기사가 올라오면 바뀝니다.
    urls += [f"{BASE}/sitemap.xml", f"{BASE}/feed.xml"]
    return urls


def recent_article_urls(days: int) -> list[str]:
    cutoff = datetime.date.today() - datetime.timedelta(days=days)
    picked = []
    for loc, lastmod in sitemap_urls():
        try:
            d = datetime.date.fromisoformat(lastmod[:10])
        except ValueError:
            continue
        if d >= cutoff and "/a/" in loc:
            picked.append(loc)
    return picked


def dedupe(seq) -> list[str]:
    seen, out = set(), []
    for u in seq:
        u = (u or "").strip()
        if not u or u in seen:
            continue
        seen.add(u)
        out.append(u)
    return out


def submit(key: str, urls: list[str], endpoint: str, key_location: str, batch: int = 500) -> int:
    """IndexNow 에 제출합니다. 성공(200/202)한 배치 수를 돌려줍니다."""
    ok_batches = 0
    total = len(urls)
    batch = max(1, min(batch, 10000))
    for i in range(0, total, batch):
        chunk = urls[i : i + batch]
        payload = {
            "host": HOST,
            "key": key,
            "keyLocation": key_location,
            "urlList": chunk,
        }
        data = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        req = urllib.request.Request(
            endpoint,
            data=data,
            method="POST",
            headers={
                "Content-Type": "application/json; charset=utf-8",
                "User-Agent": UA,
            },
        )
        label = f"{i + 1}~{i + len(chunk)} / {total}"
        try:
            with urllib.request.urlopen(req, timeout=45) as r:
                status = r.status
                body = r.read(2048).decode("utf-8", "replace")
        except urllib.error.HTTPError as e:
            status = e.code
            body = e.read(2048).decode("utf-8", "replace")
        except Exception as e:  # noqa: BLE001
            print(f"  [{label}] 전송 실패: {type(e).__name__}: {e}")
            continue
        meaning = CODE_MEANING.get(status, "")
        print(f"  [{label}] HTTP {status} {meaning}")
        if body.strip():
            print(f"      응답 본문: {body[:300]}")
        if status in (200, 202):
            ok_batches += 1
        elif status == 429:
            print("      잠시 대기합니다(30초).")
            time.sleep(30)
    return ok_batches


def main() -> int:
    ap = argparse.ArgumentParser(description="IndexNow(Bing·Yahoo·DuckDuckGo·Naver 등) 즉시 색인 제출")
    ap.add_argument("--all", action="store_true", help="sitemap.xml 의 모든 URL 제출")
    ap.add_argument("--days", type=int, default=7, help="최근 N일 안에 바뀐 기사 URL 포함(기본 7)")
    ap.add_argument("--url", action="append", default=[], help="직접 지정할 URL(여러 번 가능)")
    ap.add_argument("--only", choices=["core", "recent", "sitemap"], help="핵심 페이지만 / 최근 변경분만 / 사이트맵 전체")
    ap.add_argument("--core-only", action="store_true", help="(--only core 와 같음)")
    ap.add_argument("--no-core", action="store_true", help="핵심 페이지를 빼고 바뀐 기사 URL 만 제출(매일 도는 색인 작업용)")
    ap.add_argument("--dry-run", action="store_true", help="전송하지 않고 대상만 출력")
    ap.add_argument("--check", action="store_true", help="키 파일이 라이브에서 열리는지만 확인")
    ap.add_argument("--skip-key-check", action="store_true", help="키 파일 라이브 확인을 건너뜀")
    ap.add_argument("--new-key", action="store_true", help="새 32자 hex 키 파일 생성 후 종료")
    ap.add_argument("--endpoint", default=ENDPOINT)
    ap.add_argument("--key-location", default="", help="기본값 https://{host}/{key}.txt")
    ap.add_argument("--json", action="store_true", help="결과를 JSON 한 줄로 출력")
    ap.add_argument("--delay", type=float, default=0.0, help="배치 사이 대기(초)")
    args = ap.parse_args()

    if args.new_key:
        new_key()
        return 0

    key = find_key()
    key_location = args.key_location or f"{BASE}/{key}.txt"

    if args.check:
        return 0 if check_key(key) else 1

    only = args.only or ("core" if args.core_only else ("sitemap" if args.all else "recent"))
    core = [] if args.no_core else core_urls()
    urls = list(args.url)
    if only == "core":
        urls += core_urls()
    elif only == "recent":
        urls += core + recent_article_urls(args.days)
    else:  # sitemap
        urls += [loc for loc, _ in sitemap_urls()]

    urls = dedupe(urls)
    bad = [u for u in urls if not u.startswith(BASE + "/")]
    if bad:
        print(f"! 이 사이트 주소가 아닌 URL 은 제외합니다: {bad[:5]}")
        urls = [u for u in urls if u.startswith(BASE + "/")]

    print(f"키: {key}  (키 위치 {key_location})")
    print(f"제출 대상: {len(urls)}개 URL  (모드 {only})")
    for u in urls[:12]:
        print("  -", u)
    if len(urls) > 12:
        print(f"  …외 {len(urls) - 12}개")

    if args.dry_run:
        print("드라이런 — 전송하지 않았습니다.")
        return 0
    if not urls:
        print("제출할 URL 이 없습니다.")
        return 1

    if not args.skip_key_check and not check_key(key):
        print("키 파일이 라이브에서 확인되지 않아 제출을 보류합니다. --skip-key-check 로 강제 실행할 수 있습니다.")
        return 1

    ok = submit(key, urls, args.endpoint, key_location)
    batches = (len(urls) + 499) // 500
    print(f"완료: {ok}/{batches} 배치 접수")
    if args.json:
        print(json.dumps({"key": key, "urls": len(urls), "batches_ok": ok, "batches_total": batches}, ensure_ascii=False))
    return 0 if ok == batches else 1


if __name__ == "__main__":
    sys.exit(main())
