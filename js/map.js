(function attachMapController(globalScope) {
  const DEFAULT_MAP_CENTER = Object.freeze([59.9311, 30.3609]);
  const DEFAULT_MAP_ZOOM = 11;
  const DEFAULT_SCENE_ZOOM = 16;
  const TILE_LAYER_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
  const TILE_LAYER_ATTRIBUTION = "&copy; OpenStreetMap contributors";

  const SCENE_PACING = Object.freeze({
    secondary: Object.freeze({ zoomDelay: 160, infoDelay: 640, mediaRevealDelay: 920 }),
    important: Object.freeze({ zoomDelay: 260, infoDelay: 820, mediaRevealDelay: 1080 }),
    major: Object.freeze({ zoomDelay: 420, infoDelay: 1120, mediaRevealDelay: 1320 })
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
        const marker = globalScope.L.circleMarker(
          toLatLng(scene),
          resolveMarkerStyle(scene, false)
        ).addTo(this.map);

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
      this.pendingZoomTimer = window.setTimeout(() => {
        this.map.flyTo(toLatLng(scene), scene.mapZoom || DEFAULT_SCENE_ZOOM, {
          animate: true,
          duration: scene.isMajorTurningPoint ? 2.1 : 1.55
        });
      }, pacing.zoomDelay);

      return pacing;
    }

    clearPendingFocus() {
      window.clearTimeout(this.pendingZoomTimer);
    }

    updateMarkerStates(activeSceneId) {
      this.markers.forEach((marker, sceneId) => {
        const scene = this.sceneLookup.get(sceneId);
        marker.setStyle(resolveMarkerStyle(scene, sceneId === activeSceneId));
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
