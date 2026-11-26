#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""sync_market_series_locales.py — data/market-series.json 을 en·zh·ja 사본에 반영합니다.

  python3 tools/sync_market_series_locales.py            # 반영(바뀐 파일만)
  python3 tools/sync_market_series_locales.py --check    # 쓰지 않고 확인만

왜 필요한가
  · en·zh·ja 페이지는 자기 폴더의 data/market-series.{lang}.json 을 읽습니다.
    시계열만 새로 받고 사본을 갱신하지 않으면 그 언어의 그래프는 옛 값에 멈춥니다.
  · i18n_data.build_market() 은 번역 사전까지 함께 돌리므로 CI에서 무겁습니다.
    여기서는 숫자·날짜만 옮기고, 이미 번역해 둔 name·sourceName·note 문자열은 그대로 둡니다.
  · 값을 새로 만들지 않습니다. 원본에 있는 종목·점만 옮깁니다.
"""
from __future__ import annotations

import argparse
import json
import os
import sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
DATA = os.path.join(ROOT, "data")
LANGS = ("en", "zh", "ja")
KEEP_TEXT = ("name", "sourceName", "note", "unit")


def load(path: str):
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def dump(path: str, doc: dict) -> None:
    tmp = f"{path}.tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(doc, f, ensure_ascii=False, separators=(",", ":"))
        f.write("\n")
    os.replace(tmp, path)


def keep_text(new: dict, prev: dict) -> dict:
    """번역해 둔 문자열(name·sourceName·note·unit)은 남기고 나머지는 원본 값을 씁니다."""
    if not isinstance(prev, dict):
        return new
    for key in KEEP_TEXT:
        val = prev.get(key)
        if isinstance(val, str) and val.strip() and val != (new.get(key) or ""):
            new[key] = val
    return new


def merge(src: dict, old: dict) -> dict:
    old = old or {}
    out = {k: v for k, v in src.items() if k != "series"}
    if isinstance(old.get("note"), str) and old["note"].strip():
        out["note"] = old["note"]          # 상단 설명문은 이미 번역된 것을 유지
    old_series = old.get("series") or {}
    series = {}
    for code, entry in (src.get("series") or {}).items():
        series[code] = keep_text(dict(entry), old_series.get(code) or {})
    out["series"] = series
    return out


def main() -> int:
    ap = argparse.ArgumentParser(description="market-series 현지화 사본 갱신")
    ap.add_argument("--check", action="store_true", help="파일을 쓰지 않고 확인만")
    args = ap.parse_args()

    src_path = os.path.join(DATA, "market-series.json")
    if not os.path.exists(src_path):
        print("[series-locale] data/market-series.json 이 없습니다.")
        return 2
    src = load(src_path)
    if not (src.get("series") or {}):
        print("[series-locale] series 가 비어 있습니다. 사본을 건드리지 않습니다.")
        return 3

    changed = []
    for lang in LANGS:
        path = os.path.join(ROOT, lang, "data", "market-series.json")
        os.makedirs(os.path.dirname(path), exist_ok=True)
        old = load(path) if os.path.exists(path) else {}
        doc = merge(src, old)
        text_new = json.dumps(doc, ensure_ascii=False, separators=(",", ":"), sort_keys=True)
        text_old = json.dumps(old, ensure_ascii=False, separators=(",", ":"), sort_keys=True) if old else ""
        if text_new == text_old:
            print(f"[series-locale] {lang}: 변경 없음")
            continue
        changed.append(lang)
        if not args.check:
            dump(path, doc)
        print(f"[series-locale] {lang}: 갱신 ({len(doc['series'])}종목)")
    print(f"[series-locale] 갱신 {len(changed)}개 언어: {', '.join(changed) or '-'}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
