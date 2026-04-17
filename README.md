# The Geography of Guilt

A vanilla HTML, CSS, and JavaScript literary mapping project built around *Crime and Punishment*. The experience is structured as a guided cinematic sequence through modern-day St. Petersburg, using a Google Map plus scene-based media and interpretation.

## Project Structure

- `index.html`
- `css/styles.css`
- `js/app.js`
- `js/map.js`
- `js/ui.js`
- `js/data.js`
- `assets/images/`
- `assets/videos/`

## Where The Main Logic Lives

- `js/data.js`
  Scene content, coordinates, media paths, quotes, interpretations, and per-scene timing.

- `js/map.js`
  Google Maps loading, map creation, route line drawing, marker setup, and scene-to-scene pan/zoom behavior.

- `js/ui.js`
  DOM rendering, media switching, delayed text reveal, admin modal behavior, and editor visibility.

- `js/app.js`
  Application state, scene navigation, admin-mode orchestration, and `localStorage` persistence.

## Add Your Google Maps API Key

Open `index.html` and find:

```html
window.GEOGRAPHY_OF_GUILT_CONFIG = Object.freeze({
  googleMapsApiKey: "YOUR_GOOGLE_MAPS_API_KEY",
  googleMapsMapId: "DEMO_MAP_ID",
  adminPassword: "change-this-password"
});
```

Replace `YOUR_GOOGLE_MAPS_API_KEY` with your browser-restricted Google Maps JavaScript API key.

`DEMO_MAP_ID` is acceptable while developing. Later, you can replace it with your own custom Google Maps map ID if you want to style the map.

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

These values control where the Google Map pans and how tightly it zooms for that scene.

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

## Admin Mode

Admin mode is intentionally lightweight and hidden.

How to open it:

- Double-click the main title in the app header, or
- Press `Shift + A` while the experience is open

How it works:

- Enter the password from `window.GEOGRAPHY_OF_GUILT_CONFIG.adminPassword` in `index.html`
- Once unlocked, only `quote` and `interpretation` become editable
- Saved changes are stored in the browser under the `localStorage` key:

```text
geography-of-guilt.scene-edits.v1
```

Important:

- Admin edits are local to the browser and device
- They do not rewrite `js/data.js`
- To clear local admin edits, either use the reset button for a scene or clear that `localStorage` key

## Maintenance Notes

- The app is intentionally dependency-free.
- If you later want more scenes, add them in `js/data.js` and drop new media into `assets/images/` or `assets/videos/`.
- If you want to change the hidden admin password, update `adminPassword` in `index.html`.
