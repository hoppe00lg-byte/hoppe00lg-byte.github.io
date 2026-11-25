/* =========================================================
   INSIGHT BRIEF — 서식 정의 (forms.html)
   모든 서식 문구·표 구성·레이아웃은 이 사이트에서 직접 작성했습니다.
   외부 서식 사이트의 문구·파일·레이아웃을 복제하지 않았습니다.
   ========================================================= */
(function (root) {
  'use strict';
  var H = root.IBF;
  var text = H.text, fmt = H.fmt, won = H.won, kor = H.korMoneyFull;
  var dko = H.dateKo, today = H.todayISO, addY = H.addYears, addM = H.addMonths, addD = H.addDays;
  var term = H.termText, vat = H.vat, sum = H.setSum;

  /* ---------------------------------------------------------
     카테고리 · 소분류
  --------------------------------------------------------- */
  var CATS = [
    {
      id: 'doc', no: '01', name: '문서서식', sub: '근로·거래·증명 9종',
      subs: [
        { id: 'hr', name: '인사·노무' },
        { id: 'sales', name: '영업·구매' },
        { id: 'acct', name: '회계·경리' },
        { id: 'legal', name: '총무·법률' }
      ]
    },
    {
      id: 'excel', no: '02', name: '엑셀', sub: '자동계산 · CSV',
      subs: [
        { id: 'ex-expense', name: '경비·지출' },
        { id: 'ex-sales', name: '매입·매출' },
        { id: 'ex-pay', name: '급여·인사' }
      ]
    },
    {
      id: 'ppt', no: '03', name: '파워포인트', sub: '16:9 · PDF',
      subs: [
        { id: 'pt-company', name: '회사·영업' },
        { id: 'pt-proposal', name: '제안·수주' },
        { id: 'pt-report', name: '보고·회의' }
      ]
    },
    {
      id: 'plan', no: '04', name: '사업계획서', sub: '정책자금·투자',
      subs: [{ id: 'pl-main', name: '사업계획서' }]
    },
    {
      id: 'contract', no: '05', name: '계약서', sub: '동업·위탁·공급',
      subs: [
        { id: 'ct-partner', name: '동업·공동사업' },
        { id: 'ct-free', name: '외주·위탁' },
        { id: 'ct-supply', name: '물품·납품' }
      ]
    },
    {
      id: 'resume', no: '06', name: '자기소개서', sub: '글자수 카운터',
      subs: [{ id: 'rs-main', name: '자소서·이력' }]
    },
    {
      id: 'en', no: '07', name: '영문서식', sub: '영문 증명·위임',
      subs: [
        { id: 'en-cert', name: '증명·재직' },
        { id: 'en-poa', name: '위임·대리' },
        { id: 'en-letter', name: '비즈니스 레터' }
      ]
    },
    {
      id: 'sign', no: '08', name: '온라인도장', sub: '도장·서명·요청',
      subs: [
        { id: 'sg-seal', name: '도장 제작' },
        { id: 'sg-sign', name: '서명·요청' }
      ]
    }
  ];

  var DOCS = {};
  function add(d) { DOCS[d.id] = d; return d; }

  /* ---------------------------------------------------------
     공통 표 블록 도우미
  --------------------------------------------------------- */
  function signOnly(d, keys) {
    return '<div class="fm-signrow ' + (keys.length === 3 ? 'p3' : keys.length === 1 ? 'p1' : 'p2') + '">' +
      keys.map(function (k) { return H.signBoxFor(d, k); }).join('') + '</div>';
  }
  function cards(items, cls) {
    return '<div class="fm-cards ' + (cls || 'c3') + '">' + items.map(function (inner) {
      return '<div class="fm-card">' + inner + '</div>';
    }).join('') + '</div>';
  }
  function tl(rows) {
    return '<div class="fm-tl">' + rows.map(function (r) {
      return '<div><b>' + H.esc(r[0]) + '</b><span>' + H.esc(r[1]) + '</span></div>';
    }).join('') + '</div>';
  }

  /* =========================================================
     01. 문서서식
  ========================================================= */

  add({
    id: 'labor', cat: 'doc', sub: 'hr', no: '01',
    name: '표준근로계약서', en: 'STANDARD LABOR CONTRACT',
    keywords: '근로계약서 근로기준법 근로조건 임금 연차 4대보험 고용노동부 표준',
    head: { sub: 'STANDARD LABOR CONTRACT', meta: [['작성일', 'signDate'], ['근로자', 'workerName']] },
    parties: [{ k: 'A', label: '사업주(갑)', nameKey: 'ceo' }, { k: 'B', label: '근로자(을)', nameKey: 'workerName' }],
    fields: [
      { g: '사업주', k: 'company', l: '상호', d: '○○상사' },
      { g: '사업주', k: 'ceo', l: '대표자', d: '홍길동' },
      { g: '사업주', k: 'empAddr', l: '사업장 주소', d: '서울특별시 영등포구 여의대로 108', w: 2 },
      { g: '사업주', k: 'empTel', l: '연락처', d: '02-0000-0000' },
      { g: '근로자', k: 'workerName', l: '성명', d: '김철수' },
      { g: '근로자', k: 'workerBirth', l: '생년월일', t: 'date', d: '1990-01-01' },
      { g: '근로자', k: 'workerAddr', l: '주소', d: '서울특별시 영등포구 여의대로 108', w: 2 },
      { g: '근로자', k: 'workerTel', l: '연락처', d: '010-0000-0000' },
      { g: '계약 조건', k: 'startDate', l: '시작일', t: 'date', d: today() },
      { g: '계약 조건', k: 'endDate', l: '종료일', t: 'date', d: addY(today(), 1) },
      { g: '계약 조건', k: 'workplace', l: '근무장소', d: '서울특별시 영등포구 여의대로 108 (본사)', w: 2 },
      { g: '계약 조건', k: 'job', l: '업무내용', d: '영업관리 및 거래처 응대', w: 2 },
      { g: '계약 조건', k: 'dailyHours', l: '1일 근로시간', d: '8', h: '시간' },
      { g: '계약 조건', k: 'weekHours', l: '주 근로시간', d: '40', h: '시간' },
      { g: '계약 조건', k: 'workDays', l: '근무일', d: '월요일 ~ 금요일' },
      { g: '계약 조건', k: 'breakTime', l: '휴게시간', d: '12:00 ~ 13:00 (1시간)' },
      { g: '임금', k: 'wageType', l: '임금 형태', t: 'sel', opts: ['월급', '시급', '일급'], d: '월급' },
      { g: '임금', k: 'wageAmount', l: '임금액', t: 'num', d: '2400000', h: '원' },
      { g: '임금', k: 'payDay', l: '지급일', d: '매월 10일' },
      { g: '임금', k: 'payMethod', l: '지급방법', d: '근로자 명의 예금계좌 이체' },
      { g: '근로조건', k: 'annual', l: '연차유급휴가', d: '근로기준법 제60조에 따른다', w: 2 },
      { g: '근로조건', k: 'insurance', l: '4대보험', t: 'sel', opts: ['가입', '가입하지 않음'], d: '가입' },
      { g: '근로조건', k: 'etc', l: '기타 특약', t: 'area', d: '', w: 2, rows: 2, ph: '없으면 비워 두세요' },
      { g: '작성', k: 'signDate', l: '작성일', t: 'date', d: today() }
    ],
    blocks: [
      {
        t: 'parties', cols: [
          { title: '사업주(갑)', rows: [['상호', 'company'], ['대표자', 'ceo'], ['주소', 'empAddr'], ['연락처', 'empTel']] },
          { title: '근로자(을)', rows: [['성명', 'workerName'], ['생년월일', 'workerBirth'], ['주소', 'workerAddr'], ['연락처', 'workerTel']] }
        ]
      },
      { t: 'sec', h: '제1조 (계약기간)', v: function (d) { return dko(d.f.startDate) + '부터 ' + dko(d.f.endDate) + '까지로 한다.'; } },
      {
        t: 'sec', h: '제2조 (근무장소와 업무)', v: function (d) {
          return '근로자는 사업주가 정한 다음 장소에서 다음 업무를 수행한다.\n· 근무장소: ' + d.f.workplace + '\n· 업무내용: ' + d.f.job;
        }
      },
      {
        t: 'sec', h: '제3조 (소정근로시간·휴게)', v: function (d) {
          return '1일 ' + d.f.dailyHours + '시간, 주 ' + d.f.weekHours + '시간을 근로하며, 근무일은 ' + d.f.workDays +
            '로 한다. 휴게시간은 ' + d.f.breakTime + '으로 한다. 주휴일은 근로기준법이 정한 바에 따른다.';
        }
      },
      {
        t: 'sec', h: '제4조 (임금)', v: function (d) {
          return '임금은 ' + d.f.wageType + ' ' + won(d.f.wageAmount) + '으로 하며, ' + d.f.payDay + '에 ' + d.f.payMethod +
            ' 방법으로 지급한다. 임금 계산 기간은 매월 1일부터 그 달의 말일까지로 한다.';
        }
      },
      { t: 'sec', h: '제5조 (연차유급휴가)', v: function (d) { return '연차유급휴가는 ' + d.f.annual + '. 사용 시기는 근로자와 사업주가 협의해 정한다.'; } },
      {
        t: 'sec', h: '제6조 (4대보험)', v: function (d) {
          return d.f.insurance === '가입'
            ? '사업주는 근로자를 국민연금·건강보험·고용보험·산업재해보상보험에 가입시킨다.'
            : '이 계약은 4대보험 가입 대상이 아닌 근로조건으로 한다. 사업주와 근로자는 관계 법령이 정한 절차를 따른다.';
        }
      },
      { t: 'sec', h: '제7조 (기타)', v: function (d) { return d.f.etc ? d.f.etc : '이 계약에 정하지 않은 사항은 근로기준법과 관계 법령에 따른다.'; } },
      { t: 'sec', h: '제8조 (계약서 교부)', v: function () { return '사업주는 이 계약서를 2부 작성해 근로자에게 1부를 교부한다.'; } },
      { t: 'body', v: function () { return '사업주와 근로자는 위 근로조건을 확인하고 이 계약을 체결한다.'; } },
      {
        t: 'sign', parties: ['A', 'B'],
        note: function (d) { return '작성일 ' + dko(d.f.signDate) + ' · 서명 또는 도장을 날인합니다.'; }
      },
      { t: 'note', v: function () { return '※ 이 서식은 근로기준법 제17조가 정한 근로조건 명시를 돕기 위한 자체 제작 표준 서식입니다. 4대보험은 법령상 가입 대상이면 반드시 가입해야 하며, 대상이 아닌 경우에만 ‘가입하지 않음’을 고르세요. 기간제·단시간 근로는 별도 조건을 확인하세요.'; } }
    ]
  });

  add({
    id: 'career', cat: 'doc', sub: 'hr', no: '02',
    name: '재직·경력증명서', en: 'CERTIFICATE OF EMPLOYMENT',
    keywords: '재직증명서 경력증명서 재직기간 직인 발급 은행 제출',
    head: {
      kind: function (d) { return d.f.kind === '경력' ? '경력증명서' : '재직증명서'; },
      sub: 'CERTIFICATE OF EMPLOYMENT',
      co: function (d) { return d.f.company + ' · 대표자 ' + d.f.ceo; },
      meta: [['발급번호', 'docNo'], ['발급일', 'issueDate']]
    },
    parties: [{ k: 'A', label: '발급자(직인)', nameKey: 'ceo' }],
    fields: [
      { g: '증명 종류', k: 'kind', l: '종류', t: 'sel', opts: ['재직', '경력'], d: '재직', w: 2 },
      { g: '회사', k: 'company', l: '회사명', d: '○○상사' },
      { g: '회사', k: 'ceo', l: '대표자', d: '홍길동' },
      { g: '회사', k: 'regNo', l: '사업자등록번호', d: '000-00-00000' },
      { g: '회사', k: 'addr', l: '주소', d: '서울특별시 영등포구 여의대로 108', w: 2 },
      { g: '회사', k: 'tel', l: '연락처', d: '02-0000-0000' },
      { g: '대상자', k: 'name', l: '성명', d: '김철수' },
      { g: '대상자', k: 'birth', l: '생년월일', t: 'date', d: '1990-01-01' },
      { g: '대상자', k: 'dept', l: '소속·부서', d: '영업1팀' },
      { g: '대상자', k: 'position', l: '직위', d: '대리' },
      { g: '재직 기간', k: 'joinDate', l: '입사일', t: 'date', d: '2022-03-02' },
      { g: '재직 기간', k: 'leaveDate', l: '퇴사일(경력)', t: 'date', d: '' },
      { g: '발급', k: 'purpose', l: '용도', d: '금융기관 제출용', w: 2 },
      { g: '발급', k: 'docNo', l: '발급번호', d: '2026-0001' },
      { g: '발급', k: 'issueDate', l: '발급일', t: 'date', d: today() }
    ],
    blocks: [
      {
        t: 'kv', rows: [
          ['성명', 'name'], ['생년월일', 'birth'], ['소속·직위', function (d) { return d.f.dept + ' / ' + d.f.position; }],
          ['재직기간', function (d) { return dko(d.f.joinDate) + ' ~ ' + (d.f.kind === '경력' && d.f.leaveDate ? dko(d.f.leaveDate) : '현재') + ' (' + term(d.f.joinDate, d.f.kind === '경력' ? d.f.leaveDate : '') + ')'; }],
          ['용도', 'purpose']
        ]
      },
      {
        t: 'body', v: function (d) {
          if (d.f.kind === '경력') {
            return '위 사람은 ' + dko(d.f.joinDate) + '부터 ' + dko(d.f.leaveDate) + '까지 본 회사 ' + d.f.dept +
              '에서 ' + d.f.position + '으로 근무하였음을 증명합니다.';
          }
          return '위 사람은 ' + dko(d.f.joinDate) + '부터 현재까지 본 회사 ' + d.f.dept + '에서 ' + d.f.position +
            '으로 재직하고 있음을 증명합니다.';
        }
      },
      { t: 'center', v: function (d) { return dko(d.f.issueDate); } },
      { t: 'center', v: function (d) { return d.f.company + '  대표자  ' + d.f.ceo + '  (직인)'; }, cls: 'fm-doc-sub' },
      { t: 'sign', parties: ['A'], note: function () { return '대표자 직인을 날인합니다. 발급 사실 확인이 필요하면 회사 연락처로 문의하세요.'; } },
      { t: 'note', v: function (d) { return '※ 이 증명서는 ' + d.f.purpose + '으로만 사용해 주세요. 발급번호 ' + d.f.docNo + ' · 문의 ' + d.f.tel; } }
    ]
  });

  add({
    id: 'po', cat: 'doc', sub: 'sales', no: '03',
    name: '발주서 (Purchase Order)', en: 'PURCHASE ORDER',
    keywords: '발주서 구매 발주 품목 납기 부가세 구매발주서 PO',
    head: { sub: 'PURCHASE ORDER', meta: [['발주번호', 'poNo'], ['발주일', 'orderDate'], ['납기일', 'dueDate']] },
    parties: [{ k: 'A', label: '발주처', nameKey: 'buyerCeo' }, { k: 'B', label: '공급자 확인', nameKey: 'supplierCeo' }],
    fields: [
      { g: '발주 정보', k: 'poNo', l: '발주번호', d: 'PO-2026-1123-001' },
      { g: '발주 정보', k: 'orderDate', l: '발주일', t: 'date', d: today() },
      { g: '발주 정보', k: 'dueDate', l: '납기일', t: 'date', d: addD(today(), 14) },
      { g: '발주처', k: 'buyer', l: '상호', d: '○○상사' },
      { g: '발주처', k: 'buyerCeo', l: '대표자', d: '홍길동' },
      { g: '발주처', k: 'buyerAddr', l: '주소', d: '서울특별시 영등포구 여의대로 108', w: 2 },
      { g: '발주처', k: 'buyerTel', l: '연락처', d: '02-0000-0000' },
      { g: '공급자', k: 'supplier', l: '상호', d: '△△물산' },
      { g: '공급자', k: 'supplierCeo', l: '대표자', d: '김철수' },
      { g: '공급자', k: 'supplierAddr', l: '주소', d: '부산광역시 사상구 낙동대로 100', w: 2 },
      { g: '공급자', k: 'supplierTel', l: '연락처', d: '051-000-0000' },
      { g: '납품 조건', k: 'shipTo', l: '납품장소', d: '서울특별시 영등포구 여의대로 108 ○○상사 창고', w: 2 },
      { g: '납품 조건', k: 'terms', l: '결제조건', d: '납품 검수 후 30일 이내 현금 결제', w: 2 },
      { g: '납품 조건', k: 'noteText', l: '요청사항', t: 'area', d: '납품 시 거래명세서와 시험성적서를 함께 보내 주세요.', w: 2, rows: 2 }
    ],
    sets: [{
      k: 'rows', label: '발주 품목', addLabel: '품목 추가',
      cols: [
        { k: 'name', h: '품목', w: '30%', d: 'ABS 재생원료' },
        { k: 'spec', h: '규격', w: '28%', d: '검정, 25kg 포장' },
        { k: 'qty', h: '수량', t: 'num', w: '14%', d: '1000' },
        { k: 'price', h: '단가', t: 'num', w: '14%', d: '1200' },
        { k: 'amount', h: '공급가액', t: 'num', w: '14%', calc: function (r) { return H.num(r.qty) * H.num(r.price); } }
      ],
      def: [{ name: 'ABS 재생원료', spec: '검정, 25kg 포장', qty: '1000', price: '1200' }]
    }],
    blocks: [
      {
        t: 'parties', cols: [
          { title: '발주처', rows: [['상호', 'buyer'], ['대표자', 'buyerCeo'], ['주소', 'buyerAddr'], ['연락처', 'buyerTel']] },
          { title: '공급자', rows: [['상호', 'supplier'], ['대표자', 'supplierCeo'], ['주소', 'supplierAddr'], ['연락처', 'supplierTel']] }
        ]
      },
      {
        t: 'table', set: 'rows', empty: 3,
        head: ['품목', '규격', '수량', '단가', '공급가액'],
        cols: [
          { k: 'name', h: '품목' }, { k: 'spec', h: '규격' },
          { k: 'qty', h: '수량', t: 'num' }, { k: 'price', h: '단가', t: 'num' },
          { k: 'amount', h: '공급가액', t: 'num', calc: function (r) { return H.num(r.qty) * H.num(r.price); } }
        ],
        foot: [{ l: '합계 (부가세 별도)', colspan: 4, align: 'right' }, { v: '' }]
      },
      {
        t: 'sums', rows: [
          { l: '공급가액', v: function (d) { return sum(d, 'rows', 'amount'); } },
          { l: '부가세 (10%)', v: function (d) { return vat(sum(d, 'rows', 'amount')); } },
          { l: '합계', v: function (d) { return sum(d, 'rows', 'amount') + vat(sum(d, 'rows', 'amount')); }, grand: true }
        ]
      },
      { t: 'sec', h: '납품 및 결제', v: function (d) { return '· 납품장소: ' + d.f.shipTo + '\n· 납기일: ' + dko(d.f.dueDate) + '\n· 결제조건: ' + d.f.terms; } },
      { t: 'sec', h: '요청사항', v: function (d) { return d.f.noteText || '없음'; } },
      { t: 'sign', parties: ['A', 'B'], note: function (d) { return '발주일 ' + dko(d.f.orderDate) + ' · 발주처 담당자와 공급자 확인 서명란입니다. 공급자는 주문 내용을 확인한 뒤 서명해 주세요.'; } },
      { t: 'note', v: function () { return '※ 이 발주서는 주문 내용 확인을 위한 문서입니다. 공급자가 서명한 발주서 사본을 받아 두면 납기·수량 분쟁을 줄일 수 있습니다.'; } }
    ]
  });

  add({
    id: 'statement', cat: 'doc', sub: 'sales', no: '04',
    name: '거래명세서', en: 'STATEMENT OF TRANSACTION',
    keywords: '거래명세서 거래내역 공급자 공급받는자 인수 세금계산서',
    head: { sub: 'STATEMENT OF TRANSACTION', meta: [['작성일', 'issueDate'], ['합계금액', function (d) { return won(sum(d, 'rows', 'amount')); }]] },
    parties: [{ k: 'A', label: '공급자', nameKey: 'supplierCeo' }, { k: 'B', label: '인수자', nameKey: 'buyerCeo' }],
    fields: [
      { g: '공급자', k: 'supplierName', l: '상호', d: '○○상사' },
      { g: '공급자', k: 'supplierRegNo', l: '사업자등록번호', d: '000-00-00000' },
      { g: '공급자', k: 'supplierCeo', l: '대표자', d: '홍길동' },
      { g: '공급자', k: 'supplierAddr', l: '주소', d: '서울특별시 영등포구 여의대로 108', w: 2 },
      { g: '공급자', k: 'supplierBiz', l: '업태·종목', d: '도소매 / 산업용품', w: 2 },
      { g: '공급받는자', k: 'buyerName', l: '상호', d: '△△물산' },
      { g: '공급받는자', k: 'buyerRegNo', l: '사업자등록번호', d: '111-11-11111' },
      { g: '공급받는자', k: 'buyerCeo', l: '대표자', d: '김철수' },
      { g: '공급받는자', k: 'buyerAddr', l: '주소', d: '부산광역시 사상구 낙동대로 100', w: 2 },
      { g: '공급받는자', k: 'buyerBiz', l: '업태·종목', d: '제조 / 플라스틱', w: 2 },
      { g: '거래', k: 'issueDate', l: '작성일', t: 'date', d: today() },
      { g: '거래', k: 'bank', l: '입금계좌', d: '○○은행 000-000-000000 (예금주 ○○상사)', w: 2 }
    ],
    sets: [{
      k: 'rows', label: '거래 품목', addLabel: '품목 추가',
      cols: [
        { k: 'date', h: '일자', t: 'date', w: '16%', d: today() },
        { k: 'name', h: '품목', w: '34%', d: 'ABS 재생원료' },
        { k: 'spec', h: '규격', w: '24%', d: '검정, 25kg' },
        { k: 'qty', h: '수량', t: 'num', w: '12%', d: '1000' },
        { k: 'price', h: '단가', t: 'num', w: '14%', d: '1200' }
      ],
      def: [{ date: today(), name: 'ABS 재생원료', spec: '검정, 25kg', qty: '1000', price: '1200' }]
    }],
    blocks: [
      {
        t: 'parties', cols: [
          { title: '공급자', rows: [['등록번호', 'supplierRegNo'], ['상호', 'supplierName'], ['대표자', 'supplierCeo'], ['주소', 'supplierAddr'], ['업태/종목', 'supplierBiz']] },
          { title: '공급받는자', rows: [['등록번호', 'buyerRegNo'], ['상호', 'buyerName'], ['대표자', 'buyerCeo'], ['주소', 'buyerAddr'], ['업태/종목', 'buyerBiz']] }
        ]
      },
      {
        t: 'table', set: 'rows', empty: 3,
        head: ['일자', '품목', '규격', '수량', '단가', '금액'],
        cols: [
          { k: 'date', h: '일자', t: 'center' }, { k: 'name', h: '품목' }, { k: 'spec', h: '규격' },
          { k: 'qty', h: '수량', t: 'num' }, { k: 'price', h: '단가', t: 'num' },
          { k: 'amount', h: '금액', t: 'num', calc: function (r) { return H.num(r.qty) * H.num(r.price); } }
        ]
      },
      {
        t: 'sums', rows: [
          { l: '공급가액', v: function (d) { return sum(d, 'rows', 'amount'); } },
          { l: '세액 (10%)', v: function (d) { return vat(sum(d, 'rows', 'amount')); } },
          { l: '합계금액', v: function (d) { return sum(d, 'rows', 'amount') + vat(sum(d, 'rows', 'amount')); }, grand: true }
        ]
      },
      { t: 'note', v: function (d) { return '입금계좌: ' + d.f.bank + ' · 위와 같이 거래 내역을 확인합니다.'; } },
      { t: 'sign', parties: ['A', 'B'], note: function () { return '공급자와 인수자가 각각 서명 또는 날인합니다. 인수자의 서명은 물품을 인수했다는 확인입니다.'; } },
      { t: 'note', v: function () { return '※ 이 명세서는 거래 내용 확인용이며 세금계산서 발행을 대신하지 않습니다. 세금계산서는 전자세금계산서로 따로 발급하세요.'; } }
    ]
  });

  add({
    id: 'expense', cat: 'doc', sub: 'acct', no: '05',
    name: '지출결의서 · 품의서', en: 'EXPENSE APPROVAL',
    keywords: '지출결의서 품의서 결재선 기안자 전표 증빙',
    head: {
      kind: function (d) { return d.f.kind === '품의서' ? '품의서' : '지출결의서'; },
      sub: 'EXPENSE / APPROVAL REQUEST',
      meta: [['문서번호', 'docNo'], ['기안일', 'draftDate']]
    },
    parties: [
      { k: 'A', label: '담당', nameKey: 'drafter' },
      { k: 'B', label: '검토', nameKey: 'reviewer' },
      { k: 'C', label: '승인', nameKey: 'approver' }
    ],
    fields: [
      { g: '문서', k: 'kind', l: '종류', t: 'sel', opts: ['지출결의서', '품의서'], d: '지출결의서', w: 2 },
      { g: '문서', k: 'docNo', l: '문서번호', d: 'EXP-2026-1123-01' },
      { g: '문서', k: 'draftDate', l: '기안일', t: 'date', d: today() },
      { g: '기안', k: 'drafter', l: '기안자', d: '홍길동' },
      { g: '기안', k: 'dept', l: '소속·부서', d: '경영지원팀' },
      { g: '기안', k: 'reviewer', l: '검토자', d: '김철수' },
      { g: '기안', k: 'approver', l: '승인자', d: '박영희' },
      { g: '지출 내용', k: 'title', l: '건명', d: '11월 사무실 임차료 지출', w: 2 },
      { g: '지출 내용', k: 'account', l: '계정과목', d: '판매관리비 / 임차료' },
      { g: '지출 내용', k: 'payTo', l: '지급처', d: '○○빌딩 관리사무소' },
      { g: '지출 내용', k: 'payDate', l: '지급(예정)일', t: 'date', d: today() },
      { g: '지출 내용', k: 'method', l: '지급방법', d: '계좌이체' },
      { g: '지출 내용', k: 'detail', l: '산출 내역·사유', t: 'area', d: '11월분 사무실 임차료(보증금 별도), 관리비 포함', w: 2, rows: 3 }
    ],
    sets: [{
      k: 'rows', label: '지출 내역', addLabel: '내역 추가',
      cols: [
        { k: 'item', h: '적요', w: '66%', d: '11월 사무실 임차료' },
        { k: 'amount', h: '금액', t: 'num', w: '34%', d: '1500000' }
      ],
      def: [{ item: '11월 사무실 임차료', amount: '1500000' }]
    }],
    blocks: [
      {
        t: 'approval', head: '결재',
        parties: [
          { k: 'A', label: '담당', nameKey: 'drafter' },
          { k: 'B', label: '검토', nameKey: 'reviewer' },
          { k: 'C', label: '승인', nameKey: 'approver' }
        ]
      },
      { t: 'kv', rows: [['기안자', function (d) { return d.f.drafter + ' / ' + d.f.dept; }], ['건명', 'title'], ['계정과목', 'account'], ['지급처', 'payTo'], ['지급일', 'payDate'], ['지급방법', 'method']] },
      {
        t: 'table', set: 'rows', empty: 3, head: ['적요', '금액'],
        cols: [{ k: 'item', h: '적요' }, { k: 'amount', h: '금액', t: 'num' }],
        foot: [{ l: '합계', align: 'right' }, { v: '' }]
      },
      { t: 'amount', v: function (d) { return kor(sum(d, 'rows', 'amount')); }, sub: function (d) { return '₩ ' + fmt(sum(d, 'rows', 'amount')); } },
      { t: 'sec', h: '산출 내역 및 사유', v: 'detail' },
      { t: 'note', v: function () { return '위와 같이 지출(품의)하고자 합니다. 첨부: 세금계산서·영수증 등 증빙 사본.'; } },
      { t: 'note', v: function () { return '※ 결재란은 담당·검토·승인 순서로 서명합니다. 서명 요청 링크로 검토자·승인자에게 차례로 보낼 수 있습니다.'; } }
    ]
  });

  add({
    id: 'receipt', cat: 'doc', sub: 'acct', no: '06',
    name: '영수증', en: 'RECEIPT',
    keywords: '영수증 현금 영수 수령인 지급인 용지',
    head: { sub: 'RECEIPT', meta: [['작성일', 'issueDate'], ['금액', function (d) { return won(d.f.amount); }]] },
    parties: [{ k: 'A', label: '수령인', nameKey: 'receiver' }, { k: 'B', label: '지급인', nameKey: 'payer' }],
    fields: [
      { g: '영수 정보', k: 'issueDate', l: '작성일', t: 'date', d: today() },
      { g: '영수 정보', k: 'amount', l: '금액', t: 'num', d: '2000000', h: '원' },
      { g: '영수 정보', k: 'method', l: '지급방법', d: '계좌이체' },
      { g: '당사자', k: 'receiver', l: '수령인', d: '홍길동' },
      { g: '당사자', k: 'receiverAddr', l: '수령인 주소', d: '서울특별시 영등포구 여의대로 108', w: 2 },
      { g: '당사자', k: 'payer', l: '지급인', d: '김철수' },
      { g: '당사자', k: 'payerAddr', l: '지급인 주소', d: '부산광역시 사상구 낙동대로 100', w: 2 },
      { g: '내용', k: 'item', l: '영수 내역', t: 'area', d: '2026년 11월분 자문료', w: 2, rows: 3 }
    ],
    blocks: [
      { t: 'amount', v: function (d) { return kor(d.f.amount); }, sub: function (d) { return '₩ ' + fmt(d.f.amount); } },
      { t: 'body', v: function () { return '위 금액을 정히 영수하였습니다.'; } },
      { t: 'kv', rows: [['영수 내역', 'item'], ['지급방법', 'method'], ['작성일', 'issueDate']] },
      { t: 'parties', cols: [{ title: '수령인', rows: [['성명', 'receiver'], ['주소', 'receiverAddr']] }, { title: '지급인', rows: [['성명', 'payer'], ['주소', 'payerAddr']] }] },
      { t: 'sign', parties: ['A', 'B'], note: '수령인과 지급인이 각각 서명 또는 날인합니다.' },
      { t: 'note', v: '※ 이 영수증은 당사자 간 확인용입니다. 세금계산서·현금영수증 발급을 대신하지 않습니다.' }
    ]
  });

  add({
    id: 'delegation', cat: 'doc', sub: 'legal', no: '07',
    name: '위임장', en: 'POWER OF ATTORNEY',
    keywords: '위임장 대리인 위임인 수임인 관공서 제출',
    head: { sub: 'POWER OF ATTORNEY', meta: [['작성일', 'issueDate'], ['용도', 'purpose']] },
    parties: [{ k: 'A', label: '위임인', nameKey: 'delegator' }, { k: 'B', label: '수임인(확인)', nameKey: 'delegatee' }],
    fields: [
      { g: '위임인', k: 'delegator', l: '성명', d: '홍길동' },
      { g: '위임인', k: 'delegatorBirth', l: '생년월일', t: 'date', d: '1974-06-05' },
      { g: '위임인', k: 'delegatorAddr', l: '주소', d: '서울특별시 영등포구 여의대로 108', w: 2 },
      { g: '위임인', k: 'delegatorTel', l: '연락처', d: '010-0000-0000' },
      { g: '수임인', k: 'delegatee', l: '성명', d: '김철수' },
      { g: '수임인', k: 'delegateeBirth', l: '생년월일', t: 'date', d: '1990-01-01' },
      { g: '수임인', k: 'delegateeAddr', l: '주소', d: '부산광역시 사상구 낙동대로 100', w: 2 },
      { g: '수임인', k: 'delegateeTel', l: '연락처', d: '010-1111-1111' },
      { g: '위임 내용', k: 'addressee', l: '제출처', d: '서울특별시 영등포구청장 귀중', w: 2 },
      { g: '위임 내용', k: 'scope', l: '위임할 사무', t: 'area', d: '○○상사 명의의 사업자등록 변경 신고 및 이에 부수하는 서류 제출·수령', w: 2, rows: 3 },
      { g: '위임 내용', k: 'purpose', l: '용도', d: '관공서 제출용' },
      { g: '위임 내용', k: 'period', l: '위임기간', d: today() + ' ~ ' + addM(today(), 3) },
      { g: '위임 내용', k: 'issueDate', l: '작성일', t: 'date', d: today() }
    ],
    blocks: [
      { t: 'center', v: 'addressee', cls: 'fm-doc-sub' },
      { t: 'body', v: function () { return '본인은 아래 사람을 대리인으로 정하여 다음 사무를 위임합니다.'; } },
      { t: 'sec', h: '위임할 사무', v: 'scope' },
      { t: 'kv', rows: [['위임기간', 'period'], ['용도', 'purpose'], ['작성일', 'issueDate']] },
      {
        t: 'parties', cols: [
          { title: '위임인', rows: [['성명', 'delegator'], ['생년월일', 'delegatorBirth'], ['주소', 'delegatorAddr'], ['연락처', 'delegatorTel']] },
          { title: '수임인', rows: [['성명', 'delegatee'], ['생년월일', 'delegateeBirth'], ['주소', 'delegateeAddr'], ['연락처', 'delegateeTel']] }
        ]
      },
      { t: 'body', v: function (d) { return dko(d.f.issueDate) + '  위임인 ' + d.f.delegator + ' (서명 또는 인)'; } },
      { t: 'sign', parties: ['A', 'B'], note: '위임인이 서명·날인하고, 수임인은 위임 사실을 확인해 서명합니다.' },
      { t: 'note', v: '※ 부동산 등기, 인감증명이 필요한 사무 등 법령이 공증·본인확인을 요구하는 경우에는 이 위임장만으로 처리되지 않을 수 있습니다. 제출처의 요구 서류를 먼저 확인하세요.' }
    ]
  });

  add({
    id: 'loan', cat: 'doc', sub: 'legal', no: '08',
    name: '차용증 (현금보관증)', en: 'LOAN AGREEMENT',
    keywords: '차용증 금전소비대차 현금보관증 이자 변제기 돈빌리기',
    head: { sub: 'LOAN AGREEMENT · CASH CUSTODY', meta: [['작성일', 'loanDate'], ['변제일', 'dueDate']] },
    parties: [{ k: 'A', label: '차용인', nameKey: 'borrower' }, { k: 'B', label: '대여인', nameKey: 'lender' }],
    fields: [
      { g: '차용인', k: 'borrower', l: '성명', d: '홍길동' },
      { g: '차용인', k: 'borrowerBirth', l: '생년월일', t: 'date', d: '1974-06-05' },
      { g: '차용인', k: 'borrowerAddr', l: '주소', d: '서울특별시 영등포구 여의대로 108', w: 2 },
      { g: '차용인', k: 'borrowerTel', l: '연락처', d: '010-0000-0000' },
      { g: '대여인', k: 'lender', l: '성명', d: '김철수' },
      { g: '대여인', k: 'lenderAddr', l: '주소', d: '부산광역시 사상구 낙동대로 100', w: 2 },
      { g: '대여인', k: 'lenderTel', l: '연락처', d: '010-1111-1111' },
      { g: '차용 조건', k: 'amount', l: '차용금액', t: 'num', d: '20000000', h: '원' },
      { g: '차용 조건', k: 'loanDate', l: '차용일', t: 'date', d: today() },
      { g: '차용 조건', k: 'dueDate', l: '변제일', t: 'date', d: addM(today(), 6) },
      { g: '차용 조건', k: 'rate', l: '연 이자율', d: '5', h: '%' },
      { g: '차용 조건', k: 'repayMethod', l: '변제방법', d: '변제일에 원금과 이자를 일시 지급' },
      { g: '차용 조건', k: 'purpose', l: '차용 목적', d: '사업 운영 자금', w: 2 },
      { g: '차용 조건', k: 'place', l: '작성 장소', d: '서울특별시 영등포구' }
    ],
    blocks: [
      { t: 'amount', v: function (d) { return kor(d.f.amount); }, sub: function (d) { return '₩ ' + fmt(d.f.amount); } },
      {
        t: 'body', v: function (d) {
          return '본인은 위 금액을 ' + dko(d.f.loanDate) + ' ' + d.f.lender + '으로부터 차용하였으며, ' +
            dko(d.f.dueDate) + '까지 원금과 약정 이자를 합하여 변제할 것을 확인합니다.\n' +
            '차용 목적: ' + d.f.purpose + '\n변제 방법: ' + d.f.repayMethod;
        }
      },
      { t: 'kv', rows: [['차용금액', function (d) { return won(d.f.amount); }], ['이자율', function (d) { return '연 ' + d.f.rate + '%'; }], ['변제일', 'dueDate'], ['변제방법', 'repayMethod']] },
      {
        t: 'sec', h: '이자 계산', v: function (d) {
          var days = Math.max(0, Math.round((new Date(d.f.dueDate) - new Date(d.f.loanDate)) / 86400000));
          var interest = Math.round(H.num(d.f.amount) * H.num(d.f.rate) / 100 * days / 365);
          return '차용일부터 변제일까지 ' + days + '일 · 약정 이자 ' + won(interest) + ' (원금과 합계 ' + won(H.num(d.f.amount) + interest) + '). 실제 정산 시 일수 계산 방법은 당사자가 다시 확인합니다.';
        }
      },
      { t: 'sign', parties: ['A', 'B'], note: function (d) { return dko(d.f.loanDate) + ' · ' + d.f.place + ' 에서 작성하고 차용인과 대여인이 서명·날인합니다.'; } },
      { t: 'note', v: '※ 이자율은 이자제한법이 정한 최고이자율을 넘을 수 없습니다. 실제 금전 거래에서는 계좌이체 내역 등 이체 사실을 함께 보관하세요. 이 서식은 자체 제작 표준 양식이며 법률 자문이 아닙니다.' }
    ]
  });

  add({
    id: 'agreement', cat: 'doc', sub: 'legal', no: '09',
    name: '합의서 · 내용증명', en: 'SETTLEMENT / NOTICE',
    keywords: '합의서 내용증명 사실관계 요구사항 갑 을 합의사항',
    head: {
      kind: function (d) { return d.f.kind === '내용증명' ? '내용증명' : '합의서'; },
      sub: 'SETTLEMENT AGREEMENT · CERTIFIED NOTICE',
      meta: [['문서번호', 'docNo'], ['작성일', 'issueDate']]
    },
    parties: [{ k: 'A', label: '갑 (발신인)', nameKey: 'partyA' }, { k: 'B', label: '을 (수신인)', nameKey: 'partyB' }],
    fields: [
      { g: '문서', k: 'kind', l: '종류', t: 'sel', opts: ['합의서', '내용증명'], d: '합의서', w: 2 },
      { g: '문서', k: 'docNo', l: '문서번호', d: 'AGR-2026-1123-01' },
      { g: '문서', k: 'issueDate', l: '작성일', t: 'date', d: today() },
      { g: '문서', k: 'subject', l: '제목', d: '물품 대금 지급에 관한 합의', w: 2 },
      { g: '갑', k: 'partyA', l: '성명·상호', d: '홍길동 (○○상사)' },
      { g: '갑', k: 'partyAAddr', l: '주소', d: '서울특별시 영등포구 여의대로 108', w: 2 },
      { g: '갑', k: 'partyATel', l: '연락처', d: '010-0000-0000' },
      { g: '을', k: 'partyB', l: '성명·상호', d: '김철수 (△△물산)' },
      { g: '을', k: 'partyBAddr', l: '주소', d: '부산광역시 사상구 낙동대로 100', w: 2 },
      { g: '을', k: 'partyBTel', l: '연락처', d: '010-1111-1111' },
      { g: '내용', k: 'facts', l: '사실관계', t: 'area', d: '2026년 9월 1일 갑은 을에게 ABS 재생원료 1,000kg을 공급하였고, 을은 같은 달 15일까지 대금 3,000,000원을 지급하기로 하였다. 을은 현재까지 이를 지급하지 않았다.', w: 2, rows: 4 },
      { g: '내용', k: 'terms', l: '합의·요구사항 (한 줄에 하나씩)', t: 'area', d: '을은 2026년 12월 15일까지 갑에게 미지급 대금 3,000,000원을 지급한다.\n을은 위 기일까지 지급하지 못한 경우 지연손해금을 가산하여 지급한다.\n갑과 을은 위 합의 내용을 성실히 이행한다.', w: 2, rows: 5 },
      { g: '내용', k: 'replyBy', l: '회신 기한', t: 'date', d: addM(today(), 1) }
    ],
    blocks: [
      { t: 'title', v: 'subject' },
      {
        t: 'parties', cols: [
          { title: '갑 · 발신인', rows: [['성명·상호', 'partyA'], ['주소', 'partyAAddr'], ['연락처', 'partyATel']] },
          { title: '을 · 수신인', rows: [['성명·상호', 'partyB'], ['주소', 'partyBAddr'], ['연락처', 'partyBTel']] }
        ]
      },
      { t: 'sec', h: '제1조 (사실관계)', v: 'facts' },
      { t: 'list', h: function (d) { return d.f.kind === '내용증명' ? '제2조 (요구사항)' : '제2조 (합의사항)'; }, v: 'terms' },
      {
        t: 'sec', h: '제3조 (효력)', v: function (d) {
          return d.f.kind === '내용증명'
            ? '발신인은 위 요구사항에 대해 ' + dko(d.f.replyBy) + '까지 서면으로 회신해 주실 것을 요청합니다. 기한 안에 회신이 없으면 법적 절차를 진행할 수 있음을 알려 드립니다.'
            : '이 합의서는 갑과 을이 서명한 때부터 효력이 생기며, 이 합의서에 정하지 않은 사항은 관계 법령과 상관례에 따릅니다. 이 합의서는 2부를 작성해 갑과 을이 각각 1부씩 보관합니다.';
        }
      },
      {
        t: 'html', v: function (d) {
          return signOnly(d, ['A', 'B']);
        }
      },
      { t: 'note', v: function (d) { return d.f.kind === '내용증명' ? '발신인 ' + d.f.partyA + ' · ' + dko(d.f.issueDate) + ' · 내용증명은 우체국에서 같은 내용의 서면을 2부 이상 작성해 등기로 발송하면 발송 사실이 공적으로 남습니다. 수신인 확인란은 받은 사실을 확인할 때 사용합니다.' : dko(d.f.issueDate) + ' · 갑 ' + d.f.partyA + ' / 을 ' + d.f.partyB; } },
      { t: 'note', v: '※ 이 문서는 자체 제작 표준 양식입니다. 금액·기일·당사자 정보가 사실과 맞는지 확인하고, 분쟁 금액이 크면 법률 전문가의 검토를 받으세요.' }
    ]
  });

  /* =========================================================
     02. 엑셀 (자동계산 · CSV)
  ========================================================= */
  add({
    id: 'expense-ledger', cat: 'excel', sub: 'ex-expense', no: '01', kind: 'excel',
    name: '경비지출내역서', en: 'EXPENSE LEDGER',
    keywords: '경비지출내역서 지출내역 경비 정산 엑셀 csv 계정과목',
    fields: [
      { g: '문서', k: 'docName', l: '문서명', d: '2026년 11월 경비지출내역서', w: 2 },
      { g: '문서', k: 'period', l: '기간', d: '2026-11-01 ~ 2026-11-30', w: 2 },
      { g: '문서', k: 'dept', l: '부서', d: '경영지원팀' },
      { g: '문서', k: 'writer', l: '작성자', d: '홍길동' }
    ],
    sets: [{
      k: 'rows', label: '지출 내역', addLabel: '지출 추가',
      cols: [
        { k: 'date', h: '일자', t: 'date', w: '13%', d: today() },
        { k: 'vendor', h: '지출처', w: '22%', d: '○○문구' },
        { k: 'account', h: '계정과목', w: '16%', d: '소모품비' },
        { k: 'desc', h: '지출내역', w: '27%', d: '사무용품 구입' },
        { k: 'method', h: '결제수단', w: '10%', d: '카드' },
        { k: 'amount', h: '금액', t: 'num', w: '12%', d: '45000' }
      ],
      def: [
        { date: today(), vendor: '○○문구', account: '소모품비', desc: '사무용품 구입', method: '카드', amount: '45000' },
        { date: today(), vendor: '△△주유소', account: '차량유지비', desc: '업무용 차량 주유', method: '카드', amount: '78000' },
        { date: today(), vendor: '□□택시', account: '여비교통비', desc: '거래처 방문 교통비', method: '현금', amount: '23000' }
      ]
    }],
    table: {
      set: 'rows', empty: 4,
      cols: [
        { k: 'date', h: '일자', t: 'center' }, { k: 'vendor', h: '지출처' }, { k: 'account', h: '계정과목' },
        { k: 'desc', h: '지출내역' }, { k: 'method', h: '결제수단', t: 'center' }, { k: 'amount', h: '금액', t: 'num' }
      ],
      foot: [{ l: '합계', colspan: 5, align: 'right' }, { v: function (d) { return sum(d, 'rows', 'amount'); } }],
      noteText: '금액은 원 단위입니다. 증빙(영수증·세금계산서)은 별도로 보관하세요.'
    },
    csv: function (d) {
      var out = [['일자', '지출처', '계정과목', '지출내역', '결제수단', '금액']];
      (d.sets.rows || []).forEach(function (r) {
        out.push([r.date, r.vendor, r.account, r.desc, r.method, H.num(r.amount)]);
      });
      out.push(['합계', '', '', '', '', sum(d, 'rows', 'amount')]);
      out.push([]);
      out.push(['문서명', d.f.docName, '기간', d.f.period, '작성자', d.f.writer]);
      return out;
    },
    fileBase: 'expense-ledger'
  });

  add({
    id: 'ledger', cat: 'excel', sub: 'ex-sales', no: '02', kind: 'excel',
    name: '매입·매출장', en: 'SALES & PURCHASE LEDGER',
    keywords: '매입매출장 매출장 매입장 거래처 부가세 엑셀 csv',
    fields: [
      { g: '문서', k: 'docName', l: '문서명', d: '2026년 11월 매입·매출장', w: 2 },
      { g: '문서', k: 'period', l: '기간', d: '2026-11-01 ~ 2026-11-30', w: 2 },
      { g: '문서', k: 'writer', l: '작성자', d: '홍길동' }
    ],
    sets: [{
      k: 'rows', label: '거래 내역', addLabel: '거래 추가',
      cols: [
        { k: 'date', h: '일자', t: 'date', w: '12%', d: today() },
        { k: 'kind', h: '구분', t: 'center', w: '9%', d: '매출' },
        { k: 'partner', h: '거래처', w: '22%', d: '△△물산' },
        { k: 'item', h: '품목', w: '23%', d: 'ABS 재생원료' },
        { k: 'qty', h: '수량', t: 'num', w: '9%', d: '1000' },
        { k: 'price', h: '단가', t: 'num', w: '11%', d: '1200' }
      ],
      def: [
        { date: today(), kind: '매출', partner: '△△물산', item: 'ABS 재생원료', qty: '1000', price: '1200' },
        { date: today(), kind: '매입', partner: '○○소재', item: 'PP 재생펠릿', qty: '800', price: '900' }
      ]
    }],
    table: {
      set: 'rows', empty: 5,
      cols: [
        { k: 'date', h: '일자', t: 'center' }, { k: 'kind', h: '구분', t: 'center' }, { k: 'partner', h: '거래처' },
        { k: 'item', h: '품목' }, { k: 'qty', h: '수량', t: 'num' }, { k: 'price', h: '단가', t: 'num' },
        { k: 'supply', h: '공급가액', t: 'num', calc: function (r) { return H.num(r.qty) * H.num(r.price); } },
        { k: 'tax', h: '세액', t: 'num', calc: function (r) { return Math.round(H.num(r.qty) * H.num(r.price) * 0.1); } },
        { k: 'total', h: '합계', t: 'num', calc: function (r) { return Math.round(H.num(r.qty) * H.num(r.price) * 1.1); } }
      ],
      foot: [{ l: '합계', colspan: 6, align: 'right' }, { v: function (d) { return sum(d, 'rows', 'supply'); } }, { v: function (d) { return sum(d, 'rows', 'tax'); } }, { v: function (d) { return sum(d, 'rows', 'total'); } }],
      noteText: '매출 합계와 매입 합계는 부가세 신고 때 참고용입니다. 실제 신고는 전자세금계산서 합계표로 하세요.'
    },
    csv: function (d) {
      var out = [['일자', '구분', '거래처', '품목', '수량', '단가', '공급가액', '세액', '합계']];
      (d.sets.rows || []).forEach(function (r) {
        var s = H.num(r.qty) * H.num(r.price);
        out.push([r.date, r.kind, r.partner, r.item, H.num(r.qty), H.num(r.price), s, Math.round(s * 0.1), Math.round(s * 1.1)]);
      });
      out.push(['합계', '', '', '', '', '', sum(d, 'rows', 'supply'), sum(d, 'rows', 'tax'), sum(d, 'rows', 'total')]);
      return out;
    },
    fileBase: 'sales-ledger'
  });

  add({
    id: 'payroll', cat: 'excel', sub: 'ex-pay', no: '03', kind: 'excel',
    name: '급여대장', en: 'PAYROLL REGISTER',
    keywords: '급여대장 급여명세 4대보험 실수령액 엑셀 csv 인사',
    fields: [
      { g: '문서', k: 'docName', l: '문서명', d: '2026년 11월 급여대장', w: 2 },
      { g: '문서', k: 'period', l: '귀속월', d: '2026-11', w: 2 },
      { g: '문서', k: 'writer', l: '작성자', d: '홍길동' }
    ],
    sets: [{
      k: 'rows', label: '직원 급여', addLabel: '직원 추가',
      cols: [
        { k: 'no', h: '사번', w: '8%', d: '2026-001' },
        { k: 'name', h: '성명', w: '14%', d: '김철수' },
        { k: 'base', h: '기본급', t: 'num', w: '18%', d: '2400000' },
        { k: 'allow', h: '수당', t: 'num', w: '14%', d: '100000' },
        { k: 'tax', h: '소득세', t: 'num', w: '14%', d: '45000' }
      ],
      def: [
        { no: '2026-001', name: '김철수', base: '2400000', allow: '100000', tax: '45000' },
        { no: '2026-002', name: '박영희', base: '2800000', allow: '150000', tax: '62000' }
      ]
    }],
    table: {
      set: 'rows', empty: 4,
      cols: [
        { k: 'no', h: '사번', t: 'center' }, { k: 'name', h: '성명' },
        { k: 'base', h: '기본급', t: 'num' }, { k: 'allow', h: '수당', t: 'num' },
        { k: 'pay', h: '지급액', t: 'num', calc: function (r) { return H.num(r.base) + H.num(r.allow); } },
        { k: 'ins', h: '4대보험', t: 'num', calc: function (r) { return Math.round((H.num(r.base) + H.num(r.allow)) * 0.094041); } },
        { k: 'tax', h: '소득세', t: 'num' },
        { k: 'deduct', h: '공제계', t: 'num', calc: function (r) { return Math.round((H.num(r.base) + H.num(r.allow)) * 0.094041) + H.num(r.tax); } },
        { k: 'net', h: '실수령액', t: 'num', calc: function (r) { return H.num(r.base) + H.num(r.allow) - Math.round((H.num(r.base) + H.num(r.allow)) * 0.094041) - H.num(r.tax); } }
      ],
      foot: [{ l: '합계', colspan: 2, align: 'right' }, { v: function (d) { return sum(d, 'rows', 'base'); } }, { v: function (d) { return sum(d, 'rows', 'allow'); } }, { v: function (d) { return sum(d, 'rows', 'pay'); } }, { v: function (d) { return sum(d, 'rows', 'ins'); } }, { v: function (d) { return sum(d, 'rows', 'tax'); } }, { v: function (d) { return sum(d, 'rows', 'deduct'); } }, { v: function (d) { return sum(d, 'rows', 'net'); } }],
      noteText: '4대보험은 근로자 부담분을 국민연금 4.5% + 건강보험 3.545% + 장기요양 0.4591% + 고용보험 0.9% = 9.4041%로 계산한 참고값입니다. 소득세는 직접 입력하세요. 실제 고지액과 다를 수 있습니다.'
    },
    csv: function (d) {
      var out = [['사번', '성명', '기본급', '수당', '지급액', '4대보험(참고)', '소득세', '공제계', '실수령액']];
      (d.sets.rows || []).forEach(function (r) {
        var pay = H.num(r.base) + H.num(r.allow);
        var ins = Math.round(pay * 0.094041);
        out.push([r.no, r.name, H.num(r.base), H.num(r.allow), pay, ins, H.num(r.tax), ins + H.num(r.tax), pay - ins - H.num(r.tax)]);
      });
      out.push(['합계', '', sum(d, 'rows', 'base'), sum(d, 'rows', 'allow'), sum(d, 'rows', 'pay'), sum(d, 'rows', 'ins'), sum(d, 'rows', 'tax'), sum(d, 'rows', 'deduct'), sum(d, 'rows', 'net')]);
      return out;
    },
    fileBase: 'payroll'
  });

  /* =========================================================
     03. 파워포인트 (16:9)
  ========================================================= */
  add({
    id: 'deck-company', cat: 'ppt', sub: 'pt-company', no: '01', kind: 'slides',
    name: '회사소개서 (16:9)', en: 'COMPANY PROFILE DECK',
    keywords: '회사소개서 회사소개 ppt 슬라이드 제안 회사개요 연혁',
    fields: [
      { g: '표지', k: 'company', l: '회사명', d: '○○상사' },
      { g: '표지', k: 'slogan', l: '한 줄 소개', d: '재생원료를 안정적으로 공급하는 파트너', w: 2 },
      { g: '회사 개요', k: 'ceo', l: '대표자', d: '홍길동' },
      { g: '회사 개요', k: 'since', l: '설립', d: '2019' },
      { g: '회사 개요', k: 'bizType', l: '업종', d: '산업용 원료 도소매' },
      { g: '회사 개요', k: 'addr', l: '소재지', d: '서울특별시 영등포구 여의대로 108', w: 2 },
      { g: '회사 개요', k: 'about', l: '회사 소개', t: 'area', d: '○○상사는 2019년 설립 이후 플라스틱 재생원료를 국내 제조사에 공급해 왔습니다. 수입 원료의 품질 확인과 납기 관리에 강점이 있습니다.', w: 2, rows: 3 },
      { g: '핵심 지표', k: 'm1v', l: '지표 1 값', d: '연 3,600톤' },
      { g: '핵심 지표', k: 'm1l', l: '지표 1 설명', d: '연간 공급 물량' },
      { g: '핵심 지표', k: 'm2v', l: '지표 2 값', d: '42곳' },
      { g: '핵심 지표', k: 'm2l', l: '지표 2 설명', d: '거래 제조사' },
      { g: '핵심 지표', k: 'm3v', l: '지표 3 값', d: '98%' },
      { g: '핵심 지표', k: 'm3l', l: '지표 3 설명', d: '납기 준수율' },
      { g: '주요 사업', k: 's1n', l: '사업 1', d: '재생원료 공급' },
      { g: '주요 사업', k: 's1d', l: '설명 1', d: 'PC·ABS 재생원료를 규격별로 공급합니다.', w: 2 },
      { g: '주요 사업', k: 's2n', l: '사업 2', d: '수입 대행' },
      { g: '주요 사업', k: 's2d', l: '설명 2', d: '해외 메이커 발주부터 통관까지 대행합니다.', w: 2 },
      { g: '주요 사업', k: 's3n', l: '사업 3', d: '품질 검사' },
      { g: '주요 사업', k: 's3d', l: '설명 3', d: '납품 전 물성 시험과 성적서를 제공합니다.', w: 2 },
      { g: '연혁·비전', k: 'h1', l: '연혁 1', d: '2019 · 회사 설립' },
      { g: '연혁·비전', k: 'h2', l: '연혁 2', d: '2022 · 재생원료 전용 창고 운영' },
      { g: '연혁·비전', k: 'h3', l: '연혁 3', d: '2026 · 연간 공급 3,600톤 달성' },
      { g: '연혁·비전', k: 'vision', l: '비전', t: 'area', d: '품질과 납기를 지키는 원료 파트너가 되어, 고객의 생산 계획이 흔들리지 않게 합니다.', w: 2, rows: 2 },
      { g: '연락처', k: 'tel', l: '전화', d: '02-0000-0000' },
      { g: '연락처', k: 'email', l: '이메일', d: 'sales@example.com' }
    ],
    slides: [
      function (d) {
        return '<div class="sl-k">COMPANY PROFILE · 2026</div><div class="sl-co">' + H.esc(d.f.company) + '</div>' +
          '<div class="sl-slogan">' + H.esc(d.f.slogan) + '</div>' +
          '<div class="sl-foot">' + H.esc(d.f.addr) + ' · ' + H.esc(d.f.tel) + '</div>';
      },
      function (d) {
        return '<div class="sl-k">01 · ABOUT</div><h3>회사 개요</h3><div class="sl-lead">' + H.esc(d.f.about) + '</div>' +
          '<div class="sl-body">' + tl([['대표', d.f.ceo], ['설립', d.f.since], ['업종', d.f.bizType], ['소재지', d.f.addr]]) + '</div>';
      },
      function (d) {
        return '<div class="sl-k">02 · AT A GLANCE</div><h3>핵심 지표</h3>' + cards([
          '<b>' + H.esc(d.f.m1v) + '</b><span>' + H.esc(d.f.m1l) + '</span>',
          '<b>' + H.esc(d.f.m2v) + '</b><span>' + H.esc(d.f.m2l) + '</span>',
          '<b>' + H.esc(d.f.m3v) + '</b><span>' + H.esc(d.f.m3l) + '</span>'
        ]);
      },
      function (d) {
        return '<div class="sl-k">03 · BUSINESS</div><h3>주요 사업</h3>' + cards([
          '<h4>' + H.esc(d.f.s1n) + '</h4><p>' + H.esc(d.f.s1d) + '</p>',
          '<h4>' + H.esc(d.f.s2n) + '</h4><p>' + H.esc(d.f.s2d) + '</p>',
          '<h4>' + H.esc(d.f.s3n) + '</h4><p>' + H.esc(d.f.s3d) + '</p>'
        ]);
      },
      function (d) {
        return '<div class="sl-k">04 · HISTORY</div><h3>연혁</h3><div class="sl-body">' +
          tl([['연혁', d.f.h1], ['연혁', d.f.h2], ['연혁', d.f.h3]]) + '</div>';
      },
      function (d) {
        return '<div class="sl-k">05 · VISION</div><h3>우리가 지키는 것</h3><div class="sl-lead">' + H.esc(d.f.vision) + '</div>';
      },
      function (d) {
        return '<div class="sl-k">06 · CONTACT</div><h3>' + H.esc(d.f.company) + '</h3>' +
          '<div class="sl-lead">' + H.esc(d.f.addr) + '\n' + H.esc(d.f.tel) + ' · ' + H.esc(d.f.email) + '</div>';
      }
    ]
  });

  add({
    id: 'deck-proposal', cat: 'ppt', sub: 'pt-proposal', no: '02', kind: 'slides',
    name: '제안서 (16:9)', en: 'PROPOSAL DECK',
    keywords: '제안서 제안 ppt 슬라이드 수주 견적 수행범위 기대효과',
    fields: [
      { g: '표지', k: 'project', l: '제안명', d: '재생원료 정기 공급 제안', w: 2 },
      { g: '표지', k: 'client', l: '제안 대상', d: '△△물산' },
      { g: '표지', k: 'proposer', l: '제안사', d: '○○상사' },
      { g: '배경', k: 'background', l: '제안 배경', t: 'area', d: '원료 가격 변동과 납기 지연으로 생산 계획이 자주 바뀌고 있습니다. 안정적인 원료 확보가 필요한 시점입니다.', w: 2, rows: 2 },
      { g: '해결', k: 'solution', l: '제안 내용', t: 'area', d: '규격별 재고를 상시 보유하고, 월 단위 정기 발주로 납기를 고정합니다. 품질 성적서를 함께 제공합니다.', w: 2, rows: 2 },
      { g: '기대효과', k: 'e1', l: '기대효과 1', d: '납기 지연으로 인한 생산 차질 감소' },
      { g: '기대효과', k: 'e2', l: '기대효과 2', d: '원료 단가 변동 폭 축소' },
      { g: '기대효과', k: 'e3', l: '기대효과 3', d: '품질 클레임 대응 시간 단축' },
      { g: '연락처', k: 'tel', l: '연락처', d: '02-0000-0000' },
      { g: '연락처', k: 'email', l: '이메일', d: 'sales@example.com' }
    ],
    sets: [{
      k: 'scope', label: '수행 범위·견적', addLabel: '항목 추가',
      cols: [
        { k: 'name', h: '항목', w: '52%', d: 'ABS 재생원료 월 50톤 공급' },
        { k: 'qty', h: '수량', t: 'num', w: '12%', d: '50' },
        { k: 'price', h: '단가', t: 'num', w: '18%', d: '1200' },
        { k: 'total', h: '금액', t: 'num', w: '18%', calc: function (r) { return H.num(r.qty) * H.num(r.price); } }
      ],
      def: [{ name: 'ABS 재생원료 월 50톤 공급', qty: '50', price: '1200' }]
    }],
    slides: [
      function (d) {
        return '<div class="sl-k">PROPOSAL · 2026</div><div class="sl-co">' + H.esc(d.f.project) + '</div>' +
          '<div class="sl-slogan">' + H.esc(d.f.client) + ' 귀중 · ' + H.esc(d.f.proposer) + '</div>';
      },
      function (d) {
        return '<div class="sl-k">01 · CONTEXT</div><h3>지금 필요한 것</h3><div class="sl-lead">' + H.esc(d.f.background) + '</div>';
      },
      function (d) {
        return '<div class="sl-k">02 · PROPOSAL</div><h3>제안 내용</h3><div class="sl-lead">' + H.esc(d.f.solution) + '</div>';
      },
      function (d) {
        var rows = d.sets.scope || [];
        var body = '<table class="fm-table" style="margin-top:8px"><thead><tr><th>항목</th><th>수량</th><th>단가</th><th>금액</th></tr></thead><tbody>';
        rows.forEach(function (r) {
          body += '<tr><td class="n">' + H.esc(r.name) + '</td><td>' + fmt(r.qty) + '</td><td>' + fmt(r.price) + '</td><td>' + fmt(H.num(r.qty) * H.num(r.price)) + '</td></tr>';
        });
        body += '</tbody></table>';
        return '<div class="sl-k">03 · SCOPE</div><h3>수행 범위와 견적</h3><div class="sl-body">' + body +
          '<div class="sl-lead" style="margin-top:6px;font-size:11px">합계 ' + won(sum(d, 'scope', 'total')) + ' (부가세 별도)</div></div>';
      },
      function (d) {
        return '<div class="sl-k">04 · EFFECT</div><h3>기대 효과</h3>' + cards([
          '<p>' + H.esc(d.f.e1) + '</p>', '<p>' + H.esc(d.f.e2) + '</p>', '<p>' + H.esc(d.f.e3) + '</p>'
        ]);
      },
      function (d) {
        return '<div class="sl-k">05 · CONTACT</div><h3>' + H.esc(d.f.proposer) + '</h3>' +
          '<div class="sl-lead">' + H.esc(d.f.tel) + ' · ' + H.esc(d.f.email) + '</div>';
      }
    ]
  });

  add({
    id: 'deck-report', cat: 'ppt', sub: 'pt-report', no: '03', kind: 'slides',
    name: '업무보고 (16:9)', en: 'WORK REPORT DECK',
    keywords: '업무보고 보고서 ppt 슬라이드 주간보고 실적 이슈 계획',
    fields: [
      { g: '표지', k: 'title', l: '보고 제목', d: '11월 4주 업무 보고', w: 2 },
      { g: '표지', k: 'team', l: '팀', d: '영업1팀' },
      { g: '표지', k: 'writer', l: '작성자', d: '홍길동' },
      { g: '표지', k: 'period', l: '기간', d: '2026-11-17 ~ 2026-11-21' },
      { g: '요약', k: 'summary', l: '핵심 요약', t: 'area', d: '신규 거래처 2곳과 공급 조건을 협의했고, 기존 3곳의 11월 발주를 마감했습니다. 재고 회전은 계획 대비 4일 늦습니다.', w: 2, rows: 3 },
      { g: '완료 업무', k: 'done', l: '완료한 일 (한 줄에 하나)', t: 'area', d: '△△물산 정기 공급 계약 조건 협의\n11월 발주 3건 납품 완료\n재고 실사 및 규격별 재고표 갱신', w: 2, rows: 3 },
      { g: '이슈', k: 'issues', l: '이슈·리스크', t: 'area', d: '해상 운임 상승으로 다음 달 도착 원가가 톤당 2만원 오를 수 있습니다.', w: 2, rows: 2 },
      { g: '다음 계획', k: 'next', l: '다음 주 계획', t: 'area', d: '△△물산 계약서 서명\n12월 발주 물량 확정\n재고 부족 규격 2종 긴급 발주', w: 2, rows: 3 }
    ],
    sets: [{
      k: 'kpi', label: '지표', addLabel: '지표 추가',
      cols: [
        { k: 'name', h: '지표', w: '50%', d: '발주 마감' },
        { k: 'target', h: '목표', w: '25%', d: '5건' },
        { k: 'actual', h: '실적', w: '25%', d: '3건' }
      ],
      def: [{ name: '발주 마감', target: '5건', actual: '3건' }, { name: '신규 거래처 상담', target: '3곳', actual: '2곳' }]
    }],
    slides: [
      function (d) {
        return '<div class="sl-k">WORK REPORT</div><div class="sl-co" style="font-size:clamp(18px,3.6vw,34px)">' + H.esc(d.f.title) + '</div>' +
          '<div class="sl-slogan">' + H.esc(d.f.team) + ' · ' + H.esc(d.f.writer) + ' · ' + H.esc(d.f.period) + '</div>';
      },
      function (d) {
        return '<div class="sl-k">01 · SUMMARY</div><h3>이번 주 요약</h3><div class="sl-lead">' + H.esc(d.f.summary) + '</div>';
      },
      function (d) {
        var rows = d.sets.kpi || [];
        var body = '<table class="fm-table" style="margin-top:6px"><thead><tr><th>지표</th><th>목표</th><th>실적</th></tr></thead><tbody>';
        rows.forEach(function (r) { body += '<tr><td class="n">' + H.esc(r.name) + '</td><td class="c">' + H.esc(r.target) + '</td><td class="c">' + H.esc(r.actual) + '</td></tr>'; });
        body += '</tbody></table>';
        return '<div class="sl-k">02 · KPI</div><h3>지표</h3><div class="sl-body">' + body + '</div>';
      },
      function (d) {
        var items = String(d.f.done || '').split('\n').filter(function (x) { return x.trim(); });
        var body = '<ol class="fm-list">' + items.map(function (x) { return '<li>' + H.esc(x) + '</li>'; }).join('') + '</ol>';
        return '<div class="sl-k">03 · DONE</div><h3>완료한 일</h3><div class="sl-body">' + body + '</div>';
      },
      function (d) {
        return '<div class="sl-k">04 · ISSUE</div><h3>이슈·리스크</h3><div class="sl-lead">' + H.esc(d.f.issues) + '</div>';
      },
      function (d) {
        var items = String(d.f.next || '').split('\n').filter(function (x) { return x.trim(); });
        var body = '<ol class="fm-list">' + items.map(function (x) { return '<li>' + H.esc(x) + '</li>'; }).join('') + '</ol>';
        return '<div class="sl-k">05 · NEXT</div><h3>다음 주 계획</h3><div class="sl-body">' + body + '</div>';
      }
    ]
  });

  /* =========================================================
     04. 사업계획서
  ========================================================= */
  add({
    id: 'biz-plan', cat: 'plan', sub: 'pl-main', no: '01',
    name: '사업계획서 (정책자금·투자용)', en: 'BUSINESS PLAN',
    keywords: '사업계획서 정책자금 투자 유치 자금조달 매출추정 소상공인',
    head: { kind: '사업계획서', sub: 'BUSINESS PLAN · 2026', meta: [['회사명', 'company'], ['작성일', 'planDate']] },
    fields: [
      { g: '기본 정보', k: 'company', l: '회사명(예정)', d: '○○상사' },
      { g: '기본 정보', k: 'ceo', l: '대표자', d: '홍길동' },
      { g: '기본 정보', k: 'bizType', l: '업종', d: '산업용 원료 도소매' },
      { g: '기본 정보', k: 'founded', l: '설립(예정)일', t: 'date', d: '2019-03-02' },
      { g: '기본 정보', k: 'stage', l: '단계', t: 'sel', opts: ['예비창업', '초기', '성장'], d: '성장' },
      { g: '기본 정보', k: 'planDate', l: '작성일', t: 'date', d: today() },
      { g: '사업 내용', k: 'summary', l: '사업 개요', t: 'area', d: '플라스틱 재생원료를 수입·검수해 국내 제조사에 공급합니다. 규격별 재고를 보유해 납기를 고정하는 것이 핵심입니다.', w: 2, rows: 3 },
      { g: '사업 내용', k: 'problem', l: '문제', t: 'area', d: '국내 제조사는 원료 가격 변동과 납기 지연 때문에 생산 계획을 자주 바꿉니다.', w: 2, rows: 2 },
      { g: '사업 내용', k: 'solution', l: '해결 방법', t: 'area', d: '규격별 상시 재고와 월 단위 정기 발주로 납기를 고정하고, 품질 성적서를 함께 제공합니다.', w: 2, rows: 2 },
      { g: '시장·모델', k: 'market', l: '시장', t: 'area', d: '국내 재생원료 수요는 규제 강화로 늘고 있으나, 소량·다품종 주문을 안정적으로 받는 공급자는 적습니다.', w: 2, rows: 2 },
      { g: '시장·모델', k: 'model', l: '수익 구조', t: 'area', d: '원료 매입 단가와 공급 단가의 마진, 수입 대행 수수료로 수익을 냅니다.', w: 2, rows: 2 },
      { g: '시장·모델', k: 'team', l: '팀', t: 'area', d: '대표 1인과 물류·통관 파트너 2곳이 함께 운영합니다.', w: 2, rows: 2 },
      { g: '요청', k: 'ask', l: '요청 사항', t: 'area', d: '운전자금 5,000만원과 재고 확보를 위한 시설 자금 3,000만원을 요청합니다.', w: 2, rows: 2 }
    ],
    sets: [
      {
        k: 'funds', label: '자금 소요', addLabel: '항목 추가',
        cols: [
          { k: 'item', h: '항목', w: '42%', d: '원료 매입' },
          { k: 'amount', h: '금액', t: 'num', w: '28%', d: '50000000' },
          { k: 'use', h: '용도', w: '30%', d: '운전자금' }
        ],
        def: [{ item: '원료 매입', amount: '50000000', use: '운전자금' }, { item: '창고 임차', amount: '20000000', use: '시설자금' }, { item: '품질 검사', amount: '8000000', use: '운영비' }]
      },
      {
        k: 'plan', label: '매출·비용 추정 (3년)', addLabel: '연도 추가',
        cols: [
          { k: 'year', h: '연도', w: '16%', d: '2027' },
          { k: 'revenue', h: '매출', t: 'num', w: '28%', d: '480000000' },
          { k: 'cost', h: '비용', t: 'num', w: '28%', d: '420000000' }
        ],
        def: [{ year: '2027', revenue: '480000000', cost: '420000000' }, { year: '2028', revenue: '620000000', cost: '530000000' }, { year: '2029', revenue: '780000000', cost: '650000000' }]
      },
      {
        k: 'funding', label: '자금 조달', addLabel: '항목 추가',
        cols: [
          { k: 'source', h: '조달처', w: '52%', d: '자기자본' },
          { k: 'amount', h: '금액', t: 'num', w: '48%', d: '30000000' }
        ],
        def: [{ source: '자기자본', amount: '30000000' }, { source: '정책자금', amount: '48000000' }]
      }
    ],
    blocks: [
      { t: 'sec', h: '1. 사업 개요', v: 'summary' },
      { t: 'sec', h: '2. 문제와 해결', v: function (d) { return '· 문제: ' + d.f.problem + '\n· 해결: ' + d.f.solution; } },
      { t: 'sec', h: '3. 시장과 경쟁', v: 'market' },
      { t: 'sec', h: '4. 비즈니스 모델', v: 'model' },
      { t: 'sec', h: '5. 팀', v: 'team' },
      {
        t: 'table', set: 'funds', empty: 2, head: ['항목', '금액', '용도'],
        cols: [{ k: 'item', h: '항목' }, { k: 'amount', h: '금액', t: 'num' }, { k: 'use', h: '용도' }],
        foot: [{ l: '총 사업비', colspan: 2, align: 'right' }, { v: '' }]
      },
      { t: 'sums', rows: [{ l: '총 사업비', v: function (d) { return sum(d, 'funds', 'amount'); }, grand: true }] },
      {
        t: 'table', set: 'plan', empty: 1, head: ['연도', '매출', '비용', '영업이익'],
        cols: [
          { k: 'year', h: '연도', t: 'center' }, { k: 'revenue', h: '매출', t: 'num' }, { k: 'cost', h: '비용', t: 'num' },
          { k: 'profit', h: '영업이익', t: 'num', calc: function (r) { return H.num(r.revenue) - H.num(r.cost); } }
        ]
      },
      {
        t: 'table', set: 'funding', empty: 1, head: ['조달처', '금액'],
        cols: [{ k: 'source', h: '조달처' }, { k: 'amount', h: '금액', t: 'num' }],
        foot: [{ l: '조달 합계', align: 'right' }, { v: '' }]
      },
      { t: 'sums', rows: [{ l: '조달 합계', v: function (d) { return sum(d, 'funding', 'amount'); }, grand: true }] },
      { t: 'sec', h: '6. 요청 사항', v: 'ask' },
      { t: 'note', v: '※ 매출·비용 추정치는 계획값입니다. 정책자금 신청 시에는 최근 결산서·부가세 과세표준증명 등 실제 실적 자료를 함께 제출해야 합니다. 이 서식은 자체 제작 표준 목차입니다.' }
    ]
  });

  /* =========================================================
     05. 계약서 (biz.html에 없는 3종)
  ========================================================= */
  add({
    id: 'contract-partnership', cat: 'contract', sub: 'ct-partner', no: '01',
    name: '동업계약서', en: 'PARTNERSHIP AGREEMENT',
    keywords: '동업계약서 공동사업 출자 손익분배 동업자 지분',
    head: { sub: 'PARTNERSHIP AGREEMENT', meta: [['개시일', 'startDate'], ['사업장', 'place']] },
    parties: [{ k: 'A', label: '갑 (동업자)', nameKey: 'partyA' }, { k: 'B', label: '을 (동업자)', nameKey: 'partyB' }],
    fields: [
      { g: '동업자', k: 'partyA', l: '갑 성명', d: '홍길동' },
      { g: '동업자', k: 'partyAAddr', l: '갑 주소', d: '서울특별시 영등포구 여의대로 108', w: 2 },
      { g: '동업자', k: 'partyB', l: '을 성명', d: '김철수' },
      { g: '동업자', k: 'partyBAddr', l: '을 주소', d: '부산광역시 사상구 낙동대로 100', w: 2 },
      { g: '사업', k: 'bizName', l: '사업명', d: '재생원료 유통 공동사업', w: 2 },
      { g: '사업', k: 'place', l: '사업장 소재지', d: '서울특별시 영등포구 여의대로 108', w: 2 },
      { g: '사업', k: 'startDate', l: '개시일', t: 'date', d: today() },
      { g: '사업', k: 'endDate', l: '종료일', t: 'date', d: addY(today(), 3) },
      { g: '출자', k: 'investA', l: '갑 출자금', t: 'num', d: '30000000', h: '원' },
      { g: '출자', k: 'investB', l: '을 출자금', t: 'num', d: '20000000', h: '원' },
      { g: '출자', k: 'shareA', l: '갑 손익분배', d: '60', h: '%' },
      { g: '출자', k: 'shareB', l: '을 손익분배', d: '40', h: '%' },
      { g: '운영', k: 'manager', l: '업무 집행자', d: '갑 홍길동' },
      { g: '운영', k: 'etc', l: '기타 약정', t: 'area', d: '', w: 2, rows: 2 }
    ],
    blocks: [
      { t: 'parties', cols: [{ title: '갑', rows: [['성명', 'partyA'], ['주소', 'partyAAddr']] }, { title: '을', rows: [['성명', 'partyB'], ['주소', 'partyBAddr']] }] },
      {
        t: 'sec', h: '제1조 (목적)', v: function (d) {
          return '갑과 을은 ' + d.f.bizName + '을 공동으로 운영하기 위해 이 계약을 체결한다.';
        }
      },
      {
        t: 'sec', h: '제2조 (사업의 내용)', v: function (d) {
          return '· 사업명: ' + d.f.bizName + '\n· 사업장: ' + d.f.place + '\n· 사업기간: ' + dko(d.f.startDate) + '부터 ' + dko(d.f.endDate) + '까지';
        }
      },
      {
        t: 'sec', h: '제3조 (출자)', v: function (d) {
          return '갑은 ' + won(d.f.investA) + ', 을은 ' + won(d.f.investB) + '을 출자하며, 출자금은 계약 체결일부터 7일 안에 공동 명의 계좌에 입금한다.';
        }
      },
      {
        t: 'sec', h: '제4조 (손익의 분배)', v: function (d) {
          return '사업에서 생긴 이익과 손실은 갑 ' + d.f.shareA + '%, 을 ' + d.f.shareB + '%의 비율로 나눈다. 정산은 매년 12월 말에 한다.';
        }
      },
      { t: 'sec', h: '제5조 (업무 집행)', v: function (d) { return '일상적인 업무는 ' + d.f.manager + '이 집행하고, 다음 사항은 갑과 을이 함께 결정한다.\n① 1,000만원을 넘는 지출\n② 새로운 거래처와의 연간 계약\n③ 차입·보증·담보 제공\n④ 동업자의 추가 영입'; } },
      { t: 'sec', h: '제6조 (탈퇴와 해산)', v: function () { return '동업자가 탈퇴하려면 3개월 전에 서면으로 알린다. 탈퇴·사망 등으로 동업 관계를 끝낼 때는 탈퇴일의 재산 상태를 기준으로 정산한다.'; } },
      { t: 'sec', h: '제7조 (기타)', v: function (d) { return d.f.etc ? d.f.etc + '\n이 계약에 없는 사항은 갑과 을이 협의해 정한다.' : '이 계약에 정하지 않은 사항은 갑과 을이 협의해 정한다.'; } },
      { t: 'body', v: function () { return '갑과 을은 위 내용을 확인하고 이 계약서 2부를 작성해 각 1부씩 보관한다.'; } },
      { t: 'sign', parties: ['A', 'B'], note: function (d) { return dko(d.f.signDate) + ' 작성 · 갑과 을이 각각 서명·날인합니다.'; } },
      { t: 'note', v: '※ 동업은 법률관계가 복잡합니다. 출자금·손익분배·탈퇴 정산은 실제 금액과 기간을 정확히 적고, 필요하면 법률 전문가의 검토를 받으세요.' }
    ]
  });

  add({
    id: 'contract-freelance', cat: 'contract', sub: 'ct-free', no: '02',
    name: '프리랜서 위탁계약서', en: 'FREELANCE SERVICE AGREEMENT',
    keywords: '프리랜서 위탁계약 용역 외주 계약서 저작권 비밀유지',
    head: { sub: 'FREELANCE SERVICE AGREEMENT', meta: [['계약일', 'signDate'], ['용역기간', function (d) { return d.f.startDate + ' ~ ' + d.f.endDate; }]] },
    parties: [{ k: 'A', label: '위탁자(갑)', nameKey: 'clientCeo' }, { k: 'B', label: '수탁자(을)', nameKey: 'worker' }],
    fields: [
      { g: '위탁자', k: 'client', l: '상호', d: '○○상사' },
      { g: '위탁자', k: 'clientCeo', l: '대표자', d: '홍길동' },
      { g: '위탁자', k: 'clientAddr', l: '주소', d: '서울특별시 영등포구 여의대로 108', w: 2 },
      { g: '수탁자', k: 'worker', l: '성명', d: '김철수' },
      { g: '수탁자', k: 'workerAddr', l: '주소', d: '부산광역시 사상구 낙동대로 100', w: 2 },
      { g: '수탁자', k: 'workerTel', l: '연락처', d: '010-1111-1111' },
      { g: '용역', k: 'task', l: '용역 내용', t: 'area', d: '재생원료 수입 관련 영문 카탈로그·제안서 작성 및 번역', w: 2, rows: 3 },
      { g: '용역', k: 'deliverable', l: '납품물', d: '영문 카탈로그 1종, 제안서 3종 (PDF·원본 파일)', w: 2 },
      { g: '용역', k: 'startDate', l: '시작일', t: 'date', d: today() },
      { g: '용역', k: 'endDate', l: '종료일', t: 'date', d: addM(today(), 2) },
      { g: '대금', k: 'fee', l: '용역 대금', t: 'num', d: '3000000', h: '원' },
      { g: '대금', k: 'payDate', l: '지급일', t: 'date', d: addM(today(), 2) },
      { g: '대금', k: 'payMethod', l: '지급방법', d: '검수 완료 후 7일 이내 계좌이체' },
      { g: '조건', k: 'copyright', l: '저작권 귀속', t: 'sel', opts: ['위탁자에게 귀속', '수탁자에게 귀속(사용권 부여)'], d: '위탁자에게 귀속' },
      { g: '조건', k: 'signDate', l: '계약일', t: 'date', d: today() }
    ],
    blocks: [
      { t: 'parties', cols: [{ title: '위탁자(갑)', rows: [['상호', 'client'], ['대표자', 'clientCeo'], ['주소', 'clientAddr']] }, { title: '수탁자(을)', rows: [['성명', 'worker'], ['주소', 'workerAddr'], ['연락처', 'workerTel']] }] },
      { t: 'sec', h: '제1조 (용역의 내용)', v: 'task' },
      { t: 'sec', h: '제2조 (납품과 검수)', v: function (d) { return '을은 ' + dko(d.f.endDate) + '까지 ' + d.f.deliverable + '을 갑에게 납품한다. 갑은 납품일부터 7일 안에 검수 결과를 알리고, 기한 안에 알리지 않으면 검수에 통과한 것으로 본다.'; } },
      { t: 'sec', h: '제3조 (대금)', v: function (d) { return '용역 대금은 ' + won(d.f.fee) + '으로 하며, 검수 완료 후 ' + dko(d.f.payDate) + '까지 ' + d.f.payMethod + ' 방법으로 지급한다.'; } },
      { t: 'sec', h: '제4조 (저작권)', v: function (d) { return d.f.copyright === '위탁자에게 귀속' ? '납품물의 저작재산권은 대금 지급이 끝난 때 갑에게 귀속한다. 을은 자신의 포트폴리오에 실을 수 있다.' : '납품물의 저작권은 을에게 있으나, 갑은 계약 목적 범위에서 이를 사용할 수 있다.'; } },
      { t: 'sec', h: '제5조 (비밀유지)', v: function () { return '갑과 을은 업무 중 알게 된 상대방의 영업 비밀과 거래 정보를 계약 종료 후 2년간 제3자에게 알리지 않는다.'; } },
      { t: 'sec', h: '제6조 (해지)', v: function () { return '일방이 계약을 어기고 상당한 기간 안에 고치지 않으면 상대방은 서면으로 계약을 해지할 수 있다. 이미 진행한 부분은 비율에 따라 정산한다.'; } },
      { t: 'sign', parties: ['A', 'B'], note: function (d) { return dko(d.f.signDate) + ' 작성 · 갑과 을이 각각 서명·날인합니다.'; } },
      { t: 'note', v: '※ 프리랜서 계약은 근로계약과 구분됩니다. 실제로는 출퇴근·지휘를 받으며 일했다면 근로자로 판단될 수 있으니, 업무 방식과 대금 구조를 사실대로 적으세요.' }
    ]
  });

  add({
    id: 'contract-supply', cat: 'contract', sub: 'ct-supply', no: '03',
    name: '물품공급계약서', en: 'SUPPLY AGREEMENT',
    keywords: '물품공급계약 납품 계약서 단가 결제 하자보증 정기공급',
    head: { sub: 'SUPPLY AGREEMENT', meta: [['계약번호', 'contractNo'], ['계약일', 'signDate']] },
    parties: [{ k: 'A', label: '공급자(갑)', nameKey: 'supplierCeo' }, { k: 'B', label: '구매자(을)', nameKey: 'buyerCeo' }],
    fields: [
      { g: '공급자', k: 'supplier', l: '상호', d: '○○상사' },
      { g: '공급자', k: 'supplierCeo', l: '대표자', d: '홍길동' },
      { g: '공급자', k: 'supplierAddr', l: '주소', d: '서울특별시 영등포구 여의대로 108', w: 2 },
      { g: '구매자', k: 'buyer', l: '상호', d: '△△물산' },
      { g: '구매자', k: 'buyerCeo', l: '대표자', d: '김철수' },
      { g: '구매자', k: 'buyerAddr', l: '주소', d: '부산광역시 사상구 낙동대로 100', w: 2 },
      { g: '계약', k: 'contractNo', l: '계약번호', d: 'SUP-2026-1123' },
      { g: '계약', k: 'startDate', l: '공급 시작일', t: 'date', d: today() },
      { g: '계약', k: 'endDate', l: '공급 종료일', t: 'date', d: addY(today(), 1) },
      { g: '계약', k: 'delivery', l: '납품 방법·장소', d: '구매자 지정 창고로 월 1회 트럭 배송', w: 2 },
      { g: '계약', k: 'payment', l: '대금 결제', d: '매월 말 마감 후 다음 달 15일 현금 결제', w: 2 },
      { g: '계약', k: 'warranty', l: '품질·하자', d: '납품 후 30일 안에 품질 이의를 제기할 수 있고, 확인되면 교환한다', w: 2 },
      { g: '계약', k: 'signDate', l: '계약일', t: 'date', d: today() }
    ],
    sets: [{
      k: 'items', label: '공급 품목', addLabel: '품목 추가',
      cols: [
        { k: 'name', h: '품목', w: '36%', d: 'ABS 재생원료' },
        { k: 'spec', h: '규격', w: '28%', d: '검정, 25kg' },
        { k: 'price', h: '단가', t: 'num', w: '18%', d: '1200' },
        { k: 'monthly', h: '월 수량', t: 'num', w: '18%', d: '50' }
      ],
      def: [{ name: 'ABS 재생원료', spec: '검정, 25kg', price: '1200', monthly: '50' }]
    }],
    blocks: [
      { t: 'parties', cols: [{ title: '공급자(갑)', rows: [['상호', 'supplier'], ['대표자', 'supplierCeo'], ['주소', 'supplierAddr']] }, { title: '구매자(을)', rows: [['상호', 'buyer'], ['대표자', 'buyerCeo'], ['주소', 'buyerAddr']] }] },
      { t: 'sec', h: '제1조 (계약의 목적)', v: function (d) { return '갑은 을에게 아래 품목을 정기적으로 공급하고, 을은 그 대금을 지급한다. 계약기간은 ' + dko(d.f.startDate) + '부터 ' + dko(d.f.endDate) + '까지로 한다.'; } },
      {
        t: 'table', set: 'items', empty: 2, head: ['품목', '규격', '단가', '월 수량'],
        cols: [{ k: 'name', h: '품목' }, { k: 'spec', h: '규격' }, { k: 'price', h: '단가', t: 'num' }, { k: 'monthly', h: '월 수량', t: 'num' }]
      },
      { t: 'sec', h: '제2조 (납품)', v: function (d) { return d.f.delivery + '. 납품 수량과 시기는 을이 매월 20일까지 보내는 발주서로 확정한다.'; } },
      { t: 'sec', h: '제3조 (대금 결제)', v: function (d) { return d.f.payment + '. 세금계산서는 납품 월 기준으로 발행한다.'; } },
      { t: 'sec', h: '제4조 (품질과 하자)', v: function (d) { return d.f.warranty + '. 천재지변·운송 중 사고 등 갑의 책임이 없는 사유는 제외한다.'; } },
      { t: 'sec', h: '제5조 (계약 해지)', v: function () { return '일방이 대금 지급이나 납품을 2회 이상 어기면 상대방은 14일 전에 서면으로 알리고 계약을 해지할 수 있다.'; } },
      { t: 'sec', h: '제6조 (분쟁 해결)', v: function () { return '이 계약에 관한 다툼은 갑과 을이 먼저 협의로 해결하고, 협의가 되지 않으면 관할 법원에 따른다.'; } },
      { t: 'sign', parties: ['A', 'B'], note: function (d) { return '계약일 ' + dko(d.f.signDate) + ' · 갑과 을이 각각 서명·날인하고 2부를 작성해 1부씩 보관합니다.'; } },
      { t: 'note', v: '※ 단가·수량·결제 조건은 실제 거래 조건과 같아야 합니다. 품질 기준은 규격서나 시험성적서로 따로 정해 두면 분쟁을 줄일 수 있습니다.' }
    ]
  });

  /* =========================================================
     06. 자기소개서
  ========================================================= */
  add({
    id: 'coverletter', cat: 'resume', sub: 'rs-main', no: '01',
    name: '자기소개서 · 이력 요약', en: 'COVER LETTER',
    keywords: '자기소개서 자소서 이력서 글자수 지원동기 성장과정',
    head: { kind: '자기소개서', sub: 'COVER LETTER · RESUME SUMMARY', meta: [['지원 회사', 'target'], ['지원 직무', 'role']] },
    parties: [],
    fields: [
      { g: '지원자', k: 'name', l: '성명', d: '홍길동' },
      { g: '지원자', k: 'birth', l: '생년월일', t: 'date', d: '1994-03-02' },
      { g: '지원자', k: 'phone', l: '연락처', d: '010-0000-0000' },
      { g: '지원자', k: 'email', l: '이메일', d: 'hong@example.com' },
      { g: '지원자', k: 'addr', l: '주소', d: '서울특별시 영등포구 여의대로 108', w: 2 },
      { g: '지원', k: 'target', l: '지원 회사', d: '△△물산' },
      { g: '지원', k: 'role', l: '지원 직무', d: '영업관리' },
      { g: '이력 요약', k: 'edu', l: '학력', d: '○○대학교 경영학과 졸업 (2017)', w: 2 },
      { g: '이력 요약', k: 'career', l: '경력', d: '2017~2026 ○○상사 영업팀 대리', w: 2 },
      { g: '이력 요약', k: 'cert', l: '자격·기타', d: '유통관리사 2급, 엑셀 실무', w: 2 },
      { g: '자소서', k: 'growth', l: '성장과정', t: 'area', d: '거래처와의 약속을 지키는 일을 가장 중요하게 배웠습니다. 납기를 어기지 않는 습관이 지금의 업무 방식이 되었습니다.', w: 2, rows: 4, limit: 500 },
      { g: '자소서', k: 'personality', l: '성격의 장단점', t: 'area', d: '장점은 꼼꼼함입니다. 단점은 확인을 여러 번 하느라 속도가 느릴 때가 있다는 점이고, 중요한 일과 그렇지 않은 일을 먼저 나누는 방식으로 보완하고 있습니다.', w: 2, rows: 4, limit: 500 },
      { g: '자소서', k: 'motive', l: '지원동기', t: 'area', d: '원료 공급 현장에서 쌓은 경험을 살려, 안정적인 공급망을 만드는 일을 하고 싶습니다.', w: 2, rows: 4, limit: 800 },
      { g: '자소서', k: 'competency', l: '직무 경험', t: 'area', d: '월 3,600톤 규모의 공급 일정을 관리하며 납기 준수율 98%를 유지했습니다. 클레임이 생기면 원인과 재발 방지안을 정리해 거래처에 먼저 알렸습니다.', w: 2, rows: 5, limit: 800 },
      { g: '자소서', k: 'aspiration', l: '입사 후 포부', t: 'area', d: '첫해에는 기존 거래처의 발주 패턴을 정리해 재고 계획의 정확도를 높이고, 3년 안에 신규 거래처 5곳을 담당하고 싶습니다.', w: 2, rows: 4, limit: 500 }
    ],
    blocks: [
      { t: 'kv', rows: [['성명', 'name'], ['생년월일', 'birth'], ['연락처', 'phone'], ['이메일', 'email'], ['주소', 'addr'], ['학력', 'edu'], ['경력', 'career'], ['자격', 'cert']] },
      { t: 'sec', h: '1. 성장과정', v: 'growth' },
      { t: 'sec', h: '2. 성격의 장단점', v: 'personality' },
      { t: 'sec', h: '3. 지원동기', v: 'motive' },
      { t: 'sec', h: '4. 직무 경험', v: 'competency' },
      { t: 'sec', h: '5. 입사 후 포부', v: 'aspiration' },
      { t: 'center', v: function (d) { return dko(today()); }, cls: 'fm-doc-sub' },
      { t: 'note', v: '※ 글자수 제한은 회사마다 다릅니다. 입력란의 카운터로 공백 포함·제외 글자를 확인하고, 지원하는 회사의 기준에 맞춰 줄이세요.' }
    ]
  });

  /* =========================================================
     07. 영문서식
  ========================================================= */
  add({
    id: 'en-cert', cat: 'en', sub: 'en-cert', no: '01',
    name: 'Certificate of Employment', en: '영문 재직증명서',
    keywords: '영문 재직증명서 certificate of employment 비자 해외 제출 영문증명',
    head: { kind: 'CERTIFICATE OF EMPLOYMENT', sub: 'TO WHOM IT MAY CONCERN', co: function (d) { return d.f.company + ' · ' + d.f.addr; }, meta: [['Date', 'issueDate'], ['Ref.', 'refNo']] },
    parties: [{ k: 'A', label: 'Authorized signatory', nameKey: 'signer' }],
    fields: [
      { g: 'Company', k: 'company', l: 'Company name', d: 'OO Sangsa Co., Ltd.' },
      { g: 'Company', k: 'addr', l: 'Address', d: '108 Yeouidae-ro, Yeongdeungpo-gu, Seoul, Korea', w: 2 },
      { g: 'Company', k: 'tel', l: 'Phone', d: '+82-2-0000-0000' },
      { g: 'Company', k: 'refNo', l: 'Reference no.', d: 'HR-2026-0001' },
      { g: 'Employee', k: 'name', l: 'Full name', d: 'Hong Gil-dong' },
      { g: 'Employee', k: 'birth', l: 'Date of birth', t: 'date', d: '1990-01-01' },
      { g: 'Employee', k: 'passport', l: 'Passport no. (optional)', d: 'M00000000' },
      { g: 'Employee', k: 'position', l: 'Position', d: 'Assistant Manager' },
      { g: 'Employee', k: 'dept', l: 'Department', d: 'Sales Division' },
      { g: 'Employment', k: 'joinDate', l: 'Employment start', t: 'date', d: '2022-03-02' },
      { g: 'Employment', k: 'leaveDate', l: 'End date (if any)', t: 'date', d: '' },
      { g: 'Employment', k: 'type', l: 'Employment type', d: 'Full-time, permanent' },
      { g: 'Employment', k: 'purpose', l: 'Purpose', d: 'Visa application' },
      { g: 'Signatory', k: 'signer', l: 'Signatory name', d: 'Hong Gil-dong' },
      { g: 'Signatory', k: 'signerTitle', l: 'Title', d: 'Chief Executive Officer' },
      { g: 'Signatory', k: 'issueDate', l: 'Issue date', t: 'date', d: today() }
    ],
    blocks: [
      { t: 'body', v: function (d) { return 'This is to certify that ' + d.f.name + (d.f.birth ? ' (Date of Birth: ' + d.f.birth + ')' : '') + (d.f.passport ? ', Passport No. ' + d.f.passport : '') + ' has been employed by ' + d.f.company + ' as ' + d.f.position + ' in the ' + d.f.dept + '.'; } },
      { t: 'body', v: function (d) { return 'Employment period: ' + d.f.joinDate + ' to ' + (d.f.leaveDate ? d.f.leaveDate : 'the present') + '. Employment type: ' + d.f.type + '.'; } },
      { t: 'body', v: function (d) { return 'This certificate is issued at the request of the above-named person for the purpose of ' + d.f.purpose + '.'; } },
      { t: 'center', v: function (d) { return d.f.issueDate; }, cls: 'fm-doc-sub' },
      { t: 'center', v: function (d) { return d.f.company; }, cls: 'fm-doc-sub' },
      { t: 'center', v: function (d) { return d.f.signer + ', ' + d.f.signerTitle; }, cls: 'fm-doc-sub' },
      { t: 'sign', parties: ['A'], note: function () { return 'Signature and company seal.'; } },
      { t: 'note', v: function (d) { return 'Contact: ' + d.f.tel + ' · ' + d.f.addr + ' · Ref. ' + d.f.refNo; } }
    ]
  });

  add({
    id: 'en-poa', cat: 'en', sub: 'en-poa', no: '02',
    name: 'Power of Attorney (영문)', en: 'POWER OF ATTORNEY',
    keywords: 'power of attorney 영문 위임장 대리권 해외 위임',
    head: { kind: 'POWER OF ATTORNEY', sub: 'GENERAL / SPECIAL', meta: [['Date', 'issueDate'], ['Place', 'place']] },
    parties: [{ k: 'A', label: 'Principal', nameKey: 'principal' }, { k: 'B', label: 'Attorney-in-fact', nameKey: 'attorney' }],
    fields: [
      { g: 'Principal', k: 'principal', l: 'Full name', d: 'Hong Gil-dong' },
      { g: 'Principal', k: 'principalAddr', l: 'Address', d: '108 Yeouidae-ro, Yeongdeungpo-gu, Seoul, Korea', w: 2 },
      { g: 'Principal', k: 'principalPassport', l: 'Passport no.', d: 'M00000000' },
      { g: 'Attorney', k: 'attorney', l: 'Full name', d: 'Kim Chul-soo' },
      { g: 'Attorney', k: 'attorneyAddr', l: 'Address', d: '100 Nakdong-daero, Sasang-gu, Busan, Korea', w: 2 },
      { g: 'Authority', k: 'powers', l: 'Powers granted', t: 'area', d: 'To submit and receive documents, and to represent the Principal before the relevant authorities in connection with the registration of the Principal\'s business.', w: 2, rows: 4 },
      { g: 'Authority', k: 'period', l: 'Effective period', d: 'from ' + today() + ' to ' + addM(today(), 6) },
      { g: 'Authority', k: 'issueDate', l: 'Date', t: 'date', d: today() },
      { g: 'Authority', k: 'place', l: 'Place', d: 'Seoul, Korea' }
    ],
    blocks: [
      { t: 'body', v: function (d) { return 'KNOW ALL PERSONS BY THESE PRESENTS that I, ' + d.f.principal + ', of ' + d.f.principalAddr + (d.f.principalPassport ? ' (Passport No. ' + d.f.principalPassport + ')' : '') + ', hereby appoint ' + d.f.attorney + ', of ' + d.f.attorneyAddr + ', as my true and lawful attorney-in-fact.'; } },
      { t: 'sec', h: 'Powers granted', v: 'powers' },
      { t: 'body', v: function (d) { return 'This authority is effective ' + d.f.period + ', and may be revoked by written notice at any time.'; } },
      { t: 'body', v: function () { return 'IN WITNESS WHEREOF, the Principal has executed this Power of Attorney on the date written below.'; } },
      { t: 'center', v: function (d) { return d.f.issueDate + ' · ' + d.f.place; }, cls: 'fm-doc-sub' },
      { t: 'sign', parties: ['A', 'B'], note: 'Principal signs; attorney acknowledges acceptance.' },
      { t: 'note', v: 'This is a self-prepared standard form. Authorities that require notarization or an apostille may not accept a private document alone. Check the requirements of the receiving institution first.' }
    ]
  });

  add({
    id: 'en-cover', cat: 'en', sub: 'en-letter', no: '03',
    name: 'Business Cover Letter', en: 'BUSINESS COVER LETTER',
    keywords: 'business cover letter 영문 레터 비즈니스 편지 소개 협력 제안',
    head: { kind: 'BUSINESS LETTER', sub: 'COVER LETTER', meta: [['Date', 'issueDate']] },
    parties: [],
    fields: [
      { g: 'Recipient', k: 'recipientCompany', l: 'Company', d: 'Delta Trading Co., Ltd.' },
      { g: 'Recipient', k: 'recipientName', l: 'Contact name', d: 'Mr. Kim Chul-soo' },
      { g: 'Recipient', k: 'recipientAddr', l: 'Address', d: '100 Nakdong-daero, Sasang-gu, Busan, Korea', w: 2 },
      { g: 'Sender', k: 'senderCompany', l: 'Your company', d: 'OO Sangsa Co., Ltd.' },
      { g: 'Sender', k: 'senderName', l: 'Your name', d: 'Hong Gil-dong' },
      { g: 'Sender', k: 'senderTitle', l: 'Title', d: 'Sales Manager' },
      { g: 'Sender', k: 'senderTel', l: 'Phone', d: '+82-2-0000-0000' },
      { g: 'Sender', k: 'senderEmail', l: 'Email', d: 'sales@example.com' },
      { g: 'Letter', k: 'subject', l: 'Subject', d: 'Proposal for a regular supply of recycled plastics', w: 2 },
      { g: 'Letter', k: 'body1', l: 'Opening', t: 'area', d: 'We are writing to introduce our company as a potential supplier of recycled plastic raw materials for your production lines.', w: 2, rows: 3 },
      { g: 'Letter', k: 'body2', l: 'Details', t: 'area', d: 'We have supplied PC and ABS recycled materials to manufacturers in Korea since 2019. Our monthly volume is around 300 tons, and we provide a test report with every shipment.', w: 2, rows: 4 },
      { g: 'Letter', k: 'body3', l: 'Closing', t: 'area', d: 'We would be glad to send samples and a price list. Please let us know a convenient time for a short call.', w: 2, rows: 3 },
      { g: 'Letter', k: 'issueDate', l: 'Date', t: 'date', d: today() }
    ],
    blocks: [
      { t: 'body', v: function (d) { return d.f.senderCompany; } },
      { t: 'body', v: function (d) { return d.f.issueDate; } },
      { t: 'body', v: function (d) { return d.f.recipientName + '\n' + d.f.recipientCompany + '\n' + d.f.recipientAddr; } },
      { t: 'sec', h: 'Subject', v: 'subject' },
      { t: 'body', v: function (d) { return 'Dear ' + d.f.recipientName + ','; } },
      { t: 'body', v: 'body1' },
      { t: 'body', v: 'body2' },
      { t: 'body', v: 'body3' },
      { t: 'body', v: function () { return 'Sincerely,'; } },
      { t: 'body', v: function (d) { return d.f.senderName + '\n' + d.f.senderTitle + ', ' + d.f.senderCompany + '\n' + d.f.senderTel + ' · ' + d.f.senderEmail; } },
      { t: 'note', v: '※ 영문 서신은 상대 회사·국가의 관행에 따라 호칭과 맺음말을 조정하세요. 이 서식은 자체 제작한 표준 예시입니다.' }
    ]
  });

  /* =========================================================
     08. 온라인도장 · 전자서명
  ========================================================= */
  add({
    id: 'stamp-maker', cat: 'sign', sub: 'sg-seal', no: '01', kind: 'tool', tool: 'stamp',
    name: '온라인 도장 제작기', en: 'ONLINE SEAL MAKER',
    keywords: '도장 만들기 온라인 도장 직인 막도장 법인인감 투명 png'
  });

  add({
    id: 'sign-pad', cat: 'sign', sub: 'sg-sign', no: '02', kind: 'tool', tool: 'signature',
    name: '전자서명 패드', en: 'E-SIGNATURE PAD',
    keywords: '전자서명 손글씨 서명 서명요청 링크 pdf 서명'
  });

  root.IBF_CATS = CATS;
  root.IBF_DOCS = DOCS;
})(typeof window !== 'undefined' ? window : this);
