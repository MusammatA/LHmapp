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
    header: {
      sceneCounter: queryRequired("[data-scene-counter]"),
      title: queryRequired("[data-scene-title-chrome]"),
      subtitle: queryRequired("[data-scene-phase-chrome]"),
      locationLine: queryRequired("[data-scene-location-line]"),
      notes: queryRequired("[data-scene-notes]")
    },
    scene: {
      panel: queryRequired("[data-scene-panel]"),
      stage: queryRequired("[data-scene-stage]"),
      card: queryRequired("[data-scene-card]"),
      phase: queryRequired("[data-scene-phase]"),
      importance: queryRequired("[data-scene-importance]"),
      title: queryRequired("[data-scene-title]"),
      role: queryRequired("[data-scene-role]"),
      locationName: queryRequired("[data-scene-location-name]"),
      address: queryRequired("[data-scene-address]"),
      editorForm: queryRequired("[data-editor-form]"),
      editorQuote: queryRequired("[data-editor-quote]"),
      editorInterpretation: queryRequired("[data-editor-interpretation]"),
      editorFeedback: queryRequired("[data-editor-feedback]"),
      editorResetButton: queryRequired("[data-editor-reset]")
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

export function createUIController() {
  const dom = collectDom();
  let sceneRevealTimer = null;

  function clearSceneRevealTimer() {
    if (!sceneRevealTimer) {
      return;
    }

    window.clearTimeout(sceneRevealTimer);
    sceneRevealTimer = null;
  }

  function hideSceneCard() {
    dom.scene.card.classList.remove("is-visible");
    setHidden(dom.scene.card, true);
  }

  function revealSceneCard() {
    setHidden(dom.scene.card, false);
    requestAnimationFrame(() => {
      dom.scene.card.classList.add("is-visible");
    });
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

    if (!scene.mediaSrc) {
      showMediaFallback(
        "This scene has no media source yet.",
        "Add an image or video path inside js/data.js to complete the panel."
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
    setText(dom.header.sceneCounter, formatSceneCounter(sceneNumber, totalScenes));
    setText(dom.header.title, scene.title);
    setText(dom.header.subtitle, `${scene.dayLabel} · ${scene.importanceLabel}`);
    setText(dom.header.locationLine, `${scene.locationName} — ${scene.modernAddress}`);
    setText(dom.header.notes, scene.notes || "");
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
    dom.scene.editorQuote.value = scene.quote;
    dom.scene.editorInterpretation.value = scene.interpretation;
    setText(dom.scene.editorFeedback, "");
  }

  function scheduleSceneReveal(delayMs) {
    sceneRevealTimer = window.setTimeout(() => {
      sceneRevealTimer = null;
      revealSceneCard();
    }, delayMs);
  }

  function renderScene({
    scene,
    sceneNumber,
    totalScenes,
    isFirstScene,
    isLastScene
  }) {
    clearSceneRevealTimer();
    hideSceneCard();
    renderMedia(scene);
    renderSceneChrome(scene, sceneNumber, totalScenes);
    renderSceneBody(scene);

    dom.controls.previous.disabled = isFirstScene;
    dom.controls.next.disabled = isLastScene;

    // The text deliberately arrives after the media so the scene can land visually first.
    scheduleSceneReveal(scene.delayBeforeText || 0);
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
  }

  function bindEvents(handlers) {
    dom.controls.start.addEventListener("click", handlers.onStart);
    dom.controls.previous.addEventListener("click", handlers.onPrevious);
    dom.controls.next.addEventListener("click", handlers.onNext);

    document.addEventListener("keydown", (event) => {
      handleGlobalKeydown(event, handlers);
    });

    dom.scene.editorForm.addEventListener("submit", (event) => {
      event.preventDefault();
      handlers.onSceneTextSave({
        sceneId: dom.scene.card.dataset.sceneId,
        quote: dom.scene.editorQuote.value,
        interpretation: dom.scene.editorInterpretation.value
      });
    });

    dom.scene.editorResetButton.addEventListener("click", () => {
      handlers.onSceneTextReset(dom.scene.card.dataset.sceneId);
    });
  }

  function showExperience() {
    document.body.classList.add("is-experience-active");
    setHidden(dom.screens.landing, true);
    setHidden(dom.screens.experience, false);
    dom.screens.experience.setAttribute("aria-hidden", "false");

    requestAnimationFrame(() => {
      dom.screens.experience.classList.add("is-visible");
    });
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
