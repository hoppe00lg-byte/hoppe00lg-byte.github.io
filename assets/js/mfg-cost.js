/* =========================================================
   INSIGHT BRIEF — 직접생산 vs 외주가공 원가 산출기 (mfg-cost.html)
   · 계산·표·차트·CSV·인쇄 산출서를 모두 이 파일 하나에서 그립니다.
   · 화면 문구는 STR 표에 언어별로 적어 두었습니다(기계번역 없음).
     한국어 페이지는 ko, /en /zh /ja 페이지는 각 언어 표를 씁니다.
   · 입력값은 브라우저(localStorage)에만 남고 어디로도 전송하지 않습니다.
   ========================================================= */
(function () {
"use strict";

/* ---------- 언어 ---------- */
var LANG = (document.documentElement.getAttribute("lang") || "ko").toLowerCase().slice(0, 2);
if (LANG !== "en" && LANG !== "zh" && LANG !== "ja") LANG = "ko";
var IS_KO = LANG === "ko";

var STR = {
  ko: {
    /* 단위·표시 */
    perPc: "/개", unitShot: "원/shot", unitHour: "원/h", unitPc: "원/pc", unitWon: "원",
    cardKrw: "원/개", cardUsd: "$/개",
    perKg: "원/kg", kgUnit: "kg",
    /* 결과 카드 */
    calcNow: "계산 중…",
    missQty: "수량", missDirect: "직접생산 조건(수지·중량·가공비)", missOs: "외주 가공비",
    verdictMissing: "비교하려면 {items} 항목을 입력하세요.",
    verdictTie: "두 방식의 개당 원가가 사실상 같습니다.",
    verdictWin: "{q}개 기준 · {win}이 개당 {gap} ({pct}%) 저렴",
    winDirect: "직접생산", winOs: "외주가공",
    cardSub: "총 {total} · 초기 {init}", enterQty: "수량을 입력하세요",
    bepNeed: "수량과 외주 가격까지 입력하면 계산됩니다.",
    allQty: "전 수량", anyQtyWin: "어느 수량에서도 {win}이 유리합니다.",
    same: "동일", sameFixed: "고정비·변동비 차이가 없습니다.",
    bepQty: "{n}개",
    bepOver: "이 수량을 넘으면 {win}이 유리하고, 그 아래는 {other}이 유리합니다.",
    practicallyNone: "사실상 없음",
    /* 경고 */
    wQty: "수량이 0입니다. 수량을 넣어야 개당 원가와 BEP가 계산됩니다.",
    wWeight: "제품 중량이 0입니다. 원재료비가 잡히지 않습니다.",
    wCycle: "사이클타임이 0입니다. 직접생산 가공비가 0으로 계산됩니다.",
    wResin: "수지 단가가 0입니다. 원재료비가 잡히지 않습니다.",
    wOs: "외주 가공비를 입력해야 외주 원가가 계산됩니다.",
    wRate: "시간당 기계가동비·인건비가 0입니다.",
    wDefect: "불량률이 99% 이상이면 양품 산출이 거의 없습니다.",
    wMold: "수량이 금형 수명({life}개)을 넘어 금형 {molds}벌이 필요합니다.",
    /* 표 */
    grpVar: "변동비 · 수량에 비례", grpFix: "고정비 · 수량에 나눠 배분",
    rMat: "원재료비", rProc: "성형·가공비", rPost: "후가공비", rPack: "포장비", rLogi: "물류·운송비",
    rAdmin: "외주 관리비", rMold: "금형 배분", rSetup: "세팅비 배분",
    rTotal: "개당 합계 · 총원가", rInvest: "초기 투자 (금형+세팅)", rCash: "총 소요 현금",
    tblEmpty: "수량을 입력하면 항목별 비교가 표시됩니다.", tblNoQty: "수량 미입력",
    cmpNote: "차액은 ‘외주 − 직접’입니다. 양수(+)면 직접생산이 그만큼 저렴합니다.",
    cmpBase: "{q} pcs 기준",
    turnkeyNote: "외주 원재료비는 도급(자재 포함) 조건이라 ‘—’로 두었습니다. ",
    qtyPcs: "{n}개", curTag: "현재",
    chartNoteKrw: "원/개", chartNoteUsd: "USD/개 (환율 {fx})",
    chartAria: "수량 구간별 개당 원가 비교 막대 차트",
    /* 핵심 수치 */
    fQty: "이번 수량", fShots: "필요 쇼트 수", fHours: "성형 가동시간", fRaw: "투입 원료량",
    fMolds: "금형 필요 수량", fDiff: "개당 차액", fCashD: "직접 총 소요 현금",
    fCashO: "외주 총 소요 현금", fMoldShare: "이번 오더 배분 금형비",
    uPcs: "pcs", uShot: "shot", uHour: "h", uKg: "kg", uMold: "벌", uPerPc: "/pc",
    /* 프리셋·출처 */
    presetManual: "직접 입력", grpVirgin: "버진 수지 (참고 시세)", grpRecycled: "재생원료 (참고 시세)",
    srcIdle: "수지 프리셋을 고르면 참고 단가가 채워집니다.",
    srcHead: "참고 시세는 아래 ‘단가 참고’에 출처와 기준일을 적었습니다. 실제 계약단가로 고쳐 쓰세요.",
    srcFx: "환율", srcFxValue: "1,343.9원/USD",
    srcFxNote: "한국수출입은행 매매기준율 2026-11-26 · 위안 201.57원",
    srcPriceSuffix: "원/kg",
    /* 저장·내보내기 */
    confirmExample: "예시 값을 불러오면 지금 입력한 내용이 바뀝니다. 계속할까요?",
    confirmReset: "모든 입력을 비웁니다. 계속할까요?",
    toastExample: "예시 값을 불러왔습니다.", toastReset: "입력을 비웠습니다.",
    toastCsv: "CSV를 내려받았습니다 — {name}", fileName: "원가산출", fileFallback: "품목",
    /* 인쇄 산출서 */
    pKicker: "MFG COST WORKSHEET", pTitle: "직접생산 vs 외주가공 원가 산출서",
    pItem: "품목", pNoItem: "(품목명 없음)", pQty: "수량", pCur: "통화", pPrinted: "출력일",
    pVerdict: "개당 {d} vs {o} — {txt}", pNoQty: "수량 미입력",
    pWin: "{win}이 개당 {gap} ({pct}%) 저렴합니다.", pWinSame: "두 방식의 개당 원가가 같습니다.",
    pS1: "1. 요약", pS2: "2. 항목별 원가", pS3: "3. 수량 구간별 개당 원가", pS4: "4. 입력 조건", pS5: "5. 비교 조건",
    pHeadKind: "구분", pHeadUnit: "개당 원가", pHeadTotal: "이번 수량 총원가", pHeadInit: "초기 투자", pHeadCash: "총 소요 현금",
    pHeadItem: "항목", pHeadDUnit: "직접 개당", pHeadDTot: "직접 총액", pHeadOUnit: "외주 개당", pHeadOTot: "외주 총액",
    pHeadQty: "수량", pHeadWin: "유리", pDiff: "차액 (외주−직접)", pSum: "합계",
    pBepNote: "손익분기 수량(BEP): {txt}", pAllQtyDirect: "어느 수량에서도 직접생산이 유리합니다.",
    pAllQtyOs: "어느 수량에서도 외주가공이 유리합니다.", pBepNone: "고정비·변동비 차이가 없습니다.",
    pBepOverD: "{n}개 — 이 수량 이상이면 직접생산이 유리합니다.",
    pBepOverO: "{n}개 — 이 수량 이상이면 외주가공이 유리합니다.",
    pWinD: "직접", pWinO: "외주", pNow: "(현재)",
    pChartNote: "수량 구간별 개당 원가 ({unit})",
    pResin: "원료명", pWeight: "제품 중량 / 로스", pMb: "마스터배치", pMold: "금형",
    pMoldMode: "금형비 배분", pModeBasis: "상각 수량에 분배", pModeOrder: "이번 수량에 전액",
    pCycle: "사이클타임 / 불량률", pPostPack: "후가공 / 포장", pLogi: "물류비",
    pTotalLump: "{v} 총액", pUnitLump: "{v} 개당",
    pTon: "사출기", pTonUnit: "톤", pRate: "기계가동비 / 인건비", pSetup: "세팅비",
    pOsQuote: "외주 견적", pOsPerPart: "개당 ", pOsPerShot: "쇼트당 ", pOsPerHour: "시간당 ",
    pOsMat: "자재 지급", pOsSupply: "사급(자재 당사 부담)", pOsTurnkey: "도급(자재 포함)",
    pOsAdminLogi: "외주 관리비 / 운송비", pOsMold: "외주 금형",
    pOsMoldOurs: "당사 부담", pOsMoldTheirs: "외주처 부담",
    pShots: "필요 쇼트 / 가동시간",
    pFoot: "계산 기준 — 원재료: 중량×(1+로스율)×수지단가 + 중량×(1+로스율)×마스터배치%×첨가제단가 · 성형: 사이클÷3,600×(기계가동비+인건비)÷(캐비티×(1−불량률)) · 금형: 제작비÷상각 기준 수량(단일 오더는 수량) · BEP: (직접 고정비−외주 고정비)÷(외주 변동비−직접 변동비). 세금·금융비용·창고비·인증검사비는 포함하지 않았습니다. 참고용 계산서이며 실제 견적·결산과 다를 수 있습니다.",
    /* CSV */
    csvTitle: "직접생산 · 외주가공 원가 산출서",
    csvItem: "품목", csvQty: "수량(pcs)", csvCur: "통화", csvFx: "환율(원/USD)", csvDate: "출력일",
    csvKind: "구분", csvDirect: "직접생산", csvOs: "외주가공", csvDiffCol: "차액(외주-직접)",
    csvMat: "원재료비(개당)", csvProc: "성형·가공비(개당)", csvPost: "후가공비(개당)", csvPack: "포장비(개당)",
    csvLogi: "물류·운송비(개당)", csvAdmin: "외주 관리비(개당)", csvMold: "금형 배분(개당)", csvSetup: "세팅비 배분(개당)",
    csvUnit: "개당 원가", csvTotal: "이번 수량 총원가", csvInit: "초기 투자(금형+세팅)", csvCash: "총 소요 현금",
    csvBep: "손익분기 수량(BEP)", csvBepAllD: "전 수량 직접생산 유리", csvBepAllO: "전 수량 외주가공 유리",
    csvBepSame: "동일", csvNote: "주", csvTurnkeyNote: "외주 자재는 도급(가공비 포함) 조건이라 외주 원재료비를 0으로 표기했습니다.",
    csvQtyHead: "수량(pcs)", csvWin: "유리", csvInputs: "[입력 조건]",
    csvResin: "원료명", csvUnitPrice: "단가(원/kg)", csvWeightG: "제품중량(g)", csvLoss: "로스율(%)",
    csvMbPct: "마스터배치(%)", csvAddPrice: "첨가제단가(원/kg)",
    csvMoldCost: "금형제작비(원)", csvCav: "캐비티", csvLife: "상각수량", csvDist: "배분",
    csvDistBasis: "상각 수량", csvDistOrder: "이번 수량",
    csvCycle: "사이클타임(초)", csvDefect: "불량률(%)",
    csvPostPack: "후가공(원/pc)", csvPackU: "포장(원/pc)", csvLogiU: "물류", csvLump: "총액", csvPerUnit: "개당",
    csvTon: "사출기(톤)", csvMach: "기계가동비(원/h)", csvLabor: "인건비(원/h)", csvSetupU: "세팅비(원)",
    csvOsMode: "외주방식", csvOsPrice: "외주단가(원)", csvMat: "자재", csvAdminPct: "관리비(%)",
    csvLogiCost: "운송비(원)", csvOsMold: "외주금형", csvOurs: "당사", csvTheirs: "외주처",
    csvSupply: "사급", csvTurnkey: "도급"
  },

  en: {
    perPc: "/pc", unitShot: "KRW/shot", unitHour: "KRW/h", unitPc: "KRW/pc", unitWon: "KRW",
    cardKrw: "KRW/pc", cardUsd: "$/pc",
    perKg: "KRW/kg", kgUnit: "kg",
    calcNow: "Calculating…",
    missQty: "quantity", missDirect: "in-house cost inputs (resin, weight, processing)", missOs: "outsourcing price",
    verdictMissing: "To compare, enter {items}.",
    verdictTie: "Both routes cost virtually the same per piece.",
    verdictWin: "At {q} pcs · {win} is {gap} ({pct}%) cheaper per piece",
    winDirect: "In-house", winOs: "Outsourced",
    cardSub: "Total {total} · upfront {init}", enterQty: "Enter a quantity",
    bepNeed: "Enter a quantity and an outsourcing price to see the break-even point.",
    allQty: "All volumes", anyQtyWin: "{win} wins at every volume.",
    same: "Same", sameFixed: "No difference in fixed or variable costs.",
    bepQty: "{n} pcs",
    bepOver: "Above this volume {win} wins; below it {other} wins.",
    practicallyNone: "Practically none",
    wQty: "Quantity is 0. Enter a quantity to get unit costs and the break-even point.",
    wWeight: "Part weight is 0, so material cost is not counted.",
    wCycle: "Cycle time is 0, so in-house processing cost is counted as 0.",
    wResin: "Resin price is 0, so material cost is not counted.",
    wOs: "Enter an outsourcing price to calculate the outsourced cost.",
    wRate: "Machine rate and labour rate per hour are both 0.",
    wDefect: "A defect rate of 99% or more leaves almost no good parts.",
    wMold: "Quantity exceeds the mould life ({life} pcs), so {molds} mould sets are needed.",
    grpVar: "Variable cost · scales with volume", grpFix: "Fixed cost · spread over volume",
    rMat: "Material", rProc: "Moulding & processing", rPost: "Post-processing", rPack: "Packaging", rLogi: "Freight & logistics",
    rAdmin: "Outsourcing admin", rMold: "Mould amortisation", rSetup: "Setup amortisation",
    rTotal: "Per piece · total cost", rInvest: "Upfront investment (mould + setup)", rCash: "Total cash needed",
    tblEmpty: "Enter a quantity to see the item-by-item comparison.", tblNoQty: "No quantity",
    cmpNote: "Difference is outsourced − in-house. A positive figure means in-house is that much cheaper.",
    cmpBase: "at {q} pcs",
    turnkeyNote: "Outsourced material is left as ‘—’ because the quote is turnkey (material included). ",
    qtyPcs: "{n} pcs", curTag: "now",
    chartNoteKrw: "KRW/pc", chartNoteUsd: "USD/pc (rate {fx})",
    chartAria: "Bar chart comparing unit cost by order quantity",
    fQty: "This order", fShots: "Shots needed", fHours: "Moulding hours", fRaw: "Resin consumed",
    fMolds: "Mould sets needed", fDiff: "Difference per piece", fCashD: "In-house cash needed",
    fCashO: "Outsourced cash needed", fMoldShare: "Mould cost in this order",
    uPcs: "pcs", uShot: "shot", uHour: "h", uKg: "kg", uMold: "sets", uPerPc: "/pc",
    presetManual: "Enter manually", grpVirgin: "Virgin resin (reference price)", grpRecycled: "Recycled resin (reference price)",
    srcIdle: "Pick a resin preset to fill in a reference price.",
    srcHead: "Sources and dates for these reference prices are listed under ‘Price references’ below. Replace them with your contracted price.",
    srcFx: "FX rate", srcFxValue: "KRW 1,343.9/USD",
    srcFxNote: "Korea Eximbank base rate, 2026-11-26 · CNY 201.57 KRW",
    srcPriceSuffix: " KRW/kg",
    confirmExample: "Loading the example values will replace what you have entered. Continue?",
    confirmReset: "This clears every input. Continue?",
    toastExample: "Example values loaded.", toastReset: "All inputs cleared.",
    toastCsv: "CSV downloaded — {name}", fileName: "mfg-cost", fileFallback: "item",
    pKicker: "MFG COST WORKSHEET", pTitle: "In-house vs outsourced manufacturing cost sheet",
    pItem: "Item", pNoItem: "(no item name)", pQty: "Quantity", pCur: "Currency", pPrinted: "Printed",
    pVerdict: "{d} vs {o} per piece — {txt}", pNoQty: "no quantity",
    pWin: "{win} is {gap} ({pct}%) cheaper per piece.", pWinSame: "Both routes cost the same per piece.",
    pS1: "1. Summary", pS2: "2. Cost by item", pS3: "3. Unit cost by order quantity", pS4: "4. Input conditions", pS5: "5. Comparison conditions",
    pHeadKind: "Route", pHeadUnit: "Unit cost", pHeadTotal: "Total for this order", pHeadInit: "Upfront", pHeadCash: "Total cash",
    pHeadItem: "Item", pHeadDUnit: "In-house /pc", pHeadDTot: "In-house total", pHeadOUnit: "Outsourced /pc", pHeadOTot: "Outsourced total",
    pHeadQty: "Quantity", pHeadWin: "Cheaper", pDiff: "Difference (out − in)", pSum: "Total",
    pBepNote: "Break-even quantity (BEP): {txt}", pAllQtyDirect: "In-house wins at every volume.",
    pAllQtyOs: "Outsourcing wins at every volume.", pBepNone: "No difference in fixed or variable costs.",
    pBepOverD: "{n} pcs — above this volume in-house wins.",
    pBepOverO: "{n} pcs — above this volume outsourcing wins.",
    pWinD: "In-house", pWinO: "Outsourced", pNow: "(current)",
    pChartNote: "Unit cost by order quantity ({unit})",
    pResin: "Resin", pWeight: "Part weight / scrap", pMb: "Masterbatch", pMold: "Mould",
    pMoldMode: "Mould cost spread", pModeBasis: "over amortisation volume", pModeOrder: "over this order only",
    pCycle: "Cycle time / defect", pPostPack: "Post-processing / packaging", pLogi: "Logistics",
    pTotalLump: "{v} total", pUnitLump: "{v} per piece",
    pTon: "Machine", pTonUnit: "t", pRate: "Machine / labour rate", pSetup: "Setup cost",
    pOsQuote: "Outsourcing quote", pOsPerPart: "per piece ", pOsPerShot: "per shot ", pOsPerHour: "per hour ",
    pOsMat: "Material supply", pOsSupply: "free issue (we supply resin)", pOsTurnkey: "turnkey (material included)",
    pOsAdminLogi: "Outsourcing admin / freight", pOsMold: "Outsourced mould",
    pOsMoldOurs: "we pay", pOsMoldTheirs: "supplier pays",
    pShots: "Shots / run hours",
    pFoot: "Basis — material: weight×(1+scrap)×resin price + weight×(1+scrap)×masterbatch%×additive price · moulding: cycle÷3,600×(machine+labour rate)÷(cavities×(1−defect)) · mould: cost÷amortisation volume (order volume for single orders) · BEP: (in-house fixed − outsourced fixed)÷(outsourced variable − in-house variable). Tax, financing, warehousing and certification costs are excluded. A reference worksheet, not a quotation or a closing statement.",
    csvTitle: "In-house vs outsourced manufacturing cost sheet",
    csvItem: "Item", csvQty: "Quantity (pcs)", csvCur: "Currency", csvFx: "FX rate (KRW/USD)", csvDate: "Printed",
    csvKind: "Item", csvDirect: "In-house", csvOs: "Outsourced", csvDiffCol: "Difference (out-in)",
    csvMat: "Material (per pc)", csvProc: "Moulding & processing (per pc)", csvPost: "Post-processing (per pc)", csvPack: "Packaging (per pc)",
    csvLogi: "Freight & logistics (per pc)", csvAdmin: "Outsourcing admin (per pc)", csvMold: "Mould amortisation (per pc)", csvSetup: "Setup amortisation (per pc)",
    csvUnit: "Unit cost", csvTotal: "Total cost for this order", csvInit: "Upfront (mould + setup)", csvCash: "Total cash needed",
    csvBep: "Break-even quantity (BEP)", csvBepAllD: "In-house cheaper at all volumes", csvBepAllO: "Outsourcing cheaper at all volumes",
    csvBepSame: "Same", csvNote: "Note", csvTurnkeyNote: "Outsourced material is 0 because the quote is turnkey (processing included).",
    csvQtyHead: "Quantity (pcs)", csvWin: "Cheaper", csvInputs: "[Inputs]",
    csvResin: "Resin", csvUnitPrice: "Price (KRW/kg)", csvWeightG: "Part weight (g)", csvLoss: "Scrap (%)",
    csvMbPct: "Masterbatch (%)", csvAddPrice: "Additive price (KRW/kg)",
    csvMoldCost: "Mould cost (KRW)", csvCav: "Cavities", csvLife: "Amortisation volume", csvDist: "Spread",
    csvDistBasis: "amortisation volume", csvDistOrder: "this order",
    csvCycle: "Cycle time (s)", csvDefect: "Defect rate (%)",
    csvPostPack: "Post-processing (KRW/pc)", csvPackU: "Packaging (KRW/pc)", csvLogiU: "Logistics", csvLump: "total", csvPerUnit: "per piece",
    csvTon: "Machine (tonnes)", csvMach: "Machine rate (KRW/h)", csvLabor: "Labour rate (KRW/h)", csvSetupU: "Setup (KRW)",
    csvOsMode: "Quote basis", csvOsPrice: "Outsourcing price (KRW)", csvMat: "Material", csvAdminPct: "Admin (%)",
    csvLogiCost: "Freight (KRW)", csvOsMold: "Outsourced mould", csvOurs: "ours", csvTheirs: "supplier",
    csvSupply: "free issue", csvTurnkey: "turnkey"
  },

  zh: {
    perPc: "/件", unitShot: "韩元/模次", unitHour: "韩元/小时", unitPc: "韩元/件", unitWon: "韩元",
    cardKrw: "韩元/件", cardUsd: "$/件",
    perKg: "韩元/kg", kgUnit: "kg",
    calcNow: "计算中…",
    missQty: "数量", missDirect: "自主生产条件（树脂、重量、加工费）", missOs: "外协加工费",
    verdictMissing: "请输入{items}后再比较。",
    verdictTie: "两种方式的单件成本基本相同。",
    verdictWin: "按 {q} 件 · {win}每件便宜 {gap}（{pct}%）",
    winDirect: "自主生产", winOs: "外协加工",
    cardSub: "合计 {total} · 前期 {init}", enterQty: "请输入数量",
    bepNeed: "输入数量和外协价格后即可算出盈亏平衡点。",
    allQty: "全部数量", anyQtyWin: "任何数量下都是{win}更有利。",
    same: "相同", sameFixed: "固定成本与变动成本没有差异。",
    bepQty: "{n} 件",
    bepOver: "超过此数量{win}更有利，低于此数量{other}更有利。",
    practicallyNone: "实际上不存在",
    wQty: "数量为 0，需要输入数量才能计算单件成本和盈亏平衡点。",
    wWeight: "产品重量为 0，原材料费无法计算。",
    wCycle: "成型周期为 0，自主生产加工费按 0 计算。",
    wResin: "树脂单价为 0，原材料费无法计算。",
    wOs: "请输入外协加工费才能计算外协成本。",
    wRate: "每小时设备运转费与人工费均为 0。",
    wDefect: "不良率在 99% 以上时几乎不产出良品。",
    wMold: "数量超过模具寿命（{life} 件），需要 {molds} 套模具。",
    grpVar: "变动成本 · 随数量变化", grpFix: "固定成本 · 按数量分摊",
    rMat: "原材料费", rProc: "成型·加工费", rPost: "后加工费", rPack: "包装费", rLogi: "物流·运输费",
    rAdmin: "外协管理费", rMold: "模具分摊", rSetup: "换模费分摊",
    rTotal: "单件合计 · 总成本", rInvest: "前期投资（模具+换模）", rCash: "所需现金总额",
    tblEmpty: "输入数量后显示逐项比较。", tblNoQty: "未输入数量",
    cmpNote: "差额为“外协 − 自主”。正数(+)表示自主生产便宜相应金额。",
    cmpBase: "按 {q} 件",
    turnkeyNote: "外协原材料按包含材料的包工条件，因此以“—”表示。 ",
    qtyPcs: "{n} 件", curTag: "当前",
    chartNoteKrw: "韩元/件", chartNoteUsd: "USD/件（汇率 {fx}）",
    chartAria: "各数量区间单件成本比较柱状图",
    fQty: "本次数量", fShots: "所需模次", fHours: "成型工时", fRaw: "投入原料量",
    fMolds: "所需模具套数", fDiff: "单件差额", fCashD: "自主生产所需现金",
    fCashO: "外协所需现金", fMoldShare: "本单分摊模具费",
    uPcs: "件", uShot: "模次", uHour: "小时", uKg: "kg", uMold: "套", uPerPc: "/件",
    presetManual: "直接输入", grpVirgin: "原生树脂（参考行情）", grpRecycled: "再生料（参考行情）",
    srcIdle: "选择树脂预设后会填入参考单价。",
    srcHead: "参考行情的出处与基准日写在下方“单价参考”中。请按实际合同单价修改。",
    srcFx: "汇率", srcFxValue: "1,343.9 韩元/USD",
    srcFxNote: "韩国进出口银行基准汇率 2026-11-26 · 人民币 201.57 韩元",
    srcPriceSuffix: " 韩元/kg",
    confirmExample: "载入示例值会替换当前输入的内容。继续吗？",
    confirmReset: "将清空所有输入。继续吗？",
    toastExample: "已载入示例值。", toastReset: "已清空输入。",
    toastCsv: "CSV 已下载 — {name}", fileName: "成本测算", fileFallback: "产品",
    pKicker: "MFG COST WORKSHEET", pTitle: "自主生产 vs 外协加工 成本测算表",
    pItem: "产品", pNoItem: "（无产品名称）", pQty: "数量", pCur: "货币", pPrinted: "输出日期",
    pVerdict: "单件 {d} vs {o} — {txt}", pNoQty: "未输入数量",
    pWin: "{win}每件便宜 {gap}（{pct}%）。", pWinSame: "两种方式的单件成本相同。",
    pS1: "1. 汇总", pS2: "2. 分项成本", pS3: "3. 各数量区间单件成本", pS4: "4. 输入条件", pS5: "5. 比较条件",
    pHeadKind: "项目", pHeadUnit: "单件成本", pHeadTotal: "本单总成本", pHeadInit: "前期投资", pHeadCash: "所需现金",
    pHeadItem: "项目", pHeadDUnit: "自主 单件", pHeadDTot: "自主 总额", pHeadOUnit: "外协 单件", pHeadOTot: "外协 总额",
    pHeadQty: "数量", pHeadWin: "更有利", pDiff: "差额（外协−自主）", pSum: "合计",
    pBepNote: "盈亏平衡数量（BEP）：{txt}", pAllQtyDirect: "任何数量下自主生产都更有利。",
    pAllQtyOs: "任何数量下外协加工都更有利。", pBepNone: "固定成本与变动成本没有差异。",
    pBepOverD: "{n} 件 — 达到此数量以上自主生产更有利。",
    pBepOverO: "{n} 件 — 达到此数量以上外协加工更有利。",
    pWinD: "自主", pWinO: "外协", pNow: "（当前）",
    pChartNote: "各数量区间单件成本（{unit}）",
    pResin: "原料", pWeight: "产品重量 / 损耗", pMb: "色母", pMold: "模具",
    pMoldMode: "模具费分摊", pModeBasis: "按摊销数量分摊", pModeOrder: "全部计入本单",
    pCycle: "成型周期 / 不良率", pPostPack: "后加工 / 包装", pLogi: "物流费",
    pTotalLump: "{v} 总额", pUnitLump: "{v} 每件",
    pTon: "注塑机", pTonUnit: "吨", pRate: "设备运转费 / 人工费", pSetup: "换模费",
    pOsQuote: "外协报价", pOsPerPart: "每件 ", pOsPerShot: "每模次 ", pOsPerHour: "每小时 ",
    pOsMat: "材料供给", pOsSupply: "来料加工（我方供料）", pOsTurnkey: "包工包料",
    pOsAdminLogi: "外协管理费 / 运输费", pOsMold: "外协模具",
    pOsMoldOurs: "我方承担", pOsMoldTheirs: "外协方承担",
    pShots: "所需模次 / 工时",
    pFoot: "计算基准 — 原材料：重量×(1+损耗率)×树脂单价 + 重量×(1+损耗率)×色母%×助剂单价 · 成型：周期÷3,600×(设备运转费+人工费)÷(模穴数×(1−不良率)) · 模具：制作费÷摊销数量（单次订单按数量） · BEP：（自主固定成本−外协固定成本）÷（外协变动成本−自主变动成本）。不含税金、财务费用、仓储费、认证检测费。仅为参考测算表，可能与实际报价、结算不同。",
    csvTitle: "自主生产 · 外协加工 成本测算表",
    csvItem: "产品", csvQty: "数量(件)", csvCur: "货币", csvFx: "汇率(韩元/USD)", csvDate: "输出日期",
    csvKind: "项目", csvDirect: "自主生产", csvOs: "外协加工", csvDiffCol: "差额(外协-自主)",
    csvMat: "原材料费(单件)", csvProc: "成型·加工费(单件)", csvPost: "后加工费(单件)", csvPack: "包装费(单件)",
    csvLogi: "物流·运输费(单件)", csvAdmin: "外协管理费(单件)", csvMold: "模具分摊(单件)", csvSetup: "换模费分摊(单件)",
    csvUnit: "单件成本", csvTotal: "本单总成本", csvInit: "前期投资(模具+换模)", csvCash: "所需现金总额",
    csvBep: "盈亏平衡数量(BEP)", csvBepAllD: "全部数量自主生产更有利", csvBepAllO: "全部数量外协加工更有利",
    csvBepSame: "相同", csvNote: "注", csvTurnkeyNote: "外协材料为包工包料条件，外协原材料费按 0 标注。",
    csvQtyHead: "数量(件)", csvWin: "更有利", csvInputs: "[输入条件]",
    csvResin: "原料", csvUnitPrice: "单价(韩元/kg)", csvWeightG: "产品重量(g)", csvLoss: "损耗率(%)",
    csvMbPct: "色母(%)", csvAddPrice: "助剂单价(韩元/kg)",
    csvMoldCost: "模具制作费(韩元)", csvCav: "模穴数", csvLife: "摊销数量", csvDist: "分摊",
    csvDistBasis: "摊销数量", csvDistOrder: "本次数量",
    csvCycle: "成型周期(秒)", csvDefect: "不良率(%)",
    csvPostPack: "后加工(韩元/件)", csvPackU: "包装(韩元/件)", csvLogiU: "物流", csvLump: "总额", csvPerUnit: "每件",
    csvTon: "注塑机(吨)", csvMach: "设备运转费(韩元/小时)", csvLabor: "人工费(韩元/小时)", csvSetupU: "换模费(韩元)",
    csvOsMode: "外协方式", csvOsPrice: "外协单价(韩元)", csvMat: "材料", csvAdminPct: "管理费(%)",
    csvLogiCost: "运输费(韩元)", csvOsMold: "外协模具", csvOurs: "我方", csvTheirs: "外协方",
    csvSupply: "来料加工", csvTurnkey: "包工包料"
  },

  ja: {
    perPc: "/個", unitShot: "ウォン/shot", unitHour: "ウォン/h", unitPc: "ウォン/個", unitWon: "ウォン",
    cardKrw: "ウォン/個", cardUsd: "$/個",
    perKg: "ウォン/kg", kgUnit: "kg",
    calcNow: "計算中…",
    missQty: "数量", missDirect: "自社生産条件（樹脂・重量・加工費）", missOs: "外注加工費",
    verdictMissing: "比較するには{items}を入力してください。",
    verdictTie: "両方式の1個あたり原価は実質同じです。",
    verdictWin: "{q}個基準 · {win}が1個あたり{gap}（{pct}%）安い",
    winDirect: "自社生産", winOs: "外注加工",
    cardSub: "合計 {total} · 初期 {init}", enterQty: "数量を入力してください",
    bepNeed: "数量と外注価格を入力すると計算されます。",
    allQty: "全数量", anyQtyWin: "どの数量でも{win}が有利です。",
    same: "同じ", sameFixed: "固定費・変動費の差がありません。",
    bepQty: "{n}個",
    bepOver: "この数量を超えると{win}が有利、下回ると{other}が有利です。",
    practicallyNone: "実質なし",
    wQty: "数量が0です。数量を入れると1個あたり原価とBEPが計算されます。",
    wWeight: "製品重量が0です。原材料費が計上されません。",
    wCycle: "サイクルタイムが0です。自社生産の加工費が0で計算されます。",
    wResin: "樹脂単価が0です。原材料費が計上されません。",
    wOs: "外注加工費を入力すると外注原価が計算されます。",
    wRate: "時間あたり機械稼働費・人件費が0です。",
    wDefect: "不良率が99%以上だと良品がほとんど出ません。",
    wMold: "数量が金型寿命（{life}個）を超え、金型{molds}型分が必要です。",
    grpVar: "変動費 · 数量に比例", grpFix: "固定費 · 数量に配分",
    rMat: "原材料費", rProc: "成形・加工費", rPost: "後加工費", rPack: "包装費", rLogi: "物流・運送費",
    rAdmin: "外注管理費", rMold: "金型償却", rSetup: "段取り費配分",
    rTotal: "1個あたり合計 · 総原価", rInvest: "初期投資（金型+段取り）", rCash: "必要現金合計",
    tblEmpty: "数量を入力すると項目別比較が表示されます。", tblNoQty: "数量未入力",
    cmpNote: "差額は「外注 − 自社」です。プラス(+)なら自社生産がその分安いという意味です。",
    cmpBase: "{q} pcs 基準",
    turnkeyNote: "外注材料は素材込み（ターンキー）条件のため「—」としています。 ",
    qtyPcs: "{n}個", curTag: "現在",
    chartNoteKrw: "ウォン/個", chartNoteUsd: "USD/個（レート {fx}）",
    chartAria: "数量帯別の1個あたり原価比較棒グラフ",
    fQty: "今回数量", fShots: "必要ショット数", fHours: "成形稼働時間", fRaw: "投入原料量",
    fMolds: "必要金型数", fDiff: "1個あたり差額", fCashD: "自社の必要現金",
    fCashO: "外注の必要現金", fMoldShare: "今回配分の金型費",
    uPcs: "pcs", uShot: "shot", uHour: "h", uKg: "kg", uMold: "型", uPerPc: "/個",
    presetManual: "直接入力", grpVirgin: "バージン樹脂（参考市況）", grpRecycled: "再生樹脂（参考市況）",
    srcIdle: "樹脂プリセットを選ぶと参考単価が入ります。",
    srcHead: "参考市況の出典・基準日は下の「単価参考」に記載しています。実際の契約単価に直して使ってください。",
    srcFx: "為替", srcFxValue: "1,343.9ウォン/USD",
    srcFxNote: "韓国輸出入銀行 基準レート 2026-11-26 · 人民元 201.57ウォン",
    srcPriceSuffix: " ウォン/kg",
    confirmExample: "例の値を読み込むと、いま入力した内容が変わります。続けますか？",
    confirmReset: "すべての入力を消します。続けますか？",
    toastExample: "例の値を読み込みました。", toastReset: "入力を消しました。",
    toastCsv: "CSVをダウンロードしました — {name}", fileName: "原価計算", fileFallback: "品目",
    pKicker: "MFG COST WORKSHEET", pTitle: "自社生産 vs 外注加工 原価計算書",
    pItem: "品目", pNoItem: "（品目名なし）", pQty: "数量", pCur: "通貨", pPrinted: "出力日",
    pVerdict: "1個 {d} vs {o} — {txt}", pNoQty: "数量未入力",
    pWin: "{win}が1個あたり{gap}（{pct}%）安いです。", pWinSame: "両方式の1個あたり原価は同じです。",
    pS1: "1. 概要", pS2: "2. 項目別原価", pS3: "3. 数量帯別の1個あたり原価", pS4: "4. 入力条件", pS5: "5. 比較条件",
    pHeadKind: "区分", pHeadUnit: "1個あたり原価", pHeadTotal: "今回数量の総原価", pHeadInit: "初期投資", pHeadCash: "必要現金",
    pHeadItem: "項目", pHeadDUnit: "自社 1個", pHeadDTot: "自社 総額", pHeadOUnit: "外注 1個", pHeadOTot: "外注 総額",
    pHeadQty: "数量", pHeadWin: "有利", pDiff: "差額（外注−自社）", pSum: "合計",
    pBepNote: "損益分岐数量（BEP）：{txt}", pAllQtyDirect: "どの数量でも自社生産が有利です。",
    pAllQtyOs: "どの数量でも外注加工が有利です。", pBepNone: "固定費・変動費の差がありません。",
    pBepOverD: "{n}個 — この数量以上なら自社生産が有利です。",
    pBepOverO: "{n}個 — この数量以上なら外注加工が有利です。",
    pWinD: "自社", pWinO: "外注", pNow: "（現在）",
    pChartNote: "数量帯別の1個あたり原価（{unit}）",
    pResin: "原料", pWeight: "製品重量 / ロス", pMb: "マスターバッチ", pMold: "金型",
    pMoldMode: "金型費の配分", pModeBasis: "償却数量に配分", pModeOrder: "今回数量に全額",
    pCycle: "サイクルタイム / 不良率", pPostPack: "後加工 / 包装", pLogi: "物流費",
    pTotalLump: "{v} 総額", pUnitLump: "{v} 1個あたり",
    pTon: "射出成形機", pTonUnit: "トン", pRate: "機械稼働費 / 人件費", pSetup: "段取り費",
    pOsQuote: "外注見積", pOsPerPart: "1個 ", pOsPerShot: "1ショット ", pOsPerHour: "1時間 ",
    pOsMat: "材料支給", pOsSupply: "支給（材料は当社負担）", pOsTurnkey: "素材込み",
    pOsAdminLogi: "外注管理費 / 運送費", pOsMold: "外注金型",
    pOsMoldOurs: "当社負担", pOsMoldTheirs: "外注先負担",
    pShots: "必要ショット / 稼働時間",
    pFoot: "計算基準 — 原材料：重量×(1+ロス率)×樹脂単価 + 重量×(1+ロス率)×マスターバッチ%×添加剤単価 · 成形：サイクル÷3,600×(機械稼働費+人件費)÷(キャビティ×(1−不良率)) · 金型：製作費÷償却基準数量（単発注は数量） · BEP：（自社固定費−外注固定費）÷（外注変動費−自社変動費）。税金・金融費用・倉庫費・認証検査費は含みません。参考用の計算書であり、実際の見積・決算とは異なる場合があります。",
    csvTitle: "自社生産 · 外注加工 原価計算書",
    csvItem: "品目", csvQty: "数量(pcs)", csvCur: "通貨", csvFx: "為替(ウォン/USD)", csvDate: "出力日",
    csvKind: "区分", csvDirect: "自社生産", csvOs: "外注加工", csvDiffCol: "差額(外注-自社)",
    csvMat: "原材料費(1個)", csvProc: "成形・加工費(1個)", csvPost: "後加工費(1個)", csvPack: "包装費(1個)",
    csvLogi: "物流・運送費(1個)", csvAdmin: "外注管理費(1個)", csvMold: "金型償却(1個)", csvSetup: "段取り費配分(1個)",
    csvUnit: "1個あたり原価", csvTotal: "今回数量の総原価", csvInit: "初期投資(金型+段取り)", csvCash: "必要現金合計",
    csvBep: "損益分岐数量(BEP)", csvBepAllD: "全数量で自社生産が有利", csvBepAllO: "全数量で外注加工が有利",
    csvBepSame: "同じ", csvNote: "注", csvTurnkeyNote: "外注材料は素材込み条件のため、外注原材料費を0と表記しました。",
    csvQtyHead: "数量(pcs)", csvWin: "有利", csvInputs: "[入力条件]",
    csvResin: "原料", csvUnitPrice: "単価(ウォン/kg)", csvWeightG: "製品重量(g)", csvLoss: "ロス率(%)",
    csvMbPct: "マスターバッチ(%)", csvAddPrice: "添加剤単価(ウォン/kg)",
    csvMoldCost: "金型製作費(ウォン)", csvCav: "キャビティ", csvLife: "償却数量", csvDist: "配分",
    csvDistBasis: "償却数量", csvDistOrder: "今回数量",
    csvCycle: "サイクルタイム(秒)", csvDefect: "不良率(%)",
    csvPostPack: "後加工(ウォン/個)", csvPackU: "包装(ウォン/個)", csvLogiU: "物流", csvLump: "総額", csvPerUnit: "1個あたり",
    csvTon: "射出成形機(トン)", csvMach: "機械稼働費(ウォン/h)", csvLabor: "人件費(ウォン/h)", csvSetupU: "段取り費(ウォン)",
    csvOsMode: "外注方式", csvOsPrice: "外注単価(ウォン)", csvMat: "材料", csvAdminPct: "管理費(%)",
    csvLogiCost: "運送費(ウォン)", csvOsMold: "外注金型", csvOurs: "当社", csvTheirs: "外注先",
    csvSupply: "支給", csvTurnkey: "素材込み"
  }
};
var L = STR[LANG];

function t(key, rep) {
  var s = L[key];
  if (s == null) s = STR.ko[key];
  if (s == null) return key;
  if (rep) {
    s = s.replace(/\{(\w+)\}/g, function (m, k) { return rep[k] != null ? rep[k] : m; });
  }
  return s;
}

/* ---------- helpers ---------- */
var $ = function (id) { return document.getElementById(id); };
var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
var num = function (id) {
  var el = $(id); if (!el) return 0;
  var v = parseFloat(el.value);
  return isFinite(v) ? v : 0;
};
var radioVal = function (name) {
  var el = document.querySelector('input[name="' + name + '"]:checked');
  return el ? el.value : "";
};
var nf = function (v, d) {
  if (!isFinite(v)) v = 0;
  return v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
};
var sign = function (v) { return v > 0 ? "+" : (v < 0 ? "−" : ""); };

/* ---------- money display ---------- */
var state = { cur: "KRW", fx: 1343.9 };
function conv(krw) { return state.cur === "USD" ? krw / (state.fx || 1) : krw; }
function money(krw, per, blankZero) {
  if (krw === null || krw === undefined || !isFinite(krw)) return "—";
  if (blankZero && Math.abs(krw) < 0.0001) return "—";
  var v = conv(krw);
  var d;
  if (per) { d = state.cur === "USD" ? (Math.abs(v) < 10 ? 3 : 2) : 1; }
  else { d = state.cur === "USD" ? (Math.abs(v) < 1000 ? 2 : 0) : 0; }
  var s = nf(v, d);
  if (state.cur === "USD") return "$" + s;
  return IS_KO ? s + "원" : s + " KRW";
}
function unitMoney(krw) { return money(krw, true); }
/* 결과 카드 큰 숫자 — 통화 표기를 작은 글씨로 붙여 폭을 줄입니다. */
function cardMoney(krw) {
  if (krw === null || krw === undefined || !isFinite(krw)) return "—";
  var v = conv(krw);
  var d = state.cur === "USD" ? (Math.abs(v) < 10 ? 3 : 2) : 1;
  var num = nf(v, d);
  return num + "<small>" + esc(state.cur === "USD" ? t("cardUsd") : t("cardKrw")) + "</small>";
}
function totMoney(krw) { return money(krw, false); }

/* ---------- presets ---------- */
var PRESETS = [
  { key: "PC", price: 2819,
    label: { ko: "PC (폴리카보네이트, 버진)", en: "PC (polycarbonate, virgin)", zh: "PC（聚碳酸酯，原生）", ja: "PC（ポリカーボネート・バージン）" },
    name: { ko: "PC (버진)", en: "PC (virgin)", zh: "PC（原生）", ja: "PC（バージン）" },
    src: {
      ko: "중국 현물 13,983위안/t (SunSirs, 2026-11-25) × 201.57원/위안 · 운임·관세 별도",
      en: "China spot CNY 13,983/t (SunSirs, 2026-11-25) × KRW 201.57/CNY · freight and duty excluded",
      zh: "中国现货 13,983 元/吨（SunSirs，2026-11-25）× 201.57 韩元/元 · 不含运费、关税",
      ja: "中国現物 13,983元/t（SunSirs、2026-11-25）× 201.57ウォン/元 · 運賃・関税別"
    } },
  { key: "ABS", price: 2305,
    label: { ko: "ABS (버진)", en: "ABS (virgin)", zh: "ABS（原生）", ja: "ABS（バージン）" },
    name: { ko: "ABS (버진)", en: "ABS (virgin)", zh: "ABS（原生）", ja: "ABS（バージン）" },
    src: {
      ko: "중국 현물 11,433위안/t (SunSirs, 2026-11-25) × 201.57원/위안 · 운임·관세 별도",
      en: "China spot CNY 11,433/t (SunSirs, 2026-11-25) × KRW 201.57/CNY · freight and duty excluded",
      zh: "中国现货 11,433 元/吨（SunSirs，2026-11-25）× 201.57 韩元/元 · 不含运费、关税",
      ja: "中国現物 11,433元/t（SunSirs、2026-11-25）× 201.57ウォン/元 · 運賃・関税別"
    } },
  { key: "PP", price: 1942,
    label: { ko: "PP (폴리프로필렌, 버진)", en: "PP (polypropylene, virgin)", zh: "PP（聚丙烯，原生）", ja: "PP（ポリプロピレン・バージン）" },
    name: { ko: "PP (버진)", en: "PP (virgin)", zh: "PP（原生）", ja: "PP（バージン）" },
    src: {
      ko: "중국 현물 9,633위안/t (SunSirs, 2026-11-25) × 201.57원/위안 · 운임·관세 별도",
      en: "China spot CNY 9,633/t (SunSirs, 2026-11-25) × KRW 201.57/CNY · freight and duty excluded",
      zh: "中国现货 9,633 元/吨（SunSirs，2026-11-25）× 201.57 韩元/元 · 不含运费、关税",
      ja: "中国現物 9,633元/t（SunSirs、2026-11-25）× 201.57ウォン/元 · 運賃・関税別"
    } },
  { key: "HDPE", price: 2036,
    label: { ko: "HDPE (버진)", en: "HDPE (virgin)", zh: "HDPE（原生）", ja: "HDPE（バージン）" },
    name: { ko: "HDPE (버진)", en: "HDPE (virgin)", zh: "HDPE（原生）", ja: "HDPE（バージン）" },
    src: {
      ko: "중국 현물 10,100위안/t (SunSirs, 2026-11-25) × 201.57원/위안 · 운임·관세 별도",
      en: "China spot CNY 10,100/t (SunSirs, 2026-11-25) × KRW 201.57/CNY · freight and duty excluded",
      zh: "中国现货 10,100 元/吨（SunSirs，2026-11-25）× 201.57 韩元/元 · 不含运费、关税",
      ja: "中国現物 10,100元/t（SunSirs、2026-11-25）× 201.57ウォン/元 · 運賃・関税別"
    } },
  { key: "LDPE", price: 2090,
    label: { ko: "LDPE (버진)", en: "LDPE (virgin)", zh: "LDPE（原生）", ja: "LDPE（バージン）" },
    name: { ko: "LDPE (버진)", en: "LDPE (virgin)", zh: "LDPE（原生）", ja: "LDPE（バージン）" },
    src: {
      ko: "중국 현물 10,367위안/t (SunSirs, 2026-11-25) × 201.57원/위안 · 운임·관세 별도",
      en: "China spot CNY 10,367/t (SunSirs, 2026-11-25) × KRW 201.57/CNY · freight and duty excluded",
      zh: "中国现货 10,367 元/吨（SunSirs，2026-11-25）× 201.57 韩元/元 · 不含运费、关税",
      ja: "中国現物 10,367元/t（SunSirs、2026-11-25）× 201.57ウォン/元 · 運賃・関税別"
    } },
  { key: "PET", price: 1365,
    label: { ko: "PET (버진 칩)", en: "PET (virgin chip)", zh: "PET（原生切片）", ja: "PET（バージンチップ）" },
    name: { ko: "PET (버진)", en: "PET (virgin)", zh: "PET（原生）", ja: "PET（バージン）" },
    src: {
      ko: "PET Chip 구매단가 평균 1,365원/kg (삼양홀딩스 2025년 3분기 보고서, ICIS·PCI FOB Korea 기준)",
      en: "Average PET chip purchase price KRW 1,365/kg (Samyang Holdings Q3 2025 report, ICIS/PCI FOB Korea)",
      zh: "PET 切片平均采购单价 1,365 韩元/kg（三养控股 2025 年三季度报告，ICIS·PCI FOB Korea 基准）",
      ja: "PETチップ購入単価 平均1,365ウォン/kg（三養ホールディングス2025年3Q報告書、ICIS・PCI FOB Korea基準）"
    } },
  { key: "rPC", price: 1613,
    label: { ko: "재생 PC (리그라인드)", en: "Recycled PC (regrind)", zh: "再生 PC（粉碎料）", ja: "再生PC（リグラインド）" },
    name: { ko: "재생 PC (리그라인드)", en: "Recycled PC (regrind)", zh: "再生 PC（粉碎料）", ja: "再生PC（リグラインド）" },
    src: {
      ko: "PC 리그라인드 CFR 한국 1,200달러/t (Polymer in Stock, 2026-11-05) × 1,343.9원",
      en: "PC regrind CFR Korea USD 1,200/t (Polymer in Stock, 2026-11-05) × KRW 1,343.9",
      zh: "PC 粉碎料 CFR 韩国 1,200 美元/吨（Polymer in Stock，2026-11-05）× 1,343.9 韩元",
      ja: "PCリグラインド CFR 韓国 1,200ドル/t（Polymer in Stock、2026-11-05）× 1,343.9ウォン"
    } },
  { key: "rPCn", price: 1850,
    label: { ko: "재생 PC (rPC 내추럴)", en: "Recycled PC (rPC natural)", zh: "再生 PC（rPC 本色）", ja: "再生PC（rPCナチュラル）" },
    name: { ko: "재생 PC (rPC 내추럴)", en: "Recycled PC (rPC natural)", zh: "再生 PC（rPC 本色）", ja: "再生PC（rPCナチュラル）" },
    src: {
      ko: "rPC 내추럴 아시아 1,300~1,450달러/t 중간값 (Fukutomi Recycling 주간 리포트, 2026-09-11)",
      en: "rPC natural Asia USD 1,300–1,450/t midpoint (Fukutomi Recycling weekly report, 2026-09-11)",
      zh: "rPC 本色 亚洲 1,300~1,450 美元/吨 中间值（Fukutomi Recycling 周报，2026-09-11）",
      ja: "rPCナチュラル アジア 1,300〜1,450ドル/t 中間値（Fukutomi Recycling 週報、2026-09-11）"
    } },
  { key: "rABS", price: 1437,
    label: { ko: "재생 ABS 펠렛", en: "Recycled ABS pellet", zh: "再生 ABS 颗粒", ja: "再生ABSペレット" },
    name: { ko: "재생 ABS 펠렛", en: "Recycled ABS pellet", zh: "再生 ABS 颗粒", ja: "再生ABSペレット" },
    src: {
      ko: "한국환경공단 재활용가능자원 가격조사 2026-11 · 전국 평균, 부가세 포함·물류비 제외",
      en: "Korea Environment Corporation recyclables price survey, Nov 2026 · national average, VAT included, freight excluded",
      zh: "韩国环境公团 可再生资源价格调查 2026-11 · 全国平均，含增值税、不含物流费",
      ja: "韓国環境公団 再活用可能資源価格調査 2026-11 · 全国平均、付加価値税込み・物流費別"
    } },
  { key: "rPP", price: 784,
    label: { ko: "재생 PP 펠렛", en: "Recycled PP pellet", zh: "再生 PP 颗粒", ja: "再生PPペレット" },
    name: { ko: "재생 PP 펠렛", en: "Recycled PP pellet", zh: "再生 PP 颗粒", ja: "再生PPペレット" },
    src: {
      ko: "한국환경공단 재활용가능자원 가격조사 2026-11 · 전국 평균, 부가세 포함·물류비 제외",
      en: "Korea Environment Corporation recyclables price survey, Nov 2026 · national average, VAT included, freight excluded",
      zh: "韩国环境公团 可再生资源价格调查 2026-11 · 全国平均，含增值税、不含物流费",
      ja: "韓国環境公団 再活用可能資源価格調査 2026-11 · 全国平均、付加価値税込み・物流費別"
    } },
  { key: "rPE", price: 984,
    label: { ko: "재생 PE 펠렛", en: "Recycled PE pellet", zh: "再生 PE 颗粒", ja: "再生PEペレット" },
    name: { ko: "재생 PE 펠렛", en: "Recycled PE pellet", zh: "再生 PE 颗粒", ja: "再生PEペレット" },
    src: {
      ko: "한국환경공단 재활용가능자원 가격조사 2026-11 · 전국 평균, 부가세 포함·물류비 제외",
      en: "Korea Environment Corporation recyclables price survey, Nov 2026 · national average, VAT included, freight excluded",
      zh: "韩国环境公团 可再生资源价格调查 2026-11 · 全国平均，含增值税、不含物流费",
      ja: "韓国環境公団 再活用可能資源価格調査 2026-11 · 全国平均、付加価値税込み・物流費別"
    } },
  { key: "rPS", price: 1256,
    label: { ko: "재생 PS 펠렛", en: "Recycled PS pellet", zh: "再生 PS 颗粒", ja: "再生PSペレット" },
    name: { ko: "재생 PS 펠렛", en: "Recycled PS pellet", zh: "再生 PS 颗粒", ja: "再生PSペレット" },
    src: {
      ko: "한국환경공단 재활용가능자원 가격조사 2026-11 · 전국 평균, 부가세 포함·물류비 제외",
      en: "Korea Environment Corporation recyclables price survey, Nov 2026 · national average, VAT included, freight excluded",
      zh: "韩国环境公团 可再生资源价格调查 2026-11 · 全国平均，含增值税、不含物流费",
      ja: "韓国環境公団 再活用可能資源価格調査 2026-11 · 全国平均、付加価値税込み・物流費別"
    } }
];
function pl(p) { return p.label[LANG] || p.label.ko; }
function pn(p) { return p.name[LANG] || p.name.ko; }
function ps(p) { return p.src[LANG] || p.src.ko; }

var EXAMPLE_ITEM = {
  ko: "컨트롤박스 하우징 (예시)", en: "Control box housing (example)",
  zh: "控制箱外壳（示例）", ja: "コントロールボックスハウジング（例）"
};

/* ---------- example / blank ---------- */
var EXAMPLE = {
  item: EXAMPLE_ITEM[LANG], qty: 10000, cur: "KRW", fx: 1343.9,
  resinPreset: "ABS", resinName: "", resinPrice: 2305,
  weight: 85, loss: 8, mbPct: 2, mbPrice: 3500,
  moldCost: 18000000, cavities: 4, moldLife: 300000, moldMode: "basis",
  cycle: 32, defect: 2, post: 120, pack: 35, logiMode: "total", logiVal: 450000,
  dpTon: 150, dpMachine: 22000, dpLabor: 18000, dpSetup: 350000,
  osMode: "perPart", osPrice: 620, osMat: "turnkey", osAdmin: 3, osLogi: 0, osMold: true
};
var BLANK = {
  item: "", qty: 0, cur: "KRW", fx: 1343.9,
  resinPreset: "", resinName: "", resinPrice: 0,
  weight: 0, loss: 0, mbPct: 0, mbPrice: 0,
  moldCost: 0, cavities: 1, moldLife: 100000, moldMode: "basis",
  cycle: 0, defect: 0, post: 0, pack: 0, logiMode: "total", logiVal: 0,
  dpTon: 0, dpMachine: 0, dpLabor: 0, dpSetup: 0,
  osMode: "perPart", osPrice: 0, osMat: "turnkey", osAdmin: 0, osLogi: 0, osMold: true
};

/* ---------- fields ---------- */
function fill(p) {
  $("item").value = p.item;
  $("qty").value = p.qty;
  $("cur").value = p.cur;
  $("fx").value = p.fx;
  $("resinPreset").value = p.resinPreset || "";
  $("resinName").value = p.resinName;
  $("resinPrice").value = p.resinPrice;
  $("weight").value = p.weight;
  $("loss").value = p.loss;
  $("mbPct").value = p.mbPct;
  $("mbPrice").value = p.mbPrice;
  $("moldCost").value = p.moldCost;
  $("cavities").value = p.cavities;
  $("moldLife").value = p.moldLife;
  document.querySelectorAll('input[name="moldMode"]').forEach(function (r) { r.checked = (r.value === p.moldMode); });
  $("cycle").value = p.cycle;
  $("defect").value = p.defect;
  $("post").value = p.post;
  $("pack").value = p.pack;
  $("logiMode").value = p.logiMode;
  $("logiVal").value = p.logiVal;
  $("dpTon").value = p.dpTon;
  $("dpMachine").value = p.dpMachine;
  $("dpLabor").value = p.dpLabor;
  $("dpSetup").value = p.dpSetup;
  $("osMode").value = p.osMode;
  $("osPrice").value = p.osPrice;
  document.querySelectorAll('input[name="osMat"]').forEach(function (r) { r.checked = (r.value === p.osMat); });
  $("osAdmin").value = p.osAdmin;
  $("osLogi").value = p.osLogi;
  $("osMold").checked = !!p.osMold;
  syncUnitLabels();
}
function read() {
  return {
    item: $("item").value.trim(), qty: Math.max(0, num("qty")), cur: $("cur").value, fx: Math.max(1, num("fx")),
    resinPreset: $("resinPreset").value,
    resinName: $("resinName").value.trim(), resinPrice: Math.max(0, num("resinPrice")),
    weight: Math.max(0, num("weight")), loss: clamp(num("loss"), 0, 99),
    mbPct: clamp(num("mbPct"), 0, 100), mbPrice: Math.max(0, num("mbPrice")),
    moldCost: Math.max(0, num("moldCost")), cavities: Math.max(1, Math.round(num("cavities"))),
    moldLife: Math.max(1, num("moldLife")), moldMode: radioVal("moldMode") || "basis",
    cycle: Math.max(0, num("cycle")), defect: clamp(num("defect"), 0, 99),
    post: Math.max(0, num("post")), pack: Math.max(0, num("pack")),
    logiMode: $("logiMode").value, logiVal: Math.max(0, num("logiVal")),
    dpTon: Math.max(0, num("dpTon")), dpMachine: Math.max(0, num("dpMachine")),
    dpLabor: Math.max(0, num("dpLabor")), dpSetup: Math.max(0, num("dpSetup")),
    osMode: $("osMode").value, osPrice: Math.max(0, num("osPrice")),
    osMat: radioVal("osMat") || "turnkey", osAdmin: Math.max(0, num("osAdmin")),
    osLogi: Math.max(0, num("osLogi")), osMold: $("osMold").checked
  };
}
function syncUnitLabels() {
  var m = $("osMode").value;
  $("osPriceUnit").textContent = m === "perShot" ? t("unitShot") : (m === "perHour" ? t("unitHour") : t("unitPc"));
  $("logiUnit").textContent = $("logiMode").value === "unit" ? t("unitPc") : t("unitWon");
}

/* ---------- compute ---------- */
function compute(s, q) {
  if (q === undefined) q = s.qty;
  var out = { q: q };
  var goodPerShot = s.cavities * (1 - s.defect / 100);
  out.goodPerShot = goodPerShot;
  out.shots = goodPerShot > 0 ? q / goodPerShot : 0;
  out.hours = out.shots * s.cycle / 3600;

  var baseKg = s.weight / 1000 * (1 + s.loss / 100);
  out.baseKg = baseKg;
  out.matResin = baseKg * s.resinPrice;
  out.matMB = baseKg * (s.mbPct / 100) * s.mbPrice;
  out.mat = out.matResin + out.matMB;
  out.rawKg = baseKg * q;

  var rate = s.dpMachine + s.dpLabor;
  out.rate = rate;
  out.proc = goodPerShot > 0 ? (s.cycle / 3600) * rate / goodPerShot : 0;

  var molds = Math.max(1, Math.ceil(q / s.moldLife));
  out.molds = molds;
  out.moldCash = s.moldCost * molds;
  if (s.moldMode === "basis") {
    out.moldPerUnit = s.moldCost / s.moldLife;
    out.moldShare = Math.min(out.moldPerUnit * q, out.moldCash);
  } else {
    out.moldPerUnit = q > 0 ? out.moldCash / q : 0;
    out.moldShare = out.moldCash;
  }
  out.setupPerUnit = q > 0 ? s.dpSetup / q : 0;
  out.setupShare = s.dpSetup;

  out.logiPerUnit = s.logiMode === "total" ? (q > 0 ? s.logiVal / q : 0) : s.logiVal;
  out.logiShare = s.logiMode === "total" ? s.logiVal : s.logiVal * q;

  out.varDirect = out.mat + out.proc + s.post + s.pack + out.logiPerUnit;
  out.unitDirect = out.varDirect + out.moldPerUnit + out.setupPerUnit;
  out.costDirect = out.unitDirect * q;
  out.cashDirect = (out.mat + out.proc + s.post + s.pack) * q + out.logiShare + s.dpSetup + out.moldCash;

  if (s.osMode === "perShot") { out.osUnit = goodPerShot > 0 ? s.osPrice / goodPerShot : 0; }
  else if (s.osMode === "perHour") { out.osUnit = goodPerShot > 0 ? (s.cycle / 3600) * s.osPrice / goodPerShot : 0; }
  else { out.osUnit = s.osPrice; }
  out.osMat = s.osMat === "supply" ? out.mat : 0;
  out.osAdminUnit = out.osUnit * s.osAdmin / 100;
  out.osLogiPerUnit = q > 0 ? s.osLogi / q : 0;
  out.osMoldPerUnit = s.osMold ? out.moldPerUnit : 0;
  out.unitOs = out.osUnit + out.osMat + out.osAdminUnit + out.osLogiPerUnit + out.osMoldPerUnit;
  out.costOs = out.unitOs * q;
  out.cashOs = (out.osUnit + out.osMat + out.osAdminUnit) * q + s.osLogi + (s.osMold ? out.moldCash : 0);

  out.diffUnit = out.unitOs - out.unitDirect;
  out.diffTotal = out.costOs - out.costDirect;

  /* BEP — 고정비/변동비로 분해 */
  var fd = (s.moldMode === "order" ? out.moldCash : 0) + s.dpSetup + (s.logiMode === "total" ? s.logiVal : 0);
  var fo = (s.moldMode === "order" && s.osMold ? out.moldCash : 0) + s.osLogi;
  var vd = out.mat + out.proc + s.post + s.pack + (s.logiMode === "unit" ? s.logiVal : 0);
  var vo = out.osUnit + out.osMat + out.osAdminUnit;
  out.fd = fd; out.fo = fo; out.vd = vd; out.vo = vo;
  var slope = vo - vd;
  out.slope = slope;
  var eps = 1e-7;
  if (Math.abs(slope) < eps) {
    out.bep = null;
    out.bepDir = fd < fo ? "direct" : (fd > fo ? "os" : "same");
  } else {
    var x = (fd - fo) / slope;
    out.bepRaw = x;
    if (x <= 0) { out.bep = null; out.bepDir = slope > 0 ? "direct" : "os"; }
    else { out.bep = Math.ceil(x); out.bepDir = slope > 0 ? "direct" : "os"; }
  }
  return out;
}

/* ---------- render: breakdown ---------- */
function breakdownParts(c, s, side) {
  var total = side === "d" ? c.unitDirect : c.unitOs;
  if (total <= 0) total = 1;
  if (side === "d") {
    return [
      { k: t("rMat"), v: c.mat, col: "#1f5c8b" },
      { k: t("rProc"), v: c.proc, col: "#4b86b4" },
      { k: t("rMold"), v: c.moldPerUnit, col: "#7fa8c9" },
      { k: t("rSetup"), v: c.setupPerUnit, col: "#b9cfe0" },
      { k: t("rPost") + " · " + t("rLogi"), v: s.post + s.pack + c.logiPerUnit, col: "#dbe6ef" }
    ].map(function (x) { x.p = x.v / total * 100; return x; });
  }
  return [
    { k: t("rProc"), v: c.osUnit, col: "#b3261e" },
    { k: t("rMat"), v: c.osMat, col: "#c65a52" },
    { k: t("rAdmin"), v: c.osAdminUnit, col: "#dc857f" },
    { k: t("rMold"), v: c.osMoldPerUnit, col: "#eab3ae" },
    { k: t("rPost"), v: s.post + s.pack + c.osLogiPerUnit, col: "#f6d7d4" }
  ].map(function (x) { x.p = x.v / total * 100; return x; });
}
function barHTML(parts) {
  return parts.filter(function (p) { return p.p > 0.05; }).map(function (p) {
    return '<i style="width:' + p.p.toFixed(2) + '%;background:' + p.col + '" title="' + esc(p.k) + " " + p.p.toFixed(1) + '%"></i>';
  }).join("");
}
function legendHTML(c, s) {
  var L1 = [];
  L1.push("<span><i style=\"background:#1f5c8b\"></i>" + esc(t("winDirect")) + ": " + esc(t("rMat")) + " " + pct(c.mat, c.unitDirect) + " · " + esc(t("rProc")) + " " + pct(c.proc, c.unitDirect) + " · " + esc(t("rMold")) + " " + pct(c.moldPerUnit, c.unitDirect) + " · " + esc(t("rPost")) + " " + pct(s.post + s.pack + c.logiPerUnit + c.setupPerUnit, c.unitDirect) + "</span>");
  L1.push("<span><i style=\"background:#b3261e\"></i>" + esc(t("winOs")) + ": " + esc(t("rProc")) + " " + pct(c.osUnit, c.unitOs) + " · " + esc(t("rMat")) + " " + pct(c.osMat, c.unitOs) + " · " + esc(t("rAdmin")) + " " + pct(c.osAdminUnit, c.unitOs) + " · " + esc(t("rMold")) + " " + pct(c.osMoldPerUnit, c.unitOs) + "</span>");
  return L1.join("");
}
function pct(v, base) { if (!base) return "0%"; return (v / base * 100).toFixed(0) + "%"; }

function render() {
  var s = read();
  state.cur = s.cur; state.fx = s.fx;
  var c = compute(s, s.qty);
  var q = s.qty;

  /* meta */
  $("rcMeta").textContent = nf(q, 0) + " pcs · " + (s.cur === "USD" ? "USD" : "KRW");

  /* verdict */
  var v = $("verdict");
  var missing = [];
  if (q <= 0) missing.push(t("missQty"));
  if (c.unitDirect <= 0) missing.push(t("missDirect"));
  if (c.unitOs <= 0) missing.push(t("missOs"));
  var valid = missing.length === 0;
  if (!valid) {
    v.className = "mf-verdict mf-tie";
    v.innerHTML = esc(t("verdictMissing", { items: missing.join(" · ") }));
  } else if (Math.abs(c.diffUnit) < 0.05) {
    v.className = "mf-verdict mf-tie";
    v.innerHTML = esc(t("verdictTie"));
  } else {
    var winTxt = c.diffUnit > 0 ? t("winDirect") : t("winOs");
    var gap = Math.abs(c.diffUnit);
    var gapPct = Math.abs(c.diffUnit) / Math.max(c.unitDirect, c.unitOs) * 100;
    v.className = "mf-verdict";
    v.innerHTML = esc(t("verdictWin", {
      q: nf(q, 0), win: winTxt, gap: unitMoney(gap), pct: gapPct.toFixed(1)
    }));
  }

  /* cards */
  if (q > 0) {
    $("unitDirect").innerHTML = cardMoney(c.unitDirect);
    $("unitOs").innerHTML = cardMoney(c.unitOs);
    $("subDirect").textContent = t("cardSub", { total: totMoney(c.costDirect), init: totMoney(c.moldCash + s.dpSetup) });
    $("subOs").textContent = t("cardSub", { total: totMoney(c.costOs), init: totMoney(s.osMold ? c.moldCash : 0) });
    $("barDirect").innerHTML = barHTML(breakdownParts(c, s, "d"));
    $("barOs").innerHTML = barHTML(breakdownParts(c, s, "o"));
  } else {
    $("unitDirect").innerHTML = "—<small>" + esc(t("perPc")) + "</small>";
    $("unitOs").innerHTML = "—<small>" + esc(t("perPc")) + "</small>";
    $("subDirect").textContent = t("enterQty");
    $("subOs").textContent = t("enterQty");
    $("barDirect").innerHTML = "";
    $("barOs").innerHTML = "";
  }
  var winD = valid && c.diffUnit > 0.05, winO = valid && c.diffUnit < -0.05;
  $("ccDirect").classList.toggle("mf-win", winD);
  $("ccOs").classList.toggle("mf-win", winO);
  $("winDirect").hidden = !winD;
  $("winOs").hidden = !winO;
  $("legend").innerHTML = valid ? legendHTML(c, s) : "";

  /* bep */
  var bv = $("bepVal"), bt = $("bepText");
  if (!valid) { bv.textContent = "—"; bt.textContent = t("bepNeed"); }
  else if (c.bep === null) {
    if (c.bepDir === "direct") { bv.textContent = t("allQty"); bt.innerHTML = esc(t("anyQtyWin", { win: t("winDirect") })); }
    else if (c.bepDir === "os") { bv.textContent = t("allQty"); bt.innerHTML = esc(t("anyQtyWin", { win: t("winOs") })); }
    else { bv.textContent = t("same"); bt.textContent = t("sameFixed"); }
  } else {
    bv.textContent = t("bepQty", { n: nf(c.bep, 0) });
    bt.innerHTML = esc(t("bepOver", {
      win: c.bepDir === "direct" ? t("winDirect") : t("winOs"),
      other: c.bepDir === "direct" ? t("winOs") : t("winDirect")
    }));
    if (c.bep > 1e9) { bv.textContent = t("practicallyNone"); }
  }

  /* warnings */
  var warns = [];
  if (q <= 0) warns.push(t("wQty"));
  if (s.weight <= 0) warns.push(t("wWeight"));
  if (s.cycle <= 0) warns.push(t("wCycle"));
  if (s.resinPrice <= 0) warns.push(t("wResin"));
  if (s.osPrice <= 0) warns.push(t("wOs"));
  if (s.dpMachine + s.dpLabor <= 0) warns.push(t("wRate"));
  if (s.defect >= 99) warns.push(t("wDefect"));
  if (q > s.moldLife && s.moldLife > 0) {
    warns.push(t("wMold", { life: nf(s.moldLife, 0), molds: c.molds }));
  }
  var wb = $("warnBox");
  if (warns.length) { wb.className = "mf-warn mf-on"; wb.innerHTML = "<ul><li>" + warns.map(esc).join("</li><li>") + "</li></ul>"; }
  else { wb.className = "mf-warn"; wb.innerHTML = ""; }

  /* mini bar */
  $("miniDirect").textContent = unitMoney(c.unitDirect);
  $("miniOs").textContent = unitMoney(c.unitOs);

  renderTable(s, c);
  renderQty(s);
  renderFacts(s, c);
  renderPrint(s, c);
  save(s);
}

/* ---------- render: comparison table ---------- */
function row(label, dUnit, dTot, oUnit, oTot, opts) {
  opts = opts || {};
  var diff = (oUnit - dUnit);
  var dcls = "mf-num" + (opts.dimD ? " mf-dim" : "");
  var ocls = "mf-num" + (opts.dimO ? " mf-dim" : "");
  var dTxt = opts.dashD ? "—" : unitMoney(dUnit);
  var oTxt = opts.dashO ? "—" : unitMoney(oUnit);
  var dTotTxt = opts.dashD ? "—" : totMoney(dTot);
  var oTotTxt = opts.dashO ? "—" : totMoney(oTot);
  var dcls2 = "mf-num" + (opts.dashD ? " mf-dim" : "");
  var ocls2 = "mf-num" + (opts.dashO ? " mf-dim" : "");
  var dtxt;
  if (!opts.dashD && !opts.dashO) {
    dtxt = '<td class="mf-delta ' + (diff > 0.05 ? "mf-pos" : (diff < -0.05 ? "mf-neg" : "")) + '">' + (diff > 0.05 || diff < -0.05 ? sign(diff) + unitMoney(Math.abs(diff)) : "0") + "</td>";
  } else {
    dtxt = '<td class="mf-delta"></td>';
  }
  return '<tr class="' + (opts.cls || "") + '"><td class="mf-lb">' + esc(label) + "</td>" +
    '<td class="' + dcls + '">' + dTxt + '</td><td class="' + dcls2 + '">' + dTotTxt + "</td>" +
    '<td class="' + ocls + '">' + oTxt + '</td><td class="' + ocls2 + '">' + oTotTxt + "</td>" + dtxt + "</tr>";
}

function renderTable(s, c) {
  var q = s.qty;
  if (q <= 0) {
    $("cmpBody").innerHTML = '<tr><td colspan="6" style="text-align:center;padding:18px 8px;font-size:12px;color:#6f747b">' + esc(t("tblEmpty")) + "</td></tr>";
    $("cmpMeta").textContent = t("tblNoQty");
    $("cmpNote").textContent = t("cmpNote");
    return;
  }
  var html = "";
  html += '<tr class="mf-grp"><td colspan="6">' + esc(t("grpVar")) + "</td></tr>";
  html += row(t("rMat"), c.mat, c.mat * q, c.osMat, c.osMat * q, { dashO: s.osMat === "turnkey" });
  html += row(t("rProc"), c.proc, c.proc * q, c.osUnit, c.osUnit * q, {});
  html += row(t("rPost"), s.post, s.post * q, s.post, s.post * q, {});
  html += row(t("rPack"), s.pack, s.pack * q, s.pack, s.pack * q, {});
  html += row(t("rLogi"), c.logiPerUnit, c.logiShare, c.osLogiPerUnit, s.osLogi, {});
  html += '<tr class="mf-grp"><td colspan="6">' + esc(t("grpFix")) + "</td></tr>";
  html += row(t("rAdmin"), 0, 0, c.osAdminUnit, c.osAdminUnit * q, { dashD: true });
  html += row(t("rMold"), c.moldPerUnit, c.moldShare, c.osMoldPerUnit, c.osMoldPerUnit * q, {});
  html += row(t("rSetup"), c.setupPerUnit, s.dpSetup, 0, 0, { dashO: true });
  html += '<tr class="mf-sum"><td class="mf-lb">' + esc(t("rTotal")) + "</td>" +
    '<td class="mf-num">' + unitMoney(c.unitDirect) + '</td><td class="mf-num">' + totMoney(c.costDirect) + "</td>" +
    '<td class="mf-num">' + unitMoney(c.unitOs) + '</td><td class="mf-num">' + totMoney(c.costOs) + "</td>" +
    '<td class="mf-delta ' + (c.diffUnit > 0.05 ? "mf-pos" : (c.diffUnit < -0.05 ? "mf-neg" : "")) + '">' + (Math.abs(c.diffUnit) > 0.05 ? sign(c.diffUnit) + unitMoney(Math.abs(c.diffUnit)) : "0") + "</td></tr>";
  html += '<tr><td class="mf-lb">' + esc(t("rInvest")) + '</td><td class="mf-dim" colspan="2" style="text-align:right;font-family:var(--mono);font-size:12px">' + totMoney(c.moldCash + s.dpSetup) + "</td>" +
    '<td class="mf-dim" colspan="2" style="text-align:right;font-family:var(--mono);font-size:12px">' + totMoney(s.osMold ? c.moldCash : 0) + '</td><td class="mf-delta mf-dim" style="text-align:center">·</td></tr>';
  html += '<tr><td class="mf-lb">' + esc(t("rCash")) + '</td><td class="mf-dim" colspan="2" style="text-align:right;font-family:var(--mono);font-size:12px;font-weight:700">' + totMoney(c.cashDirect) + "</td>" +
    '<td class="mf-dim" colspan="2" style="text-align:right;font-family:var(--mono);font-size:12px;font-weight:700">' + totMoney(c.cashOs) + "</td>" +
    '<td class="mf-delta"></td></tr>';
  $("cmpBody").innerHTML = html;
  $("cmpMeta").textContent = t("cmpBase", { q: nf(q, 0) });
  $("cmpNote").textContent = (s.osMat === "turnkey" ? t("turnkeyNote") : "") + t("cmpNote");
}

/* ---------- render: qty table + chart ---------- */
var BUCKETS = [1000, 5000, 10000, 50000, 100000];
function qtyRows(s) {
  var rows = [];
  var cur = s.qty;
  var list = BUCKETS.slice();
  if (cur > 0 && list.indexOf(cur) === -1) { list.push(cur); list.sort(function (a, b) { return a - b; }); }
  list.forEach(function (q) {
    var c = compute(s, q);
    rows.push({ q: q, d: c.unitDirect, o: c.unitOs, dTot: c.costDirect, oTot: c.costOs, cur: q === cur });
  });
  return rows;
}
function renderQty(s) {
  var rows = qtyRows(s);
  var html = "";
  rows.forEach(function (r) {
    var win = Math.abs(r.d - r.o) < 0.05 ? t("same") : (r.d < r.o ? t("winDirect") : t("winOs"));
    var diff = r.oTot - r.dTot;
    var col = Math.abs(r.d - r.o) < 0.05 ? "#6f747b" : (r.d < r.o ? "#0d6b4f" : "#b3261e");
    html += '<tr class="' + (r.cur ? "mf-cur" : "") + '">' +
      '<td class="mf-lb"' + (r.cur ? ' data-cur-tag="' + esc(t("curTag")) + '"' : "") + ">" + esc(t("qtyPcs", { n: nf(r.q, 0) })) + "</td>" +
      '<td class="mf-num">' + unitMoney(r.d) + '</td><td class="mf-num">' + totMoney(r.dTot) + "</td>" +
      '<td class="mf-num">' + unitMoney(r.o) + '</td><td class="mf-num">' + totMoney(r.oTot) + "</td>" +
      '<td style="text-align:center;font-size:11px;font-weight:700;color:' + col + '">' + esc(win) + "</td>" +
      '<td class="mf-delta ' + (diff > 0.5 ? "mf-pos" : (diff < -0.5 ? "mf-neg" : "")) + '">' + (Math.abs(diff) > 0.5 ? sign(diff) + totMoney(Math.abs(diff)) : "0") + "</td></tr>";
  });
  $("qtyBody").innerHTML = html;
  $("chart").innerHTML = buildChart(rows);
  $("chartNote").textContent = s.cur === "USD" ? t("chartNoteUsd", { fx: nf(s.fx, 1) }) : t("chartNoteKrw");
}

function niceStep(x) {
  if (!(x > 0)) return 1;
  var p = Math.pow(10, Math.floor(Math.log10(x)));
  var m = x / p;
  var s = m <= 1 ? 1 : m <= 2 ? 2 : m <= 2.5 ? 2.5 : m <= 5 ? 5 : 10;
  return s * p;
}
function chartNum(v) {
  var x = conv(v);
  var d = state.cur === "USD" ? 2 : (Math.abs(x) < 10000 ? 1 : 0);
  return nf(x, d);
}
function buildChart(rows) {
  var W = 760, H = 258, pl = 62, pr = 12, pt = 14, pb = 34;
  var pw = W - pl - pr, ph = H - pt - pb;
  var maxV = 0;
  rows.forEach(function (r) { maxV = Math.max(maxV, r.d, r.o); });
  maxV = Math.max(maxV, 1);
  var step = niceStep(maxV / 4);
  var top = Math.ceil(maxV / step) * step;
  var y = function (v) { return pt + ph - (v / top) * ph; };
  var band = pw / rows.length;
  var bw = Math.min(26, band * 0.26);
  var gap = 4;
  var out = '<svg viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="' + esc(t("chartAria")) + '" font-family="ui-monospace,Menlo,monospace">';
  /* grid */
  for (var v = 0; v <= top + 1e-9; v += step) {
    var yy = y(v);
    out += '<line x1="' + pl + '" x2="' + (W - pr) + '" y1="' + yy.toFixed(1) + '" y2="' + yy.toFixed(1) + '" stroke="' + (v === 0 ? "#15171a" : "#e5e7eb") + '" stroke-width="' + (v === 0 ? 1.2 : 1) + '"/>';
    out += '<text x="' + (pl - 7) + '" y="' + (yy + 3.5).toFixed(1) + '" text-anchor="end" font-size="9" fill="#6f747b">' + (v === 0 ? "0" : nf(conv(v), (v < 10 && state.cur === "USD") ? 2 : 0)) + "</text>";
  }
  rows.forEach(function (r, i) {
    var cx = pl + band * i + band / 2;
    var x1 = cx - bw - gap / 2, x2 = cx + gap / 2;
    var hD = Math.max(0, ph - (y(r.d) - pt)), hO = Math.max(0, ph - (y(r.o) - pt));
    out += '<rect x="' + x1.toFixed(1) + '" y="' + y(r.d).toFixed(1) + '" width="' + bw.toFixed(1) + '" height="' + hD.toFixed(1) + '" fill="#1f5c8b"><title>' + esc(t("winDirect") + " " + nf(r.q, 0) + " pcs " + unitMoney(r.d)) + "</title></rect>";
    out += '<rect x="' + x2.toFixed(1) + '" y="' + y(r.o).toFixed(1) + '" width="' + bw.toFixed(1) + '" height="' + hO.toFixed(1) + '" fill="#b3261e"><title>' + esc(t("winOs") + " " + nf(r.q, 0) + " pcs " + unitMoney(r.o)) + "</title></rect>";
    out += '<text x="' + (x1 + bw / 2).toFixed(1) + '" y="' + (y(r.d) - 3).toFixed(1) + '" text-anchor="middle" font-size="8" fill="#1f5c8b">' + chartNum(r.d) + "</text>";
    out += '<text x="' + (x2 + bw / 2).toFixed(1) + '" y="' + (y(r.o) - 3).toFixed(1) + '" text-anchor="middle" font-size="8" fill="#b3261e">' + chartNum(r.o) + "</text>";
    out += '<text x="' + cx.toFixed(1) + '" y="' + (pt + ph + 15) + '" text-anchor="middle" font-size="9.5" fill="' + (r.cur ? "#15171a" : "#4f545b") + '" font-weight="' + (r.cur ? 700 : 400) + '">' + nf(r.q, 0) + "</text>";
    if (r.cur) {
      out += '<line x1="' + cx.toFixed(1) + '" x2="' + cx.toFixed(1) + '" y1="' + (pt + ph + 19) + '" y2="' + (pt + ph + 24) + '" stroke="#15171a" stroke-width="2"/>';
    }
  });
  out += '<g font-family="Pretendard,sans-serif" font-size="9.5">';
  out += '<rect x="' + (W - pr - 150) + '" y="' + (pt + 2) + '" width="8" height="8" fill="#1f5c8b"/><text x="' + (W - pr - 138) + '" y="' + (pt + 9) + '" fill="#4f545b">' + esc(t("winDirect")) + "</text>";
  out += '<rect x="' + (W - pr - 74) + '" y="' + (pt + 2) + '" width="8" height="8" fill="#b3261e"/><text x="' + (W - pr - 62) + '" y="' + (pt + 9) + '" fill="#4f545b">' + esc(t("winOs")) + "</text>";
  out += "</g>";
  out += "</svg>";
  return out;
}

/* ---------- render: facts ---------- */
function renderFacts(s, c) {
  var q = s.qty;
  var items = [
    [t("fQty"), nf(q, 0) + "<small>" + esc(t("uPcs")) + "</small>"],
    [t("fShots"), nf(Math.ceil(c.shots), 0) + "<small>" + esc(t("uShot")) + "</small>"],
    [t("fHours"), nf(c.hours, c.hours < 10 ? 1 : 0) + "<small>" + esc(t("uHour")) + "</small>"],
    [t("fRaw"), nf(c.rawKg, c.rawKg < 100 ? 1 : 0) + "<small>" + esc(t("uKg")) + "</small>"],
    [t("fMolds"), nf(c.molds, 0) + "<small>" + esc(t("uMold")) + "</small>"],
    [t("fDiff"), (Math.abs(c.diffUnit) > 0.05 ? sign(c.diffUnit) + unitMoney(Math.abs(c.diffUnit)) : "0") + "<small>" + esc(t("uPerPc")) + "</small>"],
    [t("fCashD"), totMoney(c.cashDirect)],
    [t("fCashO"), totMoney(c.cashOs)],
    [t("fMoldShare"), totMoney(c.moldShare)]
  ];
  $("facts").innerHTML = items.map(function (it) {
    return '<dl class="mf-fact"><dt>' + esc(it[0]) + "</dt><dd>" + it[1] + "</dd></dl>";
  }).join("");
}

/* ---------- print sheet ---------- */
function renderPrint(s, c) {
  var today = new Date();
  var dateStr = today.getFullYear() + "-" + pad(today.getMonth() + 1) + "-" + pad(today.getDate());
  var q = s.qty;
  var rows = qtyRows(s);
  var winTxt;
  if (q <= 0) winTxt = t("pNoQty");
  else if (Math.abs(c.diffUnit) < 0.05) winTxt = t("pWinSame");
  else winTxt = t("pWin", {
    win: c.diffUnit > 0 ? t("winDirect") : t("winOs"),
    gap: unitMoney(Math.abs(c.diffUnit)),
    pct: (Math.abs(c.diffUnit) / Math.max(c.unitDirect, c.unitOs) * 100).toFixed(1)
  });
  var bepTxt;
  if (c.bep === null) {
    bepTxt = c.bepDir === "direct" ? t("pAllQtyDirect") : (c.bepDir === "os" ? t("pAllQtyOs") : t("pBepNone"));
  } else {
    bepTxt = c.bepDir === "direct" ? t("pBepOverD", { n: nf(c.bep, 0) }) : t("pBepOverO", { n: nf(c.bep, 0) });
  }

  var h = "";
  h += '<div class="p-head"><div><span class="p-k">' + esc(t("pKicker")) + "</span><h1>" + esc(t("pTitle")) + "</h1></div>" +
    '<div class="p-meta">' + esc(t("pItem")) + " <b>" + esc(s.item || t("pNoItem")) + "</b><br>" +
    esc(t("pQty")) + " <b>" + nf(q, 0) + " pcs</b> · " + esc(t("pCur")) + " <b>" + (s.cur === "USD" ? "USD (" + nf(s.fx, 1) + " KRW)" : "KRW") + "</b><br>" +
    esc(t("pPrinted")) + " " + dateStr + "</div></div>";

  h += '<div class="p-verdict">' + (q > 0
    ? esc(t("pVerdict", { d: unitMoney(c.unitDirect), o: unitMoney(c.unitOs), txt: winTxt }))
    : esc(t("pNoQty"))) + "</div>";

  /* summary */
  h += "<h2>" + esc(t("pS1")) + "</h2>";
  h += '<table><thead><tr><th class="l">' + esc(t("pHeadKind")) + "</th><th>" + esc(t("pHeadUnit")) + "</th><th>" + esc(t("pHeadTotal")) + "</th><th>" + esc(t("pHeadInit")) + "</th><th>" + esc(t("pHeadCash")) + "</th></tr></thead><tbody>";
  h += '<tr><td class="l">' + esc(t("winDirect")) + '</td><td class="n">' + unitMoney(c.unitDirect) + '</td><td class="n">' + totMoney(c.costDirect) + '</td><td class="n">' + totMoney(c.moldCash + s.dpSetup) + '</td><td class="n">' + totMoney(c.cashDirect) + "</td></tr>";
  h += '<tr><td class="l">' + esc(t("winOs")) + '</td><td class="n">' + unitMoney(c.unitOs) + '</td><td class="n">' + totMoney(c.costOs) + '</td><td class="n">' + totMoney(s.osMold ? c.moldCash : 0) + '</td><td class="n">' + totMoney(c.cashOs) + "</td></tr>";
  h += '<tr class="sum"><td class="l">' + esc(t("pDiff")) + '</td><td class="n">' + (Math.abs(c.diffUnit) > 0.05 ? sign(c.diffUnit) + unitMoney(Math.abs(c.diffUnit)) : "0") + '</td><td class="n">' + (Math.abs(c.diffTotal) > 0.5 ? sign(c.diffTotal) + totMoney(Math.abs(c.diffTotal)) : "0") + '</td><td class="n"></td><td class="n">' + (Math.abs(c.cashOs - c.cashDirect) > 0.5 ? sign(c.cashOs - c.cashDirect) + totMoney(Math.abs(c.cashOs - c.cashDirect)) : "0") + "</td></tr>";
  h += "</tbody></table>";
  h += '<p class="p-note">' + esc(t("pBepNote", { txt: bepTxt })) + "</p>";

  /* comparison */
  h += "<h2>" + esc(t("pS2")) + "</h2>";
  h += '<table><thead><tr><th class="l">' + esc(t("pHeadItem")) + "</th><th>" + esc(t("pHeadDUnit")) + "</th><th>" + esc(t("pHeadDTot")) + "</th><th>" + esc(t("pHeadOUnit")) + "</th><th>" + esc(t("pHeadOTot")) + "</th></tr></thead><tbody>";
  var pr = [
    [t("rMat"), c.mat, c.mat * q, c.osMat, c.osMat * q, false, s.osMat === "turnkey"],
    [t("rProc"), c.proc, c.proc * q, c.osUnit, c.osUnit * q, false, false],
    [t("rPost"), s.post, s.post * q, s.post, s.post * q, false, false],
    [t("rPack"), s.pack, s.pack * q, s.pack, s.pack * q, false, false],
    [t("rLogi"), c.logiPerUnit, c.logiShare, c.osLogiPerUnit, s.osLogi, false, false],
    [t("rAdmin"), 0, 0, c.osAdminUnit, c.osAdminUnit * q, true, false],
    [t("rMold"), c.moldPerUnit, c.moldShare, c.osMoldPerUnit, c.osMoldPerUnit * q, false, false],
    [t("rSetup"), c.setupPerUnit, s.dpSetup, 0, 0, false, true]
  ];
  pr.forEach(function (r) {
    h += '<tr><td class="l">' + esc(r[0]) + '</td>' +
      '<td class="n">' + (r[5] ? "—" : unitMoney(r[1])) + '</td><td class="n">' + (r[5] ? "—" : totMoney(r[2])) + "</td>" +
      '<td class="n">' + (r[6] ? "—" : unitMoney(r[3])) + '</td><td class="n">' + (r[6] ? "—" : totMoney(r[4])) + "</td></tr>";
  });
  h += '<tr class="sum"><td class="l">' + esc(t("pSum")) + '</td><td class="n">' + unitMoney(c.unitDirect) + '</td><td class="n">' + totMoney(c.costDirect) + '</td><td class="n">' + unitMoney(c.unitOs) + '</td><td class="n">' + totMoney(c.costOs) + "</td></tr>";
  h += "</tbody></table>";

  /* qty */
  h += "<h2>" + esc(t("pS3")) + "</h2>";
  h += '<table><thead><tr><th class="l">' + esc(t("pHeadQty")) + "</th><th>" + esc(t("pHeadDUnit")) + "</th><th>" + esc(t("pHeadDTot")) + "</th><th>" + esc(t("pHeadOUnit")) + "</th><th>" + esc(t("pHeadOTot")) + "</th><th>" + esc(t("pHeadWin")) + "</th></tr></thead><tbody>";
  rows.forEach(function (r) {
    var w = Math.abs(r.d - r.o) < 0.05 ? t("same") : (r.d < r.o ? t("pWinD") : t("pWinO"));
    h += "<tr" + (r.cur ? ' class="sum"' : "") + '><td class="l">' + nf(r.q, 0) + (r.cur ? " " + esc(t("pNow")) : "") + '</td><td class="n">' + unitMoney(r.d) + '</td><td class="n">' + totMoney(r.dTot) + '</td><td class="n">' + unitMoney(r.o) + '</td><td class="n">' + totMoney(r.oTot) + '</td><td class="n">' + esc(w) + "</td></tr>";
  });
  h += "</tbody></table>";
  h += '<div class="p-break" style="margin-top:2mm"><p class="p-note" style="margin:0 0 1mm">' +
    esc(t("pChartNote", { unit: s.cur === "USD" ? t("chartNoteUsd", { fx: nf(s.fx, 1) }) : t("chartNoteKrw") })) + "</p>" + buildChart(rows) + "</div>";

  /* inputs */
  h += '<div class="p-two" style="margin-top:3mm"><div>';
  h += "<h2>" + esc(t("pS4")) + "</h2>";
  h += "<table><tbody>";
  var inp = [
    [t("pResin"), esc(s.resinName) + " · " + nf(s.resinPrice, 0) + (IS_KO ? "원/kg" : " KRW/kg")],
    [t("pWeight"), nf(s.weight, 1) + "g / " + nf(s.loss, 1) + "%"],
    [t("pMb"), nf(s.mbPct, 1) + "% · " + nf(s.mbPrice, 0) + (IS_KO ? "원/kg" : " KRW/kg")],
    [t("pMold"), nf(s.moldCost, 0) + esc(t("unitWon")) + " · " + s.cavities + escapeUnit("cav") + " · " + nf(s.moldLife, 0) + esc(t("uPcs"))],
    [t("pMoldMode"), s.moldMode === "basis" ? t("pModeBasis") : t("pModeOrder")],
    [t("pCycle"), nf(s.cycle, 1) + escapeUnit("sec") + " / " + nf(s.defect, 1) + "%"],
    [t("pPostPack"), nf(s.post, 0) + esc(t("unitWon")) + " / " + nf(s.pack, 0) + esc(t("unitWon"))],
    [t("pLogi"), (s.logiMode === "total" ? t("pTotalLump", { v: totMoney(s.logiVal) }) : t("pUnitLump", { v: unitMoney(s.logiVal) }))]
  ];
  inp.forEach(function (r) { h += '<tr><td class="l" style="width:34%">' + esc(r[0]) + "</td><td>" + r[1] + "</td></tr>"; });
  h += "</tbody></table></div><div>";
  h += "<h2>" + esc(t("pS5")) + "</h2>";
  h += "<table><tbody>";
  var inp2 = [
    [t("pTon"), nf(s.dpTon, 0) + escapeUnit("ton")],
    [t("pRate"), nf(s.dpMachine, 0) + (IS_KO ? "원/h" : " KRW/h") + " / " + nf(s.dpLabor, 0) + (IS_KO ? "원/h" : " KRW/h")],
    [t("pSetup"), nf(s.dpSetup, 0) + esc(t("unitWon"))],
    [t("pOsQuote"), (s.osMode === "perPart" ? t("pOsPerPart") : s.osMode === "perShot" ? t("pOsPerShot") : t("pOsPerHour")) + nf(s.osPrice, 0) + esc(t("unitWon"))],
    [t("pOsMat"), s.osMat === "supply" ? t("pOsSupply") : t("pOsTurnkey")],
    [t("pOsAdminLogi"), nf(s.osAdmin, 1) + "% / " + totMoney(s.osLogi)],
    [t("pOsMold"), s.osMold ? t("pOsMoldOurs") : t("pOsMoldTheirs")],
    [t("pShots"), nf(Math.ceil(c.shots), 0) + " shot / " + nf(c.hours, 1) + "h"]
  ];
  inp2.forEach(function (r) { h += '<tr><td class="l" style="width:38%">' + esc(r[0]) + "</td><td>" + r[1] + "</td></tr>"; });
  h += "</tbody></table></div></div>";

  h += '<div class="p-foot">' + esc(t("pFoot")) + "</div>";

  $("printSheet").innerHTML = h;
}
/* 인쇄 산출서 안의 단위 표기(언어별) */
function escapeUnit(kind) {
  var M = {
    ko: { cav: "캐비티", sec: "초", ton: "톤" },
    en: { cav: " cav", sec: "s", ton: " t" },
    zh: { cav: " 穴", sec: " 秒", ton: " 吨" },
    ja: { cav: "キャビティ", sec: "秒", ton: "トン" }
  };
  var m = M[LANG] || M.ko;
  return esc(m[kind] || "");
}
function pad(n) { return n < 10 ? "0" + n : "" + n; }
function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (m) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]; }); }

