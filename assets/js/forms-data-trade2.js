/* =========================================================
   INSIGHT BRIEF — 무역·물류 추가분
   원산지증명 신청서 · 패킹리스트(국문) · 적하보험 요청서 ·
   검수·품질 확인서 · 운송료 견적 비교표
   문구·표 구성은 자체 제작이며 특정 선사·기관 양식을 복제하지 않았습니다.
   ========================================================= */
(function (root) {
  'use strict';
  var H = root.IBF;
  var DOCS = root.IBF_DOCS;
  var esc = H.esc, fmt = H.fmt, fmt1 = H.fmt1, won = H.won, dko = H.dateKo,
    today = H.todayISO, sum = H.setSum, addD = H.addDays;
  function add(d) { DOCS[d.id] = d; return d; }
  function sec(h, v) { return { t: 'sec', h: h, v: v }; }
  function sign(parties, txt) { return { t: 'sign', parties: parties, note: txt == null ? null : (typeof txt === 'function' ? txt : function () { return txt; }) }; }
  function note(txt) { return { t: 'note', v: function () { return txt; } }; }
  function body(txt) { return { t: 'body', v: txt }; }

  /* ---------------------------------------------------------
     1. 원산지증명(C/O) 신청서
  --------------------------------------------------------- */
  add({
    id: 'co-request', cat: 'trade', sub: 'tr-ship', no: '04',
    name: '원산지증명(C/O) 신청서', en: 'CERTIFICATE OF ORIGIN REQUEST',
    keywords: '원산지증명서 C/O 신청서 FTA 관세 협정 원산지 상공회의소 수출',
    head: { sub: 'CERTIFICATE OF ORIGIN REQUEST', meta: [['신청일', 'issueDate'], ['선적일', 'shipDate']] },
    parties: [{ k: 'A', label: '신청인(수출자)', nameKey: 'exporter' }, { k: 'B', label: '확인', nameKey: 'broker' }],
    fields: [
      { g: '수출자', k: 'exporter', l: '상호', d: 'Hanbit Trading Co., Ltd.' },
      { g: '수출자', k: 'expBizNo', l: '사업자번호', d: '000-00-00000' },
      { g: '수출자', k: 'expAddr', l: '주소', d: '120, Nadong-daero, Sasang-gu, Busan, Korea', w: 2 },
      { g: '수출자', k: 'expContact', l: '담당·연락처', d: 'Gil-dong Hong / +82-51-000-0000' },
      { g: '수입자', k: 'importer', l: 'Consignee 상호', d: 'Guangzhou Sunrise Plastics Co., Ltd.' },
      { g: '수입자', k: 'impAddr', l: 'Consignee 주소', d: 'No. 88, Huangpu East Road, Guangzhou, China', w: 2 },
      { g: '수입자', k: 'impCountry', l: '수입국', d: 'CHINA' },
      { g: '증명서', k: 'coType', l: '증명서 종류', t: 'sel', opts: ['일반 원산지증명서', 'FTA 협정 원산지증명서', '한-아세안', '한-중 FTA', '기타'], d: '한-중 FTA' },
      { g: '증명서', k: 'issuer', l: '발급 기관', t: 'sel', opts: ['대한상공회의소', '세관', '농림축산식품부', '기타'], d: '대한상공회의소' },
      { g: '증명서', k: 'coNo', l: '증명서 번호(발급 시)', d: '' },
      { g: '증명서', k: 'issueDate', l: '신청일', t: 'date', d: today() },
      { g: '선적', k: 'invoiceNo', l: 'Invoice No.', d: 'CI-2026-1124-01' },
      { g: '선적', k: 'shipDate', l: '선적일', t: 'date', d: addD(today(), 7) },
      { g: '선적', k: 'vessel', l: '선박·항차', d: 'HANJIN BUSAN / 0234E' },
      { g: '선적', k: 'pol', l: '선적항', d: 'BUSAN, KOREA' },
      { g: '선적', k: 'pod', l: '도착항', d: 'NANSHA, CHINA' },
      { g: '선적', k: 'origin', l: '원산지', d: 'REPUBLIC OF KOREA' },
      { g: '신청', k: 'memo', l: '요청 사항', t: 'area', d: '1) HS코드 3907.40 / 3903.30 두 품목을 각각 발급\n2) 전자발급 후 원본 1부 우편 송부\n3) 수입자 명의는 Commercial Invoice와 동일', w: 2, rows: 3 }
    ],
    sets: [{
      k: 'items', label: '품목 내역', addLabel: '품목 추가',
      cols: [
        { k: 'item', h: '품명', w: '32%', d: 'Recycled polycarbonate pellets' },
        { k: 'hs', h: 'HS Code', w: '14%', d: '3907.40' },
        { k: 'qty', h: '수량(kg)', t: 'num', w: '14%', d: '20000' },
        { k: 'price', h: '단가(USD)', t: 'num', w: '14%', d: '1.05' },
        { k: 'origin', h: '원산지', w: '26%', d: 'KOREA (재생 가공)' }
      ],
      def: [
        { item: 'Recycled polycarbonate pellets', hs: '3907.40', qty: '20000', price: '1.05', origin: 'KOREA (재생 가공)' },
        { item: 'Recycled ABS pellets', hs: '3903.30', qty: '5000', price: '1.18', origin: 'KOREA (재생 가공)' }
      ]
    }],
    blocks: [
      { t: 'parties', cols: [
        { title: '수출자 (Exporter)', rows: [['상호', 'exporter'], ['사업자번호', 'expBizNo'], ['주소', 'expAddr'], ['담당', 'expContact']] },
        { title: '수입자 (Consignee)', rows: [['상호', 'importer'], ['주소', 'impAddr'], ['수입국', 'impCountry']] }
      ] },
      sec('신청 개요', function (d) {
        return d.f.coType + ' 발급을 ' + d.f.issuer + '에 신청합니다. 선적 예정일은 ' + dko(d.f.shipDate) + ', Invoice No.는 ' + d.f.invoiceNo + '입니다.';
      }),
      { t: 'table', set: 'items', head: ['품명', 'HS Code', '수량(kg)', '단가(USD)', '원산지'], cols: [{ k: 'item', h: '품명' }, { k: 'hs', h: 'HS Code', t: 'center' }, { k: 'qty', h: '수량(kg)', t: 'num' }, { k: 'price', h: '단가(USD)', t: 'num' }, { k: 'origin', h: '원산지' }] },
      { t: 'sums', rows: [
        { l: '총 수량', v: function (d) { return sum(d, 'items', 'qty'); }, unit: 'kg' },
        { l: '총 금액(USD)', v: function (d) { return fmt1(sum(d, 'items', 'qty') ? (d.sets.items || []).reduce(function (a, r) { return a + H.num(r.qty) * H.num(r.price); }, 0) : 0); }, text: true, unit: 'USD', grand: true }
      ] },
      sec('원산지 판정 근거', function () {
        return '· 재생원료는 국내에서 수집·선별·재생 가공한 것으로, 세번변경기준(HS 3907·3903)을 충족합니다.\n· 원재료 매입 세금계산서와 재생 가공 공정 기록을 보관합니다.\n· 협정별 원산지 결정 기준과 부가가치 비율은 발급 기관 확인이 필요합니다.';
      }),
      sec('요청 사항', 'memo'),
      sign(['A', 'B'], function (d) { return '신청일 ' + dko(d.f.issueDate) + ' · 신청인과 대행자가 확인합니다.'; }),
      note('※ 원산지증명서는 사후 검증 대상입니다. 원재료 매입·생산 기록을 최소 5년 보관하고, 신고한 HS코드와 실제 품목이 다르면 관세 추징이 발생할 수 있습니다. FTA 협정별 원산지 기준을 먼저 확인하세요.')
    ]
  });

  /* ---------------------------------------------------------
     2. 패킹리스트 (국문)
  --------------------------------------------------------- */
  add({
    id: 'packing-kr', cat: 'trade', sub: 'tr-ship', no: '05',
    name: '패킹리스트 (국문)', en: 'PACKING LIST',
    keywords: '패킹리스트 포장명세서 국문 수출 포장 중량 CBM 카톤 검수',
    head: { sub: 'PACKING LIST · 포장명세서', meta: [['작성일', 'issueDate'], ['총 포장', function (d) { return fmt(sum(d, 'items', 'pkgs')) + '개'; }]] },
    parties: [{ k: 'A', label: '송하인', nameKey: 'shipper' }, { k: 'B', label: '수하인', nameKey: 'consignee' }],
    fields: [
      { g: '문서', k: 'invoiceNo', l: 'Invoice No.', d: 'CI-2026-1124-01' },
      { g: '문서', k: 'issueDate', l: '작성일', t: 'date', d: today() },
      { g: '문서', k: 'poNo', l: 'P/O No.', d: 'PO-2026-1124-01' },
      { g: '당사자', k: 'shipper', l: '송하인', d: '한빛무역(주)' },
      { g: '당사자', k: 'shipperAddr', l: '송하인 주소', d: '부산광역시 사상구 낙동대로 120', w: 2 },
      { g: '당사자', k: 'consignee', l: '수하인', d: 'Guangzhou Sunrise Plastics Co., Ltd.' },
      { g: '당사자', k: 'consigneeAddr', l: '수하인 주소', d: 'No. 88, Huangpu East Road, Guangzhou, China', w: 2 },
      { g: '운송', k: 'vessel', l: '선박·항차', d: 'HANJIN BUSAN / 0234E' },
      { g: '운송', k: 'container', l: '컨테이너 번호', d: 'ABCD1234567' },
      { g: '운송', k: 'seal', l: '봉인번호', d: 'SL000000' },
      { g: '운송', k: 'pol', l: '선적항', d: 'BUSAN, KOREA' },
      { g: '운송', k: 'pod', l: '도착항', d: 'NANSHA, CHINA' },
      { g: '운송', k: 'marks', l: '화인', d: 'N/M' },
      { g: '비고', k: 'memo', l: '비고', t: 'area', d: '파렛트 적재, 25kg 포대 20개 단위로 결속. 파손 방지를 위해 상단 2단까지만 적재.', w: 2, rows: 2 }
    ],
    sets: [{
      k: 'items', label: '포장 내역', addLabel: '행 추가',
      cols: [
        { k: 'item', h: '품명', w: '28%', d: '재생 PC 펠렛' },
        { k: 'pkgs', h: '포장 수', t: 'num', w: '12%', d: '800' },
        { k: 'kind', h: '포장 형태', w: '18%', d: '25kg 포대' },
        { k: 'net', h: '순중량(kg)', t: 'num', w: '14%', d: '20000' },
        { k: 'gross', h: '총중량(kg)', t: 'num', w: '14%', d: '20400' },
        { k: 'cbm', h: 'CBM', t: 'num', w: '14%', d: '18.5' }
      ],
      def: [
        { item: '재생 PC 펠렛', pkgs: '800', kind: '25kg 포대', net: '20000', gross: '20400', cbm: '18.5' },
        { item: '재생 ABS 펠렛', pkgs: '200', kind: '25kg 포대', net: '5000', gross: '5120', cbm: '4.6' }
      ]
    }],
    blocks: [
      { t: 'parties', cols: [
        { title: '송하인', rows: [['상호', 'shipper'], ['주소', 'shipperAddr']] },
        { title: '수하인', rows: [['상호', 'consignee'], ['주소', 'consigneeAddr']] }
      ] },
      { t: 'kv', rows: [['Invoice No.', 'invoiceNo'], ['P/O No.', 'poNo'], ['작성일', 'issueDate'], ['선박·항차', 'vessel'], ['컨테이너', 'container'], ['봉인번호', 'seal'], ['화인', 'marks']] },
      { t: 'table', set: 'items', head: ['품명', '포장 수', '포장 형태', '순중량(kg)', '총중량(kg)', 'CBM'], cols: [{ k: 'item', h: '품명' }, { k: 'pkgs', h: '포장 수', t: 'num' }, { k: 'kind', h: '포장 형태', t: 'center' }, { k: 'net', h: '순중량(kg)', t: 'num' }, { k: 'gross', h: '총중량(kg)', t: 'num' }, { k: 'cbm', h: 'CBM', t: 'num' }] },
      { t: 'sums', rows: [
        { l: '총 포장 수', v: function (d) { return sum(d, 'items', 'pkgs'); }, unit: '개' },
        { l: '총 순중량', v: function (d) { return sum(d, 'items', 'net'); }, unit: 'kg' },
        { l: '총 총중량', v: function (d) { return sum(d, 'items', 'gross'); }, unit: 'kg' },
        { l: '총 용적', v: function (d) { return fmt1(sum(d, 'items', 'cbm')); }, text: true, unit: 'CBM', grand: true }
      ] },
      sec('비고', 'memo'),
      body('위 포장 내역이 사실과 같음을 확인합니다.'),
      sign(['A'], function (d) { return dko(d.f.issueDate) + ' · 송하인 서명·날인'; }),
      note('※ 패킹리스트의 포장 수·중량은 선하증권(B/L)과 상업송장의 값과 일치해야 합니다. 컨테이너 단위로 적재할 때는 실제 적재 CBM을 기준으로 적고, 파렛트 단위 포장이면 파렛트 수를 함께 표기하세요.')
    ]
  });

  /* ---------------------------------------------------------
     3. 적하보험 증권 요청서
  --------------------------------------------------------- */
  add({
    id: 'insurance-request', cat: 'trade', sub: 'tr-ship', no: '06',
    name: '적하보험 증권 요청서', en: 'CARGO INSURANCE REQUEST',
    keywords: '적하보험 증권 요청서 해상보험 화물보험 보험료 담보 조건 CIF',
    head: { sub: 'CARGO INSURANCE REQUEST', meta: [['요청일', 'issueDate'], ['보험 기간', function (d) { return d.f.fromDate + ' ~ ' + d.f.toDate; }]] },
    parties: [{ k: 'A', label: '보험 계약자', nameKey: 'applicant' }, { k: 'B', label: '보험사 확인', nameKey: 'insurer' }],
    fields: [
      { g: '계약자', k: 'applicant', l: '상호', d: 'Hanbit Trading Co., Ltd.' },
      { g: '계약자', k: 'applicantAddr', l: '주소', d: '120, Nadong-daero, Sasang-gu, Busan, Korea', w: 2 },
      { g: '계약자', k: 'contact', l: '담당·연락처', d: 'Gil-dong Hong / +82-51-000-0000' },
      { g: '보험사', k: 'insurer', l: '보험사·대리점', d: '○○해상보험 대리점' },
      { g: '화물', k: 'goods', l: '화물명', d: 'RECYCLED PC / ABS PELLETS' },
      { g: '화물', k: 'hs', l: 'HS Code', d: '3907.40 / 3903.30' },
      { g: '화물', k: 'packages', l: '포장 수량', d: '1,000 포대 (25kg)' },
      { g: '화물', k: 'gross', l: '총중량(kg)', t: 'num', d: '25520' },
      { g: '화물', k: 'invoiceValue', l: '송장 금액(USD)', t: 'num', d: '26900' },
      { g: '보험 조건', k: 'coverage', l: '담보 조건', t: 'sel', opts: ['ICC(A) 전위험담보', 'ICC(B)', 'ICC(C)', '협회적하약관 구약관(전위험)'], d: 'ICC(A) 전위험담보' },
      { g: '보험 조건', k: 'rate', l: '보험료율', d: '송장가액 × 110% × 0.35%' },
      { g: '보험 조건', k: 'fromDate', l: '보험 개시일', t: 'date', d: addD(today(), 7) },
      { g: '보험 조건', k: 'toDate', l: '보험 종료일', t: 'date', d: addD(today(), 40) },
      { g: '보험 조건', k: 'route', l: '운송 구간', d: 'BUSAN, KOREA → NANSHA, CHINA (직항)', w: 2 },
      { g: '보험 조건', k: 'vessel', l: '선박·항차', d: 'HANJIN BUSAN / 0234E' },
      { g: '보험 조건', k: 'blNo', l: 'B/L No.', d: 'HJSB26011234' },
      { g: '보험 조건', k: 'memo', l: '특기 사항', t: 'area', d: '1) 부보금액은 송장가액의 110%로 함\n2) 원본 증권 2부 발행 요청\n3) 환적 시 담보 연장 포함', w: 2, rows: 3 },
      { g: '보험 조건', k: 'issueDate', l: '요청일', t: 'date', d: today() }
    ],
    blocks: [
      { t: 'parties', cols: [
        { title: '보험 계약자', rows: [['상호', 'applicant'], ['주소', 'applicantAddr'], ['담당', 'contact']] },
        { title: '보험사', rows: [['보험사', 'insurer'], ['담보', 'coverage'], ['보험료율', 'rate']] }
      ] },
      { t: 'kv', rows: [['화물명', 'goods'], ['HS Code', 'hs'], ['포장', 'packages'], ['총중량', function (d) { return fmt(d.f.gross) + ' kg'; }], ['송장 금액', function (d) { return fmt(d.f.invoiceValue) + ' USD'; }], ['운송 구간', 'route'], ['선박·항차', 'vessel'], ['B/L No.', 'blNo']] },
      sec('보험 조건', function (d) {
        return '· 담보: ' + d.f.coverage + '\n· 부보금액: 송장가액의 110% (약 ' + fmt(Math.round(H.num(d.f.invoiceValue) * 1.1)) + ' USD)\n· 보험 기간: ' + d.f.fromDate + ' ~ ' + d.f.toDate + '\n· 보험료율: ' + d.f.rate;
      }),
      sec('특기 사항', 'memo'),
      body('위 조건으로 적하보험 증권 발행을 요청합니다. 보험료 청구서와 증권 원본을 아래 담당자에게 송부해 주시기 바랍니다.'),
      sign(['A', 'B'], function (d) { return '요청일 ' + dko(d.f.issueDate) + ' · 계약자와 보험사가 확인합니다.'; }),
      note('※ CIF 조건으로 수출할 때는 매도인이 보험을 부보합니다. ICC(A)는 전위험 담보이지만 고의·부주의 등 면책 사항이 있으므로, 고가 화물은 별도 특약을 검토하세요. 보험금 청구 시 선박회사에 사고 통지와 검정보고서가 필요합니다.')
    ]
  });

  /* ---------------------------------------------------------
     4. 검수·품질 확인서
  --------------------------------------------------------- */
  add({
    id: 'inspection', cat: 'trade', sub: 'tr-ship', no: '07',
    name: '검수·품질 확인서', en: 'INSPECTION CERTIFICATE',
    keywords: '검수 확인서 품질 검사 성적서 수입 검사 불량 로트 합격 판정',
    head: { sub: 'INSPECTION CERTIFICATE', meta: [['검사일', 'inspectDate'], ['판정', 'result']] },
    parties: [{ k: 'A', label: '검사자', nameKey: 'inspector' }, { k: 'B', label: '확인(구매)', nameKey: 'buyer' }],
    fields: [
      { g: '검사 정보', k: 'lotNo', l: '로트 번호', d: 'LOT-2026-1124-01' },
      { g: '검사 정보', k: 'invoiceNo', l: 'Invoice No.', d: 'CI-2026-1124-01' },
      { g: '검사 정보', k: 'supplier', l: '공급처', d: 'Guangzhou Sunrise Plastics Co., Ltd.' },
      { g: '검사 정보', k: 'item', l: '품명', d: '재생 PC 펠렛 (검정)' },
      { g: '검사 정보', k: 'qty', l: '검사 수량', d: '200 포대 / 5,000kg' },
      { g: '검사 정보', k: 'inspectDate', l: '검사일', t: 'date', d: today() },
      { g: '검사 정보', k: 'inspector', l: '검사자', d: '이민수' },
      { g: '검사 정보', k: 'buyer', l: '구매 담당', d: '김철수' },
      { g: '판정', k: 'result', l: '종합 판정', t: 'sel', opts: ['합격', '조건부 합격', '불합격'], d: '합격' },
      { g: '판정', k: 'action', l: '조치 사항', t: 'area', d: '합격. 입고 후 창고 A-1 구역에 보관하고, 시험성적서는 품질 파일에 첨부.', w: 2, rows: 2 },
      { g: '판정', k: 'memo', l: '비고', t: 'area', d: '포장 상태 양호, 파손 0건. 색상 편차는 육안 검사상 허용 범위 이내.', w: 2, rows: 2 }
    ],
    sets: [{
      k: 'rows', label: '검사 항목', addLabel: '항목 추가',
      cols: [
        { k: 'item', h: '검사 항목', w: '26%', d: '용융지수(MFI)' },
        { k: 'spec', h: '기준', w: '24%', d: '8 ~ 12 g/10min' },
        { k: 'value', h: '측정값', w: '18%', d: '10.2' },
        { k: 'judge', h: '판정', w: '12%', d: '합격' },
        { k: 'memo', h: '비고', w: '20%', d: '3회 평균' }
      ],
      def: [
        { item: '용융지수(MFI)', spec: '8 ~ 12 g/10min', value: '10.2', judge: '합격', memo: '3회 평균' },
        { item: '수분율', spec: '0.3% 이하', value: '0.18', judge: '합격', memo: '' },
        { item: '이물·금속', spec: '검출되지 않음', value: '0', judge: '합격', memo: '육안 전수' },
        { item: '포장 중량', spec: '25kg ±0.2kg', value: '25.05', judge: '합격', memo: '20포대 표본' },
        { item: '색상 편차', spec: '표준 색상 대비 ΔE 2 이내', value: '1.4', judge: '합격', memo: '색차계 측정' }
      ]
    }],
    blocks: [
      { t: 'kv', rows: [['로트 번호', 'lotNo'], ['Invoice No.', 'invoiceNo'], ['공급처', 'supplier'], ['품명', 'item'], ['검사 수량', 'qty'], ['검사일', function (d) { return dko(d.f.inspectDate); }], ['검사자', 'inspector'], ['종합 판정', 'result']] },
      { t: 'table', set: 'rows', head: ['검사 항목', '기준', '측정값', '판정', '비고'], cols: [{ k: 'item', h: '검사 항목' }, { k: 'spec', h: '기준' }, { k: 'value', h: '측정값', t: 'center' }, { k: 'judge', h: '판정', t: 'center' }, { k: 'memo', h: '비고' }] },
      sec('조치 사항', 'action'),
      sec('비고', 'memo'),
      body('위 검사 결과를 확인하며, 판정에 이의가 있는 경우 검사일로부터 7일 내 서면으로 통지합니다.'),
      sign(['A', 'B'], function (d) { return dko(d.f.inspectDate) + ' · 검사자와 구매 담당이 확인합니다.'; }),
      note('※ 수입 원료는 입고 전 로트별 시험성적서와 실제 측정값을 대조하세요. 불합격 판정 시 사진·샘플을 보관하고, 공급처와 반품·재발송 조건을 계약서에 따라 통지해야 합니다.')
    ]
  });

  /* ---------------------------------------------------------
     5. 운송료 견적 비교표
  --------------------------------------------------------- */
  add({
    id: 'freight-quote', cat: 'trade', sub: 'tr-ship', no: '08', kind: 'excel',
    name: '운송료 견적 비교표', en: 'FREIGHT QUOTE COMPARISON',
    keywords: '운송료 견적 비교 포워더 해상운임 항공운임 LCL FCL 운임 비교',
    fields: [
      { g: '문서', k: 'docName', l: '문서명', d: '2027년 1월 부산→난사 운송 견적 비교', w: 2 },
      { g: '문서', k: 'period', l: '기준일', d: today(), w: 2 },
      { g: '문서', k: 'writer', l: '작성자', d: '김철수' },
      { g: '조건', k: 'route', l: '구간', d: 'BUSAN → NANSHA', w: 2 },
      { g: '조건', k: 'cargo', l: '화물', d: '재생원료 25톤 / 40FT 1대', w: 2 },
      { g: '조건', k: 'terms', l: '운임 조건', t: 'sel', opts: ['FOB', 'CIF', 'CFR', 'EXW'], d: 'FOB' }
    ],
    sets: [{
      k: 'rows', label: '포워더별 견적', addLabel: '업체 추가',
      cols: [
        { k: 'vendor', h: '포워더', w: '20%', d: 'A로지스' },
        { k: 'freight', h: '해상운임(USD)', t: 'num', w: '16%', d: '850' },
        { k: 'thc', h: 'THC·부대비(USD)', t: 'num', w: '16%', d: '320' },
        { k: 'doc', h: '서류비(USD)', t: 'num', w: '12%', d: '60' },
        { k: 'days', h: '소요일', t: 'num', w: '10%', d: '5' },
        { k: 'memo', h: '비고', w: '26%', d: '주 2회 출항, 스케줄 안정' }
      ],
      def: [
        { vendor: 'A로지스', freight: '850', thc: '320', doc: '60', days: '5', memo: '주 2회 출항, 스케줄 안정' },
        { vendor: 'B쉬핑', freight: '790', thc: '350', doc: '50', days: '7', memo: '주 1회 출항' },
        { vendor: 'C포워딩', freight: '920', thc: '300', doc: '70', days: '4', memo: '직항, 서류 대행 포함' }
      ]
    }],
    table: {
      set: 'rows', empty: 4,
      cols: [
        { k: 'vendor', h: '포워더' },
        { k: 'freight', h: '해상운임', t: 'num' }, { k: 'thc', h: '부대비', t: 'num' }, { k: 'doc', h: '서류비', t: 'num' },
        { k: 'total', h: '합계(USD)', t: 'num', calc: function (r) { return H.num(r.freight) + H.num(r.thc) + H.num(r.doc); } },
        { k: 'krw', h: '원화 환산', t: 'num', calc: function (r) { return Math.round((H.num(r.freight) + H.num(r.thc) + H.num(r.doc)) * 1420); } },
        { k: 'days', h: '소요일', t: 'num' }, { k: 'memo', h: '비고' }
      ],
      foot: [{ l: '합계', colspan: 1, align: 'right' }, { v: function (d) { return sum(d, 'rows', 'freight'); } }, { v: function (d) { return sum(d, 'rows', 'thc'); } }, { v: function (d) { return sum(d, 'rows', 'doc'); } }, { v: function (d) { return sum(d, 'rows', 'total'); } }, { v: function (d) { return sum(d, 'rows', 'krw'); } }, { v: '' }, { v: '' }],
      noteText: '원화 환산은 1 USD = 1,420원을 가정한 참고값입니다. 실제 정산 환율과 부대비(THC·서류비·통관비)를 반영해 비교하세요. 소요일은 출항일 기준 항해일수입니다.'
    },
    summary: [
      { l: '최저 합계', v: function (d) { var r2 = d.sets.rows || []; return r2.length ? Math.min.apply(null, r2.map(function (x) { return H.num(x.freight) + H.num(x.thc) + H.num(x.doc); })) : 0; }, unit: 'USD' },
      { l: '최단 소요일', v: function (d) { var r2 = d.sets.rows || []; return r2.length ? Math.min.apply(null, r2.map(function (x) { return H.num(x.days); })) : 0; }, unit: '일' },
      { l: '비교 업체 수', v: function (d) { return (d.sets.rows || []).length; }, unit: '곳', grand: true }
    ],
    csv: function (d) {
      var out = [['포워더', '해상운임', '부대비', '서류비', '합계(USD)', '원화환산', '소요일', '비고']];
      (d.sets.rows || []).forEach(function (r) {
        var t = H.num(r.freight) + H.num(r.thc) + H.num(r.doc);
        out.push([r.vendor, H.num(r.freight), H.num(r.thc), H.num(r.doc), t, Math.round(t * 1420), H.num(r.days), r.memo]);
      });
      return out;
    },
    fileBase: 'freight-quote'
  });

  function n(v) { return H.num(v); }
})(typeof window !== 'undefined' ? window : this);
