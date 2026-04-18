(function initializeApplication(globalScope) {
  const { APP_METADATA, SCENES, mergeSceneContent } = globalScope.GeographyOfGuiltData;
  const { SceneMapController } = globalScope.GeographyOfGuiltMap;
  const { createUIController } = globalScope.GeographyOfGuiltUI;

  const DEFAULT_APP_CONFIG = Object.freeze({
    googleMapsApiKey: "",
    googleMapsMapId: "DEMO_MAP_ID",
    defaultMapSize: "compact"
  });

  function createSceneEditStore(storageKey) {
    return {
      load() {
        try {
          const storedValue = window.localStorage.getItem(storageKey);

          if (!storedValue) {
            return {};
          }

          const parsedValue = JSON.parse(storedValue);
          return parsedValue && typeof parsedValue === "object" ? parsedValue : {};
        } catch (error) {
          return {};
        }
      },
      save(edits) {
        try {
          window.localStorage.setItem(storageKey, JSON.stringify(edits));
          return true;
        } catch (error) {
          return false;
        }
      }
    };
  }

  const appConfig = {
    ...DEFAULT_APP_CONFIG,
    ...(window.GEOGRAPHY_OF_GUILT_CONFIG || {})
  };

  const sceneEditStore = createSceneEditStore(APP_METADATA.sceneEditsStorageKey);

  const state = {
    hasStarted: false,
    activeSceneIndex: 0,
    mapSize: appConfig.defaultMapSize,
    sceneEdits: sceneEditStore.load(),
    scenes: []
  };

  const ui = createUIController();
  const mapController = new SceneMapController(ui.mapElements);

  function rebuildSceneCollection() {
    state.scenes = SCENES.map((scene) => mergeSceneContent(scene, state.sceneEdits[scene.id]));
  }

  function getActiveScene() {
    return state.scenes[state.activeSceneIndex];
  }

  function clampSceneIndex(index) {
    return Math.max(0, Math.min(index, state.scenes.length - 1));
  }

  function renderActiveScene({ revealImmediately = false, refocusMap = true } = {}) {
    const activeScene = getActiveScene();

    if (!activeScene) {
      return;
    }

    const transitionTiming = refocusMap
      ? mapController.focusScene(activeScene)
      : mapController.getSceneTransitionTiming(activeScene);

    ui.renderScene({
      scene: activeScene,
      sceneNumber: state.activeSceneIndex + 1,
      totalScenes: state.scenes.length,
      isFirstScene: state.activeSceneIndex === 0,
      isLastScene: state.activeSceneIndex === state.scenes.length - 1,
      mapLeadDelay: revealImmediately ? 0 : transitionTiming.mediaRevealDelay,
      revealImmediately
    });
  }

  function persistSceneEdits() {
    const didSave = sceneEditStore.save(state.sceneEdits);

    if (!didSave) {
      ui.flashEditorFeedback("This browser blocked local saving for scene edits.");
    }

    return didSave;
  }

  function refreshSceneState() {
    rebuildSceneCollection();
    renderActiveScene({
      revealImmediately: true,
      refocusMap: false
    });
  }

  function syncSceneEdits(successMessage) {
    const didSave = persistSceneEdits();
    refreshSceneState();

    if (didSave) {
      ui.flashEditorFeedback(successMessage);
    }
  }

  function startExperience() {
    if (state.hasStarted) {
      return;
    }

    state.hasStarted = true;
    rebuildSceneCollection();
    ui.showExperience();
    ui.setMapSize(state.mapSize);

    renderActiveScene();

    mapController.initialize({
      apiKey: appConfig.googleMapsApiKey,
      mapId: appConfig.googleMapsMapId,
      scenes: state.scenes
    }).then((isMapReady) => {
      if (!isMapReady || !state.hasStarted) {
        return;
      }

      mapController.refreshLayout();
      mapController.focusScene(getActiveScene());
    });
  }

  function goToScene(index) {
    if (!state.hasStarted) {
      return;
    }

    const nextIndex = clampSceneIndex(index);
    if (nextIndex === state.activeSceneIndex) {
      return;
    }

    state.activeSceneIndex = nextIndex;
    renderActiveScene();
  }

  function setMapSize(size) {
    state.mapSize = size;
    ui.setMapSize(size);

    window.setTimeout(() => {
      mapController.refreshLayout();
    }, 160);
  }

  function handleSceneTextSave({ sceneId, quote, interpretation }) {
    if (!sceneId) {
      return;
    }

    state.sceneEdits[sceneId] = {
      quote: quote.trim(),
      interpretation: interpretation.trim()
    };

    syncSceneEdits("Scene text saved locally.");
  }

  function handleSceneTextReset(sceneId) {
    if (!sceneId) {
      return;
    }

    delete state.sceneEdits[sceneId];
    syncSceneEdits("Scene text reset to the default dataset.");
  }

  ui.bindEvents({
    onStart: startExperience,
    onPrevious: () => goToScene(state.activeSceneIndex - 1),
    onNext: () => goToScene(state.activeSceneIndex + 1),
    onMapSizeChange: setMapSize,
    onSceneTextSave: handleSceneTextSave,
    onSceneTextReset: handleSceneTextReset
  });
})(window);
