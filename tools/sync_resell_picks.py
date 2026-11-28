#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""sync_resell_picks.py — 스캐너 결과를 웹진(resell.html)의 3개 섹션 데이터로 옮깁니다.

  상품(GOODS)  : 전자기기·캠핑·생활용품·레고·피규어 54종 + 나이키 스니커즈 실측 쌍
  명품(LUXURY) : 명품·컨템포러리 50종
  기념카드(CARDS): 포켓몬·원피스·유희왕 (판본 코드 매칭)

  python3 tools/sync_resell_picks.py                        # 세 섹션 모두 갱신
  python3 tools/sync_resell_picks.py --check                # 파일을 쓰지 않고 결과만 확인
  python3 tools/sync_resell_picks.py --goods-top 60 --lux-top 50 --cards-top 50
  python3 tools/sync_resell_picks.py --only goods           # 한 섹션만
  python3 tools/sync_resell_picks.py --report ../pickle-automation/reports/resell-margin/latest.json \
      --global-report ../pickle-automation/reports/resell-margin/global-latest.json \
      --cards-report ../pickle-automation/reports/resell-margin/cards-latest.json

쓰는 파일
  data/goods-picks.json · data/lux-picks.json · data/cards-picks.json
  (+ en·zh·ja/data 사본 — 언어 페이지는 자기 폴더의 사본을 읽습니다)

원칙
  · 내보내는 값은 상품명·모델/카드 코드·해외가·총원가·관부가세·국내시세·순마진·ROI·일치여부·링크·기준일시뿐입니다.
    스캐너 리포트의 소스 목록·오류 메시지·설정값·로컬 경로는 옮기지 않습니다.
  · 리포트가 오래됐으면 경고만 하고 그대로 옮깁니다(--max-age-hours).
  · 카드는 스캐너가 이미 '같은 언어판·같은 판본 코드'로 맞춘 결과만 옮깁니다.
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
LANGS = ("en", "zh", "ja")
KST = timezone(timedelta(hours=9))

DEFAULT_REPORT = os.path.abspath(os.path.join(
    ROOT, "..", "pickle-automation", "reports", "resell-margin", "latest.json"))
DEFAULT_GLOBAL_REPORT = os.path.abspath(os.path.join(
    ROOT, "..", "pickle-automation", "reports", "resell-margin", "global-latest.json"))
DEFAULT_CARDS_REPORT = os.path.abspath(os.path.join(
    ROOT, "..", "pickle-automation", "reports", "resell-margin", "cards-latest.json"))
DEFAULT_JA_GOODS = os.path.abspath(os.path.join(
    ROOT, "..", "pickle-automation", "reports", "resell-margin", "ja-goods-latest.json"))
DEFAULT_JA_LUX = os.path.abspath(os.path.join(
    ROOT, "..", "pickle-automation", "reports", "resell-margin", "ja-lux-latest.json"))
DEFAULT_JA_CARDS = os.path.abspath(os.path.join(
    ROOT, "..", "pickle-automation", "reports", "resell-margin", "ja-cards-latest.json"))
DEFAULT_US_CARDS = os.path.abspath(os.path.join(
    ROOT, "..", "pickle-automation", "reports", "resell-margin", "us-cards-latest.json"))

GOODS_OUT = "goods-picks.json"
LUX_OUT = "lux-picks.json"
CARDS_OUT = "cards-picks.json"

# 해외직구 품목 카테고리 → 계산기 프리셋(data-key).
GLOBAL_CAT_FILL = {
    "lux": "apparel",
    "electronics": "tech",
    "camping": "sports",
    "household": "custom",
    "lego": "sports",
    "figure": "sports",
    "sneakers": "shoes",
}
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


def load(path: str) -> dict:
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def age_hours(iso: str) -> float | None:
    try:
        gen = datetime.fromisoformat(str(iso).replace("Z", "+00:00"))
    except Exception:
        return None
    if gen.tzinfo is None:
        gen = gen.replace(tzinfo=KST)
    return (datetime.now(KST) - gen).total_seconds() / 3600


