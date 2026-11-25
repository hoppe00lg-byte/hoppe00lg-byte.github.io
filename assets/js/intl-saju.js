/* =========================================================
   INSIGHT BRIEF — 국가별 사주·운세 (/en/ /zh/ /ja/)
   · 엔진(saju-engine.js)이 계산한 사주팔자를 그 나라 전통 용어로 풀이합니다.
     - en: Four Pillars of Destiny (BaZi) — 天干·地支 한자 + 영문, 오행 밸런스
     - ja: 四柱推命 — 干支·通変星·十二運·五行バランス
     - zh: 八字命理 — 四柱八字·天干地支·十神·五行喜用
   한국어 페이지에서는 동작하지 않습니다(saju.js 가 그대로 동작).
   ========================================================= */
(function () {
  'use strict';
  var I = window.IB_INTL;
  var wrap = document.querySelector('.sj-main .container') || document.querySelector('.sj-main');
  var E = window.SAJU;
  if (!I || !wrap || !E) return;
  var L = I.lang;

  var GAN_EN = ['Jia', 'Yi', 'Bing', 'Ding', 'Wu', 'Ji', 'Geng', 'Xin', 'Ren', 'Gui'];
  var GAN_EN_HINT = ['Yang Wood', 'Yin Wood', 'Yang Fire', 'Yin Fire', 'Yang Earth',
    'Yin Earth', 'Yang Metal', 'Yin Metal', 'Yang Water', 'Yin Water'];
  var ZHI_EN = ['Zi', 'Chou', 'Yin', 'Mao', 'Chen', 'Si', 'Wu', 'Wei', 'Shen', 'You', 'Xu', 'Hai'];
  var ZHI_EN_ANIMAL = ['Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake', 'Horse', 'Goat', 'Monkey', 'Rooster', 'Dog', 'Pig'];
  var GAN_JA = ['きのえ', 'きのと', 'ひのえ', 'ひのと', 'つちのえ', 'つちのと', 'かのえ', 'かのと', 'みずのえ', 'みずのと'];
  var ZHI_JA = ['ね', 'うし', 'とら', 'う', 'たつ', 'み', 'うま', 'ひつじ', 'さる', 'とり', 'いぬ', 'い'];
  var ELEM = {
    en: ['Wood', 'Fire', 'Earth', 'Metal', 'Water'],
    ja: ['木', '火', '土', '金', '水'],
    zh: ['木', '火', '土', '金', '水']
  }[L];
  var ELEM_HANJA = ['木', '火', '土', '金', '水'];

  /* 한국어 십신 → 언어별 표기 */
  var GODS = {
    en: { '비견': 'Companion', '겁재': 'Rob Wealth', '식신': 'Eating God', '상관': 'Hurting Officer', '편재': 'Indirect Wealth', '정재': 'Direct Wealth', '편관': 'Seven Killings', '정관': 'Direct Officer', '편인': 'Indirect Resource', '정인': 'Direct Resource' },
    ja: { '비견': '比肩', '겁재': '劫財', '식신': '食神', '상관': '傷官', '편재': '偏財', '정재': '正財', '편관': '偏官', '정관': '正官', '편인': '偏印', '정인': '正印' },
    zh: { '비견': '比肩', '겁재': '劫財', '식신': '食神', '상관': '傷官', '편재': '偏財', '정재': '正財', '편관': '七殺', '정관': '正官', '편인': '偏印', '정인': '正印' }
  }[L];
  var GODS_GROUP = { '비견': 'self', '겁재': 'self', '식신': 'output', '상관': 'output', '편재': 'wealth', '정재': 'wealth', '편관': 'officer', '정관': 'officer', '편인': 'resource', '정인': 'resource' };

  /* 십이운 — 陽干은 순행, 陰干은 역행 */
  var STAGE_START = [11, 6, 2, 9, 2, 9, 5, 0, 8, 3];
  var STAGES = {
    en: ['Birth', 'Bath', 'Cap', 'Office', 'Peak', 'Decline', 'Illness', 'Death', 'Tomb', 'Severance', 'Conception', 'Nurture'],
    ja: ['長生', '沐浴', '冠帯', '建禄', '帝旺', '衰', '病', '死', '墓', '絶', '胎', '養'],
    zh: ['長生', '沐浴', '冠帯', '臨官', '帝旺', '衰', '病', '死', '墓', '絶', '胎', '養']
  }[L];

  function stageOf(stemIdx, branchIdx) {
    var start = STAGE_START[stemIdx];
    var idx = stemIdx % 2 === 0 ? (branchIdx - start + 12) % 12 : (start - branchIdx + 12) % 12;
    return idx;
  }

  var D = {
    en: {
      kicker: 'FREE TOOL · FOUR PILLARS',
      h1: 'Four Pillars of Destiny<br>BaZi chart & five elements',
      dek: 'Enter a birth date and the chart is built from the solar terms: the year, month, day and hour pillars, the ten gods around your day master, and the balance of the five elements.',
      badges: ['Free', 'No sign-up', 'Calculated in your browser', 'Solar-term month pillar'],
      birth: 'Birth date (solar calendar)',
      year: 'Year', month: 'Month', day: 'Day', hour: 'Hour of birth', unknown: 'Unknown',
      gender: 'Gender', male: 'Male', female: 'Female',
      run: 'Build my chart',
      err: 'Please choose the year, month and day of birth.',
      errRange: 'This tool calculates births from 1930 to 2026.',
      chartTitle: 'Four Pillars',
      hourPillar: 'Hour', dayPillar: 'Day', monthPillar: 'Month', yearPillar: 'Year',
      stem: 'Heavenly stem', branch: 'Earthly branch', tenGod: 'Ten god', stage: 'Life stage',
      dayMaster: 'Day master',
      dmNote: 'The day stem is you — the element everything else is read against.',
      balance: 'Five-element balance',
      balanceNote: 'Counted across all eight characters (six when the hour is unknown).',
      yong: 'Favourable element', yongNote: 'The element that balances a chart that leans too far one way.',
      self: 'Strength of the day master',
      strength: { 신강: 'Strong', 신약: 'Weak', 중화: 'Balanced' },
      yearTitle: '2027 — Ding Wei year (丁未)',
      yearLead: 'The 2027 stem is Ding (yin fire) and the branch is Wei (earth, goat).',
      advice: 'What it tends to mean',
      note: 'Four Pillars is a traditional reading, not a prediction of facts. Treat it as a way to think about tendencies, and decide with your own judgement.',
      calc: 'How this is calculated',
      calcBody: 'The year pillar changes at Ipchun (the start of spring, around 4 February), not on 1 January. The month pillar follows the 24 solar terms, so a birth near a term boundary can shift the month. The day pillar comes from the Julian day number, and the hour pillar from the two-hour branch of the birth time. All of it runs in your browser; nothing is sent anywhere.',
      hourUnknown: 'Hour unknown — the hour pillar is left empty and the month boundary is judged at noon.',
      godHelp: {
        self: 'Self and peers: your own drive, competitors, partners on equal footing.',
        output: 'Output: expression, craft, teaching, work that carries your name.',
        wealth: 'Wealth: money, results, what you can hold and manage.',
        officer: 'Officer: position, responsibility, rules, the people who answer to you or you to them.',
        resource: 'Resource: study, support, documents, the backing you receive.'
      },
      spread: 'Element mix',
      elementWords: ['Wood grows, plans and starts', 'Fire warms, shows and persuades', 'Earth settles, holds and mediates', 'Metal cuts, decides and finishes', 'Water flows, thinks and connects']
    },
    ja: {
      kicker: '無料ツール · 四柱推命',
      h1: '四柱推命<br>命式と五行バランス',
      dek: '生年月日から、節気を基準に年柱・月柱・日柱・時柱を立て、日干を中心に通変星と十二運、五行の偏りを出します。',
      badges: ['無料', '登録不要', 'ブラウザ内で計算', '節気基準の月柱'],
      birth: '生年月日（新暦）',
      year: '年', month: '月', day: '日', hour: '出生時刻', unknown: '不明',
      gender: '性別', male: '男性', female: '女性',
      run: '命式を出す',
      err: '生年月日をすべて選んでください。',
      errRange: '1930年〜2026年生まれの方が対象です。',
      chartTitle: '四柱（命式）',
      hourPillar: '時柱', dayPillar: '日柱', monthPillar: '月柱', yearPillar: '年柱',
      stem: '天干', branch: '地支', tenGod: '通変星', stage: '十二運',
      dayMaster: '日干',
      dmNote: '日干が本人を表し、そこからすべての関係を読みます。',
      balance: '五行バランス',
      balanceNote: '八文字（時刻不明なら六文字）で数えた割合です。',
      yong: '用神（喜ぶ五行）', yongNote: '命式の偏りを整える五行です。',
      self: '日干の強弱',
      strength: { 신강: '身強', 신약: '身弱', 중화: '中和' },
      yearTitle: '2027年 丁未（ていび）年',
      yearLead: '2027年の天干は丁（陰の火）、地支は未（土・ひつじ）です。',
      advice: '読み方',
      note: '四柱推命は伝統的な読み方であり、出来事を当てるものではありません。傾向として捉え、判断はご自身で。',
      calc: '計算の基準',
      calcBody: '年柱は1月1日ではなく立春（2月4日ごろ）で切り替わります。月柱は二十四節気で決まるため、節気の境目に近い生まれは月柱が変わる場合があります。日柱はユリウス通日、時柱は出生時刻の二時間区分から出します。計算はすべてブラウザ内で完結します。',
      hourUnknown: '時刻不明のため時柱は空け、月柱の境界は正午で判断しました。',
      godHelp: {
        self: '比劫：自分の意志、競争相手、対等な仲間。',
        output: '食傷：表現、技術、教えること、名義の残る仕事。',
        wealth: '財星：お金、成果、手に入れて管理できるもの。',
        officer: '官星：立場、責任、規則、上下関係。',
        resource: '印星：学び、支え、書類、受け取る後ろ盾。'
      },
      spread: '五行の配分',
      elementWords: ['木は伸び、計画し、始める', '火は照らし、伝え、説得する', '土は受け止め、保ち、仲介する', '金は断ち、決め、仕上げる', '水は流れ、考え、つなぐ']
    },
    zh: {
      kicker: '免费工具 · 八字命理',
      h1: '四柱八字<br>命盘与五行喜用',
      dek: '输入出生时间，按节气排出年柱、月柱、日柱、时柱，以日主为中心列出十神、十二运和五行旺衰。',
      badges: ['免费', '无需注册', '浏览器内计算', '按节气定月柱'],
      birth: '出生日期（公历）',
      year: '年', month: '月', day: '日', hour: '出生时辰', unknown: '不详',
      gender: '性别', male: '男', female: '女',
      run: '排盘',
      err: '请选择出生的年、月、日。',
      errRange: '本工具支持 1930–2026 年出生者。',
      chartTitle: '四柱八字',
      hourPillar: '时柱', dayPillar: '日柱', monthPillar: '月柱', yearPillar: '年柱',
      stem: '天干', branch: '地支', tenGod: '十神', stage: '十二运',
      dayMaster: '日主',
      dmNote: '日干代表本人，其余干支都以此为基准判断。',
      balance: '五行旺衰',
      balanceNote: '按八个字（时辰不详则六个字）统计占比。',
      yong: '喜用五行', yongNote: '用来平衡命局偏枯的五行。',
      self: '日主强弱',
      strength: { 신강: '身强', 신약: '身弱', 중화: '中和' },
      yearTitle: '2027年 丁未年',
      yearLead: '2027年天干为丁（阴火），地支为未（土）。',
      advice: '怎么读',
      note: '八字是传统的思考框架，不是对具体事件的预言。请当作倾向参考，自行判断。',
      calc: '计算依据',
      calcBody: '年柱以立春（约2月4日）为界，不以元旦为界；月柱按二十四节气排定，出生在节气交界附近时月柱可能不同。日柱由儒略日推算，时柱按出生时辰的两小时分段确定。全部在浏览器内完成，不会上传。',
      hourUnknown: '时辰不详，时柱留空，月柱交界按正午判断。',
      godHelp: {
        self: '比劫：自我意志、竞争者、同辈伙伴。',
        output: '食伤：表达、技艺、教学、留名的成果。',
        wealth: '财星：钱财、成果、能掌控的资源。',
        officer: '官星：职位、责任、规则、上下关系。',
        resource: '印星：学习、支持、文书、背后的依靠。'
      },
      spread: '五行分布',
      elementWords: ['木主生发、谋划与开创', '火主光明、表达与说服', '土主承载、守成与调和', '金主决断、收敛与完成', '水主流动、思考与联结']
    }
  }[L];

  /* 일간별 한 줄 성향 — 10천간 */
  var DM = {
    en: [
      'Jia is a tall tree: clear direction, slow to bend, happiest when opening something new.',
      'Yi is grass and vine: soft to look at, hard to uproot, skilled at reading a room.',
      'Bing is the sun: bright, quick to decide, unable to hide what it feels.',
      'Ding is a lamp: quiet warmth, deep focus, a private set of standards.',
      'Wu is a mountain: steady, dependable, slow to move but hard to push over.',
      'Ji is cultivated soil: patient, practical, the one who makes things grow for others.',
      'Geng is raw metal: direct, decisive, blunt enough to cut and to hurt.',
      'Xin is a jewel: precise, sensitive to quality, quietly stubborn about detail.',
      'Ren is a great river: broad, adaptable, carrying more than it shows.',
      'Gui is rain: subtle, intuitive, quietly persistent.'
    ],
    ja: [
      '甲は大木。方向がはっきりしていて、簡単には折れません。新しく始める場が向いています。',
      '乙は草や蔓。見た目は柔らかくても、根は抜けにくい粘りがあります。',
      '丙は太陽。明るく判断が速く、隠しごとが苦手です。',
      '丁は灯火。静かな熱と集中力があり、自分の基準を大切にします。',
      '戊は山。どっしりして動かない代わりに、簡単には崩れません。',
      '己は畑の土。実務的で面倒見がよく、人を育てる側に回ります。',
      '庚は鉄。率直で決断が速く、時に切りすぎます。',
      '辛は宝石。細部にうるさく、質への感度が高いです。',
      '壬は大河。広く受け止め、抱えている以上に見せません。',
      '癸は雨。静かで直感的、粘り強く続けます。'
    ],
    zh: [
      '甲木如大树：方向明确，不易折断，适合开创。',
      '乙木如藤草：外柔内韧，难以拔除，善于察言观色。',
      '丙火如太阳：明朗果断，藏不住心思。',
      '丁火如灯烛：温暖细腻，专注，有自己的一套标准。',
      '戊土如山：沉稳可靠，不易被推动。',
      '己土如田园：务实耐心，善于成全他人。',
      '庚金如生铁：直率果断，有时过于锋利。',
      '辛金如珠玉：讲究细节，对品质敏感。',
      '壬水如江河：包容流动，承载的比表现的多。',
      '癸水如雨露：安静直觉，持续不断。'
    ]
  }[L];

  /* 2027 십신 그룹별 조언 */
  var YEAR_ADVICE = {
    en: {
      self: 'A year that tests independence: partnerships and rivals both sharpen. Decide whose pace you are keeping.',
      output: 'A year for visible work — writing, launching, teaching. What you make this year tends to speak for you.',
      wealth: 'A year where money and results come into focus. Good for pricing your work properly; poor for lending loosely.',
      officer: 'A year of position and responsibility — a title, a rule, a person above you who matters. Keep the paperwork clean.',
      resource: 'A year for study, credentials and backing. Slower on the outside, but what you learn carries forward.'
    },
    ja: {
      self: '自分の足場が試される年。協力相手と競争相手の両方がはっきりします。誰のペースで動くかを決めて。',
      output: '表に出す仕事が実る年。書く・始める・教えることが、そのまま評価になります。',
      wealth: 'お金と成果が焦点になる年。値付けはきちんと、貸し借りは軽くしないこと。',
      officer: '立場と責任が動く年。役職・規則・上の人との関係が焦点になります。書類は整えて。',
      resource: '学びと後ろ盾の年。外からはゆっくりでも、身につけたものが後で効きます。'
    },
    zh: {
      self: '自我与伙伴关系受考验的一年，合作与竞争都会显形。想清楚按谁的节奏走。',
      output: '适合把成果做出来的一年：写作、发布、教学，做出来的东西会替你说话。',
      wealth: '钱财与成果成为焦点的一年。该收的钱要收，借贷要谨慎。',
      officer: '职位与责任变动的一年。头衔、制度、上级关系是重点，文书要干净。',
      resource: '学习与靠山的一年。外在进展慢，但学到的会往后用得上。'
    }
  }[L];

  var HOURS = [
    ['0', '00:00–00:59'], ['2', '01:00–02:59'], ['4', '03:00–04:59'], ['6', '05:00–06:59'],
    ['8', '07:00–08:59'], ['10', '09:00–10:59'], ['12', '11:00–12:59'], ['14', '13:00–14:59'],
    ['16', '15:00–16:59'], ['18', '17:00–18:59'], ['20', '19:00–20:59'], ['22', '21:00–22:59']
  ];

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  function opt(v, label, sel) {
    return '<option value="' + v + '"' + (sel ? ' selected' : '') + '>' + label + '</option>';
  }

  function formHTML() {
    var years = [], mons = [], days = [];
    for (var y = 2026; y >= 1930; y--) years.push(opt(y, y + (L === 'en' ? '' : L === 'ja' ? '年' : '年')));
    for (var m = 1; m <= 12; m++) mons.push(opt(m, m + (L === 'en' ? '' : '月')));
    for (var d = 1; d <= 31; d++) days.push(opt(d, d + (L === 'en' ? '' : '日')));
    var hourOpts = [opt('', D.unknown)] .concat(HOURS.map(function (h) {
      var branchIdx = Math.floor((Number(h[0]) + 1) / 2) % 12;
      var label = L === 'en' ? h[1] + ' · ' + ZHI_EN[branchIdx] + ' hour'
        : L === 'ja' ? h[1] + ' · ' + E.ZHI[branchIdx] + 'の刻'
          : h[1] + ' · ' + E.ZHI[branchIdx] + '时';
      return opt(h[0], label);
    }));
    return '<section class="sj-panel"><div class="sj-panel-head"><h2>' + esc(D.birth) + '</h2>' +
      '<span class="mono">' + (L === 'en' ? 'SOLAR · Li Chun' : L === 'ja' ? '新暦 · 立春' : '公历 · 立春') + '</span></div>' +
      '<div class="sj-body"><form id="il-sj-form" novalidate>' +
      '<div class="sj-field"><div class="lbl"><span>' + esc(D.year) + ' · ' + esc(D.month) + ' · ' + esc(D.day) + '</span></div>' +
      '<div class="sj-grid" style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">' +
      '<select id="il-sj-year" aria-label="year">' + opt('', D.year) + years.join('') + '</select>' +
      '<select id="il-sj-month" aria-label="month">' + opt('', D.month) + mons.join('') + '</select>' +
      '<select id="il-sj-day" aria-label="day">' + opt('', D.day) + days.join('') + '</select>' +
      '</div></div>' +
      '<div class="sj-field"><div class="lbl"><span>' + esc(D.hour) + '</span></div>' +
      '<select id="il-sj-hour" aria-label="' + esc(D.hour) + '">' + hourOpts.join('') + '</select></div>' +
      '<div class="sj-field"><div class="lbl"><span>' + esc(D.gender) + '</span></div>' +
      '<div class="lt-seg" data-gender role="group" style="display:flex;gap:6px">' +
      '<button type="button" data-g="m" aria-pressed="true">' + esc(D.male) + '</button>' +
      '<button type="button" data-g="f" aria-pressed="false">' + esc(D.female) + '</button></div></div>' +
      '<button class="sj-run" type="submit" id="il-sj-run">' + esc(D.run) + '</button>' +
      '<p class="sj-error" id="il-sj-error" role="alert"></p>' +
      '</form></div></section>' +
      '<div id="il-sj-out" hidden></div>';
  }

  function pillarCol(p, title, dmIdx, isDay) {
    if (!p) {
      return '<div class="sj-col"><h3>' + esc(title) + '</h3><p class="sj-note">—</p></div>';
    }
    var stemIdx = p.stemIdx, branchIdx = p.branchIdx;
    var stage = STAGES[stageOf(dmIdx, branchIdx)];
    var godStem = isDay ? (L === 'en' ? 'Day master' : L === 'ja' ? '日干' : '日主') : GODS[p.stemGod] || p.stemGod;
    var godBranch = GODS[p.branchGod] || p.branchGod;
    var stemRead = L === 'en' ? GAN_EN[stemIdx] + ' · ' + GAN_EN_HINT[stemIdx]
      : L === 'ja' ? GAN_JA[stemIdx] : GAN_EN[stemIdx] + ' ' + E.GAN[stemIdx];
    var branchRead = L === 'en' ? ZHI_EN[branchIdx] + ' · ' + ZHI_EN_ANIMAL[branchIdx]
      : L === 'ja' ? ZHI_JA[branchIdx] : ZHI_EN[branchIdx] + ' ' + ZHI_EN_ANIMAL[branchIdx];
    return '<div class="sj-col' + (isDay ? ' is-day' : '') + '">' +
      '<h3>' + esc(title) + '</h3>' +
      '<div class="sj-pillar" style="font-size:34px;line-height:1.15;font-family:var(--serif,serif)">' +
      esc(p.stem) + '<br>' + esc(p.branch) + '</div>' +
      '<dl class="sj-row" style="margin-top:10px;font-size:12px">' +
      '<dt>' + esc(D.stem) + '</dt><dd>' + esc(stemRead) + '<br><b>' + esc(godStem) + '</b></dd>' +
      '<dt>' + esc(D.branch) + '</dt><dd>' + esc(branchRead) + '<br><b>' + esc(godBranch) + '</b></dd>' +
      '<dt>' + esc(D.stage) + '</dt><dd>' + esc(stage) + '</dd>' +
      '</dl></div>';
  }

  function render(chart) {
    var dm = chart.dayMaster;
    var p = chart.pillars;
    var strong = {
      veryStrong: L === 'en' ? 'Very strong' : L === 'ja' ? '身強（太旺）' : '身强（太旺）',
      strong: D.strength['신강'], balanced: D.strength['중화'],
      weak: D.strength['신약'],
      veryWeak: L === 'en' ? 'Very weak' : L === 'ja' ? '身弱（太弱）' : '身弱（太弱）'
    }[chart.strength.key] || D.strength['중화'];
    strong = esc(strong);
    var yong = ELEM[chart.yongshin.idx];
    var saeun = chart.saeun;
    var godGroup = GODS_GROUP[saeun.stemGod] || 'self';
    var out = '';

    out += '<div class="sj-result" id="il-sj-result">';
    out += '<div class="sj-sec"><div class="sj-sec-head"><h2>① ' + esc(D.chartTitle) + '</h2>' +
      '<span class="mono">' + esc(chart.input.year + '.' + chart.input.month + '.' + chart.input.day) +
      (chart.input.hour === null ? ' · ' + esc(D.unknown) : '') + '</span></div>' +
      '<div class="sj-chart" style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px">' +
      pillarCol(p.hour, D.hourPillar, dm.idx, false) +
      pillarCol(p.day, D.dayPillar, dm.idx, true) +
      pillarCol(p.month, D.monthPillar, dm.idx, false) +
      pillarCol(p.year, D.yearPillar, dm.idx, false) +
      '</div>' +
      (chart.input.hour === null ? '<p class="sj-note">' + esc(D.hourUnknown) + '</p>' : '') +
      '</div>';

    out += '<div class="sj-sec"><div class="sj-sec-head"><h2>② ' + esc(D.dayMaster) + ' · ' + esc(D.balance) + '</h2>' +
      '<span class="mono">' + esc(ELEM[dm.elementIdx]) + '</span></div>' +
      '<div class="sj-dm" style="display:flex;gap:18px;align-items:flex-start;flex-wrap:wrap">' +
      '<div style="font-size:54px;line-height:1;font-family:var(--serif,serif)">' + esc(dm.hanja) + '</div>' +
      '<div style="flex:1;min-width:240px">' +
      '<p><b>' + esc(dm.hanja) + ' ' + esc(ELEM[dm.elementIdx]) + '</b> — ' + esc(DM[dm.idx]) + '</p>' +
      '<p class="sj-note">' + esc(D.dmNote) + ' <b>' + esc(D.self) + ': ' + esc(strong) + '</b></p>' +
      '</div></div>' +
      '<ul class="sj-elemlist" style="margin-top:14px">' +
      chart.elements.map(function (el, i) {
        return '<li><span class="n">' + esc(ELEM[i]) + ' <em>' + esc(ELEM_HANJA[i]) + '</em></span>' +
          '<span class="bar"><i style="width:' + Math.min(100, el.pct) + '%"></i></span>' +
          '<span class="v">' + el.count + ' · ' + el.pct + '%</span></li>';
      }).join('') + '</ul>' +
      '<p class="sj-note">' + esc(D.balanceNote) + '</p>' +
      '<p><b>' + esc(D.yong) + ':</b> ' + esc(yong) + ' (' + esc(ELEM_HANJA[chart.yongshin.idx]) + ') — ' +
      esc(D.yongNote) + '</p>' +
      '<p class="sj-note">' + esc(D.elementWords[chart.yongshin.idx]) + '</p>' +
      '</div>';

    out += '<div class="sj-sec"><div class="sj-sec-head"><h2>③ ' + esc(D.yearTitle) + '</h2>' +
      '<span class="mono">' + esc(GODS[saeun.stemGod] || saeun.stemGod) + ' / ' + esc(GODS[saeun.branchGod] || saeun.branchGod) + '</span></div>' +
      '<p>' + esc(D.yearLead) + '</p>' +
      '<p class="sj-note">' + esc(D.godHelp[godGroup]) + '</p>' +
      '<p><b>' + esc(D.advice) + ':</b> ' + esc(YEAR_ADVICE[godGroup]) + '</p>' +
      '</div>';

    out += '<div class="sj-sec"><div class="sj-sec-head"><h2>④ ' + esc(D.calc) + '</h2></div>' +
      '<p>' + esc(D.calcBody) + '</p>' +
      '<p class="sj-disclaimer">' + esc(D.note) + '</p></div>';

    out += '</div>';
    var host = wrap.querySelector('#il-sj-out');
    host.innerHTML = out;
    host.hidden = false;
    var deadlines = wrap.querySelector('#il-sj-result');
    if (deadlines) {
      try { deadlines.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch (e) { /* noop */ }
    }
  }

  function boot() {
    var ad = wrap.querySelector('.sj-ad');
    wrap.innerHTML =
      '<div class="sj-head"><span class="kicker">' + esc(D.kicker) + '</span><h1>' + D.h1 + '</h1>' +
      '<p class="dek">' + esc(D.dek) + '</p><div class="sj-badges">' +
      D.badges.map(function (b) { return '<span class="sj-badge">' + esc(b) + '</span>'; }).join('') + '</div></div>' +
      (ad ? ad.outerHTML : '') +
      formHTML();

    var gender = 'm';
    Array.prototype.forEach.call(wrap.querySelectorAll('[data-gender] button'), function (b) {
      b.addEventListener('click', function () {
        gender = b.getAttribute('data-g');
        Array.prototype.forEach.call(wrap.querySelectorAll('[data-gender] button'), function (x) {
          x.setAttribute('aria-pressed', String(x === b));
        });
      });
    });

    var yEl = wrap.querySelector('#il-sj-year'), mEl = wrap.querySelector('#il-sj-month'), dEl = wrap.querySelector('#il-sj-day');
    function syncDays() {
      var y = Number(yEl.value) || 2020, m = Number(mEl.value) || 1;
      var max = E.daysInMonth(y, m);
      var cur = Number(dEl.value);
      var html2 = opt('', D.day);
      for (var d = 1; d <= max; d++) html2 += opt(d, d + (L === 'en' ? '' : '日'), cur === d);
      dEl.innerHTML = html2;
    }
    yEl.addEventListener('change', syncDays);
    mEl.addEventListener('change', syncDays);

    wrap.querySelector('#il-sj-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var errEl = wrap.querySelector('#il-sj-error');
      errEl.classList.remove('on');
      var y = yEl.value, m = mEl.value, d = dEl.value;
      if (!y || !m || !d) {
        errEl.textContent = D.err; errEl.classList.add('on'); return;
      }
      if (Number(y) < 1930 || Number(y) > 2026) {
        errEl.textContent = D.errRange; errEl.classList.add('on'); return;
      }
      var hv = wrap.querySelector('#il-sj-hour').value;
      var chart = E.compute({
        year: Number(y), month: Number(m), day: Number(d),
        hour: hv === '' ? null : Number(hv), gender: gender
      });
      if (!chart || !chart.ok) {
        errEl.textContent = D.errRange; errEl.classList.add('on');
        return;
      }
      render(chart);
    });

    /* 오늘 날짜 표기는 공통 스크립트가 처리합니다. */
    if (L === 'ja' || L === 'zh') {
      var td = document.querySelector('#today-date');
      if (td) {
        var now = new Date();
        td.textContent = now.getFullYear() + '年' + (now.getMonth() + 1) + '月' + now.getDate() + '日';
      }
    }
  }

  boot();
})();
