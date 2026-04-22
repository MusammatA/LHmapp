(function attachMapController(globalScope) {
  const DEFAULT_MAP_CENTER = Object.freeze([59.9311, 30.3609]);
  const DEFAULT_MAP_ZOOM = 12;
  const TILE_LAYER_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
  const TILE_LAYER_ATTRIBUTION = "&copy; OpenStreetMap contributors";
  const MARKER_STYLE = Object.freeze({
    radius: 7,
    color: "#ffd2cc",
    weight: 2,
    fillColor: "#d12525",
    fillOpacity: 0.98
  });
  const HOME_ICON_SIZE = Object.freeze([174, 120]);
  const HOME_ICON_ANCHOR = Object.freeze([87, 94]);
  const PIN_ICON_SIZE = Object.freeze([36, 48]);
  const PIN_ICON_ANCHOR = Object.freeze([18, 44]);
  const STORY_MARKER_FOCUS_ZOOM = 15;
  const STORY_MARKER_OPEN_DELAY_MS = 420;
  const TOOLTIP_DIRECTIONS = Object.freeze(["top", "right", "left", "bottom"]);

  function toLatLng(location) {
    return [location.lat, location.lng];
  }

  function createTooltipContent(location) {
    const wrapper = document.createElement("span");
    wrapper.className = "location-label__content";

    if (Array.isArray(location.slideIndices) && location.slideIndices.length) {
      const indices = document.createElement("span");
      indices.className = "location-label__indices";

      location.slideIndices.forEach((slideNumber) => {
        const badge = document.createElement("span");
        badge.className = "location-label__index";
        badge.textContent = slideNumber;
        indices.append(badge);
      });

      wrapper.append(indices);
    }

    const text = document.createElement("span");
    text.className = "location-label__text";
    text.textContent = location.label;
    wrapper.append(text);

    return wrapper;
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
      this.interactionEnabled = true;
      this.locationSelectHandler = null;
      this.locationSelectTimer = null;
    }

    async initialize({ locations, interactive = true }) {
      this.locations = locations.slice();
      this.interactionEnabled = interactive;

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

      this.setInteractivity(this.interactionEnabled);

      const bounds = [];

      this.locations.forEach((location, index) => {
        const marker = this.createMarker(location);
        const isStoryLocation = Number.isInteger(location.slideIndex);
        const markerLabelClass = isStoryLocation
          ? "location-label location-label--interactive"
          : "location-label";

        if (location.showTooltip !== false && location.label) {
          marker.bindTooltip(createTooltipContent(location), {
            permanent: true,
            interactive: isStoryLocation,
            direction: this.getTooltipDirection(location, index),
            offset: this.getTooltipOffset(location, index),
            className: markerLabelClass
          });

          const tooltip = marker.getTooltip();

          if (tooltip && isStoryLocation) {
            tooltip.on("click", () => {
              this.handleLocationSelection(location);
            });
          }
        }

        if (isStoryLocation) {
          marker.on("click", () => {
            this.handleLocationSelection(location);
          });
        }

        this.markers.push(marker);

        if (location.includeInInitialBounds !== false) {
          bounds.push(toLatLng(location));
        }
      });

      const initialBounds = bounds.length
        ? bounds
        : this.locations.map(toLatLng);

      if (initialBounds.length) {
        this.map.fitBounds(initialBounds, {
          padding: [48, 48],
          maxZoom: 12
        });
      }
    }

    createMarker(location) {
      const marker = location.markerType === "story"
        ? globalScope.L.circleMarker(toLatLng(location), MARKER_STYLE)
        : globalScope.L.marker(toLatLng(location), {
            icon: this.createMarkerIcon(location)
          });

      return marker.addTo(this.map);
    }

    createMarkerIcon(location) {
      switch (location.markerType) {
        case "home":
          return globalScope.L.divIcon({
            className: "map-marker-icon map-marker-icon--home",
            html:
              `<span class="map-marker map-marker--home">${
                location.markerCaption
                  ? `<span class="map-marker__home-caption">${location.markerCaption}</span>`
                  : ""
              }<svg class="map-marker__heart-svg" viewBox="0 0 100 92" aria-hidden="true" focusable="false">
                <defs>
                  <linearGradient id="home-heart-gradient" x1="50%" y1="0%" x2="50%" y2="100%">
                    <stop offset="0%" stop-color="#aa3f57"></stop>
                    <stop offset="100%" stop-color="#7f233d"></stop>
                  </linearGradient>
                </defs>
                <path d="M50 88C48.4 86.8 46.3 85.1 43.9 83.1C36.8 77.3 27.4 69 19.3 59.8C11 50.4 4 40.1 4 28.8C4 14.8 14.6 5 27.8 5C36.8 5 44.1 9.4 50 16.7C55.9 9.4 63.2 5 72.2 5C85.4 5 96 14.8 96 28.8C96 40.1 89 50.4 80.7 59.8C72.6 69 63.2 77.3 56.1 83.1C53.7 85.1 51.6 86.8 50 88Z" fill="url(#home-heart-gradient)"></path>
              </svg><span class="map-marker__heart-text">Home</span></span>`,
            iconSize: HOME_ICON_SIZE,
            iconAnchor: HOME_ICON_ANCHOR
          });
        case "institution":
          return globalScope.L.divIcon({
            className: "map-marker-icon map-marker-icon--institution",
            html:
              '<span class="map-marker map-marker--pin map-marker--institution"><span class="map-marker__pin-core"></span><span class="map-marker__pin-glyph"><span class="map-marker__institution-glyph"></span></span></span>',
            iconSize: PIN_ICON_SIZE,
            iconAnchor: PIN_ICON_ANCHOR
          });
        case "city":
          return globalScope.L.divIcon({
            className: "map-marker-icon map-marker-icon--city",
            html:
              '<span class="map-marker map-marker--pin map-marker--city"><span class="map-marker__pin-core"></span><span class="map-marker__pin-glyph"><span class="map-marker__city-dot"></span></span></span>',
            iconSize: PIN_ICON_SIZE,
            iconAnchor: PIN_ICON_ANCHOR
          });
        default:
          return globalScope.L.divIcon({
            className: "map-marker-icon",
            html: "",
            iconSize: PIN_ICON_SIZE,
            iconAnchor: PIN_ICON_ANCHOR
          });
      }
    }

    setInteractivity(isEnabled) {
      this.interactionEnabled = Boolean(isEnabled);

      if (!this.map) {
        return;
      }

      const method = this.interactionEnabled ? "enable" : "disable";

      [
        this.map.dragging,
        this.map.touchZoom,
        this.map.doubleClickZoom,
        this.map.scrollWheelZoom,
        this.map.boxZoom,
        this.map.keyboard,
        this.map.tap
      ].forEach((handler) => {
        if (handler && typeof handler[method] === "function") {
          handler[method]();
        }
      });

      this.mapElement.classList.toggle("map-canvas--locked", !this.interactionEnabled);
    }

    setLocationSelectHandler(handler) {
      this.locationSelectHandler = typeof handler === "function" ? handler : null;
    }

    handleLocationSelection(location) {
      if (!this.interactionEnabled || typeof this.locationSelectHandler !== "function") {
        return;
      }

      this.focusLocation(location);

      if (this.locationSelectTimer) {
        globalScope.clearTimeout(this.locationSelectTimer);
      }

      this.locationSelectTimer = globalScope.setTimeout(() => {
        this.locationSelectTimer = null;
        this.locationSelectHandler(location);
      }, STORY_MARKER_OPEN_DELAY_MS);
    }

    focusLocation(location) {
      if (!this.map) {
        return;
      }

      this.map.flyTo(toLatLng(location), STORY_MARKER_FOCUS_ZOOM, {
        animate: true,
        duration: 0.9,
        easeLinearity: 0.25
      });
    }

    getTooltipDirection(location, index) {
      return location.tooltipDirection || TOOLTIP_DIRECTIONS[index % TOOLTIP_DIRECTIONS.length];
    }

    getTooltipOffset(location, index) {
      const isAuxiliaryMarker = location.markerType && location.markerType !== "story";

      switch (this.getTooltipDirection(location, index)) {
        case "right":
          return isAuxiliaryMarker ? [24, -12] : [16, 0];
        case "left":
          return isAuxiliaryMarker ? [-24, -12] : [-16, 0];
        case "bottom":
          return isAuxiliaryMarker ? [0, 18] : [0, 12];
        case "top":
        default:
          return isAuxiliaryMarker ? [0, -20] : [0, -12];
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
