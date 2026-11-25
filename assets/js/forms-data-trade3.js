/* =========================================================
   INSIGHT BRIEF — 무역서식 3종(PI·CI·PL) 카드
   서식 본체는 사업자 툴 ⑤ 무역서식(biz.html#trade)에 한 화면으로 있습니다.
   이 파일은 그 3종을 '무역·물류' 카테고리 목록 안에 같이 보이게 하는
   바로가기 카드만 정의합니다(별도 묶음 상자 없음).
   ========================================================= */
(function (root) {
  'use strict';
  var DOCS = root.IBF_DOCS;
  if (!DOCS) return;

  function add(d) { DOCS[d.id] = d; return d; }

  add({
    id: 'tdoc-pi', cat: 'trade', sub: 'tr-ship', no: '00-1', kind: 'link',
    name: '무역서식 · 견적송장 (PI)', en: 'PROFORMA INVOICE', tpl: 'doc',
    href: 'biz.html#trade-pi',
    keywords: '무역서식 견적송장 프로포마 인보이스 PI proforma invoice quotation 견적 수출'
  });

  add({
    id: 'tdoc-ci', cat: 'trade', sub: 'tr-ship', no: '00-2', kind: 'link',
    name: '무역서식 · 상업송장 (CI)', en: 'COMMERCIAL INVOICE', tpl: 'doc',
    href: 'biz.html#trade-ci',
    keywords: '무역서식 상업송장 인보이스 CI commercial invoice 수출 통관 금액'
  });

  add({
    id: 'tdoc-pl', cat: 'trade', sub: 'tr-ship', no: '00-3', kind: 'link',
    name: '무역서식 · 포장명세서 (PL)', en: 'PACKING LIST', tpl: 'doc',
    href: 'biz.html#trade-pl',
    keywords: '무역서식 포장명세서 패킹리스트 팩킹리스트 PL packing list 중량 카톤'
  });
})(typeof window !== 'undefined' ? window : this);
