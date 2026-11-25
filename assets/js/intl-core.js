/* =========================================================
   INSIGHT BRIEF — 국가별 현지화 공통 레이어
   /en/ /zh/ /ja/ 페이지에서만 동작합니다(한국어 페이지는 즉시 종료).
   · 통화: 원화 금액을 기준 통화(USD·CNY·JPY)로 바꿔 표기
   · 단가표: 광고·협찬·Pro 구독은 현지 감각에 맞춘 고정 단가 사용
   · 플랫폼: 도구·안내 페이지의 한국 전용 플랫폼 이름을 현지 대표 플랫폼으로
   ========================================================= */
(function () {
  'use strict';

  var html = document.documentElement;
  var raw = (html.getAttribute('lang') || 'ko').toLowerCase();
  var L = /^en/.test(raw) ? 'en' : /^zh/.test(raw) ? 'zh' : /^ja/.test(raw) ? 'ja' : null;
  if (!L) return;
  if (window.IB_INTL) return;

  /* 기준 환율 — 2026-11 무료 공개 호가(동방재부 USD/KRW 1,342 · USD/CNH 6.67 · USD/JPY 159)에서
     잡은 참고값입니다. 표기 금액은 '약' 값이며 실제 청구 통화와 다를 수 있습니다. */
  var CUR = {
    en: { code: 'USD', sym: '$', rate: 1345, loc: 'en-US', name: 'US dollar' },
    zh: { code: 'CNY', sym: '¥', rate: 201, loc: 'zh-CN', name: '人民币' },
    ja: { code: 'JPY', sym: '¥', rate: 8.45, loc: 'ja-JP', name: '円' }
  }[L];

  /* 광고·협찬·구독 단가 — 현지 시장 감각에 맞춘 고정 단가(원화 금액 → 표기) */
  var PRICES = {
    2000: { en: '$1.99', zh: '¥10', ja: '¥220' },              /* Pro 월 구독 */
    30000: { en: '$25', zh: '¥160', ja: '¥3,500' },            /* 배너 주 */
    45000: { en: '$35', zh: '¥230', ja: '¥5,300' },
    60000: { en: '$45', zh: '¥300', ja: '¥7,000' },
    100000: { en: '$79', zh: '¥499', ja: '¥11,800' },          /* 배너 월 */
    150000: { en: '$109', zh: '¥750', ja: '¥17,800' },
    200000: { en: '$149', zh: '¥999', ja: '¥23,700' },
    300000: { en: '$229', zh: '¥1,490', ja: '¥35,500' },
    400000: { en: '$299', zh: '¥1,990', ja: '¥47,000' },
    500000: { en: '$399', zh: '¥2,500', ja: '¥59,000' },
    190000: { en: '$149', zh: '¥950', ja: '¥22,000' },
    490000: { en: '$369', zh: '¥2,450', ja: '¥58,000' },
    800000: { en: '$599', zh: '¥3,980', ja: '¥94,000' }
  };

  function group(n) {
    var s = String(Math.round(Math.abs(n)));
    return s.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  /* 원화 금액 → 기준 통화 문자열 */
  function fmtMoney(krw) {
    var v = Number(krw);
    if (!isFinite(v)) return '';
    var hit = PRICES[Math.round(v)];
    if (hit && hit[L]) return hit[L];
    var local = v / CUR.rate;
    var abs = Math.abs(local);
    var out;
    if (CUR.code === 'USD') {
      if (abs >= 1000) out = String(Math.round(local / 10) * 10);
      else if (abs >= 100) out = String(Math.round(local / 5) * 5);
      else if (abs >= 10) out = String(Math.round(local));
      else out = (Math.round(local * 100) / 100).toFixed(2);
    } else if (CUR.code === 'CNY') {
      if (abs >= 1000) out = String(Math.round(local / 10) * 10);
      else if (abs >= 100) out = String(Math.round(local / 5) * 5);
      else if (abs >= 10) out = String(Math.round(local));
      else out = String(Math.round(local * 10) / 10);
    } else {
      if (abs >= 10000) out = String(Math.round(local / 100) * 100);
      else if (abs >= 1000) out = String(Math.round(local / 10) * 10);
      else out = String(Math.round(local));
    }
    out = group(Number(out));
    return CUR.sym + out;
  }

  /* ---------- 원화 표기 → 기준 통화 표기 ---------- */
  var UNIT = { '만': 1e4, '천': 1e3, '억': 1e8 };
  var CURWORD = '원|won|ウォン|韩元|韓元';
  var RANGE = new RegExp('(\\d[\\d,]*(?:\\.\\d+)?)\\s*(억|만|천)?\\s*[~〜～\\-–]\\s*(\\d[\\d,]*(?:\\.\\d+)?)\\s*(억|만|천)?\\s*(?:' + CURWORD + ')', 'gi');
  var SINGLE = new RegExp('(\\d[\\d,]*(?:\\.\\d+)?)\\s*(억|만|천)?\\s*(?:' + CURWORD + ')', 'gi');

  function toNum(s) { return Number(String(s).replace(/,/g, '')); }

  function moneyText(s) {
    if (!s || !/\d/.test(s)) return s;
    var out = s.replace(RANGE, function (m, a, ua, b, ub) {
      var av = toNum(a) * (UNIT[ua] || 1), bv = toNum(b) * (UNIT[ub] || 1);
      return fmtMoney(av) + '–' + fmtMoney(bv);
    });
    out = out.replace(SINGLE, function (m, a, u) {
      return fmtMoney(toNum(a) * (UNIT[u] || 1));
    });
    return out;
  }

  /* ---------- 한국 전용 플랫폼 → 현지 대표 플랫폼 ----------
     도구·안내 페이지에서만 씁니다. 제휴 고지(links)와 기사 본문은 실제 사실을
     바꾸면 안 되므로 대상에서 뺍니다. */
  var PLATFORM = {
    en: [
      ['추천 상품·용품', 'Recommended products'],
      ['스마트스토어·쿠팡', 'Amazon · Etsy'],
      ['스마트스토어', 'Amazon'],
      ['쿠팡 파트너스', 'Amazon Associates'],
      ['쿠팡', 'Amazon'],
      ['네이버 블로그', 'Blogger'],
      ['네이버', 'Google'],
      ['카카오톡', 'WhatsApp'],
      ['당근마켓', 'Facebook Marketplace'],
      ['11번가', 'eBay'],
      ['지마켓', 'eBay'],
      ['토스', 'Stripe'],
      ['아임웹', 'Shopify'],
      ['카페24', 'Shopify']
    ],
    zh: [
      ['추천 상품·용품', '推荐商品·用品'],
      ['스마트스토어·쿠팡', '淘宝 · 京东'],
      ['스마트스토어', '淘宝店'],
      ['쿠팡 파트너스', '淘宝联盟'],
      ['쿠팡', '淘宝'],
      ['네이버 블로그', '百度空间'],
      ['네이버', '百度'],
      ['카카오톡', '微信'],
      ['당근마켓', '闲鱼'],
      ['11번가', '京东'],
      ['지마켓', '京东'],
      ['토스', '支付宝'],
      ['아임웹', '有赞'],
      ['카페24', '有赞']
    ],
    ja: [
      ['추천 상품·용품', 'おすすめ商品・用品'],
      ['스마트스토어·쿠팡', '楽天 · Amazon'],
      ['스마트스토어', '楽天'],
      ['쿠팡 파트너스', 'Amazonアソシエイト'],
      ['쿠팡', '楽天'],
      ['네이버 블로그', 'Amebaブログ'],
      ['네이버', 'Google'],
      ['카카오톡', 'LINE'],
      ['당근마켓', 'メルカリ'],
      ['11번가', 'Yahoo!ショッピング'],
      ['지마켓', 'Yahoo!ショッピング'],
      ['토스', 'Stripe'],
      ['아임웹', 'BASE'],
      ['카페24', 'BASE']
    ]
  }[L];

  var PLATFORM_PAGES = /(biz|seller|experts|about|forms|lotto|saju|salary)\.html$/;
  var usePlatform = PLATFORM_PAGES.test(location.pathname);

  function platformText(s) {
    if (!usePlatform || !s) return s;
    for (var i = 0; i < PLATFORM.length; i++) {
      if (s.indexOf(PLATFORM[i][0]) >= 0) s = s.split(PLATFORM[i][0]).join(PLATFORM[i][1]);
    }
    return s;
  }

  function convert(s) { return platformText(moneyText(s)); }

  /* ---------- DOM 반영 ---------- */
  var HANGUL = /[가-힣]/;
  var MONEY = /\d[\d,]*(?:\.\d+)?\s*(?:억|만|천)?\s*(?:원|won|ウォン|韩元|韓元)/i;
  var ATTRS = ['placeholder', 'aria-label', 'title', 'alt'];
  var SKIP = { SCRIPT: 1, STYLE: 1, NOSCRIPT: 1, CODE: 1, INPUT: 1 };

  function skipNode(node) {
    var p = node.parentNode;
    while (p && p.nodeType === 1) {
      if (SKIP[p.tagName]) return true;
      /* 입력 중인 textarea 는 건드리지 않습니다(서식 예시 문구는 바꿉니다). */
      if (p.tagName === 'TEXTAREA' && document.activeElement === p) return true;
      p = p.parentNode;
    }
    return false;
  }

  var busy = false;

  function pass(root) {
    if (!root || !root.querySelectorAll) return;
    busy = true;
    try {
      var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
      var nodes = [], n;
      while ((n = walker.nextNode())) nodes.push(n);
      for (var i = 0; i < nodes.length; i++) {
        var t = nodes[i];
        if (skipNode(t)) continue;
        var v = t.nodeValue;
        if (!v || !MONEY.test(v)) continue;
        var converted = convert(v);
        if (converted !== v) t.nodeValue = converted;
      }
      var els = root.querySelectorAll('[placeholder],[aria-label],[title],[alt]');
      for (var k = 0; k < els.length; k++) {
        for (var a = 0; a < ATTRS.length; a++) {
          var val = els[k].getAttribute(ATTRS[a]);
          if (!val || !MONEY.test(val)) continue;
          var cv = convert(val);
          if (cv !== val) els[k].setAttribute(ATTRS[a], cv);
        }
      }
      /* 플랫폼 이름만 있는 문장은 통화 변경 없이 바꿉니다. */
      if (usePlatform) {
        var w2 = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
        var arr = [];
        while ((w2.nextNode())) arr.push(w2.currentNode);
        for (var j = 0; j < arr.length; j++) {
          var nd = arr[j];
          if (skipNode(nd) || !HANGUL.test(nd.nodeValue || '')) continue;
          var pv = platformText(nd.nodeValue);
          if (pv !== nd.nodeValue) nd.nodeValue = pv;
        }
      }
    } finally {
      busy = false;
    }
  }

  var scheduled = false;
  function schedule() {
    if (scheduled || busy) return;
    scheduled = true;
    window.requestAnimationFrame(function () { scheduled = false; pass(document.body); });
  }

  function boot() {
    pass(document.body);
    /* 창업·사업성 도구의 마켓 수수료 프리셋은 그 나라 마켓의 실제 수수료로 바꿉니다.
       (계산기 내부 값은 biz.js 의 FEE_PRESETS 가 같은 숫자를 씁니다) */
    if (/(^|\/)biz\.html$/.test(location.pathname)) {
      var feeBtn = document.querySelector('[data-fee="coupang"]');
      if (feeBtn) {
        feeBtn.textContent = { en: 'Amazon 15%', zh: '天猫 5%', ja: 'Amazon.co.jp 15%' }[L];
      }
    }
    try {
      new MutationObserver(function (muts) {
        if (busy) return;
        for (var i = 0; i < muts.length; i++) {
          if (muts[i].type === 'childList' || muts[i].type === 'characterData') { schedule(); return; }
        }
      }).observe(document.body, { childList: true, subtree: true, characterData: true });
    } catch (e) { /* noop */ }
    [400, 1400, 3000].forEach(function (ms) { setTimeout(schedule, ms); });
  }

  window.IB_INTL = {
    lang: L, cur: CUR, fmtMoney: fmtMoney, moneyText: moneyText, convert: convert,
    group: group, pass: pass,
    /* 공통 문구 */
    t: {
      approx: { en: 'approx.', zh: '约', ja: '約' }[L],
      refRate: {
        en: 'Converted at a reference rate (US$1 ≈ 1,345 KRW). Local pricing is indicative.',
        zh: '按参考汇率换算（1美元 ≈ 1,345韩元），实际报价以人民币为准。',
        ja: '参考レート（1米ドル ≈ 1,345ウォン）で換算した目安です。実際のご請求は円建てです。'
      }[L]
    }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
