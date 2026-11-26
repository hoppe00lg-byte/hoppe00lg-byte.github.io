/* =========================================================
   INSIGHT BRIEF — BGM 스튜디오 (music.html)
   Web Audio API(OfflineAudioContext)로 로파이·피아노·시티팝·앰비언트
   루프를 직접 합성하고, WAV 파일·커버 이미지(PNG)·스펙트럼 영상
   (WebM/MP4)까지 브라우저 안에서 만듭니다.
   · 서버 호출·외부 API·유료 라이브러리 없음. 모든 소리·그림은 자체 합성.
   · 페이지 언어(ko/en/zh/ja)는 이 파일 안의 UI 사전으로 바꿉니다.
   ========================================================= */
(function () {
  'use strict';

  var host = document.getElementById('bgm-app');
  if (!host) return;

  var htmlEl = document.documentElement;
  var LANG = (htmlEl.getAttribute('lang') || 'ko').toLowerCase().slice(0, 2);
  if (['ko', 'en', 'zh', 'ja'].indexOf(LANG) < 0) LANG = 'ko';

  var SR = 44100;

  /* =========================================================
     1. 화면 문구
     ========================================================= */
  var T = {
    ko: {
      panelTitle: '음원 설정',
      panelDek: '장르와 분위기, BPM, 조성을 고르면 이 브라우저가 그 자리에서 소리를 합성합니다. 서버도 API 키도 쓰지 않습니다.',
      fGenre: '장르', fMood: '분위기', fBpm: '템포', fKey: '조성(키)', fProg: '코드 진행', fLen: '길이',
      make: '음원 합성하기', making: '합성 중…', redo: '음원 다시 합성',
      stale: '설정이 바뀌었습니다. ‘음원 다시 합성’을 누르면 새 설정으로 다시 만듭니다.',
      ready: '음원이 준비되었습니다. 재생해 듣고 WAV로 내려받으세요.',
      readyLen: '합성 완료 · {s}초 · 44.1kHz 스테레오 · 피크 {p}dB',
      play: '재생', pause: '정지', loop: '반복 재생', dlWav: 'WAV 다운로드',
      wavNote: '16비트 WAV는 무손실이라 유튜브·쇼츠·편집 프로그램에 그대로 얹을 수 있습니다.',
      cardAudio: '음원', cardAudioNote: '이 브라우저가 합성한 자작 음원입니다. 저작권 걱정 없이 상업적으로 써도 됩니다(CC0).',
      cardCover: '커버 이미지', cardCoverNote: '음원 분위기에 맞춰 그린 앨범 아트입니다. 썸네일·배경으로 쓰세요.',
      cardVideo: '스펙트럼 영상', cardVideoNote: '스펙트럼이 움직이는 영상입니다. 녹화는 음원 길이만큼 실시간으로 걸립니다.',
      fSize: '크기', titleLabel: '곡 제목', titlePh: '예: 새벽의 바이닐',
      dlPng: 'PNG 다운로드', dlVideo: '영상 다운로드', makeVideo: '영상 만들기', cancelVideo: '녹화 취소',
      recording: '녹화 중 {p}% · 탭을 닫거나 다른 탭으로 넘어가면 끊길 수 있습니다.',
      videoHint: '브라우저 안에서 그대로 인코딩합니다. 30초 음원이면 30초 걸립니다.',
      videoUnsupported: '이 브라우저는 영상 녹화(canvas.captureStream + MediaRecorder)를 지원하지 않습니다. Chrome·Edge·Safari 최신 버전에서 열어 주세요.',
      audioUnsupported: '이 브라우저는 Web Audio(OfflineAudioContext)를 지원하지 않아 음원을 합성할 수 없습니다.',
      errAudio: '음원 합성에 실패했습니다. 새로 고친 뒤 다시 시도해 주세요.',
      errCover: '커버 이미지를 그리지 못했습니다.',
      videoDone: '영상이 준비되었습니다. 미리보기로 확인하고 내려받으세요.',
      videoNote: 'WebM(VP9/Opus)은 유튜브·프리미어, MP4는 아이폰·캡컷에서 잘 열립니다.',
      toastWav: 'WAV 파일을 저장합니다', toastPng: 'PNG 파일을 저장합니다', toastVideo: '영상 파일을 저장합니다',
      mobSave: '아이폰은 내려받은 파일이 ‘파일’ 앱에 저장됩니다.',
      sec: '초', sizes: { wide: '가로 16:9 · 1280×720', tall: '세로 9:16 · 1080×1920', square: '정사각 1:1 · 1080×1080' },
      keysSuffix: { maj: '장조', min: '단조' }
    },
    en: {
      panelTitle: 'Sound settings',
      panelDek: 'Pick a genre, mood, tempo and key and this browser synthesises the audio itself. No server, no API key.',
      fGenre: 'Genre', fMood: 'Mood', fBpm: 'Tempo', fKey: 'Key', fProg: 'Chord progression', fLen: 'Length',
      make: 'Synthesise audio', making: 'Synthesising…', redo: 'Synthesise again',
      stale: 'Settings changed. Press “Synthesise again” to rebuild the audio with them.',
      ready: 'Your audio is ready. Play it, then download the WAV.',
      readyLen: 'Rendered · {s}s · 44.1 kHz stereo · peak {p} dB',
      play: 'Play', pause: 'Stop', loop: 'Loop', dlWav: 'Download WAV',
      wavNote: 'A 16-bit WAV is lossless, so it drops straight into YouTube, Shorts or any editor.',
      cardAudio: 'Audio', cardAudioNote: 'Synthesised here in your browser — your own CC0 recording, free for commercial use.',
      cardCover: 'Cover image', cardCoverNote: 'Album art drawn to match the track. Use it as a thumbnail or background.',
      cardVideo: 'Spectrum video', cardVideoNote: 'A video with a live spectrum. Recording takes as long as the track plays.',
      fSize: 'Size', titleLabel: 'Track title', titlePh: 'e.g. Midnight Vinyl',
      dlPng: 'Download PNG', dlVideo: 'Download video', makeVideo: 'Make video', cancelVideo: 'Cancel',
      recording: 'Recording {p}% · keep this tab in front so the frames are not dropped.',
      videoHint: 'Encoded right here in the browser — a 30-second track takes 30 seconds.',
      videoUnsupported: 'This browser cannot record video (canvas.captureStream + MediaRecorder). Try the latest Chrome, Edge or Safari.',
      audioUnsupported: 'This browser has no Web Audio (OfflineAudioContext), so the audio cannot be synthesised.',
      errAudio: 'Synthesis failed. Reload the page and try again.',
      errCover: 'The cover image could not be drawn.',
      videoDone: 'Your video is ready. Check the preview and download it.',
      videoNote: 'WebM (VP9/Opus) opens in YouTube and Premiere; MP4 opens on iPhone and CapCut.',
      toastWav: 'Saving the WAV file', toastPng: 'Saving the PNG file', toastVideo: 'Saving the video file',
      mobSave: 'On iPhone the file lands in the Files app.',
      sec: 's', sizes: { wide: 'Landscape 16:9 · 1280×720', tall: 'Vertical 9:16 · 1080×1920', square: 'Square 1:1 · 1080×1080' },
      keysSuffix: { maj: 'major', min: 'minor' }
    },
    ja: {
      panelTitle: '音源の設定',
      panelDek: 'ジャンル・雰囲気・テンポ・キーを選ぶと、このブラウザがその場で音を合成します。サーバーもAPIキーも使いません。',
      fGenre: 'ジャンル', fMood: '雰囲気', fBpm: 'テンポ', fKey: 'キー', fProg: 'コード進行', fLen: '長さ',
      make: '音源を合成する', making: '合成中…', redo: 'もう一度合成',
      stale: '設定が変わりました。「もう一度合成」を押すと新しい設定で作り直します。',
      ready: '音源ができました。再生して確認し、WAVで保存してください。',
      readyLen: '合成完了 · {s}秒 · 44.1kHz ステレオ · ピーク {p}dB',
      play: '再生', pause: '停止', loop: 'リピート', dlWav: 'WAV ダウンロード',
      wavNote: '16ビットWAVは可逆圧縮なしなので、YouTube・ショート・編集ソフトにそのまま使えます。',
      cardAudio: '音源', cardAudioNote: 'このブラウザで合成した自作音源です。商用利用も自由(CC0)。',
      cardCover: 'カバー画像', cardCoverNote: '音源の雰囲気に合わせて描いたジャケットです。サムネイルや背景にどうぞ。',
      cardVideo: 'スペクトラム動画', cardVideoNote: 'スペクトラムが動く動画です。録画は音源の長さだけ実時間がかかります。',
      fSize: 'サイズ', titleLabel: '曲名', titlePh: '例: 深夜のヴァイナル',
      dlPng: 'PNG ダウンロード', dlVideo: '動画をダウンロード', makeVideo: '動画を作る', cancelVideo: '録画を中止',
      recording: '録画中 {p}% · タブを閉じたり他のタブに移ると途切れることがあります。',
      videoHint: 'ブラウザ内でそのまま書き出します。30秒の音源なら30秒かかります。',
      videoUnsupported: 'このブラウザは動画の録画(canvas.captureStream + MediaRecorder)に対応していません。最新のChrome・Edge・Safariでお試しください。',
      audioUnsupported: 'このブラウザはWeb Audio(OfflineAudioContext)に対応していないため、音源を合成できません。',
      errAudio: '音源の合成に失敗しました。再読み込みしてからもう一度お試しください。',
      errCover: 'カバー画像を描けませんでした。',
      videoDone: '動画ができました。プレビューで確認して保存してください。',
      videoNote: 'WebM(VP9/Opus)はYouTube・Premiere、MP4はiPhone・CapCutで開けます。',
      toastWav: 'WAVファイルを保存します', toastPng: 'PNGファイルを保存します', toastVideo: '動画ファイルを保存します',
      mobSave: 'iPhoneでは「ファイル」アプリに保存されます。',
      sec: '秒', sizes: { wide: '横 16:9 · 1280×720', tall: '縦 9:16 · 1080×1920', square: '正方形 1:1 · 1080×1080' },
      keysSuffix: { maj: '長調', min: '短調' }
    },
    zh: {
      panelTitle: '音频设置',
      panelDek: '选好曲风、氛围、速度和调性，这个浏览器就会当场合成声音。不用服务器，也不用 API 密钥。',
      fGenre: '曲风', fMood: '氛围', fBpm: '速度', fKey: '调性', fProg: '和弦进行', fLen: '长度',
      make: '合成音频', making: '合成中…', redo: '重新合成',
      stale: '设置已改变。点“重新合成”即可用新设置重新生成。',
      ready: '音频已生成。先试听，再下载 WAV。',
      readyLen: '合成完成 · {s}秒 · 44.1kHz 立体声 · 峰值 {p}dB',
      play: '播放', pause: '停止', loop: '循环', dlWav: '下载 WAV',
      wavNote: '16 位 WAV 无损，可直接放进 YouTube、Shorts 或剪辑软件。',
      cardAudio: '音频', cardAudioNote: '这是在你浏览器里合成的自有音频，可自由商用(CC0)。',
      cardCover: '封面图', cardCoverNote: '按音频氛围绘制的封面，可用作缩略图或背景。',
      cardVideo: '频谱视频', cardVideoNote: '带动态频谱的视频。录制需要与音频等长的实时时间。',
      fSize: '尺寸', titleLabel: '曲名', titlePh: '例：深夜黑胶',
      dlPng: '下载 PNG', dlVideo: '下载视频', makeVideo: '生成视频', cancelVideo: '取消录制',
      recording: '录制中 {p}% · 请不要关闭或切换标签页，否则画面可能中断。',
      videoHint: '直接在浏览器里编码。30 秒的音频就要 30 秒。',
      videoUnsupported: '此浏览器不支持视频录制(canvas.captureStream + MediaRecorder)，请使用最新版 Chrome、Edge 或 Safari。',
      audioUnsupported: '此浏览器不支持 Web Audio(OfflineAudioContext)，无法合成音频。',
      errAudio: '音频合成失败，请刷新页面后重试。',
      errCover: '封面图绘制失败。',
      videoDone: '视频已生成，请预览后下载。',
      videoNote: 'WebM(VP9/Opus) 适合 YouTube、Premiere；MP4 适合 iPhone、剪映。',
      toastWav: '正在保存 WAV 文件', toastPng: '正在保存 PNG 文件', toastVideo: '正在保存视频文件',
      mobSave: 'iPhone 会保存到“文件”应用。',
      sec: '秒', sizes: { wide: '横屏 16:9 · 1280×720', tall: '竖屏 9:16 · 1080×1920', square: '方形 1:1 · 1080×1080' },
      keysSuffix: { maj: '大调', min: '小调' }
    }
  }[LANG];

  /* =========================================================
     2. 음악 재료
     ========================================================= */
  var VIBES = [
    {
      id: 'lofi', bpm: 78, palette: 'lofi',
      name: { ko: '로파이 칠', en: 'Lo-fi chill', ja: 'ローファイ・チル', zh: 'Lo-fi 慵懒' },
      desc: { ko: '따뜻한 EP 화음 · 바이닐 노이즈 · 느슨한 드럼',
              en: 'Warm electric piano, vinyl crackle, loose drums',
              ja: '温かいEPの和音・レコードノイズ・ゆるいドラム',
              zh: '温暖电钢和弦 · 黑胶噪声 · 松散鼓点' },
      title: { ko: '새벽의 바이닐', en: 'Midnight Vinyl', ja: '深夜のヴァイナル', zh: '深夜黑胶' },
      key: 'ep', lead: 'ep', bass: 'sub', pad: 'soft', drums: 'lofi',
      swing: 0.14, cut: 5200, rev: 0.30,
      chordSteps: [[0, 3.0, 0.90], [6, 1.0, 0.50], [10, 1.4, 0.45]],
      bassSteps: [[0, 2.6, 0.95], [10, 1.4, 0.70]],
      kick: [0, 10], snare: [4, 12], hats: [0, 2, 4, 6, 8, 10, 12, 14], hatsVel: 0.42, open: [],
      melDensity: 0.50, padGain: 0.45
    },
    {
      id: 'piano', bpm: 72, palette: 'piano',
      name: { ko: '잔잔한 피아노', en: 'Soft piano', ja: '静かなピアノ', zh: '安静钢琴' },
      desc: { ko: '펠트 피아노 아르페지오 · 낮은 패드 · 드럼 없음',
              en: 'Felt piano arpeggio, low pad, no drums',
              ja: 'フェルトピアノのアルペジオ・低いパッド・ドラムなし',
              zh: '毛毡钢琴琶音 · 低音铺底 · 无鼓' },
      title: { ko: '창가의 오후', en: 'Afternoon by the Window', ja: '窓辺の午後', zh: '窗边的午后' },
      key: 'piano', lead: 'piano', bass: 'sub', pad: 'soft', drums: 'none',
      swing: 0.05, cut: 4200, rev: 0.40,
      arp: [0, 1, 2, 3, 2, 1, 2, 3], arpVel: [0.55, 0.38, 0.42, 0.36, 0.50, 0.36, 0.40, 0.34],
      bassSteps: [[0, 3.4, 0.85], [8, 1.8, 0.60]],
      kick: [], snare: [], hats: [], open: [],
      melDensity: 0.80, padGain: 0.30
    },
    {
      id: 'citypop', bpm: 104, palette: 'citypop',
      name: { ko: '시티팝 그루브', en: 'City pop groove', ja: 'シティポップ・グルーヴ', zh: 'City pop 律动' },
      desc: { ko: '오프비트 EP · 슬랩 베이스 · 16분 하이햇',
              en: 'Offbeat electric piano, slap bass, 16th hi-hats',
              ja: 'オフビートのEP・スラップベース・16分ハイハット',
              zh: '反拍电钢 · 击弦贝斯 · 16 分踩镲' },
      title: { ko: '네온 드라이브', en: 'Neon Drive', ja: 'ネオン・ドライブ', zh: '霓虹兜风' },
      key: 'ep', lead: 'ep', bass: 'slap', pad: 'wide', drums: 'city',
      swing: 0, cut: 7600, rev: 0.24,
      chordSteps: [[2, 0.7, 0.78], [6, 0.7, 0.86], [10, 0.7, 0.80], [14, 1.1, 0.68]],
      bassSteps: [[0, 0.9, 0.90], [2, 0.9, 0.55], [4, 0.9, 0.80], [6, 0.9, 0.55],
                  [8, 0.9, 0.90], [10, 0.9, 0.55], [12, 0.9, 0.80], [14, 0.9, 0.60]],
      kick: [0, 6, 8], snare: [4, 12], hats: [0, 2, 4, 6, 8, 10, 12, 13, 14, 15], hatsVel: 0.34, open: [14],
      melDensity: 0.58, padGain: 0.40
    },
    {
      id: 'ambient', bpm: 66, palette: 'ambient',
      name: { ko: '어쿠스틱 앰비언트', en: 'Acoustic ambient', ja: 'アコースティック・アンビエント', zh: '原声氛围' },
      desc: { ko: '긴 패드 · 드문드문 플럭 · 깊은 리버브',
              en: 'Long pads, sparse plucks, deep reverb',
              ja: '長いパッド・まばらなプラック・深いリバーブ',
              zh: '长音铺底 · 稀疏拨弦 · 深混响' },
      title: { ko: '안개 낀 호수', en: 'Misty Lake', ja: '霧の湖', zh: '雾中湖面' },
      key: 'pad', lead: 'pluck', bass: 'sub', pad: 'wide', drums: 'none',
      swing: 0, cut: 3000, rev: 0.55,
      chordSteps: [[0, 7.6, 0.85]],
      bassSteps: [[0, 6.4, 0.65]],
      kick: [], snare: [], hats: [], open: [],
      melDensity: 0.42, padGain: 0.85
    }
  ];

  var MOODS = [
    { id: 'warm', cut: 0.85, rev: 1.0, del: 0.7, vel: 1.0, bright: 1.0,
      name: { ko: '따뜻한', en: 'Warm', ja: '温かい', zh: '温暖' } },
    { id: 'dreamy', cut: 1.15, rev: 1.35, del: 1.2, vel: 0.92, bright: 1.15,
      name: { ko: '몽환적', en: 'Dreamy', ja: '夢見心地', zh: '梦幻' } },
    { id: 'moody', cut: 0.65, rev: 1.15, del: 0.8, vel: 0.9, bright: 0.7,
      name: { ko: '쓸쓸한', en: 'Melancholy', ja: '物悲しい', zh: '惆怅' } },
    { id: 'bright', cut: 1.35, rev: 0.75, del: 0.5, vel: 1.06, bright: 1.35,
      name: { ko: '밝은', en: 'Bright', ja: '明るい', zh: '明亮' } }
  ];

  var KEYS = [
    { id: 'C', pc: 0, mode: 'maj' },
    { id: 'G', pc: 7, mode: 'maj' },
    { id: 'F', pc: 5, mode: 'maj' },
    { id: 'D', pc: 2, mode: 'maj' },
    { id: 'Bb', pc: 10, mode: 'maj' },
    { id: 'Am', pc: 9, mode: 'min' },
    { id: 'Em', pc: 4, mode: 'min' },
    { id: 'Dm', pc: 2, mode: 'min' }
  ];

  var PROGS = [
    { id: 'pop', mode: 'maj', chords: [[0, 'maj7'], [7, 'dom7'], [9, 'min7'], [5, 'maj7']],
      name: { ko: '팝 I–V–vi–IV', en: 'Pop I–V–vi–IV', ja: 'ポップ I–V–vi–IV', zh: '流行 I–V–vi–IV' } },
    { id: 'lofi', mode: 'maj', chords: [[0, 'maj9'], [9, 'min7'], [2, 'min7'], [7, 'dom7']],
      name: { ko: '로파이 Imaj9–vi7–ii7–V7', en: 'Lo-fi Imaj9–vi7–ii7–V7', ja: 'ローファイ Imaj9–vi7–ii7–V7', zh: 'Lo-fi Imaj9–vi7–ii7–V7' } },
    { id: 'jazz', mode: 'maj', chords: [[2, 'min7'], [7, 'dom7'], [0, 'maj7'], [9, 'min7']],
      name: { ko: '재즈 ii–V–I–vi', en: 'Jazz ii–V–I–vi', ja: 'ジャズ ii–V–I–vi', zh: '爵士 ii–V–I–vi' } },
    { id: 'city', mode: 'maj', chords: [[5, 'maj7'], [7, 'dom7'], [4, 'min7'], [9, 'min7']],
      name: { ko: '시티팝 IV–V–iii–vi', en: 'City pop IV–V–iii–vi', ja: 'シティポップ IV–V–iii–vi', zh: 'City pop IV–V–iii–vi' } },
    { id: 'amb', mode: 'maj', chords: [[0, 'maj9'], [5, 'maj7'], [9, 'min9'], [7, 'sus']],
      name: { ko: '앰비언트 Imaj9–IVmaj7–vi9–Vsus', en: 'Ambient Imaj9–IVmaj7–vi9–Vsus', ja: 'アンビエント Imaj9–IVmaj7–vi9–Vsus', zh: '氛围 Imaj9–IVmaj7–vi9–Vsus' } },
    { id: 'minor', mode: 'min', chords: [[0, 'min7'], [8, 'maj7'], [3, 'maj7'], [10, 'dom7']],
      name: { ko: '단조 i–VI–III–VII', en: 'Minor i–VI–III–VII', ja: '短調 i–VI–III–VII', zh: '小调 i–VI–III–VII' } }
  ];

  var CHORDS = {
    maj7: [0, 4, 7, 11], maj9: [0, 4, 7, 11, 14], min7: [0, 3, 7, 10],
    min9: [0, 3, 7, 10, 14], dom7: [0, 4, 7, 10], sus: [0, 5, 7, 12]
  };

  var LENGTHS = [15, 30, 60];

  /* =========================================================
     3. 공통 유틸
     ========================================================= */
  function mulberry32(a) {
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      var t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  function mtof(m) { return 440 * Math.pow(2, (m - 69) / 12); }
  function byId(list, id) { for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i]; return list[0]; }
  function nm(o) { return (o.name && (o.name[LANG] || o.name.ko)) || ''; }
  function pad2(n) { return (n < 10 ? '0' : '') + n; }
  function clock(s) { s = Math.max(0, s); return pad2(Math.floor(s / 60)) + ':' + pad2(Math.floor(s % 60)); }
  function progsFor(key) { return PROGS.filter(function (p) { return p.mode === key.mode; }); }

  function chordMidis(pc, ch) {
    var iv = CHORDS[ch[1]] || CHORDS.maj7;
    var base = 48 + pc + ch[0];
    while (base > 60) base -= 12;
    while (base < 43) base += 12;
    return iv.map(function (i) { return base + i; });
  }

  /* =========================================================
     4. 소리 합성
     ========================================================= */
  function makeNoise(ctx, sec, seed) {
    var len = Math.floor(ctx.sampleRate * sec);
    var buf = ctx.createBuffer(1, len, ctx.sampleRate);
    var d = buf.getChannelData(0);
    var rnd = mulberry32(seed || 7);
    for (var i = 0; i < len; i++) d[i] = rnd() * 2 - 1;
    return buf;
  }

  /* 바이닐 크랙클 — 잔잔한 노이즈에 성긴 ‘톡’ 소리를 섞습니다. */
  function makeCrackle(ctx, sec, seed) {
    var len = Math.floor(ctx.sampleRate * sec);
    var buf = ctx.createBuffer(2, len, ctx.sampleRate);
    var rnd = mulberry32(seed || 11);
    for (var c = 0; c < 2; c++) {
      var d = buf.getChannelData(c);
      for (var i = 0; i < len; i++) d[i] = (rnd() * 2 - 1) * 0.055;
      var pops = Math.floor(sec * 26);
      for (var p = 0; p < pops; p++) {
        var at = Math.floor(rnd() * (len - 400));
        var amp = 0.18 + rnd() * 0.55;
        var dec = 40 + rnd() * 220;
        for (var k = 0; k < dec; k++) {
          d[at + k] += (rnd() * 2 - 1) * amp * Math.exp(-k / (dec * 0.32));
        }
      }
    }
    return buf;
  }

  function makeImpulse(ctx, sec, decay) {
    var len = Math.max(1, Math.floor(ctx.sampleRate * sec));
    var buf = ctx.createBuffer(2, len, ctx.sampleRate);
    var rnd = mulberry32(31);
    for (var c = 0; c < 2; c++) {
      var d = buf.getChannelData(c);
      for (var i = 0; i < len; i++) {
        var t = i / len;
        d[i] = (rnd() * 2 - 1) * Math.pow(1 - t, decay);
      }
    }
    return buf;
  }

  /* ---- 악기 ---- */
  function vEP(ctx, dest, t, midi, dur, vel, cut) {
    var f = mtof(midi);
    var car = ctx.createOscillator(); car.type = 'sine'; car.frequency.value = f;
    var car2 = ctx.createOscillator(); car2.type = 'triangle'; car2.frequency.value = f * 2.003;
    var mod = ctx.createOscillator(); mod.type = 'sine'; mod.frequency.value = f * 2;
    var mg = ctx.createGain();
    mg.gain.setValueAtTime(Math.max(0.01, f * 1.4 * vel), t);
    mg.gain.exponentialRampToValueAtTime(Math.max(0.01, f * 0.05), t + 0.55);
    mod.connect(mg); mg.connect(car.frequency);
    var lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = cut || 2600; lp.Q.value = 0.4;
    var g = ctx.createGain();
    var D = Math.max(dur, 0.22);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(Math.max(0.0002, vel * 0.42), t + 0.008);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, vel * 0.13), t + 0.5);
    g.gain.setValueAtTime(Math.max(0.0002, vel * 0.13), t + Math.max(D - 0.12, 0.12));
    g.gain.exponentialRampToValueAtTime(0.0001, t + D);
    car.connect(lp); car2.connect(lp); lp.connect(g); g.connect(dest);
    [car, car2, mod].forEach(function (o) { o.start(t); o.stop(t + D + 0.05); });
  }

  function vPiano(ctx, dest, t, midi, dur, vel, cut) {
    var f = mtof(midi), D = Math.max(dur, 1.1);
    var lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = cut || 3400; lp.Q.value = 0.2;
    lp.connect(dest);
    var parts = [[1, 1], [2, 0.46], [3, 0.2], [4, 0.1], [5, 0.05], [6, 0.025]];
    parts.forEach(function (p, i) {
      var o = ctx.createOscillator(); o.type = 'sine';
      o.frequency.value = f * p[0] * (1 + i * 0.0006);
      o.detune.value = (i % 2 ? 3 : -2);
      var g = ctx.createGain();
      var peak = Math.max(0.0002, vel * 0.30 * p[1]);
      var dec = 0.9 / (1 + i * 0.8);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(peak, t + 0.005);
      g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak * 0.22), t + 0.05 + dec * 0.5);
      g.gain.exponentialRampToValueAtTime(0.0001, t + Math.max(D, 0.9) + i * 0.02);
      o.connect(g); g.connect(lp);
      o.start(t); o.stop(t + Math.max(D, 0.9) + 0.08);
    });
  }

  function vPad(ctx, dest, t, midis, dur, vel, cut, atk) {
    var lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = cut || 1200; lp.Q.value = 0.25;
    var g = ctx.createGain();
    var a = atk || 0.5;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(Math.max(0.0002, vel * 0.9), t + a);
    g.gain.setValueAtTime(Math.max(0.0002, vel * 0.9), t + Math.max(dur - 0.35, a + 0.1));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    lp.connect(g); g.connect(dest);
    var per = 0.55 / Math.max(1, midis.length * 2);
    midis.forEach(function (m, idx) {
      [-7, 6].forEach(function (dt, k) {
        var o = ctx.createOscillator(); o.type = 'sawtooth';
        o.frequency.value = mtof(m); o.detune.value = dt;
        var og = ctx.createGain(); og.gain.value = per;
        if (ctx.createStereoPanner) {
          var pan = ctx.createStereoPanner();
          pan.pan.value = (k ? 0.42 : -0.42) * (idx % 2 ? 1 : -1);
          o.connect(og); og.connect(pan); pan.connect(lp);
        } else {
          o.connect(og); og.connect(lp);
        }
        o.start(t); o.stop(t + dur + 0.1);
      });
    });
  }

  function vBass(ctx, dest, t, midi, dur, vel, kind) {
    var f = mtof(midi);
    var o = ctx.createOscillator(); o.type = kind === 'slap' ? 'sawtooth' : 'sine';
    o.frequency.value = f;
    var o2 = ctx.createOscillator(); o2.type = 'sine'; o2.frequency.value = f * 2;
    var lp = ctx.createBiquadFilter(); lp.type = 'lowpass';
    lp.frequency.value = kind === 'slap' ? 520 : 210;
    lp.Q.value = kind === 'slap' ? 3.5 : 0.8;
    if (kind === 'slap') {
      lp.frequency.setValueAtTime(1900, t);
      lp.frequency.exponentialRampToValueAtTime(360, t + 0.2);
    }
    var g = ctx.createGain();
    var D = Math.max(dur, 0.2);
    var sus = kind === 'slap' ? 0.10 : 0.30;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(Math.max(0.0002, vel * 0.47), t + (kind === 'slap' ? 0.008 : 0.02));
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, vel * sus), t + 0.18);
    g.gain.setValueAtTime(Math.max(0.0002, vel * sus), t + Math.max(D - 0.1, 0.15));
    g.gain.exponentialRampToValueAtTime(0.0001, t + D);
    o.connect(lp); o2.connect(lp); lp.connect(g); g.connect(dest);
    o.start(t); o2.start(t); o.stop(t + D + 0.05); o2.stop(t + D + 0.05);
  }

  function vPluck(ctx, dest, t, midi, vel, cut) {
    var f = mtof(midi);
    var o = ctx.createOscillator(); o.type = 'triangle'; o.frequency.value = f;
    var o2 = ctx.createOscillator(); o2.type = 'sine'; o2.frequency.value = f * 2.002;
    var lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = cut || 2200; lp.Q.value = 0.6;
    var g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(Math.max(0.0002, vel * 0.26), t + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 1.35);
    o.connect(lp); o2.connect(lp); lp.connect(g); g.connect(dest);
    o.start(t); o2.start(t); o.stop(t + 1.4); o2.stop(t + 1.4);
  }

  function vKick(ctx, dest, t, vel, noise) {
    var o = ctx.createOscillator(); o.type = 'sine';
    o.frequency.setValueAtTime(135, t);
    o.frequency.exponentialRampToValueAtTime(46, t + 0.16);
    var g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(Math.max(0.0002, vel * 0.85), t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.34);
    o.connect(g); g.connect(dest);
    o.start(t); o.stop(t + 0.36);
    var n = ctx.createBufferSource(); n.buffer = noise;
    var hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 1400;
    var ng = ctx.createGain();
    ng.gain.setValueAtTime(vel * 0.10, t);
    ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.02);
    n.connect(hp); hp.connect(ng); ng.connect(dest);
    n.start(t, 0.1); n.stop(t + 0.03);
  }

  function vSnare(ctx, dest, t, vel, noise, rnd) {
    var n = ctx.createBufferSource(); n.buffer = noise;
    var bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1750; bp.Q.value = 0.9;
    var g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(Math.max(0.0002, vel * 0.34), t + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.19);
    n.connect(bp); bp.connect(g); g.connect(dest);
    n.start(t, rnd() * 0.4); n.stop(t + 0.22);
    var o = ctx.createOscillator(); o.type = 'triangle'; o.frequency.value = 190;
    var og = ctx.createGain();
    og.gain.setValueAtTime(Math.max(0.0002, vel * 0.16), t);
    og.gain.exponentialRampToValueAtTime(0.0001, t + 0.1);
    o.connect(og); og.connect(dest); o.start(t); o.stop(t + 0.12);
  }

  function vHat(ctx, dest, t, vel, noise, rnd, open) {
    var n = ctx.createBufferSource(); n.buffer = noise;
    var hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 7600;
    var g = ctx.createGain();
    var decay = open ? 0.20 : 0.045;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(Math.max(0.0002, vel * 0.20), t + 0.003);
    g.gain.exponentialRampToValueAtTime(0.0001, t + decay);
    n.connect(hp); hp.connect(g); g.connect(dest);
    n.start(t, rnd() * 0.5); n.stop(t + decay + 0.02);
  }

  /* ---- 편곡 ---- */
  function compose(ctx, cfg) {
    var vibe = cfg.vibe, mood = cfg.mood;
    var beat = 60 / cfg.bpm, bar = beat * 4, sx = beat / 4;
    var len = cfg.len;
    var bars = Math.max(2, Math.ceil(len / bar) + 1);
    var rnd = mulberry32(cfg.seed);
    var noise = makeNoise(ctx, 2, cfg.seed + 3);

    var master = ctx.createGain();
    master.gain.setValueAtTime(0.0001, 0);
    master.gain.linearRampToValueAtTime(1, 0.04);
    master.gain.setValueAtTime(1, Math.max(0.08, len - 0.45));
    master.gain.linearRampToValueAtTime(0.0001, Math.max(0.12, len - 0.02));
    var comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -14; comp.knee.value = 12; comp.ratio.value = 3;
    comp.attack.value = 0.006; comp.release.value = 0.25;
    master.connect(comp); comp.connect(ctx.destination);

    var IR_SEC = Math.min(2.6, Math.max(1.2, len * 0.55));
    var conv = ctx.createConvolver();
    conv.buffer = makeImpulse(ctx, IR_SEC, 2.6);
    var revGain = ctx.createGain(); revGain.gain.value = Math.min(0.65, vibe.rev * mood.rev);
    conv.connect(revGain); revGain.connect(master);

    var delay = ctx.createDelay(2);
    delay.delayTime.value = Math.min(1.4, beat * 0.75);
    var fb = ctx.createGain(); fb.gain.value = 0.28;
    var dlp = ctx.createBiquadFilter(); dlp.type = 'lowpass'; dlp.frequency.value = 2400;
    var dGain = ctx.createGain(); dGain.gain.value = 0.20 * mood.del;
    delay.connect(dlp); dlp.connect(fb); fb.connect(delay); dlp.connect(dGain); dGain.connect(master);

    function bus(gain, rev, del) {
      var g = ctx.createGain(); g.gain.value = gain;
      g.connect(master);
      if (rev) { var s = ctx.createGain(); s.gain.value = rev; g.connect(s); s.connect(conv); }
      if (del) { var d = ctx.createGain(); d.gain.value = del; g.connect(d); d.connect(delay); }
      return g;
    }
    var chordsBus = bus(0.62, 0.55, 0.25);
    var bassBus = bus(0.58, 0.06, 0);
    var drumsBus = bus(0.55, 0.16, 0);
    var melBus = bus(0.34, 0.7, 0.9);
    var padBus = bus(0.22 * vibe.padGain + 0.06, 0.9, 0.1);

    /* 바이닐 크랙클 */
    if (vibe.id === 'lofi' || vibe.id === 'citypop') {
      var cr = ctx.createBufferSource(); cr.buffer = makeCrackle(ctx, Math.min(len, 8), cfg.seed + 9);
      cr.loop = true;
      var crg = ctx.createGain();
      crg.gain.setValueAtTime(0.0001, 0);
      crg.gain.linearRampToValueAtTime(vibe.id === 'lofi' ? 0.16 : 0.07, 0.6);
      crg.gain.setValueAtTime(vibe.id === 'lofi' ? 0.16 : 0.07, Math.max(0.7, len - 0.5));
      crg.gain.linearRampToValueAtTime(0.0001, Math.max(0.8, len - 0.02));
      var crlp = ctx.createBiquadFilter(); crlp.type = 'lowpass'; crlp.frequency.value = 6800;
      cr.connect(crlp); crlp.connect(crg); crg.connect(master);
      cr.start(0); cr.stop(len);
    }

    var pc = cfg.pc, prog = cfg.prog;
    var cut = vibe.cut * mood.cut;
    var prevMel = 72 + pc;

    function swingOf(step) { return (step % 2 === 1) ? vibe.swing * sx : 0; }

    for (var b = 0; b < bars; b++) {
      var t0 = b * bar;
      if (t0 > len - 0.15) break;
      var ch = prog[b % prog.length];
      var chM = chordMidis(pc, ch);
      var bassM = chM[0] - 12;
      var velMul = mood.vel;

      /* 패드 */
      if (vibe.pad !== 'none' && vibe.id === 'ambient') {
        if (b % 2 === 0) {
          vPad(ctx, padBus, t0, chM, Math.min(bar * 2 + 0.6, len - t0), 0.5, cut * 0.35, 1.6);
        }
      } else if (vibe.pad === 'wide') {
        vPad(ctx, padBus, t0, chM.map(function (m) { return m + 12; }), bar + 0.3, 0.32, cut * 0.4, 0.9);
      } else if (vibe.pad === 'soft' && vibe.id !== 'ambient') {
        vPad(ctx, padBus, t0, chM.slice(0, 3), bar + 0.2, 0.26, cut * 0.3, 0.55);
      }

      /* 화음 */
      if (vibe.id === 'piano') {
        var arp = vibe.arp, av = vibe.arpVel;
        for (var a = 0; a < arp.length; a++) {
          var at = t0 + a * beat * 0.5 + swingOf(a);
          if (at > len - 0.1) break;
          var idx = arp[a] % chM.length;
          vPiano(ctx, chordsBus, at, chM[idx], beat * 0.75, av[a] * velMul, cut);
        }
      } else if (vibe.chordSteps) {
        for (var c = 0; c < vibe.chordSteps.length; c++) {
          var cs = vibe.chordSteps[c];
          var ct = t0 + cs[0] * sx + swingOf(cs[0]);
          if (ct > len - 0.1) break;
          var dur = cs[1] * beat;
          for (var n = 0; n < chM.length; n++) {
            var vv = cs[2] * velMul * (n === chM.length - 1 && chM.length > 4 ? 0.6 : 1);
            if (vibe.key === 'piano') vPiano(ctx, chordsBus, ct + n * 0.008, chM[n], dur, vv, cut);
            else vEP(ctx, chordsBus, ct + n * 0.006, chM[n], Math.min(dur, len - ct), vv, cut);
          }
        }
      }

      /* 베이스 */
      for (var s = 0; s < vibe.bassSteps.length; s++) {
        var bs = vibe.bassSteps[s];
        var bt = t0 + bs[0] * sx;
        if (bt > len - 0.1) break;
        var bm = bassM;
        if (vibe.id === 'citypop' && (bs[0] === 6 || bs[0] === 14)) bm = bassM + 12;
        vBass(ctx, bassBus, bt, bm, Math.min(bs[1] * beat, len - bt), bs[2] * velMul, vibe.bass);
      }

      /* 드럼 */
      if (vibe.drums !== 'none') {
        var kick = vibe.kick, sn = vibe.snare, hats = vibe.hats;
        for (var k = 0; k < kick.length; k++) {
          var kt = t0 + kick[k] * sx;
          if (kt > len - 0.2) continue;
          vKick(ctx, drumsBus, kt, 0.9 * velMul, noise);
        }
        for (var q = 0; q < sn.length; q++) {
          var st = t0 + sn[q] * sx;
          if (st > len - 0.2) continue;
          vSnare(ctx, drumsBus, st, (q === 1 ? 0.95 : 0.8) * velMul, noise, rnd);
        }
        for (var hh = 0; hh < hats.length; hh++) {
          var ht = t0 + hats[hh] * sx + swingOf(hats[hh]);
          if (ht > len - 0.1) continue;
          var acc = (hats[hh] % 4 === 0) ? 1.15 : 1;
          vHat(ctx, drumsBus, ht, vibe.hatsVel * acc * velMul, noise, rnd, vibe.open.indexOf(hats[hh]) >= 0);
        }
      }

      /* 멜로디 — 화음 구성음 위주의 짧은 동기 */
      if (rnd() < vibe.melDensity) {
        var rhy = [[0, 2], [2, 2], [4, 2], [6, 1], [8, 2], [10, 1], [12, 2], [14, 1]];
        var used = {};
        var count = 2 + Math.floor(rnd() * 2);
        var pool = [];
        for (var pm = 0; pm < chM.length; pm++) pool.push(chM[pm] + 12);
        pool.push(chM[1] + 14);
        for (var e = 0; e < count; e++) {
          var r = rhy[Math.floor(rnd() * rhy.length)];
          if (used[r[0]]) continue;
          used[r[0]] = 1;
          var mt = t0 + r[0] * sx + swingOf(r[0]);
          if (mt > len - 0.3) continue;
          var mi = pool[Math.floor(rnd() * pool.length)];
          if (Math.abs(mi - prevMel) > 8) mi = prevMel + (mi > prevMel ? 4 : -4);
          prevMel = mi;
          var mv = (0.55 + rnd() * 0.25) * velMul;
          if (vibe.lead === 'piano') vPiano(ctx, melBus, mt, mi, beat * 1.1, mv, cut * 1.1);
          else if (vibe.lead === 'pluck') vPluck(ctx, melBus, mt, mi, mv, cut);
          else vEP(ctx, melBus, mt, mi, beat * 1.2, mv, cut * 1.1);
        }
      }
    }
    return master;
  }

  function renderTrack(cfg) {
    var Ctor = window.OfflineAudioContext || window.webkitOfflineAudioContext;
    if (!Ctor) return Promise.reject(new Error('no-offline-audio'));
    var frames = Math.ceil(cfg.len * SR);
    var ctx = new Ctor(2, frames, SR);
    compose(ctx, cfg);
    var p;
    try { p = ctx.startRendering(); } catch (e) { p = null; }
    if (p && typeof p.then === 'function') return p;
    return new Promise(function (res, rej) {
      ctx.oncomplete = function (ev) { res(ev.renderedBuffer); };
      try { ctx.startRendering(); } catch (e) { rej(e); }
    });
  }

  /* =========================================================
     5. WAV · 파일
     ========================================================= */
  function normalise(buffer, target) {
    var ch = buffer.numberOfChannels, len = buffer.length;
    var peak = 0, i, c, d;
    for (c = 0; c < ch; c++) {
      d = buffer.getChannelData(c);
      for (i = 0; i < len; i += 3) { var a = d[i] < 0 ? -d[i] : d[i]; if (a > peak) peak = a; }
    }
    if (peak <= 0.0001) return 0;
    var gain = (target || 0.89) / peak;
    if (gain > 1.6) gain = 1.6;
    for (c = 0; c < ch; c++) {
      d = buffer.getChannelData(c);
      for (i = 0; i < len; i++) d[i] *= gain;
    }
    return peak * gain;
  }

  function encodeWav(buffer) {
    var ch = Math.min(2, buffer.numberOfChannels);
    var len = buffer.length, sr = buffer.sampleRate;
    var bytes = 44 + len * ch * 2;
    var ab = new ArrayBuffer(bytes);
    var view = new DataView(ab);
    function str(off, s) { for (var i = 0; i < s.length; i++) view.setUint8(off + i, s.charCodeAt(i)); }
    str(0, 'RIFF'); view.setUint32(4, bytes - 8, true); str(8, 'WAVE');
    str(12, 'fmt '); view.setUint32(16, 16, true); view.setUint16(20, 1, true);
    view.setUint16(22, ch, true); view.setUint32(24, sr, true);
    view.setUint32(28, sr * ch * 2, true); view.setUint16(32, ch * 2, true); view.setUint16(34, 16, true);
    str(36, 'data'); view.setUint32(40, len * ch * 2, true);
    var chans = [];
    for (var c = 0; c < ch; c++) chans.push(buffer.getChannelData(c));
    var off = 44;
    for (var i = 0; i < len; i++) {
      for (var k = 0; k < ch; k++) {
        var s = chans[k][i];
        s = s < -1 ? -1 : s > 1 ? 1 : s;
        view.setInt16(off, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
        off += 2;
      }
    }
    return new Blob([ab], { type: 'audio/wav' });
  }

  function download(blob, name) {
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = name;
    a.style.position = 'fixed'; a.style.left = '-9999px';
    document.body.appendChild(a);
    a.click();
    setTimeout(function () {
      try { document.body.removeChild(a); } catch (e) { }
      setTimeout(function () { URL.revokeObjectURL(url); }, 8000);
    }, 400);
  }

  function slug(s) {
    return String(s || '').replace(/[\\/:*?"<>|]+/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').slice(0, 48) || 'insight-brief-bgm';
  }

  /* =========================================================
     6. 커버 이미지 (canvas)
     ========================================================= */
  var PALETTES = {
    lofi: { sky: ['#0a0e1c', '#191d3a', '#3a3358'], glow: '#ffd6a0', accent: '#f2b56b', accent2: '#7fb0d8', far: '#141b30', near: '#06080f', ink: '#f6efe2' },
    piano: { sky: ['#f8f1e4', '#ecdfc9', '#d9c2a4'], glow: '#fff6dd', accent: '#8a5c40', accent2: '#b98f6c', far: '#c9ae8d', near: '#6f4d31', ink: '#2b2018' },
    citypop: { sky: ['#160a2c', '#3d1259', '#a4236f'], glow: '#ffb8d2', accent: '#ff5f8f', accent2: '#35d0e6', far: '#2a1042', near: '#0f0518', ink: '#ffe9f2' },
    ambient: { sky: ['#071619', '#0e2e35', '#2f6b64'], glow: '#d9f0e2', accent: '#e8d9a8', accent2: '#7fc9b4', far: '#123a3a', near: '#05181a', ink: '#eaf4ec' }
  };

  function hex2rgb(h) { h = h.replace('#', ''); return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]; }
  function rgb2hex(r) { return '#' + r.map(function (v) { v = Math.max(0, Math.min(255, Math.round(v))); return (v < 16 ? '0' : '') + v.toString(16); }).join(''); }
  function mix(a, b, t) { var A = hex2rgb(a), B = hex2rgb(b); return rgb2hex([A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t]); }
  function shade(a, t) { return t >= 0 ? mix(a, '#ffffff', t) : mix(a, '#000000', -t); }

  function paletteFor(vibeId, moodId) {
    var base = PALETTES[vibeId] || PALETTES.lofi;
    var out = { sky: base.sky.slice(), glow: base.glow, accent: base.accent, accent2: base.accent2, far: base.far, near: base.near, ink: base.ink };
    if (moodId === 'dreamy') { out.accent = mix(out.accent, '#c48bff', 0.3); out.accent2 = mix(out.accent2, '#8bd6ff', 0.3); }
    if (moodId === 'moody') { out.sky = out.sky.map(function (c) { return mix(c, '#0b0f16', 0.25); }); out.accent = mix(out.accent, '#8f8577', 0.35); }
    if (moodId === 'bright') { out.sky = out.sky.map(function (c) { return shade(c, 0.12); }); out.accent = shade(out.accent, 0.1); }
    return out;
  }

  function grainPattern(g) {
    var n = document.createElement('canvas');
    n.width = 128; n.height = 128;
    var c = n.getContext('2d');
    var img = c.createImageData(128, 128);
    var rnd = mulberry32(5);
    for (var i = 0; i < img.data.length; i += 4) {
      var v = 120 + rnd() * 135;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
      img.data[i + 3] = 26;
    }
    c.putImageData(img, 0, 0);
    return g.createPattern(n, 'repeat');
  }

  function drawSkyline(g, W, H, baseY, color, rnd, lampColor, lampChance) {
    var x = -0.02 * W;
    while (x < W * 1.02) {
      var bw = W * (0.035 + rnd() * 0.075);
      var bh = H * (0.05 + rnd() * 0.26);
      g.fillStyle = color;
      g.fillRect(x, baseY - bh, bw, bh);
      if (rnd() < 0.28) {
        g.fillRect(x + bw * 0.42, baseY - bh - H * 0.02, Math.max(1, W * 0.004), H * 0.02);
      }
      if (lampColor && lampChance) {
        var cols = Math.max(1, Math.floor(bw / (W * 0.012)));
        var rows = Math.max(1, Math.floor(bh / (H * 0.028)));
        for (var r = 0; r < rows; r++) {
          for (var c = 0; c < cols; c++) {
            if (rnd() < lampChance) {
              g.fillStyle = lampColor;
              g.globalAlpha = 0.35 + rnd() * 0.5;
              g.fillRect(x + bw * 0.12 + c * W * 0.012, baseY - bh + H * 0.012 + r * H * 0.028, Math.max(1, W * 0.0042), Math.max(1, H * 0.008));
              g.globalAlpha = 1;
            }
          }
        }
      }
      x += bw + W * (0.004 + rnd() * 0.012);
    }
  }

  function drawHills(g, W, H, baseY, color, rnd, amp) {
    g.fillStyle = color;
    g.beginPath();
    g.moveTo(0, baseY);
    var steps = 6, y = baseY;
    for (var i = 0; i <= steps; i++) {
      var x = (W / steps) * i;
      var ny = baseY - (0.5 + rnd()) * H * (amp || 0.09);
      g.quadraticCurveTo(x - W / steps / 2, y, x, ny);
      y = ny;
    }
    g.lineTo(W, H); g.lineTo(0, H); g.closePath(); g.fill();
  }

  function drawVinyl(g, cx, cy, r, pal) {
    g.save();
    g.translate(cx, cy);
    g.fillStyle = '#0b0b0d';
    g.beginPath(); g.arc(0, 0, r, 0, Math.PI * 2); g.fill();
    g.strokeStyle = 'rgba(255,255,255,0.10)';
    g.lineWidth = Math.max(1, r * 0.004);
    for (var i = 0.35; i < 1; i += 0.06) {
      g.beginPath(); g.arc(0, 0, r * i, 0, Math.PI * 2); g.stroke();
    }
    g.fillStyle = pal.accent;
    g.beginPath(); g.arc(0, 0, r * 0.30, 0, Math.PI * 2); g.fill();
    g.fillStyle = 'rgba(255,255,255,0.55)';
    g.beginPath(); g.arc(0, 0, r * 0.035, 0, Math.PI * 2); g.fill();
    g.restore();
  }

  function drawKeyboard(g, W, H, y, pal) {
    var keys = 26, kw = W / keys, kh = H * 0.055;
    g.fillStyle = mix(pal.ink, '#ffffff', 0.55);
    g.fillRect(0, y, W, kh);
    g.strokeStyle = 'rgba(0,0,0,0.25)'; g.lineWidth = Math.max(1, W * 0.0012);
    for (var i = 1; i < keys; i++) {
      g.beginPath(); g.moveTo(i * kw, y); g.lineTo(i * kw, y + kh); g.stroke();
    }
    g.fillStyle = '#1b1b20';
    var black = [0, 1, 3, 4, 5];
    for (var k = 0; k < keys; k++) {
      if (black.indexOf(k % 7) >= 0) g.fillRect(k * kw + kw * 0.65, y, kw * 0.7, kh * 0.6);
    }
  }

  function wrapText(g, text, maxW) {
    var words = String(text).split(/\s+/), lines = [], cur = '';
    for (var i = 0; i < words.length; i++) {
      var probe = cur ? cur + ' ' + words[i] : words[i];
      if (g.measureText(probe).width > maxW && cur) { lines.push(cur); cur = words[i]; }
      else cur = probe;
    }
    if (cur) lines.push(cur);
    return lines;
  }

  /* o = { w,h,vibe,mood,bpm,keyLabel,title,meta,seed } */
  function drawCover(canvas, o) {
    var g = canvas.getContext('2d');
    var W = canvas.width, H = canvas.height;
    var pal = paletteFor(o.vibe, o.mood);
    var rnd = mulberry32(o.seed || 1);
    var tall = H > W;
    var unit = Math.min(W, H);

    g.clearRect(0, 0, W, H);
    var grad = g.createLinearGradient(0, 0, W * 0.25, H);
    grad.addColorStop(0, pal.sky[0]);
    grad.addColorStop(0.55, pal.sky[1]);
    grad.addColorStop(1, pal.sky[2]);
    g.fillStyle = grad;
    g.fillRect(0, 0, W, H);

    /* 별 · 빛무리 */
    var dark = o.vibe !== 'piano';
    if (dark) {
      for (var s = 0; s < 140; s++) {
        var sx = rnd() * W, sy = rnd() * H * 0.62;
        g.globalAlpha = 0.15 + rnd() * 0.55;
        g.fillStyle = '#ffffff';
        g.fillRect(sx, sy, Math.max(1, W * 0.0016), Math.max(1, W * 0.0016));
      }
      g.globalAlpha = 1;
    }
    var gx = W * (tall ? 0.5 : 0.72), gy = H * (tall ? 0.34 : 0.42), gr = unit * (tall ? 0.42 : 0.34);
    var glow = g.createRadialGradient(gx, gy, 0, gx, gy, gr);
    glow.addColorStop(0, pal.glow);
    glow.addColorStop(0.25, mix(pal.glow, pal.sky[2], 0.55));
    glow.addColorStop(1, 'rgba(0,0,0,0)');
    g.globalAlpha = 0.55;
    g.fillStyle = glow;
    g.fillRect(0, 0, W, H);
    g.globalAlpha = 1;

    var horizon = H * (tall ? 0.62 : 0.68);

    if (o.vibe === 'citypop') {
      /* 태양 원 */
      g.fillStyle = mix(pal.accent, '#fff3c4', 0.35);
      g.globalAlpha = 0.9;
      g.beginPath(); g.arc(gx, gy, unit * 0.16, 0, Math.PI * 2); g.fill();
      g.globalAlpha = 1;
      drawSkyline(g, W, H, horizon, pal.far, rnd, pal.accent2, 0.24);
      drawSkyline(g, W, H, horizon + H * 0.10, pal.near, rnd, null, 0);
      /* 도로 원근 */
      g.strokeStyle = pal.accent2;
      g.globalAlpha = 0.5; g.lineWidth = Math.max(1, W * 0.002);
      for (var i = 0; i <= 12; i++) {
        g.beginPath();
        g.moveTo(W * 0.5 + (i - 6) * W * 0.012, horizon + H * 0.10);
        g.lineTo(W * 0.5 + (i - 6) * W * 0.16, H);
        g.stroke();
      }
      g.globalAlpha = 1;
      /* 네온 라인 */
      g.strokeStyle = pal.accent; g.lineWidth = Math.max(2, W * 0.006);
      g.beginPath(); g.moveTo(0, horizon + H * 0.10); g.lineTo(W, horizon + H * 0.10); g.stroke();
    } else if (o.vibe === 'lofi') {
      /* 창문 너머 도시 + 비 */
      drawSkyline(g, W, H, horizon, pal.far, rnd, pal.accent, 0.16);
      drawSkyline(g, W, H, horizon + H * 0.09, pal.near, rnd, null, 0);
      g.strokeStyle = 'rgba(220,235,255,0.20)';
      g.lineWidth = Math.max(1, W * 0.0012);
      for (var r2 = 0; r2 < 220; r2++) {
        var rx = rnd() * W, ry = rnd() * H * 0.85, rl = H * (0.02 + rnd() * 0.05);
        g.beginPath(); g.moveTo(rx, ry); g.lineTo(rx - rl * 0.18, ry + rl); g.stroke();
      }
      /* 창틀 */
      g.fillStyle = 'rgba(8,9,14,0.72)';
      var fw = W * 0.028;
      g.fillRect(W * 0.5 - fw / 2, 0, fw, H);
      g.fillRect(0, H * 0.52, W, fw);
      g.fillRect(0, 0, W, H * 0.035);
      g.fillRect(0, 0, W * 0.035, H);
      g.fillRect(W - W * 0.035, 0, W * 0.035, H);
      drawVinyl(g, W * (tall ? 0.74 : 0.83), H * (tall ? 0.80 : 0.74), unit * 0.16, pal);
    } else if (o.vibe === 'piano') {
      drawHills(g, W, H, horizon, mix(pal.far, '#ffffff', 0.25), rnd, 0.07);
      drawHills(g, W, H, horizon + H * 0.10, pal.far, rnd, 0.05);
      drawHills(g, W, H, horizon + H * 0.19, pal.near, rnd, 0.04);
      /* 새 */
      g.strokeStyle = 'rgba(40,30,20,0.45)';
      g.lineWidth = Math.max(1, W * 0.0018);
      for (var bd = 0; bd < 5; bd++) {
        var bx = W * (0.15 + rnd() * 0.45), by = H * (0.2 + rnd() * 0.18), bs = unit * 0.012;
        g.beginPath(); g.moveTo(bx - bs, by); g.quadraticCurveTo(bx, by - bs * 1.2, bx + bs, by); g.stroke();
      }
      drawKeyboard(g, W, H, H - H * 0.055, pal);
    } else {
      /* 앰비언트 — 산과 물 */
      drawHills(g, W, H, horizon - H * 0.04, mix(pal.far, '#ffffff', 0.12), rnd, 0.11);
      drawHills(g, W, H, horizon, pal.far, rnd, 0.07);
      var wg = g.createLinearGradient(0, horizon + H * 0.02, 0, H);
      wg.addColorStop(0, mix(pal.sky[2], '#000000', 0.25));
      wg.addColorStop(1, mix(pal.sky[0], '#000000', 0.1));
      g.fillStyle = wg;
      g.fillRect(0, horizon + H * 0.02, W, H);
      g.strokeStyle = 'rgba(230,245,235,0.22)';
      g.lineWidth = Math.max(1, W * 0.0014);
      for (var w2 = 0; w2 < 26; w2++) {
        var wy = horizon + H * 0.05 + rnd() * H * 0.4;
        var wl = W * (0.05 + rnd() * 0.3);
        var wx = rnd() * (W - wl);
        g.beginPath(); g.moveTo(wx, wy); g.lineTo(wx + wl, wy); g.stroke();
      }
    }

    /* 비네트 */
    var vg = g.createRadialGradient(W * 0.5, H * 0.45, unit * 0.15, W * 0.5, H * 0.5, Math.max(W, H) * 0.78);
    vg.addColorStop(0, 'rgba(0,0,0,0)');
    vg.addColorStop(1, o.vibe === 'piano' ? 'rgba(60,42,26,0.28)' : 'rgba(0,0,0,0.55)');
    g.fillStyle = vg;
    g.fillRect(0, 0, W, H);

    /* 필름 그레인 */
    var pat = grainPattern(g);
    g.save();
    g.globalAlpha = o.vibe === 'piano' ? 0.22 : 0.32;
    g.fillStyle = pat;
    g.fillRect(0, 0, W, H);
    g.restore();

    /* 글자 */
    var ink = pal.ink;
    var margin = W * (tall ? 0.085 : 0.075);
    var titleSize = Math.round(unit * (tall ? 0.105 : 0.115));
    var titleY = o.video ? H * (tall ? 0.46 : 0.44) : H * (tall ? 0.70 : 0.66);
    g.textBaseline = 'alphabetic';
    g.fillStyle = ink;
    g.shadowColor = 'rgba(0,0,0,0.45)';
    g.shadowBlur = unit * 0.02;
    g.font = '900 ' + titleSize + 'px "Noto Serif KR","Noto Serif",Georgia,serif';
    if ('letterSpacing' in g) g.letterSpacing = Math.round(titleSize * -0.02) + 'px';
    var lines = wrapText(g, o.title || '', tall ? W - margin * 2 : W * 0.62);
    if (lines.length > 2) lines = [lines[0], lines[1]];
    var lineH = titleSize * 1.16;
    for (var li = 0; li < lines.length; li++) {
      g.fillText(lines[li], margin, titleY + li * lineH);
    }
    g.shadowBlur = 0;
    if ('letterSpacing' in g) g.letterSpacing = '0px';

    /* 메타 줄 */
    var metaY = titleY + lines.length * lineH + unit * 0.045;
    g.font = '600 ' + Math.round(unit * 0.032) + 'px Pretendard,system-ui,sans-serif';
    g.globalAlpha = 0.9;
    g.fillStyle = ink;
    g.fillText(o.meta || '', margin, metaY);
    g.globalAlpha = 1;

    /* 브랜드 — 영상에서는 스펙트럼 자리를 피해 맨 위에 작게 */
    var brandY = o.video ? margin * 0.95 : H - margin * 0.65;
    g.font = '700 ' + Math.round(unit * 0.026) + 'px Pretendard,system-ui,sans-serif';
    g.globalAlpha = o.video ? 0.55 : 0.72;
    g.fillText('INSIGHT BRIEF', margin, brandY);
    g.textAlign = 'right';
    g.globalAlpha = o.video ? 0.45 : 0.55;
    g.fillText('insightbriefnews.com/music.html', W - margin, brandY);
    g.textAlign = 'left';
    g.globalAlpha = 1;

    return canvas;
  }

  /* =========================================================
     7. 상태
     ========================================================= */
  var S = {
    vibe: 'lofi', mood: 'warm', bpm: 78, key: 'C', prog: 'lofi', len: 30,
    title: '', size: 'wide', videoSize: 'wide', seed: 20261126,
    renderSeed: 20261126
  };

  var track = null;          /* AudioBuffer */
  var trackInfo = null;      /* {bpm, vibe, len, peak, name} */
  var stale = true;
  var coverCanvas = null;
  var coverUrl = null;
  var videoBlob = null;
  var videoUrl = null;

  /* 재생 */
  var actx = null, playing = false, playSrc = null, playStart = 0, playOffset = 0, rafId = 0;

  /* 영상 */
  var recording = false, recCancel = false;
  var recRef = null, srcRef = null, recActx = null;

  function vibe() { return byId(VIBES, S.vibe); }
  function mood() { return byId(MOODS, S.mood); }
  function keyObj() { return byId(KEYS, S.key); }
  function progObj() { return byId(progsFor(keyObj()), S.prog); }
  function lenSec() { return S.len; }
  function defaultTitle() { return vibe().title[LANG] || vibe().title.ko; }
  function titleText() { return (S.title || '').trim() || defaultTitle(); }

  function keyLabelOf(k) {
    k = k || keyObj();
    var root = String(k.id).replace(/m$/, '');
    var word = T.keysSuffix[k.mode] || '';
    return LANG === 'ja' ? root + word : root + ' ' + word;
  }
  function keyLabel() { return keyLabelOf(keyObj()); }
  function metaLine() {
    return [nm(vibe()), nm(mood()), S.bpm + ' BPM', keyLabel()].join(' · ');
  }

  function coverSize(size) {
    if (size === 'tall') return { w: 1080, h: 1920 };
    if (size === 'square') return { w: 1080, h: 1080 };
    return { w: 1280, h: 720 };
  }

  /* =========================================================
     8. 화면 그리기
     ========================================================= */
  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function chips(items, get) {
    return items.map(function (o) {
      var on = get(o);
      return '<button type="button" class="bgm-chip' + (on ? ' is-on' : '') + '" data-bgm="' + o.k + '" aria-pressed="' + on + '">' + esc(o.label) + '</button>';
    }).join('');
  }

  function htmlShell() {
    var vibes = VIBES.map(function (v) {
      var on = v.id === S.vibe;
      return '<button type="button" class="bgm-vibe' + (on ? ' is-on' : '') + '" data-bgm-vibe="' + v.id + '" aria-pressed="' + on + '">' +
        '<span class="v-name">' + esc(nm(v)) + '</span>' +
        '<span class="v-desc">' + esc(v.desc[LANG] || v.desc.ko) + '</span>' +
        '<span class="v-meta">' + v.bpm + ' BPM</span>' +
        '</button>';
    }).join('');

    var moods = MOODS.map(function (m) {
      var on = m.id === S.mood;
      return '<button type="button" class="bgm-chip' + (on ? ' is-on' : '') + '" data-bgm-mood="' + m.id + '" aria-pressed="' + on + '">' + esc(nm(m)) + '</button>';
    }).join('');

    var keys = KEYS.map(function (k) {
      var label = keyLabelOf(k);
      return '<option value="' + k.id + '"' + (k.id === S.key ? ' selected' : '') + '>' + esc(label) + '</option>';
    }).join('');

    var progs = progsFor(keyObj()).map(function (p) {
      return '<option value="' + p.id + '"' + (p.id === S.prog ? ' selected' : '') + '>' + esc(nm(p)) + '</option>';
    }).join('');

    var lens = LENGTHS.map(function (n) {
      var on = n === S.len;
      return '<button type="button" class="bgm-chip' + (on ? ' is-on' : '') + '" data-bgm-len="' + n + '" aria-pressed="' + on + '">' + n + ' ' + T.sec + '</button>';
    }).join('');

    var sizes = [['wide', T.sizes.wide], ['tall', T.sizes.tall], ['square', T.sizes.square]].map(function (p) {
      var on = p[0] === S.size;
      return '<button type="button" class="bgm-chip' + (on ? ' is-on' : '') + '" data-bgm-size="' + p[0] + '" aria-pressed="' + on + '">' + esc(p[1]) + '</button>';
    }).join('');

    var vsizes = [['wide', T.sizes.wide], ['tall', T.sizes.tall]].map(function (p) {
      var on = p[0] === S.videoSize;
      return '<button type="button" class="bgm-chip' + (on ? ' is-on' : '') + '" data-bgm-vsize="' + p[0] + '" aria-pressed="' + on + '">' + esc(p[1]) + '</button>';
    }).join('');

    return '' +
      '<div class="bgm-grid">' +
      '  <div class="bgm-panel">' +
      '    <div class="bgm-panel-head"><h3>' + esc(T.panelTitle) + '</h3><p>' + esc(T.panelDek) + '</p></div>' +
      '    <div class="mu-field"><div class="lb"><span class="no">01</span><span class="t">' + esc(T.fGenre) + '</span></div>' +
      '      <div class="bgm-vibes">' + vibes + '</div></div>' +
      '    <div class="mu-field"><div class="lb"><span class="no">02</span><span class="t">' + esc(T.fMood) + '</span></div>' +
      '      <div class="mu-chips">' + moods + '</div></div>' +
      '    <div class="mu-field"><div class="lb"><span class="no">03</span><span class="t">' + esc(T.fBpm) + '</span></div>' +
      '      <div class="mu-range-row"><input type="range" id="bgm-bpm" min="70" max="120" step="1" value="' + S.bpm + '" aria-label="' + esc(T.fBpm) + '">' +
      '      <span class="mu-bpm" id="bgm-bpm-val">' + S.bpm + ' <small>BPM</small></span></div></div>' +
      '    <div class="mu-field"><div class="lb"><span class="no">04</span><span class="t">' + esc(T.fKey) + '</span></div>' +
      '      <select id="bgm-key">' + keys + '</select></div>' +
      '    <div class="mu-field"><div class="lb"><span class="no">05</span><span class="t">' + esc(T.fProg) + '</span></div>' +
      '      <select id="bgm-prog">' + progs + '</select></div>' +
      '    <div class="mu-field"><div class="lb"><span class="no">06</span><span class="t">' + esc(T.fLen) + '</span></div>' +
      '      <div class="mu-chips">' + lens + '</div></div>' +
      '    <div class="mu-field"><div class="lb"><span class="no">07</span><span class="t">' + esc(T.titleLabel) + '</span></div>' +
      '      <input type="text" id="bgm-title" maxlength="48" value="' + esc(S.title) + '" placeholder="' + esc(defaultTitle()) + '" autocomplete="off">' +
      '      <p class="mu-hint">' + esc(T.cardCoverNote) + '</p></div>' +
      '    <div class="bgm-actions"><button type="button" class="mu-btn mu-btn-main" id="bgm-make">' + esc(T.make) + '</button></div>' +
      '  </div>' +
      '  <div class="bgm-stage">' +
      '    <div class="bgm-card">' +
      '      <div class="bgm-card-head"><span class="tag">AUDIO</span><h3>' + esc(T.cardAudio) + '</h3><span class="bgm-len" id="bgm-len-label">' + S.len + ' ' + T.sec + '</span></div>' +
      '      <div class="bgm-wave-wrap"><canvas id="bgm-wave" width="1200" height="180"></canvas><div class="bgm-wave-prog" id="bgm-wave-prog"></div></div>' +
      '      <div class="bgm-player">' +
      '        <button type="button" class="bgm-play" id="bgm-play" disabled aria-label="' + esc(T.play) + '"><span class="ic">&#9654;</span><span class="tx">' + esc(T.play) + '</span></button>' +
      '        <span class="bgm-time" id="bgm-time">00:00 / ' + clock(S.len) + '</span>' +
      '        <label class="bgm-loop"><input type="checkbox" id="bgm-loop"> ' + esc(T.loop) + '</label>' +
      '        <button type="button" class="mu-btn bgm-dl" id="bgm-wav" disabled>' + esc(T.dlWav) + '</button>' +
      '      </div>' +
      '      <p class="bgm-status" id="bgm-status">' + esc(T.stale) + '</p>' +
      '      <p class="bgm-note">' + esc(T.wavNote) + '</p>' +
      '    </div>' +
      '    <div class="bgm-card">' +
      '      <div class="bgm-card-head"><span class="tag">ART</span><h3>' + esc(T.cardCover) + '</h3></div>' +
      '      <div class="bgm-cover-wrap"><canvas id="bgm-cover" width="1280" height="720"></canvas></div>' +
      '      <div class="bgm-sizes">' + sizes + '</div>' +
      '      <div class="bgm-row"><button type="button" class="mu-btn" id="bgm-png">' + esc(T.dlPng) + '</button>' +
      '      <span class="bgm-note-inline">' + esc(T.mobSave) + '</span></div>' +
      '    </div>' +
      '    <div class="bgm-card">' +
      '      <div class="bgm-card-head"><span class="tag">VIDEO</span><h3>' + esc(T.cardVideo) + '</h3></div>' +
      '      <div class="bgm-sizes">' + vsizes + '</div>' +
      '      <div class="bgm-row"><button type="button" class="mu-btn mu-btn-main bgm-video-btn" id="bgm-video">' + esc(T.makeVideo) + '</button>' +
      '      <span class="bgm-note-inline" id="bgm-video-state">' + esc(T.videoHint) + '</span></div>' +
      '      <div class="bgm-video-wrap" id="bgm-video-wrap" hidden><video id="bgm-video-el" controls playsinline></video></div>' +
      '      <div class="bgm-row" id="bgm-video-dl-row" hidden><button type="button" class="mu-btn" id="bgm-video-dl">' + esc(T.dlVideo) + '</button>' +
      '      <span class="bgm-note-inline">' + esc(T.videoNote) + '</span></div>' +
      '      <p class="bgm-note">' + esc(T.cardVideoNote) + '</p>' +
      '    </div>' +
      '  </div>' +
      '</div>';
  }

  /* =========================================================
     9. 합성 흐름
     ========================================================= */
  function cfgForRender() {
    return {
      vibe: vibe(), mood: mood(), bpm: S.bpm, len: S.len,
      pc: keyObj().pc, prog: progObj().chords, seed: S.renderSeed
    };
  }

  function setStatus(msg, kind) {
    var el = document.getElementById('bgm-status');
    if (!el) return;
    el.textContent = msg;
    el.className = 'bgm-status' + (kind ? ' is-' + kind : '');
  }

  function busy(on) {
    var btn = document.getElementById('bgm-make');
    if (!btn) return;
    btn.disabled = !!on;
    btn.textContent = on ? T.making : (track ? T.redo : T.make);
    document.body.classList.toggle('bgm-busy', !!on);
  }

  function render(vary) {
    if (busyOn) { wanted = 1; return; }
    stopPlay();
    busyOn = true;
    busy(true);
    setStatus(T.making);
    if (vary) S.renderSeed = (S.renderSeed * 1103515245 + 12345) % 2147483647;
    var cfg = cfgForRender();
    renderTrack(cfg).then(function (buf) {
      var peak = normalise(buf, 0.89);
      track = buf;
      trackInfo = {
        len: S.len, bpm: S.bpm, vibe: S.vibe, mood: S.mood, key: S.key, prog: S.prog,
        title: titleText(), peak: peak, name: fileBase()
      };
      stale = false;
      videoBlob = null; videoUrl = null;
      var vw = document.getElementById('bgm-video-wrap'), vd = document.getElementById('bgm-video-dl-row');
      if (vw) vw.hidden = true;
      if (vd) vd.hidden = true;
      drawWave(buf);
      var db = 20 * Math.log10(Math.max(peak, 0.00001));
      setStatus(T.readyLen.replace('{s}', S.len).replace('{p}', (Math.round(db * 10) / 10).toFixed(1)), 'ok');
      var pb = document.getElementById('bgm-play'), wb = document.getElementById('bgm-wav');
      if (pb) pb.disabled = false;
      if (wb) wb.disabled = false;
      playOffset = 0;
      setPlayUI(false);
      busyOn = false;
      busy(false);
      if (wanted) { wanted = 0; render(); }
    }).catch(function (err) {
      busyOn = false;
      busy(false);
      setStatus(T.errAudio, 'err');
      if (window.console && console.warn) console.warn('[bgm]', err);
    });
  }
  var busyOn = false;
  var wanted = 0;

  function fileBase() {
    var v = vibe();
    return slug('insight-brief-' + v.id + '-' + S.bpm + 'bpm-' + keyObj().id + '-' + S.len + 's');
  }

  /* ---------- 파형 ---------- */
  function drawWave(buf) {
    var cv = document.getElementById('bgm-wave');
    if (!cv) return;
    var g = cv.getContext('2d');
    var W = cv.width, H = cv.height;
    g.clearRect(0, 0, W, H);
    var data = buf.getChannelData(0);
    var bars = 220;
    var step = Math.floor(data.length / bars) || 1;
    g.fillStyle = '#b9b3a6';
    for (var i = 0; i < bars; i++) {
      var sum = 0;
      for (var j = 0; j < step; j += 7) sum += Math.abs(data[i * step + j] || 0);
      var h = Math.min(H, (sum / (step / 7)) * H * 2.6);
      if (h < 1.5) h = 1.5;
      var bw = W / bars;
      g.fillRect(i * bw, (H - h) / 2, Math.max(1, bw - 1.2), h);
    }
  }

  /* ---------- 재생 ---------- */
  function ensureCtx() {
    if (!actx) {
      var C = window.AudioContext || window.webkitAudioContext;
      if (!C) return null;
      actx = new C();
    }
    if (actx.state === 'suspended' && actx.resume) actx.resume();
    return actx;
  }

  function playPos() {
    if (!track) return 0;
    if (!playing) return playOffset;
    var p = (actx.currentTime - playStart) + playOffset;
    if (p > track.duration) p = track.duration;
    return p;
  }

  function setPlayUI(on) {
    var b = document.getElementById('bgm-play');
    if (!b) return;
    var ic = b.querySelector('.ic'), tx = b.querySelector('.tx');
    if (ic) ic.innerHTML = on ? '&#9632;' : '&#9654;';
    if (tx) tx.textContent = on ? T.pause : T.play;
    b.classList.toggle('is-playing', on);
  }

  function tick() {
    if (!playing) return;
    var p = playPos();
    var el = document.getElementById('bgm-time');
    var prog = document.getElementById('bgm-wave-prog');
    var dur = track ? track.duration : S.len;
    if (el) el.textContent = clock(p) + ' / ' + clock(dur);
    if (prog) prog.style.width = (Math.min(1, p / dur) * 100).toFixed(2) + '%';
    if (p >= dur - 0.01) {
      var loop = document.getElementById('bgm-loop');
      if (loop && loop.checked) {
        startPlay(0);
        return;
      }
      stopPlay();
      playOffset = 0;
      if (prog) prog.style.width = '0%';
      if (el) el.textContent = clock(0) + ' / ' + clock(dur);
      return;
    }
    rafId = window.requestAnimationFrame(tick);
  }

  function startPlay(offset) {
    var ctx = ensureCtx();
    if (!ctx || !track) return;
    stopSrc();
    playSrc = ctx.createBufferSource();
    playSrc.buffer = track;
    playSrc.connect(ctx.destination);
    playOffset = offset || 0;
    playStart = ctx.currentTime;
    var loop = document.getElementById('bgm-loop');
    playSrc.loop = !!(loop && loop.checked);
    playSrc.start(0, playOffset);
    playing = true;
    setPlayUI(true);
    rafId = window.requestAnimationFrame(tick);
  }

  function stopSrc() {
    if (playSrc) {
      try { playSrc.onended = null; playSrc.stop(); } catch (e) { }
      try { playSrc.disconnect(); } catch (e) { }
      playSrc = null;
    }
  }

  function stopPlay() {
    if (!playing) { stopSrc(); return; }
    playOffset = playPos();
    stopSrc();
    playing = false;
    setPlayUI(false);
    if (rafId) { window.cancelAnimationFrame(rafId); rafId = 0; }
  }

  /* ---------- 커버 ---------- */
  function paintCover() {
    var cv = document.getElementById('bgm-cover');
    if (!cv) return;
    var sz = coverSize(S.size);
    cv.width = sz.w; cv.height = sz.h;
    try {
      drawCover(cv, {
        w: sz.w, h: sz.h, vibe: S.vibe, mood: S.mood, bpm: S.bpm,
        keyLabel: keyLabel(), title: titleText(), meta: metaLine(),
        seed: S.seed
      });
    } catch (e) {
      setStatus(T.errCover, 'err');
    }
  }

  /* ---------- 영상 ---------- */
  function pickMime() {
    if (!window.MediaRecorder) return '';
    var list = [
      'video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm',
      'video/mp4;codecs=avc1.42E01E,mp4a.40.2', 'video/mp4'
    ];
    for (var i = 0; i < list.length; i++) {
      try { if (MediaRecorder.isTypeSupported(list[i])) return list[i]; } catch (e) { }
    }
    return '';
  }

  function videoSupported() {
    return !!(window.MediaRecorder && HTMLCanvasElement.prototype.captureStream && (window.AudioContext || window.webkitAudioContext));
  }

  function makeVideo() {
    if (recording) {
      recCancel = true;
      try { if (recRef && recRef.state !== 'inactive') recRef.stop(); } catch (e) { }
      try { if (srcRef) srcRef.stop(); } catch (e) { }
      return;
    }
    if (!track) { setStatus(T.stale, 'warn'); return; }
    if (!videoSupported()) {
      setVideoState(T.videoUnsupported, 'err');
      return;
    }
    var mime = pickMime();
    var sz = coverSize(S.videoSize);
    var W = sz.w, H = sz.h;
    var base = document.createElement('canvas');
    base.width = W; base.height = H;
    drawCover(base, {
      w: W, h: H, vibe: S.vibe, mood: S.mood, bpm: S.bpm, keyLabel: keyLabel(),
      title: titleText(), meta: metaLine(), seed: S.seed, video: true
    });

    var out = document.createElement('canvas');
    out.width = W; out.height = H;
    var g = out.getContext('2d');
    var pal = paletteFor(S.vibe, S.mood);

    var stream = out.captureStream(30);
    var C = window.AudioContext || window.webkitAudioContext;
    var actx2 = new C();
    var destNode = actx2.createMediaStreamDestination();
    var src = actx2.createBufferSource();
    src.buffer = track;
    var analyser = actx2.createAnalyser();
    analyser.fftSize = 1024;
    analyser.smoothingTimeConstant = 0.78;
    src.connect(analyser);
    analyser.connect(destNode);
    destNode.stream.getAudioTracks().forEach(function (t) { stream.addTrack(t); });

    var rec;
    try {
      rec = mime ? new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 4500000, audioBitsPerSecond: 128000 })
                 : new MediaRecorder(stream);
    } catch (e) {
      setVideoState(T.videoUnsupported, 'err');
      return;
    }
    var chunks = [];
    recRef = rec; srcRef = src; recActx = actx2;
    rec.ondataavailable = function (e) { if (e.data && e.data.size) chunks.push(e.data); };
    rec.onstop = function () {
      recording = false;
      recRef = null; srcRef = null;
      var type = rec.mimeType || mime || 'video/webm';
      var blob = new Blob(chunks, { type: type });
      var btn = document.getElementById('bgm-video');
      if (btn) { btn.textContent = T.makeVideo; btn.classList.remove('is-rec'); }
      if (actx2.close) actx2.close();
      if (recCancel) {
        recCancel = false;
        setVideoState(T.videoHint);
        return;
      }
      if (!blob.size) { setVideoState(T.errAudio, 'err'); return; }
      videoBlob = blob;
      if (videoUrl) URL.revokeObjectURL(videoUrl);
      videoUrl = URL.createObjectURL(blob);
      var wrap = document.getElementById('bgm-video-wrap');
      var el = document.getElementById('bgm-video-el');
      var dl = document.getElementById('bgm-video-dl-row');
      if (el) { el.src = videoUrl; el.load(); }
      if (el) setTimeout(function () { fixDuration(el); }, 300);
      if (wrap) wrap.hidden = false;
      if (dl) dl.hidden = false;
      setVideoState(T.videoDone, 'ok');
    };

    var fbuf = new Uint8Array(analyser.frequencyBinCount);
    var startT = 0;
    var dur = track.duration;
    recording = true; recCancel = false;
    var btn = document.getElementById('bgm-video');
    if (btn) { btn.textContent = T.cancelVideo; btn.classList.add('is-rec'); }
    setVideoState(T.recording.replace('{p}', '0'), 'rec');
    rec.start(100);
    src.start();

    var bars = W > H ? 96 : 56;
    function frame(now) {
      if (!recording) return;
      var t = actx2.currentTime - startT;
      if (!startT) { startT = actx2.currentTime; t = 0; }
      analyser.getByteFrequencyData(fbuf);

      g.drawImage(base, 0, 0, W, H);

      /* 스펙트럼 */
      var areaTop = H * (W > H ? 0.64 : 0.66);
      var areaH = H * (W > H ? 0.24 : 0.22);
      var scrim = g.createLinearGradient(0, areaTop - areaH * 0.25, 0, H);
      scrim.addColorStop(0, 'rgba(0,0,0,0)');
      scrim.addColorStop(0.45, 'rgba(0,0,0,0.28)');
      scrim.addColorStop(1, 'rgba(0,0,0,0.52)');
      g.fillStyle = scrim;
      g.fillRect(0, areaTop - areaH * 0.25, W, H - (areaTop - areaH * 0.25));
      var bw = W / bars;
      g.globalAlpha = 0.95;
      for (var i = 0; i < bars; i++) {
        var idx = Math.floor(Math.pow(i / bars, 1.35) * (fbuf.length * 0.72));
        var v = fbuf[idx] / 255;
        v = Math.pow(v, 0.8) * (1 + 0.6 * Math.pow(i / bars, 1.4));
        if (v > 1) v = 1;
        var h = Math.max(areaH * 0.012, v * areaH);
        var x = i * bw + bw * 0.18;
        var bwid = bw * 0.64;
        var lg = g.createLinearGradient(0, areaTop + areaH - h, 0, areaTop + areaH);
        lg.addColorStop(0, mix(pal.accent, '#ffffff', 0.55));
        lg.addColorStop(1, pal.accent);
        g.fillStyle = lg;
        g.fillRect(x, areaTop + areaH - h, bwid, h);
      }
      g.globalAlpha = 1;

      /* 진행 바 */
      var py = H - H * 0.045;
      g.fillStyle = 'rgba(255,255,255,0.22)';
      g.fillRect(W * 0.075, py, W * 0.85, Math.max(2, H * 0.004));
      var pr = Math.min(1, t / dur);
      g.fillStyle = pal.accent;
      g.fillRect(W * 0.075, py, W * 0.85 * pr, Math.max(2, H * 0.004));
      g.beginPath();
      g.arc(W * 0.075 + W * 0.85 * pr, py + Math.max(1, H * 0.002), Math.max(3, H * 0.007), 0, Math.PI * 2);
      g.fill();

      /* 남은 시간 */
      g.font = '600 ' + Math.round(Math.min(W, H) * 0.028) + 'px Pretendard,system-ui,sans-serif';
      g.globalAlpha = 0.8;
      g.fillStyle = pal.ink;
      g.textAlign = 'right';
      g.fillText(clock(Math.max(0, dur - t)), W * 0.925, py - H * 0.02);
      g.textAlign = 'left';
      g.globalAlpha = 1;

      if (!frame._last || now - frame._last > 400) {
        frame._last = now;
        setVideoState(T.recording.replace('{p}', String(Math.min(99, Math.round(pr * 100)))), 'rec');
      }

      if (t >= dur - 0.05) {
        try { rec.stop(); } catch (e) { }
        return;
      }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
    src.onended = function () {
      setTimeout(function () { if (recording) { try { rec.stop(); } catch (e) { } } }, 180);
    };
  }

  function setVideoState(msg, kind) {
    var el = document.getElementById('bgm-video-state');
    if (!el) return;
    el.textContent = msg;
    el.className = 'bgm-note-inline' + (kind ? ' is-' + kind : '');
  }

  /* MediaRecorder가 만든 WebM은 길이 정보가 헤더에 없어 미리보기의 seek 바가
     비어 보입니다. 아주 먼 위치로 한 번 건너뛰면 브라우저가 전체 길이를 읽습니다. */
  function fixDuration(v) {
    try {
      if (isFinite(v.duration) && v.duration > 0) return;
      var done = function () {
        v.removeEventListener('timeupdate', done);
        try { v.currentTime = 0; } catch (e) { }
      };
      v.addEventListener('timeupdate', done);
      v.currentTime = 1e101;
    } catch (e) { }
  }

  /* =========================================================
     10. 이벤트
     ========================================================= */
  function markStale() {
    stale = true;
    wanted = 1;
    if (track) setStatus(T.stale, 'warn');
    var pb = document.getElementById('bgm-play');
    if (pb) pb.disabled = true;
    var wb = document.getElementById('bgm-wav');
    if (wb) wb.disabled = true;
  }

  function rerenderSoon() {
    clearTimeout(rerenderSoon._t);
    rerenderSoon._t = setTimeout(function () { render(); }, 260);
  }

  function onChangeMade() {
    stopPlay();
    playOffset = 0;
    var el = document.getElementById('bgm-time');
    if (el) el.textContent = clock(0) + ' / ' + clock(S.len);
    var prog = document.getElementById('bgm-wave-prog');
    if (prog) prog.style.width = '0%';
    var ll = document.getElementById('bgm-len-label');
    if (ll) ll.textContent = S.len + ' ' + T.sec;
    paintCoverSoon();
  }

  function paintCoverSoon() {
    clearTimeout(paintCoverSoon._t);
    paintCoverSoon._t = setTimeout(paintCover, 140);
  }

  function bind() {
    host.addEventListener('click', function (e) {
      var t = e.target;
      if (recording && !t.closest('#bgm-video')) return;
      var v = t.closest('[data-bgm-vibe]');
      if (v) {
        S.vibe = v.getAttribute('data-bgm-vibe');
        S.bpm = byId(VIBES, S.vibe).bpm;
        var bp = document.getElementById('bgm-bpm');
        if (bp) bp.value = S.bpm;
        var bv = document.getElementById('bgm-bpm-val');
        if (bv) bv.innerHTML = S.bpm + ' <small>BPM</small>';
        S.seed = (S.seed * 1664525 + 1013904223) % 2147483647;
        redrawChips();
        onChangeMade();
        markStale();
        rerenderSoon();
        return;
      }
      var m = t.closest('[data-bgm-mood]');
      if (m) {
        S.mood = m.getAttribute('data-bgm-mood');
        redrawChips(); onChangeMade(); markStale(); rerenderSoon(); return;
      }
      var l = t.closest('[data-bgm-len]');
      if (l) {
        S.len = parseInt(l.getAttribute('data-bgm-len'), 10);
        redrawChips(); onChangeMade(); markStale(); rerenderSoon(); return;
      }
      var sz = t.closest('[data-bgm-size]');
      if (sz) { S.size = sz.getAttribute('data-bgm-size'); redrawChips(); paintCover(); return; }
      var vs = t.closest('[data-bgm-vsize]');
      if (vs) { S.videoSize = vs.getAttribute('data-bgm-vsize'); redrawChips(); return; }
      if (t.closest('#bgm-make')) { render(true); return; }
      if (t.closest('#bgm-play')) {
        if (playing) { stopPlay(); }
        else {
          if (!track) return;
          if (playOffset >= track.duration - 0.05) playOffset = 0;
          startPlay(playOffset);
        }
        return;
      }
      if (t.closest('#bgm-wav')) {
        if (!track) return;
        var blob = encodeWav(track);
        download(blob, fileBase() + '.wav');
        toast(T.toastWav);
        return;
      }
      if (t.closest('#bgm-png')) {
        var cv = document.getElementById('bgm-cover');
        if (!cv) return;
        var sz2 = coverSize(S.size);
        var name = fileBase() + '-cover-' + sz2.w + 'x' + sz2.h + '.png';
        var done = function (b) { download(b, name); toast(T.toastPng); };
        if (cv.toBlob) cv.toBlob(function (b) { if (b) done(b); }, 'image/png');
        else {
          var data = cv.toDataURL('image/png').split(',')[1];
          var bin = atob(data), arr = new Uint8Array(bin.length);
          for (var i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
          done(new Blob([arr], { type: 'image/png' }));
        }
        return;
      }
      if (t.closest('#bgm-video')) { makeVideo(); return; }
      if (t.closest('#bgm-video-dl')) {
        if (!videoBlob) return;
        var ext = (videoBlob.type.indexOf('mp4') >= 0) ? '.mp4' : '.webm';
        download(videoBlob, fileBase() + '-spectrum' + ext);
        toast(T.toastVideo);
        return;
      }
    });

    host.addEventListener('input', function (e) {
      var t = e.target;
      if (recording) return;
      if (t.id === 'bgm-bpm') {
        S.bpm = parseInt(t.value, 10) || 78;
        var bv = document.getElementById('bgm-bpm-val');
        if (bv) bv.innerHTML = S.bpm + ' <small>BPM</small>';
        onChangeMade(); markStale(); rerenderSoon();
      } else if (t.id === 'bgm-title') {
        S.title = t.value;
        clearTimeout(bind._tt);
        bind._tt = setTimeout(function () { paintCover(); }, 180);
      }
    });

    host.addEventListener('change', function (e) {
      var t = e.target;
      if (recording) return;
      if (t.id === 'bgm-key') {
        S.key = t.value;
        S.prog = progsFor(keyObj())[0].id;
        var sel = document.getElementById('bgm-prog');
        if (sel) {
          sel.innerHTML = progsFor(keyObj()).map(function (p) {
            return '<option value="' + p.id + '"' + (p.id === S.prog ? ' selected' : '') + '>' + esc(nm(p)) + '</option>';
          }).join('');
        }
        onChangeMade(); markStale(); rerenderSoon();
      } else if (t.id === 'bgm-prog') {
        S.prog = t.value; onChangeMade(); markStale(); rerenderSoon();
      } else if (t.id === 'bgm-loop') {
        if (playSrc) playSrc.loop = !!t.checked;
      }
    });
  }

  function redrawChips() {
    /* 칩의 선택 상태만 다시 그립니다(입력 중인 글자를 잃지 않도록). */
    var groups = [
      ['[data-bgm-mood]', 'data-bgm-mood', S.mood],
      ['[data-bgm-len]', 'data-bgm-len', String(S.len)],
      ['[data-bgm-size]', 'data-bgm-size', S.size],
      ['[data-bgm-vsize]', 'data-bgm-vsize', S.videoSize]
    ];
    groups.forEach(function (gp) {
      var els = host.querySelectorAll(gp[0]);
      for (var i = 0; i < els.length; i++) {
        var on = els[i].getAttribute(gp[1]) === gp[2];
        els[i].classList.toggle('is-on', on);
        els[i].setAttribute('aria-pressed', on ? 'true' : 'false');
      }
    });
    var vb = host.querySelectorAll('[data-bgm-vibe]');
    for (var k = 0; k < vb.length; k++) {
      var on2 = vb[k].getAttribute('data-bgm-vibe') === S.vibe;
      vb[k].classList.toggle('is-on', on2);
      vb[k].setAttribute('aria-pressed', on2 ? 'true' : 'false');
    }
  }

  function toast(msg) {
    var el = document.getElementById('mu-toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('on');
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { el.classList.remove('on'); }, 1900);
  }

  /* =========================================================
     11. 시작
     ========================================================= */
  function init() {
    var Ctor = window.OfflineAudioContext || window.webkitOfflineAudioContext;
    S.bpm = vibe().bpm;
    if (progsFor(keyObj()).map(function (p) { return p.id; }).indexOf(S.prog) < 0) S.prog = progsFor(keyObj())[0].id;
    host.innerHTML = htmlShell();
    var bp = document.getElementById('bgm-bpm');
    if (bp) bp.value = S.bpm;
    paintCover();
    bind();
    if (!Ctor) {
      setStatus(T.audioUnsupported, 'err');
      var mk = document.getElementById('bgm-make');
      if (mk) mk.disabled = true;
      return;
    }
    if (!videoSupported()) setVideoState(T.videoUnsupported, 'warn');
    render();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  /* 검증용(내부 점검에서만 씁니다) */
  window.__IB_BGM__ = {
    state: S,
    cfg: cfgForRender,
    render: renderTrack,
    wav: encodeWav,
    cover: drawCover,
    normalise: normalise,
    meta: metaLine
  };
})();
