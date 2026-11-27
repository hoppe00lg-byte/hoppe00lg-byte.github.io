#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""인사이트 브리프 — 웹진 자동 발행(GitHub Actions용)

1차 출처(구글 뉴스 RSS·arXiv·기관 RSS)를 모아 Gemini로 심층 기사 1편을 쓰고,
`data/articles.json` 맨 앞에 넣은 뒤 `tools/build.py`(한국어 + en/zh/ja)와
`tools/seo_audit.py`를 돌리고 커밋·푸시합니다. 이미지는 Pillow 고대비 커버 카드
(1,600×900)를 만들어 넣고, 실패하면 카드 없이 본문만 발행합니다.

같은 주제를 네 나라 독자용으로 **따로 씁니다**. 한국어판을 쓴 뒤 같은 근거 자료로
영어판(미국·달러·연준 기준) · 중국어판(위안·중국 산업) · 일본어판(엔·일본 경제)을
각각 새로 쓰고, 결과는 `data/i18n-articles/{기사ID}.json` 에 넣습니다. 그 파일이 있으면
tools/i18n_data.py 가 기계번역 대신 그 원고를 그 언어판에 그대로 씁니다(없으면 지금처럼 번역).

  python3 tools/auto_publish_webzine.py --dry-run               # 오늘 남은 슬롯 확인만
  python3 tools/auto_publish_webzine.py --dry-run --category ai # 지금 1편 생성·빌드(커밋 없이)
  python3 tools/auto_publish_webzine.py --category culture      # 특정 카테고리 1편
  python3 tools/auto_publish_webzine.py                          # 예약 슬롯 중 밀린 것부터 최대 3편 발행

환경변수
  GEMINI_API_KEY    (필수) Google AI Studio 키
  GEMINI_MODEL      (선택) 첫 모델. 기본 gemini-3.5-flash → 폴백 체인
  AUTO_PUBLISH_MAX  (선택) 한 번에 발행할 최대 편수(기본 3, 상한 6)
  AUTO_PUBLISH_LANGS(선택) 국가별 원고를 쓸 언어(기본 ko,en,zh,ja)
  IB_SKIP_PUSH=1    (선택) 커밋·푸시를 하지 않는다(--dry-run 과 같음)
  IB_FAKE_GEMINI=1  (선택) API 없이 파이프라인만 시험한다(커밋 금지, --dry-run 전용)

카테고리(9개) — 하루 36편: 9개 섹션 × 4편. 섹션은 슬롯 순번으로 돌아가며 배정합니다.
"""
from __future__ import annotations

import argparse
import hashlib
import html as htmllib
import json
import os
import re
import subprocess
import sys
import threading
import time
import urllib.error
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timedelta, timezone
from pathlib import Path

KST = timezone(timedelta(hours=9))
ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"
ARTICLES = DATA / "articles.json"
SITE = DATA / "site.json"
STATE = ROOT / "tools" / "auto_publish_state.json"
API_ROOT = "https://generativelanguage.googleapis.com/v1beta"
UA = "Mozilla/5.0 (compatible; insightbrief-autopublish/1.0; +https://insightbriefnews.com)"

MODEL_CHAIN = ["gemini-3.5-flash", "gemini-flash-lite-latest", "gemini-3.1-flash-lite", "gemini-2.5-flash"]

# 국가별 원고 설정 — 같은 주제를 그 나라 독자의 통화·제도·사례로 다시 씁니다.
# (한국어판이 기준점이 되고, en·zh·ja 는 번역이 아니라 그 시장 기준으로 새로 쓰는 원고입니다.)
LANGS = {
    "ko": {
        "name": "한국어",
        "audience": "한국 독자 — 원화, 한국은행·금융위·정부 고시, 국내 가계와 중소기업 기준",
        "context": "한국은행·금융위·정부 고시와 국내 가계·중소기업의 실제 부담을 기준으로 쓴다. "
                   "외국 제도는 비교용으로만 쓰고, 결론은 국내 독자가 자기 통장·계약서에서 확인할 수 있는 지점으로 맺는다.",
        "author": "인사이트 브리프 편집실",
        "min_chars": 1800,
        "target": "공백 제외 1,900~2,500자",
        "title_rule": "20~48자",
        "cliche": ["결론적으로", "시사한다", "방증한다", "주목된다", "전망이다", "가능성이 높다"],
        "fc_title": "팩트체크",
        "img_alt": "기사 주제를 보여 주는 에디토리얼 이미지",
    },
    "en": {
        "name": "English",
        "audience": "readers in the United States and other English-speaking markets — dollar, the Federal Reserve, US and EU rules",
        "context": "Write it as a US-centred story, not a Korea briefing: the dollar, the Fed, US agencies and US buyers come first, "
                   "and the Korean figures are the hard data point that shows what the same move costs an importer, a factory or a household abroad. "
                   "Use US or global comparisons only where the sources support the comparison.",
        "author": "Insight Brief Desk",
        "min_words": 620,
        "target": "750~950 words",
        "title_rule": "45~85 characters, sentence case, no date prefix",
        "cliche": ["In conclusion", "It remains to be seen", "Only time will tell", "This suggests that", "It is worth noting"],
        "fc_title": "Fact check",
        "img_alt": "an editorial illustration for this story",
        "glossary": """- 납사·나프타 → Naphtha (never NAFTA — NAFTA is a trade pact, not a feedstock)
