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
    pieces: 0,     // 획득한 조각 수
    locked: false, // 보기 클릭 잠금(중복 클릭 방지)

    /**
     * @param {object} opts
     * @param {Array}  opts.data - 문제 배열
     * @param {object} opts.puzzle - window.Puzzle
     * @param {object} opts.refs - 필요한 DOM 참조
     * @param {Function} opts.onComplete - 모든 문제 완료 시 호출
     */
    init({ data, puzzle, refs, onComplete }) {
      this.data = data;
      this.puzzle = puzzle;
      this.refs = refs;
      this.onComplete = onComplete;
    },

    /** 퀴즈를 처음부터 시작 */
    start() {
      this.current = 0;
      this.pieces = 0;
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
        btn.innerHTML = `<span class="opt-no">${marks[idx]}</span><span>${text}</span>`;
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

      // 퍼즐 조각 획득 (정답/오답 무관, 문제당 1개)
      this.puzzle.revealPiece(this.current);
      this.pieces = this.current + 1;
      this._updateMeta();

      // 피드백 박스 (정답/오답 멘트만 깔끔하게)
      const fb = document.createElement("div");
      fb.className = `quiz-feedback ${isCorrect ? "correct" : "wrong"}`;
      fb.textContent = message;
      card.appendChild(fb);
      requestAnimationFrame(() => fb.classList.add("show"));

      // '추억 조각 획득' 안내는 화면을 가리지 않게 하단 토스트로 잠깐 표시
      this._showPieceToast(this.pieces);

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
      } else if (typeof this.onComplete === "function") {
        this.onComplete();
      }
    },

    /** 진행률/문제번호/조각수 갱신 */
    _updateMeta() {
      const total = this.data.length;
      const num = this.current + 1;
      this.refs.count.textContent = `Q${num} / ${total}`;
      this.refs.pieces.textContent = `🧩 ${this.pieces} / ${total}`;
      const pct = (this.pieces / total) * 100;
      this.refs.progressBar.style.width = `${pct}%`;
    },
  };

  window.Quiz = Quiz;
})();
