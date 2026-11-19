/* Kokonut AI Agent Lanes 的静态移植：泳道回放、拖动时间轴、转录 */
(function (global) {
  const OPEN_MARGIN = 0.001;
  const LANE_H = 36;
  const TICK = 2;
  const EASE = "cubic-bezier(0.23, 1, 0.32, 1)";
  const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];

  const ICONS = {
    play: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><polygon points="6 3 20 12 6 21 6 3"/></svg>',
    pause: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>',
    replay: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>'
  };

  function pixelMask(density) {
    const columns = 4, rows = 4, cell = 2;
    let rects = "";
    const on = Math.round(density * 16);
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < columns; x++) {
        if (BAYER[(y % 4) * 4 + (x % 4)] < on) {
          rects += `<rect x="${x * cell}" y="${y * cell}" width="${cell}" height="${cell}"/>`;
        }
      }
    }
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${columns * cell}" height="${rows * cell}">${rects}</svg>`;
    const image = `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
    const size = `${columns * cell}px ${rows * cell}px`;
    return {
      maskImage: image,
      webkitMaskImage: image,
      maskSize: size,
      webkitMaskSize: size,
      maskRepeat: "repeat",
      webkitMaskRepeat: "repeat"
    };
  }

  const TOOL_DITHER = {
    think: pixelMask(0.375),
    read: pixelMask(0.5)
  };

  function clamp01(n) { return Math.min(1, Math.max(0, n)); }
  function formatTime(s) { return `${s.toFixed(1)}s`; }
  function placeLanes(lanes, elapsed) {
    return lanes.map((lane) => ({
      ...lane,
      steps: lane.steps.map((step) => ({
        ...step,
        end: step.end ?? (elapsed === undefined ? step.start + 1 : elapsed + OPEN_MARGIN)
      }))
    }));
  }
  function laneEnd(lane) { return lane.steps.length ? lane.steps[lane.steps.length - 1].end : 0; }
  function reduceMotion() {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }
  function applyMask(el, tool) {
    const dither = TOOL_DITHER[tool];
    if (!dither) {
      el.style.maskImage = "";
      el.style.webkitMaskImage = "";
      return;
    }
    Object.assign(el.style, dither);
  }

  function writtenAnswer(answer, writing, now) {
    if (!writing || now < writing.start) return "";
    const share = clamp01((now - writing.start) / (writing.end - writing.start));
    return answer.slice(0, Math.round(answer.length * share));
  }

  global.AOCI = global.AOCI || {};
  global.AOCI.mountAIAgentLanes = function mountAIAgentLanes(root, options) {
    const getRun = typeof options.getRun === "function" ? options.getRun : () => options.run;
    const getCopy = typeof options.getCopy === "function" ? options.getCopy : () => options.copy || {};

    let run = getRun() || { task: "", answer: "", lanes: [] };
    let copy = getCopy();
    let lanes = placeLanes(run.lanes || []);
    let total = Math.max(OPEN_MARGIN, ...lanes.flatMap((l) => l.steps.map((s) => s.end)));
    let now = 0;
    let playing = false;
    let visible = false;
    let seen = false;
    let selected = lanes[0]?.id || "";
    let hover = null;
    let frame = 0;
    let lastTs = 0;
    let startTimer = 0;
    let trackWidth = 0;

    root.classList.add("aal");
    root.innerHTML = `
      <div class="aal-head">
        <div class="aal-head-copy">
          <p class="aal-status" data-aal="status"></p>
          <p class="aal-task" data-aal="task"></p>
        </div>
        <button type="button" class="aal-play" data-aal="play" aria-label=""></button>
      </div>
      <div class="aal-chart">
        <div class="aal-labels" data-aal="labels"></div>
        <div class="aal-track" data-aal="track">
          <div class="aal-lanes" data-aal="lanes"></div>
          <svg class="aal-connectors" data-aal="svg" aria-hidden="true"></svg>
          <div class="aal-playhead-layer" aria-hidden="true">
            <div class="aal-playhead" data-aal="head"><span></span></div>
          </div>
          <div class="aal-tip" data-aal="tip" hidden></div>
        </div>
      </div>
      <div class="aal-ruler">
        <div class="aal-ticks" data-aal="ticks"></div>
        <input class="aal-scrub" data-aal="scrub" type="range" min="0" max="1" step="0.1" value="0" aria-label="">
        <span class="aal-knob-layer" aria-hidden="true"><span class="aal-knob" data-aal="knob"></span></span>
      </div>
      <div class="aal-legend" data-aal="legend"></div>
      <div class="aal-transcript" data-aal="transcript"></div>
    `;

    const el = {
      status: root.querySelector("[data-aal=status]"),
      task: root.querySelector("[data-aal=task]"),
      play: root.querySelector("[data-aal=play]"),
      labels: root.querySelector("[data-aal=labels]"),
      lanes: root.querySelector("[data-aal=lanes]"),
      svg: root.querySelector("[data-aal=svg]"),
      head: root.querySelector("[data-aal=head]"),
      tip: root.querySelector("[data-aal=tip]"),
      ticks: root.querySelector("[data-aal=ticks]"),
      scrub: root.querySelector("[data-aal=scrub]"),
      knob: root.querySelector("[data-aal=knob]"),
      legend: root.querySelector("[data-aal=legend]"),
      transcript: root.querySelector("[data-aal=transcript]"),
      track: root.querySelector("[data-aal=track]")
    };

    function toolName(kind) {
      return (copy.tools && copy.tools[kind]) || kind;
    }
    function statusLine(done, running) {
      if (done) return (copy.doneIn || "Done in {t}").replace("{t}", formatTime(total));
      if (running > 0) {
        const key = running === 1 ? "oneWorking" : "manyWorking";
        return (copy[key] || "{n} agents · {t}")
          .replace("{n}", String(running))
          .replace("{t}", formatTime(now));
      }
      return now === 0 ? (copy.ready || "Ready") : (copy.leadTime || "Lead · {t}").replace("{t}", formatTime(now));
    }
    function playLabel(done) {
      if (done) return copy.replay || "Replay";
      return playing ? (copy.pause || "Pause") : (copy.play || "Play");
    }

    function buildStatic() {
      el.task.textContent = run.task || "";
      el.labels.innerHTML = lanes.map((lane, i) => `
        <button type="button" class="aal-lane-btn" data-lane="${lane.id}" aria-pressed="${lane.id === selected}">
          <span class="aal-dot" data-dot></span>
          <span class="aal-lane-name">${lane.name}</span>
        </button>
      `).join("");
      el.lanes.innerHTML = lanes.map((lane, li) => `
        <div class="aal-lane" data-lane-row="${lane.id}" style="height:${LANE_H}px">
          ${lane.steps.map((step, si) => `
            <button type="button" class="aal-bar" data-li="${li}" data-si="${si}"
              aria-label="${toolName(step.tool)}: ${step.label}" hidden>
              <span class="aal-bar-fill aal-tool-${step.tool}"></span>
            </button>
          `).join("")}
        </div>
      `).join("");
      el.lanes.querySelectorAll(".aal-bar-fill").forEach((fill) => {
        const bar = fill.parentElement;
        const li = Number(bar.dataset.li);
        const si = Number(bar.dataset.si);
        applyMask(fill, lanes[li].steps[si].tool);
      });
      const ticks = [];
      for (let t = 0; t <= total; t += TICK) ticks.push(t);
      el.ticks.innerHTML = ticks.map((t) =>
        `<span style="left:${(t / total) * 100}%">${t}s</span>`
      ).join("");
      el.scrub.max = String(total);
      el.scrub.setAttribute("aria-label", copy.scrub || "Run time");
      const order = ["search", "read", "think", "write"];
      el.legend.innerHTML = order.map((tool) =>
        `<span class="aal-leg"><i class="aal-leg-swatch aal-tool-${tool}"></i>${toolName(tool)}</span>`
      ).join("");
      el.legend.querySelectorAll(".aal-leg-swatch").forEach((swatch) => {
        const tool = [...swatch.classList].find((c) => c.startsWith("aal-tool-"))?.replace("aal-tool-", "");
        applyMask(swatch, tool);
      });
      drawConnectors();
    }

    function drawConnectors() {
      const lead = lanes[0];
      const subs = lanes.slice(1);
      const w = trackWidth;
      if (!lead || w <= 0) {
        el.svg.innerHTML = "";
        return;
      }
      const xAt = (t) => (t / total) * w;
      const yAt = (i) => i * LANE_H + LANE_H / 2;
      const fork = lead.steps[0]?.end ?? 0;
      const join = lead.steps[lead.steps.length - 1]?.start ?? total;
      const top = yAt(0);
      const fx = xAt(fork);
      const jx = xAt(join);
      const reach = (from, to) => clamp01((now - from) / (to - from));
      const waitX2 = xAt(Math.min(Math.max(now, fork), join));
      let paths = `<line class="aal-wait" x1="${fx}" x2="${waitX2}" y1="${top}" y2="${top}" />`;
      subs.forEach((lane, i) => {
        const y = yAt(i + 1);
        const sx = xAt(lane.steps[0]?.start ?? fork);
        const ex = xAt(laneEnd(lane));
        const outOff = 1 - reach(fork, fork + 0.2);
        const backOff = 1 - reach(join - 0.35, join);
        paths += `<g class="aal-fork">
          <path d="M ${fx} ${top} C ${fx + 6} ${top} ${fx + 2} ${y} ${sx} ${y}" pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="${outOff}" />
          <path d="M ${ex} ${y} C ${jx - 18} ${y} ${jx - 12} ${top} ${jx} ${top}" pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="${backOff}" />
        </g>`;
      });
      el.svg.innerHTML = paths;
    }

    function paintPlay() {
      const done = now >= total;
      el.play.setAttribute("aria-label", playLabel(done));
      el.play.innerHTML = `
        <span class="aal-face${done ? "" : " is-off"}">${ICONS.replay}</span>
        <span class="aal-face${playing && !done ? "" : " is-off"}">${ICONS.pause}</span>
        <span class="aal-face${!playing && !done ? "" : " is-off"}">${ICONS.play}</span>
      `;
    }

    function paintLabels() {
      lanes.forEach((lane, i) => {
        const btn = el.labels.querySelector(`[data-lane="${lane.id}"]`);
        if (!btn) return;
        const started = now >= (lane.steps[0]?.start ?? 0);
        const finished = i > 0 && now >= laneEnd(lane);
        btn.classList.toggle("is-active", selected === lane.id);
        btn.classList.toggle("is-waiting", !started);
        btn.setAttribute("aria-pressed", selected === lane.id ? "true" : "false");
        const dot = btn.querySelector("[data-dot]");
        if (finished) {
          if (!dot.classList.contains("is-done")) {
            dot.className = "aal-dot is-done";
            dot.innerHTML = ICONS.check;
          }
        } else {
          dot.className = "aal-dot" + (i === 0 ? " is-lead" : "");
          dot.innerHTML = "";
        }
      });
    }

    function paintBars() {
      lanes.forEach((lane, li) => {
        lane.steps.forEach((step, si) => {
          const bar = el.lanes.querySelector(`[data-li="${li}"][data-si="${si}"]`);
          if (!bar) return;
          const dur = Math.max(step.end - step.start, 0.001);
          const progress = clamp01((now - step.start) / dur);
          if (progress <= 0) {
            bar.hidden = true;
            return;
          }
          bar.hidden = false;
          bar.style.left = `${(step.start / total) * 100}%`;
          bar.style.width = `${(dur / total) * 100}%`;
          bar.firstElementChild.style.clipPath = `inset(0 ${(1 - progress) * 100}% 0 0 round 3px)`;
        });
      });
    }

    function paintTip() {
      const step = hover ? lanes[hover.lane]?.steps[hover.step] : null;
      if (!(step && now > step.start)) {
        el.tip.hidden = true;
        return;
      }
      const mid = (step.start + step.end) / 2 / total;
      const finished = now >= step.end;
      const waiting = copy.waiting || "Waiting…";
      el.tip.hidden = false;
      const below = hover.lane === 0;
      el.tip.classList.toggle("is-below", below);
      el.tip.style.top = below ? `${LANE_H - 2}px` : `${hover.lane * LANE_H + 4}px`;
      el.tip.style.left = mid > 0.6 ? "auto" : `${(step.start / total) * 100}%`;
      el.tip.style.right = mid > 0.6 ? `${(1 - step.end / total) * 100}%` : "auto";
      el.tip.innerHTML = `
        <div class="aal-tip-meta">
          <span>${toolName(step.tool)}</span>
          <span>${formatTime(Math.min(now, step.end) - step.start)}</span>
        </div>
        <p class="aal-tip-label">${step.label}</p>
        ${step.result ? `<p class="aal-tip-result">${finished ? step.result : waiting}</p>` : ""}
      `;
    }

    function paintTranscript() {
      const lead = lanes[0];
      const lane = lanes.find((l) => l.id === selected) || lead;
      const isLead = lane.id === lead.id;
      const steps = lane.steps.filter((s) => now >= s.start);
      const writing = isLead ? lane.steps[lane.steps.length - 1] : undefined;
      const written = writtenAnswer(run.answer || "", writing, now);
      const summary = lane.summary && now >= laneEnd(lane)
        ? ` <span class="aal-sum">· ${lane.summary}</span>` : "";
      let body;
      if (written) {
        const caret = now < (writing?.end ?? 0) ? '<span class="aal-caret"></span>' : "";
        body = `<p class="aal-answer">${written}${caret}</p>`;
      } else {
        const items = steps.map((step) => {
          const finished = now >= step.end;
          const result = finished && step.result ? ` <span class="aal-result">→ ${step.result}</span>` : "";
          return `<li>
            <span class="aal-pulse${finished ? " is-done" : ""}"></span>
            <span class="aal-tool">${toolName(step.tool)}</span>
            <span>${step.label}${result}</span>
          </li>`;
        }).join("");
        body = `<ul class="aal-log">${items || `<li class="aal-empty">${copy.notStarted || "Not started yet"}</li>`}</ul>`;
      }
      el.transcript.innerHTML = `<div class="aal-tr-head"><strong>${lane.name}</strong>${summary}</div>${body}`;
    }

    function paintTime() {
      const lead = lanes[0];
      const subs = lanes.slice(1);
      const done = now >= total && lanes.every((l) => now >= laneEnd(l));
      const running = subs.filter((l) => now >= (l.steps[0]?.start ?? 0) && now < laneEnd(l)).length;
      el.status.textContent = statusLine(done, running);
      el.scrub.value = String(now);
      el.scrub.setAttribute("aria-valuetext", formatTime(now));
      const pct = (now / total) * 100;
      el.head.style.transform = `translateX(${pct}%)`;
      el.knob.style.transform = `translateX(${pct}%)`;
      paintPlay();
      paintLabels();
      paintBars();
      paintTip();
      drawConnectors();
      paintTranscript();
    }

    function stopLoop() {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
    }
    function tick(t) {
      const dt = (t - lastTs) / 1000;
      lastTs = t;
      const rate = Math.max(1, total / 2);
      now = Math.min(total, now + dt * rate);
      paintTime();
      if (now >= total) {
        playing = false;
        stopLoop();
        paintPlay();
        return;
      }
      frame = requestAnimationFrame(tick);
    }
    function startLoop() {
      if (frame) return;
      lastTs = performance.now();
      frame = requestAnimationFrame(tick);
    }

    function setPlaying(next, force) {
      playing = next;
      const canRun = playing && (force || !reduceMotion());
      if (canRun) startLoop();
      else stopLoop();
      paintPlay();
    }

    function inView() {
      const box = root.getBoundingClientRect();
      const vh = window.innerHeight || 800;
      return box.bottom > 64 && box.top < vh - 48 && box.height > 0;
    }

    function toggle() {
      if (now >= total) {
        now = 0;
        setPlaying(true, true);
        paintTime();
        return;
      }
      setPlaying(!playing, true);
    }

    el.play.addEventListener("click", toggle);
    el.labels.addEventListener("click", (event) => {
      const btn = event.target.closest("[data-lane]");
      if (!btn) return;
      selected = btn.getAttribute("data-lane");
      paintLabels();
      paintTranscript();
    });
    el.lanes.addEventListener("pointerenter", (event) => {
      const bar = event.target.closest(".aal-bar");
      if (!bar) return;
      hover = { lane: Number(bar.dataset.li), step: Number(bar.dataset.si) };
      selected = lanes[hover.lane].id;
      paintLabels();
      paintTip();
      paintTranscript();
    }, true);
    el.lanes.addEventListener("pointerleave", (event) => {
      const bar = event.target.closest(".aal-bar");
      if (!bar) return;
      hover = null;
      paintTip();
    }, true);
    el.lanes.addEventListener("focusin", (event) => {
      const bar = event.target.closest(".aal-bar");
      if (!bar) return;
      hover = { lane: Number(bar.dataset.li), step: Number(bar.dataset.si) };
      selected = lanes[hover.lane].id;
      paintLabels();
      paintTip();
      paintTranscript();
    });
    el.lanes.addEventListener("focusout", () => { hover = null; paintTip(); });
    el.lanes.addEventListener("click", (event) => {
      const bar = event.target.closest(".aal-bar");
      if (!bar) return;
      selected = lanes[Number(bar.dataset.li)].id;
      paintLabels();
      paintTranscript();
    });
    el.scrub.addEventListener("input", () => {
      now = Number(el.scrub.value);
      setPlaying(false);
      paintTime();
    });

    const io = ("IntersectionObserver" in window) ? new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        visible = entry.isIntersecting || inView();
        if (visible) {
          seen = true;
          if (reduceMotion()) {
            now = total;
            setPlaying(false);
            paintTime();
            return;
          }
          if (!playing && now < total) {
            clearTimeout(startTimer);
            startTimer = setTimeout(() => setPlaying(true), 360);
          } else if (playing) startLoop();
        } else {
          stopLoop();
        }
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -10% 0px" }) : null;
    if (io) io.observe(root);
    visible = inView();
    if (visible) {
      seen = true;
      if (reduceMotion()) {
        now = total;
        paintTime();
      } else {
        startTimer = setTimeout(() => { if (!playing && now < total) setPlaying(true); }, 360);
      }
    } else if (!io) {
      startTimer = setTimeout(() => { if (!reduceMotion()) setPlaying(true); else { now = total; paintTime(); } }, 400);
    }

    const ro = ("ResizeObserver" in window) ? new ResizeObserver((entries) => {
      trackWidth = entries[0]?.contentRect.width || el.track.clientWidth;
      drawConnectors();
    }) : null;
    if (ro) ro.observe(el.track);
    else trackWidth = el.track.clientWidth;

    function loadRun(keepTime) {
      run = getRun() || { task: "", answer: "", lanes: [] };
      copy = getCopy();
      lanes = placeLanes(run.lanes || []);
      total = Math.max(OPEN_MARGIN, ...lanes.flatMap((l) => l.steps.map((s) => s.end)));
      if (!keepTime) now = reduceMotion() ? total : Math.min(now, total);
      if (!lanes.some((l) => l.id === selected)) selected = lanes[0]?.id || "";
      buildStatic();
      trackWidth = el.track.clientWidth;
      paintTime();
    }

    loadRun(false);

    return {
      update() { loadRun(true); },
      destroy() {
        stopLoop();
        clearTimeout(startTimer);
        if (io) io.disconnect();
        if (ro) ro.disconnect();
      }
    };
  };
})(window);
