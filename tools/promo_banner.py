#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""빈 광고 박스('이 자리에 광고하기 300×250')를 자체 프로모션 배너로 바꿉니다.

  python3 tools/promo_banner.py           # 한국어 HTML 의 <aside class="ad …"> 교체(멱등)
  python3 tools/promo_banner.py --check   # 바뀔 파일만 확인

애드센스 승인 전에는 빈 광고 자리를 두지 않는다는 2026-11-26 지시에 따라
  · 비즈니스·무역 도구 페이지 → B2B 소싱·검수 의뢰(크몽 #873859·#873880)
  · 생활·급여 도구 페이지   → 무료 주간 브리핑 구독
배너로 대체합니다. 문구는 한국어 원본에만 넣고, /en/ /zh/ /ja/ 는
tools/i18n_pages.py 가 사전(data/i18n/*.json)으로 번역합니다.
"""
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

AD_ASIDE_RE = re.compile(r'[ \t]*<aside class="ad[^"]*"[^>]*>.*?</aside>\n?', re.S)

B2B_TXT = {
    "kicker": "B2B · SOURCING",
    "title": "수입 소싱·검수, 원가 진단 의뢰",
    "desc": "재생원료 단가·리스크 1차 진단과 수입 계약·선적·품질 검수 대행. 크몽에서 상담합니다.",
    "cta1": "단가·리스크 진단 #873859",
    "cta2": "계약·검수 대행 #873880",
    "note": "영업일 1~2일 내 회신",
}
NL_TXT = {
    "kicker": "FREE WEEKLY BRIEF",
    "title": "무료 주간 브리핑 구독",
    "desc": "매주 월요일, 경제·금융·무역·원자재에서 확인된 숫자와 일정만 5분 분량으로 정리해 보냅니다.",
    "cta": "이메일로 받기",
    "note": "광고 없음 · 언제든 해지",
}

# 페이지별 배너 종류
KIND = {
    "biz.html": "b2b",
    "global.html": "b2b",
    "seller.html": "b2b",
    "experts.html": "b2b",
    "exhibitions.html": "b2b",
    "freight.html": "b2b",
    "sourcing.html": "b2b",
    "market.html": "b2b",
    "saju.html": "nl",
    "lotto.html": "nl",
    "salary.html": "nl",
    "insurance.html": "nl",
    "tax.html": "nl",
    "law.html": "nl",
    "forms.html": "nl",
    "music.html": "nl",
    "style.html": "nl",
    "links.html": "nl",
}
DEFAULT_KIND = "nl"


def b2b_html():
    t = B2B_TXT
    return (
        '<aside class="ib-promo ib-promo--b2b" aria-label="B2B 소싱·수입 원가 의뢰">\n'
        f'      <span class="ib-promo-kicker">{t["kicker"]}</span>\n'
        f'      <h3 class="ib-promo-title">{t["title"]}</h3>\n'
        f'      <p class="ib-promo-desc">{t["desc"]}</p>\n'
        '      <span class="ib-promo-acts">'
        f'<a class="ib-promo-cta" href="https://kmong.com/gig/873859" target="_blank" rel="noopener noreferrer">{t["cta1"]}</a>'
        f'<a class="ib-promo-cta ib-promo-cta--ghost" href="https://kmong.com/gig/873880" target="_blank" rel="noopener noreferrer">{t["cta2"]}</a>'
        "</span>\n"
        f'      <span class="ib-promo-note">{t["note"]}</span>\n'
        "    </aside>\n"
    )


def nl_html():
    t = NL_TXT
    return (
        '<aside class="ib-promo ib-promo--nl" aria-label="무료 주간 브리핑 구독">\n'
        f'      <span class="ib-promo-kicker">{t["kicker"]}</span>\n'
        f'      <h3 class="ib-promo-title">{t["title"]}</h3>\n'
        f'      <p class="ib-promo-desc">{t["desc"]}</p>\n'
        f'      <span class="ib-promo-acts"><a class="ib-promo-cta" href="index.html#subscribe">{t["cta"]}</a></span>\n'
        f'      <span class="ib-promo-note">{t["note"]}</span>\n'
        "    </aside>\n"
    )


def build(check=False):
    changed = []
    for name in sorted(os.listdir(ROOT)):
        if not name.endswith(".html"):
            continue
        path = os.path.join(ROOT, name)
        with open(path, encoding="utf-8") as f:
            src = f.read()
        if 'class="ad' not in src:
            continue
        block = b2b_html() if KIND.get(name, DEFAULT_KIND) == "b2b" else nl_html()
        new = AD_ASIDE_RE.sub(block, src)
        if new != src:
            changed.append(name)
            if not check:
                with open(path, "w", encoding="utf-8") as f:
                    f.write(new)
    print(f"  프로모션 배너: {len(changed)}개 페이지 교체" + (" (확인만)" if check else ""))
    for n in changed:
        print(f"    - {n}")
    return changed


if __name__ == "__main__":
    build(check="--check" in sys.argv)
