(function initializeApplication(globalScope) {
  const { MAP_LOCATIONS } = globalScope.GeographyOfGuiltData;
  const { SceneMapController } = globalScope.GeographyOfGuiltMap;
  const INTRO_TRANSITION_MS = 1200;

  function createMapElements() {
    return {
      pageElement: document.querySelector(".map-page"),
      mapElement: document.getElementById("map"),
      introElement: document.querySelector("[data-intro-screen]"),
      placeholderElement: document.querySelector("[data-map-placeholder]"),
      placeholderTitleElement: document.querySelector("[data-map-placeholder-title]"),
      placeholderCopyElement: document.querySelector("[data-map-placeholder-copy]")
    };
  }

  function createIntroController(elements, mapController) {
    let hasStarted = false;

    function revealMap() {
      if (hasStarted) {
        return;
      }

      hasStarted = true;
      elements.pageElement.classList.add("is-intro-leaving");

      globalScope.setTimeout(() => {
        elements.pageElement.classList.remove("is-intro-active", "is-intro-leaving");
        elements.introElement.hidden = true;
        mapController.setInteractivity(true);
      }, INTRO_TRANSITION_MS);
    }

    if (!elements.introElement || !elements.pageElement) {
      mapController.setInteractivity(true);
      return;
    }

    elements.introElement.addEventListener("click", revealMap);
  }

  function bootMap() {
    const mapElements = createMapElements();
    const mapController = new SceneMapController(mapElements);
    const hasIntroScreen = Boolean(mapElements.introElement && mapElements.pageElement);

    createIntroController(mapElements, mapController);

    mapController.initialize({
      locations: MAP_LOCATIONS,
      interactive: !hasIntroScreen
    });
  }

  bootMap();
})(window);
