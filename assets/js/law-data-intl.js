/* =========================================================
   법률·판례 정보 리포트 — 국가별 데이터 (US · CN · JP)
   · /en/ · /zh/ · /ja/ 페이지는 각 국가의 실제 법체계·공식 사이트를 사용합니다.
   · 조문은 공식 출처(LII/US Code, 国家法律法规数据库, e-Gov)에서 확인한 것만 담았습니다.
   ========================================================= */
window.LAW_DB = window.LAW_DB || {};

/* ---------------------------------------------------------
   UNITED STATES — Business & Contract Law Reference
   --------------------------------------------------------- */
window.LAW_DB.en = {
  locale: 'en',
  htmlLang: 'en',
  brand: 'INSIGHT BRIEF',
  official: 'https://www.law.cornell.edu/',
  officialName: 'Cornell LII / U.S. Code',
  courtName: 'U.S. Courts',
  court: 'https://www.uscourts.gov/',

  ui: {
    tabReport: 'Case report',
    tabLibrary: 'Statutes',
    tabSearch: 'Case law & search',
    tabGuide: 'Integration guide',
    areaTitle: 'Four practice areas',
    areaHint: 'Pick an area to load example facts and the matching statute set.',
    inputLabel: 'Describe the dispute in your own words',
    inputHint: 'Dates, amounts, parties and what you already did make the report specific.',
    analyze: 'Extract issue keywords',
    generate: 'Build 4-part report',
    example: 'Example',
    clear: 'Clear',
    print: 'Print A4 PDF',
    copyMd: 'Copy Markdown',
    kwTitle: 'Extracted issue keywords',
    part1: 'Case summary and key issues',
    part2: 'Verified statutory authority',
    part3: 'Decision standards and checkpoints',
    part4: 'Practical response sequence',
    expand: 'Read the text',
    openLaw: 'Source',
    openCourt: 'Case search',
    note: 'Text is as checked at the date shown. Always confirm against the official source.',
    libraryTitle: 'Statute library',
    libraryHint: 'Every provision below was checked against its official source. Expand a section for the text, then open the official link.',
    libSearch: 'Search by statute, section or keyword (e.g. 2-725, overtime, notice)',
    searchTitle: 'Case law and statute search',
    searchHint: 'Keyword buttons open official case search in a new tab. Cite only docket numbers you actually found.',
    courtHint: 'Search U.S. Courts and your state court system for decisions; confirm the citation before relying on it.',
    copy: 'Copy',
    emptyArea: 'No issue keywords matched. Add amounts, deadlines or party roles and try again.',
    matched: 'Matched area',
    guideline: 'This is the usual order of steps. It varies by state and contract, and litigation or collection steps usually need a licensed attorney in that state.',
    footerNote: 'This report is general legal information, not legal advice, and does not create an attorney-client relationship.'
  },

  guide: {
    title: 'Open data and RAG integration guide (US)',
    lead: 'This page is a <b>static open book</b>: the provisions were checked and stored in advance. To widen coverage later, connect an official source to a server or no-code stack (Dify, GPTs). Notes below reflect what was verified while building this page.',
    steps: [
      'Primary sources are <b>law.cornell.edu (LII)</b> for UCC and U.S. Code text, <b>uscode.house.gov</b> for the official Code, and <b>govinfo.gov</b> for public-domain bulk data and its API.',
      'The <b>UCC is a model act</b>, not federal law: each state adopts its own version, and Louisiana adopts Article 2 only in part. Always state the adopting jurisdiction with the section number.',
      'State law governs contract limitations periods, prejudgment interest, security deposits and small-claims limits. Pull the current statute from the state legislature site, not from a summary blog.',
      'For wage claims, the federal floor is the FLSA; states and cities often set a higher minimum wage and shorter final-pay deadlines, which control when more protective.',
      'In a RAG prompt, force an <b>open-book</b> rule: "Answer only from the retrieved provisions; if the provision is not in the context, say it is not confirmed."',
      'Require every answer to print statute name, section, jurisdiction and a source link. Never let the model generate docket numbers; cite only search results you opened.'
    ],
    stackTitle: 'Suggested stack',
    stack: [
      ['Collect', 'LII / U.S. Code pages, govinfo API, state legislature sites'],
      ['Store', 'Section-level vector store with jurisdiction + effective-date metadata'],
      ['Generate', 'Dify / GPTs / own server with an open-book prompt'],
      ['Verify', 'Auto-attach section + jurisdiction link, block uncited docket numbers'],
      ['Deploy', 'Static page + serverless function for live lookups']
    ],
    promptTitle: 'System prompt skeleton',
    prompt: `You are a legal information tool for U.S. business disputes. Follow these rules.
1. Use only the provisions in <retrieved>. If a point is not covered, answer "not confirmed".
2. Cite statute name, section, adopting jurisdiction and a source link for every rule.
3. Never invent docket numbers, court names or dates. Cite case law only from search results provided.
4. Open and close with: this is general information, not legal advice.
5. Recommend a licensed attorney in the relevant state for litigation, collection or criminal exposure.`,
    apiTitle: 'Verified source endpoints',
    api: `# UCC Article 2 (model text, Cornell LII)
https://www.law.cornell.edu/ucc/2/2-725

# U.S. Code section (Cornell LII)
https://www.law.cornell.edu/uscode/text/29/207

# Official Code / bulk data
https://uscode.house.gov/
https://www.govinfo.gov/`,
    caution: 'Check the adopting state version before quoting a UCC section as binding. Keep API keys server-side; a static page should carry pre-verified text like this one.'
  },

  areas: [
    {
      id: 'debt', no: '01',
      name: 'Receivables & collection',
      short: 'Unpaid invoices, demand letters',
      desc: 'From a past-due invoice to demand letter, small claims and prejudgment interest.',
      kw: ['invoice', 'unpaid', 'receivable', 'collection', 'demand letter', 'past due'],
      keywords: ['invoice', 'unpaid', 'nonpayment', 'past due', 'receivable', 'accounts receivable', 'collection', 'demand letter', 'small claims', 'statute of limitations', 'interest', 'purchase order', 'net 30', 'breach of contract', 'goods', 'seller', 'buyer', 'lien'],
      issues: ['When payment was due and whether the deadline passed', 'Whether a contract, PO or invoice fixes the amount', 'How much of the limitations period remains', 'Whether the debtor has assets or is winding down', 'Whether a guarantee, security interest or lien exists'],
      checks: [
        ['Is the amount certain?', 'An invoice plus a purchase order or delivery proof supports a liquidated claim.'],
        ['Did the payment obligation mature?', 'No stated due date means payment is due on demand or within a reasonable time.'],
        ['Limitations period', 'For sale of goods, UCC § 2-725 sets four years from accrual; states may treat other contract claims differently.'],
        ['Evidence', 'PO, signed delivery receipts, invoices, bank records, email and text chasing payment.'],
        ['Asset information', 'Suit is only worth it with collectible assets; check liens and business status first.'],
        ['Guarantee or security', 'A personal guarantee or UCC-1 filing widens who and what you can pursue.']
      ],
      steps: [
        { n: '1', t: 'Assemble evidence', d: 'Collect the contract, purchase order, invoices, delivery proof and payment history; total the principal and interest claimed.', tip: 'A signed delivery receipt is the strongest single document.' },
        { n: '2', t: 'Demand letter', d: 'Send a written demand stating the amount, the basis and a firm deadline before suit.', tip: 'Send it trackable; keep a copy and the delivery record.' },
        { n: '3', t: 'Small claims or civil suit', d: 'Small claims handles lower-value claims with simplified procedure; above the limit, file in the appropriate civil court.', tip: 'Limits and forms are set by each state court.' },
        { n: '4', t: 'Judgment and collection', d: 'After judgment, enforce it: garnishment, lien, or a judgment debtor examination.', tip: 'Judgments expire; check renewal rules in the rendering state.' }
      ],
      examples: [
        { t: 'Unpaid resin invoices, $38,000', b: 'We shipped plastic resin from September 2025. The buyer stopped paying the August 2026 invoices — $38,000 total. Invoices and signed delivery receipts exist, and the purchase order states net 30. The buyer replies "cash flow problems" but keeps ordering.' },
        { t: 'Bad check from a reseller', b: 'A reseller paid a $12,000 invoice with a check that bounced in October 2026. We have the invoice, the returned check and the delivery record; the company still operates from one office.' }
      ],
      statutes: ['ucc2-725', 'ucc2-607', 'ucc2-703', 'ucc2-711', 'ucc2-718'],
      search: ['UCC 2-725 statute of limitations', 'demand letter breach of contract', 'small claims court limits', 'prejudgment interest state'],
      forms: []
    },
    {
      id: 'labor', no: '02',
      name: 'Wage & hour',
      short: 'Overtime, final pay, termination',
      desc: 'FLSA minimum wage and overtime, final paycheck timing, termination paperwork.',
      kw: ['wage', 'overtime', 'unpaid wages', 'final paycheck', 'termination'],
      keywords: ['wage', 'wages', 'overtime', 'minimum wage', 'unpaid wages', 'final paycheck', 'last paycheck', 'misclassification', 'independent contractor', 'exempt', 'nonexempt', 'tip credit', 'break', 'meal period', 'termination', 'wrongful termination', 'retaliation', 'severance', 'PTO payout'],
      issues: ['Employee or independent contractor under the economic reality test', 'Hours worked and whether overtime was paid at 1.5×', 'When the final paycheck was due under state law', 'Whether the employer is covered by the FLSA', 'Whether retaliation or discrimination is also in play'],
      checks: [
        ['Coverage', 'FLSA applies to enterprises with at least $500,000 in annual sales or to employees engaged in interstate commerce.'],
        ['Regular rate', 'Overtime is 1.5× the regular rate, which includes non-discretionary bonuses and shift differentials.'],
        ['Time records', 'Timesheets, schedules, badges, emails and messages showing work performed off the clock.'],
        ['Final pay deadline', 'Set by state law — often the next regular payday or within days of separation.'],
        ['Misclassification', 'Job duties and control matter more than the label or a 1099.'],
        ['Limitations', 'FLSA claims generally reach back two years, or three years for willful violations.']
      ],
      steps: [
        { n: '1', t: 'Reconstruct hours', d: 'Build a week-by-week record of hours worked and amounts paid from timesheets and pay stubs.', tip: 'A simple spreadsheet by pay period is enough to start.' },
        { n: '2', t: 'Written demand', d: 'Send the employer an itemized demand with a deadline before filing anything.', tip: 'Keep it factual: dates, hours, rate, amount owed.' },
        { n: '3', t: 'Agency complaint', d: 'File with the U.S. Department of Labor Wage and Hour Division and/or the state labor agency.', tip: 'Agency filing is free and often faster than court.' },
        { n: '4', t: 'Private action', d: 'FLSA § 216(b) allows a private suit for unpaid wages plus an equal amount as liquidated damages.', tip: 'Some states add penalties; check state law too.' }
      ],
      examples: [
        { t: 'Unpaid overtime for 6 months', b: 'A warehouse lead worked 52 hours a week from March to September 2026 and was paid straight time for every hour. Pay stubs show the hours; the employer says he was "salaried management" but he clocked in and had no authority to hire.' },
        { t: 'Final paycheck withheld', b: 'After resigning with two weeks notice in October 2026, the final paycheck and 40 hours of accrued PTO were not paid. The state requires final pay on the next regular payday.' }
      ],
      statutes: ['flsa-206', 'flsa-207', 'ucc2-725'],
      search: ['FLSA overtime regular rate', 'misclassification economic reality test', 'final paycheck state law', 'liquidated damages 216(b)'],
      forms: []
    },
    {
      id: 'lease', no: '03',
      name: 'Commercial lease',
      short: 'Deposits, renewal, possession',
      desc: 'Security deposits, holdover, renewal options and lease disputes under state law.',
      kw: ['lease', 'security deposit', 'commercial lease', 'renewal', 'holdover', 'landlord'],
      keywords: ['lease', 'commercial lease', 'security deposit', 'landlord', 'tenant', 'renewal', 'option to renew', 'holdover', 'eviction', 'CAM charges', 'operating expenses', 'assignment', 'sublease', 'repair', 'maintenance', 'default', 'notice to cure', 'rent'],
      issues: ['What the lease says about deposit return and deductions', 'Whether renewal was properly exercised and when notice was due', 'Whether CAM or operating expense charges are supported', 'Whether a default was cured within the notice period', 'Whether state commercial-lease rules override the form'],
      checks: [
        ['Deposit terms', 'Look for the return deadline, itemization requirement and permitted deductions.'],
        ['Renewal mechanics', 'Options usually require written notice by a stated date; late notice can forfeit the option.'],
        ['CAM reconciliation', 'Ask for the annual reconciliation, the base year and audit rights.'],
        ['Notice and cure', 'Most leases require written notice and a cure period before termination.'],
        ['State overlay', 'Security deposit, holdover and eviction procedure are state and local law, not the lease alone.'],
        ['Assignment', 'Landlord consent standards are usually in the lease; unreasonable withholding may be limited.']
      ],
      steps: [
        { n: '1', t: 'Lease audit', d: 'Read the deposit, maintenance, renewal and default clauses and note every notice deadline.', tip: 'Put deadlines on a calendar; options are lost by silence.' },
        { n: '2', t: 'Written notice', d: 'Send written notice of the claim or cure, referencing the clause and the deadline.', tip: 'Follow the lease notice method exactly — email may not count.' },
        { n: '3', t: 'Negotiation or mediation', d: 'Most commercial lease disputes settle on a reconciliation or a move-out schedule.', tip: 'Offer an itemized settlement with a payment date.' },
        { n: '4', t: 'Court', d: 'File for deposit return or defend an eviction action in the local court with jurisdiction.', tip: 'Eviction timelines are short; respond immediately.' }
      ],
      examples: [
        { t: 'Security deposit not returned', b: 'We vacated a retail unit in September 2026. The lease required return of the $20,000 deposit within 30 days with an itemized statement; nothing arrived and calls are ignored.' },
        { t: 'Renewal option missed', b: 'The lease gave a five-year renewal option if written notice was given by June 30, 2026. The tenant emailed on July 3 asking to renew; the landlord refuses and markets the space.' }
      ],
      statutes: ['ucc2-725'],
      search: ['commercial security deposit return state law', 'holdover tenant commercial lease', 'CAM reconciliation dispute', 'option to renew notice'],
      forms: []
    },
    {
      id: 'trade', no: '04',
      name: 'Contracts & liquidated damages',
      short: 'Breach, notice, remedy',
      desc: 'Delivery failure, non-conforming goods, notice of breach and liquidated damages.',
      kw: ['contract', 'delivery', 'liquidated damages', 'non-conforming', 'breach', 'inspection'],
      keywords: ['contract', 'shipment', 'delivery', 'late delivery', 'liquidated damages', 'penalty', 'non-conforming', 'defect', 'inspection', 'acceptance', 'rejection', 'cover', 'incoterms', 'force majeure', 'cure', 'warranty', 'freight', 'bill of lading'],
      issues: ['Which contract terms and Incoterms govern delivery and risk', 'Whether the goods conformed and whether notice was timely', 'Whether the buyer accepted the goods and lost rejection rights', 'Whether liquidated damages are enforceable or a penalty', 'What remedy fits: cover, price reduction, damages or cancellation'],
      checks: [
        ['The contract', 'Confirm the PO, the confirmation, the Incoterms and any signed amendment all match.'],
        ['Notice of breach', 'UCC § 2-607(3) requires notice within a reasonable time after discovery, or remedies are barred.'],
        ['Acceptance', 'Acceptance precludes rejection but keeps damages; revocation requires a non-conformity that substantially impairs value.'],
        ['Liquidated damages', 'Under UCC § 2-718 a term must be reasonable; an unreasonably large sum is void as a penalty.'],
        ['Cover', 'A buyer who covers in good faith can recover the difference between cover price and contract price.'],
        ['Limitations', 'Four years from accrual under UCC § 2-725; warranty claims accrue on tender of delivery.']
      ],
      steps: [
        { n: '1', t: 'Document the contract', d: 'Assemble the PO, contract, Incoterms, bill of lading, invoice, packing list and inspection report.', tip: 'Keep the original shipping documents; they fix dates.' },
        { n: '2', t: 'Notice and cure', d: 'Send written notice of the non-conformity or delay and demand cure within a stated period.', tip: 'Late notice is the most common way buyers lose the claim.' },
        { n: '3', t: 'Claim the remedy', d: 'Claim cover damages, price reduction or liquidated damages, and state that all remedies are reserved.', tip: 'Cancellation does not waive damages.' },
        { n: '4', t: 'Litigation or arbitration', d: 'Check the forum clause: court, arbitration or small claims, and the governing law.', tip: 'Cross-border claims usually turn on the governing-law clause.' }
      ],
      examples: [
        { t: 'Late shipment, liquidated damages', b: 'A 20-ton resin shipment under a June 2026 contract shipped eight weeks late. The contract sets liquidated damages at 0.5% of the contract value per week, capped at 5%. We covered the shortfall at an extra $9,000.' },
        { t: 'Non-conforming goods', b: 'The October delivery exceeded the contractual moisture limit. We notified the seller in early November; the seller says the inspection window had closed.' }
      ],
      statutes: ['ucc2-607', 'ucc2-703', 'ucc2-711', 'ucc2-718', 'ucc2-725'],
      search: ['UCC 2-607 notice of breach', 'liquidated damages penalty UCC 2-718', 'cover damages 2-712', 'Incoterms risk of loss'],
      forms: []
    }
  ],

  laws: {
    'UCC Article 2': { full: 'Uniform Commercial Code Article 2 — Sale of Goods (model act)', eff: 'Adopted with variations by each state; Louisiana only in part', url: 'https://www.law.cornell.edu/ucc/2' },
    'FLSA': { full: 'Fair Labor Standards Act, 29 U.S.C. ch. 8', eff: 'Current U.S. Code', url: 'https://www.law.cornell.edu/uscode/text/29/chapter-8' }
  },

  statutes: [
    { id: 'ucc2-725', law: 'UCC Article 2', art: '§ 2-725', t: 'Statute of limitations in contracts for sale', b: '(1) An action for breach of any contract for sale must be commenced within four years after the cause of action has accrued. By the original agreement the parties may reduce the period of limitation to not less than one year but may not extend it. (2) A cause of action accrues when the breach occurs, regardless of the aggrieved party\'s lack of knowledge of the breach. A breach of warranty occurs when tender of delivery is made, except where a warranty explicitly extends to future performance of the goods.' },
    { id: 'ucc2-607', law: 'UCC Article 2', art: '§ 2-607', t: 'Effect of acceptance; notice of breach', b: '(3) Where a tender has been accepted (a) the buyer must within a reasonable time after he discovers or should have discovered any breach notify the seller of breach or be barred from any remedy; and (b) if the claim is one for infringement or the like and the buyer is sued as a result of such a breach he must so notify the seller within a reasonable time after he receives notice of the litigation or be barred from any remedy over for liability established by the litigation. (4) The burden is on the buyer to establish any breach with respect to the goods accepted.' },
    { id: 'ucc2-703', law: 'UCC Article 2', art: '§ 2-703', t: "Seller's remedies in general", b: 'Where the buyer wrongfully rejects or revokes acceptance of goods or fails to make a payment due on or before delivery or repudiates with respect to a part or the whole, then with respect to any goods directly affected and, if the breach is of the whole contract (§ 2-612), then also with respect to the whole undelivered balance, the aggrieved seller may (a) withhold delivery of such goods; (b) stop delivery by any bailee; (c) proceed under the next section respecting goods still unidentified to the contract; (d) resell and recover damages; (e) recover damages for non-acceptance or in a proper case the price; (f) cancel.' },
    { id: 'ucc2-711', law: 'UCC Article 2', art: '§ 2-711', t: "Buyer's remedies in general", b: '(1) Where the seller fails to make delivery or repudiates or the buyer rightfully rejects or justifiably revokes acceptance then with respect to any goods involved, and with respect to the whole if the breach goes to the whole contract, the buyer may cancel and whether or not he has done so may in addition to recovering so much of the price as has been paid (a) "cover" and have damages under the next section as to all the goods affected; or (b) recover damages for non-delivery.' },
    { id: 'ucc2-718', law: 'UCC Article 2', art: '§ 2-718', t: 'Liquidation or limitation of damages; deposits', b: '(1) Damages for breach by either party may be liquidated in the agreement but only at an amount which is reasonable in the light of the anticipated or actual harm caused by the breach, the difficulties of proof of loss, and the inconvenience or nonfeasibility of otherwise obtaining an adequate remedy. A term fixing unreasonably large liquidated damages is void as a penalty. (2) Where the seller justifiably withholds delivery because of the buyer\'s breach, the buyer is entitled to restitution of any amount by which his payments exceed the liquidated amount or, absent such terms, twenty per cent of the value of total performance or $500, whichever is smaller.' },
    { id: 'flsa-206', law: 'FLSA', art: '29 U.S.C. § 206', t: 'Minimum wage', b: '(a)(1) Every employer shall pay to each of his employees who in any workweek is engaged in commerce or in the production of goods for commerce, or is employed in an enterprise engaged in commerce or in the production of goods for commerce, wages at the following rates: not less than $7.25 an hour (federal floor, phased in from 2007). Many states and localities set a higher minimum wage.' },
    { id: 'flsa-207', law: 'FLSA', art: '29 U.S.C. § 207', t: 'Maximum hours (overtime)', b: '(a) Except as otherwise provided in this section, no employer shall employ any of his employees who in any workweek is engaged in commerce or in the production of goods for commerce, or is employed in an enterprise engaged in commerce or in the production of goods for commerce, for a workweek longer than forty hours unless such employee receives compensation for his employment in excess of the hours above specified at a rate not less than one and one-half times the regular rate at which he is employed.' }
  ]
};

