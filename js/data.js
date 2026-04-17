const DEFAULT_TEXT_REVEAL_DELAY_MS = 3000;

const DEFAULT_SCENE = Object.freeze({
  mediaType: "image",
  delayBeforeText: DEFAULT_TEXT_REVEAL_DELAY_MS,
  notes: ""
});

function createScene(scene) {
  return {
    ...DEFAULT_SCENE,
    ...scene
  };
}

function resolveEditableText(defaultValue, editedValue) {
  return typeof editedValue === "string" && editedValue.trim()
    ? editedValue.trim()
    : defaultValue;
}

export const APP_METADATA = Object.freeze({
  title: "The Geography of Guilt",
  subtitle: "A scene-by-scene literary mapping project built around Crime and Punishment.",
  sceneEditsStorageKey: "geography-of-guilt.scene-edits.v1"
});

/*
  Scene order is the reading order of the guided experience.
  Keeping the dataset centralized makes it easy to expand the route later without
  touching the rendering or map logic.
*/
export const SCENES = [
  createScene({
    id: "tavern",
    title: "Marmeladov's Tavern",
    locationName: "Cholka / Sennaya district stand-in",
    modernAddress: "Cholka, Sankt-Peterburg, Russia, 190068",
    lat: 59.9242,
    lng: 30.3032,
    mediaSrc: "assets/images/marmeladov-tavern.png",
    quote: "\"Man grows used to everything, the scoundrel!\"",
    interpretation:
      "The tavern scene punctures Raskolnikov's fantasy of moral insulation. Before the crime is even committed, another person's humiliation and suffering already force compassion back into a mind trying to become cold, abstract, and superior.",
    mapZoom: 17,
    notes: "The project opens where theory first fails to keep pity outside the self."
  }),
  createScene({
    id: "bridge",
    title: "The Bridge / Canal",
    locationName: "Voznesenskiy Most",
    modernAddress: "Voznesensky Ave, 23, St Petersburg, Russia, 190000",
    lat: 59.9264715,
    lng: 30.3081607,
    mediaSrc: "assets/images/bridge-canal-scene.png",
    quote: "\"He walked on, not noticing where he was going.\"",
    interpretation:
      "At the canal, motion becomes a symptom rather than progress. The bridge is a threshold space where hesitation, dissociation, and self-division are made visible in physical movement across the city.",
    mapZoom: 18,
    notes: "A transit point becomes a psychological hinge between thought and action."
  }),
  createScene({
    id: "pawnbroker",
    title: "Pawnbroker's Apartment",
    locationName: "Bolshaya Podyacheskaya stand-in",
    modernAddress: "Bolshaya Podyacheskaya, 16, St. Petersburg, Russia, 190068",
    lat: 59.9246885,
    lng: 30.3057083,
    mediaSrc: "assets/images/pawnbroker-murder.png",
    quote: "\"It was not a human being I killed, it was a principle!\"",
    interpretation:
      "The apartment turns argument into blood. Here the novel destroys the fantasy that violence can remain an intellectual experiment; the body, the room, and the aftermath make the crime immediate, filthy, and irreversible.",
    mapZoom: 18,
    notes: "Abstraction collapses the moment the theory enters an actual room."
  }),
  createScene({
    id: "stairwell",
    title: "Stairwell After the Murder",
    locationName: "Bolshaya Podyacheskaya stairwell",
    modernAddress: "Bolshaya Podyacheskaya, 16, St. Petersburg, Russia, 190068",
    lat: 59.92492,
    lng: 30.30652,
    mediaSrc: "assets/images/stairwell-panic.png",
    quote: "\"He was in a sort of blankness, almost unconscious.\"",
    interpretation:
      "The stairwell transforms urban space into panic architecture. Each landing, doorway, and footstep becomes charged with exposure, making guilt feel not only moral but environmental.",
    mapZoom: 18,
    notes: "After the murder, the city stops feeling navigable and starts feeling predatory."
  }),
  createScene({
    id: "loot",
    title: "Hiding the Loot",
    locationName: "Stolyarnyy Pereulok stand-in",
    modernAddress: "Stolyarnyy Pereulok, 7/18, St Petersburg, Russia, 190031",
    lat: 59.92715,
    lng: 30.3121,
    mediaSrc: "assets/images/hiding-the-loot.png",
    quote: "\"He hid them all under a stone.\"",
    interpretation:
      "Burying the objects matters because the crime never coheres into profit. Instead of claiming the reward promised by his theory, Raskolnikov tries to erase evidence of motive itself, as though concealment could undo intention.",
    mapZoom: 17,
    notes: "This is the moment where gain gives way to compulsion, denial, and waste."
  }),
  createScene({
    id: "police",
    title: "Police Station Summons",
    locationName: "Police district stand-in",
    modernAddress: "Stolyarnyy Pereulok, 7/18, St Petersburg, Russia, 190031",
    lat: 59.9264618,
    lng: 30.314236,
    mediaSrc: "assets/images/police-station.png",
    quote: "\"He felt that he could not go on living like this.\"",
    interpretation:
      "The police office externalizes a pressure already operating inside him. The institution matters less as legal machinery than as a space where anticipatory guilt and the urge toward confession become almost unbearable.",
    mapZoom: 17,
    notes: "Authority appears, but the stronger interrogator is still his own imagination."
  }),
  createScene({
    id: "return",
    title: "Returning to the Crime Scene",
    locationName: "Bol'shaya Pod'yacheskaya return route",
    modernAddress: "Bol'shaya Pod'yacheskaya Ulitsa, 35, Sankt-Peterburg, Russia, 190068",
    lat: 59.9211164,
    lng: 30.3050881,
    mediaSrc: "assets/images/ascending-staircase.jpg",
    quote: "\"He longed to put himself to the test once more.\"",
    interpretation:
      "The return is irrational and self-punishing. Guilt here works through repetition: the mind circles back to the place of rupture not because it seeks mastery, but because it cannot stop re-entering the wound.",
    mapZoom: 17,
    notes: "Reenactment becomes its own form of punishment."
  }),
  createScene({
    id: "sonya",
    title: "Sonya's Room",
    locationName: "Stolyarnyy Pereulok / Sonya stand-in",
    modernAddress: "Stolyarnyy Pereulok, 7/18, St Petersburg, Russia, 190031",
    lat: 59.92662,
    lng: 30.31316,
    mediaSrc: "assets/images/torment-and-tragedy.png",
    quote: "\"Go at once, this very minute, stand at the crossroads, bow down...\"",
    interpretation:
      "Sonya's room is the novel's counter-space. Against calculation, pride, and fever, it offers witness, humility, and the first imaginable route toward confession and transformation.",
    mapZoom: 17,
    notes: "The route through guilt begins to bend toward suffering that can be spoken and shared."
  })
];

export function mergeSceneContent(scene, sceneEdit = {}) {
  return {
    ...scene,
    quote: resolveEditableText(scene.quote, sceneEdit.quote),
    interpretation: resolveEditableText(scene.interpretation, sceneEdit.interpretation)
  };
}
