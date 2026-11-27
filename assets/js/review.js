/* =========================================================
   INSIGHT BRIEF — 리뷰 답글 생성기 (review-reply.html)
   서버 없이 브라우저에서 문장을 조합합니다.
   · 업종 × 별점 × 말투 × 리뷰 키워드 → 짧은형 / 표준형 / 재방문 유도형
   · 결과 언어는 페이지 언어(ko·en·zh·ja)를 따릅니다.
   ========================================================= */
(function () {
  "use strict";

  /* ---------- 문장 틀 ---------- */
  var P = {
    ko: {
      store: "저희 가게",
      openers: {
        polite: ["안녕하세요. {store}입니다.", "안녕하세요, {store}에서 답글 드립니다."],
        friendly: ["안녕하세요, {store} 사장이에요 :)", "안녕하세요! {store}입니다 :)"],
        humor: ["안녕하세요, {store}입니다. 리뷰 읽고 오늘 매출이 오른 기분이에요.", "안녕하세요! {store}입니다. 손님 리뷰는 저희 하루의 하이라이트입니다."],
        apology: ["안녕하세요. {store}입니다. 먼저 불편을 드린 점 사과드립니다.", "안녕하세요, {store} 대표입니다. 남겨 주신 말씀 무겁게 읽었습니다."]
      },
      ack: {
        "5": {
          polite: ["소중한 시간 내어 리뷰를 남겨 주셔서 감사합니다.", "좋은 말씀 남겨 주셔서 진심으로 감사드립니다."],
          friendly: ["이렇게 좋게 봐 주셔서 정말 기뻐요. 감사합니다!", "칭찬해 주신 한 줄 덕분에 오늘 하루 즐겁게 일했어요."],
          humor: ["이 리뷰는 아침마다 다시 읽고 있습니다. 읽을 때마다 힘이 나요.", "손님 리뷰를 사장님보다 직원들이 먼저 봤습니다. 다들 어깨가 올라갔어요."],
          apology: ["좋게 봐 주셔서 감사합니다. 혹시라도 미처 챙기지 못한 부분이 있었다면 먼저 사과드립니다."]
        },
        "4": {
          polite: ["방문해 주시고 리뷰까지 남겨 주셔서 감사합니다. 아쉬우셨던 부분은 더 챙기겠습니다."],
          friendly: ["와 주셔서 고마워요! 살짝 아쉬우셨던 부분은 다음에 꼭 채워 드릴게요."],
          humor: ["별 다섯 개 중 네 개는 감사히 받고, 하나는 숙제로 받았습니다."],
          apology: ["기대에 조금 못 미친 부분이 있었다면 죄송합니다. 말씀해 주신 점 바로 살펴보겠습니다."]
        },
        low: {
          polite: ["기대하고 오셨을 텐데 불편을 드려 정말 죄송합니다.", "이번 방문은 저희가 부족했습니다. 사과드립니다."],
          friendly: ["기대하고 오셨을 텐데 실망시키고 말았네요. 정말 죄송해요."],
          humor: ["칭찬이 아닌 리뷰라서 더 오래 읽었습니다. 그만큼 부족했습니다."],
          apology: ["불편을 드려 정말 죄송합니다. 말씀해 주신 부분은 사실관계부터 다시 확인하고 있습니다."]
        }
      },
      industry: {
        food: {
          "5": ["메뉴가 입에 맞으셨다니 다행입니다. 재료는 매일 들어온 것만 쓰고, 간은 그날그날 맞춰 보고 있습니다."],
          "4": ["맛은 좋게 봐 주셨는데 다른 부분에서 아쉬움을 남긴 것 같습니다. 음식 온도와 양을 한 번 더 점검하겠습니다."],
          low: ["음식의 간·온도·양은 그날 편차가 나지 않도록 주방에서 한 번 더 확인하겠습니다. 대기와 응대도 함께 살펴보겠습니다."]
        },
        cafe: {
          "5": ["커피와 디저트를 좋게 봐 주셔서 감사합니다. 원두는 소량씩 받아 쓰고, 디저트는 그날 만든 것만 내고 있습니다."],
          "4": ["음료와 디저트는 만족하셨지만 자리 안내나 대기에서 아쉬움이 있었던 것 같습니다. 그 부분을 먼저 손보겠습니다."],
          low: ["음료 온도와 디저트 상태, 자리 안내까지 한 번 더 점검하겠습니다. 불편하셨던 시간대도 함께 확인하겠습니다."]
        },
        beauty: {
          "5": ["시술 결과가 마음에 드셨다니 정말 다행입니다. 상담 때 말씀하신 스타일을 그대로 살리려고 합니다."],
          "4": ["스타일은 마음에 드셨지만 안내나 시간 약속에서 아쉬움이 있었던 것 같습니다. 예약 간격을 조금 더 넉넉히 잡겠습니다."],
          low: ["시술 전 상담과 예약 시간 안내에서 부족했습니다. 어떤 부분이 아쉬우셨는지 알려 주시면 다시 맞춰 드리겠습니다."]
        },
        clinic: {
          "5": ["진료와 설명이 도움이 되었다니 다행입니다. 궁금한 점은 다음 방문 때도 충분히 설명드리겠습니다."],
          "4": ["진료 외에 대기나 안내에서 불편을 드린 것 같습니다. 접수와 안내 동선을 다시 정리하겠습니다."],
          low: ["대기와 설명에서 불편을 드려 죄송합니다. 예약 간격과 진료 전 설명 방식을 다시 살펴보겠습니다."]
        },
        stay: {
          "5": ["편안히 지내셨다니 다행입니다. 청결과 침구는 퇴실 때마다 새로 확인하고 있습니다."],
          "4": ["머무시는 동안 아쉬운 점이 있었다니 죄송합니다. 소음과 온도, 비품 상태를 다시 점검하겠습니다."],
          low: ["숙박 중 불편을 드려 죄송합니다. 청결·소음·비품 상태를 직접 확인하고 보완하겠습니다."]
        },
        etc: {
          "5": ["서비스를 만족스럽게 이용하셨다니 다행입니다. 말씀해 주신 부분은 팀과 함께 공유하겠습니다."],
          "4": ["이용에 아쉬운 점이 있었다니 죄송합니다. 안내와 진행 과정을 다시 살펴보겠습니다."],
          low: ["이용 중 불편을 드려 죄송합니다. 어떤 점이 문제였는지 알려 주시면 바로 확인하겠습니다."]
        }
      },
      commit: {
        polite: ["말씀해 주신 점은 다음 방문 때까지 반드시 개선하겠습니다.", "부족한 부분은 바로 고치고, 잘된 부분은 더 살리겠습니다."],
        friendly: ["알려 주신 부분은 꼭 고쳐 놓을게요. 다음엔 더 좋은 모습으로 뵐게요.", "작은 말씀 하나도 놓치지 않고 챙길게요."],
        humor: ["지적해 주신 부분은 메모해서 눈에 보이는 곳에 붙여 두었습니다. 다음엔 다르게 보실 수 있을 겁니다."],
        apology: ["같은 일이 반복되지 않도록 담당과 절차를 다시 점검하겠습니다.", "확인한 내용은 정리해서 다음에 말씀드리겠습니다."]
      },
      closing: {
        polite: ["다시 한 번 감사드리며, 오늘 하루도 편안히 보내시길 바랍니다.", "앞으로도 정성으로 모시겠습니다. 감사합니다."],
        friendly: ["오늘 하루도 좋은 일만 가득하시길요! 감사합니다 :)", "다음에 또 뵈어요. 감사합니다!"],
        humor: ["오늘도 손님 편에 서 있는 가게가 되겠습니다. 감사합니다.", "리뷰 남기느라 쓰신 시간만큼, 다음엔 더 잘하겠습니다."],
        apology: ["불편을 드린 점 다시 한 번 사과드립니다. 감사합니다.", "남겨 주신 말씀 감사합니다. 확인되는 대로 연락드리겠습니다."]
      },
      shortClose: {
        polite: ["다음에 다시 찾아 주시면 정성으로 모시겠습니다.", "오늘 하루도 편안히 보내세요."],
        friendly: ["또 놀러 오세요!", "오늘 하루도 좋은 일만 가득하시길요 :)"],
        humor: ["다음엔 웃으면서 나가실 수 있게 준비하겠습니다.", "오늘도 손님 편에 서 있겠습니다."],
        apology: ["다시 한 번 사과드립니다.", "확인 후 연락드리겠습니다."]
      },
      invite: {
        food: ["다음에는 다른 메뉴도 함께 드셔 보시길 권합니다. 오늘 드신 메뉴와 잘 어울리는 곁들임도 준비해 두겠습니다."],
        cafe: ["다음에는 시즌 음료와 디저트를 함께 권해 드리고 싶습니다. 원하시는 자리가 있으면 미리 말씀해 주세요."],
        beauty: ["다음 방문 때는 지금 스타일을 유지하면서 손질이 쉬운 방향으로도 함께 상담해 드리겠습니다."],
        clinic: ["다음 방문 때 궁금한 점은 진료 전에 충분히 설명드리겠습니다. 예약 시간에 맞춰 기다리지 않도록 접수 순서도 확인해 두겠습니다."],
        stay: ["다음에 오실 때는 원하시는 객실 방향과 층을 미리 말씀해 주시면 맞춰 보겠습니다."],
        etc: ["다음 이용 때도 편하게 말씀해 주시면 맞춰 준비하겠습니다."]
      },
      inviteLow: ["다시 찾아 주실 기회가 있다면 그때는 다르게 모시겠습니다. 불편하셨던 부분은 미리 확인해 두겠습니다."],
      topicP: "말씀해 주신 {label} 부분은 저희가 특히 신경 쓰는 곳입니다. 그렇게 봐 주셔서 감사합니다.",
      topicC: "말씀해 주신 {label} 부분은 그대로 넘기지 않고, 담당자와 함께 원인을 확인하겠습니다.",
      extraP: "말씀해 주신 {label} 부분도 함께 기억하고 있겠습니다.",
      extraC: "{label} 부분도 같은 기준으로 다시 점검하겠습니다."
    },

    en: {
      store: "our shop",
      openers: {
        polite: ["Hello, this is {store}.", "Hello, a reply from {store}."],
        friendly: ["Hi, this is {store}!", "Hello from {store}!"],
        humor: ["Hello, {store} here. We read this review three times, once with a smile.", "Hi! {store} here. Reviews are the highlight of our day."],
        apology: ["Hello, this is {store}. First of all, we are sorry for the inconvenience.", "Hello, {store} here. We read your words carefully."]
      },
      ack: {
        "5": {
          polite: ["Thank you for your kind words.", "We sincerely appreciate the review."],
          friendly: ["This made our day — thank you!", "Thank you so much for the kind words."],
          humor: ["This review is pinned where the whole team can see it.", "The staff read this before the owner did. Everyone stood a little taller."],
          apology: ["Thank you for the kind words. If anything was not taken care of, we apologize first."]
        },
        "4": {
          polite: ["Thank you for visiting and for the detailed review. We will take the shortfall seriously."],
          friendly: ["Thanks for coming! We will make up for the small letdown next time."],
          humor: ["Four out of five is a thank you, and the fifth star is homework for us."],
          apology: ["If we fell short of your expectations, we are sorry. We are looking into it right away."]
        },
        low: {
          polite: ["We are very sorry that your visit fell short of expectations.", "This visit was our failure. We apologize."],
          friendly: ["We are so sorry we let you down when you came with high hopes."],
          humor: ["This was not a compliment, so we read it even longer. We were that short."],
          apology: ["We are truly sorry for the inconvenience. We are checking the facts first."]
        }
      },
      industry: {
        food: {
          "5": ["We are glad the food suited you. We use ingredients that arrive that morning and adjust seasoning daily."],
          "4": ["You liked the food, but we left something to be desired elsewhere. We are checking temperature and portion size."],
          low: ["We are rechecking seasoning, temperature and portion size in the kitchen so the day-to-day gap narrows. Waiting and service will be reviewed as well."]
        },
        cafe: {
          "5": ["Thank you for enjoying the coffee and desserts. Beans arrive in small lots and desserts are made the same day."],
          "4": ["You enjoyed the drinks, but seating or waiting fell short. We will fix that part first."],
          low: ["We are checking drink temperature, dessert condition and seating guidance again, including the time you visited."]
        },
        beauty: {
          "5": ["We are so glad you are happy with the result. We try to follow exactly what you asked for in the consultation."],
          "4": ["You liked the style, but guidance or timing felt rushed. We will allow more time between appointments."],
          low: ["We fell short in the consultation and in keeping to your appointment time. Tell us what felt off and we will adjust."]
        },
        clinic: {
          "5": ["We are glad the visit and the explanation helped. We will explain just as fully next time."],
          "4": ["Waiting or guidance caused inconvenience beyond the care itself. We will reorganize check-in and patient flow."],
          low: ["We are sorry about the wait and the explanation. We are reviewing appointment spacing and how we explain before care."]
        },
        stay: {
          "5": ["We are glad you were comfortable. Cleanliness and bedding are checked fresh after every checkout."],
          "4": ["We are sorry something felt off during your stay. We are checking noise, temperature and room condition."],
          low: ["We are sorry for the inconvenience during your stay. We will inspect cleanliness, noise and amenities ourselves and fix them."]
        },
        etc: {
          "5": ["We are glad the service worked for you. We will share your words with the team."],
          "4": ["We are sorry the experience was not fully satisfactory. We will review our guidance and process."],
          low: ["We are sorry for the inconvenience. Tell us what went wrong and we will look into it right away."]
        }
      },
      commit: {
        polite: ["We will improve what you mentioned before your next visit.", "We will fix what is short and keep what worked."],
        friendly: ["We will get that fixed for you. Next time we will do better.", "We will not let a small note go to waste."],
        humor: ["Your note is on the wall where we can see it. Next time it should look different."],
        apology: ["We are reviewing the process with the team so it does not repeat.", "We will report back once we have confirmed what happened."]
      },
      closing: {
        polite: ["Thank you again, and we hope the rest of your day is comfortable.", "We will keep taking care of every detail. Thank you."],
        friendly: ["Have a lovely day! Thank you :)", "See you again soon. Thank you!"],
        humor: ["We will stay on your side of the counter. Thank you.", "Thank you — we will spend the time you gave us on doing better."],
        apology: ["We apologize once more for the inconvenience. Thank you.", "Thank you for writing. We will contact you once we have checked."]
      },
      shortClose: {
        polite: ["We would be glad to serve you again.", "Have a comfortable rest of the day."],
        friendly: ["Come by again soon!", "Have a lovely day :)"],
        humor: ["Next time we will send you out smiling.", "We will stay on your side."],
        apology: ["We apologize again.", "We will follow up after checking."]
      },
      invite: {
        food: ["Next time we would like you to try another dish on the menu as well."],
        cafe: ["Next visit we would like to recommend a seasonal drink with a dessert. Tell us if you have a favourite seat."],
        beauty: ["Next time we can also talk through an easier-to-maintain version of the same style."],
        clinic: ["Next visit we will explain anything you are curious about before care, and check the queue so you do not wait past your appointment."],
        stay: ["When you come again, tell us your preferred room direction and floor and we will try to arrange it."],
        etc: ["Let us know next time as well and we will prepare accordingly."]
      },
      inviteLow: ["If you give us another chance, we will prepare differently and check the points you raised in advance."],
      topicP: "Thank you for mentioning {label} — that is one of the things we watch most closely.",
      topicC: "We are sorry about {label}. We are checking the cause with the team rather than letting it pass.",
      extraP: "We will keep {label} in mind as well.",
      extraC: "We will review {label} by the same standard."
    },

    zh: {
      store: "本店",
      openers: {
        polite: ["您好，这里是{store}。", "您好，{store}回复您。"],
        friendly: ["您好，我是{store}的店主！", "您好！这里是{store}。"],
        humor: ["您好，这里是{store}。这条评价我读了三遍，其中一遍是笑着读的。", "您好！{store}全体员工都看到这条评价了，大家都很开心。"],
        apology: ["您好，这里是{store}。首先为给您带来的不便致歉。", "您好，我是{store}的负责人，您的留言我们认真读了。"]
      },
      ack: {
        "5": {
          polite: ["感谢您的好评。", "衷心感谢您的评价。"],
          friendly: ["看到您满意我们真的很高兴，谢谢！", "谢谢您的称赞，今天我们干活都更有劲了。"],
          humor: ["这条评价我们贴在员工能看到的地方了。", "店员比店主先看到这条评价，大家都挺起了腰板。"],
          apology: ["感谢您的肯定。如果我们有没照顾到的地方，先向您致歉。"]
        },
        "4": {
          polite: ["感谢光临并留下详细的评价，不足之处我们会认真改进。"],
          friendly: ["谢谢您来！稍微不满意的地方，下次一定补上。"],
          humor: ["五颗星里的四颗我们收下，剩下一颗当作作业。"],
          apology: ["如果没能达到您的期待，非常抱歉，我们会马上核查。"]
        },
        low: {
          polite: ["让您带着期待而来却感到不便，非常抱歉。", "这次是我们做得不够，向您致歉。"],
          friendly: ["让您失望了，真的很抱歉。"],
          humor: ["这不是称赞的评价，所以我们读了更久。确实是我们不足。"],
          apology: ["给您带来不便，非常抱歉。我们会先核实事实经过。"]
        }
      },
      industry: {
        food: {
          "5": ["菜品合您口味，我们就放心了。食材每天到货，调味也按当天状态调整。"],
          "4": ["菜品您还满意，但其他方面让您失望了。我们会重新检查温度和份量。"],
          low: ["我们会让厨房再确认口味、温度和份量，尽量减少每天差异，也会一并检查等位和接待。"]
        },
        cafe: {
          "5": ["感谢您喜欢我们的咖啡和甜点。咖啡豆少量进货，甜点只出当天做的。"],
          "4": ["饮品您满意，但座位引导或等待让您不便，我们会先改进这里。"],
          low: ["我们会重新检查饮品温度、甜点状态和座位引导，也会核实您到店的那个时段。"]
        },
        beauty: {
          "5": ["您对效果满意，我们非常高兴。咨询时您说的风格，我们会尽量原样呈现。"],
          "4": ["风格您满意，但说明或时间安排有欠缺。我们会把预约间隔留得更充裕。"],
          low: ["术前咨询和预约时间说明我们做得不够。请告诉我们哪里不合适，我们会重新调整。"]
        },
        clinic: {
          "5": ["诊疗和说明对您有帮助，我们就放心了。下次也会充分说明。"],
          "4": ["除了诊疗之外，等候或引导给您添了麻烦。我们会重新整理挂号和引导流程。"],
          low: ["等候和说明让您不便，非常抱歉。我们会重新检查预约间隔和诊疗前的说明方式。"]
        },
        stay: {
          "5": ["您住得舒适我们就放心了。清洁和床品每次退房后都会重新确认。"],
          "4": ["入住期间有让您不满意的地方，非常抱歉。我们会重新检查噪音、温度和客房状态。"],
          low: ["住宿期间给您带来不便，非常抱歉。我们会亲自检查清洁、噪音和用品并加以改善。"]
        },
        etc: {
          "5": ["服务让您满意，我们就放心了。您的意见我们会和团队分享。"],
          "4": ["使用中有不满意的地方，非常抱歉。我们会重新检查引导和流程。"],
          low: ["服务过程中给您带来不便，非常抱歉。请告诉我们具体问题，我们会立即核实。"]
        }
      },
      commit: {
        polite: ["您提到的问题，我们会在下次到访前改进。", "不足的地方马上改，做得好的地方继续保持。"],
        friendly: ["您说的我们会改好，下次让您看到更好的样子。", "哪怕是小意见我们也会记住。"],
        humor: ["您指出的地方我们写在看得见的地方了，下次应该会不一样。"],
        apology: ["我们会和负责人一起检查流程，避免再次发生。", "核实后我们会向您说明结果。"]
      },
      closing: {
        polite: ["再次感谢您，祝您今天一切顺利。", "我们会继续用心服务，谢谢。"],
        friendly: ["祝您今天也顺顺利利！谢谢 :)", "下次再见，谢谢！"],
        humor: ["我们会一直站在客人这一边。谢谢。", "您写评价的时间，我们会用来做得更好。谢谢。"],
        apology: ["再次为给您带来的不便致歉，谢谢。", "感谢您的留言，核实后我们会联系您。"]
      },
      shortClose: {
        polite: ["欢迎再次光临，我们会用心接待。", "祝您今天一切顺利。"],
        friendly: ["下次再来玩哦！", "祝您今天也顺顺利利 :)"],
        humor: ["下次一定让您笑着离开。", "我们会一直站在客人这一边。"],
        apology: ["再次致歉。", "核实后我们会联系您。"]
      },
      invite: {
        food: ["下次欢迎也尝尝其他菜品，我们会准备好与今天菜品相配的小菜。"],
        cafe: ["下次想为您推荐季节饮品和甜点。如果有喜欢的座位，提前告诉我们。"],
        beauty: ["下次也可以一起商量一个更好打理、同样适合您的方向。"],
        clinic: ["下次到访时，有疑问我们会在诊疗前充分说明，也会确认挂号顺序，尽量不让您久等。"],
        stay: ["下次来时提前告诉我们想要的房间朝向和楼层，我们会尽量安排。"],
        etc: ["下次使用时也请随时告诉我们，我们会提前准备。"]
      },
      inviteLow: ["如果愿意再给我们一次机会，我们会提前确认您提到的问题，以不同的方式接待您。"],
      topicP: "感谢您提到{label}，这正是我们最在意的地方。",
      topicC: "关于{label}，我们不会就此带过，会和负责人一起核查原因。",
      extraP: "您提到的{label}我们也会记住。",
      extraC: "{label}方面我们也会用同样的标准重新检查。"
    },

    ja: {
      store: "当店",
      openers: {
        polite: ["こんにちは、{store}です。", "こんにちは、{store}より返信いたします。"],
        friendly: ["こんにちは、{store}の店主です！", "こんにちは！{store}です。"],
        humor: ["こんにちは、{store}です。このレビューを三回読みました。一回は笑いながらです。", "こんにちは！{store}です。お客様のレビューは私たちの一日のハイライトです。"],
        apology: ["こんにちは、{store}です。まずご不快な思いをさせてしまい、申し訳ございません。", "こんにちは、{store}の責任者です。いただいたお言葉を重く受け止めています。"]
      },
      ack: {
        "5": {
          polite: ["温かいお言葉をいただき、心より感謝申し上げます。", "レビューをいただきありがとうございます。"],
          friendly: ["そう言っていただけて本当に嬉しいです。ありがとうございます！", "褒めていただいた一言で、今日一日楽しく働けました。"],
          humor: ["このレビューはスタッフが見える場所に貼ってあります。", "オーナーより先にスタッフが読みました。みんな背筋が伸びました。"],
          apology: ["嬉しいお言葉ありがとうございます。もし行き届かない点があったなら、まずお詫び申し上げます。"]
        },
        "4": {
          polite: ["ご来店と詳しいレビューをありがとうございます。至らなかった点は改めてまいります。"],
          friendly: ["来てくださってありがとうございます！少し残念だったところは次回埋め合わせしますね。"],
          humor: ["五つ星のうち四つはありがたく、残り一つは宿題として受け取りました。"],
          apology: ["ご期待に少し届かなかったなら申し訳ございません。すぐに確認いたします。"]
        },
        low: {
          polite: ["楽しみにご来店いただいたのにご不便をおかけし、大変申し訳ございません。", "今回は私たちが至りませんでした。お詫び申し上げます。"],
          friendly: ["楽しみにして来てくださったのに、がっかりさせてしまってごめんなさい。"],
          humor: ["お褒めではないレビューなので、より長く読みました。それだけ至らなかったということです。"],
          apology: ["ご不便をおかけし本当に申し訳ございません。まず事実関係を確認しております。"]
        }
      },
      industry: {
        food: {
          "5": ["お料理がお口に合ってよかったです。食材は毎朝届いたものを使い、味付けもその日ごとに調整しています。"],
          "4": ["お料理は評価いただいたのに、他の点で残念な思いをさせてしまいました。温度と量を今一度確認いたします。"],
          low: ["味付け・温度・量に日ごとのばらつきが出ないよう、厨房で再確認いたします。お待ち時間と接客も併せて見直します。"]
        },
        cafe: {
          "5": ["コーヒーとデザートを楽しんでいただけて嬉しいです。豆は少量ずつ仕入れ、デザートは当日作ったものだけ出しています。"],
          "4": ["お飲み物はご満足いただけたのに、席のご案内やお待ち時間で残念な思いをさせました。まずそこを直します。"],
          low: ["ドリンクの温度、デザートの状態、席のご案内を再確認し、ご来店の時間帯も含めて見直します。"]
        },
        beauty: {
          "5": ["仕上がりにご満足いただけて本当によかったです。カウンセリングでお聞きしたスタイルをそのまま活かすようにしています。"],
          "4": ["スタイルは気に入っていただけたものの、ご案内や時間の点で至りませんでした。予約間隔を少し広くとります。"],
          low: ["施術前のカウンセリングと予約時間のご案内が不足していました。どこが残念だったか教えていただければ調整いたします。"]
        },
        clinic: {
          "5": ["診療とご説明がお役に立ててよかったです。次回もご不明な点は十分に説明いたします。"],
          "4": ["診療以外のお待ち時間やご案内でご不便をおかけしました。受付とご案内の流れを整理いたします。"],
          low: ["お待ち時間とご説明でご不便をおかけし申し訳ございません。予約間隔と診療前の説明方法を見直します。"]
        },
        stay: {
          "5": ["快適にお過ごしいただけてよかったです。清掃と寝具はチェックアウトごとに確認しています。"],
          "4": ["ご滞在中に残念な点があったとのこと、申し訳ございません。騒音・温度・備品の状態を確認いたします。"],
          low: ["ご滞在中にご不便をおかけし申し訳ございません。清潔さ・騒音・備品を直接確認し、改善いたします。"]
        },
        etc: {
          "5": ["サービスにご満足いただけてよかったです。お言葉はチームで共有いたします。"],
          "4": ["ご利用の中で残念な点があったとのこと、申し訳ございません。ご案内と進め方を見直します。"],
          low: ["ご利用中にご不便をおかけし申し訳ございません。どこが問題だったか教えていただければすぐ確認いたします。"]
        }
      },
      commit: {
        polite: ["お聞かせいただいた点は、次回ご来店までに必ず改善いたします。", "至らない点はすぐ直し、良い点はさらに伸ばします。"],
        friendly: ["教えていただいたところは直しておきますね。次はもっと良い姿でお会いします。", "小さなご意見も無駄にしません。"],
        humor: ["ご指摘の点は見える場所に貼っておきました。次は違って見えるはずです。"],
        apology: ["同じことが起きないよう、担当と手順を再確認いたします。", "確認できた内容は改めてご連絡いたします。"]
      },
      closing: {
        polite: ["改めて感謝申し上げます。今日も穏やかにお過ごしください。", "これからも心を込めて対応いたします。ありがとうございます。"],
        friendly: ["今日も良い一日になりますように！ありがとうございます :)", "またお会いしましょう。ありがとうございます！"],
        humor: ["今日もお客様の味方であり続けます。ありがとうございます。", "レビューを書いてくださった時間以上に、次は頑張ります。"],
        apology: ["ご不便をおかけしたことを改めてお詫びいたします。ありがとうございます。", "お言葉ありがとうございます。確認でき次第ご連絡いたします。"]
      },
      shortClose: {
        polite: ["またお越しいただければ心を込めて対応いたします。", "今日も穏やかにお過ごしください。"],
        friendly: ["また遊びに来てくださいね！", "今日も良い一日になりますように :)"],
        humor: ["次は笑ってお帰りいただけるように準備します。", "今日もお客様の味方でいます。"],
        apology: ["改めてお詫び申し上げます。", "確認後ご連絡いたします。"]
      },
      invite: {
        food: ["次回は他のお料理もぜひお試しください。今日のお料理に合う一品もご用意しておきます。"],
        cafe: ["次回は季節のドリンクとデザートをおすすめしたいです。お好きな席があればお知らせください。"],
        beauty: ["次回は今のスタイルを保ちながら、お手入れしやすい方向も一緒にご相談いたします。"],
        clinic: ["次回は診療前にご不明な点を十分に説明し、予約時間にお待たせしないよう受付順も確認しておきます。"],
        stay: ["次回お越しの際は、ご希望のお部屋の向きと階をお知らせいただければ調整いたします。"],
        etc: ["次回ご利用の際もお気軽にお申し付けください。準備いたします。"]
      },
      inviteLow: ["またお越しいただける機会があれば、ご指摘の点を事前に確認したうえで対応いたします。"],
      topicP: "{label}についてお褒めいただきありがとうございます。そこは当店が特に気をつけている点です。",
      topicC: "{label}の件はそのままにせず、担当と一緒に原因を確認いたします。",
      extraP: "{label}の点も覚えておきます。",
      extraC: "{label}についても同じ基準で再確認いたします。"
    }
  };

  /* ---------- 리뷰에서 읽는 주제 ---------- */
  var TOPICS = [
    { id: "taste", cw: 2, ind: ["food","cafe","stay"], kw: ["맛", "맛있", "맛집", "간이", "간도", "풍미", "국물", "소스", "양념", "조리"], label: { ko: "맛", en: "the taste", zh: "口味", ja: "お味" },
      p: { ko: "맛을 좋게 봐 주셔서 감사합니다. 재료와 상태는 매일 같은 기준으로 확인하고 있습니다." },
      c: { ko: "맛이 기대에 못 미치셨다면 아쉽습니다. 레시피와 상태를 다시 확인하겠습니다." },
      pInd: { cafe: "음료 맛을 좋게 봐 주셔서 감사합니다. 원두 상태와 추출은 매일 아침 맞춰 봅니다." },
      cInd: { cafe: "음료 맛이 기대에 못 미쳤다면 아쉽습니다. 추출과 원두 상태를 다시 확인하겠습니다." } },
    { id: "fresh", cw: 1, ind: ["food","cafe"], kw: ["신선", "재료", "싱싱"], label: { ko: "재료", en: "the ingredients", zh: "食材", ja: "食材" },
      p: { ko: "재료를 눈여겨봐 주셔서 감사합니다. 들어오는 날과 상태를 꼼꼼히 보고 손질하고 있습니다." },
      c: { ko: "재료 상태가 아쉬우셨다면 바로 확인하겠습니다. 들어오는 날과 보관 상태를 다시 점검합니다." } },
    { id: "amount", cw: 2, ind: ["food","cafe"], kw: ["양이", "양도", "푸짐", "적어", "많아", "양은"], label: { ko: "양", en: "the portion", zh: "份量", ja: "量" },
      p: { ko: "양도 만족하셨다니 다행입니다. 남기지 않고 드실 만큼 담아 드리는 것을 기준으로 하고 있습니다." },
      c: { ko: "양이 기대와 달랐다면 죄송합니다. 담는 양을 다시 맞춰 보겠습니다." } },
    { id: "price", cw: 2, kw: ["가격", "비싸", "가성비", "가격대", "저렴"], label: { ko: "가격", en: "the price", zh: "价格", ja: "価格" },
      p: { ko: "가격도 납득하셨다니 다행입니다. 재료 값이 오르는 때에도 쉽게 올리지 않으려고 합니다." },
      c: { ko: "가격이 부담되셨다면 말씀 감사합니다. 구성과 양을 함께 보고 조정할 부분을 찾겠습니다." } },
    { id: "service", cw: 2, kw: ["친절", "응대", "사장님", "설명", "안내"], label: { ko: "응대", en: "the service", zh: "服务", ja: "接客" },
      p: { ko: "응대를 좋게 봐 주셔서 감사합니다. 바쁜 시간에도 말투와 안내는 놓치지 않으려고 합니다." },
      c: { ko: "응대에서 불편을 드렸다면 죄송합니다. 그 시간대 담당과 상황을 확인하겠습니다." } },
    { id: "wait", cw: 3, kw: ["웨이팅", "대기", "줄이", "기다", "오래 걸", "늦게"], label: { ko: "대기 시간", en: "the wait", zh: "等待时间", ja: "お待ち時間" },
      p: { ko: "기다리신 시간이 길지 않았다니 다행입니다. 피크 시간에는 순서 안내를 더 자주 확인하고 있습니다." },
      c: { ko: "대기 시간이 길어 불편하셨을 텐데 죄송합니다. 피크 시간대 순서 안내와 준비 순서를 다시 정리하겠습니다." } },
    { id: "clean", cw: 3, kw: ["위생", "청결", "깨끗", "더러", "먼지"], label: { ko: "청결", en: "the cleanliness", zh: "清洁", ja: "清潔さ" },
      p: { ko: "청결을 눈여겨봐 주셔서 감사합니다. 눈에 안 띄는 곳까지 매일 확인하고 있습니다." },
      c: { ko: "청결에서 불편을 드려 죄송합니다. 해당 공간은 바로 정리하고 점검 주기를 다시 잡겠습니다." } },
    { id: "parking", cw: 2, kw: ["주차"], label: { ko: "주차", en: "parking", zh: "停车", ja: "駐車場" },
      p: { ko: "주차까지 편하게 이용하셨다니 다행입니다." },
      c: { ko: "주차 안내가 부족했습니다. 진입로와 주차 가능 시간을 더 분명히 안내하겠습니다." } },
    { id: "noise", cw: 3, kw: ["시끄", "소음", "조용", "소리", "들려"], label: { ko: "소음", en: "the noise", zh: "噪音", ja: "騒音" },
      p: { ko: "조용하게 이용하셨다니 다행입니다." },
      c: { ko: "소음 때문에 불편하셨다면 죄송합니다. 시간대별로 자리 배치와 음량을 조정하겠습니다." } },
    { id: "mood", cw: 1, kw: ["분위기", "인테리어", "조명", "감성"], label: { ko: "분위기", en: "the atmosphere", zh: "氛围", ja: "雰囲気" },
      p: { ko: "분위기를 좋게 봐 주셔서 감사합니다. 조명과 음악은 계절마다 조금씩 바꾸고 있습니다." },
      c: { ko: "분위기가 기대와 달랐다면 아쉽습니다. 조명과 자리 배치를 다시 살펴보겠습니다." } },
    { id: "coffee", cw: 1, ind: ["cafe"], kw: ["커피", "라떼", "원두", "아메리카노"], label: { ko: "커피", en: "the coffee", zh: "咖啡", ja: "コーヒー" },
      p: { ko: "커피를 좋게 봐 주셔서 감사합니다. 원두는 소량씩 받아 쓰고 추출은 매일 아침 맞춰 봅니다." },
      c: { ko: "커피가 기대에 못 미쳤다면 아쉽습니다. 추출과 원두 상태를 다시 확인하겠습니다." } },
    { id: "dessert", cw: 1, ind: ["cafe","food"], kw: ["디저트", "케이크", "빵", "쿠키"], label: { ko: "디저트", en: "the desserts", zh: "甜点", ja: "デザート" },
      p: { ko: "디저트도 맛있게 드셨다니 다행입니다. 그날 만든 것만 내고 있습니다." },
      c: { ko: "디저트 상태가 아쉬우셨다면 죄송합니다. 보관 온도와 당일 판매 기준을 다시 확인하겠습니다." } },
    { id: "reserve", cw: 2, kw: ["예약", "노쇼"], label: { ko: "예약", en: "the booking", zh: "预约", ja: "ご予約" },
      p: { ko: "예약을 편하게 이용하셨다니 다행입니다." },
      c: { ko: "예약 안내가 매끄럽지 못했습니다. 예약 간격과 확인 연락을 다시 정리하겠습니다." } },
    { id: "delivery", cw: 3, ind: ["food","cafe"], kw: ["포장", "배달", "테이크아웃"], label: { ko: "포장·배달", en: "packaging and delivery", zh: "打包·配送", ja: "テイクアウト・配達" },
      p: { ko: "포장 상태까지 좋게 봐 주셔서 감사합니다. 뜨거운 것은 뜨겁게 도착하도록 포장을 계속 손보고 있습니다." },
      c: { ko: "포장·배달 상태가 아쉬우셨다면 죄송합니다. 포장 방법과 배달 동선을 다시 확인하겠습니다." } },
    { id: "room", cw: 3, ind: ["stay"], kw: ["객실", "방 상태", "룸", "침대", "침구"], label: { ko: "객실", en: "the room", zh: "客房", ja: "お部屋" },
      p: { ko: "객실을 편하게 쓰셨다니 다행입니다. 퇴실할 때마다 침구와 욕실을 새로 확인합니다." },
      c: { ko: "객실 상태가 아쉬우셨다면 죄송합니다. 해당 객실을 직접 확인하고 정비하겠습니다." } },
    { id: "bath", cw: 2, ind: ["stay"], kw: ["화장실", "욕실", "샤워"], label: { ko: "욕실·화장실", en: "the bathroom", zh: "浴室·卫生间", ja: "浴室・トイレ" },
      p: { ko: "욕실까지 깔끔하다고 봐 주셔서 감사합니다." },
      c: { ko: "욕실에서 불편을 드려 죄송합니다. 물때와 배수 상태까지 점검하겠습니다." } },
    { id: "view", cw: 1, ind: ["stay"], kw: ["뷰", "전망", "바다"], label: { ko: "전망", en: "the view", zh: "景观", ja: "眺め" },
      p: { ko: "전망을 좋게 봐 주셔서 감사합니다." },
      c: { ko: "전망이 기대와 달랐다면 아쉽습니다. 다음에는 원하시는 방향의 객실로 안내드릴 수 있게 확인하겠습니다." } },
    { id: "breakfast", cw: 1, ind: ["stay"], kw: ["조식", "아침식사"], label: { ko: "조식", en: "the breakfast", zh: "早餐", ja: "朝食" },
      p: { ko: "조식도 만족하셨다니 다행입니다. 따뜻한 음식이 따뜻할 때 나가도록 시간을 맞추고 있습니다." },
      c: { ko: "조식이 아쉬우셨다면 죄송합니다. 메뉴와 제공 시간을 다시 점검하겠습니다." } },
    { id: "result", cw: 3, ind: ["beauty"], kw: ["시술", "커트", "펌", "염색", "네일", "스타일", "머리"], label: { ko: "시술 결과", en: "the result", zh: "效果", ja: "仕上がり" },
      p: { ko: "시술 결과가 마음에 드셨다니 정말 다행입니다. 상담 때 말씀하신 방향을 그대로 살리려고 합니다." },
      c: { ko: "결과가 기대와 달랐다면 정말 죄송합니다. 어떤 부분이 아쉬우셨는지 알려 주시면 다시 맞춰 드리겠습니다." } },
    { id: "care", cw: 3, ind: ["clinic"], kw: ["진료", "상담", "치료", "의사", "선생님"], label: { ko: "진료·상담", en: "the consultation", zh: "诊疗·咨询", ja: "診療・カウンセリング" },
      p: { ko: "설명이 도움이 되었다니 다행입니다. 궁금한 점은 다음 방문 때도 충분히 설명드리겠습니다." },
      c: { ko: "진료·상담에서 불편을 드려 죄송합니다. 대기와 설명 방식부터 다시 살펴보겠습니다." } },
    { id: "staff", cw: 2, kw: ["직원"], label: { ko: "직원 응대", en: "the staff", zh: "员工服务", ja: "スタッフの対応" },
      p: { ko: "직원 응대를 좋게 봐 주셔서 감사합니다. 그 자리에 있던 직원에게도 전하겠습니다." },
      c: { ko: "직원 응대에서 불편을 드렸다면 죄송합니다. 해당 상황을 확인하고 교육에 반영하겠습니다." } }
  ];

  var SENSITIVE = ["식중독", "배탈", "설사", "구토", "알레르기", "이물질", "벌레", "곰팡이", "화상", "부상", "다쳤", "병원비", "환불", "보상", "고소", "신고", "법적", "소송", "중상", "화재"];

  var SAMPLES = [
    { industry: "food", rating: "4", text: "오늘 점심에 갔는데 국물이 진하고 반찬도 정갈했어요. 다만 12시 넘으니 웨이팅이 좀 길었습니다." },
    { industry: "cafe", rating: "5", text: "라떼 맛있고 사장님도 친절하세요. 콘센트 있는 자리가 있어서 오래 앉아 있기 좋았어요." },
    { industry: "beauty", rating: "low", text: "펌하고 왔는데 생각보다 너무 짧게 잘렸어요. 상담할 때 말씀드린 길이랑 달라서 아쉽습니다." },
    { industry: "clinic", rating: "low", text: "예약하고 갔는데 40분을 기다렸어요. 진료는 꼼꼼하셨지만 안내가 아쉬웠습니다." },
    { industry: "stay", rating: "low", text: "객실은 깨끗했는데 옆방 소리가 다 들려서 잠을 설쳤어요. 조식은 맛있었습니다." },
    { industry: "food", rating: "low", text: "배달로 시켰는데 음식이 다 식어서 왔어요. 맛은 괜찮았습니다." }
  ];

  /* ---------- 도구 ---------- */
  function mulberry32(a) {
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      var t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  function pick(arr, rnd) {
    if (!arr || !arr.length) return "";
    if (arr.length === 1) return arr[0];
    return arr[Math.floor(rnd() * arr.length)];
  }

  function fill(tpl, store, label) {
    return String(tpl).replace(/\{store\}/g, store).replace(/\{label\}/g, label || "");
  }

  var LANG = (function () {
    var l = (document.documentElement.getAttribute("lang") || "ko").toLowerCase();
    if (l.indexOf("zh") === 0) return "zh";
    if (l.indexOf("ja") === 0) return "ja";
    if (l.indexOf("en") === 0) return "en";
    return "ko";
  })();

  var TEXT = {
    ko: { label: "주제", empty: "리뷰를 입력하고 답글 생성하기를 누르면 세 가지 답글이 나옵니다.",
          copied: "복사됨", copy: "복사", count: "자",
          summary: "업종 {i} · 별점 {r} · 말투 {t}",
          ind: { food: "음식점", cafe: "카페·디저트", beauty: "미용실·네일", clinic: "병원·치과", stay: "숙박·펜션", etc: "기타 서비스" },
          rt: { "5": "★5", "4": "★4", low: "★1~3" },
          tn: { polite: "정중", friendly: "친근", humor: "유머", apology: "사과" } },
    en: { label: "topics", empty: "Enter a review and press Generate to get three replies.",
          copied: "Copied", copy: "Copy", count: "chars",
          summary: "{i} · {r} stars · {t} tone",
          ind: { food: "Restaurant", cafe: "Cafe", beauty: "Salon", clinic: "Clinic", stay: "Lodging", etc: "Service" },
          rt: { "5": "5", "4": "4", low: "1-3" },
          tn: { polite: "polite", friendly: "friendly", humor: "witty", apology: "apologetic" } },
    zh: { label: "关键词", empty: "输入评价后点击生成，即可得到三种回复。",
          copied: "已复制", copy: "复制", count: "字",
          summary: "{i} · {r} · {t}",
          ind: { food: "餐厅", cafe: "咖啡·甜点", beauty: "美容·美甲", clinic: "医院·牙科", stay: "住宿", etc: "其他服务" },
          rt: { "5": "5", "4": "4", low: "1~3" },
          tn: { polite: "郑重", friendly: "亲切", humor: "幽默", apology: "致歉" } },
    ja: { label: "トピック", empty: "レビューを入力して生成すると、3種類の返信ができます。",
          copied: "コピー済み", copy: "コピー", count: "文字",
          summary: "{i} · {r} · {t}",
          ind: { food: "飲食店", cafe: "カフェ", beauty: "美容室・ネイル", clinic: "医院・歯科", stay: "宿泊", etc: "その他サービス" },
          rt: { "5": "★5", "4": "★4", low: "★1〜3" },
          tn: { polite: "丁寧", friendly: "親しみ", humor: "ユーモア", apology: "お詫び" } }
  }[LANG];

  /* ---------- 상태 ---------- */
  var state = { industry: "food", rating: "5", tone: "polite", store: "" };
  var round = 0;

  var NEG = ["않", "없", "못", "별로", "아쉬", "불편", "실망", "늦", "길", "시끄", "적", "비싸", "더러", "최악", "다시는", "불만", "설쳤", "힘들", "불친", "짜", "싱겁", "식었", "차가", "오래"];
  var POS = ["깨끗", "맛있", "친절", "좋았", "훌륭", "만족", "최고", "정갈", "편했", "좋아", "괜찮", "꼼꼼"];

  function negNear(text, at, len) {
    var w = text.slice(Math.max(0, at - 20), at + len + 20), c = 0, i;
    for (i = 0; i < NEG.length; i++) if (w.indexOf(NEG[i]) !== -1) c++;
    var p = text.slice(Math.max(0, at - 3), at + len + 6), q = 0;
    for (i = 0; i < POS.length; i++) if (p.indexOf(POS[i]) !== -1) q++;
    return c * 2 - q * 3;
  }

  function detectTopics(text) {
    if (!text) return [];
    var found = [];
    for (var i = 0; i < TOPICS.length; i++) {
      var t = TOPICS[i];
      if (t.ind && t.ind.indexOf(state.industry) === -1) continue;
      for (var k = 0; k < t.kw.length; k++) {
        var at = text.indexOf(t.kw[k]);
        if (at !== -1) { found.push({ t: t, at: at, neg: negNear(text, at, t.kw[k].length), i: i }); break; }
      }
    }
    if (state.rating === "low") {
      var strong = found.filter(function (x) { return x.neg >= 0; });
      if (strong.length) found = strong;
      found.sort(function (a, b) {
        var wa = (a.t.cw || 1) * 6 + a.neg, wb = (b.t.cw || 1) * 6 + b.neg;
        return wb - wa || a.i - b.i;
      });
    } else {
      found.sort(function (a, b) {
        if (a.neg !== b.neg) return a.neg - b.neg;
        return a.i - b.i;
      });
    }
    return found.slice(0, 2).map(function (x) { return x.t; });
  }

  function topicLabel(t) {
    return t.label[LANG] || t.label.ko;
  }

  function topicPraise(t) {
    var own = (t.pInd && t.pInd[state.industry]) || (t.p && t.p[LANG]);
    if (own) return own;
    return fill(P[LANG].topicP, null, topicLabel(t));
  }

  function topicComplaint(t) {
    var own = (t.cInd && t.cInd[state.industry]) || (t.c && t.c[LANG]);
    if (own) return own;
    return fill(P[LANG].topicC, null, topicLabel(t));
  }

  function compose(review) {
    var rnd = mulberry32((round + 1) * 2654435761 + review.length * 97 + state.industry.length * 31 + state.rating.length);
    var p = P[LANG] || P.ko;
    var store = state.store ? state.store : p.store;
    var rating = state.rating;
    var tone = state.tone;
    var topics = detectTopics(review);
    var t1 = topics[0], t2 = topics[1];

    var opener = fill(pick(p.openers[tone], rnd), store);
    var ack = fill(pick(p.ack[rating][tone] || p.ack[rating].polite, rnd), store);
    var indLine = fill(pick(p.industry[state.industry][rating], rnd), store);

    var body;
    if (t1) body = rating === "low" ? topicComplaint(t1) : topicPraise(t1);
    else body = indLine;

    var extra = "";
    if (t2) extra = fill(rating === "low" || rating === "4" ? p.extraC : p.extraP, store, topicLabel(t2));

    var needCommit = rating !== "5" || tone === "apology";
    var commit = needCommit ? fill(pick(p.commit[tone], rnd), store) : "";
    var closing = fill(pick(p.closing[tone], rnd), store);
    var shortClose = fill(pick(p.shortClose[tone], rnd), store);
    var invite = rating === "low"
      ? fill(pick(p.inviteLow, rnd), store)
      : fill(pick(p.invite[state.industry], rnd), store);

    var shortThird = (rating === "low" && (t1 || indLine)) ? (t1 ? topicComplaint(t1) : indLine) : shortClose;
    var short = [opener, ack, shortThird].filter(Boolean).join(" ");
    var standard = [opener, ack, body, extra, commit, closing].filter(Boolean).join(" ");
    var revisitParts = [opener, ack, body, extra, commit, invite, closing].filter(Boolean);
    var revisit = revisitParts.join(" ");

    return { short: short, standard: standard, revisit: revisit, topics: topics };
  }

  /* ---------- 화면 ---------- */
  var el = {};
  function $(id) { return document.getElementById(id); }

  function setSeg(group, value) {
    var btns = document.querySelectorAll('[data-group="' + group + '"] button');
    for (var i = 0; i < btns.length; i++) {
      var on = btns[i].getAttribute("data-value") === value;
      btns[i].setAttribute("aria-pressed", on ? "true" : "false");
    }
  }

  function renderTopics(topics) {
    var box = $("rv-tags");
    if (!box) return;
    var html = '<span class="lb">' + TEXT.label + "</span>";
    if (!topics.length) {
      box.innerHTML = "";
      box.hidden = true;
      return;
    }
    box.hidden = false;
    for (var i = 0; i < topics.length; i++) {
      html += '<span class="chip">' + topicLabel(topics[i]) + "</span>";
    }
    box.innerHTML = html;
  }

  function renderCards(out) {
    var wrap = $("rv-cards");
    var kinds = [
      ["SHORT", LANG === "ko" ? "짧은형" : LANG === "en" ? "Short" : LANG === "zh" ? "简短型" : "短め", out.short],
      ["STANDARD", LANG === "ko" ? "표준형" : LANG === "en" ? "Standard" : LANG === "zh" ? "标准型" : "標準", out.standard],
      ["REVISIT", LANG === "ko" ? "재방문 유도형" : LANG === "en" ? "Invite back" : LANG === "zh" ? "引导再次光临" : "再来店誘導", out.revisit]
    ];
    var html = "";
    for (var i = 0; i < kinds.length; i++) {
      var text = kinds[i][2];
      var len = Array.from(text).length;
      html += '<article class="rv-card">' +
        '<div class="rv-card-head">' +
          '<span class="k">' + kinds[i][0] + "</span>" +
          '<span class="n">' + kinds[i][1] + "</span>" +
          '<span class="len">' + len + " " + TEXT.count + "</span>" +
          '<button type="button" class="rv-copy" data-idx="' + i + '">' + TEXT.copy + "</button>" +
        "</div>" +
        '<p class="rv-text" id="rv-text-' + i + '">' + escapeHtml(text) + "</p>" +
      "</article>";
    }
    wrap.innerHTML = html;
  }

  function escapeHtml(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function generate() {
    var review = ($("rv-review") && $("rv-review").value || "").trim();
    var out = compose(review);
    renderCards(out);
    renderTopics(out.topics);

    var sum = $("rv-summary");
    if (sum) {
      sum.textContent = TEXT.summary
        .replace("{i}", TEXT.ind[state.industry] || "")
        .replace("{r}", TEXT.rt[state.rating] || "")
        .replace("{t}", TEXT.tn[state.tone] || "");
    }

    var warn = $("rv-warn");
    if (warn) {
      var hit = false;
      for (var i = 0; i < SENSITIVE.length; i++) if (review.indexOf(SENSITIVE[i]) !== -1) { hit = true; break; }
      warn.hidden = !hit;
    }
  }

  function bindSeg() {
    var groups = document.querySelectorAll("[data-group]");
    for (var i = 0; i < groups.length; i++) {
      (function (g) {
        g.addEventListener("click", function (e) {
          var b = e.target.closest("button[data-value]");
          if (!b) return;
          var key = g.getAttribute("data-group");
          state[key] = b.getAttribute("data-value");
          setSeg(key, state[key]);
          round++;
          generate();
        });
      })(groups[i]);
    }
  }

  function init() {
    if (!$("rv-cards")) return;
    el.review = $("rv-review");
    bindSeg();

    var go = $("rv-go");
    if (go) go.addEventListener("click", function () { round++; generate(); });
    var again = $("rv-again");
    if (again) again.addEventListener("click", function () { round++; generate(); });
    var reset = $("rv-reset");
    if (reset) reset.addEventListener("click", function () {
      state = { industry: "food", rating: "5", tone: "polite", store: "" };
      if (el.review) el.review.value = "";
      var s = $("rv-store"); if (s) s.value = "";
      setSeg("industry", state.industry); setSeg("rating", state.rating); setSeg("tone", state.tone);
      round++; generate();
    });

    if (el.review) {
      el.review.addEventListener("input", function () {
        var c = $("rv-count");
        if (c) c.textContent = Array.from(el.review.value).length + " / 500";
        if (el.review.value.length > 500) el.review.value = el.review.value.slice(0, 500);
      });
    }

    var store = $("rv-store");
    if (store) store.addEventListener("input", function () { state.store = store.value.trim().slice(0, 20); round++; generate(); });

    var samples = $("rv-samples");
    if (samples) samples.addEventListener("click", function (e) {
      var b = e.target.closest("button[data-idx]");
      if (!b) return;
      var s = SAMPLES[Number(b.getAttribute("data-idx"))];
      if (!s) return;
      if (el.review) { el.review.value = s.text; }
      var c = $("rv-count"); if (c) c.textContent = Array.from(s.text).length + " / 500";
      state.industry = s.industry; state.rating = s.rating;
      setSeg("industry", s.industry); setSeg("rating", s.rating);
      round++; generate();
    });

    var cards = $("rv-cards");
    if (cards) cards.addEventListener("click", function (e) {
      var b = e.target.closest(".rv-copy");
      if (!b) return;
      var idx = b.getAttribute("data-idx");
      var node = $("rv-text-" + idx);
      if (!node) return;
      var text = node.textContent;
      var done = function () {
        b.textContent = TEXT.copied; b.classList.add("is-done");
        setTimeout(function () { b.textContent = TEXT.copy; b.classList.remove("is-done"); }, 1400);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, function () { fallbackCopy(text); done(); });
      } else { fallbackCopy(text); done(); }
    });

    generate();
  }

  function fallbackCopy(text) {
    var ta = document.createElement("textarea");
    ta.value = text; ta.setAttribute("readonly", "");
    ta.style.position = "fixed"; ta.style.left = "-9999px";
    document.body.appendChild(ta); ta.select();
    try { document.execCommand("copy"); } catch (err) {}
    document.body.removeChild(ta);
  }

  /* 언어 전환(i18n.js)이 DOM을 바꾼 뒤에도 다시 그리도록 */
  document.addEventListener("DOMContentLoaded", init);
})();
