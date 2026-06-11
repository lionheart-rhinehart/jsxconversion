# Athletes Acceleration. Design System

> **The drive is theirs. The athlete is ours to build.**

Athletes Acceleration is a professional youth sports-performance training company (ages 8–18) running a small franchise network across Indiana (Indianapolis, Carmel, Noblesville, Westfield) and Ohio (Milford), with a new flagship opening in Westfield. Training centers on three pillars. **Accelerate (speed)**, **Dominate (strength)**, and **Unleash (power)**. And the brand sells a results-guaranteed system: +1 mph speed, +3" vertical in 90 days, or training is free.

Many of the action photographs in this kit carry a co-branded **Genesis Sports Performance** watermark; Genesis is a partner facility at the Carmel, IN location. The primary brand here is **Athletes Acceleration**. Use the AA logo in `assets/logo.png` and treat the Genesis mark as legacy.

---

## Sources

- **Live website:** [athletesaccel.com](https://athletesaccel.com). Primary visual + copy reference. Three-pillar framing, code-comment section headers, Material Symbols icons, +1 mph / +3" guarantee block, numbered protocols (01/02/03).
- **Logo:** uploaded as `centered - no background.png` → `assets/logo.png`. Red metallic triangle "A" with chrome edge, wordmark below.
- **Action photography:** ~60 uploaded gym/training shots across sprinting, agility, jumping, squats, lifting, med-ball, conditioning, band work. Mostly shot inside the Carmel / Genesis-co-branded facility under hard top-down warehouse lighting.
- **Action clip library:** 29 short MP4 clips in `assets/clips/` covering 16 exercise types (agility drill, sprinting, box jumps, bear crawl, lifting, med-ball, jumping, lunges, etc.) across three locations (Indy, Carmel, Genesis) and two age groups (Middle School, High School). Each clip has a pre-generated JPG poster in `assets/clips/posters/`. Full metadata in `assets/clips/_index.json`. Library is growing. Drop more MP4s named `Action Clip - {exercise} - {age} - {gender} - {location}.mp4` and they'll be indexed on the next pass.
- **Hype videos:** `AA HYPE VIDEO.m4v`, `4-13 HYPE.mp4`, `AA LOGO.MP4` (animated logo sting).

> ⚠️ **No Figma file or codebase was provided.** UI patterns below are inferred from the marketing site and the brand vocabulary on photographs/uniforms. Iterate freely.

---

## Index. What's in this folder

| Path | Purpose |
|---|---|
| `README.md` | This file. Brand context, content fundamentals, visual foundations, iconography. |
| `SKILL.md` | Skill manifest so other agents (and Claude Code) can invoke this kit. |
| `colors_and_type.css` | All color & typography tokens (`--aa-red`, `--fg-1`, etc.) + semantic rules for `h1`–`p`, `.aa-display`, `.aa-eyebrow`, `.aa-data`, `.aa-code-comment`. |
| `assets/` | Logo, action photography, clip library (`assets/clips/` + `_index.json`). |
| `preview/` | One HTML file per design-system card (rendered in the Design System tab). |
| `ui_kits/marketing-site/` | Pixel-faithful recreation of the public marketing site (`athletesaccel.com`). Componentized JSX + an interactive `index.html`. |

---

## CONTENT FUNDAMENTALS

The voice is **a head coach talking to a parent who wants the truth.** Direct, blunt, confident, occasionally a little tough-love. Always rooted in measurable outcomes. Never in vibes.

### Voice & tone

- **Second person, addressed to parents.** "Your kid has the drive." "We build the athlete." "The longer you wait, the more they fall behind."
- **Plural-first-person for the brand.** Always "We assess… we build… we don't just run drills." Never "I" or institutional "the team at AA".
- **Declarative sentences, short.** Often fragments. "Day one: we baseline your athlete's 10/20/40 speed, vertical jump, and full mobility screen. No guessing. Just data."
- **No hedging.** Never "could help" or "might improve". Always "+1 mph speed. +3" vertical. Guaranteed."
- **Tough-love urgency, no fear-mongering.** "Most young athletes never reach their ceiling." "The competition isn't resting." Not dystopian, not alarmist. Just plainspoken.

### Casing

- **Display headlines: ALL CAPS, condensed.** `YOUR KID HAS THE DRIVE. WE BUILD THE ATHLETE.`
- **Section titles: Title Case** with select words colored red for emphasis. `Most Young Athletes Never Reach Their Ceiling.`
- **Pillar names: ALL CAPS + colon**, set in the display face. `ACCELERATE: SPEED` / `DOMINATE: STRENGTH` / `UNLEASH: POWER`.
- **Buttons: Title Case.** `Book Assessment`, `Find Your Nearest Facility`, `View Schedules`.
- **Eyebrows / kickers: small-cap mono** in red. `// FIND YOUR STARTING LINE`, `// THE TRUTH ABOUT YOUTH SPORTS`.

### Tropes that recur

- **Code-comment section openers:** every section starts with a small mono red line preceded by `//` ("Find Your Starting Line", "The Athletes Acceleration Method", "Real Results"). It signals the data-driven side of the brand.
- **Numbered protocols.** 01 / 02 / 03. Always two-digit, always set in the display face, often outlined.
- **Two-line headlines with split color.** Most display blocks have one phrase in ink and one in red. `Assess. Build. **Dominate.** That's the System.`
- **Hard metric callouts:** `+1mph`, `+3"`, `90days`, `10/20/40`. Set in mono, always tabular.
- **The guarantee.** "+1 mph speed. +3" vertical. 90 days. Or your training is on us." Repeated verbatim across the system. Never paraphrased.

### Things to avoid

- **No emoji.** Not on the site, not in product. The Material icon set carries all glyph-style needs.
- **No exclamation points.** The brand projects calm authority, not hype.
- **No "journey" / "passion" / "we love what we do" filler.** Replace with a metric or a hard claim.
- **No second-person plural ("you guys").** It's "your athlete", "your kid", "your son", "your daughter".
- **No casual contractions in legal / guarantee copy.** "You don't pay until it does" is fine in body, but the guarantee block stays formal.

### Example copy patterns

- Eyebrow → headline → support paragraph:
  > `// THE TRUTH ABOUT YOUTH SPORTS`
  > **MOST YOUNG ATHLETES NEVER REACH THEIR CEILING.**
  > Talent isn't enough. Without dedicated speed, strength, and power training, athlete potential turns into plateau. We eliminate the guesswork through our three core pillars.

- Stat block (always trio):
  > **+1 mph** Speed · **+3"** Vertical · **90 days** Or We Train Them Free

- CTA:
  > **Book Your Free Assessment** →

---

## VISUAL FOUNDATIONS

The system is **photographic, condensed, and confident**. Hard contrasts. Black, white, red. The display face does the heavy lifting; everything else gets out of its way.

### Color
- **Brand red (`--aa-red`, `#c4141d`)** is used surgically. Buttons, accents inside headlines, eyebrows, the numbered "01/02/03" markers, the underline beneath the AA wordmark. Never as a full-bleed background; never on body copy.
- **Black/ink (`--aa-ink-950` … `--aa-ink-700`)** is the workhorse for type and dark surfaces. Hero panels and pillar cards sit on near-black. Body text on light is `--fg-1` (`#0a0b0d`).
- **White / off-white (`--bg-1`, `--bg-2`)** is the default canvas. The marketing site alternates white sections with full-bleed photo sections.
- **Chrome (`--aa-chrome`)** is a finishing accent only. Used on the logo, on founder/award badges, and occasionally as a 1px hairline border on a dark surface.
- **Imagery color vibe:** **cool, slightly desaturated, hard top-down light.** Green turf grounds many shots; gray cinderblock walls. We crank a small amount of red into highlights to feel cohesive with the brand. **Never warm/sepia, never b&w-only.** Grain is acceptable, glow is not.

### Type
- **Display:** condensed athletic sans (Anton). All-caps, line-height **0.85–0.9**, tracking just slightly negative. Headlines often span 2–3 lines and break on emphasis words.
- **Body:** clean technical sans (Geist) at 16–18 px, line-height 1.5–1.6.
- **Mono:** JetBrains Mono. Used for eyebrows, code-comment openers, and any stat/metric value. **Numbers always tabular** (`font-variant-numeric: tabular-nums`).
- **Two-tone display word.** Inside a single headline, color one or two words `--aa-red-600` to create emphasis: `Assess. Build. <span class="accent">Dominate</span>.`
- **Outlined display word.** Numbers (`01`, `02`, `03`) and occasional pillar words are set with `color: transparent; -webkit-text-stroke: 2px currentColor` for a stadium-signage look.

### Spacing & rhythm
- **8 pt base scale** with a tight low-end (4/8/12/16/24/32/48/64/96/128). Sections breathe. `--s-9` (96px) between major sections, `--s-7` (48px) between blocks within.
- **Wide gutters on hero.** Display headlines often run 90 % of viewport width and tap the page edges.

### Backgrounds
- **Full-bleed photography** is the dominant background mode for hero, pillar, and CTA sections. Photos are darkened with a **bottom-up linear gradient** (`rgba(15,17,21, 0.85) → 0.0`) so headlines stay legible.
- **Solid near-black** (`--aa-ink-950`) for stat strips and the footer.
- **Solid white** for the main editorial canvas.
- **No textures, no patterns, no hand-drawn flourishes.** The brand is photographic. Illustrations / patterns would dilute it.

### Borders & dividers
- **1px solid `--border-1`** on light surfaces; **1px solid `--aa-ink-800`** on dark.
- **2px solid `--aa-red-600` left rule** is reserved for one thing: marking the active item in the program list. **Do not** scatter red left-borders on generic cards. That's a slop trope.
- **Hairline `--aa-chrome`** divider on the dark footer between columns.

### Corner radii
- Buttons: **`--r-md` (4 px)**. Squared and confident.
- Cards: **`--r-lg` (8 px)**. Gentle.
- Pills / chips: **`--r-pill`**. Only for filter chips and status badges.
- **Never** stack a 24px+ radius. This brand isn't soft / friendly-app.

### Shadows & elevation
- Cards sit on **`--shadow-2`** by default; lift to **`--shadow-3`** on hover.
- **Red glow shadow** (`--shadow-red`) only on the primary CTA and only on hover.
- Inset highlights (`--inner-1`) on dark surfaces give a faint top edge.

### Hover & press
- **Buttons:** `transform: translateY(-1px)` + shadow lift; primary CTA additionally shifts from `--aa-red-600` → `--aa-red-700`.
- **Links:** color goes `--aa-red-600` → `--aa-red-700`, underline appears via `text-decoration-thickness: 2px`.
- **Cards:** lift via shadow only. **no scale, no rotation**.
- **Press state:** quick `transform: translateY(0) scale(0.99)` plus a slightly darker fill. Press duration < 100 ms.

### Motion
- **Quick and confident.** 120 / 200 / 360 ms durations.
- **Easing:** `cubic-bezier(0.2, 0.7, 0.2, 1)` (`--ease-out`) for entrances; `--ease-snap` for emphatic state changes. **No bouncy `back.out` curves. Athletes don't bounce.**
- **Reveal pattern:** display headlines fade up 16 px on scroll, staggered word-by-word at ~40 ms intervals.
- **Marquee-friendly:** the logo "A" can animate (lighting sweep on the chrome edge). Kept subtle, ≤ 2 s loop.

### Transparency & blur
- **Header bar:** `backdrop-filter: blur(16px)` over `rgba(255,255,255,0.85)` when scrolled past 80 px.
- **Hero photo protection gradient:** linear gradient `rgba(0,0,0,0.65) → transparent` from bottom 60 % of frame.
- **No frosted card surfaces** on the editorial canvas. Saved for the header + overlays only.

### Cards
- Light card: `background: var(--bg-1); border: 1px solid var(--border-1); border-radius: var(--r-lg); box-shadow: var(--shadow-2); padding: var(--s-6);`
- Dark / "pillar" card: `background: var(--aa-ink-900); color: var(--aa-white); border: 1px solid var(--aa-ink-800); border-radius: var(--r-lg);`. With a large outlined `01/02/03` numeral top-left.
- Photo card: full-bleed image + bottom protection gradient + display-face label aligned bottom-left.

### Layout rules
- **Sticky top nav** (`backdrop-filter` blur), max-width container at **1280 px**.
- **12-column grid** on the editorial canvas with **24px** gutters.
- **Sections snap to viewport edges** on hero / pillar sections; editorial content gets a `1280 px` max width and centers.
- **The CTA always lives bottom-right of any photo hero**. Never centered.

---

## ICONOGRAPHY

**Icon system: [Material Symbols Rounded](https://fonts.google.com/icons)**. Confirmed in use on the live site (you can see glyph names like `location_on`, `arrow_forward`, `expand_more`, `child_care`, `sprint`, `school`, `speed`, `fitness_center`, `bolt`, `verified`, `star` appearing as text-content in the rendered DOM).

### Loading

```html
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,300..700,0..1,-50..200" />
```

```html
<span class="material-symbols-rounded">sprint</span>
```

### Usage guidelines

- **Size:** match cap-height of surrounding text. Inline icons inherit `font-size`.
- **Weight:** 400 default; 600 for emphasis (CTAs, nav items).
- **Fill:** outline (`FILL 0`) for navigation/inline; **filled** (`FILL 1`) for active states and stat-block markers.
- **Color:** inherit text color. Red (`--aa-red-600`) only when the icon is doing semantic work (verified-guarantee mark, active sport pillar, `bolt` on the Power pillar).

### The canonical icon vocabulary

| Use case | Icon |
|---|---|
| Speed pillar / sprint training | `sprint`, `speed` |
| Strength pillar | `fitness_center` |
| Power pillar | `bolt` |
| Multi-Sport Foundation (8–12) | `child_care` |
| Competitive Edge (13–15) | `directions_run` / `sprint` |
| College Prep (16–18) | `school` |
| Guarantee / verified | `verified` |
| Locations | `location_on` |
| Navigation | `arrow_forward`, `chevron_right`, `expand_more`, `menu` |
| Testimonial rating | `star` |
| Booking | `event`, `event_available` |

### What we do NOT use

- **No emoji.** Anywhere. Even in copy.
- **No SVG illustration set.** The brand is photographic. If a custom mark is ever needed (founders badge, certification seal), use a single-layer SVG in **`--aa-red`** on chrome, drawn flat.
- **No "hand-drawn"/"sketch" iconography.** Off-brand.

### The logo

`assets/logo.png`. Primary AA logo, transparent background, ~1000 px square. Use at >= 64 px tall. Below 32 px, swap to a glyph-only red triangle (no wordmark). That file is not yet provided.

`assets/logo-animated.mp4`. Animated logo sting (1–2 s), for video intros / loading overlays.

---

## Where to go next

- Add a real Figma link if/when one exists.
- Upload an SVG of the logo (the current `.png` rasterizes at large sizes).

## THE PAID-SOCIAL CREATIVE MATRIX

> This framework governs every paid-social campaign built on this brand kit. Read it before
> building any campaign creative.

All visual decisions — voice, color, type, assets, components — come from this brand kit
(see the foundations above and `colors_and_type.css`). **Never invent brand details.** If
something isn't in the kit, copy it in or ask. The framework below is the *house system*
every paid-social campaign must follow.

---

## The Creative Matrix

Every paid-social campaign is a **grid**.

- **Rows = angles** (the messaging hook). An angle is held **constant across its entire row**.
- **Columns = execution routes**, defined by **media-coverage band** — how much of the canvas
  is covered by photographic/video media.

We define routes by **coverage, not vibe**, because coverage is the *measurable* axis that
drives visual differentiation. It's also the axis creative-clustering / duplicate-detection
tools score, so distinct coverage bands keep our creatives from being flagged as near-dupes.

### Angle (the row)

- The angle is the **messaging hook** — a claim or tension, **NOT a visual**.
- It stays the same down the whole row. Only the *form* changes across routes.
- Example angles for this brand live in the ad-copy files (`uploads/`). Each ad = one angle.

### Routes (the columns)

| Route | Media coverage | What it is |
|---|---|---|
| **A — full-bleed media** | **~70%+** of canvas | Real footage/photo fills the frame. Any text/overlay is styled to AA's system (Anton display, JetBrains Mono eyebrows, brand red accents, bottom-up protection gradient). **This is the control — always full-bleed, format never changes.** |
| **B — partial media** | **~20–50%** of canvas | Media is a **bounded zone** (strip / circle / split / mask); **type carries the structure**. Creative idea is open — kinetic type is a common default, *not* a rule. |
| **C — no media** | **0% photo** | Pure **typographic + brand-color/graphic** composition. Logo/icon OK; **no footage**. Best for stat / proof / bold-claim angles. Weak for emotional angles that need a human face. |

### Labeling

- `{angle}{route}` → **1A, 1B, 1C, 2A, 2B…**
- Number = angle, letter = route. **Always label every creative.**

### Differentiation rule (non-negotiable)

**Never reuse one asset rescaled across routes.** Each route within an angle must use
**different source media (or none)** and a **different dominant composition + color
treatment**. Route A and Route B of the same angle should never be the same clip cropped
differently.

**Why the whole thing:** hold the *message* constant and vary the *form*, so the campaign
reads two things independently — (1) which **angle** resonates, and (2) which **media-density
format** converts.

---

## Route selection per angle

- **Route A always ships** for every angle (the control).
- **Route C** is available for every angle but only shipped where it *serves the message*
  (stat/proof/bold-claim angles). **Never force C just to fill the grid.** Emotional angles
  that hinge on a face are weak in C — skip it there.
- **Route B** ships when a bounded-media + structural-type idea adds a genuinely distinct read.

### Default scope

- **3 angles**, **Route A always + the best 1–2 of B/C per angle** → **~6–9 creatives**.
- If ads run as **dynamic creative / Advantage+**, lean toward **full A/B/C coverage**.
- If ads run as **manual isolated A/B ad sets**, **stay lean** so budget doesn't starve.
- **If unsure which delivery model, ask.**

---

## Brand execution (from the AA design system)

Pull exact values from `colors_and_type.css`; below is the working summary.

- **Color:** black/ink workhorse, white/off-white canvas, **brand red `--aa-red` (#c4141d)
  used surgically** (accents, eyebrows, CTA, numbered markers). Red is never a full-bleed
  background and never on body copy. Chrome is a finishing accent only.
- **Type:** **Display = Anton** (all-caps, line-height 0.85–0.9, condensed, two-line headlines
  that break on emphasis words, one word colored red). **Body = Geist** 16–18px. **Mono =
  JetBrains Mono** for eyebrows, `//` code-comment openers, and all stat/metric values
  (tabular nums). Outlined display numerals (`01/02/03`) via transparent fill + text-stroke.
- **Voice:** head coach talking to a parent who wants the truth. Second person to parents
  ("your kid", "your athlete"), first-person-plural for the brand ("we build"). Declarative,
  short, often fragments. No hedging, **no emoji, no exclamation points.**
- **Gender-neutral, always.** When referring to the athlete, use **they / their / them** —
  never "he/him/his" or "she/her". "Your kid", "your athlete", "they", "their game" are the
  defaults. ("He outworks half the team" → "They outwork half the team.") This applies to
  every headline, sub, body and hook, across every campaign built on this brand kit.
- **The guarantee (verbatim, never paraphrased):** **"+1 mph speed. +3" vertical. 90 days.
  Or your training is on us."** Hard metric callouts set in mono: `+1mph`, `+3"`, `90days`,
  `10/20/40`.
- **Imagery vibe:** cool, slightly desaturated, hard top-down light. Green turf, gray
  cinderblock. Never warm/sepia, never b&w-only. Grain OK, glow not.
- **Motion:** quick and confident (120/200/360ms), `--ease-out`
  `cubic-bezier(0.2,0.7,0.2,1)` for entrances, `--ease-snap` for emphatic changes. **No bouncy
  curves.** Headlines fade up 16px, staggered word-by-word ~40ms.
- **Icons:** Material Symbols Rounded only. No SVG illustration sets, no hand-drawn.
- **Logo:** `assets/logo.png` (copy in). Use ≥64px tall.
- **Assets:** action photos + a clip library live in the design system's `assets/` and
  `assets/clips/` (`_index.json` has full metadata: exercise, age, gender, location, poster).
  Match the clip/photo to the angle's message.

---

## Two labels: KICKER vs CALL-OUT (use both, never confuse them)

Every creative carries **two** small mono labels. They are different things with different
jobs. The whole point of both is **contrast with whatever is behind them.**

### Kicker — the messaging line
- The `//` code-comment line that names the angle's tension/context
  (e.g. `// THE TRUTH ABOUT SLOW`, `// WE MEASURE`, `// THE GUARANTEE`).
- **Position:** **directly above the headline — always, in every route.** Keep it tight to the
  headline; never let it drift up toward the logo/call-out. (Floating it near the top is what
  makes a layout read congested and the kicker read as not-belonging.)
- **Treatment:** small-cap mono, prefixed `//`, brand red text.
  - **On any dark background** (photographic media OR a dark/ink solid): set the kicker on a
    **white chip** (red text on white) so it genuinely pops. Red-on-black does not stand out —
    it always needs the white background behind it.
  - **On a light background** (off-white): leave it as plain red mono — no chip; the light
    surface already provides the contrast.

### Call-out — the audience tag
- The **audience-targeting** label: **"{City} Sport Parents"** (e.g. `NOBLESVILLE SPORT PARENTS`).
- **`{City}` is a per-brand / per-location variable** — it changes for every franchise
  (Noblesville, Carmel, Westfield, Indianapolis, Milford…). Keep it a single config value at
  the top of the build so one edit re-skins the whole campaign.
- **Treatment:** small-cap mono, **white text on a red chip**, always. (Contrast is the rule;
  white-on-red is the default.)
- **Position:** **below the logo** on full-bleed layouts (Route A, where the headline sits at
  the bottom); **top-right corner** on layouts where the headline is pushed to the top
  (Routes B & C), mirroring the logo at top-left. The call-out and logo own the top of the
  frame; the kicker stays down with the headline.

---

## Output spec & layout

- **Story spec: 1080×1920 (9:16)** unless a campaign states otherwise.
- **Gallery grouped by angle.** Each section names the **angle + a one-line hook**. Creatives
  sit in their row, labeled `1A / 1B / 1C…`.
- **Lightbox:** click any creative to open full-size; **← / → flip between creatives, Esc
  closes.**
- Build each creative directly editable and on-brand; don't float elements in the aether —
  every creative reads as a finished story-format ad.

