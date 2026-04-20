(function attachMapController(globalScope) {
  const DEFAULT_MAP_CENTER = Object.freeze([59.9311, 30.3609]);
  const DEFAULT_MAP_ZOOM = 12;
  const TILE_LAYER_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
  const TILE_LAYER_ATTRIBUTION = "&copy; OpenStreetMap contributors";
  const MARKER_STYLE = Object.freeze({
    radius: 7,
    color: "#f3ead9",
    weight: 2,
    fillColor: "#d8cab1",
    fillOpacity: 0.92
  });
  const TOOLTIP_DIRECTIONS = Object.freeze(["top", "right", "left", "bottom"]);

  function toLatLng(location) {
    return [location.lat, location.lng];
  }

  class SceneMapController {
    constructor(elements) {
      this.mapElement = elements.mapElement;
      this.placeholderElement = elements.placeholderElement;
      this.placeholderTitleElement = elements.placeholderTitleElement;
      this.placeholderCopyElement = elements.placeholderCopyElement;

      this.map = null;
      this.tileLayer = null;
      this.markers = [];
      this.locations = [];
    }

    async initialize({ locations }) {
      this.locations = locations.slice();

      if (!globalScope.L) {
        this.showPlaceholder(
          "Leaflet could not load.",
          "Check your internet connection or the Leaflet CDN link in index.html."
        );
        return false;
      }

      try {
        this.buildMap();
        this.hidePlaceholder();
        return true;
      } catch (error) {
        this.showPlaceholder("OpenStreetMap could not load.", error.message);
        return false;
      }
    }

    buildMap() {
      if (this.map) {
        return;
      }

      this.map = globalScope.L.map(this.mapElement, {
        center: DEFAULT_MAP_CENTER,
        zoom: DEFAULT_MAP_ZOOM,
        zoomControl: true,
        attributionControl: true
      });

      this.tileLayer = globalScope.L.tileLayer(TILE_LAYER_URL, {
        attribution: TILE_LAYER_ATTRIBUTION,
        maxZoom: 19
      }).addTo(this.map);

      const bounds = [];

      this.locations.forEach((location, index) => {
        const marker = globalScope.L.circleMarker(
          toLatLng(location),
          MARKER_STYLE
        ).addTo(this.map);

        marker.bindTooltip(location.label, {
          permanent: true,
          direction: TOOLTIP_DIRECTIONS[index % TOOLTIP_DIRECTIONS.length],
          offset: this.getTooltipOffset(index),
          className: "location-label"
        });

        this.markers.push(marker);
        bounds.push(toLatLng(location));
      });

      if (bounds.length) {
        this.map.fitBounds(bounds, {
          padding: [48, 48],
          maxZoom: 12
        });
      }
    }

    getTooltipOffset(index) {
      switch (TOOLTIP_DIRECTIONS[index % TOOLTIP_DIRECTIONS.length]) {
        case "right":
          return [12, 0];
        case "left":
          return [-12, 0];
        case "bottom":
          return [0, 12];
        case "top":
        default:
          return [0, -12];
      }
    }

    showPlaceholder(title, copy) {
      this.placeholderElement.hidden = false;
      this.placeholderTitleElement.textContent = title;
      this.placeholderCopyElement.textContent = copy;
    }

    hidePlaceholder() {
      this.placeholderElement.hidden = true;
    }
  }

  globalScope.GeographyOfGuiltMap = Object.freeze({
    SceneMapController
  });
})(window);
