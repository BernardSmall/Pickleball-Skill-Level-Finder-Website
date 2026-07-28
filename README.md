# PickleRate Professional Prototype

A static browser-based PickleRate application with:

- Professional Home and product story
- Full 43-question assessment
- Tester/calibration profile
- Rich results dashboard and strength radar
- Frozen historical reports in My Journey
- Assessment comparisons, timeline and achievements
- Long-term deterministic insights
- Skill library and individual skill pages
- Directional benchmarks and recommended drills
- Expanded About, methodology and FAQ
- CSV/JSON history export

## Run locally

From this folder:

```bash
python -m http.server 8000
```

Open `http://localhost:8000`.

## Storage

Assessment progress and completed reports are stored in browser `localStorage`. They remain on the same browser/device until cleared. This prototype does not yet include accounts or cloud synchronisation.
