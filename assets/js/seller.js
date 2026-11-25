/* =========================================================
   INSIGHT BRIEF — 셀러·마케터 무료툴 4종 (seller.html)
   ① 썸네일·배지  ② 860px 상세페이지·카드뉴스
   ③ SEO 분석     ④ QR·UTM·모바일 명함
   모든 처리는 브라우저 안에서만 합니다. 서버 전송 없음.
   ========================================================= */
(function () {
  'use strict';

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  var FONT_SANS = '"Pretendard Variable", Pretendard, "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", sans-serif';
  var FONT_SERIF = '"Noto Serif KR", "Nanum Myeongjo", serif';
  var FONT_MONO = 'ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace';

  var S = {
    tab: 'thumb',
    th: {
      preset: '1000', fit: 'cover', sample: 'warm', img: null, bg: '#f4f1ea', dim: 0,
      badges: { '무료배송': true }, discount: 30, bpos: 'lt', bcolor: '#b3261e',
      top: { text: '샘플 상품 · 신상품', size: 56, color: '#ffffff', stroke: true, strip: true, strokeColor: '#15171a', stripColor: '#b3261e' },
      bot: { text: '오늘만 이 가격 · 무료배송', size: 40, color: '#ffffff', stroke: false, strip: true, strokeColor: '#15171a', stripColor: '#15171a' }
    },
    dt: { mode: 'v', blocks: [], seq: 0 },
    qr: { type: 'url', sub: 'qr' }
  };

  /* ---------- 공통 유틸 ---------- */
  var toastTimer = null;
  function toast(msg) {
    var t = $('#sl-toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('is-on'); }, 2100);
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function copyText(txt) {
    function fallback() {
      var ta = document.createElement('textarea');
      ta.value = txt;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.top = '-1000px';
      document.body.appendChild(ta);
      ta.select();
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
      document.body.removeChild(ta);
      toast(ok ? '복사했습니다.' : '복사가 막혔습니다. 직접 선택해 주세요.');
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(txt).then(function () { toast('복사했습니다.'); }, fallback);
    } else {
      fallback();
    }
  }

  function downloadCanvas(canvas, filename, done) {
    try {
      canvas.toBlob(function (blob) {
        if (!blob) { toast('이미지를 만들지 못했습니다. 잠시 뒤 다시 시도해 주세요.'); return; }
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(function () { URL.revokeObjectURL(url); }, 5000);
        if (done) done(blob.size);
      }, 'image/png');
    } catch (e) {
      toast('이미지 저장에 실패했습니다. 다른 브라우저에서 시도해 주세요.');
    }
  }

  function setFont(ctx, weight, size, family) {
    ctx.font = weight + ' ' + Math.round(size) + 'px ' + family;
  }

  /* 긴 문구를 폭에 맞춰 줄입니다. (최소 50%까지) */
  function fitSize(ctx, text, maxW, size, weight, family) {
    var s = size;
    setFont(ctx, weight, s, family);
    var floor = Math.max(10, size * 0.5);
    while (s > floor && ctx.measureText(text).width > maxW) {
      s -= 2;
      setFont(ctx, weight, s, family);
    }
    return s;
  }

  function fitSizeMin(ctx, text, maxW, size, weight, family, min) {
    var s = size;
    setFont(ctx, weight, s, family);
    while (s > min && ctx.measureText(text).width > maxW) {
      s -= 2;
      setFont(ctx, weight, s, family);
    }
    return s;
  }

  /* 문자 단위 줄바꿈 (한글·영문 혼용) */
  function wrapLines(ctx, text, maxW) {
    var out = [];
    String(text == null ? '' : text).split('\n').forEach(function (para) {
      if (!para) { out.push(''); return; }
      var line = '';
      for (var i = 0; i < para.length; i++) {
        var test = line + para[i];
        if (ctx.measureText(test).width > maxW && line) { out.push(line); line = para[i]; }
        else { line = test; }
      }
      out.push(line);
    });
    return out;
  }

  function roundRect(ctx, x, y, w, h, r) {
    var rr = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.lineTo(x + w - rr, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + rr);
    ctx.lineTo(x + w, y + h - rr);
    ctx.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
    ctx.lineTo(x + rr, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - rr);
    ctx.lineTo(x, y + rr);
    ctx.quadraticCurveTo(x, y, x + rr, y);
    ctx.closePath();
  }

  function hexA(hex, alpha) {
    var h = String(hex || '#000000').replace('#', '');
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    var n = parseInt(h, 16);
    if (isNaN(n)) return 'rgba(0,0,0,' + alpha + ')';
    return 'rgba(' + ((n >> 16) & 255) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + alpha + ')';
  }

  function bytesOf(str) {
    if (window.TextEncoder) return new TextEncoder().encode(str).length;
    return unescape(encodeURIComponent(str)).length;
  }

  /* =========================================================
     탭
     ========================================================= */
  var TAB_NAMES = ['thumb', 'detail', 'seo', 'qr'];

  function activateTab(name, focus) {
    if (TAB_NAMES.indexOf(name) < 0) name = 'thumb';
    S.tab = name;
    $$('.sl-tabs [role="tab"]').forEach(function (btn) {
      var on = btn.getAttribute('data-tab') === name;
      btn.setAttribute('aria-selected', on ? 'true' : 'false');
      btn.tabIndex = on ? 0 : -1;
      if (on && focus) btn.focus();
    });
    $$('.sl-panel').forEach(function (panel) {
      panel.hidden = panel.getAttribute('data-panel') !== name;
    });
    if (name === 'thumb') drawThumb();
    if (name === 'detail') renderDetail();
    if (name === 'seo') renderSeo();
    if (name === 'qr') { renderQr(); drawCard(); }
    try { history.replaceState(null, '', '#' + name); } catch (e) { /* 무시 */ }
  }

  $$('.sl-tabs [role="tab"]').forEach(function (btn) {
    btn.addEventListener('click', function () { activateTab(btn.getAttribute('data-tab')); });
    btn.addEventListener('keydown', function (e) {
      var idx = TAB_NAMES.indexOf(btn.getAttribute('data-tab'));
      if (e.key === 'ArrowRight') { e.preventDefault(); activateTab(TAB_NAMES[(idx + 1) % 4], true); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); activateTab(TAB_NAMES[(idx + 3) % 4], true); }
      if (e.key === 'Home') { e.preventDefault(); activateTab(TAB_NAMES[0], true); }
      if (e.key === 'End') { e.preventDefault(); activateTab(TAB_NAMES[3], true); }
    });
  });

  /* =========================================================
     ① 썸네일 · 배지
     ========================================================= */
  var TH_PRESET = { '1000': [1000, 1000], '800': [800, 800], '1200x628': [1200, 628] };
  var TH_BADGES = ['무료배송', '오늘출고', '특가', '단독', '1+1'];

  function thCanvas() { return $('#th-canvas'); }

  function drawSampleBg(ctx, W, H, kind) {
    var g;
    if (kind === 'navy') {
      g = ctx.createLinearGradient(0, 0, W, H);
      g.addColorStop(0, '#1d2939'); g.addColorStop(0.55, '#16202f'); g.addColorStop(1, '#0d1420');
    } else if (kind === 'mint') {
      g = ctx.createLinearGradient(0, 0, W, H);
      g.addColorStop(0, '#eef7f2'); g.addColorStop(1, '#c9e3d8');
    } else if (kind === 'paper') {
      g = ctx.createLinearGradient(0, 0, W, H);
      g.addColorStop(0, '#fbf9f4'); g.addColorStop(1, '#efeade');
    } else {
      g = ctx.createLinearGradient(0, 0, W, H);
      g.addColorStop(0, '#f8f2e6'); g.addColorStop(1, '#e0d3bd');
    }
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    if (kind === 'paper') {
      ctx.strokeStyle = 'rgba(120,110,90,.10)';
      ctx.lineWidth = Math.max(1, W / 1000);
      var step = W / 22;
      for (var x = step; x < W; x += step) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }
      for (var y = step; y < H; y += step) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }
    }

    /* 부드러운 원형 하이라이트 */
    var cg = ctx.createRadialGradient(W * 0.28, H * 0.18, W * 0.02, W * 0.28, H * 0.18, W * 0.75);
    cg.addColorStop(0, kind === 'navy' ? 'rgba(120,160,220,.30)' : 'rgba(255,255,255,.55)');
    cg.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = cg;
    ctx.fillRect(0, 0, W, H);

    /* 샘플 상품 실루엣 */
    var cx = W * 0.5;
    var bw = Math.min(W * 0.5, H * 0.62);
    var bh = bw * 1.02;
    var bx = cx - bw / 2;
    var by = H * 0.62 - bh / 2;
    ctx.save();
    ctx.fillStyle = 'rgba(20,24,32,.16)';
    ctx.beginPath();
    ctx.ellipse(cx, by + bh + H * 0.035, bw * 0.46, H * 0.028, 0, 0, Math.PI * 2);
    ctx.fill();

    var pg = ctx.createLinearGradient(bx, by, bx + bw, by + bh);
    if (kind === 'navy') { pg.addColorStop(0, '#f4f7fb'); pg.addColorStop(1, '#c9d4e2'); }
    else if (kind === 'mint') { pg.addColorStop(0, '#ffffff'); pg.addColorStop(1, '#d8ede2'); }
    else { pg.addColorStop(0, '#ffffff'); pg.addColorStop(1, '#e8e0cf'); }
    ctx.fillStyle = pg;
    roundRect(ctx, bx, by, bw, bh, bw * 0.08);
    ctx.fill();

    ctx.strokeStyle = 'rgba(21,23,26,.12)';
    ctx.lineWidth = Math.max(1.5, W * 0.0025);
    ctx.stroke();

    /* 라벨 띠 */
    ctx.fillStyle = kind === 'navy' ? 'rgba(22,32,47,.10)' : 'rgba(21,23,26,.07)';
    roundRect(ctx, bx + bw * 0.12, by + bh * 0.30, bw * 0.76, bh * 0.11, bw * 0.02);
    ctx.fill();
    roundRect(ctx, bx + bw * 0.12, by + bh * 0.48, bw * 0.52, bh * 0.055, bw * 0.02);
    ctx.fill();

    ctx.fillStyle = kind === 'navy' ? 'rgba(255,255,255,.62)' : 'rgba(21,23,26,.42)';
    setFont(ctx, '800', Math.max(12, W * 0.026), FONT_SANS);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('샘플 상품', cx, by + bh * 0.36);
    ctx.restore();
  }

  function drawImageFit(ctx, img, x, y, w, h, mode) {
    var iw = img.naturalWidth || img.width;
    var ih = img.naturalHeight || img.height;
    if (!iw || !ih) return;
    var scale = mode === 'contain' ? Math.min(w / iw, h / ih) : Math.max(w / iw, h / ih);
    var dw = iw * scale, dh = ih * scale;
    ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
  }

  function drawPromoTop(ctx, W, pad, o, alpha) {
    var text = (o.text || '').trim();
    if (!text) return 0;
    var size = Math.round(o.size * (W / 1000));
    size = fitSizeMin(ctx, text, W - pad * 2, size, '900', FONT_SANS, Math.max(14, size * 0.5));
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round';
    ctx.miterLimit = 2;
    if (o.strip) {
      var rh = Math.round(size * 2.12);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = o.stripColor;
      ctx.fillRect(0, 0, W, rh);
      ctx.restore();
      if (o.stroke) {
        ctx.lineWidth = Math.max(2, size * 0.085);
        ctx.strokeStyle = o.strokeColor;
        ctx.strokeText(text, W / 2, rh / 2 + size * 0.02);
      }
      ctx.fillStyle = o.color;
      ctx.fillText(text, W / 2, rh / 2 + size * 0.02);
      return rh;
    }
    var by = Math.round(pad + size * 0.95);
    if (o.stroke) {
      ctx.lineWidth = Math.max(2, size * 0.09);
      ctx.strokeStyle = o.strokeColor;
      ctx.strokeText(text, W / 2, by);
    }
    ctx.fillStyle = o.color;
    ctx.fillText(text, W / 2, by);
    return Math.round(pad + size * 1.3);
  }

  function drawPromoBottom(ctx, W, H, pad, o, alpha) {
    var text = (o.text || '').trim();
    if (!text) return 0;
    var size = Math.round(o.size * (W / 1000));
    size = fitSizeMin(ctx, text, W - pad * 2, size, '900', FONT_SANS, Math.max(12, size * 0.5));
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round';
    if (o.strip) {
      var rh = Math.round(size * 2.02);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = o.stripColor;
      ctx.fillRect(0, H - rh, W, rh);
      ctx.restore();
      if (o.stroke) {
        ctx.lineWidth = Math.max(2, size * 0.08);
        ctx.strokeStyle = o.strokeColor;
        ctx.strokeText(text, W / 2, H - rh / 2 + size * 0.02);
      }
      ctx.fillStyle = o.color;
      ctx.fillText(text, W / 2, H - rh / 2 + size * 0.02);
      return rh;
    }
    var by = Math.round(H - pad - size * 0.35);
    if (o.stroke) {
      ctx.lineWidth = Math.max(2, size * 0.09);
      ctx.strokeStyle = o.strokeColor;
      ctx.strokeText(text, W / 2, by);
    }
    ctx.fillStyle = o.color;
    ctx.fillText(text, W / 2, by);
    return Math.round(size * 1.2);
  }

  function drawThumb() {
    var c = thCanvas();
    if (!c) return;
    var W = c.width, H = c.height;
    var ctx = c.getContext('2d');
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = S.th.bg;
    ctx.fillRect(0, 0, W, H);

    if (S.th.img) {
      drawImageFit(ctx, S.th.img, 0, 0, W, H, S.th.fit);
    } else {
      drawSampleBg(ctx, W, H, S.th.sample);
    }

    if (S.th.dim > 0) {
      ctx.fillStyle = 'rgba(0,0,0,' + (S.th.dim / 100) + ')';
      ctx.fillRect(0, 0, W, H);
    }

    var pad = Math.round(W * 0.045);
    var topH = drawPromoTop(ctx, W, pad, S.th.top, 0.78);
    drawPromoBottom(ctx, W, H, pad, S.th.bot, 0.88);

    /* 배지 */
    var items = TH_BADGES.filter(function (b) { return !!S.th.badges[b]; });
    if (S.th.badges.discount) items.push('discount');
    if (items.length) {
      var fs = Math.max(12, Math.round(W * 0.034));
      var pillH = Math.round(fs * 1.8);
      var gap = Math.round(fs * 0.42);
      var labels = items.map(function (b) {
        return b === 'discount' ? Math.round(S.th.discount) + '% 할인' : b;
      });
      setFont(ctx, '800', fs, FONT_SANS);
      var maxW = 0;
      labels.forEach(function (t) { maxW = Math.max(maxW, ctx.measureText(t).width); });
      var pillMax = maxW + fs * 1.5;
      var x = S.th.bpos === 'rt' ? W - pad - pillMax : pad;
      var y = topH ? topH + Math.round(pad * 0.5) : pad;

      labels.forEach(function (label, i) {
        setFont(ctx, '800', fs, FONT_SANS);
        var tw = ctx.measureText(label).width;
        var w = Math.round(tw + fs * 1.5);
        var px = S.th.bpos === 'rt' ? W - pad - w : pad;
        var py = y + i * (pillH + gap);
        ctx.save();
        ctx.shadowColor = 'rgba(10,12,16,.30)';
        ctx.shadowBlur = fs * 0.5;
        ctx.shadowOffsetY = fs * 0.12;
        ctx.fillStyle = S.th.bcolor;
        roundRect(ctx, px, py, w, pillH, pillH / 2);
        ctx.fill();
        ctx.restore();
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, px + w / 2, py + pillH / 2 + fs * 0.02);
      });
    }

    var pv = $('#th-pv-size');
    if (pv) pv.textContent = W + ' × ' + H;
  }

  function thPresetSize() {
    var p = TH_PRESET[S.th.preset] || TH_PRESET['1000'];
    return p;
  }

  function setThCanvasSize() {
    var c = thCanvas();
    var p = thPresetSize();
    if (c.width !== p[0] || c.height !== p[1]) { c.width = p[0]; c.height = p[1]; }
  }

  /* --- 썸네일 컨트롤 --- */
  $$('[data-th-preset]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      S.th.preset = btn.getAttribute('data-th-preset');
      $$('[data-th-preset]').forEach(function (b) { b.setAttribute('aria-pressed', b === btn ? 'true' : 'false'); });
      setThCanvasSize();
      drawThumb();
    });
  });

  $$('[data-th-fit]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      S.th.fit = btn.getAttribute('data-th-fit');
      $$('[data-th-fit]').forEach(function (b) { b.setAttribute('aria-pressed', b === btn ? 'true' : 'false'); });
      drawThumb();
    });
  });

  $$('[data-th-sample]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      S.th.sample = btn.getAttribute('data-th-sample');
      $$('[data-th-sample]').forEach(function (b) { b.setAttribute('aria-pressed', b === btn ? 'true' : 'false'); });
      drawThumb();
    });
  });

  $$('[data-th-badge]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var key = btn.getAttribute('data-th-badge');
      var on = btn.getAttribute('aria-pressed') !== 'true';
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
      S.th.badges[key] = on;
      drawThumb();
    });
  });

  $$('[data-th-bpos]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      S.th.bpos = btn.getAttribute('data-th-bpos');
      $$('[data-th-bpos]').forEach(function (b) { b.setAttribute('aria-pressed', b === btn ? 'true' : 'false'); });
      drawThumb();
    });
  });

  /* on/off 세그먼트 → boolean */
  function bindSeg(group, key, obj) {
    $$('[data-' + group + ']').forEach(function (btn) {
      btn.addEventListener('click', function () {
        obj[key] = btn.getAttribute('data-' + group) === 'on';
        $$('[data-' + group + ']').forEach(function (b) { b.setAttribute('aria-pressed', b === btn ? 'true' : 'false'); });
        drawThumb();
      });
    });
  }
  bindSeg('th-top-stroke', 'stroke', S.th.top);
  bindSeg('th-top-strip', 'strip', S.th.top);
  bindSeg('th-bot-stroke', 'stroke', S.th.bot);
  bindSeg('th-bot-strip', 'strip', S.th.bot);

  function bindColor(sel, obj, key) {
    var el = $(sel);
    if (!el) return;
    el.addEventListener('input', function () { obj[key] = el.value; drawThumb(); });
  }
  bindColor('#th-bg', S.th, 'bg');
  bindColor('#th-bcolor', S.th, 'bcolor');
  bindColor('#th-top-color', S.th.top, 'color');
  bindColor('#th-top-stroke-color', S.th.top, 'strokeColor');
  bindColor('#th-top-strip-color', S.th.top, 'stripColor');
  bindColor('#th-bot-color', S.th.bot, 'color');
  bindColor('#th-bot-stroke-color', S.th.bot, 'strokeColor');
  bindColor('#th-bot-strip-color', S.th.bot, 'stripColor');

  function bindRange(sel, outSel, obj, key) {
    var el = $(sel), out = $(outSel);
    if (!el) return;
    el.addEventListener('input', function () {
      var v = Number(el.value);
      obj[key] = v;
      if (out) out.textContent = v;
      drawThumb();
    });
  }
  bindRange('#th-dim', '#th-dim-out', S.th, 'dim');
  bindRange('#th-top-size', '#th-top-size-out', S.th.top, 'size');
  bindRange('#th-bot-size', '#th-bot-size-out', S.th.bot, 'size');

  var thTop = $('#th-top'), thBot = $('#th-bot'), thDiscount = $('#th-discount');
  if (thTop) thTop.addEventListener('input', function () { S.th.top.text = thTop.value; drawThumb(); });
  if (thBot) thBot.addEventListener('input', function () { S.th.bot.text = thBot.value; drawThumb(); });
  if (thDiscount) thDiscount.addEventListener('input', function () {
    var v = Math.max(1, Math.min(99, Number(thDiscount.value) || 1));
    S.th.discount = v;
    if (!S.th.badges.discount) {
      S.th.badges.discount = true;
      var chip = $('[data-th-badge="discount"]');
      if (chip) chip.setAttribute('aria-pressed', 'true');
    }
    drawThumb();
  });

  var thFile = $('#th-file');
  if (thFile) thFile.addEventListener('change', function () {
    var f = thFile.files && thFile.files[0];
    if (!f) return;
    if (!/^image\//.test(f.type)) { toast('이미지 파일만 올릴 수 있습니다.'); return; }
    var fr = new FileReader();
    fr.onload = function () {
      var img = new Image();
      img.onload = function () { S.th.img = img; drawThumb(); toast('사진을 올렸습니다. 맞춤 방식과 문구를 조정해 보세요.'); };
      img.onerror = function () { toast('이미지를 읽지 못했습니다. 다른 파일로 시도해 주세요.'); };
      img.src = fr.result;
    };
    fr.onerror = function () { toast('파일을 읽지 못했습니다.'); };
    fr.readAsDataURL(f);
  });

  var thClear = $('#th-file-clear');
  if (thClear) thClear.addEventListener('click', function () {
    S.th.img = null;
    if (thFile) thFile.value = '';
    drawThumb();
  });

  var thDl = $('#th-download');
  if (thDl) thDl.addEventListener('click', function () {
    var c = thCanvas();
    var name = 'sample-thumbnail-' + c.width + 'x' + c.height + '.png';
    downloadCanvas(c, name, function (size) {
      var info = $('#th-file-info');
      if (info) info.textContent = c.width + '×' + c.height + ' · ' + Math.max(1, Math.round(size / 1024)) + 'KB';
    });
  });

  /* =========================================================
     ② 상세페이지 · 카드뉴스
     ========================================================= */
  var DT_V_W = 860, DT_PAD = 60, DT_CARD = 1080;

  function newBlock(type, data) {
    S.dt.seq += 1;
    var b = { id: 'b' + S.dt.seq, type: type };
    if (data) { Object.keys(data).forEach(function (k) { b[k] = data[k]; }); }
    if (type === 'title') { b.title = b.title || ''; b.sub = b.sub || ''; }
    if (type === 'point') { b.title = b.title || ''; b.body = b.body || ''; }
    if (type === 'spec') {
      b.title = b.title || '옵션·스펙';
      b.rows = b.rows || [{ k: '용량', v: '500ml' }];
    }
    return b;
  }

  function dtBlocks() { return S.dt.blocks; }

  function measureBlock(ctx, b, W) {
    if (b.type === 'image') {
      if (S.dt.mode === 'card') return DT_CARD;
      var iw = b.img ? (b.img.naturalWidth || 1) : 1;
      var ih = b.img ? (b.img.naturalHeight || 1) : 1;
      var h = Math.round(W * (ih / iw));
      return Math.max(240, Math.min(1600, h));
    }
    if (S.dt.mode === 'card') return DT_CARD;
    var inner = W - DT_PAD * 2;
    if (b.type === 'title') {
      setFont(ctx, '900', 52, FONT_SERIF);
      var lines = wrapLines(ctx, b.title || ' ', inner);
      var hh = 56 + lines.length * 70;
      if ((b.sub || '').trim()) {
        setFont(ctx, '400', 24, FONT_SANS);
        hh += 10 + wrapLines(ctx, b.sub, inner).length * 36;
      }
      return hh + 44;
    }
    if (b.type === 'point') {
      setFont(ctx, '800', 31, FONT_SANS);
      var h2 = 44;
      if ((b.title || '').trim()) h2 += 46;
      setFont(ctx, '400', 26, FONT_SANS);
      var items = (b.body || '').split('\n').filter(function (s) { return s.trim() !== ''; });
      if (!items.length) items = [' '];
      var ih2 = 0;
      items.forEach(function (it) { ih2 += wrapLines(ctx, it, inner - 30).length * 44 + 12; });
      return h2 + ih2 + 30;
    }
    if (b.type === 'spec') {
      setFont(ctx, '800', 30, FONT_SANS);
      var h3 = 44 + (b.title ? 44 : 0) + 14;
      var rows = b.rows || [];
      h3 += 46 + rows.length * 54 + 30;
      return h3;
    }
    return 0;
  }

  function drawBlockV(ctx, b, y, W) {
    var inner = W - DT_PAD * 2;
    var x = DT_PAD;
    if (b.type === 'image') {
      var iw = b.img ? (b.img.naturalWidth || 1) : 1;
      var ih = b.img ? (b.img.naturalHeight || 1) : 1;
      var h = Math.max(240, Math.min(1600, Math.round(W * (ih / iw))));
      ctx.fillStyle = '#f2f3f5';
      ctx.fillRect(0, y, W, h);
      if (b.img) drawImageFit(ctx, b.img, 0, y, W, h, b.fit === 'contain' ? 'contain' : 'cover');
      return h;
    }
    if (b.type === 'title') {
      var yy = y + 48;
      /* 포인트 바 */
      ctx.fillStyle = '#b3261e';
      ctx.fillRect(x, yy + 8, 6, 52);
      setFont(ctx, '900', 52, FONT_SERIF);
      ctx.fillStyle = '#15171a';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      var lines = wrapLines(ctx, b.title || ' ', inner - 22);
      lines.forEach(function (line, i) {
        ctx.fillText(line, x + 22, yy + i * 70);
      });
      yy += lines.length * 70;
      if ((b.sub || '').trim()) {
        setFont(ctx, '400', 24, FONT_SANS);
        ctx.fillStyle = '#4f545b';
        wrapLines(ctx, b.sub, inner).forEach(function (line, i) {
          ctx.fillText(line, x + 22, yy + 12 + i * 36);
        });
        yy += 12 + wrapLines(ctx, b.sub, inner).length * 36;
      }
      return measureBlock(ctx, b, W);
    }
    if (b.type === 'point') {
      var hgt = measureBlock(ctx, b, W);
      ctx.fillStyle = '#f6f2ec';
      ctx.fillRect(0, y, W, hgt);
      ctx.fillStyle = '#b3261e';
      ctx.fillRect(x, y + 26, 54, 4);
      var cy = y + 44;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      if ((b.title || '').trim()) {
        setFont(ctx, '800', 31, FONT_SANS);
        ctx.fillStyle = '#15171a';
        ctx.fillText(b.title, x, cy);
        cy += 46;
      }
      var items = (b.body || '').split('\n').filter(function (s) { return s.trim() !== ''; });
      if (!items.length) items = [''];
      setFont(ctx, '400', 26, FONT_SANS);
      items.forEach(function (it) {
        ctx.fillStyle = '#b3261e';
        ctx.fillRect(x + 2, cy + 13, 9, 9);
        ctx.fillStyle = '#2e3136';
        var lines = wrapLines(ctx, it, inner - 30);
        lines.forEach(function (line, i) { ctx.fillText(line, x + 30, cy + 6 + i * 44); });
        cy += lines.length * 44 + 12;
      });
      return hgt;
    }
    if (b.type === 'spec') {
      var sh = measureBlock(ctx, b, W);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, y, W, sh);
      var sy = y + 44;
      if (b.title) {
        setFont(ctx, '800', 30, FONT_SANS);
        ctx.fillStyle = '#15171a';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(b.title, x, sy);
        sy += 44;
      }
      sy += 14;
      /* 표 */
      var c1 = x, c2 = x + inner * 0.34;
      ctx.fillStyle = '#f2f3f5';
      ctx.fillRect(x, sy, inner, 46);
      setFont(ctx, '700', 20, FONT_SANS);
      ctx.fillStyle = '#4f545b';
      ctx.textBaseline = 'middle';
      ctx.fillText('항목', c1 + 14, sy + 24);
      ctx.fillText('내용', c2 + 14, sy + 24);
      sy += 46;
      var rows = b.rows || [];
      rows.forEach(function (r, i) {
        if (i % 2 === 1) { ctx.fillStyle = '#fafafa'; ctx.fillRect(x, sy, inner, 54); }
        ctx.strokeStyle = '#e5e7eb';
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(x, sy + 54); ctx.lineTo(x + inner, sy + 54); ctx.stroke();
        setFont(ctx, '700', 21, FONT_SANS);
        ctx.fillStyle = '#2e3136';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        var kv = wrapLines(ctx, r.k || '', inner * 0.34 - 28)[0] || '';
        var vv = wrapLines(ctx, r.v || '', inner * 0.66 - 28)[0] || '';
        ctx.fillText(kv, c1 + 14, sy + 28);
        setFont(ctx, '400', 21, FONT_SANS);
        ctx.fillStyle = '#15171a';
        ctx.fillText(vv, c2 + 14, sy + 28);
        sy += 54;
      });
      ctx.strokeStyle = '#15171a';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(x, sy); ctx.lineTo(x + inner, sy); ctx.stroke();
      return sh;
    }
    return 0;
  }

  function drawCardBlock(ctx, b, index, total, W) {
    var y = 0;
    ctx.save();
    if (b.type === 'image') {
      ctx.fillStyle = '#f2f3f5';
      ctx.fillRect(0, 0, W, DT_CARD);
      if (b.img) drawImageFit(ctx, b.img, 0, 0, W, DT_CARD, 'cover');
    } else {
      ctx.fillStyle = b.type === 'point' ? '#16202f' : '#ffffff';
      ctx.fillRect(0, 0, W, DT_CARD);
      var pad = 96;
      var inner = W - pad * 2;
      var textColor = b.type === 'point' ? '#ffffff' : '#15171a';
      var subColor = b.type === 'point' ? 'rgba(255,255,255,.72)' : '#4f545b';

      if (b.type === 'title') {
        setFont(ctx, '900', 86, FONT_SERIF);
        var tl = wrapLines(ctx, b.title || ' ', inner);
        var th2 = tl.length * 112;
        var subLines = [];
        if ((b.sub || '').trim()) {
          setFont(ctx, '400', 38, FONT_SANS);
          subLines = wrapLines(ctx, b.sub, inner);
          th2 += 24 + subLines.length * 56;
        }
        var startY = Math.max(pad, (DT_CARD - th2) / 2 - 20);
        ctx.fillStyle = '#b3261e';
        ctx.fillRect(pad, startY - 40, 88, 8);
        setFont(ctx, '900', 86, FONT_SERIF);
        ctx.fillStyle = textColor;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        tl.forEach(function (line, i) { ctx.fillText(line, pad, startY + i * 112); });
        if (subLines.length) {
          setFont(ctx, '400', 38, FONT_SANS);
          ctx.fillStyle = subColor;
          subLines.forEach(function (line, i) { ctx.fillText(line, pad, startY + tl.length * 112 + 24 + i * 56); });
        }
      } else if (b.type === 'point') {
        var items2 = (b.body || '').split('\n').filter(function (s) { return s.trim() !== ''; });
        if (!items2.length) items2 = [''];
        setFont(ctx, '400', 40, FONT_SANS);
        var itemHeights = items2.map(function (it) { return wrapLines(ctx, it, inner - 52).length * 62 + 26; });
        var headingH = (b.title || '').trim() ? 96 : 0;
        var totalH = headingH + itemHeights.reduce(function (a, c) { return a + c; }, 0);
        var cy2 = Math.max(pad, (DT_CARD - totalH) / 2);
        if (headingH) {
          setFont(ctx, '800', 60, FONT_SANS);
          ctx.fillStyle = '#ffffff';
          ctx.textAlign = 'left';
          ctx.textBaseline = 'top';
          ctx.fillText(b.title, pad, cy2);
          cy2 += headingH;
        }
        items2.forEach(function (it, i) {
          ctx.fillStyle = '#e7a49b';
          ctx.fillRect(pad, cy2 + 22, 14, 14);
          setFont(ctx, '400', 40, FONT_SANS);
          ctx.fillStyle = '#ffffff';
          var lines2 = wrapLines(ctx, it, inner - 52);
          lines2.forEach(function (line, li) { ctx.fillText(line, pad + 46, cy2 + 6 + li * 62); });
          cy2 += itemHeights[i];
        });
      } else if (b.type === 'spec') {
        var rows2 = b.rows || [];
        var sH = 118 + 88 + rows2.length * 84 + 40;
        var sy2 = Math.max(pad, (DT_CARD - sH) / 2);
        setFont(ctx, '800', 58, FONT_SANS);
        ctx.fillStyle = '#15171a';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        if (b.title) { ctx.fillText(b.title, pad, sy2); }
        sy2 += 118;
        ctx.fillStyle = '#f2f3f5';
        ctx.fillRect(pad, sy2, inner, 88);
        setFont(ctx, '700', 28, FONT_SANS);
        ctx.fillStyle = '#4f545b';
        ctx.textBaseline = 'middle';
        ctx.fillText('항목', pad + 20, sy2 + 46);
        ctx.fillText('내용', pad + inner * 0.34 + 20, sy2 + 46);
        sy2 += 88;
        rows2.forEach(function (r, i) {
          if (i % 2 === 1) { ctx.fillStyle = '#fafafa'; ctx.fillRect(pad, sy2, inner, 84); }
          ctx.strokeStyle = '#e5e7eb';
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(pad, sy2 + 84); ctx.lineTo(pad + inner, sy2 + 84); ctx.stroke();
          setFont(ctx, '700', 30, FONT_SANS);
          ctx.fillStyle = '#2e3136';
          ctx.textAlign = 'left';
          ctx.textBaseline = 'middle';
          var kv2 = (wrapLines(ctx, r.k || '', inner * 0.34 - 40)[0] || '');
          setFont(ctx, '400', 30, FONT_SANS);
          ctx.fillStyle = '#15171a';
          var vv2 = (wrapLines(ctx, r.v || '', inner * 0.66 - 40)[0] || '');
          setFont(ctx, '700', 30, FONT_SANS);
          ctx.fillStyle = '#2e3136';
          ctx.fillText(kv2, pad + 20, sy2 + 44);
          setFont(ctx, '400', 30, FONT_SANS);
          ctx.fillStyle = '#15171a';
          ctx.fillText(vv2, pad + inner * 0.34 + 20, sy2 + 44);
          sy2 += 84;
        });
      }
    }
    /* 페이지 표시 */
    ctx.save();
    ctx.fillStyle = b.type === 'point' ? 'rgba(255,255,255,.55)' : 'rgba(21,23,26,.35)';
    setFont(ctx, '700', 26, FONT_MONO);
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';
    ctx.fillText(String(index + 1).padStart(2, '0') + ' / ' + String(total).padStart(2, '0'), W - 44, DT_CARD - 34);
    ctx.restore();
    ctx.restore();
  }

  function renderDetail() {
    var c = $('#dt-canvas');
    if (!c) return;
    var blocks = dtBlocks();
    var W = S.dt.mode === 'card' ? DT_CARD : DT_V_W;
    var ctx = c.getContext('2d');

    if (!blocks.length) {
      c.width = W; c.height = Math.round(W * 0.7);
      ctx = c.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, c.width, c.height);
      ctx.strokeStyle = '#e5e7eb';
      ctx.lineWidth = 2;
      ctx.setLineDash([10, 8]);
      ctx.strokeRect(24, 24, c.width - 48, c.height - 48);
      ctx.setLineDash([]);
      ctx.fillStyle = '#6f747b';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      setFont(ctx, '700', Math.round(W * 0.026), FONT_SANS);
      ctx.fillText('블록을 추가하면 여기에 조합됩니다', c.width / 2, c.height / 2 - 20);
      setFont(ctx, '400', Math.round(W * 0.019), FONT_SANS);
      ctx.fillText('상품 이미지를 올리거나 샘플 구성을 불러와 보세요', c.width / 2, c.height / 2 + 26);
      var pv0 = $('#dt-pv-size');
      if (pv0) pv0.textContent = W + ' × –';
      return;
    }

    /* 1) 높이 계산 */
    var heights = [];
    var total = 0;
    var measureCtx = document.createElement('canvas').getContext('2d');
    blocks.forEach(function (b) {
      var h = measureBlock(measureCtx, b, W);
      heights.push(h);
      total += h;
    });

    var MAXH = 32000;
    if (total > MAXH) {
      if (!renderDetail._warned) {
        renderDetail._warned = true;
        toast('이미지가 너무 깁니다. 블록을 줄이거나 나눠서 저장해 주세요.');
      }
      total = MAXH;
    } else {
      renderDetail._warned = false;
    }

    c.width = W;
    c.height = Math.max(200, Math.round(total));
    ctx = c.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, c.width, c.height);

    /* 2) 그리기 */
    var y = 0;
    blocks.forEach(function (b, i) {
      if (y >= c.height) return;
      if (S.dt.mode === 'card') {
        ctx.save();
        ctx.translate(0, i * DT_CARD);
        drawCardBlock(ctx, b, i, blocks.length, W);
        ctx.restore();
        y += DT_CARD;
      } else {
        y += drawBlockV(ctx, b, y, W);
        if (y > c.height) {
          /* 넘친 부분은 잘라 낸다 */
          ctx.clearRect(0, c.height, W, 1);
        }
      }
    });

    var pv = $('#dt-pv-size');
    if (pv) pv.textContent = W + ' × ' + c.height;
    var cnt = $('#dt-count');
    if (cnt) cnt.textContent = blocks.length + '개';
    var empty = $('#dt-empty');
    if (empty) empty.hidden = blocks.length > 0;
    var info = $('#dt-file-info');
    if (info) info.textContent = '–';
  }

  var dtTimer = null;
  function scheduleDetail() {
    clearTimeout(dtTimer);
    dtTimer = setTimeout(renderDetail, 180);
  }

  /* --- 블록 목록 UI --- */
  function blockSummary(b) {
    if (b.type === 'image') return b.name || '상품 이미지';
    if (b.type === 'title') return b.title || '제목 없음';
    if (b.type === 'point') {
      var items = (b.body || '').split('\n').filter(function (s) { return s.trim(); });
      return (b.title || '강조 포인트') + ' · ' + items.length + '줄';
    }
    if (b.type === 'spec') return (b.title || '스펙') + ' · ' + (b.rows || []).length + '행';
    return b.type;
  }

  function renderBlockList() {
    var wrap = $('#dt-blocks');
    if (!wrap) return;
    var blocks = dtBlocks();
    wrap.innerHTML = '';
    blocks.forEach(function (b, i) {
      var el = document.createElement('div');
      el.className = 'sl-block';
      el.setAttribute('data-i', String(i));

      var body = '';
      if (b.type === 'image') {
        body =
          '<div style="display:flex;gap:10px;align-items:center">' +
          (b.src ? '<img class="sl-block-img" alt="업로드한 이미지" src="' + b.src + '">' : '') +
          '<div class="sl-field" style="flex:1 1 auto"><div class="lbl"><span>맞춤</span><span class="hint">세로 모드</span></div>' +
          '<div class="sl-seg small" role="group" aria-label="이미지 맞춤">' +
          '<button type="button" data-act="fit" data-fit="cover" aria-pressed="' + (b.fit !== 'contain') + '">커버</button>' +
          '<button type="button" data-act="fit" data-fit="contain" aria-pressed="' + (b.fit === 'contain') + '">컨테인</button>' +
          '</div></div></div>';
      } else if (b.type === 'title') {
        body =
          '<div class="sl-field"><div class="lbl"><span>제목</span><span class="hint">줄바꿈 가능</span></div>' +
          '<input type="text" data-f="title" value="' + esc(b.title) + '" placeholder="예: 샘플 상품 500ml" autocomplete="off"></div>' +
          '<div class="sl-field"><div class="lbl"><span>부제</span><span class="hint">선택</span></div>' +
          '<input type="text" data-f="sub" value="' + esc(b.sub) + '" placeholder="예: 한 달 써 본 솔직 후기" autocomplete="off"></div>';
      } else if (b.type === 'point') {
        body =
          '<div class="sl-field"><div class="lbl"><span>소제목</span><span class="hint">선택</span></div>' +
          '<input type="text" data-f="title" value="' + esc(b.title) + '" placeholder="예: 이런 점이 달라요" autocomplete="off"></div>' +
          '<div class="sl-field"><div class="lbl"><span>내용</span><span class="hint">줄마다 항목 하나</span></div>' +
          '<textarea data-f="body" rows="4" placeholder="한 줄에 항목 하나씩 적으면 불릿으로 나뉩니다">' + esc(b.body) + '</textarea></div>';
      } else if (b.type === 'spec') {
        var rows = (b.rows || []).map(function (r, ri) {
          return '<div class="sl-spec-row">' +
            '<input type="text" data-f="k" data-row="' + ri + '" value="' + esc(r.k) + '" placeholder="항목" autocomplete="off">' +
            '<input type="text" data-f="v" data-row="' + ri + '" value="' + esc(r.v) + '" placeholder="내용" autocomplete="off">' +
            '<button type="button" data-act="delrow" data-row="' + ri + '" aria-label="행 삭제">✕</button>' +
            '</div>';
        }).join('');
        body =
          '<div class="sl-field"><div class="lbl"><span>표 제목</span></div>' +
          '<input type="text" data-f="title" value="' + esc(b.title) + '" placeholder="옵션·스펙" autocomplete="off"></div>' +
          '<div class="sl-field"><div class="lbl"><span>행</span><span class="hint">항목 / 내용</span></div>' +
          '<div class="sl-spec-rows">' + rows + '</div>' +
          '<button type="button" class="sl-btn ghost sm" data-act="addrow" style="margin-top:6px">＋ 행 추가</button></div>';
      }

      var typeLabel = { image: 'IMAGE', title: 'TITLE', point: 'POINT', spec: 'SPEC' }[b.type] || b.type;
      el.innerHTML =
        '<div class="sl-block-top">' +
        '<span class="type">' + typeLabel + '</span>' +
        '<span class="summ">' + esc(blockSummary(b)) + '</span>' +
        '<span class="acts">' +
        '<button type="button" data-act="up" aria-label="위로" ' + (i === 0 ? 'disabled' : '') + '>↑</button>' +
        '<button type="button" data-act="down" aria-label="아래로" ' + (i === blocks.length - 1 ? 'disabled' : '') + '>↓</button>' +
        '<button type="button" data-act="del" aria-label="삭제">✕</button>' +
        '</span></div>' +
        '<div class="sl-block-body" hidden>' + body + '</div>';

      /* 머리 클릭 → 본문 접기/펼치기 */
      var top = el.querySelector('.sl-block-top');
      top.addEventListener('click', function (e) {
        if (e.target.closest('button')) return;
        var bd = el.querySelector('.sl-block-body');
        bd.hidden = !bd.hidden;
      });
      /* 첫 블록은 펼쳐 둔다 */
      if (i === 0) el.querySelector('.sl-block-body').hidden = false;

      wrap.appendChild(el);
    });
  }

  function blockIndex(el) {
    var host = el.closest ? el.closest('.sl-block') : null;
    return host ? Number(host.getAttribute('data-i')) : -1;
  }

  var dtBlocksEl = $('#dt-blocks');
  if (dtBlocksEl) {
    dtBlocksEl.addEventListener('click', function (e) {
      var btn = e.target.closest('button[data-act]');
      if (!btn) return;
      var i = blockIndex(btn);
      var b = dtBlocks()[i];
      if (!b) return;
      var act = btn.getAttribute('data-act');
      if (act === 'up' && i > 0) {
        dtBlocks().splice(i - 1, 0, dtBlocks().splice(i, 1)[0]);
        renderBlockList(); renderDetail();
      } else if (act === 'down' && i < dtBlocks().length - 1) {
        dtBlocks().splice(i + 1, 0, dtBlocks().splice(i, 1)[0]);
        renderBlockList(); renderDetail();
      } else if (act === 'del') {
        dtBlocks().splice(i, 1);
        renderBlockList(); renderDetail();
      } else if (act === 'fit') {
        b.fit = btn.getAttribute('data-fit');
        renderBlockList(); renderDetail();
      } else if (act === 'addrow') {
        b.rows = b.rows || [];
        b.rows.push({ k: '', v: '' });
        renderBlockList(); renderDetail();
      } else if (act === 'delrow') {
        var ri = Number(btn.getAttribute('data-row'));
        b.rows.splice(ri, 1);
        renderBlockList(); renderDetail();
      }
    });

    dtBlocksEl.addEventListener('input', function (e) {
      var el = e.target;
      var i = blockIndex(el);
      var b = dtBlocks()[i];
      if (!b) return;
      var f = el.getAttribute('data-f');
      if (!f) return;
      if (f === 'k' || f === 'v') {
        var ri = Number(el.getAttribute('data-row'));
        if (b.rows && b.rows[ri]) b.rows[ri][f] = el.value;
      } else {
        b[f] = el.value;
      }
      /* 요약 갱신 */
      var host = el.closest('.sl-block');
      var summ = host && host.querySelector('.summ');
      if (summ) summ.textContent = blockSummary(b);
      scheduleDetail();
    });
  }

  function loadImage(src) {
    return new Promise(function (resolve, reject) {
      var img = new Image();
      img.onload = function () { resolve(img); };
      img.onerror = function () { reject(new Error('image')); };
      img.src = src;
    });
  }

  function readFile(file) {
    return new Promise(function (resolve, reject) {
      var fr = new FileReader();
      fr.onload = function () { resolve({ src: fr.result, name: file.name.replace(/\.[^.]+$/, '') }); };
      fr.onerror = function () { reject(new Error('read')); };
      fr.readAsDataURL(file);
    });
  }

  var dtFile = $('#dt-file');
  if (dtFile) dtFile.addEventListener('change', function () {
    var files = Array.prototype.slice.call(dtFile.files || []).filter(function (f) { return /^image\//.test(f.type); });
    if (!files.length) { toast('이미지 파일만 올릴 수 있습니다.'); return; }
    Promise.all(files.map(readFile)).then(function (items) {
      return Promise.all(items.map(function (it) {
        return loadImage(it.src).then(function (img) { return { src: it.src, name: it.name, img: img }; });
      }));
    }).then(function (loaded) {
      loaded.forEach(function (it) {
        S.dt.blocks.push(newBlock('image', { src: it.src, img: it.img, name: it.name, fit: 'cover' }));
      });
      renderBlockList();
      renderDetail();
      toast(loaded.length + '장의 이미지를 추가했습니다.');
    }).catch(function () {
      toast('이미지를 읽지 못했습니다. 다른 파일로 시도해 주세요.');
    });
    dtFile.value = '';
  });

  $$('[data-dt-add]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var type = btn.getAttribute('data-dt-add');
      S.dt.blocks.push(newBlock(type));
      renderBlockList();
      renderDetail();
      var list = $('#dt-blocks');
      if (list) {
        var last = list.lastElementChild;
        if (last) {
          var bd = last.querySelector('.sl-block-body');
          if (bd) bd.hidden = false;
          last.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
          var inp = last.querySelector('input,textarea');
          if (inp) inp.focus();
        }
      }
    });
  });

  $$('[data-dt-mode]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      S.dt.mode = btn.getAttribute('data-dt-mode');
      $$('[data-dt-mode]').forEach(function (b) { b.setAttribute('aria-pressed', b === btn ? 'true' : 'false'); });
      var note = $('#dt-mode-note');
      if (note) {
        note.textContent = S.dt.mode === 'card'
          ? '블록 하나가 1080×1080 정사각 카드 한 장이 됩니다. 카드 순서대로 세로로 이어 저장합니다.'
          : '블록을 이어 붙여 860px 폭의 긴 이미지 한 장으로 저장합니다.';
      }
      renderDetail();
    });
  });

  var dtClear = $('#dt-clear');
  if (dtClear) dtClear.addEventListener('click', function () {
    S.dt.blocks = [];
    renderBlockList();
    renderDetail();
  });

  var dtSample = $('#dt-sample');
  if (dtSample) dtSample.addEventListener('click', function () {
    S.dt.blocks = [];
    S.dt.seq = 0;
    var colors = [
      ['#e9dcc7', '#c9b299', '01'],
      ['#dfe7ee', '#a8bccd', '02'],
      ['#f0e7dc', '#d8c3ab', '03']
    ];
    var made = colors.map(function (col) {
      var c = document.createElement('canvas');
      c.width = 1000; c.height = 1000;
      var ctx = c.getContext('2d');
      var g = ctx.createLinearGradient(0, 0, 1000, 1000);
      g.addColorStop(0, col[0]); g.addColorStop(1, col[1]);
      ctx.fillStyle = g; ctx.fillRect(0, 0, 1000, 1000);
      ctx.fillStyle = 'rgba(255,255,255,.85)';
      roundRect(ctx, 250, 300, 500, 420, 40); ctx.fill();
      ctx.fillStyle = 'rgba(21,23,26,.18)';
      roundRect(ctx, 300, 360, 400, 40, 12); ctx.fill();
      roundRect(ctx, 300, 430, 260, 26, 10); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.9)';
      setFont(ctx, '800', 34, FONT_SANS);
      ctx.textAlign = 'center';
      ctx.fillText('샘플 상품 이미지 ' + col[2], 500, 850);
      return c.toDataURL('image/png');
    });

    Promise.all(made.map(loadImage)).then(function (imgs) {
      S.dt.blocks.push(newBlock('title', { title: '샘플 상품 500ml', sub: '매일 쓰는 만능 세정제 · 3가지 향' }));
      S.dt.blocks.push(newBlock('image', { src: made[0], img: imgs[0], name: '샘플 이미지 1', fit: 'cover' }));
      S.dt.blocks.push(newBlock('point', {
        title: '이런 점이 달라요',
        body: '식물유래 계면활성제 99%\n무향·저자극 테스트 완료\n1회 3ml, 한 달 사용'
      }));
      S.dt.blocks.push(newBlock('image', { src: made[1], img: imgs[1], name: '샘플 이미지 2', fit: 'cover' }));
      S.dt.blocks.push(newBlock('spec', {
        title: '옵션·스펙',
        rows: [
          { k: '용량', v: '500ml' },
          { k: '향', v: '무향 · 시트러스 · 라벤더' },
          { k: '구성', v: '본품 + 펌프' },
          { k: '제조국', v: '대한민국' }
        ]
      }));
      S.dt.blocks.push(newBlock('image', { src: made[2], img: imgs[2], name: '샘플 이미지 3', fit: 'cover' }));
      S.dt.blocks.push(newBlock('point', {
        title: '배송 안내',
        body: '평일 오후 2시 이전 결제 → 당일 출고\n3만원 이상 무료배송 (제주·도서산간 제외)'
      }));
      renderBlockList();
      renderDetail();
      toast('샘플 구성을 불러왔습니다. 글자와 이미지를 바꿔 보세요.');
    }).catch(function () {
      toast('샘플 이미지를 만들지 못했습니다.');
    });
  });

  var dtDl = $('#dt-download');
  if (dtDl) dtDl.addEventListener('click', function () {
    var c = $('#dt-canvas');
    if (!S.dt.blocks.length) { toast('먼저 블록을 추가해 주세요.'); return; }
    var name = (S.dt.mode === 'card' ? 'sample-cardnews-' : 'sample-detail-') + c.width + 'x' + c.height + '.png';
    downloadCanvas(c, name, function (size) {
      var info = $('#dt-file-info');
      if (info) info.textContent = Math.max(1, Math.round(size / 1024)) + 'KB · PNG';
    });
  });

  /* =========================================================
     ③ SEO 분석
     ========================================================= */
  var SEO_STOP = ['그리고', '그러나', '하지만', '그래서', '이런', '저런', '것은', '것을', '있습니다', '합니다', '하는', '에서', '으로', '에게', '까지', '부터', '보다', '만큼', '정말', '너무', '아주', '매우', '대한', '위해', '때문', '경우', '여러', '다음', '이번', '우리', '제가', '저는', '합니다', '입니다', '하는데', '있어서', '같습니다', '기준', '정도', '부분'];

  /* 한국어 조사 제거 — 해시태그 후보에서 명사만 남기기 위함 */
  var JOSA = ['으로서', '으로써', '에서는', '에게서', '이라고는', '으로는', '에서도', '에게도', '부터는', '까지는', '이라도', '이라고', '으로', '에서', '에게', '부터', '까지', '처럼', '보다', '만큼', '이라', '라고', '이나', '거나', '지만', '는데', '면서', '하며', '하고', '해서', '했다', '한다', '하는', '되는', '되어', '이며', '입니다', '합니다', '에는', '에도', '들이', '들을', '들은', '이란', '은', '는', '이', '가', '을', '를', '의', '도', '만', '와', '과', '로', '서', '며', '고', '나', '야', '요', '네', '죠', '다'].sort(function (a, b) { return b.length - a.length; });

  function stripJosa(w) {
    for (var i = 0; i < JOSA.length; i++) {
      var s = JOSA[i];
      if (w.length > s.length && w.slice(-s.length) === s) {
        var stem = w.slice(0, -s.length);
        /* 조사를 떼면 한 글자만 남는 말은 태그로 쓰지 않는다 */
        return stem.length >= 2 ? stem : '';
      }
    }
    return w;
  }

  /* 받침 유무에 따라 조사를 골라 쓴다 */
  function josa(word, withFinal, withoutFinal) {
    if (!word) return withoutFinal;
    var code = word.charCodeAt(word.length - 1);
    if (code >= 0xAC00 && code <= 0xD7A3) return ((code - 0xAC00) % 28) ? withFinal : withoutFinal;
    return withFinal;
  }

  function seoKeywords() {
    var raw = ($('#seo-kw') || {}).value || '';
    return raw.split(',').map(function (s) { return s.trim(); }).filter(function (s) { return s; }).slice(0, 5);
  }

  function countOccur(text, kw) {
    if (!kw) return 0;
    var t = text.toLowerCase(), k = kw.toLowerCase(), n = 0, from = 0;
    while (true) {
      var idx = t.indexOf(k, from);
      if (idx < 0) break;
      n += 1;
      from = idx + k.length;
    }
    return n;
  }

  function primaryKeyword() {
    var kws = seoKeywords();
    return kws.length ? kws[0] : '';
  }

  function renderSeo() {
    var titleEl = $('#seo-title'), bodyEl = $('#seo-body');
    if (!titleEl || !bodyEl) return;
    var title = titleEl.value;
    var body = bodyEl.value;
    var kws = seoKeywords();

    var chars = body.length;
    var noSpace = body.replace(/\s/g, '').length;
    var bytes = bytesOf(body);
    var paras = body.split(/\n\s*\n/).filter(function (s) { return s.trim() !== ''; }).length;
    var sentences = body.split(/[.!?。？！\n]+/).filter(function (s) { return s.trim() !== ''; }).length;
    var readMin = noSpace ? Math.max(1, Math.ceil(noSpace / 500)) : 0;

    var setTxt = function (id, txt) { var el = $(id); if (el) el.textContent = txt; };

    /* stat 요소의 <small> 구조를 유지하도록 다시 그린다 */
    var stat = function (id, val, unit) {
      var el = $(id);
      if (!el) return;
      el.innerHTML = esc(val) + '<small>' + esc(unit) + '</small>';
    };
    stat('#seo-st-chars', chars.toLocaleString(), '자');
    stat('#seo-st-nospace', noSpace.toLocaleString(), '자');
    stat('#seo-st-bytes', bytes.toLocaleString(), 'B');
    stat('#seo-st-paras', paras, '개');
    stat('#seo-st-read', readMin, '분');
    setTxt('#seo-st-sents', '문장 ' + sentences + '개');

    var titleCount = $('#seo-title-count');
    if (titleCount) titleCount.textContent = title.length + '자';

    /* 키워드 */
    var primary = kws[0] || '';
    var occ = primary ? countOccur(body, primary) : 0;
    var density = noSpace && primary ? (occ * primary.length / noSpace) * 100 : 0;
    stat('#seo-st-kwcount', occ, '회');
    setTxt('#seo-st-kwdensity', primary ? '밀도 ' + density.toFixed(2) + '%' : '타깃 키워드를 입력하세요');
    var kwCard = $('#seo-st-kwcard');
    if (kwCard) {
      kwCard.classList.remove('ok', 'warn');
      if (primary) {
        if (density > 3.5) kwCard.classList.add('warn');
        else if (density >= 0.7) kwCard.classList.add('ok');
      }
    }

    /* 키워드 표 */
    var tbody = $('#seo-kw-table tbody');
    if (tbody) {
      if (!kws.length) {
        tbody.innerHTML = '<tr><td colspan="4" style="color:var(--muted)">타깃 키워드를 입력하면 여기에 표시됩니다.</td></tr>';
      } else {
        var rows = kws.map(function (k) {
          var c = countOccur(body, k);
          var d = noSpace ? (c * k.length / noSpace) * 100 : 0;
          return { k: k, c: c, d: d };
        });
        var maxD = Math.max.apply(null, rows.map(function (r) { return r.d; })) || 1;
        tbody.innerHTML = rows.map(function (r) {
          var pct = Math.min(100, (r.d / maxD) * 100);
          return '<tr><td>' + esc(r.k) + '</td><td class="num">' + r.c + '회</td><td class="num">' + r.d.toFixed(2) + '%</td>' +
            '<td><span class="bar"><i style="width:' + pct.toFixed(1) + '%"></i></span></td></tr>';
        }).join('');
      }
    }

    /* 점검 */
    var checks = [];
    var tlen = title.trim().length;
    if (!tlen) {
      checks.push({ ok: false, text: '제목이 비어 있습니다. 검색 결과에 노출될 제목을 적어 주세요.' });
    } else if (tlen < 25) {
      checks.push({ ok: false, text: '제목이 ' + tlen + '자로 짧습니다. <b>25~40자</b>가 검색 결과에서 잘리지 않습니다.' });
    } else if (tlen > 40) {
      checks.push({ ok: false, text: '제목이 ' + tlen + '자입니다. 40자를 넘으면 모바일에서 뒤가 잘릴 수 있습니다.' });
    } else {
      checks.push({ ok: true, text: '제목 길이 ' + tlen + '자 — 25~40자 범위에 들어옵니다.' });
    }

    if (primary) {
      var head = title.slice(0, 20);
      var inHead = head.toLowerCase().indexOf(primary.toLowerCase()) >= 0;
      checks.push({
        ok: inHead,
        text: inHead
          ? '타깃 키워드 ‘' + esc(primary) + '’' + josa(primary, '이', '가') + ' 제목 앞 20자 안에 있습니다.'
          : '타깃 키워드 ‘' + esc(primary) + '’' + josa(primary, '을', '를') + ' 제목 앞쪽(20자 안)으로 옮겨 보세요.'
      });
      var inTitle = title.toLowerCase().indexOf(primary.toLowerCase()) >= 0;
      checks.push({
        ok: inTitle,
        text: inTitle ? '제목에 타깃 키워드가 들어 있습니다.' : '제목에 타깃 키워드가 없습니다. 검색어와 제목을 맞춰 주세요.'
      });
      var first100 = body.slice(0, 120);
      var inLead = first100.toLowerCase().indexOf(primary.toLowerCase()) >= 0;
      checks.push({
        ok: inLead,
        text: inLead ? '본문 첫 문단에 키워드가 나옵니다.' : '본문 첫 100자 안에 키워드를 한 번 넣어 주세요.'
      });
      var densOk = density >= 0.7 && density <= 3.5;
      checks.push({
        ok: densOk,
        text: densOk
          ? '키워드 밀도 ' + density.toFixed(2) + '% — 자연스러운 범위(0.7~3.5%)입니다.'
          : (density < 0.7
            ? '키워드 밀도 ' + density.toFixed(2) + '%로 낮습니다. 본문에 2~3회 더 자연스럽게 넣어 보세요.'
            : '키워드 밀도 ' + density.toFixed(2) + '%로 높습니다. 반복 대신 관련어로 바꿔 주세요.')
      });
    } else {
      checks.push({ ok: false, text: '타깃 키워드를 입력하면 키워드 배치·밀도 점검이 켜집니다.' });
    }

    var bodyLen = noSpace;
    checks.push({
      ok: bodyLen >= 600,
      text: bodyLen >= 600
        ? '본문 ' + bodyLen.toLocaleString() + '자 — 검색에 필요한 분량을 갖췄습니다.'
        : '본문이 ' + bodyLen.toLocaleString() + '자입니다. 600자 이상, 가능하면 1,000자 이상이 좋습니다.'
    });
    checks.push({
      ok: paras >= 2,
      text: paras >= 2
        ? '문단 ' + paras + '개로 나뉘어 있습니다.'
        : '문단이 1개입니다. 빈 줄로 2~5개 문단으로 나누면 읽기 쉬워집니다.'
    });
    checks.push({
      ok: sentences >= 4,
      text: sentences >= 4
        ? '문장 ' + sentences + '개 — 문장 단위로 끊어 읽힙니다.'
        : '문장이 ' + sentences + '개입니다. 한 문장이 너무 길지 않은지 확인하세요.'
    });

    var list = $('#seo-checks');
    if (list) {
      list.innerHTML = checks.map(function (c) {
        return '<li class="' + (c.ok ? 'ok' : 'no') + '"><span class="mk">' + (c.ok ? '✓' : '!') + '</span><span>' + c.text + '</span></li>';
      }).join('');
    }

    /* 해시태그 */
    var tags = [];
    kws.forEach(function (k) {
      var t = '#' + k.replace(/\s+/g, '');
      if (tags.indexOf(t) < 0) tags.push(t);
    });
    var freq = {};
    var kwFlat = kws.map(function (k) { return k.replace(/\s+/g, ''); });
    (body.match(/[가-힣A-Za-z]{2,}/g) || []).forEach(function (raw) {
      var w = stripJosa(raw);
      if (!w || w.length < 2 || w.length > 10) return;
      if (SEO_STOP.indexOf(w) >= 0) return;
      /* 영문 두 글자(ml 등)와 형용사 꼴은 태그로 쓰지 않는다 */
      if (/^[A-Za-z]+$/.test(w) && w.length < 3) return;
      if (/(된|하는|있는|없는|같은|스러운|로운)$/.test(w)) return;
      /* 타깃 키워드와 겹치는 조각은 태그로 쓰지 않는다 */
      for (var i = 0; i < kwFlat.length; i++) {
        if (kwFlat[i] === w || kwFlat[i].indexOf(w) >= 0 || w.indexOf(kwFlat[i]) >= 0) return;
      }
      freq[w] = (freq[w] || 0) + 1;
    });
    Object.keys(freq).filter(function (w) { return freq[w] >= 2; })
      .sort(function (a, b) { return freq[b] - freq[a] || b.length - a.length; })
      .forEach(function (w) {
        if (tags.length >= 10) return;
        var t = '#' + w;
        if (tags.indexOf(t) < 0) tags.push(t);
      });
    var tagBox = $('#seo-tags');
    if (tagBox) {
      tagBox.innerHTML = tags.length
        ? tags.map(function (t) { return '<span class="sl-chip hash">' + esc(t) + '</span>'; }).join('')
        : '<span class="sl-chip hash">본문을 입력하면 태그 후보가 나옵니다</span>';
    }

    /* 모바일 미리보기 */
    var phTitle = $('#seo-ph-title');
    if (phTitle) phTitle.textContent = title.trim() || '제목을 입력하면 여기에 보입니다';
    var desc = body.replace(/\s+/g, ' ').trim().slice(0, 90);
    var phDesc = $('#seo-ph-desc');
    if (phDesc) {
      var safe = esc(desc || '본문 첫 부분이 검색 설명으로 쓰입니다. 80자 안쪽이 잘리지 않습니다.');
      if (primary) {
        var re = new RegExp('(' + primary.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'i');
        safe = safe.replace(re, '<b>$1</b>');
      }
      phDesc.innerHTML = safe;
    }
    var phLines = $('#seo-ph-lines');
    if (phLines) {
      var flat = body.replace(/\r/g, '').trim();
      var lines = [];
      flat.split('\n').forEach(function (p) {
        p = p.trim();
        if (!p) return;
        for (var i = 0; i < p.length && lines.length < 3; i += 26) lines.push(p.slice(i, i + 26));
      });
      phLines.textContent = lines.length ? lines.slice(0, 3).join('\n') : '본문 첫 3줄이 여기에 표시됩니다.';
    }
  }

  ['#seo-title', '#seo-body', '#seo-kw'].forEach(function (sel) {
    var el = $(sel);
    if (el) el.addEventListener('input', renderSeo);
  });

  var seoExample = $('#seo-example');
  if (seoExample) seoExample.addEventListener('click', function () {
    $('#seo-title').value = '샘플 상품 500ml 후기 — 무료배송으로 산 만능 세정제 한 달 사용기';
    $('#seo-kw').value = '샘플 상품, 무료배송, 만능 세정제';
    $('#seo-body').value = [
      '샘플 상품 500ml를 무료배송으로 사서 한 달 동안 써 봤습니다. 주방과 욕실, 세탁조까지 한 병으로 해결되는지가 가장 궁금했습니다.',
      '',
      '먼저 결론부터 적으면, 만능 세정제 한 병으로 주방 기름때와 욕실 물때는 충분했습니다. 다만 화장실 곰팡이처럼 오래된 얼룩에는 따로 전용 제품이 필요했습니다.',
      '',
      '무료배송 기준은 3만 원이었고, 500ml 한 병으로는 조금 모자라 두 병을 주문했습니다. 두 병이면 한 달 반 정도 쓰는 양입니다.',
      '',
      '향은 무향을 골랐습니다. 시트러스 향도 써 봤는데, 주방에서 쓰기에는 무향이 부담이 없었습니다. 저자극 테스트를 마쳤다고 적혀 있지만 민감한 피부라면 장갑을 끼는 편이 안전합니다.',
      '',
      '정리하면 이런 분께 맞습니다. 주방과 욕실을 한 병으로 정리하고 싶은 분, 무료배송 기준을 채우기 위해 두 병을 살 계획인 분, 향이 강한 세정제가 부담스러운 분입니다.',
      '',
      '반대로 오래된 곰팡이 제거가 목적이라면 전용 제품을 함께 사는 편이 낫습니다. 배송은 평일 오후 2시 이전 결제 기준으로 다음 날 도착했습니다.'
    ].join('\n');
    renderSeo();
    toast('예시를 채웠습니다. 실제 상품 정보로 바꿔 보세요.');
  });

  var seoClear = $('#seo-clear');
  if (seoClear) seoClear.addEventListener('click', function () {
    $('#seo-title').value = '';
    $('#seo-body').value = '';
    $('#seo-kw').value = '';
    renderSeo();
  });

  var seoCopySum = $('#seo-copy-summary');
  if (seoCopySum) seoCopySum.addEventListener('click', function () {
    var items = $$('#seo-checks li').map(function (li) {
      return (li.classList.contains('ok') ? '[O] ' : '[X] ') + li.textContent.replace(/^[✓!]/, '').trim();
    });
    if (!items.length) { toast('먼저 제목과 본문을 입력해 주세요.'); return; }
    copyText(items.join('\n'));
  });

  var seoTagsCopy = $('#seo-tags-copy');
  if (seoTagsCopy) seoTagsCopy.addEventListener('click', function () {
    var tags = $$('#seo-tags .sl-chip').map(function (el) { return el.textContent; }).filter(function (t) {
      return t.charAt(0) === '#';
    });
    if (!tags.length) { toast('복사할 태그가 아직 없습니다.'); return; }
    copyText(tags.join(' '));
  });

  /* =========================================================
     ④ QR · UTM · 명함
     ========================================================= */
  var SUB_NAMES = ['qr', 'utm', 'card'];

  function activateSub(name) {
    if (SUB_NAMES.indexOf(name) < 0) name = 'qr';
    S.qr.sub = name;
    $$('.sl-subtabs [role="tab"]').forEach(function (btn) {
      var on = btn.getAttribute('data-qr-tab') === name;
      btn.setAttribute('aria-selected', on ? 'true' : 'false');
      btn.tabIndex = on ? 0 : -1;
    });
    $$('.sl-subpanel').forEach(function (p) {
      p.hidden = p.getAttribute('data-subpanel') !== name;
    });
    if (name === 'qr') renderQr();
    if (name === 'utm') renderUtm();
    if (name === 'card') drawCard();
  }

  $$('.sl-subtabs [role="tab"]').forEach(function (btn) {
    btn.addEventListener('click', function () { activateSub(btn.getAttribute('data-qr-tab')); });
  });

  $$('[data-qr-type]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      S.qr.type = btn.getAttribute('data-qr-type');
      $$('[data-qr-type]').forEach(function (b) { b.setAttribute('aria-pressed', b === btn ? 'true' : 'false'); });
      $$('[data-qr-pane]').forEach(function (p) {
        p.hidden = p.getAttribute('data-qr-pane') !== S.qr.type;
      });
      renderQr();
    });
  });

  function vcardEsc(v) { return String(v || '').replace(/([\\;,])/g, '\\$1').replace(/\n/g, ' '); }

  function qrPayload() {
    var type = S.qr.type;
    if (type === 'contact') {
      var name = ($('#qr-c-name') || {}).value || '';
      var org = ($('#qr-c-org') || {}).value || '';
      var tel = ($('#qr-c-tel') || {}).value || '';
      var mail = ($('#qr-c-mail') || {}).value || '';
      if (!name && !tel && !mail) return { empty: true, msg: '이름·전화·이메일 중 하나는 넣어 주세요.' };
      var lines = ['BEGIN:VCARD', 'VERSION:3.0'];
      lines.push('N:' + vcardEsc(name));
      lines.push('FN:' + vcardEsc(name));
      if (org) lines.push('ORG:' + vcardEsc(org));
      if (tel) lines.push('TEL;TYPE=CELL:' + vcardEsc(tel.replace(/[^\d+]/g, '')));
      if (mail) lines.push('EMAIL;TYPE=INTERNET:' + vcardEsc(mail));
      lines.push('END:VCARD');
      return { text: lines.join('\n'), label: name || '연락처' };
    }
    if (type === 'wifi') {
      var ssid = ($('#qr-w-ssid') || {}).value || '';
      var pass = ($('#qr-w-pass') || {}).value || '';
      var sec = ($('#qr-w-sec') || {}).value || 'WPA';
      var hid = ($('#qr-w-hidden') || {}).value === 'true';
      if (!ssid) return { empty: true, msg: '와이파이 이름(SSID)을 입력해 주세요.' };
      var escW = function (s) { return String(s).replace(/([\\;,:])/g, '\\$1'); };
      var payload = 'WIFI:T:' + (sec === 'nopass' ? 'nopass' : sec) + ';S:' + escW(ssid) + ';' +
        (sec === 'nopass' ? '' : 'P:' + escW(pass) + ';') + (hid ? 'H:true;' : '') + ';';
      return { text: payload, label: ssid };
    }
    var url = ($('#qr-url') || {}).value || '';
    url = url.trim();
    if (!url) return { empty: true, msg: 'QR에 담을 주소를 입력해 주세요.' };
    return { text: url, label: 'URL' };
  }

  function makeQr(text, ec) {
    if (typeof qrcode !== 'function') return null;
    if (qrcode.stringToBytesFuncs && qrcode.stringToBytesFuncs['UTF-8']) {
      qrcode.stringToBytes = qrcode.stringToBytesFuncs['UTF-8'];
    }
    var qr = qrcode(0, ec || 'M');
    qr.addData(text, 'Byte');
    qr.make();
    return qr;
  }

  function drawQrInto(ctx, qr, x, y, size, fg, bg, margin) {
    var n = qr.getModuleCount();
    var total = n + margin * 2;
    var cell = size / total;
    ctx.fillStyle = bg;
    ctx.fillRect(x, y, size, size);
    ctx.fillStyle = fg;
    for (var r = 0; r < n; r++) {
      for (var c = 0; c < n; c++) {
        if (!qr.isDark(r, c)) continue;
        var x0 = x + Math.round((c + margin) * cell);
        var x1 = x + Math.round((c + margin + 1) * cell);
        var y0 = y + Math.round((r + margin) * cell);
        var y1 = y + Math.round((r + margin + 1) * cell);
        ctx.fillRect(x0, y0, Math.max(1, x1 - x0), Math.max(1, y1 - y0));
      }
    }
  }

  function renderQr() {
    var c = $('#qr-canvas');
    if (!c) return;
    var ctx = c.getContext('2d');
    var msgEl = $('#qr-msg');
    var stat = $('#qr-stat');
    var size = Number(($('#qr-size') || {}).value || 1024);
    var fg = ($('#qr-fg') || {}).value || '#15171a';
    var bg = ($('#qr-bg') || {}).value || '#ffffff';
    var margin = Number(($('#qr-margin') || {}).value || 4);
    var ec = ($('#qr-ec') || {}).value || 'M';
    var label = (($('#qr-label') || {}).value || '').trim();

    var payload = qrPayload();
    if (payload.empty) {
      c.width = size; c.height = size;
      ctx = c.getContext('2d');
      ctx.fillStyle = '#f8f9fa';
      ctx.fillRect(0, 0, size, size);
      ctx.fillStyle = '#6f747b';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      setFont(ctx, '600', Math.round(size * 0.032), FONT_SANS);
      ctx.fillText(payload.msg || '내용을 입력해 주세요', size / 2, size / 2);
      if (msgEl) msgEl.textContent = payload.msg || '내용을 입력해 주세요.';
      if (stat) stat.textContent = '–';
      return;
    }

    var qr;
    try {
      qr = makeQr(payload.text, ec);
    } catch (e) {
      qr = null;
    }
    if (!qr) {
      if (msgEl) msgEl.textContent = 'QR을 만들지 못했습니다. 내용이 너무 길거나 스크립트를 불러오지 못했습니다.';
      if (stat) stat.textContent = '오류';
      return;
    }

    var labelH = label ? Math.round(size * 0.13) : 0;
    c.width = size;
    c.height = size + labelH;
    ctx = c.getContext('2d');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, c.width, c.height);
    drawQrInto(ctx, qr, 0, 0, size, fg, bg, margin);
    if (label) {
      ctx.fillStyle = fg;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      var ls = fitSizeMin(ctx, label, size * 0.86, Math.round(size * 0.05), '700', FONT_SANS, Math.round(size * 0.026));
      setFont(ctx, '700', ls, FONT_SANS);
      ctx.fillText(label, size / 2, size + labelH / 2);
    }

    var n = qr.getModuleCount();
    var ver = (n - 17) / 4;
    if (stat) stat.textContent = '버전 ' + ver + ' · ' + n + '×' + n + ' 모듈 · ' + ec;
    if (msgEl) {
      var len = bytesOf(payload.text);
      msgEl.textContent = '담은 내용 ' + len + '바이트 · ' + (ec === 'L' ? '오류 보정 7%' : ec === 'M' ? '오류 보정 15%' : ec === 'Q' ? '오류 보정 25%' : '오류 보정 30%');
    }
  }

  ['#qr-url', '#qr-c-name', '#qr-c-org', '#qr-c-tel', '#qr-c-mail', '#qr-w-ssid', '#qr-w-pass', '#qr-label'].forEach(function (sel) {
    var el = $(sel);
    if (el) el.addEventListener('input', renderQr);
  });
  ['#qr-fg', '#qr-bg'].forEach(function (sel) {
    var el = $(sel);
    if (el) el.addEventListener('input', renderQr);
  });
  ['#qr-margin', '#qr-ec', '#qr-size', '#qr-w-sec', '#qr-w-hidden'].forEach(function (sel) {
    var el = $(sel);
    if (el) el.addEventListener('change', renderQr);
  });

  var qrDl = $('#qr-download');
  if (qrDl) qrDl.addEventListener('click', function () {
    var c = $('#qr-canvas');
    var payload = qrPayload();
    if (payload.empty) { toast(payload.msg || '내용을 입력해 주세요.'); return; }
    var base = (payload.label || 'qr').replace(/[\\/:*?"<>|]/g, '').slice(0, 24) || 'qr';
    downloadCanvas(c, 'sample-qr-' + base + '-' + c.width + 'px.png', function (size) {
      toast('QR PNG를 저장했습니다 (' + Math.round(size / 1024) + 'KB)');
    });
  });

  /* --- UTM --- */
  function buildUtm() {
    var base = (($('#utm-url') || {}).value || '').trim();
    if (!base) return { error: '기본 주소를 입력해 주세요.' };
    if (!/^https?:\/\//i.test(base)) base = 'https://' + base;
    var u;
    try { u = new URL(base); } catch (e) { return { error: '주소 형식이 올바르지 않습니다.' }; }
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach(function (k) { u.searchParams.delete(k); });
    var map = [
      ['utm_source', '#utm-source'],
      ['utm_medium', '#utm-medium'],
      ['utm_campaign', '#utm-campaign'],
      ['utm_content', '#utm-content'],
      ['utm_term', '#utm-term']
    ];
    var parts = [];
    map.forEach(function (pair) {
      var v = (($(pair[1]) || {}).value || '').trim();
      if (!v) return;
      u.searchParams.set(pair[0], v);
      parts.push([pair[0], v]);
    });
    return { url: u.toString(), parts: parts, base: u.origin + u.pathname };
  }

  function renderUtm() {
    var out = $('#utm-out');
    var parts = $('#utm-parts');
    var stat = $('#utm-stat');
    if (!out) return;
    var r = buildUtm();
    if (r.error) {
      out.value = '';
      if (stat) stat.textContent = '입력 필요';
      if (parts) parts.innerHTML = '<span>' + esc(r.error) + '</span>';
      return;
    }
    out.value = r.url;
    if (stat) stat.textContent = r.url.length + '자';
    if (parts) {
      parts.innerHTML = r.parts.length
        ? r.parts.map(function (p) { return '<span>' + esc(p[0]) + '<b>' + esc(p[1]) + '</b></span>'; }).join('')
        : '<span>utm 값이 비어 있습니다. source·medium은 채우는 것이 좋습니다.</span>';
    }
  }

  ['#utm-url', '#utm-source', '#utm-medium', '#utm-campaign', '#utm-content', '#utm-term'].forEach(function (sel) {
    var el = $(sel);
    if (el) el.addEventListener('input', renderUtm);
  });

  $$('[data-utm-medium]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var el = $('#utm-medium');
      if (el) { el.value = btn.getAttribute('data-utm-medium'); renderUtm(); }
    });
  });

  var utmCopy = $('#utm-copy');
  if (utmCopy) utmCopy.addEventListener('click', function () {
    var r = buildUtm();
    if (r.error) { toast(r.error); return; }
    copyText(r.url);
  });

  var utmToQr = $('#utm-toqr');
  if (utmToQr) utmToQr.addEventListener('click', function () {
    var r = buildUtm();
    if (r.error) { toast(r.error); return; }
    var urlEl = $('#qr-url');
    if (urlEl) urlEl.value = r.url;
    S.qr.type = 'url';
    $$('[data-qr-type]').forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-qr-type') === 'url' ? 'true' : 'false'); });
    $$('[data-qr-pane]').forEach(function (p) { p.hidden = p.getAttribute('data-qr-pane') !== 'url'; });
    activateSub('qr');
    renderQr();
    toast('UTM 링크를 QR로 옮겼습니다.');
  });

  /* --- 모바일 명함 --- */
  function drawCard() {
    var c = $('#cd-canvas');
    if (!c) return;
    var W = 1000, H = 600;
    c.width = W; c.height = H;
    var ctx = c.getContext('2d');
    var accent = ($('#cd-color') || {}).value || '#16202f';
    var name = (($('#cd-name') || {}).value || '').trim() || '이름';
    var role = (($('#cd-role') || {}).value || '').trim();
    var company = (($('#cd-company') || {}).value || '').trim();
    var tel = (($('#cd-tel') || {}).value || '').trim();
    var mail = (($('#cd-mail') || {}).value || '').trim();
    var web = (($('#cd-web') || {}).value || '').trim();
    var tagline = (($('#cd-tagline') || {}).value || '').trim();

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, W - 2, H - 2);
    ctx.fillStyle = accent;
    ctx.fillRect(0, 0, 14, H);

    var x = 68;
    if (company) {
      setFont(ctx, '800', 26, FONT_SANS);
      ctx.fillStyle = '#6f747b';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText(company, x, 108);
      ctx.fillStyle = accent;
      ctx.fillRect(x, 128, 44, 4);
    }
    setFont(ctx, '900', 72, FONT_SERIF);
    ctx.fillStyle = '#15171a';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    var nameSize = fitSizeMin(ctx, name, 520, 72, '900', FONT_SERIF, 40);
    setFont(ctx, '900', nameSize, FONT_SERIF);
    ctx.fillText(name, x, 218);

    if (role) {
      setFont(ctx, '700', 26, FONT_SANS);
      ctx.fillStyle = accent;
      ctx.fillText(role, x, 262);
    }
    if (tagline) {
      setFont(ctx, '400', 21, FONT_SANS);
      ctx.fillStyle = '#4f545b';
      var tl = wrapLines(ctx, tagline, 500).slice(0, 2);
      tl.forEach(function (line, i) { ctx.fillText(line, x, 312 + i * 32); });
    }

    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x, 366); ctx.lineTo(590, 366); ctx.stroke();

    var rowY = 412;
    function contactRow(label, value) {
      if (!value) return;
      setFont(ctx, '600', 11, FONT_MONO);
      ctx.fillStyle = '#8a8f96';
      ctx.fillText(label, x, rowY - 22);
      setFont(ctx, '600', 23, FONT_SANS);
      ctx.fillStyle = '#15171a';
      var v = value.length > 34 ? value.slice(0, 33) + '…' : value;
      ctx.fillText(v, x, rowY);
      rowY += 62;
    }
    contactRow('TEL', tel);
    contactRow('MAIL', mail);
    contactRow('WEB', web.replace(/^https?:\/\//, ''));

    /* 오른쪽 패널 + QR */
    var panelX = 640;
    ctx.fillStyle = accent;
    ctx.fillRect(panelX, 0, W - panelX, H);

    var qrText = web || (mail ? 'mailto:' + mail : (tel ? 'tel:' + tel.replace(/[^\d+]/g, '') : ''));
    if (qrText) {
      var qr = null;
      try { qr = makeQr(qrText, 'M'); } catch (e) { qr = null; }
      if (qr) {
        var box = 250;
        var bx = panelX + (W - panelX - box) / 2;
        var by = 96;
        ctx.fillStyle = '#ffffff';
        roundRect(ctx, bx - 14, by - 14, box + 28, box + 28, 10);
        ctx.fill();
        drawQrInto(ctx, qr, bx, by, box, '#15171a', '#ffffff', 2);
        ctx.fillStyle = 'rgba(255,255,255,.75)';
        setFont(ctx, '700', 13, FONT_MONO);
        ctx.textAlign = 'center';
        ctx.fillText('SCAN', panelX + (W - panelX) / 2, 66);
        ctx.fillStyle = '#ffffff';
        setFont(ctx, '700', 20, FONT_SANS);
        ctx.textAlign = 'center';
        ctx.fillText(company || name, panelX + (W - panelX) / 2, 452);
      }
    } else {
      ctx.fillStyle = 'rgba(255,255,255,.7)';
      setFont(ctx, '600', 18, FONT_SANS);
      ctx.textAlign = 'center';
      ctx.fillText('링크를 입력하면 QR이 들어갑니다', panelX + (W - panelX) / 2, 300);
    }

    var stat = $('#cd-stat');
    if (stat) stat.textContent = W + ' × ' + H;
  }

  var cdTimer = null;
  ['#cd-name', '#cd-role', '#cd-company', '#cd-tel', '#cd-mail', '#cd-web', '#cd-tagline'].forEach(function (sel) {
    var el = $(sel);
    if (el) el.addEventListener('input', function () {
      clearTimeout(cdTimer);
      cdTimer = setTimeout(drawCard, 150);
    });
  });
  var cdColor = $('#cd-color');
  if (cdColor) cdColor.addEventListener('input', drawCard);

  var cdDl = $('#cd-download');
  if (cdDl) cdDl.addEventListener('click', function () {
    var c = $('#cd-canvas');
    var nm = (($('#cd-name') || {}).value || 'card').replace(/[\\/:*?"<>|]/g, '').slice(0, 20);
    downloadCanvas(c, 'sample-card-' + nm + '.png', function (size) {
      toast('명함 PNG를 저장했습니다 (' + Math.round(size / 1024) + 'KB)');
    });
  });

  /* =========================================================
     시작
     ========================================================= */
  function boot() {
    setThCanvasSize();
    drawThumb();
    renderBlockList();
    renderDetail();
    renderSeo();
    renderQr();
    renderUtm();
    drawCard();
    var hash = (location.hash || '').replace('#', '');
    if (TAB_NAMES.indexOf(hash) >= 0) activateTab(hash);
  }

  boot();

  /* 웹폰트가 늦게 도착하면 캔버스를 다시 그린다 */
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () {
      drawThumb();
      renderDetail();
      renderQr();
      drawCard();
    }).catch(function () { /* 무시 */ });
  }
  window.addEventListener('load', function () {
    drawThumb();
    renderDetail();
    renderQr();
    drawCard();
  });
})();
