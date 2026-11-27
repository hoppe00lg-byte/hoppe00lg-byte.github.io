/* =========================================================
   INSIGHT BRIEF — 해상운임·수입물류비(Landing Cost) 비교 계산기
   · 서버 호출 없음(환율 기본값만 사이트 시황 데이터에서 한 번 읽습니다).
   · 출발항(POL)·도착항(POD)을 함께 고르고, 페이지 언어에 따라 항구·통화·선사 순서가 그 나라 실무에 맞게 바뀝니다.
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
      pol: '출발항 (POL)', pod: '도착항 (POD)', ctype: '컨테이너 규격', fx: '환율 (1 USD = ?)', weight: '화물 중량', qty: '컨테이너 수량',
      customOpt: '직접 입력', customPh: '항구명 입력 (예: 자카르타)',
      sumRoute: '구간 (출발 → 도착)', fxShort: '환율', bestTag: '최저가', gapTag: '최저가 대비', usdNote: '모든 금액 USD 기준',
      copy: '요약 복사', copied: '구간·금액 요약을 복사했습니다', copyFail: '복사하지 못했습니다. 화면에서 직접 선택해 주세요.',
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
      pol: 'Port of loading (POL)', pod: 'Port of discharge (POD)', ctype: 'Container type', fx: 'Exchange rate (1 USD = ?)', weight: 'Cargo weight', qty: 'Containers',
      customOpt: 'Other (type it)', customPh: 'Port name (e.g. Jakarta)',
      sumRoute: 'Route (POL → POD)', fxShort: 'Exchange rate', bestTag: 'cheapest', gapTag: 'vs cheapest', usdNote: 'All amounts in USD',
      copy: 'Copy summary', copied: 'Route and prices copied', copyFail: 'Copy failed — select the text on screen instead.',
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
      pol: '積出港 (POL)', pod: '仕向港 (POD)', ctype: 'コンテナ規格', fx: '為替 (1 USD = ?)', weight: '貨物重量', qty: 'コンテナ本数',
      customOpt: '直接入力', customPh: '港名を入力（例：ジャカルタ）',
      sumRoute: '区間（積出 → 仕向）', fxShort: '為替', bestTag: '最安', gapTag: '最安との差', usdNote: '金額はすべてUSD建て',
      copy: '概要をコピー', copied: '区間と金額の概要をコピーしました', copyFail: 'コピーできませんでした。画面から選択してください。',
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
      pol: '起运港 (POL)', pod: '目的港 (POD)', ctype: '集装箱规格', fx: '汇率 (1 USD = ?)', weight: '货物重量', qty: '集装箱数量',
      customOpt: '手动输入', customPh: '港口名称（例：雅加达）',
      sumRoute: '航线（起运 → 目的）', fxShort: '汇率', bestTag: '最低价', gapTag: '与最低价差', usdNote: '金额均以美元计',
      copy: '复制摘要', copied: '已复制航线与金额摘要', copyFail: '复制失败，请手动选择文字。',
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

  /* ---------------- 항구 (출발항·도착항 공용, UN/LOCODE 기준) ---------------- */
  var PORTS_ALL = [
    { code: 'KRPUS', home: 'kr', n: { ko: '부산항', en: 'Busan', ja: '釜山', zh: '釜山' } },
    { code: 'KRINC', home: 'kr', n: { ko: '인천항', en: 'Incheon', ja: '仁川', zh: '仁川' } },
    { code: 'KRKAN', home: 'kr', n: { ko: '광양항', en: 'Gwangyang', ja: '光陽', zh: '光阳' } },
    { code: 'KRPTK', home: 'kr', n: { ko: '평택항', en: 'Pyeongtaek', ja: '平沢', zh: '平泽' } },
    { code: 'CNSHA', home: 'cn', n: { ko: '상하이', en: 'Shanghai', ja: '上海', zh: '上海' } },
    { code: 'CNNGB', home: 'cn', n: { ko: '닝보', en: 'Ningbo', ja: '寧波', zh: '宁波' } },
    { code: 'CNTAO', home: 'cn', n: { ko: '칭다오', en: 'Qingdao', ja: '青島', zh: '青岛' } },
    { code: 'CNSZX', home: 'cn', n: { ko: '선전(옌톈)', en: 'Shenzhen (Yantian)', ja: '深圳（塩田）', zh: '深圳（盐田）' } },
    { code: 'CNXMN', home: 'cn', n: { ko: '샤먼', en: 'Xiamen', ja: '廈門', zh: '厦门' } },
    { code: 'JPTYO', home: 'jp', n: { ko: '도쿄', en: 'Tokyo', ja: '東京', zh: '东京' } },
    { code: 'JPYOK', home: 'jp', n: { ko: '요코하마', en: 'Yokohama', ja: '横浜', zh: '横滨' } },
    { code: 'JPOSA', home: 'jp', n: { ko: '오사카', en: 'Osaka', ja: '大阪', zh: '大阪' } },
    { code: 'JPUKB', home: 'jp', n: { ko: '고베', en: 'Kobe', ja: '神戸', zh: '神户' } },
    { code: 'JPNGO', home: 'jp', n: { ko: '나고야', en: 'Nagoya', ja: '名古屋', zh: '名古屋' } },
    { code: 'SGSIN', home: 'sg', n: { ko: '싱가포르', en: 'Singapore', ja: 'シンガポール', zh: '新加坡' } },
    { code: 'VNSGN', home: 'vn', n: { ko: '호치민(깟라이)', en: 'Ho Chi Minh (Cat Lai)', ja: 'ホーチミン（カットライ）', zh: '胡志明（吉莱）' } },
    { code: 'THLCH', home: 'th', n: { ko: '방콕(런차방)', en: 'Bangkok (Laem Chabang)', ja: 'バンコク（レムチャバン）', zh: '曼谷（林查班）' } },
    { code: 'USLAX', home: 'us', n: { ko: '로스앤젤레스', en: 'Los Angeles', ja: 'ロサンゼルス', zh: '洛杉矶' } },
    { code: 'USLGB', home: 'us', n: { ko: '롱비치', en: 'Long Beach', ja: 'ロングビーチ', zh: '长滩' } },
    { code: 'USNYC', home: 'us', n: { ko: '뉴욕·뉴저지', en: 'New York / New Jersey', ja: 'ニューヨーク／ニュージャージー', zh: '纽约／新泽西' } },
    { code: 'USSAV', home: 'us', n: { ko: '사바나', en: 'Savannah', ja: 'サバンナ', zh: '萨凡纳' } },
    { code: 'NLRTM', home: 'eu', n: { ko: '로테르담', en: 'Rotterdam', ja: 'ロッテルダム', zh: '鹿特丹' } },
    { code: 'DEHAM', home: 'eu', n: { ko: '함부르크', en: 'Hamburg', ja: 'ハンブルク', zh: '汉堡' } },
    { code: 'BEANR', home: 'eu', n: { ko: '앤트워프', en: 'Antwerp', ja: 'アントワープ', zh: '安特卫普' } },
    { code: 'AEJEA', home: 'me', n: { ko: '제벨알리(두바이)', en: 'Jebel Ali (Dubai)', ja: 'ジェベルアリ（ドバイ）', zh: '杰贝阿里（迪拜）' } }
  ];

  /* 출발항: 그 나라 항구를 앞에 / 도착항: 가까운 해외 항구를 앞에 */
  var POL_ORDER = {
    ko: ['kr', 'cn', 'jp', 'us', 'eu', 'sg', 'vn', 'th', 'me'],
    en: ['us', 'eu', 'cn', 'jp', 'kr', 'sg', 'vn', 'th', 'me'],
    ja: ['jp', 'kr', 'cn', 'us', 'eu', 'sg', 'vn', 'th', 'me'],
    zh: ['cn', 'kr', 'jp', 'us', 'eu', 'sg', 'vn', 'th', 'me']
  }[LANG];
  var POD_ORDER = {
    ko: ['us', 'eu', 'cn', 'jp', 'sg', 'vn', 'th', 'me', 'kr'],
    en: ['eu', 'cn', 'jp', 'kr', 'sg', 'vn', 'th', 'me', 'us'],
    ja: ['us', 'cn', 'kr', 'eu', 'sg', 'vn', 'th', 'me', 'jp'],
    zh: ['eu', 'us', 'kr', 'jp', 'sg', 'vn', 'th', 'me', 'cn']
  }[LANG];

  function pname(p) { return (p.n && p.n[LANG]) || p.n.en || p.code; }
  function portByCode(code) {
    for (var i = 0; i < PORTS_ALL.length; i++) if (PORTS_ALL[i].code === code) return PORTS_ALL[i];
    return null;
  }
  function sortPorts(order) {
    return PORTS_ALL.map(function (p, i) { return { p: p, i: i }; }).sort(function (a, b) {
      var ia = order.indexOf(a.p.home), ib = order.indexOf(b.p.home);
      if (ia < 0) ia = 99;
      if (ib < 0) ib = 99;
      return ia - ib || a.i - b.i;
    }).map(function (x) { return x.p; });
  }
  /* 선택한 항구를 화면에 보일 이름으로 (직접 입력 포함) */
  function portLabel(key) {
    var code = state[key];
    if (code === 'custom') {
      var t = String(state[key + 'Name'] || '').replace(/^\s+|\s+$/g, '');
      return t || UI.customOpt;
    }
    var p = portByCode(code);
    return p ? pname(p) : UI.customOpt;
  }

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
      pol: 'KRPUS', pod: 'USLAX', polName: '', podName: '', ctype: '40ft GP', fx: 1343.6, fxAuto: true, weight: 18000, qty: 1,
      cols: [
        { cid: 'hmm', of: 1820, baf: 310, dest: 180000, destCur: 'KRW', inland: 350000, customs: 120000 },
        { cid: 'kmtc', of: 1760, baf: 295, dest: 175000, destCur: 'KRW', inland: 340000, customs: 110000 },
        { cid: 'evergreen', of: 1890, baf: 280, dest: 170000, destCur: 'KRW', inland: 330000, customs: 110000 }
      ]
    },
    en: {
      pol: 'USLAX', pod: 'NLRTM', polName: '', podName: '', ctype: '40ft GP', fx: 1, fxAuto: true, weight: 18000, qty: 1,
      cols: [
        { cid: 'maersk', of: 1820, baf: 310, dest: 1800, destCur: 'USD', inland: 950, customs: 150 },
        { cid: 'msc', of: 1760, baf: 295, dest: 1750, destCur: 'USD', inland: 920, customs: 145 },
        { cid: 'one', of: 1890, baf: 280, dest: 1700, destCur: 'USD', inland: 900, customs: 150 }
      ]
    },
    ja: {
      pol: 'JPTYO', pod: 'USLAX', polName: '', podName: '', ctype: '40ft GP', fx: 159.3, fxAuto: true, weight: 18000, qty: 1,
      cols: [
        { cid: 'one', of: 1180, baf: 240, dest: 62000, destCur: 'JPY', inland: 78000, customs: 24000 },
        { cid: 'maersk', of: 1240, baf: 255, dest: 60000, destCur: 'JPY', inland: 76000, customs: 23000 },
        { cid: 'kmtc', of: 1120, baf: 230, dest: 58000, destCur: 'JPY', inland: 75000, customs: 22000 }
      ]
    },
    zh: {
      pol: 'CNSHA', pod: 'NLRTM', polName: '', podName: '', ctype: '40ft GP', fx: 6.66, fxAuto: true, weight: 18000, qty: 1,
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
  function portField(key, label) {
    var sel = state[key];
    var opts = sortPorts(key === 'pod' ? POD_ORDER : POL_ORDER).map(function (p) {
      return '<option value="' + p.code + '"' + (p.code === sel ? ' selected' : '') + '>' +
        esc(pname(p)) + (p.code ? ' · ' + p.code : '') + '</option>';
    }).join('');
    opts += '<option value="custom"' + (sel === 'custom' ? ' selected' : '') + '>' + esc(UI.customOpt) + '</option>';
    var h = '<div class="fr-field"><label for="fr-' + key + '">' + label + '</label>' +
      '<select id="fr-' + key + '" data-port="' + key + '">' + opts + '</select></div>';
    if (sel === 'custom') {
      h += '<div class="fr-field"><label for="fr-' + key + '-name">' + label + ' <i>' + esc(UI.customOpt) + '</i></label>' +
        '<input type="text" id="fr-' + key + '-name" data-portname="' + key + '" value="' + esc(state[key + 'Name'] || '') +
        '" placeholder="' + esc(UI.customPh) + '"></div>';
    }
    return h;
  }

  function renderGlobal() {
    var h = portField('pol', UI.pol) + portField('pod', UI.pod);

    h += '<div class="fr-field"><label for="fr-ctype">' + UI.ctype + '</label><select id="fr-ctype">' +
      ['20ft GP', '40ft GP', '40ft HQ', 'LCL'].map(function (c) {
        return '<option value="' + c + '"' + (c === state.ctype ? ' selected' : '') + '>' + c + '</option>';
      }).join('') + '</select></div>';

    h += '<div class="fr-field"><label for="fr-fx">' + UI.fx + ' <i>' + CUR.code + '</i><i id="fr-fx-src">' + (state.fxAuto ? ((state.fxDate ? state.fxDate + ' ' : '') + UI.fxAuto) : UI.manual) + '</i></label>' +
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
      '<div class="fr-sum-card route"><span class="k">' + esc(UI.sumRoute) + '</span>' +
      '<div class="v">' + esc(portLabel('pol')) + ' <b>→</b> ' + esc(portLabel('pod')) + '</div>' +
      '<div class="s">' + esc(state.ctype) + ' · ' + fmt(state.qty) + UI.unitEa + ' · ' + fmt(state.weight) + ' ' + UI.unitKg + '</div></div>' +
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

    outNote.textContent = portLabel('pol') + ' → ' + portLabel('pod') + ' · ' + state.ctype + ' · ' + fmt(state.qty) + UI.unitEa + ' · ' + UI.outNote;
    rankNote.textContent = UI.rankNote;
  }

  /* ---------------- 복사용 요약 (구간 포함) ---------------- */
  function legacyCopy(txt) {
    try {
      var ta = document.createElement('textarea');
      ta.value = txt;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.top = '-1000px';
      document.body.appendChild(ta);
      ta.select();
      var ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return ok;
    } catch (e) { return false; }
  }

  function summaryText() {
    var rows = calc();
    if (!rows.length) return '';
    var order = rows.map(function (r, i) { return { r: r, i: i }; })
      .sort(function (a, b) { return a.r.total - b.r.total; });
    var min = order[0].r.total;
    var lines = [];
    lines.push('INSIGHT BRIEF · ' + UI.total);
    lines.push(portLabel('pol') + ' → ' + portLabel('pod') + ' · ' + state.ctype + ' · ' +
      fmt(state.qty) + UI.unitEa + ' · ' + fmt(state.weight) + ' ' + UI.unitKg);
    if (CUR.code === 'USD') lines.push(UI.usdNote);
    else lines.push(UI.fxShort + ' 1 USD = ' + fmt2(state.fx) + ' ' + CUR.code);
    order.forEach(function (o, k) {
      var r = o.r;
      var name = cname(carrierById(state.cols[o.i].cid));
      var tail = k === 0 ? '  ← ' + UI.bestTag : '  ' + UI.gapTag + ' +' + money(r.total - min);
      var inUsd = CUR.code === 'USD' ? '' : ' (US$' + fmt(r.usd) + ')';
      lines.push((k + 1) + '. ' + name + ' ' + money(r.total) + inUsd + tail);
    });
    var mtMin = null, mtName = '';
    rows.forEach(function (r, i) {
      if (r.perMt != null && (mtMin == null || r.perMt < mtMin)) { mtMin = r.perMt; mtName = cname(carrierById(state.cols[i].cid)); }
    });
    if (mtMin != null) lines.push(UI.sumMt + ': ' + mtName + ' ' + money(mtMin));
    lines.push('https://insightbriefnews.com/' + (LANG === 'ko' ? '' : LANG + '/') + 'freight.html');
    return lines.join('\n');
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
      if (t.hasAttribute && t.hasAttribute('data-portname')) {
        state[t.getAttribute('data-portname') + 'Name'] = t.value;
        renderResults(); return;
      }
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
      if (t.hasAttribute && t.getAttribute('data-port')) {
        var pk = t.getAttribute('data-port');
        state[pk] = t.value;
        if (t.value !== 'custom') state[pk + 'Name'] = '';
        renderGlobal(); renderResults();
        return;
      }
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
        var keepDate = state.fxDate;
        state = JSON.parse(JSON.stringify(DEFAULTS));
        state.fxDate = keepDate;
        renderGlobal(); renderTable(); renderResults();
        toast(UI.resetDone);
        return;
      }
      if (t.id === 'fr-copy') {
        var txt = summaryText();
        if (!txt) return;
        var ok = function () { toast(UI.copied); };
        var no = function () { toast(UI.copyFail); };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(txt).then(ok, function () { legacyCopy(txt) ? ok() : no(); });
        } else if (!legacyCopy(txt)) no();
        return;
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
        state.fxDate = date;
        var el = $('#fr-fx');
        if (el) el.value = state.fx;
        var src = $('#fr-fx-src');
        if (src) src.textContent = (date ? date + ' ' : '') + UI.fxAuto;
        renderResults();
      }).catch(function () { });
  }

  function init() {
    if (!globalEl || !thead) return;
    var cb = document.getElementById('fr-copy');
    if (cb) cb.textContent = UI.copy;
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
