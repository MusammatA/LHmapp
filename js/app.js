(function initializeApplication(globalScope) {
  const { MAP_LOCATIONS } = globalScope.GeographyOfGuiltData;
  const { SceneMapController } = globalScope.GeographyOfGuiltMap;

  function createMapElements() {
    return {
      mapElement: document.getElementById("map"),
      placeholderElement: document.querySelector("[data-map-placeholder]"),
      placeholderTitleElement: document.querySelector("[data-map-placeholder-title]"),
      placeholderCopyElement: document.querySelector("[data-map-placeholder-copy]")
    };
  }

  function bootMap() {
    const mapElements = createMapElements();
    const mapController = new SceneMapController(mapElements);

    mapController.initialize({
      locations: MAP_LOCATIONS
    });
  }

  bootMap();
})(window);
