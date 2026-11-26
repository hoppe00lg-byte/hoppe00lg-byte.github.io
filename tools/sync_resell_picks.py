#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""sync_resell_picks.py — 리셀 스캐너 결과를 웹진(resell.html)의 '오늘의 실측 마진 아이템' 데이터로 옮깁니다.

  python3 tools/sync_resell_picks.py                     # 최신 리포트 → data/resell-picks.json (+ en·zh·ja 사본)
                                                        #   + reports/resell-margin/pokemon-latest.json → data/pokemon-picks.json
  python3 tools/sync_resell_picks.py --top 6             # 보여 줄 개수
  python3 tools/sync_resell_picks.py --check             # 파일을 쓰지 않고 결과만 확인
  python3 tools/sync_resell_picks.py --no-pokemon        # 포켓몬 카드 데이터는 건드리지 않음
  python3 tools/sync_resell_picks.py --pokemon-only      # 포켓몬 카드만 동기화
  python3 tools/sync_resell_picks.py --report ../pickle-automation/reports/resell-margin/2026-11-26.json

원칙
  · 내보내는 값은 상품명·상품코드·해외가·총원가·관부가세·국내시세·순마진·ROI·일치여부·링크·기준일시뿐입니다.
    스캐너 리포트의 소스 목록·오류 메시지·가중치·설정값·로컬 경로는 옮기지 않습니다.
  · 같은 파일을 en·zh·ja/data 에도 복사합니다(언어 페이지가 자기 폴더의 사본을 읽습니다).
  · 리포트가 하루 이상 지났으면 경고만 하고 그대로 옮깁니다(--max-age-hours 로 조정).
