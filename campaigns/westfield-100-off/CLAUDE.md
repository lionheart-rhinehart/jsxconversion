# Project — Westfield Founding Member Campaign ($100 Off)

Paid-social creative for **Athletes Acceleration** (AA), youth sports-performance training, promoting the new **Westfield, IN** flagship and its founding-member offer: **first 40 athletes lock in $100 off for life**.

## Design system
Bound design system: **Athletes Acceleration Design System** (`_ds/athletes-acceleration-design-system-019e2d4d-351e-7568-9022-254263b133e3/`).
- Load `colors_and_type.css` in `<helmet>` for brand tokens.
- Type: **Anton** (display, ALL CAPS, line-height 0.8–0.9), **JetBrains Mono** (eyebrows, `//` code-comment kickers, all stats/metrics, tabular nums), **Geist** (body).
- Color: brand red `#c4141d` used surgically (accents, CTA, eyebrows, markers) — never as a full-bleed background, never on body copy. Ink `#0a0b0d`, off-white `#f3f2ed` canvas, white. Chrome is a finishing accent only.
- Logo: `assets/logo.png`, ≥64px tall. It reads on dark only — on light canvases place it inside a dark badge/bar.
- Icons: Material Symbols Rounded only. **No emoji, no exclamation points, no SVG illustration sets.**

## Voice
Head coach talking to a parent who wants the truth. Second person to parents ("your kid", "your athlete"), first-person-plural for the brand ("we build"). Declarative, short, often fragments. No hedging.
- **Gender-neutral always** — they/their/them, never he/she.
- **Guarantee, verbatim, never paraphrased:** "+1 mph speed. +3" vertical. 90 days. Or your training is on us." (The approved Westfield ad copy phrases the window as **30 sessions** — match the copy.)
- Offer line: **First 40 · $100 off for life · $1,200/year.**

## THE PAID-SOCIAL CREATIVE MATRIX

> This framework governs every paid-social campaign built on this brand kit. Read it before
> building any campaign creative.

Every Athletes Acceleration campaign is built as a **creative matrix**: a grid where each
row is a *messaging angle* and each column is an *execution route* of that same angle.
Routes are defined by **media-coverage band** — how much of the canvas photographic/video
media physically covers. That is the measurable axis that drives visual differentiation
(and is what duplicate-detection / creative-clustering tools score), so define routes by
coverage, NOT by vibe.

```
              ROUTE A            ROUTE B            ROUTE C
           full-bleed media   partial media       no media
            (~70%+ canvas)    (~20–50% canvas)    (0% photo media)
          ┌────────────────┬────────────────┬────────────────┐
  ANGLE 1 │  1A            │  1B            │  1C            │
          ├────────────────┼────────────────┼────────────────┤
  ANGLE 2 │  2A            │  2B            │  2C            │
          ├────────────────┼────────────────┼────────────────┤
  ANGLE 3 │  3A            │  3B            │  3C            │
          └────────────────┴────────────────┴────────────────┘
```

### The vocabulary (use these exact terms)
- **Angle** — the *messaging* hook / reason-to-believe. NOT a visual. Hold it constant
  across every route in its row. (e.g. "Slow isn't genetics — it's a missing foundation,
  and it's fixable now" · "We measure — proof, not a coach's word" · "The guarantee".)
- **Route / Execution / Direction** — a distinct *visual treatment* of the same angle,
  defined by how much media covers the frame:
  - **Route A · full-bleed media** — real brand footage/photo covers ~70%+ of the
    canvas, with an overlay treatment styled to AA's system (Anton display, JetBrains
    Mono eyebrows, brand-red accents, bottom-up protection gradient, caption bar /
    lower-third — whatever fits). Looks like a camera feed. **A is the control — it is
    always full-bleed media and never changes format.**
  - **Route B · partial media** — media occupies a bounded zone (~20–50%: a strip,
    circle, split panel, soft mask); **type carries the structure.** The *creative idea*
    here is open — kinetic typography is a common default but not required; pick whatever
    best serves that specific angle.
  - **Route C · no media** — 0% photographic/video media. Pure typographic + brand-color
    / graphic composition (a logo mark or icon is fine; footage/photos are not).
    Strongest for stat/proof/bold-claim angles; weakest for emotional angles that need
    a face — so C is **available for every angle but only shipped where it serves the
    message**, never forced just to fill the grid.
