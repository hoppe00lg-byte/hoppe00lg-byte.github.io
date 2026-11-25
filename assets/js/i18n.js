/* =========================================================
   INSIGHT BRIEF — 런타임 다국어 보조
   한국어 원본 화면(app.js)이 그리는 문구 가운데 사전에 있는 것을
   대상 언어로 바꿔 줍니다. /en/ /zh/ /ja/ 페이지에서만 동작하고,
   한국어 페이지에서는 언어 전환 링크의 쿼리 유지 기능만 합니다.
   ========================================================= */
(function () {
  'use strict';

  var html = document.documentElement;
  var lang = (html.getAttribute('lang') || 'ko');
  var isKo = /^ko/i.test(lang);
  var I18N = window.__I18N__ || null;

  /* ---- 언어 전환 링크에 현재 조건(?cat=·?q=)을 붙입니다 ---- */
  function propagateQuery() {
    var q = window.location.search || '';
    if (!q) return;
    var links = document.querySelectorAll('.lang-switch a');
    for (var i = 0; i < links.length; i++) {
      var a = links[i];
      var href = a.getAttribute('href') || '';
      if (href.indexOf('#') === 0 || /^https?:/i.test(href)) continue;
      if (href.indexOf('?') === -1) a.setAttribute('href', href + q);
    }
  }
  propagateQuery();

  if (isKo || !I18N) return;

  /* ---- 날짜 서식: app.js 는 Intl.DateTimeFormat('ko-KR') 을 씁니다 ---- */
  if (I18N.locale && window.Intl && Intl.DateTimeFormat) {
    var Orig = Intl.DateTimeFormat;
    var Wrapped = function (locale, opts) {
      if (typeof locale === 'string' && /^ko/i.test(locale)) locale = I18N.locale;
      if (locale === undefined) locale = I18N.locale;
      return new Orig(locale, opts);
    };
    Wrapped.prototype = Orig.prototype;
    Wrapped.supportedLocalesOf = Orig.supportedLocalesOf;
    try { Intl.DateTimeFormat = Wrapped; } catch (e) { /* 무시 */ }
  }

  var MAP = I18N.strings || {};
  var PATS = [];
  (I18N.patterns || []).forEach(function (p) {
    try { PATS.push([new RegExp(p.re), p.rep]); } catch (e) { /* 무시 */ }
  });

  var HANGUL = /[가-힣]/;

  function tr(s) {
    var v = MAP[s];
    if (v != null) return v;
    for (var i = 0; i < PATS.length; i++) {
      if (PATS[i][0].test(s)) return s.replace(PATS[i][0], PATS[i][1]);
    }
    return null;
  }

  /* app.js 처럼 스크립트가 만드는 문장 조각도 같은 사전으로 바꿀 수 있게 노출합니다.
     (예: 그래프 제목·aria-label 처럼 숫자가 섞여 통째로는 사전에 없는 문장) */
  window.IB_T = function (s) {
    if (!s) return s;
    var v = tr(String(s).replace(/\s+/g, ' ').trim());
    return v == null ? s : v;
  };

  var ATTRS = ['placeholder', 'aria-label', 'title', 'alt'];
  var SKIP = { SCRIPT: 1, STYLE: 1, NOSCRIPT: 1, CODE: 1, TEXTAREA: 1 };

  function skipped(node) {
    var p = node.parentNode;
    while (p && p.nodeType === 1) {
      if (SKIP[p.tagName]) return true;
      if (p.isContentEditable) return true;
      /* 도구가 직접 언어를 맞춰 그리는 영역(가사 등)은 건드리지 않습니다. */
      if (p.getAttribute && (p.getAttribute('translate') === 'no' ||
          (p.classList && p.classList.contains('notranslate')))) return true;
      p = p.parentNode;
    }
    return false;
  }

  function doText(node) {
    var raw = node.nodeValue;
    if (!raw || !HANGUL.test(raw)) return;
    var s = raw.replace(/\s+/g, ' ').trim();
    if (!s) return;
    var v = tr(s);
    if (v == null || v === s) return;
    var lead = raw.match(/^\s*/)[0];
    var tail = raw.match(/\s*$/)[0];
    node.nodeValue = lead + v + tail;
  }

  function doAttrs(el) {
    for (var i = 0; i < ATTRS.length; i++) {
      var a = ATTRS[i];
      var v = el.getAttribute(a);
      if (!v || !HANGUL.test(v)) continue;
      var t = tr(v.replace(/\s+/g, ' ').trim());
      if (t != null) el.setAttribute(a, t);
    }
  }

  function pass(root) {
    if (!root || !root.querySelectorAll) return;
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    var n, batch = [];
    while ((n = walker.nextNode())) batch.push(n);
    for (var i = 0; i < batch.length; i++) {
      if (!skipped(batch[i])) doText(batch[i]);
    }
    var els = root.querySelectorAll('[placeholder],[aria-label],[title],[alt]');
    for (var k = 0; k < els.length; k++) doAttrs(els[k]);
  }

  var scheduled = false;
  function schedule() {
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(function () {
      scheduled = false;
      pass(document.body);
    });
  }

  function boot() {
    pass(document.body);
    try {
      new MutationObserver(function (muts) {
        for (var i = 0; i < muts.length; i++) {
          var m = muts[i];
          if (m.type === 'characterData') {
            if (m.target && !skipped(m.target)) doText(m.target);
            continue;
          }
          if (m.addedNodes && m.addedNodes.length) { schedule(); return; }
        }
      }).observe(document.body, { childList: true, subtree: true, characterData: true });
    } catch (e) { /* 무시 */ }
    /* 지연 렌더(시장 데이터·차트) 대비 몇 번 더 훑습니다. */
    [300, 1200, 2600].forEach(function (ms) { setTimeout(schedule, ms); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
