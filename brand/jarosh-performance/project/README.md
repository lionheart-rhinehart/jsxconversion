# Jarosh Performance. Design System

> **Speed · Agility · Strength · Power.** Not just a speed program.

Jarosh Performance is a youth / high-school / collegiate **sports-performance training** facility in **Ankeny, Iowa**, founded and led by **Nick Jarosh** (formerly "Nick Jarosh Fitness / NJF"). Nick is an Ankeny native with 15+ years in the field, including strength & conditioning work with professional (Cincinnati Reds) and college athletics. The business trains area athletes in small groups with personal coaching, measurable testing, and a data-driven progression model — "helping area athletes gain that competitive edge."

The brand's defining program is **SUPERCHARGED**, an elite acceleration & speed-training system ("turn one step behind into two steps ahead"). The mission, in their words, is to *"ignite expansive physical potential and resilient mental fortitude within the next generation's promising athletic talents through a bold training methodology rooted in scientific progression and demonstrated measurable outcomes."*

This design system gives that brand a **premium, technical, data-forward identity** — a performance lab, not a gritty corner gym. The look is built on precise measurement language: telemetry readouts, calibration grids, tabular metrics, and a single high-signal **red** against cool carbon neutrals.

---

## Sources

- **Public profile (web search):** Facebook (`/nickjaroshfitness`), event listings, and review aggregators. Pulled the tagline ("Speed ~ Agility ~ Strength ~ Power"), location (405 SE Magazine Rd, Suite #104, Ankeny, IA 50021), founder bio, the SUPERCHARGED program, the `#notjustaspeedprogram` hashtag, and the data/measurement emphasis that runs through their testimonials. Site referenced as `jaroshperformance.fitness`; Linktree `linktr.ee/jaroshperformance`. Phone (515) 371-5881.
- **Sibling system (linked project):** an "Athletes Acceleration" sports-performance design system supplied the **token architecture**, the **font files** (Anton / Geist / JetBrains Mono — all open-source), and the UI-kit component patterns this kit adapts. Jarosh's visual direction (red + lab/telemetry) is **distinct** from that system's black/white/red gritty-stadium look.

> ⚠️ **No official Jarosh logo, website code, Figma, or brand photography was provided.** The brand color — signal red **`#fa3f36`** — was specified by the user. The logo here is a **flagged placeholder** (`assets/logo-mark.svg`). The marketing copy, programs, and metrics are **plausible reconstructions** in the brand's voice, not verbatim site copy. Iterate freely as real assets arrive.

### What's missing / needs the user

- **Official logo** (SVG preferred). Current mark is a placeholder.
- **Exact brand hex** values (red + any secondary). Current red is `#FA3F36`.
- **Real athlete photography** — the user opted to supply Jarosh's own photos. Every image area in the kits is a **drop-in slot or a technical placeholder**, never stock.
- **Real program names, pricing, schedule, staff, testimonials.**

---

## Index. What's in this folder

| Path | Purpose |
|---|---|
| `README.md` | This file. Brand context, content fundamentals, visual foundations, iconography. |
| `SKILL.md` | Skill manifest so other agents (and Claude Code) can invoke this kit. |
| `colors_and_type.css` | All color & type tokens (`--jp-red`, `--fg-1`, grid hairlines, etc.) + semantic rules for `h1`–`p`, `.jp-display`, `.jp-eyebrow`, `.jp-tag`, `.jp-data`. **Import this first in every artifact.** |
| `fonts/` | Anton, Geist (variable), JetBrains Mono (variable). Served locally. |
| `assets/` | `logo-mark.svg` (placeholder brand mark). Drop real photography / logo here. |
| `preview/` | One HTML file per design-system card (rendered in the Design System tab). |
| `ui_kits/marketing-site/` | High-fidelity marketing site (home, programs, results, booking) + `hero-directions.html` showing 3 hero treatments. |
| `ui_kits/social-ads/` | Instagram ad templates (square, portrait, story) in the brand system. |
| `ui_kits/parent-dashboard/` | Parent-facing athlete progress report / telemetry dashboard. |
| `slides/` | Deck template — title, pillars, big-stat, results, quote, closer. |

---

## CONTENT FUNDAMENTALS

The voice is **a performance coach who lives in the data.** Confident, precise, parent-facing, never hype-y. Where the broader sports-performance category shouts, Jarosh **measures**. Every claim is anchored to a number or a test.

### Voice & tone

- **Second person, addressed to the parent — about the athlete.** "We baseline your athlete on day one." "Your daughter's 10-yard split drops because we rebuilt her first three steps."
- **Plural-first-person for the brand.** Always "We test… we build… we retest." Never "I." Nick is the founder, but the system speaks as a team/lab.
- **Measurement is the through-line.** Lead with the metric, then the meaning. "−0.18s on the 10-yard. That's the difference between second and first to the ball."
- **Calm authority, not intensity for its own sake.** "Not just a speed program." We earn the claim with data rather than volume.
- **Declarative, lean.** Short sentences. Occasional fragments. Numbers do the bragging.

### Casing

- **Display headlines: ALL CAPS, condensed** (Anton). `FASTER ISN'T A GUESS. IT'S A MEASUREMENT.`
- **Section titles: Title Case** with select words colored red. `Every Rep Is A Data Point.`
- **Pillar names: ALL CAPS** in the display face — the four pillars: `SPEED · AGILITY · STRENGTH · POWER`.
- **Buttons: Title Case.** `Book An Assessment`, `See The Data`, `Start Your Baseline`.
- **Eyebrows / kickers: small-cap mono**, two flavors — bracket-tag `[ SPEED.LAB ]` or label `MEASURED PROGRESS`. Red or muted steel.

### Tropes that recur

- **Bracket / readout eyebrows.** `[ THE BASELINE ]`, `[ SUPERCHARGED ]`, `[ RESULTS ]`. Signals the instrument-panel side of the brand.
- **Metric-first callouts.** `−0.18s`, `+3.5"`, `1.42s`, `10/20/40`, `90 DAYS`. Always mono, always tabular, unit set smaller and muted.
- **Two-line headlines with split color.** One phrase ink, one phrase red. `Measured. Built. **Proven.**`
- **The four pillars.** Speed, Agility, Strength, Power — often shown as a numbered/measured row, sometimes with a fifth implied: the data that ties them together.
- **"Not just a speed program."** The brand's signature counter-positioning line. Use it; don't over-use it.
- **Test → train → retest.** The measurement loop framing recurs in the method, the guarantee, and the dashboard.

### Things to avoid

- **No emoji** in product or marketing chrome. (Their social uses an occasional 🧡 / 😉; keep that to organic social captions only, never UI.)
- **No exclamation-point hype.** The brand projects measured confidence. One in a social caption is fine; none in the product.
- **No "passion / journey / we love what we do" filler.** Replace with a number or a test.
- **No fear-mongering.** "The competition isn't resting" framing is fine as urgency; don't go dystopian.
- **Don't bury the metric.** If a section makes a performance claim, a number should be visible.

### Example copy patterns

- Eyebrow → headline → support:
  > `[ THE BASELINE ]`
  > **YOU CAN'T IMPROVE WHAT YOU DON'T MEASURE.**
  > Day one, every athlete runs a full workup — 10/20/40 splits, vertical, broad jump, and a movement screen. No guessing. That number is the starting line. Everything after is progress you can see.

- Stat row (the four pillars, measured):
  > **−0.18s** 10-yd split · **+3.5"** vertical · **+22%** force output · **90 days** retest cycle

- CTA:
  > **Book An Assessment** →   /   **See The Data** →

---

## VISUAL FOUNDATIONS

The system is **instrumented, condensed, and confident.** Think performance-science lab: fine grids, calibration ticks, telemetry readouts, and one decisive red. The display face carries the emotion; mono carries the proof; everything else gets out of the way.

### Color
- **Signal red (`--jp-red`, `#fa3f36`)** is the one high-energy color, used **surgically**: primary CTAs, the active data point, the leading edge of a chart, the accent word in a headline, the calibration tick in the logo. **Never** as a full-bleed wash; **never** on body copy.
- **Cool carbon neutrals (`--jp-ink-950 … 700`)** are the workhorse for dark surfaces and type. Hero, pillar, and data panels sit on near-black `--jp-ink-950`. These are cool/blue-leaning blacks — the lab, not the locker room.
- **Steel (`--jp-steel`, `#9aa5b4`)** is the instrument-metal accent: hairlines, axis/tick labels, badge edges, the muted chevron in the logo. It does the "technical" work the red shouldn't.
- **White / off-white (`--bg-1`, `--bg-2`)** is the editorial canvas. Light sections alternate with near-black data sections.
- **Gain green (`--jp-gain`, `#19c37d`)** appears **only on measured improvement** — up-arrows, "+" deltas, PR markers, dashboard trend lines. It is data, not decoration.
- **Imagery color vibe (when the user supplies photos):** **cool, crisp, controlled light** — desaturated slightly, neutral-to-cool white balance, clean facility backdrops. A subtle red can be pushed into highlights for cohesion. **Never warm/sepia, never grungy.** This is a lab, so imagery should feel measured and sharp, not gritty.

### Type
- **Display:** Anton. ALL-CAPS, line-height **0.84–0.9**, tracking slightly negative. Headlines span 2–3 lines, breaking on the emphasis word.
- **Body:** Geist, 16–18px, line-height 1.5–1.6. Technical but warm enough to read long.
- **Mono:** JetBrains Mono. Eyebrows, bracket tags, axis labels, and **every metric**. Numbers always tabular (`font-variant-numeric: tabular-nums`), units set smaller + muted.
- **Two-tone display word.** Color one or two words `--jp-red-600` inside a headline.
- **Outlined display word.** Big numerals (`01`, `40`, `90`) set with `color: transparent; -webkit-text-stroke` for a calibrated-signage look.

### Spacing & rhythm
- **8pt base** with a tight low-end (4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96 / 128). `--s-9` (96px) between major sections, `--s-7` (48px) within.
- **Wide hero gutters.** Display headlines run ~90% of viewport width and tap the page edges.

### Backgrounds
- **Three modes, alternated:** (1) **solid white** editorial canvas; (2) **near-black data section** (`--jp-ink-950`) for pillars, the method loop, guarantee, and any telemetry; (3) **photo section** (user-supplied) with a bottom-up protection gradient.
- **The calibration grid** is the signature texture: a faint 1px grid or ruler-tick baseline (`--grid-light` / `--grid-dark`) on dark data panels. Subtle — it should read as graph paper at the edge of perception, never as a loud pattern.
- **No gradients-as-decoration, no noise, no hand-drawn flourishes.** The only gradient is the photo protection gradient and an occasional faint red radial glow behind a hero stat.

### Borders & dividers
- **1px solid `--border-1`** on light; **1px solid `--jp-ink-700`** on dark.
- **Steel hairlines** for axis lines, tick marks, and table rules — the lab grammar.
- **2px red top-rule** marks a "measured" block (a stat or method step). Used deliberately, not scattered as a generic left-border accent.

### Corner radii
- Buttons: **`--r-md` (4px)**. Squared, precise.
- Cards / panels: **`--r-lg` (8px)**.
- Pills / chips / status dots: **`--r-pill`** — only for filter chips, status badges, and live indicators.
- **Never** stack a 20px+ radius. This brand is an instrument, not a friendly app.

### Shadows & elevation
- Cards sit on **`--shadow-2`**, lift to **`--shadow-3`** on hover.
- **Red glow** (`--shadow-red`) only on the primary CTA, only on hover.
- Dark data panels are mostly **flat** with a faint top inner-highlight (`--inner-1`) — instruments sit in the surface, they don't float.

### Hover & press
- **Buttons:** `translateY(-1px)` + shadow lift; primary CTA shifts `--jp-red-500 → --jp-red-600` and gains the red glow.
- **Links:** `--jp-red-700 → --jp-red-800`, underline appears via `text-decoration-thickness: 2px`.
- **Cards / data tiles:** lift via shadow + border goes steel→red. **No scale, no rotation.**
- **Press:** quick `translateY(0) scale(0.99)` + slightly darker fill, < 100ms.
- **Live data point:** a small pulsing red dot (2.4s ease-in-out) marks "currently measuring / live."

### Motion
- **Quick and calibrated:** 120 / 200 / 360ms.
- **Easing:** `--ease-out` `cubic-bezier(0.2,0.7,0.2,1)` for entrances; `--ease-snap` for state changes. **No bounce / overshoot — instruments don't wobble.**
- **Reveal pattern:** numbers count up to their value on scroll; headlines fade up 12–16px, staggered. Chart lines draw left-to-right; bars grow from baseline.
- **Reduced-motion:** all counts/draws resolve to final state instantly.

### Transparency & blur
- **Header bar:** `backdrop-filter: blur(16px)` over `rgba(255,255,255,0.88)` once scrolled.
- **Photo protection gradient:** `rgba(10,12,15,0.65) → transparent` over the bottom ~60%.
- **No frosted card surfaces** on the editorial canvas — reserved for the header and overlays.

### Cards
- **Light card:** `background: var(--bg-1); border: 1px solid var(--border-1); border-radius: var(--r-lg); box-shadow: var(--shadow-2); padding: var(--s-6);`
- **Data / pillar panel (dark):** `background: var(--jp-ink-900); color: #fff; border: 1px solid var(--jp-ink-700);` often with a faint calibration grid, a steel axis label top-left, and a large outlined numeral.
- **Metric tile:** mono value (tabular) + smaller muted unit + steel label + optional gain-green delta and sparkline. The atomic unit of the whole system.

### Layout rules
- **Sticky top nav** (blur), max-width container **1280px**, **24px** gutters.
- **12-column grid** on the editorial canvas.
- Hero / data / photo sections **snap to viewport edges**; editorial content centers at 1280px.
- **The CTA sits bottom-left** of a photo/data hero (paired with a metric readout), not centered.

---

## ICONOGRAPHY

**Icon system: [Material Symbols Rounded](https://fonts.google.com/icons)** — loaded from Google Fonts. Chosen for its clean, technical, single-weight geometry that matches the instrument-panel feel. (Inherited from the sibling sports-performance system for consistency; swap if the real brand adopts a different set.)

### Loading

```html
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,300..700,0..1,-50..200" />
```

```html
<span class="material-symbols-rounded">sprint</span>
```

### Usage guidelines

- **Size:** match the cap-height of adjacent text; inline icons inherit `font-size`.
- **Weight:** 400 default; 500–600 for emphasis (CTAs, nav, active states).
- **Fill:** outline (`FILL 0`) for navigation/inline; **filled** (`FILL 1`) for active states and stat-block markers.
- **Color:** inherit text color. **Red** only when the icon does semantic brand work (active pillar, the guarantee check, the "live" marker). **Gain-green** only on improvement icons (`trending_up`, `arrow_upward`).

### The canonical icon vocabulary

| Use case | Icon |
|---|---|
| Speed pillar | `sprint`, `speed` |
| Agility pillar | `directions_run`, `shuffle` |
| Strength pillar | `fitness_center` |
| Power pillar | `bolt` |
| The baseline / assessment | `timer`, `straighten`, `monitoring` |
| Data / telemetry | `query_stats`, `analytics`, `show_chart` |
| Gain / PR / improvement | `trending_up`, `arrow_upward` |
| Guarantee / verified | `verified`, `task_alt` |
| Location | `location_on` |
| Scheduling / booking | `event`, `calendar_month` |
| Navigation | `arrow_forward`, `chevron_right`, `expand_more`, `menu` |
| Testimonial rating | `star` |

### What we do NOT use

- **No emoji** in UI or marketing chrome.
- **No illustration set** — the brand is photographic + instrumented. If a custom mark is needed (a certification seal, a founders badge), draw a single-weight flat SVG in `--jp-red` on steel.
- **No "hand-drawn" / sketch icons.** Off-brand.

### The logo

`assets/logo-mark.svg` — **placeholder** brand mark: two forward chevrons (speed) over a calibration ruler (measurement), red + steel, transparent background. Works on light and dark; scales down to ~32px. The full lockup pairs this mark with an Anton wordmark (`JAROSH` / `PERFORMANCE`) composed in CSS — see any kit's nav. **Replace with the official logo when provided.**

---

## Where to go next

1. **Drop the real logo** into `assets/` (SVG) and update the nav lockups.
2. **Confirm the exact red** (and any secondary brand color).
3. **Add Jarosh's own photography** — every image slot in the kits is ready to receive it.
4. **Swap in real program names, schedule, pricing, staff, and testimonials.**
