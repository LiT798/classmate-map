/**
 * 主应用逻辑：搜索、筛选、列表、统计
 */
const App = {
  filteredList: [],
  activeId: null,

  init() {
    this.filteredList = [...classmates];
    this.bindEvents();
    this.populateFieldFilter();
    this.render();
  },

  bindEvents() {
    document.getElementById("search-input").addEventListener("input", (e) => {
      this.applyFilters(e.target.value);
    });

    document.getElementById("field-filter").addEventListener("change", (e) => {
      this.applyFilters(document.getElementById("search-input").value, e.target.value);
    });

    document.getElementById("theme-toggle").addEventListener("click", () => {
      document.body.classList.toggle("dark-theme");
      const isDark = document.body.classList.contains("dark-theme");
      document.getElementById("theme-toggle").textContent = isDark ? "浅色" : "深色";
    });

    document.getElementById("sidebar-toggle").addEventListener("click", () => {
      document.querySelector(".sidebar").classList.toggle("collapsed");
    });
  },

  populateFieldFilter() {
    const fields = [...new Set(classmates.map((c) => c.field))].sort();
    const select = document.getElementById("field-filter");
    fields.forEach((field) => {
      const option = document.createElement("option");
      option.value = field;
      option.textContent = field;
      select.appendChild(option);
    });
  },

  applyFilters(searchText = "", field = "") {
    const query = searchText.trim().toLowerCase();
    const fieldFilter = field || document.getElementById("field-filter").value;

    this.filteredList = classmates.filter((c) => {
      const matchField = !fieldFilter || c.field === fieldFilter;
      const matchSearch =
        !query ||
        c.name.toLowerCase().includes(query) ||
        c.city.toLowerCase().includes(query) ||
        c.field.toLowerCase().includes(query) ||
        (c.company && c.company.toLowerCase().includes(query));
      return matchField && matchSearch;
    });

    this.render();
  },

  render() {
    this.renderList();
    this.renderStats();
    MapManager.addMarkers(this.filteredList);
  },

  renderList() {
    const container = document.getElementById("classmate-list");
    const countEl = document.getElementById("list-count");

    countEl.textContent = `${this.filteredList.length} 人`;
    container.innerHTML = "";

    if (this.filteredList.length === 0) {
      container.innerHTML = '<p class="empty-tip">没有找到匹配的同学</p>';
      return;
    }

    this.filteredList.forEach((classmate) => {
      const text = this.getAvatarText(classmate.name);
      const color = this.getAvatarColor(classmate.name);
      const item = document.createElement("button");
      item.type = "button";
      item.className = `classmate-item${this.activeId === classmate.id ? " active" : ""}`;
      item.dataset.id = classmate.id;
      item.innerHTML = `
        <div class="item-avatar" style="background: ${color.bg}; color: ${color.text}; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.95rem; border: none;">
          ${text}
        </div>
        <div class="item-info">
          <strong>${classmate.name}</strong>
          <span>${classmate.city} · ${classmate.field}</span>
        </div>
      `;
      item.addEventListener("click", () => this.selectClassmate(classmate.id));
      container.appendChild(item);
    });
  },

  // 根据姓名生成显示文字（2字取最后一个字，3字及以上取后两位）
  getAvatarText(name) {
    if (name.length <= 2) {
      return name.slice(-1);
    }
    return name.slice(-2);
  },

  // 根据姓名生成低饱和度的背景色
  getAvatarColor(name) {
    const colors = [
      { bg: "#7c9eb2", text: "#fff" },  // 灰蓝
      { bg: "#8fa4b0", text: "#fff" },  // 灰青
      { bg: "#9b8fb0", text: "#fff" },  // 灰紫
      { bg: "#b09b8a", text: "#fff" },  // 灰棕
      { bg: "#8a9eb0", text: "#fff" },  // 蓝灰
      { bg: "#9fb08a", text: "#fff" },  // 黄绿灰
      { bg: "#b08a9f", text: "#fff" },  // 粉紫灰
      { bg: "#8ab09f", text: "#fff" },  // 青绿灰
      { bg: "#a09080", text: "#fff" },  // 暖灰
      { bg: "#8090a0", text: "#fff" },  // 冷灰
      { bg: "#94a8b8", text: "#fff" },  // 银蓝
      { bg: "#a8b094", text: "#fff" },  // 橄榄灰
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  },

  renderStats() {
    const cityStats = {};
    const fieldStats = {};

    this.filteredList.forEach((c) => {
      cityStats[c.city] = (cityStats[c.city] || 0) + 1;
      fieldStats[c.field] = (fieldStats[c.field] || 0) + 1;
    });

    const cityContainer = document.getElementById("city-stats");
    const fieldContainer = document.getElementById("field-stats");

    cityContainer.innerHTML = this.buildStatItems(cityStats);
    fieldContainer.innerHTML = this.buildStatItems(fieldStats);
  },

  buildStatItems(stats) {
    const entries = Object.entries(stats).sort((a, b) => b[1] - a[1]);
    if (entries.length === 0) {
      return '<span class="stat-empty">暂无数据</span>';
    }
    return entries
      .map(([name, count]) => `<span class="stat-tag">${name} ${count}</span>`)
      .join("");
  },

  selectClassmate(id) {
    this.activeId = id;
    this.renderList();
    MapManager.focusClassmate(id);
  },

  highlightClassmate(id) {
    this.activeId = id;
    this.renderList();
    const item = document.querySelector(`.classmate-item[data-id="${id}"]`);
    if (item) {
      item.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }
};

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = resolve;
    script.onerror = () => reject(new Error("地图库加载失败，请检查网络后刷新"));
    document.body.appendChild(script);
  });
}

function loadStylesheet(href) {
  if (document.querySelector(`link[href="${href}"]`)) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  document.head.appendChild(link);
}

async function loadLeaflet() {
  if (window.L) return;

  const leafletCss = "https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.css";
  const leafletJs = "https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.js";

  loadStylesheet(leafletCss);
  await loadScript(leafletJs);
}

let appStarted = false;

async function startApp() {
  if (appStarted) {
    if (MapManager.map) {
      MapManager.map.invalidateSize();
    }
    return;
  }

  await loadLeaflet();
  MapManager.init();
  App.init();
  appStarted = true;
}

startApp();
