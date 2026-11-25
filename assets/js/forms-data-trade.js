/* =========================================================
   INSIGHT BRIEF — 무역·물류 서식 (B/L Instruction · B/L · 선적서류 체크리스트)
   문구·표 구성·레이아웃은 이 사이트에서 직접 작성한 자체 표준 서식입니다.
   외부 선사·포워더 양식이나 서식 사이트의 파일을 복제하지 않았습니다.
   ========================================================= */
(function (root) {
  'use strict';
  var H = root.IBF;
  var DOCS = root.IBF_DOCS;
  var esc = H.esc, text = H.text, fmt = H.fmt, dko = H.dateKo, today = H.todayISO, sum = H.setSum, addD = H.addDays;

  function add(d) { DOCS[d.id] = d; return d; }
  function tx(spec, d) { var v = text(spec, d); return v ? esc(v) : '—'; }
  function cell(lb, spec, d, cls) {
    return '<div class="td-cell' + (cls ? ' ' + cls : '') + '"><span class="lb">' + esc(lb) + '</span>' +
      '<span class="v">' + tx(spec, d) + '</span></div>';
  }
  function box(lb, spec, d) {
    return '<div class="td-box"><span class="lb">' + esc(lb) + '</span><div class="v">' + tx(spec, d) + '</div></div>';
  }
  function wm(f) {
    var raw = String(f.issueType || f.blType || 'ORIGINAL').toUpperCase();
    var t = raw.indexOf('SURR') >= 0 ? 'SURRENDER' : raw.indexOf('SEA') >= 0 ? 'SEAWAY BILL' : raw.indexOf('COPY') >= 0 ? 'COPY' : 'ORIGINAL';
    return '<div class="td-wm">' + esc(t) + '</div>';
  }
  function chip(f) {
    var raw = String(f.issueType || f.blType || 'ORIGINAL').toUpperCase();
    var t = raw.indexOf('SURR') >= 0 ? 'SURRENDER' : raw.indexOf('SEA') >= 0 ? 'SEAWAY BILL' : raw.indexOf('COPY') >= 0 ? 'COPY' : 'ORIGINAL';
    return '<span class="td-chip ' + (t === 'SURRENDER' ? 'sur' : t === 'SEAWAY BILL' ? 'sea' : t === 'COPY' ? 'copy' : 'ori') + '">' + esc(t) + '</span>';
  }

  /* ---------------------------------------------------------
     1. B/L Instruction (선적지시서 · S/I)
  --------------------------------------------------------- */
  function siRaw(d) {
    var f = d.f;
    var h = '<div class="fm-tdoc td-si" id="td-si">' + wm(f);
    h += '<div class="td-top"><div><div class="td-kicker">SHIPPING INSTRUCTION · 선적지시서</div>' +
      '<div class="td-title">B/L INSTRUCTION</div>' +
      '<div class="td-sub">SHIPPER’S INSTRUCTION TO FORWARDER / CARRIER</div></div>' +
      '<div class="td-topr">' + chip(f) + '<table class="td-meta"><tr><th>S/I No.</th><td>' + tx('siNo', d) + '</td></tr>' +
      '<tr><th>Date</th><td>' + esc(dko(f.siDate)) + '</td></tr>' +
      '<tr><th>Booking No.</th><td>' + tx('bookingNo', d) + '</td></tr>' +
      '<tr><th>B/L Type</th><td>' + tx('blType', d) + '</td></tr></table></div></div>';

    h += '<div class="td-grid3">' + box('SHIPPER (송하인)', 'shipperBlock', d) + box('CONSIGNEE (수하인)', 'consigneeBlock', d) + box('NOTIFY PARTY (통지처)', 'notifyBlock', d) + '</div>';

    h += '<div class="td-cells c4">' +
      cell('VESSEL / VOYAGE', 'vesselLine', d) + cell('PORT OF LOADING', 'pol', d) +
      cell('PORT OF DISCHARGE', 'pod', d) + cell('FINAL DESTINATION', 'finalDest', d) +
      cell('ETD (출항예정일)', 'etd', d) + cell('FREIGHT TERMS', 'freightTerms', d) +
      cell('CONTAINER NO.', 'containerNo', d) + cell('SEAL NO.', 'sealNo', d) +
      cell('CONTAINER TYPE', 'containerType', d) + cell('MARKS & NUMBERS', 'marks', d) +
      cell('CARRIER / FORWARDER', 'carrier', d) + cell('ORIGINAL B/L', 'noOfOriginals', d) +
      '</div>';

    var rows = d.sets.cargo || [];
    h += '<table class="td-tbl tbl-cargo"><thead><tr>' +
      '<th style="width:13%">Marks &amp; Numbers</th><th style="width:31%">Description of Goods</th>' +
      '<th style="width:12%">HS Code</th><th style="width:10%">Packages</th>' +
      '<th style="width:12%">Gross Wt (kg)</th><th style="width:11%">Net Wt (kg)</th><th style="width:11%">CBM</th></tr></thead><tbody>';
    rows.forEach(function (r) {
      h += '<tr><td>' + esc(r.marks || '') + '</td><td class="l">' + esc(r.desc || '') + '</td><td class="c">' + esc(r.hs || '') +
        '</td><td class="c">' + esc(r.pkgs || '') + '</td><td class="r">' + (r.gross === '' ? '' : fmt(r.gross)) +
        '</td><td class="r">' + (r.net === '' ? '' : fmt(r.net)) + '</td><td class="r">' + (r.cbm === '' ? '' : H.fmt1(r.cbm)) + '</td></tr>';
    });
    for (var i = 0; i < Math.max(0, 3 - rows.length); i++) {
      h += '<tr class="empty"><td>&nbsp;</td><td></td><td></td><td></td><td></td><td></td><td></td></tr>';
    }
    h += '</tbody><tfoot><tr><td colspan="3" class="r">TOTAL</td><td class="c">' + esc(f.pkgsTotal || '') + '</td>' +
      '<td class="r">' + fmt(sum(d, 'cargo', 'gross')) + '</td><td class="r">' + fmt(sum(d, 'cargo', 'net')) + '</td>' +
      '<td class="r">' + H.fmt1(sum(d, 'cargo', 'cbm')) + '</td></tr></tfoot></table>';

    h += '<div class="td-sec"><span class="lb">SPECIAL INSTRUCTIONS (특기사항)</span><div class="v">' + (esc(f.special || '') || '—') + '</div></div>';
    h += '<div class="td-foot"><div class="td-cell"><span class="lb">ISSUED BY (SHIPPER)</span>' +
      '<div class="td-sigwrap">' + H.signBoxFor(d, 'A') + '</div></div>' +
      '<div class="td-cell"><span class="lb">RECEIVED / CONFIRMED (FORWARDER)</span>' +
      '<div class="td-sigwrap">' + H.signBoxFor(d, 'B') + '</div></div></div>';
    h += '<div class="td-note">※ 이 선적지시서는 화주가 포워더·선사에 B/L 발행 내용을 지시하기 위해 쓰는 자체 표준 서식입니다. 실제 선하증권 발행·운송계약은 선사와 포워더가 맡습니다. B/L의 Shipper·Consignee·Notify, 품명·수량·중량은 Commercial Invoice·Packing List와 글자 단위로 일치해야 통관·은행 심사에서 문제가 없습니다.</div>';
    h += '</div>';
    return h;
  }

  add({
    id: 'blsi', cat: 'trade', sub: 'tr-bl', no: '01', tpl: 'si',
    name: 'B/L Instruction (선적지시서)', en: 'SHIPPING INSTRUCTION',
    keywords: '비엘인스트럭션 선적지시서 SI shipping instruction 선하증권 지시 선적 서류 수출 수입 포워더 B/L',
    parties: [{ k: 'A', label: '화주', nameKey: 'shipperName' }, { k: 'B', label: '포워더 확인', nameKey: 'carrier' }],
    raw: siRaw,
    fields: [
      { g: '문서 정보', k: 'siNo', l: 'S/I 번호', d: 'SI-2026-1123-01' },
      { g: '문서 정보', k: 'siDate', l: '작성일', t: 'date', d: today() },
      { g: '문서 정보', k: 'bookingNo', l: '부킹번호', d: 'BK-00000000' },
      { g: '문서 정보', k: 'blType', l: 'B/L 종류', t: 'sel', opts: ['ORIGINAL (원본)', 'SURRENDER (서렌더)', 'SEAWAY BILL', 'COPY (사본)'], d: 'ORIGINAL (원본)', w: 2 },
      { g: '당사자', k: 'shipperName', l: 'Shipper 상호', d: 'Hanbit Trading Co., Ltd.' },
      { g: '당사자', k: 'shipperContact', l: 'Shipper 연락처', d: 'Tel +82-53-000-0000 / trade@hanbit-trade.example', w: 2 },
      { g: '당사자', k: 'shipperAddr', l: 'Shipper 주소', t: 'area', d: '120, Nadong-daero, Sasang-gu, Busan, Korea', w: 2, rows: 2 },
      { g: '당사자', k: 'shipperBlock', l: 'Shipper 표기(문서에 그대로)', t: 'area', d: 'Hanbit Trading Co., Ltd.\n120, Nadong-daero, Sasang-gu, Busan, Korea\nTel +82-53-000-0000', w: 2, rows: 3 },
      { g: '당사자', k: 'consigneeName', l: 'Consignee 상호', d: 'Guangzhou Sunrise Plastics Co., Ltd.' },
      { g: '당사자', k: 'consigneeTel', l: 'Consignee 연락처', d: 'Tel +86-20-0000-0000', w: 2 },
      { g: '당사자', k: 'consigneeAddr', l: 'Consignee 주소', t: 'area', d: 'No. 88, Huangpu East Road, Huangpu District, Guangzhou, China', w: 2, rows: 2 },
      { g: '당사자', k: 'consigneeBlock', l: 'Consignee 표기(문서에 그대로)', t: 'area', d: 'Guangzhou Sunrise Plastics Co., Ltd.\nNo. 88, Huangpu East Road, Huangpu District, Guangzhou, China\nTel +86-20-0000-0000', w: 2, rows: 3 },
      { g: '당사자', k: 'notifyBlock', l: 'Notify Party 표기', t: 'area', d: 'SAME AS CONSIGNEE', w: 2, rows: 3 },
      { g: '운송', k: 'vesselLine', l: 'Vessel / Voyage', d: 'HANJIN BUSAN / 0234E' },
      { g: '운송', k: 'pol', l: 'Port of Loading', d: 'BUSAN, KOREA' },
      { g: '운송', k: 'pod', l: 'Port of Discharge', d: 'NANSHA, CHINA' },
      { g: '운송', k: 'finalDest', l: 'Final Destination', d: 'GUANGZHOU, CHINA' },
      { g: '운송', k: 'etd', l: '출항예정일(ETD)', t: 'date', d: addD(today(), 7) },
      { g: '운송', k: 'freightTerms', l: '운임 조건', t: 'sel', opts: ['PREPAID', 'COLLECT'], d: 'PREPAID' },
      { g: '운송', k: 'carrier', l: 'Carrier / Forwarder', d: 'INSIGHT LOGISTICS CO., LTD.', w: 2 },
      { g: '컨테이너·화인', k: 'containerNo', l: 'Container No.', d: 'ABCD1234567' },
      { g: '컨테이너·화인', k: 'sealNo', l: 'Seal No.', d: 'SL000000' },
      { g: '컨테이너·화인', k: 'containerType', l: 'Container Type', t: 'sel', opts: ['20FT DRY', '40FT DRY', '40FT HC', 'LCL'], d: '40FT DRY' },
      { g: '컨테이너·화인', k: 'marks', l: 'Marks & Numbers', d: 'N/M' },
      { g: '컨테이너·화인', k: 'noOfOriginals', l: 'B/L 원본 부수', t: 'sel', opts: ['3', '2', '1', '0 (Surrender)'], d: '3' },
      { g: '컨테이너·화인', k: 'pkgsTotal', l: '총 포장 개수', d: '40 CARTONS' },
      { g: '특기사항', k: 'special', l: '특기사항', t: 'area', d: '1) 화물은 반드시 20ft 컨테이너 2대에 나누어 적입.\n2) B/L 에 HS CODE 표기 요청.\n3) 선적 후 B/L draft 사본을 이메일로 송부.', w: 2, rows: 4 }
    ],
    sets: [{
      k: 'cargo', label: '화물 내역', addLabel: '화물 추가',
      cols: [
        { k: 'marks', h: 'Marks', w: '14%', d: 'N/M' },
        { k: 'desc', h: 'Description of Goods', w: '34%', d: 'RECYCLED POLYCARBONATE PELLETS' },
        { k: 'hs', h: 'HS Code', w: '14%', d: '3907.40' },
        { k: 'pkgs', h: 'Packages', w: '12%', d: '20 CARTONS' },
        { k: 'gross', h: 'Gross kg', t: 'num', w: '10%', d: '10200' },
        { k: 'net', h: 'Net kg', t: 'num', w: '8%', d: '10000' },
        { k: 'cbm', h: 'CBM', t: 'num', w: '8%', d: '18.5' }
      ],
      def: [
        { marks: 'N/M', desc: 'RECYCLED POLYCARBONATE PELLETS', hs: '3907.40', pkgs: '20 CARTONS', gross: '10200', net: '10000', cbm: '18.5' },
        { marks: 'N/M', desc: 'RECYCLED ABS PELLETS', hs: '3903.30', pkgs: '20 CARTONS', gross: '10150', net: '10000', cbm: '18.2' }
      ]
    }]
  });

  /* ---------------------------------------------------------
     2. Bill of Lading (선하증권 양식)
  --------------------------------------------------------- */
  function blRaw(d) {
    var f = d.f;
    var h = '<div class="fm-tdoc td-bl" id="td-bl">' + wm(f);
    h += '<div class="td-top"><div><div class="td-kicker">BILL OF LADING · 선하증권</div>' +
      '<div class="td-title">BILL OF LADING</div>' +
      '<div class="td-sub">COMBINED TRANSPORT OR PORT TO PORT SHIPMENT</div></div>' +
      '<div class="td-topr">' + chip(f) + '<table class="td-meta">' +
      '<tr><th>B/L No.</th><td>' + tx('blNo', d) + '</td></tr>' +
      '<tr><th>Booking No.</th><td>' + tx('bookingNo', d) + '</td></tr>' +
      '<tr><th>Date</th><td>' + esc(dko(f.blDate)) + '</td></tr>' +
      '<tr><th>Carrier</th><td>' + tx('carrier', d) + '</td></tr></table></div></div>';

    h += '<div class="td-grid2">';
    h += '<div class="td-col">' + box('SHIPPER', 'shipperBlock', d) + box('CONSIGNEE', 'consigneeBlock', d) + box('NOTIFY PARTY', 'notifyBlock', d) + '</div>';
    h += '<div class="td-col r">' +
      '<div class="td-cell"><span class="lb">VESSEL / VOYAGE</span><span class="v">' + tx('vesselLine', d) + '</span></div>' +
      '<div class="td-cell"><span class="lb">PORT OF LOADING</span><span class="v">' + tx('pol', d) + '</span></div>' +
      '<div class="td-cell"><span class="lb">PORT OF DISCHARGE</span><span class="v">' + tx('pod', d) + '</span></div>' +
      '<div class="td-cell"><span class="lb">PLACE OF DELIVERY</span><span class="v">' + tx('placeDelivery', d) + '</span></div>' +
      '<div class="td-cell"><span class="lb">FINAL DESTINATION</span><span class="v">' + tx('finalDest', d) + '</span></div>' +
      '<div class="td-cell"><span class="lb">COUNTRY OF ORIGIN</span><span class="v">' + tx('originCountry', d) + '</span></div>' +
      '</div>';
    h += '</div>';

    var rows = d.sets.cargo || [];
    h += '<table class="td-tbl tbl-cargo"><thead><tr>' +
      '<th style="width:15%">Container / Seal No.</th><th style="width:14%">Marks &amp; Numbers</th>' +
      '<th style="width:13%">No. &amp; Kind of Packages</th><th style="width:31%">Description of Goods</th>' +
      '<th style="width:14%">Gross Weight</th><th style="width:13%">Measurement</th></tr></thead><tbody>';
    rows.forEach(function (r) {
      h += '<tr><td class="c">' + esc(r.ctr || '') + '</td><td>' + esc(r.marks || '') + '</td><td class="c">' + esc(r.pkgs || '') +
        '</td><td class="l">' + esc(r.desc || '') + '</td><td class="r">' + (r.gross === '' ? '' : fmt(r.gross) + ' kg') +
        '</td><td class="r">' + (r.cbm === '' ? '' : H.fmt1(r.cbm) + ' CBM') + '</td></tr>';
    });
    for (var i = 0; i < Math.max(0, 3 - rows.length); i++) {
      h += '<tr class="empty"><td></td><td></td><td></td><td></td><td></td><td></td></tr>';
    }
    h += '</tbody><tfoot><tr><td colspan="4" class="r">TOTAL</td><td class="r">' + fmt(sum(d, 'cargo', 'gross')) + ' kg</td>' +
      '<td class="r">' + H.fmt1(sum(d, 'cargo', 'cbm')) + ' CBM</td></tr></tfoot></table>';

    var fr = d.sets.freight || [];
    h += '<table class="td-tbl tbl-freight"><thead><tr><th style="width:40%">Freight &amp; Charges</th><th style="width:15%">Rate</th>' +
      '<th style="width:15%">Prepaid</th><th style="width:15%">Collect</th><th style="width:15%">Currency</th></tr></thead><tbody>';
    fr.forEach(function (r) {
      h += '<tr><td class="l">' + esc(r.item || '') + '</td><td class="r">' + (r.rate === '' ? '' : fmt(r.rate)) +
        '</td><td class="r">' + (r.prepaid === '' ? '' : fmt(r.prepaid)) + '</td><td class="r">' + (r.collect === '' ? '' : fmt(r.collect)) +
        '</td><td class="c">' + esc(r.cur || '') + '</td></tr>';
    });
    h += '</tbody><tfoot><tr><td class="r">TOTAL</td><td></td><td class="r">' + fmt(sum(d, 'freight', 'prepaid')) +
      '</td><td class="r">' + fmt(sum(d, 'freight', 'collect')) + '</td><td class="c">' + tx('freightCur', d) + '</td></tr></tfoot></table>';

    h += '<div class="td-foot c3">' +
      '<div class="td-cell"><span class="lb">PLACE AND DATE OF ISSUE</span><span class="v">' + esc(f.placeIssue) + ' · ' + esc(dko(f.blDate)) + '</span>' +
      '<span class="lb" style="margin-top:6px">NO. OF ORIGINAL B/L</span><span class="v">' + tx('noOfOriginals', d) + '</span></div>' +
      '<div class="td-cell"><span class="lb">SIGNED FOR THE CARRIER</span><div class="td-sigwrap">' + H.signBoxFor(d, 'A') + '</div></div>' +
      '<div class="td-cell"><span class="lb">SHIPPER CONFIRMATION</span><div class="td-sigwrap">' + H.signBoxFor(d, 'B') + '</div></div>' +
      '</div>';

    h += '<div class="td-note">※ 이 문서는 선하증권의 표준 항목을 참고해 인사이트 브리프가 직접 만든 <b>견본 양식</b>입니다. 실제 선하증권은 선사·포워더가 발행하며, 원본 제시 없이는 화물을 인도받을 수 없습니다. 서렌더(Surrender)·시웨이빌(Sea Waybill)은 원본 없이 화물을 인도하는 조건이므로 은행 신용장 조건과 일치하는지 반드시 확인하세요. 프레이트 프리페이드/콜렉트 표기는 인코텀즈와 별개인 운임 부담 조건입니다.</div>';
    h += '</div>';
    return h;
  }

  add({
    id: 'bl', cat: 'trade', sub: 'tr-bl', no: '02', tpl: 'bl',
    name: 'Bill of Lading (선하증권)', en: 'BILL OF LADING',
    keywords: '비엘 선하증권 bill of lading B/L B/L양식 오리지널 서렌더 시웨이빌 프레이트 콜렉트 수출 수입 선사 포워더',
    parties: [{ k: 'A', label: '선사·포워더 서명', nameKey: 'agent' }, { k: 'B', label: '화주 확인', nameKey: 'shipperName' }],
    raw: blRaw,
    fields: [
      { g: '문서 정보', k: 'blNo', l: 'B/L No.', d: 'IBL-2026-1123-001' },
      { g: '문서 정보', k: 'bookingNo', l: 'Booking No.', d: 'BK-00000000' },
      { g: '문서 정보', k: 'blDate', l: '발행일', t: 'date', d: today() },
      { g: '문서 정보', k: 'issueType', l: '발행 형태', t: 'sel', opts: ['ORIGINAL', 'SURRENDER', 'SEAWAYBILL', 'COPY'], d: 'ORIGINAL' },
      { g: '문서 정보', k: 'noOfOriginals', l: '원본 부수', t: 'sel', opts: ['3 (THREE)', '2 (TWO)', '1 (ONE)', '0 (SURRENDER)'], d: '3 (THREE)' },
      { g: '문서 정보', k: 'freightCur', l: '운임 통화', d: 'USD' },
      { g: '당사자', k: 'shipperName', l: 'Shipper 상호', d: 'Hanbit Trading Co., Ltd.' },
      { g: '당사자', k: 'shipperBlock', l: 'Shipper 표기', t: 'area', d: 'Hanbit Trading Co., Ltd.\n120, Nadong-daero, Sasang-gu, Busan, Korea\nTel +82-53-000-0000', w: 2, rows: 3 },
      { g: '당사자', k: 'consigneeBlock', l: 'Consignee 표기', t: 'area', d: 'TO THE ORDER OF SHIPPER', w: 2, rows: 3 },
      { g: '당사자', k: 'notifyBlock', l: 'Notify Party 표기', t: 'area', d: 'Guangzhou Sunrise Plastics Co., Ltd.\nNo. 88, Huangpu East Road, Guangzhou, China', w: 2, rows: 3 },
      { g: '운송', k: 'carrier', l: 'Carrier', d: 'INSIGHT LINE CO., LTD.' },
      { g: '운송', k: 'agent', l: '발행 대리인(As Agent)', d: 'INSIGHT LOGISTICS CO., LTD.' },
      { g: '운송', k: 'vesselLine', l: 'Vessel / Voyage', d: 'HANJIN BUSAN / 0234E' },
      { g: '운송', k: 'pol', l: 'Port of Loading', d: 'BUSAN, KOREA' },
      { g: '운송', k: 'pod', l: 'Port of Discharge', d: 'NANSHA, CHINA' },
      { g: '운송', k: 'placeDelivery', l: 'Place of Delivery', d: 'GUANGZHOU, CHINA' },
      { g: '운송', k: 'finalDest', l: 'Final Destination', d: 'GUANGZHOU, CHINA' },
      { g: '운송', k: 'originCountry', l: 'Country of Origin', d: 'KOREA' },
      { g: '운송', k: 'freightTerms', l: '운임 조건', t: 'sel', opts: ['PREPAID', 'COLLECT'], d: 'PREPAID' },
      { g: '운송', k: 'placeIssue', l: '발행 장소', d: 'BUSAN, KOREA' }
    ],
    sets: [
      {
        k: 'cargo', label: '화물 (Container / 화인 / 품명)', addLabel: '화물 추가',
        cols: [
          { k: 'ctr', h: 'Container/Seal', w: '17%', d: 'ABCD1234567 / SL000000' },
          { k: 'marks', h: 'Marks', w: '15%', d: 'N/M' },
          { k: 'pkgs', h: 'Packages', w: '14%', d: '20 CARTONS' },
          { k: 'desc', h: 'Description', w: '32%', d: 'RECYCLED POLYCARBONATE PELLETS' },
          { k: 'gross', h: 'Gross kg', t: 'num', w: '11%', d: '10200' },
          { k: 'cbm', h: 'CBM', t: 'num', w: '11%', d: '18.5' }
        ],
        def: [{ ctr: 'ABCD1234567 / SL000000', marks: 'N/M', pkgs: '20 CARTONS', desc: 'RECYCLED POLYCARBONATE PELLETS', gross: '10200', cbm: '18.5' }]
      },
			{
        k: 'freight', label: '운임·요금 (Freight & Charges)', addLabel: '요금 추가',
        cols: [
          { k: 'item', h: '항목', w: '44%', d: 'OCEAN FREIGHT' },
          { k: 'rate', h: 'Rate', t: 'num', w: '16%', d: '1200' },
          { k: 'prepaid', h: 'Prepaid', t: 'num', w: '16%', d: '1200' },
          { k: 'collect', h: 'Collect', t: 'num', w: '12%', d: '' },
          { k: 'cur', h: '통화', w: '12%', d: 'USD' }
        ],
        def: [{ item: 'OCEAN FREIGHT', rate: '1200', prepaid: '1200', collect: '', cur: 'USD' }]
      }
    ]
  });

  /* ---------------------------------------------------------
     3. 선적서류 체크리스트
  --------------------------------------------------------- */
  add({
    id: 'ship-docs', cat: 'trade', sub: 'tr-ship', no: '01', tpl: 'check',
    name: '선적서류 체크리스트', en: 'SHIPPING DOCUMENTS CHECKLIST',
    keywords: '선적서류 체크리스트 수출 수입 인보이스 패킹리스트 원산지증명 보험증권 통관 서류 점검',
    head: { sub: 'SHIPPING DOCUMENTS CHECKLIST', meta: [['문서번호', 'docNo'], ['작성일', 'issueDate'], ['거래처', 'partner']] },
    parties: [{ k: 'A', label: '작성(수출입 담당)', nameKey: 'writer' }, { k: 'B', label: '확인(관리자)', nameKey: 'checker' }],
    fields: [
      { g: '기본 정보', k: 'docNo', l: '문서번호', d: 'DOC-2026-1123-01' },
      { g: '기본 정보', k: 'issueDate', l: '작성일', t: 'date', d: today() },
      { g: '기본 정보', k: 'partner', l: '거래처', d: 'Guangzhou Sunrise Plastics' },
      { g: '기본 정보', k: 'contractNo', l: '계약·L/C 번호', d: 'LC-00000000', w: 2 },
      { g: '기본 정보', k: 'shipLine', l: '선적 정보', d: 'BUSAN → NANSHA / HANJIN BUSAN 0234E / ETD 2026-11-30', w: 2 },
      { g: '기본 정보', k: 'writer', l: '작성자', d: '홍길동' },
      { g: '기본 정보', k: 'checker', l: '확인자', d: '김철수' },
      { g: '점검 메모', k: 'memo', l: '특이사항·보완할 점', t: 'area', d: '원산지증명서(C/O)는 발급에 3영업일이 걸리므로 선적 1주 전 신청. 보험증권은 CIF 조건일 때만 필요.', w: 2, rows: 3 }
    ],
    sets: [{
      k: 'docs', label: '서류 목록', addLabel: '서류 추가',
      cols: [
        { k: 'name', h: '서류', w: '30%', d: 'Commercial Invoice' },
        { k: 'issuer', h: '발행처', w: '22%', d: '수출자' },
        { k: 'copies', h: '부수', w: '10%', d: '3' },
        { k: 'check', h: '확인', w: '10%', d: '○' },
        { k: 'note', h: '비고', w: '28%', d: 'B/L과 금액 일치 확인' }
      ],
      def: [
        { name: 'Commercial Invoice (상업송장)', issuer: '수출자', copies: '3', check: '○', note: 'B/L·L/C 금액 일치' },
        { name: 'Packing List (포장명세서)', issuer: '수출자', copies: '3', check: '○', note: '카톤 수·중량 일치' },
        { name: 'Bill of Lading (선하증권)', issuer: '선사', copies: '3', check: '○', note: '원본 3부 / 서렌더 여부' },
        { name: 'Certificate of Origin (원산지증명)', issuer: '상공회의소', copies: '1', check: '△', note: 'FTA 협정별 서식 확인' },
        { name: 'Insurance Policy (보험증권)', issuer: '보험사', copies: '1', check: '—', note: 'CIF 조건일 때 필요' }
      ]
    }],
    blocks: [
      { t: 'kv', rows: [['계약·L/C 번호', 'contractNo'], ['선적 정보', 'shipLine'], ['거래처', 'partner']] },
      { t: 'table', set: 'docs', empty: 3, head: ['서류', '발행처', '부수', '확인', '비고'], cols: [
        { k: 'name', h: '서류' }, { k: 'issuer', h: '발행처' }, { k: 'copies', h: '부수', t: 'center' },
        { k: 'check', h: '확인', t: 'center' }, { k: 'note', h: '비고' }
      ] },
      { t: 'sec', h: '점검 순서', v: function () { return '1. 계약서·L/C 조건에서 요구하는 서류 목록을 먼저 뽑는다.\n2. Invoice·Packing List·B/L의 품명·수량·중량·금액을 글자 단위로 대조한다.\n3. 원산지증명·검사증명처럼 발급에 시간이 걸리는 서류는 선적 1주 전에 신청한다.\n4. 원본 B/L 부수와 서렌더 여부를 은행·수입자와 다시 확인한다.\n5. 사본을 스캔해 보관하고, 원본은 등기·특송으로 송부한다.'; } },
      { t: 'sec', h: '특이사항·보완할 점', v: 'memo' },
      { t: 'sign', parties: ['A', 'B'], note: function () { return '서류를 모두 확인한 뒤 작성자와 확인자가 서명합니다.'; } },
      { t: 'note', v: function () { return '※ 확인란은 ○(완료) · △(진행) · —(해당 없음)으로 표시하세요. 국가·품목·결제 방식에 따라 요구 서류가 달라지므로 최종 목록은 은행·관세사와 확인하는 것이 안전합니다.'; } }
    ]
  });
})(typeof window !== 'undefined' ? window : this);
