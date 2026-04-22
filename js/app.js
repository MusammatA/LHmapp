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

  function wait(duration) {
    return new Promise((resolve) => {
      globalScope.setTimeout(resolve, duration);
    });
  }

  function unique(values) {
    return Array.from(new Set(values));
  }

  function slugifyLabel(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  function resolveStoryMood(event) {
    if (event.id === "sonya-apartment") {
      return "redemption";
    }

    if (event.phase === "The Murder") {
      return "rupture";
    }

    if (event.phase === "After the Murder") {
      return "aftermath";
    }

    return "foreboding";
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
    if (Array.isArray(event.mediaFiles) && event.mediaFiles.length) {
      return event.mediaFiles.slice();
    }

    const slideNumber = Number(String(event.mediaBaseName || "").replace("slide", ""));
    const folderCandidates = SUPPORTED_MEDIA_EXTENSIONS.map(
      (extension) => `Slide ${slideNumber}/${event.mediaBaseName}${extension}`
    );
    const directCandidates = SUPPORTED_MEDIA_EXTENSIONS.map((extension) => `${event.mediaBaseName}${extension}`);

    return unique([...folderCandidates, ...directCandidates]);
  }

  function buildMediaItems(event) {
    let imageCount = 0;
    let videoCount = 0;

    return buildMediaCandidates(event)
      .map((path, index) => {
        const type = inferMediaType(path);

        if (type === "unknown") {
          return null;
        }

        let label = "";

        if (type === "video") {
          videoCount += 1;
          label = videoCount === 1 ? "Video" : `Video ${videoCount}`;
        } else {
          imageCount += 1;
          label = imageCount === 1 ? "Location" : imageCount === 2 ? "Character" : `Scene ${imageCount - 1}`;
        }

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
      infoToggleButton: document.querySelector("[data-info-toggle]"),
      infoDrawerElement: document.querySelector("[data-info-drawer]"),
      infoBackdropElement: document.querySelector("[data-info-backdrop]"),
      infoCloseButton: document.querySelector("[data-info-close]"),
      infoTabButtons: Array.from(document.querySelectorAll("[data-info-tab]")),
      infoPanels: Array.from(document.querySelectorAll("[data-info-panel]")),
      storyVeilElement: document.querySelector("[data-story-veil]"),
      storyModeElement: document.querySelector("[data-story-mode]"),
      storyPanelElement: document.querySelector("[data-story-panel]"),
      storyCountElement: document.querySelector("[data-story-count]"),
      storyPhaseElement: document.querySelector("[data-story-phase]"),
      storyContentElement: document.querySelector("[data-story-content]"),
      storyDayRangeElement: document.querySelector("[data-story-day-range]"),
      storyMediaFrameElement: document.querySelector("[data-story-media-frame]"),
      storyMediaStageElement: document.querySelector(".story-panel__media-stage"),
      storyMediaImageElement: document.querySelector("[data-story-media-image]"),
      storyMediaVideoElement: document.querySelector("[data-story-media-video]"),
      storyMediaGalleryElement: document.querySelector("[data-story-media-gallery]"),
      storyMediaFallbackElement: document.querySelector("[data-story-media-fallback]"),
      storyLocationElement: document.querySelector("[data-story-location]"),
      storyAddressElement: document.querySelector("[data-story-address]"),
      storyDescriptionElement: document.querySelector("[data-story-description]"),
      storyDetailsElement: document.querySelector("[data-story-details]"),
      storyQuoteElement: document.querySelector("[data-story-quote]"),
      storyQuoteSourceElement: document.querySelector("[data-story-quote-source]"),
      storyAnalysisElement: document.querySelector("[data-story-analysis]"),
      storySourceLinkElement: document.querySelector("[data-story-source-link]"),
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

    function normalizeStoryIndex(index) {
      if (!Number.isInteger(index)) {
        return 0;
      }

      return Math.min(Math.max(index, 0), STORY_EVENTS.length - 1);
    }

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

    function applyStoryMood(event) {
      const mood = resolveStoryMood(event);
      const phase = slugifyLabel(event.phase);

      elements.storyModeElement.dataset.mood = mood;
      elements.storyPanelElement.dataset.mood = mood;
      elements.storyPanelElement.dataset.phase = phase;
      elements.pageElement.dataset.storyMood = mood;
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

    function setStagePresentation(type, source = "") {
      elements.storyMediaStageElement.dataset.stageMedia = type;

      if (type === "image" && source) {
        elements.storyMediaStageElement.style.setProperty("--story-stage-image", `url("${source}")`);
        return;
      }

      elements.storyMediaStageElement.style.removeProperty("--story-stage-image");
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

        const previewFrame = document.createElement("span");
        previewFrame.className = "story-media-thumb__frame";

        if (item.type === "image") {
          const thumbnail = document.createElement("img");
          thumbnail.className = "story-media-thumb__image";
          thumbnail.src = item.src;
          thumbnail.alt = "";
          previewFrame.append(thumbnail);
        } else {
          previewFrame.classList.add("story-media-thumb__frame--video");
          const badge = document.createElement("span");
          badge.className = "story-media-thumb__video-badge";
          badge.textContent = "Video";
          previewFrame.append(badge);
        }

        const caption = document.createElement("span");
        caption.className = "story-media-thumb__caption";
        caption.textContent = item.label;

        button.append(previewFrame, caption);

        if (item.type === "video") {
          const badge = document.createElement("span");
          badge.className = "story-media-thumb__audio-note";
          badge.textContent = "Sound available";
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
      setStagePresentation("none");
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
          setStagePresentation("video");
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
          setStagePresentation("image", item.src);
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

    function renderStoryNotes(event) {
      const hasQuote = Boolean(event.quote);
      const hasAnalysis = Boolean(event.analysis);
      const hasSourceUrl = Boolean(event.sourceUrl);
      const hasExpandableContent = hasQuote || hasAnalysis || hasSourceUrl;

      if (!elements.storyDetailsElement) {
        return;
      }

      elements.storyDetailsElement.open = false;
      elements.storyDetailsElement.hidden = !hasExpandableContent;

      if (!hasExpandableContent) {
        return;
      }

      elements.storyQuoteElement.textContent = event.quote || "";
      elements.storyQuoteSourceElement.textContent = event.quoteSource || "";
      elements.storyQuoteSourceElement.hidden = !event.quoteSource;
      elements.storyAnalysisElement.textContent = event.analysis || "";

      if (hasSourceUrl) {
        elements.storySourceLinkElement.href = event.sourceUrl;
        elements.storySourceLinkElement.hidden = false;
      } else {
        elements.storySourceLinkElement.hidden = true;
        elements.storySourceLinkElement.removeAttribute("href");
      }
    }

    function renderSlide() {
      const event = getCurrentEvent();

      applyStoryMood(event);
      elements.storyCountElement.textContent = `${state.currentIndex + 1} / ${STORY_EVENTS.length}`;
      elements.storyPhaseElement.textContent = event.phase;
      elements.storyDayRangeElement.textContent = event.dayRange;
      elements.storyLocationElement.textContent = event.locationName;
      elements.storyAddressElement.textContent = event.address;
      elements.storyDescriptionElement.textContent = event.description;
      renderStoryNotes(event);
      updateTimeline(event);
      renderMedia(event);
      if (elements.storyContentElement) {
        elements.storyContentElement.scrollTop = 0;
      }

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
      delete elements.pageElement.dataset.storyMood;
    }

    async function enterStoryMode(startIndex = 0) {
      if (!STORY_EVENTS.length || state.isBusy) {
        return;
      }

      state.isBusy = true;
      state.currentIndex = normalizeStoryIndex(startIndex);
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

    function openStoryAtSlide(index) {
      return enterStoryMode(index);
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
        elements.storyContentElement,
        elements.storyDayRangeElement,
        elements.storyMediaFrameElement,
        elements.storyMediaStageElement,
        elements.storyMediaImageElement,
        elements.storyMediaVideoElement,
        elements.storyMediaGalleryElement,
        elements.storyMediaFallbackElement,
        elements.storyLocationElement,
        elements.storyAddressElement,
        elements.storyDescriptionElement,
        elements.storyDetailsElement,
        elements.storyQuoteElement,
        elements.storyQuoteSourceElement,
        elements.storyAnalysisElement,
        elements.storySourceLinkElement,
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

      elements.launchButton.addEventListener("click", () => {
        openStoryAtSlide(0);
      });
      elements.storyNextButton.addEventListener("click", handleNext);
      elements.storyBackButton.addEventListener("click", handleBack);
    }

    attachEvents();

    return Object.freeze({
      openAtSlide: openStoryAtSlide
    });
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

  function createInfoDrawerController(elements) {
    const requiredElements = [
      elements.pageElement,
      elements.infoToggleButton,
      elements.infoDrawerElement,
      elements.infoBackdropElement,
      elements.infoCloseButton
    ];

    if (!requiredElements.every(Boolean)) {
      return;
    }

    const state = {
      isOpen: false,
      activeTab: "guide"
    };

    function renderTabs() {
      elements.infoTabButtons.forEach((button) => {
        const isActive = button.dataset.infoTab === state.activeTab;
        button.classList.toggle("is-active", isActive);
        button.setAttribute("aria-selected", String(isActive));
        button.tabIndex = isActive ? 0 : -1;
      });

      elements.infoPanels.forEach((panel) => {
        panel.hidden = panel.dataset.infoPanel !== state.activeTab;
      });
    }

    function openDrawer() {
      state.isOpen = true;
      elements.infoDrawerElement.hidden = false;
      elements.infoBackdropElement.hidden = false;
      elements.infoToggleButton.setAttribute("aria-expanded", "true");
      elements.pageElement.classList.add("is-info-drawer-open");

      globalScope.requestAnimationFrame(() => {
        elements.infoDrawerElement.classList.add("is-visible");
        elements.infoBackdropElement.classList.add("is-visible");
      });
    }

    function closeDrawer() {
      state.isOpen = false;
      elements.infoToggleButton.setAttribute("aria-expanded", "false");
      elements.infoDrawerElement.classList.remove("is-visible");
      elements.infoBackdropElement.classList.remove("is-visible");
      elements.pageElement.classList.remove("is-info-drawer-open");

      globalScope.setTimeout(() => {
        if (state.isOpen) {
          return;
        }

        elements.infoDrawerElement.hidden = true;
        elements.infoBackdropElement.hidden = true;
      }, 260);
    }

    function toggleDrawer() {
      if (state.isOpen) {
        closeDrawer();
        return;
      }

      openDrawer();
    }

    function selectTab(tabKey) {
      state.activeTab = tabKey;
      renderTabs();
    }

    renderTabs();

    elements.infoToggleButton.addEventListener("click", toggleDrawer);
    elements.infoCloseButton.addEventListener("click", closeDrawer);
    elements.infoBackdropElement.addEventListener("click", closeDrawer);
    elements.infoTabButtons.forEach((button) => {
      button.addEventListener("click", () => {
        selectTab(button.dataset.infoTab || "guide");
      });
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && state.isOpen) {
        closeDrawer();
      }
    });
  }

  function bootMap() {
    const elements = createElements();
    const mapController = new SceneMapController(elements);
    const shouldLockMapAtStart = Boolean(elements.introElement);

    mapController.initialize({
      locations: MAP_LOCATIONS,
      interactive: !shouldLockMapAtStart
    });

    const storyController = createStoryController(elements, mapController);
    mapController.setLocationSelectHandler((location) => {
      if (!Number.isInteger(location.slideIndex)) {
        return;
      }

      storyController.openAtSlide(location.slideIndex - 1);
    });
    createInfoDrawerController(elements);
    createIntroController(elements, mapController);
  }

  bootMap();
})(window);
