/* =========================================================
   INSIGHT BRIEF — 크리에이터 스튜디오 : 공통 · 블로그 생성
   creator.html 전용. 서버 없이 브라우저에서만 동작합니다.
   ========================================================= */
(function () {
  'use strict';

  var DATA = window.IB_CREATOR_DATA || { ko: {} };
  var LANGKEY = { ko: 'ko', en: 'en', 'zh-Hans': 'zh', zh: 'zh', ja: 'ja' };
  var htmlLang = (document.documentElement.getAttribute('lang') || 'ko').toLowerCase();
  var LANG = LANGKEY[htmlLang] || (htmlLang.indexOf('zh') === 0 ? 'zh' : (htmlLang.indexOf('ja') === 0 ? 'ja' : (htmlLang.indexOf('en') === 0 ? 'en' : 'ko')));
  var T = DATA[LANG] || DATA.ko;

  var $ = function (id) { return document.getElementById(id); };
  var HANGUL = /[가-힣]/;

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function t(key, vars) {
    var s = (T.ui && T.ui[key]) || (DATA.ko.ui && DATA.ko.ui[key]) || key;
    if (vars) for (var k in vars) s = s.split('{' + k + '}').join(vars[k]);
    return s;
  }

  /* 한국어 조사(을/를, 이/가 …)를 받침에 맞춰 고릅니다. */
  function hasBatchim(word) {
    var w = String(word == null ? '' : word).trim();
    if (!w) return false;
    var last = w.charAt(w.length - 1);
    var ch = last.charCodeAt(0);
    if (ch >= 0xAC00 && ch <= 0xD7A3) return (ch - 0xAC00) % 28 !== 0;
    if (/[0-9]/.test(last)) return [0, 1, 3, 6, 7, 8].indexOf(Number(last)) >= 0;
    if (/[A-Za-z]/.test(last)) return /[lmnr]$/i.test(last);
    return false;
  }
  function koParticle(word, base) {
    var w = String(word == null ? '' : word).trim();
    var withB = hasBatchim(w);
    var riel = false;
    if (w) {
      var ch = w.charCodeAt(w.length - 1);
      if (ch >= 0xAC00 && ch <= 0xD7A3) riel = (ch - 0xAC00) % 28 === 8;
    }
    switch (base) {
      case '를': return withB ? '을' : '를';
      case '가': return withB ? '이' : '가';
      case '는': return withB ? '은' : '는';
      case '와': return withB ? '과' : '와';
      case '로': return (!withB || riel) ? '로' : '으로';
    }
    return base;
  }

  function fill(str, vars) {
    var s = String(str || '');
    if (vars && vars.kw) {
      s = s.replace(/\{kw\}(를|가|는|와|로|의)/g, function (m, p) {
        return '{kw}' + koParticle(vars.kw, p);
      });
    }
    for (var k in vars) s = s.split('{' + k + '}').join(vars[k]);
    return s;
  }

  /* 제목·태그에 쓸 짧은 키워드 — 긴 주제 문장은 첫 절만 씁니다. */
  function shortKeyword(topic, keywords) {
    if (keywords && keywords.length) return String(keywords[0]).slice(0, 24);
    var t = String(topic || '').trim();
    var first = t.split(/[,，:：]/)[0].trim();
    return (first || t).slice(0, 24);
  }

  function makeTitle(cat, kwFull, kwShort, variant) {
    var hooks = cat.hooks || [];
    if (!hooks.length) return kwFull || kwShort;
    var full = String(kwFull || '').trim();
    var long = full.length > 18 || /[,，]/.test(full);
    if (long) {
      var starters = hooks.filter(function (h) { return h.indexOf('{kw}') === 0; });
      var h = (starters.length ? starters[variant % starters.length] : hooks[variant % hooks.length]);
      var tail = String(h).replace('{kw}', '').replace(/^[\s,，、:：\-–—\u3000]+/, '').trim();
      var tailTxt = fill(tail, { kw: kwShort });
      tailTxt = tailTxt.charAt(0).toUpperCase() + tailTxt.slice(1);
      return tail ? full + ' — ' + tailTxt : full;
    }
    return fill(hooks[variant % hooks.length], { kw: full || kwShort });
  }

  /* ---------- 토스트 ---------- */
  var toastEl = null, toastTimer = null;
  function toast(msg) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'cs-toast';
      toastEl.setAttribute('role', 'status');
      toastEl.setAttribute('aria-live', 'polite');
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    toastEl.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('is-on'); }, 2600);
  }

  function download(blob, name) {
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = name; a.rel = 'noopener';
    document.body.appendChild(a); a.click();
    setTimeout(function () { a.remove(); URL.revokeObjectURL(url); }, 1500);
  }

  function slugify(s) {
    var out = String(s || '').trim().replace(/[\\/:*?"<>|]+/g, '').replace(/\s+/g, '-');
    if (HANGUL.test(out)) {
      // 한글 제목은 파일 이름으로 그대로 써도 되지만, 너무 길면 자릅니다.
      return out.slice(0, 48);
    }
    return (out.toLowerCase().replace(/[^a-z0-9\-]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || 'insight-brief').slice(0, 48);
  }

  function seeded(str) {
    var h = 2166136261;
    for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return function () {
      h += 0x6D2B79F5;
      var x = h;
      x = Math.imul(x ^ (x >>> 15), x | 1);
      x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
      return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* ---------- 상태 ---------- */
  var S = {
    lang: LANG,
    blog: null,     // {title, meta, tags, articleHtml, fullDoc, topics:[], source:'tpl'|'ai'}
    shorts: null,   // creator-shorts.js 가 채웁니다
    videoBlob: null,
    variant: 0
  };
  window.IB_CS = {
    t: t, esc: esc, toast: toast, download: download, slugify: slugify, fill: fill,
    state: S, lang: LANG, data: T, DATA: DATA
  };

  /* =========================================================
     탭
     ========================================================= */
  var tabs = [].slice.call(document.querySelectorAll('.cs-tab'));
  var panels = { blog: $('panel-blog'), shorts: $('panel-shorts'), upload: $('panel-upload') };

  function showPanel(key, opts) {
    tabs.forEach(function (b) {
      var on = b.getAttribute('data-panel') === key;
      b.classList.toggle('is-on', on);
      b.setAttribute('aria-selected', on ? 'true' : 'false');
      b.tabIndex = on ? 0 : -1;
    });
    Object.keys(panels).forEach(function (k) {
      if (!panels[k]) return;
      if (k === key) { panels[k].removeAttribute('hidden'); panels[k].classList.add('is-on'); }
      else { panels[k].setAttribute('hidden', ''); panels[k].classList.remove('is-on'); }
    });
    if (!opts || opts.scroll !== false) {
      var top = document.querySelector('.cs-tabs');
      if (top && top.getBoundingClientRect().top < 0) top.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  tabs.forEach(function (b) {
    b.addEventListener('click', function () { showPanel(b.getAttribute('data-panel')); });
    b.addEventListener('keydown', function (e) {
      var i = Number(b.getAttribute('data-tabindex') || tabs.indexOf(b));
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      e.preventDefault();
      var next = tabs[(tabs.indexOf(b) + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
      next.focus(); showPanel(next.getAttribute('data-panel'), { scroll: false });
    });
  });
  window.IB_CS.showPanel = showPanel;

  /* =========================================================
     원클릭 예시
     ========================================================= */
  /* =========================================================
     원클릭 예시 — 화면 언어에 맞는 주제·키워드를 넣습니다.
     ========================================================= */
  var EXAMPLES = {
    1: {
      ko: ['환율 1,400원 시대, 직구 비용 줄이는 세 가지 방법', '환율, 직구, 관부가세'],
      en: ['Three ways to cut cross-border shopping costs at 1,400 won per dollar', 'exchange rate, overseas shopping, customs duty'],
      zh: ['汇率 1,400 韩元时代，降低海淘成本的三个方法', '汇率, 海淘, 关税'],
      ja: ['1ドル1,400ウォン時代、海外通販のコストを下げる3つの方法', '為替, 海外通販, 関税']
    },
    2: {
      ko: ['겨울철 실내 습도 40~60% 맞추는 법', '실내 습도, 가습기, 환기'],
      en: ['Keeping indoor humidity at 40-60% in winter', 'indoor humidity, humidifier, ventilation'],
      zh: ['冬季把室内湿度保持在 40~60% 的方法', '室内湿度, 加湿器, 通风'],
      ja: ['冬の室内湿度を40〜60%に保つ方法', '室内湿度, 加湿器, 換気']
    },
    3: {
      ko: ['중고 노트북 살 때 확인할 일곱 가지', '중고 노트북, 배터리 성능, 보증 이전'],
      en: ['Seven checks before buying a used laptop', 'used laptop, battery health, warranty transfer'],
      zh: ['买二手笔记本前要确认的七件事', '二手笔记本, 电池健康, 保修转移'],
      ja: ['中古ノートPCを買う前に確認する7つ', '中古ノートPC, バッテリー状態, 保証の引き継ぎ']
    }
  };

  document.querySelectorAll('.cs-ex-card').forEach(function (card, i) {
    card.addEventListener('click', function () {
      var ex = EXAMPLES[i + 1] && EXAMPLES[i + 1][LANG];
      var topic = ex ? ex[0] : (card.getAttribute('data-topic') || '');
      var kws = ex ? ex[1] : (card.getAttribute('data-keywords') || '');
      var cat = card.getAttribute('data-cat') || 'info';
      var lang = LANG;
      var tab = card.getAttribute('data-tab') || 'blog';
      if (tab === 'shorts') {
        showPanel('shorts');
        if ($('cs-topic')) $('cs-topic').value = topic;
        if ($('cs-cat')) $('cs-cat').value = cat;
        if (window.IB_CS.shortsGenerate) window.IB_CS.shortsGenerate();
      } else {
        showPanel('blog');
        if ($('cb-topic')) $('cb-topic').value = topic;
        if ($('cb-keywords')) $('cb-keywords').value = kws;
        if ($('cb-cat')) $('cb-cat').value = cat;
        if ($('cb-lang')) $('cb-lang').value = lang;
        S.variant = 0;
        generateBlog();
      }
    });
  });

  /* =========================================================
     블로그 생성
     ========================================================= */
  function readBlogInput() {
    var topic = ($('cb-topic') && $('cb-topic').value || '').trim();
    var kws = ($('cb-keywords') && $('cb-keywords').value || '').split(/[,，、]/).map(function (s) { return s.trim(); }).filter(Boolean);
    var cat = ($('cb-cat') && $('cb-cat').value) || 'info';
    var lang = ($('cb-lang') && $('cb-lang').value) || LANG;
    return { topic: topic, keywords: kws, cat: cat, lang: lang };
  }

  function pickWord(topic, keywords) {
    if (topic) return topic;
    if (keywords.length) return keywords[0];
    return '';
  }

  function buildFromTemplate(input) {
    var lang = input.lang || LANG;
    var pack = DATA[lang] || DATA.ko;
    var cat = pack.cats[input.cat] || pack.cats.info;
    var kwFull = input.topic || (input.keywords[0] || '');
    var kw = shortKeyword(input.topic, input.keywords);
    var rnd = seeded(kw + '|' + input.cat + '|' + S.variant);
    var st = pack.struct;
    var vars = { kw: kw };

    function choose(list) { return list[Math.floor(rnd() * list.length) % list.length]; }
    var title = makeTitle(cat, kwFull, kw, S.variant);
    var meta = fill(st.meta[S.variant % st.meta.length], vars);
    var lead = fill(st.intro[S.variant % st.intro.length], vars);
    var summary = st.bullets.map(function (b) { return fill(b, vars); });
    var why = fill(cat.why[0], vars) + ' ' + fill(cat.why[1] || '', vars);
    var checks = cat.checks.map(function (c) { return fill(c, vars); })
      .concat(st.checks.slice(0, 3).map(function (c) { return fill(c, vars); }));
    var faq = cat.faq.map(function (p) { return { q: fill(p[0], vars), a: fill(p[1], vars) }; })
      .concat((st.faqExtra || []).map(function (p) { return { q: fill(p[0], vars), a: fill(p[1], vars) }; }));
    var mistakes = st.mistakes.map(function (m) { return fill(m, vars); });
    var closing = fill(choose(st.closing), vars);

    var tags = cat.tags.map(function (x) { return fill(x, vars); })
      .concat(input.keywords.slice(0, 3))
      .concat(st.tagExtra || []);
    tags = uniq(tags).slice(0, 10);

    var table = {
      head: st.tableHead.slice(),
      rows: cat.rows.map(function (r) { return r.slice(); })
    };

    return {
      title: title, meta: meta, lead: lead, summary: summary, why: why,
      table: table, checks: checks, mistakes: mistakes, faq: faq,
      closing: closing, tags: tags, lang: lang, source: 'tpl',
      kw: kw, kwFull: kwFull
    };
  }

  function uniq(arr) {
    var seen = {}, out = [];
    arr.forEach(function (x) { if (x && !seen[x]) { seen[x] = 1; out.push(x); } });
    return out;
  }

  /* ---------- HTML 만들기 (블로그에 그대로 붙여도 보이게 인라인 스타일) ---------- */
  var S_INLINE = {
    lead: 'font-size:16px;line-height:1.85;color:#2e3136;margin:0 0 18px',
    sum: 'border:1px solid #e5e7eb;background:#f8f9fa;padding:14px 16px;margin:18px 0',
    sumHead: 'display:block;font-size:11px;letter-spacing:.12em;color:#b3261e;font-weight:700;margin-bottom:7px',
    ul: 'margin:8px 0;padding-left:18px',
    li: 'margin:4px 0;line-height:1.8',
    h2: 'font-size:21px;line-height:1.35;font-weight:800;letter-spacing:-.02em;margin:30px 0 10px;padding-top:6px;border-top:1px solid #e5e7eb',
    h3: 'font-size:15.5px;font-weight:800;margin:20px 0 6px',
    p: 'margin:10px 0;font-size:15px;line-height:1.9;color:#2e3136',
    table: 'width:100%;border-collapse:collapse;margin:16px 0;font-size:13.5px',
    th: 'border:1px solid #d5d8de;background:#f8f9fa;padding:9px 10px;text-align:left;font-weight:800;font-size:12.5px',
    td: 'border:1px solid #d5d8de;padding:9px 10px;vertical-align:top',
    note: 'margin-top:22px;padding-top:12px;border-top:1px solid #e5e7eb;font-size:12px;color:#6f747b',
    toc: 'border:1px solid #e5e7eb;padding:12px 16px;margin:18px 0;font-size:14px'
  };

  function articleHtml(doc) {
    var st = (DATA[doc.lang] || DATA.ko).struct;
    var vars = { kw: doc.kw || '' };
    var out = [];
    out.push('<p style="' + S_INLINE.lead + '">' + esc(doc.lead) + '</p>');

    out.push('<div style="' + S_INLINE.sum + '"><b style="' + S_INLINE.sumHead + '">' + esc(st.summary) + '</b><ul style="' + S_INLINE.ul + '">' +
      doc.summary.map(function (s) { return '<li style="' + S_INLINE.li + '">' + esc(s) + '</li>'; }).join('') + '</ul></div>');

    var secs = [
      { id: 'sec-why', label: fill(st.why, vars) },
      { id: 'sec-compare', label: fill(st.compare, vars) },
      { id: 'sec-check', label: fill(st.check, vars) },
      { id: 'sec-mistake', label: fill(st.mistake, vars) },
      { id: 'sec-faq', label: fill(st.faq, vars) },
      { id: 'sec-close', label: fill(st.closingLabel || st.closing, vars) }
    ];
    out.push('<nav style="' + S_INLINE.toc + '"><b style="' + S_INLINE.sumHead + '">' + esc(st.toc) + '</b><ol style="margin:0;padding-left:20px">' +
      secs.map(function (s) { return '<li><a href="#' + s.id + '" style="color:#2e3136;text-decoration:none">' + esc(s.label) + '</a></li>'; }).join('') +
      '</ol></nav>');

    out.push('<h2 id="' + secs[0].id + '" style="' + S_INLINE.h2 + '">' + esc(secs[0].label) + '</h2>');
    out.push('<p style="' + S_INLINE.p + '">' + esc(doc.why) + '</p>');

    out.push('<h2 id="' + secs[1].id + '" style="' + S_INLINE.h2 + '">' + esc(secs[1].label) + '</h2>');
    out.push('<table style="' + S_INLINE.table + '"><thead><tr>' +
      doc.table.head.map(function (h) { return '<th style="' + S_INLINE.th + '">' + esc(h) + '</th>'; }).join('') +
      '</tr></thead><tbody>' +
      doc.table.rows.map(function (r) {
        return '<tr>' + r.map(function (c, i) {
          return '<' + (i === 0 ? 'th scope="row" style="' + S_INLINE.th + '"' : 'td style="' + S_INLINE.td + '"') + '>' + esc(c) + '</' + (i === 0 ? 'th' : 'td') + '>';
        }).join('') + '</tr>';
      }).join('') + '</tbody></table>');

    out.push('<h2 id="' + secs[2].id + '" style="' + S_INLINE.h2 + '">' + esc(secs[2].label) + '</h2>');
    out.push('<p style="' + S_INLINE.p + '">' + esc(fill(st.checkIntro, vars)) + '</p>');
    out.push('<ul style="' + S_INLINE.ul + '">' + doc.checks.map(function (c) {
      return '<li style="' + S_INLINE.li + '">&#9744; ' + esc(c) + '</li>';
    }).join('') + '</ul>');

    out.push('<h2 id="' + secs[3].id + '" style="' + S_INLINE.h2 + '">' + esc(secs[3].label) + '</h2>');
    out.push('<ol style="margin:10px 0;padding-left:20px">' + doc.mistakes.map(function (m) {
      return '<li style="' + S_INLINE.li + '">' + esc(m) + '</li>';
    }).join('') + '</ol>');

    out.push('<h2 id="' + secs[4].id + '" style="' + S_INLINE.h2 + '">' + esc(secs[4].label) + '</h2>');
    doc.faq.forEach(function (p) {
      out.push('<h3 style="' + S_INLINE.h3 + '">Q. ' + esc(p.q) + '</h3><p style="' + S_INLINE.p + '">' + esc(p.a) + '</p>');
    });

    out.push('<h2 id="' + secs[5].id + '" style="' + S_INLINE.h2 + '">' + esc(secs[5].label) + '</h2>');
    out.push('<p style="' + S_INLINE.p + '">' + esc(doc.closing) + '</p>');
    out.push('<p style="' + S_INLINE.note + '">' + esc(st.authorNote) + '</p>');
    return out.join('\n');
  }

  function fullDocument(doc) {
    var pack = DATA[doc.lang] || DATA.ko;
    var ld = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      'headline': doc.title,
      'description': doc.meta,
      'inLanguage': pack.htmlLang,
      'datePublished': new Date().toISOString().slice(0, 10),
      'keywords': doc.tags.join(', '),
      'author': { '@type': 'Organization', 'name': 'INSIGHT BRIEF' }
    };
    var body = articleHtml(doc);
    return '<!DOCTYPE html>\n<html lang="' + pack.htmlLang + '">\n<head>\n<meta charset="utf-8">\n' +
      '<meta name="viewport" content="width=device-width,initial-scale=1">\n' +
      '<title>' + esc(doc.title) + '</title>\n' +
      '<meta name="description" content="' + esc(doc.meta) + '">\n' +
      '<meta name="keywords" content="' + esc(doc.tags.join(', ')) + '">\n' +
      '<meta property="og:title" content="' + esc(doc.title) + '">\n' +
      '<meta property="og:description" content="' + esc(doc.meta) + '">\n' +
      '<script type="application/ld+json">' + JSON.stringify(ld) + '</script>\n' +
      '<style>body{max-width:760px;margin:40px auto;padding:0 20px;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Noto Sans KR",sans-serif;color:#15171a;line-height:1.8}h1{font-size:30px;line-height:1.3;letter-spacing:-.02em;margin:0 0 8px}.meta{color:#6f747b;font-size:13px;margin-bottom:26px}</style>\n' +
      '</head>\n<body>\n<article>\n<h1>' + esc(doc.title) + '</h1>\n<p class="meta">INSIGHT BRIEF · ' + new Date().toISOString().slice(0, 10) + '</p>\n' +
      body + '\n</article>\n</body>\n</html>\n';
  }

  function renderBlog(doc) {
    if (!doc.kw) doc.kw = shortKeyword(doc.kwFull || '', []);
    doc.articleHtml = articleHtml(doc);
    doc.fullDoc = fullDocument(doc);
    S.blog = doc;

    if ($('cb-title-out')) $('cb-title-out').textContent = doc.title;
    if ($('cb-desc-out')) $('cb-desc-out').textContent = doc.meta;
    if ($('cb-tags-out')) $('cb-tags-out').innerHTML = doc.tags.map(function (tg) { return '<span>' + esc(tg) + '</span>'; }).join('');
    if ($('cb-metabox')) $('cb-metabox').hidden = false;
    if ($('cb-preview')) { $('cb-preview').hidden = false; }
    if ($('cb-article')) $('cb-article').innerHTML = doc.articleHtml;
    if ($('cb-code')) $('cb-code').value = doc.fullDoc;
    if ($('cb-codedetails')) $('cb-codedetails').hidden = false;
    if ($('cb-buttons')) $('cb-buttons').hidden = false;
    if ($('cb-summary')) $('cb-summary').innerHTML = esc(doc.title) + ' · ' + doc.faq.length + ' FAQ · ' + doc.tags.length + ' tags';
    document.title = doc.title + ' | INSIGHT BRIEF';

    // ③ 탭의 Blogger 제목도 미리 채워 둡니다.
    if ($('up-yt-title-in') && !$('up-yt-title-in').value) { /* 쇼츠가 채웁니다 */ }
    window.IB_CS.lastBlog = doc;
    return doc;
  }

  function generateBlog() {
    var input = readBlogInput();
    if (!input.topic && !input.keywords.length) { toast(t('emptyTopic')); if ($('cb-topic')) $('cb-topic').focus(); return; }
    var btn = $('cb-gen');
    if (btn) { btn.disabled = true; btn.textContent = t('generating'); }
    try {
      var doc = buildFromTemplate(input);
      doc.lang = input.lang;
      renderBlog(doc);
      toast(t('blogDone'));
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = t('gen'); }
    }
  }

  if ($('cb-gen')) $('cb-gen').addEventListener('click', function () { S.variant = 0; generateBlog(); });
  if ($('cb-again')) $('cb-again').addEventListener('click', function () { S.variant++; generateBlog(); });
  ['cb-topic', 'cb-keywords'].forEach(function (id) {
    var el = $(id);
    if (el) el.addEventListener('keydown', function (e) { if (e.key === 'Enter') { S.variant = 0; generateBlog(); } });
  });

  /* ---------- 복사 · 다운로드 ---------- */
  function copyText(text, okMsg) {
    function fallback() {
      var ta = document.createElement('textarea');
      ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); toast(okMsg || t('copied')); }
      catch (e) { toast('Ctrl+C'); }
      ta.remove();
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { toast(okMsg || t('copied')); }, fallback);
    } else fallback();
  }
  window.IB_CS.copyText = copyText;

  if ($('cb-copy')) $('cb-copy').addEventListener('click', function () {
    if (!S.blog) return;
    copyText(S.blog.articleHtml, t('copied'));
  });
  if ($('cb-dl')) $('cb-dl').addEventListener('click', function () {
    if (!S.blog) return;
    var name = 'insight-brief-' + slugify(S.blog.title) + '.html';
    download(new Blob([S.blog.fullDoc], { type: 'text/html;charset=utf-8' }), name);
    toast(t('downloading'));
  });
  if ($('cb-toblogger')) $('cb-toblogger').addEventListener('click', function () {
    if (!S.blog) { toast(t('needBlogHtml')); return; }
    showPanel('upload');
    if (window.IB_CS.oauth) window.IB_CS.oauth.prepareBlog(S.blog);
  });

  /* =========================================================
     Gemini AI 생성 (선택)
     ========================================================= */
  function aiPrompt(input) {
    var langName = { ko: 'Korean', en: 'English', zh: 'Simplified Chinese', ja: 'Japanese' }[input.lang] || 'Korean';
    var catName = { info: 'practical how-to / information', money: 'personal finance and money', health: 'health and daily habits', it: 'IT and technology buying advice' }[input.cat] || 'information';
    return [
      'You write blog drafts for an independent research magazine.',
      'Write in ' + langName + '. Category: ' + catName + '.',
      'Topic: ' + input.topic + (input.keywords.length ? ('\nKeywords: ' + input.keywords.join(', ')) : ''),
      '',
      'Requirements:',
      '- High-RPM blog structure: a concrete title hook (no clickbait promise you cannot keep), a lead paragraph, a 3-bullet summary, a 4-column comparison table, a 6-item action checklist, 3 common mistakes, 5 FAQ entries, and a closing paragraph.',
      '- Concrete, non-generic advice. Use specific numbers as examples but make clear they are examples.',
      '- No invented statistics attributed to institutions. No medical claims. No investment advice beyond general conditions to check.',
      '- Keep every string short enough for mobile reading.',
      '',
      'Return ONLY JSON with this shape:',
      '{"title":"","meta":"","lead":"","summary":["","",""],"why":"","table":{"head":["","","",""],"rows":[["","","",""],["","","",""],["","","",""]]},"checks":["","","","","",""],"mistakes":["","",""],"faq":[{"q":"","a":""},{"q":"","a":""},{"q":"","a":""},{"q":"","a":""},{"q":"","a":""}],"closing":"","tags":["","","","","","","",""]}',
      'meta must be under 160 characters.'
    ].join('\n');
  }

  function aiGenerate() {
    var input = readBlogInput();
    var key = ($('cb-key') && $('cb-key').value || '').trim();
    if (!key) { toast(t('aiNeedKey')); if ($('cb-key')) $('cb-key').focus(); return; }
    if (!input.topic && !input.keywords.length) { toast(t('emptyTopic')); return; }
    var btn = $('cb-ai');
    if (btn) { btn.disabled = true; btn.textContent = t('generating'); }
    if ($('cb-summary')) $('cb-summary').textContent = t('aiRunning');

    var url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + encodeURIComponent(key);
    var body = {
      contents: [{ role: 'user', parts: [{ text: aiPrompt(input) }] }],
      generationConfig: { temperature: 0.85, responseMimeType: 'application/json', maxOutputTokens: 4096 }
    };
    fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function (j) {
        var txt = (j.candidates && j.candidates[0] && j.candidates[0].content && j.candidates[0].content.parts || [])
          .map(function (p) { return p.text || ''; }).join('');
        var doc = JSON.parse(txt);
        doc.lang = input.lang;
        doc.kwFull = input.topic || (input.keywords[0] || '');
        doc.kw = shortKeyword(input.topic, input.keywords);
        doc.source = 'ai';
        if (!doc.table || !doc.table.rows || !doc.table.rows.length) doc.table = buildFromTemplate(input).table;
        doc.tags = (doc.tags || []).slice(0, 10);
        renderBlog(doc);
        toast(t('blogDone') + ' · Gemini');
      })
      .catch(function (err) {
        var fb = buildFromTemplate(input);
        fb.lang = input.lang;
        renderBlog(fb);
        toast(t('aiFail') + ' (' + (err && err.message ? err.message : 'error') + ')');
      })
      .then(function () {
        if (btn) { btn.disabled = false; btn.textContent = 'AI로 생성'; }
      });
  }
  if ($('cb-ai')) $('cb-ai').addEventListener('click', aiGenerate);

  /* 화면 문구(기본값) — 자바스크립트로 채우는 곳만 */
  (function applyUiStrings() {
    var map = {
      'cb-gen': 'gen', 'cb-again': 'genAgain'
    };
    Object.keys(map).forEach(function (id) {
      var el = $(id);
      if (el && T.ui && T.ui[map[id]]) el.textContent = T.ui[map[id]];
    });
    var note = $('cb-keynote');
    if (note) note.textContent = t('keyMemory');
  })();

  /* 첫 방문 안내 */
  (function initDefaults() {
    // 페이지 언어가 한국어가 아니면 결과 언어도 그 언어로 시작합니다.
    if (LANG !== 'ko' && $('cb-lang')) {
      var opt = $('cb-lang').querySelector('option[value="' + LANG + '"]');
      if (opt) $('cb-lang').value = LANG;
    }
  })();

  window.IB_CS.generateBlog = generateBlog;
  window.IB_CS.renderBlog = renderBlog;
})();
