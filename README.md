# ❤️ 우리의 100일 이벤트

100일 기념 인터랙티브 웹사이트입니다.
시작 화면 → 추억 퀴즈 → 퍼즐 완성 → 편지 해금 → 러브레터 → 미래 타임라인 → 엔딩 순서로 진행됩니다.

순수 **HTML + CSS + Vanilla JavaScript**로만 제작되어, GitHub Pages에 올리면 바로 동작합니다.
(외부 라이브러리는 폰트(Google Fonts)만 사용하며, 오프라인에서는 시스템 폰트로 자동 대체됩니다.)

---

## 1. 프로젝트 구조

```
100Days_Event/
├─ index.html          # 전체 화면 구조
├─ css/
│  └─ style.css        # 모든 스타일/애니메이션 (크림+골드+아이보리)
├─ js/
│  ├─ puzzle.js        # 3x3 추억 퍼즐
│  ├─ quiz.js          # 9문제 퀴즈
│  ├─ letter.js        # 러브레터 타이핑/스크롤/추억 모달
│  └─ main.js          # ★ 데이터 + 전체 흐름 조립 (커스터마이징 핵심)
├─ images/
│  ├─ puzzle/final.jpg # 퍼즐 완성 사진 (직접 넣기)
│  ├─ memories/        # 추억 모달 사진 1~12 (직접 넣기)
│  └─ background/      # (선택) 배경 이미지
└─ assets/             # (선택) 추가 리소스
```

> 스크립트 로드 순서: `puzzle.js → quiz.js → letter.js → main.js`
> 각 모듈은 `window.Puzzle / Quiz / Letter` 로 정의되고, **main.js가 마지막에 데이터를 주입하며 조립**합니다.

---

## 2. 로컬에서 실행하기

브라우저에서 `index.html`을 더블클릭해도 대부분 동작하지만,
이미지/폰트를 안정적으로 보려면 간단한 로컬 서버를 띄우는 것을 권장합니다.

```bash
# Python 3 (Mac/Linux 기본 설치)
cd 100Days_Event
python3 -m http.server 8000
# 브라우저에서 http://localhost:8000 접속
```

또는 VS Code의 **Live Server** 확장으로 `index.html` → "Open with Live Server".

---

## 3. 이미지 교체 방법

1. **퍼즐 완성 사진**: `images/puzzle/final.jpg` 에 정사각형(1:1) 사진을 넣습니다.
2. **추억 사진**: `images/memories/` 폴더에 아래 파일명 그대로 넣습니다.

   | 모달 | 제목 | 파일명 |
   |------|------|--------|
   | 1 | ❤️ 우리의 시작 | `2.jpeg`, `5.JPG` |
   | 2 | 🌸 봄날의 추억 | `4.JPG`, `3.JPG`, `6.jpeg` |
   | 3 | 🫶 우리의 일상 | `1.jpg`, `7.JPG`, `8.JPG` |
   | 4 | 🐱 우리만의 시간 | `9.JPG`, `10.JPG` |
   | 5 | 🌊 앞으로도 함께 | `11.JPG`, `12.JPG` |

   > ⚠️ GitHub Pages(리눅스 서버)는 **대소문자를 구분**합니다.
   > `5.JPG`와 `5.jpg`는 다른 파일로 취급되니, 파일 확장자 대소문자까지 정확히 맞춰주세요.

3. 파일명을 다르게 쓰고 싶다면 `js/main.js`의 `APP_DATA.memories` 안 `photos` 배열만 바꾸면 됩니다.
4. 사진이 없으면 "사진을 준비 중이에요 🤍" 대체 박스가 자동으로 표시되어 깨지지 않습니다.

---

## 4. GitHub Pages 배포 방법

