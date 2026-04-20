(function initializeApplication(globalScope) {
  const { MAP_LOCATIONS, STORY_EVENTS } = globalScope.GeographyOfGuiltData;
  const { SceneMapController } = globalScope.GeographyOfGuiltMap;

  const BLACKOUT_MS = 700;
  const INTRO_TRANSITION_MS = 1200;
  const STORY_REVEAL_DELAY_MS = 120;
  const SLIDE_TRANSITION_MS = 340;
  const STORY_TIMELINE_DAYS = 14;
  const SUPPORTED_MEDIA_EXTENSIONS = Object.freeze([
    ".png",
    ".jpg",
    ".jpeg",
    ".webp",
    ".mp4",
    ".mov",
    ".webm"
  ]);
  const VIDEO_MEDIA_EXTENSIONS = new Set([".mp4", ".mov", ".webm"]);
  const SLIDE_MEDIA_MANIFEST = Object.freeze({
    slide1: Object.freeze(["Slide 1/rosh.png", "Slide 1/e6.png"]),
    slide2: Object.freeze(["Slide 2/tavern.jpg", "Slide 2/e2.png"]),
    slide3: Object.freeze(["Slide 3/marmeladovH.webp", "Slide 3/e3.png"]),
    slide4: Object.freeze([
      "Slide 4/FD41-De-woonkamer-van-Raskolnikov.jpg",
      "Slide 4/rosh copy.png",
      "Slide 4/c04fa1bf-d5d4-483d-9800-cfe4eb52fd5a.png"
    ]),
    slide5: Object.freeze([
      "Slide 5/building-st-petersburg-stock-exchange-260nw-734073691.webp",
      "Slide 5/194a76ff-3947-4def-bc64-9ca6b1822cd9.png"
    ]),
    slide6: Object.freeze([
      "Slide 6/614._St._Petersburg._Konnogvardeisky_Boulevard,_17.jpg",
      "Slide 6/105ba91a-272f-4eff-9616-9b5c9aa091d5.png"
    ]),
    slide7: Object.freeze([
      "Slide 7/anglijskaya-naberezhnaya-6-915x604.jpg",
      "Slide 7/horseScene.webp",
      "Slide 7/ace92fab-e747-43d0-ad85-3443e7887c6c.png",
      "Slide 7/1b4f6ce7-382f-4711-b956-834f71b8fa82.png"
    ]),
    slide8: Object.freeze(["Slide 8/heymarket.jpg", "Slide 8/15111941-cbd5-4d10-bc0e-367023979ba4.png"]),
    slide9: Object.freeze(["Slide 9/e9.mp4", "Slide 9/pawnhous.jpeg"]),
    slide10: Object.freeze(["Slide 10/download.jpeg", "Slide 10/a9ed19c1-0980-4c4b-ace3-19137ac44ba6.png"]),
    slide11: Object.freeze(["Slide 11/71tYOaO29mL._AC_UF894,1000_QL80_.jpg", "Slide 11/9c058041-ea2e-45f7-b23f-1c24e8aed2a5.png"]),
    slide12: Object.freeze(["Slide 12/305140_doc1.jpg", "Slide 12/e3ac2615-adca-432c-875b-763516a79d8a.png"]),
    slide13: Object.freeze(["Slide 13/bridge.jpeg", "Slide 13/7786dad1-c3b0-4014-9850-375e6dc545f8.png"]),
    slide14: Object.freeze(["Slide 14/96_big.jpg", "Slide 14/36df63a7-94e9-4ad9-b112-223053bb0106.png"])
  });

  function wait(duration) {
    return new Promise((resolve) => {
      globalScope.setTimeout(resolve, duration);
    });
  }

  function unique(values) {
    return Array.from(new Set(values));
  }

  function inferMediaType(path) {
    const normalizedPath = path.toLowerCase();
    const extension = SUPPORTED_MEDIA_EXTENSIONS.find((suffix) => normalizedPath.endsWith(suffix));

    if (!extension) {
      return "unknown";
    }

    return VIDEO_MEDIA_EXTENSIONS.has(extension) ? "video" : "image";
  }

  function buildMediaCandidates(event) {
    const slideNumber = Number(event.mediaBaseName.replace("slide", ""));
    const folderCandidates = SUPPORTED_MEDIA_EXTENSIONS.map(
      (extension) => `Slide ${slideNumber}/${event.mediaBaseName}${extension}`
    );
    const directCandidates = SUPPORTED_MEDIA_EXTENSIONS.map((extension) => `${event.mediaBaseName}${extension}`);
    const manifestCandidates = SLIDE_MEDIA_MANIFEST[event.mediaBaseName] || [];

    if (manifestCandidates.length) {
      return manifestCandidates.slice();
    }

    return unique([...folderCandidates, ...directCandidates]);
  }

  function buildMediaItems(event) {
    return buildMediaCandidates(event)
      .map((path, index) => {
        const type = inferMediaType(path);

        if (type === "unknown") {
          return null;
        }

        const label = type === "video" ? "Video" : `Still ${index + 1}`;

        return {
          id: `${event.id}-${index}`,
          path,
          src: encodeURI(path),
          type,
          label
        };
      })
      .filter(Boolean);
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
      storyDayRangeElement: document.querySelector("[data-story-day-range]"),
      storyMediaFrameElement: document.querySelector("[data-story-media-frame]"),
      storyMediaImageElement: document.querySelector("[data-story-media-image]"),
      storyMediaVideoElement: document.querySelector("[data-story-media-video]"),
      storyMediaGalleryElement: document.querySelector("[data-story-media-gallery]"),
      storyMediaFallbackElement: document.querySelector("[data-story-media-fallback]"),
      storyLocationElement: document.querySelector("[data-story-location]"),
      storyAddressElement: document.querySelector("[data-story-address]"),
      storyDescriptionElement: document.querySelector("[data-story-description]"),
      storyTimelineRangeElement: document.querySelector("[data-story-timeline-range]"),
      storyTimelineMarkerElement: document.querySelector("[data-story-timeline-marker]"),
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
      hasCompletedSequence: false,
      mediaItems: [],
      activeMediaIndex: 0,
      mediaRequestToken: 0
    };

    function getCurrentEvent() {
      return STORY_EVENTS[state.currentIndex];
    }

    function updateTimeline(event) {
      const timelineWidth = Math.max(0, event.timelineEndDay - event.timelineStartDay);
      const rangeLeft = ((event.timelineStartDay - 1) / (STORY_TIMELINE_DAYS - 1)) * 100;
      const rangeWidth = (timelineWidth / (STORY_TIMELINE_DAYS - 1)) * 100;
      const markerLeft = ((event.timelineEndDay - 1) / (STORY_TIMELINE_DAYS - 1)) * 100;

      elements.storyTimelineRangeElement.style.left = `${rangeLeft}%`;
      elements.storyTimelineRangeElement.style.width = `${rangeWidth}%`;
      elements.storyTimelineMarkerElement.style.left = `${markerLeft}%`;
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

    function updateMediaGallerySelection() {
      Array.from(elements.storyMediaGalleryElement.querySelectorAll("[data-story-media-thumb]")).forEach(
        (button, index) => {
          button.classList.toggle("is-active", index === state.activeMediaIndex);
        }
      );
    }

    function renderMediaGallery() {
      elements.storyMediaGalleryElement.replaceChildren();

      if (state.mediaItems.length <= 1) {
        elements.storyMediaGalleryElement.hidden = true;
        return;
      }

      state.mediaItems.forEach((item, index) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "story-media-thumb";
        button.dataset.storyMediaThumb = item.id;
        button.dataset.mediaType = item.type;
        button.setAttribute("aria-label", `View ${item.label}`);

        if (item.type === "image") {
          const thumbnail = document.createElement("img");
          thumbnail.className = "story-media-thumb__image";
          thumbnail.src = item.src;
          thumbnail.alt = "";
          button.append(thumbnail);
        } else {
          const badge = document.createElement("span");
          badge.className = "story-media-thumb__label";
          badge.textContent = item.label;
          button.append(badge);
        }

        button.addEventListener("click", () => {
          if (index === state.activeMediaIndex) {
            return;
          }

          state.activeMediaIndex = index;
          updateMediaGallerySelection();
          renderActiveMedia();
        });

        elements.storyMediaGalleryElement.append(button);
      });

      elements.storyMediaGalleryElement.hidden = false;
      updateMediaGallerySelection();
    }

    function resetMediaElements() {
      elements.storyMediaImageElement.onload = null;
      elements.storyMediaImageElement.onerror = null;
      elements.storyMediaImageElement.hidden = true;
      elements.storyMediaImageElement.removeAttribute("src");
      elements.storyMediaImageElement.alt = "";

      elements.storyMediaVideoElement.onloadeddata = null;
      elements.storyMediaVideoElement.onerror = null;
      elements.storyMediaVideoElement.pause();
      elements.storyMediaVideoElement.hidden = true;
      elements.storyMediaVideoElement.removeAttribute("src");
      elements.storyMediaVideoElement.load();

      elements.storyMediaFallbackElement.hidden = true;
      elements.storyMediaFrameElement.dataset.mediaState = "loading";
    }

    function showMediaFallback() {
      resetMediaElements();
      elements.storyMediaFallbackElement.hidden = false;
      elements.storyMediaFrameElement.dataset.mediaState = "fallback";
    }

    function loadMediaItem(index, token) {
      if (token !== state.mediaRequestToken) {
        return;
      }

      const item = state.mediaItems[index];

      if (!item) {
        showMediaFallback();
        return;
      }

      if (item.type === "video") {
        resetMediaElements();

        elements.storyMediaVideoElement.onloadeddata = () => {
          if (token !== state.mediaRequestToken) {
            return;
          }

          elements.storyMediaVideoElement.onloadeddata = null;
          elements.storyMediaVideoElement.onerror = null;
          elements.storyMediaVideoElement.hidden = false;
          elements.storyMediaFrameElement.dataset.mediaState = "video";
        };

        elements.storyMediaVideoElement.onerror = () => {
          elements.storyMediaVideoElement.onloadeddata = null;
          elements.storyMediaVideoElement.onerror = null;
          const nextIndex = state.activeMediaIndex + 1;

          if (nextIndex < state.mediaItems.length) {
            state.activeMediaIndex = nextIndex;
            renderMediaGallery();
            renderActiveMedia();
            return;
          }

          showMediaFallback();
        };

        elements.storyMediaVideoElement.muted = false;
        elements.storyMediaVideoElement.volume = 1;
        elements.storyMediaVideoElement.src = item.src;
        elements.storyMediaVideoElement.load();
        return;
      }

      if (item.type === "image") {
        resetMediaElements();

        elements.storyMediaImageElement.onload = () => {
          if (token !== state.mediaRequestToken) {
            return;
          }

          elements.storyMediaImageElement.onload = null;
          elements.storyMediaImageElement.onerror = null;
          elements.storyMediaImageElement.hidden = false;
          elements.storyMediaFrameElement.dataset.mediaState = "image";
        };

        elements.storyMediaImageElement.onerror = () => {
          elements.storyMediaImageElement.onload = null;
          elements.storyMediaImageElement.onerror = null;
          const nextIndex = state.activeMediaIndex + 1;

          if (nextIndex < state.mediaItems.length) {
            state.activeMediaIndex = nextIndex;
            renderMediaGallery();
            renderActiveMedia();
            return;
          }

          showMediaFallback();
        };

        elements.storyMediaImageElement.alt = `${getCurrentEvent().locationName} media`;
        elements.storyMediaImageElement.src = item.src;
        return;
      }
    }

    function renderActiveMedia() {
      state.mediaRequestToken += 1;
      const token = state.mediaRequestToken;

      if (!state.mediaItems.length) {
        showMediaFallback();
        return;
      }

      updateMediaGallerySelection();
      loadMediaItem(state.activeMediaIndex, token);
    }

    function renderMedia(event) {
      state.mediaItems = buildMediaItems(event);
      state.activeMediaIndex = 0;
      renderMediaGallery();
      renderActiveMedia();
    }

    function renderSlide() {
      const event = getCurrentEvent();

      elements.storyCountElement.textContent = `${state.currentIndex + 1} / ${STORY_EVENTS.length}`;
      elements.storyPhaseElement.textContent = event.phase;
      elements.storyDayRangeElement.textContent = event.dayRange;
      elements.storyLocationElement.textContent = event.locationName;
      elements.storyAddressElement.textContent = event.address;
      elements.storyDescriptionElement.textContent = event.description;
      updateTimeline(event);
      renderMedia(event);

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
      state.mediaRequestToken += 1;
      resetMediaElements();
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
        elements.storyDayRangeElement,
        elements.storyMediaFrameElement,
        elements.storyMediaImageElement,
        elements.storyMediaVideoElement,
        elements.storyMediaGalleryElement,
        elements.storyMediaFallbackElement,
        elements.storyLocationElement,
        elements.storyAddressElement,
        elements.storyDescriptionElement,
        elements.storyTimelineRangeElement,
        elements.storyTimelineMarkerElement,
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
