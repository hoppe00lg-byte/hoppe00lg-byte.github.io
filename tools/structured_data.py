#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""검색엔진용 구조화 데이터(JSON-LD)를 만듭니다.

  · 기사 페이지(a/{id}.html · /en/a/ …) → NewsArticle
  · 첫 페이지(index.html · /en/ · /zh/ · /ja/) → WebSite (+ publisher Organization)

구글 뉴스·리치 결과, 빙·네이버·다음·바이두가 제목·발행시각·언어·섹션을
기사 단위로 정확히 읽게 하는 부분입니다. 값은 data/articles.json·site.json 의
공개 정보만 쓰고 추정하지 않습니다.

  python3 tools/structured_data.py --check   # 사이트의 기사 페이지에 LD 가 있는지 점검
"""
import argparse
import json
import os
import re
import sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
sys.path.insert(0, os.path.join(ROOT, "tools"))
from i18n_core import ALL_LANGS, KO, LANGS  # noqa: E402

BASE = "https://insightbriefnews.com"
MARK_START = "<!-- IB:JSONLD -->"
MARK_END = "<!-- /IB:JSONLD -->"
BLOCK_RE = re.compile(re.escape(MARK_START) + r".*?" + re.escape(MARK_END) + r"[ \t]*\n?", re.S)


def lang_meta(lang):
    return KO if lang == "ko" else LANGS[lang]


def absolute(url):
    url = str(url or "").strip()
    if not url:
        return ""
    if re.match(r"^[a-z]+://", url, re.I):
        return url
    return BASE + "/" + url.lstrip("/")


def article_url(a, lang):
    path = f"a/{a['id']}.html"
    return f"{BASE}/{path}" if lang == "ko" else f"{BASE}/{lang}/{path}"


def article_ld(site, a, lang):
    """기사 하나의 NewsArticle 구조화 데이터."""
    brand = site.get("brand") or {}
    name = brand.get("name") or "INSIGHT BRIEF"
    url = article_url(a, lang)
    meta = lang_meta(lang)
    cat = next((c for c in site.get("categories", []) if c["id"] == a.get("category")), {})
    author = (a.get("author") or "").strip()
    # 편집실·편집국 명의는 사람이 아니라 조직으로 적습니다.
    author_node = {
        "@type": "Organization" if ("편집" in author or "Desk" in author or "desk" in author or not author) else "Person",
        "name": author or name,
    }
    image = absolute(a.get("coverImage")) or f"{BASE}/assets/img/og.png"
    ld = {
        "@context": "https://schema.org",
        "@type": "NewsArticle",
        "mainEntityOfPage": {"@type": "WebPage", "@id": url},
        "url": url,
        "headline": a.get("title") or "",
        "description": a.get("deck") or "",
        "image": [image],
        "datePublished": a.get("publishedAt") or "",
        "dateModified": a.get("updatedAt") or a.get("publishedAt") or "",
        "inLanguage": meta["htmlLang"],
        "author": author_node,
        "publisher": {
            "@type": "Organization",
            "name": name,
            "url": f"{BASE}/",
            "logo": {"@type": "ImageObject", "url": f"{BASE}/assets/img/og.png", "width": 1200, "height": 630},
        },
        "articleSection": cat.get("label") or a.get("category") or "",
        "keywords": ", ".join(a.get("tags") or []),
        "isAccessibleForFree": True,
    }
    summary = a.get("summary") or []
    if summary:
        ld["abstract"] = " ".join(summary)
    return ld


def website_ld(site, lang):
    """첫 페이지의 WebSite 구조화 데이터(사이트 이름·언어·발행처)."""
    brand = site.get("brand") or {}
    name = brand.get("name") or "INSIGHT BRIEF"
    home = f"{BASE}/" if lang == "ko" else f"{BASE}/{lang}/index.html"
    node = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "@id": f"{BASE}/#website-{lang}",
        "url": home,
        "name": name,
        "inLanguage": lang_meta(lang)["htmlLang"],
        "publisher": {
            "@type": "Organization",
            "@id": f"{BASE}/#organization",
            "name": name,
            "url": f"{BASE}/",
            "logo": {"@type": "ImageObject", "url": f"{BASE}/assets/img/og.png", "width": 1200, "height": 630},
        },
    }
    alt = brand.get("nameKo") or brand.get("name")
    if alt and alt != name:
        node["alternateName"] = alt
    return node


def script_tag(obj):
    payload = json.dumps(obj, ensure_ascii=False, separators=(",", ":"))
    # 본문에 </script> 가 들어가도 마크업이 끊기지 않게 합니다.
    payload = payload.replace("</", "<\\/")
    return f'<script type="application/ld+json">{payload}</script>\n'


def inject(src, *objs):
    """구조화 데이터 블록을 <head> 끝에 넣습니다(여러 번 실행해도 한 번만)."""
    src = BLOCK_RE.sub("", src)
    tags = "".join(script_tag(o) for o in objs if o)
    if not tags or "</head>" not in src:
        return src
    block = f"{MARK_START}\n{tags}{MARK_END}"
    return src.replace("</head>", block + "\n</head>", 1)


def check():
    """기사 페이지에 NewsArticle 이, 첫 페이지에 WebSite 가 있는지 확인합니다."""
    problems = []
    missing = 0
    for dirpath, dirnames, filenames in os.walk(ROOT):
        rel_dir = os.path.relpath(dirpath, ROOT)
        dirnames[:] = [d for d in dirnames if d not in (".git", "assets", "data", "tools", "screenshots", "supabase")]
        for name in filenames:
            if not name.endswith(".html") or re.match(r"^(google|naver)[0-9a-z]+\.html$", name):
                continue
            rel = name if rel_dir == "." else os.path.join(rel_dir, name)
            try:
                with open(os.path.join(ROOT, rel), encoding="utf-8") as f:
                    src = f.read()
            except OSError:
                continue
            is_article = "/a/" in rel.replace(os.sep, "/")
            if is_article and '"@type":"NewsArticle"' not in src:
                problems.append(f"{rel}: NewsArticle 없음")
                missing += 1
            if rel.replace(os.sep, "/") in ("index.html", "en/index.html", "zh/index.html", "ja/index.html") \
                    and '"@type":"WebSite"' not in src:
                problems.append(f"{rel}: WebSite 없음")
                missing += 1
    for p in problems:
        print("·", p)
    print(f"구조화 데이터 점검: 문제 {missing}건")
    return 1 if missing else 0


if __name__ == "__main__":
    ap = argparse.ArgumentParser(description="구조화 데이터(JSON-LD) 점검")
    ap.add_argument("--check", action="store_true")
    args = ap.parse_args()
    if args.check:
        sys.exit(check())
    ap.print_help()
