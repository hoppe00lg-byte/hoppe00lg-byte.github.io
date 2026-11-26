#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""4개국어(한·영·중·일) 페이지를 만듭니다.

  python3 tools/i18n_pages.py            # /en/ /zh/ /ja/ 전체 생성 + 한국어 페이지에 전환기 삽입
  python3 tools/i18n_pages.py --lang en  # 한 언어만
  python3 tools/i18n_pages.py --no-ko    # 한국어 원본 페이지는 건드리지 않음

구조
  /            한국어 원본(기존 그대로)
  /en/*.html   /en/a/{id}.html   /en/data/*.json   /en/feed.xml
  /zh/… /ja/…  같은 모양

원칙
  · 페이지 골격은 한국어 원본 HTML 을 그대로 쓰고, 문자열만 사전으로 바꿉니다.
    (원본을 고치면 네 언어가 같이 따라옵니다.)
  · 자산(assets/)은 사이트 루트의 것을 그대로 참조하고, 데이터만 언어별 폴더에 둡니다.
"""
import json, os, re, sys, html as htmlmod, argparse, datetime
from html.parser import HTMLParser

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import i18n_core as C
import nav_spec

NAV_UL_RE = re.compile(r'<ul class="nav" id="site-nav">.*?</ul>', re.S)

ROOT = C.ROOT
DATA = os.path.join(ROOT, "data")
BASE_URL = "https://insightbriefnews.com"

PAGE_FILES = [
    "index.html", "article.html", "market.html", "biz.html", "seller.html", "links.html",
    "lotto.html", "saju.html", "music.html", "style.html", "freight.html", "sourcing.html", "mfg-cost.html", "resell.html", "creator.html", "salary.html", "insurance.html", "forms.html", "experts.html", "about.html",
    "contact.html", "ad.html", "404.html", "global.html", "exhibitions.html",
]
# 기사별 페이지 생성에 쓰는 원본
ARTICLE_SRC = "article.html"

HANGUL = re.compile(r"[가-힣]")

I18N_VER = "20261124a"

HEAD_MARK = "<!-- IB:I18N-HEAD -->"
HEAD_END = "<!-- /IB:I18N-HEAD -->"
SWITCH_MARK = "<!-- IB:I18N-SWITCH -->"
SWITCH_END = "<!-- /IB:I18N-SWITCH -->"

TR_ATTRS = {"placeholder", "aria-label", "title", "alt", "content", "value", "data-empty"}

# 실시간 브리핑 채널(카카오톡 오픈채팅·텔레그램) — app.js 를 쓰지 않는 페이지의 정적 푸터에 넣습니다.
CH_MARK = "<!-- IB:CHANNELS -->"
CH_END = "<!-- /IB:CHANNELS -->"
CHANNELS = {"kakao": "https://open.kakao.com/o/prc7jqYi", "telegram": "https://t.me/blockbrief_kr"}

WEEKDAYS = {
    "en": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    "zh": ["星期一", "星期二", "星期三", "星期四", "星期五", "星期六", "星期日"],
    "ja": ["月曜日", "火曜日", "水曜日", "木曜日", "金曜日", "土曜日", "日曜日"],
}
DATE_FMT = {
    "en": lambda d: d.strftime("%B %-d, %Y") if os.name != "nt" else d.strftime("%B %d, %Y"),
    "zh": lambda d: f"{d.year}年{d.month}月{d.day}日",
    "ja": lambda d: f"{d.year}年{d.month}月{d.day}日",
}

_dict_cache = {}


def lang_dict(lang):
    if lang not in _dict_cache:
        with open(os.path.join(DATA, "i18n", f"{lang}.json"), encoding="utf-8") as f:
            _dict_cache[lang] = json.load(f)
    return _dict_cache[lang]


def today_label(lang, now=None):
    d = now or datetime.date.today()
    wd = WEEKDAYS[lang][d.weekday()]
    if lang == "en":
        return f"{DATE_FMT[lang](d)} ({wd})"
    if lang == "zh":
        return f"{DATE_FMT[lang](d)} {wd}"
    return f"{DATE_FMT[lang](d)}({wd})"


# ------------------------------------------------------------------ 문자열 치환

class MarkupRewriter(HTMLParser):
    """HTML 문자열 자체를 보존하면서 텍스트 노드·속성만 사전으로 바꿉니다."""

    def __init__(self, dic, lang):
        super().__init__(convert_charrefs=False)
        self.dic = dic
        self.lang = lang
        self.out = []
        self.skip = 0
        self.pats = []
        for p in dic.get("patterns", []):
            try:
                # 사전의 치환 문자열은 JS(i18n.js)와 같이 '$1' 표기를 씁니다.
                # 파이썬 re.sub 는 '\g<1>' 만 역참조로 읽으므로 여기서 바꿔 둡니다.
                rep = re.sub(r"\$(\d)", r"\\g<\1>", p["rep"])
                self.pats.append((re.compile(p["re"]), rep))
            except re.error:
                pass

    # --- 사전 조회
    def tr(self, s):
        v = self.dic["strings"].get(s)
        if v is not None:
            return v
        for rx, rep in self.pats:
            if rx.match(s):
                out = rx.sub(rep, s)
                out = re.sub(r"\bweekday:", "", out)
                return out
        return None

    def handle_data(self, data):
        if self.skip or not HANGUL.search(data):
            self.out.append(data)
            return
        lead = data[:len(data) - len(data.lstrip())]
        tail = data[len(data.rstrip()):]
        core = data.strip()
        norm = re.sub(r"\s+", " ", core)
        v = self.tr(norm)
        if v is None and norm != core:
            v = self.tr(core)
        if v is None:
            self.out.append(data)
        else:
            self.out.append(lead + v + tail)

    def handle_entityref(self, name):
        self.out.append(f"&{name};")

    def handle_charref(self, name):
        self.out.append(f"&#{name};")

    def handle_comment(self, data):
        self.out.append(f"<!--{data}-->")

    def handle_decl(self, decl):
        self.out.append(f"<!{decl}>")

    def handle_pi(self, data):
        self.out.append(f"<?{data}>")

    def unknown_decl(self, data):
        self.out.append(f"<![{data}]>")

    def handle_starttag(self, tag, attrs):
        raw = self.get_starttag_text() or ""
        if tag in ("script", "style"):
            self.skip += 1
        self.out.append(self.rewrite_tag(raw, tag))

    def handle_startendtag(self, tag, attrs):
        raw = self.get_starttag_text() or ""
        self.out.append(self.rewrite_tag(raw, tag))

    def handle_endtag(self, tag):
        if tag in ("script", "style") and self.skip:
            self.skip -= 1
        self.out.append(f"</{tag}>")

    def rewrite_tag(self, raw, tag):
        def repl(m):
            name, val = m.group(1), m.group(2)
            low = name.lower()
            if low not in TR_ATTRS:
                return m.group(0)
            if low == "content" and tag != "meta":
                return m.group(0)
            v = self.tr(re.sub(r"\s+", " ", htmlmod.unescape(val)).strip())
            if v is None:
                return m.group(0)
            return f'{name}="{htmlmod.escape(v, quote=True)}"'
        return re.sub(r'([A-Za-z_:][-\w:.]*)\s*=\s*"([^"]*)"', repl, raw)


def translate_markup(src, lang):
    rw = MarkupRewriter(lang_dict(lang), lang)
    rw.feed(src)
    rw.close()
    return "".join(rw.out)


# ------------------------------------------------------------------ 블록 번역
# 문장이 <b>·<a> 로 쪼개져 있어 사전 한 줄로는 자연스럽게 옮길 수 없는 문단은
# 한국어 원본의 요소에 data-ib-block="키" 를 달고, data/i18n/blocks.json 의
# 언어별 HTML 로 통째로 바꿉니다(원본 한국어 페이지는 그대로).
BLOCKS_PATH = os.path.join(DATA, "i18n", "blocks.json")
BLOCK_RE = re.compile(r'<([a-zA-Z][\w-]*)([^>]*\sdata-ib-block="([^"]+)"[^>]*)>(.*?)</\1>', re.S)
_blocks_cache = {}


def block_table():
    if "t" not in _blocks_cache:
        if os.path.exists(BLOCKS_PATH):
            with open(BLOCKS_PATH, encoding="utf-8") as f:
                _blocks_cache["t"] = json.load(f)
        else:
            _blocks_cache["t"] = {}
    return _blocks_cache["t"]


def replace_blocks(src, lang):
    """data-ib-block 표시가 붙은 요소의 내용을 그 언어 문장으로 바꿉니다(멱등)."""
    table = block_table()

    def repl(m):
        tag, attrs, key, inner = m.group(1), m.group(2), m.group(3), m.group(4)
        entry = table.get(key)
        if not entry:
            return m.group(0)
        out = entry.get(lang)
        if out is None:
            return m.group(0)
        return f"<{tag}{attrs}>{out}</{tag}>"

    return BLOCK_RE.sub(repl, src)


# ------------------------------------------------------------------ URL 치환

ABS_PREFIXES = ("#", "http://", "https://", "//", "mailto:", "tel:", "data:", "javascript:", "/")


def rewrite_urls(src, assets_prefix, rel_prefix):
    """자산은 사이트 루트(assets/)로, 페이지·데이터는 언어 폴더 기준으로 바꿉니다."""
    def repl(m):
        attr, val = m.group(1), m.group(2)
        v = val.strip()
        if not v or v.startswith(ABS_PREFIXES) or "{{" in v:
            return m.group(0)
        if v.startswith("assets/"):
            return f'{attr}="{assets_prefix}{v}"'
        return f'{attr}="{rel_prefix}{v}"'
    return re.sub(r'\b(href|src)="([^"]*)"', repl, src)


def set_nav(src, lang, path_rel, rel_prefix):
    """상단 내비를 5개 대표 메뉴로 교체합니다(tools/nav_spec.py 정의).

    기계번역 사전에 없는 새 라벨이 섞이거나 한국어가 남지 않도록, 번역된 본문에서
    내비 블록만 언어별 정식 라벨로 다시 그립니다.
    """
    active = nav_spec.active_for(path_rel)
    markup = nav_spec.render(lang, rel_prefix, active)
    return NAV_UL_RE.sub(lambda m: markup, src, count=1)


def strip_block(src, start, end):
    """넣었던 블록을 통째로 걷어냅니다(앞뒤 빈 줄까지) — 여러 번 빌드해도 같은 결과가 되도록."""
    src = re.sub(r"\n*[ \t]*" + re.escape(start) + r".*?" + re.escape(end) + r"[ \t]*\n?", "\n", src, flags=re.S)
    return src


def tidy_head(src):
    """<head> 안의 과한 빈 줄을 정리합니다(빌드를 반복해도 모양이 변하지 않게)."""
    head_end = src.find("</head>")
    if head_end == -1:
        return src
    head, rest = src[:head_end], src[head_end:]
    head = re.sub(r"\n{3,}", "\n\n", head)
    return head + rest


def depth_prefix(page_lang, path_rel):
    """사이트 루트까지의 상대 경로. 예: /en/ → '../', /en/a/x.html → '../../', /a/x.html → '../'"""
    dirs = path_rel.count("/")
    return "../" * (dirs + (0 if page_lang == "ko" else 1))


def switch_block(page_lang, path_rel, page_file=None, locales=None):
    """KO | EN | ZH | JA 전환기. path_rel 은 언어 루트 기준 경로(예: index.html, a/x.html).

    locales 를 주면 그 언어만 보여 줍니다(영어 전용 기사는 EN 하나만).
    """
    root = depth_prefix(page_lang, path_rel)
    same = path_rel.split("/")[-1]
    langs = [("ko", C.KO), ("en", C.LANGS["en"]), ("zh", C.LANGS["zh"]), ("ja", C.LANGS["ja"])]
    if locales:
        langs = [(code, meta) for code, meta in langs if code in locales]
    items = []
    for code, meta in langs:
        if code == page_lang:
            href = same
        elif code == "ko":
            href = root + path_rel
        else:
            href = root + code + "/" + path_rel
        cls = ' class="is-on" aria-current="true"' if code == page_lang else ""
        items.append(
            f'<a href="{href}" hreflang="{meta["htmlLang"]}" lang="{meta["htmlLang"]}"{cls}>{meta["label"]}</a>'
        )
    return (f'{SWITCH_MARK}<div class="lang-switch" role="group" aria-label="Language">'
            + "".join(items) + f"</div>{SWITCH_END}")


def head_block(page_lang, path_rel, page_file=None, locales=None):
    langs = [("ko", C.KO), ("en", C.LANGS["en"]), ("zh", C.LANGS["zh"]), ("ja", C.LANGS["ja"])]
    if locales:
        # 그 기사가 실제로 있는 언어끼리만 hreflang 으로 묶습니다(없는 페이지를 가리키면 색인에서 무시됩니다).
        langs = [(code, meta) for code, meta in langs if code in locales]

    def url(code):
        if code == "ko":
            return f"{BASE_URL}/{path_rel}"
        return f"{BASE_URL}/{code}/{path_rel}"

    links = "".join(
        f'<link rel="alternate" hreflang="{meta["htmlLang"]}" href="{url(code)}">\n'
        for code, meta in langs
    )
    default = "ko" if any(code == "ko" for code, _ in langs) else langs[0][0]
    xdef = f'<link rel="alternate" hreflang="x-default" href="{url(default)}">\n'
    assets = depth_prefix(page_lang, path_rel)
    extra = ""
    if page_lang == "ko":
        # 한국어 페이지에서도 언어 전환 링크에 ?cat=·?q= 조건을 붙이기 위해 스크립트만 둡니다.
        extra = f'<script src="{assets}assets/js/i18n.js?v={I18N_VER}" defer></script>\n'
    return (f"{HEAD_MARK}\n{links}{xdef}"
            f'<link rel="stylesheet" href="{assets}assets/css/i18n.css?v={I18N_VER}">\n'
            f"{extra}{HEAD_END}")


FONT_LINKS = {
    "ko": "https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;500;600;700;900&display=swap",
    "en": "https://fonts.googleapis.com/css2?family=Noto+Serif:wght@400;500;600;700;900&family=Inter:wght@400;500;600;700&display=swap",
    "zh": "https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;500;600;700;900&family=Noto+Sans+SC:wght@400;500;700&display=swap",
    "ja": "https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@400;500;600;700;900&family=Noto+Sans+JP:wght@400;500;700&display=swap",
}
KR_FONT_LINK = "https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;500;600;700;900&display=swap"


def set_fonts(src, lang):
    """언어에 맞는 웹폰트로 바꿉니다(라틴·중국어·일본어 자형)."""
    if lang == "ko":
        return src
    return src.replace(KR_FONT_LINK, FONT_LINKS[lang])


def absolutize_meta_assets(src):
    """og:image·twitter:image 의 상대 자산 경로만 절대 주소로 바꿉니다.

    (예전에는 stylesheet·favicon 의 href 까지 바꿔, 언어 페이지가 자기 폴더의
     상대 경로 대신 운영 도메인에서 CSS·아이콘을 받아 왔습니다. og 이미지는
     공유 카드가 절대 주소를 요구하므로 meta content 만 그대로 절대화합니다.)
    """
    def fix_tag(m):
        tag = m.group(0)
        if not re.search(r'(property="og:image"|property="og:image:secure_url"|name="twitter:image")', tag):
            return tag
        return re.sub(r'content="(assets/[^"]*)"',
                      lambda mm: f'content="{BASE_URL}/{mm.group(1)}"', tag)
    return re.sub(r"<meta\b[^>]*>", fix_tag, src)


def inject_shell(src, page_lang, path_rel, page_file, canonical_url=None, og_locale=None, title=None, desc=None, locales=None):
    """머리말(hreflang·canonical·언어 전환기)을 넣습니다. 여러 번 실행해도 한 번만 들어갑니다."""
    src = strip_block(src, HEAD_MARK, HEAD_END)
    src = strip_block(src, SWITCH_MARK, SWITCH_END)
    src = tidy_head(src)

    # <html lang> — 같은 속성이 두 번 붙지 않도록 통째로 다시 씁니다.
    html_lang = C.KO if page_lang == "ko" else C.LANGS[page_lang]
    src = re.sub(r"<html\b[^>]*>", f'<html lang="{html_lang["htmlLang"]}">', src, count=1)

    # canonical
    if canonical_url:
        if re.search(r'<link rel="canonical"', src):
            src = re.sub(r'<link rel="canonical" href="[^"]*">',
                         f'<link rel="canonical" href="{canonical_url}">', src, count=1)
        else:
            src = src.replace("</head>", f'<link rel="canonical" href="{canonical_url}">\n</head>', 1)
    if og_locale:
        if re.search(r'<meta property="og:locale"', src):
            src = re.sub(r'<meta property="og:locale" content="[^"]*">',
                         f'<meta property="og:locale" content="{og_locale}">', src, count=1)
        else:
            src = src.replace("</head>", f'<meta property="og:locale" content="{og_locale}">\n</head>', 1)

    src = src.replace("</head>", head_block(page_lang, path_rel, page_file, locales=locales) + "\n</head>", 1)

    # 상단 언어 전환기
    if '<div class="tb-right">' in src:
        src = src.replace('<div class="tb-right">',
                          '<div class="tb-right">' + switch_block(page_lang, path_rel, page_file, locales=locales), 1)
    return src


INTL_TOOL_MODULES = {
    "index.html": ["intl-core.js", "intl-market.js"],
    "market.html": ["intl-core.js", "intl-market.js"],
    "lotto.html": ["intl-core.js", "intl-lotto.js"],
    "saju.html": ["intl-core.js", "intl-saju.js"],
    "salary.html": ["intl-core.js", "intl-salary.js"],
    "forms.html": ["intl-core.js"],
    "biz.html": ["intl-core.js"],
    "seller.html": ["intl-core.js"],
    "experts.html": ["intl-core.js"],
    "about.html": ["intl-core.js"],
    "links.html": ["intl-core.js"],
    "contact.html": ["intl-core.js"],
    "ad.html": ["intl-core.js"],
}


def inject_intl_tools(src, lang, assets_prefix, page_file):
    """국가별 도구 스크립트를 언어 페이지에만 붙입니다.

    intl-core.js  — 통화·단가·플랫폼 표기 현지화(도구·안내 페이지)
    intl-lotto/saju/salary/market.js — 그 나라 시장에 맞춘 도구 본체
    한국어 원본 페이지에는 한 줄도 들어가지 않습니다(모두 lang!='ko' 에서만 동작).
    기사 본문(a/·article.html)은 사실을 바꾸면 안 되므로 대상에서 뺍니다.
    """
    if lang == "ko" or page_file not in INTL_TOOL_MODULES:
        return src
    mods = INTL_TOOL_MODULES[page_file]
    tags = "\n".join(
        f'<script src="{assets_prefix}assets/js/{m}?v={I18N_VER}" defer></script>' for m in mods
    )
    return src.replace("</body>", tags + "\n</body>", 1)


def channels_block(lang):
    """정적 페이지 푸터에 붙는 실시간 브리핑 채널 블록(언어별 라벨)."""
    dic = lang_dict(lang) if lang != "ko" else None

    def t(key):
        return dic["strings"].get(key, key) if dic else key

    e = lambda v: htmlmod.escape(v, quote=True)
    return (
        f'{CH_MARK}<section class="ib-ch ib-ch--footer" aria-label="{e(t("실시간 브리핑 채널"))}">'
        '<div class="ib-ch-main">'
        '<span class="ib-ch-kicker">LIVE BRIEFING</span>'
        f'<h3>{e(t("실시간 브리핑 채널"))}</h3>'
        f'<p>{e(t("새 리포트와 시황을 카카오톡 오픈채팅과 텔레그램으로 실시간으로 받아 보세요."))}</p>'
        '</div><div class="ib-ch-act">'
        f'<a class="btn btn-accent" href="{CHANNELS["kakao"]}" target="_blank" rel="noopener noreferrer">{e(t("카카오톡 오픈채팅"))}</a>'
        f'<a class="btn btn-ghost" href="{CHANNELS["telegram"]}" target="_blank" rel="noopener noreferrer">{e(t("텔레그램 채널"))}</a>'
        '</div></section>' + CH_END
    )


def inject_channels(src, lang):
    """app.js 가 푸터를 그리는 페이지는 건너뛰고(중복 방지), 정적 푸터에만 넣습니다."""
    if "assets/js/app.js" in src:
        return src
    src = strip_block(src, CH_MARK, CH_END)
    if "</footer>" not in src:
        return src
    return src.replace("</footer>", channels_block(lang) + "\n</footer>", 1)


def retarget_shell(src, page_lang, path_rel, locales=None):
    """이미 만들어진 페이지의 언어 전환기·hreflang 을 다른 경로 기준으로 다시 붙입니다.
    (기사 공유 페이지 a/{id}.html 은 article.html 틀을 그대로 쓰므로 경로를 바꿔야 합니다.)
    locales 를 주면 그 기사가 발행된 언어만 서로를 가리킵니다."""
    src = strip_block(src, HEAD_MARK, HEAD_END)
    src = strip_block(src, SWITCH_MARK, SWITCH_END)
    src = tidy_head(src)
    src = src.replace("</head>", head_block(page_lang, path_rel, path_rel, locales=locales) + "\n</head>", 1)
    if '<div class="tb-right">' in src:
        src = src.replace('<div class="tb-right">',
                          '<div class="tb-right">' + switch_block(page_lang, path_rel, path_rel, locales=locales), 1)
    return src


BRAND_VARIANTS = ("인사이트 브리프", "Insight Brief", "洞察简报", "洞察简介", "インサイトブリーフ", "サイトブリーフ")


def normalize_title(src):
    """<title> 안의 브랜드 표기는 언어와 상관없이 INSIGHT BRIEF 로 둡니다."""
    def repl(m):
        t = m.group(1)
        for v in BRAND_VARIANTS:
            t = t.replace(v, "INSIGHT BRIEF")
        t = re.sub(r'(?<=[^\s|—–-])(INSIGHT BRIEF)', r' | \1', t)
        t = re.sub(r'\|\s*INSIGHT BRIEF', '| INSIGHT BRIEF', t)
        t = re.sub(r'\s{2,}', ' ', t).strip()
        return f"<title>{t}</title>"
    return re.sub(r"<title>(.*?)</title>", repl, src, count=1, flags=re.S)


def fix_today(src, lang):
    if lang == "ko":
        return src
    return re.sub(r'(<span id="today-date">)[^<]*(</span>)',
                  lambda m: m.group(1) + today_label(lang) + m.group(2), src, count=1)


# ------------------------------------------------------------------ 파일 생성

def read(path):
    with open(path, encoding="utf-8") as f:
        return f.read()


def write(path, text):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(text)


def build_korean_shell():
    """한국어 원본 페이지에 hreflang·언어 전환기를 넣습니다(멱등)."""
    changed = []
    site_doc = None
    for name in PAGE_FILES:
        src_path = os.path.join(ROOT, name)
        if not os.path.exists(src_path):
            continue
        src = read(src_path)
        new = inject_shell(src, "ko", name, name, canonical_url=None, og_locale=None)
        new = inject_channels(new, "ko")
        if name == "index.html":
            # 첫 페이지 구조화 데이터(WebSite) — 한국어 페이지가 기준입니다.
            try:
                import structured_data
                if site_doc is None:
                    with open(os.path.join(DATA, "site.json"), encoding="utf-8") as f:
                        site_doc = json.load(f)
                new = structured_data.inject(new, structured_data.website_ld(site_doc, "ko"))
            except Exception as e:
                print(f"  ! index.html 구조화 데이터: {e}")
        try:
            import thirdparty
            new = thirdparty.inject(new, "", share=thirdparty.wants_share(name))
        except Exception as e:
            print(f"  ! {name} 공통 스크립트: {e}")
        if new != src:
            write(src_path, new)
            changed.append(name)
    return changed


def lang_page(src_name, lang, path_rel, canonical_url, title=None, description=None, locales=None, site=None):
    """한국어 원본 → 언어 페이지 문자열."""
    src = read(os.path.join(ROOT, src_name))
    src = translate_markup(src, lang)
    src = replace_blocks(src, lang)
    src = fix_today(src, lang)
    src = set_fonts(src, lang)
    src = normalize_title(src)
    src = inject_channels(src, lang)
    src = absolutize_meta_assets(src)
    depth_a = path_rel.startswith("a/")
    assets_prefix = "../../" if depth_a else "../"
    rel_prefix = "../" if depth_a else ""
    src = rewrite_urls(src, assets_prefix, rel_prefix)
    src = set_nav(src, lang, path_rel, rel_prefix)
    meta = C.LANGS[lang]
    src = inject_shell(src, lang, path_rel, path_rel, canonical_url=canonical_url, og_locale=meta["ogLocale"], locales=locales)
    if title:
        src = re.sub(r"<title>.*?</title>", f"<title>{htmlmod.escape(title)}</title>", src, count=1)
    if description:
        src = re.sub(r'<meta name="description" content="[^"]*">',
                     f'<meta name="description" content="{htmlmod.escape(description, quote=True)}">', src, count=1)
    # 공유 카드의 og:url 은 이 페이지 자신의 주소여야 합니다.
    # (원본 HTML 의 한국어 주소가 그대로 남으면 언어 페이지가 한국어 주소로 공유됩니다.)
    if canonical_url:
        src = re.sub(r'<meta property="og:url" content="[^"]*">',
                     f'<meta property="og:url" content="{htmlmod.escape(canonical_url, quote=True)}">', src, count=1)
    # 첫 페이지에는 WebSite 구조화 데이터를 넣습니다(사이트 이름·언어).
    if src_name == "index.html" and site:
        try:
            import structured_data
            src = structured_data.inject(src, structured_data.website_ld(site, lang))
        except Exception as e:
            print(f"  ! {lang}/index.html 구조화 데이터: {e}")
    # 언어 페이지에서만 런타임 사전을 읽습니다(i18n.js 는 ko 에서는 조용히 물러납니다).
    if "assets/js/i18n.js" not in src:
        tags = (f'<script src="{rel_prefix}data/i18n.fallback.js?v={I18N_VER}"></script>\n'
                f'<script src="{assets_prefix}assets/js/i18n.js?v={I18N_VER}"></script>')
        if re.search(r'<script src="[^"]*assets/js/app\.js[^"]*"></script>', src):
            src = re.sub(r'(<script src="[^"]*assets/js/app\.js[^"]*"></script>)',
                         tags + r"\n\1", src, count=1)
        else:
            src = src.replace("</body>", tags + "\n</body>", 1)
    src = inject_intl_tools(src, lang, assets_prefix, src_name)
    # 공통 써드파티(OneSignal)·플로팅 공유 바 — 모든 스크립트 태그를 붙인 뒤 맨 끝에서 한 번
    try:
        import thirdparty
        src = thirdparty.inject(src, assets_prefix, share=thirdparty.wants_share(path_rel))
    except Exception as e:
        print(f"  ! {lang}/{path_rel} 공통 스크립트: {e}")
    return src


def article_head_localized(site, a, lang):
    e = htmlmod.escape
    meta = C.LANGS[lang]
    name = site["brand"].get("name") or "INSIGHT BRIEF"
    url = f"{BASE_URL}/{lang}/a/{a['id']}.html"
    title, desc = a["title"], a.get("deck") or ""
    image = a.get("coverImage") or f"{BASE_URL}/assets/img/og.png"
    if not re.match(r"^[a-z]+://", image, re.I):
        image = BASE_URL + "/" + image.lstrip("/")
    cat = next((c for c in site.get("categories", []) if c["id"] == a.get("category")), {})
    tags = "".join(f'\n<meta property="article:tag" content="{e(t)}">' for t in (a.get("tags") or [])[:6])
    return (
        f'<title>{e(title)} — {e(name)}</title>\n'
        f'<meta name="description" content="{e(desc)}">\n'
        '<meta name="theme-color" content="#17140f">\n'
        f'<link rel="canonical" href="{e(url)}">\n'
        '<meta property="og:type" content="article">\n'
        f'<meta property="og:site_name" content="{e(name)}">\n'
        f'<meta property="og:locale" content="{meta["ogLocale"]}">\n'
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


def article_noscript_localized(site, a, lang):
    e = htmlmod.escape
    d = lang_dict(lang)
    t = lambda s: d["strings"].get(s, s)
    cat = next((c for c in site.get("categories", []) if c["id"] == a.get("category")), {})
    items = "".join(f'<li>{e(s)}</li>' for s in (a.get("summary") or []))
    summary = (f'<ol style="margin-top:18px;padding-left:20px;line-height:1.85;color:var(--ink-2)">{items}</ol>'
               if items else "")
    return (
        '<noscript>\n    <div class="container" style="padding:40px 0;max-width:760px">\n'
        f'      <p style="font-family:var(--mono);font-size:11px;letter-spacing:.16em;color:var(--accent)">{e(cat.get("label", ""))}</p>\n'
        f'      <h1 style="font-family:var(--serif);font-size:30px;line-height:1.32;letter-spacing:-.02em">{e(a["title"])}</h1>\n'
        f'      <p style="margin-top:12px;color:var(--ink-3);line-height:1.7">{e(a.get("deck") or "")}</p>'
        f'{summary}\n'
        f'      <p style="margin-top:20px;font-size:13px;color:var(--ink-3)">{e(a.get("author") or "")} · {e(a["publishedAt"][:10])}</p>\n'
        f'      <p style="margin-top:16px;font-size:13px;color:var(--ink-3)">{e(t("본문 전체를 읽으려면 JavaScript를 켜 주세요."))}</p>\n'
        f'      <p style="margin-top:12px"><a href="../index.html">{e(t("전체 리포트 목록"))}</a></p>\n'
        '    </div>\n  </noscript>'
    )


HEAD_RE = re.compile(r"<title>.*?<meta name=\"twitter:card\"[^>]*>", re.S)
NOSCRIPT_RE = re.compile(r"<noscript[^>]*>.*?</noscript>", re.S)


def build_lang_articles(lang, site, articles):
    out_dir = os.path.join(ROOT, lang, "a")
    os.makedirs(out_dir, exist_ok=True)
    made = set()
    for a in articles:
        locales = C.article_locales(a)
        if lang not in locales:
            continue
        path_rel = f"a/{a['id']}.html"
        page = lang_page(ARTICLE_SRC, lang, path_rel, f"{BASE_URL}/{lang}/{path_rel}", locales=locales)
        page = HEAD_RE.sub(lambda m: article_head_localized(site, a, lang), page, count=1)
        page = NOSCRIPT_RE.sub(lambda m: article_noscript_localized(site, a, lang), page, count=1)
        try:
            import structured_data
            page = structured_data.inject(page, structured_data.article_ld(site, a, lang))
        except Exception as e:
            print(f"  ! {lang}/a/{a['id']}.html 구조화 데이터: {e}")
        page = (f"<!-- generated by tools/build.py ({lang}) — 직접 수정하지 말고 "
                f"data/articles.json 을 고친 뒤 빌드하세요. -->\n") + page
        write(os.path.join(out_dir, a["id"] + ".html"), page)
        made.add(a["id"] + ".html")
    for name in sorted(os.listdir(out_dir)):
        if name.endswith(".html") and name not in made:
            p = os.path.join(out_dir, name)
            try:
                with open(p, encoding="utf-8") as f:
                    if f.readline().startswith("<!-- generated by tools/build.py"):
                        os.remove(p)
            except OSError:
                pass
    return len(made)


def write_lang_data(lang, site, articles, ko_site, ko_articles):
    """언어 폴더의 data/ 를 채웁니다(페이지가 상대 경로로 읽는 사본)."""
    out = os.path.join(ROOT, lang, "data")
    os.makedirs(out, exist_ok=True)
    pairs = [
        ("site.json", site), ("articles.json", articles),
        ("market.json", None), ("market-glossary.json", None),
        ("market-history.json", None), ("market-series.json", None),
    ]
    for name, doc in pairs:
        src = doc
        if src is None:
            lp = os.path.join(DATA, name.replace(".json", f".{lang}.json"))
            if not os.path.exists(lp):
                lp = os.path.join(DATA, name)
            with open(lp, encoding="utf-8") as f:
                src = json.load(f)
        with open(os.path.join(out, name), "w", encoding="utf-8") as f:
            json.dump(src, f, ensure_ascii=False, separators=(",", ":"))
    # 전시회 캘린더 데이터(언어와 무관하게 한 파일에 4개국어를 담고 있습니다)
    ex = os.path.join(DATA, "exhibitions.json")
    if os.path.exists(ex):
        write(os.path.join(out, "exhibitions.json"), read(ex))
        fb = os.path.join(DATA, "exhibitions.fallback.js")
        if os.path.exists(fb):
            write(os.path.join(out, "exhibitions.fallback.js"), read(fb))
    # 원본 그대로 쓰는 데이터
    for name in ("lotto.json", "fashion-trends.json"):
        p = os.path.join(DATA, name)
        if os.path.exists(p):
            write(os.path.join(out, name), read(p))

    def fb(fname, varname, obj):
        with open(os.path.join(out, fname), "w", encoding="utf-8") as f:
            f.write("/* 자동 생성 파일입니다. data/*.json 을 고친 뒤 tools/build.py 를 실행하세요. */\n")
            f.write(f"window.{varname} = ")
            json.dump(obj, f, ensure_ascii=False, separators=(",", ":"))
            f.write(";\n")

    fb("site.fallback.js", "__SITE__", site)
    fb("articles.fallback.js", "__ARTICLES__", articles)
    for name, var in (("market.json", "__FALLBACK_MARKET__"), ("market-series.json", "__FALLBACK_SERIES__"),
                      ("market-glossary.json", "__FALLBACK_GLOSSARY__")):
        p = os.path.join(out, name)
        if os.path.exists(p):
            with open(p, encoding="utf-8") as f:
                fb(name.replace(".json", ".fallback.js"), var, json.load(f))
    dic = lang_dict(lang)
    write(os.path.join(out, "i18n.json"), json.dumps(dic, ensure_ascii=False, separators=(",", ":")))
    fb("i18n.fallback.js", "__I18N__", dic)


