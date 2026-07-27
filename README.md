# PickleRate

A browser-based pickleball self-assessment website.

## Run locally

Open `index.html` in a browser. For the most reliable development experience, use a local server such as the VS Code Live Server extension.

## Project structure

- `index.html` — page structure and content
- `css/styles.css` — all visual styling and responsive rules
- `js/questions.js` — question bank and answer options
- `js/scoring.js` — Stage 2 scoring engine, metadata, confidence and insights
- `js/drills.js` — drill library and drill rendering
- `js/history.js` — localStorage history and expandable saved results
- `js/app.js` — application state, navigation, assessment flow and UI events
- `images/` — future images and question diagrams
- `icons/` — future icons and favicons
- `assets/` — other static files

## Publish

Upload the complete `PickleRate` folder to GitHub Pages, Netlify or another static host. The host must serve `index.html` from the project root.

## Data storage

Assessment history is stored in the current browser using `localStorage`. It is not synced between devices and can be removed when browser data is cleared.
