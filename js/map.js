/**
 * 地图初始化与标记管理
 */
const MapManager = {
  map: null,
  markers: {},
  markerGroup: null,

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

  // 按坐标分组，同一地点的人围成一圈散开
  buildCoordIndex(classmateList) {
    const groups = {};
    classmateList.forEach((c) => {
      const key = `${c.coords[0].toFixed(4)},${c.coords[1].toFixed(4)}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(c);
    });

    // 为每个有多人的组生成偏移坐标
    Object.values(groups).forEach((group) => {
      const n = group.length;
      group.forEach((c, i) => {
        if (n === 1) return;
        // 围成一圈散开，角度均匀分布
        const angle = (2 * Math.PI * i) / n;
        const radius = 0.015 + n * 0.004;
        c._offsetLat = c.coords[0] + radius * Math.cos(angle);
        c._offsetLng = c.coords[1] + radius * Math.sin(angle);
      });
    });
  },

  init() {
    this.map = L.map("map", {
      center: [35.0, 105.0],
      zoom: 5,
      minZoom: 3,
      maxZoom: 18
    });

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19
    }).addTo(this.map);

    this.markerGroup = L.layerGroup().addTo(this.map);
  },

  createMarkerIcon(classmate) {
    const text = this.getAvatarText(classmate.name);
    const color = this.getAvatarColor(classmate.name);
    return L.divIcon({
      className: "custom-marker",
      html: `<div class="marker-pin" data-id="${classmate.id}" style="background: ${color.bg};">
        <span class="avatar-text" style="color: ${color.text};">${text}</span>
      </div>`,
      iconSize: [44, 44],
      iconAnchor: [22, 44],
      popupAnchor: [0, -44]
    });
  },

  buildPopupContent(classmate) {
    const text = this.getAvatarText(classmate.name);
    const color = this.getAvatarColor(classmate.name);
    const company = classmate.company ? `<p class="popup-row"><span>公司</span>${classmate.company}</p>` : "";
    const gradYear = classmate.gradYear ? `<p class="popup-row"><span>毕业</span>${classmate.gradYear} 届</p>` : "";

    return `
      <div class="popup-card">
        <div class="popup-avatar" style="background: ${color.bg}; color: ${color.text}; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; font-weight: 700; border: none;">
          ${text}
        </div>
        <div class="popup-info">
          <h3>${classmate.name}</h3>
          <p class="popup-row"><span>城市</span>${classmate.city}</p>
          <p class="popup-row"><span>领域</span>${classmate.field}</p>
          ${company}
          ${gradYear}
        </div>
      </div>
    `;
  },

  addMarkers(classmateList) {
    this.markerGroup.clearLayers();
    this.markers = {};

    // 先计算坐标偏移
    this.buildCoordIndex(classmateList);

    classmateList.forEach((classmate) => {
      // 优先用偏移坐标，其次原始坐标
      const lat = classmate._offsetLat !== undefined ? classmate._offsetLat : classmate.coords[0];
      const lng = classmate._offsetLng !== undefined ? classmate._offsetLng : classmate.coords[1];

      const marker = L.marker([lat, lng], {
        icon: this.createMarkerIcon(classmate)
      });

      marker.bindPopup(this.buildPopupContent(classmate), {
        maxWidth: 280,
        className: "classmate-popup"
      });

      marker.on("click", () => {
        App.highlightClassmate(classmate.id);
      });

      marker.addTo(this.markerGroup);
      this.markers[classmate.id] = marker;
    });

    if (classmateList.length > 0) {
      // 用原始坐标算边界，确保能看到城市全貌
      const bounds = L.latLngBounds(classmateList.map((c) => c.coords));
      this.map.fitBounds(bounds, { padding: [50, 40] });
    }
  },

  focusClassmate(id) {
    const marker = this.markers[id];
    if (marker) {
      this.map.setView(marker.getLatLng(), 10, { animate: true });
      marker.openPopup();
    }
  }
};