def write_lang_feed(lang, site, articles):
    base = f"{BASE_URL}/{lang}"
    b = site["brand"]
    items = []
    for a in sorted(articles, key=lambda x: x["publishedAt"], reverse=True)[:20]:
        link = f"{base}/a/{a['id']}.html"
        cat = next((c["label"] for c in site["categories"] if c["id"] == a["category"]), a["category"])
        items.append(f"""    <item>
      <title>{htmlmod.escape(a['title'])}</title>
      <link>{htmlmod.escape(link)}</link>
      <guid isPermaLink="true">{htmlmod.escape(link)}</guid>
      <pubDate>{C.rfc822(a['publishedAt']) if hasattr(C, 'rfc822') else ''}</pubDate>
      <category>{htmlmod.escape(cat)}</category>
      <description>{htmlmod.escape(a['deck'])}</description>
    </item>""")
    now = datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=9))).strftime("%a, %d %b %Y %H:%M:%S %z")
    xml = f"""<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>{htmlmod.escape(b['name'])} — {htmlmod.escape(b.get('tagline', ''))}</title>
    <link>{htmlmod.escape(base)}/</link>
    <atom:link href="{htmlmod.escape(base)}/feed.xml" rel="self" type="application/rss+xml"/>
    <description>{htmlmod.escape(b.get('description', ''))}</description>
    <language>{C.LANGS[lang]['htmlLang']}</language>
    <lastBuildDate>{now}</lastBuildDate>
{chr(10).join(items)}
  </channel>
</rss>
"""
    write(os.path.join(ROOT, lang, "feed.xml"), xml)
    # 사이트맵은 한국어 사이트맵을 그대로 두고 언어 폴더에 사본을 둡니다(푸터 링크 대응).
    sm = os.path.join(ROOT, "sitemap.xml")
    if os.path.exists(sm):
        write(os.path.join(ROOT, lang, "sitemap.xml"), read(sm))


