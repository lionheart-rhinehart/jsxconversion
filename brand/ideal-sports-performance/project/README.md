# Ideal Sports Performance (ISP) — Design System

> **Ideal Sports Performance & Fitness (ISP)** — a premier performance‑training facility in Fort Worth, TX. ISP trains athletes of every level with three core programs: **Baseball Performance**, **Sports Performance**, and **Adult Training**. The brand promise is measurable, coached, individualized improvement — *"Do you need to increase your velocity? Let ISP help."*

This repository is a **design system**: brand foundations, color + type tokens, fonts, real logo assets, preview cards, and a high‑fidelity UI kit. Use it to produce on‑brand interfaces, slides, mocks, and marketing pages for ISP.

---

## Sources

Everything here was reconstructed from materials the client provided plus the live site. The reader may not have access to these — they are recorded for provenance:

| Source | Detail |
|---|---|
| **Live website** | https://ispfortworth.com/ (built on a HighLevel/LeadConnector template — generic chrome, ISP brand on top) |
| **Logo** | Client‑uploaded SVGs `uploads/ISP logo/1.svg` & `2.svg` were **broken** (empty `<image>` wrappers, no artwork). The real logo was recovered from the site CDN → `assets/logo-*.png/webp`. |
| **Color palette** | Client screenshot "Colors from ISP.png": white `#ffffff`, ISP blue `#2573b7`, near‑black `#1c1c1d`. |
| **Hero photography** | Recovered from the site CDN → `assets/hero-original.webp`. |
| **Programs / copy** | Baseball Performance, Sports Performance, Adult Training (page copy pulled from the live site). |
| **Contact** | 3800 Southwest Blvd, Fort Worth, TX 76116 · 1 (817) 301‑5644 · IG @ispfortworth |

> ⚠️ **Substitutions & gaps** — see `CAVEATS` at the bottom. The headline/body typefaces and the full color ramp are *designed* (the source site only specified three flat colors and used template fonts), so confirm the type direction before production use.

---

## Index / manifest

| File / folder | What it is |
|---|---|
| `README.md` | This file — context, content & visual foundations, iconography, index. |
| `SKILL.md` | Agent‑Skills front‑matter so this folder works as a downloadable Claude skill. |
| `colors_and_type.css` | **Single source of truth** for color + type + spacing + radius + shadow tokens, plus semantic helpers (`.eyebrow`, `.stat`, `.lead`, `.isp h1…`). |
| `fonts/` | Barlow + Barlow Condensed woff2 (self‑hosted). |
| `assets/` | Logo lockups (full, on‑dark, badge), hero training photo. |
| `preview/` | Small Design‑System‑tab cards (type, color, spacing, components, brand). |
| `ui_kits/website/` | High‑fidelity recreation of the ISP marketing site (the one real product). |

---

## CONTENT FUNDAMENTALS — how ISP writes

**Voice:** Direct, confident, coach‑to‑athlete. ISP talks like a trainer on the floor — short, motivating, results‑first. Never academic, never fluffy.

**Person:** Mixes **"you"** (addressing the athlete: *"Do you need to increase your velocity?"*) with **"we / our"** for the facility and staff (*"Our coaching staff ensures each athlete has a proper progression"*). The brand name "ISP" is used as a subject — *"Let ISP help."*

**Casing:**
- **Headlines & CTAs → UPPERCASE**, set in condensed display type. *"TRY ISP FREE!"*, *"LEARN MORE"*, *"SIGN UP NOW!"*
- Body copy is normal sentence case.
- Program names are Title Case: *Baseball Performance, Sports Performance, Adult Training.*

**Punchiness:** Frequent exclamation on CTAs (*"Try ISP Free!"*, *"Sign up for one of our classes today!"*). Headlines are very short and often split across two lines for rhythm (*"Do you need to increase your velocity?" / "Let ISP help."*).

**Substance over hype:** Even the marketing copy names the actual mechanism — *"individualized monthly throwing plans based on velocity development or mechanical adjustments,"* *"linear and lateral speed techniques, foot speed and agility, explosive power development."* Lead with the benefit, back it with the method.

**Recurring phrases / hooks:**
- *"increase your velocity" / "Let ISP help"*
- *"Your first class is free"* / *"Try ISP Free"* (the standing offer — use it as the primary CTA)
- *"best‑in‑class"*, *"maximize their potential on and off the field"*
- *"reduce the risk of injury"* (injury reduction is a core selling point, not just performance)

**Emoji:** Essentially none on‑brand. The only emoji on the live site is a ✉️ next to the contact email. **Do not** decorate UI with emoji — use real iconography (see below).

**Tone in one line:** *Local, no‑nonsense, performance gym — credible coaching, measurable gains, welcoming to first‑timers.*

---

## VISUAL FOUNDATIONS

**Color.** A disciplined, almost monochrome‑plus‑one palette. **ISP Blue `#2573b7`** is the single hero color (straight from the logo badge) — it carries CTAs, links, kickers, and accents. **Ink `#1c1c1d`** anchors text and dark "performance" sections (footers, stat bands, photo scrims). **White** is the dominant surface. A warm‑neutral gray ramp and a small blue tint/shade scale (`colors_and_type.css`) round it out. **No third brand hue, no purple gradients, no rainbow.** Keep it blue‑on‑white‑on‑black.

**Type.** Two families, both self‑hosted:
- **Barlow Condensed** (700/800, **UPPERCASE**, tight tracking) for display, headlines, kickers, big stat numbers — the athletic, jersey‑like voice that echoes the bold geometric logo.
- **Barlow** (400–700) for body, UI, buttons, forms — sturdy, friendly grotesque, highly legible.
Headlines run big and tight, often two lines, frequently with one line/word in ISP blue for emphasis.

