/* =========================================================
   INSIGHT BRIEF — 보험 계산기 3종 (insurance.html)
   01) 실손 유지 vs 4세대 vs 5세대 전환 손익
   02) 실손·자동차보험 청구 서류 체크리스트
   03) 자차 처리 vs 자비 처리
   · 계산은 모두 브라우저에서만. 입력값은 localStorage 에만 저장합니다.
   ========================================================= */
(function () {
  'use strict';

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------------- 언어 ---------------- */
  var LANG = (document.documentElement.getAttribute('lang') || 'ko').slice(0, 2).toLowerCase();
  if (['ko', 'en', 'zh', 'ja'].indexOf(LANG) < 0) LANG = 'ko';
  var LOCALE = { ko: 'ko-KR', en: 'en-US', zh: 'zh-CN', ja: 'ja-JP' }[LANG] || 'ko-KR';
  var CUR = { ko: '원', en: ' KRW', zh: '韩元', ja: 'ウォン' }[LANG];

  var T = {
    ko: {
      tagSwitch: '5세대 전환 유리', tagKeep: '지금 계약 유지 유리', tagEven: '차이 없음',
      mainSwitch: '5세대로 갈아타면 연 {amt} 아낍니다',
      mainKeep: '지금 계약을 유지하는 편이 연 {amt} 유리합니다',
      mainEven: '두 방법의 연간 차이가 {amt} 수준으로 거의 같습니다',
      subSwitch: '3년이면 {amt}. 비급여를 많이 쓰는 해에는 5세대 자기부담(50%)이 커집니다.',
      subKeep: '5세대는 보험료가 싸지만 비중증 비급여 자기부담 50%와 보장 제외 항목 때문에 이 의료비 패턴에서는 손해입니다.',
      subEven: '보험료 차이와 자기부담 차이가 거의 상쇄됩니다. 갱신 조건을 함께 보세요.',
      noteG4Ref: '참고로 4세대는 연 {amt} 수준으로 계산되지만, 지금은 신규 전환할 수 없습니다.',
      noteBreakG5: '비급여 의료비가 연 {amt}을 넘으면 지금 계약 유지가 유리해집니다.',
      noteBreakKeep: '비급여 의료비가 연 {amt}보다 적으면 5세대 전환이 유리해집니다.',
      noteNoBreak: '비급여 의료비를 1,000만원까지 넣어 봐도 순위가 바뀌지 않습니다.',
      tier1: '1등급 · 할인', tier2: '2등급 · 유지', tier3: '3등급 · 100% 할증', tier4: '4등급 · 200% 할증', tier5: '5등급 · 300% 할증',
      tierTitle1: '비급여 특약료 5% 할인', tierTitle2: '비급여 특약료 그대로',
      tierTitle3: '비급여 특약료 100% 할증', tierTitle4: '비급여 특약료 200% 할증', tierTitle5: '비급여 특약료 300% 할증',
      tierNoteNone: '지난 1년 비급여 보험금이 없어 할인 대상입니다.',
      tierNoteTo1: '비급여 보험금 {paid}. 100만원까지 {gap} 남았습니다.',
      tierNoteTo2: '비급여 보험금 {paid}. 150만원을 넘으면 200% 할증입니다({gap} 남음).',
      tierNoteTo3: '비급여 보험금 {paid}. 300만원을 넘으면 300% 할증입니다({gap} 남음).',
      tierNoteTop: '비급여 보험금 {paid}. 이미 최고 단계(300%)입니다.',
      surPlus: '＋{amt} 할증', surMinus: '−{amt} 할인', surNone: '0원',
      discSrc: '5세대 보험료 50% · 1~3년차',
      discRowOn: '−50% (1~3년차)',
      discSub: '3년 할인 기준입니다. 4년차부터는 연 {amt}으로 돌아갑니다.',
      discNote: '차액 ＝ 유지 − 5세대 전환(＋면 전환이 그만큼 적게 냅니다). 보험료와 의료비가 5년간 그대로라고 보고 계산했습니다.',
      discNotEligible: '지금 고른 세대는 전환 할인 대상이 아닙니다. 세대를 1·2세대로 바꾸면 켤 수 있습니다.',
      yearN: '{n}년차',
      carTagOwn: '자차 처리 유리', carTagCash: '자비 처리 유리', carTagEven: '차이 없음',
      carMainOwn: '자차로 처리하면 3년간 {amt} 아낍니다',
      carMainCash: '자비로 고치는 편이 {amt} 유리합니다',
      carMainEven: '두 방법의 3년 비용이 거의 같습니다',
      carSubOwn: '이번 자기부담금 {self}에 3년 추가 보험료 {extra}을 더해도 수리비보다 적습니다.',
      carSubCash: '자차 처리 총비용 {own}이 수리비 {repair}보다 큽니다.',
      carSubEven: '자기부담금과 추가 보험료를 더하면 수리비와 비슷합니다. 할증 폭을 보험사에 확인하세요.',
      carJudgeOver: '할증 — 지급액이 기준금액 {th}을 넘었습니다(사고점수 1점).',
      carJudgeTwice: '할증 가능 — 기준금액 이하지만 3년 안 두 번째 물적사고입니다(사고점수 0.5점).',
      carJudgeKeep: '등급 유지 — 기준금액 이하 1건입니다(사고점수 0.5점). 사고건수 요율로 보험료가 오를 수 있습니다.',
      carNoteBreak: '수리비가 약 {amt} 이하이면 자비 처리가 유리해집니다.',
      carNoteMax: '자기부담금이 최대 한도 {max}에 닿는 손해액은 {amt}입니다.',
      carNoteNoMax: '수리비가 커도 자기부담금은 최대 {max}까지만 냅니다(전부손해는 예외).',
      clCount: '{done} / {total}', clSum: '{sit} 기준입니다. 필수 {req}건, 조건부 {cond}건, 권장 {rec}건.',
      copied: '복사했습니다', copyFail: '복사가 막혔습니다. 직접 선택해 복사하세요.',
      req: '필수', cond: '조건부', rec: '권장', claimDocs: '청구 서류'
    },
    en: {
      tagSwitch: 'Switching to 5th gen wins', tagKeep: 'Keeping your plan wins', tagEven: 'Too close to call',
      mainSwitch: 'Switching to the 5th generation saves {amt} a year',
      mainKeep: 'Keeping your current plan is {amt} cheaper a year',
      mainEven: 'The difference is only {amt} a year',
      subSwitch: 'That is {amt} over three years. In a year with heavy non-covered care, the 5th generation costs more.',
      subKeep: 'The 5th generation has cheaper premiums, but a 50% deductible on mild non-covered care and excluded items make it costlier with this pattern of care.',
      subEven: 'Premium savings and extra out-of-pocket costs roughly cancel out. Check renewal terms.',
      noteG4Ref: 'For reference the 4th generation works out to {amt} a year, but it can no longer be bought.',
      noteBreakG5: 'Above {amt} of non-covered care a year, keeping your current plan becomes cheaper.',
      noteBreakKeep: 'Below {amt} of non-covered care a year, switching to the 5th generation becomes cheaper.',
      noteNoBreak: 'Even at 10 million won of non-covered care a year the ranking does not change.',
      tier1: 'Tier 1 · discount', tier2: 'Tier 2 · no change', tier3: 'Tier 3 · +100%', tier4: 'Tier 4 · +200%', tier5: 'Tier 5 · +300%',
      tierTitle1: 'Non-covered premium −5%', tierTitle2: 'Non-covered premium unchanged',
      tierTitle3: 'Non-covered premium +100%', tierTitle4: 'Non-covered premium +200%', tierTitle5: 'Non-covered premium +300%',
      tierNoteNone: 'No non-covered claim in the past year, so the discount applies.',
      tierNoteTo1: 'Non-covered claims {paid}. {gap} left until 1 million won.',
      tierNoteTo2: 'Non-covered claims {paid}. Above 1.5 million won the surcharge is 200% ({gap} left).',
      tierNoteTo3: 'Non-covered claims {paid}. Above 3 million won the surcharge is 300% ({gap} left).',
      tierNoteTop: 'Non-covered claims {paid}. Already at the top tier (300%).',
      surPlus: '+{amt}', surMinus: '−{amt}', surNone: '0',
      discSrc: '50% off the 5th-gen premium · years 1–3',
      discRowOn: '−50% (years 1–3)',
      discSub: 'This is the three-year discount view. From year 4 it returns to {amt} a year.',
      discNote: 'Difference = keeping − switching (a plus means switching costs that much less). Assumes premiums and medical spending stay flat for five years.',
      discNotEligible: 'The generation you picked does not qualify for the switch discount. Choose generation 1 or 2 to turn it on.',
      yearN: 'Year {n}',
      carTagOwn: 'Insurance claim wins', carTagCash: 'Paying yourself wins', carTagEven: 'Too close to call',
      carMainOwn: 'Claiming saves {amt} over three years',
      carMainCash: 'Paying for the repair yourself is {amt} cheaper',
      carMainEven: 'The three-year costs are almost the same',
      carSubOwn: 'Even with a {self} deductible and {extra} of extra premiums, it is less than the repair bill.',
      carSubCash: 'The claim route costs {own}, more than the {repair} repair bill.',
      carSubEven: 'Deductible plus extra premiums comes close to the repair bill. Ask your insurer about the surcharge.',
      carJudgeOver: 'Surcharge — the payout exceeded the {th} threshold (1 demerit point).',
      carJudgeTwice: 'Possible surcharge — below the threshold, but this is the second property claim in three years (0.5 point).',
      carJudgeKeep: 'Grade unchanged — first claim below the threshold (0.5 point). Premiums can still rise with the claim-count rate.',
      carNoteBreak: 'If the repair bill is about {amt} or less, paying yourself is cheaper.',
      carNoteMax: 'The deductible reaches its cap of {max} at a repair cost of {amt}.',
      carNoteNoMax: 'However large the bill, the deductible stops at {max} (total loss excepted).',
      clCount: '{done} / {total}', clSum: 'For {sit}: {req} required, {cond} conditional, {rec} recommended.',
      copied: 'Copied', copyFail: 'Copy was blocked. Select the text and copy manually.',
      req: 'Required', cond: 'Conditional', rec: 'Suggested', claimDocs: 'documents'
    },
    zh: {
      tagSwitch: '转第五代更划算', tagKeep: '维持现有保单更划算', tagEven: '差别不大',
      mainSwitch: '转投第五代每年可省 {amt}',
      mainKeep: '维持现有保单每年便宜 {amt}',
      mainEven: '两者每年只差 {amt}',
      subSwitch: '三年合计 {amt}。非医保项目用得多的年份，第五代自付（50%）会更高。',
      subKeep: '第五代保费更低，但非重症非医保自付 50% 且部分项目不保，按这种就医结构反而更贵。',
      subEven: '保费差额与自付差额大致抵消。请一并确认续保条件。',
      noteG4Ref: '参考：第四代每年为 {amt}，但现已停止新投保。',
      noteBreakG5: '非医保医疗费每年超过 {amt} 时，维持现有保单更划算。',
      noteBreakKeep: '非医保医疗费每年低于 {amt} 时，转第五代更划算。',
      noteNoBreak: '即使非医保医疗费达到 1,000 万韩元，排序也不会改变。',
      tier1: '第1档 · 折扣', tier2: '第2档 · 维持', tier3: '第3档 · 加收100%', tier4: '第4档 · 加收200%', tier5: '第5档 · 加收300%',
      tierTitle1: '非医保特约保费 −5%', tierTitle2: '非医保特约保费不变',
      tierTitle3: '非医保特约保费加收 100%', tierTitle4: '非医保特约保费加收 200%', tierTitle5: '非医保特约保费加收 300%',
      tierNoteNone: '过去一年未领取非医保保险金，适用折扣。',
      tierNoteTo1: '非医保保险金 {paid}。距 100 万韩元还有 {gap}。',
      tierNoteTo2: '非医保保险金 {paid}。超过 150 万韩元将加收 200%（还剩 {gap}）。',
      tierNoteTo3: '非医保保险金 {paid}。超过 300 万韩元将加收 300%（还剩 {gap}）。',
      tierNoteTop: '非医保保险金 {paid}。已是最高档（300%）。',
      surPlus: '＋{amt}', surMinus: '−{amt}', surNone: '0韩元',
      discSrc: '第五代保费 50% · 第1~3年',
      discRowOn: '−50%（第1~3年）',
      discSub: '按三年折扣计算。第4年起恢复为每年 {amt}。',
      discNote: '差额 ＝ 维持 − 转第五代（正数表示转投少付相应金额）。假设五年内保费与医疗费不变。',
      discNotEligible: '所选世代不符合转换折扣条件。改为第1、2代后即可开启。',
      yearN: '第{n}年',
      carTagOwn: '走车损险更划算', carTagCash: '自费修理更划算', carTagEven: '差别不大',
      carMainOwn: '走车损险三年可省 {amt}',
      carMainCash: '自费修理便宜 {amt}',
      carMainEven: '两种方式三年费用几乎相同',
      carSubOwn: '即使加上本次自付 {self} 与三年追加保费 {extra}，仍低于修理费。',
      carSubCash: '走保险合计 {own}，高于修理费 {repair}。',
      carSubEven: '自付加追加保费与修理费接近，请向保险公司确认加收幅度。',
      carJudgeOver: '加收 — 赔付超过基准金额 {th}（事故点数 1）。',
      carJudgeTwice: '可能加收 — 未超基准，但三年内第二次物损事故（0.5 点）。',
      carJudgeKeep: '等级维持 — 未超基准的第一次（0.5 点）。事故次数费率仍可能使保费上升。',
      carNoteBreak: '修理费约在 {amt} 以下时，自费修理更划算。',
      carNoteMax: '自付额达到上限 {max} 的损失金额为 {amt}。',
      carNoteNoMax: '修理费再高，自付额最多 {max}（全损除外）。',
      clCount: '{done} / {total}', clSum: '按{sit}：必需 {req} 项、条件性 {cond} 项、建议 {rec} 项。',
      copied: '已复制', copyFail: '无法复制，请手动选择文本复制。',
      req: '必需', cond: '条件性', rec: '建议', claimDocs: '申请材料'
    },
    ja: {
      tagSwitch: '第5世代へ切替が有利', tagKeep: '今の契約を維持が有利', tagEven: 'ほぼ同じ',
      mainSwitch: '第5世代に切り替えると年 {amt} 得になります',
      mainKeep: '今の契約を維持する方が年 {amt} 有利です',
      mainEven: '年間の差は {amt} でほぼ同じです',
      subSwitch: '3年で {amt}。非保険診療が多い年は第5世代の自己負担（50%）が膨らみます。',
      subKeep: '第5世代は保険料が安いものの、非重症の非保険50%自己負担と対象外項目のため、この受診パターンでは不利です。',
      subEven: '保険料の差と自己負担の差がほぼ相殺されます。更新条件も確認してください。',
      noteG4Ref: '参考：第4世代は年 {amt} ですが、現在は新規加入できません。',
      noteBreakG5: '非保険診療費が年 {amt} を超えると、今の契約の維持が有利になります。',
      noteBreakKeep: '非保険診療費が年 {amt} 未満なら、第5世代への切替が有利になります。',
      noteNoBreak: '非保険診療費を1,000万ウォンまで入れても順位は変わりません。',
      tier1: '1等級 · 割引', tier2: '2等級 · 据置', tier3: '3等級 · 100%増', tier4: '4等級 · 200%増', tier5: '5等級 · 300%増',
      tierTitle1: '非保険特約料 5%割引', tierTitle2: '非保険特約料 据置',
      tierTitle3: '非保険特約料 100%増', tierTitle4: '非保険特約料 200%増', tierTitle5: '非保険特約料 300%増',
      tierNoteNone: '過去1年に非保険保険金がなく割引対象です。',
      tierNoteTo1: '非保険保険金 {paid}。100万ウォンまで {gap} です。',
      tierNoteTo2: '非保険保険金 {paid}。150万ウォンを超えると200%増（残り {gap}）。',
      tierNoteTo3: '非保険保険金 {paid}。300万ウォンを超えると300%増（残り {gap}）。',
      tierNoteTop: '非保険保険金 {paid}。すでに最高段階（300%）です。',
      surPlus: '＋{amt}', surMinus: '−{amt}', surNone: '0ウォン',
      discSrc: '第5世代保険料 50% · 1〜3年目',
      discRowOn: '−50%（1〜3年目）',
      discSub: '3年間の割引ベースです。4年目からは年 {amt} に戻ります。',
      discNote: '差額 ＝ 維持 − 第5世代へ切替（＋は切替の方がその分少ない）。保険料と医療費が5年間変わらない前提です。',
      discNotEligible: '選択した世代は切替割引の対象外です。第1・2世代に変えるとオンにできます。',
      yearN: '{n}年目',
      carTagOwn: '車両保険が有利', carTagCash: '自費修理が有利', carTagEven: 'ほぼ同じ',
      carMainOwn: '車両保険を使うと3年で {amt} 得になります',
      carMainCash: '自費で直す方が {amt} 有利です',
      carMainEven: '3年の費用はほぼ同じです',
      carSubOwn: '今回の自己負担 {self} と3年の追加保険料 {extra} を足しても修理費より少ないです。',
      carSubCash: '車両保険の総費用 {own} が修理費 {repair} を上回ります。',
      carSubEven: '自己負担と追加保険料を足すと修理費と同程度です。増額幅を保険会社に確認してください。',
      carJudgeOver: '増額 — 支払額が基準額 {th} を超えました（事故点1）。',
      carJudgeTwice: '増額の可能性 — 基準以下ですが3年内2件目の物損事故です（0.5点）。',
      carJudgeKeep: '等級据置 — 基準以下の1件目です（0.5点）。事故件数料率で保険料が上がる場合があります。',
      carNoteBreak: '修理費が約 {amt} 以下なら自費修理が有利です。',
      carNoteMax: '自己負担が上限 {max} に達する損害額は {amt} です。',
      carNoteNoMax: '修理費が大きくても自己負担は最大 {max} までです（全損を除く）。',
      clCount: '{done} / {total}', clSum: '{sit}の場合：必須 {req}件、条件付き {cond}件、推奨 {rec}件。',
      copied: 'コピーしました', copyFail: 'コピーできませんでした。選択してコピーしてください。',
      req: '必須', cond: '条件付き', rec: '推奨', claimDocs: '請求書類'
    }
  };

  function t(key, vars) {
    var s = (T[LANG] && T[LANG][key]) || T.ko[key] || key;
    if (vars) {
      for (var k in vars) {
        if (Object.prototype.hasOwnProperty.call(vars, k)) {
          s = s.split('{' + k + '}').join(vars[k]);
        }
      }
    }
    return s;
  }

  /* 청구 서류·문장처럼 JS 가 그리는 긴 한국어 문자열은
     assets/js/insurance-i18n.js 의 번역표(window.IB_INS_T)가 있으면 그것을 씁니다. */
  function L(ko) {
    var m = window.IB_INS_T && window.IB_INS_T[LANG];
    var v = m && m[ko];
    return v || ko;
  }

  function nf(n) {
    if (!isFinite(n)) n = 0;
    return Math.round(n).toLocaleString(LOCALE);
  }
  function won(n) { return nf(n) + CUR; }
  function num(id, allowZero) {
    var el = document.getElementById(id);
    if (!el) return 0;
    var v = parseFloat(String(el.value).replace(/[^0-9.\-]/g, ''));
    if (!isFinite(v)) return 0;
    if (v < 0) return 0;
    return v;
  }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  /* ---------------- 저장 ---------------- */
  var STORE = 'ib_insurance_v1';
  var store = { sil: {}, claim: {}, car: {} };
  try {
    var raw = window.localStorage.getItem(STORE);
    if (raw) store = Object.assign(store, JSON.parse(raw));
  } catch (e) { /* 저장소를 쓸 수 없으면 그냥 계산만 */ }
  var saveTimer = null;
  function save() {
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(function () {
      try { window.localStorage.setItem(STORE, JSON.stringify(store)); } catch (e) {}
    }, 350);
  }

  /* ---------------- 탭 ---------------- */
  var TABS = ['silson', 'claim', 'car'];
  function showTab(key, updateHash) {
    if (TABS.indexOf(key) < 0) key = 'silson';
    $$('.in-tab').forEach(function (b) {
      var on = b.getAttribute('data-tab') === key;
      b.classList.toggle('is-on', on);
      b.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    TABS.forEach(function (k) {
      var el = document.getElementById('tab-' + k);
      if (el) el.hidden = k !== key;
    });
    if (updateHash && window.history && history.replaceState) {
      history.replaceState(null, '', '#' + key);
    }
  }
  $$('.in-tab').forEach(function (b) {
    b.addEventListener('click', function () {
      showTab(b.getAttribute('data-tab'), true);
    });
  });
  /* #silson / #claim / #car 로 들어오거나 주소만 바뀌어도 탭이 따라갑니다. */
  window.addEventListener('hashchange', function () {
    var h = (window.location.hash || '').replace('#', '');
    if (TABS.indexOf(h) >= 0) showTab(h, false);
  });
  $$('.in-tab').forEach(function (b) {
    b.addEventListener('keydown', function (e) {
      var i = TABS.indexOf(b.getAttribute('data-tab'));
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault();
        var next = TABS[(i + (e.key === 'ArrowRight' ? 1 : TABS.length - 1)) % TABS.length];
        showTab(next, true);
        var nb = $('.in-tab[data-tab="' + next + '"]');
        if (nb) nb.focus();
      }
    });
  });
  (function initTab() {
    var h = (window.location.hash || '').replace('#', '');
    if (TABS.indexOf(h) >= 0) showTab(h, false);
    else showTab('silson', false);
  })();

  /* =========================================================
     01 실손 전환 손익
     ========================================================= */
  var GEN = {
    '1': { g: 0, n: 0 },
    '2': { g: 20, n: 20 },
    '3': { g: 20, n: 20 },
    '4': { g: 20, n: 30 }
  };

  function setVal(id, v) { var el = document.getElementById(id); if (el) el.value = v; }

  function readSil() {
    return {
      gen: ($('#sil-gen') && $('#sil-gen').value) || '3',
      premCur: num('sil-prem-cur'),
      rateG: num('sil-rate-g') / 100,
      rateN: num('sil-rate-n') / 100,
      premG4: num('sil-prem-g4'),
      premG4nb: num('sil-prem-g4nb'),
      premG5: num('sil-prem-g5'),
      premG5nb: num('sil-prem-g5nb'),
      rateG5: num('sil-rate-g5') / 100,
      medG: num('sil-med-g'),
      medN: num('sil-med-n'),
      medSevere: num('sil-med-severe'),
      medExcl: num('sil-med-excl'),
      paidNb: ($('#sil-paid-nb') && String($('#sil-paid-nb').value).trim() !== '') ? num('sil-paid-nb') : null,
      discount: !!($('#sil-discount') && $('#sil-discount').checked)
    };
  }

  /* 계약전환 할인은 2013년 3월 이전 가입 1·2세대(재가입 조건 없음)가 대상입니다 */
  function canDiscount(gen) { return gen === '1' || gen === '2'; }

  function syncDiscount(gen) {
    var cb = document.getElementById('sil-discount');
    if (!cb) return;
    var ok = canDiscount(gen);
    if (!ok && cb.checked) cb.checked = false;
    cb.disabled = !ok;
    var wrap = cb.closest ? cb.closest('.in-switch') : null;
    if (wrap) wrap.classList.toggle('is-disabled', !ok);
    var msg = document.getElementById('sil-discount-msg');
    if (msg) {
      msg.hidden = ok;
      msg.textContent = ok ? '' : t('discNotEligible');
    }
  }

  function tierOf(paid) {
    if (paid <= 0) return { step: 1, rate: -0.05, kind: 'down' };
    if (paid < 1000000) return { step: 2, rate: 0, kind: 'flat' };
    if (paid < 1500000) return { step: 3, rate: 1, kind: 'up' };
    if (paid < 3000000) return { step: 4, rate: 2, kind: 'up' };
    return { step: 5, rate: 3, kind: 'up' };
  }

  function tierNote(paid) {
    var paidTxt = won(paid);
    if (paid <= 0) return t('tierNoteNone');
    if (paid < 1000000) return t('tierNoteTo1', { paid: paidTxt, gap: won(1000000 - paid) });
    if (paid < 1500000) return t('tierNoteTo2', { paid: paidTxt, gap: won(1500000 - paid) });
    if (paid < 3000000) return t('tierNoteTo3', { paid: paidTxt, gap: won(3000000 - paid) });
    return t('tierNoteTop', { paid: paidTxt });
  }

  /* 한 계획의 연간 비용 */
  function makePlan(premTotal, premNb, adjRate, selfG, selfN) {
    premNb = clamp(premNb, 0, premTotal);
    var baseMonthly = premTotal;
    var monthly = (premTotal - premNb) + premNb * (1 + adjRate);
    return {
      baseAnnual: baseMonthly * 12,
      adjAnnual: (monthly - baseMonthly) * 12,
      premMonthly: monthly,
      premAnnual: monthly * 12,
      selfG: selfG,
      selfN: selfN,
      total: monthly * 12 + selfG + selfN
    };
  }

  function silTotals(d) {
    /* 유지 */
    var keepBase = makePlan(d.premCur, d.gen === '4' ? d.premG4nb : 0, 0, d.medG * d.rateG, d.medN * d.rateN);
    var keepTier = null;
    if (d.gen === '4') {
      var paidKeep = d.paidNb !== null ? d.paidNb : d.medN * 0.7;
      keepTier = tierOf(paidKeep);
      keepBase = makePlan(d.premCur, d.premG4nb, keepTier.rate, d.medG * d.rateG, d.medN * d.rateN);
      keepBase.paid = paidKeep;
    }

    /* 4세대 */
    var paid4 = d.paidNb !== null ? d.paidNb : d.medN * 0.7;
    var tier4 = tierOf(paid4);
    var p4 = makePlan(d.premG4, d.premG4nb, tier4.rate, d.medG * 0.2, d.medN * 0.3);
    p4.tier = tier4; p4.paid = paid4;

    /* 5세대 */
    var severe = clamp(d.medSevere, 0, d.medN);
    var excl = clamp(d.medExcl, 0, d.medN - severe);
    var mild = Math.max(0, d.medN - severe - excl);
    var paidMild = Math.min(mild * 0.5, 10000000);
    var tier5 = tierOf(paidMild);
    var selfN5 = severe * 0.3 + mild * 0.5 + excl * 1;
    var p5 = makePlan(d.premG5, d.premG5nb, tier5.rate, d.medG * d.rateG5, selfN5);
    p5.tier = tier5; p5.paid = paidMild;
    p5.mild = mild; p5.excl = excl; p5.severe = severe;
    var p5Full = p5;
    if (d.discount) p5 = applyDiscount(p5);

    return { keep: keepBase, keepTier: keepTier, g4: p4, g5: p5, g5Full: p5Full };
  }

  /* 계약전환 할인 — 1~3년차는 5세대 보험료(할인·할증 반영)의 50%를 깎습니다.
     자기부담금과 급여 주계약이 아닌 부분에도 같은 비율을 적용합니다(보험사 약관에 따라 달라질 수 있음). */
  function applyDiscount(p) {
    var out = Object.assign({}, p);
    out.baseAnnual = p.baseAnnual * 0.5;
    out.adjAnnual = p.adjAnnual * 0.5;
    out.premMonthly = p.premMonthly * 0.5;
    out.premAnnual = p.premAnnual * 0.5;
    out.discAnnual = p.premAnnual * 0.5;
    out.total = out.premAnnual + p.selfG + p.selfN;
    return out;
  }

  /* 급여·비급여 보험금(지급액) 단순 추정 */
  function paidAmount(d, selfG, selfN) {
    return Math.max(0, (d.medG + d.medN) - selfG - selfN);
  }

  function renderSil() {
    var genEl = document.getElementById('sil-gen');
    syncDiscount(genEl ? genEl.value : '3');
    var d = readSil();
    var isCurrent4 = d.gen === '4';
    if (isCurrent4) {
      var g4el = document.getElementById('sil-prem-g4');
      if (g4el) { g4el.value = document.getElementById('sil-prem-cur').value; d.premG4 = d.premCur; }
    }
    var r = silTotals(d);

    /* KPI */
    setText('sil-kpi-keep', won(r.keep.total));
    setText('sil-kpi-g4', won(r.g4.total));
    setText('sil-kpi-g5', won(r.g5.total));
    setText('sil-kpi-keep-d', won(r.keep.premAnnual) + ' + ' + won(r.keep.selfG + r.keep.selfN));
    setText('sil-kpi-g4-d', won(r.g4.premAnnual) + ' + ' + won(r.g4.selfG + r.g4.selfN));
    setText('sil-kpi-g5-d', won(r.g5.premAnnual) + ' + ' + won(r.g5.selfG + r.g5.selfN));

    setText('sil-kpi-g4-badge', isCurrent4 ? '내 계약' : '참고');
    setText('sil-g4-tag', isCurrent4 ? '내 계약과 동일' : '참고 비교');

    var discBadge = document.getElementById('sil-kpi-g5-badge');
    if (discBadge) discBadge.hidden = !d.discount;

    /* 표 */
    var rows = [
      ['prem', r.keep.premMonthly, r.g4.premMonthly, r.g5.premMonthly, 'won'],
      ['premy', r.keep.premAnnual, r.g4.premAnnual, r.g5.premAnnual, 'won'],
      ['g', r.keep.selfG, r.g4.selfG, r.g5.selfG, 'won'],
      ['n', r.keep.selfN, r.g4.selfN, r.g5.selfN, 'won'],
      ['sum', r.keep.total, r.g4.total, r.g5.total, 'won']
    ];
    rows.forEach(function (row) {
      setText('sil-t-keep-' + row[0], won(row[1]));
      setText('sil-t-g4-' + row[0], won(row[2]));
      setText('sil-t-g5-' + row[0], won(row[3]));
    });
    setText('sil-t-keep-sur', r.keepTier ? surText(r.keep.adjAnnual) : '—');
    setText('sil-t-g4-sur', surText(r.g4.adjAnnual));
    setText('sil-t-g5-sur', surText(r.g5.adjAnnual));
    setText('sil-t-keep-disc', '—');
    setText('sil-t-g4-disc', '—');
    setText('sil-t-g5-disc', d.discount ? t('discRowOn') : '—');

    setText('sil-t-keep-paid', won(paidAmount(d, r.keep.selfG, r.keep.selfN)));
    setText('sil-t-g4-paid', won(paidAmount(d, r.g4.selfG, r.g4.selfN)));
    setText('sil-t-g5-paid', won(paidAmount(d, r.g5.selfG, r.g5.selfN)));

    /* 막대 */
    var max = Math.max(r.keep.total, r.g4.total, r.g5.total, 1);
    bar('keep', r.keep, max);
    bar('g4', r.g4, max);
    bar('g5', r.g5, max);
    setText('sil-bar-keep-label', isCurrent4 ? '유지(4세대)' : '유지');

    /* 등급 */
    tierBox('g4', r.g4.tier, r.g4.paid);
    tierBox('g5', r.g5.tier, r.g5.paid);

    /* 판정 */
    var diff = r.keep.total - r.g5.total;
    var base = Math.max(r.keep.total, 1);
    var even = Math.abs(diff) <= Math.max(10000, base * 0.01);
    var v = $('#sil-verdict');
    v.classList.remove('is-good', 'is-even');
    if (even) {
      v.classList.add('is-even');
      setText('sil-verdict-tag', t('tagEven'));
      setText('sil-verdict-main', t('mainEven', { amt: won(Math.abs(diff)) }));
      setText('sil-verdict-sub', t('subEven'));
    } else if (diff > 0) {
      v.classList.add('is-good');
      setText('sil-verdict-tag', t('tagSwitch'));
      setText('sil-verdict-main', t('mainSwitch', { amt: won(diff) }));
      setText('sil-verdict-sub', t('subSwitch', { amt: won(diff * 3) }));
    } else {
      setText('sil-verdict-tag', t('tagKeep'));
      setText('sil-verdict-main', t('mainKeep', { amt: won(-diff) }));
      setText('sil-verdict-sub', t('subKeep'));
    }

    /* 전환 할인을 켰을 때만: 4년차부터 전액으로 돌아가는 것을 알려 줍니다 */
    if (d.discount) {
      var subEl = $('#sil-verdict-sub');
      var sep = (LANG === 'zh' || LANG === 'ja') ? '' : ' ';
      if (subEl) subEl.textContent = (subEl.textContent ? subEl.textContent + sep : '') + t('discSub', { amt: won(r.g5Full.total) });
    }

    /* 해석 한 줄 */
    var note = '';
    if (!isCurrent4) note += t('noteG4Ref', { amt: won(r.g4.total) }) + ' ';
    var be = breakEvenN(d);
    if (be !== null) {
      note += (diff > 0 ? t('noteBreakG5', { amt: won(be) }) : t('noteBreakKeep', { amt: won(be) }));
    } else {
      note += t('noteNoBreak');
    }
    setText('sil-note', note);

    renderDiscBox(d, r);

    store.sil = d;
    save();
  }

  function surText(adjAnnual) {
    if (Math.abs(adjAnnual) < 1) return t('surNone');
    return adjAnnual > 0 ? t('surPlus', { amt: won(adjAnnual) }) : t('surMinus', { amt: won(-adjAnnual) });
  }

  function bar(key, p, max) {
    var base = p.baseAnnual + Math.min(0, p.adjAnnual);
    var sur = Math.max(0, p.adjAnnual);
    var total = p.total || 1;
    setText('sil-bar-' + key + '-total', won(p.total));
    setText('sil-bar-' + key + '-prem-v', won(base));
    setText('sil-bar-' + key + '-self-v', won(p.selfG + p.selfN));
    var elPrem = document.getElementById('sil-bar-' + key + '-prem');
    var elSelf = document.getElementById('sil-bar-' + key + '-self');
    var elSur = document.getElementById('sil-bar-' + key + '-sur');
    if (elPrem) elPrem.style.width = (base / max * 100).toFixed(2) + '%';
    if (elSelf) elSelf.style.width = ((p.selfG + p.selfN) / max * 100).toFixed(2) + '%';
    if (elSur) {
      setText('sil-bar-' + key + '-sur-v', sur > 0 ? won(sur) : t('surNone'));
      elSur.style.width = (sur / max * 100).toFixed(2) + '%';
    }
  }

  function tierBox(key, tier, paid) {
    var box = document.getElementById('sil-tier-' + key);
    if (!box) return;
    box.classList.remove('is-up', 'is-down');
    if (tier.kind === 'up') box.classList.add('is-up');
    if (tier.kind === 'down') box.classList.add('is-down');
    setText('sil-tier-' + key + '-badge', t('tier' + tier.step));
    setText('sil-tier-' + key + '-title', t('tierTitle' + tier.step));
    setText('sil-tier-' + key + '-note', tierNote(paid));
  }

  /* 비급여 의료비를 바꿔 가며 유지/5세대 순위가 뒤집히는 지점 찾기 */
  function breakEvenN(d) {
    var hi = 10000000, step = 10000;
    var at0 = compareAt(d, 0);
    if (at0 === 0) return 0;
    var prev = at0, found = null;
    for (var n = step; n <= hi; n += step) {
      var c = compareAt(d, n);
      if (c !== prev && c !== 0) { found = n; break; }
      prev = c;
    }
    return found;
  }
  function compareAt(d, medN) {
    var dd = Object.assign({}, d, { medN: medN, medSevere: Math.min(d.medSevere, medN), medExcl: Math.min(d.medExcl, Math.max(0, medN - Math.min(d.medSevere, medN))) });
    var r = silTotals(dd);
    var diff = r.keep.total - r.g5.total;
    if (Math.abs(diff) < 1000) return 0;
    return diff > 0 ? 1 : -1;
  }

  function renderDiscBox(d, r) {
    var box = document.getElementById('sil-disc-box');
    if (!box) return;
    box.hidden = !d.discount;
    if (!d.discount) return;

    var keepA = r.keep.total;
    var g5A = r.g5.total;
    var g5B = r.g5Full.total;
    var k3 = keepA * 3, s3 = g5A * 3;
    var k5 = keepA * 5, s5 = g5A * 3 + g5B * 2;

    setText('sil-disc-src', t('discSrc'));
    setText('sil-disc-keep13', won(keepA));
    setText('sil-disc-g513', won(g5A));
    setText('sil-disc-diff13', signedWon(keepA - g5A));
    setText('sil-disc-keep45', won(keepA));
    setText('sil-disc-g545', won(g5B));
    setText('sil-disc-diff45', signedWon(keepA - g5B));
    setText('sil-disc-keep3', won(k3));
    setText('sil-disc-g53', won(s3));
    setText('sil-disc-diff3', signedWon(k3 - s3));
    setText('sil-disc-keep5', won(k5));
    setText('sil-disc-g55', won(s5));
    setText('sil-disc-diff5', signedWon(k5 - s5));
    setText('sil-disc-note', t('discNote'));

    /* 5년 막대 — 1~3년차는 절반, 4년차부터 전액 */
    var strip = document.getElementById('sil-years');
    if (!strip) return;
    var full = Math.max(r.g5Full.premMonthly, 1);
    var html = '';
    for (var y = 1; y <= 5; y += 1) {
      var discounted = y <= 3;
      var prem = discounted ? r.g5.premMonthly : r.g5Full.premMonthly;
      var h = Math.max(4, Math.round(prem / full * 100));
      html += '<div class="in-year' + (discounted ? '' : ' is-full') + '">' +
        '<span class="v">' + esc(won(prem)) + '</span>' +
        '<div class="t"><i style="height:' + h + '%"></i></div>' +
        '<span class="y">' + esc(t('yearN', { n: y })) + '</span></div>';
    }
    strip.innerHTML = html;
  }

  function signedWon(v) {
    if (Math.abs(v) < 1) return won(0);
    return (v > 0 ? '＋' : '−') + won(Math.abs(v));
  }

  function setText(id, txt) {
    var el = document.getElementById(id);
    if (el) el.textContent = txt;
  }

  /* 세대 바꾸면 자기부담률 프리셋 */
  var genSel = $('#sil-gen');
  if (genSel) {
    genSel.addEventListener('change', function () {
      var p = GEN[genSel.value] || GEN['3'];
      setVal('sil-rate-g', p.g);
      setVal('sil-rate-n', p.n);
      var is4 = this.value === '4';
      var g4 = document.getElementById('sil-prem-g4');
      if (g4) {
        g4.disabled = is4;
        if (is4) g4.value = document.getElementById('sil-prem-cur').value;
      }
      renderSil();
    });
  }

  ['sil-prem-cur', 'sil-rate-g', 'sil-rate-n', 'sil-prem-g4', 'sil-prem-g4nb', 'sil-prem-g5', 'sil-prem-g5nb',
    'sil-rate-g5', 'sil-med-g', 'sil-med-n', 'sil-med-severe', 'sil-med-excl', 'sil-paid-nb'].forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('input', renderSil);
      el.addEventListener('change', renderSil);
    });

  var discCb = $('#sil-discount');
  if (discCb) {
    discCb.addEventListener('change', function () { renderSil(); });
  }

  var silReset = $('#sil-reset');
  if (silReset) {
    silReset.addEventListener('click', function () {
      var defaults = {
        'sil-gen': '3', 'sil-prem-cur': 31000, 'sil-rate-g': 20, 'sil-rate-n': 20,
        'sil-prem-g4': 22000, 'sil-prem-g4nb': 11000, 'sil-prem-g5': 15400, 'sil-prem-g5nb': 7700,
        'sil-rate-g5': 30, 'sil-med-g': 500000, 'sil-med-n': 900000, 'sil-med-severe': 0, 'sil-med-excl': 300000,
        'sil-paid-nb': ''
      };
      Object.keys(defaults).forEach(function (k) { setVal(k, defaults[k]); });
      if (discCb) discCb.checked = false;
      var g4 = document.getElementById('sil-prem-g4');
      if (g4) g4.disabled = false;
      renderSil();
    });
  }

  /* 저장값 복원 */
  (function restoreSil() {
    var s = store.sil || {};
    if (s.gen) setVal('sil-gen', s.gen);
    var map = { premCur: 'sil-prem-cur', premG4: 'sil-prem-g4', premG4nb: 'sil-prem-g4nb',
      premG5: 'sil-prem-g5', premG5nb: 'sil-prem-g5nb', medG: 'sil-med-g', medN: 'sil-med-n',
      medSevere: 'sil-med-severe', medExcl: 'sil-med-excl' };
    Object.keys(map).forEach(function (k) {
      if (s[k] !== undefined && s[k] !== null) setVal(map[k], s[k]);
    });
    if (s.rateG !== undefined) setVal('sil-rate-g', Math.round(s.rateG * 100));
    if (s.rateN !== undefined) setVal('sil-rate-n', Math.round(s.rateN * 100));
    if (s.rateG5 !== undefined) setVal('sil-rate-g5', Math.round(s.rateG5 * 100));
    if (s.paidNb !== undefined && s.paidNb !== null) setVal('sil-paid-nb', s.paidNb);
    if (s.discount && discCb) discCb.checked = true;
    var g4 = document.getElementById('sil-prem-g4');
    if (g4) g4.disabled = s.gen === '4';
  })();

  /* =========================================================
     02 청구 서류 체크리스트
     ========================================================= */
  var SIT = {
    silson_out: { ko: '실손 · 통원', en: 'Indemnity · outpatient', zh: '实损 · 门诊', ja: '実損 · 通院' },
    silson_in: { ko: '실손 · 입원·수술', en: 'Indemnity · admission', zh: '实损 · 住院·手术', ja: '実損 · 入院・手術' },
    silson_rx: { ko: '실손 · 약제비', en: 'Indemnity · prescriptions', zh: '实损 · 药费', ja: '実損 · 薬剤費' },
    car_in: { ko: '자동차 · 대인', en: 'Auto · bodily injury', zh: '汽车 · 对人', ja: '自動車 · 対人' },
    car_prop: { ko: '자동차 · 대물', en: 'Auto · property', zh: '汽车 · 对物', ja: '自動車 · 対物' },
    car_own: { ko: '자동차 · 자차', en: 'Auto · own damage', zh: '汽车 · 车损', ja: '自動車 · 車両' }
  };
  var AMT = {
    s: { ko: '3만원 이하', en: 'up to 30,000 KRW', zh: '3万韩元以下', ja: '3万ウォン以下' },
    m: { ko: '3만원 초과 ~ 10만원 이하', en: '30,000–100,000 KRW', zh: '3万~10万韩元', ja: '3万~10万ウォン' },
    l: { ko: '10만원 초과 ~ 50만원 이하', en: '100,000–500,000 KRW', zh: '10万~50万韩元', ja: '10万~50万ウォン' },
    xl: { ko: '50만원 초과', en: 'over 500,000 KRW', zh: '50万韩元以上', ja: '50万ウォン超' }
  };

  /* 서류 정의 — kind: req | cond | rec */
  function buildItems(sit, amount, extras) {
    var out = [];
    function add(name, kind, where, note) {
      out.push({ key: sit + '|' + name, name: L(name), kind: kind, where: L(where), note: note ? L(note) : '' });
    }
    var high = amount === 'l' || amount === 'xl';

    if (sit === 'silson_out') {
      add('보험금 청구서', 'req', '보험사 앱·홈페이지', '개인(신용)정보 처리동의서와 보험금 받을 계좌번호를 함께 적습니다. 앱에서 접수하면 청구서가 생략되는 경우가 많습니다.');
      add('청구인 신분증 사본', 'req', '본인', '가족이 대신 청구하면 위임장과 청구권자의 인감증명서(또는 본인서명사실확인서)가 더 필요합니다.');
      add('진료비 계산서·영수증', 'req', '병원 원무과', '카드전표와 진료비 납입확인서는 증빙으로 인정되지 않습니다.');
      if (amount !== 's') add('질병분류기호가 기재된 처방전', 'req', '병원·약국', '무료로 발급됩니다. 2부를 받아 두면 나중에 서류를 다시 떼는 일을 줄일 수 있습니다.');
      if (high) add('진단서·통원확인서·진료확인서·소견서·진료차트 중 1', 'req', '병원', '진단명(질병분류기호)이 적혀 있어야 합니다. 진단서 발급비는 비급여라 본인 부담입니다.');
      if (extras.noncovered) add('진료비 세부산정내역서', 'req', '병원 원무과', '급여·비급여 항목이 나뉘어 있어야 보험금이 계산됩니다. 비급여가 없는 통원은 생략되는 경우가 많습니다.');
      add('통장 사본', 'cond', '은행', '계좌가 보험사에 등록돼 있으면 생략할 수 있습니다.');
      add('진료일·병원·금액 메모', 'rec', '본인', '청구 화면에 그대로 옮겨 적으면 입력 시간이 줄어듭니다.');
    }

    if (sit === 'silson_in') {
      add('보험금 청구서', 'req', '보험사 앱·홈페이지', '개인(신용)정보 처리동의서와 계좌번호를 함께 준비합니다.');
      add('청구인 신분증 사본', 'req', '본인', '대리 청구 시 위임장·인감증명서가 추가됩니다.');
      add('진료비 계산서·영수증', 'req', '병원 원무과', '입원은 금액과 상관없이 기본 서류입니다.');
      add('진료비 세부산정내역서', 'req', '병원 원무과', '입원은 생략되지 않습니다. 비급여 항목 확인에 필요합니다.');
      if (amount === 'xl') {
        add('진단서', 'req', '병원', '진단명과 입·퇴원 기간이 적혀 있어야 합니다.');
      } else {
        add('입·퇴원확인서(진단명 기재) 또는 진단서', 'req', '병원 원무과', '입원비 50만원 이하이면 진단명이 적힌 입·퇴원확인서나 진료확인서로 진단서를 대신할 수 있습니다.');
      }
      add('입·퇴원확인서', 'cond', '병원 원무과', '입원 기간 확인용으로 함께 내면 심사가 빨라집니다.');
      if (extras.surgery) {
        add('수술확인서', 'cond', '병원', '실손은 입원·통원 의료비로 계산되고, 정액 수술비 담보를 함께 청구할 때 수술명·수술방법이 적힌 수술확인서가 따로 필요합니다.');
        add('수술기록지', 'rec', '병원 의무기록실', '수술 내용 확인이 필요할 때 요청받습니다.');
      }
      add('검사결과지·병리보고서', 'rec', '병원 의무기록실', '암·중증 질환 청구에서 요구되는 경우가 있습니다.');
      add('통장 사본', 'cond', '은행', '계좌가 등록돼 있으면 생략 가능합니다.');
    }

    if (sit === 'silson_rx') {
      add('보험금 청구서', 'req', '보험사 앱·홈페이지', '병원 진료비와 약제비를 같은 청구로 묶으면 처리도 한 번에 끝납니다.');
      add('청구인 신분증 사본', 'req', '본인', '대리 청구 시 위임장이 추가됩니다.');
      add('약제비 계산서·영수증', 'req', '약국', '카드전표는 인정되지 않습니다.');
      add('처방전', 'req', '병원·약국', '질병분류기호가 기재된 것이어야 합니다.');
      add('약제비 세부산정내역서', 'cond', '약국', '비급여 약제가 있으면 요청하세요.');
      add('같은 날 병원 진료비 영수증', 'rec', '병원', '통원 1회로 합산해 계산하는 경우가 많습니다.');
      add('통장 사본', 'cond', '은행', '계좌가 등록돼 있으면 생략 가능합니다.');
    }

    if (sit === 'car_in') {
      add('보험금 청구서', 'req', '보험사', '사고 접수번호를 먼저 받아 두면 이후 절차가 빨라집니다.');
      add('청구인 신분증 사본', 'req', '본인', '대리 청구 시 위임장이 추가됩니다.');
      add('진단서', 'req', '병원', '진단명이 있어야 합니다. 상해 정도에 따라 추가 심사가 붙습니다.');
      add('진료비 계산서·영수증', 'req', '병원', '보험사가 병원에 직접 지급하는 경우 내가 낸 본인부담금만 청구합니다.');
      add('자동차등록증 사본·운전자 면허증 사본', 'req', '본인', '보험사가 사고 접수 때 요청합니다.');
      if (extras.police) add('교통사고사실확인원', 'req', '경찰서·교통민원24', '경찰에 신고한 사고면 발급됩니다.');
      else add('교통사고사실확인원', 'cond', '경찰서·교통민원24', '경찰에 신고했다면 함께 준비하세요.');
      add('합의서', 'cond', '보험사 양식', '합의로 마무리할 때 작성합니다.');
      add('소득·재직 증명', 'cond', '회사·국세청', '휴업손해를 청구할 때 필요합니다(원천징수영수증·급여대장 등).');
      if (amount === 'xl') add('입원확인서·간호기록', 'rec', '병원', '입원 치료의 실질을 확인하는 자료로 요청될 수 있습니다.');
      add('통장 사본', 'cond', '은행', '계좌가 등록돼 있으면 생략 가능합니다.');
    }

    if (sit === 'car_prop') {
      add('보험금 청구서', 'req', '보험사', '사고 접수번호를 확인합니다.');
      add('청구인 신분증 사본', 'req', '본인', '대리 청구 시 위임장이 추가됩니다.');
      add('상대방 이름·연락처·차량번호', 'req', '현장에서 메모', '현장에서 바로 확보하세요. 나중에 연락이 어려워지는 경우가 많습니다.');
      add('피해물 파손 사진', 'req', '본인', '번호판과 파손 부위를 함께 찍어 두세요.');
      add('수리비 견적서', 'req', '정비소', '수리 전 견적을 받아 두어야 분쟁이 줄어듭니다.');
      add('수리비 영수증', 'cond', '정비소', '수리를 마친 뒤 제출합니다.');
      add('피해물 등록증 사본', 'cond', '상대방', '상대 차량 등록증, 건물 등기부 등입니다.');
      if (extras.police) add('교통사고사실확인원', 'req', '경찰서·교통민원24', '경찰 신고 사고면 발급됩니다.');
      add('합의서', 'cond', '보험사 양식', '합의로 마무리할 때 작성합니다.');
      if (amount === 'xl') add('수리불능·전부손해 확인서', 'cond', '정비소', '수리 대신 차량 가액으로 보상할 때 필요합니다.');
      add('자동차등록증·면허증 사본', 'cond', '본인', '보험사가 요청하는 경우가 있습니다.');
    }

    if (sit === 'car_own') {
      add('보험금 청구서', 'req', '보험사', '사고 접수번호를 먼저 받습니다.');
      add('청구인 신분증 사본', 'req', '본인', '대리 청구 시 위임장이 추가됩니다.');
      add('자동차등록증 사본', 'req', '본인', '차량 소유 확인용입니다.');
      add('수리 견적서', 'req', '정비소', '자기부담금과 보험금을 가르는 기준이 됩니다.');
      add('사고 부위 사진', 'req', '본인', '수리 전 상태를 찍어 두지 않으면 보상이 지연될 수 있습니다.');
      add('수리비 영수증', 'cond', '정비소', '수리 완료 후 제출합니다.');
      if (extras.police) add('교통사고사실확인원', 'req', '경찰서·교통민원24', '경찰 신고 사고면 발급됩니다.');
      add('운전자 면허증 사본', 'cond', '본인', '보험사가 요청하는 경우가 있습니다.');
      add('대차료·견인비 영수증', 'cond', '렌터카·견인업체', '특약이 있으면 함께 청구하세요.');
      if (amount === 'xl') add('수리불능·전부손해 확인서', 'cond', '정비소', '전부손해로 처리될 때 필요합니다.');
      add('통장 사본', 'cond', '은행', '계좌가 등록돼 있으면 생략 가능합니다.');
    }

    return out;
  }

  function buildPhrase(sit, amount, extras) {
    if (sit === 'silson_out') {
      if (amount === 's') return L('실손보험 청구용으로 진료비 계산서(영수증)를 발급해 주세요. 비급여가 있으면 진료비 세부산정내역서도 함께 부탁드립니다.');
      if (amount === 'm') return L('실손보험 청구용으로 진료비 계산서(영수증)와 질병분류기호가 기재된 처방전 2부를 발급해 주세요.');
      return L('실손보험 청구용으로 진료비 계산서·영수증, 진료비 세부산정내역서, 질병분류기호와 진단명이 기재된 통원확인서(또는 진단서)를 발급해 주세요.');
    }
    if (sit === 'silson_in') {
      if (amount === 'xl' || extras.surgery) return L('실손보험 청구용으로 진료비 계산서·영수증, 진료비 세부산정내역서, 진단명과 입·퇴원 기간이 기재된 입·퇴원확인서를 발급해 주세요. 진단서와 수술명·수술일자가 기재된 수술확인서도 함께 부탁드립니다.');
      return L('실손보험 청구용으로 진료비 계산서·영수증, 진료비 세부산정내역서, 진단명과 입·퇴원 기간이 기재된 입·퇴원확인서를 발급해 주세요.');
    }
    if (sit === 'silson_rx') return L('실손보험 청구용으로 약제비 계산서·영수증과 질병분류기호가 기재된 처방전을 발급해 주세요. 비급여 약제가 있으면 약제비 세부산정내역서도 주세요.');
    if (sit === 'car_in') return L('자동차보험 대인보상 청구용으로 진단서와 진료비 계산서·영수증, 진단명이 기재된 진료확인서를 발급해 주세요. 보험사 사고 접수번호는 제가 알려드리겠습니다.');
    if (sit === 'car_prop') return L('자동차보험 대물보상 청구용으로 수리 전 사진, 수리비 견적서, 수리 후 영수증을 준비해 주세요.');
    return L('자동차보험 자차 청구용으로 수리 전 사진, 수리비 견적서, 수리 후 영수증을 준비해 주세요.');
  }

  function buildCautions(sit, amount, extras) {
    var c = [];
    var isSil = sit.indexOf('silson') === 0;
    if (isSil) {
      c.push(L('청구권 소멸시효는 3년입니다. 진료비를 부담한 날부터 3년이 지나면 청구할 수 없으니 오래된 영수증부터 처리하세요(상법 제662조).'));
      c.push(L('보험사는 서류를 접수하면 3영업일 안에 지급하고, 조사가 필요하면 지급예정일(30영업일 이내)과 가지급제도를 안내해야 합니다.'));
      c.push(L('2024년 10월 25일 이후 진료분은 병원급 이상 의료기관에서 실손24 앱·웹으로 전산 청구할 수 있습니다. 진단서 같은 추가 서류는 사진으로 첨부합니다.'));
      c.push(L('4세대·5세대는 통원 1회 최소 자기부담금(4세대 비급여 3만원, 5세대 비중증 5만원)이 붙어 소액 통원은 보험금이 0원인 경우가 많습니다.'));
      if (extras.noncovered) c.push(L('1년간 비급여 보험금이 100만원을 넘으면 다음 갱신 때 비급여 특약료가 할증됩니다. 청구 시점을 몰아 잡으면 등급이 올라갈 수 있습니다.'));
      c.push(L('진단서·소견서 발급비는 비급여라 실손으로 돌려받지 못하는 경우가 많습니다. 50만원 이하 입원은 입·퇴원확인서로 대신하세요.'));
    } else {
      c.push(L('자동차보험 보험금 청구권도 3년입니다(상법 제662조).'));
      c.push(L('대인 보상은 보험사가 병원에 진료비를 직접 지급하는 경우가 많아, 청구는 주로 본인부담금 중심입니다. 합의 전에도 가지급보험금을 청구할 수 있습니다.'));
      c.push(L('사고를 접수하기 전에 자기부담금과 할증 여부를 보험사에 확인하세요. 접수 뒤 취소는 어렵습니다.'));
      if (sit === 'car_own') c.push(L('자차는 수리 전 사진이 없으면 보상이 지연될 수 있습니다. 견적서와 사진을 먼저 남기세요.'));
      c.push(L('카드전표·진료비 납입확인서는 증빙으로 인정되지 않습니다. 계산서와 영수증을 받으세요.'));
    }
    c.push(L('보험사가 사안에 따라 추가 서류를 요청할 수 있습니다. 산부인과·항문외과·비뇨기과·피부과 진료나 잦은 청구는 10만원 이하라도 추가 증빙을 요구할 수 있습니다.'));
    return c;
  }

  var claimState = { sit: 'silson_out', amount: 'm', extras: { noncovered: true, surgery: false, police: false } };

  function renderClaim() {
    var sit = claimState.sit, amount = claimState.amount, extras = claimState.extras;
    var items = buildItems(sit, amount, extras);
    var checked = (store.claim && store.claim.checked) || {};
    var list = $('#cl-list');
    if (!list) return;

    var frag = document.createDocumentFragment();
    items.forEach(function (it) {
      var li = document.createElement('li');
      li.className = 'in-check-item';
      li.setAttribute('data-key', it.key);
      var done = !!checked[it.key];
      if (done) li.classList.add('is-done');
      li.innerHTML =
        '<label class="in-check-main"><input type="checkbox" data-doc="' + esc(it.key) + '"' + (done ? ' checked' : '') + '>' +
        '<span class="nm">' + esc(it.name) + '</span></label>' +
        '<span class="in-check-meta"><span class="tag tag-' + (it.kind === 'req' ? 'req' : it.kind === 'cond' ? 'cond' : 'rec') + '">' +
        t(it.kind) + '</span><span class="where">' + esc(it.where) + '</span></span>' +
        (it.note ? '<p class="note">' + esc(it.note) + '</p>' : '');
      frag.appendChild(li);
    });
    list.innerHTML = '';
    list.appendChild(frag);

    $$('#cl-list input[type="checkbox"]').forEach(function (cb) {
      cb.addEventListener('change', function () {
        var key = cb.getAttribute('data-doc');
        store.claim = store.claim || {};
        store.claim.checked = store.claim.checked || {};
        if (cb.checked) store.claim.checked[key] = true;
        else delete store.claim.checked[key];
        cb.closest('.in-check-item').classList.toggle('is-done', cb.checked);
        updateClaimProgress(items);
        save();
      });
    });

    setText('cl-title', (SIT[sit][LANG] || SIT[sit].ko) + ' · ' + t('claimDocs'));
    setText('cl-sum', t('clSum', {
      sit: SIT[sit][LANG] || SIT[sit].ko,
      req: items.filter(function (i) { return i.kind === 'req'; }).length,
      cond: items.filter(function (i) { return i.kind === 'cond'; }).length,
      rec: items.filter(function (i) { return i.kind === 'rec'; }).length
    }));

    setText('cl-phrase', buildPhrase(sit, amount, extras));

    var cautions = buildCautions(sit, amount, extras);
    var ul = $('#cl-cautions');
    ul.innerHTML = cautions.map(function (c) { return '<li>' + c + '</li>'; }).join('');

    updateClaimProgress(items);
    store.claim = store.claim || {};
    store.claim.sit = sit; store.claim.amount = amount; store.claim.extras = extras;
    save();
  }

  function updateClaimProgress(items) {
    var checked = (store.claim && store.claim.checked) || {};
    var done = items.filter(function (i) { return checked[i.key]; }).length;
    setText('cl-progress', t('clCount', { done: done, total: items.length }));
    var bar = $('#cl-progress-bar');
    if (bar) bar.style.width = (items.length ? done / items.length * 100 : 0) + '%';
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  /* 상황 버튼 */
  $$('#cl-sits .in-chip').forEach(function (b) {
    b.addEventListener('click', function () {
      $$('#cl-sits .in-chip').forEach(function (x) {
        x.classList.toggle('is-on', x === b);
        x.setAttribute('aria-pressed', x === b ? 'true' : 'false');
      });
      claimState.sit = b.getAttribute('data-sit');
      renderClaim();
    });
  });
  var clAmount = $('#cl-amount');
  if (clAmount) clAmount.addEventListener('change', function () { claimState.amount = this.value; renderClaim(); });
  $$('#cl-extra input[type="checkbox"]').forEach(function (cb) {
    cb.addEventListener('change', function () {
      claimState.extras[cb.getAttribute('data-extra')] = cb.checked;
      renderClaim();
    });
  });

  /* 복사·인쇄 */
  function copyText(txt, feedbackEl) {
    function ok() { flash(feedbackEl, t('copied')); }
    function fail() { flash(feedbackEl, t('copyFail')); }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(txt).then(ok, function () { legacyCopy(txt, ok, fail); });
    } else {
      legacyCopy(txt, ok, fail);
    }
  }
  function legacyCopy(txt, ok, fail) {
    try {
      var ta = document.createElement('textarea');
      ta.value = txt;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      var res = document.execCommand('copy');
      document.body.removeChild(ta);
      if (res) ok(); else fail();
    } catch (e) { fail(); }
  }
  function flash(el, msg) {
    if (!el) return;
    var old = el.textContent;
    el.textContent = msg;
    setTimeout(function () { el.textContent = old; }, 1800);
  }

  var clPhraseBtn = $('#cl-copy-phrase');
  if (clPhraseBtn) {
    clPhraseBtn.addEventListener('click', function () {
      copyText($('#cl-phrase').textContent, $('#cl-save'));
    });
  }

  var clCopy = $('#cl-copy');
  if (clCopy) {
    clCopy.addEventListener('click', function () {
      var items = buildItems(claimState.sit, claimState.amount, claimState.extras);
      var checked = (store.claim && store.claim.checked) || {};
      var lines = [];
      lines.push('[' + (SIT[claimState.sit][LANG] || SIT[claimState.sit].ko) + ' · ' + (AMT[claimState.amount][LANG] || AMT[claimState.amount].ko) + ']');
      items.forEach(function (it, i) {
        lines.push((checked[it.key] ? '[x] ' : '[ ] ') + (i + 1) + '. ' + it.name + ' (' + t(it.kind) + ', ' + it.where + ')' + (it.note ? '\n    · ' + it.note : ''));
      });
      lines.push('');
      lines.push('요청 문장: ' + $('#cl-phrase').textContent);
      lines.push('');
      lines.push('주의:');
      buildCautions(claimState.sit, claimState.amount, claimState.extras).forEach(function (c) {
        lines.push('- ' + c.replace(/<[^>]+>/g, ''));
      });
      copyText(lines.join('\n'), $('#cl-save'));
    });
  }

  var clPrint = $('#cl-print');
  if (clPrint) {
    clPrint.addEventListener('click', function () {
      document.body.classList.add('print-claim');
      var done = function () {
        document.body.classList.remove('print-claim');
      };
      window.addEventListener('afterprint', done, { once: true });
      setTimeout(function () {
        window.print();
        setTimeout(done, 1200);
      }, 60);
    });
  }

  var clClear = $('#cl-clear');
  if (clClear) {
    clClear.addEventListener('click', function () {
      store.claim = store.claim || {};
      store.claim.checked = {};
      save();
      renderClaim();
    });
  }

  /* 저장값 복원 (청구) */
  (function restoreClaim() {
    var s = store.claim || {};
    if (s.sit && SIT[s.sit]) claimState.sit = s.sit;
    if (s.amount && AMT[s.amount]) claimState.amount = s.amount;
    if (s.extras) claimState.extras = Object.assign(claimState.extras, s.extras);
    $$('#cl-sits .in-chip').forEach(function (x) {
      var on = x.getAttribute('data-sit') === claimState.sit;
      x.classList.toggle('is-on', on);
      x.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    if (clAmount) clAmount.value = claimState.amount;
    $$('#cl-extra input[type="checkbox"]').forEach(function (cb) {
      cb.checked = !!claimState.extras[cb.getAttribute('data-extra')];
    });
  })();

  /* =========================================================
     03 자차 vs 자비
     ========================================================= */
  function readCar() {
    return {
      repair: num('car-repair'),
      rate: parseFloat($('#car-rate').value) || 0.2,
      threshold: parseFloat($('#car-threshold').value) || 2000000,
      min: num('car-min'),
      max: num('car-max'),
      premium: num('car-premium'),
      history: parseFloat($('#car-history').value) || 0,
      hike: parseFloat($('#car-hike').value) || 0.15
    };
  }

  function carCalc(d) {
    var selfPay = d.repair * d.rate;
    if (d.min > 0) selfPay = Math.max(selfPay, Math.min(d.min, d.repair));
    if (d.max > 0) selfPay = Math.min(selfPay, d.max);
    selfPay = clamp(selfPay, 0, d.repair);
    var paid = Math.max(0, d.repair - selfPay);
    var over = paid > d.threshold;
    var extra = d.premium * d.hike * 3;
    var ownTotal = selfPay + extra;
    return {
      selfPay: selfPay, paid: paid, over: over, extra: extra,
      ownTotal: ownTotal, cashTotal: d.repair,
      diff: ownTotal - d.repair
    };
  }

  function renderCar() {
    var d = readCar();
    var r = carCalc(d);

    setText('car-kpi-own', won(r.ownTotal));
    setText('car-kpi-cash', won(r.cashTotal));
    setText('car-kpi-diff', won(Math.abs(r.diff)));
    setText('car-kpi-own-d', won(r.selfPay) + ' + ' + won(r.extra));
    setText('car-kpi-cash-d', won(d.repair));
    setText('car-kpi-diff-d', r.diff > 0 ? t('carTagCash') : r.diff < 0 ? t('carTagOwn') : t('carTagEven'));

    var max = Math.max(r.ownTotal, r.cashTotal, 1);
    setText('car-bar-own-total', won(r.ownTotal));
    setText('car-bar-cash-total', won(r.cashTotal));
    setText('car-bar-own-prem-v', won(r.extra));
    setText('car-bar-own-self-v', won(r.selfPay));
    setText('car-bar-cash-self-v', won(d.repair));
    var op = $('#car-bar-own-prem'), os = $('#car-bar-own-self'), cs = $('#car-bar-cash-self');
    if (op) op.style.width = (r.extra / max * 100).toFixed(2) + '%';
    if (os) os.style.width = (r.selfPay / max * 100).toFixed(2) + '%';
    if (cs) cs.style.width = (r.cashTotal / max * 100).toFixed(2) + '%';

    setText('car-t-repair', won(d.repair));
    setText('car-t-self', won(r.selfPay));
    setText('car-t-paid', won(r.paid));
    setText('car-t-extra', won(r.extra));
    setText('car-t-own-sum', won(r.ownTotal));

    var judge;
    if (r.over) judge = t('carJudgeOver', { th: won(d.threshold) });
    else if (d.history >= 1) judge = t('carJudgeTwice');
    else judge = t('carJudgeKeep');
    setText('car-t-judge', judge);

    var v = $('#car-verdict');
    v.classList.remove('is-good', 'is-even');
    var even = Math.abs(r.diff) <= Math.max(10000, d.repair * 0.01);
    if (even) {
      v.classList.add('is-even');
      setText('car-verdict-tag', t('carTagEven'));
      setText('car-verdict-main', t('carMainEven'));
      setText('car-verdict-sub', t('carSubEven'));
    } else if (r.diff < 0) {
      v.classList.add('is-good');
      setText('car-verdict-tag', t('carTagOwn'));
      setText('car-verdict-main', t('carMainOwn', { amt: won(-r.diff) }));
      setText('car-verdict-sub', t('carSubOwn', { self: won(r.selfPay), extra: won(r.extra) }));
    } else {
      setText('car-verdict-tag', t('carTagCash'));
      setText('car-verdict-main', t('carMainCash', { amt: won(r.diff) }));
      setText('car-verdict-sub', t('carSubCash', { own: won(r.ownTotal), repair: won(d.repair) }));
    }

    /* 해석: 최대 자기부담 도달 손해액 + 자비가 유리해지는 구간 */
    var noteParts = [];
    if (d.rate > 0 && d.max > 0) {
      var hitMax = Math.ceil(d.max / d.rate);
      noteParts.push(t('carNoteMax', { amt: won(hitMax), max: won(d.max) }));
    }
    var be = carBreakEven(d);
    if (be !== null) noteParts.push(t('carNoteBreak', { amt: won(be) }));
    setText('car-note', noteParts.join(' '));

    store.car = d;
    save();
  }

  /* 수리비를 바꿔 가며 자차/자비가 갈리는 지점 */
  function carBreakEven(d) {
    var step = 10000, hi = 20000000, lastCash = null, flipped = false;
    for (var rp = step; rp <= hi; rp += step) {
      var dd = Object.assign({}, d, { repair: rp });
      var c = carCalc(dd);
      if (c.diff > 1000) {                 // 자비 처리가 유리한 구간
        if (flipped) break;
        lastCash = rp;
      } else if (c.diff < -1000) {          // 자차 처리가 유리
        if (lastCash !== null) flipped = true;
        else break;
      }
    }
    return lastCash;
  }

  ['car-repair', 'car-rate', 'car-threshold', 'car-min', 'car-max', 'car-premium', 'car-history', 'car-hike'].forEach(function (id) {
    var el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('input', renderCar);
    el.addEventListener('change', renderCar);
  });

  var carReset = $('#car-reset');
  if (carReset) {
    carReset.addEventListener('click', function () {
      var d = { 'car-repair': 1800000, 'car-rate': '0.2', 'car-threshold': '2000000', 'car-min': 200000, 'car-max': 500000, 'car-premium': 600000, 'car-history': '0', 'car-hike': '0.15' };
      Object.keys(d).forEach(function (k) { setVal(k, d[k]); });
      renderCar();
    });
  }

  (function restoreCar() {
    var s = store.car || {};
    var map = { repair: 'car-repair', min: 'car-min', max: 'car-max', premium: 'car-premium' };
    Object.keys(map).forEach(function (k) { if (s[k] !== undefined) setVal(map[k], s[k]); });
    if (s.rate !== undefined) setVal('car-rate', String(s.rate));
    if (s.threshold !== undefined) setVal('car-threshold', String(s.threshold));
    if (s.history !== undefined) setVal('car-history', String(s.history));
    if (s.hike !== undefined) setVal('car-hike', String(s.hike));
  })();

  /* 상단 날짜 — 정적 HTML 의 빌드 시점 날짜 대신 오늘 날짜로 */
  (function todayDate() {
    var el = document.getElementById('today-date');
    if (!el || !window.Intl || !Intl.DateTimeFormat) return;
    try {
      el.textContent = new Intl.DateTimeFormat(LOCALE, { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' }).format(new Date());
    } catch (e) { /* 무시 */ }
  })();

  /* ---------------- 시작 ---------------- */
  renderSil();
  renderClaim();
  renderCar();

  /* 언어 페이지에서 페이지 번역이 끝난 뒤 다시 한 번 그립니다 */
  window.setTimeout(function () { renderSil(); renderClaim(); renderCar(); }, 900);
})();
