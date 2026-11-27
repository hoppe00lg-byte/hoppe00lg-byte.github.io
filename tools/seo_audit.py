#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""INSIGHT BRIEF — 다국어 SEO 전수 점검.

  python3 tools/seo_audit.py            # 점검만(문제 있으면 종료코드 1)
  python3 tools/seo_audit.py --quiet    # 문제 목록만

보는 것
  1) <html lang> 이 폴더 언어와 맞는가 (ko / en / zh-Hans / ja)
  2) canonical 이 그 페이지 자신의 실제 주소인가 (절대 주소)
  3) og:url == canonical 인가 (언어 페이지가 한국어 주소로 공유되지 않는가)
  4) hreflang 이 그 페이지가 실제로 있는 언어끼리만, x-default 포함, 상호 참조인가
  5) title·description 이 비어 있지 않은가
  6) 구조화 데이터: 기사 페이지 NewsArticle(inLanguage) · 첫 페이지 WebSite
  7) 언어별 기사 페이지 수 = 그 언어로 발행된 기사 수
  8) sitemap.xml: 발행 언어별 URL 이 모두 있고, hreflang·x-default 가 서로 맞는가
  9) 언어별 feed.xml 의 language 값과 항목 수

기준 데이터는 data/articles.json 의 locales·lang 입니다.
"""
from __future__ import annotations

import argparse
import collections
import json
import os
import re
import sys
import urllib.parse
import xml.etree.ElementTree as ET

ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
sys.path.insert(0, os.path.join(ROOT, "tools"))
from i18n_core import ALL_LANGS, article_locales  # noqa: E402

BASE = "https://insightbriefnews.com"
HOST = "insightbriefnews.com"
FOLDER_LANG = {"": "ko", "en": "en", "zh": "zh-Hans", "ja": "ja"}
HTML_LANG = {"ko": "ko", "en": "en", "zh": "zh-Hans", "ja": "ja"}
SKIP_DIRS = {".git", "assets", "data", "tools", "screenshots", "supabase", "node_modules"}

CANON_RE = re.compile(r'<link rel="canonical" href="([^"]*)"')
OGURL_RE = re.compile(r'<meta property="og:url" content="([^"]*)"')
HREFLANG_RE = re.compile(r'<link rel="alternate" hreflang="([^"]+)" href="([^"]*)"')
HTMLLANG_RE = re.compile(r"<html\b[^>]*\blang=\"([^\"]*)\"")
TITLE_RE = re.compile(r"<title>(.*?)</title>", re.S)
DESC_RE = re.compile(r'<meta name="description" content="([^"]*)"')


def load(name):
    with open(os.path.join(ROOT, "data", name), encoding="utf-8") as f:
        return json.load(f)


def html_files():
    out = []
    for dirpath, dirnames, filenames in os.walk(ROOT):
        rel = os.path.relpath(dirpath, ROOT)
        dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS and not d.startswith(".")]
        for name in filenames:
            if not name.endswith(".html") or re.match(r"^(google|naver)[0-9a-z]+\.html$", name):
                continue
            out.append(name if rel == "." else os.path.join(rel, name).replace(os.sep, "/"))
    return sorted(out)


def page_url(rel):
    """그 페이지의 canonical 주소.

    첫 페이지는 2026-11-28 부터 /index.html 이 아니라 /(폴더 주소)를 정본으로 씁니다
    (상단 메뉴·로고 링크가 / 로 바뀌면서 canonical 도 같이 맞춘 결과).
    """
    if rel in ("index.html", "en/index.html", "zh/index.html", "ja/index.html"):
        head = rel[:-len("index.html")]
        return f"{BASE}/{head}"
    return f"{BASE}/{rel}"


def folder_of(rel):
    head = rel.split("/")[0] if "/" in rel else ""
    return head if head in ("en", "zh", "ja") else ""


def article_id_of(rel):
    m = re.match(r"^(?:(en|zh|ja)/)?a/([^/]+)\.html$", rel)
    return (m.group(1), m.group(2)) if m else (None, None)


def check_intl_covers(problems: list[str], notes: list[str]) -> None:
    """외국어판(en·zh·ja) 커버 이미지가 그 언어 카드인지 확인합니다.

    한국어 제목을 박아 만든 카드 한 장을 외국어판이 같이 쓰면 기사 첫 화면에 한글이 남습니다.
    발행 스크립트가 "coverCard": true 로 표시한 기사는 번역 뒤 그 언어 카드를 따로 그려
    {ID}.{lang}.jpg 로 써야 합니다(tools/cover_card.py → tools/i18n_data.py).
    """
    for lang in ("en", "zh", "ja"):
        path = os.path.join(ROOT, "data", f"articles.{lang}.json")
        if not os.path.exists(path):
            continue
        with open(path, encoding="utf-8") as f:
            arts = json.load(f)
        for a in arts:
            cover = str(a.get("coverImage") or "").lstrip("/")
            if not cover:
                continue
            if a.get("coverCard"):
                stem = os.path.splitext(cover)[0]
                if not stem.endswith(f".{lang}"):
                    problems.append(f"{lang}: {a['id']} 커버가 언어별 카드가 아님 — {cover}")
                elif not os.path.exists(os.path.join(ROOT, cover)):
                    problems.append(f"{lang}: {a['id']} 언어별 커버 파일 없음 — {cover}")
            elif not os.path.exists(os.path.join(ROOT, cover)):
                problems.append(f"{lang}: {a['id']} 커버 파일 없음 — {cover}")
            else:
                # 표시가 없는 커버라도 흰/종이색 바탕에 글자만 있는 카드형이면 확인을 남깁니다.
                try:
                    from PIL import Image
                    im = Image.open(os.path.join(ROOT, cover)).convert("RGB").resize((160, 90))
                    colors = im.getcolors(160 * 90) or []
                    top = max(colors)[0] if colors else 0
                    rgb = max(colors)[1] if colors else (0, 0, 0)
                    if top > 0.25 * 160 * 90 and sum(rgb) > 600:
                        notes.append(f"{lang}: {a['id']} 커버가 카드형 이미지로 보입니다 — "
                                     f"한국어 글자가 박혀 있으면 data/articles.json 에 \"coverCard\": true 를 넣으세요")
                except Exception:  # noqa: BLE001
                    pass


def audit(quiet=False):
    articles = {a["id"]: a for a in load("articles.json")}
    problems = []
    pages = html_files()
    counts = collections.Counter()

    for rel in pages:
        try:
            with open(os.path.join(ROOT, rel), encoding="utf-8") as f:
                src = f.read()
        except OSError:
            problems.append(f"{rel}: 읽기 실패")
            continue
        folder = folder_of(rel)
        want_lang = FOLDER_LANG[folder]
        counts["pages"] += 1

        # 1) html lang
        m = HTMLLANG_RE.search(src)
        if not m:
            problems.append(f"{rel}: <html lang> 없음")
        elif m.group(1) != want_lang:
            problems.append(f"{rel}: <html lang=\"{m.group(1)}\"> ≠ {want_lang}")

        # 2) canonical
        canon = CANON_RE.search(src)
        expect_url = page_url(rel)
        if not canon:
            if not rel.endswith("404.html"):
                problems.append(f"{rel}: canonical 없음")
        elif canon.group(1) != expect_url:
            problems.append(f"{rel}: canonical {canon.group(1)} ≠ {expect_url}")

        # 3) og:url
        ogu = OGURL_RE.search(src)
        if canon:
            if not ogu:
                problems.append(f"{rel}: og:url 없음")
            elif ogu.group(1) != canon.group(1):
                problems.append(f"{rel}: og:url {ogu.group(1)} ≠ canonical {canon.group(1)}")

        # 4) hreflang
        lang_code, aid = article_id_of(rel)
        if aid:
            a = articles.get(aid)
            if not a:
                problems.append(f"{rel}: articles.json 에 없는 기사")
                expected = set()
            else:
                expected = set(article_locales(a))
        else:
            expected = set(ALL_LANGS)
        found = {}
        for hl, href in HREFLANG_RE.findall(src):
            found.setdefault(hl, []).append(href)
        if "x-default" not in found:
            problems.append(f"{rel}: hreflang x-default 없음")
        got_langs = {hl for hl in found if hl != "x-default"}
        want_html = {HTML_LANG[l] for l in expected}
        if got_langs != want_html:
            problems.append(f"{rel}: hreflang {sorted(got_langs)} ≠ 기대 {sorted(want_html)}")
        for hl, hrefs in found.items():
            for href in hrefs:
                if not href.startswith(BASE + "/"):
                    problems.append(f"{rel}: hreflang {hl} 주소가 절대 주소가 아님 ({href})")
                    continue
                target = href[len(BASE) + 1:]
                if target.endswith("/"):
                    target += "index.html"
                if target and not os.path.exists(os.path.join(ROOT, target)):
                    problems.append(f"{rel}: hreflang {hl} 대상 파일 없음 ({target})")
        for hl, hrefs in found.items():
            if len(hrefs) > 1:
                problems.append(f"{rel}: hreflang {hl} 이 {len(hrefs)}번 나옴")

        # 5) title / description
        t = TITLE_RE.search(src)
        if not t or not t.group(1).strip():
            problems.append(f"{rel}: title 없음")
        d = DESC_RE.search(src)
        if not d or len(d.group(1).strip()) < 20:
            problems.append(f"{rel}: description 없거나 짧음")

        # 6) 구조화 데이터
        if aid:
            if '"@type":"NewsArticle"' not in src:
                problems.append(f"{rel}: NewsArticle 구조화 데이터 없음")
            else:
                ld = json.loads(re.search(r'<script type="application/ld\+json">(.*?)</script>', src, re.S).group(1))
                items = ld if isinstance(ld, list) else [ld]
                art = next((x for x in items if x.get("@type") == "NewsArticle"), None)
                if art:
                    want = expected_lang_for(rel, folder)
                    if art.get("inLanguage") != want:
                        problems.append(f"{rel}: NewsArticle inLanguage {art.get('inLanguage')} ≠ {want}")
                    if art.get("url") != expect_url:
                        problems.append(f"{rel}: NewsArticle url {art.get('url')} ≠ {expect_url}")
        if rel in ("index.html", "en/index.html", "zh/index.html", "ja/index.html"):
            if '"@type":"WebSite"' not in src:
                problems.append(f"{rel}: WebSite 구조화 데이터 없음")

    # 7) 언어별 기사 페이지 수
    for lang in ALL_LANGS:
        expect = {a["id"] for a in articles.values() if lang in article_locales(a)}
        folder = "" if lang == "ko" else lang
        d = os.path.join(ROOT, folder, "a")
        have = {n[:-5] for n in os.listdir(d) if n.endswith(".html")} if os.path.isdir(d) else set()
        if have - expect:
            problems.append(f"{folder or '.'}/a/: 발행 범위 밖 기사 페이지 {sorted(have - expect)[:5]}")
        if expect - have:
            problems.append(f"{folder or '.'}/a/: 빠진 기사 페이지 {sorted(expect - have)[:5]}")
        counts[f"articles_{lang}"] = len(have)

    # 8) sitemap
    sm = os.path.join(ROOT, "sitemap.xml")
    if not os.path.exists(sm):
        problems.append("sitemap.xml 없음")
    else:
        ns = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9", "xhtml": "http://www.w3.org/1999/xhtml"}
        try:
            tree = ET.parse(sm)
        except ET.ParseError as e:
            problems.append(f"sitemap.xml 파싱 실패: {e}")
            tree = None
        if tree is not None:
            locs = {}
            for u in tree.getroot().findall("sm:url", ns):
                loc = (u.findtext("sm:loc", default="", namespaces=ns) or "").strip()
                alts = {}
                for l in u.findall("xhtml:link", ns):
                    alts.setdefault(l.get("hreflang"), []).append(l.get("href"))
                locs[loc] = alts
                if "x-default" not in alts:
                    problems.append(f"sitemap: {loc} 에 x-default 없음")
                for hl, hrefs in alts.items():
                    if len(hrefs) != 1:
                        problems.append(f"sitemap: {loc} 의 {hl} 이 {len(hrefs)}개")
            for aid_, a in articles.items():
                for lang in article_locales(a):
                    folder = "" if lang == "ko" else lang
                    path = f"a/{aid_}.html"
                    loc = f"{BASE}/{folder}/{path}" if folder else f"{BASE}/{path}"
                    if loc not in locs:
                        problems.append(f"sitemap: 발행 언어 URL 누락 {loc}")
            # 없는 파일을 가리키는 항목
            for loc in locs:
                if not loc.startswith(BASE + "/"):
                    continue
                target = loc[len(BASE) + 1:].split("?")[0]
                if target.endswith("/"):
                    target += "index.html"
                if target and not os.path.exists(os.path.join(ROOT, urllib.parse.unquote(target))):
                    problems.append(f"sitemap: 파일 없는 URL {loc}")
            counts["sitemap_urls"] = len(locs)

    # 9) 언어별 feed
    for lang in ALL_LANGS:
        folder = "" if lang == "ko" else lang
        p = os.path.join(ROOT, folder, "feed.xml")
        if not os.path.exists(p):
            problems.append(f"{folder or '.'}/feed.xml 없음")
            continue
        with open(p, encoding="utf-8") as f:
            feed = f.read()
        m = re.search(r"<language>([^<]*)</language>", feed)
        if m and m.group(1) != HTML_LANG[lang]:
            problems.append(f"{folder or '.'}/feed.xml: <language>{m.group(1)}</language> ≠ {HTML_LANG[lang]}")
        n_items = feed.count("<item>")
        counts[f"feed_{lang}"] = n_items
        if n_items == 0:
            problems.append(f"{folder or '.'}/feed.xml: 항목 0개")

    notes: list[str] = []
    check_intl_covers(problems, notes)

    if not quiet:
        print("페이지", counts["pages"], "· 사이트맵 URL", counts.get("sitemap_urls", 0),
              "· 기사 ko/en/zh/ja", counts["articles_ko"], counts["articles_en"],
              counts["articles_zh"], counts["articles_ja"])
        print("피드 항목 ko/en/zh/ja", counts["feed_ko"], counts["feed_en"], counts["feed_zh"], counts["feed_ja"])
    for n in notes[:20]:
        print("· (확인)", n)
    for p in problems:
        print("·", p)
    print(f"다국어 SEO 점검: 문제 {len(problems)}건")
    return 1 if problems else 0


def expected_lang_for(rel, folder):
    """그 페이지 자신의 언어 폴더 기준 HTML lang 값."""
    return FOLDER_LANG[folder]


if __name__ == "__main__":
    ap = argparse.ArgumentParser(description="다국어 SEO 전수 점검")
    ap.add_argument("--quiet", action="store_true")
    args = ap.parse_args()
    sys.exit(audit(quiet=args.quiet))
