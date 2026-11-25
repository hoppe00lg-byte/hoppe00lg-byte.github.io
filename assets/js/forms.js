/* =========================================================
   INSIGHT BRIEF — 서식·전자서명 플랫폼 엔진 (forms.html)
   - 서식 정의(window.IBF_DOCS)는 assets/js/forms-data.js 에 있습니다.
   - 모든 문서 문구·레이아웃은 이 사이트에서 직접 작성한 것입니다.
   ========================================================= */
(function (root) {
  'use strict';

  /* ---------------------------------------------------------
     0. 공통 유틸
  --------------------------------------------------------- */
  /* 국가별 페이지(/en/ /zh/ /ja/)에서는 기본 통화·날짜 표기를 그 나라 기준으로 바꿉니다.
     서식 138종의 내용과 항목은 그대로 두고, 금액 단위와 날짜 모양만 맞춥니다. */
  var IBL = (function () {
    var l = (document.documentElement.getAttribute('lang') || 'ko').toLowerCase();
    if (/^en/.test(l)) return { lang: 'en', sym: '$', loc: 'en-US' };
    if (/^zh/.test(l)) return { lang: 'zh', sym: '¥', loc: 'zh-CN' };
    if (/^ja/.test(l)) return { lang: 'ja', sym: '¥', loc: 'ja-JP' };
    return null;
  })();
  var ESC_MAP = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  function esc(v) {
    return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) { return ESC_MAP[c]; });
  }
  function num(v) {
    if (typeof v === 'number') return isFinite(v) ? v : 0;
    var n = parseFloat(String(v == null ? '' : v).replace(/[^0-9.\-]/g, ''));
    return isFinite(n) ? n : 0;
  }
  function fmt(n) {
    var v = Math.round(num(n));
    var neg = v < 0;
    var s = String(Math.abs(v)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return (neg ? '-' : '') + s;
  }
  function fmt1(n) {
    var v = num(n);
    var s = (Math.round(v * 10) / 10).toFixed(1);
    return s.replace(/\.0$/, '');
  }
  function won(n) {
    if (IBL) return IBL.sym + fmt(n);
    return fmt(n) + '원';
  }
  function pad2(n) { return (n < 10 ? '0' : '') + n; }
  function dateKo(iso) {
    if (!iso) return '—';
    var m = String(iso).match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!m) return String(iso);
    if (IBL && IBL.lang === 'en') {
      var en = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      return en[Number(m[2]) - 1] + ' ' + Number(m[3]) + ', ' + m[1];
    }
    if (IBL) return m[1] + '年' + Number(m[2]) + '月' + Number(m[3]) + '日';
    return m[1] + '년 ' + Number(m[2]) + '월 ' + Number(m[3]) + '일';
  }
  function dateDot(iso) {
    if (!iso) return '—';
    var m = String(iso).match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (IBL && IBL.lang === 'en') return m ? (m[2] + '/' + m[3] + '/' + m[1]) : String(iso);
    return m ? (m[1] + '.' + m[2] + '.' + m[3]) : String(iso);
  }
  function todayISO() {
    var n = new Date();
    return n.getFullYear() + '-' + pad2(n.getMonth() + 1) + '-' + pad2(n.getDate());
  }
  function nowStamp() {
    var n = new Date();
    return n.getFullYear() + '-' + pad2(n.getMonth() + 1) + '-' + pad2(n.getDate()) +
      ' ' + pad2(n.getHours()) + ':' + pad2(n.getMinutes()) + ' KST';
  }
  function addYears(iso, n) {
    var m = String(iso || todayISO()).match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!m) return iso;
    return (Number(m[1]) + n) + '-' + m[2] + '-' + m[3];
  }
  function addMonths(iso, n) {
    var m = String(iso || todayISO()).match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!m) return iso;
    var y = Number(m[1]), mo = Number(m[2]) - 1 + n, day = Number(m[3]);
    var d = new Date(y, mo, 1);
    var last = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
    return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(Math.min(day, last));
  }
  function addDays(iso, n) {
    var m = String(iso || todayISO()).match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!m) return iso;
    var d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]) + n);
    return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
  }
  function termText(from, to) {
    if (!from) return '—';
    var a = String(from).match(/^(\d{4})-(\d{2})-(\d{2})/);
    var b = String(to || todayISO()).match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!a || !b) return '—';
    var d1 = new Date(Number(a[1]), Number(a[2]) - 1, Number(a[3]));
    var d2 = new Date(Number(b[1]), Number(b[2]) - 1, Number(b[3]));
    if (d2 < d1) return '—';
    var months = (d2.getFullYear() - d1.getFullYear()) * 12 + (d2.getMonth() - d1.getMonth());
    if (d2.getDate() < d1.getDate()) months -= 1;
    if (months < 0) months = 0;
    var y = Math.floor(months / 12), m = months % 12;
    var out = [];
    if (y) out.push(y + (IBL && IBL.lang === 'en' ? (y > 1 ? ' years' : ' year') : IBL && IBL.lang === 'zh' ? '年' : IBL && IBL.lang === 'ja' ? '年' : '년'));
    if (m) out.push(m + (IBL && IBL.lang === 'en' ? (m > 1 ? ' months' : ' month') : IBL && IBL.lang === 'zh' ? '个月' : IBL && IBL.lang === 'ja' ? 'か月' : '개월'));
    if (!out.length) {
      var days = Math.max(1, Math.round((d2 - d1) / 86400000));
      return days + (IBL && IBL.lang === 'en' ? (days > 1 ? ' days' : ' day') : IBL && IBL.lang === 'zh' ? '天' : IBL && IBL.lang === 'ja' ? '日' : '일');
    }
    return out.join(' ');
  }

  var DIG = ['영', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구'];
  var UNIT4 = ['', '십', '백', '천'];
  var BIG = ['', '만', '억', '조'];
  function korAmt(n) {
    var v = Math.round(Math.abs(num(n)));
    if (!v) return '영';
    var s = '', gi = 0;
    while (v > 0 && gi < BIG.length) {
      var part = v % 10000;
      if (part) {
        var ps = '';
        for (var i = 3; i >= 0; i--) {
          var d = Math.floor(part / Math.pow(10, i)) % 10;
          if (d) ps += DIG[d] + UNIT4[i];
        }
        s = ps + BIG[gi] + s;
      }
      v = Math.floor(v / 10000);
      gi++;
    }
    return s;
  }
  function korMoney(n) {
    if (IBL) return IBL.sym + fmt(num(n));
    var v = Math.round(num(n));
    if (!v) return '영원';
    return korAmt(v) + '원';
  }
  function korMoneyFull(n) {
    if (IBL) return IBL.sym + fmt(num(n));
    return '일금 ' + korMoney(n) + '정';
  }

  function uid() {
    var s = '';
    for (var i = 0; i < 10; i++) s += Math.floor(Math.random() * 36).toString(36);
    return s;
  }

  function val(spec, d) {
    if (typeof spec === 'function') return spec(d);
    if (spec == null) return '';
    /* 서식 정의에서 'company' 같은 필드 키만 값으로 읽고,
       띄어쓰기·기호가 있는 문자열은 그대로 쓰는 안내 문구로 봅니다. */
    if (typeof spec === 'string' && !/^[A-Za-z][A-Za-z0-9_]*$/.test(spec)) return spec;
    return d.f[spec] == null ? '' : d.f[spec];
  }
  function text(spec, d) { return String(val(spec, d) == null ? '' : val(spec, d)); }
  function money(spec, d) { return fmt(val(spec, d)); }
  function moneyWon(spec, d) { return won(val(spec, d)); }

  function defOf(id) { return (root.IBF_DOCS || {})[id]; }
  function catOf(id) {
    var cats = root.IBF_CATS || [];
    for (var i = 0; i < cats.length; i++) if (cats[i].id === id) return cats[i];
    return null;
  }
  function partyOf(def, k) {
    var ps = def.parties || [];
    for (var i = 0; i < ps.length; i++) if (ps[i].k === k) return ps[i];
    return null;
  }

  /* ---------------------------------------------------------
     1. 문서 데이터
  --------------------------------------------------------- */
  function newDoc(def) {
    var d = { id: def.id, f: {}, sets: {}, sig: {}, meta: { id: uid(), sigAt: {} } };
    (def.fields || []).forEach(function (f) {
      d.f[f.k] = typeof f.d === 'function' ? f.d() : (f.d == null ? '' : f.d);
    });
    (def.sets || []).forEach(function (s) {
      d.sets[s.k] = [];
      (s.def || []).forEach(function (r) {
        var row = {};
        s.cols.forEach(function (c) { row[c.k] = r[c.k] == null ? (c.d == null ? '' : c.d) : r[c.k]; });
        d.sets[s.k].push(row);
      });
    });
    return d;
  }
  function clone(v) { return JSON.parse(JSON.stringify(v)); }

  /* ---------------------------------------------------------
     2. 계산 도우미 (서식 정의에서 사용)
  --------------------------------------------------------- */
  function cellValue(d, row, col) {
    if (typeof col.calc === 'function') return num(col.calc(row, d));
    return num(row[col.k]);
  }
  function setSum(d, setKey, colKey) {
    var set = d.sets[setKey] || [];
    var ddef = defOf(d.id);
    var cols = null;
    (ddef.sets || []).forEach(function (s) { if (s.k === setKey) cols = s.cols; });
    var col = null;
    if (cols) for (var i = 0; i < cols.length; i++) if (cols[i].k === colKey) col = cols[i];
    /* 엑셀형 문서는 계산 열이 table.cols 에만 있는 경우가 있어 함께 찾습니다. */
    if (!col && ddef.table && ddef.table.set === setKey) {
      (ddef.table.cols || []).forEach(function (c) { if (!col && c.k === colKey) col = c; });
    }
    if (!col) return 0;
    var total = 0;
    set.forEach(function (r) { total += cellValue(d, r, col); });
    return total;
  }
  function vat(amount) { return Math.round(num(amount) * 0.1); }

  /* ---------------------------------------------------------
     3. 서명 — 손글씨(스트로크) · 도장(캔버스)
  --------------------------------------------------------- */
  function parseStrokes(str) {
    var out = [];
    if (!str) return out;
    String(str).split('|').forEach(function (seg) {
      if (!seg) return;
      var pts = [];
      seg.split(';').forEach(function (pt) {
        var xy = pt.split(',');
        if (xy.length === 2) pts.push([num(xy[0]), num(xy[1])]);
      });
      if (pts.length) out.push(pts);
    });
    return out;
  }
  function strokesToString(strokes) {
    return strokes.map(function (pts) {
      return pts.map(function (p) { return Math.round(p[0]) + ',' + Math.round(p[1]); }).join(';');
    }).join('|');
  }
  function drawStrokePath(ctx, strokes, ox, oy, scale, lineWidth, color) {
    ctx.save();
    ctx.strokeStyle = color || '#16224a';
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    strokes.forEach(function (pts) {
      if (pts.length === 1) {
        ctx.beginPath();
        ctx.arc(ox + pts[0][0] * scale, oy + pts[0][1] * scale, Math.max(1, lineWidth / 2), 0, Math.PI * 2);
        ctx.fillStyle = color || '#16224a';
        ctx.fill();
        return;
      }
      ctx.beginPath();
      ctx.moveTo(ox + pts[0][0] * scale, oy + pts[0][1] * scale);
      for (var i = 1; i < pts.length; i++) ctx.lineTo(ox + pts[i][0] * scale, oy + pts[i][1] * scale);
      ctx.stroke();
    });
    ctx.restore();
  }
  function strokesToDataURL(str) {
    var strokes = parseStrokes(str);
    if (!strokes.length || typeof document === 'undefined') return '';
    var minX = 1e9, minY = 1e9, maxX = -1e9, maxY = -1e9;
    strokes.forEach(function (pts) {
      pts.forEach(function (p) {
        if (p[0] < minX) minX = p[0];
        if (p[0] > maxX) maxX = p[0];
        if (p[1] < minY) minY = p[1];
        if (p[1] > maxY) maxY = p[1];
      });
    });
    var W = 480, H = 180, pad = 10;
    var bw = Math.max(1, maxX - minX), bh = Math.max(1, maxY - minY);
    var scale = Math.min((W - pad * 2) / bw, (H - pad * 2) / bh);
    var ox = (W - bw * scale) / 2 - minX * scale;
    var oy = (H - bh * scale) / 2 - minY * scale;
    var c = document.createElement('canvas');
    c.width = W; c.height = H;
    var ctx = c.getContext('2d');
    drawStrokePath(ctx, strokes, ox, oy, scale, Math.max(2.2, 3.2 * scale), '#16224a');
    return c.toDataURL('image/png');
  }

  var STAMP_COLOR = { red: '#c02a22', black: '#1b1b1b', blue: '#1f4e8c' };
  function stampSVG(opt) {
    var o = opt || {};
    var name = String(o.name || '홍길동').trim();
    var shape = o.shape === 'square' ? 'square' : 'circle';
    var style = o.style === 'en' ? 'en' : (o.style === 'hj' ? 'hj' : 'ko');
    var color = STAMP_COLOR[o.color] || STAMP_COLOR.red;
    var S = 520, c = S / 2;
    var p = [];
    p.push('<svg xmlns="http://www.w3.org/2000/svg" width="' + S + '" height="' + S + '" viewBox="0 0 ' + S + ' ' + S + '">');
    p.push('<g fill="none" stroke="' + color + '">');
    if (shape === 'circle') {
      p.push('<circle cx="' + c + '" cy="' + c + '" r="' + (S * 0.455) + '" stroke-width="' + (S * 0.038) + '"/>');
      p.push('<circle cx="' + c + '" cy="' + c + '" r="' + (S * 0.398) + '" stroke-width="' + (S * 0.009) + '"/>');
    } else {
      p.push('<rect x="' + (S * 0.045) + '" y="' + (S * 0.045) + '" width="' + (S * 0.91) + '" height="' + (S * 0.91) + '" rx="' + (S * 0.045) + '" stroke-width="' + (S * 0.038) + '"/>');
      p.push('<rect x="' + (S * 0.093) + '" y="' + (S * 0.093) + '" width="' + (S * 0.814) + '" height="' + (S * 0.814) + '" rx="' + (S * 0.027) + '" stroke-width="' + (S * 0.009) + '"/>');
    }
    p.push('</g>');
    p.push('<g fill="' + color + '" text-anchor="middle" dominant-baseline="central" font-family="Georgia, serif">');
    var chars = [];
    for (var i = 0; i < name.length; i++) {
      if (name.charAt(i) === ' ') continue;
      chars.push(name.charAt(i));
    }
    if (!chars.length) chars = ['인'];
    if (style === 'en') {
      var letters = name.toUpperCase();
      var words = letters.split(/\s+/).filter(function (x) { return x; });
      var lines = [];
      if (words.length > 1) {
        lines.push(words[0]);
        lines.push(words.slice(1).join(' '));
      } else {
        var single = words[0] || letters;
        if (single.length > 8) {
          lines.push(single.slice(0, Math.ceil(single.length / 2)));
          lines.push(single.slice(Math.ceil(single.length / 2)));
        } else lines.push(single);
      }
      var lh = S * 0.185;
      var startY = c - (lines.length - 1) * lh / 2;
      for (var li = 0; li < lines.length; li++) {
        var txt = lines[li];
        var fs = Math.round(S * 0.155);
        var est = txt.length * fs * 0.62;
        if (est > S * 0.66) fs = Math.max(Math.round(S * 0.06), Math.round(S * 0.66 / (txt.length * 0.62)));
        p.push('<text x="' + c + '" y="' + (startY + li * lh) + '" font-size="' + fs + '" font-weight="700">' + esc(txt) + '</text>');
      }
    } else {
      var perCol = 4;
      var colCount = Math.ceil(chars.length / perCol);
      var fs2 = Math.round(S * (chars.length <= 2 ? 0.34 : chars.length === 3 ? 0.28 : chars.length === 4 ? 0.24 : 0.2));
      var colGap = fs2 * 0.98;
      var rowGap = fs2 * 0.94;
      for (var ci = 0; ci < colCount; ci++) {
        var group = chars.slice(ci * perCol, ci * perCol + perCol);
        var x = c + (ci - (colCount - 1) / 2) * colGap;
        for (var gi = 0; gi < group.length; gi++) {
          var y = c + (gi - (group.length - 1) / 2) * rowGap;
          p.push('<text x="' + x + '" y="' + y + '" font-size="' + fs2 + '" font-weight="' + (style === 'hj' ? 600 : 700) + '">' + esc(group[gi]) + '</text>');
        }
      }
    }
    p.push('</g></svg>');
    return p.join('');
  }
  function stampToDataURL(opt) {
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(stampSVG(opt));
  }
  function drawStamp(ctx, size, opt) {
    if (typeof document === 'undefined') return;
    var src = stampToDataURL(opt);
    var img = new Image();
    img.onload = function () {
      ctx.clearRect(0, 0, size, size);
      ctx.drawImage(img, 0, 0, size, size);
    };
    img.src = src;
  }
  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }
  function sigDataURL(s) {
    if (!s) return '';
    if (s.img) return s.img;
    if (s.kind === 'sign') return strokesToDataURL(s.p);
    if (s.kind === 'stamp') return stampToDataURL({ name: s.n, shape: s.sh, style: s.st, color: s.cl });
    return '';
  }
  function sigMarkup(s, alt) {
    var src = sigDataURL(s);
    if (!src) return '<span class="ph">' + esc(alt || '서명') + '</span>';
    return '<img' + (s.kind === 'stamp' ? ' class="stamp"' : '') + ' src="' + esc(src) + '" alt="' + esc(alt || '서명') + '">';
  }

  /* ---------------------------------------------------------
     4. 서식 렌더링 (A4)
  --------------------------------------------------------- */
  function signBox(def, d, pk, opt) {
    var p = partyOf(def, pk);
    if (!p) return '';
    var s = d.sig[pk];
    var name = p.nameKey ? text(p.nameKey, d) : '';
    var cls = 'fm-slot' + (s ? ' has' : '');
    var html = '<div class="fm-signbox">';
    html += '<div class="fm-signlabel">' + esc(p.label) + '</div>';
    html += '<div class="' + cls + '" data-slot="' + esc(pk) + '" role="button" tabindex="0" aria-label="' + esc(p.label) + ' 서명란">' +
      sigMarkup(s, p.label) + '</div>';
    html += '<div class="fm-signname">' + (name ? '<b>' + esc(name) + '</b>' : '<span class="role">성명</span>') + '</div>';
    html += '<div class="fm-slot-tools fm-noprint">' +
      '<button type="button" data-slot-tool="sign" data-party="' + esc(pk) + '">손글씨</button>' +
      '<button type="button" data-slot-tool="stamp" data-party="' + esc(pk) + '">도장</button>' +
      (s ? '<button type="button" data-slot-tool="clear" data-party="' + esc(pk) + '">지우기</button>' : '') +
      '</div>';
    html += '</div>';
    return html;
  }

  function renderTable(def, d, b) {
    var cols = b.cols || [];
    var rows = d.sets[b.set] || [];
    var head = '<tr>' + cols.map(function (c) {
      return '<th' + (c.w ? ' style="width:' + c.w + '"' : '') + '>' + esc(c.h || c.k) + '</th>';
    }).join('') + '</tr>';
    var body = '';
    rows.forEach(function (r) {
      body += '<tr>' + cols.map(function (c) {
        var raw = c.calc ? cellValue(d, r, c) : r[c.k];
        var cls = 'n', out;
        if (c.calc || c.t === 'num') {
          cls = '';
          out = (raw === '' || raw == null) ? '' : fmt(raw);
        } else if (c.t === 'center') {
          cls = 'c';
          out = esc(raw == null ? '' : raw);
        } else {
          out = esc(raw == null ? '' : raw);
        }
        return '<td class="' + cls + '">' + out + '</td>';
      }).join('') + '</tr>';
    });
    var empty = Math.max(0, (b.empty == null ? 2 : b.empty) - rows.length);
    for (var i = 0; i < empty; i++) {
      body += '<tr class="empty">' + cols.map(function () { return '<td>&nbsp;</td>'; }).join('') + '</tr>';
    }
    var foot = '';
    if (b.foot && b.foot.length) {
      foot = '<tfoot><tr>' + b.foot.map(function (f) {
        var fv = typeof f.v === 'function' ? f.v(d) : f.v;
        var out = fv == null || fv === '' ? '' : (typeof fv === 'number' ? fmt(fv) : esc(fv));
        return '<td colspan="' + (f.colspan || 1) + '"' + (f.align === 'right' ? ' style="text-align:right"' : '') + '>' +
          esc(f.l || '') + (out ? ' ' + out : '') + '</td>';
      }).join('') + '</tr></tfoot>';
    }
    return '<table class="fm-table"><thead>' + head + '</thead><tbody>' + body + '</tbody>' + foot + '</table>';
  }

  function renderBlock(def, d, b) {
    var h = '';
    switch (b.t) {
      case 'parties':
        h += '<div class="fm-parties">';
        (b.cols || []).forEach(function (col) {
          h += '<div class="fm-party"><h4>' + esc(col.title) + '</h4><dl>';
          (col.rows || []).forEach(function (r) {
            var v = r[1] === 'reg' ? text(r[2], d) : text(r[1], d);
            h += '<dt>' + esc(r[0]) + '</dt><dd>' + (v ? esc(v) : '—') + '</dd>';
          });
          h += '</dl></div>';
        });
        h += '</div>';
        break;
      case 'kv':
        h += '<table class="fm-kv">';
        (b.rows || []).forEach(function (r) {
          h += '<tr><th>' + esc(r[0]) + '</th><td>' + (text(r[1], d) ? esc(text(r[1], d)) : '—') + '</td></tr>';
        });
        h += '</table>';
        break;
      case 'sec':
        var sv = text(b.v, d);
        if (!sv && b.skipEmpty) break;
        h += '<div class="fm-sec"><h3>' + esc(headText(b.h, d)) + '</h3><div class="bd">' + esc(sv) + '</div></div>';
        break;
      case 'body':
        h += '<div class="fm-sec"><div class="bd">' + esc(text(b.v, d)) + '</div></div>';
        break;
      case 'list':
        var lv = text(b.v, d);
        var lines = lv.split('\n').filter(function (x) { return x.trim(); });
        if (b.h) h += '<div class="fm-sec"><h3>' + esc(headText(b.h, d)) + '</h3>';
        h += '<ol class="fm-list' + (b.plain ? ' plain' : '') + '">';
        if (!lines.length) h += '<li>—</li>';
        lines.forEach(function (l) { h += '<li>' + esc(l.replace(/^\s*[0-9]+[.)]\s*/, '')) + '</li>'; });
        h += '</ol>';
        if (b.h) h += '</div>';
        break;
      case 'table':
        h += renderTable(def, d, b);
        break;
      case 'sums':
        h += '<div class="fm-sums"><table>';
        (b.rows || []).forEach(function (r) {
          var v = typeof r.v === 'function' ? r.v(d) : val(r.v, d);
          h += '<tr' + (r.grand ? ' class="grand"' : '') + '><th>' + esc(r.l) + '</th><td>' +
            (r.text ? esc(v) : fmt(v)) + (r.unit ? ' ' + esc(r.unit) : '') + '</td></tr>';
        });
        h += '</table></div>';
        break;
      case 'amount':
        var av = text(b.v, d);
        h += '<div class="fm-amount">' + esc(av) + (b.sub ? '<small>' + esc(text(b.sub, d)) + '</small>' : '') + '</div>';
        break;
      case 'sign':
        var ps = b.parties || [];
        h += '<div class="fm-signrow ' + (ps.length === 3 ? 'p3' : ps.length === 1 ? 'p1' : 'p2') + '">';
        ps.forEach(function (k) { h += signBox(def, d, k); });
        h += '</div>';
        if (b.note) h += '<div class="fm-note">' + esc(text(b.note, d)) + '</div>';
        break;
      case 'approval':
        h += '<table class="fm-approval"><thead><tr><th>결재</th>';
        (b.parties || []).forEach(function (p) { h += '<th>' + esc(p.label) + '</th>'; });
        h += '</tr></thead><tbody><tr><td class="nm">' + esc(b.head || '') + '</td>';
        (b.parties || []).forEach(function (p) {
          h += '<td><div class="fm-slot' + (d.sig[p.k] ? ' has' : '') + '" data-slot="' + esc(p.k) + '" role="button" tabindex="0">' +
            sigMarkup(d.sig[p.k], p.label) + '</div>' +
            '<div class="nm">' + esc(p.nameKey ? text(p.nameKey, d) : '') + '</div>' +
            '<div class="fm-slot-tools fm-noprint"><button type="button" data-slot-tool="sign" data-party="' + esc(p.k) + '">손글씨</button>' +
            '<button type="button" data-slot-tool="stamp" data-party="' + esc(p.k) + '">도장</button></div></td>';
        });
        h += '</tr></tbody></table>';
        break;
      case 'note':
        h += '<div class="fm-note">' + esc(text(b.v, d)) + '</div>';
        break;
      case 'center':
        h += '<div class="' + (b.cls || 'fm-doc-sub') + '">' + esc(text(b.v, d)) + '</div>';
        break;
      case 'title':
        h += '<div class="fm-doc-title">' + esc(text(b.v, d)) + '</div>';
        break;
      case 'spacer':
        h += '<div style="height:' + esc(b.h || '6mm') + '"></div>';
        break;
      case 'html':
        h += String(typeof b.v === 'function' ? b.v(d) : b.v);
        break;
    }
    return h;
  }

  function headText(h, d) {
    if (typeof h === 'function') return String(h(d) == null ? '' : h(d));
    return h == null ? '' : String(h);
  }

  function statusBlock(def, d) {
    var parts = [];
    (def.parties || []).forEach(function (p) {
      if (d.sig[p.k]) {
        parts.push(p.label + ' ' + (d.sig[p.k].kind === 'stamp' ? '도장' : '서명') +
          (d.meta.sigAt && d.meta.sigAt[p.k] ? ' ' + d.meta.sigAt[p.k] : ''));
      }
    });
    if (!parts.length && !d.meta.signedAt) return '';
    var h = '<div class="fm-status">';
    h += '<b>전자서명 확인</b> — ' + esc(parts.join(' · '));
    if (d.meta.signedAt) h += '<br>서명 완료 <b>' + esc(d.meta.signedAt) + '</b>';
    if (d.meta.hash) {
      h += '<br>문서 해시 ' + esc(d.meta.hashAlgo || 'SHA-256') + ' <span class="hash">' + esc(d.meta.hash) + '</span>';
    }
    h += '<br>서명 이후 문서 내용이 바뀌면 해시값이 달라집니다. 최종본은 PDF로 저장해 양쪽이 보관하세요.';
    h += '</div>';
    return h;
  }

  function renderPaper(d, def) {
    /* raw: 머리글·표 구성을 서식이 직접 그리는 문서 (B/L·S/I·간트 등) */
    if (def.raw) {
      return '<div class="fm-sheet" id="fm-sheet">' + String(def.raw(d)) + statusBlock(def, d) + '</div>';
    }
    var head = def.head || {};
    var kind = typeof head.kind === 'function' ? head.kind(d) : (head.kind || def.name);
    var sub = typeof head.sub === 'function' ? head.sub(d) : (head.sub || def.en || '');
    var co = head.co ? text(head.co, d) : '';
    var meta = head.meta || [];
    var h = '<div class="fm-sheet" id="fm-sheet">';
    h += '<div class="sh-head"><div><h2 class="sh-kind">' + esc(kind) + '</h2>' +
      '<div class="sh-sub">' + esc(sub) + '</div>' +
      (co ? '<div class="sh-co">' + esc(co) + '</div>' : '') + '</div>';
    if (meta.length) {
      h += '<table class="sh-meta"><tbody>';
      meta.forEach(function (m) {
        h += '<tr><th>' + esc(m[0]) + '</th><td>' + esc(text(m[1], d) || '—') + '</td></tr>';
      });
      h += '</tbody></table>';
    }
    h += '</div>';
    (def.blocks || []).forEach(function (b) { h += renderBlock(def, d, b); });
    h += statusBlock(def, d);
    h += '</div>';
    return h;
  }

  /* ---------------------------------------------------------
     5. 엑셀 · 슬라이드 · 도구 렌더
  --------------------------------------------------------- */
  function renderExcel(d, def) {
    var b = def.table;
    var rows = d.sets[b.set] || [];
    var cols = b.cols;
    var h = '<div class="fm-xls" id="fm-xls">';
    h += '<div class="xls-bar"><span class="f">' + esc(text('docName', d) || def.name) + ' · ' + esc(text('period', d) || todayISO()) + '</span>' +
      '<span class="n">' + rows.length + '행 · 자동 합계</span></div>';
    h += '<table><thead><tr>' + cols.map(function (c) {
      return '<th>' + esc(c.h || c.k) + '</th>';
    }).join('') + '</tr></thead><tbody>';
    rows.forEach(function (r) {
      h += '<tr>' + cols.map(function (c) {
        var cls = c.t === 'num' ? 'c' : (c.t === 'center' ? 'c' : 'n');
        var out;
        if (c.calc) out = fmt(cellValue(d, r, c));
        else out = esc(r[c.k] == null ? '' : r[c.k]);
        if (c.t === 'num' && !c.calc) cls = '';
        return '<td class="' + cls + '">' + (out === '' ? '&nbsp;' : out) + '</td>';
      }).join('') + '</tr>';
    });
    for (var i = 0; i < Math.max(0, (b.empty || 0) - rows.length); i++) {
      h += '<tr>' + cols.map(function () { return '<td>&nbsp;</td>'; }).join('') + '</tr>';
    }
    h += '</tbody>';
    if (b.foot) {
      h += '<tfoot><tr>' + b.foot.map(function (f) {
        var v = typeof f.v === 'function' ? f.v(d) : '';
        return '<td colspan="' + (f.colspan || 1) + '"' + (f.align === 'right' ? ' style="text-align:right"' : '') + '>' +
          esc(f.l || '') + (v === '' ? '' : ' ' + (typeof v === 'number' ? fmt(v) : esc(v))) + '</td>';
      }).join('') + '</tr></tfoot>';
    }
    h += '</table>';
    if (def.summary && def.summary.length) {
      h += '<div class="xls-sum">' + def.summary.map(function (s) {
        var v = typeof s.v === 'function' ? s.v(d) : s.v;
        var out;
        if (s.text) out = esc(String(v == null ? '' : v));
        else out = fmt(v);
        return '<div' + (s.grand ? ' class="grand"' : '') + '><span>' + esc(s.l) + '</span><b>' + out +
          (s.unit ? ' <i>' + esc(s.unit) + '</i>' : '') + '</b></div>';
      }).join('') + '</div>';
    }
    if (b.note) h += '<div class="xls-note">' + esc(text(b.note, d) || b.noteText || '') + '</div>';
    h += '</div>';
    return h;
  }

  function renderSlides(d, def) {
    var h = '<div class="fm-slides" id="fm-slides">';
    (def.slides || []).forEach(function (s, i) {
      var fn = typeof s === 'function' ? s : s.html;
      h += '<div class="fm-slide' + (i === 0 ? ' cover' : '') + '">';
      h += fn(d, i, def);
      h += '<span class="sl-no">' + pad2(i + 1) + '</span>';
      h += '</div>';
    });
    h += '</div>';
    return h;
  }

  function stageHTML(d, def) {
    if (def.kind === 'excel') return renderExcel(d, def);
    if (def.kind === 'slides') return renderSlides(d, def);
    if (def.kind === 'tool') return ''; // 도구는 자체 스테이지
    return renderPaper(d, def);
  }

  /* ---------------------------------------------------------
     6. 입력 폼
  --------------------------------------------------------- */
  function fieldHTML(f, d) {
    var v = d.f[f.k] == null ? '' : d.f[f.k];
    var id = 'ff_' + f.k;
    var input;
    if (f.t === 'area') {
      input = '<textarea id="' + id + '" data-f="' + esc(f.k) + '" rows="' + (f.rows || 3) + '"' +
        (f.ph ? ' placeholder="' + esc(f.ph) + '"' : '') + '>' + esc(v) + '</textarea>' +
        (f.limit ? '<span class="cnt" data-cnt="' + esc(f.k) + '" data-limit="' + f.limit + '">0자 / ' + f.limit + '자</span>' : '');
    } else if (f.t === 'sel') {
      input = '<select id="' + id + '" data-f="' + esc(f.k) + '">' + (f.opts || []).map(function (o) {
        var ov = typeof o === 'string' ? o : o.v;
        var ol = typeof o === 'string' ? o : o.l;
        return '<option value="' + esc(ov) + '"' + (String(v) === String(ov) ? ' selected' : '') + '>' + esc(ol) + '</option>';
      }).join('') + '</select>';
    } else {
      var type = f.t === 'date' ? 'date' : (f.t === 'num' ? 'text' : (f.t === 'tel' ? 'tel' : 'text'));
      input = '<input id="' + id + '" type="' + type + '" data-f="' + esc(f.k) + '" value="' + esc(v) + '"' +
        (f.ph ? ' placeholder="' + esc(f.ph) + '"' : '') +
        (f.t === 'num' ? ' inputmode="numeric"' : '') + ' autocomplete="off">';
    }
    return '<div class="fm-field' + (f.w === 2 ? ' span2' : '') + '"><div class="lbl"><span>' + esc(f.l) + '</span>' +
      (f.h ? '<i>' + esc(f.h) + '</i>' : '') + '</div>' + input + '</div>';
  }

  function setsHTML(def, d) {
    var h = '';
    (def.sets || []).forEach(function (s) {
      var rows = d.sets[s.k] || [];
      h += '<div class="fm-set"><div class="fm-set-head"><b>' + esc(s.label || '항목') + '</b><span>' + rows.length + '행</span></div>';
      h += '<table class="fm-rows"><thead><tr>';
      s.cols.forEach(function (c) {
        if (c.calc) return;
        h += '<th' + (c.w ? ' style="width:' + c.w + '"' : '') + '>' + esc(c.h || c.k) + '</th>';
      });
      h += '<th style="width:22px"></th></tr></thead><tbody>';
      rows.forEach(function (r, ri) {
        h += '<tr>';
        s.cols.forEach(function (c) {
          if (c.calc) return;
          var val2 = r[c.k] == null ? '' : r[c.k];
          var isNum = c.t === 'num';
          h += '<td><input type="text" class="' + (isNum ? 'num' : '') + '" inputmode="' + (isNum ? 'numeric' : 'text') + '"' +
            ' data-set="' + esc(s.k) + '" data-row="' + ri + '" data-col="' + esc(c.k) + '" value="' + esc(val2) + '"' +
            (c.ph ? ' placeholder="' + esc(c.ph) + '"' : '') + '></td>';
        });
        h += '<td><button type="button" class="del" data-delrow="' + esc(s.k) + '" data-row="' + ri + '" aria-label="행 삭제">✕</button></td>';
        h += '</tr>';
      });
      h += '</tbody></table>';
      h += '<button type="button" class="fm-addrow" data-addrow="' + esc(s.k) + '">+ ' + esc(s.addLabel || '행 추가') + '</button>';
      h += '</div>';
    });
    return h;
  }

  function formHTML(d, def) {
    var h = '', groups = [], order = [];
    (def.fields || []).forEach(function (f) {
      var g = f.g || '기본 정보';
      if (order.indexOf(g) < 0) { order.push(g); groups.push({ g: g, items: [] }); }
      groups[groups.length - 1].items.push(f);
    });
    groups.forEach(function (gr) {
      h += '<div class="fm-group"><h3>' + esc(gr.g) + '</h3><div class="fm-grid">';
      gr.items.forEach(function (f) { h += fieldHTML(f, d); });
      h += '</div></div>';
    });
    if (def.sets) h += setsHTML(def, d);
    return h;
  }

  /* ---------------------------------------------------------
     7. 서명 요청 링크 (URL 페이로드)
  --------------------------------------------------------- */
  var B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
  function utf8Bytes(str) {
    var out = [];
    for (var i = 0; i < str.length; i++) {
      var c = str.charCodeAt(i);
      if (c < 0x80) out.push(c);
      else if (c < 0x800) out.push(0xc0 | (c >> 6), 0x80 | (c & 63));
      else if (c >= 0xd800 && c <= 0xdbff && i + 1 < str.length) {
        var c2 = str.charCodeAt(++i);
        var cp = 0x10000 + ((c - 0xd800) << 10) + (c2 - 0xdc00);
        out.push(0xf0 | (cp >> 18), 0x80 | ((cp >> 12) & 63), 0x80 | ((cp >> 6) & 63), 0x80 | (cp & 63));
      } else out.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 63), 0x80 | (c & 63));
    }
    return out;
  }
  function bytesToUtf8(bytes) {
    var out = '', i = 0;
    while (i < bytes.length) {
      var b = bytes[i++];
      if (b < 0x80) out += String.fromCharCode(b);
      else if (b >= 0xf0) {
        var cp = ((b & 7) << 18) | ((bytes[i++] & 63) << 12) | ((bytes[i++] & 63) << 6) | (bytes[i++] & 63);
        cp -= 0x10000;
        out += String.fromCharCode(0xd800 + (cp >> 10), 0xdc00 + (cp & 1023));
      } else if (b >= 0xe0) {
        out += String.fromCharCode(((b & 15) << 12) | ((bytes[i++] & 63) << 6) | (bytes[i++] & 63));
      } else {
        out += String.fromCharCode(((b & 31) << 6) | (bytes[i++] & 63));
      }
    }
    return out;
  }
  function b64urlEncode(bytes) {
    var out = '', i;
    for (i = 0; i + 2 < bytes.length; i += 3) {
      var n = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];
      out += B64.charAt((n >> 18) & 63) + B64.charAt((n >> 12) & 63) + B64.charAt((n >> 6) & 63) + B64.charAt(n & 63);
    }
    var rem = bytes.length - i;
    if (rem === 1) {
      var n1 = bytes[i] << 16;
      out += B64.charAt((n1 >> 18) & 63) + B64.charAt((n1 >> 12) & 63);
    } else if (rem === 2) {
      var n2 = (bytes[i] << 16) | (bytes[i + 1] << 8);
      out += B64.charAt((n2 >> 18) & 63) + B64.charAt((n2 >> 12) & 63) + B64.charAt((n2 >> 6) & 63);
    }
    return out;
  }
  function b64urlDecode(str) {
    var s = String(str || '').replace(/[^A-Za-z0-9\-_]/g, '');
    var out = [], i = 0;
    while (i < s.length) {
      var c1 = B64.indexOf(s.charAt(i));
      var c2 = (i + 1 < s.length) ? B64.indexOf(s.charAt(i + 1)) : -1;
      var c3 = (i + 2 < s.length) ? B64.indexOf(s.charAt(i + 2)) : -1;
      var c4 = (i + 3 < s.length) ? B64.indexOf(s.charAt(i + 3)) : -1;
      i += 4;
      if (c1 < 0 || c2 < 0) break;
      out.push((c1 << 2) | (c2 >> 4));
      if (c3 >= 0) out.push(((c2 & 15) << 4) | (c3 >> 2));
      if (c4 >= 0) out.push(((c3 & 3) << 6) | c4);
    }
    return out;
  }

  function encodeDoc(d) {
    var def = defOf(d.id);
    if (!def) return '';
    var f = (def.fields || []).map(function (x) { return d.f[x.k] == null ? '' : String(d.f[x.k]); });
    var sets = {};
    (def.sets || []).forEach(function (s) {
      var rows = (d.sets[s.k] || []).map(function (r) {
        return s.cols.map(function (c) {
          if (c.calc) return '';
          return r[c.k] == null ? '' : String(r[c.k]);
        });
      });
      if (rows.length) sets[s.k] = rows;
    });
    var sig = {};
    Object.keys(d.sig).forEach(function (k) {
      var s = d.sig[k];
      if (!s) return;
      if (s.kind === 'stamp') sig[k] = { k: 's', n: s.n, sh: s.sh, st: s.st, cl: s.cl };
      else sig[k] = { k: 'g', p: s.p };
    });
    var payload = { v: 1, t: d.id, f: f, r: sets, s: sig, m: {} };
    var meta = d.meta || {};
    if (meta.author) payload.m.a = meta.author;
    if (meta.createdAt) payload.m.c = meta.createdAt;
    if (meta.id) payload.m.i = meta.id;
    if (meta.signedAt) payload.m.sa = meta.signedAt;
    if (meta.hash) { payload.m.h = meta.hash; payload.m.ha = meta.hashAlgo || ''; }
    if (d.signTo) payload.to = d.signTo;
    return b64urlEncode(utf8Bytes(JSON.stringify(payload)));
  }

  function decodeDoc(str) {
    var json;
    try {
      json = JSON.parse(bytesToUtf8(b64urlDecode(str)));
    } catch (e) { return null; }
    if (!json || !json.t) return null;
    var def = defOf(json.t);
    if (!def) return null;
    var d = newDoc(def);
    (def.fields || []).forEach(function (x, i) {
      if (json.f && json.f[i] != null) d.f[x.k] = String(json.f[i]);
    });
    (def.sets || []).forEach(function (s) {
      var rows = json.r && json.r[s.k];
      if (!rows) return;
      d.sets[s.k] = rows.map(function (arr) {
        var row = {};
        s.cols.forEach(function (c, ci) { row[c.k] = arr[ci] == null ? '' : arr[ci]; });
        return row;
      });
    });
    if (json.s) {
      Object.keys(json.s).forEach(function (k) {
        var s = json.s[k];
        if (!s) return;
        if (s.k === 's') d.sig[k] = { kind: 'stamp', n: s.n, sh: s.sh, st: s.st, cl: s.cl };
        else d.sig[k] = { kind: 'sign', p: s.p };
        var img = sigDataURL(d.sig[k]);
        if (img) d.sig[k].img = img;
      });
    }
    if (json.m) {
      d.meta.author = json.m.a || '';
      d.meta.createdAt = json.m.c || '';
      d.meta.id = json.m.i || d.meta.id;
      d.meta.signedAt = json.m.sa || '';
      d.meta.hash = json.m.h || '';
      d.meta.hashAlgo = json.m.ha || '';
    }
    if (json.to) d.signTo = json.to;
    (def.parties || []).forEach(function (p) {
      if (d.sig[p.k]) d.meta.sigAt[p.k] = d.meta.signedAt || d.meta.createdAt || '';
    });
    return d;
  }

  function canonical(d) {
    var sig = {};
    Object.keys(d.sig).forEach(function (k) {
      var s = d.sig[k];
      if (!s) return;
      sig[k] = s.kind === 'stamp' ? ['s', s.n, s.sh, s.st, s.cl] : ['g', s.p];
    });
    var sets = {};
    Object.keys(d.sets || {}).forEach(function (k) { sets[k] = d.sets[k]; });
    return JSON.stringify({
      t: d.id, f: d.f, r: sets, s: sig,
      a: d.meta.author || '', c: d.meta.createdAt || '', sa: d.meta.signedAt || ''
    });
  }

  function hashText(str) {
    return new Promise(function (resolve) {
      try {
        if (root.crypto && root.crypto.subtle && root.TextEncoder) {
          var buf = new root.TextEncoder().encode(str);
          root.crypto.subtle.digest('SHA-256', buf).then(function (dig) {
            var arr = new Uint8Array(dig), hex = '';
            for (var i = 0; i < arr.length; i++) hex += ('0' + arr[i].toString(16)).slice(-2);
            resolve({ algo: 'SHA-256', hex: hex });
          }).catch(function () { resolve(fnv(str)); });
        } else resolve(fnv(str));
      } catch (e) { resolve(fnv(str)); }
    });
  }
  function fnv(str) {
    var h1 = 0x811c9dc5, h2 = 0x01000193;
    for (var i = 0; i < str.length; i++) {
      var c = str.charCodeAt(i);
      h1 ^= c; h1 = Math.imul ? Math.imul(h1, 16777619) : (h1 * 16777619) | 0;
      h2 = (h2 + c * (i + 7)) | 0;
    }
    var hex = (h1 >>> 0).toString(16) + (h2 >>> 0).toString(16);
    return { algo: 'FNV-1a(간이 체크섬)', hex: hex };
  }
  function shaShort(hex) { return String(hex || '').slice(0, 32); }

  /* ---------------------------------------------------------
     8. 화면 상태 · UI
  --------------------------------------------------------- */
  var IS_DOM = typeof document !== 'undefined';
  var state = { cat: '', sub: 'all', item: '', doc: null, mode: 'edit', query: '', receiver: 'B' };
  var store = {};
  var lastItem = {};
  var els = {};
  var pad = { canvas: null, ctx: null, strokes: [], drawing: false, cur: null };
  var modal = { party: null, tab: 'sign', el: null };
  var toastTimer = null;

  function $(sel, r) { return (r || document).querySelector(sel); }
  function $$(sel, r) { return Array.prototype.slice.call((r || document).querySelectorAll(sel)); }

  function toast(msg) {
    if (!els.toast) return;
    els.toast.textContent = msg;
    els.toast.classList.add('on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { els.toast.classList.remove('on'); }, 2600);
  }

  function persist() {
    if (!IS_DOM || state.mode === 'sign') return;
    clearTimeout(persist.t);
    persist.t = setTimeout(function () {
      try {
        var out = {};
        Object.keys(store).forEach(function (id) {
          var d = store[id];
          var def = defOf(id);
          if (!def) return;
          out[id] = { f: d.f, sets: d.sets, sig: cleanSig(d.sig), meta: d.meta };
        });
        root.localStorage.setItem('ibforms.v1', JSON.stringify(out));
      } catch (e) { /* 저장 공간이 없으면 조용히 넘어갑니다 */ }
    }, 400);
  }
  function cleanSig(sig) {
    var out = {};
    Object.keys(sig || {}).forEach(function (k) {
      var s = sig[k];
      if (!s) return;
      if (s.kind === 'stamp') out[k] = { kind: 'stamp', n: s.n, sh: s.sh, st: s.st, cl: s.cl };
      else out[k] = { kind: 'sign', p: s.p };
    });
    return out;
  }
  function restore() {
    try {
      var raw = root.localStorage.getItem('ibforms.v1');
      if (!raw) return;
      var data = JSON.parse(raw);
      Object.keys(data).forEach(function (id) {
        var def = defOf(id);
        if (!def) return;
        var d = newDoc(def);
        var s = data[id] || {};
        Object.keys(s.f || {}).forEach(function (k) { if (k in d.f || def.kind === 'tool') d.f[k] = s.f[k]; });
        (def.sets || []).forEach(function (set) {
          if (s.sets && s.sets[set.k]) {
            d.sets[set.k] = s.sets[set.k].map(function (r) {
              var row = {};
              set.cols.forEach(function (c) { row[c.k] = r[c.k] == null ? '' : r[c.k]; });
              return row;
            });
          }
        });
        if (s.sig) {
          Object.keys(s.sig).forEach(function (k) {
            var v = s.sig[k];
            d.sig[k] = v.kind === 'stamp'
              ? { kind: 'stamp', n: v.n, sh: v.sh, st: v.st, cl: v.cl }
              : { kind: 'sign', p: v.p };
            var img = sigDataURL(d.sig[k]);
            if (img) d.sig[k].img = img;
          });
        }
        if (s.meta) d.meta = s.meta;
        if (!d.meta.sigAt) d.meta.sigAt = {};
        store[id] = d;
      });
    } catch (e) { /* 손상된 초안은 무시 */ }
  }

  function renderCats() {
    if (!els.cats) return;
    var docs = root.IBF_DOCS || {};
    els.cats.innerHTML = (root.IBF_CATS || []).map(function (c) {
      var n = 0;
      for (var k in docs) if (docs[k] && docs[k].cat === c.id && docs[k].kind !== 'link') n++;
      return '<button type="button" role="tab" data-cat="' + esc(c.id) + '" aria-selected="' + (state.cat === c.id) + '">' +
        '<span class="fm-cat-name">' + esc(c.name) + (n ? '<i>' + n + '</i>' : '') + '</span>' +
        '<span class="fm-cat-sub">' + esc(c.sub) + '</span></button>';
    }).join('');
  }

  function matchItem(def, q) {
    if (!q) return true;
    var hay = (def.name + ' ' + (def.en || '') + ' ' + (def.keywords || '') + ' ' + (def.subName || '')).toLowerCase();
    return hay.indexOf(q) >= 0;
  }

  function itemsOf(catId) {
    var docs = root.IBF_DOCS || {};
    var list = Object.keys(docs).map(function (k) { return docs[k]; }).filter(function (d) { return d.cat === catId; });
    list.sort(function (a, b) { return String(a.no || '').localeCompare(String(b.no || '')); });
    return list;
  }

  /* 무역서식 바로가기 카드(kind:'link')는 서식 수에 넣지 않습니다. */
  function docCount(list) {
    return list.filter(function (d) { return d.kind !== 'link'; }).length;
  }

  function renderItems() {
    if (!els.items) return;
    if (state.query.trim()) { els.items.innerHTML = ''; return; }
    var cat = catOf(state.cat);
    var subs = (cat && cat.subs) || [];
    var html = '';
    if (subs.length) {
      html += '<button type="button" data-sub="all" aria-current="' + (state.sub === 'all') + '">전체 <i>' + docCount(itemsOf(state.cat)) + '</i></button>';
      subs.forEach(function (s) {
        var n = docCount(itemsOf(state.cat).filter(function (d) { return d.sub === s.id; }));
        if (!n) return;
        html += '<button type="button" data-sub="' + esc(s.id) + '" aria-current="' + (state.sub === s.id) + '">' +
          esc(s.name) + ' <i>' + n + '</i></button>';
      });
    }
    els.items.innerHTML = html;
  }

  function renderDocItems() {
    if (!els.docItems) return;
    var q = state.query.trim().toLowerCase();
    var list, html = '';
    if (q) {
      var docs = root.IBF_DOCS || {};
      list = Object.keys(docs).map(function (k) { return docs[k]; }).filter(function (d) { return matchItem(d, q); });
      html += '<span class="fm-items-lb">검색 ' + list.length + '건</span>';
      html += list.map(function (d) {
        return cardHTML(d);
      }).join('');
      if (!list.length) html += '<span class="fm-items-empty">일치하는 서식이 없습니다. 다른 낱말로 찾아보세요.</span>';
      els.docItems.innerHTML = html;
      return;
    }
    list = itemsOf(state.cat).filter(function (d) { return state.sub === 'all' || d.sub === state.sub; });
    if (!list.length) { els.docItems.innerHTML = '<span class="fm-items-empty">이 분류에 서식이 없습니다.</span>'; return; }
    els.docItems.innerHTML = '<span class="fm-items-lb">' + esc(catName(state.cat)) + ' · ' + docCount(list) + '종</span>' +
      list.map(cardHTML).join('');
  }

  function catName(id) {
    var c = catOf(id);
    return c ? c.no + ' ' + c.name : '';
  }
  function subName(def) {
    var c = catOf(def.cat);
    var s = null;
    ((c && c.subs) || []).forEach(function (x) { if (x.id === def.sub) s = x; });
    return s ? s.name : (c ? c.name : '');
  }
  function cardHTML(def) {
    if (def.kind === 'link') {
      return '<a class="fm-card2 fm-card2-link" href="' + esc(def.href) + '">' +
        '<span class="th">' + thumbSVG(def) + '</span>' +
        '<span class="cap"><span class="ct">' + esc(subName(def)) + '</span>' +
        '<b>' + esc(def.name) + '</b><span class="mt">⑤ 무역서식 · ' + esc(def.en || '') + '</span></span>' +
        '<span class="go">무역서식에서 열기 →</span></a>';
    }
    var kindLb = def.kind === 'excel' ? '자동 합계 · CSV' : def.kind === 'slides' ? '16:9 슬라이드 · PDF'
      : def.kind === 'tool' ? '도장·서명 도구' : (def.parties || []).length ? '전자서명 · A4 PDF' : 'A4 PDF';
    return '<button type="button" class="fm-card2' + (state.item === def.id ? ' on' : '') + '" data-item="' + esc(def.id) + '" aria-current="' + (state.item === def.id) + '">' +
      '<span class="th">' + thumbSVG(def) + '</span>' +
      '<span class="cap"><span class="ct">' + esc(subName(def)) + '</span>' +
      '<b>' + esc(def.name) + '</b><span class="mt">' + esc(kindLb) + '</span></span>' +
      '<span class="go">바로 편집하기 →</span></button>';
  }

  /* 서식 카드용 A4 미니 미리보기 (자체 제작 SVG) */
  function thumbSVG(def) {
    var t = def.thumb || (def.kind === 'excel' ? 'grid' : def.kind === 'slides' ? 'slide' : def.kind === 'tool' ? 'tool' : (def.tpl || 'doc'));
    var name = String(def.name || '').replace(/\s*\([^)]*\)\s*/g, ' ').trim();
    if (name.length > 15) name = name.slice(0, 14) + '…';
    var ink = '#23262b', soft = '#d9dce2', mid = '#9aa0a8', acc = '#b3261e';
    var s = '<svg viewBox="0 0 100 141" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
      '<rect x="0" y="0" width="100" height="141" fill="#fff"/>';
    function L(x, y, w, h, f, r) { return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + (h || 1.4) + '" rx="' + (r == null ? .6 : r) + '" fill="' + f + '"/>'; }
    function T(x, y, size, txt, w2, anchor, fill) {
      return '<text x="' + x + '" y="' + y + '" font-size="' + size + '" font-family="Helvetica,Arial,sans-serif"' +
        (w2 ? ' font-weight="' + w2 + '"' : '') + ' text-anchor="' + (anchor || 'start') + '" fill="' + (fill || ink) + '">' + esc(txt) + '</text>';
    }
    function title(y) { return T(50, y || 22, 6, name, 700, 'middle'); }
    function subline(y) { return L(30, y, 40, 1, mid); }
    function lines(y, n, w) {
      var o = '';
      for (var i = 0; i < n; i++) o += L(12, y + i * 5.4, (w || 76) * (i === n - 1 ? .62 : 1), 1.3, soft);
      return o;
    }
    if (t === 'grid') {
      var ncol = Math.max(4, Math.min(8, (def.table && def.table.cols ? def.table.cols.length : 6)));
      var cw = 84 / ncol;
      s += L(8, 10, 84, 4, ink, 1);
      s += L(8, 17, 46, 2, mid);
      for (var r = 0; r < 10; r++) {
        s += L(8, 23 + r * 9.4, 84, 8, r === 0 ? '#eceef2' : (r % 2 ? '#fafbfc' : '#fff'), 0);
        s += '<rect x="8" y="' + (23 + r * 9.4) + '" width="84" height="8" fill="none" stroke="#e3e6ea" stroke-width=".4"/>';
        for (var c = 1; c < ncol; c++) s += '<line x1="' + (8 + c * cw) + '" y1="' + (23 + r * 9.4) + '" x2="' + (8 + c * cw) + '" y2="' + (31 + r * 9.4) + '" stroke="#e8eaee" stroke-width=".4"/>';
        if (r > 0) for (var c2 = 1; c2 < ncol; c2++) s += L(8 + c2 * cw + 2, 26.5 + r * 9.4, Math.min(7, cw - 4), 1.4, '#c9ced6');
      }
      if (def.summary && def.summary.length) {
        var nb = Math.min(4, def.summary.length), bw = 84 / nb;
        s += L(8, 121, 84, 10, '#f2f4f7', 0);
        for (var kk = 0; kk < nb; kk++) {
          s += '<line x1="' + (8 + kk * bw) + '" y1="121" x2="' + (8 + kk * bw) + '" y2="131" stroke="#e3e6ea" stroke-width=".4"/>';
          s += L(11 + kk * bw, 124, Math.min(12, bw - 5), 1.4, '#b9bcc2');
          s += L(11 + kk * bw, 127.5, Math.min(8, bw - 7), 2, kk === nb - 1 ? acc : ink);
        }
      } else {
        s += L(8, 118, 84, 4, ink, 0);
      }
    } else if (t === 'slide') {
      s += L(6, 8, 88, 54, ink, 1);
      s += T(12, 22, 4, 'INSIGHT BRIEF', 700, 'start', '#e7a49b');
      s += T(12, 34, 8.4, name.slice(0, 11), 800, 'start', '#fff');
      s += L(12, 41, 34, 1.6, '#fff');
      s += L(12, 48, 52, 1.4, 'rgba(255,255,255,.45)');
      for (var i2 = 0; i2 < 3; i2++) {
        s += L(6 + i2 * 30, 68, 26, 26, i2 === 0 ? '#f2f4f7' : '#fafbfc', 1);
        s += '<rect x="' + (6 + i2 * 30) + '" y="68" width="26" height="26" fill="none" stroke="#e3e6ea" stroke-width=".5"/>';
        s += L(9 + i2 * 30, 72, 20, 1.6, acc);
        s += L(9 + i2 * 30, 77, 18, 1.2, soft); s += L(9 + i2 * 30, 81, 14, 1.2, soft);
      }
      s += L(6, 100, 88, 30, '#f7f8fa', 1);
      s += L(10, 105, 30, 2, mid); s += L(10, 111, 60, 1.3, soft); s += L(10, 116, 54, 1.3, soft);
    } else if (t === 'tool') {
      s += title(24); s += subline(29);
      s += '<circle cx="50" cy="72" r="25" fill="none" stroke="' + acc + '" stroke-width="2.4"/>';
      s += '<circle cx="50" cy="72" r="19" fill="none" stroke="' + acc + '" stroke-width=".8"/>';
      s += T(50, 74, 9, '직인', 700, 'middle', acc);
      s += L(22, 104, 56, 1.3, soft); s += L(22, 109, 40, 1.3, soft);
    } else if (t === 'bl' || t === 'si') {
      s += '<rect x="6" y="8" width="88" height="125" fill="none" stroke="' + ink + '" stroke-width="1.2"/>';
      s += T(9, 16, 4.6, t === 'bl' ? 'BILL OF LADING' : 'SHIPPING INSTRUCTION', 700);
      s += T(91, 16, 3.6, 'B/L No.', 400, 'end', mid);
      s += '<line x1="6" y1="19" x2="94" y2="19" stroke="' + ink + '" stroke-width=".9"/>';
      s += '<line x1="58" y1="19" x2="58" y2="57" stroke="' + ink + '" stroke-width=".7"/>';
      for (var b = 0; b < 3; b++) {
        s += L(9, 23 + b * 13, 12, 1.4, mid);
        s += L(9, 27 + b * 13, 42, 1.2, soft); s += L(9, 30 + b * 13, 38, 1.2, soft); s += L(9, 33 + b * 13, 30, 1.2, soft);
      }
      for (var q = 0; q < 5; q++) {
        s += L(61, 23 + q * 7, 13, 1.3, mid); s += L(61, 26.5 + q * 7, 28, 1.2, soft);
      }
      s += '<line x1="6" y1="57" x2="94" y2="57" stroke="' + ink + '" stroke-width=".9"/>';
      var ws = [16, 15, 13, 28, 12];
      var x0 = 6;
      for (var w2 = 0; w2 < ws.length; w2++) { s += '<line x1="' + (x0 + ws[w2]) + '" y1="57" x2="' + (x0 + ws[w2]) + '" y2="96" stroke="' + ink + '" stroke-width=".7"/>'; x0 += ws[w2]; }
      s += L(9, 61, 10, 1.3, mid); s += L(30, 61, 20, 1.3, mid); s += L(62, 61, 20, 1.3, mid);
      for (var rr = 0; rr < 5; rr++) s += L(9, 68 + rr * 5.2, 76, 1.2, soft);
      s += '<line x1="6" y1="96" x2="94" y2="96" stroke="' + ink + '" stroke-width=".9"/>';
      s += L(9, 100, 16, 1.3, mid); s += L(9, 104, 30, 1.2, soft); s += L(9, 108, 26, 1.2, soft); s += L(9, 112, 20, 1.2, soft);
      s += L(9, 120, 76, 1.1, soft); s += L(9, 124, 64, 1.1, soft);
      s += T(50, 62, 5.4, 'ORIGINAL', 700, 'middle', 'rgba(179,38,30,.28)');
    } else if (t === 'cert') {
      s += '<rect x="8" y="10" width="84" height="121" fill="none" stroke="' + ink + '" stroke-width=".9"/>';
      s += '<rect x="11" y="13" width="78" height="115" fill="none" stroke="' + soft + '" stroke-width=".5"/>';
      s += title(30); s += subline(35);
      for (var k = 0; k < 6; k++) { s += L(18, 46 + k * 9, 18, 1.4, mid); s += L(40, 46 + k * 9, 40, 1.4, soft); }
      s += '<circle cx="72" cy="112" r="10" fill="none" stroke="' + acc + '" stroke-width="1.6"/>';
      s += T(72, 114, 5, '직인', 700, 'middle', acc);
    } else if (t === 'plan') {
      s += T(10, 20, 7, name.slice(0, 12), 800);
      s += L(10, 24, 26, 1.6, acc);
      for (var p = 0; p < 4; p++) {
        s += L(10, 34 + p * 24, 12, 2, ink);
        s += L(10, 39 + p * 24, 80, 1.2, soft); s += L(10, 43 + p * 24, 74, 1.2, soft); s += L(10, 47 + p * 24, 60, 1.2, soft);
      }
    } else if (t === 'gantt') {
      s += title(20); s += subline(25);
      for (var g = 0; g < 12; g++) s += '<line x1="' + (16 + g * 6) + '" y1="32" x2="' + (16 + g * 6) + '" y2="108" stroke="#e9ebef" stroke-width=".5"/>';
      var bars = [[2, 4], [4, 3], [6, 5], [8, 3], [10, 2]];
      for (var bi = 0; bi < bars.length; bi++) {
        s += L(12, 36 + bi * 12, 78, 1.2, soft);
        s += L(16 + bars[bi][0] * 6, 40 + bi * 12, bars[bi][1] * 6, 6, bi % 2 ? '#4a5058' : ink, 1.4);
      }
    } else if (t === 'org') {
      s += title(20); s += subline(25);
      s += L(38, 34, 24, 10, ink, 1.4);
      s += '<line x1="50" y1="44" x2="50" y2="56" stroke="' + mid + '" stroke-width=".8"/>';
      s += '<line x1="50" y1="56" x2="22" y2="56" stroke="' + mid + '" stroke-width=".8"/><line x1="50" y1="56" x2="78" y2="56" stroke="' + mid + '" stroke-width=".8"/>';
      s += '<line x1="22" y1="56" x2="22" y2="66" stroke="' + mid + '" stroke-width=".8"/><line x1="78" y1="56" x2="78" y2="66" stroke="' + mid + '" stroke-width=".8"/>';
      s += L(10, 66, 24, 9, '#eceef2', 1); s += L(66, 66, 24, 9, '#eceef2', 1);
      for (var org = 0; org < 3; org++) s += L(10 + org * 28, 84, 24, 9, '#f6f7f9', 1);
      s += L(10, 100, 80, 1.2, soft); s += L(10, 104, 66, 1.2, soft);
    } else if (t === 'card') {
      s += '<rect x="8" y="10" width="84" height="121" fill="#fdfcf8" stroke="' + acc + '" stroke-width=".9"/>';
      s += '<rect x="13" y="15" width="74" height="111" fill="none" stroke="#e6dcd2" stroke-width=".5"/>';
      s += T(50, 34, 4.4, 'THANK YOU · CONGRATULATIONS', 400, 'middle', mid);
      s += title(56);
      s += L(30, 66, 40, 1.4, soft); s += L(26, 72, 48, 1.4, soft); s += L(30, 78, 40, 1.4, soft); s += L(34, 84, 32, 1.4, soft);
      s += L(60, 104, 24, 2, acc);
      s += T(50, 116, 3.8, 'INSIGHT BRIEF CARD', 400, 'middle', mid);
    } else if (t === 'resume') {
      s += L(8, 10, 26, 121, '#f2f4f7', 0);
      s += '<circle cx="21" cy="26" r="8" fill="#e2e5ea"/>';
      s += L(13, 40, 16, 1.6, ink); s += L(13, 46, 12, 1.2, soft); s += L(13, 50, 14, 1.2, soft);
      s += L(13, 60, 14, 1.4, mid); s += L(13, 65, 16, 1.2, soft); s += L(13, 69, 12, 1.2, soft); s += L(13, 73, 15, 1.2, soft);
      s += L(13, 83, 14, 1.4, mid); s += L(13, 88, 16, 1.2, soft); s += L(13, 92, 13, 1.2, soft);
      s += L(13, 102, 14, 1.4, mid); s += L(13, 107, 15, 1.2, soft); s += L(13, 111, 12, 1.2, soft);
      s += T(40, 20, 6.6, name.slice(0, 12), 800);
      s += L(40, 24, 30, 1.4, acc);
      for (var rb = 0; rb < 3; rb++) {
        s += L(40, 34 + rb * 28, 20, 1.8, ink);
        s += L(40, 39 + rb * 28, 48, 1.2, soft); s += L(40, 43 + rb * 28, 44, 1.2, soft); s += L(40, 47 + rb * 28, 38, 1.2, soft);
      }
    } else if (t === 'invoice') {
      s += T(10, 19, 6.4, name.slice(0, 13), 800);
      s += L(10, 23, 22, 1.4, acc);
      s += L(64, 14, 26, 1.4, soft); s += L(64, 18, 20, 1.4, soft); s += L(64, 22, 24, 1.4, soft);
      for (var ir = 0; ir < 6; ir++) s += L(10, 34 + ir * 9, 80, 1.3, soft);
      s += L(52, 92, 38, 1.4, ink); s += L(52, 97, 30, 1.4, soft); s += L(52, 102, 26, 1.4, soft);
      s += L(52, 108, 38, 5, ink, 0);
    } else if (t === 'check') {
      s += title(20); s += subline(25);
      for (var ch = 0; ch < 7; ch++) {
        s += '<rect x="12" y="' + (34 + ch * 11) + '" width="6" height="6" fill="none" stroke="' + mid + '" stroke-width=".7"/>';
        if (ch < 4) s += '<path d="M13 37 l1.6 1.8 l2.6 -3" fill="none" stroke="' + acc + '" stroke-width="1"/>';
        s += L(22, 35 + ch * 11, 58 + (ch % 3) * 4, 1.4, soft);
      }
      s += L(12, 116, 30, 1.2, soft);
    } else {
      s += title(22); s += subline(27);
      s += lines(36, 9);
      s += L(12, 92, 24, 1.4, ink); s += L(12, 96, 16, 1.2, soft);
      s += L(58, 118, 30, 1.2, mid); s += L(58, 122, 22, 1.2, soft);
    }
    return s + '</svg>';
  }

  function renderToolbar() {
    if (!els.actions) return;
    var def = defOf(state.item);
    var h = '';
    if (!def) { els.actions.innerHTML = ''; return; }
    if (def.kind === 'excel') {
      h += '<button type="button" class="fm-btn" data-act="csv">엑셀 CSV 다운로드</button>';
      h += '<button type="button" class="fm-btn ghost" data-act="print-wide">A4 가로 인쇄</button>';
    } else if (def.kind === 'slides') {
      h += '<button type="button" class="fm-btn" data-act="print-slides">슬라이드 PDF 저장</button>';
      h += '<button type="button" class="fm-btn ghost" data-act="print-slides">인쇄</button>';
    } else if (def.kind === 'tool') {
      if (def.tool === 'stamp') h += '<button type="button" class="fm-btn" data-act="png">투명 PNG 다운로드</button>';
      if (def.tool === 'signature') h += '<button type="button" class="fm-btn" data-act="png">서명 PNG 다운로드</button>';
    } else {
      h += '<button type="button" class="fm-btn" data-act="print">A4 PDF 인쇄/저장</button>';
      if ((def.parties || []).length >= 2 && state.mode !== 'sign') {
        h += '<button type="button" class="fm-btn ghost" data-act="link">서명 요청 링크</button>';
      }
    }
    els.actions.innerHTML = h;
  }

  function renderSideNote() {
    if (!els.sideNote) return;
    var def = defOf(state.item);
    els.sideNote.textContent = def ? (def.kind === 'excel' ? '자동 합계 · CSV' : def.kind === 'slides' ? '16:9 · PDF' : def.kind === 'tool' ? '도장 · 서명' : '입력하면 바로 반영') : '';
  }

  function renderSideTitle() {
    if (!els.sideTitle) return;
    var def = defOf(state.item);
    els.sideTitle.innerHTML = def ? '<em>' + esc(def.no || '') + '</em>' + esc(def.name) : '';
  }

  function renderForm() {
    if (!els.form) return;
    var def = defOf(state.item);
    if (!def) return;
    if (state.mode === 'sign') { els.form.innerHTML = signPanelHTML(def, state.doc); return; }
    if (def.kind === 'tool') { els.form.innerHTML = toolFormHTML(state.doc, def); return; }
    els.form.innerHTML = formHTML(state.doc, def);
    updateCounts();
  }

  function updateCounts() {
    $$('.cnt[data-cnt]').forEach(function (el) {
      var k = el.getAttribute('data-cnt');
      var v = String(state.doc.f[k] == null ? '' : state.doc.f[k]);
      var n = v.length;
      var noSpace = v.replace(/\s/g, '').length;
      var limit = Number(el.getAttribute('data-limit')) || 0;
      el.textContent = '공백 포함 ' + n + '자 · 제외 ' + noSpace + '자' + (limit ? ' / 권장 ' + limit + '자' : '');
      el.className = 'cnt' + (limit && noSpace > limit ? ' over' : '');
    });
  }

  function renderStage() {
    if (!els.stage) return;
    var def = defOf(state.item);
    if (!def) return;
    if (def.kind === 'tool') {
      els.stage.innerHTML = toolStageHTML(state.doc, def);
      bindToolStage(def);
      return;
    }
    els.stage.innerHTML = stageHTML(state.doc, def);
    els.stage.classList.toggle('has-tdoc', !!els.stage.querySelector('.fm-tdoc'));
    if (def.kind === 'slides' && els.docLabel) els.docLabel.textContent = 'SLIDE 16:9 · ' + (def.slides || []).length + '장';
  }

  function refresh() {
    renderSideTitle(); renderSideNote(); renderForm(); renderStage(); renderToolbar(); updateSignStatus();
    var def = defOf(state.item);
    if (els.docLabel && def) {
      els.docLabel.textContent = def.kind === 'excel' ? '엑셀 표 · CSV 저장 · A4 가로 인쇄'
        : def.kind === 'slides' ? '16:9 슬라이드 · ' + (def.slides || []).length + '장 · PDF 저장'
        : def.kind === 'tool' ? '도구 · 브라우저에서만 생성'
        : 'A4 문서 · 서명란을 누르면 서명·도장';
    }
  }

  function switchItem(id, noScroll) {
    if (!defOf(id)) return;
    if (state.doc) store[state.item] = state.doc;
    state.item = id;
    var def = defOf(id);
    state.cat = def.cat;
    if (state.sub !== 'all' && state.sub !== def.sub) state.sub = 'all';
    lastItem[def.cat] = id;
    state.doc = store[id] || newDoc(def);
    store[id] = state.doc;
    state.query = '';
    if (els.search) els.search.value = '';
    if (els.linkbox) els.linkbox.hidden = true;
    var donebox = document.getElementById('fm-donebox');
    if (donebox) donebox.hidden = true;
    renderCats(); renderItems(); renderDocItems(); refresh();
    try {
      history.replaceState(null, '', '#' + state.cat + '/' + id);
    } catch (e) { }
    if (!noScroll && els.work && els.work.scrollIntoView) els.work.scrollIntoView({ block: 'nearest' });
  }

  function switchCat(cid) {
    if (!catOf(cid)) return;
    state.cat = cid;
    state.query = '';
    if (els.search) els.search.value = '';
    /* 무역서식 바로가기 카드(kind:'link')는 편집 대상이 아니므로 첫 서식에서 제외합니다. */
    var firstDoc = itemsOf(cid).filter(function (d) { return d.kind !== 'link'; })[0];
    var target = lastItem[cid] || (firstDoc || {}).id;
    if (!target) return;
    /* 카테고리를 바꿀 때는 서식 카드 목록을 보여 주고, 편집 화면으로 내려가지 않습니다. */
    switchItem(target, true);
    var w2 = els.itemsWrap;
    if (w2 && w2.scrollIntoView) {
      var r2 = w2.getBoundingClientRect();
      if (r2.top > 160 || r2.bottom < 40) w2.scrollIntoView({ block: 'start', behavior: 'smooth' });
    }
  }

  /* ---------------------------------------------------------
     9. 서명 모달
  --------------------------------------------------------- */
  function openModal(party, tab) {
    if (!IS_DOM) return;
    var def = defOf(state.item);
    if (!def) return;
    if (state.mode === 'sign' && party !== state.receiver) {
      toast('작성자가 이미 서명한 자리입니다. ' + receiverLabel(def) + ' 서명란에 서명해 주세요.');
      return;
    }
    modal.party = party;
    modal.tab = tab || 'sign';
    var p = partyOf(def, party);
    $('#fm-modal-target').textContent = (p ? p.label : '') + ' 서명란';
    $$('[data-mtab]').forEach(function (b) {
      b.setAttribute('aria-selected', String(b.getAttribute('data-mtab') === modal.tab));
    });
    $$('[data-mpanel]').forEach(function (pn) {
      pn.hidden = pn.getAttribute('data-mpanel') !== modal.tab;
    });
    var sn = $('#fm-stamp-name');
    if (sn) {
      var nm = p && p.nameKey ? text(p.nameKey, state.doc) : '';
      sn.value = nm || (state.doc.f.name || state.doc.f.company || '홍길동');
      drawStampPreview();
    }
    if (modal.tab === 'sign') { clearPad(); resizePad(); }
    els.modal.hidden = false;
    document.body.style.overflow = 'hidden';
    setTimeout(function () {
      var first = modal.tab === 'sign' ? $('#fm-pad') : $('#fm-stamp-name');
      if (first && first.focus) first.focus({ preventScroll: true });
    }, 30);
  }
  function closeModal() {
    els.modal.hidden = true;
    document.body.style.overflow = '';
    modal.party = null;
  }

  function resizePad() {
    if (!pad.canvas) return;
    var ctx = pad.canvas.getContext('2d');
    ctx.lineWidth = 3.4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#16224a';
  }

  function padPos(e) {
    var r = pad.canvas.getBoundingClientRect();
    var x = (e.clientX - r.left) * (pad.canvas.width / r.width);
    var y = (e.clientY - r.top) * (pad.canvas.height / r.height);
    return [Math.max(0, Math.min(PAD_W, x)), Math.max(0, Math.min(PAD_H, y))];
  }
  var PAD_W = 960, PAD_H = 300;

  function padStart(e) {
    if (pad.drawing) return;
    e.preventDefault();
    pad.drawing = true;
    pad.cur = [padPos(e)];
    pad.strokes.push(pad.cur);
    if (pad.canvas.setPointerCapture) {
      try { pad.canvas.setPointerCapture(e.pointerId); } catch (err) { }
    }
    padDraw();
  }
  function padMove(e) {
    if (!pad.drawing) return;
    e.preventDefault();
    var p = padPos(e);
    var last = pad.cur[pad.cur.length - 1];
    var dx = p[0] - last[0], dy = p[1] - last[1];
    if (dx * dx + dy * dy < 4) return;
    pad.cur.push(p);
    padDraw();
  }
  function padEnd() {
    if (!pad.drawing) return;
    pad.drawing = false;
    pad.cur = null;
  }
  function padDraw() {
    var ctx = pad.canvas.getContext('2d');
    ctx.clearRect(0, 0, pad.canvas.width, pad.canvas.height);
    drawStrokePath(ctx, pad.strokes, 0, 0, 1, 3.4, '#16224a');
  }
  function clearPad() {
    pad.strokes = [];
    pad.cur = null;
    if (pad.canvas) pad.canvas.getContext('2d').clearRect(0, 0, pad.canvas.width, pad.canvas.height);
  }

  function drawStampPreview() {
    var c = $('#fm-stamp-canvas');
    if (!c) return;
    var opt = {
      name: $('#fm-stamp-name').value || '홍길동',
      shape: $('#fm-stamp-shape').value,
      style: $('#fm-stamp-style').value,
      color: $('#fm-stamp-color').value
    };
    drawStamp(c.getContext('2d'), c.width, opt);
  }

  function applySignature() {
    if (!modal.party) return;
    if (!pad.strokes.length) { toast('서명을 먼저 그려 주세요.'); return; }
    var str = strokesToString(pad.strokes);
    var img = strokesToDataURL(str);
    var d = state.doc;
    d.sig[modal.party] = { kind: 'sign', p: str, img: img };
    d.meta.sigAt = d.meta.sigAt || {};
    d.meta.sigAt[modal.party] = nowStamp();
    if (!d.meta.author && modal.party === 'A') {
      var def = defOf(d.id);
      var pa = partyOf(def, 'A');
      if (pa && pa.nameKey) d.meta.author = text(pa.nameKey, d);
      d.meta.createdAt = d.meta.createdAt || nowStamp();
    }
    clearPad();
    closeModal();
    renderStage(); renderToolbar(); updateSignStatus();
    if (state.mode === 'sign') renderForm();
    persist();
    toast('서명을 넣었습니다. 서명란을 눌러 다시 바꿀 수 있습니다.');
  }
  function applyStamp() {
    if (!modal.party) return;
    var opt = {
      name: $('#fm-stamp-name').value.trim() || '홍길동',
      shape: $('#fm-stamp-shape').value,
      style: $('#fm-stamp-style').value,
      color: $('#fm-stamp-color').value
    };
    var img = stampToDataURL(opt);
    var d = state.doc;
    d.sig[modal.party] = { kind: 'stamp', n: opt.name, sh: opt.shape, st: opt.style, cl: opt.color, img: img };
    d.meta.sigAt = d.meta.sigAt || {};
    d.meta.sigAt[modal.party] = nowStamp();
    if (!d.meta.author && modal.party === 'A') {
      var def = defOf(d.id);
      var pa = partyOf(def, 'A');
      if (pa && pa.nameKey) d.meta.author = text(pa.nameKey, d);
      d.meta.createdAt = d.meta.createdAt || nowStamp();
    }
    closeModal();
    renderStage(); renderToolbar(); updateSignStatus();
    if (state.mode === 'sign') renderForm();
    persist();
    toast('도장을 날인했습니다.');
  }

  function updateSignStatus() {
    if (!els.signStatus) return;
    var def = defOf(state.item);
    if (!def || !def.parties || !def.parties.length) { els.signStatus.innerHTML = ''; return; }
    var done = def.parties.filter(function (p) { return !!state.doc.sig[p.k]; }).length;
    var canLink = def.parties.length >= 2;
    var hint = state.doc.meta.signedAt ? '최종 서명 ' + esc(state.doc.meta.signedAt)
      : !canLink ? '이 서식은 서명 요청 링크를 쓰지 않습니다'
      : state.doc.sig['A'] ? '서명 요청 링크를 만들 수 있습니다'
      : '작성자(갑) 서명 후 링크를 만들 수 있습니다';
    els.signStatus.innerHTML = '<span>' + done + ' / ' + def.parties.length + ' 서명 완료</span><span>' + hint + '</span>';
  }

  /* ---------------------------------------------------------
     10. 서명 요청 링크 · 최종 서명
  --------------------------------------------------------- */
  function baseURL() {
    return location.origin + location.pathname;
  }
  function buildLink(d) {
    return baseURL() + '?sign=' + encodeDoc(d);
  }

  function copyText(txt) {
    return new Promise(function (resolve, reject) {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(txt).then(resolve).catch(function () { legacyCopy(txt, resolve, reject); });
      } else legacyCopy(txt, resolve, reject);
    });
  }
  function legacyCopy(txt, resolve, reject) {
    try {
      var ta = document.createElement('textarea');
      ta.value = txt;
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      var ok = document.execCommand('copy');
      document.body.removeChild(ta);
      ok ? resolve() : reject(new Error('copy'));
    } catch (e) { reject(e); }
  }

  function makeLink() {
    var d = state.doc, def = defOf(d.id);
    if (!def.parties || def.parties.length < 2) { toast('이 서식은 서명 요청 링크를 지원하지 않습니다.'); return; }
    if (!d.sig['A']) {
      toast('먼저 ' + partyOf(def, 'A').label + ' 서명란에 서명하거나 도장을 넣어 주세요.');
      openModal('A', 'sign');
      return;
    }
    if (!d.meta.author) {
      var pa = partyOf(def, 'A');
      d.meta.author = pa && pa.nameKey ? text(pa.nameKey, d) : '';
    }
    d.meta.createdAt = d.meta.createdAt || nowStamp();
    d.signTo = 'B';
    var url = buildLink(d);
    showLink(url, def);
    persist();
  }

  function showLink(url, def) {
    var box = $('#fm-linkbox');
    if (!box) return;
    box.hidden = false;
    $('#fm-link-url').textContent = url;
    $('#fm-link-size').textContent = (Math.round(url.length / 100) / 10) + 'KB · ' + url.length + '자';
    var open = $('#fm-link-open');
    if (open) open.href = url;
    els.lastLink = url;
    toast('서명 요청 링크를 만들었습니다. 복사해서 상대방에게 보내세요.');
  }

  function receiverParty(def) {
    return (def.parties || [])[1] || (def.parties || [])[0];
  }
  function receiverLabel(def) {
    var p = receiverParty(def);
    return p ? p.label : '수신자';
  }

  function signPanelHTML(def, d) {
    var rp = receiverParty(def);
    var author = d.meta.author || '작성자';
    var nameKey = rp && rp.nameKey;
    var h = '';
    h += '<div class="fm-sgroup"><h3>서명 요청</h3>' +
      '<div class="fm-sline"><span>보낸 사람</span><b>' + esc(author) + '</b></div>' +
      '<div class="fm-sline"><span>문서</span><b>' + esc(def.name) + '</b></div>' +
      '<div class="fm-sline"><span>요청 시각</span><b>' + esc(d.meta.createdAt || '—') + '</b></div>' +
      '</div>';
    h += '<div class="fm-sgroup"><h3>내 정보</h3><div class="fm-grid">';
    if (nameKey) {
      h += '<div class="fm-field span2"><div class="lbl"><span>' + esc(rp.label) + ' 성명</span></div>' +
        '<input type="text" data-f="' + esc(nameKey) + '" value="' + esc(d.f[nameKey] || '') + '"></div>';
    }
    h += '</div></div>';
    h += '<div class="fm-sgroup"><h3>' + esc(rp ? rp.label : '수신자') + ' 서명</h3>' +
      '<p class="fm-shelp">문서 내용을 확인한 뒤 아래에서 손글씨로 서명하거나 도장을 만들어 날인하세요.</p>' +
      '<div class="fm-sbtns">' +
      '<button type="button" data-sign-act="sign">손글씨 서명</button>' +
      '<button type="button" data-sign-act="stamp">도장 만들기</button>' +
      '</div>' +
      (d.sig[rp.k] ? '<div class="fm-sdone">✓ ' + esc(rp.label) + ' 서명 완료 · ' + esc((d.meta.sigAt && d.meta.sigAt[rp.k]) || '') + '</div>' : '') +
      '</div>';
    h += '<div class="fm-sgroup"><h3>마무리</h3>' +
      '<div class="fm-sbtns">' +
      '<button type="button" class="pri" data-sign-act="final">서명 완료 · 최종본 만들기</button>' +
      '</div>' +
      '<p class="fm-shelp">최종본에는 양쪽 서명, 서명 시각, 문서 해시가 함께 표시됩니다. PDF로 저장해 서로 보관하세요.</p>' +
      (d.meta.signedAt ? '<div class="fm-sdone">✓ 최종 서명 완료 · ' + esc(d.meta.signedAt) + '</div>' : '') +
      '</div>';
    h += '<div class="fm-sgroup"><h3>원본 보기</h3><p class="fm-shelp">문서 내용은 오른쪽에서 그대로 확인할 수 있습니다. 내용을 고쳐야 한다면 작성자에게 새 링크를 요청하세요.</p></div>';
    return h;
  }

  function finalizeSign() {
    var def = defOf(state.doc.id);
    var rp = receiverParty(def);
    if (!state.doc.sig[rp.k]) {
      toast('먼저 ' + rp.label + ' 서명란에 서명하거나 도장을 넣어 주세요.');
      return;
    }
    var d = state.doc;
    d.meta.signedAt = nowStamp();
    var txt = canonical(d);
    hashText(txt).then(function (res) {
      d.meta.hash = shaShort(res.hex);
      d.meta.hashAlgo = res.algo;
      renderStage();
      var box = $('#fm-donebox');
      if (box) {
        box.hidden = false;
        $('#fm-done-link').value = buildLink(d);
        box.scrollIntoView({ block: 'nearest' });
      }
      if (els.signStatus) updateSignStatus();
      toast('서명이 완료되었습니다. 최종 서명본 링크를 복사해 보내세요.');
    });
  }

  /* ---------------------------------------------------------
     11. 인쇄 · CSV · PNG
  --------------------------------------------------------- */
  function printSheet(el, opt) {
    if (!el || !IS_DOM) return;
    var o = opt || {};
    var copy = el.cloneNode(true);
    copy.removeAttribute('id');
    copy.classList.remove('fm-noprint');
    copy.classList.add('fm-print-iso');
    document.body.appendChild(copy);

    var style = document.createElement('style');
    style.id = 'fm-print-page';
    if (o.wide) style.textContent = '@media print{@page{size:A4 landscape;margin:10mm}}';
    if (o.slides) style.textContent = '@media print{@page{size:280mm 157.5mm;margin:0} body{margin:0}}';
    if (style.textContent) document.head.appendChild(style);
    if (o.wide) document.documentElement.classList.add('fm-print-wide');
    if (o.slides) document.documentElement.classList.add('fm-print-slides');
    document.documentElement.classList.add('fm-printing');

    var cleaning = false;
    function done() {
      if (cleaning) return;
      cleaning = true;
      document.documentElement.classList.remove('fm-printing');
      document.documentElement.classList.remove('fm-print-wide');
      document.documentElement.classList.remove('fm-print-slides');
      if (copy.parentNode) copy.parentNode.removeChild(copy);
      if (style.parentNode) style.parentNode.removeChild(style);
      root.removeEventListener('afterprint', done);
    }
    root.addEventListener('afterprint', done);
    setTimeout(function () {
      try { root.print(); } catch (e) { }
      setTimeout(done, 3000);
    }, 90);
  }

  function csvCell(v) {
    var s = String(v == null ? '' : v);
    if (/[",\n\r]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
    return s;
  }
  function downloadCSV() {
    var def = defOf(state.item);
    if (!def || !def.csv) return;
    var rows = def.csv(state.doc);
    var text = rows.map(function (r) { return r.map(csvCell).join(','); }).join('\r\n');
    var blob = new Blob(['\ufeff' + text], { type: 'text/csv;charset=utf-8;' });
    saveBlob(blob, (def.fileBase || def.id) + '-' + todayISO() + '.csv');
    toast('CSV를 내려받았습니다. 엑셀에서 바로 열립니다.');
  }
  function saveBlob(blob, name) {
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { document.body.removeChild(a); URL.revokeObjectURL(url); }, 400);
  }
  function downloadPNG(canvas, name) {
    if (!canvas) return;
    canvas.toBlob(function (blob) {
      if (!blob) { toast('이미지를 만들지 못했습니다.'); return; }
      saveBlob(blob, name);
      toast('PNG를 내려받았습니다(배경 투명).');
    }, 'image/png');
  }

  /* ---------------------------------------------------------
     12. 도구(도장·서명) 화면
  --------------------------------------------------------- */
  function toolFormHTML(d, def) {
    if (def.tool === 'stamp') {
      return '<div class="fm-group"><h3>도장 정보</h3><div class="fm-grid">' +
        '<div class="fm-field span2"><div class="lbl"><span>이름 / 상호</span><i>2~4자 권장</i></div>' +
        '<input type="text" data-tool="stamp-name" value="' + esc(d.f.stampName || '홍길동') + '" maxlength="12"></div>' +
        '<div class="fm-field"><div class="lbl"><span>모양</span></div><select data-tool="stamp-shape">' +
        '<option value="circle"' + (d.f.stampShape !== 'square' ? ' selected' : '') + '>원형</option>' +
        '<option value="square"' + (d.f.stampShape === 'square' ? ' selected' : '') + '>사각</option></select></div>' +
        '<div class="fm-field"><div class="lbl"><span>글자</span></div><select data-tool="stamp-style">' +
        '<option value="ko"' + (d.f.stampStyle !== 'hj' && d.f.stampStyle !== 'en' ? ' selected' : '') + '>한글 세로</option>' +
        '<option value="hj"' + (d.f.stampStyle === 'hj' ? ' selected' : '') + '>한자 세로</option>' +
        '<option value="en"' + (d.f.stampStyle === 'en' ? ' selected' : '') + '>영문 가로</option></select></div>' +
        '<div class="fm-field"><div class="lbl"><span>인주색</span></div><select data-tool="stamp-color">' +
        '<option value="red"' + (d.f.stampColor !== 'blue' && d.f.stampColor !== 'black' ? ' selected' : '') + '>적색</option>' +
        '<option value="blue"' + (d.f.stampColor === 'blue' ? ' selected' : '') + '>청색</option>' +
        '<option value="black"' + (d.f.stampColor === 'black' ? ' selected' : '') + '>흑색</option></select></div>' +
        '</div></div>' +
        '<div class="fm-group"><h3>쓰는 곳</h3><p class="fm-shelp">계약서·발주서·증명서의 직인란에 붙이거나, 인쇄물에 합성할 수 있습니다. 내려받는 PNG는 배경이 투명합니다.</p></div>';
    }
    return '<div class="fm-group"><h3>서명</h3><p class="fm-shelp">오른쪽 패드에 마우스나 손가락으로 서명하면 투명 PNG로 내려받을 수 있습니다. 문서에 바로 넣으려면 문서서식·계약서에서 서명란을 누르세요.</p></div>' +
      '<div class="fm-group"><h3>전자서명 요청</h3><p class="fm-shelp">문서서식에서 작성자가 서명한 뒤 <b>서명 요청 링크</b>를 만들면, 상대방이 회원가입 없이 열어 서명하고 최종본을 PDF로 저장할 수 있습니다.</p></div>';
  }

  function toolStageHTML(d, def) {
    if (def.tool === 'stamp') {
      return '<div class="fm-stamptool">' +
        '<div><div class="fm-stamp-stage"><canvas id="fm-stamp-main" width="520" height="520" aria-label="도장 미리보기"></canvas></div>' +
        '<div class="fm-stamp-note">미리보기는 실제 인쇄 크기와 무관합니다. PNG는 520×520px 투명 배경입니다.</div></div>' +
        '<div class="fm-how-card" style="border-top:3px solid var(--ink)">' +
        '<span class="k">HOW TO</span><h3>도장 만들기</h3>' +
        '<p>이름이나 상호를 넣고 모양·글자·인주색을 고르면 바로 아래에 도장이 만들어집니다. 마음에 들면 <b>투명 PNG 다운로드</b>로 저장하세요.</p>' +
        '<p style="margin-top:8px">법인 직인은 보통 상호와 대표자명을 함께 새깁니다. 예: <b>○○상사</b> · <b>홍길동</b>. 개인 도장은 성명 2~4자가 가장 읽기 좋습니다.</p>' +
        '<p style="margin-top:8px;color:var(--muted);font-size:11px">※ 도장 이미지는 이 브라우저 안에서만 만들어지고 서버로 전송되지 않습니다.</p>' +
        '</div></div>';
    }
    return '<div class="fm-stamptool">' +
      '<div><div class="fm-padwrap"><canvas id="fm-sign-main" width="960" height="300" aria-label="서명 패드"></canvas>' +
      '<div class="fm-pad-row"><span>마우스·터치로 서명하세요</span><button type="button" data-tool="pad-clear">지우기</button></div></div></div>' +
      '<div class="fm-how-card" style="border-top:3px solid var(--ink)"><span class="k">E-SIGN</span><h3>손글씨 서명</h3>' +
      '<p>서명은 캔버스에 그린 획만 저장합니다. 이미지 파일로 서버에 올리지 않으므로 개인정보가 남지 않습니다.</p>' +
      '<p style="margin-top:8px">문서에 서명을 넣으려면 <b>문서서식</b>이나 <b>계약서</b>에서 서명란을 누르세요. 서명 요청 링크로 상대방 서명까지 받을 수 있습니다.</p></div>' +
      '</div>';
  }

  function bindToolStage(def) {
    if (def.tool === 'stamp') {
      drawToolStamp();
    } else {
      var c = $('#fm-sign-main');
      if (!c) return;
      var ctx = c.getContext('2d');
      ctx.lineWidth = 3.4; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = '#16224a';
      var drawing = false, cur = null;
      function pos(e) {
        var r = c.getBoundingClientRect();
        return [(e.clientX - r.left) * (c.width / r.width), (e.clientY - r.top) * (c.height / r.height)];
      }
      c.onpointerdown = function (e) {
        e.preventDefault(); drawing = true; cur = [pos(e)]; c.strokes = c.strokes || []; c.strokes.push(cur); c.setPointerCapture(e.pointerId);
        redraw();
      };
      c.onpointermove = function (e) {
        if (!drawing) return;
        e.preventDefault();
        var p = pos(e), last = cur[cur.length - 1];
        if ((p[0] - last[0]) * (p[0] - last[0]) + (p[1] - last[1]) * (p[1] - last[1]) < 4) return;
        cur.push(p); redraw();
      };
      c.onpointerup = function () { drawing = false; cur = null; };
      c.onpointercancel = function () { drawing = false; cur = null; };
      function redraw() {
        ctx.clearRect(0, 0, c.width, c.height);
        drawStrokePath(ctx, c.strokes || [], 0, 0, 1, 3.4, '#16224a');
      }
    }
  }

  function drawToolStamp() {
    var c = $('#fm-stamp-main');
    if (!c) return;
    drawStamp(c.getContext('2d'), c.width, {
      name: (state.doc.f.stampName || '홍길동'),
      shape: state.doc.f.stampShape,
      style: state.doc.f.stampStyle,
      color: state.doc.f.stampColor
    });
  }

  /* ---------------------------------------------------------
     13. 이벤트
  --------------------------------------------------------- */
  function bind() {
    document.addEventListener('click', function (e) {
      var t = e.target;
      var catBtn = t.closest ? t.closest('[data-cat]') : null;
      if (catBtn) { switchCat(catBtn.getAttribute('data-cat')); return; }
      var subBtn = t.closest ? t.closest('[data-sub]') : null;
      if (subBtn) { state.sub = subBtn.getAttribute('data-sub'); renderItems(); renderDocItems(); return; }
      var itemBtn = t.closest ? t.closest('[data-item]') : null;
      if (itemBtn) { switchItem(itemBtn.getAttribute('data-item')); return; }
      var act = t.closest ? t.closest('[data-act]') : null;
      if (act) { runAction(act.getAttribute('data-act')); return; }
      var slotTool = t.closest ? t.closest('[data-slot-tool]') : null;
      if (slotTool) {
        e.preventDefault();
        var mode = slotTool.getAttribute('data-slot-tool');
        var pk = slotTool.getAttribute('data-party');
        if (STATE_GUARD(pk)) return;
        if (mode === 'clear') {
          delete state.doc.sig[pk];
          if (state.doc.meta.sigAt) delete state.doc.meta.sigAt[pk];
          renderStage(); renderToolbar(); updateSignStatus(); persist();
          toast('서명을 지웠습니다.');
        } else openModal(pk, mode);
        return;
      }
      var slot = t.closest ? t.closest('[data-slot]') : null;
      if (slot) {
        var pk2 = slot.getAttribute('data-slot');
        if (STATE_GUARD(pk2)) return;
        openModal(pk2, 'sign');
        return;
      }
      var sact = t.closest ? t.closest('[data-sign-act]') : null;
      if (sact) { runSignAction(sact.getAttribute('data-sign-act')); return; }
      var add = t.closest ? t.closest('[data-addrow]') : null;
      if (add) { addRow(add.getAttribute('data-addrow')); return; }
      var del = t.closest ? t.closest('[data-delrow]') : null;
      if (del) { delRow(del.getAttribute('data-delrow'), Number(del.getAttribute('data-row'))); return; }
      var toolBtn = t.closest ? t.closest('[data-tool]') : null;
      if (toolBtn) { runTool(toolBtn.getAttribute('data-tool')); return; }
      if (t.closest && t.closest('#fm-modal-close')) { closeModal(); return; }
      if (t.closest && t.closest('.fm-modal .ov')) { closeModal(); return; }
      if (t.closest && t.closest('[data-close]')) { closeModal(); return; }
      var mtab = t.closest ? t.closest('[data-mtab]') : null;
      if (mtab) {
        var tab = mtab.getAttribute('data-mtab');
        $$('[data-mtab]').forEach(function (b) { b.setAttribute('aria-selected', String(b.getAttribute('data-mtab') === tab)); });
        $$('[data-mpanel]').forEach(function (pn) { pn.hidden = pn.getAttribute('data-mpanel') !== tab; });
        if (tab === 'sign') { resizePad(); setTimeout(function () { $('#fm-pad').focus({ preventScroll: true }); }, 20); }
        else { $('#fm-stamp-name').focus({ preventScroll: true }); drawStampPreview(); }
        return;
      }
      var copyBtn = t.closest ? t.closest('[data-copy]') : null;
      if (copyBtn) {
        var src = copyBtn.getAttribute('data-copy');
        var txt = src === 'link' ? els.lastLink : (src === 'done' ? ($('#fm-done-link') || {}).value : '');
        if (!txt) return;
        copyText(txt).then(function () { toast('링크를 복사했습니다.'); }).catch(function () { toast('복사하지 못했습니다. 링크를 길게 눌러 직접 복사해 주세요.'); });
        return;
      }
      if (t.closest && t.closest('#fm-reset')) { resetDoc(); return; }
      if (t.closest && t.closest('#fm-fill')) { fillExample(); return; }
    });

    document.addEventListener('input', function (e) {
      handleFieldInput(e);
    });
    document.addEventListener('change', function (e) {
      if (e.target && e.target.tagName === 'SELECT') handleFieldInput(e);
    });

    function handleFieldInput(e) {
      var t = e.target;
      if (!t.matches) return;
      if (t.matches('[data-f]') && state.doc) {
        state.doc.f[t.getAttribute('data-f')] = t.value;
        var ddef = defOf(state.doc.id);
        if (ddef && ddef.onChange) {
          var patch = ddef.onChange(t.getAttribute('data-f'), state.doc);
          if (patch) {
            Object.keys(patch).forEach(function (k2) { state.doc.f[k2] = patch[k2]; });
            renderForm();
          }
        }
        renderStage(); updateCounts(); updateSignStatus(); persist();
        return;
      }
      if (t.matches('[data-set]') && state.doc) {
        var set = t.getAttribute('data-set'), row = Number(t.getAttribute('data-row')), col = t.getAttribute('data-col');
        var rows = state.doc.sets[set] || [];
        if (rows[row]) rows[row][col] = t.value;
        renderStage(); persist();
        return;
      }
      if (t.matches('[data-tool]') && state.doc) {
        var k = t.getAttribute('data-tool');
        if (k === 'stamp-name') state.doc.f.stampName = t.value;
        if (k === 'stamp-shape') state.doc.f.stampShape = t.value;
        if (k === 'stamp-style') state.doc.f.stampStyle = t.value;
        if (k === 'stamp-color') state.doc.f.stampColor = t.value;
        drawToolStamp(); persist();
        return;
      }
      if (t.id === 'fm-stamp-name' || t.id === 'fm-stamp-shape' || t.id === 'fm-stamp-style' || t.id === 'fm-stamp-color') drawStampPreview();
    }

    if (els.search) {
      els.search.addEventListener('input', function () {
        state.query = els.search.value;
        renderItems(); renderDocItems();
      });
    }

    if (els.modal) {
      els.modal.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeModal(); });
    }

    var padEl = $('#fm-pad');
    if (padEl) {
      padEl.addEventListener('pointerdown', padStart);
      padEl.addEventListener('pointermove', padMove);
      padEl.addEventListener('pointerup', padEnd);
      padEl.addEventListener('pointercancel', padEnd);
      padEl.addEventListener('pointerleave', padEnd);
      $('#fm-pad-clear').addEventListener('click', clearPad);
      $('#fm-sign-apply').addEventListener('click', applySignature);
    }
    var sb = $('#fm-stamp-apply');
    if (sb) sb.addEventListener('click', applyStamp);

    root.addEventListener('beforeprint', function () { });
  }

  function STATE_GUARD(pk) {
    if (state.mode !== 'sign') return false;
    if (pk !== state.receiver) {
      toast('작성자가 서명한 자리입니다. ' + receiverLabel(defOf(state.item)) + ' 서명란에 서명해 주세요.');
      return true;
    }
    return false;
  }

  function runAction(a) {
    var def = defOf(state.item);
    if (a === 'print' || a === 'print-wide') {
      var el = a === 'print-wide' ? $('#fm-xls') : $('#fm-sheet');
      printSheet(el || $('#fm-sheet'), { wide: a === 'print-wide' });
    } else if (a === 'print-slides') {
      printSheet($('#fm-slides'), { slides: true });
    } else if (a === 'csv') {
      downloadCSV();
    } else if (a === 'link') {
      makeLink();
    } else if (a === 'png') {
      if (def.tool === 'stamp') downloadPNG($('#fm-stamp-main'), 'stamp-' + todayISO() + '.png');
      else downloadPNG($('#fm-sign-main'), 'signature-' + todayISO() + '.png');
    }
  }

  function runSignAction(a) {
    var def = defOf(state.item);
    var rp = receiverParty(def);
    if (a === 'sign') openModal(rp.k, 'sign');
    else if (a === 'stamp') openModal(rp.k, 'stamp');
    else if (a === 'final') finalizeSign();
  }

  function runTool(k) {
    if (k === 'pad-clear') {
      var c = $('#fm-sign-main');
      if (c) {
        c.strokes = [];
        c.getContext('2d').clearRect(0, 0, c.width, c.height);
      }
    }
  }

  function addRow(setKey) {
    var def = defOf(state.item);
    var row = {};
    (def.sets || []).forEach(function (s) {
      if (s.k !== setKey) return;
      s.cols.forEach(function (c) { if (!c.calc) row[c.k] = c.d == null ? '' : c.d; });
    });
    state.doc.sets[setKey] = state.doc.sets[setKey] || [];
    state.doc.sets[setKey].push(row);
    renderForm(); renderStage(); persist();
  }
  function delRow(setKey, i) {
    var rows = state.doc.sets[setKey] || [];
    if (rows.length <= 1) { rows[0] = {}; }
    else rows.splice(i, 1);
    renderForm(); renderStage(); persist();
  }

  function resetDoc() {
    var def = defOf(state.item);
    if (!def) return;
    if (!root.confirm('이 서식의 입력값과 서명을 모두 지울까요?')) return;
    state.doc = newDoc(def);
    store[def.id] = state.doc;
    refresh(); persist();
    toast('입력값을 지웠습니다.');
  }
  function fillExample() {
    var def = defOf(state.item);
    if (!def) return;
    state.doc = newDoc(def);
    store[def.id] = state.doc;
    refresh(); persist();
    toast('예시값으로 채웠습니다. 필요한 부분만 고쳐 쓰세요.');
  }

  /* ---------------------------------------------------------
     14. 부팅
  --------------------------------------------------------- */
  function parseHash() {
    var m = String(location.hash || '').replace(/^#/, '').split('/');
    var cat = catOf(m[0]) ? m[0] : null;
    var item = m[1] && defOf(m[1]) ? m[1] : null;
    return { cat: cat, item: item };
  }

  function readSignParam() {
    var m = String(location.search || '').match(/[?&]sign=([^&]+)/);
    if (!m) return null;
    return decodeDoc(decodeURIComponent(m[1]));
  }

  function boot() {
    if (!root.IBF_DOCS || !root.IBF_CATS) {
      setTimeout(boot, 30);
      return;
    }
    try {
    els.cats = $('#fm-cats');
    els.items = $('#fm-items');
    els.docItems = $('#fm-doc-items');
    els.form = $('#fm-form');
    els.stage = $('#fm-stage');
    els.actions = $('#fm-actions');
    els.sideTitle = $('#fm-side-title');
    els.sideNote = $('#fm-side-note');
    els.toast = $('#fm-toast');
    els.modal = $('#fm-modal');
    els.work = $('#fm-work');
    els.docLabel = $('#fm-doc-label');
    els.signStatus = $('#fm-sign-status');
    els.search = $('#fm-search');
    els.banner = $('#fm-banner');
    els.catsWrap = $('#fm-cats-wrap');
    els.itemsWrap = $('#fm-items-wrap');
    els.sideFoot = $('#fm-side-foot');
    els.docLabel = $('#fm-doc-label');
    els.linkbox = $('#fm-linkbox');
    pad.canvas = $('#fm-pad');

    var signDoc = readSignParam();
    if (signDoc) {
      state.mode = 'sign';
      state.item = signDoc.id;
      state.doc = signDoc;
      state.cat = (defOf(signDoc.id) || {}).cat || 'doc';
      var def = defOf(signDoc.id);
      state.receiver = receiverParty(def).k;
      store[signDoc.id] = signDoc;
      if (els.banner) {
        els.banner.hidden = false;
        $('#fm-banner-who').textContent = signDoc.meta.author || '작성자';
        $('#fm-banner-doc').textContent = def.name;
        $('#fm-banner-at').textContent = signDoc.meta.createdAt || '';
      }
      if (els.catsWrap) els.catsWrap.hidden = true;
      if (els.itemsWrap) els.itemsWrap.hidden = true;
      if (els.sideFoot) els.sideFoot.hidden = true;
      document.title = def.name + ' 서명 요청 — INSIGHT BRIEF';
    } else {
      restore();
      var h = parseHash();
      var start = h.item || 'labor';
      var sd = defOf(start);
      if (sd && sd.kind === 'link') {
        var firstReal = itemsOf(sd.cat).filter(function (d) { return d.kind !== 'link'; })[0];
        start = (firstReal || {}).id || 'labor';
      }
      state.cat = (defOf(start) || {}).cat || 'doc';
      state.item = start;
      state.doc = store[start] || newDoc(defOf(start));
      store[start] = state.doc;
      lastItem[state.cat] = start;
    }

    renderCats(); renderItems(); renderDocItems(); refresh(); updateSignStatus();
    bind();
    document.documentElement.classList.add('fm-ready');
    } catch (err) {
      root.__fmBootErr = String((err && err.stack) || err);
    }
  }

  root.IBF = {
    esc: esc, num: num, fmt: fmt, fmt1: fmt1, won: won, korMoney: korMoney, korMoneyFull: korMoneyFull,
    korAmt: korAmt, dateKo: dateKo, dateDot: dateDot, todayISO: todayISO, today: todayISO, nowStamp: nowStamp,
    addYears: addYears, addMonths: addMonths, addDays: addDays, termText: termText, vat: vat, setSum: setSum,
    uid: uid, text: text, val: val, money: money,
    signBoxFor: function (d, pk) { return signBox(defOf(d.id), d, pk); }
  };

  root.IBF_TEST = {
    newDoc: newDoc, renderSheet: renderPaper, renderExcel: renderExcel, renderSlides: renderSlides,
    encodeDoc: encodeDoc, decodeDoc: decodeDoc, korMoney: korMoney, block: renderBlock,
    stageHTML: stageHTML, formHTML: formHTML,
    b64e: b64urlEncode, b64d: b64urlDecode, u8: utf8Bytes, u8d: bytesToUtf8
  };

  if (IS_DOM) {
    if (document.readyState === 'complete') boot();
    else document.addEventListener('DOMContentLoaded', boot);
  }

  root.printSheet = printSheet;
})(typeof window !== 'undefined' ? window : this);
