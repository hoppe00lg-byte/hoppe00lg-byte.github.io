#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""다국어(한·영·중·일) 파이프라인 한 번에 돌리기.

  python3 tools/i18n_build.py            # 사전 → 데이터 → 페이지
  python3 tools/i18n_build.py --no-mt    # 캐시된 번역만 사용(네트워크 없이)
  python3 tools/i18n_build.py --lang en  # 한 언어만

tools/build.py 가 기사 발행 뒤 자동으로 부릅니다. 그래서 매일 새 기사가
한국어와 함께 영어·중국어·일본어 페이지로도 올라갑니다.
번역은 tools/i18n_cache.json 에 쌓여, 이미 번역한 문장은 다시 번역하지 않습니다.
"""
import argparse, os, sys, traceback

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import i18n_core as C
import i18n_dict
import i18n_data
import i18n_pages


def run(langs=None, no_mt=False, korean=True, quiet=False):
    if no_mt:
        os.environ["IB_MT"] = "off"
    langs = langs or list(C.LANGS)
    report = {"dict": {}, "articles": {}, "pages": 0, "errors": []}
    try:
        report["dict"] = i18n_dict.build(langs, no_mt=no_mt)
    except Exception as e:
        report["errors"].append(f"사전 생성 실패: {e}")
        if not quiet:
            traceback.print_exc()
    try:
        report["articles"] = i18n_data.build(langs, no_mt=no_mt)
    except Exception as e:
        report["errors"].append(f"데이터 번역 실패: {e}")
        if not quiet:
            traceback.print_exc()
    try:
        report["pages"] = i18n_pages.build(langs, korean=korean)
    except Exception as e:
        report["errors"].append(f"다국어 페이지 생성 실패: {e}")
        if not quiet:
            traceback.print_exc()
    if not quiet:
        for lang in langs:
            print(f"  {lang}: 사전 {report['dict'].get(lang, 0)}개 · 기사 {report['articles'].get(lang, 0)}편")
        for e in report["errors"]:
            print("  ! " + e)
    return report


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--lang", action="append", default=None)
    ap.add_argument("--no-mt", action="store_true")
    ap.add_argument("--no-ko", action="store_true")
    args = ap.parse_args()
    r = run(args.lang, no_mt=args.no_mt, korean=not args.no_ko)
    sys.exit(1 if r["errors"] else 0)


if __name__ == "__main__":
    main()
