#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""전 페이지 공통 스크립트(OneSignal·Clarity 등)와 위젯(플로팅 공유 바)을 심습니다.

  python3 tools/thirdparty.py            # 저장소 전체 HTML 에 반영(멱등)
  python3 tools/thirdparty.py --check    # 바뀔 파일만 확인

구조
  · 써드파티 서비스 설정은 assets/js/vendors.js 의 VENDORS 객체 한 곳에 모읍니다.
    새 서비스를 붙일 때는 그 파일에 ID 한 줄만 추가하면 전 페이지에 적용됩니다.
    (Microsoft Clarity 자리는 이미 비워 두었습니다 — projectId 만 채우면 로드됩니다.)
  · HTML 에는 아래 세 블록만 들어갑니다. 빌드를 여러 번 돌려도 같은 모양이 됩니다.
      <!-- IB:VENDORS -->     <head> : OneSignal SDK + vendors.js (+ 위젯 CSS)
      <!-- IB:SHARE-FLOAT --> </body> 앞 : 플로팅 공유 바 스크립트
      <!-- IB:CHAT-FLOAT -->  </body> 앞 : 5개 메신저 상담 위젯(전 페이지)
  · build.py · i18n_pages.py · build_tax_pages.py 가 각자 이 모듈을 불러 쓰고,
    손으로 관리하는 페이지(law.html 등)는 build.py 끝에서 sync_all() 이 한 번에 맞춥니다.
"""
import argparse
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

VENDOR_MARK = "<!-- IB:VENDORS -->"
VENDOR_END = "<!-- /IB:VENDORS -->"
FLOAT_MARK = "<!-- IB:SHARE-FLOAT -->"
FLOAT_END = "<!-- /IB:SHARE-FLOAT -->"
CHAT_MARK = "<!-- IB:CHAT-FLOAT -->"
CHAT_END = "<!-- /IB:CHAT-FLOAT -->"

# 캐시 무효화용 버전(파일을 고치면 올립니다)
WIDGETS_VER = "20261126a"
VENDORS_VER = "20261126a"
CHAT_VER = "20261124c"

# Google Analytics 4 — insightbriefnews.com 웹 스트림(2026-11-26 발급)
GA4_ID = "G-GXYJ52M3GC"

# OneSignal Web SDK v16 — appId 는 사용자가 확정한 값입니다.
ONESIGNAL_APP_ID = "a9c426d7-5792-4b23-8624-21bb802a6a94"
ONESIGNAL_SDK = "https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js"

# 플로팅 공유 바를 다는 페이지(파일 이름 기준). 기사 상세 a/*.html 은 경로로 판별합니다.
SHARE_PAGES = {
    "article.html", "tax.html", "law.html", "salary.html", "insurance.html", "market.html", "forms.html",
    "biz.html", "seller.html", "saju.html", "lotto.html", "experts.html", "links.html",
}
SKIP_DIRS = {".git", "node_modules", "screenshots", "tools", "supabase", "data", ".local", "browser"}


def prefix_for(rel_path):
    """사이트 루트까지의 상대 경로. /en/x.html → '../', /en/a/x.html → '../../', /a/x.html → '../'"""
    rel_path = rel_path.replace(os.sep, "/")
    parts = rel_path.split("/")[:-1]
    return "../" * len(parts)


def head_block(prefix):
    return (
        f'{VENDOR_MARK}\n'
        f'<!-- Google Analytics 4 (insightbriefnews.com 웹 스트림) -->\n'
        f'<script async src="https://www.googletagmanager.com/gtag/js?id={GA4_ID}"></script>\n'
        f'<script>window.dataLayer=window.dataLayer||[];function gtag(){{dataLayer.push(arguments);}}'
        f'gtag("js",new Date());gtag("config","{GA4_ID}");</script>\n'
        f'<script src="{ONESIGNAL_SDK}" defer></script>\n'
        f'<script src="{prefix}assets/js/vendors.js?v={VENDORS_VER}" defer></script>\n'
        f'<link rel="stylesheet" href="{prefix}assets/css/widgets.css?v={WIDGETS_VER}">\n'
        f'<link rel="stylesheet" href="{prefix}assets/css/chat.css?v={CHAT_VER}">\n'
        f'{VENDOR_END}'
    )


def float_block(prefix):
    return (
        f'{FLOAT_MARK}\n'
        f'<script src="{prefix}assets/js/share-float.js?v={WIDGETS_VER}" defer></script>\n'
        f'{FLOAT_END}'
    )


def chat_block(prefix):
    return (
        f'{CHAT_MARK}\n'
        f'<script src="{prefix}assets/js/chat-float.js?v={CHAT_VER}" defer></script>\n'
        f'{CHAT_END}'
    )


def strip_block(src, start, end):
    return re.sub(r"\n*[ \t]*" + re.escape(start) + r".*?" + re.escape(end) + r"[ \t]*\n?", "\n", src, flags=re.S)


def inject(src, prefix="", share=False):
    """한 페이지 문자열에 공통 블록을 넣습니다(멱등). share=True 면 플로팅 공유 바까지."""
    src = strip_block(src, VENDOR_MARK, VENDOR_END)
    src = strip_block(src, FLOAT_MARK, FLOAT_END)
    src = strip_block(src, CHAT_MARK, CHAT_END)
    if "</head>" in src:
        src = src.replace("</head>", head_block(prefix) + "\n</head>", 1)
    elif "<body" in src:
        # head 가 없는 조각 문서 — body 앞에 둡니다.
        src = re.sub(r"(<body\b)", lambda m: head_block(prefix) + "\n" + m.group(1), src, count=1)
    if share and "</body>" in src:
        src = src.replace("</body>", float_block(prefix) + "\n</body>", 1)
    # 상담 위젯은 홈·소개·문의 등 모든 페이지(4개 언어)에 들어갑니다.
    if "</body>" in src:
        src = src.replace("</body>", chat_block(prefix) + "\n</body>", 1)
    return src


def wants_share(rel_path):
    rel_path = rel_path.replace(os.sep, "/")
    name = rel_path.split("/")[-1]
    if re.search(r"(^|/)(?:en|zh|ja/)?a/[^/]+\.html$", rel_path):
        return True
    return name in SHARE_PAGES


def all_html():
    for dirpath, dirnames, filenames in os.walk(ROOT):
        dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS]
        for name in filenames:
            if name.endswith(".html"):
                yield os.path.relpath(os.path.join(dirpath, name), ROOT)


def sync_all(check=False, quiet=False):
    changed = []
    seen = 0
    for rel in sorted(all_html()):
        path = os.path.join(ROOT, rel)
        try:
            with open(path, encoding="utf-8") as f:
                src = f.read()
        except OSError:
            continue
        seen += 1
        new = inject(src, prefix_for(rel), share=wants_share(rel))
        if new != src:
            changed.append(rel)
            if not check:
                with open(path, "w", encoding="utf-8") as f:
                    f.write(new)
    if not quiet:
        print(f"  공통 스크립트: {seen}개 페이지 중 {len(changed)}개 반영" + (" (확인만)" if check else ""))
        for rel in changed[:8]:
            print(f"    - {rel}")
        if len(changed) > 8:
            print(f"    … 외 {len(changed) - 8}개")
    return changed


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--check", action="store_true")
    args = ap.parse_args()
    changed = sync_all(check=args.check)
    if args.check and changed:
        sys.exit(1)


if __name__ == "__main__":
    main()