- 전주 대비 / 전주(지난주) → week-over-week (WoW) / the previous week (never the city name Jeonju)
- 김프 / 김치 프리미엄 → Kimchi Premium (never GIMP)
- ○○ 정리(작성·편집 크레딧) → 'Compiled by ○○' or 'Edited by ○○' (never theorem)
- 전주시·전주정보문화산업진흥원처럼 도시 이름일 때만 Jeonju 로 쓴다.""",
    },
    "zh": {
        "name": "中文",
        "audience": "中国及华语地区读者 — 人民币、中国海关与产业口径、中国工厂与买家",
        "context": "以人民币、中国海关与产业链位置重新组织这篇报道: 先写中国读者要用的价格、产能、关税和供应链环节, "
                   "韩国数据作为对照。不要逐句翻译韩语版, 换成中国读者熟悉的说法与案例。",
        "author": "洞察简报编辑部",
        "min_chars": 1300,
        "target": "1,500~2,000字",
        "title_rule": "18~34字, 不用日期开头",
        "cliche": ["总而言之", "综上所述", "由此可见", "值得关注的是"],
        "fc_title": "事实核查",
        "img_alt": "与本文主题相关的编辑配图",
    },
    "ja": {
        "name": "日本語",
        "audience": "日本の読者 — 円、日本銀行、日本の輸入価格・電気代・家計",
        "context": "円と日本企業の取引条件を軸に組み直す。韓国の数値は比較材料として置き、"
                   "日本の輸入価格・電気代・家計負担に引き直したときの意味を先に書く。韓国版の逐語訳にしない。",
        "author": "インサイトブリーフ編集部",
        "min_chars": 1600,
        "target": "1,800~2,400字",
        "title_rule": "24~42字、日付を頭に付けない",
        "cliche": ["結論として", "示唆する", "注目される", "可能性が高い", "と言えるだろう"],
        "fc_title": "ファクトチェック",
        "img_alt": "記事のテーマを示す編集画像",
    },
}
NATIVE_DIR = DATA / "i18n-articles"  # 국가별 원고(빌드 입력) — 브라우저에 내려가지 않는 data/ 하위

# 사람이 읽는 이름·1차 출처 검색어·각도. 새 카테고리를 늘릴 때는 site.json 과 nav_spec.py 도 함께 고친다.
CATEGORIES = {
    "economy": {
        "label": "경제·금융",
        "label_en": "ECONOMY",
        "label_zh": "经济·金融",
        "label_ja": "経済・金融",
        "keywords_en": "rate rates inflation fed bond gdp korea household debt".split(),
        "keywords": "금리 물가 환율 가계 대출 은행 한은 성장률 소비 채권 증시 연준 무역수지".split(),
        "role": "경제·금융팀",
        "feeds": ["YNA_ECONOMY", "HANI_ECONOMY", "MK_ECONOMY", "FED", "GUARDIAN_BUSINESS"],
        "queries": ["한국은행 기준금리", "소비자물가 상승률", "가계부채 연체율"],
        "primary": ["site:bok.or.kr", "site:moef.go.kr", "site:kostat.go.kr"],
        "queries_en": ["Bank of Korea interest rate"],
        "cover_words": ["RATES", "FLOWS", "MARGIN", "DEBT", "YIELD"],
        "angle": "금리·물가·환율·가계부채의 실제 고시 수치로 오늘 가계와 기업이 어디에 서 있는지 계산해 보여준다.",
        "tool": ("급여·최저임금·4대보험 계산기", "https://insightbriefnews.com/salary.html"),
    },
    "trade": {
        "label": "무역·원자재",
        "label_en": "TRADE",
        "label_zh": "贸易·原材料",
        "label_ja": "貿易・原材料",
        "keywords_en": "copper oil freight shipping tariff commodity chemical steel container".split(),
        "keywords": "원자재 구리 유가 원유 운임 수출 수입 관세 화학 폴리머 철강 컨테이너 물류 공급망".split(),
        "role": "무역·원자재팀",
        "feeds": ["YNA_INDUSTRY", "MK_ECONOMY", "EIA", "GUARDIAN_BUSINESS"],
        "queries": ["원자재 가격 구리", "국제유가", "해상운임 SCFI"],
        "primary": ["site:motie.go.kr", "site:customs.go.kr", "site:kcia.kr", "site:eia.gov"],
        "queries_en": ["commodities copper price", "container freight rate"],
        "cover_words": ["FREIGHT", "SPREAD", "CARGO", "MILL", "TARIFF"],
        "angle": "원자재 가격·운임·관세의 실제 고시 수치가 국내 수입·제조 원가에 어떻게 옮겨 붙는지 계산해 보여준다.",
        "tool": ("도착원가·마진 계산기", "https://insightbriefnews.com/sourcing.html"),
    },
    "ai": {
        "label": "AI·테크",
        "label_en": "TECH",
        "label_zh": "AI·科技",
        "label_ja": "AI・テック",
        "keywords_en": "AI model chip gpu datacenter robot compute benchmark".split(),
        "keywords": "AI 인공지능 반도체 데이터센터 모델 로봇 클라우드 칩 GPU 알고리즘 학습 추론".split(),
        "role": "AI·테크팀",
        "feeds": ["ARXIV", "GUARDIAN_TECH", "YNA_INDUSTRY"],
        "queries": ["AI 모델 발표", "AI 반도체 데이터센터", "AI 규제"],
        "primary": ["site:arxiv.org", "site:msit.go.kr", "site:ftc.gov"],
        "queries_en": ["AI model release benchmark", "AI datacenter power semiconductor"],
        "cover_words": ["MODEL", "SILICON", "AGENTS", "COMPUTE", "BENCH"],
        "angle": "발표된 모델·칩·서비스의 실제 수치(가격·성능·전력·지연)를 기준으로 현장에서 무엇이 달라지는지 구분해 쓴다.",
        "tool": ("AI 음악·가사 생성기", "https://insightbriefnews.com/music.html"),
    },
    "fire": {
        "label": "재난·안전",
        "label_en": "DISASTER & SAFETY",
        "label_zh": "灾难·安全",
        "label_ja": "災害・安全",
        "keywords_en": "fire safety recall sprinkler evacuation".split(),
        "keywords": "화재 소방 안전 폭발 인명 구조 대피 위험물 전기 가스 산업재해 중대재해".split(),
        "role": "재난·안전팀",
        "feeds": ["YNA_SOCIETY", "GUARDIAN_WORLD"],
        "queries": ["소방청 화재 통계", "전기장판 화재", "소방시설 과태료"],
        "primary": ["site:nfa.go.kr", "site:kfsi.re.kr", "site:kosha.or.kr"],
        "queries_en": ["fire safety standard recall", "NFPA residential fire"],
        "cover_words": ["ALARM", "EXIT", "STATUTE", "SPRINKLER", "RECALL"],
        "angle": "화재·안전 사고의 공식 통계와 법령 조문을 대조해, 기준에 있는 것과 기준에 빠진 것을 가른다.",
        "tool": ("실손·자동차보험 계산기", "https://insightbriefnews.com/insurance.html"),
    },
    "world": {
        "label": "국제·지정학",
        "label_en": "WORLD & GEOPOLITICS",
        "label_zh": "国际·地缘",
        "label_ja": "国際・地政学",
        "keywords_en": "tariff sanction summit nato china russia eu treaty export control".split(),
        "keywords": "관세 제재 정상 외교 미국 중국 EU 러시아 우크라이나 협상 조약 대통령 수출통제".split(),
        "role": "국제·지정학팀",
        "feeds": ["GUARDIAN_WORLD", "BBC_WORLD", "ALJAZEERA", "YNA_INTL"],
        "queries": ["미국 관세 중국", "한미 협력 공급망", "EU 규제"],
        "primary": ["site:whitehouse.gov", "site:ustr.gov", "site:ec.europa.eu", "site:mofa.go.kr"],
        "queries_en": ["US China tariffs", "export controls geopolitics supply chain"],
        "cover_words": ["TARIFF", "ALLIANCE", "CHOKEPOINT", "SANCTION", "BORDER"],
        "angle": "정책 발표문·관보·관세율표의 실제 문구와 수치를 확인하고, 한국 수출·수입 기업에 옮겨 붙는 지점을 계산한다.",
        "tool": ("글로벌 소싱·도착원가 계산기", "https://insightbriefnews.com/sourcing.html"),
    },
    "property": {
        "label": "부동산·생활세금",
        "label_en": "PROPERTY & TAX",
        "label_zh": "房产·税制",
        "label_ja": "不動産・税制",
        "keywords_en": "housing mortgage property tax apartment seoul real estate".split(),
        "keywords": "부동산 집값 전세 월세 아파트 청약 양도세 종부세 재건축 분양 임대차 주택".split(),
        "role": "부동산·세제팀",
        "feeds": ["YNA_ECONOMY", "MK_ECONOMY", "HANI_ECONOMY"],
        "queries": ["양도소득세 부동산", "청약 제도", "종합부동산세"],
        "primary": ["site:ftc.go.kr", "site:molit.go.kr", "site:nts.go.kr", "site:reb.or.kr"],
        "queries_en": ["Korea housing market policy", "Korea capital gains tax real estate"],
        "cover_words": ["DEED", "LTV", "SUBSCRIPTION", "TAXBASE", "CLOSING"],
        "angle": "세율표·고시·청약 규정의 실제 숫자로 1주택·다주택·청약자의 손익이 어디서 갈리는지 계산한다.",
        "tool": ("세금·연봉·건보 계산기", "https://insightbriefnews.com/tax.html"),
    },
    "energy": {
        "label": "에너지·전력·기후",
        "label_en": "ENERGY & CLIMATE",
        "label_zh": "能源·气候",
        "label_ja": "エネルギー・気候",
        "keywords_en": "power electricity grid nuclear carbon emissions solar wind lng battery datacenter".split(),
        "keywords": "전력 전기 원전 에너지 발전 탄소 기후 태양광 풍력 LNG 송전 배출 전기요금".split(),
        "role": "에너지·기후팀",
        "feeds": ["EIA", "GUARDIAN_ENVIRONMENT", "YNA_INDUSTRY"],
        "queries": ["전력수요 데이터센터", "원전 발전", "전기요금 인상"],
        "primary": ["site:eia.gov", "site:iea.org", "site:motie.go.kr", "site:kepco.co.kr"],
        "queries_en": ["datacenter electricity demand", "nuclear power carbon regulation"],
        "cover_words": ["GRID", "MEGAWATT", "CARBON", "PEAK", "REACTOR"],
        "angle": "전력 수급 계획·요금표·발전량 통계의 확인된 수치로 AI 전력난과 탄소 규제의 실제 비용을 계산한다.",
        "tool": ("원자재·환율 시황판", "https://insightbriefnews.com/market.html"),
    },
    "health": {
        "label": "바이오·헬스",
        "label_en": "HEALTH & BIO",
        "label_zh": "生物·健康",
        "label_ja": "バイオ・健康",
        "keywords_en": "health drug vaccine obesity trial fda who hospital insurance".split(),
        "keywords": "건강 의료 병원 백신 치료제 비만 급여 보험 감염 질환 임상 FDA 신약".split(),
        "role": "바이오·헬스팀",
        "feeds": ["WHO", "GUARDIAN_HEALTH", "YNA_SOCIETY"],
        "queries": ["비만치료제 급여", "건강보험 적용", "건강검진 제도"],
        "primary": ["site:mohw.go.kr", "site:hira.or.kr", "site:mfds.go.kr", "site:who.int", "site:fda.gov"],
        "queries_en": ["obesity drug reimbursement", "Korea health insurance coverage"],
        "cover_words": ["DOSE", "COVERAGE", "TRIAL", "SCREEN", "PATIENT"],
        "angle": "허가·급여 기준 고시와 임상 결과의 실제 수치를 대조해, 환자가 실제로 내는 돈과 조건을 계산한다.",
        "tool": ("실손·자동차보험 계산기", "https://insightbriefnews.com/insurance.html"),
    },
    "culture": {
        "label": "K-컬쳐·엔터",
        "label_en": "K-CULTURE",
        "label_zh": "韩流·娱乐",
        "label_ja": "Kカルチャー・エンタメ",
        "keywords_en": "k-pop idol album drama webtoon concert billboard chart music".split(),
        "keywords": "K팝 아이돌 앨범 드라마 웹툰 콘서트 가수 음악 넷플릭스 버추얼 팬덤 차트".split(),
        "role": "K-컬쳐·엔터팀",
        "feeds": ["YNA_CULTURE", "BILLBOARD", "GUARDIAN_MUSIC"],
        "queries": ["K팝 앨범 판매량", "버추얼 아이돌", "AI 음악 저작권"],
        "primary": ["site:circlechart.kr", "site:mcot.go.kr", "site:billboard.com", "site:kocca.or.kr"],
        "queries_en": ["K-pop album sales chart", "virtual idol AI music industry"],
        "cover_words": ["STAGE", "FANDOM", "CHART", "TOUR", "SYNTH"],
        "angle": "차트·공시·계약 구조의 확인된 숫자로 K-팝·드라마·웹툰·버추얼 아티스트 산업의 수익 구조를 해부한다.",
        "tool": ("AI 음악·가사 생성기", "https://insightbriefnews.com/music.html"),
        # K-컬쳐 기사 하단에 자연스럽게 붙는 채널 링크. 새 채널이 생기면 여기만 고치면 된다.
        "channels": [
            ("유튜브 · AI 가수 세아(SEA)", "시티팝·발라드로 직접 만든 AI 보컬 곡", "https://www.youtube.com/@SEA-citypop"),
        ],
        # 확장 슬롯 — K-Short Drama(세아 드라마) 채널이 재개되면 아래 주석을 풀고 URL만 넣는다.
        # ("유튜브 · 세아 K-Short Drama", "AI 배우로 만든 한국어 단편 드라마", "https://www.youtube.com/@<드라마 채널 핸들>"),
    },
}

# 예약 슬롯(KST) — 하루 36편: 9개 섹션 × 4편.
# 워크플로가 매시 07분에 깨어나 그때까지 밀린 슬롯을 최대 3편까지 채우므로,
# 매시 :40 한 칸 + 2시간마다 :20 한 칸(총 36칸)이면 한 번에 밀린 슬롯이 2개를 넘지 않고,
# 한 번 실패해도 다음 회차가 그대로 이어받습니다(24회 × 3편 = 72편 여유).
SLOT_TIMES = sorted(
    [f"{h:02d}:40" for h in range(24)]
    + [f"{h:02d}:20" for h in range(0, 24, 2)]
)
CAT_ORDER = ["economy", "trade", "ai", "fire", "world", "property", "energy", "health", "culture"]


def slot_category(index: int, day: datetime) -> str:
    """슬롯 순번과 그날 날짜로 섹션을 돌려 배정한다(9개 섹션 × 4편 = 36편).

    고정 배정이면 매일 같은 시각에 같은 섹션이 나오므로 날짜만큼 한 칸씩 밀어
    아침·점심·저녁 어느 시간대에도 특정 섹션이 몰리지 않게 한다.
    """
    return CAT_ORDER[(index + day.toordinal()) % len(CAT_ORDER)]


def slots_today(day: datetime) -> list[tuple[str, str]]:
    return [(t, slot_category(i, day)) for i, t in enumerate(SLOT_TIMES)]




# 직접 확인한 1차·주요 매체 RSS (2026-11-27 응답·항목 수 검증 완료).
# 정부 부처 대부분은 공개 RSS 가 없어, 부처 발표는 뉴스 헤드라인(구글 뉴스)으로만 잡고
# 본문 수치 인용은 아래 피드의 기사 본문에서만 하도록 프롬프트에 못박습니다.
FEEDS = {
    "YNA_ECONOMY": ("https://www.yna.co.kr/rss/economy.xml", "연합뉴스 경제"),
    "YNA_INDUSTRY": ("https://www.yna.co.kr/rss/industry.xml", "연합뉴스 산업"),
    "YNA_SOCIETY": ("https://www.yna.co.kr/rss/society.xml", "연합뉴스 사회"),
    "YNA_INTL": ("https://www.yna.co.kr/rss/international.xml", "연합뉴스 국제"),
    "YNA_CULTURE": ("https://www.yna.co.kr/rss/culture.xml", "연합뉴스 문화"),
    "HANI_ECONOMY": ("https://www.hani.co.kr/rss/economy/", "한겨레 경제"),
    "MK_ECONOMY": ("https://www.mk.co.kr/rss/30000001/", "매일경제 경제"),
    "FED": ("https://www.federalreserve.gov/feeds/press_all.xml", "미 연준 보도자료"),
    "EIA": ("https://www.eia.gov/rss/todayinenergy.xml", "미 에너지정보청(EIA)"),
    "WHO": ("https://www.who.int/rss-feeds/news-english.xml", "WHO"),
    "BILLBOARD": ("https://www.billboard.com/feed/", "Billboard"),
    "BBC_WORLD": ("https://feeds.bbci.co.uk/news/world/rss.xml", "BBC World"),
    "ALJAZEERA": ("https://www.aljazeera.com/xml/rss/all.xml", "Al Jazeera"),
    "GUARDIAN_WORLD": ("https://www.theguardian.com/world/rss", "The Guardian World"),
    "GUARDIAN_BUSINESS": ("https://www.theguardian.com/business/rss", "The Guardian Business"),
    "GUARDIAN_TECH": ("https://www.theguardian.com/technology/rss", "The Guardian Tech"),
    "GUARDIAN_ENVIRONMENT": ("https://www.theguardian.com/environment/rss", "The Guardian Environment"),
    "GUARDIAN_HEALTH": ("https://www.theguardian.com/society/health/rss", "The Guardian Health"),
    "GUARDIAN_MUSIC": ("https://www.theguardian.com/music/rss", "The Guardian Music"),
    "ARXIV": ("ARXIV", "arXiv (cs.AI·cs.LG)"),
}

DENYLIST = [
    "윈스메이드", "비엠인터내셔날", "비엠인터내셔널", "비엠아이", "BM International",
    "이종근", "이수현", "이지윤", "백석동", "일산동구", "hoppe00", "8288-8658",
]


# ---------------------------------------------------------------- 유틸
def log(msg: str) -> None:
    print(msg, flush=True)


def kst_now() -> datetime:
    return datetime.now(KST)


def http_get(url: str, timeout: int = 30, retries: int = 2) -> bytes:
    last = None
    for attempt in range(retries + 1):
        try:
            req = urllib.request.Request(url, headers={
                "User-Agent": UA,
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                "Accept-Language": "ko-KR,ko;q=0.9,en;q=0.8",
            })
            with urllib.request.urlopen(req, timeout=timeout) as r:
                raw = r.read()
                if r.headers.get("Content-Encoding") == "gzip":
                    import gzip
                    raw = gzip.decompress(raw)
                return raw
        except Exception as exc:  # noqa: BLE001
            last = exc
            if attempt < retries:
                time.sleep(2 * (attempt + 1))
    raise RuntimeError(f"GET 실패 {url}: {last}")


def strip_tags(text: str) -> str:
    return re.sub(r"\s+", " ", htmllib.unescape(re.sub(r"<[^>]+>", " ", text or ""))).strip()


def load_json(path: Path, default):
    try:
        with open(path, encoding="utf-8") as f:
            return json.load(f)
    except Exception:  # noqa: BLE001
        return default


def save_json(path: Path, data) -> None:
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=1)


# ---------------------------------------------------------------- 1차 출처 수집
def fetch_google_news(query: str, hl: str = "ko", gl: str = "KR", ceid: str = "KR:ko",
                      limit: int = 6, period: str = "7d") -> list[dict]:
    q = urllib.parse.quote(f"{query} when:{period}")
    url = f"https://news.google.com/rss/search?q={q}&hl={hl}&gl={gl}&ceid={ceid}"
    try:
        raw = http_get(url, timeout=25)
    except Exception as exc:  # noqa: BLE001
        log(f"  ! 뉴스 RSS 실패({query}): {exc}")
        return []
    out, seen = [], set()
    try:
        root = ET.fromstring(raw)
    except ET.ParseError:
        return []
    for item in root.iter("item"):
        title = strip_tags(item.findtext("title") or "")
        link = (item.findtext("link") or "").strip()
        pub = item.findtext("pubDate") or ""
        src = item.find("{*}source")
        source = strip_tags(src.text) if src is not None and src.text else ""
        if not title or title in seen:
            continue
        seen.add(title)
        if source and title.endswith(" - " + source):
            title = title[: -(len(source) + 3)]
        published = ""
        if pub:
            try:
                published = datetime.strptime(pub, "%a, %d %b %Y %H:%M:%S %Z").replace(
                    tzinfo=timezone.utc).astimezone(KST).strftime("%Y-%m-%d")
            except ValueError:
                published = pub[:16]
        out.append({"title": title, "url": link, "source": source, "published": published})
        if len(out) >= limit:
            break
    return out


def fetch_arxiv(query: str = "cat:cs.AI", limit: int = 4) -> list[dict]:
    url = ("http://export.arxiv.org/api/query?search_query=" + urllib.parse.quote(query) +
           f"&sortBy=submittedDate&sortOrder=descending&max_results={limit}")
    try:
        raw = http_get(url, timeout=30)
        root = ET.fromstring(raw)
    except Exception as exc:  # noqa: BLE001
        log(f"  ! arXiv 실패: {exc}")
        return []
    ns = {"a": "http://www.w3.org/2005/Atom"}
    out = []
    for entry in root.findall("a:entry", ns):
        title = strip_tags(entry.findtext("a:title", default="", namespaces=ns))
        summary = strip_tags(entry.findtext("a:summary", default="", namespaces=ns))
        link = entry.findtext("a:id", default="", namespaces=ns)
        pub = (entry.findtext("a:published", default="", namespaces=ns) or "")[:10]
        if title:
            out.append({"title": title, "url": link, "source": "arXiv", "published": pub,
                        "abstract": summary[:900]})
    return out


def extract_readable(url: str, limit: int = 1400) -> str:
    """기사 본문에서 문단 텍스트만 건져 옵니다(외부 라이브러리 없이)."""
    try:
        raw = http_get(url, timeout=20, retries=1)
    except Exception:  # noqa: BLE001
        return ""
    try:
        text = raw.decode("utf-8", "replace")
    except Exception:  # noqa: BLE001
        return ""
    text = re.sub(r"(?is)<(script|style|noscript|svg|figure|nav|footer|form)[^>]*>.*?</\1>", " ", text)
    chunks = re.findall(r"(?is)<p[^>]*>(.*?)</p>", text)
    out = []
    for c in chunks:
        s = strip_tags(c)
        if len(s) < 60:
            continue
        out.append(s)
        if sum(len(x) for x in out) > limit:
            break
    body = " ".join(out)
    return body[:limit]


def parse_rss_date(text: str) -> str:
    text = (text or "").strip()
    if not text:
        return ""
    for fmt in ("%a, %d %b %Y %H:%M:%S %Z", "%a, %d %b %Y %H:%M:%S %z", "%Y-%m-%dT%H:%M:%S%z",
                "%Y-%m-%dT%H:%M:%SZ", "%Y-%m-%d"):
        try:
            dt = datetime.strptime(text, fmt)
            if dt.tzinfo is None:
                dt = dt.replace(tzinfo=timezone.utc)
            return dt.astimezone(KST).strftime("%Y-%m-%d")
        except ValueError:
            continue
    m = re.search(r"(\d{4})-(\d{2})-(\d{2})", text)
    return m.group(0) if m else ""


def fetch_feed(url: str, name: str, limit: int = 8) -> list[dict]:
    try:
        raw = http_get(url, timeout=25)
        root = ET.fromstring(raw)
    except Exception as exc:  # noqa: BLE001
        log(f"  ! RSS 실패({name}): {exc}")
        return []
    ns = {"a": "http://www.w3.org/2005/Atom"}
    out = []
    items = list(root.iter("item"))
    if items:
        for it in items[:limit]:
            title = strip_tags(it.findtext("title") or "")
            link = (it.findtext("link") or "").strip()
            desc = strip_tags(it.findtext("description") or "")
            pub = parse_rss_date(it.findtext("pubDate") or "" or it.findtext("{http://purl.org/dc/elements/1.1/}date") or "")
            if title:
                out.append({"title": title, "url": link, "source": name, "published": pub,
                            "excerpt": desc[:1200], "kind": "RSS"})
        return out
    for entry in root.findall("a:entry", ns)[:limit]:
        title = strip_tags(entry.findtext("a:title", default="", namespaces=ns))
        link = entry.findtext("a:id", default="", namespaces=ns)
        desc = strip_tags(entry.findtext("a:summary", default="", namespaces=ns))
        pub = parse_rss_date(entry.findtext("a:published", default="", namespaces=ns))
        if title:
            out.append({"title": title, "url": link, "source": name, "published": pub,
                        "excerpt": desc[:1200], "kind": "RSS"})
    return out


def build_source_pool(cat_id: str, exclude: set[str] | None = None) -> list[dict]:
    """근거 자료 풀. exclude 에는 오늘 같은 섹션에서 이미 쓴 자료 URL 을 넣어
    하루 4편이 같은 톱기사를 다시 쓰는 일을 막는다(자료가 모자라면 무시한다)."""
    cfg = CATEGORIES[cat_id]
    pool: list[dict] = []
    fresh_cutoff = (kst_now() - timedelta(days=30)).strftime("%Y-%m-%d")
    for key in cfg.get("feeds", []):
        url, name = FEEDS[key]
        if url == "ARXIV":
            pool += [dict(s, kind="논문", source="arXiv") for s in fetch_arxiv("cat:cs.AI OR cat:cs.LG", limit=6)]
        else:
            pool += fetch_feed(url, name, limit=7)
    # 헤드라인 신호 — 구글 뉴스는 헤드라인·매체·날짜만 주고 본문이 없다(본문 수치 인용 금지).
    # 본문이 있는 자료가 5건 미만일 때만 보탠다(사실성이 우선).
    solid = sum(1 for s in pool if s.get("excerpt"))
    if solid < 5:
        for q in (cfg.get("queries", []) or [])[:2] + (cfg.get("primary", []) or [])[:2]:
            for h in fetch_google_news(q, limit=3):
                pool.append({**h, "kind": "헤드라인만", "excerpt": ""})

    seen, uniq = set(), []
    for s in pool:
        key = re.sub(r"[\s\W]+", "", s.get("title", ""))[:50]
        if not key or key in seen:
            continue
        if s.get("published") and s["published"] < fresh_cutoff:
            continue  # 30일 넘은 자료는 쓰지 않는다(오래된 뉴스가 '오늘 기사'가 되는 사고 방지)
        seen.add(key)
        uniq.append(s)
    # 오늘 이미 쓴 자료(같은 섹션의 앞 편들)는 뺀다. 빠진 뒤 후보가 2건 미만이면 그대로 쓴다.
    exclude = exclude or set()
    if exclude:
        left = [s for s in uniq if s.get("url") not in exclude]
        if len(left) >= 2:
            uniq = left
    # 최근·연관성 점수로 고른다. 제목에 분야 키워드가 있으면 3점, 발췌에 있으면 1점.
    kws = cfg.get("keywords", []) + cfg.get("keywords_en", [])
    cutoff = (kst_now() - timedelta(days=6)).strftime("%Y-%m-%d")

    def score(s: dict) -> int:
        title = s.get("title", "")
        text = title + " " + (s.get("excerpt") or "")
        sc = sum(3 for k in kws if k.lower() in title.lower()) + sum(1 for k in kws if k.lower() in text.lower())
        if s.get("published", "") >= cutoff:
            sc += 2
        return sc

    uniq.sort(key=lambda s: (score(s), s.get("published", "")), reverse=True)
    # 분야 키워드가 걸린 자료를 앞에, 나머지는 뒤에 붙여 최대 9건을 쓴다(자료가 1건뿐인 사고 방지).
    relevant = [s for s in uniq if score(s) >= 3]
    rest = [s for s in uniq if s not in relevant]
    picked = (relevant + rest)[:9]
    for x in picked:
        x["_score"] = score(x)
    # 본문이 짧은 상위 4건은 원문 페이지에서 문단을 더 건져 온다.
    for s in picked[:4]:
        if len(s.get("excerpt", "")) < 400 and s.get("url", "").startswith("http"):
            body = extract_readable(s["url"])
            if len(body) > len(s.get("excerpt", "")):
                s["excerpt"] = body
    return picked


def format_sources(pool: list[dict]) -> str:
    lines = []
    for i, s in enumerate(pool, 1):
        kind = s.get("kind", "")
        warn = " [헤드라인만 — 본문 없음, 수치 인용 금지]" if kind == "헤드라인만" or not s.get("excerpt") else ""
        lines.append(
            f"[S{i}] ({s.get('published') or '날짜 미상'} · {s.get('source') or '출처 미상'} · {kind}){warn} {s['title']}\n"
            f"      {s['url']}\n"
            + (f"      발췌: {s['excerpt']}\n" if s.get("excerpt") else "")
        )
    return "\n".join(lines)


# ---------------------------------------------------------------- Gemini
class GeminiError(RuntimeError):
    pass


class QuotaExhausted(GeminiError):
    """모든 모델이 429·할당량 초과로 막힌 경우. 다음 회차로 넘기고 이번 회차는 저장만 한다."""


_pace_lock = threading.Lock()
_last_call = [0.0]


def _pace() -> None:
    """호출 간격을 조금 벌려 분당 요청 한도(RPM)에 부딪치지 않게 한다(429 폭주 방지)."""
    try:
        gap = float(os.environ.get("IB_GEMINI_MIN_INTERVAL", "2.5"))
    except ValueError:
        gap = 2.5
    with _pace_lock:
        wait = gap - (time.time() - _last_call[0])
        if wait > 0:
            time.sleep(wait)
        _last_call[0] = time.time()


_FAKE_PARTS = {
    "ko": [
        "## 고시 수치가 가리키는 지점",
        "자료에 따르면 지난달 기준금리는 3.25%로 유지됐고 가계대출 잔액은 1,900조원을 넘었다. "
        "은행권 주담대 금리는 4.1~4.6% 구간에서 움직였고, 신용대출 평균은 5.8%를 기록했다. "
        "이 숫자는 통장에서 빠지는 이자를 기준으로 가계가 어디에 서 있는지를 보여준다.",
        "## 수입 원가와 환율의 관계",
        "원·달러 환율이 1,342.7원일 때 1,000달러짜리 원료를 사오면 134만2,700원이 나간다. "
        "환율이 10원 오르면 같은 물량에 1만원이 더 붙고, 이는 도착원가와 판매가 사이의 마진을 그대로 깎는다.",
        "## 제도가 정한 조건",
        "금융위 고시는 만기와 상환 방식을 조건으로 못 박고 있다. 조건을 채우지 못하면 금리 상한이 적용되지 않아 "
        "실제 부담은 고시 문구보다 커진다. 계약서에서 확인해야 할 항목은 중도상환수수료와 인상 상한이다.",
        "## 확인되지 않은 부분",
        "다음 달 추가 인상 여부는 아직 확인되지 않았다. 자료에는 위원회 일정만 있고 결정 내용은 없다.",
    ],
    "en": [
        "## What the published figures actually say",
        "The policy rate held at 3.25% last month and household loan balances passed 1,900 trillion won, "
        "according to the central bank data cited in the sources. Mortgage rates moved between 4.1% and 4.6%, "
        "while unsecured borrowing averaged 5.8%. For a borrower in Seoul or in Ohio, the number that matters "
        "is the monthly payment, not the headline rate.",
        "## Why the exchange rate moves the invoice",
        "At 1,342.7 won to the dollar, a 1,000 dollar order of raw material costs 1.34 million won. "
        "A ten won move adds 10,000 won to the same shipment and takes the same amount out of the margin "
        "between landed cost and the price a buyer will pay.",
        "## The conditions written into the rule",
        "The regulator ties the rate cap to maturity and repayment terms. A contract that misses a condition "
        "loses the cap, so the real cost ends up above the published figure. The clauses to check are the "
        "prepayment penalty and the annual increase limit.",
        "## What is not confirmed",
        "Whether the next meeting raises rates again is not confirmed. The sources carry the calendar, "
        "not the decision.",
    ],
    "zh": [
        "## 公示数字指向的位置",
        "据资料来源, 上个月基准利率维持在3.25%, 家庭贷款余额超过1,900万亿韩元。抵押贷款利率在4.1%至4.6%之间波动, "
        "信用贷款平均利率为5.8%。对中国读者来说, 真正要看的是每月还款额和进口原料的到岸成本, 而不是标题上的利率。",
        "## 汇率如何改变账单",
        "按1美元兑1,342.7韩元计算, 1,000美元的原料订单需要支付134万2,700韩元。汇率上升10韩元, 同样一批货就要多付1万韩元, "
        "这部分钱直接从到岸价与售价之间的利润里扣掉。",
        "## 规则写死的条件",
        "监管机构把利率上限与期限、还款方式绑在一起。条件不满足时上限不适用, 实际负担就会高于公示数字。"
        "合同里需要逐条核对的是提前还款手续费和年度上调幅度。",
        "## 尚未确认的部分",
        "下次会议是否继续加息尚未确认。资料里只有日程, 没有决定内容。",
    ],
    "ja": [
        "## 公表された数字が指す場所",
        "資料によると、先月の基準金利は3.25%で据え置かれ、家計貸付残高は1,900兆ウォンを超えた。"
        "住宅ローン金利は4.1~4.6%の範囲で動き、信用貸付の平均は5.8%だった。"
        "日本の読者にとって重要なのは見出しの金利ではなく、毎月の返済額と輸入原料の着荷原価である。",
        "## 為替が請求額を変える理由",
        "1ドル=1,342.7ウォンなら、1,000ドルの原料発注には134万2,700ウォンがかかる。"
        "為替が10ウォン動けば同じ荷物に1万ウォンが上乗せされ、着荷原価と販売価格の間の利益からそのまま引かれる。",
        "## 制度が決めた条件",
        "規制当局は金利上限を期間と返済方式に結び付けている。条件を満たさない契約には上限が適用されず、"
        "実際の負担は公表値より大きくなる。契約書で確認すべきは繰上返済手数料と毎年の引上げ幅だ。",
        "## 確認されていない部分",
        "次回会合でさらに利上げするかは確認されていない。資料には日程だけがあり、決定内容はない。",
    ],
}


def _fake_response(prompt: str) -> str:
    """API 없이 파이프라인(원고 구조·커버 카드·빌드·SEO 점검)만 시험할 때 쓰는 고정 응답.

    IB_FAKE_GEMINI=1 일 때만 쓰이고, 이 원고로는 커밋하지 못하게 publish() 에서 막는다.
    """
    m = re.search(r"\[작성 언어\]\s*(ko|en|zh|ja)", prompt)
    lang = m.group(1) if m else "ko"
    parts = _FAKE_PARTS[lang]
    body = "\n\n".join(parts * 3)
    if lang == "ko":
        title = "기준금리 3.25% 유지, 가계 이자 부담이 달라지는 지점"
        deck = "가계대출 잔액 1,900조원과 주담대 4.1~4.6% 구간이 만나는 곳에서 실제 부담이 갈린다."
        summary = ["기준금리 3.25% 유지로 변동금리 대출의 이자 부담이 그대로 이어진다.",
                   "가계대출 잔액 1,900조원, 주담대 4.1~4.6% 구간이 실제 상환액을 가른다.",
                   "중도상환수수료와 인상 상한을 계약서에서 확인해야 한다."]
        tags = ["기준금리", "가계부채", "주택담보대출", "환율", "도착원가"]
    elif lang == "en":
        title = "A 3.25% policy rate and 1,900 trillion won of household debt"
        deck = "Mortgage rates of 4.1% to 4.6% decide what a borrower actually pays, not the headline rate."
        summary = ["The policy rate held at 3.25%, keeping variable-rate payments where they are.",
                   "Household loan balances passed 1,900 trillion won, with mortgages at 4.1% to 4.6%.",
                   "Prepayment penalties and annual increase limits are the clauses to check."]
        tags = ["policy rate", "household debt", "mortgage", "exchange rate", "landed cost"]
    elif lang == "zh":
        title = "基准利率维持3.25%, 家庭债务超过1,900万亿韩元"
        deck = "抵押贷款利率4.1%至4.6%决定实际还款额, 而不是标题上的基准利率。"
        summary = ["基准利率维持3.25%, 浮动利率贷款负担没有变化。",
                   "家庭贷款余额突破1,900万亿韩元, 抵押贷款利率处于4.1%至4.6%区间。",
                   "合同里要核对提前还款手续费与年度上调幅度。"]
        tags = ["基准利率", "家庭债务", "抵押贷款", "汇率", "到岸成本"]
    else:
        title = "基準金利3.25%据え置き、家計債務1,900兆ウォンが示すもの"
        deck = "住宅ローン金利4.1~4.6%の範囲が実際の返済額を決める。"
        summary = ["基準金利は3.25%で据え置かれ、変動金利の返済負担は変わらない。",
                   "家計貸付残高は1,900兆ウォンを超え、住宅ローンは4.1~4.6%で動く。",
                   "契約書では繰上返済手数料と毎年の引上げ幅を確認する必要がある。"]
        tags = ["基準金利", "家計債務", "住宅ローン", "為替", "着荷原価"]
    return json.dumps({
        "id_slug": "fake-pipeline-check",
        "title": title,
        "deck": deck,
        "summary": summary,
        "body": body,
        "tags": tags,
        "cover": {"label": "CHECK FILE 01", "word": "CHECK"},
        "readMinutes": 7,
        "sources": [],
        "fact_check": {"confirmed": ["시험용 고정 문장(API 미호출)"], "unconfirmed": ["실제 사실 아님 — 파이프라인 점검용"]},
    }, ensure_ascii=False)


def call_gemini(prompt: str, max_output_tokens: int = 12000, json_mode: bool = True,
                temperature: float = 0.85, timeout: int = 240, attempts: int = 2) -> tuple[str, str]:
    if os.environ.get("IB_FAKE_GEMINI") == "1":
        return _fake_response(prompt), "fake"
    api_key = os.environ.get("GEMINI_API_KEY", "").strip()
    if not api_key:
        raise GeminiError("GEMINI_API_KEY 가 없습니다.")
    chain = [os.environ.get("GEMINI_MODEL", "").strip()] + MODEL_CHAIN
    chain = [m for i, m in enumerate(chain) if m and m not in chain[:i]]
    payload = {
        "contents": [{"role": "user", "parts": [{"text": prompt}]}],
        "generationConfig": {
            "temperature": temperature,
            "topP": 0.95,
            "maxOutputTokens": max_output_tokens,
            "thinkingConfig": {"thinkingBudget": 0},
        },
        "safetySettings": [
            {"category": c, "threshold": "BLOCK_ONLY_HIGH"} for c in [
                "HARM_CATEGORY_HARASSMENT", "HARM_CATEGORY_HATE_SPEECH",
                "HARM_CATEGORY_SEXUALLY_EXPLICIT", "HARM_CATEGORY_DANGEROUS_CONTENT",
            ]
        ],
    }
    if json_mode:
        payload["generationConfig"]["responseMimeType"] = "application/json"
    errors = []
    for model in chain:
        url = f"{API_ROOT}/models/{model}:generateContent?key={urllib.parse.quote(api_key)}"
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        for attempt in range(max(1, attempts)):
            _pace()
            try:
                req = urllib.request.Request(url, data=body, headers={"Content-Type": "application/json"})
                with urllib.request.urlopen(req, timeout=timeout) as r:
                    data = json.loads(r.read().decode("utf-8"))
                cand = (data.get("candidates") or [{}])[0]
                text = "".join(p.get("text", "") for p in (cand.get("content") or {}).get("parts", []))
                if not text.strip():
                    raise GeminiError(f"빈 응답(finishReason={cand.get('finishReason')})")
                return text, model
            except urllib.error.HTTPError as exc:
                detail = ""
                try:
                    detail = exc.read().decode("utf-8", "replace")[:200]
                except Exception:  # noqa: BLE001
                    pass
                errors.append(f"{model} HTTP {exc.code}: {detail}")
                if exc.code in (400, 403, 404):
                    break
                if exc.code in (429, 500, 503, 504):
                    if attempt >= max(1, attempts) - 1:
                        break
                    time.sleep([10, 25][min(attempt, 1)])
                    continue
                break
            except Exception as exc:  # noqa: BLE001
                errors.append(f"{model} {type(exc).__name__}: {exc}")
                time.sleep(6)
    joined = " | ".join(errors[-3:])
    # 모든 모델이 할당량(429/RESOURCE_EXHAUSTED)으로 막히면 조용히 멈추고 다음 회차로 넘긴다.
    if errors and all(("429" in e or "RESOURCE_EXHAUSTED" in e or "quota" in e.lower()) for e in errors):
        raise QuotaExhausted("할당량 소진: " + joined)
    raise GeminiError("모든 모델 실패: " + joined)


def extract_json(text: str) -> dict:
    t = re.sub(r"^```(?:json)?\s*", "", text.strip())
    t = re.sub(r"\s*```$", "", t)
    dec = json.JSONDecoder()
    found, i = [], 0
    while True:
        i = t.find("{", i)
        if i < 0:
            break
        try:
            obj, end = dec.raw_decode(t, i)
            if isinstance(obj, dict):
                found.append(obj)
            i = max(end, i + 1)
        except json.JSONDecodeError:
            i += 1
    if not found:
        raise ValueError("JSON 없음")
    return max(found, key=lambda o: sum(len(str(v)) for v in o.values()))


# ---------------------------------------------------------------- 기사 쓰기
PROMPT = """[작성 언어] ko — 본문·제목·소제목·요약·태그를 모두 한국어로 쓴다.
당신은 탐사 웹진 '인사이트 브리프'(insightbriefnews.com)의 {label} 담당 기자다.
오늘 {date} 자 {label} 기사 1편을 한국어로 쓴다.

