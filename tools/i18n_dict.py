#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""화면 문자열 사전(data/i18n/{lang}.json)을 만듭니다.

  python3 tools/i18n_dict.py            # 세 언어 모두(새 문장만 기계번역)
  python3 tools/i18n_dict.py --lang en  # 한 언어만

재료
  tools/i18n_ui_strings.json  ← tools/i18n_extract.py 가 실제 화면에서 모은 문장
  data/i18n/overrides.json    ← 손으로 다듬은 고정 번역(항상 우선)
  data/i18n/fixes.json        ← 기계번역에서 자주 틀리는 표현 교정
"""
import json, os, sys, re, argparse
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import i18n_core as C

ROOT = C.ROOT
UI_STRINGS = os.path.join(ROOT, "tools", "i18n_ui_strings.json")
OVERRIDES = os.path.join(ROOT, "data", "i18n", "overrides.json")
FIXES = os.path.join(ROOT, "data", "i18n", "fixes.json")
OUT_DIR = os.path.join(ROOT, "data", "i18n")

HANGUL = re.compile(r"[가-힣]")
DATE_KO = re.compile(r"^\d{4}년 \d{1,2}월 \d{1,2}일( \S+요일)?$")
NUM_ONLY = re.compile(r"^[\s\d.,%+\-–~()/:·]+$")


def article_content_strings():
    """기사 데이터가 직접 담는 문자열(제목·요약·본문 문단·태그·출처)은 사전에서 뺍니다.
    기사 페이지의 머리말·안내 문구(funnel·뉴스레터·목차)는 사전에 남깁니다."""
    path = os.path.join(ROOT, "data", "articles.json")
    out = set()
    with open(path, encoding="utf-8") as f:
        arts = json.load(f)

    def norm(s):
        return re.sub(r"\s+", " ", s).strip()

    for a in arts:
        for k in ("title", "deck", "author", "authorRole", "disclaimer", "subtitle"):
            if isinstance(a.get(k), str):
                out.add(norm(a[k]))
        for s in (a.get("summary") or []):
            if isinstance(s, str):
                out.add(norm(s))
        for line in (a.get("body") or "").split("\n"):
            t = line.strip()
            if not t:
                continue
            out.add(norm(t))
            out.add(norm(re.sub(r"^(#{2,3}\s+|>\s?|[-*]\s+|\d+\.\s+)", "", t)))
            for chunk in re.split(r"(?<=[.!?])\s+", t):
                out.add(norm(chunk))
        for src in (a.get("sources") or []):
            if isinstance(src, dict):
                for k in ("name", "note"):
                    if isinstance(src.get(k), str):
                        out.add(norm(src[k]))
    return out


def load_sources():
    with open(UI_STRINGS, encoding="utf-8") as f:
        ui = json.load(f)
    art_strings = article_content_strings()
    texts = []
    seen = set()
    for rec in ui:
        t = rec["text"]
        key = re.sub(r"\s+", " ", t).strip()
        if key in art_strings or t in art_strings:
            continue  # 기사 본문·제목은 articles.{lang}.json 이 담당
        if not HANGUL.search(t) or NUM_ONLY.match(t):
            continue
        if len(t) > 1200:
            continue
        if t in seen:
            continue
        seen.add(t)
        texts.append(t)
    return texts


RUN_RE = re.compile(r"[가-힣]+(?:\s?[가-힣]+)*")


def repair_hangul(text, strings, over, lang):
    """번역 결과에 한글이 남아 있으면 사전에서 그 조각만 다시 바꿔 끼웁니다.
    (예: 'Average for December 2025 대비 +309 USD' → '…: +309 USD')"""
    if not text or not HANGUL.search(text):
        return text
    idx = {"en": 0, "zh": 1, "ja": 2}[lang]

    def repl(m):
        frag = m.group(0)
        v = strings.get(frag) or strings.get(frag.replace(" ", ""))
        if v is None and frag in over:
            v = over[frag][idx]
        return v if v else frag

    return RUN_RE.sub(repl, text)


def over_and_mt(over, todo, trans, lang):
    idx = {"en": 0, "zh": 1, "ja": 2}[lang]
    out = {}
    for t, v in zip(todo, trans):
        out[t] = v or t
    for k, v in over.items():
        out[k] = v[idx]
    return out


def build(langs=None, no_mt=False):
    """언어별 사전을 만듭니다(새 문장만 기계번역). build.py 가 부릅니다."""
    if no_mt:
        os.environ["IB_MT"] = "off"
    langs = langs or list(C.LANGS)
    with open(OVERRIDES, encoding="utf-8") as f:
        ov = json.load(f)
    over = ov["strings"]
    patterns = ov.get("patterns", [])
    fixes = {}
    if os.path.exists(FIXES):
        with open(FIXES, encoding="utf-8") as f:
            fixes = json.load(f)

    texts = load_sources()
    os.makedirs(OUT_DIR, exist_ok=True)
    made = {}
    for lang in langs:
        meta = C.LANGS[lang]
        todo = [t for t in texts if t not in over]
        trans = C.translate(todo, lang)
        strings = dict(over_and_mt(over, todo, trans, lang))
        for k, v in list(strings.items()):
            for bad, good in (fixes.get(lang) or []):
                if bad in v:
                    v = v.replace(bad, good)
            strings[k] = repair_hangul(v, strings, over, lang)
        pats = [{"re": p["ko"], "rep": p[lang]} for p in patterns]
        doc = {
            "lang": lang,
            "htmlLang": meta["htmlLang"],
            "locale": meta["locale"],
            "ogLocale": meta["ogLocale"],
            "label": meta["label"],
            "patterns": pats,
            "strings": strings,
        }
        with open(os.path.join(OUT_DIR, f"{lang}.json"), "w", encoding="utf-8") as f:
            json.dump(doc, f, ensure_ascii=False, indent=0, sort_keys=True)
        made[lang] = len(strings)
    return made


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--lang", action="append", default=None)
    ap.add_argument("--no-mt", action="store_true")
    args = ap.parse_args()
    print(f"사전 재료: 화면 문자열 — 고정 번역 우선")
    for lang, n in build(args.lang, no_mt=args.no_mt).items():
        print(f"  {lang}: {n}개 → data/i18n/{lang}.json")


if __name__ == "__main__":
    main()
