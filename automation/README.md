# AA Weekly Birthday — automation template

Turns a week's birthday data into the branded **"Happy Birthday to our Athletes!"** graphic
(**1080×1350 PNG**), ready to post. Built to be driven by an automation: each week the data changes,
the renderer runs, a PNG comes out.

```
data JSON  ──▶  node automation/render.mjs  ──▶  1080×1350 PNG
```

## How it works (plain language)

The design is a fixed picture (`assets/bg-clean.png`) — the full Athletes Acceleration birthday graphic
with the **polaroid empty** and the **date strip empty**. The renderer drops the **week's date range** onto
the strip and the **list of athletes** onto the polaroid as real text, then takes a screenshot. Nothing is
"taped over" — the names and date are drawn straight onto the empty spots.

## Files

| File | What it is |
|------|------------|
| `assets/bg-clean.png` | The text-free background plate (1080×1350). The single image dependency. |
| `template.html` | The design: where the date and names sit, the font, the bullet styling. Open it in a browser to see the layout (it shows the sample data). |
| `render.mjs` | The renderer. Injects the week's data + font, drives system Chrome, writes the PNG. |
| `data.example.json` | The data shape, filled with the sample week. |

## Run it

```bash
# from the repo root
node automation/render.mjs --data automation/data.example.json --out out/birthday-week.png
# or pipe data on stdin:
cat week.json | node automation/render.mjs --out out/birthday-week.png
```

On success it prints one line of JSON and exits `0`:

```json
{"output":"…/out/birthday-week.png","count":3,"dateRange":"JUNE 8-14, 2026"}
```

Any failure exits **non-zero** (so a caller can tell it worked): `2` bad input · `3` missing background ·
`4` Chrome failed. Chrome is found at the Windows default, or set `CHROME_PATH` / pass `--chrome <path>`.

## The data contract

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

- **`dateRange`** — a ready-to-display string. The automation formats it (uppercase month, day-range, year).
  The template prints it verbatim; it does no date math.
- **`athletes[].name`** — proper case (e.g. `"Kendrick Murphy"`); the template renders it in small-caps.
- **`athletes[].date`** — `"M/D"` (no leading zero), shown as `(6/8)`. An ISO date like `"2014-06-08"` is
  also accepted and converted to `6/8` automatically.
- **Write strict JSON** — no BOM, no trailing commas (a BOM is tolerated, but keep it clean).

### Behavior the automation can rely on
- **Any count fits.** Font auto-shrinks by athlete count: ≤6 standard, 7–12 smaller, 13+ compact.
  Beyond ~18 it still renders but warns on stderr (names get cramped) — it never silently drops anyone.
- **0 athletes** → empty polaroid, no error. (Whether to post a no-birthday week is the automation's call.)
- **Bad/missing fields** → coerced safely (non-array athletes → empty list; missing name → skipped).

## Intended pipeline (PushPress → Kraken)

1. Kraken queries **PushPress** for members with a birthday in the target week.
2. Maps each to `{ name, date }` and builds the `dateRange` string → writes `week.json`.
3. `node automation/render.mjs --data week.json --out out/birthday-week.png` (Python: `subprocess.run`).
4. **Wait for the process to exit**, read the printed `{output}` path, then push that PNG to the
   approval / scheduling step. (The output file is overwritten each run — read it only after exit.)

```python
import subprocess, json
r = subprocess.run(
    ["node", "automation/render.mjs", "--data", "week.json", "--out", "out/birthday-week.png"],
    capture_output=True, text=True,
)
if r.returncode != 0:
    raise RuntimeError(r.stderr)
png_path = json.loads(r.stdout)["output"]
```

## Notes

- **Font:** the weekly text uses **Saira Condensed** (shipped in `fonts/`, embedded into the render so it
  works offline). It's a close match to the original Canva display face. If you send the exact Canva font
  name/file, swapping it is a one-line change in `render.mjs` (the `FONT_FACES` list) + `template.html`.
- **Updating the design:** if the background art changes, re-export the text-free version (empty polaroid +
  empty strip, 1080×1350 PNG) over `assets/bg-clean.png`, then re-check the date/name positions in
  `template.html` against it.
- **Raw Chrome command** (what `render.mjs` runs, for reference):
  `chrome --headless=new --window-size=1080,1350 --force-device-scale-factor=1 --screenshot=<out> <tempHtml>`
