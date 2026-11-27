#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
INSIGHT BRIEF static build helper.

  python3 tools/build.py            # 검증 + 파생 파일 생성 + 다국어(en·zh·ja) 갱신
  python3 tools/build.py --check    # 검증만
  python3 tools/build.py --no-i18n  # 한국어만 빌드(다국어 건너뛰기)

articles.json / site.json / market.json 을 고친 뒤 실행하면
  data/articles.fallback.js   (file:// 로 열어도 화면이 보이게 하는 사본)
  data/site.fallback.js
  data/market.fallback.js
  a/{id}.html                 (기사별 전용 페이지 — SNS 공유 카드용 기사별 og 메타)
  feed.xml  /  sitemap.xml  /  robots.txt
  assets/img/og.png
가 다시 만들어집니다. 웹에 올린 뒤에는 fallback 없이도 JSON을 직접 읽습니다.

기사 공유 주소는 https://insightbriefnews.com/a/{id}.html 입니다.
예전 article.html?id={id} 주소도 그대로 열립니다(삭제하지 않음).
"""
import json, os, sys, html, datetime, re

ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
DATA = os.path.join(ROOT, "data")

# 언어별 발행 범위 — 기사마다 locales(발행 언어)·lang(처음 쓴 언어)를 읽습니다.
sys.path.insert(0, os.path.join(ROOT, "tools"))
from i18n_core import ALL_LANGS, article_locales, article_source_lang  # noqa: E402

REQUIRED_SITE = ["brand", "categories", "ticker", "footer"]
REQUIRED_ARTICLE = ["id", "category", "title", "deck", "author", "publishedAt", "body"]
REQUIRED_MARKET = ["updatedAt", "oilFx", "commodities"]
MARKET_GROUPS = ("metal", "petrochem", "shipping", "agri", "chinafutures", "koreamacro")
MARKET_ITEM_FIELDS = ["name", "code", "price", "unit", "date", "sourceName", "sourceUrl"]

errors, warnings = [], []


def load(name):
    path = os.path.join(DATA, name)
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def validate(site, articles):
    for k in REQUIRED_SITE:
        if k not in site:
            errors.append(f"site.json: '{k}' 항목이 없습니다.")
    brand = site.get("brand", {})
    for k in ["name", "nameKo", "tagline", "email"]:
        if not brand.get(k):
            errors.append(f"site.json: brand.{k} 값이 비어 있습니다.")
    cat_ids = [c.get("id") for c in site.get("categories", [])]
    if len(cat_ids) != len(set(cat_ids)):
        errors.append("site.json: 카테고리 id가 중복됩니다.")

    seen = set()
    for i, a in enumerate(articles):
        label = a.get("id") or f"#{i}"
        for k in REQUIRED_ARTICLE:
            if not a.get(k):
                errors.append(f"articles.json[{label}]: '{k}' 값이 비어 있습니다.")
        if a.get("id") in seen:
            errors.append(f"articles.json: id '{a.get('id')}' 가 중복됩니다.")
        seen.add(a.get("id"))
        if a.get("category") not in cat_ids:
            errors.append(f"articles.json[{label}]: 알 수 없는 카테고리 '{a.get('category')}'")
        try:
            datetime.datetime.fromisoformat(a.get("publishedAt", ""))
        except Exception:
            errors.append(f"articles.json[{label}]: publishedAt 형식이 올바르지 않습니다 (예: 2026-11-20T07:30:00+09:00)")
        if not isinstance(a.get("summary"), list) or not a.get("summary"):
            warnings.append(f"articles.json[{label}]: summary(핵심 요약)가 없습니다.")
        if not a.get("tags"):
            warnings.append(f"articles.json[{label}]: tags가 없습니다.")
        # 언어별 발행 범위 — 잘못 적으면 그 언어 목록·사이트맵에서 조용히 빠지므로 여기서 잡습니다.
        src_lang = (a.get("lang") or "ko")
        if src_lang not in ALL_LANGS:
            errors.append(f"articles.json[{label}]: lang 은 " + ", ".join(ALL_LANGS) + " 중 하나여야 합니다(지금 '{src_lang}').")
        declared = a.get("locales")
        if declared is not None:
            if not isinstance(declared, list) or not declared:
                errors.append(f"articles.json[{label}]: locales 는 비어 있지 않은 목록이어야 합니다.")
            else:
                bad = [l for l in declared if l not in ALL_LANGS]
                if bad:
                    errors.append(f"articles.json[{label}]: 알 수 없는 언어 {bad} (사용 가능: " + ", ".join(ALL_LANGS) + ")")
                if src_lang != "ko" and any(l != src_lang for l in declared):
                    warnings.append(
                        f"articles.json[{label}]: {src_lang} 로 직접 쓴 기사를 {', '.join(l for l in declared if l != src_lang)} 에도 "
                        "같은 본문 그대로 싣습니다(자동 번역하지 않음). 그 언어 독자용으로 옮겨 쓸 문장은 본문을 따로 준비하세요."
                    )
        if len(a.get("body", "")) < 400:
            warnings.append(f"articles.json[{label}]: 본문이 짧습니다 ({len(a.get('body',''))}자).")

    feat = [a["id"] for a in articles if a.get("featured")]
    if len(feat) > 1:
        warnings.append("featured 기사가 2편 이상입니다. 첫 번째만 톱 스토리로 씁니다: " + ", ".join(feat))
    if not feat:
        warnings.append("featured 기사가 없습니다. 가장 최근 기사가 톱 스토리가 됩니다.")


def validate_market(market):
    """market.json 은 공개 시세만 담습니다.
    값이 없으면 추정하지 않고 항목을 비우거나 '미확인'으로 적어야 하므로,
    출처·기준일이 빠진 항목은 오류로 처리합니다."""
    for k in REQUIRED_MARKET:
        if k not in market:
            errors.append(f"market.json: '{k}' 항목이 없습니다.")
    try:
        datetime.datetime.fromisoformat(market.get("updatedAt", ""))
    except Exception:
        errors.append("market.json: updatedAt 형식이 올바르지 않습니다 (예: 2026-11-22T06:50:00+09:00)")

    for group_key in ["oilFx", "commodities"]:
        rows = market.get(group_key)
        if not isinstance(rows, list) or not rows:
            errors.append(f"market.json: '{group_key}' 가 비어 있습니다.")
            continue
        seen = set()
        for i, row in enumerate(rows):
            label = row.get("code") or f"{group_key}#{i}"
            for k in MARKET_ITEM_FIELDS:
                if row.get(k) in (None, ""):
                    errors.append(f"market.json[{label}]: '{k}' 값이 비어 있습니다.")
            code = row.get("code")
            if code in seen:
                errors.append(f"market.json: code '{code}' 가 중복됩니다.")
            seen.add(code)
            if not isinstance(row.get("price"), (int, float)):
                errors.append(f"market.json[{label}]: price 가 숫자가 아닙니다.")
            try:
                datetime.date.fromisoformat(row.get("date", ""))
            except Exception:
                errors.append(f"market.json[{label}]: date 는 YYYY-MM-DD 형식이어야 합니다.")
            url = row.get("sourceUrl") or ""
            if not url.startswith("http"):
                errors.append(f"market.json[{label}]: sourceUrl 이 http(s) 주소가 아닙니다.")
            pct = row.get("changePct")
            if pct is None:
                warnings.append(f"market.json[{label}]: changePct 가 없어 등락 없이 표시됩니다.")
            elif abs(pct) >= 15:
                warnings.append(f"market.json[{label}]: 일간 등락 {pct}% 는 이례적입니다. 기준일·단위를 확인하세요.")
            if row.get("date") and row.get("date") > market.get("asOf", ""):
                warnings.append(f"market.json[{label}]: 기준일({row['date']})이 asOf({market.get('asOf')})보다 최신입니다.")

    for row in market.get("commodities", []):
        if row.get("group") not in MARKET_GROUPS:
            warnings.append(
                f"market.json[{row.get('code')}]: group 은 " + ", ".join(MARKET_GROUPS) + " 중 하나여야 합니다."
            )

    validate_periods(market)
    validate_history()


def validate_periods(market):
    """주간·월간·연간 요약은 실측 공개값만 담습니다.
    기간 표의 각 행도 출처·기준일과 두 기준값(있을 때)을 검사합니다."""
    periods = market.get("periods")
    if periods is None:
        warnings.append("market.json: periods 가 없어 기간 탭이 보이지 않습니다.")
        return
    if not isinstance(periods, dict):
        errors.append("market.json: periods 는 객체여야 합니다.")
        return

    tabs = periods.get("tabs")
    ids = []
    if isinstance(tabs, list) and tabs:
        for t in tabs:
            tid = (t or {}).get("id")
            if tid not in ("daily", "weekly", "monthly", "yearly", "recycled"):
                errors.append(f"market.json periods.tabs: 알 수 없는 탭 id '{tid}'")
            if tid in ids:
                errors.append(f"market.json periods.tabs: 탭 id '{tid}' 가 중복됩니다.")
            ids.append(tid)
        if ids and ids[0] != "daily":
            warnings.append("market.json periods.tabs: 첫 탭은 daily 여야 기본 화면이 맞습니다.")
    else:
        warnings.append("market.json: periods.tabs 가 없어 기간 탭이 보이지 않습니다.")

    for pid in ["weekly", "monthly", "yearly", "recycled"]:
        p = periods.get(pid)
        if not isinstance(p, dict):
            warnings.append(f"market.json periods: '{pid}' 뷰가 없습니다.")
            continue
        groups = p.get("groups")
        if not isinstance(groups, list) or not groups:
            errors.append(f"market.json periods.{pid}: groups 가 비어 있습니다.")
            continue
        count = 0
        for gi, g in enumerate(groups):
            label = f"periods.{pid}.groups[{gi}]"
            for k in ["label", "prevHeader", "nowHeader"]:
                if not (g or {}).get(k):
                    warnings.append(f"market.json {label}: '{k}' 가 없어 표 머리글이 비어 보입니다.")
            rows = (g or {}).get("rows")
            if not isinstance(rows, list) or not rows:
                errors.append(f"market.json {label}: rows 가 비어 있습니다.")
                continue
            for ri, r in enumerate(rows):
                count += 1
                rl = f"{label}.rows[{ri}]"
                code = (r or {}).get("code", "?")
                for k in ["code", "name", "price", "unit", "date", "sourceName", "sourceUrl"]:
                    if (r or {}).get(k) in (None, ""):
                        errors.append(f"market.json[{code}] {pid}: '{k}' 값이 비어 있습니다.")
                if not isinstance((r or {}).get("price"), (int, float)):
                    errors.append(f"market.json[{code}] {pid}: price 가 숫자가 아닙니다.")
                if (r or {}).get("prev") is not None and not isinstance(r.get("prev"), (int, float)):
                    errors.append(f"market.json[{code}] {pid}: prev 가 숫자가 아닙니다.")
                if (r or {}).get("changePct") is None:
                    warnings.append(f"market.json[{code}] {pid}: changePct 가 없어 등락 없이 표시됩니다.")
                try:
                    datetime.date.fromisoformat((r or {}).get("date", ""))
                except Exception:
                    errors.append(f"market.json[{code}] {pid}: date 는 YYYY-MM-DD 형식이어야 합니다.")
                if not str((r or {}).get("sourceUrl", "")).startswith("http"):
                    errors.append(f"market.json[{code}] {pid}: sourceUrl 이 http(s) 주소가 아닙니다.")
                if (r or {}).get("prev") is None and not r.get("prevNote"):
                    warnings.append(f"market.json[{code}] {pid}: 이전 기준값(prev)이 없어 이전 기간 열이 '—' 로 보입니다.")
        if count < 3:
            warnings.append(f"market.json periods.{pid}: 행이 {count}개뿐입니다.")


HISTORY = {"data": None}

# 상단 내비게이션은 5개 대표 메뉴로 각 페이지 HTML 에 직접 적혀 있습니다.
# 메뉴 정의는 tools/nav_spec.py 한 곳에 있고, tools/apply_nav.py · tools/i18n_pages.py ·
# tools/build_tax_pages.py 가 그 정의를 그대로 씁니다. 여기서는 페이지마다 메뉴가
# 빠지지 않았는지만 확인합니다.
NAV_REQUIRED = ("index.html", "market.html", "salary.html", "tax.html", "biz.html",
                "forms.html", "law.html", "seller.html", "lotto.html", "saju.html", "music.html", "creator.html", "style.html", "freight.html",
                "sourcing.html", "mfg-cost.html", "resell.html", "review-reply.html", "sitemap.html", "about.html", "ad.html", "contact.html")


def validate_nav():
    missing = []
    for name in sorted(os.listdir(ROOT)):
        if not name.endswith(".html") or name.startswith("."):
            continue
        path = os.path.join(ROOT, name)
        try:
            with open(path, encoding="utf-8") as f:
                body = f.read()
        except OSError:
            continue
        if 'id="site-nav"' not in body:
            continue
        for target in NAV_REQUIRED:
            # global.html#portal 처럼 해시로 들어가는 링크도 그 페이지 링크로 봅니다.
            if f'href="{target}"' not in body and f'href="{target}#' not in body:
                missing.append(f"{name}: 내비에 {target} 링크가 없습니다.")
    spec_path = os.path.join(ROOT, "tools", "nav_spec.py")
    try:
        with open(spec_path, encoding="utf-8") as f:
            spec = f.read()
        for target in NAV_REQUIRED:
            if f'"{target}"' not in spec and f'"{target}#' not in spec:
                missing.append(f"tools/nav_spec.py: 내비에 {target} 링크가 없습니다.")
    except OSError:
        missing.append("tools/nav_spec.py 를 읽지 못했습니다.")
    warnings.extend(missing)
    return missing



def validate_history(path_name="market-history.json"):
    """일별 스냅샷 파일은 날짜별로 한 건씩 쌓입니다. 없으면 알리기만 합니다."""
    path = os.path.join(DATA, path_name)
    if not os.path.exists(path):
        warnings.append("market-history.json 이 없습니다. 일별 스냅샷이 쌓이지 않습니다.")
        return None
    try:
        with open(path, encoding="utf-8") as f:
            hist = json.load(f)
    except json.JSONDecodeError as e:
        errors.append(f"market-history.json: JSON 형식 오류 ({e})")
        return None
    snaps = hist.get("snapshots")
    if not isinstance(snaps, list) or not snaps:
        errors.append("market-history.json: snapshots 가 비어 있습니다.")
        return None
    seen = set()
    for i, s in enumerate(snaps):
        d = (s or {}).get("date")
        try:
            datetime.date.fromisoformat(d or "")
        except Exception:
            errors.append(f"market-history.json snapshots[{i}]: date 는 YYYY-MM-DD 형식이어야 합니다.")
        if d in seen:
            errors.append(f"market-history.json: date '{d}' 스냅샷이 중복됩니다.")
        seen.add(d)
        if not isinstance((s or {}).get("values"), dict) or not s.get("values"):
            errors.append(f"market-history.json snapshots[{d or i}]: values 가 비어 있습니다.")
    HISTORY["data"] = hist
    return hist


def validate_series(path_name="market-series.json", market=None):
    """품목별 그래프용 실제 일별 종가 파일.
    값이 비어 있거나 날짜가 뒤섞인 행은 오류로 잡습니다(가짜 곡선 방지)."""
    path = os.path.join(DATA, path_name)
    if not os.path.exists(path):
        warnings.append("market-series.json 이 없습니다. 품목별 그래프가 실측 기준점만으로 그려집니다.")
        return None
    try:
        with open(path, encoding="utf-8") as f:
            doc = json.load(f)
    except json.JSONDecodeError as e:
        errors.append(f"market-series.json: JSON 형식 오류 ({e})")
        return None
    series = doc.get("series")
    if not isinstance(series, dict) or not series:
        errors.append("market-series.json: series 가 비어 있습니다.")
        return None
    codes = set()
    if market:
        codes = {r.get("code") for r in (market.get("oilFx") or []) + (market.get("commodities") or [])}
    for code, s in series.items():
        s = s or {}
        for k in ["unit", "sourceName", "sourceUrl", "points"]:
            if not s.get(k):
                errors.append(f"market-series.json[{code}]: '{k}' 값이 비어 있습니다.")
        if not str(s.get("sourceUrl", "")).startswith("http"):
            errors.append(f"market-series.json[{code}]: sourceUrl 이 http(s) 주소가 아닙니다.")
        pts = s.get("points") or []
        if len(pts) < 2:
            errors.append(f"market-series.json[{code}]: 점이 {len(pts)}개뿐입니다.")
            continue
        prev = ""
        for i, p in enumerate(pts):
            if not isinstance(p, list) or len(p) != 2:
                errors.append(f"market-series.json[{code}]: points[{i}] 형식이 [날짜, 값] 이 아닙니다.")
                continue
            d, v = p[0], p[1]
            try:
                datetime.date.fromisoformat(str(d))
            except Exception:
                errors.append(f"market-series.json[{code}]: points[{i}] 날짜 형식 오류({d}).")
                continue
            if not isinstance(v, (int, float)) or v != v:
                errors.append(f"market-series.json[{code}]: points[{i}] 값이 숫자가 아닙니다.")
            if d <= prev:
                errors.append(f"market-series.json[{code}]: points[{i}] 날짜가 오름차순이 아닙니다({prev} → {d}).")
            prev = d
        if codes and code not in codes:
            warnings.append(f"market-series.json[{code}]: 시황표(market.json)에 없는 코드입니다.")
    doc["_codes"] = len(codes)
    return doc


def write_market_series_fallback(doc):
    with open(os.path.join(DATA, "market-series.fallback.js"), "w", encoding="utf-8") as f:
        f.write("/* 자동 생성 파일입니다. 직접 수정하지 말고 data/market-series.json 을 고친 뒤 tools/build.py 를 실행하세요. */\n")
        f.write("window.__FALLBACK_SERIES__ = ")
        json.dump(doc, f, ensure_ascii=False, separators=(",", ":"))
        f.write(";\n")


def write_market_fallback(market):
    with open(os.path.join(DATA, "market.fallback.js"), "w", encoding="utf-8") as f:
        f.write("/* 자동 생성 파일입니다. 직접 수정하지 말고 data/market.json 을 고친 뒤 tools/build.py 를 실행하세요. */\n")
        f.write("window.__FALLBACK_MARKET__ = ")
        json.dump(market, f, ensure_ascii=False, indent=1)
        f.write(";\n")


def validate_glossary(g):
    """market-glossary.json 은 '용어·제품 상식' 탭의 원본입니다.
    항목마다 분류·요약·출처가 있어야 화면이 비지 않습니다."""
    cats = [c.get("id") for c in g.get("categories") or []]
    if not cats:
        errors.append("market-glossary.json: categories 가 비어 있습니다.")
    seen = set()
    for i, e in enumerate(g.get("entries") or []):
        label = e.get("id") or f"#{i}"
        for k in ["id", "term", "ko", "cat", "summary"]:
            if not e.get(k):
                errors.append(f"market-glossary.json[{label}]: '{k}' 값이 비어 있습니다.")
        if e.get("id") in seen:
            errors.append(f"market-glossary.json: id '{e.get('id')}' 가 중복됩니다.")
        seen.add(e.get("id"))
        if e.get("cat") not in cats:
            errors.append(f"market-glossary.json[{label}]: 알 수 없는 분류 '{e.get('cat')}'")
        if not (e.get("sources") or []):
            warnings.append(f"market-glossary.json[{label}]: 출처가 없습니다.")
        for s in e.get("sources") or []:
            if not str(s.get("url", "")).startswith("http"):
                errors.append(f"market-glossary.json[{label}]: 출처 url 이 http(s) 주소가 아닙니다.")
        o = e.get("origin") or {}
        if o and not str(o.get("url", "")).startswith("http"):
            errors.append(f"market-glossary.json[{label}]: origin.url 이 http(s) 주소가 아닙니다.")


def write_glossary_fallback(g):
    with open(os.path.join(DATA, "market-glossary.fallback.js"), "w", encoding="utf-8") as f:
        f.write("/* 자동 생성 파일입니다. 직접 수정하지 말고 data/market-glossary.json 을 고친 뒤 tools/build.py 를 실행하세요. */\n")
        f.write("window.__FALLBACK_GLOSSARY__ = ")
        json.dump(g, f, ensure_ascii=False, indent=1)
        f.write(";\n")


def write_fallbacks(site, articles):
    # 화면용 사본도 한국어판에는 한국어로 발행되는 기사만 넣습니다.
    ko_articles = [a for a in articles if "ko" in article_locales(a)]
    with open(os.path.join(DATA, "articles.fallback.js"), "w", encoding="utf-8") as f:
        f.write("/* 자동 생성 파일입니다. 직접 수정하지 말고 data/articles.json 을 고친 뒤 tools/build.py 를 실행하세요. */\n")
        f.write("window.__ARTICLES__ = ")
        json.dump(ko_articles, f, ensure_ascii=False, indent=1)
        f.write(";\n")
    with open(os.path.join(DATA, "site.fallback.js"), "w", encoding="utf-8") as f:
        f.write("/* 자동 생성 파일입니다. data/site.json 을 고친 뒤 tools/build.py 를 실행하세요. */\n")
        f.write("window.__SITE__ = ")
        json.dump(site, f, ensure_ascii=False, indent=1)
        f.write(";\n")


def rfc822(iso):
    d = datetime.datetime.fromisoformat(iso)
    if d.tzinfo is None:
        d = d.replace(tzinfo=datetime.timezone(datetime.timedelta(hours=9)))
    return d.strftime("%a, %d %b %Y %H:%M:%S %z")


def write_feed(site, articles):
    base = (site.get("baseUrl") or "").rstrip("/")
    b = site["brand"]
    # 한국어 피드에는 한국어로 발행되는 기사만 싣습니다(다른 언어 전용 기사 제외).
    ko_articles = [a for a in articles if "ko" in article_locales(a)]
    items = []
    for a in sorted(ko_articles, key=lambda x: x["publishedAt"], reverse=True)[:20]:
        link = f"{base}/a/{a['id']}.html"
        items.append(f"""    <item>
      <title>{html.escape(a['title'])}</title>
      <link>{html.escape(link)}</link>
      <guid isPermaLink="true">{html.escape(link)}</guid>
      <pubDate>{rfc822(a['publishedAt'])}</pubDate>
      <category>{html.escape(next((c['label'] for c in site['categories'] if c['id'] == a['category']), a['category']))}</category>
      <description>{html.escape(a['deck'])}</description>
    </item>""")
    now = datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=9))).strftime("%a, %d %b %Y %H:%M:%S %z")
    xml = f"""<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>{html.escape(b['name'])} — {html.escape(b['tagline'])}</title>
    <link>{html.escape(base)}/</link>
    <atom:link href="{html.escape(base)}/feed.xml" rel="self" type="application/rss+xml"/>
    <description>{html.escape(b['description'])}</description>
    <language>ko</language>
    <lastBuildDate>{now}</lastBuildDate>
{chr(10).join(items)}
  </channel>
</rss>
"""
    with open(os.path.join(ROOT, "feed.xml"), "w", encoding="utf-8") as f:
        f.write(xml)


# 다국어 사이트맵: 같은 페이지의 네 언어 주소를 hreflang 으로 묶습니다.
SITEMAP_LANGS = [("", "ko"), ("en", "en"), ("zh", "zh-Hans"), ("ja", "ja")]
LANG_FOLDER = {"ko": "", "en": "en", "zh": "zh", "ja": "ja"}
HREFLANG = {"ko": "ko", "en": "en", "zh": "zh-Hans", "ja": "ja"}


# 검색엔진·소셜 미리보기 봇을 모두 명시적으로 허용합니다.
# IndexNow 로 알린 URL 을 Bing·Yahoo·DuckDuckGo·Naver 가 바로 크롤링할 수 있어야 하고,
# 바이두(Baiduspider)·네이버(Yeti)는 robots.txt 에 자기 이름이 있을 때 수집을 확실히 시작합니다.
ROBOTS_AGENTS = (
    # 주요 검색엔진
    "Googlebot", "Googlebot-News", "Googlebot-Image", "Googlebot-Video",
    "Bingbot", "msnbot",
    "Baiduspider", "Baiduspider-image", "Baiduspider-video",
    "Sogou web spider", "Sogou inst spider", "360Spider", "YisouSpider", "PetalBot",
    "Yeti", "Daumoa",
    "YandexBot", "SeznamBot",
    "DuckDuckBot", "DuckDuckGo-Favicons-Bot",
    "Applebot", "Slurp",
    # 소셜·메신저 미리보기 (LINE·위챗·카카오톡 카드 썸네일 수집)
    "facebookexternalhit", "Twitterbot", "LinkedInBot", "KakaoTalk-Scrap", "Line",
)


def robots_txt(base):
    """robots.txt 본문. 모든 경로 허용 + 사이트맵 명시."""
    lines = [
        "# INSIGHT BRIEF — https://insightbriefnews.com",
        "# 한국어(/) · English(/en/) · 中文(/zh/) · 日本語(/ja/) 전 경로를 모든 크롤러에 허용합니다.",
        "",
        "User-agent: *",
        "Allow: /",
        "",
        "# 검색엔진·메신저 미리보기 봇 명시",
    ]
    for agent in ROBOTS_AGENTS:
        lines += [f"User-agent: {agent}", "Allow: /", ""]
    lines += [f"Sitemap: {base}/sitemap.xml", ""]
    return "\n".join(lines)


def write_sitemap(site, articles):
    base = (site.get("baseUrl") or "").rstrip("/")
    today = datetime.date.today().isoformat()
    pages = [
        ("index.html", "1.0"),
        ("market.html", "0.9"),
        ("lotto.html", "0.8"),
        ("saju.html", "0.8"),
        ("music.html", "0.8"),
        ("creator.html", "0.8"),
        ("style.html", "0.8"),
        ("freight.html", "0.8"),
        ("review-reply.html", "0.9"),
        ("sourcing.html", "0.8"),
        ("mfg-cost.html", "0.8"),
        ("resell.html", "0.8"),
        ("salary.html", "0.8"),
        ("tax.html", "0.8"),
        ("biz.html", "0.8"),
        ("global.html", "0.8"),
        ("exhibitions.html", "0.8"),
        ("forms.html", "0.8"),
        ("law.html", "0.8"),
        ("insurance.html", "0.8"),
        ("seller.html", "0.8"),
        ("experts.html", "0.8"),
        ("links.html", "0.5"),
        ("sitemap.html", "0.6"),
        ("ad.html", "0.5"),
        ("about.html", "0.4"),
        ("contact.html", "0.4"),
    ]
    groups = [(path, today, prio, list(LANG_FOLDER)) for path, prio in pages]
    # 기사는 그 기사가 실제로 발행된 언어만 사이트맵·hreflang 에 넣습니다.
    # (영어 전용 기사의 한국어 주소를 넣으면 없는 페이지를 가리키게 됩니다.)
    for a in articles:
        groups.append((f"a/{a['id']}.html", a["publishedAt"][:10], "0.8", article_locales(a)))

    def url_for(folder, path):
        return f"{base}/{folder}/{path}" if folder else f"{base}/{path}"

    rows = []
    for path, mod, prio, locales in groups:
        folders = [(LANG_FOLDER[l], HREFLANG[l]) for l in ALL_LANGS if l in locales]
        if not folders:
            continue
        # 이 페이지가 실제로 있는 언어끼리만 서로를 가리킵니다(상호 참조).
        alts = "".join(
            f'\n    <xhtml:link rel="alternate" hreflang="{hl}" href="{html.escape(url_for(f, path))}"/>'
            for f, hl in folders
        )
        default_folder = LANG_FOLDER["ko"] if "ko" in locales else folders[0][0]
        alts += (f'\n    <xhtml:link rel="alternate" hreflang="x-default" '
                 f'href="{html.escape(url_for(default_folder, path))}"/>')
        for folder, _hl in folders:
            rows.append(
                f"  <url><loc>{html.escape(url_for(folder, path))}</loc>"
                f"<lastmod>{mod}</lastmod><priority>{prio}</priority>{alts}</url>"
            )
    for c in site.get("categories", []):
        # 카테고리 필터 주소도 네 언어를 서로 묶어 둡니다.
        cat_urls = []
        for l in ALL_LANGS:
            folder = LANG_FOLDER[l]
            loc = f"{base}/{folder}/index.html?cat={c['id']}" if folder else f"{base}/index.html?cat={c['id']}"
            cat_urls.append((loc, HREFLANG[l]))
        cat_alts = "".join(
            f'\n    <xhtml:link rel="alternate" hreflang="{hl}" href="{html.escape(loc)}"/>'
            for loc, hl in cat_urls
        ) + f'\n    <xhtml:link rel="alternate" hreflang="x-default" href="{html.escape(cat_urls[0][0])}"/>'
        for loc, _hl in cat_urls:
            rows.append(f"  <url><loc>{html.escape(loc)}</loc>"
                        f"<lastmod>{today}</lastmod><priority>0.6</priority>{cat_alts}</url>")
    xml = f"""<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
{chr(10).join(rows)}
</urlset>
"""
    with open(os.path.join(ROOT, "sitemap.xml"), "w", encoding="utf-8") as f:
        f.write(xml)

    with open(os.path.join(ROOT, "robots.txt"), "w", encoding="utf-8") as f:
        f.write(robots_txt(base))


ARTICLE_PAGE_MARK = "<!-- generated by tools/build.py — 직접 수정하지 말고 data/articles.json 을 고친 뒤 빌드하세요. -->"
HEAD_RE = re.compile(r"<title>.*?<meta name=\"twitter:card\"[^>]*>", re.S)
NOSCRIPT_RE = re.compile(r"<noscript[^>]*>.*?</noscript>", re.S)
REL_ATTR_RE = re.compile(r'\b(href|src)="([^"]*)"')
ABSOLUTE_PREFIXES = ("#", "http://", "https://", "//", "mailto:", "tel:", "data:", "javascript:")


def prefix_relative_urls(markup, prefix):
    """a/ 폴더 안에서도 상대 경로가 루트를 가리키도록 href·src 값을 한 단계 올립니다.
    이미 절대 주소(https://, //), 앵커(#), mailto: 등은 그대로 둡니다."""
    def repl(m):
        tag, val = m.group(1), m.group(2)
        v = val.strip()
        if not v or v.startswith(ABSOLUTE_PREFIXES) or v.startswith("/"):
            return m.group(0)
        return f'{tag}="{prefix}{v}"'
    return REL_ATTR_RE.sub(repl, markup)


def article_og_image(site, a):
    base = (site.get("baseUrl") or "").rstrip("/")
    cover = str(a.get("coverImage") or "").strip()
    if cover and not re.match(r"^[a-z]+://", cover, re.I):
        cover = base + "/" + cover.lstrip("/")
    return cover or f"{base}/assets/img/og.png"


def article_head(site, a):
    """SNS(X·스레드·카톡)가 읽는 기사별 메타 태그."""
    e = html.escape
    base = (site.get("baseUrl") or "").rstrip("/")
    name = site["brand"].get("name") or "INSIGHT BRIEF"
    url = f"{base}/a/{a['id']}.html"
    title = a["title"]
    desc = a.get("deck") or ""
    image = article_og_image(site, a)
    cat = next((c for c in site.get("categories", []) if c["id"] == a.get("category")), {})
    tags = "".join(
        f'\n<meta property="article:tag" content="{e(t)}">' for t in (a.get("tags") or [])[:6]
    )
    return (
        f'<title>{e(title)} — {e(name)}</title>\n'
        f'<meta name="description" content="{e(desc)}">\n'
        '<meta name="theme-color" content="#17140f">\n'
        f'<link rel="canonical" href="{e(url)}">\n'
        '<meta property="og:type" content="article">\n'
        f'<meta property="og:site_name" content="{e(name)}">\n'
        '<meta property="og:locale" content="ko_KR">\n'
        f'<meta property="og:title" content="{e(title)}">\n'
        f'<meta property="og:description" content="{e(desc)}">\n'
        f'<meta property="og:image" content="{e(image)}">\n'
        '<meta property="og:image:width" content="1600">\n'
        '<meta property="og:image:height" content="900">\n'
        f'<meta property="og:url" content="{e(url)}">\n'
        f'<meta property="article:published_time" content="{e(a["publishedAt"])}">\n'
        f'<meta property="article:modified_time" content="{e(a.get("updatedAt") or a["publishedAt"])}">\n'
        f'<meta property="article:section" content="{e(cat.get("label", ""))}">{tags}\n'
        '<meta name="twitter:card" content="summary_large_image">\n'
        f'<meta name="twitter:title" content="{e(title)}">\n'
        f'<meta name="twitter:description" content="{e(desc)}">\n'
        f'<meta name="twitter:image" content="{e(image)}">'
    )


def article_noscript(site, a):
    """JavaScript 없이 들어온 크롤러·독자에게도 기사 요약을 보여 줍니다."""
    e = html.escape
    cat = next((c for c in site.get("categories", []) if c["id"] == a.get("category")), {})
    items = "".join(f'<li>{e(s)}</li>' for s in (a.get("summary") or []))
    summary = f'<ol style="margin-top:18px;padding-left:20px;line-height:1.85;color:var(--ink-2)">{items}</ol>' if items else ""
    return (
        '<noscript>\n    <div class="container" style="padding:40px 0;max-width:760px">\n'
        f'      <p style="font-family:var(--mono);font-size:11px;letter-spacing:.16em;color:var(--accent)">{e(cat.get("label", ""))}</p>\n'
        f'      <h1 style="font-family:var(--serif);font-size:30px;line-height:1.32;letter-spacing:-.02em">{e(a["title"])}</h1>\n'
        f'      <p style="margin-top:12px;color:var(--ink-3);line-height:1.7">{e(a.get("deck") or "")}</p>'
        f'{summary}\n'
        f'      <p style="margin-top:20px;font-size:13px;color:var(--ink-3)">{e(a.get("author") or "")} · {e(a["publishedAt"][:10])}</p>\n'
        '      <p style="margin-top:16px;font-size:13px;color:var(--ink-3)">본문 전체를 읽으려면 JavaScript를 켜 주세요.</p>\n'
        '      <p style="margin-top:12px"><a href="../index.html">전체 리포트 목록</a></p>\n'
        '    </div>\n  </noscript>'
    )


def write_article_pages(site, articles):
    """article.html 을 바탕으로 기사별 /a/{id}.html 전용 페이지를 만듭니다.
    각 페이지는 자기 기사의 제목·요약·대표 이미지를 head 에 담아
    X·스레드·카톡 링크 미리보기가 기사마다 다르게 뜨도록 합니다."""
    with open(os.path.join(ROOT, "article.html"), encoding="utf-8") as f:
        tpl = f.read()
    prefixed = prefix_relative_urls(tpl, "../")
    out_dir = os.path.join(ROOT, "a")
    os.makedirs(out_dir, exist_ok=True)

    made = set()
    for a in articles:
        locales = article_locales(a)
        if "ko" not in locales:
            continue  # 다른 언어 전용 기사 — 한국어 페이지를 만들지 않습니다.
        page = HEAD_RE.sub(lambda m: article_head(site, a), prefixed, count=1)
        page = NOSCRIPT_RE.sub(lambda m: article_noscript(site, a), page, count=1)
        # 언어 전환기·hreflang 을 이 기사 주소(a/{id}.html) 기준으로 다시 붙입니다.
        # 이 기사가 실제로 발행된 언어만 서로를 가리킵니다.
        try:
            sys.path.insert(0, os.path.join(ROOT, "tools"))
            import i18n_pages
            page = i18n_pages.retarget_shell(page, "ko", f"a/{a['id']}.html", locales=locales)
        except Exception as e:
            warnings.append(f"a/{a['id']}.html 언어 전환기: {e}")
        # 검색엔진용 구조화 데이터(NewsArticle)
        try:
            import structured_data
            page = structured_data.inject(page, structured_data.article_ld(site, a, "ko"))
        except Exception as e:
            warnings.append(f"a/{a['id']}.html 구조화 데이터: {e}")
        page = ARTICLE_PAGE_MARK + "\n" + page
        path = os.path.join(out_dir, a["id"] + ".html")
        with open(path, "w", encoding="utf-8") as f:
            f.write(page)
        made.add(a["id"] + ".html")

    # 기사에서 빠진 id의 옛 페이지는 정리합니다(빌드가 만든 파일만).
    for name in sorted(os.listdir(out_dir)):
        if not name.endswith(".html") or name in made:
            continue
        path = os.path.join(out_dir, name)
        try:
            with open(path, encoding="utf-8") as f:
                if f.readline().strip() != ARTICLE_PAGE_MARK:
                    continue
            os.remove(path)
            print(f"  a/{name} (기사 없음 → 삭제)")
        except OSError:
            warnings.append(f"a/{name}: 오래된 기사 페이지를 지우지 못했습니다.")

    print(f"  a/*.html : {len(made)}개 기사 페이지")
    return made


def write_og(site):
    try:
        from PIL import Image, ImageDraw, ImageFont
    except Exception:
        warnings.append("Pillow가 없어 og.png를 만들지 못했습니다.")
        return
    W, H = 1200, 630
    bg = (23, 20, 15)
    img = Image.new("RGB", (W, H), bg)
    d = ImageDraw.Draw(img)

    # subtle diagonal rules
    for i in range(-H, W, 26):
        d.line([(i, 0), (i + H, H)], fill=(31, 27, 21), width=1)
    # accent block + ring
    d.rectangle([80, 78, 92, 90], fill=(179, 38, 30))
    d.ellipse([820, 300, 1240, 720], outline=(60, 52, 42), width=1)
    d.ellipse([880, 360, 1180, 660], outline=(48, 42, 34), width=1)

    serif_candidates = [
        "/usr/share/fonts/pickle-hwp/NotoSerifCJKkr-Regular.otf",
        os.path.join(ROOT, "..", "NotoSansKR-Bold.otf"),
        "/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf",
    ]
    sans_candidates = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    ]

    def font(paths, size):
        for p in paths:
            if os.path.exists(p):
                try:
                    return ImageFont.truetype(p, size)
                except Exception:
                    pass
        return ImageFont.load_default()

    f_name = font(serif_candidates, 96)
    f_tag = font(serif_candidates, 30)
    f_small = font(sans_candidates, 22)

    d.text((80, 118), site["brand"]["name"], font=f_name, fill=(251, 249, 244))
    d.text((84, 250), site["brand"]["tagline"], font=f_tag, fill=(200, 190, 172))
    d.text((84, 320), site["brand"]["slogan"], font=f_tag, fill=(140, 130, 112))
    d.line([(84, 400), (520, 400)], fill=(179, 38, 30), width=4)
    d.text((84, 440), "ECONOMY  ·  TRADE  ·  AI  ·  INVESTIGATION", font=f_small, fill=(120, 110, 96))
    d.text((84, 520), site["baseUrl"].replace("https://", ""), font=f_small, fill=(90, 82, 70))

    out = os.path.join(ROOT, "assets", "img", "og.png")
    os.makedirs(os.path.dirname(out), exist_ok=True)
    img.save(out, "PNG")
    print("  og.png 1200x630")


def main():
    site = load("site.json")
    articles = load("articles.json")
    validate(site, articles)
    validate_nav()

    market = None
    try:
        market = load("market.json")
        validate_market(market)
    except FileNotFoundError:
        errors.append("market.json: 파일이 없습니다. data/market.json 을 만들고 tools/build.py 를 다시 실행하세요.")
    except json.JSONDecodeError as e:
        errors.append(f"market.json: JSON 형식 오류 ({e})")

    series = None
    try:
        series = validate_series("market-series.json", market)
    except FileNotFoundError:
        warnings.append("market-series.json 이 없습니다. 품목별 그래프가 실측 기준점만으로 그려집니다.")

    glossary = None
    try:
        glossary = load("market-glossary.json")
        validate_glossary(glossary)
    except FileNotFoundError:
        warnings.append("market-glossary.json 이 없어 '용어·제품 상식' 탭이 비어 있습니다.")
    except json.JSONDecodeError as e:
        errors.append(f"market-glossary.json: JSON 형식 오류 ({e})")

    print("INSIGHT BRIEF build")
    print(f"  site     : {site['brand']['name']} / {site.get('baseUrl')}")
    print(f"  articles : {len(articles)}편")
    for a in sorted(articles, key=lambda x: x["publishedAt"], reverse=True):
        print(f"    - {a['publishedAt'][:10]}  {a['id']:<28} {a['title'][:34]}")
    if market:
        print(f"  market   : 유가·환율 {len(market.get('oilFx', []))}종 · 원자재 {len(market.get('commodities', []))}종 "
              f"(기준 {market.get('asOf')}, 갱신 {market.get('updatedAt')[:16].replace('T', ' ')})")
        for row in market.get("oilFx", [])[:5]:
            print(f"    - {row['code']:<9} {row['price']:>10,.2f} {row.get('unit','')}")
        periods = market.get("periods") or {}
        if periods:
            parts = []
            for pid in ["weekly", "monthly", "yearly", "recycled"]:
                n = sum(len((g or {}).get("rows") or []) for g in (periods.get(pid) or {}).get("groups", []))
                parts.append(f"{pid} {n}행")
            print("  periods  : " + " · ".join(parts))
        if glossary:
            print(f"  glossary : 용어 {len(glossary.get('entries') or [])}항목 · 분류 {len(glossary.get('categories') or [])}개")
        if series:
            pts = sum(len((v or {}).get("points") or []) for v in (series.get("series") or {}).values())
            print(f"  series   : {len(series.get('series') or {})}종 실측 시계열 · 점 {pts}개")
        hist = HISTORY["data"]
        if hist:
            print(f"  history  : 스냅샷 {len(hist.get('snapshots', []))}일 "
                  f"(최신 {hist['snapshots'][-1].get('date')})")

    if warnings:
        print("\n경고:")
        for w in warnings:
            print("  ! " + w)
    if errors:
        print("\n오류:")
        for e in errors:
            print("  x " + e)
        print("\n오류를 고친 뒤 다시 실행하세요.")
        return 1

    if "--check" in sys.argv:
        print("\n검증 통과.")
        return 0

    write_fallbacks(site, articles)
    if market:
        write_market_fallback(market)
    if series:
        write_market_series_fallback(dict(series))
    if glossary:
        write_glossary_fallback(glossary)
    write_feed(site, articles)
    write_sitemap(site, articles)
    # 사이트맵 페이지(4개국어) — 지면 목록과 최신 기사 목록을 기사 발행 때마다 다시 씁니다.
    try:
        sys.path.insert(0, os.path.join(ROOT, "tools"))
        import build_sitemap_page
        print("  사이트맵 페이지: " + " · ".join(build_sitemap_page.build()))
    except Exception as e:
        warnings.append(f"사이트맵 페이지를 만들지 못했습니다: {e}")
    write_article_pages(site, articles)
    write_og(site)
    print("\n생성 완료: data/*.fallback.js, a/*.html, feed.xml, sitemap.xml, robots.txt, assets/img/og.png")

    # 다국어(영·중·일) 페이지: 새 기사·새 문장만 번역해 a/·en/·zh/·ja/ 를 다시 만듭니다.
    # --no-i18n 으로 건너뛸 수 있고, 번역이 실패해도 한국어 빌드는 그대로 끝납니다.
    # 국가별 세무·결산 페이지(/en/ /zh/ /ja/ tax.html)는 기계번역이 아니라
    # tools/build_tax_pages.py 가 각국 제도에 맞춰 직접 씁니다.
    try:
        sys.path.insert(0, os.path.join(ROOT, "tools"))
        import build_tax_pages
        print("\n국가별 세무·결산 페이지 (en·zh·ja)")
        build_tax_pages.build()
    except Exception as e:
        warnings.append(f"국가별 세무·결산 페이지를 만들지 못했습니다: {e}")

    if "--no-i18n" not in sys.argv:
        try:
            sys.path.insert(0, os.path.join(ROOT, "tools"))
            import i18n_build
            print("\n다국어 빌드 (en·zh·ja)")
            r = i18n_build.run(no_mt=("--no-mt" in sys.argv))
            if r["errors"]:
                for e in r["errors"]:
                    warnings.append("다국어: " + e)
        except Exception as e:
            warnings.append(f"다국어 빌드를 건너뛰었습니다: {e}")

    # 검색·공유용 <head> 메타 보정(멱등). 손으로 만든 페이지까지 canonical·og:image 를
    # 절대 주소로 맞춰 두어야 LINE·위챗·카카오톡 공유 카드가 깨지지 않습니다.
    try:
        sys.path.insert(0, os.path.join(ROOT, "tools"))
        import seo_intl
        files, changed = seo_intl.apply(quiet=True)
        print(f"  head 메타 보정: {len(files)}개 페이지 중 {changed}개 수정")
    except Exception as e:
        warnings.append(f"head 메타 보정을 건너뛰었습니다: {e}")

    # 공통 써드파티(OneSignal)·플로팅 공유 바 — 생성된 페이지와 손으로 만든 페이지를 한 번에 맞춥니다.
    try:
        sys.path.insert(0, os.path.join(ROOT, "tools"))
        import thirdparty
        thirdparty.sync_all(quiet=False)
    except Exception as e:
        warnings.append(f"공통 스크립트를 넣지 못했습니다: {e}")

    # --ping : 빌드 직후 새 URL 을 IndexNow(Bing·야후·DuckDuckGo·네이버)로 바로 알립니다.
    if "--ping" in sys.argv:
        try:
            sys.path.insert(0, os.path.join(ROOT, "tools"))
            import indexnow_ping
            key = indexnow_ping.find_key()
            urls = indexnow_ping.dedupe(indexnow_ping.core_urls() + indexnow_ping.recent_article_urls(7))
            ok = indexnow_ping.submit(key, urls, indexnow_ping.ENDPOINT, f"{indexnow_ping.BASE}/{key}.txt")
            print(f"  IndexNow 제출: {len(urls)}개 URL · {ok}배치 접수")
        except Exception as e:
            warnings.append(f"IndexNow 제출을 건너뛰었습니다: {e}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
