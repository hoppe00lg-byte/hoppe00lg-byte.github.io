#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""add_resell_promo.py — resell.html 4개 언어판에 크몽 설치 상품 배너를 넣는다.

  상단: 히어로 바로 아래 (무료 체험 → 설치 의뢰 퍼널)
  하단: FAQ 뒤 (계산을 마친 사람에게 한 번 더)

  python3 work/webzine-site/_add_resell_promo.py
"""
from __future__ import annotations

import os

HERE = os.path.dirname(os.path.abspath(__file__))
GIG = "https://kmong.com/gig/881939"

TOP = {
    "ko": dict(
        aria="내 품목 전용 마진 스캐너 설치 의뢰",
        kicker="SCANNER SETUP · 100~300종 확장",
        title="이 화면을 내 취급 품목으로 돌리고 싶다면",
        desc=("여기 54개 품목은 맛보기입니다. 내가 파는 품목 100~300종을 등록해, 내 PC에서 2시간마다 "
              "자동으로 시세를 다시 읽고 리포트와 엑셀 표로 남기는 설치 패키지를 크몽에서 진행합니다. "
              "윈도우·맥 원클릭 실행과 설치 동행까지 포함됩니다."),
        cta="내 품목 전용 스캐너 설치 보기",
        ghost="오늘 스캔 결과 먼저 보기",
        note="설치 패키지 39,000원~ · 원격 설치 동행 99,000원~ · 크몽에서 진행",
    ),
    "en": dict(
        aria="Request a margin scanner for my own product list",
        kicker="SCANNER SETUP · 100–300 ITEMS",
        title="Run this screen on your own product list",
        desc=("The 54 items here are a demo. The install package registers 100–300 of your own items, "
              "rescans prices every two hours on your PC, and leaves a report and an Excel-ready table. "
              "One-click run on Windows and Mac, with guided setup included."),
        cta="See the scanner install on Kmong",
        ghost="Look at today's scan first",
        note="Install package from ₩39,000 · guided setup from ₩99,000 · arranged on Kmong",
    ),
    "zh": dict(
        aria="定制本人品类的利润扫描器",
        kicker="SCANNER SETUP · 100~300 项",
        title="把这套界面换成我自己的商品清单",
        desc=("这里的 54 个品项只是试用。安装版可登记你自己的 100~300 个品项，在你的电脑上每 2 小时自动"
              "重新读取价格，并留下报告和可直接用 Excel 打开的表。含 Windows、Mac 一键运行与安装协助。"),
        cta="在 Kmong 查看扫描器安装",
        ghost="先看今天的扫描结果",
        note="安装包 39,000 韩元起 · 远程安装陪同 99,000 韩元起 · 通过 Kmong 进行",
    ),
    "ja": dict(
        aria="自分の取扱商品向けマージンスキャナーの依頼",
        kicker="SCANNER SETUP · 100〜300品目",
        title="この画面を自分の取扱商品で動かす",
        desc=("ここにある54品目はお試しです。自分の商品100〜300品目を登録し、PCで2時間ごとに自動で価格を"
              "読み直してレポートとExcel用の表に残すインストール版です。Windows・Macのワンクリック実行と"
              "インストール同行まで含みます。"),
        cta="Kmongでスキャナー導入を見る",
        ghost="今日のスキャン結果を先に見る",
        note="インストール版 39,000ウォン〜 · 遠隔インストール同行 99,000ウォン〜 · Kmongで相談",
    ),
}

BOTTOM = {
    "ko": dict(
        aria="취급 품목 자동화 설치 안내",
        kicker="FROM DEMO TO MY LIST",
        title="여기서 계산한 품목이 100개를 넘는다면",
        desc=("같은 계산을 손으로 반복하지 않도록, 취급 품목을 등록해 자동으로 갱신되는 설치형 스캐너를 "
              "만들어 드립니다. 배대지 요율·플랫폼 수수료 반영, 2시간 주기 자동 갱신과 알림까지."),
        cta="스캐너 설치 · 크몽에서 보기",
        ghost="",
        note="설치 패키지 39,000원~ · 프리미엄은 1개월 유지보수 포함",
    ),
    "en": dict(
        aria="Automation for your own product list",
        kicker="FROM DEMO TO MY LIST",
        title="More than a hundred items to check?",
        desc=("Stop repeating the same arithmetic by hand. The install registers your items, keeps the "
              "forwarding rates and platform fees in the formula, rescans every two hours and can send a summary."),
        cta="Scanner install on Kmong",
        ghost="",
        note="Install package from ₩39,000 · Premium includes one month of upkeep",
    ),
    "zh": dict(
        aria="本人品类的自动化安装说明",
        kicker="FROM DEMO TO MY LIST",
        title="如果这里的品类超过一百个",
        desc=("别再手工重复同样的计算。安装版会登记你的品项，把转运费率和平台手续费放进公式，"
              "每 2 小时自动重新采集，并可发送摘要。"),
        cta="在 Kmong 查看扫描器安装",
        ghost="",
        note="安装包 39,000 韩元起 · 高级版含 1 个月维护",
    ),
    "ja": dict(
        aria="取扱商品の自動化インストール案内",
        kicker="FROM DEMO TO MY LIST",
        title="ここで計算する品目が100を超えるなら",
        desc=("同じ計算を手で繰り返さないために。インストール版は自分の品目を登録し、転送料率と"
              "プラットフォーム手数料を式に反映して、2時間ごとに自動で読み直し、要約も送れます。"),
        cta="Kmongでスキャナー導入を見る",
        ghost="",
        note="インストール版 39,000ウォン〜 · プレミアムは1か月の保守付き",
    ),
}


def promo(c: dict, cls: str = "ib-promo ib-promo--b2b", indent: str = "    ") -> str:
    acts = f'<a class="ib-promo-cta" href="{GIG}" target="_blank" rel="noopener noreferrer">{c["cta"]}</a>'
    if c.get("ghost"):
        acts += (f'<a class="ib-promo-cta ib-promo-cta--ghost" href="#rs-picks">{c["ghost"]}</a>')
    return (
        f'{indent}<aside class="{cls}" aria-label="{c["aria"]}">\n'
        f'{indent}  <span class="ib-promo-kicker">{c["kicker"]}</span>\n'
        f'{indent}  <h3 class="ib-promo-title">{c["title"]}</h3>\n'
        f'{indent}  <p class="ib-promo-desc">{c["desc"]}</p>\n'
        f'{indent}  <span class="ib-promo-acts">{acts}</span>\n'
        f'{indent}  <span class="ib-promo-note">{c["note"]}</span>\n'
        f'{indent}</aside>\n'
    )


FILES = {"ko": "resell.html", "en": "en/resell.html", "zh": "zh/resell.html", "ja": "ja/resell.html"}
MARK_T = "<!-- IB:RESELL-PROMO-TOP -->"
MARK_B = "<!-- IB:RESELL-PROMO-BOTTOM -->"


def main() -> int:
    for lang, rel in FILES.items():
        path = os.path.join(HERE, rel)
        with open(path, encoding="utf-8") as f:
            html = f.read()
        if MARK_T in html:
            print(f"{rel}: 이미 있음 — 건너뜀")
            continue
        # 상단: 히어로 아래
        anchor_top = "    <!-- IB:RESELL-PICKS "
        assert anchor_top in html, rel
        html = html.replace(anchor_top, promo(TOP[lang]) + f"\n    {MARK_T}\n" + anchor_top, 1)
        # 하단: FAQ 뒤
        anchor_bot = '    <p class="rs-xlink">'
        assert anchor_bot in html, rel
        html = html.replace(anchor_bot, promo(BOTTOM[lang]) + f"\n    {MARK_B}\n" + anchor_bot, 1)
        with open(path, "w", encoding="utf-8") as f:
            f.write(html)
        print(f"{rel}: 배너 2개 삽입 완료")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
