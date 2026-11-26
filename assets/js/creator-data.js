/* =========================================================
   INSIGHT BRIEF — 크리에이터 스튜디오 콘텐츠 사전 (creator.html)
   블로그 글 템플릿 · 쇼츠 대본 · 화면 문구를 네 언어로 담습니다.
   서버 없이 이 파일만으로 한국어·영어·중국어·일본어 결과물을 만듭니다.
   ========================================================= */
(function () {
  'use strict';

  var D = {};

  /* =====================================================
     한국어
     ===================================================== */
  D.ko = {
    name: '한국어',
    htmlLang: 'ko',
    dateLocale: 'ko-KR',
    ui: {
      tabBlog: '블로그 글',
      tabShorts: '유튜브 쇼츠·영상',
      tabUpload: '내 계정 업로드',
      gen: '생성',
      genAgain: '다시 생성',
      generating: '만드는 중…',
      copy: '복사',
      copied: '복사했습니다',
      download: '다운로드',
      downloading: '파일을 만들었습니다',
      emptyTopic: '주제나 키워드를 한 줄 넣어 주세요.',
      blogDone: '블로그 글을 만들었습니다. 미리보기와 HTML을 확인하세요.',
      shortsDone: '쇼츠 대본과 장면을 만들었습니다. 재생으로 미리 보세요.',
      aiNeedKey: 'Gemini API 키를 넣으면 AI가 문장을 직접 씁니다. 키가 없어도 아래 생성 버튼은 그대로 동작합니다.',
      aiRunning: 'Gemini가 글을 쓰는 중…',
      aiFail: 'AI 생성에 실패해 템플릿으로 만들었습니다.',
      keyMemory: '키는 이 브라우저 메모리에만 있고 저장하거나 전송하지 않습니다(요청은 Google로 직접 갑니다).',
      scenes: '장면',
      seconds: '초',
      recordNow: '녹화 중',
      recordDone: '영상 파일을 만들었습니다',
      noVideo: '이 브라우저는 영상 녹화를 지원하지 않습니다. Chrome·Edge·Safari 최신 버전에서 열어 주세요.',
      noAudio: '이 브라우저는 Web Audio를 지원하지 않아 배경음을 넣을 수 없습니다.',
      preview: '미리 보기',
      stop: '멈춤',
      record: '영상 녹화 (.webm)',
      recording: '녹화 중… {p}%',
      srt: '자막 내려받기 (.srt)',
      signIn: 'Google 계정으로 연결',
      signOut: '연결 해제',
      connected: '연결됨',
      needSignIn: '먼저 Google 계정을 연결해 주세요.',
      needBlogHtml: '먼저 블로그 글을 만들어 주세요.',
      needVideo: '먼저 쇼츠 영상을 녹화해 주세요.',
      blogsLoading: '블로그 목록을 불러오는 중…',
      blogsEmpty: '이 계정에 Blogger 블로그가 없습니다.',
      draftDone: 'Blogger에 초안으로 저장했습니다.',
      publishDone: 'Blogger에 공개했습니다.',
      uploadDone: 'YouTube에 올렸습니다.',
      uploadFail: '업로드가 실패했습니다',
      progress: '전송 중 {p}%',
      tokenExpired: '연결이 만료되었습니다. 다시 연결해 주세요.',
      clientHint: '방문자는 자기 OAuth 클라이언트 ID를 넣어 쓸 수 있습니다. 비워 두면 이 사이트 기본값을 씁니다.',
      privacy: '비공개',
      unlisted: '일부 공개',
      public: '공개',
      title: '제목',
      tags: '태그',
      tagsComma: '쉼표로 구분',
      testMode: '이 사이트의 기본 클라이언트는 테스트 모드입니다. 등록된 테스트 사용자 계정만 업로드할 수 있고, 다른 방문자는 자기 클라이언트 ID를 넣으면 됩니다.'
    },
    struct: {
      kicker: 'STRUCTURE',
      toc: '목차',
      summary: '3줄 요약',
      why: '왜 지금 {kw}인가',
      compare: '{kw} 한눈에 비교',
      check: '실행 체크리스트',
      mistake: '자주 하는 실수',
      faq: '자주 묻는 질문',
      closingLabel: '마무리',
      tableHead: ['방법', '이런 사람에게', '장점', '주의할 점'],
      checkIntro: '{kw}를 시작하기 전에 위에서부터 하나씩 지워 보세요. 다 지우면 결정할 준비가 된 것입니다.',
      meta: [
        '{kw}를 고를 때 실제로 갈리는 기준을 표와 체크리스트로 정리했습니다. 2026년 기준 비용·시간·주의점까지 한 번에 확인하세요.',
        '{kw} 처음 시작하는 분을 위해 준비 순서, 비교표, 자주 하는 실수, FAQ를 한 편에 담았습니다.',
        '{kw} 관련 광고와 후기가 섞여 헷갈릴 때, 숫자와 조건만 뽑아 비교했습니다. 5분이면 판단이 끝납니다.'
      ],
      intro: [
        '{kw}를 검색하면 비슷한 글이 수십 개 나옵니다. 그런데 막상 결정할 때 필요한 것은 표 한 장과 체크리스트 한 장입니다. 이 글은 그 두 가지에 집중합니다.',
        '{kw}는 정보가 많은 주제입니다. 문제는 대부분 광고이거나 기준이 오래됐다는 점입니다. 지금 기준으로 다시 정리했습니다.',
        '{kw}를 앞두고 무엇부터 손대야 할지 막막하다면, 아래 순서대로만 확인하세요. 준비 시간을 절반으로 줄이는 것이 목적입니다.'
      ],
      bullets: [
        '{kw}는 조건이 아니라 합계 비용으로 비교해야 판단이 쉽습니다.',
        '후기는 최근 6개월 것만 읽고, 광고 표시가 있는 글은 걸러 보세요.',
        '결정 전에 환불·해지 조건을 한 번 더 확인하면 대부분의 손실을 막습니다.'
      ],
      checks: [
        '{kw}에 들어갈 총비용을 항목별로 적어 합계를 낸다',
        '같은 조건(기간·수량·지역)으로 두 곳 이상을 비교한다',
        '최근 6개월 후기만 골라 읽는다',
        '환불·해지·위약 조건을 캡처해 둔다',
        '결제 전 장바구니 합계를 한 번 더 확인한다',
        '결정은 하루 뒤로 미루고, 그 사이 대안을 하나 더 본다'
      ],
      mistakes: [
        '첫 화면 가격만 보고 비교를 끝내는 것 — 배송비·수수료·세금이 붙으면 순서가 바뀝니다.',
        '오래된 후기를 지금 조건으로 읽는 것 — 정책은 1년에도 여러 번 바뀝니다.',
        '한 곳에서만 알아보고 결정하는 것 — 같은 조건을 두 곳에 물으면 대개 조건이 달라집니다.'
      ],
      faqExtra: [
        ['{kw} 정보는 얼마나 자주 바뀌나요?',
         '가격과 조건은 분기마다 바뀝니다. 이 글은 작성 시점 기준이며, 계약이나 결제 전에는 공식 안내를 다시 확인하세요.'],
        ['이 글을 그대로 써도 되나요?',
         '네. 출처 표기 없이 자유롭게 쓰셔도 됩니다. 다만 숫자와 인용은 직접 확인한 뒤 사용하세요.']
      ],
      closing: [
        '{kw}는 결국 비교의 문제입니다. 좋은 선택은 정보가 많은 사람이 아니라, 같은 조건에서 두 번 비교해 본 사람에게 갑니다. 위 체크리스트를 저장해 두고 실제로 하나씩 지워 보세요.',
        '정리하면 {kw}에서 중요한 것은 세 가지입니다. 합계 비용, 최근 조건, 그리고 환불 조건. 이 셋만 확인해도 대부분의 실수를 피할 수 있습니다.'
      ],
      cta: '이 글이 도움이 됐다면 필요한 사람에게 보내 주세요. 아래 버튼으로 HTML을 복사해 블로그에 그대로 붙여 넣을 수 있습니다.',
      authorNote: '이 글은 인사이트 브리프 무료 스튜디오에서 만든 초안입니다. 발행 전에 직접 확인한 내용을 더해 주세요.',
      tagExtra: ['비교', '체크리스트', '2026']
    },
    cats: {
      info: {
        label: '정보·노하우',
        hooks: [
          '{kw}, 2026년에는 이 순서로 확인하세요',
          '{kw} 처음 할 때 가장 많이 틀리는 세 가지',
          '{kw} 비용과 시간, 숫자로 비교했습니다',
          '광고 말고 후기로 본 {kw} 선택 기준',
          '{kw} 30분 안에 끝내는 준비 체크리스트'
        ],
        why: [
          '{kw}에 대한 글은 넘치지만 대부분 비슷한 말을 반복합니다. 실제로 갈리는 지점은 비용 구조와 조건 두 가지뿐입니다.',
          '검색 상위 글은 광고이거나 3년 전 기준입니다. 지금 조건으로 다시 계산했습니다.'
        ],
        rows: [
          ['직접 알아보기', '시간은 있지만 예산이 빠듯한 사람', '비용 0원, 조건을 직접 확인', '비교에 시간이 오래 걸림'],
          ['커뮤니티·후기 참고', '실사용 사례가 궁금한 사람', '실제 경험을 볼 수 있음', '광고성 후기가 섞여 있음'],
          ['전문가·업체 상담', '빠르게 결정해야 하는 사람', '조건을 한 번에 정리', '상담 후 영업 연락이 올 수 있음']
        ],
        checks: [
          '{kw}에서 꼭 필요한 항목 세 개만 먼저 정한다',
          '비슷한 대안 두 개를 나란히 적어 둔다',
          '가격이 아니라 포함 범위를 비교한다'
        ],
        faq: [
          ['{kw}는 처음인데 무엇부터 시작해야 하나요?',
           '필요한 항목 세 개를 적는 것부터 시작하세요. 그다음 같은 조건의 대안 두 개를 나란히 놓고 포함 범위를 비교하면 판단이 빨라집니다.'],
          ['무료로 확인할 수 있는 방법이 있나요?',
           '공식 안내 페이지와 최근 후기, 두 곳이면 충분합니다. 다만 공식 페이지의 조건은 분기마다 바뀌므로 날짜를 확인하세요.'],
          ['얼마나 걸리나요?',
           '준비만 하면 대부분 하루 안에 끝납니다. 비교 대상을 두 개로 줄이면 30분이면 결정할 수 있습니다.']
        ],
        tags: ['{kw} 방법', '{kw} 비교', '{kw} 준비물', '{kw} 후기', '{kw} 비용', '생활 정보']
      },
      money: {
        label: '경제·재테크',
        hooks: [
          '{kw}, 숫자로만 비교하면 답이 보입니다',
          '{kw}로 새는 돈, 2026년 기준으로 계산했습니다',
          '{kw} 한 달에 얼마가 적당할까 — 기준 세 가지',
          '{kw} 시작 전에 반드시 확인할 세 가지 조건',
          '금리·수수료·기간, {kw}에서 갈리는 지점'
        ],
        why: [
          '{kw}는 금리와 수수료, 기간이 조금만 달라도 결과가 크게 벌어집니다. 체감보다 계산이 정확한 영역입니다.',
          '지금은 금리가 자주 움직이는 구간입니다. 작년에 계산한 표를 그대로 쓰면 손해를 볼 수 있습니다.'
        ],
        rows: [
          ['예금·적금', '원금 손실 없이 모으고 싶은 사람', '원금 보장, 단순한 구조', '금리 변동에 취약'],
          ['펀드·ETF', '중기 자금을 굴리려는 사람', '분산 투자 가능', '원금 손실 가능'],
          ['현금 확보', '지출이 예정된 사람', '즉시 사용 가능', '물가 상승분만큼 가치 하락']
        ],
        checks: [
          '{kw}에 들어갈 돈과 기간을 먼저 정한다',
          '수수료·세금을 포함한 실수령액을 계산한다',
          '중도 해지 조건을 확인한다'
        ],
        faq: [
          ['{kw}에서 가장 먼저 볼 숫자는 무엇인가요?',
           '수수료와 세금을 뺀 실수령액입니다. 표면 금리보다 이 숫자가 실제 결과를 결정합니다.'],
          ['금리가 오르면 어떻게 되나요?',
           '고정 금리 상품은 영향이 적고, 변동 금리 상품은 상환액이 늘 수 있습니다. 계약서의 금리 조건을 먼저 확인하세요.'],
          ['소액으로도 시작할 수 있나요?',
           '대부분 가능합니다. 다만 소액일수록 수수료 비중이 커지므로 최소 금액과 수수료 구조를 함께 보세요.']
        ],
        tags: ['{kw} 계산', '{kw} 금리', '{kw} 수수료', '{kw} 비교', '재테크', '2026 금융']
      },
      health: {
        label: '건강·생활',
        hooks: [
          '{kw}, 오늘부터 바꿀 수 있는 세 가지',
          '{kw} 습관, 2주만 지켜도 달라집니다',
          '{kw}에 대해 흔히 틀리는 상식 세 가지',
          '전문가가 {kw}에서 먼저 보는 지표',
          '{kw} 체크리스트 — 매일 3분이면 됩니다'
        ],
        why: [
          '{kw}에 대한 정보는 많지만, 대부분 특정 제품의 광고이거나 근거가 약한 주장입니다. 생활에서 지킬 수 있는 것만 골랐습니다.',
          '건강 정보는 사람마다 조건이 다릅니다. 이 글은 일반적인 기준과 확인 방법을 정리한 것입니다.'
        ],
        rows: [
          ['습관 바꾸기', '꾸준히 유지하고 싶은 사람', '비용 0원, 부작용 적음', '효과가 늦게 나타남'],
          ['제품·보조기구', '특정 상황을 빠르게 개선하려는 사람', '즉시 체감 가능', '광고와 실사용 차이'],
          ['전문가 상담', '증상이 오래가는 사람', '원인 확인 가능', '비용·대기 시간 발생']
        ],
        checks: [
          '{kw} 관련 현재 상태를 숫자로 적어 둔다',
          '2주 동안 매일 같은 시간에 기록한다',
          '증상이 계속되면 전문가와 상담한다'
        ],
        faq: [
          ['{kw}는 얼마나 지나야 효과가 보이나요?',
           '습관을 바꾸는 경우 보통 2~4주가 걸립니다. 기록을 남기면 변화를 더 빨리 확인할 수 있습니다.'],
          ['누구나 해도 괜찮은 방법인가요?',
           '아닙니다. 질환이 있거나 약을 복용 중이라면 먼저 전문가와 상의하세요. 이 글은 일반적인 정보입니다.'],
          ['제품을 꼭 사야 하나요?',
           '대부분은 필요하지 않습니다. 생활 습관만 바꿔도 절반은 해결됩니다. 구매 전 2주 정도 먼저 해 보세요.']
        ],
        tags: ['{kw} 습관', '{kw} 방법', '{kw} 효과', '{kw} 주의', '건강 정보', '생활 습관']
      },
      it: {
        label: 'IT·테크',
        hooks: [
          '{kw}, 사기 전에 확인할 다섯 가지',
          '{kw} 고를 때 스펙보다 중요한 것',
          '{kw} 2026년 기준 가격과 성능 비교',
          '{kw} 처음 설정할 때 바꿔야 하는 항목',
          '{kw} 실패하지 않는 순서 — 설치부터 백업까지'
        ],
        why: [
          '{kw}는 스펙 표가 화려할수록 실제 사용과 차이가 큽니다. 매일 쓰는 기능만 골라 비교했습니다.',
          '같은 가격대 제품도 지원 기간과 수리 정책에서 갈립니다. 숫자 뒤의 조건을 봐야 합니다.'
        ],
        rows: [
          ['보급형', '웹·문서·영상 위주 사용자', '가격이 낮고 가벼움', '오래 쓰면 느려짐'],
          ['중급형', '작업과 여가를 함께 쓰는 사람', '가격과 성능의 균형', '모델별 편차가 큼'],
          ['고급형', '전문 작업·장시간 사용자', '긴 지원 기간', '가격 대비 체감 차이']
        ],
        checks: [
          '{kw}에 꼭 필요한 기능 세 개를 적는다',
          '지원 기간과 수리 정책을 확인한다',
          '기존 기기·주변기기와 호환되는지 본다'
        ],
        faq: [
          ['{kw}는 얼마나 쓸 수 있나요?',
           '보통 3~5년입니다. 지원 기간이 끝나면 보안 업데이트가 멈추므로 구매 전 확인하는 편이 좋습니다.'],
          ['중고로 사도 괜찮을까요?',
           '가능합니다. 다만 배터리 상태와 보증 이전 가능 여부를 반드시 확인하세요.'],
          ['스펙이 높으면 무조건 좋은가요?',
           '아닙니다. 쓰는 작업에 따라 체감 차이가 다릅니다. 실제로 쓰는 기능 세 개를 기준으로 비교하세요.']
        ],
        tags: ['{kw} 비교', '{kw} 추천', '{kw} 스펙', '{kw} 가격', 'IT 정보', '2026 테크']
      }
    },
    shorts: {
      hookTitle: '{kw}',
      hooks: [
        '{kw}, 이 순서만 지키세요',
        '{kw} 모르고 시작하면 손해입니다',
        '{kw} 30초 정리',
        '{kw}에서 사람들이 가장 많이 틀리는 것',
        '{kw} 시작 전 3분만 보세요'
      ],
      pointTpl: [
        '첫째, 합계로 비교하세요.',
        '둘째, 최근 조건만 보세요.',
        '셋째, 환불 조건을 확인하세요.',
        '넷째, 한 곳에서만 알아보지 마세요.',
        '다섯째, 결정은 하루 미루세요.'
      ],
      captions: {
        info: ['광고와 후기가 섞여 있어도 기준은 하나입니다.', '비용 구조를 보면 선택이 단순해집니다.', '같은 조건에서 두 번 비교하면 끝납니다.'],
        money: ['표면 금리보다 실수령액이 중요합니다.', '수수료와 세금을 빼고 계산하세요.', '기간이 길수록 조건 차이가 커집니다.'],
        health: ['오늘부터 바꿀 수 있는 것부터 시작하세요.', '2주만 기록해도 차이가 보입니다.', '증상이 계속되면 전문가와 상담하세요.'],
        it: ['스펙보다 쓰는 기능이 기준입니다.', '지원 기간과 수리 정책을 확인하세요.', '같은 가격대라면 조건에서 갈립니다.']
      },
      cta: ['자세한 비교표는 프로필 링크에서 확인하세요.', '전체 체크리스트는 설명란 링크에 있습니다.', '저장해 두고 필요할 때 꺼내 보세요.'],
      capsExtra: ['기준은 하나면 충분합니다.', '숫자로 확인하면 흔들리지 않습니다.'],
      hashtags: ['#정보', '#꿀팁', '#쇼츠', '#2026'],
      descTpl: '{kw} 핵심만 30초로 정리했습니다.\n\n자세한 비교표와 체크리스트는 설명란 링크에서 확인하세요.\n\n#shorts #{tag}',
      srtNote: '이 자막은 인사이트 브리프 무료 스튜디오에서 만들었습니다.'
    }
  };

  /* =====================================================
     English
     ===================================================== */
  D.en = {
    name: 'English',
    htmlLang: 'en',
    dateLocale: 'en-US',
    ui: {
      tabBlog: 'Blog article',
      tabShorts: 'YouTube Shorts and video',
      tabUpload: 'Publish to my account',
      gen: 'Generate',
      genAgain: 'Generate again',
      generating: 'Building…',
      copy: 'Copy',
      copied: 'Copied',
      download: 'Download',
      downloading: 'File created',
      emptyTopic: 'Add a topic or keyword first.',
      blogDone: 'Article ready. Check the preview and the HTML.',
      shortsDone: 'Script and scenes ready. Press play to preview.',
      aiNeedKey: 'Add a Gemini API key and the AI writes the copy for you. The Generate button below works without a key.',
      aiRunning: 'Gemini is writing…',
      aiFail: 'AI generation failed, so the template version was used.',
      keyMemory: 'The key stays in this browser tab only. It is not saved, and the request goes straight to Google.',
      scenes: 'scenes',
      seconds: 's',
      recordNow: 'Recording',
      recordDone: 'Video file created',
      noVideo: 'This browser cannot record video. Use the latest Chrome, Edge or Safari.',
      noAudio: 'This browser has no Web Audio, so background music cannot be added.',
      preview: 'Preview',
      stop: 'Stop',
      record: 'Record video (.webm)',
      recording: 'Recording… {p}%',
      srt: 'Download subtitles (.srt)',
      signIn: 'Connect Google account',
      signOut: 'Disconnect',
      connected: 'Connected',
      needSignIn: 'Connect a Google account first.',
      needBlogHtml: 'Generate a blog article first.',
      needVideo: 'Record the Shorts video first.',
      blogsLoading: 'Loading your blogs…',
      blogsEmpty: 'This account has no Blogger blog.',
      draftDone: 'Saved to Blogger as a draft.',
      publishDone: 'Published to Blogger.',
      uploadDone: 'Uploaded to YouTube.',
      uploadFail: 'Upload failed',
      progress: 'Uploading {p}%',
      tokenExpired: 'The connection expired. Please connect again.',
      clientHint: 'Visitors can paste their own OAuth client ID. Left empty, the site default is used.',
      privacy: 'Private',
      unlisted: 'Unlisted',
      public: 'Public',
      title: 'Title',
      tags: 'Tags',
      tagsComma: 'Separate with commas',
      testMode: 'The site default client runs in test mode: only registered test users can publish. Other visitors can paste their own client ID.'
    },
    struct: {
      kicker: 'STRUCTURE',
      toc: 'Contents',
      summary: 'Three-line summary',
      why: 'Why {kw} matters now',
      compare: '{kw} at a glance',
      check: 'Action checklist',
      mistake: 'Common mistakes',
      faq: 'Frequently asked questions',
      closingLabel: 'Wrapping up',
      tableHead: ['Option', 'Best for', 'Strength', 'Watch out'],
      checkIntro: 'Work through this list before you start on {kw}. When every line is ticked, you are ready to decide.',
      meta: [
        'A comparison table and checklist for choosing {kw}, with 2026 costs, timing and pitfalls in one place.',
        'Everything a first-timer needs on {kw}: preparation order, comparison table, common mistakes and FAQ.',
        'Ads and reviews for {kw} contradict each other. Here are only the numbers and conditions that decide it — a five-minute read.'
      ],
      intro: [
        'Search {kw} and you get dozens of similar articles. What you actually need when deciding is one table and one checklist. This article is those two things.',
        '{kw} is a topic with plenty of information. The problem is that most of it is advertising or based on old rules. Here it is rebuilt for today.',
        'If you do not know where to start with {kw}, follow the order below. The goal is to halve your preparation time.'
      ],
      bullets: [
        'Compare {kw} by total cost, not by headline conditions.',
        'Read reviews from the last six months only, and skip anything marked as an ad.',
        'One more look at the refund and cancellation terms prevents most losses.'
      ],
      checks: [
        'Add up every cost that goes into {kw} and put the total on one line',
        'Compare at least two options under the same conditions (period, quantity, region)',
        'Read reviews from the last six months only',
        'Save a screenshot of the refund, cancellation and penalty terms',
        'Check the cart total one more time before paying',
        'Sleep on the decision and look at one more alternative in the meantime'
      ],
      mistakes: [
        'Stopping at the first price on screen — shipping, fees and tax can reverse the ranking.',
        'Reading old reviews as current terms — policies change several times a year.',
        'Asking one provider only — the same request to two providers usually returns different terms.'
      ],
      faqExtra: [
        ['How often does information about {kw} change?',
         'Prices and terms change every quarter. This article reflects the date it was written; check the official notice again before you sign or pay.'],
        ['Can I reuse this article?',
         'Yes. Use it freely without attribution, but verify every figure and quote yourself first.']
      ],
      closing: [
        '{kw} comes down to comparison. The better choice goes not to the person with the most information but to the one who compared twice under the same conditions. Save this checklist and tick it off for real.',
        'In short, three things matter with {kw}: total cost, current terms and the refund policy. Checking these three avoids most mistakes.'
      ],
      cta: 'If this helped, send it to someone who needs it. Use the button below to copy the HTML straight into your blog.',
      authorNote: 'This draft was produced by the free INSIGHT BRIEF studio. Add what you verified yourself before publishing.',
      tagExtra: ['comparison', 'checklist', '2026']
    },
    cats: {
      info: {
        label: 'Information and how-to',
        hooks: [
          '{kw}: the order to check it in for 2026',
          'Three things most people get wrong when starting {kw}',
          '{kw} cost and time, compared in numbers',
          'How to choose {kw} from reviews, not ads',
          'A 30-minute preparation checklist for {kw}'
        ],
        why: [
          'There is no shortage of writing about {kw}, but most of it repeats the same lines. What actually separates options is cost structure and terms.',
          'Top search results are either ads or three years old. Here it is recalculated on today terms.'
        ],
        rows: [
          ['Research it yourself', 'People with time but a tight budget', 'Zero cost, you see the real terms', 'Comparison takes time'],
          ['Community reviews', 'People who want real usage stories', 'Actual experience', 'Some reviews are ads'],
          ['Talk to a provider', 'People who must decide quickly', 'Terms organised at once', 'Sales follow-up afterwards']
        ],
        checks: [
          'Write down the three features {kw} must have',
          'Line up two similar alternatives beside each other',
          'Compare what is included, not just the price'
        ],
        faq: [
          ['I am new to {kw}. Where do I start?',
           'Start by listing the three things you need. Then place two alternatives side by side under the same conditions and compare what each includes; the decision gets much faster.'],
          ['Is there a free way to check?',
           'The official page and recent reviews are enough. Note the date on the official terms, because they change every quarter.'],
          ['How long does it take?',
           'Usually under a day of preparation. Narrow it to two candidates and you can decide in 30 minutes.']
        ],
        tags: ['{kw} how to', '{kw} comparison', '{kw} checklist', '{kw} review', '{kw} cost', 'practical guide']
      },
      money: {
        label: 'Money and personal finance',
        hooks: [
          '{kw}: the answer appears when you compare numbers',
          'Where {kw} leaks money, calculated for 2026',
          'How much a month is right for {kw}? Three rules',
          'Three terms to check before you start {kw}',
          'Rates, fees and periods: where {kw} really differs'
        ],
        why: [
          'With {kw}, a small difference in rate, fee or period changes the result a lot. This is an area where arithmetic beats intuition.',
          'Rates are moving often right now. Reusing last year numbers can cost you money.'
        ],
        rows: [
          ['Savings deposit', 'People who want to save without losing principal', 'Principal protected, simple', 'Sensitive to rate changes'],
          ['Funds and ETFs', 'People investing for the medium term', 'Diversification', 'Principal can fall'],
          ['Hold cash', 'People with spending ahead', 'Available immediately', 'Loses value to inflation']
        ],
        checks: [
          'Decide how much money and how long for {kw}',
          'Calculate the net amount after fees and tax',
          'Check the early-exit conditions'
        ],
        faq: [
          ['Which number should I look at first with {kw}?',
           'The amount you actually receive after fees and tax. That number, not the headline rate, decides the outcome.'],
          ['What happens if rates rise?',
           'Fixed-rate products barely move; floating-rate ones can raise your payments. Check the rate clause in the contract first.'],
          ['Can I start with a small amount?',
           'Usually yes. With small amounts the fee share grows, so look at the minimum and the fee structure together.']
        ],
        tags: ['{kw} calculator', '{kw} interest', '{kw} fees', '{kw} comparison', 'personal finance', 'money 2026']
      },
      health: {
        label: 'Health and daily life',
        hooks: [
          '{kw}: three things you can change today',
          '{kw} habits that show in two weeks',
          'Three myths about {kw}',
          'The numbers a professional checks first with {kw}',
          '{kw} checklist — three minutes a day'
        ],
        why: [
          'There is a lot written about {kw}, but much of it advertises a product or rests on weak evidence. Here only what you can keep up in daily life.',
          'Health advice depends on the person. This article sets out general benchmarks and how to check them.'
        ],
        rows: [
          ['Change habits', 'People who want to keep it up', 'No cost, few side effects', 'Results arrive slowly'],
          ['Products and devices', 'People fixing one specific problem fast', 'Immediate feedback', 'Ads differ from daily use'],
          ['Talk to a professional', 'People with long-lasting symptoms', 'Finds the cause', 'Cost and waiting time']
        ],
        checks: [
          'Write your current state with {kw} down as a number',
          'Record it daily at the same time for two weeks',
          'See a professional if symptoms continue'
        ],
        faq: [
          ['How long before {kw} shows results?',
           'Habit changes usually take two to four weeks. If you keep a record, you notice the change sooner.'],
          ['Is this safe for everyone?',
           'No. If you have a condition or take medication, talk to a professional first. This article is general information.'],
          ['Do I have to buy a product?',
           'Usually not. Changing daily habits solves about half of it. Try that for two weeks before buying.']
        ],
        tags: ['{kw} habits', '{kw} how to', '{kw} effects', '{kw} caution', 'health guide', 'daily habits']
      },
      it: {
        label: 'IT and technology',
        hooks: [
          'Five checks before you buy {kw}',
          'What matters more than specs with {kw}',
          '{kw} price and performance, 2026 edition',
          'Settings to change on day one with {kw}',
          'The order that works: setup to backup for {kw}'
        ],
        why: [
          'The shinier the spec sheet for {kw}, the bigger the gap to daily use. Only the functions you touch every day are compared here.',
          'At the same price, products separate on support period and repair policy. Look behind the numbers.'
        ],
        rows: [
          ['Entry level', 'Web, documents, video', 'Low price, light', 'Slows down over years'],
          ['Mid range', 'Work and leisure together', 'Balance of price and power', 'Big differences between models'],
          ['High end', 'Professional work, long sessions', 'Long support', 'Diminishing returns']
        ],
        checks: [
          'Write the three features {kw} must have',
          'Check the support period and repair policy',
          'Confirm compatibility with what you already own'
        ],
        faq: [
          ['How long will {kw} last?',
           'Usually three to five years. Security updates stop when support ends, so check that before buying.'],
          ['Is buying used a good idea?',
           'It can be. Check the battery health and whether the warranty transfers.'],
          ['Is higher spec always better?',
           'No. The gain depends on your work. Compare against the three functions you actually use.']
        ],
        tags: ['{kw} comparison', '{kw} picks', '{kw} specs', '{kw} price', 'tech guide', 'tech 2026']
      }
    },
    shorts: {
      hookTitle: '{kw}',
      hooks: [
        '{kw} — just follow this order',
        'Start {kw} without this and you lose money',
        '{kw} in 30 seconds',
        'The mistake most people make with {kw}',
        'Watch this before you start {kw}'
      ],
      pointTpl: [
        'First, compare the total.',
        'Second, use current terms only.',
        'Third, check the refund policy.',
        'Fourth, do not ask just one provider.',
        'Fifth, sleep on the decision.'
      ],
      captions: {
        info: ['Ads and reviews mix, but the rule is one.', 'Look at cost structure and the choice gets simple.', 'Two comparisons under the same terms and it is done.'],
        money: ['Net amount beats headline rate.', 'Calculate after fees and tax.', 'The longer the period, the bigger the gap.'],
        health: ['Start with what you can change today.', 'Two weeks of records shows the difference.', 'If symptoms continue, see a professional.'],
        it: ['What you use beats what the specs say.', 'Check support period and repair policy.', 'At the same price, terms decide.']
      },
      cta: ['Full comparison table is in the link in bio.', 'The whole checklist is in the description.', 'Save this and come back when you need it.'],
      capsExtra: ['One rule is enough.', 'Numbers do not change their mind.'],
      hashtags: ['#tips', '#howto', '#shorts', '#2026'],
      descTpl: '{kw} in 30 seconds.\n\nThe full comparison table and checklist are in the description link.\n\n#shorts #{tag}',
      srtNote: 'Subtitles made with the free INSIGHT BRIEF studio.'
    }
  };

  /* =====================================================
     中文（简体）
     ===================================================== */
  D.zh = {
    name: '中文',
    htmlLang: 'zh-Hans',
    dateLocale: 'zh-CN',
    ui: {
      tabBlog: '博客文章',
      tabShorts: 'YouTube 短视频·视频',
      tabUpload: '发布到我的账号',
      gen: '生成',
      genAgain: '重新生成',
      generating: '正在生成…',
      copy: '复制',
      copied: '已复制',
      download: '下载',
      downloading: '文件已生成',
      emptyTopic: '请先输入一个主题或关键词。',
      blogDone: '文章已生成，请查看预览和 HTML。',
      shortsDone: '脚本和分镜已生成，点播放即可预览。',
      aiNeedKey: '填入 Gemini API 密钥后由 AI 直接撰写文案。没有密钥时，下面的生成按钮同样可用。',
      aiRunning: 'Gemini 正在撰写…',
      aiFail: 'AI 生成失败，已改用模板生成。',
      keyMemory: '密钥只保存在当前浏览器的内存中，不会存储，请求直接发往 Google。',
      scenes: '个分镜',
      seconds: '秒',
      recordNow: '录制中',
      recordDone: '视频文件已生成',
      noVideo: '此浏览器不支持视频录制，请使用最新版 Chrome、Edge 或 Safari。',
      noAudio: '此浏览器不支持 Web Audio，无法加入背景音乐。',
      preview: '预览',
      stop: '停止',
      record: '录制视频（.webm）',
      recording: '录制中… {p}%',
      srt: '下载字幕（.srt）',
      signIn: '连接 Google 账号',
      signOut: '断开连接',
      connected: '已连接',
      needSignIn: '请先连接 Google 账号。',
      needBlogHtml: '请先生成博客文章。',
      needVideo: '请先录制短视频。',
      blogsLoading: '正在加载博客列表…',
      blogsEmpty: '此账号没有 Blogger 博客。',
      draftDone: '已保存为 Blogger 草稿。',
      publishDone: '已在 Blogger 公开。',
      uploadDone: '已上传到 YouTube。',
      uploadFail: '上传失败',
      progress: '上传中 {p}%',
      tokenExpired: '连接已过期，请重新连接。',
      clientHint: '访客可以填入自己的 OAuth 客户端 ID；留空则使用本站默认值。',
      privacy: '私享',
      unlisted: '不公开',
      public: '公开',
      title: '标题',
      tags: '标签',
      tagsComma: '用逗号分隔',
      testMode: '本站默认客户端处于测试模式，只有登记的测试用户可以发布；其他访客填入自己的客户端 ID 即可使用。'
    },
    struct: {
      kicker: 'STRUCTURE',
      toc: '目录',
      summary: '三行摘要',
      why: '为什么现在关注 {kw}',
      compare: '{kw} 一览对比',
      check: '执行清单',
      mistake: '常见错误',
      faq: '常见问题',
      closingLabel: '写在最后',
      tableHead: ['方式', '适合谁', '优点', '注意事项'],
      checkIntro: '开始 {kw} 之前，请从上往下逐项打勾。全部打勾，就说明可以决定了。',
      meta: [
        '用一张表和一份清单，整理挑选 {kw} 时真正拉开差距的标准，含 2026 年费用、时间和注意点。',
        '为第一次接触 {kw} 的人准备：准备顺序、对比表、常见错误和常见问题都在一篇里。',
        '{kw} 的广告和评价互相矛盾时，只把数字和条件挑出来对比，五分钟就能做出判断。'
      ],
      intro: [
        '搜索 {kw}，会出来几十篇相似的文章。真正需要做决定时，你需要的只是一张表和一份清单。这篇文章只说这两件事。',
        '{kw} 的信息很多，问题是大部分是广告，或者用的是几年前的规则。这里按现在的标准重新整理。',
        '如果面对 {kw} 不知道从哪里下手，按下面的顺序走即可。目标是把准备时间减半。'
      ],
      bullets: [
        '{kw} 要比总成本，而不是表面条件。',
        '只看最近六个月的评价，标了广告的文章跳过。',
        '付款前再确认一次退款与解约条款，能避免大部分损失。'
      ],
      checks: [
        '把 {kw} 的全部费用分项列出并算出合计',
        '在相同条件（期限、数量、地区）下比较两家以上',
        '只读最近六个月的评价',
        '把退款、解约、违约金条款截图保存',
        '付款前再核对一次购物车合计',
        '决定推迟一天，中间再看一个备选方案'
      ],
      mistakes: [
        '只看首屏价格就结束比较 — 加上运费、手续费和税，顺序可能反过来。',
        '把旧评价当成现在的条件 — 政策一年会改好几次。',
        '只问一家就决定 — 同样的条件问两家，通常结果不同。'
      ],
      faqExtra: [
        ['{kw} 的信息多久变一次？', '价格和条件每个季度都会变。本文按写作时点整理，签约或付款前请再看官方说明。'],
        ['这篇文章可以直接使用吗？', '可以。无需注明出处即可使用，但数字和引用请自己核实后再用。']
      ],
      closing: [
        '{kw} 归根到底是比较的问题。好的选择不属于信息最多的人，而属于在相同条件下比较了两次的人。把这份清单存下来，真的逐项打勾试试。',
        '简单来说，{kw} 重要的只有三件事：总成本、当前条件和退款条款。只确认这三点，也能避开大部分错误。'
      ],
      cta: '如果这篇文章有帮助，请转给需要的人。用下面的按钮复制 HTML，可以直接粘贴到博客。',
      authorNote: '本文由 INSIGHT BRIEF 免费工作室生成草稿，发布前请补上你自己核实的內容。',
      tagExtra: ['对比', '清单', '2026']
    },
    cats: {
      info: {
        label: '信息·经验',
        hooks: [
          '{kw}，2026 年请按这个顺序确认',
          '第一次做 {kw} 最容易错的三件事',
          '{kw} 的费用和时间，用数字来比较',
          '不看广告看评价，{kw} 的选择标准',
          '{kw} 三十分钟准备清单'
        ],
        why: [
          '关于 {kw} 的文章很多，但大多重复同样的话。真正拉开差距的只有成本结构和条件两项。',
          '搜索靠前的文章不是广告就是三年前的规则。这里按现在的条件重新算过。'
        ],
        rows: [
          ['自己查', '有时间但预算紧的人', '零成本，能看到真实条件', '比较耗时间'],
          ['看社区评价', '想了解实际使用情况的人', '能看到真实经验', '混有广告评价'],
          ['咨询专业人士', '必须尽快决定的人', '一次理清条件', '之后可能有销售跟进']
        ],
        checks: [
          '先定下 {kw} 真正必需的三项',
          '把两个相似的备选并排写下来',
          '比较包含范围而不是只看价格'
        ],
        faq: [
          ['第一次接触 {kw}，从哪里开始？', '先列出你需要的三项，再把两个备选放在相同条件下比较包含范围，判断会快很多。'],
          ['有免费确认的方法吗？', '官方页面加最近的评价就够了。官方条件每季度都会变，请留意日期。'],
          ['需要多久？', '准备通常一天内能完成。把候选减到两个，三十分钟就能决定。']
        ],
        tags: ['{kw} 方法', '{kw} 对比', '{kw} 准备', '{kw} 评价', '{kw} 费用', '生活指南']
      },
      money: {
        label: '经济·理财',
        hooks: [
          '{kw}，只比数字答案就出来了',
          '{kw} 漏掉的钱，按 2026 年重新算过',
          '{kw} 每月多少合适 — 三条标准',
          '开始 {kw} 之前必须确认的三个条件',
          '利率、手续费、期限，{kw} 的分水岭'
        ],
        why: [
          '{kw} 的利率、手续费、期限稍微不同，结果就差很多。这是算比感觉更准的领域。',
          '现在是利率经常变动的时期。直接用去年的表格可能吃亏。'
        ],
        rows: [
          ['定期存款', '想保住本金积累的人', '本金保障，结构简单', '对利率变动敏感'],
          ['基金·ETF', '中期投资的人', '可分散投资', '本金可能亏损'],
          ['保留现金', '近期有支出的人', '随时可用', '受通胀侵蚀']
        ],
        checks: [
          '先确定投入 {kw} 的金额和期限',
          '算出扣除手续费和税后的实收金额',
          '确认提前解约条件'
        ],
        faq: [
          ['{kw} 最先要看哪个数字？', '扣除手续费和税后的实收金额。这个数字比表面利率更能决定结果。'],
          ['利率上升会怎样？', '固定利率产品影响小，浮动利率产品还款额会增加。先看合同里的利率条款。'],
          ['小额也能开始吗？', '一般可以。金额越小手续费占比越高，请同时看最低金额和费率结构。']
        ],
        tags: ['{kw} 计算', '{kw} 利率', '{kw} 手续费', '{kw} 对比', '理财', '2026 金融']
      },
      health: {
        label: '健康·生活',
        hooks: [
          '{kw}，今天就能改的三件事',
          '{kw} 习惯，坚持两周就有变化',
          '关于 {kw} 常被搞错的三点',
          '专业人士看 {kw} 时先看的指标',
          '{kw} 清单 — 每天三分钟'
        ],
        why: [
          '关于 {kw} 的信息很多，但大多是某个产品的广告或依据不足的说法。这里只挑日常生活中能坚持的。',
          '健康信息因人而异。本文整理的是通用标准和确认方法。'
        ],
        rows: [
          ['改变习惯', '想长期保持的人', '零成本，副作用小', '效果出现较慢'],
          ['产品·辅助器具', '想快速改善某个状况的人', '即时可感', '广告与实际有差距'],
          ['咨询专业人士', '症状持续较久的人', '能找到原因', '有费用和等待时间']
        ],
        checks: [
          '把 {kw} 目前的状态用数字记下来',
          '两周内每天同一时间记录',
          '症状持续就去咨询专业人士'
        ],
        faq: [
          ['{kw} 多久能看到效果？', '改变习惯通常需要两到四周。留下记录能更早看出变化。'],
          ['所有人都适合吗？', '不是。有疾病或正在服药的人请先咨询专业人士。本文只是通用信息。'],
          ['一定要买产品吗？', '大多不需要。只改生活习惯就能解决一半，先做两周再决定。']
        ],
        tags: ['{kw} 习惯', '{kw} 方法', '{kw} 效果', '{kw} 注意', '健康指南', '生活习惯']
      },
      it: {
        label: 'IT·科技',
        hooks: [
          '{kw}，买之前要确认的五点',
          '选 {kw} 时比规格更重要的东西',
          '{kw} 2026 年价格与性能对比',
          '{kw} 初始设置时必须改的项目',
          '{kw} 不失败的顺序 — 从安装到备份'
        ],
        why: [
          '{kw} 的规格表越漂亮，和日常使用的差距越大。这里只比较每天都会用到的功能。',
          '同价位产品的差别在支持周期和维修政策。要看数字背后的条件。'
        ],
        rows: [
          ['入门级', '网页、文档、视频为主的人', '价格低、轻便', '用久了会变慢'],
          ['中端', '工作与娱乐兼顾的人', '价格与性能均衡', '机型之间差异大'],
          ['高端', '专业工作、长时间使用', '支持周期长', '价格带来的体感有限']
        ],
        checks: [
          '写下 {kw} 必需的三项功能',
          '确认支持周期和维修政策',
          '确认与现有设备和配件兼容'
        ],
        faq: [
          ['{kw} 能用多久？', '通常三到五年。支持结束后安全更新会停止，购买前请确认。'],
          ['买二手可以吗？', '可以。但一定要确认电池状态和保修能否转移。'],
          ['规格越高越好吗？', '不是。体感差别取决于你的工作，请按实际使用的三项功能比较。']
        ],
        tags: ['{kw} 对比', '{kw} 推荐', '{kw} 规格', '{kw} 价格', '科技指南', '2026 科技']
      }
    },
    shorts: {
      hookTitle: '{kw}',
      hooks: [
        '{kw}，记住这个顺序就够了',
        '不懂就做 {kw} 会吃亏',
        '{kw} 三十秒总结',
        '{kw} 里大家最常搞错的地方',
        '开始 {kw} 之前先看三分钟'
      ],
      pointTpl: [
        '第一，比合计。',
        '第二，只看现在的条件。',
        '第三，确认退款条款。',
        '第四，不要只问一家。',
        '第五，决定推迟一天。'
      ],
      captions: {
        info: ['广告和评价混在一起，标准只有一条。', '看清成本结构，选择就简单了。', '相同条件下比两次就结束了。'],
        money: ['实收金额比表面利率重要。', '扣掉手续费和税再算。', '期限越长，条件差距越大。'],
        health: ['从今天能改的事情开始。', '记录两周就能看出差别。', '症状持续就咨询专业人士。'],
        it: ['你用的功能比规格更关键。', '确认支持周期和维修政策。', '同价位就看条件。']
      },
      cta: ['完整对比表在个人主页链接里。', '全部清单在简介链接里。', '收藏起来，需要时再看。'],
      capsExtra: ['标准一条就够了。', '用数字确认就不会动摇。'],
      hashtags: ['#技巧', '#干货', '#短视频', '#2026'],
      descTpl: '三十秒讲清 {kw} 的重点。\n\n完整对比表和清单在简介链接里。\n\n#shorts #{tag}',
      srtNote: '字幕由 INSIGHT BRIEF 免费工作室生成。'
    }
  };

  /* =====================================================
     日本語
     ===================================================== */
  D.ja = {
    name: '日本語',
    htmlLang: 'ja',
    dateLocale: 'ja-JP',
    ui: {
      tabBlog: 'ブログ記事',
      tabShorts: 'YouTube ショート・動画',
      tabUpload: '自分のアカウントへ公開',
      gen: '生成',
      genAgain: 'もう一度生成',
      generating: '作成中…',
      copy: 'コピー',
      copied: 'コピーしました',
      download: 'ダウンロード',
      downloading: 'ファイルを作成しました',
      emptyTopic: 'テーマかキーワードを入力してください。',
      blogDone: '記事を作成しました。プレビューとHTMLを確認してください。',
      shortsDone: '台本とシーンを作成しました。再生して確認してください。',
      aiNeedKey: 'Gemini APIキーを入れるとAIが本文を書きます。キーがなくても下の生成ボタンは動きます。',
      aiRunning: 'Geminiが書いています…',
      aiFail: 'AI生成に失敗したため、テンプレートで作成しました。',
      keyMemory: 'キーはこのブラウザ内だけにあり、保存も送信もしません（リクエストはGoogleへ直接送られます）。',
      scenes: 'シーン',
      seconds: '秒',
      recordNow: '録画中',
      recordDone: '動画ファイルを作成しました',
      noVideo: 'このブラウザは動画録画に対応していません。最新のChrome・Edge・Safariで開いてください。',
      noAudio: 'このブラウザはWeb Audioに対応しておらず、BGMを入れられません。',
      preview: 'プレビュー',
      stop: '停止',
      record: '動画を録画（.webm）',
      recording: '録画中… {p}%',
      srt: '字幕をダウンロード（.srt）',
      signIn: 'Googleアカウントで接続',
      signOut: '接続を解除',
      connected: '接続済み',
      needSignIn: '先にGoogleアカウントを接続してください。',
      needBlogHtml: '先にブログ記事を作成してください。',
      needVideo: '先にショート動画を録画してください。',
      blogsLoading: 'ブログ一覧を読み込み中…',
      blogsEmpty: 'このアカウントにBloggerブログがありません。',
      draftDone: 'Bloggerに下書きとして保存しました。',
      publishDone: 'Bloggerに公開しました。',
      uploadDone: 'YouTubeにアップロードしました。',
      uploadFail: 'アップロードに失敗しました',
      progress: '送信中 {p}%',
      tokenExpired: '接続の期限が切れました。もう一度接続してください。',
      clientHint: '訪問者は自分のOAuthクライアントIDを入力できます。空欄ならこのサイトの既定値を使います。',
      privacy: '非公開',
      unlisted: '限定公開',
      public: '公開',
      title: 'タイトル',
      tags: 'タグ',
      tagsComma: 'カンマ区切り',
      testMode: 'このサイトの既定クライアントはテストモードです。登録したテストユーザーのみ公開でき、他の訪問者は自分のクライアントIDを入力して使えます。'
    },
    struct: {
      kicker: 'STRUCTURE',
      toc: '目次',
      summary: '3行まとめ',
      why: 'なぜ今 {kw} なのか',
      compare: '{kw} をひと目で比較',
      check: '実行チェックリスト',
      mistake: 'よくある失敗',
      faq: 'よくある質問',
      closingLabel: 'まとめ',
      tableHead: ['方法', '向いている人', '強み', '注意点'],
      checkIntro: '{kw} を始める前に、上から順にチェックを消してください。全部消えたら決める準備ができています。',
      meta: [
        '{kw} を選ぶときに実際に分かれる基準を表とチェックリストにまとめました。2026年の費用・時間・注意点も一度に確認できます。',
        '{kw} が初めての人向けに、準備の順序・比較表・よくある失敗・FAQを1本にまとめました。',
        '{kw} の広告と口コミが混ざって迷うとき、数字と条件だけを抜き出して比べました。5分で判断できます。'
      ],
      intro: [
        '{kw} で検索すると似た記事が数十本出てきます。ただ、決めるときに必要なのは表1枚とチェックリスト1枚です。この記事はその2つに絞ります。',
        '{kw} は情報の多いテーマです。問題はその多くが広告か、古い基準だということ。今の条件で整理し直しました。',
        '{kw} を前にして何から手を付けるか分からないなら、下の順番どおりに確認してください。準備時間を半分にするのが目的です。'
      ],
      bullets: [
        '{kw} は条件ではなく合計費用で比べると判断しやすくなります。',
        '口コミは直近6か月のものだけを読み、広告表記のある記事は外します。',
        '支払う前に返金・解約条件をもう一度見ると、ほとんどの損失を防げます。'
      ],
      checks: [
        '{kw} にかかる費用を項目ごとに書き、合計を出す',
        '同じ条件（期間・数量・地域）で2か所以上を比べる',
        '直近6か月の口コミだけを読む',
        '返金・解約・違約の条件をスクリーンショットで残す',
        '支払い前にもう一度カートの合計を確認する',
        '決定は翌日に延ばし、その間に代案を1つ見る'
      ],
      mistakes: [
        '最初の画面の価格だけで比較を終える — 送料・手数料・税が乗ると順位が変わります。',
        '古い口コミを今の条件として読む — 方針は1年で何度も変わります。',
        '1か所だけで聞いて決める — 同じ条件を2か所に聞くと、たいてい条件が違います。'
      ],
      faqExtra: [
        ['{kw} の情報はどのくらいで変わりますか？', '価格と条件は四半期ごとに変わります。この記事は作成時点の内容です。契約や支払いの前に公式案内を確認してください。'],
        ['この記事はそのまま使えますか？', 'はい。出典表記なしで自由に使えますが、数値と引用はご自身で確認してから使ってください。']
      ],
      closing: [
        '{kw} は結局、比較の問題です。よい選択は情報が多い人ではなく、同じ条件で2回比べた人に来ます。このチェックリストを保存して、実際に1つずつ消してみてください。',
        'まとめると {kw} で大事なのは3つ。合計費用、今の条件、返金条件です。この3つだけで多くの失敗を避けられます。'
      ],
      cta: '役に立ったら、必要としている人に送ってください。下のボタンでHTMLをコピーしてブログに貼り付けられます。',
      authorNote: 'この下書きは INSIGHT BRIEF の無料スタジオが作成しました。公開前にご自身で確認した内容を足してください。',
      tagExtra: ['比較', 'チェックリスト', '2026']
    },
    cats: {
      info: {
        label: '情報・ノウハウ',
        hooks: [
          '{kw}、2026年はこの順番で確認',
          '{kw} を始めるときに一番多い失敗3つ',
          '{kw} の費用と時間を数字で比較',
          '広告ではなく口コミで見る {kw} の選び方',
          '{kw} 30分で終わる準備チェックリスト'
        ],
        why: [
          '{kw} の記事はあふれていますが、ほとんどは同じことを繰り返しています。実際に分かれるのは費用構造と条件の2点だけです。',
          '検索上位は広告か3年前の基準です。今の条件で計算し直しました。'
        ],
        rows: [
          ['自分で調べる', '時間はあるが予算が厳しい人', '費用0円、条件を直接確認', '比較に時間がかかる'],
          ['コミュニティの口コミ', '実際の使用例を知りたい人', '実体験が見られる', '広告的な口コミが混ざる'],
          ['専門家・業者に相談', '早く決めたい人', '条件を一度に整理', '相談後に営業連絡が来る']
        ],
        checks: [
          '{kw} で必ず必要な項目3つを先に決める',
          '似た代案2つを並べて書く',
          '価格ではなく含まれる範囲で比べる'
        ],
        faq: [
          ['{kw} は初めてですが、何から始めますか？', '必要な項目3つを書き出すことから始めてください。同じ条件の代案2つを並べ、含まれる範囲を比べると判断が早くなります。'],
          ['無料で確認する方法はありますか？', '公式案内と最近の口コミの2か所で十分です。公式の条件は四半期ごとに変わるので日付を確認してください。'],
          ['どのくらいかかりますか？', '準備だけで多くは1日以内に終わります。候補を2つに絞れば30分で決められます。']
        ],
        tags: ['{kw} 方法', '{kw} 比較', '{kw} 準備', '{kw} 口コミ', '{kw} 費用', '生活ガイド']
      },
      money: {
        label: '経済・資産運用',
        hooks: [
          '{kw}、数字だけで比べると答えが出ます',
          '{kw} で漏れるお金、2026年の基準で計算',
          '{kw} は月いくらが適切か — 3つの基準',
          '{kw} を始める前に必ず確認する3条件',
          '金利・手数料・期間、{kw} で分かれる点'
        ],
        why: [
          '{kw} は金利・手数料・期間が少し違うだけで結果が大きく開きます。感覚より計算が正しい領域です。',
          '今は金利がよく動く局面です。昨年計算した表をそのまま使うと損をすることがあります。'
        ],
        rows: [
          ['定期預金', '元本を減らさず貯めたい人', '元本保証、仕組みが単純', '金利変動に弱い'],
          ['投信・ETF', '中期で運用したい人', '分散できる', '元本割れの可能性'],
          ['現金で持つ', '近く支出がある人', 'すぐ使える', '物価上昇分だけ価値が下がる']
        ],
        checks: [
          '{kw} に入れる金額と期間を先に決める',
          '手数料と税を引いた受取額を計算する',
          '途中解約の条件を確認する'
        ],
        faq: [
          ['{kw} で最初に見る数字は何ですか？', '手数料と税を引いた実際の受取額です。表示金利よりこの数字が結果を決めます。'],
          ['金利が上がるとどうなりますか？', '固定金利は影響が小さく、変動金利は返済額が増えることがあります。契約書の金利条件を先に確認してください。'],
          ['少額でも始められますか？', '多くは可能です。少額ほど手数料の比率が上がるので、最低金額と手数料体系を一緒に見てください。']
        ],
        tags: ['{kw} 計算', '{kw} 金利', '{kw} 手数料', '{kw} 比較', '資産運用', '2026 金融']
      },
      health: {
        label: '健康・暮らし',
        hooks: [
          '{kw}、今日から変えられる3つ',
          '{kw} の習慣、2週間で変わります',
          '{kw} でよく間違われる3つの常識',
          '専門家が {kw} で先に見る指標',
          '{kw} チェックリスト — 毎日3分'
        ],
        why: [
          '{kw} の情報は多いものの、多くは特定商品の広告か根拠の弱い主張です。暮らしの中で続けられることだけを選びました。',
          '健康の情報は人によって条件が違います。この記事は一般的な基準と確認方法をまとめたものです。'
        ],
        rows: [
          ['習慣を変える', '長く続けたい人', '費用0円、副作用が少ない', '効果が出るのが遅い'],
          ['製品・補助器具', '特定の状況を早く改善したい人', 'すぐ体感できる', '広告と実使用の差'],
          ['専門家に相談', '症状が長引く人', '原因を確認できる', '費用と待ち時間']
        ],
        checks: [
          '{kw} の今の状態を数字で書き留める',
          '2週間、毎日同じ時間に記録する',
          '症状が続くなら専門家に相談する'
        ],
        faq: [
          ['{kw} はどのくらいで効果が出ますか？', '習慣を変える場合は通常2〜4週間かかります。記録を残すと変化に早く気づけます。'],
          ['誰がやっても大丈夫ですか？', 'いいえ。疾患がある方や服薬中の方は先に専門家へ相談してください。この記事は一般情報です。'],
          ['製品は必ず必要ですか？', '多くは不要です。生活習慣を変えるだけで半分は解決します。買う前に2週間試してください。']
        ],
        tags: ['{kw} 習慣', '{kw} 方法', '{kw} 効果', '{kw} 注意', '健康ガイド', '生活習慣']
      },
      it: {
        label: 'IT・テック',
        hooks: [
          '{kw}、買う前に確認する5つ',
          '{kw} を選ぶとき、スペックより大事なこと',
          '{kw} 2026年の価格と性能を比較',
          '{kw} 初期設定で変えるべき項目',
          '{kw} 失敗しない順序 — 設置からバックアップまで'
        ],
        why: [
          '{kw} はスペック表が立派なほど実際の使用との差が大きくなります。毎日使う機能だけを比べました。',
          '同じ価格帯でもサポート期間と修理方針で分かれます。数字の後ろの条件を見るべきです。'
        ],
        rows: [
          ['エントリー', 'Web・文書・動画中心の人', '価格が低く軽い', '年数で遅くなる'],
          ['ミドル', '仕事も娯楽も使う人', '価格と性能のバランス', 'モデルごとの差が大きい'],
          ['ハイエンド', '専門作業・長時間使用', 'サポート期間が長い', '価格ほどの体感差はない']
        ],
        checks: [
          '{kw} に必要な機能3つを書き出す',
          'サポート期間と修理方針を確認する',
          '手持ちの機器・周辺機器と互換か見る'
        ],
        faq: [
          ['{kw} は何年使えますか？', '通常3〜5年です。サポート終了後はセキュリティ更新が止まるので、購入前に確認してください。'],
          ['中古でも大丈夫ですか？', '可能です。ただしバッテリー状態と保証の引き継ぎ可否を必ず確認してください。'],
          ['スペックが高ければ良いですか？', 'いいえ。体感差は作業内容で変わります。実際に使う機能3つを基準に比べてください。']
        ],
        tags: ['{kw} 比較', '{kw} おすすめ', '{kw} スペック', '{kw} 価格', 'ITガイド', '2026 テック']
      }
    },
    shorts: {
      hookTitle: '{kw}',
      hooks: [
        '{kw}、この順番だけ守ってください',
        '{kw} を知らずに始めると損します',
        '{kw} 30秒まとめ',
        '{kw} で一番多い間違い',
        '{kw} を始める前に3分だけ見てください'
      ],
      pointTpl: [
        '1つ目、合計で比べる。',
        '2つ目、今の条件だけを見る。',
        '3つ目、返金条件を確認する。',
        '4つ目、1か所だけで聞かない。',
        '5つ目、決定は翌日に延ばす。'
      ],
      captions: {
        info: ['広告と口コミが混ざっても基準は1つ。', '費用構造を見れば選択は単純になります。', '同じ条件で2回比べれば終わります。'],
        money: ['表示金利より受取額が重要です。', '手数料と税を引いて計算してください。', '期間が長いほど条件差が広がります。'],
        health: ['今日から変えられることから始めてください。', '2週間の記録で差が見えます。', '症状が続くなら専門家に相談を。'],
        it: ['スペックより使う機能が基準です。', 'サポート期間と修理方針を確認。', '同じ価格帯なら条件で分かれます。']
      },
      cta: ['詳しい比較表はプロフィールのリンクへ。', 'チェックリストは概要欄のリンクにあります。', '保存して必要なときに見返してください。'],
      capsExtra: ['基準は1つで十分です。', '数字で確認すればぶれません。'],
      hashtags: ['#豆知識', '#ノウハウ', '#ショート', '#2026'],
      descTpl: '{kw} の要点を30秒でまとめました。\n\n詳しい比較表とチェックリストは概要欄のリンクから。\n\n#shorts #{tag}',
      srtNote: 'この字幕は INSIGHT BRIEF の無料スタジオで作成しました。'
    }
  };

  window.IB_CREATOR_DATA = D;
})();