- **Labeling** — `{angle-number}{route-letter}`: `1A 1B 1C 2A 2B 2C …`. **Number = angle,
  letter = route.** This labeling is what makes it a matrix, not a pile of ads — always
  use it.

### Coverage & differentiation rules (what the cluster bot scores)
- Treat the coverage bands above as concrete targets, not moods. A ≈ 70%+, B ≈ 20–50%,
  C = 0% photographic media.
- **Never reuse one asset rescaled across routes.** Each route uses different source
  media (or none) and a different dominant composition + color field — coverage % alone
  won't beat clustering if it's the same hero photo at three sizes.

### Within-route variety — THE most important rule, do not skip
**A route is a CONSTRAINT (a coverage band), NOT a template.** The single biggest failure
mode is building one master layout per route and stamping it across every angle (every A
identical, every B identical) — that's a template grid, not a creative matrix, and the
cluster bot AND humans both read it as duplicate. Instead, **every single cell is its own
independently-designed composition.** Two cells in the same route must differ in:
- **layout & focal anchor** (where the headline sits, where media sits, the grid)
- **motion language** (for video) — e.g. light-sweep vs. clip-wipe vs. count-up vs.
  typewriter vs. cinematic film-bars vs. scale-in mask. Never the same animation twice.
- **type treatment** (scale, all-caps kinetic vs. soft script, stacked vs. contrast pair)
- **dominant color field** (accent panel vs. near-black vs. brand-neutral)

A menu of distinct compositions to vary against (use as inspiration, never as a template
to repeat): HUD/overlay + timecode + light-sweep · vertical media strip + giant count-up
number · sliding live stat-cards over a clip · "X vs Y" type contrast + circle-masked
clip · cinematic film-bars + centered line · letter-by-letter typewriter testimonial +
soft-masked clip · big-numeral proof card (no media) · split-screen before/after · word-
swap (SLOW→FAST) · strike-through claim · filling stat gauge · populating data table.
Pick the composition that best serves each angle, and make sure no two cells share one.

The brief stays short ("new FB campaign, make them unique") — this rule lives HERE so the
model supplies the variety without you having to spell it out each time.

### Video deliverables = REAL motion design, never a clip with dead text
**The #1 failure on the video set: dropping a looping `<video>` behind STATIC text.** That
is a captioned clip, NOT an animated video, and it is banned. A video creative is **motion
design on a master timeline where every element animates** — the background footage is the
*floor*, not the animation. This applies to Route A too: a held caption over a playing
clip is the banned "captioned clip."

Every video cell MUST have:
- **A master loop** — one cycle length (≈6–9s) that repeats seamlessly (no hard jump at
  the loop point; fade/exit elements before the wrap).
- **Timed, staggered entrances for every text/graphic element** — nothing just "appears."
  Words/lines rise, fade, wipe, or scale in on their own offset (e.g. eyebrow at 0.4s,
  word 1 at 0.7s, word 2 at 1.0s…).
- **At least one signature motion device per cell**, and a DIFFERENT one each time (ties
  to within-route variety): kinetic word-by-word reveal · count-up numeral (0 → stat) ·
  typewriter text · horizontal light-sweep · clip-wipe / clip-path reveal · cinematic
  film-bars sliding in · scale-in masked clip · live stat-cards sliding/counting.
- **The footage itself playing** (autoplay muted loop), but treated as the backdrop — the
  *creative* is what animates on top of it.

How it's built (technique): a single master cycle constant; **WAAPI
(`element.animate(..., { iterations: Infinity })`)** or CSS `infinite` keyframes for
transform/opacity entrances with per-element start offsets; **`requestAnimationFrame`**
for count-ups and typewriters; all timelines pinned to one shared start so they stay in
sync and loop forever. If unsure how to build animated HTML, use the **Animated video**
skill and the `animations.jsx` starter — do NOT hand-place static text over a clip.

A quick gut-check before shipping any video cell: *if I paused the footage, is anything
still moving / revealing / counting?* If no, it's not done.

