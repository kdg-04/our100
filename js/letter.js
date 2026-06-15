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
          btn.textContent = `📷 추억 보기 — ${mem ? mem.title : ""}`;
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
        // 라이트박스가 열려 있으면 Esc로 그것부터 닫음
        if (this._lightbox && this._lightbox.classList.contains("is-open")) {
          if (e.key === "Escape") this._closeLightbox();
          return;
        }
        // 모달이 닫혀 있으면 아무 것도 하지 않음
        if (!modal.classList.contains("is-open")) return;
        if (e.key === "Escape") {
          this.closeMemory();
        } else if (e.key === "Tab") {
          this._trapTab(e); // 포커스가 모달 밖으로 새지 않도록 가둠
        }
      });
    },

    /** 모달이 열려 있는 동안 Tab 포커스를 모달 안에서만 순환시킨다 */
    _trapTab(e) {
      const focusables = this.refs.modal.querySelectorAll(
        'button, a[href], [tabindex]:not([tabindex="-1"])'
      );
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus(); // 맨 앞에서 Shift+Tab → 맨 뒤로
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus(); // 맨 뒤에서 Tab → 맨 앞으로
      }
    },

    /** 특정 추억 모달 열기 */
    openMemory(id) {
      const mem = this.config.memories[id];
      if (!mem) return;
      const base = this.config.imageBase;

      // 닫을 때 돌아갈 위치(추억 보기 버튼)를 기억해 둔다
      this._lastFocused = document.activeElement;

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
        // 탭하면 전체화면으로 크게 보기
        img.addEventListener("click", () => this._openLightbox(img.src, mem.title));
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
      // 열리면 닫기 버튼으로 포커스를 옮겨 키보드/스크린리더 흐름을 모달 안으로.
      // display:none → flex 전환 직후엔 포커스가 안 잡히므로, 레이아웃을 한 번
      // 강제 반영(offsetWidth)한 뒤 포커스를 준다.
      void this.refs.modal.offsetWidth;
      this.refs.modalClose.focus();
    },

    closeMemory() {
      this.refs.modal.classList.remove("is-open");
      this.refs.modal.setAttribute("aria-hidden", "true");
      // 모달을 열기 전 눌렀던 '추억 보기' 버튼으로 포커스 복귀
      if (this._lastFocused && typeof this._lastFocused.focus === "function") {
        this._lastFocused.focus();
        this._lastFocused = null;
      }
    },

    /* ---------------- 사진 라이트박스(크게 보기) ---------------- */

    /** 사진을 전체화면으로 크게 표시 (한 번 만들고 재사용) */
    _openLightbox(src, alt) {
      let lb = this._lightbox;
      if (!lb) {
        lb = document.createElement("div");
        lb.className = "photo-lightbox";
        lb.setAttribute("role", "dialog");
        lb.setAttribute("aria-modal", "true");
        lb.setAttribute("aria-label", "사진 크게 보기");

        const img = document.createElement("img");
        img.className = "photo-lightbox-img";
        lb.appendChild(img);

        const close = document.createElement("button");
        close.type = "button";
        close.className = "photo-lightbox-close";
        close.setAttribute("aria-label", "닫기");
        close.textContent = "✕";
        lb.appendChild(close);

        // 배경/사진/닫기 어디를 눌러도 닫힘
        lb.addEventListener("click", () => this._closeLightbox());

        document.body.appendChild(lb);
        this._lightbox = lb;
        this._lightboxImg = img;
      }
      this._lightboxImg.src = src;
      this._lightboxImg.alt = alt || "";
      void lb.offsetWidth; // display 전환 직후 트랜지션을 위해 강제 반영
      lb.classList.add("is-open");
    },

    /** 라이트박스 닫기 */
    _closeLightbox() {
      if (this._lightbox) this._lightbox.classList.remove("is-open");
    },
  };

  window.Letter = Letter;
})();
