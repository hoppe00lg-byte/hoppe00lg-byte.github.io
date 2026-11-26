#!/usr/bin/env python3
"""동행복권 6/45 공식 조회 API에서 회차별 당첨번호를 받아 data/lotto.json 으로 저장합니다.

사용:
    python3 tools/fetch_lotto.py            # 최신 회차까지만 새로 받아 갱신
    python3 tools/fetch_lotto.py --full     # 1회차부터 전부 다시 받기

엔드포인트: https://www.dhlottery.co.kr/lt645/selectPstLt645InfoNew.do
  - srchDir=center&srchLtEpsd=N   → N회차(및 앞뒤 일부)
  - srchDir=older&srchCursorLtEpsd=N → N회차 이전 10회차
값은 모두 동행복권이 돌려준 실측값이며, 어떤 수치도 추정하지 않습니다.
"""
import concurrent.futures
import datetime
import json
import os
import re
import sys
import time
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "data", "lotto.json")
BASE = "https://www.dhlottery.co.kr/lt645/selectPstLt645InfoNew.do"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
                  "(KHTML, like Gecko) Chrome/120.0 Safari/537.36",
    "Referer": "https://www.dhlottery.co.kr/lt645/result",
    "X-Requested-With": "XMLHttpRequest",
    "Accept": "application/json",
}
FIRST_DRAW_DATE = datetime.date(2002, 12, 7)


def fetch(params, tries=4):
    url = BASE + "?" + "&".join(f"{k}={v}" for k, v in params.items())
    last = None
    for i in range(tries):
        try:
            req = urllib.request.Request(url, headers=HEADERS)
            body = urllib.request.urlopen(req, timeout=30).read().decode("utf-8")
            data = json.loads(body)
            return (data.get("data") or {}).get("list") or []
        except Exception as e:  # noqa: BLE001
            last = e
            time.sleep(1.2 * (i + 1))
    raise RuntimeError(f"{url} 실패: {last}")


def row(item):
    nums = sorted(int(item[f"tm{i}WnNo"]) for i in range(1, 7))
    return {
        "d": int(item["ltEpsd"]),
        "t": str(item["ltRflYmd"]),
        "n": nums,
        "b": int(item["bnsWnNo"]),
        "p1": int(item.get("rnk1WnAmt") or 0),      # 1등 1인당 당첨금
        "w1": int(item.get("rnk1WnNope") or 0),     # 1등 당첨자 수
        "p3": int(item.get("rnk3WnAmt") or 0),      # 3등 1인당 당첨금(실측)
        "s": int(item.get("sumWnNope") or 0),       # 총 당첨자 수
        "sales": int(item.get("wholEpsdSumNtslAmt") or 0),  # 총 판매액
    }


def expected_latest(today=None):
    today = today or datetime.date.today()
    # 추첨은 토요일. 가장 최근 토요일 기준.
    sat = today - datetime.timedelta(days=(today.weekday() - 5) % 7)
    return (sat - FIRST_DRAW_DATE).days // 7 + 1


def main():
    full = "--full" in sys.argv
    prev = {}
    if os.path.exists(OUT) and not full:
        with open(OUT, encoding="utf-8") as f:
            for r in json.load(f)["draws"]:
                prev[r["d"]] = r
    target = expected_latest()
    # 이미 받아 둔 최신 회차까지는 다시 받지 않음
    have_max = max(prev) if prev else 0
    stop_at = have_max + 1 if have_max else 1

    found = {}
    # 최신(당주) 회차 자체를 먼저 확인
    for x in fetch({"srchDir": "center", "srchLtEpsd": target}):
        r = row(x)
        if r["d"] == target:
            found[r["d"]] = r
    if target not in found:
        print(f"  ! {target}회차가 아직 공개되지 않았습니다. 직전 회차로 진행")
    # 최신 회차부터 이미 가진 구간까지 10개씩 내려가며 조회
    cursor = target
    while cursor > stop_at:
        batch = fetch({"srchDir": "older", "srchCursorLtEpsd": cursor})
        if not batch:
            break
        got = [row(x) for x in batch]
        for r in got:
            found[r["d"]] = r
        nxt = min(r["d"] for r in got)
        print(f"  … {nxt}회차 이하 받는 중 ({len(found)}건)", flush=True)
        if nxt >= cursor:
            break
        cursor = nxt
        time.sleep(0.25)

    # 1회차 등 빠진 구간 보정
    for d in range(1, min(11, target + 1)):
        if d not in found and d not in prev:
            for x in fetch({"srchDir": "center", "srchLtEpsd": d}):
                r = row(x)
                if 1 <= r["d"] <= target:
                    found[r["d"]] = r
            time.sleep(0.25)

    for d, r in prev.items():
        found.setdefault(d, r)

    draws = [found[d] for d in sorted(found)]
    missing = [d for d in range(1, target + 1) if d not in found]
    latest = draws[-1]

    payload = {
        "source": "동행복권 로또 6/45 공식 회차 조회 (dhlottery.co.kr selectPstLt645InfoNew.do)",
        "sourceUrl": "https://www.dhlottery.co.kr/lt645/result",
        "fetchedAt": datetime.datetime.now().astimezone().isoformat(timespec="seconds"),
        "latest": latest,
        "range": {"from": draws[0]["d"], "to": latest["d"], "count": len(draws)},
        "missing": missing,
        "draws": draws,
    }
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, separators=(",", ":"))
    print(f"\n저장: data/lotto.json — {len(draws)}회차 (최신 {latest['d']}회 {latest['t']}, 번호 {latest['n']} + {latest['b']})")
    if missing:
        print(f"  ! 누락 회차 {len(missing)}건: {missing[:20]}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
