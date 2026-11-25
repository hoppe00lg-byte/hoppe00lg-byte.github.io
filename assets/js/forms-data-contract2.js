/* =========================================================
   INSIGHT BRIEF — 계약·법률·회사 추가분
   비밀유지(NDA) · 업무협약(MOU) · 주주총회·이사회 의사록 · 정관 ·
   연봉계약 · 부동산 임대차 · 저작권 양도 · 홈페이지 제작 ·
   손해배상 합의 · 소프트웨어 라이선스 · 위탁판매
   조항은 이 사이트에서 직접 작성한 자체 표준 문안입니다.
   ========================================================= */
(function (root) {
  'use strict';
  var H = root.IBF;
  var DOCS = root.IBF_DOCS;
  var esc = H.esc, fmt = H.fmt, won = H.won, dko = H.dateKo, today = H.todayISO,
    sum = H.setSum, addD = H.addDays, addY = H.addYears, addM = H.addMonths;
  function add(d) { DOCS[d.id] = d; return d; }
  function sec(h, v) { return { t: 'sec', h: h, v: v }; }
  function note(txt) { return { t: 'note', v: function () { return txt; } }; }
  function sign(parties, txt) { return { t: 'sign', parties: parties, note: txt == null ? null : (typeof txt === 'function' ? txt : function () { return txt; }) }; }

  /* ---------------------------------------------------------
     1. 비밀유지계약서 (NDA)
  --------------------------------------------------------- */
  add({
    id: 'nda', cat: 'contract', sub: 'ct-free', no: '05',
    name: '비밀유지계약서 (NDA)', en: 'NON-DISCLOSURE AGREEMENT',
    keywords: '비밀유지계약서 NDA 기밀유지 영업비밀 기술자료 대화 협의 보안 서약',
    head: { sub: 'NON-DISCLOSURE AGREEMENT', meta: [['작성일', 'signDate'], ['계약기간', function (d) { return d.f.term; }]] },
    parties: [{ k: 'A', label: '갑(공개자)', nameKey: 'aName' }, { k: 'B', label: '을(수령자)', nameKey: 'bName' }],
    fields: [
      { g: '갑', k: 'aName', l: '상호', d: '○○상사' },
      { g: '갑', k: 'aCeo', l: '대표자', d: '홍길동' },
      { g: '갑', k: 'aAddr', l: '주소', d: '서울특별시 영등포구 여의대로 108', w: 2 },
      { g: '을', k: 'bName', l: '상호', d: '△△테크' },
      { g: '을', k: 'bCeo', l: '대표자', d: '김철수' },
      { g: '을', k: 'bAddr', l: '주소', d: '경기도 성남시 분당구 ○○로 00', w: 2 },
      { g: '계약 조건', k: 'purpose', l: '공유 목적', d: '재생원료 공급 조건 협의 및 샘플 품질 검토', w: 2 },
      { g: '계약 조건', k: 'term', l: '비밀유지 기간', t: 'sel', opts: ['계약일로부터 1년', '계약일로부터 2년', '계약일로부터 3년', '종료 후 3년'], d: '계약일로부터 3년' },
      { g: '계약 조건', k: 'scope', l: '비밀정보 범위', t: 'area', d: '가격·단가표, 거래처 명단, 시험성적서, 공정 조건, 샘플 배합비, 계약 조건 및 협의 내용 일체', w: 2, rows: 2 },
      { g: '계약 조건', k: 'penalty', l: '위반 시 조치', d: '손해배상 청구 및 법적 조치' },
      { g: '계약 조건', k: 'law', l: '준거법·관할', d: '대한민국 법률, 서울중앙지방법원' },
      { g: '계약 조건', k: 'signDate', l: '체결일', t: 'date', d: today() }
    ],
    blocks: [
      { t: 'parties', cols: [
        { title: '갑 (공개자)', rows: [['상호', 'aName'], ['대표자', 'aCeo'], ['주소', 'aAddr']] },
        { title: '을 (수령자)', rows: [['상호', 'bName'], ['대표자', 'bCeo'], ['주소', 'bAddr']] }
      ] },
      sec('제1조 (목적)', function (d) { return '갑과 을은 ' + d.f.purpose + '를 위해 정보를 교환하며, 그 과정에서 알게 된 상대방의 비밀정보를 보호하기 위해 이 계약을 체결한다.'; }),
      sec('제2조 (비밀정보의 정의)', function (d) { return '비밀정보란 서면·전자파일·구두·샘플 등 형태를 가리지 않고, 공개되지 않은 다음 정보를 말한다.\n' + d.f.scope + '\n다만 공개된 정보, 수령 전에 이미 보유한 정보, 제3자로부터 적법하게 취득한 정보는 제외한다.'; }),
      sec('제3조 (비밀유지 의무)', function () { return '을은 비밀정보를 이 계약의 목적 외로 사용하지 않고, 갑의 사전 서면 동의 없이 제3자에게 공개·누설하지 않는다. 을은 비밀정보를 취급하는 임직원에게 같은 의무를 지게 한다.'; }),
      sec('제4조 (비밀정보의 관리)', function () { return '을은 비밀정보를 잠금 장치·접근 권한 등 합리적인 방법으로 관리하고, 목적이 달성되면 갑의 요청에 따라 반환하거나 삭제한다. 법령에 따라 보존해야 하는 경우에는 그 사실을 갑에게 알린다.'; }),
      sec('제5조 (비밀유지 기간)', function (d) { return '을은 이 계약 체결일부터 ' + d.f.term + '까지 비밀유지 의무를 지며, 계약이 종료되어도 같은 기간 동안 효력이 유지된다.'; }),
      sec('제6조 (위반 시 책임)', function (d) { return '을이 이 계약을 위반해 갑에게 손해가 발생한 경우, 을은 ' + d.f.penalty + '에 따른 책임을 진다. 위반 사실이 확인되면 갑은 즉시 계약을 해지할 수 있다.'; }),
      sec('제7조 (기타)', function (d) { return '이 계약에 정하지 않은 사항은 ' + d.f.law + '에 따른다. 이 계약은 갑과 을이 서명한 날부터 효력이 발생한다.'; }),
      body('갑과 을은 위 내용을 확인하고 이 계약을 체결한다.'),
      sign(['A', 'B'], function (d) { return '체결일 ' + dko(d.f.signDate) + ' · 갑과 을이 각각 서명·날인합니다.'; }),
      note('※ 비밀유지계약은 영업비밀 보호에 도움이 되지만, 비밀정보의 범위와 기간이 지나치게 넓으면 법원에서 효력이 제한될 수 있습니다. 실제로 공유하는 자료 목록을 별도로 정리해 두면 분쟁 시 입증이 쉽습니다.')
    ]
  });

  /* ---------------------------------------------------------
     2. 업무협약서 (MOU)
  --------------------------------------------------------- */
  add({
    id: 'mou', cat: 'contract', sub: 'ct-partner', no: '04',
    name: '업무협약서 (MOU)', en: 'MEMORANDUM OF UNDERSTANDING',
    keywords: '업무협약서 MOU 협약 협력 양해각서 공동 사업 제휴 업무 제휴',
    head: { sub: 'MEMORANDUM OF UNDERSTANDING', meta: [['작성일', 'signDate'], ['협약 기간', 'term']] },
    parties: [{ k: 'A', label: '기관 A', nameKey: 'aName' }, { k: 'B', label: '기관 B', nameKey: 'bName' }],
    fields: [
      { g: '기관 A', k: 'aName', l: '기관·회사명', d: '○○상사' },
      { g: '기관 A', k: 'aCeo', l: '대표자', d: '홍길동' },
      { g: '기관 A', k: 'aAddr', l: '주소', d: '서울특별시 영등포구 여의대로 108', w: 2 },
      { g: '기관 B', k: 'bName', l: '기관·회사명', d: '△△물산' },
      { g: '기관 B', k: 'bCeo', l: '대표자', d: '김철수' },
      { g: '기관 B', k: 'bAddr', l: '주소', d: '경기 화성시 ○○로 00', w: 2 },
      { g: '협약 내용', k: 'title', l: '협약명', d: '재생원료 공급망 협력을 위한 업무협약', w: 2 },
      { g: '협약 내용', k: 'term', l: '협약 기간', d: '2027-01-01 ~ 2028-12-31' },
      { g: '협약 내용', k: 'signDate', l: '체결일', t: 'date', d: today() },
      { g: '협약 내용', k: 'purpose', l: '협약 목적', t: 'area', d: '양 기관은 재생원료의 안정적 공급과 품질 정보 교류를 통해 상호 발전을 도모한다.', w: 2, rows: 2 }
    ],
    sets: [{
      k: 'items', label: '협력 분야', addLabel: '분야 추가',
      cols: [
        { k: 'item', h: '협력 분야', w: '34%', d: '원료 공급' },
        { k: 'aRole', h: '기관 A 역할', w: '33%', d: '월 200톤 공급, 품질 성적서 제공' },
        { k: 'bRole', h: '기관 B 역할', w: '33%', d: '연간 물량 확약, 30일 내 대금 지급' }
      ],
      def: [
        { item: '원료 공급', aRole: '월 200톤 공급, 품질 성적서 제공', bRole: '연간 물량 확약, 30일 내 대금 지급' },
        { item: '품질 정보 교류', aRole: '분기 시험 결과 공유', bRole: '입고 검사 결과 피드백' },
        { item: '공동 마케팅', aRole: '전시회 공동 부스 참여', bRole: '홍보물 제작·배포 협조' }
      ]
    }],
    blocks: [
      { t: 'parties', cols: [
        { title: '기관 A', rows: [['명칭', 'aName'], ['대표자', 'aCeo'], ['주소', 'aAddr']] },
        { title: '기관 B', rows: [['명칭', 'bName'], ['대표자', 'bCeo'], ['주소', 'bAddr']] }
      ] },
      sec('제1조 (목적)', 'purpose'),
      sec('제2조 (협력 분야)', function () { return '양 기관은 아래 분야에서 협력한다. 세부 내용은 표와 같다.'; }),
      { t: 'table', set: 'items', head: ['협력 분야', '기관 A 역할', '기관 B 역할'], cols: [{ k: 'item', h: '협력 분야' }, { k: 'aRole', h: '기관 A 역할' }, { k: 'bRole', h: '기관 B 역할' }] },
      sec('제3조 (협약 기간)', function (d) { return '이 협약의 유효기간은 ' + d.f.term + '로 하며, 기간 만료 1개월 전까지 서면으로 이의가 없으면 1년씩 자동 연장한다.'; }),
      sec('제4조 (비밀유지)', function () { return '양 기관은 협약 수행 중 알게 된 상대방의 거래 정보·기술 자료를 상대방의 사전 동의 없이 제3자에게 공개하지 않는다.'; }),
      sec('제5조 (법적 효력)', function () { return '이 협약은 상호 협력을 위한 양해 사항을 정한 것으로, 개별 거래의 권리·의무는 별도의 계약으로 정한다. 이 협약만으로 금전적 청구권이 발생하지 않는다.'; }),
      sec('제6조 (해지)', function () { return '어느 한쪽이 협약을 위반하거나 협력을 계속하기 어려운 사유가 생기면 30일 전 서면 통지로 협약을 해지할 수 있다.'; }),
      body('양 기관은 위 내용을 확인하고 협약서 2부를 작성해 각 1부씩 보관한다.'),
      sign(['A', 'B'], function (d) { return '체결일 ' + dko(d.f.signDate) + ' · 양 기관 대표자가 서명·날인합니다.'; }),
      note('※ MOU는 구속력 있는 계약이 아니라 협력 의사를 확인하는 문서입니다. 실제 공급·대금 조건은 물품공급계약서 등 별도 계약으로 정해야 하며, 독점·배타 조항을 넣으려면 별도 합의가 필요합니다.')
    ]
  });

  /* ---------------------------------------------------------
     3. 주주총회 의사록
  --------------------------------------------------------- */
  add({
    id: 'shareholders-minutes', cat: 'contract', sub: 'ct-corp', no: '01',
    name: '주주총회 의사록', en: 'MINUTES OF SHAREHOLDERS MEETING',
    keywords: '주주총회 의사록 주총 결의 정관 변경 이사 선임 승인 의사록 법인',
    head: { sub: 'MINUTES OF SHAREHOLDERS MEETING', meta: [['회의일', 'meetDate'], ['회사', 'company']] },
    parties: [{ k: 'A', label: '의장', nameKey: 'chair' }, { k: 'B', label: '작성(서기)', nameKey: 'clerk' }],
    fields: [
      { g: '회사', k: 'company', l: '상호', d: '○○ 주식회사' },
      { g: '회사', k: 'ceo', l: '대표이사', d: '홍길동' },
      { g: '회사', k: 'addr', l: '본점 소재지', d: '서울특별시 영등포구 여의대로 108', w: 2 },
      { g: '회의', k: 'kind', l: '총회 종류', t: 'sel', opts: ['정기주주총회', '임시주주총회'], d: '정기주주총회' },
      { g: '회의', k: 'meetDate', l: '일시', d: '2027-03-20 10:00' },
      { g: '회의', k: 'place', l: '장소', d: '본점 회의실' },
      { g: '회의', k: 'chair', l: '의장', d: '홍길동' },
      { g: '회의', k: 'clerk', l: '서기', d: '이민수' },
      { g: '회의', k: 'totalShares', l: '발행주식총수', t: 'num', d: '10000', h: '주' },
      { g: '회의', k: 'presentShares', l: '출석 주식수', t: 'num', d: '8000', h: '주' },
      { g: '회의', k: 'recordDate', l: '기준일', t: 'date', d: '2026-12-31' }
    ],
    sets: [{
      k: 'resolutions', label: '결의 안건', addLabel: '안건 추가',
      cols: [
        { k: 'no', h: '의안', w: '8%', d: '1' },
        { k: 'item', h: '안건', w: '44%', d: '재무제표 승인의 건' },
        { k: 'for', h: '찬성', t: 'num', w: '12%', d: '8000' },
        { k: 'against', h: '반대', t: 'num', w: '12%', d: '0' },
        { k: 'result', h: '결과', w: '24%', d: '원안대로 승인' }
      ],
      def: [
        { no: '1', item: '제7기 재무제표 승인의 건', for: '8000', against: '0', result: '원안대로 승인' },
        { no: '2', item: '이사 선임의 건 (사내이사 1명)', for: '8000', against: '0', result: '원안대로 승인' },
        { no: '3', item: '이사 보수한도 승인의 건', for: '7500', against: '500', result: '원안대로 승인' }
      ]
    }],
    blocks: [
      { t: 'kv', rows: [['회사', 'company'], ['대표이사', 'ceo'], ['총회 종류', 'kind'], ['일시', 'meetDate'], ['장소', 'place'], ['기준일', function (d) { return dko(d.f.recordDate); }], ['발행주식총수', function (d) { return fmt(d.f.totalShares) + '주'; }], ['출석 주식수', function (d) { return fmt(d.f.presentShares) + '주'; }]] },
      sec('제1부 (의사 진행)', function (d) {
        return '주주 ' + d.f.chair + '의 개회 선언으로 ' + d.f.kind + '를 개최하고, 출석 주주가 발행주식총수 ' + fmt(d.f.totalShares) + '주 중 ' + fmt(d.f.presentShares) + '주를 보유해 의결정족수를 충족함을 확인한 후 ' + d.f.chair + '을 의장으로, ' + d.f.clerk + '을 서기로 선임하였다.';
      }),
      sec('제2부 (결의 안건)', function () { return '의장이 안건을 상정하고 설명한 뒤 표결에 부쳐 다음 각 호와 같이 결의하였다.'; }),
      { t: 'table', set: 'resolutions', head: ['의안', '안건', '찬성', '반대', '결과'], cols: [{ k: 'no', h: '의안', t: 'center' }, { k: 'item', h: '안건' }, { k: 'for', h: '찬성', t: 'num' }, { k: 'against', h: '반대', t: 'num' }, { k: 'result', h: '결과' }] },
      sec('제3부 (폐회)', function () { return '안건 심의를 모두 마치고 의장이 폐회를 선언하였다. 이 의사록은 참석한 주주 전원이 확인 후 기명날인한다.'; }),
      body('위 회의의 진행과 결의 내용이 사실과 다름없음을 확인합니다.'),
      sign(['A', 'B'], function (d) { return dko(d.f.recordDate) + ' 기준일 · 의장과 서기가 서명·날인합니다.'; }),
      note('※ 상법상 정기주주총회는 회계연도 종료 후 3개월 내에 열어야 하며, 의사록은 본점과 지점에 5년간 비치해야 합니다. 자본금 10억원 미만 회사의 서면 결의는 요건을 확인해 사용하세요. 정관 변경·합병 등은 등기 절차가 따로 필요합니다.')
    ]
  });

  /* ---------------------------------------------------------
     4. 이사회 의사록
  --------------------------------------------------------- */
  add({
    id: 'board-minutes', cat: 'contract', sub: 'ct-corp', no: '02',
    name: '이사회 의사록', en: 'MINUTES OF BOARD MEETING',
    keywords: '이사회 의사록 이사회 결의 이사 승인 대표이사 선임 법인 의사록',
    head: { sub: 'MINUTES OF BOARD MEETING', meta: [['회의일', 'meetDate'], ['회사', 'company']] },
    parties: [{ k: 'A', label: '의장', nameKey: 'chair' }, { k: 'B', label: '서기', nameKey: 'clerk' }],
    fields: [
      { g: '회사', k: 'company', l: '상호', d: '○○ 주식회사' },
      { g: '회사', k: 'addr', l: '본점 소재지', d: '서울특별시 영등포구 여의대로 108', w: 2 },
      { g: '회의', k: 'meetDate', l: '일시', d: '2026-12-15 15:00' },
      { g: '회의', k: 'place', l: '장소', d: '본점 대회의실' },
      { g: '회의', k: 'chair', l: '의장(대표이사)', d: '홍길동' },
      { g: '회의', k: 'clerk', l: '서기', d: '이민수' },
      { g: '회의', k: 'noticeDate', l: '소집 통지일', t: 'date', d: addD(today(), -7) },
      { g: '회의', k: 'attend', l: '출석 이사', d: '홍길동, 김철수, 박영희 (3명 중 3명 출석)', w: 2 }
    ],
    sets: [{
      k: 'resolutions', label: '결의 안건', addLabel: '안건 추가',
      cols: [
        { k: 'no', h: '의안', w: '8%', d: '1' },
        { k: 'item', h: '안건', w: '52%', d: '2027년 사업계획 및 예산 승인의 건' },
        { k: 'result', h: '결과', w: '24%', d: '전원 찬성 가결' },
        { k: 'memo', h: '비고', w: '16%', d: '' }
      ],
      def: [
        { no: '1', item: '2027년 사업계획 및 예산 승인의 건', result: '전원 찬성 가결', memo: '' },
        { no: '2', item: '신규 차입 3억원 승인의 건', result: '전원 찬성 가결', memo: '금리 연 5.2%' },
        { no: '3', item: '지점 설치 승인의 건', result: '전원 찬성 가결', memo: '부산 사상구' }
      ]
    }],
    blocks: [
      { t: 'kv', rows: [['회사', 'company'], ['일시', 'meetDate'], ['장소', 'place'], ['소집 통지일', function (d) { return dko(d.f.noticeDate); }], ['출석 이사', 'attend'], ['의장', 'chair'], ['서기', 'clerk']] },
      sec('제1부 (개회)', function (d) {
        return '이사 ' + d.f.chair + '의 소집으로 이사회를 개최하고, 출석 이사 전원의 동의로 ' + d.f.chair + '을 의장으로 선임하였다. 의장은 소집 통지가 적법하게 이루어졌음을 확인하고 회의를 개회하였다.';
      }),
      sec('제2부 (심의·결의)', function () { return '의장이 각 안건을 상정하고 심의한 후 결의하였다. 안건별 결과는 다음과 같다.'; }),
      { t: 'table', set: 'resolutions', head: ['의안', '안건', '결과', '비고'], cols: [{ k: 'no', h: '의안', t: 'center' }, { k: 'item', h: '안건' }, { k: 'result', h: '결과', t: 'center' }, { k: 'memo', h: '비고' }] },
      sec('제3부 (폐회)', function () { return '남은 안건이 없음을 확인하고 의장이 폐회를 선언하였다. 출석 이사는 이 의사록의 내용이 사실과 같음을 확인하고 기명날인한다.'; }),
      sign(['A', 'B'], function (d) { return '작성일 ' + dko(d.f.meetDate) + ' · 의장과 서기가 서명·날인합니다.'; }),
      note('※ 이사회 결의가 필요한 사항(중요 자산 처분, 대규모 차입, 지점 설치 등)은 정관과 상법 제393조를 확인하세요. 의사록에는 반대 의견과 그 이유를 남겨 두면 이후 책임 소재를 밝히는 데 도움이 됩니다.')
    ]
  });

  /* ---------------------------------------------------------
     5. 정관 (표준안)
  --------------------------------------------------------- */
  add({
    id: 'articles', cat: 'contract', sub: 'ct-corp', no: '03',
    name: '정관 (표준안)', en: 'ARTICLES OF INCORPORATION',
    keywords: '정관 정관 작성 법인 설립 주식회사 정관 변경 자본금 주식 발행',
    head: { sub: 'ARTICLES OF INCORPORATION', meta: [['작성일', 'issueDate'], ['자본금', function (d) { return won(d.f.capital); }]] },
    parties: [{ k: 'A', label: '대표이사', nameKey: 'ceo' }, { k: 'B', label: '확인', nameKey: 'clerk' }],
    fields: [
      { g: '회사', k: 'company', l: '상호', d: '○○ 주식회사' },
      { g: '회사', k: 'ceo', l: '대표이사', d: '홍길동' },
      { g: '회사', k: 'addr', l: '본점 소재지', d: '서울특별시 영등포구 여의대로 108', w: 2 },
      { g: '회사', k: 'purpose', l: '사업 목적', t: 'area', d: '1. 산업용 원료 도소매 및 수출입업\n2. 플라스틱 재생원료 가공·판매업\n3. 위 각 호에 부대하는 사업', w: 2, rows: 4 },
      { g: '회사', k: 'capital', l: '자본금', t: 'num', d: '100000000', h: '원' },
      { g: '회사', k: 'shares', l: '발행주식총수', t: 'num', d: '20000', h: '주' },
      { g: '회사', k: 'parValue', l: '1주 액면금액', t: 'num', d: '5000', h: '원' },
      { g: '회사', k: 'fiscal', l: '회계연도', d: '매년 1월 1일부터 12월 31일까지' },
      { g: '회사', k: 'clerk', l: '작성자', d: '이민수' },
      { g: '회사', k: 'issueDate', l: '작성일', t: 'date', d: today() }
    ],
    blocks: [
      sec('제1장 총칙', function (d) { return '제1조 (상호) 이 회사는 ' + d.f.company + '라 한다.\n제2조 (목적) 이 회사는 다음 사업을 목적으로 한다.\n' + d.f.purpose + '\n제3조 (본점의 소재지) 이 회사의 본점은 ' + d.f.addr + '에 둔다.\n제4조 (공고방법) 이 회사의 공고는 회사의 인터넷 홈페이지에 게재한다.'; }),
      sec('제2장 주식', function (d) {
        return '제5조 (발행주식총수) 이 회사가 발행할 주식의 총수는 ' + fmt(d.f.shares) + '주로 한다.\n' +
          '제6조 (1주의 금액) 이 회사가 발행하는 주식 1주의 금액은 ' + won(d.f.parValue) + '으로 한다.\n' +
          '제7조 (주식의 종류) 이 회사가 발행하는 주식은 기명식 보통주로 한다.\n' +
          '제8조 (주식의 양도) 주식을 양도할 때에는 이사회의 승인을 받아야 한다.\n' +
          '제9조 (명의개서) 주식의 이전은 취득자의 성명·주소를 주주명부에 기재하지 않으면 회사에 대항할 수 없다.';
      }),
      sec('제3장 기관', function () {
        return '제10조 (주주총회) 정기주주총회는 매년 3월 중에, 임시주주총회는 필요에 따라 소집한다.\n' +
          '제11조 (이사) 이 회사는 이사 3명을 두며, 대표이사는 이사회에서 선임한다. 이사의 임기는 3년으로 한다.\n' +
          '제12조 (감사) 이 회사는 감사 1명을 두며, 임기는 3년으로 한다.\n' +
          '제13조 (이사회) 이사회는 이사 전원으로 구성하고, 대표이사가 소집한다.';
      }),
      sec('제4장 계산', function (d) { return '제14조 (회계연도) 이 회사의 회계연도는 ' + d.f.fiscal + '로 한다.\n제15조 (재무제표의 승인) 재무제표는 주주총회의 승인을 받아 확정한다.'; }),
      sec('제5장 부칙', function (d) { return '제16조 (설립 경과) 이 정관은 ' + dko(d.f.issueDate) + '부터 시행한다. 정관을 변경하려면 주주총회의 특별결의를 거쳐야 한다.'; }),
      body('위와 같이 정관을 작성합니다.'),
      sign(['A', 'B'], function (d) { return dko(d.f.issueDate) + ' · 발기인 또는 대표이사가 서명·날인합니다.'; }),
      note('※ 이 정관은 자체 작성한 표준안이며, 법인 설립 등기에는 등기소 양식과 발기인 명세·주식 인수 증서 등 추가 서류가 필요합니다. 자본금·주식 수·1주 금액은 자본금 ÷ 주식수와 일치해야 하며, 변경 시 등기를 함께 해야 합니다.')
    ]
  });

  /* ---------------------------------------------------------
     6. 연봉계약서
  --------------------------------------------------------- */
  add({
    id: 'salary-contract', cat: 'contract', sub: 'ct-labor', no: '02',
    name: '연봉계약서', en: 'ANNUAL SALARY CONTRACT',
    keywords: '연봉계약서 연봉제 임금 성과급 연봉 협상 근로계약 연봉 계약',
    head: { sub: 'ANNUAL SALARY CONTRACT', meta: [['체결일', 'signDate'], ['적용 기간', function (d) { return dko(d.f.fromDate) + ' ~ ' + dko(d.f.toDate); }]] },
    parties: [{ k: 'A', label: '회사(갑)', nameKey: 'company' }, { k: 'B', label: '근로자(을)', nameKey: 'worker' }],
    fields: [
      { g: '회사', k: 'company', l: '상호', d: '○○상사' },
      { g: '회사', k: 'ceo', l: '대표자', d: '홍길동' },
      { g: '회사', k: 'addr', l: '주소', d: '서울특별시 영등포구 여의대로 108', w: 2 },
      { g: '근로자', k: 'worker', l: '성명', d: '김철수' },
      { g: '근로자', k: 'dept', l: '부서', d: '영업팀' },
      { g: '근로자', k: 'position', l: '직위', d: '대리' },
      { g: '근로자', k: 'joinDate', l: '입사일', t: 'date', d: '2021-03-02' },
      { g: '연봉', k: 'fromDate', l: '적용 시작일', t: 'date', d: '2027-01-01' },
      { g: '연봉', k: 'toDate', l: '적용 종료일', t: 'date', d: '2027-12-31' },
      { g: '연봉', k: 'annual', l: '연봉 총액', t: 'num', d: '38400000', h: '원' },
      { g: '연봉', k: 'payCount', l: '지급 횟수', t: 'sel', opts: ['12회(월급)', '12회 + 상여 1회', '12회 + 상여 2회'], d: '12회(월급)' },
      { g: '연봉', k: 'payDay', l: '지급일', d: '매월 25일' },
      { g: '연봉', k: 'inclusive', l: '포함 항목', t: 'area', d: '기본급, 직책수당, 식대(비과세 20만원), 연차수당 상당액 포함. 시간외 근무수당은 별도 지급.', w: 2, rows: 2 },
      { g: '연봉', k: 'review', l: '연봉 조정', d: '매년 1월 성과·물가를 반영해 재협의' },
      { g: '연봉', k: 'bonus', l: '성과급', t: 'area', d: '연간 영업이익 목표 달성 시 연봉의 0~20% 범위에서 지급하며, 지급 기준은 별도 규정에 따른다.', w: 2, rows: 2 },
      { g: '연봉', k: 'signDate', l: '체결일', t: 'date', d: today() }
    ],
    blocks: [
      { t: 'parties', cols: [
        { title: '회사 (갑)', rows: [['상호', 'company'], ['대표자', 'ceo'], ['주소', 'addr']] },
        { title: '근로자 (을)', rows: [['성명', 'worker'], ['부서·직위', function (d) { return d.f.dept + ' / ' + d.f.position; }], ['입사일', function (d) { return dko(d.f.joinDate); }]] }
      ] },
      sec('제1조 (적용 기간)', function (d) { return '이 계약은 ' + dko(d.f.fromDate) + '부터 ' + dko(d.f.toDate) + '까지 적용한다. 기간이 끝나면 양 당사자가 합의해 갱신하며, 갱신하지 않으면 종전 조건이 계속 적용된다.'; }),
      sec('제2조 (연봉)', function (d) {
        return '을의 연봉은 ' + won(d.f.annual) + '으로 하며, ' + d.f.payCount + '로 나누어 ' + d.f.payDay + '에 지급한다. 연봉에는 다음 항목이 포함된다.\n' + d.f.inclusive;
      }),
      sec('제3조 (성과급)', 'bonus'),
      sec('제4조 (근로조건)', function () {
        return '근무시간, 휴일, 연차유급휴가, 4대보험 등 근로조건은 취업규칙과 근로기준법에 따른다. 연봉에 포함되지 않는 시간외·휴일근무수당은 실제 근무 기록에 따라 별도 지급한다.';
      }),
      sec('제5조 (연봉 조정)', function (d) {
        return d.f.review + '. 조정 결과는 서면으로 통지하며, 을이 이의가 있으면 통지 후 14일 내 협의를 요청할 수 있다.';
      }),
      sec('제6조 (계약의 해지)', function () {
        return '을이 중대한 위반이나 손해를 끼친 경우 회사는 취업규칙이 정한 절차에 따라 계약을 해지할 수 있다. 을이 사직하려면 30일 전에 서면으로 통지한다.';
      }),
      body('회사와 근로자는 위 연봉과 근로조건을 확인하고 이 계약을 체결한다.'),
      sign(['A', 'B'], function (d) { return '체결일 ' + dko(d.f.signDate) + ' · 회사와 근로자가 각각 서명·날인합니다.'; }),
      note('※ 연봉에 시간외수당·연차수당을 포함하는 경우에도 근로기준법상 최저임금과 법정수당 지급 의무는 면제되지 않습니다. 포괄임금 약정은 근로 형태·업무 성격에 따라 효력이 달라질 수 있으므로 노무 전문가 확인을 권합니다.')
    ]
  });

  /* ---------------------------------------------------------
     7. 부동산 임대차계약서
  --------------------------------------------------------- */
  add({
    id: 'realestate-lease', cat: 'contract', sub: 'ct-lease', no: '01',
    name: '부동산 임대차계약서', en: 'LEASE AGREEMENT',
    keywords: '임대차계약서 부동산 임대차 상가 월세 보증금 임대인 임차인 계약',
    head: { sub: 'LEASE AGREEMENT', meta: [['체결일', 'signDate'], ['임대 기간', function (d) { return dko(d.f.fromDate) + ' ~ ' + dko(d.f.toDate); }]] },
    parties: [{ k: 'A', label: '임대인', nameKey: 'lessorName' }, { k: 'B', label: '임차인', nameKey: 'lesseeName' }],
    fields: [
      { g: '임대인', k: 'lessorName', l: '성명·상호', d: '홍길동' },
      { g: '임대인', k: 'lessorTel', l: '연락처', d: '010-0000-0000' },
      { g: '임대인', k: 'lessorAddr', l: '주소', d: '서울특별시 마포구 ○○로 00', w: 2 },
      { g: '임차인', k: 'lesseeName', l: '성명·상호', d: '김철수' },
      { g: '임차인', k: 'lesseeTel', l: '연락처', d: '010-0000-0000' },
      { g: '임차인', k: 'lesseeAddr', l: '주소', d: '서울특별시 마포구 ○○로 00', w: 2 },
      { g: '목적물', k: 'property', l: '목적물 소재지', d: '서울특별시 마포구 ○○로 00, 1층 101호', w: 2 },
      { g: '목적물', k: 'area', l: '면적', d: '전용 33㎡ (10평)' },
      { g: '목적물', k: 'use', l: '용도', d: '근린생활시설 (사무실)' },
      { g: '조건', k: 'deposit', l: '보증금', t: 'num', d: '20000000', h: '원' },
      { g: '조건', k: 'rent', l: '월 임대료', t: 'num', d: '1200000', h: '원' },
      { g: '조건', k: 'rentDay', l: '임대료 지급일', d: '매월 25일 선불' },
      { g: '조건', k: 'manage', l: '관리비', d: '월 150,000원 별도 (수도·전기·가스는 임차인 부담)' },
      { g: '조건', k: 'fromDate', l: '임대 시작일', t: 'date', d: addD(today(), 30) },
      { g: '조건', k: 'toDate', l: '임대 종료일', t: 'date', d: addY(addD(today(), 30), 2) },
      { g: '조건', k: 'restore', l: '원상복구', t: 'sel', opts: ['원상복구 함', '협의 후 결정', '인테리어 승계'], d: '협의 후 결정' },
      { g: '조건', k: 'special', l: '특약 사항', t: 'area', d: '1) 임차인은 전세권 설정을 요구하지 않는다.\n2) 임대인은 계약 기간 중 임대료를 인상하지 않는다.\n3) 시설 고장(누수·보일러) 수리는 임대인이 부담한다.', w: 2, rows: 4 },
      { g: '조건', k: 'signDate', l: '체결일', t: 'date', d: today() }
    ],
    blocks: [
      { t: 'parties', cols: [
        { title: '임대인', rows: [['성명', 'lessorName'], ['연락처', 'lessorTel'], ['주소', 'lessorAddr']] },
        { title: '임차인', rows: [['성명', 'lesseeName'], ['연락처', 'lesseeTel'], ['주소', 'lesseeAddr']] }
      ] },
      { t: 'kv', rows: [['목적물', 'property'], ['면적', 'area'], ['용도', 'use'], ['보증금', function (d) { return won(d.f.deposit); }], ['월 임대료', function (d) { return won(d.f.rent); }], ['임대 기간', function (d) { return dko(d.f.fromDate) + ' ~ ' + dko(d.f.toDate); }]] },
      sec('제1조 (목적물)', function (d) { return '임대인은 임차인에게 ' + d.f.property + ' (' + d.f.area + ')를 ' + d.f.use + ' 용도로 임대하고, 임차인은 이를 인도받아 사용·수익한다.'; }),
      sec('제2조 (보증금과 임대료)', function (d) { return '보증금 ' + won(d.f.deposit) + '은 계약 체결 시 지급하고, 월 임대료 ' + won(d.f.rent) + '은 ' + d.f.rentDay + '에 임대인의 계좌로 지급한다. 관리비는 ' + d.f.manage + '. 임대료를 2개월 이상 연체하면 임대인은 계약을 해지할 수 있다.'; }),
      sec('제3조 (임대 기간)', function (d) { return '임대 기간은 ' + dko(d.f.fromDate) + '부터 ' + dko(d.f.toDate) + '까지로 한다. 기간 만료 2개월 전까지 어느 한쪽도 이의를 제기하지 않으면 같은 조건으로 1년씩 갱신한다.'; }),
      sec('제4조 (사용·관리)', function () { return '임차인은 목적물을 계약에서 정한 용도로만 사용하고, 구조 변경이나 전대는 임대인의 서면 동의를 받아야 한다. 임차인의 과실로 발생한 손해는 임차인이 부담한다.'; }),
      sec('제5조 (수선·원상복구)', function (d) { return '주요 시설의 수선은 임대인이 부담하고, 임차인의 사용상 필요에 따른 소규모 수선은 임차인이 부담한다. 계약 종료 시 원상복구는 ‘' + d.f.restore + '’ 기준에 따른다.'; }),
      sec('제6조 (해지·손해배상)', function () { return '어느 한쪽이 계약을 위반하면 상대방은 1개월의 기간을 정해 시정을 요구하고, 시정되지 않으면 계약을 해지할 수 있다. 귀책사유로 계약이 해지되면 귀책 당사자가 상대방의 손해를 배상한다.'; }),
      sec('제7조 (특약)', 'special'),
      body('임대인과 임차인은 위 내용을 확인하고 계약서 2부를 작성해 각 1부씩 보관한다.'),
      sign(['A', 'B'], function (d) { return '체결일 ' + dko(d.f.signDate) + ' · 임대인과 임차인이 각각 서명·날인합니다.'; }),
      note('※ 상가 임대차는 상가건물 임대차보호법의 보호를 받을 수 있으나, 계약서에 확정일자를 받아야 대항력이 생깁니다. 건축물대장과 등기부등본으로 소유자·용도를 확인하고, 보증금 반환 조건과 원상복구 범위를 구체적으로 적으세요.')
    ]
  });

  /* ---------------------------------------------------------
     8. 저작권 양도·이용허락 계약서
  --------------------------------------------------------- */
  add({
    id: 'copyright-assign', cat: 'contract', sub: 'ct-free', no: '06',
    name: '저작권 양도·이용허락 계약서', en: 'COPYRIGHT ASSIGNMENT / LICENSE',
    keywords: '저작권 양도 이용허락 라이선스 콘텐츠 사용 계약 이미지 영상 저작물',
    head: { sub: 'COPYRIGHT ASSIGNMENT / LICENSE', meta: [['체결일', 'signDate'], ['대금', function (d) { return won(d.f.fee); }]] },
    parties: [{ k: 'A', label: '저작자(갑)', nameKey: 'author' }, { k: 'B', label: '이용자(을)', nameKey: 'user' }],
    fields: [
      { g: '저작자', k: 'author', l: '성명·상호', d: '이민수' },
      { g: '저작자', k: 'authorTel', l: '연락처', d: '010-0000-0000' },
      { g: '이용자', k: 'user', l: '성명·상호', d: '○○미디어' },
      { g: '이용자', k: 'userTel', l: '연락처', d: '02-0000-0000' },
      { g: '계약', k: 'type', l: '계약 형태', t: 'sel', opts: ['저작재산권 전부 양도', '2차적 저작물 작성 허락', '이용허락(라이선스)'], d: '이용허락(라이선스)' },
      { g: '계약', k: 'work', l: '대상 저작물', d: '쇼츠 영상 20편 (반려견 일상 시리즈)', w: 2 },
      { g: '계약', k: 'use', l: '이용 범위', t: 'area', d: '유튜브·인스타그램·틱톡 게시 및 홍보물 삽입. 방송·극장 상영, 상품 제작은 제외.', w: 2, rows: 2 },
      { g: '계약', k: 'terms', l: '이용 조건', t: 'area', d: '2차 편집 가능, 출처 표기(채널명) 필수, 재판매 금지', w: 2, rows: 2 },
      { g: '계약', k: 'period', l: '이용 기간', d: '2026-12-01 ~ 2028-11-30' },
      { g: '계약', k: 'fee', l: '대금', t: 'num', d: '1500000', h: '원' },
      { g: '계약', k: 'payTerms', l: '대금 지급', d: '계약금 50% 체결 시, 잔금 50% 납품 후 7일 내' },
      { g: '계약', k: 'credit', l: '저작자 표시', d: '영상 말미 또는 설명란에 ‘영상: ○○채널’ 표기' },
      { g: '계약', k: 'signDate', l: '체결일', t: 'date', d: today() }
    ],
    blocks: [
      { t: 'parties', cols: [
        { title: '저작자 (갑)', rows: [['성명', 'author'], ['연락처', 'authorTel']] },
        { title: '이용자 (을)', rows: [['명칭', 'user'], ['연락처', 'userTel']] }
      ] },
      sec('제1조 (계약 형태와 대상)', function (d) { return '갑은 자신이 창작한 ‘' + d.f.work + '’에 대해 을에게 ' + d.f.type + '을 허락한다. 대상 저작물 목록은 별첨으로 확정한다.'; }),
      sec('제2조 (이용 범위)', function (d) { return d.f.use + '\n이용 조건: ' + d.f.terms; }),
      sec('제3조 (이용 기간과 지역)', function (d) { return '이용 기간은 ' + d.f.period + ', 지역은 대한민국 및 온라인 전 세계로 한다. 기간이 끝나면 을은 새 게시를 중단하고, 이미 게시된 콘텐츠는 30일 내 비공개로 전환한다.'; }),
      sec('제4조 (대금)', function (d) { return '을은 갑에게 대금 ' + won(d.f.fee) + '을 ' + d.f.payTerms + ' 방법으로 지급한다.'; }),
      sec('제5조 (저작권 귀속)', function (d) {
        return d.f.type === '저작재산권 전부 양도'
          ? '대금 지급이 완료되면 대상 저작물의 저작재산권 전부가 을에게 이전한다. 갑은 자신의 포트폴리오에 게시할 목적으로만 사용할 수 있다.'
          : '대상 저작물의 저작권은 갑에게 남으며, 을은 이 계약에서 정한 범위 안에서만 이용할 수 있다. 을이 범위를 넘어 이용하면 갑은 계약을 해지하고 손해배상을 청구할 수 있다.';
      }),
      sec('제6조 (저작자 표시)', function (d) { return d.f.credit + '. 을은 갑의 허락 없이 저작자 표시를 삭제하거나 변경하지 않는다.'; }),
      sec('제7조 (보증과 책임)', function () { return '갑은 대상 저작물이 제3자의 권리를 침해하지 않음을 보증한다. 침해 주장이 제기되면 갑이 직접 대응하고, 그로 인해 을에게 발생한 손해를 배상한다.'; }),
      sec('제8조 (비밀유지·기타)', function () { return '양 당사자는 계약 조건과 대금을 제3자에게 공개하지 않는다. 정하지 않은 사항은 저작권법과 일반 상관례에 따른다.'; }),
      body('갑과 을은 위 내용을 확인하고 이 계약을 체결한다.'),
      sign(['A', 'B'], function (d) { return '체결일 ' + dko(d.f.signDate) + ' · 갑과 을이 각각 서명·날인합니다.'; }),
      note('※ 저작재산권을 전부 양도하면 2차 이용료를 받을 권리가 사라질 수 있습니다. 반대로 이용허락은 범위를 벗어난 사용(예: 상품화·재판매)을 막을 수 있어, 실제 사용 계획을 범위에 구체적으로 적는 것이 안전합니다. 저작인격권은 양도되지 않습니다.')
    ]
  });

  /* ---------------------------------------------------------
     9. 홈페이지 제작 계약서
  --------------------------------------------------------- */
  add({
    id: 'webdev', cat: 'contract', sub: 'ct-free', no: '07',
    name: '홈페이지 제작 계약서', en: 'WEBSITE DEVELOPMENT AGREEMENT',
    keywords: '홈페이지 제작 계약서 웹사이트 개발 외주 용역 계약 유지보수 납품 검수',
    head: { sub: 'WEBSITE DEVELOPMENT AGREEMENT', meta: [['체결일', 'signDate'], ['계약 금액', function (d) { return won(d.f.total); }]] },
    parties: [{ k: 'A', label: '발주자(갑)', nameKey: 'client' }, { k: 'B', label: '제작자(을)', nameKey: 'vendor' }],
    fields: [
      { g: '발주자', k: 'client', l: '상호', d: '○○상사' },
      { g: '발주자', k: 'clientCeo', l: '대표자', d: '홍길동' },
      { g: '제작자', k: 'vendor', l: '상호', d: '△△웹스튜디오' },
      { g: '제작자', k: 'vendorCeo', l: '대표자', d: '김철수' },
      { g: '제작 내용', k: 'project', l: '프로젝트명', d: '기업 홈페이지 리뉴얼', w: 2 },
      { g: '제작 내용', k: 'pages', l: '제작 범위', t: 'area', d: '메인 1, 회사소개 1, 제품 3, 고객지원 1, 문의 1 — 총 7페이지 (반응형)', w: 2, rows: 2 },
      { g: '제작 내용', k: 'include', l: '포함 사항', t: 'area', d: '디자인 시안 2회, 퍼블리싱, 관리자 페이지(게시판·문의 관리), 기본 SEO 설정, 도메인 연결', w: 2, rows: 2 },
      { g: '일정', k: 'startDate', l: '착수일', t: 'date', d: addD(today(), 7) },
      { g: '일정', k: 'endDate', l: '납품일', t: 'date', d: addD(today(), 45) },
      { g: '일정', k: 'inspectDays', l: '검수 기간', t: 'num', d: '7', h: '일' },
      { g: '대금', k: 'total', l: '총 계약금액', t: 'num', d: '6600000', h: '원' },
      { g: '대금', k: 'deposit', l: '계약금', t: 'num', d: '2000000', h: '원' },
      { g: '대금', k: 'balance', l: '잔금', t: 'num', d: '4600000', h: '원' },
      { g: '대금', k: 'maintain', l: '유지보수', d: '납품 후 6개월 무상 하자보수, 이후 월 15만원 별도 계약' },
      { g: '대금', k: 'warranty', l: '하자보수 범위', t: 'area', d: '제작 범위 내 오류·호환성 문제. 콘텐츠 수정·기능 추가는 별도 견적.', w: 2, rows: 2 },
      { g: '대금', k: 'signDate', l: '체결일', t: 'date', d: today() }
    ],
    blocks: [
      { t: 'parties', cols: [
        { title: '발주자 (갑)', rows: [['상호', 'client'], ['대표자', 'clientCeo']] },
        { title: '제작자 (을)', rows: [['상호', 'vendor'], ['대표자', 'vendorCeo']] }
      ] },
      sec('제1조 (목적과 범위)', function (d) { return '갑은 ‘' + d.f.project + '’를 을에게 의뢰하고, 을은 다음 범위의 홈페이지를 제작해 납품한다.\n' + d.f.pages + '\n포함 사항: ' + d.f.include; }),
      sec('제2조 (일정)', function (d) { return '착수일은 ' + dko(d.f.startDate) + ', 납품일은 ' + dko(d.f.endDate) + '로 한다. 갑의 자료 제공·피드백이 늦어지면 일정은 그 기간만큼 순연된다.'; }),
      sec('제3조 (검수)', function (d) {
        return '을은 납품 후 테스트 계정과 매뉴얼을 제공하고, 갑은 ' + d.f.inspectDays + '일 내에 검수 결과를 서면으로 통지한다. 기간 내 통지가 없으면 검수를 통과한 것으로 본다. 검수에서 지적된 사항은 을이 14일 내 보완한다.';
      }),
      sec('제4조 (대금)', function (d) { return '총 계약금액 ' + won(d.f.total) + ' 중 계약금 ' + won(d.f.deposit) + '은 착수 시, 잔금 ' + won(d.f.balance) + '은 검수 완료 후 7일 내 지급한다. 부가세는 별도로 한다.'; }),
      sec('제5조 (지식재산권)', function () {
        return '잔금 지급이 완료되면 갑이 제공한 콘텐츠와 완성된 홈페이지의 디자인·소스에 대한 사용권이 갑에게 있다. 을이 사용한 오픈소스·라이브러리는 해당 라이선스를 따른다. 을은 포트폴리오 목적으로만 결과물을 게시할 수 있다.';
      }),
      sec('제6조 (유지보수·하자보수)', function (d) { return d.f.maintain + '. 하자보수 범위는 ' + d.f.warranty; }),
      sec('제7조 (계약 해지)', function () {
        return '갑이 착수 전 해지하면 계약금은 반환되지 않는다. 착수 후 해지하면 진행된 공정에 해당하는 대금을 정산한다. 을이 정당한 사유 없이 일정을 30일 이상 지연하면 갑은 계약을 해지할 수 있다.';
      }),
      sec('제8조 (비밀유지)', function () { return '양 당사자는 계약 과정에서 알게 된 상대방의 자료·기술 정보를 제3자에게 공개하지 않는다.'; }),
      body('갑과 을은 위 내용을 확인하고 이 계약을 체결한다.'),
      sign(['A', 'B'], function (d) { return '체결일 ' + dko(d.f.signDate) + ' · 갑과 을이 각각 서명·날인합니다.'; }),
      note('※ 계약금·잔금 합계가 총액과 같은지 확인하세요. 디자인 시안 횟수, 수정 횟수, 추가 페이지 단가를 미리 정해 두면 제작 중 분쟁을 줄일 수 있습니다. 도메인·호스팅 명의는 갑 앞으로 두는 것이 안전합니다.')
    ]
  });

  /* ---------------------------------------------------------
     10. 합의서 (손해배상·분쟁)
  --------------------------------------------------------- */
  add({
    id: 'settlement', cat: 'contract', sub: 'ct-money', no: '04',
    name: '합의서 (손해배상·분쟁)', en: 'SETTLEMENT AGREEMENT',
    keywords: '합의서 손해배상 분쟁 교통사고 합의 금전 합의 민사 합의 각서',
    head: { sub: 'SETTLEMENT AGREEMENT', meta: [['작성일', 'signDate'], ['합의금', function (d) { return won(d.f.amount); }]] },
    parties: [{ k: 'A', label: '갑', nameKey: 'aName' }, { k: 'B', label: '을', nameKey: 'bName' }],
    fields: [
      { g: '갑', k: 'aName', l: '성명·상호', d: '홍길동' },
      { g: '갑', k: 'aTel', l: '연락처', d: '010-0000-0000' },
      { g: '갑', k: 'aAddr', l: '주소', d: '서울특별시 영등포구 ○○로 00', w: 2 },
      { g: '을', k: 'bName', l: '성명·상호', d: '김철수' },
      { g: '을', k: 'bTel', l: '연락처', d: '010-0000-0000' },
      { g: '을', k: 'bAddr', l: '주소', d: '서울특별시 마포구 ○○로 00', w: 2 },
      { g: '사건', k: 'case', l: '사건 개요', t: 'area', d: '2026년 11월 5일 ○○로 교차로에서 갑 소유 차량과 을 운전 차량의 접촉사고로 갑의 차량이 파손됨.', w: 2, rows: 3 },
      { g: '합의', k: 'amount', l: '합의금', t: 'num', d: '1200000', h: '원' },
      { g: '합의', k: 'payDate', l: '지급 기한', t: 'date', d: addD(today(), 7) },
      { g: '합의', k: 'payMethod', l: '지급 방법', d: '갑 명의 계좌 이체' },
      { g: '합의', k: 'scope', l: '합의 범위', t: 'area', d: '차량 수리비, 대차료, 기타 이 사건으로 인한 일체의 손해', w: 2, rows: 2 },
      { g: '합의', k: 'waive', l: '권리 포기 범위', t: 'area', d: '갑은 합의금을 수령한 후 이 사건과 관련해 민사상·형사상 이의를 제기하지 않는다. 단, 합의금 지급이 지연되면 이 합의는 효력을 잃는다.', w: 2, rows: 3 },
      { g: '합의', k: 'signDate', l: '작성일', t: 'date', d: today() }
    ],
    blocks: [
      { t: 'parties', cols: [
        { title: '갑', rows: [['성명', 'aName'], ['연락처', 'aTel'], ['주소', 'aAddr']] },
        { title: '을', rows: [['성명', 'bName'], ['연락처', 'bTel'], ['주소', 'bAddr']] }
      ] },
      sec('제1조 (사건의 경위)', 'case'),
      sec('제2조 (합의금)', function (d) { return '을은 갑에게 이 사건에 대한 손해배상으로 ' + won(d.f.amount) + '을 ' + dko(d.f.payDate) + '까지 ' + d.f.payMethod + ' 방법으로 지급한다.'; }),
      sec('제3조 (합의의 범위)', function (d) { return '이 합의는 ' + d.f.scope + '에 관한 것으로, 양 당사자는 이 사건에 관해 더 이상 다투지 않는다.'; }),
      sec('제4조 (권리 포기)', 'waive'),
      sec('제5조 (비밀유지)', function () { return '양 당사자는 이 합의의 내용과 합의금을 제3자에게 공개하지 않는다. 다만 보험사·수사기관 등 법령상 필요한 곳에는 예외로 한다.'; }),
      body('갑과 을은 위 내용을 확인하고 합의서 2부를 작성해 각 1부씩 보관한다.'),
      sign(['A', 'B'], function (d) { return '작성일 ' + dko(d.f.signDate) + ' · 갑과 을이 각각 서명·날인합니다.'; }),
      note('※ 합의금을 받은 뒤 후유증이 나타나는 경우 추가 청구가 어려울 수 있으므로, 치료가 끝난 뒤 합의하는 것이 안전합니다. 교통사고는 보험사 처리와 별개로 형사 합의(반의사불벌) 효력이 있는지 확인하세요.')
    ]
  });

  /* ---------------------------------------------------------
     11. 소프트웨어 라이선스 계약서
  --------------------------------------------------------- */
  add({
    id: 'sw-license', cat: 'contract', sub: 'ct-free', no: '08',
    name: '소프트웨어 라이선스 계약서', en: 'SOFTWARE LICENSE AGREEMENT',
    keywords: '소프트웨어 라이선스 계약 프로그램 사용권 SaaS 구독 유지보수 기술지원',
    head: { sub: 'SOFTWARE LICENSE AGREEMENT', meta: [['체결일', 'signDate'], ['연 이용료', function (d) { return won(d.f.fee); }]] },
    parties: [{ k: 'A', label: '공급자', nameKey: 'vendor' }, { k: 'B', label: '사용자', nameKey: 'client' }],
    fields: [
      { g: '공급자', k: 'vendor', l: '상호', d: '△△소프트' },
      { g: '공급자', k: 'vendorCeo', l: '대표자', d: '김철수' },
      { g: '사용자', k: 'client', l: '상호', d: '○○상사' },
      { g: '사용자', k: 'clientCeo', l: '대표자', d: '홍길동' },
      { g: '라이선스', k: 'product', l: '제품명', d: '○○ ERP 물류 모듈', w: 2 },
      { g: '라이선스', k: 'type', l: '이용 형태', t: 'sel', opts: ['설치형(온프레미스)', '클라우드(SaaS)', '하이브리드'], d: '클라우드(SaaS)' },
      { g: '라이선스', k: 'seats', l: '사용자 수', t: 'num', d: '10', h: '명' },
      { g: '라이선스', k: 'scope', l: '허용 범위', t: 'area', d: '사용자 10명, 본사 1개 사업장. 계열사·타 법인 사용은 별도 계약.', w: 2, rows: 2 },
      { g: '라이선스', k: 'fee', l: '연 이용료', t: 'num', d: '3600000', h: '원' },
      { g: '라이선스', k: 'payTerms', l: '지급 조건', d: '매년 1월 31일 선불, 부가세 별도' },
      { g: '라이선스', k: 'period', l: '계약 기간', d: '2027-01-01 ~ 2027-12-31' },
      { g: '라이선스', k: 'support', l: '기술지원', d: '평일 09:00~18:00 이메일·원격 지원, 월 1회 정기 점검' },
      { g: '라이선스', k: 'sla', l: '장애 대응', d: '중대 장애 4시간 내 착수, 일반 문의 1영업일 내 회신' },
      { g: '라이선스', k: 'signDate', l: '체결일', t: 'date', d: today() }
    ],
    blocks: [
      { t: 'parties', cols: [
        { title: '공급자', rows: [['상호', 'vendor'], ['대표자', 'vendorCeo']] },
        { title: '사용자', rows: [['상호', 'client'], ['대표자', 'clientCeo']] }
      ] },
      sec('제1조 (라이선스 부여)', function (d) { return '공급자는 사용자에게 ‘' + d.f.product + '’를 ' + d.f.type + ' 형태로 사용할 수 있는 비독점적 사용권을 부여한다. 사용 범위는 ' + d.f.scope; }),
      sec('제2조 (이용료와 기간)', function (d) { return '연 이용료는 ' + won(d.f.fee) + '이며 ' + d.f.payTerms + '. 계약 기간은 ' + d.f.period + '로 하고, 만료 30일 전까지 해지 의사가 없으면 1년씩 갱신한다.'; }),
      sec('제3조 (사용 제한)', function () {
        return '사용자는 허용 범위를 넘는 복제·배포·재판매·역설계를 하지 않는다. 사용자 수를 초과해 사용하면 초과분에 대한 이용료가 추가로 발생한다.';
      }),
      sec('제4조 (기술지원·유지보수)', function (d) { return '공급자는 ' + d.f.support + '를 제공한다. 장애 대응 기준은 ' + d.f.sla + '. 사용자의 환경 변경·데이터 오류로 인한 문제는 별도 견적으로 처리한다.'; }),
      sec('제5조 (데이터와 보안)', function () {
        return '클라우드 형태의 경우 공급자는 사용자 데이터를 계약 목적 외로 사용하지 않고, 암호화·접근 통제 등 합리적인 보호 조치를 한다. 계약 종료 시 사용자의 요청에 따라 데이터를 반출 가능한 형식으로 제공한 뒤 삭제한다.';
      }),
      sec('제6조 (지식재산권)', function () { return '제품과 관련된 저작권·특허권은 공급자에게 있다. 사용자는 제품을 개작해 파생 제품을 만들거나 상표로 등록할 수 없다.'; }),
      sec('제7조 (책임의 한계)', function (d) { return '공급자의 손해배상 책임은 사용자가 지급한 최근 12개월 이용료를 한도로 한다. 천재지변·사용자 귀책 등 불가항력으로 인한 손해는 책임지지 않는다.'; }),
      body('공급자와 사용자는 위 내용을 확인하고 이 계약을 체결한다.'),
      sign(['A', 'B'], function (d) { return '체결일 ' + dko(d.f.signDate) + ' · 양 당사자가 각각 서명·날인합니다.'; }),
      note('※ 사용자 수·사업장 수는 실제 사용 환경에 맞춰 정확히 적으세요. 클라우드 서비스는 개인정보 처리 위탁에 해당할 수 있어 별도의 위탁 계약과 처리방침 공개가 필요합니다.')
    ]
  });

  /* ---------------------------------------------------------
     12. 위탁판매 계약서
  --------------------------------------------------------- */
  add({
    id: 'consignment', cat: 'contract', sub: 'ct-supply', no: '04',
    name: '위탁판매 계약서', en: 'CONSIGNMENT SALES AGREEMENT',
    keywords: '위탁판매 계약서 위탁 판매 수수료 정산 반품 재고 공급 consignment',
    head: { sub: 'CONSIGNMENT SALES AGREEMENT', meta: [['체결일', 'signDate'], ['수수료율', function (d) { return d.f.rate + '%'; }]] },
    parties: [{ k: 'A', label: '위탁자(갑)', nameKey: 'owner' }, { k: 'B', label: '수탁자(을)', nameKey: 'agent' }],
    fields: [
      { g: '위탁자', k: 'owner', l: '상호', d: '○○상사' },
      { g: '위탁자', k: 'ownerCeo', l: '대표자', d: '홍길동' },
      { g: '수탁자', k: 'agent', l: '상호', d: '△△스토어' },
      { g: '수탁자', k: 'agentCeo', l: '대표자', d: '김철수' },
      { g: '조건', k: 'channel', l: '판매 채널', d: '온라인 쇼핑몰 및 오프라인 매장', w: 2 },
      { g: '조건', k: 'rate', l: '판매 수수료율', t: 'num', d: '25', h: '%' },
      { g: '조건', k: 'settleDay', l: '정산일', d: '매월 15일 (전월 판매분)' },
      { g: '조건', k: 'price', l: '판매가 결정', t: 'sel', opts: ['위탁자가 지정', '수탁자가 결정(사전 협의)', '공동 협의'], d: '위탁자가 지정' },
      { g: '조건', k: 'return', l: '반품 조건', t: 'area', d: '판매되지 않은 재고와 불량품은 정산일 기준 7일 내 위탁자에게 반송하며, 반송 비용은 위탁자가 부담한다.', w: 2, rows: 2 },
      { g: '조건', k: 'risk', l: '위험 부담', t: 'area', d: '판매 전 재고의 소유권과 멸실 위험은 위탁자에게 있고, 수탁자의 관리 부주의로 인한 손실은 수탁자가 부담한다.', w: 2, rows: 2 },
      { g: '조건', k: 'signDate', l: '체결일', t: 'date', d: today() }
    ],
    sets: [{
      k: 'items', label: '위탁 품목·판매가', addLabel: '품목 추가',
      cols: [
        { k: 'item', h: '품목', w: '34%', d: '재생 PC 펠렛 25kg' },
        { k: 'cost', h: '공급가', t: 'num', w: '18%', d: '32000' },
        { k: 'price', h: '판매가', t: 'num', w: '18%', d: '45000' },
        { k: 'qty', h: '위탁 수량', t: 'num', w: '14%', d: '100' },
        { k: 'memo', h: '비고', w: '16%', d: '월 1회 보충' }
      ],
      def: [
        { item: '재생 PC 펠렛 25kg', cost: '32000', price: '45000', qty: '100', memo: '월 1회 보충' },
        { item: '재생 ABS 펠렛 25kg', cost: '36000', price: '52000', qty: '60', memo: '' }
      ]
    }],
    blocks: [
      { t: 'parties', cols: [
        { title: '위탁자 (갑)', rows: [['상호', 'owner'], ['대표자', 'ownerCeo']] },
        { title: '수탁자 (을)', rows: [['상호', 'agent'], ['대표자', 'agentCeo']] }
      ] },
      sec('제1조 (위탁의 목적)', function (d) { return '갑은 을에게 아래 품목의 판매를 위탁하고, 을은 ' + d.f.channel + '에서 판매한다. 재고의 소유권은 갑에게 있다.'; }),
      { t: 'table', set: 'items', head: ['품목', '공급가', '판매가', '위탁 수량', '비고'], cols: [{ k: 'item', h: '품목' }, { k: 'cost', h: '공급가', t: 'num' }, { k: 'price', h: '판매가', t: 'num' }, { k: 'qty', h: '위탁 수량', t: 'num' }, { k: 'memo', h: '비고' }] },
      sec('제2조 (판매가격)', function (d) { return '판매가는 ' + d.f.price + ' 방식으로 정한다. 판매가를 변경하려면 상대방의 사전 동의를 받는다.'; }),
      sec('제3조 (수수료와 정산)', function (d) { return '을은 판매금액의 ' + d.f.rate + '%를 수수료로 받고, 나머지를 ' + d.f.settleDay + '에 갑에게 지급한다. 정산서에는 품목별 판매수량·판매가·수수료·반품 내역을 기재한다.'; }),
      sec('제4조 (반품·재고)', 'return'),
      sec('제5조 (위험 부담·보관)', 'risk'),
      sec('제6조 (표시·홍보)', function () { return '을은 제품 표시·광고가 관계 법령(전자상거래법·표시광고법)을 준수하도록 하고, 갑이 제공한 정보와 다른 내용을 임의로 표시하지 않는다.'; }),
      sec('제7조 (계약 해지)', function () { return '어느 한쪽이 30일 전 서면 통지로 계약을 해지할 수 있다. 해지 시 을은 남은 재고를 갑에게 반환하고, 갑은 정산된 대금을 지급한다.'; }),
      body('갑과 을은 위 내용을 확인하고 이 계약을 체결한다.'),
      sign(['A', 'B'], function (d) { return '체결일 ' + dko(d.f.signDate) + ' · 갑과 을이 각각 서명·날인합니다.'; }),
      note('※ 위탁판매는 판매 전 재고의 위험을 위탁자가 지는 구조입니다. 정산서 형식과 반품 비용 부담을 미리 정해 두면 월 정산 분쟁이 줄어듭니다. 온라인 판매는 통신판매업 신고와 표시광고 기준을 확인하세요.')
    ]
  });

  function body(txt) { return { t: 'body', v: txt }; }
})(typeof window !== 'undefined' ? window : this);
