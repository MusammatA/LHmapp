import { APP_METADATA, SCENES, mergeSceneContent } from "./data.js";
import { SceneMapController } from "./map.js";
import { createUIController } from "./ui.js";

const DEFAULT_APP_CONFIG = Object.freeze({
  googleMapsApiKey: "",
  googleMapsMapId: "DEMO_MAP_ID",
  adminPassword: ""
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
  isAdminMode: false,
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

function renderActiveScene() {
  const activeScene = getActiveScene();

  if (!activeScene) {
    return;
  }

  ui.renderScene({
    scene: activeScene,
    sceneNumber: state.activeSceneIndex + 1,
    totalScenes: state.scenes.length,
    isFirstScene: state.activeSceneIndex === 0,
    isLastScene: state.activeSceneIndex === state.scenes.length - 1,
    isAdmin: state.isAdminMode,
    revealImmediately: state.isAdminMode
  });

  mapController.focusScene(activeScene);
}

function persistSceneEdits() {
  const didSave = sceneEditStore.save(state.sceneEdits);

  if (!didSave) {
    ui.flashAdminFeedback("This browser blocked local saving for admin edits.");
  }

  return didSave;
}

function refreshSceneState() {
  rebuildSceneCollection();
  renderActiveScene();
}

function syncSceneEdits(successMessage) {
  const didSave = persistSceneEdits();
  refreshSceneState();

  if (didSave) {
    ui.flashAdminFeedback(successMessage);
  }
}

async function startExperience() {
  if (state.hasStarted) {
    return;
  }

  state.hasStarted = true;
  rebuildSceneCollection();
  ui.showExperience();
  ui.setAdminMode(state.isAdminMode);
  renderActiveScene();

  const isMapReady = await mapController.initialize({
    apiKey: appConfig.googleMapsApiKey,
    mapId: appConfig.googleMapsMapId,
    scenes: state.scenes
  });

  if (isMapReady) {
    mapController.focusScene(getActiveScene());
  }
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

function disableAdminMode() {
  state.isAdminMode = false;
  ui.setAdminMode(false);
  renderActiveScene();
  ui.flashAdminFeedback("Admin mode disabled.");
}

function enableAdminMode() {
  state.isAdminMode = true;
  ui.closeAdminModal();
  ui.setAdminMode(true);
  renderActiveScene();
  ui.flashAdminFeedback("Admin mode enabled for this browser session.");
}

function handleAdminPrompt() {
  if (!state.hasStarted) {
    return;
  }

  if (state.isAdminMode) {
    disableAdminMode();
    return;
  }

  ui.openAdminModal();
}

function handleAdminSubmit(password) {
  if (password !== appConfig.adminPassword) {
    ui.showAdminError("Incorrect password.");
    return;
  }

  enableAdminMode();
}

function handleAdminSave({ sceneId, quote, interpretation }) {
  if (!sceneId) {
    return;
  }

  state.sceneEdits[sceneId] = {
    quote: quote.trim(),
    interpretation: interpretation.trim()
  };

  syncSceneEdits("Scene text saved locally.");
}

function handleAdminReset(sceneId) {
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
  onAdminPrompt: handleAdminPrompt,
  onAdminSubmit: handleAdminSubmit,
  onAdminSave: handleAdminSave,
  onAdminReset: handleAdminReset,
  onAdminExit: handleAdminPrompt
});
