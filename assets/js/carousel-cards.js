/* Kokonut Carousel Cards / Momentum Rail 的静态移植：甩动、弹簧吸附、cover-flow */
(function (global) {
  const STIFFNESS = 340;
  const DAMPING = 26;
  const DRAG_THRESHOLD = 4;
  const FLICK = 0.38;
  const PULL = 0.18;
  const MAX_IN_VEL = 1600;
  const RAIL_CSS = `
@keyframes kokonutui-rail-tilt {
  0% { transform: perspective(1200px) translateZ(-72px) rotateY(-8deg); }
  50% { transform: perspective(1200px) translateZ(0) rotateY(0deg); }
  100% { transform: perspective(1200px) translateZ(-72px) rotateY(8deg); }
}
@keyframes kokonutui-rail-parallax {
  from { transform: translate3d(calc(var(--rail-depth, 8%) * -1), 0, 0); }
  to { transform: translate3d(var(--rail-depth, 8%), 0, 0); }
}
@keyframes kokonutui-rail-details {
  0%, 32% { opacity: 0; transform: translate3d(0, 6px, 0); }
  45%, 55% { opacity: 1; transform: translate3d(0, 0, 0); }
  68%, 100% { opacity: 0; transform: translate3d(0, 6px, 0); }
}
@supports (animation-timeline: view()) {
  .kokonutui-rail-card { view-timeline: --kokonutui-rail inline; }
  .kokonutui-rail-details {
    animation: kokonutui-rail-details linear both;
    animation-timeline: --kokonutui-rail;
  }
  @media (prefers-reduced-motion: no-preference) {
    .kokonutui-rail-tilt {
      animation: kokonutui-rail-tilt linear both;
      animation-timeline: --kokonutui-rail;
    }
    .kokonutui-rail-layer {
      animation: kokonutui-rail-parallax linear both;
      animation-timeline: --kokonutui-rail;
    }
  }
}
`;

  function rubber(overshoot, size) {
    return Math.sign(overshoot) * (1 - 1 / ((Math.abs(overshoot) * 0.55) / size + 1)) * size;
  }
  function clamp(v, min, max) { return Math.min(max, Math.max(min, v)); }
  function maxScroll(scroller) { return Math.max(0, scroller.scrollWidth - scroller.clientWidth); }
  function snapPoints(scroller, track) {
    const n = track.children.length;
    if (!n) return [];
    const card = track.children[0].offsetWidth;
    const gap = parseFloat(getComputedStyle(track).gap) || 0;
    const step = card + gap;
    const max = Math.max(0, (n - 1) * step);
    return Array.from({ length: n }, (_, i) => clamp(i * step, 0, max));
  }
  function nearestIndex(points, pos) {
    let best = 0;
    for (let i = 1; i < points.length; i++) {
      if (Math.abs(points[i] - pos) < Math.abs(points[best] - pos)) best = i;
    }
    return best;
  }
  function releaseVelocity(samples, now) {
    const first = samples[0];
    const last = samples[samples.length - 1] || first;
    if (!first || !last) return 0;
    const dt = last.t - first.t;
    if (dt <= 0 || now - last.t > 60) return 0;
    return -(last.x - first.x) / dt;
  }
  function ensureCss() {
    if (document.getElementById("krail-css")) return;
    const style = document.createElement("style");
    style.id = "krail-css";
    style.textContent = RAIL_CSS;
    document.head.appendChild(style);
  }

  global.AOCI = global.AOCI || {};
  global.AOCI.mountCarouselCards = function mountCarouselCards(root, options) {
    ensureCss();
    let items = options.items || [];
    const onSelect = options.onSelect;
    root.classList.add("krail");
    root.innerHTML = `
      <div class="krail-scroller" data-krail-scroller tabindex="0" aria-label="为你推荐轮播">
        <ul class="krail-track" data-krail-track></ul>
      </div>
    `;
    const scroller = root.querySelector("[data-krail-scroller]");
    const track = root.querySelector("[data-krail-track]");
    const prevBtn = options.prevEl || null;
    const nextBtn = options.nextEl || null;
    const countEl = options.countEl || null;

    const startIndex = Number.isFinite(options.startIndex) ? options.startIndex : 2;
    const s = {
      mode: "idle", pointerId: -1, startX: 0, startPos: 0, pos: 0, vel: 0,
      target: 0, samples: [], raf: 0, last: 0, suppressClick: false, caught: false, booted: false
    };

    function apply(pos) {
      const inRange = clamp(pos, 0, maxScroll(scroller));
      scroller.scrollLeft = inRange;
      const over = pos - inRange;
      track.style.transform = Math.abs(over) > 0.1
        ? `translate3d(${(-rubber(over, scroller.clientWidth)).toFixed(2)}px,0,0)`
        : "";
    }
    function setFree(free) { scroller.dataset.free = String(free); }
    function reduce() {
      return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }
    function step(now) {
      const dt = Math.min((now - s.last) / 1000, 1 / 30);
      s.last = now;
      const h = dt / 4;
      for (let i = 0; i < 4; i++) {
        const accel = -STIFFNESS * (s.pos - s.target) - DAMPING * s.vel;
        s.vel += accel * h;
        s.pos += s.vel * h;
      }
      if (Math.abs(s.pos - s.target) < 0.5 && Math.abs(s.vel) < 8) {
        s.pos = s.target;
        s.vel = 0;
        s.mode = "idle";
        apply(s.target);
        setFree(false);
        s.raf = 0;
        syncArrows();
        return;
      }
      apply(s.pos);
      s.raf = requestAnimationFrame(step);
    }
    function stride(points) {
      if (points.length < 2) return 280;
      const step = Math.abs(points[1] - points[0]);
      return step > 1 ? step : 280;
    }
    function detentIndex(points, startPos, pos, vel) {
      const startI = nearestIndex(points, startPos);
      const pull = stride(points) * PULL;
      const delta = pos - startPos;
      let next = startI;
      if (vel > FLICK || delta > pull) next = startI + 1;
      else if (vel < -FLICK || delta < -pull) next = startI - 1;
      return clamp(next, 0, points.length - 1);
    }
    function springTo(target, velocity) {
      cancelAnimationFrame(s.raf);
      if (s.mode === "idle") s.pos = scroller.scrollLeft;
      s.target = target;
      s.vel = clamp(velocity, -MAX_IN_VEL, MAX_IN_VEL);
      if (reduce()) {
        s.mode = "idle";
        s.pos = target;
        apply(target);
        setFree(false);
        syncArrows();
        return;
      }
      s.mode = "spring";
      setFree(true);
      s.last = performance.now();
      s.raf = requestAnimationFrame(step);
    }
    function currentIndex() {
      const pos = s.mode === "spring" ? s.target : scroller.scrollLeft;
      return nearestIndex(snapPoints(scroller, track), pos);
    }
    function jumpTo(index) {
      const points = snapPoints(scroller, track);
      if (!points.length) return;
      const i = clamp(index, 0, points.length - 1);
      cancelAnimationFrame(s.raf);
      s.raf = 0;
      s.mode = "idle";
      s.vel = 0;
      s.pos = s.target = points[i];
      apply(s.pos);
      setFree(false);
      syncArrows();
    }
    function goTo(index) {
      const points = snapPoints(scroller, track);
      if (!points.length) return;
      const i = clamp(index, 0, points.length - 1);
      const from = s.mode === "idle" ? scroller.scrollLeft : s.pos;
      const kick = points[i] >= from ? 620 : -620;
      springTo(points[i], s.mode === "spring" ? s.vel : kick);
    }
    function pad(n) {
      return String(n).padStart(2, "0");
    }
    function syncArrows() {
      const i = currentIndex();
      const last = Math.max(0, items.length - 1);
      if (prevBtn) {
        prevBtn.setAttribute("aria-disabled", i <= 0 ? "true" : "false");
      }
      if (nextBtn) {
        nextBtn.setAttribute("aria-disabled", i >= last ? "true" : "false");
      }
      if (countEl) {
        countEl.textContent = `${pad(items.length ? i + 1 : 0)} / ${pad(items.length)}`;
      }
      if (options.onIndex) options.onIndex(i, items.length);
    }

    function render() {
      track.innerHTML = items.map((item) => `
        <li class="krail-item">
          <article class="krail-card kokonutui-rail-card ${item.selected ? "is-selected" : ""}" data-skill-id="${item.id}">
            <div class="krail-tilt kokonutui-rail-tilt">
              <div class="krail-art">
                <img class="kokonutui-rail-layer" src="${item.image}" alt="" draggable="false" style="--rail-depth:8%">
                ${item.badge ? `<span class="krail-badge">${item.badge}</span>` : ""}
              </div>
              <div class="krail-meta">
                <button type="button" class="krail-title" data-rail-link data-skill-id="${item.id}" aria-pressed="${item.selected ? "true" : "false"}">${item.title}</button>
                <p class="krail-sub">${item.subtitle || ""}</p>
                <div class="krail-details kokonutui-rail-details">
                  <span class="krail-desc">${item.description || ""}</span>
                  <span class="krail-path">${item.path || ""}</span>
                </div>
              </div>
            </div>
          </article>
        </li>
      `).join("");
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (s.booted) goTo(currentIndex());
          else jumpTo(clamp(startIndex, 0, Math.max(0, items.length - 1)));
          s.booted = true;
        });
      });
    }

    function onPointerDown(e) {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      if (e.target.closest("button") && !e.target.closest("[data-rail-link]")) return;
      cancelAnimationFrame(s.raf);
      s.caught = s.mode === "spring";
      s.pos = s.caught ? s.pos : scroller.scrollLeft;
      s.mode = "pressing";
      s.pointerId = e.pointerId;
      s.startX = e.clientX;
      s.startPos = s.pos;
      s.samples = [{ t: e.timeStamp, x: e.clientX }];
    }
    function onPointerMove(e) {
      if (e.pointerId !== s.pointerId) return;
      const dx = e.clientX - s.startX;
      if (s.mode === "pressing" && Math.abs(dx) > DRAG_THRESHOLD) {
        s.mode = "dragging";
        scroller.setPointerCapture(e.pointerId);
        scroller.dataset.dragging = "true";
        setFree(true);
      }
      if (s.mode !== "dragging") return;
      s.pos = s.startPos - dx;
      apply(s.pos);
      s.samples.push({ t: e.timeStamp, x: e.clientX });
      while (s.samples.length > 2 && e.timeStamp - s.samples[0].t > 100) s.samples.shift();
    }
    function onRelease(e) {
      if (e.pointerId !== s.pointerId) return;
      s.pointerId = -1;
      if (s.mode !== "dragging") {
        if (s.caught) {
          s.suppressClick = true;
          const points = snapPoints(scroller, track);
          springTo(points[nearestIndex(points, s.pos)], 0);
          return;
        }
        s.mode = "idle";
        setFree(false);
        return;
      }
      scroller.dataset.dragging = "false";
      s.suppressClick = true;
      const v = releaseVelocity(s.samples, e.timeStamp);
      const points = snapPoints(scroller, track);
      const i = detentIndex(points, s.startPos, s.pos, v);
      springTo(points[i], v * 900);
    }
    function onClickCapture(e) {
      if (!s.suppressClick) return;
      e.preventDefault();
      e.stopPropagation();
      s.suppressClick = false;
    }
    function onNativeInput() {
      if (s.mode !== "spring") return;
      cancelAnimationFrame(s.raf);
      s.mode = "idle";
      apply(clamp(s.pos, 0, maxScroll(scroller)));
      setFree(false);
    }
    function onKeyDown(e) {
      if (e.target !== scroller) return;
      const last = track.children.length - 1;
      const index = currentIndex();
      let next = -1;
      if (e.key === "ArrowLeft") next = index - 1;
      else if (e.key === "ArrowRight") next = index + 1;
      else if (e.key === "Home") next = 0;
      else if (e.key === "End") next = last;
      else return;
      e.preventDefault();
      goTo(next);
    }
    function onScroll() {
      syncArrows();
    }

    if (typeof ResizeObserver !== "undefined") {
      const ro = new ResizeObserver(() => {
        if (!s.booted || s.mode === "dragging" || s.mode === "spring") return;
        goTo(currentIndex());
        syncArrows();
      });
      ro.observe(scroller);
    }
    scroller.addEventListener("keydown", onKeyDown);
    scroller.addEventListener("scroll", onScroll, { passive: true });
    scroller.addEventListener("pointerdown", onPointerDown);
    scroller.addEventListener("pointermove", onPointerMove);
    scroller.addEventListener("pointerup", onRelease);
    scroller.addEventListener("pointercancel", onRelease);
    scroller.addEventListener("lostpointercapture", onRelease);
    scroller.addEventListener("click", onClickCapture, true);
    scroller.addEventListener("wheel", onNativeInput, { passive: true });
    scroller.addEventListener("touchstart", onNativeInput, { passive: true });
    track.addEventListener("click", (event) => {
      if (event.target.closest("a")) return;
      const card = event.target.closest("[data-skill-id]");
      if (!card || s.suppressClick) return;
      const item = items.find((it) => it.id === card.getAttribute("data-skill-id"));
      if (item && onSelect) onSelect(item);
    });
    prevBtn?.addEventListener("click", () => {
      if (prevBtn.getAttribute("aria-disabled") === "true") return;
      goTo(currentIndex() - 1);
    });
    nextBtn?.addEventListener("click", () => {
      if (nextBtn.getAttribute("aria-disabled") === "true") return;
      goTo(currentIndex() + 1);
    });

    render();

    return {
      update(nextItems) {
        items = nextItems || [];
        render();
      },
      goTo,
      relayout() {
        requestAnimationFrame(() => {
          goTo(currentIndex());
          syncArrows();
        });
      },
      destroy() {
        cancelAnimationFrame(s.raf);
      }
    };
  };
})(window);
