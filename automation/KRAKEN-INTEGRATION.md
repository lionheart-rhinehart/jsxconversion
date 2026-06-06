# Kraken integration handoff — AA Weekly Birthday graphic

**For the person/agent building the automation inside the Kraken project.** This explains exactly how to
access, run, and feed the birthday-graphic generator, what it expects, what it returns, and the full weekly
sequence (PushPress → graphic → approval/schedule).

You do **not** need to understand the design code. You give it a small JSON of this week's birthdays; it
gives you back a finished **1080×1350 PNG**. That's the whole contract.

```
┌─ PushPress ─┐     ┌──────────── Kraken (you build this) ────────────┐
│ "who has a  │     │ 1. query birthdays this week                    │
│  birthday   │ ──▶ │ 2. build week.json  { dateRange, athletes[] }   │
│  this week" │     │ 3. node render.mjs --data week.json --out x.png │ ──▶ approval / schedule / post
└─────────────┘     │ 4. take the PNG it prints                       │
                    └─────────────────────────────────────────────────┘
                              ▲ the generator = the `automation/` folder (self-contained)
```

---

## 1. What the generator is, and where to get it

- It's a single self-contained folder named **`automation/`**, currently living in the
  **`jsxconversion`** repo (this is its source of truth; it was committed to `main`, commit `3783040`).
- It has **no dependency** on the jsxconversion project — everything it needs (design, background art,
  font) is inside the folder. It has been verified to run from a copy placed anywhere.

**Getting it into the Kraken project — pick whichever fits your setup:**
- **Copy the folder in** (simplest): drop the entire `automation/` folder somewhere in the Kraken project,
  e.g. `kraken/tools/birthday-generator/`.
- **Git** (keeps it updatable): `git subtree`/submodule the folder, or clone jsxconversion and reference
  `automation/`.

> ⚠️ Copy the **whole folder**, not just `template.html`. The HTML needs `assets/bg-clean.png` and
> `assets/fonts/` next to it, and `render.mjs` next to those.

Folder contents:
```
automation/
├─ render.mjs            ← the program you call
├─ template.html         ← the LOCKED design (never edit)
├─ data.example.json     ← the input shape
├─ assets/
│  ├─ bg-clean.png       ← background art
│  └─ fonts/             ← display font (bundled, offline)
├─ HANDOFF.md            ← short usage doc
└─ KRAKEN-INTEGRATION.md ← this file
```

---

## 2. Runtime requirements (confirm in the Kraken's environment)

The generator runs a **headless Google Chrome** under the hood (driven by Node). The machine/runtime that
executes step 3 needs:

- **Node.js 18+**
- **Google Chrome** installed and reachable. Default path tried:
  `C:\Program Files\Google\Chrome\Application\chrome.exe`. On Mac/Linux or a custom install, set the
  **`CHROME_PATH`** env var (or pass `--chrome "<path>"`).

**If the Kraken is serverless / a cloud function (no system Chrome):** you have three options —
1. Run this step on a small worker/VM that has Node + Chrome (recommended, least work).
2. Swap the Chrome call for a hosted headless-Chrome / Browserless endpoint (the renderer is one
   `child_process` call — easy to redirect).
3. Bundle `@sparticuz/chromium` + `puppeteer-core` into the function and point `CHROME_PATH` at it.

➜ **TO CONFIRM:** where will step 3 actually execute, and does it have Node + Chrome? This is the only open
infrastructure question.

---

## 3. The contract — how you call it

```bash
node render.mjs --data week.json --out birthday-week.png
# or pipe the JSON on stdin instead of --data:
cat week.json | node render.mjs --out birthday-week.png
```

**Output:** writes the PNG to `--out`, and prints **one JSON line to stdout** on success:
```json
{"output":"/abs/path/birthday-week.png","count":3,"dateRange":"JUNE 8-14, 2026"}
```

**Exit codes (always check this):**

| code | meaning | what to do |
|------|---------|-----------|
| `0` | success | read the `output` path, proceed |
| `2` | bad/missing/invalid-JSON input | fix the data you sent |
| `3` | background art missing | the folder is incomplete — re-copy it |
| `4` | Chrome failed / not found | check Node+Chrome / `CHROME_PATH` |

