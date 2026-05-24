/**
 * 访问控制（独立加载，不依赖其他脚本）
 * 修改口令：直接改下面的 ACCESS_PASSWORD
 */
const ACCESS_PASSWORD = "class2020";
const SESSION_KEY = "classmate-map-auth";

function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.onload = resolve;
    script.onerror = () => reject(new Error("脚本加载失败: " + src));
    document.body.appendChild(script);
  });
}

function setVisible(id, visible) {
  const el = document.getElementById(id);
  if (visible) {
    el.removeAttribute("hidden");
  } else {
    el.setAttribute("hidden", "");
  }
}

async function bootApp() {
  await loadScript("js/data.js");
  await loadScript("js/map.js");
  await loadScript("js/app.js");
  await startApp();

  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.onclick = () => {
      sessionStorage.removeItem(SESSION_KEY);
      location.reload();
    };
  }
}

function verifyPassword(password) {
  return password.trim() === ACCESS_PASSWORD;
}

async function handleLogin() {
  const input = document.getElementById("auth-password");
  const errorEl = document.getElementById("auth-error");
  const submitBtn = document.getElementById("auth-submit");

  errorEl.hidden = true;
  submitBtn.disabled = true;
  submitBtn.textContent = "验证中...";

  try {
    if (!verifyPassword(input.value)) {
      errorEl.hidden = false;
      input.value = "";
      input.focus();
      return;
    }

    sessionStorage.setItem(SESSION_KEY, "ok");
    submitBtn.textContent = "加载中...";
    setVisible("auth-gate", false);
    setVisible("main-app", true);
    await bootApp();
  } catch (err) {
    setVisible("auth-gate", true);
    setVisible("main-app", false);
    errorEl.textContent = err.message || "加载失败，请刷新重试";
    errorEl.hidden = false;
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "进入";
  }
}

function initAuth() {
  const form = document.getElementById("auth-form");
  const submitBtn = document.getElementById("auth-submit");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    handleLogin();
  });

  submitBtn.addEventListener("click", (e) => {
    e.preventDefault();
    handleLogin();
  });

  if (sessionStorage.getItem(SESSION_KEY) === "ok") {
    setVisible("auth-gate", false);
    setVisible("main-app", true);
    bootApp().catch((err) => {
      const errorEl = document.getElementById("auth-error");
      setVisible("auth-gate", true);
      setVisible("main-app", false);
      errorEl.textContent = err.message || "加载失败，请刷新重试";
      errorEl.hidden = false;
    });
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initAuth);
} else {
  initAuth();
}
