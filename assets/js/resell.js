/* =========================================================
   INSIGHT BRIEF — 해외직구 · 국내 중고 리셀 마진 계산기 (resell.html)
   · 서버 호출 없음(환율 기본값만 사이트 시황 데이터에서 한 번 읽습니다).
   · 입력값은 브라우저 안에서만 계산하고 저장하지 않습니다.
   · 결과 문구는 페이지 언어(ko·en·zh·ja)에 맞춰 이 파일이 직접 그립니다.
   ========================================================= */
(function () {
  'use strict';

  var LANG = (document.documentElement.getAttribute('lang') || 'ko').toLowerCase().slice(0, 2);
  if (['ko', 'en', 'zh', 'ja'].indexOf(LANG) < 0) LANG = 'ko';

  var LOCALE = { ko: 'ko-KR', en: 'en-US', zh: 'zh-CN', ja: 'ja-JP' }[LANG];
  var PAGE_CUR = { ko: 'KRW', en: 'USD', zh: 'CNY', ja: 'JPY' }[LANG];

  /* ---------------------------------------------------------------
     나라별 기준 — 이 페이지의 계산기·기본값이 어느 시장을 따르는지
       ko: 한국 목록통관 면세 $150(미국 $200) · 부가세 10% · 통관수수료 4,000원
       en: 미국 Section 321 면세 $800 · 연방 부가세 없음(주 판매세는 별도) · 통관수수료 없음
       zh: 중국 개인우편물 1회 한도 ¥1,000(홍콩·마카오 ¥800) · 행우세 13/20/50% · 세액 50위안 이하 면세
       ja: 일본 면세 한도 과세가격 ¥10,000(=소매 ¥16,666) · 소비세 10% · 과세가격은 소매가×0.6
     수수료·고정비는 각 시장 통화로 적는다(그 시장 페이지에서만 쓰인다).
  --------------------------------------------------------------- */
  var MKT = {
    ko: {
      cur: 'KRW', dec: 0, vat: 0.10, fee: 4000, tax: 'kr', limit: 150, limitUs: 200,
      rates: { KRW: 1, USD: 1343.9, EUR: 1474.6, GBP: 1761.2, JPY: 8.4437, CNY: 201.57, CAD: 943.7 },
      platforms: {
        kream: { fee: 6.6, fixed: 2750, label: '크림 KREAM (Level 1)' },
        bunjang: { fee: 6, fixed: 0, label: '번개장터' },
        naver: { fee: 4.95, fixed: 0, label: '네이버 스마트스토어 (영세)' },
        musinsa: { fee: 15, fixed: 7000, label: '무신사 유즈드 (위탁)' },
        daangn: { fee: 0, fixed: 0, label: '당근·직거래' }
      },
      order: ['kream', 'bunjang', 'naver', 'musinsa', 'daangn']
    },
    en: {
      cur: 'USD', dec: 2, vat: 0, fee: 0, tax: 'us', limit: 800, limitUs: 800,
      rates: { KRW: 0.000744, USD: 1, EUR: 1.0973, GBP: 1.3105, JPY: 0.006282, CNY: 0.15, CAD: 0.702 },
      platforms: {
        ebay: { fee: 13.6, fixed: 0.40, label: 'eBay (most categories)' },
        ebaycards: { fee: 13.25, fixed: 0.40, label: 'eBay (trading cards)' },
        ebaysneakers: { fee: 8, fixed: 0, label: 'eBay (sneakers $150+)' },
        stockx: { fee: 12, fixed: 5, label: 'StockX (9% + 3% processing)' },
        poshmark: { fee: 20, fixed: 0, label: 'Poshmark (flat 20%)' },
        mercurius: { fee: 10, fixed: 0, label: 'Mercari US (10%)' }
      },
      order: ['ebay', 'ebaycards', 'ebaysneakers', 'stockx', 'poshmark', 'mercurius']
    },
    zh: {
      cur: 'CNY', dec: 2, vat: 0, fee: 0, tax: 'cn', limit: 1000, limitUs: 1000,
      rates: { KRW: 0.00496, USD: 6.6667, EUR: 7.315, GBP: 8.737, JPY: 0.0419, CNY: 1, CAD: 4.68 },
      platforms: {
        xianyu: { fee: 0.6, fixed: 0, label: '闲鱼 (0.6%, 单笔最高60元)' },
        xianyupb: { fee: 1.6, fixed: 0, label: '闲鱼鱼小铺 (1.6%)' },
        dewu: { fee: 5, fixed: 0, label: '得物 Dewu (카테고리별 2~5%)' },
        taobao: { fee: 0.6, fixed: 0, label: '淘宝 (支付手续费 0.6%)' }
      },
      order: ['xianyu', 'xianyupb', 'dewu', 'taobao']
    },
    ja: {
      cur: 'JPY', dec: 0, vat: 0.10, fee: 0, tax: 'jp', limit: 16666, limitUs: 16666,
      rates: { KRW: 0.1185, USD: 159.2, EUR: 174.7, GBP: 208.6, JPY: 1, CNY: 23.9, CAD: 111.9 },
      platforms: {
        mercari: { fee: 10, fixed: 0, label: 'メルカリ (10%)' },
        snkrdunk: { fee: 9.5, fixed: 0, label: 'スニダン (9.5~7.0%)' },
        yahooauc: { fee: 10, fixed: 0, label: 'ヤフオク (10%)' },
        rakuma: { fee: 10, fixed: 0, label: 'ラクマ (10~4.5%)' },
        yahooflea: { fee: 5, fixed: 0, label: 'Yahoo!フリマ (5%)' }
      },
      order: ['mercari', 'snkrdunk', 'yahooauc', 'rakuma', 'yahooflea']
    }
  }[LANG];

  var SYM = { KRW: '₩', USD: 'US$', JPY: 'JPY ', EUR: '€', GBP: '£', CAD: 'C$', SEK: 'kr ', CNY: 'CN¥' };
  var FX = { USD: 1343.9, JPY: 8.4437, EUR: 1474.6, GBP: 1761.2, CAD: 943.7, SEK: 131.6, CNY: 201.57 };
  var FX_DATE = '';

  /* ---------------- 화면 문구 ---------------- */
  var T = {
    ko: {
      title: '정산·마진 요약', kicker: 'ESTIMATE',
      net: '순수익', netSub: '내 손에 남는 돈', netNeg: '손실입니다',
      settlement: '예상 정산액', settlementSub: '플랫폼이 빼고 주는 돈',
      roi: '마진율 (ROI)', roiSub: '순수익 ÷ 총 투입원가',
      cost: '총 투입원가', costSub: '매입·배송·세금·부대비용',
      bep: '손익분기 매입가', bepSub: '이보다 비싸면 손해',
      bepNone: '계산 범위 밖', bepFree: '0원에도 손해',
      freeBadge: '면세 · 목록통관', taxBadge: '과세 · 수입신고', bizBadge: '판매용 · 과세', domBadge: '국내 거래',
      freeMsg: '물품가 {goods}. 한도 {limit} 이하라 관부가세가 붙지 않습니다.',
      taxMsg: '물품가 {goods}. 한도 {limit}를 넘어 관세 {rate}%와 부가세 10%가 붙습니다.',
      bizMsg: '판매용이면 한도와 상관없이 관세 {rate}%와 부가세 10%가 붙습니다.',
      domMsg: '국내에서 사고팔면 관부가세가 없습니다. 플랫폼 수수료와 배송비만 봅니다.',
      limitLine: '한도 {limit} · 물품가 {goods}',
      memoTarget: '목표 마진 {p}% 판매가', memoSaleMargin: '판매가 대비 마진',
      memoPerUnit: '투입원가 대비 배수',
      tableTitle: '계산 내역', compareTitle: '플랫폼별 정산 비교', compareNote: '같은 판매가로 플랫폼만 바꿔 봤습니다. 수수료와 정액 수수료만 다릅니다.',
      colItem: '항목', colAmount: '금액', colNote: '근거', colPlatform: '플랫폼', colFee: '수수료', colSettle: '정산액', colNet: '순수익', colRoi: 'ROI',
      rBuy: '매입가', rBuySub: '현지 통화 × 환율', rLocal: '현지 배송비', rLocalSub: '발송국 안 배송',
      rIntl: '국제배송비', rIntlSub: '한국까지', rForward: '배대지 수수료', rForwardSub: '합배송·검수',
      rDuty: '관세', rDutySub: '과세가격 × 관세율', rVat: '부가세', rVatSub: '(과세가격+관세) × 10%',
      rOther: '기타 비용', rOtherSub: '검수·포장·광고', rCost: '총 투입원가',
      rSell: '판매가', rSellSub: '등록 가격', rFee: '플랫폼 수수료', rFeeSub: '판매가 × 수수료율 + 정액',
      rShipout: '판매자 배송비', rShipOutSub: '검수센터·구매자에게', rSettle: '예상 정산액', rNet: '순수익',
      grpCost: '투입', grpSell: '판매', grpProfit: '손익',
      warnZero: '매입가와 판매가를 넣으면 바로 계산됩니다.',
      best: '최고', selected: '선택', pctApplied: '{p}% + {w}원',
      fxHint: '시황판 환율 $1 = {usd}원 · ¥1 = {jpy}원',
      fxEditable: '직접 고쳐도 됩니다',
      eurHint: '유로는 시황판에 없어 참고값입니다. 직접 고쳐도 됩니다.',
      priceHint: '현지 배송비는 아래에서 따로 더합니다.',
      priceHintUsd: '≈ {usd} · 면세 한도 {limit}',
      catHint: '관세 {rate}% + 부가세 10%면 과세가격의 {eff}%가 세금입니다.',
      platformHint: '{fee}% + {fixed}원 (부가세 포함 기준)',
      platformHintNoFixed: '{fee}%',
      customHint: '수수료율과 정액 수수료를 직접 넣으세요.',
      salesNote: '플랫폼 수수료·정책은 2026년 11월 확인 기준이며, 등급·카테고리·이벤트에 따라 달라집니다.',
      toastDiff: '플랫폼을 바꾸면 수수료율이 함께 바뀝니다.'
    },
    en: {
      title: 'Settlement & margin', kicker: 'ESTIMATE',
      net: 'Net profit', netSub: 'what stays with you', netNeg: 'a loss',
      settlement: 'Expected settlement', settlementSub: 'what the platform pays out',
      roi: 'Return on cost', roiSub: 'net ÷ total cost',
      cost: 'Total cost', costSub: 'purchase, shipping, tax, fees',
      bep: 'Break-even purchase price', bepSub: 'above this you lose money',
      bepNone: 'out of range', bepFree: 'loses even at zero',
      freeBadge: 'Duty-free', taxBadge: 'Duty & VAT', bizBadge: 'Resale · taxed', domBadge: 'Domestic deal',
      freeMsg: 'Goods value {goods} — under the {limit} de minimis (Section 321), so no duty applies.',
      taxMsg: 'Goods value {goods} — over the {limit} de minimis, so {rate}% duty applies by HTS. No federal VAT.',
      bizMsg: 'Goods imported for resale are a business import: {rate}% duty applies from the first dollar.',
      domMsg: 'Buying and selling inside Korea means no duty or VAT — only platform fees and courier costs.',
      limitLine: 'limit {limit} · goods {goods}',
      memoTarget: 'Sale price for {p}% margin', memoSaleMargin: 'Margin on sale price',
      memoPerUnit: 'Landed multiple',
      tableTitle: 'Calculation detail', compareTitle: 'Settlement by platform', compareNote: 'Same sale price, only the platform changed. Fees and fixed fees differ.',
      colItem: 'Item', colAmount: 'Amount', colNote: 'Basis', colPlatform: 'Platform', colFee: 'Fee', colSettle: 'Settlement', colNet: 'Net profit', colRoi: 'ROI',
      rBuy: 'Purchase price', rBuySub: 'local currency × rate', rLocal: 'Local shipping', rLocalSub: 'inside the sending country',
      rIntl: 'International shipping', rIntlSub: 'to the US', rForward: 'Forwarder fee', rForwardSub: 'consolidation, inspection',
      rDuty: 'Customs duty', rDutySub: 'customs value × rate', rVat: 'VAT', rVatSub: 'no federal VAT at import',
      rOther: 'Other costs', rOtherSub: 'inspection, packing, ads', rCost: 'Total cost',
      rSell: 'Sale price', rSellSub: 'listing price', rFee: 'Platform fee', rFeeSub: 'price × rate + fixed',
      rShipout: 'Seller-paid delivery', rShipOutSub: 'to inspection centre or buyer', rSettle: 'Expected settlement', rNet: 'Net profit',
      grpCost: 'Cost', grpSell: 'Sale', grpProfit: 'Result',
      warnZero: 'Enter a purchase price and a sale price to see the result.',
      best: 'Best', selected: 'selected', pctApplied: '{p}% + {w}',
      fxHint: 'Market board rates: $1 = {usd} · ¥1 = {jpy} (in this page’s currency)',
      fxEditable: 'editable',
      eurHint: 'EUR is not on the market board; reference rate, editable.',
      priceHint: 'Local shipping is added separately below.',
      priceHintUsd: '≈ {usd} · duty-free limit {limit}',
      catHint: 'Duty {rate}% of the customs value; there is no US VAT at import.',
      platformHint: '{fee}% + {fixed}',
      platformHintNoFixed: '{fee}%',
      customHint: 'Enter the fee rate and the fixed fee yourself.',
      salesNote: 'Fees reflect policies confirmed in November 2026 and vary by seller level, category and promotion.',
      toastDiff: 'Changing the platform also changes the fee rate.'
    },
    zh: {
      title: '结算与利润', kicker: 'ESTIMATE',
      net: '净利润', netSub: '真正留在手里的钱', netNeg: '亏损',
      settlement: '预计结算额', settlementSub: '平台扣除后打给你的钱',
      roi: '成本回报率', roiSub: '净利润 ÷ 总投入',
      cost: '总投入成本', costSub: '采购·运费·税费·杂费',
      bep: '盈亏平衡采购价', bepSub: '高于此价就亏',
      bepNone: '超出计算范围', bepFree: '免费也亏',
      freeBadge: '免税 · 目录通关', taxBadge: '征税 · 进口申报', bizBadge: '转售 · 征税', domBadge: '国内交易',
      freeMsg: '物品价值 {goods}，未超过 {limit} 限额，免征行邮税。',
      taxMsg: '物品价值 {goods}，已超过 {limit} 限额，按行邮税 {rate}% 计征。',
      bizMsg: '转售用途属商业进口，需按货物报关并缴纳关税与增值税（参考税率 {rate}%）。',
      domMsg: '境内买卖不涉及行邮税，只需看平台手续费和快递费。',
      limitLine: '限额 {limit} · 物品价值 {goods}',
      memoTarget: '目标利润率 {p}% 的售价', memoSaleMargin: '占售价比的利润率',
      memoPerUnit: '投入成本倍数',
      tableTitle: '计算明细', compareTitle: '各平台结算比较', compareNote: '同一售价下只更换平台，差异仅在手续费与固定费用。',
      colItem: '项目', colAmount: '金额', colNote: '依据', colPlatform: '平台', colFee: '手续费', colSettle: '结算额', colNet: '净利润', colRoi: 'ROI',
      rBuy: '采购价', rBuySub: '当地货币 × 汇率', rLocal: '当地运费', rLocalSub: '发货国内配送',
      rIntl: '国际运费', rIntlSub: '运至中国', rForward: '转运公司费用', rForwardSub: '合箱·验货',
      rDuty: '行邮税', rDutySub: '完税价格 × 税率', rVat: '增值税', rVatSub: '个人物品不另征增值税',
      rOther: '其他费用', rOtherSub: '验货·包装·广告', rCost: '总投入成本',
      rSell: '售价', rSellSub: '挂牌价格', rFee: '平台手续费', rFeeSub: '售价 × 费率 + 固定费',
      rShipout: '卖家承担运费', rShipOutSub: '寄至检验中心或买家', rSettle: '预计结算额', rNet: '净利润',
      grpCost: '投入', grpSell: '销售', grpProfit: '损益',
      warnZero: '输入采购价与售价即可计算。',
      best: '最优', selected: '已选', pctApplied: '{p}% + {w}',
      fxHint: '行情板汇率：1单位 USD {usd} · JPY {jpy} · CNY {cny}',
      fxEditable: '可直接修改',
      eurHint: '行情板没有欧元，此处为参考值，可直接修改。',
      priceHint: '当地运费在下方另行计入。',
      priceHintUsd: '≈ {usd} · 免税限额 {limit}',
      catHint: '关税 {rate}% 加增值税 10%，相当于完税价格的 {eff}%。',
      platformHint: '{fee}% + {fixed}（含增值税）',
      platformHintNoFixed: '{fee}%',
      customHint: '请直接填写费率与固定费用。',
      salesNote: '手续费与政策为 2026 年 11 月确认的标准，卖家等级、品类与活动会影响实际金额。',
      toastDiff: '更换平台时费率会一并改变。'
    },
    ja: {
      title: '精算と粗利', kicker: 'ESTIMATE',
      net: '純利益', netSub: '手元に残る金額', netNeg: '赤字',
      settlement: '見込み精算額', settlementSub: 'プラットフォームから振り込まれる額',
      roi: 'コスト利益率', roiSub: '純利益 ÷ 総コスト',
      cost: '総コスト', costSub: '仕入・送料・税金・諸費用',
      bep: '損益分岐の仕入価格', bepSub: 'これより高いと赤字',
      bepNone: '計算範囲外', bepFree: '0円でも赤字',
      freeBadge: '免税 · リスト通関', taxBadge: '課税 · 輸入申告', bizBadge: '転売用 · 課税', domBadge: '国内取引',
      freeMsg: '物品価格 {goods}。課税価格が限度（小売16,666円が目安）以下なので関税・消費税はかかりません。',
      taxMsg: '物品価格 {goods}。免税限度を超えるため、関税 {rate}% と消費税 10% がかかります（課税価格は小売×0.6）。',
      bizMsg: '転売目的の輸入は個人使用の免税が使えず、関税 {rate}% と消費税 10% がかかります。',
      domMsg: '国内での売買は関税・消費税がかかりません。手数料と送料だけを見ます。',
      limitLine: '限度 {limit} · 物品価格 {goods}',
      memoTarget: '目標利益率 {p}% の販売価格', memoSaleMargin: '販売価格に対する粗利率',
      memoPerUnit: 'コスト倍率',
      tableTitle: '計算内訳', compareTitle: 'プラットフォーム別の精算比較', compareNote: '同じ販売価格でプラットフォームだけ変えた比較です。違いは手数料と固定費のみ。',
      colItem: '項目', colAmount: '金額', colNote: '根拠', colPlatform: 'プラットフォーム', colFee: '手数料', colSettle: '精算額', colNet: '純利益', colRoi: 'ROI',
      rBuy: '仕入価格', rBuySub: '現地通貨 × レート', rLocal: '現地送料', rLocalSub: '発送国内の配送',
      rIntl: '国際送料', rIntlSub: '日本まで', rForward: '転送業者手数料', rForwardSub: '同梱・検品',
      rDuty: '関税', rDutySub: '課税価格 × 税率', rVat: '消費税', rVatSub: '(課税価格+関税) × 10%',
      rOther: 'その他費用', rOtherSub: '検品・梱包・広告', rCost: '総コスト',
      rSell: '販売価格', rSellSub: '出品価格', rFee: 'プラットフォーム手数料', rFeeSub: '販売価格 × 率 + 固定費',
      rShipout: '売り手負担の送料', rShipOutSub: '検品センター・購入者へ', rSettle: '見込み精算額', rNet: '純利益',
      grpCost: 'コスト', grpSell: '販売', grpProfit: '損益',
      warnZero: '仕入価格と販売価格を入れるとすぐ計算します。',
      best: '最良', selected: '選択中', pctApplied: '{p}% + {w}',
      fxHint: '市況レート：$1 = {usd}円 · ¥1 = {jpy}円（このページの通貨）',
      fxEditable: '手入力もできます',
      eurHint: 'ユーロは市況板にないため参考値です。手入力もできます。',
      priceHint: '現地送料は下で別に加えます。',
      priceHintUsd: '≈ {usd} · 免税限度 {limit}',
      catHint: '関税 {rate}% と消費税 10% で、課税価格の約 {eff}% が税負担の目安です。',
      platformHint: '{fee}% + {fixed}',
      platformHintNoFixed: '{fee}%',
      customHint: '手数料率と固定費を直接入れてください。',
      salesNote: '手数料と方針は2026年11月時点で確認した公開情報です。等級・カテゴリ・キャンペーンで変わります。',
      toastDiff: 'プラットフォームを変えると手数料率も変わります。'
    }
  }[LANG];

  /* ---------------- 플랫폼 프리셋(이 나라 시장 기준) ---------------- */
  var PLATFORMS = {};
  MKT.order.forEach(function (k) { PLATFORMS[k] = MKT.platforms[k]; });
  PLATFORMS.custom = { fee: 0, fixed: 0, label: LANG === 'ko' ? '직접 입력' : (LANG === 'en' ? 'Custom' : (LANG === 'zh' ? '自定义' : '手入力')) };
  var COMPARE_ORDER = MKT.order.slice();

  /* ---------------- 도우미 ---------------- */
  function $(id) { return document.getElementById(id); }
  function val(id, dflt) {
    var el = $(id);
    if (!el) return dflt || 0;
    var v = parseFloat(String(el.value).replace(/[,\s₩$€¥원]/g, ''));
    return isFinite(v) ? v : (dflt || 0);
  }
  function selVal(id, dflt) { var el = $(id); return el ? el.value : dflt; }
  function fm(n, dec) {
    if (!isFinite(n)) n = 0;
    return Number(n).toLocaleString(LOCALE, dec ? { minimumFractionDigits: dec, maximumFractionDigits: dec } : { maximumFractionDigits: 0 });
  }
  function krw(n) {
    var v = MKT.dec ? Math.round(n * 100) / 100 : Math.round(n);
    var body = fm(Math.abs(v), MKT.dec);
    return (v < 0 ? '−' : '') + (SYM[MKT.cur] || MKT.cur) + body;
  }
  function cur(n, c) {
    if (c === 'KRW') return krw(n);
    if (c === 'JPY') return 'JPY ' + fm(Math.round(n));
    return (SYM[c] || c + ' ') + fm(n, n < 100 ? 2 : 0);
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function tpl(t, map) {
    return String(t).replace(/\{(\w+)\}/g, function (m, k) { return map[k] != null ? map[k] : m; });
  }
  function fxOf(c) { return MKT.rates[c] || MKT.rates.USD; }
  function second(amount) {
    /* 다른 통화로 한 번 더 보여 줍니다 — 페이지 밖 통화(원화·달러)로 감을 잡기 위해 */
    if (PAGE_CUR === 'KRW') return '≈ ' + cur(amount / fxOf('USD'), 'USD');
    var krwAmt = amount / fxOf('KRW');
    return '≈ ' + cur(krwAmt, 'KRW');
  }
  function cls(n) { return n < 0 ? ' neg' : ' pos'; }
  /* 한국판은 면세 한도를 달러로, 다른 나라판은 그 나라 통화로 보여 줍니다. */
  function limitTxt(m) { return MKT.tax === 'kr' ? cur(m.limit, 'USD') : cur(m.limit, PAGE_CUR); }
  function goodsTxt(m) { return MKT.tax === 'kr' ? cur(m.goodsUsd, 'USD') : cur(m.goodsKrw, PAGE_CUR); }

  /* ---------------- 핵심 계산 ---------------- */
  /* 해외직구: 세금은 (물품가+현지배송+국제운송) 기준, 면세 판정은 물품가(현지배송 포함)의 달러 환산액 */
  function abroadModel(p) {
    var rate = p.fx > 0 ? p.fx : fxOf(p.cur);    /* 1 현지 통화 = ? 페이지 통화 */
    var localKrw = p.local * rate;
    var goodsKrw = p.price * rate;
    var base = goodsKrw + localKrw + p.intl;     /* 과세가격(국제운송비 포함) */
    var goodsUsd = (p.price + p.local) * rate / fxOf('USD');
    /* 면세 한도는 이 나라 기준. 미국에서 보낸 물품(USD 결제)만 한국은 $200을 씁니다. */
    var limit = (MKT.tax === 'kr' && p.cur === 'USD') ? MKT.limitUs : MKT.limit;
    var taxable = p.business || goodsKrw > limit;
    var duty = 0, vat = 0;
    if (MKT.tax === 'jp') {
      /* 일본: 과세가격 = 소매가×0.6, 소비세 10%는 (과세가격+관세)에 */
      var cv = (goodsKrw + localKrw) * 0.6;
      duty = taxable ? cv * p.dutyPct / 100 : 0;
      vat = taxable ? (cv + duty) * MKT.vat : 0;
    } else {
      duty = taxable ? base * p.dutyPct / 100 : 0;
      vat = taxable ? (base + duty) * MKT.vat : 0;
    }
    var cost = base + p.forward + p.other + duty + vat + (taxable ? MKT.fee : 0);
    var fee = p.sell * p.fee / 100 + p.fixed;
    var settle = p.sell - fee - p.shipout;
    return {
      cost: cost, fee: fee, settle: settle, net: settle - cost,
      duty: duty, vat: vat, base: base, goodsKrw: goodsKrw, localKrw: localKrw,
      goodsUsd: goodsUsd, limit: limit, taxable: taxable
    };
  }

  function domesticModel(p) {
    var cost = p.price + p.buyShip + p.other;
    var fee = p.sell * p.fee / 100 + p.fixed;
    var settle = p.sell - fee - p.shipout;
    return { cost: cost, fee: fee, settle: settle, net: settle - cost };
  }

  function readAbroad() {
    return {
      cur: selVal('rs-a-cur', 'USD'),
      price: val('rs-a-price'),
      fx: val('rs-a-fx') > 0 ? val('rs-a-fx') : fxOf(selVal('rs-a-cur', 'USD')),
      local: val('rs-a-local'),
      intl: val('rs-a-intl'),
      forward: val('rs-a-forward'),
      dutyPct: val('rs-a-duty'),
      business: $('rs-a-business') ? $('rs-a-business').checked : false,
      platform: selVal('rs-a-platform', MKT.order[0]),
      sell: val('rs-a-sell'),
      fee: val('rs-a-fee'),
      fixed: val('rs-a-fixed'),
      shipout: val('rs-a-shipout'),
      other: val('rs-a-other'),
      target: val('rs-a-target', 20)
    };
  }

  function readDomestic() {
    return {
      price: val('rs-d-price'),
      buyShip: val('rs-d-buy-ship'),
      platform: selVal('rs-d-platform', MKT.order[0]),
      sell: val('rs-d-sell'),
      fee: val('rs-d-fee'),
      fixed: val('rs-d-fixed'),
      shipout: val('rs-d-shipout'),
      other: val('rs-d-other'),
      target: val('rs-d-target', 20)
    };
  }

  /* 손익분기 매입가 — 매입가만 바꿔가며 순수익이 0이 되는 지점을 이분법으로 찾습니다. */
  function breakEven(read, model, isAbroad) {
    var p0 = read();
    function netAt(price) {
      var q = {};
      for (var k in p0) q[k] = p0[k];
      q.price = price;
      return model(q).net;
    }
    if (netAt(0) <= 0) return { none: true, free: true };
    var hi = Math.max(p0.price * 4, isAbroad ? 3000 : 2000000, 100);
    var tries = 0;
    while (netAt(hi) > 0 && tries < 24) { hi *= 2; tries++; }
    if (netAt(hi) > 0) return { none: true };
    var lo = 0;
    for (var i = 0; i < 80; i++) {
      var mid = (lo + hi) / 2;
      if (netAt(mid) > 0) lo = mid; else hi = mid;
    }
    return { value: (lo + hi) / 2 };
  }

  function targetPrice(p) {
    var f = p.fee / 100;
    if (f >= 1) return 0;
    var m = p.model;
    /* 순수익 = sell(1-f) - fixed - shipout - cost  →  목표: sell(1-f) = cost(1+t) + fixed + shipout */
    return (m.cost * (1 + p.target / 100) + p.fixed + p.shipout) / (1 - f);
  }

  /* ---------------- 그리기 ---------------- */
  function card(k, v, sub, opts) {
    opts = opts || {};
    return '<div class="rs-card' + (opts.main ? ' main' : '') + '">' +
      '<div class="k">' + esc(k) + '</div>' +
      '<div class="v' + (opts.tone || '') + '">' + v + '</div>' +
      (sub ? '<div class="s">' + sub + '</div>' : '') + '</div>';
  }

  function table(head, rows) {
    return '<div class="rs-table-wrap"><table class="rs-table">' +
      '<thead><tr><th>' + esc(head[0]) + '</th><th style="text-align:right">' + esc(head[1]) + '</th><th>' + esc(head[2]) + '</th></tr></thead><tbody>' +
      rows.map(function (r) {
        if (r.grp) return '<tr class="grp"><td colspan="3">' + esc(r.grp) + '</td></tr>';
        var c = r.total ? ' class="total"' : (r.best ? ' class="best"' : '');
        return '<tr' + c + '><td>' + esc(r.k) + (r.s ? '<small>' + esc(r.s) + '</small>' : '') + '</td>' +
          '<td class="n">' + r.v + '</td>' +
          '<td><small>' + esc(r.note || '') + '</small></td></tr>';
      }).join('') + '</tbody></table></div>';
  }

  function verdict(badgeCls, badgeText, msg) {
    return '<div class="rs-verdict"><span class="rs-badge ' + badgeCls + '">' + esc(badgeText) + '</span>' +
      '<p>' + esc(msg) + '</p></div>';
  }

  function compareTable(p, model, isAbroad) {
    var rows = COMPARE_ORDER.map(function (key) {
      var pl = PLATFORMS[key];
      var q = {};
      for (var k in p) q[k] = p[k];
      q.fee = pl.fee; q.fixed = pl.fixed;
      var m = model(q);
      return { key: key, pl: pl, m: m };
    });
    var best = rows.slice().sort(function (a, b) { return b.m.net - a.m.net; })[0];
    var body = rows.map(function (r) {
      var on = r.key === p.platform;
      var feeTxt = fm(r.pl.fee, r.pl.fee % 1 ? 2 : 0) + '%' + (r.pl.fixed ? ' + ' + krw(r.pl.fixed) : '');
      return '<tr' + (on ? ' class="best"' : '') + '>' +
        '<td>' + esc(r.pl.label[LANG] || r.pl.label.ko) +
        (r.key === best.key ? ' <span class="rs-tag best">' + esc(T.best) + '</span>' : '') +
        (on ? ' <span class="rs-tag">' + esc(T.selected) + '</span>' : '') +
        '<small>' + esc(T.colFee) + ' ' + esc(feeTxt) + '</small></td>' +
        '<td class="n">' + krw(r.m.settle) + '</td>' +
        '<td class="n" style="color:' + (r.m.net < 0 ? '#a31c14' : '#14603a') + '">' + krw(r.m.net) + '</td></tr>';
    }).join('');
    return '<div class="rs-subhead"><h3>' + esc(T.compareTitle) + '</h3><span>' + esc(krw(p.sell)) + '</span></div>' +
      '<div class="rs-table-wrap"><table class="rs-table">' +
      '<thead><tr><th>' + esc(T.colPlatform) + '</th><th style="text-align:right">' + esc(T.colSettle) + '</th><th style="text-align:right">' + esc(T.colNet) + '</th></tr></thead>' +
      '<tbody>' + body + '</tbody></table></div>' +
      '<p class="rs-mini-note">' + esc(T.compareNote) + '</p>';
  }

  var state = { tab: 'abroad' };

  function syncNavH() {
    var n = document.querySelector('.nav-wrap');
    if (n) document.documentElement.style.setProperty('--rs-nav-h', n.offsetHeight + 'px');
  }

  function paintMini(net, roi) {
    var el = $('rs-mini');
    if (!el) return;
    if (net === null) { el.classList.remove('on'); return; }
    el.classList.add('on');
    var k = $('rs-mini-k'), v = $('rs-mini-v'), r = $('rs-mini-r');
    if (k) k.textContent = T.net;
    if (v) { v.textContent = krw(net); v.className = (net < 0 ? 'neg' : 'pos'); }
    if (r) r.textContent = T.roi + ' ' + fm(roi, 1) + '%';
  }

  function render() {
    var out = $('rs-out');
    if (!out) return;

    if (state.tab === 'abroad') {
      var p = readAbroad();
      var m = abroadModel(p);

      if (!(p.price > 0) && !(p.sell > 0)) {
        out.innerHTML = '<div class="rs-out-head"><h2>' + esc(T.title) + '</h2><span class="k">' + esc(T.kicker) + '</span></div>' +
          '<p class="rs-mini-note" style="margin-top:0">' + esc(T.warnZero) + '</p>';
        paintMini(null);
        return;
      }

      var be = breakEven(readAbroad, abroadModel, true);
      var roi = m.cost > 0 ? m.net / m.cost * 100 : 0;
      paintMini(m.net, roi);
      var saleMargin = p.sell > 0 ? m.net / p.sell * 100 : 0;
      var tgt = targetPrice({ fee: p.fee, fixed: p.fixed, shipout: p.shipout, target: p.target, model: m });
      var badge, bcls, msg;
      if (p.business) {
        badge = T.bizBadge; bcls = 'tax';
        msg = tpl(T.bizMsg, { rate: fm(p.dutyPct, 1) });
      } else if (m.taxable) {
        badge = T.taxBadge; bcls = 'tax';
        msg = tpl(T.taxMsg, { goods: goodsTxt(m), limit: limitTxt(m), rate: fm(p.dutyPct, 1) });
      } else {
        badge = T.freeBadge; bcls = 'free';
        msg = tpl(T.freeMsg, { goods: goodsTxt(m), limit: limitTxt(m) });
      }

      out.innerHTML =
        '<div class="rs-out-head"><h2>' + esc(T.title) + '</h2><span class="k">' + esc(T.kicker) + '</span></div>' +
        '<div class="rs-cards">' +
        card(T.net, krw(m.net), esc(T.netSub) + ' · ' + (m.net < 0 ? esc(T.netNeg) : second(m.net)), { main: true, tone: cls(m.net) }) +
        card(T.settlement, krw(m.settle), esc(T.settlementSub) + ' · ' + second(m.settle), {}) +
        card(T.roi, (isFinite(roi) ? fm(roi, 1) : '0') + '%', esc(T.roiSub), { tone: cls(roi) }) +
        card(T.cost, krw(m.cost), esc(T.costSub), {}) +
        card(T.bep, be.none ? esc(be.free ? T.bepFree : T.bepNone) : cur(be.value, p.cur),
          be.none ? '' : '≈ ' + krw(be.value * p.fx) + ' · ' + esc(T.bepSub), { tone: be.none ? ' neg' : '' }) +
        '</div>' +
        verdict(bcls, badge, msg) +
        '<div class="rs-memo">' +
        '<div><span>' + esc(tpl(T.memoTarget, { p: fm(p.target, 0) })) + '</span><b class="tgt">' + krw(tgt) + '</b></div>' +
        '<div><span>' + esc(T.memoSaleMargin) + '</span><b class="' + cls(saleMargin) + '" style="font-family:var(--mono)">' + fm(saleMargin, 1) + '%</b></div>' +
        '</div>' +
        '<div class="rs-subhead"><h3>' + esc(T.tableTitle) + '</h3><span>' + esc(T.limitLine.replace('{limit}', cur(m.limit, 'USD')).replace('{goods}', cur(m.goodsUsd, 'USD'))) + '</span></div>' +
        table([T.colItem, T.colAmount, T.colNote], [
          { grp: T.grpCost },
          { k: T.rBuy, s: T.rBuySub, v: krw(m.goodsKrw), note: cur(p.price, p.cur) + ' × ' + fm(p.fx, 2) },
          { k: T.rLocal, s: T.rLocalSub, v: krw(m.localKrw), note: cur(p.local, p.cur) },
          { k: T.rIntl, s: T.rIntlSub, v: krw(p.intl), note: '' },
          { k: T.rForward, s: T.rForwardSub, v: krw(p.forward), note: '' },
          { k: T.rDuty, s: T.rDutySub, v: krw(m.duty), note: m.taxable ? fm(p.dutyPct, 1) + '%' : '0%' },
          { k: T.rVat, s: T.rVatSub, v: krw(m.vat), note: m.taxable ? '10%' : '0%' },
          { k: T.rOther, s: T.rOtherSub, v: krw(p.other), note: '' },
          { k: T.rCost, s: '', v: krw(m.cost), note: '', total: true },
          { grp: T.grpSell },
          { k: T.rSell, s: T.rSellSub, v: krw(p.sell), note: '' },
          { k: T.rFee, s: T.rFeeSub, v: '−' + krw(m.fee), note: fm(p.fee, 2) + '%' + (p.fixed ? ' + ' + krw(p.fixed) : '') },
          { k: T.rShipout, s: T.rShipOutSub, v: '−' + krw(p.shipout), note: '' },
          { k: T.rSettle, s: '', v: krw(m.settle), note: '', total: true },
          { grp: T.grpProfit },
          { k: T.rNet, s: '', v: krw(m.net), note: fm(roi, 1) + '%', total: true }
        ]) +
        compareTable(p, abroadModel, true);
    } else {
      var d = readDomestic();
      var dm = domesticModel(d);
      if (!(d.price > 0) && !(d.sell > 0)) {
        out.innerHTML = '<div class="rs-out-head"><h2>' + esc(T.title) + '</h2><span class="k">' + esc(T.kicker) + '</span></div>' +
          '<p class="rs-mini-note" style="margin-top:0">' + esc(T.warnZero) + '</p>';
        paintMini(null);
        return;
      }
      var beD = breakEven(readDomestic, domesticModel, false);
      var roiD = dm.cost > 0 ? dm.net / dm.cost * 100 : 0;
      paintMini(dm.net, roiD);
      var saleMarginD = d.sell > 0 ? dm.net / d.sell * 100 : 0;
      var tgtD = targetPrice({ fee: d.fee, fixed: d.fixed, shipout: d.shipout, target: d.target, model: dm });

      out.innerHTML =
        '<div class="rs-out-head"><h2>' + esc(T.title) + '</h2><span class="k">' + esc(T.kicker) + '</span></div>' +
        '<div class="rs-cards">' +
        card(T.net, krw(dm.net), esc(T.netSub) + ' · ' + (dm.net < 0 ? esc(T.netNeg) : second(dm.net)), { main: true, tone: cls(dm.net) }) +
        card(T.settlement, krw(dm.settle), esc(T.settlementSub) + ' · ' + second(dm.settle), {}) +
        card(T.roi, (isFinite(roiD) ? fm(roiD, 1) : '0') + '%', esc(T.roiSub), { tone: cls(roiD) }) +
        card(T.cost, krw(dm.cost), esc(T.costSub), {}) +
        card(T.bep, beD.none ? esc(beD.free ? T.bepFree : T.bepNone) : krw(beD.value), beD.none ? '' : esc(T.bepSub), { tone: beD.none ? ' neg' : '' }) +
        '</div>' +
        verdict('flat', T.domBadge, T.domMsg) +
        '<div class="rs-memo">' +
        '<div><span>' + esc(tpl(T.memoTarget, { p: fm(d.target, 0) })) + '</span><b class="tgt">' + krw(tgtD) + '</b></div>' +
        '<div><span>' + esc(T.memoSaleMargin) + '</span><b class="' + cls(saleMarginD) + '" style="font-family:var(--mono)">' + fm(saleMarginD, 1) + '%</b></div>' +
        '</div>' +
        '<div class="rs-subhead"><h3>' + esc(T.tableTitle) + '</h3><span>' + esc(T.domBadge) + '</span></div>' +
        table([T.colItem, T.colAmount, T.colNote], [
          { grp: T.grpCost },
          { k: T.rBuy, s: '', v: krw(d.price), note: '' },
          { k: T.rLocal, s: T.rLocalSub, v: krw(d.buyShip), note: '' },
          { k: T.rOther, s: T.rOtherSub, v: krw(d.other), note: '' },
          { k: T.rCost, s: '', v: krw(dm.cost), note: '', total: true },
          { grp: T.grpSell },
          { k: T.rSell, s: T.rSellSub, v: krw(d.sell), note: '' },
          { k: T.rFee, s: T.rFeeSub, v: '−' + krw(dm.fee), note: fm(d.fee, 2) + '%' + (d.fixed ? ' + ' + krw(d.fixed) : '') },
          { k: T.rShipout, s: T.rShipOutSub, v: '−' + krw(d.shipout), note: '' },
          { k: T.rSettle, s: '', v: krw(dm.settle), note: '', total: true },
          { grp: T.grpProfit },
          { k: T.rNet, s: '', v: krw(dm.net), note: fm(roiD, 1) + '%', total: true }
        ]) +
        compareTable(d, domesticModel, false);
    }
  }

  /* ---------------- 힌트 갱신 ---------------- */
  function paintFxHints() {
    var a = $('rs-a-fx-hint');
    if (!a) return;
    /* 1단위가 이 페이지 통화로 얼마인지 보여 줍니다(예: $1 = ₩1,343.9). */
    a.textContent = tpl(T.fxHint, { unit: SYM[PAGE_CUR] || PAGE_CUR,
      usd: fm(fxOf('USD'), 2), jpy: fm(fxOf('JPY'), 4), cny: fm(fxOf('CNY'), 2) }) + ' · ' + T.fxEditable;
  }

  function paintCatHint() {
    var el = $('rs-a-cat-hint');
    if (!el) return;
    var duty = val('rs-a-duty');
    var eff = MKT.tax === 'jp' ? (duty * 0.6 + 10) : (duty * (1 + MKT.vat) + MKT.vat * 100);
    el.textContent = tpl(T.catHint, { rate: fm(duty, 1), eff: fm(eff, 1) });
  }

  function paintPriceHint() {
    var el = $('rs-a-price-hint');
    if (!el) return;
    var curC = selVal('rs-a-cur', 'USD');
    if (curC === PAGE_CUR) { el.textContent = T.priceHint; return; }
    var goodsLocal = val('rs-a-price');
    var goodsPage = goodsLocal * (val('rs-a-fx') > 0 ? val('rs-a-fx') : fxOf(curC));
    var limitUsd = (MKT.tax === 'kr' && curC === 'USD') ? MKT.limitUs : MKT.limit;
    var limitShown = (MKT.tax === 'kr' && curC === 'USD') ? cur(limitUsd, 'USD') : cur(limitUsd, PAGE_CUR);
    var shown = MKT.tax === 'kr' && curC !== 'KRW'
      ? cur(goodsPage / fxOf('USD'), 'USD') : cur(goodsPage, PAGE_CUR);
    el.textContent = tpl(T.priceHintUsd, { usd: shown, limit: limitShown });
  }

  function paintPlatformHint(which) {
    var id = which === 'a' ? 'rs-a-platform-hint' : 'rs-d-platform-hint';
    var el = $(id);
    if (!el) return;
    var key = selVal(which === 'a' ? 'rs-a-platform' : 'rs-d-platform', MKT.order[0]);
    var pl = PLATFORMS[key] || PLATFORMS.custom;
    if (key === 'custom') { el.textContent = T.customHint; return; }
    el.textContent = pl.fixed
      ? tpl(T.platformHint, { fee: fm(pl.fee, 2), fixed: fm(pl.fixed) })
      : tpl(T.platformHintNoFixed, { fee: fm(pl.fee, 2) });
  }

  function applyPlatform(which, silent) {
    var key = selVal(which === 'a' ? 'rs-a-platform' : 'rs-d-platform', MKT.order[0]);
    var pl = PLATFORMS[key];
    if (!pl || key === 'custom') { paintPlatformHint(which); render(); return; }
    var feeId = which === 'a' ? 'rs-a-fee' : 'rs-d-fee';
    var fixId = which === 'a' ? 'rs-a-fixed' : 'rs-d-fixed';
    if ($(feeId)) $(feeId).value = pl.fee;
    if ($(fixId)) $(fixId).value = pl.fixed;
    paintPlatformHint(which);
    if (!silent) toast(T.toastDiff);
    render();
  }

  var toastTimer = null;
  function toast(msg) {
    var el = $('rs-toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove('on'); }, 2000);
  }

  /* ---------------- 환율 ---------------- */
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
          /* 시황판(원화 기준)을 이 페이지 통화 기준으로 다시 계산합니다. */
          var baseRate = { KRW: 1, USD: FX.USD, JPY: FX.JPY, CNY: FX.CNY, EUR: FX.EUR, GBP: FX.GBP, CAD: FX.CAD }[PAGE_CUR] || 1;
          Object.keys(MKT.rates).forEach(function (c) {
            var krwPer = { KRW: 1, USD: FX.USD, JPY: FX.JPY, CNY: FX.CNY, EUR: FX.EUR, GBP: FX.GBP, CAD: FX.CAD }[c];
            if (krwPer) MKT.rates[c] = krwPer / baseRate;
          });
        });
        /* 사용자가 고친 적이 없는 필드만 새 환율로 채웁니다. */
        ['rs-a-fx', 'rs-d-fx'].forEach(function (id) {
          var el = $(id);
          if (el && !el.dataset.touched) el.value = round2(fxOf(selVal(id.replace('-fx', '-cur'), 'USD')));
        });
        paintFxHints(); paintPriceHint(); render();
      })
      .catch(function () { paintFxHints(); });
  }
  function round2(n) { return Math.round(n * 100) / 100; }

  function syncFxForCur() {
    var fxEl = $('rs-a-fx');
    if (!fxEl || fxEl.dataset.touched) return;
    fxEl.value = round2(fxOf(selVal('rs-a-cur', 'USD')));
  }

  /* ---------------- 탭 ---------------- */
  function showTab(key) {
    state.tab = key === 'domestic' ? 'domestic' : 'abroad';
    var tabs = document.querySelectorAll('.rs-tab');
    Array.prototype.forEach.call(tabs, function (b) {
      var on = b.getAttribute('data-tab') === state.tab;
      b.setAttribute('aria-selected', on ? 'true' : 'false');
      b.setAttribute('tabindex', on ? '0' : '-1');
    });
    [['abroad', 'rs-panel-abroad'], ['domestic', 'rs-panel-domestic']].forEach(function (pair) {
      var el = $(pair[1]);
      if (el) el.hidden = pair[0] !== state.tab;
    });
    render();
  }

  /* ---------------- 연결 ---------------- */
  function init() {
    var tabs = document.querySelectorAll('.rs-tab');
    Array.prototype.forEach.call(tabs, function (b) {
      b.addEventListener('click', function () { showTab(b.getAttribute('data-tab')); });
      b.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
          e.preventDefault();
          showTab(b.getAttribute('data-tab') === 'abroad' ? 'domestic' : 'abroad');
          var next = document.querySelector('.rs-tab[aria-selected="true"]');
          if (next) next.focus();
        }
      });
    });

    var watch = [
      'rs-a-cur', 'rs-a-price', 'rs-a-fx', 'rs-a-local', 'rs-a-intl', 'rs-a-forward', 'rs-a-duty', 'rs-a-cat',
      'rs-a-business', 'rs-a-sell', 'rs-a-fee', 'rs-a-fixed', 'rs-a-shipout', 'rs-a-other', 'rs-a-target',
      'rs-d-price', 'rs-d-buy-ship', 'rs-d-sell', 'rs-d-fee', 'rs-d-fixed', 'rs-d-shipout', 'rs-d-other', 'rs-d-target'
    ];
    watch.forEach(function (id) {
      var el = $(id);
      if (!el) return;
      el.addEventListener('input', function () {
        if (id === 'rs-a-fx') el.dataset.touched = '1';
        if (id === 'rs-a-price') paintPriceHint();
        if (id === 'rs-a-duty') paintCatHint();
        if (id === 'rs-a-fee' || id === 'rs-a-fixed') {
          var pf = $('rs-a-platform'); if (pf && pf.value !== 'custom') { pf.value = 'custom'; paintPlatformHint('a'); }
        }
        if (id === 'rs-d-fee' || id === 'rs-d-fixed') {
          var pd = $('rs-d-platform'); if (pd && pd.value !== 'custom') { pd.value = 'custom'; paintPlatformHint('d'); }
        }
        render();
      });
      el.addEventListener('change', function () {
        if (id === 'rs-a-cur') {
          syncFxForCur();
          paintPriceHint();
        }
        if (id === 'rs-a-cat') {
          var cat = $('rs-a-cat');
          var opt = cat.options[cat.selectedIndex];
          var rate = opt.getAttribute('value');
          if (rate !== '' && rate !== null) {
            $('rs-a-duty').value = rate;
            paintCatHint();
          }
        }
        render();
      });
    });

    var pa = $('rs-a-platform');
    if (pa) pa.addEventListener('change', function () { applyPlatform('a'); });
    var pd = $('rs-d-platform');
    if (pd) pd.addEventListener('change', function () { applyPlatform('d'); });

    syncNavH();
    window.addEventListener('resize', syncNavH);
    paintFxHints();
    paintCatHint();
    paintPriceHint();
    paintPlatformHint('a');
    paintPlatformHint('d');
    showTab('abroad');
    loadFx();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
