# PickleRate

A browser-based pickleball self-assessment with an explainable three-pillar rating model.

## Main sections

- **Home** — product introduction and assessment overview
- **Assessment** — optional tester profile and 43-question evaluation
- **My Journey** — saved assessment cards and full historical reports
- **Insights** — rating trends, strengths, priorities and skill changes
- **About** — methodology, confidence scoring and roadmap

Navigation uses browser history, so Back and Forward move smoothly between app sections. Completed assessments remain immutable snapshots in browser localStorage and can be exported as CSV or JSON.

## Run locally

Do not open `index.html` directly because the browser must load `questions.json`.

From this folder run:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## Storage

Assessment progress and history are stored locally in the current browser. Clearing browser storage removes saved data. Export history before clearing it.