/* ---------- CSV ---------- */
function csvCell(v) {
  var s = String(v == null ? "" : v);
  if (/[",\n\r]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
  return s;
}
function rawKRW(v, d) { return nf(v, d === undefined ? 1 : d).replace(/,/g, ""); }
function buildCsv() {
  var s = read();
  var c = compute(s, s.qty);
  var q = s.qty;
  var rows = [];
  function line(a) { rows.push(a.map(csvCell).join(",")); }
  var today = new Date();
  line([t("csvTitle")]);
  line([t("csvItem"), s.item]);
  line([t("csvQty"), q]);
  line([t("csvCur"), s.cur]);
  line([t("csvFx"), s.cur === "USD" ? s.fx : ""]);
  line([t("csvDate"), today.getFullYear() + "-" + pad(today.getMonth() + 1) + "-" + pad(today.getDate())]);
  line([]);
  line([t("csvKind"), t("csvDirect"), t("csvOs"), t("csvDiffCol")]);
  line([t("csvMat"), rawKRW(c.mat), rawKRW(c.osMat), rawKRW(c.osMat - c.mat)]);
  line([t("csvProc"), rawKRW(c.proc), rawKRW(c.osUnit), rawKRW(c.osUnit - c.proc)]);
  line([t("csvPost"), rawKRW(s.post), rawKRW(s.post), "0"]);
  line([t("csvPack"), rawKRW(s.pack), rawKRW(s.pack), "0"]);
  line([t("csvLogi"), rawKRW(c.logiPerUnit), rawKRW(c.osLogiPerUnit), rawKRW(c.osLogiPerUnit - c.logiPerUnit)]);
  line([t("csvAdmin"), "0", rawKRW(c.osAdminUnit), rawKRW(c.osAdminUnit)]);
  line([t("csvMold"), rawKRW(c.moldPerUnit), rawKRW(c.osMoldPerUnit), rawKRW(c.osMoldPerUnit - c.moldPerUnit)]);
  line([t("csvSetup"), rawKRW(c.setupPerUnit), "0", rawKRW(-c.setupPerUnit)]);
  line([t("csvUnit"), rawKRW(c.unitDirect), rawKRW(c.unitOs), rawKRW(c.diffUnit)]);
  line([t("csvTotal"), rawKRW(c.costDirect, 0), rawKRW(c.costOs, 0), rawKRW(c.diffTotal, 0)]);
  line([t("csvInit"), rawKRW(c.moldCash + s.dpSetup, 0), rawKRW(s.osMold ? c.moldCash : 0, 0), rawKRW((s.osMold ? c.moldCash : 0) - (c.moldCash + s.dpSetup), 0)]);
  line([t("csvCash"), rawKRW(c.cashDirect, 0), rawKRW(c.cashOs, 0), rawKRW(c.cashOs - c.cashDirect, 0)]);
  line([t("csvBep"), c.bep === null ? (c.bepDir === "direct" ? t("csvBepAllD") : c.bepDir === "os" ? t("csvBepAllO") : t("csvBepSame")) : String(c.bep)]);
  if (s.osMat === "turnkey") line([t("csvNote"), t("csvTurnkeyNote")]);
  line([]);
  line([t("csvQtyHead"), t("pHeadDUnit"), t("pHeadDTot"), t("pHeadOUnit"), t("pHeadOTot"), t("csvWin")]);
  qtyRows(s).forEach(function (r) {
    var w = Math.abs(r.d - r.o) < 0.05 ? t("same") : (r.d < r.o ? t("winDirect") : t("winOs"));
    line([r.q, rawKRW(r.d), rawKRW(r.dTot, 0), rawKRW(r.o), rawKRW(r.oTot, 0), w]);
  });
  line([]);
  line([t("csvInputs")]);
  line([t("csvResin"), s.resinName, t("csvUnitPrice"), s.resinPrice]);
  line([t("csvWeightG"), s.weight, t("csvLoss"), s.loss]);
  line([t("csvMbPct"), s.mbPct, t("csvAddPrice"), s.mbPrice]);
  line([t("csvMoldCost"), s.moldCost, t("csvCav"), s.cavities, t("csvLife"), s.moldLife, t("csvDist"), s.moldMode === "basis" ? t("csvDistBasis") : t("csvDistOrder")]);
  line([t("csvCycle"), s.cycle, t("csvDefect"), s.defect]);
  line([t("csvPostPack"), s.post, t("csvPackU"), s.pack, t("csvLogiU"), s.logiVal, s.logiMode === "total" ? t("csvLump") : t("csvPerUnit")]);
  line([t("csvTon"), s.dpTon, t("csvMach"), s.dpMachine, t("csvLabor"), s.dpLabor, t("csvSetupU"), s.dpSetup]);
  line([t("csvOsMode"), s.osMode, t("csvOsPrice"), s.osPrice, t("csvMat"), s.osMat === "supply" ? t("csvSupply") : t("csvTurnkey"), t("csvAdminPct"), s.osAdmin, t("csvLogiCost"), s.osLogi, t("csvOsMold"), s.osMold ? t("csvOurs") : t("csvTheirs")]);
  return "\ufeff" + rows.join("\r\n") + "\r\n";
}
function downloadCsv() {
  var r = read();
  var name = t("fileName") + "_" + (r.item || t("fileFallback")).replace(/[\\/:*?"<>|\s]+/g, "_").slice(0, 40) + "_" + dateStamp() + ".csv";
  var blob = new Blob([buildCsv()], { type: "text/csv;charset=utf-8" });
  var url = URL.createObjectURL(blob);
  var a = document.createElement("a");
  a.href = url; a.download = name;
  document.body.appendChild(a); a.click();
  setTimeout(function () { document.body.removeChild(a); URL.revokeObjectURL(url); }, 800);
  toast(t("toastCsv", { name: name }));
}
function dateStamp() {
  var d = new Date();
  return "" + d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()) + "_" + pad(d.getHours()) + pad(d.getMinutes());
}

/* ---------- toast ---------- */
var toastTimer = null;
function toast(msg) {
  var el = $("toast");
  el.textContent = msg;
  el.classList.add("mf-on");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function () { el.classList.remove("mf-on"); }, 2600);
}

/* ---------- persistence ---------- */
var KEY = "mfgcost.v1";
var saveTimer = null;
function save(s) {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(function () {
    try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) { /* 저장소를 막은 브라우저 */ }
  }, 400);
}
function loadSaved() {
  try {
    var raw = localStorage.getItem(KEY);
    if (!raw) return null;
    var o = JSON.parse(raw);
    if (o && typeof o === "object" && typeof o.qty === "number") return o;
  } catch (e) { /* 무시 */ }
  return null;
}

/* ---------- init ---------- */
function initPresets() {
  var sel = $("resinPreset");
  var html = '<option value="">' + esc(t("presetManual")) + "</option>";
  var virgin = PRESETS.slice(0, 6), rec = PRESETS.slice(6);
  html += '<optgroup label="' + esc(t("grpVirgin")) + '">';
  virgin.forEach(function (p) { html += '<option value="' + p.key + '">' + esc(pl(p)) + "</option>"; });
  html += '</optgroup><optgroup label="' + esc(t("grpRecycled")) + '">';
  rec.forEach(function (p) { html += '<option value="' + p.key + '">' + esc(pl(p)) + "</option>"; });
  html += "</optgroup>";
  sel.innerHTML = html;

  var sb = $("srcBody");
  sb.innerHTML = PRESETS.map(function (p) {
    return "<tr><td>" + esc(pl(p)) + '</td><td class="mf-n">' + nf(p.price, 0) + esc(t("srcPriceSuffix")) + '</td><td class="mf-s">' + esc(ps(p)) + "</td></tr>";
  }).join("") + "<tr><td>" + esc(t("srcFx")) + '</td><td class="mf-n">' + esc(t("srcFxValue")) + '</td><td class="mf-s">' + esc(t("srcFxNote")) + "</td></tr>";
}
function setPreset(key) {
  var p = PRESETS.filter(function (x) { return x.key === key; })[0];
  if (!p) { return; }
  $("resinName").value = pn(p);
  $("resinPrice").value = p.price;
  $("resinSrc").textContent = ps(p);
}

var rafId = null;
function scheduleRender() {
  if (rafId) cancelAnimationFrame(rafId);
  rafId = requestAnimationFrame(function () { rafId = null; render(); });
}

document.addEventListener("DOMContentLoaded", function () {
  if (!$("mfg-tool")) return;
  initPresets();

  var saved = loadSaved();
  fill(saved || EXAMPLE);
  if (!saved) {
    setPreset("ABS");
  } else if (!saved.resinPreset) {
    /* 저장된 값이 프리셋을 고르지 않은 상태면 안내 문구만 되돌립니다. */
    $("resinSrc").textContent = t("srcIdle");
  }

  var form = $("mfg-tool");
  form.addEventListener("input", function (e) {
    if (e.target && e.target.id === "resinName") {
      var nm = e.target.value.trim();
      var match = PRESETS.filter(function (p) { return pn(p) === nm; })[0];
      $("resinPreset").value = match ? match.key : "";
    }
    if (e.target && (e.target.id === "osMode" || e.target.id === "logiMode")) syncUnitLabels();
    scheduleRender();
  });
  form.addEventListener("change", function (e) {
    if (e.target && e.target.id === "resinPreset") { setPreset(e.target.value); }
    if (e.target && (e.target.id === "osMode" || e.target.id === "logiMode")) syncUnitLabels();
    scheduleRender();
  });

  $("btnCsv").addEventListener("click", downloadCsv);
  $("btnPrint").addEventListener("click", function () {
    render();
    setTimeout(function () { window.print(); }, 60);
  });
  $("btnExample").addEventListener("click", function () {
    if (window.confirm(t("confirmExample"))) {
      fill(EXAMPLE); setPreset("ABS"); render(); toast(t("toastExample"));
    }
  });
  $("btnReset").addEventListener("click", function () {
    if (window.confirm(t("confirmReset"))) {
      fill(BLANK); $("resinSrc").textContent = t("srcIdle"); render(); toast(t("toastReset"));
    }
  });
  $("miniGo").addEventListener("click", function () {
    $("h-cmp").scrollIntoView({ behavior: "smooth", block: "start" });
  });

  /* keep numbers sane on blur */
  ["qty", "weight", "loss", "mbPct", "mbPrice", "moldCost", "cavities", "moldLife", "cycle", "defect",
    "post", "pack", "logiVal", "dpMachine", "dpLabor", "dpSetup", "osPrice", "osAdmin", "osLogi", "fx", "resinPrice", "dpTon"
  ].forEach(function (id) {
    var el = $(id); if (!el) return;
    el.addEventListener("blur", function () {
      if (el.value === "") { el.value = "0"; scheduleRender(); }
    });
  });

  window.addEventListener("beforeprint", function () { render(); });
  render();
});
})();
