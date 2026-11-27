#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""데이터 파일을 언어별로 만듭니다.

  data/site.{lang}.json            제호·소개·카테고리·푸터·광고 안내
  data/articles.{lang}.json        기사 제목·요약·본문(마크다운)·태그
  data/market.{lang}.json          시황판 품목명·단위·비고·기간표 머리글
  data/market-glossary.{lang}.json 용어·제품 상식

  python3 tools/i18n_data.py             # 세 언어 모두
  python3 tools/i18n_data.py --lang en   # 한 언어만
  python3 tools/i18n_data.py --no-mt     # 캐시만 사용(네트워크 없이)
"""
import hashlib, json, os, re, sys, argparse
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import i18n_core as C

ROOT = C.ROOT
DATA = os.path.join(ROOT, "data")
HANGUL = re.compile(r"[가-힣]")

SKIP_KEYS = {
    "id", "code", "group", "cat", "category", "url", "sourceUrl", "href", "linkUrl",
    "email", "tipEmail", "adEmail", "endpoint", "client", "slot", "baseUrl",
    "publishedAt", "updatedAt", "date", "asOf", "coverImage", "articleId",
    "sample", "featured", "readMinutes", "views", "decimals", "prev",
    "change", "changePct", "adsense", "kind", "size", "demo",
    "stance", "icon", "theme", "type", "status", "level", "tag", "slug",
}


_fixes = {}


def lang_fixes(lang):
    if lang not in _fixes:
        path = os.path.join(DATA, "i18n", "fixes.json")
        data = {}
        if os.path.exists(path):
            with open(path, encoding="utf-8") as f:
                data = json.load(f)
        _fixes[lang] = [(a, b) for a, b in (data.get(lang) or []) if a]
    return _fixes[lang]


def apply_fixes(text, lang):
    if not text:
        return text
    for bad, good in lang_fixes(lang):
        if bad in text:
            text = text.replace(bad, good)
    return text


def tr_units(texts, lang):
    """번역 후에도 한글이 남은 문장은 한 번 더 돌립니다."""
    if not texts:
        return []
    tr = C.translate(texts, lang)
    bad = [i for i, v in enumerate(tr) if HANGUL.search(v or "")]
    if bad:
        fresh = C.translate_fresh([texts[i] for i in bad], lang)
        for i, v in zip(bad, fresh):
            if v and not HANGUL.search(v):
                tr[i] = v
    return [apply_fixes(v, lang) for v in tr]


def load(name):
    with open(os.path.join(DATA, name), encoding="utf-8") as f:
        return json.load(f)


def dump(name, obj):
    with open(os.path.join(DATA, name), "w", encoding="utf-8") as f:
        json.dump(obj, f, ensure_ascii=False, indent=1)


def collect(obj, skip=(), path=""):
    """번역할 문자열을 (경로, 문자열) 로 모읍니다."""
    out = []
    if isinstance(obj, dict):
        for k, v in obj.items():
            if k in SKIP_KEYS or k in skip:
                continue
            out += collect(v, skip, path + "." + k)
    elif isinstance(obj, list):
        for i, v in enumerate(obj):
            out += collect(v, skip, path + f"[{i}]")
    elif isinstance(obj, str) and HANGUL.search(obj):
        out.append((path, obj))
    return out


def set_path(obj, path, value):
    cur = obj
    parts = re.findall(r"\.([^.\[]+)|\[(\d+)\]", path)
    for i, (key, idx) in enumerate(parts):
        last = i == len(parts) - 1
        if key:
            if last:
                cur[key] = value
            else:
                cur = cur[key]
        else:
            idx = int(idx)
            if last:
                cur[idx] = value
            else:
                cur = cur[idx]


_dict_strings = {}


def dict_strings(lang):
    if lang not in _dict_strings:
        p = os.path.join(DATA, "i18n", f"{lang}.json")
        with open(p, encoding="utf-8") as f:
            _dict_strings[lang] = json.load(f)["strings"]
    return _dict_strings[lang]


def translate_doc(doc, lang, skip=(), label=""):
    items = collect(doc, skip)
    texts = [t for _, t in items]
    if not texts:
        return 0
    tr = C.translate(texts, lang)
    for (path, src), v in zip(items, tr):
        # 화면 사전에 있는 문구(품목명·단위 등)는 사전 표기를 따릅니다.
        hit = dict_strings(lang).get(src)
        if hit:
            v = hit
        elif HANGUL.search(v):
            hit = dict_strings(lang).get(v)
            v = hit or v
        set_path(doc, path, v)
    return len(texts)


def localize_urls(obj):
    """기사 본문·대표 이미지의 상대 경로를 사이트 루트 기준(/assets/…)으로 바꿉니다."""
    if isinstance(obj, dict):
        for k, v in obj.items():
            if k == "coverImage" and isinstance(v, str) and v and not v.startswith(("http", "/")):
                obj[k] = "/" + v.lstrip("/")
            else:
                localize_urls(v)
    elif isinstance(obj, list):
        for v in obj:
            localize_urls(v)
    elif isinstance(obj, str):
        pass


def fix_body(body):
    """본문 안 상대 이미지 경로를 사이트 루트(/assets/…) 기준으로 바꿉니다."""
    body = re.sub(r"(?<!!)\]\((?!https?:|/|#)((?:\.\./)*)assets/([^)]+)\)", r"](/assets/\2)", body)
    body = re.sub(r"!\[([^\]]*)\]\((?!https?:|/|#)((?:\.\./)*)assets/([^)]+)\)", r"![\1](/assets/\3)", body)
    body = body.replace("/assets/assets/", "/assets/")
    return body


# ---------------------------------------------------------------- 언어별 커버 카드
# 한국어 제목을 그려 넣은 카드 한 장을 en·zh·ja 가 같이 쓰면 외국어 기사에 한글이 남는다.
# 'coverCard': true 인 기사는 그 언어 제목·부제로 카드를 한 장 더 그려 {ID}.{lang}.jpg 로 쓴다.
COVER_REG = os.path.join(ROOT, "tools", "i18n_covers.json")
_cover_reg = None


def _cover_registry() -> dict:
    global _cover_reg
    if _cover_reg is None:
        try:
            with open(COVER_REG, encoding="utf-8") as f:
                _cover_reg = json.load(f)
        except Exception:  # noqa: BLE001
            _cover_reg = {}
    return _cover_reg


def _save_cover_registry():
    try:
        with open(COVER_REG, "w", encoding="utf-8") as f:
            json.dump(_cover_registry(), f, ensure_ascii=False, indent=0, sort_keys=True)
    except Exception:  # noqa: BLE001
        pass


def _drop_cover_dup(body: str, cover_rel: str) -> str:
    """본문에 똑같이 한 번 더 들어간 커버 이미지 문단을 뺍니다(헤드에 이미 크게 나온다)."""
    if not body or not cover_rel:
        return body
    pat = re.compile(r"^!\[[^\]]*\]\(/?" + re.escape(cover_rel.lstrip("/")) + r"\)$")
    parts = [p for p in body.split("\n\n") if not pat.match(p.strip())]
    return re.sub(r"\n{3,}", "\n\n", "\n\n".join(parts))


def localize_cover(b: dict, lang: str, src_cover: str) -> dict:
    """번역이 끝난 기사(b)의 커버를 그 언어 카드로 바꿉니다. 실패하면 그대로 돌려줍니다."""
    if not b.get("coverCard"):
        return b
    src = (src_cover or b.get("coverImage") or "").lstrip("/")
    if not src or src.startswith("http"):
        return b
    try:
        import cover_card  # tools/cover_card.py
    except Exception as e:  # noqa: BLE001
        print(f"  ! {lang} {b.get('id')}: 커버 카드 모듈을 읽지 못했습니다 — {e}")
        return b
    base = re.sub(rf"\.{lang}(?=\.[A-Za-z0-9]+$)", "", src)  # 이미 언어별이면 원본으로
    rel = cover_card.variant_rel(base, lang)
    out = os.path.join(ROOT, rel)
    stamp = hashlib.sha1((b.get("title", "") + "\n" + b.get("deck", "")).encode("utf-8")).hexdigest()[:12]
    reg = _cover_registry()
    key = f"{lang}/{b.get('id')}"
    if os.environ.get("IB_COVER_FORCE") != "1" and os.path.exists(out) and (reg.get(key) or {}).get("h") == stamp:
        b["coverImage"] = "/" + rel
    else:
        done = cover_card.render(out, b.get("title", ""), b.get("deck", ""),
                                 b.get("category", ""), (b.get("publishedAt") or "")[:10], lang=lang)
        if not done:
            print(f"  ! {lang} {b.get('id')}: 커버 카드를 그리지 못했습니다(폰트 없음) — 한글 카드가 남습니다")
            return b
        reg[key] = {"h": stamp, "file": rel}
        _save_cover_registry()
        b["coverImage"] = "/" + rel
    b["body"] = _drop_cover_dup(b.get("body", ""), base)
    b["body"] = _drop_cover_dup(b.get("body", ""), rel)
    return b


def category_labels(lang: str) -> dict:
    """카테고리 이름·설명의 확정 표기(data/i18n/category-labels.json). 없으면 빈 사전."""
    path = os.path.join(DATA, "i18n", "category-labels.json")
    if not os.path.exists(path):
        return {}
    try:
        with open(path, encoding="utf-8") as f:
            return (json.load(f) or {}).get(lang) or {}
    except Exception:  # noqa: BLE001
        return {}


def build_site(lang, articles=None):
    site = load("site.json")
    t = translate_doc(site, lang, skip=("ticker",))
    # 카테고리 이름·설명은 사람이 정한 표기를 기계번역보다 우선한다(뉴스 메뉴·필터에 그대로 노출).
    override = category_labels(lang)
    for c in site.get("categories") or []:
        fix = override.get(c.get("id")) or {}
        for key in ("label", "desc"):
            if fix.get(key):
                c[key] = fix[key]
    # 상단 속보 줄은 기사 제목을 그대로 씁니다(기사 번역과 어긋나지 않게).
    title_by_id = {}
    if articles:
        title_by_id = {a["id"]: a["title"] for a in articles}
    else:
        p = os.path.join(DATA, f"articles.{lang}.json")
        if os.path.exists(p):
            with open(p, encoding="utf-8") as f:
                title_by_id = {a["id"]: a["title"] for a in json.load(f)}
    for it in site.get("ticker") or []:
        aid = it.get("articleId")
        if aid and aid in title_by_id:
            it["text"] = title_by_id[aid]
        elif it.get("text"):
            it["text"] = tr_units([it["text"]], lang)[0]
    # 그 언어에 없는 기사를 가리키는 속보는 빼 둡니다(누르면 404 가 나는 링크 방지).
    if title_by_id:
        site["ticker"] = [it for it in (site.get("ticker") or [])
                          if not it.get("articleId") or it.get("articleId") in title_by_id]
    dump(f"site.{lang}.json", site)
    return t


def build_articles(lang):
    """그 언어로 발행되는 기사만 번역해 data/articles.{lang}.json 을 만듭니다.

    · 한국어 원본: 늘 그대로 번역
    · 그 언어로 직접 쓴 기사(lang=en 등): 번역하지 않고 그대로 싣습니다
    · locales 에 그 언어가 없는 기사: 이 언어 목록에서 뺍니다
    """
    arts = load("articles.json")
    out = []
    total = 0
    for a in arts:
        if lang not in C.article_locales(a):
            continue
        b = json.loads(json.dumps(a))
        if C.article_source_lang(a) == lang:
            # 이 언어 독자를 위해 직접 쓴 기사 — 기계번역하지 않습니다.
            localize_urls(b)
            localize_cover(b, lang, a.get("coverImage") or "")
            out.append(b)
            total += 1
            continue
        units = C.markdown_units(a.get("body", ""))
        b["body"] = fix_body(C.rebuild_markdown(a.get("body", ""), tr_units(units, lang)))
        fields = [("title", a.get("title")), ("deck", a.get("deck")),
                  ("author", a.get("author")), ("authorRole", a.get("authorRole")),
                  ("disclaimer", a.get("disclaimer")), ("subtitle", a.get("subtitle"))]
        vals = [v for _, v in fields if isinstance(v, str) and v]
        tr = tr_units(vals, lang)
        vi = 0
        for k, v in fields:
            if isinstance(v, str) and v:
                b[k] = tr[vi]; vi += 1
        if isinstance(a.get("summary"), list) and a["summary"]:
            b["summary"] = tr_units(a["summary"], lang)
        if isinstance(a.get("tags"), list) and a["tags"]:
            b["tags"] = tr_units(a["tags"], lang)
        # 출처 목록(이름·설명)도 그 언어로 — 화면 '팩트체크 & 출처' 표에 그대로 보입니다.
        # 주소(url)는 사실 정보라 그대로 두고 이름·설명만 번역합니다.
        def tr_sources(items):
            out = []
            for src in items or []:
                if not isinstance(src, dict):
                    out.append(src)
                    continue
                item = dict(src)
                vals = [item.get("name") or "", item.get("note") or ""]
                tr2 = tr_units(vals, lang)
                item["name"], item["note"] = tr2[0], tr2[1]
                out.append(item)
            return out

        fc = a.get("factCheck")
        if isinstance(fc, dict):
            if isinstance(fc.get("sources"), list):
                b["factCheck"]["sources"] = tr_sources(fc["sources"])
            for k in list(fc.keys()):
                if k == "sources":
                    continue
                v = fc.get(k)
                if isinstance(v, str) and v:
                    b["factCheck"][k] = tr_units([v], lang)[0]
            if fc.get("title"):
                b["factCheck"]["title"] = tr_units([fc["title"]], lang)[0]
            if fc.get("note"):
                b["factCheck"]["note"] = tr_units([fc["note"]], lang)[0]
        elif isinstance(fc, str) and fc:
            b["factCheck"] = tr_units([fc], lang)[0]
        localize_urls(b)
        localize_cover(b, lang, a.get("coverImage") or "")
        out.append(b)
        total += 1
    dump(f"articles.{lang}.json", out)
    return total


def build_market(lang):
    m = load("market.json")
    translate_doc(m, lang)
    dump(f"market.{lang}.json", m)
    # 시계열·스냅샷은 숫자만 있어 그대로 복사합니다(출처명은 번역).
    ser = load("market-series.json")
    translate_doc(ser, lang)
    dump(f"market-series.{lang}.json", ser)
    hist = load("market-history.json")
    if isinstance(hist.get("note"), str):
        hist["note"] = tr_units([hist["note"]], lang)[0]
    dump(f"market-history.{lang}.json", hist)


def build_glossary(lang):
    g = load("market-glossary.json")
    translate_doc(g, lang)
    dump(f"market-glossary.{lang}.json", g)


def build(langs=None, no_mt=False):
    """언어별 데이터 파일을 만듭니다. build.py 가 부릅니다."""
    if no_mt:
        os.environ["IB_MT"] = "off"
    langs = langs or list(C.LANGS)
    out = {}
    for lang in langs:
        n = build_articles(lang)
        build_site(lang)
        build_market(lang)
        build_glossary(lang)
        out[lang] = n
    C.save_cache()
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--lang", action="append", default=None)
    ap.add_argument("--no-mt", action="store_true")
    args = ap.parse_args()
    for lang, n in build(args.lang, no_mt=args.no_mt).items():
        print(f"  [{lang}] articles {n}편 · site·market·glossary 갱신")


if __name__ == "__main__":
    main()
