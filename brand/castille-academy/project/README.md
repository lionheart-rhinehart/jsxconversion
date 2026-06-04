# Castille Academy · Design System

> **The making of an athlete.**
> *Disciplina · Vis · Victoria*

**Castille Academy** is a premium youth athletic-development academy (ages ~8–18) — "the prep school of performance." Where a typical sports-performance gym sells intensity, Castille sells a **curriculum and a standard**: every athlete is assessed, given a personalized development block across three disciplines — **Velocity, Force, Craft** — and re-measured every block against one ownable number, **the Castille Index** (0–100). The voice is composed, exacting and aspirational; the look is bold and high-contrast — **black, white, and a single disciplined red** — set in Caslon.

This is a **new, standalone brand** built from the brand's color palette and a library of real athletic-training imagery and clips. It deliberately does **not** reuse the Athletes Acceleration / Genesis Sports Performance identity those raw assets originated from.

---

## Brand palette (provided)

| Token | Hex | Role |
|---|---|---|
| **Black** | `#000000` | Grounds, ink, hero/footer fields |
| **White** | `#ffffff` | Canvas |
| **Red** | `#a81918` | The single accent — CTAs, accent words, the Index, active states |

Everything else is a **neutral graphite** derived from black. There is **no second accent color** — discipline is the point.

---

## ⚠️ Caveats & substitutions (please read)

- **Photography carries legacy watermarks.** The ~19 photos and 6 clips were shot in an Athletes Acceleration / Genesis facility and carry a small "AA" triangle watermark (usually bottom-center) and some athletes wear Genesis tees. The `.ca-photo` **black-&-white + bottom protection-gradient** treatment hides nearly all of it (and B&W is also what makes the red pop), but **for production these should be reshot or replaced** with clean Castille imagery.
- **Fonts load from Google Fonts CDN** — Libre Caslon Display, Libre Caslon Text, Saira Condensed, Hanken Grotesk. For offline/production, self-host the `.woff2` files and swap the `@import` in `colors_and_type.css`.
- **Logo is a typographic placeholder.** The wordmark (Caslon "Castille" + letterspaced "ACADEMY") and the "C" monogram crest are built from type + CSS, not a real logo file. **A proper crest/mark should be commissioned.**
- **Icons are Lucide (a chosen substitution).** No icon set was specified; Lucide (1.75 stroke) suits the bold, modern aesthetic. Swap if you have a house set.
- **Index, programs, motto and testimonials are invented** brand scaffolding (plausible, on-brand example content), not real Castille facts. Replace with real copy.

---

## Sources

- **Brand palette:** provided screenshot — black `#000000`, white `#ffffff`, red `#a81918`.
- **Raw imagery & clips:** `assets/` (photos) and `assets/clips/` (MP4 + JPG posters), curated from a ~60-image / ~29-clip athletic-training library. Documentary-style: hard top-down warehouse light, gym interiors, athletes 8–18.
- **Testimonial structure:** adapted from real parent/athlete reviews (genericized).
- **No Figma file or codebase exists** for Castille Academy yet — greenfield brand. Add a Figma link here if/when one is created.

---

## CONTENT FUNDAMENTALS

The voice is **a director of athletic development speaking to a discerning parent.** Composed, precise, quietly confident. Training is a craft with a curriculum and a standard — never hype, never tough-guy theatrics.

### Voice & tone
- **Measured, not loud.** "We develop athletes the way a conservatory develops musicians." Authority through precision, not volume.
- **Evidence over adjectives.** Every claim anchored to a measurement — the Castille Index, a 10-yard split, a vertical. "Her Index went from 61 to 79 in two blocks."
- **Respectful second person.** "Your athlete." Parents and athletes as partners, not customers to be pushed.
- **Brand as plural-first-person.** "We assess. We build. We re-measure." Never "I".
- **A touch of the classical.** A Latin creed (*Disciplina · Vis · Victoria*), "Est. MMXXIV", "campus" not "location" — heritage cues used sparingly.

### Casing
- **Display headlines: Title Case in Caslon serif** — *never* all-caps. The restraint separates Castille from a shouting gym brand. `The Making of an Athlete.`
- **Eyebrows / kickers: ALL CAPS condensed, letterspaced 0.22em, red.** `THE CASTILLE METHOD`.
- **Pillar / discipline names: ALL CAPS condensed.** `VELOCITY · FORCE · CRAFT`.
- **Buttons: ALL CAPS condensed**, letterspaced 0.09em. `BOOK ASSESSMENT`.
- **Body & UI: sentence case** in Hanken Grotesk.

