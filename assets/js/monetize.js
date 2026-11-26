/* =========================================================
   INSIGHT BRIEF — 수익화 접수 (뉴스레터 구독 / 문의)
   - Supabase 프로젝트 insight-brief(gsyqduysdzoifvyovfsc)의 공개 publishable 키만 쓴다.
   - 구독: public.newsletter_subscribers 에 바로 INSERT (SELECT 권한 없음, RLS)
   - 문의: public.inquiries 에 INSERT (kind: ad·b2b·saju·other)
   - 실패하면 contact@insightbriefnews.com 메일 링크를 만들어 준다.
   마크업 계약
     <form data-ib-newsletter>            input[name=email], [data-ib-msg]
     <form data-ib-inquiry data-kind=ad data-source="ad.html">
           [name=name] [name=email] [name=phone] [name=message] select[name=kind](선택) [data-ib-msg]
   ========================================================= */
(function () {
  'use strict';

  var API = {
    url: 'https://gsyqduysdzoifvyovfsc.supabase.co',
    key: 'sb_publishable_3AGJcDCF27lkTlaKYrIgKg_9kRPJZZ3',
    mail: 'contact@insightbriefnews.com'
  };

  var MESSAGES = {
    invalid_email: '이메일 주소 형식이 올바르지 않습니다.',
    contact_required: '회신받으실 이메일이나 연락처를 하나는 남겨 주세요.',
    message_too_short: '내용을 5자 이상 적어 주세요.',
    message_too_long: '내용은 4,000자까지 보낼 수 있습니다.',
    invalid_kind: '문의 유형을 다시 골라 주세요.',
    rate_limited: '짧은 시간에 여러 번 접수되었습니다. 잠시 뒤 다시 시도해 주세요.',
    duplicate: '이미 구독 중인 주소입니다.'
  };

  function post(table, body) {
    return fetch(API.url + '/rest/v1/' + table, {
      method: 'POST',
      headers: {
        'apikey': API.key,
        'Authorization': 'Bearer ' + API.key,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(body)
    }).then(function (res) {
      if (res.ok) return true;
      return res.text().then(function (text) {
        var data = null;
        try { data = text ? JSON.parse(text) : null; } catch (e) { data = null; }
        var code = 'http_' + res.status;
        if (data && data.code === '23505') code = 'duplicate';
        else if (data && data.message) code = data.message;
        var err = new Error(code);
        err.code = code;
        throw err;
      });
    });
  }

  function sourceOf() {
    var p = window.location.pathname.replace(/^\/+/, '');
    return (p || 'index.html') + (window.location.hash || '');
  }

  function subscribe(email) {
    return post('newsletter_subscribers', {
      email: email,
      source_page: sourceOf(),
      referrer: (document.referrer || '').slice(0, 200)
    });
  }

  function inquire(data) {
    return post('inquiries', {
      kind: data.kind || 'other',
      name: data.name || null,
      email: data.email || null,
      phone: data.phone || null,
      message: data.message,
      source_page: data.source || sourceOf()
    });
  }

  function mailtoLink(subject, body) {
    return 'mailto:' + API.mail +
      '?subject=' + encodeURIComponent(subject) +
      '&body=' + encodeURIComponent(body);
  }

  function setMsg(host, text, cls) {
    if (!host) return;
    host.className = 'mo-msg' + (cls ? ' ' + cls : '');
    host.innerHTML = text;
    host.hidden = false;
  }

  function msgHost(form) {
    return form.querySelector('[data-ib-msg]') || form.parentNode.querySelector('[data-ib-msg]');
  }

  function busy(form, on) {
    var btn = form.querySelector('button[type="submit"]');
    if (!btn) return;
    if (on) {
      btn.dataset.label = btn.textContent;
      btn.disabled = true;
      btn.textContent = '보내는 중…';
    } else {
      btn.disabled = false;
      if (btn.dataset.label) btn.textContent = btn.dataset.label;
    }
  }

  /* ---------------- 뉴스레터 ---------------- */
  function handleNewsletter(form) {
    var input = form.querySelector('input[name="email"]');
    var email = input ? (input.value || '').trim() : '';
    var host = msgHost(form);
    if (!email) {
      setMsg(host, '이메일 주소를 입력해 주세요.', 'is-err');
      if (input) input.focus();
      return;
    }
    busy(form, true);
    subscribe(email).then(function () {
      busy(form, false);
      form.classList.add('is-done');
      if (input) input.disabled = true;
      setMsg(host, '구독 신청이 접수되었습니다. 다음 금요일 브리핑부터 보내 드립니다.', 'is-ok');
    }).catch(function (err) {
      busy(form, false);
      if (err.code === 'duplicate') {
        form.classList.add('is-done');
        if (input) input.disabled = true;
        setMsg(host, MESSAGES.duplicate + ' 받은편지함의 스팸함도 한 번 확인해 주세요.', 'is-ok');
        return;
      }
      var why = MESSAGES[err.code] || '접수하지 못했습니다.';
      setMsg(host, why + ' <a href="' + mailtoLink('[인사이트 브리프] 주간 브리핑 구독 신청',
        '구독 신청 이메일: ' + email + '\n\n위 주소로 주간 브리핑을 받고 싶습니다.') + '">메일로 보내기</a>', 'is-err');
    });
  }

  /* ---------------- 문의 ---------------- */
  var KIND_LABELS = { ad: '광고·스폰서', b2b: 'B2B 소싱·원가', saju: '사주 PDF 사전신청', other: '기타 문의' };

  function handleInquiry(form) {
    var get = function (n) {
      var el = form.querySelector('[name="' + n + '"]');
      return el ? (el.value || '').trim() : '';
    };
    var kindEl = form.querySelector('[name="kind"]');
    var kind = kindEl ? kindEl.value : (form.getAttribute('data-kind') || 'other');
    var data = {
      kind: kind,
      name: get('name'),
      email: get('email'),
      phone: get('phone'),
      message: get('message'),
      source: form.getAttribute('data-source') || sourceOf()
    };
    var topicEl = form.querySelector('select[name="topic"]');
    if (topicEl && topicEl.selectedIndex >= 0) {
      var topic = (topicEl.options[topicEl.selectedIndex].text || '').trim();
      if (topic) data.message = '[' + topic + '] ' + data.message;
    }
    var host = msgHost(form);

    if (!data.message) {
      setMsg(host, '문의 내용을 적어 주세요.', 'is-err');
      return;
    }
    if (!data.email && !data.phone) {
      setMsg(host, MESSAGES.contact_required, 'is-err');
      return;
    }

    busy(form, true);
    inquire(data).then(function () {
      busy(form, false);
      var done = document.createElement('div');
      done.className = 'mo-done';
      done.setAttribute('role', 'status');
      done.innerHTML = '<b>접수되었습니다.</b> 남겨 주신 연락처로 영업일 기준 1~2일 안에 회신드립니다. ' +
        '급하면 <a href="' + mailtoLink('[' + (KIND_LABELS[kind] || '문의') + '] 인사이트 브리프 문의',
          data.message + '\n\n---\n이름: ' + (data.name || '(미기재)') +
          '\n이메일: ' + (data.email || '(미기재)') + '\n연락처: ' + (data.phone || '(미기재)')) +
        '">' + API.mail + '</a> 로도 보낼 수 있습니다.';
      form.parentNode.insertBefore(done, form.nextSibling);
      form.hidden = true;
      var again = document.createElement('button');
      again.type = 'button';
      again.className = 'mo-again';
      again.textContent = '다른 문의 작성';
      again.addEventListener('click', function () {
        done.parentNode.removeChild(done);
        form.hidden = false;
        form.reset();
        var first = form.querySelector('input,select,textarea');
        if (first) first.focus();
      });
      done.appendChild(document.createElement('br'));
      done.appendChild(again);
    }).catch(function (err) {
      busy(form, false);
      var why = MESSAGES[err.code] || '접수하지 못했습니다.';
      setMsg(host, why + ' <a href="' + mailtoLink('[' + (KIND_LABELS[kind] || '문의') + '] 인사이트 브리프 문의',
        data.message + '\n\n---\n이름: ' + (data.name || '(미기재)') +
        '\n이메일: ' + (data.email || '(미기재)') + '\n연락처: ' + (data.phone || '(미기재)')) +
        '">' + API.mail + ' 로 메일 보내기</a>', 'is-err');
    });
  }

  document.addEventListener('submit', function (e) {
    var form = e.target;
    if (!form || !form.matches) return;
    var isNews = form.matches('[data-ib-newsletter]');
    var isInq = form.matches('[data-ib-inquiry]');
    if (!isNews && !isInq) return;
    e.preventDefault();
    e.stopPropagation();
    if (isNews) handleNewsletter(form);
    else handleInquiry(form);
  }, true);

  window.IBApi = {
    subscribe: subscribe,
    inquire: inquire,
    mail: API.mail,
    kindLabels: KIND_LABELS
  };
})();
