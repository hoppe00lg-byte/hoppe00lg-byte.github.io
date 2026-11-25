/* =========================================================
   INSIGHT BRIEF — 엑셀·자동계산 추가분
   일일업무일지 · 매출매입장 · 거래처원장 · 재고관리표 · 세금계산서 집계
   자금일보 · 프로젝트 일정 · 퇴직금 · 주휴·연장수당 · 비품·법인카드 대장
   계산식과 표 구성은 이 사이트에서 직접 설계했습니다.
   ========================================================= */
(function (root) {
  'use strict';
  var H = root.IBF;
  var DOCS = root.IBF_DOCS;
  var esc = H.esc, fmt = H.fmt, fmt1 = H.fmt1, won = H.won, today = H.todayISO,
    sum = H.setSum, addD = H.addDays, addM = H.addMonths;
  function add(d) { DOCS[d.id] = d; return d; }
  function n(v) { return H.num(v); }
  function pct(a, b) { return b ? fmt1((a / b) * 100) + '%' : '—'; }

  /* ---------------------------------------------------------
     1. 일일 업무일지
  --------------------------------------------------------- */
  add({
    id: 'daily-log', cat: 'excel', sub: 'ex-goal', no: '02', kind: 'excel',
    name: '일일 업무일지', en: 'DAILY WORK LOG',
    keywords: '일일업무일지 업무일지 데일리 업무 기록 시간 관리 보고 일과 정리',
    fields: [
      { g: '문서', k: 'docName', l: '문서명', d: '2026년 11월 24일 업무일지', w: 2 },
      { g: '문서', k: 'period', l: '일자', d: today(), w: 2 },
      { g: '문서', k: 'writer', l: '작성자', d: '김철수' },
      { g: '문서', k: 'dept', l: '부서', d: '영업팀' }
    ],
    sets: [{
      k: 'rows', label: '업무 내역', addLabel: '업무 추가',
      cols: [
        { k: 'time', h: '시간', w: '12%', d: '09:00~10:30' },
        { k: 'task', h: '업무', w: '34%', d: 'A사 12월 납기표 작성' },
        { k: 'kind', h: '구분', w: '12%', d: '정규' },
        { k: 'hours', h: '소요(시간)', t: 'num', w: '12%', d: '1.5' },
        { k: 'result', h: '진행 결과', w: '30%', d: '초안 완료, 팀장 검토 요청' }
      ],
      def: [
        { time: '09:00~10:30', task: 'A사 12월 납기표 작성', kind: '정규', hours: '1.5', result: '초안 완료, 팀장 검토 요청' },
        { time: '10:30~12:00', task: 'B사 미수금 확인 전화', kind: '정규', hours: '1.5', result: '12/10 입금 약속' },
        { time: '13:00~15:00', task: '재고 실사 체크리스트 작성', kind: '정규', hours: '2', result: '80% 완료' },
        { time: '15:00~17:00', task: '신규 거래처 C사 샘플 발송', kind: '정규', hours: '2', result: '송장번호 전달' }
      ]
    }],
    table: {
      set: 'rows', empty: 6,
      cols: [
        { k: 'time', h: '시간' }, { k: 'task', h: '업무' }, { k: 'kind', h: '구분' },
        { k: 'hours', h: '소요(시간)', t: 'num' }, { k: 'result', h: '진행 결과' }
      ],
      foot: [{ l: '합계', colspan: 3, align: 'right' }, { v: function (d) { return sum(d, 'rows', 'hours'); } }, { v: '' }],
      noteText: '소요 시간을 함께 적으면 하루 중 어디에 시간이 쓰였는지 보이고, 다음 주 계획을 세울 때 근거가 됩니다. 구분은 정규·회의·이동·지원·야근 등으로 나눠 쓰세요.'
    },
    summary: [
      { l: '총 업무 시간', v: function (d) { return sum(d, 'rows', 'hours'); }, unit: '시간' },
      { l: '업무 건수', v: function (d) { return (d.sets.rows || []).length; }, unit: '건' },
      { l: '완료율(진행 결과 입력 기준)', v: function (d) { var r = d.sets.rows || []; var done = r.filter(function (x) { return String(x.result || '').indexOf('완료') >= 0; }).length; return r.length ? Math.round(done / r.length * 100) : 0; }, unit: '%', grand: true }
    ],
    csv: function (d) {
      var out = [['시간', '업무', '구분', '소요(시간)', '진행 결과']];
      (d.sets.rows || []).forEach(function (r) { out.push([r.time, r.task, r.kind, n(r.hours), r.result]); });
      out.push(['합계', '', '', sum(d, 'rows', 'hours'), '']);
      return out;
    },
    fileBase: 'daily-work-log'
  });

  /* ---------------------------------------------------------
     2. 매출·매입장
  --------------------------------------------------------- */
  add({
    id: 'sales-book', cat: 'excel', sub: 'ex-sales', no: '03', kind: 'excel',
    name: '매출·매입장', en: 'SALES & PURCHASE BOOK',
    keywords: '매출매입장 매출장 매입장 매출 관리 매입 관리 부가세 마진 거래 집계',
    fields: [
      { g: '문서', k: 'docName', l: '문서명', d: '2026년 11월 매출·매입장', w: 2 },
      { g: '문서', k: 'period', l: '귀속월', d: '2026-11', w: 2 },
      { g: '문서', k: 'writer', l: '작성자', d: '김철수' },
      { g: '문서', k: 'bizNo', l: '사업자번호', d: '000-00-00000' }
    ],
    sets: [{
      k: 'rows', label: '거래 내역', addLabel: '거래 추가',
      cols: [
        { k: 'date', h: '일자', t: 'date', w: '13%', d: today() },
        { k: 'kind', h: '구분', w: '10%', d: '매출' },
        { k: 'partner', h: '거래처', w: '24%', d: 'A상사' },
        { k: 'item', h: '품목', w: '20%', d: '재생 PC 펠렛' },
        { k: 'qty', h: '수량(kg)', t: 'num', w: '11%', d: '20000' },
        { k: 'price', h: '단가', t: 'num', w: '11%', d: '1250' },
        { k: 'memo', h: '비고', w: '11%', d: '세금계산서 발행' }
      ],
      def: [
        { date: today(), kind: '매출', partner: 'A상사', item: '재생 PC 펠렛', qty: '20000', price: '1250', memo: '세금계산서 발행' },
        { date: addD(today(), -3), kind: '매출', partner: 'B물산', item: '재생 ABS 펠렛', qty: '5000', price: '1420', memo: '현금 결제' },
        { date: addD(today(), -8), kind: '매입', partner: 'C머티리얼', item: '재생 PC 펠렛', qty: '25000', price: '1020', memo: '부가세 포함' },
        { date: addD(today(), -12), kind: '매입', partner: 'D로지스', item: '운송비', qty: '1', price: '480000', memo: '11월 운송 정산' }
      ]
    }],
    table: {
      set: 'rows', empty: 8,
      cols: [
        { k: 'date', h: '일자', t: 'center' }, { k: 'kind', h: '구분', t: 'center' }, { k: 'partner', h: '거래처' },
        { k: 'item', h: '품목' }, { k: 'qty', h: '수량', t: 'num' }, { k: 'price', h: '단가', t: 'num' },
        { k: 'amount', h: '공급가액', t: 'num', calc: function (r) { return n(r.qty) * n(r.price); } },
        { k: 'vat', h: '부가세', t: 'num', calc: function (r) { return Math.round(n(r.qty) * n(r.price) * 0.1); } },
        { k: 'total', h: '합계', t: 'num', calc: function (r) { return Math.round(n(r.qty) * n(r.price) * 1.1); } },
        { k: 'memo', h: '비고' }
      ],
      foot: [{ l: '합계', colspan: 6, align: 'right' }, { v: function (d) { return sum(d, 'rows', 'amount'); } }, { v: function (d) { return sum(d, 'rows', 'vat'); } }, { v: function (d) { return sum(d, 'rows', 'total'); } }, { v: '' }],
      noteText: '구분에 ‘매출’·‘매입’을 적어 두면 아래 요약에서 매출과 매입을 나눠 볼 수 있습니다. 단가는 부가세 별도 기준이며, 부가세 10%를 더해 합계를 계산합니다.'
    },
    summary: [
      { l: '매출 공급가액', v: function (d) { return (d.sets.rows || []).filter(function (r) { return r.kind === '매출'; }).reduce(function (a, r) { return a + n(r.qty) * n(r.price); }, 0); }, unit: '원' },
      { l: '매입 공급가액', v: function (d) { return (d.sets.rows || []).filter(function (r) { return r.kind === '매입'; }).reduce(function (a, r) { return a + n(r.qty) * n(r.price); }, 0); }, unit: '원' },
      { l: '매출총이익(매출-매입)', v: function (d) {
        var s = 0, p = 0;
        (d.sets.rows || []).forEach(function (r) { if (r.kind === '매출') s += n(r.qty) * n(r.price); else if (r.kind === '매입') p += n(r.qty) * n(r.price); });
        return s - p;
      }, unit: '원', grand: true }
    ],
    csv: function (d) {
      var out = [['일자', '구분', '거래처', '품목', '수량', '단가', '공급가액', '부가세', '합계', '비고']];
      (d.sets.rows || []).forEach(function (r) {
        var amt = n(r.qty) * n(r.price);
        out.push([r.date, r.kind, r.partner, r.item, n(r.qty), n(r.price), amt, Math.round(amt * 0.1), Math.round(amt * 1.1), r.memo]);
      });
      out.push(['합계', '', '', '', '', '', sum(d, 'rows', 'amount'), sum(d, 'rows', 'vat'), sum(d, 'rows', 'total'), '']);
      return out;
    },
    fileBase: 'sales-purchase-book'
  });

  /* ---------------------------------------------------------
     3. 거래처별 매출·수금 원장
  --------------------------------------------------------- */
  add({
    id: 'client-ledger', cat: 'excel', sub: 'ex-sales', no: '04', kind: 'excel',
    name: '거래처별 매출·수금 원장', en: 'CLIENT LEDGER',
    keywords: '거래처원장 거래처 관리 매출 수금 미수금 외상 잔액 채권 관리',
    fields: [
      { g: '문서', k: 'docName', l: '문서명', d: '2026년 거래처별 매출·수금 원장', w: 2 },
      { g: '문서', k: 'period', l: '기준 기간', d: '2026-01 ~ 2026-11', w: 2 },
      { g: '문서', k: 'writer', l: '작성자', d: '김철수' },
      { g: '문서', k: 'memo', l: '메모', d: '미수금 30일 초과 거래처는 매주 금요일 확인', w: 2 }
    ],
    sets: [{
      k: 'rows', label: '거래처별 집계', addLabel: '거래처 추가',
      cols: [
        { k: 'client', h: '거래처', w: '22%', d: 'A상사' },
        { k: 'owner', h: '담당', w: '11%', d: '김철수' },
        { k: 'prev', h: '전월 이월', t: 'num', w: '14%', d: '3200000' },
        { k: 'sales', h: '당월 매출', t: 'num', w: '14%', d: '12500000' },
        { k: 'paid', h: '수금액', t: 'num', w: '14%', d: '9000000' },
        { k: 'due', h: '약정일', w: '11%', d: '익월 15일' },
        { k: 'memo', h: '비고', w: '14%', d: '12/10 입금 예정' }
      ],
      def: [
        { client: 'A상사', owner: '김철수', prev: '3200000', sales: '12500000', paid: '9000000', due: '익월 15일', memo: '12/10 입금 예정' },
        { client: 'B물산', owner: '박영희', prev: '0', sales: '7100000', paid: '7100000', due: '즉시', memo: '현금 결제' },
        { client: 'C테크', owner: '김철수', prev: '1500000', sales: '2400000', paid: '1000000', due: '익월 말일', memo: '30일 초과, 독촉 필요' }
      ]
    }],
    table: {
      set: 'rows', empty: 6,
      cols: [
        { k: 'client', h: '거래처' }, { k: 'owner', h: '담당', t: 'center' },
        { k: 'prev', h: '전월 이월', t: 'num' }, { k: 'sales', h: '당월 매출', t: 'num' },
        { k: 'paid', h: '수금액', t: 'num' },
        { k: 'balance', h: '잔액', t: 'num', calc: function (r) { return n(r.prev) + n(r.sales) - n(r.paid); } },
        { k: 'rate', h: '수금률', t: 'num', calc: function (r) { var t = n(r.prev) + n(r.sales); return t ? Math.round(n(r.paid) / t * 100) : 0; } },
        { k: 'due', h: '약정일', t: 'center' }, { k: 'memo', h: '비고' }
      ],
      foot: [{ l: '합계', colspan: 2, align: 'right' }, { v: function (d) { return sum(d, 'rows', 'prev'); } }, { v: function (d) { return sum(d, 'rows', 'sales'); } }, { v: function (d) { return sum(d, 'rows', 'paid'); } }, { v: function (d) { return sum(d, 'rows', 'balance'); } }, { v: '' }, { v: '' }, { v: '' }],
      noteText: '수금률은 (전월 이월 + 당월 매출) 대비 수금액 비율입니다. 잔액이 큰 거래처는 약정일과 실제 입금일을 함께 적어 두면 독촉 시점을 놓치지 않습니다.'
    },
    summary: [
      { l: '총 매출', v: function (d) { return sum(d, 'rows', 'sales'); }, unit: '원' },
      { l: '총 수금', v: function (d) { return sum(d, 'rows', 'paid'); }, unit: '원' },
      { l: '미수 잔액', v: function (d) { return sum(d, 'rows', 'balance'); }, unit: '원', grand: true }
    ],
    csv: function (d) {
      var out = [['거래처', '담당', '전월 이월', '당월 매출', '수금액', '잔액', '수금률(%)', '약정일', '비고']];
      (d.sets.rows || []).forEach(function (r) {
        var t = n(r.prev) + n(r.sales);
        out.push([r.client, r.owner, n(r.prev), n(r.sales), n(r.paid), t - n(r.paid), t ? Math.round(n(r.paid) / t * 100) : 0, r.due, r.memo]);
      });
      return out;
    },
    fileBase: 'client-ledger'
  });

  /* ---------------------------------------------------------
     4. 재고 관리표
  --------------------------------------------------------- */
  add({
    id: 'inventory', cat: 'excel', sub: 'ex-sales', no: '05', kind: 'excel',
    name: '재고 관리표', en: 'INVENTORY TRACKER',
    keywords: '재고관리표 재고 현황 입고 출고 안전재고 재고금액 창고 관리',
    fields: [
      { g: '문서', k: 'docName', l: '문서명', d: '2026년 11월 재고 관리표', w: 2 },
      { g: '문서', k: 'period', l: '기준일', d: today(), w: 2 },
      { g: '문서', k: 'warehouse', l: '창고', d: '본사 창고' },
      { g: '문서', k: 'writer', l: '작성자', d: '박영희' }
    ],
    sets: [{
      k: 'rows', label: '품목별 재고', addLabel: '품목 추가',
      cols: [
        { k: 'item', h: '품목', w: '24%', d: '재생 PC 펠렛 (검정)' },
        { k: 'code', h: '품목코드', w: '12%', d: 'PC-BK-01' },
        { k: 'unit', h: '단위', w: '8%', d: 'kg' },
        { k: 'open', h: '기초', t: 'num', w: '11%', d: '12000' },
        { k: 'in', h: '입고', t: 'num', w: '11%', d: '25000' },
        { k: 'out', h: '출고', t: 'num', w: '11%', d: '28000' },
        { k: 'safe', h: '안전재고', t: 'num', w: '11%', d: '8000' },
        { k: 'cost', h: '단가', t: 'num', w: '12%', d: '1020' }
      ],
      def: [
        { item: '재생 PC 펠렛 (검정)', code: 'PC-BK-01', unit: 'kg', open: '12000', in: '25000', out: '28000', safe: '8000', cost: '1020' },
        { item: '재생 ABS 펠렛 (회색)', code: 'ABS-GR-02', unit: 'kg', open: '4000', in: '5000', out: '6200', safe: '3000', cost: '1180' },
        { item: '25kg 포대', code: 'BAG-25', unit: '장', open: '900', in: '2000', out: '1500', safe: '500', cost: '380' }
      ]
    }],
    table: {
      set: 'rows', empty: 6,
      cols: [
        { k: 'item', h: '품목' }, { k: 'code', h: '품목코드', t: 'center' }, { k: 'unit', h: '단위', t: 'center' },
        { k: 'open', h: '기초', t: 'num' }, { k: 'in', h: '입고', t: 'num' }, { k: 'out', h: '출고', t: 'num' },
        { k: 'stock', h: '기말재고', t: 'num', calc: function (r) { return n(r.open) + n(r.in) - n(r.out); } },
        { k: 'safe', h: '안전재고', t: 'num' },
        { k: 'amount', h: '재고금액', t: 'num', calc: function (r) { return (n(r.open) + n(r.in) - n(r.out)) * n(r.cost); } }
      ],
      foot: [{ l: '합계', colspan: 8, align: 'right' }, { v: function (d) { return sum(d, 'rows', 'amount'); } }],
      noteText: '기말재고 = 기초 + 입고 − 출고. 안전재고보다 적은 품목 수는 아래 요약의 ‘부족 품목’에 표시됩니다. 단가는 부가세 별도 매입 단가를 쓰고, 재고금액은 수량 × 단가로 계산합니다.'
    },
    summary: [
      { l: '재고 총금액', v: function (d) { return sum(d, 'rows', 'amount'); }, unit: '원' },
      { l: '부족 품목', v: function (d) { return (d.sets.rows || []).filter(function (r) { return (n(r.open) + n(r.in) - n(r.out)) < n(r.safe); }).length; }, unit: '개', grand: true }
    ],
    csv: function (d) {
      var out = [['품목', '품목코드', '단위', '기초', '입고', '출고', '기말재고', '안전재고', '상태', '재고금액']];
      (d.sets.rows || []).forEach(function (r) {
        var s = n(r.open) + n(r.in) - n(r.out);
        out.push([r.item, r.code, r.unit, n(r.open), n(r.in), n(r.out), s, n(r.safe), s < n(r.safe) ? '부족' : '정상', s * n(r.cost)]);
      });
      return out;
    },
    fileBase: 'inventory-tracker'
  });

  /* ---------------------------------------------------------
     5. 세금계산서 발행·수취 집계표
  --------------------------------------------------------- */
  add({
    id: 'tax-invoice-sum', cat: 'excel', sub: 'ex-quote', no: '02', kind: 'excel',
    name: '세금계산서 발행·수취 집계표', en: 'TAX INVOICE SUMMARY',
    keywords: '세금계산서 집계 발행 수취 매출세액 매입세액 부가세 신고 합계표',
    fields: [
      { g: '문서', k: 'docName', l: '문서명', d: '2026년 2기 부가세 신고용 세금계산서 집계', w: 2 },
      { g: '문서', k: 'period', l: '귀속 기간', d: '2026-10-01 ~ 2026-12-31', w: 2 },
      { g: '문서', k: 'writer', l: '작성자', d: '김철수' },
      { g: '문서', k: 'bizNo', l: '사업자번호', d: '000-00-00000' }
    ],
    sets: [{
      k: 'rows', label: '세금계산서 내역', addLabel: '건 추가',
      cols: [
        { k: 'date', h: '작성일', t: 'date', w: '14%', d: today() },
        { k: 'kind', h: '구분', w: '11%', d: '매출' },
        { k: 'partner', h: '거래처', w: '24%', d: 'A상사' },
        { k: 'bizNo', h: '사업자번호', w: '16%', d: '000-00-00000' },
        { k: 'supply', h: '공급가액', t: 'num', w: '17%', d: '12500000' },
        { k: 'memo', h: '품목·비고', w: '18%', d: '재생 PC 펠렛' }
      ],
      def: [
        { date: today(), kind: '매출', partner: 'A상사', bizNo: '000-00-00001', supply: '12500000', memo: '재생 PC 펠렛' },
        { date: addD(today(), -3), kind: '매출', partner: 'B물산', bizNo: '000-00-00002', supply: '7100000', memo: '재생 ABS 펠렛' },
        { date: addD(today(), -8), kind: '매입', partner: 'C머티리얼', bizNo: '000-00-00003', supply: '25500000', memo: '원료 매입' },
        { date: addD(today(), -12), kind: '매입', partner: 'D로지스', bizNo: '000-00-00004', supply: '480000', memo: '운송비' }
      ]
    }],
    table: {
      set: 'rows', empty: 8,
      cols: [
        { k: 'date', h: '작성일', t: 'center' }, { k: 'kind', h: '구분', t: 'center' }, { k: 'partner', h: '거래처' },
        { k: 'bizNo', h: '사업자번호', t: 'center' }, { k: 'supply', h: '공급가액', t: 'num' },
        { k: 'vat', h: '세액', t: 'num', calc: function (r) { return Math.round(n(r.supply) * 0.1); } },
        { k: 'total', h: '합계금액', t: 'num', calc: function (r) { return Math.round(n(r.supply) * 1.1); } },
        { k: 'memo', h: '품목·비고' }
      ],
      foot: [{ l: '합계', colspan: 4, align: 'right' }, { v: function (d) { return sum(d, 'rows', 'supply'); } }, { v: function (d) { return sum(d, 'rows', 'vat'); } }, { v: function (d) { return sum(d, 'rows', 'total'); } }, { v: '' }],
      noteText: '세액은 공급가액의 10%로 계산한 값입니다. 영세율·면세 거래는 세액이 0이므로 구분을 따로 적어 주세요. 신고 전 홈택스의 전자세금계산서 합계표와 반드시 대조하세요.'
    },
    summary: [
      { l: '매출 공급가액', v: function (d) { return (d.sets.rows || []).filter(function (r) { return r.kind === '매출'; }).reduce(function (a, r) { return a + n(r.supply); }, 0); }, unit: '원' },
      { l: '매출세액', v: function (d) { return Math.round((d.sets.rows || []).filter(function (r) { return r.kind === '매출'; }).reduce(function (a, r) { return a + n(r.supply); }, 0) * 0.1); }, unit: '원' },
      { l: '매입세액', v: function (d) { return Math.round((d.sets.rows || []).filter(function (r) { return r.kind === '매입'; }).reduce(function (a, r) { return a + n(r.supply); }, 0) * 0.1); }, unit: '원' },
      { l: '납부(환급) 예상세액', v: function (d) {
        var s = 0, p = 0;
        (d.sets.rows || []).forEach(function (r) { if (r.kind === '매출') s += n(r.supply); else if (r.kind === '매입') p += n(r.supply); });
        return Math.round(s * 0.1) - Math.round(p * 0.1);
      }, unit: '원', grand: true }
    ],
    csv: function (d) {
      var out = [['작성일', '구분', '거래처', '사업자번호', '공급가액', '세액', '합계금액', '비고']];
      (d.sets.rows || []).forEach(function (r) {
        out.push([r.date, r.kind, r.partner, r.bizNo, n(r.supply), Math.round(n(r.supply) * 0.1), Math.round(n(r.supply) * 1.1), r.memo]);
      });
      return out;
    },
    fileBase: 'tax-invoice-summary'
  });

  /* ---------------------------------------------------------
     6. 자금일보
  --------------------------------------------------------- */
  add({
    id: 'cash-daily', cat: 'excel', sub: 'ex-expense', no: '02', kind: 'excel',
    name: '자금일보 (입출금 관리)', en: 'DAILY CASH REPORT',
    keywords: '자금일보 입출금 관리 일일 자금 현금 계좌 잔액 자금 계획',
    fields: [
      { g: '문서', k: 'docName', l: '문서명', d: '2026년 11월 24일 자금일보', w: 2 },
      { g: '문서', k: 'period', l: '일자', d: today(), w: 2 },
      { g: '문서', k: 'writer', l: '작성자', d: '이민수' },
      { g: '문서', k: 'openBalance', l: '전일 잔액', t: 'num', d: '18450000', h: '원' }
    ],
    sets: [{
      k: 'rows', label: '입출금 내역', addLabel: '내역 추가',
      cols: [
        { k: 'account', h: '계좌', w: '18%', d: '국민 운영계좌' },
        { k: 'kind', h: '구분', w: '10%', d: '입금' },
        { k: 'partner', h: '거래처·내용', w: '30%', d: 'A상사 외상대' },
        { k: 'amount', h: '금액', t: 'num', w: '20%', d: '4500000' },
        { k: 'memo', h: '비고', w: '22%', d: '세금계산서 3건' }
      ],
      def: [
        { account: '국민 운영계좌', kind: '입금', partner: 'A상사 외상대', amount: '4500000', memo: '세금계산서 3건' },
        { account: '국민 운영계좌', kind: '출금', partner: 'C머티리얼 원료대', amount: '8800000', memo: '12월 납품분 선급' },
        { account: '신한 급여계좌', kind: '출금', partner: '11월 급여 이체', amount: '6240000', memo: '직원 3명' },
        { account: '국민 운영계좌', kind: '입금', partner: 'B물산 현금 매출', amount: '2310000', memo: '' }
      ]
    }],
    table: {
      set: 'rows', empty: 8,
      cols: [
        { k: 'account', h: '계좌' }, { k: 'kind', h: '구분', t: 'center' }, { k: 'partner', h: '거래처·내용' },
        { k: 'amount', h: '금액', t: 'num' }, { k: 'io', h: '입금(+)', t: 'num', calc: function (r) { return r.kind === '입금' ? n(r.amount) : 0; } },
        { k: 'out', h: '출금(−)', t: 'num', calc: function (r) { return r.kind === '출금' ? n(r.amount) : 0; } },
        { k: 'memo', h: '비고' }
      ],
      foot: [{ l: '합계', colspan: 4, align: 'right' }, { v: function (d) { return sum(d, 'rows', 'io'); } }, { v: function (d) { return sum(d, 'rows', 'out'); } }, { v: '' }],
      noteText: '입금·출금 구분을 정확히 적으면 합계가 자동으로 나뉩니다. 전일 잔액에 오늘 입금을 더하고 출금을 빼면 당일 잔액이 됩니다.'
    },
    summary: [
      { l: '전일 잔액', v: function (d) { return n(d.f.openBalance); }, unit: '원' },
      { l: '당일 입금', v: function (d) { return sum(d, 'rows', 'io'); }, unit: '원' },
      { l: '당일 출금', v: function (d) { return sum(d, 'rows', 'out'); }, unit: '원' },
      { l: '당일 잔액', v: function (d) { return n(d.f.openBalance) + sum(d, 'rows', 'io') - sum(d, 'rows', 'out'); }, unit: '원', grand: true }
    ],
    csv: function (d) {
      var out = [['계좌', '구분', '거래처·내용', '금액', '입금', '출금', '비고']];
      (d.sets.rows || []).forEach(function (r) {
        out.push([r.account, r.kind, r.partner, n(r.amount), r.kind === '입금' ? n(r.amount) : 0, r.kind === '출금' ? n(r.amount) : 0, r.memo]);
      });
      return out;
    },
    fileBase: 'daily-cash'
  });

  /* ---------------------------------------------------------
     7. 프로젝트 일정·진행 관리표
  --------------------------------------------------------- */
  add({
    id: 'project-schedule', cat: 'excel', sub: 'ex-goal', no: '03', kind: 'excel',
    name: '프로젝트 일정·진행 관리표', en: 'PROJECT SCHEDULE',
    keywords: '프로젝트 일정표 진행률 간트 일정 관리 마일스톤 업무 분장 공정표',
    fields: [
      { g: '프로젝트', k: 'docName', l: '프로젝트명', d: '신규 거래처 공급 라인 구축', w: 2 },
      { g: '프로젝트', k: 'period', l: '기간', d: '2026-11-01 ~ 2027-01-31', w: 2 },
      { g: '프로젝트', k: 'owner', l: 'PM', d: '홍길동' },
      { g: '프로젝트', k: 'client', l: '고객·발주처', d: '△△물산' }
    ],
    sets: [{
      k: 'rows', label: '공정별 일정', addLabel: '공정 추가',
      cols: [
        { k: 'phase', h: '단계', w: '14%', d: '기획' },
        { k: 'task', h: '작업', w: '30%', d: '요구사항 정리' },
        { k: 'owner', h: '담당', w: '12%', d: '김철수' },
        { k: 'start', h: '시작일', t: 'date', w: '14%', d: '2026-11-01' },
        { k: 'end', h: '종료일', t: 'date', w: '14%', d: '2026-11-14' },
        { k: 'progress', h: '진행률(%)', t: 'num', w: '16%', d: '100' }
      ],
      def: [
        { phase: '기획', task: '요구사항 정리', owner: '김철수', start: '2026-11-01', end: '2026-11-14', progress: '100' },
        { phase: '설계', task: '공급 사양·물량 확정', owner: '홍길동', start: '2026-11-10', end: '2026-11-28', progress: '80' },
        { phase: '시험', task: '샘플 테스트 3회', owner: '박영희', start: '2026-11-25', end: '2026-12-19', progress: '35' },
        { phase: '양산', task: '월 200톤 공급 개시', owner: '김철수', start: '2027-01-02', end: '2027-01-31', progress: '0' }
      ]
    }],
    table: {
      set: 'rows', empty: 6,
      cols: [
        { k: 'phase', h: '단계', t: 'center' }, { k: 'task', h: '작업' }, { k: 'owner', h: '담당', t: 'center' },
        { k: 'start', h: '시작일', t: 'center' }, { k: 'end', h: '종료일', t: 'center' },
        { k: 'days', h: '기간(일)', t: 'num', calc: function (r) { var a = new Date(r.start), b = new Date(r.end); return (isNaN(a) || isNaN(b)) ? 0 : Math.round((b - a) / 86400000) + 1; } },
        { k: 'progress', h: '진행률(%)', t: 'num' }
      ],
      foot: [{ l: '전체 진행률(평균)', colspan: 6, align: 'right' }, { v: function (d) { var r2 = d.sets.rows || []; return r2.length ? Math.round(r2.reduce(function (a, x) { return a + n(x.progress); }, 0) / r2.length) : 0; } }, { v: '' }],
      noteText: '진행률 평균은 단순 평균입니다. 기간이 긴 작업에 가중치를 주려면 진행률 옆에 가중치 열을 추가해 계산하세요.'
    },
    summary: [
      { l: '전체 공정 수', v: function (d) { return (d.sets.rows || []).length; }, unit: '건' },
      { l: '완료 공정', v: function (d) { return (d.sets.rows || []).filter(function (r) { return n(r.progress) >= 100; }).length; }, unit: '건' },
      { l: '전체 진행률', v: function (d) { var r2 = d.sets.rows || []; return r2.length ? Math.round(r2.reduce(function (a, x) { return a + n(x.progress); }, 0) / r2.length) : 0; }, unit: '%', grand: true }
    ],
    csv: function (d) {
      var out = [['단계', '작업', '담당', '시작일', '종료일', '진행률(%)']];
      (d.sets.rows || []).forEach(function (r) { out.push([r.phase, r.task, r.owner, r.start, r.end, n(r.progress)]); });
      return out;
    },
    fileBase: 'project-schedule'
  });

  /* ---------------------------------------------------------
     8. 퇴직금 계산기
  --------------------------------------------------------- */
  add({
    id: 'severance', cat: 'excel', sub: 'ex-pay', no: '06', kind: 'excel',
    name: '퇴직금 계산기', en: 'SEVERANCE CALCULATOR',
    keywords: '퇴직금 계산기 퇴직금 산정 평균임금 계속근로기간 퇴직소득 퇴직 정산',
    fields: [
      { g: '문서', k: 'docName', l: '문서명', d: '2026년 12월 퇴직금 산정', w: 2 },
      { g: '문서', k: 'period', l: '기준일', d: today(), w: 2 },
      { g: '문서', k: 'writer', l: '작성자', d: '이민수' },
      { g: '문서', k: 'company', l: '회사명', d: '○○상사' }
    ],
    sets: [{
      k: 'rows', label: '퇴직자별 산정', addLabel: '퇴직자 추가',
      cols: [
        { k: 'name', h: '성명', w: '14%', d: '김철수' },
        { k: 'join', h: '입사일', t: 'date', w: '16%', d: '2019-03-02' },
        { k: 'leave', h: '퇴사일', t: 'date', w: '16%', d: '2026-12-31' },
        { k: 'base', h: '월 기본급', t: 'num', w: '17%', d: '2800000' },
        { k: 'allow', h: '월 수당', t: 'num', w: '15%', d: '400000' },
        { k: 'bonus', h: '연 상여', t: 'num', w: '22%', d: '2000000' }
      ],
      def: [
        { name: '김철수', join: '2019-03-02', leave: '2026-12-31', base: '2800000', allow: '400000', bonus: '2000000' },
        { name: '박영희', join: '2021-07-01', leave: '2026-12-31', base: '3200000', allow: '250000', bonus: '1500000' }
      ]
    }],
    table: {
      set: 'rows', empty: 4,
      cols: [
        { k: 'name', h: '성명' }, { k: 'join', h: '입사일', t: 'center' }, { k: 'leave', h: '퇴사일', t: 'center' },
        { k: 'years', h: '근속연수', t: 'num', calc: function (r) { var a = new Date(r.join), b = new Date(r.leave); return (isNaN(a) || isNaN(b)) ? 0 : Math.round(((b - a) / 86400000 / 365.25) * 10) / 10; } },
        { k: 'months', h: '근속일수', t: 'num', calc: function (r) { var a = new Date(r.join), b = new Date(r.leave); return (isNaN(a) || isNaN(b)) ? 0 : Math.round((b - a) / 86400000); } },
        { k: 'avg', h: '평균임금(90일)', t: 'num', calc: function (r) { return Math.round((n(r.base) + n(r.allow)) + n(r.bonus) / 12); } },
        { k: 'severance', h: '퇴직금', t: 'num', calc: function (r) {
          var a = new Date(r.join), b = new Date(r.leave);
          var days = (isNaN(a) || isNaN(b)) ? 0 : Math.round((b - a) / 86400000);
          var daily = Math.round(((n(r.base) + n(r.allow)) * 3 + n(r.bonus) / 4) / 92);
          return Math.max(0, Math.round(daily * 30 * (days / 365)));
        } }
      ],
      foot: [{ l: '합계', colspan: 6, align: 'right' }, { v: function (d) { return sum(d, 'rows', 'severance'); } }],
      noteText: '퇴직금 = 1일 평균임금 × 30일 × (계속근로일수 ÷ 365). 여기서는 최근 3개월 급여(기본급+수당)×3 + 연간 상여 ÷ 4를 92일로 나눠 1일 평균임금을 추정했습니다. 실제 평균임금은 직전 3개월 임금총액을 그 기간의 역일수로 나눠 계산하며, 상여·연차수당 포함 여부에 따라 달라집니다.'
    },
    summary: [
      { l: '퇴직금 합계', v: function (d) { return sum(d, 'rows', 'severance'); }, unit: '원' },
      { l: '산정 인원', v: function (d) { return (d.sets.rows || []).length; }, unit: '명', grand: true }

    ],
    csv: function (d) {
      var out = [['성명', '입사일', '퇴사일', '근속일수', '평균임금(추정)', '퇴직금(추정)']];
      (d.sets.rows || []).forEach(function (r) {
        var a = new Date(r.join), b = new Date(r.leave);
        var days = (isNaN(a) || isNaN(b)) ? 0 : Math.round((b - a) / 86400000);
        var daily = Math.round(((n(r.base) + n(r.allow)) * 3 + n(r.bonus) / 4) / 92);
        out.push([r.name, r.join, r.leave, days, daily, Math.max(0, Math.round(daily * 30 * (days / 365)))]);
      });
      return out;
    },
    fileBase: 'severance'
  });

  /* ---------------------------------------------------------
     9. 주휴·연장수당 계산기 (알바·단시간)
  --------------------------------------------------------- */
  add({
    id: 'weekly-allow', cat: 'excel', sub: 'ex-pay', no: '07', kind: 'excel',
    name: '주휴·연장수당 계산기 (알바·단시간)', en: 'PART-TIME PAY CALCULATOR',
    keywords: '주휴수당 연장수당 알바 급여 계산 시급 단시간 근로 주휴일 야간 가산',
    fields: [
      { g: '문서', k: 'docName', l: '문서명', d: '2026년 11월 알바 급여 계산', w: 2 },
      { g: '문서', k: 'period', l: '귀속월', d: '2026-11', w: 2 },
      { g: '문서', k: 'writer', l: '작성자', d: '박영희' },
      { g: '기준', k: 'minWage', l: '적용 시급(2026년 최저임금 참고)', t: 'num', d: '10320', h: '원' }
    ],
    sets: [{
      k: 'rows', label: '근로자별 계산', addLabel: '근로자 추가',
      cols: [
        { k: 'name', h: '성명', w: '14%', d: '정수진' },
        { k: 'hourly', h: '시급', t: 'num', w: '13%', d: '11000' },
        { k: 'weekHours', h: '주 근무시간', t: 'num', w: '14%', d: '20' },
        { k: 'weeks', h: '주 수', t: 'num', w: '10%', d: '4' },
        { k: 'over', h: '연장시간', t: 'num', w: '12%', d: '6' },
        { k: 'night', h: '야간시간', t: 'num', w: '12%', d: '4' },
        { k: 'holiday', h: '휴일근무', t: 'num', w: '12%', d: '8' }
      ],
      def: [
        { name: '정수진', hourly: '11000', weekHours: '20', weeks: '4', over: '6', night: '4', holiday: '8' },
        { name: '최민호', hourly: '10320', weekHours: '15', weeks: '4', over: '0', night: '0', holiday: '0' }
      ]
    }],
    table: {
      set: 'rows', empty: 4,
      cols: [
        { k: 'name', h: '성명' }, { k: 'hourly', h: '시급', t: 'num' },
        { k: 'base', h: '기본급', t: 'num', calc: function (r) { return n(r.hourly) * n(r.weekHours) * n(r.weeks); } },
        { k: 'weekly', h: '주휴수당', t: 'num', calc: function (r) { return n(r.weekHours) >= 15 ? Math.round(n(r.hourly) * Math.min(8, n(r.weekHours) / 5) * n(r.weeks)) : 0; } },
        { k: 'overPay', h: '연장수당', t: 'num', calc: function (r) { return Math.round(n(r.hourly) * 1.5 * n(r.over)); } },
        { k: 'nightPay', h: '야간가산', t: 'num', calc: function (r) { return Math.round(n(r.hourly) * 0.5 * n(r.night)); } },
        { k: 'holidayPay', h: '휴일수당', t: 'num', calc: function (r) { return Math.round(n(r.hourly) * 1.5 * n(r.holiday)); } },
        { k: 'total', h: '지급 합계', t: 'num', calc: function (r) {
          var base = n(r.hourly) * n(r.weekHours) * n(r.weeks);
          var weekly = n(r.weekHours) >= 15 ? Math.round(n(r.hourly) * Math.min(8, n(r.weekHours) / 5) * n(r.weeks)) : 0;
          return base + weekly + Math.round(n(r.hourly) * 1.5 * n(r.over)) + Math.round(n(r.hourly) * 0.5 * n(r.night)) + Math.round(n(r.hourly) * 1.5 * n(r.holiday));
        } }
      ],
      foot: [{ l: '합계', colspan: 7, align: 'right' }, { v: function (d) { return sum(d, 'rows', 'total'); } }],
      noteText: '주휴수당은 1주 소정근로시간이 15시간 이상인 근로자에게 지급하며, 40시간 미만이면 (소정근로시간 ÷ 40) × 8시간분이 발생합니다. 여기서는 1일 소정근로를 주 5일 기준으로 나눠 8시간을 상한으로 계산했습니다. 5인 미만 사업장은 연장·야간·휴일 가산이 적용되지 않습니다.'
    },
    summary: [
      { l: '총 지급액', v: function (d) { return sum(d, 'rows', 'total'); }, unit: '원' },
      { l: '최저임금 미달 인원', v: function (d) { var mw = n(d.f.minWage); return (d.sets.rows || []).filter(function (r) { return n(r.hourly) < mw; }).length; }, unit: '명', grand: true }
    ],
    csv: function (d) {
      var out = [['성명', '시급', '기본급', '주휴수당', '연장수당', '야간가산', '휴일수당', '지급 합계']];
      (d.sets.rows || []).forEach(function (r) {
        var base = n(r.hourly) * n(r.weekHours) * n(r.weeks);
        var weekly = n(r.weekHours) >= 15 ? Math.round(n(r.hourly) * Math.min(8, n(r.weekHours) / 5) * n(r.weeks)) : 0;
        var overPay = Math.round(n(r.hourly) * 1.5 * n(r.over));
        var nightPay = Math.round(n(r.hourly) * 0.5 * n(r.night));
        var holPay = Math.round(n(r.hourly) * 1.5 * n(r.holiday));
        out.push([r.name, n(r.hourly), base, weekly, overPay, nightPay, holPay, base + weekly + overPay + nightPay + holPay]);
      });
      return out;
    },
    fileBase: 'parttime-pay'
  });

  /* ---------------------------------------------------------
     10. 비품·법인카드 사용대장
  --------------------------------------------------------- */
  add({
    id: 'asset-ledger', cat: 'excel', sub: 'ex-expense', no: '03', kind: 'excel',
    name: '비품·법인카드 사용대장', en: 'ASSET & CARD LEDGER',
    keywords: '비품대장 법인카드 사용대장 자산 관리 비품 구입 카드 지출 증빙',
    fields: [
      { g: '문서', k: 'docName', l: '문서명', d: '2026년 비품·법인카드 사용대장', w: 2 },
      { g: '문서', k: 'period', l: '기준 기간', d: '2026-01 ~ 2026-12', w: 2 },
      { g: '문서', k: 'dept', l: '관리 부서', d: '운영지원팀' },
      { g: '문서', k: 'writer', l: '작성자', d: '이민수' }
    ],
    sets: [{
      k: 'rows', label: '사용 내역', addLabel: '내역 추가',
      cols: [
        { k: 'date', h: '일자', t: 'date', w: '13%', d: today() },
        { k: 'kind', h: '구분', w: '12%', d: '비품' },
        { k: 'item', h: '품명·사용처', w: '28%', d: '복합기 토너' },
        { k: 'dept', h: '부서', w: '14%', d: '영업팀' },
        { k: 'amount', h: '금액', t: 'num', w: '15%', d: '88000' },
        { k: 'proof', h: '증빙', w: '18%', d: '세금계산서' }
      ],
      def: [
        { date: today(), kind: '비품', item: '복합기 토너', dept: '영업팀', amount: '88000', proof: '세금계산서' },
        { date: addD(today(), -5), kind: '법인카드', item: '거래처 접대 식사', dept: '영업팀', amount: '154000', proof: '카드전표·영수증' },
        { date: addD(today(), -9), kind: '비품', item: '사무용 의자 2개', dept: '운영지원팀', amount: '398000', proof: '세금계산서' },
        { date: addD(today(), -15), kind: '법인카드', item: '주유 (배송 차량)', dept: '물류팀', amount: '120000', proof: '카드전표' }
      ]
    }],
    table: {
      set: 'rows', empty: 8,
      cols: [
        { k: 'date', h: '일자', t: 'center' }, { k: 'kind', h: '구분', t: 'center' }, { k: 'item', h: '품명·사용처' },
        { k: 'dept', h: '부서', t: 'center' }, { k: 'amount', h: '금액', t: 'num' }, { k: 'vat', h: '부가세', t: 'num', calc: function (r) { return Math.round(n(r.amount) / 11); } }, { k: 'proof', h: '증빙' }
      ],
      foot: [{ l: '합계', colspan: 4, align: 'right' }, { v: function (d) { return sum(d, 'rows', 'amount'); } }, { v: function (d) { return sum(d, 'rows', 'vat'); } }, { v: '' }],
      noteText: '금액이 부가세 포함이면 부가세는 금액 ÷ 11로 역산합니다. 접대비·차량유지비는 증빙과 사용 목적이 함께 있어야 비용으로 인정되므로 사용처를 구체적으로 적으세요.'
    },
    summary: [
      { l: '비품 구입', v: function (d) { return (d.sets.rows || []).filter(function (r) { return r.kind === '비품'; }).reduce(function (a, r) { return a + n(r.amount); }, 0); }, unit: '원' },
      { l: '법인카드 사용', v: function (d) { return (d.sets.rows || []).filter(function (r) { return r.kind === '법인카드'; }).reduce(function (a, r) { return a + n(r.amount); }, 0); }, unit: '원' },
      { l: '총 사용액', v: function (d) { return sum(d, 'rows', 'amount'); }, unit: '원', grand: true }
    ],
    csv: function (d) {
      var out = [['일자', '구분', '품명·사용처', '부서', '금액', '부가세', '증빙']];
      (d.sets.rows || []).forEach(function (r) { out.push([r.date, r.kind, r.item, r.dept, n(r.amount), Math.round(n(r.amount) / 11), r.proof]); });
      return out;
    },
    fileBase: 'asset-card-ledger'
  });
})(typeof window !== 'undefined' ? window : this);
