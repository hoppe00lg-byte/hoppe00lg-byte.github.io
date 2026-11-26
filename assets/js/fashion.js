/* =========================================================
   INSIGHT BRIEF — 체형·사진 기반 스타일 추천 (style.html)
   · 서버 호출 없음. 사진은 브라우저 캔버스 안에서만 읽고 어디로도 보내지 않습니다.
   · 트렌드 데이터는 data/fashion-trends.json 한 파일 — 주간 자동 갱신 대상.
   · 화면 문구는 이 파일의 UI 사전(ko/en/zh/ja), 콘텐츠는 JSON 이 담당합니다.
   ========================================================= */
(function () {
  'use strict';

  var html = document.documentElement;
  var LANG = (html.getAttribute('lang') || 'ko').toLowerCase().slice(0, 2);
  if (['ko', 'en', 'zh', 'ja'].indexOf(LANG) < 0) LANG = 'ko';

  function L(o) { return (o && (o[LANG] || o.ko)) || ''; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function $(sel, root) { return (root || document).querySelector(sel); }
  function el(tag, cls, text) { var n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.innerHTML = text; return n; }

  /* ---------------- 화면 문구 ---------------- */
  var UI = {
    ko: {
      gender: '성별', height: '키 (cm)', weight: '몸무게 (kg)', body: '체형 (수정 가능)',
      season: '계절·날씨', occasion: '상황', tone: '퍼스널 톤',
      g: { women: '여성', men: '남성', unisex: '유니섹스' },
      toneAuto: '사진으로 자동 (선택)', toneWarm: '웜톤', toneCool: '쿨톤', toneNeutral: '뉴트럴',
      go: '스타일 추천 받기', again: '다른 조합 보기', reset: '초기화',
      photo: '본인 사진 (선택)', photoHint: '전신 사진이면 비율까지, 얼굴 사진이면 피부 톤까지 참고합니다. 기기 안에서만 처리되고 전송되지 않습니다.',
      photoPick: '사진 선택', photoClear: '사진 지우기', photoNone: '사진 없이도 추천은 그대로 나옵니다.',
      analyzing: '사진을 분석하는 중…',
      bmi: 'BMI', autoBody: '자동 계산', bmiLow: '저체중', bmiNormal: '정상', bmiOver: '과체중', bmiObese: '비만',
      rSummary: '진단 요약', rBody: '체형 진단', rColor: '퍼스널 컬러', rFit: '추천 실루엣·핏',
      rPalette: '추천 컬러 팔레트', rLooks: '코디 3세트', rAvoid: '피해야 할 핏', rTrend: '이번 주 트렌드',
      up: '상의', down: '하의', outer: '아우터', tips: '스타일 팁',
      pieceTop: '상의', pieceBottom: '하의', pieceOuter: '아우터', pieceShoes: '신발', piecePoint: '포인트',
      copy: '쇼핑 키워드 복사', copyAll: '세 세트 키워드 모두 복사', copied: '복사했습니다',
      lookbook: '룩북 PNG로 저장', share: '공유', sharing: '저장 중…',
      styleMinimal: '미니멀', styleTrendy: '트렌디', styleCasual: '캐주얼',
      photoTone: '피부 톤', photoBody: '어깨/힙 비율', photoFrame: '촬영 구도', photoConf: '신뢰도',
      frameFull: '전신으로 보임', frameUpper: '상체 위주로 보임', frameUnknown: '판단 어려움',
      refValue: '참고값', noPhoto: '사진을 올리면 여기에 분석값이 나옵니다',
      warnPhoto: '조명·메이크업·배경에 따라 값이 달라집니다. 진단이 아니라 참고값입니다.',
      errData: '트렌드 데이터를 불러오지 못했습니다. 잠시 뒤 새로고침해 주세요.',
      errImage: '이 이미지는 브라우저에서 읽을 수 없습니다. JPG·PNG 사진을 올려 주세요.',
      skinLow: '피부색 픽셀이 적어 톤 판단이 어렵습니다. 얼굴이 크게 나온 사진이 좋습니다.',
      metal: '어울리는 금속', seasonLabel: '계절', weekOf: '기준일',
      colorBase: '기본', colorSub: '보조', colorPoint: '포인트', colorExtra: '여유색',
      bodyAutoNote: 'BMI와 사진으로 자동 계산했습니다. 다르면 직접 고르세요.',
      bodyManualNote: '직접 고른 체형으로 추천합니다.',
      trendNote: '데이터 파일 기준', shopTip: '검색어를 그대로 붙여 넣으면 비슷한 상품이 나옵니다.',
      lookA11y: '코디 조합', paletteA11y: '추천 색상'
    },
    en: {
      gender: 'Gender', height: 'Height (cm)', weight: 'Weight (kg)', body: 'Body type (editable)',
      season: 'Season & weather', occasion: 'Occasion', tone: 'Personal tone',
      g: { women: 'Women', men: 'Men', unisex: 'Unisex' },
      toneAuto: 'Auto from photo (optional)', toneWarm: 'Warm', toneCool: 'Cool', toneNeutral: 'Neutral',
      go: 'Get my style brief', again: 'Show another mix', reset: 'Reset',
      photo: 'Your photo (optional)', photoHint: 'A full-body shot helps with proportions, a face shot with skin tone. Processed on your device only — never uploaded.',
      photoPick: 'Choose a photo', photoClear: 'Remove photo', photoNone: 'The recommendation works without a photo too.',
      analyzing: 'Reading your photo…',
      bmi: 'BMI', autoBody: 'auto', bmiLow: 'Underweight', bmiNormal: 'Normal', bmiOver: 'Overweight', bmiObese: 'Obese',
      rSummary: 'Summary', rBody: 'Body reading', rColor: 'Personal colour', rFit: 'Suggested silhouette & fit',
      rPalette: 'Colour palette', rLooks: 'Three outfits', rAvoid: 'Fits to avoid', rTrend: 'This week’s trends',
      up: 'Tops', down: 'Bottoms', outer: 'Outerwear', tips: 'Styling tips',
      pieceTop: 'Top', pieceBottom: 'Bottom', pieceOuter: 'Outer', pieceShoes: 'Shoes', piecePoint: 'Accent',
      copy: 'Copy shopping keywords', copyAll: 'Copy all three sets', copied: 'Copied',
      lookbook: 'Save lookbook PNG', share: 'Share', sharing: 'Saving…',
      styleMinimal: 'Minimal', styleTrendy: 'Trend-led', styleCasual: 'Casual',
      photoTone: 'Skin tone', photoBody: 'Shoulder/hip ratio', photoFrame: 'Framing', photoConf: 'Confidence',
      frameFull: 'Looks full-body', frameUpper: 'Mostly upper body', frameUnknown: 'Unclear',
      refValue: 'Reference value', noPhoto: 'Upload a photo to see the analysis here',
      warnPhoto: 'Lighting, makeup and background change the numbers. This is a reference, not a diagnosis.',
      errData: 'Could not load the trend data. Please refresh in a moment.',
      errImage: 'This image cannot be read by the browser. Please use a JPG or PNG.',
      skinLow: 'Too few skin pixels to judge tone — a closer face shot works better.',
      metal: 'Metal that suits you', seasonLabel: 'Season', weekOf: 'Data as of',
      colorBase: 'base', colorSub: 'secondary', colorPoint: 'accent', colorExtra: 'extra',
      bodyAutoNote: 'Calculated from BMI and your photo. Pick another if it feels off.',
      bodyManualNote: 'Using the body type you selected.',
      trendNote: 'From the data file', shopTip: 'Paste the keyword into a shop search box as it is.',
      lookA11y: 'Outfit set', paletteA11y: 'Suggested colours'
    },
    zh: {
      gender: '性别', height: '身高 (cm)', weight: '体重 (kg)', body: '体型（可修改）',
      season: '季节·天气', occasion: '场合', tone: '个人色调',
      g: { women: '女性', men: '男性', unisex: '中性' },
      toneAuto: '用照片自动判断（可选）', toneWarm: '暖调', toneCool: '冷调', toneNeutral: '中性',
      go: '获取风格建议', again: '换一组搭配', reset: '重置',
      photo: '本人照片（可选）', photoHint: '全身照可参考比例，面部照可参考肤色。仅在设备内处理，不会上传。',
      photoPick: '选择照片', photoClear: '删除照片', photoNone: '不上传照片也能得到完整建议。',
      analyzing: '正在分析照片…',
      bmi: 'BMI', autoBody: '自动', bmiLow: '偏瘦', bmiNormal: '正常', bmiOver: '偏胖', bmiObese: '肥胖',
      rSummary: '诊断摘要', rBody: '体型诊断', rColor: '个人色彩', rFit: '推荐轮廓·版型',
      rPalette: '推荐色板', rLooks: '三套搭配', rAvoid: '应避免的版型', rTrend: '本周趋势',
      up: '上衣', down: '下装', outer: '外套', tips: '造型建议',
      pieceTop: '上衣', pieceBottom: '下装', pieceOuter: '外套', pieceShoes: '鞋', piecePoint: '点缀',
      copy: '复制购物关键词', copyAll: '复制三套关键词', copied: '已复制',
      lookbook: '保存为造型卡 PNG', share: '分享', sharing: '保存中…',
      styleMinimal: '简约', styleTrendy: '流行', styleCasual: '休闲',
      photoTone: '肤色', photoBody: '肩/胯比例', photoFrame: '构图', photoConf: '可信度',
      frameFull: '判断为全身', frameUpper: '以上半身为主', frameUnknown: '难以判断',
      refValue: '参考值', noPhoto: '上传照片后这里会显示分析值',
      warnPhoto: '受光线、妆容、背景影响，数值会变化。仅供参考，不是专业诊断。',
      errData: '未能加载趋势数据，请稍后刷新。',
      errImage: '浏览器无法读取该图片，请使用 JPG 或 PNG。',
      skinLow: '肤色像素太少，难以判断色调。建议用面部较大的照片。',
      metal: '适合的金属', seasonLabel: '季节', weekOf: '数据基准日',
      colorBase: '主色', colorSub: '辅色', colorPoint: '点缀', colorExtra: '备用',
      bodyAutoNote: '已根据 BMI 与照片自动计算，不合适可自行选择。',
      bodyManualNote: '按你选择的体型推荐。',
      trendNote: '依据数据文件', shopTip: '把关键词原样粘贴到购物搜索框即可。',
      lookA11y: '搭配组合', paletteA11y: '推荐色彩'
    },
    ja: {
      gender: '性別', height: '身長 (cm)', weight: '体重 (kg)', body: '体型（変更可）',
      season: '季節・天気', occasion: 'シーン', tone: 'パーソナルトーン',
      g: { women: '女性', men: '男性', unisex: 'ユニセックス' },
      toneAuto: '写真から自動（任意）', toneWarm: 'ウォーム', toneCool: 'クール', toneNeutral: 'ニュートラル',
      go: 'スタイル提案を見る', again: '別の組み合わせ', reset: 'リセット',
      photo: '本人の写真（任意）', photoHint: '全身写真なら比率、顔写真なら肌の色味を参考にします。端末内だけで処理し、送信しません。',
      photoPick: '写真を選ぶ', photoClear: '写真を削除', photoNone: '写真がなくても提案は出ます。',
      analyzing: '写真を解析中…',
      bmi: 'BMI', autoBody: '自動', bmiLow: 'やせ', bmiNormal: '標準', bmiOver: 'やや肥満', bmiObese: '肥満',
      rSummary: '診断サマリー', rBody: '体型診断', rColor: 'パーソナルカラー', rFit: 'おすすめシルエット・フィット',
      rPalette: 'おすすめカラーパレット', rLooks: 'コーデ3セット', rAvoid: '避けたいフィット', rTrend: '今週のトレンド',
      up: 'トップス', down: 'ボトムス', outer: 'アウター', tips: 'スタイリングのヒント',
      pieceTop: 'トップス', pieceBottom: 'ボトムス', pieceOuter: 'アウター', pieceShoes: 'シューズ', piecePoint: '小物',
      copy: 'ショッピングキーワードをコピー', copyAll: '3セット分まとめてコピー', copied: 'コピーしました',
      lookbook: 'ルックブックPNGで保存', share: '共有', sharing: '保存中…',
      styleMinimal: 'ミニマル', styleTrendy: 'トレンド', styleCasual: 'カジュアル',
      photoTone: '肌の色味', photoBody: '肩/ヒップ比率', photoFrame: '構図', photoConf: '信頼度',
      frameFull: '全身と判定', frameUpper: '上半身中心', frameUnknown: '判定しづらい',
      refValue: '参考値', noPhoto: '写真を上げるとここに解析値が出ます',
      warnPhoto: '照明・メイク・背景で値は変わります。診断ではなく参考値です。',
      errData: 'トレンドデータを読み込めませんでした。少し後に再読み込みしてください。',
      errImage: 'この画像はブラウザで読めません。JPG・PNG の写真を選んでください。',
      skinLow: '肌色のピクセルが少なく色味を判定しづらいです。顔が大きく写った写真が向いています。',
      metal: '似合う金属', seasonLabel: '季節', weekOf: 'データ基準日',
      colorBase: 'ベース', colorSub: 'サブ', colorPoint: 'アクセント', colorExtra: '予備',
      bodyAutoNote: 'BMIと写真から自動計算しました。違う場合は選び直してください。',
      bodyManualNote: '選んだ体型で提案しています。',
      trendNote: 'データファイル基準', shopTip: 'キーワードをそのままショップの検索窓に貼ってください。',
      lookA11y: 'コーデの組み合わせ', paletteA11y: 'おすすめカラー'
    }
  };
  var T = UI[LANG] || UI.ko;

  /* ---------------- 상태 ---------------- */
  var state = {
    gender: 'women', height: 170, weight: 65,
    body: '', bodyMode: 'auto', tone: 'auto',
    season: '', occasion: 'work', seed: 1, photo: null, data: null, last: null
  };

  var SRC = ['data/fashion-trends.json', '../data/fashion-trends.json', '../../data/fashion-trends.json'];
  var SEASON_ORDER = ['winter', 'earlySpring', 'spring', 'summer', 'autumn'];

  function seasonNow() {
    var m = new Date().getMonth() + 1;
    if (m === 12 || m <= 2) return 'winter';
    if (m <= 4) return 'earlySpring';
    if (m <= 5) return 'spring';
    if (m <= 8) return 'summer';
    return 'autumn';
  }

  /* ---------------- 계산: BMI · 체형 ---------------- */
  function bmi() {
    var h = Math.max(120, Math.min(230, Number(state.height) || 170));
    var w = Math.max(30, Math.min(200, Number(state.weight) || 65));
    return w / Math.pow(h / 100, 2);
  }
  function bmiBand(v) {
    if (v < 18.5) return { key: 'low', label: T.bmiLow, cls: 'is-low' };
    if (v < 25) return { key: 'normal', label: T.bmiNormal, cls: 'is-ok' };
    if (v < 30) return { key: 'over', label: T.bmiOver, cls: 'is-high' };
    return { key: 'obese', label: T.bmiObese, cls: 'is-high' };
  }
  function autoBody() {
    var v = bmi();
    if (v < 18.5) return 'slim';
    if (v >= 25) return 'broad';
    var g = state.photo && state.photo.bodyGuess;
    return g || 'standard';
  }
  function bodyKey() {
    return state.bodyMode === 'manual' && state.body ? state.body : autoBody();
  }

  /* ---------------- 계산: 퍼스널 컬러 ---------------- */
  function colorKey() {
    var tone = state.tone;
    if (tone === 'auto') tone = (state.photo && state.photo.tone) || 'neutral';
    var light = state.photo ? state.photo.light : 'light';
    if (tone === 'warm') return light === 'deep' ? 'autumnWarm' : 'springWarm';
    if (tone === 'cool') return light === 'deep' ? 'winterCool' : 'summerCool';
    return 'neutralSoft';
  }

  /* ---------------- 사진 분석 (캔버스 로컬) ---------------- */
  function srgbToLinear(c) { c /= 255; return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }
  function rgbToLab(r, g, b) {
    var R = srgbToLinear(r), G = srgbToLinear(g), B = srgbToLinear(b);
    var X = R * 0.4124 + G * 0.3576 + B * 0.1805;
    var Y = R * 0.2126 + G * 0.7152 + B * 0.0722;
    var Z = R * 0.0193 + G * 0.1192 + B * 0.9505;
    var Xn = 0.95047, Yn = 1.0, Zn = 1.08883;
    function f(t) { return t > 0.008856 ? Math.pow(t, 1 / 3) : (7.787 * t) + 16 / 116; }
    var fx = f(X / Xn), fy = f(Y / Yn), fz = f(Z / Zn);
    return { L: 116 * fy - 16, a: 500 * (fx - fy), b: 200 * (fy - fz) };
  }

  function analyzeCanvas(cv) {
    var ctx = cv.getContext('2d', { willReadFrequently: true });
    var W = cv.width, H = cv.height;
    var img = ctx.getImageData(0, 0, W, H).data;

    /* 1) 배경 추정 — 테두리 평균색 */
    var br = 0, bg = 0, bb = 0, n = 0;
    function add(px) { br += img[px]; bg += img[px + 1]; bb += img[px + 2]; n++; }
    var i, x, y, p;
    for (x = 0; x < W; x += 2) { add((0 * W + x) * 4); add(((H - 1) * W + x) * 4); }
    for (y = 0; y < H; y += 2) { add((y * W + 0) * 4); add((y * W + W - 1) * 4); }
    br /= n; bg /= n; bb /= n;

    /* 2) 전경 마스크 + 피부색 */
    var mask = new Uint8Array(W * H);
    var skinN = 0, sr = 0, sg = 0, sb = 0;
    for (y = 0; y < H; y++) {
      for (x = 0; x < W; x++) {
        p = (y * W + x) * 4;
        var r = img[p], g = img[p + 1], b = img[p + 2];
        var dist = Math.abs(r - br) + Math.abs(g - bg) + Math.abs(b - bb);
        if (dist > 72) mask[y * W + x] = 1;
        var cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b;
        var cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b;
        if (r > 60 && g > 30 && b > 15 && r > g && r > b && (r - g) > 8 &&
            cb >= 77 && cb <= 135 && cr >= 133 && cr <= 180) {
          skinN++; sr += r; sg += g; sb += b;
        }
      }
    }
    var total = W * H;
    var skinRatio = skinN / total;

    /* 3) 윤곽선 폭 — 어깨/힙 비율 */
    var rows = [], top = -1, bottom = -1;
    for (y = 0; y < H; y++) {
      var cnt = 0, minX = W, maxX = -1;
      for (x = 0; x < W; x++) {
        if (mask[y * W + x]) { cnt++; if (x < minX) minX = x; if (x > maxX) maxX = x; }
      }
      rows.push({ cnt: cnt, min: minX, max: maxX });
      if (cnt > W * 0.03) { if (top < 0) top = y; bottom = y; }
    }
    var bodyGuess = null, shoulderHip = null, fullBody = null;
    if (top >= 0 && bottom - top > H * 0.12) {
      var bh = bottom - top + 1;
      var sw = 0, hw = 0, yy;
      for (yy = Math.round(top + bh * 0.16); yy <= Math.round(top + bh * 0.30); yy++) {
        if (rows[yy]) sw = Math.max(sw, rows[yy].max - rows[yy].min);
      }
      for (yy = Math.round(top + bh * 0.55); yy <= Math.round(top + bh * 0.70); yy++) {
        if (rows[yy]) hw = Math.max(hw, rows[yy].max - rows[yy].min);
      }
      if (sw > 8 && hw > 8) {
        var ratio = sw / hw;
        shoulderHip = Math.round(ratio * 100) / 100;
        if (ratio >= 1.14) bodyGuess = 'inverted';
        else if (ratio <= 0.9) bodyGuess = 'pear';
        else bodyGuess = 'standard';
      }
      var bboxW = 0;
      for (yy = top; yy <= bottom; yy++) if (rows[yy]) bboxW = Math.max(bboxW, rows[yy].max - rows[yy].min);
      fullBody = (bh / H > 0.55) && (bboxW > 0 && bh / bboxW > 1.15);
    }

    /* 4) 톤 판정 — Lab 의 b*(노랑)와 a*(붉음) 균형 */
    var out = { tone: null, light: 'light', lab: null, skinRatio: skinRatio, shoulderHip: shoulderHip, bodyGuess: bodyGuess, full: fullBody, conf: 0 };
    if (skinN > total * 0.004 && skinN > 400) {
      var lab = rgbToLab(sr / skinN, sg / skinN, sb / skinN);
      var warmth = lab.b - lab.a;               // 피부의 노랑-붉음 균형
      out.lab = { L: Math.round(lab.L), a: Math.round(lab.a * 10) / 10, b: Math.round(lab.b * 10) / 10, warmth: Math.round(warmth * 10) / 10 };
      out.tone = warmth >= 7 ? 'warm' : (warmth <= 2.5 ? 'cool' : 'neutral');
      out.light = lab.L >= 62 ? 'light' : 'deep';
      out.conf = Math.min(95, Math.round(30 + Math.min(1, skinRatio / 0.12) * 60));
    }
    return out;
  }

  function readPhoto(file) {
    var reader = new FileReader();
    reader.onload = function (e) {
      var img = new Image();
      img.onload = function () {
        try {
          var maxW = 360;
          var scale = Math.min(1, maxW / img.width);
          var cv = document.createElement('canvas');
          cv.width = Math.max(1, Math.round(img.width * scale));
          cv.height = Math.max(1, Math.round(img.height * scale));
          cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height);
          state.photo = analyzeCanvas(cv);
          state.photo.preview = e.target.result;
          renderPhotoBox();
          renderBuilderBody();
          if (state.last) run(true);
        } catch (err) {
          setNotice(T.errImage, true);
        }
      };
      img.onerror = function () { setNotice(T.errImage, true); };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  /* ---------------- 추천 엔진 ---------------- */
  function rng(seed) {
    var s = seed % 2147483647; if (s <= 0) s += 2147483646;
    return function () { s = s * 16807 % 2147483647; return (s - 1) / 2147483646; };
  }
  function acceptGender(item) {
    if (state.gender === 'unisex') return true;
    return item.gender.indexOf(state.gender) >= 0 || item.gender.indexOf('unisex') >= 0;
  }
  function score(item, style, body, occ) {
    var s = 0;
    if (item.style === style) s += 4;
    if (occ.want.indexOf(item.style) >= 0) s += 2;
    if (item.good.indexOf(body) >= 0) s += 3;
    if (item.bad.indexOf(body) >= 0) return -99;
    if (item.seasons.indexOf(state.season) >= 0) s += 2;
    return s;
  }
  function choose(pool, style, used, rand) {
    var body = bodyKey(), occ = state.data.occasions[state.occasion];
    var best = -1e9, cands = [];
    pool.forEach(function (it) {
      if (!acceptGender(it)) return;
      if (used.indexOf(it.id) >= 0) return;
      if (it.occasion.indexOf(state.occasion) < 0) return;
      if (it.seasons.indexOf(state.season) < 0) return;
      var sc = score(it, style, body, occ) + rand() * 1.5;
      if (sc > best) { best = sc; cands = [it]; }
      else if (sc === best) cands.push(it);
    });
    if (cands.length) return cands[0];
    /* 완화 1: 계절 조건만 뺀다 — 계절이 가까운 아이템을 먼저 고른다 */
    var si = SEASON_ORDER.indexOf(state.season);
    function sdist(a) {
      var bi = SEASON_ORDER.indexOf(a);
      if (bi < 0 || si < 0) return 2;
      var d = Math.abs(bi - si);
      return Math.min(d, SEASON_ORDER.length - d);
    }
    function minDist(it) {
      var bestD = 9;
      it.seasons.forEach(function (s) { bestD = Math.min(bestD, sdist(s)); });
      return bestD;
    }
    var near = 9;
    pool.forEach(function (it) {
      if (!acceptGender(it) || used.indexOf(it.id) >= 0) return;
      if (it.occasion.indexOf(state.occasion) < 0) return;
      if (it.bad.indexOf(body) >= 0) return;
      near = Math.min(near, minDist(it));
    });
    var pool2 = pool.filter(function (it) {
      return acceptGender(it) && used.indexOf(it.id) < 0 &&
        it.occasion.indexOf(state.occasion) >= 0 && it.bad.indexOf(body) < 0 && minDist(it) === near;
    });
    if (pool2.length) return pool2[Math.floor(rand() * pool2.length) % pool2.length];
    /* 완화 2: 성별·중복만 지킨다 */
    var pool3 = pool.filter(function (it) { return acceptGender(it) && it.bad.indexOf(body) < 0; });
    if (pool3.length) return pool3[Math.floor(rand() * pool3.length) % pool3.length];
    return null;
  }

  function colorNames(pal) {
    /* 팔레트에서 기본·보조·포인트 세 색을 고른다 */
    return { base: pal[0], sub: pal[1], point: pal[2] || pal[1] || pal[0], extra: pal.slice(0, 5) };
  }
  /* 조각별 색 배정 — 같은 색으로 도배되지 않게 칸마다 역할을 나눈다 */
  function colorSlotFor(kind, item, style, cols) {
    var want = item && item.color;
    if (want === 'point') return cols.point;
    if (want === 'sub') return cols.sub;
    if (kind === 'bottom' && style !== 'minimal') return cols.sub;
    if (kind === 'outer' && style === 'casual') return cols.sub;
    return cols.base;
  }
  function glue(colorName, itemName) {
    if (LANG === 'zh') return colorName + itemName;
    if (LANG === 'ja') return colorName + 'の' + itemName;
    return colorName + ' ' + itemName;
  }

  function buildLooks(rand) {
    var d = state.data, body = bodyKey();
    var styles = ['minimal', 'trendy', 'casual'];
    var used = { top: [], bottom: [], outer: [], shoes: [], point: [] };
    var looks = [];
    styles.forEach(function (style) {
      var top = choose(d.items.tops, style, used.top, rand);
      var bottom = choose(d.items.bottoms, style, used.bottom, rand);
      var outer = choose(d.items.outers, style, used.outer, rand);
      var shoes = choose(d.items.shoes, style, used.shoes, rand);
      var point = choose(d.items.points, style, used.point, rand);
      [['top', top], ['bottom', bottom], ['outer', outer], ['shoes', shoes], ['point', point]].forEach(function (pair) {
        if (pair[1]) used[pair[0]].push(pair[1].id);
      });
      looks.push({ style: style, top: top, bottom: bottom, outer: outer, shoes: shoes, point: point });
    });
    /* 팔레트의 포인트 색은 룩마다 돌려 쓴다(같은 색만 나오지 않도록) */
    var pcPal = colorNames(d.personalColors[colorKey()].palette).extra;
    looks.forEach(function (lk, i) {
      lk.colors = {
        base: pcPal[0],
        sub: pcPal[1 + (i % 2)] || pcPal[1] || pcPal[0],
        point: pcPal[3 + (i % 2)] || pcPal[3] || pcPal[2] || pcPal[0],
        extra: pcPal
      };
    });
    return looks;
  }

  function trendsFor() {
    var d = state.data, out = [];
    d.trends.forEach(function (t) {
      if (t.seasons.indexOf(state.season) < 0) return;
      if (t.tags.indexOf(state.occasion) < 0) return;
      if (state.gender !== 'unisex' && t.genders.indexOf(state.gender) < 0 && t.genders.indexOf('unisex') < 0) return;
      out.push(t);
    });
    if (out.length < 2) {
      d.trends.forEach(function (t) {
        if (out.indexOf(t) < 0 && t.seasons.indexOf(state.season) >= 0) out.push(t);
      });
    }
    return out.slice(0, 3);
  }

  function compute() {
    var d = state.data;
    var body = d.bodyTypes[bodyKey()];
    var pc = d.personalColors[colorKey()];
    var occ = d.occasions[state.occasion];
    var sea = d.seasons[state.season];
    var rand = rng(state.seed * 7919 + 13);
    var looks = buildLooks(rand);
    var v = bmi();
    return {
      bmi: Math.round(v * 10) / 10, band: bmiBand(v), body: body, bodyKey: bodyKey(),
      bodyMode: state.bodyMode, pc: pc, colorKey: colorKey(), occ: occ, sea: sea,
      looks: looks, trends: trendsFor(), palette: pc.palette
    };
  }

  /* ---------------- 그리기 ---------------- */
  function resultCard(kicker, title, bodyHTML, extraCls) {
    return '<section class="fs-card' + (extraCls ? ' ' + extraCls : '') + '">' +
      '<div class="fs-card-head"><span class="k">' + esc(kicker) + '</span><h3>' + esc(title) + '</h3></div>' +
      bodyHTML + '</section>';
  }

  function lookRows(lk) {
    var defs = [['top', T.pieceTop], ['bottom', T.pieceBottom], ['outer', T.pieceOuter], ['shoes', T.pieceShoes], ['point', T.piecePoint]];
    var rows = [];
    defs.forEach(function (d) {
      var it = lk[d[0]];
      if (!it) return;
      rows.push({ kind: d[0], label: d[1], item: it, color: colorSlotFor(d[0], it, lk.style, lk.colors) });
    });
    return rows;
  }

  function renderResult() {
    var r = compute();
    state.last = r;
    var box = $('#fs-results');
    if (!box) return;
    var out = [];

    /* 요약 */
    out.push('<div class="fs-summary">' +
      '<div><i>' + esc(T.bmi) + '</i><b>' + r.bmi + '</b><em class="' + r.band.cls + '">' + esc(r.band.label) + '</em></div>' +
      '<div><i>' + esc(T.body.split(' ')[0]) + '</i><b>' + esc(L(r.body.label)) + '</b><em>' + esc(T[r.bodyMode === 'manual' ? 'bodyManualNote' : 'bodyAutoNote']) + '</em></div>' +
      '<div><i>' + esc(T.rColor) + '</i><b>' + esc(L(r.pc.label)) + '</b><em>' + esc(T.metal) + ' · ' + esc(L(r.pc.metal)) + '</em></div>' +
      '<div><i>' + esc(T.occasion) + '</i><b>' + esc(L(r.occ.label)) + '</b><em>' + esc(L(r.sea.label)) + '</em></div>' +
      '</div>');

    /* 체형 */
    var b = r.body;
    out.push(resultCard('BODY · TYPE', L(b.label),
      '<p class="fs-lead">' + esc(L(b.goal)) + '</p>' +
      '<dl class="fs-list">' +
      '<dt>' + esc(T.up) + '</dt><dd>' + b.up.map(function (s) { return esc(L(s)); }).join(' · ') + '</dd>' +
      '<dt>' + esc(T.down) + '</dt><dd>' + b.down.map(function (s) { return esc(L(s)); }).join(' · ') + '</dd>' +
      '<dt>' + esc(T.outer) + '</dt><dd>' + b.outer.map(function (s) { return esc(L(s)); }).join(' · ') + '</dd>' +
      '</dl>'));

    /* 퍼스널 컬러 */
    out.push(resultCard('COLOR · TONE', L(r.pc.label),
      '<p class="fs-lead">' + esc(L(r.pc.note)) + '</p>' +
      '<ul class="fs-palette" aria-label="' + esc(T.paletteA11y) + '">' +
      r.pc.palette.map(function (c, i) {
        var role = i === 0 ? T.colorBase : i === 1 ? T.colorSub : i === 2 ? T.colorPoint : T.colorExtra;
        return '<li' + (i > 2 ? ' class="is-extra"' : '') + '><b style="background:' + c.hex + '"></b>' +
          '<span>' + esc(L(c.name)) + '</span><em>' + esc(role) + '</em></li>';
      }).join('') + '</ul>' +
      '<p class="fs-note">' + esc(T.metal) + ' · ' + esc(L(r.pc.metal)) + '</p>' +
      (!state.photo ? '<p class="fs-note">' + esc(T.noPhoto) + '</p>' : '')));

    /* 실루엣·핏 */
    var t0 = r.trends[0];
    out.push(resultCard('FIT · SILHOUETTE', L(r.sea.label),
      '<dl class="fs-list">' +
      '<dt>' + esc(T.seasonLabel) + '</dt><dd>' + esc(L(r.sea.temp)) + ' · ' + esc(L(r.sea.layers[0])) + '</dd>' +
      '<dt>' + esc(T.occasion) + '</dt><dd>' + esc(L(r.occ.code)) + '</dd>' +
      (t0 ? '<dt>' + esc(T.rTrend) + '</dt><dd><b>' + esc(L(t0.name)) + '</b> — ' + esc(L(t0.line)) + '</dd>' : '') +
      '<dt>' + esc(T.tips) + '</dt><dd>' + b.tips.map(function (s) { return esc(L(s)); }).join(' · ') + '</dd>' +
      '</dl>'));

    /* 코디 3세트 */
    var looksHTML = r.looks.map(function (lk, i) {
      var label = lk.style === 'minimal' ? T.styleMinimal : lk.style === 'trendy' ? T.styleTrendy : T.styleCasual;
      var kws = lookKeywords(lk);
      return '<article class="fs-look" aria-label="' + esc(T.lookA11y) + ' ' + (i + 1) + '">' +
        '<header><span class="n">0' + (i + 1) + '</span><h4>' + esc(label) + '</h4>' +
        '<button type="button" class="fs-copy" data-copy="' + esc(kws) + '">' + esc(T.copy) + '</button></header>' +
        '<ul class="fs-pieces">' + lookRows(lk).map(function (r) {
          return '<li><span class="p">' + esc(r.label) + '</span>' +
            '<span class="v"><b style="background:' + r.color.hex + '" aria-hidden="true"></b>' +
            esc(glue(L(r.color.name), L(r.item.name))) + '</span></li>';
        }).join('') + '</ul>' +
        '<p class="fs-kw">' + esc(kws) + '</p>' +
        '</article>';
    }).join('');
    out.push(resultCard('OUTFIT · 03', T.rLooks, '<div class="fs-looks">' + looksHTML + '</div>' +
      '<div class="fs-look-actions">' +
      '<button type="button" class="fs-btn" id="fs-copy-all">' + esc(T.copyAll) + '</button>' +
      '<button type="button" class="fs-btn fs-btn-main" id="fs-lookbook">' + esc(T.lookbook) + '</button>' +
      '<button type="button" class="fs-btn" id="fs-share">' + esc(T.share) + '</button>' +
      '</div>'));

    /* 피해야 할 핏 */
    out.push(resultCard('AVOID', L(b.label),
      '<ul class="fs-avoid">' + b.avoid.map(function (s) { return '<li>' + esc(L(s)) + '</li>'; }).join('') + '</ul>'));

    /* 트렌드 */
    out.push(resultCard('TREND · WEEK', state.data.meta.season,
      '<ul class="fs-trends">' + r.trends.map(function (t) {
        return '<li><b>' + esc(L(t.name)) + '</b><p>' + esc(L(t.line)) + '</p>' +
          '<code>' + esc(L(t.keywords)) + '</code></li>';
      }).join('') + '</ul>' +
      '<p class="fs-note">' + esc(T.trendNote) + ' · ' + esc(state.data.meta.updatedAt) + '</p>'));

    box.innerHTML = out.join('');
    box.hidden = false;
    bindResult();
  }

  function lookKeywords(lk) {
    return lookRows(lk).map(function (r) {
      return glue(L(r.color.name), L(r.item.name));
    }).join(' / ');
  }

  function bindResult() {
    var box = $('#fs-results');
    box.querySelectorAll('[data-copy]').forEach(function (b) {
      b.addEventListener('click', function () { copyText(b.getAttribute('data-copy'), b); });
    });
    var all = $('#fs-copy-all');
    if (all) all.addEventListener('click', function () {
      copyText(state.last.looks.map(lookKeywords).join('\n'), all);
    });
    var lb = $('#fs-lookbook');
    if (lb) lb.addEventListener('click', function () {
      if (window.IBFashionLookbook) window.IBFashionLookbook.save(state.last, modelForBook());
    });
    var sh = $('#fs-share');
    if (sh) sh.addEventListener('click', function () {
      if (window.IBFashionLookbook) window.IBFashionLookbook.share(state.last, modelForBook());
    });
  }

  function modelForBook() {
    return {
      lang: LANG, T: T, L: L, body: state.last.body, pc: state.last.pc,
      season: state.last.sea, occasion: state.last.occ,
      looks: state.last.looks.map(function (lk) {
        return {
          style: lk.style,
          rows: lookRows(lk).map(function (r) { return { label: r.label, hex: r.color.hex, name: L(r.color.name), item: L(r.item.name) }; })
        };
      }),
      bmi: state.last.bmi, band: state.last.band, keywords: state.last.looks.map(lookKeywords),
      date: state.data.meta.updatedAt, site: 'INSIGHT BRIEF'
    };
  }

  function copyText(text, btn) {
    function done() {
      if (!btn) { setNotice(T.copied); return; }
      var old = btn.textContent;
      btn.textContent = T.copied;
      btn.classList.add('is-done');
      setTimeout(function () { btn.textContent = old; btn.classList.remove('is-done'); }, 1600);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, function () { legacyCopy(text); done(); });
    } else { legacyCopy(text); done(); }
  }
  function legacyCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text; ta.setAttribute('readonly', '');
    ta.style.position = 'fixed'; ta.style.top = '-1000px';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); } catch (e) { /* 무시 */ }
    document.body.removeChild(ta);
  }

  var noticeTimer = null;
  function setNotice(msg, isError) {
    var n = $('#fs-notice');
    if (!n) return;
    n.textContent = msg;
    n.className = 'fs-notice' + (isError ? ' is-error' : '');
    n.hidden = false;
    clearTimeout(noticeTimer);
    noticeTimer = setTimeout(function () { n.hidden = true; }, isError ? 6000 : 2400);
  }

  /* ---------------- 조작부 ---------------- */
  function field(no, label, inner, hint) {
    return '<div class="fs-field"><div class="fs-lb"><span class="no">' + no + '</span>' +
      '<span class="t">' + esc(label) + '</span></div>' + inner +
      (hint ? '<p class="fs-hint">' + hint + '</p>' : '') + '</div>';
  }

  function renderPhotoBox() {
    var box = $('#fs-photo-box');
    if (!box) return;
    var p = state.photo;
    if (!p) {
      box.innerHTML = '<p class="fs-photo-empty">' + esc(T.photoNone) + '</p>';
      return;
    }
    var toneLabel = p.tone === 'warm' ? T.toneWarm : p.tone === 'cool' ? T.toneCool : T.toneNeutral;
    var frameLabel = p.full === true ? T.frameFull : p.full === false ? T.frameUpper : T.frameUnknown;
    var rows = [
      [T.photoTone, p.tone ? toneLabel + ' · L* ' + p.lab.L : '—'],
      [T.photoBody, p.shoulderHip ? p.shoulderHip + ' : 1' : '—'],
      [T.photoFrame, frameLabel],
      [T.photoConf, p.conf ? p.conf + '%' : '—']
    ];
    box.innerHTML = '<figure class="fs-photo-fig">' +
      '<img src="' + p.preview + '" alt="" loading="lazy">' +
      '<figcaption><dl>' + rows.map(function (r) {
        return '<dt>' + esc(r[0]) + '</dt><dd>' + esc(r[1]) + '</dd>';
      }).join('') + '</dl>' +
      '<span class="fs-ref">' + esc(T.refValue) + '</span></figcaption></figure>' +
      '<p class="fs-hint">' + esc(p.tone ? T.warnPhoto : T.skinLow) + '</p>';
  }

  function renderBuilderBody() {
    var bodySel = $('#fs-body-chips');
    if (!bodySel) return;
    var d = state.data;
    var active = bodyKey();
    bodySel.innerHTML = Object.keys(d.bodyTypes).map(function (k) {
      var on = (state.bodyMode === 'manual' ? state.body === k : (state.body === '' ? k === active : false));
      if (state.bodyMode === 'auto') on = k === active;
      return '<button type="button" data-body="' + k + '" aria-pressed="' + (on ? 'true' : 'false') + '">' +
        esc(L(d.bodyTypes[k].label)) + '</button>';
    }).join('') +
      '<button type="button" data-body="auto" class="fs-auto" aria-pressed="' + (state.bodyMode === 'auto' ? 'true' : 'false') + '">' + esc(T.autoBody) + '</button>';
  }

  function renderBuilder() {
    var d = state.data;
    var wrap = $('#fs-controls');
    if (!wrap) return;
    var html = '';

    html += field('01', T.gender, '<div class="fs-chips" id="fs-gender">' +
      ['women', 'men', 'unisex'].map(function (g) {
        return '<button type="button" data-g="' + g + '" aria-pressed="' + (state.gender === g ? 'true' : 'false') + '">' + esc(T.g[g]) + '</button>';
      }).join('') + '</div>');

    html += field('02', T.height, '<div class="fs-num"><input type="number" id="fs-height" min="120" max="230" step="1" value="' + state.height + '" inputmode="numeric" aria-label="' + esc(T.height) + '"><span>cm</span></div>' +
      '<div class="fs-num"><input type="number" id="fs-weight" min="30" max="200" step="0.5" value="' + state.weight + '" inputmode="decimal" aria-label="' + esc(T.weight) + '"><span>kg</span></div>' +
      '<p class="fs-bmi" id="fs-bmi"></p>');

    html += field('03', T.body, '<div class="fs-chips" id="fs-body-chips"></div>');

    html += field('04', T.tone, '<div class="fs-chips" id="fs-tone">' +
      [['auto', T.toneAuto], ['warm', T.toneWarm], ['cool', T.toneCool], ['neutral', T.toneNeutral]].map(function (t) {
        return '<button type="button" data-tone="' + t[0] + '" aria-pressed="' + (state.tone === t[0] ? 'true' : 'false') + '">' + esc(t[1]) + '</button>';
      }).join('') + '</div>');

    html += field('05', T.season, '<select id="fs-season">' + Object.keys(d.seasons).map(function (k) {
      return '<option value="' + k + '"' + (state.season === k ? ' selected' : '') + '>' + esc(L(d.seasons[k].label)) + '</option>';
    }).join('') + '</select>');

    html += field('06', T.occasion, '<div class="fs-chips" id="fs-occasion">' + Object.keys(d.occasions).map(function (k) {
      return '<button type="button" data-occ="' + k + '" aria-pressed="' + (state.occasion === k ? 'true' : 'false') + '">' + esc(L(d.occasions[k].label)) + '</button>';
    }).join('') + '</div>');

    html += field('07', T.photo,
      '<div class="fs-photo-pick">' +
      '<label class="fs-btn fs-btn-file"><input type="file" id="fs-file" accept="image/*">' + esc(T.photoPick) + '</label>' +
      (state.photo ? '<button type="button" class="fs-btn fs-btn-ghost" id="fs-clear-photo">' + esc(T.photoClear) + '</button>' : '') +
      '</div>' +
      '<div id="fs-photo-box" class="fs-photo-box"></div>',
      esc(T.photoHint));

    wrap.innerHTML = html;
    renderBuilderBody();
    renderPhotoBox();
    updateBMI();

    $('#fs-gender').addEventListener('click', function (e) {
      var b = e.target.closest('button[data-g]'); if (!b) return;
      state.gender = b.getAttribute('data-g');
      this.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      if (state.last) run(true);
    });
    $('#fs-body-chips').addEventListener('click', function (e) {
      var b = e.target.closest('button[data-body]'); if (!b) return;
      var v = b.getAttribute('data-body');
      if (v === 'auto') { state.bodyMode = 'auto'; state.body = ''; }
      else { state.bodyMode = 'manual'; state.body = v; }
      renderBuilderBody();
      if (state.last) run(true);
    });
    $('#fs-tone').addEventListener('click', function (e) {
      var b = e.target.closest('button[data-tone]'); if (!b) return;
      state.tone = b.getAttribute('data-tone');
      this.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      if (state.last) run(true);
    });
    $('#fs-season').addEventListener('change', function () {
      state.season = this.value;
      if (state.last) run(true);
    });
    $('#fs-occasion').addEventListener('click', function (e) {
      var b = e.target.closest('button[data-occ]'); if (!b) return;
      state.occasion = b.getAttribute('data-occ');
      this.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      if (state.last) run(true);
    });
    ['fs-height', 'fs-weight'].forEach(function (id) {
      var inp = $('#' + id);
      if (!inp) return;
      inp.addEventListener('input', function () {
        state.height = Number($('#fs-height').value) || 170;
        state.weight = Number($('#fs-weight').value) || 65;
        updateBMI();
        renderBuilderBody();
      });
      inp.addEventListener('change', function () { if (state.last) run(true); });
    });
    var file = $('#fs-file');
    if (file) file.addEventListener('change', function () {
      var f = this.files && this.files[0];
      if (!f) return;
      setNotice(T.analyzing);
      readPhoto(f);
    });
    var clr = $('#fs-clear-photo');
    if (clr) clr.addEventListener('click', function () {
      state.photo = null;
      renderBuilder();
      if (state.last) run(true);
    });
  }

  function updateBMI() {
    var v = bmi(), band = bmiBand(v);
    var n = $('#fs-bmi');
    if (!n) return;
    n.innerHTML = '<b>' + T.bmi + ' ' + (Math.round(v * 10) / 10) + '</b> · ' + esc(band.label) +
      ' <span class="' + band.cls + '">' + esc(T.autoBody) + '</span>';
  }

  function run(quiet) {
    if (!state.data) return;
    state.seed++;
    renderResult();
    if (!quiet) {
      var out = $('#fs-out');
      if (out) out.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  /* ---------------- 시작 ---------------- */
  function loadData(cb) {
    var i = 0;
    function next() {
      if (i >= SRC.length) { cb(null); return; }
      var url = SRC[i++];
      fetch(url, { cache: 'no-cache' }).then(function (r) {
        if (!r.ok) throw new Error('http ' + r.status);
        return r.json();
      }).then(function (j) { cb(j); }).catch(next);
    }
    next();
  }

  function start() {
    var fallback = window.__FASHION_TRENDS__ || null;
    if (fallback) { init(fallback); return; }
    loadData(function (j) {
      if (!j) {
        var n = $('#fs-notice');
        if (n) { n.textContent = T.errData; n.className = 'fs-notice is-error'; n.hidden = false; }
        return;
      }
      init(j);
    });
  }

  function init(d) {
    state.data = d;
    state.season = seasonNow();
    state.body = '';
    state.bodyMode = 'auto';
    renderBuilder();
    $('#fs-go').addEventListener('click', function () { run(false); });
    $('#fs-again').addEventListener('click', function () { run(false); });
    $('#fs-reset').addEventListener('click', function () {
      state.gender = 'women'; state.height = 170; state.weight = 65; state.body = '';
      state.bodyMode = 'auto'; state.tone = 'auto'; state.photo = null; state.seed = 1;
      state.season = seasonNow(); state.occasion = 'work';
      var box = $('#fs-results'); if (box) { box.hidden = true; box.innerHTML = ''; }
      state.last = null;
      renderBuilder();
    });
    /* 처음에는 추천을 미리 한 번 그려 둡니다(빈 화면 방지) */
    run(true);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();

  window.__IBFashion = { state: state, compute: compute, analyzeCanvas: analyzeCanvas, bmi: bmi };
})();
