# FIHR Foodle v3.7.11

**Fixes from v3.7.10**  
- Removed ES module imports; everything in `scripts/main.js` (non‑module).  
- Clear error text if CSV fails to load when opened via `file://`.

**Still included**  
- Grid init fix (no 1‑column bug)  
- Hint rule: "use a hint → only 1 guess left"  
- CSV word list: `assets/fihr_food_words_v1.4.csv`  
- Static watermark ("Build v3.7.11")  
- Same color scheme, layout, fonts, and PWA

## Local run
To avoid CSV fetch restrictions and enable SW:
```bash
python3 -m http.server 8080
# Visit http://localhost:8080
```
