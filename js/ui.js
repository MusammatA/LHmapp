function queryRequired(selector, root = document) {
  const element = root.querySelector(selector);

  if (!element) {
    throw new Error(`Missing required element: ${selector}`);
  }

  return element;
}

function queryAll(selector, root = document) {
  return Array.from(root.querySelectorAll(selector));
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
      card: queryRequired("[data-scene-card]"),
      phase: queryRequired("[data-scene-phase]"),
      title: queryRequired("[data-scene-title]"),
      locationName: queryRequired("[data-scene-location-name]"),
      address: queryRequired("[data-scene-address]"),
      quote: queryRequired("[data-scene-quote]"),
      interpretation: queryRequired("[data-scene-interpretation]"),
      readOnlyView: queryRequired("[data-scene-view]")
    },
    media: {
      image: queryRequired("[data-scene-image]"),
      video: queryRequired("[data-scene-video]"),
      fallback: queryRequired("[data-media-fallback]"),
      fallbackTitle: queryRequired("[data-media-fallback-title]"),
      fallbackCopy: queryRequired("[data-media-fallback-copy]")
    },
    admin: {
      toggle: queryRequired("[data-admin-toggle]"),
      trigger: queryRequired("[data-admin-trigger]"),
      modal: queryRequired("[data-admin-modal]"),
      form: queryRequired("[data-admin-form]"),
      password: queryRequired("[data-admin-password]"),
      error: queryRequired("[data-admin-error]"),
      closeButtons: queryAll("[data-admin-close]"),
      editor: queryRequired("[data-admin-editor]"),
      quote: queryRequired("[data-admin-quote]"),
      interpretation: queryRequired("[data-admin-interpretation]"),
      feedback: queryRequired("[data-admin-feedback]"),
      resetButton: queryRequired("[data-admin-reset]")
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
    setText(dom.header.subtitle, scene.locationName);
    setText(dom.header.locationLine, `${scene.locationName} — ${scene.modernAddress}`);
    setText(dom.header.notes, scene.notes || "");
  }

  function renderSceneBody(scene) {
    dom.scene.card.dataset.sceneId = scene.id;
    setText(dom.scene.phase, scene.locationName);
    setText(dom.scene.title, scene.title);
    setText(dom.scene.locationName, scene.locationName);
    setText(dom.scene.address, scene.modernAddress);
    setText(dom.scene.quote, scene.quote);
    setText(dom.scene.interpretation, scene.interpretation);
    dom.admin.quote.value = scene.quote;
    dom.admin.interpretation.value = scene.interpretation;
    setText(dom.admin.feedback, "");
  }

  function setEditorState(isAdmin) {
    setHidden(dom.scene.readOnlyView, isAdmin);
    setHidden(dom.admin.editor, !isAdmin);
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
    isLastScene,
    isAdmin,
    revealImmediately = false
  }) {
    clearSceneRevealTimer();
    hideSceneCard();
    renderMedia(scene);
    renderSceneChrome(scene, sceneNumber, totalScenes);
    renderSceneBody(scene);
    setEditorState(isAdmin);

    dom.controls.previous.disabled = isFirstScene;
    dom.controls.next.disabled = isLastScene;

    // The text deliberately arrives after the media so the scene can land visually first.
    scheduleSceneReveal(revealImmediately ? 0 : scene.delayBeforeText || 0);
  }

  function handleGlobalKeydown(event, handlers) {
    if (!document.body.classList.contains("is-experience-active")) {
      return;
    }

    if (event.shiftKey && event.key.toLowerCase() === "a") {
      event.preventDefault();
      handlers.onAdminPrompt();
    }

    if (event.key === "ArrowRight") {
      handlers.onNext();
    }

    if (event.key === "ArrowLeft") {
      handlers.onPrevious();
    }

    if (event.key === "Escape") {
      closeAdminModal();
    }
  }

  function bindEvents(handlers) {
    dom.controls.start.addEventListener("click", handlers.onStart);
    dom.controls.previous.addEventListener("click", handlers.onPrevious);
    dom.controls.next.addEventListener("click", handlers.onNext);
    dom.admin.toggle.addEventListener("click", handlers.onAdminExit);

    dom.admin.trigger.addEventListener("dblclick", handlers.onAdminPrompt);
    dom.admin.trigger.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") {
        return;
      }

      event.preventDefault();
      handlers.onAdminPrompt();
    });

    document.addEventListener("keydown", (event) => {
      handleGlobalKeydown(event, handlers);
    });

    dom.admin.form.addEventListener("submit", (event) => {
      event.preventDefault();
      handlers.onAdminSubmit(dom.admin.password.value);
    });

    dom.admin.closeButtons.forEach((button) => {
      button.addEventListener("click", closeAdminModal);
    });

    dom.admin.editor.addEventListener("submit", (event) => {
      event.preventDefault();
      handlers.onAdminSave({
        sceneId: dom.scene.card.dataset.sceneId,
        quote: dom.admin.quote.value,
        interpretation: dom.admin.interpretation.value
      });
    });

    dom.admin.resetButton.addEventListener("click", () => {
      handlers.onAdminReset(dom.scene.card.dataset.sceneId);
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

  function setAdminMode(isAdmin) {
    setHidden(dom.admin.toggle, !isAdmin);
  }

  function resetAdminForm() {
    setText(dom.admin.error, "");
    dom.admin.form.reset();
  }

  function openAdminModal() {
    setHidden(dom.admin.modal, false);
    resetAdminForm();

    requestAnimationFrame(() => {
      dom.admin.password.focus();
    });
  }

  function closeAdminModal() {
    setHidden(dom.admin.modal, true);
    resetAdminForm();
  }

  function showAdminError(message) {
    setText(dom.admin.error, message);
  }

  function flashAdminFeedback(message) {
    setText(dom.admin.feedback, message);
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
    setAdminMode,
    openAdminModal,
    closeAdminModal,
    showAdminError,
    flashAdminFeedback
  };
}
