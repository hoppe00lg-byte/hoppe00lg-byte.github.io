#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""상단 내비게이션(5개 대표 메뉴)을 이미 있는 모든 HTML 페이지에 반영합니다(멱등).

  python3 tools/apply_nav.py            # 전체 반영
  python3 tools/apply_nav.py --check    # 바뀔 파일만 확인(쓰지 않음)

하는 일
  1) <ul class="nav" id="site-nav"> … </ul> 를 tools/nav_spec.py 의 5개 메뉴로 교체
     (한국어 · /en/ · /zh/ · /ja/ · /a/ 기사 · tax.html · law.html 모두)
  2) <head> 에 assets/css/nav.css 를, </body> 앞에 assets/js/nav.js 를 한 번만 넣기
  3) 현재 페이지 표시(.is-active / aria-current) 자동 계산

새 기사·페이지를 만든 뒤에도 이 스크립트를 한 번 돌리면 내비가 같아집니다.
(다만 tools/build.py · i18n_pages.py · build_tax_pages.py 는 각자 nav_spec 을
 직접 불러 쓰므로, 평소 발행 루틴에서는 이 스크립트를 돌릴 필요가 없습니다.)
"""
import argparse
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import nav_spec

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
NAV_CSS_VER = "20261128a"
NAV_JS_VER = "20261124c"

UL_RE = re.compile(r'<ul class="nav" id="site-nav">.*?</ul>', re.S)
HEAD_END = "</head>"
BODY_END = "</body>"

# 저장소 루트에서 제외할 폴더(빌드 산출물·의존성·백업)
SKIP_DIRS = {".git", "node_modules", "screenshots", "tools", "supabase", "data"}


def page_lang(rel):
    parts = rel.split("/")
    if parts[0] in ("en", "zh", "ja"):
        return parts[0]
    return "ko"


def prefixes(rel):
    """(페이지 링크 접두사, 자산 접두사).

    /en/index.html  → 링크 ''      · 자산 '../'
    /en/a/x.html    → 링크 '../'   · 자산 '../../'
    /a/x.html       → 링크 '../'   · 자산 '../'
    /tax.html       → 링크 ''      · 자산 ''
    언어 폴더 안의 페이지는 같은 폴더의 언어판을 가리키고, 자산만 사이트 루트(assets/)로 올라갑니다.
    """
    parts = rel.split("/")
    has_lang = parts[0] in ("en", "zh", "ja")
    depth_assets = len(parts) - 1
    depth_links = depth_assets - (1 if has_lang else 0)
    link = ("../" * depth_links).rstrip("/")
    asset = "../" * depth_assets   # 자산 접두사는 끝의 '/' 를 남깁니다('' 또는 '../')
    return link, asset


def join(prefix, path):
    if not prefix:
        return path
    return prefix + "/" + path if not prefix.endswith("/") else prefix + path


def nav_markup(lang, link_prefix, rel):
    active = nav_spec.active_for(rel[len(lang) + 1:] if lang != "ko" and rel.startswith(lang + "/") else rel)
    html = nav_spec.render(lang, (link_prefix + "/") if link_prefix else "", active)
    # 들여쓰기 정리: render 는 4칸 기준, 원본도 4칸
    return html


def ensure_css(src, asset_prefix):
    if "css/nav.css" in src:
        # 버전만 갱신
        return re.sub(r'href="[^"]*css/nav\.css[^"]*"',
                      'href="%sassets/css/nav.css?v=%s"' % (asset_prefix, NAV_CSS_VER),
                      src, count=1)
    tag = '<link rel="stylesheet" href="%sassets/css/nav.css?v=%s">' % (asset_prefix, NAV_CSS_VER)
    return src.replace(HEAD_END, tag + "\n" + HEAD_END, 1)


def ensure_js(src, asset_prefix):
    src_rel = "%sassets/js/nav.js" % asset_prefix
    if "js/nav.js" in src:
        return re.sub(r'src="[^"]*js/nav\.js[^"]*"',
                      'src="%s?v=%s"' % (src_rel, NAV_JS_VER), src, count=1)
    tag = '<script src="%s?v=%s"></script>' % (src_rel, NAV_JS_VER)
    m = re.search(r'<script src="([^"]*assets/js/app\.js[^"]*)"></script>', src)
    if m:
        return src[:m.start()] + tag + "\n" + src[m.start():]
    return src.replace(BODY_END, tag + "\n" + BODY_END, 1)


def all_html():
    for dirpath, dirnames, filenames in os.walk(ROOT):
        dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS]
        for name in filenames:
            if name.endswith(".html"):
                full = os.path.join(dirpath, name)
                yield os.path.relpath(full, ROOT).replace(os.sep, "/")


def process(rel, check=False):
    full = os.path.join(ROOT, rel)
    with open(full, encoding="utf-8") as f:
        src = f.read()
    if 'id="site-nav"' not in src:
        return None
    lang = page_lang(rel)
    link_prefix, asset_prefix = prefixes(rel)
    markup = nav_markup(lang, link_prefix.rstrip("/"), rel)
    new = UL_RE.sub(lambda m: markup, src, count=1)
    new = ensure_css(new, asset_prefix)
    new = ensure_js(new, asset_prefix)
    if new == src:
        return False
    if not check:
        with open(full, "w", encoding="utf-8") as f:
            f.write(new)
    return True


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--check", action="store_true")
    args = ap.parse_args()
    changed, total = [], 0
    for rel in all_html():
        r = process(rel, check=args.check)
        if r is None:
            continue
        total += 1
        if r:
            changed.append(rel)
    verb = "바뀔 파일" if args.check else "수정"
    print("%s: %d개 (내비 있는 페이지 %d개)" % (verb, len(changed), total))
    for c in changed[:20]:
        print("  -", c)
    if len(changed) > 20:
        print("  … 외 %d개" % (len(changed) - 20))
    return 0


if __name__ == "__main__":
    sys.exit(main())
