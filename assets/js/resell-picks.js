/* =========================================================
   INSIGHT BRIEF — 리셀 3섹션 데이터 렌더러 (resell.html)
   · 상품(GOODS)   data/goods-picks.json  — 전자기기·캠핑·생활·레고·피규어 + 스니커즈
   · 명품(LUXURY)  data/lux-picks.json    — 명품·컨템포러리
   · 기념카드(CARDS) data/cards-picks.json — 포켓몬·원피스·유희왕(판본 코드 매칭)
   · [계산기에 바로 채우기] 를 누르면 아래 리셀 마진 계산기 입력칸을 채웁니다.
   · 서버 호출은 이 JSON 세 번뿐입니다(입력값은 여전히 브라우저 안에서만 계산).
   · 문구는 페이지 언어(ko·en·zh·ja)에 맞춰 이 파일이 직접 그립니다.
   ========================================================= */
(function () {
  'use strict';

  var LANG = (document.documentElement.getAttribute('lang') || 'ko').toLowerCase().slice(0, 2);
  if (['ko', 'en', 'zh', 'ja'].indexOf(LANG) < 0) LANG = 'ko';

  var LOCALE = { ko: 'ko-KR', en: 'en-US', zh: 'zh-CN', ja: 'ja-JP' }[LANG];
  var CURRENCY = { ko: 'KRW', en: 'USD', zh: 'CNY', ja: 'JPY' }[LANG];
  var GOODS = document.getElementById('rs-goods');
  var LUX = document.getElementById('rs-lux');
  var CARDS = document.getElementById('rs-cards');
  if (!GOODS && !LUX && !CARDS) return;

  /* ---------------- 화면 문구 ---------------- */
  var G = {
    ko: {
      kicker: 'SECTION 01 · GOODS', title: '상품 실측 마진',
      sub: '미국·일본·유럽 브랜드 공식몰과 편집샵의 실제 판매가를 국내 판매 등록가와 같은 시각에 조회해, 국제배송·관부가세·판매 수수료를 빼고 남는 순마진을 계산했습니다. 품목은 품번·레고 세트번호·나이키 상품코드로 맞췄습니다.',
      stamp: '기준 {date} · $1 = ₩{usd} · ¥1 = ₩{jpy}',
      statWatched: '감시 품목', statMatched: '시세 확인', statPos: '순마진 플러스', statBest: '최고 순마진',
      unit: '개',
      all: '전체',
      catSneakers: '스니커즈', catElectronics: '전자기기', catCamping: '캠핑', catHousehold: '생활용품',
      catLego: '레고', catFigure: '피규어',
      colFrom: '해외가', colCost: '총원가', colDom: '국내 시세', colTax: '관부가세', colMargin: '순마진',
      originUS: '미국', originJP: '일본', originEU: '유럽', originUK: '영국', originCA: '캐나다', rrp: '정가 기준',
      linkBuy: '해외 상품', linkDom: '국내 시세', fill: '계산기에 바로 채우기',
      fillDone: '계산기에 값을 넣었습니다. 배송·수수료를 바꿔 직접 확인해 보세요.',
      negAll: '오늘 확인된 {n}개 가운데 순마진이 플러스인 품목은 없습니다. 아래는 그래도 가장 나은 순서입니다.',
      some: '{n}개 가운데 {p}개만 순마진이 플러스입니다.',
      note1: '<b>해외가</b>는 브랜드 공식 스토어가 공개한 실제 판매가입니다. 레고는 공식 소비자가(RRP)라 <b>정가 기준</b>으로 표시했고, 국내 등록가가 정가의 1.6배를 넘는 단종·희소 세트는 순위에서 뺐습니다.',
      note2: '<b>국내 시세</b>는 에누리 가격비교에서 모델명이 일치하는 매물만 골라 중앙값을 쓴 값입니다. 실제 체결가는 이보다 낮을 수 있습니다.',
      note3: '<b>관부가세</b>는 미국 $200·일본/유럽/영국 $150 면세 한도(물품가 기준)를 넘을 때만 붙습니다. 가방·시계는 200만 원을 넘는 초과분에 개별소비세 20%와 교육세 30%가 더 붙습니다. 유럽·영국 가격은 현지 부가세를 뺀 수출 구매 기준입니다.',
      hw: '품목명·모델 코드·가격만 공개 데이터로 옮겼습니다. 개인정보는 담지 않습니다.'
    },
    en: {
      kicker: 'SECTION 01 · GOODS', title: 'Goods by measured margin',
      sub: 'Live prices from US, Japanese and European brand stores and concept shops are matched by style code, LEGO set number and Nike product code against the Korean listing price, then international shipping, duty and platform fees are taken out to leave the net margin.',
      stamp: 'As of {date} · $1 = ₩{usd} · ¥1 = ₩{jpy}',
      statWatched: 'Items watched', statMatched: 'Prices matched', statPos: 'Positive margin', statBest: 'Best margin',
      unit: 'items',
      all: 'All',
      catSneakers: 'Sneakers', catElectronics: 'Electronics', catCamping: 'Camping', catHousehold: 'Home goods',
      catLego: 'LEGO', catFigure: 'Figures',
      colFrom: 'Overseas', colCost: 'Total cost', colDom: 'Korea price', colTax: 'Duty & VAT', colMargin: 'Net margin',
      originUS: 'US', originJP: 'Japan', originEU: 'Europe', originUK: 'UK', originCA: 'Canada', rrp: 'at RRP',
      linkBuy: 'Overseas listing', linkDom: 'Korea price', fill: 'Fill the calculator',
      fillDone: 'Values are in the calculator. Change shipping or fees to test it yourself.',
      negAll: 'None of the {n} items matched today clears a positive net margin. The list is still the best order.',
      some: 'Only {p} of {n} items clear a positive net margin.',
      note1: '<b>Overseas</b> is the live price published by the brand store. LEGO sets are marked <b>at RRP</b>; retired sets whose Korean listing exceeds 1.6× RRP are dropped from the ranking.',
      note2: '<b>Korea price</b> is the median of Enuri listings carrying the same model code. Real trades can close lower.',
      note3: '<b>Duty and VAT</b> apply only above the US$200 (US) / US$150 (Japan, Europe, UK) personal-use threshold. Bags and watches above ₩2m also carry 20% individual consumption tax on the excess plus 30% education tax. European and UK prices are taken ex-VAT for export purchase.',
      hw: 'Only product name, model code and prices come from public data. No personal information is included.'
    },
    zh: {
      kicker: 'SECTION 01 · GOODS', title: '商品实测利润',
      sub: '同一时点读取美国、日本、欧洲品牌官网与买手店的实时售价，按型号、乐高套装编号、耐克商品编号与韩国标价匹配，扣除国际运费、关税与增值税、平台手续费后的净利润。',
      stamp: '基准 {date} · $1 = {usd} 韩元 · ¥1 = {jpy} 韩元',
      statWatched: '监看商品', statMatched: '价格确认', statPos: '净利润为正', statBest: '最高净利润',
      unit: '个',
      all: '全部',
      catSneakers: '球鞋', catElectronics: '电子设备', catCamping: '露营', catHousehold: '生活用品',
      catLego: '乐高', catFigure: '手办',
      colFrom: '海外价', colCost: '总成本', colDom: '韩国价格', colTax: '关税与增值税', colMargin: '净利润',
      originUS: '美国', originJP: '日本', originEU: '欧洲', originUK: '英国', originCA: '加拿大', rrp: '按定价',
      linkBuy: '海外商品', linkDom: '韩国价格', fill: '填入计算器',
      fillDone: '已填入计算器。可修改运费与手续费自行验证。',
      negAll: '今日匹配的 {n} 个商品中，净利润为正的为零。下表仍为最优顺序。',
      some: '{n} 个商品中仅 {p} 个净利润为正。',
      note1: '<b>海外价</b>取自品牌官网公开的实时售价。乐高仅有官方定价可用，故标注<b>按定价</b>；韩国标价超过定价 1.6 倍的停产稀有套装已从排名剔除。',
      note2: '<b>韩国价格</b>取 Enuri 上名称含同一型号代码的标价中位数。实际成交可能更低。',
      note3: '<b>关税与增值税</b>仅在超过美国 200 美元 / 日本·欧洲·英国 150 美元个人自用免税额度时计征。包袋、手表超过 200 万韩元的部分另征 20% 个别消费税与 30% 教育税。欧洲、英国价格按扣除当地增值税的出口购买价计算。',
      hw: '仅迁移商品名、型号代码与价格等公开数据，不含个人信息。'
    },
    ja: {
      kicker: 'SECTION 01 · GOODS', title: '商品 実測マージン',
      sub: '米国・日本・欧州のブランド公式ストアとセレクトショップの実売価格を、型番・レゴのセット番号・ナイキの商品コードで韓国の販売価格と照合し、国際送料・関税/付加税・手数料を差し引いた純利益を計算しました。',
      stamp: '基準 {date} · $1 = {usd}ウォン · ¥1 = {jpy}ウォン',
      statWatched: '監視アイテム', statMatched: '価格確認', statPos: '純利益プラス', statBest: '最高純利益',
      unit: '件',
      all: 'すべて',
      catSneakers: 'スニーカー', catElectronics: '電子機器', catCamping: 'キャンプ', catHousehold: '生活用品',
      catLego: 'レゴ', catFigure: 'フィギュア',
      colFrom: '海外価格', colCost: '総コスト', colDom: '韓国価格', colTax: '関税・付加税', colMargin: '純利益',
      originUS: '米国', originJP: '日本', originEU: '欧州', originUK: '英国', originCA: 'カナダ', rrp: '定価基準',
      linkBuy: '海外商品', linkDom: '韓国価格', fill: '計算機に入れる',
      fillDone: '計算機に入力しました。送料や手数料を変えて確認できます。',
      negAll: '本日照合した {n} 件のうち純利益がプラスのものはありません。下表はそれでも最良の順です。',
      some: '{n} 件のうち {p} 件だけが純利益プラスです。',
      note1: '<b>海外価格</b>はブランド公式ストアが公開する実売価格です。レゴは公式定価しか取得できないため<b>定価基準</b>と表示し、韓国の出品価格が定価の1.6倍を超える廃盤・希少セットは順位から外しました。',
      note2: '<b>韓国価格</b>はEnuriで同じ型番が名前に含まれる出品の中央値です。実際の成約はこれより低いことがあります。',
      note3: '<b>関税・付加税</b>は米国200ドル・日本/欧州/英国150ドルの免税枠（商品価格基準）を超えた場合のみ発生します。バッグ・時計は200万ウォンを超える部分に個別消費税20%と教育税30%が加わります。欧州・英国の価格は現地付加税を除いた輸出購入ベースです。',
      hw: '商品名・型番・価格のみを公開データから移しています。個人情報は含みません。'
    }
  }[LANG];

  var L = {
    ko: {
      kicker: 'SECTION 02 · LUXURY', title: '명품·컨템포러리 실측 마진',
      sub: '아미·몽클레르·톰브라운·이자벨마랑 등 유럽·영국 브랜드 공식몰과 편집샵의 실판매가를 스타일 코드(품번)로 국내 등록가와 맞췄습니다. 현지 부가세를 뺀 수출 구매가에 국제배송·관부가세·수수료를 반영했습니다.',
      stamp: '기준 {date} · €1 = ₩{eur} · £1 = ₩{gbp} · $1 = ₩{usd}',
      statWatched: '감시 품목', statMatched: '시세 확인', statPos: '순마진 플러스', statBest: '최고 순마진',
      unit: '개', all: '', colFrom: '해외가', colCost: '총원가', colDom: '국내 시세', colTax: '관부가세', colMargin: '순마진',
      originUS: '미국', originJP: '일본', originEU: '유럽', originUK: '영국', originCA: '캐나다', rrp: '정가 기준',
      linkBuy: '해외 상품', linkDom: '국내 시세', fill: '계산기에 바로 채우기',
      fillDone: '계산기에 값을 넣었습니다. 배송·수수료를 바꿔 직접 확인해 보세요.',
      negAll: '오늘 확인된 {n}개 가운데 순마진이 플러스인 품목은 없습니다. 아래는 그래도 가장 나은 순서입니다.',
      some: '{n}개 가운데 {p}개만 순마진이 플러스입니다.',
      note1: '<b>해외가</b>는 브랜드 공식몰·편집샵이 공개한 실판매가입니다. 유럽·영국 매장 가격에 포함된 현지 부가세(20%)를 빼고 계산했습니다.',
      note2: '<b>국내 시세</b>는 에누리에서 품번이 이름에 들어간 매물만 골라 중앙값을 쓴 값입니다. 가품·다른 시즌이 섞이지 않았는지 결제 전에 확인하세요.',
      note3: '<b>관부가세</b>는 유럽·영국 발송 물품가 $150을 넘을 때 붙습니다(의류 13%, 가방·지갑 8% + 부가세 10%). 가방·시계는 200만 원 초과분에 개별소비세 20%와 교육세 30%가 더 붙습니다.',
      hw: '품목명·품번·가격만 공개 데이터로 옮겼습니다. 개인정보는 담지 않습니다.'
    },
    en: {
      kicker: 'SECTION 02 · LUXURY', title: 'Luxury & contemporary by measured margin',
      sub: 'Live prices from European and UK brand stores and concept shops (Ami, Moncler, Thom Browne, Isabel Marant and others) are matched by style code against Korean listings, using the ex-VAT export price plus international shipping, duty and fees.',
      stamp: 'As of {date} · €1 = ₩{eur} · £1 = ₩{gbp} · $1 = ₩{usd}',
      statWatched: 'Items watched', statMatched: 'Prices matched', statPos: 'Positive margin', statBest: 'Best margin',
      unit: 'items', all: '', colFrom: 'Overseas', colCost: 'Total cost', colDom: 'Korea price', colTax: 'Duty & VAT', colMargin: 'Net margin',
      originUS: 'US', originJP: 'Japan', originEU: 'Europe', originUK: 'UK', originCA: 'Canada', rrp: 'at RRP',
      linkBuy: 'Overseas listing', linkDom: 'Korea price', fill: 'Fill the calculator',
      fillDone: 'Values are in the calculator. Change shipping or fees to test it yourself.',
      negAll: 'None of the {n} items matched today clears a positive net margin. The list is still the best order.',
      some: 'Only {p} of {n} items clear a positive net margin.',
      note1: '<b>Overseas</b> is the live price from the brand store or concept shop, taken ex-VAT (20% local VAT removed) for export.',
      note2: '<b>Korea price</b> is the median of Enuri listings whose name carries the same style code. Check for counterfeits and wrong seasons before paying.',
      note3: '<b>Duty and VAT</b> apply above the US$150 threshold for goods sent from Europe or the UK (13% apparel, 8% bags, plus 10% VAT). Bags and watches above ₩2m carry 20% individual consumption tax on the excess plus 30% education tax.',
      hw: 'Only product name, style code and prices come from public data. No personal information is included.'
    },
    zh: {
      kicker: 'SECTION 02 · LUXURY', title: '奢侈品·设计师 实测利润',
      sub: '以型款代码（货号）将欧洲、英国品牌官网与买手店（Ami、Moncler、Thom Browne、Isabel Marant 等）的实时售价与韩国标价匹配，按扣除当地增值税的出口价计算国际运费、关税与增值税、手续费。',
      stamp: '基准 {date} · €1 = {eur} 韩元 · £1 = {gbp} 韩元 · $1 = {usd} 韩元',
      statWatched: '监看商品', statMatched: '价格确认', statPos: '净利润为正', statBest: '最高净利润',
      unit: '个', all: '', colFrom: '海外价', colCost: '总成本', colDom: '韩国价格', colTax: '关税与增值税', colMargin: '净利润',
      originUS: '美国', originJP: '日本', originEU: '欧洲', originUK: '英国', originCA: '加拿大', rrp: '按定价',
      linkBuy: '海外商品', linkDom: '韩国价格', fill: '填入计算器',
      fillDone: '已填入计算器。可修改运费与手续费自行验证。',
      negAll: '今日匹配的 {n} 个商品中，净利润为正的为零。下表仍为最优顺序。',
      some: '{n} 个商品中仅 {p} 个净利润为正。',
      note1: '<b>海外价</b>取自品牌官网与买手店的实时售价，已扣除当地 20% 增值税的出口价。',
      note2: '<b>韩国价格</b>取 Enuri 上名称含同一货号的标价中位数。付款前请确认是否为正品、是否同一季。',
      note3: '<b>关税与增值税</b>在欧洲、英国发货货值超过 150 美元时计征（服装 13%、包袋 8%，另加 10% 增值税）。包袋、手表超过 200 万韩元的部分另征 20% 个别消费税与 30% 教育税。',
      hw: '仅迁移商品名、货号与价格等公开数据，不含个人信息。'
    },
    ja: {
      kicker: 'SECTION 02 · LUXURY', title: 'ラグジュアリー・コンテンポラリー 実測マージン',
      sub: 'Ami・Moncler・Thom Browne・Isabel Marant など欧州・英国ブランド公式ストアとセレクトショップの実売価格を型番で韓国の販売価格と照合し、現地付加税を除いた輸出購入価格に国際送料・関税/付加税・手数料を反映しました。',
      stamp: '基準 {date} · €1 = {eur}ウォン · £1 = {gbp}ウォン · $1 = {usd}ウォン',
      statWatched: '監視アイテム', statMatched: '価格確認', statPos: '純利益プラス', statBest: '最高純利益',
      unit: '件', all: '', colFrom: '海外価格', colCost: '総コスト', colDom: '韓国価格', colTax: '関税・付加税', colMargin: '純利益',
      originUS: '米国', originJP: '日本', originEU: '欧州', originUK: '英国', originCA: 'カナダ', rrp: '定価基準',
      linkBuy: '海外商品', linkDom: '韓国価格', fill: '計算機に入れる',
      fillDone: '計算機に入力しました。送料や手数料を変えて確認できます。',
      negAll: '本日照合した {n} 件のうち純利益がプラスのものはありません。下表はそれでも最良の順です。',
      some: '{n} 件のうち {p} 件だけが純利益プラスです。',
      note1: '<b>海外価格</b>はブランド公式ストア・セレクトショップの実売価格で、現地付加税20%を除いた輸出購入ベースです。',
      note2: '<b>韓国価格</b>はEnuriで同じ型番が名前に含まれる出品の中央値です。偽物・別シーズンでないか支払い前に確認してください。',
      note3: '<b>関税・付加税</b>は欧州・英国発送の商品価格が150ドルを超える場合にかかります（衣類13%・バッグ8%＋付加税10%）。バッグ・時計は200万ウォンを超える部分に個別消費税20%と教育税30%が加わります。',
      hw: '商品名・型番・価格のみを公開データから移しています。個人情報は含みません。'
    }
  }[LANG];

  var C = {
    ko: {
      kicker: 'SECTION 03 · TRADING CARDS', title: '기념카드 국내외 시세 차익',
      sub: '포켓몬·원피스·유희왕을 같은 일본판·같은 판본 코드끼리만 비교합니다. 일본 카드샵 판매가로 사서 국내 시세에 되팔 때, 국제배송·관부가세·KREAM 수수료를 빼고 남는 금액입니다.',
      stamp: '기준 {date} · ¥1 = {fx}원',
      statCards: '확인한 카드', statResolved: '시세 확정', statPos: '순마진 플러스', statBest: '최고 순마진',
      unit: '종', all: '전체',
      gamePokemon: '포켓몬', gameOnepiece: '원피스', gameYugioh: '유희왕',
      colJp: '일본 구매가', colKr: '국내 기준가', colSell: '판매가 (−10%)', colFee: '관부가세·배송비', colCost: '총원가', colMargin: '순마진',
      bep: '손익분기 매입가', bepBelow: '손익분기선 아래', confirm: '판본 확인 필요',
      linkJp: '일본 상품', linkKr: '국내 시세', fill: '계산기에 바로 채우기',
      fillDone: '계산기에 값을 넣었습니다. 매입가와 판매가를 바꿔 직접 확인해 보세요.',
      allNeg: '지금 일본 카드샵 소매가로는 확정 {n}종 모두 마이너스입니다. 카드마다 적힌 손익분기 매입가보다 싸게 구할 수 있을 때만 남습니다.',
      some: '확정 {n}종 가운데 {p}종이 순마진 플러스입니다.',
      note1: '<b>국내 기준가</b>는 TCGIndex가 (일어판) 판본 페이지에 적어 둔 KREAM 판매 등록가(최저)이고, 판매가는 여기서 10% 낮춰 잡았습니다. 실제 체결가는 등록가보다 낮을 수 있습니다.',
      note2: '<b>관부가세·배송비</b>에는 일본 배대지 국제배송과 국내 택배가 들어 있습니다. 카드 관세는 0%이고, 물품가가 150달러를 넘으면 부가세 10%와 통관수수료 4,000원이 붙습니다.',
      note3: '<b>손익분기 매입가</b>보다 싸게 사야 남습니다. 원피스·유희왕은 같은 코드에도 페러럴·프로모·재판 판본이 있어 값이 몇 배 갈리므로, 판본 코드가 같은 페이지만 썼고 <b>국내가가 일본가의 12배를 넘는 항목은 뺐습니다</b>. ⚠️ 표시는 등급·일러스트 차이 가능성이 큰 항목입니다.',
      hw: '카드명·세트·판본 코드·가격만 공개 데이터로 옮겼습니다. 개인정보는 담지 않습니다.'
    },
    en: {
      kicker: 'SECTION 03 · TRADING CARDS', title: 'Trading cards: Japan → Korea price gap',
      sub: 'Pokémon, One Piece and Yu-Gi-Oh! compared only within the same Japanese printing code. What is left after international shipping, duty and KREAM fees when you buy at a Japanese card shop and sell at the Korean price.',
      stamp: 'As of {date} · ¥1 = ₩{fx}',
      statCards: 'Cards watched', statResolved: 'Prices confirmed', statPos: 'Positive margin', statBest: 'Best margin',
      unit: 'cards', all: 'All',
      gamePokemon: 'Pokémon', gameOnepiece: 'One Piece', gameYugioh: 'Yu-Gi-Oh!',
      colJp: 'Japan price', colKr: 'Korea price', colSell: 'Sale price (−10%)', colFee: 'Duty & shipping', colCost: 'Total cost', colMargin: 'Net margin',
      bep: 'Break-even buy price', bepBelow: 'Cheapest copy below break-even', confirm: 'Check the printing',
      linkJp: 'Japan listing', linkKr: 'Korea price', fill: 'Fill the calculator',
      fillDone: 'Values are in the calculator. Change the buy and sale prices to test it yourself.',
      allNeg: 'At today’s Japanese retail prices all {n} confirmed cards are negative. These trades only pay when you buy below the break-even price printed on each card.',
      some: 'Only {p} of {n} confirmed cards clear a positive margin.',
      note1: 'The <b>Korea price</b> is the lowest KREAM asking price that TCGIndex records for the same Japanese printing code, and the sale price is set 10% below it. Actual trades can close lower.',
      note2: '<b>Duty and shipping</b> include Japan proxy international shipping and the domestic courier. Cards carry 0% duty; above US$150 of goods, 10% VAT and a ₩4,000 clearance fee apply.',
      note3: 'You only make money buying below the <b>break-even price</b>. One Piece and Yu-Gi-Oh! share a code between parallel, promo and reprint versions, so only pages with the identical printing code are used and <b>rows where the Korean price exceeds 12× the Japanese price are dropped</b>. ⚠️ marks rows where grade or artwork may differ.',
      hw: 'Only card name, set, printing code and prices come from public data. No personal information is included.'
    },
    zh: {
      kicker: 'SECTION 03 · TRADING CARDS', title: '集换卡 日韩价差',
      sub: '宝可梦、海贼王、游戏王仅在相同日版·相同版次代码之间比较。在日本卡店买入、按韩国价格卖出，扣除国际运费、关税与增值税、KREAM 手续费后的净额。',
      stamp: '基准 {date} · ¥1 = {fx} 韩元',
      statCards: '检查卡牌', statResolved: '价格确认', statPos: '净利润为正', statBest: '最高净利润',
      unit: '种', all: '全部',
      gamePokemon: '宝可梦', gameOnepiece: '海贼王', gameYugioh: '游戏王',
      colJp: '日本买入价', colKr: '韩国参考价', colSell: '售价（−10%）', colFee: '关税与运费', colCost: '总成本', colMargin: '净利润',
      bep: '盈亏平衡买入价', bepBelow: '最低在售低于平衡线', confirm: '需确认版次',
      linkJp: '日本商品', linkKr: '韩国价格', fill: '填入计算器',
      fillDone: '已填入计算器。可修改买入价与售价自行验证。',
      allNeg: '按今日日本卡店零售价，{n} 张已确认卡牌全部为负。只有低于每张卡标注的盈亏平衡价买入才有利润。',
      some: '{n} 张已确认卡牌中仅 {p} 张净利润为正。',
      note1: '<b>韩国参考价</b>取自 TCGIndex 记录的相同日版版次 KREAM 最低在售价，售价比其低 10%。实际成交可能更低。',
      note2: '<b>关税与运费</b>含日本转运国际运费与韩国国内快递。卡牌关税为 0%；货值超过 150 美元时加征 10% 增值税与 4,000 韩元通关费。',
      note3: '买入价低于<b>盈亏平衡价</b>才有利润。海贼王、游戏王同一代码存在异画、活动、复刻版次，因此只采用版次代码相同的页面，并<b>剔除韩国价为日本价 12 倍以上的行</b>。⚠️ 表示等级或画面可能有差异。',
      hw: '仅迁移卡名、系列、版次代码与价格等公开数据，不含个人信息。'
    },
    ja: {
      kicker: 'SECTION 03 · TRADING CARDS', title: 'トレカ 日韓価格差',
      sub: 'ポケモン・ワンピース・遊戯王を、同じ日本語版・同じ版コード同士でのみ比較します。日本のカードショップで買い、韓国価格で売るとき、国際送料・関税/付加税・KREAM手数料を引いて残る金額です。',
      stamp: '基準 {date} · ¥1 = {fx}ウォン',
      statCards: '確認カード', statResolved: '価格確定', statPos: '純利益プラス', statBest: '最高純利益',
      unit: '種', all: 'すべて',
      gamePokemon: 'ポケモン', gameOnepiece: 'ワンピース', gameYugioh: '遊戯王',
      colJp: '日本買値', colKr: '韓国参考価格', colSell: '売値（−10%）', colFee: '関税・送料', colCost: '総コスト', colMargin: '純利益',
      bep: '損益分岐の買値', bepBelow: '最安在庫が分岐線以下', confirm: '版の確認が必要',
      linkJp: '日本の商品', linkKr: '韓国価格', fill: '計算機に入れる',
      fillDone: '計算機に入力しました。買値と売値を変えて確認できます。',
      allNeg: '本日の日本カードショップ小売価格では、確定 {n} 種すべてマイナスです。各カードの損益分岐買値より安く買えたときだけ残ります。',
      some: '確定 {n} 種のうち {p} 種が純利益プラスです。',
      note1: '<b>韓国参考価格</b>はTCGIndexが日本語版の版ページに記録したKREAMの最安出品価格で、売値はそこから10%下げています。実際の成約はさらに低いことがあります。',
      note2: '<b>関税・送料</b>には日本の転送業者の国際送料と韓国国内宅配が入っています。カードの関税は0%、商品価格が150ドルを超えると付加税10%と通関手数料4,000ウォンがかかります。',
      note3: '<b>損益分岐買値</b>より安く買わないと残りません。ワンピース・遊戯王は同じコードでもパラレル・プロモ・再録の版があり価格が数倍違うため、版コードが同じページのみを使い、<b>韓国価格が日本価格の12倍を超える行は除外</b>しています。⚠️はグレード・絵柄の違いの可能性が大きい行です。',
      hw: 'カード名・セット・版コード・価格のみを公開データから移しています。個人情報は含みません。'
    }
  }[LANG];

  var SYM = { KRW: '₩', USD: 'US$', JPY: 'JPY ', EUR: '€', GBP: '£', CAD: 'C$', SEK: 'kr ', CNY: 'CN¥' };
  var GAME_LABEL = {
    pokemon: C.gamePokemon, onepiece: C.gameOnepiece, yugioh: C.gameYugioh
  };

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
  function yen(n) { return '\u00a5' + nf(Math.round(n)); }
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
  function fresh(d) {
    var age = (Date.now() - new Date(d.generatedAt || d.date).getTime()) / 36e5;
    return !(isFinite(age) && age > 96);       /* 나흘 넘게 끊긴 데이터는 내보내지 않습니다 */
  }
  function num(n) { return n > 0 ? '+' + nf(Math.round(n)) : '\u2212' + nf(Math.abs(Math.round(n))); }

  /* ---------------- 공통 헤더 ---------------- */
  function head(T, d, stats, stampMap, chips) {
    var pos = (d.scan && d.scan.positive) || 0;
    var best = (d.scan && d.scan.best) || 0;
    var stamp = tpl(T.stamp, stampMap);
    var row = '<div class="rs-pk-head">' +
      '<div class="rs-pk-title">' +
        '<span class="kicker">' + esc(T.kicker) + '</span>' +
        '<h2>' + esc(T.title) + '</h2>' +
        '<p class="rs-pk-sub">' + esc(T.sub) + '</p>' +
        '<p class="rs-pk-stamp">' + esc(stamp) + '</p>' +
      '</div>' +
      '<div class="rs-pk-stats">' +
        stats.map(function (s) {
          return '<div class="rs-pk-stat' + (s.flat ? ' is-flat' : '') + '"><span>' + esc(s.k) + '</span><b class="' + (s.cls || '') + '">' + s.v + (s.unit ? '<i>' + esc(s.unit) + '</i>' : '') + '</b></div>';
        }).join('') +
      '</div>' +
    '</div>';
    return row + (chips || '');
  }

  function chipsBar(list, labelFn) {
    if (!list || list.length < 2) return '';
    var html = '<button type="button" class="rs-pk-chip is-on" data-cat="all">' + esc(C.all === 'All' ? 'All' : (G.all || C.all)) + '</button>';
    list.forEach(function (c) {
      html += '<button type="button" class="rs-pk-chip" data-cat="' + esc(c.key) + '">' + esc(labelFn(c.key)) +
        ' <i>' + c.count + '</i></button>';
    });
    return '<div class="rs-pk-chips" role="group">' + html + '</div>';
  }

  function notes(T, warn) {
    return (warn ? '<p class="rs-pk-warn">' + esc(warn) + '</p>' : '') +
      '<div class="rs-pk-notes"><b>' + esc(LANG === 'ko' ? '이 숫자를 읽는 법' : (LANG === 'en' ? 'How to read these numbers' : (LANG === 'zh' ? '数字怎么看' : '数字の読み方'))) + '</b>' +
        '<p>' + T.note1 + '</p><p>' + T.note2 + '</p><p>' + T.note3 + '</p>' +
        '<p class="hw">' + esc(T.hw) + '</p></div>';
  }

  function bindChips(el) {
    if (!el) return;
    el.addEventListener('click', function (e) {
      var chip = e.target.closest ? e.target.closest('.rs-pk-chip') : null;
      if (!chip) return;
      var cat = chip.getAttribute('data-cat');
      var chips = el.querySelectorAll('.rs-pk-chip');
      for (var i = 0; i < chips.length; i++) chips[i].classList.toggle('is-on', chips[i] === chip);
      var cards = el.querySelectorAll('.rs-pk-card');
      for (var j = 0; j < cards.length; j++) {
        cards[j].hidden = cat !== 'all' && cards[j].getAttribute('data-cat') !== cat;
      }
    });
  }

  /* ---------------- 상품·명품 카드 ---------------- */
  function catLabel(cat) {
    var key = { sneakers: 'catSneakers', electronics: 'catElectronics', camping: 'catCamping',
                household: 'catHousehold', lego: 'catLego', figure: 'catFigure' }[cat];
    return key ? G[key] : cat;
  }

  function prodCard(T, it) {
    var cur = it.cur || 'USD';
    var margin = it.margin;
    var cls = margin >= 0 ? 'pos' : 'neg';
    var name = LANG === 'ko' ? (it.nameKo || it.nameEn) : (it.nameEn || it.nameKo);
    var link = it.overseasUrl
      ? '<a href="' + esc(it.overseasUrl) + '" target="_blank" rel="noopener noreferrer" title="' + esc(T.linkBuy) + '">' + esc(name) + '</a>'
      : esc(name);
    var originTxt = T['origin' + (it.origin || 'US')] || T.originUS;
    var links = '<p class="rs-pk-links">' +
      (it.overseasUrl ? '<a href="' + esc(it.overseasUrl) + '" target="_blank" rel="noopener noreferrer">' + esc(T.linkBuy) + ' \u2197</a>' : '') +
      (it.krUrl ? '<a href="' + esc(it.krUrl) + '" target="_blank" rel="noopener noreferrer">' + esc(T.linkDom) + ' \u2197</a>' : '') +
      '</p>';
    return '<article class="rs-pk-card" data-cat="' + esc(it.cat) + '">' +
      '<div class="rs-pk-top">' +
        '<span class="rs-pk-rank">' + String(it.rank).padStart(2, '0') + '</span>' +
        (it.cat === 'lux' ? '' : '<span class="rs-pk-tag rs-pk-cat">' + esc(it.cat === 'sneakers' ? T.catSneakers : catLabel(it.cat)) + '</span>') +
        '<span class="rs-pk-tag">' + esc(originTxt) + '</span>' +
        (it.priceKind === 'rrp' ? '<span class="rs-pk-tag rs-pk-tag--rrp">' + esc(T.rrp) + '</span>' : '') +
      '</div>' +
      '<h3 class="rs-pk-name">' + link + '</h3>' +
      (it.model && String(it.nameKo || '').indexOf(it.model) < 0 && String(it.nameEn || '').indexOf(it.model) < 0
        ? '<p class="rs-pk-sku">' + esc(it.model) + '</p>' : '') +
      '<dl class="rs-pk-rows">' +
        '<div><dt>' + esc(T.colFrom) + '</dt><dd>' + money(it.price, cur) + '</dd></div>' +
        '<div><dt>' + esc(T.colCost) + '</dt><dd>' + krw(it.invested) + '</dd></div>' +
        '<div><dt>' + esc(T.colDom) + '</dt><dd>' + krw(it.domestic) + '</dd></div>' +
        '<div><dt>' + esc(T.colTax) + '</dt><dd>' + krw(it.customs || 0) + '</dd></div>' +
      '</dl>' +
      '<div class="rs-pk-margin ' + cls + '">' +
        '<span class="k">' + esc(T.colMargin) + '</span>' +
        '<b>' + signed(margin) + '<i>' + esc(CURRENCY === 'KRW' ? '\uc6d0' : 'KRW') + '</i></b>' +
        '<span class="r">ROI ' + pct(it.roi) + '</span>' +
      '</div>' + links +
      '<button type="button" class="rs-pk-fill" data-fill="' + esc(JSON.stringify(it.fill || {})) + '">' + esc(T.fill) + ' \u2192</button>' +
    '</article>';
  }

  function prodStats(T, d) {
    var s = d.scan || {};
    return [
      { k: T.statWatched, v: nf(s.watched || 0), unit: T.unit },
      { k: T.statMatched, v: nf(s.matched || 0), unit: T.unit },
      { k: T.statPos, v: nf(s.positive || 0), unit: T.unit, flat: !s.positive },
      { k: T.statBest, v: num(s.best || 0), cls: (s.best || 0) >= 0 ? 'pos' : 'neg' }
    ];
  }

  function renderGoods(d) {
    if (!GOODS || !d || !(d.items || []).length || !fresh(d)) return;
    var fx = d.fx || {};
    var stamp = { date: fmtDate(d.generatedAt || d.date), usd: nf(fx.usdKrw, 2), jpy: nf(fx.jpyKrw, 2) };
    var cats = d.categories || [];
    GOODS.innerHTML = head(G, d, prodStats(G, d), stamp, chipsBar(cats, catLabel)) +
      '<div class="rs-pk-grid">' + d.items.map(function (it) { return prodCard(G, it); }).join('') + '</div>' +
      notes(G, (d.scan && d.scan.positive) === 0
        ? tpl(G.negAll, { n: (d.scan && d.scan.matched) || 0 })
        : ((d.scan && d.scan.positive) < ((d.scan && d.scan.matched) || 0) ? tpl(G.some, { n: (d.scan && d.scan.matched) || 0, p: (d.scan && d.scan.positive) || 0 }) : ''));
    GOODS.hidden = false;
    bindChips(GOODS);
  }

  function renderLux(d) {
    if (!LUX || !d || !(d.items || []).length || !fresh(d)) return;
    var fx = d.fx || {};
    var stamp = { date: fmtDate(d.generatedAt || d.date), usd: nf(fx.usdKrw, 2), jpy: nf(fx.jpyKrw, 2), eur: '1,474.6', gbp: '1,761.2' };
    LUX.innerHTML = head(L, d, prodStats(L, d), stamp, '') +
      '<div class="rs-pk-grid">' + d.items.map(function (it) { return prodCard(L, it); }).join('') + '</div>' +
      notes(L, (d.scan && d.scan.positive) === 0
        ? tpl(L.negAll, { n: (d.scan && d.scan.matched) || 0 })
        : ((d.scan && d.scan.positive) < ((d.scan && d.scan.matched) || 0) ? tpl(L.some, { n: (d.scan && d.scan.matched) || 0, p: (d.scan && d.scan.positive) || 0 }) : ''));
    LUX.hidden = false;
  }

  /* ---------------- 기념카드 ---------------- */
  function cardName(it) {
    if (LANG === 'ja') return it.nameJp || it.nameEn || it.nameKo;
    if (LANG === 'zh') return it.nameZh || it.nameEn || it.nameKo || it.nameJp;
    if (LANG === 'en') return it.nameEn || it.nameKo || it.nameJp;
    return it.nameKo || it.nameEn || it.nameJp;
  }

  function cardRow(it) {
    var margin = it.margin || 0;
    var cls = margin >= 0 ? 'pos' : 'neg';
    var bep = (it.bep === 0 || it.bep) ? it.bep : null;
    var below = bep != null && it.jp && it.jp <= bep;
    return '<article class="rs-pk-card" data-cat="' + esc(it.game) + '">' +
      '<div class="rs-pk-top">' +
        '<span class="rs-pk-rank">' + String(it.rank).padStart(2, '0') + '</span>' +
        '<span class="rs-pk-tag rs-pk-cat">' + esc(GAME_LABEL[it.game] || it.game) + '</span>' +
        '<span class="rs-pk-tag">' + esc(it.code || '') + '</span>' +
        (it.rarity ? '<span class="rs-pk-tag">' + esc(it.rarity) + '</span>' : '') +
        (it.extreme ? '<span class="rs-pk-flag">' + esc(C.confirm) + '</span>' : '') +
        (below ? '<span class="rs-pk-flag">' + esc(C.bepBelow) + '</span>' : '') +
      '</div>' +
      '<h3 class="rs-pk-name">' + esc(cardName(it)) + '</h3>' +
      (it.setKo && LANG === 'ko' ? '<p class="rs-pk-sku">' + esc(it.setKo) + '</p>' : '') +
      '<dl class="rs-pk-rows">' +
        '<div><dt>' + esc(C.colJp) + '</dt><dd>' + yen(it.jp) + (it.jpCond && it.jpCond !== '기준' ? ' \u00b7 ' + esc(it.jpCond) : '') + '</dd></div>' +
        '<div><dt>' + esc(C.colKr) + '</dt><dd>' + krw(it.kr) + '</dd></div>' +
        '<div><dt>' + esc(C.colSell) + '</dt><dd>' + krw(it.sell) + '</dd></div>' +
        '<div><dt>' + esc(C.colFee) + '</dt><dd>' + krw(it.customs || 0) + ' \u00b7 ' + krw(it.shipping || 0) + '</dd></div>' +
        '<div><dt>' + esc(C.colCost) + '</dt><dd>' + krw(it.invested) + '</dd></div>' +
      '</dl>' +
      '<div class="rs-pk-margin ' + cls + '">' +
        '<span class="k">' + esc(C.colMargin) + '</span>' +
        '<b>' + signed(margin) + '<i>' + esc(CURRENCY === 'KRW' ? '\uc6d0' : 'KRW') + '</i></b>' +
        '<span class="r">ROI ' + pct(it.roi) + '</span>' +
      '</div>' +
      '<p class="rs-pk-bep"><span>' + esc(C.bep) + '</span><b>' + (bep != null ? yen(bep) : '\u2014') + '</b></p>' +
      '<p class="rs-pk-links">' +
        (it.jpUrl ? '<a href="' + esc(it.jpUrl) + '" target="_blank" rel="noopener noreferrer">' + esc(C.linkJp) + ' \u2197</a>' : '') +
        (it.krUrl ? '<a href="' + esc(it.krUrl) + '" target="_blank" rel="noopener noreferrer">' + esc(C.linkKr) + ' \u2197</a>' : '') +
      '</p>' +
      '<button type="button" class="rs-pk-fill" data-fill="' + esc(JSON.stringify(it.fill || {})) + '">' + esc(C.fill) + ' \u2192</button>' +
    '</article>';
  }

  function renderCards(d) {
    if (!CARDS || !d || !(d.items || []).length || !fresh(d)) return;
    var fx = d.fx || {};
    var s = d.scan || {};
    var stamp = { date: fmtDate(d.generatedAt || d.date), fx: nf(fx.jpyKrw, 2) };
    var stats = [
      { k: C.statCards, v: nf(s.cards || 0), unit: C.unit },
      { k: C.statResolved, v: nf(s.resolved || 0), unit: C.unit },
      { k: C.statPos, v: nf(s.positive || 0), unit: C.unit, flat: !s.positive },
      { k: C.statBest, v: num(s.best || 0), cls: (s.best || 0) >= 0 ? 'pos' : 'neg' }
    ];
    var games = (d.games || []).map(function (g) { return { key: g.key, count: g.count }; });
    var warn = (s.positive || 0) === 0 ? tpl(C.allNeg, { n: s.resolved || 0 })
      : ((s.positive || 0) < (s.resolved || 0) ? tpl(C.some, { n: s.resolved || 0, p: s.positive || 0 }) : '');
    CARDS.innerHTML = head(C, d, stats, stamp, chipsBar(games, function (k) { return GAME_LABEL[k] || k; })) +
      '<div class="rs-pk-grid">' + d.items.map(cardRow).join('') + '</div>' + notes(C, warn);
    CARDS.hidden = false;
    bindChips(CARDS);
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
  function setCat(v) {
    var el = $('rs-a-cat');
    if (!el) return;
    for (var i = 0; i < el.options.length; i++) {
      if (el.options[i].getAttribute('data-key') === v) {
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
    toast(C.fillDone || G.fillDone);
  }

  [GOODS, LUX, CARDS].forEach(function (el) {
    if (!el) return;
    el.addEventListener('click', function (e) {
      var btn = e.target.closest ? e.target.closest('.rs-pk-fill') : null;
      if (!btn) return;
      try { fillCalculator(JSON.parse(btn.getAttribute('data-fill'))); } catch (err) { /* 값이 깨졌으면 아무 일도 하지 않습니다 */ }
    });
  });

  /* ---------------- 불러오기 ---------------- */
  function loadDoc(name, render) {
    if (typeof fetch !== 'function') return;
    fetch(base() + 'data/' + name, { cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) { if (d) render(d); })
      .catch(function () { /* 데이터가 없으면 섹션을 그리지 않습니다 */ });
  }

  function load() {
    if (GOODS) loadDoc('goods-picks.json', renderGoods);
    if (LUX) loadDoc('lux-picks.json', renderLux);
    if (CARDS) loadDoc('cards-picks.json', renderCards);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', load);
  else load();
})();