**First-frame-safe motion (reconciles "always readable" with "everything animates").**
A paid-social ad must read as a finished ad on its *first frame* too — a scroll-stopper's
glance, a still export, a PDF, or a build preview that freezes animation at frame 0 must
never show blank/half-built type. So: **design each animated element's resting / loop-start
(0%) state to already be the complete, on-brand composition, then animate it on the loop
from there.** Build the end-state as the base; let the loop depart and return to it. This
satisfies both rules at once — paused mid-loop something is always moving, AND any frozen
frame is fully legible. (Practically: don't leave structural copy at `opacity:0` waiting on
a one-shot entrance; make the featured device the thing that perpetually animates.)

### Each creative is designed from scratch
Do not reuse one design per route. Every cell is a distinct layout AND (for video) a
distinct motion. Design each cell from scratch.

### Why
Hold the *message* constant and vary the *form* so we can read, independently, **which
angle resonates** and **which media-density format converts**. It's built for systematic
A/B testing across the funnel.

### How to lay it out
- Gallery grouped **by angle** (one section per angle, all routes side by side).
- Each section header names the angle + its one-line hook.
- Click any creative to open it full-size in a lightbox (← → to flip between all, Esc to
  close).
- Story/social spec is **1080×1920 (9:16)**; respect the safe-area for platform UI.

### Default scope when asked for "a campaign"
3 angles, each with **Route A (always) + the best 1–2 of Routes B/C** for that angle —
so ~6–9 creatives. Ship the full A/B/C for an angle only when C genuinely serves it.
Static set and video set are separate deliverables that share the same matrix.

**Testing-setup caveat:** if these run as **dynamic creative / Advantage+** (one ad set,
the platform picks winners), lean toward full A/B/C coverage — variety helps. If they run
as **manual isolated A/B ad sets** (one creative per ad set), stay lean (A + one
alternate) so budget isn't split across starving cells in the learning phase. Ask which
when unsure.

### Reference implementations in this project
- **`Westfield Campaign.dc.html`** — Campaign A. 12 angles × A/B/C (36 creatives); the
  baseline matrix with the kicker/call-out system and lightbox. Predates the
  within-variety + real-motion rules — it uses one consistent layout per route, so treat
  it as the original control, NOT as a model for new work.
- **`Westfield Campaign B.dc.html`** — Campaign B. The same 12 angles (36 creatives)
  rebuilt to the within-variety + from-scratch rules: **36 unique layout shells, none
  repeated**, each with its own CSS-keyframe motion device (ladder climb, lower-third
  slide, founding seal, word-flip, EKG draw, savings reel, depleting gauge, map-pin drop,
  etc.). A footage-led, B bounded-media, C kinetic type. Use it as the model for "every
  cell its own composition."

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
  Match the clip/photo to the angle's message. Always copy assets into the deliverable's
  folder — never hot-link across projects.

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



---

## Brand
Everything in `readme.md` is authoritative for voice, color, type, logo, and components.
The look: hard-contrast athletic editorial — ALL-CAPS condensed Anton headlines (one word
in brand red), near-black/ink surfaces against off-white canvas, surgical `#c4141d` red,
mono `//` kickers and tabular stats, cool desaturated gym footage. Confident, not hype.
No emoji, no exclamation points.
Always copy assets into the deliverable's folder — never hot-link across projects.


## Approved ad copy
`uploads/westfield - $100 off - ad copy- approved-60bfb71d.md` — 12 angles (AIDA, 4Cs, QUEST). Ad numbers in the file (1,2,3,4,6,7,8,10,11,12,13,14) map to assets `assets/vid/ad{N}.mp4` + `assets/img/ad{N}.jpg`.

## Deliverables in this project
- **`Westfield Campaign.dc.html`** — Campaign A. 36 creatives, one consistent layout per route.
- **`Westfield Campaign B.dc.html`** — Campaign B. 36 creatives, **every cell a unique layout + its own CSS motion** (keyframe library in `<helmet>`). Same 12 angles, copy matched cell-by-cell (1A/1B/1C = Ad 1, etc.).
Both are dark gallery shells grouped by angle, with a click-to-open lightbox (←/→ flip, Esc close). Cells are 1080×1920 frames scaled via JS (`scaleCards`).

## Conventions
- Build everything as a Design Component (`.dc.html`); inline styles only; `@keyframes` live in `<helmet>`, applied via inline `animation:`.
- Copy assets into the project; don't reference the design system folder directly in output.
- These are story-ad creatives composed from brand tokens — not web UI. The DS-bundle oxlint nudge does not apply here (the marketing-site React components aren't used); loading `colors_and_type.css` is the correct, intentional choice.
