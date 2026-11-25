/* =========================================================
   INSIGHT BRIEF — 문서서식 추가분 (인사·노무 / 영업·총무)
   사직서·휴직·복직·시말서·경위서·인수인계서·시간외근무·연차계획·
   견적의뢰·납품확인·구매품의·회의록·공지문·교육결과보고
   문구와 조항은 이 사이트에서 직접 작성한 자체 서식입니다.
   ========================================================= */
(function (root) {
  'use strict';
  var H = root.IBF;
  var DOCS = root.IBF_DOCS;
  var esc = H.esc, fmt = H.fmt, fmt1 = H.fmt1, won = H.won, dko = H.dateKo,
    today = H.todayISO, sum = H.setSum, addD = H.addDays, addM = H.addMonths;
  function add(d) { DOCS[d.id] = d; return d; }
  function note(txt) { return { t: 'note', v: function () { return txt; } }; }
  function sign(parties, txt) { return { t: 'sign', parties: parties, note: txt == null ? null : (typeof txt === 'function' ? txt : function () { return txt; }) }; }
  function body(txt) { return { t: 'body', v: txt }; }
  function sec(h, v) { return { t: 'sec', h: h, v: v }; }

  /* ---------------------------------------------------------
     1. 사직서
  --------------------------------------------------------- */
  add({
    id: 'resignation', cat: 'doc', sub: 'hr', no: '10',
    name: '사직서', en: 'LETTER OF RESIGNATION',
    keywords: '사직서 사직원 사직 의원 퇴사 인수인계 퇴직일 사유 제출',
    head: { sub: 'LETTER OF RESIGNATION', meta: [['제출일', 'issueDate'], ['퇴직(예정)일', 'lastDate']] },
    parties: [{ k: 'A', label: '제출자', nameKey: 'name' }, { k: 'B', label: '확인(인사)', nameKey: 'hrName' }],
    fields: [
      { g: '제출자', k: 'name', l: '성명', d: '김철수' },
      { g: '제출자', k: 'empNo', l: '사번', d: '2021-0042' },
      { g: '제출자', k: 'dept', l: '부서', d: '영업팀' },
      { g: '제출자', k: 'position', l: '직위', d: '대리' },
      { g: '제출자', k: 'joinDate', l: '입사일', t: 'date', d: '2021-03-02' },
      { g: '제출자', k: 'phone', l: '연락처', d: '010-0000-0000' },
      { g: '퇴직 정보', k: 'lastDate', l: '퇴직(예정)일', t: 'date', d: addM(today(), 1) },
      { g: '퇴직 정보', k: 'reasonType', l: '사유 구분', t: 'sel', opts: ['개인 사정', '이직', '건강', '가사(육아·간병)', '계약기간 만료', '기타'], d: '이직' },
      { g: '퇴직 정보', k: 'handoverTo', l: '업무 인수자', d: '박영희 대리' },
      { g: '퇴직 정보', k: 'reason', l: '사직 사유', t: 'area', d: '새로운 진로를 준비하기 위해 2026년 12월 31일자로 사직하고자 합니다.', w: 2, rows: 3 },
      { g: '인수인계', k: 'handover', l: '인수인계 계획', t: 'area', d: '1) 담당 거래처 12곳 인수자 동행 방문 (12/15~12/24)\n2) 진행 중 견적·납품 일정 정리표 전달\n3) 서류·계정 권한 이관 확인서 작성', w: 2, rows: 4 },
      { g: '제출', k: 'hrName', l: '인사 담당자', d: '이민수' },
      { g: '제출', k: 'issueDate', l: '제출일', t: 'date', d: today() }
    ],
    blocks: [
      { t: 'kv', rows: [['성명', 'name'], ['사번', 'empNo'], ['부서·직위', function (d) { return d.f.dept + ' / ' + d.f.position; }], ['입사일', function (d) { return dko(d.f.joinDate); }], ['퇴직(예정)일', function (d) { return dko(d.f.lastDate); }], ['업무 인수자', 'handoverTo']] },
      body('위 본인은 위와 같은 사유로 사직하고자 하오니 허락하여 주시기 바랍니다.'),
      sec('사직 사유', 'reason'),
      sec('업무 인수인계 계획', 'handover'),
      sec('퇴직 시 정산 안내', function (d) {
        return '퇴직일까지의 임금과 미사용 연차유급휴가 수당은 근로기준법 제36조에 따라 지급 사유가 발생한 날부터 14일 이내에 지급됩니다. ' +
          '4대보험 상실 신고와 퇴직소득 원천징수 영수증은 회사가 처리하며, 본인은 회사 자산(노트북·출입카드·법인카드 등)을 퇴직일까지 반납합니다.';
      }),
      sign(['A', 'B'], function (d) { return '제출일 ' + dko(d.f.issueDate) + ' · 제출자 서명과 접수 담당자 확인을 남깁니다.'; })
    ]
  });

  /* ---------------------------------------------------------
     2. 휴직신청서
  --------------------------------------------------------- */
  add({
    id: 'leave-absence', cat: 'doc', sub: 'hr', no: '11',
    name: '휴직신청서', en: 'APPLICATION FOR LEAVE OF ABSENCE',
    keywords: '휴직 신청서 육아휴직 병가 개인휴직 복직 예정일 휴직기간 신청',
    head: { sub: 'APPLICATION FOR LEAVE OF ABSENCE', meta: [['신청일', 'issueDate'], ['휴직 기간', function (d) { return dko(d.f.startDate) + ' ~ ' + dko(d.f.endDate); }]] },
    parties: [{ k: 'A', label: '신청자', nameKey: 'name' }, { k: 'B', label: '부서장', nameKey: 'manager' }, { k: 'C', label: '인사', nameKey: 'hrName' }],
    fields: [
      { g: '신청자', k: 'name', l: '성명', d: '박영희' },
      { g: '신청자', k: 'empNo', l: '사번', d: '2019-0011' },
      { g: '신청자', k: 'dept', l: '부서', d: '물류팀' },
      { g: '신청자', k: 'position', l: '직위', d: '과장' },
      { g: '신청자', k: 'contact', l: '연락처', d: '010-0000-0000' },
      { g: '휴직 조건', k: 'type', l: '휴직 종류', t: 'sel', opts: ['육아휴직', '병가·요양', '개인 휴직', '가족 간병', '유학·연수'], d: '육아휴직' },
      { g: '휴직 조건', k: 'startDate', l: '시작일', t: 'date', d: addD(today(), 14) },
      { g: '휴직 조건', k: 'endDate', l: '종료일', t: 'date', d: addM(addD(today(), 14), 6) },
      { g: '휴직 조건', k: 'returnDate', l: '복직 예정일', t: 'date', d: addD(addM(addD(today(), 14), 6), 1) },
      { g: '휴직 조건', k: 'payType', l: '급여 처리', t: 'sel', opts: ['무급', '유급(사규)', '고용보험 급여 신청'], d: '고용보험 급여 신청' },
      { g: '내용', k: 'reason', l: '신청 사유', t: 'area', d: '만 1세 자녀의 양육을 위해 육아휴직을 신청합니다.', w: 2, rows: 3 },
      { g: '내용', k: 'handover', l: '업무 인수인계', t: 'area', d: '일일 발주·입고 업무는 김철수 대리에게, 거래처 연락은 팀장이 대행합니다.', w: 2, rows: 3 },
      { g: '내용', k: 'attach', l: '첨부 서류', d: '가족관계증명서, 주민등록등본', w: 2 },
      { g: '확인', k: 'manager', l: '부서장', d: '홍길동' },
      { g: '확인', k: 'hrName', l: '인사 담당자', d: '이민수' },
      { g: '확인', k: 'issueDate', l: '신청일', t: 'date', d: today() }
    ],
    blocks: [
      { t: 'kv', rows: [['성명', 'name'], ['사번', 'empNo'], ['부서·직위', function (d) { return d.f.dept + ' / ' + d.f.position; }], ['휴직 종류', 'type'], ['휴직 기간', function (d) { return dko(d.f.startDate) + ' ~ ' + dko(d.f.endDate); }], ['복직 예정일', function (d) { return dko(d.f.returnDate); }], ['급여 처리', 'payType']] },
      sec('신청 사유', 'reason'),
      sec('업무 인수인계', 'handover'),
      sec('휴직 중 준수 사항', function () {
        return '1. 휴직 기간 중 회사 자료·거래처 정보는 외부에 제공하지 않습니다.\n2. 복직 예정일 30일 전까지 복직 의사를 회사에 알립니다.\n3. 육아휴직은 「남녀고용평등과 일·가정 양립 지원에 관한 법률」에 따라 신청하며, 고용보험 급여는 별도 요건을 확인합니다.';
      }),
      { t: 'approval', head: '결재', parties: [{ k: 'A', label: '신청', nameKey: 'name' }, { k: 'B', label: '부서장', nameKey: 'manager' }, { k: 'C', label: '인사' }] },
      { t: 'note', v: function () { return '※ 첨부 서류는 휴직 종류에 따라 다릅니다. 육아휴직은 가족관계증명서, 병가는 진단서가 필요하며, 회사 취업규칙이 정한 절차를 함께 따릅니다.'; } }
    ]
  });

  /* ---------------------------------------------------------
     3. 복직신청서
  --------------------------------------------------------- */
  add({
    id: 'reinstatement', cat: 'doc', sub: 'hr', no: '12',
    name: '복직신청서', en: 'APPLICATION FOR REINSTATEMENT',
    keywords: '복직 신청서 복직원 복직예정 휴직 후 복귀 근무 복귀 신청',
    head: { sub: 'APPLICATION FOR REINSTATEMENT', meta: [['신청일', 'issueDate'], ['복직일', 'returnDate']] },
    parties: [{ k: 'A', label: '신청자', nameKey: 'name' }, { k: 'B', label: '인사 확인', nameKey: 'hrName' }, { k: 'C', label: '부서장', nameKey: 'dept' }],
    fields: [
      { g: '신청자', k: 'name', l: '성명', d: '박영희' },
      { g: '신청자', k: 'empNo', l: '사번', d: '2019-0011' },
      { g: '신청자', k: 'dept', l: '복직 부서', d: '물류팀' },
      { g: '신청자', k: 'phone', l: '연락처', d: '010-0000-0000' },
      { g: '휴직 정보', k: 'leaveType', l: '휴직 종류', t: 'sel', opts: ['육아휴직', '병가·요양', '개인 휴직', '가족 간병', '유학·연수'], d: '육아휴직' },
      { g: '휴직 정보', k: 'leaveFrom', l: '휴직 시작일', t: 'date', d: '2026-06-01' },
      { g: '휴직 정보', k: 'leaveTo', l: '휴직 종료일', t: 'date', d: '2026-11-30' },
      { g: '복직 정보', k: 'returnDate', l: '복직(예정)일', t: 'date', d: '2026-12-01' },
      { g: '복직 정보', k: 'job', l: '희망 직무', d: '수입 물류·재고 관리' },
      { g: '복직 정보', k: 'request', l: '근무 조건 요청', t: 'area', d: '육아를 위해 오전 9시~오후 6시 근무와 월 2회 재택근무를 희망합니다.', w: 2, rows: 2 },
      { g: '확인', k: 'hrName', l: '인사 담당자', d: '이민수' },
      { g: '확인', k: 'issueDate', l: '신청일', t: 'date', d: today() }
    ],
    blocks: [
      { t: 'kv', rows: [['성명', 'name'], ['사번', 'empNo'], ['휴직 종류', 'leaveType'], ['휴직 기간', function (d) { return dko(d.f.leaveFrom) + ' ~ ' + dko(d.f.leaveTo); }], ['복직(예정)일', function (d) { return dko(d.f.returnDate); }], ['희망 직무', 'job']] },
      body('본인은 위 기간의 휴직을 마치고 아래와 같이 복직하고자 하오니 허락하여 주시기 바랍니다.'),
      sec('복직 후 근무 계획', function (d) {
        return '복직 후 ' + d.f.dept + '에서 ' + d.f.job + ' 업무를 맡아 휴직 전 담당 업무를 이어서 수행하겠습니다. 변경된 규정·시스템은 복직 첫 주에 교육받겠습니다.';
      }),
      sec('근무 조건 요청', 'request'),
      { t: 'approval', head: '결재', parties: [{ k: 'A', label: '신청', nameKey: 'name' }, { k: 'B', label: '부서장' }, { k: 'C', label: '인사', nameKey: 'hrName' }] },
      { t: 'note', v: function () { return '※ 육아휴직 후 복직은 「남녀고용평등과 일·가정 양립 지원에 관한 법률」 제19조에 따라, 휴직 전과 같은 업무·같은 수준의 임금을 받는 직무로 복귀할 수 있습니다. 복직일과 근무 조건은 회사와 협의해 정합니다.'; } }
    ]
  });

  /* ---------------------------------------------------------
     4. 시말서
  --------------------------------------------------------- */
  add({
    id: 'apology-letter', cat: 'doc', sub: 'hr', no: '13',
    name: '시말서', en: 'WRITTEN EXPLANATION',
    keywords: '시말서 사유서 경위 소명 징계 반성 업무 실수 보고',
    head: { sub: 'WRITTEN EXPLANATION', meta: [['작성일', 'issueDate'], ['사고(발생)일', 'eventDate']] },
    parties: [{ k: 'A', label: '작성자', nameKey: 'name' }, { k: 'B', label: '확인(부서장)', nameKey: 'manager' }],
    fields: [
      { g: '작성자', k: 'name', l: '성명', d: '김철수' },
      { g: '작성자', k: 'dept', l: '부서', d: '영업팀' },
      { g: '작성자', k: 'position', l: '직위', d: '대리' },
      { g: '사건', k: 'eventDate', l: '발생 일시', d: '2026-11-20 14:30' },
      { g: '사건', k: 'place', l: '발생 장소', d: '본사 3층 회의실' },
      { g: '사건', k: 'subject', l: '제목', d: '거래처 견적서 금액 오기 건', w: 2 },
      { g: '내용', k: 'fact', l: '경위(사실관계)', t: 'area', d: '11월 20일 A사에 보낸 견적서의 단가를 톤당 8,000원이 아닌 800원으로 잘못 입력해 발송했습니다. 14시 30분 발송 후 15시 10분 A사 담당자 연락으로 확인했습니다.', w: 2, rows: 4 },
      { g: '내용', k: 'cause', l: '원인', t: 'area', d: '단가표를 복사한 뒤 자릿수를 확인하지 않고 전송했으며, 발송 전 검토 절차를 거치지 않았습니다.', w: 2, rows: 3 },
      { g: '내용', k: 'measure', l: '조치 및 대응', t: 'area', d: '1) 15시 30분 정정 견적서를 재발송하고 구두 사과\n2) 견적서 발송 전 2인 검토 규칙 적용\n3) 단가표에 자릿수 확인란 추가', w: 2, rows: 3 },
      { g: '내용', k: 'reflect', l: '반성 및 다짐', t: 'area', d: '확인 절차를 소홀히 한 점을 깊이 반성합니다. 앞으로 금액이 들어가는 문서는 발송 전 반드시 두 사람이 확인하겠습니다.', w: 2, rows: 3 },
      { g: '확인', k: 'manager', l: '부서장', d: '홍길동' },
      { g: '확인', k: 'issueDate', l: '작성일', t: 'date', d: today() }
    ],
    blocks: [
      { t: 'kv', rows: [['성명', 'name'], ['부서·직위', function (d) { return d.f.dept + ' / ' + d.f.position; }], ['발생 일시', 'eventDate'], ['발생 장소', 'place'], ['건명', 'subject']] },
      body('아래와 같이 업무상 발생한 사안의 경위와 조치 사항을 사실대로 보고드립니다.'),
      sec('1. 경위', 'fact'),
      sec('2. 원인', 'cause'),
      sec('3. 조치 및 재발 방지', 'measure'),
      sec('4. 반성 및 다짐', 'reflect'),
      body('위 내용이 사실과 다름이 없음을 확인합니다.'),
      sign(['A', 'B'], function (d) { return dko(d.f.issueDate) + ' · 작성자 서명 후 부서장이 확인합니다.'; }),
      note('※ 시말서는 사실관계를 기록하는 문서입니다. 감정적인 표현보다 시간·장소·행위·결과를 순서대로 적고, 재발 방지 대책을 구체적으로 쓰는 것이 좋습니다. 징계 절차가 예정되어 있다면 회사 취업규칙과 근로기준법상 절차를 함께 확인하세요.')
    ]
  });

  /* ---------------------------------------------------------
     5. 경위서
  --------------------------------------------------------- */
  add({
    id: 'incident-report', cat: 'doc', sub: 'hr', no: '14',
    name: '경위서', en: 'STATEMENT OF FACTS',
    keywords: '경위서 사실확인서 사고 경위 보고 산재 안전사고 상황 보고',
    head: { sub: 'STATEMENT OF FACTS', meta: [['작성일', 'issueDate'], ['사고 일시', 'eventDate']] },
    parties: [{ k: 'A', label: '작성자', nameKey: 'name' }, { k: 'B', label: '확인자', nameKey: 'witness' }],
    fields: [
      { g: '작성자', k: 'name', l: '성명', d: '이민수' },
      { g: '작성자', k: 'dept', l: '소속', d: '생산팀' },
      { g: '작성자', k: 'phone', l: '연락처', d: '010-0000-0000' },
      { g: '사고', k: 'eventDate', l: '발생 일시', d: '2026-11-18 09:40' },
      { g: '사고', k: 'place', l: '발생 장소', d: '2공장 원료 창고' },
      { g: '사고', k: 'kind', l: '사고 유형', t: 'sel', opts: ['안전사고', '시설·설비', '차량·운송', '화재·누출', '기타'], d: '안전사고' },
      { g: '내용', k: 'situation', l: '발생 상황', t: 'area', d: '지게차로 원료 파렛트를 이동하던 중 적재물이 기울어 1개 파렛트가 바닥에 떨어졌습니다. 파손된 포대는 3개이며 인명 피해는 없습니다.', w: 2, rows: 4 },
      { g: '내용', k: 'order', l: '진행 순서', t: 'area', d: '09:40 적재물 낙하 → 09:42 작업 중지 및 통제선 설치 → 09:50 안전관리자 보고 → 10:10 파손 포대 회수·폐기', w: 2, rows: 3 },
      { g: '내용', k: 'damage', l: '피해 내용', t: 'area', d: '원료 3포대(약 75kg) 파손, 파렛트 1개 파손. 인명 피해 없음.', w: 2, rows: 2 },
      { g: '내용', k: 'action', l: '조치 사항', t: 'area', d: '적재 높이 기준(3단→2단) 하향, 지게차 작업 전 결속 확인 체크리스트 도입, 작업자 안전 교육 실시', w: 2, rows: 3 },
      { g: '확인', k: 'witness', l: '확인자', d: '홍길동' },
      { g: '확인', k: 'issueDate', l: '작성일', t: 'date', d: today() }
    ],
    blocks: [
      { t: 'kv', rows: [['성명', 'name'], ['소속', 'dept'], ['발생 일시', 'eventDate'], ['발생 장소', 'place'], ['사고 유형', 'kind']] },
      sec('1. 발생 상황', 'situation'),
      sec('2. 진행 순서', 'order'),
      sec('3. 피해 내용', 'damage'),
      sec('4. 조치 사항', 'action'),
      body('위 내용은 본인이 직접 목격·확인한 사실을 시간 순서대로 정리한 것입니다.'),
      sign(['A', 'B'], function (d) { return dko(d.f.issueDate) + ' · 작성자와 확인자가 각각 서명합니다.'; }),
      note('※ 산업재해로 이어질 수 있는 사고는 사업주가 산업안전보건법에 따라 지체 없이 보고·기록해야 합니다. 이 서식은 사내 기록용이며, 근로복지공단 신청 서류와는 별개입니다.')
    ]
  });

  /* ---------------------------------------------------------
     6. 업무 인수인계서
  --------------------------------------------------------- */
  add({
    id: 'handover', cat: 'doc', sub: 'hr', no: '15',
    name: '업무 인수인계서', en: 'WORK HANDOVER SHEET',
    keywords: '인수인계서 업무 인수인계 퇴사 이직 담당 업무 이관 확인서',
    head: { sub: 'WORK HANDOVER SHEET', meta: [['작성일', 'issueDate'], ['인수인계 기간', function (d) { return dko(d.f.fromDate) + ' ~ ' + dko(d.f.toDate); }]] },
    parties: [{ k: 'A', label: '인계자', nameKey: 'fromName' }, { k: 'B', label: '인수자', nameKey: 'toName' }],
    fields: [
      { g: '인계자', k: 'fromName', l: '인계자', d: '김철수' },
      { g: '인계자', k: 'fromDept', l: '부서', d: '영업팀' },
      { g: '인계자', k: 'fromPhone', l: '연락처', d: '010-0000-0000' },
      { g: '인수자', k: 'toName', l: '인수자', d: '박영희' },
      { g: '인수자', k: 'toDept', l: '부서', d: '영업팀' },
      { g: '인수자', k: 'toPhone', l: '연락처', d: '010-0000-0000' },
      { g: '기간', k: 'fromDate', l: '시작일', t: 'date', d: addD(today(), -5) },
      { g: '기간', k: 'toDate', l: '종료일', t: 'date', d: today() },
      { g: '기간', k: 'issueDate', l: '작성일', t: 'date', d: today() },
      { g: '메모', k: 'memo', l: '특이 사항', t: 'area', d: 'A사 연말 단가 협상이 12월 5일 예정되어 있어 인수자가 직접 진행합니다.', w: 2, rows: 3 }
    ],
    sets: [
      {
        k: 'tasks', label: '인계 업무 목록', addLabel: '업무 추가',
        cols: [
          { k: 'task', h: '업무', w: '34%', d: '거래처 주문·납기 관리' },
          { k: 'status', h: '진행 상태', w: '16%', d: '진행 중' },
          { k: 'place', h: '자료 위치', w: '26%', d: '공유드라이브 / 영업/주문' },
          { k: 'memo', h: '인계 내용', w: '24%', d: '12월 납기표 갱신 및 인수자 직접 응대' }
        ],
        def: [
          { task: '거래처 주문·납기 관리', status: '진행 중', place: '공유드라이브 / 영업/주문', memo: '12월 납기표 갱신, 인수자 직접 응대' },
          { task: '월 마감 매출 정리', status: '완료', place: 'ERP > 매출 > 월마감', memo: '11월분 마감 완료, 결산 자료 전달' },
          { task: 'A사 단가 협상', status: '예정', place: '계약서철 / 2026-A사', memo: '12월 5일 협상, 목표 단가 톤당 8.2만원' },
          { task: '미수금 3건 회수', status: '진행 중', place: 'ERP > 채권 > 미수', memo: 'B사 12/10, C사 12/15 약속' }
        ]
      },
      {
        k: 'docs', label: '인계 자료·권한', addLabel: '항목 추가',
        cols: [
          { k: 'item', h: '자료·권한', w: '44%', d: '공유드라이브 영업 폴더' },
          { k: 'type', h: '구분', w: '18%', d: '파일' },
          { k: 'done', h: '이관', w: '14%', d: '완료' },
          { k: 'memo', h: '비고', w: '24%', d: '인수자 편집 권한 부여' }
        ],
        def: [
          { item: '공유드라이브 영업 폴더', type: '파일', done: '완료', memo: '인수자 편집 권한 부여' },
          { item: 'ERP 주문·매출 조회 계정', type: '계정', done: '완료', memo: '권한 이관 후 기존 계정 회수' },
          { item: '법인카드·영업 비품', type: '자산', done: '진행', memo: '카드 1매, 노트북 반납 예정' }
        ]
      }
    ],
    blocks: [
      {
        t: 'parties', cols: [
          { title: '인계자', rows: [['성명', 'fromName'], ['부서', 'fromDept'], ['연락처', 'fromPhone']] },
          { title: '인수자', rows: [['성명', 'toName'], ['부서', 'toDept'], ['연락처', 'toPhone']] }
        ]
      },
      { t: 'table', set: 'tasks', head: ['업무', '진행 상태', '자료 위치', '인계 내용'], cols: [{ k: 'task', h: '업무' }, { k: 'status', h: '진행 상태', t: 'center' }, { k: 'place', h: '자료 위치' }, { k: 'memo', h: '인계 내용' }] },
      { t: 'table', set: 'docs', head: ['자료·권한', '구분', '이관', '비고'], cols: [{ k: 'item', h: '자료·권한' }, { k: 'type', h: '구분', t: 'center' }, { k: 'done', h: '이관', t: 'center' }, { k: 'memo', h: '비고' }] },
      sec('특이 사항', 'memo'),
      body('위와 같이 담당 업무와 자료를 인계·인수하였으며, 인계 이후 발견된 누락 사항은 상호 협의하여 보완합니다.'),
      sign(['A', 'B'], function (d) { return dko(d.f.issueDate) + ' · 인계자와 인수자가 각각 서명합니다.'; })
    ]
  });

  /* ---------------------------------------------------------
     7. 시간외·휴일근무 신청서
  --------------------------------------------------------- */
  add({
    id: 'overtime-req', cat: 'doc', sub: 'hr', no: '16',
    name: '시간외·휴일근무 신청서', en: 'OVERTIME WORK REQUEST',
    keywords: '시간외근무 연장근무 휴일근무 신청서 야근 수당 신청 승인',
    head: { sub: 'OVERTIME WORK REQUEST', meta: [['신청일', 'issueDate'], ['총 시간외 근무', function (d) { return fmt1(sum(d, 'rows', 'hours')) + '시간'; }]] },
    parties: [{ k: 'A', label: '신청자', nameKey: 'name' }, { k: 'B', label: '승인자', nameKey: 'manager' }, { k: 'C', label: '인사', nameKey: 'hrName' }],
    fields: [
      { g: '신청자', k: 'name', l: '성명', d: '김철수' },
      { g: '신청자', k: 'dept', l: '부서', d: '영업팀' },
      { g: '신청자', k: 'position', l: '직위', d: '대리' },
      { g: '신청자', k: 'manager', l: '승인자', d: '홍길동 팀장' },
      { g: '신청 정보', k: 'reason', l: '사유', t: 'area', d: 'A사 연말 납기 대응과 재고 실사 준비를 위해 아래 일정에 시간외·휴일근무를 신청합니다.', w: 2, rows: 2 },
      { g: '신청 정보', k: 'payType', l: '보상 방식', t: 'sel', opts: ['수당 지급', '대체휴가'], d: '수당 지급' },
      { g: '신청 정보', k: 'hrName', l: '인사 담당자', d: '이민수' },
      { g: '신청 정보', k: 'issueDate', l: '신청일', t: 'date', d: today() }
    ],
    sets: [
      {
        k: 'rows', label: '시간외 근무 일정', addLabel: '일정 추가',
        cols: [
          { k: 'date', h: '일자', t: 'date', w: '18%', d: today() },
          { k: 'kind', h: '구분', w: '16%', d: '연장' },
          { k: 'start', h: '시작', w: '12%', d: '18:00' },
          { k: 'end', h: '종료', w: '12%', d: '21:00' },
          { k: 'hours', h: '시간', t: 'num', w: '10%', d: '3' },
          { k: 'work', h: '업무 내용', w: '32%', d: 'A사 12월 납기표 작성' }
        ],
        def: [
          { date: today(), kind: '연장', start: '18:00', end: '21:00', hours: '3', work: 'A사 12월 납기표 작성' },
          { date: addD(today(), 1), kind: '연장', start: '18:00', end: '20:30', hours: '2.5', work: '재고 실사 준비·라벨 출력' },
          { date: addD(today(), 3), kind: '휴일', start: '09:00', end: '15:00', hours: '6', work: '연말 재고 실사' }
        ]
      }
    ],
    blocks: [
      { t: 'kv', rows: [['성명', 'name'], ['부서·직위', function (d) { return d.f.dept + ' / ' + d.f.position; }], ['승인자', 'manager'], ['보상 방식', 'payType']] },
      sec('신청 사유', 'reason'),
      { t: 'table', set: 'rows', head: ['일자', '구분', '시작', '종료', '시간', '업무 내용'], cols: [{ k: 'date', h: '일자', t: 'center' }, { k: 'kind', h: '구분', t: 'center' }, { k: 'start', h: '시작', t: 'center' }, { k: 'end', h: '종료', t: 'center' }, { k: 'hours', h: '시간', t: 'num' }, { k: 'work', h: '업무 내용' }] },
      { t: 'sums', rows: [{ l: '총 시간외 근무시간', v: function (d) { return sum(d, 'rows', 'hours'); }, unit: '시간', grand: true }, { l: '예상 수당(시급 × 1.5, 참고)', v: function (d) { return sum(d, 'rows', 'hours') * Math.round(12000 * 1.5); }, unit: '원', text: false }] },
      sec('근무 기준 안내', function () {
        return '연장근로는 1일 8시간·1주 40시간을 초과한 근로에 대해 통상시급의 50%를 가산합니다. 휴일근로는 8시간 이내 50%, 8시간 초과분은 100%를 가산합니다. 5인 미만 사업장은 가산 규정이 적용되지 않을 수 있습니다.';
      }),
      { t: 'approval', head: '결재', parties: [{ k: 'A', label: '신청', nameKey: 'name' }, { k: 'B', label: '팀장', nameKey: 'manager' }, { k: 'C', label: '인사' }] },
      note('※ 사전 승인 없는 시간외 근무는 수당 지급이 어려울 수 있습니다. 실제 근무 기록(출퇴근 기록·업무 로그)과 이 신청서를 함께 보관하세요. 예상 수당은 통상시급 12,000원을 가정한 참고값입니다.')
    ]
  });

  /* ---------------------------------------------------------
     8. 연차 사용 계획서
  --------------------------------------------------------- */
  add({
    id: 'leave-plan-doc', cat: 'doc', sub: 'hr', no: '17',
    name: '연차 사용 계획서', en: 'ANNUAL LEAVE PLAN',
    keywords: '연차 사용 계획서 휴가 계획 연차 신청 잔여 연차 소진 계획',
    head: { sub: 'ANNUAL LEAVE PLAN', meta: [['작성일', 'issueDate'], ['사용 예정일수', function (d) { return fmt1(sum(d, 'rows', 'days')) + '일'; }]] },
    parties: [{ k: 'A', label: '작성자', nameKey: 'name' }, { k: 'B', label: '승인자', nameKey: 'manager' }],
    fields: [
      { g: '작성자', k: 'name', l: '성명', d: '김철수' },
      { g: '작성자', k: 'dept', l: '부서', d: '영업팀' },
      { g: '작성자', k: 'manager', l: '승인자', d: '홍길동 팀장' },
      { g: '연차 현황', k: 'total', l: '총 발생 연차', t: 'num', d: '16', h: '일' },
      { g: '연차 현황', k: 'used', l: '사용한 연차', t: 'num', d: '9', h: '일' },
      { g: '연차 현황', k: 'carry', l: '이월·소멸 예정', d: '2026-12-31 소멸 2일' },
      { g: '연차 현황', k: 'issueDate', l: '작성일', t: 'date', d: today() }
    ],
    sets: [{
      k: 'rows', label: '사용 계획', addLabel: '계획 추가',
      cols: [
        { k: 'from', h: '시작일', t: 'date', w: '20%', d: addD(today(), 10) },
        { k: 'to', h: '종료일', t: 'date', w: '20%', d: addD(today(), 10) },
        { k: 'days', h: '일수', t: 'num', w: '12%', d: '1' },
        { k: 'kind', h: '구분', w: '16%', d: '연차' },
        { k: 'memo', h: '사유·비고', w: '32%', d: '개인 사정' }
      ],
      def: [
        { from: addD(today(), 10), to: addD(today(), 10), days: '1', kind: '연차', memo: '개인 사정' },
        { from: addD(today(), 24), to: addD(today(), 26), days: '3', kind: '연차', memo: '가족 여행' },
        { from: addD(today(), 45), to: addD(today(), 45), days: '1', kind: '반차', memo: '병원 진료(오후)' }
      ]
    }],
    blocks: [
      { t: 'kv', rows: [['성명', 'name'], ['부서', 'dept'], ['승인자', 'manager'], ['총 발생', function (d) { return d.f.total + '일'; }], ['사용', function (d) { return d.f.used + '일'; }], ['잔여', function (d) { return fmt1(parseFloat(d.f.total || 0) - parseFloat(d.f.used || 0)) + '일'; }], ['소멸 예정', 'carry']] },
      { t: 'table', set: 'rows', head: ['시작일', '종료일', '일수', '구분', '사유·비고'], cols: [{ k: 'from', h: '시작일', t: 'center' }, { k: 'to', h: '종료일', t: 'center' }, { k: 'days', h: '일수', t: 'num' }, { k: 'kind', h: '구분', t: 'center' }, { k: 'memo', h: '사유·비고' }] },
      { t: 'sums', rows: [{ l: '사용 예정일수 합계', v: function (d) { return sum(d, 'rows', 'days'); }, unit: '일', grand: true }, { l: '사용 후 잔여', v: function (d) { return Math.max(0, parseFloat(d.f.total || 0) - parseFloat(d.f.used || 0) - sum(d, 'rows', 'days')); }, unit: '일' }] },
      sec('계획 사유', function (d) {
        return '연말 업무 집중을 피하고 잔여 연차를 소진하기 위해 위 일정으로 연차를 사용하고자 합니다. 사용 기간 중 담당 업무는 ' + (d.f.manager || '팀장') + '과 동료가 대행하며, 긴급 연락은 휴대전화로 받습니다.';
      }),
      { t: 'approval', head: '결재', parties: [{ k: 'A', label: '작성', nameKey: 'name' }, { k: 'B', label: '팀장', nameKey: 'manager' }] },
      note('※ 연차휴가는 근로자가 시기를 지정해 신청할 수 있고, 사업주는 업무에 지장이 있는 경우 시기를 변경할 수 있습니다. 회계연도 기준으로 부여한 경우 1월 1일에 발생하며, 미사용 연차는 취업규칙·근로기준법에 따라 보상 또는 소멸됩니다.')
    ]
  });

  /* ---------------------------------------------------------
     9. 견적 의뢰서 (RFQ)
  --------------------------------------------------------- */
  add({
    id: 'rfq', cat: 'doc', sub: 'sales', no: '10',
    name: '견적 의뢰서 (RFQ)', en: 'REQUEST FOR QUOTATION',
    keywords: '견적의뢰서 견적 요청 RFQ 단가 요청 구매 견적 비교 납기 조건',
    head: { sub: 'REQUEST FOR QUOTATION', meta: [['의뢰일', 'issueDate'], ['회신 기한', 'dueDate']] },
    parties: [{ k: 'A', label: '의뢰처(갑)', nameKey: 'buyerName' }, { k: 'B', label: '수신(을)', nameKey: 'vendorName' }],
    fields: [
      { g: '의뢰처', k: 'buyerName', l: '회사명', d: '○○상사' },
      { g: '의뢰처', k: 'buyerDept', l: '담당 부서', d: '구매팀' },
      { g: '의뢰처', k: 'buyerPerson', l: '담당자', d: '김철수' },
      { g: '의뢰처', k: 'buyerContact', l: '연락처', d: '02-0000-0000 / buying@example.com' },
      { g: '수신', k: 'vendorName', l: '공급사명', d: '△△머티리얼' },
      { g: '수신', k: 'vendorPerson', l: '담당자', d: '이대표' },
      { g: '조건', k: 'rfqNo', l: '의뢰 번호', d: 'RFQ-2026-1124-01' },
      { g: '조건', k: 'issueDate', l: '의뢰일', t: 'date', d: today() },
      { g: '조건', k: 'dueDate', l: '회신 기한', t: 'date', d: addD(today(), 5) },
      { g: '조건', k: 'deliverTo', l: '납품 장소', d: '경기 화성시 ○○로 00, ○○창고', w: 2 },
      { g: '조건', k: 'deliverDate', l: '희망 납기', t: 'date', d: addD(today(), 20) },
      { g: '조건', k: 'payTerms', l: '대금 조건', d: '납품 후 30일 현금', w: 2 },
      { g: '조건', k: 'vatIncluded', l: '부가세', t: 'sel', opts: ['별도', '포함'], d: '별도' },
      { g: '요청', k: 'request', l: '요청 사항', t: 'area', d: '1) 단가·납기·최소주문수량을 기재해 주세요.\n2) 재생원료는 최근 3개월 물성 시험 성적서를 함께 보내 주세요.\n3) 운송비 포함 여부를 명시해 주세요.', w: 2, rows: 4 },
      { g: '요청', k: 'issuePerson', l: '작성자', d: '김철수' }
    ],
    sets: [{
      k: 'items', label: '견적 요청 품목', addLabel: '품목 추가',
      cols: [
        { k: 'item', h: '품목명', w: '32%', d: '재생 PC 펠렛 (검정)' },
        { k: 'spec', h: '규격·등급', w: '26%', d: 'MFI 8~12, 25kg 포대' },
        { k: 'qty', h: '수량', t: 'num', w: '12%', d: '20000' },
        { k: 'unit', h: '단위', w: '10%', d: 'kg' },
        { k: 'memo', h: '비고', w: '20%', d: '월 2회 분할 납품' }
      ],
      def: [
        { item: '재생 PC 펠렛 (검정)', spec: 'MFI 8~12, 25kg 포대', qty: '20000', unit: 'kg', memo: '월 2회 분할 납품' },
        { item: '재생 ABS 펠렛 (회색)', spec: 'MFI 10~15, 25kg 포대', qty: '5000', unit: 'kg', memo: '샘플 1kg 동봉' }
      ]
    }],
    blocks: [
      { t: 'parties', cols: [
        { title: '의뢰처 (갑)', rows: [['회사명', 'buyerName'], ['담당', 'buyerPerson'], ['연락처', 'buyerContact']] },
        { title: '수신 (을)', rows: [['회사명', 'vendorName'], ['담당', 'vendorPerson'], ['회신 기한', function (d) { return dko(d.f.dueDate); }]] }
      ] },
      sec('의뢰 개요', function (d) {
        return '아래 품목의 견적을 ' + dko(d.f.dueDate) + '까지 회신해 주시기 바랍니다. 납품 희망일은 ' + dko(d.f.deliverDate) + '이며, 납품 장소는 ' + d.f.deliverTo + '입니다.';
      }),
      { t: 'table', set: 'items', head: ['품목명', '규격·등급', '수량', '단위', '비고'], cols: [{ k: 'item', h: '품목명' }, { k: 'spec', h: '규격·등급' }, { k: 'qty', h: '수량', t: 'num' }, { k: 'unit', h: '단위', t: 'center' }, { k: 'memo', h: '비고' }] },
      sec('거래 조건', function (d) { return '· 대금 조건: ' + d.f.payTerms + '\n· 부가세: ' + d.f.vatIncluded + '\n· 견적 유효기간: 회신일로부터 30일'; }),
      sec('요청 사항', 'request'),
      body('위 견적 내용은 내부 검토 후 별도로 발주서를 송부합니다. 이 의뢰서는 계약을 체결하는 효력이 없습니다.'),
      sign(['A'], function (d) { return '의뢰일 ' + dko(d.f.issueDate) + ' · 담당자 서명 또는 직인'; })
    ]
  });

  /* ---------------------------------------------------------
     10. 납품확인서
  --------------------------------------------------------- */
  add({
    id: 'delivery-confirm', cat: 'doc', sub: 'sales', no: '11',
    name: '납품확인서', en: 'DELIVERY CONFIRMATION',
    keywords: '납품확인서 납품 완료 확인 물품 인수 검수 확인서 거래처 제출',
    head: { sub: 'DELIVERY CONFIRMATION', meta: [['확인일', 'issueDate'], ['납품일', 'deliverDate']] },
    parties: [{ k: 'A', label: '공급자', nameKey: 'vendorName' }, { k: 'B', label: '수령자', nameKey: 'buyerName' }],
    fields: [
      { g: '공급자', k: 'vendorName', l: '공급자 상호', d: '○○상사' },
      { g: '공급자', k: 'vendorCeo', l: '대표자', d: '홍길동' },
      { g: '공급자', k: 'vendorTel', l: '연락처', d: '02-0000-0000' },
      { g: '수령자', k: 'buyerName', l: '수령자 상호', d: '△△물산' },
      { g: '수령자', k: 'buyerPerson', l: '담당자', d: '김철수' },
      { g: '수령자', k: 'buyerAddr', l: '납품지 주소', d: '경기 화성시 ○○로 00', w: 2 },
      { g: '납품 정보', k: 'poNo', l: '발주번호', d: 'PO-2026-1105' },
      { g: '납품 정보', k: 'deliverDate', l: '납품일', t: 'date', d: addD(today(), -2) },
      { g: '납품 정보', k: 'vehicle', l: '운송 수단·차량', d: '5톤 탑차 (○○물류)' },
      { g: '납품 정보', k: 'result', l: '검수 결과', t: 'sel', opts: ['전량 합격', '일부 합격', '반품'], d: '전량 합격' },
      { g: '납품 정보', k: 'memo', l: '특이 사항', t: 'area', d: '포장 상태 양호, 수량 이상 없음.', w: 2, rows: 2 },
      { g: '납품 정보', k: 'issueDate', l: '확인일', t: 'date', d: today() }
    ],
    sets: [{
      k: 'items', label: '납품 품목', addLabel: '품목 추가',
      cols: [
        { k: 'item', h: '품목', w: '34%', d: '재생 PC 펠렛' },
        { k: 'spec', h: '규격', w: '24%', d: '25kg/포대' },
        { k: 'qty', h: '납품 수량', t: 'num', w: '14%', d: '800' },
        { k: 'unit', h: '단위', w: '10%', d: '포대' },
        { k: 'ok', h: '검수', w: '18%', d: '합격' }
      ],
      def: [
        { item: '재생 PC 펠렛', spec: '25kg/포대', qty: '800', unit: '포대', ok: '합격' },
        { item: '재생 ABS 펠렛', spec: '25kg/포대', qty: '200', unit: '포대', ok: '합격' }
      ]
    }],
    blocks: [
      { t: 'parties', cols: [
        { title: '공급자', rows: [['상호', 'vendorName'], ['대표자', 'vendorCeo'], ['연락처', 'vendorTel']] },
        { title: '수령자', rows: [['상호', 'buyerName'], ['담당자', 'buyerPerson'], ['납품지', 'buyerAddr']] }
      ] },
      sec('납품 내용', function (d) {
        return '발주번호 ' + d.f.poNo + '에 따라 ' + dko(d.f.deliverDate) + ' 위 품목을 납품하였으며, 수령자는 수량과 외관을 확인한 뒤 아래와 같이 검수 결과를 확인합니다.';
      }),
      { t: 'table', set: 'items', head: ['품목', '규격', '납품 수량', '단위', '검수'], cols: [{ k: 'item', h: '품목' }, { k: 'spec', h: '규격' }, { k: 'qty', h: '납품 수량', t: 'num' }, { k: 'unit', h: '단위', t: 'center' }, { k: 'ok', h: '검수', t: 'center' }] },
      { t: 'sums', rows: [{ l: '총 납품 수량', v: function (d) { return sum(d, 'items', 'qty'); }, unit: '포대' }, { l: '검수 결과', v: function (d) { return d.f.result; }, text: true, grand: true }] },
      sec('특이 사항', 'memo'),
      body('위 물품을 정상적으로 인수하였음을 확인합니다.'),
      sign(['A', 'B'], function (d) { return dko(d.f.issueDate) + ' · 공급자와 수령자가 각각 서명·날인합니다.'; }),
      note('※ 검수 결과를 ‘일부 합격’ 또는 ‘반품’으로 표시한 경우, 사진과 수량을 함께 남겨 두면 이후 정산 분쟁을 줄일 수 있습니다. 세금계산서 발행 시 이 확인서의 납품일을 기준으로 거래일자를 맞추세요.')
    ]
  });

  /* ---------------------------------------------------------
     11. 구매 품의서
  --------------------------------------------------------- */
  add({
    id: 'purchase-approval', cat: 'doc', sub: 'sales', no: '12',
    name: '구매 품의서', en: 'PURCHASE REQUISITION',
    keywords: '구매품의서 품의서 구매 요청 지출 결재 예산 집행 물품 구입',
    head: { sub: 'PURCHASE REQUISITION', meta: [['품의일', 'issueDate'], ['요청 금액', function (d) { return won(sum(d, 'items', 'amount') * 1.1); }]] },
    parties: [{ k: 'A', label: '요청자', nameKey: 'name' }, { k: 'B', label: '검토(팀장)', nameKey: 'manager' }, { k: 'C', label: '승인(대표)', nameKey: 'ceo' }],
    fields: [
      { g: '요청자', k: 'name', l: '성명', d: '김철수' },
      { g: '요청자', k: 'dept', l: '부서', d: '영업팀' },
      { g: '요청자', k: 'manager', l: '팀장', d: '홍길동' },
      { g: '요청자', k: 'ceo', l: '승인권자', d: '이대표' },
      { g: '구매 정보', k: 'title', l: '품의 건명', d: '영업팀 노트북 2대 교체 구입', w: 2 },
      { g: '구매 정보', k: 'vendor', l: '구매처', d: '○○전자' },
      { g: '구매 정보', k: 'dueDate', l: '필요일', t: 'date', d: addD(today(), 10) },
      { g: '구매 정보', k: 'budget', l: '예산 과목', d: '판관비 · 소모품비' },
      { g: '구매 정보', k: 'payMethod', l: '결제 방법', t: 'sel', opts: ['법인카드', '계좌이체', '현금'], d: '법인카드' },
      { g: '구매 정보', k: 'reason', l: '구매 사유', t: 'area', d: '2019년 도입 노트북 2대의 배터리·성능 저하로 현장 업무(견적·납품 확인) 처리가 지연되어 교체가 필요합니다.', w: 2, rows: 3 },
      { g: '구매 정보', k: 'compare', l: '비교·검토 내용', t: 'area', d: 'A사 1,254,000원 / B사 1,189,000원 / C사 1,320,000원 → A사 견적 채택(3년 방문 보증 포함)', w: 2, rows: 3 },
      { g: '구매 정보', k: 'issueDate', l: '품의일', t: 'date', d: today() }
    ],
    sets: [{
      k: 'items', label: '구매 품목', addLabel: '품목 추가',
      cols: [
        { k: 'item', h: '품명', w: '30%', d: '노트북 15인치' },
        { k: 'spec', h: '규격', w: '30%', d: 'i5 / 16GB / 512GB' },
        { k: 'qty', h: '수량', t: 'num', w: '10%', d: '2' },
        { k: 'price', h: '단가', t: 'num', w: '14%', d: '1140000' },
        { k: 'amount', h: '금액', t: 'num', calc: function (r) { return H.num(r.qty) * H.num(r.price); } }
      ],
      def: [
        { item: '노트북 15인치', spec: 'i5 / 16GB / 512GB', qty: '2', price: '1140000' },
        { item: '도킹스테이션', spec: 'USB-C 12in1', qty: '2', price: '89000' }
      ]
    }],
    blocks: [
      { t: 'kv', rows: [['건명', 'title'], ['요청 부서', function (d) { return d.f.dept + ' / ' + d.f.name; }], ['구매처', 'vendor'], ['필요일', function (d) { return dko(d.f.dueDate); }], ['예산 과목', 'budget'], ['결제 방법', 'payMethod']] },
      { t: 'table', set: 'items', head: ['품명', '규격', '수량', '단가', '금액'], cols: [{ k: 'item', h: '품명' }, { k: 'spec', h: '규격' }, { k: 'qty', h: '수량', t: 'num' }, { k: 'price', h: '단가', t: 'num' }, { k: 'amount', h: '금액', t: 'num', calc: function (r) { return H.num(r.qty) * H.num(r.price); } }] },
      { t: 'sums', rows: [
        { l: '공급가액', v: function (d) { return sum(d, 'items', 'amount'); }, unit: '원' },
        { l: '부가세(10%)', v: function (d) { return Math.round(sum(d, 'items', 'amount') * 0.1); }, unit: '원' },
        { l: '합계 금액', v: function (d) { return Math.round(sum(d, 'items', 'amount') * 1.1); }, unit: '원', grand: true }
      ] },
      sec('구매 사유', 'reason'),
      sec('비교·검토', 'compare'),
      { t: 'approval', head: '결재', parties: [{ k: 'A', label: '요청', nameKey: 'name' }, { k: 'B', label: '팀장', nameKey: 'manager' }, { k: 'C', label: '승인', nameKey: 'ceo' }] },
      note('※ 금액은 공급가액에 부가세 10%를 더해 계산한 참고값입니다. 회사 품의 규정(일정 금액 이상 견적 2곳 이상 비교 등)을 함께 확인하세요.')
    ]
  });

  /* ---------------------------------------------------------
     12. 회의록
  --------------------------------------------------------- */
  add({
    id: 'minutes', cat: 'doc', sub: 'legal', no: '10',
    name: '회의록', en: 'MEETING MINUTES',
    keywords: '회의록 회의 내용 정리 안건 결정 사항 조치 항목 참석자 보고',
    head: { sub: 'MEETING MINUTES', meta: [['회의일', 'meetDate'], ['작성자', 'writer']] },
    parties: [{ k: 'A', label: '작성자', nameKey: 'writer' }, { k: 'B', label: '확인(주관)', nameKey: 'chair' }],
    fields: [
      { g: '회의 정보', k: 'title', l: '회의명', d: '2026년 12월 영업·물류 협의회', w: 2 },
      { g: '회의 정보', k: 'meetDate', l: '일시', d: '2026-11-24 10:00 ~ 11:20' },
      { g: '회의 정보', k: 'place', l: '장소', d: '본사 3층 대회의실' },
      { g: '회의 정보', k: 'chair', l: '주관', d: '홍길동 팀장' },
      { g: '회의 정보', k: 'writer', l: '작성자', d: '김철수' },
      { g: '회의 정보', k: 'attendees', l: '참석자', d: '홍길동, 김철수, 박영희, 이민수', w: 2 },
      { g: '회의 정보', k: 'absent', l: '불참자', d: '정수진(휴가)', w: 2 },
      { g: '요약', k: 'summary', l: '회의 목적', t: 'area', d: '12월 납기 대응과 재고 실사 일정을 확정하고, A사 단가 협상 방향을 공유합니다.', w: 2, rows: 2 },
      { g: '요약', k: 'decision', l: '주요 결정 사항', t: 'area', d: '1) 12월 재고 실사는 12월 12일(금) 실시\n2) A사 협상 최저 단가 톤당 8.2만원 승인\n3) 신규 거래처 2곳 신용조사 후 거래 개시', w: 2, rows: 3 }
    ],
    sets: [
      {
        k: 'agenda', label: '안건별 논의', addLabel: '안건 추가',
        cols: [
          { k: 'agenda', h: '안건', w: '24%', d: '12월 납기 대응' },
          { k: 'content', h: '논의 내용', w: '48%', d: 'A사 12월 물량 200톤, 12/5 협상 전까지 재고 60톤 확보 필요' },
          { k: 'owner', h: '담당', w: '14%', d: '김철수' },
          { k: 'due', h: '기한', w: '14%', d: '12/03' }
        ],
        def: [
          { agenda: '12월 납기 대응', content: 'A사 12월 물량 200톤, 12/5 협상 전까지 재고 60톤 확보 필요', owner: '김철수', due: '12/03' },
          { agenda: '재고 실사', content: '12/12 실시, 물류팀 3명 + 영업팀 2명 투입, 라벨 출력 12/10까지', owner: '박영희', due: '12/10' },
          { agenda: '신규 거래처', content: 'C사·D사 신용조사 의뢰, 결과 확인 후 거래 조건 결정', owner: '이민수', due: '12/15' }
        ]
      },
      {
        k: 'actions', label: '후속 조치', addLabel: '조치 추가',
        cols: [
          { k: 'action', h: '조치 사항', w: '56%', d: '재고 60톤 확보 발주' },
          { k: 'owner', h: '담당', w: '16%', d: '김철수' },
          { k: 'due', h: '완료 기한', w: '16%', d: '2026-12-03' },
          { k: 'status', h: '상태', w: '12%', d: '진행' }
        ],
        def: [
          { action: '재고 60톤 확보 발주', owner: '김철수', due: '2026-12-03', status: '진행' },
          { action: '실사 체크리스트·라벨 출력', owner: '박영희', due: '2026-12-10', status: '예정' },
          { action: '신용조사 의뢰서 제출', owner: '이민수', due: '2026-12-05', status: '예정' }
        ]
      }
    ],
    blocks: [
      { t: 'kv', rows: [['회의명', 'title'], ['일시', 'meetDate'], ['장소', 'place'], ['주관', 'chair'], ['참석자', 'attendees'], ['불참', 'absent']] },
      sec('회의 목적', 'summary'),
      { t: 'table', set: 'agenda', head: ['안건', '논의 내용', '담당', '기한'], cols: [{ k: 'agenda', h: '안건' }, { k: 'content', h: '논의 내용' }, { k: 'owner', h: '담당', t: 'center' }, { k: 'due', h: '기한', t: 'center' }] },
      { t: 'table', set: 'actions', head: ['조치 사항', '담당', '완료 기한', '상태'], cols: [{ k: 'action', h: '조치 사항' }, { k: 'owner', h: '담당', t: 'center' }, { k: 'due', h: '완료 기한', t: 'center' }, { k: 'status', h: '상태', t: 'center' }] },
      sec('주요 결정 사항', 'decision'),
      body('위 회의 내용과 결정 사항을 기록합니다. 조치 사항은 담당자가 기한 내 처리하고, 다음 회의에서 결과를 확인합니다.'),
      sign(['A', 'B'], function (d) { return '작성일 ' + dko(d.f.meetDate) + ' · 작성자와 주관이 확인합니다.'; }),
      note('※ 회의록은 사실과 결정을 그대로 남기는 문서입니다. 발언자를 특정해 인용할 때는 당사자에게 확인을 받고, 대외비 내용은 배포 범위를 정해 두세요.')
    ]
  });

  /* ---------------------------------------------------------
     13. 사내 공지문
  --------------------------------------------------------- */
  add({
    id: 'notice', cat: 'doc', sub: 'legal', no: '11',
    name: '사내 공지문', en: 'INTERNAL NOTICE',
    keywords: '공지문 사내 공지 안내문 통지문 전달 사항 공지사항 게시',
    head: { sub: 'INTERNAL NOTICE', meta: [['공지일', 'issueDate'], ['시행일', 'startDate']] },
    parties: [{ k: 'A', label: '공지 부서', nameKey: 'dept' }],
    fields: [
      { g: '공지 정보', k: 'title', l: '제목', d: '연말 재고 실사 및 휴무 일정 안내', w: 2 },
      { g: '공지 정보', k: 'dept', l: '공지 부서', d: '운영지원팀' },
      { g: '공지 정보', k: 'writer', l: '담당자', d: '이민수' },
      { g: '공지 정보', k: 'issueDate', l: '공지일', t: 'date', d: today() },
      { g: '공지 정보', k: 'startDate', l: '시행일', t: 'date', d: addD(today(), 3) },
      { g: '공지 정보', k: 'target', l: '대상', d: '전 직원' },
      { g: '공지 정보', k: 'channel', l: '게시 채널', t: 'sel', opts: ['사내 게시판', '이메일', '메신저', '전체'], d: '전체' },
      { g: '본문', k: 'lead', l: '요지(첫 문장)', t: 'area', d: '연말 재고 실사와 송년 휴무 일정을 아래와 같이 안내드립니다. 업무 일정에 착오 없으시기 바랍니다.', w: 2, rows: 2 },
      { g: '본문', k: 'body', l: '상세 내용', t: 'area', d: '1. 재고 실사\n· 일시: 2026년 12월 12일(금) 09:00 ~ 17:00\n· 대상: 전 창고 및 사무실 비품\n· 협조: 실사 당일 오전 출고는 12시까지 마감합니다.\n\n2. 송년 휴무\n· 2026년 12월 31일(목) 휴무, 1월 2일(금) 정상 근무\n· 긴급 연락은 팀별 당직자를 통해 받습니다.\n\n3. 협조 사항\n· 실사 전까지 미결 재고를 정리해 주세요.\n· 개인 좌석 정리는 12월 11일까지 완료해 주세요.', w: 2, rows: 10 },
      { g: '본문', k: 'contact', l: '문의', d: '운영지원팀 이민수 (내선 0000)', w: 2 },
      { g: '본문', k: 'closing', l: '맺음말', d: '협조해 주셔서 감사합니다.', w: 2 }
    ],
    blocks: [
      { t: 'kv', rows: [['공지 부서', 'dept'], ['담당자', 'writer'], ['공지일', function (d) { return dko(d.f.issueDate); }], ['시행일', function (d) { return dko(d.f.startDate); }], ['대상', 'target'], ['게시 채널', 'channel']] },
      { t: 'amount', v: 'title' },
      sec('안내 요지', 'lead'),
      { t: 'body', v: 'body' },
      sec('문의처', 'contact'),
      body('closing'),
      sign(['A'], function (d) { return dko(d.f.issueDate) + ' · ' + d.f.dept; }),
      note('※ 공지문은 첫 문장에 결론(무엇이 언제 바뀌는지)을 쓰고, 일시·대상·협조 사항을 번호로 나누면 읽는 사람이 놓치지 않습니다. 근로조건을 바꾸는 내용은 취업규칙 개정 절차와 별도로 다뤄야 합니다.')
    ]
  });

  /* ---------------------------------------------------------
     14. 교육훈련 결과보고서
  --------------------------------------------------------- */
  add({
    id: 'training-report', cat: 'doc', sub: 'hr', no: '18',
    name: '교육훈련 결과보고서', en: 'TRAINING REPORT',
    keywords: '교육훈련 결과보고서 교육 이수 보고 직무교육 안전교육 결과 정리',
    head: { sub: 'TRAINING REPORT', meta: [['작성일', 'issueDate'], ['교육 기간', function (d) { return dko(d.f.fromDate) + ' ~ ' + dko(d.f.toDate); }]] },
    parties: [{ k: 'A', label: '작성자', nameKey: 'name' }, { k: 'B', label: '확인(부서장)', nameKey: 'manager' }],
    fields: [
      { g: '교육 정보', k: 'title', l: '교육명', d: '2026년 하반기 산업안전보건 정기교육', w: 2 },
      { g: '교육 정보', k: 'kind', l: '구분', t: 'sel', opts: ['사내교육', '외부 위탁', '온라인', '집체'], d: '외부 위탁' },
      { g: '교육 정보', k: 'org', l: '교육 기관', d: '○○안전교육원' },
      { g: '교육 정보', k: 'fromDate', l: '시작일', t: 'date', d: addD(today(), -10) },
      { g: '교육 정보', k: 'toDate', l: '종료일', t: 'date', d: addD(today(), -9) },
      { g: '교육 정보', k: 'hours', l: '교육 시간', t: 'num', d: '12', h: '시간' },
      { g: '교육 정보', k: 'name', l: '작성자', d: '이민수' },
      { g: '교육 정보', k: 'dept', l: '부서', d: '생산팀' },
      { g: '교육 정보', k: 'manager', l: '부서장', d: '홍길동' },
      { g: '교육 정보', k: 'issueDate', l: '작성일', t: 'date', d: today() },
      { g: '내용', k: 'content', l: '주요 교육 내용', t: 'area', d: '· 위험성 평가와 작업 전 안전 점검\n· 지게차·크레인 작업 안전 수칙\n· 화학물질 취급과 보호구 착용\n· 사고 발생 시 응급조치와 보고 절차', w: 2, rows: 5 },
      { g: '내용', k: 'apply', l: '업무 적용 계획', t: 'area', d: '1) 작업 전 안전 점검표를 지게차 작업에 적용\n2) 월 1회 5분 안전 교육 진행\n3) 보호구 착용 상태 주간 점검', w: 2, rows: 3 },
      { g: '내용', k: 'effect', l: '기대 효과', t: 'area', d: '적재물 낙하·충돌 사고 위험을 줄이고, 신규 작업자 교육 자료로 재사용할 수 있습니다.', w: 2, rows: 2 },
      { g: '내용', k: 'cost', l: '교육 비용', t: 'num', d: '240000', h: '원' }
    ],
    sets: [{
      k: 'people', label: '이수자 명단', addLabel: '이수자 추가',
      cols: [
        { k: 'name', h: '성명', w: '24%', d: '이민수' },
        { k: 'dept', h: '부서', w: '22%', d: '생산팀' },
        { k: 'hours', h: '이수 시간', t: 'num', w: '16%', d: '12' },
        { k: 'done', h: '이수 여부', w: '16%', d: '이수' },
        { k: 'memo', h: '비고', w: '22%', d: '수료증 보관' }
      ],
      def: [
        { name: '이민수', dept: '생산팀', hours: '12', done: '이수', memo: '수료증 보관' },
        { name: '김철수', dept: '영업팀', hours: '12', done: '이수', memo: '수료증 보관' },
        { name: '박영희', dept: '물류팀', hours: '8', done: '일부 이수', memo: '잔여 4시간 12월 보충' }
      ]
    }],
    blocks: [
      { t: 'kv', rows: [['교육명', 'title'], ['구분', 'kind'], ['교육 기관', 'org'], ['교육 기간', function (d) { return dko(d.f.fromDate) + ' ~ ' + dko(d.f.toDate); }], ['교육 시간', function (d) { return d.f.hours + '시간'; }], ['작성자', function (d) { return d.f.dept + ' / ' + d.f.name; }]] },
      sec('1. 교육 개요', function (d) { return d.f.org + '에서 ' + d.f.hours + '시간 ' + d.f.kind + '으로 실시한 교육을 이수하였습니다.'; }),
      sec('2. 주요 교육 내용', 'content'),
      { t: 'table', set: 'people', head: ['성명', '부서', '이수 시간', '이수 여부', '비고'], cols: [{ k: 'name', h: '성명' }, { k: 'dept', h: '부서' }, { k: 'hours', h: '이수 시간', t: 'num' }, { k: 'done', h: '이수 여부', t: 'center' }, { k: 'memo', h: '비고' }] },
      { t: 'sums', rows: [{ l: '총 이수 시간', v: function (d) { return sum(d, 'people', 'hours'); }, unit: '시간' }, { l: '교육 비용', v: function (d) { return H.num(d.f.cost); }, unit: '원', grand: true }] },
      sec('3. 업무 적용 계획', 'apply'),
      sec('4. 기대 효과', 'effect'),
      body('위와 같이 교육훈련을 이수하고 결과를 보고합니다.'),
      sign(['A', 'B'], function (d) { return dko(d.f.issueDate) + ' · 작성자와 부서장이 확인합니다.'; }),
      note('※ 산업안전보건법상 정기교육은 사무직·판매직 연 6시간, 그 외 근로자 연 12시간 이상 이수해야 하며, 교육 기록을 3년 이상 보관해야 합니다. 이 보고서는 사내 기록용이며 법정 교육일지와 함께 보관하세요.')
    ]
  });
})(typeof window !== 'undefined' ? window : this);