### Recurring devices
- **The Castille Index.** A 0–100 composite, shown as a **red ring** with a three-bar Velocity/Force/Craft breakdown. The single most important brand object — site, dashboard, app.
- **The creed.** *Disciplina · Vis · Victoria*, set in Caslon with red/black dividers.
- **Two-tone headlines.** One accent word per Caslon headline in red: `The Making of an `**`Athlete.`**
- **Numbered disciplines.** `01 / 02 / 03`, two-digit, outlined in the display face on black pillar cards.

### Things to avoid
- **No emoji. No exclamation points.** Calm authority.
- **No all-caps Caslon headlines** (a different, louder brand). Caslon stays Title Case.
- **No "journey / passion / family" filler.** Replace with a measurement or a standard.
- **No second accent color.** Red carries all emphasis; everything else is neutral.
- **No "you guys."** It's "your athlete", "your daughter", "your son".

### Example patterns
> `THE TRUTH ABOUT DEVELOPMENT`
> **Talent Is a Starting Line, Not a Plan.**
> Most young athletes never get measured, so they never get developed. We baseline every athlete across speed, power and craft — then build the block that moves the number.

> Stat trio: **+12 pts** Avg. Index gain · **1,400+** Athletes developed · **4** Campuses

> CTA: **Book Your Assessment** →

---

## VISUAL FOUNDATIONS

**Bold, high-contrast, photographic.** The Caslon serif carries gravitas; condensed Saira carries the athletic data; black & white photography lets the red do all the talking.

