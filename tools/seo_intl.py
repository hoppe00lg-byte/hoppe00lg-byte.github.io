#!/usr/bin/env python3
"""INSIGHT BRIEF — 검색·공유용 <head> 메타 점검/보정 도구.

해외 검색(구글·빙·야후·바이두)과 메신저 공유(LINE·위챗·카카오톡) 카드가 깨지지 않으려면
모든 페이지의 canonical·og:image·twitter:image 가 절대 주소(https://insightbriefnews.com/...)여야 하고,
언어별 og:locale 과 hreflang 이 서로 맞아야 합니다.

  python3 tools/seo_intl.py --check     # 문제만 보고(종료코드 1 = 문제 있음)
  python3 tools/seo_intl.py --fix       # 상대 주소를 절대 주소로 바꾸고 빠진 og:url·og:locale 을 채움
  python3 tools/seo_intl.py --check --verify-images   # og:image URL 이 실제로 200 인지 확인(네트워크)

여러 번 실행해도 결과가 같습니다(멱등). 생성 스크립트(build.py·i18n_pages.py)를 고친 뒤
한 번 돌려 두면 손으로 만든 페이지까지 같은 규칙으로 맞춰집니다.
"""

from __future__ import annotations

import argparse
import os
import re
import sys
import urllib.error
import urllib.parse
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HOST = "insightbriefnews.com"
BASE = "https://" + HOST
UA = "INSIGHT-BRIEF-SEO-Check/1.0 (+https://insightbriefnews.com/)"

LOCALE_BY_FOLDER = {"en": ("en", "en_US"), "zh": ("zh-Hans", "zh_CN"), "ja": ("ja", "ja_JP"), "": ("ko", "ko_KR")}

CANON_RE = re.compile(r'<link rel="canonical" href="([^"]*)">')
OGIMG_RE = re.compile(r'<meta property="og:image" content="([^"]*)">')
TWIMG_RE = re.compile(r'<meta name="twitter:image" content="([^"]*)">')
OGURL_RE = re.compile(r'<meta property="og:url" content="([^"]*)">')
OGLOC_RE = re.compile(r'<meta property="og:locale" content="([^"]*)">')
HREFLANG_RE = re.compile(r'<link rel="alternate" hreflang="([^"]+)" href="([^"]*)">')
DESC_RE = re.compile(r'<meta name="description" content="([^"]*)">')


VERIFY_RE = re.compile(r"^(google|naver)[0-9a-z]+\.html$")


def html_files() -> list[str]:
    """사이트의 HTML 페이지 목록(검증용 파일·자산·데이터 폴더 제외)."""
    out = []
    for dirpath, dirnames, filenames in os.walk(ROOT):
        rel = os.path.relpath(dirpath, ROOT)
        dirnames[:] = [d for d in dirnames if d not in (".git", "assets", "data", "tools", "screenshots", "supabase", "node_modules")]
        for name in filenames:
            if not name.endswith(".html") or VERIFY_RE.match(name):
                continue
            out.append(name if rel == "." else os.path.join(rel, name))
    return sorted(out)


def folder_of(relpath: str) -> str:
    head = relpath.split(os.sep)[0]
    return head if head in ("en", "zh", "ja") else ""


def page_url(relpath: str) -> str:
    return BASE + "/" + urllib.parse.quote(relpath.replace(os.sep, "/"))


def absolute(src: str, relpath: str) -> str:
    """상대 주소를 그 페이지 기준 절대 주소로 바꿉니다."""
    if re.match(r"^(https?:)?//", src) or not src:
        return src
    if src.startswith("/"):
        return BASE + src
    folder = os.path.dirname(relpath).replace(os.sep, "/")
    joined = "/" + (folder + "/" + src if folder else src)
    parts: list[str] = []
    for seg in joined.split("/"):
        if seg in ("", "."):
            continue
        if seg == "..":
            if parts:
                parts.pop()
            continue
        parts.append(seg)
    return BASE + "/" + "/".join(parts)