**Backgrounds.** Three modes, used intentionally: (1) **white/off‑white** for content; (2) **ink** for dark high‑impact bands (footer, stat strips, "performance" callouts); (3) **full‑bleed training photography** behind a scrim for heroes and section openers. No repeating patterns, no textures, no noise. Gradients are used *only* as photo **protection scrims** (ink/blue → transparent diagonals) and occasionally a subtle blue→deep‑blue fill on a card that has no photo — never decorative full‑page gradients.

**Photography.** Real in‑gym training shots — athletes mid‑rep, coaches on the floor, dumbbells/turf/racks. Natural indoor light, slightly warm, candid (not stock‑posed). Always treat photos with an ink or deep‑blue scrim when text sits on them; favor a **diagonal/left‑weighted scrim** so headlines stay legible. Color vibe: warm, energetic, grounded — not cool/clinical, not black‑and‑white.

**Layout.** Generous, confident spacing on an 8pt base. Centered or left‑aligned content columns, big section padding (`--space-8/9`). Sticky top nav with the logo at left and a pill CTA at right. Sections alternate white ↔ ink ↔ photo for rhythm. Fixed elements: the header nav (sticky) and a single persistent primary CTA.

**Corner radii.** Friendly and rounded, echoing the logo badge. Cards `--radius-lg` (18px), inputs `--radius` (10px), and **pill CTAs / chips** (`999px`) are the signature — buttons are almost always fully rounded.

**Cards.** White, fully rounded corners (18px), soft shadow (`--shadow-md`), **no visible border** by default (border only on flat/nested fills). Photo cards put the image on top with a kicker overlaid bottom‑left over a gradient. Avoid the "rounded card + single colored left border" trope.

**Shadows.** Soft, neutral, low‑spread (`--shadow` / `--shadow-md`). Primary CTAs get a colored **blue lift** (`--shadow-blue`) to pop. No hard/black drop shadows, no neumorphism.

**Borders.** Hairline neutral (`--border` `#e6e7ea`). 1.5px on inputs; inputs go blue + focus‑ring on focus.

**Transparency & blur.** Used sparingly — sticky header may gain a translucent white + `backdrop-filter: blur` once scrolled; photo scrims use rgba ink/blue. No glassmorphism elsewhere.

**Motion.** Purposeful and quick. Standard ease `cubic-bezier(.2,.7,.3,1)` at 120–360ms. Entrances = short fade + small rise (translateY 8–16px). **Hover:** primary buttons darken (`--isp-blue → --isp-blue-700`) and lift slightly; cards raise shadow + nudge up ~2px; links shift to `--isp-blue-700`. **Press/active:** scale down ~0.97 and drop the lift. No bounces, no infinite decorative loops, respect `prefers-reduced-motion`.

**Focus / accessibility.** Visible blue focus ring (`--focus-ring`, `rgba(74,144,217,.45)`). Hit targets ≥44px. Blue `#2573b7` on white passes AA for large/UI text; for small body text prefer ink.

---

## ICONOGRAPHY

The source site (a HighLevel template) ships **no custom icon set** — it uses only a ✉️ emoji and social glyphs. So this system **standardizes on [Lucide](https://lucide.dev)** (CDN), chosen because its clean **2px rounded‑stroke, geometric** style matches ISP's rounded logo and friendly radii. *(This is a documented substitution — there is no proprietary ISP icon font.)*

**Rules:**
- **Stroke icons only**, `stroke-width: 2`, `currentColor` — never filled, never multicolor.
- Default size 20–24px; inherit text color (ink for default, blue for active/accent, white on dark).
- Pair icons with text labels for nav and CTAs; avoid icon‑only controls except for obvious affordances (close, menu, social).
- **No emoji in UI.** Replace the site's ✉️ with Lucide `mail`. Map of common needs: `dumbbell` (sports), `target`/`zap` (velocity/power), `activity` (movement), `calendar` (classes), `map-pin` (location), `phone`, `mail`, `instagram`, `facebook`, `arrow-right` (CTAs), `menu`/`x` (nav).
- **Logo is not an icon.** Use `assets/logo-badge.png` (the standalone IDEAL badge) for app icon / favicon, never a Lucide glyph.

Load from CDN:
```html
<script src="https://unpkg.com/lucide@latest"></script>
<script>lucide.createIcons();</script>
<!-- <i data-lucide="arrow-right"></i> -->
```

**Logo assets in `assets/`:** `logo-full.png` (color, on light), `logo-on-dark.png` (subhead recolored white, for ink/blue backgrounds), `logo-badge.png` (IDEAL badge only — app icon), `logo-original.webp` (source), `hero-original.webp` (training photo).

---

## CAVEATS

1. **Logo:** the two uploaded SVGs were empty/broken. I recovered the real logo from the site CDN as raster (`500×249` webp/png). **A clean vector logo would be ideal** for crisp scaling — please re‑upload a working SVG/EPS if you have one.
2. **Type is a design choice.** The template site used default web fonts; Barlow / Barlow Condensed were selected to match the logo's bold geometric character. Easy to swap if you have brand fonts.
3. **Color ramp is derived.** Only 3 flat colors were given; the blue tints/shades and neutral ramp were generated harmonically around them.
4. **One real product.** ISP's only live product is the marketing site, so there is one UI kit (`ui_kits/website`). No app/portal exists to recreate — none was invented.