def write_doc(doc: dict, name: str, targets: tuple[str, ...] = ("", "en", "zh", "ja")) -> list[str]:
    """targets: "" = 루트 data/, 그 밖엔 언어 폴더(en·zh·ja)."""
    text = json.dumps(doc, ensure_ascii=False, indent=1) + "\n"
    written = []
    for lang in targets:
        d = os.path.join(ROOT, lang, "data") if lang else DATA
        if lang and not os.path.isdir(d):
            continue
        p = os.path.join(d, name)
        os.makedirs(os.path.dirname(p), exist_ok=True)
        with open(p, "w", encoding="utf-8") as f:
            f.write(text)
        written.append(os.path.relpath(p, ROOT))
    return written


FX_KEYS = {"usdKrw": "usd_krw", "jpyKrw": "jpy_krw", "eurKrw": "eur_krw", "gbpKrw": "gbp_krw"}


def base_doc(kind: str, report: dict, fx_keys: tuple[str, ...]) -> dict:
    fx = report.get("fx") or {}
    out = {}
    for k in fx_keys:
        src = FX_KEYS.get(k, k)
        out[k] = round(float(fx.get(src) or fx.get(k) or 0), 4)
    return {
        "version": 2,
        "kind": kind,
        "date": str(report.get("date") or ""),
        "generatedAt": str(report.get("generated_at") or ""),
        "syncedAt": datetime.now(KST).isoformat(timespec="seconds"),
        "fx": {**out, "source": str(fx.get("source") or ""), "live": bool(fx.get("live"))},
    }


# ---------------------------------------------------------------------------
# 1) 상품 — 해외직구 품목(레고·전자·캠핑·생활·피규어) + 나이키 스니커즈
# ---------------------------------------------------------------------------
def pick_goods_row(it: dict, rank: int) -> dict | None:
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
    customs_fee = int(it.get("customs_fee_krw") or 0)
    shipout = int(it.get("domestic_shipping_krw") or 0)
    fee_krw = float(it.get("sell_fee_krw") or 0)
    fee_pct = round(fee_krw / sell * 100, 2) if sell else 0.0

    return {
        "rank": rank, "key": str(it.get("key") or ""), "cat": cat,
        "catKo": str(it.get("catKo") or cat), "catEn": str(it.get("catEn") or cat),
        "nameKo": str(it.get("name_ko") or it.get("name_en") or ""),
        "nameEn": str(it.get("name_en") or it.get("name_ko") or ""),
        "model": str(it.get("model") or ""), "origin": str(it.get("origin") or "US"),
        "cur": cur, "price": round(price, 2),
        "priceKind": "rrp" if str(it.get("price_kind")) == "rrp" else "live",
        "invested": invested, "customs": int(it.get("customs_total_krw") or 0),
        "ict": int(it.get("customs_individual_tax_krw") or 0),
        "domestic": domestic, "sell": sell, "margin": margin,
        "roi": round(float(it.get("roi_pct") or 0.0), 1),
        "overseasUrl": str(it.get("overseas_url") or ""), "krUrl": str(it.get("kr_url") or ""),
        "fill": {
            "cur": cur, "price": round(price, 2),
            "fx": round(float(it.get("fx_rate") or 0), 4), "local": 0, "intl": intl, "forward": 0,
            "cat": GLOBAL_CAT_FILL.get(cat, "custom"),
            "duty": round(float(it.get("customs_duty_rate_pct") or 8), 1),
            "business": bool(it.get("customs_taxable")), "sell": sell,
            "fee": fee_pct, "fixed": 0, "shipout": shipout, "other": card_fee + customs_fee,
        },
    }


