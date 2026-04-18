(function attachUIController(globalScope) {
  function queryRequired(selector, root = document) {
    const element = root.querySelector(selector);

    if (!element) {
      throw new Error(`Missing required element: ${selector}`);
    }

    return element;
  }

  function setHidden(element, isHidden) {
    element.hidden = isHidden;
  }

  function setText(element, value = "") {
    element.textContent = value;
  }

  function formatSceneCounter(sceneNumber, totalScenes) {
    return `Scene ${String(sceneNumber).padStart(2, "0")} / ${String(totalScenes).padStart(2, "0")}`;
  }

  function collectDom() {
    return {
      screens: {
        landing: queryRequired("[data-landing-screen]"),
        experience: queryRequired("[data-experience-screen]")
      },
      controls: {
        start: queryRequired("[data-start-button]"),
        previous: queryRequired("[data-prev-button]"),
        next: queryRequired("[data-next-button]")
      },
      chrome: {
        sceneCounter: queryRequired("[data-scene-counter]")
      },
      scene: {
        panel: queryRequired("[data-scene-panel]"),
        stage: queryRequired("[data-scene-stage]"),
        intro: queryRequired("[data-scene-intro]"),
        introImage: queryRequired("[data-scene-intro-image]"),
        introPrompt: queryRequired("[data-scene-intro-prompt]"),
        mediaStage: queryRequired("[data-scene-media-stage]"),
        transition: queryRequired("[data-scene-transition]"),
        transitionKicker: queryRequired("[data-scene-transition-kicker]"),
        transitionTitle: queryRequired("[data-scene-transition-title]"),
        transitionCopy: queryRequired("[data-scene-transition-copy]"),
        card: queryRequired("[data-scene-card]"),
        phase: queryRequired("[data-scene-phase]"),
        importance: queryRequired("[data-scene-importance]"),
        title: queryRequired("[data-scene-title]"),
        role: queryRequired("[data-scene-role]"),
        locationName: queryRequired("[data-scene-location-name]"),
        address: queryRequired("[data-scene-address]"),
        quoteDisplay: queryRequired("[data-scene-quote-display]"),
        interpretationDisplay: queryRequired("[data-scene-interpretation-display]"),
        editorToggleButton: queryRequired("[data-editor-toggle]"),
        editorForm: queryRequired("[data-editor-form]"),
        editorQuote: queryRequired("[data-editor-quote]"),
        editorInterpretation: queryRequired("[data-editor-interpretation]"),
        editorFeedback: queryRequired("[data-editor-feedback]"),
        editorResetButton: queryRequired("[data-editor-reset]"),
        editorCloseButton: queryRequired("[data-editor-close]")
      },
      media: {
        image: queryRequired("[data-scene-image]"),
        video: queryRequired("[data-scene-video]"),
        fallback: queryRequired("[data-media-fallback]"),
        fallbackTitle: queryRequired("[data-media-fallback-title]"),
        fallbackCopy: queryRequired("[data-media-fallback-copy]")
      },
      map: {
        canvas: queryRequired("#map"),
        status: queryRequired("[data-map-status]"),
        placeholder: queryRequired("[data-map-placeholder]"),
        placeholderTitle: queryRequired("[data-map-placeholder-title]"),
        placeholderCopy: queryRequired("[data-map-placeholder-copy]")
      }
    };
  }

  function createUIController() {
    const dom = collectDom();
    const timers = {
      mediaReveal: null,
      cardReveal: null,
      landingHide: null
    };
    let introAdvanceCallback = null;

    function clearTimer(timerName) {
      if (!timers[timerName]) {
        return;
      }

      window.clearTimeout(timers[timerName]);
      timers[timerName] = null;
    }

    function clearSceneSequence() {
      clearTimer("mediaReveal");
      clearTimer("cardReveal");
      introAdvanceCallback = null;
    }

    function setEditorOpen(isOpen) {
      dom.scene.card.classList.toggle("is-editing", isOpen);
      setHidden(dom.scene.editorForm, !isOpen);
      setText(dom.scene.editorToggleButton, isOpen ? "Hide Editor" : "Edit Text");
    }

    function hideSceneCard() {
      dom.scene.card.classList.remove("is-visible");
      setEditorOpen(false);
    }

    function revealSceneCard(immediately = false) {
      if (immediately) {
        dom.scene.card.classList.add("is-visible");
        return;
      }

      requestAnimationFrame(() => {
        dom.scene.card.classList.add("is-visible");
      });
    }

    function hideSceneMedia() {
      dom.scene.mediaStage.classList.remove("is-visible");
    }

    function revealSceneMedia(immediately = false) {
      if (immediately) {
        dom.scene.mediaStage.classList.add("is-visible");
        return;
      }

      requestAnimationFrame(() => {
        dom.scene.mediaStage.classList.add("is-visible");
      });
    }

    function hideSceneIntro() {
      dom.scene.intro.classList.remove("is-visible");
      dom.scene.intro.setAttribute("aria-hidden", "true");
      dom.scene.introImage.removeAttribute("src");
      dom.scene.introImage.alt = "";
      introAdvanceCallback = null;
    }

    function showSceneIntro(scene, onAdvance) {
      dom.scene.introImage.src = scene.introImageSrc;
      dom.scene.introImage.alt = `${scene.title} street view`;
      setText(
        dom.scene.introPrompt,
        scene.introPrompt || "Click anywhere to view the analysis and the book-view image."
      );
      dom.scene.intro.setAttribute("aria-hidden", "false");
      dom.scene.intro.classList.add("is-visible");
      introAdvanceCallback = () => {
        hideSceneIntro();
        revealSceneMedia();
        window.setTimeout(() => {
          revealSceneCard();
        }, 260);

        if (typeof onAdvance === "function") {
          onAdvance();
        }
      };
    }

    function showSceneTransition(scene) {
      const transitionCopy = scene.introImageSrc
        ? "The map lands on the exact point, then the real street-view image takes over."
        : `The map closes in on ${scene.title} before the literary image takes over.`;

      setText(dom.scene.transitionKicker, `Locating ${scene.dayLabel}`);
      setText(dom.scene.transitionTitle, scene.locationName);
      setText(dom.scene.transitionCopy, transitionCopy);
      dom.scene.transition.classList.add("is-visible");
    }

    function hideSceneTransition() {
      dom.scene.transition.classList.remove("is-visible");
    }

    function resetImageMedia() {
      dom.media.image.onload = null;
      dom.media.image.onerror = null;
      dom.media.image.removeAttribute("src");
      dom.media.image.alt = "";
      setHidden(dom.media.image, true);
    }

    function resetVideoMedia() {
      dom.media.video.pause();
      dom.media.video.onerror = null;
      dom.media.video.removeAttribute("src");
      dom.media.video.load();
      setHidden(dom.media.video, true);
    }

    function resetMediaStage() {
      hideSceneIntro();
      resetImageMedia();
      resetVideoMedia();
      setHidden(dom.media.fallback, true);
    }

    function showMediaFallback(title, copy) {
      setText(dom.media.fallbackTitle, title);
      setText(dom.media.fallbackCopy, copy);
      setHidden(dom.media.fallback, false);
    }

    function showSceneImage(scene) {
      dom.media.image.alt = scene.title;
      dom.media.image.src = scene.mediaSrc;
      dom.media.image.onerror = () => {
        setHidden(dom.media.image, true);
        showMediaFallback(
          "The image file could not be loaded.",
          "Check the media path in js/data.js and make sure the file exists in assets/images/."
        );
      };

      setHidden(dom.media.image, false);
    }

    function showSceneVideo(scene) {
      dom.media.video.src = scene.mediaSrc;
      dom.media.video.onerror = () => {
        setHidden(dom.media.video, true);
        showMediaFallback(
          "The video file could not be loaded.",
          "Check the media path in js/data.js and make sure the file exists in assets/videos/."
        );
      };

      setHidden(dom.media.video, false);
    }

    function renderMedia(scene) {
      resetMediaStage();
      dom.scene.mediaStage.dataset.mediaTreatment = scene.mediaTreatment || "standard";

      if (!scene.mediaSrc) {
        showMediaFallback(
          "This scene has no media source yet.",
          "Add an image or video path inside js/data.js to complete the scene layer."
        );
        return;
      }

      if (scene.mediaType === "video") {
        showSceneVideo(scene);
        return;
      }

      showSceneImage(scene);
    }

    function renderSceneChrome(scene, sceneNumber, totalScenes) {
      setText(dom.chrome.sceneCounter, formatSceneCounter(sceneNumber, totalScenes));
    }

    function renderSceneBody(scene) {
      dom.scene.card.dataset.sceneId = scene.id;
      dom.scene.panel.dataset.sceneImportance = scene.importance;
      dom.scene.stage.dataset.sceneImportance = scene.importance;
      dom.scene.card.dataset.sceneImportance = scene.importance;
      setText(dom.scene.phase, scene.dayLabel);
      setText(dom.scene.importance, scene.importanceLabel);
      setText(dom.scene.title, scene.title);
      setText(dom.scene.role, scene.psychologicalRole);
      setText(dom.scene.locationName, scene.locationName);
      setText(dom.scene.address, scene.modernAddress);
      setText(dom.scene.quoteDisplay, scene.quote);
      setText(dom.scene.interpretationDisplay, scene.interpretation);
      dom.scene.editorQuote.value = scene.quote;
      dom.scene.editorInterpretation.value = scene.interpretation;
      setText(dom.scene.editorFeedback, "");
      setEditorOpen(false);
    }

    function scheduleMediaReveal(delayMs) {
      timers.mediaReveal = window.setTimeout(() => {
        timers.mediaReveal = null;
        hideSceneTransition();
        revealSceneMedia();
      }, delayMs);
    }

    function scheduleCardReveal(delayMs) {
      timers.cardReveal = window.setTimeout(() => {
        timers.cardReveal = null;
        revealSceneCard();
      }, delayMs);
    }

    function renderScene({
      scene,
      sceneNumber,
      totalScenes,
      isFirstScene,
      isLastScene,
      mapLeadDelay = 0,
      revealImmediately = false
    }) {
      clearSceneSequence();
      renderMedia(scene);
      renderSceneChrome(scene, sceneNumber, totalScenes);
      renderSceneBody(scene);

      dom.controls.previous.disabled = isFirstScene;
      dom.controls.next.disabled = isLastScene;

      if (revealImmediately) {
        hideSceneIntro();
        hideSceneTransition();
        revealSceneMedia(true);
        revealSceneCard(true);
        return;
      }

      showSceneTransition(scene);
      hideSceneIntro();
      hideSceneMedia();
      hideSceneCard();

      const mediaRevealDelay = Math.max(520, mapLeadDelay);
      const cardRevealDelay = mediaRevealDelay + (scene.delayBeforeText || 0);

      if (scene.introImageSrc) {
        timers.mediaReveal = window.setTimeout(() => {
          timers.mediaReveal = null;
          hideSceneTransition();
          showSceneIntro(scene);
        }, mediaRevealDelay);
        return;
      }

      scheduleMediaReveal(mediaRevealDelay);
      scheduleCardReveal(cardRevealDelay);
    }

    function handleGlobalKeydown(event, handlers) {
      if (!document.body.classList.contains("is-experience-active")) {
        return;
      }

      if (event.key === "ArrowRight") {
        handlers.onNext();
      }

      if (event.key === "ArrowLeft") {
        handlers.onPrevious();
      }

      if ((event.key === "Enter" || event.key === " ") && introAdvanceCallback) {
        event.preventDefault();
        introAdvanceCallback();
      }
    }

    function bindEvents(handlers) {
      dom.controls.start.addEventListener("click", handlers.onStart);
      dom.controls.previous.addEventListener("click", handlers.onPrevious);
      dom.controls.next.addEventListener("click", handlers.onNext);
      dom.scene.intro.addEventListener("click", () => {
        if (introAdvanceCallback) {
          introAdvanceCallback();
        }
      });

      document.addEventListener("keydown", (event) => {
        handleGlobalKeydown(event, handlers);
      });

      dom.scene.editorToggleButton.addEventListener("click", () => {
        setEditorOpen(!dom.scene.card.classList.contains("is-editing"));
      });

      dom.scene.editorCloseButton.addEventListener("click", () => {
        setEditorOpen(false);
      });

      dom.scene.editorForm.addEventListener("submit", (event) => {
        event.preventDefault();
        handlers.onSceneTextSave({
          sceneId: dom.scene.card.dataset.sceneId,
          quote: dom.scene.editorQuote.value,
          interpretation: dom.scene.editorInterpretation.value
        });
        setEditorOpen(false);
      });

      dom.scene.editorResetButton.addEventListener("click", () => {
        handlers.onSceneTextReset(dom.scene.card.dataset.sceneId);
        setEditorOpen(false);
      });
    }

    function showExperience() {
      window.scrollTo(0, 0);
      document.body.classList.add("is-experience-active");
      dom.screens.landing.classList.add("is-exiting");
      setHidden(dom.screens.experience, false);
      dom.screens.experience.setAttribute("aria-hidden", "false");

      requestAnimationFrame(() => {
        dom.screens.experience.classList.add("is-visible");
      });

      clearTimer("landingHide");
      timers.landingHide = window.setTimeout(() => {
        timers.landingHide = null;
        setHidden(dom.screens.landing, true);
      }, 420);
    }

    function flashEditorFeedback(message) {
      setText(dom.scene.editorFeedback, message);
    }

    return {
      mapElements: {
        mapElement: dom.map.canvas,
        placeholderElement: dom.map.placeholder,
        placeholderTitleElement: dom.map.placeholderTitle,
        placeholderCopyElement: dom.map.placeholderCopy,
        statusElement: dom.map.status
      },
      bindEvents,
      showExperience,
      renderScene,
      flashEditorFeedback
    };
  }

  globalScope.GeographyOfGuiltUI = Object.freeze({
    createUIController
  });
})(window);
