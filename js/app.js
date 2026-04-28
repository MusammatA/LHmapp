(function initializeApplication(globalScope) {
  const { MAP_LOCATIONS, STORY_EVENTS } = globalScope.GeographyOfGuiltData;
  const { SceneMapController } = globalScope.GeographyOfGuiltMap;

  const BLACKOUT_MS = 700;
  const INTRO_TRANSITION_MS = 1200;
  const STORY_REVEAL_DELAY_MS = 120;
  const SLIDE_TRANSITION_MS = 340;
  const STORY_TIMELINE_DAYS = 14;
  const CHAPTER_CARD_ENABLED = true;
  const CHAPTER_CARD_HOLD_MS = 920;
  const CHAPTER_CARD_FADE_MS = 360;
  const RESET_VISITED_ON_GUIDED_REPLAY = false;
  const MAP_AMBIENT_SOUND_PATH = "Wind Sound SOUND EFFECT - No Copyright[Download Free].mp3";
  const AMBIENT_AUDIO_SESSION_KEY = "geography-of-guilt.ambient-muted.v2";
  const STORY_AUDIO_VOLUME_SESSION_KEY = "geography-of-guilt.story-volume.v2";
  const STORY_ENTRY_MODE = Object.freeze({
    guided: "guided",
    exploratory: "exploratory"
  });
  const PREFERS_REDUCED_MOTION = Boolean(
    globalScope.matchMedia && globalScope.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  const STORY_SOUND_FADE_MS = 700;
  const STORY_SOUND_MIN_VOLUME = 0.1;
  const STORY_SOUND_MAX_VOLUME = 0.25;
  const STORY_SOUND_DEFAULT_VOLUME = 0.25;
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

  function motionSafeDuration(duration) {
    return PREFERS_REDUCED_MOTION ? 0 : duration;
  }

  function clamp(value, minimum, maximum) {
    return Math.min(Math.max(value, minimum), maximum);
  }

  // Some local asset filenames include characters like square brackets.
  // Browsers can be inconsistent with those when used directly in URLs, so
  // we normalize them once before handing paths to media elements or Audio().
  function encodeAssetPath(path) {
    return encodeURI(path)
      .replace(/\[/g, "%5B")
      .replace(/\]/g, "%5D")
      .replace(/\(/g, "%28")
      .replace(/\)/g, "%29");
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

  const PSYCHOLOGY_PHASE_LABELS = Object.freeze({
    isolation: "Isolation",
    conflict: "Conflict",
    rupture: "Rupture",
    separation: "Separation",
    confession: "Confession"
  });
  const ABSTRACT_PHASE_ORDER = Object.freeze([
    "isolation",
    "conflict",
    "rupture",
    "separation",
    "confession"
  ]);
  const DEFAULT_THEME = "default";

  function getPsychologyPhaseLabel(event) {
    return PSYCHOLOGY_PHASE_LABELS[event && event.psychologyPhase] || "Isolation";
  }

  function getPhaseLabelFromKey(phaseKey) {
    return PSYCHOLOGY_PHASE_LABELS[phaseKey] || "Isolation";
  }

  function getAbstractLocationLabel(event) {
    return event.mapLabel || event.locationName;
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

  function createChapterCardCopy(event) {
    switch (event.psychologyPhase) {
      case "rupture":
        return {
          eyebrow: "Psychological Phase",
          title: "Rupture",
          mood: "rupture"
        };
      case "separation":
        return {
          eyebrow: "Psychological Phase",
          title: "Separation",
          mood: "aftermath"
        };
      case "confession":
        return {
          eyebrow: "Psychological Phase",
          title: "Confession",
          mood: "redemption"
        };
      case "conflict":
        return {
          eyebrow: "Psychological Phase",
          title: "Conflict",
          mood: "foreboding"
        };
      case "isolation":
      default:
        return {
          eyebrow: "Psychological Phase",
          title: "Isolation",
          mood: "foreboding"
        };
    }
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
          src: encodeAssetPath(path),
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
      topTabsElement: document.querySelector("[data-top-tabs]"),
      topTabButtons: Array.from(document.querySelectorAll("[data-top-tab]")),
      abstractMapElement: document.querySelector("[data-abstract-map]"),
      abstractMapTrackElement: document.querySelector("[data-abstract-map-track]"),
      abstractMapViewportElement: document.querySelector("[data-abstract-map-viewport]"),
      launchButton: document.querySelector("[data-story-launch]"),
      launchLabelElement: document.querySelector("[data-story-launch-label]"),
      audioControlsElement: document.querySelector("[data-audio-controls]"),
      ambientToggleButton: document.querySelector("[data-ambient-toggle]"),
      ambientToggleLabelElement: document.querySelector("[data-ambient-toggle-label]"),
      audioVolumeInput: document.querySelector("[data-audio-volume]"),
      audioVolumeLabelElement: document.querySelector("[data-audio-volume-label]"),
      infoScreenElements: Array.from(document.querySelectorAll("[data-info-screen]")),
      themeButtons: Array.from(document.querySelectorAll("[data-theme-option]")),
      storyVeilElement: document.querySelector("[data-story-veil]"),
      chapterCardElement: document.querySelector("[data-chapter-card]"),
      chapterCardInnerElement: document.querySelector("[data-chapter-card-inner]"),
      chapterCardEyebrowElement: document.querySelector("[data-chapter-card-eyebrow]"),
      chapterCardTitleElement: document.querySelector("[data-chapter-card-title]"),
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
      storyBodyElement: document.querySelector("[data-story-body]"),
      storyDetailsBodyElement: document.querySelector("[data-story-details-body]"),
      storyReadingBoxElement: document.querySelector("[data-story-reading-box]"),
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
      storyExitButton: document.querySelector("[data-story-exit]"),
      storyBackButton: document.querySelector("[data-story-back]"),
      storyNextButton: document.querySelector("[data-story-next]"),
      placeholderElement: document.querySelector("[data-map-placeholder]"),
      placeholderTitleElement: document.querySelector("[data-map-placeholder-title]"),
      placeholderCopyElement: document.querySelector("[data-map-placeholder-copy]")
    };
  }

  /* Ambient audio controls */
  function createAmbientAudioController(elements) {
    if (
      !elements.ambientToggleButton ||
      !elements.ambientToggleLabelElement ||
      !elements.audioVolumeInput ||
      !elements.audioVolumeLabelElement
    ) {
      return Object.freeze({
        armFromInteraction() {},
        setAmbientMode() {},
        primeStorySoundForEvent() {},
        toggleMute() {},
        setStorySoundForEvent() {},
        syncStoryMediaAudio() {}
      });
    }

    const state = {
      currentMode: "map",
      hasInteraction: false,
      isMuted: false,
      volume: STORY_SOUND_DEFAULT_VOLUME,
      mapSoundPath: MAP_AMBIENT_SOUND_PATH,
      mapTrack: null,
      activeSceneEventId: null,
      activeSceneSoundPath: null,
      activeSceneTrack: null,
      activeVideoElement: null,
      unavailableSources: new Set(),
      fadeTimers: new WeakMap()
    };

    try {
      const storedMuteValue = globalScope.sessionStorage.getItem(AMBIENT_AUDIO_SESSION_KEY);
      if (storedMuteValue === "false") {
        state.isMuted = false;
      }
    } catch (error) {
      // Session storage is optional; keep the in-memory default if it is unavailable.
    }

    try {
      const storedVolumeValue = Number(globalScope.sessionStorage.getItem(STORY_AUDIO_VOLUME_SESSION_KEY));
      if (!Number.isNaN(storedVolumeValue) && storedVolumeValue) {
        state.volume = clamp(storedVolumeValue, STORY_SOUND_MIN_VOLUME, STORY_SOUND_MAX_VOLUME);
      }
    } catch (error) {
      // Session storage is optional; keep the in-memory default if it is unavailable.
    }

    function persistState() {
      try {
        globalScope.sessionStorage.setItem(AMBIENT_AUDIO_SESSION_KEY, String(state.isMuted));
        globalScope.sessionStorage.setItem(STORY_AUDIO_VOLUME_SESSION_KEY, String(state.volume));
      } catch (error) {
        // No-op when session storage is unavailable.
      }
    }

    function getActiveSceneEvent() {
      return STORY_EVENTS.find((event) => event.id === state.activeSceneEventId) || null;
    }

    function pauseTrack(track) {
      if (!track) {
        return;
      }

      track.pause();
    }

    function stopTrack(track) {
      if (!track) {
        return;
      }

      pauseTrack(track);
      track.currentTime = 0;
    }

    function clearFadeTimer(track) {
      const timerId = state.fadeTimers.get(track);

      if (timerId) {
        globalScope.clearInterval(timerId);
        state.fadeTimers.delete(track);
      }
    }

    function fadeTrackVolume(track, targetVolume, durationMs, { pauseOnComplete = false } = {}) {
      if (!track) {
        return Promise.resolve();
      }

      clearFadeTimer(track);

      const safeDuration = motionSafeDuration(durationMs);
      const clampedTarget = clamp(targetVolume, 0, STORY_SOUND_MAX_VOLUME);

      if (safeDuration === 0) {
        track.volume = clampedTarget;

        if (pauseOnComplete && clampedTarget === 0) {
          pauseTrack(track);
        }

        return Promise.resolve();
      }

      const frameMs = 50;
      const totalSteps = Math.max(1, Math.round(safeDuration / frameMs));
      const startVolume = Number(track.volume) || 0;
      let currentStep = 0;

      return new Promise((resolve) => {
        const timerId = globalScope.setInterval(() => {
          currentStep += 1;
          const progress = Math.min(currentStep / totalSteps, 1);
          track.volume = startVolume + ((clampedTarget - startVolume) * progress);

          if (progress >= 1) {
            clearFadeTimer(track);

            if (pauseOnComplete && clampedTarget === 0) {
              pauseTrack(track);
            }

            resolve();
          }
        }, frameMs);

        state.fadeTimers.set(track, timerId);
      });
    }

    async function safelyPlayTrack(track) {
      if (!track || !state.hasInteraction || state.isMuted) {
        return;
      }

      try {
        await track.play();
      } catch (error) {
        // Browser autoplay restrictions can still require a later interaction.
      }
    }

    function createSceneTrack(source) {
      if (!source || state.unavailableSources.has(source)) {
        return null;
      }

      const track = new globalScope.Audio(encodeAssetPath(source));
      track.loop = true;
      track.preload = "auto";
      track.volume = 0;
      track.addEventListener("error", () => {
        state.unavailableSources.add(source);

        if (state.activeSceneSoundPath === source) {
          state.activeSceneSoundPath = null;
          state.activeSceneTrack = null;
          renderAudioControls();
        }
      });

      return track;
    }

    function setVideoVolume() {
      if (!state.activeVideoElement) {
        return;
      }

      state.activeVideoElement.muted = state.isMuted;
      state.activeVideoElement.volume = state.isMuted ? 0 : state.volume;
    }

    function resolveSceneTargetVolume(event) {
      const soundBoost = Number(event?.soundVolumeBoost);
      const volumeBoost = Number.isFinite(soundBoost) && soundBoost > 0 ? soundBoost : 1;

      return clamp(state.volume * volumeBoost, STORY_SOUND_MIN_VOLUME, STORY_SOUND_MAX_VOLUME);
    }

    function resolveSceneFadeDuration(event) {
      const configuredDuration = Number(event?.soundFadeInMs);

      if (Number.isFinite(configuredDuration) && configuredDuration >= 0) {
        return configuredDuration;
      }

      return STORY_SOUND_FADE_MS;
    }

    function hasMapAmbientAudio() {
      return Boolean(state.mapSoundPath) && !state.unavailableSources.has(state.mapSoundPath);
    }

    function renderAudioControls() {
      const hasMapAudio = state.currentMode === "map" && Boolean(state.mapSoundPath);
      const hasSceneAudio = Boolean(state.activeSceneSoundPath);
      const hasVideoAudio = Boolean(state.activeVideoElement);
      const isAudioUnavailable = hasMapAudio
        ? state.unavailableSources.has(state.mapSoundPath)
        : hasSceneAudio && state.unavailableSources.has(state.activeSceneSoundPath);
      const hasAnyAudio = hasMapAudio || hasSceneAudio || hasVideoAudio;
      const isEnabled = !state.isMuted && hasAnyAudio && !isAudioUnavailable;

      elements.audioVolumeInput.value = String(Math.round(state.volume * 100));
      elements.audioVolumeLabelElement.textContent = `${Math.round(state.volume * 100)}%`;
      elements.audioVolumeInput.disabled = !hasAnyAudio;
      elements.ambientToggleButton.disabled = !hasAnyAudio;
      elements.ambientToggleButton.dataset.audioState = hasMapAudio
        ? isAudioUnavailable
          ? "missing"
          : isEnabled
            ? "playing"
            : "muted"
        : !hasSceneAudio
        ? hasVideoAudio
          ? state.isMuted ? "muted" : "playing"
          : "idle"
        : isAudioUnavailable
          ? "missing"
          : isEnabled
            ? "playing"
            : "muted";
      elements.ambientToggleButton.setAttribute("aria-pressed", String(isEnabled));
      elements.ambientToggleButton.title = hasMapAudio
        ? isAudioUnavailable
          ? "The map ambience file could not be loaded."
          : state.isMuted
            ? "Map ambience is muted."
            : "Map ambience is playing."
        : !hasSceneAudio
        ? hasVideoAudio
          ? state.isMuted
            ? "Video sound is muted."
            : "Video sound is playing."
          : "This slide does not have a dedicated sound file."
        : isAudioUnavailable
          ? "The sound file for this slide could not be loaded."
          : state.isMuted
            ? "Story sound is muted."
            : "Story sound is playing.";
      elements.ambientToggleLabelElement.textContent = hasMapAudio
        ? state.isMuted ? "Sound Off" : "Sound On"
        : !hasSceneAudio
        ? hasVideoAudio
          ? state.isMuted ? "Sound Off" : "Sound On"
          : "No Sound"
        : isAudioUnavailable
          ? "Audio Missing"
          : state.isMuted
            ? "Sound Off"
            : "Sound On";
    }

    function stopActiveSceneTrack({ resetTime = false } = {}) {
      if (!state.activeSceneTrack) {
        return;
      }

      clearFadeTimer(state.activeSceneTrack);
      stopTrack(state.activeSceneTrack);

      if (resetTime) {
        state.activeSceneTrack.currentTime = 0;
      }
    }

    function stopMapTrack({ resetTime = false } = {}) {
      if (!state.mapTrack) {
        return;
      }

      clearFadeTimer(state.mapTrack);
      stopTrack(state.mapTrack);

      if (resetTime) {
        state.mapTrack.currentTime = 0;
      }
    }

    async function stopSceneSound({ fade = true, resetTime = false } = {}) {
      if (!state.activeSceneTrack) {
        return;
      }

      const trackToStop = state.activeSceneTrack;
      state.activeSceneTrack = null;

      if (fade) {
        await fadeTrackVolume(trackToStop, 0, STORY_SOUND_FADE_MS, {
          pauseOnComplete: true
        });
      } else {
        stopTrack(trackToStop);
      }

      if (resetTime) {
        trackToStop.currentTime = 0;
      }
    }

    async function stopMapSound({ fade = true, resetTime = false } = {}) {
      if (!state.mapTrack) {
        return;
      }

      const trackToStop = state.mapTrack;
      state.mapTrack = null;

      if (fade) {
        await fadeTrackVolume(trackToStop, 0, STORY_SOUND_FADE_MS, {
          pauseOnComplete: true
        });
      } else {
        stopTrack(trackToStop);
      }

      if (resetTime) {
        trackToStop.currentTime = 0;
      }
    }

    async function playMapSound() {
      if (!hasMapAmbientAudio()) {
        renderAudioControls();
        return;
      }

      if (state.mapTrack) {
        if (state.isMuted) {
          await fadeTrackVolume(state.mapTrack, 0, STORY_SOUND_FADE_MS, {
            pauseOnComplete: true
          });
        } else {
          if (state.mapTrack.paused && state.hasInteraction) {
            await safelyPlayTrack(state.mapTrack);
          }

          await fadeTrackVolume(state.mapTrack, state.volume, STORY_SOUND_FADE_MS);
        }

        renderAudioControls();
        return;
      }

      const nextTrack = createSceneTrack(state.mapSoundPath);

      if (!nextTrack) {
        renderAudioControls();
        return;
      }

      await safelyPlayTrack(nextTrack);

      state.mapTrack = nextTrack;

      if (state.isMuted) {
        nextTrack.volume = 0;
      } else {
        await fadeTrackVolume(nextTrack, state.volume, STORY_SOUND_FADE_MS);
      }

      renderAudioControls();
    }

    async function playSceneSound(source, event = null) {
      if (!source || state.unavailableSources.has(source)) {
        renderAudioControls();
        return;
      }

      const nextTrack = createSceneTrack(source);

      if (!nextTrack) {
        renderAudioControls();
        return;
      }

      await safelyPlayTrack(nextTrack);

      const previousTrack = state.activeSceneTrack;
      state.activeSceneTrack = nextTrack;

      if (previousTrack && previousTrack !== nextTrack) {
        fadeTrackVolume(previousTrack, 0, STORY_SOUND_FADE_MS, {
          pauseOnComplete: true
        }).then(() => {
          stopTrack(previousTrack);
        });
      }

      if (state.isMuted) {
        nextTrack.volume = 0;
      } else {
        await fadeTrackVolume(
          nextTrack,
          resolveSceneTargetVolume(event),
          resolveSceneFadeDuration(event)
        );
      }

      renderAudioControls();
    }

    function armFromInteraction() {
      if (!state.hasInteraction) {
        state.hasInteraction = true;
      }

      if (state.isMuted) {
        return;
      }

      if (state.currentMode === "map") {
        playMapSound();
        return;
      }

      if (!state.activeSceneSoundPath) {
        return;
      }

      if (state.activeVideoElement) {
        setVideoVolume();
        renderAudioControls();
        return;
      }

      if (state.activeSceneTrack) {
        state.activeSceneTrack.volume = 0;

        safelyPlayTrack(state.activeSceneTrack).then(() => {
          const activeEvent = getActiveSceneEvent();
          fadeTrackVolume(
            state.activeSceneTrack,
            resolveSceneTargetVolume(activeEvent),
            resolveSceneFadeDuration(activeEvent)
          );
        });

        renderAudioControls();
        return;
      }

      const activeEvent = getActiveSceneEvent();
      playSceneSound(state.activeSceneSoundPath, activeEvent);
    }

    function setAmbientMode(mode) {
      state.currentMode = mode === "story" ? "story" : "map";
      if (state.currentMode === "map") {
        state.activeVideoElement = null;
        state.activeSceneEventId = null;
        state.activeSceneSoundPath = null;
        stopSceneSound({
          fade: true,
          resetTime: true
        });
        if (!state.isMuted) {
          playMapSound();
        }
      } else if (!state.isMuted && state.activeSceneSoundPath && !state.activeSceneTrack) {
        stopMapSound({
          fade: true,
          resetTime: false
        });
        const activeEvent = getActiveSceneEvent();
        playSceneSound(state.activeSceneSoundPath, activeEvent);
      } else if (state.currentMode === "story") {
        stopMapSound({
          fade: true,
          resetTime: false
        });
      }

      setVideoVolume();
      renderAudioControls();
    }

    function toggleMute() {
      if (!hasMapAmbientAudio() && !state.activeSceneSoundPath && !state.activeVideoElement) {
        renderAudioControls();
        return;
      }

      state.isMuted = !state.isMuted;
      persistState();

      if (state.isMuted) {
        stopActiveSceneTrack();
        stopMapTrack();
      } else {
        armFromInteraction();
      }

      setVideoVolume();
      renderAudioControls();
    }

    async function setStorySoundForEvent(event, activeMediaItem = null) {
      const nextSource = Array.isArray(event?.soundFiles) && event.soundFiles.length
        ? event.soundFiles[0]
        : null;
      const isVideoFocused = activeMediaItem?.type === "video";
      const previousSource = state.activeSceneSoundPath;
      const currentTrackMatchesNextSource = previousSource === nextSource;

      state.activeSceneEventId = event?.id || null;
      state.activeSceneSoundPath = nextSource;

      if (state.currentMode !== "story" || !nextSource || isVideoFocused) {
        await stopSceneSound({
          fade: true,
          resetTime: true
        });
        renderAudioControls();
        return;
      }

      if (state.activeSceneTrack && currentTrackMatchesNextSource) {
        if (state.isMuted) {
          await fadeTrackVolume(state.activeSceneTrack, 0, STORY_SOUND_FADE_MS, {
            pauseOnComplete: true
          });
        } else {
          if (state.activeSceneTrack.paused && state.hasInteraction) {
            await safelyPlayTrack(state.activeSceneTrack);
          }

          await fadeTrackVolume(
            state.activeSceneTrack,
            resolveSceneTargetVolume(event),
            resolveSceneFadeDuration(event)
          );
        }

        renderAudioControls();
        return;
      }

      await playSceneSound(nextSource, event);
    }

    function primeStorySoundForEvent(event) {
      if (state.currentMode !== "story" || !event?.soundLeadInMs) {
        return;
      }

      // Positive soundLeadInMs opts a scene into an early crossfade as the panel transition begins.
      setStorySoundForEvent(event).catch(() => {
        // If the browser delays playback, the normal slide render will retry cleanly.
      });
    }

    async function syncStoryMediaAudio(activeMediaItem, videoElement, event) {
      state.activeVideoElement = activeMediaItem?.type === "video" ? (videoElement || null) : null;
      setVideoVolume();

      if (state.currentMode !== "story") {
        renderAudioControls();
        return;
      }

      if (activeMediaItem?.type === "video") {
        await stopSceneSound({
          fade: true,
          resetTime: false
        });
        renderAudioControls();
        return;
      }

      await setStorySoundForEvent(event, activeMediaItem);
    }

    elements.ambientToggleButton.addEventListener("click", () => {
      armFromInteraction();
      toggleMute();
    });

    elements.audioVolumeInput.addEventListener("input", () => {
      state.volume = clamp(
        Number(elements.audioVolumeInput.value) / 100,
        STORY_SOUND_MIN_VOLUME,
        STORY_SOUND_MAX_VOLUME
      );
      persistState();

      if (state.activeSceneTrack && !state.isMuted) {
        const activeEvent = getActiveSceneEvent();
        fadeTrackVolume(
          state.activeSceneTrack,
          resolveSceneTargetVolume(activeEvent),
          STORY_SOUND_FADE_MS
        );
      }

      if (state.mapTrack && !state.isMuted) {
        fadeTrackVolume(state.mapTrack, state.volume, STORY_SOUND_FADE_MS);
      }

      setVideoVolume();
      renderAudioControls();
    });

    document.addEventListener("pointerdown", () => {
      if (!state.hasInteraction) {
        armFromInteraction();
      }
    }, { passive: true });

    renderAudioControls();

    return Object.freeze({
      armFromInteraction,
      setAmbientMode,
      primeStorySoundForEvent,
      toggleMute,
      setStorySoundForEvent,
      syncStoryMediaAudio
    });
  }

  /* Optional interstitial chapter cards between major phases */
  function createChapterCardController(elements) {
    if (
      !elements.chapterCardElement ||
      !elements.chapterCardInnerElement ||
      !elements.chapterCardEyebrowElement ||
      !elements.chapterCardTitleElement
    ) {
      return Object.freeze({
        async show() {}
      });
    }

    async function show(event) {
      if (!CHAPTER_CARD_ENABLED) {
        return;
      }

      const cardCopy = createChapterCardCopy(event);
      elements.chapterCardEyebrowElement.textContent = cardCopy.eyebrow;
      elements.chapterCardTitleElement.textContent = cardCopy.title;
      elements.chapterCardElement.dataset.mood = cardCopy.mood;
      elements.chapterCardInnerElement.dataset.mood = cardCopy.mood;
      elements.chapterCardElement.hidden = false;

      globalScope.requestAnimationFrame(() => {
        elements.chapterCardElement.classList.add("is-visible");
      });

      await wait(motionSafeDuration(CHAPTER_CARD_HOLD_MS));

      elements.chapterCardElement.classList.remove("is-visible");
      await wait(motionSafeDuration(CHAPTER_CARD_FADE_MS));
      elements.chapterCardElement.hidden = true;
    }

    return Object.freeze({
      show
    });
  }

  function createAbstractMapController(elements) {
    if (!elements.abstractMapElement || !elements.abstractMapTrackElement) {
      return Object.freeze({
        setStoryOpenHandler() {},
        show() {},
        hide() {},
        markVisited() {},
        setActive() {},
        clearActive() {},
        resetVisited() {}
      });
    }

    const state = {
      visitedSlides: new Set(),
      activeSlideIndex: null,
      storyOpenHandler: null,
      nodeRecords: new Map()
    };

    function scrollNodeIntoView(nodeButton) {
      if (!nodeButton || typeof nodeButton.scrollIntoView !== "function") {
        return;
      }

      nodeButton.scrollIntoView({
        behavior: PREFERS_REDUCED_MOTION ? "auto" : "smooth",
        block: "nearest",
        inline: "center"
      });
    }

    function updateNodeState(slideIndex) {
      const nodeRecord = state.nodeRecords.get(slideIndex);

      if (!nodeRecord) {
        return;
      }

      const isVisited = state.visitedSlides.has(slideIndex);
      const isActive = state.activeSlideIndex === slideIndex;

      nodeRecord.button.classList.toggle("is-visited", isVisited);
      nodeRecord.button.classList.toggle("is-active", isActive);
      nodeRecord.card.classList.toggle("is-visited", isVisited);
      nodeRecord.card.classList.toggle("is-active", isActive);

      if (isActive) {
        scrollNodeIntoView(nodeRecord.button);
      }
    }

    function updateAllNodeStates() {
      state.nodeRecords.forEach((_, slideIndex) => {
        updateNodeState(slideIndex);
      });
    }

    function buildTimeline() {
      const groupsFragment = document.createDocumentFragment();
      const groupsElement = document.createElement("div");
      groupsElement.className = "abstract-map__groups";

      ABSTRACT_PHASE_ORDER.forEach((phaseKey) => {
        const phaseEvents = STORY_EVENTS
          .map((event, index) => ({ event, slideIndex: index + 1 }))
          .filter(({ event }) => event.psychologyPhase === phaseKey);

        if (!phaseEvents.length) {
          return;
        }

        const groupElement = document.createElement("section");
        groupElement.className = `abstract-group phase-${phaseKey}`;

        const headerElement = document.createElement("header");
        headerElement.className = "abstract-group__header";
        headerElement.textContent = getPhaseLabelFromKey(phaseKey);
        groupElement.append(headerElement);

        const eventsElement = document.createElement("div");
        eventsElement.className = "abstract-group__events";

        phaseEvents.forEach(({ event, slideIndex }) => {
          const cardElement = document.createElement("article");
          cardElement.className = "abstract-node-card";

          const nodeButton = document.createElement("button");
          nodeButton.className = `abstract-node phase-${phaseKey}`;
          nodeButton.type = "button";
          nodeButton.dataset.slideIndex = String(slideIndex);
          nodeButton.setAttribute("aria-label", `Open slide ${slideIndex}: ${event.locationName}`);
          nodeButton.innerHTML = `<span class="abstract-node__number">${slideIndex}</span>`;
          nodeButton.addEventListener("click", () => {
            if (typeof state.storyOpenHandler === "function") {
              state.storyOpenHandler(slideIndex - 1);
            }
          });

          const copyElement = document.createElement("div");
          copyElement.className = "abstract-node-card__copy";
          copyElement.innerHTML = `
            <p class="abstract-node-card__title">${event.locationName}</p>
            <p class="abstract-node-card__location">${getAbstractLocationLabel(event)}</p>
          `;

          cardElement.append(nodeButton, copyElement);
          eventsElement.append(cardElement);
          state.nodeRecords.set(slideIndex, {
            button: nodeButton,
            card: cardElement
          });
        });

        groupElement.append(eventsElement);
        groupsElement.append(groupElement);
      });

      groupsFragment.append(groupsElement);
      elements.abstractMapTrackElement.replaceChildren(groupsFragment);
      updateAllNodeStates();
    }

    buildTimeline();

    return Object.freeze({
      setStoryOpenHandler(handler) {
        state.storyOpenHandler = typeof handler === "function" ? handler : null;
      },
      show() {
        elements.abstractMapElement.hidden = false;
        globalScope.requestAnimationFrame(() => {
          elements.abstractMapElement.classList.add("is-visible");
        });
      },
      hide() {
        elements.abstractMapElement.classList.remove("is-visible");
        elements.abstractMapElement.hidden = true;
      },
      markVisited(slideIndex) {
        if (!Number.isInteger(slideIndex)) {
          return;
        }

        state.visitedSlides.add(slideIndex);
        updateNodeState(slideIndex);
      },
      setActive(slideIndex) {
        state.activeSlideIndex = Number.isInteger(slideIndex) ? slideIndex : null;
        updateAllNodeStates();
      },
      clearActive() {
        state.activeSlideIndex = null;
        updateAllNodeStates();
      },
      resetVisited() {
        state.visitedSlides.clear();
        updateAllNodeStates();
      }
    });
  }

  function createStoryController(
    elements,
    mapController,
    audioController,
    chapterCardController,
    auxiliaryControllers = {}
  ) {
    const abstractMapController = auxiliaryControllers.abstractMapController || null;
    const state = {
      currentIndex: 0,
      isBusy: false,
      hasCompletedSequence: false,
      entryMode: STORY_ENTRY_MODE.guided,
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

    function syncMapStoryState({ pulseActiveMarker = true } = {}) {
      const slideIndex = state.currentIndex + 1;

      mapController.focusStorySlide(slideIndex);
      mapController.markPhaseMarkerVisited(slideIndex);
      mapController.setActivePhaseMarker(slideIndex, {
        pulse: pulseActiveMarker
      });
      if (abstractMapController) {
        abstractMapController.markVisited(slideIndex);
        abstractMapController.setActive(slideIndex);
      }

      if (state.entryMode === STORY_ENTRY_MODE.guided) {
        mapController.renderPhasePath();
        mapController.updatePhasePathProgress(slideIndex);
        return;
      }

      mapController.clearStoryPath();
    }

    function updateNavigationState() {
      const isFirstSlide = state.currentIndex === 0;
      const isLastSlide = state.currentIndex === STORY_EVENTS.length - 1;

      elements.storyExitButton.disabled = state.isBusy;
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
      const activeMediaItem = state.mediaItems[state.activeMediaIndex] || null;

      if (!state.mediaItems.length) {
        audioController.syncStoryMediaAudio(null, elements.storyMediaVideoElement, getCurrentEvent());
        showMediaFallback();
        return;
      }

      updateMediaGallerySelection();
      audioController.syncStoryMediaAudio(
        activeMediaItem,
        elements.storyMediaVideoElement,
        getCurrentEvent()
      );
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

    // Reset every internal scroll region when a slide changes so later slides
    // cannot inherit an old scroll offset and appear partially blank.
    function resetStoryScrollPositions() {
      [
        elements.storyContentElement,
        elements.storyBodyElement,
        elements.storyDetailsBodyElement,
        elements.storyReadingBoxElement,
        elements.storyMediaGalleryElement
      ].forEach((region) => {
        if (region) {
          region.scrollTop = 0;
          region.scrollLeft = 0;
        }
      });
    }

    function renderSlide({ syncMapState = false, pulseActiveMarker = true } = {}) {
      const event = getCurrentEvent();

      applyStoryMood(event);
      elements.storyCountElement.textContent = `${state.currentIndex + 1} / ${STORY_EVENTS.length}`;
      elements.storyPhaseElement.textContent = `Phase: ${getPsychologyPhaseLabel(event)}`;
      elements.storyDayRangeElement.textContent = event.dayRange;
      elements.storyLocationElement.textContent = event.locationName;
      elements.storyAddressElement.textContent = event.address;
      elements.storyDescriptionElement.textContent = event.description;
      renderStoryNotes(event);
      updateTimeline(event);
      renderMedia(event);
      resetStoryScrollPositions();

      if (syncMapState) {
        syncMapStoryState({
          pulseActiveMarker
        });
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

      const previousEvent = getCurrentEvent();
      const nextEvent = STORY_EVENTS[nextIndex];
      const shouldShowChapterCard = state.entryMode === STORY_ENTRY_MODE.guided
        && previousEvent.psychologyPhase !== nextEvent.psychologyPhase;

      state.isBusy = true;
      updateNavigationState();
      elements.storyPanelElement.classList.add("is-changing");

      if (Number(nextEvent.soundLeadInMs) > 0) {
        audioController.primeStorySoundForEvent(nextEvent);
      }

      await wait(SLIDE_TRANSITION_MS / 2);

      state.currentIndex = nextIndex;

      if (shouldShowChapterCard) {
        await chapterCardController.show(nextEvent);
      }

      renderSlide({
        syncMapState: true,
        pulseActiveMarker: true
      });

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
      await wait(motionSafeDuration(BLACKOUT_MS));
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

    async function enterStoryMode(startIndex = 0, entryMode = STORY_ENTRY_MODE.guided) {
      if (!STORY_EVENTS.length || state.isBusy) {
        return;
      }

      if (
        entryMode === STORY_ENTRY_MODE.guided &&
        startIndex === 0 &&
        state.hasCompletedSequence &&
        RESET_VISITED_ON_GUIDED_REPLAY
      ) {
        mapController.resetVisitedStoryMarkers();
        if (abstractMapController) {
          abstractMapController.resetVisited();
        }
      }

      state.isBusy = true;
      state.entryMode = entryMode;
      state.currentIndex = normalizeStoryIndex(startIndex);
      audioController.setAmbientMode("story");
      renderSlide({
        syncMapState: true,
        pulseActiveMarker: true
      });

      elements.launchButton.disabled = true;
      mapController.setInteractivity(false);
      elements.pageElement.classList.remove("is-map-active");
      elements.pageElement.classList.add("is-transitioning", "is-transitioning-to-story");

      showVeil();
      await wait(motionSafeDuration(BLACKOUT_MS));

      elements.pageElement.classList.remove("is-transitioning-to-story");
      elements.pageElement.classList.add("is-story-mode", "is-story-active");
      showStoryMode();

      await wait(motionSafeDuration(STORY_REVEAL_DELAY_MS));
      await hideVeil();

      elements.pageElement.classList.remove("is-transitioning");
      state.isBusy = false;
      updateNavigationState();
    }

    function openStoryAtSlide(index, entryMode = STORY_ENTRY_MODE.exploratory) {
      return enterStoryMode(index, entryMode);
    }

    async function returnToMap() {
      if (state.isBusy) {
        return;
      }

      state.isBusy = true;
      updateNavigationState();

      elements.pageElement.classList.add("is-transitioning", "is-transitioning-to-map");
      showVeil();
      await wait(motionSafeDuration(BLACKOUT_MS));

      hideStoryMode();

      elements.pageElement.classList.remove("is-story-mode", "is-story-active", "is-transitioning-to-map");
      elements.pageElement.classList.add("is-map-active");
      state.hasCompletedSequence = true;
      updateLaunchLabel();
      mapController.clearActivePhaseMarker();
      mapController.clearStoryPath();
      if (abstractMapController) {
        abstractMapController.clearActive();
      }
      mapController.setInteractivity(
        !elements.pageElement.classList.contains("is-abstract-map-open")
        && !elements.pageElement.classList.contains("is-info-open")
      );
      audioController.setAmbientMode("map");
      elements.launchButton.disabled = false;

      await wait(motionSafeDuration(STORY_REVEAL_DELAY_MS));
      await hideVeil();

      elements.pageElement.classList.remove("is-transitioning");
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
        elements.storyExitButton,
        elements.storyBackButton,
        elements.storyNextButton
      ].every(Boolean);

      if (!hasRequiredUi) {
        mapController.setInteractivity(true);
        return;
      }

      updateLaunchLabel();
      renderSlide({
        syncMapState: false,
        pulseActiveMarker: false
      });
      elements.storyModeElement.hidden = true;
      elements.storyVeilElement.hidden = true;
      audioController.setAmbientMode("map");

      elements.launchButton.addEventListener("click", () => {
        audioController.armFromInteraction();
        openStoryAtSlide(0, STORY_ENTRY_MODE.guided);
      });
      elements.storyExitButton.addEventListener("click", returnToMap);
      elements.storyNextButton.addEventListener("click", handleNext);
      elements.storyBackButton.addEventListener("click", handleBack);
    }

    attachEvents();

    return Object.freeze({
      openAtSlide: openStoryAtSlide
    });
  }

  function createThemeController(elements) {
    if (!elements.pageElement || !elements.themeButtons.length) {
      return Object.freeze({
        setTheme() {},
        getTheme() {
          return DEFAULT_THEME;
        }
      });
    }

    const state = {
      theme: DEFAULT_THEME
    };

    function render() {
      elements.pageElement.dataset.uiTheme = state.theme;
      elements.themeButtons.forEach((button) => {
        button.classList.toggle("is-active", button.dataset.themeOption === state.theme);
      });
    }

    function setTheme(themeName) {
      state.theme = themeName === "contrast" ? "contrast" : DEFAULT_THEME;
      render();
    }

    elements.themeButtons.forEach((button) => {
      button.addEventListener("click", () => {
        setTheme(button.dataset.themeOption || DEFAULT_THEME);
      });
    });

    render();

    return Object.freeze({
      setTheme,
      getTheme() {
        return state.theme;
      }
    });
  }

  function createTopTabController(elements, mapController, abstractMapController) {
    if (!elements.pageElement || !elements.topTabButtons.length) {
      return Object.freeze({
        showMap() {}
      });
    }

    const INFO_TAB_KEYS = new Set(["guide", "works", "developer", "settings"]);
    const state = {
      activeTab: "map"
    };

    function showInfoScreen(tabKey) {
      elements.infoScreenElements.forEach((screen) => {
        const shouldShow = screen.dataset.infoScreen === tabKey;
        screen.hidden = !shouldShow;
        screen.classList.toggle("is-visible", shouldShow);
      });
    }

    function hideInfoScreens() {
      elements.infoScreenElements.forEach((screen) => {
        screen.classList.remove("is-visible");
        screen.hidden = true;
      });
    }

    function syncMapAvailability() {
      const shouldEnableMap = state.activeTab === "map"
        && !elements.pageElement.classList.contains("is-story-mode")
        && !elements.pageElement.classList.contains("is-intro-active")
        && !elements.pageElement.classList.contains("is-intro-leaving");

      mapController.setInteractivity(shouldEnableMap);
    }

    function render() {
      elements.topTabButtons.forEach((button) => {
        button.classList.toggle("is-active", button.dataset.topTab === state.activeTab);
      });

      elements.pageElement.classList.toggle("is-abstract-map-open", state.activeTab === "abstract");
      elements.pageElement.classList.toggle("is-info-open", INFO_TAB_KEYS.has(state.activeTab));
      elements.pageElement.classList.toggle("is-panel-open", state.activeTab !== "map");

      if (state.activeTab === "abstract") {
        hideInfoScreens();
        abstractMapController.show();
      } else {
        abstractMapController.hide();

        if (INFO_TAB_KEYS.has(state.activeTab)) {
          showInfoScreen(state.activeTab);
        } else {
          hideInfoScreens();
        }
      }

      syncMapAvailability();
    }

    function setActiveTab(tabKey) {
      state.activeTab = tabKey || "map";
      render();
    }

    elements.topTabButtons.forEach((button) => {
      button.addEventListener("click", () => {
        setActiveTab(button.dataset.topTab || "map");
      });
    });

    render();

    return Object.freeze({
      showMap() {
        setActiveTab("map");
      }
    });
  }

  function createIntroController(elements, mapController, audioController) {
    if (!elements.introElement || !elements.pageElement) {
      if (elements.launchButton) {
        elements.launchButton.disabled = false;
      }

      if (elements.pageElement) {
        elements.pageElement.classList.add("is-map-active");
      }
      mapController.setInteractivity(true);
      audioController.setAmbientMode("map");
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
      elements.pageElement.classList.remove("is-transitioning");
      elements.pageElement.classList.add("is-map-active");
      elements.introElement.hidden = true;

      if (elements.launchButton) {
        elements.launchButton.disabled = false;
      }

      mapController.setInteractivity(true);
      audioController.setAmbientMode("map");
    }

    function beginIntroDismissal() {
      if (hasStarted) {
        return;
      }

      audioController.armFromInteraction();
      hasStarted = true;
      elements.pageElement.classList.add("is-transitioning");
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

    if (
      !requiredElements.every(Boolean) ||
      !elements.infoScreenElements.length ||
      !elements.infoBackButtons.length ||
      !elements.infoScreenCloseButtons.length
    ) {
      return;
    }

    const state = {
      isDrawerOpen: false,
      isScreenOpen: false,
      activeScreenKey: null
    };

    function syncInfoStateClass() {
      elements.pageElement.classList.toggle(
        "is-info-open",
        state.isDrawerOpen || state.isScreenOpen
      );
    }

    function renderScreens() {
      elements.infoScreenElements.forEach((screen) => {
        screen.hidden = screen.dataset.infoScreen !== state.activeScreenKey;
      });
    }

    function getScreenByKey(screenKey) {
      return elements.infoScreenElements.find((screen) => screen.dataset.infoScreen === screenKey) || null;
    }

    function openDrawer() {
      state.isDrawerOpen = true;
      elements.infoDrawerElement.hidden = false;
      elements.infoBackdropElement.hidden = false;
      elements.infoToggleButton.setAttribute("aria-expanded", "true");
      elements.pageElement.classList.add("is-info-drawer-open");
      syncInfoStateClass();

      globalScope.requestAnimationFrame(() => {
        elements.infoDrawerElement.classList.add("is-visible");
        elements.infoBackdropElement.classList.add("is-visible");
      });
    }

    function closeDrawer() {
      state.isDrawerOpen = false;
      elements.infoToggleButton.setAttribute("aria-expanded", "false");
      elements.infoDrawerElement.classList.remove("is-visible");
      elements.pageElement.classList.remove("is-info-drawer-open");
      syncInfoStateClass();

      globalScope.setTimeout(() => {
        if (state.isDrawerOpen) {
          return;
        }

        elements.infoDrawerElement.hidden = true;
        if (!state.isScreenOpen) {
          elements.infoBackdropElement.classList.remove("is-visible");
          elements.infoBackdropElement.hidden = true;
        }
      }, 260);
    }

    function toggleDrawer() {
      if (state.isDrawerOpen) {
        closeDrawer();
        return;
      }

      openDrawer();
    }

    function openScreen(tabKey) {
      if (!getScreenByKey(tabKey)) {
        return;
      }

      state.activeScreenKey = tabKey;
      renderScreens();
      state.isScreenOpen = true;
      closeDrawer();
      elements.infoBackdropElement.hidden = false;
      elements.pageElement.classList.add("is-info-screen-open");
      syncInfoStateClass();

      globalScope.requestAnimationFrame(() => {
        const activeScreen = getScreenByKey(tabKey);
        if (activeScreen) {
          activeScreen.classList.add("is-visible");
        }
        elements.infoBackdropElement.classList.add("is-visible");
      });
    }

    function closeScreen() {
      state.isScreenOpen = false;
      state.activeScreenKey = null;
      elements.pageElement.classList.remove("is-info-screen-open");
      syncInfoStateClass();
      elements.infoScreenElements.forEach((screen) => {
        screen.classList.remove("is-visible");
      });

      globalScope.setTimeout(() => {
        if (state.isScreenOpen) {
          return;
        }

        renderScreens();
        if (!state.isDrawerOpen) {
          elements.infoBackdropElement.classList.remove("is-visible");
          elements.infoBackdropElement.hidden = true;
        }
      }, 260);
    }

    function returnToMenu() {
      closeScreen();
      globalScope.setTimeout(() => {
        if (!state.isScreenOpen) {
          openDrawer();
        }
      }, 260);
    }

    renderScreens();

    elements.infoToggleButton.addEventListener("click", toggleDrawer);
    elements.infoCloseButton.addEventListener("click", closeDrawer);
    elements.infoBackButtons.forEach((button) => {
      button.addEventListener("click", returnToMenu);
    });
    elements.infoScreenCloseButtons.forEach((button) => {
      button.addEventListener("click", closeScreen);
    });
    elements.infoBackdropElement.addEventListener("click", () => {
      if (state.isScreenOpen) {
        closeScreen();
        return;
      }

      closeDrawer();
    });
    elements.infoTabButtons.forEach((button) => {
      button.addEventListener("click", () => {
        openScreen(button.dataset.infoTab || "guide");
      });
    });

    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") {
        return;
      }

      if (state.isScreenOpen) {
        closeScreen();
        return;
      }

      if (state.isDrawerOpen) {
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
      storyEvents: STORY_EVENTS,
      interactive: !shouldLockMapAtStart
    });

    const ambientAudioController = createAmbientAudioController(elements);
    const chapterCardController = createChapterCardController(elements);
    const abstractMapController = createAbstractMapController(elements);
    createThemeController(elements);
    const topTabController = createTopTabController(elements, mapController, abstractMapController);
    const storyController = createStoryController(
      elements,
      mapController,
      ambientAudioController,
      chapterCardController,
      {
        abstractMapController
      }
    );
    abstractMapController.setStoryOpenHandler((startIndex) => {
      ambientAudioController.armFromInteraction();
      topTabController.showMap();
      storyController.openAtSlide(startIndex, STORY_ENTRY_MODE.exploratory);
    });
    mapController.setLocationSelectHandler((location) => {
      if (!Number.isInteger(location.slideIndex)) {
        return;
      }

      ambientAudioController.armFromInteraction();
      storyController.openAtSlide(location.slideIndex - 1, STORY_ENTRY_MODE.exploratory);
    });
    createIntroController(elements, mapController, ambientAudioController);
  }

  bootMap();
})(window);
