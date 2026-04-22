(function attachSceneData(globalScope) {
  function createStoryEvent(event) {
    return Object.freeze(event);
  }

  const STORY_SOUND = Object.freeze({
    rain: "Slide 1/rainy-city-street-sound-effect.mp3",
    tavern: "Slide 2/placidplace-tavern-ambience-with-openfire-effect-no-loops-86151 copy.mp3",
    dream: "Slide 7/protoU - Static Memories.mp3",
    murder: "Slide 9/church-bell-tolls-with-traffic.mp3",
    bridge: "Slide 12/Coins Drop In Water Sound Effect.mp3",
    breathing: "Slide 14/Slow Breathing Sound Effect (HD).mp3"
  });

  const STORY_EVENTS = Object.freeze([
    createStoryEvent({
      id: "tenement-origin",
      mediaBaseName: "slide1",
      mediaFiles: Object.freeze([
        "Slide 1/rosh.png",
        "Slide 1/ChatGPT Image Apr 21, 2026, 02_39_54 PM.png"
      ]),
      locationName: "Raskolnikov’s Tenement",
      mapLabel: "Raskolnikov’s Tenement",
      address: "17 Grazhdanskaya Ulitsa, St. Petersburg, Russia",
      lat: 59.92764,
      lng: 30.31103,
      dayRange: "Day 1–2",
      timelineStartDay: 1,
      timelineEndDay: 2,
      phase: "Before the Murder",
      soundFiles: Object.freeze([STORY_SOUND.rain]),
      description:
        "The novel opens in Raskolnikov’s cramped room, where he isolates himself and begins to dwell on troubling, “monstrous” thoughts.",
      quote:
        "“It was a tiny cupboard of a room about six paces in length. It had a poverty-stricken appearance with its dusty yellow paper peeling off the walls, and it was so low-pitched that a man of more than average height was ill at ease in it and felt every moment that he would knock his head against the ceiling.”",
      quoteSource: "Part 1, Chapter 3",
      analysis:
        "Raskolnikov describes his room as a “cage” and even a “coffin” in other translations, a space so small and low that a tall person like him can barely stand in it. This physical confinement reflects his mental state, as he becomes trapped within his own thoughts and increasingly cut off from the outside world. The “yellowish,” peeling wallpaper suggests decay, mirroring his psychological deterioration as he isolates himself and begins to develop ideas that later form his theory of the extraordinary man. As he becomes completely absorbed in himself, the room becomes a space where his thoughts are not challenged but instead intensify. In this way, the room functions as the starting point of his crime, creating the conditions for his ideas to grow unchecked.",
      sourceUrl: "https://www.gutenberg.org/files/2554/2554-h/2554-h.htm#link2HCH0003"
    }),
    createStoryEvent({
      id: "marmeladov-tavern",
      mediaBaseName: "slide2",
      mediaFiles: Object.freeze([
        "Slide 2/tavern.jpg",
        "Slide 2/ChatGPT Image Apr 21, 2026, 02_45_33 PM.png"
      ]),
      locationName: "Tavern with Marmeladov",
      mapLabel: "Tavern where Raskolnikov meets Marmeladov",
      address: "19 Prospekt Rimskogo-Korsakova, St. Petersburg, Russia",
      lat: 59.9242,
      lng: 30.3032,
      dayRange: "Day 2",
      timelineStartDay: 2,
      timelineEndDay: 2,
      phase: "Before the Murder",
      soundLeadInMs: 280,
      soundFadeInMs: 220,
      soundVolumeBoost: 1.2,
      soundFiles: Object.freeze([STORY_SOUND.tavern]),
      description:
        "Raskolnikov meets Marmeladov, who shares the story of his family’s suffering.",
      quote: "“Raskolnikov listened attentively.”",
      quoteSource: "Page 38",
      analysis:
        "The tavern scene is the first sign that Raskolnikov cannot sustain emotional detachment in the presence of real suffering. Marmeladov tells his story of failure and guilt, and instead of judging him the way his theory suggests, Raskolnikov actually listens and feels sympathy for him. This shows a clear contradiction in his thinking: even though he’s starting to believe some people are “worthless” in society, he still can’t ignore their suffering. The tavern scene makes it clear that his ideas and his emotions don’t match, and that his theory isn’t as solid as he thinks.",
      sourceUrl: "https://www.planetpublish.com/wp-content/uploads/2011/11/Crime_and_Punishment_T.pdf"
    }),
    createStoryEvent({
      id: "marmeladov-tenement",
      mediaBaseName: "slide3",
      mediaFiles: Object.freeze([
        "Slide 3/marmeladovH.webp",
        "Slide 3/ChatGPT Image Apr 21, 2026, 02_49_13 PM.png"
      ]),
      locationName: "Marmeladov’s Tenement",
      mapLabel: "Marmeladov’s Tenement",
      address: "Bol'shaya Pod'yacheskaya Ulitsa, 27, Sankt-Peterburg, Russia, 190068",
      lat: 59.92338,
      lng: 30.30502,
      dayRange: "Day 2",
      timelineStartDay: 2,
      timelineEndDay: 2,
      phase: "Before the Murder",
      soundFiles: Object.freeze(["Slide 3/rainy-city-street-sound-effect.mp3"]),
      description:
        "After accompanying Marmeladov home, Raskolnikov witnesses the family’s poverty firsthand and impulsively leaves money for them.",
      quote:
        "“And what if I am wrong,” he cried suddenly after a moment’s thought. “What if man is not really a scoundrel, man in general, I mean, the whole race of mankind—then all the rest is prejudice, simply artificial terrors and there are no barriers and it’s all as it should be.”",
      quoteSource: "Part 1, Chapter 2",
      analysis:
        "After witnessing the family’s poverty and leaving them money, Raskolnikov immediately begins to question his own thinking, asking, “What if I am wrong… What if man is not really a scoundrel.” This moment shows that his actions have created doubt in his theory, since he has just helped people he is supposed to see as worthless. His uncertainty reveals that his ideas are not stable, and his attempt to claim that “there are no barriers” suggests he is trying to remove moral limits in order to justify his thinking. Psychologically, this moment exposes a divided and unstable mind, as he shifts between empathy and cold reasoning, showing that he is not in control of his own beliefs but instead caught in an internal struggle."
    }),
    createStoryEvent({
      id: "tenement-return",
      mediaBaseName: "slide4",
      mediaFiles: Object.freeze([
        "Slide 4/rosh copy.png",
        "Slide 4/c04fa1bf-d5d4-483d-9800-cfe4eb52fd5a.png",
        "Slide 4/FD41-De-woonkamer-van-Raskolnikov.jpg"
      ]),
      locationName: "Mother’s Letter",
      mapLabel: "Raskolnikov’s Tenement",
      address: "17 Grazhdanskaya Ulitsa, St. Petersburg, Russia",
      lat: 59.92764,
      lng: 30.31103,
      dayRange: "Day 2–3",
      timelineStartDay: 2,
      timelineEndDay: 3,
      phase: "Before the Murder",
      soundFiles: Object.freeze(["Slide 4/rainy-city-street-sound-effect.mp3"]),
      description:
        "Raskolnikov reads a letter he receives from his mother after a long time.",
      quote:
        "“Almost from the first, while he read the letter, Raskolnikov’s face was wet with tears; but when he finished it, his face was pale and distorted and a bitter, wrathful and malignant smile was on his lips.”",
      quoteSource: "Part 1, Chapter 3",
      analysis:
        "The letter marks a shift from diffuse misery to focused outrage. Raskolnikov’s tears show that he is still emotionally bound to his mother and sister, but the speed with which grief turns into bitterness reveals a mind that cannot remain in helpless feeling for long. Instead, emotion hardens into resentment. The scene matters because private pain begins to acquire ideological force: Dunya’s sacrifice becomes not only something he suffers, but something he starts to interpret as proof that the world itself is intolerable."
    }),
    createStoryEvent({
      id: "k-boulevard",
      mediaBaseName: "slide6",
      mediaFiles: Object.freeze([
        "Slide 6/614._St._Petersburg._Konnogvardeisky_Boulevard,_17.jpg",
        "Slide 6/ChatGPT Image Apr 21, 2026, 02_56_34 PM.png"
      ]),
      locationName: "K. Boulevard",
      mapLabel: "K. Boulevard",
      address: "4 Konnogvardeyskiy Bul'var, St. Petersburg, Russia",
      lat: 59.932602,
      lng: 30.297513,
      dayRange: "Day 3",
      timelineStartDay: 3,
      timelineEndDay: 3,
      phase: "Before the Murder",
      soundFiles: Object.freeze(["Slide 6/rainy-city-street-sound-effect.mp3"]),
      description:
        "While walking in a distracted state, thoughts of his sister Dunya interrupt his mental isolation.",
      quote:
        "“Why did I want to interfere? Is it for me to help? Have I any right to help?”\n\n“Once you’ve said ‘percentage’ there’s nothing more to worry about. If we had any other word... maybe we might feel more uneasy.... But what if Dounia were one of the percentage! Of another one if not that one?”",
      quoteSource: "Part 1, Chapter 4",
      analysis:
        "By asking whether he has any “right” to help, Raskolnikov shows that he no longer trusts his natural impulse to act against suffering and instead tries to judge it through abstract reasoning. This connects to his idea that some people are part of a necessary “percentage” of suffering, suggesting that not all suffering requires intervention. However, when he thinks of Dunya, this reasoning collapses, because he cannot apply the same detached logic to someone he loves. This moment reveals that his attempt to suppress empathy is incomplete, exposing a psychological divide between his abstract thinking and his personal attachments."
    }),
    createStoryEvent({
      id: "river-embankment",
      mediaBaseName: "slide7",
      mediaFiles: Object.freeze([
        "Slide 7/anglijskaya-naberezhnaya-6-915x604.jpg",
        "Slide 7/ChatGPT Image Apr 21, 2026, 02_58_59 PM.png"
      ]),
      locationName: "Horse Dream",
      mapLabel: "River Embankment",
      address: "Zhdanovskaya Naberezhnaya, St. Petersburg, Russia",
      lat: 59.9583503,
      lng: 30.2691772,
      dayRange: "Day 3–4",
      timelineStartDay: 3,
      timelineEndDay: 4,
      phase: "Before the Murder",
      soundLeadInMs: 360,
      soundFadeInMs: 180,
      soundFiles: Object.freeze([STORY_SOUND.dream]),
      description:
        "Overcome with exhaustion and drunk, Raskolnikov falls asleep outdoors and dreams of his childhood.",
      quote:
        "“Father! Why did they... kill... the poor horse!” he sobbed, but his voice broke and the words came in shrieks from his panting chest.",
      quoteSource: "Part 1, Chapter 5",
      analysis:
        "The horse dream functions as a psychological counterargument to the murder before the murder happens. In it, Raskolnikov does not witness violence from the side of the aggressor or the judge, but from the side of helpless pity. That matters because his later theory depends on distance, hierarchy, and the reduction of a life to an obstacle. The dream makes such reduction impossible. It reveals that, beneath his abstract thinking, Raskolnikov isn’t built to be the person his theory requires, he’s too emotionally tied to human suffering to carry it out."
    }),
    createStoryEvent({
      id: "sennaya-square",
      mediaBaseName: "slide8",
      mediaFiles: Object.freeze([
        "Slide 8/heymarket.jpg",
        "Slide 8/ChatGPT Image Apr 21, 2026, 03_04_52 PM.png"
      ]),
      locationName: "Haymarket",
      mapLabel: "Sennaya Square",
      address: "Sennaya Square, St. Petersburg, Russia",
      lat: 59.9262,
      lng: 30.3174,
      dayRange: "Day 4",
      timelineStartDay: 4,
      timelineEndDay: 4,
      phase: "Before the Murder",
      soundVolumeBoost: 1.2,
      soundFiles: Object.freeze(["Slide 8/placidplace-tavern-ambience-with-openfire-effect-no-loops-86151 copy.mp3"]),
      description:
        "Raskolnikov sits in a tavern in the Haymarket overhearing a student argue that killing the pawnbroker would be justified.",
      quote:
        "“Raskolnikov was violently agitated. Of course, it was all ordinary youthful talk and thought, such as he had often heard before in different forms and on different themes. But why had he happened to hear such a discussion and such ideas at the very moment when his own brain was just conceiving... the very same ideas? And why, just at the moment when he had brought away the embryo of his idea from the old woman had he dropped at once upon a conversation about her?”",
      quoteSource: "Part 1, Chapter 6",
      analysis:
        "In this passage, Raskolnikov interprets the coincidence between his own thoughts and the student’s argument as a form of selection rather than chance. Because the idea appears at the exact moment he is developing it, he begins to treat it as something directed toward him, not produced by him. This shift allows him to elevate the idea beyond ordinary moral evaluation and to see himself as the one to whom it properly belongs. Psychologically, this marks a move from deliberation to self-authorization: by reading coincidence as a sign, he transforms a private impulse into something that feels assigned to him, which both strengthens his commitment to it and distances him from responsibility for it."
    }),
    createStoryEvent({
      id: "moneylenders-residence",
      mediaBaseName: "slide9",
      mediaFiles: Object.freeze([
        "Slide 9/pawnhous.jpeg",
        "Slide 9/ChatGPT Image Apr 21, 2026, 03_08_07 PM.png",
        "Slide 9/e9.mp4"
      ]),
      locationName: "Murder",
      mapLabel: "Moneylender’s Residence",
      address: "15 Srednyaya Pod'yacheskaya Ulitsa, St. Petersburg, Russia",
      lat: 59.9246885,
      lng: 30.3057083,
      dayRange: "Day 4 (The Crime)",
      timelineStartDay: 4,
      timelineEndDay: 4,
      phase: "The Murder",
      soundFiles: Object.freeze([STORY_SOUND.murder]),
      description:
        "Raskolnikov kills the pawnbroker and, unexpectedly, her sister. Now in great detail he is cleaning the tools of his crime.",
      quote:
        "“But a sort of blankness, even dreaminess, had begun by degrees to take possession of him; at moments he forgot himself, or rather, forgot what was of importance, and caught at trifles.”",
      quoteSource: "Part 1, Chapter 7",
      analysis:
        "During the murder, Raskolnikov does not appear as the decisive, self-possessed figure his theory imagines. Instead, he acts in a state of fragmentation, distraction, and partial dissociation. This matters because the scene exposes the gap between fantasy and execution: he wanted to prove that he could act beyond ordinary moral paralysis, yet the crime occurs in a haze of confusion rather than sovereign will. The murder therefore begins to disprove the identity he hoped to test."
    }),
    createStoryEvent({
      id: "police-station",
      mediaBaseName: "slide10",
      mediaFiles: Object.freeze([
        "Slide 10/download.jpeg",
        "Slide 10/a9ed19c1-0980-4c4b-ace3-19137ac44ba6.png"
      ]),
      locationName: "Police Station After Murder",
      mapLabel: "Police Station",
      address: "35 Bol'shaya Pod'yacheskaya Ulitsa, St. Petersburg, Russia",
      lat: 59.9211164,
      lng: 30.3050881,
      dayRange: "Day 5–6",
      timelineStartDay: 5,
      timelineEndDay: 6,
      phase: "After the Murder",
      soundFiles: Object.freeze(["Slide 10/rainy-city-street-sound-effect.mp3"]),
      description:
        "At the Police Station on Bolshaya Pod'yacheskaya Ulitsa, Rodion Raskolnikov is inside the building after being summoned about a minor matter.",
      quote:
        "“A gloomy sensation of agonising, everlasting solitude and remoteness, took conscious form in his soul.”",
      quoteSource: "Part 2, Chapter 2",
      analysis:
        "The description of an “agonising, everlasting solitude” reveals that Raskolnikov’s psychological state after the murder is defined by a sudden and total isolation from others. He is no longer able to connect or communicate, even imagining that he could not speak openly to those closest to him. This suggests that the crime has created an internal separation between himself and the rest of humanity, marking the beginning of his psychological punishment."
    }),
    createStoryEvent({
      id: "voznesensky-loot",
      mediaBaseName: "slide11",
      mediaFiles: Object.freeze([
        "Slide 11/71tYOaO29mL._AC_UF894,1000_QL80_.jpg",
        "Slide 11/9c058041-ea2e-45f7-b23f-1c24e8aed2a5.png"
      ]),
      locationName: "Purse",
      mapLabel: "Voznesensky Avenue",
      address: "5 Voznesensky Ave, St. Petersburg, Russia",
      lat: 59.9338,
      lng: 30.3047,
      dayRange: "Day 5–6",
      timelineStartDay: 5,
      timelineEndDay: 6,
      phase: "After the Murder",
      soundFiles: Object.freeze(["Slide 11/rainy-city-street-sound-effect.mp3"]),
      description:
        "Raskolnikov hides the stolen items instead of using them.",
      quote:
        "“If it all has really been done deliberately… how is it I did not even glance into the purse… for which I have undergone these agonies…?”",
      quoteSource: "Part 2, Chapter 2",
      analysis:
        "Raskolnikov’s question about why he never looked inside the purse reveals a breakdown in his psychological control. Although he justified the crime through rational calculation, he now realizes his actions do not align with any clear purpose. This moment exposes that he did not act out of true conviction, but under a distorted and unstable mental state, marking the beginning of his loss of self-understanding."
    }),
    createStoryEvent({
      id: "nikolaevsky-bridge",
      mediaBaseName: "slide12",
      mediaFiles: Object.freeze([
        "Slide 12/305140_doc1.jpg",
        "Slide 12/ChatGPT Image Apr 21, 2026, 03_18_31 PM.png"
      ]),
      locationName: "Nikolaevsky Bridge",
      mapLabel: "Nikolaevsky Bridge",
      address: "Voznesenskiy Most, Voznesensky Ave, 23, St Petersburg, Russia, 190000",
      lat: 59.9264715,
      lng: 30.3081607,
      dayRange: "Day 7–9",
      timelineStartDay: 7,
      timelineEndDay: 9,
      phase: "After the Murder",
      soundFiles: Object.freeze([STORY_SOUND.bridge]),
      description:
        "At the Nikolaevsky Bridge, Rodion Raskolnikov stands alone, looking out over the river after wandering through the city. A stranger has just given him a small coin, mistaking him for a beggar. He pauses, opens his hand, looks at the coin for a moment, then throws it into the water and walks away without speaking to anyone.",
      quote:
        "“He opened his hand, stared at the coin, and with a sweep of his arm flung it into the water; then he turned and went home. It seemed to him, he had cut himself off from everyone and from everything at that moment.”",
      quoteSource: "Part 2, Chapter 2",
      analysis:
        "When Raskolnikov throws the coin into the water, he instinctively rejects an act of human compassion, revealing that he can no longer tolerate connection to others. This moment marks a shift from internal conflict to complete psychological separation, as he abandons both his former moral instincts and his attempt at rational control. His behavior is no longer driven by theory, but by a growing sense of alienation, indicating that the real consequence of the crime is not external punishment, but the irreversible isolation of his own consciousness."
    }),
    createStoryEvent({
      id: "bridge-after-razumikhin",
      mediaBaseName: "slide13",
      mediaFiles: Object.freeze([
        "Slide 13/bridge.jpeg",
        "Slide 13/ChatGPT Image Apr 21, 2026, 03_21_39 PM.png"
      ]),
      locationName: "Woman in Canal",
      mapLabel: "Bridge after conflict with Razumikhin",
      address: "34 Voznesensky Ave, St. Petersburg, Russia",
      lat: 59.9256,
      lng: 30.3074,
      dayRange: "Day 8–10",
      timelineStartDay: 8,
      timelineEndDay: 10,
      phase: "After the Murder",
      soundFiles: Object.freeze(["Slide 13/rainy-city-street-sound-effect.mp3"]),
      description:
        "Right after his tense encounter with Razumikhin, Raskolnikov walks to a bridge and stops in the middle, leaning over the railing and looking out at the water. A crowd gathers nearby as a woman attempts to drown herself in the canal, and a policeman pulls her out.",
      quote:
        "“The crowd broke up. The police still remained around the woman, someone mentioned the police station.... Raskolnikov looked on with a strange sensation of indifference and apathy.”",
      quoteSource: "Part 2, Chapter 6",
      analysis:
        "Raskolnikov’s psychological state shifts from intense agitation to emotional numbness, shown in the line, “Complete apathy had succeeded to it.” After his confrontation with Razumikhin, he no longer reacts with panic or defiance, but instead becomes detached from everything around him. Even the attempted suicide at the bridge fails to provoke a strong response, revealing that his earlier inner conflict has collapsed into exhaustion. This moment marks a turning point where he stops actively struggling with his guilt and instead drifts into a state of indifference and isolation."
    }),
    createStoryEvent({
      id: "sonya-apartment",
      mediaBaseName: "slide14",
      mediaFiles: Object.freeze([
        "Slide 14/96_big.jpg",
        "Slide 14/36df63a7-94e9-4ad9-b112-223053bb0106.png"
      ]),
      locationName: "Sonya Confession",
      mapLabel: "Sonya Marmeladov’s Apartment",
      address: "73 Griboyedov Channel Embankment, St. Petersburg, Russia",
      lat: 59.9274508,
      lng: 30.3033333,
      dayRange: "Day 14 (Confession)",
      timelineStartDay: 14,
      timelineEndDay: 14,
      phase: "After the Murder",
      soundLeadInMs: 260,
      soundFadeInMs: 140,
      soundVolumeBoost: 1.2,
      soundFiles: Object.freeze([STORY_SOUND.breathing]),
      description:
        "Raskolnikov confesses the crime to Sonya.",
      quote:
        "“He did not yet know why it must be so, he only felt it, and the agonising sense of his impotence before the inevitable almost crushed him.”",
      quoteSource: "Part 6, Chapter 4",
      analysis:
        "By the time he confesses to Sonya, the question is no longer whether he can justify the crime, but whether he can keep carrying it on his own. What breaks in this moment is his belief that he can exist independently from others. He doesn’t confess out of pride or even full repentance, but because the weight of what he has done becomes too much to contain alone. Sonya matters because, for the first time, he can’t keep up the idea that he is self-sufficient."
    })
  ]);

  function createMapLocation({
    label,
    modernAddress,
    lat,
    lng,
    slideIndex = null,
    slideIndices = [],
    markerType = "story",
    markerCaption = null,
    showTooltip = true,
    includeInInitialBounds = true,
    tooltipDirection = null
  }) {
    return Object.freeze({
      label,
      modernAddress,
      lat,
      lng,
      slideIndex,
      slideIndices: Object.freeze(slideIndices.slice()),
      markerType,
      markerCaption,
      showTooltip,
      includeInInitialBounds,
      tooltipDirection
    });
  }

  const STORY_MAP_LOCATIONS = Object.freeze(
    Array.from(
      STORY_EVENTS.reduce((locationMap, event, eventIndex) => {
        const key = `${event.mapLabel}::${event.address}`;
        const slideNumber = eventIndex + 1;

        if (!locationMap.has(key)) {
          locationMap.set(
            key,
            createMapLocation({
              label: event.mapLabel,
              modernAddress: event.address,
              lat: event.lat,
              lng: event.lng,
              slideIndex: slideNumber,
              slideIndices: [slideNumber]
            })
          );
        } else {
          const existingLocation = locationMap.get(key);

          if (!existingLocation.slideIndices.includes(slideNumber)) {
            locationMap.set(
              key,
              createMapLocation({
                ...existingLocation,
                slideIndex: existingLocation.slideIndex,
                slideIndices: [...existingLocation.slideIndices, slideNumber]
              })
            );
          }
        }

        return locationMap;
      }, new Map()).values()
    )
  );

  const EXTRA_MAP_LOCATIONS = Object.freeze([
    createMapLocation({
      label: "Home",
      modernAddress: "Mymensingh, Bangladesh",
      lat: 24.7471,
      lng: 90.4203,
      markerType: "home",
      markerCaption: "Moymenshing, Bangladesh",
      showTooltip: false,
      includeInInitialBounds: false
    }),
    createMapLocation({
      label: "Columbia Lit Hum",
      modernAddress: "Columbia University, New York, NY 10027, United States",
      lat: 40.8075,
      lng: -73.9626,
      markerType: "institution",
      includeInInitialBounds: false,
      tooltipDirection: "right"
    }),
    createMapLocation({
      label: "Detroit",
      modernAddress: "Detroit, Michigan, United States",
      lat: 42.3314,
      lng: -83.0458,
      markerType: "city",
      includeInInitialBounds: false,
      tooltipDirection: "right"
    })
  ]);

  const MAP_LOCATIONS = Object.freeze([...STORY_MAP_LOCATIONS, ...EXTRA_MAP_LOCATIONS]);

  globalScope.GeographyOfGuiltData = Object.freeze({
    MAP_LOCATIONS,
    STORY_EVENTS
  });
})(window);
