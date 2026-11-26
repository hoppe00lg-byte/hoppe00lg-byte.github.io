#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
시황판 그래프용 실제 시계열 수집 (data/market-series.json).

  python3 tools/fetch_market_series.py            # 수집 후 저장
  python3 tools/fetch_market_series.py --dry-run  # 저장 없이 결과만 확인

원칙
  · 공개 시장에서 실제로 거래된 종가만 담습니다. 값이 없으면 비우고, 만들어 넣지 않습니다.
  · 미국 선물·환율·크립토는 Yahoo Finance 차트 API, 중국 3대 선물거래소는
    시나파이낸스 일별 K선 API의 원본 종가를 씁니다.
  · 국내·월별·분기 단발 지표처럼 무료 일별 시계열이 없는 품목은 이 파일에 넣지 않습니다.
    그런 품목은 화면에서 market.json의 실측 기준점(전일·1주 전·1달 전·1년 전)과
    market-history.json 누적 스냅샷만으로 '실측 기준점 비교'로 표시합니다(가짜 곡선 금지).

파일 구조
  { "version":1, "generatedAt":..., "windowDays":400,
    "note":..., "series": { "WTI": {code,name,unit,decimals,market,symbol,
      sourceName,sourceUrl,note,points:[[date,value],...]}, ... } }
