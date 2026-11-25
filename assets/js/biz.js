/* =========================================================
   INSIGHT BRIEF — 1인 사업자 실무 툴 5종 (biz.html)
   ① 견적서·거래명세서  ② 마진·수수료·부가세·3.3%·종소세
   ③ 수입 원가·관부가세·CBM  ④ 계약서·내용증명·NDA  ⑤ 무역서식 PI·CI·PL
   모든 계산은 브라우저 안에서만 하고 서버로 보내지 않습니다.
   ========================================================= */
(function () {
  'use strict';

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  function num(id) {
    var el = document.getElementById(id);
    if (!el) return 0;
    var v = parseFloat(String(el.value).replace(/[^0-9.\-]/g, ''));
    return isFinite(v) ? v : 0;
  }
  function val(id) {
    var el = document.getElementById(id);
    return el ? String(el.value == null ? '' : el.value).trim() : '';
  }
  function setText(id, text) {
    var el = document.getElementById(id);
    if (el) el.textContent = text;
  }
  function setHTML(id, html) {
    var el = document.getElementById(id);
    if (el) el.innerHTML = html;
  }
  function fmt(v) {
    if (!isFinite(v)) return '–';
    return Math.round(v).toLocaleString('ko-KR');
  }
  function won(v) { return fmt(v) + '원'; }
  function pct(v, digits) {
    if (!isFinite(v)) return '–';
    return (Math.round(v * Math.pow(10, digits == null ? 1 : digits)) / Math.pow(10, digits == null ? 1 : digits)).toLocaleString('ko-KR') + '%';
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function blank(s, fallback) {
    var t = String(s == null ? '' : s).trim();
    return t ? t : (fallback || '　　　　');
  }
  function isoToday() {
    var d = new Date();
    var m = String(d.getMonth() + 1).padStart(2, '0');
    var day = String(d.getDate()).padStart(2, '0');
    return d.getFullYear() + '-' + m + '-' + day;
  }
  function addDays(iso, days) {
    var p = String(iso || '').split('-');
    if (p.length !== 3) return '';
    var d = new Date(Date.UTC(+p[0], +p[1] - 1, +p[2]));
    d.setUTCDate(d.getUTCDate() + days);
    return d.toISOString().slice(0, 10);
  }
  function dateKo(iso) {
    var t = String(iso || '').trim();
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(t);
    if (!m) return blank(t, '　　　');
    return m[1] + '. ' + m[2] + '. ' + m[3] + '.';
  }
  /* 날짜 입력은 value가 비어 있거나 어긋날 수 있어 valueAsDate를 우선 씁니다. */
  function dateVal(id) {
    var el = document.getElementById(id);
    if (!el) return '';
    var v = String(el.value || '').trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
    if (el.valueAsDate) {
      var d = el.valueAsDate;
      return d.getUTCFullYear() + '-' + String(d.getUTCMonth() + 1).padStart(2, '0') + '-' + String(d.getUTCDate()).padStart(2, '0');
    }
    return '';
  }
  function msg(el, text, ok) {
    if (!el) return;
    el.className = 'bz-msg' + (ok ? ' is-ok' : ' is-err');
    el.textContent = text;
    clearTimeout(el._t);
    el._t = setTimeout(function () { el.textContent = ''; el.className = 'bz-msg'; }, 4000);
  }
  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      try {
        var ok = document.execCommand('copy');
        document.body.removeChild(ta);
        ok ? resolve() : reject(new Error('copy_failed'));
      } catch (e) {
        document.body.removeChild(ta);
        reject(e);
      }
    });
  }
  function printSheet(sheet) {
    if (!sheet) return;
    /* 인쇄용 복제본을 body 바로 아래에 붙이고, 나머지 화면은 인쇄에서 숨깁니다.
       이렇게 해야 숨은 긴 레이아웃 때문에 빈 페이지가 따라붙지 않습니다. */
    var copy = sheet.cloneNode(true);
    copy.removeAttribute('id');
    copy.removeAttribute('aria-live');
    copy.classList.add('bz-print-iso');
    document.body.appendChild(copy);
    document.documentElement.classList.add('bz-printing');
    var cleaning = false;
    var done = function () {
      if (cleaning) return;
      cleaning = true;
      document.documentElement.classList.remove('bz-printing');
      if (copy.parentNode) copy.parentNode.removeChild(copy);
      window.removeEventListener('afterprint', done);
    };
    window.addEventListener('afterprint', done);
    setTimeout(function () {
      window.print();
      setTimeout(done, 2500);
    }, 80);
  }

  /* ---------------------------------------------------------
     탭 전환
  --------------------------------------------------------- */
  /* ---------------------------------------------------------
     해시 라우팅
     #quote / #cost 같은 탭 이름에 더해,
     #trade · #trade-docs · #trade-pi · #trade-ci · #trade-pl 로 들어오면
     ⑤ 무역서식 탭과 그 안의 서식(PI·CI·PL)까지 바로 열립니다.
     (상단 내비 '무역서식 3종' 바로가기가 이 주소를 씁니다)
  --------------------------------------------------------- */
  var panelActivate = null;
  var tradeApi = null;
  var HASH_ALIAS = { 'trade': 'trade-docs', 'tdoc': 'trade-docs', 'trade-doc': 'trade-docs',
    'trade-pi': 'trade-docs', 'trade-ci': 'trade-docs', 'trade-pl': 'trade-docs' };

  function hashState() {
    var h = (location.hash || '').replace('#', '').toLowerCase();
    if (!h) return null;
    var panel = HASH_ALIAS[h] || h;
    if (!$('.bz-panel[data-panel="' + panel + '"]')) return null;
    var m = h.match(/^trade-(pi|ci|pl)$/);
    return { panel: panel, tdoc: m ? m[1] : null };
  }

  function applyHash(scroll) {
    var st = hashState();
    if (!st) return false;
    if (panelActivate) panelActivate(st.panel, false);
    if (st.tdoc && tradeApi) tradeApi.setType(st.tdoc);
    if (scroll) {
      var el = $('.bz-panel[data-panel="' + st.panel + '"]');
      if (el) requestAnimationFrame(function () { el.scrollIntoView({ block: 'start' }); });
    }
    return true;
  }

  function initTabs() {
    var tabs = $$('.bz-tabs [role="tab"]');
    if (!tabs.length) return;
    function activate(name, updateHash) {
      tabs.forEach(function (t) {
        var on = t.getAttribute('data-tab') === name;
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.tabIndex = on ? 0 : -1;
      });
      $$('.bz-panel').forEach(function (p) {
        p.hidden = p.getAttribute('data-panel') !== name;
      });
      if (updateHash) {
        if (history.replaceState) history.replaceState(null, '', '#' + name);
        else location.hash = name;
      }
    }
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { activate(t.getAttribute('data-tab'), true); });
      t.addEventListener('keydown', function (e) {
        var k = e.key;
        var next = null;
        if (k === 'ArrowRight' || k === 'ArrowDown') next = tabs[(i + 1) % tabs.length];
        else if (k === 'ArrowLeft' || k === 'ArrowUp') next = tabs[(i - 1 + tabs.length) % tabs.length];
        else if (k === 'Home') next = tabs[0];
        else if (k === 'End') next = tabs[tabs.length - 1];
        if (next) {
          e.preventDefault();
          next.focus();
          activate(next.getAttribute('data-tab'), true);
        }
      });
    });
    panelActivate = activate;
  }

  /* =========================================================
     ① 견적서 · 거래명세서
  ========================================================= */
  var Q = {
    kind: '견적서',
    vat: 'excl',
    items: [{ name: '', spec: '', qty: 1, price: 0 }]
  };

  function quoteRowAmount(it) {
    var gross = (it.qty || 0) * (it.price || 0);
    var supply = Q.vat === 'incl' ? Math.round(gross / 1.1) : Math.round(gross);
    var tax = Math.round(supply * 0.1);
    return { supply: supply, tax: tax, total: supply + tax };
  }

  function quoteTotals() {
    var sum = { supply: 0, tax: 0, total: 0 };
    Q.items.forEach(function (it) {
      var a = quoteRowAmount(it);
      sum.supply += a.supply;
      sum.tax += a.tax;
      sum.total += a.total;
    });
    return sum;
  }

  function renderQuoteRows() {
    var tbody = $('#q-rows');
    if (!tbody) return;
    tbody.innerHTML = Q.items.map(function (it, i) {
      var a = quoteRowAmount(it);
      return '<tr data-row="' + i + '">' +
        '<td class="amt" style="text-align:center;color:var(--muted);font-family:var(--mono);font-size:11px">' + (i + 1) + '</td>' +
        '<td><input type="text" data-f="name" data-i="' + i + '" value="' + esc(it.name) + '" placeholder="품명" aria-label="' + (i + 1) + '번 품명"></td>' +
        '<td><input type="text" data-f="spec" data-i="' + i + '" value="' + esc(it.spec) + '" placeholder="규격" aria-label="' + (i + 1) + '번 규격"></td>' +
        '<td><input type="number" data-f="qty" data-i="' + i + '" value="' + (it.qty || '') + '" min="0" step="1" inputmode="numeric" placeholder="0" aria-label="' + (i + 1) + '번 수량"></td>' +
        '<td><input type="number" data-f="price" data-i="' + i + '" value="' + (it.price || '') + '" min="0" step="10" inputmode="numeric" placeholder="0" aria-label="' + (i + 1) + '번 단가"></td>' +
        '<td class="amt-cell" data-amt="' + i + '">' + fmt(a.supply) + '</td>' +
        '<td class="amt-cell" data-tax="' + i + '">' + fmt(a.tax) + '</td>' +
        '<td style="text-align:center"><button type="button" class="del" data-del="' + i + '" aria-label="' + (i + 1) + '번 품목 삭제">×</button></td>' +
        '</tr>';
    }).join('');
  }

  function renderQuoteDoc() {
    var sheet = $('#bzQuoteDoc');
    if (!sheet) return;
    var t = quoteTotals();
    var rows = Q.items.filter(function (it) {
      return String(it.name || '').trim() || Number(it.price) > 0 || Number(it.qty) > 0;
    });
    if (!rows.length) rows = [{ name: '', spec: '', qty: 0, price: 0 }];

    var itemHTML = rows.map(function (it, i) {
      var a = quoteRowAmount(it);
      return '<tr>' +
        '<td style="text-align:center">' + (i + 1) + '</td>' +
        '<td class="n">' + esc(blank(it.name, '')) + '</td>' +
        '<td class="n" style="text-align:center">' + esc(it.spec || '') + '</td>' +
        '<td>' + (it.qty ? fmt(it.qty) : '') + '</td>' +
        '<td>' + (it.price ? fmt(it.price) : '') + '</td>' +
        '<td>' + (a.supply ? fmt(a.supply) : '') + '</td>' +
        '<td>' + (a.tax ? fmt(a.tax) : '') + '</td>' +
        '</tr>';
    }).join('');
    /* 빈 줄 2개로 종이 양식처럼 보이게 */
    for (var k = rows.length; k < 4; k++) {
      itemHTML += '<tr><td style="text-align:center">' + (k + 1) + '</td><td></td><td></td><td></td><td></td><td></td><td></td></tr>';
    }

    var isQuote = Q.kind === '견적서';
    var kind = isQuote ? '견 적 서' : '거래명세서';
    var kindShown = isQuote ? '견적서' : '거래명세서';
    var supName = blank(val('q-s-name'), '상호 미입력');
    var supInfo = [];
    if (val('q-s-biz')) supInfo.push('사업자등록번호 ' + esc(val('q-s-biz')));
    if (val('q-s-ceo')) supInfo.push('대표 ' + esc(val('q-s-ceo')));
    var line2 = [];
    if (val('q-s-addr')) line2.push(esc(val('q-s-addr')));
    if (val('q-s-tel')) line2.push(esc(val('q-s-tel')));

    var qDate = dateVal('q-date');
    var qValid = dateVal('q-valid');
    var meta = '<tr><th>문서번호</th><td>' + esc(blank(val('q-no'), '—')) + '</td></tr>' +
      '<tr><th>' + (isQuote ? '발행일' : '거래일자') + '</th><td>' + esc(qDate || '—') + '</td></tr>';
    if (isQuote) {
      meta += '<tr><th>유효기간</th><td>' + esc(qValid || '—') + '</td></tr>';
    }

    sheet.innerHTML =
      '<div class="bz-sheet-head">' +
        '<div>' +
          '<h2 class="sh-kind" aria-label="' + kindShown + '">' + kind + '</h2>' +
          '<div class="sh-sup">' + esc(supName) + '</div>' +
          '<div class="sh-supinfo">' + (supInfo.join(' · ') || '사업자 정보 미입력') +
            (line2.length ? '<br>' + line2.join(' · ') : '') + '</div>' +
        '</div>' +
        '<table class="bz-sheet-meta"><tbody>' + meta + '</tbody></table>' +
      '</div>' +
      '<div class="bz-parties">' +
        '<div class="bz-party"><h4>공급자</h4><dl>' +
          '<dt>상호</dt><dd>' + esc(blank(val('q-s-name'), '—')) + '</dd>' +
          '<dt>대표자</dt><dd>' + esc(blank(val('q-s-ceo'), '—')) + '</dd>' +
          '<dt>사업자번호</dt><dd>' + esc(blank(val('q-s-biz'), '—')) + '</dd>' +
          '<dt>연락처</dt><dd>' + esc(blank(val('q-s-tel'), '—')) + '</dd>' +
          '<dt>주소</dt><dd>' + esc(blank(val('q-s-addr'), '—')) + '</dd>' +
        '</dl></div>' +
        '<div class="bz-party"><h4>공급받는자</h4><dl>' +
          '<dt>상호</dt><dd>' + esc(blank(val('q-b-name'), '—')) + '</dd>' +
          '<dt>대표·담당</dt><dd>' + esc(blank(val('q-b-ceo'), '—')) + '</dd>' +
          '<dt>연락처</dt><dd>' + esc(blank(val('q-b-tel'), '—')) + '</dd>' +
          '<dt>주소</dt><dd>' + esc(blank(val('q-b-addr'), '—')) + '</dd>' +
          (val('q-b-mail') ? '<dt>이메일</dt><dd>' + esc(val('q-b-mail')) + '</dd>' : '') +
        '</dl></div>' +
      '</div>' +
      '<table class="bz-sheet-table">' +
        '<thead><tr><th style="width:30px">No</th><th>품명</th><th style="width:74px">규격</th>' +
        '<th style="width:48px">수량</th><th style="width:78px">단가</th><th style="width:86px">공급가액</th><th style="width:70px">세액</th></tr></thead>' +
        '<tbody>' + itemHTML + '</tbody>' +
      '</table>' +
      '<div class="bz-sum"><table><tbody>' +
        '<tr><th>공급가액 합계</th><td>' + fmt(t.supply) + ' 원</td></tr>' +
        '<tr><th>부가세 (10%)</th><td>' + fmt(t.tax) + ' 원</td></tr>' +
        '<tr class="grand"><th>합계금액</th><td>' + fmt(t.total) + ' 원</td></tr>' +
      '</tbody></table></div>' +
      '<div class="bz-sheet-foot">' +
        '<div class="sf-note">' +
          (isQuote ? '<b>견적 유효기간</b> ' + esc(qValid || '—') + ' 까지<br>' : '') +
          '<b>입금계좌</b> ' + esc(blank(val('q-s-acc'), '—')) +
          (val('q-s-note') ? '<br><b>비고</b> ' + esc(val('q-s-note')) : '') +
          '<br>' + (isQuote ? '위와 같이 견적합니다.' : '위와 같이 거래하였음을 확인합니다.') +
          (Q.vat === 'incl' ? ' (단가는 부가세 포함 금액)' : ' (단가는 부가세 별도 금액)') +
        '</div>' +
        '<div class="sf-sign">' + (isQuote ? '발행인' : '인수자') + '<span class="line">(인)</span></div>' +
      '</div>' +
      '<div class="sheet-note">본 양식은 실무 참고용입니다. 세금계산서 발급·신고는 홈택스와 세무대리인 안내를 따르세요.</div>';

    /* 요약 KPI · 표 */
    setText('q-sum-supply', won(t.supply));
    setText('q-sum-tax', won(t.tax));
    setText('q-sum-total', won(t.total));
    setText('q-vat-note', Q.vat === 'incl'
      ? '입력한 단가를 부가세 포함으로 보고 공급가액을 역산했습니다.'
      : '입력한 단가를 부가세 별도로 보고 세액 10%를 더했습니다.');
  }

  function initQuote() {
    if (!$('#bzQuoteDoc')) return;

    /* 기본값 */
    var dEl = $('#q-date');
    if (dEl && !dEl.value) dEl.value = isoToday();
    var vEl = $('#q-valid');
    if (vEl && !vEl.value) vEl.value = addDays(dEl ? dEl.value : isoToday(), 14);
    var nEl = $('#q-no');
    if (nEl && !nEl.value) {
      var d = new Date();
      var stamp = d.getFullYear() + String(d.getMonth() + 1).padStart(2, '0') + String(d.getDate()).padStart(2, '0');
      nEl.value = 'Q-' + stamp + '-01';
    }

    /* 문서 종류 */
    $$('[data-qkind]').forEach(function (b) {
      b.addEventListener('click', function () {
        Q.kind = b.getAttribute('data-qkind');
        $$('[data-qkind]').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
        var rowValid = $('#q-valid-row');
        if (rowValid) rowValid.hidden = Q.kind !== '견적서';
        renderQuoteDoc();
      });
    });

    /* 부가세 모드 */
    $$('[data-qvat]').forEach(function (b) {
      b.addEventListener('click', function () {
        Q.vat = b.getAttribute('data-qvat');
        $$('[data-qvat]').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
        renderQuoteRows();
        renderQuoteDoc();
      });
    });

    /* 품목 입력 */
    var tbody = $('#q-rows');
    if (tbody) {
      tbody.addEventListener('input', function (e) {
        var t = e.target;
        if (!t || !t.getAttribute) return;
        var i = parseInt(t.getAttribute('data-i'), 10);
        var f = t.getAttribute('data-f');
        if (isNaN(i) || !f || !Q.items[i]) return;
        if (f === 'qty' || f === 'price') {
          var v = parseFloat(t.value);
          Q.items[i][f] = isFinite(v) ? v : 0;
        } else {
          Q.items[i][f] = t.value;
        }
        var a = quoteRowAmount(Q.items[i]);
        var cell = tbody.querySelector('[data-amt="' + i + '"]');
        var taxCell = tbody.querySelector('[data-tax="' + i + '"]');
        if (cell) cell.textContent = fmt(a.supply);
        if (taxCell) taxCell.textContent = fmt(a.tax);
        renderQuoteDoc();
      });
      tbody.addEventListener('click', function (e) {
        var btn = e.target.closest ? e.target.closest('[data-del]') : null;
        if (!btn) return;
        var i = parseInt(btn.getAttribute('data-del'), 10);
        if (Q.items.length <= 1) {
          Q.items[0] = { name: '', spec: '', qty: 1, price: 0 };
        } else {
          Q.items.splice(i, 1);
        }
        renderQuoteRows();
        renderQuoteDoc();
      });
    }
    var add = $('#q-add');
    if (add) add.addEventListener('click', function () {
      Q.items.push({ name: '', spec: '', qty: 1, price: 0 });
      renderQuoteRows();
      renderQuoteDoc();
      var rows = $$('#q-rows [data-f="name"]');
      var last = rows[rows.length - 1];
      if (last) last.focus();
    });

    /* 입력 → 문서 갱신 */
    ['q-s-name', 'q-s-biz', 'q-s-ceo', 'q-s-tel', 'q-s-addr', 'q-s-acc', 'q-s-note',
      'q-b-name', 'q-b-ceo', 'q-b-tel', 'q-b-addr', 'q-b-mail', 'q-no', 'q-date', 'q-valid'
    ].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.addEventListener('input', renderQuoteDoc);
      if (el) el.addEventListener('change', renderQuoteDoc);
    });

    var pBtn = $('#q-print');
    if (pBtn) pBtn.addEventListener('click', function () { printSheet($('#bzQuoteDoc')); });
    var cBtn = $('#q-copy');
    if (cBtn) cBtn.addEventListener('click', function () {
      var doc = $('#bzQuoteDoc');
      copyText(doc ? doc.innerText : '').then(function () {
        msg($('#q-msg'), '문서 내용을 복사했습니다. 메일에 붙여 넣으세요.', true);
      }).catch(function () {
        msg($('#q-msg'), '복사하지 못했습니다. 문서를 직접 선택해 복사해 주세요.', false);
      });
    });

    renderQuoteRows();
    renderQuoteDoc();
  }

  /* =========================================================
     ② 마진 · 수수료 · 부가세 · 3.3% · 종소세
  ========================================================= */
  /* 국가별 페이지(/en/ /zh/ /ja/)에서는 버튼에 표시한 현지 마켓 수수료와 같은 값을 씁니다. */
  var IBL_LANG = (document.documentElement.getAttribute('lang') || 'ko').toLowerCase();
  var FEE_PRESETS = /^en/i.test(IBL_LANG)
    ? { 'smart-naver': 15, 'smart-etc': 15, 'coupang': 15, 'direct': null }
    : /^zh/i.test(IBL_LANG)
      ? { 'smart-naver': 5, 'smart-etc': 5, 'coupang': 5, 'direct': null }
      : /^ja/i.test(IBL_LANG)
        ? { 'smart-naver': 15, 'smart-etc': 15, 'coupang': 15, 'direct': null }
        : { 'smart-naver': 2, 'smart-etc': 3.63, 'coupang': 10.8, 'direct': null };

  function initMargin() {
    if (!$('#m-price')) return;
    var feeEl = $('#m-fee-rate');

    $$('[data-fee]').forEach(function (b) {
      b.addEventListener('click', function () {
        var key = b.getAttribute('data-fee');
        $$('[data-fee]').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
        if (FEE_PRESETS[key] != null && feeEl) {
          feeEl.value = FEE_PRESETS[key];
          feeEl.readOnly = true;
        } else if (feeEl) {
          feeEl.readOnly = false;
          feeEl.focus();
        }
        calcMargin();
      });
    });

    ['m-price', 'm-cost', 'm-ship', 'm-pack', 'm-fee-rate', 'm-target'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.addEventListener('input', calcMargin);
    });

    function calcMargin() {
      var price = num('m-price');
      var cost = num('m-cost');
      var ship = num('m-ship');
      var pack = num('m-pack');
      var fee = num('m-fee-rate');
      var target = num('m-target');

      var feeAmt = price * fee / 100;
      var costSum = cost + ship + pack;
      var profit = price - costSum - feeAmt;
      var margin = price > 0 ? profit / price * 100 : 0;
      var markup = costSum > 0 ? profit / costSum * 100 : 0;
      var roas = profit > 0 ? price / profit * 100 : NaN;
      var bep = (1 - fee / 100) > 0 ? costSum / (1 - fee / 100) : NaN;
      var targetDenom = 1 - fee / 100 - target / 100;
      var targetPrice = targetDenom > 0.01 ? costSum / targetDenom : NaN;

      setText('m-profit', won(profit));
      setText('m-margin', pct(margin, 1));
      setHTML('m-margin-d', cost > 0
        ? '투입 원가 대비 ' + pct(markup, 1) + ' · 판매가 ' + won(price) + ' 기준'
        : '매출 대비 순이익률');
      setText('m-roas', isFinite(roas) ? pct(roas, 0) : '–');
      setHTML('m-roas-d', isFinite(roas)
        ? '광고비 ' + won(profit) + '까지 손익분기 (약 ' + (roas / 100).toFixed(1) + '배)'
        : '순이익이 0 이하면 광고 여력이 없습니다');
      setText('m-bep', isFinite(bep) ? won(bep) : '–');
      setHTML('m-bep-d', isFinite(bep)
        ? (price > 0
            ? '이 가격 아래면 파실수록 손해 · 현재가 ' + (price < bep ? won(bep - price) + ' 부족' : won(price - bep) + ' 여유')
            : '이 가격이면 개당 순이익 0원')
        : '수수료율을 확인하세요');
      setText('m-target-price', isFinite(targetPrice) ? won(targetPrice) : '–');
      setHTML('m-target-d', isFinite(targetPrice)
        ? '목표 마진 ' + pct(target, 1) + ' 기준 · 현재가 대비 ' + (price ? (targetPrice - price > 0 ? '+' + won(targetPrice - price) + ' 인상 필요' : won(price - targetPrice) + ' 여유') : '—')
        : '수수료율 + 목표 마진이 100%를 넘습니다');

      /* 상세 표 */
      setHTML('m-rows',
        '<tr><td>판매가</td><td class="num">' + fmt(price) + '</td><td class="num">—</td></tr>' +
        '<tr><td>매입원가</td><td class="num">' + fmt(cost) + '</td><td class="num">' + (price > 0 ? pct(cost / price * 100, 1) : '—') + '</td></tr>' +
        '<tr><td>배송비·포장비</td><td class="num">' + fmt(ship + pack) + '</td><td class="num">' + (price > 0 ? pct((ship + pack) / price * 100, 1) : '—') + '</td></tr>' +
        '<tr><td>마켓 수수료 <span class="sub">' + pct(fee, 2) + ' · ' + fmt(feeAmt) + '원</span></td><td class="num">' + fmt(feeAmt) + '</td><td class="num">' + (price > 0 ? pct(fee, 2) : '—') + '</td></tr>' +
        '<tr class="sum"><td>개당 순이익</td><td class="num">' + fmt(profit) + '</td><td class="num">' + (price > 0 ? pct(margin, 1) : '—') + '</td></tr>');

      /* 경고 */
      var w = $('#m-warn');
      if (w) {
        if (price <= 0) { w.hidden = true; }
        else if (profit <= 0) {
          w.hidden = false;
          w.className = 'bz-warn';
          w.innerHTML = '<b>이 조건으로는 팔수록 손해입니다.</b> 개당 ' + won(Math.abs(profit)) + '씩 손실입니다. 판매가를 ' + won(bep - price) + ' 이상 올리거나, 매입원가·배송비를 낮춰야 손익분기를 넘습니다.';
        } else if (margin < 10) {
          w.hidden = false;
          w.className = 'bz-warn';
          w.innerHTML = '<b>마진율 ' + pct(margin, 1) + '은 얇습니다.</b> 반품·교환 1건(왕복 배송비 약 5,000원)이면 개당 이익 ' + won(profit) + '의 ' + (profit > 0 ? Math.ceil(5000 / profit) : 1) + '건분이 사라집니다. 반품률을 함께 계산해 두세요.';
        } else { w.hidden = true; }
      }
    }

    /* 부가세 일반 vs 간이 */
    ['v-sales', 'v-purchase', 'v-industry'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.addEventListener('input', calcVat);
      if (el) el.addEventListener('change', calcVat);
    });
    function calcVat() {
      var sales = num('v-sales');
      var purchase = num('v-purchase');
      var rate = num('v-industry') || 15;

      var nOut = sales * 0.1;
      var nIn = purchase * 0.1;
      var normal = nOut - nIn;

      var sOut = sales * rate / 100 * 0.1;
      var sIn = purchase * 0.1;
      var simpleRaw = sOut - sIn;
      var simple = Math.max(0, simpleRaw);
      var exempt = sales > 0 && sales < 48000000;
      if (exempt) simple = 0;

      setText('v-out-tax', won(nOut));
      setText('v-in-tax', won(nIn));
      setText('v-normal', won(normal));
      setHTML('v-normal-d', sales > 0 ? '매출의 ' + pct(normal / sales * 100, 2) : '매출 대비 부담률');
      setText('v-simple', won(simple));
      setHTML('v-simple-d', exempt
        ? '연매출 4,800만원 미만 — 납부의무 면제(추정)'
        : (simpleRaw < 0 ? '매입세액이 매출세액보다 커 0원 (초과분 환급 없음)' : '부가율 ' + pct(rate, 0) + ' 적용 추정'));

      var diff = normal - simple;
      var v = $('#v-verdict');
      if (v) {
        var better = diff > 0 ? '간이과세' : (diff < 0 ? '일반과세' : '동일');
        var eligible = sales > 0 && sales < 104000000;
        v.innerHTML = '<span class="st ' + (sales > 0 ? (diff > 0 ? 'ok' : 'warn') : '') + '">' +
          (sales > 0 ? better + (diff !== 0 ? ' ' + won(Math.abs(diff)) + ' 유리' : '') : '금액을 입력하세요') + '</span>' +
          '<p>' + (sales > 0
            ? (eligible ? '연매출 ' + won(sales) + '은 간이과세 기준(1억 400만원 미만) 안입니다. ' : '연매출 ' + won(sales) + '은 간이과세 기준(1억 400만원 미만)을 넘어 간이과세를 선택할 수 없습니다. ') +
              '간이는 매입세액 공제가 세금계산서 수취분으로 제한되고, 거래처가 세금계산서를 요구하면 발급 부담이 생깁니다.'
            : '과세기간 매출·매입(공급가액)을 넣으면 일반과세와 간이과세 납부세액을 비교합니다.')
          + '</p>';
      }
      var note = $('#v-exempt-note');
      if (note) note.hidden = !(sales > 0 && sales < 48000000);
      return { normal: normal, simple: simple };
    }

    /* 3.3% */
    var grossEl = $('#f-amount');
    var netT = $('#f-net-target');

    function calcReverse() {
      var target = num('f-net-target');
      setText('f-gross-rev', target > 0 ? won(target / 0.967) : '–');
      setText('f-gross-rev-d', target > 0 ? '실수령 ' + won(target) + ' 기준 · 3.3% 역산' : '받고 싶은 실수령액을 넣으면 세전 금액을 계산합니다');
    }
    function calcFreelance() {
      var gross = num('f-amount');
      var tax = Math.round(gross * 0.03);
      var local = Math.round(gross * 0.003);
      setText('f-tax', won(tax));
      setText('f-local', won(local));
      setText('f-net', won(gross - tax - local));
      if (netT && !netT.dataset.touched) {
        netT.value = gross > 0 ? Math.round(gross - tax - local) : '';
      }
      calcReverse();
    }
    if (grossEl) grossEl.addEventListener('input', calcFreelance);
    if (netT) netT.addEventListener('input', function () {
      netT.dataset.touched = netT.value ? '1' : '';
      calcReverse();
    });
    calcFreelance();

    /* 종합소득세 참고 */
    var BRACKETS = [
      { up: 14000000, rate: 0.06, cut: 0 },
      { up: 50000000, rate: 0.15, cut: 1260000 },
      { up: 88000000, rate: 0.24, cut: 5760000 },
      { up: 150000000, rate: 0.35, cut: 15440000 },
      { up: 300000000, rate: 0.38, cut: 19940000 },
      { up: 500000000, rate: 0.40, cut: 25940000 },
      { up: 1000000000, rate: 0.42, cut: 35940000 },
      { up: Infinity, rate: 0.45, cut: 65940000 }
    ];
    function incomeTax(base) {
      if (base <= 0) return 0;
      for (var i = 0; i < BRACKETS.length; i++) {
        if (base <= BRACKETS[i].up) return Math.max(0, base * BRACKETS[i].rate - BRACKETS[i].cut);
      }
      return 0;
    }
    var paidField = document.getElementById('t-paid');
    if (paidField) {
      paidField.addEventListener('input', function () { paidField.dataset.touched = '1'; });
      paidField.addEventListener('change', function () { paidField.dataset.touched = '1'; });
    }
    ['t-income', 't-cost', 't-family', 't-paid'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.addEventListener('input', calcTax);
      if (el) el.addEventListener('change', calcTax);
    });
    function calcTax() {
      var income = num('t-income');
      var costRate = num('t-cost');
      var family = num('t-family');
      var paidEl = document.getElementById('t-paid');
      var paidAuto = !(paidEl && paidEl.dataset.touched);

      var businessIncome = income * (1 - costRate / 100);
      var deduction = 1500000 * (1 + family);
      var base = Math.max(0, businessIncome - deduction);
      var tax = incomeTax(base);
      var local = tax * 0.1;
      var total = tax + local;
      var paid = paidAuto ? Math.round(income * 0.033) : num('t-paid');
      if (paidEl && paidAuto) paidEl.value = paid;

      setText('t-business', won(businessIncome));
      setText('t-base', won(base));
      setText('t-total', won(total));
      setHTML('t-total-d', income > 0 ? '소득세 ' + won(tax) + ' + 지방세 · 실효 ' + pct(total / income * 100, 2) : '소득세 + 지방소득세 10%');
      var settle = paid - total;
      setText('t-settle', won(Math.abs(settle)));
      setHTML('t-settle-d', paid > total
        ? '기납부(3.3%)가 더 많아 <b>환급 예상</b>'
        : '추가 납부 예상 (기납부 ' + won(paid) + ')');
    }

    calcMargin();
    calcVat();
    calcTax();
  }

  /* =========================================================
     ③ 수입 원가 · 관부가세 · CBM
  ========================================================= */
  function initImport() {
    if (!$('#p-price')) return;

    var FX = { USD: 1330.8, CNY: 199.65, EUR: 1550, KRW: 1 };
    var curEl = $('#p-cur');
    if (curEl) {
      curEl.addEventListener('change', function () {
        var fx = $('#p-fx');
        if (fx && FX[curEl.value]) fx.value = FX[curEl.value];
        setText('p-cur-unit', curEl.value);
        calcImport();
      });
    }

    /* 인코텀즈 */
    var term = 'FOB';
    $$('[data-term]').forEach(function (b) {
      b.addEventListener('click', function () {
        term = b.getAttribute('data-term');
        $$('[data-term]').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
        var fr = $('#p-freight');
        if (fr) {
          fr.disabled = term === 'CIF';
          if (term === 'CIF') fr.value = fr.value || 0;
        }
        var fh = $('#p-freight-hint');
        if (fh) fh.textContent = term === 'CIF' ? 'CIF — 운임·보험 단가 포함' : 'FOB — 별도 입력';
        calcImport();
      });
    });

    $$('[data-duty]').forEach(function (b) {
      b.addEventListener('click', function () {
        var v = b.getAttribute('data-duty');
        $$('[data-duty]').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
        var r = $('#p-duty-rate');
        if (r) {
          if (v === 'fta') { r.readOnly = true; r.value = 0; }
          else if (v === 'base') { r.readOnly = true; r.value = 8; }
          else { r.readOnly = false; r.focus(); }
        }
        calcImport();
      });
    });

    ['p-price', 'p-fx', 'p-qty', 'p-freight', 'p-clear', 'p-domestic', 'p-duty-rate'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.addEventListener('input', calcImport);
    });

    function calcImport() {
      var price = num('p-price');
      var fx = num('p-fx') || 1;
      var qty = num('p-qty');
      var freight = term === 'CIF' ? 0 : num('p-freight');
      var clear = num('p-clear');
      var domestic = num('p-domestic');
      var dutyRate = num('p-duty-rate');

      var goods = price * fx * qty;          /* 물품대금(원화) */
      var cif = goods + freight;             /* 과세가격: CIF */
      var duty = cif * dutyRate / 100;
      var vatBase = cif + duty;
      var vat = vatBase * 0.1;
      var total = cif + duty + vat + clear + domestic;
      var realCost = total - vat;            /* 부가세는 매입세액 공제 */
      var unit = qty > 0 ? total / qty : 0;
      var unitReal = qty > 0 ? realCost / qty : 0;
      var unitGoods = qty > 0 ? goods / qty : 0;
      var dutyEffect = qty > 0 ? (dutyRate ? duty / qty : 0) : 0;

      setText('i-duty', won(duty));
      setHTML('i-duty-d', pct(dutyRate, 2) + (dutyRate === 0 ? ' (FTA·협정세율 적용 가정)' : ' 적용'));
      setText('i-vat', won(vat));
      setHTML('i-vat-d', '매입세액 공제 대상 · 실질 원가에서 제외');
      setText('i-total', won(total));
      setHTML('i-total-d', '관세·부가세·통관·운송 포함');
      setText('i-unit-real', won(unitReal));
      setHTML('i-unit-real-d', '부가세 공제 후 실질 원가 · 개당');

      /* 구성 */
      var parts = [
        { k: '물품대금', v: goods, c: 'b1' },
        { k: '국제운임', v: freight, c: 'b2' },
        { k: '관세', v: duty, c: 'b5' },
        { k: '통관·국내운송', v: clear + domestic, c: 'b3' },
        { k: '부가세(공제)', v: vat, c: 'b4' }
      ];
      var bar = $('#i-bar');
      if (bar) {
        bar.innerHTML = parts.map(function (p) {
          var w = total > 0 ? Math.max(0, p.v / total * 100) : 0;
          return '<i class="' + p.c + '" style="width:' + w.toFixed(2) + '%" title="' + p.k + ' ' + fmt(p.v) + '원"></i>';
        }).join('');
      }
      setHTML('i-legend', parts.map(function (p) {
        return '<span><i class="' + p.c + '"></i>' + p.k + ' <b>' + (total > 0 ? pct(p.v / total * 100, 1) : '0%') + '</b></span>';
      }).join(''));

      setHTML('i-rows',
        '<tr><td>물품대금 <span class="sub">FOB/CIF 단가 × 환율 × 수량</span></td><td class="num">' + fmt(goods) + '</td></tr>' +
        '<tr><td>국제운임 <span class="sub">' + (term === 'CIF' ? '단가에 포함(CIF)' : '별도 입력') + '</span></td><td class="num">' + fmt(freight) + '</td></tr>' +
        '<tr class="sum"><td>과세가격(CIF)</td><td class="num">' + fmt(cif) + '</td></tr>' +
        '<tr><td>관세 <span class="sub">' + pct(dutyRate, 2) + '</span></td><td class="num">' + fmt(duty) + '</td></tr>' +
        '<tr><td>수입 부가세 <span class="sub">(과세가격 + 관세) × 10%</span></td><td class="num">' + fmt(vat) + '</td></tr>' +
        '<tr><td>통관비·국내운송</td><td class="num">' + fmt(clear + domestic) + '</td></tr>' +
        '<tr class="sum"><td>총 수입원가 <span class="sub">부가세 포함 · 개당 ' + fmt(unit) + '원</span></td><td class="num">' + fmt(total) + '</td></tr>' +
        '<tr><td>실질 원가 <span class="sub">부가세 매입세액 공제 후</span></td><td class="num">' + fmt(realCost) + '</td></tr>' +
        '<tr><td>개당 도착원가 <span class="sub">물품대금만 ' + fmt(unitGoods) + '원' + (dutyEffect ? ' · 관세 ' + fmt(dutyEffect) + '원' : '') + '</span></td><td class="num">' + fmt(unitReal) + '</td></tr>');

      calcCbm(qty);
    }

    ['c-l', 'c-w', 'c-h', 'c-boxes'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.addEventListener('input', function () { calcCbm(num('p-qty')); });
    });

    function calcCbm(qty) {
      var l = num('c-l'), w = num('c-w'), h = num('c-h'), boxes = num('c-boxes');
      var perBox = l * w * h / 1000000;
      var total = perBox * boxes;
      setText('c-cbm', (Math.round(total * 1000) / 1000).toLocaleString('ko-KR') + ' CBM');
      setHTML('c-cbm-d', boxes > 0 ? '박스당 ' + (Math.round(perBox * 10000) / 10000).toLocaleString('ko-KR') + ' CBM × ' + fmt(boxes) + '박스' : '가로·세로·높이를 cm로');
      setText('c-20', total > 0 ? pct(total / 28 * 100, 1) : '–');
      setText('c-40', total > 0 ? pct(total / 58 * 100, 1) : '–');
      setText('c-40hc', total > 0 ? pct(total / 68 * 100, 1) : '–');
      setText('c-unit', total > 0 && qty > 0 ? (total / qty).toFixed(4) + ' CBM' : '–');
      var note = $('#c-note');
      if (note) {
        note.hidden = !(total > 0);
        if (total > 0) {
          var recommend = total <= 28 ? '20ft 1대' : total <= 58 ? '40ft 1대' : total <= 68 ? '40ft HC 1대' : Math.ceil(total / 68) + ' × 40ft HC';
          note.innerHTML = '<b>참고 적재:</b> 총 ' + (Math.round(total * 100) / 100) + ' CBM이면 ' + recommend +
            ' 수준입니다. 실제 적재량은 팔레트·적재 방식에 따라 10~20% 줄어들 수 있어, 견적서상 CBM보다 여유를 두세요.';
        }
      }
    }

    calcImport();
  }

  /* =========================================================
     ④ 계약서 · 내용증명 · NDA
  ========================================================= */
  function initContract() {
    var doc = $('#bzContractDoc');
    if (!doc) return;
    var tplEl = $('#c-tpl');

    function showFields(tpl) {
      $$('[data-only]').forEach(function (el) {
        var only = el.getAttribute('data-only').split(/\s+/);
        el.hidden = only.indexOf(tpl) === -1;
      });
    }

    function dateOr(id, fallback) {
      var v = dateVal(id);
      return v ? dateKo(v) : fallback;
    }

    function partiesHTML(aRole, bRole) {
      return '<div class="bz-parties" style="margin-top:6px">' +
        '<div class="bz-party"><h4>' + aRole + '</h4><dl>' +
        '<dt>상호·성명</dt><dd>' + esc(blank(val('c-g-name'), '—')) + '</dd>' +
        '<dt>대표</dt><dd>' + esc(blank(val('c-g-rep'), '—')) + '</dd>' +
        '<dt>주소</dt><dd>' + esc(blank(val('c-g-addr'), '—')) + '</dd>' +
        '<dt>연락처</dt><dd>' + esc(blank(val('c-g-tel'), '—')) + '</dd>' +
        '</dl></div>' +
        '<div class="bz-party"><h4>' + bRole + '</h4><dl>' +
        '<dt>상호·성명</dt><dd>' + esc(blank(val('c-e-name'), '—')) + '</dd>' +
        '<dt>대표</dt><dd>' + esc(blank(val('c-e-rep'), '—')) + '</dd>' +
        '<dt>주소</dt><dd>' + esc(blank(val('c-e-addr'), '—')) + '</dd>' +
        '<dt>연락처</dt><dd>' + esc(blank(val('c-e-tel'), '—')) + '</dd>' +
        '</dl></div>' +
        '</div>';
    }

    function signHTML(aLabel, bLabel) {
      return '<div class="ct-sign">' +
        '<div>' + esc(blank(aLabel, '갑')) + '<span class="s-line">(인)</span></div>' +
        '<div>' + esc(blank(bLabel, '을')) + '<span class="s-line">(인)</span></div>' +
        '</div>';
    }

    function render() {
      var tpl = tplEl ? tplEl.value : 'service';
      var amount = num('c-amount');
      var date = dateVal('c-date') || isoToday();
      var scope = val('c-scope');
      var account = val('c-account');
      var due = val('c-due');
      var start = val('c-start');
      var end = val('c-end');
      var cause = val('c-cause');
      var termYears = num('c-term');
      var gName = val('c-g-name');
      var eName = val('c-e-name');

      var head = '<h1>' + (tpl === 'nda' ? '비밀유지계약서' : tpl === 'dunning' ? '내용증명' : '용역 계약서') + '</h1>' +
        '<div class="ct-meta">' + (tpl === 'dunning' ? 'DUNNING LETTER' : tpl === 'nda' ? 'NON-DISCLOSURE AGREEMENT' : 'SERVICE AGREEMENT') + ' · ' + dateKo(date) + '</div>';

      var scopeLabel = $('#c-scope-label');
      if (scopeLabel) scopeLabel.textContent = tpl === 'nda' ? '비밀정보의 범위' : '업무의 범위';

      var body = '';

      if (tpl === 'service') {
        body =
          '<p>갑(의뢰인)과 을(수급인)은 아래와 같이 업무 위탁 계약을 체결한다.</p>' +
          '<h2>제1조 (당사자)</h2>' + partiesHTML('갑 (의뢰인)', '을 (수급인)') +
          '<div class="ct-body">' +
          '<h2>제2조 (업무의 범위)</h2>' +
          '<div class="ct-pre">' + esc(blank(scope, '1) \n2) \n3) ')) + '</div>' +
          '<h2>제3조 (계약기간)</h2>' +
          '<p>업무 착수일 ' + esc(dateOr('c-start', '　　　　')) + ' 부터 완료일 ' + esc(dateOr('c-end', '　　　　')) + ' 까지로 한다. 상호 서면 합의로 기간을 연장할 수 있다.</p>' +
          '<h2>제4조 (대금과 지급)</h2>' +
          '<ol>' +
          '<li>총 용역대금은 금 ' + (amount > 0 ? fmt(amount) : '　　　　') + ' 원(부가가치세 별도)으로 한다.</li>' +
          '<li>지급기한은 ' + esc(dateOr('c-due', '검수 완료 후 7일 이내')) + ' 로 한다.</li>' +
          '<li>입금계좌: ' + esc(blank(account, '　　　　')) + '</li>' +
          '<li>갑은 결과물 검수를 마친 뒤 대금을 지급한다.</li>' +
          '</ol>' +
          '<h2>제5조 (검수)</h2>' +
          '<p>갑은 결과물을 받은 날부터 7일 안에 검수하고, 흠결이 있으면 구체적인 사항을 적어 보완을 요청한다. 그 기간 안에 통지가 없으면 검수를 마친 것으로 본다.</p>' +
          '<h2>제6조 (지식재산권)</h2>' +
          '<p>을이 이 계약에 따라 만든 결과물의 저작재산권은 대금이 모두 지급되면 갑에게 이전한다. 다만 을이 사전에 보유한 도구·라이브러리·노하우와 제3자의 오픈소스는 제외한다.</p>' +
          '<h2>제7조 (비밀유지)</h2>' +
          '<p>양 당사자는 계약 과정에서 알게 된 상대방의 비밀정보를 계약이 끝난 뒤 3년간 제3자에게 알리지 않는다.</p>' +
          '<h2>제8조 (해지)</h2>' +
          '<p>어느 한쪽이 계약상 의무를 중대하게 어기고 상대가 7일 이상의 기간을 정해 시정을 요구했는데도 고치지 않으면, 상대는 계약을 해지할 수 있다. 이때 을은 그때까지 한 업무에 해당하는 대금을 청구할 수 있다.</p>' +
          '<h2>제9조 (분쟁 해결)</h2>' +
          '<p>이 계약에 관한 분쟁은 상호 협의로 해결하고, 협의가 되지 않으면 갑의 주소지 관할 법원에 제기한다.</p>' +
          '<h2>제10조 (기타)</h2>' +
          '<p>이 계약에 정하지 않은 사항은 관계 법령과 일반 상관례에 따른다. 계약의 변경은 서면으로 한다.</p>' +
          '</div>' +
          '<p style="text-align:center;margin-top:18px">' + dateKo(date) + '</p>' +
          signHTML(gName || '갑', eName || '을');
      } else if (tpl === 'dunning') {
        var claim = amount > 0 ? fmt(amount) + '원' : '　　　　　원';
        body =
          '<p style="text-align:center;font-weight:700;letter-spacing:-.01em">제목: 미지급 대금 ' + claim + '의 지급을 촉구합니다</p>' +
          '<p><b>수신</b> ' + esc(blank(eName, '　　　　')) + (val('c-e-rep') ? ' (대표 ' + esc(val('c-e-rep')) + ')' : '') + '</p>' +
          '<p><b>발신</b> ' + esc(blank(gName, '　　　　')) + (val('c-g-rep') ? ' (대표 ' + esc(val('c-g-rep')) + ')' : '') + '</p>' +
          '<p><b>발신인 주소</b> ' + esc(blank(val('c-g-addr'), '　　　　')) + ' / <b>연락처</b> ' + esc(blank(val('c-g-tel'), '　　　　')) + '</p>' +
          '<div class="ct-body">' +
          '<h2>1. 채무의 발생</h2>' +
          '<p>귀하는 아래와 같이 발생한 대금을 지급하기로 하였습니다.</p>' +
          '<ol>' +
          '<li>발생 원인: ' + esc(blank(cause, '거래(용역·납품) 계약')) + '</li>' +
          '<li>청구 금액: 금 ' + claim + ' (부가가치세 포함)</li>' +
          '<li>지급기한: ' + esc(dateOr('c-due', '　　　　')) + '</li>' +
          '</ol>' +
          '<h2>2. 지급 지연</h2>' +
          '<p>위 지급기한이 지난 지금까지 대금이 입금되지 않았습니다.</p>' +
          '<h2>3. 지급 요청</h2>' +
          '<p>이 통지서를 받은 날부터 7일 안에 아래 계좌로 지급해 주시기 바랍니다. 기간 안에 지급이 없으면 부득이 지급명령 신청 등 법적 절차를 진행할 수 있으며, 그에 드는 비용은 귀하에게 청구할 수 있습니다.</p>' +
          '<p>입금계좌: ' + esc(blank(account, '　　　　')) + '</p>' +
          '<h2>4. 협의 요청</h2>' +
          '<p>지급이 어려운 사정이 있으면 기일을 정해 먼저 연락해 주시기 바랍니다. 상호 협의로 분할 지급도 검토하겠습니다.</p>' +
          '</div>' +
          '<p style="text-align:center;margin-top:18px">' + dateKo(date) + '</p>' +
          '<p style="text-align:right;margin-top:10px">발신인 ' + esc(blank(gName, '　　　　')) + ' (인)</p>';
      } else {
        body =
          '<p>' + esc(blank(gName, '갑')) + '와(과) ' + esc(blank(eName, '을')) + '은 아래와 같이 비밀유지 계약을 체결한다.</p>' +
          partiesHTML('갑', '을') +
          '<div class="ct-body">' +
          '<h2>제1조 (목적)</h2>' +
          '<p>양 당사자가 사업 제휴·거래 협의 과정에서 주고받는 정보를 보호하기 위한 것이다.</p>' +
          '<h2>제2조 (비밀정보의 범위)</h2>' +
          '<div class="ct-pre">' + esc(blank(scope, '서면·전자·구두로 제공된 기술자료, 단가와 거래조건, 고객·공급처 정보, 사업계획 등 공개되지 않은 정보')) + '</div>' +
          '<p>다음은 비밀정보에서 제외한다. ① 이미 공개된 정보 ② 제공받기 전에 정당하게 보유하고 있던 정보 ③ 제3자로부터 적법하게 받은 정보 ④ 비밀정보 없이 독자적으로 개발한 정보</p>' +
          '<h2>제3조 (의무)</h2>' +
          '<p>정보를 받은 당사자는 비밀정보를 이 계약의 목적에만 쓰고, 업무상 필요한 최소한의 인원에게만 알리며, 제3자에게 제공하거나 누설하지 않는다.</p>' +
          '<h2>제4조 (기간)</h2>' +
          '<p>이 계약은 ' + dateKo(date) + '부터 효력이 생기고, 비밀유지 의무는 계약이 끝난 뒤 ' + (termYears > 0 ? termYears : '３') + '년간 존속한다.</p>' +
          '<h2>제5조 (반환·파기)</h2>' +
          '<p>목적이 끝나면 상대방의 요청에 따라 비밀정보를 반환하거나 파기하고, 그 사실을 알린다.</p>' +
          '<h2>제6조 (손해배상)</h2>' +
          '<p>이 계약을 어겨 상대방에게 손해가 생기면 그 손해를 배상한다.</p>' +
          '<h2>제7조 (기타)</h2>' +
          '<p>이 계약은 서면 합의로 변경하며, 분쟁은 상호 협의로 해결하고 협의가 되지 않으면 관할 법원에 제기한다.</p>' +
          '</div>' +
          '<p style="text-align:center;margin-top:18px">' + dateKo(date) + '</p>' +
          signHTML(gName || '갑', eName || '을');
      }

      doc.innerHTML = head + body;
    }

    if (tplEl) {
      tplEl.addEventListener('change', function () {
        showFields(tplEl.value);
        render();
      });
      showFields(tplEl.value);
    }
    $$('#c-form input, #c-form textarea, #c-form select').forEach(function (el) {
      el.addEventListener('input', render);
      el.addEventListener('change', render);
    });
    var dEl = $('#c-date');
    if (dEl && !dEl.value) dEl.value = isoToday();

    var cBtn = $('#c-copy');
    if (cBtn) cBtn.addEventListener('click', function () {
      copyText(doc.innerText).then(function () {
        msg($('#c-msg'), '계약서 본문을 복사했습니다. 워드·한글에 붙여 넣어 서식을 다듬으세요.', true);
      }).catch(function () {
        msg($('#c-msg'), '복사하지 못했습니다. 본문을 직접 선택해 복사해 주세요.', false);
      });
    });
    var pBtn = $('#c-print');
    if (pBtn) pBtn.addEventListener('click', function () { printSheet(doc); });
    var hBtn = $('#c-hwp');
    if (hBtn) hBtn.addEventListener('click', function () {
      copyText(doc.innerText).then(function () {
        msg($('#c-msg'), '본문을 복사했습니다. 한글(HWP)에서 붙여 넣으면 서식 없이 편집할 수 있습니다.', true);
      }).catch(function () {
        msg($('#c-msg'), '복사하지 못했습니다. 본문을 직접 선택해 복사해 주세요.', false);
      });
    });

    render();
  }

  /* =========================================================
     ⑤ 무역서식 (PI · CI · PL)
  ========================================================= */
  var TDOC = {
    pi: { label: 'PROFORMA INVOICE', noLabel: 'PI No.', prefix: 'PI' },
    ci: { label: 'COMMERCIAL INVOICE', noLabel: 'Invoice No.', prefix: 'CI' },
    pl: { label: 'PACKING LIST', noLabel: 'Packing List No.', prefix: 'PL' }
  };
  var T = {
    type: 'pi',
    items: [
      { desc: 'Recycled Polycarbonate Pellet (rPC, Natural)', hs: '3907.40', qty: 20000, unit: 'KG', price: 1.2,
        marks: 'OO/SEOUL/NOS.1-800', pkgs: 800, nw: 20000, gw: 20600, cbm: 32.4 },
      { desc: 'Recycled PP Pellet (rPP, Black)', hs: '3902.10', qty: 10000, unit: 'KG', price: 0.95,
        marks: 'OO/SEOUL/NOS.801-1200', pkgs: 400, nw: 10000, gw: 10300, cbm: 16.2 }
    ]
  };

  function money(v) {
    if (!isFinite(v)) return '–';
    return (Math.round(v * 100) / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  function qtyFmt(v) {
    if (!isFinite(v)) return '';
    return (Math.round(v * 1000) / 1000).toLocaleString('en-US', { maximumFractionDigits: 3 });
  }
  function kpiCard(k, v, d, hi) {
    return '<div class="bz-kpi' + (hi ? ' hi' : '') + '"><span class="k">' + esc(k) + '</span>' +
      '<span class="v">' + esc(v) + '</span><span class="d">' + esc(d) + '</span></div>';
  }
  function tradeTotals() {
    var s = { amount: 0, qty: 0, pkgs: 0, nw: 0, gw: 0, cbm: 0, n: 0 };
    T.items.forEach(function (it) {
      var q = Number(it.qty) || 0, p = Number(it.price) || 0;
      if (String(it.desc || '').trim() || q || p || Number(it.pkgs) || Number(it.nw)) s.n++;
      s.qty += q;
      s.amount += q * p;
      s.pkgs += Number(it.pkgs) || 0;
      s.nw += Number(it.nw) || 0;
      s.gw += Number(it.gw) || 0;
      s.cbm += Number(it.cbm) || 0;
    });
    return s;
  }

  function tradeCols(type) {
    if (type === 'pl') {
      return [
        { f: 'marks', h: 'Marks &amp; Nos', w: 118, t: 'text' },
        { f: 'desc', h: 'Description of Goods', t: 'text', ph: '품명(영문)' },
        { f: 'pkgs', h: 'Cartons / Pkgs', w: 74, t: 'number', step: '1' },
        { f: 'nw', h: 'N.W. (kg)', w: 76, t: 'number', step: '0.1' },
        { f: 'gw', h: 'G.W. (kg)', w: 76, t: 'number', step: '0.1' },
        { f: 'cbm', h: 'CBM', w: 66, t: 'number', step: '0.001' }
      ];
    }
    return [
      { f: 'desc', h: 'Description of Goods', t: 'text', ph: '품명(영문)' },
      { f: 'hs', h: 'HS Code', w: 86, t: 'text', ph: '0000.00' },
      { f: 'qty', h: 'Quantity', w: 82, t: 'number', step: '1' },
      { f: 'unit', h: 'Unit', w: 62, t: 'text', ph: 'KG' },
      { f: 'price', h: 'Unit Price', w: 84, t: 'number', step: '0.01' },
      { f: 'amount', h: 'Amount', w: 92, compute: true }
    ];
  }

  function renderTradeRows() {
    var wrap = $('#t-items-wrap');
    if (!wrap) return;
    var cols = tradeCols(T.type);
    var head = '<th style="width:26px">No</th>' + cols.map(function (c) {
      return '<th' + (c.w ? ' style="width:' + c.w + 'px"' : '') + '>' + c.h + '</th>';
    }).join('') + '<th style="width:30px"></th>';
    var body = T.items.map(function (it, i) {
      var tds = cols.map(function (c) {
        if (c.compute) {
          return '<td class="amt-cell" data-amount="' + i + '">' +
            money((Number(it.qty) || 0) * (Number(it.price) || 0)) + '</td>';
        }
        return '<td><input type="' + (c.t === 'number' ? 'number' : 'text') + '" data-f="' + c.f + '" data-i="' + i + '"' +
          (c.t === 'number' ? ' min="0" step="' + (c.step || '1') + '" inputmode="decimal"' : '') +
          ' value="' + esc(it[c.f] == null ? '' : it[c.f]) + '" placeholder="' + (c.ph || '') + '">' + '</td>';
      }).join('');
      return '<tr data-row="' + i + '">' +
        '<td style="text-align:center;color:var(--muted);font-family:var(--mono);font-size:11px">' + (i + 1) + '</td>' +
        tds + '<td style="text-align:center"><button type="button" class="del" data-del="' + i + '" aria-label="' + (i + 1) + '번 품목 삭제">×</button></td></tr>';
    }).join('');
    wrap.innerHTML = '<table class="bz-items"><thead><tr>' + head + '</tr></thead><tbody>' + body + '</tbody></table>';
  }

  function renderTradeDoc() {
    var sheet = $('#bzTradeDoc');
    if (!sheet) return;
    var type = T.type, meta = TDOC[type], tt = tradeTotals();
    var cur = val('t-cur') || 'USD';
    var sName = val('t-s-name'), cName = val('t-c-name');
    var date = dateVal('t-date'), valid = dateVal('t-valid');

    var metaRows = '<tr><th>' + meta.noLabel + '</th><td>' + esc(blank(val('t-no'), '—')) + '</td></tr>' +
      '<tr><th>Date</th><td>' + esc(blank(date, '—')) + '</td></tr>';
    if (type === 'pi') metaRows += '<tr><th>Validity</th><td>' + esc(blank(valid, '—')) + '</td></tr>';
    if (type === 'pl' && val('t-ref')) metaRows += '<tr><th>Invoice No.</th><td>' + esc(val('t-ref')) + '</td></tr>';
    if (type === 'ci' && val('t-lc')) metaRows += '<tr><th>L/C No.</th><td>' + esc(val('t-lc')) + '</td></tr>';
    metaRows += '<tr><th>Currency</th><td>' + esc(cur) + '</td></tr>';

    var expHTML = '<div class="td-exp"><b>SHIPPER / EXPORTER</b>' +
      '<div class="nm">' + esc(blank(sName, '—')) + '</div>' +
      (val('t-s-addr') ? '<p>' + esc(val('t-s-addr')) + '</p>' : '') +
      ((val('t-s-tel') || val('t-s-mail')) ? '<p>' + esc([val('t-s-tel'), val('t-s-mail')].filter(Boolean).join(' · ')) + '</p>' : '') +
      (val('t-s-rep') ? '<p>Attn: ' + esc(val('t-s-rep')) + '</p>' : '') +
      '</div>';

    var consHTML = '<div><h4>CONSIGNEE</h4>' +
      '<div class="nm">' + esc(blank(cName, '—')) + '</div>' +
      (val('t-c-addr') ? '<p>' + esc(val('t-c-addr')) + '</p>' : '') +
      ((val('t-c-rep') || val('t-c-tel')) ? '<p>' + esc(['Attn: ' + val('t-c-rep'), 'Tel ' + val('t-c-tel')].filter(function (x) { return x.trim() !== 'Attn:' && x.trim() !== 'Tel'; }).join(' · ')) + '</p>' : '') +
      '</div>';

    var notifyHTML = '<div><h4>NOTIFY PARTY</h4>' +
      '<div class="nm">' + esc(blank(val('t-n-name'), 'SAME AS CONSIGNEE')) + '</div>' +
      '<p>' + esc(blank(val('t-n-addr') || val('t-c-addr'), '')) + '</p></div>';

    var ship = [];
    if (type === 'pl') {
      ship.push(['Invoice No.', val('t-ref')]);
      ship.push(['Vessel / Flight', val('t-vessel')]);
      ship.push(['B/L No.', val('t-bl')]);
    } else {
      ship.push(['Incoterms 2020', val('t-inco')]);
      ship.push(['Port of Loading', val('t-pol')]);
      ship.push(['Port of Discharge', val('t-pod')]);
      if (type === 'pi') {
        ship.push(['Payment Terms', val('t-pay')]);
      } else {
        ship.push(['Vessel / Flight', val('t-vessel')]);
        ship.push(['B/L No.', val('t-bl')]);
        ship.push(['Country of Origin', val('t-origin')]);
      }
    }
    var shipHTML = '<div class="td-ship">' + ship.map(function (p) {
      return '<div><span>' + esc(p[0]) + '</span>' + esc(p[1] || '—') + '</div>';
    }).join('') + '</div>';

    var rows = T.items.filter(function (it) {
      return String(it.desc || '').trim() || Number(it.qty) > 0 || Number(it.price) > 0 ||
        Number(it.pkgs) > 0 || Number(it.nw) > 0;
    });
    if (!rows.length) rows = [{ desc: '', hs: '', qty: 0, unit: '', price: 0, marks: '', pkgs: 0, nw: 0, gw: 0, cbm: 0 }];

    var tableHTML, footHTML;
    if (type === 'pl') {
      var ptrs = rows.map(function (it, i) {
        return '<tr><td class="c">' + (i + 1) + '</td>' +
          '<td class="l">' + esc(it.marks || '') + '</td>' +
          '<td class="l">' + esc(it.desc || '') + '</td>' +
          '<td>' + qtyFmt(it.pkgs) + '</td>' +
          '<td>' + qtyFmt(it.nw) + '</td>' +
          '<td>' + qtyFmt(it.gw) + '</td>' +
          '<td>' + qtyFmt(it.cbm) + '</td></tr>';
      });
      for (var k1 = ptrs.length; k1 < 4; k1++) {
        ptrs.push('<tr><td class="c">' + (k1 + 1) + '</td><td class="l"></td><td class="l"></td><td></td><td></td><td></td><td></td></tr>');
      }
      tableHTML = '<table class="td-table"><thead><tr>' +
        '<th style="width:26px">No</th><th style="width:112px">Marks &amp; Nos</th><th>Description of Goods</th>' +
        '<th style="width:62px">Cartons /<br>Pkgs</th><th style="width:60px">N.W.<br>(kg)</th><th style="width:60px">G.W.<br>(kg)</th><th style="width:54px">CBM</th>' +
        '</tr></thead><tbody>' + ptrs.join('') + '</tbody>' +
        '<tfoot><tr><td colspan="2" class="l">TOTAL</td><td class="l"></td>' +
        '<td>' + qtyFmt(tt.pkgs) + '</td><td>' + qtyFmt(tt.nw) + '</td><td>' + qtyFmt(tt.gw) + '</td>' +
        '<td>' + qtyFmt(Math.round(tt.cbm * 1000) / 1000) + '</td></tr></tfoot></table>';
    } else {
      var trs = rows.map(function (it, i) {
        return '<tr><td class="c">' + (i + 1) + '</td>' +
          '<td class="l">' + esc(it.desc || '') + '</td>' +
          '<td class="c">' + esc(it.hs || '') + '</td>' +
          '<td>' + qtyFmt(it.qty) + '</td>' +
          '<td class="c">' + esc(it.unit || '') + '</td>' +
          '<td>' + money(Number(it.price) || 0) + '</td>' +
          '<td>' + money((Number(it.qty) || 0) * (Number(it.price) || 0)) + '</td></tr>';
      });
      for (var k2 = trs.length; k2 < 3; k2++) {
        trs.push('<tr><td class="c">' + (k2 + 1) + '</td><td class="l"></td><td class="c"></td><td></td><td class="c"></td><td></td><td></td></tr>');
      }
      tableHTML = '<table class="td-table"><thead><tr>' +
        '<th style="width:26px">No</th><th>Description of Goods</th><th style="width:62px">HS Code</th>' +
        '<th style="width:58px">Quantity</th><th style="width:42px">Unit</th>' +
        '<th style="width:66px">Unit Price<br>(' + esc(cur) + ')</th><th style="width:74px">Amount<br>(' + esc(cur) + ')</th>' +
        '</tr></thead><tbody>' + trs.join('') + '</tbody>' +
        '<tfoot><tr><td colspan="2" class="l">TOTAL</td><td class="c"></td>' +
        '<td>' + qtyFmt(tt.qty) + '</td><td class="c"></td><td></td><td>' + money(tt.amount) + '</td></tr></tfoot></table>';
    }
    footHTML = '';

    var bankHTML = '';
    if (type === 'pi') {
      bankHTML = '<div class="td-bank">' +
        '<div><span>BENEFICIARY</span>' + esc(blank(val('t-ben'), '—')) + '</div>' +
        '<div><span>BANK NAME</span>' + esc(blank(val('t-bank'), '—')) + '</div>' +
        '<div><span>ACCOUNT NO.</span>' + esc(blank(val('t-acc'), '—')) + '</div>' +
        '<div><span>SWIFT / BIC</span>' + esc(blank(val('t-swift'), '—')) + '</div>' +
        '</div>';
    }

    var noteText = type === 'pi'
      ? 'This is a proforma invoice, not a tax invoice. Prices and terms are valid until the Validity date above and subject to final confirmation.'
      : type === 'ci'
        ? 'We certify that the goods described above are of ' + (val('t-origin') || 'the stated') + ' origin and that the particulars are true and correct.'
        : 'Packing marks, weights and measurements are declared by the shipper as stated above.';

    sheet.innerHTML =
      '<div class="td-head">' + expHTML +
        '<div class="td-title"><h2>' + meta.label + '</h2>' +
        '<table class="td-meta"><tbody>' + metaRows + '</tbody></table></div>' +
      '</div>' +
      '<div class="td-parties' + (type === 'pi' ? '' : ' one') + '">' + consHTML + (type === 'pi' ? notifyHTML : '') + '</div>' +
      shipHTML + tableHTML +
      bankHTML +
      '<div class="td-sign"><div class="box"><b>For and on behalf of</b><div>' + esc(blank(sName, '—')) + '</div>' +
        '<div class="line">Authorized Signature</div></div></div>' +
      '<p class="td-note">' + esc(noteText) + '</p>';

    if (type === 'pl') {
      setHTML('t-kpis',
        kpiCard('TOTAL CARTONS', qtyFmt(tt.pkgs) + ' CTNS', '카톤·포장 수 합계') +
        kpiCard('NET WEIGHT', qtyFmt(tt.nw) + ' kg', '포장 제외 순중량') +
        kpiCard('GROSS WEIGHT', qtyFmt(tt.gw) + ' kg', '포장 포함 총중량') +
        kpiCard('TOTAL CBM', qtyFmt(Math.round(tt.cbm * 1000) / 1000) + ' CBM', '용적 합계', true));
    } else {
      setHTML('t-kpis',
        kpiCard('TOTAL AMOUNT', cur + ' ' + money(tt.amount), '수량 × 단가 합계', true) +
        kpiCard('TOTAL QUANTITY', qtyFmt(tt.qty), '모든 품목 수량 합계') +
        kpiCard('ITEMS', String(rows.length) + ' 종', '인보이스에 실리는 품목') +
        kpiCard('INCOTERMS', val('t-inco') || '—', (val('t-pol') || '—') + ' → ' + (val('t-pod') || '—')));
    }
  }

  function initTrade() {
    var sheet = $('#bzTradeDoc');
    if (!sheet) return;

    var dEl = $('#t-date');
    if (dEl && !dEl.value) dEl.value = isoToday();
    var vEl = $('#t-valid');
    if (vEl && !vEl.value) vEl.value = addDays(dEl ? dEl.value : isoToday(), 30);

    var nEl = $('#t-no');
    var d = new Date();
    var stamp = d.getFullYear() + String(d.getMonth() + 1).padStart(2, '0') + String(d.getDate()).padStart(2, '0');
    function setDefaultNo() {
      if (nEl && !nEl.dataset.dirty) nEl.value = TDOC[T.type].prefix + '-' + stamp + '-01';
    }
    if (nEl) nEl.addEventListener('input', function () { nEl.dataset.dirty = '1'; });
    setDefaultNo();

    function showTradeFields(type) {
      $$('#bz-panel-trade-docs [data-tonly]').forEach(function (el) {
        var list = el.getAttribute('data-tonly').split(/\s+/);
        el.hidden = list.indexOf(type) === -1;
      });
      var hint = $('#t-no-hint');
      if (hint) hint.textContent = TDOC[type].noLabel;
      var ih = $('#t-items-hint');
      if (ih) ih.textContent = type === 'pl' ? '카톤·중량·CBM 합계 자동' : '수량 × 단가 → Amount 자동';
      var ino = $('#t-items-no');
      if (ino) ino.textContent = type === 'pi' ? '04' : '03';
    }

    function selectType(type) {
      if (!TDOC[type]) return;
      T.type = type;
      $$('[data-tdoc]').forEach(function (x) {
        x.setAttribute('aria-pressed', x.getAttribute('data-tdoc') === type ? 'true' : 'false');
      });
      if (type === 'pl' && !val('t-ref')) {
        var refEl = $('#t-ref');
        if (refEl) refEl.value = 'CI-' + stamp + '-01';
      }
      showTradeFields(type);
      setDefaultNo();
      renderTradeRows();
      renderTradeDoc();
      /* 주소도 서식까지 담아 둡니다 — 새로고침·공유해도 같은 서식이 열립니다 */
      if (history.replaceState && location.hash !== '#trade-' + type) {
        history.replaceState(null, '', '#trade-' + type);
      }
    }

    $$('[data-tdoc]').forEach(function (b) {
      b.addEventListener('click', function () {
        selectType(b.getAttribute('data-tdoc'));
      });
    });
    tradeApi = { setType: selectType };

    var wrap = $('#t-items-wrap');
    if (wrap) {
      wrap.addEventListener('input', function (e) {
        var t = e.target;
        if (!t || !t.getAttribute) return;
        var i = parseInt(t.getAttribute('data-i'), 10);
        var f = t.getAttribute('data-f');
        if (isNaN(i) || !f || !T.items[i]) return;
        if (t.type === 'number') {
          var v = parseFloat(t.value);
          T.items[i][f] = isFinite(v) ? v : 0;
          if (f === 'qty' || f === 'price') {
            var cell = wrap.querySelector('[data-amount="' + i + '"]');
            if (cell) cell.textContent = money((Number(T.items[i].qty) || 0) * (Number(T.items[i].price) || 0));
          }
        } else {
          T.items[i][f] = t.value;
        }
        renderTradeDoc();
      });
      wrap.addEventListener('click', function (e) {
        var btn = e.target.closest ? e.target.closest('[data-del]') : null;
        if (!btn) return;
        var i = parseInt(btn.getAttribute('data-del'), 10);
        if (T.items.length <= 1) {
          T.items[0] = { desc: '', hs: '', qty: 0, unit: 'KG', price: 0, marks: '', pkgs: 0, nw: 0, gw: 0, cbm: 0 };
        } else {
          T.items.splice(i, 1);
        }
        renderTradeRows();
        renderTradeDoc();
      });
    }

    var addBtn = $('#t-add');
    if (addBtn) addBtn.addEventListener('click', function () {
      T.items.push({ desc: '', hs: '', qty: 0, unit: 'KG', price: 0, marks: '', pkgs: 0, nw: 0, gw: 0, cbm: 0 });
      renderTradeRows();
      renderTradeDoc();
      var inputs = $$('#t-items-wrap [data-f="desc"]');
      var last = inputs[inputs.length - 1];
      if (last) last.focus();
    });

    $$('#bz-panel-trade-docs input, #bz-panel-trade-docs select').forEach(function (el) {
      if (el.getAttribute('data-f')) return;
      el.addEventListener('input', renderTradeDoc);
      el.addEventListener('change', renderTradeDoc);
    });

    var pBtn = $('#t-print');
    if (pBtn) pBtn.addEventListener('click', function () { printSheet(sheet); });
    var cBtn = $('#t-copy');
    if (cBtn) cBtn.addEventListener('click', function () {
      copyText(sheet.innerText).then(function () {
        msg($('#t-msg'), '문서 내용을 복사했습니다. 메일·워드에 붙여 넣으세요.', true);
      }).catch(function () {
        msg($('#t-msg'), '복사하지 못했습니다. 문서를 직접 선택해 복사해 주세요.', false);
      });
    });

    showTradeFields('pi');
    renderTradeRows();
    renderTradeDoc();
  }

  /* ---------------------------------------------------------
     시작
  --------------------------------------------------------- */
  function init() {
    initTabs();
    initQuote();
    initMargin();
    initImport();
    initContract();
    initTrade();
    /* 주소에 #trade-ci 같은 해시가 있으면 그 서식까지 열고 그 위치로 이동합니다 */
    applyHash(true);
    window.addEventListener('hashchange', function () { applyHash(true); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