"""
from __future__ import annotations

import argparse
import json
import os
import shutil
import sys
from datetime import datetime, timedelta, timezone

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, ".."))
DATA = os.path.join(ROOT, "data")
OUT_NAME = "resell-picks.json"
POKEMON_OUT_NAME = "pokemon-picks.json"
LANGS = ("en", "zh", "ja")
DEFAULT_REPORT = os.path.abspath(os.path.join(ROOT, "..", "pickle-automation", "reports", "resell-margin", "latest.json"))
DEFAULT_POKEMON_REPORT = os.path.abspath(os.path.join(ROOT, "..", "pickle-automation", "reports", "resell-margin", "pokemon-latest.json"))
KST = timezone(timedelta(hours=9))

# 품목 → 계산기 프리셋(관세율·카테고리). 스캐너의 duty_rate_pct 와 같은 값을 씁니다.
CAT_BY_TYPE = {
    "FOOTWEAR": ("shoes", 13.0),
    "APPAREL": ("apparel", 13.0),
    "BAG": ("bag", 8.0),
    "EQUIPMENT": ("sports", 8.0),
    "ELECTRONICS": ("tech", 8.0),
    "FIGURE": ("sports", 8.0),
}


def won(n) -> str:
    return f"{int(round(n)):,}원"


def load_report(path: str) -> dict:
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def pick_row(it: dict, rank: int) -> dict | None:
    """리포트 항목 하나 → 웹진 카드 하나. 값이 빠진 항목은 버립니다."""
    try:
        usd = float(it["us_price_usd"])
        sell = float(it["sell_price_krw"])
        margin = int(it["net_margin_krw"])
    except (KeyError, TypeError, ValueError):
        return None
    domestic = it.get("domestic_price_krw")
    if domestic is None or usd <= 0:
        return None

    ptype = str(it.get("product_type") or "").upper()
    cat, duty = CAT_BY_TYPE.get(ptype, ("custom", float(it.get("customs_duty_rate_pct") or 8.0)))

    intl = int(it.get("intl_shipping_krw") or 0)
    card_fee = int(it.get("card_fee_krw") or 0)
    shipout = int(it.get("domestic_shipping_krw") or 0)
    # 판매 수수료율은 리포트가 실제로 뺀 값에서 역산합니다(설정이 바뀌어도 화면과 계산기가 같아지도록).
    fee_krw = float(it.get("sell_fee_krw") or 0)
    fee_pct = round(fee_krw / sell * 100, 2) if sell else 0.0

    return {
        "rank": rank,
        "sku": str(it.get("sku") or ""),
        "krSku": str(it.get("kr_sku") or ""),
        "nameKo": str(it.get("name_kr") or it.get("name_us") or ""),
        "nameEn": str(it.get("name_us") or it.get("name_kr") or ""),
        "match": "exact" if str(it.get("match")) == "exact" else "model",
        "usd": round(usd, 2),
        "domestic": int(round(domestic)),
        "invested": int(it.get("invested_krw") or 0),
        "customs": int(it.get("customs_total_krw") or 0),
        "margin": margin,
        "roi": round(float(it.get("roi_pct") or 0.0), 1),
        "usUrl": str(it.get("us_url") or ""),
        "krUrl": str(it.get("kr_url") or ""),
        # [계산기에 바로 채우기] 가 넣을 값 — 해외직구 탭 기준이며 스캐너 계산을 그대로 재현합니다.
        "fill": {
            "cur": str(it.get("currency") or "USD"),
            "price": round(usd, 2),
            "fx": round(float(it.get("fx_rate") or 0), 2),
            "local": 0,
            "intl": intl,
            "forward": 0,
            "cat": cat,
            "duty": round(float(it.get("customs_duty_rate_pct") or duty), 1),
            "business": False,
            "sell": int(round(sell)),
            "fee": fee_pct,
            "fixed": 0,
            "shipout": shipout,
            "other": card_fee,
        },
    }


def build_doc(report: dict, top: int) -> dict:
    rows = []
    for it in (report.get("items") or []):
        row = pick_row(it, len(rows) + 1)
        if row:
            rows.append(row)
    # 순마진 높은 순. 동률이면 ROI 높은 순.
    rows.sort(key=lambda r: (r["margin"], r["roi"]), reverse=True)
    for i, r in enumerate(rows, 1):
        r["rank"] = i
    items = rows[:max(1, top)]

    counts = report.get("counts") or {}
    fx = report.get("fx") or {}
    gen = str(report.get("generated_at") or "")
    now = datetime.now(KST)
    return {
        "version": 1,
        "date": str(report.get("date") or ""),
        "generatedAt": gen,
        "syncedAt": now.isoformat(timespec="seconds"),
        "fx": {
            "usdKrw": round(float(fx.get("usd_krw") or 0), 2),
            "source": str(fx.get("source") or ""),
            "live": bool(fx.get("live")),
        },
        "scan": {
            "us": int(counts.get("us") or 0),
            "kr": int(counts.get("kr") or 0),
            "pairs": int(counts.get("pairs") or 0),
            "positive": sum(1 for r in rows if r["margin"] > 0),
            "shown": len(items),
            "best": rows[0]["margin"] if rows else 0,
        },
        "items": items,
    }


def write_doc(doc: dict, name: str = OUT_NAME) -> list[str]:
    written = []
    text = json.dumps(doc, ensure_ascii=False, indent=1) + "\n"
    paths = [os.path.join(DATA, name)]
    for lang in LANGS:
        d = os.path.join(ROOT, lang, "data")
        if os.path.isdir(d):
            paths.append(os.path.join(d, name))
    for p in paths:
        os.makedirs(os.path.dirname(p), exist_ok=True)
        with open(p, "w", encoding="utf-8") as f:
            f.write(text)
        written.append(os.path.relpath(p, ROOT))
    return written


def age_hours(doc: dict) -> float | None:
    try:
        gen = datetime.fromisoformat(doc["generatedAt"].replace("Z", "+00:00"))
    except Exception:
        return None
    if gen.tzinfo is None:
        gen = gen.replace(tzinfo=KST)
    return (datetime.now(KST) - gen).total_seconds() / 3600


def main() -> int:
    ap = argparse.ArgumentParser(description="리셀 스캐너 결과를 웹진 데이터로 옮깁니다.")
    ap.add_argument("--report", default=DEFAULT_REPORT, help="스캐너 리포트 JSON(기본 latest.json)")
    ap.add_argument("--top", type=int, default=5, help="화면에 올릴 개수(기본 5)")
    ap.add_argument("--check", action="store_true", help="파일을 쓰지 않고 결과만 확인")
    ap.add_argument("--max-age-hours", type=float, default=36.0, help="이보다 오래된 리포트면 경고(기본 36)")
    args = ap.parse_args()

    if not os.path.exists(args.report):
        print(f"[sync-resell] 리포트가 없습니다: {args.report}")
        return 2
    report = load_report(args.report)
    doc = build_doc(report, args.top)
    if not doc["items"]:
        print("[sync-resell] 옮길 항목이 없습니다(리포트 items 비어 있음). 이전 파일을 그대로 둡니다.")
        return 3

    age = age_hours(doc)
    if age is not None and args.max_age_hours and age > args.max_age_hours:
        print(f"[sync-resell] 주의: 리포트가 {age:.1f}시간 전 것입니다({doc['generatedAt']}). 그대로 옮깁니다.")

    print(f"[sync-resell] {doc['date']} · 기준 {doc['generatedAt']}")
    print(f"  스캔 미국 {doc['scan']['us']} · 한국 {doc['scan']['kr']} · 비교쌍 {doc['scan']['pairs']}"
          f" / 순마진 플러스 {doc['scan']['positive']}개")
    print(f"  환율 USD/KRW {doc['fx']['usdKrw']:,.2f} ({doc['fx']['source']})")
    for r in doc["items"]:
        sign = "+" if r["margin"] >= 0 else "−"
        print(f"  {r['rank']}. {r['nameKo']} [{r['sku']}] 해외 ${r['usd']:.2f}"
              f" → 총원가 {won(r['invested'])} · 국내 {won(r['domestic'])}"
              f" · 순마진 {sign}{abs(r['margin']):,}원 (ROI {r['roi']:+.1f}%)")

    if args.check:
        print("[sync-resell] --check: 파일을 쓰지 않았습니다.")
        return 0
    for rel in write_doc(doc):
        print(f"  · {rel}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
