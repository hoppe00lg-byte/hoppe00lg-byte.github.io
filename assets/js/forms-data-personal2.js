/* =========================================================
   INSIGHT BRIEF — 이력·자소서, 인사말·카드 추가분
   신입·경력·직무별 자소서, 포트폴리오, 면접평가표,
   청첩장·부고·개업·승진·송년·신년 인사.
   문구는 이 사이트에서 직접 작성한 예시이며 자유롭게 고쳐 쓸 수 있습니다.
   ========================================================= */
(function (root) {
  'use strict';
  var H = root.IBF;
  var DOCS = root.IBF_DOCS;
  var esc = H.esc, fmt = H.fmt, dko = H.dateKo, today = H.todayISO, addD = H.addDays;
  function add(d) { DOCS[d.id] = d; return d; }
  function sec(h, v) { return { t: 'sec', h: h, v: v }; }
  function sign(parties, txt) { return { t: 'sign', parties: parties, note: txt == null ? null : (typeof txt === 'function' ? txt : function () { return txt; }) }; }
  function note(txt) { return { t: 'note', v: function () { return txt; } }; }
  function body(txt) { return { t: 'body', v: txt }; }

  /* ---------------------------------------------------------
     1. 신입 자기소개서
  --------------------------------------------------------- */
  add({
    id: 'cover-new', cat: 'resume', sub: 'rs-main', no: '02', tpl: 'resume',
    name: '신입 자기소개서', en: 'ENTRY-LEVEL COVER LETTER',
    keywords: '신입 자소서 자기소개서 성장과정 지원동기 성격 장단점 입사 후 포부',
    head: { sub: 'COVER LETTER · ENTRY LEVEL', meta: [['작성일', 'issueDate'], ['지원 회사', 'company']] },
    parties: [{ k: 'A', label: '지원자', nameKey: 'name' }],
    fields: [
      { g: '지원 정보', k: 'name', l: '성명', d: '김하늘' },
      { g: '지원 정보', k: 'birth', l: '생년월일', d: '2001-03-08' },
      { g: '지원 정보', k: 'phone', l: '연락처', d: '010-0000-0000' },
      { g: '지원 정보', k: 'email', l: '이메일', d: 'haneul@example.com' },
      { g: '지원 정보', k: 'company', l: '지원 회사', d: '○○물류' },
      { g: '지원 정보', k: 'job', l: '지원 직무', d: '물류 운영 (신입)' },
      { g: '지원 정보', k: 'issueDate', l: '작성일', t: 'date', d: today() },
      { g: '자소서', k: 'grow', l: '1. 성장 과정', t: 'area', d: '대학 시절 2년간 학교 근처 편의점에서 야간 아르바이트를 했습니다. 재고와 발주를 맡으면서 “오늘 팔릴 양”을 숫자로 예측하는 습관을 들였고, 폐기 손실을 줄인 경험이 있습니다. 이때 배운 것은 일의 속도보다 확인의 정확함이 중요하다는 점이었습니다.', w: 2, rows: 5, limit: 800 },
      { g: '자소서', k: 'why', l: '2. 지원 동기', t: 'area', d: '물류는 눈에 보이지 않는 시간을 관리하는 일이라고 생각합니다. 학교에서 공급망 관리 과목을 수강하며 입고·출고 데이터가 곧 고객의 약속이라는 점에 끌렸습니다. ○○물류의 배송 정시율 개선 사례를 보고, 현장 데이터를 끝까지 확인하는 사람이 되고 싶어 지원했습니다.', w: 2, rows: 5, limit: 800 },
      { g: '자소서', k: 'strength', l: '3. 성격의 장단점', t: 'area', d: '장점은 꼼꼼함입니다. 행사 준비팀에서 체크리스트를 만들어 3회 행사를 무사고로 마쳤습니다. 단점은 완벽하게 준비하려다 시작이 늦다는 점입니다. 이를 보완하기 위해 업무를 3일 단위로 나누고, 70% 완성되면 먼저 공유하는 방식을 연습하고 있습니다.', w: 2, rows: 5, limit: 800 },
      { g: '자소서', k: 'exp', l: '4. 경험·활동', t: 'area', d: '동아리 물류 프로젝트에서 4명 팀의 일정 관리를 맡아 8주간 모의 배송 계획을 세웠습니다. 엑셀로 구간별 소요 시간을 정리해 총 운송 시간을 12% 줄였고, 발표에서 최우수 평가를 받았습니다.', w: 2, rows: 5, limit: 800 },
      { g: '자소서', k: 'plan', l: '5. 입사 후 포부', t: 'area', d: '입사 후 1년은 현장 업무를 익히며 입고·출고 오차 원인을 기록하는 습관을 만들겠습니다. 3년 안에는 데이터로 납기 지연을 예측하는 업무를 맡고 싶습니다. 먼저 회사의 기준을 정확히 배우는 사람이 되겠습니다.', w: 2, rows: 5, limit: 800 }
    ],
    blocks: [
      { t: 'kv', rows: [['성명', 'name'], ['생년월일', 'birth'], ['연락처', 'phone'], ['이메일', 'email'], ['지원 회사', 'company'], ['지원 직무', 'job']] },
      { t: 'title', v: function (d) { return d.f.company + ' ' + d.f.job + ' 지원 자기소개서'; } },
      { t: 'sec', h: '1. 성장 과정', v: 'grow' },
      { t: 'sec', h: '2. 지원 동기', v: 'why' },
      { t: 'sec', h: '3. 성격의 장단점', v: 'strength' },
      { t: 'sec', h: '4. 경험·활동', v: 'exp' },
      { t: 'sec', h: '5. 입사 후 포부', v: 'plan' },
      body('위 내용은 사실과 다름이 없으며, 채용 전형에서 확인이 필요한 경우 언제든지 자료를 제출하겠습니다.'),
      sign(['A'], function (d) { return dko(d.f.issueDate) + ' · 지원자 서명'; }),
      note('※ 신입 자소서는 “무엇을 했는지”보다 “어떻게 판단하고 행동했는지”가 중요합니다. 경험 하나를 골라 상황-행동-결과 순서로 쓰고, 회사가 실제로 하는 일과 연결해 마무리하세요.')
    ]
  });

  /* ---------------------------------------------------------
     2. 경력 자기소개서
  --------------------------------------------------------- */
  add({
    id: 'cover-career', cat: 'resume', sub: 'rs-main', no: '03', tpl: 'resume',
    name: '경력 자기소개서', en: 'EXPERIENCED COVER LETTER',
    keywords: '경력 자소서 자기소개서 이직 경력기술 성과 수치 기여 입사 후 포부',
    head: { sub: 'COVER LETTER · EXPERIENCED', meta: [['작성일', 'issueDate'], ['경력', function (d) { return d.f.years + '년'; }]] },
    parties: [{ k: 'A', label: '지원자', nameKey: 'name' }],
    fields: [
      { g: '지원 정보', k: 'name', l: '성명', d: '김철수' },
      { g: '지원 정보', k: 'phone', l: '연락처', d: '010-0000-0000' },
      { g: '지원 정보', k: 'email', l: '이메일', d: 'chulsoo@example.com' },
      { g: '지원 정보', k: 'company', l: '지원 회사', d: '△△물산' },
      { g: '지원 정보', k: 'job', l: '지원 직무', d: '수입·물류 팀장' },
      { g: '지원 정보', k: 'years', l: '총 경력', d: '10' },
      { g: '지원 정보', k: 'issueDate', l: '작성일', t: 'date', d: today() },
      { g: '자소서', k: 'summary', l: '1. 경력 요약', t: 'area', d: '10년간 플라스틱 원료 수입·재고·납기를 관리했습니다. 연 3,600톤 규모의 수입 물량을 담당하며 통관 지연을 평균 2.5일 줄였고, 물류비를 톤당 3,000원 절감했습니다.', w: 2, rows: 4, limit: 800 },
      { g: '자소서', k: 'achievement', l: '2. 주요 성과', t: 'area', d: '· 수입 통관 서류 사전 검토 체계를 만들어 평균 통관 기간을 7.2일에서 4.7일로 단축\n· 포워더 3곳을 비교 견적해 톤당 물류비 3,000원 절감 (연 1,080만원)\n· 재고 회전율을 4.1회에서 5.6회로 개선해 결품 클레임 12건 → 3건으로 감소', w: 2, rows: 5, limit: 900 },
      { g: '자소서', k: 'why', l: '3. 지원 동기', t: 'area', d: '△△물산이 추진하는 수입 라인 다변화는 제가 가장 잘할 수 있는 일입니다. 새 거래처의 첫 통관부터 정착까지 직접 경험했고, 그 과정에서 생기는 서류·납기 문제를 미리 정리하는 방법을 알고 있습니다.', w: 2, rows: 4, limit: 800 },
      { g: '자소서', k: 'plan', l: '4. 입사 후 90일 계획', t: 'area', d: '1개월: 기존 거래처·포워더·통관 흐름 파악, 2개월: 납기 지연 원인 데이터 정리, 3개월: 개선안 2건 제안 및 시범 적용', w: 2, rows: 3, limit: 600 },
      { g: '자소서', k: 'etc', l: '5. 기타', t: 'area', d: '무역관리사 2급, 컴퓨터활용능력 1급 보유. 엑셀 피벗·파워쿼리로 재고·납기 데이터를 직접 정리합니다.', w: 2, rows: 2, limit: 500 }
    ],
    blocks: [
      { t: 'kv', rows: [['성명', 'name'], ['연락처', 'phone'], ['이메일', 'email'], ['지원 회사', 'company'], ['지원 직무', 'job'], ['총 경력', function (d) { return d.f.years + '년'; }]] },
      { t: 'title', v: function (d) { return d.f.job + ' 지원 자기소개서'; } },
      sec('1. 경력 요약', 'summary'),
      sec('2. 주요 성과', 'achievement'),
      sec('3. 지원 동기', 'why'),
      sec('4. 입사 후 90일 계획', 'plan'),
      sec('5. 기타', 'etc'),
      body('위 경력과 성과는 실제 수행한 내용이며, 증빙이 필요한 경우 제출하겠습니다.'),
      sign(['A'], function (d) { return dko(d.f.issueDate) + ' · 지원자 서명'; }),
      note('※ 경력 자소서는 성과를 숫자로 보여 주는 것이 가장 강합니다. 본인이 직접 한 일과 팀 성과를 구분하고, 면접에서 근거를 설명할 수 있는 수치만 쓰세요.')
    ]
  });

  /* ---------------------------------------------------------
     3. 직무별 자기소개서 (직무 선택형)
  --------------------------------------------------------- */
  add({
    id: 'cover-job', cat: 'resume', sub: 'rs-main', no: '04', tpl: 'resume',
    name: '직무별 자기소개서', en: 'JOB-SPECIFIC COVER LETTER',
    keywords: '직무별 자소서 영업 생산 사무 간호 IT 자기소개서 직무 역량',
    head: { sub: 'COVER LETTER · BY ROLE', meta: [['작성일', 'issueDate'], ['직무', 'jobType']] },
    parties: [{ k: 'A', label: '지원자', nameKey: 'name' }],
    fields: [
      { g: '지원 정보', k: 'name', l: '성명', d: '박영희' },
      { g: '지원 정보', k: 'jobType', l: '직무 선택', t: 'sel', opts: ['영업·영업관리', '생산·품질', '사무·경영지원', '간호·보건', 'IT·개발', '서비스·고객응대'], d: '영업·영업관리' },
      { g: '지원 정보', k: 'company', l: '지원 회사', d: '○○산업' },
      { g: '지원 정보', k: 'phone', l: '연락처', d: '010-0000-0000' },
      { g: '지원 정보', k: 'issueDate', l: '작성일', t: 'date', d: today() },
      { g: '직무 역량', k: 'core', l: '직무 핵심 역량', t: 'area', d: '거래처 요구를 숫자로 정리해 견적·납기를 조율하는 능력, 납기 지연 상황에서 대안을 먼저 제시하는 커뮤니케이션', w: 2, rows: 3 },
      { g: '직무 역량', k: 'evidence', l: '역량을 보여 준 경험', t: 'area', d: '담당 거래처 18곳의 월 주문 패턴을 정리해 발주 시점을 앞당겼고, 성수기 결품을 0건으로 유지했습니다.', w: 2, rows: 3 },
      { g: '자소서', k: 'body1', l: '1. 지원 동기', t: 'area', d: '현장에서 고객의 불편을 먼저 발견하고 해결하는 일에 보람을 느껴 영업 직무를 선택했습니다. ○○산업의 제품 라인은 제가 다뤄 온 산업재와 결이 비슷해, 빠르게 적응할 수 있다고 생각합니다.', w: 2, rows: 4, limit: 800 },
      { g: '자소서', k: 'body2', l: '2. 직무 수행 계획', t: 'area', d: '첫 3개월은 담당 거래처의 주문·클레임 이력을 정리해 패턴을 파악하고, 6개월에는 납기 준수율을 95% 이상으로 끌어올리는 개선안을 제안하겠습니다.', w: 2, rows: 4, limit: 800 }
    ],
    blocks: [
      { t: 'kv', rows: [['성명', 'name'], ['지원 직무', 'jobType'], ['지원 회사', 'company'], ['연락처', 'phone']] },
      { t: 'title', v: function (d) { return d.f.jobType + ' 지원 자기소개서'; } },
      sec('직무 핵심 역량', 'core'),
      sec('역량을 보여 준 경험', 'evidence'),
      sec('1. 지원 동기', 'body1'),
      sec('2. 직무 수행 계획', 'body2'),
      sign(['A'], function (d) { return dko(d.f.issueDate) + ' · 지원자 서명'; }),
      note('※ 직무를 바꿔 지원할 때는 같은 경험도 직무 언어로 다시 써야 합니다. 영업은 ‘거래처·매출’, 생산은 ‘불량·공정’, 사무는 ‘정확성·일정’처럼 회사가 쓰는 단어로 정리해 보세요.')
    ]
  });

  /* ---------------------------------------------------------
     4. 포트폴리오
  --------------------------------------------------------- */
  add({
    id: 'portfolio', cat: 'resume', sub: 'rs-career', no: '03', tpl: 'resume',
    name: '포트폴리오', en: 'PORTFOLIO',
    keywords: '포트폴리오 경력 정리 프로젝트 결과물 디자이너 개발자 이직 제출',
    head: { sub: 'PORTFOLIO', meta: [['작성일', 'issueDate'], ['프로젝트', function (d) { return (d.sets.projects || []).length + '건'; }]] },
    parties: [{ k: 'A', label: '작성자', nameKey: 'name' }],
    fields: [
      { g: '작성자', k: 'name', l: '성명', d: '이민수' },
      { g: '작성자', k: 'role', l: '직무', d: '서비스 기획 / 데이터 분석' },
      { g: '작성자', k: 'phone', l: '연락처', d: '010-0000-0000' },
      { g: '작성자', k: 'email', l: '이메일', d: 'minsu@example.com' },
      { g: '작성자', k: 'link', l: '링크(노션·깃허브)', d: 'notion.so/example', w: 2 },
      { g: '작성자', k: 'issueDate', l: '작성일', t: 'date', d: today() },
      { g: '소개', k: 'intro', l: '한 줄 소개', d: '데이터로 문제를 정의하고, 작은 실험으로 검증하는 기획자입니다.', w: 2 },
      { g: '소개', k: 'skill', l: '보유 역량', t: 'area', d: '· 서비스 기획: 요구사항 정의, 화면 설계, 지표 설계\n· 데이터: SQL, 엑셀 피벗, 대시보드 구성\n· 협업: 개발·디자인·운영 이해관계자 조율', w: 2, rows: 3 }
    ],
    sets: [{
      k: 'projects', label: '프로젝트', addLabel: '프로젝트 추가',
      cols: [
        { k: 'name', h: '프로젝트', w: '26%', d: '주문 이탈 분석 대시보드' },
        { k: 'role', h: '역할', w: '18%', d: '기획·분석' },
        { k: 'result', h: '결과', w: '32%', d: '이탈률 18% → 11%' },
        { k: 'period', h: '기간', w: '14%', d: '2026.03~06' },
        { k: 'tool', h: '도구', w: '10%', d: 'SQL' }
      ],
      def: [
        { name: '주문 이탈 분석 대시보드', role: '기획·분석', result: '이탈률 18% → 11%', period: '2026.03~06', tool: 'SQL' },
        { name: '입고 검수 자동화', role: '요구사항 정의', result: '검수 시간 40% 단축', period: '2025.07~11', tool: 'Excel' },
        { name: '고객 문의 분류 체계', role: '프로세스 설계', result: '평균 응답 6시간 → 2시간', period: '2025.01~04', tool: 'Notion' }
      ]
    }],
    blocks: [
      { t: 'kv', rows: [['성명', 'name'], ['직무', 'role'], ['연락처', 'phone'], ['이메일', 'email'], ['링크', 'link']] },
      { t: 'amount', v: 'intro', sub: 'role' },
      sec('보유 역량', 'skill'),
      { t: 'table', set: 'projects', head: ['프로젝트', '역할', '결과', '기간', '도구'], cols: [{ k: 'name', h: '프로젝트' }, { k: 'role', h: '역할' }, { k: 'result', h: '결과' }, { k: 'period', h: '기간', t: 'center' }, { k: 'tool', h: '도구', t: 'center' }] },
      sec('프로젝트 상세', function (d) {
        return (d.sets.projects || []).map(function (r, i) {
          return (i + 1) + '. ' + r.name + '\n· 역할: ' + r.role + '\n· 문제: (해결하려 한 문제를 한 줄로)\n· 접근: (어떤 데이터·방법을 썼는지)\n· 결과: ' + r.result + '\n· 배운 점: (다음에 다르게 할 것)';
        }).join('\n\n');
      }),
      sign(['A'], function (d) { return dko(d.f.issueDate) + ' · 작성자 서명'; }),
      note('※ 포트폴리오는 결과물 개수보다 “문제-접근-결과-배운 점”이 드러나는 것이 중요합니다. 회사 기밀에 해당하는 수치·화면은 비율이나 범위로 바꿔 표기하세요.')
    ]
  });

  /* ---------------------------------------------------------
     5. 면접 평가표
  --------------------------------------------------------- */
  add({
    id: 'interview-eval', cat: 'resume', sub: 'rs-career', no: '04', tpl: 'table',
    name: '면접 평가표', en: 'INTERVIEW SCORECARD',
    keywords: '면접 평가표 채용 평가 역량 점수 면접관 평가표 지원자 비교',
    head: { sub: 'INTERVIEW SCORECARD', meta: [['면접일', 'meetDate'], ['지원자', 'name']] },
    parties: [{ k: 'A', label: '면접관', nameKey: 'interviewer' }],
    fields: [
      { g: '지원자', k: 'name', l: '성명', d: '김철수' },
      { g: '지원자', k: 'job', l: '지원 직무', d: '영업관리' },
      { g: '지원자', k: 'career', l: '경력', d: '7년' },
      { g: '면접 정보', k: 'meetDate', l: '면접일', t: 'date', d: today() },
      { g: '면접 정보', k: 'kind', l: '면접 유형', t: 'sel', opts: ['1차 실무', '2차 임원', '화상면접', '과제면접'], d: '1차 실무' },
      { g: '면접 정보', k: 'interviewer', l: '면접관', d: '홍길동 팀장' },
      { g: '면접 정보', k: 'memo', l: '총평', t: 'area', d: '실무 경험이 직무와 잘 맞고, 수치로 성과를 설명하는 점이 좋았습니다. 다만 협상 경험은 확인이 더 필요합니다.', w: 2, rows: 3 },
      { g: '면접 정보', k: 'decision', l: '판정', t: 'sel', opts: ['적극 추천', '추천', '보류', '부적합'], d: '추천' }
    ],
    sets: [{
      k: 'rows', label: '역량별 평가', addLabel: '항목 추가',
      cols: [
        { k: 'item', h: '평가 항목', w: '34%', d: '직무 전문성' },
        { k: 'weight', h: '가중치(%)', t: 'num', w: '14%', d: '30' },
        { k: 'score', h: '점수(1~5)', t: 'num', w: '14%', d: '4' },
        { k: 'memo', h: '평가 근거', w: '38%', d: '통관·재고 관리 경험을 구체적으로 설명' }
      ],
      def: [
        { item: '직무 전문성', weight: '30', score: '4', memo: '통관·재고 관리 경험을 구체적으로 설명' },
        { item: '문제 해결', weight: '25', score: '4', memo: '납기 지연 시 대안을 먼저 제시' },
        { item: '커뮤니케이션', weight: '20', score: '3', memo: '답변이 다소 길고 핵심이 늦음' },
        { item: '조직 적합성', weight: '15', score: '4', memo: '현장 중심 업무 선호' },
        { item: '성장 가능성', weight: '10', score: '5', memo: '엑셀 자동화를 스스로 학습' }
      ]
    }],
    blocks: [
      { t: 'kv', rows: [['지원자', 'name'], ['지원 직무', 'job'], ['경력', 'career'], ['면접일', function (d) { return dko(d.f.meetDate); }], ['면접 유형', 'kind'], ['면접관', 'interviewer']] },
      { t: 'table', set: 'rows', head: ['평가 항목', '가중치(%)', '점수(1~5)', '평가 근거'], cols: [{ k: 'item', h: '평가 항목' }, { k: 'weight', h: '가중치(%)', t: 'num' }, { k: 'score', h: '점수(1~5)', t: 'num' }, { k: 'memo', h: '평가 근거' }] },
      { t: 'sums', rows: [
        { l: '가중치 합계', v: function (d) { return H.setSum(d, 'rows', 'weight'); }, unit: '%' },
        { l: '가중 평균 점수(5점 만점)', v: function (d) { return d.sets.rows.length ? Math.round(d.sets.rows.reduce(function (a, r) { return a + H.num(r.weight) * H.num(r.score); }, 0) / Math.max(1, H.setSum(d, 'rows', 'weight')) * 10) / 10 : 0; }, text: true, grand: true }
      ] },
      sec('총평', 'memo'),
      sec('판정', function (d) { return d.f.decision + ' — 위 평가를 종합해 판정합니다.'; }),
      sign(['A'], function (d) { return dko(d.f.meetDate) + ' · 면접관 서명'; }),
      note('※ 점수는 면접관마다 기준이 달라지기 쉽습니다. 항목별로 “무엇을 보면 4점인지”를 사전에 정해 두면 평가가 일관됩니다. 채용 관련 개인정보는 보관 기간을 정해 파기하세요.')
    ]
  });

  /* ---------------------------------------------------------
     6. 인턴·신입 지원 자기소개서
  --------------------------------------------------------- */
  add({
    id: 'cover-intern', cat: 'resume', sub: 'rs-main', no: '05', tpl: 'resume',
    name: '인턴·신입 지원 자기소개서', en: 'INTERNSHIP COVER LETTER',
    keywords: '인턴 자소서 인턴십 지원 자기소개서 신입 실습 지원동기',
    head: { sub: 'COVER LETTER · INTERNSHIP', meta: [['작성일', 'issueDate'], ['지원 기간', 'period']] },
    parties: [{ k: 'A', label: '지원자', nameKey: 'name' }],
    fields: [
      { g: '지원 정보', k: 'name', l: '성명', d: '최민호' },
      { g: '지원 정보', k: 'school', l: '학교·전공', d: '○○대학교 경영학과 3학년' },
      { g: '지원 정보', k: 'company', l: '지원 회사', d: '△△물산' },
      { g: '지원 정보', k: 'period', l: '희망 기간', d: '2027-01-05 ~ 2027-02-27 (8주)' },
      { g: '지원 정보', k: 'phone', l: '연락처', d: '010-0000-0000' },
      { g: '지원 정보', k: 'issueDate', l: '작성일', t: 'date', d: today() },
      { g: '자소서', k: 'why', l: '1. 지원 동기', t: 'area', d: '수업에서 배운 재고 이론이 실제 창고에서 어떻게 달라지는지 직접 확인하고 싶습니다. △△물산의 물류 운영 방식과 현장 데이터를 경험하며 진로를 구체화하고 싶어 지원했습니다.', w: 2, rows: 4, limit: 700 },
      { g: '자소서', k: 'strength', l: '2. 나의 강점', t: 'area', d: '낯선 일도 표로 정리해 순서를 만들고, 모르는 것은 바로 물어보는 편입니다. 팀 프로젝트에서 일정표를 만들어 발표일을 지킨 경험이 있습니다.', w: 2, rows: 4, limit: 700 },
      { g: '자소서', k: 'plan', l: '3. 인턴 기간 목표', t: 'area', d: '1) 입고·출고 프로세스를 직접 익히고 용어 정리 노트 작성\n2) 담당 업무를 하루 단위로 기록해 인수인계 자료로 정리\n3) 엑셀로 재고 현황을 정리하는 일을 맡아 보고 싶습니다.', w: 2, rows: 4, limit: 700 },
      { g: '자소서', k: 'etc', l: '4. 기타', t: 'area', d: '컴퓨터활용능력 2급, 운전면허 2종 보통. 방학 중 물류센터 단기 아르바이트 경험이 있습니다.', w: 2, rows: 2, limit: 500 }
    ],
    blocks: [
      { t: 'kv', rows: [['성명', 'name'], ['학교·전공', 'school'], ['지원 회사', 'company'], ['희망 기간', 'period'], ['연락처', 'phone']] },
      { t: 'title', v: function (d) { return d.f.company + ' 인턴 지원 자기소개서'; } },
      sec('1. 지원 동기', 'why'),
      sec('2. 나의 강점', 'strength'),
      sec('3. 인턴 기간 목표', 'plan'),
      sec('4. 기타', 'etc'),
      body('학교·학점 등 추가 확인이 필요한 서류는 요청 시 제출하겠습니다.'),
      sign(['A'], function (d) { return dko(d.f.issueDate) + ' · 지원자 서명'; }),
      note('※ 인턴 자소서는 “배우고 싶은 것”을 구체적으로 쓰는 것이 좋습니다. 회사의 실제 업무를 언급하고, 인턴 기간에 할 수 있는 작은 목표 2~3개를 적으세요.')
    ]
  });

  /* ---------------------------------------------------------
     7. 청첩장
  --------------------------------------------------------- */
  add({
    id: 'wedding-invite', cat: 'greeting', sub: 'gr-event', no: '02', tpl: 'card',
    name: '청첩장', en: 'WEDDING INVITATION',
    keywords: '청첩장 결혼식 모바일 청첩장 결혼 초대 예식장 축의 화환',
    head: { sub: 'WEDDING INVITATION', meta: [['예식일', 'weddingDate'], ['예식장', 'place']] },
    parties: [{ k: 'A', label: '신랑·신부', nameKey: 'groom' }],
    fields: [
      { g: '예식', k: 'groom', l: '신랑', d: '김철수' },
      { g: '예식', k: 'bride', l: '신부', d: '김하늘' },
      { g: '예식', k: 'weddingDate', l: '예식 일시', d: '2027-03-21 12:00' },
      { g: '예식', k: 'place', l: '예식장', d: '○○웨딩홀 3층 그랜드홀', w: 2 },
      { g: '예식', k: 'addr', l: '주소', d: '서울특별시 송파구 ○○로 00', w: 2 },
      { g: '예식', k: 'contact', l: '문의', d: '신랑 010-0000-0000 / 신부 010-0000-0000', w: 2 },
      { g: '예식', k: 'rsvp', l: '회신 기한', t: 'date', d: addD(today(), 20) },
      { g: '인사', k: 'parents', l: '부모님 성함', d: '김○○·박○○ (신랑), 이○○·최○○ (신부)', w: 2 },
      { g: '인사', k: 'message', l: '초대 문구', t: 'area', d: '서로의 하루를 함께 걷기로 약속했습니다.\n두 사람이 첫걸음을 내딛는 자리에\n따뜻한 마음으로 함께해 주시면 큰 기쁨이 되겠습니다.', w: 2, rows: 4 }
    ],
    blocks: [
      sec('초대의 글', function (d) { return d.f.parents + '의 자녀 ' + d.f.groom + '·' + d.f.bride + '가 결혼합니다.'; }),
      body('message'),
      { t: 'kv', rows: [['예식 일시', 'weddingDate'], ['예식장', 'place'], ['주소', 'addr'], ['회신 기한', function (d) { return dko(d.f.rsvp); }], ['문의', 'contact']] },
      { t: 'center', v: '— 함께해 주시는 모든 분께 감사드립니다 —' },
      note('※ 모바일 청첩장은 예식장 약도·주차 안내·계좌 정보를 함께 넣는 경우가 많습니다. 계좌는 본인 동의를 받아 표기하고, 참석 여부 회신 기한을 분명히 적어 주세요.')
    ]
  });

  /* ---------------------------------------------------------
     8. 부고·조문 안내
  --------------------------------------------------------- */
  add({
    id: 'obituary', cat: 'greeting', sub: 'gr-event', no: '03', tpl: 'card',
    name: '부고·조문 안내', en: 'OBITUARY NOTICE',
    keywords: '부고 조문 안내 삼가 알림 장례 발인 빈소 조의 상주',
    head: { sub: 'OBITUARY NOTICE', meta: [['별세일', 'deathDate'], ['발인일', 'funeralDate']] },
    parties: [{ k: 'A', label: '상주', nameKey: 'chief' }],
    fields: [
      { g: '고인', k: 'deceased', l: '고인', d: '김○○' },
      { g: '고인', k: 'age', l: '향년', d: '85세' },
      { g: '고인', k: 'chief', l: '상주', d: '김철수 (장남)' },
      { g: '일정', k: 'deathDate', l: '별세일', d: '2027-01-08' },
      { g: '일정', k: 'funeralDate', l: '발인일', d: '2027-01-10 07:00' },
      { g: '일정', k: 'hall', l: '빈소', d: '○○병원 장례식장 3호실', w: 2 },
      { g: '일정', k: 'addr', l: '장례식장 주소', d: '서울특별시 서초구 ○○로 00', w: 2 },
      { g: '일정', k: 'contact', l: '연락처', d: '010-0000-0000', w: 2 },
      { g: '일정', k: 'account', l: '조의 계좌', d: '○○은행 000-00-000000 (예금주 김철수)' },
      { g: '인사', k: 'message', l: '인사말', t: 'area', d: '삼가 고인의 명복을 빕니다.\n바쁘신 중에도 마음 나누어 주시는 분들께 깊이 감사드립니다.', w: 2, rows: 3 }
    ],
    blocks: [
      { t: 'title', v: '부 고' },
      { t: 'kv', rows: [['고인', 'deceased'], ['향년', 'age'], ['상주', 'chief'], ['별세', function (d) { return dko(d.f.deathDate); }], ['발인', function (d) { return d.f.funeralDate; }], ['빈소', 'hall'], ['주소', 'addr'], ['연락', 'contact']] },
      body('message'),
      sec('조의 계좌', 'account'),
      { t: 'center', v: '— 삼가 조의를 표합니다 —' },
      note('※ 부고는 사실만 간결하게 적습니다. 이모지·감탄사는 쓰지 않고, 발인 일시와 빈소 호실을 정확히 표기하세요. 조의 계좌는 유족의 동의를 받은 경우에만 안내합니다.')
    ]
  });

  /* ---------------------------------------------------------
     9. 개업·이전 안내장
  --------------------------------------------------------- */
  add({
    id: 'opening-notice', cat: 'greeting', sub: 'gr-event', no: '04', tpl: 'card',
    name: '개업·이전 안내장', en: 'OPENING / RELOCATION NOTICE',
    keywords: '개업 안내 이전 안내 개업식 새로 문을 엽니다 매장 이전 주소 변경',
    head: { sub: 'OPENING / RELOCATION NOTICE', meta: [['개업(이전)일', 'openDate'], ['장소', 'place']] },
    parties: [{ k: 'A', label: '대표', nameKey: 'name' }],
    fields: [
      { g: '안내', k: 'kind', l: '구분', t: 'sel', opts: ['신규 개업', '이전 개업', '확장 이전', '지점 개설'], d: '이전 개업' },
      { g: '안내', k: 'name', l: '상호', d: '○○카페' },
      { g: '안내', k: 'ceo', l: '대표', d: '홍길동' },
      { g: '안내', k: 'openDate', l: '개업(이전)일', t: 'date', d: addD(today(), 10) },
      { g: '안내', k: 'place', l: '새 주소', d: '서울특별시 마포구 ○○로 00, 1층', w: 2 },
      { g: '안내', k: 'hours', l: '영업시간', d: '매일 08:00 ~ 21:00 (연중무휴)' },
      { g: '안내', k: 'contact', l: '연락처', d: '02-0000-0000' },
      { g: '안내', k: 'offer', l: '방문 혜택', d: '개업 2주간 전 음료 20% 할인' },
      { g: '인사', k: 'message', l: '인사말', t: 'area', d: '그동안 보내 주신 관심에 감사드립니다.\n더 넓고 편안한 공간으로 옮겨 새롭게 문을 열었습니다. 가까운 곳에서 다시 뵙겠습니다.', w: 2, rows: 4 }
    ],
    blocks: [
      { t: 'amount', v: 'name', sub: function (d) { return d.f.kind + ' 안내'; } },
      body('message'),
      { t: 'kv', rows: [['개업(이전)일', function (d) { return dko(d.f.openDate); }], ['새 주소', 'place'], ['영업시간', 'hours'], ['연락처', 'contact'], ['방문 혜택', 'offer']] },
      { t: 'center', v: '— 많은 관심과 방문 부탁드립니다 —' },
      sign(['A'], function (d) { return d.f.name + ' · ' + d.f.ceo; }),
      note('※ 이전 안내에는 이전 전 주소와 새 주소를 함께 적으면 찾아오는 고객이 헷갈리지 않습니다. 주차·대중교통 안내를 한 줄 덧붙이면 방문율이 올라갑니다.')
    ]
  });

  /* ---------------------------------------------------------
     10. 승진·취임 축하 인사
  --------------------------------------------------------- */
  add({
    id: 'promotion-congrats', cat: 'greeting', sub: 'gr-message', no: '02', tpl: 'card',
    name: '승진·취임 축하 인사', en: 'CONGRATULATORY MESSAGE',
    keywords: '승진 축하 취임 축하 인사 카톡 문자 축하 메시지 임원 취임',
    head: { sub: 'CONGRATULATORY MESSAGE', meta: [['작성일', 'issueDate'], ['받는 분', 'to']] },
    parties: [{ k: 'A', label: '보내는 사람', nameKey: 'from' }],
    fields: [
      { g: '메시지', k: 'kind', l: '상황', t: 'sel', opts: ['승진', '취임', '이임', '수상', '개업', '합격'], d: '승진' },
      { g: '메시지', k: 'tone', l: '문체', t: 'sel', opts: ['격식 있는 톤', '친근한 톤'], d: '격식 있는 톤' },
      { g: '메시지', k: 'to', l: '받는 분', d: '김철수 부장님' },
      { g: '메시지', k: 'from', l: '보내는 사람', d: '○○상사 임직원 일동' },
      { g: '메시지', k: 'role', l: '새 직책', d: '영업본부장' },
      { g: '메시지', k: 'issueDate', l: '날짜', t: 'date', d: today() },
      { g: '메시지', k: 'message', l: '보낼 문구', t: 'area', d: '영업본부장 취임을 진심으로 축하드립니다.\n그동안 쌓아 오신 경험과 넓은 시야로 조직을 잘 이끌어 주시리라 믿습니다.\n새로운 자리에서도 건강하시고 좋은 일이 가득하길 바랍니다.', w: 2, rows: 5 }
    ],
    blocks: [
      { t: 'amount', v: function (d) { return d.f.to; }, sub: function (d) { return d.f.kind + ' 축하 인사'; } },
      body('message'),
      sec('상황에 맞춘 다른 문구', function (d) {
        return d.f.tone === '친근한 톤'
          ? '· 축하해요! 진짜 잘 어울리는 자리네요. 응원할게요.\n· 고생하셨고, 앞으로가 더 기대됩니다. 축하드려요!'
          : '· 승진을 진심으로 축하드립니다. 그간의 노력이 결실을 맺은 자리라 생각합니다.\n· 새로운 직책에서 더 큰 성과 이루시길 기원합니다.';
      }),
      { t: 'center', v: function (d) { return '— ' + d.f.from + ' —'; } },
      sign(['A'], function (d) { return dko(d.f.issueDate) + ' · ' + d.f.from; }),
      note('※ 승진·취임 인사는 상대의 새 직책을 정확히 쓰는 것이 기본입니다. 축하와 함께 과한 부탁은 넣지 말고, 3~4문장으로 짧게 마무리하세요.')
    ]
  });

  /* ---------------------------------------------------------
     11. 송년·감사 인사
  --------------------------------------------------------- */
  add({
    id: 'thanks-yearend', cat: 'greeting', sub: 'gr-message', no: '03', tpl: 'card',
    name: '송년·감사 인사', en: 'YEAR-END THANKS',
    keywords: '송년 인사 연말 감사 인사 거래처 감사 카드 한 해 마무리',
    head: { sub: 'YEAR-END THANKS', meta: [['작성일', 'issueDate'], ['받는 분', 'to']] },
    parties: [{ k: 'A', label: '보내는 사람', nameKey: 'from' }],
    fields: [
      { g: '메시지', k: 'to', l: '받는 분', d: '김철수 대표님' },
      { g: '메시지', k: 'from', l: '보내는 사람', d: '○○상사 임직원 일동' },
      { g: '메시지', k: 'year', l: '보내는 해', d: '2026' },
      { g: '메시지', k: 'thanks', l: '감사 표현', t: 'area', d: '올 한 해 꾸준히 믿고 맡겨 주셔서 감사했습니다. 어려운 시장에서도 함께 방법을 찾아 주신 덕분에 무사히 한 해를 마칠 수 있었습니다.', w: 2, rows: 3 },
      { g: '메시지', k: 'message', l: '보낼 문구', t: 'area', d: '2026년 한 해 동안 변함없는 신뢰에 감사드립니다.\n보내 주신 기대에 부응하기 위해 내년에도 품질과 납기로 보답하겠습니다.\n따뜻한 연말 보내시고, 새해 복 많이 받으십시오.', w: 2, rows: 4 },
      { g: '메시지', k: 'issueDate', l: '날짜', t: 'date', d: today() }
    ],
    blocks: [
      { t: 'amount', v: 'to', sub: function (d) { return d.f.year + '년 송년 인사'; } },
      body('message'),
      sec('감사 말씀', 'thanks'),
      { t: 'center', v: function (d) { return '— ' + d.f.from + ' —'; } },
      sign(['A'], function (d) { return dko(d.f.issueDate) + ' · ' + d.f.from; }),
      note('※ 거래처 송년 인사는 매출·납기 같은 회사 사정보다, 상대의 한 해를 언급하는 편이 좋습니다. 이메일이면 제목에 회사명과 인사 목적을 넣어 스팸으로 보이지 않게 하세요.')
    ]
  });

  /* ---------------------------------------------------------
     12. 신년 인사·연하장
  --------------------------------------------------------- */
  add({
    id: 'newyear-greeting', cat: 'greeting', sub: 'gr-message', no: '04', tpl: 'card',
    name: '신년 인사·연하장', en: 'NEW YEAR GREETING',
    keywords: '신년 인사 연하장 새해 인사 카드 정초 인사 올해의 계획',
    head: { sub: 'NEW YEAR GREETING', meta: [['작성일', 'issueDate'], ['새해', 'year']] },
    parties: [{ k: 'A', label: '보내는 사람', nameKey: 'from' }],
    fields: [
      { g: '메시지', k: 'year', l: '새해', d: '2027' },
      { g: '메시지', k: 'to', l: '받는 분', d: '김철수 대표님' },
      { g: '메시지', k: 'from', l: '보내는 사람', d: '○○상사 홍길동' },
      { g: '메시지', k: 'ganji', l: '띠·상징', d: '정미년(丁未年), 붉은 양의 해' },
      { g: '메시지', k: 'wish', l: '덕담', t: 'area', d: '하시는 일마다 좋은 결실을 맺으시고, 가정에 웃음이 가득한 한 해가 되시길 바랍니다.', w: 2, rows: 2 },
      { g: '메시지', k: 'message', l: '보낼 문구', t: 'area', d: '2027년 새해가 밝았습니다.\n지난 한 해 보내 주신 신뢰에 감사드리며, 새해에는 더 나은 제품과 서비스로 찾아뵙겠습니다.\n건강과 행운이 함께하시길 기원합니다.', w: 2, rows: 4 },
      { g: '메시지', k: 'issueDate', l: '날짜', t: 'date', d: today() }
    ],
    blocks: [
      { t: 'amount', v: function (d) { return d.f.year + '년 신년 인사'; }, sub: 'ganji' },
      body('message'),
      sec('새해 덕담', 'wish'),
      { t: 'center', v: function (d) { return '— ' + d.f.from + ' —'; } },
      sign(['A'], function (d) { return dko(d.f.issueDate) + ' · ' + d.f.from; }),
      note('※ 연하장은 늦어도 1월 중순까지 보내는 것이 좋습니다. 상대가 종교·명절 문화를 달리하는 경우 “복 많이 받으십시오” 대신 “좋은 한 해 되시길 바랍니다”처럼 중립적인 표현을 쓰세요.')
    ]
  });
})(typeof window !== 'undefined' ? window : this);
