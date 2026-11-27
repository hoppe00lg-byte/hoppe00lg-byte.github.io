/* =========================================================
   INSIGHT BRIEF — 오늘의 실측 마진 아이템 (resell.html)
   · data/resell-picks.json 을 읽어 카드로 그리고,
     [계산기에 바로 채우기] 를 누르면 아래 리셀 마진 계산기 입력칸을 채웁니다.
   · 서버 호출은 이 JSON 한 번뿐입니다(입력값은 여전히 브라우저 안에서만 계산).
   · 문구는 페이지 언어(ko·en·zh·ja)에 맞춰 이 파일이 직접 그립니다.
   ========================================================= */
(function () {
  'use strict';

  var LANG = (document.documentElement.getAttribute('lang') || 'ko').toLowerCase().slice(0, 2);
  if (['ko', 'en', 'zh', 'ja'].indexOf(LANG) < 0) LANG = 'ko';

  var LOCALE = { ko: 'ko-KR', en: 'en-US', zh: 'zh-CN', ja: 'ja-JP' }[LANG];
  var CURRENCY = { ko: 'KRW', en: 'USD', zh: 'CNY', ja: 'JPY' }[LANG];
  var MOUNT = document.getElementById('rs-picks');
  var POKE = document.getElementById('rs-poke');
  var GLOB = document.getElementById('rs-global');
  if (!MOUNT && !POKE && !GLOB) return;

  /* ---------------- 화면 문구 ---------------- */
  var T = {
    ko: {
      kicker: 'SCANNED TODAY', title: '오늘의 실측 마진 아이템 TOP',
      sub: '해외 판매가와 국내 기준가를 같은 시각에 조회해, 관부가세·배송비·판매 수수료를 빼고 남는 순마진을 계산했습니다.',
      stamp: '기준 {date} · 환율 {fx}',
      statScan: '비교한 조합', statPos: '순마진 플러스', statBest: '최고 순마진',
      unitPair: '쌍', unitItem: '개',
      colFrom: '해외가', colDom: '국내 기준가', colCost: '총원가', colTax: '관부가세', colMargin: '순마진',
      tagExact: '같은 색상', tagModel: '같은 모델 · 다른 색상',
      fill: '계산기에 바로 채우기',
      fillDone: '계산기에 값을 넣었습니다. 판매가와 비용을 바꿔 직접 확인해 보세요.',
      openUs: '해외 상품 보기', openKr: '국내 기준 상품 보기',
      none: '오늘은 순마진이 플러스인 조합이 없습니다. 아래 표는 그래도 가장 나은 순서입니다.',
      negative: '오늘 스캔에서는 {n}개만 순마진이 플러스입니다.',
      noteTitle: '이 숫자를 읽는 법',
      note1: '<b>국내 기준가</b>는 나이키 코리아에 표시된 같은 모델(같은 색상이 없으면 같은 모델의 다른 색상) 판매가입니다. 실제 중고·리셀 체결가는 이보다 낮을 수 있어, 표의 순마진은 <b>상한에 가까운 추정치</b>입니다.',
      note2: '<b>관부가세</b>는 자가사용 목록통관(미국 발송 200달러) 기준으로 계산해 대부분 0원입니다. 되팔 목적으로 신고하면 관세 13%와 부가세가 붙어 순마진이 그만큼 줄어듭니다.',
      note3: '<b>정산</b>은 판매가에서 수수료 5%와 국내 택배 3,000원을 뺀 값이고, 총원가에는 해외 결제 카드 수수료 1.5%가 들어 있습니다. 재고·배송비·환율은 조회 시점에 따라 달라집니다.',
      hw: '상품명·상품코드·가격만 공개 데이터로 옮겼습니다. 개인정보는 담지 않습니다.'
    },
    en: {
      kicker: 'SCANNED TODAY', title: "Today's measured margin picks",
      sub: 'Overseas sale prices and the Korean reference price are read at the same moment, then duty, shipping and platform fees are taken out to leave the net margin.',
      stamp: 'As of {date} · FX {fx}',
      statScan: 'Pairs compared', statPos: 'Positive margin', statBest: 'Best margin',
      unitPair: 'pairs', unitItem: 'items',
      colFrom: 'Overseas', colDom: 'Korea price', colCost: 'Total cost', colTax: 'Duty & VAT', colMargin: 'Net margin',
      tagExact: 'Same colourway', tagModel: 'Same model · other colour',
      fill: 'Fill the calculator',
      fillDone: 'Values are in the calculator. Change the sale price or costs to test it yourself.',
      openUs: 'Open overseas listing', openKr: 'Open Korean listing',
      none: 'No pair clears a positive net margin today. The table below is still the best order.',
      negative: 'Only {n} pairs have a positive net margin in today\u2019s scan.',
      noteTitle: 'How to read these numbers',
      note1: 'The <b>Korean price</b> is the Nike Korea listing for the same model (same colourway where it exists, otherwise another colourway of the same model). Real second-hand and resale prices can sit below it, so the net margin here is an <b>estimate close to the ceiling</b>.',
      note2: '<b>Duty and VAT</b> are calculated for personal-use list clearance (US shipments under US$200), so most rows show zero. Declared for resale, 13% duty and VAT apply and the margin shrinks by that much.',
      note3: '<b>Settlement</b> deducts a 5% platform fee and KRW 3,000 domestic courier from the sale price; total cost includes a 1.5% overseas card fee. Stock, shipping and the exchange rate move through the day.',
      hw: 'Only product name, product code and prices come from public data. No personal information is included.'
    },
    zh: {
      kicker: 'SCANNED TODAY', title: '今日实测利润精选',
      sub: '同一时点读取海外售价与韩国参考价，扣除关税与增值税、运费和平台手续费后，得出净利润。',
      stamp: '基准 {date} · 汇率 {fx}',
      statScan: '比较组合', statPos: '净利润为正', statBest: '最高净利润',
      unitPair: '组', unitItem: '个',
      colFrom: '海外价', colDom: '韩国参考价', colCost: '总成本', colTax: '关税与增值税', colMargin: '净利润',
      tagExact: '同配色', tagModel: '同款 · 其他配色',
      fill: '填入计算器',
      fillDone: '已填入计算器。可修改售价与成本自行验证。',
      openUs: '查看海外商品', openKr: '查看韩国参考商品',
      none: '今天没有净利润为正的组合。下表仍为最优顺序。',
      negative: '今日扫描中仅 {n} 组净利润为正。',
      noteTitle: '数字怎么看',
      note1: '<b>韩国参考价</b>取自耐克韩国官网同款（无同配色时取同款其他配色）的标价。实际二手与转售成交价可能低于此价，因此表中的净利润是<b>接近上限的估算</b>。',
      note2: '<b>关税与增值税</b>按个人自用目录通关（美国发货 200 美元以内）计算，因此大多为 0。若按转售申报，将加征 13% 关税与增值税，净利润相应减少。',
      note3: '<b>结算</b>为售价扣除 5% 手续费与 3,000 韩元国内快递费；总成本含 1.5% 海外刷卡手续费。库存、运费与汇率随查询时点变化。',
      hw: '仅迁移商品名、商品编码与价格等公开数据，不含任何个人信息。'
    },
    ja: {
      kicker: 'SCANNED TODAY', title: '本日の実測マージン商品 TOP',
      sub: '海外販売価格と韓国の参考価格を同じ時点で取得し、関税・消費税、送料、プラットフォーム手数料を差し引いた純利益を計算しました。',
      stamp: '基準 {date} · 為替 {fx}',
      statScan: '比較した組', statPos: '純利益プラス', statBest: '最高純利益',
      unitPair: '組', unitItem: '件',
      colFrom: '海外価格', colDom: '韓国参考価格', colCost: '総コスト', colTax: '関税・付加税', colMargin: '純利益',
      tagExact: '同一カラー', tagModel: '同モデル・別カラー',
      fill: '計算機に入れる',
      fillDone: '計算機に入力しました。販売価格やコストを変えて確認できます。',
      openUs: '海外の商品を見る', openKr: '韓国の商品を見る',
      none: '本日は純利益がプラスの組がありません。下表はそれでも最良の順です。',
      negative: '本日のスキャンで純利益がプラスなのは {n} 組だけです。',
      noteTitle: '数字の読み方',
      note1: '<b>韓国参考価格</b>はナイキ韓国サイトに表示された同モデル（同一カラーがなければ同モデルの別カラー）の販売価格です。実際の中古・リセール成約価格はこれより低いことがあり、表の純利益は<b>上限に近い推計</b>です。',
      note2: '<b>関税・付加税</b>は個人使用のリスト通関（米国発送 200 ドルまで）で計算しているため、ほとんどが 0 円です。転売目的で申告すると関税 13% と付加税がかかり、その分だけ純利益が減ります。',
      note3: '<b>精算</b>は販売価格から手数料 5% と国内宅配 3,000 ウォンを引いた額で、総コストには海外決済のカード手数料 1.5% が含まれます。在庫・送料・為替は取得時点で変わります。',
      hw: '商品名・商品コード・価格のみを公開データから移しています。個人情報は含みません。'
    }
  }[LANG];

  var SYM = { KRW: '\u20a9', USD: 'US$', JPY: 'JPY ', EUR: '\u20ac', GBP: '\u00a3', CAD: 'C$', SEK: 'kr ', CNY: 'CN\u00a5' };

  /* ---------------- 도우미 ---------------- */
  function $(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function tpl(t, map) {
    return String(t).replace(/\{(\w+)\}/g, function (m, k) { return map[k] != null ? map[k] : m; });
  }
  function nf(n, dec) {
    if (!isFinite(n)) n = 0;
    return Number(n).toLocaleString(LOCALE, dec ? { minimumFractionDigits: dec, maximumFractionDigits: dec } : { maximumFractionDigits: 0 });
  }
  function krw(n) {
    var v = Math.round(n);
    return (v < 0 ? '\u2212' : '') + SYM.KRW + nf(Math.abs(v));
  }
  function money(n, cur) {
    if (cur === 'USD') return SYM.USD + nf(n, 2);
    if (cur === 'EUR') return SYM.EUR + nf(n, 2);
    if (cur === 'GBP') return SYM.GBP + nf(n, 2);
    if (cur === 'CAD') return SYM.CAD + nf(n, 2);
    if (cur === 'SEK') return SYM.SEK + nf(n, 2);
    if (cur === 'CNY') return SYM.CNY + nf(n, 2);
    if (cur === 'JPY') return SYM.JPY + nf(Math.round(n));
    return krw(n);
  }
  function signed(n) { return (n > 0 ? '+' : n < 0 ? '\u2212' : '') + nf(Math.abs(Math.round(n))); }
  function pct(n) { return (n > 0 ? '+' : n < 0 ? '\u2212' : '') + nf(Math.abs(n), 1) + '%'; }
  function fmtDate(iso) {
    var d = new Date(iso);
    if (isNaN(d.getTime())) return String(iso || '').slice(0, 16);
    try {
      return d.toLocaleString(LOCALE, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch (e) { return String(iso).slice(0, 16); }
  }
  function base() { return /^\/(en|zh|ja)\//.test(location.pathname) ? '../' : ''; }

  /* ---------------- 그리기 ---------------- */
  function head(d) {
    var stamp = tpl(T.stamp, { date: fmtDate(d.generatedAt || d.date), fx: nf(d.fx && d.fx.usdKrw, 2) });
    var pos = (d.scan && d.scan.positive) || 0;
    var best = (d.scan && d.scan.best) || 0;
    var bestTxt = best >= 0 ? '+' + krw(best) : '\u2212' + krw(Math.abs(best));
    var stats = '' +
      '<div class="rs-pk-stat"><span>' + esc(T.statScan) + '</span><b>' + nf((d.scan && d.scan.pairs) || 0) + '<i>' + esc(T.unitPair) + '</i></b></div>' +
      '<div class="rs-pk-stat' + (pos ? '' : ' is-flat') + '"><span>' + esc(T.statPos) + '</span><b>' + nf(pos) + '<i>' + esc(T.unitItem) + '</i></b></div>' +
      '<div class="rs-pk-stat"><span>' + esc(T.statBest) + '</span><b class="' + (best >= 0 ? 'pos' : 'neg') + '">' + bestTxt + '</b></div>';
    return '<div class="rs-pk-head">' +
      '<div class="rs-pk-title">' +
        '<span class="kicker">' + esc(T.kicker) + '</span>' +
        '<h2>' + esc(T.title) + '</h2>' +
        '<p class="rs-pk-sub">' + esc(T.sub) + '</p>' +
        '<p class="rs-pk-stamp">' + esc(stamp) + '</p>' +
      '</div>' +
      '<div class="rs-pk-stats">' + stats + '</div>' +
    '</div>';
  }

  function card(it) {
    var cur = (it.fill && it.fill.cur) || 'USD';
    var margin = it.margin;
    var tag = it.match === 'exact' ? T.tagExact : T.tagModel;
    var cls = margin >= 0 ? 'pos' : 'neg';
    var name = LANG === 'ko' ? it.nameKo : it.nameEn;
    var link = it.usUrl
      ? '<a href="' + esc(it.usUrl) + '" target="_blank" rel="noopener noreferrer" title="' + esc(T.openUs) + '">' + esc(name) + '</a>'
      : esc(name);
    var sku = it.sku && it.krSku && it.sku !== it.krSku ? it.sku + ' \u2192 ' + it.krSku : it.sku;
    return '<article class="rs-pk-card">' +
      '<div class="rs-pk-top">' +
        '<span class="rs-pk-rank">' + String(it.rank).padStart(2, '0') + '</span>' +
        '<span class="rs-pk-tag">' + esc(tag) + '</span>' +
      '</div>' +
      '<h3 class="rs-pk-name">' + link + '</h3>' +
      (sku ? '<p class="rs-pk-sku">' + esc(sku) + '</p>' : '') +
      '<dl class="rs-pk-rows">' +
        '<div><dt>' + esc(T.colFrom) + '</dt><dd>' + money(it.usd, cur) + '</dd></div>' +
        '<div><dt>' + esc(T.colDom) + '</dt><dd>' + krw(it.domestic) + '</dd></div>' +
        '<div><dt>' + esc(T.colCost) + '</dt><dd>' + krw(it.invested) + '</dd></div>' +
        '<div><dt>' + esc(T.colTax) + '</dt><dd>' + krw(it.customs || 0) + '</dd></div>' +
      '</dl>' +
      '<div class="rs-pk-margin ' + cls + '">' +
        '<span class="k">' + esc(T.colMargin) + '</span>' +
        '<b>' + signed(margin) + '<i>' + esc(CURRENCY === 'KRW' ? '\uc6d0' : 'KRW') + '</i></b>' +
        '<span class="r">ROI ' + pct(it.roi) + '</span>' +
      '</div>' +
      '<button type="button" class="rs-pk-fill" data-fill="' + esc(JSON.stringify(it.fill || {})) + '">' + esc(T.fill) + ' \u2192</button>' +
    '</article>';
  }

  function notes(d) {
    var pos = (d.scan && d.scan.positive) || 0;
    var warn = pos === 0 ? esc(T.none) : (pos < ((d.scan && d.scan.shown) || 0) ? esc(tpl(T.negative, { n: pos })) : '');
    return (warn ? '<p class="rs-pk-warn">' + warn + '</p>' : '') +
      '<div class="rs-pk-notes">' +
        '<b>' + esc(T.noteTitle) + '</b>' +
        '<p>' + T.note1 + '</p>' +
        '<p>' + T.note2 + '</p>' +
        '<p>' + T.note3 + '</p>' +
        '<p class="hw">' + esc(T.hw) + '</p>' +
      '</div>';
  }

  function render(d) {
    var items = (d && d.items) || [];
    if (!MOUNT || !items.length) return;
    /* 갱신이 나흘 넘게 끊긴 데이터는 '오늘의' 목록으로 내보내지 않습니다. */
    var age = (Date.now() - new Date(d.generatedAt || d.date).getTime()) / 36e5;
    if (isFinite(age) && age > 96) return;
    MOUNT.innerHTML = head(d) +
      '<div class="rs-pk-grid">' + items.map(card).join('') + '</div>' + notes(d);
    MOUNT.hidden = false;
  }

  /* ---------------- 계산기 채우기 ---------------- */
  function setVal(id, v) {
    var el = $(id);
    if (!el) return;
    el.value = v;
    el.dispatchEvent(new Event('input', { bubbles: true }));
  }
  function setSel(id, v) {
    var el = $(id);
    if (!el) return;
    el.value = v;
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }
  /* 품목 select 의 option 값은 관세율(13·8)이라 data-key 로 찾아 고릅니다. */
  function setCat(v) {
    var el = $('rs-a-cat');
    if (!el) return;
    for (var i = 0; i < el.options.length; i++) {
      if (el.options[i].getAttribute('data-key') === v) {
        /* option 값(관세율)이 겹쳐(8%가 여럿) value 로는 첫 항목이 잡힌다 — 순번으로 고릅니다. */
        el.selectedIndex = i;
        el.dispatchEvent(new Event('change', { bubbles: true }));
        return;
      }
    }
  }
  function flash(id) {
    var el = $(id);
    if (!el) return;
    var box = el.closest('.rs-field') || el;
    box.classList.add('rs-pk-flash');
    setTimeout(function () { box.classList.remove('rs-pk-flash'); }, 1400);
  }
  function toast(msg) {
    var el = $('rs-toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('on');
    clearTimeout(toast.t);
    toast.t = setTimeout(function () { el.classList.remove('on'); }, 2600);
  }
  function fillCalculator(f) {
    if (!f) return;
    var tab = $('rs-tab-abroad');
    if (tab && tab.getAttribute('aria-selected') !== 'true') tab.click();

    setSel('rs-a-cur', f.cur || 'USD');
    setVal('rs-a-price', f.price);
    var fx = $('rs-a-fx');
    if (fx) { fx.value = f.fx; fx.dataset.touched = '1'; fx.dispatchEvent(new Event('input', { bubbles: true })); }
    setCat(f.cat || 'custom');
    setVal('rs-a-duty', f.duty != null ? f.duty : '');
    setVal('rs-a-local', f.local || 0);
    setVal('rs-a-intl', f.intl || 0);
    setVal('rs-a-forward', f.forward || 0);
    var biz = $('rs-a-business');
    if (biz && biz.checked !== !!f.business) { biz.checked = !!f.business; biz.dispatchEvent(new Event('change', { bubbles: true })); }
    setVal('rs-a-sell', f.sell);
    // 수수료율을 먼저 넣으면 플랫폼이 '직접 입력' 으로 바뀝니다(resell.js 동작). 그 뒤 정액 수수료를 넣습니다.
    setVal('rs-a-fee', f.fee != null ? f.fee : 0);
    setVal('rs-a-fixed', f.fixed || 0);
    setVal('rs-a-shipout', f.shipout || 0);
    setVal('rs-a-other', f.other || 0);

    var target = $('rs-panel-abroad');
    if (target) {
      var y = target.getBoundingClientRect().top + window.pageYOffset - 74;
      try { window.scrollTo({ top: y, behavior: 'smooth' }); } catch (e) { window.scrollTo(0, y); }
    }
    flash('rs-a-price');
    toast(T.fillDone);
  }

  /* =========================================================
     포켓몬 카드(TCG) — 같은 언어판(일본판)끼리만 비교한 국내외 시세 차익
     data/pokemon-picks.json 을 읽어 별도 섹션(#rs-poke)에 그립니다.
     ========================================================= */
  var P = {
    ko: {
      kicker: 'POKÉMON TCG · JP → KR', title: '포켓몬 카드 국내외 시세 차익',
      sub: '같은 일본판(언어판)끼리만 비교합니다. 일본 카드샵 판매가로 사서 국내 시세에 되팔 때, 국제배송·관부가세·KREAM 수수료를 빼고 남는 금액입니다.',
      stamp: '기준 {date} · 환율 ¥1 = {fx}원',
      statCards: '확인한 카드', statResolved: '시세 확정', statPos: '순마진 플러스', statBest: '최고 순마진',
      unitCard: '종',
      colJp: '일본 구매가', colCheap: '최저 매물', colKr: '국내 기준가', colSell: '판매가 (−10%)',
      colFee: '관부가세·배송비', colCost: '총원가', colMargin: '순마진',
      bep: '손익분기 매입가', bepBelow: '손익분기선 아래',
      linkJp: '일본 상품', linkKr: '국내 시세',
      fill: '계산기에 바로 채우기',
      fillDone: '계산기에 값을 넣었습니다. 매입가와 판매가를 바꿔 직접 확인해 보세요.',
      allNeg: '지금 일본 카드샵 소매가로는 확정 {n}종 모두 마이너스입니다. 카드마다 적힌 손익분기 매입가보다 싸게 구할 수 있을 때만 남습니다.',
      some: '확정 {n}종 가운데 {p}종이 순마진 플러스입니다.',
      noteTitle: '이 숫자를 읽는 법',
      note1: '<b>국내 기준가</b>는 TCGIndex가 (일본판) 카드에 적어 둔 KREAM 판매 등록가(최저)이고, 판매가는 여기서 10% 낮춰 잡았습니다. 실제 체결가는 등록가보다 낮을 수 있습니다.',
      note2: '<b>관부가세·배송비</b>에는 일본 배대지 국제배송 9,500원과 국내 택배 3,500원이 들어 있습니다. 카드 관세는 0%이고, 물품가가 150달러를 넘으면 부가세 10%와 통관수수료 4,000원이 붙습니다.',
      note3: '<b>손익분기 매입가</b>보다 싸게 사야 남습니다. 카드러쉬 최저 매물이 이 선 아래면 그 매물은 계산상 플러스입니다. 상태(찍힘)·등급·가품은 결제 전에 직접 확인하세요.',
      hw: '카드명·세트·번호·가격만 공개 데이터로 옮겼습니다. 개인정보는 담지 않습니다.'
    },
    en: {
      kicker: 'POKÉMON TCG · JP → KR', title: 'Pokémon cards: Japan → Korea price gap',
      sub: 'Same Japanese printing only. What is left after international shipping, duty and KREAM fees when you buy at a Japanese card shop and sell at the Korean price.',
      stamp: 'As of {date} · ¥1 = ₩{fx}',
      statCards: 'Cards checked', statResolved: 'Prices confirmed', statPos: 'Positive margin', statBest: 'Best margin',
      unitCard: 'cards',
      colJp: 'Japan price', colCheap: 'Cheapest copy', colKr: 'Korea price', colSell: 'Sale price (−10%)',
      colFee: 'Duty & shipping', colCost: 'Total cost', colMargin: 'Net margin',
      bep: 'Break-even buy price', bepBelow: 'Cheapest copy below break-even',
      linkJp: 'Japan listing', linkKr: 'Korea price',
      fill: 'Fill the calculator',
      fillDone: 'Values are in the calculator. Change the buy and sale prices to test it yourself.',
      allNeg: 'At today’s Japanese retail prices all {n} confirmed cards are negative. These trades only pay when you buy below the break-even price printed on each card.',
      some: 'Only {p} of {n} confirmed cards clear a positive margin.',
      noteTitle: 'How to read these numbers',
      note1: 'The <b>Korea price</b> is the lowest KREAM asking price that TCGIndex records for the Japanese printing, and the sale price is set 10% below it. Actual trades can close lower.',
      note2: '<b>Duty and shipping</b> include KRW 9,500 of Japan proxy international shipping and KRW 3,500 of domestic courier. Cards carry 0% duty; above US$150 of goods, 10% VAT and a KRW 4,000 clearance fee apply.',
      note3: 'You only make money buying below the <b>break-even price</b>. If the cheapest CardRush copy sits under that line, the model shows a gain. Check condition, grade and authenticity before paying.',
      hw: 'Only card name, set, number and prices come from public data. No personal information is included.'
    },
    zh: {
      kicker: '宝可梦 TCG · 日→韩', title: '宝可梦卡牌 日韩价差',
      sub: '仅比较同一日版卡牌。在日本卡店买入、按韩国价格卖出，扣除国际运费、关税与增值税、KREAM 手续费后的净额。',
      stamp: '基准 {date} · 汇率 ¥1 = {fx} 韩元',
      statCards: '检查卡牌', statResolved: '价格确认', statPos: '净利润为正', statBest: '最高净利润',
      unitCard: '种',
      colJp: '日本买入价', colCheap: '最低在售', colKr: '韩国参考价', colSell: '售价（−10%）',
      colFee: '关税与运费', colCost: '总成本', colMargin: '净利润',
      bep: '盈亏平衡买入价', bepBelow: '最低在售低于平衡线',
      linkJp: '日本商品', linkKr: '韩国价格',
      fill: '填入计算器',
      fillDone: '已填入计算器。可修改买入价与售价自行验证。',
      allNeg: '按今日日本卡店零售价，{n} 张已确认卡牌全部为负。只有低于每张卡标注的盈亏平衡价买入才有利润。',
      some: '{n} 张已确认卡牌中仅 {p} 张净利润为正。',
      noteTitle: '数字怎么看',
      note1: '<b>韩国参考价</b>取自 TCGIndex 记录的日版卡牌 KREAM 最低在售价，售价比其低 10%。实际成交可能更低。',
      note2: '<b>关税与运费</b>含日本转运国际运费 9,500 韩元与韩国国内快递 3,500 韩元。卡牌关税为 0%；货值超过 150 美元时加征 10% 增值税与 4,000 韩元通关费。',
      note3: '买入价低于<b>盈亏平衡价</b>才有利润。CardRush 最低在售若低于该线，模型即为正。付款前务必确认品相、评级与真伪。',
      hw: '仅迁移卡名、系列、编号与价格等公开数据，不含个人信息。'
    },
    ja: {
      kicker: 'ポケモンTCG · 日→韓', title: 'ポケモンカード 日韓価格差',
      sub: '同じ日本語版のみを比較します。日本のカードショップで買い、韓国価格で売るとき、国際送料・関税/付加税・KREAM手数料を引いて残る金額です。',
      stamp: '基準 {date} · 為替 ¥1 = {fx}ウォン',
      statCards: '確認カード', statResolved: '価格確定', statPos: '純利益プラス', statBest: '最高純利益',
      unitCard: '種',
      colJp: '日本買値', colCheap: '最安在庫', colKr: '韓国参考価格', colSell: '売値（−10%）',
      colFee: '関税・送料', colCost: '総コスト', colMargin: '純利益',
      bep: '損益分岐の買値', bepBelow: '最安在庫が分岐線以下',
      linkJp: '日本の商品', linkKr: '韓国価格',
      fill: '計算機に入れる',
      fillDone: '計算機に入力しました。買値と売値を変えて確認できます。',
      allNeg: '本日の日本カードショップ小売価格では、確定 {n} 種すべてマイナスです。各カードの損益分岐買値より安く買えたときだけ残ります。',
      some: '確定 {n} 種のうち {p} 種が純利益プラスです。',
      noteTitle: '数字の読み方',
      note1: '<b>韓国参考価格</b>はTCGIndexが日本語版カードに記録したKREAMの最安出品価格で、売値はそこから10%下げています。実際の成約はさらに低いことがあります。',
      note2: '<b>関税・送料</b>には日本の転送業者の国際送料9,500ウォンと韓国国内宅配3,500ウォンが入っています。カードの関税は0%、商品価格が150ドルを超えると付加税10%と通関手数料4,000ウォンがかかります。',
      note3: '<b>損益分岐買値</b>より安く買わないと残りません。カードラッシュの最安在庫がこの線を下回れば計算上プラスです。状態・グレード・真贋は支払い前に確認してください。',
      hw: 'カード名・セット・番号・価格のみを公開データから移しています。個人情報は含みません。'
    }
  }[LANG];

  function yen(n) { return '\u00a5' + nf(Math.round(n)); }

  function pokeName(it) {
    if (LANG === 'ja') return it.nameJp || it.nameEn || it.nameKo;
    if (LANG === 'zh') return it.nameZh || it.nameEn || it.nameKo || it.nameJp;
    if (LANG === 'en') return it.nameEn || it.nameKo || it.nameJp;
    return it.nameKo || it.nameEn || it.nameJp;
  }

  function pokeHead(d) {
    var fx = d.fx || {};
    var stamp = tpl(P.stamp, { date: fmtDate(d.generatedAt || d.date), fx: nf(fx.jpyKrw, 2) });
    var scan = d.scan || {};
    var pos = scan.positive || 0;
    var best = scan.best || 0;
    var bestTxt = (best >= 0 ? '+' : '\u2212') + krw(Math.abs(best));
    var stats = '' +
      '<div class="rs-pk-stat"><span>' + esc(P.statCards) + '</span><b>' + nf(scan.cards || 0) + '<i>' + esc(P.unitCard) + '</i></b></div>' +
      '<div class="rs-pk-stat"><span>' + esc(P.statResolved) + '</span><b>' + nf(scan.resolved || 0) + '<i>' + esc(P.unitCard) + '</i></b></div>' +
      '<div class="rs-pk-stat' + (pos ? '' : ' is-flat') + '"><span>' + esc(P.statPos) + '</span><b>' + nf(pos) + '<i>' + esc(P.unitCard) + '</i></b></div>' +
      '<div class="rs-pk-stat"><span>' + esc(P.statBest) + '</span><b class="' + (best >= 0 ? 'pos' : 'neg') + '">' + bestTxt + '</b></div>';
    return '<div class="rs-pk-head">' +
      '<div class="rs-pk-title">' +
        '<span class="kicker">' + esc(P.kicker) + '</span>' +
        '<h2>' + esc(P.title) + '</h2>' +
        '<p class="rs-pk-sub">' + esc(P.sub) + '</p>' +
        '<p class="rs-pk-stamp">' + esc(stamp) + '</p>' +
      '</div>' +
      '<div class="rs-pk-stats">' + stats + '</div>' +
    '</div>';
  }

  function pokeCard(it) {
    var margin = it.margin || 0;
    var cls = margin >= 0 ? 'pos' : 'neg';
    var bep = (it.bep === 0 || it.bep) ? it.bep : null;
    var below = bep != null && it.jpCheap && it.jpCheap > 0 && it.jpCheap <= bep;
    var code = esc((it.set || '') + ' ' + (it.cardNo || '')).trim();
    var rows = '' +
      '<div><dt>' + esc(P.colJp) + '</dt><dd>' + yen(it.jp) + '</dd></div>' +
      (it.jpCheap && it.jpCheap !== it.jp
        ? '<div><dt>' + esc(P.colCheap) + (it.jpCheapCond ? ' \u00b7 ' + esc(it.jpCheapCond) : '') + '</dt><dd>' + yen(it.jpCheap) + '</dd></div>'
        : '') +
      '<div><dt>' + esc(P.colKr) + '</dt><dd>' + krw(it.kr) + '</dd></div>' +
      '<div><dt>' + esc(P.colSell) + '</dt><dd>' + krw(it.sell) + '</dd></div>' +
      '<div><dt>' + esc(P.colFee) + '</dt><dd>' + krw(it.customs || 0) + ' \u00b7 ' + krw(it.shipping || 0) + '</dd></div>' +
      '<div><dt>' + esc(P.colCost) + '</dt><dd>' + krw(it.invested) + '</dd></div>';
    return '<article class="rs-pk-card">' +
      '<div class="rs-pk-top">' +
        '<span class="rs-pk-rank">' + String(it.rank).padStart(2, '0') + '</span>' +
        '<span class="rs-pk-tag">' + code + '</span>' +
        (it.rarity ? '<span class="rs-pk-tag">' + esc(it.rarity) + '</span>' : '') +
        (below ? '<span class="rs-pk-flag">' + esc(P.bepBelow) + '</span>' : '') +
      '</div>' +
      '<h3 class="rs-pk-name">' + esc(pokeName(it)) + '</h3>' +
      (it.setKo && LANG === 'ko' ? '<p class="rs-pk-sku">' + esc(it.setKo) + '</p>' : '') +
      '<dl class="rs-pk-rows">' + rows + '</dl>' +
      '<div class="rs-pk-margin ' + cls + '">' +
        '<span class="k">' + esc(P.colMargin) + '</span>' +
        '<b>' + signed(margin) + '<i>' + esc(CURRENCY === 'KRW' ? '\uc6d0' : 'KRW') + '</i></b>' +
        '<span class="r">ROI ' + pct(it.roi) + '</span>' +
      '</div>' +
      '<p class="rs-pk-bep"><span>' + esc(P.bep) + '</span><b>' + (bep != null ? yen(bep) : '\u2014') + '</b></p>' +
      '<p class="rs-pk-links">' +
        (it.jpUrl ? '<a href="' + esc(it.jpUrl) + '" target="_blank" rel="noopener noreferrer">' + esc(P.linkJp) + ' \u2197</a>' : '') +
        (it.krUrl ? '<a href="' + esc(it.krUrl) + '" target="_blank" rel="noopener noreferrer">' + esc(P.linkKr) + ' \u2197</a>' : '') +
      '</p>' +
      '<button type="button" class="rs-pk-fill" data-fill="' + esc(JSON.stringify(it.fill || {})) + '">' + esc(P.fill) + ' \u2192</button>' +
    '</article>';
  }

  function pokeNotes(d) {
    var scan = d.scan || {};
    var pos = scan.positive || 0;
    var resolved = scan.resolved || 0;
    var warn = pos === 0 ? tpl(P.allNeg, { n: resolved }) : (pos < resolved ? tpl(P.some, { n: resolved, p: pos }) : '');
    return (warn ? '<p class="rs-pk-warn">' + esc(warn) + '</p>' : '') +
      '<div class="rs-pk-notes">' +
        '<b>' + esc(P.noteTitle) + '</b>' +
        '<p>' + P.note1 + '</p>' +
        '<p>' + P.note2 + '</p>' +
        '<p>' + P.note3 + '</p>' +
        '<p class="hw">' + esc(P.hw) + '</p>' +
      '</div>';
  }

  function renderPoke(d) {
    var items = (d && d.items) || [];
    if (!POKE || !items.length) return;
    var age = (Date.now() - new Date(d.generatedAt || d.date).getTime()) / 36e5;
    if (isFinite(age) && age > 96) return;
    POKE.innerHTML = pokeHead(d) +
      '<div class="rs-pk-grid">' + items.map(pokeCard).join('') + '</div>' + pokeNotes(d);
    POKE.hidden = false;
  }


  /* =========================================================
     해외직구 품목(전자기기·캠핑·생활용품·레고/피규어)
     data/global-picks.json 을 읽어 별도 섹션(#rs-global)에 그립니다.
     미국·일본 브랜드 공식 스토어의 실측가와 국내(에누리) 시세를 모델 코드로 맞춘 결과입니다.
     ========================================================= */
  var GT = {
    ko: {
      kicker: 'US · JP · EU → KR', title: '해외직구·명품 컨템 실측 마진 TOP',
      sub: '미국·일본·유럽 브랜드 공식몰과 편집샵의 실제 판매가를 국내 판매 등록가와 같은 시각에 조회해, 국제배송·관부가세·판매 수수료를 빼고 남는 순마진을 계산했습니다. 품목은 품번(스타일 코드)·레고 세트번호로 맞췄습니다.',
      stamp: '기준 {date} · 환율 $1 = {usd}원 · ¥1 = {jpy}원',
      statScan: '감시 품목', statMatched: '시세 확인', statPos: '순마진 플러스', statBest: '최고 순마진',
      unitItem: '개',
      colFrom: '해외가', colCost: '총원가', colDom: '국내 시세', colTax: '관부가세',
      colMargin: '순마진', originUS: '미국', originJP: '일본', originEU: '유럽', originUK: '영국', originCA: '캐나다', rrp: '정가 기준',
      all: '전체',
      catLux: '명품·컨템', catElectronics: '전자기기', catCamping: '캠핑', catHousehold: '생활용품', catLego: '레고', catFigure: '피규어',
      linkBuy: '해외 상품', linkDom: '국내 시세',
      fill: '계산기에 바로 채우기',
      fillDone: '계산기에 값을 넣었습니다. 배송·수수료를 바꿔 직접 확인해 보세요.',
      none: '오늘은 매칭된 품목이 없습니다. 내일 다시 조회합니다.',
      negAll: '오늘 확인된 {n}개 품목 중 순마진이 플러스인 것은 없습니다. 표는 그래도 가장 나은 순서입니다.',
      some: '{n}개 품목 가운데 {p}개만 순마진이 플러스입니다.',
      noteTitle: '이 숫자를 읽는 법',
      note1: '<b>해외가</b>는 브랜드 공식 스토어가 공개한 상품 데이터의 실제 판매가입니다. 레고는 공식 소비자가(RRP)라 <b>정가 기준</b>으로 표시했고, 국내 등록가가 정가의 1.6배를 넘는 단종·희소 세트는 순위에서 뺐습니다.',
      note2: '<b>국내 시세</b>는 에누리 가격비교에서 모델명이 일치하는 매물만 골라 중앙값을 쓴 값입니다. 최저가 하나를 쓰면 사은품·부품 매물에 끌려가므로 중앙값을 씁니다. 실제 체결가는 이보다 낮을 수 있습니다.',
      note3: '<b>관부가세</b>는 미국 $200·일본/유럽/영국 $150 면세 한도(물품가 기준)를 넘을 때만 붙습니다. 가방·시계는 200만 원을 넘는 초과분에 개별소비세 20%와 교육세 30%가 더 붙습니다. 유럽·영국 매장 가격은 현지 부가세(20%)를 뺀 수출 구매 기준으로 계산했습니다. 국제배송은 배대지 예시 요율, 정산은 판매가에서 플랫폼 수수료와 국내 택배를 뺀 값입니다.',
      hw: '품목명·모델 코드·가격만 공개 데이터로 옮겼습니다. 개인정보는 담지 않습니다.'
    },
    en: {
      kicker: 'US · JP · EU → KR', title: 'Overseas & luxury picks by measured margin',
      sub: 'Live prices from US, Japanese and European brand stores and concept shops are matched by style code against Korean listing prices, then international shipping, duty and platform fees are taken out to leave the net margin.',
      stamp: 'As of {date} · $1 = ₩{usd} · ¥1 = ₩{jpy}',
      statScan: 'Items watched', statMatched: 'Prices matched', statPos: 'Positive margin', statBest: 'Best margin',
      unitItem: 'items',
      colFrom: 'Overseas', colCost: 'Total cost', colDom: 'Korea price', colTax: 'Duty & VAT',
      colMargin: 'Net margin', originUS: 'US', originJP: 'Japan', originEU: 'Europe', originUK: 'UK', originCA: 'Canada', rrp: 'at RRP',
      all: 'All',
      catLux: 'Luxury', catElectronics: 'Electronics', catCamping: 'Camping', catHousehold: 'Home goods', catLego: 'LEGO', catFigure: 'Figures',
      linkBuy: 'Overseas listing', linkDom: 'Korea price',
      fill: 'Fill the calculator',
      fillDone: 'Values are in the calculator. Change shipping or fees to test it yourself.',
      none: 'Nothing matched today. The scan runs again tomorrow.',
      negAll: 'None of the {n} matched items clears a positive net margin today. The list is still the best order.',
      some: 'Only {p} of {n} items clear a positive net margin.',
      noteTitle: 'How to read these numbers',
      note1: '<b>Overseas</b> is the live price published by the brand store. LEGO sets are marked <b>at RRP</b> because that is the only machine-readable price; retired sets whose Korean listing exceeds 1.6× RRP are dropped from the ranking.',
      note2: '<b>Korea price</b> is the median of Enuri listings whose name carries the same model code. A single lowest price would be dragged down by accessory and part listings. Real trades can close lower.',
      note3: '<b>Duty and VAT</b> apply only above the US$200 (US) / US$150 (Japan, Europe, UK) personal-use threshold. Bags and watches above ₩2m also carry 20% individual consumption tax on the excess plus 30% education tax. European and UK prices are taken ex-VAT (20%) for export purchase. International shipping uses proxy-warehouse sample rates; settlement deducts platform fee and domestic courier.',
      hw: 'Only product name, model code and prices come from public data. No personal information is included.'
    },
    zh: {
      kicker: 'US · JP · EU → KR', title: '海外直购·奢侈品 实测利润 TOP',
      sub: '同时读取美国、日本、欧洲品牌官网与买手店的实时售价与韩国销售标价，按型号代码匹配，扣除国际运费、关税与增值税、平台手续费后的净利润。',
      stamp: '基准 {date} · 汇率 $1 = {usd} 韩元 · ¥1 = {jpy} 韩元',
      statScan: '监看商品', statMatched: '价格确认', statPos: '净利润为正', statBest: '最高净利润',
      unitItem: '个',
      colFrom: '海外价', colCost: '总成本', colDom: '韩国价格', colTax: '关税与增值税',
      colMargin: '净利润', originUS: '美国', originJP: '日本', originEU: '欧洲', originUK: '英国', originCA: '加拿大', rrp: '按定价',
      all: '全部',
      catLux: '奢侈品·设计师', catElectronics: '电子设备', catCamping: '露营', catHousehold: '生活用品', catLego: '乐高', catFigure: '手办',
      linkBuy: '海外商品', linkDom: '韩国价格',
      fill: '填入计算器',
      fillDone: '已填入计算器。可修改运费与手续费自行验证。',
      none: '今日没有匹配商品，明天再次扫描。',
      negAll: '今日匹配的 {n} 个商品中，净利润为正的为零。下表仍为最优顺序。',
      some: '{n} 个商品中仅 {p} 个净利润为正。',
      noteTitle: '数字怎么看',
      note1: '<b>海外价</b>取自品牌官网公开的实时售价。乐高仅有官方定价可用，故标注<b>按定价</b>；韩国标价超过定价 1.6 倍的停产稀有套装已从排名剔除。',
      note2: '<b>韩国价格</b>取 Enuri 上名称含同一型号代码的标价中位数。用单一最低价会被配件、赠品标价带偏。实际成交可能更低。',
      note3: '<b>关税与增值税</b>仅在超过美国 200 美元 / 日本·欧洲·英国 150 美元个人自用免税额度时计征。包袋、手表超过 200 万韩元的部分另征 20% 个别消费税与 30% 教育税。欧洲、英国价格按扣除当地增值税（20%）的出口购买价计算。国际运费采用转运公司示例费率；结算为售价扣除平台手续费与韩国国内快递费。',
      hw: '仅迁移商品名、型号代码与价格等公开数据，不含个人信息。'
    },
    ja: {
      kicker: 'US · JP · EU → KR', title: '海外直輸入・ラグジュアリー 実測マージン TOP',
      sub: '米国・日本・欧州のブランド公式ストアとセレクトショップの実売価格と韓国の販売価格を同時点で取得し、国際送料・関税/付加税・手数料を差し引いた純利益を計算しました。型番（レゴのセット番号・製品型番）で照合しています。',
      stamp: '基準 {date} · 為替 $1 = {usd}ウォン · ¥1 = {jpy}ウォン',
      statScan: '監視アイテム', statMatched: '価格確認', statPos: '純利益プラス', statBest: '最高純利益',
      unitItem: '件',
      colFrom: '海外価格', colCost: '総コスト', colDom: '韓国価格', colTax: '関税・付加税',
      colMargin: '純利益', originUS: '米国', originJP: '日本', originEU: '欧州', originUK: '英国', originCA: 'カナダ', rrp: '定価基準',
      all: 'すべて',
      catLux: 'ラグジュアリー', catElectronics: '電子機器', catCamping: 'キャンプ', catHousehold: '生活用品', catLego: 'レゴ', catFigure: 'フィギュア',
      linkBuy: '海外商品', linkDom: '韓国価格',
      fill: '計算機に入れる',
      fillDone: '計算機に入力しました。送料や手数料を変えて確認できます。',
      none: '本日は照合できた商品がありません。明日また取得します。',
      negAll: '本日照合した {n} 件のうち純利益がプラスのものはありません。下表はそれでも最良の順です。',
      some: '{n} 件のうち {p} 件だけが純利益プラスです。',
      noteTitle: '数字の読み方',
      note1: '<b>海外価格</b>はブランド公式ストアが公開する実売価格です。レゴは公式定価しか取得できないため<b>定価基準</b>と表示し、韓国の出品価格が定価の1.6倍を超える廃盤・希少セットは順位から外しました。',
      note2: '<b>韓国価格</b>はEnuriで同じ型番が名前に含まれる出品の中央値です。最安値1件だけを使うと付属品・部品の出品に引っ張られるため中央値を使います。実際の成約はこれより低いことがあります。',
      note3: '<b>関税・付加税</b>は米国200ドル・日本/欧州/英国150ドルの免税枠（商品価格基準）を超えた場合のみ発生します。バッグ・時計は200万ウォンを超える部分に個別消費税20%と教育税30%が加わります。欧州・英国の価格は現地付加税（20%）を除いた輸出購入ベースで計算しています。国際送料は転送業者の例示料率、精算は販売価格からプラットフォーム手数料と国内宅配を引いた額です。',
      hw: '商品名・型番・価格のみを公開データから移しています。個人情報は含みません。'
    }
  }[LANG];

  var CAT_LABEL = {
    lux: 'catLux', electronics: 'catElectronics', camping: 'catCamping', household: 'catHousehold',
    lego: 'catLego', figure: 'catFigure'
  };
  var CAT_ORDER = ['lux', 'electronics', 'camping', 'household', 'lego', 'figure'];

  function gCat(cat) { return GT[CAT_LABEL[cat] || ''] || cat; }

  function gHead(d) {
    var fx = d.fx || {};
    var scan = d.scan || {};
    var stamp = tpl(GT.stamp, {
      date: fmtDate(d.generatedAt || d.date),
      usd: nf(fx.usdKrw, 2), jpy: nf(fx.jpyKrw, 2)
    });
    var pos = scan.positive || 0;
    var best = scan.best || 0;
    var bestTxt = (best >= 0 ? '+' : '\u2212') + krw(Math.abs(best));
    var stats = '' +
      '<div class="rs-pk-stat"><span>' + esc(GT.statScan) + '</span><b>' + nf(scan.scanned || 0) + '<i>' + esc(GT.unitItem) + '</i></b></div>' +
      '<div class="rs-pk-stat"><span>' + esc(GT.statMatched) + '</span><b>' + nf(scan.matched || 0) + '<i>' + esc(GT.unitItem) + '</i></b></div>' +
      '<div class="rs-pk-stat' + (pos ? '' : ' is-flat') + '"><span>' + esc(GT.statPos) + '</span><b>' + nf(pos) + '<i>' + esc(GT.unitItem) + '</i></b></div>' +
      '<div class="rs-pk-stat"><span>' + esc(GT.statBest) + '</span><b class="' + (best >= 0 ? 'pos' : 'neg') + '">' + bestTxt + '</b></div>';
    return '<div class="rs-pk-head">' +
      '<div class="rs-pk-title">' +
        '<span class="kicker">' + esc(GT.kicker) + '</span>' +
        '<h2>' + esc(GT.title) + '</h2>' +
        '<p class="rs-pk-sub">' + esc(GT.sub) + '</p>' +
        '<p class="rs-pk-stamp">' + esc(stamp) + '</p>' +
      '</div>' +
      '<div class="rs-pk-stats">' + stats + '</div>' +
    '</div>';
  }

  function gChips(items) {
    var cats = [];
    items.forEach(function (it) { if (cats.indexOf(it.cat) < 0) cats.push(it.cat); });
    cats.sort(function (a, b) { return CAT_ORDER.indexOf(a) - CAT_ORDER.indexOf(b); });
    if (cats.length < 2) return '';
    var html = '<button type="button" class="rs-pk-chip is-on" data-cat="all">' + esc(GT.all) + '</button>';
    cats.forEach(function (c) {
      var n = items.filter(function (x) { return x.cat === c; }).length;
      html += '<button type="button" class="rs-pk-chip" data-cat="' + esc(c) + '">' + esc(gCat(c)) + ' <i>' + n + '</i></button>';
    });
    return '<div class="rs-pk-chips" role="group">' + html + '</div>';
  }

  function gCard(it) {
    var cur = it.cur || 'USD';
    var margin = it.margin;
    var cls = margin >= 0 ? 'pos' : 'neg';
    var name = LANG === 'ko' ? it.nameKo : it.nameEn;
    var link = it.overseasUrl
      ? '<a href="' + esc(it.overseasUrl) + '" target="_blank" rel="noopener noreferrer" title="' + esc(GT.linkBuy) + '">' + esc(name) + '</a>'
      : esc(name);
    var priceTxt = money(it.price, cur);
    var originTxt = GT['origin' + (it.origin || 'US')] || GT.originUS;
    var links = '<p class="rs-pk-links">' +
      (it.overseasUrl ? '<a href="' + esc(it.overseasUrl) + '" target="_blank" rel="noopener noreferrer">' + esc(GT.linkBuy) + ' \u2197</a>' : '') +
      (it.krUrl ? '<a href="' + esc(it.krUrl) + '" target="_blank" rel="noopener noreferrer">' + esc(GT.linkDom) + ' \u2197</a>' : '') +
      '</p>';
    return '<article class="rs-pk-card" data-cat="' + esc(it.cat) + '">' +
      '<div class="rs-pk-top">' +
        '<span class="rs-pk-rank">' + String(it.rank).padStart(2, '0') + '</span>' +
        '<span class="rs-pk-tag rs-pk-cat">' + esc(gCat(it.cat)) + '</span>' +
        '<span class="rs-pk-tag">' + esc(originTxt) + '</span>' +
        (it.priceKind === 'rrp' ? '<span class="rs-pk-tag rs-pk-tag--rrp">' + esc(GT.rrp) + '</span>' : '') +
      '</div>' +
      '<h3 class="rs-pk-name">' + link + '</h3>' +
      (it.model ? '<p class="rs-pk-sku">' + esc(it.model) + '</p>' : '') +
      '<dl class="rs-pk-rows">' +
        '<div><dt>' + esc(GT.colFrom) + '</dt><dd>' + priceTxt + '</dd></div>' +
        '<div><dt>' + esc(GT.colCost) + '</dt><dd>' + krw(it.invested) + '</dd></div>' +
        '<div><dt>' + esc(GT.colDom) + '</dt><dd>' + krw(it.domestic) + '</dd></div>' +
        '<div><dt>' + esc(GT.colTax) + '</dt><dd>' + krw(it.customs || 0) + '</dd></div>' +
      '</dl>' +
      '<div class="rs-pk-margin ' + cls + '">' +
        '<span class="k">' + esc(GT.colMargin) + '</span>' +
        '<b>' + signed(margin) + '<i>' + esc(CURRENCY === 'KRW' ? '\uc6d0' : 'KRW') + '</i></b>' +
        '<span class="r">ROI ' + pct(it.roi) + '</span>' +
      '</div>' +
      links +
      '<button type="button" class="rs-pk-fill" data-fill="' + esc(JSON.stringify(it.fill || {})) + '">' + esc(GT.fill) + ' \u2192</button>' +
    '</article>';
  }

  function gNotes(d) {
    var scan = d.scan || {};
    var pos = scan.positive || 0;
    var n = scan.matched || 0;
    var warn = pos === 0 ? tpl(GT.negAll, { n: n }) : (pos < n ? tpl(GT.some, { n: n, p: pos }) : '');
    return (warn ? '<p class="rs-pk-warn">' + esc(warn) + '</p>' : '') +
      '<div class="rs-pk-notes">' +
        '<b>' + esc(GT.noteTitle) + '</b>' +
        '<p>' + GT.note1 + '</p>' +
        '<p>' + GT.note2 + '</p>' +
        '<p>' + GT.note3 + '</p>' +
        '<p class="hw">' + esc(GT.hw) + '</p>' +
      '</div>';
  }

  function renderGlobal(d) {
    var items = (d && d.items) || [];
    if (!GLOB || !items.length) return;
    var age = (Date.now() - new Date(d.generatedAt || d.date).getTime()) / 36e5;
    if (isFinite(age) && age > 96) return;
    GLOB.innerHTML = gHead(d) + gChips(items) +
      '<div class="rs-pk-grid">' + items.map(gCard).join('') + '</div>' + gNotes(d);
    GLOB.hidden = false;
  }

  function gFilter(btn) {
    if (!GLOB) return;
    var cat = btn.getAttribute('data-cat');
    var chips = GLOB.querySelectorAll('.rs-pk-chip');
    for (var i = 0; i < chips.length; i++) chips[i].classList.toggle('is-on', chips[i] === btn);
    var cards = GLOB.querySelectorAll('.rs-pk-card');
    for (var j = 0; j < cards.length; j++) {
      var card = cards[j];
      card.hidden = cat !== 'all' && card.getAttribute('data-cat') !== cat;
    }
  }

  if (GLOB) {
    GLOB.addEventListener('click', function (e) {
      var chip = e.target.closest ? e.target.closest('.rs-pk-chip') : null;
      if (chip) { gFilter(chip); }
    });
  }

  [MOUNT, POKE, GLOB].forEach(function (el) {
    if (!el) return;
    el.addEventListener('click', function (e) {
      var btn = e.target.closest ? e.target.closest('.rs-pk-fill') : null;
      if (!btn) return;
      var raw = btn.getAttribute('data-fill');
      try { fillCalculator(JSON.parse(raw)); } catch (err) { /* 값이 깨졌으면 아무 일도 하지 않습니다 */ }
    });
  });

  /* ---------------- 불러오기 ---------------- */
  function load() {
    if (typeof fetch !== 'function') return;
    fetch(base() + 'data/resell-picks.json', { cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) { if (d) render(d); })
      .catch(function () { /* 데이터가 없으면 섹션을 그리지 않습니다 */ });
    fetch(base() + 'data/pokemon-picks.json', { cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) { if (d) renderPoke(d); })
      .catch(function () { /* 데이터가 없으면 섹션을 그리지 않습니다 */ });
    fetch(base() + 'data/global-picks.json', { cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) { if (d) renderGlobal(d); })
      .catch(function () { /* 데이터가 없으면 섹션을 그리지 않습니다 */ });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', load);
  else load();
})();
