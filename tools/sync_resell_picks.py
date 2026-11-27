#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""sync_resell_picks.py — 리셀 스캐너 결과를 웹진(resell.html)의 '오늘의 실측 마진 아이템' 데이터로 옮깁니다.

  python3 tools/sync_resell_picks.py                     # 최신 리포트 → data/resell-picks.json (+ en·zh·ja 사본)
                                                        #   + pokemon-latest.json → data/pokemon-picks.json
                                                        #   + global-latest.json → data/global-picks.json
  python3 tools/sync_resell_picks.py --top 6             # 보여 줄 개수
  python3 tools/sync_resell_picks.py --check             # 파일을 쓰지 않고 결과만 확인
  python3 tools/sync_resell_picks.py --no-pokemon        # 포켓몬 카드 데이터는 건드리지 않음
  python3 tools/sync_resell_picks.py --global-top 15     # 해외직구 품목(전자기기·캠핑·생활·레고)으로 올릴 개수(기본 15)
  python3 tools/sync_resell_picks.py --no-global         # 해외직구 품목 데이터는 건드리지 않음
  python3 tools/sync_resell_picks.py --global-only       # 해외직구 품목만 동기화
  python3 tools/sync_resell_picks.py --pokemon-only      # 포켓몬 카드만 동기화
  python3 tools/sync_resell_picks.py --pokemon-top 6     # 포켓몬 카드로 올릴 개수(기본 6)
  python3 tools/sync_resell_picks.py --report ../pickle-automation/reports/resell-margin/2026-11-26.json \
                                     --pokemon-report ../pickle-automation/reports/resell-margin/pokemon-latest.json

원칙
  · 내보내는 값은 상품명·상품코드·해외가·총원가·관부가세·국내시세·순마진·ROI·일치여부·링크·기준일시뿐입니다.
    스캐너 리포트의 소스 목록·오류 메시지·가중치·설정값·로컬 경로는 옮기지 않습니다.
  · 같은 파일을 en·zh·ja/data 에도 복사합니다(언어 페이지가 자기 폴더의 사본을 읽습니다).
  · 리포트가 하루 이상 지났으면 경고만 하고 그대로 옮깁니다(--max-age-hours 로 조정).
  · 포켓몬 카드는 스캐너가 이미 '같은 언어판(일본판)끼리' 비교한 결과만 옮깁니다. 언어판을 섞지 않습니다.
