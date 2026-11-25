/* INSIGHT BRIEF — 석유화학 원단위 표 검색·필터
   표 자체는 tools/build_petchem.py 가 정적 HTML 로 넣습니다.
   이 스크립트는 검색어·빠른 필터로 카드를 보이거나 숨기는 일만 합니다. */
(function () {
  'use strict';

  var list = document.getElementById('uc-list');
  if (!list) return;

  var cards = [].slice.call(list.querySelectorAll('.uc-card'));
  var input = document.getElementById('uc-q');
  var clearBtn = document.getElementById('uc-clear');
  var statusEl = document.getElementById('uc-status');
  var emptyEl = document.getElementById('uc-empty');
  var chips = [].slice.call(document.querySelectorAll('[data-uc-filter]'));
  var active = 'all';
  var total = cards.length;
  var timer = null;

  function norm(s) {
    return String(s == null ? '' : s).toLowerCase().replace(/\s+/g, ' ').trim();
  }

  cards.forEach(function (c) {
    c.__q = norm(c.getAttribute('data-search'));
    c.__tags = ' ' + (c.getAttribute('data-tags') || '') + ' ';
    c.__rows = [].slice.call(c.querySelectorAll('.uc-rows li'));
  });

  function chipLabel(id) {
    for (var i = 0; i < chips.length; i++) {
      if (chips[i].getAttribute('data-uc-filter') === id) {
        var clone = chips[i].cloneNode(true);
        var sup = clone.querySelector('.uc-chip-sup');
        if (sup) clone.removeChild(sup);
        return clone.textContent.trim();
      }
    }
    return id;
  }

  function apply() {
    var term = norm(input ? input.value : '');
    var shown = 0;

    cards.forEach(function (c) {
      var okTag = active === 'all' || c.__tags.indexOf(' ' + active + ' ') >= 0;
      var okText = !term || c.__q.indexOf(term) >= 0;
      var ok = okTag && okText;
      c.hidden = !ok;
      if (ok) shown++;
      c.__rows.forEach(function (li) {
        li.classList.toggle('is-hit', !!term && norm(li.textContent).indexOf(term) >= 0);
      });
    });

    if (emptyEl) emptyEl.hidden = shown > 0;

    if (statusEl) {
      var parts = [];
      if (active !== 'all') parts.push(chipLabel(active));
      if (term && input) parts.push('“' + input.value.trim() + '”');
      var head = parts.length ? parts.join(' · ') + ' · ' : '';
      statusEl.textContent = head + shown + '개 품목' + (shown < total ? ' / 전체 ' + total + '개' : '');
    }

    if (clearBtn) clearBtn.hidden = !term;
  }

  function setActive(id) {
    active = id;
    chips.forEach(function (b) {
      var on = b.getAttribute('data-uc-filter') === id;
      b.classList.toggle('is-on', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    apply();
  }

  chips.forEach(function (b) {
    b.setAttribute('aria-pressed', b.getAttribute('data-uc-filter') === active ? 'true' : 'false');
    b.addEventListener('click', function () {
      setActive(b.getAttribute('data-uc-filter'));
    });
  });

  if (input) {
    input.addEventListener('input', function () {
      clearTimeout(timer);
      timer = setTimeout(apply, 120);
    });
    input.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape') {
        input.value = '';
        apply();
      }
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', function () {
      if (input) { input.value = ''; input.focus(); }
      apply();
    });
  }

  apply();

  /* 바깥의 '시황표로' 링크: 일간 탭으로 돌아간 뒤 이동 */
  document.addEventListener('click', function (ev) {
    var el = ev.target;
    while (el && el !== document.body) {
      if (el.getAttribute && el.getAttribute('data-mk-jump')) {
        if (!el.closest || !el.closest('#market-board')) {
          var daily = document.querySelector('[data-mk-tab="daily"]');
          if (daily && !daily.classList.contains('is-active')) {
            if (daily.click) daily.click();
          }
        }
        return;
      }
      el = el.parentNode;
    }
  });

  /* 섹션 바로가기 활성 표시 */
  var jumpLinks = [].slice.call(document.querySelectorAll('.mk-jump a'));
  if (jumpLinks.length && 'IntersectionObserver' in window) {
    var map = {};
    jumpLinks.forEach(function (a) {
      var id = (a.getAttribute('href') || '').replace('#', '');
      if (id) map[id] = a;
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var link = map[en.target.id];
        if (!link) return;
        jumpLinks.forEach(function (a) { a.classList.remove('is-on'); });
        link.classList.add('is-on');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(map).forEach(function (id) {
      var sec = document.getElementById(id);
      if (sec) io.observe(sec);
    });
  }
})();
