/* =========================================================
   INSIGHT BRIEF — 계약·법률·회사 확장 서식
   취업규칙, 채권양도, 광고·협찬, 업무위탁, 스톡옵션, 탄원·반성,
   개인정보 동의, 잔액확인, 초청장, 추천서.
   모든 조항 문구는 이 사이트에서 직접 작성한 표준 초안입니다.
   ========================================================= */
(function (root) {
  'use strict';
  var H = root.IBF;
  var DOCS = root.IBF_DOCS;
  var esc = H.esc, fmt = H.fmt, won = H.won, kor = H.korMoneyFull, dko = H.dateKo, today = H.todayISO, sum = H.setSum, addD = H.addDays, addM = H.addMonths;
  function add(d) { DOCS[d.id] = d; return d; }

  /* ---------------------------------------------------------
     1. 취업규칙
  --------------------------------------------------------- */
  add({
    id: 'work-rules', cat: 'contract', sub: 'ct-labor', no: '01', tpl: 'plan',
    name: '취업규칙', en: 'RULES OF EMPLOYMENT',
    keywords: '취업규칙 근로기준법 제93조 복무규정 인사규정 임금 휴가 징계 사업장 규칙',
    head: { sub: 'RULES OF EMPLOYMENT', meta: [['회사명', 'company'], ['시행일', 'effectiveDate'], ['개정', 'revisionNo']] },
    parties: [{ k: 'A', label: '사용자(대표)', nameKey: 'ceo' }, { k: 'B', label: '근로자 대표', nameKey: 'workerRep' }],
    fields: [
      { g: '사업장', k: 'company', l: '회사명', d: '○○상사' },
      { g: '사업장', k: 'ceo', l: '대표자', d: '홍길동' },
      { g: '사업장', k: 'workplace', l: '사업장 소재지', d: '서울특별시 영등포구 여의대로 108', w: 2 },
      { g: '사업장', k: 'empCount', l: '상시 근로자 수', d: '12명' },
      { g: '사업장', k: 'workerRep', l: '근로자 대표', d: '김철수' },
      { g: '사업장', k: 'effectiveDate', l: '시행일', t: 'date', d: today() },
      { g: '사업장', k: 'revisionNo', l: '개정 차수', d: '제3차' },
      { g: '근로조건', k: 'workStart', l: '시업 시각', d: '09:00' },
      { g: '근로조건', k: 'workEnd', l: '종업 시각', d: '18:00' },
      { g: '근로조건', k: 'breakMin', l: '휴게시간(분)', d: '60' },
      { g: '근로조건', k: 'workDays', l: '근로일', d: '월~금 (주 5일)' },
      { g: '근로조건', k: 'payDay', l: '임금 지급일', d: '매월 10일' },
      { g: '근로조건', k: 'payCutoff', l: '임금 산정 기간', d: '매월 1일 ~ 말일' },
      { g: '근로조건', k: 'retireAge', l: '정년', d: '만 60세' },
      { g: '근로조건', k: 'annualBase', l: '연차 기본일수', d: '15일' },
      { g: '기타', k: 'memo', l: '사업장별 특이사항', t: 'area', d: '생산직은 교대 근무표에 따라 근로시간을 달리 적용할 수 있습니다.', w: 2, rows: 2 }
    ],
    blocks: [
      { t: 'center', v: '취업규칙' },
      { t: 'center', cls: 'fm-doc-sub', v: function (d) { return d.f.company + ' · ' + d.f.revisionNo + ' · 시행 ' + dko(d.f.effectiveDate); } },
      { t: 'sec', h: '제1장 총칙', v: function (d) {
        return '제1조(목적) 이 규칙은 ' + d.f.company + '(이하 "회사")의 근로조건과 복무에 관한 사항을 정하여 근로자의 생활 안정과 회사의 질서 있는 운영에 이바지함을 목적으로 합니다.\n' +
          '제2조(적용 범위) 이 규칙은 회사에 근무하는 모든 근로자에게 적용합니다. 다만 별도로 정한 계약직·파견·용역 인력은 해당 계약이 우선합니다.\n' +
          '제3조(용어) "근로자"란 회사와 근로계약을 맺고 근로를 제공하는 사람을 말하며, "사용자"란 대표이사 또는 그 권한을 위임받은 사람을 말합니다.\n' +
          '제4조(성실 의무) 근로자는 회사의 정당한 업무 지시에 따라 성실히 근무하고, 회사의 이익을 해치는 행위를 하여서는 안 됩니다.';
      } },
      { t: 'sec', h: '제2장 채용', v: function () {
        return '제5조(채용) 회사는 직무 수행에 필요한 능력과 자격을 갖춘 사람을 공개 채용하며, 채용 시 근로계약서를 서면으로 작성해 교부합니다.\n' +
          '제6조(수습) 신규 채용자는 3개월의 수습 기간을 두며, 수습 기간의 근로조건은 근로계약으로 정한 바에 따릅니다. 수습 평가 결과 직무 수행이 현저히 곤란하다고 판단되면 본채용을 거절할 수 있습니다.\n' +
          '제7조(제출 서류) 근로자는 입사 시 신분증 사본, 통장 사본, 자격·경력 증명 등 회사가 요구하는 서류를 제출합니다. 회사는 개인정보를 채용·인사 목적에만 사용합니다.';
      } },
      { t: 'sec', h: '제3장 근로시간과 휴게', v: function (d) {
        return '제8조(소정근로시간) 근로시간은 1일 8시간, 1주 40시간으로 하며, 시업 ' + d.f.workStart + '부터 종업 ' + d.f.workEnd + '까지로 합니다. 근로일은 ' + d.f.workDays + '을 원칙으로 합니다.\n' +
          '제9조(휴게) 근로시간 중 ' + d.f.breakMin + '분의 휴게시간을 부여하며, 휴게시간은 근로자가 자유롭게 이용할 수 있습니다.\n' +
          '제10조(연장·야간·휴일근로) 회사는 업무상 필요한 경우 근로자의 동의를 받아 연장·야간·휴일근로를 시킬 수 있으며, 근로기준법이 정한 가산수당을 지급합니다.\n' +
          '제11조(근태 관리) 근로자는 출퇴근을 기록하고, 지각·조퇴·외출이 필요한 경우 사전에 소속 부서장의 승인을 받습니다.';
      } },
      { t: 'sec', h: '제4장 휴일과 휴가', v: function (d) {
        return '제12조(휴일) 주휴일은 매주 일요일로 하며, 근로기준법이 정한 공휴일과 근로자의 날을 유급휴일로 합니다.\n' +
          '제13조(연차휴가) 1년간 80% 이상 출근한 근로자에게 ' + d.f.annualBase + '의 유급 연차휴가를 부여하고, 3년 이상 근속자는 근로기준법이 정한 바에 따라 가산합니다. 1년 미만 근로자는 1개월 개근 시 1일의 유급휴가를 부여합니다.\n' +
          '제14조(연차 사용) 연차휴가는 근로자가 시기를 정해 신청하며, 회사는 업무 형편상 필요한 경우 시기를 변경할 수 있습니다. 사용하지 않은 연차의 보상과 소멸은 근로기준법과 회사의 연차 운영 기준에 따릅니다.\n' +
          '제15조(경조휴가) 본인 결혼 5일, 배우자 출산 20일, 부모·배우자 부모 사망 5일, 자녀 사망 5일, 형제자매 사망 3일의 유급 휴가를 부여합니다. 법령이 정한 기간이 이보다 길면 법령을 따릅니다.\n' +
          '제16조(병가) 업무 외 질병으로 계속 근무가 어려운 경우 병가를 신청할 수 있으며, 연간 60일을 한도로 무급으로 부여합니다. 진단서 등 증빙을 요구할 수 있습니다.';
      } },
      { t: 'sec', h: '제5장 임금', v: function (d) {
        return '제17조(임금의 구성) 임금은 기본급, 제수당, 상여금으로 구성하며, 각 항목의 금액과 지급 조건은 근로계약과 임금 규정에 따릅니다.\n' +
          '제18조(산정 기간과 지급일) 임금 산정 기간은 ' + d.f.payCutoff + '로 하고, ' + d.f.payDay + '에 근로자 명의 계좌로 지급합니다. 지급일이 휴일이면 그 전 영업일에 지급합니다.\n' +
          '제19조(공제) 법령에 따라 근로소득세, 지방소득세, 4대보험료 등은 임금에서 공제합니다.\n' +
          '제20조(휴업·휴직 중 임금) 회사의 귀책 사유로 휴업하는 경우 근로기준법이 정한 휴업수당을 지급합니다.';
      } },
      { t: 'sec', h: '제6장 퇴직과 해고', v: function (d) {
        return '제21조(정년) 근로자의 정년은 ' + d.f.retireAge + '로 하며, 정년에 이른 날의 다음 날에 근로관계가 종료됩니다.\n' +
          '제22조(퇴직) 근로자가 퇴직하려면 30일 전에 사직서를 제출하고 업무 인수인계를 마쳐야 합니다.\n' +
          '제23조(해고) 회사는 근로기준법이 정한 정당한 이유가 있는 경우에만 해고하며, 해고 사유와 시기를 서면으로 통지합니다. 해고 예고와 구제 신청에 관한 사항은 근로기준법에 따릅니다.\n' +
          '제24조(퇴직금) 계속 근로기간 1년 이상인 근로자에게 근로기준법이 정한 퇴직금을 지급합니다.';
      } },
      { t: 'sec', h: '제7장 징계', v: function () {
        return '제25조(징계 사유) 다음 각 호의 어느 하나에 해당하는 경우 징계할 수 있습니다. ① 업무 지시 위반 또는 근태 불량 ② 회사 재산·정보의 부당 사용 ③ 직장 질서 문란 행위 ④ 다른 근로자에 대한 괴롭힘·성희롱 ⑤ 허위 보고 또는 부정 청구.\n' +
          '제26조(징계의 종류) 견책, 감봉, 정직, 해고로 하며, 감봉·정직은 근로기준법이 정한 한도를 넘지 않습니다.\n' +
          '제27조(징계 절차) 징계 전에 해당 근로자에게 사유를 알리고 소명 기회를 주어야 하며, 징계위원회를 열어 결정합니다. 근로자는 결과에 대해 7일 이내에 이의를 제기할 수 있습니다.';
      } },
      { t: 'sec', h: '제8장 안전·보건과 재해보상', v: function () {
        return '제28조(안전·보건) 회사와 근로자는 산업안전보건법에 따라 안전수칙을 지키고, 위험 요소를 발견하면 즉시 보고합니다.\n' +
          '제29조(재해보상) 업무상 재해를 입은 근로자에 대해서는 근로기준법과 산재보험법이 정한 절차에 따라 보상합니다.';
      } },
      { t: 'sec', h: '제9장 보칙', v: function (d) {
        return '제30조(비밀 유지) 근로자는 재직 중 알게 된 회사의 영업 비밀과 거래처 정보를 재직 중은 물론 퇴직 후에도 누설하지 않습니다.\n' +
          '제31조(겸업) 근로자는 회사의 사전 승인 없이 경쟁 관계에 있는 업무에 종사하거나 다른 사업을 운영할 수 없습니다.\n' +
          '제32조(규칙의 개정) 회사가 이 규칙을 개정할 때에는 근로자 과반수의 의견을 듣고, 불이익 변경 시 근로자 과반수의 동의를 받습니다.\n' +
          (d.f.memo ? '제33조(특이사항) ' + d.f.memo + '\n' : '') +
          '부칙 이 규칙은 ' + dko(d.f.effectiveDate) + '부터 시행합니다.';
      } },
      { t: 'sign', parties: ['A', 'B'], note: function (d) { return '사용자 ' + d.f.ceo + ' · 근로자 대표 ' + d.f.workerRep + ' — 이 규칙을 작성하고 근로자 과반수의 의견을 들었음을 확인합니다.'; } },
      { t: 'note', v: function () { return '※ 취업규칙은 상시 근로자 10명 이상 사업장에서 작성·신고가 의무이며(근로기준법 제93조), 법령·단체협약보다 불리한 내용은 효력이 없습니다. 이 문서는 일반적인 항목을 담은 자체 초안이므로, 실제 시행 전에는 노무사·변호사의 검토를 받고 고용노동부 서식과 사업장 실정에 맞게 보완하세요.'; } }
    ]
  });

  /* ---------------------------------------------------------
     2. 채권양도 합의서
  --------------------------------------------------------- */
  add({
    id: 'receivable-assign', cat: 'contract', sub: 'ct-money', no: '01', tpl: 'doc',
    name: '채권양도 합의서', en: 'ASSIGNMENT OF RECEIVABLES',
    keywords: '채권양도 합의서 양도인 양수인 채무자 통지 승낙 미수금 받을돈',
    head: { sub: 'ASSIGNMENT OF RECEIVABLES', meta: [['작성일', 'issueDate'], ['양도가액', function (d) { return won(d.f.assignPrice); }]] },
    parties: [{ k: 'A', label: '양도인', nameKey: 'assignorCeo' }, { k: 'B', label: '양수인', nameKey: 'assigneeCeo' }, { k: 'C', label: '채무자 확인', nameKey: 'debtorCeo' }],
    fields: [
      { g: '문서', k: 'issueDate', l: '작성일', t: 'date', d: today() },
      { g: '양도인', k: 'assignor', l: '상호', d: '○○상사' },
      { g: '양도인', k: 'assignorCeo', l: '대표자', d: '홍길동' },
      { g: '양도인', k: 'assignorAddr', l: '주소', d: '서울특별시 영등포구 여의대로 108', w: 2 },
      { g: '양수인', k: 'assignee', l: '상호', d: '△△캐피탈' },
      { g: '양수인', k: 'assigneeCeo', l: '대표자', d: '김철수' },
      { g: '양수인', k: 'assigneeAddr', l: '주소', d: '부산광역시 사상구 낙동대로 100', w: 2 },
      { g: '채권', k: 'debtor', l: '채무자 상호', d: '□□물산' },
      { g: '채무자', k: 'debtorCeo', l: '채무자 대표자', d: '박영희' },
      { g: '채무자', k: 'debtorAddr', l: '채무자 주소', d: '인천광역시 남동구 ○○로 12', w: 2 },
      { g: '채권 내용', k: 'origin', l: '채권 발생 원인', d: '2026년 8월 물품 공급 계약에 따른 외상 매출금', w: 2 },
      { g: '채권 내용', k: 'amount', l: '채권 금액', t: 'num', d: '12000000' },
      { g: '채권 내용', k: 'dueDate', l: '변제기', t: 'date', d: addD(today(), 30) },
      { g: '채권 내용', k: 'assignPrice', l: '양도가액', t: 'num', d: '11000000' },
      { g: '채권 내용', k: 'payDate', l: '양도대금 지급일', t: 'date', d: addD(today(), 7) },
      { g: '채권 내용', k: 'notice', l: '채무자 통지', t: 'sel', opts: ['이 문서로 통지하고 승낙받음', '별도 내용증명으로 통지', '통지 예정'], d: '이 문서로 통지하고 승낙받음' }
    ],
    blocks: [
      { t: 'parties', cols: [
        { title: '양도인', rows: [['상호', 'assignor'], ['대표자', 'assignorCeo'], ['주소', 'assignorAddr']] },
        { title: '양수인', rows: [['상호', 'assignee'], ['대표자', 'assigneeCeo'], ['주소', 'assigneeAddr']] }
      ] },
      { t: 'sec', h: '제1조 (양도의 목적)', v: function (d) {
        return '양도인은 아래 채권을 양수인에게 양도하고, 양수인은 이를 승낙한다.\n· 채무자: ' + d.f.debtor + ' (' + d.f.debtorAddr + ')\n· 채권 발생 원인: ' + d.f.origin + '\n· 채권 금액: ' + kor(d.f.amount) + ' (₩ ' + fmt(d.f.amount) + ')\n· 변제기: ' + dko(d.f.dueDate);
      } },
      { t: 'sec', h: '제2조 (양도가액과 지급)', v: function (d) {
        return '양수인은 양도인에게 양도대금 ' + kor(d.f.assignPrice) + ' (₩ ' + fmt(d.f.assignPrice) + ')을 ' + dko(d.f.payDate) + '까지 지급한다. 지급 계좌는 양도인이 지정하는 계좌로 한다.';
      } },
      { t: 'sec', h: '제3조 (채무자에 대한 통지와 승낙)', v: function (d) {
        return '이 양도는 ' + d.f.notice + ' 방식으로 채무자에게 통지한다. 채무자는 이 문서의 확인란에 서명함으로써 양도 사실을 확인하고, 양도인에게 지급할 채무가 소멸하였음을 확인한다.';
      } },
      { t: 'sec', h: '제4조 (진술과 보장)', v: function () {
        return '양도인은 ① 이 채권이 유효하게 성립하였고 ② 제3자에게 이중으로 양도되거나 압류·가압류되지 않았으며 ③ 양도인과 채무자 사이에 이 채권의 존재를 부인할 만한 합의가 없음을 보장한다.';
      } },
      { t: 'sec', h: '제5조 (추심과 비용)', v: function () {
        return '양도 이후 채권의 추심 권한과 비용은 양수인이 부담한다. 다만 양도인의 귀책 사유로 채권이 존재하지 않는 것으로 밝혀지면 양도인은 양도대금을 반환한다.';
      } },
      { t: 'sec', h: '제6조 (비밀 유지 · 관할)', v: function () {
        return '당사자는 이 합의로 알게 된 상대방의 정보를 제3자에게 누설하지 않는다. 이 합의에 관한 분쟁은 양도인의 본점 소재지를 관할하는 법원을 제1심 관할로 한다.';
      } },
      { t: 'body', v: function (d) { return dko(d.f.issueDate); } },
      { t: 'sign', parties: ['A', 'B', 'C'], note: function () { return '양도인·양수인이 각각 서명하고, 채무자는 양도 사실을 확인합니다.'; } },
      { t: 'note', v: function () { return '※ 채권양도는 채무자에게 통지하거나 채무자의 승낙을 받아야 대항할 수 있습니다(민법 제450조). 내용증명 우편·확정일자 등 증빙을 남기고, 세금계산서·계약서 등 채권 발생을 증명하는 서류를 함께 보관하세요. 이 문서는 자체 표준 초안이며 법률 자문이 아닙니다.'; } }
    ]
  });

  /* ---------------------------------------------------------
     3. 인플루언서 광고·협찬 계약서
  --------------------------------------------------------- */
  add({
    id: 'influencer-ad', cat: 'contract', sub: 'ct-ad', no: '01', tpl: 'doc',
    name: '인플루언서 광고·협찬 계약서', en: 'INFLUENCER COLLABORATION AGREEMENT',
    keywords: '인플루언서 광고 협찬 계약서 유튜브 인스타 릴스 표시광고 대가 2차 사용권 협찬 계약',
    head: { sub: 'INFLUENCER COLLABORATION AGREEMENT', meta: [['계약일', 'issueDate'], ['계약 금액', function (d) { return won(d.f.fee); }]] },
    parties: [{ k: 'A', label: '광고주', nameKey: 'advertiserCeo' }, { k: 'B', label: '인플루언서', nameKey: 'creatorName' }],
    fields: [
      { g: '계약', k: 'issueDate', l: '계약일', t: 'date', d: today() },
      { g: '계약', k: 'campaign', l: '캠페인명', d: '2026 겨울 신제품 협찬', w: 2 },
      { g: '광고주', k: 'advertiser', l: '상호', d: '○○커머스' },
      { g: '광고주', k: 'advertiserCeo', l: '대표자', d: '홍길동' },
      { g: '광고주', k: 'advertiserContact', l: '담당자·연락처', d: '김철수 / 02-0000-0000', w: 2 },
      { g: '인플루언서', k: 'creatorName', l: '이름(활동명)', d: '김하늘 (@haneul_daily)' },
      { g: '인플루언서', k: 'channel', l: '채널', d: '인스타그램 릴스 / 유튜브 쇼츠', w: 2 },
      { g: '인플루언서', k: 'creatorAddr', l: '주소', d: '서울특별시 ○○구 ○○로 00', w: 2 },
      { g: '인플루언서', k: 'creatorBizNo', l: '사업자등록번호(있는 경우)', d: '000-00-00000' },
      { g: '콘텐츠', k: 'format', l: '콘텐츠 형식', d: '릴스 2편(각 30초 이상) + 스토리 1회', w: 2 },
      { g: '콘텐츠', k: 'postPeriod', l: '게시 기간', d: '2026-12-01 ~ 2026-12-15' },
      { g: '콘텐츠', k: 'reviewCount', l: '검수 횟수', d: '2회 (기획안·최종본)' },
      { g: '콘텐츠', k: 'keepPeriod', l: '게시 유지 기간', d: '게시 후 6개월' },
      { g: '대가', k: 'fee', l: '계약 금액', t: 'num', d: '1500000' },
      { g: '대가', k: 'payDate', l: '지급일', t: 'date', d: addD(today(), 20) },
      { g: '대가', k: 'payMethod', l: '지급 방법', d: '원천징수 후 계좌 이체' },
      { g: '대가', k: 'product', l: '제공 제품', d: '신제품 2종 (반환 불요)' },
      { g: '조항', k: 'disclosure', l: '대가 표시 문구', d: '본 콘텐츠는 ○○커머스의 제품 협찬을 받아 제작했습니다.', w: 2 },
      { g: '조항', k: 'usage', l: '2차 사용 범위', d: '광고주의 자사 채널·광고 소재로 6개월 사용 가능, 제3자 재판매 불가', w: 2 },
      { g: '조항', k: 'exclusive', l: '경쟁사 제한', d: '게시 전후 30일간 동일 카테고리 경쟁사 협찬 금지' },
      { g: '조항', k: 'etc', l: '기타 특약', t: 'area', d: '· 제품 하자로 인한 교환은 광고주가 부담\n· 게시물 삭제·수정은 양측 합의로만', w: 2, rows: 3 }
    ],
    blocks: [
      { t: 'parties', cols: [
        { title: '광고주', rows: [['상호', 'advertiser'], ['대표자', 'advertiserCeo'], ['담당', 'advertiserContact']] },
        { title: '인플루언서', rows: [['이름', 'creatorName'], ['채널', 'channel'], ['사업자번호', 'creatorBizNo']] }
      ] },
      { t: 'sec', h: '제1조 (목적)', v: function (d) { return '이 계약은 광고주 ' + d.f.advertiser + '가 인플루언서 ' + d.f.creatorName + '에게 제품을 제공하고, 인플루언서가 ' + d.f.campaign + ' 캠페인의 콘텐츠를 제작·게시하는 조건을 정한다.'; } },
      { t: 'sec', h: '제2조 (콘텐츠와 일정)', v: function (d) { return '· 형식: ' + d.f.format + '\n· 게시 기간: ' + d.f.postPeriod + '\n· 검수: ' + d.f.reviewCount + ' (광고주는 검수 요청 후 48시간 내 의견을 제시한다)\n· 게시 유지: ' + d.f.keepPeriod; } },
      { t: 'sec', h: '제3조 (대가와 지급)', v: function (d) { return '광고주는 인플루언서에게 ' + kor(d.f.fee) + ' (₩ ' + fmt(d.f.fee) + ')을 ' + dko(d.f.payDate) + '까지 ' + d.f.payMethod + ' 방식으로 지급한다. 제품(' + d.f.product + ')은 별도 대가로 본다.'; } },
      { t: 'sec', h: '제4조 (표시 광고 의무)', v: function (d) { return '인플루언서는 콘텐츠 첫 부분 또는 화면에 "' + d.f.disclosure + '" 문구를 알아보기 쉽게 표시한다. 경제적 이해관계를 숨기거나 과장·허위 표현을 하지 않는다.'; } },
      { t: 'sec', h: '제5조 (저작권과 2차 사용)', v: function (d) { return '콘텐츠의 저작권은 인플루언서에게 있다. 광고주는 ' + d.f.usage + ' 범위에서 사용할 수 있으며, 범위를 넘는 사용은 별도 합의한다.'; } },
      { t: 'sec', h: '제6조 (경쟁사 제한·비밀 유지)', v: function (d) { return d.f.exclusive + '. 양측은 계약으로 알게 된 상대방의 정보와 계약 조건을 제3자에게 공개하지 않는다.'; } },
      { t: 'sec', h: '제7조 (해지와 손해배상)', v: function () { return '일방이 계약을 위반해 상대방에게 손해가 발생하면 손해를 배상한다. 게시 전 해지 시 이미 발생한 제작비는 광고주가 부담하고, 게시 후 인플루언서의 귀책으로 삭제된 경우 대가는 감액될 수 있다.'; } },
      { t: 'sec', h: '제8조 (기타 특약)', v: 'etc' },
      { t: 'sign', parties: ['A', 'B'], note: function (d) { return '계약일 ' + dko(d.f.issueDate) + ' · 양측이 계약 내용을 확인하고 각각 서명합니다.'; } },
      { t: 'note', v: function () { return '※ 공정거래위원회 「추천·보증 등에 관한 표시·광고 심사지침」에 따라 경제적 대가를 받은 사실을 소비자가 알아볼 수 있게 표시해야 합니다. 원천징수(사업소득 3.3% 등)와 세금계산서 발행 여부는 인플루언서의 사업자 등록 상태에 따라 달라지므로 세무사와 확인하세요. 이 문서는 자체 초안입니다.'; } }
    ]
  });

  /* ---------------------------------------------------------
     4. 업무위탁(도급) 계약서
  --------------------------------------------------------- */
  add({
    id: 'outsourcing', cat: 'contract', sub: 'ct-free', no: '03', tpl: 'doc',
    name: '업무위탁(도급) 계약서', en: 'SERVICE OUTSOURCING AGREEMENT',
    keywords: '업무위탁 도급 계약서 외주 용역 위탁 계약 성과물 지재권 검수 기업간',
    head: { sub: 'SERVICE OUTSOURCING AGREEMENT', meta: [['계약일', 'issueDate'], ['계약 금액', function (d) { return won(d.f.fee); }]] },
    parties: [{ k: 'A', label: '위탁자', nameKey: 'clientCeo' }, { k: 'B', label: '수탁자', nameKey: 'vendorCeo' }],
    fields: [
      { g: '계약', k: 'issueDate', l: '계약일', t: 'date', d: today() },
      { g: '계약', k: 'title', l: '계약명', d: '재고관리 시스템 구축 용역', w: 2 },
      { g: '위탁자', k: 'client', l: '상호', d: '○○상사' },
      { g: '위탁자', k: 'clientCeo', l: '대표자', d: '홍길동' },
      { g: '위탁자', k: 'clientAddr', l: '주소', d: '서울특별시 영등포구 여의대로 108', w: 2 },
      { g: '수탁자', k: 'vendor', l: '상호', d: '△△테크' },
      { g: '수탁자', k: 'vendorCeo', l: '대표자', d: '김철수' },
      { g: '수탁자', k: 'vendorBizNo', l: '사업자등록번호', d: '000-00-00000' },
      { g: '수탁자', k: 'vendorAddr', l: '주소', d: '부산광역시 사상구 낙동대로 100', w: 2 },
      { g: '업무', k: 'scope', l: '업무 범위', t: 'area', d: '· 재고 입출고 화면 설계 및 개발\n· 바코드 스캔 연동\n· 관리자용 월별 재고 리포트\n· 사용자 교육 1회(2시간)', w: 2, rows: 4 },
      { g: '업무', k: 'exclude', l: '제외 범위', t: 'area', d: '· 서버·클라우드 이용료\n· 기존 ERP 수정\n· 추가 기능 개발(별도 견적)', w: 2, rows: 2 },
      { g: '일정·대금', k: 'startDate', l: '착수일', t: 'date', d: today() },
      { g: '일정·대금', k: 'endDate', l: '완료 예정일', t: 'date', d: addM(today(), 2) },
      { g: '일정·대금', k: 'fee', l: '계약 금액', t: 'num', d: '12000000' },
      { g: '일정·대금', k: 'payTerms', l: '대금 지급', d: '계약금 30% / 중도금 40% / 잔금 30%(검수 후 7일)', w: 2 },
      { g: '일정·대금', k: 'warranty', l: '하자 보수 기간', d: '검수 완료 후 3개월' },
      { g: '기타', k: 'ip', l: '성과물 권리', d: '검수 완료 및 대금 지급 완료 시 위탁자에게 이전', w: 2 },
      { g: '기타', k: 'penalty', l: '지연·해지', d: '귀책으로 2주 이상 지연 시 총액의 5% 감액, 중대 위반 시 해지 가능', w: 2 }
    ],
    blocks: [
      { t: 'parties', cols: [
        { title: '위탁자', rows: [['상호', 'client'], ['대표자', 'clientCeo'], ['주소', 'clientAddr']] },
        { title: '수탁자', rows: [['상호', 'vendor'], ['대표자', 'vendorCeo'], ['사업자번호', 'vendorBizNo'], ['주소', 'vendorAddr']] }
      ] },
      { t: 'sec', h: '제1조 (목적)', v: function (d) { return '이 계약은 위탁자 ' + d.f.client + '가 수탁자 ' + d.f.vendor + '에게 "' + d.f.title + '" 업무를 위탁하고, 수탁자가 이를 완성해 공급하는 조건을 정한다. 수탁자는 위탁자의 지시에 따른 근로자가 아니라 독립된 사업자로서 업무를 수행한다.'; } },
      { t: 'sec', h: '제2조 (업무 범위)', v: function (d) { return '수탁자가 수행할 업무는 다음과 같다.\n' + d.f.scope + '\n다음은 이 계약의 범위에서 제외한다.\n' + d.f.exclude; } },
      { t: 'sec', h: '제3조 (기간과 일정)', v: function (d) { return '착수일은 ' + dko(d.f.startDate) + ', 완료 예정일은 ' + dko(d.f.endDate) + '로 한다. 수탁자는 주 1회 진행 상황을 서면으로 보고한다.'; } },
      { t: 'sec', h: '제4조 (대금과 지급)', v: function (d) { return '총 계약 금액은 ' + kor(d.f.fee) + ' (₩ ' + fmt(d.f.fee) + ')이며, 지급 조건은 ' + d.f.payTerms + '로 한다. 세금계산서는 지급 요청 시 발행한다.'; } },
      { t: 'sec', h: '제5조 (검수)', v: function () { return '위탁자는 결과물을 받은 날부터 7일 이내에 검수하고, 기준 미달인 부분은 구체적으로 적어 보완을 요청한다. 기간 내 이의가 없으면 검수에 합격한 것으로 본다.'; } },
      { t: 'sec', h: '제6조 (지식재산권)', v: function (d) { return '성과물에 대한 권리는 ' + d.f.ip + '. 수탁자는 계약 전부터 보유한 기술·라이브러리를 계속 사용할 수 있으며, 제3자의 권리를 침해하지 않음을 보장한다.'; } },
      { t: 'sec', h: '제7조 (비밀 유지)', v: function () { return '양측은 계약 수행 중 알게 된 상대방의 영업·기술 정보를 계약 종료 후 3년간 제3자에게 공개하지 않는다. 법령에 따라 공개가 요구되는 경우는 예외로 한다.'; } },
      { t: 'sec', h: '제8조 (지연·해지·손해배상)', v: function (d) { return d.f.penalty + '. 해지 시 이미 완료된 부분에 대해서는 비례해 정산한다. 하자 보수 기간은 ' + d.f.warranty + '로 한다.'; } },
      { t: 'sec', h: '제9조 (분쟁 해결)', v: function () { return '이 계약에 관한 분쟁은 상호 협의로 해결하고, 협의가 되지 않으면 위탁자의 본점 소재지를 관할하는 법원에 제소한다.'; } },
      { t: 'sign', parties: ['A', 'B'], note: function (d) { return '계약일 ' + dko(d.f.issueDate) + ' · 계약 내용을 확인하고 각각 서명·날인합니다.'; } },
      { t: 'note', v: function () { return '※ 실제 근무 형태가 위탁자가 지시·감독하는 근로에 가깝다면 근로자로 판단될 수 있습니다. 업무 수행 방법·시간·장소의 재량, 4대보험·원천징수 방식 등이 판단 자료가 되므로, 상시적·계속적 업무라면 노무사 상담을 권합니다. 이 문서는 자체 표준 초안입니다.'; } }
    ]
  });

  /* ---------------------------------------------------------
     5. 스톡옵션(주식매수선택권) 계약서
  --------------------------------------------------------- */
  add({
    id: 'stock-option', cat: 'contract', sub: 'ct-money', no: '02', tpl: 'doc',
    name: '스톡옵션 계약서', en: 'STOCK OPTION AGREEMENT',
    keywords: '스톡옵션 주식매수선택권 계약서 행사가격 베스팅 주식 보상 창업 스타트업',
    head: { sub: 'STOCK OPTION AGREEMENT', meta: [['계약일', 'issueDate'], ['부여 주식수', 'shares']] },
    parties: [{ k: 'A', label: '회사', nameKey: 'companyCeo' }, { k: 'B', label: '부여대상자', nameKey: 'grantee' }],
    fields: [
      { g: '계약', k: 'issueDate', l: '계약일', t: 'date', d: today() },
      { g: '회사', k: 'company', l: '회사명', d: '○○테크 주식회사' },
      { g: '회사', k: 'companyCeo', l: '대표자', d: '홍길동' },
      { g: '회사', k: 'companyAddr', l: '본점 주소', d: '서울특별시 강남구 ○○로 00', w: 2 },
      { g: '부여 대상', k: 'grantee', l: '성명', d: '김철수' },
      { g: '부여 대상', k: 'position', l: '직위', d: '개발이사' },
      { g: '부여 대상', k: 'granteeAddr', l: '주소', d: '서울특별시 ○○구 ○○로 00', w: 2 },
      { g: '부여 내용', k: 'shares', l: '부여 주식수', d: '10,000주' },
      { g: '부여 내용', k: 'stockKind', l: '주식 종류', d: '보통주 (기명식)', w: 2 },
      { g: '부여 내용', k: 'exercisePrice', l: '행사가격(1주)', t: 'num', d: '1000' },
      { g: '부여 내용', k: 'grantDate', l: '부여일', t: 'date', d: today() },
      { g: '부여 내용', k: 'vestStart', l: '베스팅 개시일', t: 'date', d: today() },
      { g: '부여 내용', k: 'vestMonths', l: '베스팅 기간(개월)', t: 'num', d: '48' },
      { g: '부여 내용', k: 'cliff', l: '클리프(개월)', t: 'num', d: '12' },
      { g: '부여 내용', k: 'exerciseEnd', l: '행사 만료일', t: 'date', d: function () { return addM(today(), 120); } },
      { g: '조건', k: 'condition', l: '행사 조건·제한', t: 'area', d: '· 재직 중일 것\n· 회사가 정한 성과 목표 달성 시 가속 베스팅 가능\n· 퇴직 시 미행사분 소멸', w: 2, rows: 3 },
      { g: '조건', k: 'etc', l: '기타 특약', t: 'area', d: '· 자본금 증자·감자, 주식분할 시 행사가격과 수량을 조정\n· 계약 양도 불가', w: 2, rows: 3 }
    ],
    blocks: [
      { t: 'parties', cols: [
        { title: '회사', rows: [['회사명', 'company'], ['대표자', 'companyCeo'], ['주소', 'companyAddr']] },
        { title: '부여대상자', rows: [['성명', 'grantee'], ['직위', 'position'], ['주소', 'granteeAddr']] }
      ] },
      { t: 'sec', h: '제1조 (목적)', v: function (d) { return '회사는 ' + d.f.grantee + '의 기여를 인정하고 장기적인 성과를 함께하기 위해, 이 계약에서 정한 조건에 따라 회사 주식을 매수할 수 있는 권리(주식매수선택권, 이하 "스톡옵션")를 부여한다.'; } },
      { t: 'sec', h: '제2조 (부여 내용)', v: function (d) { return '· 주식 종류: ' + d.f.stockKind + '\n· 부여 주식수: ' + d.f.shares + '\n· 1주당 행사가격: ' + won(d.f.exercisePrice) + '\n· 부여일: ' + dko(d.f.grantDate) + '\n· 행사 만료일: ' + dko(d.f.exerciseEnd); } },
      { t: 'sec', h: '제3조 (베스팅)', v: function (d) { return '스톡옵션은 ' + dko(d.f.vestStart) + '부터 ' + d.f.vestMonths + '개월 동안 매월 균등하게 베스팅된다. 다만 ' + d.f.cliff + '개월이 지나기 전에는 어떠한 부분도 행사할 수 없으며, 클리프 도달 시 그때까지 베스팅된 부분을 일괄 행사할 수 있다.'; } },
      { t: 'sec', h: '제4조 (행사)', v: function () { return '부여대상자는 베스팅된 범위에서 회사에 행사 의사를 서면으로 통지하고, 통지일로부터 30일 이내에 행사대금을 납부한다. 회사는 관련 서류를 갖추어 주주명부에 기재한다.'; } },
      { t: 'sec', h: '제5조 (행사 조건과 제한)', v: function (d) { return d.f.condition + '. 회사는 자본 변동이 있을 때 행사가격과 주식수를 공정하게 조정한다.'; } },
      { t: 'sec', h: '제6조 (퇴직과 상실)', v: function () { return '부여대상자가 사임·해고 등으로 재직을 그만두면, 퇴직일까지 베스팅된 부분은 퇴직일로부터 90일 이내에 행사할 수 있고, 그 기간이 지나거나 베스팅되지 않은 부분은 소멸한다. 회사의 귀책으로 해고된 경우 90일의 행사 기간을 인정한다.'; } },
      { t: 'sec', h: '제7조 (양도 금지·세무)', v: function () { return '스톡옵션과 이로 인한 권리는 원칙적으로 제3자에게 양도할 수 없다. 행사와 매도에 따른 세금은 부여대상자가 부담하며, 회사는 법령에 따른 원천징수에 협조한다.'; } },
      { t: 'sec', h: '제8조 (기타 특약)', v: 'etc' },
      { t: 'sign', parties: ['A', 'B'], note: function (d) { return '계약일 ' + dko(d.f.issueDate) + ' · 회사와 부여대상자가 각각 서명·날인합니다.'; } },
      { t: 'note', v: function () { return '※ 주식매수선택권은 벤처기업법·상법 등 관련 법령의 요건과 주주총회 결의가 필요할 수 있고, 세제(과세이연·의제배당 등)는 부여 방식에 따라 달라집니다. 이 문서는 일반적인 조건을 정리한 자체 초안이므로, 실제 도입 전 법무·세무 검토를 받으세요.'; } }
    ]
  });

  /* ---------------------------------------------------------
     6. 탄원서
  --------------------------------------------------------- */
  add({
    id: 'petition', cat: 'contract', sub: 'ct-appeal', no: '01', tpl: 'letter',
    name: '탄원서', en: 'PETITION',
    keywords: '탄원서 탄원 양형 선처 사건 피고인 탄원 취지 진정서',
    head: { sub: 'PETITION', meta: [['작성일', 'issueDate'], ['사건번호', 'caseNo']] },
    parties: [{ k: 'A', label: '탄원인', nameKey: 'petitioner' }],
    fields: [
      { g: '문서', k: 'issueDate', l: '작성일', t: 'date', d: today() },
      { g: '문서', k: 'caseNo', l: '사건번호', d: '2026고단0000' },
      { g: '문서', k: 'court', l: '제출 기관', d: '○○지방법원 형사합의00부' },
      { g: '대상자', k: 'target', l: '대상자(피고인) 성명', d: '김○○' },
      { g: '대상자', k: 'relation', l: '탄원인과의 관계', d: '직장 동료 (5년)' },
      { g: '탄원인', k: 'petitioner', l: '탄원인 성명', d: '홍길동' },
      { g: '탄원인', k: 'petitionerAddr', l: '주소', d: '서울특별시 영등포구 여의대로 108', w: 2 },
      { g: '탄원인', k: 'petitionerTel', l: '연락처', d: '010-0000-0000' },
      { g: '내용', k: 'intro', l: '탄원 취지', t: 'area', d: '위 사건의 피고인 김○○에 대하여 선처를 바라는 마음으로 이 탄원서를 제출합니다.', w: 2, rows: 2 },
      { g: '내용', k: 'body1', l: '대상자의 평소 행실', t: 'area', d: '김○○은 5년간 같은 부서에서 근무하며 맡은 업무를 성실히 수행했습니다. 어려운 업무도 먼저 나서서 처리했고, 후배들의 실수를 대신 책임지는 모습을 여러 번 보았습니다.', w: 2, rows: 3 },
      { g: '내용', k: 'body2', l: '사건에 대한 소회', t: 'area', d: '이번 일은 우발적으로 발생한 것으로 알고 있습니다. 본인도 깊이 반성하고 있으며, 피해를 입은 분께 사과하고 회복을 위해 노력하고 있다고 들었습니다.', w: 2, rows: 3 },
      { g: '내용', k: 'body3', l: '가족·생활 사정', t: 'area', d: '김○○은 홀로 계신 어머니를 부양하고 있습니다. 지금이라도 사회로 돌아와 다시 일할 수 있다면, 같은 실수를 반복하지 않고 책임을 다할 것으로 믿습니다.', w: 2, rows: 3 }
    ],
    blocks: [
      { t: 'center', v: '탄 원 서' },
      { t: 'kv', rows: [['사건번호', 'caseNo'], ['제출 기관', 'court'], ['대상자', 'target'], ['탄원인', function (d) { return d.f.petitioner + ' (' + d.f.relation + ')'; }]] },
      { t: 'body', v: 'intro' },
      { t: 'sec', h: '1. 평소 행실', v: 'body1' },
      { t: 'sec', h: '2. 이번 사건에 대하여', v: 'body2' },
      { t: 'sec', h: '3. 가족·생활 사정', v: 'body3' },
      { t: 'body', v: function (d) { return '위와 같은 사정을 살펴보시어, ' + d.f.target + '에게 다시 한 번 기회를 주시기를 간절히 바랍니다.'; } },
      { t: 'body', v: function (d) { return dko(d.f.issueDate); } },
      { t: 'body', v: function (d) { return '탄원인: ' + d.f.petitioner + ' (서명 또는 날인)\n주소: ' + d.f.petitionerAddr + '\n연락처: ' + d.f.petitionerTel; } },
      { t: 'sign', parties: ['A'], note: function () { return '탄원인이 직접 서명·날인하고, 신분증 사본을 함께 첨부하면 형식이 갖추어집니다.'; } },
      { t: 'note', v: function () { return '※ 탄원서는 수사·재판 단계에서 참고 자료로 제출되는 문서이며, 사실과 다른 내용을 적으면 오히려 불리하게 평가될 수 있습니다. 허위 사실 기재는 처벌 대상이 될 수 있으니 경험한 사실만 담백하게 쓰세요. 제출 방식은 담당 법원·검찰청에 확인하세요.'; } }
    ]
  });

  /* ---------------------------------------------------------
     7. 반성문
  --------------------------------------------------------- */
  add({
    id: 'reflection', cat: 'contract', sub: 'ct-appeal', no: '02', tpl: 'letter',
    name: '반성문', en: 'LETTER OF REFLECTION',
    keywords: '반성문 선처 반성문 양식 사과 반성 탄원 형사',
    head: { sub: 'LETTER OF REFLECTION', meta: [['작성일', 'issueDate'], ['사건번호', 'caseNo']] },
    parties: [{ k: 'A', label: '작성자', nameKey: 'writer' }],
    fields: [
      { g: '문서', k: 'issueDate', l: '작성일', t: 'date', d: today() },
      { g: '문서', k: 'caseNo', l: '사건번호', d: '2026고단0000' },
      { g: '문서', k: 'court', l: '제출 기관', d: '○○지방법원' },
      { g: '작성자', k: 'writer', l: '작성자 성명', d: '김○○' },
      { g: '작성자', k: 'writerAddr', l: '주소', d: '서울특별시 ○○구 ○○로 00', w: 2 },
      { g: '작성자', k: 'writerTel', l: '연락처', d: '010-0000-0000' },
      { g: '내용', k: 'intro', l: '머리말', t: 'area', d: '존경하는 재판장님, 저는 이번 사건으로 깊이 반성하고 있는 김○○입니다. 부끄러운 마음으로 이 글을 올립니다.', w: 2, rows: 3 },
      { g: '내용', k: 'what', l: '1. 어떤 일을 했는지', t: 'area', d: '2026년 ○월 ○일, 저는 ○○한 행동을 했습니다. 그 순간의 판단이 얼마나 잘못되었는지 지금은 분명히 알고 있습니다.', w: 2, rows: 3 },
      { g: '내용', k: 'why', l: '2. 왜 그랬는지', t: 'area', d: '당시 저는 상황을 제대로 보지 못하고 조급하게 행동했습니다. 변명하고 싶지 않습니다. 제 판단이 틀렸고, 그 책임은 저에게 있습니다.', w: 2, rows: 3 },
      { g: '내용', k: 'sorry', l: '3. 피해자에게 드리는 말', t: 'area', d: '피해를 입으신 분께 진심으로 사과드립니다. 제 행동으로 받으셨을 상처와 불편을 생각하면 죄스러운 마음뿐입니다. 회복을 위해 제가 할 수 있는 일을 다 하겠습니다.', w: 2, rows: 3 },
      { g: '내용', k: 'promise', l: '4. 다시 하지 않겠다는 다짐', t: 'area', d: '다시는 같은 일이 없도록 스스로를 돌아보고, 배우고 확인하는 습관을 기르겠습니다. 주변 사람들의 조언을 듣고, 어려운 일이 생기면 혼자 판단하지 않고 상의하겠습니다.', w: 2, rows: 3 },
      { g: '내용', k: 'closing', l: '맺음말', t: 'area', d: '한 번의 실수로 모든 것을 잃을 수 있다는 것을 이번에 배웠습니다. 기회를 주신다면 성실하게 살아가며 그 기회에 보답하겠습니다. 감사합니다.', w: 2, rows: 3 }
    ],
    blocks: [
      { t: 'center', v: '반 성 문' },
      { t: 'kv', rows: [['사건번호', 'caseNo'], ['제출 기관', 'court'], ['작성자', 'writer']] },
      { t: 'body', v: 'intro' },
      { t: 'sec', h: '1. 어떤 일을 했는지', v: 'what' },
      { t: 'sec', h: '2. 왜 그랬는지', v: 'why' },
      { t: 'sec', h: '3. 피해자에게 드리는 말', v: 'sorry' },
      { t: 'sec', h: '4. 다시 하지 않겠다는 다짐', v: 'promise' },
      { t: 'body', v: 'closing' },
      { t: 'body', v: function (d) { return dko(d.f.issueDate); } },
      { t: 'body', v: function (d) { return '작성자: ' + d.f.writer + ' (서명)\n주소: ' + d.f.writerAddr + '\n연락처: ' + d.f.writerTel; } },
      { t: 'sign', parties: ['A'], note: function () { return '작성자가 직접 서명합니다.'; } },
      { t: 'note', v: function () { return '※ 반성문은 사실을 바탕으로 자신의 책임을 인정하는 내용이어야 합니다. 남의 말을 그대로 옮기거나 책임을 다른 사람에게 돌리는 표현은 피하고, 실제로 한 행동과 달라진 부분이 있으면 반드시 고쳐 쓰세요.'; } }
    ]
  });

  /* ---------------------------------------------------------
     8. 개인정보 수집·이용 동의서
  --------------------------------------------------------- */
  add({
    id: 'privacy-consent', cat: 'contract', sub: 'ct-confirm', no: '01', tpl: 'doc',
    name: '개인정보 수집·이용 동의서', en: 'PRIVACY CONSENT FORM',
    keywords: '개인정보 수집 이용 동의서 동의서 개인정보보호법 민감정보 고유식별정보 보유기간',
    head: { sub: 'CONSENT TO COLLECT AND USE PERSONAL DATA', meta: [['작성일', 'issueDate'], ['수집자', 'collector']] },
    parties: [{ k: 'A', label: '정보주체', nameKey: 'subject' }, { k: 'B', label: '수집·이용자', nameKey: 'collector' }],
    fields: [
      { g: '문서', k: 'issueDate', l: '작성일', t: 'date', d: today() },
      { g: '수집자', k: 'collector', l: '수집·이용자(회사)', d: '○○상사' },
      { g: '수집자', k: 'collectorCeo', l: '대표자', d: '홍길동' },
      { g: '수집자', k: 'purpose', l: '수집·이용 목적', t: 'area', d: '채용 전형 진행 및 합격자 인사 관리, 지원자 문의 응대', w: 2, rows: 2 },
      { g: '수집자', k: 'items', l: '수집 항목', t: 'area', d: '필수: 성명, 생년월일, 연락처, 이메일, 주소, 학력·경력 사항\n선택: 보유 자격증, 포트폴리오', w: 2, rows: 3 },
      { g: '수집자', k: 'retain', l: '보유·이용 기간', d: '채용 전형 종료 후 6개월 (합격자는 재직 기간 및 퇴직 후 3년)', w: 2 },
      { g: '수집자', k: 'thirdParty', l: '제3자 제공', d: '없음 (제공 시 별도 동의)', w: 2 },
      { g: '정보주체', k: 'subject', l: '정보주체 성명', d: '김철수' },
      { g: '정보주체', k: 'subjectTel', l: '연락처', d: '010-0000-0000' }
    ],
    blocks: [
      { t: 'sec', h: '1. 개인정보의 수집·이용 목적', v: 'purpose' },
      { t: 'sec', h: '2. 수집하는 개인정보 항목', v: 'items' },
      { t: 'kv', rows: [['보유·이용 기간', 'retain'], ['제3자 제공', 'thirdParty']] },
      { t: 'sec', h: '3. 동의를 거부할 권리와 불이익', v: function () { return '정보주체는 개인정보 수집·이용 동의를 거부할 권리가 있습니다. 다만 필수 항목에 대한 동의를 거부하면 채용 전형 등 해당 서비스의 이용이 제한될 수 있습니다.'; } },
      { t: 'sec', h: '4. 개인정보의 파기', v: function () { return '보유 기간이 끝나면 지체 없이 파기합니다. 전자 파일은 복구할 수 없는 방법으로 삭제하고, 종이 문서는 분쇄합니다.'; } },
      { t: 'sec', h: '5. 동의 내용', v: function (d) { return '본인은 ' + d.f.collector + '가 위와 같이 개인정보를 수집·이용하는 것에 동의합니다.'; } },
      { t: 'body', v: function (d) { return dko(d.f.issueDate); } },
      { t: 'sign', parties: ['A', 'B'], note: function () { return '정보주체가 직접 서명하고, 수집·이용자는 접수 확인란에 서명합니다.'; } },
      { t: 'note', v: function () { return '※ 개인정보보호법 제15조·제17조에 따라 수집 목적·항목·보유 기간을 알리고 동의를 받아야 합니다. 주민등록번호 등 고유식별정보, 건강·사상 등 민감정보는 별도의 동의가 필요하고 원칙적으로 수집이 제한됩니다. 실제 운영 시 개인정보 처리방침과 내부 관리 계획을 함께 갖추세요.'; } }
    ]
  });

  /* ---------------------------------------------------------
     9. 거래처 잔액확인서
  --------------------------------------------------------- */
  add({
    id: 'balance-confirm', cat: 'contract', sub: 'ct-confirm', no: '02', tpl: 'invoice',
    name: '거래처 잔액확인서', en: 'BALANCE CONFIRMATION',
    keywords: '잔액확인서 거래처 미수금 채권 확인 잔액 조회 부가세 신고 외상매출금',
    head: { sub: 'BALANCE CONFIRMATION LETTER', meta: [['확인 기준일', 'baseDate'], ['잔액', function (d) { return won(d.f.balance); }]] },
    parties: [{ k: 'A', label: '발신(거래처)', nameKey: 'senderCeo' }, { k: 'B', label: '확인(당사)', nameKey: 'receiverCeo' }],
    fields: [
      { g: '문서', k: 'issueDate', l: '발신일', t: 'date', d: today() },
      { g: '문서', k: 'baseDate', l: '확인 기준일', t: 'date', d: today() },
      { g: '발신', k: 'sender', l: '발신 회사', d: '○○상사' },
      { g: '발신', k: 'senderCeo', l: '대표자', d: '홍길동' },
      { g: '발신', k: 'senderTel', l: '연락처', d: '02-0000-0000' },
      { g: '수신', k: 'receiver', l: '수신 회사', d: '△△물산' },
      { g: '수신', k: 'receiverCeo', l: '대표자', d: '김철수' },
      { g: '수신', k: 'receiverTel', l: '연락처', d: '051-000-0000' },
      { g: '잔액', k: 'balance', l: '확인 잔액', t: 'num', d: '8450000' },
      { g: '잔액', k: 'direction', l: '잔액 성격', t: 'sel', opts: ['당사가 받을 금액(외상매출금)', '당사가 지급할 금액(외상매입금)'], d: '당사가 받을 금액(외상매출금)', w: 2 },
      { g: '잔액', k: 'memo', l: '비고', t: 'area', d: '2026년 9월분 물품대금 중 일부 미수 금액입니다. 11월 30일까지 정산 예정입니다.', w: 2, rows: 3 }
    ],
    sets: [{
      k: 'rows', label: '거래 내역', addLabel: '내역 추가',
      cols: [
        { k: 'date', h: '일자', t: 'date', w: '18%', d: today() },
        { k: 'desc', h: '내용', w: '44%', d: '10월 물품 공급' },
        { k: 'debit', h: '발생', t: 'num', w: '19%', d: '12000000' },
        { k: 'credit', h: '정산', t: 'num', w: '19%', d: '3550000' }
      ],
      def: [
        { date: today(), desc: '10월 물품 공급', debit: '12000000', credit: '' },
        { date: today(), desc: '11월 5일 입금', debit: '', credit: '3550000' }
      ]
    }],
    blocks: [
      { t: 'kv', rows: [['수신', 'receiver'], ['확인 기준일', 'baseDate'], ['잔액 성격', 'direction']] },
      { t: 'table', set: 'rows', empty: 3, head: ['일자', '내용', '발생', '정산'], cols: [
        { k: 'date', h: '일자', t: 'center' }, { k: 'desc', h: '내용' }, { k: 'debit', h: '발생', t: 'num' }, { k: 'credit', h: '정산', t: 'num' }
      ], foot: [{ l: '합계', colspan: 2, align: 'right' }, { v: function (d) { return sum(d, 'rows', 'debit'); } }, { v: function (d) { return sum(d, 'rows', 'credit'); } }] },
      { t: 'amount', v: function (d) { return kor(d.f.balance); }, sub: function (d) { return '₩ ' + fmt(d.f.balance) + ' · ' + d.f.direction; } },
      { t: 'sec', h: '확인 내용', v: function (d) { return '위 금액이 ' + dko(d.f.baseDate) + ' 기준 귀사와 당사 사이의 거래 잔액임을 확인합니다. 이의가 있는 경우 이 문서를 받은 날부터 7일 이내에 알려 주시기 바랍니다. 기간 내 이의가 없으면 위 금액을 승인한 것으로 봅니다.'; } },
      { t: 'sec', h: '비고', v: 'memo' },
      { t: 'sign', parties: ['A', 'B'], note: function () { return '발신처와 확인처가 각각 서명·날인합니다. 회신은 서명본 스캔 또는 우편으로 보내 주세요.'; } },
      { t: 'note', v: function () { return '※ 잔액확인서는 미수금 회수와 부가세 신고 자료로 쓰입니다. 금액이 맞지 않으면 임의로 서명하지 말고 거래명세서·세금계산서와 대조해 차액을 확인한 뒤 서명하세요.'; } }
    ]
  });

  /* ---------------------------------------------------------
     10. 초청장
  --------------------------------------------------------- */
  add({
    id: 'invitation', cat: 'contract', sub: 'ct-confirm', no: '03', tpl: 'card',
    name: '초청장 (행사·개업·세미나)', en: 'INVITATION',
    keywords: '초청장 행사 초대 개업 세미나 컨퍼런스 오픈식 모시는 글',
    parties: [{ k: 'A', label: '주최자', nameKey: 'hostName' }],
    head: { sub: 'INVITATION', meta: [['행사일', 'eventDate'], ['장소', 'place']] },
    fields: [
      { g: '행사', k: 'title', l: '행사명', d: '○○상사 신사옥 개소식', w: 2 },
      { g: '행사', k: 'host', l: '주최', d: '○○상사' },
      { g: '행사', k: 'eventDate', l: '행사일', t: 'date', d: today() },
      { g: '행사', k: 'eventTime', l: '시간', d: '오후 5시 ~ 7시' },
      { g: '행사', k: 'place', l: '장소', d: '서울특별시 영등포구 여의대로 108, 3층', w: 2 },
      { g: '행사', k: 'program', l: '프로그램', t: 'area', d: '17:00 접수\n17:30 인사말·테이프 커팅\n18:00 시설 안내·다과\n19:00 마무리', w: 2, rows: 4 },
      { g: '초대', k: 'guest', l: '받는 분', d: '김철수 대표님' },
      { g: '초대', k: 'greeting', l: '초대의 글', t: 'area', d: '평소 저희 회사에 보내 주신 관심과 협조에 감사드립니다. 이번에 새 보금자리를 마련하고 작은 자리를 준비했습니다. 바쁘시더라도 오셔서 자리를 빛내 주시면 큰 힘이 되겠습니다.', w: 2, rows: 4 },
      { g: '초대', k: 'hostName', l: '보내는 사람', d: '○○상사 대표 홍길동' },
      { g: '초대', k: 'rsvp', l: '회신', d: '참석 여부를 2026-11-30까지 02-0000-0000으로 알려 주세요.', w: 2 },
      { g: '초대', k: 'noteText', l: '안내 사항', t: 'area', d: '주차 공간이 협소하니 대중교통 이용을 부탁드립니다. 오시는 길은 아래 약도를 참고해 주세요.', w: 2, rows: 2 }
    ],
    blocks: [
      { t: 'center', v: function (d) { return d.f.title; } },
      { t: 'center', cls: 'fm-doc-sub', v: function (d) { return d.f.host + ' · ' + dko(d.f.eventDate) + ' ' + d.f.eventTime; } },
      { t: 'body', v: function (d) { return d.f.guest + ' 귀하'; } },
      { t: 'sec', h: '', v: 'greeting' },
      { t: 'kv', rows: [['일시', function (d) { return dko(d.f.eventDate) + ' ' + d.f.eventTime; }], ['장소', 'place'], ['회신', 'rsvp']] },
      { t: 'sec', h: '프로그램', v: 'list-like' },
      { t: 'sec', h: '안내 사항', v: 'noteText' },
      { t: 'body', v: 'hostName' },
      { t: 'sign', parties: ['A'], note: function () { return '주최자 서명란입니다. 인쇄용이라면 서명 없이 회사 직인만 찍어도 됩니다.'; } }
    ].map(function (b) {
      if (b.h === '프로그램' && b.v === 'list-like') return { t: 'list', h: '프로그램', v: 'program', plain: false };
      return b;
    })
  });

  /* ---------------------------------------------------------
     11. 추천서
  --------------------------------------------------------- */
  add({
    id: 'recommendation', cat: 'contract', sub: 'ct-confirm', no: '04', tpl: 'letter',
    name: '추천서', en: 'LETTER OF RECOMMENDATION',
    keywords: '추천서 추천 채용 입학 추천인 피추천인 관계 추천 사유',
    head: { sub: 'LETTER OF RECOMMENDATION', meta: [['작성일', 'issueDate'], ['추천인', 'writer']] },
    parties: [{ k: 'A', label: '추천인', nameKey: 'writer' }],
    fields: [
      { g: '문서', k: 'issueDate', l: '작성일', t: 'date', d: today() },
      { g: '문서', k: 'toWhom', l: '받는 곳', d: '○○기업 인사팀' },
      { g: '대상자', k: 'candidate', l: '피추천인 성명', d: '김철수' },
      { g: '대상자', k: 'candidateJob', l: '지원 직무', d: '물류 운영 담당' },
      { g: '추천인', k: 'writer', l: '추천인 성명', d: '홍길동' },
      { g: '추천인', k: 'writerTitle', l: '소속·직위', d: '○○상사 대표' },
      { g: '추천인', k: 'relation', l: '관계·기간', d: '5년간 함께 근무한 직장 상사' },
      { g: '추천인', k: 'writerTel', l: '연락처', d: '010-0000-0000' },
      { g: '내용', k: 'intro', l: '머리말', t: 'area', d: '김철수 님을 귀사의 물류 운영 담당으로 추천합니다. 5년간 같은 회사에서 함께 일하며 지켜본 경험을 바탕으로 말씀드립니다.', w: 2, rows: 3 },
      { g: '내용', k: 'body1', l: '업무 역량', t: 'area', d: '김철수 님은 입고·출고와 재고 실사를 맡아 오차를 거의 남기지 않았습니다. 특히 거래처별 납기 약속을 지키기 위해 미리 재고를 확인하고, 문제가 생기면 먼저 해결책을 가져오는 습관이 있습니다.', w: 2, rows: 3 },
      { g: '내용', k: 'body2', l: '인성·협업', t: 'area', d: '현장 직원과 거래처 담당자 모두와 신뢰를 쌓는 편입니다. 힘든 일을 뒤로 미루지 않고, 후배에게 일하는 방법을 설명해 주는 모습을 자주 보았습니다.', w: 2, rows: 3 },
      { g: '내용', k: 'body3', l: '아쉬운 점·보완', t: 'area', d: '새로운 시스템을 배울 때 초반에는 속도가 느린 편이지만, 한 번 익히면 끝까지 정확하게 씁니다. 귀사에서도 시간을 두고 적응하면 충분히 역량을 발휘할 것으로 봅니다.', w: 2, rows: 3 },
      { g: '내용', k: 'closing', l: '맺음말', t: 'area', d: '위 내용이 사실임을 확인하며, 더 자세한 사항이 필요하시면 언제든 연락 주시기 바랍니다.', w: 2, rows: 2 }
    ],
    blocks: [
      { t: 'center', v: '추 천 서' },
      { t: 'body', v: function (d) { return d.f.toWhom + ' 귀중'; } },
      { t: 'body', v: 'intro' },
      { t: 'sec', h: '1. 업무 역량', v: 'body1' },
      { t: 'sec', h: '2. 인성과 협업', v: 'body2' },
      { t: 'sec', h: '3. 보완할 점', v: 'body3' },
      { t: 'body', v: 'closing' },
      { t: 'body', v: function (d) { return dko(d.f.issueDate); } },
      { t: 'body', v: function (d) { return '추천인: ' + d.f.writer + ' (' + d.f.writerTitle + ')\n' + d.f.relation + ' · 연락처 ' + d.f.writerTel; } },
      { t: 'sign', parties: ['A'], note: function () { return '추천인이 서명·날인합니다. 회사 직인을 함께 찍으면 신뢰도가 높아집니다.'; } },
      { t: 'note', v: function () { return '※ 추천서는 사실에 근거해 구체적인 사례를 담을수록 설득력이 있습니다. 피추천인에게 내용을 미리 보여 주고, 사실과 다른 칭찬이나 과장은 피하세요.'; } }
    ]
  });
})(typeof window !== 'undefined' ? window : this);
