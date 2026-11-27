#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""상단 내비게이션(4개 대표 메뉴 드롭다운)의 단일 정의.

  · 모든 페이지(한국어 · /en/ · /zh/ · /ja/ · /a/ 기사 · tax.html · law.html)가
    같은 마크업을 쓰도록 여기서만 내용을 고칩니다.
  · tools/apply_nav.py       — 이미 있는 HTML 파일 전체에 반영
  · tools/i18n_pages.py      — /en/ /zh/ /ja/ 페이지를 만들 때 반영
  · tools/build_tax_pages.py — 국가별 세무·결산 페이지를 만들 때 반영
  · tools/build_sitemap_page.py — 사이트맵 페이지를 만들 때 반영

구조 (2026-11-24 재배치: 관련 기능끼리 묶어 한눈에 찾도록)
  그룹 4개 = 뉴스·리포트 / 무역·조달·시황 / 세무·법률·생활 / 안내·사이트맵

  · href 는 페이지 기준 상대 경로(prefix 를 붙여 완성)로 적습니다.
  · /en/ /zh/ /ja/ 에서는 한글이 한 글자도 남지 않도록 언어별 라벨을 모두 적어 둡니다.
  · global.html#portal 같은 해시 주소는 페이지 JS 가 해당 탭을 열어 줍니다
    (assets/js/global.js · assets/js/biz.js 의 hashchange 처리).
  · 무역서식 3종(PI·CI·PL)은 따로 바로가기를 두지 않고, 기존 무역서식이 있는
    biz.html ⑤ 무역서식(biz.html#trade)으로 들어가는 메뉴 한 줄로 합쳤습니다.
    그 안에서 PI·CI·PL 세 서식이 한 화면에 나란히 열립니다(2026-11-26 사용자 요청).
"""

# --- 그룹 정의 ---------------------------------------------------------------
# key, href(단독 링크일 때), label{언어}, items[{key, href, label{언어}}]
GROUPS = [
    {
        "key": "news",
        "label": {"ko": "뉴스·리포트", "en": "News", "zh": "新闻·报告", "ja": "ニュース"},
        "items": [
            {"key": "all", "href": "index.html",
             "label": {"ko": "전체 기사", "en": "All stories", "zh": "全部报道", "ja": "すべての記事"}},
            {"key": "ai", "href": "index.html?cat=ai",
             "label": {"ko": "AI·테크", "en": "AI & Tech", "zh": "AI·科技", "ja": "AI・テック"}},
            {"key": "economy", "href": "index.html?cat=economy",
             "label": {"ko": "경제·금융", "en": "Economy & Finance", "zh": "经济·金融", "ja": "経済・金融"}},
            {"key": "trade", "href": "index.html?cat=trade",
             "label": {"ko": "무역·원자재", "en": "Trade & Commodities", "zh": "贸易·原材料", "ja": "貿易・原材料"}},
            {"key": "fire", "href": "index.html?cat=fire",
             "label": {"ko": "재난·안전", "en": "Disaster & Safety", "zh": "灾难·安全", "ja": "災害・安全"}},
            {"key": "world", "href": "index.html?cat=world",
             "label": {"ko": "국제·지정학", "en": "World & Geopolitics", "zh": "国际·地缘", "ja": "国際・地政学"}},
            {"key": "property", "href": "index.html?cat=property",
             "label": {"ko": "부동산·생활세금", "en": "Property & Tax", "zh": "房产·个税", "ja": "不動産・税金"}},
            {"key": "energy", "href": "index.html?cat=energy",
             "label": {"ko": "에너지·전력·기후", "en": "Energy & Climate", "zh": "能源·气候", "ja": "エネルギー・気候"}},
            {"key": "health", "href": "index.html?cat=health",
             "label": {"ko": "바이오·헬스", "en": "Health & Bio", "zh": "生物·健康", "ja": "バイオ・健康"}},
            {"key": "culture", "href": "index.html?cat=culture",
             "label": {"ko": "K-컬쳐·엔터", "en": "K-Culture", "zh": "韩流·文化", "ja": "Kカルチャー"}},
            {"key": "weekly", "href": "index.html?cat=investigative",
             "label": {"ko": "주간 탐사보도", "en": "Weekly investigations", "zh": "每周调查报道", "ja": "週刊調査報道"}},
        ],
    },
    {
        "key": "trade",
        "label": {"ko": "무역·조달·시황", "en": "Trade & Procurement",
                  "zh": "贸易·采购·行情", "ja": "貿易・調達・市況"},
        "items": [
            # 무역서식 3종 — ⑤ 무역서식 한 곳(PI·CI·PL 카드가 나란히 있는 화면)으로.
            {"key": "tdoc", "href": "biz.html#trade",
             "label": {"ko": "무역서식 (PI·CI·PL)", "en": "Trade documents (PI·CI·PL)",
                       "zh": "贸易单据 (PI·CI·PL)", "ja": "貿易書式 (PI·CI·PL)"}},
            {"key": "freight", "href": "freight.html",
             "label": {"ko": "해상운임·물류비 비교", "en": "Freight & landing cost",
                       "zh": "海运运价·物流成本", "ja": "海上運賃・物流コスト"}},
            {"key": "sourcing", "href": "sourcing.html",
             "label": {"ko": "글로벌 소싱·도착원가 계산기", "en": "Global sourcing & landed cost",
                       "zh": "全球采购·到岸成本计算", "ja": "グローバル調達・着地原価計算"}},
            {"key": "market", "href": "market.html",
             "label": {"ko": "원자재·환율 시황판", "en": "Commodities & FX board",
                       "zh": "原材料·汇率行情板", "ja": "原材料・為替市況板"}},
            {"key": "portal", "href": "global.html#portal",
             "label": {"ko": "조달청·기업검증 포털", "en": "Procurement & company checks",
                       "zh": "采购厅·企业验证门户", "ja": "調達庁・企業審査ポータル"}},
            {"key": "email", "href": "global.html#email",
             "label": {"ko": "무역 이메일", "en": "Trade email writer",
                       "zh": "贸易邮件撰写", "ja": "貿易メール作成"}},
            {"key": "trip", "href": "global.html#trip",
             "label": {"ko": "출장 허브", "en": "Business trip hub",
                       "zh": "出差中心", "ja": "出張ハブ"}},
            {"key": "cost", "href": "biz.html#cost",
             "label": {"ko": "마진·원가·자금 계산기", "en": "Margin, cost & cash calculator",
                       "zh": "利润·成本·资金计算器", "ja": "粗利・原価・資金計算"}},
            {"key": "mfgcost", "href": "mfg-cost.html",
             "label": {"ko": "제조·외주 원가 산출기", "en": "Make-or-buy cost calculator",
                       "zh": "自制·外协成本计算", "ja": "内製・外注 原価計算"}},
            {"key": "resell", "href": "resell.html",
             "label": {"ko": "직구·중고 리셀 마진 계산기", "en": "Resell margin calculator",
                       "zh": "海淘·二手转售利润计算", "ja": "海外購入・中古リセール粗利計算"}},
            {"key": "seller", "href": "seller.html",
             "label": {"ko": "셀러·마케터 툴", "en": "Seller & marketer tools",
                       "zh": "卖家·营销工具", "ja": "セラー・マーケター向けツール"}},
            {"key": "review", "href": "review-reply.html",
             "label": {"ko": "리뷰 답글 생성기", "en": "Review reply generator",
                       "zh": "评论回复生成器", "ja": "レビュー返信ジェネレーター"}},
            {"key": "exhibitions", "href": "exhibitions.html",
             "label": {"ko": "글로벌 전시회 캘린더", "en": "Global exhibition calendar",
                       "zh": "全球展会日历", "ja": "世界の展示会カレンダー"}},
        ],
    },
    {
        "key": "life",
        "label": {"ko": "세무·법률·툴", "en": "Tax, Law & Tools", "zh": "税务·法律·工具", "ja": "税務・法律・ツール"},
        "items": [
            {"key": "tax", "href": "tax.html",
             "label": {"ko": "세금·연봉·건보 계산기", "en": "Tax, salary & health insurance",
                       "zh": "税金·年薪·健康保险", "ja": "税金・年収・社会保険"}},
            {"key": "salary", "href": "salary.html",
             "label": {"ko": "급여·최저임금·4대보험", "en": "Payroll, minimum wage & insurance",
                       "zh": "工资·最低工资·四大保险", "ja": "給与・最低賃金・社会保険"}},
            {"key": "insurance", "href": "insurance.html",
             "label": {"ko": "실손·자동차보험 계산기", "en": "Indemnity & car insurance",
                       "zh": "实损·车险计算器", "ja": "実損・自動車保険計算"}},
            {"key": "law", "href": "law.html",
             "label": {"ko": "법률·계약서·내용증명", "en": "Contracts & demand letters",
                       "zh": "法律·合同·催告书", "ja": "法律・契約書・内容証明"}},
            {"key": "forms", "href": "forms.html",
             "label": {"ko": "서식·전자서명 138종", "en": "Forms & e-signature (138)",
                       "zh": "表单·电子签名 138种", "ja": "書式・電子署名 138種"}},
            # 생활·엔터테인먼트 도구는 한 단계 안쪽으로 — 경제·무역 전문 매체의 메뉴 무게를 덜어냅니다.
            {"key": "util-head", "href": None,
             "group": {"ko": "생활·유틸리티 툴", "en": "Life & utility tools",
                       "zh": "生活·实用工具", "ja": "生活・ユーティリティツール"}},
            {"key": "saju", "href": "saju.html",
             "label": {"ko": "만세력·신년운세", "en": "Saju & new-year fortune",
                       "zh": "四柱·新年运势", "ja": "四柱推命・新年占い"}},
            {"key": "lotto", "href": "lotto.html",
             "label": {"ko": "로또 번호 생성기", "en": "Lotto number generator",
                       "zh": "彩票号码生成器", "ja": "ロト番号生成器"}},
            {"key": "music", "href": "music.html",
             "label": {"ko": "AI 음악·가사 생성기", "en": "AI music & lyric writer",
                       "zh": "AI 音乐·歌词生成器", "ja": "AI音楽・歌詞生成"}},
            {"key": "creator", "href": "creator.html",
             "label": {"ko": "블로그·쇼츠 스튜디오", "en": "Blog & Shorts studio",
                       "zh": "博客·短视频工作室", "ja": "ブログ・ショート制作"}},
            {"key": "style", "href": "style.html",
             "label": {"ko": "패션·스타일 추천", "en": "Style & outfit brief",
                       "zh": "穿搭·风格推荐", "ja": "ファッション・スタイル提案"}},
            {"key": "links", "href": "links.html",
             "label": {"ko": "추천 상품·용품", "en": "Gear we use",
                       "zh": "推荐商品·用品", "ja": "おすすめ商品・用品"}},
        ],
    },
    {
        "key": "guide",
        "label": {"ko": "안내·사이트맵", "en": "Guide & Sitemap",
                  "zh": "介绍·网站地图", "ja": "案内・サイトマップ"},
        "items": [
            {"key": "sitemap", "href": "sitemap.html",
             "label": {"ko": "사이트맵", "en": "Sitemap", "zh": "网站地图", "ja": "サイトマップ"}},
            {"key": "about", "href": "about.html",
             "label": {"ko": "매체 소개", "en": "About us", "zh": "媒体介绍", "ja": "媒体紹介"}},
            {"key": "ad", "href": "ad.html",
             "label": {"ko": "광고·제휴", "en": "Advertise & partner", "zh": "广告·合作", "ja": "広告・提携"}},
            {"key": "contact", "href": "contact.html",
             "label": {"ko": "제보·문의", "en": "Tips & contact", "zh": "爆料·咨询", "ja": "情報提供・お問い合わせ"}},
        ],
    },
]

# --- 현재 페이지 표시 ---------------------------------------------------------
# 파일 이름 → (그룹 key, 하위 key)
FILE_ACTIVE = {
    "index.html": ("news", "all"),
    "article.html": ("news", None),
    "market.html": ("trade", "market"),
    "freight.html": ("trade", "freight"),
    "sourcing.html": ("trade", "sourcing"),
    "mfg-cost.html": ("trade", "mfgcost"),
    "resell.html": ("trade", "resell"),
    "global.html": ("trade", "email"),
    "biz.html": ("trade", None),
    "seller.html": ("trade", "seller"),
    "review-reply.html": ("trade", "review"),
    "exhibitions.html": ("trade", "exhibitions"),
    "experts.html": ("trade", None),
    "tax.html": ("life", "tax"),
    "salary.html": ("life", "salary"),
    "insurance.html": ("life", "insurance"),
    "law.html": ("life", "law"),
    "forms.html": ("life", "forms"),
    "saju.html": ("life", "saju"),
    "lotto.html": ("life", "lotto"),
    "music.html": ("life", "music"),
    "style.html": ("life", "style"),
    "links.html": ("life", "links"),
    "sitemap.html": ("guide", "sitemap"),
    "about.html": ("guide", "about"),
    "ad.html": ("guide", "ad"),
    "contact.html": ("guide", "contact"),
}

LANGS = ("ko", "en", "zh", "ja")

CARET = ('<svg class="nav-caret" viewBox="0 0 10 6" aria-hidden="true" focusable="false">'
         '<path d="M1 1.2 5 5l4-3.8" fill="none" stroke="currentColor" stroke-width="1.4" '
         'stroke-linecap="round" stroke-linejoin="round"></path></svg>')


def label(item, lang):
    return item["label"].get(lang) or item["label"]["ko"]


def esc(value):
    """마크업·속성에 넣을 라벨 이스케이프(& → &amp; 등)."""
    return (str(value).replace("&", "&amp;").replace("<", "&lt;")
            .replace(">", "&gt;").replace('"', "&quot;"))


def render(lang="ko", prefix="", active=None):
    """상단 내비 <ul id="site-nav"> 전체 마크업을 돌려줍니다.

    lang   : ko | en | zh | ja
    prefix : '..'/'../..' 등 상대 경로 접두사 ('' 이면 같은 폴더, 끝의 '/' 는 있어도 없어도 됩니다)
    active : (그룹 key, 하위 key) — 없으면 표시하지 않음
    """
    if lang not in LANGS:
        lang = "ko"
    prefix = (prefix or "").strip()
    if prefix and not prefix.endswith("/"):
        prefix += "/"
    act_group, act_sub = (active or (None, None))

    out = ["<ul class=\"nav\" id=\"site-nav\">"]
    for g in GROUPS:
        key = g["key"]
        g_on = (key == act_group)
        if not g["items"]:
            cls = "nav-top is-active" if g_on else "nav-top"
            cur = " aria-current=\"page\"" if g_on else ""
            out.append("      <li class=\"nav-group nav-group-single\" data-nav=\"%s\">" % key)
            out.append("        <a class=\"%s\" href=\"%s%s\"%s>%s</a>"
                       % (cls, prefix, g["href"], cur, esc(label(g, lang))))
            out.append("      </li>")
            continue

        pid = "nav-" + key
        top_cls = "nav-top is-active" if g_on else "nav-top"
        out.append("      <li class=\"nav-group\" data-nav=\"%s\">" % key)
        out.append("        <button class=\"%s\" type=\"button\" aria-expanded=\"false\" "
                   "aria-haspopup=\"true\" aria-controls=\"%s\">%s%s</button>"
                   % (top_cls, pid, esc(label(g, lang)), CARET))
        out.append("        <div class=\"nav-panel\" id=\"%s\" role=\"group\" aria-label=\"%s\">"
                   % (pid, esc(label(g, lang))))
        for it in g["items"]:
            head = it.get("group")
            if head:
                out.append("          <span class=\"nav-head\">%s</span>"
                           % esc(head.get(lang) or head["ko"]))
            # href 가 없는 항목은 하위 묶음 제목(nav-head)만 찍고 건너뜁니다.
            if not it.get("href"):
                continue
            on = g_on and it["key"] == act_sub
            a_cls = " class=\"is-active\"" if on else ""
            cur = " aria-current=\"page\"" if on else ""
            badge = it.get("badge")
            text = ("<span class=\"nav-badge\">%s</span>" % esc(badge) if badge else "") + esc(label(it, lang))
            out.append("          <a href=\"%s%s\" data-nav-key=\"%s\"%s%s>%s</a>"
                       % (prefix, it["href"], it["key"], a_cls, cur, text))
        out.append("        </div>")
        out.append("      </li>")
    out.append("    </ul>")
    return "\n".join(out)


def active_for(path_rel):
    """페이지 상대 경로('tax.html', 'en/a/x.html', 'a/x.html') → active 튜플."""
    name = path_rel.split("/")[-1]
    if "/a/" in "/" + path_rel:
        return ("news", None)
    return FILE_ACTIVE.get(name, (None, None))


if __name__ == "__main__":
    import sys
    lang = sys.argv[1] if len(sys.argv) > 1 else "ko"
    print(render(lang, "", ("life", "tax")))
