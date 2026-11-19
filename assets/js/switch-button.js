/* Kokonut Switch Button 的静态移植：日/月形变 + 从按钮扩开的主题揭示 */
(function (global) {
  const EASE_OUT = "cubic-bezier(0.23, 1, 0.32, 1)";
  const EASE_IN_OUT = "cubic-bezier(0.65, 0, 0.35, 1)";
  const EASE_REVEAL = "cubic-bezier(0.4, 0, 0.2, 1)";
  const REVEAL_ATTR = "data-theme-reveal";
  const REVEAL_STYLE_ID = "kokonut-theme-reveal";
  const REVEAL_CSS = `html[${REVEAL_ATTR}]::view-transition-old(root),html[${REVEAL_ATTR}]::view-transition-new(root){animation:none;mix-blend-mode:normal}`;
  const ANIMATED_PROPS = ["opacity", "scale", "translate", "filter"];
  const RAY_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315];
  const RAYS = RAY_ANGLES.map((deg) => {
    const rad = (deg * Math.PI) / 180;
    const at = (r) => ({
      x: Number((12 + r * Math.cos(rad)).toFixed(2)),
      y: Number((12 + r * Math.sin(rad)).toFixed(2))
    });
    return { deg, from: at(7.5), to: at(10) };
  });

  let revealRunning = false;
  let uid = 0;

  function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }
  function snapshot(elements) {
    const map = new Map();
    elements.forEach((el) => {
      const style = getComputedStyle(el);
      const frame = { offset: 0 };
      ANIMATED_PROPS.forEach((prop) => { frame[prop] = style.getPropertyValue(prop); });
      map.set(el, frame);
      el.getAnimations().forEach((a) => a.cancel());
    });
    return map;
  }
  function timing(el, toDark) {
    const part = el.getAttribute("data-part");
    const i = Number(el.getAttribute("data-index") || "0");
    if (part === "ray") {
      return { delay: toDark ? i * 18 : 140 + i * 22, duration: 260, easing: EASE_OUT };
    }
    if (part === "bite") return { delay: toDark ? 60 : 0, duration: 380, easing: EASE_IN_OUT };
    if (part === "disc") return { delay: toDark ? 40 : 0, duration: 380, easing: EASE_OUT };
    return { duration: 240, easing: EASE_OUT };
  }
  function morph(from, toDark) {
    if (prefersReducedMotion()) return;
    from.forEach((frame, el) => {
      el.animate([frame, {}], { ...timing(el, toDark), fill: "backwards" });
    });
  }
  function ensureRevealStyle() {
    if (document.getElementById(REVEAL_STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = REVEAL_STYLE_ID;
    style.textContent = REVEAL_CSS;
    document.head.appendChild(style);
  }
  function revealFrom(button, apply) {
    const doc = document;
    if (
      typeof doc.startViewTransition !== "function" ||
      prefersReducedMotion() ||
      revealRunning ||
      doc.activeViewTransition
    ) {
      apply();
      return;
    }
    const rect = button.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const radius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );
    const root = document.documentElement;
    ensureRevealStyle();
    root.setAttribute(REVEAL_ATTR, "");
    revealRunning = true;
    let transition;
    try {
      transition = doc.startViewTransition(() => { apply(); });
    } catch {
      root.removeAttribute(REVEAL_ATTR);
      revealRunning = false;
      apply();
      return;
    }
    transition.ready.then(() => {
      root.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${radius}px at ${x}px ${y}px)`
          ]
        },
        { duration: 500, easing: EASE_REVEAL, pseudoElement: "::view-transition-new(root)" }
      );
    }).catch(() => {});
    transition.finished.catch(() => {}).finally(() => {
      root.removeAttribute(REVEAL_ATTR);
      revealRunning = false;
    });
  }

  function iconMarkup(maskId) {
    const rays = RAYS.map((ray, index) => (
      `<line data-part="ray" data-index="${index}" x1="${ray.from.x}" y1="${ray.from.y}" x2="${ray.to.x}" y2="${ray.to.y}"></line>`
    )).join("");
    return `
      <svg class="switch-btn-icon" viewBox="0 0 24 24" width="14" height="14" fill="none" aria-hidden="true">
        <defs>
          <mask id="${maskId}">
            <rect width="24" height="24" fill="white"></rect>
            <circle data-part="bite" cx="17" cy="7" r="7.5" fill="black"></circle>
          </mask>
        </defs>
        <circle data-part="disc" cx="12" cy="12" r="4.75" fill="currentColor" mask="url(#${maskId})"></circle>
        ${rays}
      </svg>`;
  }

  global.AOCI = global.AOCI || {};
  global.AOCI.readTheme = function readTheme() {
    try {
      if (localStorage.getItem("aoci-theme") === "dark") return "dark";
    } catch {}
    return document.documentElement.classList.contains("dark") ? "dark" : "light";
  };
  global.AOCI.applyTheme = function applyTheme(theme, options = {}) {
    const { persist = true } = options;
    const dark = theme === "dark";
    document.documentElement.classList.toggle("dark", dark);
    document.documentElement.style.colorScheme = dark ? "dark" : "light";
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = dark ? "#24211d" : "#fbf9f5";
    if (persist) {
      try { localStorage.setItem("aoci-theme", dark ? "dark" : "light"); } catch {}
    }
    document.querySelectorAll("[data-switch-button]").forEach((btn) => {
      btn.setAttribute("aria-pressed", dark ? "true" : "false");
      const lang = document.documentElement.lang || "zh-CN";
      const zh = lang.startsWith("zh");
      btn.setAttribute("aria-label", dark
        ? (zh ? "切换为浅色" : "Switch to light theme")
        : (zh ? "切换为深色" : "Switch to dark theme"));
    });
  };

  global.AOCI.mountSwitchButton = function mountSwitchButton(button, options = {}) {
    if (!button) return { destroy() {} };
    const { reveal = true } = options;
    button.classList.add("switch-btn");
    button.setAttribute("data-switch-button", "");
    button.setAttribute("type", "button");
    if (!button.querySelector(".switch-btn-icon")) {
      button.insertAdjacentHTML("afterbegin", iconMarkup(`themeMoonMask${++uid}`));
    }
    const current = global.AOCI.readTheme();
    global.AOCI.applyTheme(current, { persist: false });

    function onClick(event) {
      if (event.defaultPrevented) return;
      const from = document.documentElement.classList.contains("dark") ? "dark" : "light";
      const next = from === "dark" ? "light" : "dark";
      const apply = () => {
        const parts = [...button.querySelectorAll("[data-part]")];
        const before = snapshot(parts);
        global.AOCI.applyTheme(next);
        morph(before, next === "dark");
      };
      if (reveal) revealFrom(button, apply);
      else apply();
    }
    button.addEventListener("click", onClick);
    return {
      destroy() { button.removeEventListener("click", onClick); }
    };
  };
})(window);
