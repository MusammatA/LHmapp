# Through the Mind of Raskolnikov

A vanilla HTML, CSS, and JavaScript literary mapping project built around *Crime and Punishment*. The experience is structured as a guided cinematic sequence through modern-day St. Petersburg, using Leaflet with OpenStreetMap plus scene-based media and interpretation.

## Project Structure

- `index.html`
- `css/styles.css`
- `js/app.js`
- `js/map.js`
- `js/ui.js`
- `js/data.js`
- `assets/images/`
- `assets/videos/`

The scripts load with plain deferred `<script>` tags instead of ES modules so the project can still run when `index.html` is opened directly in a browser.

## Where The Main Logic Lives

- `js/data.js`
  Scene content, coordinates, media paths, quotes, interpretations, and per-scene timing.

- `js/map.js`
  Leaflet map creation, OpenStreetMap tile loading, route line drawing, marker setup, and scene-to-scene pan/zoom behavior.

- `js/ui.js`
  DOM rendering, media switching, delayed text reveal, and the scene text editing interface.

- `js/app.js`
  Application state, scene navigation, and `localStorage` persistence for editable scene text.

## Map Setup

This project uses:

- Leaflet for the interactive map library
- OpenStreetMap for map tiles

There is no Google Maps API key or billing setup required.

Leaflet is loaded by CDN in `index.html`, and the tile layer is configured in `js/map.js`.

## Add Or Edit Scenes

All scenes live in `js/data.js`.

Each scene object supports:

- `sequence`
- `dayLabel`
- `id`
- `title`
- `locationName`
- `modernAddress`
- `lat`
- `lng`
- `mediaType`
- `mediaSrc`
- `importance`
- `importanceLabel`
- `isMajorTurningPoint`
- `psychologicalRole`
- `quote`
- `interpretation`
- `delayBeforeText`
- `mapZoom`
- `notes`

To add a new scene:

1. Duplicate an existing scene object in `js/data.js`.
2. Give it a unique `id`.
3. Update the title, day label, location, coordinates, media path, and text.
4. Set `importance` to `secondary`, `important`, or `major`.
5. Add a short `psychologicalRole` line that explains the scene's mental or moral function.
6. Keep it in the array where you want it to appear in the linear sequence.

The site renders scene order directly from the array order.

Importance controls pacing and emphasis:

- `secondary`
  Faster reveal and lighter treatment.
- `important`
  Moderate delay and stronger emphasis.
- `major`
  Longest reveal delay and the strongest visual treatment in the interface.

## Change Coordinates

In `js/data.js`, edit:

- `lat`
- `lng`
- `mapZoom`

These values control where the Leaflet map pans and how tightly it zooms for that scene.

## Replace Media

Images go in `assets/images/`.

Videos go in `assets/videos/`.

Then update `mediaType` and `mediaSrc` in `js/data.js`.

Examples:

```js
mediaType: "image",
mediaSrc: "assets/images/your-scene-image.png"
```

```js
mediaType: "video",
mediaSrc: "assets/videos/your-scene-video.mp4"
```

If a file is missing, the app shows a fallback message instead of crashing.

## Scene Text Editing

Quote and interpretation fields are directly editable for any visitor.

How it works:

- Open the experience and move to any scene
- Edit the `Quote` and `Interpretation` fields directly
- Click `Save Edits`
- Saved changes are stored in the browser under the `localStorage` key:

```text
geography-of-guilt.scene-edits.v1
```

Important:

- Edits are local to the browser and device
- They do not rewrite `js/data.js`
- To clear local edits, either use the reset button for a scene or clear that `localStorage` key

## Maintenance Notes

- The app is intentionally lightweight. The only external runtime dependency is Leaflet, loaded from CDN.
- If you later want more scenes, add them in `js/data.js` and drop new media into `assets/images/` or `assets/videos/`.
