/* 订阅授权：激活、安装命令、视图切换 */
(function () {
  const AUTH_API = "https://aoci-auth.aoci-wuch.workers.dev";
  const STORAGE_KEY = "aoci-code";

  const form = document.getElementById("activateForm");
  const codeInput = document.getElementById("codeInput");
  const purposeInput = document.getElementById("purposeInput");
  const activateBtn = document.getElementById("activateBtn");
  const activateText = document.getElementById("activateText");
  const formView = document.getElementById("formView");
  const successView = document.getElementById("successView");
  const message = document.getElementById("message");
  let activeCode = "";
  let currentOs = /Windows/i.test(navigator.userAgent) ? "win" : "unix";

  if (codeInput) codeInput.value = localStorage.getItem(STORAGE_KEY) || "";
  if (window.AOCI && AOCI.mountSwitchButton) AOCI.mountSwitchButton(document.getElementById("themeSwitch"));

  function setMessage(text) {
    if (!message) return;
    message.textContent = text || "";
    message.classList.toggle("is-on", Boolean(text));
  }

  function showToast(text) {
    const toast = document.getElementById("toast");
    const label = document.getElementById("toast-message") || document.getElementById("toastMessage");
    if (!toast || !label) return;
    label.textContent = text;
    toast.classList.add("is-visible");
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => toast.classList.remove("is-visible"), 1800);
  }

  function swapView(from, to) {
    from.classList.add("is-leaving");
    setTimeout(() => {
      from.classList.add("hidden");
      from.classList.remove("is-leaving");
      to.classList.add("is-entering");
      to.classList.remove("hidden");
      requestAnimationFrame(() => requestAnimationFrame(() => to.classList.remove("is-entering")));
    }, 220);
  }

  async function post(path, body) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 12000);
    let res;
    try {
      res = await fetch(AUTH_API + path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: ctrl.signal
      });
    } catch (err) {
      throw new Error("服务暂时不可用，请稍后重试");
    } finally {
      clearTimeout(timer);
    }
    const data = await res.json().catch(() => ({ ok: false, error: "服务暂时不可用" }));
    if (!data.ok) throw new Error(data.error || "请求失败");
    return data;
  }

  function renderCommand() {
    const el = document.getElementById("licenseCmd");
    if (!el) return;
    el.textContent = currentOs === "win"
      ? `powershell -NoProfile -ExecutionPolicy Bypass -Command "irm '${AUTH_API}/install.ps1?code=${activeCode}' | iex"`
      : `curl -fsSL "${AUTH_API}/install.sh?code=${activeCode}" | sh`;
    document.querySelectorAll(".os-tab").forEach((btn) => {
      btn.classList.toggle("is-on", btn.dataset.os === currentOs);
    });
  }

  form?.addEventListener("submit", async (event) => {
    event.preventDefault();
    activateBtn.disabled = true;
    activateText.textContent = "验证中…";
    setMessage("");
    try {
      const code = codeInput.value.trim().toUpperCase();
      const data = await post("/activate", { code, purpose: purposeInput.value.trim() });
      activeCode = data.code;
      localStorage.setItem(STORAGE_KEY, activeCode);
      const expires = new Date(data.expiresAt).toLocaleDateString("zh-CN");
      document.getElementById("planInfo").textContent = `套餐 ${data.plan} · 有效期至 ${expires}`;
      document.getElementById("successTitle").textContent = data.bound ? "订阅有效" : "授权成功";
      document.getElementById("boundNotice").classList.toggle("is-on", Boolean(data.bound));
      document.querySelector(".status-pip")?.classList.add("is-ok");
      renderCommand();
      swapView(formView, successView);
      AOCI.paintIcons();
    } catch (err) {
      setMessage(err.message);
    } finally {
      activateBtn.disabled = false;
      activateText.textContent = "验证并授权";
    }
  });

  document.querySelectorAll(".os-tab").forEach((btn) => {
    btn.addEventListener("click", () => {
      currentOs = btn.dataset.os;
      renderCommand();
    });
  });

  document.getElementById("copyCmdBtn")?.addEventListener("click", async () => {
    const text = document.getElementById("licenseCmd").textContent;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const area = document.createElement("textarea");
      area.value = text;
      document.body.appendChild(area);
      area.select();
      document.execCommand("copy");
      document.body.removeChild(area);
    }
    showToast("命令已复制，粘贴到终端运行即可");
  });

  document.getElementById("changeCodeBtn")?.addEventListener("click", () => {
    codeInput.value = "";
    swapView(successView, formView);
    setTimeout(() => codeInput.focus(), 280);
  });
})();
