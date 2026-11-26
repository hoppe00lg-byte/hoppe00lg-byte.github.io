/* =========================================================
   INSIGHT BRIEF — 룩북 이미지(Canvas → PNG)
   style.html 의 추천 결과 세 세트를 1080×1350 카드로 그립니다.
   · 외부 라이브러리·서버 없음. 브라우저 캔버스로만 그립니다.
   ========================================================= */
(function () {
  'use strict';

  var W = 1080, H = 1350;
  var INK = '#15171a', INK2 = '#2e3136', MUTED = '#6f747b', RULE = '#d5d8de', ACCENT = '#b3261e', PAPER = '#fbfbfc';

  function font(size, weight, family) {
    return (weight || 500) + ' ' + size + 'px ' + (family || '"Pretendard Variable",Pretendard,"Noto Sans KR","Noto Sans SC","Noto Sans JP",system-ui,sans-serif');
  }
  function serif(size, weight) {
    return (weight || 800) + ' ' + size + 'px "Noto Serif KR","Noto Serif SC","Noto Serif JP",Georgia,serif';
  }

  function wrap(ctx, text, maxW) {
    var out = [], line = '';
    var chars = String(text || '').split('');
    for (var i = 0; i < chars.length; i++) {
      var test = line + chars[i];
      if (ctx.measureText(test).width > maxW && line) { out.push(line); line = chars[i]; }
      else line = test;
    }
    if (line) out.push(line);
    return out;
  }

  function draw(model) {
    var cv = document.createElement('canvas');
    cv.width = W; cv.height = H;
    var ctx = cv.getContext('2d');
    var L = model.L, T = model.T;

    ctx.fillStyle = PAPER;
    ctx.fillRect(0, 0, W, H);

    /* 머리 */
    ctx.fillStyle = INK;
    ctx.fillRect(0, 0, W, 168);
    ctx.fillStyle = '#fff';
    ctx.font = serif(46, 900);
    ctx.fillText('INSIGHT BRIEF', 64, 88);
    ctx.font = font(19, 700);
    ctx.fillStyle = '#c9ccd2';
    ctx.fillText('STYLE BRIEF · ' + model.date, 64, 126);
    ctx.fillStyle = ACCENT;
    ctx.fillRect(64, 142, 96, 4);

    /* 요약 */
    var y = 232;
    ctx.fillStyle = INK;
    ctx.font = serif(38, 800);
    ctx.fillText(L(model.pc.label), 64, y);
    y += 44;
    ctx.font = font(22, 500);
    ctx.fillStyle = INK2;
    var summary = L(model.body.label) + ' · BMI ' + model.bmi + ' (' + model.band.label + ') · ' + L(model.season.label) + ' · ' + L(model.occasion.label);
    wrap(ctx, summary, W - 128).slice(0, 2).forEach(function (line) {
      ctx.fillText(line, 64, y); y += 30;
    });

    /* 팔레트 */
    y += 8;
    var pal = model.pc.palette.slice(0, 5);
    var boxW = (W - 128 - (pal.length - 1) * 12) / pal.length;
    pal.forEach(function (c, i) {
      var x = 64 + i * (boxW + 12);
      ctx.fillStyle = c.hex;
      ctx.fillRect(x, y, boxW, 62);
      ctx.strokeStyle = RULE; ctx.lineWidth = 1;
      ctx.strokeRect(x + 0.5, y + 0.5, boxW - 1, 61);
      ctx.fillStyle = MUTED;
      ctx.font = font(15, 500);
      ctx.fillText(L(c.name), x + 2, y + 88);
    });
    y += 122;

    /* 코디 3세트 */
    model.looks.forEach(function (lk, idx) {
      ctx.strokeStyle = RULE; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(64, y); ctx.lineTo(W - 64, y); ctx.stroke();
      y += 40;
      ctx.fillStyle = ACCENT;
      ctx.font = font(18, 800);
      ctx.fillText('0' + (idx + 1), 64, y);
      ctx.fillStyle = INK;
      ctx.font = serif(28, 800);
      var name = lk.style === 'minimal' ? T.styleMinimal : lk.style === 'trendy' ? T.styleTrendy : T.styleCasual;
      ctx.fillText(name, 108, y);
      y += 40;
      lk.rows.forEach(function (r) {
        ctx.fillStyle = r.hex;
        ctx.beginPath(); ctx.arc(72, y - 7, 9, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = RULE; ctx.lineWidth = 1; ctx.stroke();
        ctx.fillStyle = MUTED;
        ctx.font = font(17, 500);
        ctx.fillText(r.label, 90, y);
        ctx.fillStyle = INK2;
        ctx.font = font(21, 600);
        var glue = model.lang === 'ja' ? 'の' : ' ';
        var merged = model.lang === 'zh' ? r.name + r.item : r.name + glue + r.item;
        var lines = wrap(ctx, merged, W - 220).slice(0, 2);
        lines.forEach(function (ln, li) { ctx.fillText(ln, 200, y + li * 26); });
        y += Math.max(34, lines.length * 26 + 8);
      });
      y += 14;
    });

    /* 바닥 */
    ctx.fillStyle = INK;
    ctx.fillRect(0, H - 116, W, 116);
    ctx.fillStyle = '#fff';
    ctx.font = font(20, 700);
    ctx.fillText('insightbriefnews.com/style.html', 64, H - 62);
    ctx.fillStyle = '#9ea3aa';
    ctx.font = font(17, 500);
    ctx.fillText(T.refValue + ' · ' + T.metal + ' ' + L(model.pc.metal), 64, H - 34);
    return cv;
  }

  function fileName() {
    var d = new Date();
    function p(n) { return (n < 10 ? '0' : '') + n; }
    return 'insight-brief-lookbook-' + d.getFullYear() + p(d.getMonth() + 1) + p(d.getDate()) + '.png';
  }

  function save(model) {
    try {
      var cv = draw(model);
      cv.toBlob(function (blob) {
        if (!blob) return;
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url; a.download = fileName();
        document.body.appendChild(a); a.click();
        setTimeout(function () { document.body.removeChild(a); URL.revokeObjectURL(url); }, 800);
      }, 'image/png');
    } catch (e) { /* 캔버스를 못 쓰는 환경 */ }
  }

  function share(model) {
    try {
      var cv = draw(model);
      cv.toBlob(function (blob) {
        if (!blob) { save(model); return; }
        var file = new File([blob], fileName(), { type: 'image/png' });
        if (navigator.canShare && navigator.canShare({ files: [file] }) && navigator.share) {
          navigator.share({ files: [file], title: 'INSIGHT BRIEF — STYLE BRIEF' }).catch(function () { /* 취소 */ });
        } else {
          save(model);
        }
      }, 'image/png');
    } catch (e) { save(model); }
  }

  window.IBFashionLookbook = { draw: draw, save: save, share: share };
})();
