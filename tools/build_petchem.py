#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
1) 국내 석유화학 제품 계통도 섹션   data/petchem.json      → <!-- PC-FLOW:START --> ~ <!-- PC-FLOW:END -->
2) 석유화학 원단위(Unit Consumption) data/petrochem-ref.json → <!-- UC-TABLE:START --> ~ <!-- UC-TABLE:END -->

둘 다 정적 HTML 로 넣습니다. 스크립트나 JSON 요청이 실패해도 화면·검색 로봇에 그대로 보이고,
글씨가 흐려지거나 깨지지 않게 하기 위해서입니다. 검색·필터는 assets/js/petrochem.js 가 맡습니다.
  python3 tools/build_petchem.py
"""
import json, os, sys, html

ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
DATA = os.path.join(ROOT, "data")
PAGE = os.path.join(ROOT, "market.html")

e = html.escape


def replace_block(page, start, end, body, label):
    if start not in page or end not in page:
        sys.exit("market.html 에 %s / %s 표지가 없습니다." % (start, end))
    head, rest = page.split(start, 1)
    _, tail = rest.split(end, 1)
    return head + start + "\n" + body + "\n" + end + tail


# ---------------------------------------------------------------- 계통도
def chip(node, extra_class=""):
    """품목 칩. 시세가 있는 품목(q)은 칩과 시세 배지 모두에 data-mk-code 를 붙여
    칩 어디를 눌러도 시황표의 그 품목 행으로 이동하게 합니다(app.js/flows.js 위임)."""
    k = node.get("k", "etc")
    q = node.get("q")
    label = node.get("ko") or node.get("n", "")
    parts = ['<span class="pc-chip k-%s%s"%s>' % (
        e(k), extra_class, ' data-mk-code="%s"' % e(q) if q else "")]
    parts.append('<span class="pc-chip-n">%s</span>' % e(node.get("n", "")))
    if node.get("ko"):
        parts.append('<span class="pc-chip-ko">%s</span>' % e(node["ko"]))
    if node.get("cap"):
        parts.append('<span class="pc-chip-cap">%s</span>' % e(str(node["cap"])))
    if q:
        parts.append(
            '<button type="button" class="pc-q" data-mk-code="%s" title="시황표에서 시세 보기 (코드 %s)"'
            ' aria-label="%s 시세 보기">시세</button>' % (e(q), e(q), e(label)))
    parts.append("</span>")
    return "".join(parts)


def stage(stage_nodes):
    if len(stage_nodes) == 1:
        return chip(stage_nodes[0])
    return '<span class="pc-fan">%s</span>' % "".join(chip(n) for n in stage_nodes)


def chain(stages):
    out = []
    for i, st in enumerate(stages):
        if i:
            out.append('<span class="pc-arrow" aria-hidden="true">→</span>')
        out.append(stage(st))
    return '<li class="pc-chain">%s</li>' % "".join(out)


def chains_html(chains):
    if not chains:
        return ""
    return '<ul class="pc-chains">%s</ul>' % "".join(chain(c) for c in chains)


def fraction_html(f):
    head = chip({"k": f.get("k", "base"), "n": f["n"], "ko": f.get("ko"), "cap": f.get("cap"), "q": f.get("q")},
                " pc-chip--base")
    return (
        '<div class="pc-fraction">'
        '<div class="pc-fx-head">%s</div>'
        '%s'
        '</div>'
    ) % (head, chains_html(f.get("chains") or []))


def origin_html(o):
    if o.get("fractions"):
        body = "".join(fraction_html(f) for f in o["fractions"])
    else:
        body = '<div class="pc-fraction pc-fraction--plain">%s</div>' % chains_html(o.get("chains") or [])
    note = '<p class="pc-origin-note">%s</p>' % e(o["note"]) if o.get("note") else ""
    return (
        '<article class="pc-origin">'
        '<header class="pc-origin-head">'
        '<span class="pc-origin-no">%s</span>'
        '<div class="pc-origin-t">'
        '<h3 class="pc-origin-name">%s <em>%s</em></h3>'
        '<p class="pc-origin-src">%s</p>'
        '</div>'
        '</header>'
        '<div class="pc-body">%s</div>'
        '%s'
        '</article>'
    ) % (e(o.get("no", "")), e(o["name"]), e(o.get("ko", "")), e(o.get("src", "")), body, note)


# 계통도 탭 구성: (파일, 탭 id, 탭 라벨, 패널 제목, 부제, 연결 표 안내)
FLOWS = [
    ("petchem.json", "petchem", "석유화학", "국내 석유화학 제품 계통도",
     "원유 정제(Refinery)에서 나온 납사가 납사분해설비(Naphtha Cracker)와 방향족 설비(BTX Plant)를 거쳐 "
     "기초유분 → 중간원료 → 합성수지·합성원료·합성고무로 이어지는 흐름을 설비별로 묶었습니다. ",
     '<span class="pc-q pc-q--demo">시세</span> 표시가 붙은 품목은 이 페이지 시황표에 가격이 있습니다. '
     '위 시황표의 <a href="#market-quotes">석유화학·중국 선물 표</a>에서 값을 확인하고, '
     '아래 <a href="#unit-consumption">원단위 표</a>에서 그 품목의 원료 투입량을 보세요.'),
    ("flow-steel.json", "steel", "철강·비철금속", None, None, None),
    ("flow-agri.json", "agri", "농산품·식품원료", None, None, None),
    ("flow-energy.json", "energy", "에너지·배터리·귀금속", None, None, None),
]


def panel_html(tab_id, title, sub, guide, d, hidden):
    legend = "".join(
        '<span class="pc-lg"><i class="k-%s"></i>%s</span>' % (e(l["k"]), e(l["label"]))
        for l in d.get("legend", [])
    )
    label_id = "fl-tab-" + tab_id
    return (
        '<div class="fl-panel" id="%s" role="tabpanel" aria-labelledby="%s" data-fl-panel="%s"%s>'
        '<div class="pc-head">'
        '<div class="pc-head-main">'
        '<span class="kicker">%s</span>'
        '<h3 class="pc-title fl-panel-title">%s</h3>'
        '<p class="pc-sub">%s<b>%s</b></p>'
        '</div>'
        '<div class="pc-head-side"><div class="pc-legend" aria-label="품목 구분 범례">%s</div></div>'
        '</div>'
        '<p class="pc-guide">%s</p>'
        '<div class="pc-grid">%s</div>'
        '<p class="pc-source">%s</p>'
        '</div>'
    ) % (
        e(tab_id), e(label_id), e(tab_id), " hidden" if hidden else "",
        e(d.get("kicker", "")), e(title), e(sub or ""), e(d.get("basis", "")),
        legend, guide, "".join(origin_html(o) for o in d.get("origins", [])), e(d.get("sourceNote", "")),
    )


def build_flow(page):
    tabs = []
    panels = []
    for i, (fname, tab_id, label, title, sub, guide) in enumerate(FLOWS):
        with open(os.path.join(DATA, fname), encoding="utf-8") as f:
            d = json.load(f)
        title = title or d.get("title", "")
        sub = sub if sub is not None else ""
        guide = guide if guide is not None else d.get("guide", "")
        sel = "true" if i == 0 else "false"
        on = " is-on" if i == 0 else ""
        tabs.append(
            '<button type="button" class="fl-tab%s" id="fl-tab-%s" role="tab" aria-selected="%s" '
            'aria-controls="%s" data-fl-tab="%s">%s</button>'
            % (on, e(tab_id), sel, e(tab_id), e(tab_id), e(label))
        )
        panels.append(panel_html(tab_id, title, sub, guide, d, i != 0))

    section = (
        '<section class="pc-section fl-section" id="industry-flow" aria-labelledby="fl-title">'
        '<div class="fl-head">'
        '<div class="fl-head-main">'
        '<span class="kicker">INDUSTRY FLOW</span>'
        '<h2 id="fl-title">산업 계통도</h2>'
        '<p class="fl-sub">원료에서 제품, 수요산업까지 네 계통을 탭으로 전환해 봅니다. '
        '<b>석유화학 · 철강·비철금속 · 농산품·식품원료 · 에너지·배터리·귀금속</b> '
        '각 계통의 공정 순서와 시세가 있는 품목을 한 화면에 정리했습니다.</p>'
        '</div>'
        '<div class="fl-head-side"><a class="mk-back" href="#market-quotes" data-mk-jump="mk-daily">시황표로 ↑</a></div>'
        '</div>'
        '<div class="fl-tabs" role="tablist" aria-label="계통도 선택">%s</div>'
        '<div class="fl-panels">%s</div>'
        '</section>'
    ) % ("".join(tabs), "".join(panels))
    return replace_block(page, "<!-- PC-FLOW:START -->", "<!-- PC-FLOW:END -->", section, "계통도")


# ---------------------------------------------------------------- 원단위
HOWTO = (
    '<div class="uc-howto">'
    '<section class="uc-how">'
    '<h3>원단위(Unit Consumption)란</h3>'
    '<p>제품 1톤을 만드는 데 드는 <b>원료의 양</b>을 톤으로 적은 값입니다. HDPE 1톤에는 에틸렌이 1.02~1.04톤, '
    'PP 1톤에는 프로필렌이 1.05~1.10톤 들어갑니다. 1보다 큰 이유는 반응 수율이 100%가 아니고 부산물·손실이 생기며, '
    '설비와 촉매 세대에 따라 효율이 다르기 때문입니다. <b>1.02~1.04</b>처럼 범위로 적힌 것은 공정 방식 차이입니다.</p>'
    '</section>'
    '<section class="uc-how">'
    '<h3>표 읽는 법 — 두 방향</h3>'
    '<ul>'
    '<li><b>원료</b> 칸: 그 품목 1톤을 만들 때 들어가는 원료와 양.</li>'
    '<li><b>제품</b> 칸: 그 품목이 다른 제품 1톤에 들어가는 양.</li>'
    '<li>예: Acetone을 찾으면 원료에 Cumene 2.27~2.35(쿠멘법), 제품에 BPA 0.28이 있습니다.</li>'
    '<li>합계가 1이 아닐 수 있습니다. 대체 경로(BD 직접 투입 / BR 경유)와 중간체(SAN)가 그 원료(SM)와 함께 적혀 있어 '
    '그대로 더하면 이중계산입니다. 원가 계산에는 한 경로만 골라 씁니다.</li>'
    '</ul>'
    '</section>'
    '<section class="uc-how">'
    '<h3>원가 계산 — 원료가 × 원단위</h3>'
    '<p><b>원료가(톤당) × 원단위 = 톤당 이론 원료비.</b> 여기에 유틸리티·인건비·감가상각과 마진이 붙고, '
    '부산물 판매 수익(예: 쿠멘법 페놀의 아세톤)은 따로 빼야 실제 원가에 가까워집니다.</p>'
    '<ul class="uc-calc">'
    '<li><span>PP</span> 프로필렌 1,088.25달러 × 1.05~1.10 = <b>1,143~1,197달러/톤</b></li>'
    '<li><span>HDPE</span> 에틸렌 1,039.08달러 × 1.02~1.04 = <b>1,060~1,081달러/톤</b></li>'
    '<li class="uc-calc-src">원료가는 KCIA·CFR 동북아 2026년 3분기 평균(지표누리). 운임·환율·등급 차이는 빠져 있습니다.</li>'
    '</ul>'
    '</section>'
    '</div>'
)


def card_html(prod, idx):
    tags = " ".join(prod.get("tags") or [])
    keys = [prod["name"], prod.get("ko", "")]
    keys += [x["name"] for x in prod["inputs"]]
    keys += [x["name"] for x in prod["outputs"]]
    search = " ".join(k.lower() for k in keys if k)

    def rows(items, empty_text):
        if not items:
            return '<p class="uc-none">%s</p>' % e(empty_text)
        return '<ul class="uc-rows">%s</ul>' % "".join(
            '<li><span class="uc-mat">%s</span><b class="uc-val">%s</b></li>' % (e(x["name"]), e(x["v"]))
            for x in items
        )

    note = '<p class="uc-note">%s</p>' % e(prod["note"]) if prod.get("note") else ""
    counts = []
    if prod["inputs"]:
        counts.append("원료 %d" % len(prod["inputs"]))
    if prod["outputs"]:
        counts.append("제품 %d" % len(prod["outputs"]))
    return (
        '<article class="uc-card" id="uc-%s" data-tags="%s" data-search="%s">'
        '<header class="uc-card-head">'
        '<h3 class="uc-card-name">%s <em>%s</em></h3>'
        '<span class="uc-card-count">%s</span>'
        '</header>'
        '<div class="uc-cols">'
        '<section class="uc-col"><h4>원료 <span>1톤 생산에 투입</span></h4>%s</section>'
        '<section class="uc-col"><h4>제품 <span>이 품목이 들어가는 곳</span></h4>%s</section>'
        '</div>%s</article>'
    ) % (
        e(str(idx)), e(tags), e(search),
        e(prod["name"]), e(prod.get("ko", "")),
        " · ".join(counts) or "—",
        rows(prod["inputs"], "이 표에 원료 정보가 없습니다."),
        rows(prod["outputs"], "이 표에 쓰임 정보가 없습니다."),
        note,
    )


def build_units(page):
    with open(os.path.join(DATA, "petrochem-ref.json"), encoding="utf-8") as f:
        d = json.load(f)
    prods = d["products"]
    filters = d.get("filters") or [{"id": "all", "label": "전체"}]

    chips = "".join(
        '<button type="button" class="uc-chip%s" data-uc-filter="%s"%s>%s%s</button>' % (
            " is-on" if f["id"] == "all" else "",
            e(f["id"]),
            ' title="%s"' % e(f["note"]) if f.get("note") else "",
            e(f["label"]),
            '<i class="uc-chip-sup">%s</i>' % e(f["note"]) if f.get("note") else "",
        )
        for f in filters
    )

    cards = "".join(card_html(p, i) for i, p in enumerate(prods))

    section = (
        '<section class="uc-section" id="unit-consumption" aria-labelledby="uc-title">'
        '<div class="uc-head">'
        '<div class="uc-head-main">'
        '<span class="kicker">UNIT CONSUMPTION</span>'
        '<h2 id="uc-title">석유화학 원단위 · 원가 보는 법</h2>'
        '<p class="uc-sub">제품 1톤을 만드는 데 드는 원료의 양(톤)입니다. '
        '원료가 × 원단위로 이론 원료비를 추정하고, 계통도에서 어느 설비를 거치는지 확인합니다. '
        '<b>%d개 품목 · 원단위 %d행</b></p>'
        '</div>'
        '<a class="mk-back" href="#market-quotes" data-mk-jump="mk-daily">시황표로 ↑</a>'
        '</div>'
        '%s'
        '<div class="uc-tools">'
        '<label class="uc-search">'
        '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="1.7"></circle><path d="m20 20-3.6-3.6" fill="none" stroke="currentColor" stroke-width="1.7"></path></svg>'
        '<input type="search" id="uc-q" placeholder="품목·원료 검색 (예: ABS, 프로필렌, 0.27)" aria-label="원단위 품목·원료 검색" autocomplete="off">'
        '<button type="button" class="uc-clear" id="uc-clear" hidden aria-label="검색어 지우기">✕</button>'
        '</label>'
        '<div class="uc-filters" role="group" aria-label="주요 합성수지 빠른 필터">%s</div>'
        '<p class="uc-status" id="uc-status" role="status" aria-live="polite">전체 %d개 품목</p>'
        '</div>'
        '<div class="uc-list" id="uc-list">%s</div>'
        '<p class="uc-empty" id="uc-empty" hidden>조건에 맞는 품목이 없습니다. 품목명·원료명을 짧게 입력해 보세요.</p>'
        '<p class="uc-source">%s %s</p>'
        '</section>'
    ) % (
        len(prods), sum(len(p["inputs"]) + len(p["outputs"]) for p in prods),
        HOWTO, chips, len(prods), cards,
        e(d.get("source", "")), e(d.get("unitNote", "")),
    )
    return replace_block(page, "<!-- UC-TABLE:START -->", "<!-- UC-TABLE:END -->", section, "원단위")


def main():
    with open(PAGE, encoding="utf-8") as f:
        page = f.read()
    page = build_flow(page)
    page = build_units(page)
    with open(PAGE, "w", encoding="utf-8") as f:
        f.write(page)
    print("계통도·원단위 섹션 생성 완료 (market.html %.0fKB)" % (len(page) / 1024))


if __name__ == "__main__":
    main()
