/* 首页侧栏目录：笔尖 / 墨点游标，呼应 hero 马克笔高亮 */
(function (global) {
  const SECTIONS = [
    { id: "install", zh: "安装", en: "Install" },
    { id: "foryou", zh: "为你推荐", en: "For you" },
    { id: "featured", zh: "精选", en: "Featured" },
    { id: "skills", zh: "能力清单", en: "Skills" },
    { id: "how", zh: "怎么用", en: "How to use" }
  ];

  function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }

  global.AOCI = global.AOCI || {};
  global.AOCI.mountSailingToc = function mountSailingToc(host, options) {
    if (!host) return { destroy() {}, update() {}, setLanguage() {} };
    const getLang = () => (typeof options?.getLanguage === "function" ? options.getLanguage() : "zh");
    const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const railH = 420;
    const yMin = 72;
    const yMax = railH - 48;
    const railX = 22;

    host.innerHTML = `
      <div class="sail-shell">
        <p class="sail-title" data-sail-title>目录</p>
        <svg class="sail-rail" viewBox="0 0 56 ${railH}" aria-hidden="true">
          <path class="sail-route" d="M${railX} 36V${railH - 36}"/>
          <g class="sail-dots" data-sail-dots></g>
        </svg>
        <div class="sail-nib" aria-hidden="true" data-sail-nib>
          <svg viewBox="0 0 36 40" class="sail-nib-svg">
            <!-- 马克笔斜切笔尖 -->
            <path class="sail-tip" d="M11.2 4.8c2.4-1.6 6.8-1.2 9.4 1.1 1.4 1.2 1.6 2.9.4 4.1L14.2 18.6c-1.3 1.4-3.4 1.2-4.5-.3-1.1-1.5-.7-3.5.7-4.6L14.2 10l-3-5.2z"/>
            <path class="sail-tip-edge" d="M13.4 7.2l5.8 4.9"/>
            <!-- 墨点：呼应 hero 荧光笔高亮 -->
            <ellipse class="sail-ink" cx="18" cy="26.5" rx="11.2" ry="6.4" transform="rotate(-12 18 26.5)"/>
            <path class="sail-ink-core" d="M10.5 25.2c3.2-1.8 8.6-2.1 13.4.4"/>
          </svg>
        </div>
        <nav class="sail-links" aria-label="页面目录" data-sail-links></nav>
      </div>
    `;

    const titleEl = host.querySelector("[data-sail-title]");
    const linksEl = host.querySelector("[data-sail-links]");
    const route = host.querySelector(".sail-route");
    const dotsEl = host.querySelector("[data-sail-dots]");
    const nib = host.querySelector("[data-sail-nib]");

    linksEl.innerHTML = SECTIONS.map((s, i) =>
      `<button type="button" class="sail-link" data-index="${i}" data-target="${s.id}">${s.zh}</button>`
    ).join("");

    const buttons = [...linksEl.querySelectorAll(".sail-link")];
    const sections = SECTIONS.map((s) => document.getElementById(s.id)).filter(Boolean);

    let active = 0;
    let y = yMin;
    let target = yMin;
    let velocity = 0;
    let phase = 0;
    let previousScroll = window.scrollY || 0;
    let frame = 0;
    let last = 0;
    let navigation = null;
    let alive = true;
    let visible = true;

    function labelOf(item) {
      return getLang() === "en" ? item.en : item.zh;
    }

    function syncLabels() {
      titleEl.textContent = getLang() === "en" ? "Contents" : "目录";
      buttons.forEach((btn, i) => { btn.textContent = labelOf(SECTIONS[i]); });
      paintDots();
      select(active, true);
    }

    function paintDots() {
      if (!dotsEl) return;
      dotsEl.innerHTML = buttons.map((btn, i) => {
        const cy = linksEl.offsetTop + btn.offsetTop + btn.offsetHeight / 2;
        return `<circle class="sail-dot${i === active ? " is-active" : ""}" cx="${railX}" cy="${cy}" r="${i === active ? 3.2 : 2.1}" data-index="${i}"/>`;
      }).join("");
    }

    function draw() {
      const moving = Boolean(navigation) || Math.abs(target - y) > 0.1 || Math.abs(velocity) > 0.2;
      const center = clamp(y + (reduced() || !moving ? 0 : Math.sin(phase * 2.4) * 0.6), yMin, yMax);
      route.setAttribute("d", `M${railX} 36V${railH - 36}`);
      const press = reduced() ? 1 : 1 + clamp(Math.abs(velocity) * 0.0022, 0, 0.12);
      /* 墨心约在 viewBox y≈26.5 / 40 → 对齐锚点 */
      nib.style.transform = `translateY(${center - 22}px) scale(${press.toFixed(3)})`;
      host.dataset.moving = String(moving);
    }

    function select(index, snap) {
      active = clamp(index, 0, buttons.length - 1);
      host.dataset.active = String(active);
      buttons.forEach((button, i) => {
        button.classList.toggle("is-active", i === active);
        if (i === active) button.setAttribute("aria-current", "location");
        else button.removeAttribute("aria-current");
      });
      paintDots();
      const btn = buttons[active];
      target = clamp(linksEl.offsetTop + btn.offsetTop + btn.offsetHeight / 2 - 8, yMin, yMax);
      if (snap || reduced()) {
        y = target;
        velocity = 0;
        draw();
      } else schedule();
    }

    function pick() {
      if (navigation) return;
      const anchor = window.scrollY + Math.min(220, window.innerHeight * 0.28);
      let next = 0;
      sections.forEach((el, i) => {
        if (!el) return;
        const top = el.getBoundingClientRect().top + window.scrollY;
        if (top <= anchor) next = i;
      });
      const doc = document.documentElement;
      if (window.scrollY + window.innerHeight >= doc.scrollHeight - 4) next = sections.length - 1;
      if (next !== active) select(next);
    }

    function schedule() {
      if (alive && visible && !document.hidden && !frame) frame = requestAnimationFrame(tick);
    }

    function tick(now) {
      frame = 0;
      if (!alive || !visible || document.hidden) { last = 0; return; }
      const dt = Math.min(0.032, (now - (last || now)) / 1000);
      last = now;

      if (navigation) {
        navigation.elapsed += dt;
        const p = clamp(navigation.elapsed / navigation.duration, 0, 1);
        const ease = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
        window.scrollTo(0, navigation.from + (navigation.to - navigation.from) * ease);
        if (p === 1) {
          navigation = null;
          host.dataset.navigating = "false";
        }
      }

      if (reduced()) {
        y = target;
        velocity = 0;
      } else {
        phase += dt;
        previousScroll = window.scrollY || 0;
        velocity += (210 * (target - y) - 26 * velocity) * dt;
        y += velocity * dt;
        if (Math.abs(target - y) < 0.1 && Math.abs(velocity) < 0.2) {
          y = target;
          velocity = 0;
        }
      }
      draw();
      const moving = Boolean(navigation) || Math.abs(target - y) > 0.1 || Math.abs(velocity) > 0.2;
      if (moving || !reduced()) schedule();
      else {
        last = 0;
        draw();
      }
    }

    function navigate(index) {
      const el = sections[index];
      if (!el) return;
      const id = SECTIONS[index].id;
      try { history.pushState(null, "", `#${id}`); } catch {}
      const navH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--nav-h")) || 74;
      const from = window.scrollY || 0;
      const to = Math.max(0, el.getBoundingClientRect().top + from - navH - 8);
      if (reduced()) {
        navigation = null;
        window.scrollTo(0, to);
        select(index, true);
        host.dataset.navigating = "false";
        return;
      }
      navigation = {
        from,
        to,
        elapsed: 0,
        duration: clamp(0.98 + Math.abs(to - from) / 2800, 0.98, 1.7)
      };
      host.dataset.navigating = "true";
      host.dataset.moving = "true";
      select(index);
      schedule();
    }

    function interrupt() {
      if (!navigation) return;
      navigation = null;
      host.dataset.navigating = "false";
      pick();
    }

    buttons.forEach((button, index) => {
      button.addEventListener("click", () => navigate(index));
      button.addEventListener("keydown", (event) => {
        let next = index;
        if (event.key === "ArrowDown") next = Math.min(buttons.length - 1, index + 1);
        else if (event.key === "ArrowUp") next = Math.max(0, index - 1);
        else if (event.key === "Home") next = 0;
        else if (event.key === "End") next = buttons.length - 1;
        else return;
        event.preventDefault();
        buttons[next].focus({ preventScroll: true });
      });
    });

    const onScroll = () => { if (!navigation) pick(); };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("wheel", interrupt, { passive: true });
    window.addEventListener("touchstart", interrupt, { passive: true });

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      last = 0;
      previousScroll = window.scrollY || 0;
      if (visible && !reduced()) schedule();
      else {
        cancelAnimationFrame(frame);
        frame = 0;
      }
    }, { threshold: 0 });
    io.observe(host);

    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onMotion = () => {
      previousScroll = window.scrollY || 0;
      if (reduced()) {
        if (navigation) window.scrollTo(0, navigation.to);
        navigation = null;
        cancelAnimationFrame(frame);
        frame = 0;
        last = 0;
        host.dataset.navigating = "false";
        select(active, true);
      } else schedule();
    };
    media.addEventListener("change", onMotion);

    syncLabels();
    requestAnimationFrame(() => {
      pick();
      select(active, true);
      host.dataset.ready = "true";
      if (!reduced()) schedule();
    });

    return {
      setLanguage() { syncLabels(); },
      update() { syncLabels(); pick(); },
      destroy() {
        alive = false;
        cancelAnimationFrame(frame);
        io.disconnect();
        media.removeEventListener("change", onMotion);
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("wheel", interrupt);
        window.removeEventListener("touchstart", interrupt);
        host.innerHTML = "";
      }
    };
  };
})(window);
