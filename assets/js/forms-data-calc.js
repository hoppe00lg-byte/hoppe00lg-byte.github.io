/* =========================================================
   INSIGHT BRIEF — 자동계산·엑셀형 서식
   급여·연차·가계부·마진·견적·OKR/간트. 문구와 표 구성은 자체 제작.
   ========================================================= */
(function (root) {
  'use strict';
  var H = root.IBF;
  var DOCS = root.IBF_DOCS;
  var esc = H.esc, fmt = H.fmt, fmt1 = H.fmt1, dko = H.dateKo, today = H.todayISO, sum = H.setSum, vat = H.vat, addD = H.addDays;
  function add(d) { DOCS[d.id] = d; return d; }
  function pct(a, b) { return b ? fmt1((a / b) * 100) + '%' : '0%'; }

  /* ---------------------------------------------------------
     1. 급여·수당 자동계산기
  --------------------------------------------------------- */
  add({
    id: 'pay-calc', cat: 'excel', sub: 'ex-pay', no: '04', kind: 'excel',
    name: '급여·수당 계산기', en: 'PAYROLL CALCULATOR',
    keywords: '급여 계산기 수당 연장수당 야근 식대 비과세 4대보험 실수령액 급여명세 엑셀',
    fields: [
      { g: '문서', k: 'docName', l: '문서명', d: '2026년 11월 급여 계산', w: 2 },
      { g: '문서', k: 'period', l: '귀속월', d: '2026-11', w: 2 },
      { g: '문서', k: 'payDate', l: '지급일', t: 'date', d: addD(today(), 5) },
      { g: '문서', k: 'writer', l: '작성자', d: '홍길동' }
    ],
    sets: [{
      k: 'rows', label: '직원별 급여', addLabel: '직원 추가',
      cols: [
        { k: 'name', h: '성명', w: '18%', d: '김철수' },
        { k: 'base', h: '기본급', t: 'num', w: '20%', d: '2400000' },
        { k: 'over', h: '연장수당', t: 'num', w: '17%', d: '180000' },
        { k: 'meal', h: '식대(비과세)', t: 'num', w: '16%', d: '200000' },
        { k: 'bonus', h: '상여', t: 'num', w: '15%', d: '0' },
        { k: 'tax', h: '소득세', t: 'num', w: '14%', d: '68000' }
      ],
      def: [
        { name: '김철수', base: '2400000', over: '180000', meal: '200000', bonus: '0', tax: '68000' },
        { name: '박영희', base: '2800000', over: '90000', meal: '200000', bonus: '200000', tax: '105000' }
      ]
    }],
    table: {
      set: 'rows', empty: 4,
      cols: [
        { k: 'name', h: '성명' },
        { k: 'base', h: '기본급', t: 'num' }, { k: 'over', h: '연장수당', t: 'num' },
        { k: 'meal', h: '식대(비과세)', t: 'num' }, { k: 'bonus', h: '상여', t: 'num' },
        { k: 'gross', h: '지급액', t: 'num', calc: function (r) { return H.num(r.base) + H.num(r.over) + H.num(r.meal) + H.num(r.bonus); } },
        { k: 'ins', h: '4대보험(근로자)', t: 'num', calc: function (r) { return Math.round((H.num(r.base) + H.num(r.over) + H.num(r.bonus)) * 0.094041); } },
        { k: 'tax', h: '소득세', t: 'num' },
        { k: 'ded', h: '공제계', t: 'num', calc: function (r) { return Math.round((H.num(r.base) + H.num(r.over) + H.num(r.bonus)) * 0.094041) + H.num(r.tax); } },
        { k: 'net', h: '실수령액', t: 'num', calc: function (r) { return H.num(r.base) + H.num(r.over) + H.num(r.meal) + H.num(r.bonus) - Math.round((H.num(r.base) + H.num(r.over) + H.num(r.bonus)) * 0.094041) - H.num(r.tax); } }
      ],
      foot: [
        { l: '합계', colspan: 1, align: 'right' },
        { v: function (d) { return sum(d, 'rows', 'base'); } }, { v: function (d) { return sum(d, 'rows', 'over'); } },
        { v: function (d) { return sum(d, 'rows', 'meal'); } }, { v: function (d) { return sum(d, 'rows', 'bonus'); } },
        { v: function (d) { return sum(d, 'rows', 'gross'); } }, { v: function (d) { return sum(d, 'rows', 'ins'); } },
        { v: function (d) { return sum(d, 'rows', 'tax'); } }, { v: function (d) { return sum(d, 'rows', 'ded'); } },
        { v: function (d) { return sum(d, 'rows', 'net'); } }
      ],
      noteText: '4대보험 근로자 부담분은 국민연금 4.5% + 건강보험 3.545% + 장기요양 0.4591% + 고용보험 0.9% = 9.4041%로 계산한 참고값입니다. 식대 월 20만원까지는 비과세라 보험료·소득세 산정에서 뺐습니다. 소득세는 간이세액표 기준으로 직접 입력하세요.'
    },
    summary: [
      { l: '총 지급액', v: function (d) { return sum(d, 'rows', 'gross'); }, unit: '원' },
      { l: '4대보험', v: function (d) { return sum(d, 'rows', 'ins'); }, unit: '원' },
      { l: '소득세', v: function (d) { return sum(d, 'rows', 'tax'); }, unit: '원' },
      { l: '총 실수령액', v: function (d) { return sum(d, 'rows', 'net'); }, unit: '원', grand: true }
    ],
    csv: function (d) {
      var out = [['성명', '기본급', '연장수당', '식대(비과세)', '상여', '지급액', '4대보험', '소득세', '공제계', '실수령액']];
      (d.sets.rows || []).forEach(function (r) {
        var gross = H.num(r.base) + H.num(r.over) + H.num(r.meal) + H.num(r.bonus);
        var ins = Math.round((H.num(r.base) + H.num(r.over) + H.num(r.bonus)) * 0.094041);
        out.push([r.name, H.num(r.base), H.num(r.over), H.num(r.meal), H.num(r.bonus), gross, ins, H.num(r.tax), ins + H.num(r.tax), gross - ins - H.num(r.tax)]);
      });
      out.push(['합계', sum(d, 'rows', 'base'), sum(d, 'rows', 'over'), sum(d, 'rows', 'meal'), sum(d, 'rows', 'bonus'), sum(d, 'rows', 'gross'), sum(d, 'rows', 'ins'), sum(d, 'rows', 'tax'), sum(d, 'rows', 'ded'), sum(d, 'rows', 'net')]);
      return out;
    },
    fileBase: 'payroll-calc'
  });

  /* ---------------------------------------------------------
     2. 연차·휴가 관리표
  --------------------------------------------------------- */
  add({
    id: 'leave-plan', cat: 'excel', sub: 'ex-pay', no: '05', kind: 'excel',
    name: '연차·휴가 관리표', en: 'ANNUAL LEAVE TRACKER',
    keywords: '연차 관리표 휴가 발생 사용 잔여 연차계산 입사일 소멸 인사 엑셀',
    fields: [
      { g: '문서', k: 'docName', l: '문서명', d: '2026년 연차·휴가 관리표', w: 2 },
      { g: '문서', k: 'period', l: '기준 연도', d: '2026', w: 2 },
      { g: '문서', k: 'dept', l: '부서', d: '전체' },
      { g: '문서', k: 'writer', l: '작성자', d: '홍길동' }
    ],
    sets: [{
      k: 'rows', label: '직원별 연차', addLabel: '직원 추가',
      cols: [
        { k: 'name', h: '성명', w: '16%', d: '김철수' },
        { k: 'hire', h: '입사일', t: 'date', w: '20%', d: '2021-03-02' },
        { k: 'accrued', h: '발생', t: 'num', w: '12%', d: '16' },
        { k: 'carried', h: '이월', t: 'num', w: '12%', d: '2' },
        { k: 'used', h: '사용', t: 'num', w: '12%', d: '11' },
        { k: 'note', h: '비고', w: '28%', d: '12월 2일 소멸 예정' }
      ],
      def: [
        { name: '김철수', hire: '2021-03-02', accrued: '16', carried: '2', used: '11', note: '12월 2일 소멸 예정' },
        { name: '박영희', hire: '2019-07-15', accrued: '18', carried: '0', used: '14', note: '' },
        { name: '이민수', hire: '2026-01-05', accrued: '11', carried: '0', used: '6', note: '1년 미만 월 개근 1일' }
      ]
    }],
    table: {
      set: 'rows', empty: 4,
      cols: [
        { k: 'name', h: '성명' }, { k: 'hire', h: '입사일', t: 'center' },
        { k: 'accrued', h: '발생', t: 'num' }, { k: 'carried', h: '이월', t: 'num' }, { k: 'used', h: '사용', t: 'num' },
        { k: 'remain', h: '잔여', t: 'num', calc: function (r) { return H.num(r.accrued) + H.num(r.carried) - H.num(r.used); } },
        { k: 'note', h: '비고' }
      ],
      foot: [{ l: '합계', colspan: 1, align: 'right' }, { v: '' }, { v: function (d) { return sum(d, 'rows', 'accrued'); } }, { v: function (d) { return sum(d, 'rows', 'carried'); } }, { v: function (d) { return sum(d, 'rows', 'used'); } }, { v: function (d) { return sum(d, 'rows', 'remain'); } }, { v: '' }],
      noteText: '연차 발생일수는 근로기준법 제60조를 기준으로 한 참고값입니다. 1년간 80% 이상 출근 시 15일, 3년 이상 근속자는 2년마다 1일씩 가산되어 최대 25일이며, 1년 미만이거나 80% 미만 출근자는 1개월 개근마다 1일이 발생합니다. 회사 취업규칙이 법보다 유리하면 그 기준을 따릅니다.'
    },
    summary: [
      { l: '발생 연차 합계', v: function (d) { return sum(d, 'rows', 'accrued'); }, unit: '일' },
      { l: '사용 합계', v: function (d) { return sum(d, 'rows', 'used'); }, unit: '일' },
      { l: '미사용 잔여', v: function (d) { return sum(d, 'rows', 'remain'); }, unit: '일', grand: true }
    ],
    csv: function (d) {
      var out = [['성명', '입사일', '발생', '이월', '사용', '잔여', '비고']];
      (d.sets.rows || []).forEach(function (r) {
        out.push([r.name, r.hire, H.num(r.accrued), H.num(r.carried), H.num(r.used), H.num(r.accrued) + H.num(r.carried) - H.num(r.used), r.note]);
      });
      out.push(['합계', '', sum(d, 'rows', 'accrued'), sum(d, 'rows', 'carried'), sum(d, 'rows', 'used'), sum(d, 'rows', 'remain'), '']);
      return out;
    },
    fileBase: 'leave-tracker'
  });

  /* ---------------------------------------------------------
     3. 간편 가계부
  --------------------------------------------------------- */
  add({
    id: 'household', cat: 'excel', sub: 'ex-life', no: '01', kind: 'excel',
    name: '간편 가계부 (수입·지출)', en: 'HOUSEHOLD BUDGET',
    keywords: '가계부 수입 지출 생활비 용돈 저축 예산 가계 엑셀 간편 가계부',
    fields: [
      { g: '문서', k: 'docName', l: '문서명', d: '2026년 11월 가계부', w: 2 },
      { g: '문서', k: 'period', l: '기간', d: '2026-11-01 ~ 2026-11-30', w: 2 },
      { g: '문서', k: 'writer', l: '작성자', d: '홍길동' },
      { g: '문서', k: 'startBal', l: '이월 잔액', t: 'num', d: '450000' }
    ],
    sets: [{
      k: 'rows', label: '수입·지출 내역', addLabel: '내역 추가',
      cols: [
        { k: 'date', h: '일자', t: 'date', w: '15%', d: today() },
        { k: 'kind', h: '구분', w: '11%', d: '지출' },
        { k: 'cat', h: '분류', w: '16%', d: '식비' },
        { k: 'memo', h: '내용', w: '28%', d: '장보기' },
        { k: 'income', h: '수입', t: 'num', w: '15%', d: '' },
        { k: 'expense', h: '지출', t: 'num', w: '15%', d: '38500' }
      ],
      def: [
        { date: today(), kind: '지출', cat: '식비', memo: '장보기', income: '', expense: '38500' },
        { date: today(), kind: '지출', cat: '교통', memo: '주유', income: '', expense: '60000' },
        { date: today(), kind: '수입', cat: '급여', memo: '월급', income: '2400000', expense: '' },
        { date: today(), kind: '지출', cat: '고정비', memo: '관리비', income: '', expense: '180000' }
      ]
    }],
    table: {
      set: 'rows', empty: 5,
      cols: [
        { k: 'date', h: '일자', t: 'center' }, { k: 'kind', h: '구분', t: 'center' }, { k: 'cat', h: '분류' },
        { k: 'memo', h: '내용' }, { k: 'income', h: '수입', t: 'num' }, { k: 'expense', h: '지출', t: 'num' }
      ],
      foot: [{ l: '합계', colspan: 3, align: 'right' }, { v: '' }, { v: function (d) { return sum(d, 'rows', 'income'); } }, { v: function (d) { return sum(d, 'rows', 'expense'); } }],
      noteText: '수입과 지출을 각각 더해 이번 달 잔액을 계산합니다. 카드 결제일과 실제 지출일이 다르면 결제일 기준으로 적으면 생활비 흐름이 더 정확합니다.'
    },
    summary: [
      { l: '이월 잔액', v: function (d) { return H.num(d.f.startBal); }, unit: '원' },
      { l: '총 수입', v: function (d) { return sum(d, 'rows', 'income'); }, unit: '원' },
      { l: '총 지출', v: function (d) { return sum(d, 'rows', 'expense'); }, unit: '원' },
      { l: '이번 달 잔액', v: function (d) { return H.num(d.f.startBal) + sum(d, 'rows', 'income') - sum(d, 'rows', 'expense'); }, unit: '원', grand: true }
    ],
    csv: function (d) {
      var out = [['일자', '구분', '분류', '내용', '수입', '지출']];
      (d.sets.rows || []).forEach(function (r) { out.push([r.date, r.kind, r.cat, r.memo, H.num(r.income), H.num(r.expense)]); });
      out.push(['합계', '', '', '', sum(d, 'rows', 'income'), sum(d, 'rows', 'expense')]);
      out.push(['이월 잔액', H.num(d.f.startBal), '이번 달 잔액', H.num(d.f.startBal) + sum(d, 'rows', 'income') - sum(d, 'rows', 'expense')]);
      return out;
    },
    fileBase: 'household-budget'
  });

  /* ---------------------------------------------------------
     4. 해외구매대행 매출·마진 계산기
  --------------------------------------------------------- */
  add({
    id: 'margin-calc', cat: 'excel', sub: 'ex-import', no: '01', kind: 'excel',
    name: '해외구매대행 매출·마진 계산기', en: 'RESALE MARGIN CALCULATOR',
    keywords: '해외구매대행 마진 계산기 매출 원가 수수료 마진율 구매대행 사입 스마트스토어 쿠팡 아마존',
    fields: [
      { g: '문서', k: 'docName', l: '문서명', d: '해외구매대행 상품별 마진 분석', w: 2 },
      { g: '문서', k: 'period', l: '기간·차수', d: '2026-11 1차', w: 2 },
      { g: '문서', k: 'feeName', l: '판매 채널', d: '스마트스토어 (수수료율 입력)' }
    ],
    sets: [{
      k: 'rows', label: '상품별 계산', addLabel: '상품 추가',
      cols: [
        { k: 'product', h: '상품', w: '24%', d: '무선 청소기 A' },
        { k: 'sell', h: '판매가', t: 'num', w: '15%', d: '89000' },
        { k: 'qty', h: '수량', t: 'num', w: '10%', d: '10' },
        { k: 'cost', h: '매입단가', t: 'num', w: '15%', d: '42000' },
        { k: 'extra', h: '수입부대비용/개', t: 'num', w: '18%', d: '6000' },
        { k: 'fee', h: '수수료율(%)', t: 'num', w: '18%', d: '5' }
      ],
      def: [
        { product: '무선 청소기 A', sell: '89000', qty: '10', cost: '42000', extra: '6000', fee: '5' },
        { product: '캠핑 랜턴 B', sell: '35000', qty: '30', cost: '15000', extra: '2500', fee: '5' }
      ]
    }],
    table: {
      set: 'rows', empty: 5,
      cols: [
        { k: 'product', h: '상품' }, { k: 'sell', h: '판매가', t: 'num' }, { k: 'qty', h: '수량', t: 'num' },
        { k: 'revenue', h: '매출', t: 'num', calc: function (r) { return H.num(r.sell) * H.num(r.qty); } },
        { k: 'costTot', h: '원가(매입+부대)', t: 'num', calc: function (r) { return (H.num(r.cost) + H.num(r.extra)) * H.num(r.qty); } },
        { k: 'feeAmt', h: '판매수수료', t: 'num', calc: function (r) { return Math.round(H.num(r.sell) * H.num(r.qty) * H.num(r.fee) / 100); } },
        { k: 'profit', h: '마진', t: 'num', calc: function (r) { return H.num(r.sell) * H.num(r.qty) - (H.num(r.cost) + H.num(r.extra)) * H.num(r.qty) - Math.round(H.num(r.sell) * H.num(r.qty) * H.num(r.fee) / 100); } },
        { k: 'rate', h: '마진율', t: 'num', calc: function (r) { var rev = H.num(r.sell) * H.num(r.qty); return rev ? Math.round((rev - (H.num(r.cost) + H.num(r.extra)) * H.num(r.qty) - Math.round(rev * H.num(r.fee) / 100)) / rev * 1000) / 10 : 0; } }
      ],
      foot: [
        { l: '합계', colspan: 3, align: 'right' },
        { v: function (d) { return sum(d, 'rows', 'revenue'); } }, { v: function (d) { return sum(d, 'rows', 'costTot'); } },
        { v: function (d) { return sum(d, 'rows', 'feeAmt'); } }, { v: function (d) { return sum(d, 'rows', 'profit'); } }, { v: '평균은 아래 요약' }
      ],
      noteText: '수입부대비용에는 국제운송료·관부가세·검역·국내택배를 개당으로 나눠 넣으세요. 마진율은 판매가 대비 마진 비율(%)입니다. 반품·교환·광고비는 별도로 빼야 실제 손익에 가깝습니다.'
    },
    summary: [
      { l: '총 매출', v: function (d) { return sum(d, 'rows', 'revenue'); }, unit: '원' },
      { l: '총 원가', v: function (d) { return sum(d, 'rows', 'costTot'); }, unit: '원' },
      { l: '총 수수료', v: function (d) { return sum(d, 'rows', 'feeAmt'); }, unit: '원' },
      { l: '총 마진', v: function (d) { return sum(d, 'rows', 'profit'); }, unit: '원' },
      { l: '평균 마진율', v: function (d) { return pct(sum(d, 'rows', 'profit'), sum(d, 'rows', 'revenue')); }, text: true, grand: true }
    ],
    csv: function (d) {
      var out = [['상품', '판매가', '수량', '매출', '원가', '수수료', '마진', '마진율(%)']];
      (d.sets.rows || []).forEach(function (r) {
        var rev = H.num(r.sell) * H.num(r.qty), cost = (H.num(r.cost) + H.num(r.extra)) * H.num(r.qty), fee = Math.round(rev * H.num(r.fee) / 100);
        out.push([r.product, H.num(r.sell), H.num(r.qty), rev, cost, fee, rev - cost - fee, rev ? Math.round((rev - cost - fee) / rev * 1000) / 10 : 0]);
      });
      out.push(['합계', '', '', sum(d, 'rows', 'revenue'), sum(d, 'rows', 'costTot'), sum(d, 'rows', 'feeAmt'), sum(d, 'rows', 'profit'), '']);
      return out;
    },
    fileBase: 'margin-calc'
  });

  /* ---------------------------------------------------------
     5. 견적서 자동계산 (A4)
  --------------------------------------------------------- */
  add({
    id: 'quote-auto', cat: 'excel', sub: 'ex-quote', no: '01', tpl: 'invoice',
    name: '견적서 자동계산', en: 'QUOTATION',
    keywords: '견적서 자동계산 할인 부가세 합계 품목 수량 단가 견적서 양식 거래처',
    head: { sub: 'QUOTATION', meta: [['견적번호', 'quoteNo'], ['견적일', 'issueDate'], ['유효기간', 'validUntil']] },
    parties: [{ k: 'A', label: '공급자', nameKey: 'supplierCeo' }, { k: 'B', label: '고객 확인', nameKey: 'clientCeo' }],
    fields: [
      { g: '견적 정보', k: 'quoteNo', l: '견적번호', d: 'Q-2026-1123-01' },
      { g: '견적 정보', k: 'issueDate', l: '견적일', t: 'date', d: today() },
      { g: '견적 정보', k: 'validUntil', l: '유효기간', t: 'date', d: function () { return addD(today(), 30); } },
      { g: '견적 정보', k: 'discount', l: '할인율(%)', t: 'num', d: '0' },
      { g: '공급자', k: 'supplier', l: '상호', d: '○○상사' },
      { g: '공급자', k: 'supplierCeo', l: '대표자', d: '홍길동' },
      { g: '공급자', k: 'supplierTel', l: '연락처', d: '02-0000-0000' },
      { g: '공급자', k: 'supplierAddr', l: '주소', t: 'area', d: '서울특별시 영등포구 여의대로 108', w: 2, rows: 2 },
      { g: '고객', k: 'client', l: '상호', d: '△△물산' },
      { g: '고객', k: 'clientCeo', l: '담당자', d: '김철수' },
      { g: '고객', k: 'clientTel', l: '연락처', d: '051-000-0000' },
      { g: '고객', k: 'clientAddr', l: '주소', t: 'area', d: '부산광역시 사상구 낙동대로 100', w: 2, rows: 2 },
      { g: '조건', k: 'payTerms', l: '결제조건', d: '계약금 30% / 납품 후 30일 이내 잔금', w: 2 },
      { g: '조건', k: 'delivery', l: '납기·납품', d: '발주 후 14일 이내 / 현장 도착도', w: 2 },
      { g: '조건', k: 'noteText', l: '비고', t: 'area', d: '· 수량 1,000개 이상 시 단가 재협의\n· 운송비는 도서산간 별도', w: 2, rows: 3 }
    ],
    sets: [{
      k: 'rows', label: '견적 품목', addLabel: '품목 추가',
      cols: [
        { k: 'name', h: '품목', w: '34%', d: 'ABS 재생원료' },
        { k: 'spec', h: '규격', w: '26%', d: '검정, 25kg 포장' },
        { k: 'qty', h: '수량', t: 'num', w: '13%', d: '1000' },
        { k: 'price', h: '단가', t: 'num', w: '13%', d: '1200' },
        { k: 'amount', h: '금액', t: 'num', w: '14%', calc: function (r) { return H.num(r.qty) * H.num(r.price); } }
      ],
      def: [
        { name: 'ABS 재생원료', spec: '검정, 25kg 포장', qty: '1000', price: '1200' },
        { name: 'PC 재생펠릿', spec: '투명, 25kg 포장', qty: '500', price: '1800' }
      ]
    }],
    blocks: [
      { t: 'parties', cols: [
        { title: '공급자', rows: [['상호', 'supplier'], ['대표자', 'supplierCeo'], ['연락처', 'supplierTel'], ['주소', 'supplierAddr']] },
        { title: '고객', rows: [['상호', 'client'], ['담당자', 'clientCeo'], ['연락처', 'clientTel'], ['주소', 'clientAddr']] }
      ] },
      { t: 'table', set: 'rows', empty: 3, cols: [
        { k: 'name', h: '품목' }, { k: 'spec', h: '규격' }, { k: 'qty', h: '수량', t: 'num' },
        { k: 'price', h: '단가', t: 'num' }, { k: 'amount', h: '금액', t: 'num', calc: function (r) { return H.num(r.qty) * H.num(r.price); } }
      ] },
      { t: 'sums', rows: [
        { l: '공급가액', v: function (d) { return sum(d, 'rows', 'amount'); } },
        { l: '할인', v: function (d) { return Math.round(sum(d, 'rows', 'amount') * H.num(d.f.discount) / 100); } },
        { l: '할인 후 금액', v: function (d) { return sum(d, 'rows', 'amount') - Math.round(sum(d, 'rows', 'amount') * H.num(d.f.discount) / 100); } },
        { l: '부가세 (10%)', v: function (d) { return vat(sum(d, 'rows', 'amount') - Math.round(sum(d, 'rows', 'amount') * H.num(d.f.discount) / 100)); } },
        { l: '합계금액', v: function (d) { return sum(d, 'rows', 'amount') - Math.round(sum(d, 'rows', 'amount') * H.num(d.f.discount) / 100) + vat(sum(d, 'rows', 'amount') - Math.round(sum(d, 'rows', 'amount') * H.num(d.f.discount) / 100)); }, grand: true }
      ] },
      { t: 'sec', h: '거래 조건', v: function (d) { return '· 결제: ' + d.f.payTerms + '\n· 납기: ' + d.f.delivery + '\n· 견적 유효기간: ' + dko(d.f.validUntil) + '까지'; } },
      { t: 'sec', h: '비고', v: 'noteText' },
      { t: 'sign', parties: ['A', 'B'], note: function (d) { return '견적일 ' + dko(d.f.issueDate) + ' · 위와 같이 견적합니다. 고객 서명은 견적 내용 확인을 뜻하며, 발주는 별도 발주서로 진행합니다.'; } },
      { t: 'note', v: function () { return '※ 견적서는 계약서가 아닙니다. 수주가 확정되면 품명·수량·단가·납기·결제조건을 담은 발주서나 계약서를 따로 작성하세요. 마진·원가 계산은 사업자 툴(biz.html)의 수입 원가 계산기와 함께 쓰면 편합니다.'; } }
    ]
  });

  /* ---------------------------------------------------------
     6. OKR · 목표관리 + 간트차트
  --------------------------------------------------------- */
  function okrRaw(d) {
    var f = d.f;
    var rows = d.sets.kr || [];
    var tasks = d.sets.tasks || [];
    var h = '<div class="okr2" id="okr2">';
    h += '<div class="okr2-head"><div><span class="k">OBJECTIVES &amp; KEY RESULTS</span><h2>' + esc(f.docName || 'OKR') + '</h2>' +
      '<div class="okr2-sub">' + esc(f.period || '') + ' · 오너 ' + esc(f.owner || '—') + '</div></div>' +
      '<div class="okr2-obj"><span class="k">OBJECTIVE</span><b>' + esc(f.objective || '—') + '</b></div></div>';
    h += '<table class="okr2-tbl"><thead><tr><th style="width:44%">Key Result</th><th style="width:12%">목표</th><th style="width:12%">현재</th><th style="width:22%">진척도</th><th style="width:10%">담당</th></tr></thead><tbody>';
    rows.forEach(function (r) {
      var t = H.num(r.target), c = H.num(r.current);
      var p = t ? Math.max(0, Math.min(100, Math.round(c / t * 100))) : 0;
      h += '<tr><td class="l">' + esc(r.kr || '') + '</td><td class="r">' + fmt(t) + esc(r.unit || '') + '</td><td class="r">' + fmt(c) + esc(r.unit || '') + '</td>' +
        '<td><div class="okr2-bar"><i style="width:' + p + '%"></i></div><span class="okr2-p">' + p + '%</span></td><td class="c">' + esc(r.owner || '') + '</td></tr>';
    });
    for (var i = 0; i < Math.max(0, 3 - rows.length); i++) h += '<tr class="empty"><td></td><td></td><td></td><td></td><td></td></tr>';
    h += '</tbody></table>';

    h += '<div class="okr2-gantt"><div class="g2-title">일정 (간트차트)</div>';
    h += '<div class="g2-head"><span class="g2-nm"></span><div class="g2-track">';
    for (var m = 1; m <= 12; m++) h += '<span>' + (m % 3 === 0 ? m + '월' : '') + '</span>';
    h += '</div><span class="g2-who"></span></div>';
    tasks.forEach(function (t) {
      var s = Math.max(1, Math.min(12, H.num(t.start) || 1));
      var e = Math.max(s, Math.min(12, H.num(t.end) || s));
      var left = (s - 1) / 12 * 100, width = (e - s + 1) / 12 * 100;
      var p = Math.max(0, Math.min(100, H.num(t.progress)));
      h += '<div class="g2-row"><span class="g2-nm">' + esc(t.task || '') + '</span><div class="g2-track">' +
        '<i style="left:' + left + '%;width:' + width + '%"><b style="width:' + p + '%"></b></i></div>' +
        '<span class="g2-who">' + esc(t.owner || '') + '</span></div>';
    });
    if (!tasks.length) h += '<div class="g2-row"><span class="g2-nm">—</span><div class="g2-track"></div><span class="g2-who"></span></div>';
    h += '<div class="g2-note">막대의 진한 부분이 진행률입니다. 시작·종료는 1~12월 숫자로 입력하세요.</div></div>';

    h += '<div class="okr2-memo"><span class="k">이번 분기 우선순위 · 메모</span><div>' + (esc(f.memo || '—')) + '</div></div>';
    h += '<div class="fm-note">※ OKR은 목표(Objective)와 측정 가능한 결과(Key Result)로 나눠 쓰는 자체 목표관리 서식입니다. Key Result는 숫자로 측정되는 결과로 쓰고, 해야 할 일(태스크)은 간트차트에 따로 적으면 진행 관리가 쉬워집니다.</div>';
    h += '</div>';
    return h;
  }

  add({
    id: 'okr-gantt', cat: 'excel', sub: 'ex-goal', no: '01', tpl: 'gantt',
    name: 'OKR·목표관리 & 간트차트', en: 'OKR & GANTT',
    keywords: 'OKR 목표관리 핵심결과 간트차트 일정 계획 프로젝트 로드맵 분기 목표',
    raw: okrRaw,
    fields: [
      { g: '문서', k: 'docName', l: '제목', d: '2026년 4분기 OKR', w: 2 },
      { g: '문서', k: 'period', l: '기간', d: '2026-10-01 ~ 2026-12-31', w: 2 },
      { g: '문서', k: 'owner', l: '오너', d: '홍길동' },
      { g: '목표', k: 'objective', l: 'Objective (한 문장)', d: '재생원료 수입 라인을 안정화하고 신규 거래처 3곳을 확보한다', w: 2 },
      { g: '목표', k: 'memo', l: '우선순위·메모', t: 'area', d: '1) 기존 거래처 단가 인상 협상\n2) 중국 A사 샘플 테스트 완료\n3) 물류비 10% 절감', w: 2, rows: 3 }
    ],
    sets: [
      {
        k: 'kr', label: 'Key Results', addLabel: 'KR 추가',
        cols: [
          { k: 'kr', h: 'Key Result', w: '46%', d: '신규 거래처 계약 3건' },
          { k: 'target', h: '목표', t: 'num', w: '14%', d: '3' },
          { k: 'current', h: '현재', t: 'num', w: '14%', d: '1' },
          { k: 'unit', h: '단위', w: '10%', d: '건' },
          { k: 'owner', h: '담당', w: '16%', d: '홍길동' }
        ],
        def: [
          { kr: '신규 거래처 계약 3건', target: '3', current: '1', unit: '건', owner: '홍길동' },
          { kr: '월 처리 물량 300톤 달성', target: '300', current: '210', unit: '톤', owner: '김철수' },
          { kr: '물류비 톤당 8만원 이하', target: '8', current: '8.6', unit: '만원', owner: '박영희' }
        ]
      },
      {
        k: 'tasks', label: '일정 (간트)', addLabel: '일정 추가',
        cols: [
          { k: 'task', h: '일정', w: '48%', d: 'A사 샘플 테스트' },
          { k: 'start', h: '시작(월)', t: 'num', w: '14%', d: '10' },
          { k: 'end', h: '종료(월)', t: 'num', w: '14%', d: '11' },
          { k: 'progress', h: '진행(%)', t: 'num', w: '12%', d: '60' },
          { k: 'owner', h: '담당', w: '12%', d: '김철수' }
        ],
        def: [
          { task: 'A사 샘플 테스트', start: '10', end: '11', progress: '60', owner: '김철수' },
          { task: '단가 협상 · 계약서', start: '11', end: '12', progress: '30', owner: '홍길동' },
          { task: '물류사 재선정', start: '10', end: '10', progress: '100', owner: '박영희' }
        ]
      }
    ]
  });
})(typeof window !== 'undefined' ? window : this);