def pick_sneaker_row(it: dict, rank: int) -> dict | None:
    try:
        usd = float(it["us_price_usd"])
        sell = float(it["sell_price_krw"])
        margin = int(it["net_margin_krw"])
        domestic = int(it["domestic_price_krw"])
    except (KeyError, TypeError, ValueError):
        return None
    if usd <= 0 or domestic <= 0:
        return None
    ptype = str(it.get("product_type") or "").upper()
    cat, duty = CAT_BY_TYPE.get(ptype, ("custom", float(it.get("customs_duty_rate_pct") or 8.0)))
    intl = int(it.get("intl_shipping_krw") or 0)
    card_fee = int(it.get("card_fee_krw") or 0)
    shipout = int(it.get("domestic_shipping_krw") or 0)
    fee_krw = float(it.get("sell_fee_krw") or 0)
    fee_pct = round(fee_krw / sell * 100, 2) if sell else 0.0
    return {
        "rank": rank, "key": "sneaker:" + str(it.get("sku") or ""), "cat": "sneakers",
        "catKo": "스니커즈", "catEn": "Sneakers",
        "nameKo": str(it.get("name_kr") or it.get("name_us") or ""),
        "nameEn": str(it.get("name_us") or it.get("name_kr") or ""),
        "model": str(it.get("sku") or ""), "origin": "US",
        "cur": "USD", "price": round(usd, 2), "priceKind": "live",
        "invested": int(it.get("invested_krw") or 0),
        "customs": int(it.get("customs_total_krw") or 0), "ict": 0,
        "domestic": domestic, "sell": int(round(sell)), "margin": margin,
        "roi": round(float(it.get("roi_pct") or 0.0), 1),
        "match": "exact" if str(it.get("match")) == "exact" else "model",
        "overseasUrl": str(it.get("us_url") or ""), "krUrl": str(it.get("kr_url") or ""),
        "fill": {
            "cur": "USD", "price": round(usd, 2), "fx": round(float(it.get("fx_rate") or 0), 2),
            "local": 0, "intl": intl, "forward": 0, "cat": cat,
            "duty": round(float(it.get("customs_duty_rate_pct") or duty), 1),
            "business": False, "sell": int(round(sell)), "fee": fee_pct, "fixed": 0,
            "shipout": shipout, "other": card_fee,
        },
    }


def build_goods_doc(global_report: dict, sneaker_report: dict | None, top: int) -> dict:
    rows: list[dict] = []
    for it in (global_report.get("items") or []):
        if str(it.get("cat")) == "lux":
            continue
        r = pick_goods_row(it, 0)
        if r:
            rows.append(r)
    n_goods = len(rows)
    if sneaker_report:
        for it in (sneaker_report.get("items") or []):
            r = pick_sneaker_row(it, 0)
            if r:
                rows.append(r)
    rows.sort(key=lambda r: (r["margin"], r["roi"]), reverse=True)
    for i, r in enumerate(rows, 1):
        r["rank"] = i
    items = rows[:max(1, top)]
    g = global_report.get("counts") or {}
    unmatched = global_report.get("unmatched") or []
    watched = len(rows) + sum(1 for u in unmatched if str(u.get("cat")) != "lux")
    doc = base_doc("goods", global_report, ("usdKrw", "jpyKrw"))
    doc["scan"] = {
        "watched": watched, "matched": len(rows),
        "positive": sum(1 for r in rows if r["margin"] > 0),
        "shown": len(items), "best": rows[0]["margin"] if rows else 0,
        "sneakers": n_goods and len(rows) - n_goods or 0,
        "sneakerPairs": int((sneaker_report or {}).get("counts", {}).get("pairs") or 0),
    }
    doc["categories"] = sorted(
        [{"key": c, "count": sum(1 for r in rows if r["cat"] == c)}
         for c in {r["cat"] for r in rows}], key=lambda x: -x["count"])
    doc["items"] = items
    return doc


# ---------------------------------------------------------------------------
# 2) 명품 — 명품·컨템포러리
# ---------------------------------------------------------------------------
def build_lux_doc(global_report: dict, top: int) -> dict:
    rows = []
    for it in (global_report.get("items") or []):
        if str(it.get("cat")) != "lux":
            continue
        r = pick_goods_row(it, 0)
        if r:
            rows.append(r)
    rows.sort(key=lambda r: (r["margin"], r["roi"]), reverse=True)
    for i, r in enumerate(rows, 1):
        r["rank"] = i
    items = rows[:max(1, top)]
    unmatched = global_report.get("unmatched") or []
    watched = len(rows) + sum(1 for u in unmatched if str(u.get("cat")) == "lux")
    doc = base_doc("lux", global_report, ("usdKrw", "jpyKrw"))
    doc["scan"] = {
        "watched": watched, "matched": len(rows),
        "positive": sum(1 for r in rows if r["margin"] > 0),
        "shown": len(items), "best": rows[0]["margin"] if rows else 0,
    }
    doc["items"] = items
    return doc


# ---------------------------------------------------------------------------
# 3) 기념카드 — 포켓몬·원피스·유희왕
# ---------------------------------------------------------------------------
POKEMON_ZH = {
    "リザードンex": "喷火龙ex", "ミュウex": "梦幻ex", "フシギバナex": "妙蛙花ex",
    "カメックスex": "水箭龟ex", "サーナイトex": "沙奈朵ex", "ゲッコウガex": "甲贺忍蛙ex",
    "ブラッキーex": "月亮伊布ex", "リーフィアex": "叶伊布ex", "イーブイex": "伊布ex",
    "テラパゴスex": "太乐巴戈斯ex", "シロナのガブリアスex": "竹兰的烈咬陆鲨ex",
    "リーフィアVSTAR": "叶伊布VSTAR", "メガカイリューex": "超级快龙ex",
    "メガラティアスex": "超级拉帝亚斯ex", "ピカチュウex": "皮卡丘ex",
}


