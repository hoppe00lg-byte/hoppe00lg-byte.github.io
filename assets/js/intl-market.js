/* =========================================================
   INSIGHT BRIEF — 국가별 시황 (/en/ /zh/ /ja/)
   · 기준 통화와 주요 지수를 그 나라 시장에 맞춰 맨 앞에 배치합니다.
   · 시세는 동방재부(eastmoney) 공개 호가에서 확인된 값만 씁니다.
     응답이 없으면 숫자를 지어내지 않고 '—' 로 두고 안내만 남깁니다.
   · 한국어 페이지에서는 동작하지 않습니다(app.js 가 그대로 동작).
   ========================================================= */
(function () {
  'use strict';
  var I = window.IB_INTL;
  if (!I) return;
  var L = I.lang;

  var API = 'https://push2delay.eastmoney.com/api/qt/ulist.np/get?fltt=2&invt=2&fields=f2,f3,f4,f12,f13,f14,f18&secids=';
  var SRC_NAME = { en: 'Eastmoney real-time quote', zh: '东方财富实时行情', ja: '東方財富リアルタイム' }[L];

  /* ---------- 언어별 구성 ---------- */
  var CFG = {
    en: {
      title: 'US dollar rates & US indices',
      sub: 'Base currency: US dollar. Live quotes refreshed every 60 seconds.',
      fxTitle: 'Key rates',
      idxTitle: 'US indices',
      items: [
        { name: 'EUR / USD', sec: '119.EURUSD', dec: 4, url: 'https://quote.eastmoney.com/forex/EURUSD.html', unit: '' },
        { name: 'USD / JPY', sec: '119.USDJPY', dec: 3, url: 'https://quote.eastmoney.com/forex/USDJPY.html', unit: '' },
        { name: 'USD / CNH', sec: '133.USDCNH', dec: 4, url: 'https://quote.eastmoney.com/forex/USDCNH.html', unit: '' },
        { name: 'Dollar index (DXY)', sec: '100.UDI', dec: 2, url: 'https://quote.eastmoney.com/globalindex/UDI.html', unit: '' },
        { name: 'S&P 500', sec: '100.SPX', dec: 2, url: 'https://quote.eastmoney.com/globalindex/SPX.html', unit: '', idx: true },
        { name: 'NASDAQ-100', sec: '100.NDX', dec: 2, url: 'https://quote.eastmoney.com/globalindex/NDX.html', unit: '', idx: true },
        { name: 'Dow Jones', sec: '100.DJIA', dec: 2, url: 'https://quote.eastmoney.com/globalindex/DJIA.html', unit: '', idx: true }
      ],
      base: 'US$1 = 1,000',
      note: 'Quotes are shown as delivered by the source; the Korean-won panels of this page are kept below for readers following the Korean market.',
      fail: 'Live quotes could not be loaded right now. Nothing is filled in from an estimate — please check again shortly.'
    },
    zh: {
      title: '人民币汇率与A股指数',
      sub: '基准货币：人民币。行情每 60 秒刷新一次。',
      fxTitle: '主要汇率',
      idxTitle: '主要指数',
      futTitle: '主要期货（SHFE · DCE · ZCE）',
      items: [
        { name: '美元 / 人民币', sec: '133.USDCNH', dec: 4, url: 'https://quote.eastmoney.com/forex/USDCNH.html', unit: '' },
        { name: '欧元 / 人民币', calc: 'eurcny', dec: 4, url: 'https://quote.eastmoney.com/forex/EURCNY.html', unit: '' },
        { name: '100日元 / 人民币', calc: 'jpycny', dec: 4, url: 'https://quote.eastmoney.com/forex/JPYCNH.html', unit: '' },
        { name: '上证指数', sec: '1.000001', dec: 2, url: 'https://quote.eastmoney.com/zs000001.html', unit: '', idx: true },
        { name: '深证成指', sec: '0.399001', dec: 2, url: 'https://quote.eastmoney.com/zs399001.html', unit: '', idx: true },
        { name: '恒生指数', sec: '100.HSI', dec: 2, url: 'https://quote.eastmoney.com/globalindex/HSI.html', unit: '', idx: true },
        { name: '沪铜 (SHFE)', sec: '113.cu2701', dec: 0, url: 'https://quote.eastmoney.com/qihuo/cu2701.html', unit: '元/吨', fut: true },
        { name: '沪铝 (SHFE)', sec: '113.al2701', dec: 0, url: 'https://quote.eastmoney.com/qihuo/al2701.html', unit: '元/吨', fut: true },
        { name: '上海原油 (INE)', sec: '142.sc2701', dec: 1, url: 'https://quote.eastmoney.com/qihuo/sc2701.html', unit: '元/桶', fut: true },
        { name: 'PP (DCE)', sec: '114.pp2701', dec: 0, url: 'https://quote.eastmoney.com/qihuo/pp2701.html', unit: '元/吨', fut: true },
        { name: '乙二醇 (DCE)', sec: '114.eg2701', dec: 0, url: 'https://quote.eastmoney.com/qihuo/eg2701.html', unit: '元/吨', fut: true },
        { name: 'PTA (ZCE)', sec: '115.TA701', dec: 0, url: 'https://quote.eastmoney.com/qihuo/TA701.html', unit: '元/吨', fut: true }
      ],
      note: '行情按数据源原样显示；下方保留韩国市场版面，供关注韩国市场的读者参考。',
      fail: '暂时无法获取实时行情。本页不会用估算值填充，请稍后再看。'
    },
    ja: {
      title: '円相場と日本株指数',
      sub: '基準通貨：円。相場は60秒ごとに更新します。',
      fxTitle: '主要為替',
      idxTitle: '日本株指数',
      items: [
        { name: '米ドル / 円', sec: '119.USDJPY', dec: 3, url: 'https://quote.eastmoney.com/forex/USDJPY.html', unit: '' },
        { name: 'ユーロ / 円', sec: '119.EURJPY', dec: 3, url: 'https://quote.eastmoney.com/forex/EURJPY.html', unit: '' },
        { name: '人民元 / 円', calc: 'cnyjpy', dec: 3, url: 'https://quote.eastmoney.com/forex/CNHJPY.html', unit: '' },
        { name: '日経225', sec: '100.N225', dec: 2, url: 'https://quote.eastmoney.com/globalindex/N225.html', unit: '', idx: true },
        { name: 'NYダウ', sec: '100.DJIA', dec: 2, url: 'https://quote.eastmoney.com/globalindex/DJIA.html', unit: '', idx: true },
        { name: 'ナスダック100', sec: '100.NDX', dec: 2, url: 'https://quote.eastmoney.com/globalindex/NDX.html', unit: '', idx: true }
      ],
      note: '相場はデータ提供元の値をそのまま表示します。TOPIX は無料で取得できる同一ソースがないため載せていません。下段には韓国市場の版面を残しています。',
      fail: 'いまはリアルタイム相場を取得できません。推計値は入れずにおきますので、しばらくしてからご確認ください。'
    }
  }[L];

  var SECIDS = ['119.EURUSD', '119.USDJPY', '119.EURJPY', '133.USDCNH', '100.UDI',
    '100.SPX', '100.NDX', '100.DJIA', '100.N225', '100.HSI', '1.000001', '0.399001',
    '113.cu2701', '113.al2701', '142.sc2701', '114.pp2701', '114.eg2701', '115.TA701'];

  var state = { data: null, at: null, timer: null };

  function $(s, r) { return (r || document).querySelector(s); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  function nf(v, d) {
    return new Intl.NumberFormat(I.cur.loc, { minimumFractionDigits: d, maximumFractionDigits: d }).format(v);
  }
  function hm() {
    var d = new Date();
    var p = function (n) { return n < 10 ? '0' + n : '' + n; };
    return p(d.getHours()) + ':' + p(d.getMinutes());
  }

  function fetchQuotes() {
    var url = API + encodeURIComponent(SECIDS.join(','));
    var ctrl = (typeof AbortController === 'function') ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, 12000);
    var opt = { cache: 'no-store', credentials: 'omit' };
    if (ctrl) opt.signal = ctrl.signal;
    return fetch(url, opt).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    }).then(function (j) {
      clearTimeout(timer);
      var diff = (j && j.data && j.data.diff) || [];
      if (!diff.length) throw new Error('empty');
      var by = {};
      diff.forEach(function (it) {
        if (it && it.f12 != null) by[(String(it.f13) + '.' + String(it.f12)).toUpperCase()] = it;
      });
      state.data = by;
      state.at = new Date();
      return by;
    }, function (e) {
      clearTimeout(timer);
      throw e;
    });
  }

  function num(it, k) {
    if (!it || it[k] == null || it[k] === '-') return null;
    var v = Number(it[k]);
    return isFinite(v) ? v : null;
  }

  function quoteFor(item) {
    if (item.calc) {
      var jpy = state.data && state.data['119.USDJPY'];
      var cnh = state.data && state.data['133.USDCNH'];
      var eur = state.data && state.data['119.EURUSD'];
      var pJpy = num(jpy, 'f2'), pCnh = num(cnh, 'f2'), pEur = num(eur, 'f2');
      if (item.calc === 'eurcny' && pEur && pCnh) {
        return { price: pEur * pCnh, pct: num(eur, 'f3'), chg: num(eur, 'f4') };
      }
      if (item.calc === 'jpycny' && pJpy && pCnh) {
        return { price: pCnh / pJpy * 100, pct: num(jpy, 'f3') };
      }
      if (item.calc === 'cnyjpy' && pJpy && pCnh) {
        return { price: pJpy / pCnh, pct: num(jpy, 'f3') };
      }
      return null;
    }
    var it = state.data && state.data[String(item.sec).toUpperCase()];
    var price = num(it, 'f2');
    if (price == null) return null;
    return { price: price, pct: num(it, 'f3'), chg: num(it, 'f4') };
  }

  function card(item) {
    var q = quoteFor(item);
    var dir = q && q.pct != null ? (q.pct > 0 ? 'up' : q.pct < 0 ? 'down' : 'flat') : 'flat';
    var mark = dir === 'up' ? '▲' : dir === 'down' ? '▼' : '·';
    var val = q ? nf(q.price, item.dec) : '—';
    var delta = (q && q.pct != null)
      ? '<span class="mk-delta is-' + dir + '">' + mark + ' ' + (q.pct > 0 ? '+' : '') + q.pct.toFixed(2) + '%</span>'
      : '<span class="mk-delta is-flat">—</span>';
    return '<a class="il-mk-card" href="' + esc(item.url) + '" target="_blank" rel="noopener noreferrer">' +
      '<span class="il-mk-name">' + esc(item.name) + '</span>' +
      '<b class="il-mk-val">' + val + (item.unit ? '<em>' + esc(item.unit) + '</em>' : '') + '</b>' +
      delta +
      '</a>';
  }

  function boardHTML() {
    var fx = CFG.items.filter(function (x) { return !x.idx && !x.fut; });
    var idx = CFG.items.filter(function (x) { return x.idx; });
    var fut = CFG.items.filter(function (x) { return x.fut; });
    return '<div class="il-mk-head"><div><h2>' + esc(CFG.title) + '</h2><p>' + esc(CFG.sub) + '</p></div>' +
      '<span class="il-mk-live" id="il-mk-live">LIVE · ' + esc(hm()) + '</span></div>' +
      '<h3 class="il-mk-sub">' + esc(CFG.fxTitle) + '</h3>' +
      '<div class="il-mk-grid">' + fx.map(card).join('') + '</div>' +
      (idx.length ? '<h3 class="il-mk-sub">' + esc(CFG.idxTitle) + '</h3><div class="il-mk-grid">' + idx.map(card).join('') + '</div>' : '') +
      (fut.length ? (CFG.futTitle ? '<h3 class="il-mk-sub">' + esc(CFG.futTitle) + '</h3>' : '') + '<div class="il-mk-grid">' + fut.map(card).join('') + '</div>' : '') +
      '<p class="il-mk-note" id="il-mk-note">' + esc(CFG.note) + '</p>';
  }

  function ensureStyle() {
    if ($('#il-mk-style')) return;
    var st = document.createElement('style');
    st.id = 'il-mk-style';
    st.textContent =
      '.il-mk{border:1px solid rgba(23,20,15,.14);border-radius:14px;background:#fff;padding:18px 20px;margin:0 0 22px}' +
      '.il-mk-head{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap}' +
      '.il-mk-head h2{margin:0;font-size:20px;letter-spacing:-.01em}' +
      '.il-mk-head p{margin:4px 0 0;font-size:12.5px;color:#6b655c}' +
      '.il-mk-live{font:600 11px/1 var(--mono,monospace);letter-spacing:.08em;color:#b3261e;border:1px solid rgba(179,38,30,.3);border-radius:999px;padding:6px 10px;white-space:nowrap}' +
      '.il-mk-sub{margin:16px 0 8px;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#6b655c}' +
      '.il-mk-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(168px,1fr));gap:8px}' +
      '.il-mk-card{display:block;border:1px solid rgba(23,20,15,.12);border-radius:10px;padding:11px 12px;text-decoration:none;color:inherit}' +
      '.il-mk-card:hover{border-color:rgba(179,38,30,.45)}' +
      '.il-mk-name{display:block;font-size:12px;color:#6b655c;letter-spacing:.01em}' +
      '.il-mk-val{display:block;margin:5px 0 3px;font-size:19px;font-weight:700;letter-spacing:-.02em}' +
      '.il-mk-val em{font-style:normal;font-size:10.5px;font-weight:400;color:#6b655c;margin-left:4px}' +
      '.il-mk-note{margin:12px 0 0;font-size:11.5px;line-height:1.5;color:#6b655c}' +
      '.il-mk-err{margin:10px 0 0;font-size:12.5px;color:#b3261e}' +
      '@media(max-width:640px){.il-mk-grid{grid-template-columns:repeat(2,1fr)}.il-mk-val{font-size:17px}}';
    document.head.appendChild(st);
  }

  function render() {
    var host = $('#il-mk');
    if (!host) return;
    var live = $('#il-mk-live');
    if (live) live.textContent = 'LIVE · ' + hm();
    var grid = host.querySelectorAll('.il-mk-grid');
    var fx = CFG.items.filter(function (x) { return !x.idx && !x.fut; });
    var idx = CFG.items.filter(function (x) { return x.idx; });
    var fut = CFG.items.filter(function (x) { return x.fut; });
    var gi = 0;
    if (grid[gi]) grid[gi].innerHTML = fx.map(card).join('');
    if (idx.length && grid[++gi]) grid[gi].innerHTML = idx.map(card).join('');
    if (fut.length && grid[idx.length ? ++gi : gi]) grid[idx.length ? gi : gi].innerHTML = fut.map(card).join('');
  }

  function fail() {
    var note = $('#il-mk-note');
    if (note) note.innerHTML = esc(CFG.fail);
    var live = $('#il-mk-live');
    if (live) live.textContent = 'LIVE · —';
  }

  function load() {
    return fetchQuotes().then(function () { render(); }, function () { fail(); });
  }

  /* ---------- 시장 페이지: 국가 보드 삽입 ---------- */
  function mountMarket() {
    var page = $('.mk-page');
    var board = $('#market-board');
    if (!page || !board || $('#il-mk')) return;
    ensureStyle();
    var sec = document.createElement('section');
    sec.id = 'il-mk';
    sec.className = 'il-mk';
    sec.setAttribute('aria-label', CFG.title);
    sec.innerHTML = boardHTML();
    board.parentNode.insertBefore(sec, board);
    /* 한국 시장 전용 묶음(원화 환율 카드·국내 지표 표)은 이 국가 페이지에서 감춥니다. */
    var st = document.createElement('style');
    st.textContent = '#t-fx,#t-korea{display:none!important}' +
      '.mk-scard[data-mk-live="USD/KRW"],.mk-scard[data-mk-live="JPY/KRW"],' +
      '.mk-scard[data-mk-live="CNY/KRW"],.mk-scard[data-mk-live="BOK-PPI"]{display:none!important}';
    document.head.appendChild(st);
    load();
    clearInterval(state.timer);
    state.timer = setInterval(load, 60000);
  }

  /* ---------- 홈: 상단 시세 띠 교체 ---------- */
  function stripHTML() {
    return CFG.items.filter(function (x) { return !x.fut; }).slice(0, 6).map(function (item) {
      var q = quoteFor(item);
      var dir = q && q.pct != null ? (q.pct > 0 ? 'up' : q.pct < 0 ? 'down' : 'flat') : 'flat';
      var mark = dir === 'up' ? '▲' : dir === 'down' ? '▼' : '·';
      return '<span class="mks-item" data-il-mk="1" title="' + esc(SRC_NAME) + '">' +
        '<span class="mks-code">' + esc(item.name) + '</span>' +
        '<b class="mks-val">' + (q ? nf(q.price, item.dec) : '—') + '</b>' +
        '<span class="mks-unit">' + esc(item.unit || '') + '</span>' +
        ((q && q.pct != null) ? '<span class="mk-delta is-' + dir + '">' + mark + ' ' + (q.pct > 0 ? '+' : '') + q.pct.toFixed(2) + '%</span>' : '') +
        '</span>';
    }).join('');
  }

  function mountStrip() {
    var strip = $('#market-strip');
    if (!strip) return;
    ensureStyle();
    strip.hidden = false;
    function paint() {
      var inner = strip.querySelector('.mks-inner');
      if (!inner) {
        strip.innerHTML = '<div class="container mks-inner"></div>';
        inner = strip.querySelector('.mks-inner');
      }
      if (!inner || inner.getAttribute('data-il') === '1' && inner.querySelector('b.mks-val')) return;
      inner.setAttribute('data-il', '1');
      inner.innerHTML = stripHTML();
      inner.setAttribute('aria-label', CFG.title);
    }
    load().then(paint, paint);
    clearInterval(state.timer);
    state.timer = setInterval(function () { load().then(paint, function () {}); }, 60000);
    /* app.js 가 원화 기준 띠를 다시 그리면 국가 기준으로 되돌립니다. */
    try {
      new MutationObserver(function () {
        var inner = strip.querySelector('.mks-inner');
        if (inner && (inner.getAttribute('data-il') !== '1' || !/LIVE|—/.test(inner.textContent))) paint();
      }).observe(strip, { childList: true });
    } catch (e) { /* noop */ }
  }

  if ($('#market-board')) mountMarket();
  else if ($('#market-strip')) mountStrip();
})();
