import { APP_METADATA, SCENES, buildSceneState } from "./data.js";
import { SceneMapController } from "./map.js";
import { createUIController } from "./ui.js";

const config = window.GEOGRAPHY_OF_GUILT_CONFIG || {};

const state = {
  started: false,
  currentSceneIndex: 0,
  isAdmin: false,
  sceneEdits: loadSceneEdits(),
  scenes: []
};

const ui = createUIController();
const mapController = new SceneMapController({
  mapElement: ui.elements.mapElement,
  placeholderElement: ui.elements.mapPlaceholder,
  placeholderTitleElement: ui.elements.mapPlaceholderTitle,
  placeholderCopyElement: ui.elements.mapPlaceholderCopy,
  statusElement: ui.elements.mapStatus
});

function loadSceneEdits() {
  try {
    const stored = window.localStorage.getItem(APP_METADATA.sceneEditsStorageKey);
    if (!stored) {
      return {};
    }

    const parsed = JSON.parse(stored);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch (error) {
    return {};
  }
}

function persistSceneEdits() {
  try {
    window.localStorage.setItem(
      APP_METADATA.sceneEditsStorageKey,
      JSON.stringify(state.sceneEdits)
    );
  } catch (error) {
    ui.flashAdminFeedback("This browser blocked local saving for admin edits.");
  }
}

function hydrateScenes() {
  state.scenes = SCENES.map((scene) => buildSceneState(scene, state.sceneEdits[scene.id]));
}

function currentScene() {
  return state.scenes[state.currentSceneIndex];
}

function clampSceneIndex(index) {
  return Math.max(0, Math.min(index, state.scenes.length - 1));
}

function renderCurrentScene() {
  const scene = currentScene();

  if (!scene) {
    return;
  }

  ui.renderScene({
    scene,
    sceneNumber: state.currentSceneIndex + 1,
    totalScenes: state.scenes.length,
    isFirstScene: state.currentSceneIndex === 0,
    isLastScene: state.currentSceneIndex === state.scenes.length - 1,
    isAdmin: state.isAdmin,
    revealImmediately: state.isAdmin
  });

  mapController.focusScene(scene);
}

async function startExperience() {
  if (state.started) {
    return;
  }

  state.started = true;
  hydrateScenes();
  ui.showExperience();
  ui.setAdminMode(state.isAdmin);
  renderCurrentScene();

  const mapReady = await mapController.initialize({
    apiKey: config.googleMapsApiKey,
    mapId: config.googleMapsMapId,
    scenes: state.scenes
  });

  if (mapReady) {
    mapController.focusScene(currentScene());
  }
}

function goToScene(nextIndex) {
  if (!state.started) {
    return;
  }

  const boundedIndex = clampSceneIndex(nextIndex);
  if (boundedIndex === state.currentSceneIndex) {
    return;
  }

  state.currentSceneIndex = boundedIndex;
  renderCurrentScene();
}

function handleAdminPrompt() {
  if (!state.started) {
    return;
  }

  if (state.isAdmin) {
    state.isAdmin = false;
    ui.setAdminMode(false);
    ui.flashAdminFeedback("Admin mode disabled.");
    renderCurrentScene();
    return;
  }

  ui.openAdminModal();
}

function handleAdminSubmit(password) {
  if (password !== config.adminPassword) {
    ui.showAdminError("Incorrect password.");
    return;
  }

  state.isAdmin = true;
  ui.closeAdminModal();
  ui.setAdminMode(true);
  renderCurrentScene();
  ui.flashAdminFeedback("Admin mode enabled for this browser session.");
}

function handleAdminSave({ sceneId, quote, interpretation }) {
  if (!sceneId) {
    return;
  }

  state.sceneEdits[sceneId] = {
    quote: quote.trim(),
    interpretation: interpretation.trim()
  };

  persistSceneEdits();
  hydrateScenes();
  renderCurrentScene();
  ui.flashAdminFeedback("Scene text saved locally.");
}

function handleAdminReset(sceneId) {
  if (!sceneId) {
    return;
  }

  delete state.sceneEdits[sceneId];
  persistSceneEdits();
  hydrateScenes();
  renderCurrentScene();
  ui.flashAdminFeedback("Scene text reset to the default dataset.");
}

ui.bindEvents({
  onStart: startExperience,
  onPrevious: () => goToScene(state.currentSceneIndex - 1),
  onNext: () => goToScene(state.currentSceneIndex + 1),
  onAdminPrompt: handleAdminPrompt,
  onAdminSubmit: handleAdminSubmit,
  onAdminSave: handleAdminSave,
  onAdminReset: handleAdminReset,
  onAdminExit: handleAdminPrompt
});
