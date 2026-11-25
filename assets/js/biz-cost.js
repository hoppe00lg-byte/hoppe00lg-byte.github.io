/* =========================================================
   INSIGHT BRIEF — ⑥ 원가·자금 계산기 4종 (biz.html)
   01 수입 도착원가·관세   02 6개월 자금흐름·대출 상환
   03 손익분기 그래프      04 외주 적정단가
   모든 계산은 브라우저 안에서만 하고 서버로 보내지 않습니다.
   문구는 이 파일 안의 4개 언어 표(STR)에서 직접 꺼내 씁니다.
   ========================================================= */
(function () {
  'use strict';

  var html = document.documentElement;
  var raw = (html.getAttribute('lang') || 'ko').toLowerCase();
  var L = /^en/.test(raw) ? 'en' : /^zh/.test(raw) ? 'zh' : /^ja/.test(raw) ? 'ja' : 'ko';

  var STR = {
    ko: {
      'u.krw': '원', 'u.ea': '개', 'u.mo': '{0}개월', 'u.mo_plain': '{0}개월', 'u.h': '시간', 'u.day': '일',
      'ld.fob': '운임·보험 별도', 'ld.cif': '단가에 포함(CIF)',
      'ld.taxd': '관세 {0} · 부가세 {1}',
      'ld.sell.d': '목표 마진 {0} 기준',
      'ld.profit.d': '권장 판매가 기준 · 마진 {0}',
      'ld.goods': '물품대금', 'ld.freight': '국제운임', 'ld.ins': '보험료',
      'ld.cifv': '과세가격(CIF)', 'ld.duty': '관세', 'ld.vat': '수입 부가세',
      'ld.vat.sub': '매입세액 공제 대상', 'ld.clear': '통관비', 'ld.inland': '내륙운송비',
      'ld.total': '총 도착원가', 'ld.real': '실질 도착원가', 'ld.real.sub': '부가세 제외',
      'ld.lg.goods': '물품대금', 'ld.lg.logi': '운임·보험', 'ld.lg.duty': '관세',
      'ld.lg.vat': '부가세', 'ld.lg.etc': '통관·운송',
      'ld.warn.margin': '목표 마진율은 100% 미만이어야 합니다. 90% 아래로 낮춰 다시 계산하세요.',
      'ld.warn.qty': '수량이 0이라 개당 원가를 계산할 수 없습니다. 총 개수를 넣어 주세요.',
      'cf.now': '현재',
      'cf.min.d': '가장 낮은 달: {0}',
      'cf.short.none': '없음',
      'cf.warn': '{0}에 잔액이 {1} 부족합니다. 그 달까지 필요한 금액을 미리 마련하거나, 대출 기간을 늘리거나, 고정비·변동비를 줄여야 합니다.',
      'cf.chart.note': '6개월 · {0}',
      'cf.mono.start': '기초',
      'be.cm.d': '단가 − 변동비',
      'be.safe.d': '목표 판매량 {0} 기준',
      'be.slider.out': '{0}개',
      'be.c.profit.d': '매출 − 총비용',
      'be.tag.bep': '손익분기 {0}개',
      'be.warn': '단위당 변동비가 판매 단가보다 큽니다. 이 조건에서는 한 개 팔 때마다 {0}씩 손실이 늘어 손익분기가 없습니다.',
      'be.warn.noq': '고정비가 0이라 손익분기 수량이 0개입니다.',
      'rt.rec.d': '버퍼 {0}',
      'rt.bill.d': '{0} × {1} × {2}',
      'rt.quote.d': '버퍼 {0} 포함',
      'rt.profit': '목표 순이익', 'rt.overhead': '간접비', 'rt.tax': '세금·수수료',
      'rt.need': '필요 매출', 'rt.hours': '청구 가능 시간', 'rt.minrate': '최소 시간당 단가',
      'rt.recrate': '권장 시간당 단가',
      'rt.n.profit': '세후 목표', 'rt.n.over': '매달 고정 지출', 'rt.n.tax': '{0} 적용',
      'rt.n.need': '세전 기준', 'rt.n.hours': '월 합계', 'rt.n.min': '이 아래면 손해', 'rt.n.rec': '버퍼 포함',
      'rt.warn': '청구 가능 시간이 0입니다. 작업일·작업시간·청구 가능 비율을 확인하세요.',
      'dash': '–'
    },
    en: {
      'u.krw': 'KRW', 'u.ea': 'ea', 'u.mo': 'M{0}', 'u.mo_plain': '{0} mo', 'u.h': 'h', 'u.day': 'd',
      'ld.fob': 'Freight & insurance separate', 'ld.cif': 'Included in unit price (CIF)',
      'ld.taxd': 'Duty {0} · VAT {1}',
      'ld.sell.d': 'At {0} target margin',
      'ld.profit.d': 'At this price · margin {0}',
      'ld.goods': 'Goods', 'ld.freight': 'Freight', 'ld.ins': 'Insurance',
      'ld.cifv': 'CIF customs value', 'ld.duty': 'Duty', 'ld.vat': 'Import VAT',
      'ld.vat.sub': 'Recoverable input VAT', 'ld.clear': 'Customs fees', 'ld.inland': 'Inland transport',
      'ld.total': 'Total landed cost', 'ld.real': 'Net landed cost', 'ld.real.sub': 'Excl. VAT',
      'ld.lg.goods': 'Goods', 'ld.lg.logi': 'Freight & insurance', 'ld.lg.duty': 'Duty',
      'ld.lg.vat': 'VAT', 'ld.lg.etc': 'Customs & delivery',
      'ld.warn.margin': 'The target margin must be under 100%. Set it below 90% and recalculate.',
      'ld.warn.qty': 'Quantity is zero, so the unit cost cannot be computed. Enter the total units.',
      'cf.now': 'Now',
      'cf.min.d': 'Lowest month: {0}',
      'cf.short.none': 'None',
      'cf.warn': 'Cash falls short by {1} in {0}. Raise the cash needed before then, extend the loan term, or cut fixed and variable costs.',
      'cf.chart.note': '6 months · {0}',
      'cf.mono.start': 'Start',
      'be.cm.d': 'Price − variable cost',
      'be.safe.d': 'At {0} target units',
      'be.slider.out': '{0} ea',
      'be.c.profit.d': 'Revenue − total cost',
      'be.tag.bep': 'BEP {0} ea',
      'be.warn': 'Variable cost per unit is higher than the selling price. Every unit sold loses {0}, so there is no break-even point.',
      'be.warn.noq': 'Fixed cost is zero, so the break-even quantity is zero.',
      'rt.rec.d': '{0} buffer',
      'rt.bill.d': '{0} × {1} × {2}',
      'rt.quote.d': '{0} buffer included',
      'rt.profit': 'Target net profit', 'rt.overhead': 'Overhead', 'rt.tax': 'Tax & fees',
      'rt.need': 'Revenue required', 'rt.hours': 'Billable hours', 'rt.minrate': 'Minimum hourly rate',
      'rt.recrate': 'Recommended hourly rate',
      'rt.n.profit': 'After-tax target', 'rt.n.over': 'Fixed monthly cost', 'rt.n.tax': '{0} applied',
      'rt.n.need': 'Pre-tax', 'rt.n.hours': 'Monthly total', 'rt.n.min': 'Below this you lose', 'rt.n.rec': 'Buffer included',
      'rt.warn': 'Billable hours are zero. Check working days, hours per day and the billable ratio.',
      'dash': '–'
    },
    zh: {
      'u.krw': '韩元', 'u.ea': '个', 'u.mo': '第{0}个月', 'u.mo_plain': '{0}个月', 'u.h': '小时', 'u.day': '天',
      'ld.fob': '运费与保险另计', 'ld.cif': '已含在单价中(CIF)',
      'ld.taxd': '关税 {0} · 增值税 {1}',
      'ld.sell.d': '按目标毛利率 {0}',
      'ld.profit.d': '按此售价 · 毛利率 {0}',
      'ld.goods': '货款', 'ld.freight': '国际运费', 'ld.ins': '保险费',
      'ld.cifv': '完税价格(CIF)', 'ld.duty': '关税', 'ld.vat': '进口增值税',
      'ld.vat.sub': '可抵扣进项税额', 'ld.clear': '清关费', 'ld.inland': '内陆运输费',
      'ld.total': '总到岸成本', 'ld.real': '实际到岸成本', 'ld.real.sub': '不含增值税',
      'ld.lg.goods': '货款', 'ld.lg.logi': '运费与保险', 'ld.lg.duty': '关税',
      'ld.lg.vat': '增值税', 'ld.lg.etc': '清关与运输',
      'ld.warn.margin': '目标毛利率必须低于 100%。请调到 90% 以下再计算。',
      'ld.warn.qty': '数量为 0，无法计算单位成本。请输入总件数。',
      'cf.now': '当前',
      'cf.min.d': '最低月份：{0}',
      'cf.short.none': '无',
      'cf.warn': '{0}现金缺口 {1}。请提前准备这笔资金，或延长贷款期限，或压缩固定成本与变动成本。',
      'cf.chart.note': '6 个月 · {0}',
      'cf.mono.start': '期初',
      'be.cm.d': '单价 − 单位变动成本',
      'be.safe.d': '按目标销量 {0}',
      'be.slider.out': '{0} 个',
      'be.c.profit.d': '收入 − 总成本',
      'be.tag.bep': '盈亏平衡 {0} 个',
      'be.warn': '单位变动成本高于售价。此条件下每卖一个就亏损 {0}，不存在盈亏平衡点。',
      'be.warn.noq': '固定成本为 0，盈亏平衡销量为 0 个。',
      'rt.rec.d': '缓冲 {0}',
      'rt.bill.d': '{0} × {1} × {2}',
      'rt.quote.d': '含 {0} 缓冲',
      'rt.profit': '目标净利润', 'rt.overhead': '间接费用', 'rt.tax': '税费与手续费',
      'rt.need': '所需营业额', 'rt.hours': '可计费工时', 'rt.minrate': '最低时薪报价',
      'rt.recrate': '建议时薪报价',
      'rt.n.profit': '税后目标', 'rt.n.over': '每月固定支出', 'rt.n.tax': '按 {0} 计', 
      'rt.n.need': '税前口径', 'rt.n.hours': '每月合计', 'rt.n.min': '低于此价即亏损', 'rt.n.rec': '含缓冲',
      'rt.warn': '可计费工时为 0。请检查工作日、每日工时与可计费比例。',
      'dash': '–'
    },
    ja: {
      'u.krw': 'ウォン', 'u.ea': '個', 'u.mo': '{0}か月', 'u.mo_plain': '{0}か月', 'u.h': '時間', 'u.day': '日',
      'ld.fob': '運賃・保険は別建て', 'ld.cif': '単価に含む(CIF)',
      'ld.taxd': '関税 {0} · 付加価値税 {1}',
      'ld.sell.d': '目標マージン {0} 基準',
      'ld.profit.d': 'この価格で · マージン {0}',
      'ld.goods': '商品代金', 'ld.freight': '国際運賃', 'ld.ins': '保険料',
      'ld.cifv': '課税価格(CIF)', 'ld.duty': '関税', 'ld.vat': '輸入付加価値税',
      'ld.vat.sub': '仕入税額控除の対象', 'ld.clear': '通関費用', 'ld.inland': '内陸輸送費',
      'ld.total': '総着荷コスト', 'ld.real': '実質着荷コスト', 'ld.real.sub': '付加価値税を除く',
      'ld.lg.goods': '商品代金', 'ld.lg.logi': '運賃・保険', 'ld.lg.duty': '関税',
      'ld.lg.vat': '付加価値税', 'ld.lg.etc': '通関・輸送',
      'ld.warn.margin': '目標マージンは 100% 未満にしてください。90% 以下にして再計算してください。',
      'ld.warn.qty': '数量が 0 のため 1 個あたりのコストを計算できません。総個数を入力してください。',
      'cf.now': '現在',
      'cf.min.d': '最低の月：{0}',
      'cf.short.none': 'なし',
      'cf.warn': '{0}に残高が {1} 不足します。その月までに資金を用意するか、返済期間を延ばすか、固定費・変動費を削ってください。',
      'cf.chart.note': '6 か月 · {0}',
      'cf.mono.start': '期首',
      'be.cm.d': '単価 − 変動費',
      'be.safe.d': '目標販売量 {0} 基準',
      'be.slider.out': '{0} 個',
      'be.c.profit.d': '売上 − 総費用',
      'be.tag.bep': '損益分岐 {0} 個',
      'be.warn': '1 個あたりの変動費が販売単価を上回っています。売るほど {0} ずつ損をするため損益分岐点はありません。',
      'be.warn.noq': '固定費が 0 のため損益分岐数量は 0 個です。',
      'rt.rec.d': 'バッファ {0}',
      'rt.bill.d': '{0} × {1} × {2}',
      'rt.quote.d': 'バッファ {0} 込み',
      'rt.profit': '目標純利益', 'rt.overhead': '間接費', 'rt.tax': '税金・手数料',
      'rt.need': '必要売上', 'rt.hours': '請求可能時間', 'rt.minrate': '最低時間単価',
      'rt.recrate': '推奨時間単価',
      'rt.n.profit': '税引後目標', 'rt.n.over': '毎月の固定支出', 'rt.n.tax': '{0} で計算',
      'rt.n.need': '税引前', 'rt.n.hours': '月合計', 'rt.n.min': 'これ以下は赤字', 'rt.n.rec': 'バッファ込み',
      'rt.warn': '請求可能時間が 0 です。稼働日・1 日の稼働時間・請求可能比率を確認してください。',
      'dash': '–'
    }
  }[L];

  function T(key, a, b, c) {
    var s = STR[key] != null ? STR[key] : key;
    if (a != null) s = s.replace('{0}', a);
    if (b != null) s = s.replace('{1}', b);
    if (c != null) s = s.replace('{2}', c);
    return s;
  }

  var LOC = { ko: 'ko-KR', en: 'en-US', zh: 'zh-CN', ja: 'ja-JP' }[L] || 'en-US';

  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function num(id) {
    var el = document.getElementById(id);
    if (!el) return 0;
    var v = parseFloat(String(el.value).replace(/[^0-9.\-]/g, ''));
    return isFinite(v) ? v : 0;
  }
  function setText(id, text) { var el = document.getElementById(id); if (el) el.textContent = text; }
  function setHTML(id, h) { var el = document.getElementById(id); if (el) el.innerHTML = h; }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function round(v, d) {
    var p = Math.pow(10, d == null ? 0 : d);
    return Math.round(v * p) / p;
  }
  function nfmt(v, d) {
    if (!isFinite(v)) return T('dash');
    try {
      return new Intl.NumberFormat(LOC, {
        minimumFractionDigits: d == null ? 0 : d, maximumFractionDigits: d == null ? 0 : d
      }).format(v);
    } catch (e) { return String(round(v, d)); }
  }
  /* 원화 금액 — 한국어는 '1,234원', 그 밖의 언어는 'KRW 1,234' */
  function money(v, d) {
    if (!isFinite(v)) return T('dash');
    var n = nfmt(v, d);
    return L === 'ko' ? n + '원' : 'KRW ' + n;
  }
  /* 숫자 + 단위 — 한국어는 붙여 쓰고, 그 밖의 언어는 띄어 씁니다. */
  function U(v, key) {
    var u = T(key);
    return L === 'ko' ? v + u : v + ' ' + u;
  }
  function pct(v, d) {
    if (!isFinite(v)) return T('dash');
    return nfmt(round(v, d == null ? 1 : d), d == null ? 1 : d) + '%';
  }
  /* 축 눈금용 짧은 표기 */
  function compact(v) {
    var a = Math.abs(v), s = v < 0 ? '-' : '';
    var U = { ko: ['억', '만'], en: ['M', 'K'], zh: ['亿', '万'], ja: ['億', '万'] }[L] || ['M', 'K'];
    if (a >= 1e8) return s + nfmt(round(a / 1e8, 1), 1).replace(/\.0$/, '') + U[0];
    if (a >= 1e4) return s + nfmt(round(a / 1e4, 0)) + U[1];
    return s + nfmt(a);
  }

  /* ---------------------------------------------------------
     하위 탭
  --------------------------------------------------------- */
  var SUBS = ['landed', 'cash', 'bep', 'rate'];

  function initSubTabs() {
    var wrap = $('#bz-panel-cost');
    if (!wrap) return;
    var btns = $$('.bz-subtabs [role="tab"]', wrap);
    function activate(name, push) {
      if (SUBS.indexOf(name) === -1) name = 'landed';
      btns.forEach(function (b) {
        var on = b.getAttribute('data-sub') === name;
        b.setAttribute('aria-selected', on ? 'true' : 'false');
        b.tabIndex = on ? 0 : -1;
      });
      $$('.bz-subpanel', wrap).forEach(function (p) {
        p.hidden = p.getAttribute('data-subpanel') !== name;
      });
      if (push && history.replaceState) {
        history.replaceState(null, '', '#cost' + (name === 'landed' ? '' : '-' + name));
      }
      if (name === 'cash') calcCash();
      if (name === 'bep') calcBep();
    }
    btns.forEach(function (b, i) {
      b.addEventListener('click', function () { activate(b.getAttribute('data-sub'), true); });
      b.addEventListener('keydown', function (e) {
        var k = e.key, next = null;
        if (k === 'ArrowRight' || k === 'ArrowDown') next = btns[(i + 1) % btns.length];
        else if (k === 'ArrowLeft' || k === 'ArrowUp') next = btns[(i - 1 + btns.length) % btns.length];
        else if (k === 'Home') next = btns[0];
        else if (k === 'End') next = btns[btns.length - 1];
        if (next) { e.preventDefault(); next.focus(); activate(next.getAttribute('data-sub'), true); }
      });
    });
    /* #cost·#cost-bep 같은 주소로 바로 들어와도 06 탭이 열리게 합니다. */
    function parentOpen() {
      var tb = document.getElementById('bz-tab-cost');
      if (tb && tb.getAttribute('aria-selected') !== 'true') tb.click();
    }
    var h = (location.hash || '').replace('#', '');
    var m = /^cost(?:-(\w+))?$/.exec(h);
    if (m) { parentOpen(); activate(m[1] || 'landed', false); }
    else activate('landed', false);
    window.addEventListener('hashchange', function () {
      var hh = (location.hash || '').replace('#', '');
      var mm = /^cost(?:-(\w+))?$/.exec(hh);
      if (mm) { parentOpen(); activate(mm[1] || 'landed', false); }
    });
    window.IBZ_SUB = activate;
  }

  /* ---------------------------------------------------------
     선 그래프 (SVG)
  --------------------------------------------------------- */
  function lineChart(host, cfg) {
    if (!host) return null;
    var narrow = (host.clientWidth || 640) < 470;
    var W = narrow ? 430 : 640, H = narrow ? 220 : 250;
    var pad = { l: narrow ? 38 : 44, r: 12, t: 16, b: 26 };
    var iw = W - pad.l - pad.r, ih = H - pad.t - pad.b;
    var yMin = cfg.yMin, yMax = cfg.yMax;
    if (!(yMax > yMin)) { yMax = yMin + 1; }
    var xMax = cfg.xMax || 1;
    function px(x) { return pad.l + (x / xMax) * iw; }
    function py(y) { return pad.t + ih - ((y - yMin) / (yMax - yMin)) * ih; }

    var s = ['<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(cfg.label) + '">'];
    s.push('<rect x="' + pad.l + '" y="' + pad.t + '" width="' + iw + '" height="' + ih + '" fill="transparent" style="pointer-events:all"></rect>');

    /* 가로 눈금 4개 */
    for (var g = 0; g <= 4; g++) {
      var yv = yMin + (yMax - yMin) * g / 4;
      var yy = py(yv);
      s.push('<line class="' + (Math.abs(yv) < 1e-9 ? 'ax' : 'grid') + '" x1="' + pad.l + '" y1="' + yy.toFixed(1) +
        '" x2="' + (W - pad.r) + '" y2="' + yy.toFixed(1) + '"></line>');
      s.push('<text x="' + (pad.l - 6) + '" y="' + (yy + 3).toFixed(1) + '" text-anchor="end">' + esc(compact(yv)) + '</text>');
    }

    /* x축 눈금 */
    (cfg.xTicks || []).forEach(function (t) {
      var xx = px(t.x);
      s.push('<line class="ax" x1="' + xx.toFixed(1) + '" y1="' + (pad.t + ih) + '" x2="' + xx.toFixed(1) + '" y2="' + (pad.t + ih + 3) + '"></line>');
      s.push('<text x="' + xx.toFixed(1) + '" y="' + (H - 8) + '" text-anchor="middle">' + esc(t.label) + '</text>');
    });

    /* 선 */
    (cfg.series || []).forEach(function (ser) {
      var pts = ser.pts.map(function (p) { return px(p[0]).toFixed(1) + ',' + py(p[1]).toFixed(1); }).join(' ');
      s.push('<polyline class="ln ' + (ser.cls || '') + '" points="' + pts + '"></polyline>');
      if (ser.dots) {
        ser.pts.forEach(function (p) {
          s.push('<circle class="dot ' + (ser.dotCls || '') + '" cx="' + px(p[0]).toFixed(1) + '" cy="' + py(p[1]).toFixed(1) +
            '" r="3.2" stroke="' + (ser.color || '#2f6b56') + '"></circle>');
        });
      }
    });

    /* 표시점 (손익분기 등) */
    (cfg.markers || []).forEach(function (mk) {
      var mx = px(mk.x), my = py(mk.y);
      s.push('<circle class="be-point" cx="' + mx.toFixed(1) + '" cy="' + my.toFixed(1) + '" r="4.4"></circle>');
      if (mk.label) {
        var anchor = mx > W * 0.68 ? 'end' : 'start';
        var dx = anchor === 'end' ? -8 : 8;
        s.push('<text class="tag" x="' + (mx + dx).toFixed(1) + '" y="' + (my - 11).toFixed(1) + '" text-anchor="' + anchor + '">' + esc(mk.label) + '</text>');
      }
    });

    /* 커서(인터랙티브) */
    if (cfg.cursor) {
      s.push('<g id="' + cfg.cursor.id + '" style="display:none">' +
        '<line class="cur" x1="0" y1="' + pad.t + '" x2="0" y2="' + (pad.t + ih) + '"></line>' +
        '<circle class="curdot" cx="0" cy="0" r="4"></circle></g>');
    }

    s.push('</svg>');
    host.innerHTML = s.join('');
    var svg = host.querySelector('svg');
    var geo = { px: px, py: py, W: W, pad: pad, iw: iw, ih: ih, xMax: xMax };
    if (cfg.cursor) {
      svg.addEventListener('pointermove', function (ev) {
        var r = svg.getBoundingClientRect();
        var vx = (ev.clientX - r.left) / r.width * W;
        var xr = Math.max(0, Math.min(1, (vx - pad.l) / iw));
        cfg.cursor.move(xr * xMax, geo);
      });
      svg.addEventListener('pointerleave', function () { cfg.cursor.leave(geo); });
      svg.addEventListener('pointerdown', function (ev) {
        var r = svg.getBoundingClientRect();
        var vx = (ev.clientX - r.left) / r.width * W;
        var xr = Math.max(0, Math.min(1, (vx - pad.l) / iw));
        cfg.cursor.move(xr * xMax, geo);
        if (cfg.cursor.pick) cfg.cursor.pick(xr * xMax);
      });
    }
    return geo;
  }

  /* =========================================================
     01 수입 도착원가 · 관세
  ========================================================= */
  var LANDED = { term: 'FOB' };
  var FX_DEFAULT = { USD: 1330.8, CNY: 199.65, EUR: 1450.0, JPY: 8.6, KRW: 1 };

  function calcLanded() {
    var cur = ($('#lc-cur') || {}).value || 'USD';
    var fx = cur === 'KRW' ? 1 : num('lc-fx');
    var price = num('lc-price');
    var qty = num('lc-qty');
    var freight = LANDED.term === 'CIF' ? 0 : num('lc-freight');
    var insRate = LANDED.term === 'CIF' ? 0 : num('lc-ins-rate');
    var dutyRate = num('lc-duty');
    var vatRate = num('lc-vat');
    var clear = num('lc-clear');
    var inland = num('lc-inland');
    var margin = num('lc-margin');

    var goods = price * qty * fx;
    var ins = (goods + freight) * insRate / 100;
    var cif = goods + freight + ins;
    var duty = cif * dutyRate / 100;
    var vat = (cif + duty) * vatRate / 100;
    var total = goods + freight + ins + duty + vat + clear + inland;
    var real = total - vat;
    var unitReal = qty > 0 ? real / qty : NaN;
    var unitTotal = qty > 0 ? total / qty : NaN;
    var sell = margin < 100 ? unitReal / (1 - margin / 100) : NaN;
    var sellVat = isFinite(sell) ? sell * (1 + vatRate / 100) : NaN;
    var profit = isFinite(sell) ? sell - unitReal : NaN;
    var taxShare = total > 0 ? (duty + vat) / total * 100 : NaN;

    setText('lc-cur-unit', cur);
    setText('lc-term-hint', LANDED.term === 'CIF' ? T('ld.cif') : T('ld.fob'));
    var fxEl = $('#lc-fx');
    if (fxEl) { fxEl.readOnly = cur === 'KRW'; }
    ['lc-freight', 'lc-ins-rate'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) { el.readOnly = LANDED.term === 'CIF'; }
    });

    setText('lc-total', money(total));
    setText('lc-unit', isFinite(unitReal) ? (L === 'ko' ? money(unitReal) : 'KRW ' + nfmt(unitReal, unitReal < 100 ? 2 : 0)) : T('dash'));
    setText('lc-tax', money(duty + vat));
    setHTML('lc-tax-d', T('ld.taxd', money(duty), money(vat)));
    setText('lc-sell', isFinite(sell) ? (L === 'ko' ? money(sell) : 'KRW ' + nfmt(sell, sell < 100 ? 2 : 0)) : T('dash'));
    setHTML('lc-sell-d', T('ld.sell.d', pct(margin, 0)));
    setText('lc-sell-vat', isFinite(sellVat) ? (L === 'ko' ? money(sellVat) : 'KRW ' + nfmt(sellVat, sellVat < 100 ? 2 : 0)) : T('dash'));
    setText('lc-profit', isFinite(profit) ? (L === 'ko' ? money(profit) : 'KRW ' + nfmt(profit, profit < 100 ? 2 : 0)) : T('dash'));
    setHTML('lc-profit-d', isFinite(profit) ? T('ld.profit.d', pct(unitReal > 0 ? profit / sell * 100 : NaN, 1)) : '');
    setText('lc-tax-share', isFinite(taxShare) ? pct(taxShare, 1) : T('dash'));

    /* 명세 표 */
    var per = function (v) { return qty > 0 ? (L === 'ko' ? money(v / qty) : 'KRW ' + nfmt(v / qty, (v / qty) < 100 ? 2 : 0)) : '—'; };
    var rows = [
      { k: T('ld.goods'), v: goods, sub: '' },
      { k: T('ld.freight'), v: freight, sub: LANDED.term === 'CIF' ? T('ld.cif') : '' },
      { k: T('ld.ins'), v: ins, sub: LANDED.term === 'CIF' ? T('ld.cif') : pct(insRate, 2) },
      { k: T('ld.cifv'), v: cif, sum: 1 },
      { k: T('ld.duty'), v: duty, sub: pct(dutyRate, 1) },
      { k: T('ld.vat'), v: vat, sub: T('ld.vat.sub') },
      { k: T('ld.clear'), v: clear, sub: '' },
      { k: T('ld.inland'), v: inland, sub: '' },
      { k: T('ld.total'), v: total, sum: 1 },
      { k: T('ld.real'), v: real, sub: T('ld.real.sub'), sum: 1 }
    ];
    setHTML('lc-rows', rows.map(function (r) {
      return '<tr' + (r.sum ? ' class="sum"' : '') + '><td>' + esc(r.k) +
        (r.sub ? ' <span class="sub">' + esc(r.sub) + '</span>' : '') +
        '</td><td class="num">' + money(r.v) + '</td><td class="num">' + per(r.v) + '</td></tr>';
    }).join(''));

    /* 구성 막대 */
    var segs = [
      { v: goods, c: 'b1', k: T('ld.lg.goods') },
      { v: freight + ins, c: 'b2', k: T('ld.lg.logi') },
      { v: duty, c: 'b3', k: T('ld.lg.duty') },
      { v: vat, c: 'b5', k: T('ld.lg.vat') },
      { v: clear + inland, c: 'b4', k: T('ld.lg.etc') }
    ];
    var sum = segs.reduce(function (a, b) { return a + Math.max(0, b.v); }, 0) || 1;
    setHTML('lc-bar', segs.map(function (s2) {
      var w2 = Math.max(0, s2.v) / sum * 100;
      return w2 > 0.4 ? '<i class="' + s2.c + '" style="width:' + w2.toFixed(2) + '%"></i>' : '';
    }).join(''));
    setHTML('lc-legend', segs.map(function (s2) {
      return '<span><i class="' + s2.c + '"></i>' + esc(s2.k) + ' <b>' + pct(s2.v / sum * 100, 1) + '</b></span>';
    }).join(''));

    var w = $('#lc-warn');
    if (w) {
      if (margin >= 100) { w.hidden = false; w.innerHTML = '<b>' + esc(T('ld.warn.margin')) + '</b>'; }
      else if (qty <= 0) { w.hidden = false; w.innerHTML = '<b>' + esc(T('ld.warn.qty')) + '</b>'; }
      else { w.hidden = true; }
    }
  }

  function initLanded() {
    if (!$('#lc-rows')) return;
    $$('[data-lcterm]').forEach(function (b) {
      b.addEventListener('click', function () {
        LANDED.term = b.getAttribute('data-lcterm');
        $$('[data-lcterm]').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
        calcLanded();
      });
    });
    var cur = $('#lc-cur');
    if (cur) cur.addEventListener('change', function () {
      var fx = $('#lc-fx');
      if (fx && FX_DEFAULT[cur.value]) fx.value = FX_DEFAULT[cur.value];
      calcLanded();
    });
    ['lc-fx', 'lc-price', 'lc-qty', 'lc-freight', 'lc-ins-rate', 'lc-duty', 'lc-vat',
      'lc-clear', 'lc-inland', 'lc-margin'].forEach(function (id) {
        var el = document.getElementById(id);
        if (el) el.addEventListener('input', calcLanded);
      });
    calcLanded();
  }

  /* =========================================================
     02 6개월 자금흐름 · 대출 상환
  ========================================================= */
  var CASH = { repay: 'equal' };
  var CASH_MONTHS = 6;

  function amortize(principal, annualRate, term) {
    /* 월별 {interest, principal, balance} 배열 (term 개월) */
    var r = annualRate / 100 / 12;
    var n = Math.max(1, Math.round(term));
    var out = [], bal = principal, i, intr, prin;
    if (principal <= 0) {
      for (i = 0; i < n; i++) out.push({ interest: 0, principal: 0, balance: 0 });
      return out;
    }
    if (CASH.repay === 'bullet') {
      for (i = 0; i < n; i++) {
        intr = bal * r;
        prin = i === n - 1 ? bal : 0;
        bal -= prin;
        out.push({ interest: intr, principal: prin, balance: bal });
      }
      return out;
    }
    if (CASH.repay === 'principal') {
      var fixedP = principal / n;
      for (i = 0; i < n; i++) {
        intr = bal * r;
        prin = Math.min(fixedP, bal);
        bal -= prin;
        out.push({ interest: intr, principal: prin, balance: bal });
      }
      return out;
    }
    /* 원리금균등 */
    var pay = r > 0 ? principal * r / (1 - Math.pow(1 + r, -n)) : principal / n;
    for (i = 0; i < n; i++) {
      intr = bal * r;
      prin = Math.min(pay - intr, bal);
      bal -= prin;
      out.push({ interest: intr, principal: prin, balance: bal });
    }
    return out;
  }

  function calcCash() {
    if (!$('#cf-rows')) return;
    var cash = num('cf-cash');
    var sales0 = num('cf-sales');
    var growth = num('cf-growth') / 100;
    var varRate = num('cf-varrate') / 100;
    var fixed = num('cf-fixed');
    var loan = num('cf-loan');
    var rate = num('cf-rate');
    var term = num('cf-term') || 1;

    var am = amortize(loan, rate, term);
    var bal = cash, rows = [], totalInterest = 0, minBal = cash, minMonth = 0, shortMonths = [];
    for (var m = 1; m <= CASH_MONTHS; m++) {
      var sales = sales0 * Math.pow(1 + growth, m - 1);
      var varCost = sales * varRate;
      var a = am[m - 1] || { interest: 0, principal: 0 };
      var net = sales - varCost - fixed - a.interest - a.principal;
      bal += net;
      totalInterest += a.interest;
      if (bal < minBal) { minBal = bal; minMonth = m; }
      if (bal < 0) shortMonths.push(m);
      rows.push({ m: m, sales: sales, varCost: varCost, fixed: fixed, interest: a.interest, principal: a.principal, net: net, bal: bal });
    }

    setText('cf-end', money(bal));
    setText('cf-min', money(minBal));
    setHTML('cf-min-d', minMonth ? T('cf.min.d', T('u.mo', minMonth)) : '');
    setText('cf-interest', money(totalInterest));
    setText('cf-short', shortMonths.length ? T('u.mo_plain', shortMonths.length) : T('cf.short.none'));
    setText('cf-chart-note', T('cf.chart.note', L === 'ko' ? '원' : 'KRW'));

    var trs = rows.map(function (r) {
      return '<tr' + (r.bal < 0 ? ' class="is-short"' : '') + '>' +
        '<td>' + esc(T('u.mo', r.m)) + '</td>' +
        '<td class="num">' + money(r.sales) + '</td>' +
        '<td class="num">' + money(r.varCost) + '</td>' +
        '<td class="num">' + money(r.fixed) + '</td>' +
        '<td class="num">' + money(r.interest) + '</td>' +
        '<td class="num">' + money(r.principal) + '</td>' +
        '<td class="num' + (r.net < 0 ? ' neg' : '') + '">' + money(r.net) + '</td>' +
        '<td class="num' + (r.bal < 0 ? ' neg' : '') + '"><b>' + money(r.bal) + '</b></td>' +
        '</tr>';
    }).join('');
    setHTML('cf-rows', trs);

    /* 그래프 */
    var pts = [[0, cash]].concat(rows.map(function (r) { return [r.m, r.bal]; }));
    var vals = pts.map(function (p) { return p[1]; });
    var hi = Math.max.apply(null, vals), lo = Math.min.apply(null, vals, 0);
    var spanPad = Math.max(1, (hi - lo) * 0.15);
    lineChart($('#cf-plot'), {
      label: T('cf.chart.note', L === 'ko' ? '원' : 'KRW'),
      xMax: CASH_MONTHS,
      yMin: lo < 0 ? lo - spanPad : 0,
      yMax: hi + spanPad,
      xTicks: pts.map(function (p) { return { x: p[0], label: p[0] === 0 ? T('cf.mono.start') : String(p[0]) }; }),
      series: [{ pts: pts, cls: 'ln-cash', dots: true, color: '#1f2f5b' }]
    });

    var w = $('#cf-warn');
    if (w) {
      if (shortMonths.length) {
        w.hidden = false;
        w.innerHTML = '<b>' + esc(T('cf.warn', T('u.mo', shortMonths[0]), money(Math.abs(minBal)))) + '</b>';
      } else if (minBal < cash * 0.15 && cash > 0) {
        w.hidden = false;
        w.innerHTML = '<b>' + esc(T('cf.min.d', T('u.mo', minMonth))) + '</b> — ' + esc(money(minBal));
      } else { w.hidden = true; }
    }
  }

  function initCash() {
    if (!$('#cf-rows')) return;
    $$('[data-repay]').forEach(function (b) {
      b.addEventListener('click', function () {
        CASH.repay = b.getAttribute('data-repay');
        $$('[data-repay]').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
        calcCash();
      });
    });
    ['cf-cash', 'cf-sales', 'cf-growth', 'cf-varrate', 'cf-fixed', 'cf-loan', 'cf-rate', 'cf-term'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.addEventListener('input', calcCash);
    });
    calcCash();
  }

  /* =========================================================
     03 손익분기 그래프
  ========================================================= */
  function bepValues() {
    var fixed = num('be-fixed');
    var varc = num('be-var');
    var price = num('be-price');
    var qty = num('be-qty');
    var cm = price - varc;
    var bepQ = cm > 0 ? fixed / cm : NaN;
    var bepS = cm > 0 ? bepQ * price : NaN;
    return { fixed: fixed, varc: varc, price: price, qty: qty, cm: cm, bepQ: bepQ, bepS: bepS };
  }

  var BEP_GEO = null;

  function drawBep(selQ) {
    var v = bepValues();
    var xMax = Math.max(isFinite(v.bepQ) ? v.bepQ * 2 : 0, v.qty * 1.2, 10);
    xMax = Math.ceil(xMax / 10) * 10;
    var yMax = Math.max(v.price * xMax, v.fixed + v.varc * xMax) * 1.08;

    var geo = lineChart($('#be-plot'), {
      label: T('be.tag.bep', ''),
      xMax: xMax,
      yMin: 0,
      yMax: yMax,
      xTicks: [0, 0.25, 0.5, 0.75, 1].map(function (f) {
        var x = xMax * f;
        return { x: x, label: nfmt(x, 0) };
      }),
      series: [
        { pts: [[0, 0], [xMax, v.price * xMax]], cls: 'ln-rev' },
        { pts: [[0, v.fixed], [xMax, v.fixed + v.varc * xMax]], cls: 'ln-cost' },
        { pts: [[0, v.fixed], [xMax, v.fixed]], cls: 'ln-fix' }
      ],
      markers: isFinite(v.bepQ) && v.bepQ <= xMax ? [{ x: v.bepQ, y: v.bepQ * v.price, label: T('be.tag.bep', nfmt(Math.ceil(v.bepQ))) }] : [],
      cursor: {
        id: 'be-cur',
        move: function (x) { paintBepCursor(Math.max(0, Math.min(xMax, x)), selQ); },
        leave: function () { paintBepCursor(selQ, selQ); },
        pick: function (x) {
          var sl2 = $('#be-slider');
          if (!sl2) return;
          var step = 10;
          var v2 = Math.round(Math.max(0, Math.min(xMax, x)) / step) * step;
          sl2.value = String(v2);
          drawBep(v2);
        }
      }
    });
    BEP_GEO = geo;
    paintBepCursor(selQ == null ? v.qty : selQ, selQ, geo);
  }

  function paintBepCursor(q, selQ, geo) {
    geo = geo || BEP_GEO;
    var v = bepValues();
    var host = $('#be-plot');
    if (!host || !geo) return;
    var g = host.querySelector('g');
    if (!g) return;
    var x = Math.round(Math.max(0, Math.min(geo.xMax, q)));
    var rev = x * v.price, cost = v.fixed + v.varc * x, profit = rev - cost;
    var cx = geo.px(x), cy = geo.py(rev);
    g.style.display = '';
    var line = g.querySelector('line'), dot = g.querySelector('circle');
    if (line) { line.setAttribute('x1', cx.toFixed(1)); line.setAttribute('x2', cx.toFixed(1)); }
    if (dot) { dot.setAttribute('cx', cx.toFixed(1)); dot.setAttribute('cy', cy.toFixed(1)); }
    setText('be-c-rev', money(rev));
    setText('be-c-cost', money(cost));
    setText('be-c-profit', money(profit));
    var pd = $('#be-c-profit');
    if (pd) pd.style.color = profit < 0 ? 'var(--accent)' : '';
    var so = $('#be-slider-out');
    if (so) so.textContent = T('be.slider.out', nfmt(x, 0));
  }

  function calcBep() {
    if (!$('#be-rows') && !$('#be-plot')) return;
    var v = bepValues();
    setText('be-bepq', isFinite(v.bepQ) ? U(nfmt(Math.ceil(v.bepQ)), 'u.ea') : T('dash'));
    setText('be-beps', isFinite(v.bepS) ? money(v.bepS) : T('dash'));
    setText('be-cm', money(v.cm));
    setHTML('be-cm-d', T('be.cm.d') + (v.price > 0 ? ' · ' + pct(v.cm / v.price * 100, 1) : ''));
    var safe = v.qty > 0 && isFinite(v.bepQ) ? (v.qty - v.bepQ) / v.qty * 100 : NaN;
    setText('be-safe', isFinite(safe) ? pct(safe, 1) : T('dash'));
    setHTML('be-safe-d', T('be.safe.d', nfmt(v.qty, 0)));

    var sl = $('#be-slider');
    if (sl) {
      var xMax = Math.max(isFinite(v.bepQ) ? v.bepQ * 2 : 0, v.qty * 1.2, 10);
      sl.max = String(Math.ceil(xMax / 10) * 10);
      if (+sl.value > +sl.max) sl.value = String(Math.round(+sl.max * 0.75));
    }
    drawBep(sl ? +sl.value : v.qty);

    var w = $('#be-warn');
    if (w) {
      if (v.cm < 0) { w.hidden = false; w.innerHTML = '<b>' + esc(T('be.warn', money(Math.abs(v.cm)))) + '</b>'; }
      else if (v.fixed <= 0) { w.hidden = false; w.innerHTML = '<b>' + esc(T('be.warn.noq')) + '</b>'; }
      else { w.hidden = true; }
    }
  }

  function initBep() {
    if (!$('#be-plot')) return;
    ['be-fixed', 'be-var', 'be-price', 'be-qty'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.addEventListener('input', calcBep);
    });
    var sl = $('#be-slider');
    if (sl) sl.addEventListener('input', function () { drawBep(+sl.value); });
    var host = $('#be-plot');
    if (host) host.addEventListener('pointerdown', function () {
      var g = host.querySelector('svg');
      if (!g) return;
      /* 손가락으로 누른 지점을 슬라이더와 맞춥니다 */
      var svg = host.querySelector('svg');
      if (!svg) return;
      var r = svg.getBoundingClientRect();
    });
    calcBep();
  }

  /* =========================================================
     04 외주 적정단가
  ========================================================= */
  function calcRate() {
    if (!$('#rt-rows')) return;
    var profit = num('rt-profit');
    var overhead = num('rt-overhead');
    var taxRate = num('rt-tax');
    var days = num('rt-days');
    var hours = num('rt-hours');
    var billable = num('rt-billable');
    var project = num('rt-project');
    var buffer = num('rt-buffer');

    var net = profit + overhead;
    var need = taxRate < 100 ? net / (1 - taxRate / 100) : NaN;
    var billHours = days * hours * billable / 100;
    var minRate = billHours > 0 ? need / billHours : NaN;
    var recRate = isFinite(minRate) ? minRate * (1 + buffer / 100) : NaN;
    var floor = isFinite(minRate) ? minRate * project : NaN;
    var quote = isFinite(recRate) ? recRate * project : NaN;
    var perDay = isFinite(recRate) ? recRate * hours : NaN;
    var taxAmt = isFinite(need) ? need - net : NaN;

    function hr(v) { return isFinite(v) ? (L === 'ko' ? money(v) : 'KRW ' + nfmt(v, v < 100 ? 0 : 0)) : T('dash'); }

    setText('rt-min-rate', hr(minRate));
    setText('rt-rec-rate', hr(recRate));
    setHTML('rt-rec-d', T('rt.rec.d', pct(buffer, 0)));
    setText('rt-revenue', money(need));
    setText('rt-billhours', isFinite(billHours) ? U(nfmt(billHours, billHours % 1 ? 1 : 0), 'u.h') : T('dash'));
    setHTML('rt-billhours-d', T('rt.bill.d', U(nfmt(days, 0), 'u.day'), U(nfmt(hours, 1), 'u.h'), pct(billable, 0)));
    setText('rt-floor', money(floor));
    setText('rt-quote', money(quote));
    setHTML('rt-quote-d', T('rt.quote.d', pct(buffer, 0)));
    setText('rt-day', money(perDay));

    var rows = [
      { k: T('rt.profit'), v: money(profit), n: T('rt.n.profit') },
      { k: T('rt.overhead'), v: money(overhead), n: T('rt.n.over') },
      { k: T('rt.tax'), v: money(taxAmt), n: T('rt.n.tax', pct(taxRate, 1)) },
      { k: T('rt.need'), v: money(need), n: T('rt.n.need'), sum: 1 },
      { k: T('rt.hours'), v: isFinite(billHours) ? U(nfmt(billHours, billHours % 1 ? 1 : 0), 'u.h') : T('dash'), n: T('rt.n.hours') },
      { k: T('rt.minrate'), v: hr(minRate), n: T('rt.n.min'), sum: 1 },
      { k: T('rt.recrate'), v: hr(recRate), n: T('rt.n.rec'), sum: 1 }
    ];
    setHTML('rt-rows', rows.map(function (r) {
      return '<tr' + (r.sum ? ' class="sum"' : '') + '><td>' + esc(r.k) + '</td><td class="num">' + esc(r.v) +
        '</td><td><span class="sub" style="display:inline">' + esc(r.n) + '</span></td></tr>';
    }).join(''));

    var w = $('#rt-warn');
    if (w) {
      if (!(billHours > 0)) { w.hidden = false; w.innerHTML = '<b>' + esc(T('rt.warn')) + '</b>'; }
      else { w.hidden = true; }
    }
  }

  function initRate() {
    if (!$('#rt-rows')) return;
    ['rt-profit', 'rt-overhead', 'rt-tax', 'rt-days', 'rt-hours', 'rt-billable', 'rt-project', 'rt-buffer'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.addEventListener('input', calcRate);
    });
    calcRate();
  }

  /* ---------------------------------------------------------
     시작
  --------------------------------------------------------- */
  function init() {
    if (!$('#bz-panel-cost')) return;
    initSubTabs();
    initLanded();
    initCash();
    initBep();
    initRate();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