def build_lang(lang, ko_site=None, ko_articles=None):
    site_path = os.path.join(DATA, f"site.{lang}.json")
    arts_path = os.path.join(DATA, f"articles.{lang}.json")
    if not os.path.exists(site_path):
        print(f"  ! data/site.{lang}.json 이 없습니다. tools/i18n_data.py 를 먼저 실행하세요.")
        return 0
    with open(site_path, encoding="utf-8") as f:
        site = json.load(f)
    with open(arts_path, encoding="utf-8") as f:
        articles = json.load(f)

    out_dir = os.path.join(ROOT, lang)
    os.makedirs(out_dir, exist_ok=True)
    n = 0
    for name in PAGE_FILES:
        if not os.path.exists(os.path.join(ROOT, name)):
            continue
        url = f"{BASE_URL}/{lang}/{name}"
        write(os.path.join(out_dir, name), lang_page(name, lang, name, url, site=site))
        n += 1
    na = build_lang_articles(lang, site, articles)
    write_lang_data(lang, site, articles, ko_site, ko_articles)
    write_lang_feed(lang, site, articles)
    print(f"  {lang}/ : 페이지 {n}개 · 기사 {na}편 · 데이터 사본")
    return n + na


def build(langs=None, korean=True):
    langs = langs or list(C.LANGS)
    if korean:
        changed = build_korean_shell()
        if changed:
            print(f"  한국어 페이지에 언어 전환기 삽입: {', '.join(changed)}")
    total = 0
    for lang in langs:
        total += build_lang(lang)
    # 사이트맵 페이지(/sitemap.html · /en · /zh · /ja)는 기계번역이 아니라
    # tools/build_sitemap_page.py 가 언어별 문구를 직접 써서 만듭니다.
    # (PAGE_FILES 에 넣으면 위 루프가 번역본으로 덮어쓰므로 여기서 따로 부릅니다.)
    try:
        import build_sitemap_page
        build_sitemap_page.build(langs)
    except Exception as e:
        print(f"  ! 사이트맵 페이지를 만들지 못했습니다: {e}")
    return total


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--lang", action="append", default=None)
    ap.add_argument("--no-ko", action="store_true")
    args = ap.parse_args()
    build(args.lang, korean=not args.no_ko)


if __name__ == "__main__":
    main()
