(function initializeApplication(globalScope) {
  const { MAP_LOCATIONS, STORY_EVENTS } = globalScope.GeographyOfGuiltData;
  const { SceneMapController } = globalScope.GeographyOfGuiltMap;

  const BLACKOUT_MS = 700;
  const INTRO_TRANSITION_MS = 1200;
  const STORY_REVEAL_DELAY_MS = 120;
  const SLIDE_TRANSITION_MS = 340;

  function wait(duration) {
    return new Promise((resolve) => {
      globalScope.setTimeout(resolve, duration);
    });
  }

  function createElements() {
    return {
      pageElement: document.querySelector(".map-page"),
      mapElement: document.getElementById("map"),
      introElement: document.querySelector("[data-intro-screen]"),
      launchButton: document.querySelector("[data-story-launch]"),
      launchLabelElement: document.querySelector("[data-story-launch-label]"),
      storyVeilElement: document.querySelector("[data-story-veil]"),
      storyModeElement: document.querySelector("[data-story-mode]"),
      storyPanelElement: document.querySelector("[data-story-panel]"),
      storyCountElement: document.querySelector("[data-story-count]"),
      storyPhaseElement: document.querySelector("[data-story-phase]"),
      storyLocationElement: document.querySelector("[data-story-location]"),
      storyAddressElement: document.querySelector("[data-story-address]"),
      storyDescriptionElement: document.querySelector("[data-story-description]"),
      storyBackButton: document.querySelector("[data-story-back]"),
      storyNextButton: document.querySelector("[data-story-next]"),
      placeholderElement: document.querySelector("[data-map-placeholder]"),
      placeholderTitleElement: document.querySelector("[data-map-placeholder-title]"),
      placeholderCopyElement: document.querySelector("[data-map-placeholder-copy]")
    };
  }

  function createStoryController(elements, mapController) {
    const state = {
      currentIndex: 0,
      isBusy: false,
      hasCompletedSequence: false
    };

    function getCurrentEvent() {
      return STORY_EVENTS[state.currentIndex];
    }

    function updateLaunchLabel() {
      if (!elements.launchLabelElement) {
        return;
      }

      elements.launchLabelElement.textContent = state.hasCompletedSequence ? "Replay" : "Start";
    }

    function updateNavigationState() {
      const isFirstSlide = state.currentIndex === 0;
      const isLastSlide = state.currentIndex === STORY_EVENTS.length - 1;

      elements.storyBackButton.disabled = state.isBusy || isFirstSlide;
      elements.storyNextButton.disabled = state.isBusy;
      elements.storyNextButton.textContent = isLastSlide ? "Finish" : "Next";
    }

    function renderSlide() {
      const event = getCurrentEvent();

      elements.storyCountElement.textContent = `${state.currentIndex + 1} / ${STORY_EVENTS.length}`;
      elements.storyPhaseElement.textContent = event.phase;
      elements.storyLocationElement.textContent = event.locationName;
      elements.storyAddressElement.textContent = event.address;
      elements.storyDescriptionElement.textContent = event.description;

      updateNavigationState();
    }

    async function transitionSlide(nextIndex) {
      if (
        state.isBusy ||
        nextIndex < 0 ||
        nextIndex >= STORY_EVENTS.length ||
        nextIndex === state.currentIndex
      ) {
        return;
      }

      state.isBusy = true;
      updateNavigationState();
      elements.storyPanelElement.classList.add("is-changing");

      await wait(SLIDE_TRANSITION_MS / 2);

      state.currentIndex = nextIndex;
      renderSlide();

      globalScope.requestAnimationFrame(() => {
        elements.storyPanelElement.classList.remove("is-changing");
      });

      await wait(SLIDE_TRANSITION_MS);

      state.isBusy = false;
      updateNavigationState();
    }

    function showVeil() {
      elements.storyVeilElement.hidden = false;

      globalScope.requestAnimationFrame(() => {
        elements.storyVeilElement.classList.add("is-visible");
      });
    }

    async function hideVeil() {
      elements.storyVeilElement.classList.remove("is-visible");
      await wait(BLACKOUT_MS);
      elements.storyVeilElement.hidden = true;
    }

    function showStoryMode() {
      elements.storyModeElement.hidden = false;

      globalScope.requestAnimationFrame(() => {
        elements.storyModeElement.classList.add("is-visible");
      });
    }

    function hideStoryMode() {
      elements.storyModeElement.classList.remove("is-visible");
      elements.storyModeElement.hidden = true;
    }

    async function enterStoryMode() {
      if (!STORY_EVENTS.length || state.isBusy) {
        return;
      }

      state.isBusy = true;
      state.currentIndex = 0;
      renderSlide();

      elements.launchButton.disabled = true;
      mapController.setInteractivity(false);
      elements.pageElement.classList.add("is-transitioning-to-story");

      showVeil();
      await wait(BLACKOUT_MS);

      elements.pageElement.classList.remove("is-transitioning-to-story");
      elements.pageElement.classList.add("is-story-mode");
      showStoryMode();

      await wait(STORY_REVEAL_DELAY_MS);
      await hideVeil();

      state.isBusy = false;
      updateNavigationState();
    }

    async function returnToMap() {
      if (state.isBusy) {
        return;
      }

      state.isBusy = true;
      updateNavigationState();

      elements.pageElement.classList.add("is-transitioning-to-map");
      showVeil();
      await wait(BLACKOUT_MS);

      hideStoryMode();

      elements.pageElement.classList.remove("is-story-mode", "is-transitioning-to-map");
      state.hasCompletedSequence = true;
      updateLaunchLabel();
      mapController.setInteractivity(true);
      elements.launchButton.disabled = false;

      await wait(STORY_REVEAL_DELAY_MS);
      await hideVeil();

      state.isBusy = false;
      updateNavigationState();
    }

    function handleNext() {
      if (state.currentIndex === STORY_EVENTS.length - 1) {
        returnToMap();
        return;
      }

      transitionSlide(state.currentIndex + 1);
    }

    function handleBack() {
      if (state.currentIndex === 0) {
        return;
      }

      transitionSlide(state.currentIndex - 1);
    }

    function attachEvents() {
      const hasRequiredUi = [
        elements.launchButton,
        elements.storyVeilElement,
        elements.storyModeElement,
        elements.storyPanelElement,
        elements.storyCountElement,
        elements.storyPhaseElement,
        elements.storyLocationElement,
        elements.storyAddressElement,
        elements.storyDescriptionElement,
        elements.storyBackButton,
        elements.storyNextButton
      ].every(Boolean);

      if (!hasRequiredUi) {
        mapController.setInteractivity(true);
        return;
      }

      updateLaunchLabel();
      renderSlide();
      elements.storyModeElement.hidden = true;
      elements.storyVeilElement.hidden = true;

      elements.launchButton.addEventListener("click", enterStoryMode);
      elements.storyNextButton.addEventListener("click", handleNext);
      elements.storyBackButton.addEventListener("click", handleBack);
    }

    attachEvents();
  }

  function createIntroController(elements, mapController) {
    if (!elements.introElement || !elements.pageElement) {
      if (elements.launchButton) {
        elements.launchButton.disabled = false;
      }

      mapController.setInteractivity(true);
      return;
    }

    let hasStarted = false;
    let hasCompleted = false;
    let fallbackTimerId = null;

    if (elements.launchButton) {
      elements.launchButton.disabled = true;
    }

    function completeIntro() {
      if (hasCompleted) {
        return;
      }

      hasCompleted = true;

      if (fallbackTimerId) {
        globalScope.clearTimeout(fallbackTimerId);
      }

      elements.pageElement.classList.remove("is-intro-active", "is-intro-leaving");
      elements.introElement.hidden = true;

      if (elements.launchButton) {
        elements.launchButton.disabled = false;
      }

      mapController.setInteractivity(true);
    }

    function beginIntroDismissal() {
      if (hasStarted) {
        return;
      }

      hasStarted = true;
      elements.pageElement.classList.add("is-intro-leaving");
      fallbackTimerId = globalScope.setTimeout(completeIntro, INTRO_TRANSITION_MS + 120);
    }

    function handleTransitionEnd(event) {
      if (
        event.target === elements.introElement &&
        event.propertyName === "opacity" &&
        hasStarted
      ) {
        completeIntro();
      }
    }

    elements.introElement.addEventListener("click", beginIntroDismissal);
    elements.introElement.addEventListener("transitionend", handleTransitionEnd);
  }

  function bootMap() {
    const elements = createElements();
    const mapController = new SceneMapController(elements);
    const shouldLockMapAtStart = Boolean(elements.introElement);

    mapController.initialize({
      locations: MAP_LOCATIONS,
      interactive: !shouldLockMapAtStart
    });

    createStoryController(elements, mapController);
    createIntroController(elements, mapController);
  }

  bootMap();
})(window);