**Always wait for the process to exit before reading the PNG** (it's written once, at the end). The output
file is overwritten each run, so don't read it from a fixed path concurrently for two different weeks.

### Example callers

Node:
```js
import { execFileSync } from "node:child_process";
const out = execFileSync("node", ["render.mjs", "--data", "week.json", "--out", "birthday-week.png"]);
const { output } = JSON.parse(out.toString());   // throws if exit != 0
```

Python:
```python
import subprocess, json
r = subprocess.run(["node","render.mjs","--data","week.json","--out","birthday-week.png"],
                   capture_output=True, text=True, check=True)   # raises on non-zero exit
png_path = json.loads(r.stdout)["output"]
```

---

## 4. The data you build — the ONLY thing that changes each week

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

| field | type | rule |
|-------|------|------|
| `dateRange` | string | **You format this.** Uppercase month, day-range, year — e.g. `"JUNE 8-14, 2026"`. Printed verbatim; the generator does no date math. |
| `athletes[].name` | string | Proper case, e.g. `"Kendrick Murphy"`. Rendered in small-caps automatically. |
| `athletes[].date` | string | `"M/D"`, no leading zero (e.g. `6/8`). An ISO date `"2014-06-08"` is also accepted and auto-converted to `6/8`. |

- **Write strict JSON** — no trailing commas (a leading BOM is tolerated).
- Order of `athletes` = the order they appear in the graphic. Sort however you want (by date is natural).

---

## 5. Turning PushPress birthdays into that JSON

You'll query PushPress for members whose birthday falls in the target week, then map each to
`{ name, date }`. PushPress exposes a **customers/members API** (TypeScript SDK: `@pushpress/pushpress`;
platform docs under `api.pushpressdev.com/platform`). The mapping:

| from PushPress (confirm exact field names with your API token) | → JSON |
|---|---|
| `firstName` + `lastName` | `name` = `"First Last"` |
| birthday / date-of-birth field (e.g. `birthday`/`dob`, often ISO `YYYY-MM-DD`) | `date` = `"M/D"` (or pass the ISO string — the generator converts it) |
| (you compute) the Mon–Sun span of the target week | `dateRange` = `"MONTH D-D, YYYY"` |

➜ **TO CONFIRM with PushPress:** (a) the exact endpoint + auth for listing customers, (b) the exact
birthday field name and format, (c) whether you filter "birthday in this week" server-side or pull members
and filter by month/day yourself (DOB year is the birth year — match on **month + day only**, ignore year).
Once you've confirmed those, the rest is pure string-building into the JSON above.

---

## 6. The full weekly sequence

1. **Determine the target week** (e.g. next Mon–Sun) → build the `dateRange` display string.
2. **Query PushPress** for members with a birthday whose **month+day** falls in that window.
3. **Map** each member → `{ name, date }`; assemble `week.json` (strict JSON).
4. **Render:** `node render.mjs --data week.json --out birthday-week.png`. Check exit code; read the
   `output` path from stdout JSON.
5. **Hand the PNG to the next step** — your approval portal, or straight to scheduling/posting.
6. **If `count` is 0** (no birthdays that week): decide whether to skip posting. The generator still
   produces a valid (empty-list) graphic if you do want it.

---

## 7. Things it handles for you (so you don't have to)

- **Any number of athletes** — the list auto-shrinks to fit the polaroid (≤6 normal, 7–12 smaller, 13+
  compact). Beyond ~18 it still renders but prints a warning on **stderr** (names get cramped) — surface
  that warning if you see it; it never silently drops names.
- **0 athletes** → empty list, no crash.
- **Malformed/missing fields** → coerced safely (non-array athletes → empty; missing name → skipped). It
  will not hang or throw on bad data — but you should still send clean data.
- **The look is identical every week** — see §8.

---

## 8. The design is LOCKED — do not edit it

`template.html` holds the frozen design (the tilts, spacing, bullet geometry that runs parallel to the
polaroid edge, the background). **The automation must never edit `template.html`.** Your only input is the
data JSON. This is deliberate: it guarantees every week's graphic looks identical except for the names/date.

If the *design itself* ever needs to change (new art, different layout), that's a separate, one-time design
task back in the jsxconversion project — not part of the weekly automation. To refresh just the background
art: re-export the text-free 1080×1350 PNG over `assets/bg-clean.png` and re-check positions there.

---

## 9. Quick self-test (run once after install)

```bash
cd <wherever you put the automation folder>
node render.mjs --data data.example.json --out test.png
```
Open `test.png` — you should see the full birthday graphic with three sample names (Kendrick / Graham /
Derek) and "JUNE 8-14, 2026" on the strip. If that renders, the generator is wired correctly and the only
remaining work is the PushPress query + the approval/schedule step.

---

## 10. Implementer checklist

- [ ] `automation/` folder copied into the Kraken project (whole folder).
- [ ] Step-3 runtime confirmed to have **Node 18+** and **Chrome** (`CHROME_PATH` set if needed).
- [ ] Self-test (§9) renders `test.png` successfully.
- [ ] PushPress endpoint + auth + birthday field confirmed (§5).
- [ ] Week-window + `dateRange` formatting implemented.
- [ ] PushPress → `week.json` mapping implemented (match month+day, ignore birth year).
- [ ] Render call wired with exit-code handling (§3).
- [ ] PNG routed to the approval portal / scheduler.
- [ ] 0-birthday-week behavior decided.

---

### Provenance
- Source of truth: **`jsxconversion` repo, `automation/` folder**, `main` (commit `3783040`, 2026-06-05).
- Output spec: **1080×1350 PNG**, Athletes Acceleration "Happy Birthday to our Athletes!" weekly graphic.
- Companion docs in the folder: `HANDOFF.md` (short usage), `README.md`.
