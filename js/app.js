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
    let hasCompleted = false;
    let fallbackTimerId = null;

    function completeReveal() {
      if (hasCompleted) {
        return;
      }

      hasCompleted = true;

      if (fallbackTimerId) {
        globalScope.clearTimeout(fallbackTimerId);
      }

      elements.pageElement.classList.remove("is-intro-active", "is-intro-leaving");
      elements.introElement.hidden = true;
      elements.introElement.setAttribute("aria-hidden", "true");
      mapController.setInteractivity(true);
    }

    function revealMap() {
      if (hasStarted) {
        return;
      }

      hasStarted = true;
      elements.introElement.setAttribute("aria-hidden", "true");
      elements.pageElement.classList.add("is-intro-leaving");

      fallbackTimerId = globalScope.setTimeout(completeReveal, INTRO_TRANSITION_MS + 120);
    }

    function handleIntroTransitionEnd(event) {
      if (
        event.target === elements.introElement &&
        event.propertyName === "opacity" &&
        hasStarted
      ) {
        completeReveal();
      }
    }

    if (!elements.introElement || !elements.pageElement) {
      mapController.setInteractivity(true);
      return;
    }

    elements.introElement.setAttribute("aria-hidden", "false");
    elements.introElement.addEventListener("click", revealMap);
    elements.introElement.addEventListener("transitionend", handleIntroTransitionEnd);
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
