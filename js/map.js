/**
 * 地图初始化与标记管理
 */
const MapManager = {
  map: null,
  markers: {},
  markerGroup: null,

  init() {
    this.map = L.map("map", {
      center: [35.0, 105.0],
      zoom: 5,
      minZoom: 3,
      maxZoom: 18
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19
    }).addTo(this.map);

    this.markerGroup = L.layerGroup().addTo(this.map);
  },

  createMarkerIcon(classmate) {
    const photoUrl = classmate.photo || "photos/default.svg";
    return L.divIcon({
      className: "custom-marker",
      html: `<div class="marker-pin" data-id="${classmate.id}">
        <img src="${photoUrl}" alt="${classmate.name}" onerror="this.src='photos/default.svg'">
      </div>`,
      iconSize: [44, 44],
      iconAnchor: [22, 44],
      popupAnchor: [0, -44]
    });
  },

  buildPopupContent(classmate) {
    const photoUrl = classmate.photo || "photos/default.svg";
    const company = classmate.company ? `<p class="popup-row"><span>公司</span>${classmate.company}</p>` : "";
    const gradYear = classmate.gradYear ? `<p class="popup-row"><span>毕业</span>${classmate.gradYear} 届</p>` : "";

    return `
      <div class="popup-card">
        <img class="popup-avatar" src="${photoUrl}" alt="${classmate.name}" onerror="this.src='photos/default.svg'">
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

    classmateList.forEach((classmate) => {
      const marker = L.marker(classmate.coords, {
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