def check_file(relpath: str, fix: bool) -> tuple[list[str], list[str]]:
    """(문제 목록, 고친 목록)"""
    path = os.path.join(ROOT, relpath)
    try:
        with open(path, encoding="utf-8") as f:
            src = f.read()
    except OSError:
        return ([f"{relpath}: 읽기 실패"], [])
    orig = src
    issues: list[str] = []
    fixed: list[str] = []
    loc_folder = folder_of(relpath)
    hl, og_locale = LOCALE_BY_FOLDER[loc_folder]
    url = page_url(relpath)

    # 1) canonical (404 페이지는 canonical 을 두지 않습니다)
    m = CANON_RE.search(src)
    if not m:
        issues.append(f"{relpath}: canonical 없음")
        if fix and not relpath.endswith("404.html"):
            anchor = OGIMG_RE.search(src) or OGLOC_RE.search(src) or DESC_RE.search(src)
            if anchor:
                src = src.replace(anchor.group(0), f'<link rel="canonical" href="{url}">\n' + anchor.group(0), 1)
                fixed.append("canonical")
    else:
        cur = m.group(1)
        want = absolute(cur, relpath)
        if cur != want:
            issues.append(f"{relpath}: canonical 상대 주소 → {want}")
            if fix:
                src = src.replace(m.group(0), f'<link rel="canonical" href="{want}">', 1)
                fixed.append("canonical")

    # 2) og:image
    m = OGIMG_RE.search(src)
    if not m:
        issues.append(f"{relpath}: og:image 없음 (공유 카드 썸네일이 안 뜸)")
    else:
        cur = m.group(1)
        want = absolute(cur, relpath)
        if cur != want:
            issues.append(f"{relpath}: og:image 상대 주소 → {want}")
            if fix:
                src = src.replace(m.group(0), f'<meta property="og:image" content="{want}">', 1)
                fixed.append("og:image")

    # 3) twitter:image (없으면 og:image 로 채움)
    m = TWIMG_RE.search(src)
    if not m:
        issues.append(f"{relpath}: twitter:image 없음")
        if fix:
            og = OGIMG_RE.search(src)
            if og:
                img = absolute(og.group(1), relpath)
                src = src.replace(og.group(0), og.group(0) + f'\n<meta name="twitter:image" content="{img}">', 1)
                fixed.append("twitter:image")
    else:
        cur = m.group(1)
        want = absolute(cur, relpath)
        if cur != want:
            issues.append(f"{relpath}: twitter:image 상대 주소 → {want}")
            if fix:
                src = src.replace(m.group(0), f'<meta name="twitter:image" content="{want}">', 1)
                fixed.append("twitter:image")

    # 4) og:url — canonical 과 같은 주소여야 합니다.
    # (언어 페이지가 한국어 주소를 그대로 들고 있으면 공유 카드의 링크가 엉뚱한 언어로 갑니다)
    canon_now = CANON_RE.search(src)
    want_url = absolute(canon_now.group(1), relpath) if canon_now else url
    m = OGURL_RE.search(src)
    if not m:
        issues.append(f"{relpath}: og:url 없음")
        if fix:
            anchor = OGIMG_RE.search(src) or CANON_RE.search(src)
            if anchor:
                src = src.replace(anchor.group(0), anchor.group(0) + f'\n<meta property="og:url" content="{want_url}">', 1)
                fixed.append("og:url")
    else:
        cur = absolute(m.group(1), relpath)
        if cur != want_url:
            issues.append(f"{relpath}: og:url {cur} ≠ canonical {want_url}")
            if fix:
                src = src.replace(m.group(0), f'<meta property="og:url" content="{want_url}">', 1)
                fixed.append("og:url")

    # 5) og:locale
    m = OGLOC_RE.search(src)
    if not m:
        issues.append(f"{relpath}: og:locale 없음 (기대값 {og_locale})")
        if fix:
            anchor = OGURL_RE.search(src) or OGIMG_RE.search(src) or CANON_RE.search(src)
            if anchor:
                src = src.replace(anchor.group(0), anchor.group(0) + f'\n<meta property="og:locale" content="{og_locale}">', 1)
                fixed.append("og:locale")
    elif m.group(1) != og_locale:
        issues.append(f"{relpath}: og:locale {m.group(1)} (기대값 {og_locale})")
        if fix:
            src = src.replace(m.group(0), f'<meta property="og:locale" content="{og_locale}">', 1)
            fixed.append("og:locale")

    # 6) description
    m = DESC_RE.search(src)
    if not m or len(m.group(1).strip()) < 20:
        issues.append(f"{relpath}: description 이 없거나 너무 짧음")

    # 7) hreflang (상위 페이지에만 있으면 되므로 폴더 인덱스·도구 페이지만 확인)
    if "/a/" not in relpath.replace(os.sep, "/"):
        langs = {x[0] for x in HREFLANG_RE.findall(src)}
        missing = {"ko", "en", "zh-Hans", "ja"} - langs
        if missing:
            issues.append(f"{relpath}: hreflang 누락 {sorted(missing)}")

    if fix and src != orig:
        with open(path, "w", encoding="utf-8") as f:
            f.write(src)
    return issues, fixed


