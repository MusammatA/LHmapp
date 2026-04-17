function setHidden(element, isHidden) {
  element.hidden = isHidden;
}

export function createUIController() {
  const elements = {
    landingScreen: document.querySelector("[data-landing-screen]"),
    experienceScreen: document.querySelector("[data-experience-screen]"),
    startButton: document.querySelector("[data-start-button]"),
    prevButton: document.querySelector("[data-prev-button]"),
    nextButton: document.querySelector("[data-next-button]"),
    sceneCounter: document.querySelector("[data-scene-counter]"),
    sceneTitleChrome: document.querySelector("[data-scene-title-chrome]"),
    scenePhaseChrome: document.querySelector("[data-scene-phase-chrome]"),
    sceneLocationLine: document.querySelector("[data-scene-location-line]"),
    sceneNotes: document.querySelector("[data-scene-notes]"),
    sceneCard: document.querySelector("[data-scene-card]"),
    sceneTitle: document.querySelector("[data-scene-title]"),
    scenePhase: document.querySelector("[data-scene-phase]"),
    sceneLocationName: document.querySelector("[data-scene-location-name]"),
    sceneAddress: document.querySelector("[data-scene-address]"),
    sceneQuote: document.querySelector("[data-scene-quote]"),
    sceneInterpretation: document.querySelector("[data-scene-interpretation]"),
    sceneView: document.querySelector("[data-scene-view]"),
    adminEditor: document.querySelector("[data-admin-editor]"),
    adminQuote: document.querySelector("[data-admin-quote]"),
    adminInterpretation: document.querySelector("[data-admin-interpretation]"),
    adminFeedback: document.querySelector("[data-admin-feedback]"),
    adminResetButton: document.querySelector("[data-admin-reset]"),
    adminToggle: document.querySelector("[data-admin-toggle]"),
    adminTrigger: document.querySelector("[data-admin-trigger]"),
    adminModal: document.querySelector("[data-admin-modal]"),
    adminForm: document.querySelector("[data-admin-form]"),
    adminPassword: document.querySelector("[data-admin-password]"),
    adminError: document.querySelector("[data-admin-error]"),
    adminCloseButtons: document.querySelectorAll("[data-admin-close]"),
    sceneImage: document.querySelector("[data-scene-image]"),
    sceneVideo: document.querySelector("[data-scene-video]"),
    mediaFallback: document.querySelector("[data-media-fallback]"),
    mediaFallbackTitle: document.querySelector("[data-media-fallback-title]"),
    mediaFallbackCopy: document.querySelector("[data-media-fallback-copy]"),
    mapElement: document.getElementById("map"),
    mapStatus: document.querySelector("[data-map-status]"),
    mapPlaceholder: document.querySelector("[data-map-placeholder]"),
    mapPlaceholderTitle: document.querySelector("[data-map-placeholder-title]"),
    mapPlaceholderCopy: document.querySelector("[data-map-placeholder-copy]")
  };

  let revealTimer = null;

  function clearRevealTimer() {
    if (revealTimer) {
      window.clearTimeout(revealTimer);
      revealTimer = null;
    }
  }

  function hideSceneCard() {
    elements.sceneCard.classList.remove("is-visible");
    setHidden(elements.sceneCard, true);
  }

  function revealSceneCard() {
    setHidden(elements.sceneCard, false);
    requestAnimationFrame(() => {
      elements.sceneCard.classList.add("is-visible");
    });
  }

  function resetMedia() {
    elements.sceneImage.onload = null;
    elements.sceneImage.onerror = null;
    elements.sceneImage.removeAttribute("src");
    elements.sceneImage.alt = "";
    setHidden(elements.sceneImage, true);

    elements.sceneVideo.pause();
    elements.sceneVideo.onerror = null;
    elements.sceneVideo.removeAttribute("src");
    elements.sceneVideo.load();
    setHidden(elements.sceneVideo, true);

    setHidden(elements.mediaFallback, true);
  }

  function showMediaFallback(title, copy) {
    elements.mediaFallbackTitle.textContent = title;
    elements.mediaFallbackCopy.textContent = copy;
    setHidden(elements.mediaFallback, false);
  }

  function renderMedia(scene) {
    resetMedia();

    if (!scene.mediaSrc) {
      showMediaFallback(
        "This scene has no media source yet.",
        "Add an image or video path inside js/data.js to complete the panel."
      );
      return;
    }

    if (scene.mediaType === "video") {
      elements.sceneVideo.src = scene.mediaSrc;
      elements.sceneVideo.onerror = () => {
        setHidden(elements.sceneVideo, true);
        showMediaFallback(
          "The video file could not be loaded.",
          "Check the media path in js/data.js and make sure the file exists in assets/videos/."
        );
      };
      setHidden(elements.sceneVideo, false);
      return;
    }

    elements.sceneImage.alt = scene.title;
    elements.sceneImage.src = scene.mediaSrc;
    elements.sceneImage.onerror = () => {
      setHidden(elements.sceneImage, true);
      showMediaFallback(
        "The image file could not be loaded.",
        "Check the media path in js/data.js and make sure the file exists in assets/images/."
      );
    };
    setHidden(elements.sceneImage, false);
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
    clearRevealTimer();
    hideSceneCard();
    renderMedia(scene);

    elements.sceneCard.dataset.sceneId = scene.id;
    elements.sceneCounter.textContent = `Scene ${String(sceneNumber).padStart(2, "0")} / ${String(totalScenes).padStart(2, "0")}`;
    elements.sceneTitleChrome.textContent = scene.title;
    elements.scenePhaseChrome.textContent = scene.locationName;
    elements.sceneLocationLine.textContent = `${scene.locationName} — ${scene.modernAddress}`;
    elements.sceneNotes.textContent = scene.notes || "";

    elements.scenePhase.textContent = scene.locationName;
    elements.sceneTitle.textContent = scene.title;
    elements.sceneLocationName.textContent = scene.locationName;
    elements.sceneAddress.textContent = scene.modernAddress;
    elements.sceneQuote.textContent = scene.quote;
    elements.sceneInterpretation.textContent = scene.interpretation;
    elements.adminQuote.value = scene.quote;
    elements.adminInterpretation.value = scene.interpretation;
    elements.adminFeedback.textContent = "";

    elements.prevButton.disabled = isFirstScene;
    elements.nextButton.disabled = isLastScene;

    setHidden(elements.sceneView, isAdmin);
    setHidden(elements.adminEditor, !isAdmin);

    const delay = revealImmediately ? 0 : scene.delayBeforeText || 0;
    revealTimer = window.setTimeout(revealSceneCard, delay);
  }

  function bindEvents(handlers) {
    elements.startButton.addEventListener("click", handlers.onStart);
    elements.prevButton.addEventListener("click", handlers.onPrevious);
    elements.nextButton.addEventListener("click", handlers.onNext);
    elements.adminToggle.addEventListener("click", handlers.onAdminExit);

    elements.adminTrigger.addEventListener("dblclick", handlers.onAdminPrompt);
    elements.adminTrigger.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        handlers.onAdminPrompt();
      }
    });

    document.addEventListener("keydown", (event) => {
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
    });

    elements.adminForm.addEventListener("submit", (event) => {
      event.preventDefault();
      handlers.onAdminSubmit(elements.adminPassword.value);
    });

    elements.adminCloseButtons.forEach((button) => {
      button.addEventListener("click", closeAdminModal);
    });

    elements.adminEditor.addEventListener("submit", (event) => {
      event.preventDefault();
      handlers.onAdminSave({
        sceneId: elements.sceneCard.dataset.sceneId,
        quote: elements.adminQuote.value,
        interpretation: elements.adminInterpretation.value
      });
    });

    elements.adminResetButton.addEventListener("click", () => {
      handlers.onAdminReset(elements.sceneCard.dataset.sceneId);
    });
  }

  function showExperience() {
    document.body.classList.add("is-experience-active");
    setHidden(elements.landingScreen, true);
    setHidden(elements.experienceScreen, false);
    elements.experienceScreen.setAttribute("aria-hidden", "false");
    requestAnimationFrame(() => {
      elements.experienceScreen.classList.add("is-visible");
    });
  }

  function setAdminMode(isAdmin) {
    setHidden(elements.adminToggle, !isAdmin);
  }

  function openAdminModal() {
    setHidden(elements.adminModal, false);
    elements.adminError.textContent = "";
    elements.adminForm.reset();
    requestAnimationFrame(() => {
      elements.adminPassword.focus();
    });
  }

  function closeAdminModal() {
    setHidden(elements.adminModal, true);
    elements.adminError.textContent = "";
    elements.adminForm.reset();
  }

  function showAdminError(message) {
    elements.adminError.textContent = message;
  }

  function flashAdminFeedback(message) {
    elements.adminFeedback.textContent = message;
  }

  return {
    elements,
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
