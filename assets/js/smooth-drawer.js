/* Kokonut Smooth Drawer 的静态移植：peek / 全高两档吸附，拖动手势 1:1 跟手 */
(function (global) {
  const PEEK = 214;
  const TOP_GAP = 24;
  const MAX_H = 680;
  const EASE = "transform 300ms cubic-bezier(.32, .72, 0, 1)";

  function prefersReduce() {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function metrics() {
    const vh = window.innerHeight || 800;
    const height = Math.max(PEEK, Math.min(MAX_H, vh - TOP_GAP));
    return { height, peekY: height - PEEK, closedY: height };
  }

  function rubber(y, min, max) {
    if (y < min) return min + (y - min) * 0.18;
    if (y > max) return max + (y - max) * 0.18;
    return y;
  }

  global.AOCI = global.AOCI || {};
  global.AOCI.mountSmoothDrawer = function mountSmoothDrawer(opts) {
    const sheet = opts.sheet;
    const backdrop = opts.backdrop;
    const details = opts.details;
    const expandBtn = opts.expandBtn;
    const expandLabel = opts.expandLabel;
    const onClose = opts.onClose;
    const detailsLabel = opts.detailsLabel || (() => "Details");
    const hideLabel = opts.hideLabel || (() => "Hide");

    let snap = "closed";
    let y = 0;
    let dragging = false;
    let startY = 0;
    let startTranslate = 0;
    let lastY = 0;
    let lastT = 0;
    let velocity = 0;

    function applyY(next, withTransition) {
      const { height } = metrics();
      y = next;
      sheet.style.height = `${height}px`;
      sheet.style.setProperty("--sheet-h", `${height}px`);
      if (withTransition && !prefersReduce()) sheet.style.transition = EASE;
      else if (!withTransition) sheet.style.transition = "none";
      sheet.style.transform = `translate(-50%, ${y}px)`;
      const { peekY, closedY } = metrics();
      const progress = 1 - Math.min(1, Math.max(0, y / closedY));
      const expandProgress = 1 - Math.min(1, Math.max(0, y / (peekY || 1)));
      if (backdrop) {
        backdrop.hidden = progress <= 0.02;
        backdrop.style.opacity = String(progress * (snap === "full" || expandProgress > 0.5 ? 1 : 0.45));
        backdrop.classList.toggle("is-on", progress > 0.02);
      }
      if (details && dragging) {
        details.style.transition = "none";
        details.style.opacity = String(expandProgress);
        details.style.translate = prefersReduce() ? "0 0" : `0 ${Math.round((1 - expandProgress) * 12)}px`;
      }
    }

    function setSnap(next, animate) {
      const { peekY, closedY } = metrics();
      snap = next;
      sheet.classList.toggle("is-open", next !== "closed");
      sheet.classList.toggle("is-expanded", next === "full");
      sheet.classList.remove("is-dragging");
      sheet.setAttribute("aria-hidden", next === "closed" ? "true" : "false");
      if (details) {
        details.style.transition = "";
        details.style.opacity = "";
        details.style.translate = "";
        if (next === "full") details.removeAttribute("inert");
        else details.setAttribute("inert", "");
      }
      if (expandBtn) {
        expandBtn.setAttribute("aria-expanded", next === "full" ? "true" : "false");
        if (expandLabel) expandLabel.textContent = next === "full" ? hideLabel() : detailsLabel();
      }
      const target = next === "closed" ? closedY : next === "full" ? 0 : peekY;
      applyY(target, animate !== false);
      if (next === "closed") {
        backdrop && (backdrop.classList.remove("is-on"), backdrop.hidden = true, backdrop.style.opacity = "0");
      }
    }

    function open(mode) {
      setSnap(mode === "full" ? "full" : "peek", true);
    }

    function close() {
      setSnap("closed", true);
    }

    function onPointerDown(event) {
      if (event.button && event.button !== 0) return;
      if (event.target.closest("button, a, input, textarea, pre")) return;
      if (!event.target.closest("[data-sheet-drag]")) return;
      const { closedY } = metrics();
      if (snap === "closed") return;
      dragging = true;
      sheet.classList.add("is-dragging");
      startY = event.clientY;
      startTranslate = y;
      lastY = event.clientY;
      lastT = event.timeStamp;
      velocity = 0;
      sheet.setPointerCapture(event.pointerId);
    }

    function onPointerMove(event) {
      if (!dragging) return;
      const { closedY } = metrics();
      const dy = event.clientY - startY;
      const dt = event.timeStamp - lastT || 16;
      velocity = (event.clientY - lastY) / dt;
      lastY = event.clientY;
      lastT = event.timeStamp;
      applyY(rubber(startTranslate + dy, 0, closedY), false);
    }

    function onPointerUp(event) {
      if (!dragging) return;
      dragging = false;
      sheet.classList.remove("is-dragging");
      try { sheet.releasePointerCapture(event.pointerId); } catch {}
      const { peekY, closedY } = metrics();
      const v = velocity * 1000;
      let next = "peek";
      if (v > 900 || y > peekY + (closedY - peekY) * 0.35) next = "closed";
      else if (v < -900 || y < peekY * 0.45) next = "full";
      if (next === "closed") {
        setSnap("closed", true);
        onClose && onClose();
        return;
      }
      setSnap(next, true);
    }

    sheet.addEventListener("pointerdown", onPointerDown);
    sheet.addEventListener("pointermove", onPointerMove);
    sheet.addEventListener("pointerup", onPointerUp);
    sheet.addEventListener("pointercancel", onPointerUp);
    backdrop && backdrop.addEventListener("click", () => {
      setSnap("closed", true);
      onClose && onClose();
    });
    expandBtn && expandBtn.addEventListener("click", () => {
      setSnap(snap === "full" ? "peek" : "full", true);
    });
    window.addEventListener("resize", () => {
      if (snap === "closed") applyY(metrics().closedY, false);
      else setSnap(snap, false);
    });

    applyY(metrics().closedY, false);

    return {
      open,
      close,
      toggleDetails() { setSnap(snap === "full" ? "peek" : "full", true); },
      isExpanded() { return snap === "full"; },
      snap() { return snap; }
    };
  };
})(window);
