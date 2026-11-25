/* =========================================================
   INSIGHT BRIEF — 서식 카테고리 (확장판)
   기존 8개 카테고리에 무역·물류, 인사말·카드를 더해 10개로 확장했습니다.
   forms-data.js 뒤에 로드되어 IBF_CATS 를 다시 정의합니다.
   ========================================================= */
(function (root) {
  'use strict';
  root.IBF_CATS = [
    {
      id: 'doc', no: '01', name: '문서서식', sub: '근로·거래·증명',
      subs: [
        { id: 'hr', name: '인사·노무' },
        { id: 'sales', name: '영업·구매' },
        { id: 'acct', name: '회계·경리' },
        { id: 'legal', name: '총무·법률' }
      ]
    },
    {
      id: 'trade', no: '02', name: '무역·물류', sub: 'B/L·선적지시',
      subs: [
        { id: 'tr-bl', name: '선하증권·S/I' },
        { id: 'tr-ship', name: '선적·서류 점검' }
      ]
    },
    {
      id: 'excel', no: '03', name: '엑셀·자동계산', sub: '합계·CSV',
      subs: [
        { id: 'ex-pay', name: '급여·인사' },
        { id: 'ex-sales', name: '매입·매출' },
        { id: 'ex-expense', name: '경비·지출' },
        { id: 'ex-life', name: '가계·생활' },
        { id: 'ex-import', name: '수출입·마진' },
        { id: 'ex-goal', name: '목표·일정' },
        { id: 'ex-quote', name: '견적·명세' }
      ]
    },
    {
      id: 'plan', no: '04', name: '사업계획·보고', sub: '창업·지원·실적',
      subs: [
        { id: 'pl-main', name: '사업계획서 기본' },
        { id: 'pl-start', name: '업종별 창업' },
        { id: 'pl-grant', name: '지원사업·공모' },
        { id: 'pl-report', name: '실적 보고서' },
        { id: 'pl-org', name: '조직·로드맵' }
      ]
    },
    {
      id: 'contract', no: '05', name: '계약·법률·회사', sub: '합의·동의·추천',
      subs: [
        { id: 'ct-partner', name: '동업·공동사업' },
        { id: 'ct-free', name: '외주·위탁' },
        { id: 'ct-supply', name: '물품·납품' },
        { id: 'ct-labor', name: '노무·취업규칙' },
        { id: 'ct-money', name: '금전·채권' },
        { id: 'ct-ad', name: '광고·협찬' },
        { id: 'ct-appeal', name: '진정·탄원' },
        { id: 'ct-confirm', name: '확인·동의·추천' },
        { id: 'ct-corp', name: '회사·의사록' },
        { id: 'ct-lease', name: '부동산·임대' }
      ]
    },
    {
      id: 'resume', no: '06', name: '이력·자소서', sub: '키워드·경력',
      subs: [
        { id: 'rs-main', name: '자기소개서' },
        { id: 'rs-cv', name: '이력서·키워드' },
        { id: 'rs-career', name: '경력·직무' }
      ]
    },
    {
      id: 'greeting', no: '07', name: '인사말·카드', sub: '경조·감사',
      subs: [
        { id: 'gr-event', name: '경조·행사 카드' },
        { id: 'gr-message', name: '문자·감사 인사' }
      ]
    },
    {
      id: 'en', no: '08', name: '영문서식', sub: '증명·인보이스',
      subs: [
        { id: 'en-cert', name: '증명·재직' },
        { id: 'en-poa', name: '위임·대리' },
        { id: 'en-letter', name: '비즈니스 레터' },
        { id: 'en-hire', name: '이력·채용' },
        { id: 'en-trade', name: '인보이스·예산' },
        { id: 'en-record', name: '등본·학적' }
      ]
    },
    {
      id: 'ppt', no: '09', name: 'PPT·보고서', sub: '16:9 · PDF',
      subs: [
        { id: 'pt-company', name: '회사·영업' },
        { id: 'pt-proposal', name: '제안·수주' },
        { id: 'pt-report', name: '보고·회의' },
        { id: 'pt-result', name: '실적·결산' }
      ]
    },
    {
      id: 'sign', no: '10', name: '온라인도장', sub: '도장·서명·요청',
      subs: [
        { id: 'sg-seal', name: '도장 제작' },
        { id: 'sg-sign', name: '서명·요청' }
      ]
    }
  ];
})(typeof window !== 'undefined' ? window : this);