[이 기사의 각도]
{angle}

[이 기사가 다룰 주제 — 이 하나만 깊게 쓴다]
{main_item}
다른 자료는 이 주제의 배경·대조·계산에만 쓰고, 관계없는 사건을 한 기사에 묶지 않는다.

[바로가기할 무료 툴 — 본문 마지막 절에서 자연스럽게 1번 링크]
{tool_name}: {tool_url}

[확장 링크 — 아래가 있으면 본문 맨 끝 '더 보기' 문장에 1번 언급한다]
{channels}

[근거 자료 — 이 목록 밖의 사실·수치·인용은 쓰지 않는다]
{sources}

[최근에 이미 다룬 제목 — 같은 사건을 또 쓰지 말고 다른 각도로]
{recent}

[작성 규칙]
- 본문은 한국어 1,900~2,500자(공백 제외 1,500자 이상), H2 소제목 4~6개.
- 첫 문단에 핵심 숫자 또는 날짜를 넣고, 인사말·"알아보겠습니다" 같은 도입은 쓰지 않는다.
- 모든 H2 절에 기관명·수치·날짜 중 최소 1개를 넣는다. 근거 자료에 없는 숫자는 만들지 않는다.
- '헤드라인만'으로 표시된 자료는 제목만 본 것이므로 그 안의 숫자를 인용하지 않는다(사실관계만 참고).
- 확인되지 않은 부분은 '확인되지 않음'이라고 본문에 적고 fact_check 에도 남긴다.
- 본문 첫 문단 바로 다음 줄에 이미지 한 줄: ![구체적인 사진 설명글 1줄](assets/img/articles/{article_id}.jpg)
- summary: 3문장(각 60~120자), 본문 사실 요약.
- title: 20~48자, 핵심 수치를 넣되 제목 맨 앞에 날짜(2026-11-27, 2026년 11월 27일)를 붙이지 않는다.
  '해부·분석' 같은 상투어도 쓰지 않는다.
