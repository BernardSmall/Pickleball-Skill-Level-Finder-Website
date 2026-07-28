# PickleRate Beta v0.2.0

PickleRate is a browser-based pickleball self-assessment. This release uses the Stage 2 weighted scoring engine and stores completed assessments in the browser.

## Project structure

```text
PickleRate/
├── index.html
├── README.md
├── css/
│   └── styles.css
├── data/
│   ├── questions.json
│   ├── drills.json
│   ├── levels.json
│   ├── categories.json
│   ├── contradictions.json
│   ├── skillgates.json
│   └── question-metadata.json
├── js/
│   ├── config.js
│   ├── constants.js
│   ├── data-loader.js
│   ├── questions.js
│   ├── drills.js
│   ├── scoring.js
│   ├── history.js
│   ├── app.js
│   └── version.js
├── images/
├── icons/
└── assets/
```

## Editing data

- Change assessment questions and answers in `data/questions.json`.
- Change drill recommendations in `data/drills.json`.
- Change rating conversion and labels in `data/levels.json`.
- Change category names, descriptions and weights in `data/categories.json`.
- Change contradiction rules in `data/contradictions.json`.
- Change advanced-skill requirements in `data/skillgates.json`.
- Change question importance, difficulty and reliability in `data/question-metadata.json`.

The JavaScript files contain behaviour. The JSON files contain editable assessment data.

## Constants

`js/constants.js` contains shared category IDs, local-storage keys and data paths. Use `CATEGORIES.THIRD_SHOT`, for example, instead of repeating `"thirdShot"` throughout application logic.

## Versioning

Release information is stored in `js/config.js`:

```javascript
const APP_CONFIG = Object.freeze({
    name: "PickleRate",
    version: "0.2.0",
    build: "Stage 2",
    release: "Beta",
    scoringEngineVersion: "2.0"
});
```

The footer automatically displays `PickleRate Beta v0.2.0`.

## Running locally

Because the website loads JSON using `fetch`, do not open `index.html` by double-clicking it. Run a local web server from the project folder.

### Python

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

### Visual Studio Code

Install the Live Server extension, right-click `index.html`, and choose **Open with Live Server**.

GitHub Pages and Netlify will serve the JSON files correctly without extra configuration.
