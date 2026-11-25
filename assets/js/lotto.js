/* =========================================================
   INSIGHT BRIEF — 무료 로또 6/45 번호 생성기
   데이터: 동행복권 공식 회차 조회(lt645/selectPstLt645InfoNew.do)
          + data/lotto.json (전 회차 실측 스냅샷)
   ========================================================= */
(function () {
  'use strict';

  var DATA_URL = 'data/lotto.json';
  var API_URL = 'https://www.dhlottery.co.kr/lt645/selectPstLt645InfoNew.do';
  var FIRST_DRAW_DATE = Date.UTC(2002, 11, 7);
  var WEEK = 86400000 * 7;
  var FREQ_WINDOW = 100;
  var MAX_GAMES = 5;

  var state = {
    games: 5,
    mode: 'random',
    fixed: [],
    excluded: [],
    draws: [],      /* [{d,t,n:[],b,p1,w1}] 오름차순 */
    latest: null,
    results: [],
    dataReady: false
  };

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------------- 유틸 ---------------- */
  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  function fmtDate(t) {
    if (!t || t.length !== 8) return '';
    return t.slice(0, 4) + '.' + t.slice(4, 6) + '.' + t.slice(6, 8);
  }
  function fmtWon(v) {
    if (!v) return '—';
    var eok = Math.floor(v / 100000000);
    var man = Math.round((v % 100000000) / 10000);
    if (!eok) return man.toLocaleString('ko-KR') + '만원';
    return eok + '억' + (man ? ' ' + man.toLocaleString('ko-KR') + '만원' : '원');
  }
  function expectedLatest(d) {
    /* 추첨은 토요일. 오늘까지의 가장 최근 토요일 회차 */
    var today = d || new Date();
    var kst = new Date(today.getTime() + (9 * 60 + today.getTimezoneOffset()) * 60000);
    var sat = new Date(kst.getTime());
    sat.setUTCHours(0, 0, 0, 0);
    var dow = sat.getUTCDay();               /* 0=일 … 6=토 */
    sat = new Date(sat.getTime() - ((dow - 6 + 7) % 7) * 86400000);
    return Math.floor((sat.getTime() - FIRST_DRAW_DATE) / WEEK) + 1;
  }
  function ballClass(n) {
    if (n <= 10) return 'b1';
    if (n <= 20) return 'b2';
    if (n <= 30) return 'b3';
    if (n <= 40) return 'b4';
    return 'b5';
  }
  function ballHTML(n, cls) {
    return '<span class="ball ' + ballClass(n) + (cls ? ' ' + cls : '') + '">' + pad(n) + '</span>';
  }
  function toast(msg) {
    var el = $('#lt-toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('on');
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { el.classList.remove('on'); }, 1800);
  }

  /* ---------------- 최신 회차 카드 ---------------- */
  function renderDraw(row, live, hourLabel) {
    if (!row) return;
    state.latest = row;
    $('#lt-draw-no').textContent = '제' + row.d + '회';
    $('#lt-draw-date').textContent = fmtDate(row.t) + ' 추첨';
    var src = $('#lt-draw-src');
    if (live) {
      src.textContent = '동행복권 실시간 확인 ' + (hourLabel || '');
      src.className = 'lt-draw-src is-live';
    } else {
      src.textContent = '동행복권 공식 발표 · 마지막 검증';
      src.className = 'lt-draw-src';
    }
    var html = row.n.map(function (n) { return ballHTML(n); }).join('');
    html += '<span class="lt-bonus"><span class="lt-plus" aria-hidden="true">+</span>' + ballHTML(row.b, 'bonus') +
      '<span class="lt-bonus-label">보너스</span></span>';
    $('#lt-draw-balls').innerHTML = html;
    $('#lt-draw-balls').setAttribute('aria-label',
      '제' + row.d + '회 당첨번호 ' + row.n.join(', ') + ', 보너스 ' + row.b);

    var foot = [];
    if (row.w1) foot.push('1등 <b>' + row.w1.toLocaleString('ko-KR') + '명</b>');
    if (row.p1) foot.push('1등 당첨금 <b>' + fmtWon(row.p1) + '</b>');
    if (row.sales) foot.push('총 판매 <b>' + Math.round(row.sales / 100000000).toLocaleString('ko-KR') + '억원</b>');
    if (!foot.length) foot.push('공식 발표 기준');
    $('#lt-draw-foot').innerHTML = foot.map(function (f) { return '<span>' + f + '</span>'; }).join('');
  }

  /* ---------------- 통계 ---------------- */
  function stats() {
    var draws = state.draws;
    var total = draws.length;
    var since = Math.max(0, total - FREQ_WINDOW);
    var freq = {}, last = {};
    for (var n = 1; n <= 45; n++) { freq[n] = 0; last[n] = -1; }
    for (var i = since; i < total; i++) {
      draws[i].n.forEach(function (x) { freq[x]++; });
    }
    for (var j = 0; j < total; j++) {
      draws[j].n.forEach(function (x) { last[x] = j; });
    }
    var latestD = draws[total - 1].d;
    var rows = [];
    for (var k = 1; k <= 45; k++) {
      rows.push({ n: k, c: freq[k], miss: last[k] < 0 ? total : latestD - draws[last[k]].d });
    }
    var hot = rows.slice().sort(function (a, b) { return b.c - a.c || a.n - b.n; }).slice(0, 10);
    var cold = rows.slice().sort(function (a, b) { return b.miss - a.miss || a.n - b.n; }).slice(0, 10);
    return {
      hot: hot, cold: cold,
      from: draws[since].d, to: latestD,
      maxC: hot[0].c, maxM: cold[0].miss
    };
  }

  function renderStats() {
    if (!state.dataReady) return;
    var s = stats();
    var winFrom = '최근 ' + (s.to - s.from + 1) + '회(제' + s.from + '~' + s.to + '회)';
    $('#lt-hot-sub').textContent = winFrom + ' 출현 횟수';
    $('#lt-cold-sub').textContent = '최신 제' + s.to + '회 기준 미출현 회차';
    $('#lt-hot').innerHTML = s.hot.map(function (r) {
      return '<li><span class="n">' + r.n + '</span>' +
        '<span class="bar"><i style="width:' + Math.round(r.c / s.maxC * 100) + '%"></i></span>' +
        '<span class="v">' + r.c + '회</span></li>';
    }).join('');
    $('#lt-cold').innerHTML = s.cold.map(function (r) {
      return '<li><span class="n">' + r.n + '</span>' +
        '<span class="bar"><i style="width:' + Math.round(r.miss / s.maxM * 100) + '%"></i></span>' +
        '<span class="v">' + r.miss + '회</span></li>';
    }).join('');
    $('#lt-stats-note').textContent =
      '동행복권 공식 회차 기록 제1회~제' + s.to + '회(' + state.draws.length + '회) 전수 집계. ' +
      '빈도와 미출현은 지난 결과의 요약일 뿐 다음 회차를 예측하지 않습니다.';
  }

  /* ---------------- 번호 생성 ---------------- */
  function weightsFor(mode, freqMap, missMap) {
    var w = {};
    for (var n = 1; n <= 45; n++) {
      if (mode === 'freq') w[n] = (freqMap[n] || 0) + 1;
      else if (mode === 'cold') w[n] = (missMap[n] || 0) + 1;
      else w[n] = 1;
    }
    return w;
  }

  function generateOne(pool, weights) {
    var bag = pool.slice();
    var picked = [];
    while (picked.length < 6 && bag.length) {
      var total = 0, i;
      for (i = 0; i < bag.length; i++) total += weights[bag[i]];
      var r = Math.random() * total, acc = 0, idx = bag.length - 1;
      for (i = 0; i < bag.length; i++) {
        acc += weights[bag[i]];
        if (r <= acc) { idx = i; break; }
      }
      picked.push(bag[idx]);
      bag.splice(idx, 1);
    }
    return picked.sort(function (a, b) { return a - b; });
  }

  function generate() {
    var errEl = $('#lt-error');
    errEl.classList.remove('on');
    var fixed = state.fixed.slice();
    var excluded = state.excluded.slice();

    if (fixed.length > 5) { return fail('고정수는 최대 5개까지 고를 수 있습니다. (6개를 모두 고정하면 생성할 번호가 없습니다)'); }
    if (excluded.length > 39) { return fail('제외수는 39개까지 고를 수 있습니다. (최소 6개 번호가 남아야 합니다)'); }

    var pool = [];
    for (var n = 1; n <= 45; n++) {
      if (fixed.indexOf(n) >= 0 || excluded.indexOf(n) >= 0) continue;
      pool.push(n);
    }
    if (pool.length < 6 - fixed.length) {
      return fail('고정수와 제외수를 합치면 6개를 만들 수 없습니다. 조건을 줄여 주세요.');
    }

    var freqMap = {}, missMap = {};
    if (state.dataReady) {
      var s = stats();
      state.draws.slice(-FREQ_WINDOW).forEach(function (dr) {
        dr.n.forEach(function (x) { freqMap[x] = (freqMap[x] || 0) + 1; });
      });
      /* 미출현: 최신 회차부터 몇 회차 전에 마지막으로 나왔는지 */
      var last = {};
      state.draws.forEach(function (dr, i) {
        dr.n.forEach(function (x) { last[x] = dr.d; });
      });
      for (var k = 1; k <= 45; k++) missMap[k] = last[k] ? (state.latest.d - last[k]) : 999;
    }
    var mode = state.mode === 'custom' ? 'random' : state.mode;
    var weights = weightsFor(mode, freqMap, missMap);

    var games = [];
    for (var g = 0; g < state.games; g++) {
      var rest = generateOne(pool, weights).slice(0, 6 - fixed.length);
      games.push(fixed.concat(rest).sort(function (a, b) { return a - b; }));
    }
    state.results = games;
    renderResults();

    function fail(msg) {
      errEl.textContent = msg;
      errEl.classList.add('on');
    }
  }

  /* ---------------- 역대 대조 ---------------- */
  function tally(game, draws) {
    var set = {};
    game.forEach(function (n) { set[n] = true; });
    var c = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (var i = 0; i < draws.length; i++) {
      var dr = draws[i], hit = 0;
      for (var j = 0; j < 6; j++) if (set[dr.n[j]]) hit++;
      if (hit === 6) c[1]++;
      else if (hit === 5 && set[dr.b]) c[2]++;
      else if (hit === 5) c[3]++;
      else if (hit === 4) c[4]++;
      else if (hit === 3) c[5]++;
    }
    return c;
  }

  function renderResults() {
    var box = $('#lt-results');
    var host = $('#lt-games');
    var draws = state.draws;
    var modeLabel = { random: '완전 무작위', freq: '최근 빈도 가중', cold: '미출현 가중', custom: '내 조건' }[state.mode];

    host.innerHTML = state.results.map(function (g, i) {
      var c = draws.length ? tally(g, draws) : null;
      var t = draws.length
        ? '<div class="lt-tally"><span>역대 ' + draws.length.toLocaleString('ko-KR') + '회 대조</span>' +
          [1, 2, 3, 4, 5].map(function (r) {
            var on = c[r] > 0 && r >= 4 ? ' class="win"' : '';
            return '<span>· ' + r + '등 <b' + on + '>' + c[r] + '</b></span>';
          }).join('') + '</div>'
        : '';
      return '<div class="lt-game" data-i="' + i + '">' +
        '<div class="line"><span class="idx">' + (i + 1) + '게임</span>' +
        g.map(function (n) { return ballHTML(n, 'sm'); }).join('') + '</div>' +
        '<button class="copy" type="button" data-copy="' + i + '" aria-label="' + (i + 1) + '게임 번호 복사">' +
        '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2"></rect><path d="M6 15V6a2 2 0 0 1 2-2h8"></path></svg></button>' +
        t + '</div>';
    }).join('');

    var now = new Date();
    $('#lt-results-meta').textContent = modeLabel + ' · ' + state.games + '게임 · ' +
      pad(now.getHours()) + ':' + pad(now.getMinutes()) + ' 생성' +
      (state.latest ? ' · 제' + state.latest.d + '회까지 통계' : '');
    box.hidden = false;
  }

  function gamesText() {
    return state.results.map(function (g, i) {
      return (i + 1) + '게임: ' + g.map(pad).join(' ');
    }).join('\n');
  }

  function copyText(text, done) {
    function fallback() {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
      document.body.removeChild(ta);
      if (ok) done(); else toast('복사에 실패했습니다. 번호를 길게 눌러 직접 복사해 주세요.');
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, fallback);
    } else fallback();
  }

  /* ---------------- 조건 그리드 ---------------- */
  function buildGrid() {
    var host = $('#lt-grid');
    var html = '';
    for (var n = 1; n <= 45; n++) {
      html += '<button type="button" data-n="' + n + '" data-state="none" aria-pressed="false" aria-label="' + n + '번">' + n + '</button>';
    }
    host.innerHTML = html;
  }

  function syncGrid() {
    $$('#lt-grid button').forEach(function (b) {
      var n = +b.getAttribute('data-n');
      var st = state.fixed.indexOf(n) >= 0 ? 'fix' : (state.excluded.indexOf(n) >= 0 ? 'out' : 'none');
      b.setAttribute('data-state', st);
      b.setAttribute('aria-pressed', st === 'none' ? 'false' : 'true');
      b.setAttribute('aria-label', n + '번 ' + (st === 'fix' ? '고정' : st === 'out' ? '제외' : '미지정'));
    });
    $('#lt-chip-fix').textContent = '고정 ' + state.fixed.length;
    $('#lt-chip-fix').className = 'chip' + (state.fixed.length ? ' on' : '');
    $('#lt-chip-out').textContent = '제외 ' + state.excluded.length;
    $('#lt-chip-out').className = 'chip' + (state.excluded.length ? ' out' : '');
    var fixList = $('#lt-fix-list');
    fixList.textContent = state.fixed.length ? '고정: ' + state.fixed.slice().sort(function (a, b) { return a - b; }).join(', ') : '';
  }

  function cycleNumber(n) {
    var f = state.fixed.indexOf(n), e = state.excluded.indexOf(n);
    if (f >= 0) {
      state.fixed.splice(f, 1);
      if (state.excluded.length < 39) state.excluded.push(n);
      else return toast('제외수는 39개까지만 지정할 수 있습니다.');
    } else if (e >= 0) {
      state.excluded.splice(e, 1);
    } else {
      if (state.fixed.length >= 5) {
        if (state.excluded.length < 39) state.excluded.push(n);
        else return toast('제외수는 39개까지만 지정할 수 있습니다.');
      } else if (state.excluded.length >= 39) {
        return toast('제외수는 39개까지만 지정할 수 있습니다.');
      } else {
        state.fixed.push(n);
      }
    }
    syncGrid();
  }

  /* ---------------- 데이터 로드 ---------------- */
  function normalizeRow(item) {
    return {
      d: +item.ltEpsd,
      t: String(item.ltRflYmd),
      n: [1, 2, 3, 4, 5, 6].map(function (i) { return +item['tm' + i + 'WnNo']; }).sort(function (a, b) { return a - b; }),
      b: +item.bnsWnNo,
      p1: +(item.rnk1WnAmt || 0),
      w1: +(item.rnk1WnNope || 0),
      p3: +(item.rnk3WnAmt || 0),
      s: +(item.sumWnNope || 0),
      sales: +(item.wholEpsdSumNtslAmt || 0)
    };
  }

  function mergeDraws(rows) {
    var map = {};
    state.draws.forEach(function (r) { map[r.d] = r; });
    rows.forEach(function (r) { if (r && r.d && !map[r.d]) map[r.d] = r; });
    state.draws = Object.keys(map).map(function (k) { return map[k]; })
      .sort(function (a, b) { return a.d - b.d; });
    return state.draws[state.draws.length - 1];
  }

  function loadSnapshot() {
    return fetch(DATA_URL, { cache: 'no-cache' })
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function (j) {
        if (!j || !j.draws || !j.draws.length) throw new Error('empty');
        state.draws = j.draws.slice().sort(function (a, b) { return a.d - b.d; });
        state.dataReady = true;
        renderDraw(state.draws[state.draws.length - 1], false);
        renderStats();
        if (state.results.length) renderResults();
        return j;
      })
      .catch(function () {
        var note = $('#lt-stats-note');
        if (note) note.textContent = '통계 자료를 불러오지 못했습니다. 잠시 후 새로고침해 주세요.';
      });
  }

  function liveCheck() {
    var want = expectedLatest();
    var have = state.draws.length ? state.draws[state.draws.length - 1].d : 0;
    if (have >= want) return Promise.resolve(false);   /* 이미 최신 */
    var ctrl = 'AbortController' in window ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, 6000);
    return fetch(API_URL + '?srchDir=center&srchLtEpsd=' + want, ctrl ? { signal: ctrl.signal } : {})
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function (j) {
        clearTimeout(timer);
        var list = (j && j.data && j.data.list) || [];
        var rows = list.map(normalizeRow).filter(function (r) { return r.d && r.n.length === 6; });
        if (!rows.length) return false;
        var newest = mergeDraws(rows);
        if (newest.d > have) {
          var now = new Date();
          renderDraw(newest, true, pad(now.getHours()) + ':' + pad(now.getMinutes()));
          renderStats();
          if (state.results.length) renderResults();
          return true;
        }
        return false;
      })
      .catch(function () { clearTimeout(timer); return false; });
  }

  /* ---------------- 이벤트 ---------------- */
  function bind() {
    $$('[data-games] button').forEach(function (b) {
      b.addEventListener('click', function () {
        state.games = +b.getAttribute('data-games');
        $$('[data-games] button').forEach(function (x) {
          x.setAttribute('aria-pressed', String(x === b));
        });
        if (state.results.length) generate();
      });
    });

    $$('[data-mode] button').forEach(function (b) {
      b.addEventListener('click', function () {
        state.mode = b.getAttribute('data-mode');
        $$('[data-mode] button').forEach(function (x) {
          x.setAttribute('aria-pressed', String(x === b));
        });
        var cond = $('#lt-cond');
        if (state.mode === 'custom') cond.open = true;
        if (state.results.length) generate();
      });
    });

    $('#lt-grid').addEventListener('click', function (e) {
      var b = e.target.closest('button[data-n]');
      if (b) cycleNumber(+b.getAttribute('data-n'));
    });

    $('#lt-reset-cond').addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      state.fixed = [];
      state.excluded = [];
      syncGrid();
    });

    $('#lt-run').addEventListener('click', generate);

    $('#lt-games').addEventListener('click', function (e) {
      var b = e.target.closest('button[data-copy]');
      if (!b) return;
      var i = +b.getAttribute('data-copy');
      var nums = state.results[i].map(pad).join(' ');
      copyText(nums, function () {
        b.classList.add('done');
        toast((i + 1) + '게임 번호를 복사했습니다 · ' + nums);
        setTimeout(function () { b.classList.remove('done'); }, 1400);
      });
    });

    $('#lt-copy-all').addEventListener('click', function () {
      if (!state.results.length) return;
      copyText(gamesText(), function () { toast(state.results.length + '게임 전체를 복사했습니다'); });
    });

    $('#lt-share').addEventListener('click', function () {
      if (!state.results.length) return;
      var url = 'https://insightbriefnews.com/lotto.html';
      var text = '로또 6/45 번호 생성기 (무료)\n' + gamesText() + '\n' + url;
      if (navigator.share) {
        navigator.share({ title: '로또 6/45 번호 생성기', text: '로또 6/45 번호 생성기 (무료)\n' + gamesText(), url: url })
          .catch(function () {});
      } else {
        copyText(text, function () { toast('번호와 링크를 복사했습니다'); });
      }
    });
  }

  function boot() {
    /* 국가별 페이지(/en/ /zh/ /ja/)는 intl-lotto.js 가 그 나라 복권으로 그립니다. */
    if (!/^ko/i.test(document.documentElement.getAttribute('lang') || 'ko')) return;
    buildGrid();
    syncGrid();
    bind();
    var d = $('#today-date');
    if (d) {
      try {
        d.textContent = new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' }).format(new Date());
      } catch (e) { /* noop */ }
    }
    loadSnapshot().then(liveCheck);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
