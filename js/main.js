/* =====================================================================
   main.js — 전체 흐름 조립 + 데이터 정의
   ---------------------------------------------------------------------
   ▶ 커스터마이징은 대부분 아래 APP_DATA 한 곳만 수정하면 됩니다.
     - startDate   : 연애 시작일 (YYYY-MM-DD)
     - finalImage  : 퍼즐 완성 사진 경로
     - imageBase   : 추억 사진 폴더 경로
     - quiz        : 퀴즈 9문제
     - memories    : 추억 모달 데이터
     - letter      : 러브레터 인사말/본문/서명
     - timeline    : 미래 타임라인 목표
     - endingMessage : 엔딩 문구
   ===================================================================== */
(function () {
  "use strict";

  /* =====================================================================
     ❶ 사용자 데이터 (여기만 바꾸면 다른 커플도 그대로 재사용 가능)
     ===================================================================== */
  const APP_DATA = {
    // 연애 시작일 — 실시간 D-day 계산 기준
    startDate: "2026-03-15",

    // 퍼즐 완성 사진 (3x3로 잘려 한 조각씩 공개됨)
    finalImage: "images/puzzle/final.jpg",

    // 추억 사진이 들어있는 폴더
    imageBase: "images/memories/",

    // 엔딩 문구
    endingMessage: "앞으로도 잘 부탁해 ❤️",

    // 퀴즈 통과 기준 — 이 점수 미만이면 통과되지 않고 처음부터 다시 풀어야 함
    // (예: 6 → 5개 이하 정답 시 재도전). 0이면 게이트 없음(항상 통과)
    quizPassScore: 6,

    // 편지 잠금 — 이 날짜 0시 이전에는 편지가 열리지 않고 카운트다운만 표시
    //  · enabled: false 로 두면 잠금 해제(언제나 열림)
    //  · date: 100일 당일 (연애 시작일 2026-03-15 기준 D+100 = 2026-06-22)
    letterUnlock: {
      enabled: true,
      date: "2026-06-22",
    },

    /* ---------- 퀴즈 9문제 ----------
       correct   : 정답 보기 인덱스(0~3). "all"이면 모든 보기 정답 처리
       correctMsg: 정답 멘트
       wrongMsg  : 기본 오답 멘트 ({선택} 자리에 고른 보기 텍스트가 들어감)
       optionMsgs: 특정 보기에만 보여줄 전용 멘트 { 인덱스: "멘트" } (정답/오답 멘트보다 우선) */
    quiz: [
      {
        question: "Q1. 우리가 처음 같이 본 영화는?",
        options: ["백룸", "왕과 사는 남자", "휴민트", "군체"],
        correct: 2,
        correctMsg: "정답! 🎬 우리의 첫 영화 데이트 시작!",
        wrongMsg: "아쉽지만 정답은 휴민트! 그래도 같이 본 건 맞으니까 통과 ❤️",
        optionMsgs: {
          3: "언놈이랑 이런 영화를 본거야..? ㅡ3ㅡ",
        },
      },
      {
        question: "Q2. 우리가 처음 만나기로 한 날은?",
        options: ["2026년 1월 25일", "2026년 1월 31일", "2026년 2월 13일", "2026년 2월 19일"],
        correct: 3,
        correctMsg: "정답! 📅 그날을 아직도 기억해 ❤️",
        wrongMsg: "정답은 2026년 2월 19일! 그날 진짜 떨렸는데 ㅎㅎ",
      },
      {
        question: "Q3. 우리 처음 연락을 시작한 날은?",
        options: ["2026년 1월 25일", "2026년 2월 7일", "2026년 1월 21일", "2026년 2월 19일"],
        correct: 0,
        correctMsg: "정답! 💬 첫 연락부터 다 기억하고 있네 ❤️",
        wrongMsg: "정답은 2026년 1월 25일! 그때부터 시작이었지 ㅎㅎ",
      },
      {
        question: "Q4. 처음 인생네컷 찍은 장소는?",
        options: ["진해루", "로망스 다리", "중원로타리", "경화역"],
        correct: 1,
        correctMsg: "정답! 📸 로망스 다리에서 찍은 첫 네컷 ❤️",
        wrongMsg: "정답은 로망스 다리! 사진 다시 보러 가야겠다 ㅎㅎ",
      },
      {
        question: "Q5. 처음 키스한 장소와 입에 물고 있던 것은?",
        options: [
          "진주집 앞 / 호올스",
          "롯데몰 뒷쪽 / 이클립스",
          "문산 코아루 아파트 101동 앞 / 폴로",
          "진주집 앞 / 이클립스",
        ],
        correct: 3,
        correctMsg: "정답! 💋 그 순간 아직도 생생해 ❤️",
        wrongMsg: "정답은 진주집 앞 / 이클립스! 「{선택}」… 언놈이야..? 😡",
      },
      {
        question: "Q6. 내가 좋아하는 음식은?",
        options: ["육회", "치킨", "연어", "고기"],
        correct: "all", // 모두 정답
        correctMsg: "정답! 사실 다 좋아함 🤤 이 문제는 함정이었습니다 😎",
        wrongMsg: "정답! 사실 다 좋아함 🤤",
      },
      {
        question: "Q7. 내가 가장 귀여울 때는?",
        options: ["웃을 때", "밥 먹을 때", "울 때", "항상"],
        correct: 3,
        correctMsg: "이거로 누를 것 같았어 ❤️",
        wrongMsg: "그렇게 생각하구 있었구나? 몰랐네 😏",
      },
      {
        question: "Q8. 누가 더 사랑할까?",
        options: ["대경", "다연", "대경 51 : 다연 49", "대경 49 : 다연 51"],
        correct: 0,
        correctMsg: "정답 ❤️ 내가 훨씬 더 많이 사랑해.",
        wrongMsg: "정답은 대경! 내가 더 많이 사랑한다구 ❤️",
        optionMsgs: {
          1: "역시.. 나밖에 모르는 바부..❤️‍🔥",
          2: "51:49는 너무 근소하잖아! 압도적이어야지 ❤️",
          3: "이정도만 저를 사랑하셨던건가요? 🥲",
        },
      },
      {
        question: "Q9. 우리의 다음 목표는?",
        options: ["200일", "300일", "500일", "결혼"],
        correct: 3,
        correctMsg: "정답 ❤️ 앞으로도 오래오래 함께하자.",
        wrongMsg: "그 뒤에는 없는 거야? 🥹",
        optionMsgs: {
          0: "그 뒤에는 없는 거야? 🥹",
          1: "그 뒤에는 없는 거야? 🥹",
          2: "그 뒤에는 없는 거야? 🥹",
        },
      },
    ],

    /* ---------- 추억 모달 (러브레터 중간에서 호출) ---------- */
    memories: {
      1: {
        title: "❤️ 우리의 시작",
        photos: ["2.jpeg", "5.JPG"],
        desc: "처음에는 어색했지만 어느 순간부터 함께 있는 게 너무 자연스러워지고 편안해졌어",
      },
      2: {
        title: "🌸 봄날의 추억",
        photos: ["4.JPG", "3.JPG", "6.jpeg"],
        desc: "바다도 예쁘고 벚꽃도 예뻤지만 지금 생각하면 공주가 훨씬 더 예뻐 ㅎㅎ",
      },
      3: {
        title: "🫶 우리의 일상",
        photos: ["1.jpg", "7.JPG", "8.JPG"],
        desc: "특별한 날보다 공주와 함께한 평범한 일상이 더 소중한 추억으로 남아있어",
      },
      4: {
        title: "🐱 우리만의 시간",
        photos: ["9.JPG", "10.JPG"],
        desc: "공주의 친구도 소개시켜주고, 놀이터에서 앉아서 이야기하며 고양이와 함께한 날들도 너무 행복했어",
      },
      5: {
        title: "🌊 앞으로도 함께",
        photos: ["11.JPG", "12.JPG"],
        desc: "앞으로도 지금처럼 같이 웃고, 같이 추억을 쌓고, 사진도 많이 남기면서 우리만의 이야기를 계속 만들어가자",
      },
    },

    /* ---------- 러브레터 ----------
       blocks 배열 순서대로 화면에 나타납니다.
       { type: "text", text: "..." }  → 일반 단락 (줄바꿈은 \n)
       { type: "memory", id: 1 }       → 그 자리에 "추억 보기" 버튼 삽입 */
    letter: {
      greeting: "Dear. 공주님",
      sign: "From. 대경",
      blocks: [
        { type: "text", text: "어느덧 우리가 함께한 시간이 벌써 100일이나 되었네. 사귀자고 했던 게 엊그제 같은데 종강도 하고, 이렇게 100일 기념으로 같이 경주까지 오게 되니까 괜히 신기하기도 하고 너무 행복해." },
        { type: "text", text: "선물은 서로 안 해주기로 했으니까 따로 준비하지는 않았지만, 대신 이렇게 서프라이즈 이벤트를 준비해봤어. 어때? 놀랐어? 준비하는지도 몰랐지? 마음에 들었으면 좋겠다." },
        { type: "text", text: "다연이와 함께한 지난 100일은 정말 소중하고 행복한 시간이었어." },
        { type: "text", text: "같이 PC방 가서 오버워치도 하고,\n군항제 놀러 가기 전에 마트에서 장도 보고," },
        { type: "memory", id: 1 },
        { type: "text", text: "진해루에서 산책도 하고,\n로망스 다리에서 다연이처럼 예쁜 벚꽃도 구경하고," },
        { type: "memory", id: 2 },
        { type: "text", text: "찜질방에 가서 클레이로 마루도 만들고,\n창원 실습 때는 가로수길 가서 데이트도 하고," },
        { type: "memory", id: 3 },
        { type: "text", text: "공주 친구랑 같이 술도 마셔보고,\n공주네 아파트 길냥이랑 놀이터에서 같이 놀기도 하고," },
        { type: "memory", id: 4 },
        { type: "text", text: "사천에 바다 보러 가기도 하고,\n우리의 첫 커플티도 맞췄지." },
        { type: "memory", id: 5 },
        { type: "text", text: "돌이켜보면 특별한 날들만 기억에 남는 게 아니라 함께했던 모든 날들이 하나하나 소중한 추억으로 남은 것 같아." },
        { type: "text", text: "어디에서 뭘 했는지보다 그 순간을 다연이와 함께했다는 사실이 더 좋았고, 그래서 같은 장소를 다시 가게 되더라도 다른 기억보다 다연이와 함께했던 순간들이 가장 먼저 떠오를 것 같아." },
        { type: "text", text: "100일 동안 만나면서 우리 공주한테 고마웠던 것도 정말 많아." },
        { type: "text", text: "누구보다 먼저 내 편이 되어주고,\n좋은 일이 있으면 마치 본인 일처럼 기뻐해 주고,\n항상 나를 챙겨주려고 하고,\n짜증을 냈을 때는 먼저 미안하다고 이야기해 주고,\n서운하거나 화가 난 일이 있으면 솔직하게 마음을 말해주고,\n매일 고맙다, 사랑한다는 표현도 아낌없이 해주고,\n힘든 일이 있을 때는 지금 어떤 감정인지 먼저 이야기해 주고,\n경대에서 우리 학교까지 먼데도 데려다주려 하고," },
        { type: "text", text: "그런 모습들을 보면서 나는 우리 공주를 더 많이 사랑하게 된 것 같아." },
        { type: "text", text: "그리고 나도 공주에게 더 좋은 남자친구가 되고 싶다는 생각을 많이 하게 됐어." },
        { type: "text", text: "사실 연애를 하다 보면 좋은 일만 있는 건 아니잖아." },
        { type: "text", text: "서운한 일도 있을 수 있고,\n의견이 다를 때도 있고,\n가끔은 서로 힘들 때도 있을 거야." },
        { type: "text", text: "그런데 나는 공주랑 만나면서 그런 순간들조차도 충분히 함께 이겨낼 수 있겠다는 생각을 정말 많이 했어." },
        { type: "text", text: "공주는 힘든 일이 있으면 숨기기보다는 솔직하게 이야기해 주려고 하고,\n서운한 게 생겨도 혼자 참고 넘기기보다는 나랑 같이 해결하려고 해주잖아." },
        { type: "text", text: "그래서 우리 관계가 더 소중하게 느껴지고,\n앞으로도 오래 함께하고 싶다는 생각이 들어." },
        { type: "text", text: "연애도 오래 하고,\n언젠가는 결혼도 하고 싶고." },
        { type: "text", text: "있잖아, 나는" },
        { type: "text", text: "공주가 짜증 내는 모습도 좋고,\n귀엽게 장난치는 모습도 좋고,\n투정부리는 모습도 좋고,\n맛있는 거 먹으면서 행복해하는 모습도 좋고,\n나를 바라보면서 웃어주는 모습도 좋아." },
        { type: "text", text: "그냥 다연이라서 좋아." },
        { type: "text", text: "그래서 같이 있으면 나도 모르게 웃게 되고,\n평범한 하루도 더 즐겁고 행복하게 느껴지는 것 같아." },
        { type: "text", text: "우리 사진도 많이 찍고,\n여기저기 많이 함께 다니면서 앞으로의 추억들도 예쁘게 쌓아가자." },
        { type: "text", text: "앞으로 어떤 일이 생기더라도 지금처럼 서로 이야기 많이 하고,\n서로를 믿어주고,\n서로에게 의지하고,\n서로의 편이 되어주면서 오래오래 함께했으면 좋겠어." },
        { type: "text", text: "100일 동안 함께해줘서 정말 행복했고 고마워." },
        { type: "text", text: "그리고 언제나 나를 사랑해줘서 고마워." },
        { type: "text", text: "사실 100일이 특별한 이유는 100일이라는 숫자 때문이 아니라,\n그 100일을 공주와 함께 보냈기 때문인 것 같아." },
        { type: "text", text: "앞으로도 잘 부탁해." },
        { type: "text", text: "우리 다연이는 나에게 가장 소중한 사람이야." },
        { type: "text", text: "100일 진심으로 축하하고,\n앞으로 지금보다 더 많이 사랑할게." },
        { type: "text", text: "그리고 앞으로의 모든 날들도\n계속 공주와 함께하고 싶어." },
        { type: "text", text: "사랑해, 다연아" },
      ],
    },

    /* ---------- 미래 타임라인 ----------
       days: 해당 일수 (D-day 기준 도달 여부 자동 판정)
       goal: true 면 '목표'(하트) 스타일로 항상 설렘 상태 표시 */
    timeline: [
      { label: "100일", emoji: "💛", days: 100 },
      { label: "200일", emoji: "💗", days: 200 },
      { label: "300일", emoji: "💖", days: 300 },
      { label: "500일", emoji: "💝", days: 500 },
      { label: "1000일", emoji: "💞", days: 1000 },
      { label: "결혼", emoji: "💍", goal: true },
    ],
  };

  // 다른 모듈에서도 참조할 수 있게 노출
  window.APP_DATA = APP_DATA;

  /* =====================================================================
     ❷ 화면(스크린) 전환
     ===================================================================== */
  const screens = {};
  document.querySelectorAll(".screen").forEach((el) => {
    screens[el.dataset.screen] = el;
  });

  let currentScreen = "hero";

  /** 떠다니는 이모지를 띄우지 않을 '차분한' 화면
   *  편지 본문(letter)만 몰입을 위해 파티클을 숨긴다.
   *  봉투/편지 준비 화면(unlock)에서는 파티클이 살포시 내려와 분위기를 더한다. */
  function isQuietScreen(name) {
    return name === "letter";
  }

  let leaveTimer = null;

  /** 지정한 화면으로 전환 + 화면별 진입 동작 실행
   *  나가는 화면을 잠깐 겹쳐 페이드아웃시켜 '뚝' 끊기지 않고 부드럽게 넘어간다. */
  function goTo(name) {
    if (!screens[name] || name === currentScreen) return;
    const prevEl = screens[currentScreen];
    const nextEl = screens[name];

    // 직전/다음을 제외한 화면의 잔여 상태 정리
    Object.values(screens).forEach((el) => {
      if (el !== prevEl && el !== nextEl) el.classList.remove("is-active", "is-leaving");
    });

    // 나가는 화면: 위에 겹쳐 페이드아웃(크로스페이드) 후 정리
    if (prevEl && prevEl !== nextEl) {
      prevEl.classList.add("is-leaving");
      clearTimeout(leaveTimer);
      const leaving = prevEl;
      leaveTimer = setTimeout(() => leaving.classList.remove("is-active", "is-leaving"), 460);
    }

    nextEl.classList.remove("is-leaving");
    nextEl.classList.add("is-active");
    currentScreen = name;

    // 편지/봉투 화면에서는 떠다니는 이모지(파티클)가 거슬리지 않도록 숨김
    particleLayer.style.display = isQuietScreen(name) ? "none" : "";
    window.scrollTo({ top: 0, behavior: "auto" });
    onEnter(name);
  }

  /** 화면 진입 훅 */
  function onEnter(name) {
    switch (name) {
      case "quiz":
        Quiz.start();
        break;
      case "unlock":
        setupLetterLock(); // 100일 전이면 잠금/카운트다운 표시
        break;
      case "puzzle":
        // 완성 사진을 한 조각씩 순차 공개
        Puzzle.revealAll(refs.fullBoard);
        break;
      case "letter":
        Letter.reveal();
        watchLetterEnd(); // 끝까지 읽으면 '다음' 버튼이 은은히 빛나도록
        break;
      case "timeline":
        animateTimeline();
        break;
      case "ending":
        startStars(refs.endingStars, { dark: true });
        // 100일(D+100) 당일이면 화려한 축하 연출, 그 외에는 평소 하트 폭죽
        if (getDday() === 100) {
          celebrateHundred();
        } else {
          burstHearts(28);
        }
        break;
    }
  }

  /* =====================================================================
     ❸ DOM 참조 모으기
     ===================================================================== */
  const refs = {
    // 퀴즈
    stage: document.getElementById("quiz-stage"),
    count: document.getElementById("quiz-count"),
    pieces: document.getElementById("quiz-pieces"),
    progressBar: document.getElementById("quiz-progress-bar"),
    // 퍼즐
    miniBoard: document.getElementById("puzzle-board-mini"),
    fullBoard: document.getElementById("puzzle-board-full"),
    // 편지/모달
    paper: document.getElementById("letter-paper"),
    modal: document.getElementById("memory-modal"),
    modalClose: document.getElementById("memory-modal-close"),
    modalTitle: document.getElementById("memory-modal-title"),
    modalGallery: document.getElementById("memory-modal-gallery"),
    modalDesc: document.getElementById("memory-modal-desc"),
    // 편지 → 다음(타임라인) 버튼
    toTimelineBtn: document.getElementById("to-timeline-btn"),
    // 타임라인 / 엔딩
    timelineList: document.getElementById("timeline-list"),
    ddayValue: document.getElementById("dday-value"),
    ddayDate: document.getElementById("dday-date"),
    endingMessage: document.getElementById("ending-message"),
    // 캔버스
    heroStars: document.getElementById("hero-stars"),
    unlockStars: document.getElementById("unlock-stars"),
    endingStars: document.getElementById("ending-stars"),
    // 봉투
    envelope: document.getElementById("envelope"),
    unlockHint: document.getElementById("unlock-hint"),
    unlockSub: document.getElementById("unlock-sub"),
    // 시작 화면 잠금 요소
    startBtn: document.getElementById("start-btn"),
    heroSub: document.getElementById("hero-sub"),
    heroHint: document.getElementById("hero-hint"),
    heroCountdown: document.getElementById("hero-countdown"),
    heroAdmin: document.getElementById("hero-admin"),
  };

  /* =====================================================================
     ❹ 모듈 초기화
     ===================================================================== */
  Puzzle.init({
    miniBoard: refs.miniBoard,
    fullBoard: refs.fullBoard,
    finalSrc: APP_DATA.finalImage,
  });

  Quiz.init({
    data: APP_DATA.quiz,
    puzzle: Puzzle,
    refs: {
      stage: refs.stage,
      count: refs.count,
      pieces: refs.pieces,
      progressBar: refs.progressBar,
    },
    onComplete: () => goTo("puzzle"),
    passScore: APP_DATA.quizPassScore, // 통과 점수(미만이면 다시 풀기)
  });

  Letter.init({
    config: {
      greeting: APP_DATA.letter.greeting,
      blocks: APP_DATA.letter.blocks,
      sign: APP_DATA.letter.sign,
      memories: APP_DATA.memories,
      imageBase: APP_DATA.imageBase,
    },
    refs: {
      paper: refs.paper,
      modal: refs.modal,
      modalClose: refs.modalClose,
      modalTitle: refs.modalTitle,
      modalGallery: refs.modalGallery,
      modalDesc: refs.modalDesc,
    },
  });

  refs.endingMessage.textContent = APP_DATA.endingMessage;

  /* =====================================================================
     ❹-b 이미지 프리로드
     ---------------------------------------------------------------------
     추억 모달 사진(12장)과 퍼즐 완성 사진을 미리 받아둔다.
     → 모달을 열거나 퍼즐이 완성되는 '결정적 순간'에 사진이 깜빡이거나
       "준비 중" 대체 박스가 잠깐 보이는 일을 막는다 (특히 모바일 데이터).
     첫 화면 렌더를 방해하지 않도록 브라우저가 한가할 때 조용히 시작한다.
     실패해도 무시 — 실제 표시 시점에 기존 대체 박스 로직이 처리한다.
     ===================================================================== */
  // 퍼즐 완성 사진(final.jpg)은 퀴즈를 다 풀면 곧바로 '한 장'으로 합쳐지며
  // 공개되는 핵심 이미지라, 들어오는 순간 끊김 없이 보이도록 가장 먼저·우선해
  // 받아두고 디코드까지 끝내 둔다. (다른 모달 사진들은 한가할 때 조용히)
  function preloadImage(src, eager) {
    const img = new Image();
    img.decoding = "async";
    if (eager && "fetchPriority" in img) img.fetchPriority = "high";
    img.src = src;
    // 디코드를 미리 끝내두면 표시 시점의 깜빡임/지연을 줄일 수 있다 (실패 무시)
    if (eager && img.decode) img.decode().catch(() => {});
    return img;
  }

  // 완성 사진은 즉시(우선) 프리로드 — 퀴즈 푸는 동안 캐시에 준비됨
  preloadImage(APP_DATA.finalImage, true);

  function preloadMemoryImages() {
    const base = APP_DATA.imageBase;
    const urls = [];
    Object.values(APP_DATA.memories).forEach((mem) => {
      (mem.photos || []).forEach((file) => urls.push(base + file));
    });
    Array.from(new Set(urls)).forEach((src) => preloadImage(src, false));
  }
  if ("requestIdleCallback" in window) {
    requestIdleCallback(preloadMemoryImages, { timeout: 3000 });
  } else {
    setTimeout(preloadMemoryImages, 1200);
  }

  /* =====================================================================
     ❺ 버튼/봉투 이벤트
     ===================================================================== */
  document.getElementById("start-btn").addEventListener("click", () => goTo("quiz"));
  document.getElementById("to-unlock-btn").addEventListener("click", () => goTo("unlock"));
  document.getElementById("to-timeline-btn").addEventListener("click", () => goTo("timeline"));
  document.getElementById("to-ending-btn").addEventListener("click", () => goTo("ending"));
  document.getElementById("replay-btn").addEventListener("click", () => location.reload());

  // 봉투: 클릭하면 열림 → 잠시 뒤 편지 화면으로
  let envelopeOpened = false;
  refs.envelope.addEventListener("click", () => {
    if (envelopeOpened) return;
    // 100일 전이면 아직 열 수 없음 → 살짝 흔들고 카운트다운 안내
    if (isLetterLocked()) {
      refs.envelope.classList.remove("shake-no");
      void refs.envelope.offsetWidth; // 애니메이션 재시작용 reflow
      refs.envelope.classList.add("shake-no");
      refs.unlockHint.textContent = `아직이야! 100일에 만나요 💌  (D-day까지 ${remainingText()})`;
      return;
    }
    envelopeOpened = true;
    refs.envelope.classList.add("is-open");
    refs.unlockHint.textContent = "편지가 도착했어요 💌";
    setTimeout(() => goTo("letter"), 1500);
  });

  /* =====================================================================
     ❻ 떠다니는 파티클 (하트/별)
     ===================================================================== */
  // 위에서 살포시 내려오는 장식 파티클 — 이모지 대신 톤이 통일된 SVG(골드 별/반짝임 + 은은한 하트)
  const HEART_PARTICLE_D =
    "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z";
  const PARTICLE_SVGS = [
    // 4갈래 반짝임(골드)
    '<svg viewBox="0 0 24 24"><path fill="#dcb85f" d="M12 1.5C13 8 16 11 22.5 12 16 13 13 16 12 22.5 11 16 8 13 1.5 12 8 11 11 8 12 1.5Z"/></svg>',
    // 5각 별(밝은 골드)
    '<svg viewBox="0 0 24 24"><path fill="#e6c878" d="M12 2l2.6 6.3 6.8.5-5.2 4.4 1.7 6.6L12 16.9 6.1 19.8l1.7-6.6L2.6 8.8l6.8-.5z"/></svg>',
    // 하트(블러시)
    '<svg viewBox="0 0 24 24"><path fill="#e3b7a6" d="' + HEART_PARTICLE_D + '"/></svg>',
    // 하트(소프트 골드)
    '<svg viewBox="0 0 24 24"><path fill="#e8cf97" d="' + HEART_PARTICLE_D + '"/></svg>',
  ];
  const particleLayer = document.getElementById("particles");

  /** 파티클 1개 생성 — 화면 위에서 아래로 살며시 내려온다.
   *  @param {object} [opts] { svgs, minSize, sizeRange } */
  function spawnParticle(opts) {
    opts = opts && typeof opts === "object" ? opts : {};
    if (document.hidden) return;
    if (isQuietScreen(currentScreen)) return; // 편지/봉투 화면에서는 생성 안 함
    const set = opts.svgs || PARTICLE_SVGS;
    const el = document.createElement("span");
    el.className = "particle";
    el.innerHTML = set[Math.floor(Math.random() * set.length)];

    const size = (opts.minSize || 12) + Math.random() * (opts.sizeRange || 14);
    const duration = 8 + Math.random() * 7;
    const drift = (Math.random() - 0.5) * 160;

    el.style.left = Math.random() * 100 + "vw";
    el.style.width = size + "px";
    el.style.height = size + "px";
    el.style.animationDuration = duration + "s";
    el.style.setProperty("--p-drift", drift + "px");
    el.style.setProperty("--p-opacity", (0.4 + Math.random() * 0.5).toFixed(2));

    particleLayer.appendChild(el);
    setTimeout(() => el.remove(), duration * 1000 + 200);
  }

  // 일정 간격으로 은은하게 생성
  setInterval(spawnParticle, 900);
  for (let i = 0; i < 6; i++) setTimeout(spawnParticle, i * 400); // 초기 몇 개 미리

  /** 엔딩에서 하트를 한꺼번에 터뜨림 */
  function burstHearts(n) {
    for (let i = 0; i < n; i++) {
      setTimeout(spawnParticle, i * 70);
    }
  }

  /* ---- 100일(D+100) 당일 전용 화려한 축하 연출 ---- */
  const prefersReduce = () =>
    !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  /** 엔딩 카운터 숫자를 0 → target 으로 카운트업 (모션 최소화면 즉시 표시) */
  function countUpDday(target, done) {
    if (prefersReduce()) {
      refs.ddayValue.textContent = `D+${target}`;
      if (done) done();
      return;
    }
    const dur = 10000; // 약 10초에 걸쳐 1 → 100
    const t0 = performance.now();
    (function frame(now) {
      const t = Math.min((now - t0) / dur, 1);
      // easeInOutCubic — 천천히 시작해 부드럽게 끝까지 차오른다
      const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      refs.ddayValue.textContent = `D+${Math.round(1 + eased * (target - 1))}`;
      if (t < 1) requestAnimationFrame(frame);
      else if (done) done();
    })(t0);
  }

  /** 풍성한 축하 폭죽 — 더 크고 많은 별/하트가 쏟아져 내린다 */
  function celebrationBurst() {
    const reduce = prefersReduce();
    const rounds = reduce ? 1 : 4;
    const per = reduce ? 14 : 30;
    for (let r = 0; r < rounds; r++) {
      for (let i = 0; i < per; i++) {
        setTimeout(() => spawnParticle({ minSize: 16, sizeRange: 22 }), r * 600 + i * 36);
      }
    }
  }

  /* ---- 밤하늘 불꽃놀이 (D+100 전용) ----
     엔딩 별빛 캔버스 위에 전용 캔버스를 얹어, 폭죽이 솟아올라 터지는 연출을 그린다.
     가산 합성(lighter)이라 불티가 겹칠수록 더 환하게 빛난다.
     모션 최소화(prefers-reduced-motion) 사용자에겐 호출하지 않는다(celebrateHundred에서 분기). */
  // 보라·핑크 위주의 형형색색 — 한 발마다 한 가지 색 계열로 터진다(메인 + 밝은 강조)
  const FW_PALETTES = [
    ["#c79bff", "#efe0ff", "#fff7e0"], // 라일락 퍼플
    ["#b478ff", "#e6d2ff", "#fff7e0"], // 퍼플
    ["#e08bff", "#f3ddff", "#fff7e0"], // 핑크빛 퍼플
    ["#ff7ec4", "#ffd9ee", "#fff7e0"], // 마젠타 핑크
    ["#ff9ed2", "#ffe0f0", "#fff7e0"], // 연핑크
    ["#ff6fae", "#ffd0e6", "#fff7e0"], // 진한 핑크
  ];
  let fireworksRAF = null;

  function launchFireworks(durationMs) {
    const host = screens.ending;
    if (!host) return;
    let canvas = host.querySelector(".ending-fx");
    if (!canvas) {
      canvas = document.createElement("canvas");
      canvas.className = "ending-fx";
      canvas.setAttribute("aria-hidden", "true");
      host.appendChild(canvas); // z-index로 별 캔버스 위·콘텐츠 아래에 놓임
    }
    const ctx = canvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = host.clientWidth || window.innerWidth;
    const h = host.clientHeight || window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const sparks = [];
    const rockets = [];

    // 한 발이 터지며 불티가 퍼진다 — 예쁜 모양(heart/star/peony/willow)으로만
    function explode(x, y, palette, type) {
      const pick = () => (Math.random() < 0.72 ? palette[0] : palette[(Math.random() * palette.length) | 0]);
      const add = (vx, vy, o) => {
        sparks.push(Object.assign(
          { x, y, px: x, py: y, vx, vy, life: 1, decay: 0.011, color: pick(), size: 1.7, grav: 0.045, drag: 0.985, seed: Math.random() * 6.283 },
          o
        ));
      };

      if (type === "heart") {
        // 하트 — 외곽선 + 안쪽을 채워 도톰하게 빛나는 하트 ❤️ (층마다 속도가 달라 채워진 채 퍼진다)
        const base = (2.7 + Math.random() * 0.5) / 16;
        [[1, 42], [0.66, 26], [0.34, 14]].forEach(([f, n]) => {
          for (let i = 0; i < n; i++) {
            const t = (Math.PI * 2 * i) / n + Math.random() * 0.05;
            const hx = 16 * Math.pow(Math.sin(t), 3);
            const hy = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
            add(hx * base * f, -hy * base * f, { decay: 0.0085, grav: 0.024, size: 1.7 });
          }
        });
      } else if (type === "star") {
        // 5각 별 — 외곽선 + 안쪽을 채워 또렷하게 빛나는 별 ⭐
        const spikes = 5;
        const mkVerts = (outer, inner) => {
          const v = [];
          for (let k = 0; k < spikes * 2; k++) {
            const ang = (Math.PI * k) / spikes - Math.PI / 2;
            const rad = k % 2 === 0 ? outer : inner;
            v.push([Math.cos(ang) * rad, Math.sin(ang) * rad]);
          }
          return v;
        };
        [[3, 1.25, 6], [1.95, 0.82, 4]].forEach(([o, inr, perEdge]) => {
          const verts = mkVerts(o, inr);
          for (let k = 0; k < verts.length; k++) {
            const a = verts[k], b = verts[(k + 1) % verts.length];
            for (let j = 0; j < perEdge; j++) {
              const t = j / perEdge;
              add(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, { decay: 0.0085, grav: 0.022, size: 1.7 });
            }
          }
        });
      } else if (type === "palm") {
        // 야자수(분수)형 — 굵은 불티 몇 가닥이 위로 솟았다 우아하게 늘어진다
        const n = 12, sp = 2.6 + Math.random() * 0.5;
        for (let i = 0; i < n; i++) {
          const a = -Math.PI / 2 + (i / (n - 1) - 0.5) * Math.PI * 1.15; // 위쪽 부채꼴
          const s = sp * (0.8 + Math.random() * 0.35);
          add(Math.cos(a) * s, Math.sin(a) * s, { decay: 0.0065, grav: 0.075, drag: 0.992, size: 2.5 });
        }
      } else if (type === "willow") {
        // 길게 늘어져 흘러내리는 수양버들형
        const n = 36, sp = 1.7 + Math.random() * 0.7;
        for (let i = 0; i < n; i++) {
          const a = (Math.PI * 2 * i) / n + Math.random() * 0.12;
          const s = sp * (0.6 + Math.random() * 0.6);
          add(Math.cos(a) * s, Math.sin(a) * s, { decay: 0.006, grav: 0.075, drag: 0.99, size: 2 });
        }
      } else {
        // peony — 둥근 폭발
        const count = 48 + ((Math.random() * 18) | 0), power = 2.2 + Math.random() * 1.6;
        for (let i = 0; i < count; i++) {
          const a = (Math.PI * 2 * i) / count + Math.random() * 0.25;
          const s = power * (0.45 + Math.random() * 0.85);
          add(Math.cos(a) * s, Math.sin(a) * s, { decay: 0.010 + Math.random() * 0.012, size: 1.5 + Math.random() * 1.5 });
        }
      }

      // 터지는 순간의 환한 코어 섬광 (공통)
      for (let i = 0; i < 12; i++) {
        add((Math.random() - 0.5) * 1.6, (Math.random() - 0.5) * 1.6, { decay: 0.05, color: "#fff7e0", size: 2.4, grav: 0.02 });
      }
    }

    // 화면 아래에서 폭죽 한 발을 쏘아 올린다 — 정점이 목표 높이가 되도록 초기 속도를 계산
    // 세계 불꽃축제처럼 둥근 폭발(peony) 위주 + 야자수·수양버들, 하트·별은 가끔 특별하게
    const TYPES = ["peony", "palm", "willow", "peony", "peony", "palm", "peony", "willow", "peony", "heart", "peony", "star"];
    function launchRocket() {
      const x = w * (0.12 + Math.random() * 0.76);
      const startY = h + 8;
      // 0.08h(상단, '100일 축하해' 위) ~ 0.58h(중하단) 어디서나 터지도록 높이를 폭넓게
      const targetY = h * (0.08 + Math.random() * 0.5);
      const g = 0.12;
      const v0 = Math.sqrt(2 * g * (startY - targetY)); // 정점(vy=0)이 targetY가 되는 속도
      const palette = FW_PALETTES[(Math.random() * FW_PALETTES.length) | 0];
      rockets.push({
        x, y: startY, px: x, py: startY,
        vy: -v0, g, targetY,
        palette, color: palette[0],
        type: TYPES[(Math.random() * TYPES.length) | 0],
      });
    }

    function step() {
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";
      ctx.lineCap = "round";

      // 로켓 상승 (정점에 닿으면 터진다 → 목표 높이에서 정확히 폭발)
      for (let i = rockets.length - 1; i >= 0; i--) {
        const r = rockets[i];
        r.px = r.x; r.py = r.y;
        r.y += r.vy;
        r.vy += r.g;
        ctx.globalAlpha = 0.9;
        ctx.strokeStyle = r.color;
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.moveTo(r.px, r.py);
        ctx.lineTo(r.x, r.y);
        ctx.stroke();
        if (r.vy >= 0 || r.y <= r.targetY) {
          explode(r.x, r.y, r.palette, r.type);
          rockets.splice(i, 1);
        }
      }

      // 불티 확산 (불티마다 중력·공기저항이 달라 모양이 유지·변형된다)
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.px = s.x; s.py = s.y;
        s.vy += s.grav;
        s.vx *= s.drag; s.vy *= s.drag;
        s.x += s.vx; s.y += s.vy;
        s.life -= s.decay;
        if (s.life <= 0) { sparks.splice(i, 1); continue; }
        // 끝으로 갈수록 깜빡이며(반짝임) 잦아든다
        const flick = 0.8 + 0.2 * Math.sin((1 - s.life) * 32 + s.seed);
        const a = Math.max(s.life, 0) * flick;
        // 부드러운 후광 — 겹칠수록 환하게 번진다 (lighter 합성)
        ctx.globalAlpha = a * 0.26;
        ctx.fillStyle = s.color;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size * 2.6, 0, Math.PI * 2);
        ctx.fill();
        // 빛나는 심 + 짧은 꼬리 (둥근 끝)
        ctx.globalAlpha = a;
        ctx.strokeStyle = s.color;
        ctx.lineWidth = s.size * 1.15;
        ctx.beginPath();
        ctx.moveTo(s.px, s.py);
        ctx.lineTo(s.x, s.y);
        ctx.stroke();
      }

      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";

      if (currentScreen !== "ending") { stop(); return; }
      if (performance.now() < endAt || sparks.length || rockets.length) {
        fireworksRAF = requestAnimationFrame(step);
      } else {
        stop();
      }
    }

    function stop() {
      if (fireworksRAF) cancelAnimationFrame(fireworksRAF);
      fireworksRAF = null;
      ctx.clearRect(0, 0, w, h);
    }

    if (fireworksRAF) cancelAnimationFrame(fireworksRAF); // 진행 중이면 정리

    const endAt = performance.now() + (durationMs || 7000);
    // 발사 스케줄 — 오프닝 일제 발사로 단번에 띄우고, 이후 촘촘하게 연속으로
    launchRocket();
    setTimeout(launchRocket, 280);
    const launcher = setInterval(() => {
      if (performance.now() >= endAt || currentScreen !== "ending") {
        clearInterval(launcher);
        return;
      }
      launchRocket();
      if (Math.random() < 0.4) setTimeout(launchRocket, 170); // 가끔만 두 발 — 여유 있는 리듬
    }, 680);

    fireworksRAF = requestAnimationFrame(step);
  }

  /** 카운트업이 100에 닿는 순간, 카운터 한가운데서 빛이 퍼지는 섬광 */
  function flashBurst() {
    const counter = screens.ending.querySelector(".ending-counter");
    if (!counter) return;
    const flash = document.createElement("span");
    flash.className = "ending-flash";
    counter.appendChild(flash);
    setTimeout(() => flash.remove(), 900);
  }

  /** D+100 그날의 화려한 엔딩 — 불꽃놀이 + 카운트업 → 팡! 섬광 → 별·하트 폭죽 */
  function celebrateHundred() {
    const counter = screens.ending.querySelector(".ending-counter");
    const reduce = prefersReduce();
    screens.ending.classList.add("is-celebrate");

    // 축하 배지 (중복 삽입 방지)
    if (counter && !counter.querySelector(".ending-badge")) {
      const badge = document.createElement("span");
      badge.className = "ending-badge";
      badge.textContent = "🎉 100일 축하해 🎉";
      counter.insertBefore(badge, counter.firstChild);
    }

    if (!reduce) launchFireworks(10000); // 카운트 10초 동안 밤하늘 불꽃놀이

    countUpDday(100, () => {
      refs.ddayValue.classList.remove("pop");
      void refs.ddayValue.offsetWidth; // 애니메이션 재시작용 reflow
      refs.ddayValue.classList.add("pop", "lit"); // 팡! + 이후 숫자 뒤 광채 유지
      if (!reduce) flashBurst();        // 한가운데 섬광
      celebrationBurst();               // 별·하트가 쏟아져 내림
    });
  }

  /* =====================================================================
     ❻-b 편지 끝까지 읽으면 '다음' 버튼 강조
     ---------------------------------------------------------------------
     편지가 길어서 마지막까지 스크롤했을 때 '다가올 날들 보기' 버튼이
     화면에 들어오면 은은하게 빛나도록(is-ready) 해, 다음 흐름으로 자연스럽게 이어준다.
     ===================================================================== */
  let letterEndWatched = false;
  function watchLetterEnd() {
    if (letterEndWatched) return; // 1회만 설정
    letterEndWatched = true;
    const btn = refs.toTimelineBtn;
    if (!btn) return;
    // IntersectionObserver 미지원 환경에서는 그냥 바로 강조
    if (!("IntersectionObserver" in window)) {
      btn.classList.add("is-ready");
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            btn.classList.add("is-ready");
            io.disconnect();
          }
        });
      },
      { threshold: 0.6 }
    );
    io.observe(btn);
  }

  /* =====================================================================
     ❼ 별빛 캔버스 (반짝이는 별)
     ===================================================================== */
  const starAnimations = new WeakMap();

  /**
   * 캔버스에 반짝이는 별 애니메이션 시작
   * @param {HTMLCanvasElement} canvas
   * @param {object} [opts] { dark: boolean } - 어두운 배경이면 흰 별
   */
  function startStars(canvas, opts = {}) {
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dark = !!opts.dark;
    let stars = [];
    let raf;

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.clientWidth || canvas.offsetWidth || window.innerWidth;
      const h = canvas.clientHeight || canvas.offsetHeight || window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // 면적에 비례한 별 개수 — 위치·크기·밝기·반짝임 속도/위상 모두 랜덤
      const count = Math.round((w * h) / 7000);
      stars = Array.from({ length: count }, () => {
        const bright = Math.random() < 0.12; // 일부는 더 크고 밝게 반짝이는 별
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          r: bright ? 1.4 + Math.random() * 1.3 : Math.random() * 1.2 + 0.3,
          a: Math.random() * Math.PI * 2,       // 반짝임 시작 위상 랜덤
          speed: Math.random() * 0.035 + 0.006, // 반짝임 속도 랜덤
          amp: 0.4 + Math.random() * 0.6,       // 반짝임 깊이 랜덤
          base: 0.12 + Math.random() * 0.33,    // 기본 밝기 랜덤
          bright,
        };
      });
      canvas._size = { w, h };
    }

    function draw() {
      const { w, h } = canvas._size;
      ctx.clearRect(0, 0, w, h);
      stars.forEach((s) => {
        s.a += s.speed;
        const tw = Math.abs(Math.sin(s.a)); // 0~1 반짝임
        const alpha = Math.min(s.base + tw * s.amp, 1);
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = dark
          ? `rgba(255, 245, 210, ${alpha})`
          : `rgba(201, 162, 75, ${alpha * 0.55})`;
        ctx.shadowBlur = dark ? (s.bright ? 10 : 6) : 3;
        ctx.shadowColor = dark ? "rgba(255,240,200,0.85)" : "rgba(201,162,75,0.5)";
        ctx.fill();
        // 밝은 별이 반짝임 정점에 닿으면 십자 광채 — 진짜 별이 반짝이는 느낌
        if (dark && s.bright && tw > 0.78) {
          const g = s.r * (1.8 + tw * 1.8);
          ctx.strokeStyle = `rgba(255, 248, 224, ${(tw - 0.78) * 3 * 0.6})`;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(s.x - g, s.y); ctx.lineTo(s.x + g, s.y);
          ctx.moveTo(s.x, s.y - g); ctx.lineTo(s.x, s.y + g);
          ctx.stroke();
        }
        ctx.shadowBlur = 0;
      });
      raf = requestAnimationFrame(draw);
    }

    // 기존 애니메이션 중복 방지
    const prev = starAnimations.get(canvas);
    if (prev) {
      cancelAnimationFrame(prev.raf);
      window.removeEventListener("resize", prev.resize);
    }

    resize();
    draw();
    window.addEventListener("resize", resize);
    starAnimations.set(canvas, { raf, resize });
  }

  // 시작 화면 별빛은 바로 시작 (봉투/엔딩은 진입 시 시작)
  startStars(refs.heroStars, { dark: false });
  // 봉투 화면도 미리 준비 (보이기 전이라 가벼움)
  startStars(refs.unlockStars, { dark: false });

  /* =====================================================================
     ❽ 미래 타임라인
     ===================================================================== */
  // 타임라인 마일스톤 아이콘 — 모두 '하트' 계열이되 조금씩 다르게.
  // 색은 상태(미도달/도달/목표)에 따라 CSS에서 currentColor로 바뀐다.
  // 100→200→300→500→1000으로 갈수록 풍성해짐: 하트 → 라인하트 → 하트+반짝임 → 두 하트 → 하트+사방 반짝임.
  function tlIcon(inner) {
    return (
      '<svg class="tl-ico" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
      inner +
      "</svg>"
    );
  }
  // 채운 하트 패스 (변주의 기본형)
  const HEART_D =
    "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z";
  /** 하트 1개를 (tx,ty) 위치에 s배율로 */
  function heartPath(tx, ty, s) {
    return (
      '<path fill="currentColor" transform="translate(' + tx + " " + ty + ") scale(" + s + ')" d="' +
      HEART_D +
      '"/>'
    );
  }
  /** 4갈래 반짝임(✦)을 (cx,cy) 중심에 s배율로 */
  function sparkPath(cx, cy, s) {
    return (
      '<path fill="currentColor" transform="translate(' + cx + " " + cy + ") scale(" + s + ')" ' +
      'd="M0 -6C.9 -1.7 1.7 -.9 6 0 1.7 .9 .9 1.7 0 6-.9 1.7-1.7 .9-6 0-1.7-.9-.9-1.7 0-6Z"/>'
    );
  }
  const TL_ICONS = {
    // 100일 — 라인(빈) 하트
    100: tlIcon(
      '<path fill="currentColor" d="M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zm-4.4 15.55l-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z"/>'
    ),
    // 200일 — 채운 하트
    200: tlIcon('<path fill="currentColor" d="' + HEART_D + '"/>'),
    // 300일 — 하트(중앙) + 작은 반짝임 액센트
    300: tlIcon(heartPath(2.64, 2.48, 0.78) + sparkPath(18.8, 5.4, 0.4)),
    // 500일 — 두 개의 하트(쌍을 중앙에 배치)
    500: tlIcon(heartPath(2.08, 6.67, 0.56) + heartPath(8.48, 4.67, 0.56)),
    // 1000일 — 하트(중앙) + 양옆 대칭 반짝임
    1000: tlIcon(
      heartPath(4.08, 3.95, 0.66) + sparkPath(19.6, 5.6, 0.42) + sparkPath(4.4, 5.6, 0.36)
    ),
  };
  // 목표(결혼) — 반지는 이모지로(💍), CSS에서 글로우/반짝임으로 돋보이게 처리
  const RING_EMOJI = "💍";

  /** 타임라인 항목을 렌더링 */
  function buildTimeline() {
    const dday = getDday();
    refs.timelineList.innerHTML = "";

    APP_DATA.timeline.forEach((item) => {
      const li = document.createElement("li");
      li.className = "timeline-item";
      // 100일은 이 이벤트의 주인공 마일스톤 → 항상 은은한 골드 강조
      if (item.days === 100) li.classList.add("is-headline");

      let statusText;
      if (item.goal) {
        li.classList.add("is-goal");
        statusText = "언젠가 꼭 💍";
      } else if (dday >= item.days) {
        li.classList.add("is-done");
        statusText = "함께 도착 ✔";
      } else {
        const remain = item.days - dday;
        statusText = `D-${remain} 남았어요 ⏳`;
      }

      const iconSvg = item.goal ? RING_EMOJI : TL_ICONS[item.days] || TL_ICONS[100];
      li.innerHTML =
        `<span class="timeline-icon">${iconSvg}</span>` +
        `<span class="timeline-text">` +
        `<span class="timeline-label">${item.label}</span>` +
        `<span class="timeline-status">${statusText}</span>` +
        `</span>`;

      refs.timelineList.appendChild(li);
    });
  }

  /** 타임라인 항목을 순차적으로 등장시킴 */
  function animateTimeline() {
    const items = refs.timelineList.querySelectorAll(".timeline-item");
    items.forEach((el, i) => {
      el.classList.remove("in-view");
      setTimeout(() => el.classList.add("in-view"), 220 * i + 150);
    });
  }

  /* =====================================================================
     ❾ 실시간 연애 카운터 (D-day)
     ===================================================================== */
  /** 시작일로부터 오늘까지의 일수를 D+값으로 반환 (시작일 = D+1) */
  function getDday() {
    const start = new Date(APP_DATA.startDate + "T00:00:00");
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diff = Math.floor((today - start) / 86400000) + 1;
    return Math.max(diff, 1);
  }

  /** 날짜를 yyyy.MM.dd 형태로 */
  function fmt(d) {
    const z = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}.${z(d.getMonth() + 1)}.${z(d.getDate())}`;
  }

  /** 엔딩 카운터 텍스트 갱신 */
  function updateCounter() {
    const dday = getDday();
    refs.ddayValue.textContent = `D+${dday}`;
    const start = new Date(APP_DATA.startDate + "T00:00:00");
    refs.ddayDate.textContent = `${fmt(start)} 부터 · 오늘 ${fmt(new Date())}`;
  }

  /* =====================================================================
     ❿ 편지 잠금 (100일 전에는 열리지 않음)
     ===================================================================== */
  let lockTimer = null;

  /* ----- 관리자 잠금 해제 (코드 7671) -----
     해제는 '이번 방문(페이지 세션)' 동안에만 유효하다. 저장하지 않으므로
     껐다가 다시 들어오면(새로고침/재방문) 자동으로 다시 잠긴다. */
  const ADMIN_CODE = "7671";
  let adminUnlocked = false; // 이번 방문에서만 유지되는 해제 플래그

  // 예전 버전이 영구 저장해 둔 해제 키가 남아 있으면 제거 (다시 잠기도록)
  try { localStorage.removeItem("admin_unlock_v1"); } catch (e) {}

  /** 이번 방문에서 관리자로 해제된 상태인지
   *  · 주소 뒤 ?admin=7671 이 있으면 이번 로드에 한해 해제 (저장하지 않음) */
  function isAdminUnlocked() {
    if (adminUnlocked) return true;
    try {
      if (new URLSearchParams(location.search).get("admin") === ADMIN_CODE) {
        adminUnlocked = true;
        return true;
      }
    } catch (e) {}
    return false;
  }

  /** 관리자 코드가 맞으면 이번 방문 동안만 잠금 해제하고 화면을 즉시 갱신
   *  (저장하지 않으므로 나갔다 다시 들어오면 잠김) */
  function applyAdminUnlock() {
    adminUnlocked = true;
    setupStartLock(); // 시작 화면 갱신(시작 버튼 노출)
    setupLetterLock(); // 봉투 화면 갱신
  }

  /** 관리자 코드 입력창을 띄우고, 맞으면 잠금 해제 */
  function promptAdminCode() {
    const code = window.prompt("관리자 코드를 입력하세요");
    if (code == null) return; // 취소
    if (code.trim() === ADMIN_CODE) {
      applyAdminUnlock();
      window.alert("🔓 관리자 모드 — 날짜 잠금이 해제되었어요.");
    } else {
      window.alert("코드가 올바르지 않아요.");
    }
  }

  /** 관리자 입장 방법 연결
   *  1) 잠금 화면의 '🔒 관리자 입장' 버튼
   *  2) 숨은 트리거: 히어로 문구(❤️ 우리의 100일 ❤️) 5번 빠르게 탭 */
  function setupAdminEntry() {
    // 1) 보이는 버튼
    if (refs.heroAdmin) {
      refs.heroAdmin.addEventListener("click", promptAdminCode);
    }
    // 2) 숨은 트리거 (백업)
    const zone = document.querySelector(".hero-eyebrow");
    if (zone) {
      let taps = 0;
      let timer = null;
      zone.addEventListener("click", () => {
        taps += 1;
        clearTimeout(timer);
        timer = setTimeout(() => { taps = 0; }, 1500); // 1.5초 안에 5번
        if (taps >= 5) { taps = 0; promptAdminCode(); }
      });
    }
  }

  /** 편지 열림 기준 시각(해당 날짜 0시) */
  function getUnlockTime() {
    return new Date(APP_DATA.letterUnlock.date + "T00:00:00");
  }

  /** 지금이 편지 열림 시각 이전인지 (= 잠겨있는지) */
  function isLetterLocked() {
    const cfg = APP_DATA.letterUnlock;
    if (!cfg || !cfg.enabled) return false;
    if (isAdminUnlocked()) return false; // 관리자 코드로 해제됨
    return new Date() < getUnlockTime();
  }

  /** 열림까지 남은 시간을 "N일 N시간 N분 N초"로 */
  function remainingText() {
    let diff = getUnlockTime() - new Date();
    if (diff <= 0) return "곧 열려요";
    const d = Math.floor(diff / 86400000); diff %= 86400000;
    const h = Math.floor(diff / 3600000); diff %= 3600000;
    const m = Math.floor(diff / 60000); diff %= 60000;
    const s = Math.floor(diff / 1000);
    return `${d}일 ${h}시간 ${m}분 ${s}초`;
  }

  let startLockTimer = null;

  /** 시작 화면 잠금 — 100일 전에는 시작 버튼 대신 카운트다운 표시 */
  function setupStartLock() {
    if (startLockTimer) { clearInterval(startLockTimer); startLockTimer = null; }

    // 잠금 해제 상태(100일 당일 이후) → 정상 시작 화면
    if (!isLetterLocked()) {
      refs.startBtn.style.display = "";
      refs.heroCountdown.style.display = "none";
      refs.heroSub.textContent = "함께 만든 추억을 하나씩 열어볼까요?";
      refs.heroHint.style.display = "";
      if (refs.heroAdmin) refs.heroAdmin.style.display = "none";
      return;
    }

    // 잠금 상태 → 시작 버튼 숨기고 카운트다운 + 관리자 입장 버튼 표시
    refs.startBtn.style.display = "none";
    refs.heroHint.style.display = "none";
    refs.heroSub.textContent = "💌 100일이 되는 날 공개됩니다";
    refs.heroCountdown.style.display = "";
    if (refs.heroAdmin) refs.heroAdmin.style.display = "";
    const tick = () => {
      if (!isLetterLocked()) { setupStartLock(); return; } // 시간이 되면 자동 해제
      refs.heroCountdown.textContent = `열리기까지  ${remainingText()}`;
    };
    tick();
    startLockTimer = setInterval(tick, 1000);
  }

  /** 봉투 화면 진입 시 잠금 상태에 맞춰 안내/카운트다운 구성 */
  function setupLetterLock() {
    if (lockTimer) { clearInterval(lockTimer); lockTimer = null; }

    // 잠금 해제 상태(100일 당일 이후) → 기본 안내
    if (!isLetterLocked()) {
      refs.envelope.classList.remove("is-locked");
      refs.unlockSub.textContent = "봉투를 눌러서 열어보세요";
      refs.unlockHint.textContent = "봉투를 톡 — 눌러주세요";
      return;
    }

    // 잠금 상태 → 카운트다운 표시 (1초마다 갱신, 시간이 되면 자동 해제)
    refs.envelope.classList.add("is-locked");
    refs.unlockSub.textContent = "💌 100일이 되는 날, 편지가 열려요";
    const tick = () => {
      if (!isLetterLocked()) { setupLetterLock(); return; }
      refs.unlockHint.textContent = `열리기까지  ${remainingText()}`;
    };
    tick();
    lockTimer = setInterval(tick, 1000);
  }

  /* =====================================================================
     ⓫ 초기 실행
     ===================================================================== */
  buildTimeline();
  updateCounter();
  setupAdminEntry(); // 관리자 코드(7671) 입장: 버튼 + 숨은 트리거
  setupStartLock(); // 시작 화면 잠금/카운트다운 구성 (100일 전이면 시작 버튼 숨김)
  // 자정을 넘겨도 카운터가 갱신되도록 1분마다 점검
  setInterval(() => {
    updateCounter();
    buildTimeline();
  }, 60000);
})();
