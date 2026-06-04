# Southern Maine Athlete Academy — Design System

A brand + UI design system for **Southern Maine Athlete Academy (SMAA)**, Southern Maine's premier private soccer training and athletic development program for youth athletes (ages 7+), with studios in **Portland** and **Saco, Maine**.

This system lets a design agent produce on-brand SMAA materials — landing pages, lead-gen funnels, social graphics, slides, and parent-facing collateral — that look and read like the real product.

---

## What SMAA is

SMAA delivers **personalized, small-group soccer + athletic-development coaching**. The promise to parents: help your child *master the ball, develop athleticism (speed/strength/explosiveness), build confidence, reduce injury risk, and earn more playing time.* The customer is the **parent**; the athlete is the **child**. The funnel centers on a **free 1:1 Gameplan evaluation**.

- **Founder:** Jeremy Longchamp, MS, CSCS — Exercise Science degree, Master's in Coaching, CSCS, 10 yrs coaching (college/club/ODP/HS).
- **Core offer flow:** (1) Schedule a 1:1 Gameplan Session → (2) Choose the perfect program → (3) Join the community.
- **Guarantee:** if your child doesn't show measurable progress/confidence after one month, they keep training free until they do.
- **Free lead magnets:** 12-Minute At-Home Touch Routine · 5 Drills to Improve Fundamental Skills · 5 Favorite Exercises to Develop Athleticism.

