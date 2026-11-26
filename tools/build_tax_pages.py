#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""tax.html 의 국가별(미국·중국·일본) 버전을 만듭니다.

  python3 tools/build_tax_pages.py

  /en/tax.html  — US small business tax & bookkeeping (sales tax, FICA, 1120/Schedule C)
  /zh/tax.html  — 中国小微企业财税自查 (增值税, 企业所得税, 五险一金, 汇算清缴)
  /ja/tax.html  — 日本 青色申告・法人決算 (消費税, 法人税, 社会保険, 源泉徴収)

한국어 원본 tax.html 은 손으로 관리하고, 이 스크립트는 세 언어 페이지만 씁니다.
tools/i18n_pages.py 의 PAGE_FILES 에 tax.html 을 넣지 않았으므로 기계번역이
이 페이지들을 덮어쓰지 않습니다. (build.py 가 이 스크립트를 호출합니다.)
"""
import os
import re
import sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
BASE = "https://insightbriefnews.com"
LANGS = ["en", "zh", "ja"]

TEMPLATE = r"""<!DOCTYPE html>
<html lang="[[htmlLang]]">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="google-adsense-account" content="ca-pub-7853253075143438">
<title>[[title]]</title>
<meta name="description" content="[[desc]]">
<meta name="keywords" content="[[keywords]]">
<meta name="theme-color" content="#17140f">
<link rel="canonical" href="[[canonical]]">
<link rel="alternate" hreflang="ko" href="[[base]]/tax.html">
<link rel="alternate" hreflang="en" href="[[base]]/en/tax.html">
<link rel="alternate" hreflang="zh-Hans" href="[[base]]/zh/tax.html">
<link rel="alternate" hreflang="ja" href="[[base]]/ja/tax.html">
<link rel="alternate" hreflang="x-default" href="[[base]]/tax.html">
<meta property="og:type" content="website">
<meta property="og:site_name" content="INSIGHT BRIEF">
<meta property="og:locale" content="[[ogLocale]]">
<meta property="og:title" content="[[ogTitle]]">
<meta property="og:description" content="[[ogDesc]]">
<meta property="og:url" content="[[canonical]]">
<meta property="og:image" content="[[base]]/assets/img/og.png">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="[[ogTitle]]">
<meta name="twitter:description" content="[[ogDesc]]">
<meta name="twitter:image" content="[[base]]/assets/img/og.png">
<link rel="icon" href="../assets/img/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="../assets/css/i18n.css">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="[[fontLink]]">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css">
<link rel="stylesheet" href="../assets/css/style.css?v=20261123p">
<link rel="stylesheet" href="../assets/css/tax.css?v=20261124c">
<script type="application/ld+json">
[[ldjson]]
</script>
</head>
<body data-page="tax">

<header class="site-header">
  <div class="topbar">
    <div class="container">
      <div class="tb-left">
        <span class="live"><i></i>INDEPENDENT</span>
        <span class="tb-sep"></span>
        <span id="today-date">[[today]]</span>
      </div>
      <div class="tb-right">
        <div class="lang-switch" role="group" aria-label="Language"><a href="../tax.html" hreflang="ko" lang="ko">KO</a><a href="tax.html" hreflang="en" lang="en"[[onEn]]>EN</a><a href="../zh/tax.html" hreflang="zh-Hans" lang="zh-Hans"[[onZh]]>ZH</a><a href="../ja/tax.html" hreflang="ja" lang="ja"[[onJa]]>JA</a></div>
        <span class="opt">[[tagline]]</span>
        <span class="tb-sep opt"></span>
        <span>VOL. 01</span>
      </div>
    </div>
  </div>
  <div class="masthead">
    <div class="container">
      <div class="brand">
        <a href="../index.html" aria-label="INSIGHT BRIEF">
          <span class="mark" aria-hidden="true"></span>
          <span class="name">INSIGHT <em>BRIEF</em></span>
        </a>
        <div class="sub">
          <b>[[brandSub]]</b>
          <span class="bar" aria-hidden="true"></span>
          <span>[[slogan]]</span>
        </div>
      </div>
      <div class="mast-tools">
        <a class="btn btn-ghost btn-sm" href="../contact.html#tip">[[tip]]</a>
        <a class="btn btn-accent btn-sm" href="../index.html#subscribe">[[subscribe]]</a>
      </div>
    </div>
  </div>
</header>

<div class="nav-wrap">
  <div class="container">
    <ul class="nav" id="site-nav">
      <li><a href="../index.html">[[navAll]]</a></li>
      <li><a href="../index.html?cat=investigative">[[navInvest]]</a></li>
      <li><a href="../index.html?cat=economy">[[navEconomy]]</a></li>
      <li><a href="../index.html?cat=trade">[[navTrade]]</a></li>
      <li><a href="../market.html">[[navMarket]]</a></li>
      <li><a href="../index.html?cat=ai">[[navAI]]</a></li>
      <li><a href="../index.html?cat=fire">[[navFire]]</a></li>
      <li><a href="../lotto.html">[[navLotto]]</a></li>
      <li><a href="../saju.html">[[navSaju]]</a></li>
      <li><a href="../salary.html">[[navSalary]]</a></li>
      <li><a class="is-active" href="tax.html" aria-current="page">[[navTax]]</a></li>
      <li><a href="../biz.html">[[navBiz]]</a></li>
      <li><a href="../forms.html">[[navForms]]</a></li>
      <li><a href="../law.html">[[navLaw]]</a></li>
      <li><a href="../seller.html">[[navSeller]]</a></li>
      <li><a href="../experts.html">[[navExperts]]</a></li>
      <li><a class="nav-ad" href="../ad.html">[[navAd]]</a></li>
      <li><a class="nav-contact" href="../contact.html">[[navContact]]</a></li>
    </ul>
    <form class="search search-desktop" role="search" action="../index.html" method="get">
      <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="1.7"></circle><path d="m20 20-3.6-3.6" fill="none" stroke="currentColor" stroke-width="1.7"></path></svg>
      <input type="search" name="q" placeholder="[[searchPh]]" aria-label="[[searchAria]]" autocomplete="off">
    </form>
  </div>
</div>

