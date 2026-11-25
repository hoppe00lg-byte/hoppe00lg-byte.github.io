/* INSIGHT BRIEF — 산업 계통도 탭 (석유화학 / 철강·비철 / 농산품 / 에너지·배터리·귀금속)
   패널 자체는 tools/build_petchem.py 가 정적 HTML 로 넣습니다.
   이 스크립트는 탭 선택, 해시(#steel 등) 연결, 그리고 계통도의 「시세」 배지를 눌렀을 때
   시황표(일간)의 그 품목 행으로 이동하는 일을 맡습니다. */
(function () {
  'use strict';

  /* ------------------------------------------------------------ 시세 배지 → 시황표 이동
     배지(button.pc-q)와 품목 칩(span.pc-chip)에 붙은 data-mk-code 를 읽어,
     일간 탭을 켠 뒤 그 코드의 행·카드로 스크롤하고 2초간 강조합니다. */
  var FLASH_MS = 2000;
  var flashTimer = null;

  function attrSel(code) {
    return String(code).replace(/["\\]/g, '\\$&');
  }

  function dailyPanel() {
    return document.getElementById('mk-panel-daily');
  }

  function activateDaily() {
    var tab = document.querySelector('#market-board [data-mk-tab="daily"]');
    if (!tab) return false;
    if (tab.getAttribute('aria-selected') !== 'true') tab.click();
    var panel = dailyPanel();
    if (panel && panel.hasAttribute('hidden')) return false;
    return !!panel;
  }

  function findQuote(code) {
    var panel = dailyPanel();
    if (!panel) return null;
    var list = panel.querySelectorAll('[data-mk-code="' + code + '"]');
    for (var i = 0; i < list.length; i++) {
      var el = list[i];
      /* 표 행이 있으면 행을, 없으면 유가·환율 카드를 씁니다. */
      if (el.tagName === 'TR') return el;
    }
    return list.length ? list[0] : null;
  }

  function flash(el) {
    [].slice.call(document.querySelectorAll('.is-flash')).forEach(function (n) { n.classList.remove('is-flash'); });
    if (!el) return;
    void el.offsetWidth; /* 같은 요소를 다시 눌러도 애니메이션이 다시 돌게 */
    el.classList.add('is-flash');
    if (flashTimer) clearTimeout(flashTimer);
    flashTimer = setTimeout(function () {
      el.classList.remove('is-flash');
      flashTimer = null;
    }, FLASH_MS);
  }

  function goToQuote(code, tries) {
    var left = tries == null ? 15 : tries;
    if (!activateDaily()) {
      /* 시황 데이터가 아직 안 왔으면 잠깐 기다렸다 다시 시도합니다. */
      if (left > 0) { setTimeout(function () { goToQuote(code, left - 1); }, 200); }
      return;
    }
    var el = findQuote(code);
    if (!el) {
      var top = document.getElementById('market-quotes');
      if (top) top.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    flash(el);
  }

  document.addEventListener('click', function (ev) {
    var t = ev.target;
    if (!t || !t.closest) return;
    var hit = t.closest('.pc-q[data-mk-code], .pc-chip[data-mk-code]');
    if (!hit) return;
    var code = hit.getAttribute('data-mk-code');
    if (!code) return;
    ev.preventDefault();
    goToQuote(attrSel(code));
  });

  var tablist = document.querySelector('.fl-tabs');
  if (!tablist) return;

  var tabs = [].slice.call(tablist.querySelectorAll('[data-fl-tab]'));
  var panels = [].slice.call(document.querySelectorAll('[data-fl-panel]'));
  if (!tabs.length || !panels.length) return;

  function byId(id) {
    for (var i = 0; i < panels.length; i++) {
      if (panels[i].getAttribute('data-fl-panel') === id) return panels[i];
    }
    return null;
  }

  function activate(id, focusTab) {
    var found = false;
    tabs.forEach(function (t) {
      var on = t.getAttribute('data-fl-tab') === id;
      t.classList.toggle('is-on', on);
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.setAttribute('tabindex', on ? '0' : '-1');
      if (on) {
        found = true;
        if (focusTab) t.focus();
      }
    });
    if (!found) return false;
    panels.forEach(function (p) {
      if (p.getAttribute('data-fl-panel') === id) p.removeAttribute('hidden');
      else p.setAttribute('hidden', '');
    });
    return true;
  }

  function fromHash() {
    var id = (window.location.hash || '').replace(/^#/, '');
    if (!id) return false;
    if (!byId(id)) return false;
    if (!activate(id)) return false;
    var panel = byId(id);
    var jump = function () { if (panel) panel.scrollIntoView({ block: 'start' }); };
    jump();
    window.requestAnimationFrame(jump);
    setTimeout(jump, 350);
    return true;
  }

  tabs.forEach(function (t) {
    t.addEventListener('click', function () {
      activate(t.getAttribute('data-fl-tab'));
    });
    t.addEventListener('keydown', function (ev) {
      var i = tabs.indexOf(t);
      var next = null;
      if (ev.key === 'ArrowRight') next = tabs[(i + 1) % tabs.length];
      else if (ev.key === 'ArrowLeft') next = tabs[(i - 1 + tabs.length) % tabs.length];
      else if (ev.key === 'Home') next = tabs[0];
      else if (ev.key === 'End') next = tabs[tabs.length - 1];
      if (!next) return;
      ev.preventDefault();
      activate(next.getAttribute('data-fl-tab'), true);
    });
  });

  window.addEventListener('hashchange', fromHash);
  fromHash();
  if (window.addEventListener) window.addEventListener('load', fromHash);
})();
