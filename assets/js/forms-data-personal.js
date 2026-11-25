/* =========================================================
   INSIGHT BRIEF — 이력·자소서, 인사말·카드, 영문서식
   키워드 이력서, 경력기술서, 직무수행계획서, 경조 카드, 문자 인사말,
   영문 이력서·인보이스·예산표·등본 참고 양식. 문구는 자체 제작.
   ========================================================= */
(function (root) {
  'use strict';
  var H = root.IBF;
  var DOCS = root.IBF_DOCS;
  var esc = H.esc, fmt = H.fmt, fmt1 = H.fmt1, won = H.won, kor = H.korMoneyFull, dko = H.dateKo, today = H.todayISO, sum = H.setSum, vat = H.vat, addD = H.addDays;
  function add(d) { DOCS[d.id] = d; return d; }

  /* ---------------------------------------------------------
     1. 키워드 이력서
  --------------------------------------------------------- */
  add({
    id: 'cv-keyword', cat: 'resume', sub: 'rs-cv', no: '01', tpl: 'resume',
    name: '키워드 이력서', en: 'KEYWORD RESUME',
    keywords: '이력서 키워드 이력서 경력 학력 자격 핵심역량 채용 지원',
    head: { sub: 'RESUME', meta: [['작성일', 'issueDate'], ['지원 직무', 'job']] },
    parties: [{ k: 'A', label: '작성자', nameKey: 'name' }],
    fields: [
      { g: '인적 사항', k: 'name', l: '성명', d: '홍길동' },
      { g: '인적 사항', k: 'job', l: '지원 직무', d: '물류 운영 / 수입 통관' },
      { g: '인적 사항', k: 'birth', l: '생년월일', d: '1988-03-15' },
      { g: '인적 사항', k: 'phone', l: '연락처', d: '010-0000-0000' },
      { g: '인적 사항', k: 'email', l: '이메일', d: 'hong@example.com' },
      { g: '인적 사항', k: 'addr', l: '거주지', d: '서울특별시 영등포구', w: 2 },
      { g: '인적 사항', k: 'link', l: '포트폴리오·링크', d: 'github.com/example', w: 2 },
      { g: '핵심', k: 'keywords', l: '핵심 키워드 (쉼표로 구분)', d: '수입통관, 재고관리, 원가계산, 거래처 협상, 엑셀 자동화, 물류비 절감', w: 2 },
      { g: '핵심', k: 'summary', l: '한 줄 소개', d: '10년간 플라스틱 원료 수입·재고·납기를 관리하며 거래처 20곳의 공급을 안정화한 물류 운영 담당입니다.', w: 2, rows: 3 },
      { g: '핵심', k: 'strength', l: '강점 3가지', t: 'area', d: '1) 수입 통관 서류를 직접 확인해 통관 지연을 줄입니다.\n2) 재고 회전과 안전재고를 엑셀로 관리해 결품을 막습니다.\n3) 거래처·포워더와 협상해 물류비를 톤당 3,000원 절감했습니다.', w: 2, rows: 3 },
      { g: '기타', k: 'issueDate', l: '작성일', t: 'date', d: today() }
    ],
    sets: [
      {
        k: 'career', label: '경력', addLabel: '경력 추가',
        cols: [
          { k: 'period', h: '기간', w: '26%', d: '2019.03 ~ 2026.06' },
          { k: 'company', h: '회사', w: '26%', d: '○○상사' },
          { k: 'role', h: '직무', w: '20%', d: '수입·물류 담당' },
          { k: 'task', h: '주요 업무', w: '28%', d: '수입 발주·통관·재고·납기 관리' }
        ],
        def: [
          { period: '2019.03 ~ 2026.06', company: '○○상사', role: '수입·물류 담당', task: '수입 발주·통관·재고·납기 관리' },
          { period: '2015.04 ~ 2019.02', company: '△△물산', role: '영업 지원', task: '거래처 주문·납품 일정 조율' }
        ]
      },
      {
        k: 'edu', label: '학력·자격', addLabel: '항목 추가',
        cols: [
          { k: 'kind', h: '구분', w: '16%', d: '자격' },
          { k: 'name', h: '내용', w: '52%', d: '무역관리사 2급' },
          { k: 'date', h: '취득·졸업', w: '32%', d: '2018.11' }
        ],
        def: [
          { kind: '자격', name: '무역관리사 2급', date: '2018.11' },
          { kind: '자격', name: '컴퓨터활용능력 1급', date: '2016.05' },
          { kind: '학력', name: '○○대학교 경영학과 졸업', date: '2013.02' }
        ]
      }
    ],
    blocks: [
      { t: 'kv', rows: [['성명', 'name'], ['지원 직무', 'job'], ['생년월일', 'birth'], ['연락처', 'phone'], ['이메일', 'email'], ['거주지', 'addr'], ['링크', 'link']] },
      { t: 'sec', h: '한 줄 소개', v: 'summary' },
      { t: 'sec', h: '핵심 키워드', v: 'keywords' },
      { t: 'sec', h: '강점', v: 'strength' },
      { t: 'table', set: 'career', empty: 2, head: ['기간', '회사', '직무', '주요 업무'], cols: [
        { k: 'period', h: '기간', t: 'center' }, { k: 'company', h: '회사' }, { k: 'role', h: '직무' }, { k: 'task', h: '주요 업무' }
      ] },
      { t: 'table', set: 'edu', empty: 2, head: ['구분', '내용', '시기'], cols: [
        { k: 'kind', h: '구분', t: 'center' }, { k: 'name', h: '내용' }, { k: 'date', h: '시기', t: 'center' }
      ] },
      { t: 'note', v: function () { return '※ 채용 공고의 필수·우대 키워드를 그대로 넣으면 서류 검색에 걸릴 확률이 높아집니다. 다만 실제 경험과 다른 키워드는 면접에서 드러나므로, 경험과 연결된 것만 쓰세요.'; } }
    ]
  });

  /* ---------------------------------------------------------
     2. 경력기술서
  --------------------------------------------------------- */
  function careerBlocks(n) {
    var out = [{ t: 'body', v: function (d) { return d.f.name + ' · ' + d.f.job + '\n' + d.f.phone + ' · ' + d.f.email; } }];
    for (var i = 1; i <= n; i++) {
      out.push({ t: 'kv', rows: [['회사', 'c' + i + 'Company'], ['기간', 'c' + i + 'Period'], ['직위·직무', 'c' + i + 'Role']] });
      out.push({ t: 'sec', h: '담당 업무', v: 'c' + i + 'Task' });
      out.push({ t: 'sec', h: '성과', v: 'c' + i + 'Result' });
    }
    out.push({ t: 'sec', h: '보유 역량', v: 'skill' });
    return out;
  }
  add({
    id: 'career-desc', cat: 'resume', sub: 'rs-career', no: '01', tpl: 'doc',
    name: '경력기술서', en: 'CAREER DESCRIPTION',
    keywords: '경력기술서 경력 상세 담당업무 성과 이직 지원 경력직',
    head: { sub: 'CAREER DESCRIPTION', meta: [['작성일', 'issueDate'], ['지원 직무', 'job']] },
    parties: [{ k: 'A', label: '작성자', nameKey: 'name' }],
    fields: [
      { g: '인적 사항', k: 'name', l: '성명', d: '홍길동' },
      { g: '인적 사항', k: 'job', l: '지원 직무', d: '수입·물류 운영' },
      { g: '인적 사항', k: 'phone', l: '연락처', d: '010-0000-0000' },
      { g: '인적 사항', k: 'email', l: '이메일', d: 'hong@example.com' },
      { g: '인적 사항', k: 'issueDate', l: '작성일', t: 'date', d: today() },
      { g: '경력 1', k: 'c1Company', l: '회사', d: '○○상사' },
      { g: '경력 1', k: 'c1Period', l: '기간', d: '2019.03 ~ 2026.06' },
      { g: '경력 1', k: 'c1Role', l: '직위·직무', d: '과장 / 수입·물류' },
      { g: '경력 1', k: 'c1Task', l: '담당 업무', t: 'area', d: '· 플라스틱 재생원료 수입 발주와 통관 진행\n· 규격별 재고·안전재고 관리, 월별 발주 계획 수립\n· 포워더·관세사와 운임·통관 조건 협의\n· 거래처 납기 조율과 클레임 대응', w: 2, rows: 4 },
      { g: '경력 1', k: 'c1Result', l: '성과 (숫자로)', t: 'area', d: '· 통관 서류 사전 점검으로 평균 통관 기간을 4일에서 2.5일로 단축\n· 안전재고 기준을 정해 결품 클레임 60% 감소\n· 물류비 톤당 3,000원 절감(연 3,600만원 상당)\n· 거래처 20곳 공급 유지, 연 매출 30% 성장에 기여', w: 2, rows: 4 },
      { g: '경력 2', k: 'c2Company', l: '회사', d: '△△물산' },
      { g: '경력 2', k: 'c2Period', l: '기간', d: '2015.04 ~ 2019.02' },
      { g: '경력 2', k: 'c2Role', l: '직위·직무', d: '대리 / 영업 지원' },
      { g: '경력 2', k: 'c2Task', l: '담당 업무', t: 'area', d: '· 거래처 주문 접수와 납품 일정 조율\n· 견적서·거래명세서 작성 및 정산\n· 재고 실사와 월말 마감 지원', w: 2, rows: 3 },
      { g: '경력 2', k: 'c2Result', l: '성과 (숫자로)', t: 'area', d: '· 납기 지연 건을 3개월간 월 12건에서 3건으로 감소\n· 견적·정산 서식을 표준화해 월 마감 시간 8시간 단축', w: 2, rows: 3 },
      { g: '역량', k: 'skill', l: '보유 역량·도구', t: 'area', d: '· 엑셀(피벗·함수) 재고·원가 관리, ERP(○○) 사용\n· 수입 통관 서류(CI·PL·B/L) 검토\n· 영어 이메일 업무 소통', w: 2, rows: 3 }
    ],
    blocks: careerBlocks(2).concat([
      { t: 'note', v: function () { return '※ 경력기술서는 "무엇을 했는지"보다 "무엇이 달라졌는지"를 숫자로 쓰는 것이 핵심입니다. 매출·기간·건수·비율 중 하나는 넣고, 본인 기여 범위를 정확히 밝히세요.'; } }
    ])
  });

  /* ---------------------------------------------------------
     3. 직무수행계획서
  --------------------------------------------------------- */
  add({
    id: 'job-plan', cat: 'resume', sub: 'rs-career', no: '02', tpl: 'plan',
    name: '직무수행계획서', en: 'JOB PERFORMANCE PLAN',
    keywords: '직무수행계획서 직무 계획 지원동기 공공기관 채용 업무계획 성과목표',
    head: { sub: 'JOB PERFORMANCE PLAN', meta: [['작성일', 'issueDate'], ['지원 직무', 'job']] },
    parties: [{ k: 'A', label: '작성자', nameKey: 'name' }],
    fields: [
      { g: '기본', k: 'name', l: '성명', d: '홍길동' },
      { g: '기본', k: 'job', l: '지원 직무', d: '물류 운영 담당' },
      { g: '기본', k: 'org', l: '지원 기관·회사', d: '○○공사 물류지원팀' },
      { g: '기본', k: 'issueDate', l: '작성일', t: 'date', d: today() },
      { g: '내용', k: 'motive', l: '1. 지원 동기', t: 'area', d: '10년간 수입 원료의 통관·재고·납기를 관리하며, 현장의 작은 지연이 거래처 생산에 큰 영향을 준다는 것을 배웠습니다. 이 경험을 살려 공공 물류의 안정성을 높이고 싶어 지원했습니다.', w: 2, rows: 4 },
      { g: '내용', k: 'understanding', l: '2. 직무 이해', t: 'area', d: '이 직무는 입고·출고·재고의 정확성과 납기 준수가 핵심입니다. 이를 위해 ① 기준(안전재고·검수 기준) ② 기록(입출고 이력) ③ 소통(운송사·현장) 세 가지가 함께 움직여야 합니다.', w: 2, rows: 4 },
      { g: '내용', k: 'goal', l: '3. 수행 목표', t: 'area', d: '· 3개월: 입출고 절차와 재고 기준 파악, 오류 원인 목록화\n· 6개월: 안전재고·검수 기준 정비, 월별 재고 정확도 98% 달성\n· 1년: 납기 준수율 95% 이상, 물류비 5% 절감', w: 2, rows: 4 },
      { g: '내용', k: 'plan', l: '4. 추진 계획', t: 'area', d: '1) 현장 업무를 직접 따라 하며 병목 지점을 기록합니다.\n2) 엑셀·시스템으로 재고·납기 지표를 주간 단위로 관리합니다.\n3) 운송사와 정기 협의체를 만들어 지연 사유를 공유합니다.\n4) 월 1회 개선 결과를 팀에 공유하고 절차에 반영합니다.', w: 2, rows: 5 },
      { g: '내용', k: 'contribution', l: '5. 기여 방안', t: 'area', d: '수입 통관 서류와 재고 관리 경험으로 서류 오류와 결품을 줄이고, 표준 서식을 만들어 팀 전체가 같은 기준으로 일하도록 돕겠습니다.', w: 2, rows: 3 }
    ],
    sets: [{
      k: 'kpi', label: '성과 지표', addLabel: '지표 추가',
      cols: [
        { k: 'name', h: '지표', w: '40%', d: '재고 정확도' },
        { k: 'target', h: '목표', w: '20%', d: '98%' },
        { k: 'by', h: '시점', w: '18%', d: '6개월' },
        { k: 'how', h: '측정 방법', w: '22%', d: '월말 실사' }
      ],
      def: [
        { name: '재고 정확도', target: '98%', by: '6개월', how: '월말 실사' },
        { name: '납기 준수율', target: '95%', by: '1년', how: '납기 대장' },
        { name: '물류비 절감', target: '5%', by: '1년', how: '월별 정산' }
      ]
    }],
    blocks: [
      { t: 'kv', rows: [['성명', 'name'], ['지원 직무', 'job'], ['지원 기관', 'org'], ['작성일', 'issueDate']] },
      { t: 'sec', h: '1. 지원 동기', v: 'motive' },
      { t: 'sec', h: '2. 직무 이해', v: 'understanding' },
      { t: 'sec', h: '3. 수행 목표', v: 'goal' },
      { t: 'sec', h: '4. 추진 계획', v: 'plan' },
      { t: 'table', set: 'kpi', empty: 2, head: ['성과 지표', '목표', '시점', '측정 방법'], cols: [
        { k: 'name', h: '성과 지표' }, { k: 'target', h: '목표', t: 'center' }, { k: 'by', h: '시점', t: 'center' }, { k: 'how', h: '측정 방법' }
      ] },
      { t: 'sec', h: '5. 기여 방안', v: 'contribution' },
      { t: 'note', v: function () { return '※ 직무수행계획서는 "앞으로 무엇을 어떻게 하겠다"에 집중합니다. 채용 공고의 직무 설명에 나온 업무를 하나씩 풀어 목표·측정 방법으로 바꾸면 평가자가 읽기 쉽습니다.'; } }
    ]
  });

  /* ---------------------------------------------------------
     4. 인사말 문구 은행
  --------------------------------------------------------- */
  var SIT = {
    '감사': {
      ko: 'THANK YOU', en: '감사',
      formal: [
        '보내 주신 마음 깊이 감사드립니다. 덕분에 큰 힘을 얻었습니다.',
        '바쁘신 중에도 잊지 않고 챙겨 주셔서 진심으로 감사합니다.',
        '평소 베풀어 주신 도움에 어떻게 보답할지 늘 생각하고 있습니다. 감사합니다.'
      ],
      casual: [
        '덕분에 잘 마쳤어! 정말 고마워.',
        '챙겨 줘서 고마워. 다음엔 내가 한턱 쏠게.',
        '네 덕분이야. 진짜 고맙다!'
      ]
    },
    '축하': {
      ko: 'CONGRATULATIONS', en: '축하',
      formal: [
        '진심으로 축하드립니다. 그동안의 노력이 결실을 맺었네요.',
        '새로운 출발을 축하드립니다. 앞날에 좋은 일만 가득하길 바랍니다.',
        '합격 소식 들었습니다. 축하드리고, 더 큰 성취를 응원합니다.'
      ],
      casual: [
        '축하해! 진짜 잘됐다.',
        '드디어 해냈네. 축하축하!',
        '네가 해낼 줄 알았어. 축하해!'
      ]
    },
    '결혼': {
      ko: 'WEDDING', en: '결혼',
      formal: [
        '두 분의 앞날에 행복과 평안이 가득하기를 진심으로 바랍니다.',
        '결혼을 진심으로 축하드립니다. 서로 아끼고 배려하는 가정 이루시길 바랍니다.',
        '아름다운 시작을 축하드립니다. 늘 건강하고 행복하세요.'
      ],
      casual: [
        '결혼 진심으로 축하해! 두 사람 다 행복해 보여서 좋다.',
        '축하해~ 이제 유부남/유부녀네. 행복하게 살아!',
        '너네 둘 정말 잘 어울려. 축하한다!'
      ]
    },
    '출산': {
      ko: 'NEW BABY', en: '출산',
      formal: [
        '출산을 진심으로 축하드립니다. 산모와 아이 모두 건강하길 바랍니다.',
        '새 생명을 맞이하신 것을 축하드립니다. 가정에 기쁨이 가득하시길요.',
        '아이의 첫걸음과 함께 행복한 날들이 이어지길 바랍니다.'
      ],
      casual: [
        '출산 축하해! 아기 너무 귀엽다.',
        '축하해~ 산모 몸조리 잘 하고!',
        '이제 아빠/엄마구나. 축하해!'
      ]
    },
    '개업': {
      ko: 'NEW BUSINESS', en: '개업',
      formal: [
        '개업을 진심으로 축하드립니다. 번창하시길 기원합니다.',
        '새 출발을 축하드립니다. 좋은 손님과 함께 크게 성장하시길 바랍니다.',
        '오랜 준비의 결실을 축하드립니다. 하는 일마다 잘되시길요.'
      ],
      casual: [
        '개업 축하해! 꼭 방문할게.',
        '드디어 문 열었구나. 번창해!',
        '축하해~ 입소문 내가 낼게.'
      ]
    },
    '조문': {
      ko: 'CONDOLENCE', en: '깊은 위로',
      formal: [
        '무거운 마음으로 위로의 말씀을 드립니다. 고인의 명복을 빕니다.',
        '갑작스러운 소식에 마음이 무겁습니다. 유족께서 힘을 내시길 바랍니다.',
        '고인의 명복을 빕니다. 조용히 마음을 함께하겠습니다.'
      ],
      casual: [
        '슬픈 소식에 마음이 무겁다. 힘내시라고 꼭 전해 줘.',
        '얼마나 마음이 아프실까. 옆에 있어 줄게.',
        '따뜻한 한마디라도 전하고 싶어서 연락했어.'
      ]
    },
    '신년': {
      ko: 'NEW YEAR', en: '새해',
      formal: [
        '새해에도 건강과 행운이 가득하시길 바랍니다. 새해 복 많이 받으세요.',
        '보내주신 한 해 감사했습니다. 새해에는 하시는 일 모두 잘되시길요.',
        '새해 복 많이 받으시고, 가정에 평안이 가득하길 바랍니다.'
      ],
      casual: [
        '새해 복 많이 받아! 올 한 해도 잘 부탁해.',
        '해피 뉴 이어~ 복 많이 받고!',
        '새해엔 좋은 일만 가득하자!'
      ]
    },
    '이사': {
      ko: 'NEW HOME', en: '이사',
      formal: [
        '이사를 진심으로 축하드립니다. 새 보금자리에서 편안히 지내시길 바랍니다.',
        '새 집에서의 시작을 축하드립니다. 늘 건강하고 평안하시길요.',
        '이사 소식 들었습니다. 새 집에서 좋은 일만 가득하시길 바랍니다.'
      ],
      casual: [
        '이사 축하해! 집들이 하면 불러줘.',
        '새집 좋다~ 축하해!',
        '이사했구나! 이사 끝나면 놀러 갈게.'
      ]
    }
  };
  function sitOf(name) { return SIT[name] || SIT['감사']; }
  function sitNames() { return Object.keys(SIT); }
  /* 상황·문체를 바꾸면 카드 문구를 그 상황의 첫 추천문으로 바꿔 줍니다. */
  function greetOnChange(key, d) {
    if (key !== 'situation' && key !== 'tone') return null;
    var s = sitOf(d.f.situation);
    var tone = d.f.tone === '친근한 톤' ? 'casual' : 'formal';
    return { message: s[tone][0] };
  }

  /* ---------------------------------------------------------
     5. 상황별 경조·행사 카드
  --------------------------------------------------------- */
  function greetRaw(d) {
    var f = d.f;
    var s = sitOf(f.situation);
    var tone = f.tone === '친근한 톤' ? 'casual' : 'formal';
    var list = s[tone];
    var h = '<div class="fm-greet" id="fm-greet">';
    h += '<div class="gk">' + esc(s.ko) + ' · ' + esc(f.situation || '') + '</div>';
    h += '<div class="gt">' + esc(f.to || '받는 분') + '</div>';
    h += '<div class="gm">' + (esc(f.message || '') || '문구를 입력하세요.') + '</div>';
    h += '<div class="gf">' + esc(f.from || '보내는 사람') + '</div>';
    h += '<div class="gf" style="margin-top:4px;font-size:11px;color:#8c8a86">' + esc(dko(f.issueDate)) + '</div>';
    h += '</div>';
    h += '<div class="fm-sugg fm-noprint"><span class="k">문구 추천 · ' + esc(f.situation || '') + ' / ' + esc(f.tone || '격식 있는 톤') + ' (눌러서 복사해 위 문구란에 붙여 넣으세요)</span>';
    list.forEach(function (m) { h += '<p>' + esc(m) + '</p>'; });
    h += '</div>';
    h += '<div class="fm-note">※ 카드 문구는 자체 작성한 예시입니다. 받는 분과의 관계·상황에 맞게 고쳐 쓰세요. 경조 문구는 짧고 담백할수록 좋고, 조문에는 이모지·감탄사를 쓰지 않는 것이 예의입니다.</div>';
    return h;
  }
  add({
    id: 'greet-event', cat: 'greeting', sub: 'gr-event', no: '01', tpl: 'card',
    name: '상황별 인사말·경조 카드', en: 'GREETING CARD',
    keywords: '인사말 경조 카드 축하 감사 조문 결혼 출산 개업 신년 이사 카드 문구',
    raw: greetRaw,
    onChange: greetOnChange,
    fields: [
      { g: '카드', k: 'situation', l: '상황', t: 'sel', opts: sitNames(), d: '축하' },
      { g: '카드', k: 'tone', l: '문체', t: 'sel', opts: ['격식 있는 톤', '친근한 톤'], d: '격식 있는 톤' },
      { g: '카드', k: 'to', l: '받는 분', d: '김철수 님' },
      { g: '카드', k: 'from', l: '보내는 사람', d: '홍길동' },
      { g: '카드', k: 'issueDate', l: '날짜', t: 'date', d: today() },
      { g: '문구', k: 'message', l: '카드에 넣을 문구', t: 'area', d: '새로운 출발을 진심으로 축하드립니다.\n앞날에 좋은 일만 가득하길 바랍니다.', w: 2, rows: 5 }
    ]
  });

  /* ---------------------------------------------------------
     6. 문자·감사 인사말
  --------------------------------------------------------- */
  function smsRaw(d) {
    var f = d.f;
    var s = sitOf(f.situation);
    var tone = f.tone === '친근한 톤' ? 'casual' : 'formal';
    var also = tone === 'casual' ? 'formal' : 'casual';
    var h = '<div class="msg2" id="msg2">';
    h += '<div class="msg2-h"><span class="k">MESSAGE</span><h2>' + esc(f.situation || '') + ' 인사말</h2>' +
      '<div class="msg2-sub">' + esc(f.to || '') + ' · ' + esc(f.channel || '') + '</div></div>';
    h += '<div class="msg2-final"><span class="lb">보낼 문구</span><div class="v">' + (esc(f.message || '') || '아래 추천 문구에서 골라 붙여 넣으세요.') + '</div></div>';
    h += '<div class="msg2-sugg"><span class="k">추천 · ' + esc(f.tone || '') + '</span>';
    s[tone].forEach(function (m) { h += '<p>' + esc(m) + '</p>'; });
    h += '<span class="k" style="margin-top:8px">추천 · ' + (tone === 'casual' ? '격식 있는 톤' : '친근한 톤') + '</span>';
    s[also].forEach(function (m) { h += '<p>' + esc(m) + '</p>'; });
    h += '</div>';
    h += '<div class="fm-note">※ 문자·카톡은 첫 문장에 용건이 보이게 쓰고, 3~4문장을 넘기지 않는 것이 좋습니다. 경조 알림은 상대가 답장을 부담스러워하지 않도록 마무리 문장을 짧게 두세요.</div>';
    h += '</div>';
    return h;
  }
  add({
    id: 'greet-sms', cat: 'greeting', sub: 'gr-message', no: '01', tpl: 'card',
    name: '문자·카톡 인사말 생성기', en: 'MESSAGE WRITER',
    keywords: '인사말 문자 카톡 감사 축하 조문 위로 문구 생성기 부고 안내',
    raw: smsRaw,
    onChange: greetOnChange,
    fields: [
      { g: '메시지', k: 'situation', l: '상황', t: 'sel', opts: sitNames(), d: '감사' },
      { g: '메시지', k: 'tone', l: '문체', t: 'sel', opts: ['격식 있는 톤', '친근한 톤'], d: '친근한 톤' },
      { g: '메시지', k: 'channel', l: '보낼 곳', t: 'sel', opts: ['문자(SMS)', '카카오톡', '업무 메신저', '이메일'], d: '카카오톡' },
      { g: '메시지', k: 'to', l: '받는 사람', d: '김철수 대표님' },
      { g: '메시지', k: 'message', l: '보낼 문구', t: 'area', d: '덕분에 잘 마쳤습니다. 챙겨 주셔서 정말 감사합니다.', w: 2, rows: 5 }
    ]
  });

  /* ---------------------------------------------------------
     7. 영문 이력서 (Resume)
  --------------------------------------------------------- */
  add({
    id: 'en-resume', cat: 'en', sub: 'en-hire', no: '01', tpl: 'resume',
    name: '영문 이력서 (Resume)', en: 'RESUME',
    keywords: '영문 이력서 resume CV 영문 자소서 해외취업 커버레터 영문 경력',
    head: { sub: 'RESUME / CURRICULUM VITAE', meta: [['Date', 'issueDate']] },
    parties: [{ k: 'A', label: 'Applicant', nameKey: 'name' }],
    fields: [
      { g: 'Contact', k: 'name', l: 'Full name', d: 'Hong Gil-dong' },
      { g: 'Contact', k: 'title', l: 'Target role', d: 'Import & Logistics Specialist' },
      { g: 'Contact', k: 'phone', l: 'Phone', d: '+82-10-0000-0000' },
      { g: 'Contact', k: 'email', l: 'Email', d: 'hong@example.com' },
      { g: 'Contact', k: 'addr', l: 'Location', d: 'Seoul, Republic of Korea', w: 2 },
      { g: 'Contact', k: 'link', l: 'LinkedIn / Portfolio', d: 'linkedin.com/in/example', w: 2 },
      { g: 'Contact', k: 'issueDate', l: 'Date', t: 'date', d: today() },
      { g: 'Summary', k: 'summary', l: 'Professional summary', t: 'area', d: 'Import and logistics specialist with 10 years of experience in plastic raw material trading. Reduced customs clearance time by 40% and cut freight cost per ton by 3,000 KRW through supplier and forwarder negotiations.', w: 2, rows: 4 },
      { g: 'Skills', k: 'skills', l: 'Core skills', t: 'area', d: 'Import customs documentation (CI / PL / B/L), inventory planning, cost analysis, Excel automation, vendor negotiation, English business correspondence', w: 2, rows: 3 },
      { g: 'Education', k: 'edu', l: 'Education', t: 'area', d: 'B.A. in Business Administration, OO University, 2013', w: 2, rows: 2 },
      { g: 'Certificates', k: 'cert', l: 'Certifications / Languages', t: 'area', d: 'Trade Management Level 2 (2018) · Computer Proficiency Level 1 (2016) · English: business working proficiency', w: 2, rows: 2 }
    ],
    sets: [{
      k: 'exp', label: 'Experience', addLabel: 'Add experience',
      cols: [
        { k: 'period', h: 'Period', w: '22%', d: '2019.03 – 2026.06' },
        { k: 'company', h: 'Company', w: '24%', d: 'OO Trading Co., Ltd.' },
        { k: 'role', h: 'Role', w: '24%', d: 'Import & Logistics Manager' },
        { k: 'detail', h: 'Achievements', w: '30%', d: 'Managed customs clearance for 300 tons/month; cut clearance lead time from 4 to 2.5 days.' }
      ],
      def: [
        { period: '2019.03 – 2026.06', company: 'OO Trading Co., Ltd.', role: 'Import & Logistics Manager', detail: 'Managed customs clearance for 300 tons/month; cut clearance lead time from 4 to 2.5 days.' },
        { period: '2015.04 – 2019.02', company: 'DD Trading', role: 'Sales Support', detail: 'Coordinated orders and delivery schedules for 20 accounts; standardized quotation and settlement templates.' }
      ]
    }],
    blocks: [
      { t: 'body', v: function (d) { return d.f.name; } },
      { t: 'center', cls: 'fm-doc-sub', v: function (d) { return d.f.title + ' · ' + d.f.phone + ' · ' + d.f.email + ' · ' + d.f.addr; } },
      { t: 'sec', h: 'PROFESSIONAL SUMMARY', v: 'summary' },
      { t: 'table', set: 'exp', empty: 2, head: ['Period', 'Company', 'Role', 'Achievements'], cols: [
        { k: 'period', h: 'Period', t: 'center' }, { k: 'company', h: 'Company' }, { k: 'role', h: 'Role' }, { k: 'detail', h: 'Achievements' }
      ] },
      { t: 'sec', h: 'CORE SKILLS', v: 'skills' },
      { t: 'sec', h: 'EDUCATION', v: 'edu' },
      { t: 'sec', h: 'CERTIFICATIONS & LANGUAGES', v: 'cert' },
      { t: 'note', v: function () { return '※ 영문 이력서는 사진·주민번호·혼인 여부를 쓰지 않는 것이 일반적입니다. 성과는 "동사 + 결과 + 숫자" 순서로 쓰고, 지원하는 회사·직무의 영어 표현을 그대로 맞추면 검색에 유리합니다.'; } }
    ]
  });

  /* ---------------------------------------------------------
     8. 영문 인보이스 (Commercial Invoice)
  --------------------------------------------------------- */
  add({
    id: 'en-invoice', cat: 'en', sub: 'en-trade', no: '01', tpl: 'invoice',
    name: '영문 인보이스 (Commercial Invoice)', en: 'COMMERCIAL INVOICE',
    keywords: '영문 인보이스 commercial invoice 상업송장 수출 수입 invoice CI 관세 통관',
    head: { sub: 'COMMERCIAL INVOICE', meta: [['Invoice No.', 'invNo'], ['Date', 'issueDate'], ['Incoterms', 'incoterms']] },
    parties: [{ k: 'A', label: 'Seller', nameKey: 'sellerRep' }, { k: 'B', label: 'Buyer', nameKey: 'buyerRep' }],
    fields: [
      { g: 'Invoice', k: 'invNo', l: 'Invoice No.', d: 'CI-2026-1123-01' },
      { g: 'Invoice', k: 'issueDate', l: 'Date', t: 'date', d: today() },
      { g: 'Invoice', k: 'contractNo', l: 'Contract / PO No.', d: 'PO-2026-1101' },
      { g: 'Invoice', k: 'incoterms', l: 'Incoterms', t: 'sel', opts: ['FOB BUSAN', 'CIF NANSHA', 'CFR', 'EXW', 'DAP'], d: 'FOB BUSAN' },
      { g: 'Seller', k: 'seller', l: 'Seller', d: 'Hanbit Trading Co., Ltd.' },
      { g: 'Seller', k: 'sellerRep', l: 'Representative', d: 'Hong Gil-dong' },
      { g: 'Seller', k: 'sellerAddr', l: 'Address', t: 'area', d: '120, Nadong-daero, Sasang-gu, Busan, Korea', w: 2, rows: 2 },
      { g: 'Seller', k: 'sellerTel', l: 'Tel / Email', d: '+82-53-000-0000 · sales@example.com' },
      { g: 'Seller', k: 'sellerTax', l: 'Business No.', d: '000-00-00000' },
      { g: 'Buyer', k: 'buyer', l: 'Buyer', d: 'Guangzhou Sunrise Plastics Co., Ltd.' },
      { g: 'Buyer', k: 'buyerRep', l: 'Contact', d: 'Mr. Wang' },
      { g: 'Buyer', k: 'buyerAddr', l: 'Address', t: 'area', d: 'No. 88, Huangpu East Road, Guangzhou, China', w: 2, rows: 2 },
      { g: 'Shipping', k: 'vessel', l: 'Vessel / Voyage', d: 'HANJIN BUSAN / 0234E' },
      { g: 'Shipping', k: 'pol', l: 'Port of Loading', d: 'BUSAN, KOREA' },
      { g: 'Shipping', k: 'pod', l: 'Port of Discharge', d: 'NANSHA, CHINA' },
      { g: 'Shipping', k: 'etd', l: 'ETD', t: 'date', d: addD(today(), 7) },
      { g: 'Payment', k: 'payTerms', l: 'Payment terms', d: 'T/T 30 days after B/L date' },
      { g: 'Payment', k: 'currency', l: 'Currency', d: 'USD' },
      { g: 'Payment', k: 'bank', l: 'Bank details', t: 'area', d: 'Bank: OO Bank, Busan Branch\nAccount: 000-000-000000\nSWIFT: EXAMPLEKRSE\nBeneficiary: Hanbit Trading Co., Ltd.', w: 2, rows: 3 },
      { g: 'Notes', k: 'noteText', l: 'Remarks', t: 'area', d: 'Country of origin: Republic of Korea. Packed in 20 cartons per container. Goods are of Korean origin and produced from recycled materials.', w: 2, rows: 3 }
    ],
    sets: [{
      k: 'rows', label: 'Line items', addLabel: 'Add item',
      cols: [
        { k: 'name', h: 'Description', w: '38%', d: 'Recycled Polycarbonate Pellets' },
        { k: 'hs', h: 'HS Code', w: '14%', d: '3907.40' },
        { k: 'qty', h: 'Qty (kg)', t: 'num', w: '16%', d: '10000' },
        { k: 'price', h: 'Unit price', t: 'num', w: '16%', d: '1.15' },
        { k: 'amount', h: 'Amount', t: 'num', w: '16%', calc: function (r) { return H.num(r.qty) * H.num(r.price); } }
      ],
      def: [
        { name: 'Recycled Polycarbonate Pellets', hs: '3907.40', qty: '10000', price: '1.15' },
        { name: 'Recycled ABS Pellets', hs: '3903.30', qty: '10000', price: '0.98' }
      ]
    }],
    blocks: [
      { t: 'parties', cols: [
        { title: 'Seller', rows: [['Company', 'seller'], ['Representative', 'sellerRep'], ['Address', 'sellerAddr'], ['Tel / Email', 'sellerTel'], ['Business No.', 'sellerTax']] },
        { title: 'Buyer', rows: [['Company', 'buyer'], ['Contact', 'buyerRep'], ['Address', 'buyerAddr']] }
      ] },
      { t: 'kv', rows: [['Contract / PO No.', 'contractNo'], ['Incoterms', 'incoterms'], ['Vessel / Voyage', 'vessel'], ['Port of Loading', 'pol'], ['Port of Discharge', 'pod'], ['ETD', 'etd'], ['Payment terms', 'payTerms']] },
      { t: 'table', set: 'rows', empty: 2, head: ['Description', 'HS Code', 'Qty (kg)', 'Unit price', 'Amount'], cols: [
        { k: 'name', h: 'Description' }, { k: 'hs', h: 'HS Code', t: 'center' },
        { k: 'qty', h: 'Qty (kg)', t: 'num' }, { k: 'price', h: 'Unit price', t: 'num' },
        { k: 'amount', h: 'Amount', t: 'num', calc: function (r) { return H.num(r.qty) * H.num(r.price); } }
      ] },
      { t: 'sums', rows: [
        { l: 'Total value', v: function (d) { return fmt1(sum(d, 'rows', 'amount')); }, text: true },
        { l: 'Total amount', v: function (d) { return d.f.currency + ' ' + fmt1(sum(d, 'rows', 'amount')); }, text: true, grand: true }
      ] },
      { t: 'amount', v: function (d) { return d.f.currency + ' ' + fmt1(sum(d, 'rows', 'amount')); }, sub: function (d) { return d.f.incoterms + ' · payment ' + d.f.payTerms; } },
      { t: 'sec', h: 'Bank details', v: 'bank' },
      { t: 'sec', h: 'Remarks', v: 'noteText' },
      { t: 'sign', parties: ['A', 'B'], note: function () { return 'For and on behalf of the Seller. Buyer signature is for confirmation of the invoice contents.'; } },
      { t: 'note', v: function () { return '※ The description, quantity, and value on this invoice must match the packing list and the B/L exactly. HS codes and origin statements are the exporter’s responsibility; confirm duty rates and FTA eligibility with a customs broker.'; } }
    ]
  });

  /* ---------------------------------------------------------
     9. 영문 예산표 (Budget)
  --------------------------------------------------------- */
  add({
    id: 'en-budget', cat: 'en', sub: 'en-trade', no: '02', kind: 'excel',
    name: '영문 예산표 (Budget)', en: 'BUDGET PLAN',
    keywords: '영문 예산표 budget 예산 계획 집행 실적 차이 variance 영문 재무',
    fields: [
      { g: 'Document', k: 'docName', l: 'Title', d: 'Q4 2026 Marketing Budget' },
      { g: 'Document', k: 'period', l: 'Period', d: '2026-10-01 – 2026-12-31' },
      { g: 'Document', k: 'dept', l: 'Department', d: 'Marketing' },
      { g: 'Document', k: 'writer', l: 'Prepared by', d: 'Hong Gil-dong' },
      { g: 'Document', k: 'currency', l: 'Currency', d: 'KRW' }
    ],
    sets: [{
      k: 'rows', label: 'Budget lines', addLabel: 'Add line',
      cols: [
        { k: 'cat', h: 'Category', w: '26%', d: 'Online ads' },
        { k: 'item', h: 'Item', w: '34%', d: 'Search & display ads' },
        { k: 'plan', h: 'Planned', t: 'num', w: '20%', d: '3000000' },
        { k: 'actual', h: 'Actual', t: 'num', w: '20%', d: '2450000' }
      ],
      def: [
        { cat: 'Online ads', item: 'Search & display ads', plan: '3000000', actual: '2450000' },
        { cat: 'Content', item: 'Video production', plan: '2000000', actual: '2100000' },
        { cat: 'Events', item: 'Trade show booth', plan: '4000000', actual: '0' }
      ]
    }],
    table: {
      set: 'rows', empty: 4,
      cols: [
        { k: 'cat', h: 'Category' }, { k: 'item', h: 'Item' },
        { k: 'plan', h: 'Planned', t: 'num' }, { k: 'actual', h: 'Actual', t: 'num' },
        { k: 'var', h: 'Variance', t: 'num', calc: function (r) { return H.num(r.plan) - H.num(r.actual); } },
        { k: 'rate', h: 'Used (%)', t: 'num', calc: function (r) { return H.num(r.plan) ? Math.round(H.num(r.actual) / H.num(r.plan) * 1000) / 10 : 0; } }
      ],
      foot: [{ l: 'TOTAL', colspan: 2, align: 'right' }, { v: function (d) { return sum(d, 'rows', 'plan'); } },
        { v: function (d) { return sum(d, 'rows', 'actual'); } }, { v: function (d) { return sum(d, 'rows', 'var'); } }, { v: '' }],
      noteText: 'Variance = Planned − Actual. A negative variance means the line is over budget. Percentage used is Actual ÷ Planned × 100.'
    },
    summary: [
      { l: 'Total planned', v: function (d) { return sum(d, 'rows', 'plan'); }, unit: 'KRW' },
      { l: 'Total actual', v: function (d) { return sum(d, 'rows', 'actual'); }, unit: 'KRW' },
      { l: 'Remaining', v: function (d) { return sum(d, 'rows', 'plan') - sum(d, 'rows', 'actual'); }, unit: 'KRW', grand: true }
    ],
    csv: function (d) {
      var out = [['Category', 'Item', 'Planned', 'Actual', 'Variance', 'Used %']];
      (d.sets.rows || []).forEach(function (r) {
        out.push([r.cat, r.item, H.num(r.plan), H.num(r.actual), H.num(r.plan) - H.num(r.actual), H.num(r.plan) ? Math.round(H.num(r.actual) / H.num(r.plan) * 1000) / 10 : 0]);
      });
      out.push(['TOTAL', '', sum(d, 'rows', 'plan'), sum(d, 'rows', 'actual'), sum(d, 'rows', 'var'), '']);
      return out;
    },
    fileBase: 'budget-plan'
  });

  /* ---------------------------------------------------------
     10. 영문 등본·생활기록부 참고 양식
  --------------------------------------------------------- */
  add({
    id: 'en-record', cat: 'en', sub: 'en-record', no: '01', tpl: 'cert',
    name: '영문 등본·생활기록부 참고 양식', en: 'CERTIFICATE (REFERENCE) / SCHOOL RECORD',
    keywords: '영문 등본 영문 생활기록부 가족관계증명서 번역 참고 양식 해외 제출 서류 유학',
    head: { sub: 'CERTIFICATE OF FAMILY RELATIONS · SCHOOL RECORD (REFERENCE)', meta: [['Issue date', 'issueDate'], ['Reference No.', 'refNo']] },
    parties: [{ k: 'A', label: 'Issuing officer', nameKey: 'issuer' }],
    fields: [
      { g: 'Document', k: 'kind', l: 'Document type', t: 'sel', opts: ['Certificate of Family Relations (가족관계증명서)', 'Resident Register (주민등록등본)', 'School Record (생활기록부)'], d: 'Certificate of Family Relations (가족관계증명서)', w: 2 },
      { g: 'Document', k: 'refNo', l: 'Reference No.', d: 'REF-2026-1123-01' },
      { g: 'Document', k: 'issueDate', l: 'Issue date', t: 'date', d: today() },
      { g: 'Subject', k: 'name', l: 'Full name', d: 'Hong Gil-dong' },
      { g: 'Subject', k: 'nameHanja', l: 'Name in Korean', d: '홍길동' },
      { g: 'Subject', k: 'birth', l: 'Date of birth', d: '1988-03-15' },
      { g: 'Subject', k: 'sex', l: 'Sex', d: 'Male' },
      { g: 'Subject', k: 'regNo', l: 'Resident registration No. (masked)', d: '880315-0••••••' },
      { g: 'Subject', k: 'addr', l: 'Address', d: '108, Yeouidae-ro, Yeongdeungpo-gu, Seoul, Republic of Korea', w: 2 },
      { g: 'Subject', k: 'school', l: 'School (for school record)', d: 'OO High School', w: 2 },
      { g: 'Issue', k: 'issuer', l: 'Issuing authority', d: 'OO District Office (or OO High School)' },
      { g: 'Issue', k: 'issuerAddr', l: 'Issuer address', d: 'Seoul, Republic of Korea', w: 2 },
      { g: 'Note', k: 'noteText', l: 'Remarks', t: 'area', d: 'This document is a reference format for the English translation of a Korean certificate. The official document must be issued by the competent authority.', w: 2, rows: 3 }
    ],
    sets: [{
      k: 'rows', label: 'Family members / Academic records', addLabel: 'Add row',
      cols: [
        { k: 'rel', h: 'Relation', w: '20%', d: 'Father' },
        { k: 'name', h: 'Name', w: '22%', d: 'Hong OO' },
        { k: 'birth', h: 'Date of birth', w: '20%', d: '1960-05-01' },
        { k: 'memo', h: 'Note', w: '38%', d: '' }
      ],
      def: [
        { rel: 'Father', name: 'Hong OO', birth: '1960-05-01', memo: '' },
        { rel: 'Mother', name: 'Kim OO', birth: '1963-09-12', memo: '' },
        { rel: 'Self', name: 'Hong Gil-dong', birth: '1988-03-15', memo: '' }
      ]
    }],
    blocks: [
      { t: 'center', v: function (d) { return d.f.kind; } },
      { t: 'center', cls: 'fm-doc-sub', v: function (d) { return 'Reference No. ' + d.f.refNo + ' · Issued ' + d.f.issueDate; } },
      { t: 'kv', rows: [['Full name', 'name'], ['Name in Korean', 'nameHanja'], ['Date of birth', 'birth'], ['Sex', 'sex'], ['Resident registration No.', 'regNo'], ['Address', 'addr'], ['School', 'school']] },
      { t: 'table', set: 'rows', empty: 3, head: ['Relation', 'Name', 'Date of birth', 'Note'], cols: [
        { k: 'rel', h: 'Relation', t: 'center' }, { k: 'name', h: 'Name' }, { k: 'birth', h: 'Date of birth', t: 'center' }, { k: 'memo', h: 'Note' }
      ] },
      { t: 'body', v: function (d) { return 'I hereby certify that the information above is true and correct to the best of my knowledge.\n\nIssued by: ' + d.f.issuer + '\n' + d.f.issuerAddr + '\n' + d.f.issueDate; } },
      { t: 'sign', parties: ['A'], note: function () { return 'Issuing officer’s signature and official seal.'; } },
      { t: 'sec', h: 'Remarks', v: 'noteText' },
      { t: 'note', v: function () { return '※ 해외 제출용 등본·생활기록부는 발급 기관의 원본과 번역 인증(공증 또는 아포스티유)이 필요합니다. 이 문서는 영문 표기를 참고하기 위한 자체 양식이며 공식 효력이 없습니다. 제출처의 요구 형식을 먼저 확인하세요.'; } }
    ]
  });
})(typeof window !== 'undefined' ? window : this);
