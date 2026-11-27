/* =========================================================
   INSIGHT BRIEF — 상단 내비게이션 동작 (5개 대표 메뉴)
   · 클릭 토글 · 바깥 클릭/Esc 닫기 · 마우스 호버(데스크톱)
   · 현재 페이지 표시(.is-active / aria-current) 자동 계산
   · style.css/app.js 의 기존 내비 렌더링을 대체하지 않고, 정적 마크업을 그대로 씁니다.
   ========================================================= */
(function () {
  'use strict';

  /* 파일 → 상위 그룹 / 하위 항목 키 */
  var FILE_MAP = {
    'index.html': ['news', 'all'],
    'article.html': ['news', null],
    'market.html': ['trade', 'market'],
    'global.html': ['trade', 'email'],
    'biz.html': ['trade', null],
    'seller.html': ['trade', 'seller'],
    'exhibitions.html': ['trade', 'exhibitions'],
    'experts.html': ['trade', null],
    'tax.html': ['life', 'tax'],
    'salary.html': ['life', 'salary'],
    'insurance.html': ['life', 'insurance'],
    'law.html': ['life', 'law'],
    'forms.html': ['life', 'forms'],
    'saju.html': ['life', 'saju'],
    'lotto.html': ['life', 'lotto'],
    'sitemap.html': ['guide', 'sitemap'],
    'about.html': ['guide', 'about'],
    'ad.html': ['guide', 'ad'],
    'contact.html': ['guide', 'contact']
  };

  var SUBS = {
    news: ['all', 'ai', 'economy', 'trade', 'fire', 'weekly'],
    trade: ['market', 'portal', 'email', 'trip', 'cost', 'seller', 'exhibitions'],
    life: ['tax', 'salary', 'insurance', 'law', 'forms', 'saju', 'lotto'],
    guide: ['sitemap', 'about', 'ad', 'contact']
  };

  /* 기사 분류(?cat=) → 내비 하위 항목 키 */
  var CAT_SUB = {
    investigative: 'weekly',
    ai: 'ai',
    economy: 'economy',
    trade: 'trade',
    fire: 'fire'
  };

  /* 해시로 바로 열리는 탭 → 내비 하위 항목 키 (각 페이지 JS 가 탭을 엽니다) */
  var HASH_SUB = {
    'global.html': { email: 'email', trip: 'trip', portal: 'portal' },
    'biz.html': { cost: 'cost' }
  };

  function currentFile() {
    var path = window.location.pathname || '/';
    if (/\/a\/[^\/]*\.html$/.test(path)) return path.match(/([^\/]+\.html)$/)[1];
    var m = path.match(/([^\/]+\.html)$/);
    return m ? m[1] : 'index.html';
  }

  function param(name) {
    try { return new URLSearchParams(window.location.search).get(name); }
    catch (e) { return null; }
  }

  function resolve() {
    var file = currentFile();
    var hit = FILE_MAP[file];
    /* 기사별 페이지(/a/xxx.html)는 '뉴스·리포트' 그룹에만 표시합니다. */
    if (/\/a\//.test(window.location.pathname)) hit = ['news', null];
    if (!hit) return { group: null, sub: null };
    var group = hit[0], sub = hit[1];
    if (group === 'news') {
      var cat = param('cat');
      sub = cat && CAT_SUB[cat] ? CAT_SUB[cat] : (param('q') ? null : 'all');
    }
    /* 해시로 들어온 탭(global.html#portal 등)이 있으면 그 항목을 표시합니다. */
    var hash = (window.location.hash || '').replace('#', '');
    var hm = HASH_SUB[file];
    if (hm && hm[hash] && SUBS[group] && SUBS[group].indexOf(hm[hash]) > -1) sub = hm[hash];
    return { group: group, sub: sub };
  }

  function sync() {
    var nav = document.getElementById('site-nav');
    if (!nav) return;
    var cur = resolve();
    var groups = [].slice.call(nav.querySelectorAll('.nav-group'));
    groups.forEach(function (g) {
      var key = g.getAttribute('data-nav');
      var on = key === cur.group;
      var top = g.querySelector('.nav-top');
      if (top) {
        top.classList.toggle('is-active', on);
        if (on && top.tagName === 'A') top.setAttribute('aria-current', 'page');
        else if (top.tagName === 'A') top.removeAttribute('aria-current');
      }
      [].slice.call(g.querySelectorAll('.nav-panel a')).forEach(function (a) {
        var hit = on && a.getAttribute('data-nav-key') === cur.sub;
        a.classList.toggle('is-active', hit);
        if (hit) a.setAttribute('aria-current', 'page');
        else a.removeAttribute('aria-current');
      });
    });
  }

  function finePointer() {
    try {
      return window.matchMedia('(hover:hover) and (pointer:fine)').matches &&
        window.matchMedia('(min-width:901px)').matches;
    } catch (e) { return false; }
  }

  function close(g) {
    g.classList.remove('is-open', 'is-closed');
    var b = g.querySelector('.nav-top[aria-controls]');
    if (b) b.setAttribute('aria-expanded', 'false');
  }

  function bind() {
    var nav = document.getElementById('site-nav');
    if (!nav || nav.getAttribute('data-nav-bound') === '1') return;
    nav.setAttribute('data-nav-bound', '1');
    var groups = [].slice.call(nav.querySelectorAll('.nav-group'));

    groups.forEach(function (g) {
      var btn = g.querySelector('.nav-top[aria-controls]');
      if (!btn) return;

      /* 클릭 = 고정 열기/닫기. 데스크톱의 호버 열림은 CSS(:hover)가 맡고,
         클릭으로 닫았을 때만 .is-closed 로 호버 열림을 막습니다. */
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        var open = g.classList.contains('is-open');
        groups.forEach(function (o) { if (o !== g) close(o); });
        if (open) {
          g.classList.remove('is-open');
          g.classList.add('is-closed');
          btn.setAttribute('aria-expanded', 'false');
        } else {
          g.classList.remove('is-closed');
          g.classList.add('is-open');
          btn.setAttribute('aria-expanded', 'true');
        }
      });

      btn.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') { close(g); btn.focus(); }
      });

      /* 마우스가 떠나면 '닫음' 표시만 폴어, 다음 호버에서 다시 열리게 합니다. */
      g.addEventListener('mouseleave', function () {
        if (finePointer()) g.classList.remove('is-closed');
      });
    });

    document.addEventListener('click', function (e) {
      if (nav.contains(e.target)) return;
      groups.forEach(close);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        var openGroup = null;
        groups.forEach(function (g) { if (g.classList.contains('is-open')) openGroup = g; close(g); });
        if (openGroup) {
          var b = openGroup.querySelector('.nav-top[aria-controls]');
          if (b) b.focus();
        }
      }
    });

    nav.addEventListener('focusout', function () {
      setTimeout(function () {
        groups.forEach(function (g) {
          if (!g.contains(document.activeElement)) close(g);
        });
      }, 40);
    });

    /* 패널 안의 링크로 이동하기 직전에 열린 상태를 정리합니다. */
    [].slice.call(nav.querySelectorAll('.nav-panel a')).forEach(function (a) {
      a.addEventListener('click', function () { groups.forEach(close); });
    });
  }

  function init() {
    sync();
    bind();
    /* 같은 페이지에서 해시만 바뀌어도(탭 이동) 표시를 따라갑니다. */
    window.addEventListener('hashchange', sync);
    /* 화면 폭이 바뀌면 열린 패널을 닫습니다(데스크톱 ↔ 모바일 전환). */
    var last = window.innerWidth;
    window.addEventListener('resize', function () {
      if (Math.abs(window.innerWidth - last) < 24) return;
      last = window.innerWidth;
      var nav = document.getElementById('site-nav');
      if (!nav) return;
      [].slice.call(nav.querySelectorAll('.nav-group')).forEach(close);
    });
  }

  window.IBNav = { sync: sync, init: init };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