def pick_card_row(it: dict, rank: int) -> dict | None:
    try:
        jp = float(it["jp_price_jpy"])
        kr = int(it["kr_price_krw"])
        margin = int(it["net_margin_krw"])
        sell = int(it.get("sell_price_krw") or 0)
    except (KeyError, TypeError, ValueError):
        return None
    if jp <= 0 or kr <= 0 or sell <= 0:
        return None
    # 이상치(허수 매물)로 표시된 항목은 화면으로 내보내지 않는다(스캐너 필터의 이중 안전장치).
    if it.get("spike"):
        return None
    fee_krw = float(it.get("sell_fee_krw") or 0)
    fee_pct = round(fee_krw / sell * 100, 2) if sell else 0.0
    intl = int(it.get("intl_shipping_krw") or 0)
    shipout = int(it.get("domestic_shipping_krw") or 0)
    fixed = int(it.get("inspection_fee_krw") or 0)
    card_fee = int(it.get("card_fee_krw") or 0)
    game = str(it.get("game") or "pokemon")
    return {
        "rank": rank, "id": str(it.get("id") or ""), "game": game,
        "gameKo": str(it.get("gameKo") or game), "gameEn": str(it.get("gameEn") or game),
        "code": str(it.get("krCode") or ""), "setKo": str(it.get("setKo") or ""),
        "cardNo": str(it.get("cardNo") or ""), "rarity": str(it.get("rarity") or ""),
        "nameKo": str(it.get("koName") or it.get("enName") or ""),
        "nameEn": str(it.get("enName") or it.get("koName") or ""),
        "nameJp": str(it.get("jpName") or ""),
        "nameZh": POKEMON_ZH.get(str(it.get("jpName") or ""), ""),
        "lang": "ja",
        "jp": int(round(jp)), "jpCond": str(it.get("jp_condition") or ""),
        "jpStock": int(it.get("jp_stock") or 0), "jpUrl": str(it.get("jp_url") or ""),
        "kr": kr, "krAsOf": str(it.get("kr_as_of") or ""), "krUrl": str(it.get("kr_url") or ""),
        "invested": int(it.get("invested_krw") or 0),
        "customs": int(it.get("customs_total_krw") or 0),
        "ict": int(it.get("customs_individual_tax_krw") or 0),
        "shipping": intl + shipout, "intl": intl, "sell": sell, "margin": margin,
        "roi": round(float(it.get("roi_pct") or 0.0), 1),
        "bep": int(it["bep_jpy"]) if it.get("bep_jpy") is not None else None,
        "bepGap": it.get("bep_gap_pct"),
        "extreme": bool(it.get("extreme")),
        "fill": {
            "cur": "JPY", "price": round(jp, 2), "fx": round(float(it.get("fx_rate") or 0), 4),
            "local": 0, "intl": intl, "forward": 0, "cat": "card",
            "duty": round(float(it.get("customs_duty_rate_pct") or 0), 1), "business": False,
            "sell": sell, "fee": fee_pct, "fixed": fixed, "shipout": shipout,
            "other": card_fee,
        },
    }


