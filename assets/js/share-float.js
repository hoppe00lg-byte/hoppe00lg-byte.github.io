/* =========================================================
   INSIGHT BRIEF — 플로팅 SNS 공유 바 (4개국어)
   · 넓은 화면(1280px~)  : 본문 왼쪽 여백에 세로 고정 바
   · 좁은 화면(~1279px)  : 화면 아래 슬림 바(접기 가능, 본문 가리지 않게 여백 확보)
   · 버튼(4개국어 공통): 링크 복사 · WhatsApp · 위챗 · LINE · X · 기기 공유
   WhatsApp·LINE·X 는 실제 링크(<a target="_blank">)로 두어 팝업 차단에 걸리지 않습니다.
   위챗은 웹에서 바로 공유가 안 되므로 링크를 복사하고 안내를 띄웁니다.
   ========================================================= */
(function () {
  'use strict';

  var html = document.documentElement;
  var raw = (html.getAttribute('lang') || 'ko').toLowerCase();
  var L = /^en/.test(raw) ? 'en' : /^zh/.test(raw) ? 'zh' : /^ja/.test(raw) ? 'ja' : 'ko';

  var T = {
    ko: {
      label: '공유', copy: '링크 복사', whatsapp: 'WhatsApp', line: 'LINE', x: 'X', wechat: '위챗', share: '기기 공유',
      close: '공유 바 접기', open: '공유 바 열기',
      copyHint: '링크를 복사했습니다. 카카오톡·LINE 등 대화방에 붙여넣어 보내세요.',
      wechatHint: '링크를 복사했습니다. 위챗 대화방에 붙여넣어 보내세요.'
    },
    en: {
      label: 'Share', copy: 'Copy link', whatsapp: 'WhatsApp', line: 'LINE', x: 'X', wechat: 'WeChat', share: 'Share',
      close: 'Hide share bar', open: 'Show share bar',
      copyHint: 'Link copied. Paste it into any chat or email.',
      wechatHint: 'Link copied — paste it into a WeChat chat.'
    },
    zh: {
      label: '分享', copy: '复制链接', whatsapp: 'WhatsApp', line: 'LINE', x: 'X', wechat: '微信', share: '系统分享',
      close: '收起分享栏', open: '展开分享栏',
      copyHint: '链接已复制，可粘贴到微信、LINE 或邮件中发送。',
      wechatHint: '链接已复制，打开微信粘贴到聊天即可。'
    },
    ja: {
      label: '共有', copy: 'リンクをコピー', whatsapp: 'WhatsApp', line: 'LINE', x: 'X', wechat: 'WeChat', share: '端末で共有',
      close: '共有バーを閉じる', open: '共有バーを開く',
      copyHint: 'リンクをコピーしました。LINE やメールに貼り付けて送れます。',
      wechatHint: 'リンクをコピーしました。WeChat のトークに貼り付けてください。'
    }
  }[L];

  var ICON = {
    copy: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="1.5"></rect><path d="M15 5H5v10"></path></svg>',
    whatsapp: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.8 20.2l1.3-3.6A8.1 8.1 0 1 1 8 19.1l-4.2 1.1z"></path><path d="M9.1 8.3c-.3 0-.6.1-.8.4-.3.3-.6.8-.6 1.4 0 .7.4 1.5.9 2.2.6.8 1.3 1.5 2.2 2 .8.4 1.5.6 2 .5.5-.1.9-.4 1.1-.7.2-.3.3-.6.2-.9 0-.1-.1-.2-.2-.2l-1.3-.6c-.1-.1-.3 0-.4.1l-.5.6c-.1.1-.2.2-.4.1-.5-.2-1-.5-1.4-.9-.4-.4-.7-.8-.9-1.3 0-.2 0-.3.1-.4l.5-.5c.1-.1.1-.3.1-.4l-.6-1.3c-.1-.2-.2-.2-.4-.2z"></path></svg>',
    line: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4.3c-4.3 0-7.8 2.7-7.8 6.1 0 3 2.5 5.5 6 6 .3 0 .6.2.7.5l.2 1.1c0 .2.2.4.4.4l.3-.1 1.7-1.1c.2-.1.4-.2.6-.2h.3c3.9-.2 6.9-2.7 6.9-5.9 0-3.4-3.5-6.1-7.8-6.1z"></path><path d="M7.9 8.6h8.2M7.9 11.7h5.6"></path></svg>',
    x: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4l16 16M20 4L4 20"></path></svg>',
    wechat: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 4.6c-3.5 0-6.4 2.3-6.4 5.3 0 1.7 1 3.1 2.5 4.1l-.6 1.9 2.3-1.1c.7.2 1.4.3 2.2.3"></path><path d="M14.6 9c2.7 0 4.9 1.8 4.9 4 0 1.3-.8 2.4-2 3.2l.5 1.5-1.8-.9c-.5.1-1 .2-1.6.2-2.7 0-4.9-1.8-4.9-4S11.9 9 14.6 9z"></path></svg>',
    share: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 16V4M8 8l4-4 4 4M5 14v5h14v-5"></path></svg>',
    close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"></path></svg>'
  };

  /* 공유 주소 — 기사 페이지는 app.js 가 canonical 을 정하므로 누를 때 읽습니다. */
  function shareUrl() {
    var link = document.querySelector('link[rel="canonical"]');
    var href = link && link.getAttribute('href');
    if (href && /^https?:/i.test(href)) return href;
    return window.location.href.split('#')[0];
  }

  function toast(msg) {
    var el = document.getElementById('ib-fs-toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'ib-fs-toast';
      el.className = 'ib-fs-toast';
      el.setAttribute('role', 'status');
      el.setAttribute('aria-live', 'polite');
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.classList.add('is-on');
    clearTimeout(el._t);
    el._t = setTimeout(function () { el.classList.remove('is-on'); }, 3200);
  }

  function copyText(text, hint) {
    var done = function () { toast(hint || T.copyHint); };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(function () { legacyCopy(text, done); });
    } else {
      legacyCopy(text, done);
    }
  }

  function legacyCopy(text, done) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.cssText = 'position:fixed;top:-1000px;opacity:0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); done(); } catch (e) { /* noop */ }
    document.body.removeChild(ta);
  }

  function btn(kind, label, inner) {
    return '<button type="button" class="ib-fs-btn" data-fs="' + kind + '" aria-label="' + label +
      '" title="' + label + '">' + inner + '<span class="ib-fs-txt">' + label + '</span></button>';
  }

  function build() {
    if (document.querySelector('.ib-fs')) return;
    var bar = document.createElement('div');
    bar.className = 'ib-fs';
    bar.setAttribute('role', 'group');
    bar.setAttribute('aria-label', T.label);

    var xHref = 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(document.title) +
      '&url=' + encodeURIComponent(shareUrl());
    var lineHref = 'https://social-plugins.line.me/lineit/share?url=' + encodeURIComponent(shareUrl()) +
      '&text=' + encodeURIComponent(document.title);
    var waHref = 'https://wa.me/?text=' + encodeURIComponent(document.title + ' ' + shareUrl());

    bar.innerHTML =
      '<span class="ib-fs-head">' + T.label + '</span>' +
      btn('copy', T.copy, ICON.copy) +
      '<a class="ib-fs-btn" data-fs="wa" href="' + waHref + '" target="_blank" rel="noopener noreferrer" aria-label="' +
        T.whatsapp + ' ' + T.label + '" title="' + T.whatsapp + '">' + ICON.whatsapp + '<span class="ib-fs-txt">' + T.whatsapp + '</span></a>' +
      btn('wechat', T.wechat, ICON.wechat) +
      '<a class="ib-fs-btn" data-fs="line" href="' + lineHref + '" target="_blank" rel="noopener noreferrer" aria-label="' +
        T.line + ' ' + T.label + '" title="' + T.line + '">' + ICON.line + '<span class="ib-fs-txt">' + T.line + '</span></a>' +
      '<a class="ib-fs-btn" data-fs="x" href="' + xHref + '" target="_blank" rel="noopener noreferrer" aria-label="X ' +
        T.label + '" title="X">' + ICON.x + '<span class="ib-fs-txt">X</span></a>' +
      btn('native', T.share, ICON.share) +
      '<button type="button" class="ib-fs-close" data-fs="close" aria-label="' + T.close + '" title="' + T.close + '">' + ICON.close + '</button>';

    document.body.appendChild(bar);
    /* 좁은 화면에서 본문 끝이 바에 가리지 않도록 아래 여백을 미리 확보합니다. */
    document.body.classList.add('ib-has-fs');

    var mini = document.createElement('button');
    mini.type = 'button';
    mini.className = 'ib-fs-mini';
    mini.setAttribute('aria-label', T.open);
    mini.setAttribute('title', T.open);
    mini.innerHTML = ICON.share;
    document.body.appendChild(mini);

    var native = bar.querySelector('[data-fs="native"]');
    if (!navigator.share) native.hidden = true;

    bar.addEventListener('click', function (e) {
      var t = e.target.closest ? e.target.closest('[data-fs]') : null;
      if (!t) return;
      var kind = t.getAttribute('data-fs');
      if (kind === 'copy') copyText(shareUrl());
      else if (kind === 'wechat') copyText(shareUrl(), T.wechatHint);
      else if (kind === 'native') {
        if (navigator.share) {
          navigator.share({ title: document.title, url: shareUrl() }).catch(function () {});
        }
      } else if (kind === 'close') {
        hide();
      }
    });

    mini.addEventListener('click', function () { show(true); });

    /* 링크 공유 주소는 canonical 이 늦게 정해질 수 있어 누를 때 갱신하지 않고,
       표시 시점과 스크롤 정지 시점에 한 번씩 맞춰 둡니다. */
    bar.addEventListener('click', refresh, true);
  }

  function refresh() {
    var bar = document.querySelector('.ib-fs');
    if (!bar) return;
    var u = encodeURIComponent(shareUrl());
    var tx = encodeURIComponent(document.title);
    var line = bar.querySelector('[data-fs="line"]');
    var x = bar.querySelector('[data-fs="x"]');
    var wa = bar.querySelector('[data-fs="wa"]');
    if (line) line.href = 'https://social-plugins.line.me/lineit/share?url=' + u + '&text=' + tx;
    if (x) x.href = 'https://twitter.com/intent/tweet?text=' + tx + '&url=' + u;
    if (wa) wa.href = 'https://wa.me/?text=' + tx + '%20' + u;
  }

  var HIDE_KEY = 'ib-fs-hidden';

  /* 레이아웃 — 본문 왼쪽에 바를 놓을 여백이 있는지 재서 세로 바/하단 바를 고릅니다.
     (기사·도구 페이지마다 본문 폭이 달라 고정 위치로는 글자를 가립니다) */
  var RAIL_W = 52, GAP = 12, MIN_MARGIN = 10;

  function contentLeft() {
    var sels = ['main h1', 'main p', 'main .card', 'main article', 'main table', 'main .container', 'main'];
    var min = Infinity;
    for (var i = 0; i < sels.length; i++) {
      var list = document.querySelectorAll(sels[i]);
      for (var k = 0; k < list.length && k < 40; k++) {
        var r = list[k].getBoundingClientRect();
        if (r.width > 120 && r.left > 0) min = Math.min(min, r.left);
      }
    }
    return min === Infinity ? window.innerWidth : min;
  }

  function layout() {
    var bar = document.querySelector('.ib-fs');
    if (!bar) return;
    var left = contentLeft() - RAIL_W - GAP;
    var useRail = window.innerWidth >= 1280 && left >= MIN_MARGIN;
    if (useRail) {
      bar.style.left = Math.round(left) + 'px';
      document.body.classList.add('ib-fs-rail');
    } else {
      bar.style.left = '';
      document.body.classList.remove('ib-fs-rail');
    }
  }

  function hide() {
    document.body.classList.remove('ib-fs-on');
    document.body.classList.add('ib-fs-off');
    try { sessionStorage.setItem(HIDE_KEY, '1'); } catch (e) { /* noop */ }
  }

  function show(fromMini) {
    document.body.classList.remove('ib-fs-off');
    document.body.classList.add('ib-fs-on');
    if (fromMini) { try { sessionStorage.removeItem(HIDE_KEY); } catch (e) { /* noop */ } }
  }

  function tick() {
    var y = window.pageYOffset || document.documentElement.scrollTop || 0;
    if (y > 320) {
      var off = false;
      try { off = sessionStorage.getItem(HIDE_KEY) === '1'; } catch (e) { /* noop */ }
      document.body.classList.add('ib-fs-ready');
      if (!off) document.body.classList.add('ib-fs-on');
    } else {
      document.body.classList.remove('ib-fs-ready');
      document.body.classList.remove('ib-fs-on');
    }
    refresh();
  }

  function boot() {
    build();
    layout();
    try { if (sessionStorage.getItem(HIDE_KEY) === '1') document.body.classList.add('ib-fs-off'); } catch (e) { /* noop */ }
    var raf = false;
    window.addEventListener('scroll', function () {
      if (raf) return;
      raf = true;
      window.requestAnimationFrame(function () { raf = false; tick(); });
    }, { passive: true });
    var rz = false;
    window.addEventListener('resize', function () {
      if (rz) return;
      rz = true;
      setTimeout(function () { rz = false; layout(); }, 180);
    });
    tick();
    /* 기사·도구 화면은 내용이 비동기로 그려지므로 잠시 뒤 다시 재어 봅니다. */
    [600, 1600, 3000].forEach(function (ms) { setTimeout(function () { layout(); refresh(); }, ms); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
