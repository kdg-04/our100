/* =====================================================================
   puzzle.js — 3x3 추억 퍼즐
   - 미니 보드(퀴즈 진행 중)와 풀 보드(완성 공개)를 함께 관리
   - 문제를 풀 때마다 revealPiece(index)로 한 조각씩 뒤집어 공개
   - 각 조각의 뒷면은 final.jpg의 해당 위치(3x3 슬라이스)를 보여준다
   전역 객체 window.Puzzle 로 노출
   ===================================================================== */
(function () {
  "use strict";

  // 3x3 → 9개 조각의 background-position (background-size: 300% 기준)
  // 열 위치: 0% / 50% / 100%, 행 위치: 0% / 50% / 100%
  const POSITIONS = ["0%", "50%", "100%"];

  // 퍼즐 조각 아이콘(골드 톤 SVG). 기존 초록 🧩 이모지가 크림/골드 팔레트에서
  // 튀던 것을 사이트 톤에 맞는 골드 조각으로 교체. fill은 currentColor로 상속.
  const PIECE_SVG =
    '<svg class="pf-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
    '<path fill="currentColor" d="M20.5 11H19V7c0-1.1-.9-2-2-2h-4V3.5C13 2.12 11.88 1 10.5 1S8 2.12 8 3.5V5H4c-1.1 0-1.99.9-1.99 2v3.8H3.5c1.49 0 2.7 1.21 2.7 2.7s-1.21 2.7-2.7 2.7H2V20c0 1.1.9 2 2 2h3.8v-1.5c0-1.49 1.21-2.7 2.7-2.7s2.7 1.21 2.7 2.7V22H17c1.1 0 2-.9 2-2v-4h1.5c1.38 0 2.5-1.12 2.5-2.5S21.88 11 20.5 11z"/>' +
    "</svg>";

  const Puzzle = {
    finalSrc: "",
    revealed: 0,     // 지금까지 공개된 조각 수
    miniPieces: [],  // 미니 보드 조각 DOM
    fullPieces: [],  // 풀 보드 조각 DOM

    /**
     * 퍼즐 초기화
     * @param {object} opts
     * @param {HTMLElement} opts.miniBoard - 퀴즈 화면의 미니 보드
     * @param {HTMLElement} opts.fullBoard - 완성 화면의 풀 보드
     * @param {string} opts.finalSrc - 완성 사진 경로
     */
    init({ miniBoard, fullBoard, finalSrc }) {
      this.finalSrc = finalSrc;
      // CSS 변수 안의 url()은 스타일시트(/css/) 기준으로 해석되어 경로가 틀어진다.
      // 문서 기준 절대 URL로 변환해 두면 어느 폴더 구조에서도 정확히 로드된다.
      this.finalUrl = new URL(finalSrc, document.baseURI).href;
      this.revealed = 0;
      this.miniPieces = this._buildBoard(miniBoard, true);
      this.fullPieces = this._buildBoard(fullBoard, false);
      // 완성 사진의 실제 비율을 읽어 보드 비율을 맞춤 → 사진이 눌리지 않음
      this._applyAspectRatio([miniBoard, fullBoard]);
      // 완성 시 조각 사이 미세한 이음새까지 없애기 위한 '한 장 사진' 오버레이
      this.fullBoardEl = fullBoard;
      this._addFinalOverlay(fullBoard);
    },

    /** 풀 보드 위에 완성 사진 한 장을 덮는 오버레이(처음엔 투명) 추가 */
    _addFinalOverlay(board) {
      const overlay = document.createElement("img");
      overlay.className = "puzzle-final-overlay";
      overlay.src = this.finalUrl;
      overlay.alt = "완성된 추억 사진";
      board.appendChild(overlay);
    },

    /** 사진의 가로:세로 비율을 두 보드에 적용 (어떤 사진이든 왜곡 없이 채워짐) */
    _applyAspectRatio(boards) {
      const img = new Image();
      img.onload = () => {
        if (!img.naturalWidth || !img.naturalHeight) return;
        const ratio = `${img.naturalWidth} / ${img.naturalHeight}`;
        boards.forEach((b) => {
          if (b) b.style.aspectRatio = ratio;
        });
      };
      img.src = this.finalSrc;
    },

    /** 보드 하나를 9조각으로 구성하고 조각 DOM 배열을 반환 */
    _buildBoard(board, isMini) {
      board.innerHTML = "";
      const pieces = [];
      for (let i = 0; i < 9; i++) {
        const row = Math.floor(i / 3);
        const col = i % 3;

        const piece = document.createElement("div");
        piece.className = "puzzle-piece";

        const inner = document.createElement("div");
        inner.className = "puzzle-piece-inner";

        // 앞면 (미획득 상태)
        const front = document.createElement("div");
        front.className = "puzzle-face puzzle-face--front";
        front.innerHTML = isMini
          ? PIECE_SVG
          : `${PIECE_SVG}<span class="pf-num">${i + 1}</span>`;

        // 뒷면 (사진 슬라이스)
        const back = document.createElement("div");
        back.className = "puzzle-face puzzle-face--back";
        back.style.setProperty("--final-img", `url("${this.finalUrl}")`);
        back.style.setProperty("--bg-pos", `${POSITIONS[col]} ${POSITIONS[row]}`);

        inner.appendChild(front);
        inner.appendChild(back);
        piece.appendChild(inner);
        board.appendChild(piece);
        pieces.push(piece);
      }
      return pieces;
    },

    /**
     * 추억 조각을 하나 공개한다.
     * 미니 보드와 풀 보드의 같은 위치 조각이 동시에 뒤집히며,
     * final.jpg의 해당 9분할 슬라이스가 그 칸에 채워진다.
     * → 문제를 풀수록 사진이 점점 완성되어 가는 연출
     * @param {number} [index] - 생략 시 현재 revealed 위치의 조각
     */
    revealPiece(index) {
      const i = typeof index === "number" ? index : this.revealed;
      if (i < 0 || i > 8) return;

      [this.miniPieces, this.fullPieces].forEach((set) => {
        const piece = set[i];
        if (!piece || piece.classList.contains("is-revealed")) return;
        piece.classList.add("is-revealed", "just-won");
        // 강조(글로우/스케일) 애니메이션 클래스는 잠시 후 제거
        setTimeout(() => piece.classList.remove("just-won"), 1100);
      });

      this.revealed = Math.max(this.revealed, i + 1);
      return this.revealed;
    },

    /**
     * 모든 조각을 다시 미공개 상태로 되돌린다 (퀴즈 재도전 시).
     * 미니/풀 보드 조각과 완성 보드의 합쳐짐/사진 상태까지 초기화.
     */
    reset() {
      this.revealed = 0;
      [this.miniPieces, this.fullPieces].forEach((set) => {
        set.forEach((p) => p.classList.remove("is-revealed", "just-won"));
      });
      if (this.fullBoardEl) {
        this.fullBoardEl.classList.remove("is-assembled", "is-complete", "show-photo");
      }
    },

    /**
     * 완성 화면 진입 시 호출.
     * 혹시 아직 안 뒤집힌 조각이 있으면 마저 뒤집은 뒤,
     * 조각 사이의 틈을 없애 9조각을 '한 장의 사진'으로 합치는 마무리 연출.
     */
    revealAll(board) {
      return new Promise((resolve) => {
        let delay = 0;
        for (let i = 0; i < 9; i++) {
          const piece = this.fullPieces[i];
          if (piece && !piece.classList.contains("is-revealed")) {
            setTimeout(() => piece.classList.add("is-revealed", "just-won"), delay);
            delay += 160;
          }
        }
        this.revealed = 9;
        setTimeout(() => {
          if (board) {
            // 조각들이 빈틈없이 맞물리며 한 장의 사진으로 합쳐짐
            board.classList.add("is-assembled");
            board.classList.add("is-complete");
            setTimeout(() => board.classList.remove("is-complete"), 1700);
            // 합쳐진 직후, 미세 이음새를 가리는 완성 사진을 부드럽게 페이드인
            setTimeout(() => board.classList.add("show-photo"), 450);
          }
          resolve();
        }, delay + 300);
      });
    },
  };

  window.Puzzle = Puzzle;
})();
