(function attachMapController(globalScope) {
  const DEFAULT_MAP_CENTER = Object.freeze([59.9311, 30.3609]);
  const DEFAULT_MAP_ZOOM = 13;
  const DEFAULT_SCENE_ZOOM = 16;
  const TILE_LAYER_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
  const TILE_LAYER_ATTRIBUTION = "&copy; OpenStreetMap contributors";

  const SCENE_PACING = Object.freeze({
    secondary: Object.freeze({ zoomDelay: 320, infoDelay: 560, mediaRevealDelay: 1180 }),
    important: Object.freeze({ zoomDelay: 520, infoDelay: 860, mediaRevealDelay: 1560 }),
    major: Object.freeze({ zoomDelay: 820, infoDelay: 1280, mediaRevealDelay: 2020 })
  });

  const ROUTE_STYLE = Object.freeze({
    color: "#b9ab93",
    opacity: 0.58,
    weight: 3
  });

  const ACTIVE_MAJOR_MARKER_STYLE = Object.freeze({
    radius: 11,
    color: "#f6eee1",
    weight: 2,
    fillColor: "#efe5d6",
    fillOpacity: 0.92
  });

  const ACTIVE_MARKER_STYLE = Object.freeze({
    radius: 9,
    color: "#efe5d6",
    weight: 2,
    fillColor: "#d6c8b0",
    fillOpacity: 0.88
  });

  const IDLE_MAJOR_MARKER_STYLE = Object.freeze({
    radius: 8,
    color: "#c9baa1",
    weight: 1.5,
    fillColor: "#8d7a63",
    fillOpacity: 0.82
  });

  const IDLE_MARKER_STYLE = Object.freeze({
    radius: 6,
    color: "#84786d",
    weight: 1.5,
    fillColor: "#585049",
    fillOpacity: 0.82
  });

  function resolveScenePacing(scene) {
    return SCENE_PACING[scene.importance] || SCENE_PACING.secondary;
  }

  function resolveMarkerStyle(scene, isActive) {
    if (isActive) {
      return scene.isMajorTurningPoint ? ACTIVE_MAJOR_MARKER_STYLE : ACTIVE_MARKER_STYLE;
    }

    return scene.isMajorTurningPoint ? IDLE_MAJOR_MARKER_STYLE : IDLE_MARKER_STYLE;
  }

  function toLatLng(scene) {
    return [scene.lat, scene.lng];
  }

  function buildPopupContent(scene) {
    return `
      <div class="map-popover">
        <span class="map-popover__meta">${scene.dayLabel} · ${scene.importanceLabel}</span>
        <strong class="map-popover__title">${scene.title}</strong>
        <span class="map-popover__location">${scene.locationName}</span>
        <span class="map-popover__address">${scene.modernAddress}</span>
      </div>
    `;
  }

  class SceneMapController {
    constructor(elements) {
      this.mapElement = elements.mapElement;
      this.placeholderElement = elements.placeholderElement;
      this.placeholderTitleElement = elements.placeholderTitleElement;
      this.placeholderCopyElement = elements.placeholderCopyElement;
      this.statusElement = elements.statusElement;

      this.map = null;
      this.routeLine = null;
      this.tileLayer = null;
      this.markers = new Map();
      this.sceneLookup = new Map();
      this.scenes = [];
      this.isReady = false;
      this.activeSceneId = null;
      this.pendingZoomTimer = null;
      this.pendingInfoTimer = null;
    }

    getSceneTransitionTiming(scene) {
      return resolveScenePacing(scene);
    }

    async initialize({ scenes }) {
      this.scenes = scenes.slice();
      this.sceneLookup = new Map(this.scenes.map((scene) => [scene.id, scene]));

      if (!globalScope.L) {
        this.showPlaceholder(
          "Leaflet could not load.",
          "Check your internet connection or the Leaflet CDN link in index.html."
        );
        this.setStatus("OpenStreetMap could not start because Leaflet failed to load.");
        return false;
      }

      try {
        this.buildMap();
        this.hidePlaceholder();
        this.isReady = true;
        this.setStatus("OpenStreetMap is active. Move through the scenes to follow the route.");
        return true;
      } catch (error) {
        this.showPlaceholder("OpenStreetMap could not load.", error.message);
        this.setStatus(error.message);
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

      this.routeLine = globalScope.L.polyline(
        this.scenes.map((scene) => toLatLng(scene)),
        ROUTE_STYLE
      ).addTo(this.map);

      this.scenes.forEach((scene) => {
        const marker = globalScope.L.circleMarker(toLatLng(scene), resolveMarkerStyle(scene, false))
          .bindPopup(buildPopupContent(scene), {
            autoPan: false,
            closeButton: false,
            offset: globalScope.L.point(0, -8)
          })
          .addTo(this.map);

        this.markers.set(scene.id, marker);
      });
    }

    focusScene(scene) {
      const pacing = this.getSceneTransitionTiming(scene);

      if (!scene) {
        return pacing;
      }

      this.activeSceneId = scene.id;
      this.setStatus(`${scene.locationName} — ${scene.modernAddress}`);

      if (!this.isReady || !this.map) {
        return pacing;
      }

      this.clearPendingFocus();
      this.updateMarkerStates(scene.id);
      this.map.panTo(toLatLng(scene), { animate: true, duration: 1.2 });

      this.pendingZoomTimer = window.setTimeout(() => {
        this.map.setZoom(scene.mapZoom || DEFAULT_SCENE_ZOOM, { animate: true });
      }, pacing.zoomDelay);

      this.pendingInfoTimer = window.setTimeout(() => {
        const marker = this.markers.get(scene.id);
        if (!marker) {
          return;
        }

        marker.openPopup();
      }, pacing.infoDelay);

      return pacing;
    }

    clearPendingFocus() {
      window.clearTimeout(this.pendingZoomTimer);
      window.clearTimeout(this.pendingInfoTimer);
    }

    updateMarkerStates(activeSceneId) {
      this.markers.forEach((marker, sceneId) => {
        const scene = this.sceneLookup.get(sceneId);
        marker.setStyle(resolveMarkerStyle(scene, sceneId === activeSceneId));

        if (sceneId !== activeSceneId) {
          marker.closePopup();
        }
      });
    }

    refreshLayout() {
      if (!this.isReady || !this.map) {
        return;
      }

      const activeScene = this.sceneLookup.get(this.activeSceneId);

      this.map.invalidateSize(false);

      if (activeScene) {
        window.setTimeout(() => {
          this.map.panTo(toLatLng(activeScene), { animate: false });
        }, 120);
      }
    }

    showPlaceholder(title, copy) {
      this.mapElement.classList.add("is-disabled");
      this.placeholderElement.hidden = false;
      this.placeholderTitleElement.textContent = title;
      this.placeholderCopyElement.textContent = copy;
    }

    hidePlaceholder() {
      this.mapElement.classList.remove("is-disabled");
      this.placeholderElement.hidden = true;
    }

    setStatus(message) {
      this.statusElement.textContent = message;
    }
  }

  globalScope.GeographyOfGuiltMap = Object.freeze({
    SceneMapController
  });
})(window);
