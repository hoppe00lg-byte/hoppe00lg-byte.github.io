/* =========================================================
   INSIGHT BRIEF — 글로벌 비즈니스·출장 툴 (global.html) 데이터
   ① 무역 이메일 ② 출장 허브 ③ 사업자 포털·선적 휴무일
   · 모든 문구는 4개국어(ko/en/zh/ja) 표를 그대로 씁니다.
     (기계번역을 거치지 않으므로 /en/ /zh/ /ja/ 에 한국어가 남지 않습니다)
   · 링크·수치는 data에 모아 두고 global.js 가 화면을 그립니다.
   ========================================================= */
(function () {
  'use strict';

  var D = {};

  /* ---------------------------------------------------------------
     UI 문구
  --------------------------------------------------------------- */
  D.str = {
    ko: {
      langName: '한국어',
      tab1: '무역 이메일', tab1s: '상황별 9종 · 4개국어 원어',
      tab2: '출장 허브', tab2s: '일비·면세·단위·예약',
      tab3: '포털·휴무일', tab3s: '사업자 조회·관세·선적',
      /* 이메일 */
      mailLead: '상황을 고르고 상대 국가를 정하면, 그 나라 비즈니스 예절에 맞춘 원어 이메일이 바로 만들어집니다. 빈칸은 대괄호로 남으니 필요한 값만 채우면 됩니다.',
      fromH: '보내는 사람', toH: '받는 사람',
      fromName: '이름', fromCompany: '회사', fromTitle: '직함 (선택)',
      toName: '상대 이름', toCompany: '상대 회사',
      target: '상대 국가 (이메일 언어)', situation: '상황',
      product: '품목', qty: '수량', unit: '단위', price: '단가', cur: '통화',
      incoterm: '인코텀즈', pol: '선적항', pod: '도착항',
      etd: '선적·납기일', deadline: '회신 기한', validity: '견적 유효기간',
      invoice: '문서·인보이스 번호', amount: '금액', spec: '규격·요구사항', note: '추가로 넣을 말',
      genBtn: '이메일 만들기', copyBtn: '본문 복사', mailtoBtn: '메일 앱으로 열기', printBtn: '인쇄',
      copied: '복사했습니다', copyFail: '복사가 막혀 있습니다. 본문을 길게 눌러 직접 선택해 주세요.',
      resultH: '완성된 이메일', subject: '제목', body: '본문',
      etiqH: '이 나라와 일할 때',
      tipsH: '예절·관행',
      blankNote: '대괄호 [ ] 안은 채우지 않은 값입니다. 입력하면 사라집니다.',
      mailNote: '보낸 편지함에 남는 것은 사용자 책임입니다. 값은 서버로 전송되지 않고 브라우저에서만 만들어집니다.',
      /* 상황 이름 */
      s_inquiry: '첫 문의·거래 제안', s_quote_request: '견적 요청', s_quote_offer: '견적·오퍼 제시',
      s_negotiation: '단가 협상', s_order_confirm: '주문 확정·PI 송부', s_shipping_chase: '선적 독촉',
      s_claim: '품질·수량 클레임', s_payment_reminder: '미수금 안내', s_thanks: '감사·재주문',
      c_us: '미국 (영어)', c_cn: '중국 (중국어)', c_jp: '일본 (일본어)', c_kr: '한국 (한국어)', c_eu: '유럽·기타 (영어)',
      /* 출장 허브 */
      tripLead: '출장지를 고르면 그 나라 등급에 맞는 일비·숙박 상한·식비가 채워지고, 면세 한도·전압·단위·예약·맛집 링크가 한 번에 정리됩니다.',
      destH: '출장지', rankH: '지급 구분', daysH: '출장 일수', nightsH: '숙박 일수',
      dailyH: '일비 (1일)', hotelCapH: '숙박 상한 (1박)', mealH: '식비 (1일)',
      airH: '항공운임 (원)', groundH: '현지 교통·기타 (원)', rateH: '적용 환율 (원/달러)',
      calcH: '정산 결과', item: '항목', calc: '계산', usd: '달러', krw: '원화 환산',
      rDaily: '일비', rHotel: '숙박비', rMeal: '식비', rAir: '항공운임', rGround: '현지 교통·기타', rTotal: '합계',
      perDayAvg: '1일 평균', copySum: '정산 내역 복사', official: '공무원 여비 규정 별표 4 기준값입니다. 회사 규정이 있으면 그 단가로 고쳐 쓰세요.',
      rank2: '제2호 (일반 직원)', rank1d: '제1호 다목 (1급·소장)', rank1c: '제1호 나목 (차관급)', rank1b: '제1호 가목 (장관급)',
      dutyH: '여행자 면세 한도', dutyNote: '입국하는 나라의 기준입니다. 주류·담배는 별도 한도가 있고, 초과분만 과세됩니다.',
      country: '국가', allowance: '면세 한도', liquor: '주류·담배', source: '출처',
      voltH: '전압·플러그', voltNote: '한국은 220V 60Hz C·F형입니다. 110V 기기는 변압기가 필요합니다.',
      unitH: '단위 변환', unitFrom: '값', unitPick: '변환', unitResult: '결과',
      airLinksH: '항공권 검색', hotelLinksH: '호텔 검색', foodLinksH: '맛집·지도',
      checkH: '출장 준비 체크리스트', tripNote: '예약 링크는 각 사의 검색 첫 화면으로 연결됩니다. 사이트 안에서 날짜와 도시를 넣으면 실제 운임·요금이 나옵니다.',
      /* 포털 */
      portalLead: '미국·중국·일본에 법인이나 거래처를 두고 일할 때 실제로 여는 공식 사이트만 모았습니다. 링크는 2026년 11월 24일에 직접 접속해 확인했습니다.',
      g_company: '사업자·법인 조회', g_customs: '관세·HS·통관', g_cert: '인증·표준', g_stat: '무역 통계',
      verified: '접속 확인', officialLink: '공식 사이트',
      holH: '2027년 선적·은행 휴무일', holNote: '중국은 국무원 공고(2026-11-05), 일본은 내각부·국립천문대, 미국은 OPM, 한국은 우주항공청 월력요항 기준입니다.',
      month: '월', kr: '한국', cn: '중국', jp: '일본', us: '미국',
      shipH: '선적 일정 역산', shipNote: '휴무 기간과 공장 조기 휴무를 감안한 권장 일정입니다. 실제 마감은 포워더·선사에 확인하세요.',
      holBadge: '휴무', peakBadge: '혼잡',
      /* 공통 */
      stepsH: '무료로 확인하는 3단계', stepsLead: '계약 전에 이 순서대로만 봐도 대부분 걸러집니다. 단계마다 5~10분이면 충분합니다.',
      paidH: '정밀 신용조회 (유료)', paidNote: '금액이 큰 첫 거래나 선금을 보낼 때는 무료 조회로 부족합니다. 보고서를 사거나 보험 한도를 먼저 잡으세요.',
      ctipH: '실무 팁', ctyH: '국가별 조회', krOnly: '한국에서 접속', botBlocked: '브라우저에서 열림',
      c_uk: '영국', c_in: '인도', c_vn: '베트남', c_gl: '글로벌',
            tzL: '시간대', curL: '통화', airportL: '공항',
      close: '닫기', more: '자세히', updated: '최종 확인'
    },
    en: {
      langName: 'English',
      tab1: 'Trade email', tab1s: '9 situations · native wording',
      tab2: 'Trip hub', tab2s: 'per diem · duty-free · units',
      tab3: 'Portals & holidays', tab3s: 'registries · customs · shipping',
      mailLead: 'Pick a situation and the recipient’s country, and you get an email in that language written to local business etiquette. Anything you have not filled in stays in brackets.',
      fromH: 'From', toH: 'To',
      fromName: 'Your name', fromCompany: 'Your company', fromTitle: 'Title (optional)',
      toName: 'Their name', toCompany: 'Their company',
      target: 'Recipient country (email language)', situation: 'Situation',
      product: 'Item', qty: 'Quantity', unit: 'Unit', price: 'Unit price', cur: 'Currency',
      incoterm: 'Incoterm', pol: 'Port of loading', pod: 'Port of discharge',
      etd: 'Shipment / delivery date', deadline: 'Reply by', validity: 'Offer valid until',
      invoice: 'Document / invoice no.', amount: 'Amount', spec: 'Specification', note: 'Anything else to add',
      genBtn: 'Write the email', copyBtn: 'Copy body', mailtoBtn: 'Open in mail app', printBtn: 'Print',
      copied: 'Copied', copyFail: 'Copying is blocked here. Select the text and copy it manually.',
      resultH: 'Your email', subject: 'Subject', body: 'Body',
      etiqH: 'Working with this country', tipsH: 'Etiquette & practice',
      blankNote: 'Text in [ ] is a value you have not filled in yet. Enter it and the bracket disappears.',
      mailNote: 'What you send is your responsibility. Nothing is uploaded; the email is assembled in your browser.',
      s_inquiry: 'First inquiry / intro', s_quote_request: 'Request for quotation', s_quote_offer: 'Quotation offer',
      s_negotiation: 'Price negotiation', s_order_confirm: 'Order confirmation / PI', s_shipping_chase: 'Shipment follow-up',
      s_claim: 'Quality or quantity claim', s_payment_reminder: 'Payment reminder', s_thanks: 'Thank you / reorder',
      c_us: 'United States (English)', c_cn: 'China (Chinese)', c_jp: 'Japan (Japanese)', c_kr: 'Korea (Korean)', c_eu: 'Europe & others (English)',
      tripLead: 'Choose a destination and the per-diem, hotel ceiling and meal rates for its grade are filled in, together with duty-free limits, voltage, units, booking and restaurant links.',
      destH: 'Destination', rankH: 'Pay grade', daysH: 'Trip days', nightsH: 'Nights',
      dailyH: 'Per diem (per day)', hotelCapH: 'Hotel ceiling (per night)', mealH: 'Meals (per day)',
      airH: 'Airfare (KRW)', groundH: 'Local transport & other (KRW)', rateH: 'Exchange rate (KRW per USD)',
      calcH: 'Settlement', item: 'Item', calc: 'Calculation', usd: 'USD', krw: 'KRW equivalent',
      rDaily: 'Per diem', rHotel: 'Hotel', rMeal: 'Meals', rAir: 'Airfare', rGround: 'Local transport & other', rTotal: 'Total',
      perDayAvg: 'Average per day', copySum: 'Copy the settlement', official: 'Values follow Table 4 of the Korean public-officials travel rules. Replace them with your company rates where you have them.',
      rank2: 'Grade 2 (general staff)', rank1d: 'Grade 1-D (director)', rank1c: 'Grade 1-C (vice-minister)', rank1b: 'Grade 1-A (minister)',
      dutyH: 'Traveller duty-free allowances', dutyNote: 'Rules of the country you enter. Alcohol and tobacco have separate limits; only the excess is taxed.',
      country: 'Country', allowance: 'Allowance', liquor: 'Alcohol & tobacco', source: 'Source',
      voltH: 'Voltage & plugs', voltNote: 'Korea runs 220V 60Hz with type C and F. Appliances built for 110V need a transformer.',
      unitH: 'Unit converter', unitFrom: 'Value', unitPick: 'Convert', unitResult: 'Result',
      airLinksH: 'Flight search', hotelLinksH: 'Hotel search', foodLinksH: 'Restaurants & maps',
      checkH: 'Trip preparation checklist', tripNote: 'Booking links open each site’s search page. Enter your dates and city there for live fares and rates.',
      portalLead: 'Only the official sites actually used when working with companies in the US, China and Japan. Every link was opened and checked on 24 November 2026.',
      g_company: 'Company & business registries', g_customs: 'Customs, HS & clearance', g_cert: 'Certification & standards', g_stat: 'Trade statistics',
      verified: 'checked', officialLink: 'official site',
      holH: '2027 shipping & bank holidays', holNote: 'Sources: China State Council notice (5 Nov 2026), Japan Cabinet Office and NAOJ, US OPM, Korea Space and Astronomy Agency calendar.',
      month: 'Month', kr: 'Korea', cn: 'China', jp: 'Japan', us: 'US',
      shipH: 'Working back from the holiday', shipNote: 'Suggested schedule that allows for the holiday and early factory closures. Confirm the real cut-off with your forwarder or carrier.',
      holBadge: 'closed', peakBadge: 'peak',
      stepsH: 'Three free checks before you sign', stepsLead: 'Work through these in order and most bad counterparties drop out. Five to ten minutes per step.',
      paidH: 'Paid credit reports', paidNote: 'For a large first order or a deposit, free checks are not enough. Buy a report or secure an insurance limit first.',
      ctipH: 'Field notes', ctyH: 'By country', krOnly: 'Korea access', botBlocked: 'opens in browser',
      c_uk: 'United Kingdom', c_in: 'India', c_vn: 'Vietnam', c_gl: 'Global',
            tzL: 'Time zone', curL: 'Currency', airportL: 'Airport',
      close: 'Close', more: 'Details', updated: 'Checked'
    },
    zh: {
      langName: '中文',
      tab1: '贸易邮件', tab1s: '9 种场景 · 母语措辞',
      tab2: '出差助手', tab2s: '差旅费 · 免税 · 单位',
      tab3: '企业门户·休市', tab3s: '企业查询 · 关税 · 船期',
      mailLead: '选择场景和收件国家，即可生成符合当地商务礼仪的母语邮件。未填写的部分会保留在方括号中。',
      fromH: '发件人', toH: '收件人',
      fromName: '姓名', fromCompany: '公司', fromTitle: '职务（可选）',
      toName: '对方姓名', toCompany: '对方公司',
      target: '对方国家（邮件语言）', situation: '场景',
      product: '品名', qty: '数量', unit: '单位', price: '单价', cur: '币种',
      incoterm: '贸易术语', pol: '装运港', pod: '目的港',
      etd: '装运/交货日期', deadline: '回复期限', validity: '报价有效期',
      invoice: '单据/发票号', amount: '金额', spec: '规格要求', note: '补充说明',
      genBtn: '生成邮件', copyBtn: '复制正文', mailtoBtn: '用邮件应用打开', printBtn: '打印',
      copied: '已复制', copyFail: '浏览器禁止复制，请手动选择正文复制。',
      resultH: '生成的邮件', subject: '主题', body: '正文',
      etiqH: '与这个国家做生意', tipsH: '礼仪与惯例',
      blankNote: '方括号 [ ] 中是尚未填写的值，填写后即消失。',
      mailNote: '发出的邮件由您负责。所有内容只在浏览器内生成，不会上传。',
      s_inquiry: '首次询盘·建立联系', s_quote_request: '询价', s_quote_offer: '报价',
      s_negotiation: '价格谈判', s_order_confirm: '确认订单·形式发票', s_shipping_chase: '催装运',
      s_claim: '质量·数量索赔', s_payment_reminder: '催收货款', s_thanks: '致谢·返单',
      c_us: '美国（英语）', c_cn: '中国（中文）', c_jp: '日本（日语）', c_kr: '韩国（韩语）', c_eu: '欧洲及其他（英语）',
      tripLead: '选择出差城市，即按其等级填入日补、住宿上限与餐费，并一并整理免税额度、电压、单位换算、订票与餐厅链接。',
      destH: '出差地', rankH: '职级区分', daysH: '出差天数', nightsH: '住宿晚数',
      dailyH: '日补（每日）', hotelCapH: '住宿上限（每晚）', mealH: '餐费（每日）',
      airH: '机票（韩元）', groundH: '当地交通及其他（韩元）', rateH: '汇率（韩元/美元）',
      calcH: '结算结果', item: '项目', calc: '计算', usd: '美元', krw: '韩元折算',
      rDaily: '日补', rHotel: '住宿费', rMeal: '餐费', rAir: '机票', rGround: '当地交通及其他', rTotal: '合计',
      perDayAvg: '日均', copySum: '复制结算明细', official: '数值依据韩国《公务员旅费规定》附表4。公司有规定的，请按本公司标准修改。',
      rank2: '第2号（一般职员）', rank1d: '第1号 D（局长级）', rank1c: '第1号 C（次官级）', rank1b: '第1号 A（部长级）',
      dutyH: '旅客免税额度', dutyNote: '按入境国标准。烟酒另有额度，仅对超出部分征税。',
      country: '国家', allowance: '免税额度', liquor: '烟酒', source: '来源',
      voltH: '电压与插头', voltNote: '韩国为 220V 60Hz，C、F 型插头。110V 电器需变压器。',
      unitH: '单位换算', unitFrom: '数值', unitPick: '换算', unitResult: '结果',
      airLinksH: '机票搜索', hotelLinksH: '酒店搜索', foodLinksH: '餐厅·地图',
      checkH: '出差准备清单', tripNote: '订票链接指向各网站搜索首页，在站内输入日期和城市即可看到实际票价。',
      portalLead: '只收录与美、中、日企业往来时真正会打开的官方网站。链接已于 2026 年 11 月 24 日逐一打开确认。',
      g_company: '企业·法人查询', g_customs: '关税·HS·通关', g_cert: '认证·标准', g_stat: '贸易统计',
      verified: '已确认', officialLink: '官方网站',
      holH: '2027 年船期·银行休市', holNote: '来源：中国国务院公告（2026-11-05）、日本内阁府与国立天文台、美国 OPM、韩国宇宙航空厅历书。',
      month: '月', kr: '韩国', cn: '中国', jp: '日本', us: '美国',
      shipH: '船期倒推', shipNote: '考虑休市与工厂提前放假的建议日程。实际截止日请与货代、船公司确认。',
      holBadge: '休市', peakBadge: '高峰',
      stepsH: '签约前的免费三步', stepsLead: '按这个顺序查一遍，大多数风险客户就能筛掉。每步5~10分钟即可。',
      paidH: '付费信用报告', paidNote: '首单金额大或需预付时，免费查询不够。先购买报告或落实保险额度。',
      ctipH: '实务提示', ctyH: '按国家查询', krOnly: '韩国访问', botBlocked: '浏览器可打开',
      c_uk: '英国', c_in: '印度', c_vn: '越南', c_gl: '全球',
            tzL: '时区', curL: '货币', airportL: '机场',
      close: '关闭', more: '详情', updated: '最后确认'
    },
    ja: {
      langName: '日本語',
      tab1: '貿易メール', tab1s: '9場面・現地語の文面',
      tab2: '出張ハブ', tab2s: '日当・免税・単位',
      tab3: '企業ポータル・休業日', tab3s: '登記・関税・船積み',
      mailLead: '場面と相手国のを選ぶと、その国の商習慣に合わせた現地語のメールがすぐできます。未入力の箇所は括弧のまま残ります。',
      fromH: '差出人', toH: '宛先',
      fromName: '氏名', fromCompany: '会社名', fromTitle: '役職（任意）',
      toName: '相手の氏名', toCompany: '相手の会社',
      target: '相手国（メールの言語）', situation: '場面',
      product: '品目', qty: '数量', unit: '単位', price: '単価', cur: '通貨',
      incoterm: 'インコタームズ', pol: '積出港', pod: '仕向港',
      etd: '船積み・納期', deadline: '返信期限', validity: '見積有効期限',
      invoice: '書類・請求書番号', amount: '金額', spec: '仕様・要望', note: '追加で伝えたいこと',
      genBtn: 'メールを作成', copyBtn: '本文をコピー', mailtoBtn: 'メールアプリで開く', printBtn: '印刷',
      copied: 'コピーしました', copyFail: 'コピーがブロックされています。本文を選択して手動でコピーしてください。',
      resultH: '作成されたメール', subject: '件名', body: '本文',
      etiqH: 'この国と仕事をするとき', tipsH: '作法・慣行',
      blankNote: '［ ］内は未入力の項目です。入力すると消えます。',
      mailNote: '送信はご自身の責任で行ってください。入力内容はサーバーに送られず、ブラウザ内だけで生成されます。',
      s_inquiry: '初回問い合わせ・取引提案', s_quote_request: '見積依頼', s_quote_offer: '見積提示',
      s_negotiation: '価格交渉', s_order_confirm: '注文確定・PI送付', s_shipping_chase: '船積み催促',
      s_claim: '品質・数量クレーム', s_payment_reminder: '代金未収のご案内', s_thanks: 'お礼・再注文',
      c_us: 'アメリカ（英語）', c_cn: '中国（中国語）', c_jp: '日本（日本語）', c_kr: '韓国（韓国語）', c_eu: '欧州その他（英語）',
      tripLead: '出張先を選ぶと、その国の等級に応じた日当・宿泊上限・食事代が入り、免税範囲・電圧・単位・予約・飲食店リンクもまとめて整理されます。',
      destH: '出張先', rankH: '支給区分', daysH: '出張日数', nightsH: '宿泊数',
      dailyH: '日当（1日）', hotelCapH: '宿泊上限（1泊）', mealH: '食事代（1日）',
      airH: '航空運賃（ウォン）', groundH: '現地交通・その他（ウォン）', rateH: '適用為替（ウォン/ドル）',
      calcH: '精算結果', item: '項目', calc: '計算', usd: 'ドル', krw: 'ウォン換算',
      rDaily: '日当', rHotel: '宿泊費', rMeal: '食事代', rAir: '航空運賃', rGround: '現地交通・その他', rTotal: '合計',
      perDayAvg: '1日平均', copySum: '精算明細をコピー', official: '韓国「公務員旅費規程」別表4の金額です。社内規程がある場合はその単価に置き換えてください。',
      rank2: '第2号（一般職員）', rank1d: '第1号D（局長級）', rank1c: '第1号C（次官級）', rank1b: '第1号A（大臣級）',
      dutyH: '旅行者の免税範囲', dutyNote: '入国する国の基準です。酒・たばこは別枠で、超過分のみ課税されます。',
      country: '国', allowance: '免税範囲', liquor: '酒・たばこ', source: '出所',
      voltH: '電圧・プラグ', voltNote: '韓国は220V 60Hz、C・F型です。110V機器には変圧器が必要です。',
      unitH: '単位換算', unitFrom: '値', unitPick: '換算', unitResult: '結果',
      airLinksH: '航空券検索', hotelLinksH: 'ホテル検索', foodLinksH: '飲食店・地図',
      checkH: '出張準備チェックリスト', tripNote: '予約リンクは各社の検索トップページです。サイト内で日付と都市を入れると実際の運賃・料金が出ます。',
      portalLead: '米・中・日の企業と仕事をするときに実際に開く公式サイトだけを集めました。リンクは2026年11月24日に実際に開いて確認しています。',
      g_company: '企業・法人登記', g_customs: '関税・HS・通関', g_cert: '認証・標準', g_stat: '貿易統計',
      verified: '接続確認', officialLink: '公式サイト',
      holH: '2027年 船積み・銀行休業日', holNote: '出所：中国国務院公告（2026-11-05）、日本内閣府・国立天文台、米国OPM、韓国宇宙航空庁暦要項。',
      month: '月', kr: '韓国', cn: '中国', jp: '日本', us: '米国',
      shipH: '船積み日程の逆算', shipNote: '休業期間と工場の早期休みを考慮した推奨日程です。実際の締切はフォワーダー・船社にご確認ください。',
      holBadge: '休業', peakBadge: '混雑',
      stepsH: '無料で確認する3ステップ', stepsLead: '契約前にこの順番で見れば、ほとんどは篩にかけられます。各ステップ5〜10分です。',
      paidH: '有料の信用調査', paidNote: '初回の大口取引や前払いの際は無料調査では足りません。レポート購入か保険限度の確保を先に。',
      ctipH: '実務メモ', ctyH: '国別に調べる', krOnly: '韓国から接続', botBlocked: 'ブラウザで開けます',
      c_uk: 'イギリス', c_in: 'インド', c_vn: 'ベトナム', c_gl: 'グローバル',
            tzL: '時間帯', curL: '通貨', airportL: '空港',
      close: '閉じる', more: '詳細', updated: '最終確認'
    }
  };

  /* ---------------------------------------------------------------
     이메일 예절 메모 (상대 국가별 · 화면 언어별)
  --------------------------------------------------------------- */
  D.etiq = {
    us: {
      ko: ['첫 메일에 결론부터 씁니다. 인사·배경 설명은 두 줄이면 충분합니다.', '날짜는 3월 5일 대신 Mar 5, 2027처럼 월·일·연도로 씁니다.', '거절은 짧게, 대안과 함께. “Let us know”로 답변 기한을 분명히 적습니다.'],
      en: ['Lead with the point. Two lines of context are enough.', 'Write dates as Mar 5, 2027, not 5/3.', 'Refuse briefly and offer an alternative; state the reply deadline plainly.'],
      zh: ['先讲结论，背景两行即可。', '日期写成 Mar 5, 2027，避免 5/3 的歧义。', '拒绝要简短并给出替代方案，明确回复期限。'],
      ja: ['結論から書きます。背景説明は2行で十分です。', '日付は Mar 5, 2027 の形式で書きます。', '断る場合も短く、代替案と返信期限を明示します。']
    },
    cn: {
      ko: ['관계가 먼저입니다. 첫 메일에서 회사 소개와 거래 이력을 한 단락 넣으세요.', '정중한 您를 쓰고, 상대를 贵司·贵 company로 높입니다. 직접적 거절보다 “검토해 보겠다”가 통합니다.', '춘절·국경절 전후 2주는 회신이 끊깁니다. 그 전에 확정하고, 위챗으로도 연락처를 남겨 두세요.'],
      en: ['Relationship first: introduce your company and trading history in the first paragraph.', 'Use 您 (formal you) and refer to them as 贵司. A soft “we will review” replaces a blunt no.', 'Replies stop for two weeks around Spring Festival and National Day. Confirm before, and keep a WeChat contact.'],
      zh: ['先建立关系：第一段介绍公司和以往交易。', '用“您”和“贵司”，直接拒绝不如“我们再研究一下”。', '春节、国庆前后两周基本不回复，务必提前确认，并留下微信联系。'],
      ja: ['関係づくりが先です。最初のメールで会社紹介と取引実績を一段落入れます。', '「您」「贵司」を使い、断る場合も「検討します」と柔らかく伝えます。', '春節・国慶節の前後2週間は返信が止まります。その前に確定し、WeChatの連絡先も残します。']
    },
    jp: {
      ko: ['첫 줄은 お世話になっております。로 시작하고, 상대 이름 뒤에는 반드시 様를 붙입니다.', '거절·불가도 “검토하겠습니다(検討いたします)”로 먼저 받고, 조건을 바꿔 다시 제안합니다.', '연말연시(12/29~1/3)와 골든위크는 휴무입니다. 서류 도착일을 그 전으로 잡으세요.'],
      en: ['Open with お世話になっております and always add 様 to their name.', 'A refusal is first met with “we will consider it” (検討いたします), then a revised proposal.', 'Offices close 29 Dec–3 Jan and over Golden Week. Get documents there before those dates.'],
      zh: ['首句用“お世話になっております”，姓名后必须加“様”。', '拒绝也先说“検討いたします”，再改条件重新提案。', '年末年初（12/29～1/3）和黄金周休业，单据需提前送达。'],
      ja: ['書き出しは「お世話になっております」、氏名には必ず「様」を付けます。', '断る場合もまず「検討いたします」と受け、条件を変えて再提案します。', '年末年始（12/29〜1/3）とゴールデンウィークは休業です。書類はその前に届くようにします。']
    },
    kr: {
      ko: ['첫 메일은 회사 소개 한 단락과 요청 한 가지로 끝냅니다.', '상대 직함을 정확히 쓰고(과장·차장·부장), 존댓말로 통일합니다.', '회신이 늦으면 전화 한 통이 메일 열 통보다 빠릅니다. 다만 오전 9시 이전·오후 7시 이후는 피합니다.'],
      en: ['One paragraph of introduction, one clear request.', 'Use the exact Korean title (manager, deputy director) and keep the tone formal.', 'When replies stall, one phone call beats ten emails — but avoid before 9am and after 7pm.'],
      zh: ['第一段介绍公司，只提一个请求。', '准确使用对方职务（课长、次长、部长），全文保持敬语。', '回复慢时，一个电话胜过十封邮件，但避开上午9点前和晚上7点后。'],
      ja: ['最初のメールは会社紹介1段落と依頼1件で終えます。', '相手の役職（課長・次長・部長）を正確に書き、敬語で統一します。', '返信が遅いときは電話1本がメール10通より早いです。ただし9時前・19時以降は避けます。']
    }
  };

  /* ---------------------------------------------------------------
     출장지
  --------------------------------------------------------------- */
  D.dest = [
    { id: 'ny', cty: 'us', grade: 'A', tz: 'GMT−5 (EST)', cur: 'USD', volt: '120V · 60Hz · A / B', air: 'JFK · EWR', city: 'New York',
      name: { ko: '미국 · 뉴욕', en: 'United States · New York', zh: '美国 · 纽约', ja: 'アメリカ・ニューヨーク' },
      trip: { ko: '미드타운 호텔은 1박 $300 이상이 흔합니다. 상한 $176로는 맨해튼 밖 저지시티·롱아일랜드시티를 보세요.', en: 'Midtown hotels often run above $300. On a $176 ceiling, look at Jersey City or Long Island City.', zh: '曼哈顿中城酒店常超过300美元，176美元上限可考虑泽西市或长岛市。', ja: 'ミッドタウンのホテルは1泊300ドル超が普通です。上限176ドルならジャージーシティやロングアイランドシティを。' } },
    { id: 'la', cty: 'us', grade: 'A', tz: 'GMT−8 (PST)', cur: 'USD', volt: '120V · 60Hz · A / B', air: 'LAX', city: 'Los Angeles',
      name: { ko: '미국 · 로스앤젤레스', en: 'United States · Los Angeles', zh: '美国 · 洛杉矶', ja: 'アメリカ・ロサンゼルス' },
      trip: { ko: '차 없이는 이동이 어렵습니다. 렌터카나 우버를 교통비에 미리 넣으세요.', en: 'You need a car here. Budget for a rental or rideshare in local transport.', zh: '没有车很难移动，请预留租车或网约车费用。', ja: '車がないと移動が難しいので、レンタカーか配車の費用を入れておきます。' } },
    { id: 'us-other', cty: 'us', grade: 'B', tz: 'GMT−5~−8', cur: 'USD', volt: '120V · 60Hz · A / B', air: '—', city: 'Chicago',
      name: { ko: '미국 · 그 밖의 도시', en: 'United States · other cities', zh: '美国 · 其他城市', ja: 'アメリカ・その他の都市' },
      trip: { ko: '뉴욕·LA·샌프란시스코·워싱턴 D.C.만 가등급입니다. 나머지 도시는 나등급 상한이 적용됩니다.', en: 'Only New York, LA, San Francisco and Washington DC are grade A; other cities fall under B.', zh: '仅纽约、洛杉矶、旧金山、华盛顿为A级，其余城市适用B级上限。', ja: 'ニューヨーク・LA・サンフランシスコ・ワシントンDCのみA級で、他の都市はB級の上限です。' } },
    { id: 'bj', cty: 'cn', grade: 'B', tz: 'GMT+8', cur: 'CNY', volt: '220V · 50Hz · A / C / I', air: 'PEK · PKX', city: 'Beijing',
      name: { ko: '중국 · 베이징', en: 'China · Beijing', zh: '中国 · 北京', ja: '中国・北京' },
      trip: { ko: '베이징은 나등급, 상하이·광저우·선전은 다등급입니다. 출장 도시에 따라 단가가 달라집니다.', en: 'Beijing is grade B; Shanghai, Guangzhou and Shenzhen are grade C.', zh: '北京为B级，上海、广州、深圳为C级。', ja: '北京はB級、上海・広州・深圳はC級です。' } },
    { id: 'sh', cty: 'cn', grade: 'C', tz: 'GMT+8', cur: 'CNY', volt: '220V · 50Hz · A / C / I', air: 'PVG · SHA', city: 'Shanghai',
      name: { ko: '중국 · 상하이', en: 'China · Shanghai', zh: '中国 · 上海', ja: '中国・上海' },
      trip: { ko: '공장은 대개 시 외곽(쑤저우·쿤산)에 있습니다. 도시 간 이동 시간을 일정에 넣으세요.', en: 'Factories usually sit outside the city (Suzhou, Kunshan). Allow travel time between cities.', zh: '工厂多在苏州、昆山等郊区，请把城际移动时间算进日程。', ja: '工場は蘇州・昆山など郊外が多いので、都市間移動の時間を見込みます。' } },
    { id: 'tyo', cty: 'jp', grade: 'A', tz: 'GMT+9', cur: 'JPY', volt: '100V · 50/60Hz · A / B', air: 'NRT · HND', city: 'Tokyo',
      name: { ko: '일본 · 도쿄', en: 'Japan · Tokyo', zh: '日本 · 东京', ja: '日本・東京' },
      trip: { ko: '도쿄는 가등급, 나머지 일본 도시는 나등급입니다. 100V이므로 한국 220V 기기는 변압기가 필요합니다.', en: 'Tokyo is grade A, other Japanese cities grade B. Mains are 100V, so Korean 220V devices need a transformer.', zh: '东京为A级，其他日本城市为B级。电压100V，韩国220V电器需变压器。', ja: '東京はA級、他の都市はB級です。100Vなので韓国の220V機器には変圧器が必要です。' } },
    { id: 'osa', cty: 'jp', grade: 'B', tz: 'GMT+9', cur: 'JPY', volt: '100V · 60Hz · A / B', air: 'KIX · ITM', city: 'Osaka',
      name: { ko: '일본 · 오사카', en: 'Japan · Osaka', zh: '日本 · 大阪', ja: '日本・大阪' },
      trip: { ko: '간사이공항에서 시내까지 50분 안팎입니다. 공장이 아이치·시가에 있으면 신칸센이 빠릅니다.', en: 'Kansai airport is about 50 minutes from the city; for plants in Aichi or Shiga the shinkansen is quicker.', zh: '关西机场到市区约50分钟，工厂在爱知、滋贺时新干线更快。', ja: '関西空港から市内まで約50分。愛知・滋賀の工場なら新幹線が早いです。' } },
    { id: 'fra', cty: 'eu', grade: 'B', tz: 'GMT+1 (CET)', cur: 'EUR', volt: '230V · 50Hz · C / F', air: 'FRA', city: 'Frankfurt',
      name: { ko: '독일 · 프랑크푸르트', en: 'Germany · Frankfurt', zh: '德国 · 法兰克福', ja: 'ドイツ・フランクフルト' },
      trip: { ko: 'EU 입국은 €430(항공)까지 면세입니다. 독일은 일요일에 상점이 거의 닫습니다.', en: 'The EU allows €430 duty-free by air. Almost all shops close on Sundays in Germany.', zh: '欧盟航空入境免税额度为430欧元。德国周日几乎全部商店休息。', ja: 'EUは航空で430ユーロまで免税。ドイツは日曜にほぼ全ての店が閉まります。' } },
    { id: 'lon', cty: 'eu', grade: 'A', tz: 'GMT', cur: 'GBP', volt: '230V · 50Hz · G', air: 'LHR · LGW', city: 'London',
      name: { ko: '영국 · 런던', en: 'United Kingdom · London', zh: '英国 · 伦敦', ja: 'イギリス・ロンドン' },
      trip: { ko: '플러그가 G형(삼각)입니다. 어댑터를 꼭 챙기세요. 1월 1일은 은행·교통이 모두 쉽니다.', en: 'Plugs are type G (three pins) — bring an adapter. Banks and transport close on 1 Jan.', zh: '插头为G型三脚，请带转换插头。1月1日银行与交通停运。', ja: 'プラグはG型（3本足）です。アダプターを必ず。1月1日は銀行も交通も止まります。' } },
    { id: 'sin', cty: 'eu', grade: 'A', tz: 'GMT+8', cur: 'SGD', volt: '230V · 50Hz · G', air: 'SIN', city: 'Singapore',
      name: { ko: '싱가포르', en: 'Singapore', zh: '新加坡', ja: 'シンガポール' },
      trip: { ko: '홍콩과 함께 가등급입니다. 통관이 엄격해 식품 반입은 거의 안 됩니다.', en: 'Grade A along with Hong Kong. Customs is strict; almost no food may be brought in.', zh: '与香港同为A级。通关严格，几乎禁止携带食品入境。', ja: '香港と同じくA級。通関が厳しく、食品の持ち込みはほぼ不可です。' } },
    { id: 'hcm', cty: 'eu', grade: 'D', tz: 'GMT+7', cur: 'VND', volt: '220V · 50Hz · A / C', air: 'SGN', city: 'Ho Chi Minh City',
      name: { ko: '베트남 · 호찌민', en: 'Vietnam · Ho Chi Minh City', zh: '越南 · 胡志明市', ja: 'ベトナム・ホーチミン' },
      trip: { ko: '라등급입니다. 대도시인데도 숙박 상한이 낮아 4성급 예약이 빠듯할 수 있습니다.', en: 'Grade D. The hotel ceiling is low even for a big city, so a 4-star booking may not fit.', zh: 'D级，即使是大城市住宿上限也偏低，四星酒店可能超出。', ja: 'D級です。大都市でも宿泊上限が低く、4つ星は収まらないことがあります。' } },
    { id: 'dxb', cty: 'eu', grade: 'B', tz: 'GMT+4', cur: 'AED', volt: '230V · 50Hz · G', air: 'DXB', city: 'Dubai',
      name: { ko: '아랍에미리트 · 두바이', en: 'UAE · Dubai', zh: '阿联酋 · 迪拜', ja: 'UAE・ドバイ' },
      trip: { ko: '금요·토요가 주말입니다. 일요일이 첫 근무일이라는 점을 일정에 반영하세요.', en: 'The weekend is Friday–Saturday; Sunday is a working day.', zh: '周末为周五、周六，周日是第一个工作日。', ja: '週末は金・土で、日曜が最初の営業日です。' } }
  ];

  /* ---------------------------------------------------------------
     일비·숙박·식비 (공무원 여비 규정 별표 4, 미 달러)
  --------------------------------------------------------------- */
  D.perdiem = {
    // 등급별 [일비, 숙박 상한, 식비] × 지급구분
    A: { g2: [30, 176, 81], g1d: [40, 282, 133], g1c: [50, 389, 160], g1b: [60, 471, 186] },
    B: { g2: [30, 137, 59], g1d: [40, 207, 99], g1c: [50, 289, 117], g1b: [60, 422, 136] },
    C: { g2: [30, 106, 44], g1d: [40, 162, 72], g1c: [50, 215, 87], g1b: [60, 271, 102] },
    D: { g2: [30, 81, 37], g1d: [35, 130, 58], g1c: [50, 161, 73], g1b: [60, 216, 85] },
    src: 'https://www.law.go.kr/%EB%B2%95%EB%A0%B9/%EA%B3%B5%EB%AC%B4%EC%9B%90%EC%97%AC%EB%B9%84%EA%B7%9C%EC%A0%95'
  };

  /* ---------------------------------------------------------------
     여행자 면세 한도
  --------------------------------------------------------------- */
  D.duty = [
    { code: 'KR', name: { ko: '한국', en: 'Korea', zh: '韩国', ja: '韓国' }, amount: 'US$800',
      liquor: { ko: '주류 2L·$400 이하, 담배 200개비, 향수 100ml', en: '2L spirits (≤$400), 200 cigarettes, 100ml perfume', zh: '酒2L（≤400美元）、烟200支、香水100ml', ja: '酒2L（400ドル以下）、たばこ200本、香水100ml' },
      src: 'https://www.customs.go.kr/kcs/cm/cntnts/cntntsView.do?cntntsId=829&mi=2837' },
    { code: 'US', name: { ko: '미국', en: 'United States', zh: '美国', ja: 'アメリカ' }, amount: 'US$800',
      liquor: { ko: '주류 1L, 담배 200개비·시가 100개. 48시간 이상 체류·30일 1회 조건', en: '1L alcohol, 200 cigarettes, 100 cigars; 48-hour stay and once per 30 days', zh: '酒1L、烟200支、雪茄100支；需停留48小时以上且30天一次', ja: '酒1L、たばこ200本・葉巻100本。48時間以上滞在・30日に1回' },
      src: 'https://www.ecfr.gov/current/title-19/chapter-I/part-148/subpart-D/section-148.33' },
    { code: 'CN', name: { ko: '중국', en: 'China', zh: '中国', ja: '中国' }, amount: '¥5,000',
      liquor: { ko: '주류 1.5L, 담배 400개비. 홍콩·마카오발은 ¥12,000', en: '1.5L alcohol, 400 cigarettes; ¥12,000 from Hong Kong/Macau', zh: '酒1.5L、烟400支；港澳入境为12,000元', ja: '酒1.5L、たばこ400本。香港・マカオ発は12,000元' },
      src: 'https://www.gov.cn/zhengce/zhengceku/202411/P020241129805840429474.pdf' },
    { code: 'JP', name: { ko: '일본', en: 'Japan', zh: '日本', ja: '日本' }, amount: '¥200,000',
      liquor: { ko: '주류 3병(760ml), 담배 200개비, 향수 2oz. 1만엔 이하 물품은 합산 제외', en: '3 bottles (760ml), 200 cigarettes, 2oz perfume; items under ¥10,000 excluded', zh: '酒3瓶（760ml）、烟200支、香水2oz；1万日元以下不计入', ja: '酒3本（760ml）、たばこ200本、香水2oz。1万円以下は合算外' },
      src: 'https://www.customs.go.jp/english/c-answer_e/keitaibetsuso/7105_e.htm' },
    { code: 'EU', name: { ko: '유럽연합', en: 'European Union', zh: '欧盟', ja: 'EU' }, amount: '€430 / €300',
      liquor: { ko: '항공·해상 €430, 육로 €300, 15세 미만 €150. 주류 1L(22도 초과)+와인 4L', en: '€430 by air/sea, €300 otherwise, €150 under 15; 1L spirits + 4L wine', zh: '航空/海运430欧元、其他300欧元、15岁以下150欧元；烈酒1L+葡萄酒4L', ja: '航空・海路430ユーロ、その他300ユーロ、15歳未満150ユーロ。蒸留酒1L＋ワイン4L' },
      src: 'https://europa.eu/youreurope/citizens/travel/carry/alcohol-tobacco-cash/index_en.htm' }
  ];

  /* ---------------------------------------------------------------
     단위 변환
  --------------------------------------------------------------- */
  D.units = [
    { id: 'in-cm', a: 'in', b: 'cm', k: 2.54, label: { ko: '인치 → 센티미터', en: 'inch → cm', zh: '英寸 → 厘米', ja: 'インチ → cm' } },
    { id: 'cm-in', a: 'cm', b: 'in', k: 1 / 2.54, label: { ko: '센티미터 → 인치', en: 'cm → inch', zh: '厘米 → 英寸', ja: 'cm → インチ' } },
    { id: 'ft-m', a: 'ft', b: 'm', k: 0.3048, label: { ko: '피트 → 미터', en: 'foot → m', zh: '英尺 → 米', ja: 'フィート → m' } },
    { id: 'm2-ft2', a: 'm²', b: 'ft²', k: 10.7639, label: { ko: '제곱미터 → 제곱피트', en: 'm² → ft²', zh: '平方米 → 平方英尺', ja: 'm² → ft²' } },
    { id: 'lb-kg', a: 'lb', b: 'kg', k: 0.45359237, label: { ko: '파운드 → 킬로그램', en: 'pound → kg', zh: '磅 → 千克', ja: 'ポンド → kg' } },
    { id: 'kg-lb', a: 'kg', b: 'lb', k: 1 / 0.45359237, label: { ko: '킬로그램 → 파운드', en: 'kg → pound', zh: '千克 → 磅', ja: 'kg → ポンド' } },
    { id: 'oz-g', a: 'oz', b: 'g', k: 28.3495, label: { ko: '온스 → 그램', en: 'ounce → g', zh: '盎司 → 克', ja: 'オンス → g' } },
    { id: 'gal-l', a: 'gal(US)', b: 'L', k: 3.785411784, label: { ko: '갤런(미) → 리터', en: 'US gallon → L', zh: '美制加仑 → 升', ja: 'ガロン(米) → L' } },
    { id: 'floz-ml', a: 'fl oz', b: 'ml', k: 29.5735, label: { ko: '플루이드온스 → 밀리리터', en: 'fl oz → ml', zh: '液体盎司 → 毫升', ja: 'fl oz → ml' } },
    { id: 'mi-km', a: 'mile', b: 'km', k: 1.609344, label: { ko: '마일 → 킬로미터', en: 'mile → km', zh: '英里 → 公里', ja: 'マイル → km' } },
    { id: 'psi-bar', a: 'psi', b: 'bar', k: 0.0689476, label: { ko: 'PSI → 바', en: 'psi → bar', zh: 'PSI → 巴', ja: 'psi → bar' } },
    { id: 'f-c', a: '°F', b: '°C', k: 1, t: 'f2c', label: { ko: '화씨 → 섭씨', en: '°F → °C', zh: '华氏 → 摄氏', ja: '°F → °C' } },
    { id: 'c-f', a: '°C', b: '°F', k: 1, t: 'c2f', label: { ko: '섭씨 → 화씨', en: '°C → °F', zh: '摄氏 → 华氏', ja: '°C → °F' } },
    { id: 'py-m2', a: '평', b: 'm²', k: 3.305785, label: { ko: '평 → 제곱미터', en: 'pyeong → m²', zh: '坪 → 平方米', ja: '坪 → m²' } }
  ];

  /* ---------------------------------------------------------------
     기업 검증 포털 — 7개국 + 글로벌 (2026-11-24 접속 확인)
     chk: ok = 실제 접속 200 · bot = 자동 접속 차단(브라우저 정상)
          kr = 해당 국가에서만 접속되는 사이트
  --------------------------------------------------------------- */
  D.pcount = [
    /* 한국 */
    { g: 'company', cty: 'kr', code: 'KR', url: 'https://www.hometax.go.kr', chk: 'ok',
      name: { ko: '국세청 홈택스 — 사업자등록 상태확인', en: 'Korea NTS Hometax — business registration status', zh: '韩国国税厅 Hometax — 营业执照状态查询', ja: '韓国国税庁 Hometax — 事業者登録状態照会' },
      desc: { ko: '무료: 계속·휴업·폐업 여부, 과세유형, 세금계산서 발급 이력. 한계: 재무·신용 정보는 없습니다.', en: 'Free: active/closed status, tax type, invoice history. Limit: no financials or credit data.', zh: '免费：营业/停业/歇业状态、课税类型、发票开具记录。局限：无财务与信用信息。', ja: '無料：継続・休業・廃業の別、課税区分、請求書発行履歴。限界：財務・信用情報はありません。' } },
    { g: 'company', cty: 'kr', code: 'KR', url: 'https://dart.fss.or.kr', chk: 'ok',
      name: { ko: '금감원 전자공시 DART', en: 'Korea DART electronic disclosures', zh: '韩国金融监督院电子公示 DART', ja: '韓国金融監督院 電子公示 DART' },
      desc: { ko: '무료: 감사보고서·재무제표·최대주주·소송·담보 제공 내역. 한계: 외감 대상이 아닌 소기업은 공시가 없습니다.', en: 'Free: audit reports, financials, largest shareholder, litigation, collateral. Limit: small firms outside audit scope file nothing.', zh: '免费：审计报告、财务报表、最大股东、诉讼、担保。局限：非外部审计的小企业无公示。', ja: '無料：監査報告書・財務諸表・筆頭株主・訴訟・担保。限界：外部監査対象外の中小企業は開示がありません。' } },
    { g: 'company', cty: 'kr', code: 'KR', url: 'https://www.nicebizinfo.com', chk: 'ok',
      name: { ko: 'NICE 비즈인포 (기업정보)', en: 'NICE Bizinfo — company profile', zh: 'NICE Bizinfo — 企业信息', ja: 'NICE Bizinfo — 企業情報' },
      desc: { ko: '무료: 기업개요·신용등급 요약·재무요약·휴폐업. 한계: 상세 보고서와 등급 근거는 유료입니다.', en: 'Free: overview, credit grade summary, financial summary, status. Limit: detailed reports are paid.', zh: '免费：企业概况、信用等级摘要、财务摘要、停歇业。局限：详细报告与评级依据收费。', ja: '無料：企業概要・信用格付の要約・財務要約・休廃業。限界：詳細レポートは有料です。' } },
    { g: 'company', cty: 'kr', code: 'KR', url: 'https://biz.credit4u.co.kr', chk: 'kr',
      name: { ko: '한국신용정보원 기업정보', en: 'Korea Credit Information Services — company data', zh: '韩国信用情报院 — 企业信息', ja: '韓国信用情報院 — 企業情報' },
      desc: { ko: '무료(회원): 기업 기본정보·재무·신용 요약. 한계: 회원가입과 본인인증이 필요합니다.', en: 'Free with membership: company basics, financials, credit summary. Limit: sign-up and identity verification required.', zh: '免费（会员）：企业基本信息、财务、信用摘要。局限：需注册并实名认证。', ja: '無料（会員）：企業基本情報・財務・信用要約。限界：会員登録と本人認証が必要です。' } },
    { g: 'company', cty: 'kr', code: 'KR', url: 'https://www.iros.go.kr', chk: 'ok',
      name: { ko: '인터넷등기소 — 법인 등기부', en: 'Korea IROS — corporate register', zh: '韩国互联网登记所 — 法人登记簿', ja: '韓国インターネット登記所 — 法人登記' },
      desc: { ko: '무료: 등기사항 열람(대표자·자본금·본점). 한계: 증명서 발급은 수수료가 있습니다.', en: 'Free: registry view (directors, capital, address). Limit: certificates carry a fee.', zh: '免费：查阅登记事项（代表人、资本金、总部）。局限：证明书发放收费。', ja: '無料：登記事項の閲覧（代表者・資本金・本店）。限界：証明書交付は手数料がかかります。' } },

    /* 미국 */
    { g: 'company', cty: 'us', code: 'US', url: 'https://www.sec.gov/edgar/searchedgar/companysearch', chk: 'bot',
      name: { ko: 'SEC EDGAR — 상장사 공시', en: 'SEC EDGAR — listed-company filings', zh: 'SEC EDGAR — 上市公司披露', ja: 'SEC EDGAR — 上場企業の開示' },
      desc: { ko: '무료: 10-K·10-Q·8-K로 매출·고객·소송·공급망 확인. 한계: 비상장사는 없습니다.', en: 'Free: 10-K, 10-Q, 8-K for revenue, customers, litigation, supply chain. Limit: private companies are absent.', zh: '免费：通过10-K、10-Q、8-K确认营收、客户、诉讼、供应链。局限：非上市公司无记录。', ja: '無料：10-K・10-Q・8-Kで売上・顧客・訴訟・供給網。限界：非上場企業はありません。' } },
    { g: 'company', cty: 'us', code: 'US', url: 'https://icis.corp.delaware.gov/ecorp/entitysearch/namesearch.aspx', chk: 'ok',
      name: { ko: '델라웨어주 법인 조회', en: 'Delaware Division of Corporations search', zh: '特拉华州企业查询', ja: 'デラウェア州法人検索' },
      desc: { ko: '무료: 설립일·존속 상태·등록 대리인. 한계: 재무 정보는 없습니다.', en: 'Free: incorporation date, status, registered agent. Limit: no financials.', zh: '免费：成立日期、存续状态、注册代理。局限：无财务信息。', ja: '無料：設立日・存続状態・登録代理人。限界：財務情報はありません。' } },
    { g: 'company', cty: 'us', code: 'US', url: 'https://bizfileonline.sos.ca.gov/search/business', chk: 'ok',
      name: { ko: '캘리포니아주 법인 조회 (bizfile)', en: 'California SOS business search (bizfile)', zh: '加州务卿企业查询（bizfile）', ja: 'カリフォルニア州法人検索（bizfile）' },
      desc: { ko: '무료: CA 등록 법인의 상태·대표·주소. 한계: 주마다 사이트가 따로 있습니다.', en: 'Free: status, agent, address for California entities. Limit: every state has its own registry.', zh: '免费：加州企业的状态、代表、地址。局限：各州登记系统各自独立。', ja: '無料：カリフォルニア登記法人の状態・代表・住所。限界：州ごとにシステムが異なります。' } },
    { g: 'company', cty: 'us', code: 'US', url: 'https://sam.gov', chk: 'ok',
      name: { ko: 'SAM.gov — 연방 조달 업체 등록', en: 'SAM.gov — federal supplier registry', zh: 'SAM.gov — 联邦供应商登记', ja: 'SAM.gov — 連邦調達の業者登録' },
      desc: { ko: '무료: 미 정부·군납 거래처의 등록 여부와 제재 이력. 한계: 상업 거래처는 등록돼 있지 않을 수 있습니다.', en: 'Free: whether a US government supplier is registered and excluded. Limit: purely commercial firms may not appear.', zh: '免费：美国政府采购供应商的登记与排除记录。局限：纯商业客户可能未登记。', ja: '無料：米政府・防衛納入先の登録と排除措置の有無。限界：民間のみの取引先は未登録のことがあります。' } },

    /* 중국 */
    { g: 'company', cty: 'cn', code: 'CN', url: 'https://www.gsxt.gov.cn', chk: 'bot',
      name: { ko: '국가기업신용정보공시시스템 (gsxt)', en: 'China enterprise credit system (gsxt)', zh: '国家企业信用信息公示系统', ja: '中国 国家企業信用情報公示システム' },
      desc: { ko: '무료: 등록정보·연차보고·행정처벌·경영이상 명단. 한계: 재무제표는 없고 중국어·캡차가 있습니다.', en: 'Free: registration, annual reports, penalties, abnormal-operation list. Limit: no financials; Chinese only with a captcha.', zh: '免费：登记信息、年报、行政处罚、经营异常名录。局限：无财务报表，中文界面并有验证码。', ja: '無料：登記情報・年次報告・行政処分・経営異常リスト。限界：財務諸表はなく、中国語とキャプチャがあります。' } },
    { g: 'company', cty: 'cn', code: 'CN', url: 'https://www.creditchina.gov.cn', chk: 'bot',
      name: { ko: '신용중국 (creditchina)', en: 'Credit China', zh: '信用中国', ja: 'クレジット中国（creditchina）' },
      desc: { ko: '무료: 세금 체납·집행 불이행·행정처벌 기록. 한계: 기업 재무는 다루지 않습니다.', en: 'Free: tax arrears, enforcement failures, administrative penalties. Limit: no financial data.', zh: '免费：欠税、失信被执行、行政处罚记录。局限：不含企业财务。', ja: '無料：滞納税・執行不履行・行政処分の記録。限界：企業財務は扱いません。' } },

    /* 영국 */
    { g: 'company', cty: 'uk', code: 'UK', url: 'https://find-and-update.company-information.service.gov.uk', chk: 'ok',
      name: { ko: '영국 Companies House', en: 'UK Companies House', zh: '英国 Companies House', ja: '英国 Companies House' },
      desc: { ko: '무료: 등록 상태·임원·연차 계정·담보·청산 이력. 한계: 소기업 계정은 축약본만 공개됩니다.', en: 'Free: status, officers, annual accounts, charges, insolvency history. Limit: small companies file abridged accounts only.', zh: '免费：登记状态、董事、年度账目、抵押、清算记录。局限：小企业仅公开简式账目。', ja: '無料：登記状態・役員・年次計算書類・担保・清算履歴。限界：小規模企業は簡易版のみ公開されます。' } },

    /* 일본 */
    { g: 'company', cty: 'jp', code: 'JP', url: 'https://www.houjin-bangou.nta.go.jp', chk: 'ok',
      name: { ko: '국세청 법인번호 공표 사이트', en: 'Japan NTA corporate number publication', zh: '日本国税厅法人编号公示', ja: '国税庁 法人番号公表サイト' },
      desc: { ko: '무료: 법인번호·본점 주소·영문 상호. 한계: 재무·신용 정보는 없습니다.', en: 'Free: corporate number, head office, English name. Limit: no financial or credit data.', zh: '免费：法人编号、总部地址、英文名称。局限：无财务与信用信息。', ja: '無料：法人番号・本店所在地・英文商号。限界：財務・信用情報はありません。' } },
    { g: 'company', cty: 'jp', code: 'JP', url: 'https://info.gbiz.go.jp', chk: 'ok',
      name: { ko: '경제산업성 gBizINFO', en: 'Japan METI gBizINFO', zh: '日本经济产业省 gBizINFO', ja: '経済産業省 gBizINFO' },
      desc: { ko: '무료: 법인 기본정보·재무·보조금·인허가·노동 이력. 한계: 일부 항목은 미등록입니다.', en: 'Free: company basics, financials, subsidies, licences, labour records. Limit: some fields are not registered.', zh: '免费：企业基本信息、财务、补贴、许可、劳动记录。局限：部分项目未登记。', ja: '無料：法人基本情報・財務・補助金・許認可・労働情報。限界：一部項目は未登録です。' } },
    { g: 'company', cty: 'jp', code: 'JP', url: 'https://disclosure2.edinet-fsa.go.jp', chk: 'ok',
      name: { ko: '금융청 EDINET — 유가증권 보고서', en: 'Japan FSA EDINET — securities filings', zh: '日本金融厅 EDINET — 证券报告', ja: '金融庁 EDINET — 有価証券報告書' },
      desc: { ko: '무료: 상장사 유가증권보고서·반기보고서 원문. 한계: 비상장사는 대상이 아닙니다.', en: 'Free: annual and semi-annual reports of listed firms. Limit: unlisted companies are not covered.', zh: '免费：上市公司年报、半年报原文。局限：不覆盖非上市公司。', ja: '無料：上場企業の有価証券報告書・半期報告書の原文。限界：非上場企業は対象外です。' } },

    /* 인도 */
    { g: 'company', cty: 'in', code: 'IN', url: 'https://www.mca.gov.in', chk: 'bot',
      name: { ko: '인도 기업부 MCA — 회사 조회', en: 'India MCA — company search', zh: '印度企业部 MCA — 公司查询', ja: 'インド企業省 MCA — 会社検索' },
      desc: { ko: '무료: Active/Strike Off 상태, CIN, 설립일, 임원. 한계: 재무는 첨부 서류를 따로 받아야 합니다.', en: 'Free: active/strike-off status, CIN, incorporation date, directors. Limit: financials come as separate filings.', zh: '免费：Active/Strike Off 状态、CIN、成立日期、董事。局限：财务需另行查阅附件。', ja: '無料：Active/Strike Off の状態、CIN、設立日、役員。限界：財務は別途添付書類で確認します。' } },
    { g: 'company', cty: 'in', code: 'IN', url: 'https://www.dgft.gov.in', chk: 'ok',
      name: { ko: '인도 대외무역총국 DGFT — IEC·DEL', en: 'India DGFT — IEC and DEL', zh: '印度外贸总局 DGFT — IEC 与 DEL', ja: 'インド对外贸易総局 DGFT — IEC・DEL' },
      desc: { ko: '무료: 수출입자코드(IEC) 유효성, 제재·거래제한 명단(DEL) 조회. 한계: 일부 조회는 회원가입이 필요합니다.', en: 'Free: importer-exporter code validity and the denied-entity list. Limit: some lookups need registration.', zh: '免费：进出口商代码（IEC）有效性、受限实体名单（DEL）。局限：部分查询需注册。', ja: '無料：輸出入者コード（IEC）の有効性と取引制限リスト（DEL）。限界：一部は登録が必要です。' } },
    { g: 'company', cty: 'in', code: 'IN', url: 'https://www.gst.gov.in', chk: 'ok',
      name: { ko: '인도 GST — 사업자·납부 상태', en: 'India GST — registration and filing status', zh: '印度 GST — 登记与申报状态', ja: 'インド GST — 登録・申告状況' },
      desc: { ko: '무료: 15자리 GSTIN 유효성, 신고·납부 이력. 한계: 캡차 입력이 필요합니다.', en: 'Free: 15-digit GSTIN validity, return and payment history. Limit: a captcha is required.', zh: '免费：15位 GSTIN 有效性、申报与缴纳记录。局限：需输入验证码。', ja: '無料：15桁GSTINの有効性、申告・納付履歴。限界：キャプチャ入力が必要です。' } },

    /* 베트남 */
    { g: 'company', cty: 'vn', code: 'VN', url: 'https://dangkykinhdoanh.gov.vn', chk: 'ok',
      name: { ko: '베트남 국가기업등록포털', en: 'Vietnam national business registration portal', zh: '越南国家企业登记门户', ja: 'ベトナム 国家企業登録ポータル' },
      desc: { ko: '무료: 기업등록증 정보·상태·업종. 한계: 베트남어 중심이고 재무는 없습니다.', en: 'Free: registration certificate data, status, business lines. Limit: Vietnamese only, no financials.', zh: '免费：企业登记证信息、状态、行业。局限：以越南语为主，无财务信息。', ja: '無料：企業登録証の情報・状態・業種。限界：ベトナム語中心で財務はありません。' } },
    { g: 'company', cty: 'vn', code: 'VN', url: 'https://tracuunnt.gdt.gov.vn/tcnnt/mstdn.jsp', chk: 'ok',
      name: { ko: '베트남 세무총국 — 세금코드 조회', en: 'Vietnam tax authority — tax code lookup', zh: '越南税务局 — 税号查询', ja: 'ベトナム税務総局 — 税コード照会' },
      desc: { ko: '무료: 세금코드(MST) 유효성과 등록 주소·상태. 한계: 캡차가 있고 베트남어만 지원합니다.', en: 'Free: tax code validity, registered address and status. Limit: captcha, Vietnamese only.', zh: '免费：税号（MST）有效性、登记地址与状态。局限：有验证码，仅越南语。', ja: '無料：税コード（MST）の有効性、登録住所・状態。限界：キャプチャがあり、ベトナム語のみです。' } },

    /* 글로벌 */
    { g: 'company', cty: 'gl', code: 'GL', url: 'https://opencorporates.com', chk: 'ok',
      name: { ko: '오픈코퍼레이트 — 145개국 법인', en: 'OpenCorporates — 145 jurisdictions', zh: 'OpenCorporates — 145 个国家', ja: 'OpenCorporates — 145 か国' },
      desc: { ko: '무료: 여러 나라 등록번호·상태·임원을 한 화면에서 대조. 한계: 재무·신용은 없고 최신성은 나라마다 다릅니다.', en: 'Free: registration numbers, status and officers across countries. Limit: no financials, and freshness varies by country.', zh: '免费：一次比对多国注册号、状态与董事。局限：无财务信用，更新速度因国而异。', ja: '無料：複数国の登録番号・状態・役員を一度に照合。限界：財務・信用はなく、更新頻度は国により異なります。' } },
    { g: 'company', cty: 'gl', code: 'GL', url: 'https://www.importyeti.com', chk: 'ok',
      name: { ko: 'ImportYeti — 미국·멕시코 선적 이력', en: 'ImportYeti — US and Mexico shipment records', zh: 'ImportYeti — 美国·墨西哥货运记录', ja: 'ImportYeti — 米国・メキシコの船積み記録' },
      desc: { ko: '무료: 세관 B/L로 수입자·공급자·품목·물량 이력 확인. 한계: 공개된 B/L 범위만, 금액은 없습니다.', en: 'Free: importer, supplier, product and volume history from customs B/Ls. Limit: only public B/Ls, no values.', zh: '免费：通过海关提单查看进口商、供应商、品名与数量。局限：仅公开提单，无金额。', ja: '無料：税関B/Lから輸入者・供給者・品目・数量の履歴を確認。限界：公開B/Lのみで金額はありません。' } }
  ];

  /* 관세·인증·통계 포털 */
  D.portals = [
    { g: 'customs', code: 'KR', url: 'https://www.customs.go.kr', chk: 'ok',
      name: { ko: '관세청', en: 'Korea Customs Service', zh: '韩国关税厅', ja: '韓国関税庁' },
      desc: { ko: '통관 절차·법령·고시를 확인하는 본청 사이트입니다.', en: 'Clearance procedures, law and notices.', zh: '通关流程、法规与公告。', ja: '通関手続・法令・告示の本庁サイトです。' } },
    { g: 'customs', code: 'KR', url: 'https://unipass.customs.go.kr', chk: 'ok',
      name: { ko: '유니패스 — 수입신고·관세율·HS', en: 'UNIPASS — declaration, tariff, HS', zh: 'UNIPASS — 进口申报、关税、HS', ja: 'UNIPASS — 輸入申告・関税率・HS' },
      desc: { ko: 'HS코드별 관세율과 수입요건을 무료로 조회합니다.', en: 'Free tariff rates and import requirements by HS code.', zh: '免费查询各HS编码的关税与进口要求。', ja: 'HSコード別の関税率と輸入要件を無料で照会できます。' } },
    { g: 'customs', code: 'KR', url: 'https://tradedata.go.kr', chk: 'ok',
      name: { ko: '수출입무역통계 (관세청)', en: 'Korea trade statistics (Customs)', zh: '进出口贸易统计（关税厅）', ja: '輸出入貿易統計（関税庁）' },
      desc: { ko: '품목·국가별 수출입 실적을 월 단위로 봅니다.', en: 'Monthly imports and exports by item and country.', zh: '按品目、国家查看月度进出口数据。', ja: '品目・国別の輸出入実績を月単位で確認できます。' } },
    { g: 'customs', code: 'US', url: 'https://hts.usitc.gov', chk: 'ok',
      name: { ko: 'USITC 관세율표 (HTS)', en: 'USITC Harmonized Tariff Schedule', zh: 'USITC 关税表（HTS）', ja: 'USITC 関税率表（HTS）' },
      desc: { ko: '미국 수입 HS 10단위 세율과 쿼터를 확인합니다.', en: 'US 10-digit duty rates and quotas.', zh: '美国10位HS税则与配额。', ja: '米国の10桁HS税率と割当を確認します。' } },
    { g: 'customs', code: 'EU', url: 'https://taxation-customs.ec.europa.eu/customs-4/calculation-customs-duties/customs-tariff/eu-customs-tariff-taric_en', chk: 'ok',
      name: { ko: 'EU TARIC 관세 조회', en: 'EU TARIC tariff database', zh: '欧盟 TARIC 关税数据库', ja: 'EU TARIC 関税率データベース' },
      desc: { ko: 'EU 회원국 공통 세율·반덤핑·수입규제를 확인합니다.', en: 'EU-wide duty, anti-dumping and import measures.', zh: '欧盟统一税率、反倾销与进口措施。', ja: 'EU共通の関税率・反ダンピング・輸入規制を確認します。' } },
    { g: 'customs', code: 'JP', url: 'https://www.customs.go.jp', chk: 'ok',
      name: { ko: '일본 세관 — 관세율·통관', en: 'Japan Customs — tariff and procedures', zh: '日本海关 — 关税与通关', ja: '日本税関 — 関税率・通関' },
      desc: { ko: '실행관세율표와 원산지·특혜세율 안내가 있습니다.', en: 'Applied tariff schedule and preferential rates.', zh: '适用关税表与原产地优惠税率。', ja: '実行関税率表と原産地・特恵税率の案内があります。' } },
    { g: 'customs', code: 'CN', url: 'http://www.customs.gov.cn', chk: 'ok',
      name: { ko: '중국 해관총서', en: 'General Administration of Customs of China', zh: '中国海关总署', ja: '中国 税関総署' },
      desc: { ko: '중국 수입 규정·공고·통관 통계를 봅니다.', en: 'Chinese import rules, notices and clearance statistics.', zh: '中国进口规定、公告与通关统计。', ja: '中国の輸入規制・公告・通関統計を確認します。' } },
    { g: 'customs', code: 'GL', url: 'https://www.wcoomd.org/en/topics/nomenclature/overview.aspx', chk: 'ok',
      name: { ko: 'WCO HS 품목분류', en: 'WCO HS nomenclature', zh: 'WCO HS 商品分类', ja: 'WCO HS 品目分類' },
      desc: { ko: 'HS 6단위 국제 공통 분류의 원문입니다.', en: 'The international 6-digit HS classification itself.', zh: 'HS 六位国际通用分类原文。', ja: 'HS6桁の国際共通分類そのものです。' } },
    { g: 'customs', code: 'GL', url: 'https://comtradeplus.un.org', chk: 'ok',
      name: { ko: 'UN Comtrade — 세계 무역 통계', en: 'UN Comtrade — world trade data', zh: 'UN Comtrade — 世界贸易数据', ja: 'UN Comtrade — 世界貿易統計' },
      desc: { ko: '국가·품목별 수입국 단가와 물량을 비교합니다.', en: 'Compare import prices and volumes by country and item.', zh: '比较各国各品目的进口单价与数量。', ja: '国・品目別の輸入単価と数量を比較できます。' } },

    { g: 'cert', code: 'US', url: 'https://www.fda.gov', chk: 'ok',
      name: { ko: '미국 FDA', en: 'US FDA', zh: '美国 FDA', ja: '米国 FDA' },
      desc: { ko: '식품·의약품·의료기기 수입 등록과 규정을 확인합니다.', en: 'Import registration and rules for food, drugs, devices.', zh: '食品、药品、医疗器械的进口注册与规定。', ja: '食品・医薬品・医療機器の輸入登録と規則を確認します。' } },
    { g: 'cert', code: 'EU', url: 'https://echa.europa.eu', chk: 'ok',
      name: { ko: 'ECHA — EU 화학물질 (REACH)', en: 'ECHA — EU chemicals (REACH)', zh: 'ECHA — 欧盟化学品（REACH）', ja: 'ECHA — EU化学物質（REACH）' },
      desc: { ko: '재생원료·첨가제의 REACH 등록과 SVHC 목록을 확인합니다.', en: 'REACH registration and the SVHC list for recycled materials.', zh: '再生原料与添加剂的REACH注册及SVHC清单。', ja: '再生原料・添加剤のREACH登録とSVHCリストを確認します。' } },
    { g: 'cert', code: 'GL', url: 'https://www.iec.ch/world-plugs', chk: 'ok',
      name: { ko: 'IEC — 국가별 플러그·전압', en: 'IEC — world plugs and voltage', zh: 'IEC — 各国插头与电压', ja: 'IEC — 世界のプラグ・電圧' },
      desc: { ko: '나라별 플러그 모양과 전압을 그림으로 확인합니다.', en: 'Plug types and voltages by country, with pictures.', zh: '各国插头形状与电压图示。', ja: '国別のプラグ形状と電圧を図で確認できます。' } },

    { g: 'stat', code: 'KR', url: 'https://stat.kita.net', chk: 'ok',
      name: { ko: 'KITA 무역통계', en: 'KITA trade statistics', zh: 'KITA 贸易统计', ja: 'KITA 貿易統計' },
      desc: { ko: '품목·국가별 수출입과 단가 추이를 봅니다.', en: 'Import/export volumes and unit prices by item and country.', zh: '按品目、国家查看进出口与单价走势。', ja: '品目・国別の輸出入と単価推移を確認します。' } },
    { g: 'stat', code: 'US', url: 'https://www.census.gov/foreign-trade/', chk: 'ok',
      name: { ko: '미 상무부 무역통계', en: 'US Census foreign trade', zh: '美国商务部贸易统计', ja: '米国商務省 貿易統計' },
      desc: { ko: '미국 수입 통계를 HS·국가별로 내려받습니다.', en: 'US import data by HS code and country.', zh: '按HS编码与国家下载美国进口数据。', ja: '米国の輸入統計をHS・国別に取得できます。' } },
    { g: 'stat', code: 'GL', url: 'https://www.trademap.org', chk: 'ok',
      name: { ko: 'ITC Trade Map', en: 'ITC Trade Map', zh: 'ITC Trade Map', ja: 'ITC Trade Map' },
      desc: { ko: '경쟁국별 수출 단가와 시장 점유율을 비교합니다.', en: 'Compare export unit values and market share by competitor.', zh: '比较竞争国的出口单价与市场份额。', ja: '競合国の輸出単価と市場シェアを比較できます。' } }
  ];

  /* 정밀 신용조회 (유료) */
  D.paid = [
    { code: 'NICE', url: 'https://www.nice.co.kr', chk: 'ok',
      name: { ko: 'NICE평가정보 — 기업신용등급·보고서', en: 'NICE — corporate credit ratings', zh: 'NICE — 企业信用等级', ja: 'NICE — 企業信用格付' },
      desc: { ko: '유료: 신용등급·재무분석·부도 이력 보고서. 건당 또는 연 구독.', en: 'Paid: credit grade, financial analysis, default history. Per report or subscription.', zh: '收费：信用等级、财务分析、违约记录报告。单份或订阅。', ja: '有料：信用格付・財務分析・債務不履行履歴のレポート。都度または定期購読。' } },
    { code: 'KODATA', url: 'https://www.kodata.co.kr', chk: 'ok',
      name: { ko: '한국평가데이터 KODATA — 크레탑', en: 'KODATA — Cretop credit reports', zh: 'KODATA — Cretop 信用报告', ja: 'KODATA — Cretop 信用レポート' },
      desc: { ko: '유료: 비상장 중소·중견기업 재무와 신용등급. 은행·거래처 실사에 씁니다.', en: 'Paid: financials and credit grades of unlisted SMEs, used for bank and partner due diligence.', zh: '收费：非上市中小企业的财务与信用等级，用于银行与客户尽职调查。', ja: '有料：非上場中小企業の財務と信用格付。銀行・取引先のデューデリジェンスに使います。' } },
    { code: 'K-SURE', url: 'https://www.ksure.or.kr', chk: 'ok',
      name: { ko: '한국무역보험공사 K-SURE ON — 국외기업 신용조사', en: 'K-SURE ON — overseas buyer credit checks', zh: '韩国贸易保险公社 K-SURE ON — 海外企业信用调查', ja: '韓国貿易保険公社 K-SURE ON — 海外企業信用調査' },
      desc: { ko: '수출자라면 국외기업 신용조사와 단기수출보험 한도를 무료·저렴하게 쓸 수 있습니다. 수출계약 전 필수 확인.', en: 'Exporters can get overseas buyer reports and short-term credit limits cheaply or free — check before signing.', zh: '出口商可低价或免费获得海外客户信用调查与短期出口险额度，签约前必查。', ja: '輸出者は海外バイヤーの信用調査と短期輸出保険の限度を低コストで利用できます。契約前の確認に。' } }
  ];

  /* 초보자 3단계 */
  D.steps = [
    { n: '1', 
      t: { ko: '등록 상태만 5분', en: 'Registration status in 5 minutes', zh: '先用5分钟查登记状态', ja: 'まず登録状態を5分' },
      d: { ko: '홈택스(한국)·Companies House(영국)·MCA(인도)·gsxt(중국)·법인번호(일본)·국가기업등록(베트남)·주(州) 등기(미국)에서 실체가 있는 회사인지 확인합니다.', en: 'Hometax (Korea), Companies House (UK), MCA (India), gsxt (China), Corporate Number (Japan), the business register (Vietnam) or a state registry (US) tell you the company exists and is active.', zh: '在 Hometax（韩）、Companies House（英）、MCA（印）、gsxt（中）、法人编号（日）、企业登记门户（越）或州登记（美）确认公司真实存在且营业中。', ja: 'Hometax（韓国）・Companies House（英）・MCA（インド）・gsxt（中国）・法人番号（日本）・企業登録（ベトナム）・州登記（米国）で実在と存続を確認します。' } },
    { n: '2',
      t: { ko: '재무·공시로 규모 확인 10분', en: 'Financials and filings, 10 minutes', zh: '用10分钟看财务与公示', ja: '財務・開示で規模を確認 10分' },
      d: { ko: 'DART·NICE 비즈인포(한국), SEC EDGAR(미국), EDINET·gBizINFO(일본)에서 매출 규모, 소송, 담보, 최대주주를 봅니다. 매출이 우리 거래 규모의 3배 이상인지가 첫 기준입니다.', en: 'DART and NICE Bizinfo (Korea), SEC EDGAR (US), EDINET and gBizINFO (Japan) show revenue, litigation, collateral and ownership. A first test: is their revenue at least three times the size of the deal?', zh: '在 DART、NICE Bizinfo（韩）、SEC EDGAR（美）、EDINET、gBizINFO（日）查看营收、诉讼、担保与最大股东。首要标准：营收是否达到本次交易额的3倍以上。', ja: 'DART・NICE Bizinfo（韓国）、SEC EDGAR（米国）、EDINET・gBizINFO（日本）で売上規模・訴訟・担保・筆頭株主を見ます。売上が取引規模の3倍以上かが最初の基準です。' } },
    { n: '3',
      t: { ko: '거래·제재 이력으로 마무리', en: 'Trade history and sanctions to finish', zh: '最后查交易与受限记录', ja: '取引・制裁履歴で仕上げ' },
      d: { ko: 'ImportYeti로 실제 선적 이력을, DGFT DEL·GST(인도)와 신용중국으로 제재·체납을 확인합니다. 수출이라면 K-SURE ON에서 국외기업 신용조사와 보험 한도를 먼저 잡으세요.', en: 'ImportYeti shows real shipments; DGFT DEL, GST (India) and Credit China show restrictions and arrears. For exports, secure a K-SURE ON buyer report and credit limit first.', zh: '用 ImportYeti 看真实货运记录，用 DGFT DEL、GST（印）与信用中国查受限与欠税。出口时先在 K-SURE ON 取得客户信用调查与保险额度。', ja: 'ImportYetiで実際の船積み履歴を、DGFT DEL・GST（インド）とクレジット中国で制限・滞納を確認します。輸出ならK-SURE ONで海外企業信用調査と保険限度を先に押さえます。' } }
  ];

  /* 국가별 실무 팁 */
  D.ctips = {
    kr: { ko: '홈택스로 계속사업자 여부를 먼저 보고, 재무는 DART(외감법인) 또는 NICE 비즈인포(비상장)로 보완합니다. 등기부의 대표자와 명함이 다르면 대리 권한을 확인하세요.', en: 'Check active status on Hometax, then use DART (audited firms) or NICE Bizinfo (unlisted). If the registry director differs from the business card, ask for a power of attorney.', zh: '先在 Hometax 查营业状态，财务用 DART（外部审计）或 NICE Bizinfo（非上市）补足。若登记代表与名片不符，请索取授权书。', ja: 'Hometaxで継続事業者かを確認し、財務はDART（外部監査）かNICE Bizinfo（非上場）で補います。登記の代表者と名刺が違う場合は代理権限を確認します。' },
    us: { ko: '주(州)마다 등기가 따로입니다. 상대가 말한 주의 Secretary of State에서 직접 확인하고, 상장사라면 EDGAR의 10-K에서 고객 집중도와 소송을 보세요.', en: 'Each state registers separately: check the Secretary of State of the state they name, and for listed firms read the 10-K for customer concentration and litigation.', zh: '各州登记独立，请到对方所称州的 Secretary of State 直接查询；上市公司再看 EDGAR 10-K 的客户集中度与诉讼。', ja: '州ごとに登記が別です。相手が言う州のSecretary of Stateで直接確認し、上場企業ならEDGARの10-Kで顧客集中度と訴訟を見ます。' },
    cn: { ko: '중국어 상호(유한공사)로 검색해야 정확합니다. 영문명은 등록명과 다를 수 있으니 계약서에 중국어 상호와 통일사회신용코드를 함께 적으세요.', en: 'Search by the Chinese name (有限公司); the English name often differs. Put the Chinese name and the unified social credit code in the contract.', zh: '请用中文名称（有限公司）检索，英文名常与登记名不同。合同中同时写明中文名称与统一社会信用代码。', ja: '中国語の商号（有限公司）で検索します。英文名は登記名と違うことが多いので、契約書に中国語商号と統一社会信用コードを併記します。' },
    uk: { ko: 'Companies House의 filing history에서 연차보고 지연·강제청산(compulsory strike-off) 이력을 봅니다. 계정 제출이 2년 연속 늦으면 위험 신호입니다.', en: 'Read the filing history for late accounts and compulsory strike-off notices. Two consecutive years of late accounts is a warning sign.', zh: '在 filing history 查看年报逾期与强制注销记录。连续两年迟交账目是危险信号。', ja: 'filing historyで年次報告の遅延や強制解散（compulsory strike-off）を確認します。2年連続の遅延は危険信号です。' },
    jp: { ko: '前株(주식회사 〇〇)·後株(〇〇 주식회사) 표기를 구분하고, 한자·가타카나·법인번호를 모두 넣어 검색하세요. gBizINFO에서 보조금 수령과 인허가 이력까지 볼 수 있습니다.', en: 'Distinguish 前株 and 後株 forms, and search by kanji, katakana and corporate number. gBizINFO also shows subsidies and licences.', zh: '区分“前株”“后株”写法，并用汉字、片假名、法人编号分别检索。gBizINFO 还能看到补贴与许可记录。', ja: '前株・後株の表記を区別し、漢字・カタカナ・法人番号のすべてで検索します。gBizINFOでは補助金や許認可の履歴も確認できます。' },
    in: { ko: '계약 전에 CIN(회사등록번호)과 IEC(수출입자코드)를 문서로 요청하세요. GSTIN 15자리로 납부 상태까지 확인하면 세금계산서 사고를 줄일 수 있습니다.', en: 'Ask for the CIN and IEC in writing before signing, and check the 15-digit GSTIN for filing status to avoid invoice problems.', zh: '签约前请对方书面提供 CIN 与 IEC，并用15位 GSTIN 核查申报状态，可减少发票风险。', ja: '契約前にCIN（会社登録番号）とIEC（輸出入者コード）を書面で求め、15桁GSTINで申告状況まで確認すると請求書トラブルを減らせます。' },
    vn: { ko: '세금코드(MST) 10자리는 본사, 13자리는 지점입니다. 계약서와 인보이스에 MST를 적어 달라고 요청하고, 송금 계좌 명의가 법인명과 같은지 확인하세요.', en: 'A 10-digit tax code is the head office, 13 digits a branch. Ask for the MST on the contract and invoice, and confirm the bank account name matches the company.', zh: '10位税号为总部、13位为分公司。请对方在合同与发票上写明 MST，并核对收款账户名与公司名一致。', ja: '税コード（MST）10桁は本社、13桁は支店です。契約書と請求書にMSTを記載してもらい、振込口座名が法人名と一致するか確認します。' },
    gl: { ko: '오픈코퍼레이트로 여러 나라 등록번호를 한 번에 대조하고, 미국·멕시코 거래처는 ImportYeti에서 실제 선적 이력을 확인하세요.', en: 'Use OpenCorporates to cross-check registries, and ImportYeti for the actual shipment history of US and Mexican counterparties.', zh: '用 OpenCorporates 一次比对多国登记，美国、墨西哥客户用 ImportYeti 查真实货运记录。', ja: 'OpenCorporatesで複数国の登記を照合し、米国・メキシコの取引先はImportYetiで実際の船積み履歴を確認します。' }
  };

  /* ---------------------------------------------------------------
     공공조달·입찰 가이드 — 사이트 언어별로 그 나라 제도에 맞춰 씁니다.
     ko = 조달청·나라장터 / en = 미국 연방(SAM·GSA) / zh = 중국 정부구매 / ja = 일본 통일자격
     링크는 2026-11-24 접속 확인(chk: ok) 또는 자동 접속 차단(bot)·현지 전용(kr).
  --------------------------------------------------------------- */
  D.proc = {
    ko: {
      lead: '납품 실적이 없으면 종합쇼핑몰(MAS), 벤처·창업기업이면 벤처나라, 건별 입찰은 일반 경쟁입찰이 맞습니다. 제조물품과 공급물품은 등록 요건이 달라, 자기 품목이 어느 쪽인지부터 확인해야 합니다.',
      sites: [
        { code: 'KR', url: 'https://shop.g2b.go.kr', chk: 'ok',
          name: '나라장터 종합쇼핑몰 (MAS)',
          desc: '무료: MAS·우수조달물품의 규격별 계약단가, 물품식별번호, 납품 가능 지역. 한계: 등록된 물품만 조회됩니다.' },
        { code: 'KR', url: 'https://www.g2b.go.kr', chk: 'ok',
          name: '나라장터 — 입찰·개찰·가격정보',
          desc: '무료: 쇼핑몰 미등록 품목의 기초금액·예정가격·낙찰가, 시설공통자재 단가표(엑셀).' },
        { code: 'KR', url: 'https://www.smpp.go.kr', chk: 'ok',
          name: '공공구매종합정보망 (SMPP)',
          desc: '무료: 중소기업자간 경쟁제품 지정 여부, 직접생산확인증명서 보유·유효성, 공공기관 구매실적.' },
        { code: 'KR', url: 'https://www.pps.go.kr/bichuk/index.do', chk: 'ok',
          name: '조달청 비축물자',
          desc: '무료: 구리·알루미늄·아연·니켈 등 비철·희소금속 일일 판매가격과 방출 공고. 중소·중견 실수요자, 주간 한도량 있음.' },
        { code: 'KR', url: 'https://www.vn.go.kr', chk: 'kr',
          name: '벤처나라',
          desc: '무료: 수요기관이 벤처·창업기업 제품을 직접 사는 전용몰. 벤처기업확인서 등 자격이 있어야 등록됩니다.' }
      ],
      lawTitle: '근거 법령',
      laws: [
        '「국가를 당사자로 하는 계약에 관한 법률」 — 국가가 당사자인 계약의 입찰·계약 절차',
        '「조달사업에 관한 법률」 — 조달청의 물자 조달·비축·계약 업무 근거',
        '「중소기업제품 구매촉진 및 판로지원에 관한 법률」 — 중소기업자간 경쟁제품, 직접생산확인, 공공기관 구매목표'
      ],
      cmpTitle: '세 가지 진입 경로',
      cmpHead: ['경로', '누가 쓰나', '준비물', '주의'],
      cmp: [
        ['일반 경쟁입찰', '납품 실적이 없어도 참여할 수 있습니다.', '입찰참가자격등록, 공동인증서, 업종별 면허·실적 증명', '실적·신인도 감점이 붙고, 건별 물량이라 꾸준한 납품에는 불리합니다.'],
        ['종합쇼핑몰 (MAS)', '물품을 상시 납품하려는 제조·공급업체의 기본 경로입니다.', '물품목록번호(물품분류+물품식별번호), MAS 적격성 평가, 단가·카탈로그', '유통·수입업체가 공급하는 물품은 등록이 제한되는 품목이 있습니다.'],
        ['벤처나라', '벤처기업·이노비즈·창업기업 등 자격을 가진 기업만 씁니다.', '벤처기업확인서 등 자격 확인서, 제품 등록', '확인서 유효기간이 끊기면 판매가 중단됩니다.']
      ],
      mfgTitle: '제조물품 vs 공급물품',
      mfgHead: ['구분', '제조물품 (제조사)', '공급물품 (유통·수입업체)'],
      mfg: [
        ['정의', '자기 공장에서 직접 생산합니다.', '다른 제조사의 제품을 사서 공급합니다(수입품 포함).'],
        ['MAS 입점', '일반적으로 등록할 수 있습니다.', '원칙적으로 제한되고, 예외 인정 여부를 확인해야 합니다.'],
        ['필요 서류', '직접생산확인증명서(중소기업자간 경쟁제품), 시험성적서·공장등록', '제조사 확인서, 수입 인보이스·통관 서류'],
        ['단가 구조', '제조원가·생산능력 기준이라 안정적입니다.', '환율·수입단가·재고에 따라 흔들립니다.'],
        ['확인처', 'SMPP(smpp.go.kr), 나라장터', '나라장터, 조달청 계약담당']
      ],
      stepTitle: '등록 3단계',
      steps: [
        { t: '공동인증서와 기본 정보 정리', d: '범용 공동인증서를 준비하고, 사업자등록증의 업태·종목과 제조/공급 구분을 먼저 정합니다.' },
        { t: '입찰참가자격 등록 + 지문등록', d: '나라장터에서 입찰참가자격을 등록하고, 입찰 대리인은 지방조달청에 지문을 등록합니다.' },
        { t: '물품식별번호 → MAS 적격성 평가', d: '품목의 물품목록번호를 확인하고 MAS 적격성 평가를 신청한 뒤 단가와 카탈로그를 등록합니다.' }
      ],
      checkTitle: '초보자 실무 확인 3단계',
      checks: [
        'SMPP에서 우리 품목이 중소기업자간 경쟁제품인지, 직접생산확인 대상인지 먼저 봅니다. 대상이면 확인증명서가 없을 때 입찰 자체가 막힙니다.',
        '나라장터 종합쇼핑몰에서 같은 품목의 등록 단가와 공급 구분(제조/공급)을 확인해, 내 단가가 어디에 놓이는지 봅니다.',
        '공공기관 제출용 기업신용평가등급 확인서(NICE·KODATA)를 미리 발급받아 두면 평가·계약 단계가 빨라집니다.'
      ]
    },

    en: {
      lead: 'US federal buyers come through three doors: bid on a contract yourself, hold a GSA Multiple Award Schedule so agencies can order from GSA Advantage, or sell to a prime as a subcontractor. A reseller is not the manufacturer — the Buy American Act, the Trade Agreements Act and the SBA nonmanufacturer rule decide whether your product can be offered at all.',
      sites: [
        { code: 'US', url: 'https://sam.gov', chk: 'ok',
          name: 'SAM.gov — UEI and CAGE registration',
          desc: 'Free: register your entity, get a UEI, and keep reps and certifications current. CAGE is assigned after registration. Renew annually.' },
        { code: 'US', url: 'https://www.gsaadvantage.gov', chk: 'ok',
          name: 'GSA Advantage / GSA MAS',
          desc: 'Free to browse: schedules and prices agencies actually order from. To sell you need a GSA MAS contract and a published catalogue.' },
        { code: 'US', url: 'https://www.usaspending.gov', chk: 'ok',
          name: 'USAspending.gov',
          desc: 'Free: who won which contract, at what price, from which agency — the fastest reality check on the market you are entering.' },
        { code: 'US', url: 'https://www.acquisition.gov', chk: 'ok',
          name: 'Acquisition.gov — the FAR',
          desc: 'Free: the Federal Acquisition Regulation itself (48 CFR ch. 1). Part 8.4 covers schedules, 4.11 covers SAM.' },
        { code: 'US', url: 'https://www.sba.gov', chk: 'ok',
          name: 'SBA — small business rules',
          desc: 'Free: size standards, set-asides and the nonmanufacturer rule guidance that governs resellers.' }
      ],
      lawTitle: 'Governing rules',
      laws: [
        'FAR — Federal Acquisition Regulation, 48 CFR Chapter 1 (FAR 8.4 federal supply schedules, FAR 4.11 SAM)',
        'Buy American Act — 41 U.S.C. §§ 8301–8305, preference for domestic end products',
        'Trade Agreements Act — 19 U.S.C. §§ 2501–2581, country-of-origin rules for schedule and open-market buys',
        'SBA Nonmanufacturer Rule — 13 CFR § 121.406: a reseller must supply a small business manufacturer’s US-made end item, or hold an SBA waiver'
      ],
      cmpTitle: 'Three ways in',
      cmpHead: ['Route', 'Who it suits', 'What you need', 'Watch out'],
      cmp: [
        ['Open-market contract bid', 'Anyone able to meet the solicitation; no past performance required to bid.', 'SAM registration (UEI), FAR representations, past performance or capability narrative', 'Evaluation punishes no past performance, and each award is one-off volume.'],
        ['GSA MAS + Advantage', 'Suppliers who want agencies to order continuously.', 'GSA MAS proposal, price negotiation, catalogue with TAA-compliant origin', 'The GSA price becomes a ceiling; agencies may still ask for lower.'],
        ['Subcontracting to a prime', 'New exporters without US registration.', 'Teaming agreement, manufacturer authorisation, insurance', 'No privity with the government; payment depends on the prime.']
      ],
      mfgTitle: 'Manufacturer vs reseller (nonmanufacturer)',
      mfgHead: ['Item', 'Manufacturer', 'Reseller / nonmanufacturer'],
      mfg: [
        ['Definition', 'Makes the end item in the US, adding real value.', 'Sells an end item it does not manufacture, often imported.'],
        ['Eligibility', 'Can bid and hold schedule contracts directly.', 'Only if it supplies a small business manufacturer’s US-made item, or holds a 13 CFR 121.406 waiver.'],
        ['Documents', 'Domestic manufacturing evidence, cost or pricing data, SAM reps and certs', 'Manufacturer’s letter, country of origin, TAA certificate, import records'],
        ['Pricing', 'Built from cost; stable.', 'Moves with landed cost, duty and FX; the schedule price is a ceiling.'],
        ['Check at', 'SAM.gov, GSA eLibrary', 'SBA nonmanufacturer guidance, GSA origin review']
      ],
      stepTitle: 'Three steps to register',
      steps: [
        { t: 'Get a UEI at SAM.gov', d: 'Register the entity, name an electronic business point of contact, and finish the representations and certifications. CAGE follows.' },
        { t: 'Choose schedule or open market', d: 'A GSA MAS offer needs a price proposal and negotiation; open-market bidding only needs SAM registration and the solicitation response.' },
        { t: 'Settle origin before you quote', d: 'For resale, confirm the nonmanufacturer rule and whether the item is TAA-compliant for the agency you are targeting.' }
      ],
      checkTitle: 'Checkpoints for a first bid',
      checks: [
        'SAM registration expires every year — an expired record blocks award even after you win.',
        'A nonmanufacturer must supply a small business manufacturer’s US end item; an SBA waiver is item-specific and must be checked for your product.',
        'Read USAspending for the same item before pricing: agencies publish what they actually paid, not what the catalogue says.'
      ]
    },

    zh: {
      lead: '中国的政府与公共采购主要走三条路：政府采购公开招标、框架协议与电子卖场、以及作为代理商参与他人投标。制造商与代理商的门槛不同——招标文件通常要求制造厂商授权书与生产许可，代理商须提交授权书原件。',
      sites: [
        { code: 'CN', url: 'https://www.ccgp.gov.cn', chk: 'bot',
          name: '中国政府采购网',
          desc: '免费：中央与地方采购公告、中标结果、采购文件。查看投标截止时间与资格条件的第一站。' },
        { code: 'CN', url: 'https://www.ggzy.gov.cn', chk: 'ok',
          name: '全国公共资源交易平台',
          desc: '免费：工程、货物、服务类招标公告与开标记录，可按地区和行业筛选。' },
        { code: 'CN', url: 'https://www.creditchina.gov.cn', chk: 'bot',
          name: '信用中国',
          desc: '免费：失信被执行人、重大税收违法、行政处罚记录。投标前必查，被列入名单会被拒绝投标。' },
        { code: 'CN', url: 'https://www.gsxt.gov.cn', chk: 'bot',
          name: '国家企业信用信息公示系统',
          desc: '免费：营业执照信息、年报、经营异常。核对投标主体与授权书上的公司名称是否一致。' }
      ],
      lawTitle: '法律依据',
      laws: [
        '《中华人民共和国政府采购法》 — 政府采购方式、程序与供应商资格',
        '《中华人民共和国招标投标法》 — 招标、投标、开标与评标程序',
        '《政府采购促进中小企业发展管理办法》(财库〔2020〕46号) — 中小企业预留份额与价格扣除'
      ],
      cmpTitle: '三条进入路径',
      cmpHead: ['路径', '适用对象', '所需材料', '注意'],
      cmp: [
        ['政府采购公开招标', '有生产或供货能力、能提供完整资质的企业。', '营业执照、生产许可或授权书、检测报告、保证金', '资格条件与保证金要求在采购文件中，错过截止时间即无法投标。'],
        ['框架协议 / 电子卖场', '希望长期小额供货的供应商。', '供应商注册、商品与价格上架、售后承诺', '价格一旦上架即为上限，调价需按平台规则申请。'],
        ['作为代理商投标', '没有生产能力、代理他人品牌的贸易商。', '制造厂商授权书（原件）、代理资质、供货承诺', '授权书须按项目单独开具，使用过期或通用授权书会被判无效。']
      ],
      mfgTitle: '制造商（生产商）vs 代理商',
      mfgHead: ['项目', '制造商（生产商）', '代理商（经销商）'],
      mfg: [
        ['定义', '自行生产并提供产品与生产许可。', '代理销售他人生产的产品，通常是进口或分销。'],
        ['投标资格', '生产许可、产品检测报告、质量体系证明。', '制造厂商授权书原件、代理资格与供货能力证明。'],
        ['价格构成', '出厂价加合理利润，较稳定。', '含代理差价、关税与汇率，波动较大。'],
        ['中小企业优惠', '可提交中小企业声明函，享受预留份额或价格扣除。', '是否适用中小企业优惠，按采购文件与供应商自身规模认定。'],
        ['核对处', '信用中国、gsxt、采购公告附件', '授权书真伪可向制造商或信用中国核实']
      ],
      stepTitle: '登记与投标三步',
      steps: [
        { t: '主体资格与信用自查', d: '在信用中国和国家企业信用信息公示系统核对营业执照、经营范围与失信记录，确认可以投标。' },
        { t: '准备产品与授权材料', d: '产品检测报告、生产许可；代理销售的，向制造商索取按项目开具的授权书原件。' },
        { t: '平台注册并按公告投标', d: '在公共资源交易平台完成供应商注册，下载采购文件，按资格条件与截止时间提交投标文件。' }
      ],
      checkTitle: '实务检查要点',
      checks: [
        '投标主体、授权书与实际供货方三个名称必须一致，这是最常见的废标原因。',
        '中小企业声明函内容不实会被处罚并列入不良记录，规模认定要按采购文件口径核对。',
        '采购文件中的资格条件（业绩、注册资金、认证）要逐条比对，缺一项即无法通过资格审查。'
      ]
    },

    ja: {
      lead: '国の物品調達は、まず「全省庁統一資格」を取得してから入札に参加します。資格は A〜D の等級と「物品の製造」「物品の販売」などの区分で決まり、等級は資本金・売上高・従業員数で判定されます。',
      sites: [
        { code: 'JP', url: 'https://www.p-portal.go.jp', chk: 'ok',
          name: '調達ポータル',
          desc: '無料：全省庁の調達情報、入札公告、統一資格の申請・更新。まずここに登録します。' },
        { code: 'JP', url: 'https://www.p-portal.go.jp/pps-web-biz/UAA01/OAA0100', chk: 'ok',
          name: '全省庁統一資格（資格審査）',
          desc: '無料：等級（A・B・C・D）と営業品目、物品の製造／販売の区分を確認・申請します。' },
        { code: 'JP', url: 'https://info.gbiz.go.jp', chk: 'ok',
          name: 'gBizINFO',
          desc: '無料：取引先・競合の法人情報、補助金、許認可、労働情報を横断で確認できます。' },
        { code: 'JP', url: 'https://www.meti.go.jp', chk: 'ok',
          name: '経済産業省 — 官公需の基本方針',
          desc: '無料：中小企業者に関する国等の契約の基本方針（契約目標・措置）を毎年度公表しています。' }
      ],
      lawTitle: '根拠法令',
      laws: [
        '「会計法」（昭和22年法律第35号） — 国の契約手続の基本',
        '「予算決算及び会計令」（昭和22年勅令第165号） — 一般競争入札・資格審査の根拠',
        '「官公需についての中小企業者の受注の確保に関する法律」（昭和41年法律第97号） — 中小企業者の受注機会の確保'
      ],
      cmpTitle: '三つの入り方',
      cmpHead: ['ルート', '向く相手', '必要なもの', '注意'],
      cmp: [
        ['一般競争入札', '統一資格を持ち、公告の条件を満たす事業者。', '全省庁統一資格、営業品目、入札説明書の要件', '等級ごとに対象金額が異なり、下位等級では応札できない案件があります。'],
        ['オープンカウンター', '少額案件に継続的に応札したい事業者。', '統一資格、見積書、カタログ', '最低価格方式が中心で、数量は小口です。'],
        ['随意契約・特命', '技術力や独占性がある事業者。', '統一資格、技術提案、見積資料', '公告されないため、発注機関との事前接触が前提になります。']
      ],
      mfgTitle: '物品の製造 vs 物品の販売',
      mfgHead: ['項目', '物品の製造（メーカー）', '物品の販売（販売店）'],
      mfg: [
        ['定義', '自社の工場で製造します。', '仕入れて販売します（輸入品を含む）。'],
        ['資格審査', '工場・品質管理体制、製造能力を審査されます。', '仕入先・メーカーとの取引関係、販売実績を審査されます。'],
        ['等級', '資本金・売上高・従業員数で A〜D に区分されます。', '同じ基準で区分されます。'],
        ['注意', '製造区分がないと、製造品の入札に応札できないことがあります。', 'メーカーの確認書や代理店証明を求められる場合があります。'],
        ['確認先', '調達ポータル、gBizINFO', '調達ポータル、メーカー']
      ],
      stepTitle: '登録3ステップ',
      steps: [
        { t: '調達ポータルで統一資格を申請', d: '法人番号と決算書類を用意し、資格審査申請を出します。審査には通常数週間かかります。' },
        { t: '区分と営業品目を選ぶ', d: '「物品の製造」か「物品の販売」かを決め、扱う営業品目コードを選びます。' },
        { t: '等級と公告を確認して応札', d: '等級に見合う案件を調達ポータルで検索し、入札説明書の資格要件を満たすか確認します。' }
      ],
      checkTitle: '実務チェック',
      checks: [
        '等級は資本金・売上・従業員で決まり、年度ごとに見直されます。申請前に自社の区分を確認してください。',
        '営業品目コードの選択を誤ると、応札したい案件の公告が見えません。',
        '官公需法に基づく基本方針では、中小企業・小規模事業者向け契約の目標が国等全体で61％とされています（令和8年度基本方針）。'
      ]
    }
  };

  /* ---------------------------------------------------------------
     항공·호텔·맛집 링크
  --------------------------------------------------------------- */
  D.airlines = [
    { name: { ko: '대한항공', en: 'Korean Air', zh: '大韩航空', ja: '大韓航空' }, url: 'https://www.koreanair.com' },
    { name: { ko: '아시아나항공', en: 'Asiana Airlines', zh: '韩亚航空', ja: 'アシアナ航空' }, url: 'https://flyasiana.com' },
    { name: 'ANA', url: 'https://www.ana.co.jp' },
    { name: 'JAL', url: 'https://www.jal.co.jp' },
    { name: 'Air China', url: 'https://www.airchina.com.cn' },
    { name: 'United', url: 'https://www.united.com' },
    { name: 'Delta', url: 'https://www.delta.com' }
  ];
  /* 트립닷컴 파트너스 딥링크 (Allianceid 11473995 · SID 336786143) —
     파트너센터 Affiliate Link 생성기가 발급한 주소를 그대로 둡니다(수정 금지). */
  D.flightSearch = [
    { name: 'Google Flights', url: 'https://www.google.com/travel/flights' },
    { name: 'Skyscanner', url: 'https://www.skyscanner.co.kr' },
    { name: 'Trip.com', url: 'https://kr.trip.com/flights/?Allianceid=11473995&SID=336786143&trip_sub1=ibn-trip-flights&trip_sub3=D21594477' }
  ];
  D.hotelSearch = [
    { name: 'Agoda', url: 'https://www.agoda.com' },
    { name: 'Booking.com', url: 'https://www.booking.com' },
    { name: 'Trip.com', url: 'https://kr.trip.com/hotels/?Allianceid=11473995&SID=336786143&trip_sub1=ibn-trip-hotels&trip_sub3=D21594477' }
  ];
  /* 클룩 제휴(제휴 ID 144447) — 공항 이동·eSIM. 리다이렉트 주소를 그대로 둡니다. */
  D.tripExtras = [
    {
      name: { ko: '공항 픽업·샌딩', en: 'Airport transfer', zh: '机场接送', ja: '空港送迎' },
      note: { ko: '도착 시간을 넣으면 기사 배차까지', en: 'Enter your arrival time', zh: '填写到达时间', ja: '到着時刻を入力' },
      url: 'https://affiliate.klook.com/redirect?aid=144447&aff_adid=1585973&k_site=https%3A%2F%2Fwww.klook.com%2Fko%2Fairport-transfers%2F'
    },
    {
      name: { ko: 'eSIM·현지 유심', en: 'eSIM & local SIM', zh: 'eSIM·当地SIM', ja: 'eSIM・現地SIM' },
      note: { ko: '출국 전 설치, 도착 즉시 개통', en: 'Install before you fly', zh: '出发前安装，落地即用', ja: '出国前に設定、到着後すぐ開通' },
      url: 'https://affiliate.klook.com/redirect?aid=144447&aff_adid=1585973&k_site=https%3A%2F%2Fwww.klook.com%2Fko%2Fesim%2F'
    }
  ];
  D.foodLinks = [
    { name: 'Google Maps', url: 'https://www.google.com/maps/search/?api=1&query=' },
    { name: 'Yelp (US)', url: 'https://www.yelp.com/' },
    { name: 'Tabelog (JP)', url: 'https://tabelog.com/' },
    { name: '大众点评 (CN)', url: 'https://www.dianping.com/' },
    { name: 'OpenRice (HK·SG)', url: 'https://www.openrice.com/' },
    { name: 'Michelin Guide', url: 'https://guide.michelin.com/' },
    { name: 'Tripadvisor', url: 'https://www.tripadvisor.com/' }
  ];

  /* ---------------------------------------------------------------
     출장 체크리스트
  --------------------------------------------------------------- */
  D.check = {
    ko: ['여권 만료 6개월 이상 남았는지 확인', '비자·무비자 체류일수 확인 (미국 ESTA는 출발 72시간 전까지)', '왕복 항공권과 호텔 예약 확인서 출력', '해외여행자보험 가입 (업무 중 사고 포함 여부 확인)', '출장지 전압·플러그 어댑터, 110V 기기면 변압기', '현지 유심·eSIM 또는 로밍 요금제', '법인카드·현금(달러 300~500)과 영수증 보관 봉투', '거래처 명함·회사 소개서 영문본, 샘플·카탈로그', '수출입 서류 사본 (인보이스·패킹리스트·HS코드)', '상대 국가 공휴일·근무 시간 확인', '출장 결과 보고서 양식 미리 받아 두기', '귀국 시 면세 한도와 신고 대상 확인'],
    en: ['Passport valid for at least six months', 'Visa or visa-free stay length (US ESTA at least 72 hours before departure)', 'Printed flight and hotel confirmations', 'Travel insurance covering work accidents', 'Plug adapter; a transformer if your device is 110V', 'Local SIM, eSIM or roaming plan', 'Corporate card, USD 300–500 cash and a receipt envelope', 'Business cards, English company profile, samples and catalogue', 'Copies of trade documents (invoice, packing list, HS code)', 'Public holidays and working hours at the destination', 'Ask for the trip report template in advance', 'Duty-free allowance and declaration items on return'],
    zh: ['护照有效期需6个月以上', '确认签证或免签停留天数（美国ESTA需提前72小时）', '打印机票与酒店确认单', '投保含工作事故的旅行保险', '转换插头；110V电器需变压器', '当地SIM卡、eSIM或漫游套餐', '公司卡、300–500美元现金与票据袋', '名片、英文公司简介、样品与目录', '贸易单据副本（发票、装箱单、HS编码）', '确认对方国家节假日与工作时间', '提前索取出差报告模板', '回国免税额度与申报事项'],
    ja: ['パスポートの残存期間が6か月以上あるか', 'ビザ・免除滞在日数（米国ESTAは出発72時間前まで）', '航空券・ホテルの確認書を印刷', '業務中の事故を含む海外旅行保険', '変換プラグ、110V機器なら変圧器', '現地SIM・eSIMまたはローミング', '法人カード・現金300〜500ドル・領収書用封筒', '名刺、英文会社案内、サンプル・カタログ', '貿易書類の写し（インボイス・パッキングリスト・HSコード）', '相手国の祝日・就業時間の確認', '出張報告書の様式を事前に入手', '帰国時の免税範囲と申告品の確認']
  };

  /* ---------------------------------------------------------------
     2027년 휴무일 (한국·중국·일본·미국)
     type: h = 공휴일(휴무), p = 혼잡·부분 휴무
  --------------------------------------------------------------- */
  D.holidays = [
    /* 한국 — 우주항공청 2027 월력요항 */
    { d: '2027-01-01', c: 'kr', t: 'h', n: { ko: '신정', en: 'New Year’s Day', zh: '元旦', ja: '元日' } },
    { d: '2027-02-06', c: 'kr', t: 'h', n: { ko: '설날 연휴', en: 'Seollal', zh: '春节连休', ja: 'ソルラル' } },
    { d: '2027-02-07', c: 'kr', t: 'h', n: { ko: '설날', en: 'Seollal', zh: '春节', ja: 'ソルラル' } },
    { d: '2027-02-08', c: 'kr', t: 'h', n: { ko: '설날 연휴', en: 'Seollal', zh: '春节连休', ja: 'ソルラル' } },
    { d: '2027-02-09', c: 'kr', t: 'h', n: { ko: '대체공휴일', en: 'Substitute holiday', zh: '替代公休', ja: '振替休日' } },
    { d: '2027-03-01', c: 'kr', t: 'h', n: { ko: '삼일절', en: 'Independence Movement Day', zh: '三一节', ja: '三一節' } },
    { d: '2027-05-01', c: 'kr', t: 'h', n: { ko: '노동절', en: 'Labour Day', zh: '劳动节', ja: '労働者の日' } },
    { d: '2027-05-03', c: 'kr', t: 'h', n: { ko: '대체공휴일', en: 'Substitute holiday', zh: '替代公休', ja: '振替休日' } },
    { d: '2027-05-05', c: 'kr', t: 'h', n: { ko: '어린이날', en: 'Children’s Day', zh: '儿童节', ja: 'こどもの日' } },
    { d: '2027-05-13', c: 'kr', t: 'h', n: { ko: '부처님오신날', en: 'Buddha’s Birthday', zh: '佛诞节', ja: '釈迦誕生日' } },
    { d: '2027-06-06', c: 'kr', t: 'h', n: { ko: '현충일', en: 'Memorial Day', zh: '显忠日', ja: '顕忠日' } },
    { d: '2027-07-17', c: 'kr', t: 'h', n: { ko: '제헌절', en: 'Constitution Day', zh: '制宪节', ja: '制憲節' } },
    { d: '2027-07-19', c: 'kr', t: 'h', n: { ko: '대체공휴일', en: 'Substitute holiday', zh: '替代公休', ja: '振替休日' } },
    { d: '2027-08-15', c: 'kr', t: 'h', n: { ko: '광복절', en: 'Liberation Day', zh: '光复节', ja: '光復節' } },
    { d: '2027-08-16', c: 'kr', t: 'h', n: { ko: '대체공휴일', en: 'Substitute holiday', zh: '替代公休', ja: '振替休日' } },
    { d: '2027-09-14', c: 'kr', t: 'h', n: { ko: '추석 연휴', en: 'Chuseok', zh: '秋夕连休', ja: '秋夕' } },
    { d: '2027-09-15', c: 'kr', t: 'h', n: { ko: '추석', en: 'Chuseok', zh: '秋夕', ja: '秋夕' } },
    { d: '2027-09-16', c: 'kr', t: 'h', n: { ko: '추석 연휴', en: 'Chuseok', zh: '秋夕连休', ja: '秋夕' } },
    { d: '2027-10-03', c: 'kr', t: 'h', n: { ko: '개천절', en: 'National Foundation Day', zh: '开天节', ja: '開天節' } },
    { d: '2027-10-04', c: 'kr', t: 'h', n: { ko: '대체공휴일', en: 'Substitute holiday', zh: '替代公休', ja: '振替休日' } },
    { d: '2027-10-09', c: 'kr', t: 'h', n: { ko: '한글날', en: 'Hangul Day', zh: '韩文日', ja: 'ハングルの日' } },
    { d: '2027-10-11', c: 'kr', t: 'h', n: { ko: '대체공휴일', en: 'Substitute holiday', zh: '替代公休', ja: '振替休日' } },
    { d: '2027-12-25', c: 'kr', t: 'h', n: { ko: '성탄절', en: 'Christmas Day', zh: '圣诞节', ja: 'クリスマス' } },
    { d: '2027-12-27', c: 'kr', t: 'h', n: { ko: '대체공휴일', en: 'Substitute holiday', zh: '替代公休', ja: '振替休日' } },

    /* 중국 — 국무원 2027년 휴가 공고 */
    { d: '2027-01-01', c: 'cn', t: 'h', n: { ko: '원단', en: 'New Year’s Day', zh: '元旦', ja: '元旦' } },
    { d: '2027-01-02', c: 'cn', t: 'h', n: { ko: '원단 연휴', en: 'New Year holiday', zh: '元旦假期', ja: '元旦休み' } },
    { d: '2027-01-03', c: 'cn', t: 'h', n: { ko: '원단 연휴', en: 'New Year holiday', zh: '元旦假期', ja: '元旦休み' } },
    { d: '2027-02-05', c: 'cn', t: 'h', n: { ko: '춘절 전날', en: 'Spring Festival Eve', zh: '除夕', ja: '春節前日' } },
    { d: '2027-02-06', c: 'cn', t: 'h', n: { ko: '춘절', en: 'Spring Festival', zh: '春节', ja: '春節' } },
    { d: '2027-02-08', c: 'cn', t: 'h', n: { ko: '춘절 연휴', en: 'Spring Festival holiday', zh: '春节假期', ja: '春節休み' } },
    { d: '2027-02-10', c: 'cn', t: 'h', n: { ko: '춘절 연휴', en: 'Spring Festival holiday', zh: '春节假期', ja: '春節休み' } },
    { d: '2027-02-13', c: 'cn', t: 'h', n: { ko: '춘절 연휴 끝', en: 'Last day of Spring Festival', zh: '春节假期结束', ja: '春節休み最終日' } },
    { d: '2027-04-03', c: 'cn', t: 'h', n: { ko: '청명절 연휴', en: 'Qingming holiday', zh: '清明假期', ja: '清明節休み' } },
    { d: '2027-04-05', c: 'cn', t: 'h', n: { ko: '청명절', en: 'Qingming Festival', zh: '清明节', ja: '清明節' } },
    { d: '2027-05-01', c: 'cn', t: 'h', n: { ko: '노동절 연휴 시작', en: 'Labour Day holiday starts', zh: '劳动节假期开始', ja: '労働節休み開始' } },
    { d: '2027-05-05', c: 'cn', t: 'h', n: { ko: '노동절 연휴 끝', en: 'Labour Day holiday ends', zh: '劳动节假期结束', ja: '労働節休み終了' } },
    { d: '2027-06-09', c: 'cn', t: 'h', n: { ko: '단오절', en: 'Dragon Boat Festival', zh: '端午节', ja: '端午節' } },
    { d: '2027-09-15', c: 'cn', t: 'h', n: { ko: '중추절', en: 'Mid-Autumn Festival', zh: '中秋节', ja: '中秋節' } },
    { d: '2027-10-01', c: 'cn', t: 'h', n: { ko: '국경절 연휴 시작', en: 'National Day holiday starts', zh: '国庆节假期开始', ja: '国慶節休み開始' } },
    { d: '2027-10-07', c: 'cn', t: 'h', n: { ko: '국경절 연휴 끝', en: 'National Day holiday ends', zh: '国庆节假期结束', ja: '国慶節休み終了' } },
    { d: '2027-01-31', c: 'cn', t: 'p', n: { ko: '일요일 근무(춘절 대체)', en: 'Sunday working day (Spring Festival)', zh: '周日上班（春节调休）', ja: '日曜出勤（春節振替）' } },
    { d: '2027-02-14', c: 'cn', t: 'p', n: { ko: '일요일 근무(춘절 대체)', en: 'Sunday working day (Spring Festival)', zh: '周日上班（春节调休）', ja: '日曜出勤（春節振替）' } },

    /* 일본 — 내각부·국립천문대 */
    { d: '2027-01-01', c: 'jp', t: 'h', n: { ko: '신정', en: 'New Year’s Day', zh: '元旦', ja: '元日' } },
    { d: '2027-01-11', c: 'jp', t: 'h', n: { ko: '성인의 날', en: 'Coming of Age Day', zh: '成人节', ja: '成人の日' } },
    { d: '2027-02-11', c: 'jp', t: 'h', n: { ko: '건국기념일', en: 'National Foundation Day', zh: '建国纪念日', ja: '建国記念の日' } },
    { d: '2027-02-23', c: 'jp', t: 'h', n: { ko: '천황탄생일', en: 'Emperor’s Birthday', zh: '天皇诞生日', ja: '天皇誕生日' } },
    { d: '2027-03-21', c: 'jp', t: 'h', n: { ko: '춘분의 날', en: 'Vernal Equinox Day', zh: '春分节', ja: '春分の日' } },
    { d: '2027-03-22', c: 'jp', t: 'h', n: { ko: '대체휴일', en: 'Substitute holiday', zh: '补休', ja: '振替休日' } },
    { d: '2027-04-29', c: 'jp', t: 'h', n: { ko: '쇼와의 날', en: 'Showa Day', zh: '昭和之日', ja: '昭和の日' } },
    { d: '2027-05-03', c: 'jp', t: 'h', n: { ko: '헌법기념일', en: 'Constitution Day', zh: '宪法纪念日', ja: '憲法記念日' } },
    { d: '2027-05-04', c: 'jp', t: 'h', n: { ko: '녹색의 날', en: 'Greenery Day', zh: '绿之日', ja: 'みどりの日' } },
    { d: '2027-05-05', c: 'jp', t: 'h', n: { ko: '어린이날', en: 'Children’s Day', zh: '儿童节', ja: 'こどもの日' } },
    { d: '2027-07-19', c: 'jp', t: 'h', n: { ko: '바다의 날', en: 'Marine Day', zh: '海之日', ja: '海の日' } },
    { d: '2027-08-11', c: 'jp', t: 'h', n: { ko: '산의 날', en: 'Mountain Day', zh: '山之日', ja: '山の日' } },
    { d: '2027-09-20', c: 'jp', t: 'h', n: { ko: '경로의 날', en: 'Respect for the Aged Day', zh: '敬老日', ja: '敬老の日' } },
    { d: '2027-09-23', c: 'jp', t: 'h', n: { ko: '추분의 날', en: 'Autumnal Equinox Day', zh: '秋分节', ja: '秋分の日' } },
    { d: '2027-10-11', c: 'jp', t: 'h', n: { ko: '스포츠의 날', en: 'Sports Day', zh: '体育节', ja: 'スポーツの日' } },
    { d: '2027-11-03', c: 'jp', t: 'h', n: { ko: '문화의 날', en: 'Culture Day', zh: '文化节', ja: '文化の日' } },
    { d: '2027-11-23', c: 'jp', t: 'h', n: { ko: '근로감사의 날', en: 'Labour Thanksgiving Day', zh: '勤劳感谢日', ja: '勤労感謝の日' } },
    { d: '2027-01-02', c: 'jp', t: 'p', n: { ko: '은행 휴무', en: 'Banks closed', zh: '银行休业', ja: '銀行休業' } },
    { d: '2027-01-03', c: 'jp', t: 'p', n: { ko: '은행 휴무', en: 'Banks closed', zh: '银行休业', ja: '銀行休業' } },
    { d: '2027-12-31', c: 'jp', t: 'p', n: { ko: '은행 휴무', en: 'Banks closed', zh: '银行休业', ja: '銀行休業' } },

    /* 미국 — OPM 2027 */
    { d: '2027-01-01', c: 'us', t: 'h', n: { ko: '신정', en: 'New Year’s Day', zh: '元旦', ja: '元日' } },
    { d: '2027-01-18', c: 'us', t: 'h', n: { ko: '마틴 루터 킹의 날', en: 'Martin Luther King Jr. Day', zh: '马丁·路德·金纪念日', ja: 'キング牧師記念日' } },
    { d: '2027-02-15', c: 'us', t: 'h', n: { ko: '대통령의 날', en: 'Washington’s Birthday', zh: '总统日', ja: '大統領の日' } },
    { d: '2027-05-31', c: 'us', t: 'h', n: { ko: '현충일', en: 'Memorial Day', zh: '阵亡将士纪念日', ja: 'メモリアルデー' } },
    { d: '2027-06-18', c: 'us', t: 'h', n: { ko: '준틴스', en: 'Juneteenth', zh: '六月节', ja: 'ジューンティーンス' } },
    { d: '2027-07-05', c: 'us', t: 'h', n: { ko: '독립기념일 대체', en: 'Independence Day (observed)', zh: '独立日补休', ja: '独立記念日（振替）' } },
    { d: '2027-09-06', c: 'us', t: 'h', n: { ko: '노동절', en: 'Labor Day', zh: '劳动节', ja: 'レイバーデー' } },
    { d: '2027-10-11', c: 'us', t: 'h', n: { ko: '콜럼버스의 날', en: 'Columbus Day', zh: '哥伦布日', ja: 'コロンブスデー' } },
    { d: '2027-11-11', c: 'us', t: 'h', n: { ko: '재향군인의 날', en: 'Veterans Day', zh: '退伍军人节', ja: '退役軍人の日' } },
    { d: '2027-11-25', c: 'us', t: 'h', n: { ko: '추수감사절', en: 'Thanksgiving', zh: '感恩节', ja: '感謝祭' } },
    { d: '2027-12-24', c: 'us', t: 'h', n: { ko: '성탄절 대체', en: 'Christmas Day (observed)', zh: '圣诞节补休', ja: 'クリスマス（振替）' } },
    { d: '2027-11-26', c: 'us', t: 'p', n: { ko: '블랙프라이데이', en: 'Black Friday', zh: '黑色星期五', ja: 'ブラックフライデー' } }
  ];

  /* 선적 일정 역산 카드 */
  D.ship = [
    { id: 'cny', when: '2027-01-18 ~ 2027-02-19', n: { ko: '중국 춘절', en: 'Spring Festival, China', zh: '中国春节', ja: '中国 春節' },
      t: { ko: '공장은 공식 휴무(2/5~2/13)보다 1~2주 먼저 문을 닫습니다. **1월 15일까지 선적 완료**를 목표로 하고, 그 뒤 출하는 2월 하순으로 잡으세요. 1/31·2/14는 일요일 근무일입니다.',
           en: 'Factories shut one to two weeks before the official break (5–13 Feb). Aim to **finish loading by 15 January**; anything later sails in late February. 31 Jan and 14 Feb are working Sundays.',
           zh: '工厂通常比法定假期（2/5–2/13）提前1~2周停工。请以**1月15日前装完**为目标，之后的货安排在2月下旬。1月31日、2月14日为调休上班日。',
           ja: '工場は法定休み（2/5〜2/13）より1〜2週間早く閉まります。**1月15日までの船積み完了**を目標にし、それ以降は2月下旬の出荷に。1/31・2/14は日曜出勤日です。' } },
    { id: 'kr-seollal', when: '2027-02-05 ~ 2027-02-10', n: { ko: '한국 설날', en: 'Seollal, Korea', zh: '韩国春节', ja: '韓国 ソルラル' },
      t: { ko: '한국 항만·은행이 2/6~2/9에 쉽니다. 서류 원본 발송과 환어음 결제는 **2월 3일 이전**에 끝내세요.',
           en: 'Korean ports and banks close 6–9 Feb. Finish original document couriers and bill settlements **before 3 February**.',
           zh: '韩国港口与银行2/6–2/9休息。正本单据寄送与汇票结算请在**2月3日前**完成。',
           ja: '韓国の港湾・銀行は2/6〜2/9が休みです。正本書類の発送と手形決済は**2月3日まで**に済ませます。' } },
    { id: 'gw', when: '2027-04-29 ~ 2027-05-07', n: { ko: '일본 골든위크', en: 'Golden Week, Japan', zh: '日本黄金周', ja: '日本 ゴールデンウィーク' },
      t: { ko: '4/29와 5/1~5/5가 휴무라 일본 발주·검사·선적이 10일 가까이 멈춥니다. **4월 20일까지 검사 완료**, 5월 중순 선적으로 잡으세요.',
           en: 'With 29 April and 1–5 May off, Japanese orders, inspection and shipping stall for nearly ten days. **Finish inspection by 20 April** and book mid-May sailings.',
           zh: '4/29与5/1–5/5连休，日本的订单、验货与出运几乎停十天。**4月20日前完成验货**，船期排在5月中旬。',
           ja: '4/29と5/1〜5/5が休みで、日本の発注・検査・出荷が10日ほど止まります。**4月20日までに検査完了**、5月中旬の船積みに。' } },
    { id: 'cn-nd', when: '2027-09-25 ~ 2027-10-12', n: { ko: '중국 국경절', en: 'National Day, China', zh: '中国国庆节', ja: '中国 国慶節' },
      t: { ko: '10/1~10/7 휴무에 중추절(9/15)이 붙어 9월 하순부터 물량이 몰립니다. **9월 20일 이전 선적**과 선복 확보를 먼저 하세요.',
           en: 'The 1–7 Oct break plus Mid-Autumn (15 Sep) makes late September tight. **Ship before 20 September** and secure space early.',
           zh: '10/1–10/7假期叠加中秋（9/15），9月下旬舱位紧张。请**9月20日前出运**并提早订舱。',
           ja: '10/1〜10/7の休みに中秋節（9/15）が重なり、9月下旬は混みます。**9月20日までの船積み**とスペース確保を先に。' } },
    { id: 'us-tg', when: '2027-11-20 ~ 2027-12-01', n: { ko: '미국 추수감사절', en: 'Thanksgiving, US', zh: '美国感恩节', ja: '米国 感謝祭' },
      t: { ko: '11/25 전후로 미국 바이어의 결재·입고가 밀립니다. 인보이스와 서류는 **11월 18일까지** 보내 두면 12월 초 입고에 맞습니다.',
           en: 'US approvals and receiving slow around 25 November. Send invoices and documents **by 18 November** to land in early December.',
           zh: '11/25前后美国客户审批与收货会延误。单据请在**11月18日前**发出，可赶上12月初入库。',
           ja: '11/25前後は米国バイヤーの承認・入庫が滞ります。書類は**11月18日まで**に送れば12月初旬の入庫に間に合います。' } },
    { id: 'year-end', when: '2027-12-20 ~ 2028-01-05', n: { ko: '연말 휴무', en: 'Year-end closures', zh: '年末休市', ja: '年末年始' },
      t: { ko: '일본 은행 12/31~1/3, 중국 원단 1/1~1/3, 한국 12/25·12/27이 겹칩니다. **12월 15일까지** 선적하고 결제일을 1월 중순으로 맞추세요.',
           en: 'Japanese banks close 31 Dec–3 Jan, China 1–3 Jan, Korea 25 and 27 Dec. Ship **by 15 December** and set payment dates for mid-January.',
           zh: '日本银行12/31–1/3、中国1/1–1/3、韩国12/25与12/27休市。请**12月15日前**出运，付款日定在1月中旬。',
           ja: '日本の銀行は12/31〜1/3、中国は1/1〜1/3、韓国は12/25・12/27が休みです。**12月15日まで**に船積みし、支払日は1月中旬に。' } }
  ];

  D.months = {
    ko: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
    en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    zh: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
    ja: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
  };

  window.IBG_DATA = D;
})();
