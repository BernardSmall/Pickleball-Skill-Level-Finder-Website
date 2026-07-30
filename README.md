# PickleRate

PickleRate is a browser-based pickleball assessment and player-development prototype.

## Run locally

From the project root:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

Do not open `index.html` directly because the browser must fetch `data/questions.json` through a local web server.

## Main folders

```text
PickleRate/
├── index.html
├── assets/
│   ├── css/
│   │   └── styles.css
│   ├── images/
│   │   └── picklerate-logo.svg
│   └── js/
│       └── main.js
├── data/
│   └── questions.json
├── docs/
│   └── PROJECT_STRUCTURE.md
└── README.md
```

## Browser storage

Assessment progress, completed reports, practice data, friend comparisons, settings and tour state are stored in `localStorage`. They remain tied to the current browser and device until cleared.

## Important files

- `index.html` — application markup and page sections.
- `assets/css/styles.css` — all visual styling and responsive rules.
- `assets/js/main.js` — routing, assessment logic, storage, results, Practice Hub, tour and interaction logic.
- `data/questions.json` — assessment question bank.
- `docs/PROJECT_STRUCTURE.md` — detailed structure and editing guidance.
