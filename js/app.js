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
      const photoUrl = classmate.photo || "photos/default.svg";
      const item = document.createElement("button");
      item.type = "button";
      item.className = `classmate-item${this.activeId === classmate.id ? " active" : ""}`;
      item.dataset.id = classmate.id;
      item.innerHTML = `
        <img class="item-avatar" src="${photoUrl}" alt="${classmate.name}" onerror="this.src='photos/default.svg'">
        <div class="item-info">
          <strong>${classmate.name}</strong>
          <span>${classmate.city} · ${classmate.field}</span>
        </div>
      `;
      item.addEventListener("click", () => this.selectClassmate(classmate.id));
      container.appendChild(item);
    });
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
    MapManager.map?.invalidateSize();
    return;
  }

  await loadLeaflet();
  MapManager.init();
  App.init();
  appStarted = true;
}
