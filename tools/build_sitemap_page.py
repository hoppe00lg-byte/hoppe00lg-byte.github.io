#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""사이트맵 페이지를 만듭니다: sitemap.html · /en/sitemap.html · /zh/sitemap.html · /ja/sitemap.html

  python3 tools/build_sitemap_page.py            # 4개국어 모두
  python3 tools/build_sitemap_page.py --lang en  # 한 언어만

· 페이지 내용(지면 목록·설명)은 이 파일의 SECTIONS 하나에 모여 있고,
  한국어·영어·중국어·일본어 문구를 각각 적어 둡니다(기계번역을 쓰지 않습니다).
· 상단 내비는 tools/nav_spec.py 정의를 그대로 씁니다.
· 최신 기사 목록은 data/articles*.json 에서 그때그때 12편을 읽어 채웁니다.
· tools/build.py 가 기사 발행 뒤 자동으로 부르므로, 새 기사가 올라가면
  4개국어 사이트맵의 최신 기사 목록도 함께 갱신됩니다.
"""
import argparse
import datetime
import html
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import nav_spec
import apply_nav
from i18n_core import article_locales

ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
DATA = os.path.join(ROOT, "data")
BASE = "https://insightbriefnews.com"
PAGE = "sitemap.html"
NAV_CSS_VER = apply_nav.NAV_CSS_VER
NAV_JS_VER = apply_nav.NAV_JS_VER
I18N_VER = "20261124a"
CSS_VER = "20261125a"

LANGS = ["ko", "en", "zh", "ja"]
DIRS = {"ko": "", "en": "en", "zh": "zh", "ja": "ja"}
HTML_LANG = {"ko": "ko", "en": "en", "zh": "zh-Hans", "ja": "ja"}
OG_LOCALE = {"ko": "ko_KR", "en": "en_US", "zh": "zh_CN", "ja": "ja_JP"}
SWITCH = {"ko": "KO", "en": "EN", "zh": "ZH", "ja": "JA"}
SWITCH_LANG = {"ko": "ko", "en": "en", "zh": "zh-Hans", "ja": "ja"}

LATEST_COUNT = 12


def e(value):
    return html.escape(str(value), quote=True)


# --- 페이지 문구 ------------------------------------------------------------
TEXT = {
    "ko": {
        "title": "사이트맵 — 전체 지면·무료 도구 한눈에 | INSIGHT BRIEF",
        "desc": "인사이트 브리프의 모든 지면과 무료 도구를 한 장에. 뉴스·리포트 5개 섹션, 조달청·기업검증 포털, 무역 이메일, 출장 허브, 마진·원가 계산기, 전시회 캘린더, 세무·법률·생활 도구, 최신 기사 목록.",
        "kicker": "SITEMAP · 전체 지면 안내",
        "h1": "사이트맵",
        "lead": "인사이트 브리프의 모든 지면과 무료 도구를 한 장에 모았습니다. 메뉴 안쪽에 있던 조달청·기업검증 포털, 무역 이메일, 출장 허브, 마진·원가 계산기까지 여기서 바로 찾아갈 수 있습니다.",
        "jump": "바로 가기",
        "title_note": "기사·도구 주소까지 그대로 적었습니다. 즐겨찾기나 공유에 쓰세요.",
        "latest_h2": "최신 발행 기사",
        "latest_desc": "가장 최근에 발행한 12편입니다. 분류별로 보려면 위의 뉴스·리포트 섹션을 쓰세요.",
        "latest_more": "전체 기사 보기",
        "xml_note": "검색엔진과 리더기를 위한 전체 주소 목록은 <a href=\"sitemap.xml\">XML 사이트맵(sitemap.xml)</a> 과 <a href=\"feed.xml\">RSS 피드</a> 에 있습니다. 이 페이지의 지면 목록은 기사 발행 때마다 자동으로 갱신됩니다.",
        "lang_h2": "다른 언어로 보기",
        "lang_desc": "같은 지면을 영어·중국어·일본어로도 열 수 있습니다.",
        "skip": "본문 바로가기",
        "home": "홈으로",
        "tip": "제보하기",
        "homeAria": "INSIGHT BRIEF 홈으로",
        "search": "키워드로 검색",
        "searchAria": "기사 검색",
        "searchOpen": "검색 열기",
        "brandKo": "인사이트 브리프",
        "tagline": "독립 경제·탐사 리서치 웹진",
        "slogan": "숫자 뒤의 맥락을 읽습니다",
    },
    "en": {
        "title": "Sitemap — every page and free tool | INSIGHT BRIEF",
        "desc": "Every page and free tool of INSIGHT BRIEF in one place: five news desks, the procurement and company-check portal, trade email writer, business trip hub, margin and cost calculators, exhibition calendar, tax and law tools, and the latest stories.",
        "kicker": "SITEMAP · ALL PAGES",
        "h1": "Sitemap",
        "lead": "Every desk and every free tool of INSIGHT BRIEF on one page — including the ones that used to sit deep inside a menu: the procurement and company-check portal, the trade email writer, the business trip hub and the margin and cost calculators.",
        "jump": "Jump to",
        "title_note": "Paths are written out exactly as they are. Use them for bookmarks or sharing.",
        "latest_h2": "Latest stories",
        "latest_desc": "The twelve most recent reports. For a single desk, use the news section above.",
        "latest_more": "Browse all stories",
        "xml_note": "The full list of addresses for search engines and readers is in the <a href=\"sitemap.xml\">XML sitemap</a> and the <a href=\"feed.xml\">RSS feed</a>. This page refreshes its lists every time a story is published.",
        "lang_h2": "Other languages",
        "lang_desc": "The same pages are available in Korean, Chinese and Japanese.",
        "skip": "Skip to content",
        "home": "Home",
        "tip": "Send a tip",
        "homeAria": "INSIGHT BRIEF home",
        "search": "Search stories",
        "searchAria": "Search stories",
        "searchOpen": "Open search",
        "brandKo": "Insight Brief",
        "tagline": "Independent economics & investigative research magazine",
        "slogan": "We read the context behind the numbers",
    },
    "zh": {
        "title": "网站地图 — 全部页面与免费工具 | INSIGHT BRIEF",
        "desc": "把 INSIGHT BRIEF 的全部页面与免费工具集中在一页：五个新闻版面、采购厅·企业验证门户、贸易邮件撰写、出差中心、利润·成本计算器、展会日历、税务与法律工具，以及最新报道。",
        "kicker": "SITEMAP · 全部页面",
        "h1": "网站地图",
        "lead": "把 INSIGHT BRIEF 的所有版面和免费工具集中在一页。以前藏在菜单深处的采购厅·企业验证门户、贸易邮件、出差中心、利润·成本计算器，也能从这里直接打开。",
        "jump": "快捷跳转",
        "title_note": "页面把地址原样写出，可直接用于收藏或分享。",
        "latest_h2": "最新报道",
        "latest_desc": "最近发布的 12 篇报道。按分类查看请使用上方的新闻·报告版面。",
        "latest_more": "查看全部报道",
        "xml_note": "面向搜索引擎与阅读器的完整地址列表在 <a href=\"sitemap.xml\">XML 网站地图</a> 与 <a href=\"feed.xml\">RSS 订阅</a> 中。本页面的版面列表会在每次发稿后自动更新。",
        "lang_h2": "其他语言",
        "lang_desc": "同样的版面也可以用韩语、英语、日语打开。",
        "skip": "跳到正文",
        "home": "首页",
        "tip": "提供线索",
        "homeAria": "INSIGHT BRIEF 首页",
        "search": "搜索关键词",
        "searchAria": "搜索报道",
        "searchOpen": "打开搜索",
        "brandKo": "洞察简报",
        "tagline": "独立经济·调查报告媒体",
        "slogan": "读懂数字背后的脉络",
    },
    "ja": {
        "title": "サイトマップ — 全ページと無料ツール | INSIGHT BRIEF",
        "desc": "INSIGHT BRIEF の全ページと無料ツールを1ページに。5つのニュース面、調達庁・企業審査ポータル、貿易メール作成、出張ハブ、粗利・原価計算、展示会カレンダー、税務・法律ツール、最新記事まで。",
        "kicker": "SITEMAP · 全ページ案内",
        "h1": "サイトマップ",
        "lead": "INSIGHT BRIEF のすべての紙面と無料ツールを1ページにまとめました。これまでメニューの奥にあった調達庁・企業審査ポータル、貿易メール、出張ハブ、粗利・原価計算もここから直接開けます。",
        "jump": "ジャンプ",
        "title_note": "アドレスはそのまま記載しています。ブックマークや共有にどうぞ。",
        "latest_h2": "最新の記事",
        "latest_desc": "直近に公開した12本です。分野別に見るには上のニュース面をご利用ください。",
        "latest_more": "すべての記事を見る",
        "xml_note": "検索エンジンとリーダー向けの全アドレス一覧は <a href=\"sitemap.xml\">XML サイトマップ</a> と <a href=\"feed.xml\">RSS フィード</a> にあります。このページの一覧は記事の公開ごとに自動で更新されます。",
        "lang_h2": "他の言語",
        "lang_desc": "同じ紙面を韓国語・英語・中国語でも開けます。",
        "skip": "本文へ",
        "home": "ホーム",
        "tip": "情報提供",
        "homeAria": "INSIGHT BRIEF ホーム",
        "search": "キーワードで検索",
        "searchAria": "記事を検索",
        "searchOpen": "検索を開く",
        "brandKo": "インサイト・ブリーフ",
        "tagline": "独立系・経済調査メディア",
        "slogan": "数字の裏側の文脈を読む",
    },
}


# --- 지면 목록 --------------------------------------------------------------
# href 는 언어 폴더 안에서의 상대 경로(모든 언어 페이지가 같은 모양).
# tool=True 는 계산기·생성기 같은 '바로 쓰는 도구'로 표시합니다.
SECTIONS = [
    {
        "id": "news",
        "no": "01",
        "title": {"ko": "뉴스·리포트", "en": "News & reports",
                  "zh": "新闻·报告", "ja": "ニュース・レポート"},
        "desc": {"ko": "경제·금융, 무역·원자재, AI·테크, 재난·안전 현장을 데이터와 인터뷰로 추적합니다.",
                 "en": "Economy, trade and commodities, AI and tech, and disaster and safety — tracked with data and interviews.",
                 "zh": "以数据和访谈追踪经济·金融、贸易·原材料、AI·科技、灾难·安全现场。",
                 "ja": "経済・金融、貿易・原材料、AI・テック、災害・安全の現場をデータとインタビューで追います。"},
        "items": [
            {"href": "index.html",
             "title": {"ko": "전체 기사", "en": "All stories", "zh": "全部报道", "ja": "すべての記事"},
             "desc": {"ko": "발행한 모든 리포트를 최신순으로 봅니다.",
                      "en": "Every report we have published, newest first.",
                      "zh": "按最新顺序查看已发布的全部报道。",
                      "ja": "公開した全レポートを新しい順に。"},
             "tag": {"ko": "전체", "en": "All", "zh": "全部", "ja": "すべて"}},
            {"href": "index.html?cat=ai",
             "title": {"ko": "AI·테크", "en": "AI & Tech", "zh": "AI·科技", "ja": "AI・テック"},
             "desc": {"ko": "기술이 바꾸는 일의 방식 — 모델·반도체·자동화 현장.",
                      "en": "How technology changes the way work is done: models, chips, automation.",
                      "zh": "技术如何改变工作方式：模型、芯片、自动化现场。",
                      "ja": "技術が仕事のやり方をどう変えるか。モデル・半導体・自動化の現場。"},
             "tag": {"ko": "분류", "en": "Desk", "zh": "分类", "ja": "分野"}},
            {"href": "index.html?cat=economy",
             "title": {"ko": "경제·금융", "en": "Economy & Finance", "zh": "经济·金融", "ja": "経済・金融"},
             "desc": {"ko": "금리·물가·가계의 숫자를 데이터로 읽습니다.",
                      "en": "Rates, prices and household numbers, read through data.",
                      "zh": "用数据读懂利率、物价与家庭收支。",
                      "ja": "金利・物価・家計の数字をデータで読みます。"},
             "tag": {"ko": "분류", "en": "Desk", "zh": "分类", "ja": "分野"}},
            {"href": "index.html?cat=trade",
             "title": {"ko": "무역·원자재", "en": "Trade & Commodities", "zh": "贸易·原材料", "ja": "貿易・原材料"},
             "desc": {"ko": "원료와 공급망의 흐름, 수출입 판가를 다룹니다.",
                      "en": "Raw materials, supply chains and export pricing.",
                      "zh": "原材料与供应链的走向、进出口价格。",
                      "ja": "原材料とサプライチェーンの流れ、輸出入価格。"},
             "tag": {"ko": "분류", "en": "Desk", "zh": "分类", "ja": "分野"}},
            {"href": "index.html?cat=fire",
             "title": {"ko": "재난·안전", "en": "Disaster & Safety", "zh": "灾难·安全", "ja": "災害・安全"},
             "desc": {"ko": "소방 현장에서 보는 재난 예방과 대응.",
                      "en": "Disaster prevention and response seen from the fire ground.",
                      "zh": "从消防现场看灾难预防与应对。",
                      "ja": "消防現場から見る災害予防と対応。"},
             "tag": {"ko": "분류", "en": "Desk", "zh": "分类", "ja": "分野"}},
            {"href": "index.html?cat=investigative",
             "title": {"ko": "주간 탐사보도", "en": "Weekly investigations", "zh": "每周调查报道", "ja": "週刊調査報道"},
             "desc": {"ko": "기록과 인터뷰로 확인한 탐사보도를 모았습니다.",
                      "en": "Investigations confirmed by records and interviews, collected each week.",
                      "zh": "以记录和访谈确认的调查报道合集。",
                      "ja": "記録とインタビューで確認した調査報道をまとめました。"},
             "tag": {"ko": "주간", "en": "Weekly", "zh": "每周", "ja": "週刊"}},
        ],
    },
    {
        "id": "trade",
        "no": "02",
        "title": {"ko": "무역·조달·시황", "en": "Trade, procurement & markets",
                  "zh": "贸易·采购·行情", "ja": "貿易・調達・市況"},
        "desc": {"ko": "원료 값부터 조달청 입찰·기업 검증, 수출입 원가까지 한 흐름으로 이어 봅니다.",
                 "en": "From raw material prices to public procurement, company checks and landed cost.",
                 "zh": "从原材料价格到采购厅投标、企业验证、进出口成本，一条线看完。",
                 "ja": "原材料価格から調達庁入札、企業審査、輸出入原価まで一つの流れで。"},
        "items": [
            {"href": "biz.html#trade", "tool": True,
             "title": {"ko": "무역서식 3종 (PI·CI·PL)", "en": "Trade documents (PI · CI · PL)",
                       "zh": "贸易单据 3 种（PI · CI · PL）", "ja": "貿易書式 3 種（PI · CI · PL）"},
             "desc": {"ko": "견적송장(PI)·상업송장(CI)·포장명세서(PL)를 사업자 툴 ⑤ 무역서식 한 화면에서. 고른 서식이 바로 열리고 영문 A4 한 장으로 인쇄·PDF 저장합니다.",
                      "en": "Proforma invoice, commercial invoice and packing list on one screen in the business toolkit. Pick one and print or save it as a single A4 page.",
                      "zh": "形式发票、商业发票、装箱单都在商业工具第⑤页一屏。选中即打开，英文A4一页打印或存为PDF。",
                      "ja": "見積送り状・商業送り状・パッキングリストを事業者ツール⑤の1画面に。選ぶと開き、英文A4 1枚で印刷・PDF保存できます。"},
             "tag": {"ko": "무역서식", "en": "Trade forms", "zh": "贸易单据", "ja": "貿易書式"}},
            {"href": "freight.html", "tool": True,
             "title": {"ko": "해상운임·수입물류비 비교", "en": "Freight & landing cost calculator",
                       "zh": "海运运价·进口物流成本比较", "ja": "海上運賃・輸入物流コスト比較"},
             "desc": {"ko": "부산·인천 출발 20ft·40ft·HQ 견적을 선사 3~4곳 나란히. O/F·BAF·도착지 비용·내륙운송·통관까지 합산해 최저가·차액·톤당 단가를 계산합니다.",
                      "en": "Compare quotes from up to four carriers ex-Busan or Incheon — 20ft, 40ft and HQ — with O/F, BAF, destination charges, haulage and customs added up.",
                      "zh": "把釜山、仁川出发的20ft、40ft、HQ报价放在一起比较3~4家船公司，合计海运费、BAF、目的港费用、陆运与报关，算出最低价、差额与每吨成本。",
                      "ja": "釜山・仁川発の20ft・40ft・HQ見積を船社3〜4社で並べて比較。O/F・BAF・仕向地費用・陸送・通関を合計し、最安値と差額、トン当たり単価を計算します。"},
             "tag": {"ko": "계산기", "en": "Calculator", "zh": "计算器", "ja": "計算"}},
            {"href": "sourcing.html", "tool": True,
             "title": {"ko": "글로벌 소싱·도착원가 계산기 (B2B·B2C·C2C)", "en": "Global sourcing & landed cost (B2B·B2C·C2C)",
                       "zh": "全球采购·到岸成本计算器（B2B·B2C·C2C）", "ja": "グローバル調達・着地原価計算（B2B·B2C·C2C）"},
             "desc": {"ko": "대량 수입(FCL·LCL·항공), 해외직구, 중고·한정판 거래를 한 화면에서. 관세·부가세·통관수수료·국내운송을 더한 집 앞 도착원가와 목록통관 150달러(미국 200달러) 판정, LookChem·1688·Amazon·eBay·메루카리 검색 바로가기.",
                      "en": "Bulk imports (FCL, LCL, air), overseas direct purchases and second-hand trades on one screen: duty, VAT, customs fees and haulage added into a delivered cost, with Korea's 150/200 USD list-clearance check and sourcing search shortcuts.",
                      "zh": "大宗进口（FCL·LCL·空运）、海淘直购、二手与限量交易一屏完成：合计关税、增值税、报关费与国内运输的到岸成本，并判定150美元（美国200美元）目录通关免税。",
                      "ja": "大口輸入（FCL・LCL・航空）、海外直購、中古・限定品取引を1画面で。関税・付加価値税・通関手数料・国内輸送を足した着地原価と、150ドル（米国200ドル）リスト通関の判定、調達検索の近道。"},
             "tag": {"ko": "계산기", "en": "Calculator", "zh": "计算器", "ja": "計算"}},
            {"href": "mfg-cost.html", "tool": True,
             "title": {"ko": "제조·외주 원가 산출기 (직접생산 vs 외주가공)", "en": "Make-or-buy cost calculator (in-house vs outsourced)",
                       "zh": "自制·外协成本计算器（自主生产 vs 外协加工）", "ja": "内製・外注 原価計算（自社生産 vs 外注加工）"},
             "desc": {"ko": "사출 성형 제품을 직접 생산할 때와 외주가공할 때의 개당 원가를 나란히. 수지 12종 프리셋, 금형 상각·캐비티·사이클타임·불량률·후가공·물류, 손익분기 수량(BEP), 수량 구간별 단가, CSV·PDF 산출서.",
                      "en": "Unit cost of an injection-moulded part made in-house versus outsourced: 12 resin presets, mould amortisation, cavity and cycle time, defect rate, post-processing and freight, with break-even quantity, unit cost by volume, CSV and PDF sheet.",
                      "zh": "注塑件自主生产与外协加工的单件成本对比：12 种树脂预设、模具摊销、模穴与成型周期、不良率、后加工与物流，并有盈亏平衡数量、各数量区间单价、CSV·PDF 测算表。",
                      "ja": "射出成形品を自社生産する場合と外注加工する場合の1個あたり原価を並べて比較。樹脂12種プリセット、金型償却・キャビティ・サイクルタイム・不良率・後加工・物流に加え、損益分岐数量（BEP）、数量帯別単価、CSV・PDF計算書。"},
             "tag": {"ko": "계산기", "en": "Calculator", "zh": "计算器", "ja": "計算"}},
            {"href": "resell.html", "tool": True,
             "title": {"ko": "해외직구·중고 리셀 마진 계산기", "en": "Resell margin calculator",
                       "zh": "海淘·二手转售利润计算器", "ja": "海外購入・中古リセール粗利計算"},
             "desc": {"ko": "매입가·배송비·관부가세·플랫폼 수수료·택배비를 넣으면 예상 정산액, 순수익, 마진율(ROI), 손익분기 매입가가 실시간으로 나옵니다. 크림·번개장터·네이버·당근·무신사 유즈드를 같은 판매가로 나란히 비교하고, 목표 마진을 내는 판매가까지 계산합니다.",
                      "en": "Enter the purchase price, shipping, duty and VAT, platform fee and courier fee to get the expected settlement, net profit, return on cost and break-even purchase price in real time, with KREAM, Bunjang, Naver, Danggeun and Musinsa Used compared at the same sale price.",
                      "zh": "输入采购价、运费、关税与增值税、平台手续费和快递费，实时得出预计结算额、净利润、成本回报率与盈亏平衡采购价，并在同一售价下比较 KREAM、闪电市场、Naver、Danggeun 与 Musinsa Used。",
                      "ja": "仕入価格・送料・関税と付加価値税・手数料・宅配料を入れると、見込み精算額・純利益・コスト利益率・損益分岐の仕入価格がすぐ出ます。KREAM・バンジャン・Naver・タンジュン・Musinsa Usedを同じ販売価格で比較できます。"},
             "tag": {"ko": "계산기", "en": "Calculator", "zh": "计算器", "ja": "計算"}},
            {"href": "market.html",
             "title": {"ko": "원자재·환율 시황판", "en": "Commodities & FX board",
                       "zh": "原材料·汇率行情板", "ja": "原材料・為替市況板"},
             "desc": {"ko": "유가·환율·금속·석유화학·해상운임·곡물 38종을 일간·주간·월간·연간으로.",
                      "en": "Oil, FX, metals, petrochemicals, freight and grain — 38 series by day, week, month and year.",
                      "zh": "原油、汇率、金属、石化、海运运价、谷物等38个品种，按日·周·月·年查看。",
                      "ja": "原油・為替・金属・石化・海運運賃・穀物38品目を日次・週次・月次・年次で。"},
             "tag": {"ko": "매일 갱신", "en": "Updated daily", "zh": "每日更新", "ja": "毎日更新"}},
            {"href": "global.html#portal",
             "title": {"ko": "조달청·기업검증 포털", "en": "Procurement & company checks",
                       "zh": "采购厅·企业验证门户", "ja": "調達庁・企業審査ポータル"},
             "desc": {"ko": "조달청 비축 방출가, 미국·중국·일본·EU 사업자 조회, 관세율·선적 휴무일.",
                      "en": "Korea's stockpile release prices, business-registry checks for the US, China, Japan and the EU, tariff rates and shipping holidays.",
                      "zh": "采购厅储备投放价，美国·中国·日本·EU 企业登记查询，关税税率与装运休假日。",
                      "ja": "調達庁の備蓄放出価格、米・中・日・EUの事業者照会、関税率・船積み休日。"},
             "tag": {"ko": "3번 탭", "en": "Tab 3", "zh": "第3个标签", "ja": "3番目のタブ"}},
            {"href": "global.html#email",
             "title": {"ko": "무역 이메일 자동 작성", "en": "Trade email writer",
                       "zh": "贸易邮件撰写", "ja": "貿易メール作成"},
             "desc": {"ko": "인콰이어리·견적·단가 협상·선적 독촉·클레임 9종을 4개국어 원어로.",
                      "en": "Inquiry, quotation, price negotiation, shipping reminder and claim — nine situations in four languages.",
                      "zh": "询价、报价、议价、催运、索赔等9种场景，4种语言原文。",
                      "ja": "引き合い・見積・価格交渉・船積み催促・クレームの9場面を4か国語の原文で。"},
             "tag": {"ko": "1번 탭", "en": "Tab 1", "zh": "第1个标签", "ja": "1番目のタブ"}},
            {"href": "global.html#trip",
             "title": {"ko": "출장 허브", "en": "Business trip hub", "zh": "出差中心", "ja": "出張ハブ"},
             "desc": {"ko": "출장지 13곳의 일비·면세 한도·단위 환산·호텔·항공 링크.",
                      "en": "Per-diem, duty-free limits, unit conversion, hotel and flight links for 13 destinations.",
                      "zh": "13个出差地的日津贴、免税额度、单位换算与酒店·航班链接。",
                      "ja": "出張先13か所の日当・免税限度・単位換算・ホテル・航空券リンク。"},
             "tag": {"ko": "2번 탭", "en": "Tab 2", "zh": "第2个标签", "ja": "2番目のタブ"}},
            {"href": "biz.html#cost", "tool": True,
             "title": {"ko": "마진·원가·자금 계산기", "en": "Margin, cost & cash calculator",
                       "zh": "利润·成本·资金计算器", "ja": "粗利・原価・資金計算"},
             "desc": {"ko": "수출입 마진, 원가 구성, 손익분기, 자금 회수 기간을 한 화면에서.",
                      "en": "Export margin, cost build-up, break-even point and cash payback on one screen.",
                      "zh": "出口利润、成本构成、盈亏平衡、资金回收期，一屏算完。",
                      "ja": "輸出粗利、原価構成、損益分岐、資金回収期間を1画面で。"},
             "tag": {"ko": "계산기 4종", "en": "4 calculators", "zh": "4种计算器", "ja": "計算4種"}},
            {"href": "biz.html", "tool": True,
             "title": {"ko": "견적서·거래명세서·수출서류", "en": "Quotation, invoice & shipping documents",
                       "zh": "报价单·交易明细·出口单据", "ja": "見積書・取引明細・輸出書類"},
             "desc": {"ko": "견적서·인보이스·거래명세서·B/L 지시서 등 9종을 자동으로 채웁니다.",
                      "en": "Quotation, invoice, statement of transaction and B/L instruction — nine templates filled for you.",
                      "zh": "报价单、发票、交易明细、B/L 指示书等9种自动填写。",
                      "ja": "見積書・インボイス・取引明細・B/L指示書など9種を自動作成。"},
             "tag": {"ko": "서류 9종", "en": "9 documents", "zh": "9种单据", "ja": "書類9種"}},
            {"href": "seller.html", "tool": True,
             "title": {"ko": "셀러·마케터 툴", "en": "Seller & marketer tools",
                       "zh": "卖家·营销工具", "ja": "セラー・マーケター向けツール"},
             "desc": {"ko": "스마트스토어 썸네일·상세페이지 860·SEO 분석·QR/UTM 링크.",
                      "en": "Smart Store thumbnails, 860px detail pages, SEO analysis, QR and UTM links.",
                      "zh": "智能商店缩略图、860px 详情页、SEO 分析、QR·UTM。",
                      "ja": "スマートストアのサムネイル、860px詳細ページ、SEO分析、QR・UTM。"},
             "tag": {"ko": "4종", "en": "4 tools", "zh": "4种", "ja": "4種"}},
            {"href": "exhibitions.html",
             "title": {"ko": "글로벌 전시회 캘린더", "en": "Global exhibition calendar",
                       "zh": "全球展会日历", "ja": "世界の展示会カレンダー"},
             "desc": {"ko": "61개 전시회 일정과 KOTRA 한국관 모집 기간·GEP 링크.",
                      "en": "61 trade fairs with KOTRA Korea Pavilion recruitment windows and GEP links.",
                      "zh": "61个展会日程，含 KOTRA 韩国馆招募期与 GEP 链接。",
                      "ja": "61件の展示会日程とKOTRA韓国館募集期間・GEPリンク。"},
             "tag": {"ko": "61건", "en": "61 fairs", "zh": "61个展会", "ja": "61件"}},
        ],
    },
    {
        "id": "life",
        "no": "03",
        "title": {"ko": "세무·법률·생활", "en": "Tax, law & life",
                  "zh": "税务·法律·生活", "ja": "税務・法律・生活"},
        "desc": {"ko": "세금과 급여, 계약서와 내용증명, 생활 서식과 가벼운 운세까지.",
                 "en": "Taxes and payroll, contracts and demand letters, everyday forms and a little fortune-telling.",
                 "zh": "税金与工资、合同与催告书、日常表单，再加一点运势。",
                 "ja": "税金と給与、契約書と内容証明、日常の書式、そして少しの占い。"},
        "items": [
            {"href": "tax.html", "tool": True,
             "title": {"ko": "세금·연봉·건보 계산기", "en": "Tax, salary & health insurance",
                       "zh": "税金·年薪·健康保险", "ja": "税金・年収・社会保険"},
             "desc": {"ko": "종합소득세·부가세·4대보험·연봉 실수령액을 2027 기준으로.",
                      "en": "Income tax, VAT, the four social insurances and take-home pay on 2027 rules.",
                      "zh": "按2027年标准计算综合所得税、增值税、四大保险与实发工资。",
                      "ja": "2027年基準で所得税・消費税・4大保険・手取りを計算。"},
             "tag": {"ko": "계산기", "en": "Calculator", "zh": "计算器", "ja": "計算"}},
            {"href": "salary.html", "tool": True,
             "title": {"ko": "급여·최저임금·4대보험", "en": "Payroll, minimum wage & insurance",
                       "zh": "工资·最低工资·四大保险", "ja": "給与・最低賃金・社会保険"},
             "desc": {"ko": "2027 최저임금 10,700원, 연차·퇴직금·국민연금·실업급여.",
                      "en": "The 2027 minimum wage of 10,700 won, annual leave, severance, national pension and unemployment benefit.",
                      "zh": "2027年最低工资10,700韩元，年假、退职金、国民年金与失业金。",
                      "ja": "2027年最低賃金10,700ウォン、有給休暇・退職金・国民年金・失業給付。"},
             "tag": {"ko": "계산기", "en": "Calculator", "zh": "计算器", "ja": "計算"}},
            {"href": "insurance.html", "tool": True,
             "title": {"ko": "실손·자동차보험 계산기", "en": "Indemnity & car insurance",
                       "zh": "实损·车险计算器", "ja": "実損・自動車保険計算"},
             "desc": {"ko": "실손 유지·4세대·5세대 전환 손익, 청구 서류 체크리스트, 자차 vs 자비.",
                      "en": "Keep or switch to 4th/5th generation indemnity, claim-document checklists, own-damage versus paying yourself.",
                      "zh": "实损维持与第四·五代转换损益、理赔材料清单、车损险与自费比较。",
                      "ja": "実損の維持・第4/第5世代への切替損益、請求書類チェック、車両保険と自費の比較。"},
             "tag": {"ko": "계산기", "en": "Calculator", "zh": "计算器", "ja": "計算"}},
            {"href": "law.html",
             "title": {"ko": "법률·계약서·내용증명", "en": "Contracts & demand letters",
                       "zh": "法律·合同·催告书", "ja": "法律・契約書・内容証明"},
             "desc": {"ko": "계약 조항 검토, 내용증명 문안, 소액소송 절차와 근거 법령.",
                      "en": "Contract clause review, demand-letter wording, small-claims procedure and the statutes behind them.",
                      "zh": "合同条款审查、催告书文案、小额诉讼程序与依据法条。",
                      "ja": "契約条項の確認、内容証明の文案、少額訴訟の手続きと根拠法令。"},
             "tag": {"ko": "안내", "en": "Reference", "zh": "指南", "ja": "案内"}},
            {"href": "forms.html", "tool": True,
             "title": {"ko": "서식·전자서명 138종", "en": "Forms & e-signature (138)",
                       "zh": "表单·电子签名 138种", "ja": "書式・電子署名 138種"},
             "desc": {"ko": "근로계약서부터 B/L 지시서까지, 손글씨 서명·도장·A4 PDF 저장.",
                      "en": "Employment contracts to B/L instructions, with handwritten signature, seal and A4 PDF export.",
                      "zh": "从劳动合同到 B/L 指示书，手写签名、印章与 A4 PDF 保存。",
                      "ja": "労働契約書からB/L指示書まで、手書き署名・印鑑・A4 PDF保存。"},
             "tag": {"ko": "138종", "en": "138 forms", "zh": "138种", "ja": "138種"}},
            {"href": "saju.html", "tool": True,
             "title": {"ko": "무료 만세력·신년운세", "en": "Saju & new-year fortune",
                       "zh": "四柱·新年运势", "ja": "四柱推命・新年占い"},
             "desc": {"ko": "사주팔자와 2027 정미년 신년운세를 무료로 봅니다.",
                      "en": "A free four-pillars reading and a 2027 new-year forecast.",
                      "zh": "免费查看四柱八字与2027丁未年运势。",
                      "ja": "四柱八字と2027丁未年の運勢を無料で。"},
             "tag": {"ko": "무료", "en": "Free", "zh": "免费", "ja": "無料"}},
            {"href": "creator.html", "tool": True,
             "title": {"ko": "블로그·유튜브 콘텐츠 스튜디오", "en": "Blog & Shorts content studio",
                       "zh": "博客·短视频内容工作室", "ja": "ブログ・ショート制作スタジオ"},
             "desc": {"ko": "주제 한 줄로 고RPM 블로그 HTML과 세로 쇼츠 영상(.webm)·자막(.srt)을 만들고, 내 Blogger·YouTube 계정으로 바로 올립니다.",
                      "en": "One topic becomes high-RPM blog HTML plus a vertical Shorts video (.webm) and subtitles (.srt), then posts to your own Blogger and YouTube.",
                      "zh": "一行主题即可生成高 RPM 博客 HTML、竖屏短视频（.webm）与字幕（.srt），并直接发布到自己的 Blogger、YouTube。",
                      "ja": "テーマ1行で高RPMブログHTMLと縦型ショート動画（.webm）・字幕（.srt）を作り、自分のBlogger・YouTubeへそのまま投稿できます。"},
             "tag": {"ko": "무료", "en": "Free", "zh": "免费", "ja": "無料"}},
            {"href": "music.html", "tool": True,
             "title": {"ko": "AI 음악 가사·프롬프트 생성기", "en": "AI music & lyric prompt generator",
                       "zh": "AI 音乐·歌词提示词生成器", "ja": "AI音楽・歌詞プロンプト生成"},
             "desc": {"ko": "장르·분위기·템포·보컬을 고르면 Suno·Flow Music용 영문 스타일 태그와 Verse/Chorus 가사를 바로 복사하게.",
                      "en": "Pick genre, mood, tempo and vocal and copy English style tags plus Verse/Chorus lyrics for Suno and Flow Music.",
                      "zh": "选好曲风、氛围、速度与唱腔，即可复制 Suno、Flow Music 用的英文风格标签和主歌/副歌歌词。",
                      "ja": "ジャンル・雰囲気・テンポ・ボーカルを選ぶと、Suno・Flow Music用の英語スタイルタグとVerse/Chorus歌詞をすぐコピーできます。"},
             "tag": {"ko": "무료", "en": "Free", "zh": "免费", "ja": "無料"}},
            {"href": "style.html", "tool": True,
             "title": {"ko": "체형·사진 기반 스타일 추천", "en": "Style & outfit brief",
                       "zh": "穿搭·风格推荐", "ja": "ファッション・スタイル提案"},
             "desc": {"ko": "BMI·체형과 사진 속 피부 톤을 참고해 2026 겨울~초봄 트렌드 코디 3세트·쇼핑 키워드·룩북 PNG까지. 사진은 기기 안에서만 처리.",
                      "en": "BMI and body type plus skin tone read from your photo, turned into three trend-led outfits, shopping keywords and a lookbook PNG. The photo never leaves your device.",
                      "zh": "参考 BMI、体型与照片中的肤色，给出2026冬~初春趋势的三套搭配、购物关键词与造型卡 PNG。照片仅在设备内处理。",
                      "ja": "BMI・体型と写真の肌の色味を参考に、2026冬〜春先のトレンドコーデ3セット、ショッピングキーワード、ルックブックPNGまで。写真は端末内のみで処理。"},
             "tag": {"ko": "무료", "en": "Free", "zh": "免费", "ja": "無料"}},
            {"href": "lotto.html", "tool": True,
             "title": {"ko": "로또 번호 생성기", "en": "Lotto number generator",
                       "zh": "彩票号码生成器", "ja": "ロト番号生成器"},
             "desc": {"ko": "동행복권 1~1251회 실데이터 기반, 매주 토요일 자동 갱신.",
                      "en": "Built on 1,251 real draws and refreshed every Saturday.",
                      "zh": "基于1,251期真实数据，每周六自动更新。",
                      "ja": "1,251回の実データに基づき、毎週土曜に自動更新。"},
             "tag": {"ko": "무료", "en": "Free", "zh": "免费", "ja": "無料"}},
        ],
    },
    {
        "id": "guide",
        "no": "04",
        "title": {"ko": "안내·사이트맵·문의", "en": "About, sitemap & contact",
                  "zh": "介绍·网站地图·咨询", "ja": "案内・サイトマップ・お問い合わせ"},
        "desc": {"ko": "매체 소개와 편집 원칙, 광고·제휴, 제보 창구, 그리고 검색엔진용 주소 목록.",
                 "en": "Who we are, how we report, how to advertise or send a tip — and the address lists for search engines.",
                 "zh": "媒体介绍与编辑原则、广告·合作、线索渠道，以及面向搜索引擎的地址列表。",
                 "ja": "媒体紹介と編集方針、広告・提携、情報提供の窓口、検索エンジン向けのアドレス一覧。"},
        "items": [
            {"href": "about.html",
             "title": {"ko": "매체 소개·편집 원칙", "en": "About us & editorial policy",
                       "zh": "媒体介绍·编辑原则", "ja": "媒体紹介・編集方針"},
             "desc": {"ko": "무엇을 어떻게 보도하는지, 팩트체크·정정·광고 분리 기준.",
                      "en": "What we cover, our fact-check and correction rules, and how ads are kept apart from reporting.",
                      "zh": "报道什么、如何报道，事实核查·更正·广告分离标准。",
                      "ja": "何をどう報じるか、ファクトチェック・訂正・広告分離の基準。"},
             "tag": {"ko": "매체", "en": "Desk", "zh": "媒体", "ja": "媒体"}},
            {"href": "ad.html",
             "title": {"ko": "광고·스폰서 단가", "en": "Advertise & partner", "zh": "广告·赞助价目", "ja": "広告・スポンサー料金"},
             "desc": {"ko": "배너·스폰서드 리포트·B2B 원가 분석 의뢰와 단가표.",
                      "en": "Banners, sponsored reports and B2B sourcing or cost analysis, with a rate card.",
                      "zh": "横幅、赞助报道、B2B 采购·成本分析委托及价目表。",
                      "ja": "バナー、スポンサードレポート、B2B調達・原価分析の依頼と料金表。"},
             "tag": {"ko": "제휴", "en": "Partner", "zh": "合作", "ja": "提携"}},
            {"href": "contact.html",
             "title": {"ko": "제보·문의", "en": "Tips & contact", "zh": "爆料·咨询", "ja": "情報提供・お問い合わせ"},
             "desc": {"ko": "제보, 정정 요청, 광고 문의를 한 창구에서 접수합니다.",
                      "en": "Send a tip, request a correction or ask about advertising in one place.",
                      "zh": "提供线索、要求更正、咨询广告，统一受理。",
                      "ja": "情報提供、訂正依頼、広告の問い合わせを一つの窓口で。"},
             "tag": {"ko": "문의", "en": "Contact", "zh": "咨询", "ja": "連絡"}},
            {"href": "experts.html",
             "title": {"ko": "전문가 매칭", "en": "Expert matching", "zh": "专家匹配", "ja": "専門家マッチング"},
             "desc": {"ko": "물류·세무·노무·정책자금 등 11개 분야 무료 비교견적.",
                      "en": "Free quotes from 11 fields: logistics, tax, labour, policy loans and more.",
                      "zh": "物流、税务、劳务、政策资金等11个领域免费比较报价。",
                      "ja": "物流・税務・労務・政策資金など11分野の無料比較見積。"},
             "tag": {"ko": "11개 분야", "en": "11 fields", "zh": "11个领域", "ja": "11分野"}},
            {"href": "links.html",
             "title": {"ko": "추천 상품·용품", "en": "Recommended products", "zh": "推荐商品·用品", "ja": "おすすめ商品・用品"},
             "desc": {"ko": "시츄 쫑이월드 링크와 쿠팡 파트너스 추천 상품.",
                      "en": "Siyu Jjong's World links and Coupang Partners picks.",
                      "zh": "诗秋·中吉世界链接与 Coupang Partners 推荐商品。",
                      "ja": "シジュ・チョンイワールドのリンクとCoupang Partnersのおすすめ商品。"},
             "tag": {"ko": "제휴", "en": "Partner", "zh": "合作", "ja": "提携"}},
            {"href": "feed.xml",
             "title": {"ko": "RSS 피드", "en": "RSS feed", "zh": "RSS 订阅", "ja": "RSS フィード"},
             "desc": {"ko": "새 기사를 리더기로 받아 봅니다.",
                      "en": "Follow new stories in your reader.",
                      "zh": "在阅读器中订阅新报道。",
                      "ja": "リーダーで新着記事を購読。"},
             "tag": {"ko": "구독", "en": "Follow", "zh": "订阅", "ja": "購読"}},
            {"href": "sitemap.xml",
             "title": {"ko": "XML 사이트맵", "en": "XML sitemap", "zh": "XML 网站地图", "ja": "XML サイトマップ"},
             "desc": {"ko": "검색엔진용 전체 주소 목록(4개국어).",
                      "en": "Every URL for search engines, in four languages.",
                      "zh": "面向搜索引擎的全部地址（四种语言）。",
                      "ja": "検索エンジン向けの全URL（4言語）。"},
             "tag": {"ko": "검색", "en": "SEO", "zh": "搜索", "ja": "検索"}},
        ],
    },
]

JUMP = {
    "ko": ["뉴스·리포트", "무역·조달·시황", "세무·법률·생활", "안내·연락", "최신 기사"],
    "en": ["News", "Trade & procurement", "Tax, law & life", "About & contact", "Latest stories"],
    "zh": ["新闻·报告", "贸易·采购·行情", "税务·法律·生活", "介绍·联系", "最新报道"],
    "ja": ["ニュース", "貿易・調達・市況", "税務・法律・生活", "案内・連絡", "最新記事"],
}


# --- 데이터 읽기 ------------------------------------------------------------
def load_json(path, default=None):
    try:
        with open(path, encoding="utf-8") as f:
            return json.load(f)
    except (OSError, json.JSONDecodeError):
        return default


def articles_for(lang):
    name = "articles.json" if lang == "ko" else f"articles.{lang}.json"
    items = load_json(os.path.join(DATA, name), []) or []
    # 그 언어로 발행된 기사만 링크합니다(다른 언어 전용 기사의 404 방지).
    items = [a for a in items if lang in article_locales(a)]
    items = sorted(items, key=lambda a: a.get("publishedAt") or "", reverse=True)
    return items[:LATEST_COUNT]


def category_labels(lang):
    name = "site.json" if lang == "ko" else f"site.{lang}.json"
    site = load_json(os.path.join(DATA, name), {}) or {}
    return {c.get("id"): c.get("label") for c in (site.get("categories") or [])}


def date_label(iso, lang):
    try:
        d = datetime.date.fromisoformat((iso or "")[:10])
    except ValueError:
        return ""
    if lang == "ko":
        return d.strftime("%Y.%m.%d")
    if lang == "en":
        return d.strftime("%b %-d, %Y") if os.name != "nt" else d.strftime("%b %d, %Y")
    return f"{d.year}年{d.month}月{d.day}日"


# --- 조각 -------------------------------------------------------------------
def today_label(lang):
    d = datetime.date.today()
    if lang == "ko":
        return f"{d.year}년 {d.month}월 {d.day}일 " + "월화수목금토일"[d.weekday()] + "요일"
    if lang == "en":
        return d.strftime("%B %-d, %Y") if os.name != "nt" else d.strftime("%B %d, %Y")
    return f"{d.year}年{d.month}月{d.day}日"


def switch_block(lang):
    out = ['<div class="lang-switch" role="group" aria-label="Language">']
    for other in LANGS:
        if other == lang:
            href = PAGE
        elif lang == "ko":
            href = f"{other}/{PAGE}"
        elif other == "ko":
            href = f"../{PAGE}"
        else:
            href = f"../{other}/{PAGE}"
        on = ' class="is-on" aria-current="true"' if other == lang else ""
        out.append(f'<a href="{href}" hreflang="{SWITCH_LANG[other]}" lang="{SWITCH_LANG[other]}"{on}>'
                   f'{SWITCH[other]}</a>')
    out.append("</div>")
    return "".join(out)


def head_block(lang):
    d = TEXT[lang]
    dir_ = DIRS[lang]
    asset = "" if lang == "ko" else "../"
    canon = f"{BASE}/{dir_ + '/' if dir_ else ''}{PAGE}"
    alts = []
    for other in LANGS:
        od = DIRS[other]
        alts.append(f'<link rel="alternate" hreflang="{SWITCH_LANG[other]}" '
                    f'href="{BASE}/{od + "/" if od else ""}{PAGE}">')
    alts.append(f'<link rel="alternate" hreflang="x-default" href="{BASE}/{PAGE}">')
    return f"""<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="google-adsense-account" content="ca-pub-7853253075143438">
