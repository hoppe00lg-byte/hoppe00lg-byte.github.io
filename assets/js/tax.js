/* =========================================================
   INSIGHT BRIEF — 세무·결산 자체처리 툴 (tax.html) / Tax & Closing Tool
   · 모든 자료는 브라우저 localStorage 에만 저장합니다(서버 전송 없음).
   · 홈택스·은행 자료는 CSV 업로드 또는 직접 입력으로 받습니다.
   · 언어·국가에 따라 세율·통화·계정과목·체크리스트·샘플이 바뀝니다.
     ko = 한국(부가세·4대보험·원천세) / en = 미국(Sales tax·FICA·1120/Schedule C)
     zh = 중국(增值税·五险一金·企业所得税) / ja = 일본(消費税·社会保険·法人税)
   ========================================================= */
(function () {
  'use strict';

  var KEY = 'ib.tax.v1';

  /* ---------------------------------------------------------- 기본 도구 */
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function num(v) {
    if (typeof v === 'number') return isFinite(v) ? v : 0;
    var s = String(v == null ? '' : v).replace(/[^0-9.\-]/g, '');
    var n = parseFloat(s);
    return isFinite(n) ? n : 0;
  }
  function r0(n) { return Math.round(num(n)); }
  function r10(n) { return Math.round(num(n) / 10) * 10; }
  function clamp(n, a, b) { return Math.min(b, Math.max(a, n)); }
  function nf(n, d) {
    var v = num(n), s = Math.abs(v).toFixed(d || 0).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return (v < 0 ? '-' : '') + s;
  }
  function pctv(n, d) { return (num(n) * 100).toFixed(d == null ? 2 : d) + '%'; }
  function todayISO() {
    var d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function localStamp() {
    var d = new Date();
    return '' + d.getFullYear() + String(d.getMonth() + 1).padStart(2, '0') + String(d.getDate()).padStart(2, '0');
  }
  function isoDate(v) {
    var s = String(v == null ? '' : v).trim();
    var m = s.match(/(\d{4})\D?(\d{1,2})\D?(\d{1,2})/);
    if (!m) return '';
    return m[1] + '-' + String(m[2]).padStart(2, '0') + '-' + String(m[3]).padStart(2, '0');
  }
  function days(a, b) {
    var A = Date.parse(a + 'T00:00:00'), B = Date.parse(b + 'T00:00:00');
    if (isNaN(A) || isNaN(B)) return 9999;
    return Math.round((A - B) / 86400000);
  }
  function monthKey(d) { return String(d || '').slice(0, 7); }
  function uid(p) { return (p || 'x') + Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-3); }

  /* ---------------------------------------------------------- 국가·언어 */
  var LOCALE = (function () {
    var path = (location.pathname || '');
    var m = path.match(/\/(en|zh|ja)\//);
    if (m) return m[1];
    var l = (document.documentElement.getAttribute('lang') || 'ko').toLowerCase();
    if (l.indexOf('zh') === 0) return 'zh';
    if (l.indexOf('ja') === 0) return 'ja';
    if (l.indexOf('en') === 0) return 'en';
    return 'ko';
  })();

  /* ---------------------------------------------------------- 문구 */
  var L = {
    ko: {
      entityCorp: '법인사업자', entitySole: '개인사업자',
      noteCorp: '법인 · 법인세 9~19% 구간', noteSole: '개인 · 종합소득세 6~45% 구간',
      kpiVat: '예상 부가가치세 (납부·환급)', kpiVatSub: '매출세액 − 매입세액 − 영세율 공제',
      kpiMonth: '이번 달 영업이익', kpiMonthSub: '이번 달 매출 − 비용',
      kpiYear: '연간 영업이익', kpiYearSub: '과세기간 누적',
      kpiTaxCorp: '예상 법인세', kpiTaxSole: '예상 종합소득세', kpiTaxSub: '간이세율 · 지방세 포함',
      vatRefund: ' (환급)', vatPay: '납부 예상', vatRefundShort: '환급 예상',
      rows: {
        taxableSales: ['과세 매출 공급가액', '세금계산서 매출 + 증빙 없는 입금'],
        zeroSales: ['영세율 매출 (수출)', '수출실적 환산 합계'],
        salesTax: ['매출세액', '과세 매출 × 세율'],
        purchaseSupply: ['과세 매입 공급가액', '세금계산서·카드·현금영수증 매입'],
        purchaseTax: ['매입세액', '적격증빙 있는 매입만'],
        zeroCredit: ['영세율 공제', '영세율 대응으로 표시한 매입세액'],
        vatDue: ['예상 납부(환급)세액', '차감계'],
        opProfit: ['영업이익 (연간)', '매출 − 매출원가 − 판관비'],
        nonOp: ['영업외 손익', '외환·외화평가·이자'],
        pretax: ['법인세차감전이익', '영업이익 + 영업외손익'],
        taxBase: ['과세표준 (추정)', '세무조정 미반영'],
        localTax: ['지방소득세', '소득세액의 10%']
      },
      chipExcluded: '제외', chipUndecided: '미정', chipMatched: '매칭', chipNoEvidence: '없음',
      chipNoDesc: '적요 없음', chipZero: '영세율',
      qSales: '매출입금', qPurchase: '매입결제', qWelfare: '복리후생', qEntertain: '접대비',
      qOwner: '대표자 가지급·가수금', qExclude: '제외',
      qNoAcct: '계정 미정', qNoDesc: '적요 없음', qNoMatch: '증빙 미매칭', qSuggest: '추천',
      emptyBankT: '통장 내역이 없습니다', emptyBankS: '위에서 CSV를 올리거나 "샘플 데이터 불러오기"를 눌러 보세요.',
      emptyEvT: '증빙이 없습니다', emptyEvS: '홈택스에서 내려받은 CSV를 올리거나 직접 추가하세요.',
      emptyUnmT: '미확인 내역이 없습니다', emptyUnmS: '모든 거래에 계정과목과 증빙이 붙었습니다.',
      emptyJournalT: '분개할 거래가 없습니다', emptyJournalS: '통장·증빙을 올리면 자동으로 만들어집니다.',
      emptyEmpT: '등록된 직원이 없습니다', emptyEmpS: '"＋ 직원 추가"를 누르거나 샘플 데이터를 불러오세요.',
      emptyPayT: '직원을 추가하면 4대보험이 계산됩니다', emptyPayS: '4대보험·소득세·실수령액이 자동으로 채워집니다.',
      emptyWhT: '직원을 등록하면 신고용 요약표가 만들어집니다', emptyWhS: '매월 신고에 그대로 옮겨 적을 수 있습니다.',
      emptyFxT: '수출 건이 없습니다', emptyFxS: '선적일·환율·입금일을 넣으면 외환차손익이 계산됩니다.',
      emptyFxBalT: '외화 잔액이 없습니다', emptyFxBalS: '12월 31일 기준 외화예금·미회수 채권·미지급 채무를 넣으세요.',
      emptyExpsT: '수출 건을 추가하면 명세서가 만들어집니다', emptyExpsS: '영세율 신고에 그대로 씁니다.',
      emptyApT: '증빙이 없어 외상 잔액을 계산할 수 없습니다', emptyApS: '② 증빙·통장에서 증빙을 올려 주세요.',
      emptyInvT: '기말 재고 품목이 없습니다', emptyInvS: '"＋ 품목 추가"로 수량과 단가를 넣으세요.',
      roleCeo: '대표자', roleEmployee: '직원', roleEmployeeShort: '직원',
      payCols: ['국민연금', '건강보험', '장기요양', '고용보험', '소득세', '지방소득세'],
      whKinds: ['근로소득'],
      total: '합계', payFoot: '합계', whFoot: '합계',
      fxCols: { doc: '신고번호', date: '선적일', cur: '통화', amount: '외화금액', ship: '선적일 환율', payDate: '입금일', pay: '입금 환율', gain: '외환차손익' },
      fxKinds: ['외화예금', '미회수 채권', '미지급 채무'],
      fxBalCols: { kind: '구분', cur: '통화', amount: '외화금액', book: '장부 환율', close: '12.31 환율', bookAmt: '장부가액', closeAmt: '평가액', gain: '외화환산손익' },
      fxFoot: '합계', fxBalFoot: '외화환산손익 합계', expsFoot: '원화환산 합계', krwSum: '원화환산',
      journalDr: '차) ', journalCr: ' / 대) ', dr: '차변', cr: '대변',
      bs: { assets: '자산 합계', liabilities: '부채 합계', equity: '자본 합계', cash: '현금및예금', ar: '외상매출금', inventory: '재고자산', vatAsset: '부가세대급금', ownerLoan: '대표자 가지급금', ap: '외상매입입금', ownerDeposit: '대표자 가수금', vatLiab: '부가세예수금', taxPayable: '미지급법인세등', capital: '자본금', retained: '이익잉여금' },
      isLines: { revenue: '매출액', cogs: '매출원가', gross: '매출총이익', payroll: '급여', sga: '판관비', operating: '영업이익', nonOpIn: '영업외수익', nonOpOut: '영업외비용', pretax: '법인세차감전순이익', incomeTax: '법인세등', net: '당기순이익' },
      riskOwner: '대표자 가지급금 · 인정이자', riskEvidence: '증빙불비가산세 (3만 원 초과)', riskDue: '다음 신고 기한', riskReceipt: '증빙 없는 입금',
      riskOwnerOk: '대표자 가지급금이 없습니다. 개인용도 출금은 가수금과 상계해 두세요.',
      riskEvidenceOk: '3만 원 초과 지출에 모두 적격증빙이 붙었습니다.',
      riskReceiptOk: '모든 입금이 매출 또는 계정과목과 연결되어 있습니다.',
      msgSample: '샘플 데이터를 불러왔습니다. ①대시보드부터 ⑥내보내기까지 눌러 보세요.',
      msgReset: '초기화했습니다. 빈 장부로 시작합니다.',
      msgSaved: '브라우저에 자동 저장됨',
      msgNoStore: '저장 공간을 쓸 수 없습니다 (시크릿 모드?)',
      msgMatch: '금액·날짜로 매칭했습니다.', msgSuggest: '계정과목을 적요 키워드로 채웠습니다.',
      msgExported: '내려받기를 시작했습니다.', msgBackup: '백업 파일을 내려받았습니다.',
      msgRestored: '백업을 불러왔습니다.', msgRestoreFail: '백업 파일을 읽지 못했습니다.',
      confirmSample: '지금 입력한 자료를 샘플 데이터로 바꿉니다. 계속할까요?',
      confirmReset: '저장된 통장·증빙·급여·결산 자료를 모두 지웁니다. 되돌릴 수 없습니다.',
      printVat: '부가가치세 신고 집계표', printWh: '원천징수이행상황신고서 요약표',
      printClose: '결산 요약표', printVoucher: '전표 묶음 (분개장)',
      printNote1: '이 표는 홈택스 신고서에 직접 입력할 때 참고하는 집계표입니다. 신고서 제출 기능은 없습니다.',
      printNote2: '4대보험료는 원천징수 신고서에 포함되지 않습니다(별도 납부).',
      printNote3: '세무조정·이월결손금·감면은 반영하지 않았습니다.',
      sign: '작성자', signWh: '신고인',
      csv: { date: '거래일', desc: '적요', in: '입금', out: '출금', acct: '계정과목', match: '증빙매칭', journal: '분개' }
    },

    en: {
      entityCorp: 'C-Corp / S-Corp', entitySole: 'LLC / Sole proprietor',
      noteCorp: 'Entity · flat 21% federal corporate rate', noteSole: 'Pass-through · individual 10–37% brackets',
      kpiVat: 'Sales tax due (collected)', kpiVatSub: 'Tax collected − input credit − exempt sales',
      kpiMonth: 'Operating profit this month', kpiMonthSub: 'Revenue − expenses this month',
      kpiYear: 'Operating profit (year)', kpiYearSub: 'Year to date',
      kpiTaxCorp: 'Est. federal income tax', kpiTaxSole: 'Est. federal income tax', kpiTaxSub: 'Estimated · before credits',
      vatRefund: ' (credit)', vatPay: 'due', vatRefundShort: 'credit',
      rows: {
        taxableSales: ['Taxable sales (net)', 'Invoices + receipts without documentation'],
        zeroSales: ['Exempt / export sales', 'Zero-rated export total'],
        salesTax: ['Sales tax collected', 'Taxable sales × rate'],
        purchaseSupply: ['Purchases (net)', 'Invoices, cards, receipts'],
        purchaseTax: ['Sales tax paid on purchases', 'Recoverable only where allowed'],
        zeroCredit: ['Input credit', 'Tax on zero-rated purchases'],
        vatDue: ['Sales tax payable', 'Collected − credit'],
        opProfit: ['Operating profit (year)', 'Revenue − COGS − operating expenses'],
        nonOp: ['Non-operating result', 'FX, revaluation, interest'],
        pretax: ['Income before tax', 'Operating + non-operating'],
        taxBase: ['Estimated taxable income', 'Before book-tax adjustments'],
        localTax: ['State income tax', 'Estimate only — varies by state']
      },
      chipExcluded: 'Excluded', chipUndecided: 'Unassigned', chipMatched: 'matched', chipNoEvidence: 'none',
      chipNoDesc: 'No memo', chipZero: 'Exempt',
      qSales: 'Sales receipt', qPurchase: 'Purchase payment', qWelfare: 'Employee benefit', qEntertain: 'Meals & entertainment',
      qOwner: "Owner's draw / loan", qExclude: 'Exclude',
      qNoAcct: 'No account', qNoDesc: 'No memo', qNoMatch: 'No document', qSuggest: 'suggested',
      emptyBankT: 'No bank transactions yet', emptyBankS: 'Upload a CSV above or load the sample data.',
      emptyEvT: 'No documents yet', emptyEvS: 'Upload an IRS/portal CSV export or add one manually.',
      emptyUnmT: 'Everything is classified', emptyUnmS: 'Every transaction has an account and a document.',
      emptyJournalT: 'No journal entries yet', emptyJournalS: 'Entries appear as you add bank lines and documents.',
      emptyEmpT: 'No employees yet', emptyEmpS: 'Press "＋ Add employee" or load the sample data.',
      emptyPayT: 'Add an employee to run payroll', emptyPayS: 'FICA, withholding and net pay are calculated automatically.',
      emptyWhT: 'Payroll summary appears here', emptyWhS: 'Copy the figures into Form 941 or your payroll report.',
      emptyFxT: 'No export invoices yet', emptyFxS: 'Add ship date, rate and payment date to get the FX gain or loss.',
      emptyFxBalT: 'No foreign currency balances', emptyFxBalS: 'Add cash, receivables and payables at the year-end rate.',
      emptyExpsT: 'Export statement is built from your invoices', emptyExpsS: 'Use it with the zero-rated VAT return.',
      emptyApT: 'No documents, so AR/AP cannot be computed', emptyApS: 'Upload documents in section 02.',
      emptyInvT: 'No ending inventory items', emptyInvS: 'Press "＋ Add item" and enter quantity and unit cost.',
      roleCeo: 'Owner', roleEmployee: 'Employee', roleEmployeeShort: 'Employee',
      payCols: ['Social Security', 'Medicare', 'Addl. Medicare', 'State disability', 'Federal tax', 'State tax'],
      whKinds: ['Wages'],
      total: 'Total', payFoot: 'Total', whFoot: 'Total',
      fxCols: { doc: 'Invoice No.', date: 'Ship date', cur: 'Ccy', amount: 'Foreign amt', ship: 'Book rate', payDate: 'Paid date', pay: 'Payment rate', gain: 'FX gain/loss' },
      fxKinds: ['Foreign bank', 'Receivable', 'Payable'],
      fxBalCols: { kind: 'Type', cur: 'Ccy', amount: 'Foreign amt', book: 'Book rate', close: 'Year-end rate', bookAmt: 'Book value', closeAmt: 'Revalued', gain: 'FX revaluation' },
      fxFoot: 'Total', fxBalFoot: 'Total revaluation', expsFoot: 'Total in USD', krwSum: 'USD value',
      journalDr: 'Dr) ', journalCr: ' / Cr) ', dr: 'Debit', cr: 'Credit',
      bs: { assets: 'Total assets', liabilities: 'Total liabilities', equity: 'Total equity', cash: 'Cash & bank', ar: 'Accounts receivable', inventory: 'Inventory', vatAsset: 'Sales tax recoverable', ownerLoan: "Owner's draw", ap: 'Accounts payable', ownerDeposit: "Shareholder loan", vatLiab: 'Sales tax payable', taxPayable: 'Income tax payable', capital: 'Paid-in capital', retained: 'Retained earnings' },
      isLines: { revenue: 'Revenue', cogs: 'Cost of goods sold', gross: 'Gross profit', payroll: 'Payroll', sga: 'Operating expenses', operating: 'Operating income', nonOpIn: 'Other income', nonOpOut: 'Other expense', pretax: 'Income before tax', incomeTax: 'Income tax', net: 'Net income' },
      riskOwner: "Owner's draw & imputed interest", riskEvidence: 'Missing documentation (over $75)', riskDue: 'Next filing deadline', riskReceipt: 'Deposits without an invoice',
      riskOwnerOk: 'No owner draws recorded. Clear personal charges against the loan account.',
      riskEvidenceOk: 'Every expense over $75 has a receipt or invoice.',
      riskReceiptOk: 'Every deposit is linked to revenue or an account.',
      msgSample: 'Sample data loaded. Try modules 01 to 06.',
      msgReset: 'Cleared. Starting with an empty ledger.',
      msgSaved: 'Saved in this browser', msgNoStore: 'Storage unavailable (private mode?)',
      msgMatch: 'Matched by amount and date.', msgSuggest: 'Accounts filled from keyword rules.',
      msgExported: 'download started.', msgBackup: 'Backup file downloaded.',
      msgRestored: 'Backup restored.', msgRestoreFail: 'Could not read that backup file.',
      confirmSample: 'Replace the data you entered with the sample set?',
      confirmReset: 'Delete all saved bank, document, payroll and closing data? This cannot be undone.',
      printVat: 'Sales tax summary', printWh: 'Payroll withholding summary',
      printClose: 'Year-end closing summary', printVoucher: 'Journal voucher batch',
      printNote1: 'Reference summary for filing. This tool does not file anything.',
      printNote2: 'Employer payroll taxes are paid separately and are not in the withholding total.',
      printNote3: 'Book-tax adjustments, credits and carryforwards are not reflected.',
      sign: 'Prepared by', signWh: 'Filed by',
      csv: { date: 'Date', desc: 'Memo', in: 'In', out: 'Out', acct: 'Account', match: 'Document', journal: 'Journal' }
    },

    zh: {
      entityCorp: '公司（一般纳税人）', entitySole: '个体户 / 个人独资',
      noteCorp: '公司 · 企业所得税 5%（小微）/25%', noteSole: '个体户 · 经营所得 5~35%',
      kpiVat: '本期应纳增值税', kpiVatSub: '销项税额 − 进项税额 − 免税销售',
      kpiMonth: '本月营业利润', kpiMonthSub: '本月收入 − 成本费用',
      kpiYear: '年度营业利润', kpiYearSub: '本年累计',
      kpiTaxCorp: '预计企业所得税', kpiTaxSole: '预计经营所得个税', kpiTaxSub: '简易估算 · 未含优惠',
      vatRefund: '（留抵/退税）', vatPay: '应纳税额', vatRefundShort: '留抵',
      rows: {
        taxableSales: ['应税销售额', '发票销售 + 无票收款'],
        zeroSales: ['免税/出口销售额', '出口报关折算合计'],
        salesTax: ['销项税额', '销售额 × 税率'],
        purchaseSupply: ['采购金额', '发票、卡、收据'],
        purchaseTax: ['进项税额', '可抵扣的进项'],
        zeroCredit: ['出口退税（免税）', '零税率对应进项'],
        vatDue: ['应纳（留抵）增值税', '销项 − 进项'],
        opProfit: ['营业利润（年度）', '收入 − 成本 − 费用'],
        nonOp: ['营业外收支', '汇兑、评估、利息'],
        pretax: ['利润总额', '营业利润 + 营业外收支'],
        taxBase: ['应纳税所得额（估）', '未做纳税调整'],
        localTax: ['附加税费', '城建税及教育费附加（估）']
      },
      chipExcluded: '已排除', chipUndecided: '未分类', chipMatched: '已匹配', chipNoEvidence: '无',
      chipNoDesc: '无摘要', chipZero: '免税',
      qSales: '销售收款', qPurchase: '采购付款', qWelfare: '职工福利', qEntertain: '业务招待',
      qOwner: '股东往来', qExclude: '排除',
      qNoAcct: '未设科目', qNoDesc: '无摘要', qNoMatch: '无票据', qSuggest: '推荐',
      emptyBankT: '暂无银行流水', emptyBankS: '上传上方 CSV，或点击“载入示例数据”。',
      emptyEvT: '暂无票据', emptyEvS: '上传电子发票/开票系统导出的 CSV，或手工添加。',
      emptyUnmT: '没有待处理项目', emptyUnmS: '所有流水都已匹配科目与票据。',
      emptyJournalT: '暂无分录', emptyJournalS: '上传银行流水与票据后自动生成。',
      emptyEmpT: '尚未添加员工', emptyEmpS: '点击“＋ 添加员工”或载入示例数据。',
      emptyPayT: '添加员工后自动计算五险一金', emptyPayS: '五险一金、个税与实发工资自动填列。',
      emptyWhT: '添加员工后生成申报汇总', emptyWhS: '可直接抄入个税申报表。',
      emptyFxT: '暂无出口单据', emptyFxS: '填写报关日、汇率与收汇日即可计算汇兑损益。',
      emptyFxBalT: '暂无外币余额', emptyFxBalS: '填写年末外币存款、应收与应付。',
      emptyExpsT: '添加出口单据后生成明细表', emptyExpsS: '用于出口退税申报。',
      emptyApT: '没有票据，无法计算往来余额', emptyApS: '请在 02 上传票据。',
      emptyInvT: '暂无期末存货', emptyInvS: '点击“＋ 添加品目”填写数量与单价。',
      roleCeo: '负责人', roleEmployee: '员工', roleEmployeeShort: '员工',
      payCols: ['养老保险', '医疗保险', '失业保险', '住房公积金', '个人所得税', '附加税费'],
      whKinds: ['工资薪金'],
      total: '合计', payFoot: '合计', whFoot: '合计',
      fxCols: { doc: '报关单号', date: '出口日期', cur: '币种', amount: '外币金额', ship: '报关汇率', payDate: '收汇日', pay: '收汇汇率', gain: '汇兑损益' },
      fxKinds: ['外币存款', '应收外汇', '应付外汇'],
      fxBalCols: { kind: '类别', cur: '币种', amount: '外币金额', book: '账面汇率', close: '年末汇率', bookAmt: '账面金额', closeAmt: '评估金额', gain: '汇兑损益' },
      fxFoot: '合计', fxBalFoot: '汇兑损益合计', expsFoot: '折合人民币合计', krwSum: '折合人民币',
      journalDr: '借) ', journalCr: ' / 贷) ', dr: '借方', cr: '贷方',
      bs: { assets: '资产合计', liabilities: '负债合计', equity: '所有者权益合计', cash: '银行存款', ar: '应收账款', inventory: '存货', vatAsset: '应交税费—进项', ownerLoan: '其他应收款—股东', ap: '应付账款', ownerDeposit: '其他应付款—股东', vatLiab: '应交税费—销项', taxPayable: '应交所得税', capital: '实收资本', retained: '未分配利润' },
      isLines: { revenue: '营业收入', cogs: '营业成本', gross: '毛利', payroll: '工资薪金', sga: '期间费用', operating: '营业利润', nonOpIn: '营业外收入', nonOpOut: '营业外支出', pretax: '利润总额', incomeTax: '所得税费用', net: '净利润' },
      riskOwner: '股东借款 · 视同分红风险', riskEvidence: '票据不合规（500元以上）', riskDue: '下一个申报期限', riskReceipt: '无票收款',
      riskOwnerOk: '没有股东借款余额。个人支出应与往来款对冲。',
      riskEvidenceOk: '500元以上支出均有合规票据。',
      riskReceiptOk: '所有收款都已对应收入或科目。',
      msgSample: '示例数据已载入，可从 01 到 06 逐个试。',
      msgReset: '已清空，从空账开始。',
      msgSaved: '已保存在本浏览器', msgNoStore: '无法使用本地存储（隐私模式？）',
      msgMatch: '已按金额与日期匹配。', msgSuggest: '已按摘要关键词填好科目。',
      msgExported: '开始下载。', msgBackup: '备份文件已下载。',
      msgRestored: '备份已恢复。', msgRestoreFail: '无法读取该备份文件。',
      confirmSample: '要用示例数据替换当前录入的资料吗？',
      confirmReset: '将删除全部银行、票据、工资与决算资料，无法恢复。',
      printVat: '增值税申报汇总表', printWh: '个人所得税扣缴汇总表',
      printClose: '年度决算汇总表', printVoucher: '记账凭证汇总',
      printNote1: '本表为申报录入的参考汇总，不能代替申报。',
      printNote2: '五险一金不在个税扣缴表内，需另行缴纳。',
      printNote3: '未考虑纳税调整、亏损弥补与税收优惠。',
      sign: '制表人', signWh: '申报人',
      csv: { date: '日期', desc: '摘要', in: '收入', out: '支出', acct: '会计科目', match: '票据', journal: '分录' }
    },

    ja: {
      entityCorp: '法人（中小法人）', entitySole: '個人事業主（青色申告）',
      noteCorp: '法人 · 法人税 15%（800万円以下）/23.2%', noteSole: '個人 · 所得税 5~45%',
      kpiVat: '消費税の納付(還付)見込', kpiVatSub: '売上税額 − 仕入税額 − 免税売上',
      kpiMonth: '今月の営業利益', kpiMonthSub: '今月の収入 − 費用',
      kpiYear: '年間の営業利益', kpiYearSub: '年間累計',
      kpiTaxCorp: '法人税の見込', kpiTaxSole: '所得税の見込', kpiTaxSub: '簡易計算 · 住民税別',
      vatRefund: '（還付）', vatPay: '納付', vatRefundShort: '還付',
      rows: {
        taxableSales: ['課税売上高', '請求書売上＋証憑なし入金'],
        zeroSales: ['輸出免税売上', '輸出実績の円換算'],
        salesTax: ['売上税額', '課税売上 × 税率'],
        purchaseSupply: ['課税仕入高', '請求書・カード・領収書'],
        purchaseTax: ['仕入税額', '適格請求書のある仕入のみ'],
        zeroCredit: ['輸出免税の控除', '免税対応として指定した仕入税額'],
        vatDue: ['納付(還付)見込税額', '売上税額 − 仕入税額'],
        opProfit: ['営業利益（年間）', '売上 − 売上原価 − 販管費'],
        nonOp: ['営業外損益', '為替・評価・利息'],
        pretax: ['税引前当期利益', '営業利益 + 営業外損益'],
        taxBase: ['課税所得（概算）', '税務調整前'],
        localTax: ['住民税', '法人税割の概算']
      },
      chipExcluded: '対象外', chipUndecided: '未設定', chipMatched: '一致', chipNoEvidence: 'なし',
      chipNoDesc: '摘要なし', chipZero: '免税',
      qSales: '売上入金', qPurchase: '仕入支払', qWelfare: '福利厚生費', qEntertain: '接待交際費',
      qOwner: '代表者貸付・借入', qExclude: '対象外',
      qNoAcct: '科目未設定', qNoDesc: '摘要なし', qNoMatch: '証憑なし', qSuggest: '推奨',
      emptyBankT: '通帳データがありません', emptyBankS: '上のCSVをアップロードするか、サンプルを読み込んでください。',
      emptyEvT: '証憑がありません', emptyEvS: '請求書・カード明細のCSVをアップロードするか手入力してください。',
      emptyUnmT: '未処理はありません', emptyUnmS: 'すべての取引に科目と証憑が付いています。',
      emptyJournalT: '仕訳がありません', emptyJournalS: '通帳・証憑を入れると自動で作られます。',
      emptyEmpT: '従業員が未登録です', emptyEmpS: '「＋ 従業員追加」かサンプルデータを読み込んでください。',
      emptyPayT: '従業員を追加すると給与計算します', emptyPayS: '社会保険・所得税・手取りを自動計算します。',
      emptyWhT: '従業員を登録すると源泉徴収表ができます', emptyWhS: '毎月の納付書にそのまま転記できます。',
      emptyFxT: '輸出の案件がありません', emptyFxS: '船積日・レート・入金日を入れると為替差損益を計算します。',
      emptyFxBalT: '外貨残高がありません', emptyFxBalS: '12月31日時点の外貨預金・未回収債権・未払債務を入れてください。',
      emptyExpsT: '輸出案件を追加すると明細ができます', emptyExpsS: '免税売上の申告に使えます。',
      emptyApT: '証憑がないため売掛・買掛を計算できません', emptyApS: '02 で証憑をアップロードしてください。',
      emptyInvT: '期末棚卸がありません', emptyInvS: '「＋ 品目追加」で数量と単価を入れてください。',
      roleCeo: '代表者', roleEmployee: '従業員', roleEmployeeShort: '従業員',
      payCols: ['厚生年金', '健康保険', '介護保険', '雇用保険', '所得税', '住民税'],
      whKinds: ['給与'],
      total: '合計', payFoot: '合計', whFoot: '合計',
      fxCols: { doc: '輸出番号', date: '船積日', cur: '通貨', amount: '外貨金額', ship: '計上レート', payDate: '入金日', pay: '入金レート', gain: '為替差損益' },
      fxKinds: ['外貨預金', '未回収債権', '未払債務'],
      fxBalCols: { kind: '区分', cur: '通貨', amount: '外貨金額', book: '帳簿レート', close: '期末レート', bookAmt: '帳簿価額', closeAmt: '評価額', gain: '為替評価損益' },
      fxFoot: '合計', fxBalFoot: '評価損益合計', expsFoot: '円換算合計', krwSum: '円換算',
      journalDr: '借) ', journalCr: ' / 貸) ', dr: '借方', cr: '貸方',
      bs: { assets: '資産合計', liabilities: '負債合計', equity: '純資産合計', cash: '現金預金', ar: '売掛金', inventory: '棚卸資産', vatAsset: '仮払消費税', ownerLoan: '代表者貸付金', ap: '買掛金', ownerDeposit: '代表者借入金', vatLiab: '仮受消費税', taxPayable: '未払法人税等', capital: '資本金', retained: '繰越利益剰余金' },
      isLines: { revenue: '売上高', cogs: '売上原価', gross: '売上総利益', payroll: '給与', sga: '販売費及び一般管理費', operating: '営業利益', nonOpIn: '営業外収益', nonOpOut: '営業外費用', pretax: '税引前当期純利益', incomeTax: '法人税等', net: '当期純利益' },
      riskOwner: '代表者貸付金・認定利息', riskEvidence: '証憑不足（3万円超）', riskDue: '次の申告期限', riskReceipt: '証憑なし入金',
      riskOwnerOk: '代表者貸付金はありません。私的支出は借入金と相殺してください。',
      riskEvidenceOk: '3万円超の支出にはすべて証憑があります。',
      riskReceiptOk: 'すべての入金が売上か科目に対応しています。',
      msgSample: 'サンプルを読み込みました。01〜06 を順に試してください。',
      msgReset: '初期化しました。空の帳簿から始まります。',
      msgSaved: 'このブラウザに自動保存', msgNoStore: '保存領域が使えません（プライベートモード？）',
      msgMatch: '金額と日付で照合しました。', msgSuggest: '摘要のキーワードで科目を埋めました。',
      msgExported: 'ダウンロードを開始しました。', msgBackup: 'バックアップを保存しました。',
      msgRestored: 'バックアップを復元しました。', msgRestoreFail: 'バックアップを読めませんでした。',
      confirmSample: '入力中のデータをサンプルに置き換えます。よろしいですか？',
      confirmReset: '保存した通帳・証憑・給与・決算データをすべて削除します。元に戻せません。',
      printVat: '消費税申告集計表', printWh: '源泉徴収簿 集計表',
      printClose: '決算要約表', printVoucher: '仕訳伝票',
      printNote1: '申告書に転記するための参考集計です。申告そのものは行いません。',
      printNote2: '社会保険料は源泉徴収に含まれません（別納）。',
      printNote3: '税務調整・繰越欠損金・税額控除は反映していません。',
      sign: '作成者', signWh: '申告者',
      csv: { date: '日付', desc: '摘要', in: '入金', out: '出金', acct: '勘定科目', match: '証憑', journal: '仕訳' }
    }
  };

  /* 오타 보정: 위 객체의 잘못된 키(bs.ap)를 바로잡습니다. */
  L.ko.bs.ap = '외상매입금';

  var S = L[LOCALE] || L.ko;

  /* ---------------------------------------------------------- 통화 */
  function moneyKR(n) { var v = r0(n); return (v < 0 ? '-' : '') + nf(Math.abs(v)) + '원'; }
  function shortKR(n) {
    var v = Math.abs(r0(n));
    if (v >= 100000000) return (n < 0 ? '-' : '') + (v / 100000000).toFixed(v >= 1000000000 ? 1 : 2) + '억원';
    if (v >= 10000) return (n < 0 ? '-' : '') + nf(Math.round(v / 10000)) + '만원';
    return moneyKR(n);
  }
  function moneyUS(n) { return (n < 0 ? '-' : '') + '$' + nf(Math.abs(num(n)), 2); }
  function shortUS(n) {
    var v = Math.abs(num(n));
    if (v >= 1e9) return (n < 0 ? '-' : '') + '$' + (v / 1e9).toFixed(2) + 'B';
    if (v >= 1e6) return (n < 0 ? '-' : '') + '$' + (v / 1e6).toFixed(2) + 'M';
    if (v >= 1e3) return (n < 0 ? '-' : '') + '$' + (v / 1e3).toFixed(1) + 'K';
    return moneyUS(n);
  }
  function moneyCN(n) { return (n < 0 ? '-' : '') + '¥' + nf(Math.abs(num(n)), 2); }
  function shortCN(n) {
    var v = Math.abs(num(n));
    if (v >= 1e8) return (n < 0 ? '-' : '') + '¥' + (v / 1e8).toFixed(2) + '亿';
    if (v >= 1e4) return (n < 0 ? '-' : '') + '¥' + (v / 1e4).toFixed(1) + '万';
    return moneyCN(n);
  }
  function moneyJP(n) { return (n < 0 ? '-' : '') + '¥' + nf(Math.abs(r0(n))); }
  function shortJP(n) {
    var v = Math.abs(r0(n));
    if (v >= 1e8) return (n < 0 ? '-' : '') + '¥' + (v / 1e8).toFixed(2) + '億';
    if (v >= 1e4) return (n < 0 ? '-' : '') + '¥' + nf(Math.round(v / 1e4)) + '万';
    return moneyJP(n);
  }

  /* ---------------------------------------------------------- 계정과목 */
  function accs(list) {
    return list.map(function (a) { return { name: a[0], kind: a[1] }; });
  }
  var ACCOUNTS_KO = accs([
    ['보통예금', 'asset'], ['외상매출금', 'asset'], ['재고자산', 'asset'], ['부가세대급금', 'asset'], ['대표자 가지급금', 'asset'],
    ['외상매입금', 'liab'], ['대표자 가수금', 'liab'], ['부가세예수금', 'liab'],
    ['매출', 'rev'], ['수출(영세율)', 'rev'],
    ['매입(원재료)', 'exp'], ['급여', 'exp'], ['복리후생비', 'exp'], ['접대비', 'exp'], ['차량유지비', 'exp'],
    ['운반비', 'exp'], ['임차료', 'exp'], ['통신비', 'exp'], ['수도광열비', 'exp'], ['광고선전비', 'exp'],
    ['보험료', 'exp'], ['세금과공과', 'exp'], ['이자비용', 'exp'], ['소모품비', 'exp'], ['여비교통비', 'exp'],
    ['지급수수료', 'exp'], ['수입부대비용', 'exp'],
    ['이자수익', 'inc'], ['잡이익', 'inc'], ['제외(분개 안 함)', 'etc']
  ]);
  var ACCOUNTS_EN = accs([
    ['Cash', 'asset'], ['Accounts receivable', 'asset'], ['Inventory', 'asset'], ['Sales tax recoverable', 'asset'], ["Owner's draw", 'asset'],
    ['Accounts payable', 'liab'], ['Shareholder loan', 'liab'], ['Sales tax payable', 'liab'],
    ['Sales revenue', 'rev'], ['Export sales (zero-rated)', 'rev'],
    ['Purchases (materials)', 'exp'], ['Payroll', 'exp'], ['Employee benefits', 'exp'], ['Meals & entertainment', 'exp'], ['Vehicle expense', 'exp'],
    ['Freight & delivery', 'exp'], ['Rent', 'exp'], ['Telephone & internet', 'exp'], ['Utilities', 'exp'], ['Advertising', 'exp'],
    ['Insurance', 'exp'], ['Taxes & licenses', 'exp'], ['Interest expense', 'exp'], ['Office supplies', 'exp'], ['Travel', 'exp'],
    ['Professional fees', 'exp'], ['Import & customs', 'exp'],
    ['Interest income', 'inc'], ['Other income', 'inc'], ['Excluded', 'etc']
  ]);
  var ACCOUNTS_ZH = accs([
    ['银行存款', 'asset'], ['应收账款', 'asset'], ['存货', 'asset'], ['应交税费—进项', 'asset'], ['其他应收款—股东', 'asset'],
    ['应付账款', 'liab'], ['其他应付款—股东', 'liab'], ['应交税费—销项', 'liab'],
    ['主营业务收入', 'rev'], ['出口销售（免税）', 'rev'],
    ['原材料采购', 'exp'], ['工资薪金', 'exp'], ['职工福利费', 'exp'], ['业务招待费', 'exp'], ['车辆使用费', 'exp'],
    ['运输费', 'exp'], ['房租', 'exp'], ['通讯费', 'exp'], ['水电费', 'exp'], ['广告宣传费', 'exp'],
    ['保险费', 'exp'], ['税金及附加', 'exp'], ['利息支出', 'exp'], ['办公费', 'exp'], ['差旅费', 'exp'],
    ['手续费', 'exp'], ['进口费用', 'exp'],
    ['利息收入', 'inc'], ['营业外收入', 'inc'], ['不计入', 'etc']
  ]);
  var ACCOUNTS_JA = accs([
    ['普通預金', 'asset'], ['売掛金', 'asset'], ['棚卸資産', 'asset'], ['仮払消費税', 'asset'], ['代表者貸付金', 'asset'],
    ['買掛金', 'liab'], ['代表者借入金', 'liab'], ['仮受消費税', 'liab'],
    ['売上高', 'rev'], ['輸出売上（免税）', 'rev'],
    ['仕入高', 'exp'], ['給与', 'exp'], ['福利厚生費', 'exp'], ['接待交際費', 'exp'], ['車両費', 'exp'],
    ['運賃', 'exp'], ['地代家賃', 'exp'], ['通信費', 'exp'], ['水道光熱費', 'exp'], ['広告宣伝費', 'exp'],
    ['保険料', 'exp'], ['租税公課', 'exp'], ['支払利息', 'exp'], ['消耗品費', 'exp'], ['旅費交通費', 'exp'],
    ['支払手数料', 'exp'], ['輸入諸費用', 'exp'],
    ['受取利息', 'inc'], ['雑収入', 'inc'], ['対象外', 'etc']
  ]);

  /* ---------------------------------------------------------- 계산 프로필 */
  var PROFILES = {};
  function money(p) { return p === 'en' ? moneyUS : p === 'zh' ? moneyCN : p === 'ja' ? moneyJP : moneyKR; }
  function shortM(p) { return p === 'en' ? shortUS : p === 'zh' ? shortCN : p === 'ja' ? shortJP : shortKR; }

  /* 한국 */
  PROFILES.ko = (function () {
    var ACC = {
      sales: '매출', zero: '수출(영세율)', purchase: '매입(원재료)', ar: '외상매출금', ap: '외상매입금',
      ownerLoan: '대표자 가지급금', ownerDeposit: '대표자 가수금', payroll: '급여',
      vatPayable: '부가세예수금', vatPaid: '부가세대급금', excluded: '제외(분개 안 함)', cash: '보통예금'
    };
    return {
      id: 'ko', money: moneyKR, short: shortKR, cur: 'KRW', decimals: 0,
      acc: ACC, accounts: ACCOUNTS_KO,
      taxName: '부가가치세', taxRate: 0.10, taxEditable: false, inputCredit: true, zeroRated: true,
      incomeNameCorp: '법인세', incomeNameSole: '종합소득세',
      incomeTax: function (profit, entity) {
        var b = Math.max(0, num(profit));
        var t;
        if (entity === 'sole') {
          var br = [[14000000, .06, 0], [50000000, .15, 1260000], [88000000, .24, 5760000], [150000000, .35, 15440000],
            [300000000, .38, 19940000], [500000000, .40, 25940000], [1000000000, .42, 35940000], [Infinity, .45, 65940000]];
          t = 0;
          for (var i = 0; i < br.length; i++) if (b <= br[i][0]) { t = b * br[i][1] - br[i][2]; break; }
        } else {
          if (b <= 200000000) t = b * .09;
          else if (b <= 20000000000) t = 18000000 + (b - 200000000) * .19;
          else if (b <= 300000000000) t = 18000000 + 19800000000 * .19 + (b - 20000000000) * .21;
          else t = 18000000 + 19800000000 * .19 + 280000000000 * .21 + (b - 300000000000) * .24;
        }
        t = Math.max(0, t);
        return { tax: r10(t), local: r10(t * .1), total: r10(t * 1.1) };
      },
      taxfree: [200000, 200000],
      payCols: S.payCols,
      payroll: function (emp, p) {
        var base = Math.max(0, num(emp.base)), allow = Math.max(0, num(emp.allow));
        var nt1 = Math.min(Math.max(0, num(emp.meal)), 200000), nt2 = Math.min(Math.max(0, num(emp.car)), 200000);
        var gross = base + allow + nt1 + nt2, taxable = base + allow;
        var penBase = clamp(taxable, 410000, 6590000);
        var pension = r10(penBase * .045), health = r10(taxable * .03545), ltc = r10(health * .1295), empIns = r10(taxable * .009);
        var tax = incomeTaxTable(taxable, emp.family), local = r10(tax * .1);
        var stab = stabilityRate();
        var inj = injuryRate();
        var company = r10(penBase * .045) + health + ltc + r10(taxable * (.009 + stab)) + r10(taxable * inj);
        var ded = [pension, health, ltc, empIns, tax, local];
        var dsum = ded.reduce(function (a, b2) { return a + b2; }, 0);
        return { gross: gross, taxable: taxable, ded: ded, tax: tax, local: local, net: gross - dsum, company: company };
      },
      sample: sampleKO
    };
  })();

  /* 미국 */
  PROFILES.en = (function () {
    var ACC = {
      sales: 'Sales revenue', zero: 'Export sales (zero-rated)', purchase: 'Purchases (materials)', ar: 'Accounts receivable', ap: 'Accounts payable',
      ownerLoan: "Owner's draw", ownerDeposit: 'Shareholder loan', payroll: 'Payroll',
      vatPayable: 'Sales tax payable', vatPaid: 'Sales tax recoverable', excluded: 'Excluded', cash: 'Cash'
    };
    var BR = [[11925, .10, 0], [48475, .12, 1192.5], [103350, .22, 5443.5], [197300, .24, 17168.5],
      [250525, .32, 32947], [626350, .35, 77527], [Infinity, .37, 183647.25]];
    function bracket(b) {
      for (var i = 0; i < BR.length; i++) if (b <= BR[i][0]) return Math.max(0, b * BR[i][1] - BR[i][2]);
      return 0;
    }
    return {
      id: 'en', money: moneyUS, short: shortUS, cur: 'USD', decimals: 2,
      acc: ACC, accounts: ACCOUNTS_EN,
      taxName: 'Sales tax', taxRate: 0.0725, taxEditable: true, inputCredit: false, zeroRated: false,
      incomeNameCorp: 'Federal corporate income tax', incomeNameSole: 'Federal income tax',
      incomeTax: function (profit, entity) {
        var b = Math.max(0, num(profit)), t;
        if (entity === 'sole') t = bracket(Math.max(0, b - 15000));
        else t = b * .21;
        t = Math.max(0, t);
        return { tax: Math.round(t), local: 0, total: Math.round(t) };
      },
      taxfree: [0, 0],
      payCols: S.payCols,
      payroll: function (emp) {
        var base = Math.max(0, num(emp.base)), allow = Math.max(0, num(emp.allow));
        var nt1 = Math.max(0, num(emp.meal)), nt2 = Math.max(0, num(emp.car));
        var gross = base + allow + nt1 + nt2;
        var taxable = base + allow; /* Section 125 / per-diem treated as non-taxable here */
        var ss = Math.round(Math.min(taxable, 176100 / 12) * .062);
        var med = Math.round(taxable * .0145);
        var fed = Math.round(estFederal(taxable, emp.family) );
        var state = 0;
        var employerSS = ss, employerMed = med;
        var futa = Math.round(Math.min(taxable, 7000 / 12) * .006);
        var suta = Math.round(Math.min(taxable, 7000 / 12) * .027);
        var ded = [ss, med, 0, 0, fed, state];
        var dsum = ded.reduce(function (a, b) { return a + b; }, 0);
        return { gross: gross, taxable: taxable, ded: ded, tax: fed, local: state, net: gross - dsum, company: employerSS + employerMed + futa + suta };
      },
      sample: sampleEN
    };
    function estFederal(monthlyTaxable, family) {
      var annual = monthlyTaxable * 12;
      var ded = (parseInt(family, 10) || 1) > 1 ? 30000 : 15000;
      return bracket(Math.max(0, annual - ded)) / 12;
    }
  })();

  /* 중국 */
  PROFILES.zh = (function () {
    var ACC = {
      sales: '主营业务收入', zero: '出口销售（免税）', purchase: '原材料采购', ar: '应收账款', ap: '应付账款',
      ownerLoan: '其他应收款—股东', ownerDeposit: '其他应付款—股东', payroll: '工资薪金',
      vatPayable: '应交税费—销项', vatPaid: '应交税费—进项', excluded: '不计入', cash: '银行存款'
    };
    var IIT = [[3000, .03, 0], [12000, .10, 210], [25000, .20, 1410], [35000, .25, 2660], [55000, .30, 4410],
      [80000, .35, 7160], [Infinity, .45, 15160]];
    function iit(monthlyTaxable) {
      var b = Math.max(0, monthlyTaxable - 5000);
      for (var i = 0; i < IIT.length; i++) if (b <= IIT[i][0]) return Math.max(0, b * IIT[i][1] - IIT[i][2]);
      return 0;
    }
    return {
      id: 'zh', money: moneyCN, short: shortCN, cur: 'CNY', decimals: 2,
      acc: ACC, accounts: ACCOUNTS_ZH,
      taxName: '增值税', taxRate: 0.13, taxEditable: true, inputCredit: true, zeroRated: true,
      incomeNameCorp: '企业所得税', incomeNameSole: '经营所得个人所得税',
      incomeTax: function (profit, entity) {
        var b = Math.max(0, num(profit)), t;
        if (entity === 'sole') {
          var br = [[30000, .05, 0], [90000, .10, 1500], [300000, .20, 10500], [500000, .30, 40500], [Infinity, .35, 65500]];
          t = 0;
          for (var i = 0; i < br.length; i++) if (b <= br[i][0]) { t = Math.max(0, b * br[i][1] - br[i][2]); break; }
        } else {
          t = b <= 3000000 ? b * .05 : b * .25;
        }
        t = Math.max(0, t);
        return { tax: Math.round(t), local: 0, total: Math.round(t) };
      },
      taxfree: [0, 0],
      payCols: S.payCols,
      payroll: function (emp) {
        var base = Math.max(0, num(emp.base)), allow = Math.max(0, num(emp.allow));
        var nt1 = Math.max(0, num(emp.meal)), nt2 = Math.max(0, num(emp.car));
        var gross = base + allow + nt1 + nt2;
        var taxable = base + allow;
        var pension = Math.round(taxable * .08), medical = Math.round(taxable * .02) + 3, unemp = Math.round(taxable * .005);
        var fund = Math.round(taxable * .07);
        var tax = Math.round(iit(taxable)), local = 0;
        var company = Math.round(taxable * (.16 + .098 + .005 + .004 + .008 + .07));
        var ded = [pension, medical, unemp, fund, tax, local];
        var dsum = ded.reduce(function (a, b) { return a + b; }, 0);
        return { gross: gross, taxable: taxable, ded: ded, tax: tax, local: local, net: gross - dsum, company: company };
      },
      sample: sampleZH
    };
  })();

  /* 일본 */
  PROFILES.ja = (function () {
    var ACC = {
      sales: '売上高', zero: '輸出売上（免税）', purchase: '仕入高', ar: '売掛金', ap: '買掛金',
      ownerLoan: '代表者貸付金', ownerDeposit: '代表者借入金', payroll: '給与',
      vatPayable: '仮受消費税', vatPaid: '仮払消費税', excluded: '対象外', cash: '普通預金'
    };
    var INC = [[1950000, .05, 0], [3300000, .10, 97500], [6950000, .20, 427500], [9000000, .23, 636000],
      [18000000, .33, 1536000], [40000000, .40, 2796000], [Infinity, .45, 4796000]];
    function incomeTax(b) {
      for (var i = 0; i < INC.length; i++) if (b <= INC[i][0]) return Math.max(0, b * INC[i][1] - INC[i][2]);
      return 0;
    }
    function salaryDeduction(annual) {
      if (annual <= 1625000) return 550000;
      if (annual <= 1800000) return annual * 0.4 - 100000;
      if (annual <= 3600000) return annual * 0.3 + 80000;
      if (annual <= 6600000) return annual * 0.2 + 440000;
      if (annual <= 8500000) return annual * 0.1 + 1100000;
      return 1950000;
    }
    return {
      id: 'ja', money: moneyJP, short: shortJP, cur: 'JPY', decimals: 0,
      acc: ACC, accounts: ACCOUNTS_JA,
      taxName: '消費税', taxRate: 0.10, taxEditable: true, inputCredit: true, zeroRated: true,
      incomeNameCorp: '法人税', incomeNameSole: '所得税',
      incomeTax: function (profit, entity) {
        var b = Math.max(0, num(profit)), t, local;
        if (entity === 'sole') {
          t = incomeTax(Math.max(0, b - 480000));
          local = Math.round(t * .10);
        } else {
          t = b <= 8000000 ? b * .15 : 8000000 * .15 + (b - 8000000) * .232;
          local = Math.round(t * .103);
        }
        t = Math.max(0, t);
        return { tax: r10(t), local: local, total: r10(t) + local };
      },
      taxfree: [150000, 0],
      payCols: S.payCols,
      payroll: function (emp) {
        var base = Math.max(0, num(emp.base)), allow = Math.max(0, num(emp.allow));
        var nt1 = Math.min(Math.max(0, num(emp.meal)), 150000), nt2 = Math.max(0, num(emp.car));
        var gross = base + allow + nt1 + nt2;
        var taxable = base + allow;
        var pension = Math.round(taxable * .0915), health = Math.round(taxable * .0499);
        var care = 0, empIns = Math.round(taxable * .0055);
        var social = pension + health + care + empIns;
        var annualTaxable = Math.max(0, taxable * 12 - salaryDeduction(taxable * 12) - 480000 - social * 12);
        var tax = r10(incomeTax(annualTaxable) / 12);
        var local = r10(tax * .10);
        var company = pension + health + Math.round(taxable * .009) + Math.round(taxable * .003);
        var ded = [pension, health, care, empIns, tax, local];
        var dsum = ded.reduce(function (a, b) { return a + b; }, 0);
        return { gross: gross, taxable: taxable, ded: ded, tax: tax, local: local, net: gross - dsum, company: company };
      },
      sample: sampleJA
    };
  })();

  var P = PROFILES[LOCALE] || PROFILES.ko;

  /* 한국 근로소득 간이세액표 (salary-data.js) */
  var D = window.SL_DATA || {};
  function incomeTaxTable(monthly, family) {
    var rows = D.tax, m = Math.max(0, r0(monthly));
    if (!rows || !rows.length) return r10(Math.max(0, (m * 12 - 1500000) * 0.06) / 12);
    var col = clamp(parseInt(family, 10) || 1, 1, 6) - 1, k = m / 1000;
    if (k < rows[0][0]) return 0;
    if (k >= 9980) {
      var last = rows[rows.length - 1], baseVal = last[col + 1] || 0;
      if (k >= 10000) {
        var extra;
        if (m <= 14000000) extra = (m - 10000000) * 0.98 * 0.35 + 25000;
        else if (m <= 28000000) extra = 1397000 + (m - 14000000) * 0.98 * 0.38;
        else if (m <= 30000000) extra = 6610600 + (m - 28000000) * 0.98 * 0.40;
        else if (m <= 45000000) extra = 7394600 + (m - 30000000) * 0.40;
        else if (m <= 87000000) extra = 13394600 + (m - 45000000) * 0.42;
        else extra = 31034600 + (m - 87000000) * 0.45;
        return r10(baseVal + extra);
      }
      return r10(baseVal);
    }
    var lo = 0, hi = rows.length - 1;
    while (lo < hi) { var mid = (lo + hi + 1) >> 1; if (rows[mid][0] <= k) lo = mid; else hi = mid - 1; }
    var v = rows[lo][col + 1];
    return v == null ? 0 : r10(v);
  }
  function injuryRate() {
    var code = state.emp.injury, list = (D.injury && D.injury.list) || [];
    for (var i = 0; i < list.length; i++) if (list[i].code === code) return list[i].rate + ((D.injury && D.injury.commute) || 0);
    var n = parseFloat(code);
    return isFinite(n) ? n / 100 : 0.0076;
  }
  function stabilityRate() {
    var list = (D.insurance && D.insurance.stability) || [{ rate: 0.0025 }];
    return list[clamp(parseInt(state.emp.size, 10) || 0, 0, list.length - 1)].rate;
  }
  /* ---------------------------------------------------------- 체크리스트 */
  PROFILES.ko.checklist = [
    { tag: 'DAILY', title: '일간·수시', sub: '거래가 생길 때마다', items: [
      ['d1', '통장 입출금 내역 주 1회 내려받기'], ['d2', '카드·현금영수증 매출 확인'],
      ['d3', '3만 원 초과 지출은 적격증빙 받기'], ['d4', '세금계산서 발행일 거래처와 합의'],
      ['d5', '적요 없는 입출금은 당일 메모']],
      foot: '전달 증빙 <b>카드전표·현금영수증·세금계산서</b> / 작성 양식 <b>지출결의서</b>' },
    { tag: 'MONTHLY', title: '월간', sub: '매월 1~10일', items: [
      ['m1', '전월 매출·매입 세금계산서 합계 확인'], ['m2', '급여대장 확정 후 급여 이체'],
      ['m3', '원천세 신고·납부 (매월 10일)'], ['m4', '4대보험료 납부 확인'],
      ['m5', '통장 잔액과 장부 잔액 대사']],
      foot: '전달 증빙 <b>급여대장·원천징수이행상황신고서</b> / 작성 양식 <b>급여대장·원천세 신고서</b>' },
    { tag: 'QUARTERLY', title: '분기·반기', sub: '1·4·7·10월', items: [
      ['q1', '부가세 예정·확정 신고 자료 점검'], ['q2', '세금계산서 합계표 작성'],
      ['q3', '수출실적명세서 정리 (영세율)'], ['q4', '재고 수량 실사·장부 대조'],
      ['q5', '미수금·미지급금 잔액 확인']],
      foot: '전달 증빙 <b>세금계산서 합계표·수출신고필증</b> / 작성 양식 <b>부가세 신고서·수출실적명세서</b>' },
    { tag: 'ANNUAL', title: '연간·년마감', sub: '1~3월 결산', items: [
      ['y1', '12/31 외화 잔액 평가'], ['y2', '기말 재고자산 명세 확정'],
      ['y3', '외상매출·매입 잔액 확인서'], ['y4', '법인세(3/31)·소득세(5/31) 신고'],
      ['y5', '가지급금·가수금 정리'], ['y6', '증빙 누락분 보완']],
      foot: '전달 증빙 <b>재고조사표·잔액확인서·외화평가표</b> / 작성 양식 <b>결산 요약표·법인세 신고서</b>' }
  ];
  PROFILES.en.checklist = [
    { tag: 'WEEKLY', title: 'Weekly / as it happens', sub: 'Keep the books current', items: [
      ['d1', 'Download bank and card activity'], ['d2', 'Match receipts over $75 to expenses'],
      ['d3', 'Send invoices the day work ships'], ['d4', 'Note every transfer without a memo'],
      ['d5', 'Keep sales tax collected separate']],
      foot: 'Keep <b>card receipts, invoices and bank statements</b> / worksheet <b>expense report</b>' },
    { tag: 'MONTHLY', title: 'Monthly', sub: 'By the 15th', items: [
      ['m1', 'Reconcile bank and credit card accounts'], ['m2', 'Run payroll and pay payroll taxes (Form 941 quarterly)'],
      ['m3', 'File state sales tax return'], ['m4', 'Set aside quarterly estimated tax'],
      ['m5', 'Review AR/AP aging']],
      foot: 'Keep <b>payroll register, Form 941 worksheets, sales tax report</b> / file <b>941, state sales tax return</b>' },
    { tag: 'QUARTERLY', title: 'Quarterly', sub: 'Apr 15 · Jun 15 · Sep 15 · Jan 15', items: [
      ['q1', 'Pay estimated federal tax (Form 1040-ES / 1120-W)'], ['q2', 'File Form 941 and state unemployment'],
      ['q3', 'Review profit and owner distributions'], ['q4', 'Check inventory and COGS']],
      foot: 'Keep <b>estimated tax vouchers, 941 copies</b> / file <b>1040-ES, 1120-W</b>' },
    { tag: 'ANNUAL', title: 'Year-end', sub: 'Jan–Apr', items: [
      ['y1', 'Issue 1099-NEC to contractors by Jan 31'], ['y2', 'File W-2 / W-3 and reconcile payroll'],
      ['y3', 'Value ending inventory'], ['y4', 'File Form 1120 (Apr 15) or Schedule C (Apr 15)'],
      ['y5', 'Clear owner draws and shareholder loans'], ['y6', 'Revalue foreign currency balances']],
      foot: 'Keep <b>inventory count, AR/AP confirmations, FX revaluation</b> / file <b>1120 or Schedule C, 1099-NEC, W-2</b>' }
  ];
  PROFILES.zh.checklist = [
    { tag: 'DAILY', title: '日常', sub: '发生即记', items: [
      ['d1', '每周下载银行流水'], ['d2', '取得并归档发票、收据'],
      ['d3', '500元以上支出必须取得合规票据'], ['d4', '开票信息与客户确认'],
      ['d5', '无摘要的收付当天补记']],
      foot: '留存 <b>发票、收据、银行回单</b> / 表单 <b>费用报销单</b>' },
    { tag: 'MONTHLY', title: '每月', sub: '15日前', items: [
      ['m1', '核对上月销项与进项发票'], ['m2', '工资表确认并发放'],
      ['m3', '申报增值税及附加税费'], ['m4', '申报个人所得税（扣缴）'],
      ['m5', '银行余额与账面对账']],
      foot: '留存 <b>工资表、个税扣缴明细、增值税申报表</b> / 申报 <b>增值税、附加税费、个税</b>' },
    { tag: 'QUARTERLY', title: '季度', sub: '1·4·7·10月', items: [
      ['q1', '企业所得税季度预缴'], ['q2', '小微企业优惠条件自查'],
      ['q3', '出口退税单证收集'], ['q4', '存货盘点']],
      foot: '留存 <b>季度预缴申报表、发票汇总</b> / 申报 <b>企业所得税季度预缴</b>' },
    { tag: 'ANNUAL', title: '年度', sub: '次年5月31日前', items: [
      ['y1', '企业所得税汇算清缴'], ['y2', '个人所得税年度汇算'],
      ['y3', '年末外币余额评估'], ['y4', '股东往来款清理'],
      ['y5', '工商年报（6月30日前）'], ['y6', '票据缺失补齐']],
      foot: '留存 <b>盘点表、往来对账单、外币评估表</b> / 申报 <b>企业所得税汇算清缴、工商年报</b>' }
  ];
  PROFILES.ja.checklist = [
    { tag: 'DAILY', title: '日次・随時', sub: '取引のたびに', items: [
      ['d1', '通帳・カード明細を週1回取得'], ['d2', '領収書・請求書をその場で保管'],
      ['d3', '3万円超の支出は証憑を必ず受領'], ['d4', '請求書の発行日を取引先と確認'],
      ['d5', '摘要のない入出金は当日メモ']],
      foot: '保管 <b>領収書・請求書・通帳明細</b> / 様式 <b>経費精算書</b>' },
    { tag: 'MONTHLY', title: '月次', sub: '毎月10日まで', items: [
      ['m1', '前月の売上・仕入を集計'], ['m2', '給与計算と振込'],
      ['m3', '源泉所得税の納付（10日）'], ['m4', '社会保険料の納付確認'],
      ['m5', '通帳と帳簿の残高照合']],
      foot: '保管 <b>給与台帳・源泉徴収簿</b> / 提出 <b>源泉所得税納付書</b>' },
    { tag: 'QUARTERLY', title: '四半期', sub: '3・6・9・12月', items: [
      ['q1', '消費税の中間申告'], ['q2', '予定納税の確認（7月・11月）'],
      ['q3', '輸出免税売上の整理'], ['q4', '棚卸の実地確認']],
      foot: '保管 <b>中間申告書・仕入税額の資料</b> / 提出 <b>消費税中間申告</b>' },
    { tag: 'ANNUAL', title: '年次・決算', sub: '1〜3月', items: [
      ['y1', '年末調整（11〜12月）'], ['y2', '12/31 外貨残高の評価'],
      ['y3', '期末棚卸の確定'], ['y4', '法人税・消費税の確定申告'],
      ['y5', '代表者貸付・借入の整理'], ['y6', '証憑不足分の補完']],
      foot: '保管 <b>棚卸表・残高確認書・外貨評価表</b> / 提出 <b>法人税・消費税の確定申告書</b>' }
  ];

  /* ---------------------------------------------------------- 상태 */
  function blank() {
    return {
      v: 1, entity: 'corp', fy: String(new Date().getFullYear()), updatedAt: null,
      bank: [], evidence: [], employees: [],
      emp: { injury: '905', size: 0, month: todayISO().slice(0, 7) },
      fx: [], fxbal: [], inventory: [], inv: { open: 0 }, apConfirm: {}, checks: {},
      capital: 0, cashOpen: 0, taxRate: null
    };
  }
  var state = blank();

  function persist() {
    try {
      state.updatedAt = new Date().toISOString();
      localStorage.setItem(KEY, JSON.stringify(state));
      var s = $('#tx-save');
      if (s) { s.classList.remove('is-off'); s.textContent = S.msgSaved + ' · ' + new Date().toLocaleTimeString(LOCALE === 'en' ? 'en-US' : 'ko-KR', { hour12: LOCALE === 'en', hour: '2-digit', minute: '2-digit' }); }
    } catch (e) {
      var s2 = $('#tx-save');
      if (s2) { s2.classList.add('is-off'); s2.textContent = S.msgNoStore; }
    }
  }
  function save(silent) { persist(); if (!silent) flash(null); }
  function flash(msg, isBad) {
    var box = $('#tx-msg');
    if (!box) return;
    box.textContent = msg || '';
    box.style.color = isBad ? 'var(--accent)' : 'var(--ink-3)';
  }

  /* ---------------------------------------------------------- 엔진 */
  function acc(name) {
    for (var i = 0; i < P.accounts.length; i++) if (P.accounts[i].name === name) return P.accounts[i];
    return { name: name || '', kind: 'etc' };
  }
  var EXP_ACCTS = P.accounts.filter(function (a) { return a.kind === 'exp'; }).map(function (a) { return a.name; });

  var RULES = [
    { re: /(가지급|대표자\s*개인|개인사용|대표자\s*인출|owner|draw|personal|shareholder)/i, acc: P.acc.ownerLoan },
    { re: /(가수금|대표자\s*입금|대표자\s*차입|loan\s*from|capital\s*injection)/i, acc: P.acc.ownerDeposit },
    { re: /(주유|주유소|GS칼텍스|SK에너지|S-OIL|에쓰오일|HD현대오일|오일뱅크|충전소|경유|휘발유|fuel|gas\s*station|shell|chevron|中石化|中石油|加油站|ガソリン|給油)/i, acc: P.accounts[14].name },
    { re: /(식당|김밥|분식|한식|중식|일식|양식|카페|커피|스타벅스|급식|도시락|푸드|베이커리|restaurant|cafe|coffee|lunch|meal|餐|食堂|カフェ|飲食)/i, acc: P.accounts[12].name },
    { re: /(골프|접대|유흥|노래방|술집|호프|바베큐|갈비|횟집|고깃집|entertain|golf|bar\b|招待|接待|ゴルフ)/i, acc: P.accounts[13].name },
    { re: /(택배|운임|화물|CJ대한통운|한진|롯데택배|로젠|용차|운송|포워딩|선사|해운|freight|shipping|carrier|fedex|ups\b|運賃|运输)/i, acc: P.accounts[15].name },
    { re: /(관세|통관|유니패스|수입부대|검사료|검역|세관|customs|duty|import\s*fee|关税|通関)/i, acc: P.accounts[26].name },
    { re: /(월세|임차|임대료|사무실|rent\b|lease|房租|賃料|家賃)/i, acc: P.accounts[16].name },
    { re: /(통신|SKT|KT|LG유플러스|인터넷|핸드폰|휴대폰|전화요금|telecom|phone|internet|verizon|at&t|通讯|电话|通信)/i, acc: P.accounts[17].name },
    { re: /(한국전력|한전|도시가스|상하수도|전기요금|수도요금|electric|utility|water|gas\s*bill|电费|水费|電気|水道)/i, acc: P.accounts[18].name },
    { re: /(광고|네이버|구글|메타|인스타|유튜브|배너|홍보|마케팅|advertis|google|meta|facebook|广告|広告)/i, acc: P.accounts[19].name },
    { re: /(보험료|화재보험|자동차보험|insurance|保险|保険)/i, acc: P.accounts[20].name },
    { re: /(국세|지방세|과태료|면허세|등록면허|세금납부|tax\s*payment|irs\b|franchise|tax\b|税|納税)/i, acc: P.accounts[21].name },
    { re: /(이자|대출이자|마이너스통장|interest|利息)/i, acc: P.accounts[22].name },
    { re: /(문구|사무용|소모품|복사용지|토너|supplies|office|办公|消耗品)/i, acc: P.accounts[23].name },
    { re: /(택시|KTX|SRT|항공|출장|숙박|호텔|여비|travel|hotel|flight|uber|差旅|出張)/i, acc: P.accounts[24].name },
    { re: /(수수료|자문|컨설팅|대행|플랫폼|이용료|fee\b|consult|service\s*charge|手续费|手数料)/i, acc: P.accounts[25].name },
    { re: /(급여|상여|퇴직금|4대보험|임금|payroll|salary|wage|paycheck|工资|给与|給与)/i, acc: P.acc.payroll },
    { re: /(이자수익|예금이자|interest\s*income|受取利息)/i, acc: P.accounts[27].name }
  ];
  function suggestAccount(tx) {
    var text = (tx.desc || '') + ' ' + (tx.partner || '');
    for (var i = 0; i < RULES.length; i++) {
      if (RULES[i].re.test(text)) {
        if (RULES[i].acc === P.acc.ownerLoan && num(tx.in) > 0) return P.acc.ownerDeposit;
        return RULES[i].acc;
      }
    }
    return '';
  }

  function evidenceTotals() {
    var t = { salesSupply: 0, salesVat: 0, purchaseSupply: 0, purchaseVat: 0, zeroCredit: 0, cardSupply: 0, cardVat: 0 };
    (state.evidence || []).forEach(function (e) {
      var supply = num(e.supply), vat = num(e.vat);
      if (e.type === 'sales_invoice') { t.salesSupply += supply; t.salesVat += vat; }
      else {
        t.purchaseSupply += supply; t.purchaseVat += vat;
        if (e.zero) t.zeroCredit += vat;
        if (e.type === 'card' || e.type === 'cash') { t.cardSupply += supply; t.cardVat += vat; }
      }
    });
    return t;
  }

  function taxRate() {
    var r = state.taxRate;
    return (r == null || r === '' || !isFinite(parseFloat(r))) ? P.taxRate : parseFloat(r) / 100;
  }

  function calc() {
    var ev = evidenceTotals();
    var rate = taxRate();
    var bankSales = 0, bankSalesVat = 0, otherExp = 0, gajigeup = 0, gasugeum = 0, receiptNoEvidence = 0, byAcct = {};
    var month = (state.emp && state.emp.month) || todayISO().slice(0, 7);
    var monthSales = 0, monthExp = 0;

    (state.bank || []).forEach(function (t) {
      if (t.excluded) return;
      var amt = num(t.in) || num(t.out), a = t.account || '';
      byAcct[a] = (byAcct[a] || 0) + (num(t.in) ? num(t.in) : -num(t.out));
      var isMatched = !!t.matchedEv;
      if (num(t.in) > 0 && a === P.acc.sales) {
        var supply = Math.round(amt / (1 + rate));
        bankSales += supply; bankSalesVat += amt - supply;
      }
      if (num(t.out) > 0 && a === P.acc.ownerLoan) gajigeup += amt;
      if (num(t.in) > 0 && a === P.acc.ownerDeposit) gasugeum += amt;
      if (num(t.in) > 0 && !isMatched && a !== P.acc.sales && a !== P.acc.zero && a !== P.acc.ownerDeposit && a !== P.accounts[27].name && a !== P.accounts[28].name) receiptNoEvidence += amt;
      if (num(t.out) > 0 && !isMatched && EXP_ACCTS.indexOf(a) >= 0 && a !== P.acc.purchase && a !== P.acc.payroll) {
        otherExp += amt / (1 + rate);
        if (monthKey(t.date) === month) monthExp += amt / (1 + rate);
      }
    });

    (state.evidence || []).forEach(function (e) {
      if (e.type === 'sales_invoice') { if (monthKey(e.date) === month) monthSales += num(e.supply); return; }
      if ((e.type === 'card' || e.type === 'cash') && !e.matchedTx) {
        otherExp += num(e.supply);
        if (monthKey(e.date) === month) monthExp += num(e.supply);
      }
    });

    var zeroSales = (state.fx || []).reduce(function (a, x) { return a + num(x.amount) * num(x.shipRate); }, 0);
    var taxableSales = ev.salesSupply + bankSales;
    var salesTax = ev.salesVat + bankSalesVat;
    var purchaseTax = ev.purchaseVat;
    var zeroCredit = P.zeroRated ? ev.zeroCredit : 0;
    var vatPayable = salesTax - (P.inputCredit ? purchaseTax : 0) - zeroCredit;

    var payMonthly = payrollTotal();
    var payYear = payMonthly * 12;
    var revenue = taxableSales + zeroSales;
    var cogsBuy = ev.purchaseSupply + (P.inputCredit ? 0 : ev.purchaseVat);
    var invEnd = inventoryValue();
    var cogs = Math.max(0, num(state.inv.open) + cogsBuy - invEnd);
    var operating = revenue - cogs - otherExp - payYear;

    var monthRevenue = 0;
    (state.evidence || []).forEach(function (e) { if (e.type === 'sales_invoice' && monthKey(e.date) === month) monthRevenue += num(e.supply); });
    (state.bank || []).forEach(function (t) { if (num(t.in) > 0 && !t.excluded && t.account === P.acc.sales && monthKey(t.date) === month) monthRevenue += Math.round(num(t.in) / (1 + rate)); });
    var monthOperating = monthRevenue - monthExp - payMonthly;

    var fxDiff = (state.fx || []).reduce(function (a, x) { return a + fxGain(x); }, 0);
    var fxRev = (state.fxbal || []).reduce(function (a, x) { return a + fxbalGain(x); }, 0);
    var totalProfit = operating + fxDiff + fxRev;
    var taxCalc = P.incomeTax(Math.max(0, totalProfit), state.entity);

    return {
      ev: ev, rate: rate, taxableSales: taxableSales, zeroSales: zeroSales, salesTax: salesTax,
      purchaseTax: purchaseTax, zeroCredit: zeroCredit, vatPayable: vatPayable,
      bankSales: bankSales, revenue: revenue, cogsBuy: cogsBuy, invEnd: invEnd, cogs: cogs,
      otherExp: otherExp, payMonthly: payMonthly, payYear: payYear, operating: operating,
      monthOperating: monthOperating, monthRevenue: monthRevenue, monthExp: monthExp,
      fxDiff: fxDiff, fxRev: fxRev, totalProfit: totalProfit, taxCalc: taxCalc,
      gajigeup: gajigeup, gasugeum: gasugeum, byAcct: byAcct, receiptNoEvidence: receiptNoEvidence, month: month
    };
  }

  function inventoryValue() {
    return (state.inventory || []).reduce(function (a, it) { return a + num(it.qty) * num(it.price); }, 0);
  }
  function fxGain(x) { return Math.round(num(x.amount) * (num(x.payRate) - num(x.shipRate))); }
  function fxbalGain(x) {
    var g = Math.round(num(x.amount) * (num(x.closeRate) - num(x.bookRate)));
    return /채무|미지급|payable|应付|未払/i.test(x.kind || '') ? -g : g;
  }

  function payrollRow(emp) {
    var r = P.payroll(emp);
    r.id = emp.id; r.name = emp.name || '—'; r.role = emp.role || 'employee';
    return r;
  }
  function payrollRows() { return (state.employees || []).map(payrollRow); }
  function payrollTotal() { return payrollRows().reduce(function (a, r) { return a + r.gross; }, 0); }

  /* ---------------------------------------------------------- 화면: 대시보드 */
  function renderDash() {
    var c = calc();
    var e = state.entity;

    $$('#tx-entity button').forEach(function (b) {
      var isCorp = b.getAttribute('data-entity') === 'corp';
      b.setAttribute('aria-pressed', String(isCorp === (e === 'corp')));
      b.textContent = isCorp ? S.entityCorp : S.entitySole;
    });
    var note = $('#tx-entity-note');
    if (note) note.textContent = e === 'sole' ? S.noteSole : S.noteCorp;

    var vatEl = $('#tx-kpi-vat');
    vatEl.textContent = P.short(c.vatPayable);
    vatEl.parentNode.querySelector('.k').textContent = S.kpiVat;
    $('#tx-kpi-vat-d').textContent = S.kpiVatSub + ' · ' + (c.vatPayable < 0 ? S.vatRefundShort : S.vatPay);

    $('#tx-kpi-month').textContent = P.short(c.monthOperating);
    $('#tx-kpi-month').parentNode.querySelector('.k').textContent = S.kpiMonth;
    $('#tx-kpi-month-d').textContent = c.month + ' · ' + P.short(c.monthRevenue) + ' − ' + P.short(c.monthExp + c.payMonthly);

    $('#tx-kpi-year').textContent = P.short(c.operating);
    $('#tx-kpi-year').parentNode.querySelector('.k').textContent = S.kpiYear;
    $('#tx-kpi-year-d').textContent = S.kpiYearSub;

    $('#tx-kpi-taxtitle').textContent = e === 'sole' ? S.kpiTaxSole : S.kpiTaxCorp;
    $('#tx-kpi-incometax').textContent = P.short(c.taxCalc.total);
    $('#tx-kpi-incometax-d').textContent = S.kpiTaxSub + ' · ' + P.short(Math.max(0, c.totalProfit));

    var R = S.rows;
    var rows = [
      ['taxableSales', P.money(c.taxableSales)],
      ['zeroSales', P.money(c.zeroSales)],
      ['salesTax', P.money(c.salesTax)],
      ['purchaseSupply', P.money(c.ev.purchaseSupply)],
      ['purchaseTax', P.money(c.purchaseTax)],
      ['zeroCredit', P.money(c.zeroCredit)],
      ['vatDue', '<b>' + P.money(c.vatPayable) + '</b>']
    ];
    $('#tx-summary').innerHTML = rows.map(function (r) {
      var def = R[r[0]];
      return '<tr><td>' + esc(def[0]) + '<span class="sub">' + esc(def[1]) + '</span></td><td class="n">' + r[1] + '</td></tr>';
    }).join('');

    var basis = [
      ['opProfit', P.money(c.operating), S.isLines.revenue + ' − ' + S.isLines.cogs + ' − ' + S.isLines.sga],
      ['nonOp', P.money(c.fxDiff + c.fxRev), P.money(c.fxDiff) + ' · ' + P.money(c.fxRev)],
      ['pretax', P.money(c.totalProfit), S.isLines.operating + ' + ' + S.isLines.nonOpIn],
      ['taxBase', P.money(Math.max(0, c.totalProfit)), ''],
      [e === 'sole' ? 'soleTax' : 'corpTax', P.money(c.taxCalc.tax), e === 'sole' ? S.incomeNameSole || '' : ''],
      ['localTax', P.money(c.taxCalc.local), '']
    ];
    var labels = { opProfit: R.opProfit, nonOp: R.nonOp, pretax: R.pretax, taxBase: R.taxBase, localTax: R.localTax };
    $('#tx-basis').innerHTML = basis.map(function (r) {
      var def = labels[r[0]] || [ (e === 'sole' ? P.incomeNameSole : P.incomeNameCorp), '' ];
      return '<tr><td>' + esc(def[0]) + '<span class="sub">' + esc(r[2]) + '</span></td><td class="n">' + r[1] + '</td></tr>';
    }).join('');

    renderChecks();
  }

  function renderChecks() {
    var box = $('#tx-checks');
    if (!box) return;
    box.innerHTML = (P.checklist || []).map(function (g) {
      var done = g.items.filter(function (it) { return state.checks[it[0]]; }).length;
      var pc = Math.round(done / g.items.length * 100);
      return '<div class="tx-check-col">' +
        '<header><span class="mono">' + esc(g.tag) + '</span><h4>' + esc(g.title) + '</h4><p>' + esc(g.sub) + '</p>' +
        '<div class="tx-progress"><i style="width:' + pc + '%"></i></div></header>' +
        '<ul>' + g.items.map(function (it) {
          return '<li><input type="checkbox" id="ck-' + it[0] + '" data-check="' + it[0] + '"' +
            (state.checks[it[0]] ? ' checked' : '') + '><span><label for="ck-' + it[0] + '">' + esc(it[1]) + '</label></span></li>';
        }).join('') + '</ul>' +
        '<div class="tx-check-foot">' + (g.foot || '') + ' · <b>' + done + '/' + g.items.length + '</b></div></div>';
    }).join('');
  }

  /* ---------------------------------------------------------- CSV 파서 */
  function parseCSV(text) {
    text = String(text || '').replace(/^\ufeff/, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    var head = text.split('\n').slice(0, 3).join('\n');
    var delim = head.split('\t').length > head.split(',').length ? '\t' : ',';
    if (head.split(';').length > head.split(',').length) delim = ';';
    var rows = [], row = [], cur = '', q = false;
    for (var i = 0; i < text.length; i++) {
      var ch = text[i];
      if (q) {
        if (ch === '"') { if (text[i + 1] === '"') { cur += '"'; i++; } else q = false; }
        else cur += ch;
      } else {
        if (ch === '"') q = true;
        else if (ch === delim) { row.push(cur); cur = ''; }
        else if (ch === '\n') { row.push(cur); rows.push(row); row = []; cur = ''; }
        else cur += ch;
      }
    }
    if (cur !== '' || row.length) { row.push(cur); rows.push(row); }
    return rows.filter(function (r) { return r.some(function (c) { return String(c).trim() !== ''; }); });
  }
  function findCol(header, re) { for (var i = 0; i < header.length; i++) if (re.test(String(header[i]))) return i; return -1; }
  function findHeader(rows, keyRe) {
    for (var i = 0; i < Math.min(rows.length, 8); i++) {
      var hits = rows[i].filter(function (c) { return keyRe.test(String(c)); }).length;
      if (hits >= 2) return i;
    }
    return 0;
  }
  function decodeBuffer(buf) {
    var out = '';
    try { out = new TextDecoder('utf-8', { fatal: false }).decode(buf); } catch (e) { out = ''; }
    if (!out || (out.match(/\ufffd/g) || []).length > 2) {
      try { out = new TextDecoder('euc-kr').decode(buf); } catch (e2) { }
    }
    return out;
  }
  var BANK_KEYS = /거래일|거래일시|일자|날짜|적요|입금|출금|거래내용|date|description|memo|debit|credit|amount|摘要|日期|收入|支出|入金|出金|金額/i;
  var EV_KEYS = /작성일|발급일|거래일|승인|상호|거래처|가맹점|공급가액|합계|세액|date|vendor|supplier|amount|total|subtotal|tax|开票|金额|日期|仕入|取引/i;

  function importBankCSV(text) {
    var rows = parseCSV(text);
    if (!rows.length) return { added: 0, error: 'empty' };
    var h = findHeader(rows, BANK_KEYS), header = rows[h].map(String);
    var ci = {
      date: findCol(header, /거래일시|거래일|거래날짜|일자|날짜|date|日期|日付/i),
      desc: findCol(header, /적요|거래내용|기재내용|내용|description|memo|details|摘要|備考|内容/i),
      in: findCol(header, /입금|맡기신|수입금액|\bcredit\b|\bin\b|deposit|收入|入金/i),
      out: findCol(header, /출금|찾으신|지급금액|\bdebit\b|\bout\b|withdraw|支出|出金/i),
      amt: findCol(header, /거래금액|금액|amount|金额|金額/i)
    };
    if (ci.date < 0 || (ci.in < 0 && ci.out < 0 && ci.amt < 0)) return { added: 0, error: 'columns' };
    var added = 0;
    for (var i = h + 1; i < rows.length; i++) {
      var r = rows[i], date = isoDate(r[ci.date]);
      if (!date) continue;
      var ain = ci.in >= 0 ? num(r[ci.in]) : 0, aout = ci.out >= 0 ? num(r[ci.out]) : 0;
      if (!ain && !aout && ci.amt >= 0) { var v = num(r[ci.amt]); if (v >= 0) ain = v; else aout = -v; }
      if (!ain && !aout) continue;
      state.bank.push({ id: uid('t'), date: date, desc: ci.desc >= 0 ? String(r[ci.desc] || '').trim() : '', in: Math.abs(ain), out: Math.abs(aout), account: '', matchedEv: null, excluded: false, src: 'csv' });
      if (++added >= 2000) break;
    }
    return { added: added };
  }

  function importEvidenceCSV(text, type) {
    var rows = parseCSV(text);
    if (!rows.length) return { added: 0, error: 'empty' };
    var h = findHeader(rows, EV_KEYS), header = rows[h].map(String);
    var ci = {
      date: findCol(header, /작성일|발급일|거래일|승인일|사용일|일자|date|日期|日付/i),
      partner: findCol(header, /상호|거래처|가맹점|공급자|판매자|사업자명|vendor|supplier|merchant|customer|客户|供应商|取引先/i),
      supply: findCol(header, /공급가액|과세표준|net|subtotal|不含税|净额|税抜/i),
      vat: findCol(header, /\b세액\b|부가세|부가가치세|\btax\b|vat|税额|消費税/i),
      total: findCol(header, /합계|총액|승인금액|결제금액|이용금액|total|gross|amount|价税合计|合計/i)
    };
    if (ci.date < 0 || (ci.supply < 0 && ci.total < 0)) return { added: 0, error: 'columns' };
    var added = 0;
    for (var i = h + 1; i < rows.length; i++) {
      var r = rows[i], date = isoDate(r[ci.date]);
      if (!date) continue;
      var supply = ci.supply >= 0 ? num(r[ci.supply]) : 0;
      var vat = ci.vat >= 0 ? num(r[ci.vat]) : 0;
      var total = ci.total >= 0 ? num(r[ci.total]) : 0;
      if (!total) total = supply + vat;
      if (!supply) supply = Math.round(total / (1 + taxRate()));
      if (!vat) vat = total - supply;
      if (!total) continue;
      state.evidence.push({
        id: uid('e'), type: type, date: date,
        partner: ci.partner >= 0 ? String(r[ci.partner] || '').trim() : '',
        supply: Math.abs(supply), vat: Math.abs(vat), zero: false, account: '', matchedTx: null, src: 'csv'
      });
      if (++added >= 2000) break;
    }
    return { added: added };
  }

  function autoMatch() {
    (state.evidence || []).forEach(function (e) { e.matchedTx = null; });
    (state.bank || []).forEach(function (t) { t.matchedEv = null; });
    var matched = 0;
    (state.bank || []).forEach(function (t) {
      if (t.excluded) return;
      var amt = num(t.in) || num(t.out);
      if (!amt) return;
      var isIn = num(t.in) > 0;
      var cands = (state.evidence || []).filter(function (e) {
        if (e.matchedTx) return false;
        if (Math.abs(num(e.supply) + num(e.vat) - amt) > 1) return false;
        if (Math.abs(days(e.date, t.date)) > 10) return false;
        if (isIn) return e.type === 'sales_invoice';
        return e.type === 'purchase_invoice' || e.type === 'card' || e.type === 'cash';
      });
      cands.sort(function (a, b) { return Math.abs(days(a.date, t.date)) - Math.abs(days(b.date, t.date)); });
      if (!cands.length) return;
      var e = cands[0];
      e.matchedTx = t.id; t.matchedEv = e.id;
      if (isIn) t.account = P.acc.ar;
      else if (e.type === 'purchase_invoice') t.account = P.acc.ap;
      else t.account = e.account || suggestAccount({ desc: t.desc, partner: e.partner }) || P.accounts[25].name;
      matched++;
    });
    return matched;
  }

  function applySuggestions() {
    var n = 0;
    (state.bank || []).forEach(function (t) {
      if (t.excluded || t.matchedEv || t.account) return;
      var s = suggestAccount(t);
      if (s) { t.account = s; n++; }
    });
    (state.evidence || []).forEach(function (e) {
      if (e.account) return;
      if (e.type === 'purchase_invoice') { e.account = P.acc.purchase; n++; return; }
      var s = suggestAccount({ desc: '', partner: e.partner });
      if (s) { e.account = s; n++; }
    });
    return n;
  }

  /* ---------------------------------------------------------- 화면: 통장·증빙 */
  function accountOptions(sel) {
    return '<option value="">—</option>' + P.accounts.map(function (a) {
      return '<option value="' + esc(a.name) + '"' + (a.name === sel ? ' selected' : '') + '>' + esc(a.name) + '</option>';
    }).join('');
  }
  function journalText(t) {
    if (t.excluded) return '<span class="tx-chip mut">' + esc(S.chipExcluded) + '</span>';
    if (!t.account) return '<span class="tx-chip warn">' + esc(S.chipUndecided) + '</span>';
    if (num(t.in) > 0) return esc(S.journalDr + P.acc.cash + S.journalCr + t.account);
    return esc(S.journalDr + t.account + S.journalCr + P.acc.cash);
  }
  function evTypeShort(type) {
    var m = { sales_invoice: 'sales', purchase_invoice: 'purchase', card: 'card', cash: 'cash' };
    return (S.evTypes && S.evTypes[m[type]]) || {
      sales_invoice: 'Sales invoice', purchase_invoice: 'Purchase invoice', card: 'Card', cash: 'Cash receipt'
    }[type] || type;
  }
  function isUnclassified(t) {
    if (t.excluded || t.handled) return false;
    if (!String(t.desc || '').trim()) return true;
    if (!t.account) return true;
    return false;
  }

  function renderLedger() {
    var bank = state.bank || [], evs = state.evidence || [];
    $('#tx-bank-count').textContent = bank.length;
    $('#tx-ev-count').textContent = evs.length;
    var unm = bank.filter(isUnclassified);
    $('#tx-unm-count').textContent = unm.length;

    var bbody = $('#tx-bank-body');
    if (!bank.length) {
      bbody.innerHTML = '<tr><td colspan="8"><div class="tx-empty"><b>' + esc(S.emptyBankT) + '</b>' + esc(S.emptyBankS) + '</div></td></tr>';
    } else {
      bbody.innerHTML = bank.map(function (t) {
        var e = evs.filter(function (x) { return x.id === t.matchedEv; })[0];
        var cls = (t.excluded ? 'is-excluded' : '') + (isUnclassified(t) ? ' is-unmatched' : '');
        return '<tr data-id="' + t.id + '" class="' + cls + '">' +
          '<td class="l n">' + esc(t.date) + '</td>' +
          '<td class="l">' + (esc(t.desc) || '<span class="tx-chip bad">' + esc(S.chipNoDesc) + '</span>') + '</td>' +
          '<td class="n">' + (num(t.in) ? P.money(t.in) : '') + '</td>' +
          '<td class="n">' + (num(t.out) ? P.money(t.out) : '') + '</td>' +
          '<td class="l"><select data-act="acct" aria-label="account">' + accountOptions(t.account) + '</select></td>' +
          '<td class="l">' + (e ? '<span class="tx-chip ok">' + esc(evTypeShort(e.type)) + '</span>' : '<span class="tx-chip mut">' + esc(S.chipNoEvidence) + '</span>') + '</td>' +
          '<td class="l">' + journalText(t) + '</td>' +
          '<td class="c"><button class="tx-btn-xs" type="button" data-act="del-tx">×</button></td></tr>';
      }).join('');
    }

    var ebody = $('#tx-ev-body');
    if (!evs.length) {
      ebody.innerHTML = '<tr><td colspan="8"><div class="tx-empty"><b>' + esc(S.emptyEvT) + '</b>' + esc(S.emptyEvS) + '</div></td></tr>';
    } else {
      ebody.innerHTML = evs.map(function (e) {
        return '<tr data-id="' + e.id + '">' +
          '<td class="l n">' + esc(e.date) + '</td>' +
          '<td class="l">' + esc(evTypeShort(e.type)) + (e.zero ? ' <span class="tx-chip warn">' + esc(S.chipZero) + '</span>' : '') + '</td>' +
          '<td class="l">' + (esc(e.partner) || '—') + '</td>' +
          '<td class="n">' + P.money(e.supply) + '</td>' +
          '<td class="n">' + P.money(e.vat) + '</td>' +
          '<td class="n">' + P.money(num(e.supply) + num(e.vat)) + '</td>' +
          '<td class="l"><select data-act="ev-acct" aria-label="account">' + accountOptions(e.account) + '</select></td>' +
          '<td class="c"><button class="tx-btn-xs" type="button" data-act="del-ev">×</button></td></tr>';
      }).join('');
    }

    var box = $('#tx-unm');
    if (!unm.length) {
      box.innerHTML = '<div class="tx-empty"><b>' + esc(S.emptyUnmT) + '</b>' + esc(S.emptyUnmS) + '</div>';
    } else {
      box.innerHTML = unm.map(function (t) {
        var amt = num(t.in) || num(t.out);
        var why = !t.desc ? S.qNoDesc : (!t.account ? S.qNoAcct : S.qNoMatch);
        return '<div class="tx-unm-row" data-id="' + t.id + '">' +
          '<div class="m"><div class="t">' + (esc(t.desc) || esc(S.emptyUnmT)) +
          '<span class="amt">' + (num(t.in) ? '+' : '−') + P.money(amt) + '</span>' +
          '<span class="tx-chip mut">' + esc(t.date) + '</span><span class="why">' + esc(why) + '</span></div>' +
          '<div class="s"><span>' + (num(t.in) ? '+' : '−') + '</span><span>' + esc(S.qSuggest) + ': ' + esc(suggestAccount(t) || '—') + '</span></div></div>' +
          '<div class="acts">' +
          '<button class="tx-btn-xs acc" type="button" data-act="cls" data-v="sales">' + esc(S.qSales) + '</button>' +
          '<button class="tx-btn-xs acc" type="button" data-act="cls" data-v="purchase">' + esc(S.qPurchase) + '</button>' +
          '<button class="tx-btn-xs" type="button" data-act="cls" data-v="welfare">' + esc(S.qWelfare) + '</button>' +
          '<button class="tx-btn-xs" type="button" data-act="cls" data-v="entertain">' + esc(S.qEntertain) + '</button>' +
          '<button class="tx-btn-xs" type="button" data-act="cls" data-v="owner">' + esc(S.qOwner) + '</button>' +
          '<button class="tx-btn-xs dark" type="button" data-act="cls" data-v="exclude">' + esc(S.qExclude) + '</button>' +
          '</div></div>';
      }).join('');
    }

    renderJournal();
    renderCatalog();
  }

  function journalEntries() {
    var out = [];
    (state.evidence || []).forEach(function (e) {
      var supply = num(e.supply), vat = num(e.vat), total = supply + vat;
      if (e.type === 'sales_invoice') {
        out.push({ date: e.date, memo: (e.partner || P.acc.sales) + ' ' + evTypeShort('sales_invoice'), dr: P.acc.ar, drAmt: total, cr: P.acc.sales, crAmt: supply, cr2: P.acc.vatPayable, cr2Amt: vat });
      } else {
        var a = e.account || (e.type === 'purchase_invoice' ? P.acc.purchase : P.accounts[25].name);
        out.push({ date: e.date, memo: (e.partner || P.acc.purchase) + ' ' + evTypeShort(e.type), dr: a, drAmt: supply, dr2: P.acc.vatPaid, dr2Amt: vat, cr: P.acc.ap, crAmt: total });
      }
    });
    (state.bank || []).forEach(function (t) {
      if (t.excluded || !t.account) return;
      var amt = num(t.in) || num(t.out);
      if (!amt) return;
      if (num(t.in) > 0) out.push({ date: t.date, memo: t.desc || '+', dr: P.acc.cash, drAmt: amt, cr: t.account, crAmt: amt });
      else out.push({ date: t.date, memo: t.desc || '−', dr: t.account, drAmt: amt, cr: P.acc.cash, crAmt: amt });
    });
    return out.sort(function (a, b) { return a.date < b.date ? -1 : 1; });
  }
  function renderJournal() {
    var body = $('#tx-journal-body'), rows = journalEntries();
    if (!rows.length) {
      body.innerHTML = '<tr><td colspan="6"><div class="tx-empty"><b>' + esc(S.emptyJournalT) + '</b>' + esc(S.emptyJournalS) + '</div></td></tr>';
      return;
    }
    body.innerHTML = rows.slice(-300).map(function (j) {
      return '<tr><td class="l n">' + esc(j.date) + '</td><td class="l">' + esc(j.memo) + '</td>' +
        '<td class="l">' + esc(j.dr) + '</td><td class="n">' + P.money(j.drAmt) + '</td>' +
        '<td class="l">' + esc(j.cr) + (j.cr2 ? ' / ' + esc(j.cr2) : '') + '</td>' +
        '<td class="n">' + P.money(j.crAmt + (j.cr2Amt || 0)) + '</td></tr>';
    }).join('');
  }
  function renderCatalog() {
    var g = { rev: [], exp: [], asset: [], etc: [] };
    P.accounts.forEach(function (a) {
      var chip = '<span class="tx-chip">' + esc(a.name) + '</span>';
      if (a.kind === 'rev') g.rev.push(chip);
      else if (a.kind === 'exp') g.exp.push(chip);
      else if (a.kind === 'asset' || a.kind === 'liab') g.asset.push(chip);
      else g.etc.push(chip);
    });
    if ($('#tx-acct-rev')) $('#tx-acct-rev').innerHTML = g.rev.join('');
    if ($('#tx-acct-exp')) $('#tx-acct-exp').innerHTML = g.exp.join('');
    if ($('#tx-acct-bal')) $('#tx-acct-bal').innerHTML = g.asset.join('');
    if ($('#tx-acct-etc')) $('#tx-acct-etc').innerHTML = g.etc.join('');
  }

  /* ---------------------------------------------------------- 화면: 급여 */
  function renderPayroll() { renderEmpTable(); renderPayResults(); fillSetup(); }

  function renderEmpTable() {
    var tbody = $('#tx-emp-body'), emps = state.employees || [];
    $('#tx-emp-count').textContent = emps.length;
    if (!emps.length) {
      tbody.innerHTML = '<tr><td colspan="8"><div class="tx-empty"><b>' + esc(S.emptyEmpT) + '</b>' + esc(S.emptyEmpS) + '</div></td></tr>';
      return;
    }
    tbody.innerHTML = emps.map(function (e, i) {
      return '<tr data-i="' + i + '">' +
        '<td class="l"><input type="text" data-f="name" value="' + esc(e.name) + '"></td>' +
        '<td class="l"><select data-f="role">' +
        '<option value="employee"' + (e.role !== 'ceo' ? ' selected' : '') + '>' + esc(S.roleEmployee) + '</option>' +
        '<option value="ceo"' + (e.role === 'ceo' ? ' selected' : '') + '>' + esc(S.roleCeo) + '</option></select></td>' +
        '<td><input type="number" min="0" step="1" data-f="base" value="' + num(e.base) + '"></td>' +
        '<td><input type="number" min="0" step="1" data-f="allow" value="' + num(e.allow) + '"></td>' +
        '<td><input type="number" min="0" step="1" data-f="meal" value="' + num(e.meal) + '"></td>' +
        '<td><input type="number" min="0" step="1" data-f="car" value="' + num(e.car) + '"></td>' +
        '<td><input type="number" min="1" max="6" step="1" data-f="family" value="' + (parseInt(e.family, 10) || 1) + '"></td>' +
        '<td class="c"><button class="tx-btn-xs" type="button" data-act="del-emp">×</button></td></tr>';
    }).join('');
  }

  function renderPayResults() {
    var rows = payrollRows();
    var head = $('#tx-pay-head');
    if (head) {
      head.innerHTML = '<tr><th>' + esc(S.colName || 'Name') + '</th><th>' + esc(S.colGross || 'Gross') + '</th>' +
        S.payCols.map(function (c) { return '<th>' + esc(c) + '</th>'; }).join('') +
        '<th>' + esc(S.colNet || 'Net') + '</th><th>' + esc(S.colCompany || 'Employer') + '</th></tr>';
    }
    var body = $('#tx-pay-body');
    if (!rows.length) {
      body.innerHTML = '<tr><td colspan="10"><div class="tx-empty"><b>' + esc(S.emptyPayT) + '</b>' + esc(S.emptyPayS) + '</div></td></tr>';
      $('#tx-pay-foot').innerHTML = '';
    } else {
      body.innerHTML = rows.map(function (r) {
        return '<tr><td class="l">' + esc(r.name) + (r.role === 'ceo' ? ' <span class="tx-chip">' + esc(S.roleCeo) + '</span>' : '') + '</td>' +
          '<td class="n">' + P.money(r.gross) + '</td>' +
          r.ded.map(function (d) { return '<td class="n">' + (d ? P.money(d) : '—') + '</td>'; }).join('') +
          '<td class="n"><b>' + P.money(r.net) + '</b></td><td class="n">' + P.money(r.company) + '</td></tr>';
      }).join('');
      var tot = { gross: 0, ded: [0, 0, 0, 0, 0, 0], net: 0, company: 0 };
      rows.forEach(function (r) {
        tot.gross += r.gross; tot.net += r.net; tot.company += r.company;
        r.ded.forEach(function (d, i) { tot.ded[i] += d; });
      });
      $('#tx-pay-foot').innerHTML = '<tr><td>' + esc(S.payFoot) + '</td><td class="n">' + P.money(tot.gross) + '</td>' +
        tot.ded.map(function (d) { return '<td class="n">' + (d ? P.money(d) : '—') + '</td>'; }).join('') +
        '<td class="n">' + P.money(tot.net) + '</td><td class="n">' + P.money(tot.company) + '</td></tr>';
    }

    var whHead = $('#tx-wh-head');
    if (whHead) {
      whHead.innerHTML = '<tr><th>' + esc(S.whKindCol || 'Type / name') + '</th><th>' + esc(S.colCount || 'Count') + '</th>' +
        '<th>' + esc(S.colGross || 'Gross') + '</th><th>' + esc(S.colTaxable || 'Taxable') + '</th>' +
        '<th>' + esc(S.colTax || 'Tax') + '</th><th>' + esc(S.colLocal || 'Local') + '</th><th>' + esc(S.colNet || 'Net') + '</th></tr>';
    }
    var wh = $('#tx-wh-body');
    if (!rows.length) {
      wh.innerHTML = '<tr><td colspan="7"><div class="tx-empty"><b>' + esc(S.emptyWhT) + '</b>' + esc(S.emptyWhS) + '</div></td></tr>';
      $('#tx-wh-foot').innerHTML = '';
    } else {
      wh.innerHTML = rows.map(function (r) {
        return '<tr><td class="l">' + esc(S.whKinds[0]) + ' · ' + esc(r.name) + '</td><td class="c">1</td>' +
          '<td class="n">' + P.money(r.gross) + '</td><td class="n">' + P.money(r.taxable) + '</td>' +
          '<td class="n">' + P.money(r.tax) + '</td><td class="n">' + P.money(r.local) + '</td>' +
          '<td class="n">' + P.money(r.gross - r.tax - r.local) + '</td></tr>';
      }).join('');
      var s = rows.reduce(function (a, r) {
        a.gross += r.gross; a.taxable += r.taxable; a.tax += r.tax; a.local += r.local; a.net += r.gross - r.tax - r.local; return a;
      }, { gross: 0, taxable: 0, tax: 0, local: 0, net: 0 });
      $('#tx-wh-foot').innerHTML = '<tr><td>' + esc(S.whFoot) + '</td><td class="c">' + rows.length + '</td><td class="n">' + P.money(s.gross) + '</td><td class="n">' + P.money(s.taxable) + '</td>' +
        '<td class="n">' + P.money(s.tax) + '</td><td class="n">' + P.money(s.local) + '</td><td class="n">' + P.money(s.net) + '</td></tr>';
    }
  }

  function fillSetup() {
    var injury = $('#tx-injury'), size = $('#tx-size');
    if (!injury) return;
    if (!injury.options.length) {
      if (LOCALE === 'ko') {
        var list = (D.injury && D.injury.list) || [];
        injury.innerHTML = list.map(function (it) {
          return '<option value="' + it.code + '">' + esc(it.name) + ' (' + ((it.rate + ((D.injury && D.injury.commute) || 0)) * 100).toFixed(2) + '%)</option>';
        }).join('');
      } else if (LOCALE === 'ja') {
        injury.innerHTML = [['905', '一般事務 0.3%'], ['501', '運送業 1.8%'], ['400', '建設業 3.5%'], ['209', '製造業 1.3%']]
          .map(function (it) { return '<option value="' + it[0] + '">' + esc(it[1]) + '</option>'; }).join('');
      } else if (LOCALE === 'zh') {
        injury.innerHTML = [['905', '一类 0.4%'], ['510', '二类 0.7%'], ['400', '三类 1.0%']]
          .map(function (it) { return '<option value="' + it[0] + '">' + esc(it[1]) + '</option>'; }).join('');
      } else {
        injury.innerHTML = [['905', 'Clerical 0.5%'], ['501', 'Trucking 3.5%'], ['400', 'Construction 6.9%'], ['209', 'Manufacturing 2.1%']]
          .map(function (it) { return '<option value="' + it[0] + '">' + esc(it[1]) + '</option>'; }).join('');
      }
      injury.value = state.emp.injury || '905';
    }
    if (size && !size.options.length) {
      if (LOCALE === 'ko') {
        var sl = (D.insurance && D.insurance.stability) || [{ label: '150명 미만', rate: 0.0025 }];
        size.innerHTML = sl.map(function (ss, i) { return '<option value="' + i + '">' + esc(ss.label) + '</option>'; }).join('');
      } else {
        size.innerHTML = ['<option value="0">Standard rate</option>'].join('');
      }
      size.value = String(state.emp.size || 0);
    }
    var mon = $('#tx-pay-month');
    if (mon && !mon.value) mon.value = state.emp.month || todayISO().slice(0, 7);
  }

  /* ---------------------------------------------------------- 04 수출입·외환 */
  function renderFX() {
    var fx = state.fx || [], body = $('#tx-fx-body');
    if (!body) return;
    if (!fx.length) {
      body.innerHTML = '<tr><td colspan="9"><div class="tx-empty"><b>' + esc(S.emptyFxT) + '</b>' + esc(S.emptyFxS) + '</div></td></tr>';
      $('#tx-fx-foot').innerHTML = '';
    } else {
      body.innerHTML = fx.map(function (x, i) {
        var g = fxGain(x);
        return '<tr data-i="' + i + '">' +
          '<td class="l"><input type="text" data-f="docNo" value="' + esc(x.docNo) + '"></td>' +
          '<td><input type="date" data-f="date" value="' + esc(x.date) + '"></td>' +
          '<td class="l"><select data-f="currency">' + ['USD', 'EUR', 'JPY', 'CNY', 'GBP'].map(function (c) {
            return '<option' + (x.currency === c ? ' selected' : '') + '>' + c + '</option>';
          }).join('') + '</select></td>' +
          '<td><input type="number" min="0" step="0.01" data-f="amount" value="' + num(x.amount) + '"></td>' +
          '<td><input type="number" min="0" step="0.0001" data-f="shipRate" value="' + num(x.shipRate) + '"></td>' +
          '<td><input type="date" data-f="payDate" value="' + esc(x.payDate) + '"></td>' +
          '<td><input type="number" min="0" step="0.0001" data-f="payRate" value="' + num(x.payRate) + '"></td>' +
          '<td class="n ' + (g >= 0 ? 'pos' : 'neg') + '">' + (g > 0 ? '+' : '') + P.money(g) + '</td>' +
          '<td class="c"><button class="tx-btn-xs" type="button" data-act="del-fx">×</button></td></tr>';
      }).join('');
      var total = fx.reduce(function (a, x) { return a + fxGain(x); }, 0);
      var base = fx.reduce(function (a, x) { return a + num(x.amount) * num(x.shipRate); }, 0);
      $('#tx-fx-foot').innerHTML = '<tr><td colspan="3">' + esc(S.fxFoot) + '</td><td class="n">' + nf(base) + '</td><td colspan="3"></td>' +
        '<td class="n ' + (total >= 0 ? 'pos' : 'neg') + '">' + (total > 0 ? '+' : '') + P.money(total) + '</td><td></td></tr>';
    }

    var bal = state.fxbal || [], bbody = $('#tx-fxbal-body');
    if (!bal.length) {
      bbody.innerHTML = '<tr><td colspan="9"><div class="tx-empty"><b>' + esc(S.emptyFxBalT) + '</b>' + esc(S.emptyFxBalS) + '</div></td></tr>';
      $('#tx-fxbal-foot').innerHTML = '';
    } else {
      bbody.innerHTML = bal.map(function (x, i) {
        var g = fxbalGain(x);
        var book = Math.round(num(x.amount) * num(x.bookRate)), close = Math.round(num(x.amount) * num(x.closeRate));
        return '<tr data-i="' + i + '">' +
          '<td class="l"><select data-f="kind">' + S.fxKinds.map(function (k) {
            return '<option' + (x.kind === k ? ' selected' : '') + '>' + esc(k) + '</option>';
          }).join('') + '</select></td>' +
          '<td class="l"><select data-f="currency">' + ['USD', 'EUR', 'JPY', 'CNY', 'GBP'].map(function (c) {
            return '<option' + (x.currency === c ? ' selected' : '') + '>' + c + '</option>';
          }).join('') + '</select></td>' +
          '<td><input type="number" min="0" step="0.01" data-f="amount" value="' + num(x.amount) + '"></td>' +
          '<td><input type="number" min="0" step="0.0001" data-f="bookRate" value="' + num(x.bookRate) + '"></td>' +
          '<td><input type="number" min="0" step="0.0001" data-f="closeRate" value="' + num(x.closeRate) + '"></td>' +
          '<td class="n">' + P.money(book) + '</td><td class="n">' + P.money(close) + '</td>' +
          '<td class="n ' + (g >= 0 ? 'pos' : 'neg') + '">' + (g > 0 ? '+' : '') + P.money(g) + '</td>' +
          '<td class="c"><button class="tx-btn-xs" type="button" data-act="del-fxbal">×</button></td></tr>';
      }).join('');
      var tot = bal.reduce(function (a, x) { return a + fxbalGain(x); }, 0);
      $('#tx-fxbal-foot').innerHTML = '<tr><td colspan="7">' + esc(S.fxBalFoot) + '</td><td class="n ' + (tot >= 0 ? 'pos' : 'neg') + '">' + (tot > 0 ? '+' : '') + P.money(tot) + '</td><td></td></tr>';
    }

    var eb = $('#tx-exps-body');
    if (!fx.length) {
      eb.innerHTML = '<tr><td colspan="7"><div class="tx-empty"><b>' + esc(S.emptyExpsT) + '</b>' + esc(S.emptyExpsS) + '</div></td></tr>';
      $('#tx-exps-foot').innerHTML = '';
    } else {
      eb.innerHTML = fx.map(function (x) {
        var conv = Math.round(num(x.amount) * num(x.shipRate));
        return '<tr><td class="l">' + esc(x.docNo || '—') + '</td><td class="l n">' + esc(x.date) + '</td><td class="l">' + esc(x.partner || '—') + '</td>' +
          '<td class="c">' + esc(x.currency) + '</td><td class="n">' + nf(num(x.amount), num(x.amount) % 1 ? 2 : 0) + '</td>' +
          '<td class="n">' + num(x.shipRate).toFixed(4) + '</td><td class="n">' + P.money(conv) + '</td></tr>';
      }).join('');
      var sum = fx.reduce(function (a, x) { return a + num(x.amount) * num(x.shipRate); }, 0);
      $('#tx-exps-foot').innerHTML = '<tr><td colspan="6">' + esc(S.expsFoot) + '</td><td class="n">' + P.money(sum) + '</td></tr>';
    }

    var note = $('#tx-close-fx');
    if (note) {
      var g1 = fx.reduce(function (a, x) { return a + fxGain(x); }, 0);
      var g2 = bal.reduce(function (a, x) { return a + fxbalGain(x); }, 0);
      note.innerHTML = esc(S.fxFoot) + ': <b>' + P.money(g1) + '</b> · ' + esc(S.fxBalFoot) + ': <b>' + P.money(g2) + '</b>';
    }
  }

  /* ---------------------------------------------------------- 05 결산 */
  function arApRows() {
    var map = {};
    (state.evidence || []).forEach(function (e) {
      var isSale = e.type === 'sales_invoice';
      var key = (isSale ? 'AR|' : 'AP|') + (e.partner || '—');
      if (!map[key]) map[key] = { kind: isSale ? S.bs.ar : S.bs.ap, partner: e.partner || '—', made: 0, paid: 0 };
      map[key].made += num(e.supply) + num(e.vat);
      var t = (state.bank || []).filter(function (b) { return b.matchedEv === e.id; })[0];
      if (t) map[key].paid += num(t.in) || num(t.out);
    });
    return Object.keys(map).map(function (k) {
      var r = map[k]; r.balance = r.made - r.paid; r.key = k; return r;
    }).sort(function (a, b) { return b.balance - a.balance; });
  }

  function renderClose() {
    var rows = arApRows(), body = $('#tx-ap-body');
    if (!rows.length) {
      body.innerHTML = '<tr><td colspan="6"><div class="tx-empty"><b>' + esc(S.emptyApT) + '</b>' + esc(S.emptyApS) + '</div></td></tr>';
      $('#tx-ap-foot').innerHTML = '';
    } else {
      body.innerHTML = rows.map(function (r) {
        return '<tr><td class="l">' + esc(r.kind) + '</td><td class="l">' + esc(r.partner) + '</td>' +
          '<td class="n">' + P.money(r.made) + '</td><td class="n">' + P.money(r.paid) + '</td><td class="n">' + P.money(r.balance) + '</td>' +
          '<td class="c"><input type="checkbox" data-act="confirm-ap" data-key="' + esc(r.key) + '"' + (state.apConfirm[r.key] ? ' checked' : '') + '></td></tr>';
      }).join('');
      var ar = rows.filter(function (r) { return r.kind === S.bs.ar; }).reduce(function (a, r) { return a + r.balance; }, 0);
      var ap = rows.filter(function (r) { return r.kind === S.bs.ap; }).reduce(function (a, r) { return a + r.balance; }, 0);
      $('#tx-ap-foot').innerHTML = '<tr><td colspan="4">' + esc(S.payFoot) + '</td><td class="n">' + P.money(ar - ap) + '</td><td class="c"><span class="tx-chip mut">' + P.money(ar) + ' / ' + P.money(ap) + '</span></td></tr>';
    }

    var list = $('#tx-inv-body'), inv = state.inventory || [];
    if (!inv.length) {
      list.innerHTML = '<tr><td colspan="6"><div class="tx-empty"><b>' + esc(S.emptyInvT) + '</b>' + esc(S.emptyInvS) + '</div></td></tr>';
      $('#tx-inv-foot').innerHTML = '';
    } else {
      list.innerHTML = inv.map(function (it, i) {
        return '<tr data-i="' + i + '">' +
          '<td class="l"><input type="text" data-f="item" value="' + esc(it.item) + '"></td>' +
          '<td class="l"><input type="text" data-f="spec" value="' + esc(it.spec) + '"></td>' +
          '<td><input type="number" min="0" step="1" data-f="qty" value="' + num(it.qty) + '"></td>' +
          '<td><input type="number" min="0" step="0.01" data-f="price" value="' + num(it.price) + '"></td>' +
          '<td class="n">' + P.money(num(it.qty) * num(it.price)) + '</td>' +
          '<td class="c"><button class="tx-btn-xs" type="button" data-act="del-inv">×</button></td></tr>';
      }).join('');
      $('#tx-inv-foot').innerHTML = '<tr><td colspan="4">' + esc(S.invTotal || 'Total inventory') + '</td><td class="n">' + P.money(inventoryValue()) + '</td><td></td></tr>';
    }

    var c = calc();
    if ($('#tx-inv-buy')) $('#tx-inv-buy').value = Math.round(c.ev.purchaseSupply);
    if ($('#tx-inv-end')) $('#tx-inv-end').value = Math.round(inventoryValue());
    if ($('#tx-cash-open') && document.activeElement !== $('#tx-cash-open')) $('#tx-cash-open').value = num(state.cashOpen);
    if ($('#tx-capital') && document.activeElement !== $('#tx-capital')) $('#tx-capital').value = num(state.capital);

    renderStatement(c);
    renderRisks(c);
    buildPrint();
  }

  function renderStatement(c) {
    var buys = c.ev.purchaseSupply + (P.inputCredit ? 0 : c.ev.purchaseVat);
    var invEnd = inventoryValue();
    var cogs = Math.max(0, num(state.inv.open) + buys - invEnd);
    var revenue = c.taxableSales + c.zeroSales;
    var gross = revenue - cogs;
    var pay = c.payYear, sga = c.otherExp;
    var operating = gross - pay - sga;
    var fx = c.fxDiff + c.fxRev;
    var intIn = Math.abs(c.byAcct[P.accounts[27].name] || 0), intOut = Math.abs(c.byAcct[P.accounts[22].name] || 0);
    var nonOpIn = Math.max(0, fx) + intIn, nonOpOut = Math.max(0, -fx) + intOut;
    var pretax = operating + nonOpIn - nonOpOut;
    var tax = P.incomeTax(Math.max(0, pretax), state.entity);
    var net = pretax - tax.total;
    var I = S.isLines;

    var is = [
      [I.revenue, revenue, ''],
      [I.cogs, -cogs, ''],
      [I.gross, gross, ''],
      [I.payroll, -pay, ''],
      [I.sga, -sga, ''],
      [I.operating, operating, ''],
      [I.nonOpIn, nonOpIn, ''],
      [I.nonOpOut, -nonOpOut, ''],
      [I.pretax, pretax, ''],
      [I.incomeTax, -tax.total, ''],
      [I.net, net, '']
    ];
    $('#tx-is-body').innerHTML = is.map(function (r) {
      var bold = /이익|利益|利润|Profit|income|Net|純|净/.test(r[0]);
      return '<tr><td class="l' + (bold ? '' : ' indent') + '">' + esc(r[0]) + (r[2] ? '<span class="sub">' + esc(r[2]) + '</span>' : '') + '</td>' +
        '<td class="n' + (r[1] < 0 ? ' neg' : '') + '">' + (bold ? '<b>' : '') + P.money(r[1]) + (bold ? '</b>' : '') + '</td></tr>';
    }).join('');

    var cash = num(state.cashOpen) + (state.bank || []).reduce(function (a, t) { return a + num(t.in) - num(t.out); }, 0);
    var apRows = arApRows();
    var ar = apRows.filter(function (r) { return r.kind === S.bs.ar; }).reduce(function (a, r) { return a + r.balance; }, 0);
    var ap = apRows.filter(function (r) { return r.kind === S.bs.ap; }).reduce(function (a, r) { return a + r.balance; }, 0);
    var vatAsset = c.vatPayable < 0 ? -c.vatPayable : 0, vatLiab = c.vatPayable > 0 ? c.vatPayable : 0;
    var gaji = Math.max(0, c.gajigeup - c.gasugeum), gasu = Math.max(0, c.gasugeum - c.gajigeup);
    var assets = cash + ar + invEnd + vatAsset + gaji;
    var liab = ap + gasu + vatLiab + Math.max(0, tax.total);
    var equity = assets - liab, capital = num(state.capital), retained = equity - capital;

    var B = S.bs;
    var rows2 = [
      ['<b>' + esc(B.assets) + '</b>', '<b>' + P.money(assets) + '</b>'],
      [B.cash, P.money(cash)], [B.ar, P.money(ar)], [B.inventory, P.money(invEnd)],
      [B.vatAsset, P.money(vatAsset)], [B.ownerLoan, P.money(gaji)],
      ['<b>' + esc(B.liabilities) + '</b>', '<b>' + P.money(liab) + '</b>'],
      [B.ap, P.money(ap)], [B.ownerDeposit, P.money(gasu)], [B.vatLiab, P.money(vatLiab)], [B.taxPayable, P.money(Math.max(0, tax.total))],
      ['<b>' + esc(B.equity) + '</b>', '<b>' + P.money(equity) + '</b>'],
      [B.capital, P.money(capital)], [B.retained, P.money(retained)]
    ];
    $('#tx-bs-body').innerHTML = rows2.map(function (r) {
      return '<tr><td class="l">' + r[0] + '</td><td class="n">' + r[1] + '</td></tr>';
    }).join('');

    window.__txFin = { cogs: cogs, revenue: revenue, gross: gross, operating: operating, pretax: pretax, tax: tax, net: net,
      assets: assets, liab: liab, equity: equity, cash: cash, ar: ar, ap: ap, invEnd: invEnd, gaji: gaji, gasu: gasu,
      vatAsset: vatAsset, vatLiab: vatLiab, sga: sga, pay: pay };
  }

  function nextDue() {
    var t = new Date(), y = t.getFullYear(), m = t.getMonth();
    function f(d) { return d.toLocaleDateString(LOCALE === 'en' ? 'en-US' : LOCALE === 'zh' ? 'zh-CN' : LOCALE === 'ja' ? 'ja-JP' : 'ko-KR', { month: 'short', day: 'numeric' }); }
    if (LOCALE === 'ko') {
      var d10 = new Date(y, m, 10); if (d10 <= t) d10 = new Date(y, m + 1, 10);
      return '원천세 ' + f(d10) + ' · 부가세 1·4·7·10월 25일';
    }
    if (LOCALE === 'en') {
      var q = [[3, 15], [5, 15], [8, 15], [0, 15]];
      for (var i = 0; i < 5; i++) {
        var yy = y + (m + i > 11 ? 1 : 0), mm = (m + i) % 12;
        for (var j = 0; j < q.length; j++) {
          if (q[j][0] === mm) { var dt = new Date(yy, mm, q[j][1]); if (dt > t) return f(dt) + ' (1040-ES)'; }
        }
      }
      return 'Apr 15 · Jun 15 · Sep 15 · Jan 15';
    }
    if (LOCALE === 'zh') {
      var c15 = new Date(y, m, 15); if (c15 <= t) c15 = new Date(y, m + 1, 15);
      return f(c15) + ' (增值税及个税) · 5/31 汇算清缴';
    }
    var j10 = new Date(y, m, 10); if (j10 <= t) j10 = new Date(y, m + 1, 10);
    return f(j10) + ' (源泉所得税) · 3/31 法人税';
  }

  function renderRisks(c) {
    var box = $('#tx-risks');
    if (!box) return;
    var gaji = Math.max(0, c.gajigeup - c.gasugeum);
    var inter = Math.round(gaji * 0.046);
    var th = { ko: 30000, en: 75, zh: 500, ja: 30000 }[LOCALE] || 30000;
    var skip = [P.acc.payroll, P.accounts[21].name, P.acc.ownerLoan, P.accounts[22].name, P.acc.ownerDeposit];
    var bad = (state.bank || []).filter(function (t) {
      if (t.excluded || t.matchedEv) return false;
      if (num(t.out) < th) return false;
      if (skip.indexOf(t.account) >= 0) return false;
      return EXP_ACCTS.indexOf(t.account) >= 0 || !t.account;
    });
    var badSum = bad.reduce(function (a, t) { return a + num(t.out); }, 0);
    var penalty = Math.round(badSum * 0.02);
    var pn = P.money(penalty), bn = P.money(badSum), gn = P.money(gaji), in2 = P.money(inter), rn = P.money(c.receiptNoEvidence);

    var ownerBad = S.riskOwnerBad ? S.riskOwnerBad.replace('{bal}', gn).replace('{int}', in2) :
      gn + ' / ' + in2;
    var evBad = S.riskEvidenceBad ? S.riskEvidenceBad.replace('{n}', bad.length).replace('{sum}', bn).replace('{pen}', pn) :
      bad.length + ' · ' + bn + ' · ' + pn;
    var rcBad = S.riskReceiptBad ? S.riskReceiptBad.replace('{sum}', rn) : rn;

    var cards = [
      { cls: gaji > 0 ? 'bad' : 'ok', h: S.riskOwner, v: gn, p: gaji > 0 ? ownerBad : S.riskOwnerOk },
      { cls: penalty > 0 ? 'bad' : 'ok', h: S.riskEvidence, v: pn, p: penalty > 0 ? evBad : S.riskEvidenceOk },
      { cls: 'warn', h: S.riskDue, v: '', p: nextDue() },
      { cls: c.receiptNoEvidence > 0 ? 'warn' : 'ok', h: S.riskReceipt, v: rn, p: c.receiptNoEvidence > 0 ? rcBad : S.riskReceiptOk }
    ];
    box.innerHTML = cards.map(function (k) {
      return '<div class="tx-risk ' + k.cls + '"><div class="h"><b>' + esc(k.h) + '</b><span class="v">' + esc(k.v) + '</span></div><p>' + k.p + '</p></div>';
    }).join('');
  }

  /* ---------------------------------------------------------- 인쇄 */
  function buildPrint() {
    var c = calc();
    var ent = state.entity === 'sole' ? S.entitySole : S.entityCorp;
    var today = new Date().toLocaleDateString();
    var R = S.rows;
    function head(title, extra) {
      var fyWord = { ko: '과세기간', en: 'tax year', zh: '纳税年度', ja: '課税期間' }[LOCALE] || '';
      return '<h1>' + esc(title) + '</h1><div class="p-sub">' + esc(state.fy) + ' ' + esc(fyWord) + ' · ' + esc(ent) + ' · ' + esc(today) + (extra ? ' · ' + esc(extra) : '') + '</div>';
    }
    var vatRows = [R.taxableSales, R.zeroSales, R.salesTax, R.purchaseSupply, R.purchaseTax, R.zeroCredit, R.vatDue];
    var vals = [c.taxableSales, c.zeroSales, c.salesTax, c.ev.purchaseSupply, c.purchaseTax, c.zeroCredit, c.vatPayable];
    $('#tx-print-vat').innerHTML = head(S.printVat) +
      '<table><thead><tr><th>' + esc(S.printColItem || 'Item') + '</th><th>' + esc(S.printColAmount || 'Amount') + '</th></tr></thead><tbody>' +
      vatRows.map(function (r, i) { return '<tr><td>' + esc(r[0]) + '</td><td>' + P.money(vals[i]) + '</td></tr>'; }).join('') +
      '</tbody></table><div class="p-note">' + esc(S.printNote1) + ' ' + esc(S.printNote3) + '</div>' +
      '<div class="p-sign"><span>' + esc(S.sign) + ' ______________</span><span>( )</span></div>';

    var pr = payrollRows();
    $('#tx-print-wh').innerHTML = head(S.printWh, state.emp.month) +
      '<table><thead><tr><th>' + esc(S.colName || 'Name') + '</th><th>' + esc(S.colGross || 'Gross') + '</th><th>' + esc(S.colTaxable || 'Taxable') + '</th>' +
      '<th>' + esc(S.colTax || 'Tax') + '</th><th>' + esc(S.colLocal || 'Local') + '</th><th>' + esc(S.colNet || 'Net') + '</th></tr></thead><tbody>' +
      (pr.length ? pr.map(function (r) {
        return '<tr><td>' + esc(r.name) + '</td><td>' + P.money(r.gross) + '</td><td>' + P.money(r.taxable) + '</td><td>' + P.money(r.tax) + '</td><td>' + P.money(r.local) + '</td><td>' + P.money(r.gross - r.tax - r.local) + '</td></tr>';
      }).join('') : '<tr><td colspan="6">—</td></tr>') + '</tbody></table>' +
      '<div class="p-note">' + esc(S.printNote2) + '</div>' +
      '<div class="p-sign"><span>' + esc(S.signWh) + ' ______________</span><span>( )</span></div>';

    var f = window.__txFin || {};
    var I = S.isLines, B = S.bs;
    var isRows = [[I.revenue, f.revenue], [I.cogs, -f.cogs], [I.gross, f.gross], [I.payroll, -f.pay], [I.sga, -f.sga],
      [I.operating, f.operating], [I.pretax, f.pretax], [I.incomeTax, -(f.tax ? f.tax.total : 0)], [I.net, f.net]];
    var bsRows = [[B.assets, f.assets], ['　' + B.cash, f.cash], ['　' + B.ar, f.ar], ['　' + B.inventory, f.invEnd],
      [B.liabilities, f.liab], ['　' + B.ap, f.ap], ['　' + B.vatLiab, f.vatLiab], ['　' + B.ownerDeposit, f.gasu],
      [B.equity, f.equity], ['　' + B.capital, num(state.capital)]];
    $('#tx-print-close').innerHTML = head(S.printClose) +
      '<h2>' + esc(I.revenue) + ' — ' + esc(I.net) + '</h2>' +
      '<table><thead><tr><th>' + esc(S.printColItem || 'Item') + '</th><th>' + esc(S.printColAmount || 'Amount') + '</th></tr></thead><tbody>' +
      isRows.map(function (r) { return '<tr><td>' + esc(r[0]) + '</td><td>' + P.money(r[1]) + '</td></tr>'; }).join('') + '</tbody></table>' +
      '<h2>' + esc(B.assets) + ' / ' + esc(B.liabilities) + '</h2>' +
      '<table><thead><tr><th>' + esc(S.printColItem || 'Item') + '</th><th>' + esc(S.printColAmount || 'Amount') + '</th></tr></thead><tbody>' +
      bsRows.map(function (r) { return '<tr><td>' + esc(r[0]) + '</td><td>' + P.money(r[1]) + '</td></tr>'; }).join('') + '</tbody></table>' +
      '<div class="p-note">' + esc(S.printNote3) + '</div>';

    var j = journalEntries();
    $('#tx-print-voucher').innerHTML = head(S.printVoucher) +
      '<table><thead><tr><th>' + esc(S.csv.date) + '</th><th>' + esc(S.csv.desc) + '</th><th>' + esc(S.dr) + '</th><th>' + esc(S.printColAmount || '') + '</th><th>' + esc(S.cr) + '</th><th>' + esc(S.printColAmount || '') + '</th></tr></thead><tbody>' +
      (j.length ? j.map(function (r) {
        return '<tr><td>' + esc(r.date) + '</td><td>' + esc(r.memo) + '</td><td>' + esc(r.dr) + '</td><td>' + P.money(r.drAmt) + '</td><td>' + esc(r.cr + (r.cr2 ? ' / ' + r.cr2 : '')) + '</td><td>' + P.money(r.crAmt + (r.cr2Amt || 0)) + '</td></tr>';
      }).join('') : '<tr><td colspan="6">—</td></tr>') + '</tbody></table>';
  }

  function doPrint(kind) {
    buildPrint();
    var b = document.body;
    b.classList.add('printing', 'print-' + kind);
    var done = function () {
      b.classList.remove('printing', 'print-vat', 'print-wh', 'print-close', 'print-voucher');
      window.removeEventListener('afterprint', done);
    };
    window.addEventListener('afterprint', done);
    setTimeout(function () { window.print(); }, 60);
    setTimeout(done, 60000);
  }

  /* ---------------------------------------------------------- 보조 문구 */
  var EXTRA = {
    ko: {
      colName: '이름', colGross: '지급 총액', colNet: '실수령액', colCompany: '회사 부담', colCount: '인원',
      colTaxable: '과세표준', colTax: '소득세', colLocal: '지방소득세', whKindCol: '소득 구분',
      invTotal: '기말 재고액 합계', printColItem: '구분', printColAmount: '금액',
      evTypes: { sales_invoice: '세금계산서(매출)', purchase_invoice: '세금계산서(매입)', card: '사업용카드', cash: '현금영수증' },
      riskOwnerBad: '통장에서 대표자 개인용도로 빠진 누적액 <b>{bal}</b>입니다. 가지급금으로 남으면 인정이자 <b>{int}</b>(연 4.6% 가정)가 익금으로 잡히고, 상여 처분 시 소득세가 붙습니다. 연말 전에 가수금·급여·배당으로 정리하세요.',
      riskEvidenceBad: '적격증빙이 없는 지출 <b>{n}건 · {sum}</b>입니다. 공급대가의 2%인 <b>{pen}</b> 규모의 가산세가 부과될 수 있습니다. 세금계산서·카드·현금영수증으로 보완하세요.',
      riskReceiptBad: '세금계산서와 연결되지 않은 입금 <b>{sum}</b>입니다. 매출 누락으로 보이지 않도록 계약·계산서·입금 적요를 맞춰 두세요. 가지급금 회수·가수금이면 그 계정으로 분개하세요.',
      sampleName: '샘플 법인 데이터', rateLabel: '부가세율'
    },
    en: {
      colName: 'Name', colGross: 'Gross pay', colNet: 'Net pay', colCompany: 'Employer cost', colCount: 'Count',
      colTaxable: 'Taxable', colTax: 'Income tax', colLocal: 'State/local', whKindCol: 'Type / name',
      invTotal: 'Total inventory', printColItem: 'Item', printColAmount: 'Amount',
      evTypes: { sales_invoice: 'Sales invoice', purchase_invoice: 'Purchase invoice', card: 'Card', cash: 'Cash receipt' },
      riskOwnerBad: "Owner's draws total <b>{bal}</b>. Left on the books they can be treated as a loan with imputed interest of about <b>{int}</b> (4.6% assumed) or as a taxable distribution. Clear them into a loan, payroll or a distribution before year-end.",
      riskEvidenceBad: 'Expenses over $75 without a receipt total <b>{n} items · {sum}</b>. The 2% disallowance penalty is roughly <b>{pen}</b>. Collect invoices or card receipts.',
      riskReceiptBad: 'Deposits of <b>{sum}</b> are not linked to an invoice. Match them to a contract or mark them as owner repayment so revenue is not understated.',
      sampleName: 'Sample company data', rateLabel: 'Sales tax rate'
    },
    zh: {
      colName: '姓名', colGross: '应发合计', colNet: '实发合计', colCompany: '单位承担', colCount: '人数',
      colTaxable: '计税收入', colTax: '个人所得税', colLocal: '附加税费', whKindCol: '所得项目',
      invTotal: '期末存货合计', printColItem: '项目', printColAmount: '金额',
      evTypes: { sales_invoice: '销项发票', purchase_invoice: '进项发票', card: '企业卡', cash: '收据' },
      riskOwnerBad: '股东往来借方余额 <b>{bal}</b>。长期未归还且无合理理由，可能被视同分红并核定利息 <b>{int}</b>（按 4.6% 估算）。请在年末前清理。',
      riskEvidenceBad: '缺少合规票据的支出 <b>{n}笔 · {sum}</b>，可能被调增应纳税所得并处以约 <b>{pen}</b> 的罚款（按 2% 估算）。请补开发票或收据。',
      riskReceiptBad: '未与发票对应的收款 <b>{sum}</b>。请核对合同与开票情况，避免少计收入。',
      sampleName: '示例数据', rateLabel: '增值税税率'
    },
    ja: {
      colName: '氏名', colGross: '支給総額', colNet: '手取額', colCompany: '会社負担', colCount: '人数',
      colTaxable: '課税対象', colTax: '所得税', colLocal: '住民税', whKindCol: '所得区分',
      invTotal: '期末棚卸合計', printColItem: '科目', printColAmount: '金額',
      evTypes: { sales_invoice: '請求書（売上）', purchase_invoice: '請求書（仕入）', card: 'カード', cash: '領収書' },
      riskOwnerBad: '代表者への貸付残高 <b>{bal}</b> があります。放置すると認定利息 <b>{int}</b>（年4.6%想定）が課税対象になり、役員賞与とみなされる場合があります。年末までに借入金・給与・配当で整理してください。',
      riskEvidenceBad: '証憑のない3万円超の支出 <b>{n}件 · {sum}</b>。2%相当の <b>{pen}</b> の加算税・損金不算入のおそれがあります。請求書・領収書で補完してください。',
      riskReceiptBad: '売上と結びつかない入金 <b>{sum}</b>。契約・請求書・入金摘要を照合し、売上漏れとならないようにしてください。',
      sampleName: 'サンプルデータ', rateLabel: '消費税率'
    }
  };
  (function () {
    var ex = EXTRA[LOCALE] || EXTRA.ko;
    Object.keys(ex).forEach(function (k) { L[LOCALE][k] = ex[k]; });
    S = L[LOCALE];
  })();

  /* ---------------------------------------------------------- CSV 내보내기 */
  function cell(v) {
    var s = String(v == null ? '' : v);
    if (/^[=+\-@]/.test(s)) s = "'" + s;
    return '"' + s.replace(/"/g, '""') + '"';
  }
  function download(name, rows) {
    var text = rows.map(function (r) { return r.map(cell).join(','); }).join('\r\n');
    var blob = new Blob(['\ufeff' + text], { type: 'text/csv;charset=utf-8' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = name;
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 900);
  }

  function exportCSV(kind) {
    var c = calc(), rows, name, head = S.csv;
    if (kind === 'bank') {
      name = 'bank-ledger_' + localStamp() + '.csv';
      rows = [[head.date, head.desc, head.in, head.out, head.acct, head.match, head.journal]];
      (state.bank || []).forEach(function (t) {
        rows.push([t.date, t.desc, num(t.in) || '', num(t.out) || '', t.account || '', t.matchedEv ? 'OK' : '', t.excluded ? 'X' : (t.account ? (num(t.in) ? S.journalDr + P.acc.cash + S.journalCr + t.account : S.journalDr + t.account + S.journalCr + P.acc.cash) : '')]);
      });
    } else if (kind === 'payroll') {
      name = 'payroll_' + (state.emp.month || localStamp()) + '.csv';
      rows = [[S.colName, 'role', 'base', 'allowance', 'nontax1', 'nontax2', 'gross'].concat(S.payCols).concat([S.colNet, S.colCompany])];
      payrollRows().forEach(function (r) {
        rows.push([r.name, r.role === 'ceo' ? S.roleCeo : S.roleEmployee, r.gross, r.taxable, '', '', r.gross].slice(0, 7).concat(r.ded).concat([r.net, r.company]));
      });
    } else if (kind === 'inventory') {
      name = 'ending-inventory_' + localStamp() + '.csv';
      rows = [['item', 'spec', 'qty', 'unit cost', 'amount']];
      (state.inventory || []).forEach(function (it) { rows.push([it.item, it.spec, num(it.qty), num(it.price), num(it.qty) * num(it.price)]); });
      rows.push([S.invTotal, '', '', '', inventoryValue()]);
    } else if (kind === 'export') {
      name = 'export-statement_' + localStamp() + '.csv';
      rows = [[S.fxCols.doc, S.fxCols.date, 'partner', S.fxCols.cur, S.fxCols.amount, S.fxCols.ship, S.krwSum]];
      (state.fx || []).forEach(function (x) { rows.push([x.docNo, x.date, x.partner, x.currency, num(x.amount), num(x.shipRate), Math.round(num(x.amount) * num(x.shipRate))]); });
      rows.push(['Total', '', '', '', '', '', (state.fx || []).reduce(function (a, x) { return a + num(x.amount) * num(x.shipRate); }, 0)]);
    } else if (kind === 'journal') {
      name = 'journal_' + localStamp() + '.csv';
      rows = [[head.date, head.desc, S.dr, 'amount', S.cr, 'amount']];
      journalEntries().forEach(function (j) {
        rows.push([j.date, j.memo, j.dr, j.drAmt, j.cr + (j.cr2 ? ' / ' + j.cr2 : ''), j.crAmt + (j.cr2Amt || 0)]);
      });
    } else if (kind === 'evidence') {
      name = 'documents_' + localStamp() + '.csv';
      rows = [[head.date, 'type', 'partner', 'net', 'tax', 'total', 'zero', head.acct]];
      (state.evidence || []).forEach(function (e) {
        rows.push([e.date, evTypeShort(e.type), e.partner, num(e.supply), num(e.vat), num(e.supply) + num(e.vat), e.zero ? 'Y' : '', e.account || '']);
      });
    } else if (kind === 'wh') {
      name = 'withholding-summary_' + (state.emp.month || localStamp()) + '.csv';
      rows = [[S.whKindCol, S.colName, 'count', S.colGross, S.colTaxable, S.colTax, S.colLocal, S.colNet]];
      payrollRows().forEach(function (r) {
        rows.push([S.whKinds[0], r.name, 1, r.gross, r.taxable, r.tax, r.local, r.gross - r.tax - r.local]);
      });
    } else if (kind === 'close') {
      name = 'closing-summary_' + localStamp() + '.csv';
      var f = window.__txFin || {};
      rows = [['section', 'item', 'amount'],
        ['IS', S.isLines.revenue, f.revenue], ['IS', S.isLines.cogs, f.cogs], ['IS', S.isLines.gross, f.gross],
        ['IS', S.isLines.operating, f.operating], ['IS', S.isLines.pretax, f.pretax], ['IS', S.isLines.net, f.net],
        ['BS', S.bs.assets, f.assets], ['BS', S.bs.liabilities, f.liab], ['BS', S.bs.equity, f.equity],
        ['VAT', S.rows.vatDue[0], c.vatPayable]];
    } else return;
    download(name, rows);
    flash(name + ' — ' + S.msgExported);
  }

  function exportAll() {
    var c = calc(), rows = [];
    rows.push(['INSIGHT BRIEF — ' + S.printClose]);
    rows.push([S.csv.date, S.csv.desc, S.csv.in, S.csv.out, S.csv.acct]);
    (state.bank || []).forEach(function (t) { rows.push([t.date, t.desc, num(t.in) || '', num(t.out) || '', t.account || '']); });
    rows.push([]);
    rows.push(['DOCUMENTS', S.csv.date, 'type', 'partner', 'net', 'tax', 'total']);
    (state.evidence || []).forEach(function (e) { rows.push([e.date, evTypeShort(e.type), e.partner, num(e.supply), num(e.vat), num(e.supply) + num(e.vat)]); });
    rows.push([]);
    rows.push(['PAYROLL', S.colName, S.colGross, S.colTax, S.colLocal, S.colNet, S.colCompany]);
    payrollRows().forEach(function (r) { rows.push([r.name, r.gross, r.tax, r.local, r.net, r.company]); });
    rows.push([]);
    rows.push(['INVENTORY', 'item', 'spec', 'qty', 'unit cost', 'amount']);
    (state.inventory || []).forEach(function (it) { rows.push([it.item, it.spec, num(it.qty), num(it.price), num(it.qty) * num(it.price)]); });
    rows.push([]);
    rows.push(['EXPORT', 'doc', 'date', 'partner', 'ccy', 'amount', 'rate', 'value']);
    (state.fx || []).forEach(function (x) { rows.push([x.docNo, x.date, x.partner, x.currency, num(x.amount), num(x.shipRate), Math.round(num(x.amount) * num(x.shipRate))]); });
    rows.push([]);
    rows.push(['TAX SUMMARY', 'amount']);
    rows.push([S.rows.taxableSales[0], c.taxableSales], [S.rows.zeroSales[0], c.zeroSales], [S.rows.salesTax[0], c.salesTax], [S.rows.purchaseTax[0], c.purchaseTax], [S.rows.vatDue[0], c.vatPayable]);
    download('tax-closing-all_' + localStamp() + '.csv', rows);
    flash(S.msgExported);
  }

  /* ---------------------------------------------------------- 샘플 데이터 */
  function sampleKO() {
    var b = function (date, desc, ain, aout, account) { return { id: uid('t'), date: date, desc: desc, in: ain || 0, out: aout || 0, account: account || '', matchedEv: null, excluded: false, src: 'sample' }; };
    var e = function (type, date, partner, supply, vat, zero) { return { id: uid('e'), type: type, date: date, partner: partner, supply: supply, vat: vat, zero: !!zero, account: '', matchedTx: null, src: 'sample' }; };
    var s = blank();
    s.entity = 'corp'; s.fy = '2026'; s.capital = 50000000; s.cashOpen = 18500000;
    s.bank = [
      b('2026-11-02', '(주)대성상사 외상대금 입금', 116600000, 0), b('2026-11-03', '(주)한국재생 원료대금', 0, 77000000),
      b('2026-11-05', 'GS칼텍스 주유', 0, 88000, '차량유지비'), b('2026-11-06', '김밥천국 식대', 0, 154000, '복리후생비'),
      b('2026-11-09', '골프연습장 접대', 0, 220000, '접대비'), b('2026-11-10', '11월 급여이체', 0, 10500000, '급여'),
      b('2026-11-12', 'PT. MAJU JAYA 수출대금 USD 25,000', 33000000, 0, '수출(영세율)'),
      b('2026-11-13', 'CJ대한통운 운임', 0, 770000, '운반비'), b('2026-11-16', '관세청 수입부대비용', 0, 1650000, '수입부대비용'),
      b('2026-11-18', '대표자 가수금 입금', 5000000, 0, '대표자 가수금'), b('2026-11-20', 'SKT 통신요금', 0, 47300, '통신비'),
      b('2026-11-23', '대표자 개인사용', 0, 2000000, '대표자 가지급금'), b('2026-11-24', '', 0, 1100000, ''), b('2026-11-24', '', 3000000, 0, '')
    ];
    s.evidence = [
      e('sales_invoice', '2026-09-30', '(주)세명산업', 88000000, 8800000), e('sales_invoice', '2026-10-30', '(주)대성상사', 96000000, 9600000),
      e('sales_invoice', '2026-11-02', '(주)대성상사', 106000000, 10600000), e('purchase_invoice', '2026-09-28', '(주)한국재생', 60000000, 6000000),
      e('purchase_invoice', '2026-10-29', '(주)동양케미칼', 68000000, 6800000), e('purchase_invoice', '2026-11-03', '(주)한국재생', 70000000, 7000000),
      e('card', '2026-11-05', 'GS칼텍스', 80000, 8000), e('card', '2026-11-06', '김밥천국', 140000, 14000),
      e('cash', '2026-11-18', '오피스디포', 55000, 5500), e('purchase_invoice', '2026-11-15', '(주)수출포장', 3000000, 300000, true)
    ];
    s.employees = [
      { id: uid('p'), name: '김대표', role: 'ceo', base: 4000000, allow: 0, meal: 200000, car: 0, family: 3 },
      { id: uid('p'), name: '이실무', role: 'employee', base: 3200000, allow: 100000, meal: 200000, car: 0, family: 2 },
      { id: uid('p'), name: '박주임', role: 'employee', base: 2600000, allow: 0, meal: 0, car: 200000, family: 1 }
    ];
    s.emp = { injury: '209', size: 0, month: '2026-11' };
    s.fx = [
      { id: uid('f'), docNo: '026-11-03-1234', date: '2026-11-03', partner: 'PT. MAJU JAYA', currency: 'USD', amount: 25000, shipRate: 1312.5, payDate: '2026-11-12', payRate: 1320 },
      { id: uid('f'), docNo: '026-11-18-5678', date: '2026-11-18', partner: 'GLOBAL RECYCLING LLC', currency: 'USD', amount: 18000, shipRate: 1325.4, payDate: '2026-12-05', payRate: 1318.2 }
    ];
    s.fxbal = [
      { id: uid('fb'), kind: '외화예금', currency: 'USD', amount: 45000, bookRate: 1318, closeRate: 1342.5 },
      { id: uid('fb'), kind: '미회수 채권', currency: 'USD', amount: 18000, bookRate: 1325.4, closeRate: 1342.5 },
      { id: uid('fb'), kind: '미지급 채무', currency: 'USD', amount: 12000, bookRate: 1310, closeRate: 1342.5 }
    ];
    s.inventory = [
      { id: uid('i'), item: 'PC 재생펠릿', spec: '블랙 · 3mm', qty: 12000, price: 850 },
      { id: uid('i'), item: 'HDPE 재생펠릿', spec: '천연색', qty: 8000, price: 1100 },
      { id: uid('i'), item: 'ABS 분쇄', spec: '혼합', qty: 2500, price: 1450 }
    ];
    s.inv = { open: 12000000 };
    return s;
  }

  function sampleEN() {
    var s = blank();
    s.entity = 'corp'; s.fy = '2026'; s.capital = 150000; s.cashOpen = 85000; s.taxRate = 7.25;
    var b = function (date, desc, ain, aout, account) { return { id: uid('t'), date: date, desc: desc, in: ain || 0, out: aout || 0, account: account || '', matchedEv: null, excluded: false, src: 'sample' }; };
    var e = function (type, date, partner, supply, vat, zero) { return { id: uid('e'), type: type, date: date, partner: partner, supply: supply, vat: vat, zero: !!zero, account: '', matchedTx: null, src: 'sample' }; };
    s.bank = [
      b('2026-11-02', 'Acme Plastics — invoice 1042', 171600, 0), b('2026-11-03', 'Pacific Recycling — PO 8871', 0, 101887.5),
      b('2026-11-05', 'Shell fuel', 0, 92.4, 'Vehicle expense'), b('2026-11-06', 'Chipotle team lunch', 0, 148, 'Employee benefits'),
      b('2026-11-09', 'Topgolf client meeting', 0, 310, 'Meals & entertainment'), b('2026-11-10', 'Payroll — November', 0, 15400, 'Payroll'),
      b('2026-11-12', 'Global Recycling LLC — export', 33000, 0, 'Export sales (zero-rated)'),
      b('2026-11-13', 'FedEx freight', 0, 640, 'Freight & delivery'), b('2026-11-16', 'US Customs duty', 0, 1850, 'Import & customs'),
      b('2026-11-18', 'Shareholder loan', 10000, 0, 'Shareholder loan'), b('2026-11-20', 'Verizon wireless', 0, 96.5, 'Telephone & internet'),
      b('2026-11-23', "Owner's draw", 0, 3000, "Owner's draw"), b('2026-11-24', '', 0, 1200, ''), b('2026-11-24', '', 2500, 0, '')
    ];
    s.evidence = [
      e('sales_invoice', '2026-09-30', 'Acme Plastics', 140000, 10150), e('sales_invoice', '2026-10-30', 'Acme Plastics', 150000, 10875),
      e('sales_invoice', '2026-11-02', 'Acme Plastics', 160000, 11600), e('purchase_invoice', '2026-09-28', 'Pacific Recycling', 80000, 5800),
      e('purchase_invoice', '2026-10-29', 'Green Resin Co', 88000, 6380), e('purchase_invoice', '2026-11-03', 'Pacific Recycling', 95000, 6887.5),
      e('card', '2026-11-05', 'Shell', 85.99, 6.41), e('card', '2026-11-06', 'Chipotle', 137.67, 10.33),
      e('cash', '2026-11-18', 'Office Depot', 57.67, 4.33), e('purchase_invoice', '2026-11-15', 'Export Packaging', 2800, 203, true)
    ];
    s.employees = [
      { id: uid('p'), name: 'James Park', role: 'ceo', base: 7000, allow: 0, meal: 0, car: 0, family: 2 },
      { id: uid('p'), name: 'Maria Lopez', role: 'employee', base: 4600, allow: 200, meal: 0, car: 0, family: 1 },
      { id: uid('p'), name: 'Danny Kim', role: 'employee', base: 3800, allow: 0, meal: 0, car: 0, family: 3 }
    ];
    s.emp = { injury: '905', size: 0, month: '2026-11' };
    s.fx = [
      { id: uid('f'), docNo: 'EXP-2026-0031', date: '2026-11-03', partner: 'Rhein Kunststoffe GmbH', currency: 'EUR', amount: 20000, shipRate: 1.082, payDate: '2026-11-12', payRate: 1.095 },
      { id: uid('f'), docNo: 'EXP-2026-0032', date: '2026-11-18', partner: 'Osaka Polymer KK', currency: 'JPY', amount: 2400000, shipRate: 0.0068, payDate: '2026-12-05', payRate: 0.00675 }
    ];
    s.fxbal = [
      { id: uid('fb'), kind: 'Foreign bank', currency: 'EUR', amount: 15000, bookRate: 1.08, closeRate: 1.095 },
      { id: uid('fb'), kind: 'Receivable', currency: 'EUR', amount: 20000, bookRate: 1.082, closeRate: 1.095 },
      { id: uid('fb'), kind: 'Payable', currency: 'JPY', amount: 2400000, bookRate: 0.0068, closeRate: 0.00675 }
    ];
    s.inventory = [
      { id: uid('i'), item: 'PCR pellet', spec: 'black 3mm', qty: 12000, price: 0.62 },
      { id: uid('i'), item: 'HDPE pellet', spec: 'natural', qty: 8000, price: 0.78 },
      { id: uid('i'), item: 'ABS regrind', spec: 'mixed', qty: 2500, price: 1.05 }
    ];
    s.inv = { open: 22000 };
    return s;
  }

  function sampleZH() {
    var s = blank();
    s.entity = 'corp'; s.fy = '2026'; s.capital = 500000; s.cashOpen = 260000; s.taxRate = 13;
    var b = function (date, desc, ain, aout, account) { return { id: uid('t'), date: date, desc: desc, in: ain || 0, out: aout || 0, account: account || '', matchedEv: null, excluded: false, src: 'sample' }; };
    var e = function (type, date, partner, supply, vat, zero) { return { id: uid('e'), type: type, date: date, partner: partner, supply: supply, vat: vat, zero: !!zero, account: '', matchedTx: null, src: 'sample' }; };
    s.bank = [
      b('2026-11-02', '上海大明塑料 货款', 158200, 0), b('2026-11-03', '江苏再生资源 原料款', 0, 96050),
      b('2026-11-05', '中石化加油', 0, 620, '车辆使用费'), b('2026-11-06', '员工工作餐', 0, 880, '职工福利费'),
      b('2026-11-09', '客户招待', 0, 2400, '业务招待费'), b('2026-11-10', '11月工资', 0, 36000, '工资薪金'),
      b('2026-11-12', '出口收汇 USD 33,000', 240000, 0, '出口销售（免税）'),
      b('2026-11-13', '顺丰运费', 0, 4600, '运输费'), b('2026-11-16', '海关关税及进口费用', 0, 12500, '进口费用'),
      b('2026-11-18', '股东借款', 50000, 0, '其他应付款—股东'), b('2026-11-20', '中国移动 话费', 0, 680, '通讯费'),
      b('2026-11-23', '股东个人使用', 0, 20000, '其他应收款—股东'), b('2026-11-24', '', 0, 8800, ''), b('2026-11-24', '', 15000, 0, '')
    ];
    s.evidence = [
      e('sales_invoice', '2026-09-30', '上海大明塑料', 120000, 15600), e('sales_invoice', '2026-10-30', '宁波华塑', 130000, 16900),
      e('sales_invoice', '2026-11-02', '上海大明塑料', 140000, 18200), e('purchase_invoice', '2026-09-28', '江苏再生资源', 68000, 8840),
      e('purchase_invoice', '2026-10-29', '浙江高分子', 76000, 9880), e('purchase_invoice', '2026-11-03', '江苏再生资源', 85000, 11050),
      e('card', '2026-11-05', '中石化', 548, 72), e('card', '2026-11-06', '食堂', 779, 101),
      e('cash', '2026-11-18', '得力文具', 265, 35), e('purchase_invoice', '2026-11-15', '出口包装', 30000, 3900, true)
    ];
    s.employees = [
      { id: uid('p'), name: '张伟', role: 'ceo', base: 18000, allow: 0, meal: 0, car: 0, family: 3 },
      { id: uid('p'), name: '李娜', role: 'employee', base: 10000, allow: 1000, meal: 0, car: 0, family: 1 },
      { id: uid('p'), name: '王强', role: 'employee', base: 8000, allow: 0, meal: 0, car: 0, family: 2 }
    ];
    s.emp = { injury: '905', size: 0, month: '2026-11' };
    s.fx = [
      { id: uid('f'), docNo: '3101-2026-0031', date: '2026-11-03', partner: 'PT. MAJU JAYA', currency: 'USD', amount: 25000, shipRate: 7.12, payDate: '2026-11-12', payRate: 7.18 },
      { id: uid('f'), docNo: '3101-2026-0032', date: '2026-11-18', partner: 'Osaka Polymer', currency: 'USD', amount: 18000, shipRate: 7.2, payDate: '2026-12-05', payRate: 7.15 }
    ];
    s.fxbal = [
      { id: uid('fb'), kind: '外币存款', currency: 'USD', amount: 45000, bookRate: 7.15, closeRate: 7.22 },
      { id: uid('fb'), kind: '应收外汇', currency: 'USD', amount: 18000, bookRate: 7.2, closeRate: 7.22 },
      { id: uid('fb'), kind: '应付外汇', currency: 'USD', amount: 12000, bookRate: 7.1, closeRate: 7.22 }
    ];
    s.inventory = [
      { id: uid('i'), item: '再生 PC 颗粒', spec: '黑色 3mm', qty: 12000, price: 5.2 },
      { id: uid('i'), item: 'HDPE 颗粒', spec: '本色', qty: 8000, price: 6.8 },
      { id: uid('i'), item: 'ABS 破碎料', spec: '混色', qty: 2500, price: 7.4 }
    ];
    s.inv = { open: 76000 };
    return s;
  }

  function sampleJA() {
    var s = blank();
    s.entity = 'corp'; s.fy = '2026'; s.capital = 5000000; s.cashOpen = 4200000; s.taxRate = 10;
    var b = function (date, desc, ain, aout, account) { return { id: uid('t'), date: date, desc: desc, in: ain || 0, out: aout || 0, account: account || '', matchedEv: null, excluded: false, src: 'sample' }; };
    var e = function (type, date, partner, supply, vat, zero) { return { id: uid('e'), type: type, date: date, partner: partner, supply: supply, vat: vat, zero: !!zero, account: '', matchedTx: null, src: 'sample' }; };
    s.bank = [
      b('2026-11-02', '大阪商事 売掛入金', 7910000, 0), b('2026-11-03', '東洋樹脂 仕入支払', 0, 3520000),
      b('2026-11-05', 'ENEOS 給油', 0, 8800, '車両費'), b('2026-11-06', '社内昼食', 0, 13200, '福利厚生費'),
      b('2026-11-09', '取引先接待', 0, 42000, '接待交際費'), b('2026-11-10', '11月給与', 0, 1310000, '給与'),
      b('2026-11-12', '輸出代金 USD 25,000', 3300000, 0, '輸出売上（免税）'),
      b('2026-11-13', 'ヤマト運輸 運賃', 0, 66000, '運賃'), b('2026-11-16', '税関 輸入諸費用', 0, 165000, '輸入諸費用'),
      b('2026-11-18', '代表者借入', 1000000, 0, '代表者借入金'), b('2026-11-20', 'NTT 通信費', 0, 7700, '通信費'),
      b('2026-11-23', '代表者 私的引出一部', 0, 300000, '代表者貸付金'), b('2026-11-24', '', 0, 110000, ''), b('2026-11-24', '', 300000, 0, '')
    ];
    s.evidence = [
      e('sales_invoice', '2026-09-30', '大阪商事', 6000000, 600000), e('sales_invoice', '2026-10-30', '大阪商事', 6500000, 650000),
      e('sales_invoice', '2026-11-02', '大阪商事', 7000000, 700000), e('purchase_invoice', '2026-09-28', '東洋樹脂', 2800000, 280000),
      e('purchase_invoice', '2026-10-29', '東洋樹脂', 3000000, 300000), e('purchase_invoice', '2026-11-03', '東洋樹脂', 3200000, 320000),
      e('card', '2026-11-05', 'ENEOS', 8000, 800), e('card', '2026-11-06', '仕出し', 12000, 1200),
      e('cash', '2026-11-18', 'オフィス用品', 5500, 550), e('purchase_invoice', '2026-11-15', '輸出梱包', 300000, 30000, true)
    ];
    s.employees = [
      { id: uid('p'), name: '山田 太郎', role: 'ceo', base: 600000, allow: 0, meal: 0, car: 0, family: 2 },
      { id: uid('p'), name: '佐藤 花子', role: 'employee', base: 300000, allow: 20000, meal: 0, car: 0, family: 1 },
      { id: uid('p'), name: '鈴木 一郎', role: 'employee', base: 240000, allow: 0, meal: 150000, car: 0, family: 3 }
    ];
    s.emp = { injury: '905', size: 0, month: '2026-11' };
    s.fx = [
      { id: uid('f'), docNo: 'EXP-2026-0031', date: '2026-11-03', partner: 'PT. MAJU JAYA', currency: 'USD', amount: 25000, shipRate: 150.2, payDate: '2026-11-12', payRate: 151.4 },
      { id: uid('f'), docNo: 'EXP-2026-0032', date: '2026-11-18', partner: 'GLOBAL RECYCLING LLC', currency: 'USD', amount: 18000, shipRate: 151.8, payDate: '2026-12-05', payRate: 151.1 }
    ];
    s.fxbal = [
      { id: uid('fb'), kind: '外貨預金', currency: 'USD', amount: 45000, bookRate: 151.0, closeRate: 152.3 },
      { id: uid('fb'), kind: '未回収債権', currency: 'USD', amount: 18000, bookRate: 151.8, closeRate: 152.3 },
      { id: uid('fb'), kind: '未払債務', currency: 'USD', amount: 12000, bookRate: 150.5, closeRate: 152.3 }
    ];
    s.inventory = [
      { id: uid('i'), item: '再生PCペレット', spec: '黒 3mm', qty: 12000, price: 95 },
      { id: uid('i'), item: 'HDPEペレット', spec: 'ナチュラル', qty: 8000, price: 120 },
      { id: uid('i'), item: 'ABS粉砕品', spec: '混合', qty: 2500, price: 160 }
    ];
    s.inv = { open: 1400000 };
    return s;
  }

  /* ---------------------------------------------------------- 백업 */
  function backup() {
    var blob = new Blob([JSON.stringify(state, null, 1)], { type: 'application/json' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'tax-backup_' + localStamp() + '.json';
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 900);
    flash(S.msgBackup);
  }

  /* ---------------------------------------------------------- 렌더 */
  function renderAll() {
    renderDash();
    renderLedger();
    renderPayroll();
    renderFX();
    renderClose();
  }

  function ensureRateField() {
    if (!$('#tx-taxrate') && P.taxEditable) {
      var host = $('.tx-actions');
      var note = $('#tx-entity-note');
      if (!host || !note) return;
      var wrap = document.createElement('div');
      wrap.className = 'tx-field';
      wrap.style.minWidth = '130px';
      wrap.innerHTML = '<label class="lbl" for="tx-taxrate">' + esc(S.rateLabel || 'Rate') + '</label>' +
        '<div class="unit"><input type="number" id="tx-taxrate" min="0" max="30" step="0.01"><span>%</span></div>';
      host.insertBefore(wrap, note);
      wrap.querySelector('input').addEventListener('change', function () {
        state.taxRate = num(this.value); save(); renderAll();
      });
    }
    var inp = $('#tx-taxrate');
    if (inp) inp.value = (state.taxRate == null ? P.taxRate * 100 : num(state.taxRate));
  }

  /* ---------------------------------------------------------- 이벤트 */
  function bind() {
    $('#tx-sample').addEventListener('click', function () {
      if ((state.bank || []).length && !window.confirm(S.confirmSample)) return;
      var doc = P.sample();
      Object.keys(doc).forEach(function (k) { state[k] = doc[k]; });
      autoMatch(); applySuggestions();
      save(); renderAll();
      if ($('#tx-taxrate')) $('#tx-taxrate').value = state.taxRate == null ? P.taxRate * 100 : state.taxRate;
      flash(S.msgSample);
    });
    $('#tx-reset').addEventListener('click', function () {
      if (!window.confirm(S.confirmReset)) return;
      var b = blank();
      Object.keys(b).forEach(function (k) { state[k] = b[k]; });
      save(); renderAll();
      flash(S.msgReset);
    });
    $('#tx-export-all').addEventListener('click', exportAll);

    $$('#tx-entity button').forEach(function (btn) {
      btn.addEventListener('click', function () {
        state.entity = btn.getAttribute('data-entity');
        save(); renderAll();
      });
    });
    var fy = $('#tx-fy');
    if (fy) fy.addEventListener('change', function () { state.fy = this.value; save(); renderAll(); });

    $('#tx-checks').addEventListener('change', function (ev) {
      var cb = ev.target.closest('input[data-check]');
      if (!cb) return;
      state.checks[cb.getAttribute('data-check')] = cb.checked;
      save(true);
      var col = cb.closest('.tx-check-col');
      var total = col.querySelectorAll('input[data-check]').length;
      var done = col.querySelectorAll('input[data-check]:checked').length;
      col.querySelector('.tx-progress i').style.width = Math.round(done / total * 100) + '%';
      col.querySelector('.tx-check-foot b').textContent = done + '/' + total;
    });

    $('#tx-bank-file').addEventListener('change', function () {
      var f = this.files && this.files[0]; if (!f) return;
      var r = new FileReader();
      r.onload = function () {
        var res = importBankCSV(decodeBuffer(r.result));
        if (res.error) { $('#tx-bank-msg').textContent = 'CSV columns not recognised'; return; }
        $('#tx-bank-msg').textContent = '+' + res.added;
        autoMatch(); save(); renderAll();
      };
      r.readAsArrayBuffer(f); this.value = '';
    });
    $('#tx-ev-file').addEventListener('change', function () {
      var f = this.files && this.files[0]; if (!f) return;
      var type = $('#tx-ev-type').value;
      var r = new FileReader();
      r.onload = function () {
        var res = importEvidenceCSV(decodeBuffer(r.result), type);
        if (res.error) { $('#tx-ev-msg').textContent = 'CSV columns not recognised'; return; }
        $('#tx-ev-msg').textContent = '+' + res.added;
        autoMatch(); save(); renderAll();
      };
      r.readAsArrayBuffer(f); this.value = '';
    });

    $('#tx-bm-toggle').addEventListener('click', function () {
      var f = $('#tx-bm-form'); f.hidden = !f.hidden;
      if (!f.hidden && !$('#tx-bm-date').value) $('#tx-bm-date').value = todayISO();
    });
    $('#tx-em-toggle').addEventListener('click', function () {
      var f = $('#tx-em-form'); f.hidden = !f.hidden;
      if (!f.hidden && !$('#tx-em-date').value) $('#tx-em-date').value = todayISO();
    });
    $('#tx-bm-form').addEventListener('submit', function (ev) {
      ev.preventDefault();
      var date = $('#tx-bm-date').value, ain = num($('#tx-bm-in').value), aout = num($('#tx-bm-out').value);
      if (!date || (!ain && !aout)) return flash('date and amount required', true);
      state.bank.push({ id: uid('t'), date: date, desc: $('#tx-bm-desc').value.trim(), in: ain, out: aout, account: '', matchedEv: null, excluded: false, src: 'manual' });
      this.reset(); save(); renderAll();
    });
    $('#tx-em-form').addEventListener('submit', function (ev) {
      ev.preventDefault();
      var date = $('#tx-em-date').value, supply = num($('#tx-em-supply').value), vat = num($('#tx-em-vat').value);
      if (!date || (!supply && !vat)) return flash('date and amount required', true);
      if (!vat && supply) vat = Math.round(supply * taxRate());
      state.evidence.push({ id: uid('e'), type: $('#tx-em-type').value, date: date, partner: $('#tx-em-partner').value.trim(), supply: supply, vat: vat, zero: $('#tx-em-zero').checked, account: '', matchedTx: null, src: 'manual' });
      this.reset(); save(); renderAll();
    });

    $('#tx-match').addEventListener('click', function () {
      var n = autoMatch(), sug = applySuggestions();
      save(); renderAll();
      flash(S.msgMatch + ' (' + n + ') · ' + S.msgSuggest + ' (' + sug + ')');
    });
    $('#tx-suggest').addEventListener('click', function () {
      var n = applySuggestions(); save(); renderAll();
      flash(S.msgSuggest + ' (' + n + ')');
    });

    $('#tx-bank-body').addEventListener('change', function (ev) {
      var sel = ev.target.closest('select[data-act="acct"]'); if (!sel) return;
      var id = sel.closest('tr').getAttribute('data-id');
      var t = (state.bank || []).filter(function (x) { return x.id === id; })[0];
      if (!t) return;
      t.account = sel.value; save(); renderAll();
    });
    $('#tx-bank-body').addEventListener('click', function (ev) {
      var b = ev.target.closest('button[data-act="del-tx"]'); if (!b) return;
      var id = b.closest('tr').getAttribute('data-id');
      state.bank = (state.bank || []).filter(function (x) { return x.id !== id; });
      save(); renderAll();
    });
    $('#tx-ev-body').addEventListener('change', function (ev) {
      var sel = ev.target.closest('select[data-act="ev-acct"]'); if (!sel) return;
      var id = sel.closest('tr').getAttribute('data-id');
      var e = (state.evidence || []).filter(function (x) { return x.id === id; })[0];
      if (!e) return;
      e.account = sel.value; save(); renderAll();
    });
    $('#tx-ev-body').addEventListener('click', function (ev) {
      var b = ev.target.closest('button[data-act="del-ev"]'); if (!b) return;
      var id = b.closest('tr').getAttribute('data-id');
      state.evidence = (state.evidence || []).filter(function (x) { return x.id !== id; });
      save(); renderAll();
    });

    $('#tx-unm').addEventListener('click', function (ev) {
      var b = ev.target.closest('button[data-act="cls"]'); if (!b) return;
      var id = b.closest('.tx-unm-row').getAttribute('data-id');
      var t = (state.bank || []).filter(function (x) { return x.id === id; })[0];
      if (!t) return;
      var v = b.getAttribute('data-v'), isIn = num(t.in) > 0;
      if (v === 'sales') { t.account = isIn ? P.acc.sales : P.acc.purchase; t.excluded = false; }
      else if (v === 'purchase') { t.account = P.acc.purchase; t.excluded = false; }
      else if (v === 'welfare') { t.account = P.accounts[12].name; t.excluded = false; }
      else if (v === 'entertain') { t.account = P.accounts[13].name; t.excluded = false; }
      else if (v === 'owner') { t.account = isIn ? P.acc.ownerDeposit : P.acc.ownerLoan; t.excluded = false; }
      else if (v === 'exclude') { t.excluded = true; t.account = P.acc.excluded; }
      t.handled = true;
      save(); renderAll();
    });

    $('#tx-emp-add').addEventListener('click', function () {
      state.employees.push({ id: uid('p'), name: '', role: 'employee', base: 0, allow: 0, meal: 0, car: 0, family: 1 });
      save(); renderAll();
      var rows = $$('#tx-emp-body tr'), last = rows[rows.length - 1];
      var inp = last && last.querySelector('input[data-f="name"]');
      if (inp) inp.focus();
    });
    $('#tx-emp-body').addEventListener('input', function (ev) {
      var inp = ev.target.closest('[data-f]'); if (!inp) return;
      var i = parseInt(inp.closest('tr').getAttribute('data-i'), 10);
      var emp = state.employees[i]; if (!emp) return;
      var f = inp.getAttribute('data-f');
      emp[f] = (f === 'name' || f === 'role') ? inp.value : num(inp.value);
      save(true); renderPayResults();
    });
    $('#tx-emp-body').addEventListener('change', function (ev) {
      if (ev.target.closest('[data-f]')) { save(); renderAll(); }
    });
    $('#tx-emp-body').addEventListener('click', function (ev) {
      var b = ev.target.closest('button[data-act="del-emp"]'); if (!b) return;
      state.employees.splice(parseInt(b.closest('tr').getAttribute('data-i'), 10), 1);
      save(); renderAll();
    });
    if ($('#tx-injury')) $('#tx-injury').addEventListener('change', function () { state.emp.injury = this.value; save(); renderAll(); });
    if ($('#tx-size')) $('#tx-size').addEventListener('change', function () { state.emp.size = parseInt(this.value, 10) || 0; save(); renderAll(); });
    if ($('#tx-pay-month')) $('#tx-pay-month').addEventListener('change', function () { state.emp.month = this.value; save(); renderAll(); });

    $('#tx-fx-add').addEventListener('click', function () {
      state.fx.push({ id: uid('f'), docNo: '', date: todayISO(), partner: '', currency: 'USD', amount: 0, shipRate: 0, payDate: '', payRate: 0 });
      save(); renderAll();
    });
    $('#tx-fxbal-add').addEventListener('click', function () {
      state.fxbal.push({ id: uid('fb'), kind: S.fxKinds[0], currency: 'USD', amount: 0, bookRate: 0, closeRate: 0 });
      save(); renderAll();
    });
    $('#tx-fx-body').addEventListener('input', function (ev) {
      var inp = ev.target.closest('[data-f]'); if (!inp) return;
      var x = state.fx[parseInt(inp.closest('tr').getAttribute('data-i'), 10)]; if (!x) return;
      var f = inp.getAttribute('data-f');
      x[f] = (f === 'docNo' || f === 'date' || f === 'payDate' || f === 'currency' || f === 'partner') ? inp.value : num(inp.value);
      save(true); updateFxTotals();
    });
    $('#tx-fx-body').addEventListener('change', function (ev) { if (ev.target.closest('[data-f]')) { save(); renderAll(); } });
    $('#tx-fx-body').addEventListener('click', function (ev) {
      var b = ev.target.closest('button[data-act="del-fx"]'); if (!b) return;
      state.fx.splice(parseInt(b.closest('tr').getAttribute('data-i'), 10), 1);
      save(); renderAll();
    });
    $('#tx-fxbal-body').addEventListener('input', function (ev) {
      var inp = ev.target.closest('[data-f]'); if (!inp) return;
      var x = state.fxbal[parseInt(inp.closest('tr').getAttribute('data-i'), 10)]; if (!x) return;
      var f = inp.getAttribute('data-f');
      x[f] = (f === 'kind' || f === 'currency') ? inp.value : num(inp.value);
      save(true); updateFxTotals();
    });
    $('#tx-fxbal-body').addEventListener('change', function (ev) { if (ev.target.closest('[data-f]')) { save(); renderAll(); } });
    $('#tx-fxbal-body').addEventListener('click', function (ev) {
      var b = ev.target.closest('button[data-act="del-fxbal"]'); if (!b) return;
      state.fxbal.splice(parseInt(b.closest('tr').getAttribute('data-i'), 10), 1);
      save(); renderAll();
    });

    $('#tx-inv-add').addEventListener('click', function () {
      state.inventory.push({ id: uid('i'), item: '', spec: '', qty: 0, price: 0 });
      save(); renderAll();
    });
    $('#tx-inv-body').addEventListener('input', function (ev) {
      var inp = ev.target.closest('[data-f]'); if (!inp) return;
      var it = state.inventory[parseInt(inp.closest('tr').getAttribute('data-i'), 10)]; if (!it) return;
      var f = inp.getAttribute('data-f');
      it[f] = (f === 'item' || f === 'spec') ? inp.value : num(inp.value);
      save(true);
      var tr = inp.closest('tr'), amt = tr.querySelectorAll('td')[4];
      if (amt) amt.textContent = P.money(num(it.qty) * num(it.price));
      if ($('#tx-inv-foot')) $('#tx-inv-foot').innerHTML = '<tr><td colspan="4">' + esc(S.invTotal) + '</td><td class="n">' + P.money(inventoryValue()) + '</td><td></td></tr>';
      if ($('#tx-inv-end')) $('#tx-inv-end').value = Math.round(inventoryValue());
    });
    $('#tx-inv-body').addEventListener('change', function (ev) { if (ev.target.closest('[data-f]')) { save(); renderAll(); } });
    $('#tx-inv-body').addEventListener('click', function (ev) {
      var b = ev.target.closest('button[data-act="del-inv"]'); if (!b) return;
      state.inventory.splice(parseInt(b.closest('tr').getAttribute('data-i'), 10), 1);
      save(); renderAll();
    });
    if ($('#tx-inv-open')) $('#tx-inv-open').addEventListener('change', function () { state.inv.open = num(this.value); save(); renderAll(); });
    if ($('#tx-cash-open')) $('#tx-cash-open').addEventListener('change', function () { state.cashOpen = num(this.value); save(); renderAll(); });
    if ($('#tx-capital')) $('#tx-capital').addEventListener('change', function () { state.capital = num(this.value); save(); renderAll(); });

    $('#tx-ap-body').addEventListener('change', function (ev) {
      var cb = ev.target.closest('input[data-act="confirm-ap"]'); if (!cb) return;
      state.apConfirm[cb.getAttribute('data-key')] = cb.checked; save(true);
    });

    $$('#tx-steps button').forEach(function (b) {
      b.addEventListener('click', function () {
        var step = b.getAttribute('data-step');
        $$('#tx-steps button').forEach(function (x) { x.setAttribute('aria-selected', String(x === b)); });
        $$('.tx-step-panel').forEach(function (p) { p.hidden = p.getAttribute('data-panel') !== step; });
      });
    });
    $('#tx-close-run').addEventListener('click', function () {
      save(); renderAll();
      flash(S.printClose);
      var el = $('#tx-close'); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    document.addEventListener('click', function (ev) {
      var ex = ev.target.closest('[data-export]');
      if (ex) { exportCSV(ex.getAttribute('data-export')); return; }
      var pr = ev.target.closest('[data-print]');
      if (pr) { doPrint(pr.getAttribute('data-print')); }
    });

    $('#tx-backup').addEventListener('click', backup);
    $('#tx-restore-file').addEventListener('change', function () {
      var f = this.files && this.files[0]; if (!f) return;
      var r = new FileReader();
      r.onload = function () {
        try {
          var doc = JSON.parse(r.result);
          Object.keys(doc).forEach(function (k) { if (doc[k] !== null && doc[k] !== undefined) state[k] = doc[k]; });
          ['bank', 'evidence', 'employees', 'fx', 'fxbal', 'inventory'].forEach(function (k) { if (!Array.isArray(state[k])) state[k] = []; });
          state.emp = Object.assign({ injury: '905', size: 0, month: todayISO().slice(0, 7) }, doc.emp || {});
          state.inv = Object.assign({ open: 0 }, doc.inv || {});
          state.checks = doc.checks || {}; state.apConfirm = doc.apConfirm || {};
          save(); renderAll(); flash(S.msgRestored);
        } catch (e) { flash(S.msgRestoreFail, true); }
      };
      r.readAsText(f); this.value = '';
    });

    var sections = $$('section.tx-sec'), links = $$('.tx-jump a');
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (ents) {
        ents.forEach(function (en) {
          if (!en.isIntersecting) return;
          links.forEach(function (a) { a.classList.toggle('on', a.getAttribute('href') === '#' + en.target.id); });
        });
      }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
      sections.forEach(function (s) { io.observe(s); });
    }
  }

  function updateFxTotals() {
    var fx = state.fx || [], total = fx.reduce(function (a, x) { return a + fxGain(x); }, 0);
    $$('#tx-fx-body tr').forEach(function (tr, i) {
      var x = fx[i]; if (!x) return;
      var g = fxGain(x), cell = tr.querySelectorAll('td')[7];
      if (cell) { cell.textContent = (g > 0 ? '+' : '') + P.money(g); cell.className = 'n ' + (g >= 0 ? 'pos' : 'neg'); }
    });
    var foot = $('#tx-fx-foot');
    if (foot && fx.length) {
      var base = fx.reduce(function (a, x) { return a + num(x.amount) * num(x.shipRate); }, 0);
      foot.innerHTML = '<tr><td colspan="3">' + esc(S.fxFoot) + '</td><td class="n">' + nf(base) + '</td><td colspan="3"></td>' +
        '<td class="n ' + (total >= 0 ? 'pos' : 'neg') + '">' + (total > 0 ? '+' : '') + P.money(total) + '</td><td></td></tr>';
    }
    var bal = state.fxbal || [], tot = bal.reduce(function (a, x) { return a + fxbalGain(x); }, 0);
    $$('#tx-fxbal-body tr').forEach(function (tr, i) {
      var x = bal[i]; if (!x) return;
      var g = fxbalGain(x), cells = tr.querySelectorAll('td');
      if (cells[7]) { cells[7].textContent = (g > 0 ? '+' : '') + P.money(g); cells[7].className = 'n ' + (g >= 0 ? 'pos' : 'neg'); }
      if (cells[5]) cells[5].textContent = P.money(Math.round(num(x.amount) * num(x.bookRate)));
      if (cells[6]) cells[6].textContent = P.money(Math.round(num(x.amount) * num(x.closeRate)));
    });
    var foot2 = $('#tx-fxbal-foot');
    if (foot2 && bal.length) {
      foot2.innerHTML = '<tr><td colspan="7">' + esc(S.fxBalFoot) + '</td><td class="n ' + (tot >= 0 ? 'pos' : 'neg') + '">' + (tot > 0 ? '+' : '') + P.money(tot) + '</td><td></td></tr>';
    }
  }

  /* ---------------------------------------------------------- 시작 */
  function init() {
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) {
        var doc = JSON.parse(raw);
        Object.keys(doc).forEach(function (k) { if (doc[k] !== null && doc[k] !== undefined) state[k] = doc[k]; });
        ['bank', 'evidence', 'employees', 'fx', 'fxbal', 'inventory'].forEach(function (k) { if (!Array.isArray(state[k])) state[k] = []; });
        state.emp = Object.assign({ injury: '905', size: 0, month: todayISO().slice(0, 7) }, doc.emp || {});
        state.inv = Object.assign({ open: 0 }, doc.inv || {});
        state.checks = doc.checks || {}; state.apConfirm = doc.apConfirm || {};
      }
    } catch (e) { }

    if ($('#tx-fy')) $('#tx-fy').value = state.fy;
    if ($('#tx-pay-month') && !$('#tx-pay-month').value) $('#tx-pay-month').value = state.emp.month || todayISO().slice(0, 7);
    if ($('#tx-inv-open')) $('#tx-inv-open').value = num(state.inv.open) || 0;
    fillSetup();
    ensureRateField();
    renderAll();
    bind();
    if (!$('#tx-taxrate')) ensureRateField();
    var s = $('#tx-save');
    if (s && !localStorage.getItem(KEY)) s.textContent = S.msgEmptySave || s.textContent;
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
