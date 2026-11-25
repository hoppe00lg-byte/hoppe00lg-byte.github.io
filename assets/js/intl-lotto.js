/* =========================================================
   INSIGHT BRIEF — 국가별 로또 번호 생성기 (/en/ /zh/ /ja/)
   · 미국: Powerball(5/69 + 1/26) · Mega Millions(5/70 + 1/25)
   · 일본: ロト6(6/43) · ロト7(7/37) · ミニロト(5/31)
   · 중국: 双色球(红6/33 + 蓝1/16) · 超级大乐透(前5/35 + 后2/12)
   한국어 페이지에서는 아무 일도 하지 않습니다(lotto.js 가 그대로 동작).
   추첨 결과·당첨번호는 만들지 않습니다. 규칙과 확률만 실제 값으로 계산합니다.
   ========================================================= */
(function () {
  'use strict';

  var I = window.IB_INTL;
  var wrap = document.querySelector('.lt-wrap');
  if (!I || !wrap) return;
  var L = I.lang;
  /* 광고 지면은 그대로 옮겨 옵니다(한국어 페이지와 같은 자리). */
  var ADS = Array.prototype.slice.call(wrap.querySelectorAll('.lt-ad'));
  function adHTML(i) { return ADS[i] ? ADS[i].outerHTML : ''; }

  var GAMES = {
    en: [
      {
        id: 'powerball', name: 'Powerball', tag: 'US · Multi-state',
        main: { n: 5, max: 69 }, special: { n: 1, max: 26, label: 'Powerball' },
        rules: 'Pick 5 numbers from 1–69, plus 1 Powerball from 1–26.',
        odds: [['5 + Powerball', 292201338], ['5', 11688054], ['4 + Powerball', 913129],
          ['4', 36525], ['3 + Powerball', 14494], ['3', 580]],
        url: 'https://www.powerball.com/', urlName: 'powerball.com'
      },
      {
        id: 'megamillions', name: 'Mega Millions', tag: 'US · Multi-state',
        main: { n: 5, max: 70 }, special: { n: 1, max: 25, label: 'Mega Ball' },
        rules: 'Pick 5 numbers from 1–70, plus 1 Mega Ball from 1–25.',
        odds: [['5 + Mega Ball', 302575350], ['5', 12607306], ['4 + Mega Ball', 931001],
          ['4', 38792], ['3 + Mega Ball', 14547], ['3', 606]],
        url: 'https://www.megamillions.com/', urlName: 'megamillions.com'
      }
    ],
    ja: [
      {
        id: 'loto6', name: 'ロト6', tag: '日本 · 全国自治宝くじ',
        main: { n: 6, max: 43 }, special: null,
        rules: '1〜43から6個を選びます。抽せんは週2回（月曜・木曜）。',
        odds: [['1等（6個一致）', 6096454], ['2等（5個＋ボーナス）', 1016076]],
        url: 'https://www.mizuhobank.co.jp/takarakuji/loto/loto6/index.html', urlName: 'みずほ銀行 ロト6'
      },
      {
        id: 'loto7', name: 'ロト7', tag: '日本 · 全国自治宝くじ',
        main: { n: 7, max: 37 }, special: null,
        rules: '1〜37から7個を選びます。抽せんは毎週金曜。',
        odds: [['1等（7個一致）', 10295472], ['2等（6個一致）', 733601]],
        url: 'https://www.mizuhobank.co.jp/takarakuji/loto/loto7/index.html', urlName: 'みずほ銀行 ロト7'
      },
      {
        id: 'miniloto', name: 'ミニロト', tag: '日本 · 全国自治宝くじ',
        main: { n: 5, max: 31 }, special: null,
        rules: '1〜31から5個を選びます。抽せんは毎週火曜。',
        odds: [['1等（5個一致）', 169911], ['2等（4個一致）', 3967]],
        url: 'https://www.mizuhobank.co.jp/takarakuji/loto/miniloto/index.html', urlName: 'みずほ銀行 ミニロト'
      }
    ],
    zh: [
      {
        id: 'ssq', name: '双色球', tag: '中国 · 福利彩票',
        main: { n: 6, max: 33 }, special: { n: 1, max: 16, label: '蓝球' },
        rules: '红球 1–33 中选 6 个，蓝球 1–16 中选 1 个。每周二、四、日开奖。',
        odds: [['一等奖（6红+1蓝）', 17721088], ['二等奖（6红）', 1181406]],
        url: 'https://www.cwl.gov.cn/', urlName: '中国福利彩票'
      },
      {
        id: 'dlt', name: '超级大乐透', tag: '中国 · 体育彩票',
        main: { n: 5, max: 35 }, special: { n: 2, max: 12, label: '后区' },
        rules: '前区 1–35 中选 5 个，后区 1–12 中选 2 个。每周一、三、六开奖。',
        odds: [['一等奖（5+2）', 21425712], ['二等奖（5+1）', 357095]],
        url: 'https://www.lottery.gov.cn/', urlName: '中国体育彩票'
      }
    ]
  }[L];

  var D = {
    en: {
      kicker: 'FREE TOOL · NUMBER GENERATOR',
      h1: ['Powerball & Mega Millions', 'Number Generator'],
      dek: 'Draw 1–5 plays for the two big US jackpot games, with the real game rules built in. Numbers are generated inside your browser and never sent anywhere.',
      badges: ['Free', 'No sign-up', 'No server storage', 'Real game rules'],
      pick: '1. Game',
      plays: '2. Plays per draw', playHint: 'Up to 5 at a time',
      mode: '3. How numbers are drawn',
      modeRandom: 'Pure random',
      modeRandomHint: 'Every combination in the pool has exactly the same chance.',
      modeBalanced: 'Balanced spread',
      modeBalancedHint: 'Redraws until odd/even and low/high split is close to even — still random, just tidier.',
      fixed: '4. Lock numbers (optional)',
      fixedHint: 'Tap a number to lock it into every play',
      lock: 'Locked', clear: 'Clear',
      run: 'Generate numbers',
      result: 'Your plays',
      copy: 'Copy all', share: 'Share', copyOne: 'Copy play',
      copied: 'Copied.', copyFail: 'Copy failed — press and hold the numbers to copy.',
      oddsTitle: 'What the odds actually are',
      oddsNote: 'Every combination is equally likely on every draw. Past results do not change the next one.',
      tier: 'Match', chance: 'Chance per play',
      rulesTitle: 'Game rules',
      taxTitle: 'Taxes and claiming',
      tax: 'US federal withholding is 24% on winnings over $5,000, and the top federal rate on very large jackpots is 37%. State tax varies — a handful of states levy none. Jackpots are advertised as a 30-year annuity; the cash option is smaller. Claim periods differ by state (typically 90 days to 1 year).',
      playTitle: 'Play responsibly',
      play: 'Lottery play is not investing. Set a limit before you buy, and never spend money you need. If gambling stops being fun, the National Problem Gambling Helpline (1-800-426-2537) is free and confidential.',
      srcTitle: 'Check results at the official source',
      srcNote: 'This tool does not show draw results: US jackpot numbers come from the state lotteries and change with every draw, so we link to the official sites instead of showing numbers we cannot verify.',
      official: 'Official results',
      hint: 'Numbers are drawn locally in your browser. Nothing is stored or transmitted.',
      errPool: 'You locked too many numbers — leave at least one slot open.',
      combo: 'Combinations'
    },
    ja: {
      kicker: '無料ツール · 数字選択式宝くじ',
      h1: ['ロト6・ロト7・ミニロト', '数字生成ツール'],
      dek: '日本の数字選択式宝くじ3種類のルールをそのまま組み込み、1〜5口を一度に作れます。数字はブラウザ内で作られ、どこにも送信されません。',
      badges: ['無料', '登録不要', 'サーバー保存なし', '公式ルール準拠'],
      pick: '1. くじの種類',
      plays: '2. 口数', playHint: '一度に5口まで',
      mode: '3. 数字の選び方',
      modeRandom: '完全ランダム',
      modeRandomHint: 'すべての組み合わせを同じ確率で選びます。',
      modeBalanced: 'バランス調整',
      modeBalancedHint: '奇数・偶数、前半・後半が偏らないまで引き直します（ランダムであることに変わりはありません）。',
      fixed: '4. 固定数字（任意）',
      fixedHint: 'タップした数字は毎口に必ず入ります',
      lock: '固定', clear: '解除',
      run: '数字を作る',
      result: '生成結果',
      copy: 'まとめてコピー', share: '共有', copyOne: 'コピー',
      copied: 'コピーしました。', copyFail: 'コピーできませんでした。数字を長押ししてコピーしてください。',
      oddsTitle: '当せん確率（実際の値）',
      oddsNote: 'どの組み合わせも毎回同じ確率です。過去の結果が次の抽せんに影響することはありません。',
      tier: '一致', chance: '1口あたりの確率',
      rulesTitle: 'ルール',
      taxTitle: '税金と受け取り',
      tax: '日本の宝くじの当せん金は所得税・住民税ともに非課税です（所得税法9条13号）。当せん金を受け取れるのは抽せん日から1年間で、過ぎると時効になります。',
      playTitle: '無理のない範囲で',
      play: '宝くじは娯楽です。買う前に上限を決め、生活費には手を付けないでください。',
      srcTitle: '結果は公式サイトで確認',
      srcNote: 'このページは抽せん結果を表示しません。当せん番号は主催者が毎回発表するもので、確認できない数字を載せない方針です。',
      official: '公式の当せん番号',
      hint: '数字はブラウザ内で作られます。保存も送信もしません。',
      errPool: '固定した数字が多すぎます。空きを作ってください。',
      combo: '組み合わせ'
    },
    zh: {
      kicker: '免费工具 · 选号器',
      h1: ['双色球 · 超级大乐透', '选号工具'],
      dek: '按官方玩法规则一次生成 1–5 注号码。号码只在您的浏览器内生成，不会上传或保存。',
      badges: ['免费', '无需注册', '不上传号码', '官方玩法规则'],
      pick: '1. 彩种',
      plays: '2. 注数', playHint: '一次最多 5 注',
      mode: '3. 选号方式',
      modeRandom: '完全随机',
      modeRandomHint: '每个组合的概率完全相同。',
      modeBalanced: '均衡分布',
      modeBalancedHint: '重新抽取直到奇偶、大小分布接近均衡，仍然是随机号码。',
      fixed: '4. 固定号码（可选）',
      fixedHint: '点击号码，每一注都会包含它',
      lock: '固定', clear: '清除',
      run: '生成号码',
      result: '生成结果',
      copy: '全部复制', share: '分享', copyOne: '复制',
      copied: '已复制。', copyFail: '复制失败，请长按号码手动复制。',
      oddsTitle: '中奖概率（实际计算值）',
      oddsNote: '每期每个组合的概率都相同，历史结果不会影响下一期。',
      tier: '中奖条件', chance: '单注概率',
      rulesTitle: '玩法规则',
      taxTitle: '税收与兑奖',
      tax: '单注中奖金额超过 1 万元时，需按 20% 缴纳个人偶然所得税（由兑奖机构代扣代缴）。兑奖期限为开奖之日起 60 个自然日，逾期视为弃奖。',
      playTitle: '理性购彩',
      play: '彩票是娱乐，不是投资。购买前先定好预算，不要动用生活必需的钱。',
      srcTitle: '开奖结果请查官方渠道',
      srcNote: '本页不显示开奖结果：开奖号码由发行机构每期公布，我们不展示无法核实的数字。',
      official: '官方开奖结果',
      hint: '号码在浏览器内生成，不保存、不上传。',
      errPool: '固定的号码太多了，请至少留出一个空位。',
      combo: '组合数'
    }
  }[L];

  var state = { game: GAMES[0], plays: 5, mode: 'random', locked: [], results: [] };

  function $(s, r) { return (r || document).querySelector(s); }
  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  function combo(n, k) {
    var r = 1;
    for (var i = 1; i <= k; i++) r = r * (n - k + i) / i;
    return Math.round(r);
  }
  function randInt(max) { return Math.floor(Math.random() * max) + 1; }
  function pickUnique(count, max, locked) {
    var pool = [], i;
    for (i = 1; i <= max; i++) if (locked.indexOf(i) < 0) pool.push(i);
    var out = locked.slice();
    while (out.length < count && pool.length) {
      out.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
    }
    return out.sort(function (a, b) { return a - b; });
  }
  function spreadOK(nums, max) {
    var odd = 0, high = 0;
    nums.forEach(function (n) { if (n % 2) odd++; if (n > max / 2) high++; });
    var half = nums.length / 2;
    return Math.abs(odd - half) <= 0.6 && Math.abs(high - half) <= 0.6;
  }
  function drawPlay(game) {
    var main, tries = 0;
    do {
      main = pickUnique(game.main.n, game.main.max, state.locked);
      tries++;
    } while (state.mode === 'balanced' && !spreadOK(main, game.main.max) && tries < 120);
    var special = [];
    if (game.special) {
      for (var s = 0; s < game.special.n; s++) {
        var n, dup;
        do { n = randInt(game.special.max); dup = special.indexOf(n) >= 0; } while (dup);
        special.push(n);
      }
      special.sort(function (a, b) { return a - b; });
    }
    return { main: main, special: special };
  }

  function ball(n, cls) {
    var c = n <= 10 ? 'b1' : n <= 20 ? 'b2' : n <= 30 ? 'b3' : n <= 40 ? 'b4' : 'b5';
    return '<span class="ball ' + c + (cls ? ' ' + cls : '') + '">' + pad(n) + '</span>';
  }

  function playText(p) {
    var main = p.main.map(pad).join(' ');
    return p.special.length ? main + ' + ' + p.special.map(pad).join(' ') : main;
  }

  function copyText(text, done) {
    function fallback() {
      var ta = document.createElement('textarea');
      ta.value = text; ta.setAttribute('readonly', '');
      ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
      document.body.removeChild(ta);
      if (ok) done(); else toast(D.copyFail);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, fallback);
    } else fallback();
  }

  function toast(msg) {
    var el = $('#lt-toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'lt-toast'; el.className = 'lt-toast'; el.setAttribute('role', 'status');
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.classList.add('on');
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { el.classList.remove('on'); }, 2200);
  }

  /* ---------------- 화면 ---------------- */
  function tabsHTML() {
    return '<div class="il-tabs" role="tablist" aria-label="' + esc(D.pick) + '">' +
      GAMES.map(function (g) {
        return '<button type="button" role="tab" class="il-tab' + (g.id === state.game.id ? ' is-on' : '') +
          '" data-game="' + g.id + '" aria-selected="' + (g.id === state.game.id) + '">' +
          '<b>' + esc(g.name) + '</b><small>' + esc(g.rulesShort || rulesShort(g)) + '</small></button>';
      }).join('') + '</div>';
  }

  function rulesShort(g) {
    return g.main.n + '/' + g.main.max + (g.special ? ' + ' + g.special.n + '/' + g.special.max : '');
  }

  function gridHTML() {
    var g = state.game, out = '';
    for (var n = 1; n <= g.main.max; n++) {
      out += '<button type="button" class="il-num' + (state.locked.indexOf(n) >= 0 ? ' is-lock' : '') +
        '" data-n="' + n + '" aria-pressed="' + (state.locked.indexOf(n) >= 0) + '">' + pad(n) + '</button>';
    }
    return out;
  }

  function resultsHTML() {
    if (!state.results.length) return '';
    return '<div class="lt-results-head"><div><h3>' + esc(D.result) + '</h3>' +
      '<span class="ts">' + esc(state.game.name) + ' · ' + state.plays + ' ×</span></div>' +
      '<div class="lt-acts">' +
      '<button class="lt-btn" type="button" id="il-copy-all">' + esc(D.copy) + '</button>' +
      '<button class="lt-btn alt" type="button" id="il-share">' + esc(D.share) + '</button>' +
      '</div></div>' +
      '<div class="lt-games">' + state.results.map(function (p, i) {
        var line = p.main.map(function (n) { return ball(n, 'sm'); }).join('');
        if (p.special.length) {
          line += '<span class="lt-bonus"><span class="lt-plus" aria-hidden="true">+</span>' +
            p.special.map(function (n) { return ball(n, 'bonus sm'); }).join('') + '</span>';
        }
        return '<div class="lt-game"><div class="line"><span class="idx">' +
          (L === 'ja' ? (i + 1) + '口' : L === 'zh' ? '第' + (i + 1) + '注' : 'Play ' + (i + 1)) +
          '</span>' + line + '</div>' +
          '<button class="copy" type="button" data-copy="' + i + '" aria-label="' + esc(D.copyOne) + ' ' + (i + 1) + '">' +
          '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2"></rect>' +
          '<path d="M6 15V6a2 2 0 0 1 2-2h8"></path></svg></button></div>';
      }).join('') + '</div>';
  }

  function oddsHTML() {
    var g = state.game;
    return '<section class="lt-stats"><div class="lt-sec-head"><h2>' + esc(D.oddsTitle) + '</h2>' +
      '<span class="mono">' + esc(g.name) + '</span></div>' +
      '<table class="il-tbl"><thead><tr><th>' + esc(D.tier) + '</th><th class="num">' + esc(D.chance) + '</th></tr></thead><tbody>' +
      g.odds.map(function (r) {
        return '<tr><td>' + esc(r[0]) + '</td><td class="num">1 / ' + I.group(r[1]) + '</td></tr>';
      }).join('') +
      '</tbody></table>' +
      '<p class="lt-stats-note">' + esc(D.oddsNote) + ' · ' + esc(D.combo) + ' = ' + I.group(combo(g.main.max, g.main.n) * (g.special ? combo(g.special.max, g.special.n) : 1)) + '</p></section>';
  }

  function render() {
    var g = state.game;
    wrap.innerHTML =
      '<div class="lt-head"><span class="kicker">' + esc(D.kicker) + '</span>' +
      '<h1>' + esc(D.h1[0]) + '<br>' + esc(D.h1[1]) + '</h1>' +
      '<p class="dek">' + esc(D.dek) + '</p>' +
      '<div class="lt-badges">' + D.badges.map(function (b) { return '<span>' + esc(b) + '</span>'; }).join('') + '</div></div>' +
      adHTML(0) +

      '<section class="lt-panel" aria-labelledby="il-gen-title">' +
      '<div class="lt-panel-head"><h2 id="il-gen-title">' + esc(D.pick) + '</h2><span class="mono">STEP 1 → 4</span></div>' +
      '<div class="lt-body">' +
      tabsHTML() +
      '<div class="lt-field"><div class="lbl"><span>' + esc(D.plays) + '</span><span class="hint">' + esc(D.playHint) + '</span></div>' +
      '<div class="lt-seg" data-plays role="group">' +
      [1, 2, 3, 4, 5].map(function (n) {
        return '<button type="button" data-plays="' + n + '" aria-pressed="' + (n === state.plays) + '">' + n + '</button>';
      }).join('') + '</div></div>' +

      '<div class="lt-field"><div class="lbl"><span>' + esc(D.mode) + '</span></div>' +
      '<div class="lt-modes" data-mode role="group">' +
      '<button class="lt-mode" type="button" data-mode="random" aria-pressed="' + (state.mode === 'random') + '">' +
      '<span class="dotbox" aria-hidden="true"></span><span><b>' + esc(D.modeRandom) + '</b><small>' + esc(D.modeRandomHint) + '</small></span></button>' +
      '<button class="lt-mode" type="button" data-mode="balanced" aria-pressed="' + (state.mode === 'balanced') + '">' +
      '<span class="dotbox" aria-hidden="true"></span><span><b>' + esc(D.modeBalanced) + '</b><small>' + esc(D.modeBalancedHint) + '</small></span></button>' +
      '</div></div>' +

      '<details class="lt-cond" id="il-cond"><summary><span>' + esc(D.fixed) + '</span>' +
      '<span class="chips"><span class="chip' + (state.locked.length ? ' on' : '') + '" id="il-chip">' + esc(D.lock) + ' ' + state.locked.length + '</span></span>' +
      '<span class="arrow" aria-hidden="true">▼</span></summary>' +
      '<div class="lt-cond-body"><p class="lt-cond-note" style="margin-top:0">' + esc(D.fixedHint) + '</p>' +
      '<div class="lt-grid il-grid" id="il-grid">' + gridHTML() + '</div>' +
      '<p class="lt-cond-note"><a href="#" id="il-clear">' + esc(D.clear) + '</a></p></div></details>' +

      '<button class="lt-run" type="button" id="il-run">' + esc(D.run) + '</button>' +
      '<p class="lt-error" id="il-error" role="alert"></p>' +
      '<div class="lt-results" id="il-results"' + (state.results.length ? '' : ' hidden') + ' aria-live="polite">' + resultsHTML() + '</div>' +
      '</div></section>' +

      oddsHTML() +
      adHTML(1) +

      '<section class="lt-help"><h2>' + esc(D.rulesTitle) + '</h2>' +
      '<p><b>' + esc(g.name) + '</b> — ' + esc(g.rules) + '</p>' +
      '<h2 style="margin-top:26px">' + esc(D.taxTitle) + '</h2>' +
      '<p>' + esc(D.tax) + '</p>' +
      '<h2 style="margin-top:26px">' + esc(D.srcTitle) + '</h2>' +
      '<p>' + esc(D.srcNote) + '</p>' +
      '<p><a href="' + esc(g.url) + '" target="_blank" rel="noopener noreferrer">' + esc(D.official) + ' — ' + esc(g.urlName) + '</a></p>' +
      '<h2 style="margin-top:26px">' + esc(D.playTitle) + '</h2>' +
      '<p>' + esc(D.play) + '</p>' +
      '<p style="font-size:13px;color:var(--muted)">' + esc(D.hint) + '</p></section>' +

      '<style>' +
      '.il-tabs{display:flex;gap:8px;flex-wrap:wrap;margin:0 0 18px}' +
      '.il-tab{flex:1 1 150px;text-align:left;border:1px solid rgba(23,20,15,.16);background:#fff;border-radius:10px;padding:11px 13px;cursor:pointer;font:inherit;color:inherit}' +
      '.il-tab b{display:block;font-size:15px;letter-spacing:-.01em}.il-tab small{display:block;margin-top:3px;font-size:11px;color:#6b655c;letter-spacing:.02em}' +
      '.il-tab.is-on{border-color:#b3261e;box-shadow:inset 0 0 0 1px #b3261e;background:#fdf6f4}' +
      '.il-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(38px,1fr));gap:6px;margin:12px 0}' +
      '.il-num{aspect-ratio:1;border:1px solid rgba(23,20,15,.14);background:#fff;border-radius:8px;font:inherit;font-size:13px;cursor:pointer;color:inherit}' +
      '.il-num.is-lock{background:#17140f;color:#fff;border-color:#17140f}' +
      '.il-tbl{width:100%;border-collapse:collapse;margin-top:10px;font-size:14px}' +
      '.il-tbl th,.il-tbl td{border-bottom:1px solid rgba(23,20,15,.12);padding:9px 6px;text-align:left}' +
      '.il-tbl .num{text-align:right;font-family:var(--mono,monospace);white-space:nowrap}' +
      '</style>';

    bind();
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  function bind() {
    var tabs = wrap.querySelectorAll('.il-tab');
    Array.prototype.forEach.call(tabs, function (b) {
      b.addEventListener('click', function () {
        var id = b.getAttribute('data-game');
        state.game = GAMES.filter(function (g) { return g.id === id; })[0] || GAMES[0];
        state.locked = state.locked.filter(function (n) { return n <= state.game.main.max; });
        state.results = [];
        render();
      });
    });

    Array.prototype.forEach.call(wrap.querySelectorAll('[data-plays] button'), function (b) {
      b.addEventListener('click', function () {
        state.plays = +b.getAttribute('data-plays');
        Array.prototype.forEach.call(wrap.querySelectorAll('[data-plays] button'), function (x) {
          x.setAttribute('aria-pressed', String(x === b));
        });
        if (state.results.length) run();
      });
    });

    Array.prototype.forEach.call(wrap.querySelectorAll('[data-mode] button'), function (b) {
      b.addEventListener('click', function () {
        state.mode = b.getAttribute('data-mode');
        Array.prototype.forEach.call(wrap.querySelectorAll('[data-mode] button'), function (x) {
          x.setAttribute('aria-pressed', String(x === b));
        });
      });
    });

    wrap.querySelector('#il-grid').addEventListener('click', function (e) {
      var b = e.target.closest('button[data-n]');
      if (!b) return;
      var n = +b.getAttribute('data-n'), i = state.locked.indexOf(n);
      if (i >= 0) state.locked.splice(i, 1);
      else {
        if (state.locked.length >= state.game.main.n) { toast(D.errPool); return; }
        state.locked.push(n);
      }
      b.classList.toggle('is-lock');
      b.setAttribute('aria-pressed', String(state.locked.indexOf(n) >= 0));
      var chip = wrap.querySelector('#il-chip');
      chip.textContent = D.lock + ' ' + state.locked.length;
      chip.className = 'chip' + (state.locked.length ? ' on' : '');
    });

    wrap.querySelector('#il-clear').addEventListener('click', function (e) {
      e.preventDefault();
      state.locked = [];
      render();
    });

    wrap.querySelector('#il-run').addEventListener('click', run);

    var host = wrap.querySelector('#il-results');
    host.addEventListener('click', function (e) {
      var b = e.target.closest('[data-copy]');
      if (!b) return;
      var i = +b.getAttribute('data-copy');
      copyText(playText(state.results[i]), function () { toast(D.copied); });
    });
    var all = wrap.querySelector('#il-copy-all');
    if (all) all.addEventListener('click', function () {
      copyText(state.results.map(playText).join('\n'), function () { toast(D.copied); });
    });
    var sh = wrap.querySelector('#il-share');
    if (sh) sh.addEventListener('click', function () {
      var title = D.h1[0] + ' ' + D.h1[1];
      var text = state.game.name + '\n' + state.results.map(playText).join('\n');
      if (navigator.share) {
        navigator.share({ title: title, text: text, url: location.href }).catch(function () {});
      } else {
        copyText(text + '\n' + location.href, function () { toast(D.copied); });
      }
    });
  }

  function run() {
    var err = wrap.querySelector('#il-error');
    err.classList.remove('on');
    if (state.locked.length >= state.game.main.n) {
      err.textContent = D.errPool;
      err.classList.add('on');
      return;
    }
    state.results = [];
    for (var i = 0; i < state.plays; i++) state.results.push(drawPlay(state.game));
    var host = wrap.querySelector('#il-results');
    host.innerHTML = resultsHTML();
    host.hidden = false;
    /* 결과 블록의 복사 버튼은 위임으로 처리되므로 다시 묶지 않습니다. */
    var all2 = wrap.querySelector('#il-copy-all');
    if (all2) all2.onclick = function () {
      copyText(state.results.map(playText).join('\n'), function () { toast(D.copied); });
    };
    var sh2 = wrap.querySelector('#il-share');
    if (sh2) sh2.onclick = function () {
      var text = state.game.name + '\n' + state.results.map(playText).join('\n');
      if (navigator.share) navigator.share({ title: D.h1.join(' '), text: text, url: location.href }).catch(function () {});
      else copyText(text + '\n' + location.href, function () { toast(D.copied); });
    };
    try {
      host.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } catch (e) { /* noop */ }
  }

  render();
})();