### Sources used to build this system
- **Live website:** https://southernmaineathleteacademy.com/ (a GoHighLevel / LeadConnector funnel site). Key routes: `/home`, `/scheduling-and-pricing`, `/testimonials`, `/get-started`.
- **Logo + photography:** pulled from the site's CDN into `assets/` (see below). The logo color palette swatch the user supplied (`smaa.webp`) confirmed the core hues.
- **Social:** [Instagram](https://www.instagram.com/southernmaineathleteacademy/) · [Facebook](https://www.facebook.com/southernmaineathleteacademy)
- **Locations:** 160 Presumpscot Street, Portland, ME 04103 · 73 Industrial Park Road, Saco, ME 04072

> ⚠️ No Figma file or codebase was provided. The system is reconstructed from the live marketing site (full copy + real images) and the supplied color swatch. Fonts are **substitutions** (see Visual Foundations → Type).

---

## Content Fundamentals

**Voice:** energetic, encouraging, and unmistakably parent-facing. It sells *outcomes for your child*, not features. Confident and a little hype-y (it's a conversion funnel) but grounded by real credentials and a money-where-mouth-is guarantee.

- **Person:** Speaks to the **parent as "you"** about **"your child"**. Brand refers to itself as **"we" / "our coaches"**. Never first-person singular.
- **Casing:** Headlines use **Title Case** ("Choose the Perfect Program", "Don't Wait, Start Today!") and frequent **ALL-CAPS CTAs** ("CLICK HERE TO GET STARTED WITH A FREE 1:1 EVALUATION").
- **Tone devices:** rhetorical questions ("Do You Want Your Child To… play more minutes?"), benefit-stacked lists, em-dashes for momentum, and exclamation points used sparingly for punch.
- **Emoji:** rare and functional — only the **📍 pin** for locations. Not a playful-emoji brand. Don't sprinkle emoji.
- **Vocabulary:** *athlete, develop, confidence, gameplan, progress, community, master the ball, explosiveness, playing time, evaluation.* Soccer-specific but accessible to non-coach parents.
- **CTA pattern:** one repeated, unmissable action — **"Click here to get started with a free 1:1 evaluation."** Repeat it after every major section.

**Example copy in voice:**
> "At SMAA, we help soccer players 7 and older master the ball, develop athleticism, and boost confidence so they can stand out on the field, impress their coaches, and earn more playing time."
> "If your child doesn't feel more confident, improve their skills, or show measurable progress after one month, we will continue to train them for free until they do."

---

## Visual Foundations

**Overall feel:** clean, athletic, trustworthy. Bright **electric blue** + **lime green** energy accents on a **white** canvas, punctuated by **deep navy-black** dark sections where the white logo lives. Real, unstaged training photography — not stock, not illustration.

### Color
- **Primary — Electric Blue `#017ee6`:** every primary CTA, link, and key accent. This is *the* brand color.
- **Accent — Lime Green `#59be0b`:** energy/"go" highlights, checkmarks, success, secondary emphasis. Pairs with blue; never dominates.
- **Ink — Navy-black `#0b1219`:** dark hero/section backgrounds and the home for the white logo. High contrast.
- **White `#ffffff`:** dominant surface; also the logo color (logo is white-on-transparent → always place on dark or on imagery).
- Neutrals: a small slate ramp (`--fg2 #45525e`, `--fg3 #6f7d89`, lines `#e3e9ef`). The maroon/pink (`#320303`, `#d19eb9`) in the supplied swatch are logo-render artifacts — **not** part of the working palette.
- **Vibe of imagery:** warm, candid, real — kids training in the studio (turf-grey floor, orange cones, soccer balls), natural light portraits. Not desaturated, not heavily graded. Keep photos true-to-life.

### Type *(substituted — see caveat)*
- **Display / impact:** **Oswald** (condensed, uppercase) — stands in for the bold slab-serif athletic wordmark on the logo. Used for big punchy statements, eyebrows, stat numbers.
- **Headings + body:** **Montserrat** (geometric sans, weights 400–800). Friendly, modern, legible — matches the funnel's clean parent-facing tone.
- Headlines are heavy (700–800), tight leading, slightly negative tracking. Body is comfortable 17px / 1.65.

### Spacing, radius, elevation
- **4px spacing base**; generous vertical section rhythm (64–96px between bands).
- **Radii:** buttons & cards `10–16px`; pill `999px` for tags/CTAs when round. Nothing sharp-cornered, nothing fully boxy.
- **Shadows:** soft and low-spread on light surfaces (`0 8px 24px rgba(11,18,25,.10)`); CTAs get a colored blue glow (`0 8px 20px rgba(1,126,230,.35)`). No harsh/dark drop shadows.

### Backgrounds, motion, states
- **Backgrounds:** mostly flat white or flat navy bands; **full-bleed training photos** as hero/section imagery, often with a subtle dark gradient scrim for legible overlaid text. No busy patterns, no purple gradients, no textures.
- **Animation:** restrained — gentle fades + 150–250ms ease-out on hover/reveal. No bounces, no infinite loops. Buttons may lift slightly on hover.
- **Hover:** primary buttons darken (`--smaa-blue-600`) and lift 1–2px with a stronger glow; links underline/darken; cards raise shadow.
- **Press:** subtle scale-down (~.98) and shadow collapse.
- **Borders:** hairline `1px` `#e3e9ef` on light; on dark use `#1d2933`. Cards favor shadow over border.
- **Transparency/blur:** used only for photo scrims and sticky-header backdrop blur. Sparingly.
- **Cards:** white, `12–16px` radius, soft shadow, no heavy border, comfortable padding (24–32px).

---

## Iconography

SMAA's site is light on iconography — it leans on **photography and bold type** rather than an icon language. There is **no custom icon font or SVG sprite** in the source.

- **Approach in this system:** use **[Lucide](https://lucide.dev/)** (loaded from CDN) as a clean, rounded, consistent-stroke set that matches the friendly-but-athletic tone. This is a **substitution** — flag if the brand later supplies its own marks.
- **Usage:** functional UI only — check (`check`), stars for reviews (`star`), location pin (`map-pin`, echoing the brand's 📍), arrows on CTAs (`arrow-right`), play (`play`) for video testimonials, calendar/clipboard for the gameplan steps. Keep them small and secondary to type.
- **Stars:** review widgets use solid gold stars (`--star #ffb400`).
- **Emoji:** only the 📍 pin appears in real copy; otherwise avoid emoji as iconography.
- **Logo:** `assets/logo.webp` — white wordmark + Maine state outline, transparent background. **Always on dark or imagery.** Needs a colored/dark variant for light backgrounds (not currently available — see caveats).

---

## Assets in `assets/`
| File | What it is |
|---|---|
| `logo.webp` | Primary logo — white wordmark + Maine outline, transparent bg (place on dark) |
| `hero.webp` | Studio training photo — two girls 1v1 with ball + cones |
| `founder.webp` | Jeremy Longchamp portrait (outdoor, natural light) |
| `step1.webp` `step2.webp` `step3.webp` | Training photos for the 3-step program section |

---

## Index — what's in this system
- **`README.md`** — this file (context, content + visual foundations, iconography, manifest).
- **`colors_and_type.css`** — all color + type design tokens (CSS variables + semantic classes). Import this first.
- **`SKILL.md`** — Agent-Skill manifest so this folder works as a downloadable Claude skill.
- **`assets/`** — logo + real brand photography.
- **`preview/`** — small HTML cards that populate the Design System tab (colors, type, components, etc.).
- **`ui_kits/website/`** — high-fidelity, interactive recreation of the SMAA marketing funnel (`index.html` + JSX components). The product surface for this brand.

> No slide template was provided, so `slides/` is intentionally omitted. Ask if you'd like a branded deck template.