### Color
- **Black (`#000000`, `--ca-ink-950`)** grounds hero, footer and pillar fields, and carries body ink (`--ca-ink-900` `#0d0d0d` for text, slightly off true-black so it isn't harsh on white).
- **White (`#ffffff`)** is the canvas. Sections alternate pure white with off-white (`--ca-paper-100` `#f6f6f6`).
- **Red (`#a81918`, `--ca-red-600`)** is the *only* accent — CTAs, the accent word in a headline, active states, eyebrows, the Index ring. On **dark grounds it brightens to `--ca-red-500` `#c01f1c`** so it stays legible; on white it sits at 600, with `700` for red text. Never a full-bleed red background, never on body copy.
- **Neutrals** are a pure graphite ramp (`--ca-ink-*`) with no blue/warm cast.
- **Imagery vibe:** **black & white**, contrast ~+6%, with a black bottom protection gradient. The grayscale is what makes the red read as the brand signal. Never colored, never sepia.

### Type
- **Display:** Libre Caslon Display. Title Case, line-height ~1.0, tracking slightly negative. One red accent word per headline.
- **Athletic:** Saira Condensed (500–800). Uppercase, letterspaced — eyebrows, labels, nav, buttons, and all **stats/Index numerals** (tabular).
- **Body / UI:** Hanken Grotesk, 15–18px, line-height 1.6.
- **Lede / quotes:** Libre Caslon Text, often italic.
- **Outline display word:** `color: transparent; -webkit-text-stroke` for the `01/02/03` numerals.

### Spacing & rhythm
- 8pt base, tight low-end (4/8/12/16/24/32/48/64/96/128). `--s-9` (96) between major sections, `--s-7` (48) between blocks.
- Editorial content centers in a **1200px** max-width container; hero / photo sections run full-bleed.

### Backgrounds
- **Full-bleed B&W photography** for hero, pillar and CTA sections, with a bottom-up black protection gradient.
- **Solid white** for the editorial canvas; **true black** (`--ca-ink-950`) for stat strips, footers and the Index panel.
- **No textures, no patterns, no gradients-as-decoration.** Photographic + typographic only.

### Borders & dividers
- 1px `--border-1` (`--ca-ink-200`) on light; 1px `--ca-ink-700` on black.
- **Hairline red** (`--hairline-red`) only on the active program item / crest devices — never scattered as a left-accent on generic cards (slop).

### Corner radii
- Buttons **4px**, cards **8px**, chips/pills **999px**. Never stack a 24px+ radius — bold, not bubbly-app.

### Shadows & elevation
- Cards rest on `--shadow-2`, lift to `--shadow-3` on hover. `--shadow-red` (red glow) only on the primary CTA on hover. Inset top-edge highlight (`--inner-1`) on dark surfaces.

### Hover & press
- **Buttons:** `translateY(-1px)` + shadow / red-glow lift; primary shifts `red-600 → red-700`.
- **Links:** `red-600 → red-700`, underline thickens.
- **Cards:** shadow lift only — no scale, no rotation.
- **Press:** `translateY(0) scale(.99)` + slightly darker fill, < 100ms.

### Motion
- Refined and unhurried: **160 / 280 / 520ms**. Entrances `--ease-out` `cubic-bezier(.22,.61,.36,1)`; state changes `--ease-inout`. **No bounce.** Headlines fade-rise 16px, staggered ~40ms.

### Transparency & blur
- **Header:** `backdrop-filter: blur(16px)` over `rgba(0,0,0,0.9)` once scrolled (frosted black).
- **Hero protection gradient:** black bottom-up, plus a left-side scrim for left-aligned headlines.
- No frosted card surfaces on the editorial canvas — header + overlays only.

### Cards
- **Light card:** `background:#fff; border:1px solid var(--border-1); border-radius:8px; box-shadow:var(--shadow-2); padding:var(--s-6)`.
- **Pillar card (dark):** black/`--ca-ink-900`, 1px `--ca-ink-700` border, large outlined `01/02/03` numeral, red icon.
- **Photo card:** B&W full-bleed image + bottom gradient + condensed label bottom-left.

### Layout rules
- Sticky top nav, 1200px max container, 12-column grid with 24px gutters.
- Hero/pillar sections snap to viewport edges; the primary CTA lives bottom-left of a left-scrimmed photo hero.

---

## ICONOGRAPHY

**Icon system: [Lucide](https://lucide.dev).** Chosen for a brand-new identity — clean, consistent, 1.75 stroke weight (flagged as a substitution; swap if a house set is later defined).

### Loading
```html
<script src="https://unpkg.com/lucide@latest"></script>
<script>lucide.createIcons();</script>
```
```html
<i data-lucide="trending-up"></i>
```

### Usage
- **Size** to cap-height of adjacent text; **stroke 1.75**.
- **Color** inherits text color. **Red** only when the icon does semantic work (active pillar, Index trend, certified mark).
- **No fills** except `star` (ratings).

### Canonical vocabulary
| Use | Icon |
|---|---|
| Velocity pillar | `zap` |
| Force pillar | `dumbbell` |
| Craft pillar | `target` |
| Castille Index / gains | `trending-up`, `activity` |
| Timed testing | `stopwatch` |
| Certified / guarantee | `shield-check`, `medal` |
| Campus / locations | `map-pin` |
| Booking | `calendar` |
| Group / ratio | `users` |
| Varsity / college prep | `graduation-cap` |
| Clip / video | `play` |
| Rating | `star` |
| Navigation | `arrow-right`, `chevron-right` |

### Not used
- **No emoji, anywhere.** **No hand-drawn / sketch icons.** A custom mark (crest, seal) should be flat, single-layer, in black or red.

### Logo
- No raster logo yet. Current lockup is **typographic** (see `preview/brand-logo.html`): Caslon "Castille" over letterspaced "ACADEMY" with a red hairline, plus a "C" monogram crest. Commission a real crest and add it to `assets/`.

---

## Index · what's in this folder

| Path | Purpose |
|---|---|
| `README.md` | This file — brand context, content fundamentals, visual foundations, iconography. |
| `SKILL.md` | Skill manifest so agents / Claude Code can invoke this kit. |
| `colors_and_type.css` | All color + type tokens (`--ca-ink-*`, `--ca-red-*`, `--ca-paper-*`, `--fg-1`…) and semantic rules (`.ca-display`, `.ca-eyebrow`, `.ca-data`, `.ca-photo`, …). |
| `assets/` | Photography (`photo-*.jpg`, `hero-*.jpg`) and `assets/clips/` (MP4 + `posters/`). |
| `preview/` | 26 design-system cards rendered in the Design System tab. |
| `ui_kits/marketing-site/` | Marketing website — homepage, programs, campuses, booking modal. |
| `ui_kits/dashboard/` | Parent/athlete portal — Index dashboard, schedule, progress. |
| `ui_kits/mobile-app/` | Athlete mobile app — Index, today's session, exercise clips. |
| `slides/` | Deck template (title, statement, pillars, Index, comparison, photo, closing). |

### UI kits
- **Marketing site** (`ui_kits/marketing-site/index.html`) — black/white/red editorial, B&W full-bleed hero, three pillars, program grid, Index explainer, campuses, testimonial, booking CTA + multi-step modal.
- **Dashboard** (`ui_kits/dashboard/index.html`) — the Castille Index portal: score ring, block progress, schedule, assessment history.
- **Mobile app** (`ui_kits/mobile-app/index.html`) — athlete-facing: today's session, Index trend, exercise clip library.

### Slides
- `slides/index.html` — interactive deck loading each slide type.
