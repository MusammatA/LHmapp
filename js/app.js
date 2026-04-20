(function initializeApplication(globalScope) {
  const { SCENES } = globalScope.GeographyOfGuiltData;
  const { SceneMapController } = globalScope.GeographyOfGuiltMap;

  function createMapElements() {
    return {
      mapElement: document.getElementById("map"),
      placeholderElement: document.querySelector("[data-map-placeholder]"),
      placeholderTitleElement: document.querySelector("[data-map-placeholder-title]"),
      placeholderCopyElement: document.querySelector("[data-map-placeholder-copy]")
    };
  }

  function normalizeLocationLabel(locationName) {
    const normalized = locationName.toLowerCase();

    if (normalized.includes("pawnbroker")) {
      return "Pawnbroker's House";
    }

    if (normalized.includes("haymarket tavern")) {
      return "Haymarket Tavern";
    }

    if (normalized.includes("haymarket square") || normalized.includes("sennaya")) {
      return "Haymarket Square";
    }

    if (normalized.includes("marmeladov family")) {
      return "Marmeladov Home";
    }

    if (normalized.includes("raskolnikov")) {
      return "Raskolnikov's Room";
    }

    if (normalized.includes("razumihin")) {
      return "Razumihin's Place";
    }

    if (normalized.includes("voznesenskiy")) {
      return "Voznesenskiy Most";
    }

    if (normalized.includes("petrovsky")) {
      return "Petrovsky Island";
    }

    if (normalized.includes("police station")) {
      return "Police Station";
    }

    if (normalized.includes("loot hiding")) {
      return "Loot Rock";
    }

    if (normalized.includes("crystal palace")) {
      return "Crystal Palace";
    }

    if (normalized.includes("pulcheria and dounia")) {
      return "Family Lodging";
    }

    if (normalized.includes("porfiry")) {
      return "Porfiry's Office";
    }

    if (normalized.includes("luzhin")) {
      return "Luzhin's Rooms";
    }

    if (normalized.includes("sonya")) {
      return "Sonya's Room";
    }

    if (normalized.includes("svidrigailov")) {
      return "Svidrigailov's Tavern";
    }

    if (normalized.includes("crossroads")) {
      return "Street Crossroads";
    }

    if (normalized.includes("omsk") || normalized.includes("siberian")) {
      return "Siberia";
    }

    return locationName
      .replace(/\s+district anchor$/i, "")
      .replace(/\s+district stand-in$/i, "")
      .replace(/\s+anchor$/i, "")
      .trim();
  }

  function buildMapLocations(scenes) {
    const locationMap = new Map();

    scenes.forEach((scene) => {
      const key = `${scene.lat}:${scene.lng}:${scene.locationName}`;

      if (locationMap.has(key)) {
        return;
      }

      locationMap.set(key, {
        lat: scene.lat,
        lng: scene.lng,
        label: normalizeLocationLabel(scene.locationName)
      });
    });

    return Array.from(locationMap.values());
  }

  function bootMap() {
    const mapElements = createMapElements();
    const mapController = new SceneMapController(mapElements);

    mapController.initialize({
      locations: buildMapLocations(SCENES)
    });
  }

  bootMap();
})(window);
