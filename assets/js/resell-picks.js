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
  if (!MOUNT) return;

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

  var SYM = { KRW: '\u20a9', USD: 'US$', JPY: 'JPY ', EUR: '\u20ac', CNY: 'CN\u00a5' };

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
    if (!items.length) return;
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
        el.value = el.options[i].value;
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

  MOUNT.addEventListener('click', function (e) {
    var btn = e.target.closest ? e.target.closest('.rs-pk-fill') : null;
    if (!btn) return;
    var raw = btn.getAttribute('data-fill');
    try { fillCalculator(JSON.parse(raw)); } catch (err) { /* 값이 깨졌으면 아무 일도 하지 않습니다 */ }
  });

  /* ---------------- 불러오기 ---------------- */
  function load() {
    if (typeof fetch !== 'function') return;
    fetch(base() + 'data/resell-picks.json', { cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) { if (d) render(d); })
      .catch(function () { /* 데이터가 없으면 섹션을 그리지 않습니다 */ });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', load);
  else load();
})();