<title>{e(d['title'])}</title>
<meta name="description" content="{e(d['desc'])}">
<meta name="theme-color" content="#17140f">
<link rel="canonical" href="{canon}">
{os.linesep.join(alts)}
<meta property="og:type" content="website">
<meta property="og:site_name" content="INSIGHT BRIEF">
<meta property="og:title" content="{e(d['title'])}">
<meta property="og:description" content="{e(d['desc'])}">
<meta property="og:image" content="{BASE}/assets/img/og.png">
<meta property="og:url" content="{canon}">
<meta property="og:locale" content="{OG_LOCALE[lang]}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="{BASE}/assets/img/og.png">
<link rel="icon" href="{asset}assets/img/favicon.svg" type="image/svg+xml">
<link rel="alternate" type="application/rss+xml" title="INSIGHT BRIEF RSS" href="feed.xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;500;600;700;900&display=swap">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css">
<link rel="stylesheet" href="{asset}assets/css/style.css?v=20261123p">
<link rel="stylesheet" href="{asset}assets/css/monetize.css?v=20261123m">
<link rel="stylesheet" href="{asset}assets/css/nav.css?v={NAV_CSS_VER}">
<link rel="stylesheet" href="{asset}assets/css/sitemap.css?v={CSS_VER}">
<link rel="stylesheet" href="{asset}assets/css/i18n.css?v={I18N_VER}">"""


def header_block(lang):
    d = TEXT[lang]
    asset = "" if lang == "ko" else "../"
    nav = nav_spec.render(lang, "", ("guide", "sitemap"))
    return f"""<a class="skip" href="#main">{e(d['skip'])}</a>