"""
import json, os, sys, datetime, urllib.parse, subprocess

ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
DATA = os.path.join(ROOT, "data")
OUT = os.path.join(DATA, "market-series.json")
WINDOW_DAYS = 400
UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)"

YAHOO_URL = "https://query2.finance.yahoo.com/v8/finance/chart/{sym}?range=2y&interval=1d"
SINA_URL = ("https://stock.finance.sina.com.cn/futures/api/jsonp.php/var%20_{sym}="
            "/InnerFuturesNewService.getDailyKLine?symbol={sym}")

# code, symbol, 이름, 단위, 소수, 배수, 비고
YAHOO = [
    ("WTI", "CL=F", "WTI 원유", "USD/bbl", 2, 1,
     "NYMEX 근월 연속 종가입니다. 표의 가격은 로이터가 인용한 12월물 정산가라 결제월 차이만큼 값이 조금 다릅니다."),
    ("BRENT", "BZ=F", "북해 브렌트유", "USD/bbl", 2, 1,
     "ICE 브렌트 근월 연속 종가입니다. 표의 가격은 2027년 1월물 정산가입니다."),
    ("USD/KRW", "KRW=X", "원·달러", "원", 2, 1,
     "시장 환율(24시간) 종가입니다. 표의 값은 한국수출입은행 고시 매매기준율이라 고시 시각·기준이 다릅니다."),
    ("BTC", "BTC-USD", "비트코인", "USD", 0, 1,
     "달러 현물 종가(UTC 일별)입니다. 표의 원화 가격·김치프리미엄은 업비트 기준입니다."),
    ("ETH", "ETH-USD", "이더리움", "USD", 0, 1,
     "달러 현물 종가(UTC 일별)입니다. 표의 원화 가격은 업비트 기준입니다."),
    ("AU", "GC=F", "금", "USD/oz", 2, 1,
     "COMEX 금 근월 선물 종가입니다. 표의 값은 현물 1트로이온스 고시라 선물 프리미엄만큼 다릅니다."),
    ("AG", "SI=F", "은", "USD/oz", 2, 1,
     "COMEX 은 근월 선물 종가입니다. 표의 값은 현물 고시입니다."),
    ("CU", "HG=F", "구리", "USD/t", 1, 2204.622622,
     "COMEX 구리 근월 선물(USD/lb)을 톤당으로 환산했습니다. 표의 값은 LME 3개월 선물이라 시장·결제월이 다릅니다."),
    ("AL", "ALI=F", "알루미늄", "USD/t", 1, 1,
     "CME 알루미늄 선물 종가입니다. 표의 값은 LME 3개월 선물입니다."),
    ("ZW", "ZW=F", "CBOT 소맥", "USc/bu", 2, 1,
     "CBOT 소맥 근월 연속 종가입니다. 표의 값은 12월물 종가입니다."),
    ("ZC", "ZC=F", "CBOT 옥수수", "USc/bu", 2, 1,
     "CBOT 옥수수 근월 연속 종가입니다. 표의 값은 12월물 종가입니다."),
    ("ZS", "ZS=F", "CBOT 대두", "USc/bu", 2, 1,
     "CBOT 대두 근월 연속 종가입니다. 표의 값은 1월물 종가입니다."),
]

# 중국 3대 선물거래소 (시나파이낸스 일별 K선)
SINA = [
    ("SHFE-CU", "CU0", "구리 (SHFE)", "RMB/t", 0, 1, "상하이선물거래소 구리 주력 계약 일별 종가입니다."),
    ("SHFE-AL", "AL0", "알루미늄 (SHFE)", "RMB/t", 0, 1, "상하이선물거래소 알루미늄 주력 계약 일별 종가입니다."),
    ("SHFE-SC", "SC0", "상하이 원유 (SC)", "RMB/bbl", 1, 1, "상하이국제에너지거래소(INE) 원유 주력 계약 일별 종가입니다."),
    ("DCE-PP", "PP0", "폴리프로필렌 (DCE)", "RMB/t", 0, 1, "다롄상품거래소 PP 주력 계약 일별 종가입니다."),
    ("DCE-L", "L0", "LLDPE (DCE)", "RMB/t", 0, 1, "다롄상품거래소 LLDPE 주력 계약 일별 종가입니다."),
    ("DCE-V", "V0", "PVC (DCE)", "RMB/t", 0, 1, "다롄상품거래소 PVC 주력 계약 일별 종가입니다."),
    ("DCE-EG", "EG0", "모노에틸렌글리콜 (DCE)", "RMB/t", 0, 1, "다롄상품거래소 EG 주력 계약 일별 종가입니다."),
    ("ZCE-TA", "TA0", "PTA (ZCE)", "RMB/t", 0, 1, "정저우상품거래소 PTA 주력 계약 일별 종가입니다."),
    ("ZCE-MA", "MA0", "메탄올 (ZCE)", "RMB/t", 0, 1, "정저우상품거래소 메탄올 주력 계약 일별 종가입니다."),
]

# 교차환율: 코드 → (분자 심볼, 분모 심볼, 배수)
CROSS = {
    "JPY/KRW": ("KRW=X", "JPY=X", 100.0),
    "CNY/KRW": ("KRW=X", "CNY=X", 1.0),
}
CROSS_NOTE = {
    "JPY/KRW": "100엔당 원화. 시장 환율(USD/KRW ÷ USD/JPY × 100)로 계산했고, 표의 값은 수출입은행 고시입니다.",
    "CNY/KRW": "위안당 원화. 시장 환율(USD/KRW ÷ USD/CNY)로 계산했고, 표의 값은 수출입은행 고시입니다.",
}


def curl(url, timeout=40):
    p = subprocess.run(["curl", "-sS", "-A", UA, "-m", str(timeout), url],
                       capture_output=True, text=True)
    if p.returncode != 0:
        raise RuntimeError("curl 실패(%s): %s" % (p.returncode, p.stderr.strip()[:200]))
    return p.stdout


def kst_today():
    return datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=9))).date()


def fetch_yahoo(sym):
    """[{date, close}] — 거래소 현지 날짜 기준 일별 종가."""
    import time
    from zoneinfo import ZoneInfo
    url = YAHOO_URL.format(sym=urllib.parse.quote(sym, safe=""))
    last = None
    for attempt in range(4):
        body = curl(url)
        try:
            raw = json.loads(body)
            break
        except Exception as e:
            last = e
            time.sleep(2 + attempt * 3)
    else:
        raise RuntimeError("Yahoo 응답을 읽지 못했습니다: %s" % last)
    res = (raw.get("chart") or {}).get("result") or []
    if not res:
        raise RuntimeError("Yahoo 응답에 데이터가 없습니다: %s" % sym)
    r = res[0]
    tzname = ((r.get("meta") or {}).get("exchangeTimezoneName") or "UTC")
    try:
        tz = ZoneInfo(tzname)
    except Exception:
        tz = datetime.timezone.utc
    ts = r.get("timestamp") or []
    q = ((r.get("indicators") or {}).get("quote") or [{}])[0]
    close = q.get("close") or []
    out = []
    for t, c in zip(ts, close):
        if c is None:
            continue
        d = datetime.datetime.fromtimestamp(t, tz).date().isoformat()
        out.append([d, float(c)])
    return out


def fetch_sina(sym):
    url = SINA_URL.format(sym=sym)
    txt = curl(url)
    i = txt.find("([")
    j = txt.rfind("])")
    if i < 0 or j < 0:
        raise RuntimeError("시나 응답 형식이 예상과 다릅니다: %s" % sym)
    rows = json.loads(txt[i + 1:j + 1])
    out = []
    for r in rows:
        try:
            d = str(r["d"])[:10]
            c = float(r["c"])
        except Exception:
            continue
        if c <= 0:
            continue
        out.append([d, c])
    return out


def trim(points):
    cutoff = (kst_today() - datetime.timedelta(days=WINDOW_DAYS)).isoformat()
    pts = [p for p in points if p[0] >= cutoff]
    # 같은 날짜가 두 번 오면 마지막 값을 남깁니다.
    dedup = {}
    for d, v in pts:
        dedup[d] = v
    return [[d, dedup[d]] for d in sorted(dedup)]


def yahoo_quote_url(sym):
    return "https://finance.yahoo.com/quote/%s/history" % urllib.parse.quote(sym, safe="")


def main():
    dry = "--dry-run" in sys.argv
    series = {}
    errors = []

    cache = {}
    for code, sym, name, unit, dec, mult, note in YAHOO:
        try:
            pts = fetch_yahoo(sym)
            cache[sym] = pts
            pts = trim([[d, round(v * mult, 4)] for d, v in pts])
            if len(pts) < 30:
                raise RuntimeError("점이 %d개뿐입니다" % len(pts))
            series[code] = {
                "code": code, "name": name, "unit": unit, "decimals": dec,
                "symbol": sym, "market": "yahoo",
                "sourceName": "Yahoo Finance · %s" % sym,
                "sourceUrl": yahoo_quote_url(sym),
                "note": note,
                "points": pts,
            }
            print("OK  %-8s %-8s %4d points  %s ~ %s" % (code, sym, len(pts), pts[0][0], pts[-1][0]))
        except Exception as e:
            errors.append("%s(%s): %s" % (code, sym, e))
            print("ERR %-8s %-8s %s" % (code, sym, e))

    for code, (a, b, mult) in CROSS.items():
        try:
            if a not in cache:
                cache[a] = fetch_yahoo(a)
            if b not in cache:
                cache[b] = fetch_yahoo(b)
            amap = {d: v for d, v in cache[a]}
            bmap = {d: v for d, v in cache[b]}
            pts = []
            for d in sorted(set(amap) & set(bmap)):
                if bmap[d]:
                    pts.append([d, round(amap[d] / bmap[d] * mult, 4)])
            pts = trim(pts)
            name = {"JPY/KRW": "원·엔 (100엔)", "CNY/KRW": "원·위안"}[code]
            unit = {"JPY/KRW": "원/100엔", "CNY/KRW": "원/위안"}[code]
            series[code] = {
                "code": code, "name": name, "unit": unit, "decimals": 2,
                "symbol": "%s/%s" % (a, b), "market": "yahoo-cross",
                "sourceName": "Yahoo Finance · %s ÷ %s" % (a, b),
                "sourceUrl": yahoo_quote_url(a),
                "note": CROSS_NOTE[code],
                "points": pts,
            }
            print("OK  %-8s cross    %4d points  %s ~ %s" % (code, len(pts), pts[0][0], pts[-1][0]))
        except Exception as e:
            errors.append("%s: %s" % (code, e))
            print("ERR %-8s cross    %s" % (code, e))

    for code, sym, name, unit, dec, mult, note in SINA:
        try:
            pts = trim([[d, round(v * mult, 4)] for d, v in fetch_sina(sym)])
            if len(pts) < 30:
                raise RuntimeError("점이 %d개뿐입니다" % len(pts))
            series[code] = {
                "code": code, "name": name, "unit": unit, "decimals": dec,
                "symbol": sym, "market": "sina",
                "sourceName": "시나파이낸스 · %s 일별" % sym,
                "sourceUrl": "https://finance.sina.com.cn/futures/quotes/%s.shtml" % sym,
                "note": note,
                "points": pts,
            }
            print("OK  %-8s %-8s %4d points  %s ~ %s" % (code, sym, len(pts), pts[0][0], pts[-1][0]))
        except Exception as e:
            errors.append("%s(%s): %s" % (code, sym, e))
            print("ERR %-8s %-8s %s" % (code, sym, e))

    now = datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=9)))
    doc = {
        "version": 1,
        "generatedAt": now.isoformat(timespec="seconds"),
        "windowDays": WINDOW_DAYS,
        "note": ("시황판 그래프에 쓰는 실제 일별 종가입니다. 미국 선물·환율·크립토는 Yahoo Finance, "
                 "중국 3대 선물거래소는 시나파이낸스 일별 K선의 종가를 그대로 옮겼고, 보간·추정한 값은 없습니다. "
                 "무료 일별 시계열이 없는 국내·월별·단발 지표는 이 파일에 넣지 않고, "
                 "화면에서 market.json의 실측 기준점과 market-history.json 누적 스냅샷만으로 표시합니다."),
        "series": series,
    }
    print("\n수집 %d종 / 실패 %d종" % (len(series), len(errors)))
    if errors:
        for e in errors:
            print("  - ", e)
    if dry:
        print("(dry-run: 저장하지 않았습니다)")
        return 0
    if not series:
        print("수집된 시계열이 없어 저장하지 않습니다.")
        return 1
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(doc, f, ensure_ascii=False, separators=(",", ":"))
    print("saved %s (%d KB)" % (OUT, os.path.getsize(OUT) // 1024))
    return 0 if not errors else 1


if __name__ == "__main__":
    sys.exit(main())
