#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""인사이트 브리프 — 웹진 자동 발행(GitHub Actions용)

1차 출처(구글 뉴스 RSS·arXiv·기관 RSS)를 모아 Gemini로 한국어 심층 기사 1편을 쓰고,
`data/articles.json` 맨 앞에 넣은 뒤 `tools/build.py`(한국어 + en/zh/ja)와
`tools/seo_audit.py`를 돌리고 커밋·푸시합니다. 이미지는 Pillow 고대비 커버 카드
(1,600×900)를 만들어 넣고, 실패하면 카드 없이 본문만 발행합니다.

  python3 tools/auto_publish_webzine.py --dry-run               # 오늘 남은 슬롯 확인만
  python3 tools/auto_publish_webzine.py --dry-run --slot now    # 지금 발행할 슬롯 1편 생성·빌드(커밋 없이)
  python3 tools/auto_publish_webzine.py --category culture      # 특정 카테고리 1편
  python3 tools/auto_publish_webzine.py                          # 예약 슬롯 중 밀린 것부터 최대 3편 발행

환경변수
  GEMINI_API_KEY    (필수) Google AI Studio 키
  GEMINI_MODEL      (선택) 첫 모델. 기본 gemini-3.5-flash → 폴백 체인
  AUTO_PUBLISH_MAX  (선택) 한 번에 발행할 최대 편수(기본 3, 상한 6)
  IB_SKIP_PUSH=1    (선택) 커밋·푸시를 하지 않는다(--dry-run 과 같음)

카테고리(9개) — 하루 15편: economy 3 · trade 3 · ai 3 · fire 1 · world 1 · property 1 · energy 1 · health 1 · culture 1
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
import time
import urllib.error
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
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

