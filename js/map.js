(function attachMapController(globalScope) {
  const DEFAULT_MAP_CENTER = Object.freeze([59.9311, 30.3609]);
  const DEFAULT_MAP_ZOOM = 12;
  const TILE_LAYER_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
  const TILE_LAYER_ATTRIBUTION = "&copy; OpenStreetMap contributors";
  const STORY_MARKER_FOCUS_ZOOM = 15;
  const STORY_MARKER_OPEN_DELAY_MS = 420;
  const STORY_MARKER_PULSE_MS = 1650;
  const STORY_PATH_PANE = "storyPathPane";
  const TOOLTIP_DIRECTIONS = Object.freeze(["top", "right", "left", "bottom"]);
  const ENABLE_PSYCHOLOGICAL_PATH = true;
  const ENABLE_PSYCHOLOGICAL_LEGEND = true;
  const ENABLE_PSYCHOLOGICAL_PHASE_LABELS = true;
  const KEEP_BASE_PATH_VISIBLE = true;
  const PSYCH_PHASE_LABEL_MAX_ZOOM = 13.2;
  const PSYCH_LEGEND_DESCRIPTION =
    "The path follows Raskolnikov’s movement from isolation, through the crime, into separation, and finally toward confession.";
  const PSYCHOLOGY_PHASE_ORDER = Object.freeze([
    "isolation",
    "conflict",
    "authorization",
    "rupture",
    "separation",
    "numbness",
    "connection"
  ]);
  const PHASE_CLASS_NAMES = Object.freeze(
    PSYCHOLOGY_PHASE_ORDER.map((phaseName) => `phase-${phaseName}`)
  );
  const PHASE_LABEL_DEFINITIONS = Object.freeze([
    Object.freeze({ title: "Raskolnikov’s Tenement", label: "Isolation", phase: "isolation" }),
    Object.freeze({ title: "Tavern with Marmeladov", label: "Conflict", phase: "conflict" }),
    Object.freeze({ title: "Murder", label: "Rupture", phase: "rupture" }),
    Object.freeze({ title: "Police Station After Murder", label: "Separation", phase: "separation" }),
    Object.freeze({ title: "Sonya Confession", label: "Confession", phase: "connection" })
  ]);
  const PSYCHOLOGICAL_LEGEND_ITEMS = Object.freeze([
    Object.freeze({
      phase: "isolation",
      label: "Yellow / Ochre",
      description: "Isolation and thought forming"
    }),
    Object.freeze({
      phase: "conflict",
      label: "Orange",
      description: "Conflict between empathy and theory"
    }),
    Object.freeze({
      phase: "rupture",
      label: "Red",
      description: "Murder / rupture"
    }),
    Object.freeze({
      phase: "separation",
      label: "Blue",
      description: "Separation after the crime"
    }),
    Object.freeze({
      phase: "numbness",
      label: "Gray-blue",
      description: "Numbness and apathy"
    }),
    Object.freeze({
      phase: "connection",
      label: "Gold",
      description: "Confession and return to connection"
    })
  ]);

  function createMarkerStyle(style) {
    return Object.freeze(style);
  }

  function createPathStyle(style) {
    return Object.freeze({
      ...style,
      lineCap: style.lineCap || "round",
      lineJoin: style.lineJoin || "round",
      className: "story-path-line",
      pane: STORY_PATH_PANE
    });
  }

  /* Psychological marker and path styles */
  const PSYCHOLOGY_PHASE_META = Object.freeze({
    isolation: Object.freeze({
      label: "Isolation",
      marker: Object.freeze({
        default: createMarkerStyle({
          radius: 6.2,
          color: "#cfbf83",
          weight: 1.8,
          fillColor: "#8d7336",
          fillOpacity: 0.94,
          opacity: 0.96
        }),
        visited: createMarkerStyle({
          radius: 6.2,
          color: "#9f8a59",
          weight: 1.8,
          fillColor: "#5f4d26",
          fillOpacity: 0.88,
          opacity: 0.92
        }),
        active: createMarkerStyle({
          radius: 7.5,
          color: "#ead79e",
          weight: 2.3,
          fillColor: "#b88e3f",
          fillOpacity: 1,
          opacity: 1
        }),
        hover: createMarkerStyle({
          radius: 6.9,
          color: "#ddca90",
          weight: 2,
          fillColor: "#9d7b39",
          fillOpacity: 0.98,
          opacity: 1
        })
      }),
      path: Object.freeze({
        future: createPathStyle({
          color: "#6c5328",
          weight: 2.4,
          opacity: 0.44,
          dashArray: "8 10"
        }),
        completed: createPathStyle({
          color: "#9a7541",
          weight: 3,
          opacity: 0.68,
          dashArray: "7 7"
        }),
        current: createPathStyle({
          color: "#b68c55",
          weight: 3.5,
          opacity: 0.9,
          dashArray: "5 6"
        })
      })
    }),
    conflict: Object.freeze({
      label: "Conflict",
      marker: Object.freeze({
        default: createMarkerStyle({
          radius: 6.9,
          color: "#d6a96e",
          weight: 2.1,
          fillColor: "#a5662e",
          fillOpacity: 0.92,
          opacity: 0.96,
          dashArray: "2 4"
        }),
        visited: createMarkerStyle({
          radius: 6.9,
          color: "#a98558",
          weight: 2.1,
          fillColor: "#684120",
          fillOpacity: 0.86,
          opacity: 0.9,
          dashArray: "2 4"
        }),
        active: createMarkerStyle({
          radius: 8,
          color: "#ebc38f",
          weight: 2.5,
          fillColor: "#bf7b33",
          fillOpacity: 1,
          opacity: 1,
          dashArray: "2 4"
        }),
        hover: createMarkerStyle({
          radius: 7.5,
          color: "#e2b680",
          weight: 2.3,
          fillColor: "#b36d30",
          fillOpacity: 0.98,
          opacity: 1,
          dashArray: "2 4"
        })
      }),
      path: Object.freeze({
        future: createPathStyle({
          color: "#7f4f22",
          weight: 2.5,
          opacity: 0.46,
          dashArray: "7 8"
        }),
        completed: createPathStyle({
          color: "#a36830",
          weight: 3.05,
          opacity: 0.72,
          dashArray: "5 6"
        }),
        current: createPathStyle({
          color: "#be8042",
          weight: 3.55,
          opacity: 0.92,
          dashArray: "4 5"
        })
      })
    }),
    authorization: Object.freeze({
      label: "Self-Authorization",
      marker: Object.freeze({
        default: createMarkerStyle({
          radius: 7.2,
          color: "#c36b44",
          weight: 2.25,
          fillColor: "#7a3122",
          fillOpacity: 0.88,
          opacity: 0.96,
          dashArray: "5 4"
        }),
        visited: createMarkerStyle({
          radius: 7.2,
          color: "#92553d",
          weight: 2.2,
          fillColor: "#4d211a",
          fillOpacity: 0.84,
          opacity: 0.9,
          dashArray: "5 4"
        }),
        active: createMarkerStyle({
          radius: 8.2,
          color: "#db8c68",
          weight: 2.6,
          fillColor: "#9c3d29",
          fillOpacity: 0.98,
          opacity: 1,
          dashArray: "5 4"
        }),
        hover: createMarkerStyle({
          radius: 7.8,
          color: "#cf7b57",
          weight: 2.4,
          fillColor: "#8c3827",
          fillOpacity: 0.94,
          opacity: 1,
          dashArray: "5 4"
        })
      }),
      path: Object.freeze({
        future: createPathStyle({
          color: "#662d22",
          weight: 2.55,
          opacity: 0.48,
          dashArray: "6 7"
        }),
        completed: createPathStyle({
          color: "#8f3f2e",
          weight: 3.1,
          opacity: 0.74,
          dashArray: "4 5"
        }),
        current: createPathStyle({
          color: "#aa533a",
          weight: 3.7,
          opacity: 0.94,
          dashArray: "3 4"
        })
      })
    }),
    rupture: Object.freeze({
      label: "Rupture",
      marker: Object.freeze({
        default: createMarkerStyle({
          radius: 8.2,
          color: "#d48b7d",
          weight: 2.8,
          fillColor: "#8f1d1f",
          fillOpacity: 0.96,
          opacity: 1,
          dashArray: "1 5"
        }),
        visited: createMarkerStyle({
          radius: 8.2,
          color: "#9c5f56",
          weight: 2.6,
          fillColor: "#5f1416",
          fillOpacity: 0.88,
          opacity: 0.94,
          dashArray: "1 5"
        }),
        active: createMarkerStyle({
          radius: 9.4,
          color: "#f0b1a4",
          weight: 3.1,
          fillColor: "#b51f22",
          fillOpacity: 1,
          opacity: 1,
          dashArray: "1 5"
        }),
        hover: createMarkerStyle({
          radius: 8.8,
          color: "#e29a8c",
          weight: 2.9,
          fillColor: "#a31f22",
          fillOpacity: 0.98,
          opacity: 1,
          dashArray: "1 5"
        })
      }),
      path: Object.freeze({
        future: createPathStyle({
          color: "#581213",
          weight: 2.85,
          opacity: 0.52,
          dashArray: "3 6",
          lineCap: "square"
        }),
        completed: createPathStyle({
          color: "#791b1b",
          weight: 3.45,
          opacity: 0.8,
          dashArray: "2 5",
          lineCap: "square"
        }),
        current: createPathStyle({
          color: "#971f1f",
          weight: 4.2,
          opacity: 0.98,
          dashArray: "2 3",
          lineCap: "square"
        })
      })
    }),
    separation: Object.freeze({
      label: "Separation",
      marker: Object.freeze({
        default: createMarkerStyle({
          radius: 7.2,
          color: "#7e99b2",
          weight: 2.1,
          fillColor: "#2a3b4c",
          fillOpacity: 0.88,
          opacity: 1
        }),
        visited: createMarkerStyle({
          radius: 7.2,
          color: "#5c7287",
          weight: 2,
          fillColor: "#20303f",
          fillOpacity: 0.78,
          opacity: 0.88
        }),
        active: createMarkerStyle({
          radius: 8.3,
          color: "#97b2c9",
          weight: 2.45,
          fillColor: "#304657",
          fillOpacity: 0.96,
          opacity: 1
        }),
        hover: createMarkerStyle({
          radius: 7.8,
          color: "#8aa6be",
          weight: 2.2,
          fillColor: "#314657",
          fillOpacity: 0.92,
          opacity: 1
        })
      }),
      path: Object.freeze({
        future: createPathStyle({
          color: "#374a60",
          weight: 2.2,
          opacity: 0.42,
          dashArray: "10 10"
        }),
        completed: createPathStyle({
          color: "#4f6780",
          weight: 2.6,
          opacity: 0.64,
          dashArray: "8 8"
        }),
        current: createPathStyle({
          color: "#6684a1",
          weight: 3.1,
          opacity: 0.9,
          dashArray: "6 6"
        })
      })
    }),
    numbness: Object.freeze({
      label: "Numbness",
      marker: Object.freeze({
        default: createMarkerStyle({
          radius: 6.9,
          color: "#8190a0",
          weight: 1.9,
          fillColor: "#41505d",
          fillOpacity: 0.82,
          opacity: 0.9,
          dashArray: "3 6"
        }),
        visited: createMarkerStyle({
          radius: 6.9,
          color: "#697683",
          weight: 1.8,
          fillColor: "#33404b",
          fillOpacity: 0.72,
          opacity: 0.8,
          dashArray: "3 6"
        }),
        active: createMarkerStyle({
          radius: 7.9,
          color: "#a4b0bc",
          weight: 2.2,
          fillColor: "#51616f",
          fillOpacity: 0.92,
          opacity: 0.92,
          dashArray: "3 6"
        }),
        hover: createMarkerStyle({
          radius: 7.4,
          color: "#93a0ad",
          weight: 2,
          fillColor: "#465662",
          fillOpacity: 0.86,
          opacity: 0.88,
          dashArray: "3 6"
        })
      }),
      path: Object.freeze({
        future: createPathStyle({
          color: "#46515d",
          weight: 2.05,
          opacity: 0.38,
          dashArray: "5 10"
        }),
        completed: createPathStyle({
          color: "#5a6773",
          weight: 2.4,
          opacity: 0.58,
          dashArray: "4 8"
        }),
        current: createPathStyle({
          color: "#76848f",
          weight: 2.85,
          opacity: 0.84,
          dashArray: "3 7"
        })
      })
    }),
    connection: Object.freeze({
      label: "Confession / Connection",
      marker: Object.freeze({
        default: createMarkerStyle({
          radius: 7.4,
          color: "#cab98b",
          weight: 2.1,
          fillColor: "#8a6f43",
          fillOpacity: 0.9,
          opacity: 0.98
        }),
        visited: createMarkerStyle({
          radius: 7.4,
          color: "#9f906d",
          weight: 2,
          fillColor: "#5e4b2d",
          fillOpacity: 0.8,
          opacity: 0.88
        }),
        active: createMarkerStyle({
          radius: 8.5,
          color: "#e0cf9e",
          weight: 2.5,
          fillColor: "#ad8c58",
          fillOpacity: 0.98,
          opacity: 1
        }),
        hover: createMarkerStyle({
          radius: 7.9,
          color: "#d6c392",
          weight: 2.3,
          fillColor: "#97774b",
          fillOpacity: 0.94,
          opacity: 1
        })
      }),
      path: Object.freeze({
        future: createPathStyle({
          color: "#665333",
          weight: 2.35,
          opacity: 0.44,
          dashArray: "12 7"
        }),
        completed: createPathStyle({
          color: "#8f7548",
          weight: 3,
          opacity: 0.7,
          dashArray: "10 5"
        }),
        current: createPathStyle({
          color: "#ad925c",
          weight: 3.5,
          opacity: 0.94
        })
      })
    })
  });

  const HOME_ICON_SIZE = Object.freeze([174, 120]);
  const HOME_ICON_ANCHOR = Object.freeze([87, 94]);
  const PIN_ICON_SIZE = Object.freeze([36, 48]);
  const PIN_ICON_ANCHOR = Object.freeze([18, 44]);

  function toLatLng(location) {
    return [location.lat, location.lng];
  }

  function getPsychologyPhaseMeta(phaseName) {
    return PSYCHOLOGY_PHASE_META[phaseName] || PSYCHOLOGY_PHASE_META.isolation;
  }

  function syncPhaseClassName(element, phaseName) {
    if (!element || !element.classList) {
      return;
    }

    element.classList.remove(...PHASE_CLASS_NAMES);

    if (phaseName) {
      element.classList.add(`phase-${phaseName}`);
    }
  }

  function createTooltipContent(location) {
    const wrapper = document.createElement("span");
    wrapper.className = "location-label__content";

    if (Array.isArray(location.slideIndices) && location.slideIndices.length) {
      const indices = document.createElement("span");
      indices.className = "location-label__indices";

      location.slideIndices.forEach((slideNumber) => {
        const badge = document.createElement("span");
        badge.className = "location-label__index";
        badge.textContent = slideNumber;
        indices.append(badge);
      });

      wrapper.append(indices);
    }

    const text = document.createElement("span");
    text.className = "location-label__text";
    text.textContent = location.label;
    wrapper.append(text);

    return wrapper;
  }

  function createStoryMarkerRecord(location, marker) {
    return {
      location,
      marker,
      markerElement: null,
      tooltipElement: null,
      currentPhase: location.psychologyPhase || "isolation",
      isHovered: false,
      isPulsing: false,
      pulseTimerId: null
    };
  }

  class SceneMapController {
    constructor(elements) {
      this.mapElement = elements.mapElement;
      this.placeholderElement = elements.placeholderElement;
      this.placeholderTitleElement = elements.placeholderTitleElement;
      this.placeholderCopyElement = elements.placeholderCopyElement;

      this.map = null;
      this.tileLayer = null;
      this.markers = [];
      this.locations = [];
      this.storyEvents = [];
      this.interactionEnabled = true;
      this.locationSelectHandler = null;
      this.locationSelectTimer = null;
      this.storyMarkerRecords = [];
      this.storyMarkerBySlideIndex = new Map();
      this.visitedStorySlides = new Set();
      this.activeStorySlideIndex = null;
      this.storyPathVisible = false;
      this.storyPathSegments = [];
      this.psychLegendControl = null;
      this.psychLegendElement = null;
      this.psychLegendToggleElement = null;
      this.psychPhaseLabelMarkers = [];
    }

    async initialize({ locations, storyEvents = [], interactive = true }) {
      this.locations = locations.slice();
      this.storyEvents = Array.isArray(storyEvents) ? storyEvents.slice() : [];
      this.interactionEnabled = interactive;

      if (!globalScope.L) {
        this.showPlaceholder(
          "Leaflet could not load.",
          "Check your internet connection or the Leaflet CDN link in index.html."
        );
        return false;
      }

      try {
        this.buildMap();
        this.hidePlaceholder();
        return true;
      } catch (error) {
        this.showPlaceholder("OpenStreetMap could not load.", error.message);
        return false;
      }
    }

    buildMap() {
      if (this.map) {
        return;
      }

      this.map = globalScope.L.map(this.mapElement, {
        center: DEFAULT_MAP_CENTER,
        zoom: DEFAULT_MAP_ZOOM,
        zoomControl: true,
        attributionControl: true
      });

      this.tileLayer = globalScope.L.tileLayer(TILE_LAYER_URL, {
        attribution: TILE_LAYER_ATTRIBUTION,
        maxZoom: 19
      }).addTo(this.map);

      this.ensureStoryPathPane();
      this.setInteractivity(this.interactionEnabled);

      const bounds = [];

      this.locations.forEach((location, index) => {
        const marker = this.createMarker(location);
        const isStoryLocation = Array.isArray(location.slideIndices) && location.slideIndices.length > 0;
        const markerLabelClass = isStoryLocation
          ? "location-label location-label--interactive location-label--story"
          : "location-label";

        if (location.showTooltip !== false && location.label) {
          marker.bindTooltip(createTooltipContent(location), {
            permanent: true,
            interactive: isStoryLocation,
            direction: this.getTooltipDirection(location, index),
            offset: this.getTooltipOffset(location, index),
            className: markerLabelClass
          });
        }

        if (isStoryLocation) {
          const record = createStoryMarkerRecord(location, marker);
          this.storyMarkerRecords.push(record);

          location.slideIndices.forEach((slideNumber) => {
            this.storyMarkerBySlideIndex.set(slideNumber, record);
          });

          marker.on("click", () => {
            this.handleLocationSelection(location);
          });
          marker.on("mouseover", () => {
            record.isHovered = true;
            this.applyStoryMarkerVisualState(record);
          });
          marker.on("mouseout", () => {
            record.isHovered = false;
            this.applyStoryMarkerVisualState(record);
          });

          const tooltip = marker.getTooltip();

          if (tooltip) {
            tooltip.on("click", () => {
              this.handleLocationSelection(location);
            });
          }

          this.deferStoryMarkerElementSync(record);
        }

        this.markers.push(marker);

        if (location.includeInInitialBounds !== false) {
          bounds.push(toLatLng(location));
        }
      });

      this.renderPsychologicalPath();
      this.initPsychMapLegend();
      this.initPsychPhaseLabels();

      this.map.on("zoomend", () => {
        this.updatePsychPhaseLabelVisibility();
      });

      const initialBounds = bounds.length
        ? bounds
        : this.locations.map(toLatLng);

      if (initialBounds.length) {
        this.map.fitBounds(initialBounds, {
          padding: [48, 48],
          maxZoom: 12
        });
      }
    }

    ensureStoryPathPane() {
      if (!this.map) {
        return;
      }

      if (!this.map.getPane(STORY_PATH_PANE)) {
        this.map.createPane(STORY_PATH_PANE);
      }

      const pane = this.map.getPane(STORY_PATH_PANE);

      if (pane) {
        pane.style.zIndex = "360";
        pane.style.pointerEvents = "none";
      }
    }

    createMarker(location) {
      if (location.markerType === "story") {
        const phaseName = location.psychologyPhase || "isolation";
        return globalScope.L.circleMarker(toLatLng(location), {
          ...getPsychologyPhaseMeta(phaseName).marker.default,
          className: "story-marker-dot"
        }).addTo(this.map);
      }

      return globalScope.L.marker(toLatLng(location), {
        icon: this.createMarkerIcon(location)
      }).addTo(this.map);
    }

    createMarkerIcon(location) {
      switch (location.markerType) {
        case "home":
          return globalScope.L.divIcon({
            className: "map-marker-icon map-marker-icon--home",
            html:
              `<span class="map-marker map-marker--home">${
                location.markerCaption
                  ? `<span class="map-marker__home-caption">${location.markerCaption}</span>`
                  : ""
              }<svg class="map-marker__heart-svg" viewBox="0 0 100 92" aria-hidden="true" focusable="false">
                <defs>
                  <linearGradient id="home-heart-gradient" x1="50%" y1="0%" x2="50%" y2="100%">
                    <stop offset="0%" stop-color="#aa3f57"></stop>
                    <stop offset="100%" stop-color="#7f233d"></stop>
                  </linearGradient>
                </defs>
                <path d="M50 88C48.4 86.8 46.3 85.1 43.9 83.1C36.8 77.3 27.4 69 19.3 59.8C11 50.4 4 40.1 4 28.8C4 14.8 14.6 5 27.8 5C36.8 5 44.1 9.4 50 16.7C55.9 9.4 63.2 5 72.2 5C85.4 5 96 14.8 96 28.8C96 40.1 89 50.4 80.7 59.8C72.6 69 63.2 77.3 56.1 83.1C53.7 85.1 51.6 86.8 50 88Z" fill="url(#home-heart-gradient)"></path>
              </svg><span class="map-marker__heart-text">Home</span></span>`,
            iconSize: HOME_ICON_SIZE,
            iconAnchor: HOME_ICON_ANCHOR
          });
        case "institution":
          return globalScope.L.divIcon({
            className: "map-marker-icon map-marker-icon--institution",
            html:
              '<span class="map-marker map-marker--pin map-marker--institution"><span class="map-marker__pin-core"></span><span class="map-marker__pin-glyph"><span class="map-marker__institution-glyph"></span></span></span>',
            iconSize: PIN_ICON_SIZE,
            iconAnchor: PIN_ICON_ANCHOR
          });
        case "city":
          return globalScope.L.divIcon({
            className: "map-marker-icon map-marker-icon--city",
            html:
              '<span class="map-marker map-marker--pin map-marker--city"><span class="map-marker__pin-core"></span><span class="map-marker__pin-glyph"><span class="map-marker__city-dot"></span></span></span>',
            iconSize: PIN_ICON_SIZE,
            iconAnchor: PIN_ICON_ANCHOR
          });
        default:
          return globalScope.L.divIcon({
            className: "map-marker-icon",
            html: "",
            iconSize: PIN_ICON_SIZE,
            iconAnchor: PIN_ICON_ANCHOR
          });
      }
    }

    deferStoryMarkerElementSync(record, attemptsRemaining = 4) {
      globalScope.requestAnimationFrame(() => {
        this.syncStoryMarkerElements(record, attemptsRemaining);
      });
    }

    syncStoryMarkerElements(record, attemptsRemaining = 0) {
      if (!record) {
        return;
      }

      record.markerElement = record.marker.getElement() || null;

      if (record.markerElement) {
        record.markerElement.classList.add("story-marker-dot");
      }

      const tooltip = record.marker.getTooltip();
      record.tooltipElement = tooltip && typeof tooltip.getElement === "function"
        ? tooltip.getElement()
        : null;

      if (record.tooltipElement) {
        record.tooltipElement.classList.add("location-label--story");
      }

      this.applyStoryMarkerVisualState(record);

      if ((!record.markerElement || !record.tooltipElement) && attemptsRemaining > 0) {
        globalScope.setTimeout(() => {
          this.deferStoryMarkerElementSync(record, attemptsRemaining - 1);
        }, 80);
      }
    }

    getStoryEventBySlideIndex(slideIndex) {
      return Number.isInteger(slideIndex) ? this.storyEvents[slideIndex - 1] || null : null;
    }

    getPsychologyPhaseForSlide(slideIndex) {
      const storyEvent = this.getStoryEventBySlideIndex(slideIndex);
      return storyEvent && storyEvent.psychologyPhase
        ? storyEvent.psychologyPhase
        : "isolation";
    }

    getResolvedPsychologyPhase(record) {
      if (!record) {
        return "isolation";
      }

      if (
        Number.isInteger(this.activeStorySlideIndex)
        && record.location.slideIndices.includes(this.activeStorySlideIndex)
      ) {
        return this.getPsychologyPhaseForSlide(this.activeStorySlideIndex);
      }

      const visitedSlides = record.location.slideIndices
        .filter((slideNumber) => this.visitedStorySlides.has(slideNumber))
        .sort((firstSlide, secondSlide) => secondSlide - firstSlide);

      if (visitedSlides.length) {
        return this.getPsychologyPhaseForSlide(visitedSlides[0]);
      }

      if (record.location.psychologyPhase) {
        return record.location.psychologyPhase;
      }

      if (Array.isArray(record.location.psychologyPhases) && record.location.psychologyPhases.length) {
        return record.location.psychologyPhases[0];
      }

      return this.getPsychologyPhaseForSlide(record.location.slideIndices[0]);
    }

    getStoryMarkerStyle(record) {
      const phaseName = this.getResolvedPsychologyPhase(record);
      const phaseMeta = getPsychologyPhaseMeta(phaseName);
      const isActive = this.activeStorySlideIndex !== null
        && record.location.slideIndices.includes(this.activeStorySlideIndex);
      const isVisited = record.location.slideIndices.some((slideNumber) =>
        this.visitedStorySlides.has(slideNumber)
      );

      if (isActive) {
        return phaseMeta.marker.active;
      }

      if (record.isHovered) {
        return phaseMeta.marker.hover;
      }

      return isVisited ? phaseMeta.marker.visited : phaseMeta.marker.default;
    }

    applyStoryMarkerVisualState(record) {
      if (!record || !record.marker) {
        return;
      }

      const isActive = this.activeStorySlideIndex !== null
        && record.location.slideIndices.includes(this.activeStorySlideIndex);
      const isVisited = record.location.slideIndices.some((slideNumber) =>
        this.visitedStorySlides.has(slideNumber)
      );
      const phaseName = this.getResolvedPsychologyPhase(record);
      const style = this.getStoryMarkerStyle(record);
      record.currentPhase = phaseName;

      record.marker.setStyle(style);

      if (record.markerElement) {
        syncPhaseClassName(record.markerElement, phaseName);
        record.markerElement.classList.toggle("is-visited", isVisited);
        record.markerElement.classList.toggle("is-active", isActive);
        record.markerElement.classList.toggle("is-pulsing", record.isPulsing);
      }

      if (record.tooltipElement) {
        syncPhaseClassName(record.tooltipElement, phaseName);
        record.tooltipElement.classList.toggle("location-label--visited", isVisited);
        record.tooltipElement.classList.toggle("location-label--active", isActive);
      }
    }

    applyStoryMarkerStateToAll() {
      this.storyMarkerRecords.forEach((record) => {
        this.applyStoryMarkerVisualState(record);
      });
    }

    triggerStoryMarkerPulse(record) {
      if (!record) {
        return;
      }

      if (record.pulseTimerId) {
        globalScope.clearTimeout(record.pulseTimerId);
      }

      record.isPulsing = false;
      this.applyStoryMarkerVisualState(record);

      globalScope.requestAnimationFrame(() => {
        record.isPulsing = true;
        this.applyStoryMarkerVisualState(record);

        record.pulseTimerId = globalScope.setTimeout(() => {
          record.isPulsing = false;
          record.pulseTimerId = null;
          this.applyStoryMarkerVisualState(record);
        }, STORY_MARKER_PULSE_MS);
      });
    }

    markSlideVisited(slideIndex) {
      if (!Number.isInteger(slideIndex)) {
        return;
      }

      this.visitedStorySlides.add(slideIndex);
      const record = this.storyMarkerBySlideIndex.get(slideIndex);

      if (record) {
        this.applyStoryMarkerVisualState(record);
      }
    }

    setActiveStoryMarker(slideIndex, { pulse = true } = {}) {
      const previousRecord = this.storyMarkerBySlideIndex.get(this.activeStorySlideIndex);
      const nextRecord = this.storyMarkerBySlideIndex.get(slideIndex);

      this.activeStorySlideIndex = Number.isInteger(slideIndex) ? slideIndex : null;

      if (previousRecord && previousRecord !== nextRecord) {
        this.applyStoryMarkerVisualState(previousRecord);
      }

      if (nextRecord) {
        this.applyStoryMarkerVisualState(nextRecord);

        if (pulse) {
          this.triggerStoryMarkerPulse(nextRecord);
        }
      }
    }

    clearActiveStoryMarker() {
      const record = this.storyMarkerBySlideIndex.get(this.activeStorySlideIndex);
      this.activeStorySlideIndex = null;

      if (record) {
        this.applyStoryMarkerVisualState(record);
      }
    }

    resetVisitedStoryMarkers() {
      this.visitedStorySlides.clear();
      this.applyStoryMarkerStateToAll();
      this.clearPsychologicalPath();
    }

    /* Psychological path through the city */
    renderPsychologicalPath() {
      if (!ENABLE_PSYCHOLOGICAL_PATH || !this.map || !this.storyEvents.length) {
        return;
      }

      const segments = [];

      for (let index = 0; index < this.storyEvents.length - 1; index += 1) {
        const startEvent = this.storyEvents[index];
        const endEvent = this.storyEvents[index + 1];
        const phaseName = endEvent.psychologyPhase || startEvent.psychologyPhase || "isolation";
        const line = globalScope.L.polyline(
          [toLatLng(startEvent), toLatLng(endEvent)],
          getPsychologyPhaseMeta(phaseName).path.future
        ).addTo(this.map);

        segments.push({
          line,
          phaseName,
          targetSlideIndex: index + 2
        });
      }

      this.storyPathSegments = segments;

      if (!this.storyPathSegments.length) {
        return;
      }

      this.clearPsychologicalPath();
    }

    hideStoryPathLayers() {
      this.storyPathSegments.forEach((segmentRecord) => {
        segmentRecord.line.setStyle({ opacity: 0 });
      });
    }

    showStoryPath() {
      this.storyPathVisible = true;
      this.updatePsychologicalPathProgress(this.activeStorySlideIndex);
    }

    applyPsychologicalPathState(segmentRecord, stateName) {
      if (!segmentRecord || !segmentRecord.line) {
        return;
      }

      const phaseMeta = getPsychologyPhaseMeta(segmentRecord.phaseName);
      const pathStyle = phaseMeta.path[stateName] || phaseMeta.path.future;

      segmentRecord.line.setStyle(pathStyle);
    }

    updatePsychologicalPathProgress(currentSlideIndex) {
      if (!ENABLE_PSYCHOLOGICAL_PATH || !this.storyPathSegments.length) {
        return;
      }

      if (!Number.isInteger(currentSlideIndex) || currentSlideIndex < 1) {
        this.clearPsychologicalPath();
        return;
      }

      this.storyPathVisible = true;

      this.storyPathSegments.forEach((segmentRecord) => {
        let stateName = "future";

        if (segmentRecord.targetSlideIndex === currentSlideIndex) {
          stateName = "current";
        } else if (segmentRecord.targetSlideIndex < currentSlideIndex) {
          stateName = "completed";
        }

        this.applyPsychologicalPathState(segmentRecord, stateName);
      });
    }

    clearPsychologicalPath() {
      this.storyPathVisible = KEEP_BASE_PATH_VISIBLE;

      this.storyPathSegments.forEach((segmentRecord) => {
        if (!KEEP_BASE_PATH_VISIBLE) {
          segmentRecord.line.setStyle({ opacity: 0 });
          return;
        }

        this.applyPsychologicalPathState(segmentRecord, "future");
      });
    }

    initPsychMapLegend() {
      if (!ENABLE_PSYCHOLOGICAL_LEGEND || !this.map || this.psychLegendControl) {
        return;
      }

      const legendControl = globalScope.L.control({ position: "bottomleft" });

      legendControl.onAdd = () => {
        const container = globalScope.document.createElement("section");
        const isMobile = globalScope.matchMedia && globalScope.matchMedia("(max-width: 820px)").matches;

        container.className = "psych-map-legend";
        container.classList.toggle("is-collapsed", Boolean(isMobile));
        container.innerHTML = `
          <button class="psych-map-legend__toggle" type="button" aria-expanded="${isMobile ? "false" : "true"}">
            <span>Psychological Map Key</span>
            <span class="psych-map-legend__toggle-symbol" aria-hidden="true">${isMobile ? "+" : "−"}</span>
          </button>
          <div class="psych-map-legend__body">
            <p class="psych-map-legend__summary">${PSYCH_LEGEND_DESCRIPTION}</p>
            <ul class="psych-map-legend__items">
              ${PSYCHOLOGICAL_LEGEND_ITEMS.map((item) => `
                <li class="psych-map-legend__item">
                  <span class="psych-map-legend__swatch phase-${item.phase}"></span>
                  <span class="psych-map-legend__copy"><strong>${item.label}:</strong> ${item.description}</span>
                </li>
              `).join("")}
            </ul>
            <div class="psych-map-legend__symbols">
              <p><span class="psych-map-legend__marker psych-map-legend__marker--solid"></span> Solid marker = active or central moment</p>
              <p><span class="psych-map-legend__marker psych-map-legend__marker--faded"></span> Faded marker = already visited</p>
              <p><span class="psych-map-legend__path"></span> Connecting line = Raskolnikov’s psychological path through the city</p>
            </div>
          </div>
        `;

        const toggle = container.querySelector(".psych-map-legend__toggle");

        if (toggle) {
          toggle.addEventListener("click", () => {
            const willCollapse = !container.classList.contains("is-collapsed");
            container.classList.toggle("is-collapsed", willCollapse);
            toggle.setAttribute("aria-expanded", willCollapse ? "false" : "true");
            const toggleSymbol = container.querySelector(".psych-map-legend__toggle-symbol");

            if (toggleSymbol) {
              toggleSymbol.textContent = willCollapse ? "+" : "−";
            }
          });
        }

        globalScope.L.DomEvent.disableClickPropagation(container);
        globalScope.L.DomEvent.disableScrollPropagation(container);

        this.psychLegendElement = container;
        this.psychLegendToggleElement = toggle;

        return container;
      };

      legendControl.addTo(this.map);
      this.psychLegendControl = legendControl;
    }

    initPsychPhaseLabels() {
      if (!ENABLE_PSYCHOLOGICAL_PHASE_LABELS || !this.map || this.psychPhaseLabelMarkers.length) {
        return;
      }

      this.psychPhaseLabelMarkers = PHASE_LABEL_DEFINITIONS
        .map((definition) => {
          const storyEvent = this.storyEvents.find((event) => event.locationName === definition.title);

          if (!storyEvent) {
            return null;
          }

          return globalScope.L.marker([storyEvent.lat, storyEvent.lng], {
            interactive: false,
            keyboard: false,
            zIndexOffset: -150,
            icon: globalScope.L.divIcon({
              className: `psych-phase-label psych-phase-label--${definition.phase}`,
              html: `<span>${definition.label}</span>`,
              iconSize: [94, 28],
              iconAnchor: [16, 26]
            })
          }).addTo(this.map);
        })
        .filter(Boolean);

      this.updatePsychPhaseLabelVisibility();
    }

    updatePsychPhaseLabelVisibility() {
      if (!ENABLE_PSYCHOLOGICAL_PHASE_LABELS || !this.map || !this.psychPhaseLabelMarkers.length) {
        return;
      }

      const shouldShowLabels = this.map.getZoom() <= PSYCH_PHASE_LABEL_MAX_ZOOM;

      this.psychPhaseLabelMarkers.forEach((marker) => {
        const element = marker.getElement();

        if (element) {
          element.classList.toggle("is-hidden", !shouldShowLabels);
        }
      });
    }

    markPsychMarkerVisited(slideIndex) {
      this.markSlideVisited(slideIndex);
    }

    setActivePsychMarker(slideIndex, options) {
      this.setActiveStoryMarker(slideIndex, options);
    }

    clearPsychActiveMarker() {
      this.clearActiveStoryMarker();
    }

    renderStoryPath() {
      this.renderPsychologicalPath();
    }

    updateStoryPathProgress(currentSlideIndex) {
      this.updatePsychologicalPathProgress(currentSlideIndex);
    }

    clearStoryPath() {
      this.clearPsychologicalPath();
    }

    focusStorySlide(slideIndex) {
      if (!this.map || !Number.isInteger(slideIndex)) {
        return;
      }

      const storyEvent = this.storyEvents[slideIndex - 1];

      if (!storyEvent) {
        return;
      }

      this.map.flyTo([storyEvent.lat, storyEvent.lng], STORY_MARKER_FOCUS_ZOOM, {
        animate: true,
        duration: 0.9,
        easeLinearity: 0.25
      });
    }

    setInteractivity(isEnabled) {
      this.interactionEnabled = Boolean(isEnabled);

      if (!this.map) {
        return;
      }

      const method = this.interactionEnabled ? "enable" : "disable";

      [
        this.map.dragging,
        this.map.touchZoom,
        this.map.doubleClickZoom,
        this.map.scrollWheelZoom,
        this.map.boxZoom,
        this.map.keyboard,
        this.map.tap
      ].forEach((handler) => {
        if (handler && typeof handler[method] === "function") {
          handler[method]();
        }
      });

      this.mapElement.classList.toggle("map-canvas--locked", !this.interactionEnabled);
    }

    setLocationSelectHandler(handler) {
      this.locationSelectHandler = typeof handler === "function" ? handler : null;
    }

    handleLocationSelection(location) {
      if (!this.interactionEnabled || typeof this.locationSelectHandler !== "function") {
        return;
      }

      this.focusLocation(location);

      if (Number.isInteger(location.slideIndex)) {
        this.setActiveStoryMarker(location.slideIndex, { pulse: true });
      }

      if (this.locationSelectTimer) {
        globalScope.clearTimeout(this.locationSelectTimer);
      }

      this.locationSelectTimer = globalScope.setTimeout(() => {
        this.locationSelectTimer = null;
        this.locationSelectHandler(location);
      }, STORY_MARKER_OPEN_DELAY_MS);
    }

    focusLocation(location) {
      if (!this.map) {
        return;
      }

      this.map.flyTo(toLatLng(location), STORY_MARKER_FOCUS_ZOOM, {
        animate: true,
        duration: 0.9,
        easeLinearity: 0.25
      });
    }

    getTooltipDirection(location, index) {
      return location.tooltipDirection || TOOLTIP_DIRECTIONS[index % TOOLTIP_DIRECTIONS.length];
    }

    getTooltipOffset(location, index) {
      const isAuxiliaryMarker = location.markerType && location.markerType !== "story";

      switch (this.getTooltipDirection(location, index)) {
        case "right":
          return isAuxiliaryMarker ? [24, -12] : [16, 0];
        case "left":
          return isAuxiliaryMarker ? [-24, -12] : [-16, 0];
        case "bottom":
          return isAuxiliaryMarker ? [0, 18] : [0, 12];
        case "top":
        default:
          return isAuxiliaryMarker ? [0, -20] : [0, -12];
      }
    }

    showPlaceholder(title, copy) {
      this.placeholderElement.hidden = false;
      this.placeholderTitleElement.textContent = title;
      this.placeholderCopyElement.textContent = copy;
    }

    hidePlaceholder() {
      this.placeholderElement.hidden = true;
    }
  }

  globalScope.GeographyOfGuiltMap = Object.freeze({
    SceneMapController
  });
})(window);