<main id="main" class="tx-main">
  <div class="container tx-wrap">

    <div class="tx-head">
      <span class="kicker">[[kicker]]</span>
      <h1>[[h1]]</h1>
      <p class="dek">[[dek]]</p>
      <div class="tx-badges">
        <span>[[b1]]</span><span>[[b2]]</span><span>[[b3]]</span><span>[[b4]]</span>
      </div>
      <div class="tx-toolbar">
        <button class="btn btn-accent btn-sm" type="button" id="tx-sample">[[btnSample]]</button>
        <button class="btn btn-ghost btn-sm" type="button" id="tx-reset">[[btnReset]]</button>
        <button class="btn btn-ghost btn-sm" type="button" id="tx-export-all">[[btnAll]]</button>
        <span class="tx-save" id="tx-save">[[saveNote]]</span>
        <p class="tx-msg" id="tx-msg" role="status" aria-live="polite"></p>
      </div>
      <div class="tx-notice">
        <b>[[noticeTitle]]</b>
        <ul>
          <li>[[n1]]</li>
          <li>[[n2]]</li>
          <li>[[n3]]</li>
          <li>[[n4]]</li>
        </ul>
      </div>
    </div>

    <nav class="tx-jump" aria-label="Modules">
      <a href="#tx-dash"><b>01</b>[[j1]]</a>
      <a href="#tx-ledger"><b>02</b>[[j2]]</a>
      <a href="#tx-payroll"><b>03</b>[[j3]]</a>
      <a href="#tx-fx"><b>04</b>[[j4]]</a>
      <a href="#tx-close"><b>05</b>[[j5]]</a>
      <a href="#tx-export"><b>06</b>[[j6]]</a>
    </nav>

    <section class="tx-sec" id="tx-dash">
      <div class="tx-sec-head">
        <h2><span>01</span>[[dashTitle]]</h2>
        <span class="mono">[[dashSub]]</span>
      </div>
      <p class="tx-lead">[[dashLead]]</p>
      <div class="tx-actions" style="margin-top:0;margin-bottom:10px">
        <div class="tx-seg" id="tx-entity" role="group" aria-label="Entity">
          <button type="button" data-entity="corp" aria-pressed="true">[[entityCorp]]</button>
          <button type="button" data-entity="sole" aria-pressed="false">[[entitySole]]</button>
        </div>
        <div class="tx-field" style="min-width:150px">
          <select id="tx-fy" class="tx-select" aria-label="[[fyLabel]]">
            <option value="2026">[[fy2026]]</option>
            <option value="2025">[[fy2025]]</option>
            <option value="2027">[[fy2027]]</option>
          </select>
        </div>
        <span class="tx-chip mut" id="tx-entity-note">[[entityNote]]</span>
      </div>
      <div class="tx-kpis" id="tx-kpis">
        <div class="tx-kpi hi"><span class="k">[[kpiVat]]</span><span class="v tx-num" id="tx-kpi-vat">—</span><span class="d" id="tx-kpi-vat-d">—</span></div>
        <div class="tx-kpi"><span class="k">[[kpiMonth]]</span><span class="v tx-num" id="tx-kpi-month">—</span><span class="d" id="tx-kpi-month-d">—</span></div>
        <div class="tx-kpi"><span class="k">[[kpiYear]]</span><span class="v tx-num" id="tx-kpi-year">—</span><span class="d" id="tx-kpi-year-d">—</span></div>
        <div class="tx-kpi"><span class="k" id="tx-kpi-taxtitle">[[kpiTax]]</span><span class="v tx-num" id="tx-kpi-incometax">—</span><span class="d" id="tx-kpi-incometax-d">—</span></div>
      </div>
      <div class="tx-grid two" style="margin-top:12px">
        <div class="tx-panel">
          <div class="tx-panel-head"><h3>[[sumTitle]]</h3><span class="mono">TAX SUMMARY</span></div>
          <div class="tx-scroll"><table class="tx-table compact"><tbody id="tx-summary"></tbody></table></div>
        </div>
        <div class="tx-panel">
          <div class="tx-panel-head"><h3>[[basisTitle]]</h3><span class="mono">TAX BASIS</span></div>
          <div class="tx-scroll"><table class="tx-table compact"><tbody id="tx-basis"></tbody></table></div>
        </div>
      </div>
      <div class="tx-panel" style="margin-top:12px">
        <div class="tx-panel-head"><h3>[[checkTitle]]</h3><span class="mono">[[checkSub]]</span></div>
        <div class="tx-body">
          <p class="tx-hint" style="margin-bottom:10px">[[checkHint]]</p>
          <div class="tx-checks" id="tx-checks"></div>
        </div>
      </div>
    </section>

    <section class="tx-sec" id="tx-ledger">
      <div class="tx-sec-head">
        <h2><span>02</span>[[ledgerTitle]]</h2>
        <span class="mono">EVIDENCE &amp; BANK</span>
      </div>
      <p class="tx-lead">[[ledgerLead]]</p>
      <div class="tx-grid two">
        <div class="tx-panel">
          <div class="tx-panel-head"><h3>[[bankPanel]]</h3><span class="mono">BANK STATEMENT</span></div>
          <div class="tx-body">
            <p class="tx-hint">[[bankHint]]</p>
            <div class="tx-field">
              <label class="lbl" for="tx-bank-file">[[fileLabel]] <span class="hint">CSV</span></label>
              <input type="file" id="tx-bank-file" accept=".csv,.txt,text/csv" class="tx-input">
            </div>
            <div class="tx-actions">
              <button class="tx-btn-xs" type="button" id="tx-bm-toggle">[[addTx]]</button>
              <span class="tx-hint" id="tx-bank-msg" style="margin:0"></span>
            </div>
            <form id="tx-bm-form" hidden style="margin-top:10px">
              <div class="tx-grid three">
                <div class="tx-field"><label class="lbl" for="tx-bm-date">[[colDate]]</label><input type="date" id="tx-bm-date"></div>
                <div class="tx-field"><label class="lbl" for="tx-bm-in">[[colIn]]</label><div class="unit"><input type="number" id="tx-bm-in" min="0" step="0.01" placeholder="0"><span>[[cur]]</span></div></div>
                <div class="tx-field"><label class="lbl" for="tx-bm-out">[[colOut]]</label><div class="unit"><input type="number" id="tx-bm-out" min="0" step="0.01" placeholder="0"><span>[[cur]]</span></div></div>
              </div>
              <div class="tx-field" style="margin-top:8px"><label class="lbl" for="tx-bm-desc">[[colMemo]]</label><input type="text" id="tx-bm-desc" placeholder="[[memoPh]]"></div>
              <div class="tx-actions"><button class="btn btn-accent btn-sm" type="submit">[[btnAdd]]</button></div>
            </form>
          </div>
        </div>
        <div class="tx-panel">
          <div class="tx-panel-head"><h3>[[evPanel]]</h3><span class="mono">DOCUMENTS</span></div>
          <div class="tx-body">
            <p class="tx-hint">[[evHint]]</p>
            <div class="tx-field">
              <label class="lbl" for="tx-ev-type">[[evTypeLabel]]</label>
              <select id="tx-ev-type" class="tx-select">
                <option value="sales_invoice">[[evSales]]</option>
                <option value="purchase_invoice">[[evPurchase]]</option>
                <option value="card">[[evCard]]</option>
                <option value="cash">[[evCash]]</option>
              </select>
            </div>
            <div class="tx-field" style="margin-top:8px">
              <label class="lbl" for="tx-ev-file">[[fileLabel]] <span class="hint">CSV</span></label>
              <input type="file" id="tx-ev-file" accept=".csv,.txt,text/csv" class="tx-input">
            </div>
            <div class="tx-actions">
              <button class="tx-btn-xs" type="button" id="tx-em-toggle">[[addEv]]</button>
              <span class="tx-hint" id="tx-ev-msg" style="margin:0"></span>
            </div>
            <form id="tx-em-form" hidden style="margin-top:10px">
              <div class="tx-grid two">
                <div class="tx-field"><label class="lbl" for="tx-em-date">[[colDate]]</label><input type="date" id="tx-em-date"></div>
                <div class="tx-field"><label class="lbl" for="tx-em-type">[[colType]]</label>
                  <select id="tx-em-type" class="tx-select">
                    <option value="sales_invoice">[[evSales]]</option>
                    <option value="purchase_invoice">[[evPurchase]]</option>
                    <option value="card">[[evCard]]</option>
                    <option value="cash">[[evCash]]</option>
                  </select>
                </div>
              </div>
              <div class="tx-field" style="margin-top:8px"><label class="lbl" for="tx-em-partner">[[colPartner]]</label><input type="text" id="tx-em-partner" placeholder="[[partnerPh]]"></div>
              <div class="tx-grid two" style="margin-top:8px">
                <div class="tx-field"><label class="lbl" for="tx-em-supply">[[colNet]]</label><div class="unit"><input type="number" id="tx-em-supply" min="0" step="0.01" placeholder="0"><span>[[cur]]</span></div></div>
                <div class="tx-field"><label class="lbl" for="tx-em-vat">[[colTax]]</label><div class="unit"><input type="number" id="tx-em-vat" min="0" step="0.01" placeholder="0"><span>[[cur]]</span></div></div>
              </div>
              <label class="tx-hint" style="display:flex;gap:6px;align-items:center;margin-top:8px">
                <input type="checkbox" id="tx-em-zero" style="accent-color:var(--accent)"> [[zeroLabel]]
              </label>
              <div class="tx-actions"><button class="btn btn-accent btn-sm" type="submit">[[btnAdd]]</button></div>
            </form>
          </div>
        </div>
      </div>
      <div class="tx-actions">
        <button class="btn btn-accent btn-sm" type="button" id="tx-match">[[btnMatch]]</button>
        <button class="btn btn-ghost btn-sm" type="button" id="tx-suggest">[[btnSuggest]]</button>
        <span class="tx-hint" id="tx-match-msg" style="margin:0"></span>
      </div>
      <div class="tx-panel" style="margin-top:12px">
        <div class="tx-panel-head"><h3>[[bankLedgerTitle]] <span class="tx-chip mut" id="tx-bank-count">0</span></h3><span class="mono">BANK LEDGER</span></div>
        <div class="tx-scroll">
          <table class="tx-table">
            <thead><tr><th>[[colDate]]</th><th>[[colMemo]]</th><th>[[colIn]]</th><th>[[colOut]]</th><th>[[colAccount]]</th><th>[[colDocument]]</th><th>[[colJournal]]</th><th class="c">—</th></tr></thead>
            <tbody id="tx-bank-body"></tbody>
          </table>
        </div>
      </div>
      <div class="tx-panel tx-warn" id="tx-unmatched-panel" style="margin-top:12px">
        <div class="tx-panel-head"><h3>[[unmTitle]] <span class="tx-chip bad" id="tx-unm-count">0</span></h3><span class="mono">UNCLASSIFIED</span></div>
        <div class="tx-body">
          <p class="tx-hint">[[unmHint]]</p>
          <div class="tx-unm" id="tx-unm"></div>
        </div>
      </div>
      <div class="tx-panel" style="margin-top:12px">
        <div class="tx-panel-head"><h3>[[evListTitle]] <span class="tx-chip mut" id="tx-ev-count">0</span></h3><span class="mono">DOCUMENTS</span></div>
        <div class="tx-scroll">
          <table class="tx-table">
            <thead><tr><th>[[colDate]]</th><th>[[colType]]</th><th>[[colPartner]]</th><th>[[colNet]]</th><th>[[colTax]]</th><th>[[colTotal]]</th><th>[[colAccount]]</th><th class="c">—</th></tr></thead>
            <tbody id="tx-ev-body"></tbody>
          </table>
        </div>
      </div>
      <div class="tx-panel" style="margin-top:12px">
        <div class="tx-panel-head"><h3>[[journalTitle]]</h3><span class="mono">JOURNAL</span></div>
        <div class="tx-scroll">
          <table class="tx-table compact">
            <thead><tr><th>[[colDate]]</th><th>[[colMemo]]</th><th>[[drLabel]]</th><th>[[colAmount]]</th><th>[[crLabel]]</th><th>[[colAmount]]</th></tr></thead>
            <tbody id="tx-journal-body"></tbody>
          </table>
        </div>
      </div>
      <div class="tx-panel" style="margin-top:12px">
        <div class="tx-panel-head"><h3>[[catalogTitle]]</h3><span class="mono">ACCOUNT CATALOG</span></div>
        <div class="tx-body">
          <div class="tx-grid two">
            <div>
              <p class="tx-hint"><b>[[catRev]]</b></p><div class="tx-related" id="tx-acct-rev"></div>
              <p class="tx-hint" style="margin-top:12px"><b>[[catExp]]</b></p><div class="tx-related" id="tx-acct-exp"></div>
            </div>
            <div>
              <p class="tx-hint"><b>[[catBal]]</b></p><div class="tx-related" id="tx-acct-bal"></div>
              <p class="tx-hint" style="margin-top:12px"><b>[[catEtc]]</b></p><div class="tx-related" id="tx-acct-etc"></div>
            </div>
          </div>
          <div class="tx-print-note">[[catalogNote]]</div>
        </div>
      </div>
    </section>

    <section class="tx-sec" id="tx-payroll">
      <div class="tx-sec-head">
        <h2><span>03</span>[[payTitle]]</h2>
        <span class="mono">PAYROLL &amp; WITHHOLDING</span>
      </div>
      <p class="tx-lead">[[payLead]]</p>
      <div class="tx-panel">
        <div class="tx-panel-head"><h3>[[setupTitle]]</h3><span class="mono">RATES</span></div>
        <div class="tx-body">
          <div class="tx-grid three">
            <div class="tx-field"><label class="lbl" for="tx-injury">[[injuryLabel]]</label><select id="tx-injury" class="tx-select"></select></div>
            <div class="tx-field"><label class="lbl" for="tx-size">[[sizeLabel]]</label><select id="tx-size" class="tx-select"></select></div>
            <div class="tx-field"><label class="lbl" for="tx-pay-month">[[monthLabel]]</label><input type="month" id="tx-pay-month" class="tx-input"></div>
          </div>
          <p class="tx-hint" style="margin-top:9px">[[payHint]]</p>
        </div>
      </div>
      <div class="tx-panel" style="margin-top:12px">
        <div class="tx-panel-head">
          <h3>[[empTitle]] <span class="tx-chip mut" id="tx-emp-count">0</span></h3>
          <div class="tx-tools"><button class="tx-btn-xs dark" type="button" id="tx-emp-add">[[addEmp]]</button></div>
        </div>
        <div class="tx-scroll">
          <table class="tx-table compact">
            <thead><tr><th>[[colName]]</th><th>[[colRole]]</th><th>[[colBase]]</th><th>[[colAllow]]</th><th>[[colNt1]]</th><th>[[colNt2]]</th><th>[[colFamily]]</th><th class="c">—</th></tr></thead>
            <tbody id="tx-emp-body"></tbody>
          </table>
        </div>
        <div class="tx-body" style="border-top:1px solid var(--rule)"><p class="tx-hint" style="margin:0">[[empHint]]</p></div>
      </div>
      <div class="tx-panel" style="margin-top:12px">
        <div class="tx-panel-head"><h3>[[ledgerPayTitle]]</h3><span class="mono">PAYROLL LEDGER</span></div>
        <div class="tx-scroll">
          <table class="tx-table compact">
            <thead id="tx-pay-head"></thead>
            <tbody id="tx-pay-body"></tbody>
            <tfoot id="tx-pay-foot"></tfoot>
          </table>
        </div>
      </div>
      <div class="tx-panel" style="margin-top:12px">
        <div class="tx-panel-head">
          <h3>[[whTitle]]</h3>
          <div class="tx-tools">
            <button class="tx-btn-xs" type="button" data-export="wh">[[csvBtn]]</button>
            <button class="tx-btn-xs dark" type="button" data-print="wh">[[printBtn]]</button>
          </div>
        </div>
        <div class="tx-scroll">
          <table class="tx-table compact">
            <thead id="tx-wh-head"></thead>
            <tbody id="tx-wh-body"></tbody>
            <tfoot id="tx-wh-foot"></tfoot>
          </table>
        </div>
        <div class="tx-body" style="border-top:1px solid var(--rule)"><p class="tx-hint" style="margin:0">[[whNote]]</p></div>
      </div>
      <div class="tx-actions">
        <button class="btn btn-ghost btn-sm" type="button" data-export="payroll">[[payCsv]]</button>
        <button class="btn btn-ghost btn-sm" type="button" data-print="wh">[[printBtn]]</button>
        <a class="btn btn-ghost btn-sm" href="../salary.html">[[salaryLink]]</a>
      </div>
    </section>

    <section class="tx-sec" id="tx-fx">
      <div class="tx-sec-head"><h2><span>04</span>[[fxTitle]]</h2><span class="mono">FX SETTLEMENT</span></div>
      <p class="tx-lead">[[fxLead]]</p>
      <div class="tx-panel">
        <div class="tx-panel-head"><h3>[[fxPanel]]</h3><div class="tx-tools"><button class="tx-btn-xs dark" type="button" id="tx-fx-add">[[addFx]]</button></div></div>
        <div class="tx-scroll">
          <table class="tx-table compact">
            <thead><tr><th>[[fxDoc]]</th><th>[[fxDate]]</th><th>[[fxCur]]</th><th>[[fxAmount]]</th><th>[[fxShip]]</th><th>[[fxPayDate]]</th><th>[[fxPay]]</th><th>[[fxGain]]</th><th class="c">—</th></tr></thead>
            <tbody id="tx-fx-body"></tbody>
            <tfoot id="tx-fx-foot"></tfoot>
          </table>
        </div>
      </div>
      <div class="tx-panel" style="margin-top:12px">
        <div class="tx-panel-head"><h3>[[fxBalPanel]]</h3><div class="tx-tools"><button class="tx-btn-xs dark" type="button" id="tx-fxbal-add">[[addBal]]</button></div></div>
        <div class="tx-scroll">
          <table class="tx-table compact">
            <thead><tr><th>[[balKind]]</th><th>[[fxCur]]</th><th>[[fxAmount]]</th><th>[[balBook]]</th><th>[[balClose]]</th><th>[[balBookAmt]]</th><th>[[balCloseAmt]]</th><th>[[balGain]]</th><th class="c">—</th></tr></thead>
            <tbody id="tx-fxbal-body"></tbody>
            <tfoot id="tx-fxbal-foot"></tfoot>
          </table>
        </div>
      </div>
      <div class="tx-panel" style="margin-top:12px">
        <div class="tx-panel-head"><h3>[[expPanel]]</h3><div class="tx-tools"><button class="tx-btn-xs" type="button" data-export="export">[[csvBtn]]</button></div></div>
        <div class="tx-scroll">
          <table class="tx-table compact">
            <thead><tr><th>[[fxDoc]]</th><th>[[fxDate]]</th><th>[[colPartner]]</th><th>[[fxCur]]</th><th>[[fxAmount]]</th><th>[[fxShip]]</th><th>[[expValue]]</th></tr></thead>
            <tbody id="tx-exps-body"></tbody>
            <tfoot id="tx-exps-foot"></tfoot>
          </table>
        </div>
      </div>
    </section>

    <section class="tx-sec" id="tx-close">
      <div class="tx-sec-head"><h2><span>05</span>[[closeTitle]]</h2><span class="mono">YEAR-END</span></div>
      <p class="tx-lead">[[closeLead]]</p>
      <div class="tx-steps" role="tablist" id="tx-steps">
        <button type="button" role="tab" aria-selected="true" data-step="1"><span class="n">STEP 01</span><span class="t">[[step1]]</span></button>
        <button type="button" role="tab" aria-selected="false" data-step="2"><span class="n">STEP 02</span><span class="t">[[step2]]</span></button>
        <button type="button" role="tab" aria-selected="false" data-step="3"><span class="n">STEP 03</span><span class="t">[[step3]]</span></button>
      </div>
      <div class="tx-step-panel" data-panel="1">
        <div class="tx-panel">
          <div class="tx-panel-head"><h3>[[invTitle]]</h3><div class="tx-tools"><button class="tx-btn-xs dark" type="button" id="tx-inv-add">[[addItem]]</button></div></div>
          <div class="tx-body" style="padding-bottom:0">
            <div class="tx-grid three">
              <div class="tx-field"><label class="lbl" for="tx-inv-open">[[invOpen]]</label><div class="unit"><input type="number" id="tx-inv-open" min="0" step="1" value="0"><span>[[cur]]</span></div></div>
              <div class="tx-field"><label class="lbl" for="tx-inv-buy">[[invBuy]]</label><div class="unit"><input type="number" id="tx-inv-buy" min="0" step="1" value="0" readonly><span>[[cur]]</span></div></div>
              <div class="tx-field"><label class="lbl" for="tx-inv-end">[[invEnd]]</label><div class="unit"><input type="number" id="tx-inv-end" min="0" step="1" value="0" readonly><span>[[cur]]</span></div></div>
            </div>
          </div>
          <div class="tx-scroll" style="margin-top:10px">
            <table class="tx-table compact">
              <thead><tr><th>[[colItem]]</th><th>[[colSpec]]</th><th>[[colQty]]</th><th>[[colUnit]]</th><th>[[colAmount]]</th><th class="c">—</th></tr></thead>
              <tbody id="tx-inv-body"></tbody>
              <tfoot id="tx-inv-foot"></tfoot>
            </table>
          </div>
          <div class="tx-body" style="border-top:1px solid var(--rule)"><p class="tx-hint" style="margin:0">[[invHint]]</p></div>
        </div>
      </div>
      <div class="tx-step-panel" data-panel="2" hidden>
        <div class="tx-panel">
          <div class="tx-panel-head"><h3>[[apTitle]]</h3><span class="mono">AR / AP</span></div>
          <div class="tx-body" style="padding-bottom:0">
            <div class="tx-grid three">
              <div class="tx-field"><label class="lbl" for="tx-cash-open">[[cashOpen]]</label><div class="unit"><input type="number" id="tx-cash-open" min="0" step="1" value="0"><span>[[cur]]</span></div></div>
              <div class="tx-field"><label class="lbl" for="tx-capital">[[capital]]</label><div class="unit"><input type="number" id="tx-capital" min="0" step="1" value="0"><span>[[cur]]</span></div></div>
              <div class="tx-field"><label class="lbl">[[equityHint]]</label><input type="text" value="[[equityHintVal]]" readonly></div>
            </div>
          </div>
          <div class="tx-scroll" style="margin-top:10px">
            <table class="tx-table compact">
              <thead><tr><th>[[apKind]]</th><th>[[colPartner]]</th><th>[[apMade]]</th><th>[[apPaid]]</th><th>[[apBalance]]</th><th>[[apConfirm]]</th></tr></thead>
              <tbody id="tx-ap-body"></tbody>
              <tfoot id="tx-ap-foot"></tfoot>
            </table>
          </div>
          <div class="tx-body" style="border-top:1px solid var(--rule)"><p class="tx-hint" style="margin:0">[[apHint]]</p></div>
        </div>
      </div>
      <div class="tx-step-panel" data-panel="3" hidden>
        <div class="tx-panel">
          <div class="tx-panel-head"><h3>[[fxEvalTitle]]</h3><span class="mono">FX REVALUATION</span></div>
          <div class="tx-body">
            <div id="tx-close-fx" class="tx-print-note" style="border-top:0;padding-top:0"></div>
            <div class="tx-actions"><button class="btn btn-accent btn-sm" type="button" id="tx-close-run">[[btnClose]]</button></div>
          </div>
        </div>
      </div>
      <div class="tx-grid two" style="margin-top:12px">
        <div class="tx-panel">
          <div class="tx-panel-head"><h3>[[isTitle]]</h3><span class="mono">INCOME STATEMENT</span></div>
          <div class="tx-scroll"><table class="tx-table compact"><tbody id="tx-is-body"></tbody></table></div>
        </div>
        <div class="tx-panel">
          <div class="tx-panel-head"><h3>[[bsTitle]]</h3><span class="mono">BALANCE SHEET</span></div>
          <div class="tx-scroll"><table class="tx-table compact"><tbody id="tx-bs-body"></tbody></table></div>
        </div>
      </div>
      <div class="tx-risks" id="tx-risks"></div>
      <div class="tx-actions">
        <button class="btn btn-ghost btn-sm" type="button" data-export="close">[[closeCsv]]</button>
        <button class="btn btn-ghost btn-sm" type="button" data-print="close">[[printBtn]]</button>
      </div>
    </section>

    <section class="tx-sec" id="tx-export">
      <div class="tx-sec-head"><h2><span>06</span>[[expTitle]]</h2><span class="mono">EXPORT &amp; PRINT</span></div>
      <p class="tx-lead">[[expLead]]</p>
      <div class="tx-grid three">
        <div class="tx-panel">
          <div class="tx-panel-head"><h3>[[expLedger]]</h3><span class="mono">LEDGER</span></div>
          <div class="tx-body"><div class="tx-actions" style="margin-top:0">
            <button class="btn btn-ghost btn-sm" type="button" data-export="bank">[[bankCsv]]</button>
            <button class="btn btn-ghost btn-sm" type="button" data-export="journal">[[journalCsv]]</button>
            <button class="btn btn-ghost btn-sm" type="button" data-export="evidence">[[docCsv]]</button>
          </div></div>
        </div>
        <div class="tx-panel">
          <div class="tx-panel-head"><h3>[[expPay]]</h3><span class="mono">PAYROLL · STOCK · EXPORT</span></div>
          <div class="tx-body"><div class="tx-actions" style="margin-top:0">
            <button class="btn btn-ghost btn-sm" type="button" data-export="payroll">[[payCsv]]</button>
            <button class="btn btn-ghost btn-sm" type="button" data-export="inventory">[[invCsv]]</button>
            <button class="btn btn-ghost btn-sm" type="button" data-export="export">[[expCsv]]</button>
          </div></div>
        </div>
        <div class="tx-panel">
          <div class="tx-panel-head"><h3>[[expPrint]]</h3><span class="mono">A4 PRINT</span></div>
          <div class="tx-body"><div class="tx-actions" style="margin-top:0">
            <button class="btn btn-ghost btn-sm" type="button" data-print="vat">[[prVat]]</button>
            <button class="btn btn-ghost btn-sm" type="button" data-print="wh">[[prWh]]</button>
            <button class="btn btn-ghost btn-sm" type="button" data-print="close">[[prClose]]</button>
            <button class="btn btn-ghost btn-sm" type="button" data-print="voucher">[[prVoucher]]</button>
          </div>
          <p class="tx-print-note">[[printNote]]</p></div>
        </div>
      </div>
      <div class="tx-panel" style="margin-top:12px">
        <div class="tx-panel-head"><h3>[[backupTitle]]</h3><span class="mono">BACKUP</span></div>
        <div class="tx-body">
          <div class="tx-actions" style="margin-top:0">
            <button class="btn btn-accent btn-sm" type="button" id="tx-backup">[[backupBtn]]</button>
            <label class="btn btn-ghost btn-sm" for="tx-restore-file" style="cursor:pointer">[[restoreBtn]]</label>
            <input type="file" id="tx-restore-file" accept=".json,application/json" hidden>
          </div>
          <p class="tx-hint" style="margin:10px 0 0">[[backupHint]]</p>
        </div>
      </div>
      <div class="tx-panel" style="margin-top:12px">
        <div class="tx-panel-head"><h3>[[relatedTitle]]</h3><span class="mono">RELATED</span></div>
        <div class="tx-body">
          <div class="tx-related">
            <a href="../salary.html">[[relSalary]]</a>
            <a href="../biz.html">[[relBiz]]</a>
            <a href="../forms.html">[[relForms]]</a>
            <a href="../experts.html">[[relExperts]]</a>
          </div>
        </div>
      </div>
      <p class="tx-disclaimer">[[disclaimer]]</p>
    </section>

  </div>