# 사람이 읽는 이름·1차 출처 검색어·각도. 새 카테고리를 늘릴 때는 site.json 과 nav_spec.py 도 함께 고친다.
CATEGORIES = {
    "economy": {
        "label": "경제·금융",
        "label_en": "ECONOMY",
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

# 예약 슬롯(KST). 하루 15편 — economy 3 · trade 3 · ai 3 · fire 1 · world 1 · property 1 · energy 1 · health 1 · culture 1
SLOTS = [
    ("06:30", "economy"),
    ("07:30", "world"),
    ("08:30", "property"),
    ("09:30", "economy"),
    ("10:30", "ai"),
    ("11:30", "energy"),
    ("12:30", "health"),
    ("13:30", "fire"),
    ("14:30", "trade"),
    ("15:30", "culture"),
    ("16:30", "ai"),
    ("17:30", "economy"),
    ("18:30", "trade"),
    ("19:30", "ai"),
    ("20:30", "trade"),
]

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


def build_source_pool(cat_id: str) -> list[dict]:
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


def call_gemini(prompt: str, max_output_tokens: int = 12000, json_mode: bool = True,
                temperature: float = 0.85) -> tuple[str, str]:
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
        for attempt in range(2):
            try:
                req = urllib.request.Request(url, data=body, headers={"Content-Type": "application/json"})
                with urllib.request.urlopen(req, timeout=240) as r:
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
                    if attempt >= 1:
                        break
                    time.sleep([10, 25][attempt])
                    continue
                break
            except Exception as exc:  # noqa: BLE001
                errors.append(f"{model} {type(exc).__name__}: {exc}")
                time.sleep(6)
    raise GeminiError("모든 모델 실패: " + " | ".join(errors[-3:]))


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
PROMPT = """당신은 탐사 웹진 '인사이트 브리프'(insightbriefnews.com)의 {label} 담당 기자다.
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


def clean_body(body: str, article_id: str) -> str:
    body = (body or "").replace("\r\n", "\n").strip()
    # 이미지 경로 강제: 본문에 이미지 한 줄이 없으면 첫 문단 뒤에 넣는다.
    img = f"(assets/img/articles/{article_id}.jpg)"
    body = re.sub(r"\]\((?:\.\./)*assets/img/articles/[^)]*\)", "]" + img, body)
    if "assets/img/articles/" not in body:
        parts = body.split("\n\n", 1)
        body = parts[0] + f"\n\n![기사 주제를 보여 주는 에디토리얼 이미지]{img}" + (
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
FONT_CANDIDATES = [
    ("/usr/share/fonts/truetype/noto-serif-kr/NotoSerifKR-Bold.otf",),
    ("/usr/share/fonts/opentype/noto/NotoSerifCJK-Bold.ttc",),
    ("/usr/share/fonts/pickle-hwp/NotoSerifCJKkr-Regular.otf",),
    ("assets/fonts/NotoSerifKR-Bold.otf",),
    ("assets/fonts/NotoSansKR-Bold.otf",),
]
SANS_CANDIDATES = [
    "/usr/share/fonts/truetype/noto/NotoSansCJK-Regular.ttc",
    "/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc",
    "/usr/share/fonts/pickle-hwp/NotoSansCJKkr-Regular.otf",
    "assets/fonts/NotoSansKR-Regular.otf",
]


def _first_existing(paths) -> str:
    for p in paths:
        q = Path(p if isinstance(p, str) else p[0])
        if not q.is_absolute():
            q = ROOT / q
        if q.exists():
            return str(q)
    return ""


def make_cover_card(article: dict) -> str | None:
    """1,600×900 편집 커버 카드. Pillow·한글 폰트가 없으면 None."""
    try:
        from PIL import Image, ImageDraw, ImageFont
    except Exception:  # noqa: BLE001
        log("  ! Pillow 없음 — 커버 카드 생략")
        return None
    serif = _first_existing(FONT_CANDIDATES)
    sans = _first_existing(SANS_CANDIDATES) or serif
    if not serif:
        log("  ! 한글 폰트 없음 — 커버 카드 생략")
        return None
    W, H = 1600, 900
    ink, paper, accent = (23, 20, 15), (245, 241, 232), (176, 58, 32)
    img = Image.new("RGB", (W, H), paper)
    d = ImageDraw.Draw(img)
    d.rectangle([0, 0, W, 14], fill=accent)
    d.rectangle([80, 96, 88, 96 + 62], fill=accent)
    eyebrow = ImageFont.truetype(sans or serif, 30)
    d.text((112, 104), f"INSIGHT BRIEF · {article.get('category', '').upper()}", font=eyebrow, fill=accent)
    title_font = ImageFont.truetype(serif, 78)
    body_font = ImageFont.truetype(sans or serif, 32)

    def wrap(text: str, font, max_w: int) -> list[str]:
        lines, cur = [], ""
        for word in text.split():
            trial = (cur + " " + word).strip()
            if d.textlength(trial, font=font) <= max_w:
                cur = trial
            else:
                if cur:
                    lines.append(cur)
                cur = word
        if cur:
            lines.append(cur)
        return lines

    lines = wrap(article.get("title", ""), title_font, W - 200)[:4]
    y = 220
    for line in lines:
        d.text((96, y), line, font=title_font, fill=ink)
        y += 96
    y += 18
    d.line([96, y, 96 + 220, y], fill=accent, width=4)
    y += 34
    for line in wrap(article.get("deck", ""), body_font, W - 210)[:3]:
        d.text((96, y), line, font=body_font, fill=(90, 84, 74))
        y += 46
    foot = ImageFont.truetype(sans or serif, 26)
    d.text((96, H - 92), "insightbriefnews.com", font=foot, fill=(120, 112, 100))
    d.text((W - 380, H - 92), article.get("publishedAt", "")[:10], font=foot, fill=(120, 112, 100))

    out = ROOT / "assets" / "img" / "articles" / f"{article['id']}.jpg"
    out.parent.mkdir(parents=True, exist_ok=True)
    img.save(out, "JPEG", quality=86, optimize=True)
    return str(out)


# ---------------------------------------------------------------- 발행
def run(cmd: list[str]) -> int:
    log("$ " + " ".join(cmd))
    return subprocess.call(cmd, cwd=str(ROOT))


def git(*args: str) -> int:
    return run(["git", *args])


def publish(articles_today: list[dict], commit: bool = True) -> bool:
    articles = load_json(ARTICLES, [])
    ids = [a["id"] for a in articles_today]
    for a in reversed(articles_today):
        a.pop("_model", None)
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
    done = state.get("done", {})
    today = now.strftime("%Y-%m-%d")
    out = []
    for hhmm, cat in SLOTS:
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
    args = ap.parse_args()
    dry = args.dry_run or args.no_commit or os.environ.get("IB_SKIP_PUSH") == "1"
    now = kst_now()
    state = load_json(STATE, {"done": {}})
    # 오래된 기록 정리(7일)
    cutoff = (now - timedelta(days=7)).strftime("%Y-%m-%d")
    state["done"] = {k: v for k, v in (state.get("done") or {}).items() if k.split("#")[0] >= cutoff}

    if args.category:
        queue = [(args.category, args.category)]
    else:
        due = due_slots(state, now)
        if not due:
            log(f"· {now:%Y-%m-%d %H:%M} KST — 지금 발행할 슬롯이 없습니다.")
            nxt = [h for h, c in SLOTS
                   if f"{now:%Y-%m-%d}#{h}" not in (state.get("done") or {})
                   and datetime.strptime(f"{now:%Y-%m-%d} {h}", "%Y-%m-%d %H:%M").replace(tzinfo=KST) > now]
            log(f"  다음 슬롯: {nxt[0]} KST" if nxt else "  오늘 슬롯은 모두 지났습니다(내일 06:30부터)")
            return 0
        limit = args.count or int(os.environ.get("AUTO_PUBLISH_MAX", "3"))
        queue = due[:max(1, min(limit, 6))]
        log(f"· 밀린 슬롯 {len(due)}개 중 {len(queue)}편 발행: " + ", ".join(c for _, c in queue))

    articles = load_json(ARTICLES, [])
    made: list[dict] = []
    for key, cat in queue:
        if cat not in CATEGORIES:
            log(f"! 알 수 없는 카테고리 {cat} — 건너뜀")
            continue
        log(f"\n[{cat}] 근거 자료 수집…")
        pool = build_source_pool(cat)
        if len(pool) < 2:
            log(f"! {cat}: 근거 자료가 2건 미만 — 이번 슬롯은 건너뜁니다(자료 없는 기사는 쓰지 않는다).")
            continue
        log(f"  자료 {len(pool)}건 — {pool[0]['title'][:60]}")
        try:
            article = make_article(cat, pool, articles + made)
        except Exception as exc:  # noqa: BLE001
            log(f"! {cat} 기사 생성 실패: {exc}")
            continue
        log(f"  제목: {article['title']}")
        log(f"  본문 {count_chars_no_space(article['body'])}자 · 출처 {len(article.get('sources') or [])}건 · 모델 {article.get('_model')}")
        make_cover_card(article)
        made.append(article)
        article["_slot"] = key

    if not made:
        log("· 생성된 기사가 없습니다.")
        return 1

    ok = publish(made, commit=not dry)
    if ok:
        for a in made:
            state["done"][a["_slot"]] = a["id"]
            log(f"· 발행 완료: {a['id']} — https://insightbriefnews.com/a/{a['id']}.html")
        state["last_run"] = now.isoformat(timespec="seconds")
        save_json(STATE, state)
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
