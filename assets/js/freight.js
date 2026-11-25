/* =========================================================
   INSIGHT BRIEF — 해상운임·수입물류비(Landing Cost) 비교 계산기
   · 서버 호출 없음(환율 기본값만 사이트 시황 데이터에서 한 번 읽습니다).
   · 페이지 언어에 따라 출발항·통화·선사 순서가 그 나라 실무에 맞게 바뀝니다.
   ========================================================= */
(function () {
  'use strict';

  var LANG = (document.documentElement.getAttribute('lang') || 'ko').toLowerCase().slice(0, 2);
  if (['ko', 'en', 'zh', 'ja'].indexOf(LANG) < 0) LANG = 'ko';

  /* ---------------- 통화 ---------------- */
  var CUR = {
    ko: { code: 'KRW', sym: '₩', label: 'KRW', perUsd: 1343.6 },
    en: { code: 'USD', sym: 'US$', label: 'USD', perUsd: 1 },
    ja: { code: 'JPY', sym: '¥', label: 'JPY', perUsd: 159.3 },
    zh: { code: 'CNY', sym: 'CN¥', label: 'CNY', perUsd: 6.66 }
  }[LANG];

  var UI = {
    ko: {
      port: '출발항', ctype: '컨테이너 규격', fx: '환율 (1 USD = ?)', weight: '화물 중량', qty: '컨테이너 수량',
      unitKg: 'kg', unitEa: '대', fxHint: '시황판 원·달러 고시를 기본값으로 넣습니다. 직접 고쳐도 됩니다.',
      fxAuto: '시황판 기준', manual: '직접 입력',
      colCarrier: '선사', remove: '이 선사 빼기', add: '선사 추가', reset: '초기화',
      of: '해상운임 (O/F)', ofSub: 'USD / 컨테이너',
      baf: '유류·통화할증료', bafSub: 'BAF · CAF (USD)',
      dest: '도착지 부대비용', destSub: 'D/THC · D/O · 서류비',
      inland: '국내 내륙운송', inlandSub: 'KRW', customs: '통관수수료', customsSub: 'KRW',
      destCur: '도착지 비용 통화',
      total: '총 물류비', totalSub: '원화 환산',
      totalUsd: '총 물류비 (USD)', usdSub: '달러 환산',
      gap: '최저가 대비', gapSub: '차액',
      perMt: '톤당 (MT)', mtSub: '원 / 톤', perKg: 'kg당', kgSub: '원 / kg',
      sumBest: '최저가 선사', sumTotal: '최저 총 물류비', sumMt: '최저 톤당 단가',
      perMtOf: '톤당', countN: '선사 {n}곳', outNote: '부가세·관세 제외',
      rankNote: '최저가 선사와의 차액은 같은 조건(규격·중량·수량)에서의 차이입니다. 환율과 할증료 적용 기간이 바뀌면 순위도 달라질 수 있습니다.',
      grpKr: '한국계 선사', grpTw: '대만계 선사', grpGlobal: '글로벌 선사',
      linkLabel: '공식 홈 열기', resetDone: '예시 값으로 되돌렸습니다'
    },
    en: {
      port: 'Port of loading', ctype: 'Container type', fx: 'Exchange rate (1 USD = ?)', weight: 'Cargo weight', qty: 'Containers',
      unitKg: 'kg', unitEa: 'x', fxHint: 'Amounts are in USD on this page. Change the rate if you want totals in another currency.',
      fxAuto: 'from market board', manual: 'manual',
      colCarrier: 'Carrier', remove: 'Remove', add: 'Add carrier', reset: 'Reset',
      of: 'Ocean freight (O/F)', ofSub: 'USD / container',
      baf: 'Surcharges', bafSub: 'BAF · CAF (USD)',
      dest: 'Destination charges', destSub: 'D/THC · D/O · docs',
      inland: 'Inland haulage', inlandSub: 'USD', customs: 'Customs fee', customsSub: 'USD',
      destCur: 'Destination charge currency',
      total: 'Total landing cost', totalSub: 'all-in',
      totalUsd: 'Total landing cost', usdSub: 'USD',
      gap: 'Gap to lowest', gapSub: 'difference',
      perMt: 'Per tonne (MT)', mtSub: 'USD / t', perKg: 'Per kg', kgSub: 'USD / kg',
      sumBest: 'Cheapest carrier', sumTotal: 'Lowest total cost', sumMt: 'Lowest cost per tonne',
      perMtOf: 'per tonne', countN: '{n} carriers', outNote: 'excl. VAT & duty',
      rankNote: 'Differences are calculated on the same container, weight and quantity. A different exchange rate or surcharge period can change the ranking.',
      grpKr: 'Korean carriers', grpTw: 'Taiwanese carriers', grpGlobal: 'Global carriers',
      linkLabel: 'Open official site', resetDone: 'Reset to the sample values'
    },
    ja: {
      port: '積出港', ctype: 'コンテナ規格', fx: '為替 (1 USD = ?)', weight: '貨物重量', qty: 'コンテナ本数',
      unitKg: 'kg', unitEa: '本', fxHint: '市況板のレートを初期値にしています。手入力もできます。',
      fxAuto: '市況板基準', manual: '手入力',
      colCarrier: '船社', remove: 'この船社を外す', add: '船社を追加', reset: 'リセット',
      of: '海上運賃 (O/F)', ofSub: 'USD / コンテナ',
      baf: '燃料・通貨割増', bafSub: 'BAF · CAF (USD)',
      dest: '仕向地諸費用', destSub: 'D/THC · D/O · 書類',
      inland: '国内陸送費', inlandSub: 'JPY', customs: '通関手数料', customsSub: 'JPY',
      destCur: '仕向地費用の通貨',
      total: '総物流費', totalSub: '円換算',
      totalUsd: '総物流費 (USD)', usdSub: 'ドル換算',
      gap: '最安との差', gapSub: '差額',
      perMt: 'トン当たり (MT)', mtSub: '円 / トン', perKg: 'kg当たり', kgSub: '円 / kg',
      sumBest: '最安の船社', sumTotal: '最安の総物流費', sumMt: '最安のトン当たり',
      perMtOf: 'トン当たり', countN: '船社 {n}社', outNote: '消費税・関税を除く',
      rankNote: '差額は同じ条件(規格・重量・本数)での比較です。為替や割増の適用期間が変わると順位も変わります。',
      grpKr: '韓国系船社', grpTw: '台湾系船社', grpGlobal: 'グローバル船社',
      linkLabel: '公式サイトを開く', resetDone: 'サンプル値に戻しました'
    },
    zh: {
      port: '起运港', ctype: '集装箱规格', fx: '汇率 (1 USD = ?)', weight: '货物重量', qty: '集装箱数量',
      unitKg: 'kg', unitEa: '个', fxHint: '默认填入行情板汇率，也可手动修改。',
      fxAuto: '行情板基准', manual: '手动输入',
      colCarrier: '船公司', remove: '移除此船公司', add: '添加船公司', reset: '重置',
      of: '海运费 (O/F)', ofSub: 'USD / 集装箱',
      baf: '燃油·货币附加费', bafSub: 'BAF · CAF (USD)',
      dest: '目的港费用', destSub: 'D/THC · D/O · 单证',
      inland: '国内陆运费', inlandSub: 'CNY', customs: '报关费', customsSub: 'CNY',
      destCur: '目的港费用币种',
      total: '总物流费', totalSub: '折合人民币',
      totalUsd: '总物流费 (USD)', usdSub: '折合美元',
      gap: '与最低价差', gapSub: '差额',
      perMt: '每吨 (MT)', mtSub: '元 / 吨', perKg: '每公斤', kgSub: '元 / kg',
      sumBest: '最低价船公司', sumTotal: '最低总物流费', sumMt: '最低每吨成本',
      perMtOf: '每吨', countN: '船公司 {n} 家', outNote: '不含增值税与关税',
      rankNote: '差额是在相同规格、重量与数量下的比较。汇率或附加费适用期变化时，排名也会改变。',
      grpKr: '韩国船公司', grpTw: '台湾船公司', grpGlobal: '全球船公司',
      linkLabel: '打开官网', resetDone: '已恢复示例数值'
    }
  }[LANG];

  /* ---------------- 출발항 (언어별) ---------------- */
  var PORTS = {
    ko: [
      { id: 'busan', name: 'Busan', local: '부산항', un: 'KRPUS' },
      { id: 'incheon', name: 'Incheon', local: '인천항', un: 'KRINC' },
      { id: 'gwangyang', name: 'Gwangyang', local: '광양항', un: 'KRKAN' },
      { id: 'pyeongtaek', name: 'Pyeongtaek', local: '평택항', un: 'KRPTK' },
      { id: 'etc', name: 'Other', local: '기타 항구', un: '' }
    ],
    en: [
      { id: 'lax', name: 'Los Angeles', local: 'Los Angeles', un: 'USLAX' },
      { id: 'lgb', name: 'Long Beach', local: 'Long Beach', un: 'USLGB' },
      { id: 'nyc', name: 'New York / Newark', local: 'New York', un: 'USNYC' },
      { id: 'sav', name: 'Savannah', local: 'Savannah', un: 'USSAV' },
      { id: 'rtm', name: 'Rotterdam', local: 'Rotterdam', un: 'NLRTM' },
      { id: 'etc', name: 'Other', local: 'Other', un: '' }
    ],
    ja: [
      { id: 'tyo', name: 'Tokyo', local: '東京', un: 'JPTYO' },
      { id: 'yok', name: 'Yokohama', local: '横浜', un: 'JPYOK' },
      { id: 'osa', name: 'Osaka', local: '大阪', un: 'JPOSA' },
      { id: 'kob', name: 'Kobe', local: '神戸', un: 'JPUKB' },
      { id: 'ngo', name: 'Nagoya', local: '名古屋', un: 'JPNGO' },
      { id: 'etc', name: 'Other', local: 'その他', un: '' }
    ],
    zh: [
      { id: 'sha', name: 'Shanghai', local: '上海', un: 'CNSHA' },
      { id: 'nbo', name: 'Ningbo', local: '宁波', un: 'CNNGB' },
      { id: 'tao', name: 'Qingdao', local: '青岛', un: 'CNTAO' },
      { id: 'szn', name: 'Shenzhen', local: '深圳', un: 'CNSZX' },
      { id: 'xmn', name: 'Xiamen', local: '厦门', un: 'CNXMN' },
      { id: 'etc', name: 'Other', local: '其他', un: '' }
    ]
  }[LANG];

  function portOf(id) { for (var i = 0; i < PORTS.length; i++) if (PORTS[i].id === id) return PORTS[i]; return PORTS[0]; }

  /* ---------------- 선사 ---------------- */
  var CARRIERS = [
    { id: 'hmm', name: 'HMM', local: { ko: 'HMM', en: 'HMM', ja: 'HMM', zh: 'HMM' }, group: 'kr', url: 'https://www.hmm21.com/' },
    { id: 'kmtc', name: 'KMTC', local: { ko: '고려해운', en: 'KMTC', ja: '高麗海運', zh: '高丽海运' }, group: 'kr', url: 'https://www.ekmtc.com/' },
    { id: 'sinokor', name: 'Sinokor', local: { ko: '장금상선', en: 'Sinokor', ja: '長錦商船', zh: '长锦商船' }, group: 'kr', url: 'https://www.sinokor.co.kr/' },
    { id: 'heunga', name: 'Heung-A', local: { ko: '흥아라인', en: 'Heung-A', ja: '興亜ライン', zh: '兴亚海运' }, group: 'kr', url: 'http://www.heung-a.co.kr/' },
    { id: 'namsung', name: 'Namsung', local: { ko: '남성해운', en: 'Namsung', ja: '南星海運', zh: '南星海运' }, group: 'kr', url: 'https://www.namsung.co.kr/' },
    { id: 'smlines', name: 'SM Lines', local: { ko: 'SM상선', en: 'SM Lines', ja: 'SMライン', zh: 'SM商船' }, group: 'kr', url: 'https://www.smlines.com/' },
    { id: 'evergreen', name: 'Evergreen', local: { ko: '에버그린', en: 'Evergreen', ja: 'エバーグリーン', zh: '长荣海运' }, group: 'tw', url: 'https://www.evergreen-line.com/' },
    { id: 'yangming', name: 'Yang Ming', local: { ko: '양밍', en: 'Yang Ming', ja: '陽明海運', zh: '阳明海运' }, group: 'tw', url: 'https://www.yangming.com/' },
    { id: 'wanhai', name: 'Wan Hai', local: { ko: '완하이', en: 'Wan Hai', ja: '万海航运', zh: '万海航运' }, group: 'tw', url: 'https://www.wanhai.com/' },
    { id: 'maersk', name: 'Maersk', local: { ko: '머스크', en: 'Maersk', ja: 'マースク', zh: '马士基' }, group: 'global', url: 'https://www.maersk.com/transportation-services/maersk-spot' },
    { id: 'msc', name: 'MSC', local: { ko: 'MSC', en: 'MSC', ja: 'MSC', zh: 'MSC' }, group: 'global', url: 'https://www.msc.com/en/quote' },
    { id: 'one', name: 'ONE', local: { ko: 'ONE', en: 'ONE', ja: 'ONE', zh: 'ONE' }, group: 'global', url: 'https://www.one-line.com/one-ecom' },
    { id: 'cmacgm', name: 'CMA CGM', local: { ko: 'CMA CGM', en: 'CMA CGM', ja: 'CMA CGM', zh: '达飞轮船' }, group: 'global', url: 'https://www.cma-cgm.com/ebusiness/pricing/instant-quote' },
    { id: 'hapag', name: 'Hapag-Lloyd', local: { ko: '하파크로이트', en: 'Hapag-Lloyd', ja: 'ハパックロイド', zh: '赫伯罗特' }, group: 'global', url: 'https://www.hapag-lloyd.com/en/online-business/quotation/instant-quote.html' },
    { id: 'cosco', name: 'COSCO', local: { ko: '코스코', en: 'COSCO', ja: 'COSCO', zh: '中远海运' }, group: 'global', url: 'https://elines.coscoshipping.com/ebusiness/' },
    { id: 'oocl', name: 'OOCL', local: { ko: 'OOCL', en: 'OOCL', ja: 'OOCL', zh: '东方海外' }, group: 'global', url: 'https://www.oocl.com/' },
    { id: 'sitc', name: 'SITC', local: { ko: 'SITC', en: 'SITC', ja: 'SITC', zh: '海丰国际' }, group: 'global', url: 'https://www.sitc.com/' }
  ];

  /* 언어별 노출 순서: 그 나라에서 많이 쓰는 선사를 앞에 */
  var PRIORITY = {
    ko: [],
    en: ['maersk', 'msc', 'cmacgm', 'hapag', 'one', 'evergreen', 'cosco', 'oocl'],
    ja: ['one', 'maersk', 'msc', 'cmacgm', 'hapag', 'evergreen', 'yangming', 'sitc'],
    zh: ['cosco', 'oocl', 'sitc', 'evergreen', 'yangming', 'wanhai', 'maersk', 'msc']
  }[LANG];
  var GROUP_ORDER = {
    ko: ['kr', 'tw', 'global'],
    en: ['global', 'tw', 'kr'],
    ja: ['global', 'kr', 'tw'],
    zh: ['global', 'tw', 'kr']
  }[LANG];

  function carrierById(id) {
    for (var i = 0; i < CARRIERS.length; i++) if (CARRIERS[i].id === id) return CARRIERS[i];
    return CARRIERS[0];
  }
  function cname(c) { return (c.local && c.local[LANG]) || c.name; }
  function sortCarriers(list) {
    return list.map(function (c, i) { return { c: c, i: i }; }).sort(function (a, b) {
      var pa = PRIORITY.indexOf(a.c.id), pb = PRIORITY.indexOf(b.c.id);
      pa = pa < 0 ? 999 : pa; pb = pb < 0 ? 999 : pb;
      return pa - pb || a.i - b.i;
    }).map(function (x) { return x.c; });
  }

  /* ---------------- 상태 (언어별 기본값) ---------------- */
  var DEFAULTS = {
    ko: {
      port: 'busan', ctype: '40ft GP', fx: 1343.6, fxAuto: true, weight: 18000, qty: 1,
      cols: [
        { cid: 'hmm', of: 1820, baf: 310, dest: 180000, destCur: 'KRW', inland: 350000, customs: 120000 },
        { cid: 'kmtc', of: 1760, baf: 295, dest: 175000, destCur: 'KRW', inland: 340000, customs: 110000 },
        { cid: 'evergreen', of: 1890, baf: 280, dest: 170000, destCur: 'KRW', inland: 330000, customs: 110000 }
      ]
    },
    en: {
      port: 'lax', ctype: '40ft GP', fx: 1, fxAuto: true, weight: 18000, qty: 1,
      cols: [
        { cid: 'maersk', of: 1820, baf: 310, dest: 1800, destCur: 'USD', inland: 950, customs: 150 },
        { cid: 'msc', of: 1760, baf: 295, dest: 1750, destCur: 'USD', inland: 920, customs: 145 },
        { cid: 'one', of: 1890, baf: 280, dest: 1700, destCur: 'USD', inland: 900, customs: 150 }
      ]
    },
    ja: {
      port: 'tyo', ctype: '40ft GP', fx: 159.3, fxAuto: true, weight: 18000, qty: 1,
      cols: [
        { cid: 'one', of: 1180, baf: 240, dest: 62000, destCur: 'JPY', inland: 78000, customs: 24000 },
        { cid: 'maersk', of: 1240, baf: 255, dest: 60000, destCur: 'JPY', inland: 76000, customs: 23000 },
        { cid: 'kmtc', of: 1120, baf: 230, dest: 58000, destCur: 'JPY', inland: 75000, customs: 22000 }
      ]
    },
    zh: {
      port: 'sha', ctype: '40ft GP', fx: 6.66, fxAuto: true, weight: 18000, qty: 1,
      cols: [
        { cid: 'cosco', of: 980, baf: 210, dest: 1450, destCur: 'CNY', inland: 2600, customs: 800 },
        { cid: 'oocl', of: 1010, baf: 215, dest: 1500, destCur: 'CNY', inland: 2550, customs: 780 },
        { cid: 'sitc', of: 940, baf: 200, dest: 1400, destCur: 'CNY', inland: 2500, customs: 760 }
      ]
    }
  }[LANG];

  var state = JSON.parse(JSON.stringify(DEFAULTS));

  var $ = function (s) { return document.querySelector(s); };
  var globalEl = $('#fr-global'), thead = $('#fr-thead'), tbody = $('#fr-tbody');
  var rthead = $('#fr-rthead'), rtbody = $('#fr-rtbody'), summaryEl = $('#fr-summary');
  var countEl = $('#fr-count'), outNote = $('#fr-out-note'), rankNote = $('#fr-rank-note');
  var toastEl = $('#fr-toast');

  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function num(v) {
    var n = parseFloat(String(v == null ? '' : v).replace(/[,\s₩¥$원]/g, ''));
    return isFinite(n) && n >= 0 ? n : 0;
  }
  function fmt(n) { return Math.round(n).toLocaleString('en-US'); }
  function fmt2(n) { return (Math.round(n * 100) / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function money(n, dec) { return CUR.sym + (dec ? fmt2(n) : fmt(n)); }

  /* ---------------- 공통 조건 ---------------- */
  function renderGlobal() {
    var h = '';
    h += '<div class="fr-field"><label for="fr-port">' + UI.port + '</label><select id="fr-port">' +
      PORTS.map(function (p) {
        return '<option value="' + p.id + '"' + (p.id === state.port ? ' selected' : '') + '>' +
          esc(p.local) + (p.un ? ' · ' + p.un : '') + '</option>';
      }).join('') + '</select></div>';

    h += '<div class="fr-field"><label for="fr-ctype">' + UI.ctype + '</label><select id="fr-ctype">' +
      ['20ft GP', '40ft GP', '40ft HQ', 'LCL'].map(function (c) {
        return '<option value="' + c + '"' + (c === state.ctype ? ' selected' : '') + '>' + c + '</option>';
      }).join('') + '</select></div>';

    h += '<div class="fr-field"><label for="fr-fx">' + UI.fx + ' <i>' + CUR.code + '</i><i id="fr-fx-src">' + (state.fxAuto ? UI.fxAuto : UI.manual) + '</i></label>' +
      '<input type="text" id="fr-fx" inputmode="decimal" value="' + esc(state.fx) + '" aria-describedby="fr-fx-hint">' +
      '<span class="hint" id="fr-fx-hint">' + UI.fxHint + '</span></div>';

    h += '<div class="fr-field"><label for="fr-weight">' + UI.weight + ' <i>kg</i></label>' +
      '<input type="text" id="fr-weight" inputmode="numeric" value="' + esc(fmt(state.weight)) + '"></div>';

    h += '<div class="fr-field"><label for="fr-qty">' + UI.qty + ' <i>' + UI.unitEa + '</i></label>' +
      '<input type="text" id="fr-qty" inputmode="numeric" value="' + esc(state.qty) + '"></div>';
    globalEl.innerHTML = h;
  }

  /* ---------------- 입력 표 ---------------- */
  function carrierOptions(sel) {
    return CARRIERS.map(function (c) {
      return '<option value="' + c.id + '"' + (c.id === sel ? ' selected' : '') + '>' + esc(cname(c)) + '</option>';
    }).join('');
  }

  function renderTable() {
    var h = '<tr><th class="lb">' + UI.colCarrier + '</th>';
    state.cols.forEach(function (c, i) {
      h += '<th class="col-head"><select class="carrier-sel" data-col="' + i + '" aria-label="' + esc(UI.colCarrier + ' ' + (i + 1)) + '">' +
        carrierOptions(c.cid) + '</select>' +
        (state.cols.length > 2 ? '<button type="button" class="del" data-del="' + i + '">' + UI.remove + '</button>' : '') +
        '</th>';
    });
    thead.innerHTML = h + '</tr>';

    function row(label, sub, field, kind) {
      var out = '<tr><td class="lb">' + label + '<small>' + sub + '</small></td>';
      state.cols.forEach(function (c, i) {
        if (kind === 'destcur') {
          var opts = [CUR.code === 'USD' ? 'USD' : CUR.code, 'USD'].filter(function (v, k, a) { return a.indexOf(v) === k; });
          out += '<td class="cell"><select data-col="' + i + '" data-field="destCur">' +
            opts.map(function (cur) {
              return '<option value="' + cur + '"' + (c.destCur === cur ? ' selected' : '') + '>' + cur + '</option>';
            }).join('') + '</select></td>';
        } else {
          out += '<td class="cell"><input type="text" inputmode="numeric" data-col="' + i + '" data-field="' + field +
            '" value="' + esc(fmt(c[field])) + '" aria-label="' + esc(label + ' ' + (i + 1)) + '"></td>';
        }
      });
      return out + '</tr>';
    }

    /* 현지 통화가 USD인 페이지(영어)는 모든 금액이 USD이므로 통화 선택 줄을 두지 않습니다. */
    var rows = row(UI.of, UI.ofSub, 'of', 'int') +
      row(UI.baf, UI.bafSub, 'baf', 'int') +
      row(UI.dest, UI.destSub, 'dest', 'int');
    if (CUR.code !== 'USD') rows += row(UI.destCur, CUR.code + ' / USD', 'destCur', 'destcur');
    tbody.innerHTML = rows + row(UI.inland, UI.inlandSub, 'inland', 'int') + row(UI.customs, UI.customsSub, 'customs', 'int');

    countEl.textContent = UI.countN.replace('{n}', state.cols.length);
  }

  /* ---------------- 계산 ---------------- */
  function calc() {
    var fx = state.fx > 0 ? state.fx : 1;
    var qty = state.qty > 0 ? state.qty : 1;
    var mt = (state.weight > 0 ? state.weight : 0) / 1000 * qty;
    return state.cols.map(function (c) {
      var destLocal = c.destCur === 'USD' ? c.dest * fx : c.dest;
      var usd = c.of + c.baf + (c.destCur === 'USD' ? c.dest : c.dest / fx) + (c.inland + c.customs) / fx;
      var one = usd * fx;
      var total = one * qty;
      return {
        cid: c.cid,
        total: total,
        usd: total / fx,
        perMt: mt > 0 ? total / mt : null,
        perKg: mt > 0 ? total / (mt * 1000) : null
      };
    });
  }

  function renderResults() {
    var rows = calc();
    if (!rows.length) { summaryEl.innerHTML = ''; rtbody.innerHTML = ''; rthead.innerHTML = ''; return; }
    var min = Math.min.apply(null, rows.map(function (r) { return r.total; }));
    var max = Math.max.apply(null, rows.map(function (r) { return r.total; }));
    var bestIdx = rows.map(function (r, i) { return r.total === min ? i : -1; }).filter(function (i) { return i >= 0; });
    var best = rows[bestIdx[0]];
    var bestCar = carrierById(state.cols[bestIdx[0]].cid);
    var mtMin = null, mtMinName = '';
    rows.forEach(function (r, i) {
      if (r.perMt != null && (mtMin == null || r.perMt < mtMin)) { mtMin = r.perMt; mtMinName = cname(carrierById(state.cols[i].cid)); }
    });

    summaryEl.innerHTML =
      '<div class="fr-sum-card best"><span class="k">' + UI.sumBest + '</span>' +
      '<div class="v">' + esc(cname(bestCar)) + '</div>' +
      '<div class="s">' + UI.total + ' ' + money(best.total) + '</div></div>' +
      '<div class="fr-sum-card"><span class="k">' + UI.sumTotal + '</span>' +
      '<div class="v">' + money(best.total) + '</div>' +
      '<div class="s">US$' + fmt(best.usd) + (best.perMt != null ? ' · ' + UI.perMtOf + ' ' + money(best.perMt) : '') + '</div></div>' +
      '<div class="fr-sum-card"><span class="k">' + UI.sumMt + '</span>' +
      '<div class="v">' + (mtMin != null ? money(mtMin) : '—') + '</div>' +
      '<div class="s">' + esc(mtMinName) + (mtMin != null ? ' · ' + UI.perMtOf : '') + '</div></div>';

    rthead.innerHTML = '<tr><th class="lb">' + UI.total + '</th>' + state.cols.map(function (c, i) {
      return '<th class="col-head' + (bestIdx.indexOf(i) >= 0 ? ' best' : '') + '"><b style="font-size:12px">' +
        esc(cname(carrierById(c.cid))) + '</b></th>';
    }).join('') + '</tr>';

    function resRow(label, sub, get, opt) {
      opt = opt || {};
      var out = '<tr><td class="lb">' + label + '<small>' + sub + '</small></td>';
      rows.forEach(function (r, i) {
        var v = get(r), isBest = bestIdx.indexOf(i) >= 0;
        var txt = v == null ? '—' : (opt.usd ? 'US$' : CUR.sym) + (opt.dec ? fmt2(v) : fmt(v));
        out += '<td class="num' + (isBest ? ' best' : '') + (opt.dim ? ' dim' : '') + '">' + txt +
          (opt.bar ? '<div class="fr-bar"><i style="width:' + (max > 0 ? Math.max(4, Math.round(r.total / max * 100)) : 0) + '%"></i></div>' : '') +
          '</td>';
      });
      return out + '</tr>';
    }

    var body = resRow(UI.total, UI.totalSub, function (r) { return r.total; }, { bar: true });
    if (CUR.code !== 'USD') body += resRow(UI.totalUsd, UI.usdSub, function (r) { return r.usd; }, { usd: true });
    body += resRow(UI.gap, UI.gapSub, function (r) { return r.total - min; }, { dim: true });
    body += resRow(UI.perMt, UI.mtSub, function (r) { return r.perMt; }, {});
    body += resRow(UI.perKg, UI.kgSub, function (r) { return r.perKg; }, { dec: true });
    rtbody.innerHTML = body;

    var p = portOf(state.port);
    outNote.textContent = p.local + ' → ' + state.ctype + ' · ' + fmt(state.qty) + UI.unitEa + ' · ' + UI.outNote;
    rankNote.textContent = UI.rankNote;
  }

  /* ---------------- 선사 허브 ---------------- */
  function renderHub() {
    var labels = { kr: UI.grpKr, tw: UI.grpTw, global: UI.grpGlobal };
    var tags = { kr: 'KOREA', tw: 'TAIWAN', global: 'GLOBAL' };
    var h = '';
    GROUP_ORDER.forEach(function (gid) {
      var list = sortCarriers(CARRIERS.filter(function (c) { return c.group === gid; }));
      h += '<div class="fr-group"><div class="fr-group-head"><b>' + esc(labels[gid]) + '</b><span>' + tags[gid] + '</span><i></i></div><div class="fr-cards">';
      list.forEach(function (c) {
        h += '<a class="fr-card" href="' + c.url + '" target="_blank" rel="noopener nofollow">' +
          '<span class="n">' + esc(cname(c)) + '</span>' +
          '<span class="e">' + esc(c.name) + '</span>' +
          '<span class="u">' + esc(c.url.replace(/^https?:\/\//, '').replace(/\/$/, '')) + '</span>' +
          '<span class="t">' + esc(UI.linkLabel) + '</span></a>';
      });
      h += '</div></div>';
    });
    $('#fr-carriers').innerHTML = h;
  }

  /* ---------------- 이벤트 ---------------- */
  var toastTimer = null;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('on'); }, 1600);
  }

  function bind() {
    document.addEventListener('input', function (e) {
      var t = e.target;
      if (t.id === 'fr-fx') {
        state.fx = num(t.value); state.fxAuto = false;
        var src = $('#fr-fx-src'); if (src) src.textContent = UI.manual;
        renderResults(); return;
      }
      if (t.id === 'fr-weight') { state.weight = num(t.value); renderResults(); return; }
      if (t.id === 'fr-qty') { state.qty = num(t.value) || 1; renderResults(); return; }
      if (t.hasAttribute && t.hasAttribute('data-field')) {
        var i = parseInt(t.getAttribute('data-col'), 10);
        var f = t.getAttribute('data-field');
        if (state.cols[i]) { state.cols[i][f] = num(t.value); renderResults(); }
      }
    });

    document.addEventListener('change', function (e) {
      var t = e.target;
      if (t.id === 'fr-ctype') { state.ctype = t.value; renderResults(); return; }
      if (t.id === 'fr-port') { state.port = t.value; renderResults(); return; }
      if (t.classList && t.classList.contains('carrier-sel')) {
        var i = parseInt(t.getAttribute('data-col'), 10);
        if (state.cols[i]) { state.cols[i].cid = t.value; renderResults(); }
        return;
      }
      if (t.hasAttribute && t.getAttribute('data-field') === 'destCur') {
        var j = parseInt(t.getAttribute('data-col'), 10);
        if (state.cols[j]) { state.cols[j].destCur = t.value; renderResults(); }
      }
    });

    document.addEventListener('click', function (e) {
      var t = e.target;
      var del = t.closest ? t.closest('[data-del]') : null;
      if (del) {
        var k = parseInt(del.getAttribute('data-del'), 10);
        if (state.cols.length > 2) { state.cols.splice(k, 1); renderTable(); renderResults(); }
        return;
      }
      if (t.id === 'fr-add') {
        if (state.cols.length >= 4) return;
        var used = state.cols.map(function (c) { return c.cid; });
        var pick = null;
        for (var i = 0; i < CARRIERS.length; i++) if (used.indexOf(CARRIERS[i].id) < 0) { pick = CARRIERS[i]; break; }
        state.cols.push({
          cid: (pick || CARRIERS[0]).id, of: 1800, baf: 300,
          dest: CUR.code === 'USD' ? 1800 : 175000, destCur: CUR.code === 'USD' ? 'USD' : CUR.code,
          inland: CUR.code === 'USD' ? 900 : 340000, customs: CUR.code === 'USD' ? 150 : 110000
        });
        renderTable(); renderResults();
        return;
      }
      if (t.id === 'fr-reset') {
        state = JSON.parse(JSON.stringify(DEFAULTS));
        renderGlobal(); renderTable(); renderResults();
        toast(UI.resetDone);
      }
    });
  }

  /* ---------------- 환율: 사이트 시황판 값으로 ---------------- */
  function loadFx() {
    var base = /^\/(en|zh|ja)\//.test(location.pathname) ? '../' : '';
    if (typeof fetch !== 'function') return;
    fetch(base + 'data/market.json', { cache: 'no-store' }).then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) {
        if (!d || !d.oilFx) return;
        if (!state.fxAuto) return;
        var usdKrw = null, jpyKrw = null, cnyKrw = null, date = '';
        d.oilFx.forEach(function (x) {
          if (x.code === 'USD/KRW') { usdKrw = x.price; date = x.date || ''; }
          if (x.code === 'JPY/KRW') jpyKrw = x.price;
          if (x.code === 'CNY/KRW') cnyKrw = x.price;
        });
        if (!(usdKrw > 0)) return;
        var rate = usdKrw;
        if (CUR.code === 'USD') rate = 1;
        else if (CUR.code === 'JPY' && jpyKrw > 0) rate = usdKrw / (jpyKrw / 100);
        else if (CUR.code === 'CNY' && cnyKrw > 0) rate = usdKrw / cnyKrw;
        if (CUR.code === 'KRW') rate = usdKrw;
        state.fx = Math.round(rate * 100) / 100;
        var el = $('#fr-fx');
        if (el) el.value = state.fx;
        var src = $('#fr-fx-src');
        if (src) src.textContent = (date ? date + ' ' : '') + UI.fxAuto;
        renderResults();
      }).catch(function () { });
  }

  function init() {
    if (!globalEl || !thead) return;
    renderGlobal();
    renderTable();
    renderResults();
    renderHub();
    bind();
    loadFx();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
