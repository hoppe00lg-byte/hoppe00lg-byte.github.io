/* =========================================================
   INSIGHT BRIEF — 크리에이터 스튜디오 : Google 계정 연결 (GIS)
   · Blogger 초안/공개 게시
   · YouTube 영상 업로드 (비공개·일부공개·공개)
   토큰은 메모리에만 두고 저장하지 않습니다.
   ========================================================= */
(function () {
  'use strict';

  var CS = window.IB_CS;
  if (!CS) return;
  var S = CS.state;
  var $ = function (id) { return document.getElementById(id); };
  var t = CS.t;
  var CFG = window.IB_CREATOR_CONFIG || {};

  var SCOPES = [
    'https://www.googleapis.com/auth/youtube.upload',
    'https://www.googleapis.com/auth/blogger'
  ].join(' ');

  var oauth = {
    clientId: '',
    token: null,
    expiresAt: 0,
    client: null,
    gisReady: false,
    gisError: null,
    blogs: [],
    pendingBlog: null
  };
  var loaded = false;

  function userClientId() {
    var inp = $('up-client');
    var v = inp && inp.value ? inp.value.trim() : '';
    return v || CFG.clientId || '';
  }

  function setStatus(msg, kind) {
    var el = $('up-status');
    if (!el) return;
    el.textContent = msg;
    el.classList.toggle('is-ok', kind === 'ok');
    el.classList.toggle('is-err', kind === 'err');
  }

  function gw(path, opts) {
    opts = opts || {};
    if (!oauth.token || Date.now() > oauth.expiresAt) return Promise.reject(new Error(t('tokenExpired')));
    var headers = Object.assign({ Authorization: 'Bearer ' + oauth.token }, opts.headers || {});
    return fetch(path, Object.assign({}, opts, { headers: headers }));
  }

  /* ---------- GIS 로드 ---------- */
  function loadGis() {
    if (loaded) return Promise.resolve(!!oauth.gisReady);
    loaded = true;
    return new Promise(function (resolve) {
      var s = document.createElement('script');
      s.src = 'https://accounts.google.com/gsi/client';
      s.async = true;
      s.defer = true;
      s.onload = function () {
        oauth.gisReady = !!(window.google && window.google.accounts && window.google.accounts.oauth2);
        resolve(oauth.gisReady);
      };
      s.onerror = function () {
        oauth.gisError = 'gis-load';
        resolve(false);
      };
      document.head.appendChild(s);
    });
  }

  function ensureClient() {
    var cid = userClientId();
    if (!cid) return Promise.resolve(false);
    return loadGis().then(function (ok) {
      if (!ok) return false;
      if (oauth.client && oauth.clientId === cid) return true;
      oauth.clientId = cid;
      oauth.client = window.google.accounts.oauth2.initTokenClient({
        client_id: cid,
        scope: SCOPES,
        include_granted_scopes: true,
        callback: function (resp) {
          if (resp && resp.access_token) {
            oauth.token = resp.access_token;
            oauth.expiresAt = Date.now() + (Number(resp.expires_in || 3600) - 60) * 1000;
            onConnected();
          } else {
            setStatus(t('tokenExpired'), 'err');
          }
        },
        error_callback: function (e) {
          oauth.pendingResolve = null;
          setStatus(describeError(e && (e.type || e.message) || 'auth'), 'err');
        }
      });
      return true;
    });
  }

  function describeError(code) {
    var map = {
      popup_closed: '로그인 창이 닫혔습니다. 다시 시도해 주세요.',
      popup_failed_to_open: '팝업이 차단되었습니다. 브라우저의 팝업 허용을 확인해 주세요.',
      access_denied: '권한 승인이 취소되었습니다.',
      origin_mismatch: '이 사이트 주소가 OAuth 클라이언트의 승인된 JavaScript 원본에 없습니다.',
      idpiframe_initialization_failed: '브라우저가 서드파티 쿠키를 막고 있어 로그인 창을 열 수 없습니다.'
    };
    return map[code] || ('로그인 오류: ' + code);
  }

  function getToken() {
    if (oauth.token && Date.now() < oauth.expiresAt) return Promise.resolve(oauth.token);
    return ensureClient().then(function (ok) {
      if (!ok) throw new Error('client');
      return new Promise(function (resolve, reject) {
        oauth.pendingPromise = { resolve: resolve, reject: reject };
        try { oauth.client.requestAccessToken({ prompt: '' }); }
        catch (e) { reject(e); }
      });
    });
  }

  function signIn() {
    var cid = userClientId();
    if (!cid) { setStatus('OAuth 클라이언트 ID가 필요합니다. 아래 입력칸에 넣어 주세요.', 'err'); return; }
    setStatus('Google 로그인 창을 여는 중…');
    ensureClient().then(function (ok) {
      if (!ok) { setStatus(oauth.gisError ? 'Google 로그인 스크립트를 불러오지 못했습니다.' : 'OAuth 클라이언트 ID를 확인해 주세요.', 'err'); return; }
      oauth.pendingPromise = {
        resolve: function () { /* onConnected 처리 */ },
        reject: function (e) { setStatus(describeError(e && e.type || 'auth'), 'err'); }
      };
      try { oauth.client.requestAccessToken({ prompt: 'consent' }); }
      catch (e) { setStatus(describeError(e && e.message || 'auth'), 'err'); }
    });
  }

  function onConnected() {
    if (oauth.pendingPromise && oauth.pendingPromise.resolve) { try { oauth.pendingPromise.resolve(oauth.token); } catch (e) {} }
    oauth.pendingPromise = null;
    setStatus(t('connected') + ' · Google', 'ok');
    if ($('up-signout')) $('up-signout').hidden = false;
    if ($('up-signin')) $('up-signin').textContent = t('signIn');
    loadBlogs();
    if (oauth.pendingBlog) {
      oauth.pendingBlog = false;
      if ($('up-blog-note')) $('up-blog-note').textContent = '① 탭에서 만든 글을 ' + (S.blog ? '“' + S.blog.title + '”' : '') + '(으)로 보낼 준비가 됐습니다.';
    }
  }

  function signOut() {
    if (oauth.token && window.google && window.google.accounts && window.google.accounts.oauth2) {
      try { window.google.accounts.oauth2.revoke(oauth.token, function () {}); } catch (e) { /* 무시 */ }
    }
    oauth.token = null; oauth.expiresAt = 0; oauth.blogs = [];
    if ($('up-signout')) $('up-signout').hidden = true;
    if ($('up-blogs')) $('up-blogs').innerHTML = '<option value="">연결 후 목록이 나타납니다</option>';
    setStatus('연결을 해제했습니다. Google에 부여한 권한도 취소했습니다.');
  }

  /* ---------- Blogger ---------- */
  function loadBlogs() {
    if (!oauth.token) return;
    if ($('up-blogs')) $('up-blogs').innerHTML = '<option value="">' + t('blogsLoading') + '</option>';
    gw('https://www.googleapis.com/blogger/v3/users/self/blogs?fetchUserInfo=false&maxResults=50')
      .then(function (r) { return r.json(); })
      .then(function (j) {
        if (j.error) throw new Error(j.error.message || 'blogger');
        oauth.blogs = j.items || [];
        var sel = $('up-blogs');
        if (!sel) return;
        if (!oauth.blogs.length) { sel.innerHTML = '<option value="">' + t('blogsEmpty') + '</option>'; return; }
        sel.innerHTML = oauth.blogs.map(function (b) {
          return '<option value="' + CS.esc(b.id) + '">' + CS.esc(b.name) + '</option>';
        }).join('');
      })
      .catch(function (e) {
        if ($('up-blogs')) $('up-blogs').innerHTML = '<option value="">' + CS.esc(e.message || 'error') + '</option>';
      });
  }

  function postBlog(isDraft) {
    var doc = S.blog;
    if (!doc) { CS.toast(t('needBlogHtml')); return; }
    var blogId = $('up-blogs') && $('up-blogs').value;
    if (!blogId) { CS.toast(t('blogsEmpty')); return; }
    var note = $('up-blog-note');
    if (note) { note.className = 'cs-up-note'; note.textContent = '전송 중…'; }
    getToken().then(function () {
      return gw('https://www.googleapis.com/blogger/v3/blogs/' + encodeURIComponent(blogId) + '/posts/?isDraft=' + (isDraft ? 'true' : 'false'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=UTF-8' },
        body: JSON.stringify({ kind: 'blogger#post', title: doc.title, content: doc.articleHtml })
      });
    }).then(function (r) {
      return r.json().then(function (j) { return { ok: r.ok, status: r.status, body: j }; });
    }).then(function (res) {
      if (!res.ok) throw new Error((res.body && res.body.error && res.body.error.message) || ('HTTP ' + res.status));
      var id = res.body && res.body.id;
      if (note) { note.className = 'cs-up-note'; note.innerHTML = (isDraft ? t('draftDone') : t('publishDone')) + (id ? ' <a href="' + CS.esc(res.body.url || ('https://www.blogger.com/post-edit.g?blogID=' + blogId + '&postID=' + id)) + '" target="_blank" rel="noopener">열기</a>' : ''); }
      CS.toast(isDraft ? t('draftDone') : t('publishDone'));
    }).catch(function (e) {
      if (note) { note.className = 'cs-up-note is-err'; note.textContent = (e && e.message) || 'error'; }
      CS.toast(t('uploadFail'));
    });
  }

  /* ---------- YouTube ---------- */
  function boundary() { return '-------ib' + Math.random().toString(16).slice(2); }

  function uploadVideo() {
    var blob = S.videoBlob;
    if (!blob) { CS.toast(t('needVideo')); return; }
    var title = ($('up-yt-title-in') && $('up-yt-title-in').value || '').trim() || 'INSIGHT BRIEF Shorts';
    if (title.length > 100) title = title.slice(0, 100);
    var desc = ($('up-yt-desc') && $('up-yt-desc').value || '');
    var tags = ($('up-yt-tags') && $('up-yt-tags').value || '').split(',').map(function (s) { return s.trim(); }).filter(Boolean).slice(0, 30);
    var privacy = ($('up-yt-privacy') && $('up-yt-privacy').value) || 'private';
    var note = $('up-yt-note');
    var bar = $('up-yt-bar'), fill = $('up-yt-barfill');
    if (note) { note.className = 'cs-up-note'; note.textContent = t('progress', { p: 0 }); }
    if (bar) bar.hidden = false;
    if (fill) fill.style.width = '0%';

    getToken().then(function () {
      var meta = {
        snippet: {
          title: title,
          description: desc,
          tags: tags,
          categoryId: '22'
        },
        status: {
          privacyStatus: privacy,
          selfDeclaredMadeForKids: false
        }
      };
      var b = boundary();
      var type = blob.type || 'video/webm';
      var head = '--' + b + '\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n' + JSON.stringify(meta) + '\r\n';
      var mid = '--' + b + '\r\nContent-Type: ' + type + '\r\n\r\n';
      var tail = '\r\n--' + b + '--\r\n';
      var body = new Blob([head, mid, blob, tail], { type: 'multipart/related; boundary=' + b });

      return new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open('POST', 'https://www.googleapis.com/upload/youtube/v3/videos?uploadType=multipart&part=snippet,status', true);
        xhr.setRequestHeader('Authorization', 'Bearer ' + oauth.token);
        xhr.setRequestHeader('Content-Type', 'multipart/related; boundary=' + b);
        xhr.upload.onprogress = function (e) {
          if (!e.lengthComputable) return;
          var p = Math.round(e.loaded / e.total * 100);
          if (fill) fill.style.width = p + '%';
          if (note) note.textContent = t('progress', { p: p });
        };
        xhr.onload = function () {
          var j = {};
          try { j = JSON.parse(xhr.responseText || '{}'); } catch (e) {}
          if (xhr.status >= 200 && xhr.status < 300) resolve(j);
          else reject(new Error((j.error && j.error.message) || ('HTTP ' + xhr.status)));
        };
        xhr.onerror = function () { reject(new Error('network')); };
        xhr.send(body);
      });
    }).then(function (video) {
      if (fill) fill.style.width = '100%';
      var id = video && video.id;
      if (note) {
        note.className = 'cs-up-note';
        note.innerHTML = t('uploadDone') + (id ? ' <a href="https://www.youtube.com/watch?v=' + CS.esc(id) + '" target="_blank" rel="noopener">youtu.be/' + CS.esc(id) + '</a>' : '') + ' · ' + CS.esc(privacy);
      }
      CS.toast(t('uploadDone'));
    }).catch(function (e) {
      var msg = (e && e.message) || 'error';
      if (msg === 'client') msg = 'OAuth 클라이언트 ID가 필요합니다.';
      if (note) { note.className = 'cs-up-note is-err'; note.textContent = t('uploadFail') + ': ' + msg; }
      CS.toast(t('uploadFail'));
    });
  }

  /* ---------- ①·② 탭에서 넘어올 때 채우기 ---------- */
  function prepareBlog(doc) {
    oauth.pendingBlog = true;
    if ($('up-blog-note')) $('up-blog-note').textContent = '보낼 글: “' + (doc ? doc.title : '') + '”';
    if (!oauth.token) setStatus('글을 보내려면 Google 계정을 연결해 주세요.');
  }

  function prepareShorts(sh, input) {
    if (!sh) return;
    var pack = CS.data;
    var kw = sh.kw || input.topic || '';
    var first = (sh.scenes[0] && sh.scenes[0].h) || kw;
    if ($('up-yt-title-in') && !$('up-yt-title-in').value) $('up-yt-title-in').value = first + ' #shorts';
    if ($('up-yt-desc') && !$('up-yt-desc').value) {
      var tag = (pack.shorts.hashtags && pack.shorts.hashtags[0] || '#shorts').replace('#', '');
      $('up-yt-desc').value = CS.fill(pack.shorts.descTpl || '', { kw: kw, tag: tag });
    }
    if ($('up-yt-tags') && !$('up-yt-tags').value) {
      var tags = (pack.shorts.hashtags || []).map(function (h) { return h.replace('#', ''); });
      $('up-yt-tags').value = [kw].concat(tags).filter(Boolean).join(', ');
    }
  }

  /* ---------- 연결 ---------- */
  function init() {
    if ($('up-client') && CFG.clientId) $('up-client').value = ''; // 기본값은 config 로만 쓰고 화면엔 노출
    if ($('up-signin')) $('up-signin').addEventListener('click', signIn);
    if ($('up-signout')) $('up-signout').addEventListener('click', signOut);
    if ($('up-blogger-draft')) $('up-blogger-draft').addEventListener('click', function () { postBlog(true); });
    if ($('up-blogger-publish')) $('up-blogger-publish').addEventListener('click', function () { postBlog(false); });
    if ($('up-yt-upload')) $('up-yt-upload').addEventListener('click', uploadVideo);
    if ($('cs-toyt')) $('cs-toyt').addEventListener('click', function () {
      CS.showPanel('upload');
      prepareShorts(S.shorts, (S.shorts && S.shorts.input) || {});
    });
  }

  CS.oauth = {
    signIn: signIn, signOut: signOut, prepareBlog: prepareBlog, prepareShorts: prepareShorts,
    state: oauth, uploadVideo: uploadVideo, postBlog: postBlog
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
