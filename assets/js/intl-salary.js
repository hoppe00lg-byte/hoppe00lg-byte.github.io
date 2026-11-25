/* =========================================================
   INSIGHT BRIEF — 국가별 임금·세금 계산기 (/en/ /zh/ /ja/)
   · 미국: 연방/주 최저임금(2026) + FLSA 1.5배 연장근로 + 연방·주세·FICA 실수령
   · 일본: 2026年度(令和8) 地域別最低賃金 + 25%割増残業 + 所得税·住民税·社会保険の手取り
   · 중국: 2026年 主要城市 最低工资 + 150/200/300% 초과근무 + 五险一金·个税 税后
   한국어 페이지에서는 동작하지 않습니다(salary.js 가 그대로 동작).
   ========================================================= */
(function () {
  'use strict';
  var I = window.IB_INTL;
  var wrap = document.querySelector('.sl-wrap');
  if (!I || !wrap) return;
  var L = I.lang;
  var CUR = I.cur;

  function $(s, r) { return (r || document).querySelector(s); }
  function nf(v, d) {
    var n = Number(v || 0);
    return new Intl.NumberFormat(CUR.loc, {
      minimumFractionDigits: d == null ? 0 : d, maximumFractionDigits: d == null ? 0 : d
    }).format(n);
  }
  function money(v, d) { return CUR.sym + nf(v, d); }
  function pct(v) { return (v * 100).toFixed(1) + '%'; }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  var adHTML = (function () {
    var ad = wrap.querySelector('.sl-ad');
    return ad ? ad.outerHTML : '';
  })();

  /* =========================================================
     미국
     ========================================================= */
  var US_STATES = [
    { id: 'federal', name: 'Federal minimum (§7.25)', mw: 7.25, tax: 0 },
    { id: 'CA', name: 'California ($16.90)', mw: 16.90, tax: 0.060 },
    { id: 'NYC', name: 'New York City / Long Island / Westchester ($17.00)', mw: 17.00, tax: 0.060 },
    { id: 'NY', name: 'New York — rest of state ($16.00)', mw: 16.00, tax: 0.055 },
    { id: 'WA', name: 'Washington ($17.13)', mw: 17.13, tax: 0 },
    { id: 'DC', name: 'District of Columbia ($18.40)', mw: 18.40, tax: 0.085 },
    { id: 'MA', name: 'Massachusetts ($15.00)', mw: 15.00, tax: 0.050 },
    { id: 'IL', name: 'Illinois ($15.00)', mw: 15.00, tax: 0.0495 },
    { id: 'NJ', name: 'New Jersey ($15.92)', mw: 15.92, tax: 0.055 },
    { id: 'CO', name: 'Colorado ($15.16)', mw: 15.16, tax: 0.044 },
    { id: 'AZ', name: 'Arizona ($15.15)', mw: 15.15, tax: 0.025 },
    { id: 'OR', name: 'Oregon — Portland metro ($16.80)', mw: 16.80, tax: 0.080 },
    { id: 'FL', name: 'Florida ($15.00)', mw: 15.00, tax: 0 },
    { id: 'TX', name: 'Texas ($7.25 federal rate)', mw: 7.25, tax: 0 },
    { id: 'GA', name: 'Georgia ($7.25 federal rate)', mw: 7.25, tax: 0.054 },
    { id: 'PA', name: 'Pennsylvania ($7.25 federal rate)', mw: 7.25, tax: 0.0307 },
    { id: 'OH', name: 'Ohio ($11.00)', mw: 11.00, tax: 0.035 },
    { id: 'MI', name: 'Michigan ($13.73)', mw: 13.73, tax: 0.0425 },
    { id: 'FL2', name: 'Florida — no state income tax', mw: 15.00, tax: 0 },
    { id: 'WA2', name: 'Washington — no state income tax', mw: 17.13, tax: 0 }
  ];
  var US_BRACKETS = {
    single: [[12400, 0.10], [50400, 0.12], [105700, 0.22], [201775, 0.24], [256225, 0.32], [640600, 0.35], [Infinity, 0.37]],
    mfj: [[24800, 0.10], [100800, 0.12], [211400, 0.22], [403550, 0.24], [512450, 0.32], [768700, 0.35], [Infinity, 0.37]]
  };
  var US_STD = { single: 16100, mfj: 32200 };
  var SS_CAP = 184500;

  function usFedTax(taxable, status) {
    var br = US_BRACKETS[status], tax = 0, lower = 0;
    for (var i = 0; i < br.length; i++) {
      if (taxable <= lower) break;
      var upper = br[i][0], rate = br[i][1];
      tax += (Math.min(taxable, upper) - lower) * rate;
      lower = upper;
    }
    return Math.max(0, tax);
  }
  function usFica(gross, status) {
    var ss = Math.min(gross, SS_CAP) * 0.062;
    var med = gross * 0.0145;
    var addl = Math.max(0, gross - (status === 'mfj' ? 250000 : 200000)) * 0.009;
    return { ss: ss, med: med + addl, total: ss + med + addl };
  }

  var US = {
    title: 'US minimum wage, overtime & take-home pay',
    dek: 'Built on the 2026 federal figures: the $7.25 federal minimum, state rates in effect from January 2026, the 2026 IRS brackets (standard deduction $16,100 single / $32,200 joint) and FICA (6.2% Social Security up to $184,500, 1.45% Medicare plus the 0.9% additional Medicare tax above $200,000).',
    min: 'Minimum wage & overtime',
    minLead: 'Overtime under the FLSA is 1.5× the regular rate for hours over 40 in a workweek. Several states also require daily overtime — California, for example, pays 1.5× after 8 hours in a day and 2× after 12.',
    state: 'State / jurisdiction',
    rate: 'Hourly rate',
    hours: 'Regular hours per week',
    otHours: 'Overtime hours per week',
    weekly: 'Weekly gross',
    overtime: 'Overtime premium',
    monthly: 'Monthly gross (×52/12)',
    annual: 'Annual gross',
    take: 'Take-home pay',
    takeLead: 'Enter a gross annual salary. Federal tax uses the 2026 brackets and standard deduction; state tax is an approximate effective rate for a typical income, not a filed return.',
    salary: 'Gross annual salary (USD)',
    filing: 'Filing status',
    single: 'Single',
    mfj: 'Married filing jointly',
    stateTax: 'State (approximate)',
    gross: 'Gross pay',
    federal: 'Federal income tax',
    fica: 'FICA (Social Security + Medicare)',
    stateLine: 'State income tax (estimate)',
    net: 'Net take-home',
    netMonth: 'Net per month',
    netBiweek: 'Net per biweekly paycheck',
    eff: 'Effective total rate',
    note: 'Figures are estimates for planning, not tax advice. Pre-tax 401(k) contributions, health premiums, local taxes and credits are not included. State rates marked “no income tax” are states that levy no wage income tax.'
  };

  /* =========================================================
     일본
     ========================================================= */
  var JP_PREF = [
    { id: 'tokyo', name: '東京都', w: 1280 }, { id: 'kanagawa', name: '神奈川県', w: 1279 },
    { id: 'osaka', name: '大阪府', w: 1231 }, { id: 'saitama', name: '埼玉県', w: 1196 },
    { id: 'chiba', name: '千葉県', w: 1195 }, { id: 'aichi', name: '愛知県', w: 1195 },
    { id: 'kyoto', name: '京都府', w: 1180 }, { id: 'hyogo', name: '兵庫県', w: 1172 },
    { id: 'hokkaido', name: '北海道', w: 1131 }, { id: 'fukuoka', name: '福岡県', w: 1114 },
    { id: 'miyagi', name: '宮城県', w: 1098 }, { id: 'national', name: '全国加重平均', w: 1177 }
  ];
  var JP_BRACKETS = [
    [1950000, 0.05, 0], [3300000, 0.10, 97500], [6950000, 0.20, 427500],
    [9000000, 0.23, 636000], [18000000, 0.33, 1536000], [40000000, 0.40, 2796000],
    [Infinity, 0.45, 4796000]
  ];
  function jpEmploymentDeduction(income) {
    if (income <= 1900000) return 740000;
    if (income <= 2200000) return Math.max(690000, income * 0.30 + 80000);
    if (income <= 3600000) return income * 0.30 + 80000;
    if (income <= 6600000) return income * 0.20 + 440000;
    if (income <= 8500000) return income * 0.10 + 1100000;
    return 1950000;
  }
  function jpIncomeTax(taxable) {
    for (var i = 0; i < JP_BRACKETS.length; i++) {
      if (taxable <= JP_BRACKETS[i][0]) {
        var t = taxable * JP_BRACKETS[i][1] - JP_BRACKETS[i][2];
        return Math.max(0, t * 1.021); /* 復興特別所得税 */
      }
    }
    return 0;
  }
  var JP = {
    title: '最低賃金・残業代・手取り計算',
    dek: '2026年度（令和8年度）の地域別最低賃金（全国加重平均1,177円、東京1,280円）と、2026年度の社会保険料率（東京都・協会けんぽ：健康保険9.85%、介護保険1.62%、厚生年金18.3%、子ども・子育て支援金0.23%）をもとに計算します。',
    min: '最低賃金と残業代',
    minLead: '法定時間外は25%増し、月60時間を超える部分は50%増し、22時〜5時の深夜はさらに25%増しです。法定休日（週1日）の労働は35%増しが原則です。',
    pref: '都道府県',
    rate: '時給（円）',
    hours: '1日の所定労働時間',
    days: '月の勤務日数',
    otHours: '月の法定時間外労働',
    night: 'うち深夜（22時〜5時）',
    monthlyBase: '月の基本給',
    overtime: '残業代（割増分）',
    monthly: '月の総支給',
    annual: '年間の総支給（賞与なし）',
    take: '年収の手取り',
    takeLead: '年収から給与所得控除・基礎控除・社会保険料を引き、所得税（復興特別所得税込み）と住民税を差し引きます。',
    salary: '年収（円）',
    age: '介護保険（40〜64歳）',
    yes: 'あり',
    no: 'なし',
    gross: '額面',
    social: '社会保険料（本人負担）',
    incomeTax: '所得税',
    resident: '住民税（所得割＋均等割）',
    net: '手取り',
    netMonth: '月あたり手取り',
    eff: '控除率の合計',
    note: '概算です。標準報酬月額の等級、健保組合の独自料率、各種控除（扶養・生命保険料など）、賞与は反映していません。基礎控除は令和8年分の本則62万円で計算しています。'
  };

  /* =========================================================
     중국
     ========================================================= */
  var CN_CITIES = [
    { id: 'shanghai', name: '上海', m: 2740, h: 25 },
    { id: 'beijing', name: '北京', m: 2540, h: 27.7 },
    { id: 'shenzhen', name: '深圳', m: 2700, h: 25.4 },
    { id: 'guangzhou', name: '广州', m: 2680, h: 25.4 },
    { id: 'hangzhou', name: '杭州', m: 2660, h: 25 },
    { id: 'nanjing', name: '南京', m: 2660, h: 25 },
    { id: 'suzhou', name: '苏州', m: 2660, h: 25 },
    { id: 'tianjin', name: '天津', m: 2510, h: 26.6 },
    { id: 'dongguan', name: '东莞', m: 2300, h: 21.9 },
    { id: 'foshan', name: '佛山', m: 2300, h: 21.9 }
  ];
  var CN_BRACKETS = [
    [3000, 0.03, 0], [12000, 0.10, 210], [25000, 0.20, 1410], [35000, 0.25, 2660],
    [55000, 0.30, 4410], [80000, 0.35, 7160], [Infinity, 0.45, 15160]
  ];
  function cnTax(monthlyTaxable) {
    if (monthlyTaxable <= 0) return 0;
    for (var i = 0; i < CN_BRACKETS.length; i++) {
      if (monthlyTaxable <= CN_BRACKETS[i][0]) {
        return Math.max(0, monthlyTaxable * CN_BRACKETS[i][1] - CN_BRACKETS[i][2]);
      }
    }
    return 0;
  }
  var CN = {
    title: '最低工资、加班费与税后工资计算',
    dek: '按 2026 年人社部公布的主要城市最低工资标准（上海 2,740 元/月最高，北京 27.7 元/小时最高）和现行个税、五险一金比例计算。',
    min: '最低工资与加班费',
    minLead: '月最低工资适用于全日制用工，小时最低工资适用于非全日制。工作日延长工作时间不低于 150%，休息日不低于 200%，法定节假日不低于 300%。',
    city: '城市',
    rate: '小时工资（元）',
    monthlyWage: '月最低工资',
    hours: '每月计薪时数',
    otWorkday: '工作日加班小时/月',
    otRest: '休息日加班小时/月',
    otHoliday: '法定节假日加班小时/月',
    base: '月基本工资',
    overtime: '加班费合计',
    monthly: '月应发合计',
    annual: '年应发合计（不含年终奖）',
    take: '税后工资',
    takeLead: '应发工资先扣除个人缴纳的五险一金，再按 5,000 元/月起征点和七级超额累进税率计算个税。',
    salaryMode: '输入方式',
    monthlyMode: '月薪',
    annualMode: '年薪',
    amount: '金额（元）',
    fund: '住房公积金比例',
    pension: '养老保险 8%',
    medical: '医疗保险 2% + 3元',
    unemployment: '失业保险 0.5%',
    social: '五险一金合计（个人）',
    gross: '应发',
    tax: '个人所得税',
    net: '税后',
    netAnnual: '税后年薪',
    eff: '扣除比例合计',
    note: '按上海口径计算个人缴纳部分（养老 8%、医疗 2%+3 元、失业 0.5%、公积金可选 5%–12%）。专项附加扣除（子女教育、房贷、租金、赡养老人等）和年终奖单独计税未计入，实际到手可能更高。'
  };

  /* =========================================================
     공통 UI 조각
     ========================================================= */
  function kpi(k, v, d, cls) {
    return '<div class="sl-kpi' + (cls ? ' ' + cls : '') + '"><span class="k">' + esc(k) + '</span>' +
      '<span class="v">' + v + '</span>' + (d ? '<span class="d">' + esc(d) + '</span>' : '') + '</div>';
  }
  function field(label, inner, hint) {
    return '<div class="sl-field"><div class="lbl"><span>' + esc(label) + '</span>' +
      (hint ? '<span class="hint">' + esc(hint) + '</span>' : '') + '</div>' + inner + '</div>';
  }
  function numInput(id, val, attrs) {
    return '<div class="unit"><input type="number" id="' + id + '" inputmode="numeric" ' +
      (attrs || '') + ' value="' + val + '"></div>';
  }
  function select(id, opts, sel) {
    return '<select id="' + id + '">' + opts.map(function (o) {
      return '<option value="' + esc(o[0]) + '"' + (o[0] === sel ? ' selected' : '') + '>' + esc(o[1]) + '</option>';
    }).join('') + '</select>';
  }
  function head(title, dek, badges, kicker) {
    return '<div class="sl-head"><span class="kicker">' + esc(kicker) + '</span><h1>' + esc(title) + '</h1>' +
      '<p class="dek">' + esc(dek) + '</p><div class="sl-badges">' +
      badges.map(function (b) { return '<span>' + esc(b) + '</span>'; }).join('') + '</div></div>';
  }
  function section(id, no, title, mono, lead, panel, out) {
    return '<section class="sl-sec" id="' + id + '"><div class="sl-sec-head">' +
      '<h2><span>' + no + '</span>' + esc(title) + '</h2><span class="mono">' + esc(mono) + '</span></div>' +
      (lead ? '<p class="sl-lead">' + lead + '</p>' : '') +
      '<div class="sl-panel">' + panel + '</div>' +
      '<div class="sl-out" aria-live="polite">' + out + '</div></section>';
  }
  function panelHead(title, hint) {
    return '<div class="sl-panel-head"><h3>' + esc(title) + '</h3><span class="mono">' + esc(hint) + '</span></div>';
  }
  function jump(items) {
    return '<nav class="sl-jump" aria-label="shortcuts">' + items.map(function (it) {
      return '<a href="#' + it[0] + '"><b>' + it[2] + '</b>' + esc(it[1]) + '</a>';
    }).join('') + '</nav>';
  }
  function refs(title, rows) {
    return '<section class="sl-ref"><h2>' + esc(title) + '</h2><ul class="sl-steps">' +
      rows.map(function (r) {
        return '<li><a href="' + esc(r[1]) + '" target="_blank" rel="noopener noreferrer">' + esc(r[0]) + '</a></li>';
      }).join('') + '</ul></section>';
  }

  /* =========================================================
     미국 화면
     ========================================================= */
  function renderUS() {
    var st = US_STATES[0];
    var html = head('US minimum wage, overtime & take-home pay calculator',
      US.dek, ['2026 IRS brackets', '2026 state minimum wages', 'No sign-up', 'Runs in your browser'],
      'FREE TOOL · US PAYROLL');

    html += adHTML;
    html += jump([['us-min', US.min, '①'], ['us-net', US.take, '②']]);

    html += section('us-min', '①', US.min,
      'FLSA 1.5× over 40 h/week',
      US.minLead,
      panelHead('Wage and hours', 'Recalculates as you type') +
      '<div class="sl-body"><div class="sl-grid two">' +
      field(US.state, select('us-state', US_STATES.map(function (s) { return [s.id, s.name]; }), st.id)) +
      field(US.rate, numInput('us-rate', st.mw.toFixed(2), 'min="0" step="0.01"'), '$/hour') +
      field(US.hours, numInput('us-hours', '40', 'min="0" max="80" step="0.5"'), 'hours') +
      field(US.otHours, numInput('us-ot', '0', 'min="0" max="40" step="0.5"'), '1.5×') +
      '</div></div>',
      '<div class="sl-kpis">' +
      kpi(US.weekly, '<span id="us-weekly">–</span>', 'regular + overtime') +
      kpi(US.overtime, '<span id="us-otpay">–</span>', '50% premium') +
      kpi(US.monthly, '<span id="us-month">–</span>', '×52 ÷ 12', 'hi') +
      kpi(US.annual, '<span id="us-year">–</span>', '×52', 'accent') +
      '</div>');

    html += section('us-net', '②', US.take,
      '2026 federal + FICA',
      US.takeLead,
      panelHead('Salary', 'Annual gross') +
      '<div class="sl-body"><div class="sl-grid two">' +
      field(US.salary, numInput('us-salary', '75000', 'min="0" step="1000"')) +
      field(US.filing, select('us-filing', [['single', US.single], ['mfj', US.mfj]], 'single')) +
      field(US.stateTax, select('us-taxstate', US_STATES.filter(function (s) { return s.id.indexOf('2') < 0; })
        .map(function (s) { return [s.id, s.name.replace(/\s*\(.*\)$/, '') + (s.tax ? ' · ~' + (s.tax * 100).toFixed(1) + '%' : ' · 0%')]; }), 'federal')) +
      '</div></div>',
      '<div class="sl-kpis">' +
      kpi(US.net, '<span id="us-netz">–</span>', 'after tax and FICA', 'hi') +
      kpi(US.netMonth, '<span id="us-netm">–</span>', '/month') +
      kpi(US.netBiweek, '<span id="us-netb">–</span>', '/2 weeks') +
      kpi(US.eff, '<span id="us-eff">–</span>', 'tax + FICA', 'accent') +
      '</div>' +
      '<div class="sl-scroll"><table class="sl-table"><caption>' + esc(US.gross) + ' → ' + esc(US.net) + '</caption>' +
      '<thead><tr><th scope="col">Item</th><th scope="col">Annual</th><th scope="col">Monthly</th></tr></thead><tbody>' +
      '<tr><th scope="row">' + esc(US.gross) + '</th><td id="us-t-gross">–</td><td id="us-t-gross-m">–</td></tr>' +
      '<tr><th scope="row">' + esc(US.federal) + '</th><td id="us-t-fed">–</td><td id="us-t-fed-m">–</td></tr>' +
      '<tr><th scope="row">' + esc(US.fica) + '</th><td id="us-t-fica">–</td><td id="us-t-fica-m">–</td></tr>' +
      '<tr><th scope="row">' + esc(US.stateLine) + '</th><td id="us-t-state">–</td><td id="us-t-state-m">–</td></tr>' +
      '</tbody><tfoot><tr><th scope="row">' + esc(US.net) + '</th><td id="us-t-net">–</td><td id="us-t-net-m">–</td></tr></tfoot></table></div>' +
      '<p class="sl-note">' + esc(US.note) + '</p>');

    html += refs('Sources', [
      ['U.S. Department of Labor — Consolidated Minimum Wage Table (Sept 30, 2026)', 'https://www.dol.gov/agencies/whd/mw-consolidated'],
      ['IRS — 2026 tax inflation adjustments (Rev. Proc. 2025-32)', 'https://www.irs.gov/newsroom/irs-releases-tax-inflation-adjustments-for-tax-year-2026-including-amendments-from-the-one-big-beautiful-bill'],
      ['SSA — 2026 Social Security taxable maximum ($184,500)', 'https://www.ssa.gov/faqs/en/questions/KA-02387.html']
    ]);

    wrap.innerHTML = html;
    bindUS();
  }

  function bindUS() {
    var stateSel = $('#us-state'), rateEl = $('#us-rate'), hoursEl = $('#us-hours'), otEl = $('#us-ot');
    function minCalc() {
      var rate = Number(rateEl.value) || 0;
      var hours = Number(hoursEl.value) || 0;
      var ot = Number(otEl.value) || 0;
      var regular = rate * Math.min(hours, 40);
      var extra = rate * Math.max(0, hours - 40);
      var otPay = rate * 1.5 * ot;
      var week = regular + extra + otPay;
      var premium = rate * 0.5 * (ot + Math.max(0, hours - 40));
      $('#us-weekly').textContent = money(week, 2);
      $('#us-otpay').textContent = money(premium, 2);
      $('#us-month').textContent = money(week * 52 / 12, 0);
      $('#us-year').textContent = money(week * 52, 0);
    }
    stateSel.addEventListener('change', function () {
      var s = US_STATES.filter(function (x) { return x.id === stateSel.value; })[0];
      if (s) { rateEl.value = s.mw.toFixed(2); minCalc(); }
    });
    [rateEl, hoursEl, otEl].forEach(function (el) { el.addEventListener('input', minCalc); });

    var salEl = $('#us-salary'), filingEl = $('#us-filing'), taxStateEl = $('#us-taxstate');
    function netCalc() {
      var gross = Number(salEl.value) || 0;
      var status = filingEl.value;
      var st = US_STATES.filter(function (x) { return x.id === taxStateEl.value; })[0] || { tax: 0 };
      var taxable = Math.max(0, gross - US_STD[status]);
      var fed = usFedTax(taxable, status);
      var fica = usFica(gross, status);
      var stateTax = gross * st.tax;
      var net = gross - fed - fica.total - stateTax;
      $('#us-netz').textContent = money(net, 0);
      $('#us-netm').textContent = money(net / 12, 0);
      $('#us-netb').textContent = money(net / 26, 0);
      $('#us-eff').textContent = gross ? pct((fed + fica.total + stateTax) / gross) : '–';
      $('#us-t-gross').textContent = money(gross, 0);
      $('#us-t-gross-m').textContent = money(gross / 12, 0);
      $('#us-t-fed').textContent = '−' + money(fed, 0);
      $('#us-t-fed-m').textContent = '−' + money(fed / 12, 0);
      $('#us-t-fica').textContent = '−' + money(fica.total, 0);
      $('#us-t-fica-m').textContent = '−' + money(fica.total / 12, 0);
      $('#us-t-state').textContent = '−' + money(stateTax, 0);
      $('#us-t-state-m').textContent = '−' + money(stateTax / 12, 0);
      $('#us-t-net').textContent = money(net, 0);
      $('#us-t-net-m').textContent = money(net / 12, 0);
    }
    [salEl, filingEl, taxStateEl].forEach(function (el) {
      el.addEventListener('input', netCalc); el.addEventListener('change', netCalc);
    });
    minCalc(); netCalc();
  }

  /* =========================================================
     일본 화면
     ========================================================= */
  function renderJP() {
    var pref = JP_PREF[0];
    var html = head('年収手取り・最低賃金・残業代 計算機',
      JP.dek, ['2026年度 地域別最低賃金', '2026年度 社会保険料率', '登録不要', 'ブラウザ内で計算'],
      '無料ツール · 給与計算');

    html += adHTML;
    html += jump([['jp-min', JP.min, '①'], ['jp-net', JP.take, '②']]);

    html += section('jp-min', '①', JP.min,
      '2026年度（令和8年度）',
      JP.minLead,
      panelHead('時給と労働時間', '入力するとすぐ再計算') +
      '<div class="sl-body"><div class="sl-grid two">' +
      field(JP.pref, select('jp-pref', JP_PREF.map(function (p) { return [p.id, p.name + ' ' + nf(p.w) + '円']; }), pref.id)) +
      field(JP.rate, numInput('jp-rate', pref.w, 'min="0" step="1"'), '円/時') +
      field(JP.hours, numInput('jp-hours', '8', 'min="1" max="12" step="0.5"'), '時間') +
      field(JP.days, numInput('jp-days', '20', 'min="1" max="31" step="1"'), '日') +
      field(JP.otHours, numInput('jp-ot', '10', 'min="0" max="100" step="0.5"'), '時間/月') +
      field(JP.night, numInput('jp-night', '0', 'min="0" max="100" step="0.5"'), '時間/月') +
      '</div></div>',
      '<div class="sl-kpis">' +
      kpi(JP.monthlyBase, '<span id="jp-base">–</span>', '時給 × 時間 × 日数') +
      kpi(JP.overtime, '<span id="jp-otpay">–</span>', '25% / 50% + 深夜25%') +
      kpi(JP.monthly, '<span id="jp-month">–</span>', '総支給', 'hi') +
      kpi(JP.annual, '<span id="jp-year">–</span>', '×12', 'accent') +
      '</div>');

    html += section('jp-net', '②', JP.take,
      '所得税・住民税・社会保険',
      JP.takeLead,
      panelHead('年収', '額面') +
      '<div class="sl-body"><div class="sl-grid two">' +
      field(JP.salary, numInput('jp-salary', '5000000', 'min="0" step="10000"')) +
      field(JP.age, select('jp-age', [['no', JP.no + '（40歳未満）'], ['yes', JP.yes + '（40〜64歳）']], 'no')) +
      '</div></div>',
      '<div class="sl-kpis">' +
      kpi(JP.net, '<span id="jp-netz">–</span>', '年', 'hi') +
      kpi(JP.netMonth, '<span id="jp-netm">–</span>', '月') +
      kpi(JP.social, '<span id="jp-soc">–</span>', '健康保険・年金・雇用保険') +
      kpi(JP.eff, '<span id="jp-eff">–</span>', '額面比', 'accent') +
      '</div>' +
      '<div class="sl-scroll"><table class="sl-table"><caption>' + esc(JP.gross) + ' → ' + esc(JP.net) + '</caption>' +
      '<thead><tr><th scope="col">項目</th><th scope="col">年額</th><th scope="col">月額</th></tr></thead><tbody>' +
      '<tr><th scope="row">' + esc(JP.gross) + '</th><td id="jp-t-gross">–</td><td id="jp-t-gross-m">–</td></tr>' +
      '<tr><th scope="row">' + esc(JP.social) + '</th><td id="jp-t-soc">–</td><td id="jp-t-soc-m">–</td></tr>' +
      '<tr><th scope="row">' + esc(JP.incomeTax) + '</th><td id="jp-t-tax">–</td><td id="jp-t-tax-m">–</td></tr>' +
      '<tr><th scope="row">' + esc(JP.resident) + '</th><td id="jp-t-res">–</td><td id="jp-t-res-m">–</td></tr>' +
      '</tbody><tfoot><tr><th scope="row">' + esc(JP.net) + '</th><td id="jp-t-net">–</td><td id="jp-t-net-m">–</td></tr></tfoot></table></div>' +
      '<p class="sl-note">' + esc(JP.note) + '</p>');

    html += refs('出典', [
      ['厚生労働省 — 令和8年度 地域別最低賃金 全国一覧', 'https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/koyou_roudou/roudoukijun/minimumichiran/index.html'],
      ['全国健康保険協会 — 令和8年度 保険料率（東京都）', 'https://www.kyoukaikenpo.or.jp/'],
      ['国税庁 — 令和7年度税制改正による基礎控除の見直し等', 'https://www.nta.go.jp/users/gensen/2025kiso/index.htm']
    ]);

    wrap.innerHTML = html;
    bindJP();
  }

  function bindJP() {
    var prefSel = $('#jp-pref'), rateEl = $('#jp-rate'), hoursEl = $('#jp-hours'), daysEl = $('#jp-days'),
      otEl = $('#jp-ot'), nightEl = $('#jp-night');
    function minCalc() {
      var rate = Number(rateEl.value) || 0;
      var hours = Number(hoursEl.value) || 0;
      var days = Number(daysEl.value) || 0;
      var ot = Number(otEl.value) || 0;
      var night = Math.min(Number(nightEl.value) || 0, ot + hours * 0);
      var base = rate * hours * days;
      var otNormal = Math.max(0, Math.min(ot, 60));
      var otOver = Math.max(0, ot - 60);
      var otPay = rate * 0.25 * otNormal + rate * 0.50 * otOver + rate * 0.25 * night;
      $('#jp-base').textContent = money(base);
      $('#jp-otpay').textContent = money(otPay);
      $('#jp-month').textContent = money(base + otPay);
      $('#jp-year').textContent = money((base + otPay) * 12);
    }
    prefSel.addEventListener('change', function () {
      var p = JP_PREF.filter(function (x) { return x.id === prefSel.value; })[0];
      if (p) { rateEl.value = p.w; minCalc(); }
    });
    [rateEl, hoursEl, daysEl, otEl, nightEl].forEach(function (el) { el.addEventListener('input', minCalc); });

    var salEl = $('#jp-salary'), ageEl = $('#jp-age');
    function netCalc() {
      var income = Number(salEl.value) || 0;
      var withCare = ageEl.value === 'yes';
      var empDed = jpEmploymentDeduction(income);
      var salaryIncome = Math.max(0, income - empDed);
      var socialRate = withCare ? 0.1555 : 0.1474;
      var social = Math.min(salaryIncome, income) * socialRate;
      var basic = 620000;
      var taxable = Math.max(0, salaryIncome - social - basic);
      var incomeTax = Math.floor(jpIncomeTax(taxable) / 100) * 100;
      var resident = Math.floor(Math.max(0, salaryIncome - social - 430000) * 0.10 / 100) * 100 +
        (salaryIncome > 450000 ? 5000 : 0);
      var net = income - social - incomeTax - resident;
      $('#jp-netz').textContent = money(net);
      $('#jp-netm').textContent = money(net / 12);
      $('#jp-soc').textContent = money(social);
      $('#jp-eff').textContent = income ? pct((social + incomeTax + resident) / income) : '–';
      $('#jp-t-gross').textContent = money(income);
      $('#jp-t-gross-m').textContent = money(income / 12);
      $('#jp-t-soc').textContent = '−' + money(social);
      $('#jp-t-soc-m').textContent = '−' + money(social / 12);
      $('#jp-t-tax').textContent = '−' + money(incomeTax);
      $('#jp-t-tax-m').textContent = '−' + money(incomeTax / 12);
      $('#jp-t-res').textContent = '−' + money(resident);
      $('#jp-t-res-m').textContent = '−' + money(resident / 12);
      $('#jp-t-net').textContent = money(net);
      $('#jp-t-net-m').textContent = money(net / 12);
    }
    [salEl, ageEl].forEach(function (el) {
      el.addEventListener('input', netCalc); el.addEventListener('change', netCalc);
    });
    minCalc(); netCalc();
  }

  /* =========================================================
     중국 화면
     ========================================================= */
  function renderCN() {
    var city = CN_CITIES[0];
    var html = head('最低工资、加班费与税后工资计算器',
      CN.dek, ['2026年 人社部最低工资', '五险一金·个税', '无需注册', '浏览器内计算'],
      '免费工具 · 薪酬计算');

    html += adHTML;
    html += jump([['cn-min', CN.min, '①'], ['cn-net', CN.take, '②']]);

    html += section('cn-min', '①', CN.min,
      '2026年 最低工资标准',
      CN.minLead,
      panelHead('城市与工时', '输入后自动重算') +
      '<div class="sl-body"><div class="sl-grid two">' +
      field(CN.city, select('cn-city', CN_CITIES.map(function (c) {
        return [c.id, c.name + ' · ' + nf(c.m) + '元/月 · ' + c.h + '元/时'];
      }), city.id)) +
      field(CN.rate, numInput('cn-rate', city.h, 'min="0" step="0.1"'), '元/小时') +
      field(CN.hours, numInput('cn-hours', '174', 'min="1" max="300" step="1"'), '月计薪时数') +
      field(CN.otWorkday, numInput('cn-ot1', '0', 'min="0" max="200" step="0.5"'), '150%') +
      field(CN.otRest, numInput('cn-ot2', '0', 'min="0" max="200" step="0.5"'), '200%') +
      field(CN.otHoliday, numInput('cn-ot3', '0', 'min="0" max="100" step="0.5"'), '300%') +
      '</div></div>',
      '<div class="sl-kpis">' +
      kpi(CN.base, '<span id="cn-base">–</span>', '小时工资 × 计薪时数') +
      kpi(CN.overtime, '<span id="cn-otpay">–</span>', '1.5 / 2 / 3 倍') +
      kpi(CN.monthly, '<span id="cn-month">–</span>', '应发', 'hi') +
      kpi(CN.annual, '<span id="cn-year">–</span>', '×12', 'accent') +
      '</div>');

    html += section('cn-net', '②', CN.take,
      '五险一金 + 个税',
      CN.takeLead,
      panelHead('工资', '应发金额') +
      '<div class="sl-body"><div class="sl-grid two">' +
      field(CN.salaryMode, select('cn-mode', [['month', CN.monthlyMode], ['year', CN.annualMode]], 'month')) +
      field(CN.amount, numInput('cn-amount', '10000', 'min="0" step="100"'), '元') +
      field(CN.fund, select('cn-fund', [['0.05', '5%'], ['0.07', '7%'], ['0.10', '10%'], ['0.12', '12%']], '0.07')) +
      '</div></div>',
      '<div class="sl-kpis">' +
      kpi(CN.net, '<span id="cn-netz">–</span>', '月', 'hi') +
      kpi(CN.netAnnual, '<span id="cn-nety">–</span>', '×12') +
      kpi(CN.social, '<span id="cn-soc">–</span>', '个人缴纳') +
      kpi(CN.eff, '<span id="cn-eff">–</span>', '应发比', 'accent') +
      '</div>' +
      '<div class="sl-scroll"><table class="sl-table"><caption>' + esc(CN.gross) + ' → ' + esc(CN.net) + '</caption>' +
      '<thead><tr><th scope="col">项目</th><th scope="col">金额（元/月）</th></tr></thead><tbody>' +
      '<tr><th scope="row">' + esc(CN.gross) + '</th><td id="cn-t-gross">–</td></tr>' +
      '<tr><th scope="row">' + esc(CN.pension) + '</th><td id="cn-t-pen">–</td></tr>' +
      '<tr><th scope="row">' + esc(CN.medical) + '</th><td id="cn-t-med">–</td></tr>' +
      '<tr><th scope="row">' + esc(CN.unemployment) + '</th><td id="cn-t-unemp">–</td></tr>' +
      '<tr><th scope="row">' + esc(CN.social) + '</th><td id="cn-t-soc">–</td></tr>' +
      '<tr><th scope="row">' + esc(CN.tax) + '</th><td id="cn-t-tax">–</td></tr>' +
      '</tbody><tfoot><tr><th scope="row">' + esc(CN.net) + '</th><td id="cn-t-net">–</td></tr></tfoot></table></div>' +
      '<p class="sl-note">' + esc(CN.note) + '</p>');

    html += refs('资料来源', [
      ['人力资源和社会保障部 — 全国各地区最低工资标准（截至2026年10月1日）', 'https://www.mohrss.gov.cn/SYrlzyhshbzb/laodongguanxi_/fwyd/'],
      ['广州市人力资源和社会保障局 — 2026年最低工资调整通知', 'https://rsj.gz.gov.cn/ywzt/ldgx/ldlscjg/ldgx/content/post_10981829.html']
    ]);

    wrap.innerHTML = html;
    bindCN();
  }

  function bindCN() {
    var citySel = $('#cn-city'), rateEl = $('#cn-rate'), hoursEl = $('#cn-hours'),
      ot1 = $('#cn-ot1'), ot2 = $('#cn-ot2'), ot3 = $('#cn-ot3');
    function minCalc() {
      var rate = Number(rateEl.value) || 0;
      var hours = Number(hoursEl.value) || 0;
      var a = Number(ot1.value) || 0, b = Number(ot2.value) || 0, c = Number(ot3.value) || 0;
      var base = rate * hours;
      var otPay = rate * a * 1.5 + rate * b * 2 + rate * c * 3;
      $('#cn-base').textContent = money(base);
      $('#cn-otpay').textContent = money(otPay);
      $('#cn-month').textContent = money(base + otPay);
      $('#cn-year').textContent = money((base + otPay) * 12);
    }
    citySel.addEventListener('change', function () {
      var x = CN_CITIES.filter(function (v) { return v.id === citySel.value; })[0];
      if (x) { rateEl.value = x.h; minCalc(); }
    });
    [rateEl, hoursEl, ot1, ot2, ot3].forEach(function (el) { el.addEventListener('input', minCalc); });

    var modeEl = $('#cn-mode'), amtEl = $('#cn-amount'), fundEl = $('#cn-fund');
    function netCalc() {
      var amt = Number(amtEl.value) || 0;
      var monthly = modeEl.value === 'year' ? amt / 12 : amt;
      var fund = Number(fundEl.value) || 0;
      var pension = monthly * 0.08;
      var medical = monthly * 0.02 + 3;
      var unemp = monthly * 0.005;
      var housing = monthly * fund;
      var social = pension + medical + unemp + housing;
      var taxable = Math.max(0, monthly - social - 5000);
      var tax = cnTax(taxable);
      var net = monthly - social - tax;
      $('#cn-netz').textContent = money(net);
      $('#cn-nety').textContent = money(net * 12);
      $('#cn-soc').textContent = money(social);
      $('#cn-eff').textContent = monthly ? pct((social + tax) / monthly) : '–';
      $('#cn-t-gross').textContent = money(monthly);
      $('#cn-t-pen').textContent = '−' + money(pension);
      $('#cn-t-med').textContent = '−' + money(medical);
      $('#cn-t-unemp').textContent = '−' + money(unemp);
      $('#cn-t-soc').textContent = '−' + money(social);
      $('#cn-t-tax').textContent = '−' + money(tax);
      $('#cn-t-net').textContent = money(net);
    }
    [modeEl, amtEl, fundEl].forEach(function (el) {
      el.addEventListener('input', netCalc); el.addEventListener('change', netCalc);
    });
    minCalc(); netCalc();
  }

  if (L === 'en') renderUS();
  else if (L === 'ja') renderJP();
  else renderCN();
})();
