/* 精选牌组：常驻扇形；左右滑/点两侧连续翻牌；点牌在底部选中对应技能 */
(function (global) {
  const MAX_DRAG_ROTATION = 18;
  const TAP_SLOP = 5;
  const VELOCITY_WINDOW = 90;
  const FLIGHT = { k: 150, c: 15 };
  const RETURN = { k: 240, c: 26 };
  const FAN_HOME = { k: 260, c: 22 };
  const TOP_Z = 1000;

  function fanPose(offset, spread) {
    const abs = Math.abs(offset);
    return {
      x: offset * spread,
      y: abs * 9 + abs * abs * 1.2,
      r: offset * 7.2,
      s: 1 - abs * 0.05
    };
  }
  function poseTransform({ x, y, r, s }) {
    return `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) rotate(${r.toFixed(3)}deg) scale(${s.toFixed(4)})`;
  }
  function makeBody(pose) {
    return { ...pose, vx: 0, vy: 0, vr: 0, vs: 0, phase: "rest", out: pose, dx: 1, dy: 0, z: null, apexZ: null };
  }
  function springAxis(value, velocity, target, spring, dt) {
    const accel = -spring.k * (value - target) - spring.c * velocity;
    const v = velocity + accel * dt;
    return [value + v * dt, v];
  }
  function stepBody(body, target, dt, spring) {
    const use = spring || FAN_HOME;
    const steps = Math.max(1, Math.ceil(dt * 240));
    const h = dt / steps;
    for (let i = 0; i < steps; i++) {
      [body.x, body.vx] = springAxis(body.x, body.vx, target.x, use, h);
      [body.y, body.vy] = springAxis(body.y, body.vy, target.y, use, h);
      [body.r, body.vr] = springAxis(body.r, body.vr, target.r, use, h);
      [body.s, body.vs] = springAxis(body.s, body.vs, target.s, use, h);
    }
  }
  function isSettled(body, target) {
    return Math.abs(body.x - target.x) < 0.12 && Math.abs(body.y - target.y) < 0.12
      && Math.abs(body.r - target.r) < 0.03 && Math.abs(body.s - target.s) < 0.0008
      && Math.abs(body.vx) + Math.abs(body.vy) < 2.5 && Math.abs(body.vr) < 1.2 && Math.abs(body.vs) < 0.012;
  }
  function clearance(w, h, ux, uy) {
    const along = Math.min(ux === 0 ? 1e9 : w / Math.abs(ux), uy === 0 ? 1e9 : h / Math.abs(uy));
    return along + 24;
  }
  function releaseVelocity(samples) {
    const last = samples[samples.length - 1];
    const first = samples.find((sample) => last && last.t - sample.t <= VELOCITY_WINDOW);
    if (!(first && last) || last.t - first.t < 8) return { vx: 0, vy: 0 };
    const dt = last.t - first.t;
    return { vx: (last.x - first.x) / dt, vy: (last.y - first.y) / dt };
  }

  global.AOCI = global.AOCI || {};
  global.AOCI.mountCardStack = function mountCardStack(root, options) {
    let cards = options.cards || [];
    const onPick = options.onPick || options.onAction;
    const onChange = options.onChange;
    const accent = options.accent || "var(--accent)";
    const hintLabel = () => (typeof options.hintLabel === "function" ? options.hintLabel() : (options.hintLabel || "左右滑翻牌"));
    const reduce = () => window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    root.classList.add("is-fan");
    root.classList.remove("is-fan-armed");
    root.style.setProperty("--deck-accent", accent);
    root.innerHTML = `
      <p class="deck-hint" data-deck-hint>
        <span class="deck-hint-arrow is-left" aria-hidden="true"></span>
        <span data-deck-hint-copy>${hintLabel()}</span>
        <span class="deck-hint-arrow is-right" aria-hidden="true"></span>
      </p>
      <section class="deck-stage" data-deck-stage aria-label="精选牌组。左右滑动或点两侧翻牌，点牌在底部查看。">
        <div class="deck-pile" data-deck-pile></div>
      </section>
      <p class="deck-live" data-deck-live aria-live="polite"></p>
    `;

    const pile = root.querySelector("[data-deck-pile]");
    const stage = root.querySelector("[data-deck-stage]");
    const live = root.querySelector("[data-deck-live]");
    const hintEl = root.querySelector("[data-deck-hint]");
    const hintCopy = root.querySelector("[data-deck-hint-copy]");

    let order = cards.map((_, i) => i);
    let bodies = [];
    let nodes = [];
    let drag = null;
    let raf = 0;
    let last = 0;
    let suppressClick = false;
    let interacted = false;
    let idleTimer = 0;

    function spreadPx() {
      const w = root.offsetWidth || 420;
      if (w < 420) return 40;
      if (w < 640) return 54;
      return 68;
    }
    function fanOffset(index) {
      const pos = order.indexOf(index);
      if (pos < 0) return 0;
      const n = order.length || 1;
      if (pos <= Math.floor(n / 2)) return pos;
      return pos - n;
    }
    function updateHint() {
      if (hintCopy) hintCopy.textContent = hintLabel();
    }

    function write(index) {
      const node = nodes[index];
      const body = bodies[index];
      if (!(node && body)) return;
      node.style.transform = poseTransform(body);
      const off = fanOffset(index);
      node.style.zIndex = String(body.z != null ? body.z : 100 - Math.abs(off));
      node.classList.toggle("is-center", off === 0);
      node.dataset.fan = String(off);
      const state = body.phase === "drag" ? "drag" : body.phase === "rest" ? "rest" : "fly";
      if (node.dataset.state !== state) node.dataset.state = state;
    }
    function targetFor(body, index) {
      if (body.phase === "out") return body.out;
      return fanPose(fanOffset(index), spreadPx());
    }
    function springFor(body) {
      if (body.phase === "out") return FLIGHT;
      if (body.phase === "return") return RETURN;
      return FAN_HOME;
    }
    function advance(index, dt) {
      const body = bodies[index];
      if (!body) return false;
      if (body.phase === "drag") { write(index); return true; }
      if (reduce() && body.phase === "out") { body.phase = "rest"; body.z = null; }
      const target = targetFor(body, index);
      if (reduce()) Object.assign(body, target, { vx: 0, vy: 0, vr: 0, vs: 0 });
      else stepBody(body, target, dt, springFor(body));
      if (body.phase === "out" && body.vx * body.dx + body.vy * body.dy <= 0) {
        body.phase = "return";
        body.z = body.apexZ;
      }
      const settled = isSettled(body, target);
      if (settled && body.phase !== "out") { body.phase = "rest"; body.z = null; }
      write(index);
      return !settled;
    }
    function tick(now) {
      const dt = Math.min((now - last) / 1000, 1 / 30);
      last = now;
      let active = false;
      order.forEach((index) => { if (advance(index, dt)) active = true; });
      raf = active ? requestAnimationFrame(tick) : 0;
    }
    function kick() {
      if (raf) return;
      last = performance.now();
      raf = requestAnimationFrame(tick);
    }

    function markInteracted() {
      if (interacted) return;
      interacted = true;
      clearTimeout(idleTimer);
      hintEl?.classList.add("is-gone");
    }
    function updateLive() {
      const top = cards[order[0]];
      if (!top) return;
      live.textContent = top.title;
    }
    function syncTopFocus() {
      nodes.forEach((node, index) => {
        if (!node) return;
        const off = fanOffset(index);
        node.tabIndex = off === 0 ? 0 : -1;
        node.toggleAttribute("inert", off !== 0);
        const card = cards[index];
        node.setAttribute(
          "aria-label",
          `${card.title}，${card.subtitle}。${off === 0 ? "选中并在底部查看" : "旋到中间"}`
        );
      });
    }

    function commitOrder(next) {
      order = next;
      const top = cards[next[0]];
      if (top) onChange && onChange(top);
      updateLive();
      syncTopFocus();
      kick();
    }

    function throwTop(vx, vy, fx, fy) {
      const index = order[0];
      if (index === undefined) return;
      const body = bodies[index];
      const node = nodes[index];
      if (!body) return;
      const speed = Math.hypot(vx, vy);
      const rawX = speed > 0.05 ? vx : fx;
      const rawY = speed > 0.05 ? vy : fy;
      const norm = Math.hypot(rawX, rawY) || 1;
      const ux = rawX / norm;
      const uy = rawY / norm;
      const w = node?.offsetWidth || 256;
      const h = node?.offsetHeight || 320;
      const distance = clearance(w, h, ux, uy) + Math.min(speed * 50, 90);
      const launch = Math.max(speed, 0.9) * 1000;
      body.phase = "out";
      body.dx = ux;
      body.dy = uy;
      body.out = { x: ux * distance, y: uy * distance, r: Math.max(-40, Math.min(40, body.r + ux * 26)), s: 1 };
      body.vx = ux * launch;
      body.vy = uy * launch;
      body.vr += ux * launch * 0.05;
      body.z = TOP_Z;
      body.apexZ = null;
      commitOrder([...order.slice(1), index]);
    }

    function bringBack() {
      const index = order[order.length - 1];
      if (index === undefined || index === order[0]) return;
      const body = bodies[index];
      const node = nodes[index];
      if (!body) return;
      const ux = -0.97, uy = -0.24;
      const w = node?.offsetWidth || 256;
      const h = node?.offsetHeight || 320;
      const distance = clearance(w, h, ux, uy) + 20;
      body.phase = "out";
      body.dx = ux;
      body.dy = uy;
      body.out = { x: ux * distance, y: uy * distance, r: -16, s: 1 };
      body.vx = ux * 1100;
      body.vy = uy * 1100;
      body.z = 0;
      body.apexZ = TOP_Z - 1;
      commitOrder([index, ...order.slice(0, -1)]);
    }

    function cycle(dir) {
      markInteracted();
      if (dir === 1) throwTop(1.3, -0.35, 1, 0);
      else bringBack();
    }

    function bringToFront(index) {
      const pos = order.indexOf(index);
      if (pos <= 0) return;
      markInteracted();
      commitOrder([index, ...order.slice(0, pos), ...order.slice(pos + 1)]);
    }

    function pickCard(index) {
      const card = cards[index];
      if (!card) return;
      markInteracted();
      onPick && onPick(card);
    }

    function renderPile() {
      const spread = spreadPx();
      order = cards.map((_, i) => i);
      pile.innerHTML = cards.map((card, index) => {
        const pose = fanPose(fanOffset(index), spread);
        return `
        <button type="button" class="deck-card" data-deck-index="${index}" data-state="rest"
          aria-label="${card.title}，${card.subtitle}。选中并在底部查看"
          style="transform:${poseTransform(pose)};z-index:${100 - Math.abs(fanOffset(index))}">
          <span class="deck-card-face">
            <span class="deck-card-art"><img src="${card.image}" alt="" draggable="false"></span>
            <span class="deck-card-meta">
              <span class="deck-card-copy">
                <span class="deck-card-title">${card.title}</span>
                <span class="deck-card-sub">${card.subtitle}</span>
              </span>
              ${card.price ? `<span class="deck-card-price">${card.price}</span>` : ""}
            </span>
          </span>
        </button>`;
      }).join("");
      nodes = [...pile.querySelectorAll(".deck-card")];
      bodies = cards.map((_, index) => makeBody(fanPose(fanOffset(index), spread)));
      root.classList.add("is-fan");
      updateHint();
      syncTopFocus();
      updateLive();
      nodes.forEach((node, index) => bindCard(node, index));
      kick();
    }

    function bindCard(node, index) {
      node.addEventListener("pointerdown", (event) => {
        suppressClick = false;
        if (drag) return;
        if (fanOffset(index) !== 0) return;
        if (event.pointerType === "mouse" && event.button !== 0) return;
        const body = bodies[index];
        if (!body) return;
        const rect = node.getBoundingClientRect();
        node.setPointerCapture(event.pointerId);
        drag = {
          pointerId: event.pointerId, index,
          startX: event.clientX, startY: event.clientY,
          baseX: body.x, baseY: body.y, width: node.offsetWidth,
          lever: event.clientY - rect.top < rect.height / 2 ? 1 : -1,
          moved: false,
          samples: [{ t: event.timeStamp, x: event.clientX, y: event.clientY }]
        };
      });
      node.addEventListener("pointermove", (event) => {
        if (!drag || drag.pointerId !== event.pointerId) return;
        const dx = event.clientX - drag.startX;
        const dy = event.clientY - drag.startY;
        if (!drag.moved) {
          if (Math.hypot(dx, dy) < TAP_SLOP) return;
          if (event.pointerType !== "mouse" && Math.abs(dy) > Math.abs(dx) * 1.35) {
            drag = null;
            if (node.hasPointerCapture(event.pointerId)) node.releasePointerCapture(event.pointerId);
            return;
          }
        }
        const body = bodies[drag.index];
        if (!body) return;
        drag.moved = true;
        drag.samples.push({ t: event.timeStamp, x: event.clientX, y: event.clientY });
        if (drag.samples.length > 24) drag.samples.shift();
        body.phase = "drag";
        body.x = drag.baseX + dx;
        body.y = drag.baseY + dy * 0.35;
        body.s = 1;
        body.r = Math.max(-12, Math.min(12, dx / drag.width * 14));
        body.vx = body.vy = body.vr = body.vs = 0;
        kick();
      });
      const up = (event, cancelled) => {
        if (!drag || drag.pointerId !== event.pointerId) return;
        const current = drag;
        drag = null;
        const body = bodies[current.index];
        if (!(body && current.moved)) { kick(); return; }
        if (cancelled) { body.phase = "rest"; kick(); return; }
        suppressClick = true;
        body.phase = "rest";
        markInteracted();
        if (Math.abs(body.x - current.baseX) > current.width * 0.22) {
          if (body.x - current.baseX < 0) cycle(1);
          else cycle(-1);
        } else {
          kick();
        }
      };
      node.addEventListener("pointerup", (event) => up(event, false));
      node.addEventListener("pointercancel", (event) => up(event, true));
      node.addEventListener("lostpointercapture", (event) => up(event, true));
      node.addEventListener("click", () => {
        if (suppressClick) { suppressClick = false; return; }
        const off = fanOffset(index);
        if (off !== 0) bringToFront(index);
        pickCard(index);
      });
      node.addEventListener("keydown", (event) => {
        suppressClick = false;
        if (fanOffset(index) !== 0) return;
        if (event.key === "ArrowRight" || event.key === "ArrowDown") {
          event.preventDefault();
          cycle(1);
        } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
          event.preventDefault();
          cycle(-1);
        } else if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          pickCard(index);
        }
      });
    }

    window.addEventListener("resize", () => kick(), { passive: true });
    renderPile();

    return {
      update(nextCards) {
        cards = nextCards;
        updateHint();
        renderPile();
      },
      destroy() {
        cancelAnimationFrame(raf);
        clearTimeout(idleTimer);
        root.classList.remove("is-fan", "is-fan-armed");
        root.innerHTML = "";
      }
    };
  };
})(window);