def build_cards_doc(report: dict, top: int) -> dict:
    rows = []
    spike_ids = {str(s.get("id")) for s in (report.get("spikes") or []) if s.get("id")}
    for it in (report.get("items") or []):
        if str(it.get("id")) in spike_ids:
            continue
        r = pick_card_row(it, 0)
        if r:
            rows.append(r)
    rows.sort(key=lambda r: (r["margin"], r["roi"]), reverse=True)
    for i, r in enumerate(rows, 1):
        r["rank"] = i
    items = rows[:max(1, top)]
    counts = report.get("counts") or {}
    basis = report.get("basis") or {}
    doc = base_doc("cards", report, ("jpyKrw", "usdKrw"))
    doc["basis"] = {
        "rule": str(basis.get("rule") or ""),
        "krPriceKind": str((basis.get("kr_source") or {}).get("price_kind") or ""),
        "sellDiscountPct": float(basis.get("sell_discount_pct") or 0),
        "channel": str(basis.get("channel_label") or ""),
        "feePct": float(basis.get("fee_pct") or 0),
        "fixedKrw": int(basis.get("fixed_fee_krw") or 0),
        "shipoutKrw": int(basis.get("shipout_krw") or 0),
        "dutyPct": float(basis.get("duty_rate_pct") or 0),
        "deMinimisUsd": float(basis.get("de_minimis_usd") or 150),
        "warnings": [str(w) for w in (basis.get("warnings") or [])],
    }
    doc["scan"] = {
        "cards": int(counts.get("cards") or 0), "resolved": int(counts.get("resolved") or 0),
        "positive": sum(1 for r in rows if r["margin"] > 0), "shown": len(items),
        "best": rows[0]["margin"] if rows else 0,
        "buyable": int(counts.get("buyable_at_retail") or 0),
        "spikes": len(spike_ids),
    }
    doc["games"] = sorted(
        [{"key": g, "count": sum(1 for r in rows if r["game"] == g)}
         for g in {r["game"] for r in rows}], key=lambda x: -x["count"])
    doc["items"] = items
    return doc


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------
def sync_one(kind: str, doc: dict, out: str, args, label: str,
             targets: tuple[str, ...] = ("", "en", "zh", "ja")) -> int:
    if not doc["items"]:
        print(f"[{label}] 옮길 항목이 없습니다(리포트 items 비어 있음). 이전 파일을 그대로 둡니다.")
        return 3
    age = age_hours(doc["generatedAt"])
    if age is not None and args.max_age_hours and age > args.max_age_hours:
        print(f"[{label}] 주의: 리포트가 {age:.1f}시간 전 것입니다({doc['generatedAt']}). 그대로 옮깁니다.")
    scan = doc.get("scan") or {}
    print(f"[{label}] {doc['date']} · 기준 {doc['generatedAt']}")
    print(f"  감시 {scan.get('watched') or scan.get('cards')} · 매칭 {scan.get('matched') or scan.get('resolved')}"
          f" · 순마진 플러스 {scan.get('positive')} · 화면 표시 {scan.get('shown')}")
    for r in doc["items"][:8]:
        name = r.get("nameKo") or ""
        print(f"  {r['rank']}. {name[:34]} · 순마진 {r['margin']:+,}원 (ROI {r['roi']:+.1f}%)")
    if args.check:
        print(f"[{label}] --check: 파일을 쓰지 않았습니다.")
        return 0
    for rel in write_doc(doc, out, targets):
        print(f"  · {rel}")
    return 0