/* ---------------------------------------------------------
   中国 — 商事法律与债权参考
   --------------------------------------------------------- */
window.LAW_DB.zh = {
  locale: 'zh',
  htmlLang: 'zh-Hans',
  brand: 'INSIGHT BRIEF',
  official: 'https://flk.npc.gov.cn/',
  officialName: '国家法律法规数据库(flk.npc.gov.cn)',
  courtName: '中国裁判文书网',
  court: 'https://wenshu.court.gov.cn/',

  ui: {
    tabReport: '案情报告',
    tabLibrary: '法条原文',
    tabSearch: '案例与检索',
    tabGuide: '接入指南',
    areaTitle: '四大重点领域',
    areaHint: '选择领域后，示例案情与适用法条会同步切换。',
    inputLabel: '请按实际情况描述纠纷',
    inputHint: '写明日期、金额、当事人以及已经做过的动作，报告会更具体。',
    analyze: '提取争议关键词',
    generate: '生成四段式报告',
    example: '示例案情',
    clear: '清空',
    print: 'A4 PDF 打印',
    copyMd: '复制 Markdown',
    kwTitle: '提取的争议关键词',
    part1: '案情摘要与核心争点',
    part2: '可适用的已核验法条',
    part3: '判断标准与核查要点',
    part4: '可行的应对流程',
    expand: '展开原文',
    openLaw: '法条原文',
    openCourt: '案例检索',
    note: '条文以核验时点为准，最新原文请点链接确认。',
    libraryTitle: '法条原文库',
    libraryHint: '下列条文均已在国家法律法规数据库核对。点击展开原文，并可直接跳转官方来源。',
    libSearch: '按法律名称、条号或关键词检索（例：188、支付令、经济补偿）',
    searchTitle: '案例与法条检索',
    searchHint: '点击关键词将在新窗口打开官方检索。引用案号前，请先确认检索到的是真实文书。',
    courtHint: '在中国裁判文书网按关键词检索，注意区分不同审级与年份。',
    copy: '复制',
    emptyArea: '未匹配到争点关键词。请补充金额、期限或当事人角色后重试。',
    matched: '适用领域',
    guideline: '以下为通常流程，具体案件会有差异；进入诉讼、保全、执行阶段一般需要执业律师介入。',
    footerNote: '本结果仅供一般法律信息参考，不产生法律效力，也不构成律师的正式法律意见。'
  },

  guide: {
    title: '国家法律法规数据库 · RAG 接入指南',
    lead: '本页是<b>静态开卷</b>：收录的条文在制作时已逐条核对。案量增加后，可把官方数据接入服务器或低代码平台（Dify、GPTs）扩大检索范围。以下条件为制作本页时实际确认的内容。',
    steps: [
      '条文以<b>国家法律法规数据库（flk.npc.gov.cn）</b>为准，该库由全国人大常委会办公厅维护，法律文本不受著作权限制。',
      '<b>中国裁判文书网（wenshu.court.gov.cn）</b>用于核对案号与裁判要旨；引用案号前必须在检索结果中实际看到该文书。',
      '检索被告财产与经营状态，可用<b>国家企业信用信息公示系统（gsxt.gov.cn）</b>，以及法院的失信被执行人、限制高消费信息。',
      '劳动争议需先经<b>劳动人事争议仲裁</b>，仲裁时效为一年（自知道或应当知道权利被侵害之日起），拖欠劳动报酬在劳动关系存续期间不受该一年限制。',
      'RAG 提示词固定为<b>开卷</b>：只允许使用检索到的条文，未收录的内容一律回答“未能确认”。',
      '每条结论都要输出<b>法律名称、条号、施行日期与来源链接</b>，并把案号限定在检索结果内，禁止模型自行生成。'
    ],
    stackTitle: '建议架构',
    stack: [
      ['采集', '国家法律法规数据库、裁判文书网、企业信用信息公示系统'],
      ['存储', '条文级向量库，附带法律名称、条号、施行日期'],
      ['生成', 'Dify / GPTs / 自建服务 + 开卷提示词'],
      ['校验', '自动附加条号与来源链接，拦截不存在的案号'],
      ['部署', '静态页面 + 无服务器函数（按需核验）']
    ],
    promptTitle: '系统提示词骨架',
    prompt: `你是中国商事法律信息整理工具，必须遵守以下规则。
1. 只用<检索到的条文>中的内容作答，未覆盖的问题回答“未能确认”。
2. 引用条文时写明法律名称、条号、施行日期，并附官方来源链接。
3. 不得编造案号、法院名称或裁判日期，只能引用检索结果中的文书。
4. 开头与结尾都要说明：本回答只是一般法律信息，不构成法律意见。
5. 涉及诉讼、保全、执行或刑事风险，建议委托执业律师。`,
    apiTitle: '核验入口',
    api: `# 国家法律法规数据库（官方，条文原文）
https://flk.npc.gov.cn/

# 中国裁判文书网（案号与裁判要旨核验）
https://wenshu.court.gov.cn/

# 国家企业信用信息公示系统（对方财产与经营状态线索）
https://www.gsxt.gov.cn/`,
    caution: '官方数据库为动态页面，抓取时注意频率与使用条款；对外提供的结论必须保留可点击的来源链接。'
  },

  areas: [
    {
      id: 'debt', no: '01',
      name: '应收账款与债权催收',
      short: '货款、催款函、支付令',
      desc: '从催款函到支付令、财产保全与执行。',
      kw: ['货款', '应收账款', '催收', '催款函', '支付令', '保全'],
      keywords: ['货款', '应收账款', '欠款', '拖欠', '催收', '催款函', '律师函', '支付令', '财产保全', '诉讼时效', '违约金', '利息', '合同', '发票', '对账单', '送货单', '买卖合同'],
      issues: ['付款期限是否届满', '合同、发票、对账单能否确定金额', '诉讼时效还剩多少（一般三年）', '对方是否还有可执行财产', '是否存在保证、抵押或所有权保留'],
      checks: [
        ['金额是否确定', '合同+发票+对账单或送货单签收，才能支撑明确的给付请求。'],
        ['付款期限', '没有约定付款期限时，可催告在合理期限内支付。'],
        ['诉讼时效', '一般诉讼时效为三年，自知道或应当知道权利受损及义务人之日起算；主张权利、对方同意履行可中断时效。'],
        ['证据', '合同、订单、发票、送货签收、对账单、催款记录。'],
        ['对方财产', '起诉或保全前先查企业信用信息、涉诉与被执行信息。'],
        ['担保', '有保证人、抵押或所有权保留条款的，一并主张。']
      ],
      steps: [
        { n: '1', t: '固定证据', d: '整理合同、订单、发票、送货签收与对账单，制作欠款清单。', tip: '对方盖章的对账单是最有力的证据。' },
        { n: '2', t: '催款函', d: '以书面催款函明确金额、依据与最后付款期限，并保留送达凭证。', tip: '催告同时可中断诉讼时效。' },
        { n: '3', t: '支付令或诉讼', d: '债权债务关系明确的金钱给付，可向有管辖权的基层法院申请支付令；对方15日内提出书面异议则转入诉讼。', tip: '支付令不得送达对方的，需改为起诉。' },
        { n: '4', t: '保全与执行', d: '情况紧急可在诉前或诉中申请财产保全，判决生效后申请强制执行。', tip: '保全一般需要提供担保。' }
      ],
      examples: [
        { t: '货款38万元未付', b: '自2025年9月起供应塑料原料，2026年8月的货款38万元一直未付。发票已全额开具，对账单有对方盖章，合同约定月结30天，对方只回复"资金紧张"。' },
        { t: '商业承兑汇票到期未兑付', b: '客户开具的商业承兑汇票2000万元（韩元等值）于2026年10月到期被拒付。汇票、交易合同和送货单齐全，对方公司仍在经营。' }
      ],
      statutes: ['cn-188', 'cn-195', 'cn-577', 'cn-584', 'cn-585', 'cn-cp-103', 'cn-cp-104', 'cn-cp-225', 'cn-cp-227'],
      search: ['买卖合同 货款 判决', '支付令 异议', '诉讼时效 中断 催款函', '财产保全 担保'],
      forms: []
    },
    {
      id: 'labor', no: '02',
      name: '劳动与工资',
      short: '欠薪、经济补偿、解除',
      desc: '拖欠工资、经济补偿金、违法解除与仲裁时效。',
      kw: ['工资', '欠薪', '经济补偿', '解除', '仲裁'],
      keywords: ['工资', '欠薪', '拖欠工资', '加班费', '经济补偿', '赔偿金', '违法解除', '解除劳动合同', '劳动仲裁', '仲裁时效', '社保', '年休假', '竞业限制', '工伤'],
      issues: ['是否构成劳动关系', '欠薪期间与金额', '解除方式与是否属于违法解除', '经济补偿或赔偿金的计算年限与基数', '仲裁时效是否已过（一般一年）'],
      checks: [
        ['劳动关系', '劳动合同、考勤、工资流水、工作安排记录均可证明，未签书面合同不影响认定。'],
        ['欠薪金额', '以工资流水和工资条确定应付与实付差额。'],
        ['解除性质', '用人单位单方解除需有法定理由并履行程序，违法解除应支付赔偿金（经济补偿标准的二倍）。'],
        ['经济补偿', '按在本单位工作年限，每满一年支付一个月工资；六个月以上不满一年按一年计，不满六个月支付半个月工资。'],
        ['仲裁时效', '一年，自知道或应当知道权利被侵害之日起算；劳动关系存续期间因拖欠劳动报酬发生争议不受该一年限制，但劳动关系终止的应自终止之日起一年内提出。'],
        ['程序', '劳动争议一般先经劳动人事争议仲裁，对裁决不服再向法院起诉。']
      ],
      steps: [
        { n: '1', t: '计算金额', d: '用工资流水、工资条计算欠薪、加班费与经济补偿基数。', tip: '月工资一般指解除前十二个月平均工资。' },
        { n: '2', t: '书面催告', d: '向用人单位发出书面催告，明确金额与期限，保留送达凭证。', tip: '书面催告同时可固定"及时足额支付"的事实。' },
        { n: '3', t: '投诉或仲裁', d: '可向劳动行政部门投诉，或向劳动人事争议仲裁委员会申请仲裁（不收费）。', tip: '拖欠劳动报酬可依法申请支付令。' },
        { n: '4', t: '诉讼与执行', d: '对仲裁裁决不服，自收到裁决书之日起十五日内起诉；生效裁决可申请强制执行。', tip: '终局裁决的起诉规则不同，需按裁决类型判断。' }
      ],
      examples: [
        { t: '欠薪与经济补偿', b: '2024年3月至2026年9月在职，公司拖欠2026年8、9月工资共3.5万元，离职后未支付经济补偿。工资由银行代发，有工资条和考勤记录，未签书面劳动合同。' },
        { t: '口头辞退', b: '2026年10月20日主管口头通知"明天不用来了"，未出具书面解除通知，也未说明理由，社保当月停缴。' }
      ],
      statutes: ['cn-labor-30', 'cn-labor-46', 'cn-labor-47', 'cn-labor-50', 'cn-arb-27'],
      search: ['违法解除 赔偿金 判决', '经济补偿 计算标准', '劳动仲裁 时效 一年', '拖欠工资 支付令'],
      forms: []
    },
    {
      id: 'lease', no: '03',
      name: '房产与商铺租赁',
      short: '押金、续租、腾退',
      desc: '租赁押金返还、优先承租、解除与腾退争议。',
      kw: ['租赁', '押金', '商铺', '续租', '腾退'],
      keywords: ['租赁', '房屋租赁', '商铺', '押金', '保证金', '租金', '续租', '优先承租权', '解除', '腾退', '转租', '装修', '物业费', '违约'],
      issues: ['租赁合同对押金返还与扣除的约定', '是否约定续租或优先承租权，通知是否及时', '解除是否有合同或法定依据', '装修与添附如何处理', '押金与租金能否抵销'],
      checks: [
        ['押金条款', '先看返还期限、扣除事由与结算方式。'],
        ['续租与优先权', '合同约定优先承租权的，按约定期限书面提出。'],
        ['解除依据', '约定解除条件或法定解除（如根本违约、不可抗力致目的不能实现）。'],
        ['腾退与交接', '交接清单、钥匙与水电燃气结清记录决定押金能否全额退回。'],
        ['证据', '合同、付款凭证、交接清单、催告函、现场照片。'],
        ['诉讼', '标的额较小的可适用小额诉讼程序，一审终审。']
      ],
      steps: [
        { n: '1', t: '核对合同', d: '整理合同、押金凭证、交接清单与沟通过程记录。', tip: '交接时的照片和签字单最有说服力。' },
        { n: '2', t: '书面通知', d: '发函要求返还押金或限期整改，写明金额与期限。', tip: '保留快递单号与签收记录。' },
        { n: '3', t: '协商或调解', d: '可申请人民调解或行业调解，形成书面协议。', tip: '调解协议可申请司法确认，取得执行力。' },
        { n: '4', t: '诉讼', d: '协商不成向房屋所在地法院起诉，标的小可适用小额诉讼。', tip: '注意押金返还请求的诉讼时效为三年。' }
      ],
      examples: [
        { t: '商铺押金不退', b: '2026年9月退租商铺，押金20万元（韩元等值）约定30日内返还并出具扣除明细，至今未退，电话不接。交接清单双方签字，水电已结清。' },
        { t: '续租被拒', b: '合同约定同等条件下享有优先承租权，须在到期前3个月书面提出。2026年9月10日提出续租，出租人已与他人签约。' }
      ],
      statutes: ['cn-188', 'cn-577', 'cn-585'],
      search: ['租赁押金 返还 判决', '优先承租权', '商铺 腾退 违约金', '小额诉讼 标的额'],
      forms: []
    },
    {
      id: 'trade', no: '04',
      name: '贸易合同与违约金',
      short: '交货、质量、违约金',
      desc: '迟延交货、质量不符、检验通知与违约金调整。',
      kw: ['买卖合同', '交货', '违约金', '质量', '检验'],
      keywords: ['买卖合同', '交货', '迟延交货', '违约金', '质量', '检验期限', '瑕疵', '解除', '赔偿损失', '定金', '国际贸易', '信用证', '提单', '不可抗力'],
      issues: ['合同对交货期、质量标准与检验期限的约定', '是否在检验期限内通知不符', '违约金是否过分高于实际损失', '解除条件是否成立', '损失赔偿范围与可预见性'],
      checks: [
        ['合同条款', '核对订单、合同、信用证与贸易术语是否一致。'],
        ['检验通知', '约定检验期限的，应在期限内通知数量或质量不符；未通知视为符合约定。'],
        ['违约金', '约定违约金过分高于损失的，可请求适当减少；低于损失的可请求增加。'],
        ['定金', '定金不得超过主合同标的额的20%，收受方违约应双倍返还。'],
        ['解除', '一方迟延履行主要债务，经催告后在合理期限内仍未履行的，可以解除。'],
        ['赔偿范围', '包括合同履行后可以获得的利益，但不超过违约方订立合同时可预见的损失。']
      ],
      steps: [
        { n: '1', t: '固定单证', d: '整理合同、订单、提单、发票、装箱单与检验报告。', tip: '国际贸易还要核对信用证条款。' },
        { n: '2', t: '书面通知', d: '在检验期限内发出质量或数量不符通知，并保留送达证据。', tip: '逾期通知，可能视为货物符合约定。' },
        { n: '3', t: '主张违约金或解除', d: '按合同主张违约金或损失赔偿；符合条件时通知解除。', tip: '解除不影响损失赔偿请求。' },
        { n: '4', t: '仲裁或诉讼', d: '按合同争议解决条款选择仲裁或法院，注意管辖与准据法。', tip: '涉外合同先看准据法与仲裁条款。' }
      ],
      examples: [
        { t: '迟延交货违约金', b: '2026年6月签订的20吨原料合同，交货迟延8周。合同约定违约金为每周合同金额的0.5%，上限5%；另行采购多支出1.2万元。' },
        { t: '质量不符', b: '10月到货的原料水分超标，11月初已书面通知对方。对方称检验期限已过，拒绝赔偿。' }
      ],
      statutes: ['cn-577', 'cn-584', 'cn-585', 'cn-621'],
      search: ['违约金 过高 调整 判决', '检验期限 质量异议', '迟延交货 解除合同', '定金 双倍返还'],
      forms: []
    }
  ],

  laws: {
    '民法典': { full: '中华人民共和国民法典', eff: '2021年1月1日施行', url: 'https://flk.npc.gov.cn/' },
    '劳动合同法': { full: '中华人民共和国劳动合同法', eff: '2013年7月1日修正施行', url: 'https://flk.npc.gov.cn/' },
    '民事诉讼法': { full: '中华人民共和国民事诉讼法（2023修正）', eff: '2024年1月1日施行', url: 'https://flk.npc.gov.cn/' },
    '劳动争议调解仲裁法': { full: '中华人民共和国劳动争议调解仲裁法', eff: '2008年5月1日施行', url: 'https://flk.npc.gov.cn/' }
  },

  statutes: [
    { id: 'cn-188', law: '民法典', art: '第一百八十八条', t: '普通诉讼时效、最长权利保护期间', b: '向人民法院请求保护民事权利的诉讼时效期间为三年。法律另有规定的，依照其规定。诉讼时效期间自权利人知道或者应当知道权利受到损害以及义务人之日起计算。法律另有规定的，依照其规定。但是，自权利受到损害之日起超过二十年的，人民法院不予保护，有特殊情况的，人民法院可以根据权利人的申请决定延长。' },
    { id: 'cn-195', law: '民法典', art: '第一百九十五条', t: '诉讼时效中断', b: '有下列情形之一的，诉讼时效中断，从中断、有关程序终结时起，诉讼时效期间重新计算：（一）权利人向义务人提出履行请求；（二）义务人同意履行义务；（三）权利人提起诉讼或者申请仲裁；（四）与提起诉讼或者申请仲裁具有同等效力的其他情形。' },
    { id: 'cn-577', law: '民法典', art: '第五百七十七条', t: '违约责任', b: '当事人一方不履行合同义务或者履行合同义务不符合约定的，应当承担继续履行、采取补救措施或者赔偿损失等违约责任。' },
    { id: 'cn-584', law: '民法典', art: '第五百八十四条', t: '损失赔偿范围', b: '当事人一方不履行合同义务或者履行合同义务不符合约定，造成对方损失的，损失赔偿额应当相当于因违约所造成的损失，包括合同履行后可以获得的利益；但是，不得超过违约一方订立合同时预见到或者应当预见到的因违约可能造成的损失。' },
    { id: 'cn-585', law: '民法典', art: '第五百八十五条', t: '违约金', b: '当事人可以约定一方违约时应当根据违约情况向对方支付一定数额的违约金，也可以约定因违约产生的损失赔偿额的计算方法。约定的违约金低于造成的损失的，人民法院或者仲裁机构可以根据当事人的请求予以增加；约定的违约金过分高于造成的损失的，人民法院或者仲裁机构可以根据当事人的请求予以适当减少。当事人就迟延履行约定违约金的，违约方支付违约金后，还应当履行债务。' },
    { id: 'cn-621', law: '民法典', art: '第六百二十一条', t: '检验期限与瑕疵通知', b: '当事人约定检验期限的，买受人应当在检验期限内将标的物的数量或者质量不符合约定的情形通知出卖人。买受人怠于通知的，视为标的物的数量或者质量符合约定。当事人没有约定检验期限的，买受人应当在发现或者应当发现标的物的数量或者质量不符合约定的合理期限内通知出卖人。买受人在合理期限内未通知或者自收到标的物之日起二年内未通知出卖人的，视为标的物的数量或者质量符合约定；但是，对标的物有质量保证期的，适用质量保证期。出卖人知道或者应当知道提供的标的物不符合约定的，买受人不受前两款规定的通知时间的限制。' },
    { id: 'cn-labor-30', law: '劳动合同法', art: '第三十条', t: '劳动报酬支付与支付令', b: '用人单位应当按照劳动合同约定和国家规定，向劳动者及时足额支付劳动报酬。用人单位拖欠或者未足额支付劳动报酬的，劳动者可以依法向当地人民法院申请支付令，人民法院应当依法发出支付令。' },
    { id: 'cn-labor-46', law: '劳动合同法', art: '第四十六条', t: '经济补偿的情形', b: '有下列情形之一的，用人单位应当向劳动者支付经济补偿：（一）劳动者依照本法第三十八条规定解除劳动合同的；（二）用人单位依照本法第三十六条规定向劳动者提出解除劳动合同并与劳动者协商一致解除劳动合同的；（三）用人单位依照本法第四十条规定解除劳动合同的；（四）用人单位依照本法第四十一条第一款规定解除劳动合同的；（五）除用人单位维持或者提高劳动合同约定条件续订劳动合同，劳动者不同意续订的情形外，依照本法第四十四条第一项规定终止固定期限劳动合同的；（六）依照本法第四十四条第四项、第五项规定终止劳动合同的；（七）法律、行政法规规定的其他情形。' },
    { id: 'cn-labor-47', law: '劳动合同法', art: '第四十七条', t: '经济补偿的计算', b: '经济补偿按劳动者在本单位工作的年限，每满一年支付一个月工资的标准向劳动者支付。六个月以上不满一年的，按一年计算；不满六个月的，向劳动者支付半个月工资的经济补偿。劳动者月工资高于用人单位所在直辖市、设区的市级人民政府公布的本地区上年度职工月平均工资三倍的，向其支付经济补偿的标准按职工月平均工资三倍的数额支付，向其支付经济补偿的年限最高不超过十二年。本条所称月工资是指劳动者在劳动合同解除或者终止前十二个月的平均工资。' },
    { id: 'cn-labor-50', law: '劳动合同法', art: '第五十条', t: '解除或终止的手续', b: '用人单位应当在解除或者终止劳动合同时出具解除或者终止劳动合同的证明，并在十五日内为劳动者办理档案和社会保险关系转移手续。劳动者应当按照双方约定，办理工作交接。用人单位依照本法有关规定应当向劳动者支付经济补偿的，在办结工作交接时支付。' },
    { id: 'cn-arb-27', law: '劳动争议调解仲裁法', art: '第二十七条', t: '仲裁时效', b: '劳动争议申请仲裁的时效期间为一年。仲裁时效期间从当事人知道或者应当知道其权利被侵害之日起计算。前款规定的仲裁时效，因当事人一方向对方当事人主张权利，或者向有关部门请求权利救济，或者对方当事人同意履行义务而中断。从中断时起，仲裁时效期间重新计算。劳动关系存续期间因拖欠劳动报酬发生争议的，劳动者申请仲裁不受本条第一款规定的仲裁时效期间的限制；但是，劳动关系终止的，应当自劳动关系终止之日起一年内提出。' },
    { id: 'cn-cp-103', law: '民事诉讼法', art: '第一百零三条', t: '诉讼保全', b: '人民法院对于可能因当事人一方的行为或者其他原因，使判决难以执行或者造成当事人其他损害的案件，根据对方当事人的申请，可以裁定对其财产进行保全、责令其作出一定行为或者禁止其作出一定行为；当事人没有提出申请的，人民法院在必要时也可以裁定采取保全措施。人民法院采取保全措施，可以责令申请人提供担保，申请人不提供担保的，裁定驳回申请。人民法院接受申请后，对情况紧急的，必须在四十八小时内作出裁定；裁定采取保全措施的，应当立即开始执行。' },
    { id: 'cn-cp-104', law: '民事诉讼法', art: '第一百零四条', t: '诉前保全', b: '利害关系人因情况紧急，不立即申请保全将会使其合法权益受到难以弥补的损害的，可以在提起诉讼或者申请仲裁前向被保全财产所在地、被申请人住所地或者对案件有管辖权的人民法院申请采取保全措施。申请人应当提供担保，不提供担保的，裁定驳回申请。申请人在人民法院采取保全措施后三十日内不依法提起诉讼或者申请仲裁的，人民法院应当解除保全。' },
    { id: 'cn-cp-225', law: '民事诉讼法', art: '第二百二十五条', t: '支付令的申请条件', b: '债权人请求债务人给付金钱、有价证券，符合下列条件的，可以向有管辖权的基层人民法院申请支付令：（一）债权人与债务人没有其他债务纠纷的；（二）支付令能够送达债务人的。申请书应当写明请求给付金钱或者有价证券的数量和所根据的事实、证据。' },
    { id: 'cn-cp-227', law: '民事诉讼法', art: '第二百二十七条', t: '支付令的发出与异议', b: '人民法院受理申请后，经审查债权人提供的事实、证据，对债权债务关系明确、合法的，应当在受理之日起十五日内向债务人发出支付令；申请不成立的，裁定予以驳回。债务人应当自收到支付令之日起十五日内清偿债务，或者向人民法院提出书面异议。债务人在前款规定的期间不提出异议又不履行支付令的，债权人可以向人民法院申请执行。支付令失效的，转入诉讼程序，但申请支付令的一方当事人不同意提起诉讼的除外。' }
  ]
};

