/* Kokonut Marker Text 的静态移植：荧光笔 / 圈画，按阅读顺序一笔一笔出来 */
(function (global) {
  const DEFAULT_COLOR = {
    highlight: "#c5d46a",
    underline: "#545f2a",
    circle: "#545f2a",
    box: "#545f2a",
    strike: "#9a3b32"
  };
  const PEN_EASE = "cubic-bezier(0.45, 0.05, 0.25, 1)";
  const MASK_SPAN = 20000;
  const START_DELAY = 70;
  const GAP = 40;

  function random(seed) {
    let n = seed;
    return () => {
      n += 1;
      const x = Math.sin(n * 12.9898 + seed * 78.233) * 43758.5453;
      return x - Math.floor(x);
    };
  }
  function hash(text) {
    let h = 7;
    for (const char of text) h = (h * 31 + (char.codePointAt(0) || 0)) % 1000003;
    return h;
  }
  const r1 = (n) => Math.round(n * 10) / 10;
  function polyline(points) {
    return points.map(([x, y], i) => `${i === 0 ? "M" : "L"}${r1(x)} ${r1(y)}`).join("");
  }
  function lengthOf(points) {
    let total = 0;
    for (let i = 1; i < points.length; i++) {
      total += Math.hypot(points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1]);
    }
    return total;
  }
  function outline(points, widths) {
    const left = [];
    const right = [];
    const last = points.length - 1;
    for (let i = 0; i <= last; i++) {
      const prev = points[Math.max(0, i - 1)];
      const next = points[Math.min(last, i + 1)];
      const dx = next[0] - prev[0];
      const dy = next[1] - prev[1];
      const len = Math.hypot(dx, dy) || 1;
      const half = widths[i] / 2;
      left.push([points[i][0] + (-dy / len) * half, points[i][1] + (dx / len) * half]);
      right.push([points[i][0] - (-dy / len) * half, points[i][1] - (dx / len) * half]);
    }
    const back = right.reverse();
    const endCap = r1(widths[last] / 2);
    const startCap = r1(widths[0] / 2);
    return `${polyline(left)}A${endCap} ${endCap} 0 0 0 ${r1(back[0][0])} ${r1(back[0][1])}${polyline(back).replace("M", "L")}A${startCap} ${startCap} 0 0 0 ${r1(left[0][0])} ${r1(left[0][1])}Z`;
  }
  function pressure(t, base) {
    const land = Math.min(1, t / 0.1);
    const lift = Math.min(1, (1 - t) / 0.18);
    return base * (0.45 + 0.55 * Math.sin((land * Math.PI) / 2)) * (0.55 + 0.45 * lift);
  }
  function wobble(rand, amp) {
    const p1 = rand() * Math.PI * 2;
    const p2 = rand() * Math.PI * 2;
    const f1 = 1 + rand() * 1.5;
    const f2 = 3 + rand() * 3;
    return (t) => amp * (0.7 * Math.sin(t * f1 * Math.PI + p1) + 0.3 * Math.sin(t * f2 * Math.PI + p2));
  }
  function sample(count, at) {
    const points = [];
    for (let i = 0; i <= count; i++) points.push(at(i / count));
    return points;
  }
  function penStroke(points, width, key, color) {
    const widths = points.map((_, i) => pressure(i / (points.length - 1), width));
    return {
      key, shape: outline(points, widths), pen: polyline(points),
      penWidth: width * 1.35, length: lengthOf(points), color, under: false, alpha: 1
    };
  }
  function circleStroke(box, rand, width, key, color) {
    const cx = (box.left + box.right) / 2;
    const cy = (box.top + box.bottom) / 2;
    const rx = (box.right - box.left) / 2 + 8;
    const ry = (box.bottom - box.top) / 2 + 4;
    const tilt = ((rand() - 0.5) * 6 * Math.PI) / 180;
    const start = -Math.PI * (0.62 + rand() * 0.12);
    const sweep = Math.PI * 2 + 0.45 + rand() * 0.2;
    const drift = 0.05 + rand() * 0.04;
    const wave = wobble(rand, 0.025);
    const steps = Math.max(48, Math.round((rx + ry) / 3));
    const points = sample(steps, (t) => {
      const a = start + sweep * t;
      const grow = 1 - drift / 2 + drift * t + wave(t);
      const x = Math.cos(a) * rx * grow;
      const y = Math.sin(a) * ry * grow;
      return [
        cx + x * Math.cos(tilt) - y * Math.sin(tilt),
        cy + x * Math.sin(tilt) + y * Math.cos(tilt)
      ];
    });
    return penStroke(points, width, key, color);
  }
  function wavyStrokes(lines, rand, index, color, width) {
    const out = [];
    lines.forEach((line, i) => {
      const h = line.bottom - line.top;
      const copies = 2;
      for (let n = 0; n < copies; n++) {
        const y = line.bottom - h * 0.02 + n * Math.max(3.5, h * 0.055);
        const amp = 2.4 + rand() * 1.6;
        const freq = 2.4 + rand() * 1.2;
        const phase = rand() * Math.PI;
        const slope = (rand() - 0.5) * 1.6;
        const x0 = line.left - 3 - rand() * 2;
        const x1 = line.right + 3 + rand() * 2;
        const steps = Math.max(18, Math.round((x1 - x0) / 4.5));
        const points = sample(steps, (t) => [
          x0 + (x1 - x0) * t,
          y + Math.sin(t * freq * Math.PI + phase) * amp + slope * (t - 0.5)
        ]);
        out.push({
          ...penStroke(points, width * (0.9 + n * 0.08), `${index}-${i}-w${n}`, color),
          under: false,
          alpha: 0.92
        });
      }
    });
    return out;
  }
  function highlightStrokes(lines, rand, index) {
    return lines.map((line, i) => {
      const h = line.bottom - line.top;
      const top = wobble(rand, 0.9);
      const bottom = wobble(rand, 0.9);
      const chisel = h * 0.2;
      const tilt = (rand() - 0.5) * Math.min(3, h * 0.08);
      const x0 = line.left - 3 - rand() * 2;
      const x1 = line.right + 3 + rand() * 3;
      const y0 = line.top + h * 0.08;
      const y1 = line.bottom - h * 0.02;
      const steps = Math.max(6, Math.round((x1 - x0) / 14));
      const edge = (y, wave, dx) => sample(steps, (t) => [
        x0 + dx + (x1 - x0) * t,
        y + wave(t) + tilt * (t - 0.5)
      ]);
      const upper = edge(y0, top, chisel * 0.5);
      const lower = edge(y1, bottom, -chisel * 0.5).reverse();
      const mid = (y0 + y1) / 2;
      const pen = [[x0 - chisel, mid], [x1 + chisel, mid + tilt * 0.5]];
      return {
        key: `${index}-${i}`,
        shape: `${polyline(upper)}${polyline(lower).replace("M", "L")}Z`,
        pen: polyline(pen),
        penWidth: h * 0.62,
        length: lengthOf(pen),
        color: DEFAULT_COLOR.highlight,
        under: true,
        alpha: 0.55
      };
    });
  }
  function strokesFor(entry, lines, seed, index) {
    const rand = random(seed);
    const color = entry.color || DEFAULT_COLOR[entry.type];
    const lineHeight = lines[0].bottom - lines[0].top;
    const width = entry.strokeWidth || Math.min(4.5, Math.max(1.6, lineHeight * 0.085));
    if (entry.type === "highlight") {
      return highlightStrokes(lines, rand, index).map((s) => ({ ...s, color }));
    }
    if (entry.type === "circle") {
      return lines.map((line, i) => circleStroke(line, rand, width, `${index}-${i}`, color));
    }
    if (entry.type === "underline" || entry.type === "wavy") {
      return wavyStrokes(lines, rand, index, color, width);
    }
    return lines.map((line, i) => {
      const h = line.bottom - line.top;
      const bow = (rand() - 0.5) * 3;
      const slope = (rand() - 0.5) * 2.4;
      const wave = wobble(rand, 0.5);
      const x0 = line.left - 2 - rand() * 3;
      const x1 = line.right + 2 + rand() * 4;
      const y = line.bottom + Math.max(1, h * 0.04);
      const steps = Math.max(8, Math.round((x1 - x0) / 6));
      const points = sample(steps, (t) => [
        x0 + (x1 - x0) * t,
        y + Math.sin(t * Math.PI) * bow + slope * (t - 0.5) + wave(t)
      ]);
      return penStroke(points, width, `${index}-${i}`, color);
    });
  }

  let uid = 0;
  function layerSvg(strokes, under) {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("width", "1");
    svg.setAttribute("height", "1");
    svg.setAttribute("overflow", "visible");
    svg.classList.add("marker-layer", under ? "is-under" : "is-over");
    strokes.filter((s) => s.under === under).forEach((s) => {
      const hidden = s.length + 1;
      const pen = document.createElementNS("http://www.w3.org/2000/svg", "path");
      pen.setAttribute("d", s.pen);
      pen.setAttribute("fill", "none");
      pen.setAttribute("stroke", s.color);
      pen.setAttribute("stroke-opacity", String(s.alpha));
      pen.setAttribute("stroke-linecap", under ? "butt" : "round");
      pen.setAttribute("stroke-linejoin", "round");
      pen.setAttribute("stroke-width", String(s.penWidth));
      pen.setAttribute("stroke-dasharray", String(hidden));
      pen.setAttribute("stroke-dashoffset", String(hidden));
      pen.style.strokeDasharray = String(hidden);
      pen.style.strokeDashoffset = String(hidden);
      pen.dataset.length = String(hidden);
      pen.dataset.duration = String(s.duration);
      pen.dataset.delay = String(s.delay);
      svg.appendChild(pen);
    });
    return svg;
  }

  global.AOCI = global.AOCI || {};
  global.AOCI.mountMarkerText = function mountMarkerText(root) {
    if (!root) return { redraw() {}, destroy() {} };
    root.classList.add("marker-text");
    const maskPrefix = `mk${++uid}`;
    let underLayer = null;
    let overLayer = null;
    let drawn = false;
    let playing = false;
    let strokes = [];
    const reduced = () => window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function pens() {
      return [...root.querySelectorAll(".marker-layer path")];
    }
    function clearLayers() {
      pens().forEach((pen) => pen.getAnimations().forEach((a) => a.cancel()));
      underLayer?.remove();
      overLayer?.remove();
      underLayer = overLayer = null;
    }
    function paint() {
      clearLayers();
      underLayer = layerSvg(strokes, true);
      overLayer = layerSvg(strokes, false);
      root.prepend(underLayer);
      root.append(overLayer);
    }
    function revealAll() {
      pens().forEach((pen) => {
        pen.style.strokeDashoffset = "0";
        pen.setAttribute("stroke-dashoffset", "0");
      });
      drawn = true;
      playing = false;
    }
    function play() {
      if (reduced()) {
        revealAll();
        return;
      }
      playing = true;
      drawn = false;
      const nodes = pens();
      nodes.forEach((pen) => {
        const len = Number(pen.dataset.length);
        pen.getAnimations().forEach((a) => a.cancel());
        pen.style.strokeDashoffset = String(len);
        pen.setAttribute("stroke-dashoffset", String(len));
      });
      void root.offsetWidth;
      let pending = nodes.length;
      if (!pending) { playing = false; return; }
      nodes.forEach((pen) => {
        const len = Number(pen.dataset.length);
        const duration = Number(pen.dataset.duration);
        const delay = START_DELAY + Number(pen.dataset.delay);
        const anim = pen.animate(
          [{ strokeDashoffset: len }, { strokeDashoffset: 0 }],
          { duration, delay, easing: PEN_EASE, fill: "forwards" }
        );
        anim.addEventListener("finish", () => {
          pen.style.strokeDashoffset = "0";
          pen.setAttribute("stroke-dashoffset", "0");
          pending -= 1;
          if (pending <= 0) {
            playing = false;
            drawn = true;
          }
        });
      });
    }
    function measure() {
      const origin = root.getBoundingClientRect();
      const marks = [...root.querySelectorAll("[data-mark]")];
      const next = [];
      let clock = 0;
      marks.forEach((el, index) => {
        const type = el.getAttribute("data-mark") || "highlight";
        const color = el.getAttribute("data-mark-color") || undefined;
        const lines = [...el.getClientRects()]
          .filter((r) => r.width > 1)
          .map((r) => ({
            left: r.left - origin.left,
            top: r.top - origin.top,
            right: r.right - origin.left,
            bottom: r.bottom - origin.top
          }));
        if (!lines.length) return;
        const seed = hash(`${el.textContent || ""}${index}`);
        const made = strokesFor({ el, type, color }, lines, seed, index);
        made.forEach((stroke, i) => {
          const duration = type === "highlight"
            ? Math.min(360, Math.max(220, stroke.length / 1.15))
            : type === "circle"
              ? Math.min(420, Math.max(260, stroke.length / 0.85))
              : Math.min(280, Math.max(160, stroke.length / 1.4));
          next.push({ ...stroke, delay: clock, duration });
          clock += i < made.length - 1 ? 36 : duration * 0.22;
        });
        clock += GAP;
      });
      strokes = next;
      paint();
    }
    function start() {
      measure();
      requestAnimationFrame(() => requestAnimationFrame(play));
    }

    let resizeTimer = 0;
    const ro = ("ResizeObserver" in window) ? new ResizeObserver(() => {
      if (playing || !drawn) return;
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (playing) return;
        measure();
        revealAll();
      }, 160);
    }) : null;
    if (ro) ro.observe(root);
    const io = ("IntersectionObserver" in window) ? new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting && e.intersectionRatio >= 0.35)) {
        start();
        io.disconnect();
      }
    }, { threshold: [0.35, 0.6] }) : null;
    if (io) io.observe(root);
    else start();
    document.fonts?.ready.then(() => {
      if (playing || drawn) return;
      start();
    });

    return {
      redraw() {
        start();
      },
      destroy() {
        clearTimeout(resizeTimer);
        if (ro) ro.disconnect();
        if (io) io.disconnect();
        clearLayers();
      }
    };
  };
})(window);
