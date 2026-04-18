(function attachMapController(globalScope) {
  const GOOGLE_MAPS_PLACEHOLDER_KEY = "YOUR_GOOGLE_MAPS_API_KEY";
  const GOOGLE_MAPS_SCRIPT_ID = "geography-of-guilt-google-maps";
  const GOOGLE_MAPS_CALLBACK_NAME = "__geographyOfGuiltMapsReady";

  const DEFAULT_MAP_CENTER = Object.freeze({ lat: 59.9311, lng: 30.3609 });
  const DEFAULT_MAP_ZOOM = 13;
  const DEFAULT_SCENE_ZOOM = 16;

  const SCENE_PACING = Object.freeze({
    secondary: Object.freeze({ zoomDelay: 320, infoDelay: 560, mediaRevealDelay: 1180 }),
    important: Object.freeze({ zoomDelay: 520, infoDelay: 860, mediaRevealDelay: 1560 }),
    major: Object.freeze({ zoomDelay: 820, infoDelay: 1280, mediaRevealDelay: 2020 })
  });

  const ROUTE_STYLE = Object.freeze({
    strokeColor: "#b9ab93",
    strokeOpacity: 0.6,
    strokeWeight: 3
  });

  const ACTIVE_MAJOR_PIN_STYLE = Object.freeze({
    background: "#e7decf",
    borderColor: "#f7f0e5",
    glyphColor: "#111111",
    scale: 1.28
  });

  const ACTIVE_PIN_STYLE = Object.freeze({
    background: "#d6c8b0",
    borderColor: "#f0e5d5",
    glyphColor: "#111111",
    scale: 1.12
  });

  const IDLE_MAJOR_PIN_STYLE = Object.freeze({
    background: "#8d7a63",
    borderColor: "#c9baa1",
    glyphColor: "#111111",
    scale: 0.98
  });

  const IDLE_PIN_STYLE = Object.freeze({
    background: "#585049",
    borderColor: "#84786d",
    glyphColor: "#111111",
    scale: 0.88
  });

  let mapsLoaderPromise = null;

  function isConfiguredApiKey(apiKey) {
    return Boolean(apiKey) && apiKey !== GOOGLE_MAPS_PLACEHOLDER_KEY;
  }

  function toLatLngLiteral(scene) {
    return { lat: scene.lat, lng: scene.lng };
  }

  function resolveScenePacing(scene) {
    return SCENE_PACING[scene.importance] || SCENE_PACING.secondary;
  }

  function resolvePinStyle(scene, isActive) {
    if (isActive) {
      return scene.isMajorTurningPoint ? ACTIVE_MAJOR_PIN_STYLE : ACTIVE_PIN_STYLE;
    }

    return scene.isMajorTurningPoint ? IDLE_MAJOR_PIN_STYLE : IDLE_PIN_STYLE;
  }

  function createMarkerPin(PinElement, scene, isActive) {
    return new PinElement(resolvePinStyle(scene, isActive)).element;
  }

  function buildInfoWindowContent(scene) {
    return `
      <div class="map-popover">
        <span class="map-popover__meta">${scene.dayLabel} · ${scene.importanceLabel}</span>
        <strong class="map-popover__title">${scene.title}</strong>
        <span class="map-popover__location">${scene.locationName}</span>
        <span class="map-popover__address">${scene.modernAddress}</span>
      </div>
    `;
  }

  function loadGoogleMapsApi(apiKey) {
    if (window.google?.maps) {
      return Promise.resolve(window.google.maps);
    }

    if (mapsLoaderPromise) {
      return mapsLoaderPromise;
    }

    mapsLoaderPromise = new Promise((resolve, reject) => {
      window[GOOGLE_MAPS_CALLBACK_NAME] = () => {
        resolve(window.google.maps);
        delete window[GOOGLE_MAPS_CALLBACK_NAME];
      };

      const existingScript = document.getElementById(GOOGLE_MAPS_SCRIPT_ID);
      if (existingScript) {
        return;
      }

      const script = document.createElement("script");
      script.id = GOOGLE_MAPS_SCRIPT_ID;
      script.src =
        `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}` +
        `&loading=async&callback=${GOOGLE_MAPS_CALLBACK_NAME}&v=weekly&libraries=marker`;
      script.async = true;
      script.defer = true;
      script.onerror = () => {
        reject(new Error("Google Maps could not load. Check your API key, billing, and allowed referrers."));
        delete window[GOOGLE_MAPS_CALLBACK_NAME];
      };

      document.head.append(script);
    });

    return mapsLoaderPromise;
  }

  class SceneMapController {
    constructor(elements) {
      this.mapElement = elements.mapElement;
      this.placeholderElement = elements.placeholderElement;
      this.placeholderTitleElement = elements.placeholderTitleElement;
      this.placeholderCopyElement = elements.placeholderCopyElement;
      this.statusElement = elements.statusElement;

      this.googleMaps = null;
      this.map = null;
      this.infoWindow = null;
      this.routeLine = null;
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

    async initialize({ apiKey, mapId, scenes }) {
      this.scenes = scenes.slice();
      this.sceneLookup = new Map(this.scenes.map((scene) => [scene.id, scene]));

      if (!isConfiguredApiKey(apiKey)) {
        this.showPlaceholder(
          "Google Maps needs your API key.",
          "Add your browser-restricted Maps JavaScript API key in index.html to activate the live map panel."
        );
        this.setStatus("Google Maps is disabled until an API key is configured.");
        return false;
      }

      try {
        await loadGoogleMapsApi(apiKey);
        await this.buildMap(mapId);
        this.hidePlaceholder();
        this.isReady = true;
        this.setStatus("Google Maps is active. Move through the scenes to follow the route.");
        return true;
      } catch (error) {
        this.showPlaceholder("Google Maps could not load.", error.message);
        this.setStatus(error.message);
        return false;
      }
    }

    async buildMap(mapId) {
      const { Map, InfoWindow, Polyline } = await google.maps.importLibrary("maps");
      const { AdvancedMarkerElement, PinElement } = await google.maps.importLibrary("marker");

      this.googleMaps = { Map, InfoWindow, Polyline, AdvancedMarkerElement, PinElement };
      this.infoWindow = new InfoWindow();

      this.map = new Map(this.mapElement, {
        center: DEFAULT_MAP_CENTER,
        zoom: DEFAULT_MAP_ZOOM,
        mapId: mapId || "DEMO_MAP_ID",
        disableDefaultUI: true,
        zoomControl: true,
        fullscreenControl: true,
        streetViewControl: true,
        gestureHandling: "greedy",
        clickableIcons: false
      });

      this.routeLine = new Polyline({
        map: this.map,
        path: this.scenes.map(toLatLngLiteral),
        ...ROUTE_STYLE
      });

      this.scenes.forEach((scene) => {
        const marker = new AdvancedMarkerElement({
          map: this.map,
          position: toLatLngLiteral(scene),
          title: scene.title,
          content: createMarkerPin(PinElement, scene, false)
        });

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
      this.map.panTo(toLatLngLiteral(scene));

      this.pendingZoomTimer = window.setTimeout(() => {
        this.map.setZoom(scene.mapZoom || DEFAULT_SCENE_ZOOM);
      }, pacing.zoomDelay);

      this.pendingInfoTimer = window.setTimeout(() => {
        const marker = this.markers.get(scene.id);
        if (!marker) {
          return;
        }

        this.infoWindow.setContent(buildInfoWindowContent(scene));
        this.infoWindow.open({
          anchor: marker,
          map: this.map
        });
      }, pacing.infoDelay);

      return pacing;
    }

    clearPendingFocus() {
      window.clearTimeout(this.pendingZoomTimer);
      window.clearTimeout(this.pendingInfoTimer);
    }

    updateMarkerStates(activeSceneId) {
      if (!this.googleMaps) {
        return;
      }

      const { PinElement } = this.googleMaps;

      this.markers.forEach((marker, sceneId) => {
        const scene = this.sceneLookup.get(sceneId);
        marker.content = createMarkerPin(PinElement, scene, sceneId === activeSceneId);
      });
    }

    refreshLayout() {
      if (!this.isReady || !this.map || !window.google?.maps?.event) {
        return;
      }

      const activeScene = this.sceneLookup.get(this.activeSceneId);

      window.google.maps.event.trigger(this.map, "resize");

      if (activeScene) {
        window.setTimeout(() => {
          this.map.panTo(toLatLngLiteral(activeScene));
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