"""
from __future__ import annotations

import argparse
import json
import os
import sys
from datetime import datetime, timedelta, timezone

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, ".."))
DATA = os.path.join(ROOT, "data")
OUT_NAME = "resell-picks.json"
POKEMON_OUT_NAME = "pokemon-picks.json"
GLOBAL_OUT_NAME = "global-picks.json"
LANGS = ("en", "zh", "ja")
DEFAULT_REPORT = os.path.abspath(os.path.join(ROOT, "..", "pickle-automation", "reports", "resell-margin", "latest.json"))
DEFAULT_POKEMON_REPORT = os.path.abspath(os.path.join(ROOT, "..", "pickle-automation", "reports", "resell-margin", "pokemon-latest.json"))
DEFAULT_GLOBAL_REPORT = os.path.abspath(os.path.join(ROOT, "..", "pickle-automation", "reports", "resell-margin", "global-latest.json"))

# 해외직구 품목 카테고리 → 계산기 프리셋(data-key). 관세율은 스캐너가 실제로 적용한 값을 그대로 씁니다.
GLOBAL_CAT_FILL = {
    "electronics": "tech",
    "camping": "sports",
    "household": "custom",
    "lego": "sports",
    "figure": "sports",
}
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


# ---------------------------------------------------------------------------
# 포켓몬 카드(TCG) — 같은 언어판끼리만 비교한 국내외 시세
# ---------------------------------------------------------------------------
# 중국어 페이지용 카드 이름(공식 중문판 표기). 사전에 없으면 영어 이름으로 대체합니다.
POKEMON_ZH = {
    "リザードンex": "喷火龙ex",
    "ミュウex": "梦幻ex",
    "フシギバナex": "妙蛙花ex",
    "カメックスex": "水箭龟ex",
    "サーナイトex": "沙奈朵ex",
    "ゲッコウガex": "甲贺忍蛙ex",
    "ブラッキーex": "月亮伊布ex",
    "リーフィアex": "叶伊布ex",
    "イーブイex": "伊布ex",
    "テラパゴスex": "太乐巴戈斯ex",
    "シロナのガブリアスex": "竹兰的烈咬陆鲨ex",
    "リーフィアVSTAR": "叶伊布VSTAR",
    "メガカイリューex": "超级快龙ex",
    "メガラティアスex": "超级拉帝亚斯ex",
    "ピカチュウex": "皮卡丘ex",
}
def pick_pokemon_row(it: dict, rank: int) -> dict | None:
    """포켓몬 카드 리포트 항목 하나 → 웹진 카드 하나. 값이 빠진 항목은 버립니다."""
    try:
        jp = float(it["jp_price_jpy"])
        kr = int(it["kr_price_krw"])
        margin = int(it["net_margin_krw"])
    except (KeyError, TypeError, ValueError):
        return None
    if jp <= 0 or kr <= 0:
        return None

    sell = int(it.get("sell_price_krw") or 0)
    if sell <= 0:
        return None
    fee_krw = float(it.get("sell_fee_krw") or 0)
    fee_pct = round(fee_krw / sell * 100, 2) if sell else 0.0

    intl = int(it.get("intl_shipping_krw") or 0)
    shipout = int(it.get("domestic_shipping_krw") or 0)
    fixed = int(it.get("inspection_fee_krw") or 0)
    card_fee = int(it.get("card_fee_krw") or 0)

    return {
        "rank": rank,
        "id": str(it.get("id") or ""),
        "set": str(it.get("set") or ""),
        "setKo": str(it.get("setKo") or ""),
        "cardNo": str(it.get("cardNo") or ""),
        "rarity": str(it.get("rarity") or ""),
        "nameKo": str(it.get("koName") or it.get("enName") or ""),
        "nameEn": str(it.get("enName") or it.get("koName") or ""),
        "nameJp": str(it.get("jpName") or ""),
        "nameZh": POKEMON_ZH.get(str(it.get("jpName") or ""), ""),
        "lang": "ja",
        # 일본(구매) 쪽
        "jp": int(round(jp)),
        "jpCond": str(it.get("jp_condition") or ""),
        "jpCheap": int(it.get("jp_price_cheap_jpy") or 0),
        "jpCheapCond": str(it.get("jp_cheap_condition") or ""),
        "jpStock": int(it.get("jp_stock") or 0),
        "jpUrl": str(it.get("jp_url") or ""),
        # 국내(판매) 쪽
        "kr": kr,
        "krAsOf": str(it.get("kr_as_of") or ""),
        "krUrl": str(it.get("kr_url") or ""),
        # 비용
        "invested": int(it.get("invested_krw") or 0),
        "customs": int(it.get("customs_total_krw") or 0),
        "shipping": intl + shipout,
        "intl": intl,
        "sell": sell,
        "margin": margin,
        "roi": round(float(it.get("roi_pct") or 0.0), 1),
        "bep": int(it["bep_jpy"]) if it.get("bep_jpy") is not None else None,
        "bepGap": it.get("bep_gap_pct"),
        # [계산기에 바로 채우기] — 해외직구 탭(엔화) 기준, 스캐너 계산을 그대로 재현합니다.
        "fill": {
            "cur": "JPY",
            "price": round(jp, 2),
            "fx": round(float(it.get("fx_rate") or 0), 4),
            "local": 0,
            "intl": intl,
            "forward": 0,
            "cat": "card",
            "duty": round(float(it.get("customs_duty_rate_pct") or 0), 1),
            "business": False,
            "sell": sell,
            "fee": fee_pct,
            "fixed": fixed,
            "shipout": shipout,
            "other": card_fee,
        },
    }


def build_pokemon_doc(report: dict, top: int) -> dict:
    rows = []
    for it in (report.get("items") or []):
        row = pick_pokemon_row(it, len(rows) + 1)
        if row:
            rows.append(row)
    rows.sort(key=lambda r: (r["margin"], r["roi"]), reverse=True)
    for i, r in enumerate(rows, 1):
        r["rank"] = i
    items = rows[:max(1, top)]

    counts = report.get("counts") or {}
    basis = report.get("basis") or {}
    fx = report.get("fx") or {}
    return {
        "version": 1,
        "kind": "pokemon",
        "date": str(report.get("date") or ""),
        "generatedAt": str(report.get("generated_at") or ""),
        "syncedAt": datetime.now(KST).isoformat(timespec="seconds"),
        "fx": {
            "jpyKrw": round(float(fx.get("jpy_krw") or 0), 4),
            "usdKrw": round(float(fx.get("usd_krw") or 0), 2),
            "source": str(fx.get("source") or ""),
            "live": bool(fx.get("live")),
        },
        "basis": {
            "lang": "ja",
            "rule": str(basis.get("rule") or ""),
            "krPriceKind": str(basis.get("kr_price_kind") or ""),
            "sellDiscountPct": float(basis.get("sell_discount_pct") or 0),
            "channel": str(basis.get("channel_label") or ""),
            "feePct": float(basis.get("fee_pct") or 0),
            "fixedKrw": int(basis.get("fixed_fee_krw") or 0),
            "shipoutKrw": int(basis.get("shipout_krw") or 0),
            "dutyPct": float(basis.get("duty_rate_pct") or 0),
            "deMinimisUsd": float(basis.get("de_minimis_usd") or 150),
            "warnings": [str(w) for w in (basis.get("warnings") or [])],
        },
        "scan": {
            "cards": int(counts.get("cards") or 0),
            "resolved": int(counts.get("resolved") or 0),
            "positive": sum(1 for r in rows if r["margin"] > 0),
            "shown": len(items),
            "best": rows[0]["margin"] if rows else 0,
            "buyable": int(counts.get("buyable_at_retail") or 0),
        },
        "items": items,
    }


# ---------------------------------------------------------------------------
# 해외직구 품목(전자기기·캠핑·생활용품·레고/피규어) — 미국·일본 실측가 대비 국내 시세
# ---------------------------------------------------------------------------
def pick_global_row(it: dict, rank: int) -> dict | None:
    """global-latest.json 항목 하나 → 웹진 카드 하나. 값이 빠진 항목은 버립니다."""
    try:
        price = float(it["price_local"])
        invested = int(it["invested_krw"])
        domestic = int(it["domestic_price_krw"])
        sell = int(it["sell_price_krw"])
        margin = int(it["net_margin_krw"])
    except (KeyError, TypeError, ValueError):
        return None
    if price <= 0 or domestic <= 0 or invested <= 0:
        return None

    cur = str(it.get("currency") or "USD").upper()
    cat = str(it.get("cat") or "")
    intl = int(it.get("intl_shipping_krw") or 0)
    card_fee = int(it.get("card_fee_krw") or 0)
    shipout = int(it.get("domestic_shipping_krw") or 0)
    fee_krw = float(it.get("sell_fee_krw") or 0)
    fee_pct = round(fee_krw / sell * 100, 2) if sell else 0.0

    return {
        "rank": rank,
        "key": str(it.get("key") or ""),
        "cat": cat,
        "catKo": str(it.get("catKo") or cat),
        "catEn": str(it.get("catEn") or cat),
        "nameKo": str(it.get("name_ko") or it.get("name_en") or ""),
        "nameEn": str(it.get("name_en") or it.get("name_ko") or ""),
        "model": str(it.get("model") or ""),
        "origin": str(it.get("origin") or "US"),
        "cur": cur,
        "price": round(price, 2),
        "priceKind": "rrp" if str(it.get("price_kind")) == "rrp" else "live",
        "invested": invested,
        "customs": int(it.get("customs_total_krw") or 0),
        "domestic": domestic,
        "sell": sell,
        "margin": margin,
        "roi": round(float(it.get("roi_pct") or 0.0), 1),
        "overseasUrl": str(it.get("overseas_url") or ""),
        "krUrl": str(it.get("kr_url") or ""),
        # [계산기에 바로 채우기] — 해외직구 탭. 스캐너 계산을 그대로 재현하는 값입니다.
        "fill": {
            "cur": cur,
            "price": round(price, 2),
            "fx": round(float(it.get("fx_rate") or 0), 4),
            "local": 0,
            "intl": intl,
            "forward": 0,
            "cat": GLOBAL_CAT_FILL.get(cat, "custom"),
            "duty": round(float(it.get("customs_duty_rate_pct") or 8), 1),
            "business": bool(it.get("customs_taxable")),
            "sell": sell,
            "fee": fee_pct,
            "fixed": 0,
            "shipout": shipout,
            "other": card_fee,
        },
    }


def build_global_doc(report: dict, top: int) -> dict:
    rows = []
    for it in (report.get("items") or []):
        row = pick_global_row(it, len(rows) + 1)
        if row:
            rows.append(row)
    rows.sort(key=lambda r: (r["margin"], r["roi"]), reverse=True)
    for i, r in enumerate(rows, 1):
        r["rank"] = i
    items = rows[:max(1, top)]

    cats: dict[str, dict] = {}
    for r in rows:
        c = cats.setdefault(r["cat"], {"items": 0, "positive": 0, "best": -10 ** 12})
        c["items"] += 1
        if r["margin"] > 0:
            c["positive"] += 1
        c["best"] = max(c["best"], r["margin"])

    fx = report.get("fx") or {}
    counts = report.get("counts") or {}
    return {
        "version": 1,
        "kind": "global",
        "date": str(report.get("date") or ""),
        "generatedAt": str(report.get("generated_at") or ""),
        "syncedAt": datetime.now(KST).isoformat(timespec="seconds"),
        "fx": {
            "usdKrw": round(float(fx.get("usd_krw") or 0), 2),
            "jpyKrw": round(float(fx.get("jpy_krw") or 0), 4),
            "source": str(fx.get("source") or ""),
            "live": bool(fx.get("live")),
        },
        "scan": {
            "scanned": int(counts.get("items") or 0),
            "matched": int(counts.get("matched") or 0),
            "positive": sum(1 for r in rows if r["margin"] > 0),
            "shown": len(items),
            "best": rows[0]["margin"] if rows else 0,
            "categories": [
                {"key": k, "items": v["items"], "positive": v["positive"], "best": v["best"]}
                for k, v in sorted(cats.items(), key=lambda kv: kv[1]["best"], reverse=True)
            ],
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


def sync_pokemon(args) -> int:
    print(f"[sync-pokemon] 리포트: {os.path.relpath(args.pokemon_report, ROOT) if args.pokemon_report.startswith(ROOT) else args.pokemon_report}")
    if not os.path.exists(args.pokemon_report):
        print(f"[sync-pokemon] 리포트가 없습니다: {args.pokemon_report}")
        return 2
    report = load_report(args.pokemon_report)
    doc = build_pokemon_doc(report, args.pokemon_top)
    if not doc["items"]:
        print("[sync-pokemon] 옮길 카드가 없습니다(리포트 items 비어 있음). 이전 파일을 그대로 둡니다.")
        return 3

    age = age_hours(doc)
    if age is not None and args.max_age_hours and age > args.max_age_hours:
        print(f"[sync-pokemon] 주의: 리포트가 {age:.1f}시간 전 것입니다({doc['generatedAt']}). 그대로 옮깁니다.")

    print(f"[sync-pokemon] {doc['date']} · 기준 {doc['generatedAt']}")
    print(f"  카드 {doc['scan']['cards']}종 스캔 · 확정 {doc['scan']['resolved']}종"
          f" · 순마진 플러스 {doc['scan']['positive']}종 · 지금 일본가로 사도 남는 카드 {doc['scan']['buyable']}종")
    print(f"  환율 JPY/KRW {doc['fx']['jpyKrw']:,.4f} ({doc['fx']['source']})")
    for r in doc["items"]:
        bep = f"¥{r['bep']:,}" if r["bep"] else "없음"
        print(f"  {r['rank']}. {r['nameKo']} {r['rarity']} [{r['set']} {r['cardNo']}]"
              f" 일본 ¥{r['jp']:,} → 국내 {won(r['kr'])}"
              f" · 총원가 {won(r['invested'])} · 순마진 {r['margin']:+,}원 (ROI {r['roi']:+.1f}%) · 손익분기 {bep}")

    if args.check:
        print("[sync-pokemon] --check: 파일을 쓰지 않았습니다.")
        return 0
    for rel in write_doc(doc, POKEMON_OUT_NAME):
        print(f"  · {rel}")
    return 0


def sync_global(args) -> int:
    print(f"[sync-global] 리포트: {os.path.relpath(args.global_report, ROOT) if args.global_report.startswith(ROOT) else args.global_report}")
    if not os.path.exists(args.global_report):
        print(f"[sync-global] 리포트가 없습니다: {args.global_report}")
        return 2
    report = load_report(args.global_report)
    doc = build_global_doc(report, args.global_top)
    if not doc["items"]:
        print("[sync-global] 옮길 항목이 없습니다(리포트 items 비어 있음). 이전 파일을 그대로 둡니다.")
        return 3

    age = age_hours(doc)
    if age is not None and args.max_age_hours and age > args.max_age_hours:
        print(f"[sync-global] 주의: 리포트가 {age:.1f}시간 전 것입니다({doc['generatedAt']}). 그대로 옮깁니다.")

    scan = doc["scan"]
    print(f"[sync-global] {doc['date']} · 기준 {doc['generatedAt']}")
    print(f"  감시 {scan['scanned']}개 품목 · 매칭 {scan['matched']}개"
          f" · 순마진 플러스 {scan['positive']}개 · 화면 표시 {scan['shown']}개")
    print(f"  환율 USD/KRW {doc['fx']['usdKrw']:,.2f} · JPY/KRW {doc['fx']['jpyKrw']:,.4f} ({doc['fx']['source']})")
    for r in doc["items"]:
        unit = "$" if r["cur"] == "USD" else "¥"
        print(f"  {r['rank']}. [{r['catKo']}] {r['nameKo'][:30]} [{r['model']}]"
              f" {unit}{r['price']:,.2f} → 총원가 {won(r['invested'])} · 국내 {won(r['domestic'])}"
              f" · 순마진 {r['margin']:+,}원 (ROI {r['roi']:+.1f}%)")

    if args.check:
        print("[sync-global] --check: 파일을 쓰지 않았습니다.")
        return 0
    for rel in write_doc(doc, GLOBAL_OUT_NAME):
        print(f"  · {rel}")
    return 0


def main() -> int:
    ap = argparse.ArgumentParser(description="리셀·포켓몬·해외직구 품목 스캐너 결과를 웹진 데이터로 옮깁니다.")
    ap.add_argument("--report", default=DEFAULT_REPORT, help="스캐너 리포트 JSON(기본 latest.json)")
    ap.add_argument("--pokemon-report", default=DEFAULT_POKEMON_REPORT,
                    help="포켓몬 카드 리포트 JSON(기본 pokemon-latest.json)")
    ap.add_argument("--top", type=int, default=5, help="화면에 올릴 개수(기본 5)")
    ap.add_argument("--pokemon-top", type=int, default=6, help="포켓몬 카드로 올릴 개수(기본 6)")
    ap.add_argument("--check", action="store_true", help="파일을 쓰지 않고 결과만 확인")
    ap.add_argument("--max-age-hours", type=float, default=36.0, help="이보다 오래된 리포트면 경고(기본 36)")
    ap.add_argument("--global-report", default=DEFAULT_GLOBAL_REPORT,
                    help="해외직구 품목 리포트 JSON(기본 global-latest.json)")
    ap.add_argument("--global-top", type=int, default=15, help="해외직구 품목으로 올릴 개수(기본 15)")
    ap.add_argument("--no-pokemon", action="store_true", help="포켓몬 카드 데이터는 건드리지 않음")
    ap.add_argument("--pokemon-only", action="store_true", help="포켓몬 카드만 동기화")
    ap.add_argument("--no-global", action="store_true", help="해외직구 품목 데이터는 건드리지 않음")
    ap.add_argument("--global-only", action="store_true", help="해외직구 품목만 동기화")
    args = ap.parse_args()

    if args.pokemon_only:
        return sync_pokemon(args)
    if args.global_only:
        return sync_global(args)

    if not os.path.exists(args.report):
        print(f"[sync-resell] 리포트가 없습니다: {args.report}")
        rc = 2
    else:
        report = load_report(args.report)
        doc = build_doc(report, args.top)
        if not doc["items"]:
            print("[sync-resell] 옮길 항목이 없습니다(리포트 items 비어 있음). 이전 파일을 그대로 둡니다.")
            rc = 3
        else:
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
            else:
                for rel in write_doc(doc):
                    print(f"  · {rel}")
            rc = 0

    grc = 0
    if not args.no_global:
        grc = sync_global(args)
    if args.no_pokemon:
        return rc if rc in (0, 3) else (grc or rc)
    prc = sync_pokemon(args)
    for code in (rc, grc, prc):
        if code not in (0, 3):
            return code
    return 0


if __name__ == "__main__":
    sys.exit(main())
