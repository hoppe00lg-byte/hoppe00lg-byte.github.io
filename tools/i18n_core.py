#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""INSIGHT BRIEF 다국어(한·영·중·일) 번역 코어.

번역 캐시(tools/i18n_cache.json)에 한 번 번역한 문장을 남겨 두고,
새 문장만 기계번역(Google 번역 공개 엔드포인트)으로 채웁니다.
매일 새 기사가 올라와도 이미 번역한 문장은 다시 번역하지 않습니다.

  IB_MT=off  환경변수를 주면 네트워크 없이 캐시만 사용합니다(빌드 안전 모드).
"""
import json, os, re, sys, time, html, threading, urllib.parse, urllib.request, datetime
from concurrent.futures import ThreadPoolExecutor

ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
CACHE_PATH = os.path.join(ROOT, "tools", "i18n_cache.json")

LANGS = {
    "en": {"code": "en", "htmlLang": "en", "ogLocale": "en_US", "label": "EN", "locale": "en-US", "name": "English"},
    "zh": {"code": "zh-CN", "htmlLang": "zh-Hans", "ogLocale": "zh_CN", "label": "ZH", "locale": "zh-CN", "name": "中文"},
    "ja": {"code": "ja", "htmlLang": "ja", "ogLocale": "ja_JP", "label": "JA", "locale": "ja-JP", "name": "日本語"},
}
KO = {"code": "ko", "htmlLang": "ko", "ogLocale": "ko_KR", "label": "KO", "locale": "ko-KR", "name": "한국어"}
ALL_LANGS = ["ko", "en", "zh", "ja"]


def article_source_lang(a):
    """기사를 처음 쓴 언어. data/articles.json 의 원본은 한국어이므로 기본값은 ko 입니다.
    영어·중국어·일본어 독자용으로 그 나라 말로 직접 쓴 기사는 "lang": "en" 처럼 적습니다."""
    src = (a or {}).get("lang") or "ko"
    return src if src in ALL_LANGS else "ko"


def article_locales(a):
    """이 기사가 실제로 발행되는 언어 목록.

    · locales 를 적지 않으면: 한국어 원본은 4개국어 전부, 다른 언어로 직접 쓴 기사는 그 언어 하나.
    · "locales": ["en"] 처럼 적으면 그 언어에만 발행합니다(다른 언어 목록·사이트맵·hreflang 에 나오지 않음).
    """
    a = a or {}
    src = article_source_lang(a)
    declared = a.get("locales")
    if isinstance(declared, list) and declared:
        picked = [l for l in ALL_LANGS if l in declared]
        if picked:
            if src not in picked:
                picked = [src] + picked
            return picked
    return list(ALL_LANGS) if src == "ko" else [src]

HANGUL = re.compile(r"[가-힣]")
_lock = threading.Lock()
_cache = None
_dirty = 0


def has_hangul(s):
    return bool(s) and bool(HANGUL.search(s))


def load_cache():
    global _cache
    if _cache is None:
        if os.path.exists(CACHE_PATH):
            with open(CACHE_PATH, encoding="utf-8") as f:
                _cache = json.load(f)
        else:
            _cache = {}
        for lang in LANGS:
            _cache.setdefault(lang, {})
    return _cache


def save_cache():
    global _dirty
    cache = load_cache()
    with _lock:
        if not _dirty:
            return
        tmp = CACHE_PATH + ".tmp"
        with open(tmp, "w", encoding="utf-8") as f:
            json.dump(cache, f, ensure_ascii=False, indent=0, sort_keys=True)
        os.replace(tmp, CACHE_PATH)
        _dirty = 0


def cache_get(text, lang):
    return load_cache()[lang].get(text)


def cache_put(text, lang, out):
    global _dirty
    with _lock:
        load_cache()[lang][text] = out
        _dirty += 1


def mt_enabled():
    return os.environ.get("IB_MT", "").lower() not in ("off", "0", "false", "no")


def _http_translate_chrome(chunk, lang_code, tries=2):
    """구글 번역이 막혔을 때 쓰는 보조 경로(크롬 사전 확장 엔드포인트)."""
    url = ("https://clients5.google.com/translate_a/t?client=dict-chrome-ex&sl=ko&tl="
           + urllib.parse.quote(lang_code) + "&q=" + urllib.parse.quote(chunk))
    last = None
    for i in range(tries):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (ib-i18n)"})
            raw = urllib.request.urlopen(req, timeout=25).read().decode("utf-8")
            data = json.loads(raw)
            if isinstance(data, str):
                return data
            parts = [(x[0] if isinstance(x, list) else x) for x in data]
            return " ".join(p for p in parts if p)
        except Exception as e:
            last = e
            time.sleep(0.8 * (i + 1))
    raise RuntimeError(f"보조 번역 실패: {last}")


def _http_translate(chunk, lang_code, tries=4):
    url = ("https://translate.googleapis.com/translate_a/single?client=gtx&sl=ko&tl="
           + urllib.parse.quote(lang_code) + "&dt=t&q=" + urllib.parse.quote(chunk))
    last = None
    for i in range(tries):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (ib-i18n)"})
            raw = urllib.request.urlopen(req, timeout=25).read().decode("utf-8")
            data = json.loads(raw)
            if isinstance(data, list) and data and isinstance(data[0], list):
                return "".join(seg[0] for seg in data[0] if seg and seg[0])
            raise RuntimeError("형식이 다른 응답")
        except Exception as e:  # 네트워크·한도 오류는 잠깐 쉬고 다시
            last = e
            time.sleep(0.6 * (i + 1))
    try:
        return _http_translate_chrome(chunk, lang_code)
    except Exception as e:
        raise RuntimeError(f"번역 요청 실패: {last} / {e}")


SEP_RE = re.compile(r"\[\[\s*(\d+)\s*\]\]\s*")


def _translate_batch(texts, lang_code):
    """문장 목록을 [[1]] … 구분자로 묶어 한 번에 번역하고 순서대로 돌려줍니다."""
    q = "\n".join(f"[[{i + 1}]] {t}" for i, t in enumerate(texts))
    out = _http_translate(q, lang_code)
    parts = SEP_RE.split(out)
    got = {}
    for i in range(1, len(parts) - 1, 2):
        idx = int(parts[i])
        got[idx] = parts[i + 1].strip()
    if len(got) != len(texts):
        # 구분자가 깨지면 한 문장씩 번역(느리지만 확실).
        got = {}
        for i, t in enumerate(texts):
            got[i + 1] = _http_translate(t, lang_code).strip()
    return [got.get(i + 1, "") for i in range(len(texts))]


def translate(texts, lang, workers=6, chunk_chars=2400, progress=None):
    """한국어 문장 목록 → 대상 언어 문장 목록(캐시 우선)."""
    meta = LANGS[lang]
    todo, out = [], [None] * len(texts)
    for i, t in enumerate(texts):
        if not has_hangul(t):
            out[i] = t
            continue
        hit = cache_get(t, lang)
        if hit is not None:
            out[i] = hit
        else:
            todo.append(i)
    if not todo:
        return out
    if not mt_enabled():
        for i in todo:
            out[i] = ""
        return out

    chunks, cur, cur_len = [], [], 0
    for i in todo:
        t = texts[i]
        if cur and cur_len + len(t) > chunk_chars:
            chunks.append(cur)
            cur, cur_len = [], 0
        cur.append(i)
        cur_len += len(t) + 8
    if cur:
        chunks.append(cur)

    done = [0]

    def work(idxs):
        batch = [texts[i] for i in idxs]
        res = _translate_batch(batch, meta["code"])
        for i, r in zip(idxs, res):
            out[i] = r
            cache_put(texts[i], lang, r)
        with _lock:
            done[0] += len(idxs)
            if progress:
                progress(done[0], len(todo))
        return True

    with ThreadPoolExecutor(max_workers=workers) as ex:
        list(ex.map(work, chunks))
    save_cache()
    for i in todo:
        if not out[i]:
            out[i] = texts[i]
    return out


def translate_one(text, lang):
    if not has_hangul(text):
        return text
    return translate([text], lang, workers=1)[0]


def translate_fresh(texts, lang, prefix=" "):
    """캐시를 쓰지 않고 다시 번역합니다(앞에 공백을 붙여 캐시 키를 비켜 갑니다).
    기계번역이 한글을 남긴 문장을 한 번 더 돌릴 때 씁니다."""
    if not mt_enabled():
        return list(texts)
    meta = LANGS[lang]
    out = []
    for t in texts:
        try:
            r = _translate_batch([prefix + t], meta["code"])[0]
        except Exception:
            r = ""
        r = (r or "").strip()
        out.append(r)
    return out


def rfc822(iso):
    d = datetime.datetime.fromisoformat(iso)
    if d.tzinfo is None:
        d = d.replace(tzinfo=datetime.timezone(datetime.timedelta(hours=9)))
    return d.strftime("%a, %d %b %Y %H:%M:%S %z")


# ---------------------------------------------------------------- 번역 교정 규칙
# data/i18n/fixes.json — 기계번역이 반복해서 틀리는 표현을 고칩니다.
#   ["잘못된 표기", "바른 표기"]            단순 치환
#   ["re:정규식", "바꿀 문자열"]             정규식(뒤의 (?!) 부정전망 등으로 예외를 둡니다)
FIXES_PATH = os.path.join(ROOT, "data", "i18n", "fixes.json")
_fixes = {}
_fixes_re = {}


def load_fixes(lang):
    if lang not in _fixes:
        plain, regs = [], []
        path = FIXES_PATH
        data = {}
        if os.path.exists(path):
            with open(path, encoding="utf-8") as f:
                data = json.load(f)
        for bad, good in (data.get(lang) or []):
            if not bad:
                continue
            if bad.startswith("re:"):
                try:
                    regs.append((re.compile(bad[3:]), good))
                except re.error as e:
                    raise RuntimeError(f"fixes.json {lang}: 정규식 오류 {bad!r} — {e}")
            else:
                plain.append((bad, good))
        _fixes[lang], _fixes_re[lang] = plain, regs
    return _fixes[lang], _fixes_re[lang]


def apply_fixes(text, lang):
    """번역 결과에 교정 규칙을 차례로 적용합니다(사전과 데이터 번역 양쪽에 쓰입니다)."""
    if not text:
        return text
    plain, regs = load_fixes(lang)
    for bad, good in plain:
        if bad in text:
            text = text.replace(bad, good)
    for rx, good in regs:
        text = rx.sub(good, text)
    return text


# ---------------------------------------------------------------- 마크다운

MD_MARKERS = ("## ", "### ", "> ", "- ", "* ")


def segment_markdown(body):
    """본문을 '접두 기호 + 번역할 문장' 목록으로 나눕니다.
    ## 소제목, > 인용, - 목록, 이미지 ![](), 표 | | 를 보존합니다."""
    blocks = []
    lines = body.replace("\r", "").split("\n")
    i = 0
    while i < len(lines):
        line = lines[i]
        s = line.strip()
        if not s:
            i += 1
            continue
        m = re.match(r"^(#{2,3})\s+(.*)$", s)
        if m:
            blocks.append({"kind": "heading", "mark": m.group(1) + " ", "text": m.group(2)})
            i += 1
            continue
        m = re.match(r"^!\[(.*?)\]\((.*?)\)\s*$", s)
        if m:
            blocks.append({"kind": "image", "mark": "", "text": m.group(1), "src": m.group(2)})
            i += 1
            continue
        if s.startswith("|"):
            cells = s.strip("|").split("|")
            blocks.append({"kind": "table", "mark": "", "cells": [c.strip() for c in cells],
                           "sep": "|" in s and set(s.replace("|", "").strip()) <= set("-: ")})
            i += 1
            continue
        if re.match(r"^[-*]\s+", s):
            items = []
            while i < len(lines) and re.match(r"^[-*]\s+", lines[i].strip()):
                items.append(re.sub(r"^[-*]\s+", "", lines[i].strip()))
                i += 1
            blocks.append({"kind": "list", "mark": "- ", "items": items})
            continue
        if re.match(r"^\d+\.\s+", s):
            items = []
            while i < len(lines) and re.match(r"^\d+\.\s+", lines[i].strip()):
                items.append((re.match(r"^(\d+)\.\s+", lines[i].strip()).group(1),
                              re.sub(r"^\d+\.\s+", "", lines[i].strip())))
                i += 1
            blocks.append({"kind": "olist", "mark": "", "items": items})
            continue
        if s.startswith(">"):
            q = []
            while i < len(lines) and lines[i].strip().startswith(">"):
                q.append(lines[i].strip().lstrip(">").strip())
                i += 1
            blocks.append({"kind": "quote", "mark": "> ", "items": q})
            continue
        para = []
        while i < len(lines) and lines[i].strip() and not re.match(r"^(#{2,3}\s|>|[-*]\s+|\d+\.\s+|!\[|\|)", lines[i].strip()):
            para.append(lines[i].strip())
            i += 1
        blocks.append({"kind": "para", "mark": "", "text": " ".join(para)})
    return blocks


