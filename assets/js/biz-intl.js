/* =========================================================
   INSIGHT BRIEF — biz.html 동적 문구 현지화 (/en/ /zh/ /ja/)
   biz.js 가 만드는 계산 결과·문서 문장에는 숫자가 섞여 있어 빌드 시점
   사전(정확 일치)으로는 바꿀 수 없습니다. 이 파일은 화면에 그려진 뒤
   한국어가 남은 텍스트 노드를 찾아, 숫자를 가리지 않는 패턴표로 바꿉니다.
   한국어 페이지에서는 아무것도 하지 않습니다.
   ========================================================= */
(function () {
  'use strict';

  var html = document.documentElement;
  var raw = (html.getAttribute('lang') || 'ko').toLowerCase();
  var L = /^en/.test(raw) ? 'en' : /^zh/.test(raw) ? 'zh' : /^ja/.test(raw) ? 'ja' : null;
  if (!L) return;
  if (window.IBZ_PATCHED) return;

  var HANGUL = /[가-힣]/;

  /* [정규식, 영어, 중국어, 일본어] — {1}… 는 캡처 순서입니다. */
  var RULES = [
    /* ---- ② 마진 ---- */
    [/^투입 원가 대비 (.+) · 판매가 (.+) 기준$/,
      'vs cost {1} · at price {2}', '占投入成本 {1} · 按售价 {2}', '投入コスト比 {1} · 販売価格 {2} 基準'],
    [/^매출 대비 순이익률$/, 'Profit margin of revenue', '营收净利润率', '売上に対する利益率'],
    [/^광고비 (.+)까지 손익분기 \(약 (.+)배\)$/,
      'Break-even up to {1} ad spend (about {2}×)', '广告费可投至 {1} 才保本（约 {2} 倍）', '広告費 {1} まで損益分岐（約 {2} 倍）'],
    [/^순이익이 0 이하면 광고 여력이 없습니다$/, 'No room for ads when profit is zero or less',
      '利润为 0 或以下时没有广告空间', '利益が 0 以下なら広告の余力はありません'],
    [/^이 가격 아래면 파실수록 손해 · 현재가 (.+) 부족$/, 'Below this price you lose on every sale · {1} short',
      '低于此价越卖越亏 · 还差 {1}', 'この価格以下では売るほど損 · あと {1} 不足'],
    [/^이 가격 아래면 파실수록 손해 · 현재가 (.+) 여유$/, 'Below this price you lose on every sale · {1} of headroom',
      '低于此价越卖越亏 · 还有 {1} 余量', 'この価格以下では売るほど損 · {1} の余裕'],
    [/^이 가격이면 개당 순이익 0원$/, 'This price leaves zero profit per unit',
      '按此价每件利润为 0', 'この価格なら 1 個あたり利益は 0'],
    [/^수수료율을 확인하세요$/, 'Check the fee rate', '请确认手续费率', '手数料率を確認してください'],
    [/^수수료율 \+ 목표 마진이 100%를 넘습니다$/, 'Fee rate plus target margin exceeds 100%',
      '手续费率加目标毛利率超过 100%', '手数料率＋目標マージンが 100% を超えます'],
    [/^목표 마진 (.+) 기준 · 현재가 대비 (.+) 인상 필요$/, 'At {1} target margin · raise the price by {2}',
      '按目标毛利率 {1} · 需提价 {2}', '目標マージン {1} 基準 · {2} 値上げが必要'],
    [/^목표 마진 (.+) 기준 · 현재가 대비 (.+) 여유$/, 'At {1} target margin · {2} of headroom',
      '按目标毛利率 {1} · 还有 {2} 余量', '目標マージン {1} 基準 · {2} の余裕'],
    [/^목표 마진 (.+) 기준 · 현재가:? ?(.+) 여유$/, 'At {1} target margin · {2} of headroom',
      '按目标毛利率 {1} · 还有 {2} 余量', '目標マージン {1} 基準 · {2} の余裕'],
    [/^이 조건으로는 팔수록 손해입니다\.$/, 'At these terms you lose money on every sale.',
      '按此条件越卖越亏。', 'この条件では売るほど損をします。'],
    [/^개당 (.+)씩 손실입니다\. 판매가를 (.+) 이상 올리거나, 매입원가·배송비를 낮춰야 손익분기를 넘습니다\.$/,
      'You lose {1} per unit. Raise the price by {2} or cut purchase and shipping cost to pass break-even.',
      '每件亏损 {1}。售价需提高 {2} 以上，或降低进价与运费才能越过盈亏平衡。',
      '1 個あたり {1} の損失です。販売価格を {2} 以上上げるか、仕入原価・送料を下げないと損益分岐を越えません。'],
    [/^마진율 (.+)은 얇습니다\.$/, 'A margin of {1} is thin.', '毛利率 {1} 偏薄。', 'マージン率 {1} は薄いです。'],
    [/^반품·교환 1건\(왕복 배송비 약 (.+)\)이면 개당 이익 (.+)의 (.+)건분이 사라집니다\. 반품률을 함께 계산해 두세요\.$/,
      'One return (about {1} round-trip shipping) wipes out {3} units of the {2} profit. Work out your return rate too.',
      '一次退货（往返运费约 {1}）会吃掉每件利润 {2} 的 {3} 份。请一并计算退货率。',
      '返品・交換 1 件（往復送料 約 {1}）で 1 個あたり利益 {2} の {3} 件分が消えます。返品率も併せて計算してください。'],

    /* ---- ② 부가세 ---- */
    [/^매출의 (.+)$/, 'Of revenue {1}', '占营收 {1}', '売上の {1}'],
    [/^매입세액이 매출세액보다 커 0원 \(초과분 환급 없음\)$/, 'Input VAT exceeds output VAT — 0 won (no refund of the excess)',
      '进项税额大于销项税额，为 0 韩元（超出部分不退还）', '仕入税額が売上税額を上回り 0 ウォン（超過分の還付なし）'],
    [/^연매출 (.+?) 미만 — 납부의무 면제\(추정\)$/, 'Annual revenue under {1} — exempt from payment (estimate)',
      '年营收低于 {1} — 免于缴纳（估算）', '年間売上 {1} 未満 — 納付義務免除（推計）'],
    [/^부가율 (.+) 적용 추정$/, 'Estimated with a {1} value-added ratio', '按附加值率 {1} 估算', '付加価値率 {1} で推計'],
    [/^일반과세 (.+) 유리$/, 'General taxation is cheaper by {1}', '一般计税更省 {1}', '一般課税が {1} 有利'],
    [/^간이과세 (.+) 유리$/, 'Simplified taxation is cheaper by {1}', '简易计税更省 {1}', '簡易課税が {1} 有利'],
    [/^연매출 (.+?)은 간이과세 기준\(.+? 미만\) 안입니다\. (.+)$/,
      'Annual revenue of {1} is within the simplified-tax threshold (under KRW 104M). {2}',
      '年营收 {1} 在简易课税标准（低于 1.04 亿韩元）之内。{2}',
      '年間売上 {1} は簡易課税の基準（1 億 400 万ウォン未満）内です。{2}'],
    [/^연매출 (.+?)은 간이과세 기준\(.+? 미만\)을 넘어 간이과세를 선택할 수 없습니다\. (.+)$/,
      'Annual revenue of {1} exceeds the simplified-tax threshold (KRW 104M), so simplified taxation is not available. {2}',
      '年营收 {1} 超过简易课税标准（1.04 亿韩元），无法选择简易课税。{2}',
      '年間売上 {1} は簡易課税の基準（1 億 400 万ウォン未満）を超えているため簡易課税を選べません。{2}'],
    [/^입력한 단가를 부가세 별도로 보고 세액 10%를 더했습니다\.$/,
      'The unit price you entered is treated as VAT-exclusive, and 10% VAT was added.',
      '输入的单价按不含增值税处理，并加计 10% 税额。',
      '入力した単価は付加価値税別として扱い、10% の税額を加えました。'],
    [/^입력한 단가를 부가세 포함으로 보고 공급가액을 역산했습니다\.$/,
      'The unit price you entered is treated as VAT-inclusive, and the net amount was back-calculated.',
      '输入的单价按含增值税处理，并反算出不含税金额。',
      '入力した単価は付加価値税込みとして扱い、税抜金額を逆算しました。'],

    /* ---- ② 3.3% · 종합소득세 ---- */
    [/^실수령 (.+) 기준 · 3\.3% 역산$/, 'Reverse from {1} take-home · 3.3%', '按到手 {1} 反推 · 3.3%', '手取り {1} 基準 · 3.3% 逆算'],
    [/^소득세 (.+) \+ 지방세 · 실효 (.+)$/, 'Income tax {1} + local tax · effective {2}',
      '所得税 {1} + 地方税 · 实际 {2}', '所得税 {1} ＋住民税 · 実効 {2}'],
    [/^소득세 (.+) \+ 지방소득세 10%$/, 'Income tax {1} + 10% local income tax',
      '所得税 {1} + 地方所得税 10%', '所得税 {1} ＋地方所得税 10%'],
    [/^기납부\(3\.3%\)가 더 많아 (.+)$/, 'Prepaid 3.3% is higher — {1}', '已预扣的 3.3% 更多 — {1}', '既納の 3.3% が多いため {1}'],
    [/^추가 납부 예상 \(기납부 (.+)\)$/, 'Extra payment expected (prepaid {1})', '预计需补缴（已缴 {1}）', '追加納付の見込み（既納 {1}）'],
    [/^(\d+)건분이 사라집니다\. 반품률을 함께 계산해 두세요\.$/, '{1} units of profit disappear. Work out your return rate too.',
      '相当于 {1} 份利润消失。请一并计算退货率。', '{1} 件分の利益が消えます。返品率も計算しておいてください。'],

    /* ---- ③ 수입 원가 ---- */
    [/^(FTA·협정세율 적용 가정)$/, 'assuming the FTA agreement rate', '假定适用 FTA 协定税率', 'FTA 協定税率を適用した仮定'],
    [/^(.+?) \((FTA·협정세율 적용 가정)\)$/, '{1} (assuming the FTA agreement rate)',
      '{1}（假定适用 FTA 协定税率）', '{1}（FTA 協定税率を適用した仮定）'],
    [/^CIF — 운임·보험 단가 포함$/, 'CIF — freight and insurance included in the price',
      'CIF — 单价含运费与保险', 'CIF — 運賃・保険を単価に含む'],
    [/^물품대금만 (.+)$/, 'Goods only {1}', '仅货款 {1}', '商品代金のみ {1}'],
    [/^제1조 \(당사자\)$/, 'Article 1 (Parties)', '第 1 条（当事人）', '第 1 条（当事者）'],
    [/^제2조 \(업무의 범위\)$/, 'Article 2 (Scope of work)', '第 2 条（工作范围）', '第 2 条（業務の範囲）'],
    [/^제3조 \(계약기간\)$/, 'Article 3 (Term)', '第 3 条（合同期限）', '第 3 条（契約期間）'],
    [/^제4조 \(대금과 지급\)$/, 'Article 4 (Fee and payment)', '第 4 条（费用与支付）', '第 4 条（対価と支払）'],
    [/^제5조 \(검수\)$/, 'Article 5 (Acceptance)', '第 5 条（验收）', '第 5 条（検収）'],
    [/^제6조 \(지식재산권\)$/, 'Article 6 (Intellectual property)', '第 6 条（知识产权）', '第 6 条（知的財産権）'],
    [/^제7조 \(비밀유지\)$/, 'Article 7 (Confidentiality)', '第 7 条（保密）', '第 7 条（秘密保持）'],
    [/^제8조 \(해지\)$/, 'Article 8 (Termination)', '第 8 条（解除）', '第 8 条（解除）'],
    [/^제9조 \(분쟁 해결\)$/, 'Article 9 (Dispute resolution)', '第 9 条（争议解决）', '第 9 条（紛争解決）'],
    [/^제10조 \(기타\)$/, 'Article 10 (Miscellaneous)', '第 10 条（其他）', '第 10 条（その他）'],
    [/^제1조 \(목적\)$/, 'Article 1 (Purpose)', '第 1 条（目的）', '第 1 条（目的）'],
    [/^제2조 \(비밀정보의 범위\)$/, 'Article 2 (Scope of confidential information)', '第 2 条（保密信息范围）', '第 2 条（秘密情報の範囲）'],
    [/^제3조 \(의무\)$/, 'Article 3 (Obligations)', '第 3 条（义务）', '第 3 条（義務）'],
    [/^제4조 \(기간\)$/, 'Article 4 (Term)', '第 4 条（期限）', '第 4 条（期間）'],
    [/^제5조 \(반환·파기\)$/, 'Article 5 (Return and destruction)', '第 5 条（返还与销毁）', '第 5 条（返還・廃棄）'],
    [/^제6조 \(손해배상\)$/, 'Article 6 (Damages)', '第 6 条（损害赔偿）', '第 6 条（損害賠償）'],
    [/^제7조 \(기타\)$/, 'Article 7 (Miscellaneous)', '第 7 条（其他）', '第 7 条（その他）'],
    [/^(.+) 적용$/, '{1} applied', '适用 {1}', '{1} を適用'],
    [/^매입세액 공제 대상 · 실질 원가에서 제외$/, 'Creditable input VAT · excluded from net cost',
      '可抵扣进项税额 · 不计入实际成本', '仕入税額控除の対象 · 実質コストから除外'],
    [/^관세·부가세·통관·운송 포함$/, 'Duty, VAT, customs and transport included',
      '含关税、增值税、清关与运输', '関税・付加価値税・通関・輸送を含む'],
    [/^부가세 공제 후 실질 원가 · 개당$/, 'Net cost after VAT credit · per unit', '扣除增值税后的实际成本 · 每件', '付加価値税控除後の実質コスト · 1 個あたり'],
    [/^물품대금만 (.+) · 관세 (.+)$/, 'Goods only {1} · duty {2}', '仅货款 {1} · 关税 {2}', '商品代金のみ {1} · 関税 {2}'],
    [/^부가세 포함 · 개당 (.+)$/, 'Incl. VAT · {1} per unit', '含增值税 · 每件 {1}', '付加価値税込み · 1 個あたり {1}'],
    [/^박스당 (.+) CBM × (.+)박스$/, '{1} CBM per box × {2} boxes', '每箱 {1} CBM × {2} 箱', '1 箱 {1} CBM × {2} 箱'],
    [/^가로·세로·높이를 cm로$/, 'Width, depth and height in cm', '宽、深、高以厘米计', '幅・奥行・高さを cm で'],
    [/^참고 적재:$/, 'Loading guide:', '装载参考：', '積載の目安：'],
    [/^총 (.+) CBM이면 (.+) × (.+) 수준입니다\. 실제 적재량은 팔레트·적재 방식에 따라 10~20% 줄어들 수 있어, 견적서상 CBM보다 여유를 두세요\.$/,
      'A total of {1} CBM is about {2} × {3}. Real loads run 10–20% short of that depending on pallets and stacking, so leave headroom over the CBM on your quote.',
      '合计 {1} CBM 约相当于 {2} × {3}。实际装载量会因托盘与堆码方式减少 10~20%，报价时请留出余量。',
      '合計 {1} CBM は {2} × {3} 程度です。実際の積載量はパレットや積み方により 10〜20% 減るため、見積書の CBM より余裕を持たせてください。'],
    [/^총 (.+) CBM이면 (.+) 수준입니다\. 실제 적재량은 팔레트·적재 방식에 따라 10~20% 줄어들 수 있어, 견적서상 CBM보다 여유를 두세요\.$/,
      'A total of {1} CBM is about {2}. Real loads run 10–20% short of that depending on pallets and stacking, so leave headroom over the CBM on your quote.',
      '合计 {1} CBM 约相当于 {2}。实际装载量会因托盘与堆码方式减少 10~20%，报价时请留出余量。',
      '合計 {1} CBM は {2} 程度です。実際の積載量はパレットや積み方により 10〜20% 減るため、見積書の CBM より余裕を持たせてください。'],
    [/^20ft 1대$/, 'one 20ft container', '1 个 20 尺柜', '20ft 1 本'],
    [/^40ft 1대$/, 'one 40ft container', '1 个 40 尺柜', '40ft 1 本'],
    [/^40ft HC 1대$/, 'one 40ft HC container', '1 个 40 尺高柜', '40ft HC 1 本'],
    [/^(.+) × 40ft HC$/, '{1} × 40ft HC', '{1} × 40 尺高柜', '{1} × 40ft HC'],
    [/^FOB\/CIF 단가 × 환율 × 수량$/, 'FOB/CIF price × FX × quantity', 'FOB/CIF 单价 × 汇率 × 数量', 'FOB/CIF 単価 × 為替 × 数量'],
    [/^단가에 포함\(CIF\)$/, 'Included in price (CIF)', '已含在单价中(CIF)', '単価に含む(CIF)'],
    [/^별도 입력$/, 'Entered separately', '另行输入', '別途入力'],
    [/^과세가격\(CIF\)$/, 'Customs value (CIF)', '完税价格(CIF)', '課税価格(CIF)'],
    [/^수입 부가세$/, 'Import VAT', '进口增值税', '輸入付加価値税'],
    [/^\(과세가격 \+ 관세\) × 10%$/, '(customs value + duty) × 10%', '（完税价格 + 关税）× 10%', '（課税価格＋関税）× 10%'],
    [/^통관비·국내운송$/, 'Customs fees & domestic transport', '清关费与国内运输', '通関費・国内輸送'],
    [/^총 수입원가$/, 'Total import cost', '总进口成本', '総輸入コスト'],
    [/^실질 원가$/, 'Net cost', '实际成本', '実質コスト'],
    [/^부가세 매입세액 공제 후$/, 'After input VAT credit', '进项税抵扣后', '仕入税額控除後'],
    [/^개당 도착원가$/, 'Landed cost per unit', '单位到岸成本', '1 個あたり着荷コスト'],
    [/^통관·국내운송$/, 'Customs & domestic', '清关与国内运输', '通関・国内輸送'],
    [/^부가세\(공제\)$/, 'VAT (creditable)', '增值税（可抵扣）', '付加価値税（控除）'],

    /* ---- ⑤ 무역서식 ---- */
    [/^수량 × 단가 → Amount 자동$/, 'Quantity × price → amount', '数量 × 单价 → 自动计算金额', '数量 × 単価 → 金額を自動計算'],
    [/^카톤·중량·CBM 합계 자동$/, 'Cartons, weights and CBM totalled', '箱数、重量、CBM 自动合计', 'カートン・重量・CBM を自動集計'],
    [/^카톤·포장 수 합계$/, 'Total cartons and packages', '箱数与包装数合计', 'カートン・梱包数の合計'],
    [/^포장 제외 순중량$/, 'Net weight without packing', '不含包装的净重', '梱包を除いた正味重量'],
    [/^포장 포함 총중량$/, 'Gross weight with packing', '含包装的毛重', '梱包を含む総重量'],
    [/^용적 합계$/, 'Total volume', '体积合计', '容積の合計'],
    [/^수량 × 단가 합계$/, 'Quantity × price total', '数量 × 单价合计', '数量 × 単価の合計'],
    [/^모든 품목 수량 합계$/, 'Quantity across all items', '所有品项数量合计', '全品目の数量合計'],
    [/^인보이스에 실리는 품목$/, 'Items on the invoice', '发票上的品项', 'インボイスに載る品目'],
    [/^(.+) 종$/, '{1} items', '{1} 项', '{1} 品目'],

    /* ---- ① 견적서 문서 ---- */
    [/^견 적 서$/, 'QUOTATION', '报价单', '見積書'],
    [/^위와 같이 견적합니다\. \(단가는 부가세 별도 금액\)$/, 'Quoted as above. (Unit prices exclude VAT)',
      '如上报价。（单价为不含增值税金额）', '上記のとおり見積ります。（単価は付加価値税別）'],
    [/^위와 같이 견적합니다\. \(단가는 부가세 포함 금액\)$/, 'Quoted as above. (Unit prices include VAT)',
      '如上报价。（单价为含增值税金额）', '上記のとおり見積ります。（単価は付加価値税込み）'],
    [/^위와 같이 거래하였음을 확인합니다\. \(단가는 부가세 별도 금액\)$/, 'Confirmed as transacted above. (Unit prices exclude VAT)',
      '确认如上交易。（单价为不含增值税金额）', '上記のとおり取引したことを確認します。（単価は付加価値税別）'],
    [/^위와 같이 거래하였음을 확인합니다\. \(단가는 부가세 포함 금액\)$/, 'Confirmed as transacted above. (Unit prices include VAT)',
      '确认如上交易。（单价为含增值税金额）', '上記のとおり取引したことを確認します。（単価は付加価値税込み）'],
    [/^사업자등록번호 (.+)$/, 'Business No. {1}', '营业执照号 {1}', '事業者番号 {1}'],
    [/^대표 (.+)$/, 'CEO {1}', '代表 {1}', '代表 {1}'],
    [/^사업자 정보 미입력$/, 'Business details not entered', '未填写营业信息', '事業者情報が未入力'],
    [/^상호 미입력$/, 'Name not entered', '未填写商号', '商号が未入力'],
    [/^본 양식은 실무 참고용입니다\. 세금계산서 발급·신고는 홈택스와 세무대리인 안내를 따르세요\.$/,
      'This form is a practical reference. Tax invoices and filings must follow Hometax and your tax agent.',
      '本模板仅供参考。开具税务发票与申报请遵循 Hometax 与税务代理的指引。',
      'この書式は実務の参考用です。税務インボイスの発行・申告はホームタックスと税理士の案内に従ってください。'],

    /* ---- ④ 계약서 · 내용증명 ---- */
    [/^용역 계약서$/, 'SERVICE AGREEMENT', '服务合同', '業務委託契約書'],
    [/^비밀유지계약서$/, 'NON-DISCLOSURE AGREEMENT', '保密协议', '秘密保持契約書'],
    [/^내용증명$/, 'DEMAND LETTER', '催告函', '内容証明'],
    [/^비밀정보의 범위$/, 'Scope of confidential information', '保密信息范围', '秘密情報の範囲'],
    [/^업무의 범위$/, 'Scope of work', '工作范围', '業務の範囲'],
    [/^갑\(의뢰인\)과 을\(수급인\)은 아래와 같이 업무 위탁 계약을 체결한다\.$/,
      'The Client (Party A) and the Contractor (Party B) enter into the following service agreement.',
      '甲方（委托方）与乙方（承接方）就下列事项订立业务委托合同。',
      '甲（委託者）と乙（受託者）は、以下のとおり業務委託契約を締結する。'],
    [/^갑 \(의뢰인\)$/, 'A — Client', '甲方（委托方）', '甲（委託者）'],
    [/^을 \(수급인\)$/, 'B — Contractor', '乙方（承接方）', '乙（受託者）'],
    [/^상호·성명$/, 'Name', '名称/姓名', '商号・氏名'],
    [/^업무 착수일 (.+)부터 완료일 (.+)까지로 한다\. 상호 서면 합의로 기간을 연장할 수 있다\.$/,
      'The work runs from {1} to {2}. The term may be extended by written agreement.',
      '工作自 {1} 起至 {2} 止。经双方书面同意可以延长。',
      '業務は {1} から {2} までとする。双方の書面合意により期間を延長できる。'],
    [/^업무 착수일 (.+) 부터 완료일 (.+) 까지로 한다\. 상호 서면 합의로 기간을 연장할 수 있다\.$/,
      'The work runs from {1} to {2}. The term may be extended by written agreement.',
      '工作自 {1} 起至 {2} 止。经双方书面同意可以延长。',
      '業務は {1} から {2} までとする。双方の書面合意により期間を延長できる。'],
    [/^총 용역대금은 금 (.+) 원\(부가가치세 별도\)으로 한다\.$/, 'The total fee is KRW {1} (VAT excluded).',
      '服务费总额为 {1} 韩元（不含增值税）。', '業務委託料の総額は {1} ウォン（付加価値税別）とする。'],
    [/^총 용역대금은 금 (.+)\(부가가치세 별도\)으로 한다\.$/, 'The total fee is KRW {1} (VAT excluded).',
      '服务费总额为 {1} 韩元（不含增值税）。', '業務委託料の総額は {1} ウォン（付加価値税別）とする。'],
    [/^지급기한은 (.+) 로 한다\.$/, 'Payment is due by {1}.', '付款期限为 {1}。', '支払期限は {1} とする。'],
    [/^입금계좌: (.+)$/, 'Bank account: {1}', '收款账户：{1}', '入金口座：{1}'],
    [/^갑은 결과물 검수를 마친 뒤 대금을 지급한다\.$/, 'Party A pays after inspecting the deliverables.',
      '甲方在验收成果后支付款项。', '甲は成果物の検収後に代金を支払う。'],
    [/^갑은 결과물을 받은 날부터 7일 안에 검수하고, 흠결이 있으면 구체적인 사항을 적어 보완을 요청한다\. 그 기간 안에 통지가 없으면 검수를 마친 것으로 본다\.$/,
      'Party A inspects within seven days of receiving the deliverables and, if there are defects, requests fixes in writing. Without notice within that period, the deliverables are deemed accepted.',
      '甲方自收到成果起 7 日内验收，如有瑕疵应具体写明并要求补正。该期限内未通知的，视为验收完成。',
      '甲は成果物を受け取った日から 7 日以内に検収し、瑕疵があれば具体的に記載して補修を求める。その期間内に通知がなければ検収を終えたものとみなす。'],
    [/^을이 이 계약에 따라 만든 결과물의 저작재산권은 대금이 모두 지급되면 갑에게 이전한다\. 다만 을이 사전에 보유한 도구·라이브러리·노하우와 제3자의 오픈소스는 제외한다\.$/,
      'Copyright in the deliverables Party B creates under this agreement transfers to Party A once the fee is paid in full, excluding tools, libraries and know-how Party B already held and third-party open source.',
      '乙方依本合同制作的成果，其著作权在款项全部支付后转移给甲方。但乙方事先自有的工具、库、技术诀窍及第三方开源部分除外。',
      '乙が本契約に基づき制作した成果物の著作権は、代金の全額支払い後に甲へ移転する。ただし乙が事前に有していたツール・ライブラリ・ノウハウおよび第三者のオープンソースは除く。'],
    [/^양 당사자는 계약 과정에서 알게 된 상대방의 비밀정보를 계약이 끝난 뒤 3년간 제3자에게 알리지 않는다\.$/,
      'Both parties keep the other side\u2019s confidential information secret for three years after the agreement ends.',
      '双方对合同过程中知悉的对方保密信息，在合同结束后 3 年内不得告知第三方。',
      '両当事者は、契約過程で知った相手方の秘密情報を、契約終了後 3 年間は第三者に開示しない。'],
    [/^어느 한쪽이 계약상 의무를 중대하게 어기고 상대가 7일 이상의 기간을 정해 시정을 요구했는데도 고치지 않으면, 상대는 계약을 해지할 수 있다\. 이때 을은 그때까지 한 업무에 해당하는 대금을 청구할 수 있다\.$/,
      'If one party materially breaches the agreement and does not cure it within a period of seven days or more set by the other party, the other party may terminate. Party B may then invoice for work performed up to that point.',
      '一方严重违反合同义务，经对方指定 7 日以上期限要求改正仍未改正的，对方可以解除合同。此时乙方可就已完成的工作请求相应款项。',
      '一方が契約上の義務に重大に違反し、相手方が 7 日以上の期間を定めて是正を求めたにもかかわらず改めない場合、相手方は契約を解除できる。この場合、乙はそれまでに行った業務に相当する代金を請求できる。'],
    [/^이 계약에 관한 분쟁은 상호 협의로 해결하고, 협의가 되지 않으면 갑의 주소지 관할 법원에 제기한다\.$/,
      'Disputes are resolved by mutual consultation, and failing that, brought before the court having jurisdiction over Party A\u2019s address.',
      '本合同相关争议通过协商解决；协商不成的，提交甲方住所地有管辖权的法院。',
      '本契約に関する紛争は相互協議で解決し、協議が整わない場合は甲の住所地を管轄する裁判所に提起する。'],
    [/^이 계약에 정하지 않은 사항은 관계 법령과 일반 상관례에 따른다\. 계약의 변경은 서면으로 한다\.$/,
      'Matters not covered follow applicable law and ordinary commercial practice. Changes are made in writing.',
      '本合同未约定事项依相关法令与一般商业惯例处理。合同的变更须以书面进行。',
      '本契約に定めのない事項は関係法令と一般の商慣行による。契約の変更は書面で行う。'],
    [/^제목: 미지급 대금 (.+)의 지급을 촉구합니다$/, 'Subject: demand for payment of the outstanding {1}',
      '标题：催告支付未付货款 {1}', '件名：未払代金 {1} の支払いを求めます'],
    [/^발신인 (.+) \(인\)$/, 'Sender {1} (seal)', '发件人 {1}（盖章）', '差出人 {1}（印）'],
    [/^수신$/, 'To', '收件', '宛先'],
    [/^발신$/, 'From', '发件', '差出'],
    [/^발신인 주소$/, 'Sender address', '发件人地址', '差出人住所'],
    [/^연락처$/, 'Contact', '联系方式', '連絡先'],
    [/^1\. 채무의 발생$/, '1. Origin of the debt', '1. 债务的发生', '1. 債務の発生'],
    [/^2\. 지급 지연$/, '2. Payment delay', '2. 付款延迟', '2. 支払遅延'],
    [/^3\. 지급 요청$/, '3. Request for payment', '3. 付款请求', '3. 支払の請求'],
    [/^4\. 협의 요청$/, '4. Request to discuss', '4. 协商请求', '4. 協議の申し入れ'],
    [/^귀하는 아래와 같이 발생한 대금을 지급하기로 하였습니다\.$/, 'You agreed to pay the amount arising as set out below.',
      '贵方已同意支付下列发生的款项。', '貴殿は以下のとおり発生した代金を支払うこととしました。'],
    [/^발생 원인: (.+)$/, 'Origin: {1}', '发生原因：{1}', '発生原因：{1}'],
    [/^청구 금액: 금 (.+) \(부가가치세 포함\)$/, 'Amount claimed: KRW {1} (VAT included)',
      '请求金额：{1}（含增值税）', '請求金額：{1}（付加価値税込み）'],
    [/^지급기한: (.+)$/, 'Due date: {1}', '付款期限：{1}', '支払期限：{1}'],
    [/^위 지급기한이 지난 지금까지 대금이 입금되지 않았습니다\.$/, 'The payment has not arrived even though the due date has passed.',
      '付款期限已过，至今仍未收到款项。', '支払期限を過ぎた今も入金がありません。'],
    [/^이 통지서를 받은 날부터 7일 안에 아래 계좌로 지급해 주시기 바랍니다\. 기간 안에 지급이 없으면 부득이 지급명령 신청 등 법적 절차를 진행할 수 있으며, 그에 드는 비용은 귀하에게 청구할 수 있습니다\.$/,
      'Please pay into the account below within seven days of receiving this notice. Without payment in that period we may have to start legal proceedings, including an application for a payment order, and charge you the cost.',
      '请在本通知送达之日起 7 日内汇入下列账户。期限内未付款的，我方将不得不申请支付令等法律程序，由此产生的费用可向贵方请求。',
      '本書を受け取った日から 7 日以内に下記口座へお支払いください。期間内に入金がない場合、支払督促の申立てなどの法的手続きに進まざるを得ず、その費用は貴殿に請求できます。'],
    [/^지급이 어려운 사정이 있으면 기일을 정해 먼저 연락해 주시기 바랍니다\. 상호 협의로 분할 지급도 검토하겠습니다\.$/,
      'If payment is difficult, please contact us first with a proposed date. We are open to instalments by mutual agreement.',
      '如付款有困难，请先定好日期与我们联系。双方协商后也可考虑分期付款。',
      '支払いが難しい事情があれば、期日を定めて先にご連絡ください。相互協議による分割払いも検討します。'],
    [/^(.+)와\(과\) (.+)은 아래와 같이 비밀유지 계약을 체결한다\.$/, 'The parties enter into the following confidentiality agreement.',
      '双方就下列事项订立保密协议。', '両当事者は、以下のとおり秘密保持契約を締結する。'],
    [/^양 당사자가 사업 제휴·거래 협의 과정에서 주고받는 정보를 보호하기 위한 것이다\.$/,
      'This protects information the parties exchange while discussing a business partnership or transaction.',
      '本协议旨在保护双方在业务合作与交易协商过程中交换的信息。',
      '両当事者が事業提携・取引協議の過程でやり取りする情報を保護するためのものである。'],
    [/^서면·전자·구두로 제공된 기술자료, 단가와 거래조건, 고객·공급처 정보, 사업계획 등 공개되지 않은 정보$/,
      'Non-public information such as technical materials, prices and terms, customer and supplier details, and business plans shared in writing, electronically or orally',
      '以书面、电子或口头方式提供的技术资料、价格与交易条件、客户与供应商信息、事业计划等未公开信息',
      '書面・電子・口頭で提供された技術資料、単価と取引条件、顧客・供給元の情報、事業計画など公開されていない情報'],
    [/^다음은 비밀정보에서 제외한다\. ① 이미 공개된 정보 ② 제공받기 전에 정당하게 보유하고 있던 정보 ③ 제3자로부터 적법하게 받은 정보 ④ 비밀정보 없이 독자적으로 개발한 정보$/,
      'Confidential information excludes: (1) information already public; (2) information lawfully held before disclosure; (3) information lawfully received from a third party; (4) information developed independently without the confidential information.',
      '下列信息不属于保密信息：① 已公开的信息 ② 接受前已合法持有的信息 ③ 从第三方合法获得的信息 ④ 未使用保密信息而独立开发的信息',
      '以下は秘密情報から除く。① すでに公開されている情報 ② 提供を受ける前に正当に保有していた情報 ③ 第三者から適法に受領した情報 ④ 秘密情報なしに独自に開発した情報'],
    [/^정보를 받은 당사자는 비밀정보를 이 계약의 목적에만 쓰고, 업무상 필요한 최소한의 인원에게만 알리며, 제3자에게 제공하거나 누설하지 않는다\.$/,
      'The receiving party uses the confidential information only for the purpose of this agreement, shares it only with staff who need it, and does not provide or disclose it to third parties.',
      '接收方仅将保密信息用于本协议目的，仅告知工作上必要的最少人员，不得向第三方提供或泄露。',
      '情報を受けた当事者は、秘密情報を本契約の目的にのみ使用し、業務上必要な最小限の人員にのみ開示し、第三者へ提供または漏洩しない。'],
    [/^이 계약은 (.+)부터 효력이 생기고, 비밀유지 의무는 계약이 끝난 뒤 (.+)년간 존속한다\.$/,
      'This agreement takes effect on {1}, and the duty of confidentiality lasts for {2} years after it ends.',
      '本协议自 {1} 起生效，保密义务在协议结束后存续 {2} 年。',
      '本契約は {1} から効力を生じ、秘密保持義務は契約終了後 {2} 年間存続する。'],
    [/^목적이 끝나면 상대방의 요청에 따라 비밀정보를 반환하거나 파기하고, 그 사실을 알린다\.$/,
      'When the purpose ends, the receiving party returns or destroys the confidential information at the other side\u2019s request and confirms it has done so.',
      '目的结束后，应按对方要求返还或销毁保密信息，并告知其结果。',
      '目的が終われば、相手方の求めに応じて秘密情報を返還または廃棄し、その旨を通知する。'],
    [/^이 계약을 어겨 상대방에게 손해가 생기면 그 손해를 배상한다\.$/,
      'A party that breaches this agreement and causes loss to the other compensates that loss.',
      '违反本协议给对方造成损失的，应赔偿该损失。',
      '本契約に違反して相手方に損害が生じた場合は、その損害を賠償する。'],
    [/^이 계약은 서면 합의로 변경하며, 분쟁은 상호 협의로 해결하고 협의가 되지 않으면 관할 법원에 제기한다\.$/,
      'This agreement is changed by written consent; disputes are settled by mutual consultation and otherwise brought before the competent court.',
      '本协议以书面合意变更；争议通过协商解决，协商不成的提交有管辖权的法院。',
      '本契約は書面の合意で変更し、紛争は相互協議で解決し、協議が整わない場合は管轄裁判所に提起する。'],
    [/^거래\(용역·납품\) 계약$/, 'a transaction (service or supply) agreement', '交易（服务·供货）合同', '取引（業務・納品）契約'],
    [/^검수 완료 후 7일 이내$/, 'within 7 days of acceptance', '验收完成后 7 日内', '検収完了後 7 日以内'],
    [/^갑$/, 'Party A', '甲方', '甲'],
    [/^을$/, 'Party B', '乙方', '乙'],
    [/^\(인\)$/, '(seal)', '（盖章）', '（印）'],

    /* ---- 공통 문구 ---- */
    [/^금액을 입력하세요$/, 'Enter an amount', '请输入金额', '金額を入力してください'],
    [/^문서 내용을 복사했습니다\. 메일에 붙여 넣으세요\.$/, 'Document copied. Paste it into your email.',
      '已复制文档内容，请粘贴到邮件中。', '文書の内容をコピーしました。メールに貼り付けてください。'],
    [/^문서 내용을 복사했습니다\. 메일·워드에 붙여 넣으세요\.$/, 'Document copied. Paste it into your email or Word.',
      '已复制文档内容，请粘贴到邮件或 Word。', '文書の内容をコピーしました。メールや Word に貼り付けてください。'],
    [/^계약서 본문을 복사했습니다\. 워드·한글에 붙여 넣어 서식을 다듬으세요\.$/, 'Contract copied. Paste it into Word or Hangul and tidy the formatting.',
      '已复制合同正文，请粘贴到 Word 或 Hangul 调整格式。', '契約書の本文をコピーしました。Word やハングルに貼り付けて整えてください。'],
    [/^본문을 복사했습니다\. 한글\(HWP\)에서 붙여 넣으면 서식 없이 편집할 수 있습니다\.$/, 'Body copied. Paste it into Hangul (HWP) to edit without formatting.',
      '已复制正文。粘贴到 Hangul(HWP) 可无格式编辑。', '本文をコピーしました。ハングル（HWP）に貼り付けると書式なしで編集できます。'],
    [/^복사하지 못했습니다\. 문서를 직접 선택해 복사해 주세요\.$/, 'Copy failed. Select the document and copy it yourself.',
      '复制失败，请直接选择文档复制。', 'コピーできませんでした。文書を直接選択してコピーしてください。'],
    [/^복사하지 못했습니다\. 본문을 직접 선택해 복사해 주세요\.$/, 'Copy failed. Select the text and copy it yourself.',
      '复制失败，请直接选择正文复制。', 'コピーできませんでした。本文を直接選択してコピーしてください。'],
    [/^받고 싶은 실수령액을 넣으면 세전 금액을 계산합니다$/, 'Enter the take-home you want to back-calculate the pre-tax amount',
      '填入期望到手金额即可反推税前金额', '希望する手取り額を入れると税引前の金額を計算します'],
    [/^계약금액 − 3\.3%$/, 'Contract amount − 3.3%', '合同金额 − 3.3%', '契約金額 − 3.3%'],
    [/^수입 − 경비$/, 'Revenue − expenses', '收入 − 费用', '収入 − 経費'],
    [/^소득 − 기본공제\(150만 × 인원\)$/, 'Income − basic deduction (KRW 1.5M × dependants)',
      '所得 − 基本扣除（150 万 × 人数）', '所得 − 基礎控除（150 万 × 人数）'],
    [/^기납부와 비교$/, 'Compared with tax already paid', '与已缴税额比较', '既納税額との比較'],
    [/^소득세 \+ 지방소득세$/, 'Income tax + local income tax', '所得税 + 地方所得税', '所得税＋地方所得税']
  ];

  /* 문장 안에 섞여 나오는 문구 — 숫자 패턴 규칙보다 먼저 치환합니다. */
  var PHRASES = [
    ['간이는 매입세액 공제가 세금계산서 수취분으로 제한되고, 거래처가 세금계산서를 요구하면 발급 부담이 생깁니다.',
      'Under simplified taxation, input VAT credit is limited to invoices you receive, and issuing invoices for business clients becomes a burden.',
      '简易课税的进项抵扣仅限收到的税务发票，客户要求开票时也会产生开票负担。',
      '簡易課税では仕入税額控除が受け取った請求書分に限られ、取引先が請求書を求めると発行の負担が生じます。'],
    ['참고 적재:', 'Loading guide:', '装载参考：', '積載の目安：']
  ];

  /* 정확히 일치하는 문장 (숫자가 없는 것) */
  var EXACT = [
    ['참고 적재:', 'Loading guide:', '装载参考：', '積載の目安：'],
    ['통관·국내운송', 'Customs & domestic', '清关与国内运输', '通関・国内輸送']
  ];

  var COMPILED = RULES.map(function (r) {
    return { re: r[0], rep: r[L === 'en' ? 1 : L === 'zh' ? 2 : 3] };
  });
  var MAP = {};
  EXACT.forEach(function (e) { MAP[e[0]] = e[L === 'en' ? 1 : L === 'zh' ? 2 : 3]; });

  var PHR = PHRASES.map(function (p) { return [p[0], p[L === 'en' ? 1 : L === 'zh' ? 2 : 3]]; });

  function tr(s) {
    if (MAP[s] != null) return MAP[s];
    var t = s;
    for (var p = 0; p < PHR.length; p++) {
      if (t.indexOf(PHR[p][0]) >= 0) t = t.split(PHR[p][0]).join(PHR[p][1]);
    }
    if (t !== s && !HANGUL.test(t)) return t;
    for (var i = 0; i < COMPILED.length; i++) {
      var c = COMPILED[i];
      var m = t.match(c.re);
      if (!m) continue;
      var out = c.rep, bad = false;
      for (var g = 1; g < m.length; g++) {
        if (out.indexOf('{' + g + '}') === -1) continue;   /* 쓰지 않는 캡처는 검사하지 않습니다 */
        var cap = m[g] == null ? '' : m[g].trim();
        if (/원|won/.test(cap)) cap = cap.replace(/원|won/g, '').trim();
        if (HANGUL.test(cap)) { bad = true; break; }
        out = out.split('{' + g + '}').join(cap);
      }
      if (bad || HANGUL.test(out)) continue;
      return out;
    }
    if (t !== s && !HANGUL.test(t)) return t;
    return null;
  }

  var SKIP = { SCRIPT: 1, STYLE: 1, NOSCRIPT: 1, CODE: 1 };
  function skipped(node) {
    var p = node.parentNode;
    while (p && p.nodeType === 1) {
      if (SKIP[p.tagName]) return true;
      p = p.parentNode;
    }
    return false;
  }

  function patchNode(node) {
    var rawText = node.nodeValue;
    if (!rawText || !HANGUL.test(rawText)) return;
    var core = rawText.replace(/\s+/g, ' ').trim();
    if (!core) return;
    var out = tr(core);
    if (out == null || out === core) return;
    var lead = rawText.match(/^\s*/)[0];
    var tail = rawText.match(/\s*$/)[0];
    node.nodeValue = lead + out + tail;
  }

  function pass(root) {
    if (!root || !root.querySelectorAll) return;
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    var batch = [], n;
    while ((n = walker.nextNode())) batch.push(n);
    for (var i = 0; i < batch.length; i++) {
      if (!skipped(batch[i])) patchNode(batch[i]);
    }
  }

  var scheduled = false;
  function schedule() {
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(function () { scheduled = false; pass(document.body); });
  }

  function boot() {
    pass(document.body);
    try {
      new MutationObserver(function (muts) {
        for (var i = 0; i < muts.length; i++) {
          var m = muts[i];
          if (m.type === 'characterData') {
            if (m.target && !skipped(m.target)) patchNode(m.target);
            continue;
          }
          if (m.addedNodes && m.addedNodes.length) { schedule(); return; }
        }
      }).observe(document.body, { childList: true, subtree: true, characterData: true });
    } catch (e) { /* 무시 */ }
    [150, 600, 1500, 3000].forEach(function (ms) { setTimeout(schedule, ms); });
  }

  window.IBZ_PATCHED = true;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
