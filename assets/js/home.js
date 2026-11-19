/* 首页交互：搜索、选中、复制、轨道、入场 */
(function () {
  const { translations, installPrompts } = AOCI;
  const {
    capabilities, descriptions, searchKeywords, featuredIds, foryouIds, newIds,
    palette, skillArtIds, artFor, skillAliases, firstUsePrompts
  } = AOCI;

  function getCapabilityById(id) { return AOCI.getCapabilityById(id); }
  function skillPathFor(id) { return AOCI.skillPathFor(id); }
  function buildDefaultFirstUsePrompt(capability, language) {
    return AOCI.buildDefaultFirstUsePrompt(capability, language);
  }

    const copyBtns = document.querySelectorAll(".js-copy-btn");
    const toast = document.getElementById("toast");
    const languageToggle = document.getElementById("languageToggle");
    const firstUseModal = document.getElementById("firstUseModal");
    const firstUseDialog = firstUseModal.querySelector(".dlg");
    const firstUsePromptText = document.getElementById("firstUsePromptText");
    const firstUseSkillName = document.getElementById("firstUseSkillName");
    const copyFirstUseBtn = document.getElementById("copyFirstUseBtn");
    const closeFirstUseBtn = document.getElementById("closeFirstUseBtn");
    const dismissFirstUseBtn = document.getElementById("dismissFirstUseBtn");

    let currentLanguage = "zh";
    let howLanes = null;
    let heroMarker = null;
    let foryouRail = null;
    let selectedSkillId = null;
    let firstUseModalOpen = false;
    let firstUseCloseTimer = null;
    let skillSearchQuery = "";

    function t(key) { return (translations[currentLanguage] || translations.zh)[key] || key; }

    function normalizeSearchText(value) {
      return String(value || "").toLowerCase().replace(/\s+/g, " ").trim();
    }

    function capabilitySearchBlob(capability) {
      const desc = descriptions[capability.id] || {};
      const keys = searchKeywords[capability.id] || "";
      return normalizeSearchText([
        capability.id, capability.short || "", capability.name, capability.nameEn,
        desc.zh || "", desc.en || "", keys
      ].join(" "));
    }

    function capabilityMatchesSearch(capability, query) {
      if (!query) return true;
      const blob = capabilitySearchBlob(capability);
      return query.split(/\s+/).filter(Boolean).every((token) => blob.includes(token));
    }

    function applySkillSearch() {
      const query = normalizeSearchText(skillSearchQuery);
      const clearBtn = document.getElementById("skillSearchClear");
      const meta = document.getElementById("skillSearchMeta");
      if (clearBtn) clearBtn.hidden = !query;
      let hit = 0;
      document.querySelectorAll("#capabilityList .skill-pill[data-skill-id]").forEach((el) => {
        const cap = getCapabilityById(el.getAttribute("data-skill-id"));
        const match = capabilityMatchesSearch(cap, query);
        el.classList.toggle("is-search-miss", !match);
        if (match) hit += 1;
      });
      document.querySelectorAll(".rail-slot .card[data-skill-id]").forEach((card) => {
        const cap = getCapabilityById(card.getAttribute("data-skill-id"));
        const match = capabilityMatchesSearch(cap, query);
        card.closest(".rail-slot")?.classList.toggle("is-search-miss", !match);
      });
      document.querySelectorAll(".krail-card[data-skill-id]").forEach((card) => {
        const cap = getCapabilityById(card.getAttribute("data-skill-id"));
        const match = capabilityMatchesSearch(cap, query);
        card.closest(".krail-item")?.classList.toggle("is-search-miss", !match);
      });
      if (foryouRail && foryouRail.relayout) foryouRail.relayout();
      if (!meta) return;
      if (!query) {
        meta.hidden = true;
        meta.textContent = "";
        return;
      }
      meta.hidden = false;
      meta.textContent = hit
        ? t("searchResult").replace("{n}", String(hit))
        : t("searchEmpty");
      document.querySelectorAll(".rail").forEach((rail) => updateRailNav(rail));
    }

    function focusSkillSearch() {
      const input = document.getElementById("skillSearch");
      if (!input) return;
      requestAnimationFrame(() => {
        input.focus({ preventScroll: true });
        input.select?.();
      });
    }

    function revealSearchResults() {
      if (!normalizeSearchText(skillSearchQuery)) return;
      const target = document.getElementById("foryou") || document.getElementById("skills");
      target?.scrollIntoView({ behavior: "smooth", block: "start" });
    }

        function resolveSkillSlug(raw) {
      if (!raw) return null;
      const slug = String(raw).replace(/^\/+|\/+$/g, "").split("/")[0].trim().toLowerCase();
      if (!slug || slug === "index.html" || slug === "auth.html") return null;
      return skillAliases[slug] || null;
    }

    function readSkillFromUrl() {
      try {
        const stored = sessionStorage.getItem("aoci-skill-path");
        if (stored) {
          sessionStorage.removeItem("aoci-skill-path");
          const fromStored = resolveSkillSlug(stored);
          if (fromStored) return fromStored;
        }
      } catch {}
      const params = new URLSearchParams(location.search);
      const fromQuery = resolveSkillSlug(params.get("skill") || params.get("s"));
      if (fromQuery) return fromQuery;
      if (location.hash) {
        const fromHash = resolveSkillSlug(location.hash.replace(/^#/, ""));
        if (fromHash) return fromHash;
      }
      return resolveSkillSlug(location.pathname);
    }

    function homePath() {
      const path = location.pathname || "/";
      if (/index\.html$/i.test(path)) return path;
      if (path === "/" || path === "") return "/";
      return "index.html";
    }

    function syncUrlForSkill(id, replace) {
      const params = new URLSearchParams(location.search);
      params.delete("skill");
      params.delete("s");
      if (id) params.set("s", skillPathFor(id));
      const query = params.toString();
      const hash = location.hash && !resolveSkillSlug(location.hash.replace(/^#/, "")) ? location.hash : "";
      const nextUrl = homePath() + (query ? `?${query}` : "") + hash;
      try {
        if (replace) history.replaceState({ skill: id || null }, "", nextUrl);
        else history.pushState({ skill: id || null }, "", nextUrl);
      } catch {}
    }

    function goHome(event) {
      if (event) event.preventDefault();
      try { sessionStorage.removeItem("aoci-skill-path"); } catch {}
      const onIndex = location.pathname === "/" || location.pathname === "" || /index\.html$/i.test(location.pathname);
      if (!onIndex) {
        location.href = "index.html";
        return;
      }
      selectSkill(null, { syncUrl: true, replaceUrl: true });
      document.getElementById("install")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    function getFirstUsePrompt(id) {
      const capability = getCapabilityById(id);
      if (!capability) return "";
      const custom = firstUsePrompts[id];
      if (custom && custom[currentLanguage]) return custom[currentLanguage];
      return buildDefaultFirstUsePrompt(capability, currentLanguage);
    }

    function fillFirstUseContent() {
      const capability = getCapabilityById(selectedSkillId);
      if (!capability) return false;
      firstUseSkillName.textContent = currentLanguage === "zh" ? capability.name : capability.nameEn;
      firstUsePromptText.textContent = getFirstUsePrompt(capability.id);
      return true;
    }

    function openFirstUseModal() {
      if (!fillFirstUseContent()) return;
      clearTimeout(firstUseCloseTimer);
      firstUseModalOpen = true;
      firstUseModal.classList.remove("dlg-out");
      firstUseModal.setAttribute("aria-hidden", "false");
      void firstUseModal.offsetWidth;
      firstUseModal.classList.add("dlg-in");
      document.body.style.overflow = "hidden";
      AOCI.paintIcons();
      firstUseDialog?.focus({ preventScroll: true });
    }

    function closeFirstUseModal() {
      if (!firstUseModalOpen && !firstUseModal.classList.contains("dlg-in")) return;
      firstUseModalOpen = false;
      firstUseModal.classList.remove("dlg-in");
      firstUseModal.classList.add("dlg-out");
      firstUseModal.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      clearTimeout(firstUseCloseTimer);
      firstUseCloseTimer = setTimeout(() => firstUseModal.classList.remove("dlg-out"), 160);
    }

    const actionDock = document.getElementById("actionDock");
    const dockName = document.getElementById("dockName");
    const dockCheck = document.getElementById("dockCheck");
    const dockDesc = document.getElementById("dockDesc");
    const dockPath = document.getElementById("dockPath");
    const dockTags = document.getElementById("dockTags");
    const dockPrompt = document.getElementById("dockPrompt");
    const dockAuth = document.getElementById("dockAuth");
    const dockExpandLabel = document.getElementById("dockExpandLabel");

    const skillSheet = AOCI.mountSmoothDrawer({
      sheet: actionDock,
      backdrop: document.getElementById("sheetBackdrop"),
      details: document.getElementById("dockDetails"),
      expandBtn: document.getElementById("dockExpand"),
      expandLabel: dockExpandLabel,
      detailsLabel: () => t("sheetDetails"),
      hideLabel: () => t("sheetHide"),
      onClose: () => selectSkill(null, { syncUrl: true, replaceUrl: true })
    });

    function fillDockContent(cap) {
      dockName.textContent = currentLanguage === "zh" ? cap.name : cap.nameEn;
      dockDesc.textContent = descriptions[cap.id] ? descriptions[cap.id][currentLanguage] : "";
      dockPath.textContent = cap.short ? `/${cap.short}` : `/${cap.id}`;
      const chips = [];
      chips.push(cap.pro ? t("tagPro") : t("tagFree"));
      if (cap.limit && !cap.pro) chips.push(t("tagLimit"));
      dockTags.innerHTML = chips.map((label) => `<span class="tag ${label === t("tagPro") ? "tag-pro" : label === t("tagLimit") ? "tag-limit" : "tag-free"}">${label}</span>`).join("");
      dockPrompt.textContent = getFirstUsePrompt(cap.id);
      if (dockAuth) {
        dockAuth.hidden = !cap.pro;
      }
    }

    function syncActionDock() {
      const cap = getCapabilityById(selectedSkillId);
      if (!cap) {
        skillSheet.close();
        return;
      }
      fillDockContent(cap);
      dockCheck.classList.remove("is-on");
      if (skillSheet.snap() === "closed") skillSheet.open("peek");
      try { AOCI.paintIcons(); } catch {}
    }

    function syncSelectionUI() {
      document.querySelectorAll("[data-skill-id]").forEach((el) => {
        const on = el.getAttribute("data-skill-id") === selectedSkillId;
        el.classList.toggle("is-selected", on);
        if (el.matches("button, .skill-pill")) {
          el.setAttribute("aria-pressed", on ? "true" : "false");
        }
        const titleBtn = el.querySelector(".card-select, .krail-title");
        if (titleBtn) titleBtn.setAttribute("aria-pressed", on ? "true" : "false");
        const status = el.querySelector(".card-foot-status");
        if (status) status.textContent = on ? t("selected") : t("viewCard");
      });
    }

    function selectSkill(id, options = {}) {
      const { syncUrl = true, replaceUrl = true, scroll = false } = options;
      selectedSkillId = getCapabilityById(id) ? id : null;
      closeFirstUseModal();
      syncSelectionUI();
      syncActionDock();
      if (syncUrl) syncUrlForSkill(selectedSkillId, replaceUrl);
      if (scroll && selectedSkillId) {
        document.getElementById("capabilitiesTitle")?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }

    function renderCapabilities() {
      const list = document.getElementById("capabilityList");
      if (!list) return;
      list.innerHTML = capabilities.map((capability) => {
        const selected = capability.id === selectedSkillId;
        const name = currentLanguage === "zh" ? capability.name : capability.nameEn;
        const pro = capability.pro
          ? `<a href="auth.html" class="pill-pro" onclick="event.stopPropagation()">PRO</a>`
          : "";
        const limit = (!capability.pro && capability.limit)
          ? `<span class="pill-limit">Limit</span>`
          : "";
        return `<button type="button" class="skill-pill ${selected ? "is-selected" : ""}" data-skill-id="${capability.id}" aria-pressed="${selected ? "true" : "false"}">
          <i data-lucide="${capability.icon}" style="width:14px;height:14px"></i>
          <span>${name}</span>${pro}${limit}
        </button>`;
      }).join("");
      applySkillSearch();
      try { AOCI.paintIcons(); } catch {}
    }

    function tagsHTML(capability, featured) {
      const tags = [];
      if (featured && newIds.includes(capability.id)) tags.push(`<span class="tag tag-new">${t("tagNew")}</span>`);
      tags.push(capability.pro
        ? `<span class="tag tag-pro">${t("tagPro")}</span>`
        : `<span class="tag tag-free">${t("tagFree")}</span>`);
      if (!capability.pro && capability.limit) tags.push(`<span class="tag tag-limit">${t("tagLimit")}</span>`);
      return tags.join("");
    }

    function cardHTML(capability, index, featured) {
      const selected = capability.id === selectedSkillId;
      const [c1, c2] = palette[index % palette.length];
      const name = currentLanguage === "zh" ? capability.name : capability.nameEn;
      const desc = descriptions[capability.id] ? descriptions[capability.id][currentLanguage] : "";
      const path = capability.short ? `/${capability.short}` : `/${capability.id}`;
      const footRight = capability.pro
        ? `<a class="pro-link" href="auth.html">${t("goAuth")} ↗</a>`
        : `<span class="card-foot-status">${selected ? t("selected") : t("viewCard")}</span>`;
      // 卡片本身不再声明 role=button：PRO 卡里嵌着真实 <a>，按钮角色套链接是无效的 ARIA 嵌套。
      // 选择能力改由标题上的真实 <button> 承担，键盘 Enter/Space 走原生行为，语义与可达性都对。
      // 横滑轨道（featured=true）挂 16:9 <img>；目录网格只出图标条，不用 1:1 硬裁横条。
      const hasOwnArt = featured && skillArtIds.has(capability.id);
      const preview = featured
        ? `<div class="card-preview has-art ${hasOwnArt ? "has-skill-art" : ""}">
            <img class="preview-art" src="${artFor(capability, index)}" alt="" loading="lazy" decoding="async" width="1280" height="720">
            <div class="tags">${tagsHTML(capability, featured)}</div>
            <div class="preview-icon"><i data-lucide="${capability.icon}" style="width:17px;height:17px"></i></div>
            <span class="preview-avatar" aria-hidden="true">${capability.icon === "github" ? "GH" : name.slice(0, 1)}</span>
          </div>`
        : `<div class="card-preview">
            <div class="tags">${tagsHTML(capability, featured)}</div>
            <div class="preview-icon"><i data-lucide="${capability.icon}" style="width:17px;height:17px"></i></div>
          </div>`;
      return `<div class="card ${featured ? "card-featured" : ""} ${capability.pro ? "is-pro" : ""} ${selected ? "is-selected" : ""}"
        data-skill-id="${capability.id}"
        style="--c1:${c1};--c2:${c2}">
        ${preview}
        <div class="card-body">
          <h3><button type="button" class="card-select" aria-pressed="${selected ? "true" : "false"}">${name}</button></h3>
          <p>${desc}</p>
          <div class="card-foot"><code>${path}</code>${footRight}</div>
        </div>
      </div>`;
    }

    function renderIconWall() {
      // 与 Skillry 一致：每条轨道渲染两组相同图，位移 -50% 形成无缝滚动。
      // 1:1 技能方图走 icon-tile-skill（原比例、无滤镜）；手绘点缀节奏；整墙装饰性，aria-hidden。
      const skillThumbs = [...skillArtIds].map((id) =>
        `<div class="icon-tile icon-tile-skill"><img src="assets/skills/${id}/1x1.png" alt="" loading="lazy" decoding="async"></div>`
      );
      const drawn = ["02", "03", "04", "06", "08", "10", "11", "13"];
      const drawnTiles = drawn.map((n) => `<div class="icon-tile"><img src="assets/hero-logos/${n}.webp" alt="" loading="lazy" decoding="async"></div>`);
      const mixed = [];
      for (let i = 0; i < skillThumbs.length; i++) {
        mixed.push(skillThumbs[i]);
        if (i % 3 === 2) mixed.push(drawnTiles[(i / 3 | 0) % drawnTiles.length]);
      }
      const tiles = mixed.join("");
      const wallA = document.getElementById("iconWallA");
      const wallB = document.getElementById("iconWallB");
      if (!wallA || !wallB) return;
      wallA.innerHTML = `<div class="icon-group">${tiles}</div><div class="icon-group" aria-hidden="true">${tiles}</div>`;
      wallB.innerHTML = `<div class="icon-group">${tiles}</div><div class="icon-group" aria-hidden="true">${tiles}</div>`;
      const wall = document.querySelector(".icon-wall-wrap");
      if (wall && "IntersectionObserver" in window && !wall.dataset.pauseBound) {
        wall.dataset.pauseBound = "1";
        const io = new IntersectionObserver((entries) => {
          entries.forEach((entry) => wall.classList.toggle("is-paused", !entry.isIntersecting));
        }, { threshold: 0 });
        io.observe(wall);
      }
    }

    // 骨架屏：逐块复刻真实卡片结构，避免加载期布局跳动（CLS）
    // rail=true 是横滑轨道（有大图预览）；false 是目录网格（只有紧凑图标条）
    function skeletonCard(rail) {
      const head = rail
        ? `<div class="sk-preview"><span class="sk-dot"></span><span class="sk-avatar"></span></div>`
        : `<div class="sk-preview sk-preview-slim"><span class="sk-dot"></span><span class="sk-pill"></span></div>`;
      const card = `<div class="sk-card" aria-hidden="true">
        ${head}
        <div class="sk-body">
          <span class="sk-line title"></span>
          <span class="sk-line desc"></span><span class="sk-line desc short"></span>
          <div class="sk-foot"><span class="sk-pill"></span><span class="sk-pill right"></span></div>
        </div>
      </div>`;
      return rail ? `<div class="rail-slot">${card}</div>` : card;
    }
    function paintSkeletons() {}

    function featuredDeckCards() {
      return featuredIds.map((id) => getCapabilityById(id)).filter(Boolean).map((cap, index) => {
        const path = cap.short ? `/${cap.short}` : `/${cap.id}`;
        const access = cap.pro ? t("tagPro") : cap.limit ? t("tagLimit") : t("tagFree");
        return {
          id: cap.id,
          title: currentLanguage === "zh" ? cap.name : cap.nameEn,
          // 牌面：路径作副标，权限放右侧强调色
          subtitle: path,
          image: skillArtIds.has(cap.id) ? `assets/skills/${cap.id}/1x1.png` : artFor(cap, index),
          detailImage: artFor(cap, index),
          description: descriptions[cap.id] ? descriptions[cap.id][currentLanguage] : "",
          price: access,
          specs: [
            { label: currentLanguage === "zh" ? "路径" : "Path", value: path },
            { label: currentLanguage === "zh" ? "权限" : "Access", value: access },
            { label: currentLanguage === "zh" ? "标记" : "Flag", value: cap.limit ? t("tagLimit") : (newIds.includes(cap.id) ? t("tagNew") : "—") }
          ]
        };
      });
    }

    let featuredDeck = null;
    function renderHowLanes() {
      const root = document.getElementById("howLanes");
      if (!root || !AOCI.mountAIAgentLanes) return;
      if (howLanes) {
        howLanes.update();
        return;
      }
      howLanes = AOCI.mountAIAgentLanes(root, {
        getRun: () => (AOCI.howRun[currentLanguage] || AOCI.howRun.zh),
        getCopy: () => (AOCI.howLaneCopy[currentLanguage] || AOCI.howLaneCopy.zh)
      });
    }

    function renderFeaturedDeck() {
      const root = document.getElementById("featuredDeck");
      if (!root || !AOCI.mountCardStack) return;
      const payload = featuredDeckCards();
      if (featuredDeck) {
        featuredDeck.update(payload);
        return;
      }
      featuredDeck = AOCI.mountCardStack(root, {
        cards: payload,
        accent: getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() || "#545f2a",
        hintLabel: () => t("deckHint"),
        actionLabel: () => t("copyPrompt"),
        onAction: (card) => {
          selectSkill(card.id, { syncUrl: true, replaceUrl: true });
          copyInstallPrompt();
        }
      });
    }

    function foryouItems() {
      return foryouIds.map((id) => getCapabilityById(id)).filter(Boolean).map((cap, index) => {
        const badge = newIds.includes(cap.id) ? t("tagNew")
          : cap.pro ? t("tagPro")
          : cap.limit ? t("tagLimit") : "";
        return {
          id: cap.id,
          title: currentLanguage === "zh" ? cap.name : cap.nameEn,
          subtitle: currentLanguage === "zh" ? cap.nameEn : cap.name,
          image: artFor(cap, index),
          badge,
          description: descriptions[cap.id] ? descriptions[cap.id][currentLanguage] : "",
          path: cap.short ? `/${cap.short}` : `/${cap.id}`,
          selected: cap.id === selectedSkillId
        };
      });
    }

    function renderRails() {
      const foryouEl = document.getElementById("foryouGrid");
      if (foryouEl && AOCI.mountCarouselCards) {
        const items = foryouItems();
        if (foryouRail) foryouRail.update(items);
        else {
          foryouRail = AOCI.mountCarouselCards(foryouEl, {
            items,
            startIndex: 2,
            prevEl: document.getElementById("foryouPrev"),
            nextEl: document.getElementById("foryouNext"),
            countEl: document.getElementById("foryouCount"),
            onSelect: (item) => selectSkill(item.id, { syncUrl: true, replaceUrl: true })
          });
        }
        const scroller = foryouEl.querySelector("[data-krail-scroller]");
        if (scroller) scroller.setAttribute("aria-label", t("foryouTitle"));
        foryouEl.setAttribute("aria-busy", "false");
      }
      observeReveals();
      applySkillSearch();
      try { AOCI.paintIcons(); } catch {}
      document.querySelectorAll(".rail").forEach((rail) => updateRailNav(rail));
    }

    // 进视口入场：轨/目录/步骤/区块各播一次；揭示 section 时连带子轨/网格，避免子元素高度为 0 时 IO 永不触发
    const revealedNodes = new WeakSet();
    function markRevealed(el) {
      if (!el || revealedNodes.has(el)) {
        el?.classList.add("is-revealed");
        return;
      }
      revealedNodes.add(el);
      el.classList.add("is-revealed");
      if (el.classList.contains("section")) {
        el.querySelectorAll(".rail, .grid-catalog, .steps").forEach((child) => markRevealed(child));
      }
    }
    const revealObserver = ("IntersectionObserver" in window) ? new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting || revealedNodes.has(entry.target)) return;
        markRevealed(entry.target);
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0, rootMargin: "0px 0px -8% 0px" }) : null;

    function observeReveals() {
      const run = () => {
        const nodes = document.querySelectorAll(".section, .rail, .grid-catalog, .steps");
        if (!revealObserver) {
          nodes.forEach((el) => markRevealed(el));
          return;
        }
        const vh = window.innerHeight || 0;
        nodes.forEach((el) => {
          if (revealedNodes.has(el)) {
            el.classList.add("is-revealed");
            return;
          }
          const rect = el.getBoundingClientRect();
          const visible = rect.height > 0 && rect.bottom > 0 && rect.top < vh;
          if (visible) markRevealed(el);
          else revealObserver.observe(el);
        });
      };
      requestAnimationFrame(() => {
        run();
        // 布局二次回扫：封面图/字体就位后高度才准
        setTimeout(run, 120);
      });
    }

    /* ── 横滑轨道控制 ──
       轨道是 overflow-x:auto 的原生滚动容器，但没有可见滚动条。
       左右只靠按钮；滚轮不转横向，避免 hover 轨道时把页面上下滚变成左右滑。 */
    function railStep(rail) {
      const slot = rail.querySelector(".rail-slot") || rail.querySelector(".card");
      if (!slot) return 240;
      const gap = parseFloat(getComputedStyle(rail).columnGap) || 12;
      return slot.getBoundingClientRect().width + gap;
    }
    function updateRailNav(rail) {
      const wrap = rail.closest(".rail-wrap");
      if (!wrap) return;
      const prev = wrap.querySelector(".rail-nav-prev");
      const next = wrap.querySelector(".rail-nav-next");
      const max = rail.scrollWidth - rail.clientWidth;
      // 轨道左右已无内边距，scrollLeft 的有效区间就是 [0, max]，直接比较即可。
      // 留 1px 容差：亚像素布局下 scrollLeft 可能是 0.5 这类小数。
      const left = rail.scrollLeft;
      const atStart = left <= 1;
      const atEnd = max <= 1 || left >= max - 1;
      if (prev) prev.disabled = atStart;
      if (next) next.disabled = atEnd;
    }
    function scrollRailBy(rail, delta) {
      rail.scrollBy({ left: delta, behavior: "smooth" });
    }
    document.addEventListener("click", (event) => {
      const prevBtn = event.target.closest("[data-rail-prev]");
      const nextBtn = event.target.closest("[data-rail-next]");
      if (!prevBtn && !nextBtn) return;
      const id = (prevBtn || nextBtn).getAttribute(prevBtn ? "data-rail-prev" : "data-rail-next");
      const rail = document.getElementById(id);
      if (!rail) return;
      const step = railStep(rail);
      scrollRailBy(rail, prevBtn ? -step : step);
    });
    // 轨道滚动时同步按钮状态
    document.querySelectorAll(".rail").forEach((rail) => {
      rail.addEventListener("scroll", () => updateRailNav(rail), { passive: true });
    });
    // 视口变化会改变可滚动距离，重新评估按钮状态
    let railResizeTimer = null;
    window.addEventListener("resize", () => {
      clearTimeout(railResizeTimer);
      railResizeTimer = setTimeout(() => {
        document.querySelectorAll(".rail").forEach((rail) => updateRailNav(rail));
      }, 120);
    });
    // 禁止滚轮驱动轨道左右滑：纵向滚轮继续交给页面；横向/Shift+滚轮在轨道上吞掉
    document.querySelectorAll(".rail").forEach((rail) => {
      rail.addEventListener("wheel", (event) => {
        const horizontal = Math.abs(event.deltaX) > Math.abs(event.deltaY) || event.shiftKey;
        if (!horizontal) return;
        event.preventDefault();
      }, { passive: false });
    });

    // 卡片选择：点击卡片空白区域，或点击标题上的真实 <button>（键盘 Enter/Space 走原生行为）
    document.addEventListener("click", (event) => {
      if (event.target.closest("a")) return;
      const card = event.target.closest("[data-skill-id]");
      if (!card) return;
      const id = card.getAttribute("data-skill-id");
      selectSkill(selectedSkillId === id ? null : id, { syncUrl: true, replaceUrl: true });
    });

    // 安装指令：URL 单独着色 + 整条写入 title，超长时悬停可见完整内容
    function renderInstallPrompt(language) {
      const text = installPrompts[language];
      const promptEl = document.getElementById("installPromptText");
      const url = "https://github.com/CCharlie-xiu/aoci-wuch.git";
      const at = text.indexOf(url);
      promptEl.textContent = "";
      if (at >= 0) {
        promptEl.appendChild(document.createTextNode(text.slice(0, at)));
        const urlEl = document.createElement("span");
        urlEl.className = "install-url";
        urlEl.textContent = url;
        promptEl.appendChild(urlEl);
        promptEl.appendChild(document.createTextNode(text.slice(at + url.length)));
      } else {
        promptEl.textContent = text;
      }
      const box = document.getElementById("installTextBox");
      if (box) box.title = text;
    }

    function setLanguage(language, options = {}) {
      const { render = true } = options;
      currentLanguage = language;
      document.documentElement.lang = language === "zh" ? "zh-CN" : "en";
      document.querySelectorAll("[data-i18n]").forEach((element) => {
        element.textContent = translations[language][element.dataset.i18n];
      });
      document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
        const key = element.dataset.i18nPlaceholder;
        if (translations[language][key]) element.setAttribute("placeholder", translations[language][key]);
      });
      document.querySelectorAll("[data-i18n-title]").forEach((element) => {
        const key = element.dataset.i18nTitle;
        if (translations[language][key]) element.setAttribute("title", translations[language][key]);
      });
      document.querySelectorAll("[data-i18n-html]").forEach((element) => {
        const key = element.dataset.i18nHtml;
        if (translations[language][key]) element.innerHTML = translations[language][key];
      });
      if (AOCI.mountMarkerText) {
        if (heroMarker) heroMarker.destroy();
        heroMarker = AOCI.mountMarkerText(document.getElementById("heroTitle"));
      }
      document.getElementById("languageCurrent").textContent = language === "zh" ? "中" : "EN";
      document.getElementById("languageNext").textContent = language === "zh" ? "EN" : "中";
      AOCI.applyTheme?.(AOCI.readTheme?.() || "light", { persist: false });
      renderInstallPrompt(language);
      // 关闭按钮的无障碍标签跟随界面语言
      if (closeFirstUseBtn) closeFirstUseBtn.setAttribute("aria-label", language === "zh" ? "关闭" : "Close");
      document.title = language === "zh" ? "至关重要 — 给 AI 一套值得复用的方法" : "AOCI — Reusable methods for your AI";
      document.querySelector('meta[name="description"]').content = language === "zh"
        ? "至关重要：一套可安装到 AI 编码助手中的个人能力库。"
        : "AOCI: a personal capability library for AI coding assistants.";
      if (render) {
        renderRails();
        renderFeaturedDeck();
        renderHowLanes();
        renderCapabilities();
      }
      syncActionDock();
      if (firstUseModalOpen) fillFirstUseContent();
      try { localStorage.setItem("aoci-language", language); } catch {}
    }

    async function writeClipboard(text) {
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
    }

    function setCopyButtonState(copied) {
      copyBtns.forEach((btn) => {
        const label = btn.querySelector(".js-copy-label");
        const icon = btn.querySelector(".js-copy-icon");
        if (label) label.textContent = copied ? t("copied") : t("copyAgain");
        if (icon) icon.setAttribute("data-lucide", copied ? "check" : "copy");
      });
      // 行内实时校验：就近操作条上即时反馈，无需等 toast
      if (selectedSkillId) dockCheck.classList.toggle("is-on", copied);
      AOCI.paintIcons();
    }

    async function copyInstallPrompt() {
      const text = document.getElementById("installPromptText").textContent.trim();
      await writeClipboard(text);

      if (selectedSkillId) {
        showToast(t("copiedWithSkillToast"));
        openFirstUseModal();
      } else {
        showToast(t("copiedToast"));
      }

      setCopyButtonState(true);
      clearTimeout(copyInstallPrompt.timer);
      copyInstallPrompt.timer = setTimeout(() => setCopyButtonState(false), 2000);
    }

    async function copyFirstUsePrompt() {
      if (!selectedSkillId) return;
      await writeClipboard(getFirstUsePrompt(selectedSkillId));
      showToast(t("firstUseCopiedToast"));
      // 行内实时校验：按钮就地变「已复制」，2s 后复原
      const original = copyFirstUseBtn.textContent;
      copyFirstUseBtn.textContent = t("copied");
      copyFirstUseBtn.classList.add("is-done");
      clearTimeout(copyFirstUsePrompt.timer);
      copyFirstUsePrompt.timer = setTimeout(() => {
        copyFirstUseBtn.textContent = original;
        copyFirstUseBtn.classList.remove("is-done");
      }, 2000);
    }

    function showToast(msg) {
      document.getElementById("toast-message").textContent = msg;
      toast.classList.add("is-visible");
      clearTimeout(showToast.timer);
      showToast.timer = setTimeout(() => toast.classList.remove("is-visible"), 2600);
    }

    const skillSearchInput = document.getElementById("skillSearch");
    const skillSearchClear = document.getElementById("skillSearchClear");
    const skillSearchKbd = document.querySelector(".nav-search-kbd");
    let searchRevealTimer = null;
    if (skillSearchKbd) {
      const isApple = /Mac|iPhone|iPad|iPod/i.test(navigator.platform || "") || /Mac OS/i.test(navigator.userAgent || "");
      skillSearchKbd.textContent = isApple ? "⌘K" : "Ctrl K";
    }
    skillSearchInput?.addEventListener("input", () => {
      skillSearchQuery = skillSearchInput.value || "";
      applySkillSearch();
      clearTimeout(searchRevealTimer);
      if (normalizeSearchText(skillSearchQuery)) {
        searchRevealTimer = setTimeout(revealSearchResults, 280);
      }
    });
    skillSearchClear?.addEventListener("click", () => {
      skillSearchQuery = "";
      if (skillSearchInput) skillSearchInput.value = "";
      applySkillSearch();
      skillSearchInput?.focus({ preventScroll: true });
    });
    languageToggle.addEventListener("click", () => setLanguage(currentLanguage === "zh" ? "en" : "zh"));
    if (AOCI.mountSwitchButton) AOCI.mountSwitchButton(document.getElementById("themeSwitch"));
    function jumpToInstall() {
      const bar = document.querySelector(".install-bar");
      document.getElementById("install")?.scrollIntoView({ behavior: "smooth", block: "center" });
      if (!bar) return;
      bar.classList.remove("is-flash");
      void bar.offsetWidth;
      bar.classList.add("is-flash");
      bar.addEventListener("animationend", () => bar.classList.remove("is-flash"), { once: true });
    }
    copyBtns.forEach((btn) => btn.addEventListener("click", copyInstallPrompt));
    document.getElementById("jumpInstallBtn")?.addEventListener("click", jumpToInstall);
    document.getElementById("dockClear").addEventListener("click", () => selectSkill(null, { syncUrl: true, replaceUrl: true }));
    document.querySelectorAll("[data-home]").forEach((el) => {
      el.addEventListener("click", goHome);
    });
    copyFirstUseBtn.addEventListener("click", copyFirstUsePrompt);
    closeFirstUseBtn.addEventListener("click", closeFirstUseModal);
    dismissFirstUseBtn.addEventListener("click", closeFirstUseModal);
    firstUseModal.addEventListener("click", (event) => { if (event.target === firstUseModal) closeFirstUseModal(); });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        if (firstUseModalOpen) { closeFirstUseModal(); return; }
        if (selectedSkillId && skillSheet.isExpanded()) { skillSheet.open("peek"); return; }
        if (selectedSkillId) { selectSkill(null, { syncUrl: true, replaceUrl: true }); return; }
        if (skillSearchQuery || document.activeElement === skillSearchInput) {
          skillSearchQuery = "";
          if (skillSearchInput) skillSearchInput.value = "";
          applySkillSearch();
          skillSearchInput?.blur();
        }
        return;
      }
      const meta = event.metaKey || event.ctrlKey;
      if (meta && (event.key === "k" || event.key === "K")) {
        const tag = (event.target && event.target.tagName) || "";
        if (tag === "INPUT" || tag === "TEXTAREA" || event.target?.isContentEditable) {
          if (event.target !== skillSearchInput) return;
        }
        event.preventDefault();
        focusSkillSearch();
      }
    });
    window.addEventListener("popstate", () => {
      const fromState = history.state && history.state.skill;
      selectSkill(fromState || readSkillFromUrl(), { syncUrl: false });
    });

    try {
      if (localStorage.getItem("aoci-language") === "en") currentLanguage = "en";
    } catch {}

    /* 主模块幻灯片吸附：同步导航高度，点击锚点居中，滚动时高亮当前段 */
    const snapPanels = ["#install", "#foryou", "#featured", "#skills", "#how"].map((sel) => document.querySelector(sel)).filter(Boolean);
    const navLinks = [...document.querySelectorAll(".nav-links a[href^='#']")];
    function syncNavHeight() {
      const nav = document.querySelector(".nav");
      if (!nav) return;
      document.documentElement.style.setProperty("--nav-h", `${Math.ceil(nav.getBoundingClientRect().height)}px`);
    }
    function scrollPanelIntoView(el, smooth = true) {
      if (!el) return;
      el.scrollIntoView({ block: "center", inline: "nearest", behavior: smooth && !window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "smooth" : "auto" });
    }
    function setActiveNav(id) {
      navLinks.forEach((link) => {
        const match = link.getAttribute("href") === `#${id}`;
        link.classList.toggle("is-active", match);
        if (match) link.setAttribute("aria-current", "true");
        else link.removeAttribute("aria-current");
      });
    }
    syncNavHeight();
    window.addEventListener("resize", syncNavHeight, { passive: true });
    document.querySelector(".nav-links")?.addEventListener("click", (event) => {
      const link = event.target.closest("a[href^='#']");
      if (!link) return;
      const id = link.getAttribute("href").slice(1);
      const panel = document.getElementById(id);
      if (!panel) return;
      event.preventDefault();
      history.pushState(null, "", `#${id}`);
      scrollPanelIntoView(panel, true);
      setActiveNav(id);
    });
    if ("IntersectionObserver" in window && snapPanels.length) {
      const io = new IntersectionObserver((entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible?.target?.id) return;
        if (["foryou", "featured", "skills", "how"].includes(visible.target.id)) setActiveNav(visible.target.id);
        else setActiveNav("");
      }, { root: null, threshold: [0.35, 0.55, 0.7], rootMargin: `-${Math.max(48, 0)}px 0px -28% 0px` });
      snapPanels.forEach((panel) => io.observe(panel));
    }

    const bootSkill = readSkillFromUrl();
    if (AOCI.mountBackgroundPaths) {
      AOCI.mountBackgroundPaths(document.getElementById("heroPaths"), {
        host: document.getElementById("install")
      });
    }
    renderIconWall();
    paintSkeletons();
    setLanguage(currentLanguage, { render: false });
    renderRails();
    const fontsReady = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    const settle = () => {
      renderFeaturedDeck();
      renderHowLanes();
      renderCapabilities();
      syncNavHeight();
      if (bootSkill) selectSkill(bootSkill, { syncUrl: true, replaceUrl: true, scroll: true });
      const hashId = (location.hash || "").replace(/^#/, "");
      if (hashId && document.getElementById(hashId) && !bootSkill) {
        requestAnimationFrame(() => scrollPanelIntoView(document.getElementById(hashId), false));
      }
    };
    Promise.race([fontsReady, new Promise((r) => setTimeout(r, 700))]).then(settle);
})();