def markdown_units(body):
    units = []
    for b in segment_markdown(body):
        if b["kind"] in ("heading", "image", "para"):
            units.append(b["text"])
        elif b["kind"] in ("list", "quote", "olist"):
            units.extend(b["items"] if b["kind"] != "olist" else [t for _, t in b["items"]])
        elif b["kind"] == "table":
            if not b.get("sep"):
                units.extend([c for c in b["cells"] if c])
    return units


def rebuild_markdown(body, translated_units):
    """번역된 문장 목록을 원래 마크다운 구조에 다시 끼워 넣습니다."""
    out, idx = [], 0
    blocks = segment_markdown(body)
    for bi, b in enumerate(blocks):
        nxt = blocks[bi + 1] if bi + 1 < len(blocks) else None
        k = b["kind"]
        if k in ("heading", "image", "para"):
            t = translated_units[idx]; idx += 1
            if k == "heading":
                out.append(b["mark"] + t)
            elif k == "image":
                out.append(f"![{t}]({b['src']})")
            else:
                out.append(t)
        elif k in ("list", "quote"):
            n = len(b["items"])
            vals = translated_units[idx:idx + n]; idx += n
            for v in vals:
                out.append(b["mark"] + v)
            if k == "quote":
                pass
        elif k == "olist":
            n = len(b["items"])
            vals = translated_units[idx:idx + n]; idx += n
            for (num, _), v in zip(b["items"], vals):
                out.append(f"{num}. {v}")
        elif k == "table":
            if b.get("sep"):
                out.append("|" + "|".join(b["cells"]) + "|")
            else:
                cells = []
                for c in b["cells"]:
                    if c:
                        cells.append(translated_units[idx]); idx += 1
                    else:
                        cells.append(c)
                out.append("|" + "|".join(cells) + "|")
        # 표는 줄이 붙어 있어야 렌더링되므로 표 다음에만 빈 줄을 넣습니다.
        if k != "table" or not (nxt and nxt["kind"] == "table"):
            out.append("")
    return "\n".join(out).strip() + "\n"


def translate_markdown(body, lang):
    units = markdown_units(body)
    if not units:
        return body
    tr = translate(units, lang)
    return rebuild_markdown(body, tr)


if __name__ == "__main__":
    # 사용법: python3 tools/i18n_core.py "한국어 문장" en
    q = sys.argv[1] if len(sys.argv) > 1 else "숫자 뒤의 맥락을 읽습니다"
    lang = sys.argv[2] if len(sys.argv) > 2 else "en"
    print(translate_one(q, lang))
