/* =========================================================
   INSIGHT BRIEF — 404 구제 리다이렉트 (assets/js/404-recover.js)

   주소가 조금 어긋난 경우에 실제 페이지를 찾아 보냅니다.
     · 확장자 오타           /resell.htm            → /resell.html
     · 끝에 붙은 한글·중문·일문  /market.html시장       → /market.html
     · 확장자 없는 기사 주소     /a/{id}               → /a/{id}.html
     · 기사 id 오타·구주소      /a/{id-typo}.html      → 가장 비슷한 기사
   정말 없는 주소는 그대로 404 안내 화면을 보여 줍니다(리다이렉트하지 않음).
   ========================================================= */
(function () {
  'use strict';
  var path = location.pathname || '/';
  var search = location.search || '';
  var hash = location.hash || '';

  function go(url) {
    location.replace(url + search + hash);
  }

  function candidateUrls() {
    var out = [];
    function add(u) { if (u && u.charAt(0) === '/' && out.indexOf(u) === -1 && u !== path) out.push(u); }
    /* 주소창의 한글은 퍼센트 인코딩(%EC%8B%9C…)이라 먼저 풀어서 봅니다. */
    var decoded = path;
    try { decoded = decodeURIComponent(path); } catch (e) { decoded = path; }
    var ascii = (decoded.match(/^[\x21-\x7E]+/) || [''])[0];
    var bases = [];
    /* '/market.html시장' 처럼 URL 뒤에 다른 문자권 글자가 붙은 주소는 앞의 ASCII 부분을 먼저 봅니다. */
    if (ascii && ascii.length > 1 && ascii !== decoded) bases.push(ascii);
    bases.push(decoded);
    if (decoded !== path) bases.push(path);
    bases.forEach(function (p) {
      var noSlash = p.replace(/\/+$/, '');
      add(noSlash);
      if (/\.htm$/i.test(p)) add(p.replace(/\.htm$/i, '.html'));
      if (/\/index\.html?$/i.test(p)) add(p.replace(/\/index\.html?$/i, '/'));
      if (p.charAt(p.length - 1) === '/') add(p + 'index.html');
      if (!/\.[a-z0-9]{2,5}$/i.test(noSlash)) { add(noSlash + '.html'); add(noSlash + '/index.html'); }
      if (noSlash !== '') add(noSlash + '/');
    });
    return out;
  }

  function exists(url) {
    return fetch(url, { method: 'HEAD', cache: 'no-store' }).then(function (r) {
      return !!(r && r.ok);
    }).catch(function () { return false; });
  }

  function tryNext(list, i) {
    if (i >= list.length) return Promise.reject(new Error('none'));
    return exists(list[i]).then(function (ok) {
      if (ok) { go(list[i]); return new Promise(function () {}); }
      return tryNext(list, i + 1);
    });
  }

  /* 기사 id 오타·구주소 살리기 */
  function closestArticle() {
    var m = /^(\/(?:en|zh|ja))?\/a\/([^\/]+?)(?:\.html?)?$/.exec(path);
    var id = m ? decodeURIComponent(m[2]) : '';
    var lang = m && m[1] ? m[1] : '';
    if (!id && /\/article\.html$/.test(path)) {
      var q = new URLSearchParams(search);
      id = q.get('id') || q.get('slug') || '';
      var lm = /^\/(en|zh|ja)\//.exec(path);
      lang = lm ? '/' + lm[1] : '';
    }
    if (!id) return Promise.reject(new Error('none'));
    var dataUrl = lang ? lang + '/data/articles.json' : '/data/articles.json';
    return fetch(dataUrl, { cache: 'no-store' }).then(function (r) {
      return r.ok ? r.json() : [];
    }).then(function (list) {
      var norm = function (s) { return String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim(); };
      var want = norm(id);
      if (!want) throw new Error('none');
      var wantTokens = want.split(' ').filter(function (t) { return t.length > 2; });
      var best = null, bestScore = 0;
      (list || []).forEach(function (a) {
        if (!a || !a.id) return;
        var have = norm(a.id);
        if (have === want) { best = a.id; bestScore = 2; return; }
        var score = 0;
        if (have.indexOf(want) === 0 || want.indexOf(have) === 0) score += 1;
        var haveTokens = have.split(' ');
        var hit = 0;
        wantTokens.forEach(function (t) { if (haveTokens.indexOf(t) !== -1) hit += 1; });
        if (wantTokens.length) score += hit / wantTokens.length;
        if (score > bestScore) { bestScore = score; best = a.id; }
      });
      if (!best || bestScore < 1) throw new Error('none');
      go((lang || '') + '/a/' + encodeURIComponent(best) + '.html');
      return new Promise(function () {});
    });
  }

  var list = candidateUrls();
  (list.length ? tryNext(list, 0) : Promise.reject(new Error('none')))
    .catch(closestArticle)
    .catch(function () { /* 안내 화면 유지 */ });
})();
