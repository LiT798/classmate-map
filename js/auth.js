/**
 * 访问控制
 * 修改口令：运行 python -c "import hashlib; print(hashlib.sha256('你的新口令'.encode()).hexdigest())"
 * 将输出的 hash 填入 PASSWORD_HASH
 */
const AUTH_CONFIG = {
  PASSWORD_HASH: "c0f2cde8a038760cffe074ede219f48eacb3b3cc680d37daa3997738f283fea1",
  SESSION_KEY: "classmate-map-auth"
};

const Auth = {
  async hashPassword(password) {
    if (!window.crypto || !window.crypto.subtle) {
      throw new Error("浏览器不支持安全验证，请使用 HTTPS 访问");
    }
    const data = new TextEncoder().encode(password);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  },

  isAuthenticated() {
    return sessionStorage.getItem(AUTH_CONFIG.SESSION_KEY) === "ok";
  },

  grantAccess() {
    sessionStorage.setItem(AUTH_CONFIG.SESSION_KEY, "ok");
  },

  revokeAccess() {
    sessionStorage.removeItem(AUTH_CONFIG.SESSION_KEY);
    location.reload();
  },

  async showApp() {
    document.getElementById("auth-gate").hidden = true;
    document.getElementById("main-app").hidden = false;
    await startApp();
  },

  showGate() {
    document.getElementById("auth-gate").hidden = false;
    document.getElementById("main-app").hidden = true;
  },

  async verify(password) {
    const hash = await this.hashPassword(password);
    return hash === AUTH_CONFIG.PASSWORD_HASH;
  },

  init() {
    const form = document.getElementById("auth-form");
    const input = document.getElementById("auth-password");
    const errorEl = document.getElementById("auth-error");
    const submitBtn = form.querySelector('button[type="submit"]');

    if (this.isAuthenticated()) {
      this.showApp().catch((err) => {
        errorEl.textContent = err.message || "加载失败，请刷新重试";
        errorEl.hidden = false;
        this.showGate();
      });
      return;
    }

    this.showGate();

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      errorEl.hidden = true;
      errorEl.textContent = "口令错误，请重试";
      submitBtn.disabled = true;
      submitBtn.textContent = "验证中...";

      try {
        const ok = await this.verify(input.value);
        if (ok) {
          this.grantAccess();
          submitBtn.textContent = "加载中...";
          await this.showApp();
        } else {
          errorEl.hidden = false;
          input.value = "";
          input.focus();
        }
      } catch (err) {
        errorEl.textContent = err.message || "验证失败，请刷新重试";
        errorEl.hidden = false;
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "进入";
      }
    });
  }
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => Auth.init());
} else {
  Auth.init();
}
