# Through the Mind of Raskolnikov

An interactive literary map and story experience based on *Crime and Punishment*. The project combines a live Leaflet/OpenStreetMap map with a guided slideshow that follows Raskolnikov through modern-day St. Petersburg, using location images, generated illustrations, video, sound, quotations, and analysis.

## What The Site Does

- Opens with a full-screen intro overlay above the map
- Lets users explore the map freely after the intro
- Supports a guided `Start` mode that walks through the narrative in order
- Lets users jump into the slideshow by clicking numbered story markers on the map
- Displays per-slide media galleries with images and optional video
- Plays ambient map audio plus slide-specific soundscapes
- Includes menu screens for the user guide, works cited, and developer information

## Tech Stack

- Plain `HTML`
- Plain `CSS`
- Plain `JavaScript`
- [Leaflet](https://leafletjs.com/) for the map
- [OpenStreetMap](https://www.openstreetmap.org/) tiles for map data

There is no build step and no framework. The project is meant to stay easy to inspect and edit directly.

## Project Structure

- [index.html](/Users/musammataktar/Desktop/LHmapp/index.html)
  Main document shell, overlay markup, controls, and script/style includes.

- [css/styles.css](/Users/musammataktar/Desktop/LHmapp/css/styles.css)
  Visual system, layout, motion, typography, glass/story styling, map-label styling, and responsive rules.

- [js/app.js](/Users/musammataktar/Desktop/LHmapp/js/app.js)
  Main application controller. Handles intro flow, menu screens, story mode, media rendering, audio, transitions, and navigation state.

- [js/map.js](/Users/musammataktar/Desktop/LHmapp/js/map.js)
  Leaflet map controller. Handles map setup, story markers, custom markers, visited/current states, path lines, and map focus behavior.

- [js/data.js](/Users/musammataktar/Desktop/LHmapp/js/data.js)
  Story events, map locations, coordinates, labels, media paths, quotes, analysis, and sound configuration.

- `Slide 1/` ... `Slide 14/`
  Per-slide media folders. These contain the images, video, and sound files used by the slideshow.

## Running The Project

Because the app uses plain deferred scripts, you can:

1. Open [index.html](/Users/musammataktar/Desktop/LHmapp/index.html) directly in a browser, or
2. Serve the folder with any simple static server if you prefer

Leaflet is loaded from a CDN, so the map requires an internet connection.

## User Experience Overview

### Map Mode

- The user lands on an intro overlay over the map
- After clicking to enter, the map becomes interactive
- Numbered red markers represent story-linked locations
- Special markers also appear for `Home`, `Columbia Lit Hum`, and `Detroit`
- Clicking a numbered story marker opens the slideshow at that scene

### Story Mode

- `Start` begins the full narrative from slide 1
- `Back`, `Next`, and `Exit` control the slideshow
- A day-range timeline appears at the top of each slide
- The media panel supports multiple images and optional video
- The quote and analysis live inside an expandable section to keep the default slide view cleaner

### Audio

- The map can play a wind ambience
- Story slides can play scene-specific looping soundscapes
- The murder slide preserves the video’s own audio behavior
- Sound can be muted or adjusted with the site-wide sound controls

## Where To Edit Content

### 1. Update Story Text

Edit [js/data.js](/Users/musammataktar/Desktop/LHmapp/js/data.js).

Each story event includes content such as:

- `locationName`
- `mapLabel`
- `address`
- `description`
- `quote`
- `quoteSource`
- `analysis`
- `dayRange`
- `phase`

The slideshow order follows the order of `STORY_EVENTS`.

### 2. Update Coordinates Or Map Labels

Also edit [js/data.js](/Users/musammataktar/Desktop/LHmapp/js/data.js).

Relevant fields:

- `lat`
- `lng`
- `mapLabel`
- `address`

The red numbered story markers are built from the story events automatically.

### 3. Replace Slide Media

Put new files in the relevant slide folder, then update that slide’s `mediaFiles` entry in [js/data.js](/Users/musammataktar/Desktop/LHmapp/js/data.js).

Example:

```js
mediaFiles: Object.freeze([
  "Slide 7/location-photo.jpg",
  "Slide 7/illustration.png",
  "Slide 7/scene-video.mp4"
])
```

Supported media types:

- `.png`
- `.jpg`
- `.jpeg`
- `.webp`
- `.mp4`
- `.mov`
- `.webm`

### 4. Replace Slide Audio

Each slide can optionally declare:

- `soundFiles`
- `soundLeadInMs`
- `soundFadeInMs`
- `soundVolumeBoost`

Example:

```js
soundFiles: Object.freeze(["Slide 14/Slow Breathing Sound Effect (HD).mp3"]),
soundLeadInMs: 260,
soundFadeInMs: 140,
soundVolumeBoost: 1.2
```

These are all configured in [js/data.js](/Users/musammataktar/Desktop/LHmapp/js/data.js).

## Code Notes

### `js/app.js`

The main sections are:

- element collection
- ambient audio controller
- chapter-card controller
- story controller
- intro controller
- info drawer controller
- application bootstrap

If you want to change slide behavior, this is usually the file to start with.

### `js/map.js`

The map controller keeps story-specific behavior isolated from the rest of the app:

- visited marker states
- active marker pulse
- story path rendering
- location focus and fly-to behavior
- custom marker rendering

### `js/data.js`

This is the single source of truth for:

- story sequence
- map-linked locations
- captions and addresses
- media paths
- sound cues

## Maintenance Advice

- Keep filenames stable once they are referenced in [js/data.js](/Users/musammataktar/Desktop/LHmapp/js/data.js)
- Use per-slide folders for story assets instead of scattering new files around the repo
- Prefer adding small helper functions in [js/app.js](/Users/musammataktar/Desktop/LHmapp/js/app.js) or [js/map.js](/Users/musammataktar/Desktop/LHmapp/js/map.js) instead of layering logic inline
- Re-run a quick syntax check after edits:

```bash
node --check js/app.js
node --check js/map.js
node --check js/data.js
```

## Credits

This project was built as a Literature Humanities mapping/storytelling assignment centered on Raskolnikov’s psychological movement through *Crime and Punishment*.
