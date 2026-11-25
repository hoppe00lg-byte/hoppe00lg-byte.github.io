/* =========================================================
   INSIGHT BRIEF — 전문가 매칭 (experts.html)
   - 분야 카드 → 접수 폼의 '분야'(select[name=topic]) 자동 선택
   - 사업자 신청 / 파트너 입점 두 폼의 탭
   - 접수 직전에 사업 형태·바우처 같은 부가 항목을 message 앞머리에 붙여
     monetize.js 가 [전문가매칭: …] / [파트너입점: …] 접두어를 만들 수 있게 한다.
   ※ monetize.js 보다 먼저 불러와야 submit 가로채기가 먼저 등록된다.
   ========================================================= */
(function () {
  'use strict';

  var doc = document;
  var $ = function (sel, ctx) { return (ctx || doc).querySelector(sel); };
  var $$ = function (sel, ctx) {
    return Array.prototype.slice.call((ctx || doc).querySelectorAll(sel));
  };

  /* ---------------- 탭 ---------------- */
  var tabs = $$('[data-ex-tab]');
  var panels = $$('[data-ex-panel]');

  function selectTab(name, focusPanel) {
    if (!tabs.length) return;
    tabs.forEach(function (t) {
      var on = t.getAttribute('data-ex-tab') === name;
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.setAttribute('tabindex', on ? '0' : '-1');
    });
    panels.forEach(function (p) {
      var on = p.getAttribute('data-ex-panel') === name;
      p.hidden = !on;
    });
    if (focusPanel) {
      var panel = $('[data-ex-panel="' + name + '"]');
      if (panel) {
        var first = panel.querySelector('select,input,textarea');
        if (first) first.focus({ preventScroll: true });
      }
    }
  }

  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () {
      selectTab(t.getAttribute('data-ex-tab'), false);
    });
    t.addEventListener('keydown', function (e) {
      var k = e.key;
      if (k !== 'ArrowRight' && k !== 'ArrowLeft' && k !== 'Home' && k !== 'End') return;
      e.preventDefault();
      var next = i;
      if (k === 'ArrowRight') next = (i + 1) % tabs.length;
      else if (k === 'ArrowLeft') next = (i - 1 + tabs.length) % tabs.length;
      else if (k === 'Home') next = 0;
      else next = tabs.length - 1;
      selectTab(tabs[next].getAttribute('data-ex-tab'), false);
      tabs[next].focus();
    });
  });

  /* ---------------- 분야 카드 → 폼 ---------------- */
  var cards = $$('[data-ex-field]');
  var topic = $('#ex-topic');
  var picked = $('#ex-picked');
  var pickedLabel = $('#ex-picked-label');
  var formSec = $('#ex-apply');

  function labelOf(select) {
    if (!select || select.selectedIndex < 0) return '';
    var text = (select.options[select.selectedIndex].text || '').trim();
    return text.replace(/^(전문가매칭|파트너입점)\s*:\s*/, '');
  }

  function syncCards() {
    var val = topic ? topic.value : '';
    cards.forEach(function (c) {
      var on = !!val && c.getAttribute('data-ex-field') === val;
      c.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    if (!picked) return;
    if (val && pickedLabel) {
      pickedLabel.textContent = labelOf(topic);
      picked.hidden = false;
    } else if (pickedLabel) {
      picked.hidden = true;
    }
  }

  cards.forEach(function (card) {
    card.addEventListener('click', function () {
      var field = card.getAttribute('data-ex-field');
      selectTab('client', false);
      if (topic) {
        topic.value = field;
        var ev;
        try { ev = new Event('change', { bubbles: true }); } catch (err) { ev = doc.createEvent('HTMLEvents'); ev.initEvent('change', true, false); }
        topic.dispatchEvent(ev);
        topic.focus({ preventScroll: true });
      }
      syncCards();
      if (formSec) formSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  if (topic) {
    topic.addEventListener('change', syncCards);
    syncCards();
  }

  /* ---------------- 선택 표시(라디오·체크) ---------------- */
  $$('.ex-choices, .ex-checks').forEach(function (group) {
    var sync = function () {
      $$('input', group).forEach(function (input) {
        var lab = input.closest('label');
        if (lab) lab.classList.toggle('is-on', !!input.checked);
      });
    };
    group.addEventListener('change', sync);
    sync();
  });

  /* ---------------- 접수 직전 정리 ---------------- */
  var MESSAGES = {
    topic: '분야를 하나 골라 주세요.',
    short: '요청 내용을 10자 이상 적어 주세요. (예: 수입 화물 운임 비교, 법인 전환 후 기장)',
    company: '업체·사무소명을 적어 주세요.',
    profile: '전문 분야와 실적을 15자 이상 적어 주세요.'
  };

  function msgHost(form) {
    return form.querySelector('[data-ib-msg]') || form.parentNode.querySelector('[data-ib-msg]');
  }

  function showMsg(form, text) {
    var host = msgHost(form);
    if (!host) return;
    host.className = 'mo-msg is-err';
    host.textContent = text;
    host.hidden = false;
  }

  function metaLine(form) {
    var kind = form.getAttribute('data-ex-form');
    var parts = [];
    if (kind === 'client') {
      var shape = form.querySelector('input[name="shape"]:checked');
      if (shape) parts.push('사업 형태: ' + (shape.getAttribute('data-label') || shape.value));
    } else {
      var who = form.querySelector('input[name="name"]');
      if (who && (who.value || '').trim()) parts.push('업체: ' + who.value.trim());
      var picked2 = $$('input[name="voucher"]:checked', form).map(function (i) {
        return i.getAttribute('data-label') || i.value;
      });
      parts.push('바우처 수행: ' + (picked2.length ? picked2.join(', ') : '미기재'));
    }
    return parts.length ? parts.join(' · ') + '\n' : '';
  }

  function stripMeta(form, ta) {
    var prev = ta.getAttribute('data-ex-meta');
    if (prev && ta.value.indexOf(prev) === 0) ta.value = ta.value.slice(prev.length);
    ta.removeAttribute('data-ex-meta');
  }

  function validate(form) {
    var kind = form.getAttribute('data-ex-form');
    var sel = form.querySelector('select[name="topic"]');
    if (!sel || !sel.value) return MESSAGES.topic;
    var ta = form.querySelector('textarea[name="message"]');
    var text = ta ? ta.value.trim() : '';
    if (kind === 'client') {
      if (text.length < 10) return MESSAGES.short;
    } else {
      var who = form.querySelector('input[name="name"]');
      if (!who || !who.value.trim()) return MESSAGES.company;
      if (text.length < 15) return MESSAGES.profile;
    }
    return '';
  }

  doc.addEventListener('submit', function (e) {
    var form = e.target;
    if (!form || !form.matches || !form.matches('[data-ib-inquiry][data-ex-form]')) return;

    var ta = form.querySelector('textarea[name="message"]');
    if (ta) stripMeta(form, ta);

    var problem = validate(form);
    if (problem) {
      e.preventDefault();
      e.stopImmediatePropagation();
      showMsg(form, problem);
      var bad = form.querySelector('select[name="topic"]');
      if (problem === MESSAGES.company) bad = form.querySelector('input[name="name"]');
      if (problem === MESSAGES.short || problem === MESSAGES.profile) bad = ta;
      if (bad) bad.focus({ preventScroll: false });
      return;
    }

    if (ta) {
      var meta = metaLine(form);
      if (meta) {
        ta.value = meta + ta.value;
        ta.setAttribute('data-ex-meta', meta);
      }
    }
  }, true);
})();
