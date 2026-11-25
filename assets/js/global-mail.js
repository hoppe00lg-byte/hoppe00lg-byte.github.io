/* =========================================================
   INSIGHT BRIEF — 무역·비즈니스 이메일 템플릿 (4개국어)
   9가지 상황 × ko/en/zh/ja. global.js 가 값을 채워 완성합니다.
   {to} {toCompany} {from} {fromCompany} {product} {qty} {unit}
   {price} {cur} {incoterm} {pol} {pod} {etd} {deadline} {validity}
   {invoice} {amount} {spec} {note}
   ========================================================= */
(function () {
  'use strict';

  var M = {};

  /* 값이 비었을 때 남기는 표시 */
  M.blank = {
    ko: { to: '담당자', toCompany: '귀사', from: '담당자', fromCompany: '당사', product: '[품목]', qty: '[수량]', unit: '개', price: '[단가]', cur: 'USD', incoterm: 'FOB', pol: '[선적항]', pod: '[도착항]', etd: '[날짜]', deadline: '[기한]', validity: '[유효기간]', invoice: '[문서번호]', amount: '[금액]', spec: '[규격]' },
    en: { to: 'Sir or Madam', toCompany: 'your company', from: 'the undersigned', fromCompany: 'our company', product: '[item]', qty: '[quantity]', unit: 'units', price: '[price]', cur: 'USD', incoterm: 'FOB', pol: '[port of loading]', pod: '[port of discharge]', etd: '[date]', deadline: '[date]', validity: '[date]', invoice: '[no.]', amount: '[amount]', spec: '[specification]' },
    zh: { to: '负责人', toCompany: '贵司', from: '本人', fromCompany: '我司', product: '[品名]', qty: '[数量]', unit: '个', price: '[单价]', cur: 'USD', incoterm: 'FOB', pol: '[装运港]', pod: '[目的港]', etd: '[日期]', deadline: '[期限]', validity: '[有效期]', invoice: '[单据号]', amount: '[金额]', spec: '[规格]' },
    ja: { to: 'ご担当者', toCompany: '貴社', from: '担当者', fromCompany: '弊社', product: '［品目］', qty: '［数量］', unit: '個', price: '［単価］', cur: 'USD', incoterm: 'FOB', pol: '［積出港］', pod: '［仕向港］', etd: '［日付］', deadline: '［期限］', validity: '［有効期限］', invoice: '［書類番号］', amount: '［金額］', spec: '［仕様］' }
  };

  /* ---------------------------------------------------------------
     한국어
  --------------------------------------------------------------- */
  M.ko = {
    inquiry: {
      subject: '{product} 공급 문의 — {fromCompany}',
      body: '{to} 님께\n\n안녕하세요. 한국에서 재생 플라스틱 원료(PC·ABS·PP 등)를 수입하는 {fromCompany}의 {from}입니다.\n\n{product}를 월 {qty} 규모로 정기 공급받을 수 있는지 문의드립니다. 규격서와 포장 사양, {incoterm} {pod} 기준 최저가를 함께 보내 주시면 검토하겠습니다.\n\n희망 단가는 {price} {cur}/{unit} 선입니다. 우선 소량으로 시험 주문을 하고, 품질이 확인되면 물량을 늘리는 방식으로 진행하고 싶습니다.\n\n바쁘시겠지만 {deadline}까지 회신 주시면 감사하겠습니다.\n\n감사합니다.\n\n{from}\n{fromCompany}'
    },
    quote_request: {
      subject: '견적 요청 — {product} ({qty})',
      body: '{to} 님께\n\n안녕하세요, {fromCompany}의 {from}입니다. 구매 계획을 정리하고 있어 아래 건으로 정식 견적을 요청드립니다.\n\n· 품목: {product}\n· 수량: {qty}\n· 가격 조건: {incoterm} {pod}\n· 희망 납기: {etd}\n· 요구 규격: {spec}\n\n단가와 최소 주문 수량, 생산 소요 기간, 포장 방식, HS코드, 견적 유효기간을 함께 알려 주세요. {price} {cur}/{unit} 수준에서 가능하시면 1주일 안에 발주를 확정할 수 있습니다.\n\n견적 기다리겠습니다.\n\n감사합니다.\n\n{from}\n{fromCompany}'
    },
    quote_offer: {
      subject: '견적서 송부 — {product} / {fromCompany}',
      body: '{to} 님께\n\n문의 주셔서 감사합니다. 아래와 같이 견적을 제시드립니다.\n\n· 품목: {product}\n· 수량: {qty}\n· 단가: {price} {cur}/{unit} {incoterm} {pol}\n· 선적: {etd}\n· 유효기간: {validity}\n· 결제: T/T 30% 선금, 잔금은 B/L 사본과 상환\n\n이 가격은 현재 원료 시세와 운임을 기준으로 한 것입니다. {validity}까지는 그대로 유지하겠습니다. 규격이나 포장을 바꾸실 경우 말씀 주시면 조정해 다시 보내 드리겠습니다.\n\n주문 기다리겠습니다.\n\n감사합니다.\n\n{from}\n{fromCompany}'
    },
    negotiation: {
      subject: 'Re: {product} 단가 조정 요청',
      body: '{to} 님께\n\n{price} {cur}/{unit} 견적 잘 받았습니다. 이번 달 받은 다른 견적들과 비교해 보았고, 가능하시다면 최종 단가를 다시 한 번 조정해 주시기를 부탁드립니다.\n\n저희 목표는 {qty} 기준 {price} {cur}/{unit} ({incoterm} {pod})입니다. 어려우시다면 결제 조건을 늘리거나, 먼저 소량으로 시험 주문을 하고 납품 후 물량 단가를 다시 협의하는 방식도 가능합니다.\n\n{deadline}까지 목표 단가 충족 여부와, 그 단가가 가능한 최소 물량을 알려 주시면 바로 검토하겠습니다.\n\n감사합니다.\n\n{from}\n{fromCompany}'
    },
    order_confirm: {
      subject: '주문 확정 — {product} / PO {invoice}',
      body: '{to} 님께\n\n아래와 같이 주문을 확정하며 구매주문서 {invoice}를 첨부합니다.\n\n· 품목: {product}\n· 수량: {qty}\n· 단가: {price} {cur}/{unit} {incoterm} {pod}\n· 금액: {amount} {cur}\n· 희망 선적: {etd}\n· 포장·규격: {spec}\n\nProforma Invoice를 발행해 주시고 생산 일정을 확정해 주세요. PI를 받는 대로 선금을 송금하겠습니다. HS코드와 함께 송부 예정 서류(인보이스·패킹리스트·B/L·원산지증명)도 확인 부탁드립니다.\n\n협조에 감사드립니다.\n\n{from}\n{fromCompany}'
    },
    shipping_chase: {
      subject: '선적 일정 확인 — {product} / {invoice}',
      body: '{to} 님께\n\n주문 {invoice} 건은 {etd} 선적으로 예정되어 있었으나, 아직 선적 서류와 부킹 확정을 받지 못했습니다.\n\n현재 상태를 알려 주시기 바랍니다. 생산 완료 여부, 확정 ETD, 선박·항차를 확인해 주시고, 선복이나 일정 문제로 지연된 것이라면 가장 빠른 출항일과 분할 선적 가능 여부를 함께 알려 주세요.\n\n저희 거래처 생산 라인이 {deadline}에 시작될 예정이라, 오늘 중으로 원래 일정을 지킬 수 있는지 확인이 필요합니다.\n\n감사합니다.\n\n{from}\n{fromCompany}'
    },
    claim: {
      subject: '품질 클레임 — {product} / {invoice}',
      body: '{to} 님께\n\n{invoice} 건 화물을 입고해 검수한 결과, 아래와 같은 문제를 확인했습니다.\n\n· 품목: {product}\n· 문제 수량: {qty}\n· 문제 내용: {spec}\n\n사진과 검수 기록을 첨부합니다. 현재 상태로는 저희 생산에 투입할 수 없어, 대체품 공급·단가 조정·해당 수량에 대한 크레딧노트 중 어떤 방식이 가능한지 제안해 주시기 바랍니다.\n\n{deadline}까지 회신 주시면 감사하겠습니다. 가능하면 원만하게 마무리하고 거래를 이어가고 싶습니다.\n\n감사합니다.\n\n{from}\n{fromCompany}'
    },
    payment_reminder: {
      subject: '결제 안내 — 인보이스 {invoice} ({amount} {cur})',
      body: '{to} 님께\n\n인보이스 {invoice} ({amount} {cur})의 결제일이 {deadline}이었으나, 아직 입금이 확인되지 않아 연락드립니다.\n\n재무팀에 확인하시어 송금 예정일을 알려 주시기 바랍니다. 이미 송금하셨다면 송금 확인서를 보내 주시면 저희 장부와 대사하겠습니다.\n\n서류나 금액에 문제가 있다면 말씀 주세요. 함께 확인해 바로 정리하겠습니다.\n\n감사합니다.\n\n{from}\n{fromCompany}'
    },
    thanks: {
      subject: '{product} 납품 감사 — {fromCompany}',
      body: '{to} 님께\n\n화물이 문제없이 도착했고 품질도 저희 규격에 맞았습니다. 꼼꼼한 포장과 일정 준수에 감사드립니다.\n\n다음 물량은 {qty}로 예정하고 있으며, 희망 선적일은 {etd}입니다. 같은 조건으로 견적을 보내 주실 수 있을까요? 가격이 안정적이라면 월 단위 정기 거래로 전환하고 싶습니다.\n\n앞으로도 잘 부탁드립니다.\n\n감사합니다.\n\n{from}\n{fromCompany}'
    }
  };

  /* ---------------------------------------------------------------
     English
  --------------------------------------------------------------- */
  M.en = {
    inquiry: {
      subject: 'Inquiry: {product} — {fromCompany}',
      body: 'Dear {to},\n\nI am {from} of {fromCompany} in Korea. We import recycled plastic raw materials such as PC, ABS and PP.\n\nWe would like to know whether you can supply {product} on a regular basis, around {qty} per month. Please send your specification sheet, packing details and your best price on {incoterm} {pod} terms.\n\nOur indicative target is {price} {cur} per {unit}. We would prefer to start with a trial order and increase the volume once the quality is confirmed.\n\nCould you reply by {deadline}? We are finalising our purchasing plan this month.\n\nBest regards,\n{from}\n{fromCompany}'
    },
    quote_request: {
      subject: 'Request for quotation — {product} ({qty})',
      body: 'Dear {to},\n\nThank you for your time. We are preparing our purchasing plan and would like a formal quotation for the following.\n\nItem: {product}\nQuantity: {qty}\nPrice basis: {incoterm} {pod}\nRequired delivery: {etd}\nSpecification: {spec}\n\nPlease include the unit price, minimum order quantity, lead time, packing, HS code and the validity of your offer. If you can work at {price} {cur} per {unit}, we can confirm the order within a week.\n\nWe look forward to your quotation.\n\nBest regards,\n{from}\n{fromCompany}'
    },
    quote_offer: {
      subject: 'Quotation — {product} / {fromCompany}',
      body: 'Dear {to},\n\nThank you for your inquiry. We are pleased to offer as follows.\n\nItem: {product}\nQuantity: {qty}\nUnit price: {price} {cur} per {unit}, {incoterm} {pol}\nShipment: {etd}\nValidity: {validity}\nPayment: 30% T/T in advance, balance against copy of B/L\n\nThe price reflects current raw material and freight levels and we can hold it until {validity}. If you need a different specification or packing, let us know and we will revise the offer.\n\nWe look forward to your order.\n\nBest regards,\n{from}\n{fromCompany}'
    },
    negotiation: {
      subject: 'Re: Price for {product} — request for review',
      body: 'Dear {to},\n\nThank you for your quotation of {price} {cur} per {unit}. We have compared it with the other offers received this month and would like to ask you to review your best price.\n\nOur target is {price} {cur} per {unit} on {incoterm} {pod} terms for {qty}. If that is difficult, we can also work with a longer payment term, or start with a small trial order at your current price and review the volume price after the first shipment.\n\nCould you let us know by {deadline} whether the target is achievable, and what volume would be needed to reach it? We will review it immediately.\n\nBest regards,\n{from}\n{fromCompany}'
    },
    order_confirm: {
      subject: 'Order confirmation — {product} / PO {invoice}',
      body: 'Dear {to},\n\nWe confirm our order as follows and attach purchase order {invoice}.\n\nItem: {product}\nQuantity: {qty}\nUnit price: {price} {cur} per {unit}, {incoterm} {pod}\nAmount: {amount} {cur}\nRequested shipment: {etd}\nPacking and specification: {spec}\n\nPlease issue the proforma invoice and confirm the production schedule. We will arrange the deposit as soon as we receive the PI. Please also confirm the HS code and the documents you will send (invoice, packing list, B/L, certificate of origin).\n\nThank you for your cooperation.\n\nBest regards,\n{from}\n{fromCompany}'
    },
    shipping_chase: {
      subject: 'Shipment status — {product} / {invoice}',
      body: 'Dear {to},\n\nUnder order {invoice} the shipment was scheduled for {etd}, but we have not yet received the shipping documents or the booking confirmation.\n\nCould you give us the current status: production completion, the confirmed ETD and the vessel and voyage? If the delay is caused by space or schedule, please tell us the earliest available departure and whether a partial shipment is possible.\n\nOur customer’s production line starts on {deadline}, so we need to know today whether the original date can still be met.\n\nBest regards,\n{from}\n{fromCompany}'
    },
    claim: {
      subject: 'Quality claim — {product} / {invoice}',
      body: 'Dear {to},\n\nWe received the shipment under {invoice} and inspected it on arrival. Unfortunately we found the following problem.\n\nItem: {product}\nQuantity affected: {qty}\nProblem: {spec}\n\nPhotographs and the inspection record are attached. The material cannot be used in our production as it stands, so we would like to ask for your proposal: replacement, a price adjustment, or a credit note for the affected quantity.\n\nPlease let us know your position by {deadline}. We would prefer to settle this amicably and keep our cooperation going.\n\nBest regards,\n{from}\n{fromCompany}'
    },
    payment_reminder: {
      subject: 'Payment reminder — invoice {invoice} ({amount} {cur})',
      body: 'Dear {to},\n\nThis is a friendly reminder that invoice {invoice} for {amount} {cur} was due on {deadline}. Our records still show the balance as outstanding.\n\nCould you check with your finance team and confirm the payment date? If the transfer has already been made, please send us the remittance advice so we can match it in our books.\n\nIf there is any issue with the documents or the amount, tell us and we will resolve it together.\n\nBest regards,\n{from}\n{fromCompany}'
    },
    thanks: {
      subject: 'Thank you — {product} shipment',
      body: 'Dear {to},\n\nThe shipment arrived safely and the quality met our specification. Thank you for the careful packing and for keeping to the schedule.\n\nOur next requirement is {qty} of {product}, planned for {etd}. Could you send us your offer on the same terms? If the price is stable, we would like to move to a monthly arrangement.\n\nWe appreciate your support and look forward to working together again.\n\nBest regards,\n{from}\n{fromCompany}'
    }
  };

  /* ---------------------------------------------------------------
     中文
  --------------------------------------------------------------- */
  M.zh = {
    inquiry: {
      subject: '询价：{product} — {fromCompany}',
      body: '尊敬的{to}：\n\n您好！我是韩国{fromCompany}的{from}，公司主要进口 PC、ABS、PP 等再生塑料原料。\n\n想了解贵司能否稳定供应 {product}，每月约 {qty}。请一并提供规格书、包装说明以及 {incoterm} {pod} 条件的最低报价。\n\n我们的参考目标是 {price} {cur}/{unit}。希望先以小批量试单，品质确认后再逐步增加数量。\n\n如能在 {deadline} 前回复，我们将非常感激。本月内需要确定采购计划。\n\n顺颂商祺\n\n{from}\n{fromCompany}'
    },
    quote_request: {
      subject: '询价请求 — {product}（{qty}）',
      body: '尊敬的{to}：\n\n您好！我是{fromCompany}的{from}。我们正在制定采购计划，现就以下项目请求正式报价。\n\n· 品名：{product}\n· 数量：{qty}\n· 价格条件：{incoterm} {pod}\n· 希望交期：{etd}\n· 规格要求：{spec}\n\n请一并告知单价、最小起订量、生产周期、包装方式、HS 编码以及报价有效期。若能在 {price} {cur}/{unit} 的水平成交，我们可在一周内确认订单。\n\n期待您的报价。\n\n顺颂商祺\n\n{from}\n{fromCompany}'
    },
    quote_offer: {
      subject: '报价单 — {product} / {fromCompany}',
      body: '尊敬的{to}：\n\n感谢您的询价，现报价如下。\n\n· 品名：{product}\n· 数量：{qty}\n· 单价：{price} {cur}/{unit}，{incoterm} {pol}\n· 装运：{etd}\n· 有效期：{validity}\n· 付款：电汇 30% 预付，余款凭提单副本支付\n\n本报价基于当前原料行情与运价，有效期至 {validity}。如需调整规格或包装，请告知，我们会修改后重新发送。\n\n期待您的订单。\n\n顺颂商祺\n\n{from}\n{fromCompany}'
    },
    negotiation: {
      subject: '回复：{product} 价格调整请求',
      body: '尊敬的{to}：\n\n感谢您 {price} {cur}/{unit} 的报价。我们与本月的其他报价做了比较，希望能再争取一个最优价格。\n\n我们的目标是 {qty} 数量下 {price} {cur}/{unit}（{incoterm} {pod}）。如果难以达到，也可以延长付款期限，或先以小批量试单、首批交货后再商议批量价格。\n\n请在 {deadline} 前告知能否满足目标价，以及达到该价格所需的最小数量，我们会立即研究。\n\n顺颂商祺\n\n{from}\n{fromCompany}'
    },
    order_confirm: {
      subject: '订单确认 — {product} / 采购单 {invoice}',
      body: '尊敬的{to}：\n\n现确认订单如下，并附上采购单 {invoice}。\n\n· 品名：{product}\n· 数量：{qty}\n· 单价：{price} {cur}/{unit}，{incoterm} {pod}\n· 金额：{amount} {cur}\n· 希望装运：{etd}\n· 包装与规格：{spec}\n\n请开具形式发票并确认生产计划，收到 PI 后我们将安排预付款。同时请确认 HS 编码及将寄送的单据（发票、装箱单、提单、原产地证明）。\n\n感谢配合。\n\n顺颂商祺\n\n{from}\n{fromCompany}'
    },
    shipping_chase: {
      subject: '装运进度确认 — {product} / {invoice}',
      body: '尊敬的{to}：\n\n订单 {invoice} 原定 {etd} 装运，但目前尚未收到装运单据和订舱确认。\n\n请告知当前进度：生产是否完成、确认的 ETD 以及船名航次。如因舱位或船期延误，请一并告知最早可出运日期及能否分批装运。\n\n我们客户的生产线计划于 {deadline} 开始，因此今天需要确认原定日期是否还能赶上。\n\n顺颂商祺\n\n{from}\n{fromCompany}'
    },
    claim: {
      subject: '质量索赔 — {product} / {invoice}',
      body: '尊敬的{to}：\n\n{invoice} 项下货物到货后我们进行了检验，发现以下问题。\n\n· 品名：{product}\n· 问题数量：{qty}\n· 问题说明：{spec}\n\n随附照片与检验记录。该批货物目前无法投入我们的生产，请提出处理方案：换货、调价或对问题数量开具贷记通知。\n\n请在 {deadline} 前回复。我们希望能友好解决并继续合作。\n\n顺颂商祺\n\n{from}\n{fromCompany}'
    },
    payment_reminder: {
      subject: '付款提醒 — 发票 {invoice}（{amount} {cur}）',
      body: '尊敬的{to}：\n\n发票 {invoice}（{amount} {cur}）的到期日为 {deadline}，目前我们尚未查到入账，特此提醒。\n\n请与财务确认并告知预计付款日期。如已汇出，请提供汇款凭证，以便我们对账。\n\n若单据或金额有任何问题，请告知，我们会一起核实处理。\n\n顺颂商祺\n\n{from}\n{fromCompany}'
    },
    thanks: {
      subject: '{product} 到货致谢 — {fromCompany}',
      body: '尊敬的{to}：\n\n货物顺利到达，品质也符合我们的规格。感谢贵司细致的包装与按期交货。\n\n下一批计划为 {qty}，希望装运日期为 {etd}。能否按同样条件报价？若价格稳定，我们希望转为每月定期采购。\n\n今后也请多多关照。\n\n顺颂商祺\n\n{from}\n{fromCompany}'
    }
  };

  /* ---------------------------------------------------------------
     日本語
  --------------------------------------------------------------- */
  M.ja = {
    inquiry: {
      subject: '{product} 供給のご相談 — {fromCompany}',
      body: '{to} 様\n\nいつもお世話になっております。韓国で再生プラスチック原料（PC・ABS・PP など）を輸入しております {fromCompany} の {from} と申します。\n\n{product} を月 {qty} 程度、継続的にご供給いただけないかご相談申し上げます。仕様書・梱包仕様と、{incoterm} {pod} 条件での最安値を併せてお知らせいただけますと幸いです。\n\n希望単価は {price} {cur}/{unit} です。まずは少量で試していただき、品質を確認したうえで数量を増やす形で進めたいと考えております。\n\nご多忙のところ恐縮ですが、{deadline} までにご返信いただけますと助かります。\n\n何卒よろしくお願い申し上げます。\n\n{from}\n{fromCompany}'
    },
    quote_request: {
      subject: '見積依頼 — {product}（{qty}）',
      body: '{to} 様\n\nお世話になっております。{fromCompany} の {from} です。購買計画を整理しており、下記につき正式なお見積りをお願い申し上げます。\n\n・品目：{product}\n・数量：{qty}\n・価格条件：{incoterm} {pod}\n・希望納期：{etd}\n・ご要望仕様：{spec}\n\n単価・最小ロット・生産リードタイム・梱包・HSコード・見積有効期限を併せてご教示ください。{price} {cur}/{unit} 程度で可能でしたら、1週間以内に発注を確定いたします。\n\nお見積りをお待ちしております。\n\n何卒よろしくお願い申し上げます。\n\n{from}\n{fromCompany}'
    },
    quote_offer: {
      subject: 'お見積書送付 — {product} / {fromCompany}',
      body: '{to} 様\n\nお問い合わせいただきありがとうございます。下記のとおりお見積りいたします。\n\n・品目：{product}\n・数量：{qty}\n・単価：{price} {cur}/{unit}、{incoterm} {pol}\n・船積み：{etd}\n・有効期限：{validity}\n・お支払い：T/T 30% 前払い、残額はB/Lコピーと引換え\n\n本価格は現行の原料相場と運賃を前提としており、{validity} までは据え置きます。仕様や梱包のご希望があればお知らせください。修正してお送りいたします。\n\nご発注をお待ちしております。\n\n何卒よろしくお願い申し上げます。\n\n{from}\n{fromCompany}'
    },
    negotiation: {
      subject: 'Re: {product} 単価のご再考のお願い',
      body: '{to} 様\n\n{price} {cur}/{unit} でお見積りをいただきありがとうございます。今月いただいた他のお見積りと比較いたしまして、恐れ入りますが最終単価をもう一度ご検討いただけますでしょうか。\n\n弊社の目標は {qty} にて {price} {cur}/{unit}（{incoterm} {pod}）です。難しい場合には、お支払い条件の延長や、まず小口で試していただき初回納品後に数量単価を再協議する方法でも結構です。\n\n{deadline} までに、目標単価の可否と、その単価が可能となる最小数量をお知らせいただけますと幸いです。すぐに検討いたします。\n\n何卒よろしくお願い申し上げます。\n\n{from}\n{fromCompany}'
    },
    order_confirm: {
      subject: '発注確定 — {product} / 注文書 {invoice}',
      body: '{to} 様\n\n下記のとおり発注を確定いたします。注文書 {invoice} を添付しております。\n\n・品目：{product}\n・数量：{qty}\n・単価：{price} {cur}/{unit}、{incoterm} {pod}\n・金額：{amount} {cur}\n・ご希望船積み：{etd}\n・梱包・仕様：{spec}\n\nProforma Invoice を発行いただき、生産日程をご確定ください。PI を受領次第、前払いを送金いたします。HSコードと、ご送付いただく書類（インボイス・パッキングリスト・B/L・原産地証明）もご確認をお願いいたします。\n\nご協力に感謝いたします。\n\n何卒よろしくお願い申し上げます。\n\n{from}\n{fromCompany}'
    },
    shipping_chase: {
      subject: '船積み状況のご確認 — {product} / {invoice}',
      body: '{to} 様\n\n注文 {invoice} は {etd} の船積み予定でしたが、いまだ船積書類とブッキングの確定をいただいておりません。\n\n現在の状況をお知らせください。生産完了の有無、確定ETD、本船・航海番号を確認させてください。スペースやスケジュールによる遅延であれば、最短の出港日と分割船積みの可否も併せてお願いいたします。\n\n取引先の生産ラインが {deadline} に稼働予定のため、本日中に当初の日程が守れるかを確認する必要がございます。\n\n何卒よろしくお願い申し上げます。\n\n{from}\n{fromCompany}'
    },
    claim: {
      subject: '品質クレーム — {product} / {invoice}',
      body: '{to} 様\n\n{invoice} の貨物を入荷し検品いたしましたところ、下記の問題が確認されました。\n\n・品目：{product}\n・問題数量：{qty}\n・内容：{spec}\n\n写真と検品記録を添付いたします。現状では弊社の生産に投入できかねますので、代替品のご提供・単価の調整・該当数量のクレジットノートのいずれが可能かご提案いただけますでしょうか。\n\n{deadline} までにご返信いただけますと幸いです。できれば円満に解決し、お取引を続けたいと考えております。\n\n何卒よろしくお願い申し上げます。\n\n{from}\n{fromCompany}'
    },
    payment_reminder: {
      subject: 'お支払いのご確認 — インボイス {invoice}（{amount} {cur}）',
      body: '{to} 様\n\nインボイス {invoice}（{amount} {cur}）のお支払期日が {deadline} でしたが、いまだ入金が確認できておりませんのでご連絡いたしました。\n\n経理ご担当にご確認のうえ、お振込み予定日をお知らせください。すでにご送金済みの場合は、送金確認書をお送りいただけますと帳簿と照合いたします。\n\n書類や金額にご不明な点があればお知らせください。一緒に確認して整理いたします。\n\n何卒よろしくお願い申し上げます。\n\n{from}\n{fromCompany}'
    },
    thanks: {
      subject: '{product} 納品のお礼 — {fromCompany}',
      body: '{to} 様\n\n貨物は問題なく到着し、品質も弊社の仕様に適合しておりました。丁寧な梱包と納期厳守に感謝申し上げます。\n\n次回は {qty} を予定しており、希望船積み日は {etd} です。同じ条件でお見積りいただけますでしょうか。価格が安定していれば、月次の定期取引に切り替えたいと考えております。\n\n今後ともよろしくお願い申し上げます。\n\n{from}\n{fromCompany}'
    }
  };

  /* 상황별 미리보기용 한 줄 설명 (선택 UI) */
  M.order = ['inquiry', 'quote_request', 'quote_offer', 'negotiation', 'order_confirm', 'shipping_chase', 'claim', 'payment_reminder', 'thanks'];

  window.IBG_MAIL = M;
})();