<header class="site-header">
  <div class="topbar">
    <div class="container">
      <div class="tb-left">
        <span class="live"><i></i>INDEPENDENT</span>
        <span class="tb-sep"></span>
        <span id="today-date">{e(today_label(lang))}</span>
      </div>
      <div class="tb-right">{switch_block(lang)}
        <span class="opt" data-site="brand.tagline">{e(d['tagline'])}</span>
        <span class="tb-sep opt"></span>
        <span data-site="brand.issue">VOL. 01</span>
      </div>
    </div>
  </div>
  <div class="masthead">
    <div class="container">
      <div class="brand">
        <a href="index.html" aria-label="{e(d['homeAria'])}">
          <span class="mark" aria-hidden="true"></span>
          <span class="name" data-brand-name>INSIGHT <em>BRIEF</em></span>
        </a>
        <div class="sub">
          <b data-site="brand.nameKo">{e(d['brandKo'])}</b>
          <span class="bar" aria-hidden="true"></span>
          <span data-site="brand.slogan">{e(d['slogan'])}</span>
        </div>
      </div>
      <div class="mast-tools">
        <a class="btn btn-ghost btn-sm" href="index.html">{e(d['home'])}</a>
        <a class="btn btn-accent btn-sm" href="contact.html#tip">{e(d['tip'])}</a>
        <button class="icon-btn search-toggle" type="button" aria-label="{e(d['searchOpen'])}" aria-expanded="false" aria-controls="search-mobile">
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="1.7"></circle><path d="m20 20-3.6-3.6" fill="none" stroke="currentColor" stroke-width="1.7"></path></svg>
        </button>
      </div>
    </div>
  </div>
