/* =========================================================
   INSIGHT BRIEF — 전세계 전시회 캘린더 (exhibitions.html)
   · 데이터는 data/exhibitions.json (없으면 exhibitions.fallback.js)
   · 화면 문구는 데이터의 ui 사전에서 현재 언어로 고릅니다.
     (한국어 원본 페이지를 tools/i18n_pages.py 가 언어별로 복제하므로
      document.documentElement.lang 만 보고 언어를 정하면 됩니다.)
   ========================================================= */
(function () {
  'use strict';

  var HANGUL = /[가-힣]/;
  var html = document.documentElement;
  var rawLang = (html.getAttribute('lang') || 'ko').toLowerCase();
  var LANG = rawLang.indexOf('zh') === 0 ? 'zh'
    : rawLang.indexOf('ja') === 0 ? 'ja'
      : rawLang.indexOf('en') === 0 ? 'en' : 'ko';

  var DATA = null;
  var UI = {};
  var WEEK = [];
  var state = { view: 'calendar', q: '', region: '', country: '', sector: '', month: '', cal: '' };
  var bounds = { min: '', max: '' };
  var $ = function (id) { return document.getElementById(id); };
  var nodes = {
    q: $('ex-q'), region: $('ex-region'), country: $('ex-country'), sector: $('ex-sector'),
    month: $('ex-month'), reset: $('ex-reset'), count: $('ex-count'),
    calPanel: $('ex-cal-panel'), listPanel: $('ex-list-panel'),
    calTitle: $('ex-cal-title'), monthCount: $('ex-month-count'), prev: $('ex-prev'), next: $('ex-next'),
    today: $('ex-today'), icsAll: $('ex-ics-all'), legend: $('ex-legend'), cal: $('ex-cal'),
    under: $('ex-under'), list: $('ex-list'), modal: $('ex-modal'), modalBody: $('ex-modal-body'),
    close: $('ex-close'), views: document.querySelectorAll('.ex-views button')
  };

  /* ---------------- 공통 ---------------- */
  function t(key) {
    var v = UI[key];
    return (v && v[LANG]) || (v && v.ko) || key;
  }
  function tf(key, n) { return t(key).replace('{n}', n); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function pick(obj) { return obj ? (obj[LANG] || obj.ko || '') : ''; }
  function pad(n) { return (n < 10 ? '0' : '') + n; }

  function ymd(d) { return d.getUTCFullYear() + pad(d.getUTCMonth() + 1) + pad(d.getUTCDate()); }
  function iso(d) { return d.getUTCFullYear() + '-' + pad(d.getUTCMonth() + 1) + '-' + pad(d.getUTCDate()); }
  function parse(s) {
    var p = s.split('-');
    return new Date(Date.UTC(+p[0], +p[1] - 1, +p[2]));
  }
  function addDays(d, n) { return new Date(d.getTime() + n * 86400000); }
  function startOfMonth(key) { var p = key.split('-'); return new Date(Date.UTC(+p[0], +p[1] - 1, 1)); }
  function monthKey(d) { return d.getUTCFullYear() + '-' + pad(d.getUTCMonth() + 1); }
  function addMonth(key, n) {
    var d = startOfMonth(key);
    return monthKey(new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + n, 1)));
  }
  function monthDays(key) {
    var d = startOfMonth(key);
    return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate();
  }
  function monthTitle(key) {
    var p = key.split('-');
    var y = +p[0], m = +p[1];
    var f = (DATA.monthLabel[LANG] || DATA.monthLabel.ko)[0];
    if (f.indexOf('{month}') > -1) {
      var names = DATA.monthNames[LANG] || DATA.monthNames.en;
      return f.replace('{month}', names[m - 1]).replace('{y}', y).replace('{m}', m);
    }
    return f.replace('{y}', y).replace('{m}', m);
  }
  function dayText(d, withYear) {
    var y = d.getUTCFullYear(), m = d.getUTCMonth() + 1, dd = d.getUTCDate();
    if (LANG === 'ko') return withYear === false ? (m + '.' + dd) : (y + '년 ' + m + '월 ' + dd + '일');
    if (LANG === 'en') {
      var names = DATA.monthNames.en;
      return withYear === false ? (names[m - 1].slice(0, 3) + ' ' + dd) : (names[m - 1].slice(0, 3) + ' ' + dd + ', ' + y);
    }
    return withYear === false ? (m + '月' + dd + '日') : (y + '年' + m + '月' + dd + '日');
  }
  function dowText(d) { return (WEEK[d.getUTCDay()] || ''); }
  // 목록·달력 아래 요약에 쓰는 짧은 표기(칸이 좁아 月·日 를 붙이면 줄이 깨집니다)
  function shortDate(d) {
    var m = d.getUTCMonth() + 1, dd = d.getUTCDate();
    if (LANG === 'en') return (DATA.monthNames.en[m - 1].slice(0, 3) + ' ' + dd);
    return m + '.' + dd;
  }
  function shortRange(ev) {
    if (ev.start === ev.end) return shortDate(parse(ev.start));
    return shortDate(parse(ev.start)) + ' – ' + shortDate(parse(ev.end));
  }
  function rangeText(ev) {
    var s = parse(ev.start), e = parse(ev.end);
    if (ev.start === ev.end) return dayText(s, true) + ' (' + dowText(s) + ')';
    var sameMonth = s.getUTCFullYear() === e.getUTCFullYear() && s.getUTCMonth() === e.getUTCMonth();
    var left = dayText(s, true);
    var right = sameMonth ? (LANG === 'ko' ? (e.getUTCDate() + '일') : LANG === 'en' ? String(e.getUTCDate()) : (e.getUTCDate() + '日'))
      : dayText(e, true);
    return left + ' (' + dowText(s) + ') – ' + right + ' (' + dowText(e) + ')';
  }
  function days(ev) {
    return Math.round((parse(ev.end) - parse(ev.start)) / 86400000) + 1;
  }
  function evName(ev) { return (LANG === 'ko' && ev.nameKo) ? ev.nameKo : ev.name; }
  function evShort(ev) {
    var n = ev.name.replace(/\s*20\d\d.*$/, '').replace(/\s*\(.*\)$/, '').trim();
    return n || ev.name;
  }
  function placeText(ev) {
    return pick(ev.venue) + ' · ' + pick(ev.city) + ', ' + pick(ev.country);
  }

  /* ---------------- 데이터 ---------------- */
  function boot(data) {
    DATA = data;
    UI = data.ui || {};
    WEEK = data.weekdays[LANG] || data.weekdays.ko;
    var keys = data.events.map(function (e) { return e.start.slice(0, 7); }).sort();
    bounds.min = keys[0];
    bounds.max = data.events.map(function (e) { return e.end.slice(0, 7); }).sort().pop();
    state.cal = currentMonth();
    buildFilters();
    buildLegend();
    bind();
    readUrl();
    render();
  }

  function currentMonth() {
    var today = new Date();
    var key = today.getFullYear() + '-' + pad(today.getMonth() + 1);
    if (key < bounds.min) return bounds.min;
    if (key > bounds.max) return bounds.max;
    return key;
  }

  function opt(value, label) {
    return '<option value="' + esc(value) + '">' + esc(label) + '</option>';
  }

  function buildFilters() {
    var all = t('all');
    // 권역
    var regions = {};
    DATA.events.forEach(function (e) { regions[e.region] = e.regionLabel; });
    var htmlR = opt('', all);
    Object.keys(DATA.regions).forEach(function (k) {
      if (regions[k]) htmlR += opt(k, pick(DATA.regions[k]));
    });
    nodes.region.innerHTML = htmlR;
    // 국가 (권역에 따라 갱신)
    rebuildCountries();
    // 분야
    var htmlS = opt('', all);
    Object.keys(DATA.sectors).forEach(function (k) {
      if (DATA.events.some(function (e) { return e.sector === k; })) htmlS += opt(k, pick(DATA.sectors[k]));
    });
    nodes.sector.innerHTML = htmlS;
    // 월
    var months = {};
    DATA.events.forEach(function (e) {
      for (var k in monthSet(e)) months[k] = true;
    });
    var htmlM = opt('', all);
    Object.keys(months).sort().forEach(function (k) { htmlM += opt(k, monthTitle(k)); });
    nodes.month.innerHTML = htmlM;

    nodes.region.previousElementSibling.textContent = t('region');
    nodes.country.previousElementSibling.textContent = t('country');
    nodes.sector.previousElementSibling.textContent = t('sector');
    nodes.month.previousElementSibling.textContent = t('month');
    nodes.reset.textContent = t('reset');
    nodes.q.placeholder = t('search');
    nodes.q.setAttribute('aria-label', t('search'));
    nodes.views[0].querySelector('span').textContent = t('view_cal');
    nodes.views[1].querySelector('span').textContent = t('view_list');
    nodes.prev.setAttribute('aria-label', t('prev'));
    nodes.next.setAttribute('aria-label', t('next'));
    nodes.today.textContent = t('thisMonth');
    nodes.icsAll.textContent = t('downloadAll');
    nodes.close.setAttribute('aria-label', t('close'));
  }

  function rebuildCountries() {
    var all = t('all');
    var seen = {}, out = opt('', all);
    DATA.events.forEach(function (e) {
      if (state.region && e.region !== state.region) return;
      if (seen[e.countryCode]) return;
      seen[e.countryCode] = 1;
      out += opt(e.countryCode, pick(e.country));
    });
    nodes.country.innerHTML = out;
    if (state.country && !seen[state.country]) state.country = '';
    nodes.country.value = state.country || '';
    nodes.country.disabled = false;
  }

  function monthSet(ev) {
    var out = {}, d = parse(ev.start), e = parse(ev.end);
    while (d <= e) { out[monthKey(d)] = true; d = addDays(d, 1); }
    return out;
  }

  function buildLegend() {
    nodes.legend.innerHTML = Object.keys(DATA.sectors).filter(function (k) {
      return DATA.events.some(function (e) { return e.sector === k; });
    }).map(function (k) {
      return '<button type="button" data-sector="' + k + '" aria-pressed="false" class="s-' + k + '">'
        + '<i style="background:' + sectorColor(k) + '"></i>' + esc(pick(DATA.sectors[k])) + '</button>';
    }).join('');
    nodes.legend.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-sector]');
      if (!b) return;
      var k = b.getAttribute('data-sector');
      state.sector = (state.sector === k) ? '' : k;
      nodes.sector.value = state.sector;
      render();
    });
  }

  function sectorColor(k) {
    var map = {
      plastic: '#9a5b13', machine: '#1f5c8b', it: '#5a3f9d', pack: '#0f7671', food: '#a3312b',
      mobility: '#3f5f24', energy: '#8a6a06', medical: '#a33b64', material: '#5b6570',
      infra: '#166a4a', trade: '#6b4b21', beauty: '#a3527c', textile: '#2f6f7a'
    };
    return map[k] || '#6f747b';
  }

  /* ---------------- 상태 ------------- */
  var filtersActive = function () {
    return !!(state.q || state.region || state.country || state.sector || state.month);
  };

  function matches(ev) {
    if (state.region && ev.region !== state.region) return false;
    if (state.country && ev.countryCode !== state.country) return false;
    if (state.sector && ev.sector !== state.sector) return false;
    if (state.month && !monthSet(ev)[state.month]) return false;
    if (state.q) {
      var q = state.q.toLowerCase();
      var hay = [ev.name, ev.nameKo, pick(ev.city), pick(ev.venue), pick(ev.country),
        pick(ev.sectorLabel), pick(ev.desc), ev.tags.map(function (x) { return pick(x); }).join(' ')
      ].join(' ').toLowerCase();
      if (hay.indexOf(q) === -1) return false;
    }
    return true;
  }

  function filtered() { return DATA.events.filter(matches); }

  /* ---------------- 렌더 ------------- */
  function render() {
    var list = filtered();
    nodes.count.innerHTML = '<b>' + list.length + '</b> / ' + DATA.events.length;
    nodes.count.setAttribute('aria-label', tf('count', list.length));
    document.querySelectorAll('.ex-legend button').forEach(function (b) {
      b.setAttribute('aria-pressed', b.getAttribute('data-sector') === state.sector ? 'true' : 'false');
    });
    if (state.view === 'calendar') {
      nodes.calPanel.hidden = false;
      nodes.listPanel.hidden = true;
      renderCalendar(list);
    } else {
      nodes.calPanel.hidden = true;
      nodes.listPanel.hidden = false;
      renderList(list);
    }
    nodes.views.forEach(function (b) {
      b.setAttribute('aria-selected', b.getAttribute('data-view') === state.view ? 'true' : 'false');
    });
    syncUrl();
  }

  function renderCalendar(list) {
    var key = state.cal;
    nodes.calTitle.textContent = monthTitle(key);
    nodes.prev.disabled = key <= bounds.min;
    nodes.next.disabled = key >= bounds.max;

    var byDay = {};
    list.forEach(function (ev) {
      var d = parse(ev.start), e = parse(ev.end);
      while (d <= e) {
        var k = iso(d);
        (byDay[k] = byDay[k] || []).push(ev);
        d = addDays(d, 1);
      }
    });

    var first = startOfMonth(key);
    var lead = first.getUTCDay();
    var total = monthDays(key);
    var todayIso = iso(new Date(Date.UTC(new Date().getFullYear(), new Date().getMonth(), new Date().getDate())));
    var out = WEEK.map(function (w, i) {
      return '<div class="ex-dow' + (i === 0 ? ' sun' : i === 6 ? ' sat' : '') + '">' + esc(w) + '</div>';
    }).join('');

    var shown = 0;
    for (var i = 0; i < lead; i++) out += '<div class="ex-cell pad"></div>';
    for (var day = 1; day <= total; day++) {
      var date = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth(), day));
      var k = iso(date);
      var evs = byDay[k] || [];
      shown += evs.length;
      var cls = 'ex-cell' + (k === todayIso ? ' today' : '');
      out += '<div class="' + cls + '"><div class="ex-date">' + day + '</div>';
      evs.forEach(function (ev) {
        var cont = ev.start !== k;
        out += '<button type="button" class="ex-chip s-' + ev.sector + (cont ? ' cont' : '') + '"'
          + ' data-id="' + esc(ev.id) + '" title="' + esc(evName(ev)) + '">' + esc(evShort(ev)) + '</button>';
      });
      out += '</div>';
    }
    var tail = (7 - ((lead + total) % 7)) % 7;
    for (var j = 0; j < tail; j++) out += '<div class="ex-cell pad"></div>';
    nodes.cal.innerHTML = out;

    var monthEvents = list.filter(function (ev) { return monthSet(ev)[key]; });
    nodes.monthCount.textContent = tf('countMonth', monthEvents.length);
    if (monthEvents.length) {
      nodes.under.innerHTML = '<h3>' + esc(monthTitle(key)) + '</h3><div class="ex-underlist">'
        + monthEvents.map(function (ev) {
          return '<button type="button" class="ex-underitem s-' + ev.sector + '" data-id="' + esc(ev.id) + '">'
            + '<span class="d">' + esc(shortRange(ev)) + '</span>'
            + '<span class="n">' + esc(evName(ev)) + '</span>'
            + '<span class="p">' + esc(pick(ev.city)) + '</span></button>';
        }).join('') + '</div>';
    } else {
      nodes.under.innerHTML = '<div class="ex-empty">' + esc(t('emptyMonth')) + '</div>';
    }
  }

  function renderList(list) {
    if (!list.length) {
      nodes.list.innerHTML = '<div class="ex-empty">' + esc(t('empty')) + '</div>';
      return;
    }
    var groups = {};
    list.forEach(function (ev) {
      Object.keys(monthSet(ev)).forEach(function (k) {
        if (state.month && k !== state.month) return;
        (groups[k] = groups[k] || []).push(ev);
      });
    });
    var keys = Object.keys(groups).sort();
    nodes.list.innerHTML = '<h2 class="ex-sr">' + esc(t('listTitle')) + '</h2>' + keys.map(function (k) {
      var seen = {};
      var items = groups[k].filter(function (ev) { if (seen[ev.id]) return false; seen[ev.id] = 1; return true; });
      return '<section class="ex-month-block"><div class="ex-month-head"><h3>' + esc(monthTitle(k))
        + '</h3><span>' + tf('count', items.length) + '</span></div><div class="ex-cards">'
        + items.map(card).join('') + '</div></section>';
    }).join('');
  }

  function card(ev) {
    var s = parse(ev.start), e = parse(ev.end);
    return '<article class="ex-card s-' + ev.sector + '">'
      + '<div class="when"><b>' + esc(shortDate(s)) + '</b>'
      + (ev.start === ev.end ? '' : '<span class="to">– ' + esc(shortDate(e)) + '</span>')
      + '<span>' + esc(tf('days', days(ev))) + '</span></div>'
      + '<div><span class="ex-sectag">' + esc(pick(ev.sectorLabel)) + '</span>'
      + '<h4><button type="button" data-id="' + esc(ev.id) + '">' + esc(evName(ev)) + '</button></h4>'
      + '<p class="meta">' + esc(placeText(ev)) + ' <em>· ' + esc(dayText(s, true)) + '</em></p>'
      + '<div class="tags">' + ev.tags.map(function (x) { return '<span>' + esc(pick(x)) + '</span>'; }).join('') + '</div></div>'
      + '<div class="acts">'
      + '<a class="main" href="' + esc(ev.url) + '" target="_blank" rel="noopener noreferrer">' + esc(t('official')) + '</a>'
      + '<a href="' + esc(gcalUrl(ev)) + '" target="_blank" rel="noopener noreferrer">' + esc(t('google')) + '</a>'
      + '<button type="button" data-ics="' + esc(ev.id) + '">' + esc(t('ics')) + '</button>'
      + '</div></article>';
  }

  /* ---------------- 일정 파일 ---------------- */
  function icsEscape(s) {
    return String(s || '').replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
  }

  function icsLines(list) {
    var out = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'CALSCALE:GREGORIAN', 'PRODID:-//INSIGHT BRIEF//Exhibition Calendar//KO'];
    var stamp = ymd(new Date()) + 'T000000Z';
    list.forEach(function (ev) {
      out.push('BEGIN:VEVENT');
      out.push('UID:' + ev.id + '@insightbriefnews.com');
      out.push('DTSTAMP:' + stamp);
      out.push('DTSTART;VALUE=DATE:' + ymd(parse(ev.start)));
      out.push('DTEND;VALUE=DATE:' + ymd(addDays(parse(ev.end), 1)));
      out.push('SUMMARY:' + icsEscape(ev.name + ' (' + pick(ev.city) + ')'));
      out.push('LOCATION:' + icsEscape(placeText(ev)));
      out.push('DESCRIPTION:' + icsEscape(pick(ev.desc) + '\n' + ev.url));
      out.push('URL:' + ev.url);
      out.push('TRANSP:TRANSPARENT');
      out.push('END:VEVENT');
    });
    out.push('END:VCALENDAR');
    return out.join('\r\n') + '\r\n';
  }

  function download(name, text) {
    var blob = new Blob([text], { type: 'text/calendar;charset=utf-8' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1200);
  }

  function gcalUrl(ev) {
    var s = ymd(parse(ev.start));
    var e = ymd(addDays(parse(ev.end), 1));
    return 'https://calendar.google.com/calendar/render?action=TEMPLATE'
      + '&text=' + encodeURIComponent(ev.name + ' (' + pick(ev.city) + ')')
      + '&dates=' + s + '/' + e
      + '&location=' + encodeURIComponent(placeText(ev))
      + '&details=' + encodeURIComponent(pick(ev.desc) + '\n' + ev.url)
      + '&ctz=Asia%2FSeoul';
  }

  /* ---------------- 상세 ---------------- */
  function todayNum() {
    var n = new Date();
    return Date.UTC(n.getFullYear(), n.getMonth(), n.getDate());
  }

  // KOTRA 한국관 모집 기간(있는 행사만)
  function recruitFact(ev) {
    if (!ev.recruit || !ev.recruit.start) return '';
    var s = parse(ev.recruit.start), e = parse(ev.recruit.end), now = todayNum();
    var open = now >= s.getTime() && now <= e.getTime();
    return '<div class="ex-fact"><span>' + esc(t('recruit')) + '</span><b>'
      + esc(ev.recruit.start + ' – ' + ev.recruit.end)
      + (open ? ' · ' + esc(t('recruiting')) : '') + '</b></div>';
  }

  function openModal(id) {
    var ev = DATA.events.filter(function (x) { return x.id === id; })[0];
    if (!ev) return;
    var body = ''
      + '<div class="ex-m-head"><span class="k">' + esc(pick(ev.sectorLabel)) + '</span>'
      + '<h2 id="ex-m-title">' + esc(evName(ev)) + '</h2>'
      + '<p>' + esc(placeText(ev)) + '</p></div>'
      + '<div class="ex-m-body"><div class="ex-m-facts">'
      + '<div class="ex-fact"><span>' + esc(t('period')) + '</span><b>' + esc(rangeText(ev)) + '</b></div>'
      + '<div class="ex-fact"><span>' + esc(t('duration')) + '</span><b>' + tf('days', days(ev)) + '</b></div>'
      + '<div class="ex-fact"><span>' + esc(t('venue')) + '</span><b>' + esc(pick(ev.venue)) + '</b></div>'
      + '<div class="ex-fact"><span>' + esc(t('city')) + '</span><b>' + esc(pick(ev.city) + ', ' + pick(ev.country)) + '</b></div>'
      + recruitFact(ev)
      + '</div>'
      + '<p class="ex-m-desc">' + esc(pick(ev.desc)) + '</p>'
      + (ev.note ? '<div class="ex-m-note"><b>' + esc(t('note')) + '</b>' + esc(pick(ev.note)) + '</div>' : '')
      + '<div class="ex-m-tags"><span>' + esc(t('items')) + '</span>'
      + ev.tags.map(function (x) { return '<span>' + esc(pick(x)) + '</span>'; }).join('') + '</div>'
      + '<div class="ex-m-acts">'
      + '<a class="main" href="' + esc(ev.url) + '" target="_blank" rel="noopener noreferrer">' + esc(t('official')) + '</a>'
      + (ev.gep ? '<a href="' + esc(ev.gep) + '" target="_blank" rel="noopener noreferrer">' + esc(t('gep')) + '</a>' : '')
      + '<a href="' + esc(gcalUrl(ev)) + '" target="_blank" rel="noopener noreferrer">' + esc(t('google')) + '</a>'
      + '<button type="button" data-ics="' + esc(ev.id) + '">' + esc(t('ics')) + '</button>'
      + '</div>'
      + '<p class="ex-m-verify">' + esc(t('verified')) + ' · ' + esc(ev.verified) + '</p>'
      + '</div>';
    nodes.modalBody.innerHTML = body;
    nodes.modal.hidden = false;
    document.body.style.overflow = 'hidden';
    nodes.close.focus();
    try { history.replaceState(null, '', location.pathname + '?id=' + encodeURIComponent(ev.id)); } catch (e) { }
  }

  function closeModal() {
    nodes.modal.hidden = true;
    document.body.style.overflow = '';
    try { history.replaceState(null, '', location.pathname + (state.view === 'list' ? '?view=list' : '')); } catch (e) { }
  }

  /* ---------------- URL ------------- */
  function readUrl() {
    var p = new URLSearchParams(location.search);
    if (p.get('view') === 'list') state.view = 'list';
    var m = p.get('month');
    if (/^\d{4}-\d{2}$/.test(m || '')) {
      if (m < bounds.min) m = bounds.min;
      if (m > bounds.max) m = bounds.max;
      state.month = m;
      state.cal = m;
      nodes.month.value = m;
    }
    var sec = p.get('sector');
    if (sec && DATA.sectors[sec]) { state.sector = sec; nodes.sector.value = sec; }
    if (p.get('id')) setTimeout(function () { openModal(p.get('id')); }, 60);
  }

  function syncUrl() {
    if (!nodes.modal.hidden) return;
    var q = [];
    if (state.view === 'list') q.push('view=list');
    if (state.month) q.push('month=' + state.month);
    if (state.sector) q.push('sector=' + state.sector);
    try { history.replaceState(null, '', location.pathname + (q.length ? '?' + q.join('&') : '')); } catch (e) { }
  }

  /* ---------------- 이벤트 ------------- */
  function bind() {
    nodes.views.forEach(function (b) {
      b.addEventListener('click', function () {
        state.view = b.getAttribute('data-view');
        render();
      });
    });
    var timer;
    nodes.q.addEventListener('input', function () {
      clearTimeout(timer);
      timer = setTimeout(function () { state.q = nodes.q.value.trim(); render(); }, 140);
    });
    nodes.region.addEventListener('change', function () {
      state.region = nodes.region.value;
      rebuildCountries();
      render();
    });
    nodes.country.addEventListener('change', function () { state.country = nodes.country.value; render(); });
    nodes.sector.addEventListener('change', function () { state.sector = nodes.sector.value; render(); });
    nodes.month.addEventListener('change', function () {
      state.month = nodes.month.value;
      if (state.month) { state.cal = state.month; }
      render();
    });
    nodes.reset.addEventListener('click', function () {
      state.q = ''; state.region = ''; state.country = ''; state.sector = ''; state.month = '';
      nodes.q.value = '';
      nodes.region.value = ''; nodes.sector.value = ''; nodes.month.value = '';
      rebuildCountries();
      state.cal = currentMonth();
      render();
    });
    nodes.prev.addEventListener('click', function () {
      var n = addMonth(state.cal, -1);
      if (n < bounds.min) return;
      state.cal = n;
      renderCalendar(filtered());
    });
    nodes.next.addEventListener('click', function () {
      var n = addMonth(state.cal, 1);
      if (n > bounds.max) return;
      state.cal = n;
      renderCalendar(filtered());
    });
    nodes.today.addEventListener('click', function () {
      state.cal = currentMonth();
      renderCalendar(filtered());
    });
    nodes.icsAll.addEventListener('click', function (e) {
      e.preventDefault();
      var list = filtered();
      var name = list.length === DATA.events.length
        ? 'insightbrief-exhibitions-2027.ics' : 'insightbrief-exhibitions-' + list.length + '.ics';
      download(name, icsLines(list));
    });
    document.addEventListener('click', function (e) {
      var chip = e.target.closest('[data-id]');
      if (chip && !e.target.closest('.ex-card a')) { openModal(chip.getAttribute('data-id')); return; }
      var ics = e.target.closest('[data-ics]');
      if (ics) {
        var ev = DATA.events.filter(function (x) { return x.id === ics.getAttribute('data-ics'); })[0];
        if (ev) download('insightbrief-' + ev.id + '.ics', icsLines([ev]));
      }
    });
    nodes.close.addEventListener('click', closeModal);
    nodes.modal.addEventListener('click', function (e) {
      if (e.target.getAttribute('data-close')) closeModal();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !nodes.modal.hidden) closeModal();
    });
    window.addEventListener('keydown', function (e) {
      if (nodes.modal.hidden) return;
      if (e.key !== 'Tab') return;
      var f = nodes.modal.querySelectorAll('a[href],button:not([disabled])');
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  }

  /* ---------------- 시작 ---------------- */
  function start() {
    if (window.__EXHIBITIONS__) { boot(window.__EXHIBITIONS__); return; }
    fetch('data/exhibitions.json', { cache: 'no-cache' })
      .then(function (r) { return r.json(); })
      .then(boot)
      .catch(function () {
        nodes.cal.innerHTML = '<div class="ex-empty">데이터를 불러오지 못했습니다.</div>';
      });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
