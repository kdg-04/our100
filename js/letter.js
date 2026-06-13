/* =====================================================================
   letter.js — 인터랙티브 러브레터 + 추억 모달
   - 인사말 타이핑 효과
   - 본문 단락 Scroll Reveal (IntersectionObserver)
   - 편지 중간에 "추억 보기" 버튼 → 사진/설명 모달
   전역 객체 window.Letter 로 노출. 내용 데이터는 main.js에서 주입.
   ===================================================================== */
(function () {
  "use strict";

  const Letter = {
    config: null,
    refs: {},
    built: false,

    /**
     * @param {object} opts
     * @param {object} opts.config - { greeting, blocks, sign, memories, imageBase }
     * @param {object} opts.refs - DOM 참조 (paper, modal 관련)
     */
    init({ config, refs }) {
      this.config = config;
      this.refs = refs;
      this._bindModal();
    },

    /** 편지 화면이 처음 열릴 때 1회 빌드 + 타이핑 시작 */
    reveal() {
      if (this.built) return;
      this.built = true;
      this._build();
      this._typeGreeting();
      this._observeReveal();
    },

    /** 편지 DOM 구성 (데이터 기반) */
    _build() {
      const { greeting, blocks, sign } = this.config;
      const paper = this.refs.paper;
      paper.innerHTML = "";

      // 인사말 (타이핑 대상)
      const greet = document.createElement("h2");
      greet.className = "letter-greeting";
      greet.id = "letter-greeting";
      paper.appendChild(greet);

      // 본문 컨테이너
      const body = document.createElement("div");
      body.className = "letter-body";

      blocks.forEach((block) => {
        if (block.type === "memory") {
          // 추억 보기 버튼
          const btn = document.createElement("button");
          btn.type = "button";
          btn.className = "memory-btn scroll-reveal";
          const mem = this.config.memories[block.id];
          btn.innerHTML = `📷 추억 보기 — ${mem ? mem.title : ""}`;
          btn.addEventListener("click", () => this.openMemory(block.id));
          body.appendChild(btn);
        } else {
          // 일반 단락
          const p = document.createElement("p");
          p.className = "scroll-reveal";
          p.textContent = block.text;
          body.appendChild(p);
        }
      });

      paper.appendChild(body);

      // 서명
      const signEl = document.createElement("p");
      signEl.className = "letter-sign scroll-reveal";
      signEl.textContent = sign;
      paper.appendChild(signEl);

      this._greetEl = greet;
    },

    /** 인사말을 한 글자씩 타이핑 */
    _typeGreeting() {
      const text = this.config.greeting;
      const el = this._greetEl;
      el.innerHTML = "";
      const cursor = document.createElement("span");
      cursor.className = "type-cursor";
      el.appendChild(cursor);

      let i = 0;
      const tick = () => {
        if (i < text.length) {
          cursor.insertAdjacentText("beforebegin", text[i]);
          i += 1;
          setTimeout(tick, 90);
        } else {
          // 타이핑 종료 후 커서 잠시 깜빡이다 제거
          setTimeout(() => cursor.remove(), 1200);
        }
      };
      setTimeout(tick, 400);
    },

    /** 스크롤 시 단락이 차례로 나타나도록 관찰 */
    _observeReveal() {
      const items = this.refs.paper.querySelectorAll(".scroll-reveal");
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("in-view");
              io.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
      );
      items.forEach((el) => io.observe(el));
    },

    /* ---------------- 추억 모달 ---------------- */

    _bindModal() {
      const { modal, modalClose } = this.refs;
      modalClose.addEventListener("click", () => this.closeMemory());
      modal.addEventListener("click", (e) => {
        if (e.target === modal) this.closeMemory(); // 바깥 영역 클릭 시 닫기
      });
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") this.closeMemory();
      });
    },

    /** 특정 추억 모달 열기 */
    openMemory(id) {
      const mem = this.config.memories[id];
      if (!mem) return;
      const base = this.config.imageBase;

      this.refs.modalTitle.textContent = mem.title;
      this.refs.modalDesc.textContent = mem.desc;

      // 사진 수에 따라 그리드 열 수 조정
      const gallery = this.refs.modalGallery;
      gallery.className = "modal-gallery cols-" + Math.min(mem.photos.length, 3);
      gallery.innerHTML = "";

      mem.photos.forEach((file) => {
        const img = document.createElement("img");
        img.className = "modal-photo";
        img.loading = "lazy";
        img.alt = mem.title;
        img.src = base + file;
        // 이미지 로딩 실패 시 부드러운 대체 박스로 전환
        img.addEventListener("error", () => {
          const ph = document.createElement("div");
          ph.className = "modal-photo photo-fallback";
          ph.textContent = "사진을 준비 중이에요 🤍";
          img.replaceWith(ph);
        });
        gallery.appendChild(img);
      });

      this.refs.modal.classList.add("is-open");
      this.refs.modal.setAttribute("aria-hidden", "false");
    },

    closeMemory() {
      this.refs.modal.classList.remove("is-open");
      this.refs.modal.setAttribute("aria-hidden", "true");
    },
  };

  window.Letter = Letter;
})();
