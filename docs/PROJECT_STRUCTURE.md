# PickleRate project structure

## Purpose of this reorganisation

The project previously kept every file in one folder. The new structure separates files by responsibility without changing application behaviour.

## Folder responsibilities

### `/index.html`
Contains the application shell and all view containers, including Home, Assessment, Results, My Journey, Insights, Skills, Practice Hub, Compare Friends, Drill Library, Settings, About and the guided tour.

### `/assets/css/styles.css`
Contains:

- theme variables
- typography
- navigation and More panel styles
- layout and cards
- assessment UI
- result charts
- Practice Hub and Drill Library UI
- guided tour styles
- mobile and desktop responsive rules

### `/assets/js/main.js`
Contains the current application logic. It is intentionally retained as one file during this reorganisation so the existing functionality remains stable.

Major responsibilities include:

- loading questions
- client-side routing
- assessment state and scoring
- result rendering
- history snapshots
- comparisons and insights
- Skills and Practice Hub
- Drill Library
- friend share codes
- settings and data export
- guided onboarding tour
- `localStorage` persistence

A future refactor can split this file into modules after automated tests are added.

### `/assets/images`
Static visual assets such as the PickleRate logo.

### `/data/questions.json`
The assessment question bank. Keep question IDs stable once real user results exist, because saved assessments may refer to those IDs.

### `/docs`
Project and developer documentation.

## Recommended future JavaScript modules

Once tests exist, `main.js` can be separated into:

```text
assets/js/
├── main.js
├── config/
│   ├── scoring.js
│   └── routes.js
├── core/
│   ├── assessment.js
│   ├── scoring-engine.js
│   └── insights.js
├── services/
│   ├── storage.js
│   ├── export.js
│   └── share-codes.js
├── ui/
│   ├── navigation.js
│   ├── results.js
│   ├── journey.js
│   ├── practice-hub.js
│   └── tour.js
└── utils/
    ├── dates.js
    └── formatting.js
```

Do this gradually rather than moving everything at once.

## Safe editing workflow

1. Create a backup or Git commit.
2. Run the app through a local server.
3. Change one feature at a time.
4. Test desktop and mobile navigation.
5. Complete a test assessment.
6. Refresh the page and confirm storage still works.
7. Open My Journey, Practice Hub, More, Settings and the guided tour.

## Deployment

This remains a static website and can be deployed to Netlify, GitHub Pages or another static host. The project root should be the publish directory.
