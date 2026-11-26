/* =========================================================
   INSIGHT BRIEF — global.html 동작
   ① 무역 이메일  ② 출장 허브  ③ 포털·휴무일
   · 모든 문구는 IBG_DATA(4개국어)에서 가져옵니다 → 번역 누락 없음
   · 입력값은 브라우저 밖으로 나가지 않습니다.
   ========================================================= */
(function () {
  'use strict';

  var D = window.IBG_DATA, M = window.IBG_MAIL;
  if (!D || !M) return;

  var html = document.documentElement;
  var RAW = (html.getAttribute('lang') || 'ko').toLowerCase();
  var LANG = /^en/.test(RAW) ? 'en' : /^zh/.test(RAW) ? 'zh' : /^ja/.test(RAW) ? 'ja' : 'ko';
  var LOCALE = { ko: 'ko-KR', en: 'en-US', zh: 'zh-CN', ja: 'ja-JP' }[LANG];
  var T = D.str[LANG] || D.str.ko;

  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function num(id) {
    var n = document.getElementById(id);
    if (!n) return 0;
    var v = parseFloat(String(n.value).replace(/[^0-9.\-]/g, ''));
    return isFinite(v) ? v : 0;
  }
  function val(id) {
    var n = document.getElementById(id);
    return n ? String(n.value == null ? '' : n.value).trim() : '';
  }
  function fmt(n, digits) {
    if (!isFinite(n)) return '–';
    return Number(n).toLocaleString(LOCALE, {
      minimumFractionDigits: digits || 0,
      maximumFractionDigits: digits || 0
    });
  }
  function lang(key) { return (key && (key[LANG] || key.ko)) || ''; }
  function bold(s) { return esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>'); }

  /* =========================================================
     ① 탭
  ========================================================= */
  var tabs = $$('#gl-tabs button');
  var panels = $$('[data-panel]');

  function activate(name, push) {
    var found = false;
    tabs.forEach(function (b) {
      var on = b.getAttribute('data-tab') === name;
      if (on) found = true;
      b.setAttribute('aria-selected', on ? 'true' : 'false');
      b.tabIndex = on ? 0 : -1;
      var p = document.getElementById(b.getAttribute('aria-controls'));
      if (p) p.hidden = !on;
    });
    if (!found) return;
    panels.forEach(function (p) { p.hidden = p.getAttribute('data-panel') !== name; });
    if (push && history.replaceState) history.replaceState(null, '', '#' + name);
  }

  tabs.forEach(function (b) {
    b.addEventListener('click', function () { activate(b.getAttribute('data-tab'), true); });
    b.addEventListener('keydown', function (e) {
      var i = tabs.indexOf(b);
      var next = null;
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        next = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
      } else if (e.key === 'Home') next = tabs[0];
      else if (e.key === 'End') next = tabs[tabs.length - 1];
      if (next) { e.preventDefault(); next.focus(); activate(next.getAttribute('data-tab'), true); }
    });
  });

  var startAt = (location.hash || '').replace('#', '');
  activate(/^(email|trip|portal)$/.test(startAt) ? startAt : 'email', false);

  /* 내비 드롭다운의 global.html#portal · #email · #trip 으로 들어오면
     같은 페이지에서 해시만 바뀌어도 그 탭을 바로 엽니다. */
  function tabFromHash() {
    var n = (location.hash || '').replace('#', '');
    return /^(email|trip|portal)$/.test(n) ? n : '';
  }
  window.addEventListener('hashchange', function () {
    var n = tabFromHash();
    if (!n) return;
    activate(n, false);
    var bar = document.getElementById('gl-tabs');
    if (bar && bar.scrollIntoView) bar.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  /* 해시 주소로 처음 열린 경우 탭 바가 보이도록 한 번만 내려 줍니다. */
  if (tabFromHash()) {
    var startBar = document.getElementById('gl-tabs');
    if (startBar && startBar.scrollIntoView) {
      setTimeout(function () { startBar.scrollIntoView({ block: 'start' }); }, 60);
    }
  }

  /* =========================================================
     공통 선택지 채우기
  ========================================================= */
  function option(value, label) {
    var o = document.createElement('option');
    o.value = value;
    o.textContent = label;
    return o;
  }

  var selTarget = $('#gl-target');
  if (selTarget) {
    selTarget.appendChild(option('us', T.c_us));
    selTarget.appendChild(option('cn', T.c_cn));
    selTarget.appendChild(option('jp', T.c_jp));
    selTarget.appendChild(option('kr', T.c_kr));
    selTarget.appendChild(option('eu', T.c_eu));
  }

  var selSit = $('#gl-situation');
  if (selSit) {
    M.order.forEach(function (k) { selSit.appendChild(option(k, T['s_' + k])); });
  }

  var selDest = $('#gl-dest');
  if (selDest) {
    D.dest.forEach(function (d) { selDest.appendChild(option(d.id, d.name[LANG] || d.name.ko)); });
  }

  var selRank = $('#gl-rank');
  if (selRank) {
    selRank.appendChild(option('g2', T.rank2));
    selRank.appendChild(option('g1d', T.rank1d));
    selRank.appendChild(option('g1c', T.rank1c));
    selRank.appendChild(option('g1b', T.rank1b));
  }

  var selUnit = $('#gl-unit-pick');
  if (selUnit) {
    D.units.forEach(function (u) { selUnit.appendChild(option(u.id, u.label[LANG] || u.label.ko)); });
  }

  /* =========================================================
     ① 무역 이메일
  ========================================================= */
  var MAIL_LANG = { us: 'en', eu: 'en', cn: 'zh', jp: 'ja', kr: 'ko' };

  function mailValues() {
    var v = {};
    ['to', 'from'].forEach(function (k) { v[k] = ''; });
    v.to = val('gl-to-name');
    v.toCompany = val('gl-to-company');
    v.from = val('gl-from-name');
    v.fromCompany = val('gl-from-company');
    v.product = val('gl-product');
    v.qty = val('gl-qty');
    v.unit = val('gl-unit');
    v.price = val('gl-price');
    v.cur = val('gl-cur') || 'USD';
    v.incoterm = val('gl-incoterm') || 'FOB';
    v.pol = val('gl-pol');
    v.pod = val('gl-pod');
    v.etd = val('gl-etd');
    v.deadline = val('gl-deadline');
    v.validity = val('gl-validity');
    v.invoice = val('gl-invoice');
    v.amount = val('gl-amount');
    v.spec = val('gl-spec');
    return v;
  }

  function fill(tpl, v, blanks) {
    return String(tpl).replace(/\{(\w+)\}/g, function (m, k) {
      var x = v[k];
      if (x == null || String(x).trim() === '') x = blanks[k] != null ? blanks[k] : m;
      return String(x);
    });
  }

  function buildMail() {
    var target = val('gl-target') || 'us';
    var sit = val('gl-situation') || 'inquiry';
    var langCode = MAIL_LANG[target] || 'en';
    var pack = (M[langCode] && M[langCode][sit]) || M.en.inquiry;
    var v = mailValues();
    var blanks = M.blank[langCode] || M.blank.en;
    var subject = fill(pack.subject, v, blanks);
    var body = fill(pack.body, v, blanks);
    var note = val('gl-note');
    if (note) {
      var parts = body.split('\n\n');
      if (parts.length > 1) {
        parts.splice(parts.length - 1, 0, note);
        body = parts.join('\n\n');
      } else {
        body = body + '\n\n' + note;
      }
    }
    return { subject: subject, body: body, sit: sit, langCode: langCode, target: target };
  }

  var out = $('#gl-mail-out');
  function renderMail() {
    var r = buildMail();
    var s = $('#gl-mail-subject'), b = $('#gl-mail-body');
    if (s) s.textContent = r.subject;
    if (b) b.textContent = r.body;
    if (out) out.hidden = false;
    var m = $('#gl-mailto');
    if (m) {
      m.href = 'mailto:?subject=' + encodeURIComponent(r.subject) + '&body=' + encodeURIComponent(r.body);
    }
    renderEtiq(r.target, r.langCode);
  }

  function renderEtiq(target, mailLang) {
    var wrap = $('#gl-etiq-body');
    if (!wrap) return;
    wrap.innerHTML = '';
    var list = (D.etiq[target] && (D.etiq[target][LANG] || D.etiq[target].ko)) || [];
    var ul = el('ul', 'gl-tips');
    list.forEach(function (t) { ul.appendChild(el('li', null, t)); });
    wrap.appendChild(ul);
    var tag = el('p', 'gl-etiq-lang');
    tag.textContent = T.target + ': ' + (T['c_' + target] || '') + ' · ' + (D.str[mailLang] ? D.str[mailLang].langName : '');
    wrap.insertBefore(tag, wrap.firstChild);
  }

  ['gl-target', 'gl-situation', 'gl-to-name', 'gl-to-company', 'gl-from-name', 'gl-from-company',
    'gl-product', 'gl-qty', 'gl-unit', 'gl-price', 'gl-cur', 'gl-incoterm', 'gl-pol', 'gl-pod',
    'gl-etd', 'gl-deadline', 'gl-validity', 'gl-invoice', 'gl-amount', 'gl-spec', 'gl-note'
  ].forEach(function (id) {
    var n = document.getElementById(id);
    if (!n) return;
    n.addEventListener('input', function () { if (out && !out.hidden) renderMail(); });
    n.addEventListener('change', function () { if (out && !out.hidden) renderMail(); });
  });

  var genBtn = $('#gl-gen');
  if (genBtn) genBtn.addEventListener('click', function () {
    renderMail();
    if (out) out.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });

  var copyBtn = $('#gl-copy');
  if (copyBtn) copyBtn.addEventListener('click', function () {
    var text = ($('#gl-mail-body') || {}).textContent || '';
    var done = function () {
      copyBtn.textContent = T.copied;
      setTimeout(function () { copyBtn.textContent = T.copyBtn; }, 1800);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, function () { alert(T.copyFail); });
    } else {
      var ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); done(); } catch (e) { alert(T.copyFail); }
      document.body.removeChild(ta);
    }
  });

  var printBtn = $('#gl-print');
  if (printBtn) printBtn.addEventListener('click', function () { window.print(); });

  /* =========================================================
     ② 출장 허브
  ========================================================= */
  function destById(id) {
    for (var i = 0; i < D.dest.length; i++) if (D.dest[i].id === id) return D.dest[i];
    return D.dest[0];
  }

  function applyRates() {
    var d = destById(val('gl-dest'));
    var rank = val('gl-rank') || 'g2';
    var row = (D.perdiem[d.grade] && D.perdiem[d.grade][rank]) || [30, 176, 81];
    setVal('gl-daily', row[0]);
    setVal('gl-hotelcap', row[1]);
    setVal('gl-meal', row[2]);
    renderFacts(d);
    renderLinks(d);
    var tip = $('#gl-trip-tip');
    if (tip) tip.innerHTML = '<b>' + esc(d.name[LANG] || d.name.ko) + '</b> · ' + esc(d.trip[LANG] || d.trip.ko);
  }

  function setVal(id, v) {
    var n = document.getElementById(id);
    if (n) n.value = v;
  }

  function renderFacts(d) {
    var box = $('#gl-facts');
    if (!box) return;
    var rows = [
      [T.destH, d.name[LANG] || d.name.ko],
      [T.tzL, d.tz],
      [T.curL, d.cur],
      [T.voltH, d.volt],
      [T.airportL, d.air]
    ];
    box.innerHTML = rows.map(function (r) {
      return '<div class="gl-fact"><span>' + esc(r[0]) + '</span><b>' + esc(r[1]) + '</b></div>';
    }).join('');
  }

  function computeTrip() {
    var days = Math.max(0, num('gl-days'));
    var nights = Math.max(0, num('gl-nights'));
    var cap = num('gl-hotelcap');
    var hotel = num('gl-hotel-actual');
    if (!hotel || hotel > cap) hotel = cap;
    var daily = num('gl-daily');
    var meal = num('gl-meal');
    var rate = num('gl-rate') || 1345;
    var air = num('gl-air');
    var ground = num('gl-ground');

    var dTotal = daily * days;
    var mTotal = meal * days;
    var hTotal = hotel * nights;
    var usd = dTotal + mTotal + hTotal;
    var krw = usd * rate + air + ground;

    var tb = $('#gl-settle-body');
    if (tb) {
      tb.innerHTML = [
        [T.rDaily, daily + ' × ' + days, dTotal],
        [T.rMeal, meal + ' × ' + days, mTotal],
        [T.rHotel, hotel + ' × ' + nights, hTotal]
      ].map(function (r) {
        return '<tr><td>' + esc(r[0]) + '</td><td class="num">' + esc(r[1]) + '</td><td class="num">' +
          fmt(r[2], 0) + '</td><td class="num">' + fmt(r[2] * rate, 0) + '</td></tr>';
      }).join('') +
        '<tr><td>' + esc(T.rAir) + '</td><td class="num">—</td><td class="num">—</td><td class="num">' + fmt(air, 0) + '</td></tr>' +
        '<tr><td>' + esc(T.rGround) + '</td><td class="num">—</td><td class="num">—</td><td class="num">' + fmt(ground, 0) + '</td></tr>';
    }
    var tf = $('#gl-settle-foot');
    if (tf) {
      tf.innerHTML = '<tr><td>' + esc(T.rTotal) + '</td><td class="num"></td><td class="num">' + fmt(usd, 0) +
        '</td><td class="num">' + fmt(krw, 0) + '</td></tr>';
    }
    var kp = $('#gl-kpis');
    if (kp) {
      kp.innerHTML =
        '<div class="bz-kpi"><span class="k">' + esc(T.rTotal) + ' (USD)</span><b class="v">$' + fmt(usd, 0) + '</b><span class="d">' + esc(T.usd) + '</span></div>' +
        '<div class="bz-kpi accent"><span class="k">' + esc(T.krw) + '</span><b class="v">' + fmt(krw, 0) + '</b><span class="d">KRW</span></div>' +
        '<div class="bz-kpi"><span class="k">' + esc(T.perDayAvg) + '</span><b class="v">' + fmt(days ? krw / days : 0, 0) + '</b><span class="d">KRW</span></div>';
    }
    return { days: days, nights: nights, daily: daily, meal: meal, hotel: hotel, cap: cap, rate: rate, air: air, ground: ground, usd: usd, krw: krw };
  }

  ['gl-dest', 'gl-rank', 'gl-days', 'gl-nights', 'gl-hotelcap', 'gl-hotel-actual', 'gl-daily', 'gl-meal', 'gl-air', 'gl-ground', 'gl-rate'].forEach(function (id) {
    var n = document.getElementById(id);
    if (!n) return;
    var isPick = (id === 'gl-dest' || id === 'gl-rank');
    n.addEventListener('change', function () {
      if (isPick) { applyRates(); setVal('gl-hotel-actual', num('gl-hotelcap')); }
      computeTrip();
    });
    n.addEventListener('input', function () { computeTrip(); });
  });

  var sumCopy = $('#gl-sum-copy');
  if (sumCopy) sumCopy.addEventListener('click', function () {
    var r = computeTrip();
    var d = destById(val('gl-dest'));
    var lines = [
      '[' + (d.name[LANG] || d.name.ko) + ']',
      T.rDaily + ': $' + r.daily + ' × ' + r.days + ' = $' + fmt(r.daily * r.days, 0),
      T.rMeal + ': $' + r.meal + ' × ' + r.days + ' = $' + fmt(r.meal * r.days, 0),
      T.rHotel + ': $' + r.hotel + ' × ' + r.nights + ' = $' + fmt(r.hotel * r.nights, 0),
      T.rAir + ': ' + fmt(r.air, 0) + ' KRW',
      T.rGround + ': ' + fmt(r.ground, 0) + ' KRW',
      T.rateH + ': ' + fmt(r.rate, 0),
      T.rTotal + ': $' + fmt(r.usd, 0) + ' / ' + fmt(r.krw, 0) + ' KRW'
    ];
    var text = lines.join('\n');
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        sumCopy.textContent = T.copied;
        setTimeout(function () { sumCopy.textContent = T.copySum; }, 1800);
      }, function () { alert(T.copyFail); });
    } else {
      alert(text);
    }
  });

  function renderDuty() {
    var tb = $('#gl-duty-body');
    if (!tb) return;
    tb.innerHTML = D.duty.map(function (x) {
      return '<tr><td><b>' + esc(x.code) + '</b> <span class="sub">' + esc(x.name[LANG] || x.name.ko) + '</span></td>' +
        '<td class="num">' + esc(x.amount) + '</td>' +
        '<td class="gl-cell-text">' + esc(x.liquor[LANG] || x.liquor.ko) + '</td>' +
        '<td><a href="' + esc(x.src) + '" target="_blank" rel="noopener noreferrer">' + esc(T.source) + '</a></td></tr>';
    }).join('');
  }

  function renderUnits() {
    function calc() {
      var id = val('gl-unit-pick');
      var u = null;
      for (var i = 0; i < D.units.length; i++) if (D.units[i].id === id) u = D.units[i];
      if (!u) return;
      var v = parseFloat(String(val('gl-unit-val')).replace(/[^0-9.\-]/g, ''));
      var o = $('#gl-unit-out');
      if (!o) return;
      if (!isFinite(v)) { o.textContent = '–'; return; }
      var res;
      if (u.t === 'f2c') res = (v - 32) * 5 / 9;
      else if (u.t === 'c2f') res = v * 9 / 5 + 32;
      else res = v * u.k;
      o.textContent = fmt(res, Math.abs(res) < 10 ? 3 : 2) + ' ' + u.b;
    }
    var pick = $('#gl-unit-pick'), inp = $('#gl-unit-val');
    if (pick) pick.addEventListener('change', calc);
    if (inp) inp.addEventListener('input', calc);
    calc();
  }

  function nm(x) { return typeof x.name === 'string' ? x.name : (x.name[LANG] || x.name.ko); }

  function renderLinks(d) {
    var air = $('#gl-air-links');
    if (air) {
      var hl = { ko: 'ko', en: 'en', zh: 'zh-CN', ja: 'ja' }[LANG];
      var q = encodeURIComponent('Flights from Seoul to ' + d.city);
      var first = '<a class="gl-link" href="https://www.google.com/travel/flights?hl=' + hl + '&q=' + q +
        '" target="_blank" rel="noopener noreferrer"><b>Google Flights</b><span>' + esc(d.city) + '</span></a>';
      air.innerHTML = first + D.flightSearch.concat(D.airlines).map(function (x) {
        return '<a class="gl-link" href="' + esc(x.url) + '" target="_blank" rel="noopener noreferrer"><b>' +
          esc(nm(x)) + '</b><span>' + esc(T.airLinksH) + '</span></a>';
      }).join('');
    }
    var hotel = $('#gl-hotel-links');
    if (hotel) {
      hotel.innerHTML = D.hotelSearch.map(function (x) {
        return '<a class="gl-link" href="' + esc(x.url) + '" target="_blank" rel="noopener noreferrer"><b>' +
          esc(nm(x)) + '</b><span>' + esc(d.city) + '</span></a>';
      }).join('');
    }
    var food = $('#gl-food-links');
    if (food) {
      var mq = encodeURIComponent('business dinner restaurant ' + d.city);
      food.innerHTML = D.foodLinks.map(function (x) {
        var url = x.name === 'Google Maps' ? x.url + mq : x.url;
        return '<a class="gl-link" href="' + esc(url) + '" target="_blank" rel="noopener noreferrer"><b>' +
          esc(nm(x)) + '</b><span>' + esc(d.city) + '</span></a>';
      }).join('');
    }
    var extra = $('#gl-trip-extra');
    if (extra && D.tripExtras) {
      extra.innerHTML = D.tripExtras.map(function (x) {
        return '<a class="gl-link" rel="sponsored noopener noreferrer" href="' + esc(x.url) +
          '" target="_blank"><b>' + esc(nm(x)) + '</b><span>' + esc(nm({ name: x.note })) + '</span></a>';
      }).join('');
    }
  }

  function renderCheck() {
    var box = $('#gl-check');
    if (!box) return;
    var list = D.check[LANG] || D.check.ko;
    box.innerHTML = list.map(function (t, i) {
      return '<label class="bz-check"><input type="checkbox"><span>' + esc(t) + '</span></label>';
    }).join('');
  }

  /* =========================================================
     ③ 포털·휴무일
  ========================================================= */
  var CTY_ORDER = ['kr', 'us', 'cn', 'uk', 'jp', 'in', 'vn', 'gl'];

  function badge(chk) {
    if (chk === 'bot') return T.botBlocked;
    if (chk === 'kr') return T.krOnly;
    return T.verified + ' 2026-11-24';
  }

  function card(p) {
    return '<a class="gl-portal" href="' + esc(p.url) + '" target="_blank" rel="noopener noreferrer">' +
      '<span class="gl-code">' + esc(p.code) + '</span>' +
      '<b>' + esc(p.name[LANG] || p.name.ko) + '</b>' +
      '<span class="gl-pdesc">' + esc(p.desc[LANG] || p.desc.ko) + '</span>' +
      '<span class="gl-pok">' + esc(badge(p.chk)) + ' ↗</span></a>';
  }

  function renderSteps() {
    var box = $('#gl-steps');
    if (!box) return;
    box.innerHTML = D.steps.map(function (s) {
      return '<article class="gl-step"><span class="gl-step-n">' + esc(s.n) + '</span>' +
        '<h3>' + esc(s.t[LANG] || s.t.ko) + '</h3>' +
        '<p>' + esc(s.d[LANG] || s.d.ko) + '</p></article>';
    }).join('');
  }

  function renderCompanies() {
    var box = $('#gl-compgrid');
    if (!box) return;
    box.innerHTML = CTY_ORDER.map(function (c) {
      var items = D.pcount.filter(function (p) { return p.cty === c; });
      if (!items.length) return '';
      var tip = D.ctips[c] ? D.ctips[c][LANG] || D.ctips[c].ko : '';
      return '<div class="gl-cty"><div class="gl-cty-head"><h4>' + esc(T['c_' + c] || c) + '</h4>' +
        (tip ? '<p><span>' + esc(T.ctipH) + '</span> ' + esc(tip) + '</p>' : '') + '</div>' +
        '<div class="gl-pgrid">' + items.map(card).join('') + '</div></div>';
    }).join('');
  }

  function renderPortals() {
    var box = $('#gl-portals');
    if (!box) return;
    var groups = [['customs', T.g_customs], ['cert', T.g_cert], ['stat', T.g_stat]];
    box.innerHTML = groups.map(function (g) {
      var items = D.portals.filter(function (p) { return p.g === g[0]; });
      if (!items.length) return '';
      return '<div class="gl-pgroup"><h3>' + esc(g[1]) + '</h3><div class="gl-pgrid">' +
        items.map(card).join('') + '</div></div>';
    }).join('');
  }

  function pcard(p) {
    return '<a class="gl-portal" href="' + esc(p.url) + '" target="_blank" rel="noopener noreferrer">' +
      '<span class="gl-code">' + esc(p.code) + '</span>' +
      '<b>' + esc(p.name) + '</b>' +
      '<span class="gl-pdesc">' + esc(p.desc) + '</span>' +
      '<span class="gl-pok">' + esc(badge(p.chk)) + ' ↗</span></a>';
  }

  function procTable(head, rows) {
    return '<table class="bz-table gl-cmp"><thead><tr>' +
      head.map(function (h) { return '<th>' + esc(h) + '</th>'; }).join('') +
      '</tr></thead><tbody>' +
      rows.map(function (r) {
        return '<tr>' + r.map(function (c, i) {
          return '<td class="gl-cell-text">' + (i === 0 ? '<b>' + esc(c) + '</b>' : esc(c)) + '</td>';
        }).join('') + '</tr>';
      }).join('') + '</tbody></table>';
  }

  function renderProc() {
    var P = D.proc[LANG] || D.proc.ko;
    var lead = $('#gl-proc-lead');
    if (lead) lead.textContent = P.lead;
    var box = $('#gl-procure');
    if (box) box.innerHTML = '<div class="gl-pgrid">' + P.sites.map(pcard).join('') + '</div>';
    var g = $('#gl-procguide');
    if (!g) return;
    var steps = P.steps.map(function (s, i) {
      return '<article class="gl-step"><span class="gl-step-n">' + (i + 1) + '</span>' +
        '<h3>' + esc(s.t) + '</h3><p>' + esc(s.d) + '</p></article>';
    }).join('');
    g.innerHTML =
      '<div class="gl-law"><h4>' + esc(P.lawTitle) + '</h4><ul>' +
      P.laws.map(function (l) { return '<li>' + esc(l) + '</li>'; }).join('') + '</ul></div>' +
      '<h4 class="gl-sub">' + esc(P.cmpTitle) + '</h4>' + procTable(P.cmpHead, P.cmp) +
      '<h4 class="gl-sub">' + esc(P.mfgTitle) + '</h4>' + procTable(P.mfgHead, P.mfg) +
      '<h4 class="gl-sub">' + esc(P.stepTitle) + '</h4><div class="gl-steps">' + steps + '</div>' +
      '<h4 class="gl-sub">' + esc(P.checkTitle) + '</h4><ul class="gl-tips">' +
      P.checks.map(function (c) { return '<li>' + esc(c) + '</li>'; }).join('') + '</ul>';
  }

  function renderPaid() {
    var box = $('#gl-paid');
    if (!box) return;
    box.innerHTML = '<div class="gl-pgrid">' + D.paid.map(card).join('') + '</div>';
  }

  function renderHolidays() {
    var tb = $('#gl-hol-body');
    if (!tb) return;
    var months = D.months[LANG] || D.months.ko;
    var cols = ['kr', 'cn', 'jp', 'us'];
    var rows = [];
    for (var m = 1; m <= 12; m++) {
      var mm = (m < 10 ? '0' : '') + m;
      rows.push('<tr><th scope="row">' + esc(months[m - 1]) + '</th>' + cols.map(function (c) {
        var items = D.holidays.filter(function (h) {
          return h.c === c && h.d.slice(0, 7) === '2027-' + mm;
        });
        if (!items.length) return '<td class="gl-empty">·</td>';
        return '<td>' + items.map(function (h) {
          var day = parseInt(h.d.slice(8, 10), 10);
          return '<span class="gl-hol ' + (h.t === 'p' ? 'is-peak' : '') + '">' +
            '<i>' + day + '</i>' + esc(h.n[LANG] || h.n.ko) + '</span>';
        }).join('') + '</td>';
      }).join('') + '</tr>');
    }
    tb.innerHTML = rows.join('');
  }

  function renderShip() {
    var box = $('#gl-ship');
    if (!box) return;
    box.innerHTML = D.ship.map(function (s) {
      return '<article class="gl-shipcard"><header><b>' + esc(s.n[LANG] || s.n.ko) + '</b><span>' +
        esc(s.when) + '</span></header><p>' + bold(s.t[LANG] || s.t.ko) + '</p></article>';
    }).join('');
  }

  /* =========================================================
     시작
  ========================================================= */
  applyRates();
  setVal('gl-hotel-actual', num('gl-hotelcap'));
  computeTrip();
  renderDuty();
  renderUnits();
  renderCheck();
  renderSteps();
  renderCompanies();
  renderProc();
  renderPortals();
  renderPaid();
  renderHolidays();
  renderShip();
  renderMail();

  var updated = $('#gl-updated');
  if (updated) updated.textContent = T.updated + ' 2026-11-24';
})();
