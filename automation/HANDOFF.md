# HANDOFF — AA Weekly Birthday graphic generator

Drop this whole `automation/` folder into the automation project. It turns a week's birthday data into the
branded **1080×1350 PNG**. Self-contained — no dependency on the project it came from.

```
week's data (JSON)  ──▶  node render.mjs  ──▶  birthday-week.png  (1080×1350)
```

## 1. What to copy

Copy the **entire `automation/` folder**. It already contains everything it needs:

```
automation/
├─ render.mjs              ← the script you run
├─ template.html           ← the LOCKED design (do not edit)
├─ data.example.json       ← the data shape
├─ assets/
│  ├─ bg-clean.png         ← the background art
│  └─ fonts/               ← the display font (bundled, works offline)
└─ HANDOFF.md / README.md
```

## 2. Prerequisites

- **Node.js 18+**
- **Google Chrome** installed (the script screenshots with headless Chrome).
  - Default path used: `C:\Program Files\Google\Chrome\Application\chrome.exe`.
  - Override with the `CHROME_PATH` env var or `--chrome "<path>"` if Chrome lives elsewhere (Mac/Linux).

## 3. Run it

```bash
node render.mjs --data week.json --out birthday-week.png
# or pipe the data on stdin:
cat week.json | node render.mjs --out birthday-week.png
```

On success it prints one JSON line and exits `0`:

```json
{"output":".../birthday-week.png","count":3,"dateRange":"JUNE 8-14, 2026"}
```

Failure exits **non-zero** so your automation can detect it:
`2` bad/missing data · `3` background missing · `4` Chrome failed.

### Calling it from Python

```python
import subprocess, json

subprocess.run(["node", "render.mjs", "--data", "week.json", "--out", "birthday-week.png"],
               check=True, capture_output=True, text=True)  # raises if exit != 0
# then read birthday-week.png and send it to the approval/scheduling step
```

> **Wait for the process to exit before reading the PNG** — it's written once at the end.

## 4. The data — the ONLY thing that changes each week

```json
{
  "dateRange": "JUNE 8-14, 2026",
  "athletes": [
    { "name": "Kendrick Murphy",  "date": "6/8" },
    { "name": "Graham Wilkerson", "date": "6/12" },
    { "name": "Derek B",          "date": "6/12" }
  ]
}
```

- **`dateRange`** — the finished string to show (you format it: uppercase month, day-range, year).
- **`name`** — proper case (e.g. `"Kendrick Murphy"`); it's rendered in small-caps automatically.
- **`date`** — `"M/D"` (no leading zero). An ISO date like `"2014-06-08"` is also accepted → converted to `6/8`.
- **Write strict JSON** — no trailing commas. (A leading BOM is tolerated.)

What it handles for you:
- **Any number of athletes** — the font auto-shrinks to fit (≤6 normal, 7–12 smaller, 13+ compact). Past
  ~18 it still renders but warns on stderr.
- **0 athletes** → empty list, no error (your automation decides whether to post a no-birthday week).
- **Bad/missing fields** → skipped safely; never crashes or hangs.

## 5. What's LOCKED vs editable (important)

Think of `template.html` as a printed form. The **design is permanent ink** — the tilt of the date, the
slanted bullet column (parallel to the polaroid edge, every bullet the same distance from it), spacing, the
background. That lives in `template.html`'s CSS and the automation **never touches it**.

The **only blanks you fill** are `dateRange` and the `athletes` list, passed as data. So the look can't
drift week to week — there's no path where the automation changes the geometry.

**➜ Do not edit `template.html`.** If the *design* ever needs to change, that's a deliberate one-time edit
(and re-calibration against the original), not part of the weekly run.

## 6. Test it works (after copying)

```bash
node render.mjs --data data.example.json --out test.png
```

Open `test.png` — you should see the full birthday graphic with the three sample names. If you see that,
the automation can drive it.

---

### Notes
- **Font:** Saira Condensed (bundled in `assets/fonts/`, embedded into each render so it works offline). It's
  a close match to the original Canva display face; if you have the exact font, it's a one-line swap in
  `render.mjs` (`FONT_FACES`).
- **Updating the background art:** re-export the text-free version (empty polaroid + empty strip, 1080×1350
  PNG) over `assets/bg-clean.png`, then re-check the date/name positions in `template.html`.
- **Raw Chrome command** (what `render.mjs` runs, for reference):
  `chrome --headless=new --window-size=1080,1350 --force-device-scale-factor=1 --screenshot=<out> <tempHtml>`