- deck: 2~3문장, 숫자 최소 1개.
- tags: 6~10개(고유명사·지표명·기관명 위주).
- cover: {{"label": "{label_en} FILE NN", "word": "영문 대문자 키워드 1개"}} (NN은 01~99).
- id_slug: 기사 주소에 쓸 영문 소문자·하이픈 3~6단어(예: bok-rate-hold-dec-2026).
- sources: 실제로 근거로 쓴 자료만 [{{"name": "매체·기관", "date": "YYYY-MM-DD 또는 미상", "url": "원문 주소"}}], 2~6개.
- fact_check: {{"confirmed": ["자료로 확인한 사실 3~5개"], "unconfirmed": ["자료에 없어 단정하지 않은 것 1~3개"]}}
- seal: 본문 마지막에 "{tool_name}" 링크를 '직접 계산·확인하기' 문장으로 1번만 넣는다.

[절대 금지]
- '결론적으로', '시사한다', '방증한다', '주목된다', '~할 전망이다', '가능성이 높다', '~라고 할 수 있다' 같은 상투적 마무리·전망 문장을 쓰지 않는다.
- 실제 개인 이름, 실제 회사명, 특정 동네·주소, 연락처, 개인의 재무 상황을 쓰지 않는다.
필요하면 '○○상사', '한 중소 수입업체'처럼 일반화한다. 투자 권유·매수 추천도 쓰지 않는다.

