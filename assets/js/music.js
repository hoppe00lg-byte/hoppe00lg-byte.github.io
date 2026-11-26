/* =========================================================
   INSIGHT BRIEF — AI 음악 가사·프롬프트 생성기 (music.html)
   · 서버 호출 없음. 모든 문장은 이 파일 안의 자체 제작 자료로 조합합니다.
   · 페이지 언어(ko/en/zh/ja)는 조작부·결과 라벨에, 가사 언어(ko/en/ja)는
     가사 문장에 각각 따로 씁니다.
   ========================================================= */
(function () {
  'use strict';

  var html = document.documentElement;
  var LANG = (html.getAttribute('lang') || 'ko').toLowerCase().slice(0, 2);
  if (LANG === 'zh') LANG = 'zh';
  if (['ko', 'en', 'zh', 'ja'].indexOf(LANG) < 0) LANG = 'ko';

  /* ---------------- 화면 문구 (조작부·결과) ---------------- */
  var UI = {
    ko: {
      step: ['01', '02', '03', '04', '05', '06', '07', '08', '09'],
      genre: '장르', sub: '서브장르', mood: '분위기', moodHint: '최대 3개',
      tempo: '템포', vocal: '보컬', tone: '보컬 톤', lyricLang: '가사 언어',
      theme: '주제', kw: '키워드', kwHint: '쉼표로 구분 · 선택',
      kwPlaceholder: '예: 첫눈, 퇴근길, 빈 방',
      len: '길이·구조', bpm: 'BPM',
      build: '프롬프트·가사 생성', again: '다시 생성', reset: '초기화',
      tStyle: 'Suno 스타일', tStyleDesc: 'Style of Music 칸에 그대로',
      tFull: '확장 스타일 프롬프트', tFullDesc: 'Flow Music·Udio 등 길게 쓸 수 있는 곳',
      tLyrics: '가사', tLyricsDesc: 'Custom Mode 가사 칸에 그대로',
      tPrompt: 'ChatGPT·Gemini 프롬프트', tPromptDesc: '더 다듬고 싶을 때 붙여 넣기',
      tTitles: '곡 제목 후보',
      copy: '복사', copied: '복사했습니다', copyFail: '복사가 막혔습니다. 내용을 길게 눌러 선택해 주세요.',
      chars: '자', lines: '줄',
      empty: '생성하기를 누르면 여기에 스타일 태그·가사·프롬프트가 나옵니다.',
      keyboard: '연주곡 — 가사 없이 구조 태그만',
      moodMax: '분위기는 3개까지 고를 수 있습니다.',
      instrumental: '연주곡', noLyrics: '보컬 없이 연주곡으로 만듭니다. 가사 칸에는 구조 태그만 넣으세요.',
      noteStyle: 'Suno의 Style 칸은 길이 제한이 있습니다. 이 태그는 200자 이내로 맞췄습니다.',
      noteLyrics: '대괄호 구간 표기는 노래로 불리지 않고 곡의 구조를 알려 줍니다.',
      notePrompt: '그대로 붙여 넣고 “2절만 다시”, “더 짧게”처럼 요청하면 됩니다.',
      female: '여성', male: '남성', duet: '듀엣', group: '그룹·합창', rap: '랩', child: '아이 목소리',
      airy: '에어리', husky: '허스키', power: '파워풀', whisper: '속삭임', natural: '담백한 톤', falsetto: '가성',
      lenShort: '숏폼 60~90초', lenStd: '표준 3분', lenFull: '확장 3분 40초',
      tKo: '한국어', tEn: '영어', tJa: '일본어'
    },
    en: {
      step: ['01', '02', '03', '04', '05', '06', '07', '08', '09'],
      genre: 'Genre', sub: 'Sub-genre', mood: 'Mood', moodHint: 'up to 3',
      tempo: 'Tempo', vocal: 'Vocal', tone: 'Vocal tone', lyricLang: 'Lyrics language',
      theme: 'Theme', kw: 'Keywords', kwHint: 'comma separated · optional',
      kwPlaceholder: 'e.g. first snow, commute home, empty room',
      len: 'Length & structure', bpm: 'BPM',
      build: 'Generate prompt & lyrics', again: 'Generate again', reset: 'Reset',
      tStyle: 'Suno style', tStyleDesc: 'Paste into Style of Music',
      tFull: 'Extended style prompt', tFullDesc: 'For Flow Music, Udio and tools with room',
      tLyrics: 'Lyrics', tLyricsDesc: 'Paste into Custom Mode lyrics',
      tPrompt: 'ChatGPT / Gemini prompt', tPromptDesc: 'Paste to refine further',
      tTitles: 'Title ideas',
      copy: 'Copy', copied: 'Copied', copyFail: 'Copy was blocked. Select the text and copy manually.',
      chars: ' chars', lines: 'lines',
      empty: 'Press Generate to see style tags, lyrics and a prompt here.',
      keyboard: 'Instrumental — structure tags only',
      moodMax: 'Pick up to 3 moods.',
      instrumental: 'Instrumental', noLyrics: 'This will be an instrumental. Put only the structure tags in the lyrics field.',
      noteStyle: 'Suno’s style field is length-limited. This tag line fits under 200 characters.',
      noteLyrics: 'Bracketed section tags are not sung — they tell the model the song structure.',
      notePrompt: 'Paste it as-is, then ask things like “rewrite verse 2” or “make it shorter”.',
      female: 'Female', male: 'Male', duet: 'Duet', group: 'Group / choir', rap: 'Rap', child: 'Child voice',
      airy: 'Airy', husky: 'Husky', power: 'Powerful', whisper: 'Whisper', natural: 'Natural', falsetto: 'Falsetto',
      lenShort: 'Short 60–90 sec', lenStd: 'Standard 3 min', lenFull: 'Extended 3:40',
      tKo: 'Korean', tEn: 'English', tJa: 'Japanese'
    },
    ja: {
      step: ['01', '02', '03', '04', '05', '06', '07', '08', '09'],
      genre: 'ジャンル', sub: 'サブジャンル', mood: '雰囲気', moodHint: '最大3つ',
      tempo: 'テンポ', vocal: 'ボーカル', tone: 'ボーカルの質感', lyricLang: '歌詞の言語',
      theme: 'テーマ', kw: 'キーワード', kwHint: 'カンマ区切り・任意',
      kwPlaceholder: '例：初雪、帰り道、空っぽの部屋',
      len: '長さ・構成', bpm: 'BPM',
      build: 'プロンプトと歌詞を生成', again: 'もう一度', reset: 'リセット',
      tStyle: 'Sunoスタイル', tStyleDesc: 'Style of Music にそのまま',
      tFull: '拡張スタイルプロンプト', tFullDesc: 'Flow Music・Udio など長く書けるツール向け',
      tLyrics: '歌詞', tLyricsDesc: 'Custom Mode の歌詞欄にそのまま',
      tPrompt: 'ChatGPT / Gemini プロンプト', tPromptDesc: 'さらに推敲したいとき',
      tTitles: '曲名の候補',
      copy: 'コピー', copied: 'コピーしました', copyFail: 'コピーできませんでした。選択してコピーしてください。',
      chars: ' 文字', lines: '行',
      empty: '「生成」を押すと、スタイルタグ・歌詞・プロンプトがここに出ます。',
      keyboard: 'インスト — 構成タグのみ',
      moodMax: '雰囲気は3つまで選べます。',
      instrumental: 'インストゥルメンタル', noLyrics: 'ボーカルなしのインストになります。歌詞欄には構成タグだけを入れてください。',
      noteStyle: 'Suno のスタイル欄は文字数制限があります。このタグは200文字以内に収めています。',
      noteLyrics: '大括弧のセクション表記は歌われません。曲の構成を伝える記号です。',
      notePrompt: 'そのまま貼り付けて「2番だけ書き直して」などと頼むと早いです。',
      female: '女性', male: '男性', duet: 'デュエット', group: 'グループ・合唱', rap: 'ラップ', child: '子どもの声',
      airy: 'エアリー', husky: 'ハスキー', power: 'パワフル', whisper: 'ささやき', natural: '自然な声', falsetto: 'ファルセット',
      lenShort: 'ショート 60〜90秒', lenStd: '標準 3分', lenFull: '拡張 3分40秒',
      tKo: '韓国語', tEn: '英語', tJa: '日本語'
    },
    zh: {
      step: ['01', '02', '03', '04', '05', '06', '07', '08', '09'],
      genre: '曲风', sub: '子曲风', mood: '氛围', moodHint: '最多3个',
      tempo: '速度', vocal: '人声', tone: '音色', lyricLang: '歌词语言',
      theme: '主题', kw: '关键词', kwHint: '逗号分隔 · 可选',
      kwPlaceholder: '例：初雪、下班路、空房间',
      len: '长度与结构', bpm: 'BPM',
      build: '生成提示词与歌词', again: '重新生成', reset: '重置',
      tStyle: 'Suno 风格', tStyleDesc: '直接粘贴到 Style of Music',
      tFull: '扩展风格提示词', tFullDesc: '用于 Flow Music、Udio 等可写长文的地方',
      tLyrics: '歌词', tLyricsDesc: '直接粘贴到 Custom Mode 歌词栏',
      tPrompt: 'ChatGPT / Gemini 提示词', tPromptDesc: '想继续打磨时粘贴',
      tTitles: '歌名候选',
      copy: '复制', copied: '已复制', copyFail: '复制被阻止，请手动选择文本。',
      chars: ' 字符', lines: '行',
      empty: '点击生成后，风格标签、歌词与提示词会显示在这里。',
      keyboard: '纯音乐 — 只输出结构标签',
      moodMax: '氛围最多可选3个。',
      instrumental: '纯音乐', noLyrics: '将生成无人声的纯音乐。歌词栏只放结构标签。',
      noteStyle: 'Suno 的风格栏有字数限制，这行标签控制在200字以内。',
      noteLyrics: '方括号里的段落标记不会被唱出来，只用来告诉模型歌曲结构。',
      notePrompt: '直接粘贴，再让它“只重写第二段”或“再短一点”。',
      female: '女声', male: '男声', duet: '对唱', group: '组合·合唱', rap: '说唱', child: '童声',
      airy: '气声', husky: '沙哑', power: '爆发力', whisper: '耳语', natural: '自然', falsetto: '假声',
      lenShort: '短视频 60–90秒', lenStd: '标准 3分钟', lenFull: '扩展 3分40秒',
      tKo: '韩语', tEn: '英语', tJa: '日语'
    }
  }[LANG];

  /* ---------------- 장르 ---------------- */
  var GENRES = [
    { id: 'kpop', name: 'K-Pop', tags: ['k-pop', 'dance-pop'], bpm: 118,
      subs: [ { n: { ko: '댄스팝', en: 'Dance pop', ja: 'ダンスポップ', zh: '舞曲流行' }, tag: 'dance-pop' },
              { n: { ko: 'K-팝 발라드', en: 'K-pop ballad', ja: 'K-POPバラード', zh: 'K-POP 抒情' }, tag: 'k-pop ballad' },
              { n: { ko: 'K-힙합', en: 'Korean hip hop', ja: 'K-ヒップホップ', zh: '韩式嘻哈' }, tag: 'korean hip hop' },
              { n: { ko: '밴드 편성', en: 'K-pop band', ja: 'バンド編成', zh: '乐队编制' }, tag: 'k-pop band' } ],
      instr: ['punchy synth bass', 'gated drum kit', 'brass stabs', 'plucked synth'], prod: ['polished radio mix', 'wide stereo chorus'] },
    { id: 'citypop', name: 'City Pop', tags: ['city pop', 'japanese city pop'], bpm: 102,
      subs: [ { n: { ko: '80년대 시티팝', en: '80s city pop', ja: '80年代シティポップ', zh: '80年代城市流行' }, tag: '80s city pop' },
              { n: { ko: '네오 시티팝', en: 'Neo city pop', ja: 'ネオシティポップ', zh: '新城市流行' }, tag: 'neo city pop' },
              { n: { ko: '야간 드라이브', en: 'Night drive', ja: '夜のドライブ', zh: '夜间兜风' }, tag: 'night drive city pop' } ],
      instr: ['chorus electric guitar', 'slap bass', 'electric piano', 'analog synth pad'], prod: ['80s analog warmth', 'gated reverb drums'] },
    { id: 'lofi', name: 'Lo-fi Hip Hop', tags: ['lo-fi hip hop', 'chillhop'], bpm: 78,
      subs: [ { n: { ko: '재즈 로파이', en: 'Jazzhop', ja: 'ジャズホップ', zh: '爵士 Lo-fi' }, tag: 'jazzhop' },
              { n: { ko: '공부용 로파이', en: 'Study lo-fi', ja: '勉強用ローファイ', zh: '学习 Lo-fi' }, tag: 'study lo-fi' },
              { n: { ko: '비 오는 로파이', en: 'Rainy lo-fi', ja: '雨のローファイ', zh: '雨天 Lo-fi' }, tag: 'rainy lo-fi' } ],
      instr: ['dusty piano', 'vinyl crackle', 'brushed drums', 'upright bass'], prod: ['tape saturation', 'low-pass filter'] },
    { id: 'ballad', name: 'Ballad', tags: ['ballad', 'pop ballad'], bpm: 74,
      subs: [ { n: { ko: '피아노 발라드', en: 'Piano ballad', ja: 'ピアノバラード', zh: '钢琴抒情' }, tag: 'piano ballad' },
              { n: { ko: '어쿠스틱 발라드', en: 'Acoustic ballad', ja: 'アコースティックバラード', zh: '原声抒情' }, tag: 'acoustic ballad' },
              { n: { ko: '록 발라드', en: 'Power ballad', ja: 'パワーバラード', zh: '摇滚抒情' }, tag: 'power ballad' } ],
      instr: ['grand piano', 'string section', 'acoustic guitar', 'soft drums'], prod: ['emotional build', 'vocal-forward mix'] },
    { id: 'rnb', name: 'R&B / Soul', tags: ['r&b', 'neo-soul'], bpm: 88,
      subs: [ { n: { ko: '네오 소울', en: 'Neo-soul', ja: 'ネオソウル', zh: '新灵魂乐' }, tag: 'neo-soul' },
              { n: { ko: '콰이어트 스톰', en: 'Quiet storm', ja: 'クワイエットストーム', zh: '静谧风暴' }, tag: 'quiet storm' },
              { n: { ko: '알앤비 팝', en: 'Alt R&B', ja: 'オルタナR&B', zh: '另类 R&B' }, tag: 'alt r&b' } ],
      instr: ['rhodes electric piano', 'warm bass', 'muted guitar', 'finger-snap groove'], prod: ['silky vocal layering', 'vintage tape'] },
    { id: 'edm', name: 'EDM', tags: ['edm', 'dance'], bpm: 128,
      subs: [ { n: { ko: '페스티벌 하우스', en: 'Festival house', ja: 'フェスティバルハウス', zh: '音乐节浩室' }, tag: 'festival house' },
              { n: { ko: '퓨처 베이스', en: 'Future bass', ja: 'フューチャーベース', zh: '未来贝斯' }, tag: 'future bass' },
              { n: { ko: '신스웨이브', en: 'Synthwave', ja: 'シンセウェーブ', zh: '合成器浪潮' }, tag: 'synthwave' } ],
      instr: ['sidechain synth', 'four-on-the-floor kick', 'supersaw lead', 'riser fx'], prod: ['festival drop', 'sidechain pumping'] },
    { id: 'rock', name: 'Rock', tags: ['rock', 'pop rock'], bpm: 132,
      subs: [ { n: { ko: '인디 록', en: 'Indie rock', ja: 'インディーロック', zh: '独立摇滚' }, tag: 'indie rock' },
              { n: { ko: '팝 록', en: 'Pop rock', ja: 'ポップロック', zh: '流行摇滚' }, tag: 'pop rock' },
              { n: { ko: '브릿팝', en: 'Britpop', ja: 'ブリットポップ', zh: '英伦摇滚' }, tag: 'britpop' } ],
      instr: ['distorted electric guitars', 'live drums', 'driving bass'], prod: ['room-recorded drums', 'guitar layers'] },
    { id: 'hiphop', name: 'Hip-Hop', tags: ['hip hop', 'rap'], bpm: 90,
      subs: [ { n: { ko: '붐뱁', en: 'Boom bap', ja: 'ブーンバップ', zh: 'Boom bap' }, tag: 'boom bap' },
              { n: { ko: '트랩', en: 'Trap', ja: 'トラップ', zh: 'Trap' }, tag: 'trap' },
              { n: { ko: '재즈 힙합', en: 'Jazz rap', ja: 'ジャズラップ', zh: '爵士说唱' }, tag: 'jazz rap' } ],
      instr: ['boom bap drums', 'sampled soul chops', 'deep 808 bass'], prod: ['sample-based', 'punchy drums'] },
    { id: 'jazz', name: 'Jazz', tags: ['jazz', 'smooth jazz'], bpm: 100,
      subs: [ { n: { ko: '스무스 재즈', en: 'Smooth jazz', ja: 'スムースジャズ', zh: '柔顺爵士' }, tag: 'smooth jazz' },
              { n: { ko: '스윙', en: 'Swing', ja: 'スウィング', zh: '摇摆' }, tag: 'swing jazz' },
              { n: { ko: '보사노바', en: 'Bossa nova', ja: 'ボサノヴァ', zh: '巴萨诺瓦' }, tag: 'bossa nova' } ],
      instr: ['upright bass', 'brushed drums', 'grand piano', 'muted trumpet'], prod: ['live room sound', 'swing feel'] },
    { id: 'acoustic', name: 'Acoustic / Folk', tags: ['acoustic', 'folk'], bpm: 92,
      subs: [ { n: { ko: '포크', en: 'Folk', ja: 'フォーク', zh: '民谣' }, tag: 'folk' },
              { n: { ko: '캠프파이어', en: 'Campfire folk', ja: 'キャンプファイア', zh: '篝火民谣' }, tag: 'campfire folk' },
              { n: { ko: '인디 포크', en: 'Indie folk', ja: 'インディーフォーク', zh: '独立民谣' }, tag: 'indie folk' } ],
      instr: ['fingerpicked acoustic guitar', 'light percussion', 'harmonica', 'standup bass'], prod: ['intimate room mic', 'close harmonies'] },
    { id: 'trot', name: 'Trot', tags: ['korean trot', 'ppongjjak'], bpm: 116,
      subs: [ { n: { ko: '정통 트로트', en: 'Classic trot', ja: '正統派トロット', zh: '正统 Trot' }, tag: 'classic trot' },
              { n: { ko: '세미 트로트', en: 'Semi trot', ja: 'セミトロット', zh: '半 Trot' }, tag: 'semi trot' },
              { n: { ko: '댄스 트로트', en: 'Dance trot', ja: 'ダンストロット', zh: '舞曲 Trot' }, tag: 'dance trot' } ],
      instr: ['accordion', 'trot guitar', 'brass section', 'electronic kick'], prod: ['bright mix', 'live band feel'] },
    { id: 'cinematic', name: 'Cinematic / OST', tags: ['cinematic', 'orchestral'], bpm: 82,
      subs: [ { n: { ko: '드라마 OST', en: 'Drama OST', ja: 'ドラマOST', zh: '剧集 OST' }, tag: 'k-drama ost' },
              { n: { ko: '웅장한 오케스트라', en: 'Epic orchestral', ja: '壮大なオーケストラ', zh: '史诗管弦' }, tag: 'epic orchestral' },
              { n: { ko: '자장가', en: 'Lullaby', ja: '子守唄', zh: '摇篮曲' }, tag: 'lullaby' } ],
      instr: ['strings', 'grand piano', 'timpani', 'choir pads'], prod: ['film score mix', 'wide dynamics'] }
  ];

  /* ---------------- 분위기 ---------------- */
  var MOODS = [
    { id: 'bright', n: { ko: '밝은', en: 'Bright', ja: '明るい', zh: '明亮' }, tag: 'bright' },
    { id: 'romantic', n: { ko: '설레는', en: 'Romantic', ja: 'ときめく', zh: '心动' }, tag: 'romantic' },
    { id: 'dreamy', n: { ko: '몽환적', en: 'Dreamy', ja: '夢見心地', zh: '梦幻' }, tag: 'dreamy' },
    { id: 'warm', n: { ko: '따뜻한', en: 'Warm', ja: '温かい', zh: '温暖' }, tag: 'warm' },
    { id: 'sad', n: { ko: '쓸쓸한', en: 'Melancholic', ja: '物悲しい', zh: '惆怅' }, tag: 'melancholic' },
    { id: 'intense', n: { ko: '강렬한', en: 'Intense', ja: '強烈', zh: '强烈' }, tag: 'intense' },
    { id: 'groovy', n: { ko: '그루브한', en: 'Groovy', ja: 'グルーヴィー', zh: '律动' }, tag: 'groovy' },
    { id: 'lyrical', n: { ko: '서정적', en: 'Lyrical', ja: '叙情的', zh: '抒情' }, tag: 'lyrical' },
    { id: 'epic', n: { ko: '웅장한', en: 'Epic', ja: '壮大', zh: '壮阔' }, tag: 'epic' },
    { id: 'playful', n: { ko: '익살스러운', en: 'Playful', ja: 'おどけ', zh: '俏皮' }, tag: 'playful' },
    { id: 'latenight', n: { ko: '새벽감성', en: 'Late night', ja: '深夜の情緒', zh: '深夜感' }, tag: 'late night' },
    { id: 'fresh', n: { ko: '청량한', en: 'Fresh', ja: '清涼', zh: '清爽' }, tag: 'fresh' }
  ];

  /* ---------------- 보컬·톤·가사 언어·길이 ---------------- */
  var VOCALS = [
    { id: 'female', tag: 'female vocal' },
    { id: 'male', tag: 'male vocal' },
    { id: 'duet', tag: 'male and female duet' },
    { id: 'group', tag: 'group vocals with harmonies' },
    { id: 'rap', tag: 'rap vocal' },
    { id: 'child', tag: 'child vocal' },
    { id: 'instrumental', tag: 'instrumental, no vocals' }
  ];
  var TONES = [
    { id: 'airy', tag: 'airy breathy delivery' },
    { id: 'husky', tag: 'husky raspy tone' },
    { id: 'power', tag: 'powerful belting' },
    { id: 'whisper', tag: 'whispered intimate delivery' },
    { id: 'natural', tag: 'natural conversational delivery' },
    { id: 'falsetto', tag: 'falsetto runs' }
  ];
  var LYRIC_LANGS = [
    { id: 'ko', tag: 'korean lyrics' },
    { id: 'en', tag: 'english lyrics' },
    { id: 'ja', tag: 'japanese lyrics' }
  ];
  var LENGTHS = [
    { id: 'short', key: 'lenShort', approx: '1:10', ko: '약 1분 10초', en: 'about 1:10', ja: '約1分10秒', zh: '约1分10秒' },
    { id: 'std', key: 'lenStd', approx: '3:05', ko: '약 3분 5초', en: 'about 3:05', ja: '約3分5秒', zh: '约3分5秒' },
    { id: 'full', key: 'lenFull', approx: '3:40', ko: '약 3분 40초', en: 'about 3:40', ja: '約3分40秒', zh: '约3分40秒' }
  ];

  /* ---------------- 주제 ---------------- */
  var THEMES = [
    { id: 'love', n: { ko: '사랑·설렘', en: 'Love', ja: '恋・ときめき', zh: '爱情' }, tag: 'love and butterflies' },
    { id: 'breakup', n: { ko: '이별·미련', en: 'Breakup', ja: '別れ', zh: '离别' }, tag: 'breakup and lingering' },
    { id: 'city', n: { ko: '새벽 도시', en: 'City at night', ja: '夜の街', zh: '深夜城市' }, tag: 'neon city at 2 a.m.' },
    { id: 'dream', n: { ko: '꿈·도전', en: 'Dream & hustle', ja: '夢・挑戦', zh: '梦想与打拼' }, tag: 'dreams and not giving up' },
    { id: 'healing', n: { ko: '위로·쉼', en: 'Comfort', ja: '慰め・休息', zh: '安慰与休息' }, tag: 'comfort and rest' },
    { id: 'nostalgia', n: { ko: '그리움·고향', en: 'Nostalgia', ja: '懐かしさ', zh: '怀念' }, tag: 'hometown nostalgia' },
    { id: 'pet', n: { ko: '반려견·산책', en: 'Dog & walks', ja: '犬・散歩', zh: '狗狗与散步' }, tag: 'a dog waiting at home' }
  ];

  /* =========================================================
     가사 문장 묶음 (자체 작성)
     ========================================================= */
  var LY = {
    love: {
      ko: {
        v: ['네 이름을 부르면 하루가 조금 밝아져', '우연처럼 지나간 자리에 네 웃음이 남아', '아무 일도 아닌 말에 하루 종일 웃었어', '손끝이 닿을 듯한 거리에서 멈춰 서', '같은 버스, 같은 창가, 같은 시간을 기다려', '늦은 저녁 네 목소리에 하루가 정리돼', '좋아한다는 말 대신 날씨를 물었어', '내일도 너를 만나러 가는 길이 제일 가벼워'],
        p: ['서두르지 않아도 돼', '이 마음이 네게 닿을 때까지'],
        h: ['너라는 계절이 내 안에 와', '좋아한다고, 이제 말할래', '네 옆이 내가 제일 편한 자리야'],
        c: ['별일 없는 하루도 네가 있으면 특별해', '아침이 조금 더 일찍 와도 좋아', '같은 자리에서 같은 마음으로', '천천히, 그러나 오래', '표현이 서툴러도 진심인 걸 알아줘', '이 노래가 네게 닿으면 좋겠어'],
        b: ['혹시 네가 다른 곳을 본대도', '나는 여기서 너를 기다릴게'],
        o: ['오늘도, 내일도 너야'],
        t: ['너라는 계절', '늦은 저녁의 너', '같은 창가', '좋아한다고 말할래']
      },
      en: {
        v: ['When I say your name the whole day gets a little brighter', 'Your laughter stays where you happened to pass by', 'I laughed all day over nothing at all', 'I stop where our fingertips almost meet', 'Same bus, same window seat, same hour — I wait', 'Your voice at night sorts out my day', 'Instead of saying I like you, I asked about the weather', 'The walk to see you is the lightest road I know'],
        p: ['No need to rush', 'Until this feeling reaches you'],
        h: ["You're the season that moved into me", "I'm going to say it: I like you", 'The seat beside you is the easiest place to be'],
        c: ["An ordinary day turns special when you're in it", "I don't mind if morning comes a little early", 'In the same place, with the same heart', 'Slowly, but for a long time', "I'm clumsy with words — read the feeling instead", 'I hope this song reaches you'],
        b: ['Even if you look somewhere far away', "I'll be here, waiting"],
        o: ['Today, tomorrow — it’s you'],
        t: ['The Season You Are', 'You at Late Evening', 'The Same Window Seat', 'I Like You']
      },
      ja: {
        v: ['君の名前を呼ぶと 一日が少し明るくなる', '偶然みたいに過ぎた場所に 君の笑顔が残ってる', 'なんでもない言葉に 一日中笑ってた', '指先が触れそうな距離で 立ち止まる', '同じバス、同じ窓際、同じ時間を待ってる', '夜遅くの君の声で 一日が片付く', '「好き」の代わりに 天気を聞いた', '明日も君に会いに行く道が いちばん軽い'],
        p: ['急がなくていい', 'この気持ちが君に届くまで'],
        h: ['君という季節が 僕の中に来た', '好きだって もう言うよ', '君の隣が いちばん楽な場所'],
        c: ['何でもない日も 君がいれば特別', '朝が少し早く来てもいい', '同じ場所で 同じ気持ちで', 'ゆっくり、でも長く', '言葉は下手でも 本気なんだ', 'この歌が君に届けばいい'],
        b: ['もし君が違う方を見ていても', '僕はここで待ってる'],
        o: ['今日も 明日も 君だ'],
        t: ['君という季節', '夜遅くの君', '同じ窓辺', '好きだって言うよ']
      }
    },
    breakup: {
      ko: {
        v: ['마지막 인사는 생각보다 짧았어', '지운 번호를 아직 외우고 있어', '같이 걷던 골목이 오늘따라 길어', '네가 두고 간 우산을 아직 못 버렸어', '사진 속 웃음이 이제는 낯설어', '알람을 껐어, 아침에 너에게 갈 일이 없으니까', '좋았던 날만 골라서 기억하게 돼', '괜찮다는 말이 제일 어려웠어'],
        p: ['다 괜찮을 거라고', '몇 번을 스스로에게 말해'],
        h: ['우리는 여기서 끝인 거야', '돌아오지 마, 나는 아직 약해', '너 없이도 잘 지내야 하는데'],
        c: ['목소리만 들어도 무너질 것 같아', '지난 계절은 반쯤만 지워졌어', '익숙한 자리가 너무 많아서', '시간이 약이라면 너무 느려', '잘 지내라는 말은 하지 마', '나는 아직 너를 보내는 중이야'],
        b: ['사랑했던 날은 미워할 수 없어서', '그게 제일 오래 아플 것 같아'],
        o: ['안녕, 한 번만 더는 말하지 않을게'],
        t: ['짧았던 인사', '지우지 못한 번호', '반쯤 지워진 계절', '너 없이도']
      },
      en: {
        v: ['The last goodbye was shorter than I thought', 'I still know your number by heart', 'The alley we walked together feels longer today', "I still haven't thrown away the umbrella you left", 'The smiles in old photos look like strangers now', "I turned off my alarm — there's nowhere to go for you", 'I only keep the good days in memory', 'Saying "I\'m okay" was the hardest part'],
        p: ["It'll all be fine", 'I keep telling myself'],
        h: ['So this is where we end', "Don't come back, I'm still weak", 'I should be fine without you'],
        c: ["One word of your voice and I'd fall apart", 'Last season is only half erased', 'Too many places still know you', "If time heals, it's far too slow", "Don't tell me to take care", "I'm still letting you go"],
        b: ["I can't hate the days we loved", "That's why it'll hurt the longest"],
        o: ["Goodbye — I won't say it again"],
        t: ['A Short Goodbye', 'The Number I Didn’t Delete', 'Only Half Erased', 'Fine Without You']
      },
      ja: {
        v: ['最後の挨拶は 思ったより短かった', '消した番号を まだ全部覚えてる', '一緒に歩いた路地が 今日はやけに長い', '置いていった傘を まだ捨てられない', '写真の中の笑顔が もう他人みたい', 'アラームを消した 君に会いに行く朝はないから', 'いい日ばかり拾って 思い出してしまう', '「大丈夫」って言葉が いちばん難しかった'],
        p: ['きっと全部大丈夫', '何度も自分に言ってる'],
        h: ['僕らはここで終わりなの', '戻ってこないで まだ弱いから', '君なしでも平気でいるべきなのに'],
        c: ['声を聞いたら崩れそうで', '過ぎた季節は半分しか消えない', 'なじみの場所が多すぎる', '時間が薬なら遅すぎる', '「元気で」なんて言わないで', 'まだ君を手放している途中'],
        b: ['愛した日を憎めないから', 'それがいちばん長く痛む'],
        o: ['さよなら もう一度とは言わない'],
        t: ['短い挨拶', '消せない番号', '半分だけ消えた季節', '君なしでも']
      }
    },
    city: {
      ko: {
        v: ['막차를 놓치고도 아무렇지 않았어', '편의점 불빛이 길을 대신 밝혀', '이어폰 볼륨을 끝까지 올려', '빌딩 숲 사이로 바람이 지나가', '택시는 빈 채로 나를 지나쳐', '새벽 두 시, 도시는 아직 말이 많아', '지하철 계단 위로 달빛이 흘러', '나를 모르는 얼굴들 사이가 편해'],
        p: ['이 밤이 끝나지 않으면', '그냥 걸어볼래'],
        h: ['새벽 두 시의 도시는 나를 닮았어', '네온이 켜진 거리에서 나는 자유로워', '아무도 모르는 밤, 여기가 내 방'],
        c: ['신호등 앞에 서 있는 사람 하나 없어', '유리창에 비친 나와 눈이 마주쳐', '발소리만 크게 길을 따라가', '오늘 밤은 어디로든 갈 수 있어', '도시는 잠들지 않고 나도 잠들 수 없어'],
        b: ['아침이 오면 사라질 얼굴들', '지금만큼은 내 편인 듯해'],
        o: ['이 밤을 다 걸을 때까지'],
        t: ['새벽 두 시', '네온 아래', '막차를 놓친 밤', '도시가 나를 닮은 밤']
      },
      en: {
        v: ['I missed the last train and it didn’t matter', 'Convenience-store light does the job of the streetlights', 'I turn the volume all the way up', 'Wind moves between the buildings', 'Empty taxis pass me by', 'Two in the morning — the city still talks too much', 'Moonlight spills down the subway stairs', "I'm comfortable among faces that don't know me"],
        p: ["If this night won't end", "I'll just keep walking"],
        h: ['The city at two a.m. looks like me', "On the neon street I'm free", 'A night nobody knows — this is my room'],
        c: ['No one standing at the crossing', 'My reflection meets my eyes in the glass', 'Only my footsteps follow the road', 'Tonight I could go anywhere', "The city won't sleep and neither will I"],
        b: ['Faces that will vanish by morning', 'For now they seem to be on my side'],
        o: ["Until I've walked all of this night"],
        t: ['Two in the Morning', 'Under the Neon', 'The Night I Missed the Last Train']
      },
      ja: {
        v: ['終電を逃しても どうってことなかった', 'コンビニの明かりが 街灯の代わり', 'イヤホンの音量を 端まで上げる', 'ビルの森を 風が抜けていく', '空のタクシーが 僕を追い越す', '午前二時 街はまだ話したいらしい', '地下鉄の階段に 月明かりがこぼれる', '僕を知らない顔ぶれの中が 楽だ'],
        p: ['この夜が終わらないなら', 'ただ歩いてみよう'],
        h: ['午前二時の街は 僕に似ている', 'ネオンが灯る通りで 僕は自由だ', '誰も知らない夜 ここが僕の部屋'],
        c: ['横断歩道に 立っている人はいない', 'ガラスに映った僕と 目が合う', '足音だけが 道についてくる', '今夜はどこへでも行ける', '街は眠らないし 僕も眠れない'],
        b: ['朝になれば消える顔たち', '今だけは味方のようで'],
        o: ['この夜を歩き切るまで'],
        t: ['午前二時', 'ネオンの下', '終電を逃した夜']
      }
    },
    dream: {
      ko: {
        v: ['노트에 적은 계획이 벌써 다섯 해째', '웃으라고 한 말들이 가끔은 날 세워', '남들보다 느려도 내 속도로 갈래', '새벽 작업실 불은 나만 켜 두는 게 아냐', '실패한 기록도 다 내 이력서야', '이번엔 다를 거라는 말, 믿어보기로 했어', '지하철 창문에 내 얼굴이 다짐을 해', '시작이 반이라면 나는 벌써 절반쯤 왔어'],
        p: ['한 번 더, 한 번만 더', '그러다 보면 다 와 있을 거야'],
        h: ['나는 아직 가는 중이야', '멈추지 않는 게 내 답이야', '언젠가 이 새벽이 날 증명할 거야'],
        c: ['빠른 사람들 옆에서도 흔들리지 않아', '내 이름이 빛나는 날까지', '지금의 이 답답함도 지나갈 거야', '끝까지 해 본 사람만 알 수 있어', '오늘 한 걸음이 내일의 나를 만들어'],
        b: ['안 된다는 말은 내가 할 말이 아니야', '해 보지도 않고 정할 수 없어'],
        o: ['그리고, 결국 해냈어'],
        t: ['가는 중', '새벽 작업실', '내 속도로', '한 걸음 더']
      },
      en: {
        v: ['The plan in my notebook is five years old now', 'Sometimes the "just smile" advice slows me down', "Slower than the rest — I'll go at my own speed", "I'm not the only one with the studio light on at dawn", 'Even the failures belong on my résumé', 'I decided to believe that this time will be different', 'My reflection makes a promise in the train window', "If starting is half, I'm already halfway there"],
        p: ['One more, just one more', "Then I'll be there"],
        h: ["I'm still on my way", 'Not stopping is my answer', 'Someday this dawn will prove it'],
        c: ["I don't waver next to the faster ones", 'Until the day my name shines', 'This stuck feeling will pass too', 'Only those who finish ever know', "Today's one step builds tomorrow's me"],
        b: ['"Impossible" isn\'t mine to say', "Not before I've tried"],
        o: ['And in the end — I did it'],
        t: ['On My Way', 'Studio at Dawn', 'At My Own Speed']
      },
      ja: {
        v: ['ノートに書いた計画は もう五年目', '「笑って」と言われた言葉に 時々足を止める', '人より遅くても 自分の速さで行く', '夜明けの作業部屋の明かりは 僕だけじゃない', '失敗した記録も 全部僕の経歴書だ', '「今度は違う」って 信じてみることにした', '電車の窓に映る顔が 決意をする', '始まりが半分なら もう半分は来ている'],
        p: ['もう一度 あと一回だけ', 'そうすれば きっと着いてる'],
        h: ['僕はまだ行く途中だ', '止まらないことが 僕の答え', 'いつかこの夜明けが 僕を証明する'],
        c: ['速い人たちの隣でも 揺れない', '僕の名前が光る日まで', 'この息苦しさも きっと過ぎる', '最後までやった人だけが分かる', '今日の一歩が 明日の僕をつくる'],
        b: ['「無理」は 僕が言う言葉じゃない', 'やってみないと決められない'],
        o: ['そして 結局 やってのけた'],
        t: ['行く途中', '夜明けの作業部屋', '自分の速さで']
      }
    },
    healing: {
      ko: {
        v: ['오늘은 아무것도 하지 않아도 돼', '창문 열고 바람 좀 쐬어', '잘못한 것만 세는 밤이면', '따뜻한 물 한 잔 천천히 마셔', '다들 잘 사는 것처럼 보여도', '지친 건 네가 약해서가 아니야', '숨이 조금 가빠도 괜찮아', '내일의 나에게 미안하지 않아도 돼'],
        p: ['여기 잠깐 앉아', '아무 말 없어도 괜찮아'],
        h: ['오늘은 그냥 쉬어도 돼', '너는 충분히 잘하고 있어', '이 노래가 네 어깨를 두드릴게'],
        c: ['어제의 실수는 어제에 두고', '아무 일도 없는 저녁도 좋은 거야', '서두르지 않아도 시간은 온다', '너를 아끼는 사람이 여기 있어', '한숨은 내쉬라고 있는 거야'],
        b: ['힘든 날이 있어야', '쉬는 날이 더 따뜻해져'],
        o: ['잘 자, 내일도 괜찮을 거야'],
        t: ['쉬어도 돼', '창문 열고', '천천히 마셔', '어깨를 두드릴게']
      },
      en: {
        v: ["You don't have to do anything today", 'Open the window and let some air in', "If it's a night of counting every mistake", 'Drink a warm cup slowly', "Everyone looks like they're doing fine", "Being tired isn't proof you're weak", "It's all right if your breath comes short", "You don't owe tomorrow an apology"],
        p: ['Sit here a moment', 'Silence is fine'],
        h: ['Today you’re allowed to rest', "You're doing more than enough", 'This song will tap you on the shoulder'],
        c: ["Leave yesterday's mistake in yesterday", 'A quiet evening counts as a good day', "Time comes even when you don't hurry", "Someone here thinks you're worth keeping", 'Sighs exist so you can let them out'],
        b: ['Hard days make the resting ones warmer', 'That is the only reason they come'],
        o: ['Sleep well — tomorrow will be fine'],
        t: ["You're Allowed to Rest", 'Open the Window', 'Slow Cup']
      },
      ja: {
        v: ['今日は 何もしなくていい', '窓を開けて 少し風に当たって', '間違いばかり数える夜なら', '温かい一杯を ゆっくり飲んで', 'みんな上手くやってるように見えても', '疲れたのは 弱いからじゃない', '息が少し速くても 大丈夫', '明日の自分に 謝らなくていい'],
        p: ['ここに少しだけ座って', '何も話さなくていい'],
        h: ['今日はただ休んでいい', '君はもう十分やってる', 'この歌が君の肩を叩くよ'],
        c: ['昨日の失敗は 昨日に置いてきて', '何でもない夜も いい夜だよ', '急がなくても 時間は来る', '君を大事に思う人が ここにいる', 'ため息は 出していいためにある'],
        b: ['つらい日があるから', '休む日がもっと温かくなる'],
        o: ['おやすみ 明日も大丈夫'],
        t: ['休んでいい', '窓を開けて', 'ゆっくり飲んで']
      }
    },
    nostalgia: {
      ko: {
        v: ['고향집 마당의 감나무를 아직 기억해', '학교 끝나면 달려가던 골목이 따로 있어', '엄마가 부르던 저녁 이름 소리', '겨울이면 방바닥이 제일 따뜻했어', '사진관 앞에서 다섯 명이 웃던 날', '지금은 아무도 없는 번지수도 있어', '돌아가면 다 그대로일 것 같아서', '두렵고도 그리운 마음으로 버스를 타'],
        p: ['다 잘 지내고 있겠지', '나만 이 시간에 서 있어'],
        h: ['그리운 건 그때 그 사람이야', '돌아가고 싶은 곳은 그날이야', '여전히 내 꿈엔 그 골목이 와'],
        c: ['아무것도 사지 않아도 좋았던 가게', '창에 비친 얼굴이 아버지를 닮아 가', '같은 노래가 여기서는 다르게 들려', '잊었다고 말하면 거짓말이 돼', '오래된 사진처럼 색이 바래도'],
        b: ['시간은 한 방향으로만 가지만', '마음은 그 집에 자주 들러'],
        o: ['잘 지내요, 그곳의 나'],
        t: ['그 골목', '아무것도 없는 번지', '그날의 골목', '그해의 저녁']
      },
      en: {
        v: ['I still remember the persimmon tree in the yard', 'There’s one alley where we ran after school', 'The sound of my mother calling for dinner', 'In winter the heated floor was the warmest place', 'The day five of us laughed in front of the photo studio', 'Some house numbers have no one living there now', "I think it'll all be the same if I go back", 'I get on the bus half afraid, half longing'],
        p: ['Everyone must be doing fine', "I'm the one still standing in that hour"],
        h: ['What I miss is the people from back then', 'The place I want to return to is that day', 'The alley still visits my dreams'],
        c: ['A shop where buying nothing was fine', 'The face in the window grows to look like my father', 'The same song sounds different here', 'Saying I forget would be a lie', 'Even when it fades like an old photograph'],
        b: ['Time only moves one way', 'My mind keeps dropping by that house'],
        o: ['Take care, me from that place'],
        t: ['That Alley', 'The House with No Number', "That Year's Evening"]
      },
      ja: {
        v: ['実家の庭の柿の木を まだ覚えてる', '放課後に駆けた路地が ひとつある', '夕飯を呼ぶ 母の声', '冬は 床暖房の上が一番あったかかった', '写真館の前で 五人が笑った日', '今は誰もいない番地もある', '帰ればきっと 全部そのままの気がして', '怖くて恋しい気持ちで バスに乗る'],
        p: ['みんな元気でいてるだろう', 'この時間に立っているのは 僕だけ'],
        h: ['恋しいのは あの頃のあの人だ', '帰りたい場所は あの日だ', '今でも夢に あの路地が来る'],
        c: ['何も買わなくても良かった店', '窓に映る顔が 父に似てくる', '同じ歌が ここでは違って聞こえる', '忘れたと言えば 嘘になる', '古い写真みたいに色褪せても'],
        b: ['時間は一方向にしか進まないけれど', '心はあの家に よく寄り道する'],
        o: ['元気でね あの場所の僕'],
        t: ['あの路地', '番地のない家', 'あの日の夕暮れ']
      }
    },
    pet: {
      ko: {
        v: ['문 열리는 소리만 들어도 달려와', '신발장 앞에서 꼬리를 먼저 흔들어', '오늘은 어디 갈지 네가 정해', '비 오는 날엔 창가에 나란히 앉아', '이름을 부르면 못 들은 척하다가', '간식 봉지 소리에 세상에서 제일 빠르지', '낮잠 자는 얼굴이 너무 진지해서 웃음이 나', '집에 가는 길이 이렇게 짧은 이유가 있어'],
        p: ['한 번만 더 냄새 맡고', '우리 집으로 가자'],
        h: ['너는 내 하루의 마지막 인사야', '짧은 다리로 오늘도 나를 기다렸지', '너는 내가 제일 잘하는 사랑이야'],
        c: ['비 오는 날 발자국이 마루에 남아', '산책 가자는 말에 벌써 문 앞이야', '아무 말 없이 기대 오는 온기', '너의 하품에 내 하루가 풀려', '평생을 함께 약속할 수 없어도', '지금 이 순간은 네 거야'],
        b: ['말을 못 해서 더 자세히 보게 돼', '그게 너의 방식이야'],
        o: ['잘 자, 내일도 산책 가자'],
        t: ['짧은 다리', '산책 가자', '창가에 나란히', '내 하루의 마지막 인사']
      },
      en: {
        v: ['You run over at the sound of the door', 'Tail already wagging in front of the shoe rack', 'Today you decide where we go', 'On rainy days we sit side by side at the window', "Call your name and you pretend you didn't hear", "At the sound of a treat bag you're the fastest thing alive", 'Your sleeping face is so serious it makes me laugh', "There's a reason the walk home is this short"],
        p: ['One more sniff', "Then let's head home"],
        h: ['You’re the last hello of my day', 'Short legs, and you waited for me again', 'You’re the love I do best'],
        c: ['Wet paw prints on the floor', 'At the word "walk" you’re already at the door', 'Warmth leaning on me without a word', 'Your yawn untangles my day', "I can't promise forever", 'But this moment is yours'],
        b: ["You can't speak, so I look closer", "That's your way"],
        o: ['Sleep well — walk again tomorrow'],
        t: ['Short Legs', "Let's Walk", 'Side by Side']
      },
      ja: {
        v: ['ドアが開く音だけで 走ってくる', '靴箱の前で もう尻尾を振ってる', '今日はどこへ行くか 君が決めて', '雨の日は 窓辺に並んで座る', '名前を呼ぶと 聞こえないふりをして', 'おやつの袋の音には 世界で一番速い', '昼寝の顔が真剣すぎて 笑ってしまう', '家までの道がこんなに短いのには 理由がある'],
        p: ['もう一回だけ匂いを嗅いで', 'うちへ帰ろう'],
        h: ['君は僕の一日の 最後のあいさつ', '短い足で 今日も待っていてくれた', '君は僕が一番上手な愛だ'],
        c: ['雨の日の足跡が 床に残る', '「散歩」の一言で もうドアの前', '何も言わずに寄りかかる温もり', '君のあくびで 僕の一日がほどける', '一生を約束できなくても', '今この瞬間は君のもの'],
        b: ['言葉がないから もっとよく見る', 'それが君のやり方'],
        o: ['おやすみ 明日も散歩に行こう'],
        t: ['短い足', '散歩に行こう', '窓辺に並んで']
      }
    }
  };

  /* =========================================================
     상태·난수
     ========================================================= */
  var state = {
    genre: 'kpop', sub: 0, moods: ['bright', 'romantic'], bpm: 118,
    vocal: 'female', tone: 'airy', lang: 'ko', theme: 'love',
    kw: '', len: 'std', seed: 20261126
  };

  function mulberry32(a) {
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      var t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  function byId(list, id) { for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i]; return list[0]; }
  function genre() { return byId(GENRES, state.genre); }
  function subOf(g) { return g.subs[Math.min(state.sub, g.subs.length - 1)]; }
  function nm(o) { return o.n[LANG] || o.n.ko; }

  /* =========================================================
     가사 조립
     ========================================================= */
  function window4(arr, rnd, avoidStart) {
    var len = arr.length, start = Math.floor(rnd() * Math.max(1, len - 3));
    if (avoidStart != null && Math.abs(start - avoidStart) < 3) start = (start + 4) % Math.max(4, len - 3);
    return arr.slice(start, start + 4);
  }

  var KW_PATTERNS = {
    ko: ['{k} 생각에 잠긴 밤이야', '{k}라는 말이 자꾸 맴돌아', '{k} 하나로 오늘을 버텼어'],
    en: ['I keep circling back to {k}', 'One word — {k} — and the night turns', 'I made it through today on {k} alone'],
    ja: ['{k} ばかり考えている夜', '「{k}」って言葉が 頭から離れない', '{k} ひとつで 今日を越えた']
  };

  function keywords() {
    return state.kw.split(/[,、·\/]/).map(function (s) { return s.trim(); }).filter(function (s) { return s && s.length <= 24; }).slice(0, 3);
  }

  function windowOf(arr, start, n) {
    var out = [];
    for (var i = 0; i < n; i++) out.push(arr[(start + i) % arr.length]);
    return out;
  }

  function buildLyrics(rnd) {
    var pack = LY[state.theme][state.lang];
    /* 8줄 묶음을 앞 4줄·뒤 4줄로 나눠 1절·2절에 씁니다(같은 줄 반복 방지). */
    var half = Math.floor(pack.v.length / 2);
    var s1 = rnd() < 0.5 ? 0 : half;
    var v1 = pack.v.slice(s1, s1 + 4);
    var s2 = (s1 + half) % pack.v.length;
    var v2 = pack.v.slice(s2, s2 + 4);
    var hook = pack.h[Math.floor(rnd() * pack.h.length)];
    var cs = Math.floor(rnd() * Math.max(1, pack.c.length - 2));
    var c1 = pack.c.slice(cs, cs + 2);
    var chorus = [hook].concat(c1, [hook]);
    var pre = pack.p.slice(Math.floor(rnd() * Math.max(1, pack.p.length - 1)), 2);
    if (pre.length < 2) pre = pack.p.slice(0, 2);
    var bridge = pack.b.slice(0, 2);
    var kws = keywords();
    if (kws.length) {
      var pat = KW_PATTERNS[state.lang][Math.floor(rnd() * 3)];
      v2 = v2.slice(0, 4).concat([pat.replace('{k}', kws[0])]);
    }
    var out = [];
    var len = state.len;
    if (len === 'short') {
      out.push('[Verse]', v1.slice(0, 2).join('\n'), '', '[Chorus]', chorus.join('\n'), '', '[Outro]', pack.o[0]);
      return out.join('\n');
    }
    out.push('[Verse 1]', v1.join('\n'), '');
    out.push('[Pre-Chorus]', pre.join('\n'), '');
    out.push('[Chorus]', chorus.join('\n'), '');
    out.push('[Verse 2]', v2.join('\n'), '');
    out.push('[Chorus]', chorus.join('\n'), '');
    if (len === 'full') {
      out.push('[Bridge]', bridge.join('\n'), '');
      out.push('[Final Chorus]', [hook].concat(c1, [hook], [hook]).slice(0, 5).join('\n'), '');
    }
    out.push('[Outro]', pack.o[0]);
    return out.join('\n');
  }

  function buildInstrumental(rnd) {
    var g = genre(), s = subOf(g);
    var bars = [
      '[Intro] ' + (g.instr[0] || 'piano') + ' motif, ' + state.bpm + ' bpm',
      '[Main Theme] ' + s.tag + ', ' + g.instr.slice(0, 2).join(', '),
      '[Build] drums enter, ' + (g.prod[0] || 'wide mix'),
      '[Instrumental Break] ' + (g.instr[2] || 'lead line') + ' solo',
      '[Outro] fade on ' + (g.instr[1] || g.instr[0])
    ];
    if (state.len === 'short') return bars.slice(0, 3).concat([bars[4]]).join('\n\n');
    return bars.join('\n\n');
  }

  /* =========================================================
     스타일 태그
     ========================================================= */
  function moodTags() {
    return state.moods.map(function (id) { return byId(MOODS, id).tag; });
  }

  function styleShort() {
    var g = genre(), s = subOf(g), v = byId(VOCALS, state.vocal), t = byId(TONES, state.tone);
    var parts = [];
    parts.push(g.name.toLowerCase() === 'edm' ? 'edm' : g.tags[0]);
    parts.push(s.tag);
    parts.push(state.bpm + ' bpm');
    moodTags().slice(0, 2).forEach(function (m) { parts.push(m); });
    if (state.vocal === 'instrumental') {
      parts.push('instrumental');
    } else {
      parts.push(v.tag);
      parts.push(t.tag);
      parts.push(byId(LYRIC_LANGS, state.lang).tag);
    }
    g.instr.slice(0, 2).forEach(function (i) { parts.push(i); });
    var out = parts.filter(Boolean).join(', ');
    /* 200자 제한 — 뒤에서부터 덜 중요한 요소를 덜어 냄 */
    while (out.length > 200 && parts.length > 5) { parts.pop(); out = parts.join(', '); }
    return out;
  }

  function styleFull() {
    var g = genre(), s = subOf(g), v = byId(VOCALS, state.vocal), t = byId(TONES, state.tone);
    var moods = moodTags();
    var len = byId(LENGTHS, state.len);
    var lines = [];
    var tagList = g.tags.concat([s.tag]).filter(function (x, i, a) { return a.indexOf(x) === i; });
    lines.push(tagList.join(', ') + ' · ' + state.bpm + ' BPM · ' + len.en);
    lines.push('Mood: ' + (moods.length ? moods.join(', ') : 'neutral') + ' · Theme: ' + byId(THEMES, state.theme).tag);
    lines.push('Vocal: ' + v.tag + (state.vocal === 'instrumental' ? '' : ', ' + t.tag));
    lines.push('Instrumentation: ' + g.instr.join(', '));
    lines.push('Production: ' + g.prod.join(', '));
    if (state.vocal === 'instrumental') lines.push('No vocals. Instrumental only.');
    else lines.push('Lyrics language: ' + byId(LYRIC_LANGS, state.lang).id + ' (' + byId(LYRIC_LANGS, state.lang).tag + ')');
    lines.push('Structure: ' + (state.len === 'short' ? 'intro, verse, chorus, outro' :
      state.len === 'full' ? 'intro, verse 1, pre-chorus, chorus, verse 2, chorus, bridge, final chorus, outro' :
        'intro, verse 1, pre-chorus, chorus, verse 2, chorus, outro'));
    lines.push('Avoid: heavy distortion, spoken intro, long silence, off-key tuning artifacts');
    return lines.join('\n');
  }

  /* =========================================================
     AI 프롬프트 (페이지 언어)
     ========================================================= */
  var PROMPT_T = {
    ko: function (d) {
      return [
        '당신은 ' + d.genre + ' 곡을 쓰는 전문 작사가입니다. 아래 조건에 맞춰 가사를 새로 써 주세요.',
        '',
        '· 장르: ' + d.genre + ' (' + d.sub + ')',
        '· 분위기: ' + d.moods,
        '· 템포: ' + d.bpm + ' BPM, ' + d.len,
        '· 보컬: ' + d.vocal,
        '· 언어: ' + d.langLabel,
        '· 주제: ' + d.theme + (d.kws ? ' / 키워드: ' + d.kws : ''),
        '· 구조: Verse 1 / Pre-Chorus / Chorus / Verse 2 / Chorus' + (d.full ? ' / Bridge / Final Chorus' : '') + ' / Outro (각 4줄)',
        '',
        '규칙',
        '1. 후렴은 같은 훅을 처음과 마지막에 반복해 귀에 남게 할 것.',
        '2. 1절과 2절은 서로 다른 장면으로 쓸 것(같은 표현 반복 금지).',
        '3. “영원히”, “운명” 같은 상투적 표현은 쓰지 말 것.',
        '4. 한 줄은 12~18자 안쪽으로, 부르기 쉽게.',
        '5. 구간 표기([Verse 1] 등)를 포함해 가사만 출력할 것.',
        '',
        '참고 가사 톤(그대로 쓰지 말고 더 좋게):',
        d.sketch
      ].join('\n');
    },
    en: function (d) {
      return [
        'You are a professional lyricist writing a ' + d.genre + ' song. Write new lyrics for the brief below.',
        '',
        '· Genre: ' + d.genre + ' (' + d.sub + ')',
        '· Mood: ' + d.moods,
        '· Tempo: ' + d.bpm + ' BPM, ' + d.len,
        '· Vocal: ' + d.vocal,
        '· Language: ' + d.langLabel,
        '· Theme: ' + d.theme + (d.kws ? ' / keywords: ' + d.kws : ''),
        '· Structure: Verse 1 / Pre-Chorus / Chorus / Verse 2 / Chorus' + (d.full ? ' / Bridge / Final Chorus' : '') + ' / Outro (4 lines each)',
        '',
        'Rules',
        '1. Repeat the same hook at the start and end of each chorus.',
        '2. Verse 1 and Verse 2 must show different scenes, no repeated phrases.',
        '3. Avoid clichés like "forever" and "destiny".',
        '4. Keep lines singable — roughly 8 to 12 syllables.',
        '5. Output lyrics only, with section tags such as [Verse 1].',
        '',
        'Reference tone (do not copy, improve on it):',
        d.sketch
      ].join('\n');
    },
    ja: function (d) {
      return [
        'あなたは' + d.genre + 'の曲を書くプロの作詞家です。以下の条件で歌詞を新しく書いてください。',
        '',
        '・ジャンル: ' + d.genre + ' (' + d.sub + ')',
        '・雰囲気: ' + d.moods,
        '・テンポ: ' + d.bpm + ' BPM、' + d.len,
        '・ボーカル: ' + d.vocal,
        '・言語: ' + d.langLabel,
        '・テーマ: ' + d.theme + (d.kws ? ' / キーワード: ' + d.kws : ''),
        '・構成: Verse 1 / Pre-Chorus / Chorus / Verse 2 / Chorus' + (d.full ? ' / Bridge / Final Chorus' : '') + ' / Outro (各4行)',
        '',
        'ルール',
        '1. サビは同じフックを最初と最後に繰り返す。',
        '2. 1番と2番は別の場面にする(同じ表現の繰り返し禁止)。',
        '3. 「永遠に」「運命」のようなありきたりな言葉は使わない。',
        '4. 1行は歌いやすい長さに。',
        '5. [Verse 1] などのセクション表記を含め、歌詞だけを出力する。',
        '',
        '参考の歌詞トーン(そのまま使わず、もっと良くしてください):',
        d.sketch
      ].join('\n');
    },
    zh: function (d) {
      return [
        '你是一位创作' + d.genre + '歌曲的专业作词人。请按下面的条件写出新的歌词。',
        '',
        '· 曲风：' + d.genre + '（' + d.sub + '）',
        '· 氛围：' + d.moods,
        '· 速度：' + d.bpm + ' BPM，' + d.len,
        '· 人声：' + d.vocal,
        '· 语言：' + d.langLabel,
        '· 主题：' + d.theme + (d.kws ? ' / 关键词：' + d.kws : ''),
        '· 结构：Verse 1 / Pre-Chorus / Chorus / Verse 2 / Chorus' + (d.full ? ' / Bridge / Final Chorus' : '') + ' / Outro（每段4行）',
        '',
        '规则',
        '1. 副歌在同一段开头和结尾重复同一句 hook。',
        '2. 第一段与第二段要写不同的场景，不要重复同样的句子。',
        '3. 避免“永远”“命运”这类套话。',
        '4. 每行要容易唱，长度适中。',
        '5. 只输出歌词，并保留 [Verse 1] 等段落标记。',
        '',
        '参考语气（不要照抄，写得更好）：',
        d.sketch
      ].join('\n');
    }
  };

  /* =========================================================
     결과 만들기
     ========================================================= */
  function build() {
    var rnd = mulberry32(state.seed);
    var g = genre(), s = subOf(g), v = byId(VOCALS, state.vocal), t = byId(TONES, state.tone);
    var theme = byId(THEMES, state.theme);
    var kws = keywords();
    var instrumental = state.vocal === 'instrumental';
    var lyrics = instrumental ? buildInstrumental(rnd) : buildLyrics(rnd);
    var sketch = lyrics.split('\n').filter(function (l) { return l && l.charAt(0) !== '['; }).slice(0, 6).join('\n');

    var titles = [];
    var tpack = LY[state.theme][state.lang].t;
    titles = tpack.slice(0, 3);
    if (kws.length) {
      var k = kws[0];
      if (state.lang === 'ko') titles = [k + '의 새벽', tpack[0], k];
      else if (state.lang === 'ja') titles = ['夜明けの' + k, tpack[0], k];
      else titles = [k + ' at Dawn', tpack[0], k];
    }
    titles = titles.filter(function (x, i) { return titles.indexOf(x) === i; }).slice(0, 3);

    var len = byId(LENGTHS, state.len);
    var prompt = PROMPT_T[LANG]({
      genre: g.name,
      sub: nm(s),
      moods: moodTags().length ? moodTags().join(', ') : '-',
      bpm: state.bpm,
      len: len[LANG] || len.ko,
      vocal: state.vocal === 'instrumental' ? UI.instrumental : (UI[v.id] || '') + ' · ' + (UI[t.id] || ''),
      langLabel: UI[state.lang === 'ko' ? 'tKo' : state.lang === 'ja' ? 'tJa' : 'tEn'],
      theme: nm(theme),
      kws: kws.join(', '),
      full: state.len === 'full',
      sketch: sketch
    });

    var summary = [
      g.name, nm(s), state.bpm + ' BPM',
      state.moods.slice(0, 2).map(function (id) { return byId(MOODS, id).n[LANG]; }).join(' · '),
      state.vocal === 'instrumental' ? UI.instrumental : UI[v.id],
      UI[state.lang === 'ko' ? 'tKo' : state.lang === 'ja' ? 'tJa' : 'tEn'],
      nm(theme), len[LANG]
    ].filter(Boolean).join(' · ');

    return {
      style: styleShort(),
      full: styleFull(),
      lyrics: lyrics,
      prompt: prompt,
      titles: titles,
      summary: summary,
      instrumental: instrumental
    };
  }

  /* =========================================================
     화면
     ========================================================= */
  var $ = function (s) { return document.querySelector(s); };
  var controls = $('#mu-controls'), results = $('#mu-results'), summaryEl = $('#mu-summary'), toastEl = $('#mu-toast');

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function chips(arr, sel, dataAttr, multi) {
    return arr.map(function (o) {
      var on = multi ? sel.indexOf(o.id) >= 0 : sel === o.id;
      return '<button type="button" ' + dataAttr + '="' + o.id + '" aria-pressed="' + on + '">' + esc(nm(o)) + '</button>';
    }).join('');
  }

  function renderControls() {
    var g = genre();
    var h = '';
    h += '<div class="mu-field"><div class="lb"><span class="no">' + UI.step[0] + '</span><span class="t">' + UI.genre + '</span></div>' +
      '<select id="mu-genre">' + GENRES.map(function (x) {
        return '<option value="' + x.id + '"' + (x.id === state.genre ? ' selected' : '') + '>' + esc(x.name) + '</option>';
      }).join('') + '</select></div>';

    h += '<div class="mu-field"><div class="lb"><span class="no">' + UI.step[1] + '</span><span class="t">' + UI.sub + '</span></div>' +
      '<select id="mu-sub">' + g.subs.map(function (s, i) {
        return '<option value="' + i + '"' + (i === state.sub ? ' selected' : '') + '>' + esc(nm(s)) + '</option>';
      }).join('') + '</select></div>';

    h += '<div class="mu-field"><div class="lb"><span class="no">' + UI.step[2] + '</span><span class="t">' + UI.mood + '</span><span class="h">' + UI.moodHint + '</span></div>' +
      '<div class="mu-chips" id="mu-moods">' + chips(MOODS, state.moods, 'data-mood', true) + '</div></div>';

    h += '<div class="mu-field"><div class="lb"><span class="no">' + UI.step[3] + '</span><span class="t">' + UI.tempo + '</span></div>' +
      '<div class="mu-range-row"><input type="range" id="mu-bpm" min="60" max="180" step="1" value="' + state.bpm + '" aria-label="' + esc(UI.bpm) + '">' +
      '<span class="mu-bpm" id="mu-bpm-val">' + state.bpm + ' <small>' + UI.bpm + '</small></span></div>' +
      '<div class="mu-tempo-presets">' +
      [[72, '72'], [88, '88'], [100, '100'], [118, '118'], [128, '128'], [140, '140']].map(function (p) {
        return '<button type="button" data-bpm="' + p[0] + '">' + p[1] + '</button>';
      }).join('') + '</div></div>';

    h += '<div class="mu-field"><div class="lb"><span class="no">' + UI.step[4] + '</span><span class="t">' + UI.vocal + '</span></div>' +
      '<div class="pair"><select id="mu-vocal">' + VOCALS.map(function (v) {
        return '<option value="' + v.id + '"' + (v.id === state.vocal ? ' selected' : '') + '>' + esc(UI[v.id] || v.id) + '</option>';
      }).join('') + '</select>' +
      '<select id="mu-tone"' + (state.vocal === 'instrumental' ? ' disabled' : '') + '>' + TONES.map(function (t) {
        return '<option value="' + t.id + '"' + (t.id === state.tone ? ' selected' : '') + '>' + esc(UI[t.id] || t.id) + '</option>';
      }).join('') + '</select></div></div>';

    h += '<div class="mu-field"><div class="lb"><span class="no">' + UI.step[5] + '</span><span class="t">' + UI.lyricLang + '</span></div>' +
      '<div class="mu-chips" id="mu-lang">' + LYRIC_LANGS.map(function (l) {
        return '<button type="button" data-lang="' + l.id + '" aria-pressed="' + (l.id === state.lang) + '">' + esc(UI[l.id === 'ko' ? 'tKo' : l.id === 'ja' ? 'tJa' : 'tEn']) + '</button>';
      }).join('') + '</div></div>';

    h += '<div class="mu-field"><div class="lb"><span class="no">' + UI.step[6] + '</span><span class="t">' + UI.theme + '</span></div>' +
      '<div class="mu-chips" id="mu-theme">' + chips(THEMES, state.theme, 'data-theme', false) + '</div></div>';

    h += '<div class="mu-field"><div class="lb"><span class="no">' + UI.step[7] + '</span><span class="t">' + UI.kw + '</span><span class="h">' + UI.kwHint + '</span></div>' +
      '<input type="text" id="mu-kw" value="' + esc(state.kw) + '" placeholder="' + esc(UI.kwPlaceholder) + '" autocomplete="off" maxlength="80">' +
      '<p class="mu-hint">' + (LANG === 'ko' ? '넣은 단어는 2절과 제목 후보에 반영됩니다.' : LANG === 'ja' ? '入れた言葉は2番と曲名候補に反映されます。' : LANG === 'zh' ? '输入的词会进入第二段和歌名候选。' : 'Your words go into verse 2 and the title ideas.') + '</p></div>';

    h += '<div class="mu-field"><div class="lb"><span class="no">' + UI.step[8] + '</span><span class="t">' + UI.len + '</span></div>' +
      '<div class="mu-chips" id="mu-len">' + LENGTHS.map(function (l) {
        return '<button type="button" data-len="' + l.id + '" aria-pressed="' + (l.id === state.len) + '">' + esc(UI[l.key]) + '</button>';
      }).join('') + '</div></div>';

    controls.innerHTML = h;
  }

  function card(tag, title, body, opts) {
    opts = opts || {};
    var count = opts.count ? '<span class="cnt">' + opts.count + '</span>' : '';
    var copy = opts.copy === false ? '' : '<button type="button" class="mu-copy" data-copy="' + opts.key + '">' + UI.copy + '</button>';
    var note = opts.note ? '<p class="mu-card-note">' + esc(opts.note) + '</p>' : '';
    return '<div class="mu-card"><div class="mu-card-head"><span class="tag">' + tag + '</span>' +
      '<h3>' + esc(title) + '</h3>' + count + copy + '</div>' +
      '<div class="mu-card-body ' + (opts.cls || '') + '">' + body + '</div>' + note + '</div>';
  }

  var LAST = null;

  function render() {
    var out = build();
    LAST = out;
    summaryEl.textContent = out.summary;

    var lyricCount = out.lyrics.split('\n').length + ' ' + UI.lines;
    var h = '';
    h += card('STYLE', UI.tStyle + ' (200' + UI.chars + ')', esc(out.style),
      { key: 'style', cls: 'mono', count: out.style.length + UI.chars, note: UI.noteStyle });
    h += card('PROMPT', UI.tFull, esc(out.full), { key: 'full', cls: 'mono', note: UI.tFullDesc });
    h += card('LYRICS', UI.tLyrics, out.instrumental ? esc(out.lyrics) : esc(out.lyrics).replace(/^\[(.*?)\]$/gm, '<span class="sec">[$1]</span>'),
      { key: 'lyrics', cls: 'lyrics', count: lyricCount, note: out.instrumental ? UI.noLyrics : UI.noteLyrics });
    h += card('AI', UI.tPrompt, esc(out.prompt), { key: 'prompt', cls: 'mono', note: UI.notePrompt });
    h += '<div class="mu-card"><div class="mu-card-head"><span class="tag">TITLE</span><h3>' + esc(UI.tTitles) + '</h3>' +
      '<button type="button" class="mu-copy" data-copy="titles">' + UI.copy + '</button></div>' +
      '<div class="mu-titles">' + out.titles.map(function (t) { return '<span>' + esc(t) + '</span>'; }).join('') + '</div></div>';
    results.innerHTML = h;
  }

  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('on');
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { toastEl.classList.remove('on'); }, 1800);
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      try {
        var ta = document.createElement('textarea');
        ta.value = text; ta.setAttribute('readonly', '');
        ta.style.position = 'fixed'; ta.style.top = '-1000px';
        document.body.appendChild(ta); ta.select();
        var ok = document.execCommand('copy');
        document.body.removeChild(ta);
        ok ? resolve() : reject();
      } catch (e) { reject(e); }
    });
  }

  /* 이벤트 */
  function bind() {
    document.addEventListener('click', function (e) {
      var t = e.target;
      var cp = t.closest('[data-copy]');
      if (cp) {
        var key = cp.getAttribute('data-copy');
        var text = key === 'titles' ? (LAST ? LAST.titles.join(' / ') : '') : (LAST ? LAST[key] : '');
        copyText(text).then(function () { toast(UI.copied); }).catch(function () { toast(UI.copyFail); });
        return;
      }
      var mood = t.closest('[data-mood]');
      if (mood) {
        var id = mood.getAttribute('data-mood');
        var i = state.moods.indexOf(id);
        if (i >= 0) state.moods.splice(i, 1);
        else if (state.moods.length >= 3) { toast(UI.moodMax); return; }
        else state.moods.push(id);
        renderControls(); render();
        return;
      }
      var th = t.closest('[data-theme]');
      if (th) { state.theme = th.getAttribute('data-theme'); renderControls(); render(); return; }
      var lg = t.closest('[data-lang]');
      if (lg) { state.lang = lg.getAttribute('data-lang'); renderControls(); render(); return; }
      var ln = t.closest('[data-len]');
      if (ln) { state.len = ln.getAttribute('data-len'); renderControls(); render(); return; }
      var bp = t.closest('[data-bpm]');
      if (bp) { state.bpm = parseInt(bp.getAttribute('data-bpm'), 10); renderControls(); render(); return; }
      if (t.id === 'mu-go') { state.seed = (state.seed * 1664525 + 1013904223) % 2147483647; render(); return; }
      if (t.id === 'mu-again') { state.seed = (state.seed * 1103515245 + 12345) % 2147483647; render(); return; }
      if (t.id === 'mu-reset') {
        state.genre = 'kpop'; state.sub = 0; state.moods = ['bright', 'romantic']; state.bpm = 118;
        state.vocal = 'female'; state.tone = 'airy'; state.lang = 'ko'; state.theme = 'love';
        state.kw = ''; state.len = 'std'; state.seed = 20261126;
        renderControls(); render(); return;
      }
    });

    document.addEventListener('change', function (e) {
      var t = e.target;
      if (t.id === 'mu-genre') {
        state.genre = t.value; state.sub = 0;
        state.bpm = genre().bpm;
        renderControls(); render();
      } else if (t.id === 'mu-sub') { state.sub = parseInt(t.value, 10) || 0; render(); }
      else if (t.id === 'mu-vocal') { state.vocal = t.value; renderControls(); render(); }
      else if (t.id === 'mu-tone') { state.tone = t.value; render(); }
    });

    document.addEventListener('input', function (e) {
      var t = e.target;
      if (t.id === 'mu-bpm') {
        state.bpm = parseInt(t.value, 10);
        var v = $('#mu-bpm-val'); if (v) v.innerHTML = state.bpm + ' <small>' + UI.bpm + '</small>';
        render();
      } else if (t.id === 'mu-kw') { state.kw = t.value; render(); }
    });
  }

  function init() {
    if (!controls || !results) return;
    renderControls();
    render();
    bind();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
