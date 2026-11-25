/* =========================================================
   INSIGHT BRIEF — 써드파티 서비스 설정 · 로더
   새 서비스를 붙일 때는 아래 VENDORS 에 ID 한 줄만 추가하면
   전 페이지(한국어·영어·중국어·일본어)에 그대로 적용됩니다.
   · oneSignal : 웹 푸시 (OneSignal Web SDK v16)
   · clarity   : Microsoft Clarity 히트맵·세션 리코딩 (프로젝트 ID 입력 시 자동 로드)
   ========================================================= */
(function () {
  'use strict';

  var VENDORS = {
    oneSignal: {
      appId: 'a9c426d7-5792-4b23-8624-21bb802a6a94',
      workerPath: '/OneSignalSDKWorker.js',
      updaterPath: '/OneSignalSDK.sw.js'
    },
    clarity: {
      projectId: 'ziffio2pxy'  /* 2026-11-24 발급 — Microsoft Clarity 프로젝트 */
    }
  };

  /* ---------- OneSignal : 구독 알림 -------------------------------- */
  if (VENDORS.oneSignal.appId) {
    /* 슬라이드다운 문구는 페이지 언어(document.documentElement.lang)에 맞춰 고릅니다.
       OneSignal Custom Code 연동에서는 코드로 넘긴 문구가 그대로 쓰입니다. */
    var OS_TEXT = {
      ko: {
        actionMessage: '인사이트 브리프의 최신 경제·무역 리포트와 주요 시황 알림을 받아보시겠어요?',
        acceptButton: '구독하기',
        cancelButton: '나중에'
      },
      en: {
        actionMessage: 'Get the latest economic and trade reports and market alerts from Insight Brief.',
        acceptButton: 'Subscribe',
        cancelButton: 'Not now'
      },
      zh: {
        actionMessage: '想第一时间收到 Insight Brief 最新的经济·贸易报告与行情提醒吗？',
        acceptButton: '订阅',
        cancelButton: '以后再说'
      },
      ja: {
        actionMessage: 'Insight Brief の最新の経済・貿易レポートと相場アラートを受け取りませんか？',
        acceptButton: '購読する',
        cancelButton: 'あとで'
      }
    };
    var osLang = (document.documentElement.getAttribute('lang') || 'ko').slice(0, 2).toLowerCase();
    var osText = OS_TEXT[osLang] || OS_TEXT.ko;

    window.OneSignalDeferred = window.OneSignalDeferred || [];
    window.OneSignalDeferred.push(function (OneSignal) {
      try {
        var p = OneSignal.init({
          appId: VENDORS.oneSignal.appId,
          serviceWorkerPath: VENDORS.oneSignal.workerPath,
          serviceWorkerUpdaterPath: VENDORS.oneSignal.updaterPath,
          serviceWorkerParam: { scope: '/' },
          allowLocalhostAsSecureOrigin: true,
          welcomeNotification: { disable: true },
          promptOptions: {
            slidedown: {
              prompts: [{
                type: 'push',
                autoPrompt: true,
                text: osText,
                delay: { pageViews: 1, timeDelay: 3 }
              }]
            }
          }
        });
        /* OneSignal 대시보드에서 아직 웹 플랫폼을 켜지 않았거나 브라우저가 푸시를
           막은 경우에도 페이지 동작에 영향이 없도록 거부를 받아 둡니다. */
        if (p && typeof p.catch === 'function') {
          p.catch(function (err) { console.info('[OneSignal] init skipped:', err && err.message); });
        }
      } catch (e) { /* 푸시를 지원하지 않는 브라우저는 조용히 넘어갑니다 */ }
    });
  }

  /* ---------- Microsoft Clarity : 히트맵 --------------------------- */
  if (VENDORS.clarity.projectId) {
    (function (c, l, a, r, i, t, y) {
      c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
      t = l.createElement(r); t.async = 1; t.src = 'https://www.clarity.ms/tag/' + i;
      y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
    })(window, document, 'clarity', 'script', VENDORS.clarity.projectId);
  }

  window.IB_VENDORS = VENDORS;
})();