/* ---------------------------------------------------------
   日本 — 企業法務・債権回収リファレンス
   --------------------------------------------------------- */
window.LAW_DB.ja = {
  locale: 'ja',
  htmlLang: 'ja',
  brand: 'INSIGHT BRIEF',
  official: 'https://laws.e-gov.go.jp/',
  officialName: 'e-Gov法令検索(laws.e-gov.go.jp)',
  courtName: '裁判所ウェブサイト',
  court: 'https://www.courts.go.jp/',

  ui: {
    tabReport: '事案レポート',
    tabLibrary: '条文',
    tabSearch: '判例・検索',
    tabGuide: '連携ガイド',
    areaTitle: '4つの重点分野',
    areaHint: '分野を選ぶと、例示事案と適用条文が切り替わります。',
    inputLabel: '事案の内容をそのまま書いてください',
    inputHint: '日付・金額・当事者・すでに行った対応があると、レポートが具体化します。',
    analyze: '争点キーワードを抽出',
    generate: '4段レポートを作成',
    example: '例示事案',
    clear: 'クリア',
    print: 'A4 PDF 印刷',
    copyMd: 'Markdownをコピー',
    kwTitle: '抽出された争点キーワード',
    part1: '事案の要約と核心の争点',
    part2: '適用しうる検証済みの法令根拠',
    part3: '判断基準と確認ポイント',
    part4: '現実的な対応手順',
    expand: '条文を開く',
    openLaw: '原文',
    openCourt: '判例検索',
    note: '条文は確認時点のものです。最新の原文はリンク先でご確認ください。',
    libraryTitle: '条文ライブラリ',
    libraryHint: '収録条文はすべてe-Gov法令検索で確認した実際の条文です。開いて原文を読み、公式リンクへ移動できます。',
    libSearch: '法令名・条番号・キーワードで検索（例：166、支払督促、解雇）',
    searchTitle: '判例・法令の検索',
    searchHint: 'キーワードを押すと公式の検索ページが新しいタブで開きます。事件番号は実際に確認できたものだけを引用してください。',
    courtHint: '裁判所ウェブサイトの裁判例検索で、事件番号・年月日を確認してから引用します。',
    copy: 'コピー',
    emptyArea: '争点キーワードが見つかりませんでした。金額・期限・立場を足して再試行してください。',
    matched: '該当分野',
    guideline: '以下は一般的な順序です。事案により異なり、訴訟・強制執行の段階は弁護士への相談が必要です。',
    footerNote: '本結果は一般的な法律情報の提供を目的とするものであり、法的効力や弁護士の正式な助言に代わるものではありません。'
  },

  guide: {
    title: 'e-Gov法令API・RAG連携ガイド',
    lead: 'このページは条文を事前に検証して収録した<b>静的オープンブック</b>です。事案が増えたら、公式データをサーバーやノーコード（Dify・GPTs）に接続して検索範囲を広げられます。以下は本ページ制作時に実際に確認した内容です。',
    steps: [
      '法令の一次情報は<b>e-Gov法令検索（laws.e-gov.go.jp）</b>です。法令IDを指定すると法令全文をXMLで取得でき、条番号単位で抽出できます。',
      '確認した取得例：<code>https://laws.e-gov.go.jp/api/1/lawdata/129AC0000000089</code>（民法）がXMLで返り、第166条・第415条などを条単位で取得できました。',
      '判例は<b>裁判所ウェブサイト</b>の裁判例検索で事件番号・裁判年月日を確認します。モデルに事件番号を生成させてはいけません。',
      '商用利用や大量取得の際は、e-Govの利用規約と二次利用条件を確認してください。',
      'RAGのプロンプトは<b>オープンブック</b>に固定します。「検索された条文にない内容は書かない、無ければ確認できないと答える」を最初の行に置きます。',
      '回答には<b>法令名・条番号・施行日・原文リンク</b>を必ず付け、利用者が検証できる形にします。'
    ],
    stackTitle: '推奨構成',
    stack: [
      ['収集', 'e-Gov法令API（法令ID指定）＋ XMLパース'],
      ['保存', '条文単位のベクトルDB（法令名・条番号・施行日メタデータ必須）'],
      ['生成', 'Dify / GPTs / 自前サーバー＋オープンブックのプロンプト'],
      ['検証', '条番号リンクの自動付与、存在しない事件番号の遮断'],
      ['公開', '静的ページ＋サーバーレス関数']
    ],
    promptTitle: 'システムプロンプトの骨格',
    prompt: `あなたは日本の法令情報を整理するツールです。次のルールを守ります。
1. 回答根拠は<検索された条文>にある内容だけを使い、無い場合は「確認できません」と答える。
2. 条文を引くときは法令名・条番号・施行日と原文リンクを併記する。
3. 事件番号・裁判年月日は検索結果にあるものだけを引用し、無ければ引用しない。
4. 冒頭と末尾に、法的助言ではなく情報整理であることを明記する。
5. 訴訟・強制執行・刑事事件は弁護士への相談を勧める。`,
    apiTitle: '確認済みの取得例',
    api: `# 法令全文（XML・民法）
https://laws.e-gov.go.jp/api/1/lawdata/129AC0000000089

# 労働基準法
https://laws.e-gov.go.jp/api/1/lawdata/322AC0000000049

# 借地借家法
https://laws.e-gov.go.jp/api/1/lawdata/403AC0000000090`,
    caution: 'APIキーや内部IDはブラウザに置かず、サーバーの環境変数で管理してください。静的ページのみの運用では、本ページのように検証済み条文を直接収録する方法が安全です。'
  },

  areas: [
    {
      id: 'debt', no: '01',
      name: '売掛金・債権回収',
      short: '未払代金・内容証明・支払督促',
      desc: '未払代金の督促から支払督促・仮差押えまで。',
      kw: ['売掛金', '未払', '内容証明', '支払督促', '仮差押え'],
      keywords: ['売掛金', '未払', '未払代金', '代金', '債権', '回収', '督促', '内容証明', '支払督促', '仮差押え', '消滅時効', '商事', '遅延損害金', '利息', '請求書', '納品書', '注文書', '取引先'],
      issues: ['支払期日が到来しているか', '契約書・注文書・請求書で金額を特定できるか', '消滅時効の残り（原則5年・10年）', '相手方に回収可能な財産があるか', '保証・担保があるか'],
      checks: [
        ['金額の特定', '契約書・注文書・請求書・納品書で数量と単価を特定します。'],
        ['支払期日', '期限の定めがなければ、請求した時から遅滞の責任が生じます。'],
        ['消滅時効', '債権は権利を行使できると知った時から5年、権利行使可能時から10年です（民法166条）。'],
        ['証拠', '注文書、納品書の受領印、請求書、入金履歴、督促記録。'],
        ['相手方の財産', '不明な場合は財産開示手続や、訴訟前の仮差押えを検討します。'],
        ['保証', '連帯保証・保証契約があれば請求先が広がります。']
      ],
      steps: [
        { n: '1', t: '証拠の整理', d: '契約書・注文書・納品書・請求書・入金履歴をそろえ、未払額を一覧にします。', tip: '受領印のある納品書が最も強い証拠になります。' },
        { n: '2', t: '内容証明郵便', d: '金額・根拠・支払期限を記載した催告書を内容証明郵便で送ります。', tip: '送達記録が時効更新と証拠になります。' },
        { n: '3', t: '支払督促・少額訴訟', d: '金銭請求は支払督促が簡易で、債務者が2週間内に異議を出さなければ確定します。60万円以下なら少額訴訟も選べます。', tip: '督促異議が出ると通常訴訟に移行します。' },
        { n: '4', t: '仮差押え・強制執行', d: '財産の散逸が疑われる場合は仮差押えで保全し、確定した債務名義で強制執行します。', tip: '保全には担保と被保全権利の疎明が必要です。' }
      ],
      examples: [
        { t: '売掛金380万円の未回収', b: '2025年9月から樹脂原料を納品していますが、取引先が2026年8月分の代金380万円を支払いません。請求書は毎月発行し、納品書には受領印があります。契約書では月末締め翌月末払いです。' },
        { t: '約束手形の不渡り', b: '取引先振出の約束手形2,000万円が2026年10月に不渡りとなりました。手形の写しと取引資料はありますが、相手方は事務所のみで営業実態が不明です。' }
      ],
      statutes: ['jp-166', 'jp-415', 'jp-541', 'jp-542', 'jp-mins-382', 'jp-mins-368'],
      search: ['売掛金 支払督促', '消滅時効 5年 債権', '内容証明 催告 時効', '仮差押え 保全の必要性'],
      forms: []
    },
    {
      id: 'labor', no: '02',
      name: '労働・労務',
      short: '未払賃金・解雇・退職',
      desc: '未払賃金、解雇予告、付加金まで。',
      kw: ['賃金', '未払', '解雇', '退職', '残業代'],
      keywords: ['賃金', '未払賃金', '残業代', '割増賃金', '解雇', '解雇予告', '退職', '退職金', '労災', '有給休暇', '労働時間', '服務規程', '就業規則', '改善命令', '労働基準監督署'],
      issues: ['労働者に当たるか（使用従属性）', '未払賃金の期間と金額', '解雇か退職勧奨・契約満了か', '解雇予告手当の要否', '付加金や残業代の請求可能性'],
      checks: [
        ['労働者性', '業務の指示・時間管理・報酬があれば労働者と判断され得ます。業務委託契約でも同様です。'],
        ['未払額', '給与明細・通帳履歴で未払期間と金額を特定します。'],
        ['解雇の形式', '解雇は客観的合理的理由と社会通念上の相当性が必要です。'],
        ['解雇予告', '30日前の予告か30日分以上の平均賃金（解雇予告手当）が必要です。'],
        ['付加金', '裁判所は一定の違反について、未払額と同額の付加金の支払を命じることができます。'],
        ['時効', '賃金請求権は5年（当分の間3年）です。内容証明や監督署への申告で更新を図ります。']
      ],
      steps: [
        { n: '1', t: '金額の確定', d: '給与明細・タイムカード・通帳で未払賃金を計算します。', tip: '残業代は時間単価×割増率で積み上げます。' },
        { n: '2', t: '内容証明で請求', d: '未払額と支払期限を記載した催告書を送ります。', tip: '退職後の請求でも時効更新の効果があります。' },
        { n: '3', t: '監督署・あっせん', d: '労働基準監督署に申告し、必要なら個別労働紛争のあっせんを申請します。', tip: 'あっせんは無料で、弁護士なしでも利用できます。' },
        { n: '4', t: '訴訟・支払督促', d: '話し合いが進まない場合は支払督促や訴訟で請求します。', tip: '少額なら少額訴訟（60万円以下）が使えます。' }
      ],
      examples: [
        { t: '未払賃金と解雇予告手当', b: '2024年3月から2026年9月まで勤務し、退職後に8月・9月分の賃金56万円と解雇予告手当が未払いです。就業規則はなく、給与は口座振込で明細もありません。' },
        { t: '口頭での即日解雇', b: '2026年10月20日に「明日から来なくていい」と口頭で言われ、解雇理由の書面も交付されていません。' }
      ],
      statutes: ['jp-lsa-20', 'jp-lsa-24', 'jp-lsa-114', 'jp-415'],
      search: ['解雇 無効 判例', '未払残業代 割増率', '付加金 労働基準法114条', '解雇予告手当'],
      forms: []
    },
    {
      id: 'lease', no: '03',
      name: '不動産・店舗賃貸',
      short: '敷金・更新・明渡し',
      desc: '敷金返還、更新拒絶、明渡しと原状回復。',
      kw: ['賃貸', '敷金', '更新', '明渡し', '店舗'],
      keywords: ['賃貸', '賃貸借', '建物', '店舗', '事務所', '敷金', '保証金', '更新', '更新拒絶', '解約', '明渡し', '原状回復', '賃料', '滞納', '借地借家法', '定期建物賃貸借'],
      issues: ['普通借家か定期建物賃貸借か', '更新拒絶に正当事由があるか', '敷金の返還時期と控除の根拠', '原状回復の範囲', '賃料滞納による解除の可否'],
      checks: [
        ['契約類型', '定期建物賃貸借は更新がなく、期間満了で終了します（公正証書等の書面と事前説明が前提）。'],
        ['更新', '期間満了の1年前から6か月前までに更新拒絶の通知がなければ、同一条件で更新したものとみなされます（借地借家法26条）。'],
        ['正当事由', '更新拒絶や解約申入れには正当事由が必要で、立退料の提供も考慮されます（同28条）。'],
        ['敷金', '返還時期・控除の根拠は契約と原状回復のガイドラインで確認します。'],
        ['原状回復', '通常損耗は賃借人負担になりません。特約があっても明確な合意が必要です。'],
        ['強行規定', '借地借家法の規定に反する特約で賃借人に不利なものは無効です（同30条）。']
      ],
      steps: [
        { n: '1', t: '契約の確認', d: '契約書・重要事項説明書・原状回復特約・更新の通知履歴を整理します。', tip: '通知日と到達日が更新の可否を分けます。' },
        { n: '2', t: '内容証明で通知', d: '敷金返還請求や更新拒絶への異議を内容証明郵便で送ります。', tip: '明渡しは敷金返還との同時履行として交渉します。' },
        { n: '3', t: '調停・相談', d: '話し合いが難航する場合は民事調停やADRを検討します。', tip: '調停調書は債務名義になります。' },
        { n: '4', t: '訴訟・執行', d: '敷金返還請求訴訟、または明渡し訴訟・強制執行へ進みます。', tip: '店舗は権利金・保証金の扱いも確認します。' }
      ],
      examples: [
        { t: '事務所の敷金返還', b: '2026年9月末に事務所を退去しましたが、敷金200万円が返還されません。契約では退去後1か月以内に精算と明細を送る定めです。退去時の立会いと写真はあります。' },
        { t: '店舗の更新拒絶', b: '5年間営業している店舗の契約が2026年12月に満了します。大家から2026年11月に「更新しない」との通知が届きましたが、理由の説明はありません。' }
      ],
      statutes: ['jp-shaku-26', 'jp-shaku-28', 'jp-shaku-30', 'jp-166'],
      search: ['更新拒絶 正当事由 判例', '敷金返還 請求', '原状回復 通常損耗', '定期建物賃貸借 終了'],
      forms: []
    },
    {
      id: 'trade', no: '04',
      name: '貿易・契約・違約金',
      short: '契約不適合・遅延・解除',
      desc: '納期遅延、契約不適合、検査と通知、解除。',
      kw: ['契約', '納期', '違約金', '契約不適合', '検品'],
      keywords: ['契約', '売買', '納期', '遅延', '違約金', '損害賠償', '契約不適合', '瑕疵', '検品', '検査', '通知', '解除', '催告', '貿易', '信用状', '船積み', '不可抗力', '手付'],
      issues: ['契約条件（納期・検査・代金）が文書で残っているか', '履行遅滞か契約不適合か', '催告して解除できるか', '不適合の通知を1年以内にしたか', '損害の範囲と予見可能性'],
      checks: [
        ['契約書', '注文書・契約書・貿易条件（インコタームズ）の整合を確認します。'],
        ['検査と通知', '引渡し後、不適合を知った時から1年以内に通知しないと追完・減額・賠償・解除を請求できません（民法566条）。'],
        ['催告解除', '相当の期間を定めて催告し、期間内に履行がなければ解除できます（民法541条）。'],
        ['違約金', '損害と比較して過大な場合は減額され得ます。'],
        ['損害の範囲', '履行利益を含みますが、予見可能な範囲に限られます（民法416条）。'],
        ['準拠法', '国際取引は準拠法と仲裁・管轄条項を先に確認します。']
      ],
      steps: [
        { n: '1', t: '書類の整理', d: '契約書・注文書・船荷証券・インボイス・検査証明をそろえます。', tip: '船積書類が日付を確定します。' },
        { n: '2', t: '通知・催告', d: '契約不適合の通知や履行の催告を書面で送り、期限を定めます。', tip: '1年の通知期間を過ぎると権利を失います。' },
        { n: '3', t: '解除・損害賠償', d: '催告期間の経過後に解除し、損害賠償や違約金を請求します。', tip: '解除しても損害賠償請求は妨げられません。' },
        { n: '4', t: '支払督促・仲裁・訴訟', d: '金銭請求は支払督促、国際取引は仲裁条項に従います。', tip: '準拠法が外国法なら専門家の確認が必要です。' }
      ],
      examples: [
        { t: '納期遅延と違約金', b: '2026年6月契約の原料20トンの船積みが8週間遅れました。契約では違約金が1週間あたり契約額の0.5%、上限5%とされ、代替調達で120万円多くかかりました。' },
        { t: '契約不適合の通知', b: '10月入荷分の水分量が契約基準を超えていたため11月初旬に通知しました。相手方は「検査期間が過ぎている」と主張しています。' }
      ],
      statutes: ['jp-415', 'jp-541', 'jp-542', 'jp-562', 'jp-564', 'jp-566'],
      search: ['契約不適合責任 判例', '違約金 減額 判例', '催告 解除 相当期間', '検査 通知 1年'],
      forms: []
    }
  ],

  laws: {
    '民法': { full: '民法', eff: 'e-Gov法令検索（129AC0000000089）', url: 'https://laws.e-gov.go.jp/law/129AC0000000089' },
    '労働基準法': { full: '労働基準法', eff: 'e-Gov法令検索（322AC0000000049）', url: 'https://laws.e-gov.go.jp/law/322AC0000000049' },
    '借地借家法': { full: '借地借家法', eff: 'e-Gov法令検索（403AC0000000090）', url: 'https://laws.e-gov.go.jp/law/403AC0000000090' },
    '民事訴訟法': { full: '民事訴訟法', eff: 'e-Gov法令検索（408AC0000000109）', url: 'https://laws.e-gov.go.jp/law/408AC0000000109' },
    '弁護士法': { full: '弁護士法', eff: 'e-Gov法令検索（324AC1000000205）', url: 'https://laws.e-gov.go.jp/law/324AC1000000205' }
  },

  statutes: [
    { id: 'jp-166', law: '民法', art: '166', t: '債権等の消滅時効', b: '債権は、次に掲げる場合には、時効によって消滅する。一 債権者が権利を行使することができることを知った時から五年間行使しないとき。二 権利を行使することができる時から十年間行使しないとき。２ 債権又は所有権以外の財産権は、権利を行使することができる時から二十年間行使しないときは、時効によって消滅する。' },
    { id: 'jp-415', law: '民法', art: '415', t: '債務不履行による損害賠償', b: '債務者がその債務の本旨に従った履行をしないとき又は債務の履行が不能であるときは、債権者は、これによって生じた損害の賠償を請求することができる。ただし、その債務の不履行が契約その他の債務の発生原因及び取引上の社会通念に照らして債務者の責めに帰することができない事由によるものであるときは、この限りでない。２ 債務の履行が不能であるとき、債務者が履行を拒絶する意思を明確に表示したとき等には、履行に代わる損害賠償を請求することができる。' },
    { id: 'jp-541', law: '民法', art: '541', t: '催告による解除', b: '当事者の一方がその債務を履行しない場合において、相手方が相当の期間を定めてその履行の催告をし、その期間内に履行がないときは、相手方は、契約の解除をすることができる。ただし、その期間を経過した時における債務の不履行がその契約及び取引上の社会通念に照らして軽微であるときは、この限りでない。' },
    { id: 'jp-542', law: '民法', art: '542', t: '催告によらない解除', b: '債務の全部の履行が不能であるとき、債務者がその債務の全部の履行を拒絶する意思を明確に表示したとき、契約の性質又は当事者の意思表示により特定の日時又は一定の期間内に履行をしなければ契約をした目的を達することができない場合において履行をしないでその時期を経過したとき等には、債権者は、催告をすることなく、直ちに契約の解除をすることができる。' },
    { id: 'jp-562', law: '民法', art: '562', t: '買主の追完請求権', b: '引き渡された目的物が種類、品質又は数量に関して契約の内容に適合しないものであるときは、買主は、売主に対し、目的物の修補、代替物の引渡し又は不足分の引渡しによる履行の追完を請求することができる。ただし、売主は、買主に不相当な負担を課するものでないときは、買主が請求した方法と異なる方法による履行の追完をすることができる。' },
    { id: 'jp-564', law: '民法', art: '564', t: '買主の損害賠償請求及び解除権の行使', b: '前二条の規定は、第四百十五条の規定による損害賠償の請求並びに第五百四十一条及び第五百四十二条の規定による解除権の行使を妨げない。' },
    { id: 'jp-566', law: '民法', art: '566', t: '目的物の種類又は品質に関する担保責任の期間の制限', b: '売主が種類又は品質に関して契約の内容に適合しない目的物を買主に引き渡した場合において、買主がその不適合を知った時から一年以内にその旨を売主に通知しないときは、買主は、その不適合を理由として、履行の追完の請求、代金の減額の請求、損害賠償の請求及び契約の解除をすることができない。ただし、売主が引渡しの時にその不適合を知り、又は重大な過失によって知らなかったときは、この限りでない。' },
    { id: 'jp-lsa-20', law: '労働基準法', art: '20', t: '解雇の予告', b: '使用者は、労働者を解雇しようとする場合においては、少くとも三十日前にその予告をしなければならない。三十日前に予告をしない使用者は、三十日分以上の平均賃金を支払わなければならない。但し、天災事変その他やむを得ない事由のために事業の継続が不可能となつた場合又は労働者の責に帰すべき事由に基いて解雇する場合においては、この限りでない。' },
    { id: 'jp-lsa-24', law: '労働基準法', art: '24', t: '賃金の支払', b: '賃金は、通貨で、直接労働者に、その全額を支払わなければならない。ただし、法令若しくは労働協約に別段の定めがある場合又は厚生労働省令で定める賃金について確実な支払の方法で厚生労働省令で定めるものによる場合においては、通貨以外のもので支払い、また、法令に別段の定めがある場合又は労使協定がある場合においては、賃金の一部を控除して支払うことができる。賃金は、毎月一回以上、一定の期日を定めて支払わなければならない。' },
    { id: 'jp-lsa-114', law: '労働基準法', art: '114', t: '付加金の支払', b: '裁判所は、第二十条、第二十六条若しくは第三十七条の規定に違反した使用者又は第三十九条第九項の規定による賃金を支払わなかつた使用者に対して、労働者の請求により、これらの規定により使用者が支払わなければならない金額についての未払金のほか、これと同一額の付加金の支払を命ずることができる。ただし、この請求は、違反のあつた時から五年以内にしなければならない。' },
    { id: 'jp-shaku-26', law: '借地借家法', art: '26', t: '建物賃貸借契約の更新等', b: '建物の賃貸借について期間の定めがある場合において、当事者が期間の満了の一年前から六月前までの間に相手方に対して更新をしない旨の通知又は条件を変更しなければ更新をしない旨の通知をしなかったときは、従前の契約と同一の条件で契約を更新したものとみなす。ただし、その期間は、定めがないものとする。２ 前項の通知をした場合であっても、建物の賃貸借の期間が満了した後建物の賃借人が使用を継続する場合において、建物の賃貸人が遅滞なく異議を述べなかったときも、同項と同様とする。' },
    { id: 'jp-shaku-28', law: '借地借家法', art: '28', t: '建物賃貸借契約の更新拒絶等の要件', b: '建物の賃貸人による第二十六条第一項の通知又は建物の賃貸借の解約の申入れは、建物の賃貸人及び賃借人が建物の使用を必要とする事情のほか、建物の賃貸借に関する従前の経過、建物の利用状況及び建物の現況並びに建物の賃貸人が建物の明渡しの条件として又は建物の明渡しと引換えに建物の賃借人に対して財産上の給付をする旨の申出をした場合におけるその申出を考慮して、正当の事由があると認められる場合でなければ、することができない。' },
    { id: 'jp-shaku-30', law: '借地借家法', art: '30', t: '強行規定', b: 'この節の規定に反する特約で建物の賃借人に不利なものは、無効とする。' },
    { id: 'jp-mins-382', law: '民事訴訟法', art: '382', t: '支払督促の要件', b: '金銭その他の代替物又は有価証券の一定の数量の給付を目的とする請求については、裁判所書記官は、債権者の申立てにより、支払督促を発することができる。ただし、日本において公示送達によらないでこれを送達することができる場合に限る。' },
    { id: 'jp-mins-368', law: '民事訴訟法', art: '368', t: '少額訴訟の要件等', b: '簡易裁判所においては、訴訟の目的の価額が六十万円以下の金銭の支払の請求を目的とする訴えについて、少額訴訟による審理及び裁判を求めることができる。ただし、同一の簡易裁判所において同一の年に最高裁判所規則で定める回数を超えてこれを求めることができない。２ 少額訴訟による審理及び裁判を求める旨の申述は、訴えの提起の際にしなければならない。' },
    { id: 'jp-bengoshi-72', law: '弁護士法', art: '72', t: '非弁護士の法律事務の取扱い等の禁止', b: '弁護士又は弁護士法人でない者は、報酬を得る目的で訴訟事件、非訟事件及び審査請求、再調査の請求、再審査請求等行政庁に対する不服申立事件その他一般の法律事件に関して鑑定、代理、仲裁若しくは和解その他の法律事務を取り扱い、又はこれらの周旋をすることを業とすることができない。ただし、この法律又は他の法律に別段の定めがある場合は、この限りでない。' }
  ]
};
