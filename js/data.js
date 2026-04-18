(function attachSceneData(globalScope) {
  const SCENE_IMPORTANCE = Object.freeze({
    secondary: Object.freeze({
      key: "secondary",
      label: "Secondary Passage",
      delayBeforeText: 900
    }),
    important: Object.freeze({
      key: "important",
      label: "Important Psychological Pressure",
      delayBeforeText: 1200
    }),
    major: Object.freeze({
      key: "major",
      label: "Major Psychological Turning Point",
      delayBeforeText: 1700
    })
  });

  function createAnchor(locationName, modernAddress, lat, lng, mapZoom = 17, notes = "") {
    return Object.freeze({
      locationName,
      modernAddress,
      lat,
      lng,
      mapZoom,
      notes
    });
  }

  const LOCATION = Object.freeze({
    pawnbrokerApartment: createAnchor(
      "Pawnbroker's House district anchor",
      "Bolshaya Podyacheskaya, 16, St. Petersburg, Russia, 190068",
      59.9246885,
      30.3057083,
      18,
      "Approximate modern anchor for the pawnbroker's building and its surrounding stairwell."
    ),
    tavern: createAnchor(
      "Haymarket tavern district anchor",
      "Cholka, Sankt-Peterburg, Russia, 190068",
      59.9242,
      30.3032,
      17,
      "Modern-day stand-in for the tavern sequence near the Haymarket social geography of the novel."
    ),
    marmeladovHome: createAnchor(
      "Marmeladov family district anchor",
      "Sennaya Square district, St Petersburg, Russia, 190068",
      59.9238,
      30.3019,
      17,
      "Approximate family-home anchor in the same impoverished district as the tavern scenes."
    ),
    raskolnikovRoom: createAnchor(
      "Raskolnikov's lodging district anchor",
      "Stolyarnyy Pereulok, 7/18, St Petersburg, Russia, 190031",
      59.9275272,
      30.3114796,
      18,
      "Modern-day district stand-in for Raskolnikov's room and nearby passages of fever, isolation, and return."
    ),
    razumihinThreshold: createAnchor(
      "Razumihin district stand-in",
      "Stolyarnyy Pereulok district, St Petersburg, Russia, 190031",
      59.9269,
      30.3132,
      17,
      "Approximate modern anchor for the threshold scene outside Razumihin's rooms."
    ),
    bridge: createAnchor(
      "Voznesenskiy Most",
      "Voznesensky Ave, 23, St Petersburg, Russia, 190000",
      59.9264715,
      30.3081607,
      18,
      "Real bridge location used throughout the project as a threshold space for hesitation, wandering, and turning back."
    ),
    petrovskyIsland: createAnchor(
      "Petrovsky Island",
      "Petrovsky Island, Petrogradsky District, St. Petersburg, Russia",
      59.9583503,
      30.2691772,
      15,
      "Island anchor for the horse dream sequence."
    ),
    policeStation: createAnchor(
      "Police station district anchor",
      "Stolyarnyy Pereulok, 7/18, St Petersburg, Russia, 190031",
      59.9264618,
      30.314236,
      17,
      "Approximate modern anchor for police, Porfiry, and official pressure scenes."
    ),
    lootRock: createAnchor(
      "Loot hiding place anchor",
      "Stolyarnyy Pereulok, 7/18, St Petersburg, Russia, 190031",
      59.92715,
      30.3121,
      17,
      "Approximate modern anchor for the rock under which the stolen items are hidden."
    ),
    crystalPalace: createAnchor(
      "Crystal Palace district anchor",
      "Griboyedov Canal Embankment, 83-91, St Petersburg, Russia, 190000",
      59.9274508,
      30.3033333,
      16,
      "Modern canal-side anchor for the restaurant and wandering scenes."
    ),
    familyLodging: createAnchor(
      "Pulcheria and Dounia lodging district anchor",
      "Bol'shaya Pod'yacheskaya Ulitsa, 35, Sankt-Peterburg, Russia, 190068",
      59.9211164,
      30.3050881,
      17,
      "Approximate family lodging anchor for visits, letters, and the Luzhin conflict."
    ),
    porfiryOffice: createAnchor(
      "Porfiry district anchor",
      "Bolshaya Podyacheskaya district, St Petersburg, Russia, 190068",
      59.92438,
      30.30492,
      17,
      "Approximate investigative-office anchor for the Porfiry scenes."
    ),
    luzhinDinner: createAnchor(
      "Luzhin meeting rooms anchor",
      "Bol'shaya Pod'yacheskaya Ulitsa, 35, Sankt-Peterburg, Russia, 190068",
      59.92084,
      30.30434,
      17,
      "Approximate modern anchor for the dinner and confrontation with Luzhin."
    ),
    sonyaRoom: createAnchor(
      "Sonya's Room district anchor",
      "Stolyarnyy Pereulok, 7/18, St Petersburg, Russia, 190031",
      59.92662,
      30.31316,
      17,
      "Approximate modern anchor for the Sonya scenes, confession, and movement toward rebirth."
    ),
    svidrigailovBar: createAnchor(
      "Svidrigailov tavern district anchor",
      "Stolyarnyy Pereulok district, St Petersburg, Russia, 190031",
      59.92688,
      30.31356,
      17,
      "Approximate tavern/bar anchor for the Svidrigailov encounters."
    ),
    streetCrossroads: createAnchor(
      "Crossroads and street procession anchor",
      "Griboyedov Canal Embankment district, St Petersburg, Russia, 190000",
      59.9283,
      30.3092,
      16,
      "Modern-day street anchor for public movement, processions, and the pressure of confession."
    ),
    siberia: createAnchor(
      "Omsk Oblast / Siberian horizon anchor",
      "Omsk Oblast, Russia",
      56.0935263,
      73.5099936,
      6,
      "A broad Siberian anchor rather than a single exact prison site."
    )
  });

  const MEDIA = Object.freeze({
    pawnhouseStreetView: "assets/pawnhouse.jpg",
    pawnhouseBookView: "assets/e1.png",
    tavern: "assets/images/marmeladov-tavern.png",
    bridge: "assets/images/bridge-canal-scene.png",
    murder: "assets/images/pawnbroker-murder.png",
    stairwell: "assets/images/stairwell-panic.png",
    hiding: "assets/images/hiding-the-loot.png",
    police: "assets/images/police-station.png",
    staircase: "assets/images/ascending-staircase.jpg",
    torment: "assets/images/torment-and-tragedy.png"
  });

  function resolveEditableText(defaultValue, editedValue) {
    return typeof editedValue === "string" && editedValue.trim()
      ? editedValue.trim()
      : defaultValue;
  }

  function createScene(anchor, scene, sequence) {
    const importance = SCENE_IMPORTANCE[scene.importance] || SCENE_IMPORTANCE.secondary;

    return {
      mediaType: "image",
      ...anchor,
      ...scene,
      sequence,
      importance: importance.key,
      importanceLabel: importance.label,
      isMajorTurningPoint: importance.key === "major",
      delayBeforeText: scene.delayBeforeText || importance.delayBeforeText,
      mapZoom: scene.mapZoom || anchor.mapZoom,
      notes: scene.notes || anchor.notes
    };
  }

  function fromAnchor(anchorKey, scene, sequence) {
    return createScene(LOCATION[anchorKey], scene, sequence);
  }

  const APP_METADATA = Object.freeze({
    title: "The Geography of Guilt",
    subtitle: "A scene-by-scene literary mapping project built around Crime and Punishment.",
    sceneEditsStorageKey: "geography-of-guilt.scene-edits.v1"
  });

  const RAW_SCENES = [
  {
    anchor: "pawnbrokerApartment",
    id: "day-1-rehearsal",
    dayLabel: "Day 1",
    title: "Rehearsing the Crime",
    mediaSrc: MEDIA.pawnhouseBookView,
    mediaTreatment: "book-view",
    introImageSrc: MEDIA.pawnhouseStreetView,
    introPrompt: "Click anywhere to view the analysis and the book-view image.",
    importance: "important",
    quote: "\"He had come only to make a trial of it.\"",
    psychologicalRole: "Early calculation; testing the crime in his mind.",
    interpretation:
      "Before blood, there is rehearsal. Raskolnikov uses the apartment as a chamber of mental preparation, training himself to cross the threshold in thought before he crosses it in deed."
  },
  {
    anchor: "tavern",
    id: "day-1-marmeladov",
    dayLabel: "Day 1",
    title: "Meeting Marmeladov",
    mediaSrc: MEDIA.tavern,
    importance: "important",
    quote: "\"He suddenly wanted to hear a human voice.\"",
    psychologicalRole: "Compassion interrupts detachment.",
    interpretation:
      "Marmeladov's confession breaks into the cool isolation Raskolnikov is trying to preserve. Misery enters the project of detachment and proves that other people's suffering can still move him."
  },
  {
    anchor: "marmeladovHome",
    id: "day-1-money-on-the-sill",
    dayLabel: "Day 1",
    title: "Leaving Money for the Family",
    mediaSrc: MEDIA.tavern,
    importance: "major",
    quote: "\"He put the money on the windowsill and slipped out.\"",
    psychologicalRole: "Reveals that he is still capable of pity and human feeling.",
    interpretation:
      "This is the first major crack in his theory. The self that wants to stand above ordinary morality still gives, still pities, still responds to human suffering with instinctive tenderness, and that surviving compassion will later make the crime psychologically impossible to inhabit."
  },
  {
    anchor: "raskolnikovRoom",
    id: "day-2-letter",
    dayLabel: "Day 2",
    title: "His Mother's Letter",
    mediaSrc: MEDIA.torment,
    importance: "important",
    quote: "\"The letter weighed on him like a sentence.\"",
    psychologicalRole: "Humiliation, rage, and family pressure.",
    interpretation:
      "The letter fuses private shame with social injury. Dounia's engagement and the family's sacrifice turn his abstract resentments into something more personal, more humiliating, and more combustible."
  },
  {
    anchor: "razumihinThreshold",
    id: "day-2-razumihin-threshold",
    dayLabel: "Day 2",
    title: "Outside Razumihin's Rooms",
    mediaSrc: MEDIA.staircase,
    importance: "secondary",
    quote: "\"He stood there, but did not go in.\"",
    psychologicalRole: "Paralysis, isolation, inward spiraling.",
    interpretation:
      "He drifts toward help and then refuses it. The hesitation outside Razumihin's door shows how isolation has become a habit as much as a condition."
  },
  {
    anchor: "bridge",
    id: "day-2-intent-hardens",
    dayLabel: "Day 2",
    title: "Intent Hardening into Plan",
    mediaSrc: MEDIA.bridge,
    importance: "important",
    quote: "\"Now it was no longer fantasy.\"",
    psychologicalRole: "Theory hardening into intent.",
    interpretation:
      "What had been speculative begins to gather force. His ideas about power and exception start solidifying into actual intention, and the city becomes a field in which thought is preparing to become action."
  },
  {
    anchor: "petrovskyIsland",
    id: "day-2-horse-dream",
    dayLabel: "Day 2",
    title: "The Dream of the Beaten Horse",
    mediaSrc: MEDIA.torment,
    importance: "major",
    quote: "\"He was crying in his sleep.\"",
    psychologicalRole: "Subconscious moral horror; the child-self rejects violence.",
    interpretation:
      "The dream is a direct rebuke to the murder before the murder happens. Beneath argument, ambition, and injury, the deeper self still experiences cruelty as unbearable, and that moral recoil exposes how false the theory of sanctioned violence really is."
  },
  {
    anchor: "petrovskyIsland",
    id: "day-2-refusal",
    dayLabel: "Day 2",
    title: "He Decides Not to Kill",
    mediaSrc: MEDIA.bridge,
    importance: "important",
    quote: "\"No, I could never do it.\"",
    psychologicalRole: "Brief moral clarity; refusal of violence.",
    interpretation:
      "For a moment the dream clears the air. The planned murder appears not grand or necessary, but impossible, and he glimpses the moral reality he has been trying to suppress."
  },
  {
    anchor: "pawnbrokerApartment",
    id: "day-3-lizaveta-opportunity",
    dayLabel: "Day 3",
    title: "Learning Lizaveta Will Be Away",
    mediaSrc: MEDIA.bridge,
    importance: "important",
    quote: "\"It was as if everything had been arranged for him.\"",
    psychologicalRole: "Surrender to compulsion; a sense of inevitability.",
    interpretation:
      "Chance re-enters as temptation. Instead of strengthening his refusal, the opening feels to him like fate itself, and he yields to the logic that the crime is now somehow being demanded of him."
  },
  {
    anchor: "pawnbrokerApartment",
    id: "day-3-pawnbroker-murder",
    dayLabel: "Day 3",
    title: "Killing the Pawnbroker",
    mediaSrc: MEDIA.murder,
    importance: "major",
    quote: "\"He brought the axe down.\"",
    psychologicalRole: "Collapse of theory into violent action.",
    interpretation:
      "This is where the theory dies by becoming real. What was dressed up as a test of greatness collapses into gore, terror, and irreversible bodily fact; the murder does not prove transcendence, it destroys the framework that justified it."
  },
  {
    anchor: "pawnbrokerApartment",
    id: "day-3-lizaveta-enters",
    dayLabel: "Day 3",
    title: "Lizaveta Walks In",
    mediaSrc: MEDIA.stairwell,
    importance: "important",
    quote: "\"He had forgotten to lock the door.\"",
    psychologicalRole: "Panic and loss of control.",
    interpretation:
      "The planned act instantly escapes its own script. Lizaveta's arrival shows that even on its own brutal terms the crime cannot be contained, and the fantasy of mastery collapses into blind panic."
  },
  {
    anchor: "pawnbrokerApartment",
    id: "day-3-lizaveta-murder",
    dayLabel: "Day 3",
    title: "Killing Lizaveta",
    mediaSrc: MEDIA.murder,
    importance: "major",
    quote: "\"He struck again without thinking.\"",
    psychologicalRole: "The murder exceeds theory and destroys his justification.",
    interpretation:
      "Lizaveta's death annihilates the rationale of the first blow. The crime no longer even pretends to be selective or principled; it spills beyond the theory and reveals its true form as moral devastation."
  },
  {
    anchor: "raskolnikovRoom",
    id: "day-4-hide-evidence-home",
    dayLabel: "Day 4",
    title: "Home, Sleep, and Hiding Evidence",
    mediaSrc: MEDIA.stairwell,
    importance: "important",
    quote: "\"He kept waking and checking everything again.\"",
    psychologicalRole: "Paranoia and obsessive fear.",
    interpretation:
      "Instead of triumph, the crime yields frantic repetition. His room becomes a pressure chamber where exhaustion, fear, and compulsive concealment fold in on one another."
  },
  {
    anchor: "policeStation",
    id: "day-4-police-summons",
    dayLabel: "Day 4",
    title: "At the Police Station",
    mediaSrc: MEDIA.police,
    importance: "major",
    quote: "\"He heard of the murders and fainted.\"",
    psychologicalRole: "Guilt erupts physically before confession.",
    interpretation:
      "His body confesses before his mouth does. The fainting spell makes visible what he is still trying to deny: guilt has already become something involuntary, physical, and impossible to manage through pure will."
  },
  {
    anchor: "lootRock",
    id: "day-4-hide-the-loot",
    dayLabel: "Day 4",
    title: "Hiding the Loot Under the Rock",
    mediaSrc: MEDIA.hiding,
    importance: "important",
    quote: "\"He thrust everything under the stone.\"",
    psychologicalRole: "The emptiness of the crime; the loot becomes meaningless.",
    interpretation:
      "The stolen objects do not open a future. They become dead weight almost immediately, which reveals that the crime never cohered into gain, only into guilt."
  },
  {
    anchor: "raskolnikovRoom",
    id: "days-5-7-illness",
    dayLabel: "Days 5-7",
    title: "The Illness Period",
    mediaSrc: MEDIA.torment,
    importance: "important",
    quote: "\"He seemed to wake out of fragments.\"",
    psychologicalRole: "Fragmentation, fever, and disorientation.",
    interpretation:
      "Illness breaks narrative continuity. He no longer inhabits time as a stable sequence but as a feverish blur, which mirrors the way guilt has shattered his mental coherence."
  },
  {
    anchor: "raskolnikovRoom",
    id: "days-5-7-luzhin-visit",
    dayLabel: "Days 5-7",
    title: "Threatening Luzhin",
    mediaSrc: MEDIA.torment,
    importance: "secondary",
    quote: "\"He could hardly bear the sight of him.\"",
    psychologicalRole: "Displaced rage and hostility.",
    interpretation:
      "Luzhin becomes a nearby target for anger that cannot safely turn inward. The scene matters less for plot than for the way it shows guilt emerging as aggression."
  },
  {
    anchor: "crystalPalace",
    id: "day-8-zametov",
    dayLabel: "Day 8",
    title: "At the Crystal Palace with Zametov",
    mediaSrc: MEDIA.tavern,
    importance: "important",
    quote: "\"What if it was I who killed them?\"",
    psychologicalRole: "A reckless desire to reveal himself.",
    interpretation:
      "He toys with confession as performance. The half-joking disclosure shows that concealment and self-exposure are now intertwined impulses inside him."
  },
  {
    anchor: "marmeladovHome",
    id: "day-8-marmeladov-dying",
    dayLabel: "Day 8",
    title: "Marmeladov Dying in the Street",
    mediaSrc: MEDIA.torment,
    importance: "important",
    quote: "\"He ran to help almost before he knew it.\"",
    psychologicalRole: "Compassion returns despite guilt.",
    interpretation:
      "Even after the murders, his reflex is still toward aid. The crime has not killed pity; instead it has made that surviving pity more painful, because it contradicts the identity he tried to build through violence."
  },
  {
    anchor: "marmeladovHome",
    id: "day-8-first-sight-of-sonia",
    dayLabel: "Day 8",
    title: "Seeing Sonia for the First Time",
    mediaSrc: MEDIA.torment,
    importance: "major",
    quote: "\"He gave them all the money he had.\"",
    psychologicalRole: "An emotional pull toward suffering and sacrifice.",
    interpretation:
      "Sonia enters not as abstraction but as witness, poverty, and moral seriousness. Giving away his money again shows that sacrifice and compassion keep breaking through the shell of nihilism, preparing the one relationship through which confession will become possible."
  },
  {
    anchor: "familyLodging",
    id: "day-8-family-waiting",
    dayLabel: "Day 8",
    title: "Dounia and Pulcheria Waiting for Him",
    mediaSrc: MEDIA.torment,
    importance: "secondary",
    quote: "\"Their love only made it worse.\"",
    psychologicalRole: "Emotional overload.",
    interpretation:
      "Family affection arrives as pressure rather than comfort. He cannot receive love without also feeling the full weight of deception and guilt."
  },
  {
    anchor: "familyLodging",
    id: "day-8-razumihin-takes-over",
    dayLabel: "Day 8",
    title: "Letting Razumihin Take Care of Them",
    mediaSrc: MEDIA.staircase,
    importance: "secondary",
    quote: "\"He pushed the burden onto Razumihin.\"",
    psychologicalRole: "Withdrawal and avoidance.",
    interpretation:
      "Delegating care is an act of retreat. He withdraws because presence has become intolerable when every relation threatens to expose what he has done."
  },
  {
    anchor: "familyLodging",
    id: "day-9-unstable-calm",
    dayLabel: "Day 9",
    title: "An Unstable Calm",
    mediaSrc: MEDIA.torment,
    importance: "secondary",
    quote: "\"For a moment he seemed almost himself again.\"",
    psychologicalRole: "Temporary calm and an unstable reset.",
    interpretation:
      "The apparent recovery is brief and deceptive. Surface civility returns, but only as a pause in the deeper crisis."
  },
  {
    anchor: "familyLodging",
    id: "day-9-luzhin-letter",
    dayLabel: "Day 9",
    title: "Reading Luzhin's Letter",
    mediaSrc: MEDIA.torment,
    importance: "secondary",
    quote: "\"He agreed to attend the meeting.\"",
    psychologicalRole: "Family tension and a brief return of control.",
    interpretation:
      "The letter draws him back into family drama and social performance. It offers a temporary outward task, but does not relieve the inner siege."
  },
  {
    anchor: "porfiryOffice",
    id: "day-9-article-at-porfiry",
    dayLabel: "Day 9",
    title: "His Article Returns in Porfiry's Office",
    mediaSrc: MEDIA.police,
    importance: "important",
    quote: "\"His theory had reached print before him.\"",
    psychologicalRole: "Theory comes back to haunt him.",
    interpretation:
      "The article turns the murder into an intellectual boomerang. Ideas he once treated as abstract speculation return as evidence of the mind that could have done the crime."
  },
  {
    anchor: "porfiryOffice",
    id: "day-9-fearing-porfiry",
    dayLabel: "Day 9",
    title: "Beginning to Fear Porfiry",
    mediaSrc: MEDIA.police,
    importance: "important",
    quote: "\"He could not tell how much Porfiry knew.\"",
    psychologicalRole: "Paranoia intensifies.",
    interpretation:
      "Porfiry's real power lies in uncertainty. Raskolnikov begins to feel read, and that sense of being interpreted becomes almost as frightening as legal discovery."
  },
  {
    anchor: "raskolnikovRoom",
    id: "day-9-murderer-and-svidrigailov",
    dayLabel: "Day 9",
    title: "Called a Murderer; Waking to Svidrigailov",
    mediaSrc: MEDIA.staircase,
    importance: "important",
    quote: "\"Murderer.\"",
    psychologicalRole: "Fear becomes externalized; conscience takes a face.",
    interpretation:
      "What had lived inside him now seems to step into the world. The accusation and Svidrigailov's appearance make guilt feel like an external force that can suddenly enter his room."
  },
  {
    anchor: "raskolnikovRoom",
    id: "day-9-svidrigailov-money",
    dayLabel: "Day 9",
    title: "Rejecting Svidrigailov's Offer",
    mediaSrc: MEDIA.torment,
    importance: "secondary",
    quote: "\"He wanted nothing from him.\"",
    psychologicalRole: "Protectiveness, disgust, and suspicion.",
    interpretation:
      "The refusal reveals that moral instinct is still alive in him, especially where Dounia is concerned. He can still recognize another form of corruption when it stands in front of him."
  },
  {
    anchor: "luzhinDinner",
    id: "day-10-dinner-with-luzhin",
    dayLabel: "Day 10",
    title: "Dinner with Luzhin",
    mediaSrc: MEDIA.torment,
    importance: "secondary",
    quote: "\"Dounia finally saw him clearly.\"",
    psychologicalRole: "Brief satisfaction and vindication.",
    interpretation:
      "The scene offers a rare moment of outward victory. Yet even justified anger does not quiet the private catastrophe already consuming him."
  },
  {
    anchor: "familyLodging",
    id: "day-10-leave-me-alone",
    dayLabel: "Day 10",
    title: "Telling Everyone to Leave Him Alone",
    mediaSrc: MEDIA.bridge,
    importance: "important",
    quote: "\"Leave me until I come to you.\"",
    psychologicalRole: "Deepening isolation and movement toward confession.",
    interpretation:
      "He begins consciously clearing space around himself. Withdrawal is no longer only collapse; it starts to look like preparation for a decisive act."
  },
  {
    anchor: "sonyaRoom",
    id: "day-10-rude-to-sonia",
    dayLabel: "Day 10",
    title: "Roughness in Sonia's Room",
    mediaSrc: MEDIA.torment,
    importance: "important",
    quote: "\"He promised to tell her who killed Lizaveta.\"",
    psychologicalRole: "Drawn to Sonia while resisting vulnerability.",
    interpretation:
      "He moves toward the one person who might receive the truth, but does so abrasively, defensively, almost cruelly. The scene shows how badly he needs witness and how fiercely he resists needing it."
  },
  {
    anchor: "porfiryOffice",
    id: "day-11-porfiry-interrogation",
    dayLabel: "Day 11",
    title: "Porfiry's Interrogation",
    mediaSrc: MEDIA.police,
    importance: "important",
    quote: "\"He felt hunted in thought rather than in law.\"",
    psychologicalRole: "Pressure, fear, and mounting mental strain.",
    interpretation:
      "Porfiry corners him less through proof than through psychology. The interview shows how guilt can be intensified simply by being watched, interpreted, and patiently enclosed."
  },
  {
    anchor: "porfiryOffice",
    id: "day-11-nikolay-confesses",
    dayLabel: "Day 11",
    title: "Nikolay's False Confession",
    mediaSrc: MEDIA.police,
    importance: "secondary",
    quote: "\"Another man suddenly took the blame.\"",
    psychologicalRole: "Temporary relief and suspended guilt.",
    interpretation:
      "The false confession creates a pause but not release. It delays consequence without curing the inner pressure that makes consequence feel inevitable."
  },
  {
    anchor: "sonyaRoom",
    id: "day-11-confession-to-sonia",
    dayLabel: "Day 11",
    title: "Confessing to Sonia",
    mediaSrc: MEDIA.torment,
    importance: "major",
    quote: "\"I killed myself, not the old woman alone.\"",
    psychologicalRole: "First honest self-revelation; the need for witness and compassion.",
    interpretation:
      "This is the first real breach in solitude. By telling Sonia, he finally steps out of pure self-enclosure and lets another conscience stand beside his own, making confession no longer an abstraction but a human possibility."
  },
  {
    anchor: "raskolnikovRoom",
    id: "day-11-dounia-razumihin",
    dayLabel: "Day 11",
    title: "Telling Dounia to Marry Razumihin",
    mediaSrc: MEDIA.torment,
    importance: "secondary",
    quote: "\"He spoke as if already removing himself.\"",
    psychologicalRole: "Self-removal and emotional distancing.",
    interpretation:
      "He arranges futures that do not include him. The gesture is both loving and fatalistic, as though he is already speaking from outside ordinary life."
  },
  {
    anchor: "streetCrossroads",
    id: "day-12-helping-sonia",
    dayLabel: "Day 12",
    title: "Helping Sonia in the Street",
    mediaSrc: MEDIA.torment,
    importance: "important",
    quote: "\"He tried to help where he could.\"",
    psychologicalRole: "Compassion becoming active again.",
    interpretation:
      "The return of compassion is no longer merely private feeling. It begins to take outward form in action, which matters because moral recovery starts before legal resolution."
  },
  {
    anchor: "sonyaRoom",
    id: "day-12-svidrigailov-overhears",
    dayLabel: "Day 12",
    title: "Svidrigailov Reveals He Heard the Confession",
    mediaSrc: MEDIA.torment,
    importance: "important",
    quote: "\"He heard everything through the wall.\"",
    psychologicalRole: "Exposure and pressure closing in.",
    interpretation:
      "The truth that reached Sonia does not remain safely there. The confession now has consequences in the world, and secrecy feels thinner than ever."
  },
  {
    anchor: "svidrigailovBar",
    id: "day-13-svidrigailov-bar",
    dayLabel: "Day 13",
    title: "Meeting Svidrigailov in the Bar",
    mediaSrc: MEDIA.tavern,
    importance: "important",
    quote: "\"He saw a darker version of freedom.\"",
    psychologicalRole: "Confrontation with corruption and his dark double.",
    interpretation:
      "Svidrigailov embodies a life beyond remorse. In facing him, Raskolnikov faces what transgression looks like when it continues without repentance or regeneration."
  },
  {
    anchor: "bridge",
    id: "day-13-losing-svidrigailov",
    dayLabel: "Day 13",
    title: "Trying to Follow, Then Losing Him",
    mediaSrc: MEDIA.bridge,
    importance: "secondary",
    quote: "\"He could not keep hold of events.\"",
    psychologicalRole: "An inability to control outcomes.",
    interpretation:
      "Control keeps slipping away. The scene reinforces how little command he actually has over the moral and social forces set in motion."
  },
  {
    anchor: "policeStation",
    id: "day-14-turning-himself-in",
    dayLabel: "Day 14",
    title: "Turning Himself In",
    mediaSrc: MEDIA.police,
    importance: "major",
    quote: "\"He was ready to go to the police.\"",
    psychologicalRole: "Surrender, exhaustion, and acceptance of guilt.",
    interpretation:
      "Confession finally becomes action. He does not arrive at surrender through triumph or clarity, but through exhaustion, pressure, and the slow recognition that there is no future left inside denial."
  },
  {
    anchor: "siberia",
    id: "epilogue-sentence",
    dayLabel: "After / Epilogue",
    title: "Sentenced to Siberia",
    mediaSrc: MEDIA.staircase,
    importance: "important",
    quote: "\"He was sentenced to eight years.\"",
    psychologicalRole: "Punishment and outward consequence.",
    interpretation:
      "The law finally names what the psyche has long been carrying. Siberia turns inward guilt into outward duration, labor, and consequence."
  },
  {
    anchor: "siberia",
    id: "epilogue-awakening",
    dayLabel: "After / Epilogue",
    title: "Seeing Sonia with New Eyes",
    mediaSrc: MEDIA.torment,
    importance: "major",
    quote: "\"Something new seemed to begin.\"",
    psychologicalRole: "Emotional awakening and the beginning of transformation.",
    interpretation:
      "The novel ends not with solved contradiction but with new capacity for love. This final turning point matters because transformation begins where theory fails, guilt is accepted, and another person is finally seen not as burden or symbol, but as beloved reality."
  }
];

  const SCENES = RAW_SCENES.map((scene, index) =>
    fromAnchor(scene.anchor, scene, index + 1)
  );

  function mergeSceneContent(scene, sceneEdit = {}) {
    return {
      ...scene,
      quote: resolveEditableText(scene.quote, sceneEdit.quote),
      interpretation: resolveEditableText(scene.interpretation, sceneEdit.interpretation)
    };
  }

  globalScope.GeographyOfGuiltData = Object.freeze({
    APP_METADATA,
    SCENES,
    mergeSceneContent
  });
})(window);
