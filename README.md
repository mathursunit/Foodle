# FIHR Foodle v3.7.10

**Baseline:** v3.1 (2025-11-01)  
**Changes in v3.7.10:**
- Fixed grid initialization to prevent 1-column bug.
- Enforced hint rule: using a hint leaves **one** remaining guess.
- Switched to CSV word list: `assets/fihr_food_words_v1.4.csv` (word,hint).
- Added static bottom-right watermark: **Build v3.7.10**.
- Kept same color scheme, layout, font stack, and PWA setup.

## Run locally
Open `index.html` directly, or better, serve with a simple HTTP server for service worker to work:

```bash
python3 -m http.server 8080
# then visit http://localhost:8080
```

## CSV Format
- First row may be `word,hint` header.
- Only words with 5 letters are used as answers by default (tweak `GRID_COLS` in `scripts/grid.js`).

## PWA
- Manifest and icons provided; service worker caches core assets for offline use.