def main() -> int:
    ap = argparse.ArgumentParser(description="리셀 스캐너 결과를 웹진 3개 섹션 데이터로 옮깁니다.")
    ap.add_argument("--report", default=DEFAULT_REPORT, help="스니커즈 리포트(기본 latest.json)")
    ap.add_argument("--global-report", default=DEFAULT_GLOBAL_REPORT,
                    help="직구 품목·명품 리포트(기본 global-latest.json)")
    ap.add_argument("--cards-report", default=DEFAULT_CARDS_REPORT, help="카드 리포트(기본 cards-latest.json)")
    ap.add_argument("--goods-top", type=int, default=60, help="상품 섹션에 올릴 개수")
    ap.add_argument("--lux-top", type=int, default=50, help="명품 섹션에 올릴 개수")
    ap.add_argument("--cards-top", type=int, default=50, help="기념카드 섹션에 올릴 개수")
    ap.add_argument("--only", default="", help="goods,lux,cards 중 골라서")
    ap.add_argument("--check", action="store_true", help="파일을 쓰지 않고 결과만 확인")
    ap.add_argument("--max-age-hours", type=float, default=36.0, help="이보다 오래된 리포트면 경고")
    # 일본판(ja)·영문판(en) 기념카드 — 일본 현지 시세로 만든 리포트(ja_scanner / us_cards_scanner).
    ap.add_argument("--ja-goods-report", default=DEFAULT_JA_GOODS, help="일본판 상품 리포트")
    ap.add_argument("--ja-lux-report", default=DEFAULT_JA_LUX, help="일본판 명품 리포트")
    ap.add_argument("--ja-cards-report", default=DEFAULT_JA_CARDS, help="일본판 기념카드 리포트")
    ap.add_argument("--us-cards-report", default=DEFAULT_US_CARDS, help="영문판 기념카드 리포트")
    ap.add_argument("--no-lang", default="", help="ja·en 사본을 만들지 않는다(쉼표)")
    # 예전 워크플로(resell-sync.yml)가 넘기던 인자 — 이제 쓰지 않지만 실행이 깨지지 않게 받아 둔다.
    ap.add_argument("--pokemon-report", default="", help=argparse.SUPPRESS)
    ap.add_argument("--top", type=int, default=0, help=argparse.SUPPRESS)
    ap.add_argument("--pokemon-top", type=int, default=0, help=argparse.SUPPRESS)
    args = ap.parse_args()

    want = {x.strip() for x in args.only.split(",") if x.strip()} or {"goods", "lux", "cards"}
    codes: list[int] = []

    skip_lang = {x.strip() for x in args.no_lang.split(",") if x.strip()}
    # 일본판·영문판 카드 리포트가 있으면 그 언어 사본은 그쪽이 대신한다(한국 사본을 덮어쓰지 않게).
    ja_docs: dict[str, dict] = {}
    for kind, path in (("goods", args.ja_goods_report), ("lux", args.ja_lux_report),
                       ("cards", args.ja_cards_report)):
        if os.path.exists(path):
            d = load(path)
            if d.get("items"):
                ja_docs[kind] = d
            else:
                print(f"[ja:{kind}] 리포트에 아이템이 없습니다: {path}")
    us_cards = load(args.us_cards_report) if os.path.exists(args.us_cards_report) else None
    if us_cards and not us_cards.get("items"):
        us_cards = None

    def ko_targets(kind: str) -> tuple[str, ...]:
        t = [""]
        if "zh" not in skip_lang:
            t.append("zh")
        if "en" not in skip_lang and not (kind == "cards" and us_cards):
            t.append("en")
        if "ja" not in skip_lang and kind not in ja_docs:
            t.append("ja")
        return tuple(t)

    if "goods" in want or "lux" in want:
        if not os.path.exists(args.global_report):
            print(f"[global] 리포트가 없습니다: {args.global_report} — 상품·명품 섹션은 이전 데이터를 그대로 둡니다.")
            codes.append(0)
        else:
            g = load(args.global_report)
            sneaker = load(args.report) if os.path.exists(args.report) else None
            if "goods" in want:
                codes.append(sync_one("goods", build_goods_doc(g, sneaker, args.goods_top), GOODS_OUT,
                                      args, "goods", ko_targets("goods")))
            if "lux" in want:
                codes.append(sync_one("lux", build_lux_doc(g, args.lux_top), LUX_OUT,
                                      args, "lux", ko_targets("lux")))

    if "cards" in want:
        if not os.path.exists(args.cards_report) and args.pokemon_report and os.path.exists(args.pokemon_report):
            args.cards_report = args.pokemon_report        # 예전 워크플로 호환(카드 리포트 이름만 달랐다)
        if not os.path.exists(args.cards_report):
            print(f"[cards] 리포트가 없습니다: {args.cards_report} — 카드 섹션은 이전 데이터를 그대로 둡니다.")
            codes.append(0)
        else:
            c = load(args.cards_report)
            codes.append(sync_one("cards", build_cards_doc(c, args.cards_top), CARDS_OUT,
                                  args, "cards", ko_targets("cards")))

    # 일본판(ja) — ja_scanner 가 만든 리포트를 그 폴더 사본으로.
    for kind, out in (("goods", GOODS_OUT), ("lux", LUX_OUT), ("cards", CARDS_OUT)):
        d = ja_docs.get(kind)
        if not d or kind not in want:
            continue
        doc = dict(d)
        doc["syncedAt"] = datetime.now(KST).isoformat(timespec="seconds")
        codes.append(sync_one(f"ja:{kind}", doc, out, args, f"ja:{kind}", ("ja",)))

    # 영문판(en) 기념카드 — 미국 시장가 리포트를 en/data/cards-picks.json 으로.
    if us_cards and "cards" in want:
        doc = dict(us_cards)
        doc["syncedAt"] = datetime.now(KST).isoformat(timespec="seconds")
        codes.append(sync_one("en:cards", doc, CARDS_OUT, args, "en:cards", ("en",)))

    for code in codes:
        if code not in (0, 3):
            return code
    return 0


if __name__ == "__main__":
    sys.exit(main())
