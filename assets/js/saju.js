/* =========================================================
   INSIGHT BRIEF — 만세력 페이지 UI
   계산은 saju-engine.js(SAJU) 가 전담하고, 이 파일은 화면만 담당합니다.
   ========================================================= */
(function () {
  'use strict';

  var E = window.SAJU;
  if (!E) return;

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* 시진 — 12지시. 값은 그 시진의 가운데 시각(2시간 단위)입니다. 자시는 00시대/23시대를 따로 고릅니다(조자시). */
  var SISIN = [
    { v: 'ja', label: '자시 (23:00~00:59)' },
    { v: '2', label: '축시 (01:00~02:59)' },
    { v: '4', label: '인시 (03:00~04:59)' },
    { v: '6', label: '묘시 (05:00~06:59)' },
    { v: '8', label: '진시 (07:00~08:59)' },
    { v: '10', label: '사시 (09:00~10:59)' },
    { v: '12', label: '오시 (11:00~12:59)' },
    { v: '14', label: '미시 (13:00~14:59)' },
    { v: '16', label: '신시 (15:00~16:59)' },
    { v: '18', label: '유시 (17:00~18:59)' },
    { v: '20', label: '술시 (19:00~20:59)' },
    { v: '22', label: '해시 (21:00~22:59)' }
  ];

  /* 어떤 시각이든 가장 가까운 시진의 가운데 시각으로 돌려줍니다. */
  function sisinFor(h) {
    if (h === 23 || h === 0) return 'ja';
    var mids = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22];
    var best = mids[0], bd = 99;
    mids.forEach(function (m) { var d = Math.abs(m - h); if (d < bd) { bd = d; best = m; } });
    return String(best);
  }

  var state = { jasi23: false, chart: null, gender: 'm' };

  /* ---------- 셀렉트 채우기 ---------- */
  function fillSelects() {
    var sy = $('#sj-year'), sm = $('#sj-month'), sd = $('#sj-day');
    if (!sy) return;
    var years = [];
    for (var y = 2026; y >= 1930; y--) years.push('<option value="' + y + '">' + y + '년</option>');
    sy.innerHTML = '<option value="">연도</option>' + years.join('');

    var months = [];
    for (var m = 1; m <= 12; m++) months.push('<option value="' + m + '">' + m + '월</option>');
    sm.innerHTML = '<option value="">월</option>' + months.join('');

    sd.innerHTML = '<option value="">일</option>';
    syncDays();

    var sh = $('#sj-hour');
    sh.innerHTML = '<option value="">모름</option>' +
      SISIN.map(function (s) { return '<option value="' + s.v + '">' + s.label + '</option>'; }).join('');

    sm.addEventListener('change', syncDays);
    sy.addEventListener('change', syncDays);
    sh.addEventListener('change', function () {
      var box = $('#sj-jasi');
      if (!box) return;
      if (sh.value === 'ja') box.removeAttribute('hidden');
      else box.setAttribute('hidden', '');
    });
  }

  function syncDays() {
    var y = parseInt($('#sj-year').value, 10);
    var m = parseInt($('#sj-month').value, 10);
    var sd = $('#sj-day');
    var prev = sd.value;
    if (!(m >= 1 && m <= 12)) return;
    var max = (y >= 1930) ? E.daysInMonth(y, m) : 31;
    var out = ['<option value="">일</option>'];
    for (var d = 1; d <= max; d++) out.push('<option value="' + d + '">' + d + '일</option>');
    sd.innerHTML = out.join('');
    if (prev && parseInt(prev, 10) <= max) sd.value = prev;
  }

  /* ---------- 입력 → 계산 ---------- */
  function readInput() {
    var y = $('#sj-year').value, m = $('#sj-month').value, d = $('#sj-day').value;
    var hv = $('#sj-hour').value;
    var hour = null;
    if (hv === 'ja') hour = state.jasi23 ? 23 : 0;
    else if (hv !== '') hour = parseInt(hv, 10);
    return { year: y, month: m, day: d, hour: hour, gender: state.gender };
  }
  function err(msg) {
    var el = $('#sj-error');
    el.textContent = msg;
    el.classList.add('on');
  }
  function clearErr() { $('#sj-error').classList.remove('on'); }

  function run(fromUrl) {
    clearErr();
    var input = readInput();
    if (!input.year || !input.month || !input.day) { err('생년월일(양력)을 모두 선택해 주세요.'); return; }
    var chart = E.compute(input);
    if (!chart.ok) { err(chart.error); return; }
    state.chart = chart;
    render(chart);
    syncUrl(chart);
    if (!fromUrl) {
      var box = $('#sj-result');
      if (box) window.setTimeout(function () {
        var top = box.getBoundingClientRect().top + window.scrollY - 12;
        window.scrollTo({ top: top, behavior: 'smooth' });
      }, 60);
    }
  }

  /* ---------- 그리기 ---------- */
  function god(g) { return g === '일간' ? '일간' : (g || ''); }

  function colHTML(pos, p) {
    if (!p) {
      return '<div class="sj-col empty"><span class="pos">' + pos + '</span>' +
        '<span class="god">모름</span><span class="ch">—</span>' +
        '<span class="sep"></span><span class="ch">—</span></div>';
    }
    return '<div class="sj-col">' +
      '<span class="pos">' + pos + '</span>' +
      '<span class="god">' + god(p.stemGod) + '</span>' +
      '<span class="ch e' + (p.stemElemIdx + 1) + '">' + p.stem + '<small>' + p.stemElemHanja + ' ' + p.stemElem + '</small></span>' +
      '<span class="sep"></span>' +
      '<span class="ch e' + (p.branchElemIdx + 1) + '">' + p.branch + '<small>' + p.branchElemHanja + ' ' + p.branchElem + '</small></span>' +
      '<span class="god" style="margin-top:6px;margin-bottom:0">' + p.branchGod + '</span>' +
      '</div>';
  }

  function elemRows(chart) {
    var order = [0, 1, 2, 3, 4];
    return order.map(function (i) {
      var e = chart.elements[i];
      var w = Math.round((e.count / chart.totalChars) * 100);
      return '<li><span class="nm"><b class="e' + (i + 1) + '">' + e.hanja + '</b> ' + e.ko + '</span>' +
        '<span class="bar"><i class="c' + (i + 1) + '" style="width:' + w + '%"></i></span>' +
        '<span class="vv">' + e.count + '개 · ' + e.pct + '%</span></li>';
    }).join('');
  }

  function pillarText(chart) {
    var p = chart.pillars;
    return [p.year.hanja, p.month.hanja, p.day.hanja, p.hour ? p.hour.hanja : '(시 모름)'].join(' ');
  }

  function render(c) {
    var box = $('#sj-result');
    box.removeAttribute('hidden');

    /* 사주 카드 */
    $('#sj-idcard').innerHTML =
      '<div class="sj-idcard-top">' +
        '<span class="name">' + c.solarText + ' <b>' + c.genderKo + '</b></span>' +
        '<span class="date">' + c.yearAnimal + '띠 · 2027년 만 ' + c.age2027 + '세</span>' +
        '<span class="tag">' + pillarText(c) + '</span>' +
      '</div>' +
      '<div class="sj-chart">' +
        colHTML('년주', c.pillars.year) +
        colHTML('월주', c.pillars.month) +
        colHTML('일주', c.pillars.day) +
        colHTML('시주', c.pillars.hour) +
      '</div>' +
      '<div class="sj-meta-row">' +
        '<span>일간 <b>' + c.dayMaster.hanja + '(' + c.dayMaster.ko + ')</b> (' + c.dayMaster.elementHanja + ' ' + c.dayMaster.element + ')</span>' +
        '<span>신강·신약 <b>' + c.strength.label + '</b></span>' +
        '<span>용신 <b>' + c.yongshin.hanja + ' ' + c.yongshin.ko + '</b></span>' +
      '</div>';

    /* 일간 · 오행 카드 */
    $('#sj-summary').innerHTML =
      '<div class="sj-card on-light">' +
        '<h3>일간(日干) <span class="mono">나를 나타내는 글자</span></h3>' +
        '<div class="sj-dm">' +
          '<span class="big e' + (c.dayMaster.elementIdx + 1) + '">' + c.dayMaster.hanja + '</span>' +
          '<span class="txt"><b>' + c.dayMaster.hanja + '(' + c.dayMaster.ko + ')</b> · ' + c.dayMaster.elementHanja + ' ' + c.dayMaster.element +
          ' (' + (c.dayMaster.yin ? '음' : '양') + ')</span>' +
          '<span class="sj-badge">' + c.strength.label + '</span>' +
          '<span class="sj-badge alt">용신 ' + c.yongshin.hanja + ' · 희신 ' + c.yongshin.huisin.hanja + '</span>' +
        '</div>' +
        '<p class="sj-note">신강·신약은 월지 계절과 여덟 글자의 오행 분포로 계산한 간이 지표입니다. 점수가 높을수록 일간의 기운이 강합니다. (현재 ' + c.strength.score + '점)</p>' +
      '</div>' +
      '<div class="sj-card on-light">' +
        '<h3>오행 균형 <span class="mono">여덟 글자 기준</span></h3>' +
        '<div class="sj-elembar">' +
          c.elements.map(function (e, i) {
            if (!e.count) return '';
            return '<i class="c' + (i + 1) + '" style="width:' + e.pct + '%"></i>';
          }).join('') +
        '</div>' +
        '<ul class="sj-elemlist">' + elemRows(c) + '</ul>' +
      '</div>';

    /* ① 기질 */
    $('#sj-nature').innerHTML = c.reading.nature.map(function (p) { return '<p>' + p + '</p>'; }).join('') +
      '<div class="sj-sub">일 성향</div><p>' + c.reading.work + '</p>' +
      '<div class="sj-sub">재물 스타일</div><p>' + c.reading.money + '</p>' +
      '<p class="sj-note">' + c.reading.strengthNote + '</p>';

    if (c.boundaryNote || c.hourNote) {
      var note = document.createElement('p');
      note.className = 'sj-note';
      note.style.color = 'var(--accent)';
      note.textContent = '※ ' + [c.boundaryNote, c.hourNote].filter(Boolean).join(' ');
      $('#sj-nature').appendChild(note);
    }

    /* ② 2027 신년운세 */
    var r = c.reading.year2027;
    var html = '<div class="sj-yearhead">' + r.headline + '</div>';
    html += r.total.map(function (p) { return '<p>' + p + '</p>'; }).join('');
    html += '<div class="sj-sub">재물·사업운</div><p>' + r.money + '</p>';
    html += '<div class="sj-halves">' + r.halves.map(function (h) {
      return '<div class="sj-half"><h4><span class="mono">' + h.range + '</span>' + h.label + '</h4><p>' + h.text + '</p></div>';
    }).join('') + '</div>';
    if (r.relations && r.relations.length) {
      html += '<div class="sj-sub">내 사주와 만나는 자리 · 부딪히는 자리</div><ul class="sj-rel">' +
        r.relations.map(function (x) {
          return '<li class="' + x.tone + '"><span class="tagx">' + x.label + '</span><span>' + x.text + '</span></li>';
        }).join('') + '</ul>';
    }
    html += '<div class="sj-sub">조심할 점</div><ul class="sj-caution">' +
      r.caution.map(function (t) { return '<li>' + t + '</li>'; }).join('') + '</ul>';
    html += '<div class="sj-lucky"><h4>행운 컬러 · 숫자</h4><div class="chips">' +
      r.lucky.colors.map(function (col) {
        return '<span class="sj-chip"><i style="background:' + col.hex + '"></i><b>' + col.name + '</b><span class="role">' + col.role + ' ' + col.hanja + '</span></span>';
      }).join('') +
      r.lucky.numbers.map(function (n) {
        return '<span class="sj-chip num">' + n.value + '<span class="role">' + n.ko + '</span></span>';
      }).join('') +
      '</div><p class="sj-note">' + r.lucky.note + '</p></div>';

    $('#sj-fortune').innerHTML = html;

    $('#sj-sharelink').textContent = shareUrl(c);
  }

  /* ---------- URL · 공유 ---------- */
  function shareUrl(c) {
    var q = ['y=' + c.input.year, 'm=' + c.input.month, 'd=' + c.input.day];
    if (c.input.hour !== null) q.push('h=' + c.input.hour);
    if (c.input.gender === 'f') q.push('g=f');
    return location.origin + location.pathname + '?' + q.join('&');
  }

  function syncUrl(c) {
    try {
      history.replaceState(null, '', shareUrl(c));
    } catch (e) { /* file:// 등에서 실패해도 무시 */ }
  }

  function summaryText(c) {
    var p = c.pillars;
    return [
      c.solarText + ' · ' + c.genderKo,
      '사주팔자 ' + p.year.hanja + ' ' + p.month.hanja + ' ' + p.day.hanja + (p.hour ? ' ' + p.hour.hanja : ' (시 모름)'),
      '일간 ' + c.dayMaster.hanja + '(' + c.dayMaster.ko + ') (' + c.strength.label + ') · 용신 ' + c.yongshin.hanja,
      '2027 정미년 ' + c.saeun.stemGod + '·' + c.saeun.branchGod + ' — ' + c.reading.year2027.headline,
      shareUrl(c)
    ].join('\n');
  }

  function copy(text, okMsg) {
    function done() { toast(okMsg); }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, function () { fallback(); });
    } else fallback();
    function fallback() {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); done(); } catch (e) { toast('복사하지 못했습니다. 주소를 직접 선택해 주세요.'); }
      document.body.removeChild(ta);
    }
  }

  var toastTimer = null;
  function toast(msg) {
    var el = $('#sj-toast');
    el.textContent = msg;
    el.classList.add('on');
    clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () { el.classList.remove('on'); }, 2200);
  }

  /* ---------- 이벤트 ---------- */
  function init() {
    fillSelects();

    $$('[data-gender]').forEach(function (b) {
      b.addEventListener('click', function () {
        state.gender = b.getAttribute('data-gender');
        $$('[data-gender]').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      });
    });

    $$('[data-jasi]').forEach(function (b) {
      b.addEventListener('click', function () {
        state.jasi23 = b.getAttribute('data-jasi') === '23';
        $$('[data-jasi]').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      });
    });

    $('#sj-form').addEventListener('submit', function (e) { e.preventDefault(); run(false); });

    $('#sj-copy-link').addEventListener('click', function () {
      if (!state.chart) return;
      copy(shareUrl(state.chart), '결과 링크를 복사했습니다.');
    });
    $('#sj-copy-text').addEventListener('click', function () {
      if (!state.chart) return;
      copy(summaryText(state.chart), '사주 요약을 복사했습니다.');
    });
    $('#sj-share-native').addEventListener('click', function () {
      if (!state.chart) return;
      var data = { title: '무료 만세력 · 2027 신년운세', text: summaryText(state.chart), url: shareUrl(state.chart) };
      if (navigator.share) navigator.share(data).catch(function () {});
      else copy(data.text, '사주 요약을 복사했습니다.');
    });

    /* URL 로 들어온 결과 복원 */
    var q = new URLSearchParams(location.search);
    if (q.get('y')) {
      $('#sj-year').value = q.get('y') || '';
      syncDays();
      $('#sj-month').value = q.get('m') || '';
      syncDays();
      $('#sj-day').value = q.get('d') || '';
      if (q.get('g') === 'f') {
        state.gender = 'f';
        $$('[data-gender]').forEach(function (x) { x.setAttribute('aria-pressed', String(x.getAttribute('data-gender') === 'f')); });
      }
      if (q.get('h') !== null && q.get('h') !== '') {
        var hv = parseInt(q.get('h'), 10);
        if (hv === 23) { state.jasi23 = true; $('#sj-hour').value = 'ja'; $$('[data-jasi]').forEach(function (x) { x.setAttribute('aria-pressed', String(x.getAttribute('data-jasi') === '23')); }); }
        else if (hv === 0) { $('#sj-hour').value = 'ja'; }
        else {
          var hv2 = sisinFor(hv);
          $('#sj-hour').value = hv2;
        }
        $('#sj-jasi').removeAttribute('hidden');
        if ($('#sj-hour').value !== 'ja') $('#sj-jasi').setAttribute('hidden', '');
      }
      run(true);
    }
  }

  /* 국가별 페이지(/en/ /zh/ /ja/)는 intl-saju.js 가 그 나라 전통 용어로 그립니다. */
  if (!/^ko/i.test(document.documentElement.getAttribute('lang') || 'ko')) return;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
