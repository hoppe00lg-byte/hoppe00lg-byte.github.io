#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""기사 커버 카드(1,600×900) 렌더러 — 언어별로 따로 그립니다.

배경
----
한국어 제목·부제를 그려 넣은 카드 한 장을 en·zh·ja 페이지가 그대로 쓰면
일본어·중국어·영어 기사 첫 화면에 한글이 박힌 이미지가 남습니다(2026-11-27 지적).
그래서 카드가 들어간 기사는 `"coverCard": true` 로 표시하고,
번역이 끝난 뒤 그 언어의 제목·부제로 카드를 한 장 더 그려
`{기사ID}.{언어}.jpg` 로 저장합니다. (영어 칸은 `{기사ID}.en.jpg`)

  python3 tools/cover_card.py --all              # 아직 없는 언어별 카드 모두 생성
  python3 tools/cover_card.py --id {기사ID}      # 한 기사만(ko·en·zh·ja)
  python3 tools/cover_card.py --check            # 빠진 카드 점검만(종료코드 1)

폰트는 Noto Serif/Sans CJK 계열을 씁니다. 언어별 자형(JP·SC·KR)을 우선 찾고,
없으면 pan-CJK 폰트로 대체합니다. 경로 후보는 IB_FONT_DIR 환경변수 → 시스템 폰트 →
assets/fonts 순서입니다.
"""
from __future__ import annotations

import argparse
import json
import os
import re
import sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))

REGION = {"ko": "kr", "en": "kr", "zh": "sc", "ja": "jp"}
ALL_LANGS = ("ko", "en", "zh", "ja")
LANG_LABEL = {"ko": "한국어", "en": "English", "zh": "中文", "ja": "日本語"}

# 카드 색 — 사이트 편집 디자인(--ink/--paper/--accent)과 같습니다.
INK = (23, 20, 15)
PAPER = (245, 241, 232)
ACCENT = (176, 58, 32)
DECK_INK = (90, 84, 74)
FOOT_INK = (120, 112, 100)

W, H = 1600, 900
TITLE_SIZES = (78, 72, 66, 60, 54, 48, 44)
DECK_SIZES = (32, 30, 28, 26)

_face_cache: dict = {}
_cmap_cache: dict = {}
_pil_cache: dict = {}


# ---------------------------------------------------------------- 폰트 찾기
def _font_dirs() -> list[str]:
    out = []
    env = os.environ.get("IB_FONT_DIR")
    if env:
        out.extend(p for p in env.split(os.pathsep) if p)
    out += [
        os.path.join(ROOT, "assets", "fonts"),
        "/usr/share/fonts/opentype/noto",
        "/usr/share/fonts/truetype/noto",
        "/usr/share/fonts/truetype/noto-serif-cjk",
        "/usr/share/fonts/pickle-hwp",
        "/usr/share/fonts/opentype/ipafont-gothic",
        "/usr/share/fonts/truetype/wqy",
    ]
    return [d for d in out if os.path.isdir(d)]


def _faces(kind: str) -> list[tuple[str, int, str]]:
    """(경로, face index, 패밀리 이름) 후보 목록. kind = 'serif' | 'sans'."""
    if kind in _face_cache:
        return _face_cache[kind]
    serif_re = re.compile(r"NotoSerifCJK|NotoSerif(KR|JP|SC|TC|HK)|NotoSerifKR|NotoSerifJP|NotoSerifSC", re.I)
    sans_re = re.compile(r"NotoSansCJK|NotoSans(KR|JP|SC|TC|HK)|NotoSansKR|NotoSansJP|NotoSansSC|NanumSquare", re.I)
    pat = serif_re if kind == "serif" else sans_re
    faces: list[tuple[str, int, str]] = []
    seen = set()
    for d in _font_dirs():
        try:
            names = sorted(os.listdir(d))
        except OSError:
            continue
        for name in names:
            if not name.lower().endswith((".ttf", ".otf", ".ttc", ".otc")):
                continue
            path = os.path.join(d, name)
            if path in seen:
                continue
            seen.add(path)
            if name.lower().endswith((".ttc", ".otc")):
                for idx, family in _ttc_families(path):
                    if pat.search(family or name) or pat.search(name):
                        faces.append((path, idx, family or name))
            elif pat.search(name):
                faces.append((path, 0, name))
    _face_cache[kind] = faces
    return faces


def _ttc_families(path: str) -> list[tuple[int, str]]:
    try:
        from fontTools.ttLib import TTFont
    except Exception:  # noqa: BLE001
        return [(0, "")]
    out = []
    for idx in range(8):
        try:
            f = TTFont(path, fontNumber=idx, lazy=True)
        except Exception:  # noqa: BLE001
            break
        try:
            name = f["name"].getDebugName(1) or f["name"].getDebugName(4) or ""
        except Exception:  # noqa: BLE001
            name = ""
        out.append((idx, name))
        f.close()
    return out or [(0, "")]


def _cmap(path: str, index: int) -> set[int]:
    key = (path, index)
    if key in _cmap_cache:
        return _cmap_cache[key]
    cov: set[int] = set()
    try:
        from fontTools.ttLib import TTFont
        f = TTFont(path, fontNumber=index, lazy=True)
        for t in f["cmap"].tables:
            cov |= set(t.cmap)
        f.close()
    except Exception:  # noqa: BLE001
        cov = set()
    _cmap_cache[key] = cov
    return cov


def pick_face(kind: str, lang: str, text: str) -> tuple[str, int] | None:
    """그 언어·그 문장을 모두 그릴 수 있는 폰트를 고릅니다(지역 자형 우선)."""
    region = REGION.get(lang, "kr")
    chars = {ord(c) for c in (text or "") if not c.isspace()}
    cands = _faces(kind)
    if not cands:
        return None

    def score(item):
        path, idx, family = item
        fam = (family or "").lower()
        base = os.path.basename(path).lower()
        s = 0
        # 'sanscjk' 안의 'sc' 같은 우연 일치를 피하려고 낱말 경계로 봅니다.
        hit = (re.search(rf"\b{region}\b", fam)
               or re.search(rf"cjk{region}[-_.]", base)
               or re.search(rf"[-_.]{region}[-_.]", base)
               or re.search(rf"-{region}\.", base))
        if hit:                                   # JP·SC·KR 자형 우선
            s -= 10
        if kind == "serif" and "serif" in base:
            s -= 2
        if "bold" in base or "b" in re.findall(r"-(\w+)\.otf$", base):
            s -= 1
        return s

    for path, idx, family in sorted(cands, key=score):
        cov = _cmap(path, idx)
        if cov and chars and chars <= cov:
            return (path, idx)
    return (cands[0][0], cands[0][1])


def _pil_font(path: str, index: int, size: int):
    key = (path, index, size)
    if key in _pil_cache:
        return _pil_cache[key]
    from PIL import ImageFont
    try:
        f = ImageFont.truetype(path, size, index=index)
    except Exception:  # noqa: BLE001
        f = ImageFont.truetype(path, size)
    _pil_cache[key] = f
    return f


# ---------------------------------------------------------------- 그리기
TOKEN_RE = re.compile(r"\s+|[A-Za-z0-9][A-Za-z0-9.,%:/+\-–—'’]*|.", re.S)
# 줄 머리에 오면 안 되는 문장부호(중국어·일본어 조판 규칙)
NO_HEAD = set("，。、．·：；！？）」』】〕％%”’〉》]")


def _wrap(draw, text: str, font, max_w: int) -> list[str]:
    """낱말·숫자 묶음 단위로 접고, 한 묶음이 폭을 넘으면(중국어·일본어) 글자 단위로 접습니다.

    '14夸脱' 처럼 숫자와 한자가 붙은 토큰은 숫자 중간에서 끊기지 않습니다.
    """
    lines: list[str] = []
    cur = ""

    def width(s: str) -> float:
        return draw.textlength(s.rstrip(), font=font)

    for tok in TOKEN_RE.findall((text or "").strip()):
        if tok.isspace():
            if cur and not cur.endswith(" "):
                cur += " "
            continue
        if width(cur + tok.lstrip()) <= max_w:
            cur += tok if not cur else tok
            continue
        if cur.strip():
            lines.append(cur.rstrip())
            cur = ""
        if width(tok) <= max_w:
            cur = tok
            continue
        for ch in tok.strip():  # 한 묶음이 한 줄보다 길 때만 글자 단위로
            if width(cur + ch) <= max_w or not cur:
                cur += ch
            else:
                lines.append(cur)
                cur = ch
    if cur.strip():
        lines.append(cur.rstrip())

    # 줄 머리 금지 문장부호는 앞줄로 붙입니다(의미 없는 한 글자 줄 방지).
    fixed: list[str] = []
    for ln in lines:
        if fixed and ln and ln[0] in NO_HEAD:
            fixed[-1] = fixed[-1] + ln[0]
            ln = ln[1:]
        if ln.strip():
            fixed.append(ln)
    return fixed


def _clip(draw, lines: list[str], max_lines: int, font, max_w: int) -> list[str]:
    """줄 수를 넘으면 마지막 줄 끝을 '…'로 마무리합니다(문장이 뚝 끊겨 보이지 않게)."""
    if len(lines) <= max_lines:
        return lines
    out = list(lines[:max_lines])
    last = out[-1].rstrip()
    if last and last[-1] not in "。！？.!?":
        while last and draw.textlength(last + "…", font=font) > max_w:
            last = last[:-1].rstrip()
        out[-1] = last + "…"
    return out


def render(out_path: str, title: str, deck: str = "", category: str = "",
           date: str = "", lang: str = "ko") -> str | None:
    """카드 한 장을 그려 out_path 에 저장합니다. 폰트가 없으면 None."""
    try:
        from PIL import Image, ImageDraw
    except Exception:  # noqa: BLE001
        return None
    title = (title or "").strip()
    if not title:
        return None
    deck = (deck or "").strip()
    serif = pick_face("serif", lang, title + " " + deck)
    sans = pick_face("sans", lang, f"INSIGHT BRIEF · {category} " + deck) or serif
    if not serif:
        return None

    eyebrow = f"INSIGHT BRIEF · {(category or '').upper()}".strip(" ·")
    max_title_w = W - 200
    max_deck_w = W - 210
    budget = H - 300  # 제목+부제가 차지할 수 있는 높이

    img = Image.new("RGB", (W, H), PAPER)
    d = ImageDraw.Draw(img)

    # 제목·부제 크기 맞추기 — 4줄·3줄 안에 들어오는 가장 큰 조합
    # (마지막 줄이 한두 글자만 남는 '외톨이 줄'은 한 단계 작은 크기로 피합니다)
    chosen = None
    fallback = None
    for ts in TITLE_SIZES:
        tf = _pil_font(serif[0], serif[1], ts)
        tl = _wrap(d, title, tf, max_title_w)
        if len(tl) > 4:
            continue
        for ds in DECK_SIZES:
            df = _pil_font(sans[0], sans[1], ds)
            dl = _clip(d, _wrap(d, deck, df, max_deck_w), 3, df, max_deck_w) if deck else []
            need = len(tl) * int(ts * 1.24) + len(dl) * int(ds * 1.45) + 60
            if need <= budget:
                cand = (ts, tf, tl, ds, df, dl)
                if fallback is None:
                    fallback = cand
                if len(tl) == 1 or d.textlength(tl[-1], font=tf) >= 0.32 * max_title_w:
                    chosen = cand
                break
        if chosen:
            break
    chosen = chosen or fallback
    if not chosen:  # 아주 긴 제목 — 가장 작은 크기로 잘라 넣는다
        ts = TITLE_SIZES[-1]
        tf = _pil_font(serif[0], serif[1], ts)
        tl = _wrap(d, title, tf, max_title_w)[:4]
        ds = DECK_SIZES[-1]
        df = _pil_font(sans[0], sans[1], ds)
        dl = _clip(d, _wrap(d, deck, df, max_deck_w), 3, df, max_deck_w)
        chosen = (ts, tf, tl, ds, df, dl)

    ts, tf, tl, ds, df, dl = chosen

    # 편집 디자인: 위쪽 액센트 바, 왼쪽 세로 괘선, 아이브로
    d.rectangle([0, 0, W, 14], fill=ACCENT)
    d.rectangle([80, 96, 88, 96 + 62], fill=ACCENT)
    ef = _pil_font(sans[0], sans[1], 30)
    d.text((112, 104), eyebrow, font=ef, fill=ACCENT)

    y = 210
    for line in tl:
        d.text((96, y), line, font=tf, fill=INK)
        y += int(ts * 1.24)
    y += 14
    d.line([96, y, 96 + 220, y], fill=ACCENT, width=4)
    y += 34
    for line in dl:
        d.text((96, y), line, font=df, fill=DECK_INK)
        y += int(ds * 1.45)

    foot = _pil_font(sans[0], sans[1], 26)
    d.text((96, H - 92), "insightbriefnews.com", font=foot, fill=FOOT_INK)
    if date:
        d.text((W - 380, H - 92), date[:10], font=foot, fill=FOOT_INK)

    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    img.save(out_path, "JPEG", quality=86, optimize=True)
    return out_path


# ---------------------------------------------------------------- 언어별 경로
def variant_rel(cover_rel: str, lang: str) -> str:
    """assets/img/articles/{id}.jpg → assets/img/articles/{id}.{lang}.jpg"""
    rel = (cover_rel or "").lstrip("/")
    base, ext = os.path.splitext(rel)
    return f"{base}.{lang}{ext or '.jpg'}"


def is_variant(cover_rel: str, lang: str) -> bool:
    rel = (cover_rel or "").lstrip("/")
    return os.path.splitext(rel)[0].endswith(f".{lang}")


def render_variant(cover_rel: str, *, lang: str, title: str,
                   deck: str = "", category: str = "", date: str = "") -> str | None:
    """한국어 원본 커버 경로를 받아 그 언어 카드를 만들고 상대 경로를 돌려줍니다."""
    rel = variant_rel(cover_rel, lang)
    out = os.path.join(ROOT, rel)
    ok = render(out, title, deck, category, date, lang=lang)
    if not ok:
        return None
    return rel


# ---------------------------------------------------------------- 점검·수동 생성
def _load_articles(path: str) -> list[dict]:
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def check() -> int:
    """언어별 카드가 빠진 기사를 찾습니다(coverCard 표시된 기사만)."""
    missing = []
    for lang in ("en", "zh", "ja"):
        p = os.path.join(ROOT, "data", f"articles.{lang}.json")
        if not os.path.exists(p):
            continue
        for a in _load_articles(p):
            if not a.get("coverCard"):
                continue
            rel = (a.get("coverImage") or "").lstrip("/")
            if not rel or not is_variant(rel, lang):
                missing.append(f"{lang}: {a['id']} — 언어별 카드 아님({rel or '없음'})")
            elif not os.path.exists(os.path.join(ROOT, rel)):
                missing.append(f"{lang}: {a['id']} — 파일 없음({rel})")
    for line in missing:
        print("·", line)
    print(f"언어별 커버 카드 점검: 문제 {len(missing)}건 / 카드 기사 "
          f"{sum(1 for lang in ('en', 'zh', 'ja') for a in _load_articles(os.path.join(ROOT, 'data', f'articles.{lang}.json')) if a.get('coverCard'))}건")
    return 1 if missing else 0


def build_all(langs=("en", "zh", "ja"), ids=None, force=False) -> int:
    """data/articles.{lang}.json 을 읽어 언어별 카드를 만듭니다(번역문 그대로)."""
    made = 0
    for lang in langs:
        p = os.path.join(ROOT, "data", f"articles.{lang}.json")
        if not os.path.exists(p):
            continue
        for a in _load_articles(p):
            if ids and a.get("id") not in ids:
                continue
            if not (a.get("coverCard") or (ids and a.get("id") in (ids or []))):
                continue
            src = (a.get("coverImage") or "").lstrip("/")
            if not src:
                continue
            if is_variant(src, lang) and not force:
                continue
            base = src
            if is_variant(base, lang):
                base = re.sub(rf"\.{lang}(?=\.[a-z]+$)", "", base)
            rel = render_variant(base, lang=lang, title=a.get("title", ""),
                                 deck=a.get("deck", ""), category=a.get("category", ""),
                                 date=(a.get("publishedAt") or "")[:10])
            if rel:
                made += 1
                print(f"  · {lang} {a['id']} → {rel}")
            else:
                print(f"  ! {lang} {a['id']} 카드 생성 실패")
    print(f"언어별 커버 카드 {made}장 생성")
    return 0


def main() -> int:
    ap = argparse.ArgumentParser(description="언어별 기사 커버 카드 렌더러")
    ap.add_argument("--all", action="store_true", help="빠진 언어별 카드 모두 생성")
    ap.add_argument("--id", action="append", default=None, help="기사 ID(여러 번 사용 가능)")
    ap.add_argument("--lang", action="append", default=None, help="언어(en|zh|ja)")
    ap.add_argument("--force", action="store_true", help="이미 있어도 다시 그림")
    ap.add_argument("--check", action="store_true", help="점검만")
    args = ap.parse_args()
    if args.check:
        return check()
    if args.all or args.id:
        langs = tuple(args.lang) if args.lang else ("en", "zh", "ja")
        return build_all(langs, set(args.id) if args.id else None, force=args.force)
    ap.print_help()
    return 0


if __name__ == "__main__":
    sys.exit(main())
