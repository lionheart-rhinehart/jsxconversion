# Batti-Performance — Design System

> **Where Athletes Come To Dominate.**

Batti-Performance is a results-guaranteed youth & athlete sports-performance training company, founded **2015** and operating out of **Orland Park, IL** (HQ), **Manteno, IL**, and **Gilbert, AZ**. The brand has trained **2,257+ athletes** and is built around one blunt promise: **a minimum +3″ vertical jump and +1 mph speed gain in 30 sessions — or training continues FREE** until the athlete hits those numbers.

The founders are **Ronnie Battiato** (Owner / Head Coach — NCSF certified, Byrd Sport Performance certified, former collegiate athlete) and **Marissa Battiato** (Operations / Coach — Exercise Science degree, NCSF + Byrd certified). The voice across the brand is a head coach talking straight to a parent: blunt, confident, metric-driven, with a parallel emphasis on **character built through sport.**

The brand positions itself as the antidote to a youth-sports landscape "crowded with big claims and disappointing results" — accountability is the product. Speed, agility, and **first-step explosiveness** are the recurring physical promises; **confidence and character** are the emotional ones.

---

## Sources

- **Primary reference — live site:** [battiperformancetraining.com](https://battiperformancetraining.com) (WordPress). The source of truth for copy, structure, programs, and locations. Stacked ALL-CAPS hero headlines ("BREAKAWAY SPEED / UNSTOPPABLE AGILITY / CHARACTER BEYOND SPORT"), the +3″/+1mph guarantee block, a 3-step system (Precision Assessment → Customized Explosive Development → Complete Athlete Transformation), athlete photo wall, and the "Claim your athlete analysis now" CTA.
- **Secondary:** [battiperformance.com](https://battiperformance.com) — the original Batti gym (one-on-one training, women's small-group fitness, "Phenom" sport-performance program; coaches Ronnie & Marissa). Currently treated as legacy/secondary; access was blocked during this build.
- **Social:** [@batti_performance](https://www.instagram.com/batti_performance/) (IG), [facebook.com/battiperformancellc](https://www.facebook.com/battiperformancellc). Tagline used on socials: *"ATHLETES — We Boost your SPEED | STRENGTH | POWER."*
- **Color palette (client-locked):** `#000000` · `#ffffff` · `#e6e6e6` · `#6b6b6b` · `#cb0202`. Provided directly by the client; treated as the complete, non-negotiable palette.

> ✅ **Logo received & integrated.** The brand mark is a **circular black badge**: an interlocking **BP monogram** in a thin ring, beside the wordmark **BATTI** (red) **−PERFORMANCE** (white). Files in `assets/`: `logo-badge.png` (chrome monogram), `logo-badge-white.png` (flat white monogram), and `logo-monogram.png` (extracted BP mark for compact/header use). The header lockup pairs the monogram with live HTML text so it scales cleanly.

> ⚠️ **Fonts are best-match substitutes.** No brand font files were provided and the live site's typefaces could not be confirmed. The system uses **Saira Condensed** (display) + **Saira** (body) + **Spline Sans Mono** (metrics) as athletic, on-brand stand-ins. Flag for the client to confirm or replace.

> ⚠️ **No Figma file or codebase provided.** UI patterns are recreated faithfully from the live marketing site's copy and structure; exact pixel measurements/spacing are inferred. Iterate freely.

---

## Index — what's in this folder

| Path | Purpose |
|---|---|
| `README.md` | This file. Brand context, content fundamentals, visual foundations, iconography. |
| `SKILL.md` | Skill manifest so other agents (and Claude Code) can invoke this kit. |
| `colors_and_type.css` | All color & type tokens (`--bp-red`, `--bg`, `--fg`, …) + semantic rules for `h1`–`h4`, `p`, `.bp-display`, `.bp-eyebrow`, `.bp-metric`, `.bp-mono`. |
| `assets/` | Logos (pending), brand imagery. |
| `preview/` | One HTML file per design-system card (rendered in the Design System tab). |
| `ui_kits/marketing-site/` | Faithful recreation of battiperformancetraining.com — componentized JSX + an interactive `index.html`. |

---

## CONTENT FUNDAMENTALS

The voice is **a head coach who refuses to oversell, talking directly to a parent.** Confident, blunt, accountability-first — but with a genuine secondary thread about character, confidence, and the person the athlete becomes. Hard numbers do the persuading.

### Voice & tone
- **Second person, addressed to the parent.** "Your child will gain 3″ on their vertical." "Watch your child make sharp, decisive cuts." "Your athlete follows their custom-engineered protocol."
- **First-person plural for the brand.** "We GUARANTEE…", "We build athletes from the inside out", "Since 2015, we've taken a fundamentally different approach." Never "I."
- **Dual promise, always paired.** Every physical claim is shadowed by a character claim: *"developing both the explosive capabilities AND the character traits…"* Speed + confidence, performance + person.
- **Accountability as the differentiator.** "No other program offers this level of accountability." "Or we train them for FREE." The guarantee is the spine of the brand.
- **Plain, declarative, occasionally ALL-CAPS for force.** Headlines are short and stacked. Body is conversational but tight.

### Casing
- **Hero headlines: ALL CAPS, stacked, condensed.** The signature device is a vertical stack of 2–4 short caps phrases: `BREAKAWAY SPEED` / `UNSTOPPABLE AGILITY` / `CHARACTER BEYOND SPORT`.
- **Section titles: ALL CAPS** — `GUARANTEED EXPLOSIVE PERFORMANCE`, `THE DIFFERENCE IS IN OUR APPROACH`, `OUR 3 STEP SYSTEM`.
- **Buttons / CTAs: sentence case, verb-led.** `Claim your athlete analysis now`, `Apply Now`, `Book Now`.
- **Eyebrows / kickers: ALL CAPS, letterspaced** — `OUR 3 STEP SYSTEM`, `COMMON QUESTIONS`.
- **Metric callouts:** number + unit, terse — `3″ vertical`, `1mph speed`, `30 sessions`, `2,257+ athletes`, `92%`, `100% guaranteed`.

### Tropes that recur
- **The guarantee, verbatim.** *"Your athlete will gain AT LEAST 3 inches on their vertical jump and 1mph in speed in 30 sessions — or we train them for FREE until they achieve these results."* Repeated across the system. Don't paraphrase the numbers.
- **Stacked caps hero.** Three short lines, each its own promise.
- **The 3-step system.** `step 1 → PRECISION ASSESSMENT`, `step 2 → CUSTOMIZED EXPLOSIVE DEVELOPMENT`, `step 3 → COMPLETE ATHLETE TRANSFORMATION`. Always numbered, always three.
- **Checkmark proof trio.** `✓ 2,257+ athletes developed`, `✓ 100% guaranteed results`, `✓ 92% of parents report increased confidence.`
- **Single repeating CTA.** "Claim your athlete analysis now" recurs after nearly every section — one ask, hammered.
- **Physical + character pairing** in every value statement.

### Things to avoid
- **No exclamation-point hype in body copy.** The brand sells with numbers and a guarantee, not !!!. (Testimonials may be enthusiastic; brand voice stays calm-confident.)
- **No "journey/passion/we love what we do" filler.** Replace with a metric or the guarantee.
- **No vague benefit language.** "Get faster" → "+1 mph in 30 sessions."
- **No emoji in long-form brand copy.** (Socials use 💥⭐️ casually; the design system / site stays emoji-free.)
- **Don't drop the character thread.** Speed alone is half the brand.

### Example copy patterns
- **Hero stack → guarantee → CTA**
  > **BREAKAWAY SPEED**
  > **UNSTOPPABLE AGILITY**
  > **CHARACTER BEYOND SPORT**
  > We GUARANTEE your child will gain 3″ on their vertical and 1mph in their speed in just 30 sessions — or we train them for FREE
  > → *Claim your athlete analysis now*
- **Proof trio**
  > ✓ 2,257+ athletes developed · ✓ 100% guaranteed results · ✓ 92% of parents report increased confidence
- **Step**
  > **step 1 — PRECISION ASSESSMENT.** We start with a comprehensive Athletic Performance Assessment that identifies exactly where your child's explosive potential is currently locked.

---

## VISUAL FOUNDATIONS

The system is **high-contrast, squared, and photographic.** Black, white, grey, one decisive red. No gradients-as-decoration, no softness. It should feel like locker-room signage and stadium graphics — confident and a little hard.

### Color
- **Black (`--bp-black` #000000)** is the dominant brand surface. Hero, footer, and "pillar" sections sit on pure black; type on black is white.
- **White (`--bp-white` #ffffff)** is the editorial canvas — alternating black and white full-width sections is the core rhythm.
- **Light grey (`--bp-grey-100` #e6e6e6)** is the only secondary surface (alt cards, FAQ rows) and the hairline border on white.
- **Mid grey (`--bp-grey-500` #6b6b6b)** is secondary text and inactive icons — never a headline color.
- **Red (`--bp-red` #cb0202)** is surgical: primary CTAs, the accent word inside a headline, the step numerals, the active underline, key metric values. **Never a full-bleed background, never on body copy.** Hover/press states darken red via `color-mix` (documented as states, not new palette colors).
- **Imagery vibe:** real gym/training photography — **cool, hard, high-contrast.** Darken photos with a bottom-up black gradient so white headlines stay legible. No warm/sepia, no full b&w-only, no heavy filters.

### Type
- **Display:** Saira Condensed, 700–900, **ALL CAPS**, line-height **0.88–0.95**, tracking slightly negative. Built for the stacked-headline device.
- **Body:** Saira, 16–18px, line-height 1.55–1.6.
- **Mono:** Spline Sans Mono — metric values and small technical labels; **always tabular numerals.**
- **Accent word:** color one word in a headline `--bp-red`.
- **Outline word/number:** step numerals and occasional words use `color: transparent; -webkit-text-stroke` for a stadium-signage look.

### Spacing & rhythm
- **8pt base** (4/8/12/16/24/32/48/64/96/128). `--s-9` (96px) between major sections; `--s-7` (48px) within.
- **Full-width sections** that alternate black/white; centered editorial content maxes at **1200px**.
- Hero headlines run wide and large, near the page edges.

### Backgrounds
- **Solid black** and **solid white** are the two primary modes — alternated. This contrast IS the brand.
- **Full-bleed darkened photography** for hero / CTA / step imagery, with a bottom-up `rgba(0,0,0,.85)→0` protection gradient.
- **No textures, no patterns, no decorative gradients, no hand-drawn elements.**

### Borders & dividers
- **1px `--bp-grey-100`** hairline on white surfaces; **1px `rgba(255,255,255,.14)`** on black.
- A **red left/bottom rule** marks one active/emphasized element only — do not scatter red borders on generic cards (slop trope).

### Corner radii
- Buttons: **`--r-sm` (4px)** / **`--r-md` (6px)** — squared and confident.
- Cards: **`--r-lg` (10px)** max. Never stack large soft radii — this isn't a friendly consumer app.
- Pills/chips: `--r-pill`, only for filter chips / status badges.

### Shadows & elevation
- Cards rest on **`--shadow-2`**, lift to **`--shadow-3`** on hover.
- **`--shadow-red`** glow only on the primary CTA, only on hover.
- Faint `--inner-top` highlight on dark raised surfaces.

### Hover & press
- **Buttons:** `translateY(-1px)` + shadow lift; primary CTA fill darkens `--bp-red → --bp-red-hover`.
- **Press:** `translateY(0) scale(.99)` + `--bp-red-press`, < 100ms.
- **Links:** color darkens, 2px underline appears.
- **Cards:** lift via shadow only — no scale, no rotate.

### Motion
- **Quick and confident:** 120 / 200 / 360ms.
- **Easing:** `--ease-out` `cubic-bezier(.2,.7,.2,1)` for entrances; `--ease-snap` for state changes. **No bouncy `back.out` curves.**
- **Reveal:** headlines fade up ~16px on scroll, staggered line-by-line in the stacked hero.

### Transparency & blur
- **Sticky header:** `backdrop-filter: blur(14px)` over `rgba(0,0,0,.7)` (dark) once scrolled.
- **Photo protection gradient** as above. **No frosted card surfaces** on the editorial canvas.

### Cards
- **Light card:** `background:#fff; border:1px solid var(--border); border-radius:var(--r-lg); box-shadow:var(--shadow-2); padding:var(--s-6);`
- **Dark / "step" card:** `background:var(--surface-dark); color:#fff; border:1px solid var(--border-dark);` with a large outlined red numeral.
- **Photo card:** full-bleed image + bottom black gradient + display-face label bottom-left.

### Layout rules
- **Sticky top nav**, dark, blur-on-scroll. Container max **1200px**, 24px gutters.
- **Full-bleed black/white section bands**; content centers inside the container.
- **CTA repeats** at the foot of major sections — single, red, verb-led.

---

## ICONOGRAPHY

**Icon system: [Material Symbols Rounded](https://fonts.google.com/icons)** — chosen as the closest CDN match to a clean, modern athletic-tech glyph set (no brand icon font was provided; **flag to confirm**). Rounded, single-weight, inherits text color.

> **Sandbox note:** Google's icon-font CDN (both Material Symbols and classic Material Icons) is **unreachable in this preview environment**, while the text-font CDN works. The `ui_kits/` and `preview/` HTML therefore ship a small **inline-SVG icon set** in clean Material-compatible stroke style, keyed by the same Material Symbols names. In production with normal network access, use the Material Symbols font as documented below.

### Loading
```html
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,300..700,0..1,-50..200" />
```
```html
<span class="material-symbols-rounded">bolt</span>
```

### Usage
- **Size:** match cap-height; inline icons inherit `font-size`.
- **Weight:** 400 default, 600 for CTAs / active nav.
- **Fill:** outline for inline/nav; filled for active states and proof markers.
- **Color:** inherit (`--fg` / white on dark). Red only when doing semantic work (guarantee mark, active item, the `bolt` on explosiveness).

### Canonical vocabulary
| Use case | Icon |
|---|---|
| Speed / acceleration | `sprint`, `speed` |
| Agility / cuts | `directions_run` |
| Explosiveness / power | `bolt` |
| Vertical jump | `trending_up` |
| Strength | `fitness_center` |
| Assessment / data | `query_stats`, `monitoring` |
| Guarantee / verified | `verified`, `check_circle` |
| Locations | `location_on` |
| Nav | `arrow_forward`, `chevron_right`, `expand_more`, `menu` |
| Testimonial rating | `star` |
| Booking / apply | `event_available`, `assignment` |

### What we do NOT use
- **No emoji** in brand copy or product UI. (Socials are the exception.)
- **No SVG illustration set / mascots / hand-drawn icons.** The brand is photographic and typographic.
- **No second icon family.** One set, used consistently.

### The logo
- **Circular badge** with an interlocking **BP monogram** (thin ring) + wordmark **BATTI** (red) **−PERFORMANCE** (white). Use `assets/logo-badge.png` (chrome) or `assets/logo-badge-white.png` (flat) as the full emblem; use `assets/logo-monogram.png` for compact/avatar/header contexts. The badge has transparent corners (the black circle is part of the mark). On non-black surfaces, keep the badge's black circle; for a monogram-only lockup on light backgrounds, request a transparent-background monogram export.

---

## Where to go next
- **Confirm or replace the fonts** (currently Saira Condensed / Saira / Spline Sans Mono as substitutes) — highest open item.
- If you want a monogram on **light** backgrounds, send a transparent-background monogram export (the current badge keeps its black circle).
- Upload real **training photography** if you ever want it in this kit (you mentioned photos live elsewhere — that's fine).
- Add a real **Figma file or codebase** link if one exists, for pixel-exact UI parity.