</main>

<footer class="site-footer" id="site-footer">
  <div class="container">
    <div class="f-top">
      <div class="f-brand">
        <div class="mark-line"><i></i><span>[[tagline]]</span></div>
        <div class="name">INSIGHT BRIEF</div>
        <p>[[footerAbout]]</p>
      </div>
      <div class="f-col">
        <h4>[[footerSections]]</h4>
        <ul>
          <li><a href="../index.html?cat=investigative">[[navInvest]]</a></li>
          <li><a href="../index.html?cat=economy">[[navEconomy]]</a></li>
          <li><a href="../index.html?cat=trade">[[navTrade]]</a></li>
          <li><a href="../market.html">[[navMarket]]</a></li>
          <li><a href="../index.html?cat=ai">[[navAI]]</a></li>
        </ul>
      </div>
      <div class="f-col">
        <h4>[[footerMedia]]</h4>
        <ul>
          <li><a href="../about.html">[[footerAboutLink]]</a></li>
          <li><a href="../contact.html#tip">[[footerTip]]</a></li>
          <li><a href="../ad.html">[[footerAd]]</a></li>
          <li><a href="../lotto.html">[[navLotto]]</a></li>
          <li><a href="../salary.html">[[navSalary]]</a></li>
          <li><a href="tax.html">[[navTax]]</a></li>
          <li><a href="../biz.html">[[navBiz]]</a></li>
          <li><a href="../forms.html">[[navForms]]</a></li>
          <li><a href="../law.html">[[navLaw]]</a></li>
          <li><a href="../feed.xml">RSS</a></li>
          <li><a href="sitemap.html">[[navSitemapLink]]</a></li>
        </ul>
      </div>
      <div class="f-col mail-col">
        <h4>[[footerContact]]</h4>
        <ul>
          <li><a class="mail" href="mailto:hoppe00lg@gmail.com">hoppe00lg@gmail.com</a></li>
          <li><span style="font-size:11px;opacity:.55">Seoul · VOL. 01</span></li>
        </ul>
      </div>
    </div>
    <div class="f-note">
      <p>[[footerNotice]]</p>
      <div class="copy"><span>© 2026 INSIGHT BRIEF. All rights reserved.</span><span>INSIGHT BRIEF</span></div>
    </div>
  </div>
