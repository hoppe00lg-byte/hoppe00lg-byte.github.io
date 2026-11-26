/* =========================================================
   INSIGHT BRIEF — B2B · B2C · C2C 글로벌 소싱 & 도착원가 계산기 (sourcing.html)
   · 서버 호출 없음(환율 기본값만 사이트 시황 데이터에서 한 번 읽습니다).
   · 사진은 FileReader 로 브라우저 안에서만 미리보기 합니다(업로드 없음).
   · 개인통관고유부호는 화면 안에서만 쓰고 저장하지 않습니다.
   · 계산 결과 문구는 페이지 언어(ko·en·zh·ja)에 맞춰 이 파일이 직접 그립니다.
   ========================================================= */
(function () {
  'use strict';

  var LANG = (document.documentElement.getAttribute('lang') || 'ko').toLowerCase().slice(0, 2);
  if (['ko', 'en', 'zh', 'ja'].indexOf(LANG) < 0) LANG = 'ko';

  var LOCALE = { ko: 'ko-KR', en: 'en-US', zh: 'zh-CN', ja: 'ja-JP' }[LANG];
  var PAGE_CUR = { ko: 'KRW', en: 'USD', zh: 'CNY', ja: 'JPY' }[LANG];
  var VAT_RATE = 0.1;
  var LIMIT_US = 150;
  var LIMIT_US_ORIGIN = 200;
  var LIMIT_DECLARE_ONLY = 2000;

  /* ---------------- 통화·환율 ---------------- */
  var SYM = { KRW: '₩', USD: 'US$', CNY: 'CN¥', JPY: 'JPY ' };
  var FX = { USD: 1343.9, CNY: 201.57, JPY: 8.4437 };
  var FX_DATE = '';

  /* ---------------- 화면 문구 ---------------- */
  var T = {
    ko: {
      total: '총 도착원가', totalSub: '집 앞까지 전부',
      tax: '세금 합계', taxSub: '관세 + 부가세',
      perKg: 'kg당 도착원가', perKgSub: '총중량 기준',
      perUnit: '단가 기준 1단위당', perUnitSub: '입력한 단가 단위',
      ratio: '물품대 대비', ratioSub: '운송·세금 배수',
      goods: '물품대금 (FOB)', goodsSub: '단가 × 수량',
      goodsC: '물품 가격', goodsCSub: '현지 배송비 포함',
      goodsD: '물품 가격', goodsDSub: '판매자에게 지급',
      freight: '국제운송료', freightSub: '운송 방식에 따라 자동',
      ins: '보험료', insSub: '물품대금+운송료 기준',
      cif: '과세가격 (CIF)', cifSub: '물품대금+운송+보험',
      duty: '관세', dutySub: '과세가격 × 관세율',
      vat: '부가세', vatSub: '(과세가격+관세) × 10%',
      clear: '통관수수료', clearSub: '관세사·통관 대행',
      inland: '국내 내륙운송', inlandSub: '항만·공항 → 창고',
      local: '현지 배송비', localSub: '발송국 안에서 발생',
      intl: '국제 배송비', intlSub: '한국까지',
      forward: '배대지·대행 수수료', forwardSub: '합배송·검수',
      domestic: '국내 배송비', domesticSub: '집 앞 마지막 구간',
      safe: '안전결제 수수료', safeSub: '에스크로·보호결제',
      agency: '구매대행 수수료', agencySub: '대행사 수수료',
      row: '항목', amount: '금액', note: '계산 근거',
      sumTitle: '도착원가 요약', tableTitle: '계산 내역',
      verdictFree: '면세 · 목록통관', verdictTax: '과세 · 수입신고', verdictExcluded: '수입신고 대상(목록통관 배제)',
      verdictBiz: '과세 · 사업용/판매용',
      bizMsg: '판매·사업용이면 자가사용 소액 면세가 적용되지 않습니다. 수입신고 후 관세·부가세를 납부합니다.',
      freeMsg: '물품가격이 {limit} 이하이고 자가사용 범위라면 목록통관으로 관세·부가세가 붙지 않습니다.',
      taxMsg: '물품가격 {limit}를 넘어 과세 대상입니다. 국제 배송비·보험료까지 과세가격에 들어갑니다.',
      exclMsg: '이 품목은 목록통관 배제 대상이라 금액과 상관없이 수입신고를 거치며, 면세 한도는 국가 구분 없이 {limit}입니다.',
      limitLabel: '적용 면세 한도',
      limitRoom: '한도까지 남은 금액',
      overLimit: '한도 초과 금액',
      rateLine: '관세율 {rate}% · 부가세 10% 적용',
      noTaxLine: '관세 0원 · 부가세 0원 (면세)',
      modeNote: '적용 운송 기준',
      modeFcl20: 'FCL 20ft · 28 CBM 적재 기준으로 {n}대',
      modeFcl40: 'FCL 40ft · 58 CBM 적재 기준으로 {n}대',
      modeLcl: 'LCL · 용적/중량(W/M) 중 큰 값 {v} CBM 기준',
      modeAir: '항공 · 용적환산(1 CBM = 167kg)과 실중량 중 큰 값 {v} kg 기준',
      reset: '예시값으로 되돌리기', resetDone: '예시값으로 되돌렸습니다',
      presetApplied: '예시를 불러왔습니다 — 아래 결과에서 숫자만 바꿔 보세요.',
      qLabel: '검색어', qEmpty: '품목명이나 CAS 번호를 넣으면 이 검색어로 바로 연결됩니다.',
      qNow: '이 검색어로 연결됩니다',
      copied: '복사했습니다',
      codeOk: '형식 확인', codeBad: '형식 확인 필요', codeNote: 'P + 12자리 숫자 (예: P123456789012)',
      photoEmpty: '사진 없음', photoNote: '사진은 서버로 전송되지 않고 이 브라우저 안에서만 미리보기로 보입니다. 새로고침하면 사라집니다.',
      photoClear: '사진 지우기', photoBig: '8MB 이하 이미지 파일을 골라 주세요',
      fxHint: '시황판 환율 USD {usd} · CNY {cny} · JPY {jpy}원 (1단위)',
      fxDate: '시황판 {date} 기준',
      fxEditable: '직접 고쳐도 됩니다',
      hintFcl: 'USD / 컨테이너 1대', hintLcl: 'USD / CBM (W/M 중 큰 값)', hintAir: 'USD / kg (용적환산 167kg/CBM)',
      hintFreightNote: '고른 운송 방식의 단위당 운임입니다',
      warnZero: '금액과 수량을 넣으면 바로 계산됩니다.',
      taxOnlyLocal: '표시 금액은 원화 환산이며, 결제 통화·환율은 카드사 기준과 다를 수 있습니다.',
      ratioTimes: '{v}배'
    },
    en: {
      total: 'Total landed cost', totalSub: 'all the way home',
      tax: 'Duty & VAT', taxSub: 'duty + VAT',
      perKg: 'Cost per kg', perKgSub: 'on gross weight',
      perUnit: 'Cost per unit', perUnitSub: 'per price unit you entered',
      ratio: 'Against goods value', ratioSub: 'landed multiple',
      goods: 'Goods value (FOB)', goodsSub: 'unit price × quantity',
      goodsC: 'Item price', goodsCSub: 'incl. local shipping',
      goodsD: 'Item price', goodsDSub: 'paid to the seller',
      freight: 'International freight', freightSub: 'by transport mode',
      ins: 'Insurance', insSub: 'on goods + freight',
      cif: 'Customs value (CIF)', cifSub: 'goods + freight + insurance',
      duty: 'Customs duty', dutySub: 'customs value × rate',
      vat: 'VAT', vatSub: '(customs value + duty) × 10%',
      clear: 'Customs broker fee', clearSub: 'clearance handling',
      inland: 'Inland haulage', inlandSub: 'port → warehouse',
      local: 'Local shipping', localSub: 'inside the sending country',
      intl: 'International shipping', intlSub: 'to Korea',
      forward: 'Forwarder / proxy fee', forwardSub: 'consolidation, inspection',
      domestic: 'Domestic delivery', domesticSub: 'last leg to your door',
      safe: 'Buyer protection fee', safeSub: 'escrow / protected payment',
      agency: 'Proxy purchase fee', agencySub: 'agency commission',
      row: 'Item', amount: 'Amount', note: 'Basis',
      sumTitle: 'Landed cost summary', tableTitle: 'Calculation detail',
      verdictFree: 'Duty-free · list clearance', verdictTax: 'Taxable · import declaration', verdictExcluded: 'Import declaration required (not eligible for list clearance)',
      verdictBiz: 'Taxable · commercial use',
      bizMsg: 'Goods for resale or business use get no personal-use exemption: duty and VAT are payable after an import declaration.',
      freeMsg: 'If the goods price is at or under {limit} and the goods are for personal use, list clearance applies with no duty or VAT.',
      taxMsg: 'The goods price is over {limit}, so duty and VAT apply. International shipping and insurance are included in the customs value.',
      exclMsg: 'This kind of goods is excluded from list clearance, so an import declaration is filed whatever the price, and the duty-free limit is {limit}.',
      limitLabel: 'Duty-free limit applied',
      limitRoom: 'Room left under the limit',
      overLimit: 'Amount over the limit',
      rateLine: 'Duty {rate}% · VAT 10%',
      noTaxLine: 'Duty zero · VAT zero (duty-free)',
      modeNote: 'Transport basis applied',
      modeFcl20: 'FCL 20ft · {n} container(s) at 28 CBM each',
      modeFcl40: 'FCL 40ft · {n} container(s) at 58 CBM each',
      modeLcl: 'LCL · chargeable {v} CBM (greater of volume and weight)',
      modeAir: 'Air · chargeable {v} kg (greater of volumetric 167 kg/CBM and actual weight)',
      reset: 'Back to the sample values', resetDone: 'Reset to the sample values',
      presetApplied: 'Example loaded — change any number in the result below.',
      qLabel: 'Search term', qEmpty: 'Enter an item name or CAS number and every card opens that search.',
      qNow: 'Linked to this search term',
      copied: 'Copied',
      codeOk: 'Format OK', codeBad: 'Check the format', codeNote: 'P plus 12 digits (e.g. P123456789012)',
      photoEmpty: 'No photo', photoNote: 'The photo never leaves this browser — it is only a local preview and disappears on reload.',
      photoClear: 'Remove photo', photoBig: 'Please choose an image under 8 MB',
      fxHint: 'Market board rates: USD {usd} · CNY {cny} · JPY {jpy} KRW per unit',
      fxDate: 'market board, {date}',
      fxEditable: 'editable',
      hintFcl: 'USD / container', hintLcl: 'USD / CBM (greater of volume and weight)', hintAir: 'USD / kg (167 kg per CBM)',
      hintFreightNote: 'Freight per unit of the mode you pick',
      warnZero: 'Enter an amount and a quantity to see the result.',
      taxOnlyLocal: 'Amounts are shown in KRW; your card issuer may use a different rate.',
      ratioTimes: '{v}x'
    },
    zh: {
      total: '到手总成本', totalSub: '含送到家门口',
      tax: '税费合计', taxSub: '关税 + 增值税',
      perKg: '每公斤成本', perKgSub: '按毛重',
      perUnit: '每计价单位成本', perUnitSub: '按你输入的单价单位',
      ratio: '相当于货款', ratioSub: '含运税倍数',
      goods: '货款（FOB）', goodsSub: '单价 × 数量',
      goodsC: '商品价格', goodsCSub: '含当地运费',
      goodsD: '商品价格', goodsDSub: '付给卖家',
      freight: '国际运费', freightSub: '按运输方式自动计算',
      ins: '保险费', insSub: '按货款+运费',
      cif: '完税价格（CIF）', cifSub: '货款+运费+保险',
      duty: '关税', dutySub: '完税价格 × 税率',
      vat: '增值税', vatSub: '（完税价格+关税）× 10%',
      clear: '报关代理费', clearSub: '清关服务',
      inland: '国内内陆运输', inlandSub: '港口·机场 → 仓库',
      local: '当地配送费', localSub: '发件国内发生',
      intl: '国际运费', intlSub: '到韩国',
      forward: '转运·代收手续费', forwardSub: '合箱、验货',
      domestic: '韩国国内配送', domesticSub: '最后一段',
      safe: '担保支付手续费', safeSub: '托管·买家保护',
      agency: '代购手续费', agencySub: '代购佣金',
      row: '项目', amount: '金额', note: '计算依据',
      sumTitle: '到手成本摘要', tableTitle: '计算明细',
      verdictFree: '免税 · 目录通关', verdictTax: '课税 · 进口申报', verdictExcluded: '需进口申报（不适用目录通关）',
      verdictBiz: '课税 · 商用/转售',
      bizMsg: '用于转售或经营时，不适用自用小额免税，进口申报后需缴纳关税和增值税。',
      freeMsg: '货物价格在 {limit} 以下且属于自用时，可按目录通关，不征收关税和增值税。',
      taxMsg: '货物价格超过 {limit}，属于课税对象。国际运费和保险费也计入完税价格。',
      exclMsg: '该类商品不适用目录通关，无论金额多少都要进口申报，免税限额为 {limit}。',
      limitLabel: '适用免税限额',
      limitRoom: '距限额剩余',
      overLimit: '超出限额',
      rateLine: '关税率 {rate}% · 增值税 10%',
      noTaxLine: '关税 0 · 增值税 0（免税）',
      modeNote: '适用运输基准',
      modeFcl20: 'FCL 20ft · 按 28 CBM 装载 {n} 个柜',
      modeFcl40: 'FCL 40ft · 按 58 CBM 装载 {n} 个柜',
      modeLcl: 'LCL · 按体积/重量(W/M)较大值 {v} CBM',
      modeAir: '空运 · 按体积重(1 CBM=167kg)与实重较大值 {v} kg',
      reset: '恢复示例数值', resetDone: '已恢复示例数值',
      presetApplied: '已载入示例——可在下方结果中直接修改数字。',
      qLabel: '搜索词', qEmpty: '输入品名或 CAS 号后，各卡片会直接带上该搜索词。',
      qNow: '已带上该搜索词',
      copied: '已复制',
      codeOk: '格式正确', codeBad: '请检查格式', codeNote: 'P 加 12 位数字（例：P123456789012）',
      photoEmpty: '无照片', photoNote: '照片不会上传服务器，只在本浏览器内预览，刷新后消失。',
      photoClear: '删除照片', photoBig: '请选择 8MB 以下的图片',
      fxHint: '行情板汇率：1 单位 = USD {usd} · CNY {cny} · JPY {jpy} 韩元',
      fxDate: '行情板 {date} 基准',
      fxEditable: '可自行修改',
      hintFcl: 'USD / 每柜', hintLcl: 'USD / 每 CBM（体积与重量取大）', hintAir: 'USD / 每 kg（体积重 167kg/CBM）',
      hintFreightNote: '所选运输方式的单位运价',
      warnZero: '填入金额和数量即可计算。',
      taxOnlyLocal: '金额以韩元折算，发卡行汇率可能不同。',
      ratioTimes: '{v} 倍'
    },
    ja: {
      total: '着地総コスト', totalSub: '自宅まで全部',
      tax: '税金合計', taxSub: '関税 + 付加価値税',
      perKg: 'kg当たりコスト', perKgSub: '総重量ベース',
      perUnit: '1単価単位当たり', perUnitSub: '入力した単価単位',
      ratio: '商品代に対する倍率', ratioSub: '輸送・税金込み',
      goods: '商品代金（FOB）', goodsSub: '単価 × 数量',
      goodsC: '商品価格', goodsCSub: '現地配送料込み',
      goodsD: '商品価格', goodsDSub: '出品者への支払',
      freight: '国際輸送費', freightSub: '輸送方式から自動計算',
      ins: '保険料', insSub: '商品代+輸送費ベース',
      cif: '課税価格（CIF）', cifSub: '商品代+輸送+保険',
      duty: '関税', dutySub: '課税価格 × 関税率',
      vat: '付加価値税', vatSub: '（課税価格+関税）× 10%',
      clear: '通関手数料', clearSub: '通関代行',
      inland: '国内陸送費', inlandSub: '港・空港 → 倉庫',
      local: '現地配送料', localSub: '発送国内で発生',
      intl: '国際配送料', intlSub: '韓国まで',
      forward: '転送・代行手数料', forwardSub: '同梱・検品',
      domestic: '韓国内配送', domesticSub: '最後の区間',
      safe: '安全決済手数料', safeSub: 'エスクロー・保護決済',
      agency: '購入代行手数料', agencySub: '代行業者の手数料',
      row: '項目', amount: '金額', note: '計算根拠',
      sumTitle: '着地コスト概要', tableTitle: '計算内訳',
      verdictFree: '免税 · リスト通関', verdictTax: '課税 · 輸入申告', verdictExcluded: '輸入申告が必要（リスト通関の対象外）',
      verdictBiz: '課税 · 業務用/転売',
      bizMsg: '転売や業務用の場合、自家使用の少額免税は適用されません。輸入申告後に関税・付加価値税を納めます。',
      freeMsg: '商品価格が {limit} 以下で自家使用の範囲なら、リスト通関となり関税・付加価値税はかかりません。',
      taxMsg: '商品価格が {limit} を超えるため課税対象です。国際配送料と保険料も課税価格に含まれます。',
      exclMsg: 'この品目はリスト通関の対象外のため、金額にかかわらず輸入申告が必要で、免税限度は {limit} です。',
      limitLabel: '適用される免税限度',
      limitRoom: '限度までの残額',
      overLimit: '限度超過額',
      rateLine: '関税率 {rate}% · 付加価値税 10%',
      noTaxLine: '関税 0 · 付加価値税 0（免税）',
      modeNote: '適用した輸送基準',
      modeFcl20: 'FCL 20ft · 28 CBM 積みで {n} 本',
      modeFcl40: 'FCL 40ft · 58 CBM 積みで {n} 本',
      modeLcl: 'LCL · 容積/重量(W/M)の大きい値 {v} CBM 基準',
      modeAir: '航空 · 容積換算(1 CBM=167kg)と実重量の大きい値 {v} kg 基準',
      reset: 'サンプル値に戻す', resetDone: 'サンプル値に戻しました',
      presetApplied: 'サンプルを読み込みました — 下の結果で数字だけ変えてみてください。',
      qLabel: '検索語', qEmpty: '品名か CAS 番号を入れると、各カードがその検索語で開きます。',
      qNow: 'この検索語で開きます',
      copied: 'コピーしました',
      codeOk: '形式OK', codeBad: '形式を確認', codeNote: 'P + 12桁の数字（例：P123456789012）',
      photoEmpty: '写真なし', photoNote: '写真はサーバーに送信されず、このブラウザ内だけでプレビューします。再読み込みで消えます。',
      photoClear: '写真を削除', photoBig: '8MB 以下の画像を選んでください',
      fxHint: '市況板レート：1単位 = USD {usd} · CNY {cny} · JPY {jpy} ウォン',
      fxDate: '市況板 {date} 基準',
      fxEditable: '手入力もできます',
      hintFcl: 'USD / コンテナ1本', hintLcl: 'USD / CBM（容積と重量の大きい方）', hintAir: 'USD / kg（容積換算167kg/CBM）',
      hintFreightNote: '選んだ輸送方式の単位当たり運賃',
      warnZero: '金額と数量を入れるとすぐ計算します。',
      taxOnlyLocal: '金額はウォン換算です。カード会社のレートとは異なる場合があります。',
      ratioTimes: '{v}倍'
    }
  }[LANG];

  /* ---------------- 도우미 ---------------- */
  function $(id) { return document.getElementById(id); }
  function val(id, dflt) {
    var el = $(id);
    if (!el) return dflt || 0;
    var v = parseFloat(String(el.value).replace(/[,\s₩$¥원]/g, ''));
    return isFinite(v) ? v : (dflt || 0);
  }
  function txt(id) { var el = $(id); return el ? String(el.value || '').trim() : ''; }
  function fm(n, dec) {
    if (!isFinite(n)) n = 0;
    return Number(n).toLocaleString(LOCALE, dec ? { minimumFractionDigits: dec, maximumFractionDigits: dec } : { maximumFractionDigits: 0 });
  }
  function krw(n) { return '₩' + fm(Math.round(n)); }
  function curSym(c) { return SYM[c] || c + ' '; }
  function cur(n, c) {
    if (c === 'KRW') return krw(n);
    if (c === 'JPY') return 'JPY ' + fm(Math.round(n));
    return curSym(c) + fm(n, 2);
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function fmtTpl(tpl, map) {
    return String(tpl).replace(/\{(\w+)\}/g, function (m, k) { return map[k] != null ? map[k] : m; });
  }
  function fxOf(c) { return FX[c] || FX.USD; }

  /* 입력한 통화 → 원화 (패널의 적용 환율을 우선) */
  function toKrw(amount, c, r) { return amount * (r > 0 ? r : fxOf(c)); }

  /* 표시용 보조 통화 */
  function second(krwAmount) {
    if (PAGE_CUR === 'KRW') return '≈ ' + cur(krwAmount / FX.USD, 'USD');
    return '≈ ' + cur(krwAmount / fxOf(PAGE_CUR), PAGE_CUR);
  }

  /* 운송 방식별 예시 운임(USD/컨테이너·CBM·kg) — 방식을 바꿀 때 예시값이면 같이 바꿔 줍니다. */
  var FREIGHT_DEF = { fcl20: 2400, fcl40: 3800, lcl: 45, air: 4.5 };

  /* 예시 금액은 통화마다 비슷한 원화 값이 되도록 따로 둡니다. */
  var SAMPLE = {
    b2c: { USD: 89, CNY: 600, JPY: 13400, KRW: 120000 },
    c2c: { USD: 180, CNY: 1200, JPY: 27000, KRW: 242000 }
  };
  var prevCur = { c: 'USD', d: 'USD' };
  var lastMode = 'fcl20';

  function syncFreightHint() {
    var sel = $('sc-b-mode'), el = $('sc-b-freight-hint');
    if (!sel || !el) return;
    var m = sel.value;
    var unit = m === 'lcl' ? T.hintLcl : (m === 'air' ? T.hintAir : T.hintFcl);
    el.textContent = T.hintFreightNote + ' · ' + unit;
  }

  var toastTimer = null;
  function toast(msg) {
    var el = $('sc-toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove('on'); }, 2200);
  }

  /* ---------------- 환율 기본값 ---------------- */
  function loadFx() {
    var base = /^\/(en|zh|ja)\//.test(location.pathname) ? '../' : '';
    if (typeof fetch !== 'function') { paintFxHints(); return; }
    fetch(base + 'data/market.json', { cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) {
        if (!d || !d.oilFx) return;
        d.oilFx.forEach(function (x) {
          if (x.code === 'USD/KRW' && x.price > 0) { FX.USD = x.price; FX_DATE = x.date || ''; }
          if (x.code === 'CNY/KRW' && x.price > 0) FX.CNY = x.price;
          if (x.code === 'JPY/KRW' && x.price > 0) FX.JPY = x.price / 100;
        });
        applyFxToFields();
        paintFxHints();
        recalcAll();
      })
      .catch(function () { paintFxHints(); });
  }

  function paintFxHints() {
    ['sc-b-fx-hint', 'sc-c-fx-hint', 'sc-d-fx-hint'].forEach(function (id) {
      var el = $(id);
      if (!el) return;
      el.textContent = fmtTpl(T.fxHint, {
        usd: fm(FX.USD, 2), cny: fm(FX.CNY, 2), jpy: fm(Math.round(FX.JPY * 100) / 100, 2)
      }) + (FX_DATE ? ' · ' + FX_DATE : '') + ' · ' + T.fxEditable;
    });
  }

  /* 통화 select 가 바뀌면 그 통화의 기준 환율을 넣습니다(사용자가 고친 값은 유지). */
  function syncFxField(selId, fxId, touchedKey) {
    var sel = $(selId), fx = $(fxId);
    if (!sel || !fx) return;
    var c = sel.value;
    if (touched[touchedKey]) return;
    fx.value = round2(fxOf(c));
  }
  function round2(n) { return Math.round(n * 100) / 100; }

  /* 통화를 바꿨을 때, 입력값이 예시 금액 그대로면 그 통화의 예시 금액으로 바꿔 줍니다. */
  function swapSample(k) {
    var kind = k === 'c' ? 'b2c' : 'c2c';
    var sel = $('sc-' + k + '-cur'), priceEl = $('sc-' + k + '-price');
    if (!sel || !priceEl) return;
    var now = sel.value, before = prevCur[k];
    if (before === now) return;
    var v = parseFloat(String(priceEl.value).replace(/[,\s]/g, ''));
    if (isFinite(v) && Math.abs(v - SAMPLE[kind][before]) < 1e-9) priceEl.value = SAMPLE[kind][now];
    prevCur[k] = now;
  }
  var touched = {};

  /* ---------------- 결과 그리기 ---------------- */
  function cards(list) {
    return '<div class="sc-sum">' + list.map(function (c) {
      return '<div class="sc-card' + (c.main ? ' main' : '') + '">' +
        '<div class="k">' + esc(c.k) + '</div>' +
        '<div class="v">' + c.v + '</div>' +
        (c.w ? '<div class="w">' + c.w + '</div>' : '') +
        (c.s ? '<div class="s">' + esc(c.s) + '</div>' : '') +
        '</div>';
    }).join('') + '</div>';
  }

  function table(rows, caption) {
    return '<div class="sc-table-wrap"><table class="sc-table">' +
      '<thead><tr><th>' + esc(T.row) + '</th><th style="text-align:right">' + esc(T.amount) + '</th><th>' + esc(T.note) + '</th></tr></thead>' +
      '<tbody>' + rows.map(function (r) {
        if (r.grp) return '<tr class="grp"><td colspan="3">' + esc(r.grp) + '</td></tr>';
        var cls = r.total ? ' class="total"' : '';
        return '<tr' + cls + '><td>' + esc(r.k) + '<small>' + esc(r.s || '') + '</small></td>' +
          '<td class="n' + (r.dim ? ' dim' : '') + '">' + r.v + '</td>' +
          '<td><small>' + esc(r.note || '') + '</small></td></tr>';
      }).join('') + '</tbody>' +
      (caption ? '<caption>' + esc(caption) + '</caption>' : '') +
      '</table></div>';
  }

  function verdict(badgeCls, badgeText, msg) {
    return '<div class="sc-verdict"><span class="sc-badge ' + badgeCls + '">' + esc(badgeText) + '</span><p>' + esc(msg) + '</p></div>';
  }

  /* ---------------- B2B ---------------- */
  function calcB2B() {
    var out = $('sc-b-out');
    if (!out) return;

    var price = val('sc-b-price'), qty = val('sc-b-qty');
    var pc = $('sc-b-cur') ? $('sc-b-cur').value : 'USD';
    var basis = $('sc-b-basis') ? $('sc-b-basis').value : 'kg';
    var weight = val('sc-b-weight'), cbm = val('sc-b-cbm');
    var mode = $('sc-b-mode') ? $('sc-b-mode').value : 'fcl20';
    var rate = val('sc-b-freight');
    var insPct = val('sc-b-ins');
    var dutyPct = val('sc-b-duty');
    var fee = val('sc-b-fee'), inland = val('sc-b-inland');
    var fxr = val('sc-b-fx') > 0 ? val('sc-b-fx') : fxOf(pc);

    var fob = price * qty;
    var fobKrw = toKrw(fob, pc, fxr);

    var containers = 0, charge = 0, freightUsd = 0, modeNote = '';
    if (mode === 'fcl20') {
      containers = Math.max(1, Math.ceil((cbm || 0) / 28));
      freightUsd = rate * containers;
      modeNote = fmtTpl(T.modeFcl20, { n: containers });
    } else if (mode === 'fcl40') {
      containers = Math.max(1, Math.ceil((cbm || 0) / 58));
      freightUsd = rate * containers;
      modeNote = fmtTpl(T.modeFcl40, { n: containers });
    } else if (mode === 'lcl') {
      charge = Math.max(1, Math.max(cbm || 0, (weight || 0) / 1000));
      freightUsd = rate * charge;
      modeNote = fmtTpl(T.modeLcl, { v: fm(charge, 2) });
    } else {
      charge = Math.max(weight || 0, (cbm || 0) * 167);
      freightUsd = rate * charge;
      modeNote = fmtTpl(T.modeAir, { v: fm(charge, 1) });
    }
    var freightKrw = freightUsd * FX.USD;    var insKrw = (fobKrw + freightKrw) * (insPct / 100);
    var cif = fobKrw + freightKrw + insKrw;
    var duty = cif * (dutyPct / 100);
    var vat = (cif + duty) * VAT_RATE;
    var total = cif + duty + vat + fee + inland;

    if (!(fob > 0)) {
      out.innerHTML = '<div class="sc-sec-head"><h2>' + esc(T.sumTitle) + '</h2></div>' +
        '<p class="sc-table-note">' + esc(T.warnZero) + '</p>';
      return;
    }

    var perBase = qty > 0 ? total / qty : 0;
    var perKg = weight > 0 ? total / weight : 0;
    var ratio = fobKrw > 0 ? total / fobKrw : 0;

    out.innerHTML =
      '<div class="sc-sec-head"><h2>' + esc(T.sumTitle) + '</h2><span>' + esc(modeNote) + '</span></div>' +
      cards([
        { k: T.total, v: krw(total), w: second(total), s: T.totalSub, main: true },
        { k: T.perKg, v: perKg ? krw(perKg) : '—', s: T.perKgSub },
        { k: T.perUnit, v: perBase ? krw(perBase) : '—', s: T.perUnitSub + ' · ' + basis },
        { k: T.tax, v: krw(duty + vat), w: second(duty + vat), s: fmtTpl(T.rateLine, { rate: fm(dutyPct, 1) }) }
      ]) +
      '<div class="sc-sec-head" style="margin-top:16px"><h2>' + esc(T.tableTitle) + '</h2><span>' + esc(T.taxOnlyLocal) + '</span></div>' +
      table([
        { k: T.goods, s: T.goodsSub, v: cur(fob, pc), note: cur(price, pc) + ' × ' + fm(qty) },
        { k: T.freight, s: T.freightSub, v: cur(freightUsd, 'USD'), note: modeNote },
        { k: T.ins, s: T.insSub, v: krw(insKrw), note: fm(insPct, 2) + '%' },
        { k: T.cif, s: T.cifSub, v: krw(cif), note: '' },
        { k: T.duty, s: T.dutySub, v: krw(duty), note: fm(dutyPct, 1) + '%' },
        { k: T.vat, s: T.vatSub, v: krw(vat), note: '' },
        { k: T.clear, s: T.clearSub, v: krw(fee), note: '' },
        { k: T.inland, s: T.inlandSub, v: krw(inland), note: '' },
        { k: T.total, s: '', v: krw(total), note: fmtTpl(T.ratioTimes, { v: fm(ratio, 2) }), total: true }
      ]) +
      '<p class="sc-table-note">' + esc(T.modeNote) + ': ' + esc(modeNote) + '</p>';
  }

  /* ---------------- B2C / C2C 공통 판정 ---------------- */
  function judge(goodsKrw, originUs, excluded, usdRate, business) {
    var rate = usdRate > 0 ? usdRate : FX.USD;
    var goodsUsd = goodsKrw / rate;
    var limitUsd = (originUs && !excluded) ? LIMIT_US_ORIGIN : LIMIT_US;
    if (excluded) return { kind: 'excluded', limitUsd: LIMIT_US, goodsUsd: goodsUsd, taxable: true };
    if (business) return { kind: 'biz', limitUsd: LIMIT_US, goodsUsd: goodsUsd, taxable: true };
    if (goodsUsd > limitUsd) return { kind: 'tax', limitUsd: limitUsd, goodsUsd: goodsUsd, taxable: true };
    return { kind: 'free', limitUsd: limitUsd, goodsUsd: goodsUsd, taxable: false };
  }

  function verdictBlock(j) {
    var limit = cur(j.limitUsd, 'USD');
    if (j.kind === 'excluded') return verdict('warn', T.verdictExcluded, fmtTpl(T.exclMsg, { limit: limit }));
    if (j.kind === 'biz') return verdict('tax', T.verdictBiz, fmtTpl(T.bizMsg, { limit: limit }));
    if (j.kind === 'tax') return verdict('tax', T.verdictTax, fmtTpl(T.taxMsg, { limit: limit }));
    return verdict('free', T.verdictFree, fmtTpl(T.freeMsg, { limit: limit }));
  }

  /* ---------------- B2C ---------------- */
  function calcB2C() {
    var out = $('sc-c-out');
    if (!out) return;

    var price = val('sc-c-price'), localShip = val('sc-c-localship');
    var c = $('sc-c-cur') ? $('sc-c-cur').value : 'USD';
    var intlShip = val('sc-c-intl'), ins = val('sc-c-ins');
    var forward = val('sc-c-forward'), domestic = val('sc-c-domestic');
    var dutyPct = val('sc-c-duty');
    var originUs = $('sc-c-origin') ? $('sc-c-origin').value === 'us' : true;
    var excluded = $('sc-c-excluded') ? $('sc-c-excluded').checked : false;
    var rate = val('sc-c-fx') > 0 ? val('sc-c-fx') : fxOf(c);

    var goodsKrw = toKrw(price + localShip, c, rate);
    var intlKrw = toKrw(intlShip, c, rate);
    var insKrw = toKrw(ins, c, rate);
    var j = judge(goodsKrw, originUs, excluded, c === 'USD' ? rate : FX.USD);
    var cif = goodsKrw + intlKrw + insKrw;
    var duty = j.taxable ? cif * (dutyPct / 100) : 0;
    var vat = j.taxable ? (cif + duty) * VAT_RATE : 0;
    var tax = duty + vat;
    var total = goodsKrw + intlKrw + insKrw + forward + domestic + tax;

    /* 개인통관고유부호 형식 확인(저장하지 않음) */
    var codeEl = $('sc-c-code'), codeBadge = $('sc-c-code-badge');
    if (codeBadge && codeEl) {
      var code = String(codeEl.value || '').trim().toUpperCase();
      if (!code) codeBadge.innerHTML = '<span class="sc-badge" style="display:none"></span>';
      else if (/^P\d{12}$/.test(code)) codeBadge.innerHTML = '<span class="sc-badge free">' + esc(T.codeOk) + '</span>';
      else codeBadge.innerHTML = '<span class="sc-badge warn">' + esc(T.codeBad) + '</span>';
    }

    if (!(goodsKrw > 0)) {
      out.innerHTML = '<div class="sc-sec-head"><h2>' + esc(T.sumTitle) + '</h2></div>' +
        '<p class="sc-table-note">' + esc(T.warnZero) + '</p>';
      return;
    }

    var ratio = goodsKrw > 0 ? total / goodsKrw : 0;
    var room = j.limitUsd - j.goodsUsd;

    out.innerHTML =
      '<div class="sc-sec-head"><h2>' + esc(T.sumTitle) + '</h2><span>' + esc(T.limitLabel) + ' ' + esc(cur(j.limitUsd, 'USD')) + '</span></div>' +
      verdictBlock(j) +
      cards([
        { k: T.total, v: krw(total), w: second(total), s: T.totalSub, main: true },
        { k: T.tax, v: tax ? krw(tax) : krw(0), s: j.taxable ? fmtTpl(T.rateLine, { rate: fm(dutyPct, 1) }) : T.noTaxLine },
        { k: room >= 0 ? T.limitRoom : T.overLimit, v: cur(Math.abs(room), 'USD'), s: cur(j.goodsUsd, 'USD') + ' / ' + cur(j.limitUsd, 'USD') },
        { k: T.ratio, v: fmtTpl(T.ratioTimes, { v: fm(ratio, 2) }), s: T.ratioSub }
      ]) +
      '<div class="sc-sec-head" style="margin-top:16px"><h2>' + esc(T.tableTitle) + '</h2><span>' + esc(T.taxOnlyLocal) + '</span></div>' +
      table([
        { k: T.goodsC, s: T.goodsCSub, v: cur(price + localShip, c), note: cur(price, c) + ' + ' + cur(localShip, c) },
        { k: T.intl, s: T.intlSub, v: cur(intlShip, c), note: '' },
        { k: T.ins, s: '', v: cur(ins, c), note: '' },
        { k: T.cif, s: T.cifSub, v: krw(cif), note: '' },
        { k: T.duty, s: T.dutySub, v: krw(duty), note: j.taxable ? fm(dutyPct, 1) + '%' : '0%' },
        { k: T.vat, s: T.vatSub, v: krw(vat), note: '' },
        { k: T.forward, s: T.forwardSub, v: krw(forward), note: '' },
        { k: T.domestic, s: T.domesticSub, v: krw(domestic), note: '' },
        { k: T.total, s: '', v: krw(total), note: fmtTpl(T.ratioTimes, { v: fm(ratio, 2) }), total: true }
      ]);
  }

  /* ---------------- C2C ---------------- */
  function calcC2C() {
    var out = $('sc-d-out');
    if (!out) return;

    var price = val('sc-d-price');
    var c = $('sc-d-cur') ? $('sc-d-cur').value : 'USD';
    var intlShip = val('sc-d-intl'), ins = val('sc-d-ins');
    var safePct = val('sc-d-safe'), agencyPct = val('sc-d-agency');
    var domestic = val('sc-d-domestic'), dutyPct = val('sc-d-duty');
    var business = $('sc-d-business') ? $('sc-d-business').checked : false;
    var excluded = false;
    var originUs = c === 'USD';
    var rate = val('sc-d-fx') > 0 ? val('sc-d-fx') : fxOf(c);

    var goodsKrw = toKrw(price, c, rate);
    var intlKrw = toKrw(intlShip, c, rate);
    var insKrw = toKrw(ins, c, rate);
    var safeFee = goodsKrw * (safePct / 100);
    var agencyFee = goodsKrw * (agencyPct / 100);
    var j = judge(goodsKrw, originUs, excluded, c === 'USD' ? rate : FX.USD, business);
    var cif = goodsKrw + intlKrw + insKrw;
    var duty = j.taxable ? cif * (dutyPct / 100) : 0;
    var vat = j.taxable ? (cif + duty) * VAT_RATE : 0;
    var tax = duty + vat;
    var fees = safeFee + agencyFee;
    var total = goodsKrw + intlKrw + insKrw + fees + domestic + tax;

    if (!(goodsKrw > 0)) {
      out.innerHTML = '<div class="sc-sec-head"><h2>' + esc(T.sumTitle) + '</h2></div>' +
        '<p class="sc-table-note">' + esc(T.warnZero) + '</p>';
      return;
    }

    var ratio = goodsKrw > 0 ? total / goodsKrw : 0;

    out.innerHTML =
      '<div class="sc-sec-head"><h2>' + esc(T.sumTitle) + '</h2><span>' + esc(T.limitLabel) + ' ' + esc(cur(j.limitUsd, 'USD')) + '</span></div>' +
      verdictBlock(j) +
      cards([
        { k: T.total, v: krw(total), w: second(total), s: T.totalSub, main: true },
        { k: T.tax, v: tax ? krw(tax) : krw(0), s: j.taxable ? fmtTpl(T.rateLine, { rate: fm(dutyPct, 1) }) : T.noTaxLine },
        { k: T.safe + ' + ' + T.agency, v: krw(fees), s: fm(safePct, 1) + '% + ' + fm(agencyPct, 1) + '%' },
        { k: T.ratio, v: fmtTpl(T.ratioTimes, { v: fm(ratio, 2) }), s: T.ratioSub }
      ]) +
      '<div class="sc-sec-head" style="margin-top:16px"><h2>' + esc(T.tableTitle) + '</h2><span>' + esc(T.taxOnlyLocal) + '</span></div>' +
      table([
        { k: T.goodsD, s: T.goodsDSub, v: cur(price, c), note: '' },
        { k: T.intl, s: T.intlSub, v: cur(intlShip, c), note: '' },
        { k: T.ins, s: '', v: cur(ins, c), note: '' },
        { k: T.safe, s: T.safeSub, v: krw(safeFee), note: fm(safePct, 1) + '%' },
        { k: T.agency, s: T.agencySub, v: krw(agencyFee), note: fm(agencyPct, 1) + '%' },
        { k: T.cif, s: T.cifSub, v: krw(cif), note: '' },
        { k: T.duty, s: T.dutySub, v: krw(duty), note: j.taxable ? fm(dutyPct, 1) + '%' : '0%' },
        { k: T.vat, s: T.vatSub, v: krw(vat), note: '' },
        { k: T.domestic, s: T.domesticSub, v: krw(domestic), note: '' },
        { k: T.total, s: '', v: krw(total), note: fmtTpl(T.ratioTimes, { v: fm(ratio, 2) }), total: true }
      ]);
  }

  function recalcAll() {
    calcB2B(); calcB2C(); calcC2C();
  }

  /* ---------------- 검색 카드 ---------------- */
  var LINKS = {
    b2b: [
      { id: 'sc-b-lookchem', url: function (q) { return 'https://www.lookchem.com/newsell/searchdata.aspx?key=' + encodeURIComponent(q); } },
      { id: 'sc-b-chemsrc', url: function (q) { return 'https://www.chemsrc.com/en/doSearch.jsp?queryname=' + encodeURIComponent(q); } },
      { id: 'sc-b-alibaba', url: function (q) { return 'https://www.alibaba.com/trade/search?SearchText=' + encodeURIComponent(q); } },
      { id: 'sc-b-1688', url: function (q) { return 'https://s.1688.com/selloffer/offer_search.htm?keywords=' + encodeURIComponent(q); } },
      { id: 'sc-b-mic', url: function (q) { return 'https://www.made-in-china.com/products-search/hot-china-products/' + encodeURIComponent(q) + '.html'; } }
    ],
    b2c: [
      { id: 'sc-c-amazon', url: function (q) { return 'https://www.amazon.com/s?k=' + encodeURIComponent(q); } },
      { id: 'sc-c-taobao', url: function (q) { return 'https://s.taobao.com/search?q=' + encodeURIComponent(q); } },
      { id: 'sc-c-aliexpress', url: function (q) { return 'https://www.aliexpress.com/wholesale?SearchText=' + encodeURIComponent(q); } },
      { id: 'sc-c-rakuten', url: function (q) { return 'https://search.rakuten.co.jp/search/mall/' + encodeURIComponent(q) + '/'; } },
      { id: 'sc-c-iherb', url: function (q) { return 'https://www.iherb.com/search?kw=' + encodeURIComponent(q); } }
    ],
    c2c: [
      { id: 'sc-d-ebay', url: function (q) { return 'https://www.ebay.com/sch/i.html?_nkw=' + encodeURIComponent(q); } },
      { id: 'sc-d-mercari', url: function (q) { return 'https://jp.mercari.com/search?keyword=' + encodeURIComponent(q); } },
      { id: 'sc-d-stockx', url: function (q) { return 'https://stockx.com/search?s=' + encodeURIComponent(q); } },
      { id: 'sc-d-daangn', url: function (q) { return 'https://www.daangn.com/kr/buy-sell/?search=' + encodeURIComponent(q); } },
      { id: 'sc-d-bunjang', url: function (q) { return 'https://m.bunjang.co.kr/search/products?q=' + encodeURIComponent(q); } }
    ]
  };

  function syncLinks(tab) {
    var nameId = { b2b: 'sc-b-name', b2c: 'sc-c-name', c2c: 'sc-d-name' }[tab];
    var extraId = { b2b: 'sc-b-cas', b2c: '', c2c: '' }[tab];
    var qEl = $('sc-' + tab.charAt(0) + '-query');
    var q = txt(nameId) || (extraId ? txt(extraId) : '');
    LINKS[tab].forEach(function (l) {
      var a = $(l.id);
      if (!a) return;
      a.setAttribute('href', q ? l.url(q) : '#');
      if (q) a.removeAttribute('aria-disabled'); else a.setAttribute('aria-disabled', 'true');
    });
    if (qEl) {
      if (q) {
        qEl.innerHTML = '<span class="qk">' + esc(T.qLabel) + '</span><span class="qv">' + esc(q) + '</span>' +
          '<span class="qh">' + esc(T.qNow) + '</span>';
      } else {
        qEl.innerHTML = '<span class="qk">' + esc(T.qLabel) + '</span><span class="qh">' + esc(T.qEmpty) + '</span>';
      }
    }
  }

  /* ---------------- 사진 미리보기 ---------------- */
  function wirePhoto(inputId, boxId, clearId) {
    var input = $(inputId), box = $(boxId), clear = $(clearId);
    if (!input || !box) return;
    var url = null;
    function clearPhoto() {
      if (url) { URL.revokeObjectURL(url); url = null; }
      input.value = '';
      box.innerHTML = '<span>' + esc(T.photoEmpty) + '</span>';
    }
    input.addEventListener('change', function () {
      var f = input.files && input.files[0];
      if (!f) { clearPhoto(); return; }
      if (f.size > 8 * 1024 * 1024) { toast(T.photoBig); clearPhoto(); return; }
      if (!/^image\//.test(f.type)) { clearPhoto(); return; }
      if (url) URL.revokeObjectURL(url);
      url = URL.createObjectURL(f);
      var img = document.createElement('img');
      img.alt = f.name;
      img.src = url;
      box.innerHTML = '';
      box.appendChild(img);
    });
    if (clear) clear.addEventListener('click', clearPhoto);
  }

  /* ---------------- 예시값 ---------------- */
  var DEFAULTS = {
    'sc-b-price': '2.15', 'sc-b-qty': '20000', 'sc-b-weight': '20000', 'sc-b-cbm': '32',
    'sc-b-freight': '2400', 'sc-b-ins': '0.3', 'sc-b-duty': '6.5', 'sc-b-fee': '44000', 'sc-b-inland': '250000',
    'sc-c-price': '89', 'sc-c-localship': '0', 'sc-c-intl': '18', 'sc-c-ins': '0', 'sc-c-forward': '8000',
    'sc-c-domestic': '4000', 'sc-c-duty': '8', 'sc-c-intl-ship': '',
    'sc-d-price': '180', 'sc-d-intl': '25', 'sc-d-ins': '0', 'sc-d-safe': '0', 'sc-d-agency': '10',
    'sc-d-domestic': '4000', 'sc-d-duty': '8'
  };

  function resetPanel(which) {
    var ids = which === 'b2b'
      ? ['sc-b-price', 'sc-b-qty', 'sc-b-weight', 'sc-b-cbm', 'sc-b-freight', 'sc-b-ins', 'sc-b-duty', 'sc-b-fee', 'sc-b-inland']
      : which === 'b2c'
        ? ['sc-c-price', 'sc-c-localship', 'sc-c-intl', 'sc-c-ins', 'sc-c-forward', 'sc-c-domestic', 'sc-c-duty']
        : ['sc-d-price', 'sc-d-intl', 'sc-d-ins', 'sc-d-safe', 'sc-d-agency', 'sc-d-domestic', 'sc-d-duty'];
    ids.forEach(function (id) { if ($(id) && DEFAULTS[id] !== undefined) $(id).value = DEFAULTS[id]; });
    if (which === 'b2b' && $('sc-b-mode')) {
      lastMode = $('sc-b-mode').value;
      if ($('sc-b-freight')) $('sc-b-freight').value = FREIGHT_DEF[lastMode];
      syncFreightHint();
    }
    if (which === 'b2b' && $('sc-b-name')) $('sc-b-name').value = '';
    if (which === 'b2b' && $('sc-b-cas')) $('sc-b-cas').value = '';
    if (which === 'b2b' && $('sc-b-hs')) $('sc-b-hs').value = '';
    if (which === 'b2c' && $('sc-c-code')) $('sc-c-code').value = '';
    if (which === 'b2c' && $('sc-c-price') && $('sc-c-cur')) $('sc-c-price').value = SAMPLE.b2c[$('sc-c-cur').value];
    if (which === 'c2c' && $('sc-d-price') && $('sc-d-cur')) $('sc-d-price').value = SAMPLE.c2c[$('sc-d-cur').value];
    touched = {};
    applyFxToFields();
    syncLinks(which);
    recalcAll();
    toast(T.resetDone);
  }

  function applyFxToFields() {
    [['sc-b-cur', 'sc-b-fx', 'b'], ['sc-c-cur', 'sc-c-fx', 'c'], ['sc-d-cur', 'sc-d-fx', 'd']].forEach(function (p) {
      var sel = $(p[0]), fx = $(p[1]);
      if (!sel || !fx) return;
      if (touched[p[2]]) return;
      fx.value = round2(fxOf(sel.value));
    });
  }

  /* ---------------- 탭 ---------------- */
  function showTab(key, push) {
    var tabs = document.querySelectorAll('.sc-tab');
    if (!tabs.length) return;
    var found = false;
    Array.prototype.forEach.call(tabs, function (b) {
      var on = b.getAttribute('data-tab') === key;
      if (on) found = true;
      b.setAttribute('aria-selected', on ? 'true' : 'false');
      b.setAttribute('tabindex', on ? '0' : '-1');
    });
    if (!found) key = 'b2b';
    ['b2b', 'b2c', 'c2c'].forEach(function (k) {
      var p = $('sc-panel-' + k);
      if (p) p.hidden = (k !== key);
    });
    syncLinks(key);
    if (push && history.replaceState) history.replaceState(null, '', '#' + key);
  }

  function initTabs() {
    var tabs = document.querySelectorAll('.sc-tab');
    Array.prototype.forEach.call(tabs, function (b, i) {
      b.addEventListener('click', function () { showTab(b.getAttribute('data-tab'), true); });
      b.addEventListener('keydown', function (e) {
        var k = e.key;
        if (k !== 'ArrowRight' && k !== 'ArrowLeft' && k !== 'Home' && k !== 'End') return;
        e.preventDefault();
        var n = k === 'ArrowRight' ? (i + 1) % tabs.length
          : k === 'ArrowLeft' ? (i - 1 + tabs.length) % tabs.length
            : k === 'Home' ? 0 : tabs.length - 1;
        tabs[n].focus();
        showTab(tabs[n].getAttribute('data-tab'), true);
      });
    });
    var h = (location.hash || '').replace('#', '');
    showTab(['b2b', 'b2c', 'c2c'].indexOf(h) >= 0 ? h : 'b2b', false);
    window.addEventListener('hashchange', function () {
      var x = (location.hash || '').replace('#', '');
      if (['b2b', 'b2c', 'c2c'].indexOf(x) >= 0) showTab(x, false);
    });
  }

  /* ---------------- 원클릭 예시 3개 ----------------
     방문자가 버튼 한 번으로 계산 결과를 보게 합니다(품목·수량·운임·세율 채움).
     예시 이름·메모는 페이지 언어로 직접 쓰고, 통화가 갈리는 값은 통화별로 둡니다. */
  function px(v) { return (v && typeof v === 'object') ? (v[LANG] || v.ko) : v; }

  var PRESETS = {
    b2b: {
      tab: 'b2b', letter: 'b',
      name: {
        ko: '폴리카보네이트(PC) 재생펠릿',
        en: 'Polycarbonate (PC) regrind pellets',
        zh: '聚碳酸酯(PC)再生颗粒',
        ja: 'ポリカーボネート(PC)再生ペレット'
      },
      memo: {
        ko: 'PC 리그라인드, MFI 12, 등급 A, 사출용. MSDS·TDS 확인. 샘플 25kg 별도.',
        en: 'PC regrind, MFI 12, grade A, for injection moulding. MSDS/TDS required. 25 kg sample separately.',
        zh: 'PC 再生料，MFI 12，A 级，注塑用。需 MSDS/TDS，样品 25kg 另计。',
        ja: 'PC リグラインド、MFI 12、A グレード、射出成形用。MSDS/TDS 要確認。サンプル 25kg は別途。'
      },
      fields: {
        'sc-b-name': null, 'sc-b-memo': null,
        'sc-b-cas': '25037-45-0', 'sc-b-hs': '3907.40', 'sc-b-duty': '6.5',
        'sc-b-price': '2.15', 'sc-b-cur': 'USD', 'sc-b-basis': 'kg',
        'sc-b-qty': '20000', 'sc-b-weight': '20000', 'sc-b-cbm': '32',
        'sc-b-mode': 'fcl20', 'sc-b-freight': '2400', 'sc-b-ins': '0.3',
        'sc-b-fee': '44000', 'sc-b-inland': '250000'
      }
    },
    b2c: {
      tab: 'b2c', letter: 'c',
      name: {
        ko: '휴대용 미니 가습기 (USB-C, 500ml)',
        en: 'Portable mini humidifier (USB-C, 500 ml)',
        zh: '便携迷你加湿器（USB-C，500ml）',
        ja: 'ポータブルミニ加湿器（USB-C・500ml）'
      },
      memo: {
        ko: '알리·아마존 단품 직구. 220V 겸용 여부와 KC 인증 확인. 같은 날 같은 판매처 2개는 합산과세 주의.',
        en: 'Single unit from AliExpress or Amazon. Check dual voltage and local certification; two units from one seller on the same day can be combined for duty.',
        zh: '阿里、亚马逊单件直购。确认是否220V兼容与KC认证；同日同一卖家两件会合并计税。',
        ja: 'AliExpress・Amazon の単品購入。220V 対応と KC 認証を確認。同日・同一販売者の2点は合算課税に注意。'
      },
      fixed: { 'sc-c-localship': '0', 'sc-c-ins': '0', 'sc-c-forward': '8000', 'sc-c-domestic': '4000', 'sc-c-duty': '8' },
      origin: 'cn',
      cur: { ko: 'USD', en: 'USD', zh: 'CNY', ja: 'JPY' },
      price: { USD: '42', CNY: '299', JPY: '6300', KRW: '56000' },
      intl: { USD: '12', CNY: '85', JPY: '1800', KRW: '16000' }
    },
    c2c: {
      tab: 'c2c', letter: 'd',
      name: {
        ko: '빈티지 데님 재킷 (90s, 미국 빈티지숍)',
        en: 'Vintage denim jacket (90s, US vintage shop)',
        zh: '复古牛仔夹克（90年代，美国古着店）',
        ja: 'ヴィンテージデニムジャケット（90s・US古着屋）'
      },
      memo: {
        ko: '중고 상(사용감 적음). 정품 택·실측 사이즈 확인. 국내 리셀용으로 판매·사업용 판정.',
        en: 'Used, excellent condition. Check original tags and measurements. Declared for resale in Korea.',
        zh: '二手良好。确认原标与实测尺寸，按国内转售（销售用）申报。',
        ja: '中古上（使用感少なめ）。正規タグと実寸を確認。国内リセール前提の販売用申告。'
      },
      fixed: { 'sc-d-cond': 'used-hi', 'sc-d-safe': '5', 'sc-d-agency': '0', 'sc-d-ins': '0', 'sc-d-domestic': '4000', 'sc-d-duty': '13' },
      business: true,
      cur: { ko: 'USD', en: 'USD', zh: 'CNY', ja: 'JPY' },
      price: { USD: '180', CNY: '1250', JPY: '27000', KRW: '240000' },
      intl: { USD: '25', CNY: '170', JPY: '3600', KRW: '33000' }
    }
  };

  function applyPreset(key) {
    var p = PRESETS[key];
    if (!p) return;
    resetPanel(p.tab);            /* 예시값으로 초기화한 뒤 그 위에 채웁니다 */
    showTab(p.tab, true);

    if (key === 'b2b') {
      if ($('sc-b-name')) $('sc-b-name').value = px(p.name);
      if ($('sc-b-memo')) $('sc-b-memo').value = px(p.memo);
      Object.keys(p.fields).forEach(function (id) {
        if (p.fields[id] != null && $(id)) $(id).value = p.fields[id];
      });
      lastMode = $('sc-b-mode') ? $('sc-b-mode').value : 'fcl20';
      syncFreightHint();
    } else {
      var k = p.letter, curSel = $('sc-' + k + '-cur');
      if ($('sc-' + k + '-name')) $('sc-' + k + '-name').value = px(p.name);
      var memoEl = $(key === 'b2c' ? 'sc-c-use' : 'sc-d-memo');
      if (memoEl) memoEl.value = px(p.memo);
      var cur = p.cur[LANG] || 'USD';
      if (curSel) curSel.value = cur;
      if ($('sc-' + k + '-price')) $('sc-' + k + '-price').value = p.price[cur] || p.price.USD;
      if ($('sc-' + k + '-intl')) $('sc-' + k + '-intl').value = p.intl[cur] || p.intl.USD;
      Object.keys(p.fixed).forEach(function (id) { if ($(id)) $(id).value = p.fixed[id]; });
      if (key === 'b2c' && $('sc-c-origin')) $('sc-c-origin').value = p.origin;
      if (p.business && $('sc-d-business')) $('sc-d-business').checked = true;
      touched[k] = false;
      syncFxField('sc-' + k + '-cur', 'sc-' + k + '-fx', k);
    }

    applyFxToFields();
    syncLinks(p.tab);
    recalcAll();
    Array.prototype.forEach.call(document.querySelectorAll('.sc-preset'), function (b) {
      b.setAttribute('aria-pressed', b.getAttribute('data-preset') === key ? 'true' : 'false');
    });
    toast(T.presetApplied);
    var out = $('sc-' + p.letter + '-out');
    if (out && out.scrollIntoView) out.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function initPresets() {
    Array.prototype.forEach.call(document.querySelectorAll('.sc-preset'), function (b) {
      b.setAttribute('aria-pressed', 'false');
      b.addEventListener('click', function () { applyPreset(b.getAttribute('data-preset')); });
    });
  }

  /* ---------------- 시작 ---------------- */
  function boot() {
    initTabs();
    initPresets();

    /* 탭 내부 입력이 바뀌면 그 탭만 다시 계산합니다. */
    ['b2b', 'b2c', 'c2c'].forEach(function (k) {
      var panel = $('sc-panel-' + k);
      if (!panel) return;
      panel.addEventListener('input', function (e) {
        var id = e.target && e.target.id;
        if (id === 'sc-b-fx') touched.b = true;
        if (id === 'sc-c-fx') touched.c = true;
        if (id === 'sc-d-fx') touched.d = true;
        if (k === 'b2b') { calcB2B(); if (id === 'sc-b-name' || id === 'sc-b-cas') syncLinks('b2b'); }
        if (k === 'b2c') { calcB2C(); if (id === 'sc-c-name') syncLinks('b2c'); }
        if (k === 'c2c') { calcC2C(); if (id === 'sc-d-name') syncLinks('c2c'); }
      });
      panel.addEventListener('change', function (e) {
        var id = e.target && e.target.id;
        if (id === 'sc-b-cur') { touched.b = false; syncFxField('sc-b-cur', 'sc-b-fx', 'b'); }
        if (id === 'sc-c-cur') { touched.c = false; swapSample('c'); syncFxField('sc-c-cur', 'sc-c-fx', 'c'); }
        if (id === 'sc-d-cur') { touched.d = false; swapSample('d'); syncFxField('sc-d-cur', 'sc-d-fx', 'd'); }
        recalcAll();
      });
    });

    var modeSel = $('sc-b-mode'), freightEl = $('sc-b-freight');
    if (modeSel && freightEl) {
      modeSel.addEventListener('change', function () {
        var m = modeSel.value;
        var cur = parseFloat(String(freightEl.value).replace(/[,\s]/g, ''));
        if (!isFinite(cur) || Math.abs(cur - FREIGHT_DEF[lastMode]) < 1e-9) {
          freightEl.value = FREIGHT_DEF[m];
        }
        lastMode = m;
        syncFreightHint();
        calcB2B();
      });
    }
    syncFreightHint();

    var r1 = $('sc-b-reset'), r2 = $('sc-c-reset'), r3 = $('sc-d-reset');
    if (r1) r1.addEventListener('click', function () { resetPanel('b2b'); });
    if (r2) r2.addEventListener('click', function () { resetPanel('b2c'); });
    if (r3) r3.addEventListener('click', function () { resetPanel('c2c'); });

    wirePhoto('sc-c-photo', 'sc-c-prev', 'sc-c-clear');
    wirePhoto('sc-d-photo', 'sc-d-prev', 'sc-d-clear');

    var code = $('sc-c-code');
    if (code) {
      code.addEventListener('input', calcB2C);
      code.setAttribute('autocomplete', 'off');
      code.setAttribute('spellcheck', 'false');
    }

    /* 통화 기본값: 페이지 언어에 맞춰 USD·CNY·JPY 중 하나를 골라 둡니다. */
    [['sc-c-cur', 'c', 'sc-c-price', 'b2c'], ['sc-d-cur', 'd', 'sc-d-price', 'c2c']].forEach(function (t) {
      var el = $(t[0]), priceEl = $(t[2]);
      if (!el) return;
      if (LANG === 'zh') el.value = 'CNY';
      else if (LANG === 'ja') el.value = 'JPY';
      else el.value = 'USD';
      prevCur[t[1]] = el.value;
      if (priceEl) priceEl.value = SAMPLE[t[3]][el.value];
    });

    applyFxToFields();
    paintFxHints();
    syncLinks('b2b'); syncLinks('b2c'); syncLinks('c2c');
    recalcAll();
    loadFx();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