[출력] 아래 키만 가진 JSON 하나만 출력한다. 설명 텍스트는 넣지 않는다.
{{"id_slug": "", "title": "", "deck": "", "summary": ["", "", ""], "body": "",
 "tags": [], "cover": {{"label": "", "word": ""}}, "readMinutes": 7,
 "sources": [], "fact_check": {{"confirmed": [], "unconfirmed": []}}}}
"""


# ---------------------------------------------------------------- 국가별 별도 원고
# 한국어판을 그대로 번역하지 않고, 같은 근거 자료로 그 나라 독자(통화·제도·사례)를
# 기준으로 다시 씁니다. 한국어판은 사실·수치의 기준점으로만 보여 줍니다.
PROMPT_LANG = """[작성 언어] {lang} — 제목·부제·소제목·요약·태그를 모두 {lang_name}로 쓴다. 한국어를 남기지 않는다.
당신은 탐사 웹진 '인사이트 브리프'(insightbriefnews.com)의 {label} 담당 기자다.
오늘 {date} 자 {label} 기사를 {lang_name}로 쓴다. 독자는 {audience}.

[이 기사가 다룰 주제 — 한국어판과 같은 사건 하나만]
{main_item}

[한국어판 — 사실·수치의 기준점. 번역하지 말고, 이 나라 독자에게 필요한 관점·사례·통화로 다시 쓴다]
제목: {ko_title}
부제: {ko_deck}
요약: {ko_summary}
본문:
{ko_body}

[현지 맥락 — 이 나라 독자가 자기 돈과 제도로 읽도록]
{context}
{glossary_line}
[통화·환산]
{fx_note}

[근거 자료 — 이 목록 밖의 사실·수치·인용은 쓰지 않는다]
{sources}

[바로가기할 무료 툴 — 본문 마지막 절에서 자연스럽게 1번 링크]
{tool_name}: {tool_url}

[작성 규칙]
- 본문은 {lang_name}로 {target}, H2 소제목 4~6개.
- 첫 문단에 핵심 숫자 또는 날짜를 넣고, 인사말·"알아보겠습니다" 같은 도입은 쓰지 않는다.
- 모든 H2 절에 기관명·수치·날짜 중 최소 1개를 넣는다. 자료에 없는 숫자를 만들지 않는다.
- 한국어판에 있는 수치는 그대로 쓴다(임의로 바꾸지 않는다). 환산할 때는 위 환율만 쓰고 '기준일'을 밝힌다.
- '헤드라인만'으로 표시된 자료는 제목만 본 것이므로 그 안의 숫자를 인용하지 않는다.
- 확인되지 않은 부분은 본문에 그 사실을 적고(예: not confirmed / 尚未确认 / 未確認) fact_check 에도 남긴다.
- 본문 첫 문단 바로 다음 줄에 이미지 한 줄: ![그 나라 말로 쓴 사진 설명 1줄](assets/img/articles/{article_id}.jpg)
- summary: 3문장. deck: 2~3문장(숫자 최소 1개). tags: 6~10개(그 나라 말).
- title: {title_rule}. 제목 맨 앞에 날짜를 붙이지 않는다.
- cover: {{"label": "{label_en} FILE NN", "word": "대문자 핵심어 1개"}} (NN은 01~99).
- fact_check: {{"confirmed": ["자료로 확인한 사실 3~5개"], "unconfirmed": ["자료에 없어 단정하지 않은 것 1~3개"]}} — {lang_name}로.

