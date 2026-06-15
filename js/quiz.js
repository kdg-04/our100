/* =====================================================================
   quiz.js — 추억 퀴즈 (총 9문제)
   - 객관식 4지선다 / 진행률 / 문제 번호 / 정답·오답 애니메이션
   - 틀려도 다음 문제로 진행
   - 문제를 풀 때마다 퍼즐 조각 1개 획득
   - 9문제 완료 시 onComplete 콜백 호출
   전역 객체 window.Quiz 로 노출. 문제 데이터는 main.js에서 주입.
   ===================================================================== */
(function () {
  "use strict";

  const Quiz = {
    data: [],
    puzzle: null,
    onComplete: null,
    refs: {},
    current: 0,    // 현재 문제 인덱스
    answered: 0,   // 지금까지 푼 문제 수(진행바 기준)
    pieces: 0,     // 획득한 조각 수(= 맞힌 문제 수)
    score: 0,      // 맞힌 문제 수(정답 점수)
    passScore: 0,  // 통과에 필요한 최소 정답 수(미만이면 다시 풀기)
    locked: false, // 보기 클릭 잠금(중복 클릭 방지)

    /**
     * @param {object} opts
     * @param {Array}  opts.data - 문제 배열
     * @param {object} opts.puzzle - window.Puzzle
     * @param {object} opts.refs - 필요한 DOM 참조
     * @param {Function} opts.onComplete - 모든 문제 완료 시 호출
     */
    init({ data, puzzle, refs, onComplete, passScore }) {
      this.data = data;
      this.puzzle = puzzle;
      this.refs = refs;
      this.onComplete = onComplete;
      // 통과 기준(정답 수). 0 이하면 게이트 없음(항상 통과)
      this.passScore = passScore || 0;
    },

    /** 퀴즈를 처음부터 시작 (재도전 시에도 호출됨) */
    start() {
      this.current = 0;
      this.answered = 0;
      this.pieces = 0;
      this.score = 0;
      // 재도전이면 이전에 공개됐던 퍼즐 조각을 모두 되돌린다
      if (this.puzzle && typeof this.puzzle.reset === "function") {
        this.puzzle.reset();
      }
      this._updateMeta();
      this.render();
    },

    /** 현재 문제를 화면에 렌더링 */
    render() {
      const q = this.data[this.current];
      this.locked = false;

      const card = document.createElement("div");
      card.className = "quiz-card";

      // 질문
      const question = document.createElement("h2");
      question.className = "quiz-question";
      question.textContent = q.question;
      card.appendChild(question);

      // 보기 목록
      const opts = document.createElement("div");
      opts.className = "quiz-options";
      const marks = ["①", "②", "③", "④"];

      q.options.forEach((text, idx) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "quiz-option";
        // innerHTML 대신 DOM 노드로 구성 (보기 텍스트를 안전하게 그대로 표시)
        const no = document.createElement("span");
        no.className = "opt-no";
        no.textContent = marks[idx];
        const label = document.createElement("span");
        label.textContent = text;
        btn.append(no, label);
        btn.addEventListener("click", () => this._answer(idx, q, opts, card));
        opts.appendChild(btn);
      });
      card.appendChild(opts);

      // 카드 교체
      this.refs.stage.innerHTML = "";
      this.refs.stage.appendChild(card);
      this._updateMeta();
    },

    /** 보기 클릭 처리 */
    _answer(idx, q, optsEl, card) {
      if (this.locked) return;
      this.locked = true;

      // 정답 여부 판정 ('all'이면 모든 보기 정답 처리)
      const isCorrect = q.correct === "all" || idx === q.correct;
      if (isCorrect) this.score += 1; // 정답 점수 누적

      // 모든 보기 비활성화 + 선택/정답 표시
      const buttons = Array.from(optsEl.children);
      buttons.forEach((btn, i) => {
        btn.disabled = true;
        if (q.correct !== "all" && i === q.correct) {
          btn.classList.add("is-correct"); // 실제 정답 강조
        }
      });
      if (q.correct === "all") {
        buttons[idx].classList.add("is-correct");
      } else if (!isCorrect) {
        buttons[idx].classList.add("is-wrong"); // 내가 고른 오답 강조
      }

      // 메시지 결정: 보기별 커스텀 > 정답/오답 기본
      const message = this._resolveMessage(idx, q, isCorrect);

      // 푼 문제 수(진행바용) 갱신
      this.answered = this.current + 1;
      // 퍼즐 조각은 '정답'일 때만 획득 (틀리면 조각 없음)
      if (isCorrect) {
        this.puzzle.revealPiece(this.current);
      }
      this.pieces = this.score; // 획득한 조각 수 = 맞힌 문제 수
      this._updateMeta();

      // 피드백 박스 (정답/오답 멘트만 깔끔하게)
      const fb = document.createElement("div");
      fb.className = `quiz-feedback ${isCorrect ? "correct" : "wrong"}`;
      fb.textContent = message;
      card.appendChild(fb);
      requestAnimationFrame(() => fb.classList.add("show"));

      // 정답일 때만 '추억 조각 획득' 토스트 표시 (틀리면 조각이 없으므로 생략)
      if (isCorrect) this._showPieceToast(this.pieces);

      // 다음 버튼
      const nextWrap = document.createElement("div");
      nextWrap.className = "quiz-next";
      const isLast = this.current === this.data.length - 1;
      const nextBtn = document.createElement("button");
      nextBtn.type = "button";
      nextBtn.className = "btn btn-primary";
      nextBtn.textContent = isLast ? "추억 완성하기 ✨" : "다음 →";
      nextBtn.addEventListener("click", () => this._next());
      nextWrap.appendChild(nextBtn);
      card.appendChild(nextWrap);
    },

    /** 추억 조각 획득 토스트를 하단 중앙에 잠깐 띄운다 (자동 사라짐) */
    _showPieceToast(count) {
      const toast = document.createElement("div");
      toast.className = "piece-toast";
      toast.textContent = `🧩 추억 조각 획득!  ${count} / ${this.data.length}`;
      document.body.appendChild(toast);
      // 애니메이션(2.4s) 종료 후 DOM에서 제거
      setTimeout(() => toast.remove(), 2400);
    },

    /** 보기에 맞는 멘트를 만든다 */
    _resolveMessage(idx, q, isCorrect) {
      // 1) 보기별 전용 멘트가 있으면 우선
      if (q.optionMsgs && q.optionMsgs[idx]) {
        return q.optionMsgs[idx];
      }
      // 2) 정답
      if (isCorrect) return q.correctMsg;
      // 3) 오답 — {선택} 자리표시자에 고른 보기 텍스트를 끼워넣음
      const wrong = q.wrongMsg || "아쉽지만 다음 문제로 갈게요 ❤️";
      return wrong.replace("{선택}", q.options[idx]);
    },

    /** 다음 문제 또는 완료 */
    _next() {
      if (this.current < this.data.length - 1) {
        this.current += 1;
        this.render();
      } else {
        this._finish();
      }
    },

    /** 마지막 문제 후 — 통과 점수 판정 */
    _finish() {
      // 통과 기준 미달이면 결과 안내 후 다시 풀기
      if (this.passScore > 0 && this.score < this.passScore) {
        this._renderRetry();
      } else if (typeof this.onComplete === "function") {
        this.onComplete();
      }
    },

    /** 통과 점수 미달 시 — 점수 안내 + '다시 풀기' 카드 */
    _renderRetry() {
      const total = this.data.length;

      const card = document.createElement("div");
      card.className = "quiz-card quiz-retry";

      const title = document.createElement("h2");
      title.className = "quiz-question";
      title.textContent = "앗, 조금 아쉬워요!";
      card.appendChild(title);

      const score = document.createElement("p");
      score.className = "quiz-retry-score";
      // 점수 강조용 span만 별도 노드로 (안전하게 textContent)
      const strong = document.createElement("strong");
      strong.textContent = `${this.score}개`;
      score.append(`${total}문제 중 `, strong, " 정답");
      card.appendChild(score);

      const msg = document.createElement("p");
      msg.className = "quiz-retry-msg";
      msg.textContent = `${this.passScore}개 이상 맞혀야 추억이 완성돼요. 다시 한 번 도전해볼까요? ❤️`;
      card.appendChild(msg);

      const wrap = document.createElement("div");
      wrap.className = "quiz-next";
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "btn btn-primary";
      btn.textContent = "처음부터 다시 풀기 ↺";
      btn.addEventListener("click", () => this.start());
      wrap.appendChild(btn);
      card.appendChild(wrap);

      this.refs.stage.innerHTML = "";
      this.refs.stage.appendChild(card);
      requestAnimationFrame(() => card.classList.add("show"));
    },

    /** 진행률/문제번호/조각수 갱신 */
    _updateMeta() {
      const total = this.data.length;
      const num = this.current + 1;
      this.refs.count.textContent = `Q${num} / ${total}`;
      this.refs.pieces.textContent = `🧩 ${this.pieces} / ${total}`;
      const pct = (this.answered / total) * 100; // 진행바는 푼 문제 기준
      this.refs.progressBar.style.width = `${pct}%`;
    },
  };

  window.Quiz = Quiz;
})();
