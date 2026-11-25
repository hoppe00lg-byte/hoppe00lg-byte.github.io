/* =========================================================
   INSIGHT BRIEF — PPT(16:9) 추가분
   회사소개서 · IR 피치덱 · 영업 제안서 · 프로젝트 진행 보고 ·
   월간 실적 보고 · 시상식
   슬라이드 구성과 문구는 자체 제작입니다.
   ========================================================= */
(function (root) {
  'use strict';
  var H = root.IBF;
  var DOCS = root.IBF_DOCS;
  var esc = H.esc, fmt = H.fmt, won = H.won, dko = H.dateKo, today = H.todayISO, sum = H.setSum;
  function add(d) { DOCS[d.id] = d; return d; }
  function cards(items) {
    return '<div class="fm-cards c3">' + items.map(function (x) { return '<div class="fm-card">' + x + '</div>'; }).join('') + '</div>';
  }
  function tl(rows) {
    return '<div class="fm-tl">' + rows.map(function (r) { return '<div><b>' + esc(r[0]) + '</b><span>' + esc(r[1]) + '</span></div>'; }).join('') + '</div>';
  }

  /* ---------------------------------------------------------
     1. 회사소개서 (IR·투자자용)
  --------------------------------------------------------- */
  add({
    id: 'deck-intro', cat: 'ppt', sub: 'pt-company', no: '04', kind: 'slides',
    name: '회사소개서 (투자자용)', en: 'INVESTOR PROFILE DECK',
    keywords: '회사소개서 투자자 IR 회사 개요 비전 사업 모델 팀 소개 ppt',
    fields: [
      { g: '표지', k: 'company', l: '회사명', d: '○○인터내셔널' },
      { g: '표지', k: 'slogan', l: '한 줄 소개', d: '재생원료 수입·공급의 안정적인 파트너', w: 2 },
      { g: '표지', k: 'date', l: '발표 시점', d: '2027. 01' },
      { g: '개요', k: 'ceo', l: '대표자', d: '홍길동' },
      { g: '개요', k: 'since', l: '설립', d: '2019' },
      { g: '개요', k: 'model', l: '수익 모델', d: '수입 원료 도소매 마진 + 물류 대행 수수료' },
      { g: '개요', k: 'about', l: '회사 소개', t: 'area', d: '중국·동남아 메이커의 재생원료를 수입해 국내 중소 제조사에 공급합니다. 통관·시험·재고 관리를 함께 맡아 고객의 구매 부담을 줄입니다.', w: 2, rows: 3 },
      { g: '지표', k: 'm1v', l: '지표 1', d: '연 3,600톤' },
      { g: '지표', k: 'm1l', l: '설명 1', d: '연간 공급 물량' },
      { g: '지표', k: 'm2v', l: '지표 2', d: '42곳' },
      { g: '지표', k: 'm2l', l: '설명 2', d: '거래 제조사' },
      { g: '지표', k: 'm3v', l: '지표 3', d: '38억' },
      { g: '지표', k: 'm3l', l: '설명 3', d: '2026년 매출' },
      { g: '성장', k: 'g1', l: '성장 포인트 1', d: '거래처 다변화 — 3개 업종으로 확대' },
      { g: '성장', k: 'g2', l: '성장 포인트 2', d: '품질검사 내재화 — 클레임 60% 감소' },
      { g: '성장', k: 'g3', l: '성장 포인트 3', d: '물류 대행 — 부가 수익 확보' },
      { g: '요청', k: 'ask', l: '투자·협력 요청', t: 'area', d: '창고 자동화와 시험 장비 도입에 3억원을 투자받아 월 처리 물량을 2배로 늘리고자 합니다.', w: 2, rows: 2 },
      { g: '연락', k: 'contact', l: '연락처', d: 'ir@example.com / 02-0000-0000', w: 2 }
    ],
    slides: [
      function (d) {
        return '<div class="sl-k">INVESTOR PROFILE · ' + esc(d.f.date) + '</div><div class="sl-co">' + esc(d.f.company) + '</div>' +
          '<div class="sl-slogan">' + esc(d.f.slogan) + '</div><div class="sl-foot">' + esc(d.f.contact) + '</div>';
      },
      function (d) {
        return '<div class="sl-k">01 · OVERVIEW</div><h3>회사 개요</h3><div class="sl-lead">' + esc(d.f.about) + '</div>' +
          '<div class="sl-body">' + tl([['대표', d.f.ceo], ['설립', d.f.since], ['수익 모델', d.f.model]]) + '</div>';
      },
      function (d) {
        return '<div class="sl-k">02 · AT A GLANCE</div><h3>숫자로 보는 회사</h3>' + cards([
          '<b>' + esc(d.f.m1v) + '</b><span>' + esc(d.f.m1l) + '</span>',
          '<b>' + esc(d.f.m2v) + '</b><span>' + esc(d.f.m2l) + '</span>',
          '<b>' + esc(d.f.m3v) + '</b><span>' + esc(d.f.m3l) + '</span>'
        ]);
      },
      function (d) {
        return '<div class="sl-k">03 · GROWTH</div><h3>성장 포인트</h3><div class="sl-body">' +
          tl([['01', d.f.g1], ['02', d.f.g2], ['03', d.f.g3]]) + '</div>';
      },
      function (d) {
        return '<div class="sl-k">04 · ASK</div><h3>투자·협력 요청</h3><div class="sl-lead">' + esc(d.f.ask) + '</div>';
      },
      function (d) {
        return '<div class="sl-k">05 · CONTACT</div><h3>' + esc(d.f.company) + '</h3><div class="sl-lead">' + esc(d.f.contact) + '</div>';
      }
    ]
  });

  /* ---------------------------------------------------------
     2. IR 피치덱
  --------------------------------------------------------- */
  add({
    id: 'deck-ir', cat: 'ppt', sub: 'pt-company', no: '05', kind: 'slides',
    name: 'IR 피치덱', en: 'PITCH DECK',
    keywords: 'IR 피치덱 투자 유치 스타트업 문제 해결 시장 규모 팀 트랙션',
    fields: [
      { g: '표지', k: 'company', l: '회사·서비스명', d: '○○플랫폼' },
      { g: '표지', k: 'slogan', l: '한 줄 정의', d: '중소 제조사를 위한 원료 재고 예측 서비스', w: 2 },
      { g: '표지', k: 'stage', l: '투자 단계', t: 'sel', opts: ['Pre-seed', 'Seed', 'Series A', 'Series B'], d: 'Seed' },
      { g: '문제', k: 'problem', l: '문제 정의', t: 'area', d: '중소 제조사는 원료 가격 변동과 납기 지연을 예측하지 못해 재고를 과하게 쌓거나 결품을 겪습니다.', w: 2, rows: 2 },
      { g: '해결', k: 'solution', l: '해결 방법', t: 'area', d: '거래·재고 데이터를 연결해 4주 뒤 필요 물량을 예측하고, 부족하면 공급처를 자동으로 제안합니다.', w: 2, rows: 2 },
      { g: '시장', k: 'tam', l: 'TAM', d: '국내 원료 유통 12조원' },
      { g: '시장', k: 'sam', l: 'SAM', d: '중소 제조사 구매 1.8조원' },
      { g: '시장', k: 'som', l: 'SOM (3년)', d: '연 300억원' },
      { g: '트랙션', k: 't1', l: '지표 1', d: '고객 38곳' },
      { g: '트랙션', k: 't2', l: '지표 2', d: '월 반복 매출 4,200만원' },
      { g: '트랙션', k: 't3', l: '지표 3', d: '리텐션 94%' },
      { g: '비즈니스', k: 'biz', l: '수익 구조', t: 'area', d: '월 구독료(29만원~) + 거래 성사 수수료 1.5%', w: 2, rows: 2 },
      { g: '요청', k: 'ask', l: '투자 요청', d: '10억원 (제품 고도화 60%, 영업 30%, 운영 10%)', w: 2 },
      { g: '요청', k: 'use', l: '자금 사용 계획', t: 'area', d: '1) 예측 모델 고도화 — 개발자 3명 채용\n2) 영업 인력 2명 — 수도권·영남 거점\n3) 데이터 파트너 3곳 계약', w: 2, rows: 3 },
      { g: '팀', k: 'team', l: '팀 소개', t: 'area', d: '대표(물류 12년), CTO(머신러닝 8년), 영업 리드(제조 구매 10년)', w: 2, rows: 2 }
    ],
    slides: [
      function (d) {
        return '<div class="sl-k">PITCH DECK · ' + esc(d.f.stage) + '</div><div class="sl-co">' + esc(d.f.company) + '</div>' +
          '<div class="sl-slogan">' + esc(d.f.slogan) + '</div>';
      },
      function (d) {
        return '<div class="sl-k">01 · PROBLEM</div><h3>지금 무엇이 문제인가</h3><div class="sl-lead">' + esc(d.f.problem) + '</div>';
      },
      function (d) {
        return '<div class="sl-k">02 · SOLUTION</div><h3>우리의 해결 방식</h3><div class="sl-lead">' + esc(d.f.solution) + '</div>';
      },
      function (d) {
        return '<div class="sl-k">03 · MARKET</div><h3>시장 규모</h3>' + cards([
          '<b>' + esc(d.f.tam) + '</b><span>TAM</span>',
          '<b>' + esc(d.f.sam) + '</b><span>SAM</span>',
          '<b>' + esc(d.f.som) + '</b><span>SOM</span>'
        ]);
      },
      function (d) {
        return '<div class="sl-k">04 · TRACTION</div><h3>지금의 숫자</h3>' + cards([
          '<b>' + esc(d.f.t1) + '</b><span>고객</span>',
          '<b>' + esc(d.f.t2) + '</b><span>매출</span>',
          '<b>' + esc(d.f.t3) + '</b><span>리텐션</span>'
        ]);
      },
      function (d) {
        return '<div class="sl-k">05 · BUSINESS MODEL</div><h3>수익 구조</h3><div class="sl-lead">' + esc(d.f.biz) + '</div>';
      },
      function (d) {
        return '<div class="sl-k">06 · ASK</div><h3>투자 요청</h3><div class="sl-lead">' + esc(d.f.ask) + '</div><div class="sl-body">' + tl([['사용 계획', d.f.use]]) + '</div>';
      },
      function (d) {
        return '<div class="sl-k">07 · TEAM</div><h3>팀</h3><div class="sl-lead">' + esc(d.f.team) + '</div>';
      }
    ]
  });

  /* ---------------------------------------------------------
     3. 영업 제안서 (B2B)
  --------------------------------------------------------- */
  add({
    id: 'deck-sales', cat: 'ppt', sub: 'pt-proposal', no: '03', kind: 'slides',
    name: '영업 제안서 (B2B)', en: 'SALES PROPOSAL DECK',
    keywords: '영업 제안서 B2B 제안 견적 제안 납품 제안서 수주 발표',
    fields: [
      { g: '표지', k: 'title', l: '제안명', d: '재생원료 정기 공급 제안', w: 2 },
      { g: '표지', k: 'client', l: '제안 대상', d: '△△물산' },
      { g: '표지', k: 'vendor', l: '제안사', d: '○○상사' },
      { g: '표지', k: 'date', l: '제안일', t: 'date', d: today() },
      { g: '요약', k: 'summary', l: '제안 요약', t: 'area', d: '월 200톤 재생 PC·ABS를 고정 단가로 공급하고, 품질 성적서와 안전재고를 함께 운영합니다.', w: 2, rows: 2 },
      { g: '현황', k: 'issue', l: '고객 현황·과제', d: '원료 단가 변동과 입고 지연으로 생산 계획이 흔들림' },
      { g: '현황', k: 'cause', l: '원인', d: '단일 공급처 의존, 검사 리드타임 3일' },
      { g: '제안', k: 's1', l: '제안 1', d: '고정 단가 6개월 계약' },
      { g: '제안', k: 's2', l: '제안 2', d: '안전재고 60톤 상시 보관' },
      { g: '제안', k: 's3', l: '제안 3', d: '로트별 시험성적서 제공' },
      { g: '효과', k: 'e1', l: '기대 효과 1', d: '원가 예측 가능 — 분기 계획 정확도 향상' },
      { g: '효과', k: 'e2', l: '기대 효과 2', d: '결품 위험 감소 — 안전재고 운영' },
      { g: '효과', k: 'e3', l: '기대 효과 3', d: '검사 시간 단축 — 성적서 사전 제공' },
      { g: '조건', k: 'price', l: '공급 단가', d: '톤당 82만원 (부가세 별도)', w: 2 },
      { g: '조건', k: 'terms', l: '거래 조건', t: 'area', d: '월 200톤, 익월 15일 현금 결제, 6개월 단가 고정, 물량 10% 이상 감소 시 재협의', w: 2, rows: 2 },
      { g: '연락', k: 'contact', l: '담당·연락처', d: '김철수 / 010-0000-0000 / sales@example.com', w: 2 }
    ],
    slides: [
      function (d) {
        return '<div class="sl-k">PROPOSAL · ' + esc(d.date) + '</div><div class="sl-co">' + esc(d.title) + '</div>' +
          '<div class="sl-slogan">' + esc(d.client) + ' × ' + esc(d.vendor) + '</div>';
      },
      function (d) {
        return '<div class="sl-k">01 · SUMMARY</div><h3>제안 요약</h3><div class="sl-lead">' + esc(d.summary) + '</div>';
      },
      function (d) {
        return '<div class="sl-k">02 · CURRENT</div><h3>현황과 과제</h3><div class="sl-body">' +
          tl([['과제', d.issue], ['원인', d.cause]]) + '</div>';
      },
      function (d) {
        return '<div class="sl-k">03 · PROPOSAL</div><h3>제안 내용</h3>' + cards([
          '<h4>' + esc(d.s1) + '</h4>', '<h4>' + esc(d.s2) + '</h4>', '<h4>' + esc(d.s3) + '</h4>'
        ]);
      },
      function (d) {
        return '<div class="sl-k">04 · EXPECTED</div><h3>기대 효과</h3><div class="sl-body">' +
          tl([['01', d.e1], ['02', d.e2], ['03', d.e3]]) + '</div>';
      },
      function (d) {
        return '<div class="sl-k">05 · TERMS</div><h3>공급 조건</h3><div class="sl-lead">' + esc(d.price) + '\n' + esc(d.terms) + '</div>';
      },
      function (d) {
        return '<div class="sl-k">06 · CONTACT</div><h3>문의</h3><div class="sl-lead">' + esc(d.contact) + '</div>';
      }
    ]
  });

  /* ---------------------------------------------------------
     4. 프로젝트 진행 보고
  --------------------------------------------------------- */
  add({
    id: 'deck-project', cat: 'ppt', sub: 'pt-report', no: '04', kind: 'slides',
    name: '프로젝트 진행 보고 (16:9)', en: 'PROJECT STATUS DECK',
    keywords: '프로젝트 보고 진행률 주간 보고 마일스톤 이슈 대응 보고 ppt',
    fields: [
      { g: '표지', k: 'project', l: '프로젝트명', d: '신규 공급 라인 구축', w: 2 },
      { g: '표지', k: 'owner', l: 'PM', d: '홍길동' },
      { g: '표지', k: 'date', l: '보고일', t: 'date', d: today() },
      { g: '요약', k: 'summary', l: '한 줄 요약', d: '전체 4개 공정 중 2개 완료, 1개 지연(샘플 테스트)', w: 2 },
      { g: '진행', k: 'p1', l: '공정 1', d: '요구사항 정리 · 100%' },
      { g: '진행', k: 'p2', l: '공정 2', d: '공급 사양 확정 · 80%' },
      { g: '진행', k: 'p3', l: '공정 3', d: '샘플 테스트 · 35% (2주 지연)' },
      { g: '진행', k: 'p4', l: '공정 4', d: '양산 공급 · 0% (예정)' },
      { g: '이슈', k: 'issue', l: '주요 이슈', t: 'area', d: '원료 샘플 2차 테스트에서 MFI 편차가 기준(±2)을 초과했습니다. 공급처와 3차 테스트 일정을 조율 중입니다.', w: 2, rows: 2 },
      { g: '이슈', k: 'action', l: '대응 방안', t: 'area', d: '1) 공급처에 로트 선별 요청 (12/05)\n2) 3차 테스트 12/12 실시\n3) 일정 회복을 위해 양산 준비를 병행', w: 2, rows: 3 },
      { g: '요청', k: 'ask', l: '의사결정 요청', t: 'area', d: '샘플 테스트 지연에 따라 양산 개시일을 2주 순연(1/16)하는 안을 승인해 주세요.', w: 2, rows: 2 },
      { g: '다음', k: 'next', l: '다음 주 계획', d: '3차 테스트 실시, 양산 견적 확정, 고객사 일정 공유' }
    ],
    slides: [
      function (d) {
        return '<div class="sl-k">PROJECT STATUS · ' + esc(d.date) + '</div><div class="sl-co">' + esc(d.project) + '</div>' +
          '<div class="sl-slogan">' + esc(d.owner) + '</div>';
      },
      function (d) {
        return '<div class="sl-k">01 · SUMMARY</div><h3>오늘의 결론</h3><div class="sl-lead">' + esc(d.summary) + '</div>';
      },
      function (d) {
        return '<div class="sl-k">02 · PROGRESS</div><h3>공정별 진행률</h3><div class="sl-body">' +
          tl([['01', d.p1], ['02', d.p2], ['03', d.p3], ['04', d.p4]]) + '</div>';
      },
      function (d) {
        return '<div class="sl-k">03 · ISSUE</div><h3>주요 이슈</h3><div class="sl-lead">' + esc(d.issue) + '</div>';
      },
      function (d) {
        return '<div class="sl-k">04 · ACTION</div><h3>대응 방안</h3><div class="sl-lead">' + esc(d.action) + '</div>';
      },
      function (d) {
        return '<div class="sl-k">05 · DECISION</div><h3>의사결정 요청</h3><div class="sl-lead">' + esc(d.ask) + '</div>';
      },
      function (d) {
        return '<div class="sl-k">06 · NEXT</div><h3>다음 주 계획</h3><div class="sl-lead">' + esc(d.next) + '</div>';
      }
    ]
  });

  /* ---------------------------------------------------------
     5. 월간 실적 보고
  --------------------------------------------------------- */
  add({
    id: 'deck-monthly', cat: 'ppt', sub: 'pt-result', no: '02', kind: 'slides',
    name: '월간 실적 보고 (16:9)', en: 'MONTHLY RESULTS DECK',
    keywords: '월간 실적 보고 매출 달성률 결산 보고 월간 회의 실적 발표',
    fields: [
      { g: '표지', k: 'month', l: '보고월', d: '2026-11' },
      { g: '표지', k: 'dept', l: '부서', d: '영업팀' },
      { g: '표지', k: 'date', l: '보고일', t: 'date', d: today() },
      { g: '실적', k: 'target', l: '매출 목표', t: 'num', d: '120000000', h: '원' },
      { g: '실적', k: 'actual', l: '매출 실적', t: 'num', d: '110500000', h: '원' },
      { g: '실적', k: 'profit', l: '영업이익', t: 'num', d: '16200000', h: '원' },
      { g: '실적', k: 'newClient', l: '신규 거래처', t: 'num', d: '2', h: '곳' },
      { g: '코멘트', k: 'good', l: '잘된 점', t: 'area', d: '신규 거래처 2곳 계약, 기존 거래처 재주문 92% 유지', w: 2, rows: 2 },
      { g: '코멘트', k: 'bad', l: '아쉬운 점', t: 'area', d: '물류비 12% 상승으로 영업이익률이 15.1%에서 14.7%로 하락', w: 2, rows: 2 },
      { g: '코멘트', k: 'next', l: '다음 달 계획', t: 'area', d: 'A사 단가 협상(12/5), 재고 60톤 확보, 신규 거래처 첫 납품', w: 2, rows: 2 }
    ],
    slides: [
      function (d) {
        return '<div class="sl-k">MONTHLY REPORT · ' + esc(d.date) + '</div><div class="sl-co">' + esc(d.month) + ' 실적 보고</div>' +
          '<div class="sl-slogan">' + esc(d.dept) + '</div>';
      },
      function (d) {
        var rate = H.num(d.target) ? Math.round(H.num(d.actual) / H.num(d.target) * 100) : 0;
        return '<div class="sl-k">01 · RESULT</div><h3>매출 달성</h3>' + cards([
          '<b>' + won(d.actual) + '</b><span>실적</span>',
          '<b>' + won(d.target) + '</b><span>목표</span>',
          '<b>' + rate + '%</b><span>달성률</span>'
        ]);
      },
      function (d) {
        return '<div class="sl-k">02 · PROFIT</div><h3>수익성</h3>' + cards([
          '<b>' + won(d.profit) + '</b><span>영업이익</span>',
          '<b>' + (H.num(d.actual) ? (Math.round(H.num(d.profit) / H.num(d.actual) * 1000) / 10) + '%' : '—') + '</b><span>영업이익률</span>',
          '<b>' + esc(d.newClient) + '곳</b><span>신규 거래처</span>'
        ]);
      },
      function (d) {
        return '<div class="sl-k">03 · GOOD</div><h3>잘된 점</h3><div class="sl-lead">' + esc(d.good) + '</div>';
      },
      function (d) {
        return '<div class="sl-k">04 · ISSUE</div><h3>아쉬운 점</h3><div class="sl-lead">' + esc(d.bad) + '</div>';
      },
      function (d) {
        return '<div class="sl-k">05 · NEXT</div><h3>다음 달 계획</h3><div class="sl-lead">' + esc(d.next) + '</div>';
      }
    ]
  });

  /* ---------------------------------------------------------
     6. 시상식
  --------------------------------------------------------- */
  add({
    id: 'deck-award', cat: 'ppt', sub: 'pt-result', no: '03', kind: 'slides',
    name: '시상식·송년회 (16:9)', en: 'AWARDS CEREMONY DECK',
    keywords: '시상식 송년회 연말 행사 우수사원 표창 진행 순서 ppt',
    fields: [
      { g: '행사', k: 'event', l: '행사명', d: '2026년 송년회 및 시상식', w: 2 },
      { g: '행사', k: 'company', l: '회사명', d: '○○상사' },
      { g: '행사', k: 'date', l: '일시', d: '2026-12-19 18:00' },
      { g: '행사', k: 'place', l: '장소', d: '○○호텔 2층 연회장' },
      { g: '행사', k: 'host', l: '진행', d: '이민수' },
      { g: '수상', k: 'a1', l: '대상', d: '김철수 대리' },
      { g: '수상', k: 'a2', l: '우수상', d: '박영희 과장' },
      { g: '수상', k: 'a3', l: '공로상', d: '최민호 사원' },
      { g: '수상', k: 'reason', l: '수상 사유', t: 'area', d: '김철수 대리는 A사 단가 협상과 납기 개선으로 연간 1,080만원의 물류비를 절감했습니다.', w: 2, rows: 2 },
      { g: '인사', k: 'message', l: '대표 인사', t: 'area', d: '한 해 동안 각자의 자리에서 최선을 다해 주신 모든 분께 감사드립니다. 내년에도 함께 성장하는 한 해가 되길 바랍니다.', w: 2, rows: 3 }
    ],
    slides: [
      function (d) {
        return '<div class="sl-k">AWARDS & YEAR-END · ' + esc(d.date) + '</div><div class="sl-co">' + esc(d.event) + '</div>' +
          '<div class="sl-slogan">' + esc(d.company) + '</div><div class="sl-foot">' + esc(d.place) + '</div>';
      },
      function (d) {
        return '<div class="sl-k">01 · PROGRAM</div><h3>진행 순서</h3><div class="sl-body">' +
          tl([['1부', '개회 및 대표 인사'], ['2부', '우수사원 시상'], ['3부', '건배 및 만찬'], ['4부', '행운권 추첨']]) + '</div>';
      },
      function (d) {
        return '<div class="sl-k">02 · AWARDS</div><h3>수상자</h3>' + cards([
          '<b>' + esc(d.a1) + '</b><span>대상</span>',
          '<b>' + esc(d.a2) + '</b><span>우수상</span>',
          '<b>' + esc(d.a3) + '</b><span>공로상</span>'
        ]);
      },
      function (d) {
        return '<div class="sl-k">03 · REASON</div><h3>수상 사유</h3><div class="sl-lead">' + esc(d.reason) + '</div>';
      },
      function (d) {
        return '<div class="sl-k">04 · MESSAGE</div><h3>대표 인사</h3><div class="sl-lead">' + esc(d.message) + '</div>';
      },
      function (d) {
        return '<div class="sl-k">05 · THANK YOU</div><h3>한 해 동안 감사했습니다</h3><div class="sl-lead">' + esc(d.company) + ' · ' + esc(d.host) + '</div>';
      }
    ]
  });
})(typeof window !== 'undefined' ? window : this);
