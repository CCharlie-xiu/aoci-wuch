/* Kokonut Throw Deck 物理交互的静态移植：拖、甩、键盘循环、点开详情 */
(function (global) {
  const TILTS = [0, -2, 1.5, -1];
  const SLOT_Y = 9;
  const SLOT_SCALE = 0.035;
  const MAX_SLOT = TILTS.length - 1;
  const MAX_DRAG_ROTATION = 18;
  const THROW_VELOCITY = 0.5;
  const THROW_DISTANCE = 0.35;
  const TAP_SLOP = 5;
  const VELOCITY_WINDOW = 90;
  const HOME = { k: 420, c: 30 };
  const FLIGHT = { k: 150, c: 15 };
  const RETURN = { k: 240, c: 26 };
  const TOP_Z = 1000;

  function slotPose(depth) {
    const d = Math.min(depth, MAX_SLOT);
    return { x: 0, y: d * SLOT_Y, r: TILTS[d] || 0, s: 1 - d * SLOT_SCALE };
  }
  function lerpPose(a, b, t) {
    return {
      x: a.x + (b.x - a.x) * t,
      y: a.y + (b.y - a.y) * t,
      r: a.r + (b.r - a.r) * t,
      s: a.s + (b.s - a.s) * t
    };
  }
  function poseTransform({ x, y, r, s }) {
    return `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) rotate(${r.toFixed(3)}deg) scale(${s.toFixed(4)})`;
  }
  function makeBody(depth) {
    const pose = slotPose(depth);
    return { ...pose, vx: 0, vy: 0, vr: 0, vs: 0, phase: "rest", out: pose, dx: 1, dy: 0, z: null, apexZ: null };
  }
  function springAxis(value, velocity, target, spring, dt) {
    const accel = -spring.k * (value - target) - spring.c * velocity;
    const v = velocity + accel * dt;
    return [value + v * dt, v];
  }
  function stepBody(body, target, dt) {
    let spring = HOME;
    if (body.phase === "out") spring = FLIGHT;
    else if (body.phase === "return") spring = RETURN;
    const steps = Math.max(1, Math.ceil(dt * 240));
    const h = dt / steps;
    for (let i = 0; i < steps; i++) {
      [body.x, body.vx] = springAxis(body.x, body.vx, target.x, spring, h);
      [body.y, body.vy] = springAxis(body.y, body.vy, target.y, spring, h);
      [body.r, body.vr] = springAxis(body.r, body.vr, target.r, spring, h);
      [body.s, body.vs] = springAxis(body.s, body.vs, target.s, spring, h);
    }
  }
  function isSettled(body, target) {
    return Math.abs(body.x - target.x) < 0.1 && Math.abs(body.y - target.y) < 0.1
      && Math.abs(body.r - target.r) < 0.02 && Math.abs(body.s - target.s) < 0.0005
      && Math.abs(body.vx) + Math.abs(body.vy) < 2 && Math.abs(body.vr) < 1 && Math.abs(body.vs) < 0.01;
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
    const onAction = options.onAction;
    const onChange = options.onChange;
    const accent = options.accent || "var(--accent)";
    const actionLabel = () => (typeof options.actionLabel === "function" ? options.actionLabel() : (options.actionLabel || "Select"));
    const reduce = () => window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    root.style.setProperty("--deck-accent", accent);
    const hintText = () => (typeof options.hintLabel === "function" ? options.hintLabel() : (options.hintLabel || "左右滑"));
    root.innerHTML = `
      <p class="deck-hint" data-deck-hint>
        <span class="deck-hint-arrow is-left" aria-hidden="true"></span>
        <span data-deck-hint-copy>${hintText()}</span>
        <span class="deck-hint-arrow is-right" aria-hidden="true"></span>
      </p>
      <section class="deck-stage" aria-label="精选牌组。左右滑动翻牌，循环不断。">
        <div class="deck-pile" data-deck-pile></div>
      </section>
      <p class="deck-live" data-deck-live aria-live="polite"></p>
      <div class="deck-details" data-deck-details hidden>
        <div class="deck-details-card" role="dialog" aria-modal="true">
          <img class="deck-details-art" alt="">
          <button type="button" class="deck-details-close" data-deck-close aria-label="关闭"><i data-lucide="x" style="width:14px;height:14px"></i></button>
          <div class="deck-details-body">
            <div class="deck-details-title-row">
              <h3 data-deck-d-title></h3>
              <span data-deck-d-price></span>
            </div>
            <p class="deck-details-sub" data-deck-d-sub></p>
            <p class="deck-details-copy" data-deck-d-copy></p>
            <dl class="deck-specs" data-deck-d-specs></dl>
            <button type="button" class="btn btn-primary deck-details-action" data-deck-action></button>
          </div>
        </div>
      </div>
    `;

    const pile = root.querySelector("[data-deck-pile]");
    const live = root.querySelector("[data-deck-live]");
    const hintEl = root.querySelector("[data-deck-hint]");
    const hintCopy = root.querySelector("[data-deck-hint-copy]");
    const detailsEl = root.querySelector("[data-deck-details]");
    const dTitle = root.querySelector("[data-deck-d-title]");
    const dSub = root.querySelector("[data-deck-d-sub]");
    const dCopy = root.querySelector("[data-deck-d-copy]");
    const dPrice = root.querySelector("[data-deck-d-price]");
    const dSpecs = root.querySelector("[data-deck-d-specs]");
    const dArt = root.querySelector(".deck-details-art");
    const dAction = root.querySelector("[data-deck-action]");

    let order = cards.map((_, i) => i);
    let bodies = cards.map((_, i) => makeBody(i));
    let nodes = [];
    let drag = null;
    let progress = 0;
    let raf = 0;
    let last = 0;
    let suppressClick = false;
    let openId = null;
    let interacted = false;
    let idleTimer = 0;

    function write(index, depth) {
      const node = nodes[index];
      const body = bodies[index];
      if (!(node && body)) return;
      node.style.transform = poseTransform(body);
      node.style.zIndex = String(body.z != null ? body.z : order.length - depth);
      const state = body.phase === "drag" ? "drag" : body.phase === "rest" ? "rest" : "fly";
      if (node.dataset.state !== state) node.dataset.state = state;
    }
    function targetFor(body, depth) {
      if (body.phase === "out") return body.out;
      const pose = slotPose(depth);
      if (depth > 0 && progress > 0) return lerpPose(pose, slotPose(depth - 1), progress * 0.6);
      return pose;
    }
    function advance(index, depth, dt) {
      const body = bodies[index];
      if (!body) return false;
      if (body.phase === "drag") { write(index, depth); return true; }
      if (reduce() && body.phase === "out") { body.phase = "rest"; body.z = null; }
      const target = targetFor(body, depth);
      if (reduce()) Object.assign(body, target, { vx: 0, vy: 0, vr: 0, vs: 0 });
      else stepBody(body, target, dt);
      if (body.phase === "out" && body.vx * body.dx + body.vy * body.dy <= 0) {
        body.phase = "return";
        body.z = body.apexZ;
      }
      const settled = isSettled(body, target);
      if (settled && body.phase !== "out") { body.phase = "rest"; body.z = null; }
      write(index, depth);
      return !settled;
    }
    function tick(now) {
      const dt = Math.min((now - last) / 1000, 1 / 30);
      last = now;
      let active = false;
      order.forEach((index, depth) => { if (advance(index, depth, dt)) active = true; });
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
    function updateHint() {
      if (hintCopy) hintCopy.textContent = hintText();
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

    function syncTopFocus() {
      nodes.forEach((node, index) => {
        const isTop = order[0] === index;
        if (!node) return;
        node.tabIndex = isTop ? 0 : -1;
        node.toggleAttribute("inert", !isTop);
      });
    }

    function openDetails(card) {
      openId = card.id;
      dTitle.textContent = card.title;
      dSub.textContent = card.subtitle;
      dCopy.textContent = card.description;
      dPrice.textContent = card.price || "";
      dArt.src = card.detailImage || card.image;
      dSpecs.innerHTML = (card.specs || []).map((spec) =>
        `<div><dt>${spec.label}</dt><dd>${spec.value}</dd></div>`
      ).join("");
      dAction.textContent = actionLabel();
      detailsEl.hidden = false;
      detailsEl.querySelector("[data-deck-close]").focus({ preventScroll: true });
    }
    function closeDetails() {
      openId = null;
      detailsEl.hidden = true;
      const top = nodes[order[0]];
      top?.focus({ preventScroll: true });
    }

    function renderPile() {
      pile.innerHTML = cards.map((card, index) => `
        <button type="button" class="deck-card" data-deck-index="${index}" data-state="rest"
          aria-label="${card.title}，${card.subtitle}。打开详情"
          style="transform:${poseTransform(slotPose(index))};z-index:${cards.length - index}">
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
        </button>
      `).join("");
      nodes = [...pile.querySelectorAll(".deck-card")];
      bodies = cards.map((_, i) => makeBody(i));
      order = cards.map((_, i) => i);
      syncTopFocus();
      updateLive();
      nodes.forEach((node, index) => bindCard(node, index));
      kick();
      scheduleIdleSlip();
    }

    function bindCard(node, index) {
      node.addEventListener("pointerdown", (event) => {
        suppressClick = false;
        if (drag || order[0] !== index) return;
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
        body.y = drag.baseY + dy;
        body.s = 1;
        body.r = Math.max(-1, Math.min(1, body.x / drag.width)) * MAX_DRAG_ROTATION * drag.lever;
        body.vx = body.vy = body.vr = body.vs = 0;
        progress = Math.min(Math.hypot(body.x, body.y) / (drag.width * THROW_DISTANCE), 1);
        kick();
      });
      const up = (event, cancelled) => {
        if (!drag || drag.pointerId !== event.pointerId) return;
        const current = drag;
        drag = null;
        progress = 0;
        const body = bodies[current.index];
        if (!(body && current.moved)) { kick(); return; }
        if (cancelled) { body.phase = "rest"; kick(); return; }
        suppressClick = true;
        const { vx, vy } = releaseVelocity(current.samples);
        const speed = Math.hypot(vx, vy);
        const distance = Math.hypot(body.x, body.y);
        const heading = distance > 0 ? (vx * body.x + vy * body.y) / distance : 0;
        const fast = speed > THROW_VELOCITY && heading > -0.2;
        const far = distance > current.width * THROW_DISTANCE && heading > -0.3;
        if (fast || far) {
          markInteracted();
          const dirX = Math.abs(vx) > 0.04 ? vx : body.x;
          if (dirX >= 0) {
            body.phase = "rest";
            bringBack();
          } else {
            throwTop(vx, vy, body.x / (distance || 1), body.y / (distance || 1));
          }
          return;
        }
        body.phase = "rest";
        body.vx = vx * 1000;
        body.vy = vy * 1000;
        body.vr = ((vx * 1000) / current.width) * MAX_DRAG_ROTATION * current.lever;
        kick();
      };
      node.addEventListener("pointerup", (event) => up(event, false));
      node.addEventListener("pointercancel", (event) => up(event, true));
      node.addEventListener("lostpointercapture", (event) => up(event, true));
      node.addEventListener("click", () => {
        if (suppressClick) { suppressClick = false; return; }
        if (order[0] === index) openDetails(cards[index]);
      });
      node.addEventListener("keydown", (event) => {
        suppressClick = false;
        if (event.key === "ArrowRight" || event.key === "ArrowDown") {
          event.preventDefault();
          cycle(1);
        } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
          event.preventDefault();
          cycle(-1);
        }
      });
    }

    function scheduleIdleSlip() {
      clearTimeout(idleTimer);
      if (reduce() || interacted) return;
      idleTimer = setTimeout(() => {
        if (interacted) return;
        const body = bodies[order[0]];
        if (!body || body.phase !== "rest") return;
        body.vx = -240;
        body.vr = -6;
        kick();
        idleTimer = setTimeout(() => {
          if (interacted) return;
          const again = bodies[order[0]];
          if (!again || again.phase !== "rest") return;
          again.vx = 260;
          again.vr = 7;
          kick();
        }, 640);
      }, 900);
    }

    root.querySelector("[data-deck-close]").addEventListener("click", closeDetails);
    detailsEl.addEventListener("click", (event) => { if (event.target === detailsEl) closeDetails(); });
    dAction.addEventListener("click", () => {
      const card = cards.find((item) => item.id === openId);
      if (card) onAction && onAction(card);
      closeDetails();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && openId) {
        event.preventDefault();
        event.stopImmediatePropagation();
        closeDetails();
      }
    });

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
        root.innerHTML = "";
      }
    };
  };
})(window);
