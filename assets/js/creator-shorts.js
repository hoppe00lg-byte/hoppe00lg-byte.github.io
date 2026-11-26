/* =========================================================
   INSIGHT BRIEF — 크리에이터 스튜디오 : 쇼츠·영상 생성
   장면 자막 카드를 Canvas로 그리고, Web Audio로 배경음을 합성해
   MediaRecorder로 .webm 파일을 만듭니다. 서버 전송 없음.
   ========================================================= */
(function () {
  'use strict';

  var CS = window.IB_CS;
  if (!CS) return;
  var DATA = window.IB_CREATOR_DATA;
  var S = CS.state;
  var $ = function (id) { return document.getElementById(id); };
  var t = CS.t;
  var esc = CS.esc;

  var THEMES = {
    ink: { bg1: '#11100f', bg2: '#241f1c', fg: '#f7f3ee', dim: 'rgba(247,243,238,.62)', accent: '#e2564a', chip: 'rgba(226,86,74,.16)' },
    paper: { bg1: '#ffffff', bg2: '#f2f0ec', fg: '#15171a', dim: 'rgba(21,23,26,.6)', accent: '#b3261e', chip: 'rgba(179,38,30,.1)' },
    navy: { bg1: '#0d1626', bg2: '#16263f', fg: '#eaf2ff', dim: 'rgba(234,242,255,.62)', accent: '#58a6ff', chip: 'rgba(88,166,255,.16)' }
  };

  var canvas = $('cs-canvas');
  var ctx = canvas ? canvas.getContext('2d') : null;

  /* ---------- 장면 만들기 ---------- */
  function readInput() {
    var pack = DATA[CS.lang] || DATA.ko;
    return {
      topic: (($('cs-topic') && $('cs-topic').value) || '').trim(),
      script: (($('cs-script') && $('cs-script').value) || '').trim(),
      cat: ($('cs-cat') && $('cs-cat').value) || 'info',
      ratio: ($('cs-ratio') && $('cs-ratio').value) || '9:16',
      count: Number(($('cs-count') && $('cs-count').value) || 6),
      bgm: ($('cs-bgm') && $('cs-bgm').value) || 'lofi',
      theme: ($('cs-theme') && $('cs-theme').value) || 'ink',
      mark: !!($('cs-mark') && $('cs-mark').checked),
      pack: pack
    };
  }

  function parseScript(text, pack) {
    var lines = text.split(/\n+/).map(function (l) { return l.trim(); }).filter(Boolean);
    return lines.map(function (line) {
      var parts = line.split('|');
      if (parts.length > 1) return { h: parts[0].trim(), c: parts.slice(1).join('|').trim(), d: 3.6 };
      return { h: '', c: line, d: 3.6 };
    });
  }

  function buildScenes(input) {
    var pack = input.pack || DATA.ko;
    var sh = pack.shorts;
    var cat = (pack.cats[input.cat] || pack.cats.info);
    var kw = input.topic || (DATA.ko.ui && 'topic') || '';

    if (input.script) {
      var custom = parseScript(input.script, pack);
      custom[0].d = 3.4;
      if (custom.length > 1) custom[custom.length - 1].d = 3.0;
      custom.forEach(function (s, i) {
        if (!s.h) s.h = i === 0 ? fillKw(sh.hooks[0], kw) : '';
      });
      return { scenes: custom, kw: kw, pack: pack };
    }

    if (!kw) return null;
    var rnd = (function (seed) {
      var h = 2166136261;
      for (var i = 0; i < seed.length; i++) { h ^= seed.charCodeAt(i); h = Math.imul(h, 16777619); }
      return function () { h += 0x6D2B79F5; var x = h; x = Math.imul(x ^ (x >>> 15), x | 1); x ^= x + Math.imul(x ^ (x >>> 7), x | 61); return ((x ^ (x >>> 14)) >>> 0) / 4294967296; };
    })(kw + input.cat);

    // 긴 주제어는 문장 중간에 넣으면 어색하므로 앞에 오는 틀을 우선합니다.
    var pool = sh.hooks.filter(function (h) { return h.indexOf('{kw}') === 0; });
    if (!pool.length || kw.length <= 20) pool = sh.hooks;
    var hook = fillKw(pool[Math.floor(rnd() * pool.length) % pool.length], kw);
    var points = sh.pointTpl.slice();
    var caps = (sh.captions[input.cat] || sh.captions.info).slice().concat(sh.capsExtra || []);
    var scenes = [{ h: hook, c: caps[0] || '', d: 3.4 }];
    var body = Math.max(2, input.count - 2);
    for (var i = 0; i < body; i++) {
      scenes.push({
        h: points[i % points.length],
        c: caps[(i + 1) % caps.length] || '',
        d: 3.6
      });
    }
    scenes.push({ h: sh.cta[Math.floor(rnd() * sh.cta.length) % sh.cta.length], c: '', d: 3.0 });
    return { scenes: scenes, kw: kw, pack: pack };
  }

  function fillKw(str, kw) { return String(str || '').split('{kw}').join(kw); }

  /* ---------- 그리기 ---------- */
  function sizeCanvas(ratio) {
    if (ratio === '16:9') { canvas.width = 1920; canvas.height = 1080; }
    else { canvas.width = 1080; canvas.height = 1920; }
    var wrap = $('cs-canvas-wrap');
    if (wrap) wrap.classList.toggle('is-16', ratio === '16:9');
  }

  function wrapText(g, text, maxWidth, font) {
    g.font = font;
    var words = String(text || '').split(/\s+/).filter(Boolean);
    if (!words.length) return [];
    var lines = [], line = '';
    var isCjk = /[\u3040-\u30ff\u4e00-\u9fff]/.test(text);
    for (var i = 0; i < words.length; i++) {
      var test = line ? line + ' ' + words[i] : words[i];
      if (g.measureText(test).width > maxWidth && line) {
        lines.push(line);
        line = words[i];
      } else line = test;
    }
    if (line) lines.push(line);
    // 줄 끝에 한두 글자만 남지 않도록 다음 줄로 옮깁니다(한국어 어절).
    for (var q = 0; q < lines.length - 1; q++) {
      var toks = lines[q].split(' ');
      if (toks.length > 1 && toks[toks.length - 1].replace(/[,.!?]$/, '').length <= 2) {
        var move = toks.pop();
        lines[q] = toks.join(' ');
        lines[q + 1] = move + ' ' + lines[q + 1];
      }
    }
    if (isCjk) { // 한·중·일은 글자 단위로 더 잘게
      var out = [];
      lines.forEach(function (ln) {
        if (g.measureText(ln).width <= maxWidth) { out.push(ln); return; }
        var cur = '';
        for (var k = 0; k < ln.length; k++) {
          var ch = ln[k];
          if (g.measureText(cur + ch).width > maxWidth && cur) { out.push(cur); cur = ch; }
          else cur += ch;
        }
        if (cur) out.push(cur);
      });
      return out;
    }
    return lines;
  }

  function roundRect(g, x, y, w, h, r) {
    g.beginPath();
    g.moveTo(x + r, y);
    g.arcTo(x + w, y, x + w, y + h, r);
    g.arcTo(x + w, y + h, x, y + h, r);
    g.arcTo(x, y + h, x, y, r);
    g.arcTo(x, y, x + w, y, r);
    g.closePath();
  }

  function draw(scene, progress, idx, total, input) {
    if (!ctx) return;
    var th = THEMES[input.theme] || THEMES.ink;
    var W = canvas.width, H = canvas.height;
    var vertical = W < H;
    var pad = Math.round(Math.min(W, H) * 0.09);

    // 배경
    var grad = ctx.createLinearGradient(0, 0, W * 0.4, H);
    grad.addColorStop(0, th.bg1);
    grad.addColorStop(1, th.bg2);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // 은은한 격자
    ctx.save();
    ctx.globalAlpha = 0.06;
    ctx.strokeStyle = th.fg;
    ctx.lineWidth = 2;
    var step = Math.round(Math.min(W, H) / 12);
    for (var y = 0; y < H; y += step) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    ctx.restore();

    // 포인트 바
    var barH = Math.round(H * 0.006);
    ctx.fillStyle = th.chip;
    ctx.fillRect(pad, pad * 0.9, W - pad * 2, barH);
    ctx.fillStyle = th.accent;
    ctx.fillRect(pad, pad * 0.9, (W - pad * 2) * Math.min(1, Math.max(0, progress)), barH);

    // 장면 번호
    ctx.fillStyle = th.dim;
    ctx.font = '700 ' + Math.round(W * 0.026) + 'px ui-monospace,Menlo,Consolas,monospace';
    ctx.textAlign = 'left';
    ctx.fillText(String(idx + 1).padStart(2, '0') + ' / ' + String(total).padStart(2, '0'), pad, pad * 1.7);

    // 제목
    var titleFont = '800 ' + Math.round(W * (vertical ? 0.082 : 0.058)) + 'px "Noto Serif KR","Pretendard",-apple-system,"Apple SD Gothic Neo",serif';
    var titleLines = wrapText(ctx, scene.h || '', W - pad * 2, titleFont);
    var titleLH = Math.round(W * (vertical ? 0.098 : 0.072));
    var blockH = titleLines.length * titleLH;

    // 캡션
    var capFont = '500 ' + Math.round(W * (vertical ? 0.038 : 0.03)) + 'px "Pretendard",-apple-system,"Apple SD Gothic Neo",sans-serif';
    var capLines = wrapText(ctx, scene.c || '', W - pad * 2, capFont);
    var capLH = Math.round(W * (vertical ? 0.052 : 0.042));
    var capH = capLines.length * capLH;

    var totalH = blockH + (capLines.length ? capH + Math.round(W * 0.03) : 0);
    var startY = Math.max(pad * 2.2, (H - totalH) / 2);

    ctx.textAlign = 'left';
    ctx.fillStyle = th.fg;
    ctx.font = titleFont;
    titleLines.forEach(function (ln, i) {
      ctx.fillText(ln, pad, startY + titleLH * (i + 0.82));
    });

    if (capLines.length) {
      var capY = startY + blockH + Math.round(W * 0.03);
      // 캡션 강조 띠
      ctx.fillStyle = th.accent;
      ctx.fillRect(pad, capY + Math.round(W * 0.012), Math.round(W * 0.012), capH - Math.round(W * 0.01));
      ctx.fillStyle = th.dim;
      ctx.font = capFont;
      capLines.forEach(function (ln, i) {
        ctx.fillText(ln, pad + Math.round(W * 0.032), capY + capLH * (i + 0.85));
      });
    }

    // 장면 진행 점
    var dotY = H - pad * 0.72;
    var dotR = Math.max(3, Math.round(W * 0.0055));
    var gap = dotR * 4;
    var startX = W / 2 - ((total - 1) * gap) / 2;
    for (var d = 0; d < total; d++) {
      ctx.beginPath();
      ctx.arc(startX + d * gap, dotY, d === idx ? dotR * 1.5 : dotR, 0, Math.PI * 2);
      ctx.fillStyle = d === idx ? th.accent : th.dim;
      ctx.globalAlpha = d === idx ? 1 : 0.45;
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // 워터마크
    if (input.mark) {
      ctx.fillStyle = th.dim;
      ctx.font = '700 ' + Math.round(W * 0.02) + 'px ui-monospace,Menlo,Consolas,monospace';
      ctx.textAlign = 'right';
      ctx.fillText('INSIGHT BRIEF', W - pad, H - pad * 1.25);
      ctx.textAlign = 'left';
    }
  }

  /* ---------- 미리보기 재생 ---------- */
  var playRaf = null, playStart = 0, playing = false;

  function totalDuration(scenes) {
    return scenes.reduce(function (a, s) { return a + (s.d || 3.4); }, 0);
  }

  function sceneAt(scenes, sec) {
    var acc = 0;
    for (var i = 0; i < scenes.length; i++) {
      if (sec < acc + scenes[i].d) return { scene: scenes[i], idx: i, local: sec - acc };
      acc += scenes[i].d;
    }
    return { scene: scenes[scenes.length - 1], idx: scenes.length - 1, local: scenes[scenes.length - 1].d };
  }

  function play() {
    var sh = S.shorts;
    if (!sh) { CS.toast(t('emptyTopic')); return; }
    stopPlay();
    playing = true;
    var input = readInput();
    var btn = $('cs-play');
    if (btn) btn.textContent = t('stop');
    playStart = performance.now();
    var total = totalDuration(sh.scenes);
    startAudio(input, false);
    function frame(now) {
      if (!playing) return;
      var sec = (now - playStart) / 1000;
      if (sec >= total) {
        stopPlay();
        speakStop();
        return;
      }
      var at = sceneAt(sh.scenes, sec);
      draw(at.scene, at.local / at.scene.d, at.idx, sh.scenes.length, input);
      playRaf = requestAnimationFrame(frame);
    }
    playRaf = requestAnimationFrame(frame);
    speakScenes(sh.scenes, input);
  }

  function stopPlay() {
    playing = false;
    if (playRaf) cancelAnimationFrame(playRaf);
    playRaf = null;
    var btn = $('cs-play');
    if (btn) btn.textContent = t('preview');
    stopAudio();
  }

  /* ---------- 음성(TTS) 미리듣기 ---------- */
  var ttsQueue = 0;
  function speakStop() {
    ttsQueue++;
    try { window.speechSynthesis && window.speechSynthesis.cancel(); } catch (e) { /* 무시 */ }
  }
  function speakScenes(scenes, input) {
    if (!('speechSynthesis' in window)) { CS.toast('TTS 지원 안 함'); return; }
    speakStop();
    var my = ttsQueue;
    var langTag = { ko: 'ko-KR', en: 'en-US', zh: 'zh-CN', ja: 'ja-JP' }[CS.lang] || 'ko-KR';
    var text = scenes.map(function (s) { return (s.h ? s.h + '. ' : '') + (s.c || ''); }).join(' ');
    var u = new SpeechSynthesisUtterance(text);
    u.lang = langTag;
    u.rate = 1.02;
    var voices = window.speechSynthesis.getVoices() || [];
    var match = voices.filter(function (v) { return v.lang && v.lang.toLowerCase().indexOf(langTag.slice(0, 2)) === 0; });
    if (match.length) u.voice = match[0];
    window.speechSynthesis.speak(u);
    return my;
  }

  /* ---------- 배경음 합성 (Web Audio) ---------- */
  var AC = null, audioState = null;

  function audioCtor() { return window.AudioContext || window.webkitAudioContext; }

  function startAudio(input, recording) {
    stopAudio();
    if (input.bgm === 'none') return null;
    var Ctor = audioCtor();
    if (!Ctor) return null;
    var ac = new Ctor();
    AC = ac;
    var master = ac.createGain();
    master.gain.value = recording ? 0.9 : 0.5;
    var dest = null;
    if (ac.createMediaStreamDestination) {
      dest = ac.createMediaStreamDestination();
      master.connect(dest);
    }
    if (!recording) master.connect(ac.destination);

    var reverb = null;
    if (ac.createConvolver) {
      reverb = ac.createConvolver();
      reverb.buffer = impulse(ac, 1.8, 2.4);
      var rg = ac.createGain(); rg.gain.value = 0.32;
      reverb.connect(rg); rg.connect(master);
    }

    var state = { ac: ac, master: master, dest: dest, step: 0, timer: null, next: ac.currentTime + 0.08, input: input };
    audioState = state;

    var stepDur = input.bgm === 'ambient' ? 0.5 : 0.28;
    var prog = [[0, 3, 7, 10], [-2, 3, 5, 10], [-4, 0, 3, 8], [-5, -1, 2, 7]];
    var rootMidi = input.bgm === 'piano' ? 60 : 48;

    function scheduleStep(step, when) {
      var bar = Math.floor(step / 8) % prog.length;
      var beat = step % 8;
      var chord = prog[bar].map(function (iv) { return rootMidi + iv; });

      // 패드
      if (beat === 0) {
        chord.forEach(function (m, i) {
          var o = ac.createOscillator(), g = ac.createGain();
          o.type = input.bgm === 'piano' ? 'triangle' : 'sine';
          o.frequency.value = midi(m - 12);
          o.detune.value = (i - 1.5) * 4;
          g.gain.setValueAtTime(0, when);
          g.gain.linearRampToValueAtTime(input.bgm === 'lofi' ? 0.07 : 0.06, when + stepDur * 2);
          g.gain.linearRampToValueAtTime(0.0001, when + stepDur * 8);
          o.connect(g); g.connect(master);
          if (reverb && input.bgm !== 'lofi') g.connect(reverb);
          o.start(when); o.stop(when + stepDur * 8 + 0.1);
        });
      }

      // 아르페지오
      if (beat % 2 === 0 || input.bgm === 'piano') {
        var note = chord[(step * 3) % chord.length] + (input.bgm === 'piano' ? 12 : 0);
        var o2 = ac.createOscillator(), g2 = ac.createGain();
        o2.type = input.bgm === 'ambient' ? 'sine' : 'triangle';
        o2.frequency.value = midi(note);
        var peak = input.bgm === 'ambient' ? 0.05 : 0.1;
        g2.gain.setValueAtTime(0.0001, when);
        g2.gain.exponentialRampToValueAtTime(peak, when + 0.02);
        g2.gain.exponentialRampToValueAtTime(0.0001, when + stepDur * 2.6);
        o2.connect(g2); g2.connect(master);
        if (reverb) g2.connect(reverb);
        o2.start(when); o2.stop(when + stepDur * 3);
      }

      // 로파이 킥·햇
      if (input.bgm === 'lofi') {
        if (beat === 0 || beat === 4) {
          var ko = ac.createOscillator(), kg = ac.createGain();
          ko.type = 'sine';
          ko.frequency.setValueAtTime(110, when);
          ko.frequency.exponentialRampToValueAtTime(46, when + 0.16);
          kg.gain.setValueAtTime(0.0001, when);
          kg.gain.exponentialRampToValueAtTime(0.32, when + 0.01);
          kg.gain.exponentialRampToValueAtTime(0.0001, when + 0.28);
          ko.connect(kg); kg.connect(master);
          ko.start(when); ko.stop(when + 0.3);
        }
        if (beat % 2 === 1) {
          var noise = noiseBuffer(ac, 0.06);
          var ns = ac.createBufferSource(); ns.buffer = noise;
          var hp = ac.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 6000;
          var ng = ac.createGain(); ng.gain.value = 0.06;
          ns.connect(hp); hp.connect(ng); ng.connect(master);
          ns.start(when);
        }
        // 베이스
        if (beat === 0 || beat === 3 || beat === 6) {
          var bo = ac.createOscillator(), bg = ac.createGain();
          bo.type = 'sawtooth';
          bo.frequency.value = midi(chord[0] - 24);
          bg.gain.setValueAtTime(0.0001, when);
          bg.gain.exponentialRampToValueAtTime(0.09, when + 0.03);
          bg.gain.exponentialRampToValueAtTime(0.0001, when + stepDur * 3);
          var lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 700;
          bo.connect(lp); lp.connect(bg); bg.connect(master);
          bo.start(when); bo.stop(when + stepDur * 3.2);
        }
      }
    }

    state.timer = setInterval(function () {
      var ahead = ac.currentTime + 0.35;
      while (state.next < ahead) {
        scheduleStep(state.step, state.next);
        state.step++;
        state.next += stepDur;
      }
    }, 60);
    return state;
  }

  function midi(m) { return 440 * Math.pow(2, (m - 69) / 12); }

  var _noiseCache = {};
  function noiseBuffer(ac, dur) {
    var key = Math.round(dur * 1000) + ':' + ac.sampleRate;
    if (_noiseCache[key]) return _noiseCache[key];
    var len = Math.floor(ac.sampleRate * dur);
    var buf = ac.createBuffer(1, len, ac.sampleRate);
    var d = buf.getChannelData(0);
    for (var i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    _noiseCache[key] = buf;
    return buf;
  }

  function impulse(ac, dur, decay) {
    var len = Math.floor(ac.sampleRate * dur);
    var buf = ac.createBuffer(2, len, ac.sampleRate);
    for (var c = 0; c < 2; c++) {
      var d = buf.getChannelData(c);
      for (var i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
    }
    return buf;
  }

  function stopAudio() {
    if (!audioState) { if (AC) { try { AC.close(); } catch (e) {} AC = null; } return; }
    clearInterval(audioState.timer);
    try { audioState.ac.close(); } catch (e) { /* 무시 */ }
    audioState = null; AC = null;
  }

  /* ---------- 녹화 ---------- */
  function pickMime() {
    var list = ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm', 'video/mp4'];
    for (var i = 0; i < list.length; i++) {
      if (window.MediaRecorder && MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(list[i])) return list[i];
    }
    return '';
  }

  var recording = false;
  function record() {
    var sh = S.shorts;
    if (!sh) { CS.toast(t('emptyTopic')); return; }
    if (!canvas.captureStream || !window.MediaRecorder) { CS.toast(t('noVideo')); return; }
    if (recording) { return; }
    stopPlay();
    var input = readInput();
    recording = true;
    var btn = $('cs-record');
    var note = $('cs-rec-note');
    if (btn) { btn.disabled = true; btn.textContent = t('recordNow'); }

    var vStream = canvas.captureStream(30);
    var audio = startAudio(input, true);
    var tracks = vStream.getVideoTracks().slice();
    if (audio && audio.dest) tracks = tracks.concat(audio.dest.stream.getAudioTracks());
    var stream = new MediaStream(tracks);
    var mime = pickMime();
    var rec;
    try { rec = new MediaRecorder(stream, mime ? { mimeType: mime, videoBitsPerSecond: 4500000, audioBitsPerSecond: 128000 } : undefined); }
    catch (e) { rec = new MediaRecorder(stream); }

    var chunks = [];
    rec.ondataavailable = function (e) { if (e.data && e.data.size) chunks.push(e.data); };
    rec.onstop = function () {
      recording = false;
      stopAudio();
      var blob = new Blob(chunks, { type: mime || 'video/webm' });
      S.videoBlob = blob;
      CS.state.videoMeta = { title: (sh.scenes[0] && sh.scenes[0].h) || input.topic, tags: [], desc: '' };
      var name = 'insight-brief-' + CS.slugify(input.topic || 'shorts') + '.webm';
      CS.download(blob, name);
      if (note) { note.hidden = false; note.textContent = t('recordDone') + ' · ' + Math.round(blob.size / 1024) + ' KB · ' + total.toFixed(1) + t('seconds'); }
      if (btn) { btn.disabled = false; btn.textContent = t('record'); }
      CS.toast(t('recordDone'));
      if (CS.oauth) CS.oauth.prepareShorts(sh, input);
    };

    var total = totalDuration(sh.scenes);
    var start = performance.now();
    rec.start(250);

    function frame(now) {
      if (!recording) return;
      var sec = (now - start) / 1000;
      var at = sceneAt(sh.scenes, Math.min(sec, total - 0.01));
      draw(at.scene, at.local / at.scene.d, at.idx, sh.scenes.length, input);
      if (note) { note.hidden = false; note.textContent = t('recording', { p: Math.min(99, Math.round(sec / total * 100)) }); }
      requestAnimationFrame(frame);
    }
    // 첫 프레임을 먼저 그려 스트림이 빈 화면으로 시작하지 않게 합니다.
    draw(sh.scenes[0], 0, 0, sh.scenes.length, input);
    setTimeout(function () { draw(sh.scenes[0], 0, 0, sh.scenes.length, input); requestAnimationFrame(frame); }, 120);

    setTimeout(function () {
      try { rec.stop(); } catch (e) { /* 무시 */ }
      stream.getTracks().forEach(function (tr) { try { tr.stop(); } catch (e) {} });
    }, Math.round(total * 1000) + 260);
  }

  /* ---------- SRT ---------- */
  function pad(n, w) { n = String(n); while (n.length < (w || 2)) n = '0' + n; return n; }
  function srtTime(sec) {
    var ms = Math.round(sec * 1000);
    var h = Math.floor(ms / 3600000); ms -= h * 3600000;
    var m = Math.floor(ms / 60000); ms -= m * 60000;
    var s = Math.floor(ms / 1000); ms -= s * 1000;
    return pad(h) + ':' + pad(m) + ':' + pad(s) + ',' + pad(ms, 3);
  }

  function buildSrt(scenes) {
    var out = [], acc = 0;
    scenes.forEach(function (s, i) {
      var from = acc, to = acc + s.d - 0.06;
      acc += s.d;
      var text = [s.h, s.c].filter(Boolean).join('\n');
      out.push((i + 1) + '\n' + srtTime(from) + ' --> ' + srtTime(to) + '\n' + text + '\n');
    });
    return out.join('\n');
  }

  /* ---------- 생성 실행 ---------- */
  function generate() {
    var input = readInput();
    if (!input.topic && !input.script) { CS.toast(t('emptyTopic')); if ($('cs-topic')) $('cs-topic').focus(); return; }
    var built = buildScenes(input);
    if (!built) { CS.toast(t('emptyTopic')); return; }
    S.shorts = { scenes: built.scenes, kw: built.kw, input: input };
    sizeCanvas(input.ratio);
    draw(built.scenes[0], 0, 0, built.scenes.length, input);
    var total = totalDuration(built.scenes);
    if ($('cs-summary')) $('cs-summary').innerHTML = esc(built.kw) + ' · ' + built.scenes.length + ' ' + t('scenes') + ' · ' + total.toFixed(1) + t('seconds');
    if ($('cs-buttons')) $('cs-buttons').hidden = false;
    if ($('cs-srt')) $('cs-srt').value = buildSrt(built.scenes);
    if ($('cs-srtbox')) $('cs-srtbox').hidden = false;
    if (CS.oauth) CS.oauth.prepareShorts(S.shorts, input);
    CS.toast(t('shortsDone'));
  }

  if ($('cs-gen')) $('cs-gen').addEventListener('click', generate);
  if ($('cs-play')) $('cs-play').addEventListener('click', function () { playing ? stopPlay() : play(); });
  if ($('cs-record')) $('cs-record').addEventListener('click', record);
  if ($('cs-tts')) $('cs-tts').addEventListener('click', function () {
    if (!S.shorts) { CS.toast(t('emptyTopic')); return; }
    speakScenes(S.shorts.scenes, readInput());
  });
  if ($('cs-dl-srt')) $('cs-dl-srt').addEventListener('click', function () {
    if (!S.shorts) { CS.toast(t('emptyTopic')); return; }
    var srt = buildSrt(S.shorts.scenes);
    CS.download(new Blob([srt], { type: 'text/plain;charset=utf-8' }), 'insight-brief-' + CS.slugify(S.shorts.kw || 'shorts') + '.srt');
    CS.toast(t('downloading'));
  });
  ['cs-ratio', 'cs-theme'].forEach(function (id) {
    var el = $(id);
    if (el) el.addEventListener('change', function () {
      var input = readInput();
      if (canvas) sizeCanvas(input.ratio);
      if (S.shorts) draw(S.shorts.scenes[0], 0, 0, S.shorts.scenes.length, input);
      else draw({ h: 'INSIGHT BRIEF', c: '', d: 3 }, 0, 0, 1, input);
    });
  });
  if ($('cs-mark') && S.shorts) { /* 표시만 바뀌므로 재생 시 반영 */ }

  CS.shortsGenerate = generate;
  CS.shortsBuild = buildSrt;

  /* 첫 화면: 빈 캔버스 대신 안내 카드 */
  (function firstPaint() {
    if (!ctx) return;
    var input = readInput();
    sizeCanvas(input.ratio);
    draw({ h: 'INSIGHT BRIEF', c: t('emptyTopic'), d: 3 }, 0, 0, 1, input);
  })();

  window.IB_CS.stopAll = function () { stopPlay(); speakStop(); stopAudio(); };
})();