</footer>

<div class="tx-print" id="tx-print-root">
  <div class="tx-print-page" data-print="vat" id="tx-print-vat"></div>
  <div class="tx-print-page" data-print="wh" id="tx-print-wh"></div>
  <div class="tx-print-page" data-print="close" id="tx-print-close"></div>
  <div class="tx-print-page" data-print="voucher" id="tx-print-voucher"></div>
</div>

<script src="../assets/js/tax.js?v=20261124d" defer></script>
</body>
</html>
"""

FONTS = {
    "en": "https://fonts.googleapis.com/css2?family=Noto+Serif:wght@400;500;700;900&family=Inter:wght@400;500;700&display=swap",
    "zh": "https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;500;700;900&family=Noto+Sans+SC:wght@400;500;700&display=swap",
    "ja": "https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@400;500;700;900&family=Noto+Sans+JP:wght@400;500;700&display=swap",
}
OG = {"en": "en_US", "zh": "zh_CN", "ja": "ja_JP"}
HTML_LANG = {"en": "en", "zh": "zh-Hans", "ja": "ja"}
TODAY = {"en": "November 24, 2026 (Tuesday)", "zh": "2026年11月24日 星期二", "ja": "2026年11月24日(火曜日)"}

EN = {
    "title": "Small Business Tax & Bookkeeping Tool — Sales Tax, Payroll, 1120 / Schedule C | INSIGHT BRIEF",
    "desc": "Upload bank CSVs and invoice exports to match documents, build a journal automatically, estimate sales tax, run payroll with FICA and federal withholding, settle FX gains and produce a year-end closing summary. Everything stays in your browser.",
    "keywords": "sales tax calculator, bookkeeping tool, Form 1120, Schedule C, FICA, federal withholding, 1099-NEC, foreign exchange gain, ending inventory, small business tax",
    "ogTitle": "Small Business Tax & Bookkeeping Tool",
    "ogDesc": "Sales tax, payroll, FX and year-end closing for US small businesses — all in your browser, no sign-up.",
    "tagline": "Independent economic & investigative research magazine",
    "brandSub": "Insight Brief",
    "slogan": "Reading the context behind the numbers",
    "tip": "Send a tip",
    "subscribe": "Weekly briefing",
    "navAll": "All", "navInvest": "Investigations", "navEconomy": "Economy", "navTrade": "Trade & Commodities",
    "navMarket": "Market board", "navAI": "AI & Tech", "navFire": "Fire & Safety", "navLotto": "Lotto generator",
    "navSaju": "Fortune reading", "navSalary": "Payroll calculator", "navTax": "Tax & closing",
    "navBiz": "Business tools", "navForms": "Forms & e-sign", "navLaw": "Law reference", "navSeller": "Seller tools", "navExperts": "Experts", "navSitemapLink": "Sitemap",
    "navAd": "Advertise", "navContact": "Contact",
    "searchPh": "Search articles", "searchAria": "Search articles",
    "kicker": "FREE TOOL · TAX & CLOSING",
    "h1": "Small business tax & closing tool",
    "dek": "Upload <b>bank transactions and invoice exports</b> and the tool matches documents, writes the journal, estimates sales tax, runs payroll with FICA and withholding, settles foreign-currency gains and builds a year-end closing summary. Everything is calculated and stored <b>in your browser only</b>, and exports go out as CSV or an A4 printout.",
    "b1": "No data leaves your browser", "b2": "Saved in localStorage",
    "b3": "6 modules: sales tax, payroll, FX, closing", "b4": "CSV upload and manual entry",
    "btnSample": "Load sample company data", "btnReset": "Reset everything", "btnAll": "Download all CSVs",
    "saveNote": "Saved in this browser automatically",
    "noticeTitle": "What this tool does — and does not do",
    "n1": "It does <b>not</b> connect to the IRS, your bank or your accounting software. You upload a CSV exported from your bank or invoicing tool, or type entries in.",
    "n2": "The summaries and CSVs are <b>working papers</b> for your return or your accountant. Nothing is filed from here.",
    "n3": "Everything is kept in <b>your browser's localStorage</b>. Clearing site data deletes it, so download a backup.",
    "n4": "Rates are published federal figures with simple rules. State taxes, credits and book-tax adjustments are not modelled.",
    "j1": "Dashboard & checklist", "j2": "Bank, documents, journal", "j3": "Payroll & withholding",
    "j4": "FX & exports", "j5": "Year-end closing", "j6": "Export & print",
    "dashTitle": "Live tax dashboard", "dashSub": "LIVE TAX BOARD",
    "dashLead": "Add bank lines and documents and the <b>sales tax, monthly profit and estimated federal tax</b> recalculate immediately. Switch entity type to change the rate structure.",
    "entityCorp": "C-Corp / S-Corp", "entitySole": "LLC / Sole proprietor",
    "fyLabel": "Tax year", "fy2026": "Tax year 2026", "fy2025": "Tax year 2025", "fy2027": "Tax year 2027",
    "entityNote": "Entity · flat 21% federal rate",
    "kpiVat": "Sales tax due", "kpiMonth": "Operating profit this month", "kpiYear": "Operating profit (year)", "kpiTax": "Est. federal income tax",
    "sumTitle": "Sales, purchases and tax", "basisTitle": "How the tax is computed",
    "checkTitle": "Periodic closing checklist", "checkSub": "WEEKLY · MONTHLY · QUARTERLY · ANNUAL",
    "checkHint": "Tick an item and it is saved with your progress. The <b>documents</b> line shows what to keep for that period.",
    "ledgerTitle": "Bank & documents with auto-matching", "ledgerLead": "The tool pairs bank lines with invoices <b>by amount and date</b>, books receipts against receivables and payments against payables, and queues anything unmatched for one-click classification.",
    "bankPanel": "① Bank statement CSV", "bankHint": "Download the transaction CSV from your bank and upload it as-is. Column names can differ — it looks for <b>date, description, debit and credit</b>.",
    "fileLabel": "Choose file", "addTx": "＋ Add a transaction", "colDate": "Date", "colIn": "In", "colOut": "Out",
    "colMemo": "Description", "memoPh": "e.g. Acme Plastics invoice 1042", "btnAdd": "Add",
    "evPanel": "② Invoice CSV", "evHint": "Export invoices, card charges or receipts from your invoicing or accounting tool as CSV. Pick the type and upload.",
    "evTypeLabel": "Document type", "evSales": "Sales invoice", "evPurchase": "Purchase invoice", "evCard": "Card charge", "evCash": "Cash receipt",
    "addEv": "＋ Add a document", "colType": "Type", "colPartner": "Vendor / customer", "partnerPh": "e.g. Acme Plastics",
    "colNet": "Net", "colTax": "Tax", "zeroLabel": "Zero-rated export purchase — mark as recoverable",
    "btnMatch": "Auto-match by amount and date", "btnSuggest": "Apply account suggestions",
    "bankLedgerTitle": "Bank transactions", "colAccount": "Account", "colDocument": "Document", "colJournal": "Journal",
    "unmTitle": "Unclassified", "unmHint": "Lines with no document or no memo. One click sets the account and writes the entry.",
    "evListTitle": "Documents", "colTotal": "Total",
    "journalTitle": "Journal (generated)", "drLabel": "Debit", "crLabel": "Credit", "colAmount": "Amount",
    "catalogTitle": "Accounts used for automatic entries", "catRev": "Revenue", "catExp": "Expenses", "catBal": "Assets & liabilities", "catEtc": "Other",
    "catalogNote": "Accounts are suggested from keywords in the description: fuel → vehicle, restaurant → employee benefits, golf → meals & entertainment, freight → delivery, customs → import fees.",
    "payTitle": "Payroll, FICA and withholding", "payLead": "Add employees and the tool computes <b>Social Security, Medicare, federal withholding</b>, net pay and employer cost, then lays out the payroll ledger and withholding summary.",
    "setupTitle": "Employer settings", "injuryLabel": "Workers' comp class", "sizeLabel": "Unemployment rate", "monthLabel": "Pay period",
    "payHint": "Social Security 6.2% up to the annual wage base, Medicare 1.45% (employer matches both), FUTA 0.6% and state unemployment on the first $7,000 of wages. Federal withholding is estimated from annualised taxable wages and filing status. State income tax is not withheld — set it in your payroll system.",
    "empTitle": "Employees and owners", "addEmp": "＋ Add employee",
    "colName": "Name", "colRole": "Role", "colBase": "Base pay", "colAllow": "Taxable allowance",
    "colNt1": "Non-taxable A", "colNt2": "Non-taxable B", "colFamily": "Filing status",
    "empHint": "Monthly amounts. Filing status 1 = single, 2+ = married/joint for the federal estimate.",
    "ledgerPayTitle": "Payroll ledger", "whTitle": "Withholding summary", "csvBtn": "Download CSV", "printBtn": "Print / PDF",
    "whNote": "Copy these figures into Form 941 or your payroll report. Employer taxes are paid separately.",
    "payCsv": "Payroll CSV", "salaryLink": "Detailed payroll calculator",
    "fxTitle": "Foreign currency settlement", "fxLead": "The rate on the ship date and the rate on the day the money arrived differ — that difference is the <b>FX gain or loss</b>. Year-end balances are revalued at the closing rate.",
    "fxPanel": "FX gain / loss by invoice", "addFx": "＋ Add export",
    "fxDoc": "Invoice No.", "fxDate": "Ship date", "fxCur": "Ccy", "fxAmount": "Foreign amount", "fxShip": "Book rate",
    "fxPayDate": "Paid date", "fxPay": "Payment rate", "fxGain": "FX gain/loss",
    "fxBalPanel": "Year-end balances — revaluation", "addBal": "＋ Add balance", "balKind": "Type",
    "balBook": "Book rate", "balClose": "Year-end rate", "balBookAmt": "Book value", "balCloseAmt": "Revalued", "balGain": "Revaluation",
    "expPanel": "Export statement", "expValue": "Value",
    "closeTitle": "Year-end closing & risk alerts", "closeLead": "Three steps produce a <b>summary income statement and balance sheet</b>. At the same time owner draws and missing receipts are flagged.",
    "step1": "Ending inventory", "step2": "AR / AP balances", "step3": "FX revaluation",
    "invTitle": "Ending inventory schedule", "addItem": "＋ Add item", "invOpen": "Opening inventory", "invBuy": "Purchases (auto)", "invEnd": "Ending inventory",
    "colItem": "Item", "colSpec": "Spec", "colQty": "Qty", "colUnit": "Unit cost",
    "invHint": "COGS = opening inventory + purchases − ending inventory. It flows straight into the summary.",
    "apTitle": "Accounts receivable and payable", "cashOpen": "Opening cash", "capital": "Paid-in capital",
    "equityHint": "Equity is derived", "equityHintVal": "Retained earnings = assets − liabilities − capital",
    "apKind": "Type", "apMade": "Invoiced", "apPaid": "Paid", "apBalance": "Balance", "apConfirm": "OK",
    "apHint": "Computed from document matching. If a balance differs from the customer statement, fix the match in section 02.",
    "fxEvalTitle": "Apply FX revaluation", "btnClose": "Run closing and build the summary",
    "isTitle": "Income statement (summary)", "bsTitle": "Balance sheet (summary)", "closeCsv": "Closing summary CSV",
    "expTitle": "Export & print", "expLead": "Every CSV opens in Excel as UTF-8. Print layouts fit one A4 page — choose <b>Save as PDF</b> in the print dialog.",
    "expLedger": "Ledger & documents", "bankCsv": "Bank ledger CSV", "journalCsv": "Journal CSV", "docCsv": "Document summary CSV",
    "expPay": "Payroll, stock, exports", "invCsv": "Ending inventory CSV", "expCsv": "Export statement CSV",
    "expPrint": "A4 print / PDF", "prVat": "Sales tax summary", "prWh": "Withholding summary", "prClose": "Closing summary", "prVoucher": "Voucher batch",
    "printNote": "In the print dialog choose <b>Save as PDF</b> to get an A4 PDF.",
    "backupTitle": "Backup", "backupBtn": "Download all data as JSON", "restoreBtn": "Restore a backup",
    "backupHint": "Restoring brings back everything exactly. A backup contains vendor names and pay figures — do not share it.",
    "relatedTitle": "Related tools", "relSalary": "Payroll calculator", "relBiz": "Business tools", "relForms": "Forms & e-signature", "relExperts": "Find an expert",
    "disclaimer": "<strong>This is a reference tool built on published federal rates and the data you enter — not tax or accounting advice.</strong> Actual tax depends on book-tax adjustments, credits, carryforwards and state rules. Returns must be filed with the IRS or a state portal; this page does not file anything. Owner-draw and missing-document warnings use simple rules and may differ from an examiner's view. Your data stays in this browser.",
    "footerAbout": "Insight Brief is an independent research magazine covering economy, trade, technology and safety with data and interviews. It is not a registered newspaper.",
    "footerSections": "Sections", "footerMedia": "Media", "footerAboutLink": "About & principles", "footerTip": "Reader tips",
    "footerAd": "Advertising rates", "footerContact": "Contact",
    "footerNotice": "This magazine is an independent outlet not registered as a newspaper. Reproduction of articles and photographs is prohibited. Sponsored content is labelled.",
}

ZH = {
    "title": "小微企业财税自查工具 — 增值税、企业所得税、五险一金、汇算清缴 | INSIGHT BRIEF",
    "desc": "上传银行流水与发票 CSV，自动匹配票据、生成分录，测算增值税、企业所得税、五险一金与个税，处理出口退税与汇兑损益，并生成年度决算汇总。所有数据只保存在本浏览器。",
    "keywords": "增值税计算, 企业所得税, 小微企业, 五险一金, 个人所得税, 汇算清缴, 出口退税, 汇兑损益, 期末存货, 财务报表",
    "ogTitle": "小微企业财税自查工具",
    "ogDesc": "增值税、企业所得税、五险一金、出口退税与年度决算 — 在浏览器里完成，无需注册。",
    "tagline": "独立经济与调查报道杂志",
    "brandSub": "洞察简报",
    "slogan": "读懂数字背后的逻辑",
    "tip": "提供线索",
    "subscribe": "订阅周报",
    "navAll": "全部", "navInvest": "调查报道", "navEconomy": "经济金融", "navTrade": "贸易大宗",
    "navMarket": "行情板", "navAI": "人工智能", "navFire": "消防与安全", "navLotto": "彩票生成器",
    "navSaju": "八字排盘", "navSalary": "薪酬计算器", "navTax": "财税决算",
    "navBiz": "经营者工具", "navForms": "表单与电子签", "navLaw": "商事法律参考", "navSeller": "卖家工具", "navExperts": "专家匹配", "navSitemapLink": "网站地图",
    "navAd": "广告合作", "navContact": "联系编辑部",
    "searchPh": "搜索文章", "searchAria": "搜索文章",
    "kicker": "免费工具 · 财税决算",
    "h1": "小微企业财税自查工具",
    "dek": "把<b>银行流水和发票导出</b>上传，工具会自动匹配票据、生成记账分录、测算增值税、计算工资五险一金与个税、处理出口收汇的汇兑损益，并生成年度决算汇总。全部计算和保存都<b>只在本浏览器</b>完成，结果可导出 CSV 或 A4 打印。",
    "b1": "数据不离开本机", "b2": "保存在 localStorage",
    "b3": "六大模块：增值税、工资、外汇、决算", "b4": "CSV 上传或手工录入",
    "btnSample": "载入示例数据", "btnReset": "全部清空", "btnAll": "下载全部 CSV",
    "saveNote": "自动保存在本浏览器",
    "noticeTitle": "这个工具做什么，不做什么",
    "n1": "<b>不会</b>直连税务系统、银行或财务软件。请上传银行或开票系统导出的 CSV，或手工录入。",
    "n2": "生成的汇总表和 CSV 是申报或交给会计的<b>工作底稿</b>，本页不代为申报。",
    "n3": "所有资料只存在<b>本浏览器的 localStorage</b>。清除站点数据就会消失，请及时备份。",
    "n4": "税率采用公开发布的标准税率与简易规则，未包含税收优惠、纳税调整与地方差异。",
    "j1": "仪表盘与清单", "j2": "银行、票据、分录", "j3": "工资与个税", "j4": "外汇与出口", "j5": "年度决算", "j6": "导出与打印",
    "dashTitle": "实时财税看板", "dashSub": "LIVE TAX BOARD",
    "dashLead": "录入流水和票据后，<b>应纳增值税、当月利润与预计所得税</b>会立即重算。切换主体类型会同时改变税率结构。",
    "entityCorp": "公司（一般纳税人）", "entitySole": "个体户 / 个人独资",
    "fyLabel": "纳税年度", "fy2026": "2026 年度", "fy2025": "2025 年度", "fy2027": "2027 年度",
    "entityNote": "公司 · 企业所得税 5%（小微）/25%",
    "kpiVat": "本期应纳增值税", "kpiMonth": "本月营业利润", "kpiYear": "年度营业利润", "kpiTax": "预计企业所得税",
    "sumTitle": "销售、采购与税额", "basisTitle": "税额计算依据",
    "checkTitle": "周期自查清单", "checkSub": "日常 · 每月 · 季度 · 年度",
    "checkHint": "勾选后自动保存并显示进度。<b>资料</b>一栏是该周期需要准备的单据与表格。",
    "ledgerTitle": "票据与银行流水自动匹配", "ledgerLead": "按<b>金额与日期</b>把银行流水与发票配对，收款冲应收、付款冲应付；没有配对或没有摘要的流水会进入待处理清单，一键归类。",
    "bankPanel": "① 银行流水 CSV", "bankHint": "从网银导出交易明细 CSV 直接上传即可。列名不同也能识别<b>日期、摘要、收入、支出</b>。",
    "fileLabel": "选择文件", "addTx": "＋ 手工添加流水", "colDate": "日期", "colIn": "收入", "colOut": "支出",
    "colMemo": "摘要", "memoPh": "例：上海大明塑料 货款", "btnAdd": "添加",
    "evPanel": "② 发票 / 票据 CSV",
    "evHint": "从开票系统或财务软件导出销项、进项发票、企业卡或收据的 CSV。先选类型再上传。",
    "evTypeLabel": "票据类型", "evSales": "销项发票", "evPurchase": "进项发票", "evCard": "企业卡", "evCash": "收据",
    "addEv": "＋ 手工添加票据", "colType": "类型", "colPartner": "客户 / 供应商", "partnerPh": "例：上海大明塑料",
    "colNet": "不含税金额", "colTax": "税额", "zeroLabel": "出口免税对应的进项 —— 标记为可退税",
    "btnMatch": "按金额与日期自动匹配", "btnSuggest": "应用科目推荐",
    "bankLedgerTitle": "银行流水", "colAccount": "会计科目", "colDocument": "票据", "colJournal": "分录",
    "unmTitle": "待处理", "unmHint": "没有票据或没有摘要的流水，点一下即可确定科目并生成分录。",
    "evListTitle": "票据", "colTotal": "价税合计",
    "journalTitle": "记账分录（自动生成）", "drLabel": "借方", "crLabel": "贷方", "colAmount": "金额",
    "catalogTitle": "自动分录使用的会计科目", "catRev": "收入", "catExp": "费用", "catBal": "资产与负债", "catEtc": "其他",
    "catalogNote": "摘要关键词会自动推荐科目：加油 → 车辆使用费，餐饮 → 职工福利费，招待 → 业务招待费，运费 → 运输费，关税 → 进口费用。",
    "payTitle": "工资、五险一金与个税", "payLead": "添加员工后自动计算<b>养老、医疗、失业、公积金、个人所得税</b>，得出实发工资与单位承担，并生成工资表和扣缴汇总。",
    "setupTitle": "单位参数", "injuryLabel": "工伤保险类别", "sizeLabel": "缴费档次", "monthLabel": "所属期",
    "payHint": "养老保险 8%（单位 16%）、医疗保险 2%（单位约 9.8%）、失业保险 0.5%、住房公积金 7%，单位同比例或按当地标准。个税按 5,000 元起征点与 3%~45% 超额累进税率估算，未含专项附加扣除。",
    "empTitle": "员工与负责人", "addEmp": "＋ 添加员工",
    "colName": "姓名", "colRole": "身份", "colBase": "基本工资", "colAllow": "应税补贴",
    "colNt1": "非应税补贴 A", "colNt2": "非应税补贴 B", "colFamily": "计税家庭人数",
    "empHint": "金额为月标准。非应税补贴按当地政策确定，本工具仅用于测算。",
    "ledgerPayTitle": "工资表", "whTitle": "个税扣缴汇总", "csvBtn": "下载 CSV", "printBtn": "打印 / PDF",
    "whNote": "可据此填写个人所得税扣缴申报表。五险一金不在此表，需另行缴纳。",
    "payCsv": "工资表 CSV", "salaryLink": "详细薪酬计算器",
    "fxTitle": "进出口外汇结算", "fxLead": "报关日汇率与收汇日汇率不同，差额就是<b>汇兑损益</b>。年末外币余额按期末汇率重新评估。",
    "fxPanel": "按单据计算的汇兑损益", "addFx": "＋ 添加出口",
    "fxDoc": "报关单号", "fxDate": "出口日期", "fxCur": "币种", "fxAmount": "外币金额", "fxShip": "报关汇率",
    "fxPayDate": "收汇日", "fxPay": "收汇汇率", "fxGain": "汇兑损益",
    "fxBalPanel": "年末外币余额 —— 汇兑评估", "addBal": "＋ 添加余额", "balKind": "类别",
    "balBook": "账面汇率", "balClose": "期末汇率", "balBookAmt": "账面金额", "balCloseAmt": "评估金额", "balGain": "评估损益",
    "expPanel": "出口明细表", "expValue": "折合人民币",
    "closeTitle": "年度决算与风险提示", "closeLead": "三步就能得到<b>利润表和资产负债表汇总</b>，同时提示股东借款与缺票支出风险。",
    "step1": "期末存货", "step2": "往来余额", "step3": "汇兑评估",
    "invTitle": "期末存货明细表", "addItem": "＋ 添加品目", "invOpen": "期初存货", "invBuy": "本期采购（自动）", "invEnd": "期末存货",
    "colItem": "品目", "colSpec": "规格", "colQty": "数量", "colUnit": "单价",
    "invHint": "营业成本 = 期初存货 + 本期采购 − 期末存货，直接进入决算汇总。",
    "apTitle": "应收应付余额确认", "cashOpen": "期初货币资金", "capital": "实收资本",
    "equityHint": "权益推算", "equityHintVal": "未分配利润 = 资产 − 负债 − 实收资本",
    "apKind": "类别", "apMade": "发生额", "apPaid": "已收/已付", "apBalance": "余额", "apConfirm": "确认",
    "apHint": "根据票据匹配自动计算。与客户对账单不一致时，请回到 02 修正匹配。",
    "fxEvalTitle": "汇兑评估入账", "btnClose": "确认决算并生成汇总",
    "isTitle": "利润表（汇总）", "bsTitle": "资产负债表（汇总）", "closeCsv": "决算汇总 CSV",
    "expTitle": "导出与打印", "expLead": "所有 CSV 均为 UTF-8，可直接用 Excel 打开。打印版式适配 A4，在打印对话框选择<b>另存为 PDF</b>即可。",
    "expLedger": "账簿与票据", "bankCsv": "银行流水明细 CSV", "journalCsv": "记账凭证 CSV", "docCsv": "票据汇总 CSV",
    "expPay": "工资、存货、出口", "invCsv": "期末存货明细 CSV", "expCsv": "出口明细 CSV",
    "expPrint": "A4 打印 / PDF", "prVat": "增值税汇总表", "prWh": "个税扣缴汇总", "prClose": "决算汇总表", "prVoucher": "记账凭证",
    "printNote": "打印时选择<b>另存为 PDF</b>即可得到 A4 文件。",
    "backupTitle": "数据备份", "backupBtn": "导出全部数据 JSON", "restoreBtn": "恢复备份",
    "backupHint": "恢复后数据完全一致。备份文件含客户名称与工资数据，请勿外传。",
    "relatedTitle": "相关工具", "relSalary": "薪酬计算器", "relBiz": "经营者工具", "relForms": "表单与电子签", "relExperts": "找专家",
    "disclaimer": "<strong>本工具依据公开税率与您录入的数据做参考测算，不构成税务或会计意见。</strong>实际税额取决于纳税调整、亏损弥补、税收优惠与地方政策。申报须在电子税务局办理，本页不代为申报。股东借款与缺票提示按简易规则判断，可能与主管税务机关认定不同。所有数据只保存在本浏览器。",
    "footerAbout": "洞察简报是以数据与访谈追踪经济、贸易、技术与安全的独立研究媒体，不是注册报刊。",
    "footerSections": "栏目", "footerMedia": "媒体", "footerAboutLink": "关于与编辑原则", "footerTip": "读者线索",
    "footerAd": "广告价格", "footerContact": "联系",
    "footerNotice": "本刊为未注册的独立媒体，文章与图片禁止转载。赞助内容标注为广告。",
}

JA = {
    "title": "中小企業・個人事業主の税務決算ツール — 消費税・法人税・社会保険・源泉徴収 | INSIGHT BRIEF",
    "desc": "通帳と請求書のCSVを読み込むと、証憑の自動照合と仕訳、消費税・法人税の概算、社会保険と源泉徴収の給与計算、輸出免税と為替差損益、期末棚卸から決算要約までをブラウザ内で処理します。",
    "keywords": "消費税 計算, 法人税, 青色申告, 社会保険料, 源泉徴収, 年末調整, 輸出免税, 為替差損益, 期末棚卸, 決算書",
    "ogTitle": "中小企業・個人事業主の税務決算ツール",
    "ogDesc": "消費税・法人税・社会保険・為替・決算をブラウザで。登録不要、データは端末内のみ。",
    "tagline": "独立系の経済・調査リサーチ誌",
    "brandSub": "インサイトブリーフ",
    "slogan": "数字の背景を読む",
    "tip": "情報提供",
    "subscribe": "週次ブリーフ",
    "navAll": "すべて", "navInvest": "調査報道", "navEconomy": "経済・金融", "navTrade": "貿易・資源",
    "navMarket": "市況ボード", "navAI": "AI・テック", "navFire": "消防・安全", "navLotto": "宝くじ生成",
    "navSaju": "四柱推命", "navSalary": "給与計算", "navTax": "税務・決算",
    "navBiz": "事業者ツール", "navForms": "書式・電子署名", "navLaw": "企業法務", "navSeller": "EC事業者ツール", "navExperts": "専門家マッチング", "navSitemapLink": "サイトマップ",
    "navAd": "広告・提携", "navContact": "お問い合わせ",
    "searchPh": "記事を検索", "searchAria": "記事を検索",
    "kicker": "無料ツール · 税務・決算",
    "h1": "中小企業・個人事業主の税務決算ツール",
    "dek": "<b>通帳と請求書のCSV</b>を読み込むだけで、証憑の照合と仕訳、消費税の集計、社会保険と源泉徴収の給与計算、輸出代金の為替差損益、期末棚卸から決算要約までを一画面で処理します。計算も保存も<b>ブラウザ内だけ</b>で行い、結果はCSVかA4印刷で持ち出せます。",
    "b1": "データは外部送信なし", "b2": "localStorageに保存",
    "b3": "6モジュール：消費税・給与・為替・決算", "b4": "CSV取込と手入力",
    "btnSample": "サンプルデータを読む", "btnReset": "すべて初期化", "btnAll": "CSVをまとめて保存",
    "saveNote": "このブラウザに自動保存",
    "noticeTitle": "このツールがすること・しないこと",
    "n1": "税務署・銀行・会計ソフトに<b>接続しません</b>。通帳や請求書システムから出力したCSVを読み込むか、手入力します。",
    "n2": "集計表とCSVは申告や顧問税理士に渡す<b>作業用資料</b>です。申告そのものは行いません。",
    "n3": "データは<b>このブラウザのlocalStorage</b>にのみ保存されます。サイトデータを消すと失われるのでバックアップを取ってください。",
    "n4": "税率は公表された標準税率と簡易ルールです。税務調整・税額控除・地方差は反映していません。",
    "j1": "ダッシュボードとチェック", "j2": "通帳・証憑・仕訳", "j3": "給与と源泉徴収", "j4": "外貨と輸出", "j5": "決算", "j6": "書き出し・印刷",
    "dashTitle": "リアルタイム税務ボード", "dashSub": "LIVE TAX BOARD",
    "dashLead": "通帳と証憑を入れると<b>消費税・当月利益・法人税の概算</b>がすぐに再計算されます。事業形態を変えると税率構造も切り替わります。",
    "entityCorp": "法人（中小）", "entitySole": "個人事業主（青色）",
    "fyLabel": "課税期間", "fy2026": "2026年分", "fy2025": "2025年分", "fy2027": "2027年分",
    "entityNote": "法人 · 法人税 15%（800万円以下）/23.2%",
    "kpiVat": "消費税の納付(還付)見込", "kpiMonth": "今月の営業利益", "kpiYear": "年間の営業利益", "kpiTax": "法人税の見込",
    "sumTitle": "売上・仕入と税額", "basisTitle": "税額の根拠",
    "checkTitle": "期間別チェックリスト", "checkSub": "日次 · 月次 · 四半期 · 年次",
    "checkHint": "チェックすると保存され、進捗が変わります。<b>証憑</b>欄はその期間に用意する書類と様式です。",
    "ledgerTitle": "証憑と通帳の自動照合", "ledgerLead": "<b>金額と日付</b>で通帳と請求書を突き合わせ、入金は売掛金、支払は買掛金と仕訳します。一致しない取引や摘要のない取引は未処理リストにまとめ、ワンクリックで分類できます。",
    "bankPanel": "① 通帳CSV", "bankHint": "ネットバンキングの取引明細CSVをそのまま読み込めます。列名が違っても<b>日付・摘要・入金・出金</b>を判別します。",
    "fileLabel": "ファイルを選択", "addTx": "＋ 取引を追加", "colDate": "日付", "colIn": "入金", "colOut": "出金",
    "colMemo": "摘要", "memoPh": "例：大阪商事 売掛入金", "btnAdd": "追加",
    "evPanel": "② 請求書・証憑CSV",
    "evHint": "請求書システムやカード明細からCSVを出力して読み込みます。種類を選んでからアップロードしてください。",
    "evTypeLabel": "証憑の種類", "evSales": "請求書（売上）", "evPurchase": "請求書（仕入）", "evCard": "カード", "evCash": "領収書",
    "addEv": "＋ 証憑を追加", "colType": "種類", "colPartner": "取引先", "partnerPh": "例：大阪商事",
    "colNet": "税抜金額", "colTax": "消費税", "zeroLabel": "輸出免税に対応する仕入 — 仕入税額控除の対象として印を付ける",
    "btnMatch": "金額と日付で自動照合", "btnSuggest": "勘定科目の推奨を適用",
    "bankLedgerTitle": "通帳取引", "colAccount": "勘定科目", "colDocument": "証憑", "colJournal": "仕訳",
    "unmTitle": "未処理", "unmHint": "証憑がない、または摘要が空の取引です。ボタン一つで科目と仕訳が入ります。",
    "evListTitle": "証憑一覧", "colTotal": "税込合計",
    "journalTitle": "仕訳帳（自動生成）", "drLabel": "借方", "crLabel": "貸方", "colAmount": "金額",
    "catalogTitle": "自動仕訳で使う勘定科目", "catRev": "収益", "catExp": "費用", "catBal": "資産・負債", "catEtc": "その他",
    "catalogNote": "摘要のキーワードから科目を提案します：給油→車両費、飲食→福利厚生費、接待→接待交際費、運賃→運賃、関税→輸入諸費用。",
    "payTitle": "給与・社会保険・源泉徴収", "payLead": "従業員を登録すると<b>厚生年金・健康保険・雇用保険・所得税</b>を計算し、手取りと会社負担、給与台帳と源泉徴収集計を出力します。",
    "setupTitle": "事業所の設定", "injuryLabel": "労災保険の業種", "sizeLabel": "雇用保険の区分", "monthLabel": "対象月",
    "payHint": "厚生年金 9.15%、健康保険 4.99%、雇用保険 0.55%（会社 0.9%）、労災は業種別に会社負担。所得税は給与所得控除と基礎控除を引いた年収から速算表で概算し、12分の1を毎月源泉する簡易計算です。住民税は別途。",
    "empTitle": "従業員・代表者", "addEmp": "＋ 従業員を追加",
    "colName": "氏名", "colRole": "区分", "colBase": "基本給", "colAllow": "課税手当",
    "colNt1": "非課税手当A", "colNt2": "非課税手当B", "colFamily": "扶養人数",
    "empHint": "月額で入力します。非課税手当は通勤手当など、社会保険・所得税の対象外となるものです（上限は概算）。",
    "ledgerPayTitle": "給与台帳", "whTitle": "源泉徴収集計", "csvBtn": "CSVを保存", "printBtn": "印刷 / PDF",
    "whNote": "源泉徴収簿や納付書への転記に使えます。社会保険料は含まれません（別納）。",
    "payCsv": "給与台帳CSV", "salaryLink": "詳しい給与計算",
    "fxTitle": "外貨建取引の精算", "fxLead": "船積日のレートと入金日のレートの差が<b>為替差損益</b>です。期末の外貨残高は決算日のレートで評価し替えます。",
    "fxPanel": "案件別の為替差損益", "addFx": "＋ 輸出を追加",
    "fxDoc": "輸出番号", "fxDate": "船積日", "fxCur": "通貨", "fxAmount": "外貨金額", "fxShip": "計上レート",
    "fxPayDate": "入金日", "fxPay": "入金レート", "fxGain": "為替差損益",
    "fxBalPanel": "期末外貨残高 — 評価替え", "addBal": "＋ 残高を追加", "balKind": "区分",
    "balBook": "帳簿レート", "balClose": "期末レート", "balBookAmt": "帳簿価額", "balCloseAmt": "評価額", "balGain": "評価損益",
    "expPanel": "輸出実績明細", "expValue": "円換算",
    "closeTitle": "決算と税務リスク", "closeLead": "3ステップで<b>損益計算書と貸借対照表の要約</b>ができます。同時に代表者貸付と証憑不足を警告します。",
    "step1": "期末棚卸", "step2": "売掛・買掛の確定", "step3": "外貨評価",
    "invTitle": "期末棚卸明細", "addItem": "＋ 品目を追加", "invOpen": "期首棚卸", "invBuy": "当期仕入（自動）", "invEnd": "期末棚卸",
    "colItem": "品目", "colSpec": "規格", "colQty": "数量", "colUnit": "単価",
    "invHint": "売上原価 = 期首棚卸 + 当期仕入 − 期末棚卸。決算要約にそのまま反映されます。",
    "apTitle": "売掛金・買掛金の残高確定", "cashOpen": "期首現金預金", "capital": "資本金",
    "equityHint": "純資産の算定", "equityHintVal": "繰越利益剰余金 = 資産 − 負債 − 資本金",
    "apKind": "区分", "apMade": "発生額", "apPaid": "回収・支払", "apBalance": "残高", "apConfirm": "確定",
    "apHint": "証憑の照合結果から自動計算します。取引先の残高と違う場合は 02 で照合を直してください。",
    "fxEvalTitle": "外貨評価の反映", "btnClose": "決算を確定して要約を作る",
    "isTitle": "損益計算書（要約）", "bsTitle": "貸借対照表（要約）", "closeCsv": "決算要約CSV",
    "expTitle": "書き出しと印刷", "expLead": "CSVはUTF-8でExcelから直接開けます。印刷はA4一枚に収まる様式で、印刷ダイアログの<b>PDFに保存</b>で書き出せます。",
    "expLedger": "帳簿・証憑", "bankCsv": "通帳明細CSV", "journalCsv": "仕訳帳CSV", "docCsv": "証憑集計CSV",
    "expPay": "給与・棚卸・輸出", "invCsv": "期末棚卸明細CSV", "expCsv": "輸出実績明細CSV",
    "expPrint": "A4印刷 / PDF", "prVat": "消費税集計表", "prWh": "源泉徴収集計", "prClose": "決算要約表", "prVoucher": "仕訳伝票",
    "printNote": "印刷ダイアログで<b>PDFに保存</b>を選ぶとA4のPDFになります。",
    "backupTitle": "バックアップ", "backupBtn": "全データをJSONで保存", "restoreBtn": "バックアップを復元",
    "backupHint": "復元すると元の状態に戻ります。取引先名や給与が含まれるため共有しないでください。",
    "relatedTitle": "関連ツール", "relSalary": "給与計算", "relBiz": "事業者ツール", "relForms": "書式・電子署名", "relExperts": "専門家を探す",
    "disclaimer": "<strong>このツールは公表税率と入力データによる参考計算であり、税務・会計の助言ではありません。</strong>実際の税額は税務調整・税額控除・繰越欠損金・自治体の制度で変わります。申告はe-Tax等で行う必要があり、本ページは申告を行いません。代表者貸付や証憑不足の警告は簡易ルールによるもので、税務署の判断と異なる場合があります。データはこのブラウザにのみ保存されます。",
    "footerAbout": "インサイトブリーフは経済・貿易・テクノロジー・安全をデータと取材で追う独立系リサーチ誌です。新聞としての登録はありません。",
    "footerSections": "セクション", "footerMedia": "メディア", "footerAboutLink": "概要・編集方針", "footerTip": "読者の情報提供",
    "footerAd": "広告料金", "footerContact": "お問い合わせ",
    "footerNotice": "本誌は新聞登録のない独立メディアです。記事・写真の無断転載を禁じます。提供コンテンツは広告と表示します。",
}

DICTS = {"en": EN, "zh": ZH, "ja": JA}


def ldjson(loc, d):
    if loc == "en":
        name = "Small Business Tax & Bookkeeping Tool"
        desc = "US small business tool for sales tax, payroll with FICA and federal withholding, FX gains and year-end closing, all computed in the browser."
    elif loc == "zh":
        name = "小微企业财税自查工具"
        desc = "用于增值税、企业所得税、五险一金、出口退税与年度决算的自查工具，全部在浏览器内计算，数据不上传。"
    else:
        name = "中小企業・個人事業主の税務決算ツール"
        desc = "消費税・法人税・社会保険・源泉徴収・輸出免税・為替差損益・決算要約をブラウザ内で計算するツール。データは送信しません。"
    import json
    doc = {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": name,
        "url": f"{BASE}/{loc}/tax.html",
        "applicationCategory": "BusinessApplication",
        "operatingSystem": "Any",
        "inLanguage": HTML_LANG[loc],
        "description": desc,
        "offers": {"@type": "Offer", "price": "0", "priceCurrency": "USD" if loc == "en" else "CNY" if loc == "zh" else "JPY"},
        "isAccessibleForFree": True,
        "publisher": {"@type": "Organization", "name": "INSIGHT BRIEF", "url": BASE},
    }
    return json.dumps(doc, ensure_ascii=False, indent=2)


TOKEN = re.compile(r"\[\[([A-Za-z0-9_]+)\]\]")
NAV_UL_RE = re.compile(r'<ul class="nav" id="site-nav">.*?</ul>', re.S)


def nav_block(loc):
    """상단 내비는 tools/nav_spec.py 한 곳에서 그립니다(5개 대표 메뉴)."""
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    import nav_spec
    return nav_spec.render(loc, "", ("business", "tax"))  # /en/tax.html 등 같은 언어 폴더 기준


def render(loc):
    d = dict(DICTS[loc])
    d["htmlLang"] = HTML_LANG[loc]
    d["canonical"] = f"{BASE}/{loc}/tax.html"
    d["base"] = BASE
    d["ogLocale"] = OG[loc]
    d["fontLink"] = FONTS[loc]
    d["today"] = TODAY[loc]
    d["ldjson"] = ldjson(loc, d)
    d["onEn"] = ' class="is-on" aria-current="true"' if loc == "en" else ""
    d["onZh"] = ' class="is-on" aria-current="true"' if loc == "zh" else ""
    d["onJa"] = ' class="is-on" aria-current="true"' if loc == "ja" else ""
    d["cur"] = {"en": "USD", "zh": "CNY", "ja": "JPY"}[loc]
    out = TOKEN.sub(lambda m: d.get(m.group(1), ""), TEMPLATE)
    out = NAV_UL_RE.sub(lambda m: nav_block(loc), out, count=1)
    # 공통 써드파티(OneSignal)·플로팅 공유 바
    try:
        sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
        import thirdparty
        out = thirdparty.inject(out, "../", share=True)
    except Exception as e:
        print(f"  ! {loc}/tax.html 공통 스크립트: {e}")
    missing = sorted(set(TOKEN.findall(TEMPLATE)) - set(d.keys()))
    if missing:
        raise SystemExit(f"{loc}: missing strings {missing}")
    return out


def build():
    made = []
    for loc in LANGS:
        out_dir = os.path.join(ROOT, loc)
        os.makedirs(out_dir, exist_ok=True)
        path = os.path.join(out_dir, "tax.html")
        with open(path, "w", encoding="utf-8") as f:
            f.write("<!-- generated by tools/build_tax_pages.py — 국가별 세무·결산 페이지. 직접 수정하지 마세요. -->\n")
            f.write(render(loc))
        made.append(f"{loc}/tax.html")
        print(f"  {loc}/tax.html")
    return made


if __name__ == "__main__":
    print("tax pages (en · zh · ja)")
    build()
