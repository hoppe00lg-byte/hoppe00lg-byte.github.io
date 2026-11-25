/* =========================================================
   INSIGHT BRIEF — 영문서식 추가분
   Purchase Order · Packing List · Commercial Invoice · Offer Letter ·
   Recommendation Letter · Resignation Letter · NDA (EN) ·
   Certificate of Employment (EN) · Invitation Letter
   영문 문구는 이 사이트에서 직접 작성했습니다.
   ========================================================= */
(function (root) {
  'use strict';
  var H = root.IBF;
  var DOCS = root.IBF_DOCS;
  var esc = H.esc, fmt = H.fmt, dko = H.dateKo, today = H.todayISO, sum = H.setSum, addD = H.addDays;
  function add(d) { DOCS[d.id] = d; return d; }
  function sec(h, v) { return { t: 'sec', h: h, v: v }; }
  function sign(parties, txt) { return { t: 'sign', parties: parties, note: txt == null ? null : (typeof txt === 'function' ? txt : function () { return txt; }) }; }
  function note(txt) { return { t: 'note', v: function () { return txt; } }; }
  function body(txt) { return { t: 'body', v: txt }; }

  /* ---------------------------------------------------------
     1. Purchase Order
  --------------------------------------------------------- */
  add({
    id: 'en-po', cat: 'en', sub: 'en-trade', no: '03', tpl: 'invoice',
    name: '영문 발주서 (Purchase Order)', en: 'PURCHASE ORDER',
    keywords: '영문 발주서 purchase order PO 수입 발주 해외 구매 오더',
    head: { sub: 'PURCHASE ORDER', meta: [['P/O No.', 'poNo'], ['Date', 'issueDate']] },
    parties: [{ k: 'A', label: 'Buyer', nameKey: 'buyer' }, { k: 'B', label: 'Seller', nameKey: 'seller' }],
    fields: [
      { g: 'Document', k: 'poNo', l: 'P/O No.', d: 'PO-2026-1124-01' },
      { g: 'Document', k: 'issueDate', l: 'Date', t: 'date', d: today() },
      { g: 'Document', k: 'refNo', l: 'Quotation Ref.', d: 'QT-2026-1105' },
      { g: 'Buyer', k: 'buyer', l: 'Buyer', d: 'Hanbit Trading Co., Ltd.' },
      { g: 'Buyer', k: 'buyerAddr', l: 'Buyer address', d: '120, Nadong-daero, Sasang-gu, Busan, Korea', w: 2 },
      { g: 'Buyer', k: 'buyerContact', l: 'Buyer contact', d: 'Tel +82-51-000-0000 / buying@example.com', w: 2 },
      { g: 'Seller', k: 'seller', l: 'Seller', d: 'Guangzhou Sunrise Plastics Co., Ltd.' },
      { g: 'Seller', k: 'sellerAddr', l: 'Seller address', d: 'No. 88, Huangpu East Road, Guangzhou, China', w: 2 },
      { g: 'Seller', k: 'sellerContact', l: 'Seller contact', d: 'Tel +86-20-0000-0000', w: 2 },
      { g: 'Terms', k: 'currency', l: 'Currency', t: 'sel', opts: ['USD', 'EUR', 'CNY', 'KRW'], d: 'USD' },
      { g: 'Terms', k: 'incoterms', l: 'Incoterms', t: 'sel', opts: ['FOB', 'CIF', 'CFR', 'EXW', 'DDP', 'FCA'], d: 'FOB' },
      { g: 'Terms', k: 'pol', l: 'Port of loading', d: 'NANSHA, CHINA' },
      { g: 'Terms', k: 'pod', l: 'Port of discharge', d: 'BUSAN, KOREA' },
      { g: 'Terms', k: 'shipDate', l: 'Shipment date', t: 'date', d: addD(today(), 20) },
      { g: 'Terms', k: 'payTerms', l: 'Payment terms', t: 'sel', opts: ['T/T 30 days', 'T/T in advance', 'L/C at sight', 'Net 30 after arrival'], d: 'T/T 30 days' },
      { g: 'Terms', k: 'packing', l: 'Packing', d: '25 kg bags in container, palletized', w: 2 },
      { g: 'Terms', k: 'remark', l: 'Remarks', t: 'area', d: '1) Please send the B/L draft before shipment.\n2) Certificate of analysis is required for each lot.\n3) Mark cartons with PO number.', w: 2, rows: 3 }
    ],
    sets: [{
      k: 'items', label: 'Order items', addLabel: 'Add item',
      cols: [
        { k: 'item', h: 'Description', w: '34%', d: 'Recycled PC pellets, black' },
        { k: 'spec', h: 'Specification', w: '24%', d: 'MFI 8-12, 25 kg bag' },
        { k: 'qty', h: 'Qty', t: 'num', w: '10%', d: '20000' },
        { k: 'unit', h: 'Unit', w: '10%', d: 'kg' },
        { k: 'price', h: 'Unit price', t: 'num', w: '12%', d: '1.05' },
        { k: 'amount', h: 'Amount', t: 'num', calc: function (r) { return H.num(r.qty) * H.num(r.price); } }
      ],
      def: [
        { item: 'Recycled PC pellets, black', spec: 'MFI 8-12, 25 kg bag', qty: '20000', unit: 'kg', price: '1.05' },
        { item: 'Recycled ABS pellets, grey', spec: 'MFI 10-15, 25 kg bag', qty: '5000', unit: 'kg', price: '1.18' }
      ]
    }],
    blocks: [
      { t: 'parties', cols: [
        { title: 'BUYER', rows: [['Company', 'buyer'], ['Address', 'buyerAddr'], ['Contact', 'buyerContact']] },
        { title: 'SELLER', rows: [['Company', 'seller'], ['Address', 'sellerAddr'], ['Contact', 'sellerContact']] }
      ] },
      { t: 'kv', rows: [['P/O No.', 'poNo'], ['Date', 'issueDate'], ['Incoterms', 'incoterms'], ['Loading port', 'pol'], ['Discharge port', 'pod'], ['Shipment date', 'shipDate'], ['Payment terms', 'payTerms'], ['Currency', 'currency']] },
      sec('Order details', function () { return 'Please supply the following goods in accordance with the terms stated in this Purchase Order.'; }),
      { t: 'table', set: 'items', head: ['Description', 'Specification', 'Qty', 'Unit', 'Unit price', 'Amount'], cols: [{ k: 'item', h: 'Description' }, { k: 'spec', h: 'Specification' }, { k: 'qty', h: 'Qty', t: 'num' }, { k: 'unit', h: 'Unit', t: 'center' }, { k: 'price', h: 'Unit price', t: 'num' }, { k: 'amount', h: 'Amount', t: 'num' }] },
      { t: 'sums', rows: [
        { l: 'Total amount', v: function (d) { return sum(d, 'items', 'amount'); }, unit: '', text: false },
        { l: 'Currency', v: function (d) { return d.f.currency; }, text: true }
      ] },
      sec('Packing', 'packing'),
      sec('Remarks', 'remark'),
      sec('Confirmation', function () { return 'The Seller confirms acceptance of this order by signing and returning a copy within 3 working days. This Purchase Order is governed by the terms stated above and any signed supply agreement between the parties.'; }),
      sign(['A', 'B'], function (d) { return 'Issued on ' + dko(d.f.issueDate) + ' · Buyer and Seller sign and stamp.'; }),
      note('※ 영문 발주서는 품명·규격·수량·단가·인코텀즈가 상업송장(Commercial Invoice)과 글자 단위로 같아야 통관·은행 심사에서 문제가 없습니다. 인코텀즈는 2020 기준 표기를 권합니다.')
    ]
  });

  /* ---------------------------------------------------------
     2. Packing List
  --------------------------------------------------------- */
  add({
    id: 'en-packing', cat: 'en', sub: 'en-trade', no: '04', tpl: 'invoice',
    name: '영문 패킹리스트 (Packing List)', en: 'PACKING LIST',
    keywords: '패킹리스트 packing list 포장 명세 수출 서류 중량 CBM 카톤',
    head: { sub: 'PACKING LIST', meta: [['Invoice No.', 'invNo'], ['Date', 'issueDate']] },
    parties: [{ k: 'A', label: 'Shipper', nameKey: 'shipper' }, { k: 'B', label: 'Consignee', nameKey: 'consignee' }],
    fields: [
      { g: 'Document', k: 'invNo', l: 'Invoice No.', d: 'CI-2026-1124-01' },
      { g: 'Document', k: 'issueDate', l: 'Date', t: 'date', d: today() },
      { g: 'Document', k: 'poNo', l: 'P/O No.', d: 'PO-2026-1124-01' },
      { g: 'Shipper', k: 'shipper', l: 'Shipper', d: 'Hanbit Trading Co., Ltd.' },
      { g: 'Shipper', k: 'shipperAddr', l: 'Shipper address', d: '120, Nadong-daero, Sasang-gu, Busan, Korea', w: 2 },
      { g: 'Consignee', k: 'consignee', l: 'Consignee', d: 'Guangzhou Sunrise Plastics Co., Ltd.' },
      { g: 'Consignee', k: 'consigneeAddr', l: 'Consignee address', d: 'No. 88, Huangpu East Road, Guangzhou, China', w: 2 },
      { g: 'Shipment', k: 'vessel', l: 'Vessel / Voyage', d: 'HANJIN BUSAN / 0234E' },
      { g: 'Shipment', k: 'container', l: 'Container No.', d: 'ABCD1234567' },
      { g: 'Shipment', k: 'seal', l: 'Seal No.', d: 'SL000000' },
      { g: 'Shipment', k: 'marks', l: 'Shipping marks', d: 'N/M' },
      { g: 'Shipment', k: 'origin', l: 'Country of origin', d: 'REPUBLIC OF KOREA' }
    ],
    sets: [{
      k: 'items', label: 'Packing details', addLabel: 'Add line',
      cols: [
        { k: 'item', h: 'Description', w: '30%', d: 'Recycled PC pellets' },
        { k: 'pkgs', h: 'Packages', t: 'num', w: '12%', d: '800' },
        { k: 'kind', h: 'Package type', w: '16%', d: '25kg bags' },
        { k: 'net', h: 'Net (kg)', t: 'num', w: '14%', d: '20000' },
        { k: 'gross', h: 'Gross (kg)', t: 'num', w: '14%', d: '20400' },
        { k: 'cbm', h: 'CBM', t: 'num', w: '14%', d: '18.5' }
      ],
      def: [
        { item: 'Recycled PC pellets', pkgs: '800', kind: '25kg bags', net: '20000', gross: '20400', cbm: '18.5' },
        { item: 'Recycled ABS pellets', pkgs: '200', kind: '25kg bags', net: '5000', gross: '5120', cbm: '4.6' }
      ]
    }],
    blocks: [
      { t: 'parties', cols: [
        { title: 'SHIPPER', rows: [['Company', 'shipper'], ['Address', 'shipperAddr']] },
        { title: 'CONSIGNEE', rows: [['Company', 'consignee'], ['Address', 'consigneeAddr']] }
      ] },
      { t: 'kv', rows: [['Invoice No.', 'invNo'], ['P/O No.', 'poNo'], ['Date', 'issueDate'], ['Vessel / Voyage', 'vessel'], ['Container No.', 'container'], ['Seal No.', 'seal'], ['Shipping marks', 'marks'], ['Country of origin', 'origin']] },
      { t: 'table', set: 'items', head: ['Description', 'Packages', 'Type', 'Net (kg)', 'Gross (kg)', 'CBM'], cols: [{ k: 'item', h: 'Description' }, { k: 'pkgs', h: 'Packages', t: 'num' }, { k: 'kind', h: 'Type', t: 'center' }, { k: 'net', h: 'Net (kg)', t: 'num' }, { k: 'gross', h: 'Gross (kg)', t: 'num' }, { k: 'cbm', h: 'CBM', t: 'num' }] },
      { t: 'sums', rows: [
        { l: 'Total packages', v: function (d) { return sum(d, 'items', 'pkgs'); }, unit: 'pcs' },
        { l: 'Total net weight', v: function (d) { return sum(d, 'items', 'net'); }, unit: 'kg' },
        { l: 'Total gross weight', v: function (d) { return sum(d, 'items', 'gross'); }, unit: 'kg' },
        { l: 'Total volume', v: function (d) { return H.fmt1(sum(d, 'items', 'cbm')); }, text: true, unit: 'CBM', grand: true }
      ] },
      body('We certify that the details above are true and correct. This packing list is issued for customs clearance and shipping purposes only.'),
      sign(['A'], function (d) { return 'Date ' + dko(d.f.issueDate) + ' · Signed for and on behalf of the Shipper.'; }),
      note('※ 패킹리스트의 포장 개수·순중량·총중량은 B/L과 상업송장의 값과 일치해야 합니다. 컨테이너 적입 시 CBM은 실제 적재 기준으로 적고, 환적이 있으면 최종 목적지까지 표기하세요.')
    ]
  });

  /* ---------------------------------------------------------
     3. Commercial Invoice
  --------------------------------------------------------- */
  add({
    id: 'en-commercial', cat: 'en', sub: 'en-trade', no: '05', tpl: 'invoice',
    name: '영문 상업송장 (Commercial Invoice)', en: 'COMMERCIAL INVOICE',
    keywords: '상업송장 commercial invoice 수출 인보이스 통관 원산지 인코텀즈',
    head: { sub: 'COMMERCIAL INVOICE', meta: [['Invoice No.', 'invNo'], ['Date', 'issueDate']] },
    parties: [{ k: 'A', label: 'Seller', nameKey: 'seller' }, { k: 'B', label: 'Buyer', nameKey: 'buyer' }],
    fields: [
      { g: 'Document', k: 'invNo', l: 'Invoice No.', d: 'CI-2026-1124-01' },
      { g: 'Document', k: 'issueDate', l: 'Date', t: 'date', d: today() },
      { g: 'Document', k: 'poNo', l: 'P/O No.', d: 'PO-2026-1124-01' },
      { g: 'Document', k: 'blNo', l: 'B/L No.', d: 'HJSB26011234' },
      { g: 'Seller', k: 'seller', l: 'Seller', d: 'Hanbit Trading Co., Ltd.' },
      { g: 'Seller', k: 'sellerAddr', l: 'Seller address', d: '120, Nadong-daero, Sasang-gu, Busan, Korea', w: 2 },
      { g: 'Buyer', k: 'buyer', l: 'Buyer', d: 'Guangzhou Sunrise Plastics Co., Ltd.' },
      { g: 'Buyer', k: 'buyerAddr', l: 'Buyer address', d: 'No. 88, Huangpu East Road, Guangzhou, China', w: 2 },
      { g: 'Terms', k: 'currency', l: 'Currency', t: 'sel', opts: ['USD', 'EUR', 'CNY', 'KRW'], d: 'USD' },
      { g: 'Terms', k: 'incoterms', l: 'Incoterms', d: 'FOB NANSHA' },
      { g: 'Terms', k: 'payTerms', l: 'Payment terms', d: 'T/T 30 days after B/L date' },
      { g: 'Terms', k: 'origin', l: 'Country of origin', d: 'REPUBLIC OF KOREA' },
      { g: 'Terms', k: 'hsCode', l: 'HS Code', d: '3907.40' },
      { g: 'Terms', k: 'vessel', l: 'Vessel / Voyage', d: 'HANJIN BUSAN / 0234E' },
      { g: 'Terms', k: 'etd', l: 'ETD', t: 'date', d: addD(today(), -3) }
    ],
    sets: [{
      k: 'items', label: 'Invoice items', addLabel: 'Add line',
      cols: [
        { k: 'item', h: 'Description of goods', w: '38%', d: 'Recycled polycarbonate pellets' },
        { k: 'hs', h: 'HS Code', w: '14%', d: '3907.40' },
        { k: 'qty', h: 'Qty (kg)', t: 'num', w: '14%', d: '20000' },
        { k: 'price', h: 'Unit price', t: 'num', w: '16%', d: '1.05' },
        { k: 'amount', h: 'Amount', t: 'num', calc: function (r) { return H.num(r.qty) * H.num(r.price); } }
      ],
      def: [
        { item: 'Recycled polycarbonate pellets', hs: '3907.40', qty: '20000', price: '1.05' },
        { item: 'Recycled ABS pellets', hs: '3903.30', qty: '5000', price: '1.18' }
      ]
    }],
    blocks: [
      { t: 'parties', cols: [
        { title: 'SELLER', rows: [['Company', 'seller'], ['Address', 'sellerAddr']] },
        { title: 'BUYER', rows: [['Company', 'buyer'], ['Address', 'buyerAddr']] }
      ] },
      { t: 'kv', rows: [['Invoice No.', 'invNo'], ['Date', 'issueDate'], ['P/O No.', 'poNo'], ['B/L No.', 'blNo'], ['Incoterms', 'incoterms'], ['Payment terms', 'payTerms'], ['Country of origin', 'origin'], ['Vessel', 'vessel']] },
      { t: 'table', set: 'items', head: ['Description of goods', 'HS Code', 'Qty (kg)', 'Unit price', 'Amount'], cols: [{ k: 'item', h: 'Description of goods' }, { k: 'hs', h: 'HS Code', t: 'center' }, { k: 'qty', h: 'Qty (kg)', t: 'num' }, { k: 'price', h: 'Unit price', t: 'num' }, { k: 'amount', h: 'Amount', t: 'num' }] },
      { t: 'sums', rows: [
        { l: 'FOB value', v: function (d) { return sum(d, 'items', 'amount'); }, unit: '', text: false },
        { l: 'Freight', v: function () { return 0; }, unit: '', text: false },
        { l: 'Insurance', v: function () { return 0; }, unit: '', text: false },
        { l: 'Total invoice value', v: function (d) { return sum(d, 'items', 'amount'); }, unit: '', text: false, grand: true }
      ] },
      sec('Declaration', function (d) {
        return 'We certify that the goods described above are of ' + d.f.origin + ' origin, that the invoice shows the actual price of the goods, and that all particulars are true and correct. Currency: ' + d.f.currency + '.';
      }),
      sign(['A'], function (d) { return 'Date ' + dko(d.f.issueDate) + ' · Authorized signature and company stamp.'; }),
      note('※ 상업송장 금액·품명·HS코드는 B/L·패킹리스트와 일치해야 하며, 원산지 표기는 FTA 협정별 원산지증명서와 어긋나면 관세 혜택이 취소될 수 있습니다. 인코텀즈에 따라 운임·보험료를 별도 표기하세요.')
    ]
  });

  /* ---------------------------------------------------------
     4. Offer Letter
  --------------------------------------------------------- */
  add({
    id: 'en-offer', cat: 'en', sub: 'en-hire', no: '02', tpl: 'doc',
    name: '영문 채용 오퍼레터 (Offer Letter)', en: 'OFFER LETTER',
    keywords: '오퍼레터 offer letter 채용 제안 영문 입사 제안 연봉 조건',
    head: { sub: 'OFFER LETTER', meta: [['Date', 'issueDate'], ['Position', 'position']] },
    parties: [{ k: 'A', label: 'Company', nameKey: 'company' }, { k: 'B', label: 'Candidate', nameKey: 'candidate' }],
    fields: [
      { g: 'Company', k: 'company', l: 'Company', d: 'Insight Brief Co., Ltd.' },
      { g: 'Company', k: 'ceo', l: 'Representative', d: 'Gil-dong Hong' },
      { g: 'Company', k: 'addr', l: 'Address', d: '108, Yeouidae-ro, Yeongdeungpo-gu, Seoul, Korea', w: 2 },
      { g: 'Candidate', k: 'candidate', l: 'Candidate name', d: 'Chul-soo Kim' },
      { g: 'Candidate', k: 'candAddr', l: 'Candidate address', d: 'Seoul, Korea', w: 2 },
      { g: 'Position', k: 'position', l: 'Position', d: 'Sales Manager' },
      { g: 'Position', k: 'dept', l: 'Department', d: 'Sales Division' },
      { g: 'Position', k: 'startDate', l: 'Start date', t: 'date', d: addD(today(), 30) },
      { g: 'Position', k: 'reportTo', l: 'Reports to', d: 'Director of Sales' },
      { g: 'Compensation', k: 'base', l: 'Annual base salary', d: 'KRW 38,400,000' },
      { g: 'Compensation', k: 'bonus', l: 'Bonus', d: 'Up to 10% of annual base, based on performance' },
      { g: 'Compensation', k: 'benefits', l: 'Benefits', t: 'area', d: 'National pension, health insurance, employment insurance and industrial accident insurance; 15 days of annual leave; 200,000 KRW monthly meal allowance.', w: 2, rows: 2 },
      { g: 'Position', k: 'probation', l: 'Probation', d: '3 months' },
      { g: 'Position', k: 'deadline', l: 'Acceptance deadline', t: 'date', d: addD(today(), 7) },
      { g: 'Position', k: 'issueDate', l: 'Date', t: 'date', d: today() }
    ],
    blocks: [
      { t: 'kv', rows: [['Company', 'company'], ['Candidate', 'candidate'], ['Position', 'position'], ['Department', 'dept'], ['Start date', 'startDate'], ['Reports to', 'reportTo']] },
      sec('Dear Sir or Madam,', function () { return ''; }),
      body('We are pleased to offer you the position of the role described above. We were impressed by your experience and believe you will contribute greatly to our team.'),
      sec('1. Position and start date', function (d) { return 'You will join the ' + d.f.dept + ' as ' + d.f.position + ', reporting to the ' + d.f.reportTo + '. Your expected start date is ' + d.f.startDate + '.'; }),
      sec('2. Compensation', function (d) { return 'Your annual base salary will be ' + d.f.base + ', paid in 12 monthly instalments. ' + d.f.bonus + '.'; }),
      sec('3. Benefits', 'benefits'),
      sec('4. Probation', function (d) { return 'The first ' + d.f.probation + ' is a probationary period. During this period either party may terminate the employment with two weeks written notice. After probation, the notice period follows local labour law and company policy.'; }),
      sec('5. Acceptance', function (d) { return 'Please confirm your acceptance by signing and returning this letter by ' + d.f.deadline + '. If we do not hear from you by that date, this offer may be withdrawn.'; }),
      body('We look forward to welcoming you to our team.'),
      sign(['A', 'B'], function (d) { return 'Date ' + dko(d.f.issueDate) + ' · Company representative and candidate sign.'; }),
      note('※ 오퍼레터의 연봉·수당·수습기간은 실제 근로계약서와 같아야 합니다. 한국 근무자는 근로기준법이 우선하므로, 영문 오퍼레터와 별도로 국문 근로계약서를 함께 작성하는 것이 안전합니다.')
    ]
  });

  /* ---------------------------------------------------------
     5. Recommendation Letter
  --------------------------------------------------------- */
  add({
    id: 'en-recommend', cat: 'en', sub: 'en-letter', no: '04', tpl: 'doc',
    name: '영문 추천서 (Recommendation Letter)', en: 'LETTER OF RECOMMENDATION',
    keywords: '추천서 영문 recommendation letter 추천 레퍼런스 채용 지원 유학',
    head: { sub: 'LETTER OF RECOMMENDATION', meta: [['Date', 'issueDate'], ['Candidate', 'candidate']] },
    parties: [{ k: 'A', label: 'Recommender', nameKey: 'writer' }],
    fields: [
      { g: 'Candidate', k: 'candidate', l: 'Candidate', d: 'Chul-soo Kim' },
      { g: 'Candidate', k: 'position', l: 'Position applied for', d: 'Logistics Team Leader' },
      { g: 'Recommender', k: 'writer', l: 'Recommender', d: 'Gil-dong Hong' },
      { g: 'Recommender', k: 'title', l: 'Title / Company', d: 'Sales Director, Insight Brief Co., Ltd.' },
      { g: 'Recommender', k: 'relation', l: 'Relationship', d: 'Direct supervisor for 4 years' },
      { g: 'Recommender', k: 'contact', l: 'Contact', d: 'gil@example.com / +82-2-0000-0000', w: 2 },
      { g: 'Letter', k: 'body', l: 'Recommendation', t: 'area', d: 'I am writing to recommend Chul-soo Kim for the position of Logistics Team Leader. He worked in my team for four years, managing import clearance, inventory and delivery schedules for 18 accounts.\n\nHe is precise and calm under pressure. When a vessel delay threatened a customer delivery, he arranged an alternative carrier within a day and kept the customer informed at every step. He also introduced a simple pre-check list for shipping documents, which reduced clearance delays by about two and a half days on average.\n\nHe is the person colleagues go to when a schedule looks impossible. I recommend him without reservation.', w: 2, rows: 12 },
      { g: 'Letter', k: 'closing', l: 'Closing', d: 'Please feel free to contact me if you need further information.', w: 2 },
      { g: 'Letter', k: 'issueDate', l: 'Date', t: 'date', d: today() }
    ],
    blocks: [
      { t: 'kv', rows: [['To', function () { return 'Hiring Committee'; }], ['Candidate', 'candidate'], ['Position', 'position'], ['From', 'writer'], ['Title', 'title'], ['Relationship', 'relation']] },
      sec('Recommendation', 'body'),
      body('closing'),
      sec('Sincerely,', function (d) { return d.f.writer + '\n' + d.f.title + '\n' + d.f.contact; }),
      sign(['A'], function (d) { return 'Date ' + dko(d.f.issueDate) + ' · Recommender signature.'; }),
      note('※ 추천서는 구체적인 사례와 결과가 있어야 설득력이 있습니다. 지원자가 동의한 범위의 정보만 쓰고, 추천인의 연락처는 지원자에게 먼저 알린 뒤 기재하세요.')
    ]
  });

  /* ---------------------------------------------------------
     6. Resignation Letter (EN)
  --------------------------------------------------------- */
  add({
    id: 'en-resign', cat: 'en', sub: 'en-hire', no: '03', tpl: 'doc',
    name: '영문 사직서 (Resignation Letter)', en: 'RESIGNATION LETTER',
    keywords: '영문 사직서 resignation letter 사직 통보 퇴사 영문 레터',
    head: { sub: 'RESIGNATION LETTER', meta: [['Date', 'issueDate'], ['Last working day', 'lastDate']] },
    parties: [{ k: 'A', label: 'Employee', nameKey: 'name' }, { k: 'B', label: 'Manager', nameKey: 'manager' }],
    fields: [
      { g: 'Employee', k: 'name', l: 'Employee', d: 'Chul-soo Kim' },
      { g: 'Employee', k: 'dept', l: 'Department', d: 'Sales Division' },
      { g: 'Employee', k: 'position', l: 'Position', d: 'Assistant Manager' },
      { g: 'Management', k: 'manager', l: 'Addressed to', d: 'Gil-dong Hong, Sales Director' },
      { g: 'Management', k: 'company', l: 'Company', d: 'Insight Brief Co., Ltd.' },
      { g: 'Notice', k: 'issueDate', l: 'Date', t: 'date', d: today() },
      { g: 'Notice', k: 'lastDate', l: 'Last working day', t: 'date', d: addD(today(), 30) },
      { g: 'Notice', k: 'reason', l: 'Reason (optional)', d: 'to pursue a new career opportunity', w: 2 },
      { g: 'Notice', k: 'handover', l: 'Handover', t: 'area', d: 'I will complete the December delivery schedule, update the account files, and brief Ms. Young-hee Park on all open matters before my last day.', w: 2, rows: 3 }
    ],
    blocks: [
      { t: 'kv', rows: [['To', 'manager'], ['Company', 'company'], ['Employee', 'name'], ['Department', 'dept'], ['Last working day', 'lastDate']] },
      { t: 'body', v: function (d) { return 'Dear ' + d.f.manager + ','; } },
      { t: 'body', v: function (d) { return 'Please accept this letter as formal notice of my resignation from my position as ' + d.f.position + ' at ' + d.f.company + ', effective as of my last working day noted above.'; } },
      sec('Reason', function (d) { return 'I have decided to resign ' + d.f.reason + '. I am grateful for the opportunities I have had here and for the support of my colleagues over the past four years.'; }),
      sec('Handover', 'handover'),
      body('Thank you for the guidance and trust you have given me. I wish the company continued success.'),
      body('Sincerely,'),
      sign(['A', 'B'], function (d) { return 'Date ' + dko(d.f.issueDate) + ' · Employee signature and manager acknowledgement.'; }),
      note('※ 영문 사직서는 통보일과 마지막 근무일을 명확히 적는 것이 핵심입니다. 한국 근무자는 근로계약서·취업규칙의 사직 예고 기간(보통 30일)을 함께 확인하세요.')
    ]
  });

  /* ---------------------------------------------------------
     7. NDA (English)
  --------------------------------------------------------- */
  add({
    id: 'en-nda', cat: 'en', sub: 'en-poa', no: '03', tpl: 'doc',
    name: '영문 비밀유지계약서 (NDA)', en: 'NON-DISCLOSURE AGREEMENT',
    keywords: '영문 NDA 비밀유지계약 영문 기밀유지 해외 거래 confidentiality agreement',
    head: { sub: 'NON-DISCLOSURE AGREEMENT', meta: [['Date', 'signDate'], ['Term', 'term']] },
    parties: [{ k: 'A', label: 'Disclosing Party', nameKey: 'aName' }, { k: 'B', label: 'Receiving Party', nameKey: 'bName' }],
    fields: [
      { g: 'Disclosing party', k: 'aName', l: 'Company', d: 'Hanbit Trading Co., Ltd.' },
      { g: 'Disclosing party', k: 'aAddr', l: 'Address', d: '120, Nadong-daero, Sasang-gu, Busan, Korea', w: 2 },
      { g: 'Receiving party', k: 'bName', l: 'Company', d: 'Guangzhou Sunrise Plastics Co., Ltd.' },
      { g: 'Receiving party', k: 'bAddr', l: 'Address', d: 'No. 88, Huangpu East Road, Guangzhou, China', w: 2 },
      { g: 'Terms', k: 'purpose', l: 'Purpose', d: 'evaluating a potential supply agreement for recycled plastic pellets', w: 2 },
      { g: 'Terms', k: 'term', l: 'Confidentiality period', d: 'three (3) years from the date of this Agreement' },
      { g: 'Terms', k: 'law', l: 'Governing law', d: 'the laws of the Republic of Korea' },
      { g: 'Terms', k: 'court', l: 'Jurisdiction', d: 'Seoul Central District Court' },
      { g: 'Terms', k: 'signDate', l: 'Date', t: 'date', d: today() }
    ],
    blocks: [
      { t: 'parties', cols: [
        { title: 'DISCLOSING PARTY', rows: [['Company', 'aName'], ['Address', 'aAddr']] },
        { title: 'RECEIVING PARTY', rows: [['Company', 'bName'], ['Address', 'bAddr']] }
      ] },
      sec('1. Purpose', function (d) { return 'The parties wish to exchange information for the purpose of ' + d.f.purpose + '. This Agreement sets out how that information must be protected.'; }),
      sec('2. Confidential Information', function () {
        return 'Confidential Information means any non-public information disclosed by one party to the other, in any form, including prices, customer and supplier lists, specifications, test reports, formulations, drawings, business plans and the terms of any discussion between the parties.';
      }),
      sec('3. Obligations', function () {
        return 'The Receiving Party shall (a) use Confidential Information only for the Purpose; (b) not disclose it to any third party without prior written consent; (c) protect it with at least the same care it uses for its own confidential information; and (d) limit access to employees and advisers who need to know and are bound by equivalent obligations.';
      }),
      sec('4. Exclusions', function () {
        return 'Confidential Information does not include information that is or becomes public without breach of this Agreement, was lawfully known to the Receiving Party before disclosure, or is lawfully obtained from a third party without restriction.';
      }),
      sec('5. Return or Destruction', function () { return 'Upon written request, the Receiving Party shall return or destroy all Confidential Information and confirm the destruction in writing, except for one copy retained for legal compliance.'; }),
      sec('6. Term', function (d) { return 'The obligations in this Agreement survive for ' + d.f.term + ', regardless of whether the parties proceed with the Purpose.'; }),
      sec('7. Remedies and Governing Law', function (d) { return 'The parties agree that breach of this Agreement may cause irreparable harm, and that injunctive relief is available in addition to damages. This Agreement is governed by ' + d.f.law + ', and the parties submit to the exclusive jurisdiction of the ' + d.f.court + '.'; }),
      body('IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first written above.'),
      sign(['A', 'B'], function (d) { return 'Date ' + dko(d.f.signDate) + ' · Signed by authorized representatives of both parties.'; }),
      note('※ 영문 NDA는 준거법·관할 법원을 반드시 정해야 합니다. 중국·동남아 거래처와는 중재(arbitration) 조항을 선호하는 경우가 많으니 상대와 협의해 조항을 바꾸세요.')
    ]
  });

  /* ---------------------------------------------------------
     8. Certificate of Employment (EN)
  --------------------------------------------------------- */
  add({
    id: 'en-employment-cert', cat: 'en', sub: 'en-cert', no: '02', tpl: 'cert',
    name: '영문 재직·경력증명서 (Certificate of Employment)', en: 'CERTIFICATE OF EMPLOYMENT',
    keywords: '영문 재직증명서 경력증명서 certificate of employment 해외 제출 비자',
    head: { sub: 'CERTIFICATE OF EMPLOYMENT', meta: [['Date', 'issueDate'], ['Certificate No.', 'certNo']] },
    parties: [{ k: 'A', label: 'Company', nameKey: 'company' }, { k: 'B', label: 'Employee', nameKey: 'name' }],
    fields: [
      { g: 'Company', k: 'company', l: 'Company', d: 'Insight Brief Co., Ltd.' },
      { g: 'Company', k: 'ceo', l: 'Representative', d: 'Gil-dong Hong' },
      { g: 'Company', k: 'bizNo', l: 'Business registration No.', d: '000-00-00000' },
      { g: 'Company', k: 'addr', l: 'Address', d: '108, Yeouidae-ro, Yeongdeungpo-gu, Seoul, Korea', w: 2 },
      { g: 'Company', k: 'tel', l: 'Telephone', d: '+82-2-0000-0000' },
      { g: 'Employee', k: 'name', l: 'Employee name', d: 'Chul-soo Kim' },
      { g: 'Employee', k: 'birth', l: 'Date of birth', d: '1990-01-01' },
      { g: 'Employee', k: 'passport', l: 'Passport No.', d: 'M00000000' },
      { g: 'Employee', k: 'dept', l: 'Department', d: 'Sales Division' },
      { g: 'Employee', k: 'position', l: 'Position', d: 'Assistant Manager' },
      { g: 'Employee', k: 'joinDate', l: 'Date of joining', t: 'date', d: '2021-03-02' },
      { g: 'Employee', k: 'leaveDate', l: 'Date of resignation', d: '(currently employed)' },
      { g: 'Employment', k: 'purpose', l: 'Purpose', d: 'visa application', w: 2 },
      { g: 'Employment', k: 'salary', l: 'Annual salary', d: 'KRW 38,400,000' },
      { g: 'Employment', k: 'certNo', l: 'Certificate No.', d: 'CE-2026-1124-01' },
      { g: 'Employment', k: 'issueDate', l: 'Date of issue', t: 'date', d: today() }
    ],
    blocks: [
      { t: 'title', v: 'CERTIFICATE OF EMPLOYMENT' },
      { t: 'kv', rows: [['Company', 'company'], ['Business registration No.', 'bizNo'], ['Address', 'addr'], ['Certificate No.', 'certNo'], ['Date of issue', 'issueDate']] },
      sec('TO WHOM IT MAY CONCERN', function (d) { return 'This is to certify that the person named below is employed by ' + d.f.company + '. This certificate is issued at the request of the employee for the purpose of ' + d.f.purpose + '.'; }),
      { t: 'kv', rows: [['Name', 'name'], ['Date of birth', 'birth'], ['Passport No.', 'passport'], ['Department', 'dept'], ['Position', 'position'], ['Date of joining', function (d) { return dko(d.f.joinDate); }], ['Date of resignation', 'leaveDate'], ['Annual salary', 'salary']] },
      body('I confirm that the above information is true and correct as of the date of issue.'),
      sign(['A'], function (d) { return 'Date ' + dko(d.f.issueDate) + ' · Authorized signature and company seal.'; }),
      note('※ 해외 제출용 재직증명서는 아포스티유(Apostille) 또는 영사확인이 필요할 수 있습니다. 여권번호 등 민감 정보는 제출처가 요구할 때만 표기하세요.')
    ]
  });

  /* ---------------------------------------------------------
     9. Invitation Letter (EN)
  --------------------------------------------------------- */
  add({
    id: 'en-invitation', cat: 'en', sub: 'en-letter', no: '05', tpl: 'doc',
    name: '영문 초청장 (Invitation Letter)', en: 'LETTER OF INVITATION',
    keywords: '영문 초청장 invitation letter 비자 초청 방문 초대 해외 바이어',
    head: { sub: 'LETTER OF INVITATION', meta: [['Date', 'issueDate'], ['Visit period', 'period']] },
    parties: [{ k: 'A', label: 'Host', nameKey: 'host' }, { k: 'B', label: 'Guest', nameKey: 'guest' }],
    fields: [
      { g: 'Host', k: 'host', l: 'Host company', d: 'Hanbit Trading Co., Ltd.' },
      { g: 'Host', k: 'hostCeo', l: 'Representative', d: 'Gil-dong Hong' },
      { g: 'Host', k: 'hostAddr', l: 'Address', d: '120, Nadong-daero, Sasang-gu, Busan, Korea', w: 2 },
      { g: 'Host', k: 'hostContact', l: 'Contact', d: '+82-51-000-0000 / host@example.com', w: 2 },
      { g: 'Guest', k: 'guest', l: 'Guest name', d: 'Wei Zhang' },
      { g: 'Guest', k: 'passport', l: 'Passport No.', d: 'E00000000' },
      { g: 'Guest', k: 'nationality', l: 'Nationality', d: 'China' },
      { g: 'Guest', k: 'guestCompany', l: 'Guest company', d: 'Guangzhou Sunrise Plastics Co., Ltd.' },
      { g: 'Visit', k: 'purpose', l: 'Purpose of visit', d: 'business meeting and factory inspection', w: 2 },
      { g: 'Visit', k: 'period', l: 'Visit period', d: '2027-01-12 ~ 2027-01-16', w: 2 },
      { g: 'Visit', k: 'address', l: 'Place to stay', d: '○○ Hotel, Busan, Korea', w: 2 },
      { g: 'Visit', k: 'cover', l: 'Cost coverage', t: 'sel', opts: ['Host covers accommodation', 'Guest covers all costs', 'Shared'], d: 'Host covers accommodation' },
      { g: 'Visit', k: 'issueDate', l: 'Date', t: 'date', d: today() }
    ],
    blocks: [
      { t: 'kv', rows: [['To', function () { return 'The Consular Officer, Embassy of the Republic of Korea'; }], ['Host', 'host'], ['Guest', 'guest'], ['Passport No.', 'passport'], ['Nationality', 'nationality'], ['Visit period', 'period']] },
      sec('Letter of Invitation', function (d) {
        return 'Dear Sir or Madam,\n\nWe, ' + d.f.host + ', hereby invite ' + d.f.guest + ' (' + d.f.nationality + ', Passport No. ' + d.f.passport + ') of ' + d.f.guestCompany + ' to visit our company in Korea for the purpose of ' + d.f.purpose + ' from ' + d.f.period + '.';
      }),
      sec('Purpose and schedule', function (d) {
        return 'During the visit, the guest will attend business meetings at our office and inspect our warehouse facilities. The guest will stay at ' + d.f.address + ' and will return to China at the end of the visit.';
      }),
      sec('Costs', function (d) { return 'Coverage of costs: ' + d.f.cover + '. The guest will comply with all applicable laws during the stay and will not engage in any employment or paid activity.'; }),
      body('We would appreciate your kind consideration of the guest’s visa application. Please contact us if any further documentation is required.'),
      body('Sincerely,'),
      sign(['A', 'B'], function (d) { return 'Date ' + dko(d.f.issueDate) + ' · Host signature and company seal.'; }),
      note('※ 초청장은 비자 심사 참고 자료로, 초청 사실과 체류 기간·비용 부담 주체를 분명히 적어야 합니다. 실제 숙소 예약과 항공권이 초청장 내용과 맞아야 합니다.')
    ]
  });
})(typeof window !== 'undefined' ? window : this);
