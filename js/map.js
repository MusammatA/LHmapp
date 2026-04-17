const GOOGLE_MAPS_PLACEHOLDER_KEY = "YOUR_GOOGLE_MAPS_API_KEY";
const GOOGLE_MAPS_SCRIPT_ID = "geography-of-guilt-google-maps";

let googleMapsLoaderPromise;

function hasConfiguredApiKey(apiKey) {
  return Boolean(apiKey) && apiKey !== GOOGLE_MAPS_PLACEHOLDER_KEY;
}

function loadGoogleMapsApi(apiKey) {
  if (window.google && window.google.maps) {
    return Promise.resolve(window.google.maps);
  }

  if (googleMapsLoaderPromise) {
    return googleMapsLoaderPromise;
  }

  googleMapsLoaderPromise = new Promise((resolve, reject) => {
    const callbackName = "__geographyOfGuiltMapsReady";
    const existingScript = document.getElementById(GOOGLE_MAPS_SCRIPT_ID);

    window[callbackName] = () => {
      resolve(window.google.maps);
      delete window[callbackName];
    };

    if (existingScript) {
      return;
    }

    const script = document.createElement("script");
    script.id = GOOGLE_MAPS_SCRIPT_ID;
    script.src =
      `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}` +
      "&loading=async&callback=__geographyOfGuiltMapsReady&v=weekly&libraries=marker";
    script.async = true;
    script.defer = true;
    script.onerror = () => {
      reject(new Error("Google Maps could not load. Check your API key, billing, and allowed referrers."));
      delete window[callbackName];
    };
    document.head.append(script);
  });

  return googleMapsLoaderPromise;
}

function createPinElement(PinElement, isActive) {
  const pin = new PinElement({
    background: isActive ? "#e7decf" : "#585049",
    borderColor: isActive ? "#f7f0e5" : "#84786d",
    glyphColor: "#111111",
    scale: isActive ? 1.16 : 0.88
  });

  return pin.element;
}

function buildInfoMarkup(scene) {
  return `
    <div style="padding: 6px 4px; max-width: 220px;">
      <strong style="display:block; margin-bottom:6px;">${scene.title}</strong>
      <span style="display:block; margin-bottom:4px;">${scene.locationName}</span>
      <span style="color:#555;">${scene.modernAddress}</span>
    </div>
  `;
}

export class SceneMapController {
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
    this.scenes = [];
    this.isReady = false;
    this.zoomTimer = null;
    this.infoTimer = null;
  }

  async initialize({ apiKey, mapId, scenes }) {
    this.scenes = scenes.slice();

    if (!hasConfiguredApiKey(apiKey)) {
      this.showPlaceholder(
        "Google Maps needs your API key.",
        "Add your browser-restricted Maps JavaScript API key in index.html to activate the live map panel."
      );
      this.setStatus("Google Maps is disabled until an API key is configured.");
      return false;
    }

    try {
      await loadGoogleMapsApi(apiKey);
      await this.createMap(mapId);
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

  async createMap(mapId) {
    const { Map, InfoWindow, Polyline } = await google.maps.importLibrary("maps");
    const { AdvancedMarkerElement, PinElement } = await google.maps.importLibrary("marker");

    this.googleMaps = { Map, InfoWindow, Polyline, AdvancedMarkerElement, PinElement };
    this.infoWindow = new InfoWindow();

    this.map = new Map(this.mapElement, {
      center: { lat: 59.9311, lng: 30.3609 },
      zoom: 13,
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
      path: this.scenes.map((scene) => ({ lat: scene.lat, lng: scene.lng })),
      strokeColor: "#b9ab93",
      strokeOpacity: 0.6,
      strokeWeight: 3
    });

    this.scenes.forEach((scene) => {
      const marker = new AdvancedMarkerElement({
        map: this.map,
        position: { lat: scene.lat, lng: scene.lng },
        title: scene.title,
        content: createPinElement(PinElement, false)
      });

      this.markers.set(scene.id, marker);
    });
  }

  focusScene(scene) {
    if (!this.isReady || !this.map || !scene) {
      return;
    }

    this.setStatus(`${scene.locationName} — ${scene.modernAddress}`);
    this.updateMarkerStates(scene.id);

    this.map.panTo({ lat: scene.lat, lng: scene.lng });

    window.clearTimeout(this.zoomTimer);
    window.clearTimeout(this.infoTimer);

    this.zoomTimer = window.setTimeout(() => {
      this.map.setZoom(scene.mapZoom || 16);
    }, 420);

    this.infoTimer = window.setTimeout(() => {
      const marker = this.markers.get(scene.id);
      if (!marker) {
        return;
      }

      this.infoWindow.setContent(buildInfoMarkup(scene));
      this.infoWindow.open({
        anchor: marker,
        map: this.map
      });
    }, 680);
  }

  updateMarkerStates(activeSceneId) {
    if (!this.googleMaps) {
      return;
    }

    const { PinElement } = this.googleMaps;

    this.markers.forEach((marker, sceneId) => {
      marker.content = createPinElement(PinElement, sceneId === activeSceneId);
    });
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