</header>

<div class="nav-wrap">
  <div class="container">
    {nav}
    <form class="search search-desktop" data-search role="search">
      <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="1.7"></circle><path d="m20 20-3.6-3.6" fill="none" stroke="currentColor" stroke-width="1.7"></path></svg>
      <input type="search" name="q" placeholder="{e(d['search'])}" aria-label="{e(d['searchAria'])}" autocomplete="off">
    </form>
  </div>
</div>
<div class="search-mobile" id="search-mobile" hidden>
  <form class="search" data-search role="search">
    <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="1.7"></circle><path d="m20 20-3.6-3.6" fill="none" stroke="currentColor" stroke-width="1.7"></path></svg>
    <input type="search" name="q" placeholder="{e(d['search'])}" aria-label="{e(d['searchAria'])}" autocomplete="off">
  </form>
</div>"""


def section_block(lang, sec):
    no, sid = sec["no"], sec["id"]
    out = [f'<section class="sm-block" id="{sid}" aria-labelledby="sm-{sid}">',
           '  <div class="sm-head">',
           f'    <span class="sm-no">{no}</span>',
           '    <div>',
           f'      <h2 id="sm-{sid}">{e(sec["title"][lang])}</h2>',
           f'      <p>{e(sec["desc"][lang])}</p>',
           '    </div>',
           '  </div>',
           '  <div class="sm-grid">']
    for it in sec["items"]:
        if it.get("bundle"):
            # 한 묶음 카드 — 제목 + 서식별 바로가기(PI·CI·PL)를 한 칸에 모아 보여 줍니다.
            out.append('    <div class="sm-bundle" role="group" aria-label="%s">' % e(it["title"][lang]))
            out.append(f'      <div class="sm-bundle-main">')
            out.append(f'        <span class="sm-tag">{e(it["tag"][lang])}</span>')
            out.append(f'        <b>{e(it["title"][lang])}</b>')
            out.append(f'        <span class="sm-desc">{e(it["desc"][lang])}</span>')
            out.append('      </div>')
            out.append('      <div class="sm-bundle-links">')
            for lk in it.get("links") or []:
                out.append('        <a href="%s"><span>%s</span><b>%s</b><i>%s</i></a>'
                           % (lk["href"], e(lk["code"]), e(lk["label"][lang]), e(lk["en"])))
            out.append('      </div>')
            out.append('    </div>')
            continue
        cls = "sm-item is-tool" if it.get("tool") else "sm-item"
        out.append(f'    <a class="{cls}" href="{it["href"]}">')
        out.append(f'      <span class="sm-tag">{e(it["tag"][lang])}</span>')
        out.append(f'      <b>{e(it["title"][lang])}</b>')
        out.append(f'      <span class="sm-desc">{e(it["desc"][lang])}</span>')
        out.append(f'      <i>{e(it["href"])}</i>')
        out.append('    </a>')
    out.append('  </div>')
    return "\n".join(out)


def latest_block(lang):
    d = TEXT[lang]
    cats = category_labels(lang)
    rows = []
    for a in articles_for(lang):
        cat = cats.get(a.get("category")) or a.get("category") or ""
        rows.append(
            '<li><a href="a/{id}.html">'
            '<span class="cat">{cat}</span>'
            '<span class="ttl">{ttl}</span>'
            '<span class="dt">{dt}</span>'
            '</a></li>'.format(id=e(a.get("id", "")), cat=e(cat),
                               ttl=e(a.get("title", "")), dt=e(date_label(a.get("publishedAt"), lang))))
    return "\n".join([
        '<section class="sm-block" id="latest" aria-labelledby="sm-latest">',
        '  <div class="sm-head">',
        '    <span class="sm-no">05</span>',
        '    <div>',
        f'      <h2 id="sm-latest">{e(d["latest_h2"])}</h2>',
        f'      <p>{e(d["latest_desc"])}</p>',
        '    </div>',
        '  </div>',
        '  <ol class="sm-latest">',
        "\n".join(rows),
        '  </ol>',
        f'  <a class="sm-more" href="index.html">{e(d["latest_more"])} →</a>',
        f'  <p class="sm-note">{d["xml_note"]}</p>',
        '</section>',
    ])


def langs_block(lang):
    d = TEXT[lang]
    chips = []
    for other in LANGS:
        if other == lang:
            href = PAGE
        elif lang == "ko":
            href = f"{other}/{PAGE}"
        elif other == "ko":
            href = f"../{PAGE}"
        else:
            href = f"../{other}/{PAGE}"
        on = ' class="is-on"' if other == lang else ""
        chips.append(f'    <a href="{href}" hreflang="{SWITCH_LANG[other]}"{on}>{SWITCH[other]}</a>')
    return "\n".join([
        '<section class="sm-block" id="languages" aria-labelledby="sm-langs">',
        '  <div class="sm-head">',
        '    <span class="sm-no">06</span>',
        '    <div>',
        f'      <h2 id="sm-langs">{e(d["lang_h2"])}</h2>',
        f'      <p>{e(d["lang_desc"])}</p>',
        '    </div>',
        '  </div>',
        '  <div class="sm-langs">',
        "\n".join(chips),
        '  </div>',
        '</section>',
    ])


def render(lang):
    d = TEXT[lang]
    asset = "" if lang == "ko" else "../"
    jumps = "\n".join(
        f'      <a href="#{sid}"><b>{i + 1:02d}</b>{e(label)}</a>'
        for i, (sid, label) in enumerate(zip(["news", "trade", "life", "guide", "latest"], JUMP[lang]))
    )
    i18n_scripts = ""
    if lang != "ko":
        i18n_scripts = (f'\n<script src="data/i18n.fallback.js?v={I18N_VER}"></script>'
                        f'\n<script src="{asset}assets/js/i18n.js?v={I18N_VER}"></script>')
    sections = "\n\n".join(section_block(lang, sec) for sec in SECTIONS)
    return f"""<!DOCTYPE html>