[절대 금지]
- 상토적 마무리·전망 문장: {cliche}
- 실제 개인 이름, 실제 회사명, 특정 동네·주소, 연락처, 개인의 재무 상황. 필요하면 일반화한다. 투자 권유·매수 추천 금지.
- 한국어판을 줄줄이 직역한 티가 나는 문장·문단 구조. 문장 순서와 예시는 이 나라 독자 기준으로 다시 짠다.
- 한국어 글자·한국어 표현을 제목이나 본문에 남기는 것.

[출력] 아래 키만 가진 JSON 하나만 출력한다. 설명 텍스트는 넣지 않는다.
{{"title": "", "deck": "", "summary": ["", "", ""], "body": "",
 "tags": [], "cover": {{"label": "", "word": ""}}, "readMinutes": 7,
 "fact_check": {{"confirmed": [], "unconfirmed": []}}}}
"""

HANGUL_RE = re.compile(r"[가-힣]")


def fx_note(lang: str) -> str:
    """시토판에 기록된 고시 환율을 프롬프트에 근거로 준다(임의 환산 금지)."""
    market = load_json(DATA / "market.json", {}) or {}
    rows = {r.get("code"): r for r in (market.get("oilFx") or []) if isinstance(r, dict)}
    asof = market.get("asOf") or "기준일 미상"
    usd, cny, jpy = rows.get("USD/KRW"), rows.get("CNY/KRW"), rows.get("JPY/KRW")
    ko = "자료에 나온 원화(₩) 금액을 그대로 쓴다. 달러·유로 표기는 자료에 있을 때만 쓴다."
    if lang == "en":
        if usd and isinstance(usd.get("price"), (int, float)):
            return (f"The only conversion basis you may use is 1 USD = {usd['price']:,.1f} KRW "
                    f"(insightbriefnews.com market board, as of {asof}). Write converted amounts as 'approximately' "
                    f"and name that date. Do not use any other exchange rate.")
        return "Use the currency as printed in the sources; do not convert on your own."
    if lang == "zh":
        if cny and isinstance(cny.get("price"), (int, float)):
            return (f"只能用这一汇率换算: 1元人民币 = {cny['price']:,.2f}韩元(本站行情板 {asof} 公布)。"
                    f"换算后的金额写成“约”并注明该日期, 不得使用其他汇率。")
        return "货币单位按资料原样引用, 不要自行换算。"
    if lang == "ja":
        if jpy and isinstance(jpy.get("price"), (int, float)):
            return (f"換算に使えるのは 100円 = {jpy['price']:,.2f}ウォン(当サイトの市況ボード {asof} 時点)のみ。"
                    f"換算額は「約」と書いてその日付を添える。ほかのレートは使わない。")
        return "通貨は資料のまま引用し、独自に換算しない。"
    return ko


def measure_body(text: str, lang: str) -> tuple[int, str]:
    if lang == "en":
        return len(re.findall(r"[A-Za-z0-9][A-Za-z0-9'’\-]*", text or "")), "words"
    return count_chars_no_space(text), "chars"


def shorten(text: str, limit: int = 1800) -> str:
    t = re.sub(r"\s+", " ", text or "").strip()
    return t[:limit]


def make_variant(article: dict, cat_id: str, lang: str, pool: list[dict]) -> dict | None:
    """그 나라 독자용 원고 한 편. 실패하면 None(그 언어는 기존 기계번역으로 매워진다)."""
    spec = LANGS[lang]
    cfg = CATEGORIES[cat_id]
    label = cfg.get(f"label_{lang}") or cfg.get("label_en") or cfg["label"]
    tool_name, tool_url = cfg["tool"]
    ko_body = re.sub(r"!\[[^\]]*\]\([^)]*\)\s*", "", article.get("body") or "")
    prompt = PROMPT_LANG.format(
        lang=lang, lang_name=spec["name"], label=label, label_en=cfg["label_en"],
        date=kst_now().strftime("%Y-%m-%d"), audience=spec["audience"],
        main_item=f"{pool[0]['title']} ({pool[0].get('source') or '출처'} · {pool[0].get('published') or '날짜 미상'})",
        ko_title=article.get("title", ""), ko_deck=article.get("deck", ""),
        ko_summary=" / ".join(article.get("summary") or []), ko_body=shorten(ko_body, 3200),
        context=spec["context"], fx_note=fx_note(lang), sources=format_sources(pool),
        glossary_line=("\n[고정 용어 — 이 표기를 그대로 쓴다(다른 뜻으로 옮기지 않는다)]\n" + spec["glossary"] + "\n") if spec.get("glossary") else "",
        tool_name=tool_name, tool_url=tool_url, target=spec["target"],
        title_rule=spec["title_rule"], cliche=", ".join(spec["cliche"]),
        article_id=article["id"],
    )
    data = extract_json(call_gemini(prompt, max_output_tokens=14000, timeout=120, attempts=1)[0])

    # 분량 미달이면 한 번만 확장을 청한다(자료에 근거한 절을 덧붙이기).
    have, unit = measure_body(data.get("body", ""), lang)
    if have < spec["min_chars" if lang != "en" else "min_words"]:
        try:
            extra = (prompt + f"\n\n[확장] 직전 초안은 {have}{unit}로 분량이 부족하다. 기존 문장은 지우지 말고 "
                     f"자료에 근거한 H2 절을 본문 끝에 붙여 {spec['target']}로 만든다. 같은 키를 가진 JSON 전체를 다시 출력한다.\n"
                     + json.dumps({k: data.get(k) for k in ("title", "deck", "summary", "body")},
                                  ensure_ascii=False)[:12000])
            d2 = extract_json(call_gemini(extra, max_output_tokens=14000, timeout=120, attempts=1)[0])
            if measure_body(d2.get("body", ""), lang)[0] > have:
                data = d2
        except QuotaExhausted:
            raise
        except Exception as exc:  # noqa: BLE001
            log(f"    · {lang} 확장 생략: {exc}")

    body = clean_body(data.get("body", ""), article["id"], alt=spec["img_alt"])
    # 한국어가 섞이면 그 언어판으로 내보내지 않는다(번역으로 매운다).
    if HANGUL_RE.search((data.get("title") or "") + body):
        log(f"    ! {lang} 원고에 한국어가 섞여 기계번역으로 대체합니다")
        return None
    cliche = [p for p in spec["cliche"] if p in body or p in (data.get("title") or "")]
    if cliche:
        log(f"    · {lang} 상토어 {cliche} — 재작성 1회")
        try:
            d3 = extract_json(call_gemini(prompt + "\n\n[재작성] 다음 상토어가 남았다: " + ", ".join(cliche)
                                          + ". 사실과 수치 중심으로 다시 쓰고 그 표현은 삭제한다.",
                                          max_output_tokens=14000, timeout=120, attempts=1)[0])
            body3 = clean_body(d3.get("body", ""), article["id"], alt=spec["img_alt"])
            if body3 and not HANGUL_RE.search((d3.get("title") or "") + body3):
                data, body = d3, body3
        except QuotaExhausted:
            raise
        except Exception:  # noqa: BLE001
            pass
    if find_violations(data):
        log(f"    ! {lang} 금지 문자열 — 기계번역으로 대체합니다")
        return None
    tool_name, tool_url = cfg["tool"]
    if tool_url not in body:
        body += f"\n\n{tool_url}"
    fc = data.get("fact_check") if isinstance(data.get("fact_check"), dict) else {}
    block = {
        "title": (data.get("title") or "").strip(),
        "deck": (data.get("deck") or "").strip(),
        "summary": [s for s in (data.get("summary") or []) if isinstance(s, str)][:3],
        "body": body,
        "tags": [t for t in (data.get("tags") or []) if isinstance(t, str)][:10],
        "cover": data.get("cover") or {"label": cfg["label_en"] + " FILE", "word": cfg["label_en"]},
        "readMinutes": int(data.get("readMinutes") or max(5, measure_body(body, lang)[0] // 400)),
        "author": spec["author"],
        "authorRole": spec["author"],
        "factCheck": {
            "title": spec["fc_title"],
            "confirmed": [x for x in (fc.get("confirmed") or []) if isinstance(x, str)][:6],
            "unconfirmed": [x for x in (fc.get("unconfirmed") or []) if isinstance(x, str)][:4],
        },
    }
    if not block["title"] or not block["body"]:
        return None
    return block


def attach_variants(article: dict, cat_id: str, pool: list[dict], langs: list[str]) -> dict[str, dict]:
    """en·zh·ja 원고를 병렬로 쓴다. 한 언어가 실패해도 나머지는 그대로 쓴다."""
    todo = [l for l in langs if l != "ko" and l in LANGS]
    if not todo:
        return {}
    out: dict[str, dict] = {}
    with ThreadPoolExecutor(max_workers=min(3, len(todo))) as ex:
        futs = {l: ex.submit(make_variant, article, cat_id, l, pool) for l in todo}
        for lang, fut in futs.items():
            try:
                blk = fut.result()
            except QuotaExhausted as exc:
                log(f"    ! {lang} 할당량 소진: {exc}")
                raise
            except Exception as exc:  # noqa: BLE001
                log(f"    ! {lang} 원고 실패: {exc}")
                continue
            if blk:
                out[lang] = blk
                log(f"    + {lang} 원고 {measure_body(blk['body'], lang)[0]}자 — {blk['title'][:52]}")
    return out


def recent_titles(articles: list[dict], category: str, days: int = 7) -> list[str]:
    cutoff = (kst_now() - timedelta(days=days)).strftime("%Y-%m-%d")
    out = []
    for a in articles:
        if a.get("category") != category:
            continue
        if (a.get("date") or "") < cutoff:
            continue
        out.append(f"- {a.get('title')}")
        if len(out) >= 10:
            break
    return "\n".join(out) or "- (없음)"


def clean_body(body: str, article_id: str, alt: str = "기사 주제를 보여 주는 에디토리얼 이미지") -> str:
    body = (body or "").replace("\r\n", "\n").strip()
    # 이미지 경로 강제: 본문에 이미지 한 줄이 없으면 첫 문단 뒤에 넣는다.
    # alt 문구는 그 언어로 넣어야 외국어판에 한국어가 섞이지 않는다.
    img = f"(assets/img/articles/{article_id}.jpg)"
    body = re.sub(r"\]\((?:\.\./)*assets/img/articles/[^)]*\)", "]" + img, body)
    if "assets/img/articles/" not in body:
        parts = body.split("\n\n", 1)
        body = parts[0] + f"\n\n![{alt}]{img}" + (
            "\n\n" + parts[1] if len(parts) > 1 else "")
    body = re.sub(r"\n{3,}", "\n\n", body)
    return body


def find_violations(obj) -> list[str]:
    text = json.dumps(obj, ensure_ascii=False)
    return [w for w in DENYLIST if w in text]


def count_chars_no_space(text: str) -> int:
    return len(re.sub(r"\s+", "", text or ""))


def slug_of(text: str) -> str:
    s = re.sub(r"[^a-z0-9-]+", "-", (text or "").lower()).strip("-")
    s = re.sub(r"-{2,}", "-", s)
    return s[:60].strip("-") or "brief"


def make_article(cat_id: str, pool: list[dict], articles: list[dict]) -> dict:
    cfg = CATEGORIES[cat_id]
    today = kst_now().strftime("%Y-%m-%d")
    stamp = hashlib.sha1((cat_id + today + pool[0]["title"]).encode()).hexdigest()[:4]
    tmp_id = f"{cat_id}-{today.replace('-', '')}-{stamp}"
    channels = "\n".join(f"- {n} — {d} — {u}" for n, d, u in cfg.get("channels", []) or []) or "- (없음)"
    tool_name, tool_url = cfg["tool"]
    ranked = [x for x in pool if x.get("_score", 0) >= 3]
    if not ranked:
        raise RuntimeError("분야와 맞는 자료를 찾지 못했습니다(0점 자료뿐) — 이 슬롯은 건너뜁니다.")
    pool = ranked[:7]
    prompt = PROMPT.format(
        label=cfg["label"], label_en=cfg["label_en"], date=today, angle=cfg["angle"],
        tool_name=tool_name, tool_url=tool_url, channels=channels,
        main_item=f"{pool[0]['title']} ({pool[0].get('source') or '출처'} · {pool[0].get('published') or '날짜 미상'})",
        sources=format_sources(pool), recent=recent_titles(articles, cat_id), article_id=tmp_id,
    )
    draft, model = call_gemini(prompt)
    data = extract_json(draft)

    # 분량 미달이면 최대 두 번 더 요청(같은 자료, 분량 지시 강화). 가장 긴 초안을 남긴다.
    for attempt in range(2):
        if count_chars_no_space(data.get("body", "")) >= 1800:
            break
        cur = count_chars_no_space(data.get("body", ""))
        retry = (prompt + f"\n\n[재작성] 앞의 초안은 공백 제외 {cur}자로 분량이 부족했다. "
                 f"자료에 있는 사실을 더 세분해 H2 절을 6개로 늘리고, 공백 제외 1,950자 이상으로 다시 쓴다.")
        draft2, model2 = call_gemini(retry, max_output_tokens=12000)
        try:
            d2 = extract_json(draft2)
        except Exception:  # noqa: BLE001
            break
        if count_chars_no_space(d2.get("body", "")) > cur:
            data, model = d2, model2

    # 그래도 짧으면 기존 본문을 살린 채 절을 덧붙이는 확장 요청(전면 재작성보다 잘 먹는다).
    cur = count_chars_no_space(data.get("body", ""))
    if cur < 1800:
        try:
            expand = (prompt + "\n\n[직전 초안 — 삭제·축약하지 말고 확장한다]\n" + json.dumps(
                {k: data.get(k) for k in ("title", "deck", "summary", "body")}, ensure_ascii=False)[:14000]
                + f"\n\n[확장 지시] 현재 본문은 공백 제외 {cur}자다. 기존 문장은 그대로 두고, 자료에 근거한 H2 절 2개"
                  "(예: 실제 비용·수치 계산, 반대 사례와 한계)를 본문 끝에 덧붙여 1,950자 이상으로 만든다. "
                  "같은 말을 반복해 채우면 안 되고, 자료에 없는 숫자도 쓰지 않는다. 같은 키를 가진 JSON 전체를 출력한다.")
            dx, modelx = call_gemini(expand, max_output_tokens=14000)
            d2 = extract_json(dx)
            if count_chars_no_space(d2.get("body", "")) > cur:
                for k in ("title", "deck", "summary", "tags", "cover", "sources", "fact_check", "id_slug"):
                    if not d2.get(k) and data.get(k):
                        d2[k] = data[k]
                data, model = d2, modelx
        except Exception:  # noqa: BLE001
            pass

    viol = find_violations(data)
    if viol:
        # 민감 문자열이 남으면 한 번만 다시 쓴다.
        retry = prompt + "\n\n[재작성] 초안에 공개하면 안 되는 고유명사가 남았다. 일반화해서 다시 쓴다."
        data = extract_json(call_gemini(retry)[0])
        viol = find_violations(data)
        if viol:
            raise RuntimeError(f"금지 문자열 남음: {viol}")

    # 제목 앞에 붙은 날짜 접두(2026-11-27 / 2026년 11월 27일,)는 제목에서 뺀다.
    title = (data.get("title") or "").strip()
    title = re.sub(r"^\d{4}-\d{2}-\d{2}\s*[,·:]?\s*", "", title)
    title = re.sub(r"^\d{4}년\s*\d{1,2}월\s*\d{1,2}일\s*[,·:]?\s*", "", title)
    data["title"] = title.strip() or (data.get("title") or "").strip()
    article_id = f"{slug_of(data.get('id_slug') or data.get('cover', {}).get('word', 'brief'))}-{today.replace('-', '')}"
    if any(a.get("id") == article_id for a in articles):
        article_id += "-" + stamp

    body = clean_body(data.get("body", ""), article_id)
    # 상투적 AI 문장이 남으면 한 번 다시 쓴다(품질 규칙).
    cliche = [p for p in ("결론적으로", "시사한다", "방증한다", "주목된다", "전망이다", "가능성이 높다") if p in body]
    if cliche:
        try:
            d3 = extract_json(call_gemini(prompt + "\n\n[재작성] 초안에 다음 상투어가 남았다: " + ", ".join(cliche) +
                                         ". 사실과 수치 중심으로 다시 쓰고, 그 표현은 삭제한다.")[0])
            body2 = clean_body(d3.get("body", ""), article_id)
            if count_chars_no_space(body2) >= count_chars_no_space(body) - 200 and not any(p in body2 for p in cliche):
                data, body = d3, body2
        except Exception:  # noqa: BLE001
            pass
    # 무료 툴·채널 링크는 본문에 반드시 남긴다(모델이 빠뜨리면 문단으로 덧붙인다).
    tool_name, tool_url = cfg["tool"]
    if tool_url not in body:
        body += f"\n\n직접 계산·확인하기: [{tool_name}]({tool_url})"
    for name, desc, url in (cfg.get("channels") or []):
        if url not in body:
            body += f"\n\n더 보기: [{name} — {desc}]({url})"
    data["body"] = body
    published = kst_now().replace(microsecond=0).isoformat()
    src = [s for s in (data.get("sources") or [])
           if isinstance(s, dict) and str(s.get("url", "")).startswith("http")
           and "news.google.com" not in s.get("url", "")]
    if len(src) < 2:
        for s in pool:
            if s.get("url", "").startswith("http") and "news.google.com" not in s.get("url", ""):
                entry = {"name": s.get("source") or "출처", "date": s.get("published") or "미상", "url": s["url"]}
                if entry["url"] not in [x["url"] for x in src]:
                    src.append(entry)
            if len(src) >= 3:
                break
    article = {
        "id": article_id,
        "category": cat_id,
        "title": (data.get("title") or "").strip(),
        "deck": (data.get("deck") or "").strip(),
        "date": today,
        "sample": False,
        "author": "인사이트 브리프 편집실",
        "authorRole": cfg["role"],
        "publishedAt": published,
        "readMinutes": int(data.get("readMinutes") or max(5, count_chars_no_space(body) // 400)),
        "tags": [t for t in (data.get("tags") or []) if isinstance(t, str)][:10],
        "views": 0,
        "featured": False,
        "cover": data.get("cover") or {"label": cfg["label_en"] + " FILE", "word": cfg["label_en"]},
        "coverImage": f"assets/img/articles/{article_id}.jpg",
        "summary": [s for s in (data.get("summary") or []) if isinstance(s, str)][:3],
        "body": body,
        "sources": src,
    }
    fc = data.get("fact_check")
    if isinstance(fc, dict):
        article["factCheck"] = {
            "title": "팩트체크",
            "confirmed": [x for x in (fc.get("confirmed") or []) if isinstance(x, str)][:6],
            "unconfirmed": [x for x in (fc.get("unconfirmed") or []) if isinstance(x, str)][:4],
            "sources": src,
        }
    article["_model"] = model
    return article


# ---------------------------------------------------------------- 이미지(커버 카드)
def make_cover_card(article: dict) -> str | None:
    """1,600×900 편집 커버 카드(한국어). 그렸으면 article["coverCard"]=True.

    카드에는 기사 제목·부제가 글자로 들어갑니다. 그래서 이 표시가 있는 기사는
    tools/i18n_data.py 가 번역 후 en·zh·ja 카드를 따로 그려 {ID}.{lang}.jpg 로 씁니다
    (한국어 카드가 외국어판에 그대로 걸리는 일을 막는 장치).
    """
    try:
        import cover_card
    except Exception as e:  # noqa: BLE001
        log(f"  ! 커버 카드 모듈 없음 — 커버 카드 생략({e})")
        return None
    out = ROOT / "assets" / "img" / "articles" / f"{article['id']}.jpg"
    done = cover_card.render(str(out), article.get("title", ""), article.get("deck", ""),
                             article.get("category", ""), (article.get("publishedAt") or "")[:10], lang="ko")
    if not done:
        log("  ! 커버 카드를 그리지 못했습니다(Pillow·CJK 폰트 확인)")
        return None
    article["coverCard"] = True
    return done


# ---------------------------------------------------------------- 발행
def run(cmd: list[str]) -> int:
    log("$ " + " ".join(cmd))
    return subprocess.call(cmd, cwd=str(ROOT))


def git(*args: str) -> int:
    return run(["git", *args])


def write_variant_files(articles_today: list[dict]) -> int:
    """국가별 원고를 data/i18n-articles/{기사ID}.json 에 쓴다(빌드 입력).

    브라우저가 받는 data/articles.json 은 한국어 그대로 두고, 번역 대신 쓸 원고만
    기사별 파일로 떼어 둔다. 한국어판이 나중에 고쳐지면 sourceHash 가 달라져
    auto_publish 는 그 원고를 버리고 기계번역으로 돌아간다(i18n_data.py).
    """
    if not articles_today:
        return 0
    NATIVE_DIR.mkdir(parents=True, exist_ok=True)
    n = 0
    for a in articles_today:
        variants = a.get("_variants") or {}
        if not variants:
            continue
        doc = {
            "articleId": a["id"],
            "lang": "ko",
            "sourceHash": hashlib.sha1(((a.get("title") or "") + "\n" + (a.get("body") or ""))
                                       .encode("utf-8")).hexdigest()[:12],
            "generatedAt": kst_now().strftime("%Y-%m-%dT%H:%M:%S+09:00"),
            "note": "이 기사의 국가별 원고(기계번역 대신 사용). tools/i18n_data.py 가 읽는다.",
        }
        doc.update(variants)
        with open(NATIVE_DIR / f"{a['id']}.json", "w", encoding="utf-8") as f:
            json.dump(doc, f, ensure_ascii=False, indent=1)
        n += 1
    return n


def publish(articles_today: list[dict], commit: bool = True, state: dict | None = None,
            slots: dict | None = None) -> bool:
    """기사 저장 → 빌드·점검 → (커밋) → 푸시.

    state·slots 를 주면 "이 슬롯은 끝났다" 기록을 **커밋 직전에** 같이 써 넣는다.
    (예전에는 커밋 뒤에 state 를 저장해서 워크플로 러너가 사라지면 기록이 통째로
    사라졌고, 매회 같은 앞슬롯을 다시 집어 같은 사건을 두 번 쓰게 됐다.)
    """
    # 국가별 원고를 먼저 써 둔다(i18n_data.py 가 기계번역 대신 읽는다).
    nvar = write_variant_files(articles_today)
    if nvar:
        log(f"· 국가별 원고 파일 {nvar}개 — data/i18n-articles/")

    articles = load_json(ARTICLES, [])
    ids = [a["id"] for a in articles_today]
    fake = any(a.get("_fake") for a in articles_today)
    if fake and commit:
        log("! IB_FAKE_GEMINI 시험 원고는 커밋하지 않습니다(--dry-run 으로만 쓰세요)")
        return False
    for a in reversed(articles_today):
        for k in ("_model", "_slot", "_fake", "_variants"):
            a.pop(k, None)
    articles = articles_today + [a for a in articles if a.get("id") not in ids]
    save_json(ARTICLES, articles)

    # 속보 줄 갱신(최대 6개, 기사 번역과 어긋나지 않게 articleId 로만 연결)
    site = load_json(SITE, {})
    ticker = [{"text": a["title"], "articleId": a["id"]} for a in reversed(articles_today)]
    site["ticker"] = ticker + [t for t in (site.get("ticker") or []) if t.get("articleId") not in ids][:3]
    save_json(SITE, site)

    if run([sys.executable, "tools/build.py"]) != 0:
        log("! build.py 실패 — articles.json 을 되돌립니다")
        git("checkout", "--", "data/articles.json", "data/site.json")
        return False
    if run([sys.executable, "tools/seo_audit.py", "--quiet"]) != 0:
        log("! seo_audit.py 경고/오류 — 커밋하지 않고 멈춥니다")
        return False

    if not commit:
        log("· --dry-run: 커밋·푸시 생략(로컬 산출물만 확인)")
        return True

    git("config", "user.name", "insightbrief-bot")
    git("config", "user.email", "bot@insightbriefnews.com")
    # 슬롯 기록은 커밋 안에 들어가야 다음 회차가 이어받는다(러너가 끝나면 디스크는 사라진다).
    if state is not None and slots:
        for aid, key in slots.items():
            if key:
                state.setdefault("done", {})[key] = aid
        state["last_run"] = kst_now().isoformat(timespec="seconds")
        save_json(STATE, state)
    git("add", "-A")
    git("commit", "-m", "Publish: " + ", ".join(ids))
    if git("push", "origin", "HEAD:main") != 0:
        # 다른 워크플로(색인·로또·시세)가 먼저 밀어 올렸을 수 있다 — 리베이스 후 한 번 더.
        log("· push 충돌 — origin/main 으로 리베이스 후 재시도")
        git("pull", "--rebase", "--autostash", "origin", "main")
        if git("push", "origin", "HEAD:main") != 0:
            log("! push 실패 — 다음 실행이 이어받습니다")
            return False
    return True


def due_slots(state: dict, now: datetime) -> list[tuple[str, str]]:
    """오늘 아직 안 끝난, 시간이 지난 슬롯(키는 'YYYY-MM-DD#HH:MM')."""
    done = state.get("done", {})
    today = now.strftime("%Y-%m-%d")
    out = []
    for hhmm, cat in slots_today(now):
        key = f"{today}#{hhmm}"
        if key in done:
            continue
        slot_dt = datetime.strptime(f"{today} {hhmm}", "%Y-%m-%d %H:%M").replace(tzinfo=KST)
        if slot_dt <= now:
            out.append((key, cat))
    return out


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--category", help="특정 카테고리 1편만 발행(슬롯 무시)")
    ap.add_argument("--count", type=int, default=None, help="한 번에 발행할 편수")
    ap.add_argument("--dry-run", action="store_true", help="생성·빌드·검증만(커밋 없음)")
    ap.add_argument("--no-commit", action="store_true", help="빌드·검증 후 커밋 생략")
    ap.add_argument("--langs", default=None, help="국가별 원고를 쓸 언어(기본 ko,en,zh,ja · ko 만이면 한국어만)")
    args = ap.parse_args()
    dry = args.dry_run or args.no_commit or os.environ.get("IB_SKIP_PUSH") == "1"
    if os.environ.get("IB_FAKE_GEMINI") == "1" and not dry:
        log("! IB_FAKE_GEMINI 시험 모드는 --dry-run 에서만 돕니다.")
        return 2
    langs = [l.strip() for l in (args.langs or os.environ.get("AUTO_PUBLISH_LANGS") or "ko,en,zh,ja").split(",") if l.strip()]
    langs = [l for l in langs if l in LANGS] or ["ko"]
    now = kst_now()
    state = load_json(STATE, {"done": {}})
    # 오래된 기록 정리(7일)
    cutoff = (now - timedelta(days=7)).strftime("%Y-%m-%d")
    state["done"] = {k: v for k, v in (state.get("done") or {}).items() if k.split("#")[0] >= cutoff}
    used_cut = (now - timedelta(days=2)).strftime("%Y-%m-%d")
    state["used"] = {d: v for d, v in (state.get("used") or {}).items() if d >= used_cut}

    if args.category:
        queue = [(args.category, args.category)]
    else:
        due = due_slots(state, now)
        if not due:
            log(f"· {now:%Y-%m-%d %H:%M} KST — 지금 발행할 슬롯이 없습니다.")
            nxt = [h for h, c in slots_today(now)
                   if f"{now:%Y-%m-%d}#{h}" not in (state.get("done") or {})
                   and datetime.strptime(f"{now:%Y-%m-%d} {h}", "%Y-%m-%d %H:%M").replace(tzinfo=KST) > now]
            log(f"  다음 슬롯: {nxt[0]} KST" if nxt else "  오늘 슬롯은 모두 지났습니다(내일 00:20부터)")
            return 0
        limit = args.count or int(os.environ.get("AUTO_PUBLISH_MAX", "3"))
        queue = due[:max(1, min(limit, 6))]
        log(f"· 밀린 슬롯 {len(due)}개 중 {len(queue)}편 발행: " + ", ".join(c for _, c in queue))

    log(f"· 국가별 원고 언어: {', '.join(langs)}")
    started = time.time()
    try:
        budget_min = float(os.environ.get("IB_RUN_BUDGET_MIN", "19"))
    except ValueError:
        budget_min = 19.0
    articles = load_json(ARTICLES, [])
    made: list[dict] = []
    quota_out = False
    for key, cat in queue:
        if cat not in CATEGORIES:
            log(f"! 알 수 없는 카테고리 {cat} — 건너뜀")
            continue
        # 워크플로 제한(30분)에서 빌드·커밋 시간을 남기려고 새 기사 시작 전에 여유를 본다.
        # 남은 슬롯은 건드리지 않으므로 다음 회차가 그대로 이어받는다.
        if made and (time.time() - started) / 60 > budget_min:
            log(f"· {budget_min:.0f}분 경과 — 남은 슬롯은 다음 회차로 넘깁니다.")
            break
        today = now.strftime("%Y-%m-%d")
        # 오늘 이미 다른 섹션에서 쓴 자료까지 뺀다(같은 사건이 두 섹션에 나오는 일 방지).
        used = set()
        for urls in (((state.get("used") or {}).get(today, {}) or {}).values()):
            used.update(urls or [])
        used.update(((state.get("used") or {}).get(today, {}) or {}).get(cat) or [])
        log(f"\n[{cat}] 근거 자료 수집…")
        pool = build_source_pool(cat, exclude=used)
        if len(pool) < 2:
            log(f"! {cat}: 근거 자료가 2건 미만 — 이번 슬롯은 건너뜁니다(자료 없는 기사는 쓰지 않는다).")
            continue
        log(f"  자료 {len(pool)}건 — {pool[0]['title'][:60]}")
        try:
            article = make_article(cat, pool, articles + made)
        except QuotaExhausted as exc:
            log(f"! 할당량 소진 — 이번 회차는 여기서 멈춥니다: {exc}")
            quota_out = True
            break
        except Exception as exc:  # noqa: BLE001
            log(f"! {cat} 기사 생성 실패: {exc}")
            continue
        article["_fake"] = article.get("_model") == "fake"
        log(f"  제목: {article['title']}")
        log(f"  본문 {count_chars_no_space(article['body'])}자 · 출처 {len(article.get('sources') or [])}건 · 모델 {article.get('_model')}")
        if len(langs) > 1:
            log(f"  국가별 원고 {', '.join(l for l in langs if l != 'ko')} 병렬 작성…")
        try:
            variants = attach_variants(article, cat, pool, langs)
        except QuotaExhausted as exc:
            log(f"! 국가별 원고 중 할당량 소진 — 원고 있는 언어만 싣고 멈춥니다: {exc}")
            variants = {}
            quota_out = True
        article["_variants"] = variants
        missing = [l for l in langs if l != "ko" and l not in variants]
        if missing:
            log(f"  · {', '.join(missing)}: 원고 없음 — 기존 기계번역으로 매웁니다")
        make_cover_card(article)
        made.append(article)
        article["_slot"] = key
        # 오늘 같은 섹션에서 다시 쓰지 않도록 쓴 자료를 기록한다.
        slot_used = state.setdefault("used", {}).setdefault(today, {}).setdefault(cat, [])
        for s in pool[:4]:
            if s.get("url") and s["url"] not in slot_used:
                slot_used.append(s["url"])
        if quota_out:
            break

    if not made:
        log("· 생성된 기사가 없습니다.")
        if quota_out:
            save_json(STATE, state)  # 쓴 자료·슬롯 기록만 남기고 다음 회차로
            return 1
        return 1

    vmap = {a["id"]: list((a.get("_variants") or {}).keys()) for a in made}
    slots = {a["id"]: a.get("_slot") for a in made}  # publish() 가 _slot 을 지우기 전에 붙잡아 둔다
    ok = publish(made, commit=not dry, state=state, slots=slots)
    for a in made:
        tag = "발행 완료" if ok else ("(dry-run) 발행 예정" if dry else "발행 실패")
        extra = f" — https://insightbriefnews.com/a/{a['id']}.html" if ok else ""
        log(f"· {tag}: {a['id']} · 국가별 원고 {', '.join(vmap.get(a['id']) or []) or '없음'}{extra}")
    if not ok and not dry:
        log("· 슬롯 기록은 커밋되지 않았습니다 — 다음 회차가 같은 슬롯을 다시 시도합니다")
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
