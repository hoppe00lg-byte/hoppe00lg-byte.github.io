/* =========================================================
   법률·판례 정보 리포트 (law.html) — 화면 로직
   · 경로(/en/ /zh/ /ja/)에 따라 국가별 데이터로 자동 전환됩니다.
   · 없는 판례·조문을 만들지 않습니다. 판례는 공식 검색으로만 연결합니다.
   ========================================================= */
(function () {
  'use strict';

  var path = location.pathname || '/';
  var LOCALE = /^\/en\//.test(path) ? 'en' : /^\/zh\//.test(path) ? 'zh' : /^\/ja\//.test(path) ? 'ja' : 'ko';
  var DB = (window.LAW_DB || {})[LOCALE] || (window.LAW_DB || {}).ko;
  if (!DB) return;

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };

  var LAW_IDS = {
    ja: {
      '民法': '129AC0000000089', '労働基準法': '322AC0000000049', '借地借家法': '403AC0000000090',
      '民事訴訟法': '408AC0000000109', '弁護士法': '324AC1000000205'
    }
  };

  function statuteUrl(st) {
    if (LOCALE === 'ko') {
      var p = String(st.art).split('의');
      var jo = '제' + p[0] + '조' + (p[1] ? '의' + p[1] : '');
      return 'https://www.law.go.kr/법령/' + encodeURIComponent(st.law) + '/' + encodeURIComponent(jo);
    }
    if (LOCALE === 'ja') {
      var id = LAW_IDS.ja[st.law];
      return id ? 'https://laws.e-gov.go.jp/law/' + id : 'https://laws.e-gov.go.jp/';
    }
    if (LOCALE === 'zh') return 'https://flk.npc.gov.cn/';
    var n = String(st.art).replace(/[^0-9\-]/g, '');
    if (st.law === 'UCC Article 2') return 'https://www.law.cornell.edu/ucc/2/' + n;
    if (st.law === 'FLSA') return 'https://www.law.cornell.edu/uscode/text/29/' + n;
    return 'https://www.law.cornell.edu/';
  }

  function caseSearchUrl(q) {
    if (LOCALE === 'ko') {
      return 'https://www.law.go.kr/LSW/precSc.do?menuId=6&subMenuId=42&tabMenuId=93&query=' + encodeURIComponent(q);
    }
    if (LOCALE === 'en') return 'https://www.courtlistener.com/?q=' + encodeURIComponent(q);
    if (LOCALE === 'zh') return 'https://wenshu.court.gov.cn/';
    return 'https://www.courts.go.jp/';
  }

  function searchNeedsCopy() { return LOCALE === 'zh' || LOCALE === 'ja'; }

  /* ---------------- toast ---------------- */
  var toastEl, toastTimer;
  function toast(msg) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'lw-toast';
      toastEl.setAttribute('role', 'status');
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    toastEl.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('is-on'); }, 2600);
  }

  function copyText(text, okMsg) {
    var done = function () { toast(okMsg); };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, function () { legacyCopy(text, done); });
    } else {
      legacyCopy(text, done);
    }
  }
  function legacyCopy(text, done) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch (e) {}
    document.body.removeChild(ta);
    done();
  }

  /* ---------------- area state ---------------- */
  var state = { areaId: (DB.areas[0] || {}).id, keywords: [], report: null, egIndex: {} };

  function areaById(id) {
    return DB.areas.filter(function (a) { return a.id === id; })[0] || DB.areas[0];
  }
  function statutesFor(ids) {
    var map = {};
    DB.statutes.forEach(function (s) { map[s.id] = s; });
    return (ids || []).map(function (id) { return map[id]; }).filter(Boolean);
  }

  /* ---------------- keyword extraction ---------------- */
  function norm(s) { return String(s || '').toLowerCase(); }

  function extractKeywords(text) {
    var t = norm(text);
    if (!t.trim()) return { hits: [], scores: {} };
    var found = [];
    var scores = {};
    DB.areas.forEach(function (a) {
      scores[a.id] = 0;
      (a.keywords || []).forEach(function (k) {
        var kk = norm(k);
        if (!kk) return;
        var idx = t.indexOf(kk);
        if (idx < 0) return;
        var count = 0, from = 0;
        while (idx >= 0) { count++; from = idx + kk.length; idx = t.indexOf(kk, from); }
        scores[a.id] += count * (kk.length > 3 ? 2 : 1);
        if (found.indexOf(k) < 0) found.push(k);
      });
    });
    // 금액·기간 단서는 항상 쟁점으로 표시
    var units = LOCALE === 'ko' ? /(\d[\d,]*(?:\.\d+)?\s*(?:만\s*원|억\s*원|원|만원|억원))/g
      : LOCALE === 'en' ? /(\$\s?\d[\d,]*(?:\.\d+)?)/g
      : LOCALE === 'ja' ? /(\d[\d,]*\s*(?:万円|億円|円))/g
      : /(\d[\d,]*\s*(?:万元|亿元|元))/g;
    var m; var amounts = [];
    while ((m = units.exec(text)) !== null && amounts.length < 3) amounts.push(m[1].replace(/\s+/g, ''));
    var dates = (text.match(/\d{4}\s*[년.\-\/]\s*\d{1,2}\s*[월.\-\/]?/g) || []).slice(0, 3);
    return { hits: found.slice(0, 12), scores: scores, amounts: amounts, dates: dates };
  }

  function bestArea(scores, fallback) {
    var best = null, bestScore = 0;
    Object.keys(scores || {}).forEach(function (k) {
      if (scores[k] > bestScore) { bestScore = scores[k]; best = k; }
    });
    return bestScore > 0 ? best : fallback;
  }

  /* ---------------- render: areas ---------------- */
  function renderAreas() {
    var box = $('#lw-areas');
    if (!box) return;
    box.innerHTML = DB.areas.map(function (a) {
      return '<button type="button" class="lw-area" data-area="' + a.id + '" aria-pressed="' + (a.id === state.areaId) + '">' +
        '<span class="no">' + esc(a.no) + '</span>' +
        '<b>' + esc(a.name) + '</b>' +
        '<p>' + esc(a.desc) + '</p>' +
        '<span class="kw">' + a.kw.slice(0, 4).map(function (k) { return '<i>' + esc(k) + '</i>'; }).join('') + '</span>' +
        '</button>';
    }).join('');
  }

  function setArea(id, opts) {
    state.areaId = id;
    $$('#lw-areas .lw-area').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.getAttribute('data-area') === id));
    });
    // 예시 버튼 라벨 갱신
    var a = areaById(id);
    var egBox = $('#lw-eg');
    if (egBox) {
      egBox.innerHTML = (a.examples || []).map(function (ex, i) {
        return '<button type="button" data-eg="' + i + '">' + esc(DB.ui.example) + ' · ' + esc(ex.t) + '</button>';
      }).join('');
    }
    if (opts && opts.scroll) {
      var rep = $('#lw-report');
      if (rep && rep.classList.contains('is-on')) buildReport();
    }
  }

  /* ---------------- render: report ---------------- */
  function currentInput() {
    var ta = $('#lw-case');
    return ta ? ta.value : '';
  }

  function renderChips(ex) {
    var box = $('#lw-chips');
    if (!box) return;
    var parts = [];
    (ex.hits || []).forEach(function (k) { parts.push('<span class="lw-chip">' + esc(k) + '</span>'); });
    (ex.amounts || []).forEach(function (k) { parts.push('<span class="lw-chip plain">' + esc(k) + '</span>'); });
    (ex.dates || []).forEach(function (k) { parts.push('<span class="lw-chip plain">' + esc(k) + '</span>'); });
    box.innerHTML = parts.join('');
  }

  function statuteCard(st, open) {
    var url = statuteUrl(st);
    return '<details class="lw-law"' + (open ? ' open' : '') + '>' +
      '<summary><span class="tag">' + esc(st.law) + '</span>' +
      '<span class="ttl">' + esc(st.art) + ' ' + esc(st.t) +
      '<span>' + esc((DB.laws[st.law] || {}).full || st.law) + '</span></span></summary>' +
      '<div class="body">' + esc(st.b) +
      '<div class="links"><a href="' + esc(url) + '" target="_blank" rel="noopener">' + esc(DB.ui.openLaw) + ' ↗</a>' +
      '<a href="' + esc(caseSearchUrl(st.art + ' ' + st.t)) + '" target="_blank" rel="noopener">' + esc(DB.ui.openCourt) + ' ↗</a></div>' +
      '<p class="note">' + esc(DB.ui.note) + '</p></div></details>';
  }

  function buildReport() {
    var text = currentInput();
    var ex = extractKeywords(text);
    state.keywords = ex.hits;
    renderChips(ex);

    if (!text.trim()) { toast(DB.ui.emptyArea); return; }
    var area = areaById(state.areaId);
    var scored = bestArea(ex.scores, state.areaId);
    // 사용자가 분야를 고른 뒤 입력한 경우: 입력이 다른 분야를 강하게 가리키면 그 분야를 안내
    var matchedArea = scored;
    var useArea = state.areaId;
    if (matchedArea && matchedArea !== state.areaId) {
      setArea(matchedArea);
      useArea = matchedArea;
      toast(DB.ui.matched + ': ' + areaById(matchedArea).name);
    }
    area = areaById(useArea);

    var statutes = statutesFor(area.statutes);
    var summary = text.replace(/\s+/g, ' ').trim();
    var shortSummary = summary.length > 240 ? summary.slice(0, 240) + '…' : summary;

    var rep = {
      areaName: area.name,
      summary: shortSummary,
      hitKeywords: ex.hits.slice(0, 8),
      amounts: ex.amounts || [],
      issues: area.issues || [],
      statutes: statutes,
      checks: area.checks || [],
      steps: area.steps || [],
      forms: area.forms || [],
      search: area.search || [],
      generatedAt: new Date()
    };
    state.report = rep;

    var html = '';
    html += '<div class="lw-rhead">' +
      '<div><span class="k">CASE REPORT · ' + esc(area.no) + '</span>' +
      '<h2>' + esc(area.name) + '</h2></div>' +
      '<p class="who">' + esc(DB.ui.matched) + ' · ' + esc(area.short) + '</p>' +
      '</div><div class="lw-rbody">';

    // 1
    html += '<section class="lw-part"><span class="lw-pnum">01 · SUMMARY</span><h3>' + esc(DB.ui.part1) + '</h3>' +
      '<p>' + esc(rep.summary) + '</p>' +
      (rep.hitKeywords.length ? '<div class="lw-chips">' + rep.hitKeywords.map(function (k) {
        return '<span class="lw-chip">' + esc(k) + '</span>';
      }).join('') + '</div>' : '') +
      '<ul>' + rep.issues.map(function (i) { return '<li>' + esc(i) + '</li>'; }).join('') + '</ul></section>';

    // 2
    html += '<section class="lw-part"><span class="lw-pnum">02 · STATUTES</span><h3>' + esc(DB.ui.part2) + '</h3>' +
      '<p>' + esc(DB.ui.libraryHint) + '</p>' +
      statutes.slice(0, 12).map(function (s, i) { return statuteCard(s, i < 2); }).join('') + '</section>';

    // 3
    html += '<section class="lw-part"><span class="lw-pnum">03 · STANDARDS</span><h3>' + esc(DB.ui.part3) + '</h3>' +
      '<table class="lw-check"><thead><tr><th>' + (LOCALE === 'ko' ? '확인 포인트' : LOCALE === 'ja' ? '確認項目' : LOCALE === 'zh' ? '核查要点' : 'Checkpoint') +
      '</th><th>' + (LOCALE === 'ko' ? '판단 기준' : LOCALE === 'ja' ? '判断基準' : LOCALE === 'zh' ? '判断标准' : 'Standard') + '</th></tr></thead><tbody>' +
      rep.checks.map(function (c) { return '<tr><td>' + esc(c[0]) + '</td><td>' + esc(c[1]) + '</td></tr>'; }).join('') +
      '</tbody></table>' +
      '<div class="lw-tools">' + rep.search.map(function (q) {
        return '<a href="' + esc(caseSearchUrl(q)) + '" target="_blank" rel="noopener"><i>↗</i> ' + esc(q) + '</a>';
      }).join('') + '</div></section>';

    // 4
    html += '<section class="lw-part"><span class="lw-pnum">04 · PROCEDURE</span><h3>' + esc(DB.ui.part4) + '</h3>' +
      '<div class="lw-steps">' + rep.steps.map(function (s) {
        return '<div class="lw-step"><span class="n">STEP ' + esc(s.n) + '</span><b>' + esc(s.t) + '</b><p>' + esc(s.d) + '</p>' +
          (s.tip ? '<p class="tip">' + esc(s.tip) + '</p>' : '') + '</div>';
      }).join('') + '</div>';
    if (rep.forms.length) {
      html += '<div class="lw-tools">' + rep.forms.map(function (f) {
        return '<a href="' + esc(f[1]) + '">' + esc(f[0]) + ' <i>↗</i></a>';
      }).join('') + '</div>';
    }
    html += '<p class="lw-part" style="border:0;padding-bottom:0"><b>' + esc(DB.ui.guideline) + '</b></p></section>';

    html += '<div class="lw-rfoot"><b>' + esc(DB.ui.footerNote) + '</b><br>' +
      (DB.laws && Object.keys(DB.laws).length ? esc(DB.officialName) + ' · ' + esc(DB.courtName) : '') + '</div>';
    html += '</div>';

    var box = $('#lw-report');
    box.innerHTML = html;
    box.classList.add('is-on');
    var top = box.getBoundingClientRect().top + window.pageYOffset - 70;
    window.scrollTo({ top: top, behavior: 'smooth' });
  }

  /* ---------------- markdown ---------------- */
  function reportMarkdown() {
    var r = state.report;
    if (!r) return '';
    var L = [];
    L.push('# ' + r.areaName + ' — ' + DB.ui.tabReport);
    L.push('');
    L.push('## 1. ' + DB.ui.part1);
    L.push(r.summary);
    if (r.hitKeywords.length) L.push('\n' + DB.ui.kwTitle + ': ' + r.hitKeywords.join(', '));
    r.issues.forEach(function (i) { L.push('- ' + i); });
    L.push('');
    L.push('## 2. ' + DB.ui.part2);
    r.statutes.slice(0, 12).forEach(function (s) {
      L.push('### ' + s.law + ' ' + s.art + ' ' + s.t);
      L.push('> ' + s.b);
      L.push(DB.ui.openLaw + ': ' + statuteUrl(s));
      L.push('');
    });
    L.push('## 3. ' + DB.ui.part3);
    r.checks.forEach(function (c) { L.push('- **' + c[0] + '** — ' + c[1]); });
    L.push('');
    L.push('## 4. ' + DB.ui.part4);
    r.steps.forEach(function (s) { L.push(s.n + '. **' + s.t + '** — ' + s.d + (s.tip ? ' (' + s.tip + ')' : '')); });
    L.push('');
    L.push('---');
    L.push(DB.ui.footerNote);
    return L.join('\n');
  }

  /* ---------------- library ---------------- */
  function renderLibrary(filter) {
    var box = $('#lw-library');
    if (!box) return;
    var q = norm(filter || '').trim();
    var groups = {};
    DB.statutes.forEach(function (s) {
      if (q) {
        var hay = norm(s.law + ' ' + s.art + ' ' + s.t + ' ' + s.b);
        if (hay.indexOf(q) < 0) return;
      }
      (groups[s.law] = groups[s.law] || []).push(s);
    });
    var keys = Object.keys(groups);
    if (!keys.length) {
      box.innerHTML = '<p class="lw-sbox" style="border:0;background:none;padding:16px 0">' + esc(DB.ui.emptyArea) + '</p>';
      return;
    }
    box.innerHTML = keys.map(function (law) {
      var meta = DB.laws[law] || {};
      return '<section class="lw-lib-group"><h3>' + esc(meta.full || law) +
        '<small>' + esc(meta.eff || '') + '</small></h3>' +
        '<p>' + groups[law].length + ' ' + (LOCALE === 'ko' ? '개 조문' : LOCALE === 'ja' ? '条' : LOCALE === 'zh' ? '条' : 'provisions') + ' · ' +
        '<a href="' + esc(meta.url || DB.official) + '" target="_blank" rel="noopener" style="color:var(--accent-deep);font-weight:600">' + esc(DB.ui.openLaw) + ' ↗</a></p>' +
        groups[law].map(function (s) { return statuteCard(s, false); }).join('') + '</section>';
    }).join('');
  }

  /* ---------------- search tab ---------------- */
  function renderSearch() {
    var box = $('#lw-searchgrid');
    if (!box) return;
    var head = '<div class="lw-sbox"><h3>' + esc(DB.ui.courtName) + '</h3><p>' + esc(DB.ui.courtHint) + '</p>' +
      '<div class="lw-kw"><a href="' + esc(DB.court) + '" target="_blank" rel="noopener">' + esc(DB.ui.openCourt) + ' ↗</a>' +
      '<a href="' + esc(DB.official) + '" target="_blank" rel="noopener">' + esc(DB.ui.openLaw) + ' ↗</a></div></div>';
    var cards = DB.areas.map(function (a) {
      return '<div class="lw-sbox"><h3>' + esc(a.name) + '</h3><p>' + esc(a.short) + '</p><div class="lw-kw">' +
        (a.search || []).map(function (q) {
          if (searchNeedsCopy()) {
            return '<button type="button" data-copy-kw="' + esc(q) + '">' + esc(q) + ' ⧉</button>';
          }
          return '<a href="' + esc(caseSearchUrl(q)) + '" target="_blank" rel="noopener">' + esc(q) + '</a>';
        }).join('') + '</div></div>';
    }).join('');
    box.innerHTML = head + cards;
    $$('#lw-searchgrid [data-copy-kw]').forEach(function (b) {
      b.addEventListener('click', function () {
        copyText(b.getAttribute('data-copy-kw'), (LOCALE === 'ko' ? '키워드를 복사했습니다. 검색창에 붙여넣으세요.' : 'Keyword copied — paste it into the search box.'));
      });
    });
  }

  /* ---------------- guide tab ---------------- */
  function renderGuide() {
    var box = $('#lw-guide');
    if (!box) return;
    var g = DB.guide;
    box.innerHTML =
      '<div>' +
        '<div class="lw-card"><p style="font-size:13.5px;color:var(--ink-2)">' + g.lead + '</p>' +
        '<ol>' + g.steps.map(function (s) { return '<li>' + s + '</li>'; }).join('') + '</ol></div>' +
        '<div class="lw-card"><h3>' + esc(g.apiTitle) + '</h3><div class="lw-code">' + esc(g.api).replace(/\{OC\}/g, '<b>{OC}</b>') + '</div>' +
        '<p class="lw-cost">' + esc(g.caution) + '</p></div>' +
      '</div>' +
      '<div>' +
        '<div class="lw-card"><h3>' + esc(g.stackTitle) + '</h3>' +
        '<table class="lw-table"><tbody>' + g.stack.map(function (r) {
          return '<tr><th>' + esc(r[0]) + '</th><td>' + esc(r[1]) + '</td></tr>';
        }).join('') + '</tbody></table></div>' +
        '<div class="lw-card"><h3>' + esc(g.promptTitle) + '</h3><div class="lw-code">' + esc(g.prompt) + '</div></div>' +
      '</div>';
  }

  /* ---------------- tabs ---------------- */
  function initTabs() {
    var tabs = $$('.lw-tabs button');
    tabs.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = btn.getAttribute('data-tab');
        tabs.forEach(function (b) { b.setAttribute('aria-selected', String(b === btn)); });
        $$('.lw-panel').forEach(function (p) { p.hidden = p.getAttribute('data-panel') !== id; });
        if (id === 'library') renderLibrary($('#lw-lib-search') ? $('#lw-lib-search').value : '');
        if (id === 'search') renderSearch();
        if (id === 'guide') renderGuide();
      });
    });
  }

  /* ---------------- init ---------------- */
  function init() {
    var cnt = $('#lw-count');
    if (cnt) cnt.textContent = DB.statutes.length;
    setArea(state.areaId);
    renderAreas();
    initTabs();
    renderSearch();
    renderGuide();

    document.addEventListener('click', function (e) {
      var areaBtn = e.target.closest ? e.target.closest('[data-area]') : null;
      if (areaBtn) { setArea(areaBtn.getAttribute('data-area')); return; }
      var egBtn = e.target.closest ? e.target.closest('[data-eg]') : null;
      if (egBtn) {
        var a = areaById(state.areaId);
        var ex = (a.examples || [])[+egBtn.getAttribute('data-eg')];
        if (ex) {
          var ta = $('#lw-case');
          ta.value = ex.b;
          ta.focus();
          renderChips(extractKeywords(ex.b));
        }
        return;
      }
    });

    var analyze = $('#lw-analyze');
    if (analyze) analyze.addEventListener('click', function () {
      var ex = extractKeywords(currentInput());
      renderChips(ex);
      if (!ex.hits.length) { toast(DB.ui.emptyArea); return; }
      var best = bestArea(ex.scores, state.areaId);
      setArea(best);
      toast(DB.ui.matched + ': ' + areaById(best).name);
    });

    var gen = $('#lw-generate');
    if (gen) gen.addEventListener('click', buildReport);

    var clear = $('#lw-clear');
    if (clear) clear.addEventListener('click', function () {
      var ta = $('#lw-case');
      if (ta) ta.value = '';
      renderChips({});
      var rep = $('#lw-report');
      if (rep) { rep.classList.remove('is-on'); rep.innerHTML = ''; }
      state.report = null;
      ta && ta.focus();
    });

    var print = $('#lw-print');
    if (print) print.addEventListener('click', function () {
      if (!state.report) { toast(DB.ui.emptyArea); return; }
      // 인쇄물에는 접힌 조문까지 모두 펼쳐 담습니다.
      var reopened = [];
      $$('#lw-report details').forEach(function (d) {
        if (!d.open) { d.open = true; reopened.push(d); }
      });
      window.print();
      var restore = function () {
        reopened.forEach(function (d) { d.open = false; });
        window.removeEventListener('afterprint', restore);
      };
      window.addEventListener('afterprint', restore);
      setTimeout(restore, 1500);
    });

    var md = $('#lw-copy-md');
    if (md) md.addEventListener('click', function () {
      var text = reportMarkdown();
      if (!text) { toast(DB.ui.emptyArea); return; }
      copyText(text, LOCALE === 'ko' ? '마크다운을 복사했습니다.' : 'Markdown copied.');
    });

    var lib = $('#lw-lib-search');
    if (lib) {
      var t;
      lib.addEventListener('input', function () {
        clearTimeout(t);
        t = setTimeout(function () { renderLibrary(lib.value); }, 120);
      });
    }

    // 첫 방문에 예시 문장을 넣어 두면 바로 눌러볼 수 있음
    var ta = $('#lw-case');
    if (ta && !ta.value && DB.areas[0].examples[0]) {
      ta.placeholder = DB.areas[0].examples[0].b.slice(0, 120) + '…';
      renderChips({});
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
