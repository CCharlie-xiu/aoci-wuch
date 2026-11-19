/* Kokonut Background Paths 的静态移植：三层缓动丝带 + 指针让线分开 */
(function (global) {
  const SAMPLES = 64;
  const OVERSCAN = 0.06;
  const DRAW_MS = 1400;
  const DRAW_STAGGER_MS = 40;
  const PART_RADIUS = 150;
  const PART_PUSH = 56;
  const LAYERS = [
    { width: 1, opacity: 0.16, phase: 0.6, pace: 0.7, part: 0.45 },
    { width: 1.25, opacity: 0.26, phase: 0.3, pace: 0.85, part: 0.75 },
    { width: 1.5, opacity: 0.4, phase: 0, pace: 1, part: 1 }
  ];
  const EASE_OUT = (t) => 1 - (1 - t) ** 3;

  function lineY(s, u, layer, frame, shape, band) {
    const t = frame.time * layer.pace;
    const x = u * frame.width;
    const center =
      frame.height * 0.5 +
      shape.slope * (x - frame.width / 2) +
      band * 0.1 * Math.sin(Math.PI * 2 * (0.75 * u + 0.1) + layer.phase + t * 0.35);
    const turn = 0.22 + 0.09 * Math.sin(t * 0.21 + layer.phase);
    const breathe = 0.3 * Math.sin(t * 0.5 + s * 4 + layer.phase);
    const twist = Math.cos(Math.PI * (u - turn) + s * (0.6 + breathe) + layer.phase);
    return center + s * shape.spread * band * twist;
  }

  function part(x, y, frame, strength) {
    const { pointer } = frame;
    if (pointer.amount < 0.001) return y;
    const dx = x - pointer.x;
    const dy = y - pointer.y;
    const falloff = Math.exp(-(dx * dx + dy * dy) / (PART_RADIUS * PART_RADIUS));
    const side = dy / (Math.abs(dy) + 24);
    return y + side * falloff * PART_PUSH * strength * pointer.amount;
  }

  function drawLines(ctx, frame, shape, color) {
    const { width, height } = frame;
    ctx.clearRect(0, 0, width, height);
    ctx.strokeStyle = color;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    const band = Math.min(height, width * 1.1);
    const perLayer = Math.max(1, Math.round(shape.count / LAYERS.length));
    const xs = new Float32Array(SAMPLES + 1);
    const ys = new Float32Array(SAMPLES + 1);

    LAYERS.forEach((layer, layerIndex) => {
      ctx.lineWidth = layer.width;
      for (let i = 0; i < perLayer; i++) {
        const drawn = frame.drawn[layerIndex * perLayer + i] ?? 1;
        if (drawn <= 0) continue;
        const s = perLayer === 1 ? 0 : i / (perLayer - 1) - 0.5;
        const last = Math.max(1, Math.ceil(SAMPLES * drawn));
        for (let k = 0; k <= last; k++) {
          const u = -OVERSCAN + (k / SAMPLES) * (1 + OVERSCAN * 2);
          const x = u * width;
          const y = lineY(s, u, layer, frame, shape, band);
          xs[k] = x;
          ys[k] = shape.interactive ? part(x, y, frame, layer.part) : y;
        }
        ctx.globalAlpha = layer.opacity * (0.45 + 0.55 * (1 - Math.abs(s) * 2));
        ctx.beginPath();
        ctx.moveTo(xs[0], ys[0]);
        for (let k = 1; k < last; k++) {
          const mx = (xs[k] + xs[k + 1]) / 2;
          const my = (ys[k] + ys[k + 1]) / 2;
          ctx.quadraticCurveTo(xs[k], ys[k], mx, my);
        }
        ctx.lineTo(xs[last], ys[last]);
        ctx.stroke();
      }
    });
    ctx.globalAlpha = 1;
  }

  global.AOCI = global.AOCI || {};
  global.AOCI.mountBackgroundPaths = function mountBackgroundPaths(root, options) {
    if (!root) return null;
    const opts = options || {};
    const count = opts.count == null ? 42 : opts.count;
    const spread = opts.spread == null ? 1 : opts.spread;
    const angle = opts.angle == null ? -8 : opts.angle;
    const speed = opts.speed == null ? 1 : opts.speed;
    const interactive = opts.interactive !== false;
    const host = opts.host || root;

    root.innerHTML = "<canvas class=\"kpaths-canvas\" aria-hidden=\"true\"></canvas>";
    const canvas = root.querySelector("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const shape = {
      count,
      spread,
      slope: Math.tan((angle * Math.PI) / 180),
      interactive: interactive && !reduceMotion
    };
    const perLayer = Math.max(1, Math.round(count / LAYERS.length));
    const total = perLayer * LAYERS.length;
    const frame = {
      width: 0,
      height: 0,
      time: 40,
      drawn: new Array(total).fill(reduceMotion ? 1 : 0),
      pointer: { x: 0, y: 0, amount: 0, on: false }
    };
    let color = getComputedStyle(canvas).color;
    let start = 0;
    let last = 0;
    let raf = 0;
    let visible = true;
    let onScreen = true;

    const paint = () => drawLines(ctx, frame, shape, color);

    function resize() {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      frame.width = rect.width;
      frame.height = rect.height;
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      paint();
    }

    function loop(now) {
      raf = 0;
      if (!start) {
        start = now;
        last = now;
      }
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      frame.time += dt * speed;
      const elapsed = now - start;
      for (let i = 0; i < frame.drawn.length; i++) {
        if (frame.drawn[i] < 1) {
          const local = (elapsed - (i % perLayer) * DRAW_STAGGER_MS) / DRAW_MS;
          frame.drawn[i] = EASE_OUT(Math.min(Math.max(local, 0), 1));
        }
      }
      const { pointer } = frame;
      pointer.amount += ((pointer.on ? 1 : 0) - pointer.amount) * 0.08;
      paint();
      const settling =
        frame.drawn.some((d) => d < 1) ||
        (pointer.amount > 0.001 && !pointer.on) ||
        pointer.on;
      if (visible && (speed > 0 || settling)) {
        raf = requestAnimationFrame(loop);
      }
    }

    function play() {
      if (!raf && visible && !reduceMotion) {
        last = performance.now();
        raf = requestAnimationFrame(loop);
      }
    }

    function onMove(event) {
      if (event.pointerType !== "mouse" || !shape.interactive) return;
      const rect = canvas.getBoundingClientRect();
      frame.pointer.x = event.clientX - rect.left;
      frame.pointer.y = event.clientY - rect.top;
      frame.pointer.on = true;
      play();
    }
    function onLeave() {
      frame.pointer.on = false;
      play();
    }

    resize();
    canvas.style.opacity = "1";
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    const intersection = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      visible = onScreen && !document.hidden;
      if (visible) play();
    });
    intersection.observe(root);
    const onVisibility = () => {
      visible = onScreen && !document.hidden;
      if (visible) play();
    };
    document.addEventListener("visibilitychange", onVisibility);
    const colorTimer = window.setInterval(() => {
      if (!visible) return;
      const next = getComputedStyle(canvas).color;
      if (next !== color) {
        color = next;
        paint();
      }
    }, 500);
    host.addEventListener("pointermove", onMove);
    host.addEventListener("pointerleave", onLeave);
    play();

    return {
      destroy() {
        cancelAnimationFrame(raf);
        resizeObserver.disconnect();
        intersection.disconnect();
        document.removeEventListener("visibilitychange", onVisibility);
        window.clearInterval(colorTimer);
        host.removeEventListener("pointermove", onMove);
        host.removeEventListener("pointerleave", onLeave);
      }
    };
  };
})(window);