<html lang="{HTML_LANG[lang]}">
<head>
{head_block(lang)}
<!-- IB:VENDORS -->
<script src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js" defer></script>
<script src="{asset}assets/js/vendors.js?v=20261124c" defer></script>
<link rel="stylesheet" href="{asset}assets/css/widgets.css?v=20261124c">
<link rel="stylesheet" href="{asset}assets/css/chat.css?v=20261124c">
<!-- /IB:VENDORS -->
</head>
<body data-page="sitemap">
{header_block(lang)}

<main id="main">
  <section class="page-hero">
    <div class="container">
      <div class="inner">
        <span class="kicker">{e(d['kicker'])}</span>
        <h1>{e(d['h1'])}</h1>
        <p>{e(d['lead'])}</p>
        <nav class="sm-jump" aria-label="{e(d['jump'])}">
{jumps}
        </nav>
        <p style="font-size:12px;color:var(--muted)">{e(d['title_note'])}</p>
      </div>
    </div>
  </section>

  <div class="container sm-shell">
{sections}

{latest_block(lang)}

{langs_block(lang)}
  </div>
</main>

<footer class="site-footer" id="site-footer"></footer>

<script src="data/site.fallback.js"></script>
<script src="data/articles.fallback.js"></script>
<script src="{asset}assets/js/monetize.js?v=20261123c"></script>
<script src="{asset}assets/js/nav.js?v={NAV_JS_VER}"></script>{i18n_scripts}
<script src="{asset}assets/js/app.js?v=20261124m"></script>
<!-- IB:CHAT-FLOAT -->
<script src="{asset}assets/js/chat-float.js?v=20261124c" defer></script>
<!-- /IB:CHAT-FLOAT -->
</body>
</html>
"""


def build(langs=None):
    langs = langs or LANGS
    written = []
    for lang in langs:
        dir_ = DIRS[lang]
        folder = os.path.join(ROOT, dir_) if dir_ else ROOT
        os.makedirs(folder, exist_ok=True)
        path = os.path.join(folder, PAGE)
        with open(path, "w", encoding="utf-8") as f:
            f.write(render(lang))
        written.append(os.path.relpath(path, ROOT).replace(os.sep, "/"))
    return written


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--lang", action="append", choices=LANGS)
    args = ap.parse_args()
    files = build(args.lang)
    print("사이트맵 페이지 생성: " + " · ".join(files))
    return 0


if __name__ == "__main__":
    sys.exit(main())
