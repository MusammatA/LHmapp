(function attachMapController(globalScope) {
  const DEFAULT_MAP_CENTER = Object.freeze([59.9311, 30.3609]);
  const DEFAULT_MAP_ZOOM = 12;
  const TILE_LAYER_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
  const TILE_LAYER_ATTRIBUTION = "&copy; OpenStreetMap contributors";
  const STORY_MARKER_FOCUS_ZOOM = 15;
  const STORY_MARKER_OPEN_DELAY_MS = 420;
  const STORY_MARKER_PULSE_MS = 1650;
  const STORY_PATH_PANE = "storyPathPane";
  const TOOLTIP_DIRECTIONS = Object.freeze(["top", "right", "left", "bottom"]);

  /* Story marker pulse and visited states */
  const STORY_MARKER_STYLES = Object.freeze({
    default: Object.freeze({
      radius: 7,
      color: "#ffd4cd",
      weight: 2,
      fillColor: "#de1f1f",
      fillOpacity: 0.98
    }),
    visited: Object.freeze({
      radius: 7,
      color: "#cba5a1",
      weight: 2,
      fillColor: "#8e2929",
      fillOpacity: 0.92
    }),
    active: Object.freeze({
      radius: 8.4,
      color: "#ffe7df",
      weight: 2.4,
      fillColor: "#ff3232",
      fillOpacity: 1
    }),
    hover: Object.freeze({
      radius: 8,
      color: "#ffe0d8",
      weight: 2.2,
      fillColor: "#ff2b2b",
      fillOpacity: 1
    })
  });

  /* Guided-mode path line between story locations */
  const STORY_PATH_STYLES = Object.freeze({
    base: Object.freeze({
      color: "#8f7152",
      weight: 2.2,
      opacity: 0.22,
      dashArray: "10 12",
      lineCap: "round",
      lineJoin: "round",
      className: "story-path-line story-path-line--base",
      pane: STORY_PATH_PANE
    }),
    progress: Object.freeze({
      color: "#d1b38b",
      weight: 2.8,
      opacity: 0.58,
      lineCap: "round",
      lineJoin: "round",
      className: "story-path-line story-path-line--progress",
      pane: STORY_PATH_PANE
    }),
    current: Object.freeze({
      color: "#f1deba",
      weight: 3.6,
      opacity: 0.84,
      lineCap: "round",
      lineJoin: "round",
      className: "story-path-line story-path-line--current",
      pane: STORY_PATH_PANE
    })
  });

  const HOME_ICON_SIZE = Object.freeze([174, 120]);
  const HOME_ICON_ANCHOR = Object.freeze([87, 94]);
  const PIN_ICON_SIZE = Object.freeze([36, 48]);
  const PIN_ICON_ANCHOR = Object.freeze([18, 44]);

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

  function createStoryMarkerRecord(location, marker) {
    return {
      location,
      marker,
      markerElement: null,
      tooltipElement: null,
      isHovered: false,
      isPulsing: false,
      pulseTimerId: null
    };
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
      this.storyEvents = [];
      this.interactionEnabled = true;
      this.locationSelectHandler = null;
      this.locationSelectTimer = null;
      this.storyMarkerRecords = [];
      this.storyMarkerBySlideIndex = new Map();
      this.visitedStorySlides = new Set();
      this.activeStorySlideIndex = null;
      this.storyPathVisible = false;
      this.storyPathBaseLine = null;
      this.storyPathProgressLine = null;
      this.storyPathCurrentLine = null;
    }

    async initialize({ locations, storyEvents = [], interactive = true }) {
      this.locations = locations.slice();
      this.storyEvents = Array.isArray(storyEvents) ? storyEvents.slice() : [];
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

      this.ensureStoryPathPane();
      this.setInteractivity(this.interactionEnabled);

      const bounds = [];

      this.locations.forEach((location, index) => {
        const marker = this.createMarker(location);
        const isStoryLocation = Array.isArray(location.slideIndices) && location.slideIndices.length > 0;
        const markerLabelClass = isStoryLocation
          ? "location-label location-label--interactive location-label--story"
          : "location-label";

        if (location.showTooltip !== false && location.label) {
          marker.bindTooltip(createTooltipContent(location), {
            permanent: true,
            interactive: isStoryLocation,
            direction: this.getTooltipDirection(location, index),
            offset: this.getTooltipOffset(location, index),
            className: markerLabelClass
          });
        }

        if (isStoryLocation) {
          const record = createStoryMarkerRecord(location, marker);
          this.storyMarkerRecords.push(record);

          location.slideIndices.forEach((slideNumber) => {
            this.storyMarkerBySlideIndex.set(slideNumber, record);
          });

          marker.on("click", () => {
            this.handleLocationSelection(location);
          });
          marker.on("mouseover", () => {
            record.isHovered = true;
            this.applyStoryMarkerVisualState(record);
          });
          marker.on("mouseout", () => {
            record.isHovered = false;
            this.applyStoryMarkerVisualState(record);
          });

          const tooltip = marker.getTooltip();

          if (tooltip) {
            tooltip.on("click", () => {
              this.handleLocationSelection(location);
            });
          }

          this.deferStoryMarkerElementSync(record);
        }

        this.markers.push(marker);

        if (location.includeInInitialBounds !== false) {
          bounds.push(toLatLng(location));
        }
      });

      this.renderStoryPath();

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

    ensureStoryPathPane() {
      if (!this.map) {
        return;
      }

      if (!this.map.getPane(STORY_PATH_PANE)) {
        this.map.createPane(STORY_PATH_PANE);
      }

      const pane = this.map.getPane(STORY_PATH_PANE);

      if (pane) {
        pane.style.zIndex = "360";
        pane.style.pointerEvents = "none";
      }
    }

    createMarker(location) {
      if (location.markerType === "story") {
        return globalScope.L.circleMarker(toLatLng(location), {
          ...STORY_MARKER_STYLES.default,
          className: "story-marker-dot"
        }).addTo(this.map);
      }

      return globalScope.L.marker(toLatLng(location), {
        icon: this.createMarkerIcon(location)
      }).addTo(this.map);
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

    deferStoryMarkerElementSync(record, attemptsRemaining = 4) {
      globalScope.requestAnimationFrame(() => {
        this.syncStoryMarkerElements(record, attemptsRemaining);
      });
    }

    syncStoryMarkerElements(record, attemptsRemaining = 0) {
      if (!record) {
        return;
      }

      record.markerElement = record.marker.getElement() || null;

      if (record.markerElement) {
        record.markerElement.classList.add("story-marker-dot");
      }

      const tooltip = record.marker.getTooltip();
      record.tooltipElement = tooltip && typeof tooltip.getElement === "function"
        ? tooltip.getElement()
        : null;

      if (record.tooltipElement) {
        record.tooltipElement.classList.add("location-label--story");
      }

      this.applyStoryMarkerVisualState(record);

      if ((!record.markerElement || !record.tooltipElement) && attemptsRemaining > 0) {
        globalScope.setTimeout(() => {
          this.deferStoryMarkerElementSync(record, attemptsRemaining - 1);
        }, 80);
      }
    }

    getStoryMarkerStyle(record) {
      const isActive = this.activeStorySlideIndex !== null
        && record.location.slideIndices.includes(this.activeStorySlideIndex);
      const isVisited = record.location.slideIndices.some((slideNumber) =>
        this.visitedStorySlides.has(slideNumber)
      );

      if (isActive) {
        return STORY_MARKER_STYLES.active;
      }

      if (record.isHovered) {
        return STORY_MARKER_STYLES.hover;
      }

      return isVisited ? STORY_MARKER_STYLES.visited : STORY_MARKER_STYLES.default;
    }

    applyStoryMarkerVisualState(record) {
      if (!record || !record.marker) {
        return;
      }

      const isActive = this.activeStorySlideIndex !== null
        && record.location.slideIndices.includes(this.activeStorySlideIndex);
      const isVisited = record.location.slideIndices.some((slideNumber) =>
        this.visitedStorySlides.has(slideNumber)
      );
      const style = this.getStoryMarkerStyle(record);

      record.marker.setStyle(style);

      if (record.markerElement) {
        record.markerElement.classList.toggle("is-visited", isVisited);
        record.markerElement.classList.toggle("is-active", isActive);
        record.markerElement.classList.toggle("is-pulsing", record.isPulsing);
      }

      if (record.tooltipElement) {
        record.tooltipElement.classList.toggle("location-label--visited", isVisited);
        record.tooltipElement.classList.toggle("location-label--active", isActive);
      }
    }

    applyStoryMarkerStateToAll() {
      this.storyMarkerRecords.forEach((record) => {
        this.applyStoryMarkerVisualState(record);
      });
    }

    triggerStoryMarkerPulse(record) {
      if (!record) {
        return;
      }

      if (record.pulseTimerId) {
        globalScope.clearTimeout(record.pulseTimerId);
      }

      record.isPulsing = false;
      this.applyStoryMarkerVisualState(record);

      globalScope.requestAnimationFrame(() => {
        record.isPulsing = true;
        this.applyStoryMarkerVisualState(record);

        record.pulseTimerId = globalScope.setTimeout(() => {
          record.isPulsing = false;
          record.pulseTimerId = null;
          this.applyStoryMarkerVisualState(record);
        }, STORY_MARKER_PULSE_MS);
      });
    }

    markSlideVisited(slideIndex) {
      if (!Number.isInteger(slideIndex)) {
        return;
      }

      this.visitedStorySlides.add(slideIndex);
      const record = this.storyMarkerBySlideIndex.get(slideIndex);

      if (record) {
        this.applyStoryMarkerVisualState(record);
      }
    }

    setActiveStoryMarker(slideIndex, { pulse = true } = {}) {
      const previousRecord = this.storyMarkerBySlideIndex.get(this.activeStorySlideIndex);
      const nextRecord = this.storyMarkerBySlideIndex.get(slideIndex);

      this.activeStorySlideIndex = Number.isInteger(slideIndex) ? slideIndex : null;

      if (previousRecord && previousRecord !== nextRecord) {
        this.applyStoryMarkerVisualState(previousRecord);
      }

      if (nextRecord) {
        this.applyStoryMarkerVisualState(nextRecord);

        if (pulse) {
          this.triggerStoryMarkerPulse(nextRecord);
        }
      }
    }

    clearActiveStoryMarker() {
      const record = this.storyMarkerBySlideIndex.get(this.activeStorySlideIndex);
      this.activeStorySlideIndex = null;

      if (record) {
        this.applyStoryMarkerVisualState(record);
      }
    }

    resetVisitedStoryMarkers() {
      this.visitedStorySlides.clear();
      this.applyStoryMarkerStateToAll();
    }

    /* Guided-mode path line between story locations */
    renderStoryPath() {
      if (!this.map || !this.storyEvents.length) {
        return;
      }

      const coordinates = this.storyEvents.map(toLatLng);

      if (coordinates.length < 2) {
        return;
      }

      this.storyPathBaseLine = globalScope.L.polyline(coordinates, STORY_PATH_STYLES.base).addTo(this.map);
      this.storyPathProgressLine = globalScope.L.polyline([], STORY_PATH_STYLES.progress).addTo(this.map);
      this.storyPathCurrentLine = globalScope.L.polyline([], STORY_PATH_STYLES.current).addTo(this.map);

      this.hideStoryPathLayers();
    }

    hideStoryPathLayers() {
      [this.storyPathBaseLine, this.storyPathProgressLine, this.storyPathCurrentLine].forEach((line) => {
        if (!line) {
          return;
        }

        line.setStyle({ opacity: 0 });
      });
    }

    showStoryPath() {
      if (!this.storyPathBaseLine) {
        return;
      }

      this.storyPathVisible = true;
      this.storyPathBaseLine.setStyle({ opacity: STORY_PATH_STYLES.base.opacity });
    }

    updateStoryPathProgress(currentSlideIndex) {
      if (!this.storyPathBaseLine || !this.storyPathProgressLine || !this.storyPathCurrentLine) {
        return;
      }

      if (!Number.isInteger(currentSlideIndex) || currentSlideIndex < 1) {
        this.clearStoryPath();
        return;
      }

      this.showStoryPath();

      const progressCoordinates = this.storyEvents
        .slice(0, currentSlideIndex)
        .map(toLatLng);
      const currentSegmentCoordinates = currentSlideIndex > 1
        ? this.storyEvents.slice(currentSlideIndex - 2, currentSlideIndex).map(toLatLng)
        : [];

      this.storyPathProgressLine.setLatLngs(progressCoordinates);
      this.storyPathProgressLine.setStyle({
        opacity: progressCoordinates.length > 1 ? STORY_PATH_STYLES.progress.opacity : 0
      });

      this.storyPathCurrentLine.setLatLngs(currentSegmentCoordinates);
      this.storyPathCurrentLine.setStyle({
        opacity: currentSegmentCoordinates.length > 1 ? STORY_PATH_STYLES.current.opacity : 0
      });
    }

    clearStoryPath() {
      this.storyPathVisible = false;

      if (this.storyPathProgressLine) {
        this.storyPathProgressLine.setLatLngs([]);
        this.storyPathProgressLine.setStyle({ opacity: 0 });
      }

      if (this.storyPathCurrentLine) {
        this.storyPathCurrentLine.setLatLngs([]);
        this.storyPathCurrentLine.setStyle({ opacity: 0 });
      }

      if (this.storyPathBaseLine) {
        this.storyPathBaseLine.setStyle({ opacity: 0 });
      }
    }

    focusStorySlide(slideIndex) {
      if (!this.map || !Number.isInteger(slideIndex)) {
        return;
      }

      const storyEvent = this.storyEvents[slideIndex - 1];

      if (!storyEvent) {
        return;
      }

      this.map.flyTo([storyEvent.lat, storyEvent.lng], STORY_MARKER_FOCUS_ZOOM, {
        animate: true,
        duration: 0.9,
        easeLinearity: 0.25
      });
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

      if (Number.isInteger(location.slideIndex)) {
        this.setActiveStoryMarker(location.slideIndex, { pulse: true });
      }

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
