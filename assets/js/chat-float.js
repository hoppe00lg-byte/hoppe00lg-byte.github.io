/* =========================================================
   INSIGHT BRIEF — 플로팅 상담 위젯 (5개 메신저 통합, 4개국어)
   · 우측 하단 알약(pill) 버튼(아이콘 + 상담 문의 라벨) → 패널(WhatsApp · LINE · WeChat · 카카오톡 오픈채팅 · 텔레그램)
   · WeChat 은 QR 모달(assets/img/wechat-qr.png)로 엽니다.
   · 기존 플로팅 공유 바(share-float.js) · 맨 위로(.to-top)와 겹치지 않도록
     위치는 assets/css/chat.css 가 잡고, 이 스크립트는 body.ib-has-chat 클래스만 답니다.
   · 라벨은 <html lang> 에 맞춰 한국어/영어/중국어/일본어로 표시합니다.
   ========================================================= */
(function () {
  'use strict';

  var html = document.documentElement;
  var raw = (html.getAttribute('lang') || 'ko').toLowerCase();
  var L = /^en/.test(raw) ? 'en' : /^zh/.test(raw) ? 'zh' : /^ja/.test(raw) ? 'ja' : 'ko';

  var T = {
    ko: {
      kicker: 'CONTACT', title: '상담 문의', sub: '원하시는 채널로 바로 연락하실 수 있습니다.',
      pill: '상담 문의', launch: '상담 문의 열기', close: '닫기',
      wa: 'WhatsApp', waSub: '해외 문의',
      line: 'LINE', lineSub: 'LINE 문의',
      wechat: '위챗', wechatSub: 'QR 코드 스캔',
      kakao: '카카오톡 오픈채팅', kakaoSub: '오픈채팅 문의',
      tg: '텔레그램', tgSub: '채널 · 제보',
      wechatTitle: '위챗으로 상담하기',
      wechatHint: '위챗 앱의 ‘스캔’으로 QR 코드를 찍거나, 아래 링크를 위챗에서 열어 주세요.',
      copy: '링크 복사', copied: '링크를 복사했습니다. 위챗에 붙여넣어 주세요.', open: '링크 열기',
      qrAlt: '위챗 상담 QR 코드'
    },
    en: {
      kicker: 'CONTACT', title: 'Contact us', sub: 'Reach the desk on the channel you prefer.',
      pill: 'Contact', launch: 'Open contact options', close: 'Close',
      wa: 'WhatsApp', waSub: 'International',
      line: 'LINE', lineSub: 'LINE chat',
      wechat: 'WeChat', wechatSub: 'Scan the QR code',
      kakao: 'KakaoTalk Open Chat', kakaoSub: 'Open chat',
      tg: 'Telegram', tgSub: 'Channel & tips',
      wechatTitle: 'Chat on WeChat',
      wechatHint: 'Scan the QR code with WeChat, or open the link below in WeChat.',
      copy: 'Copy link', copied: 'Link copied — paste it into WeChat.', open: 'Open link',
      qrAlt: 'WeChat contact QR code'
    },
    zh: {
      kicker: 'CONTACT', title: '联系编辑部', sub: '请选择您方便的渠道与我们联系。',
      pill: '联系咨询', launch: '打开联系方式', close: '关闭',
      wa: 'WhatsApp', waSub: '海外咨询',
      line: 'LINE', lineSub: 'LINE 咨询',
      wechat: '微信', wechatSub: '扫描二维码',
      kakao: 'KakaoTalk 开放聊天', kakaoSub: '开放聊天咨询',
      tg: 'Telegram', tgSub: '频道 · 线索',
      wechatTitle: '用微信联系',
      wechatHint: '请用微信“扫一扫”扫描二维码，或在微信中打开下方链接。',
      copy: '复制链接', copied: '链接已复制，可在微信中粘贴。', open: '打开链接',
      qrAlt: '微信联系二维码'
    },
    ja: {
      kicker: 'CONTACT', title: 'お問い合わせ', sub: 'ご希望のチャネルから直接ご連絡いただけます。',
      pill: 'お問い合わせ', launch: 'お問い合わせを開く', close: '閉じる',
      wa: 'WhatsApp', waSub: '海外のお問い合わせ',
      line: 'LINE', lineSub: 'LINE 相談',
      wechat: 'WeChat', wechatSub: 'QR コードをスキャン',
      kakao: 'カカオトーク オープンチャット', kakaoSub: 'オープンチャット相談',
      tg: 'Telegram', tgSub: 'チャンネル · 情報提供',
      wechatTitle: 'WeChat で相談する',
      wechatHint: 'WeChat のスキャンで QR コードを読み取るか、下のリンクを WeChat で開いてください。',
      copy: 'リンクをコピー', copied: 'リンクをコピーしました。WeChat に貼り付けてください。', open: 'リンクを開く',
      qrAlt: 'WeChat お問い合わせ QR コード'
    }
  }[L];

  /* 사용자가 확정한 채널 링크 (2026-11-24) */
  var LINKS = {
    whatsapp: 'https://wa.me/821082888658',
    line: 'https://line.me/ti/p/2Fl3Lc-4us',
    kakao: 'https://open.kakao.com/o/prc7jqYi',
    telegram: 'https://t.me/blockbrief_kr',
    /* 위챗 QR(IMG_0659)에서 해독한 개인 연락 링크 — 데스크톱에서 QR 을 찍기 어려울 때 씁니다. */
    wechat: 'https://u.wechat.com/kG4FQ5o4KkB2BCJD7k6tZh4?s=2'
  };

  var ICON = {
    chat: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M20.5 11.6c0 3.9-3.8 7-8.5 7-.9 0-1.8-.1-2.6-.3l-4.4 1.6 1.2-3.3c-1.4-1.3-2.2-3-2.2-5 0-3.9 3.8-7 8.5-7s8 3.1 8 7z"/><path d="M8.6 11.6h.01M12 11.6h.01M15.4 11.6h.01"/></svg>',
    wa: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3.8 20.2l1.3-3.6A8.1 8.1 0 1 1 8 19.1l-4.2 1.1z"/><path d="M9.1 8.3c-.3 0-.6.1-.8.4-.3.3-.6.8-.6 1.4 0 .7.4 1.5.9 2.2.6.8 1.3 1.5 2.2 2 .8.4 1.5.6 2 .5.5-.1.9-.4 1.1-.7.2-.3.3-.6.2-.9 0-.1-.1-.2-.2-.2l-1.3-.6c-.1-.1-.3 0-.4.1l-.5.6c-.1.1-.2.2-.4.1-.5-.2-1-.5-1.4-.9-.4-.4-.7-.8-.9-1.3 0-.2 0-.3.1-.4l.5-.5c.1-.1.1-.3.1-.4l-.6-1.3c-.1-.2-.2-.2-.4-.2z"/></svg>',
    line: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4.3c-4.3 0-7.8 2.7-7.8 6.1 0 3 2.5 5.5 6 6 .3 0 .6.2.7.5l.2 1.1c0 .2.2.4.4.4l.3-.1 1.7-1.1c.2-.1.4-.2.6-.2h.3c3.9-.2 6.9-2.7 6.9-5.9 0-3.4-3.5-6.1-7.8-6.1z"/><path d="M7.9 8.3v4.2M7.9 8.3h1.4M11 8.3v4.2M11 12.5h1.5M15 8.3v4.2h1.6"/></svg>',
    wechat: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M10 4.6c-3.5 0-6.4 2.3-6.4 5.3 0 1.6 1 3.1 2.5 4.1l-.6 1.9 2.3-1.1c.7.2 1.4.3 2.2.3"/><path d="M14.6 9c2.7 0 4.9 1.8 4.9 4 0 1.3-.8 2.4-2 3.2l.5 1.5-1.8-.9c-.5.1-1 .2-1.6.2-2.7 0-4.9-1.8-4.9-4S11.9 9 14.6 9z"/></svg>',
    kakao: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4.4c-4.4 0-8 2.7-8 6 0 2 1.4 3.8 3.5 4.9l-.8 2.8 3.1-1.7c.7.1 1.4.2 2.2.2 4.4 0 8-2.7 8-6s-3.6-6.2-8-6.2z"/><path d="M8.9 10.6h.01M12 10.6h.01M15.1 10.6h.01"/></svg>',
    tg: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20.4 4.6 3.9 11.2c-.5.2-.5.9 0 1.1l4.1 1.4 1.5 4.7c.2.5.8.6 1.1.2l2.2-2.1 4.1 3c.4.3.9.1 1-.3l2.4-13.7c.1-.5-.4-.9-.9-.7z"/><path d="m8 13.7 8.9-6.1-7.1 7.1"/></svg>',
    go: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M8 16 16 8M9 8h7v7"/></svg>',
    close: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    copy: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="11" height="11" rx="1.5"/><path d="M15 5H5v10"/></svg>'
  };

  /* ---------- 위챗 QR 이미지 경로: 이 스크립트의 src 를 기준으로 계산 ---------- */
  function assetBase() {
    var s = document.currentScript;
    if (!s) {
      var all = document.querySelectorAll('script[src*="chat-float.js"]');
      s = all[all.length - 1];
    }
    var src = s && s.getAttribute('src');
    if (src && /js\/chat-float\.js/.test(src)) return src.replace(/js\/chat-float\.js.*$/, '');
    return 'assets/';
  }
  var QR_SRC = assetBase() + 'img/wechat-qr.png';

  function row(kind, href, name, sub) {
    return '<li><a class="ib-cf-row" data-cf="' + kind + '" href="' + href +
      '" target="_blank" rel="noopener noreferrer">' +
      '<span class="ib-cf-ic is-' + kind + '">' + ICON[kind] + '</span>' +
      '<span class="ib-cf-txt"><b>' + name + '</b><em>' + sub + '</em></span>' +
      '<span class="ib-cf-go">' + ICON.go + '</span></a></li>';
  }

  function build() {
    if (document.getElementById('ib-cf')) return;
    document.body.classList.add('ib-has-chat');

    var wrap = document.createElement('div');
    wrap.className = 'ib-cf';
    wrap.id = 'ib-cf';

    wrap.innerHTML =
      '<div class="ib-cf-panel" id="ib-cf-panel" role="dialog" aria-modal="false" aria-labelledby="ib-cf-title" hidden>' +
        '<div class="ib-cf-head">' +
          '<span class="ib-cf-kicker">' + T.kicker + '</span>' +
          '<h3 id="ib-cf-title">' + T.title + '</h3>' +
          '<p>' + T.sub + '</p>' +
          '<button type="button" class="ib-cf-x" data-cf="close" aria-label="' + T.close + '">' + ICON.close + '</button>' +
        '</div>' +
        '<ul class="ib-cf-list">' +
          row('wa', LINKS.whatsapp, T.wa, T.waSub) +
          row('line', LINKS.line, T.line, T.lineSub) +
          '<li><button type="button" class="ib-cf-row" data-cf="wechat">' +
            '<span class="ib-cf-ic is-wechat">' + ICON.wechat + '</span>' +
            '<span class="ib-cf-txt"><b>' + T.wechat + '</b><em>' + T.wechatSub + '</em></span>' +
            '<span class="ib-cf-go">' + ICON.go + '</span></button></li>' +
          row('kakao', LINKS.kakao, T.kakao, T.kakaoSub) +
          row('tg', LINKS.telegram, T.tg, T.tgSub) +
        '</ul>' +
      '</div>' +
      '<button type="button" class="ib-cf-launch" id="ib-cf-launch" aria-expanded="false" aria-controls="ib-cf-panel" aria-label="' + T.launch + '" title="' + T.launch + '">' +
        ICON.chat +
        '<span class="ib-cf-launch-txt">' + T.pill + '</span>' +
      '</button>';

    document.body.appendChild(wrap);

    /* QR 모달은 다른 고정 레이어(폼 모달·토스트)보다 위에 뜨도록 body 에 따로 붙입니다. */
    var modal = document.createElement('div');
    modal.className = 'ib-cf-modal';
    modal.id = 'ib-cf-modal';
    modal.hidden = true;
    modal.innerHTML =
      '<div class="ib-cf-backdrop" data-cf="modal-close"></div>' +
      '<div class="ib-cf-card" role="dialog" aria-modal="true" aria-labelledby="ib-cf-mtitle">' +
        '<button type="button" class="ib-cf-x" data-cf="modal-close" aria-label="' + T.close + '">' + ICON.close + '</button>' +
        '<span class="ib-cf-kicker">WeChat</span>' +
        '<h3 id="ib-cf-mtitle">' + T.wechatTitle + '</h3>' +
        '<div class="ib-cf-qr"><img src="' + QR_SRC + '" alt="' + T.qrAlt + '" width="640" height="640" loading="lazy" decoding="async"></div>' +
        '<p class="ib-cf-hint">' + T.wechatHint + '</p>' +
        '<p class="ib-cf-link"><a href="' + LINKS.wechat + '" target="_blank" rel="noopener noreferrer">' + LINKS.wechat + '</a></p>' +
        '<button type="button" class="ib-cf-copy" data-cf="copy">' + ICON.copy + T.copy + '</button>' +
      '</div>';
    document.body.appendChild(modal);

    var launch = wrap.querySelector('.ib-cf-launch');
    var panel = wrap.querySelector('.ib-cf-panel');
    var mClose = modal.querySelector('[data-cf="modal-close"].ib-cf-x');
    var lastFocus = null;

    function openPanel() {
      panel.hidden = false;
      launch.setAttribute('aria-expanded', 'true');
      wrap.classList.add('is-open');
    }
    function closePanel(back) {
      panel.hidden = true;
      launch.setAttribute('aria-expanded', 'false');
      wrap.classList.remove('is-open');
      if (back) launch.focus();
    }
    function openModal() {
      closePanel(false);
      lastFocus = document.activeElement;
      modal.hidden = false;
      document.body.classList.add('ib-cf-modal-on');
      mClose.focus();
    }
    function closeModal() {
      modal.hidden = true;
      document.body.classList.remove('ib-cf-modal-on');
      if (lastFocus && lastFocus.focus) lastFocus.focus();
      else launch.focus();
    }

    function toast(msg) {
      var el = document.getElementById('ib-cf-toast');
      if (!el) {
        el = document.createElement('div');
        el.id = 'ib-cf-toast';
        el.className = 'ib-cf-toast';
        el.setAttribute('role', 'status');
        el.setAttribute('aria-live', 'polite');
        document.body.appendChild(el);
      }
      el.textContent = msg;
      el.classList.add('is-on');
      clearTimeout(el._t);
      el._t = setTimeout(function () { el.classList.remove('is-on'); }, 3000);
    }

    function copyLink() {
      var text = LINKS.wechat;
      var done = function () { toast(T.copied); };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done).catch(function () { legacy(text, done); });
      } else legacy(text, done);
      function legacy(t, cb) {
        var ta = document.createElement('textarea');
        ta.value = t;
        ta.setAttribute('readonly', '');
        ta.style.cssText = 'position:fixed;top:-1000px;opacity:0';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); cb(); } catch (e) { /* noop */ }
        document.body.removeChild(ta);
      }
    }

    launch.addEventListener('click', function () {
      if (panel.hidden) openPanel(); else closePanel(true);
    });

    wrap.addEventListener('click', function (e) {
      var t = e.target.closest ? e.target.closest('[data-cf]') : null;
      if (!t) return;
      var kind = t.getAttribute('data-cf');
      if (kind === 'close') closePanel(true);
      else if (kind === 'wechat') openModal();
      else if (t.tagName === 'A') closePanel(false);   /* 채널로 이동하면 패널을 접습니다 */
    });

    modal.addEventListener('click', function (e) {
      var t = e.target.closest ? e.target.closest('[data-cf]') : null;
      if (!t) return;
      var kind = t.getAttribute('data-cf');
      if (kind === 'modal-close') closeModal();
      else if (kind === 'copy') copyLink();
    });

    /* 바깥을 누르면 패널을 닫습니다(모달은 배경 클릭으로 닫힘). */
    document.addEventListener('click', function (e) {
      if (panel.hidden) return;
      if (!wrap.contains(e.target)) closePanel(false);
    }, true);

    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape' && e.key !== 'Esc') return;
      if (!modal.hidden) closeModal();
      else if (!panel.hidden) closePanel(true);
    });

    /* 좁은 화면·가로 모드에서 패널이 화면 위로 넘치지 않게 남은 높이에 맞춥니다. */
    function fit() {
      if (panel.hidden) return;
      panel.style.maxHeight = '';
      var box = panel.getBoundingClientRect();
      var avail = box.bottom - 12;
      if (box.height > avail) panel.style.maxHeight = Math.max(150, Math.round(avail)) + 'px';
    }
    window.addEventListener('resize', fit);
    var openWatcher = new MutationObserver(fit);
    openWatcher.observe(panel, { attributes: true, attributeFilter: ['hidden'] });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build);
  else build();
})();