def verify_images(urls: list[str]) -> list[str]:
    bad = []
    for u in sorted(set(urls)):
        req = urllib.request.Request(u, method="HEAD", headers={"User-Agent": UA})
        try:
            with urllib.request.urlopen(req, timeout=20) as r:
                if r.status != 200:
                    bad.append(f"{u}: HTTP {r.status}")
                elif not (r.headers.get("Content-Type", "").startswith("image/")):
                    bad.append(f"{u}: Content-Type {r.headers.get('Content-Type')}")
        except urllib.error.HTTPError as e:
            bad.append(f"{u}: HTTP {e.code}")
        except Exception as e:  # noqa: BLE001
            bad.append(f"{u}: {type(e).__name__}")
    return bad


def apply(quiet: bool = False, only: str | None = None):
    """모든 페이지를 보정합니다(멱등). 다른 빌드 스크립트에서 부를 수 있도록 함수로 둡니다."""
    files = html_files()
    if only:
        files = [f for f in files if f.replace(os.sep, "/").startswith(only)]
    changed = 0
    for rel in files:
        _issues, fixed = check_file(rel, True)
        if fixed:
            changed += 1
    if not quiet:
        print(f"head 메타 보정: {len(files)}개 파일 중 {changed}개 수정")
    return files, changed


def main() -> int:
    ap = argparse.ArgumentParser(description="검색·공유용 head 메타 점검/보정")
    ap.add_argument("--check", action="store_true", help="점검만 함(기본 동작)")
    ap.add_argument("--fix", action="store_true", help="상대 주소·빠진 og 태그를 고쳐 씀")
    ap.add_argument("--quiet", action="store_true", help="통과한 파일은 출력하지 않음")
    ap.add_argument("--verify-images", action="store_true", help="og:image URL 이 실제로 열리는지 확인")
    ap.add_argument("--only", help="부분 경로로 범위 제한(예: ja/)")
    args = ap.parse_args()

    files = html_files()
    if args.only:
        files = [f for f in files if f.replace(os.sep, "/").startswith(args.only)]

    total_issues = 0
    changed = 0
    images: list[str] = []
    for rel in files:
        issues, fixed = check_file(rel, args.fix)
        if fixed:
            changed += 1
        total_issues += len(issues)
        if issues and not args.quiet:
            for i in issues:
                print("·", i)
        if args.verify_images:
            with open(os.path.join(ROOT, rel), encoding="utf-8") as f:
                body = f.read()
            for pat in (OGIMG_RE, TWIMG_RE):
                m = pat.search(body)
                if m and m.group(1).startswith("http"):
                    images.append(m.group(1))

    print(f"\n점검 파일 {len(files)}개 · 문제 {total_issues}건" + (f" · 보정 {changed}개 파일" if args.fix else ""))
    if args.verify_images:
        bad = verify_images(images)
        print(f"og/twitter 이미지 {len(set(images))}개 확인 · 문제 {len(bad)}건")
        for b in bad[:20]:
            print("·", b)
        total_issues += len(bad)
    return 1 if total_issues else 0


if __name__ == "__main__":
    sys.exit(main())
