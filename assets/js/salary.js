/* =========================================================
   INSIGHT BRIEF — 2027 급여·노무 계산기 (salary.html)
   모든 계산은 브라우저 안에서만 합니다. 서버로 보내는 값은 없습니다.
   데이터·요율은 assets/js/salary-data.js 참고.
   ========================================================= */
(function () {
  'use strict';
  var D = window.SL_DATA;
  if (!D) return;

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var nf = new Intl.NumberFormat('ko-KR');

  function num(n) { return nf.format(Math.round(n || 0)); }
  function won(n) { return num(n) + '원'; }
  function wonShort(n) {
    var v = Math.round(n || 0);
    if (Math.abs(v) >= 100000000) return (v / 100000000).toFixed(2).replace(/\.00$/, '') + '억원';
    if (Math.abs(v) >= 10000) return nf.format(Math.round(v / 10000)) + '만원';
    return nf.format(v) + '원';
  }
  function pct(n, d) { return (n * 100).toFixed(d == null ? 2 : d) + '%'; }
  function floorTo(n, unit) { return Math.floor(n / unit) * unit; }
  function clamp(n, a, b) { return Math.min(Math.max(n, a), b); }
  var DASH = '—';

  /* ---------------------------------------------------------
     ① 회사 비용 vs 실수령액
  --------------------------------------------------------- */
  var pay = { mode: 'hourly', emp: 'now' };

  function buildPayOptions() {
    var sizeSel = $('#pay-size');
    sizeSel.innerHTML = D.insurance.stability.map(function (s, i) {
      return '<option value="' + i + '">' + s.label + ' (' + (s.rate * 100).toFixed(2) + '%)</option>';
    }).join('');

    var famSel = $('#pay-family');
    famSel.innerHTML = [1, 2, 3, 4, 5, 6].map(function (n) {
      return '<option value="' + n + '"' + (n === 1 ? ' selected' : '') + '>' + n + '명' +
        (n === 1 ? ' (본인만)' : '') + '</option>';
    }).join('');

    var indSel = $('#pay-industry');
    indSel.innerHTML = D.injury.list.map(function (it) {
      var total = (it.rate + D.injury.commute) * 100;
      return '<option value="' + it.code + '"' + (it.code === '905' ? ' selected' : '') + '>' +
        it.name + ' (' + total.toFixed(2) + '%)</option>';
    }).join('') + '<option value="custom">직접 입력</option>';
  }

  function monthlyHours(weekHours) {
    var weekly = weekHours >= 15 ? weekHours + Math.min(weekHours / 5, 8) : weekHours;
    return Math.round(weekly * 365 / 12 / 7);
  }

  /* 근로소득 간이세액표 조회 — 표의 '이상~미만' 구간 값을 그대로 씁니다. */
  function incomeTax(monthly, family) {
    var rows = D.tax, col = clamp(family, 1, 6) - 1;
    var k = monthly / 1000;
    if (k < rows[0][0]) return 0;
    if (k >= 9980) {
      var last = rows[rows.length - 1];
      var baseVal = last[col + 1] || 0;
      if (k >= 10000) {
        var extra = 0, m = monthly;
        if (m <= 14000000) extra = (m - 10000000) * 0.98 * 0.35 + 25000;
        else if (m <= 28000000) extra = 1397000 + (m - 14000000) * 0.98 * 0.38;
        else if (m <= 30000000) extra = 6610600 + (m - 28000000) * 0.98 * 0.40;
        else if (m <= 45000000) extra = 7394600 + (m - 30000000) * 0.40;
        else if (m <= 87000000) extra = 13394600 + (m - 45000000) * 0.42;
        else extra = 31034600 + (m - 87000000) * 0.45;
        return floorTo(baseVal + extra, 10);
      }
      return baseVal;
    }
    var lo = 0, hi = rows.length - 1;
    while (lo < hi) {
      var mid = (lo + hi + 1) >> 1;
      if (rows[mid][0] <= k) lo = mid; else hi = mid - 1;
    }
    var v = rows[lo][col + 1];
    return v == null ? 0 : v;
  }

  function calcPay() {
    var weekHours = clamp(parseFloat($('#pay-hours').value) || 0, 1, 52);
    var hours = monthlyHours(weekHours);
    var rate = Math.max(0, parseFloat($('#pay-rate').value) || 0);
    var gross = pay.mode === 'hourly' ? rate * hours : rate;
    var g = gross > 0 ? gross : 1;   /* 0으로 나누기 방지 (표시는 gross 그대로) */
    var sizeIdx = parseInt($('#pay-size').value, 10) || 0;
    var stab = D.insurance.stability[sizeIdx].rate;
    var family = parseInt($('#pay-family').value, 10) || 1;

    var empRate = pay.emp === 'plan' ? D.insurance.employmentPlan.worker : D.insurance.employment.worker;
    var empEmployer = pay.emp === 'plan' ? D.insurance.employmentPlan.employer : D.insurance.employment.employer;
    var empStatus = pay.emp === 'plan' ? '정부안 2.0%' : '현행 1.8%';

    var injurySel = $('#pay-industry').value;
    var injuryRate;
    if (injurySel === 'custom') {
      injuryRate = clamp(parseFloat($('#pay-injury').value) || 0, 0, 20) / 100;
    } else {
      var item = D.injury.list.filter(function (x) { return x.code === injurySel; })[0] || D.injury.list[21];
      injuryRate = item.rate + D.injury.commute;
      $('#pay-injury').value = (injuryRate * 100).toFixed(2);
    }

    var penBase = floorTo(clamp(gross, D.insurance.pensionCap.min, D.insurance.pensionCap.max), 1000);
    var pension = floorTo(penBase * D.insurance.pension.worker, 1);
    var health = floorTo(penBase * D.insurance.health.worker, 10);
    var ltc = floorTo(health * D.insurance.ltc.rate, 10);
    var empWorker = floorTo(gross * empRate, 10);
    var tax = incomeTax(gross, family);
    var localTax = floorTo(tax * 0.1, 10);

    var erPension = floorTo(penBase * D.insurance.pension.employer, 1);
    var erHealth = floorTo(penBase * D.insurance.health.employer, 10);
    var erLtc = floorTo(erHealth * D.insurance.ltc.rate, 10);
    var erEmp = floorTo(gross * empEmployer, 10);
    var erStab = floorTo(gross * stab, 10);
    var erInjury = floorTo(gross * injuryRate, 10);
    var severanceOn = $('#pay-severance').checked;
    var severance = severanceOn ? floorTo(gross / 12, 10) : 0;

    var workerOut = pension + health + ltc + empWorker + tax + localTax;
    var net = gross - workerOut;
    var employerIns = erPension + erHealth + erLtc + erEmp + erStab + erInjury;
    var employerCost = gross + employerIns + severance;

    $('#pay-total-cost').textContent = won(employerCost);
    $('#pay-total-cost-d').textContent = '급여 ' + wonShort(gross) + ' + 사업주 부담 ' + wonShort(employerIns) + (severance ? ' + 퇴직금 ' + wonShort(severance) : '');
    $('#pay-net').textContent = won(net);
    $('#pay-net-d').textContent = '세전의 ' + (net / g * 100).toFixed(1) + '% · 세금 ' + wonShort(tax + localTax);
    $('#pay-worker-deduct').textContent = won(workerOut);
    $('#pay-worker-deduct-d').textContent = '세전의 ' + (workerOut / g * 100).toFixed(1) + '% (보험 ' + wonShort(workerOut - tax - localTax) + ' + 세금 ' + wonShort(tax + localTax) + ')';
    $('#pay-employer-cost').textContent = won(employerIns + severance);
    $('#pay-employer-cost-d').textContent = '급여의 ' + ((employerIns + severance) / g * 100).toFixed(1) + '%';

    var rows = [
      ['세전 월급', gross, gross, '월 환산 ' + hours + '시간 기준'],
      ['국민연금 5.0%', -pension, -erPension, '기준소득월액 ' + wonShort(penBase)],
      ['건강보험 3.595%', -health, -erHealth, ''],
      ['장기요양 13.90%', -ltc, -erLtc, '건강보험료의 13.90%'],
      ['고용보험 (실업급여 ' + pct(empRate, 1) + ')', -empWorker, -erEmp, empStatus],
      ['고용보험 (고용안정·직능 ' + pct(stab, 2) + ')', null, -erStab, '사업주 전액'],
      ['산재보험 (' + (injuryRate * 100).toFixed(2) + '%)', null, -erInjury, '업종 요율 + 출퇴근 0.06%'],
      ['근로소득세', -tax, null, '간이세액표 · 가족 ' + family + '명'],
      ['지방소득세', -localTax, null, '소득세의 10%'],
      ['퇴직금 적립 (1/12)', null, severance ? -severance : null, severanceOn ? '계속근로 1년 이상' : '미포함']
    ];

    $('#pay-rows').innerHTML = rows.map(function (r) {
      var w = r[1] === null ? DASH : (r[1] < 0 ? '−' + num(-r[1]) : num(r[1]));
      var e = r[2] === null ? DASH : (r[2] < 0 ? '−' + num(-r[2]) : num(r[2]));
      return '<tr><td>' + r[0] + (r[3] ? '<span class="sub">' + r[3] + '</span>' : '') + '</td>' +
        '<td class="num' + (r[1] < 0 ? ' neg' : '') + '">' + w + '</td>' +
        '<td class="num' + (r[2] < 0 ? ' neg' : '') + '">' + e + '</td></tr>';
    }).join('');

    $('#pay-foot').innerHTML =
      '<tr><td>공제·부담 합계</td><td class="num neg">−' + num(workerOut) + '</td><td class="num neg">−' +
      num(employerIns + severance) + '</td></tr>' +
      '<tr class="sum"><td>실수령액 / 회사 총지출</td><td class="num">' + num(net) + '</td><td class="num">' + num(employerCost) + '</td></tr>';

    var parts = [
      { k: 'b1', v: Math.max(0, net) },
      { k: 'b2', v: workerOut },
      { k: 'b3', v: employerIns },
      { k: 'b4', v: severance }
    ];
    var sum = parts.reduce(function (a, b) { return a + b.v; }, 0) || 1;
    $('#pay-bar').innerHTML = parts.map(function (p) {
      return '<i class="' + p.k + '" style="width:' + (p.v / sum * 100).toFixed(2) + '%"></i>';
    }).join('');
    $('#lg-net').textContent = won(Math.max(0, net));
    $('#lg-deduct').textContent = won(workerOut);
    $('#lg-ins').textContent = won(employerIns);
    $('#lg-sev').textContent = won(severance);

    $('#pay-note').innerHTML = '월 환산 ' + hours + '시간(주 ' + weekHours + '시간 + 주휴) · 시급 환산 ' +
      won(gross / hours) + (net > 0 ? ' · 회사 총지출은 실수령액의 ' + (employerCost / net).toFixed(2) + '배입니다. ' : '. ') +
      '소득세는 2026년 간이세액표 기준이고, 국민연금은 기준소득월액 상한 ' + won(D.insurance.pensionCap.max) + '·하한 ' +
      won(D.insurance.pensionCap.min) + '을 적용했습니다.';

    // 급여 형태에 따른 라벨
    $('#pay-rate-label').textContent = pay.mode === 'hourly' ? '시급' : '월급 (세전)';
    $('#pay-rate-hint').textContent = pay.mode === 'hourly' ? '2027년 최저임금 10,700원' : '월 환산액 2,236,300원';
  }

  function initPay() {
    buildPayOptions();
    calcPay();

    $$('[data-paymode]').forEach(function (b) {
      b.addEventListener('click', function () {
        var next = b.getAttribute('data-paymode');
        if (next === pay.mode) return;
        var hours = monthlyHours(clamp(parseFloat($('#pay-hours').value) || 40, 1, 52));
        var rate = Math.max(0, parseFloat($('#pay-rate').value) || 0);
        var gross = pay.mode === 'hourly' ? rate * hours : rate;
        pay.mode = next;
        $('#pay-rate').value = next === 'hourly' ? Math.round(gross / hours) : Math.round(gross);
        $$('[data-paymode]').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        calcPay();
      });
    });
    $$('[data-emp]').forEach(function (b) {
      b.addEventListener('click', function () {
        pay.emp = b.getAttribute('data-emp');
        $$('[data-emp]').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        calcPay();
      });
    });
    ['#pay-rate', '#pay-hours', '#pay-size', '#pay-family', '#pay-industry', '#pay-injury', '#pay-severance'].forEach(function (s) {
      var el = $(s);
      el.addEventListener('input', calcPay);
      el.addEventListener('change', calcPay);
    });
    $('#pay-industry').addEventListener('change', function () {
      if (this.value === 'custom') $('#pay-injury').focus();
      calcPay();
    });
  }

  /* ---------------------------------------------------------
     ② 연차유급휴가
  --------------------------------------------------------- */
  function leaveDays(years) {
    /* years: 근속연수(1 이상) — 그 해에 발생하는 연차일수 */
    if (years < 1) return 0;
    var add = years >= 3 ? Math.floor((years - 1) / 2) : 0;
    return Math.min(15 + add, 25);
  }

  function calcLeave() {
    var joinVal = $('#leave-join').value;
    var baseVal = $('#leave-date').value;
    var join = joinVal ? new Date(joinVal + 'T00:00:00') : null;
    var base = baseVal ? new Date(baseVal + 'T00:00:00') : new Date();
    if (!join || isNaN(join) || isNaN(base) || base < join) {
      $('#leave-current').textContent = DASH;
      $('#leave-current-d').textContent = '입사일을 확인해 주세요';
      $('#leave-total').textContent = DASH;
      $('#leave-total-d').textContent = '입사일·기준일 필요';
      $('#leave-tenure').textContent = DASH;
      $('#leave-tenure-d').textContent = '입사일과 기준일을 다시 선택해 주세요';
      $('#leave-pay').textContent = DASH;
      $('#leave-rows').innerHTML = '';
      $('#leave-steps').innerHTML = '<li>입사일이 기준일보다 빠른지 확인해 주세요.</li>';
      return;
    }

    var msDay = 86400000;
    var totalDays = Math.floor((base - join) / msDay) + 1;
    var months = 0;
    var cursor = new Date(join);
    while (true) {
      var next = new Date(cursor); next.setMonth(next.getMonth() + 1);
      if (next > base) break;
      months++; cursor = next;
      if (months > 1200) break;
    }
    var years = Math.floor(months / 12);
    var remMonths = months % 12;
    var daysInLastMonth = Math.floor((base - cursor) / msDay) + 1;

    var current, currentNote, total, currentStart, currentEnd;
    if (years < 1) {
      current = Math.min(months, 11);
      currentNote = '1년 미만 · 1개월 개근마다 1일';
      total = current;
      currentStart = new Date(join);
      currentEnd = new Date(join); currentEnd.setFullYear(currentEnd.getFullYear() + 1); currentEnd.setDate(currentEnd.getDate() - 1);
    } else {
      currentStart = new Date(join); currentStart.setFullYear(currentStart.getFullYear() + years);
      currentEnd = new Date(join); currentEnd.setFullYear(currentEnd.getFullYear() + years + 1); currentEnd.setDate(currentEnd.getDate() - 1);
      if (currentStart > base) {
        currentStart.setFullYear(currentStart.getFullYear() - 1);
        currentEnd.setFullYear(currentEnd.getFullYear() - 1);
      }
      current = leaveDays(years);
      currentNote = '근속 ' + years + '년차 기준 (15일 + 가산 ' + (current - 15) + '일)';
      total = 11;
      for (var y = 1; y <= years; y++) total += leaveDays(y);
    }

    $('#leave-current').textContent = current + '일';
    $('#leave-current-d').textContent = currentNote;
    $('#leave-total').textContent = total + '일';
    $('#leave-total-d').textContent = years > 0 ? '1년 미만 11일 + 연차연도 누계' : '1년 미만 월개근분';
    $('#leave-tenure').textContent = years + '년 ' + remMonths + '개월';
    $('#leave-tenure-d').textContent = totalDays.toLocaleString('ko-KR') + '일 재직 · 이번 연차연도 ' +
      fmtDate(currentStart) + '~' + fmtDate(currentEnd);

    var wage = Math.max(0, parseFloat($('#leave-wage').value) || 0);
    var unused = Math.max(0, parseFloat($('#leave-unused').value) || 0);
    $('#leave-pay').textContent = unused > 0 ? won(wage * 8 * unused) : DASH;
    $('#leave-pay-d').textContent = unused > 0
      ? '통상시급 ' + won(wage) + ' × 8시간 × ' + unused + '일'
      : '미사용일수를 넣으면 계산합니다';

    var table = [];
    if (years < 1) {
      table.push([months + '개월 (1년 미만)', Math.min(months, 11) + '일', '1개월 개근 시 1일, 최대 11일', true]);
    } else {
      table.push(['1년 미만', '11일', '1개월 개근 시 1일, 최대 11일', false]);
      for (var n = 1; n <= Math.min(years + 2, 30); n++) {
        table.push([(n + 1) + '년차 (근속 ' + n + '년)', leaveDays(n) + '일',
          n >= 3 ? '15일 + 가산 ' + (leaveDays(n) - 15) + '일' : '15일', n === years]);
      }
    }
    $('#leave-rows').innerHTML = table.map(function (r) {
      return '<tr' + (r[3] ? ' class="sum"' : '') + '><td>' + r[0] + '</td><td class="num">' + r[1] + '</td><td style="text-align:left;font-size:11.5px;color:var(--muted)">' + r[2] + '</td></tr>';
    }).join('');

    var steps = [];
    steps.push('근속기간: ' + fmtDate(join) + ' ~ ' + fmtDate(base) + ' → ' + years + '년 ' + remMonths + '개월 (' + totalDays.toLocaleString('ko-KR') + '일)');
    if (years < 1) {
      steps.push('1년 미만: 개근한 ' + months + '개월 × 1일 = ' + Math.min(months, 11) + '일 (최대 11일)');
      steps.push('1년을 채우면 그 다음 날부터 15일이 새로 발생합니다.');
    } else {
      steps.push('1년 미만 기간에 월 개근 1일씩 → 최대 11일');
      steps.push('1년 이상: 15일 + 3년 이상 가산 ' + '⌊(근속연수−1) ÷ 2⌋일 = ' + (leaveDays(years) - 15) + '일 → 이번 연차연도 ' + current + '일');
      steps.push('누계: 11일 + 1년차~' + years + '년차 발생분 합계 = ' + total + '일');
      if (unused > 0) steps.push('미사용 ' + unused + '일 수당: ' + won(wage) + ' × 8시간 × ' + unused + '일 = ' + won(wage * 8 * unused));
    }
    $('#leave-steps').innerHTML = steps.map(function (s) { return '<li>' + s + '</li>'; }).join('');
  }

  function fmtDate(d) {
    return d.getFullYear() + '.' + String(d.getMonth() + 1).padStart(2, '0') + '.' + String(d.getDate()).padStart(2, '0');
  }

  function initLeave() {
    var today = new Date();
    $('#leave-date').value = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');
    calcLeave();
    ['#leave-join', '#leave-date', '#leave-wage', '#leave-unused'].forEach(function (s) {
      $(s).addEventListener('input', calcLeave);
      $(s).addEventListener('change', calcLeave);
    });
  }

  /* ---------------------------------------------------------
     ③ 국민연금
  --------------------------------------------------------- */
  var npsFam = 'none';

  function pensionAge(year) {
    if (year <= 1952) return 60;
    if (year <= 1956) return 61;
    if (year <= 1960) return 62;
    if (year <= 1964) return 63;
    if (year <= 1968) return 64;
    return 65;
  }

  function calcNps() {
    var birth = parseInt($('#nps-birth').value, 10);
    var term = clamp(parseFloat($('#nps-term').value) || 0, 0, 45);
    var B = Math.max(0, parseFloat($('#nps-b').value) || 0);
    var A = Math.max(0, parseFloat($('#nps-a').value) || 0);
    var age = pensionAge(birth);
    var startYear = birth + age;

    $('#nps-age').textContent = '만 ' + age + '세';
    $('#nps-age-d').textContent = birth + '년생 → ' + startYear + '년부터 (생일 다음 달)';

    var fam = 0;
    if (npsFam === 'spouse') fam = D.pension.familySpouse;
    else if (npsFam === 'all') fam = D.pension.familySpouse + D.pension.familyChild;

    if (term < 10) {
      $('#nps-month').textContent = '연금 없음';
      $('#nps-month-d').textContent = '가입 10년 미만 → 반환일시금';
      $('#nps-year').textContent = DASH;
      $('#nps-rate').textContent = DASH;
      $('#nps-rate-d').textContent = '10년 미만';
      $('#nps-steps').innerHTML = '<li>가입기간이 ' + term + '년으로 10년에 못 미칩니다. 노령연금 대신 그동안 낸 보험료에 이자를 더한 <b>반환일시금</b>을 한 번에 받습니다.</li>' +
        '<li>추후납부(최대 119개월)나 임의가입으로 10년을 채우면 연금으로 받을 수 있습니다.</li>';
      $('#nps-rows').innerHTML = '';
      $('#nps-note').textContent = '가입기간 10년을 채우지 못하면 연금이 아니라 반환일시금이 됩니다.';
      return;
    }

    var over = Math.max(0, term - 20);
    var nMonths = over * 12;
    var bonus = 1 + 0.05 * nMonths / 12;
    var annualBase = D.pension.constant * (A + B) * bonus;
    var payoutRate = term >= 20 ? 1 : 0.5 + (term - 10) * 0.05;
    var annual = annualBase * payoutRate;
    var monthly = annual / 12;
    var withFam = monthly + fam / 12;

    $('#nps-month').textContent = won(withFam);
    $('#nps-month-d').textContent = '기본연금 ' + won(monthly) + (fam ? ' + 부양가족 ' + won(fam / 12) : '');
    $('#nps-year').textContent = won(withFam * 12);
    $('#nps-rate').textContent = pct(payoutRate * bonus, 1);
    $('#nps-rate-d').textContent = over > 0 ? '20년 초과 ' + over + '년 가산(×' + bonus.toFixed(2) + ') 포함' : (term < 20 ? '20년 미만 지급률' : '20년 이상 100%');

    var steps = [
      '수급 개시연령: ' + birth + '년생 → 만 ' + age + '세 (' + startYear + '년)',
      'A값 ' + won(A) + ' + B값 ' + won(B) + ' = ' + won(A + B),
      '× 비례상수 1.29 (소득대체율 43%) = ' + won(annualBase / bonus) + ' (연)',
      over > 0
        ? '20년 초과 ' + over + '년 가산: × (1 + 0.05 × ' + nMonths + '/12) = × ' + bonus.toFixed(3) + ' → ' + won(annualBase) + ' (연)'
        : '20년 이하이므로 가산 없음 → ' + won(annualBase) + ' (연)',
      '지급률 ' + pct(payoutRate, 0) + ' 적용: ' + won(annual) + ' (연) ÷ 12 = 월 ' + won(monthly),
      fam ? '부양가족연금 월 ' + won(fam / 12) + '을 더해 월 ' + won(withFam) + '입니다.' : '부양가족연금은 넣지 않았습니다.'
    ];
    $('#nps-steps').innerHTML = steps.map(function (s) { return '<li>' + s + '</li>'; }).join('');

    var rows = [10, 15, 20, 25, 30, 35, 40].map(function (t) {
      var o = Math.max(0, t - 20);
      var b = 1 + 0.05 * (o * 12) / 12;
      var ab = D.pension.constant * (A + B) * b;
      var pr = t >= 20 ? 1 : 0.5 + (t - 10) * 0.05;
      var m = ab * pr / 12;
      var repl = B > 0 ? m / B : 0;
      return '<tr' + (Math.floor(term) === t ? ' class="sum"' : '') + '><td>' + t + '년' + (t === 20 ? ' (기준)' : '') + '</td>' +
        '<td class="num">' + pct(pr * b, 1) + '</td><td class="num">' + won(m) + '</td><td class="num">' + pct(repl, 1) + '</td></tr>';
    });
    $('#nps-rows').innerHTML = rows.join('');

    $('#nps-note').innerHTML = '지금 넣은 값은 ' + term + '년 가입 · B값 ' + won(B) + ' 기준입니다. 소득대체율은 월 연금액이 B값의 ' +
      pct(monthly / (B || 1), 1) + '입니다(평균소득자 40년 가입이면 43%에 가까워집니다). ' +
      '공단의 실제 예상연금은 과거 가입기간을 <b>재평가율</b>로 현재가치화하고 출산·군복무 크레딧, 추후납부, 수급 시점의 A값을 반영하므로 이 값보다 클 수 있습니다. ' +
      '2027년 A값은 2027년 1월에 고시되므로 지금은 2026년 고시값(' + won(D.pension.A) + ')을 씁니다. ' +
      '참고로 조기수령은 1년당 6%(최대 5년·30%) 감액, 연기수령은 1년당 7.2%(최대 5년·36%) 증액됩니다.';
  }

  function initNps() {
    var sel = $('#nps-birth');
    var opts = '';
    for (var y = 1945; y <= 2005; y++) {
      opts += '<option value="' + y + '"' + (y === 1974 ? ' selected' : '') + '>' + y + '년생</option>';
    }
    sel.innerHTML = opts;
    $$('[data-fam]').forEach(function (b) {
      b.addEventListener('click', function () {
        npsFam = b.getAttribute('data-fam');
        $$('[data-fam]').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        calcNps();
      });
    });
    ['#nps-birth', '#nps-term', '#nps-b', '#nps-a'].forEach(function (s) {
      $(s).addEventListener('input', calcNps);
      $(s).addEventListener('change', calcNps);
    });
    calcNps();
  }

  /* ---------------------------------------------------------
     ④ 실업급여
  --------------------------------------------------------- */
  var ui = { reason: 'involuntary', days180: 'yes', age: 'under', cap: 'now' };

  function calcUi() {
    var payMon = Math.max(0, parseFloat($('#ui-pay').value) || 0);
    var hpd = clamp(parseFloat($('#ui-hpd').value) || 8, 1, 8);
    var yearsIdx = parseInt($('#ui-years').value, 10) || 0;
    var row = D.unemployment.table[yearsIdx];
    var days = ui.age === 'over' ? row.over50 : row.under50;

    var avgDaily = Math.floor(payMon * 3 / 91.25);
    var baseCap = ui.cap === 'plan' ? D.unemployment.baseCapPlan : D.unemployment.baseCap;
    var baseDaily = Math.min(avgDaily, baseCap);
    var raw = baseDaily * D.unemployment.benefitRate;
    var floorDaily = Math.floor(D.minWage.hourly * D.unemployment.floorRate * hpd);
    var capDaily = Math.floor((ui.cap === 'plan' ? D.unemployment.capLinked : D.unemployment.dailyCap) * (hpd / 8));
    var daily = Math.min(raw, capDaily);
    var usedFloor = false;
    if (daily < floorDaily) { daily = floorDaily; usedFloor = true; }

    $('#ui-daily').textContent = won(daily);
    $('#ui-daily-d').textContent = usedFloor ? '하한액 적용 (' + won(floorDaily) + ')' :
      (raw > capDaily ? '상한액 적용' : '평균임금의 60%');
    $('#ui-days').textContent = days + '일';
    $('#ui-days-d').textContent = row.years + ' · 만 50세 ' + (ui.age === 'over' ? '이상' : '미만');
    $('#ui-total').textContent = won(daily * days);
    $('#ui-total-d').textContent = days + '일 × ' + won(daily) + ' (비과세)';
    $('#ui-first').textContent = won(daily * 30);
    $('#ui-first-d').textContent = '주 7일 기준 30일분 · 7일 대기 후 첫 지급';

    var reasonOk = ui.reason !== 'voluntary';
    var daysOk = ui.days180 === 'yes';
    var eligible = reasonOk && daysOk;

    var st = $('#ui-st'), why = $('#ui-why');
    st.className = 'st ' + (eligible ? (ui.reason === 'justified' ? 'hold' : 'ok') : 'warn');
    if (!reasonOk) {
      st.textContent = '수급 어려움';
      why.textContent = '개인 사정으로 자발적으로 퇴사하면 원칙적으로 구직급여를 받을 수 없습니다. 다만 임금체불·성희롱·통근 곤란 등 정당한 사유가 있으면 인정될 수 있으니 고용센터에 이직확인서와 사유를 제출해 판단을 받으세요.';
    } else if (!daysOk) {
      st.textContent = '요건 미충족';
      why.textContent = '이직일 이전 18개월 동안 피보험단위기간이 180일 이상이어야 합니다. 현재 조건으로는 수급자격이 되지 않습니다(피보험단위기간은 보수를 받은 날 기준입니다).';
    } else if (ui.reason === 'justified') {
      st.textContent = '확인 필요';
      why.textContent = '정당한 사유로 인정되면 수급자격이 인정됩니다. 다만 사유의 인정 여부는 고용센터 심사로 결정되므로, 진단서·임금체불 증빙 등 자료를 준비해 확인받으세요.';
    } else {
      st.textContent = '수급 가능성 높음';
      why.textContent = '비자발적 이직이고 피보험단위기간 180일을 채웠다면 수급자격이 인정될 가능성이 높습니다. 최종 판단은 고용센터의 수급자격 심사로 결정됩니다.';
    }

    var checks = [
      { s: reasonOk ? 'yes' : 'no', m: reasonOk ? '✓' : '✕', t: '<b>이직 사유</b> — ' + (ui.reason === 'involuntary' ? '비자발적 이직(권고사직·해고·계약만료 등)' : ui.reason === 'justified' ? '정당한 사유에 해당(심사 필요)' : '자발적 퇴사 → 원칙적으로 수급 제한') },
      { s: daysOk ? 'yes' : 'no', m: daysOk ? '✓' : '✕', t: '<b>18개월 내 피보험단위기간 180일 이상</b> — ' + (daysOk ? '충족' : '미충족') },
      { s: 'maybe', m: '?', t: '<b>근로 의사·능력과 재취업 활동</b> — 실업인정일마다 구직활동(입사지원·면접 등)을 제출해야 지급됩니다' },
      { s: 'maybe', m: '?', t: '<b>고용보험 피보험자였는지</b> — 2027년부터는 월 근로시간 60시간 기준이 월 보수 기준으로 바뀌므로, 초단시간 근로자는 적용 여부를 확인해야 합니다' }
    ];
    $('#ui-checks').innerHTML = checks.map(function (c) {
      return '<li class="' + c.s + '"><span class="m">' + c.m + '</span><span>' + c.t + '</span></li>';
    }).join('');

    var steps = [
      '1일 평균임금: 3개월 급여 ' + won(payMon * 3) + ' ÷ 91.25일 = ' + won(avgDaily) + ' (원 미만 버림)',
      '기초일액: 평균임금 ' + won(avgDaily) + (avgDaily > baseCap ? ' → 상한 ' + won(baseCap) + ' 적용' : ' (상한 ' + won(baseCap) + ' 이하)') + ' = ' + won(baseDaily),
      '구직급여일액: 기초일액 × 60% = ' + won(raw),
      '상한 ' + won(capDaily) + ', 하한 ' + won(floorDaily) + ' (최저임금 ' + won(D.minWage.hourly) + ' × 80% × ' + hpd + '시간) → 적용 결과 ' + won(daily) + (usedFloor ? ' (하한액 적용)' : ''),
      '소정급여일수: ' + row.years + ' · 만 50세 ' + (ui.age === 'over' ? '이상' : '미만') + ' → ' + days + '일',
      '총 예상액: ' + won(daily) + ' × ' + days + '일 = ' + won(daily * days) + ' (7일 대기기간은 지급일수에 포함되지 않습니다)'
    ];
    $('#ui-steps').innerHTML = steps.map(function (s) { return '<li>' + s + '</li>'; }).join('');

    if (ui.cap === 'now' && floorDaily > D.unemployment.dailyCap) {
      $('#ui-warn').innerHTML = '<b>2027년에는 하한액(' + won(floorDaily) + ')이 현행 상한액(' + won(D.unemployment.dailyCap) +
        ')보다 큽니다.</b> 고용보험법 제46조②에 따라 60% 금액이 하한액보다 낮으면 하한액을 지급하므로, 현행 시행령 그대로면 결과가 하한액에 붙습니다. ' +
        '정부 개편안(상한액 = 하한액 × 103%, 계산값 ' + won(D.unemployment.capLinked) + ')이 시행되면 상한을 선택해 확인하세요.';
    } else {
      $('#ui-warn').innerHTML = '<b>상한액 연동은 아직 확정이 아닙니다.</b> 하한액의 103%로 정하는 시행령 개정안은 2026년 9월 22일~11월 2일 입법예고됐고, ' +
        '부칙 시행일은 2027년 1월 1일이지만 공포 전입니다. 공포되면 상한액은 ' + won(D.unemployment.capLinked) + '이 됩니다.';
    }
  }

  function initUi() {
    var sel = $('#ui-years');
    sel.innerHTML = D.unemployment.table.map(function (r, i) {
      return '<option value="' + i + '"' + (i === 2 ? ' selected' : '') + '>' + r.years + '</option>';
    }).join('');

    [['[data-days180]', 'days180'], ['[data-age]', 'age'], ['[data-cap]', 'cap']].forEach(function (pair) {
      $$(pair[0]).forEach(function (b) {
        b.addEventListener('click', function () {
          ui[pair[1]] = b.getAttribute(pair[0].slice(1, -1));
          $$(pair[0]).forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
          calcUi();
        });
      });
    });
    $('#ui-reason').addEventListener('change', function () { ui.reason = this.value; calcUi(); });
    ['#ui-pay', '#ui-hpd', '#ui-years'].forEach(function (s) {
      $(s).addEventListener('input', calcUi);
      $(s).addEventListener('change', calcUi);
    });

    $('#ui-table-body').innerHTML = D.unemployment.table.map(function (r, i) {
      return '<tr' + (i === 2 ? ' class="sum"' : '') + '><td>' + r.years + '</td><td class="num">' + r.under50 + '일</td><td class="num">' + r.over50 + '일</td></tr>';
    }).join('');

    calcUi();
  }

  /* ---------------------------------------------------------
     섹션 점프 하이라이트
  --------------------------------------------------------- */
  function initJump() {
    var links = $$('.sl-jump a');
    var map = {};
    links.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
    if (!('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          links.forEach(function (a) { a.classList.remove('on'); });
          var a = map[e.target.id];
          if (a) a.classList.add('on');
        }
      });
    }, { rootMargin: '-70px 0px -60% 0px', threshold: 0 });
    Object.keys(map).forEach(function (id) {
      var el = document.getElementById(id);
      if (el) io.observe(el);
    });
  }

  function boot() {
    /* 국가별 페이지(/en/ /zh/ /ja/)는 intl-salary.js 가 그 나라 임금·세금으로 그립니다. */
    if (!/^ko/i.test(document.documentElement.getAttribute('lang') || 'ko')) return;
    initPay();
    initLeave();
    initNps();
    initUi();
    initJump();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
