/* =========================================================
   INSIGHT BRIEF — app.js
   모든 화면은 data/site.json + data/articles.json 에서 렌더링됩니다.
   ========================================================= */
(function () {
  'use strict';

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* /a/{id}.html 로 들어오면 사이트 루트가 한 단계 위입니다.
     그 밖의 페이지(index.html, article.html?id=...)에서는 현재 폴더가 루트입니다. */
  var BASE = /\/a\/[^\/]+\.html$/.test(window.location.pathname || '') ? '../' : '';
  function U(path) { return BASE + path; }

  var state = {
    site: null,
    articles: [],
    market: null,
    marketHistory: null,
    marketSeries: null,
    glossary: null,
    glCat: 'all',
    glQ: '',
    mkTab: 'daily',
    mkChart: 'energy',
    page: document.body.getAttribute('data-page') || 'home',
    cat: 'all',
    q: ''
  };

  /* ---------------- utils ---------------- */
  function esc(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function attr(str) { return esc(str); }

  function getPath(obj, path) {
    return path.split('.').reduce(function (o, k) { return o == null ? undefined : o[k]; }, obj);
  }

  function fmtDate(iso) {
    var d = new Date(iso);
    if (isNaN(d)) return '';
    try {
      return new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' }).format(d);
    } catch (e) {
      return d.getFullYear() + '.' + (d.getMonth() + 1) + '.' + d.getDate();
    }
  }
  function fmtDateTime(iso) {
    var d = new Date(iso);
    if (isNaN(d)) return '';
    try {
      return new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }).format(d);
    } catch (e) { return fmtDate(iso); }
  }
  function timeAgo(iso) {
    var d = new Date(iso), now = new Date(), diff = (now - d) / 1000;
    if (isNaN(d)) return '';
    if (diff < 3600) return Math.max(1, Math.round(diff / 60)) + '분 전';
    if (diff < 86400) return Math.round(diff / 3600) + '시간 전';
    if (diff < 86400 * 7) return Math.round(diff / 86400) + '일 전';
    return fmtDate(iso);
  }
  function num(n) {
    if (n == null) return '0';
    return Number(n).toLocaleString('ko-KR');
  }
  function catOf(id) {
    var list = state.site.categories || [];
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return { id: id, label: id, en: String(id || '').toUpperCase(), desc: '' };
  }
  function articleById(id) {
    for (var i = 0; i < state.articles.length; i++) if (state.articles[i].id === id) return state.articles[i];
    return null;
  }
  function sorted() {
    return state.articles.slice().sort(function (a, b) {
      return new Date(b.publishedAt) - new Date(a.publishedAt);
    });
  }
  function numberFor(id) {
    var s = sorted();
    for (var i = 0; i < s.length; i++) if (s[i].id === id) return String(i + 1).padStart(2, '0');
    return '01';
  }
  function articleUrl(a) { return U('a/' + encodeURIComponent(a.id) + '.html'); }
  /* /en/ /zh/ /ja/ 폴더로 들어오면 공유 주소도 그 언어 기사 주소여야 합니다. */
  var IBLANG = (function () {
    var m = /^\/(en|zh|ja)\//.exec(window.location.pathname || '');
    return m ? m[1] : '';
  })();
  function articleShareUrl(a) {
    var base = ((state.site && state.site.baseUrl) || '').replace(/\/+$/, '');
    if (base && a && a.id) return base + (IBLANG ? '/' + IBLANG : '') + '/a/' + encodeURIComponent(a.id) + '.html';
    return window.location.href;
  }

  /* ---------------- 다국어 문구 ----------------
     /en/ /zh/ /ja/ 페이지에서는 app.js 가 그리는 문구도 그 언어로 씁니다.
     (사전에 있는 문장은 i18n.js 의 window.IB_T 로, 없으면 아래 표로 바꿉니다) */
  var LBL = {
    ko: {
      read: function (n) { return n + '분 읽기'; },
      views: function (n) { return '읽음 ' + n; },
      related: '관련 리포트', relatedSub: '같은 주제의 다른 리포트',
      tools: '바로 쓰는 무료 툴', toolsSub: '이 기사 주제에 맞는 계산·서식 도구',
      open: '무료로 열기', toolAria: '무료 도구 열기',
      trend: '추세', chart: '일간·주간·연간 그래프', points: '포인트', won: '원', vs: '대비', prevBasis: '전일 기준',
      notFoundTitle: '리포트를 찾을 수 없습니다',
      notFoundBody: '주소의 id가 정확한지 확인해 주세요. 아래 최신 리포트에서 이어서 읽을 수 있습니다.',
      notFoundCta: '전체 리포트 보기', latest: '최신 리포트'
    },
    en: {
      read: function (n) { return n + ' min read'; },
      views: function (n) { return 'Views ' + n; },
      related: 'Related reports', relatedSub: 'More reports on this topic',
      tools: 'Free tools for this story', toolsSub: 'Calculators and forms that match this topic',
      open: 'Open free', toolAria: 'Open free tool',
      trend: 'trend', chart: 'daily · weekly · yearly chart', points: 'points', won: 'KRW', vs: 'vs previous', prevBasis: 'vs previous close',
      notFoundTitle: 'Report not found',
      notFoundBody: 'Check the id in the address. You can continue with the latest reports below.',
      notFoundCta: 'Browse all reports', latest: 'Latest reports'
    },
    zh: {
      read: function (n) { return '阅读 ' + n + ' 分钟'; },
      views: function (n) { return '阅读 ' + n; },
      related: '相关报道', relatedSub: '同一主题的其他报道',
      tools: '可直接使用的免费工具', toolsSub: '与本篇主题匹配的计算与表单工具',
      open: '免费打开', toolAria: '打开免费工具',
      trend: '走势', chart: '日·周·年图表', points: '点', won: '韩元', vs: '较上期', prevBasis: '较前一交易日',
      notFoundTitle: '找不到该报道',
      notFoundBody: '请确认地址中的 id 是否正确。可在下方最新报道中继续阅读。',
      notFoundCta: '查看全部报道', latest: '最新报道'
    },
    ja: {
      read: function (n) { return n + '分で読めます'; },
      views: function (n) { return '閲覧 ' + n; },
      related: '関連レポート', relatedSub: '同じテーマの他のレポート',
      tools: 'すぐ使える無料ツール', toolsSub: 'この記事のテーマに合った計算・書式ツール',
      open: '無料で開く', toolAria: '無料ツールを開く',
      trend: 'の推移', chart: '日次・週次・年次チャート', points: 'ポイント', won: 'ウォン', vs: '比', prevBasis: '前日終値比',
      notFoundTitle: 'レポートが見つかりません',
      notFoundBody: 'アドレスの id をご確認ください。下の最新レポートから続けて読めます。',
      notFoundCta: 'すべてのレポートを見る', latest: '最新レポート'
    }
  }[IBLANG || 'ko'];
  /* i18n.js 사전이 준비돼 있으면 그 문장을 그대로 씁니다(없으면 원문). */
  function T(s) {
    try { return (window.IB_T && window.IB_T(s)) || s; } catch (e) { return s; }
  }

  /* 등락 기준 문구('전일 고시' 등) — 다국어 페이지에서 한글이 남으면 중립 문구로 대체합니다. */
  function humanBasis(s) {
    var raw = s == null ? '' : String(s);
    if (!IBLANG) return raw;
    var t = T(raw);
    return /[가-힣]/.test(t) ? LBL.prevBasis : t;
  }
  /* 기사 id: /a/{id}.html 경로 또는 예전 article.html?id={id} 주소 둘 다 지원합니다. */
  function currentArticleId() {
    var params = new URLSearchParams(window.location.search);
    var id = params.get('id');
    if (id) return id;
    var m = /\/a\/([^\/]+)\.html$/.exec(window.location.pathname || '');
    return m ? decodeURIComponent(m[1]) : null;
  }
  function isDemo() { return !!(state.site && state.site.demo); }
  function readingTime(a) {
    var n = a.readMinutes || Math.max(1, Math.round((a.body || '').length / 520));
    return LBL.read(n);
  }
  function plain(text) {
    return String(text || '').replace(/[#>*_`\[\]()]/g, ' ').replace(/\s+/g, ' ').trim();
  }

  /* ---------------- data ---------------- */
  function loadJSON(url, fallback) {
    return fetch(url, { cache: 'no-cache' })
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .catch(function () {
        if (fallback) return fallback;
        throw new Error('데이터를 불러오지 못했습니다: ' + url);
      });
  }

  /* ---------------- market ---------------- */
  function fmtPrice(v, dec) {
    if (v == null || isNaN(v)) return '—';
    var d = (dec == null) ? 2 : dec;
    try {
      return Number(v).toLocaleString('ko-KR', { minimumFractionDigits: d, maximumFractionDigits: d });
    } catch (e) { return String(v); }
  }
  function fmtPct(v) {
    if (v == null || isNaN(v)) return '—';
    var n = Number(v), s = Math.abs(n).toFixed(2);
    return (n > 0 ? '+' : (n < 0 ? '−' : '')) + s + '%';
  }
  function deltaHTML(row, cls, basis) {
    var p = row.changePct;
    if (p == null || isNaN(p)) return '<span class="mk-delta is-flat' + (cls ? ' ' + cls : '') + '">—</span>';
    var dir = (p > 0) ? 'up' : (p < 0 ? 'down' : 'flat');
    var mark = (p > 0) ? '▲' : (p < 0 ? '▼' : '―');
    var title = '';
    if (row.change != null && !isNaN(row.change)) {
      title = ' title="' + attr(humanBasis(basis || row.changeBasis || '전일') + ' ' + (row.change > 0 ? '+' : '') + fmtPrice(row.change, row.decimals || 0) + (row.unit ? ' ' + mkUnit(row.unit.split('/')[0]) : '')) + '"';
    }
    return '<span class="mk-delta is-' + dir + (cls ? ' ' + cls : '') + '"' + title + '>' + mark + ' ' + fmtPct(p) + '</span>';
  }
  function koDate(iso) {
    if (!iso) return '';
    var p = String(iso).split('-');
    if (p.length !== 3) return iso;
    return Number(p[0]) + '.' + p[1] + '.' + p[2];
  }
  function koWeekday(iso) {
    try {
      return new Intl.DateTimeFormat('ko-KR', { weekday: 'short' }).format(new Date(iso + 'T00:00:00+09:00'));
    } catch (e) { return ''; }
  }
  function koStamp(iso) {
    if (!iso) return '';
    var d = new Date(iso);
    if (isNaN(d)) return iso;
    try {
      return new Intl.DateTimeFormat('ko-KR', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Seoul' }).format(d) + ' KST';
    } catch (e) { return iso; }
  }

  function stripHTML(m) {
    var rows = m.oilFx || [];
    if (!rows.length) return '';
    return '<div class="container mks-inner">' + rows.map(function (r) {
      return '<span class="mks-item" title="' + attr(r.name + ' · 기준 ' + r.date + ' · ' + r.sourceName) + '">' +
        '<span class="mks-code">' + esc(r.code) + '</span>' +
        '<b class="mks-val">' + esc(fmtPrice(r.price, r.decimals)) + '</b>' +
        '<span class="mks-unit">' + esc(r.unit) + '</span>' +
        deltaHTML(r) +
      '</span>';
    }).join('') + '</div>';
  }

  function quoteHTML(r) {
    return '<div class="mk-quote" data-mkc-quote="' + attr(r.code) + '" data-mk-code="' + attr(r.code) + '">' +
      '<span class="mk-code">' + esc(r.code) + ' · ' + esc(r.name) + '</span>' +
      '<b>' + esc(fmtPrice(r.price, r.decimals)) + '<em>' + esc(r.unit) + '</em></b>' +
      deltaHTML(r) +
      '<span class="mk-foot">' +
        '<a href="' + attr(r.sourceUrl) + '" target="_blank" rel="noopener noreferrer">' + esc(r.sourceName) + '</a>' +
        '<span>' + esc(koDate(r.date)) + '</span>' +
      '</span>' +
      mkcBtnHTML(r) +
    '</div>';
  }

  function koMD(iso) {
    var p = String(iso || '').split('-');
    if (p.length !== 3) return '';
    return Number(p[1]) + '/' + p[2];
  }

  function periodGroupHTML(g) {
    var rows = (g && g.rows) || [];
    if (!rows.length) return '';
    var prevHead = g.prevHeader || '이전';
    return '<table class="mk-table mk-table--period">' +
      '<caption>' + esc(g.label) + '</caption>' +
      '<colgroup><col class="c-name"><col class="c-prev"><col class="c-price"><col class="c-chg"><col class="c-src"></colgroup>' +
      '<thead><tr><th scope="col">품목</th><th scope="col" class="num">' + esc(prevHead) + '</th><th scope="col" class="num">' + esc(g.nowHeader || '현재') + '</th><th scope="col" class="num">등락</th><th scope="col">출처 · 기준일</th></tr></thead>' +
      '<tbody>' + rows.map(function (r) {
        var meta = '';
        if (r.prev != null) meta = r.prevDate ? koMD(r.prevDate) : '';
        else meta = r.prevNote || '';
        return '<tr data-mk-code="' + attr(r.code) + '">' +
          '<th scope="row">' +
            '<span class="mk-name">' + esc(r.name) + '<em>' + esc(r.nameEn || '') + '</em></span>' +
            (r.grade ? '<span class="mk-grade">' + esc(r.grade) + '</span>' : '') +
            (r.note ? '<span class="mk-note">' + esc(r.note) + '</span>' : '') +
          '</th>' +
          '<td class="mk-prev"><span class="mk-prev-label">' + esc(prevHead) + '</span>' + (r.prev != null ? esc(fmtPrice(r.prev, r.decimals)) : '—') +
            (meta ? '<span class="mk-when">' + esc(meta) + '</span>' : '') + '</td>' +
          '<td class="mk-price">' + esc(fmtPrice(r.price, r.decimals)) + '<em>' + esc(r.unit) + '</em></td>' +
          '<td class="mk-chg">' + deltaHTML(r, 'mk-delta--block', prevHead + ' 대비') + '</td>' +
          '<td class="mk-src"><a href="' + attr(r.sourceUrl) + '" target="_blank" rel="noopener noreferrer">' + esc(r.sourceName) + '</a><span>' + esc(koDate(r.date)) + ' 기준</span></td>' +
        '</tr>';
      }).join('') + '</tbody></table>';
  }

  function periodPanelHTML(m, id) {
    var p = ((m.periods || {})[id]) || {};
    var out = '';
    out += '<div class="mk-period-head">' +
      '<div class="mk-period-meta">' +
        (p.badge ? '<span class="mk-badge">' + esc(p.badge) + '</span>' : '') +
        (p.range ? '<span class="mk-range">' + esc(p.range.replace(/ ~ /g, ' — ')) + '</span>' : '') +
      '</div>' +
      (p.summary ? '<p class="mk-sum">' + esc(p.summary) + '</p>' : '') +
    '</div>';

    if ((p.highlights || []).length) {
      out += '<div class="mk-briefs">' + p.highlights.map(function (h) {
        return '<div class="mk-brief"><b>' + esc(h.title) + '</b><p>' + esc(h.text) + '</p></div>';
      }).join('') + '</div>';
    }

    (p.groups || []).forEach(function (g) { out += periodGroupHTML(g); });

    if (p.chips && (p.chips.items || []).length) {
      out += '<div class="mk-week mk-week--chips">' +
        '<span class="mk-w-label">' + esc(p.chips.label || '') + '</span>' +
        p.chips.items.map(function (c) {
          var dir = (c.changePct > 0) ? 'up' : (c.changePct < 0 ? 'down' : 'flat');
          return '<span><b>' + esc(c.name) + '</b> <span class="mk-delta is-' + dir + '">' + fmtPct(c.changePct) + '</span></span>';
        }).join('') +
        (p.chips.sourceUrl ? '<a class="mk-chip-src" href="' + attr(p.chips.sourceUrl) + '" target="_blank" rel="noopener noreferrer">' + esc(p.chips.sourceName || '출처') + '</a>' : '') +
      '</div>';
      if (p.chips.note) out += '<p class="mk-asof">' + esc(p.chips.note) + '</p>';
    }

    if (p.note) out += '<p class="mk-asof">' + esc(p.note) + '</p>';
    return out;
  }

  function tableHTML(title, rows, id) {
    if (!rows.length) return '';
    return '<table class="mk-table"' + (id ? ' id="' + attr(id) + '"' : '') + '>' +
      '<caption>' + esc(title) + '</caption>' +
      '<colgroup><col class="c-name"><col class="c-price"><col class="c-chg"><col class="c-src"></colgroup>' +
      '<thead><tr><th scope="col">품목</th><th scope="col" class="num">가격</th><th scope="col" class="num">등락</th><th scope="col">출처 · 기준일</th></tr></thead>' +
      '<tbody>' + rows.map(function (r) {
        return '<tr data-mkc-quote="' + attr(r.code) + '" data-mk-code="' + attr(r.code) + '">' +
          '<th scope="row">' +
            '<span class="mk-name">' + esc(r.name) + '<em>' + esc(r.nameEn || '') + '</em></span>' +
            (r.grade ? '<span class="mk-grade">' + esc(r.grade) + '</span>' : '') +
            (r.note ? '<span class="mk-note">' + esc(r.note) + '</span>' : '') +
            mkcBtnHTML(r) +
          '</th>' +
          '<td class="mk-price">' + esc(fmtPrice(r.price, r.decimals)) + '<em>' + esc(r.unit) + '</em></td>' +
          '<td class="mk-chg">' + deltaHTML(r) + '</td>' +
          '<td class="mk-src"><a href="' + attr(r.sourceUrl) + '" target="_blank" rel="noopener noreferrer">' + esc(r.sourceName) + '</a><span>' + esc(koDate(r.date)) + ' 기준</span></td>' +
        '</tr>' + mkcRowHTML(r, 4);
      }).join('') + '</tbody></table>';
  }

  function dailyPanelHTML(m) {
    var rows = m.commodities || [];
    function grp(name) { return rows.filter(function (r) { return r.group === name; }); }
    var week = (m.weeklyTrend || []).map(function (w) {
      return '<span><b>' + esc(w.name) + '</b> ' + fmtPct(w.changePct) + '</span>';
    }).join('');

    return '' +
      (week ? '<div class="mk-week"><span class="mk-w-label">주간</span>' + week + '</div>' : '') +
      '<div class="mk-quotes" id="t-fx">' + (m.oilFx || []).map(quoteHTML).join('') + '</div>' +
      '<div class="mkc-fx-slot" id="mkc-fx-slot" hidden></div>' +
      tableHTML('METALS — 금속 · 비철금속 (LME · KOMIS · 조달청)', grp('metal'), 't-metals') +
      tableHTML('CHINA FUTURES — 중국 3대 선물거래소 (SHFE · DCE · ZCE)', grp('chinafutures'), 't-chinafutures') +
      tableHTML('PETROCHEMICALS — 석유화학·플라스틱 원료 (중국 현물)', grp('petrochem'), 't-petrochem') +
      tableHTML('SHIPPING — 해상운임 (BDI · SCFI · CCFI)', grp('shipping'), 't-shipping') +
      tableHTML('GRAINS — 곡물 · 식량 지수', grp('agri'), 't-grains') +
      tableHTML('KOREA — 국내 지표 (KCIA · KAMIS · 한국은행)', grp('koreamacro'), 't-korea') +
      (m.asOfNote ? '<p class="mk-asof">' + esc(m.asOfNote) + '</p>' : '') +
      ((m.notes || []).length ? '<ul class="mk-notes" id="market-notes">' + m.notes.map(function (n) { return '<li>' + esc(n) + '</li>'; }).join('') + '</ul>' : '');
  }

  /* 상단 요약 카드: 시장 시세·중국 선물·해운·국내 지표를 한눈에 */
  var SUMMARY_CONFIG = [
    { code: 'SHFE-CU', label: 'SHFE 구리', anchor: 't-chinafutures' },
    { code: 'SHFE-SC', label: '상하이 원유', anchor: 't-chinafutures' },
    { code: 'SCFI', label: '컨테이너 SCFI', anchor: 't-shipping' },
    { code: 'BDI', label: '건화물 BDI', anchor: 't-shipping' },
    { code: 'NAP', label: '나프타 MOPJ', anchor: 't-petrochem' },
    { code: 'PP', label: 'PP 중국 현물', anchor: 't-petrochem' },
    { code: 'USD/KRW', label: '원·달러', anchor: 't-fx' },
    { code: 'BOK-PPI', label: '생산자물가', anchor: 't-korea' }
  ];

  function summaryHTML(m) {
    var pool = (m.oilFx || []).concat(m.commodities || []);
    var cards = SUMMARY_CONFIG.map(function (c) {
      var r = null;
      for (var i = 0; i < pool.length; i++) {
        if (pool[i].code === c.code) { r = pool[i]; break; }
      }
      if (!r) return '';
      var src = String(r.sourceName || '').split(' ')[0];
      return '<a class="mk-scard" href="#' + attr(c.anchor) + '" data-mk-jump="' + attr(c.anchor) + '" data-mk-live="' + attr(c.code) + '">' +
        '<span class="mk-scard-code">' + esc(c.label) + '</span>' +
        '<b class="mk-scard-val">' + esc(fmtPrice(r.price, r.decimals)) + '<em>' + esc(r.unit) + '</em></b>' +
        deltaHTML(r) +
        '<span class="mk-scard-meta">' + esc(koDate(r.date)) + ' · ' + esc(src) + '</span>' +
      '</a>';
    }).join('');
    if (!cards) return '';
    return '<div class="mk-summary-head">' +
        '<span class="mk-w-label">오늘의 핵심</span>' +
        '<span class="mk-summary-note">값을 누르면 해당 표로 이동합니다</span>' +
      '</div>' +
      '<div class="mk-summary">' + cards + '</div>';
  }

  /* =========================================================
     핵심 지표 추세 그래프
     · 시황판에 실제로 실린 기준점(연간 previous · 월간 previous · 주간 previous/현재)과
       market-history.json 의 일별 스냅샷만 이어 그립니다. 없는 과거 값은 만들지 않습니다.
     · 2점 이상이면 꺾은선, 1점뿐이면 공표된 기간 등락률 막대로 대신합니다.
     ========================================================= */
  /* 그래프 단위 표기 — /en/ /zh/ /ja/ 에서는 그 나라 말로 */
  var MK_UNIT = {
    ko: { '포인트': '포인트', '원': '원' },
    en: { '포인트': 'points', '원': 'KRW' },
    zh: { '포인트': '点', '원': '韩元' },
    ja: { '포인트': 'ポイント', '원': 'ウォン' }
  }[IBLANG || 'ko'];
  function mkUnit(u) { return MK_UNIT[u] || u || ''; }

  var MKG_W = 320, MKG_H = 118;
  var MKG_REG = {};

  var MKG_TABS = [
    {
      id: 'energy', label: '에너지·환율',
      items: [
        { id: 'wti', pcode: 'WTI', qcode: 'WTI', snap: 'WTI', name: 'WTI 원유', sub: 'NYMEX 근월물', unit: 'USD/bbl', dec: 2 },
        { id: 'brent', pcode: 'BRENT', qcode: 'BRENT', snap: 'BRENT', name: '브렌트유', sub: 'ICE 근월물', unit: 'USD/bbl', dec: 2 },
        { id: 'usdkrw', pcode: 'USD/KRW', qcode: 'USD/KRW', snap: 'USD/KRW', name: '원·달러', sub: '서울외환시장 주간거래 종가', unit: '원', dec: 2 }
      ]
    },
    {
      id: 'metals', label: '비철·중국선물',
      items: [
        { id: 'cu', pcode: 'CU', qcode: 'CU', snap: 'CU', name: 'LME 구리', sub: '현물 결제가', unit: 'USD/t', dec: 2 },
        { id: 'al', pcode: 'AL', qcode: 'AL', snap: 'AL', name: 'LME 알루미늄', sub: '현물 결제가', unit: 'USD/t', dec: 2 },
        { id: 'shfecu', pcode: 'SHFE-CU', qcode: 'SHFE-CU', snap: 'SHFE-CU', name: 'SHFE 구리', sub: '주력 계약(1월물)', unit: 'RMB/t', dec: 0 }
      ]
    },
    {
      id: 'petchem', label: '석유화학 원가',
      items: [
        { id: 'nap', pcode: 'NAP-JP', qcode: 'NAP', snap: 'NAP', name: '나프타 (MOPJ)', sub: 'CFR Japan 평가가', unit: 'USD/t', dec: 2 },
        { id: 'dcepp', pcode: 'DCE-PP', qcode: 'DCE-PP', snap: 'DCE-PP', name: 'PP (DCE)', sub: '다롄 PP 선물', unit: 'RMB/t', dec: 0 },
        { id: 'dcel', pcode: 'DCE-L', qcode: 'DCE-L', snap: 'DCE-L', name: 'LLDPE (DCE)', sub: '다롄 LLDPE 선물', unit: 'RMB/t', dec: 0 }
      ]
    },
    {
      id: 'shipping', label: '해운·크립토',
      items: [
        { id: 'scfi', pcode: 'SCFI', qcode: 'SCFI', snap: 'SCFI', name: 'SCFI 해상운임', sub: '상하이컨테이너운임지수', unit: '포인트', dec: 2 },
        { id: 'bdi', pcode: 'BDI', qcode: 'BDI', snap: 'BDI', name: '건화물 BDI', sub: '발틱 건화물운임지수', unit: '포인트', dec: 0 },
        { id: 'btc', pcode: 'BTC', qcode: 'BTC', snap: 'BTC', name: '비트코인', sub: '달러 현물', unit: 'USD', dec: 0 }
      ]
    }
  ];

  function mk2(n) { return (n < 10 ? '0' : '') + n; }
  function mkMonthEnd(y, mo) {
    var d = new Date(Date.UTC(y, mo, 0));
    return d.toISOString().slice(0, 10);
  }
  /* 기준 시점 머리글을 짧은 축 라벨로 바꿉니다 (예: '전주(11/13)' → '11/13'). */
  function mkgLabel(h) {
    var s = String(h == null ? '' : h).trim();
    var m;
    if ((m = /(\d{4})년\s*말/.exec(s))) return m[1].slice(2) + '년 말';
    if ((m = /(\d{4})년\s*(\d{1,2})월\s*평균/.exec(s))) return m[1].slice(2) + '.' + m[2] + ' 평균';
    if ((m = /(\d{1,2})월\s*평균/.exec(s))) return m[1] + '월 평균';
    if ((m = /\((\d{1,2})\/(\d{1,2})\)/.exec(s))) return m[1] + '/' + m[2];
    return s;
  }
  function mkFindQuote(m, code) {
    var pool = (m.oilFx || []).concat(m.commodities || []);
    for (var i = 0; i < pool.length; i++) if (pool[i].code === code) return pool[i];
    return null;
  }
  function mkPeriodRow(m, pid, code) {
    var p = ((m.periods || {})[pid]) || {};
    var groups = p.groups || [];
    for (var i = 0; i < groups.length; i++) {
      var rows = groups[i].rows || [];
      for (var j = 0; j < rows.length; j++) {
        if (rows[j].code === code) return { row: rows[j], group: groups[i] };
      }
    }
    return null;
  }
  /* 주간 표의 '전주(11/13)' 머리글에서 직전 기준일을 구합니다. */
  function mkPrevFriday(row, group) {
    var base = String((row && row.date) || '');
    var mm = /\((\d{1,2})\/(\d{1,2})\)/.exec(String((group && group.prevHeader) || ''));
    if (base && mm) return base.slice(0, 4) + '-' + mk2(Number(mm[1])) + '-' + mk2(Number(mm[2]));
    if (base) {
      var d = new Date(base + 'T00:00:00Z');
      d.setUTCDate(d.getUTCDate() - 7);
      return d.toISOString().slice(0, 10);
    }
    return '';
  }

  /* 한 지표의 기준점 목록. 같은 날짜는 더 구체적인 값(주간·일간 시세 > 스냅샷 > 기간 평균)을 남깁니다. */
  function mkSeries(m, hist, item) {
    var pts = [], byDate = {};
    function add(d, label, v, kind, prio) {
      if (v == null || v === '' || isNaN(Number(v)) || !d) return;
      var had = byDate[d];
      if (had) {
        if (had.prio <= prio) return;
        pts[had.idx] = { d: d, label: label, v: Number(v), kind: kind, prio: prio };
        had.prio = prio;
        return;
      }
      byDate[d] = { idx: pts.length, prio: prio };
      pts.push({ d: d, label: label, v: Number(v), kind: kind, prio: prio });
    }

    var asOf = String(m.asOf || '');
    var asOfY = Number(asOf.slice(0, 4)) || new Date().getFullYear();
    var asOfM = Number(asOf.slice(5, 7)) || 12;

    var y = mkPeriodRow(m, 'yearly', item.pcode);
    if (y && y.row.prev != null) {
      var ym = /(\d{4})년/.exec(String(y.group.prevHeader || ''));
      add((ym ? Number(ym[1]) : asOfY - 1) + '-12-31', mkgLabel(y.group.prevHeader), y.row.prev, 'anchor', 4);
    }
    var mo = mkPeriodRow(m, 'monthly', item.pcode);
    if (mo && mo.row.prev != null) {
      var mm = /(\d{1,2})월/.exec(String(mo.group.prevHeader || ''));
      var moN = mm ? Number(mm[1]) : 0;
      if (moN >= 1 && moN <= 12) {
        add(mkMonthEnd(moN > asOfM ? asOfY - 1 : asOfY, moN), mkgLabel(mo.group.prevHeader), mo.row.prev, 'anchor', 5);
      }
    }
    var w = mkPeriodRow(m, 'weekly', item.pcode);
    if (w && w.row.prev != null) {
      add(mkPrevFriday(w.row, w.group), mkgLabel(w.group.prevHeader), w.row.prev, 'anchor', 6);
    }
    if (w && w.row.price != null) {
      add(String(w.row.date), mkgLabel(w.group.nowHeader) || koMD(w.row.date), w.row.price, 'spot', 1);
    }
    var q = mkFindQuote(m, item.qcode);
    if (q && q.price != null) {
      add(String(q.date), koMD(q.date), q.price, 'spot', 2);
    }
    var snaps = (hist && hist.snapshots) || [];
    for (var i = 0; i < snaps.length; i++) {
      var v = ((snaps[i] || {}).values || {})[item.snap];
      if (v && v.price != null) {
        var d2 = String(v.date || snaps[i].date || '');
        add(d2, koMD(d2), v.price, 'snap', 3);
      }
    }

    pts.sort(function (a, b) { return a.d < b.d ? -1 : (a.d > b.d ? 1 : 0); });

    /* 스냅샷이 수백 일 쌓여도 그림이 뭉개지지 않게, 장기 기준점은 남기고 최근 점만 잘라 씁니다. */
    var MAXP = 13;
    if (pts.length > MAXP) {
      var anchors = pts.filter(function (p) { return p.kind === 'anchor'; });
      var rest = pts.filter(function (p) { return p.kind !== 'anchor'; });
      var room = Math.max(2, MAXP - anchors.length);
      pts = anchors.concat(rest.slice(Math.max(0, rest.length - room)));
      pts.sort(function (a, b) { return a.d < b.d ? -1 : (a.d > b.d ? 1 : 0); });
    }
    return pts;
  }

  function mkChartSVG(key, item, pts) {
    var W = MKG_W, H = MKG_H, n = pts.length;
    var padL = 8, padR = 10, padT = 10, padB = 22;
    var plotW = W - padL - padR, plotH = H - padT - padB;
    var lo = Infinity, hi = -Infinity;
    pts.forEach(function (p) { if (p.v < lo) lo = p.v; if (p.v > hi) hi = p.v; });
    if (hi === lo) { var e0 = Math.abs(lo) * 0.02 + 1; hi += e0; lo -= e0; }
    var breathe = (hi - lo) * 0.16;
    lo -= breathe; hi += breathe;

    var xs = [], ys = [];
    for (var i = 0; i < n; i++) {
      xs.push(padL + (plotW * i) / (n - 1));
      ys.push(padT + plotH * (1 - (pts[i].v - lo) / (hi - lo)));
    }
    var line = xs.map(function (x, k) { return (k ? 'L' : 'M') + x.toFixed(1) + ' ' + ys[k].toFixed(1); }).join(' ');
    var base = (padT + plotH).toFixed(1);
    var area = line + ' L' + xs[n - 1].toFixed(1) + ' ' + base + ' L' + xs[0].toFixed(1) + ' ' + base + ' Z';
    var dir = pts[n - 1].v > pts[0].v ? ' is-up' : (pts[n - 1].v < pts[0].v ? ' is-down' : ' is-flat');

    var grid = '';
    [0, 0.5, 1].forEach(function (f) {
      var gy = (padT + plotH * f).toFixed(1);
      grid += '<line class="mkg-grid-l" x1="' + padL + '" y1="' + gy + '" x2="' + (W - padR) + '" y2="' + gy + '"></line>';
    });

    var show = {};
    if (n <= 6) { for (var a = 0; a < n; a++) show[a] = 1; }
    else {
      show[0] = 1; show[n - 1] = 1;
      var step = Math.ceil((n - 2) / 4);
      for (var b = 1; b < n - 1; b++) if (b % step === 0) show[b] = 1;
      for (var c = 0; c < n; c++) if (pts[c].kind === 'anchor') show[c] = 1;
    }
    var labels = '';
    for (var k = 0; k < n; k++) {
      if (!show[k]) continue;
      var anc = (k === 0) ? 'start' : (k === n - 1 ? 'end' : 'middle');
      labels += '<text class="mkg-ax" x="' + xs[k].toFixed(1) + '" y="' + (H - 6) + '" text-anchor="' + anc + '">' + esc(pts[k].label) + '</text>';
    }
    var dots = '';
    for (var j = 0; j < n; j++) {
      dots += '<circle class="mkg-dot' + (j === n - 1 ? ' is-last' : '') + '" cx="' + xs[j].toFixed(1) + '" cy="' + ys[j].toFixed(1) + '" r="' + (j === n - 1 ? 3.2 : 2.1) + '"></circle>';
    }

    var aria = T(item.name) + ' ' + LBL.trend + '. ' + pts.map(function (p) { return p.label + ' ' + fmtPrice(p.v, item.dec) + ' ' + mkUnit(item.unit); }).join(', ') + '.';

    MKG_REG[key] = { W: W, H: H, xs: xs, ys: ys, pts: pts, dec: item.dec, unit: item.unit };

    return '<div class="mkg-plot">' +
      '<svg class="mkg-svg' + dir + '" data-mkg-chart="' + attr(key) + '" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + attr(aria) + '">' +
        grid +
        '<path class="mkg-area" d="' + area + '"></path>' +
        '<line class="mkg-guide" x1="' + padL + '" y1="' + padT + '" x2="' + padL + '" y2="' + (padT + plotH).toFixed(1) + '"></line>' +
        '<path class="mkg-line" d="' + line + '"></path>' +
        dots + labels +
      '</svg>' +
      '<div class="mkg-tip" hidden></div>' +
    '</div>';
  }

  /* 기준점이 1개뿐일 때: 공표된 기간 등락률만 막대로 보여 줍니다(추정값 없음). */
  function mkGaugeHTML(pct) {
    var p = (pct == null || isNaN(pct)) ? 0 : Number(pct);
    var w = Math.min(50, (Math.abs(p) / 5) * 50);
    if (p !== 0 && w < 1.6) w = 1.6;
    var dir = p > 0 ? 'is-up' : (p < 0 ? 'is-down' : 'is-flat');
    return '<div class="mkg-plot mkg-plot--solo">' +
      '<div class="mkg-gauge" role="img" aria-label="기간 등락률 ' + attr(fmtPct(pct)) + '">' +
        '<span class="mkg-gauge-track"></span>' +
        '<span class="mkg-gauge-zero"></span>' +
        '<span class="mkg-gauge-bar ' + dir + '" style="width:' + w.toFixed(1) + '%"></span>' +
        '<span class="mkg-gauge-scale"><i>−5%</i><i>0</i><i>+5%</i></span>' +
      '</div>' +
      '<p class="mkg-wait">기준점이 1개뿐입니다. 일별 스냅샷이 쌓이면 이 자리에 추세선이 그려집니다.</p>' +
    '</div>';
  }

  function mkChartCardHTML(m, hist, item, key) {
    var pts = mkSeries(m, hist, item);
    var q = mkFindQuote(m, item.qcode);
    var w = mkPeriodRow(m, 'weekly', item.pcode);
    var latest = pts.length ? pts[pts.length - 1] : null;
    var prev = pts.length > 1 ? pts[pts.length - 2] : null;
    var value = latest ? latest.v : null;
    var pct = null, basis = '';
    if (prev && prev.v) {
      pct = (latest.v / prev.v - 1) * 100;
      basis = prev.label + ' ' + LBL.vs;
    } else if (q && q.changePct != null) {
      pct = q.changePct;
      basis = humanBasis(q.changeBasis || '전일');
      if (!/대비|vs|較|比/.test(basis)) basis += ' ' + LBL.vs;
    } else if (w && w.row.changePct != null) {
      pct = w.row.changePct;
      basis = '전주 대비';
    }

    var srcRow = q || (w && w.row) || null;
    var srcName = srcRow ? String(srcRow.sourceName || '').split(' · ')[0] : '';
    var foot = (srcRow && latest)
      ? '<a href="' + attr(srcRow.sourceUrl) + '" target="_blank" rel="noopener noreferrer">' + esc(srcName) + '</a><span>' + esc(koDate(latest.d)) + ' 기준</span>'
      : '<span>기준점 없음</span>';

    var plot = pts.length >= 2 ? mkChartSVG(key, item, pts) : mkGaugeHTML(pct);

    return '<article class="mkg-card" data-mkg-key="' + attr(key) + '">' +
      '<h3 class="mkg-name">' + esc(item.name) + '<em>' + esc(item.sub) + '</em></h3>' +
      '<div class="mkg-figure">' +
        '<b class="mkg-value">' + esc(fmtPrice(value, item.dec)) + '<em>' + esc(mkUnit(item.unit)) + '</em></b>' +
        deltaHTML({ changePct: pct }, 'mkg-delta', basis) +
        (basis ? '<span class="mkg-basis">' + esc(basis) + '</span>' : '') +
      '</div>' +
      plot +
      '<div class="mkg-foot">' + foot + '</div>' +
    '</article>';
  }

  function mkgTabsHTML() {
    return '<div class="mkg-tabs" role="tablist" aria-label="핵심 지표 분류">' + MKG_TABS.map(function (t) {
      var on = t.id === state.mkChart;
      return '<button type="button" class="mkg-tab' + (on ? ' is-active' : '') + '" role="tab" id="mkg-tab-' + attr(t.id) + '"' +
        ' aria-controls="mkg-panel-' + attr(t.id) + '" aria-selected="' + (on ? 'true' : 'false') + '" tabindex="' + (on ? '0' : '-1') + '"' +
        ' data-mkg-tab="' + attr(t.id) + '">' + esc(t.label) + '</button>';
    }).join('') + '</div>';
  }

  function chartsHTML(m) {
    var hist = state.marketHistory;
    var panels = MKG_TABS.map(function (t) {
      var on = t.id === state.mkChart;
      var cards = t.items.map(function (item, i) { return mkChartCardHTML(m, hist, item, t.id + '-' + i); }).join('');
      return '<div class="mkg-panel" id="mkg-panel-' + attr(t.id) + '" role="tabpanel" aria-labelledby="mkg-tab-' + attr(t.id) + '"' +
        ' data-mkg-panel="' + attr(t.id) + '"' + (on ? '' : ' hidden') + '>' +
        '<div class="mkg-grid">' + cards + '</div>' +
      '</div>';
    }).join('');

    return '<section class="mkg" id="market-charts" aria-labelledby="mkg-title">' +
      '<div class="mkg-head"><div class="mkg-head-main">' +
        '<span class="kicker">KEY INDICATORS</span>' +
        '<h2 id="mkg-title">핵심 지표 추세</h2>' +
        '<p class="mkg-sub">시황판에 실제로 실린 기준점만 이어 그린 선입니다. <b>2025년 말·10월 평균은 월평균 고시값</b>이고 그 뒤 점은 주간·일별 종가입니다. 점을 누르거나 마우스를 올리면 시점별 값과 앞 기준점 대비 등락률이 나오고, 일별 스냅샷이 쌓이면 최근 구간이 일 단위로 자동으로 이어집니다.</p>' +
      '</div></div>' +
      mkgTabsHTML() + panels +
    '</section>';
  }

  function applyMkgTab(wrap) {
    var ids = MKG_TABS.map(function (t) { return t.id; });
    if (ids.indexOf(state.mkChart) < 0) state.mkChart = ids[0];
    $$('[data-mkg-tab]', wrap).forEach(function (b) {
      var on = b.getAttribute('data-mkg-tab') === state.mkChart;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-selected', on ? 'true' : 'false');
      b.tabIndex = on ? 0 : -1;
    });
    $$('[data-mkg-panel]', wrap).forEach(function (p) {
      if (p.getAttribute('data-mkg-panel') === state.mkChart) p.removeAttribute('hidden');
      else p.setAttribute('hidden', '');
    });
  }

  function bindOneChart(svg) {
    var key = svg.getAttribute('data-mkg-chart');
    var rec = MKG_REG[key];
    if (!rec) return;
    var card = svg.parentNode && svg.parentNode.parentNode;
    var tip = card ? card.querySelector('.mkg-tip') : null;
    var guide = svg.querySelector('.mkg-guide');
    var dots = $$('.mkg-dot', svg);

    function near(ev) {
      var box = svg.getBoundingClientRect();
      if (!box.width) return -1;
      var px = ((ev.clientX - box.left) / box.width) * rec.W;
      var best = 0, bd = Infinity;
      for (var i = 0; i < rec.xs.length; i++) {
        var d = Math.abs(rec.xs[i] - px);
        if (d < bd) { bd = d; best = i; }
      }
      return best;
    }
    function paint(i) {
      for (var k = 0; k < dots.length; k++) {
        var last = k === rec.pts.length - 1;
        dots[k].setAttribute('r', k === i ? 4.3 : (last ? 3.2 : 2.1));
        dots[k].classList.toggle('is-on', k === i);
      }
    }
    function show(i) {
      if (i < 0 || !rec.pts[i]) return;
      var p = rec.pts[i];
      var pp = i > 0 ? rec.pts[i - 1] : null;
      var chg = (pp && pp.v) ? (p.v / pp.v - 1) * 100 : null;
      if (tip) {
        tip.innerHTML = '<b>' + esc(p.label) + '</b>' +
          '<span class="mkg-tip-v">' + esc(fmtPrice(p.v, rec.dec)) + '<i>' + esc(rec.unit) + '</i></span>' +
          (chg == null ? '' : '<span class="mkg-tip-d mk-delta ' + (chg > 0 ? 'is-up' : (chg < 0 ? 'is-down' : 'is-flat')) + '">' + fmtPct(chg) + ' <i>' + esc(pp.label) + ' 대비</i></span>');
        tip.hidden = false;
        var leftPct = Math.max(8, Math.min(92, (rec.xs[i] / rec.W) * 100));
        var yPct = (rec.ys[i] / rec.H) * 100;
        var below = yPct < 48;
        tip.classList.toggle('is-below', below);
        tip.style.left = leftPct.toFixed(1) + '%';
        tip.style.top = (below ? Math.min(86, yPct + 7) : Math.max(14, yPct - 7)).toFixed(1) + '%';
      }
      if (guide) { guide.setAttribute('x1', rec.xs[i].toFixed(1)); guide.setAttribute('x2', rec.xs[i].toFixed(1)); }
      svg.classList.add('is-hover');
      paint(i);
    }
    function hide() {
      if (tip) tip.hidden = true;
      svg.classList.remove('is-hover');
      paint(-1);
    }
    svg.__mkgHide = hide;
    svg.addEventListener('pointermove', function (ev) { if (ev.pointerType !== 'touch') show(near(ev)); });
    svg.addEventListener('pointerdown', function (ev) { show(near(ev)); });
    svg.addEventListener('pointerleave', function (ev) { if (ev.pointerType !== 'touch') hide(); });
  }

  function bindMarketCharts(wrap) {
    if (!wrap || wrap.__mkgBound) return;
    wrap.__mkgBound = true;
    wrap.addEventListener('click', function (ev) {
      var el = ev.target;
      while (el && el !== wrap) {
        if (el.getAttribute && el.getAttribute('data-mkg-tab')) {
          state.mkChart = el.getAttribute('data-mkg-tab');
          applyMkgTab(wrap);
          return;
        }
        el = el.parentNode;
      }
    });
    wrap.addEventListener('keydown', function (ev) {
      var key = ev.key;
      if (key !== 'ArrowRight' && key !== 'ArrowLeft') return;
      var t = ev.target;
      if (!t || !t.getAttribute || !t.getAttribute('data-mkg-tab')) return;
      var ids = MKG_TABS.map(function (x) { return x.id; });
      var i = ids.indexOf(state.mkChart);
      if (i < 0) i = 0;
      i = (key === 'ArrowRight') ? (i + 1) % ids.length : (i - 1 + ids.length) % ids.length;
      state.mkChart = ids[i];
      applyMkgTab(wrap);
      var btn = $('[data-mkg-tab="' + ids[i] + '"]', wrap);
      if (btn) btn.focus();
      ev.preventDefault();
    });
    wrap.addEventListener('pointerdown', function (ev) {
      var e = ev.target;
      if (e && e.closest && e.closest('.mkg-svg')) return;
      $$('.mkg-svg', wrap).forEach(function (svg) { if (svg.__mkgHide) svg.__mkgHide(); });
    });
    $$('.mkg-svg', wrap).forEach(bindOneChart);
    applyMkgTab(wrap);
  }

  /* =========================================================
     품목별 그래프 — 시황표 각 행의 '📈 차트'
     · data/market-series.json 에 실제 일별 종가가 있는 품목(주요 국제 지표·중국 선물)은
       그 종가만 이어 그립니다(보간·추정 없음).
     · 그 파일에 없는 국내·월별·단발 지표는 market.json 의 실측 기준점(전일·1주 전·
       1달 전·1년 전)과 market-history.json 누적 스냅샷만 이어 그리고
       '실측 기준점 비교'로 표기합니다. 없는 구간은 그리지 않습니다.
     ========================================================= */
  var MKC_W = 360, MKC_H = 164;
  var MKC_WIN = { d: 32, w: 93, y: 367 };
  var MKC_LABEL = { d: '일간', w: '주간', y: '연간' };
  var MKC_SUB = { d: '최근 1개월 · 일별', w: '최근 3개월 · 주별', y: '최근 1년 · 주별' };
  var MKC_TAB = {};

  function mkcId(code) { return 'mkc-' + String(code).replace(/[^A-Za-z0-9]+/g, '-').replace(/^-|-$/g, ''); }
  function mkcItem(m, code) {
    var pool = (m.oilFx || []).concat(m.commodities || []);
    for (var i = 0; i < pool.length; i++) if (pool[i].code === code) return pool[i];
    return null;
  }
  function mkcSer(code) {
    var all = (state.marketSeries && state.marketSeries.series) || {};
    return all[code] || null;
  }
  function mkcShift(iso, days) {
    var d = new Date(iso + 'T00:00:00Z');
    if (isNaN(d)) return iso;
    d.setUTCDate(d.getUTCDate() - days);
    return d.toISOString().slice(0, 10);
  }
  function mkcWeekKey(iso) {
    var d = new Date(iso + 'T00:00:00Z');
    if (isNaN(d)) return iso;
    var dow = (d.getUTCDay() + 6) % 7;
    d.setUTCDate(d.getUTCDate() - dow);
    return d.toISOString().slice(0, 10);
  }
  function mkcAxisLabel(iso, tab) {
    var p = String(iso || '').split('-');
    if (p.length !== 3) return iso || '';
    return (tab === 'y') ? (p[0].slice(2) + '.' + p[1]) : (Number(p[1]) + '/' + p[2]);
  }

  /* 품목의 기준점 목록: 실제 일별 종가가 있으면 그것만, 없으면 실측 기준점·스냅샷만. */
  function mkcPoints(m, code) {
    var ser = mkcSer(code);
    var pts = [], dense = false;
    if (ser && (ser.points || []).length) {
      dense = true;
      (ser.points || []).forEach(function (p) {
        if (!p || p.length < 2) return;
        var v = Number(p[1]);
        if (!isFinite(v) || !p[0]) return;
        pts.push({ d: String(p[0]), v: v, label: '' });
      });
    } else {
      var anchors = mkSeries(m, state.marketHistory, {
        pcode: code, qcode: code, snap: code,
        name: (mkcItem(m, code) || {}).name || code, dec: 2, unit: ''
      });
      anchors.forEach(function (p) { pts.push({ d: p.d, v: p.v, label: p.label || '' }); });
    }
    pts.sort(function (a, b) { return a.d < b.d ? -1 : (a.d > b.d ? 1 : 0); });
    return { pts: pts, ser: ser, dense: dense };
  }

  function mkcEnd(m, all) {
    var end = String(m.asOf || '');
    all.forEach(function (p) { if (p.d > end) end = p.d; });
    return end || '';
  }

  /* 기간 창으로 자르고, 일별 시계열은 주간·연간에서 주 단위(그 주 마지막 값)로 줄입니다. */
  function mkcWindow(pts, tab, dense, end) {
    if (!pts.length) return [];
    var from = mkcShift(end || pts[pts.length - 1].d, MKC_WIN[tab] || 32);
    var cut = [];
    pts.forEach(function (p) { if (p.d >= from) cut.push(p); });
    if (!cut.length) return [];
    if (dense && tab !== 'd') {
      var byWeek = {}, order = [];
      cut.forEach(function (p) {
        var k = mkcWeekKey(p.d);
        if (!byWeek[k]) { byWeek[k] = p; order.push(k); }
        else byWeek[k] = p; /* 그 주의 마지막 값 */
      });
      cut = order.map(function (k) { return byWeek[k]; });
    }
    var lastY = String(end || '').slice(0, 4);
    cut.forEach(function (p) {
      /* 일별 시계열은 기간에 맞춘 축 라벨, 실측 기준점은 날짜가 겹치지 않게
         해가 바뀌는 점만 연도까지 적습니다(예: 25.12 · 10/31 · 11/13 · 11/20). */
      p.label = dense
        ? mkcAxisLabel(p.d, tab)
        : ((tab === 'y' && String(p.d).slice(0, 4) !== lastY)
          ? (String(p.d).slice(2, 4) + '.' + String(p.d).slice(5, 7))
          : mkcAxisLabel(p.d, 'd'));
    });
    return cut;
  }

  function mkcDefaultTab(m, data, code) {
    if (MKC_TAB[code]) return MKC_TAB[code];
    if (data.dense) return 'd';
    var end = mkcEnd(m, data.pts);
    var best = 'y', bestN = -1;
    ['y', 'w', 'd'].forEach(function (t) {
      var n = mkcWindow(data.pts, t, false, end).length;
      if (n > bestN) { bestN = n; best = t; }
    });
    return bestN >= 2 ? best : 'd';
  }

  function mkcSVG(key, pts, dec, unit, tab) {
    var n = pts.length;
    /* 화면 폭에 맞춰 좌표계를 고릅니다(모바일에서 글자가 작아지지 않게). */
    var vw = (typeof window !== 'undefined' && window.innerWidth) ? window.innerWidth : 1200;
    var narrow = vw < 620;
    var W = narrow ? 336 : 700, H = narrow ? 152 : 164;
    var padL = 4, padR = narrow ? 44 : 52, padT = 11, padB = 19;
    var plotW = W - padL - padR, plotH = H - padT - padB;
    var lo = Infinity, hi = -Infinity;
    pts.forEach(function (p) { if (p.v < lo) lo = p.v; if (p.v > hi) hi = p.v; });
    if (hi === lo) { var e0 = Math.abs(lo) * 0.02 + 1; hi += e0; lo -= e0; }
    var breathe = (hi - lo) * 0.14;
    var dlo = lo - breathe, dhi = hi + breathe;

    var xs = [], ys = [];
    for (var i = 0; i < n; i++) {
      xs.push(n === 1 ? padL + plotW / 2 : padL + (plotW * i) / (n - 1));
      ys.push(padT + plotH * (1 - (pts[i].v - dlo) / (dhi - dlo)));
    }
    var line = xs.map(function (x, k) { return (k ? 'L' : 'M') + x.toFixed(1) + ' ' + ys[k].toFixed(1); }).join(' ');
    var base = (padT + plotH).toFixed(1);
    var area = n > 1 ? (line + ' L' + xs[n - 1].toFixed(1) + ' ' + base + ' L' + xs[0].toFixed(1) + ' ' + base + ' Z') : '';
    var dir = (n > 1 && pts[n - 1].v > pts[0].v) ? ' is-up' : ((n > 1 && pts[n - 1].v < pts[0].v) ? ' is-down' : ' is-flat');

    var grid = '';
    [0, 0.5, 1].forEach(function (f) {
      var gy = (padT + plotH * f).toFixed(1);
      grid += '<line class="mkc-grid" x1="' + padL + '" y1="' + gy + '" x2="' + (W - padR) + '" y2="' + gy + '"></line>';
    });

    var show = {};
    if (n <= 7) { for (var a = 0; a < n; a++) show[a] = 1; }
    else {
      show[0] = 1; show[n - 1] = 1;
      var step = Math.ceil((n - 2) / 4);
      for (var b = 0; b < n; b++) if (b % step === 0) show[b] = 1;
    }
    var labels = '';
    for (var k = 0; k < n; k++) {
      if (!show[k]) continue;
      var anc = (k === 0) ? 'start' : (k === n - 1 ? 'end' : 'middle');
      labels += '<text class="mkc-ax" x="' + xs[k].toFixed(1) + '" y="' + (H - 5) + '" text-anchor="' + anc + '">' + esc(pts[k].label || mkcAxisLabel(pts[k].d, tab)) + '</text>';
    }

    var dots = '';
    for (var j = 0; j < n; j++) {
      var big = (j === n - 1) || (j === 0 && n > 2);
      if (n > 60 && !big && j % 3 !== 0) continue;
      dots += '<circle class="mkc-dot' + (j === n - 1 ? ' is-last' : '') + '" cx="' + xs[j].toFixed(1) + '" cy="' + ys[j].toFixed(1) + '" r="' + (j === n - 1 ? 2.9 : 1.9) + '"></circle>';
    }

    var yTop = '<text class="mkc-yax" x="' + (W - padR + 5) + '" y="' + (padT + 4) + '">' + esc(fmtPrice(hi, dec)) + '</text>';
    var yBot = '<text class="mkc-yax" x="' + (W - padR + 5) + '" y="' + (padT + plotH + 1) + '">' + esc(fmtPrice(lo, dec)) + '</text>';

    var aria = pts[0].label + ' ' + fmtPrice(pts[0].v, dec) + unit + '에서 ' + pts[n - 1].label + ' ' + fmtPrice(pts[n - 1].v, dec) + unit + '까지, 고점 ' + fmtPrice(hi, dec) + ', 저점 ' + fmtPrice(lo, dec) + '.';

    return '<div class="mkc-plot">' +
      '<svg class="mkc-svg' + dir + '" data-mkc-svg="' + attr(key) + '" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + attr(aria) + '">' +
        grid +
        (area ? '<path class="mkc-area" d="' + area + '"></path>' : '') +
        '<line class="mkc-guide" x1="0" y1="' + padT + '" x2="0" y2="' + (padT + plotH).toFixed(1) + '" opacity="0"></line>' +
        (n > 1 ? '<path class="mkc-line" d="' + line + '"></path>' : '') +
        dots + labels + yTop + yBot +
      '</svg>' +
      '<div class="mkc-tip" hidden></div>' +
      '<i class="mkc-rec" hidden>' + esc(JSON.stringify({ dec: dec, unit: unit, xs: xs.map(function (x) { return Number(x.toFixed(1)); }), ys: ys.map(function (y) { return Number(y.toFixed(1)); }), w: W, h: H, pts: pts.map(function (p) { return { d: p.d, l: p.label, v: p.v }; }) })) + '</i>' +
    '</div>';
  }

  var MKC_SUB_ANCHOR = { d: '최근 1개월', w: '최근 3개월', y: '최근 1년' };
  function mkcStatsHTML(pts, tab, dec, unit, dense) {
    if (!pts.length) return '';
    var hi = pts[0], lo = pts[0];
    pts.forEach(function (p) { if (p.v > hi.v) hi = p; if (p.v < lo.v) lo = p; });
    var first = pts[0], last = pts[pts.length - 1];
    var pct = (pts.length > 1 && first.v) ? (last.v / first.v - 1) * 100 : null;
    var pdir = (pct == null) ? 'flat' : (pct > 0 ? 'up' : (pct < 0 ? 'down' : 'flat'));
    return '<ul class="mkc-stats">' +
      '<li><span>기간 고점</span><b>' + esc(fmtPrice(hi.v, dec)) + '</b><i>' + esc(hi.label || mkcAxisLabel(hi.d, tab)) + '</i></li>' +
      '<li><span>기간 저점</span><b>' + esc(fmtPrice(lo.v, dec)) + '</b><i>' + esc(lo.label || mkcAxisLabel(lo.d, tab)) + '</i></li>' +
      '<li><span>' + esc((dense ? MKC_SUB[tab] : (MKC_SUB_ANCHOR[tab] + ' 실측')) || '기간') + ' 등락</span><b class="is-' + pdir + '">' + (pct == null ? '—' : fmtPct(pct)) + '</b><i>' + esc(pts.length) + '개 기준점</i></li>' +
    '</ul>';
  }

  function mkcEmptyHTML(tab, n, hasSer) {
    if (n >= 4) return '';
    var start = (n === 0)
      ? ('<b>' + esc(MKC_LABEL[tab]) + ' 구간에 실측 기준점이 없습니다.</b> ')
      : ('<b>' + esc(MKC_LABEL[tab]) + ' 구간 실측 기준점 ' + esc(n) + '개</b>로 그린 선입니다. ');
    return '<div class="mkc-empty">' +
      '<p>' + start +
      (hasSer ? '' : '이 품목은 공개 일별 시계열이 없어 시황표에 실제로 기록된 고시값만 이어 그립니다. ') +
      '시황 스냅샷이 매일 쌓이면 이 구간도 자동으로 촘촘해집니다.</p>' +
    '</div>';
  }

  function mkcBodyHTML(m, code, tab) {
    var item = mkcItem(m, code) || {};
    var data = mkcPoints(m, code);
    var ser = data.ser;
    var unit = (ser && ser.unit) || item.unit || '';
    var dec = (ser && ser.decimals != null) ? ser.decimals : (item.decimals != null ? item.decimals : 2);
    var end = mkcEnd(m, data.pts);
    var pts = mkcWindow(data.pts, tab, data.dense, end);

    var head = '';
    if (pts.length) {
      var last = pts[pts.length - 1];
      var prev = pts.length > 1 ? pts[pts.length - 2] : null;
      var pct = null;
      if (prev && prev.v) pct = (last.v / prev.v - 1) * 100;
      else if (item.changePct != null && !data.dense) pct = item.changePct;
      var basis = (prev ? (IBLANG ? 'prev. ' + koMD(prev.d) : '직전 ' + koMD(prev.d)) : humanBasis(item.changeBasis || '')) + (pct == null ? '' : ' ' + LBL.vs);
      head = '<div class="mkc-figure">' +
        '<b class="mkc-value">' + esc(fmtPrice(last.v, dec)) + '<em>' + esc(unit) + '</em></b>' +
        '<span class="mk-delta is-' + (pct == null ? 'flat' : (pct > 0 ? 'up' : (pct < 0 ? 'down' : 'flat'))) + '">' +
          (pct == null ? '—' : fmtPct(pct)) + '</span>' +
        (pct == null ? '' : '<span class="mkc-basis">' + esc(basis) + '</span>') +
      '</div>';
    }

    var plot = pts.length >= 2
      ? mkcSVG(code + '-' + tab, pts, dec, unit, tab)
      : (pts.length === 1
        ? '<div class="mkc-solo"><b>' + esc(fmtPrice(pts[0].v, dec)) + '<em>' + esc(unit) + '</em></b><span>' + esc(mkcAxisLabel(pts[0].d, tab)) + ' 기준점</span></div>'
        : (item.price != null
          ? '<div class="mkc-solo"><b>' + esc(fmtPrice(item.price, item.decimals)) + '<em>' + esc(mkUnit(item.unit || '')) + '</em></b><span>시황표 값 · ' + esc(koDate(item.date)) + ' 기준</span></div>'
          : ''));

    return head +
      (plot || '') +
      mkcStatsHTML(pts, tab, dec, unit, data.dense) +
      mkcEmptyHTML(tab, pts.length, !!ser);
  }

  function mkcHeadHTML(m, code, tab) {
    var item = mkcItem(m, code) || {};
    var ser = mkcSer(code);
    var badge = ser ? '일별 종가' : '실측 기준점 비교';
    var tabs = ['d', 'w', 'y'].map(function (t) {
      var on = t === tab;
      return '<button type="button" class="mkc-tab' + (on ? ' is-active' : '') + '" role="tab" aria-selected="' + (on ? 'true' : 'false') + '" data-mkc-tab-on="' + t + '">' + MKC_LABEL[t] + '</button>';
    }).join('');
    return '<div class="mkc-head">' +
      '<div class="mkc-title">' +
        '<span class="mkc-kicker">' + esc(item.code || code) + ' · ' + esc(badge) + '</span>' +
        '<b>' + esc(item.name || (ser && ser.name) || code) + '</b>' +
      '</div>' +
      '<div class="mkc-tabs" role="tablist" aria-label="그래프 기간">' + tabs + '</div>' +
    '</div>';
  }

  function mkcFootHTML(m, code, tab) {
    var item = mkcItem(m, code) || {};
    var ser = mkcSer(code);
    var data = mkcPoints(m, code);
    var end = mkcEnd(m, data.pts);
    var pts = mkcWindow(data.pts, tab, data.dense, end);
    var lastD = pts.length ? pts[pts.length - 1].d : (ser && ser.points && ser.points.length ? ser.points[ser.points.length - 1][0] : item.date);
    var src = ser
      ? '<a href="' + attr(ser.sourceUrl) + '" target="_blank" rel="noopener noreferrer">' + esc(ser.sourceName) + '</a><span>' + esc(koDate(lastD)) + ' 종가 · 일별 ' + esc((ser.points || []).length) + '거래일</span>'
      : '<a href="' + attr(item.sourceUrl || '#') + '" target="_blank" rel="noopener noreferrer">' + esc(item.sourceName || '출처') + '</a><span>' + esc(koDate(item.date)) + ' 기준 · 실측 기준점 비교(매일 자동 누적 중)</span>';
    var note = ser ? (ser.note || '') : '공개 일별 시계열이 없는 지표라 시황표에 실제로 기록된 기준점(전일·1주 전·1달 전·1년 전)과 누적 스냅샷만 이어 그립니다. 값이 없는 날은 만들지 않습니다.';
    var tableVal = (ser && item.price != null)
      ? '<span class="mkc-table-val">시황표 값 ' + esc(fmtPrice(item.price, item.decimals)) + ' ' + esc(mkUnit(item.unit || '')) + ' (' + esc(koDate(item.date)) + ')</span>'
      : '';
    return '<div class="mkc-foot">' + src + tableVal + '</div>' +
      (note ? '<p class="mkc-note">' + esc(note) + '</p>' : '');
  }

  function mkcPanelHTML(m, code) {
    var data = mkcPoints(m, code);
    var tab = mkcDefaultTab(m, data, code);
    MKC_TAB[code] = tab;
    return '<div class="mkc" data-mkc-code="' + attr(code) + '" data-mkc-cur="' + attr(tab) + '">' +
      mkcHeadHTML(m, code, tab) +
      '<div class="mkc-body">' + mkcBodyHTML(m, code, tab) + '</div>' +
      '<div class="mkc-footwrap">' + mkcFootHTML(m, code, tab) + '</div>' +
    '</div>';
  }

  function mkcRefresh(panel) {
    var m = state.market;
    if (!m || !panel) return;
    var code = panel.getAttribute('data-mkc-code');
    var tab = panel.getAttribute('data-mkc-cur') || 'd';
    var body = $('.mkc-body', panel);
    var foot = $('.mkc-footwrap', panel);
    if (body) body.innerHTML = mkcBodyHTML(m, code, tab);
    if (foot) foot.innerHTML = mkcFootHTML(m, code, tab);
    $$('.mkc-tab', panel).forEach(function (b) {
      var on = b.getAttribute('data-mkc-tab-on') === tab;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    var svg = $('.mkc-svg', panel);
    if (svg) mkcBindPlot(svg);
  }

  /* 마우스·터치로 짚은 점의 날짜·값·직전 대비를 보여 줍니다. */
  function mkcBindPlot(svg) {
    var plot = svg.parentNode;
    var recEl = plot ? $('.mkc-rec', plot) : null;
    var tip = plot ? $('.mkc-tip', plot) : null;
    if (!recEl || !tip) return;
    var rec;
    try { rec = JSON.parse(recEl.textContent || recEl.innerHTML || '{}'); } catch (e) { return; }
    if (!rec || !rec.pts || !rec.pts.length) return;
    var guide = $('.mkc-guide', svg);
    var dots = $$('.mkc-dot', svg);

    function near(ev) {
      var box = svg.getBoundingClientRect();
      if (!box.width) return -1;
      var px = ((ev.clientX - box.left) / box.width) * rec.w;
      var best = 0, bd = Infinity;
      for (var i = 0; i < rec.xs.length; i++) {
        var d = Math.abs(rec.xs[i] - px);
        if (d < bd) { bd = d; best = i; }
      }
      return best;
    }
    function show(i) {
      if (i < 0 || !rec.pts[i]) return;
      var p = rec.pts[i], pp = i > 0 ? rec.pts[i - 1] : null;
      var chg = (pp && pp.v) ? (p.v / pp.v - 1) * 100 : null;
      tip.innerHTML = '<b>' + esc(p.d) + '</b><span class="mkc-tip-v">' + esc(fmtPrice(p.v, rec.dec)) + '<i>' + esc(rec.unit) + '</i></span>' +
        (chg == null ? '' : '<span class="mkc-tip-d ' + (chg > 0 ? 'is-up' : (chg < 0 ? 'is-down' : 'is-flat')) + '">' + (chg > 0 ? '▲ ' : (chg < 0 ? '▼ ' : '― ')) + fmtPct(chg) + '</span>');
      tip.hidden = false;
      var leftPct = Math.max(10, Math.min(90, (rec.xs[i] / rec.w) * 100));
      var yPct = (rec.ys[i] / rec.h) * 100;
      var below = yPct < 46;
      tip.classList.toggle('is-below', below);
      tip.style.left = leftPct.toFixed(1) + '%';
      tip.style.top = (below ? Math.min(84, yPct + 6) : Math.max(16, yPct - 6)).toFixed(1) + '%';
      if (guide) { guide.setAttribute('x1', rec.xs[i]); guide.setAttribute('x2', rec.xs[i]); guide.setAttribute('opacity', '1'); }
      for (var k = 0; k < dots.length; k++) { dots[k].setAttribute('r', k === i ? 3.9 : (k === rec.pts.length - 1 ? 2.9 : 1.9)); }
    }
    function hide() {
      tip.hidden = true;
      if (guide) guide.setAttribute('opacity', '0');
      for (var k = 0; k < dots.length; k++) dots[k].setAttribute('r', k === rec.pts.length - 1 ? 2.9 : 1.9);
    }
    svg.addEventListener('pointermove', function (ev) { if (ev.pointerType !== 'touch') show(near(ev)); });
    svg.addEventListener('pointerdown', function (ev) { show(near(ev)); });
    svg.addEventListener('pointerleave', function (ev) { if (ev.pointerType !== 'touch') hide(); });
  }

  /* 표의 한 행 아래에 붙는 그래프 행 */
  function mkcRowHTML(r, span) {
    return '<tr class="mkc-row" data-mkc-row="' + attr(r.code) + '" hidden>' +
      '<td colspan="' + (span || 4) + '"><div class="mkc-slot" data-mkc-slot="' + attr(r.code) + '"></div></td>' +
    '</tr>';
  }
  function mkcBtnHTML(r) {
    return '<button type="button" class="mk-chart-btn" data-mkc-open="' + attr(r.code) + '" aria-expanded="false" title="' + attr(T(r.name) + ' ' + LBL.chart) + '">📈 차트</button>';
  }

  function mkcToggle(code, btn) {
    var board = $('#market-board');
    if (!board) return;
    var id = mkcId(code);
    var row = board.querySelector('[data-mkc-row="' + code.replace(/"/g, '\\"') + '"]');
    var slot = null, panel = null;

    if (row) {
      slot = row.querySelector('[data-mkc-slot]');
      var open = !row.hasAttribute('hidden');
      /* 한 번에 하나만 펼칩니다. */
      $$('.mkc-row', board).forEach(function (r) {
        if (r !== row) { r.setAttribute('hidden', ''); var b = r.previousElementSibling && r.previousElementSibling.querySelector('[data-mkc-open]'); if (b) b.setAttribute('aria-expanded', 'false'); }
      });
      $$('.mk-chart-btn', board).forEach(function (b) { if (b !== btn) b.setAttribute('aria-expanded', 'false'); });
      var fxSlot = $('#mkc-fx-slot');
      if (fxSlot) { fxSlot.setAttribute('hidden', ''); fxSlot.innerHTML = ''; }
      $$('.mk-quote', board).forEach(function (q) { q.classList.remove('is-open'); });
      if (open) { row.setAttribute('hidden', ''); if (btn) btn.setAttribute('aria-expanded', 'false'); return; }
      row.removeAttribute('hidden');
      if (btn) btn.setAttribute('aria-expanded', 'true');
      if (slot && !slot.__mkcBuilt) {
        slot.innerHTML = mkcPanelHTML(state.market, code);
        slot.__mkcBuilt = true;
        panel = $('.mkc', slot);
        var svg = panel && $('.mkc-svg', panel);
        if (svg) mkcBindPlot(svg);
      }
      return;
    }

    /* 유가·환율 카드처럼 표 밖에 있는 품목: 그리드 아래 공용 슬롯에 그립니다. */
    var fx = $('#mkc-fx-slot');
    if (!fx) return;
    var same = !fx.hasAttribute('hidden') && fx.getAttribute('data-mkc-for') === code;
    /* 표 행에 열려 있던 그래프는 닫습니다(한 번에 하나만). */
    $$('.mkc-row', board).forEach(function (r) { r.setAttribute('hidden', ''); });
    $$('.mk-quote', board).forEach(function (q) { q.classList.remove('is-open'); });
    $$('.mk-chart-btn', board).forEach(function (b) { b.setAttribute('aria-expanded', b === btn ? 'true' : 'false'); });
    if (same) {
      fx.setAttribute('hidden', ''); fx.innerHTML = ''; fx.removeAttribute('data-mkc-for');
      if (btn) btn.setAttribute('aria-expanded', 'false');
      return;
    }
    fx.setAttribute('data-mkc-for', code);
    fx.innerHTML = mkcPanelHTML(state.market, code);
    fx.removeAttribute('hidden');
    var s2 = $('.mkc-svg', fx);
    if (s2) mkcBindPlot(s2);
    var card = btn && btn.closest ? btn.closest('.mk-quote') : null;
    if (card) card.classList.add('is-open');
    fx.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function bindMkc(board) {
    if (!board || board.__mkcBound) return;
    board.__mkcBound = true;
    board.addEventListener('click', function (ev) {
      var el = ev.target;
      while (el && el !== board) {
        if (el.getAttribute && el.getAttribute('data-mkc-open')) {
          ev.preventDefault();
          mkcToggle(el.getAttribute('data-mkc-open'), el);
          return;
        }
        if (el.getAttribute && el.getAttribute('data-mkc-tab-on')) {
          ev.preventDefault();
          var panel = el.closest ? el.closest('.mkc') : null;
          if (!panel) return;
          var tab = el.getAttribute('data-mkc-tab-on');
          panel.setAttribute('data-mkc-cur', tab);
          MKC_TAB[panel.getAttribute('data-mkc-code')] = tab;
          mkcRefresh(panel);
          return;
        }
        el = el.parentNode;
      }
    });
  }

  function tabsHTML(tabs) {
    return '<div class="mk-tabs" role="tablist" aria-label="시황 기간 선택">' + tabs.map(function (t, i) {
      var on = t.id === state.mkTab;
      return '<button type="button" class="mk-tab' + (on ? ' is-active' : '') + '" role="tab" id="mk-tab-' + attr(t.id) + '"' +
        ' aria-controls="mk-panel-' + attr(t.id) + '" aria-selected="' + (on ? 'true' : 'false') + '" tabindex="' + (on ? '0' : '-1') + '"' +
        ' data-mk-tab="' + attr(t.id) + '">' + esc(t.label) + '</button>';
    }).join('') + '</div>';
  }

  function boardHTML(m) {
    var rows = m.commodities || [];
    var asOf = m.asOf || (rows[0] && rows[0].date) || '';
    var periods = m.periods || {};
    var tabs = periods.tabs || [];
    if (state.mkTab !== 'daily' && !tabs.some(function (t) { return t.id === state.mkTab; })) state.mkTab = 'daily';

    var htag = (state.page === 'market') ? 'h1' : 'h2';
    var head = '' +
      '<div class="mk-head">' +
        '<div class="mk-head-main">' +
          '<span class="kicker">MARKET &amp; COMMODITIES</span>' +
          '<' + htag + ' id="market-title">중국 선물 · 원자재 · 해상운임 시황</' + htag + '>' +
          '<p class="mk-sub">유가·환율, 중국 3대 선물거래소(SHFE·DCE·ZCE), SCFI·CCFI, 비철금속·석유화학·곡물, 국내 물가지표를 한 화면에. <b>품목마다 붙은 「📈 차트」를 누르면 그 자리에서 일간·주간·연간 그래프</b>가 열립니다(실제 종가 시계열만, 없는 값은 그리지 않습니다). <b>재생원자재</b> 탭에는 한국환경공단이 매달 공표하는 재활용가능자원 가격조사(폐플라스틱 압축·플레이크·펠렛, 폐지, 폐금속, 폐유리병) 월간 공시값을 권역·성상과 함께 싣습니다. 아래로 석유화학·철강/비철·농산품·에너지 4개 산업 계통도와 원단위(Unit Consumption) 90품목 표가 이어집니다. 공개 출처로 확인된 값만 싣고 기준일과 출처를 함께 표시합니다.</p>' +
        '</div>' +
        '<div class="mk-stamp">' +
          '<span>기준일</span><b>' + esc(koDate(asOf)) + ' (' + esc(koWeekday(asOf)) + ')</b>' +
          '<span>갱신 ' + esc(koStamp(m.updatedAt)) + '</span>' +
        '</div>' +
      '</div>';

    var jump = '<nav class="mk-jump" aria-label="시황판 바로가기">' +
      '<a href="#market-quotes" data-mk-jump="mk-daily" class="is-on">시황표</a>' +
      '<a href="#mk-panel-recycled" data-mk-tab="recycled">재생원자재</a>' +
      '<a href="#industry-flow">산업 계통도</a>' +
      '<a href="#unit-consumption">원단위·원가</a>' +
      '<a href="#market-glossary">용어·제품 상식</a>' +
      '<a href="#market-sources" data-mk-jump="market-sources">기준·출처</a>' +
    '</nav>';

    var liveBar = liveBarHTML();

    if (!tabs.length) return head + liveBar + summaryHTML(m) + chartsHTML(m) + jump + dailyPanelHTML(m);

    var body = tabs.map(function (t) {
      var on = t.id === state.mkTab;
      var inner = (t.id === 'daily') ? dailyPanelHTML(m) : periodPanelHTML(m, t.id);
      return '<div class="mk-panel" id="mk-panel-' + attr(t.id) + '" role="tabpanel" aria-labelledby="mk-tab-' + attr(t.id) + '"' +
        ' data-mk-panel="' + attr(t.id) + '"' + (on ? '' : ' hidden') + '>' + inner + '</div>';
    }).join('');

    return head + liveBar + summaryHTML(m) + chartsHTML(m) + jump + tabsHTML(tabs) + '<div class="mk-panels" id="market-quotes">' + body + '</div>';
  }

  function applyMkTab(board) {
    var tabs = $$('[data-mk-tab]', board);
    if (!tabs.length) return;
    var want = state.mkTab || 'daily';
    if (!tabs.some(function (b) { return b.getAttribute('data-mk-tab') === want; })) {
      want = tabs[0].getAttribute('data-mk-tab');
      state.mkTab = want;
    }
    tabs.forEach(function (b) {
      var on = b.getAttribute('data-mk-tab') === want;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-selected', on ? 'true' : 'false');
      b.tabIndex = on ? 0 : -1;
    });
    $$('[data-mk-panel]', board).forEach(function (p) {
      if (p.getAttribute('data-mk-panel') === want) p.removeAttribute('hidden');
      else p.setAttribute('hidden', '');
    });
  }

  function bindMarketTabs(board) {
    if (!board.__mkBound) {
      board.__mkBound = true;
      /* 요약 카드·바로가기를 누르면 일간 탭으로 돌아가 해당 표로 스크롤합니다. */
      board.addEventListener('click', function (ev) {
        var el = ev.target;
        while (el && el !== board) {
          var jump = el.getAttribute && el.getAttribute('data-mk-jump');
          if (jump) {
            ev.preventDefault();
            if (state.mkTab !== 'daily') { state.mkTab = 'daily'; applyMkTab(board); }
            var target = document.getElementById(jump === 'mk-daily' ? 'market-quotes' : jump);
            if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            return;
          }
          el = el.parentNode;
        }
      });
      board.addEventListener('click', function (ev) {
        var el = ev.target;
        while (el && el !== board) {
          if (el.getAttribute && el.getAttribute('data-mk-tab')) {
            state.mkTab = el.getAttribute('data-mk-tab');
            applyMkTab(board);
            return;
          }
          el = el.parentNode;
        }
      });
      board.addEventListener('keydown', function (ev) {
        var key = ev.key;
        if (key !== 'ArrowRight' && key !== 'ArrowLeft' && key !== 'Home' && key !== 'End') return;
        if (!ev.target || !ev.target.getAttribute || !ev.target.getAttribute('data-mk-tab')) return;
        var tabs = $$('[data-mk-tab]', board);
        if (!tabs.length) return;
        var idx = tabs.map(function (b) { return b.getAttribute('data-mk-tab'); }).indexOf(state.mkTab);
        if (idx < 0) idx = 0;
        if (key === 'ArrowRight') idx = (idx + 1) % tabs.length;
        else if (key === 'ArrowLeft') idx = (idx - 1 + tabs.length) % tabs.length;
        else if (key === 'Home') idx = 0;
        else idx = tabs.length - 1;
        state.mkTab = tabs[idx].getAttribute('data-mk-tab');
        applyMkTab(board);
        tabs[idx].focus();
        ev.preventDefault();
      });
    }
    applyMkTab(board);
  }

  function renderMarket() {
    var strip = $('#market-strip');
    var board = $('#market-board');
    var empty = $('#market-empty');
    var m = state.market;
    if (!m || !(m.oilFx || []).length) {
      if (strip) strip.setAttribute('hidden', '');
      if (board) { board.setAttribute('hidden', ''); board.innerHTML = ''; }
      if (empty) empty.removeAttribute('hidden');
      return;
    }
    if (empty) empty.setAttribute('hidden', '');
    if (strip) {
      strip.innerHTML = stripHTML(m);
      strip.removeAttribute('hidden');
    }
    /* 시황표는 '원자재 시황' 탭(market.html)에서만 크게 보여 줍니다.
       무역·원자재 기사 탭은 기사 목록만 나옵니다. */
    if (board) {
      if (state.page === 'market') {
        board.innerHTML = boardHTML(m);
        board.removeAttribute('hidden');
        bindMarketCharts($('#market-charts', board));
        bindMarketTabs(board);
        bindMkc(board);
        initLiveQuotes();
        if ((window.location.hash || '').indexOf('#gl-') === 0) openGlossaryFromHash();
      } else {
        board.setAttribute('hidden', '');
        board.innerHTML = '';
      }
    }
  }

  /* ---------------- 실시간 시세 연동 (공개 CORS API를 브라우저가 직접 조회) -------------
     · 응답으로 온 실제 값만 화면에 씁니다. 실패한 품목은 data/market.json 스냅샷 값을 그대로 둡니다.
     · 환율 3종(원·달러·100엔·위안)은 동방재부(eastmoney) 외환 실시간 호가를 받아 크로스로 환산하고,
       그 호가가 막히면 manana(야후 기반) 분 단위 시세로 대체합니다(둘 다 무료·CORS 허용).
     · 60초마다 자동 갱신하고, '새로고침' 버튼으로 즉시 다시 조회합니다. */
  var LIVE_MS = 60000;
  var LIVE_EM = [
    ['113.cu2701', 'SHFE-CU', 'https://quote.eastmoney.com/qihuo/cu2701.html'],
    ['113.al2701', 'SHFE-AL', 'https://quote.eastmoney.com/qihuo/al2701.html'],
    ['142.sc2701', 'SHFE-SC', 'https://quote.eastmoney.com/qihuo/sc2701.html'],
    ['114.pp2701', 'DCE-PP', 'https://quote.eastmoney.com/qihuo/pp2701.html'],
    ['114.l2701', 'DCE-L', 'https://quote.eastmoney.com/qihuo/l2701.html'],
    ['114.v2701', 'DCE-V', 'https://quote.eastmoney.com/qihuo/v2701.html'],
    ['114.eg2701', 'DCE-EG', 'https://quote.eastmoney.com/qihuo/eg2701.html'],
    ['115.TA701', 'ZCE-TA', 'https://quote.eastmoney.com/qihuo/TA701.html'],
    ['115.MA701', 'ZCE-MA', 'https://quote.eastmoney.com/qihuo/MA701.html'],
    ['102.CL00Y', 'WTI', 'https://quote.eastmoney.com/globalfuture/CL00Y.html']
  ];
  var liveState = { at: null, busy: false, timer: null, liveN: 0, refN: 0, fail: [] };

  function liveJSON(url, ms) {
    var ctrl = (typeof AbortController === 'function') ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, ms || 9000);
    var opt = { cache: 'no-store', credentials: 'omit' };
    if (ctrl) opt.signal = ctrl.signal;
    return fetch(url, opt).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    }).then(function (j) { clearTimeout(timer); return j; },
      function (e) { clearTimeout(timer); throw e; });
  }

  /* 한 번 실패한 소스는 짧게 쉬고 한 번 더 시도합니다(해외 호스팅·일시 타임아웃 대비). */
  function liveJSONTry(url, ms, tries) {
    var left = tries || 2;
    function attempt() {
      return liveJSON(url, ms).catch(function (e) {
        left -= 1;
        if (left <= 0) throw e;
        return new Promise(function (ok) { setTimeout(ok, 800); }).then(attempt);
      });
    }
    return attempt();
  }

  function liveSnap(code) {
    var m = state.market || {};
    var pool = (m.commodities || []).concat(m.oilFx || []);
    for (var i = 0; i < pool.length; i++) if (pool[i].code === code) return pool[i];
    return null;
  }
  /* 스냅샷의 등락·가격에서 전일 종가를 되돌립니다. 실시간 값의 등락도 같은 기준으로 계산합니다. */
  function livePrev(snap) {
    if (!snap || snap.price == null) return null;
    if (snap.change != null && !isNaN(snap.change)) return Number(snap.price) - Number(snap.change);
    if (snap.changePct != null && !isNaN(snap.changePct)) return Number(snap.price) / (1 + Number(snap.changePct) / 100);
    return null;
  }
  function liveClock() {
    var d = new Date();
    try {
      return new Intl.DateTimeFormat('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false, timeZone: 'Asia/Seoul' }).format(d);
    } catch (e) {
      return ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2) + ':' + ('0' + d.getSeconds()).slice(-2);
    }
  }
  function liveHM() {
    var d = new Date();
    try {
      return new Intl.DateTimeFormat('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Seoul' }).format(d);
    } catch (e) { return ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2); }
  }

  /* 업비트 KRW 실시간 (비트코인·이더리움) */
  function liveLoadCrypto() {
    return liveJSONTry('https://api.upbit.com/v1/ticker?markets=KRW-BTC,KRW-ETH', 11000, 2).then(function (arr) {
      var out = {}, map = { 'KRW-BTC': 'BTC', 'KRW-ETH': 'ETH' };
      (arr || []).forEach(function (t) {
        var code = map[t.market];
        if (!code) return;
        out[code] = {
          code: code, price: Number(t.trade_price),
          change: Number(t.signed_change_price), changePct: Number(t.signed_change_rate) * 100,
          unit: '원', decimals: 0, kind: 'live', basis: '전일 종가 대비',
          sourceName: '업비트 KRW 실시간',
          sourceUrl: 'https://upbit.com/exchange?code=CRIX.UPBIT.' + t.market
        };
      });
      if (!out.BTC && !out.ETH) throw new Error('upbit: empty');
      return out;
    });
  }

  /* 환율 3종 — 동방재부(eastmoney) 외환 실시간 호가(틱 단위, 60초 재조회)
     USDKRW·USDJPY·USDCNH를 받아 100엔·위안 크로스로 환산합니다.
     동방재부가 502로 막히면 manana(야후 기반) 분 단위 시세로 대체합니다(둘 다 무료·CORS 허용). */
  var LIVE_FX_EM = '119.USDKRW,119.USDJPY,133.USDCNH';
  var LIVE_FX_MN = 'https://api.manana.kr/exchange/rate/KRW/USD,JPY,CNY.json';
  var LIVE_FX_EM_URL = 'https://quote.eastmoney.com/forex/USDKRW.html';

  function liveFxRec(code, price, unit, dec, change, changePct, basis, srcName, srcUrl) {
    return {
      code: code, price: price, unit: unit, decimals: dec, kind: 'live',
      change: change, changePct: changePct, basis: basis,
      sourceName: srcName, sourceUrl: srcUrl
    };
  }
  function liveFxPct(price, prev) {
    return (prev && prev > 0) ? (price - prev) / prev * 100 : null;
  }

  /* 역외 위안(133.USDCNH)은 호가 응답의 전일종가(f18)가 일간 종가와 어긋날 때가 있어,
     일봉 직전 종가를 함께 받아 그 값을 기준으로 씁니다. 실패하면 f18로 돌아갑니다. */
  function liveFxHistoryClose(secid) {
    var url = 'https://push2his.eastmoney.com/api/qt/stock/kline/get?secid=' + encodeURIComponent(secid) +
      '&fields1=f1,f2,f3&fields2=f51,f53&klt=101&fqt=0&end=20500101&lmt=2';
    return liveJSONTry(url, 9000, 1).then(function (d) {
      var k = (d && d.data && d.data.klines) || [];
      if (k.length < 2) return null;
      var p = String(k[k.length - 2]).split(',');
      var v = Number(p[1]);
      return isFinite(v) && v > 0 ? v : null;
    });
  }

  function liveFxFromEastmoney() {
    var url = 'https://push2delay.eastmoney.com/api/qt/ulist.np/get?fltt=2&invt=2&fields=f2,f3,f4,f12,f13,f18,f124&secids=' +
      encodeURIComponent(LIVE_FX_EM);
    return Promise.all([
      liveJSONTry(url, 12000, 2),
      liveFxHistoryClose('133.USDCNH').catch(function () { return null; })
    ]).then(function (res) {
      var d = res[0], cnhPrevClose = res[1];
      var diff = (d && d.data && d.data.diff) || [];
      var by = {};
      diff.forEach(function (it) { if (it && it.f12) by[String(it.f13) + '.' + String(it.f12).toUpperCase()] = it; });
      function val(it, k) {
        if (!it || it[k] == null || it[k] === '-') return null;
        var v = Number(it[k]);
        return isFinite(v) && v > 0 ? v : null;
      }
      var usd = by['119.USDKRW'], jpy = by['119.USDJPY'], cnh = by['133.USDCNH'];
      var pUsd = val(usd, 'f2'), vUsd = val(usd, 'f18');
      if (pUsd == null) throw new Error('eastmoney fx: USDKRW');
      var src = '동방재부(eastmoney) 외환 실시간 호가', basis = '전일 종가 대비', out = {};
      out['USD/KRW'] = liveFxRec('USD/KRW', pUsd, '원', 2,
        vUsd ? pUsd - vUsd : null, liveFxPct(pUsd, vUsd), basis, src, LIVE_FX_EM_URL);
      /* 크로스 환산 — 100엔·위안 모두 원화 표기로 */
      var pJpy = val(jpy, 'f2'), vJpy = val(jpy, 'f18');
      if (pJpy) {
        var pJ = pUsd / pJpy * 100, vJ = (vUsd && vJpy) ? vUsd / vJpy * 100 : null;
        out['JPY/KRW'] = liveFxRec('JPY/KRW', pJ, '원/100엔', 2,
          vJ ? pJ - vJ : null, liveFxPct(pJ, vJ), basis, src, LIVE_FX_EM_URL);
      }
      var pCnh = val(cnh, 'f2'), vCnh = cnhPrevClose || val(cnh, 'f18');
      if (pCnh) {
        var pC = pUsd / pCnh, vC = (vUsd && vCnh) ? vUsd / vCnh : null;
        out['CNY/KRW'] = liveFxRec('CNY/KRW', pC, '원/위안', 2,
          vC ? pC - vC : null, liveFxPct(pC, vC), basis, src, LIVE_FX_EM_URL);
      }
      return out;
    });
  }

  function liveFxFromManana() {
    return liveJSONTry(LIVE_FX_MN, 11000, 2).then(function (arr) {
      var r = {};
      (arr || []).forEach(function (it) {
        if (!it || !it.name) return;
        var v = Number(it.rate);
        if (isFinite(v) && v > 0) r[it.name] = v;
      });
      var src = 'manana 환율(야후 기반) 분 단위 시세', url = 'https://api.manana.kr/', out = {};
      /* manana는 호가 등락을 주지 않아 스냅샷 전일 고시값을 기준으로 계산합니다. */
      function put(code, price, unit, dec) {
        if (price == null || !isFinite(price) || price <= 0) return;
        var prev = livePrev(liveSnap(code));
        out[code] = liveFxRec(code, price, unit, dec,
          prev ? price - prev : null, liveFxPct(price, prev), '전일 고시 대비', src, url);
      }
      put('USD/KRW', r['USDKRW=X'], '원', 2);
      put('JPY/KRW', r['JPYKRW=X'] ? r['JPYKRW=X'] * 100 : null, '원/100엔', 2);
      put('CNY/KRW', r['CNYKRW=X'], '원/위안', 2);
      if (!Object.keys(out).length) throw new Error('manana fx: none');
      return out;
    });
  }

  function liveLoadFx() {
    /* 두 소스를 함께 조회하고 품목별로 동방재부 실시간 호가를 우선 씁니다. */
    return Promise.all([
      liveFxFromEastmoney().catch(function () { return null; }),
      liveFxFromManana().catch(function () { return null; })
    ]).then(function (r) {
      var out = {};
      if (r[1]) Object.keys(r[1]).forEach(function (k) { out[k] = r[1][k]; });
      if (r[0]) Object.keys(r[0]).forEach(function (k) { out[k] = r[0][k]; });
      if (!Object.keys(out).length) throw new Error('fx: none');
      return out;
    });
  }

  /* 국제 금·은 현물 (gold-api) */
  function liveLoadMetals() {
    var pairs = [['XAU', 'AU'], ['XAG', 'AG']];
    return Promise.all(pairs.map(function (p) {
      return liveJSONTry('https://api.gold-api.com/price/' + p[0], 9000, 2).then(function (d) {
        var price = Number(d && d.price);
        if (!price) throw new Error('gold: ' + p[0]);
        return { code: p[1], price: price };
      }).catch(function () { return null; });
    })).then(function (arr) {
      var out = {};
      arr.forEach(function (it) {
        if (!it) return;
        var snap = liveSnap(it.code), prev = livePrev(snap);
        out[it.code] = {
          code: it.code, price: it.price, unit: 'USD/oz', decimals: 2, kind: 'live',
          change: prev ? it.price - prev : null,
          changePct: prev ? (it.price - prev) / prev * 100 : null,
          basis: '전일 종가 대비',
          sourceName: 'gold-api 국제 현물', sourceUrl: 'https://www.gold-api.com/'
        };
      });
      if (!out.AU && !out.AG) throw new Error('gold: empty');
      return out;
    });
  }

  /* WTI + 중국 3대 선물거래소 (동방재부 eastmoney 공개 호가) */
  function liveLoadChina() {
    var ids = LIVE_EM.map(function (p) { return p[0]; }).join(',');
    var url = 'https://push2delay.eastmoney.com/api/qt/ulist.np/get?fltt=2&invt=2&fields=f2,f3,f4,f12,f13,f18&secids=' + encodeURIComponent(ids);
    return liveJSONTry(url, 12000, 2).then(function (d) {
      var diff = (d && d.data && d.data.diff) || [];
      if (!diff.length) throw new Error('eastmoney: empty');
      var by = {};
      diff.forEach(function (it) { by[String(it.f13) + '.' + String(it.f12).toUpperCase()] = it; });
      var out = {};
      LIVE_EM.forEach(function (p) {
        var it = by[p[0].toUpperCase()];
        if (!it || it.f2 == null || it.f2 === '-') return;
        var price = Number(it.f2);
        if (!isFinite(price)) return;
        var snap = liveSnap(p[1]);
        out[p[1]] = {
          code: p[1], price: price, kind: 'live',
          change: (it.f4 == null || it.f4 === '-') ? null : Number(it.f4),
          changePct: (it.f3 == null || it.f3 === '-') ? null : Number(it.f3),
          unit: snap ? snap.unit : '', decimals: snap ? snap.decimals : 0,
          basis: '전일 종가 대비',
          sourceName: '동방재부(eastmoney) 호가', sourceUrl: p[2]
        };
      });
      if (!Object.keys(out).length) throw new Error('eastmoney: none');
      return out;
    });
  }

  function liveBadge(kind) {
    if (kind === 'ref') {
      return '<span class="mk-live-badge is-ref" title="하루 한 번 갱신되는 국제 참고 환율입니다. 한국수출입은행 고시 매매기준율과 다를 수 있습니다.">참고</span>';
    }
    return '<span class="mk-live-badge" title="브라우저가 60초마다 다시 조회한 값입니다.">LIVE</span>';
  }
  function liveStampText(rec) {
    return rec.kind === 'ref' ? '일 1회 갱신' : liveHM() + ' 갱신';
  }
  function livePriceHTML(rec, emHTML) {
    return esc(fmtPrice(rec.price, rec.decimals)) + (emHTML || '') + liveBadge(rec.kind);
  }
  function liveDeltaHTML(rec) {
    return deltaHTML({ change: rec.change, changePct: rec.changePct, decimals: rec.decimals, unit: rec.unit }, null, rec.basis);
  }

  function livePatchQuote(card, rec) {
    var b = card.querySelector('b');
    if (b) {
      var em = b.querySelector('em');
      /* 실시간 응답에 단위가 있으면 그 단위로 바꿉니다(크립토는 USD → 원). */
      b.innerHTML = livePriceHTML(rec, rec.unit ? '<em>' + esc(rec.unit) + '</em>' : (em ? em.outerHTML : ''));
    }
    var d = card.querySelector('.mk-delta');
    if (d) d.outerHTML = liveDeltaHTML(rec);
    var foot = card.querySelector('.mk-foot');
    if (foot) {
      var a = foot.querySelector('a');
      if (a) { a.textContent = rec.sourceName; if (rec.sourceUrl) a.href = rec.sourceUrl; }
      var sp = foot.querySelector('span');
      if (sp) sp.textContent = liveStampText(rec);
    }
  }

  function livePatchRow(tr, rec) {
    var price = tr.querySelector('td.mk-price');
    if (price) {
      var em = price.querySelector('em');
      price.innerHTML = livePriceHTML(rec, em ? em.outerHTML : '');
    }
    var chg = tr.querySelector('td.mk-chg');
    if (chg) chg.innerHTML = liveDeltaHTML(rec);
    var src = tr.querySelector('td.mk-src');
    if (src) {
      var a = src.querySelector('a');
      if (a) { a.textContent = rec.sourceName; if (rec.sourceUrl) a.href = rec.sourceUrl; }
      var sp = src.querySelector('span');
      if (sp) sp.textContent = liveStampText(rec);
    }
  }

  function livePatchCard(a, rec) {
    var v = a.querySelector('.mk-scard-val');
    if (v) {
      var em = v.querySelector('em');
      v.innerHTML = livePriceHTML(rec, rec.unit ? '<em>' + esc(rec.unit) + '</em>' : (em ? em.outerHTML : ''));
    }
    var d = a.querySelector('.mk-delta');
    if (d) d.outerHTML = liveDeltaHTML(rec);
    var meta = a.querySelector('.mk-scard-meta');
    if (meta) meta.textContent = (rec.kind === 'ref' ? '참고 환율' : '실시간') + ' · ' + liveHM();
  }

  function liveApply(recs, fails) {
    var board = $('#market-board');
    recs = recs || {};
    fails = fails || [];
    var codes = Object.keys(recs);
    var liveN = 0, refN = 0;
    if (board) {
      codes.forEach(function (code) {
        var rec = recs[code];
        if (rec.kind === 'ref') refN++; else liveN++;
        $$('#market-quotes [data-mkc-quote="' + code + '"]', board).forEach(function (el) {
          if (el.tagName === 'TR') livePatchRow(el, rec); else livePatchQuote(el, rec);
        });
        $$('.mk-scard[data-mk-live="' + code + '"]', board).forEach(function (el) { livePatchCard(el, rec); });
      });
    }
    if (codes.length) { liveState.at = new Date(); liveState.liveN = liveN; liveState.refN = refN; }
    liveState.fail = fails;

    var bar = $('#mk-live');
    var st = $('#mk-live-state');
    var tm = $('#mk-live-time');
    var ct = $('#mk-live-count');
    if (bar) {
      bar.classList.toggle('is-fail', !codes.length);
      bar.classList.toggle('is-part', !!codes.length && fails.length > 0);
    }
    if (st) {
      st.textContent = !codes.length ? '실시간 연결 실패 — 일간 고시값 유지'
        : (fails.length ? '일부 실시간 연동' : '실시간 연동');
    }
    if (tm) tm.textContent = codes.length ? '실시간 갱신 ' + liveClock() : '일간 고시값 유지';
    if (ct) ct.textContent = codes.length ? ('실시간 ' + liveN + '종' + (refN ? ' · 참고 ' + refN + '종' : '')) : '';
  }

  function liveRefresh() {
    if (liveState.busy) return;
    liveState.busy = true;
    var btn = $('#mk-live-refresh');
    if (btn) { btn.disabled = true; btn.classList.add('is-busy'); }
    Promise.all([
      liveLoadCrypto().catch(function () { return { __fail: 'crypto' }; }),
      liveLoadFx().catch(function () { return { __fail: 'fx' }; }),
      liveLoadMetals().catch(function () { return { __fail: 'metals' }; }),
      liveLoadChina().catch(function () { return { __fail: 'china' }; })
    ]).then(function (parts) {
      var recs = {}, fails = [];
      parts.forEach(function (p) {
        if (p && p.__fail) { fails.push(p.__fail); return; }
        Object.keys(p || {}).forEach(function (k) { recs[k] = p[k]; });
      });
      liveApply(recs, fails);
    }).catch(function () { liveApply({}, ['all']); }).then(function () {
      liveState.busy = false;
      if (btn) { btn.disabled = false; btn.classList.remove('is-busy'); }
    });
  }

  function initLiveQuotes() {
    var board = $('#market-board');
    if (!board || state.page !== 'market' || !$('#mk-live')) return;
    if (!board.__liveBound) {
      board.__liveBound = true;
      var btn = $('#mk-live-refresh', board);
      if (btn && !btn.__bound) { btn.__bound = true; btn.addEventListener('click', function () { liveRefresh(); }); }
      if (!initLiveQuotes.__vis) {
        initLiveQuotes.__vis = true;
        document.addEventListener('visibilitychange', function () {
          if (!document.hidden && liveState.at && (Date.now() - liveState.at.getTime()) > LIVE_MS) liveRefresh();
        });
      }
    }
    if (liveState.timer) return;
    liveRefresh();
    liveState.timer = setInterval(function () {
      if (!document.hidden) liveRefresh();
    }, LIVE_MS);
  }

  function liveBarHTML() {
    return '<div class="mk-live" id="mk-live" aria-live="polite">' +
      '<div class="mk-live-main">' +
        '<span class="mk-live-dot" aria-hidden="true"></span>' +
        '<b id="mk-live-state">실시간 시세 연결 중…</b>' +
        '<span class="mk-live-time" id="mk-live-time">—</span>' +
      '</div>' +
      '<div class="mk-live-side">' +
        '<span class="mk-live-count" id="mk-live-count"></span>' +
        '<button type="button" class="mk-live-btn" id="mk-live-refresh">새로고침</button>' +
      '</div>' +
    '</div>' +
    '<p class="mk-live-note">비트코인·이더리움은 업비트 KRW 실시간, 금·은은 국제 현물, WTI와 중국 3대 선물거래소 9종은 동방재부(eastmoney) 공개 호가로 60초마다 다시 조회합니다. 환율 3종도 동방재부(eastmoney) 외환 실시간 호가를 받아 100엔·위안 크로스로 환산하고(막히면 manana 분 단위 시세로 대체), 은행 고시 매매기준율과는 차이가 있을 수 있습니다. 나머지 품목은 일간 고시값이며, 조회에 실패한 품목은 기준일 스냅샷 값을 그대로 둡니다.</p>';
  }

  /* ---------------- 용어·제품 상식 (data/market-glossary.json) ---------------- */
  var glBound = false;

  function glCatLabel(g, id) {
    var c = (g.categories || []).filter(function (x) { return x.id === id; })[0];
    return c ? c.label : '';
  }

  function glCardHTML(g, e) {
    var cat = glCatLabel(g, e.cat);
    var facts = (e.facts || []).map(function (f) {
      return '<div class="gl-fact"><dt>' + esc(f[0]) + '</dt><dd>' + esc(f[1]) + '</dd></div>';
    }).join('');
    var body = (e.body || []).map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('');
    var srcs = (e.sources || []).map(function (s) {
      return '<a href="' + attr(s.url) + '" target="_blank" rel="noopener noreferrer">' + esc(s.name) + '</a>';
    }).join('<span class="gl-dot">·</span>');
    var hay = [e.term, e.ko, cat, e.summary].concat(e.facts ? e.facts.map(function (f) { return f[0] + ' ' + f[1]; }) : [])
      .concat(e.body || []).join(' ').toLowerCase();

    return '<details class="gl-item" id="gl-' + attr(e.id) + '" data-cat="' + attr(e.cat) + '" data-search="' + attr(hay) + '">' +
      '<summary class="gl-sum">' +
        '<span class="gl-cat">' + esc(cat) + '</span>' +
        '<span class="gl-name">' + esc(e.term) + ' <em>' + esc(e.ko) + '</em></span>' +
        '<span class="gl-plus" aria-hidden="true"></span>' +
      '</summary>' +
      '<div class="gl-body">' +
        '<p class="gl-lead">' + esc(e.summary) + '</p>' +
        (facts ? '<dl class="gl-facts">' + facts + '</dl>' : '') +
        (body ? '<div class="gl-text">' + body + '</div>' : '') +
        (e.caution ? '<p class="gl-caution"><b>시점·주의</b> ' + esc(e.caution) + '</p>' : '') +
        (srcs ? '<p class="gl-src"><span>출처</span> ' + srcs + '</p>' : '') +
      '</div>' +
    '</details>';
  }

  function renderGlossary() {
    var g = state.glossary;
    var list = $('#gl-list');
    if (!list) return;
    if (!g || !(g.entries || []).length) {
      list.innerHTML = '<p class="uc-empty">용어 데이터를 불러오지 못했습니다. 잠시 뒤 다시 열어 주세요.</p>';
      return;
    }
    var chips = '<button type="button" class="uc-chip' + (state.glCat === 'all' ? ' is-on' : '') + '" data-gl-cat="all">전체</button>' +
      (g.categories || []).map(function (c) {
        return '<button type="button" class="uc-chip' + (state.glCat === c.id ? ' is-on' : '') + '" data-gl-cat="' + attr(c.id) + '">' + esc(c.label) + '</button>';
      }).join('');
    var fw = $('#gl-filters');
    if (fw) fw.innerHTML = chips;

    list.innerHTML = (g.entries || []).map(function (e) { return glCardHTML(g, e); }).join('');

    var sub = $('#gl-sub');
    if (sub && g.intro) sub.innerHTML = esc(g.intro).replace(/\n/g, '<br>');
    var note = $('#gl-notice');
    if (note && g.notice) note.textContent = g.notice;
    var stamp = $('#gl-stamp');
    if (stamp && g.updatedAt) stamp.textContent = '정리 ' + fmtDate(g.updatedAt);

    bindGlossary();
    applyGlFilter();
    openGlossaryFromHash();
  }

  function applyGlFilter() {
    var list = $('#gl-list');
    if (!list) return;
    var inp = $('#gl-q');
    var q = (inp && inp.value ? inp.value : state.glQ || '').trim().toLowerCase();
    var cards = $$('.gl-item', list);
    var shown = 0;
    cards.forEach(function (card) {
      var cat = card.getAttribute('data-cat');
      var okCat = state.glCat === 'all' || cat === state.glCat;
      var okQ = !q || (card.getAttribute('data-search') || '').indexOf(q) >= 0;
      var ok = okCat && okQ;
      if (ok) shown++;
      if (ok) card.removeAttribute('hidden'); else card.setAttribute('hidden', '');
    });
    var status = $('#gl-status');
    if (status) status.textContent = shown === cards.length ? '전체 ' + cards.length + '개 용어' : shown + '개 표시 / 전체 ' + cards.length + '개 용어';
    var empty = $('#gl-empty');
    if (empty) { if (shown) empty.setAttribute('hidden', ''); else empty.removeAttribute('hidden'); }
    var clear = $('#gl-clear');
    if (clear) { if (inp && inp.value) clear.removeAttribute('hidden'); else clear.setAttribute('hidden', ''); }
  }

  function openGlossaryFromHash() {
    var id = (window.location.hash || '').replace(/^#/, '');
    if (!id || id.indexOf('gl-') !== 0) return;
    var el = document.getElementById(id);
    if (!el) return;
    if (state.glCat !== 'all') { state.glCat = 'all'; $$('[data-gl-cat]').forEach(function (b) { b.classList.toggle('is-on', b.getAttribute('data-gl-cat') === 'all'); }); applyGlFilter(); }
    if (el.tagName === 'DETAILS') el.open = true;
    /* 시황표·차트가 뒤늦게 그려지며 위쪽 높이가 늘어 목표가 밀리므로 몇 번 더 잡아 줍니다. */
    var jump = function () {
      if (document.getElementById(el.id) !== el) return;
      el.scrollIntoView({ block: 'start' });
    };
    jump();
    window.requestAnimationFrame(jump);
    setTimeout(jump, 400);
    setTimeout(jump, 1200);
    window.addEventListener('load', function () { setTimeout(jump, 80); });
  }

  function bindGlossary() {
    if (glBound) return;
    glBound = true;
    var inp = $('#gl-q');
    if (inp) {
      inp.addEventListener('input', function () { state.glQ = inp.value; state.q = ''; applyGlFilter(); });
      inp.addEventListener('keydown', function (ev) { if (ev.key === 'Escape') { inp.value = ''; state.glQ = ''; applyGlFilter(); } });
    }
    var clear = $('#gl-clear');
    if (clear) clear.addEventListener('click', function () { if (inp) { inp.value = ''; inp.focus(); } state.glQ = ''; applyGlFilter(); });
    var fw = $('#gl-filters');
    if (fw) {
      fw.addEventListener('click', function (ev) {
        var el = ev.target;
        while (el && el !== fw && !(el.getAttribute && el.getAttribute('data-gl-cat'))) el = el.parentNode;
        if (!el || el === fw) return;
        var cat = el.getAttribute('data-gl-cat');
        if (!cat) return;
        state.glCat = cat;
        $$('[data-gl-cat]', fw).forEach(function (b) { b.classList.toggle('is-on', b.getAttribute('data-gl-cat') === cat); });
        applyGlFilter();
      });
    }
  }

  function initGlossary() {
    if (!$('#gl-list')) return;
    window.addEventListener('hashchange', function () { openGlossaryFromHash(); });
    fetch(U('data/market-glossary.json'), { cache: 'no-cache' })
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .catch(function () { return window.__FALLBACK_GLOSSARY__ || null; })
      .then(function (g) { state.glossary = g; renderGlossary(); })
      .catch(function () { renderGlossary(); });
  }

  /* ---------------- minimal markdown ---------------- */
  var INLINE_IMG_RE = /!\[([^\]]*)\]\(([^)\s]+)\)/g;
  var SAFE_IMG_RE = /^(https?:\/\/|assets\/|\/assets\/)/i;

  /* assets/ 아래 상대 경로와 https:// 주소만 이미지로 허용합니다. */
  function safeImgSrc(src) {
    var s = String(src == null ? '' : src).trim();
    if (!SAFE_IMG_RE.test(s)) return '';
    if (/[\s"'<>]/.test(s)) return '';
    if (s.charAt(0) !== '/' && !/^https?:/i.test(s)) s = BASE + s;
    return s;
  }

  function figureHTML(alt, src) {
    var s = safeImgSrc(src);
    var cap = String(alt == null ? '' : alt).trim();
    if (!s) return cap ? esc(cap) : '';
    return '<figure class="article-inline-img">' +
      '<img src="' + attr(s) + '" alt="' + attr(cap) + '" width="1600" height="900" loading="lazy" decoding="async">' +
      (cap ? '<figcaption>' + esc(cap) + '</figcaption>' : '') +
      '</figure>';
  }

  function inline(s) {
    var raw = String(s == null ? '' : s);
    var figs = [];
    raw = raw.replace(INLINE_IMG_RE, function (m, alt, src) {
      figs.push(figureHTML(alt, src));
      return '\u0000' + (figs.length - 1) + '\u0000';
    });
    var out = esc(raw);
    out = out.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, function (m, label, url) {
      if (!/^(https?:\/\/|\/|#|mailto:)/.test(url)) return label;
      var ext = /^https?:\/\//.test(url) ? ' target="_blank" rel="noopener noreferrer"' : '';
      return '<a href="' + url + '"' + ext + '>' + label + '</a>';
    });
    out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    out = out.replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, '$1<em>$2</em>');
    if (figs.length) {
      out = out.replace(/\u0000(\d+)\u0000/g, function (m, n) {
        return figs[+n] == null ? '' : figs[+n];
      });
    }
    return out;
  }

  /* 문단 안에 이미지 문법이 섞여 있으면 <p> 안에 <figure> 가 들어가지 않도록
     문단과 그림을 나눠서 내보냅니다. */
  function paragraphHTML(text) {
    var parts = [], last = 0, m;
    INLINE_IMG_RE.lastIndex = 0;
    while ((m = INLINE_IMG_RE.exec(text))) {
      var before = text.slice(last, m.index);
      if (before.trim()) parts.push('<p>' + inline(before) + '</p>');
      var fig = figureHTML(m[1], m[2]);
      if (fig) parts.push(fig);
      last = m.index + m[0].length;
    }
    if (!parts.length) return '<p>' + inline(text) + '</p>';
    var rest = text.slice(last);
    if (rest.trim()) parts.push('<p>' + inline(rest) + '</p>');
    return parts.join('\n');
  }

  function renderBody(md) {
    var lines = String(md || '').replace(/\r/g, '').split('\n');
    var out = [], i = 0, h2n = 0;
    var blockRe = /^(##\s|###\s|>\s?|[-*]\s+|\d+\.\s+)/;
    while (i < lines.length) {
      var line = lines[i];
      if (!line.trim()) { i++; continue; }
      if (/^###\s+/.test(line)) { out.push('<h3>' + inline(line.replace(/^###\s+/, '')) + '</h3>'); i++; continue; }
      if (/^##\s+/.test(line)) {
        h2n++;
        out.push('<h2 id="sec-' + h2n + '">' + inline(line.replace(/^##\s+/, '')) + '</h2>');
        i++; continue;
      }
      if (/^>\s?/.test(line)) {
        var q = [];
        while (i < lines.length && /^>\s?/.test(lines[i])) { q.push(lines[i].replace(/^>\s?/, '')); i++; }
        var cite = '';
        if (q.length && /^—\s?/.test(q[q.length - 1])) cite = q.pop().replace(/^—\s?/, '');
        out.push('<blockquote><p>' + inline(q.join(' ')) + '</p>' + (cite ? '<cite>' + inline(cite) + '</cite>' : '') + '</blockquote>');
        continue;
      }
      if (/^[-*]\s+/.test(line)) {
        var items = [];
        while (i < lines.length && /^[-*]\s+/.test(lines[i])) { items.push(lines[i].replace(/^[-*]\s+/, '')); i++; }
        out.push('<ul>' + items.map(function (t) { return '<li>' + inline(t) + '</li>'; }).join('') + '</ul>');
        continue;
      }
      if (/^\d+\.\s+/.test(line)) {
        var oitems = [];
        while (i < lines.length && /^\d+\.\s+/.test(lines[i])) { oitems.push(lines[i].replace(/^\d+\.\s+/, '')); i++; }
        out.push('<ol>' + oitems.map(function (t) { return '<li>' + inline(t) + '</li>'; }).join('') + '</ol>');
        continue;
      }
      var p = [];
      while (i < lines.length && lines[i].trim() && !blockRe.test(lines[i])) { p.push(lines[i]); i++; }
      out.push(paragraphHTML(p.join(' ')));
    }
    return out.join('\n');
  }

  /* ---------------- shared partials ---------------- */
  var iconSearch = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"></circle><path d="m20 20-3.6-3.6"></path></svg>';
  var iconArrow = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6"></path></svg>';
  var iconCopy = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="1.5"></rect><path d="M15 5H5v10"></path></svg>';
  var iconX = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4l16 16M20 4L4 20"></path></svg>';
  var iconShare = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 16V4M8 8l4-4 4 4M5 14v5h14v-5"></path></svg>';
  var iconUp = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V6M6 12l6-6 6 6"></path></svg>';
  /* LINE·위챗 공유용 아이콘(공유 바) */
  var iconLine = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4.3c-4.3 0-7.8 2.7-7.8 6.1 0 3 2.5 5.5 6 6 .3 0 .6.2.7.5l.2 1.1c0 .2.2.4.4.4l.3-.1 1.7-1.1c.2-.1.4-.2.6-.2h.3c3.9-.2 6.9-2.7 6.9-5.9 0-3.4-3.5-6.1-7.8-6.1z"></path><path d="M8.4 9.1v2.7M10.7 9.1v2.7M13 9.1v2.7M15.3 9.1v2.7"></path></svg>';
  var iconWeChat = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 4.6c-3.5 0-6.4 2.3-6.4 5.3 0 1.7 1 3.1 2.5 4.1l-.6 1.9 2.3-1.1c.7.2 1.4.3 2.2.3"></path><path d="M14.6 9c2.7 0 4.9 1.8 4.9 4 0 1.3-.8 2.4-2 3.2l.5 1.5-1.8-.9c-.5.1-1 .2-1.6.2-2.7 0-4.9-1.8-4.9-4S11.9 9 14.6 9z"></path></svg>';
  /* WhatsApp 공유용 아이콘(공유 바) */
  var iconWhatsApp = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.8 20.2l1.3-3.6A8.1 8.1 0 1 1 8 19.1l-4.2 1.1z"></path><path d="M9.1 8.3c-.3 0-.6.1-.8.4-.3.3-.6.8-.6 1.4 0 .7.4 1.5.9 2.2.6.8 1.3 1.5 2.2 2 .8.4 1.5.6 2 .5.5-.1.9-.4 1.1-.7.2-.3.3-.6.2-.9 0-.1-.1-.2-.2-.2l-1.3-.6c-.1-.1-.3 0-.4.1l-.5.6c-.1.1-.2.2-.4.1-.5-.2-1-.5-1.4-.9-.4-.4-.7-.8-.9-1.3 0-.2 0-.3.1-.4l.5-.5c.1-.1.1-.3.1-.4l-.6-1.3c-.1-.2-.2-.2-.4-.2z"></path></svg>';

  /* 공유 바 문구 — /en/ /zh/ /ja/ 페이지에서는 그 언어로 바로 쓴다(lang 스크립트에 기대지 않음). */
  var SHARE_LABELS = {
    ko: {
      copy: '링크 복사', whatsapp: 'WhatsApp으로 공유', line: 'LINE으로 공유', wechat: '위챗으로 공유', share: '공유하기',
      copyHint: '링크를 복사했습니다. 카카오톡·위챗 대화방에 붙여넣어 보내세요.',
      wechatHint: '링크를 복사했습니다. 위챗은 웹에서 바로 공유가 안 되니, 대화방에 붙여넣어 보내세요.'
    },
    en: {
      copy: 'Copy link', whatsapp: 'Share on WhatsApp', line: 'Share on LINE', wechat: 'Share to WeChat', share: 'Share',
      copyHint: 'Link copied. Paste it into KakaoTalk, WeChat or any chat.',
      wechatHint: 'WeChat cannot share a web page directly — the link is copied, paste it into a WeChat chat.'
    },
    zh: {
      copy: '复制链接', whatsapp: '分享到 WhatsApp', line: '分享到 LINE', wechat: '分享到微信', share: '分享',
      copyHint: '链接已复制，可粘贴到 LINE、QQ 或邮件中发送。',
      wechatHint: '微信不支持网页直接分享：链接已复制，打开微信粘贴到聊天即可。'
    },
    ja: {
      copy: 'リンクをコピー', whatsapp: 'WhatsAppで送る', line: 'LINEで送る', wechat: 'WeChatで送る', share: '共有',
      copyHint: 'リンクをコピーしました。LINE や WeChat のトークに貼り付けて送れます。',
      wechatHint: 'WeChat は Web からの直接共有に対応していません。コピーしたリンクをトークに貼り付けてください。'
    }
  };
  function shareLabel(key) {
    var t = SHARE_LABELS[IBLANG || 'ko'] || SHARE_LABELS.ko;
    return t[key] || SHARE_LABELS.ko[key] || '';
  }
  /* 공유 결과 안내 — 화면 하단에 잠깐 뜨는 알림 */
  function shareToast(msg) {
    if (!msg) return;
    var el = document.getElementById('ib-share-toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'ib-share-toast';
      el.setAttribute('role', 'status');
      el.setAttribute('aria-live', 'polite');
      el.style.cssText = 'position:fixed;left:50%;bottom:26px;transform:translateX(-50%);max-width:min(92vw,430px);' +
        'padding:11px 16px;background:#17140f;color:#f6f2ea;font-size:12.5px;line-height:1.55;text-align:center;' +
        'z-index:9999;box-shadow:0 10px 30px rgba(0,0,0,.3);opacity:0;pointer-events:none;transition:opacity .2s';
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.style.opacity = '1';
    clearTimeout(el._ibTimer);
    el._ibTimer = setTimeout(function () { el.style.opacity = '0'; }, 3200);
  }
  /* 공유 바 본체(4개국어 공통): 복사 · WhatsApp · 위챗 · LINE · X · 기기 공유
     WhatsApp·LINE·X 는 팝업 차단에 걸리지 않도록 실제 링크(<a target="_blank">)로 둡니다.
     위챗은 웹에서 바로 공유가 안 되므로 링크를 복사하고 안내를 띄웁니다. */
  function shareBarHTML(prefix, url, title) {
    var lineHref = 'https://social-plugins.line.me/lineit/share?url=' + encodeURIComponent(url || '') +
      (title ? '&text=' + encodeURIComponent(title) : '');
    var xHref = 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(title || '') +
      '&url=' + encodeURIComponent(url || '');
    var waHref = 'https://wa.me/?text=' + encodeURIComponent((title || '') + ' ' + (url || ''));
    return '' +
      '<button type="button" id="' + prefix + '-copy" aria-label="' + attr(shareLabel('copy')) + '" title="' + attr(shareLabel('copy')) + '">' + iconCopy + '</button>' +
      '<a id="' + prefix + '-wa" href="' + attr(waHref) + '" target="_blank" rel="noopener noreferrer" aria-label="' + attr(shareLabel('whatsapp')) + '" title="' + attr(shareLabel('whatsapp')) + '">' + iconWhatsApp + '</a>' +
      '<button type="button" id="' + prefix + '-wechat" aria-label="' + attr(shareLabel('wechat')) + '" title="' + attr(shareLabel('wechat')) + '">' + iconWeChat + '</button>' +
      '<a id="' + prefix + '-line" href="' + attr(lineHref) + '" target="_blank" rel="noopener noreferrer" aria-label="' + attr(shareLabel('line')) + '" title="' + attr(shareLabel('line')) + '">' + iconLine + '</a>' +
      '<a id="' + prefix + '-x" href="' + attr(xHref) + '" target="_blank" rel="noopener noreferrer" aria-label="X ' + attr(shareLabel('share')) + '" title="X">' + iconX + '</a>' +
      '<button type="button" id="' + prefix + '-native" aria-label="' + attr(shareLabel('share')) + '" title="' + attr(shareLabel('share')) + '" hidden>' + iconShare + '</button>';
  }
  function pageShareUrl() {
    var link = document.querySelector('link[rel="canonical"]');
    var href = link && link.getAttribute('href');
    if (href) return href;
    var base = ((state.site && state.site.baseUrl) || '').replace(/\/+$/, '');
    if (base) return base + (window.location.pathname || '/');
    return window.location.href;
  }
  /* 복사·WhatsApp·위챗·LINE·X 버튼 연결. prefix 는 버튼 id 접두어('share' | 'share-site') */
  function bindShareBar(prefix, url, title) {
    var copy = $('#' + prefix + '-copy');
    var doCopy = function (hint) {
      var done = function () {
        if (copy) {
          copy.innerHTML = '<span style="font-size:10px;font-family:var(--mono)">OK</span>';
          setTimeout(function () { copy.innerHTML = iconCopy; }, 1400);
        }
        shareToast(hint || shareLabel('copyHint'));
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(done).catch(function () { fallbackCopy(url, done); });
      } else fallbackCopy(url, done);
    };
    if (copy) copy.addEventListener('click', function () { doCopy(); });
    var wechat = $('#' + prefix + '-wechat');
    if (wechat) wechat.addEventListener('click', function () { doCopy(shareLabel('wechatHint')); });
    var native = $('#' + prefix + '-native');
    if (native && navigator.share) {
      native.removeAttribute('hidden');
      native.addEventListener('click', function () {
        navigator.share({ title: title || document.title, url: url }).catch(function () {});
      });
    }
  }

  function coverHTML(a, opts) {
    opts = opts || {};
    var c = catOf(a.category);
    var cov = a.cover || {};
    var num = numberFor(a.id);
    var photo = safeImgSrc(a && a.coverImage);
    if (photo) {
      return '' +
        '<div class="cover cover--photo" data-theme="' + attr(a.category) + '">' +
          '<img class="cover-img" src="' + attr(photo) + '" alt="' + attr((a.title || '') + ' 대표 이미지') + '" loading="lazy" decoding="async" width="1600" height="900">' +
        '</div>';
    }
    return '' +
      '<div class="cover" data-theme="' + attr(a.category) + '" role="img" aria-label="' + attr(c.label + ' 표지 이미지') + '">' +
        '<div class="cv-top"><span>' + esc(cov.label || c.en + ' FILE') + '</span><span>' + esc((state.site.brand.name || '')) + '</span></div>' +
        '<span class="cv-tag">' + esc(c.en) + '</span>' +
        '<span class="cv-rule"></span>' +
        '<span class="cv-word">' + esc(cov.word || c.en) + '</span>' +
        '<span class="cv-num">' + esc(num) + '</span>' +
      '</div>';
  }

  function sampleTag(a) {
    return (isDemo() || (a && a.sample)) ? '<span class="sample-tag" title="시연용 샘플 콘텐츠">SAMPLE</span>' : '';
  }

  function cardHTML(a, idx) {
    var c = catOf(a.category);
    return '' +
      '<article class="card reveal" style="--i:' + (idx || 0) + '">' +
        '<a href="' + articleUrl(a) + '" class="card-link" aria-label="' + attr(a.title) + '">' + coverHTML(a) + '</a>' +
        '<div class="kicker">' + esc(c.label) + '</div>' +
        '<h3><a href="' + articleUrl(a) + '">' + esc(a.title) + '</a></h3>' +
        '<p class="deck">' + esc(a.deck) + '</p>' +
        '<div class="meta">' +
          '<span>' + esc(a.author) + '</span><span class="dot"></span>' +
          '<span>' + esc(fmtDate(a.publishedAt)) + '</span><span class="dot"></span>' +
          '<span>' + esc(readingTime(a)) + '</span>' + sampleTag(a) +
        '</div>' +
      '</article>';
  }

  function adHTML(key, extraClass) {
    var ad = (state.site.ads || {})[key];
    if (!ad) return '';
    var as = ad.adsense || {};
    if (as.client && as.slot) {
      return '' +
        '<aside class="ad ad--live ' + (extraClass || '') + '" data-slot="' + attr(ad.slot) + '" aria-label="광고 영역">' +
          '<span class="ad-label">' + esc(ad.label || 'ADVERTISEMENT') + '</span>' +
          '<ins class="adsbygoogle" style="display:block;width:100%" data-ad-client="' + attr(as.client) + '" data-ad-slot="' + attr(as.slot) + '" data-ad-format="auto" data-full-width-responsive="true"></ins>' +
        '</aside>';
    }
    return '' +
      '<aside class="ad ' + (extraClass || '') + '" data-slot="' + attr(ad.slot) + '" aria-label="광고 영역">' +
        '<span class="ad-label">' + esc(ad.label || 'ADVERTISEMENT') + '</span>' +
        '<span class="ad-slot">' + esc(ad.note || '스폰서 배너') + '</span>' +
        '<span class="ad-size">' + esc(ad.size || '') + '</span>' +
        '<a class="ad-cta" href="' + U('ad.html') + '#rates">이 자리에 광고하기</a>' +
      '</aside>';
  }

  /* ---------------- 수익화 전환 블록 ---------------- */
  /* B2B 유료 리포트·소싱/원가 분석 의뢰 배너 (무역·원자재 기사와 시황 페이지) */
  function b2bBannerHTML() {
    return '' +
      '<aside class="mo-banner" aria-label="B2B 소싱·원가 분석 의뢰">' +
        '<div class="mo-b-main">' +
          '<span class="mo-kicker">B2B · 원자재 실무</span>' +
          '<h3>맞춤 원자재 소싱 · 수입 원가 분석 · 주간 PDF 리포트</h3>' +
          '<p>품목·규격·수량을 주시면 공급 후보 3곳과 FOB/CIF 견적을, 원료가 × 원단위로 착지 원가와 손익분기 판가를 계산해 문서로 드립니다. 견적까지 비용은 없습니다.</p>' +
        '</div>' +
        '<div class="mo-b-act">' +
          '<a class="btn btn-accent" href="' + U('ad.html') + '#b2b">의뢰·문의 하기</a>' +
          '<span class="mo-hint">영업일 1~2일 내 회신</span>' +
        '</div>' +
      '</aside>';
  }

  /* 기사·도구 하단의 자연스러운 전환 동선 */
  /* ---- 실시간 브리핑 채널 (카카오톡 오픈채팅 · 텔레그램) ---- */
  var CHANNELS = { kakao: 'https://open.kakao.com/o/prc7jqYi', telegram: 'https://t.me/blockbrief_kr' };
  function ibT(s) {
    var d = window.__I18N__;
    if (d && d.strings && d.strings[s]) return d.strings[s];
    return s;
  }
  function channelBlockHTML(variant) {
    var t = ibT;
    return '<section class="ib-ch' + (variant ? ' ib-ch--' + variant : '') + '" aria-label="' + attr(t('실시간 브리핑 채널')) + '">' +
      '<div class="ib-ch-main">' +
        '<span class="ib-ch-kicker">LIVE BRIEFING</span>' +
        '<h3>' + esc(t('실시간 브리핑 채널')) + '</h3>' +
        '<p>' + esc(t('새 리포트와 시황을 카카오톡 오픈채팅과 텔레그램으로 실시간으로 받아 보세요.')) + '</p>' +
      '</div>' +
      '<div class="ib-ch-act">' +
        '<a class="btn btn-accent" href="' + attr(CHANNELS.kakao) + '" target="_blank" rel="noopener noreferrer">' + esc(t('카카오톡 오픈채팅')) + '</a>' +
        '<a class="btn btn-ghost" href="' + attr(CHANNELS.telegram) + '" target="_blank" rel="noopener noreferrer">' + esc(t('텔레그램 채널')) + '</a>' +
      '</div>' +
    '</section>';
  }

  function funnelHTML(a) {
    var isTrade = a && a.category === 'trade';
    return '' +
      (isTrade ? b2bBannerHTML() : '') +
      '<section class="mo-sec" aria-labelledby="funnel-title">' +
        '<div class="mo-sec-head"><h2 id="funnel-title" style="font-size:17px">이어서 볼 것</h2><span>구독 · 도구 · 제휴</span></div>' +
        '<div class="mo-grid">' +
          '<div class="mo-card">' +
            '<span class="mo-tag">NEWSLETTER</span>' +
            '<h3>금요일 주간 브리핑</h3>' +
            '<p>한 주의 리서치와 숫자를 한 통에. 이메일만 남기면 다음 금요일부터 받습니다.</p>' +
            '<form data-ib-newsletter style="margin-top:auto;padding-top:8px">' +
              '<div style="display:flex;gap:6px">' +
                '<input type="email" name="email" placeholder="이메일 주소" aria-label="구독할 이메일 주소" required style="flex:1;min-width:0;padding:8px 10px;font:inherit;font-size:12.5px;border:1px solid var(--rule-2);background:#ffffff">' +
                '<button class="btn btn-accent btn-sm" type="submit">구독</button>' +
              '</div>' +
              '<p class="mo-msg" data-ib-msg role="status" aria-live="polite" hidden></p>' +
            '</form>' +
          '</div>' +
          '<a class="mo-card" href="' + U('links.html') + '">' +
            '<span class="mo-tag">RECOMMENDED</span>' +
            '<h3>추천 상품·용품</h3>' +
            '<p>원고 쓰는 책상, 여행용 정수 샤워기, 반려견 소모품까지. 쿠팡 파트너스 링크로 수수료를 받습니다.</p>' +
            '<span class="mo-go">추천 목록 보기 →</span>' +
          '</a>' +
          '<a class="mo-card" href="' + U('ad.html') + '#rates">' +
            '<span class="mo-tag">ADVERTISE</span>' +
            '<h3>광고·스폰서 지면</h3>' +
            '<p>사이드 300×250·300×600, 기사 하단 970×90, 뉴스레터 스폰서. 스타터 단가표를 공개합니다.</p>' +
            '<span class="mo-go">단가표 보기 →</span>' +
          '</a>' +
        '</div>' +
        '<p class="mo-disclosure">이 페이지의 쿠팡 링크는 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다. 수수료는 상품 가격에 영향을 주지 않습니다.</p>' +
      '</section>';
  }

  function mountAdsense() {
    var slots = $$('.adsbygoogle');
    if (!slots.length) return;
    var client = '';
    Object.keys(state.site.ads || {}).forEach(function (k) {
      var as = state.site.ads[k].adsense || {};
      if (!client && as.client) client = as.client;
    });
    if (client && !document.querySelector('script[src*="adsbygoogle.js"]')) {
      var s = document.createElement('script');
      s.async = true;
      s.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + encodeURIComponent(client);
      s.crossOrigin = 'anonymous';
      s.setAttribute('data-adsense-loader', '');
      document.head.appendChild(s);
    }
    slots.forEach(function (el) {
      if (el.getAttribute('data-adsbygoogle-status')) return;
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    });
  }

  function rankHTML() {
    var top = state.articles.slice().sort(function (a, b) {
      var d = (Number(b.views) || 0) - (Number(a.views) || 0);
      if (d) return d;
      return new Date(b.publishedAt) - new Date(a.publishedAt);
    }).slice(0, 5);
    return '<ol class="rank">' + top.map(function (a, i) {
      return '<li><a href="' + articleUrl(a) + '">' +
        '<span class="no">' + String(i + 1).padStart(2, '0') + '</span>' +
        '<span><h4>' + esc(a.title) + '</h4><span class="views">' + esc(catOf(a.category).label) + ' · ' + esc(LBL.views(num(a.views))) + '</span></span>' +
        '</a></li>';
    }).join('') + '</ol>';
  }

  function newsletterHTML() {
    var n = state.site.newsletter;
    if (!n) return '';
    return '' +
      '<section class="newsletter" id="subscribe">' +
        '<span class="mono">NEWSLETTER</span>' +
        '<h3>' + esc(n.title) + '</h3>' +
        '<p>' + esc(n.desc) + '</p>' +
        '<form data-ib-newsletter>' +
          '<input type="email" name="email" placeholder="이메일 주소" aria-label="구독할 이메일 주소" required>' +
          '<button type="submit">' + esc(n.cta || '구독') + '</button>' +
        '</form>' +
        '<p class="mo-msg" data-ib-msg role="status" aria-live="polite" hidden style="margin-top:9px;font-size:11px"></p>' +
        '<small>' + esc(n.note || '이메일 주소는 브리핑 발송에만 씁니다. 언제든 해지할 수 있습니다.') + '</small>' +
      '</section>';
  }

  function bindNewsletter() {
    /* Supabase 접수(monetize.js)가 로드돼 있으면 그쪽이 저장을 맡는다. */
    if (window.IBApi) return;
    $$('form[data-newsletter]').forEach(function (f) {
      f.addEventListener('submit', function (e) {
        e.preventDefault();
        var email = (f.querySelector('input[type="email"]').value || '').trim();
        if (!email) return;
        var n = state.site.newsletter || {};
        var to = n.email || state.site.brand.email;
        var subject = '[' + state.site.brand.name + '] 주간 브리핑 구독 신청';
        var body = '구독 신청 이메일: ' + email + '\n\n위 주소로 주간 브리핑을 받고 싶습니다.';
        window.location.href = 'mailto:' + to + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
      });
    });
  }

  /* ---------------- chrome ---------------- */
  function renderChrome() {
    var b = state.site.brand;

    $$('[data-site]').forEach(function (el) {
      var v = getPath(state.site, el.getAttribute('data-site'));
      if (v != null) el.textContent = v;
    });

    var nameEl = $('[data-brand-name]');
    if (nameEl) {
      var parts = String(b.name || '').trim().split(/\s+/);
      nameEl.innerHTML = parts.length > 1
        ? esc(parts.slice(0, -1).join(' ')) + ' <em>' + esc(parts[parts.length - 1]) + '</em>'
        : esc(b.name);
    }

    var dateEl = $('#today-date');
    if (dateEl) {
      try {
        dateEl.textContent = new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' }).format(new Date());
      } catch (e) { dateEl.textContent = ''; }
    }

    /* 상단 내비는 5개 대표 메뉴로 각 페이지 HTML 에 정적으로 들어 있습니다
       (정의: tools/nav_spec.py · 동작: assets/js/nav.js). 여기서는 현재 페이지
       표시(.is-active)만 다시 맞춥니다. 카테고리·언어가 바뀌어도 마크업은 그대로입니다. */
    var nav = $('#site-nav');
    if (nav && window.IBNav && window.IBNav.sync) window.IBNav.sync();

    $$('form[data-search]').forEach(function (f) {
      f.addEventListener('submit', function (e) {
        e.preventDefault();
        var v = (f.querySelector('input').value || '').trim();
        var params = new URLSearchParams();
        if (state.cat !== 'all' && state.page === 'home') params.set('cat', state.cat);
        if (v) params.set('q', v);
        window.location.href = U('index.html') + (params.toString() ? '?' + params.toString() : '');
      });
      var input = f.querySelector('input');
      if (input) input.value = state.q || '';
    });

    var toggle = $('.search-toggle');
    var mobileSearch = $('#search-mobile');
    if (toggle && mobileSearch) {
      toggle.addEventListener('click', function () {
        var open = mobileSearch.hasAttribute('hidden') === false;
        if (open) { mobileSearch.setAttribute('hidden', ''); }
        else {
          mobileSearch.removeAttribute('hidden');
          var inp = mobileSearch.querySelector('input');
          if (inp) inp.focus();
        }
        toggle.setAttribute('aria-expanded', String(!open));
      });
    }

    renderTicker();
    renderFooter();
  }

  function renderTicker() {
    var el = $('#ticker-track');
    if (!el) return;
    var items = state.site.ticker || [];
    function group() {
      return '<div class="ticker-group">' + items.map(function (t) {
        var a = articleById(t.articleId);
        var text = esc(t.text);
        return a
          ? '<a class="ticker-item" href="' + articleUrl(a) + '">' + text + '</a>'
          : '<span class="ticker-item">' + text + '</span>';
      }).join('') + '</div>';
    }
    el.innerHTML = group() + group();
    var dup = el.lastElementChild;
    if (dup) dup.setAttribute('aria-hidden', 'true');
  }

  function renderFooter() {
    var el = $('#site-footer');
    if (!el) return;
    var b = state.site.brand, f = state.site.footer || {};
    var cats = (state.site.categories || []).map(function (c) {
      var li = '<li><a href="' + U('index.html?cat=' + encodeURIComponent(c.id)) + '">' + esc(c.label) + '</a></li>';
      if (c.id === 'trade') li += '<li><a href="' + U('market.html') + '">원자재 시황</a></li>';
      return li;
    }).join('');
    el.innerHTML = '' +
      '<div class="container">' +
        '<div class="f-top">' +
          '<div class="f-brand">' +
            '<div class="mark-line"><i></i><span>' + esc(b.tagline || '') + '</span></div>' +
            '<div class="name">' + esc(b.name) + '</div>' +
            '<p>' + esc(f.about || b.description || '') + '</p>' +
            (isDemo() ? '<span class="demo-flag">DEMO BUILD · 샘플 콘텐츠</span>' : '') +
          '</div>' +
          '<div class="f-col"><h4>섹션</h4><ul>' + cats + '</ul></div>' +
          '<div class="f-col"><h4>매체</h4><ul>' +
            '<li><a href="' + U('about.html') + '">소개·편집 원칙</a></li>' +
            '<li><a href="' + U('contact.html#tip') + '">독자 제보</a></li>' +
            '<li><a href="' + U('ad.html') + '">광고·스폰서 단가표</a></li>' +
            '<li><a href="' + U('ad.html') + '#b2b">B2B 소싱·원가 의뢰</a></li>' +
            '<li><a href="' + U('links.html') + '">추천 상품·용품 (쿠팡 파트너스)</a></li>' +
            '<li><a href="' + U('lotto.html') + '">무료 도구 · 로또 번호 생성기</a></li>' +
            '<li><a href="' + U('saju.html') + '">무료 도구 · 만세력·2027 신년운세</a></li>' +
            '<li><a href="' + U('salary.html') + '">무료 도구 · 급여·노무 계산기</a></li>' +
            '<li><a href="' + U('biz.html') + '">무료 도구 · 1인 사업자 툴 5종</a></li>' +
            '<li><a href="' + U('seller.html') + '">무료 도구 · 셀러·마케터 툴 4종</a></li>' +
            '<li><a href="' + U('feed.xml') + '">' + T('RSS 피드') + '</a></li>' +
            '<li><a href="' + U('sitemap.html') + '">' + T('사이트맵') + '</a></li>' +
            '<li><a href="' + U('sitemap.xml') + '">sitemap.xml</a></li>' +
          '</ul></div>' +
          '<div class="f-col mail-col"><h4>문의</h4><ul>' +
            '<li><a class="mail" href="mailto:' + attr(b.email) + '">' + esc(b.email) + '</a></li>' +
            '<li><a class="mail" href="mailto:' + attr(b.tipEmail) + '">제보 ' + esc(b.tipEmail) + '</a></li>' +
            '<li><a class="mail" href="mailto:' + attr(b.adEmail) + '">광고 ' + esc(b.adEmail) + '</a></li>' +
            '<li><span style="font-size:11px;opacity:.55">' + esc(b.location || '') + ' · ' + esc(b.issue || '') + '</span></li>' +
          '</ul></div>' +
        '</div>' +
        channelBlockHTML('footer') +
        '<div class="f-share" style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin:16px 0 0">' +
          '<span style="font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--ink-3)">' + esc(shareLabel('share')) + '</span>' +
          '<span class="share" data-share-bar style="margin-left:0">' + shareBarHTML('share-site', pageShareUrl(), document.title) + '</span>' +
        '</div>' +
        '<div class="f-note">' +
          '<p>' + esc(f.notice || '') + '</p>' +
          '<div class="copy"><span>' + esc(f.copyright || '') + '</span><span>' + esc(b.name) + ' · ' + esc(b.tagline || '') + '</span></div>' +
        '</div>' +
      '</div>';
    bindShareBar('share-site', pageShareUrl(), document.title);
  }

  function initToTop() {
    var btn = document.createElement('button');
    btn.className = 'to-top';
    btn.setAttribute('aria-label', '맨 위로');
    btn.innerHTML = iconUp;
    document.body.appendChild(btn);
    btn.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
    window.addEventListener('scroll', function () {
      btn.classList.toggle('is-on', window.scrollY > 700);
    }, { passive: true });
  }

  /* ---------------- home ---------------- */
  function renderHome() {
    var featured = state.articles.filter(function (a) { return a.featured; })[0] || sorted()[0];
    var list = sorted();
    var q = state.q.trim().toLowerCase();
    var filtered = state.cat !== 'all' || q;

    var hero = $('#hero');
    if (hero) {
      if (filtered || !featured) {
        hero.setAttribute('hidden', '');
      } else {
        hero.removeAttribute('hidden');
        var c = catOf(featured.category);
        hero.innerHTML = '' +
          '<div class="hero-cover"><a href="' + articleUrl(featured) + '">' + coverHTML(featured) + '</a></div>' +
          '<div class="hero-body">' +
            '<span class="kicker">TOP STORY · ' + esc(c.label) + '</span>' +
            '<h1 class="hero-title"><a href="' + articleUrl(featured) + '">' + esc(featured.title) + '</a></h1>' +
            '<p class="hero-deck">' + esc(featured.deck) + '</p>' +
            '<div class="hero-meta">' +
              '<div class="meta"><span class="who" style="color:var(--ink-2);font-weight:600">' + esc(featured.author) + '</span><span class="dot"></span>' +
                '<span>' + esc(fmtDate(featured.publishedAt)) + '</span><span class="dot"></span><span>' + esc(readingTime(featured)) + '</span>' + sampleTag(featured) + '</div>' +
              '<a class="read-link" href="' + articleUrl(featured) + '">리포트 읽기 <span>→</span></a>' +
            '</div>' +
          '</div>' +
          '<div class="hero-aside">' + (state.site.categories || []).map(function (cat) {
            var count = state.articles.filter(function (a) { return a.category === cat.id; }).length;
            return '<a class="brief" href="' + U('index.html?cat=' + encodeURIComponent(cat.id)) + '">' +
              '<h4>' + esc(cat.label) + ' <span style="color:var(--muted);font-weight:600">' + count + '</span></h4>' +
              '<p>' + esc(cat.desc || '') + '</p></a>';
          }).join('') + '</div>';
      }
    }

    if (filtered) list = list.filter(function (a) {
      if (state.cat !== 'all' && a.category !== state.cat) return false;
      if (!q) return true;
      var hay = [a.title, a.deck, (a.tags || []).join(' '), a.author, a.body].join(' ').toLowerCase();
      return hay.indexOf(q) !== -1;
    });
    else list = list.filter(function (a) { return !featured || a.id !== featured.id; });

    document.body.classList.toggle('is-filtered', filtered);

    var head = $('#latest-head');
    if (head) {
      if (q) {
        head.innerHTML = '<h2>“' + esc(state.q) + '” 검색 결과</h2><div class="sh-right"><b>' + list.length + '</b>건 <a class="all-link" href="' + U('index.html') + '">전체 보기</a></div>';
      } else if (state.cat !== 'all') {
        var cc = catOf(state.cat);
        head.innerHTML = '<h2>' + esc(cc.label) + '</h2><div class="sh-right">' + esc(cc.desc || '') + ' · <b>' + list.length + '</b>건' +
          (state.cat === 'trade' ? ' <a class="all-link" href="' + U('market.html') + '">원자재 시황표 →</a>' : '') +
          ' <a class="all-link" href="' + U('index.html') + '">전체 보기</a></div>';
        /* 기사 탭 위에 시황표 안내 한 줄 — 큰 시황판은 '원자재 시황' 탭으로 옮겼습니다. */
        if (state.cat === 'trade' && !q) {
          var noteEl = document.getElementById('cat-market-note');
          if (noteEl) {
            noteEl.hidden = false;
            noteEl.innerHTML = '<span>유가·환율·원자재·해상운임 시황표(일간·주간·월간·연간)는 <a href="' + U('market.html') + '">원자재 시황</a> 탭에서 한눈에 봅니다.</span>';
          }
        } else {
          var noteEl2 = document.getElementById('cat-market-note');
          if (noteEl2) noteEl2.hidden = true;
        }
      } else {
        head.innerHTML = '<h2>최신 리포트</h2><div class="sh-right">전체 <b>' + state.articles.length + '</b>편 · 최신순</div>';
      }
      if (q) {
        var hideNote = document.getElementById('cat-market-note');
        if (hideNote) hideNote.hidden = true;
      }
    }

    var grid = $('#latest-grid');
    if (grid) {
      grid.innerHTML = list.length
        ? list.map(cardHTML).join('')
        : '<div class="empty" style="grid-column:1/-1"><h3>해당하는 리포트가 없습니다</h3><p>다른 검색어를 입력하거나 <a href="' + U('index.html') + '" style="color:var(--accent)">전체 리포트</a>를 둘러보세요.</p></div>';
    }

    var note = $('#editor-note');
    if (note) {
      var en = state.site.editorNote;
      note.innerHTML = (!filtered && en) ? '' +
        '<section class="editor-note">' +
          '<div class="en-mark">NOTE</div>' +
          '<div><span class="en-label">' + esc(en.label || "EDITOR'S NOTE") + '</span>' +
          '<h3>' + esc(en.title) + '</h3><p>' + esc(en.text) + '</p>' +
          '<a class="en-link" href="' + attr(U(en.linkUrl || 'about.html')) + '">' + esc(en.linkText || '더 보기') + ' →</a></div>' +
        '</section>' : '';
    }

    var rank = $('#rank-list');
    /* 다국어 페이지는 articles.json 의 한국어 조회수가 잠깐이라도 보이지 않게 0에서 시작합니다. */
    if (rank && IBLANG) state.articles.forEach(function (a) { a.views = 0; });
    if (rank) rank.innerHTML = rankHTML();
    loadViewCounts();

    var sideA = $('#ad-side-a'); if (sideA) sideA.innerHTML = adHTML('sideA');
    var sideB = $('#ad-side-b'); if (sideB) sideB.innerHTML = adHTML('sideB', 'ad--tall');
    var news = $('#newsletter-slot'); if (news) news.innerHTML = newsletterHTML();

    var cta = $('#cta-band');
    if (cta) cta.innerHTML = '' +
      '<div class="container">' +
        '<div><h2>' + esc(state.site.brand.slogan || '') + '</h2>' +
        '<p>' + esc(state.site.brand.description || '') + '</p></div>' +
        '<div class="actions"><a class="btn btn-accent" href="' + U('contact.html#tip') + '">제보 보내기</a><a class="btn" href="' + U('ad.html') + '">광고·스폰서 안내</a></div>' +
      '</div>';

    if (q) document.title = '검색: ' + state.q + ' — ' + state.site.brand.name;
    else if (state.cat !== 'all') document.title = catOf(state.cat).label + ' — ' + state.site.brand.name;
    else document.title = state.site.brand.name + ' — ' + state.site.brand.tagline;
    bindNewsletter();
    mountAdsense();
  }

  /* ---------------- article ---------------- */

  /* 기사 주제(카테고리)에 맞춰 함께 보여 줄 무료 툴 — 4개국어 이름·설명을 직접 답습니다.
     기사하단 '연관 글 + 무료 툴' 카드에서 쓰입니다. */
  var TOOL_CATALOG = {
    tax: {
      page: 'tax.html', mark: 'TAX',
      name: { ko: '세무·결산', en: 'Tax & Year-End', zh: '税务·年终结算', ja: '税務・決算' },
      desc: {
        ko: '부가세·종합소득세·4대보험을 한 화면에서 점검',
        en: 'VAT, income tax and payroll taxes in one checklist',
        zh: '增值税、所得税与社保一页自查',
        ja: '消費税・所得税・社会保険を1ページで確認'
      }
    },
    salary: {
      page: 'salary.html', mark: 'PAY',
      name: { ko: '급여·최저임금', en: 'Pay & Minimum Wage', zh: '工资与最低工资', ja: '給与・最低賃金' },
      desc: {
        ko: '실수령액·주휴수당·퇴직금을 바로 계산',
        en: 'Take-home pay, weekly holiday pay and severance',
        zh: '实发工资、周休津贴、退职金即时计算',
        ja: '手取り・週休手当・退職金をすぐ計算'
      }
    },
    market: {
      page: 'market.html', mark: 'MKT',
      name: { ko: '원자재 시황판', en: 'Commodity Board', zh: '大宗商品行情', ja: '商品市況ボード' },
      desc: {
        ko: '유가·환율·비철·석유화학 시세를 한 표에',
        en: 'Oil, FX, metals and petrochemicals in one table',
        zh: '油价、汇率、有色金属、石化价格一表掌握',
        ja: '原油・為替・非鉄・石油化学を1つの表で'
      }
    },
    forms: {
      page: 'forms.html', mark: 'DOC',
      name: { ko: '무료 서식 138종', en: '138 Free Forms', zh: '138 种免费表单', ja: '無料書式138種' },
      desc: {
        ko: '근로계약서·B/L·세금계산서를 쓰고 서명해 PDF로',
        en: 'Contracts, B/L and invoices — fill, sign, export PDF',
        zh: '合同、提单、发票填写后签名导出 PDF',
        ja: '契約書・B/L・請求書を作成し署名してPDF保存'
      }
    },
    law: {
      page: 'law.html', mark: 'LAW',
      name: { ko: '법률·판례 리포트', en: 'Law & Case Report', zh: '法律与判例报告', ja: '法律・判例レポート' },
      desc: {
        ko: '물품대금·임금체불·보증금 분쟁을 4단으로 정리',
        en: 'Unpaid invoices, wages and deposits in four steps',
        zh: '货款、欠薪、押金纠纷的四段式梳理',
        ja: '代金・賃金・保証金トラブルを4段で整理'
      }
    },
    biz: {
      page: 'biz.html', mark: 'BIZ',
      name: { ko: '사업자 툴', en: 'Business Tools', zh: '经营者工具', ja: '事業者ツール' },
      desc: {
        ko: '마진·수수료·수입원가·부가세를 계산',
        en: 'Margins, fees, landed cost and VAT calculators',
        zh: '利润率、手续费、进口成本、增值税计算',
        ja: '粗利・手数料・輸入原価・消費税を計算'
      }
    },
    seller: {
      page: 'seller.html', mark: 'SELL',
      name: { ko: '셀러 툴', en: 'Seller Tools', zh: '卖家工具', ja: 'セラーツール' },
      desc: {
        ko: '상품 이미지·상세페이지·해시태그를 만듭니다',
        en: 'Product images, detail pages and hashtags',
        zh: '商品图、详情页与话题标签制作',
        ja: '商品画像・詳細ページ・ハッシュタグ作成'
      }
    }
  };

  /* 카테고리 → 함께 보여 줄 툴 2개 (없는 카테고리는 기본값) */
  var CAT_TOOLS = {
    investigative: ['law', 'forms'],
    economy: ['tax', 'salary'],
    trade: ['market', 'forms'],
    ai: ['biz', 'seller'],
    fire: ['forms', 'law']
  };
  var CAT_TOOLS_DEFAULT = ['market', 'tax'];

  function toolsFor(category) {
    var keys = CAT_TOOLS[category] || CAT_TOOLS_DEFAULT;
    return keys.map(function (k) { return TOOL_CATALOG[k]; }).filter(Boolean).slice(0, 2);
  }

  function toolCardHTML(tool) {
    var lang = IBLANG || 'ko';
    var name = tool.name[lang] || tool.name.ko;
    var desc = tool.desc[lang] || tool.desc.ko;
    return '' +
      '<a class="tool-card" href="' + attr(U(tool.page)) + '" aria-label="' + attr(name + ' — ' + LBL.toolAria) + '">' +
        '<span class="tool-mark" aria-hidden="true">' + esc(tool.mark) + '</span>' +
        '<span class="tool-body">' +
          '<h4>' + esc(name) + '</h4>' +
          '<p>' + esc(desc) + '</p>' +
          '<span class="tool-cta">' + esc(LBL.open) + ' →</span>' +
        '</span>' +
      '</a>';
  }

  function toolsBlockHTML(category) {
    var tools = toolsFor(category);
    if (!tools.length) return '';
    return '' +
      '<div class="tool-strip">' +
        '<div class="tool-strip-head"><h3>' + esc(LBL.tools) + '</h3><p>' + esc(LBL.toolsSub) + '</p></div>' +
        '<div class="tool-grid">' + tools.map(toolCardHTML).join('') + '</div>' +
      '</div>';
  }

  function renderArticle() {
    var id = currentArticleId();
    var a = id ? articleById(id) : null;
    var root = $('#article-root');
    if (!root) return;

    if (!a) {
      renderMissing(root);
      return;
    }

    var c = catOf(a.category);
    var related = state.articles.filter(function (x) { return x.id !== a.id && x.category === a.category; });
    if (related.length < 3) {
      state.articles.forEach(function (x) {
        if (x.id !== a.id && related.indexOf(x) === -1 && related.length < 3) related.push(x);
      });
    }
    related = related.slice(0, 3);

    root.innerHTML = '' +
      '<div class="progress" id="progress"></div>' +
      '<header class="article-head"><div class="container"><div class="inner">' +
        '<span class="kicker">' + esc(c.label) + ' · ' + esc(c.en) + '</span>' +
        '<h1 class="article-title">' + esc(a.title) + '</h1>' +
        '<p class="article-deck">' + esc(a.deck) + '</p>' +
        '<div class="article-byline">' +
          '<span class="who">' + esc(a.author) + '</span><span class="sep"></span>' +
          '<span>' + esc(a.authorRole || '') + '</span><span class="sep"></span>' +
          '<span>' + esc(fmtDateTime(a.publishedAt)) + '</span><span class="sep"></span>' +
          '<span>' + esc(readingTime(a)) + '</span>' + sampleTag(a) +
          '<span class="sep"></span><span class="av-views" id="article-views" hidden></span>' +
          '<span class="share" data-share-bar>' + shareBarHTML('share', articleShareUrl(a), a && a.title) + '</span>' +
        '</div>' +
      '</div></div></header>' +
      '<figure class="article-cover">' + coverHTML(a) +
        '<figcaption class="caption"><span>' + esc((a.cover && a.cover.label) || c.en) + ' — ' + esc(c.label) + ' 리포트</span><span>' + (safeImgSrc(a.coverImage) ? '이미지 · AI 일러스트레이션' : '일러스트레이션 · ' + esc(state.site.brand.name)) + '</span></figcaption>' +
      '</figure>' +
      '<div class="article-layout">' +
        '<div class="article-main">' +
          '<div class="summary"><h2>핵심 요약</h2><ol>' + (a.summary || []).map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ol></div>' +
          '<div class="article-body" id="article-body">' + renderBody(a.body) + '</div>' +
          (a.factCheck ? '' +
            '<section class="factcheck"><div class="fc-head"><span class="badge">FACT</span><h2>' + esc(a.factCheck.title || '팩트체크 & 출처') + '</h2></div>' +
              (a.factCheck.note ? '<p class="fc-note">' + esc(a.factCheck.note) + '</p>' : '') +
              '<ul>' + (a.factCheck.sources || []).map(function (s) {
                return '<li><span>' + esc(s.name) + '</span><span>' + esc(s.note || '') + '</span></li>';
              }).join('') + '</ul>' +
            '</section>' : '') +
          (a.tags && a.tags.length ? '<div class="tags">' + a.tags.map(function (t) {
            return '<a href="' + U('index.html?q=' + encodeURIComponent(t)) + '">#' + esc(t) + '</a>';
          }).join('') + '</div>' : '') +
          '<div class="article-foot">' +
            '<div class="author-box"><div class="avatar">' + esc(String(a.author || 'I').slice(0, 1)) + '</div>' +
              '<div><div class="ab-name">' + esc(a.author) + '</div><div class="ab-role">' + esc(a.authorRole || '') + '</div>' +
              '<p>' + esc(a.disclaimer || '') + '</p></div></div>' +
            '<div class="tip-box"><p><b>이어지는 단서가 있나요?</b> 기사에 대한 정정 요청이나 추가 제보를 보내 주세요. 제보자의 신원은 공개하지 않습니다.</p>' +
              '<a class="btn btn-sm btn-ghost" href="' + U('contact.html#tip') + '">제보하기</a></div>' +
          '</div>' +
          channelBlockHTML('article') +
          funnelHTML(a) +
          '<section class="comments" id="comments" aria-label="기사 댓글" hidden></section>' +
        '</div>' +
        '<aside class="article-side">' +
          '<nav class="toc" id="toc" aria-label="기사 목차"></nav>' +
          adHTML('sideA') +
        '</aside>' +
      '</div>' +
      '<div class="container" style="max-width:1120px;padding-top:36px">' + adHTML('articleBottom') + '</div>' +
      '<section class="related container" style="max-width:1120px;padding-top:36px;padding-bottom:10px">' +
        '<div class="section-head"><h2>' + esc(LBL.related) + '</h2><div class="sh-right">' + esc(c.label) + '</div></div>' +
        '<div class="grid grid-3">' + related.map(cardHTML).join('') + '</div>' +
        toolsBlockHTML(a.category) +
      '</section>';

    document.title = a.title + ' — ' + state.site.brand.name;
    setMeta('description', a.deck);
    setMeta('og:title', a.title, true);
    setMeta('og:description', a.deck, true);
    setCanonical(a);

    buildTOC();
    bindShare(a);
    bindProgress();
    bindArticleSidebar();
    injectJsonLd(a);
    bindNewsletter();
    mountAdsense();
    initComments(a.id);
    recordView(a);
  }

  function renderMissing(root) {
    var latest = sorted().slice(0, 3);
    root.innerHTML = '<div class="container" style="padding:80px 0 40px;text-align:center;max-width:760px">' +
      '<span class="kicker" style="justify-content:center">NOT FOUND</span>' +
      '<h1 style="font-family:var(--serif);font-size:clamp(28px,4vw,40px);margin:16px 0 10px;letter-spacing:-.03em">' + esc(LBL.notFoundTitle) + '</h1>' +
      '<p style="color:var(--ink-3);font-size:14px">' + esc(LBL.notFoundBody) + '</p>' +
      '<div style="margin-top:20px"><a class="btn" href="' + U('index.html') + '">' + esc(LBL.notFoundCta) + '</a></div>' +
      '</div>' +
      '<section class="container" style="max-width:1120px;padding-bottom:60px"><div class="section-head"><h2>' + esc(LBL.latest) + '</h2></div>' +
      '<div class="grid grid-3">' + latest.map(cardHTML).join('') + '</div></section>';
    document.title = LBL.notFoundTitle + ' — ' + state.site.brand.name;
  }

  function buildTOC() {
    var toc = $('#toc');
    var body = $('#article-body');
    if (!toc || !body) return;
    var hs = $$('h2', body);
    if (hs.length < 2) { toc.setAttribute('hidden', ''); return; }
    toc.innerHTML = '<h3>CONTENTS</h3><ol>' + hs.map(function (h, i) {
      return '<li><a href="#' + h.id + '">' + esc(h.textContent) + '</a></li>';
    }).join('') + '</ol>';

    if ('IntersectionObserver' in window) {
      var links = $$('a', toc);
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            links.forEach(function (l) { l.classList.toggle('is-active', l.getAttribute('href') === '#' + en.target.id); });
          }
        });
      }, { rootMargin: '-90px 0px -70% 0px' });
      hs.forEach(function (h) { io.observe(h); });
    }

    $$('a', toc).forEach(function (l) {
      l.addEventListener('click', function (e) {
        e.preventDefault();
        var t = document.getElementById(l.getAttribute('href').slice(1));
        if (t) window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - 76, behavior: 'smooth' });
      });
    });
  }

  function bindShare(a) {
    bindShareBar('share', articleShareUrl(a), a && a.title);
  }

  function fallbackCopy(text, done) {
    var ta = document.createElement('textarea');
    ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); done(); } catch (e) {}
    document.body.removeChild(ta);
  }

  function bindProgress() {
    var bar = $('#progress');
    if (!bar) return;
    var onScroll = function () {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      var p = h > 0 ? Math.min(1, window.scrollY / h) : 0;
      bar.style.width = (p * 100) + '%';
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  function bindArticleSidebar() { /* reserved for sticky behavior */ }

  /* 예전 article.html?id= 주소로 들어와도 공유·검색에는 /a/{id}.html 정식 주소를 씁니다. */
  function setCanonical(a) {
    var url = articleShareUrl(a);
    if (!/^https?:/i.test(url)) return;
    var el = document.head.querySelector('link[rel="canonical"]');
    if (!el) {
      el = document.createElement('link');
      el.setAttribute('rel', 'canonical');
      document.head.appendChild(el);
    }
    el.setAttribute('href', url);
    setMeta('og:url', url, true);
  }

  function setMeta(name, content, isProperty) {
    if (!content) return;
    var sel = isProperty ? 'meta[property="' + name + '"]' : 'meta[name="' + name + '"]';
    var el = document.head.querySelector(sel);
    if (!el) {
      el = document.createElement('meta');
      if (isProperty) el.setAttribute('property', name); else el.setAttribute('name', name);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  }

  function injectJsonLd(a) {
    var ld = {
      '@context': 'https://schema.org',
      '@type': 'NewsArticle',
      headline: a.title,
      description: a.deck,
      datePublished: a.publishedAt,
      dateModified: a.updatedAt || a.publishedAt,
      articleSection: catOf(a.category).label,
      keywords: (a.tags || []).join(', '),
      author: { '@type': 'Person', name: a.author },
      publisher: { '@type': 'Organization', name: state.site.brand.name },
      inLanguage: (document.documentElement.getAttribute('lang') || 'ko-KR')
    };
    var s = document.createElement('script');
    s.type = 'application/ld+json';
    s.textContent = JSON.stringify(ld);
    document.head.appendChild(s);
  }

  /* ---------------- contact ---------------- */
  function renderContact() {
    var form = $('#contact-form');
    if (!form) return;
    var b = state.site.brand;
    var type = form.querySelector('[name="type"]');
    var status = $('#form-status');

    var emails = { tip: b.tipEmail, ad: b.adEmail, fix: b.tipEmail, general: b.email };
    if (type) {
      type.addEventListener('change', function () {
        var hint = $('#email-target');
        if (hint) hint.textContent = emails[type.value] || b.email;
      });
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var fd = new FormData(form);
      var t = fd.get('type') || 'tip';
      var name = (fd.get('name') || '').toString().trim();
      var contact = (fd.get('contact') || '').toString().trim();
      var subject = (fd.get('subject') || '').toString().trim();
      var message = (fd.get('message') || '').toString().trim();
      var consent = fd.get('consent');

      if (!subject || !message) { showStatus('제목과 내용을 입력해 주세요.'); return; }
      if (!consent && (name || contact)) { showStatus('연락처를 남기셨다면 개인정보 수집·이용에 동의해 주세요. 익명으로 보내려면 이름·연락처를 비워 두세요.'); return; }

      var labels = { tip: '제보', ad: '광고·협찬 문의', fix: '정정·반론 요청', general: '일반 문의' };
      var to = emails[t] || b.email;
      var body = [
        '문의 유형: ' + (labels[t] || t),
        '이름: ' + (name || '(익명)'),
        '연락처: ' + (contact || '(미기재)'),
        '',
        message,
        '',
        '---',
        '보낸 페이지: ' + window.location.href,
        '보낸 시각: ' + new Date().toLocaleString('ko-KR')
      ].join('\n');

      var endpoint = (state.site.forms && state.site.forms.endpoint) || '';
      if (endpoint) {
        showStatus('전송 중입니다…');
        fetch(endpoint, {
          method: 'POST',
          headers: { 'Accept': 'application/json' },
          body: fd
        }).then(function (r) {
          if (r.ok) { form.reset(); showStatus('접수되었습니다. 확인 후 회신드리겠습니다.'); }
          else throw new Error('fail');
        }).catch(function () {
          showStatus('전송에 실패했습니다. ' + to + ' 로 직접 보내 주세요.');
        });
        return;
      }

      var mailto = 'mailto:' + to +
        '?subject=' + encodeURIComponent('[' + (labels[t] || t) + '] ' + subject) +
        '&body=' + encodeURIComponent(body);
      showStatus('메일 앱이 열립니다. 내용을 확인하고 전송해 주세요. (받는 사람: ' + to + ')');
      window.location.href = mailto;
    });

    function showStatus(msg) {
      if (!status) return;
      status.textContent = msg;
      status.classList.add('is-on');
    }

    var target = $('#email-target');
    if (target) target.textContent = b.tipEmail;
    document.title = '제보 · 광고·협찬 문의 — ' + b.name;
  }

  /* ---------------- about ---------------- */
  function renderAbout() {
    var b = state.site.brand;
    $$('[data-site]').forEach(function (el) {
      var v = getPath(state.site, el.getAttribute('data-site'));
      if (v != null) el.textContent = v;
    });
    document.title = '소개 · 편집 원칙 — ' + b.name;
    var host = $('#about-contact');
    if (host) host.innerHTML = '<dt>편집실</dt><dd><a href="mailto:' + attr(b.email) + '">' + esc(b.email) + '</a></dd>' +
      '<dt>제보</dt><dd><a href="mailto:' + attr(b.tipEmail) + '">' + esc(b.tipEmail) + '</a></dd>' +
      '<dt>광고·협찬</dt><dd><a href="mailto:' + attr(b.adEmail) + '">' + esc(b.adEmail) + '</a></dd>';
  }

  /* ---------------- comments (Supabase) ---------------- */
  /* 댓글 백엔드: Supabase 무료 프로젝트(Seoul). 아래 키는 공개용 publishable 키이며,
     실제 접근 제어는 서버의 RPC(list_comments / add_comment / delete_comment)와 RLS가 담당한다.
     비밀번호 해시와 실제 이메일은 브라우저로 내려가지 않는다. */
  var COMMENTS = {
    url: 'https://gsyqduysdzoifvyovfsc.supabase.co',
    key: 'sb_publishable_3AGJcDCF27lkTlaKYrIgKg_9kRPJZZ3',
    minLen: 5,
    maxLen: 1000
  };

  var CM_MESSAGES = {
    invalid_article: '기사 정보를 확인할 수 없습니다.',
    invalid_email: '이메일 주소 형식이 올바르지 않습니다. (예: name@example.com)',
    invalid_pin: '비밀번호는 숫자 4자리로 입력해 주세요.',
    body_too_short: '댓글은 5자 이상 입력해 주세요.',
    body_too_long: '댓글은 1,000자까지 쓸 수 있습니다.',
    rate_limited: '등록 요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.',
    wrong_pin: '비밀번호가 일치하지 않습니다.',
    not_found: '이미 삭제된 댓글입니다.',
    locked: '비밀번호를 여러 번 틀려 삭제할 수 없습니다. 편집실로 문의해 주세요.'
  };

  function cmErrorMessage(err) {
    var code = (err && err.code) || '';
    return CM_MESSAGES[code] || '처리하지 못했습니다. 잠시 후 다시 시도해 주세요.';
  }

  function supaRpc(fn, payload) {
    return fetch(COMMENTS.url + '/rest/v1/rpc/' + fn, {
      method: 'POST',
      headers: {
        'apikey': COMMENTS.key,
        'Authorization': 'Bearer ' + COMMENTS.key,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload || {})
    }).then(function (res) {
      return res.text().then(function (text) {
        var data = null;
        try { data = text ? JSON.parse(text) : null; } catch (e) { data = null; }
        if (!res.ok) {
          var err = new Error((data && data.message) || ('HTTP ' + res.status));
          err.code = (data && data.message) || ('HTTP ' + res.status);
          throw err;
        }
        return data;
      });
    });
  }

  function cmTime(iso) {
    var d = new Date(iso);
    if (isNaN(d)) return '';
    var diff = (new Date() - d) / 1000;
    if (diff < 60) return '방금 전';
    if (diff < 3600) return Math.round(diff / 60) + '분 전';
    if (diff < 86400) return Math.round(diff / 3600) + '시간 전';
    if (diff < 86400 * 7) return Math.round(diff / 86400) + '일 전';
    return fmtDate(iso);
  }

  function cmEl(tag, cls, text) {
    var el = document.createElement(tag);
    if (cls) el.className = cls;
    if (text != null) el.textContent = text;
    return el;
  }

  function initComments(articleId) {
    var host = document.getElementById('comments');
    if (!host || !COMMENTS.url || !COMMENTS.key) return;

    host.hidden = false;
    host.innerHTML = '' +
      '<div class="container">' +
        '<div class="cm-head">' +
          '<span class="kicker">COMMENTS</span>' +
          '<h2 class="cm-title">댓글 <span class="cm-count" id="cm-count">0</span></h2>' +
          '<p class="cm-desc">이메일 주소는 <b>ho***@gmail.com</b>처럼 일부만 가려져 표시됩니다. ' +
            '등록할 때 정한 <b>숫자 4자리 비밀번호</b>를 기억해 두시면 언제든 본인 댓글을 삭제할 수 있습니다.</p>' +
        '</div>' +
        '<form class="cm-form" id="cm-form" novalidate>' +
          '<div class="cm-fields">' +
            '<label class="cm-field"><span>이메일</span>' +
              '<input id="cm-email" type="email" name="email" maxlength="254" autocomplete="email" placeholder="name@example.com" required></label>' +
            '<label class="cm-field cm-field-pin"><span>비밀번호 (숫자 4자리)</span>' +
              '<input id="cm-pin" type="password" name="pin" inputmode="numeric" autocomplete="new-password" maxlength="4" pattern="[0-9]{4}" placeholder="0000" required></label>' +
          '</div>' +
          '<label class="cm-field cm-field-body"><span>댓글</span>' +
            '<textarea id="cm-body" name="body" rows="4" maxlength="1000" placeholder="이 기사에 대한 의견을 남겨 주세요. (5자 이상)" required></textarea></label>' +
          '<div class="cm-actions">' +
            '<p class="cm-hint">5~1,000자 · 광고·비방·개인정보가 담긴 댓글은 예고 없이 삭제될 수 있습니다.</p>' +
            '<button class="btn btn-accent" type="submit" id="cm-submit">댓글 등록</button>' +
          '</div>' +
          '<p class="cm-msg" id="cm-msg" role="status" aria-live="polite"></p>' +
        '</form>' +
        '<div class="cm-list-wrap">' +
          '<p class="cm-loading" id="cm-loading">댓글을 불러오는 중입니다…</p>' +
          '<p class="cm-empty" id="cm-empty" hidden>아직 댓글이 없습니다. 첫 번째 의견을 남겨 보세요.</p>' +
          '<ol class="cm-list" id="cm-list"></ol>' +
        '</div>' +
      '</div>';

    var form = $('#cm-form', host);
    var emailInput = $('#cm-email', host);
    var pinInput = $('#cm-pin', host);
    var bodyInput = $('#cm-body', host);
    var submitBtn = $('#cm-submit', host);
    var msg = $('#cm-msg', host);
    var list = $('#cm-list', host);
    var empty = $('#cm-empty', host);
    var loading = $('#cm-loading', host);
    var countEl = $('#cm-count', host);
    var total = 0;

    try {
      var saved = window.localStorage.getItem('ib-comment-email');
      if (saved) emailInput.value = saved;
    } catch (e) { /* 저장소 접근 불가 */ }

    function setMsg(text, ok) {
      msg.textContent = text || '';
      msg.classList.toggle('is-ok', !!ok);
      msg.classList.toggle('is-on', !!text);
    }

    function setCount(n) {
      total = Math.max(0, n);
      countEl.textContent = total ? num(total) : '0';
      if (!loading.hidden) return;
      empty.hidden = total !== 0;
    }

    function cmItem(c) {
      var li = cmEl('li', 'cm-item');
      li.setAttribute('data-id', c.id);

      var meta = cmEl('div', 'cm-meta');
      meta.appendChild(cmEl('span', 'cm-author', c.author || '***'));
      meta.appendChild(cmEl('span', 'cm-dot'));
      var time = cmEl('time', 'cm-time', cmTime(c.created_at));
      time.setAttribute('datetime', c.created_at || '');
      meta.appendChild(time);
      meta.appendChild(cmEl('span', 'cm-flex'));
      var delBtn = cmEl('button', 'cm-del', '삭제');
      delBtn.type = 'button';
      meta.appendChild(delBtn);

      var text = cmEl('p', 'cm-text', c.body || '');

      var df = cmEl('form', 'cm-delform');
      df.hidden = true;
      df.appendChild(cmEl('span', 'cm-del-label', '등록 시 정한 4자리'));
      var pin = document.createElement('input');
      pin.type = 'password';
      pin.inputMode = 'numeric';
      pin.maxLength = 4;
      pin.autocomplete = 'off';
      pin.placeholder = '0000';
      pin.setAttribute('aria-label', '댓글 비밀번호 4자리');
      df.appendChild(pin);
      var ok = cmEl('button', 'cm-del-ok', '삭제');
      ok.type = 'submit';
      df.appendChild(ok);
      var cancel = cmEl('button', 'cm-del-cancel', '취소');
      cancel.type = 'button';
      df.appendChild(cancel);
      var dmsg = cmEl('span', 'cm-del-msg');
      dmsg.setAttribute('role', 'status');
      df.appendChild(dmsg);

      delBtn.addEventListener('click', function () {
        df.hidden = false;
        delBtn.hidden = true;
        pin.focus();
      });
      cancel.addEventListener('click', function () {
        df.hidden = true;
        delBtn.hidden = false;
        pin.value = '';
        dmsg.textContent = '';
      });
      df.addEventListener('submit', function (ev) {
        ev.preventDefault();
        var code = (pin.value || '').trim();
        if (!/^[0-9]{4}$/.test(code)) {
          dmsg.textContent = '숫자 4자리를 입력해 주세요.';
          return;
        }
        ok.disabled = true;
        dmsg.textContent = '확인 중…';
        supaRpc('delete_comment', { p_id: c.id, p_pin: code }).then(function () {
          li.parentNode && li.parentNode.removeChild(li);
          setCount(total - 1);
          setMsg('댓글을 삭제했습니다.', true);
        }).catch(function (err) {
          ok.disabled = false;
          if (err && err.code === 'not_found') {
            li.parentNode && li.parentNode.removeChild(li);
            setCount(total - 1);
            setMsg(CM_MESSAGES.not_found, true);
            return;
          }
          dmsg.textContent = cmErrorMessage(err);
        });
      });

      li.appendChild(meta);
      li.appendChild(text);
      li.appendChild(df);
      return li;
    }

    function loadComments() {
      supaRpc('list_comments', { p_article_id: articleId }).then(function (rows) {
        list.innerHTML = '';
        (rows || []).forEach(function (c) { list.appendChild(cmItem(c)); });
        loading.hidden = true;
        setCount((rows || []).length);
      }).catch(function () {
        loading.hidden = true;
        loading.textContent = '댓글을 불러오지 못했습니다. 잠시 후 새로고침해 주세요.';
        loading.hidden = false;
      });
    }

    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var email = (emailInput.value || '').trim();
      var pin = (pinInput.value || '').trim();
      var body = (bodyInput.value || '').trim();

      if (!/^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/.test(email)) {
        setMsg(CM_MESSAGES.invalid_email);
        emailInput.focus();
        return;
      }
      if (!/^[0-9]{4}$/.test(pin)) {
        setMsg(CM_MESSAGES.invalid_pin);
        pinInput.focus();
        return;
      }
      if (body.length < COMMENTS.minLen) {
        setMsg(CM_MESSAGES.body_too_short);
        bodyInput.focus();
        return;
      }
      if (body.length > COMMENTS.maxLen) {
        setMsg(CM_MESSAGES.body_too_long);
        bodyInput.focus();
        return;
      }

      submitBtn.disabled = true;
      setMsg('등록 중입니다…');
      supaRpc('add_comment', {
        p_article_id: articleId,
        p_email: email,
        p_pin: pin,
        p_body: body
      }).then(function (rows) {
        var created = (rows && rows[0]) || null;
        if (created) {
          list.insertBefore(cmItem(created), list.firstChild);
          setCount(total + 1);
        } else {
          loadComments();
        }
        try { window.localStorage.setItem('ib-comment-email', email); } catch (e) { /* */ }
        bodyInput.value = '';
        pinInput.value = '';
        setMsg('댓글이 등록되었습니다. 삭제하려면 위 비밀번호 4자리를 기억해 주세요.', true);
      }).catch(function (err) {
        setMsg(cmErrorMessage(err));
      }).then(function () {
        submitBtn.disabled = false;
      });
    });

    bodyInput.addEventListener('input', function () {
      if (msg.classList.contains('is-on') && msg.classList.contains('is-ok')) setMsg('');
    });

    loadComments();
  }

  /* ---------------- views · 인기 리포트 (Supabase) ---------------- */
  /* 조회수는 정적 articles.json 의 views 값이 아니라 Supabase 카운터가 기준입니다.
     기사 페이지를 열 때 bump_article_view 로 1회 기록하고(방문자·기사당 6시간 중복 방지),
     홈에서는 list_article_views 로 실제 조회수를 받아 '인기 리포트'를 다시 정렬합니다. */
  function viewVisitorId() {
    var key = 'ib-visitor-id';
    try {
      var v = window.localStorage.getItem(key);
      if (v && /^[A-Za-z0-9_-]{8,64}$/.test(v)) return v;
      v = 'v' + Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
      window.localStorage.setItem(key, v);
      return v;
    } catch (e) { return ''; }
  }

  function setArticleViews(id, count) {
    for (var i = 0; i < state.articles.length; i++) {
      if (state.articles[i].id === id) { state.articles[i].views = count; return; }
    }
  }

  /* 언어별 조회수 분리 — 한국어는 기사 id 그대로, en·zh·ja 는 '기사id:언어' 키를 씁니다.
     (같은 기사라도 언어 페이지마다 읽음 수를 따로 쌓고, 홈 인기 리포트도 그 언어 것만 반영) */
  function viewArticleId(id) {
    return IBLANG ? String(id) + ':' + IBLANG : String(id);
  }

  function recordView(a) {
    if (!a || !a.id) return;
    var el = document.getElementById('article-views');
    supaRpc('bump_article_view', { p_article_id: viewArticleId(a.id), p_visitor: viewVisitorId() })
      .then(function (count) {
        var n = Number(count);
        if (isNaN(n)) return;
        setArticleViews(a.id, n);
        if (el) {
          el.textContent = LBL.views(num(n));
          el.removeAttribute('hidden');
        }
      })
      .catch(function () {
        /* DB가 멈췄거나 오프라인이면 조회수만 감춥니다. 기사 열람은 그대로 됩니다. */
        if (el) el.hidden = true;
      });
  }

  function loadViewCounts() {
    var rank = document.getElementById('rank-list');
    if (!rank) return;
    var suffix = IBLANG ? ':' + IBLANG : '';
    supaRpc('list_article_views', {}).then(function (rows) {
      var byKey = {};
      (rows || []).forEach(function (r) {
        if (!r || !r.article_id) return;
        byKey[r.article_id] = Number(r.views) || 0;
      });
      /* 이 언어의 키만 반영합니다. 다른 언어의 값이 섞이지 않도록 먼저 0으로 놓고,
         해당 언어 키가 있을 때만 그 값을 씁니다. */
      state.articles.forEach(function (a) {
        var v = byKey[String(a.id) + suffix];
        a.views = (v == null) ? 0 : v;
      });
      rank.innerHTML = rankHTML();
    }).catch(function () {
      /* 실패 시 articles.json 의 정적 값 순서를 그대로 둡니다. */
    });
  }

  /* ---------------- 광고·제휴 (ad.html) ---------------- */
  function renderAd() {
    var m = state.site.monetize || {};
    var e = esc;

    var upd = document.querySelector('[data-mo-updated]');
    if (upd && m.updated) {
      var d = String(m.updated).split('-');
      upd.textContent = d.length === 3 ? (d[0] + '. ' + Number(d[1]) + '. ' + Number(d[2]) + '. 기준') : m.updated;
    }
    var note = document.querySelector('[data-mo-note]');
    if (note && m.note) note.textContent = m.note;

    var rates = $('#ad-rates');
    if (rates) {
      rates.innerHTML = (m.banners || []).map(function (b) {
        return '<tr>' +
          '<th scope="row">' + e(b.name) + '<small style="display:block;font-weight:400;font-size:11px;color:var(--muted);margin-top:2px">' + e(b.note || '') + '</small></th>' +
          '<td>' + e(b.size) + '</td>' +
          '<td>' + e(b.where) + '</td>' +
          '<td class="num">' + e(b.week || '—') + '</td>' +
          '<td class="num">' + e(b.month || '—') + '</td>' +
        '</tr>';
      }).join('');
    }

    var ns = m.newsletterSponsor;
    var nsHost = $('#ad-newsletter-sponsor');
    if (nsHost && ns) {
      nsHost.innerHTML = '' +
        '<h3>' + e(ns.name) + '</h3>' +
        '<p>' + e(ns.where) + ' · ' + e(ns.note || '') + '</p>' +
        '<p class="mo-price" style="margin-top:10px;font-size:15px;font-weight:800">' +
          e(ns.once || '') + ' <em style="font-style:normal;font-size:12px;font-weight:600;color:var(--muted);margin-left:6px">' + e(ns.month || '') + '</em></p>';
    }

    var pk = $('#ad-packages');
    if (pk) {
      pk.innerHTML = (m.packages || []).map(function (p) {
        var anchor = p.kind === 'b2b' ? '#b2b' : (p.kind === 'saju' ? '#inquiry' : '#inquiry');
        return '<a class="mo-card" href="' + U('ad.html') + anchor + '" data-mo-preset="' + attr(p.kind) + '">' +
          '<span class="mo-tag">' + e((IB_KIND_TAGS[p.kind] || 'PACKAGE')) + '</span>' +
          '<h3>' + e(p.name) + '</h3>' +
          '<p>' + e(p.desc) + '</p>' +
          '<span class="mo-price">' + e(p.price) + '</span>' +
          '<span class="mo-go">문의하기 →</span>' +
        '</a>';
      }).join('');
    }

    var st = $('#ad-stats');
    if (st) {
      var cats = (state.site.categories || []).length;
      st.innerHTML = '' +
        '<div class="mo-card"><span class="mo-tag">ARTICLES</span><h3>' + num(state.articles.length) + '편</h3><p>팩트체크 표와 출처를 붙여 발행한 리서치 기사(2026년 기준).</p></div>' +
        '<div class="mo-card"><span class="mo-tag">SECTIONS</span><h3>' + num(cats) + '개 섹션</h3><p>탐사보도 · 경제·금융 · 무역·원자재 · AI·테크.</p></div>' +
        '<div class="mo-card"><span class="mo-tag">FREE TOOLS</span><h3>3종</h3><p>만세력·2027 신년운세, 로또 6/45, 2027 급여·노무 계산기.</p></div>';
    }

    var select = $('#inq-kind');
    var preset = (window.location.hash || '').replace('#', '');
    var q = new URLSearchParams(window.location.search).get('kind');
    preset = (q || preset);
    if (select && preset && ['ad', 'b2b', 'saju', 'other'].indexOf(preset) !== -1) {
      select.value = preset;
    }

    $$('[data-mo-preset]').forEach(function (el) {
      el.addEventListener('click', function () {
        var k = el.getAttribute('data-mo-preset');
        var sel = $('#inq-kind');
        if (sel && k) sel.value = k;
      });
    });

    document.title = '광고·스폰서 · B2B 의뢰 — ' + state.site.brand.name;
    mountAdsense();
  }

  var IB_KIND_TAGS = { ad: 'SPONSORED', b2b: 'B2B', saju: 'PDF REPORT', other: 'ETC' };

  /* ---------------- boot ---------------- */
  /* 기사가 발행된 언어 목록 — 기사에 lang(처음 쓴 언어)·locales(발행 언어)가 있으면 그대로,
     없으면 한국어 원본으로 보고 네 언어 모두에 보입니다(도구 상세는 tools/i18n_core.py). */
  var IB_ALL_LANGS = ['ko', 'en', 'zh', 'ja'];
  function ibLocales(a) {
    a = a || {};
    var src = a.lang || 'ko';
    if (IB_ALL_LANGS.indexOf(src) === -1) src = 'ko';
    var d = a.locales;
    if (Object.prototype.toString.call(d) === '[object Array]' && d.length) {
      var picked = IB_ALL_LANGS.filter(function (l) { return d.indexOf(l) !== -1; });
      if (picked.length) {
        if (picked.indexOf(src) === -1) picked.unshift(src);
        return picked;
      }
    }
    return src === 'ko' ? IB_ALL_LANGS.slice() : [src];
  }

  function boot() {
    Promise.all([
      loadJSON(U('data/site.json'), window.__SITE__),
      loadJSON(U('data/articles.json'), window.__ARTICLES__)
    ]).then(function (res) {
      state.site = res[0];
      /* 그 언어로 발행된 기사만 그립니다(다른 나라 독자 전용 기사가 목록에 섞이지 않게). */
      var pageLang = IBLANG || 'ko';
      state.articles = (res[1] || []).filter(function (a) {
        return ibLocales(a).indexOf(pageLang) !== -1;
      }).slice().sort(function (a, b) {
        return new Date(b.publishedAt) - new Date(a.publishedAt);
      });

      fetch(U('data/market.json'), { cache: 'no-cache' })
        .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
        .catch(function () { return window.__FALLBACK_MARKET__ || null; })
        .then(function (m) {
          state.market = m;
          /* 일별 스냅샷은 그래프 추세선에만 씁니다. 없으면 기준점만으로 그립니다. */
          return fetch(U('data/market-history.json'), { cache: 'no-cache' })
            .then(function (r) { return r.ok ? r.json() : null; })
            .catch(function () { return null; });
        })
        .then(function (hist) {
          state.marketHistory = hist;
          /* 품목별 그래프용 실제 일별 종가(없으면 기준점만으로 그립니다). */
          return fetch(U('data/market-series.json'), { cache: 'no-cache' })
            .then(function (r) { return r.ok ? r.json() : null; })
            .catch(function () { return window.__FALLBACK_SERIES__ || null; });
        })
        .then(function (ser) { state.marketSeries = ser; renderMarket(); })
        .catch(function () { renderMarket(); });

      var params = new URLSearchParams(window.location.search);
      state.cat = params.get('cat') || 'all';
      state.q = params.get('q') || '';
      if (state.cat !== 'all' && !(state.site.categories || []).some(function (c) { return c.id === state.cat; })) state.cat = 'all';

      renderChrome();
      initToTop();
      initGlossary();

      if (state.page === 'home') renderHome();
      else if (state.page === 'article') renderArticle();
      else if (state.page === 'contact') renderContact();
      else if (state.page === 'ad') renderAd();
      else if (state.page === 'about') renderAbout();
    }).catch(function (err) {
      var main = $('main');
      if (main) main.innerHTML = '<div class="container" style="padding:80px 0;text-align:center"><h1 style="font-family:var(--serif);font-size:28px">사이트 데이터를 불러오지 못했습니다</h1>' +
        '<p style="color:var(--ink-3);margin-top:12px">' + esc(err.message) + '</p>' +
        '<p style="color:var(--ink-3);margin-top:8px;font-size:13px">로컬에서 열었다면 <code>python3 tools/build.py</code>를 실행한 뒤 다시 시도하세요.</p></div>';
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