### 방법 A — 웹에서 업로드 (가장 쉬움)
1. GitHub에서 새 저장소(Repository) 생성 (예: `100days`)
2. 이 폴더의 모든 파일을 저장소에 업로드 (드래그&드롭 또는 `Add file → Upload files`)
3. 저장소 **Settings → Pages** 이동
4. **Source**를 `Deploy from a branch`, **Branch**를 `main` / `/(root)` 로 설정 후 Save
5. 1~2분 뒤 표시되는 주소(`https://아이디.github.io/100days/`)로 접속

### 방법 B — Git 명령어
```bash
cd 100Days_Event
git init
git add .
git commit -m "100일 이벤트 사이트"
git branch -M main
git remote add origin https://github.com/<아이디>/<저장소>.git
git push -u origin main
```
이후 **Settings → Pages**에서 위와 동일하게 브랜치를 지정하면 됩니다.

> 별도 빌드 과정이 없으므로(순수 정적 사이트), 올리는 즉시 동작합니다.

---

## 5. 커스터마이징 방법

거의 모든 내용은 **`js/main.js` 상단의 `APP_DATA` 객체** 한 곳에서 바꿀 수 있습니다.

| 바꾸고 싶은 것 | 위치 (`APP_DATA` 안) |
|----------------|----------------------|
| 연애 시작일 (D-day 기준) | `startDate: "2026-03-15"` |
| 퍼즐 사진 경로 | `finalImage` |
| 추억 사진 폴더 | `imageBase` |
| 퀴즈 문제·보기·정답·멘트 | `quiz` 배열 |
| 추억 모달 제목/사진/설명 | `memories` 객체 |
| 러브레터 인사말/본문/서명 | `letter` (`greeting`, `blocks`, `sign`) |
| 미래 타임라인 목표 | `timeline` 배열 |
| 엔딩 문구 | `endingMessage` |

### 퀴즈 한 문제 구조
```js
{
  question: "Q1. 질문 내용",
  options: ["보기1", "보기2", "보기3", "보기4"],
  correct: 2,            // 정답 보기 인덱스(0부터). "all" 이면 모두 정답
  correctMsg: "정답 멘트",
  wrongMsg: "오답 멘트 ({선택} 자리에 고른 보기가 들어감)",
  optionMsgs: { 3: "특정 보기 전용 멘트" } // (선택) 보기별 맞춤 멘트
}
```

### 러브레터 단락 구조
```js
blocks: [
  { type: "text", text: "한 단락. 줄바꿈은 \n 으로." },
  { type: "memory", id: 1 },   // 이 위치에 '추억 보기' 버튼이 들어감 (memories.1 연결)
]
```

### 색상 바꾸기
`css/style.css` 맨 위 `:root` 의 CSS 변수만 수정하면 전체 톤이 한 번에 바뀝니다.
```css
--gold:  #c9a24b;   /* 포인트 골드 */
--cream: #fbf6ec;   /* 배경 크림 */
--blush: #e3b7a6;   /* 하트/포인트 핑크 */
```

---

## 6. 유지보수 방법

- **D-day는 자동 계산**됩니다. `startDate`만 정확히 넣으면 접속 시점 기준으로 `D+숫자`가 표시되고,
  타임라인의 200일·300일 등 도달 여부도 자동으로 갱신됩니다. (자정이 지나도 1분마다 자동 반영)
- **퀴즈 문항 수**는 9개 고정이 아니라, `quiz` 배열 길이에 맞춰 진행률·퍼즐 조각 안내가 자동 조정됩니다.
  단, 퍼즐은 3x3(9조각) 기준이므로 9문제를 권장합니다.
- **문제가 생기면** 브라우저 개발자도구(F12) → Console 탭에서 오류 메시지를 확인하세요.
  대부분은 이미지 파일명/경로 불일치(대소문자 포함)가 원인입니다.
- **접근성**: 사용자가 "동작 줄이기"(prefers-reduced-motion)를 켜두면 애니메이션이 자동으로 최소화됩니다.
- **모바일 우선** 설계이며 PC에서는 퀴즈가 2단 레이아웃으로 자동 전환됩니다.

---

만든 마음 그대로, 오래오래 함께하길 바랍니다. ❤️
