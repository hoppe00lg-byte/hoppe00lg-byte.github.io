/* =========================================================
   INSIGHT BRIEF — 사업계획서 · 보고서 · PPT
   업종별 창업 사업계획(자동 손익·회수기간), 지원사업 계획서,
   분기 실적 보고서, 조직도·로드맵, 분기 실적 PPT.
   문구·표 구성은 자체 제작입니다.
   ========================================================= */
(function (root) {
  'use strict';
  var H = root.IBF;
  var DOCS = root.IBF_DOCS;
  var esc = H.esc, fmt = H.fmt, fmt1 = H.fmt1, won = H.won, dko = H.dateKo, today = H.todayISO, sum = H.setSum, addD = H.addDays;
  function add(d) { DOCS[d.id] = d; return d; }
  function opProfit(d) {
    return H.num(d.f.monthSales) - Math.round(H.num(d.f.monthSales) * H.num(d.f.cogsPct) / 100) - sum(d, 'costs', 'amount');
  }
  function payback(d) {
    var t = sum(d, 'invest', 'amount'), p = opProfit(d);
    return (t > 0 && p > 0) ? fmt1(t / p) + '개월' : '—';
  }

  /* ---------------------------------------------------------
     1. 업종별 창업 사업계획서 (공통 템플릿 + 업종 프리셋)
  --------------------------------------------------------- */
  function startPlan(o) {
    return add({
      id: o.id, cat: 'plan', sub: 'pl-start', no: o.no, tpl: 'plan',
      name: o.name, en: 'BUSINESS PLAN',
      keywords: '창업 사업계획서 ' + o.kw + ' 사업계획 소상공인 예비창업 손익 투자 회수기간',
      head: {
        sub: 'STARTUP BUSINESS PLAN · ' + o.en,
        meta: [['작성일', 'planDate'], ['총 투자비', function (d) { return won(sum(d, 'invest', 'amount')); }]]
      },
      parties: [{ k: 'A', label: '대표자', nameKey: 'ceo' }, { k: 'B', label: '검토자', nameKey: 'reviewer' }],
      fields: [
        { g: '기본 정보', k: 'bizName', l: '사업(상호)명', d: o.f.bizName },
        { g: '기본 정보', k: 'bizType', l: '업종', d: o.f.bizType },
        { g: '기본 정보', k: 'ceo', l: '대표자', d: '홍길동' },
        { g: '기본 정보', k: 'entity', l: '사업 형태', t: 'sel', opts: ['개인사업자', '법인', '예비창업'], d: '예비창업' },
        { g: '기본 정보', k: 'place', l: '사업장 주소(예정)', d: o.f.place, w: 2 },
        { g: '기본 정보', k: 'openDate', l: '개업(예정)일', t: 'date', d: addD(today(), 60) },
        { g: '기본 정보', k: 'planDate', l: '작성일', t: 'date', d: today() },
        { g: '기본 정보', k: 'reviewer', l: '검토자', d: '김철수' },
        { g: '사업 개요', k: 'tagline', l: '한 줄 소개', d: o.f.tagline, w: 2 },
        { g: '사업 개요', k: 'summary', l: '사업 개요', t: 'area', d: o.f.summary, w: 2, rows: 3 },
        { g: '시장·차별화', k: 'target', l: '목표 고객', t: 'area', d: o.f.target, w: 2, rows: 2 },
        { g: '시장·차별화', k: 'market', l: '시장 상황', t: 'area', d: o.f.market, w: 2, rows: 2 },
        { g: '시장·차별화', k: 'diff', l: '차별화·경쟁력', t: 'area', d: o.f.diff, w: 2, rows: 2 },
        { g: '운영 계획', k: 'oper', l: '운영 방식·시간', t: 'area', d: o.f.oper, w: 2, rows: 2 },
        { g: '운영 계획', k: 'team', l: '인력 구성', t: 'area', d: o.f.team, w: 2, rows: 2 },
        { g: '운영 계획', k: 'mkt', l: '마케팅 계획', t: 'area', d: o.f.mkt, w: 2, rows: 2 },
        { g: '재무 가정', k: 'monthSales', l: '월 매출(예상)', t: 'num', d: o.f.monthSales },
        { g: '재무 가정', k: 'cogsPct', l: '원가율(%)', t: 'num', d: o.f.cogsPct },
        { g: '일정·위험', k: 'schedule', l: '준비 일정', t: 'area', d: o.f.schedule, w: 2, rows: 3 },
        { g: '일정·위험', k: 'risk', l: '위험·대응', t: 'area', d: o.f.risk, w: 2, rows: 3 }
      ],
      sets: [
        {
          k: 'invest', label: '초기 투자 내역', addLabel: '항목 추가',
          cols: [
            { k: 'item', h: '항목', w: '58%', d: o.f.invest[0][0] },
            { k: 'memo', h: '산출 근거', w: '26%', d: o.f.invest[0][2] },
            { k: 'amount', h: '금액', t: 'num', w: '16%', d: o.f.invest[0][1] }
          ],
          def: o.f.invest.map(function (r) { return { item: r[0], amount: String(r[1]), memo: r[2] }; })
        },
        {
          k: 'costs', label: '월 고정비', addLabel: '비용 추가',
          cols: [
            { k: 'item', h: '항목', w: '60%', d: o.f.costs[0][0] },
            { k: 'memo', h: '메모', w: '24%', d: o.f.costs[0][2] },
            { k: 'amount', h: '월 금액', t: 'num', w: '16%', d: o.f.costs[0][1] }
          ],
          def: o.f.costs.map(function (r) { return { item: r[0], amount: String(r[1]), memo: r[2] }; })
        }
      ],
      blocks: [
        { t: 'kv', rows: [['사업명', 'bizName'], ['업종', 'bizType'], ['대표자', 'ceo'], ['사업 형태', 'entity'], ['사업장', 'place'], ['개업 예정일', function (d) { return dko(d.f.openDate); }]] },
        { t: 'amount', v: 'tagline', sub: function (d) { return d.f.bizType + ' · ' + d.f.entity; } },
        { t: 'sec', h: '1. 사업 개요', v: 'summary' },
        { t: 'sec', h: '2. 목표 고객', v: 'target' },
        { t: 'sec', h: '3. 시장 상황', v: 'market' },
        { t: 'sec', h: '4. 차별화·경쟁력', v: 'diff' },
        { t: 'sec', h: '5. 운영 방식', v: 'oper' },
        { t: 'sec', h: '6. 인력 구성', v: 'team' },
        { t: 'sec', h: '7. 마케팅 계획', v: 'mkt' },
        { t: 'table', set: 'invest', empty: 3, head: ['투자 항목', '산출 근거', '금액'], cols: [
          { k: 'item', h: '투자 항목' }, { k: 'memo', h: '산출 근거' }, { k: 'amount', h: '금액', t: 'num' }
        ], foot: [{ l: '투자 합계', colspan: 2, align: 'right' }, { v: function (d) { return sum(d, 'invest', 'amount'); } }] },
        { t: 'table', set: 'costs', empty: 3, head: ['고정비 항목', '메모', '월 금액'], cols: [
          { k: 'item', h: '고정비 항목' }, { k: 'memo', h: '메모' }, { k: 'amount', h: '월 금액', t: 'num' }
        ] },
        { t: 'sec', h: '8. 손익 전망 (월 기준)', v: function (d) {
          return '· 월 매출(예상): ' + won(d.f.monthSales) + '\n· 원가(' + d.f.cogsPct + '%): ' + won(Math.round(H.num(d.f.monthSales) * H.num(d.f.cogsPct) / 100)) +
            '\n· 월 고정비: ' + won(sum(d, 'costs', 'amount')) + '\n· 월 영업이익(예상): ' + won(opProfit(d)) +
            '\n· 투자 회수기간(단순): ' + payback(d) + ' (누적 영업이익으로 투자비를 회수하는 데 걸리는 기간, 세금·이자 제외)';
        } },
        { t: 'sums', rows: [
          { l: '월 매출', v: function (d) { return H.num(d.f.monthSales); } },
          { l: '원가', v: function (d) { return Math.round(H.num(d.f.monthSales) * H.num(d.f.cogsPct) / 100); } },
          { l: '월 고정비', v: function (d) { return sum(d, 'costs', 'amount'); } },
          { l: '월 영업이익', v: function (d) { return opProfit(d); }, grand: true }
        ] },
        { t: 'sec', h: '9. 준비 일정', v: 'schedule' },
        { t: 'sec', h: '10. 위험과 대응', v: 'risk' },
        { t: 'sign', parties: ['A', 'B'], note: function (d) { return '작성일 ' + dko(d.f.planDate) + ' · 위 내용으로 사업을 준비합니다. 검토자 서명은 계획 내용을 함께 점검했다는 확인입니다.'; } },
        { t: 'note', v: function () { return '※ 매출·원가·고정비는 예시 가정입니다. 실제 임대료·인건비·수수료·세금은 계약과 지역에 따라 다르므로, 지원사업 제출용이라면 공고의 요구 항목과 분량에 맞춰 다시 정리하세요. 손익 계산은 자체 추정이며 투자 권유가 아닙니다.'; } }
      ]
    });
  }

  startPlan({
    id: 'start-unmanned', no: '02', en: 'UNMANNED STORE', name: '무인매장 창업 사업계획서',
    kw: '무인매장 무인 아이스크림 무인카페 키오스크 24시간 소자본',
    f: {
      bizName: '24시 무인 편의형 매장', bizType: '무인 소매 (아이스크림·간식)', place: '서울특별시 영등포구 ○○로 00, 1층',
      tagline: '직원 없이 24시간, 동네에서 가장 가까운 무인 간식 매장',
      summary: '주거 밀집 지역 1층 상가에 무인 매장을 열고 아이스크림·과자·음료를 24시간 판매합니다. 키오스크와 CCTV, 자동 재고 알림으로 인건비 없이 운영합니다.',
      target: '초등학생 자녀를 둔 30~40대 가구, 야간 귀가 직장인, 인근 학원가 학생',
      market: '동네 슈퍼가 줄고 편의점이 대체하면서 1~2인 가구의 소량·야간 구매가 늘었습니다. 무인 매장은 상권 반경 300m의 유동 인구와 주거 세대 수가 매출을 좌우합니다.',
      diff: '① 24시간 운영으로 편의점 대비 야간 접근성 확보 ② 냉동·상온 비중을 반씩 두어 재고 회전 위험 분산 ③ 키오스크 매출 데이터로 잘 팔리는 품목만 유지',
      oper: '평일·주말 24시간 무인 운영, 주 3회 재고 보충, 월 1회 정기 점검(위생·기기). 결제는 카드·간편결제 중심, 현금은 최소화합니다.',
      team: '대표 1인이 재고·정산·점검을 맡고, 청소·보충은 주 2회 아르바이트로 보조합니다.',
      mkt: '개업 2주 전 지역 맘카페·당근에 오픈 소식, 첫 구매 1+1 쿠폰, 학원가 전단 배포. 3개월마다 인기 품목 할인 행사.',
      monthSales: '12000000', cogsPct: '60',
      invest: [['매장 인테리어·집기', 12000000, '10평 기준, 냉동고 2대 포함'], ['키오스크·CCTV·출입 시스템', 4500000, '무인 운영 필수 장비'], ['초도 상품 매입', 3500000, '냉동 60% / 상온 40%'], ['보증금', 10000000, '임대차 계약 조건에 따라 변동'], ['간판·홍보물', 1500000, '돌출간판, 쿠폰 전단']],
      costs: [['임차료', 1800000, '보증금 별도'], ['전기·냉동 전력', 450000, '여름철 증가'], ['통신·결제 수수료', 120000, '키오스크·카드'], ['관리비', 250000, '건물 관리비'], ['아르바이트', 700000, '주 2회 청소·보충']],
      schedule: '1개월 차: 상권 조사·임차 계약\n2개월 차: 인테리어·장비 설치·사업자 등록\n3개월 차: 상품 입고·시범 운영\n4개월 차: 정식 개업',
      risk: '· 절도·기물 파손 → CCTV·경고 안내판, 소액 보험 가입\n· 유통기한 폐기 손실 → 소분 발주와 판매 데이터 기반 발주\n· 여름·겨울 전력비 급증 → 냉동고 교체 주기 관리'
    }
  });

  startPlan({
    id: 'start-shop', no: '03', en: 'ONLINE SHOP', name: '온라인 쇼핑몰 창업 사업계획서',
    kw: '온라인 쇼핑몰 스마트스토어 쿠팡 사입 위탁 판매 이커머스',
    f: {
      bizName: '○○ 스토어', bizType: '온라인 종합 소매 (생활·주방)', place: '자택 사무실 + 3PL 물류 위탁',
      tagline: '검증된 생활용품만 골라 파는 작은 온라인 편집숍',
      summary: '스마트스토어와 쿠팡에 생활·주방용품을 판매합니다. 초기에는 위탁·사입 혼합으로 시작하고, 판매 데이터가 쌓이면 잘 팔리는 10개 품목에 집중합니다.',
      target: '1~2인 가구, 신혼·이사 수요, 주방 소품을 찾는 30~40대 여성',
      market: '온라인 생활용품 시장은 가격 비교가 쉽고 반품률이 높습니다. 상위 노출보다 상세페이지 품질과 리뷰 관리가 재구매를 만듭니다.',
      diff: '① 셀러 수가 적은 틈새 카테고리 선점 ② 실사용 사진과 사이즈 비교 이미지 자체 제작 ③ 묶음 배송으로 객단가 상승',
      oper: '평일 10~18시 상품 등록·문의 응대, 주 1회 발주. 배송은 3PL 위탁으로 포장·출고를 맡깁니다.',
      team: '대표 1인(상품·마케팅), 물류 3PL 업체 1곳, 사진·상세페이지 외주 1곳.',
      mkt: '스마트스토어 쇼핑검색 광고 월 30만원, 인스타 릴스 주 2회, 첫 구매 리뷰 적립금. 3개월마다 판매 상위 품목 재편성.',
      monthSales: '20000000', cogsPct: '55',
      invest: [['초도 재고', 8000000, '판매 상위 10개 품목'], ['상세페이지·촬영', 3000000, '품목당 30만원 × 10'], ['광고비(3개월)', 3000000, '검색·릴스'], ['포장·부자재', 1000000, '박스·완충재'], ['사무 장비', 1500000, '노트북·바코드 프린터']],
      costs: [['판매 수수료', 1000000, '매출의 5% 가정'], ['3PL 물류비', 1800000, '건당 2,500원 × 720건'], ['광고비', 500000, '월 평균'], ['택배비', 900000, '무료배송 반영'], ['통신·프로그램', 150000, '재고·주문 관리']],
      schedule: '1개월 차: 판매처 입점·상품 소싱\n2개월 차: 상세페이지 제작·초도 입고\n3개월 차: 광고 테스트·리뷰 확보\n4개월 차: 상위 품목 집중·재고 확대',
      risk: '· 반품·교환 증가 → 사이즈·소재 정보 강화, 반품률 높은 품목 정리\n· 광고비 과다 → 목표 ROAS 설정 후 중단 기준 운용\n· 품절·재고 부족 → 판매 속도 기준 안전재고 설정'
    }
  });

  startPlan({
    id: 'start-cafe', no: '04', en: 'CAFE', name: '카페 창업 사업계획서',
    kw: '카페 창업 테이크아웃 카페 커피 전문점 디저트 소자본 창업',
    f: {
      bizName: '○○ 커피', bizType: '휴게음식점 (테이크아웃 카페)', place: '서울특별시 마포구 ○○로 00, 1층',
      tagline: '원두는 직접 고르고, 가격은 동네에서 가장 솔직한 테이크아웃 카페',
      summary: '오피스·대학가 인근 1층에 테이크아웃 중심 카페를 열고, 원두 3종과 수제 디저트 2종으로 운영합니다. 좌석은 최소화해 회전과 인건비를 줄입니다.',
      target: '출퇴근 직장인, 인근 대학생, 오후 시간대 원격 근무자',
      market: '저가 커피 프랜차이즈와 개인 카페가 경쟁하는 시장입니다. 같은 가격이면 원두 품질과 단골 응대가 재방문을 만듭니다.',
      diff: '① 원두 로스터리 직거래로 원가·품질 동시 확보 ② 테이크아웃 동선 짧은 매장 설계 ③ 월 구독(커피 20잔)으로 고정 매출 확보',
      oper: '평일 07:30~19:00, 주말 09:00~17:00. 오픈·마감은 대표와 파트타임 1인이 교대합니다.',
      team: '대표 1인(바리스타 자격), 파트타임 1~2명, 디저트는 지역 제과점과 위탁 계약.',
      mkt: '오픈 전 인스타 계정·현수막, 출근 시간대 첫 잔 할인, 10잔 스탬프. 인근 오피스 제휴로 단체 주문 유치.',
      monthSales: '15000000', cogsPct: '35',
      invest: [['인테리어·주방 설비', 18000000, '8평, 에스프레소 머신 포함'], ['보증금', 15000000, '임대 조건에 따라 변동'], ['집기·POS·간판', 4000000, '테이크아웃 동선'], ['초도 원두·부자재', 2000000, '원두 3종, 컵·뚜껑'], ['인허가·교육', 1000000, '위생교육, 영업신고']],
      costs: [['임차료', 2000000, '보증금 별도'], ['인건비', 2200000, '파트타임 1.5명'], ['원두·우유·부자재', 1200000, '매출 원가 외 소모품'], ['전기·수도·가스', 550000, '여름·겨울 증가'], ['광고·플랫폼', 300000, '배달앱·SNS']],
      schedule: '1개월 차: 상권·임차 조사\n2개월 차: 인테리어·설비 발주, 인허가\n3개월 차: 원두 테스트·메뉴 확정\n4개월 차: 시범 운영 후 정식 오픈',
      risk: '· 원두 가격 상승 → 연간 단가 계약, 대체 원두 준비\n· 인력 이탈 → 매뉴얼·교육으로 대체 인력 확보\n· 유동 인구 감소 → 배달·구독·단체 주문으로 보완'
    }
  });

  startPlan({
    id: 'start-ai', no: '05', en: 'IT / AI SERVICE', name: 'IT·AI 서비스 창업 사업계획서',
    kw: 'IT 창업 AI 서비스 SaaS 자동화 1인 개발 스타트업',
    f: {
      bizName: '○○ 랩', bizType: '소프트웨어 개발·AI 자동화 서비스', place: '재택 + 공유오피스 (서울 ○○)',
      tagline: '중소기업의 반복 업무를 AI로 줄여 주는 1인 개발 스튜디오',
      summary: '중소 제조·유통사의 견적·재고·문서 업무를 자동화하는 AI 도구를 만들고, 구축형 프로젝트와 월 구독(SaaS)으로 판매합니다.',
      target: '직원 5~50명 제조·유통사, 문서·견적 업무가 많은 영업지원 조직',
      market: '대기업용 솔루션은 비싸고, 중소기업은 엑셀과 수작업에 의존합니다. 가격이 낮고 바로 쓸 수 있는 도구에 수요가 있습니다.',
      diff: '① 업종별 템플릿으로 2주 내 도입 ② 구축비 대신 월 구독 ③ 대표가 직접 상담·개발해 커스터마이징 속도 확보',
      oper: '평일 개발·고객 대응, 프로젝트는 2~4주 단위. 서버는 클라우드 종량제, 고객 데이터는 암호화 보관.',
      team: '대표(기획·개발) 1인, 디자인 외주 1곳, 회계·세무 대행 1곳.',
      mkt: '업종 커뮤니티·블로그 사례 글, 무료 진단 30분, 첫 3개월 할인. 기존 고객 추천 소개.',
      monthSales: '8000000', cogsPct: '15',
      invest: [['개발·서버 초기비용', 2000000, '클라우드 1년분 선결제'], ['디자인·브랜딩', 1500000, '로고·랜딩페이지'], ['법인 설립·인허가', 1000000, '법인 등기·통신판매'], ['마케팅', 1500000, '콘텐츠·광고'], ['예비 운전자금', 4000000, '3개월 생활비']],
      costs: [['서버·API 사용료', 400000, '사용량 연동'], ['외주 개발', 800000, '프로젝트 보조'], ['광고·콘텐츠', 300000, '블로그·검색'], ['공유오피스', 350000, '주 2회'], ['프로그램·구독', 150000, '개발 도구']],
      schedule: '1~2개월: 문제 정의·프로토타입\n3개월: 파일럿 고객 2곳\n4~6개월: 유료 전환·과금 모델 확정\n7~12개월: 업종 템플릿 3종 확장',
      risk: '· 특정 고객 의존 → 업종·고객사 분산\n· API 가격 인상 → 자체 모델·대체 API 준비\n· 개인정보·보안 → 계약서에 처리 위탁 조항, 암호화'
    }
  });

  /* ---------------------------------------------------------
     2. 지원사업·공모 사업계획서
  --------------------------------------------------------- */
  add({
    id: 'grant-plan', cat: 'plan', sub: 'pl-grant', no: '01', tpl: 'plan',
    name: '지원사업 신청 사업계획서', en: 'GRANT APPLICATION PLAN',
    keywords: '지원사업 사업계획서 공모 정부지원 소상공인 창업지원 문제인식 실현가능성 성장전략 자금계획',
    head: { sub: 'GRANT / CONTEST APPLICATION', meta: [['공고명', 'notice'], ['신청일', 'applyDate'], ['신청금액', function (d) { return won(d.f.askAmt); }]] },
    parties: [{ k: 'A', label: '신청인', nameKey: 'ceo' }, { k: 'B', label: '확인자', nameKey: 'reviewer' }],
    fields: [
      { g: '공고·신청', k: 'notice', l: '공고명', d: '2027년 소상공인 창업지원 사업', w: 2 },
      { g: '공고·신청', k: 'agency', l: '주관기관', d: '○○시 소상공인지원센터' },
      { g: '공고·신청', k: 'applyDate', l: '신청일', t: 'date', d: today() },
      { g: '신청자', k: 'company', l: '사업(상호)명', d: '○○상사' },
      { g: '신청자', k: 'ceo', l: '대표자', d: '홍길동' },
      { g: '신청자', k: 'bizNo', l: '사업자등록번호', d: '000-00-00000' },
      { g: '신청자', k: 'reviewer', l: '확인자', d: '김철수' },
      { g: '사업 내용', k: 'title', l: '과제명', d: '재생원료 소량·다품종 공급 시스템 구축', w: 2 },
      { g: '사업 내용', k: 'problem', l: '① 문제 인식 (현황·필요성)', t: 'area', d: '국내 제조사는 소량 원료를 안정적으로 공급받기 어렵고, 규격이 바뀔 때마다 재고가 묶입니다. 이 때문에 생산 계획이 자주 흔들립니다.', w: 2, rows: 3 },
      { g: '사업 내용', k: 'solution', l: '② 실현 가능성 (해결 방안·역량)', t: 'area', d: '규격별 안전재고 기준을 만들고, 입고·검수·출고를 한 화면에서 관리하는 시스템을 도입합니다. 10년간의 수입·검수 경험과 기존 거래처 20곳을 활용합니다.', w: 2, rows: 3 },
      { g: '사업 내용', k: 'growth', l: '③ 성장 전략 (시장·차별화)', t: 'area', d: '소량 주문을 받는 공급자가 드물어, 1톤 이하 주문 전용 라인을 만들면 신규 고객 확보가 빠릅니다. 3년 내 월 300톤 처리로 확대합니다.', w: 2, rows: 3 },
      { g: '사업 내용', k: 'team', l: '④ 팀 구성·역량', t: 'area', d: '대표(수입·영업 10년), 물류 파트너, 통관 대행사, 외주 개발 1명으로 구성합니다.', w: 2, rows: 2 },
      { g: '사업 내용', k: 'effect', l: '⑤ 기대 효과', t: 'area', d: '신규 고객 10곳, 매출 30% 증가, 재고 손실 20% 감소를 목표로 합니다.', w: 2, rows: 2 },
      { g: '자금', k: 'askAmt', l: '신청 금액', t: 'num', d: '30000000' },
      { g: '자금', k: 'ownAmt', l: '자부담', t: 'num', d: '10000000' }
    ],
    sets: [{
      k: 'use', label: '자금 사용 계획', addLabel: '비목 추가',
      cols: [
        { k: 'item', h: '비목', w: '30%', d: '시스템 개발' },
        { k: 'amount', h: '금액', t: 'num', w: '20%', d: '15000000' },
        { k: 'memo', h: '산출 근거', w: '50%', d: '외주 개발 3개월 × 500만원' }
      ],
      def: [
        { item: '시스템 개발', amount: '15000000', memo: '외주 개발 3개월 × 500만원' },
        { item: '재고 확보', amount: '10000000', memo: '규격별 안전재고 초도 물량' },
        { item: '장비·프로그램', amount: '5000000', memo: '바코드·라벨 프린터, 재고 프로그램' }
      ]
    }],
    blocks: [
      { t: 'kv', rows: [['공고명', 'notice'], ['주관기관', 'agency'], ['사업명', 'company'], ['대표자', 'ceo'], ['사업자등록번호', 'bizNo'], ['신청일', 'applyDate']] },
      { t: 'sec', h: '과제명', v: 'title' },
      { t: 'sec', h: '① 문제 인식', v: 'problem' },
      { t: 'sec', h: '② 실현 가능성', v: 'solution' },
      { t: 'sec', h: '③ 성장 전략', v: 'growth' },
      { t: 'sec', h: '④ 팀 구성·역량', v: 'team' },
      { t: 'sec', h: '⑤ 기대 효과', v: 'effect' },
      { t: 'table', set: 'use', empty: 2, head: ['비목', '금액', '산출 근거'], cols: [
        { k: 'item', h: '비목' }, { k: 'amount', h: '금액', t: 'num' }, { k: 'memo', h: '산출 근거' }
      ], foot: [{ l: '합계', colspan: 1, align: 'right' }, { v: function (d) { return sum(d, 'use', 'amount'); } }, { v: '' }] },
      { t: 'sums', rows: [
        { l: '신청 금액', v: function (d) { return H.num(d.f.askAmt); } },
        { l: '자부담', v: function (d) { return H.num(d.f.ownAmt); } },
        { l: '총 사업비', v: function (d) { return H.num(d.f.askAmt) + H.num(d.f.ownAmt); }, grand: true }
      ] },
      { t: 'sign', parties: ['A', 'B'], note: function () { return '위 내용이 사실과 같음을 확인합니다. 제출 서류는 공고의 목차와 분량 기준을 따로 확인하세요.'; } },
      { t: 'note', v: function () { return '※ 공고마다 요구하는 목차·분량·평가 배점이 다릅니다. 이 서식은 일반적인 평가 항목(문제–실현–성장–팀–효과–자금) 순서로 정리한 자체 양식이므로, 제출 전 공고문의 양식과 항목명에 맞춰 옮겨 쓰세요. 허위 기재는 지원 취소 사유가 됩니다.'; } }
    ]
  });

  /* ---------------------------------------------------------
     3. 분기·연간 실적 보고서
  --------------------------------------------------------- */
  add({
    id: 'report-quarter', cat: 'plan', sub: 'pl-report', no: '01', tpl: 'table',
    name: '분기·연간 실적 보고서', en: 'QUARTERLY PERFORMANCE REPORT',
    keywords: '실적 보고서 분기 결산 연간 매출 영업이익 전년대비 성장률 보고',
    head: { sub: 'PERFORMANCE REPORT', meta: [['보고 기간', 'period'], ['작성일', 'issueDate'], ['단위', 'unit']] },
    parties: [{ k: 'A', label: '작성', nameKey: 'writer' }, { k: 'B', label: '승인', nameKey: 'approver' }],
    fields: [
      { g: '보고 정보', k: 'company', l: '회사', d: '○○상사' },
      { g: '보고 정보', k: 'period', l: '보고 기간', d: '2026년 3분기 (7~9월)' },
      { g: '보고 정보', k: 'issueDate', l: '작성일', t: 'date', d: today() },
      { g: '보고 정보', k: 'unit', l: '금액 단위', t: 'sel', opts: ['원', '천원', '백만원', '억원'], d: '백만원' },
      { g: '보고 정보', k: 'writer', l: '작성자', d: '홍길동' },
      { g: '보고 정보', k: 'approver', l: '승인자', d: '김철수' },
      { g: '요약', k: 'summary', l: '한 줄 요약', d: '3분기 매출은 전분기 대비 8% 늘었으나 원료 가격 상승으로 영업이익률은 1.4%p 하락했습니다.', w: 2 },
      { g: '내용', k: 'good', l: '잘된 점', t: 'area', d: '· 신규 거래처 2곳 계약, 4분기 물량 선확보\n· 재고 회전일 12일 단축\n· 물류비 톤당 3,000원 절감', w: 2, rows: 3 },
      { g: '내용', k: 'bad', l: '아쉬운 점·이슈', t: 'area', d: '· 원료 매입 단가 6% 상승\n· 9월 태풍으로 1건 선적 지연, 납기 3일 밀림', w: 2, rows: 3 },
      { g: '내용', k: 'next', l: '다음 분기 계획', t: 'area', d: '· 단가 인상분을 판가에 반영 협상\n· 재고 안전기준 재설정\n· 신규 거래처 3곳 미팅', w: 2, rows: 3 }
    ],
    sets: [{
      k: 'rows', label: '주요 지표', addLabel: '지표 추가',
      cols: [
        { k: 'name', h: '지표', w: '30%', d: '매출' },
        { k: 'now', h: '당기', t: 'num', w: '18%', d: '1450' },
        { k: 'prev', h: '전분기', t: 'num', w: '18%', d: '1340' },
        { k: 'last', h: '전년 동기', t: 'num', w: '18%', d: '1210' },
        { k: 'memo', h: '메모', w: '16%', d: '' }
      ],
      def: [
        { name: '매출', now: '1450', prev: '1340', last: '1210', memo: '신규 2곳' },
        { name: '영업이익', now: '96', prev: '105', last: '88', memo: '원가 상승' },
        { name: '당기순이익', now: '61', prev: '72', last: '55', memo: '' }
      ]
    }],
    blocks: [
      { t: 'kv', rows: [['회사', 'company'], ['보고 기간', 'period'], ['작성일', 'issueDate'], ['단위', 'unit']] },
      { t: 'amount', v: 'summary' },
      { t: 'table', set: 'rows', empty: 3, head: ['지표', '당기', '전분기', '전년 동기', '전분기 대비', '전년 대비'], cols: [
        { k: 'name', h: '지표' }, { k: 'now', h: '당기', t: 'num' }, { k: 'prev', h: '전분기', t: 'num' }, { k: 'last', h: '전년 동기', t: 'num' },
        { k: 'qoq', h: '전분기 대비', t: 'num', calc: function (r) { return H.num(r.prev) ? Math.round((H.num(r.now) - H.num(r.prev)) / H.num(r.prev) * 1000) / 10 : 0; } },
        { k: 'yoy', h: '전년 대비', t: 'num', calc: function (r) { return H.num(r.last) ? Math.round((H.num(r.now) - H.num(r.last)) / H.num(r.last) * 1000) / 10 : 0; } }
      ] },
      { t: 'sec', h: '잘된 점', v: 'good' },
      { t: 'sec', h: '아쉬운 점·이슈', v: 'bad' },
      { t: 'sec', h: '다음 분기 계획', v: 'next' },
      { t: 'sign', parties: ['A', 'B'], note: function (d) { return '단위: ' + d.f.unit + ' · 증감률은 (당기 − 비교) ÷ 비교 × 100으로 계산했습니다.'; } }
    ]
  });

  /* ---------------------------------------------------------
     4. 조직도 · 로드맵
  --------------------------------------------------------- */
  function orgRaw(d) {
    var f = d.f;
    var ms = d.sets.ms || [];
    var h = '<div class="org2" id="org2">';
    h += '<div class="org2-head"><span class="k">ORGANIZATION &amp; ROADMAP</span><h2>' + esc(f.company || '') + '</h2>' +
      '<div class="org2-sub">' + esc(f.planDate ? dko(f.planDate) : '') + ' 기준 · 작성 ' + esc(f.writer || '') + '</div></div>';
    h += '<div class="org2-title">조직도</div>';
    h += '<div class="org2-chart">';
    h += '<div class="oc top">' + esc(f.rep || '대표') + '</div><div class="ostem"></div>';
    h += '<div class="orow">';
    ['1', '2', '3'].forEach(function (n) {
      var dv = f['div' + n] || '';
      if (!dv) return;
      h += '<div class="ocol"><div class="oc">' + esc(dv) + '</div>';
      var teams = [f['team' + n + 'a'], f['team' + n + 'b']].filter(function (x) { return x && String(x).trim(); });
      teams.forEach(function (t, i) {
        h += '<div class="ostem sm"></div><div class="oc sm">' + esc(t) + '</div>';
      });
      h += '</div>';
    });
    h += '</div></div>';

    h += '<div class="org2-title">로드맵</div>';
    h += '<div class="road">';
    ['1분기', '2분기', '3분기', '4분기'].forEach(function (q) {
      var items = ms.filter(function (r) { return String(r.q || '').indexOf(q) >= 0 || String(r.q || '') === String(q).charAt(0); });
      h += '<div class="rcol"><div class="rh">' + q + '</div>';
      if (!items.length) h += '<div class="ri done"><span>—</span></div>';
      items.forEach(function (r) {
        h += '<div class="ri' + (String(r.status || '').indexOf('완') >= 0 ? ' done' : '') + '"><b>' + esc(r.item || '') + '</b>' +
          '<span>' + esc(r.owner || '') + (r.status ? ' · ' + esc(r.status) : '') + '</span></div>';
      });
      h += '</div>';
    });
    h += '</div>';
    h += '<div class="org2-memo"><span class="k">메모</span><div>' + (esc(f.memo || '—')) + '</div></div>';
    h += '<div class="fm-note">※ 조직도와 로드맵은 자체 제작한 표준 레이아웃입니다. 분기 칸에는 표의 «분기» 값이 1·2·3·4로 시작하는 항목이 들어갑니다. (예: 1분기, 2분기)</div>';
    h += '</div>';
    return h;
  }

  add({
    id: 'org-roadmap', cat: 'plan', sub: 'pl-org', no: '01', tpl: 'org',
    name: '조직도 · 로드맵', en: 'ORG CHART & ROADMAP',
    keywords: '조직도 로드맵 분기 계획 마일스톤 팀 구성 연간 계획 조직 개편',
    raw: orgRaw,
    fields: [
      { g: '문서', k: 'company', l: '회사명', d: '○○상사' },
      { g: '문서', k: 'planDate', l: '기준일', t: 'date', d: today() },
      { g: '문서', k: 'writer', l: '작성자', d: '홍길동' },
      { g: '조직', k: 'rep', l: '대표', d: '홍길동' },
      { g: '조직', k: 'div1', l: '본부 1', d: '영업본부' },
      { g: '조직', k: 'team1a', l: '└ 팀 1-1', d: '국내영업팀' },
      { g: '조직', k: 'team1b', l: '└ 팀 1-2', d: '구매팀' },
      { g: '조직', k: 'div2', l: '본부 2', d: '물류본부' },
      { g: '조직', k: 'team2a', l: '└ 팀 2-1', d: '수입통관팀' },
      { g: '조직', k: 'team2b', l: '└ 팀 2-2', d: '창고·재고팀' },
      { g: '조직', k: 'div3', l: '본부 3', d: '경영지원본부' },
      { g: '조직', k: 'team3a', l: '└ 팀 3-1', d: '회계·총무' },
      { g: '조직', k: 'team3b', l: '└ 팀 3-2', d: '' },
      { g: '메모', k: 'memo', l: '이번 해 조직·인력 메모', t: 'area', d: '영업본부에 신규 거래처 담당 1명 충원 예정. 물류는 3PL 전환 검토.', w: 2, rows: 3 }
    ],
    sets: [{
      k: 'ms', label: '분기 마일스톤', addLabel: '일정 추가',
      cols: [
        { k: 'q', h: '분기', w: '12%', d: '1분기' },
        { k: 'item', h: '마일스톤', w: '50%', d: '신규 거래처 2곳 계약' },
        { k: 'owner', h: '담당', w: '20%', d: '홍길동' },
        { k: 'status', h: '상태', w: '18%', d: '완료' }
      ],
      def: [
        { q: '1분기', item: '신규 거래처 2곳 계약', owner: '홍길동', status: '완료' },
        { q: '2분기', item: '재고 관리 시스템 도입', owner: '김철수', status: '진행' },
        { q: '3분기', item: '물류 3PL 전환', owner: '박영희', status: '예정' },
        { q: '4분기', item: '매출 30% 성장 달성', owner: '홍길동', status: '예정' }
      ]
    }]
  });

  /* ---------------------------------------------------------
     5. 분기 실적 보고 PPT (16:9)
  --------------------------------------------------------- */
  add({
    id: 'deck-result', cat: 'ppt', sub: 'pt-result', no: '01', kind: 'slides',
    name: '분기 실적 보고 (16:9)', en: 'QUARTERLY RESULTS DECK',
    keywords: '실적 보고 ppt 분기 결산 매출 영업이익 성과 발표 슬라이드 템플릿',
    fields: [
      { g: '표지', k: 'title', l: '보고 제목', d: '2026년 3분기 실적 보고', w: 2 },
      { g: '표지', k: 'company', l: '회사', d: '○○상사' },
      { g: '표지', k: 'writer', l: '발표자', d: '홍길동' },
      { g: '표지', k: 'period', l: '기간', d: '2026.07 ~ 2026.09' },
      { g: '핵심 수치', k: 'sales', l: '매출', d: '14.5억' },
      { g: '핵심 수치', k: 'op', l: '영업이익', d: '9,600만' },
      { g: '핵심 수치', k: 'growth', l: '매출 성장률', d: '+8.2%' },
      { g: '핵심 수치', k: 'summary', l: '요약 문장', t: 'area', d: '매출은 늘었지만 원료 단가 상승으로 이익률은 소폭 하락했습니다. 4분기는 판가 인상과 물류비 절감으로 만회합니다.', w: 2, rows: 3 },
      { g: '내용', k: 'good', l: '주요 성과', t: 'area', d: '신규 거래처 2곳 계약\n재고 회전일 12일 단축\n물류비 톤당 3,000원 절감', w: 2, rows: 3 },
      { g: '내용', k: 'issue', l: '이슈', t: 'area', d: '원료 매입 단가 6% 상승\n9월 선적 1건 지연', w: 2, rows: 2 },
      { g: '내용', k: 'next', l: '다음 분기 계획', t: 'area', d: '판가 인상 협상 마무리\n신규 거래처 3곳 미팅\n안전재고 기준 재설정', w: 2, rows: 3 }
    ],
    sets: [{
      k: 'kpi', label: '지표', addLabel: '지표 추가',
      cols: [
        { k: 'name', h: '지표', w: '34%', d: '매출' },
        { k: 'target', h: '목표', w: '22%', d: '14.0억' },
        { k: 'actual', h: '실적', w: '22%', d: '14.5억' },
        { k: 'rate', h: '달성률', w: '22%', d: '104%' }
      ],
      def: [
        { name: '매출', target: '14.0억', actual: '14.5억', rate: '104%' },
        { name: '영업이익', target: '1.1억', actual: '0.96억', rate: '87%' },
        { name: '신규 거래처', target: '3곳', actual: '2곳', rate: '67%' }
      ]
    }],
    slides: [
      function (d) {
        return '<div class="sl-k">QUARTERLY RESULTS</div><div class="sl-co">' + H.esc(d.f.title) + '</div>' +
          '<div class="sl-slogan">' + H.esc(d.f.company) + ' · ' + H.esc(d.f.period) + ' · ' + H.esc(d.f.writer) + '</div>';
      },
      function (d) {
        return '<div class="sl-k">01 · HIGHLIGHTS</div><h3>핵심 수치</h3>' +
          '<div class="fm-cards c3">' +
          '<div class="fm-card"><span>매출</span><b>' + H.esc(d.f.sales) + '</b><p>전분기 대비 ' + H.esc(d.f.growth) + '</p></div>' +
          '<div class="fm-card"><span>영업이익</span><b>' + H.esc(d.f.op) + '</b><p>원료 단가 상승 영향</p></div>' +
          '<div class="fm-card"><span>성장률</span><b>' + H.esc(d.f.growth) + '</b><p>전분기 대비</p></div>' +
          '</div><div class="sl-lead">' + H.esc(d.f.summary) + '</div>';
      },
      function (d) {
        var rows = d.sets.kpi || [];
        var body = '<table class="fm-table" style="margin-top:4px"><thead><tr><th>지표</th><th>목표</th><th>실적</th><th>달성률</th></tr></thead><tbody>';
        rows.forEach(function (r) {
          body += '<tr><td class="n">' + H.esc(r.name) + '</td><td class="c">' + H.esc(r.target) + '</td><td class="c">' + H.esc(r.actual) + '</td><td class="c">' + H.esc(r.rate) + '</td></tr>';
        });
        body += '</tbody></table>';
        return '<div class="sl-k">02 · KPI</div><h3>목표 대비 실적</h3><div class="sl-body">' + body + '</div>';
      },
      function (d) {
        var items = String(d.f.good || '').split('\n').filter(function (x) { return x.trim(); });
        return '<div class="sl-k">03 · WINS</div><h3>주요 성과</h3><div class="sl-body"><ol class="fm-list">' +
          items.map(function (x) { return '<li>' + H.esc(x) + '</li>'; }).join('') + '</ol></div>';
      },
      function (d) {
        var items = String(d.f.issue || '').split('\n').filter(function (x) { return x.trim(); });
        return '<div class="sl-k">04 · ISSUES</div><h3>이슈와 대응</h3><div class="sl-body"><ol class="fm-list">' +
          items.map(function (x) { return '<li>' + H.esc(x) + '</li>'; }).join('') + '</ol></div>';
      },
      function (d) {
        var items = String(d.f.next || '').split('\n').filter(function (x) { return x.trim(); });
        return '<div class="sl-k">05 · NEXT</div><h3>다음 분기 계획</h3><div class="sl-body"><ol class="fm-list">' +
          items.map(function (x) { return '<li>' + H.esc(x) + '</li>'; }).join('') + '</ol></div>';
      },
      function (d) {
        return '<div class="sl-k">THANK YOU</div><div class="sl-co" style="font-size:clamp(18px,3.4vw,32px)">' + H.esc(d.f.company) + '</div>' +
          '<div class="sl-slogan">' + H.esc(d.f.writer) + ' · ' + H.esc(d.f.period) + '</div>';
      }
    ]
  });
})(typeof window !== 'undefined' ? window : this);
