# PickleRate Website

A standalone static website built around the three-pillar PickleRate model:

- Technical Ability: 70%
- Tactical Intelligence: 20%
- Competitive Validation: 10%

## Run locally

Browsers may block loading `questions.json` when opening `index.html` directly. Run the folder through a small local server:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

You can also deploy the folder directly to GitHub Pages, Netlify, Vercel or another static host.

## Main features

- 43-question assessment
- Saved progress using localStorage
- One-question-at-a-time interface
- Technical, tactical and competitive pillar scoring
- Evidence-type trust weighting
- Cross-question agreement and confidence score
- Skill-level breakdown
- Strength and improvement insights
- Downloadable text results
- Responsive desktop/mobile layout

## Important calibration note

The weights and confidence rules are a strong first model, not a validated rating standard. Update thresholds and mappings after collecting results from players with reliable external ratings.
