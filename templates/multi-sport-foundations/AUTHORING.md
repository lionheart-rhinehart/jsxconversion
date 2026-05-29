# Authoring Multi-Sport Foundations templates

Process for building each `cluster-N.jsx` template. Follow this every time so design fidelity stays consistent and we don't re-discover the same lessons per template.

## Per-template workflow

### 1. Inspect the SVG for measurable elements (FIRST, every time)

Before writing any JSX, run **both** inspectors — images AND rects:

```
node scripts/inspect-svg-images.mjs "templates/multi-sport-foundations/canva-overlays/cluster - N.svg"
node scripts/inspect-svg-rects.mjs   "templates/multi-sport-foundations/canva-overlays/cluster - N.svg"
```

**`inspect-svg-images.mjs`** dumps every `<image>` element in the SVG body with its rendered pixel position and size, extracted from the surrounding `<g transform="matrix(...)">` wrapper:

```
#0  src=663x756  → px=1907x2174 @(-391,-254)
#1  src=809x803  → px=153x152 @(465,199)
#2  src=6000x4000 → px=2930x1953 @(-698,-17)
...
```

Use this for **anything positioned as an SVG image element** — main photos, logos, banner overlays, photo cells in multi-photo layouts. These give you EXACT pixel coordinates.

**`inspect-svg-rects.mjs`** dumps every fill `<rect>` and classifies each as `BLEED` (achromatic full-frame background — skip), `TINT` (full-frame **color filter** — design-critical), or `block` (normal banner/band/panel). The image inspector can't see rects, so without this step a **full-frame color tint is invisible** — and that is exactly how cluster-8a originally lost its red wash.

**If you see a `⚠ TINT`:** Canva creates the colored-filter look by laying a SOLID full-frame brand-color rect (e.g. `#ed1c24`) *behind* a semi-transparent photo, so the color bleeds through and tints the whole image. In our opaque-layer model the photo isn't transparent, so you reproduce the tint as a **semi-transparent overlay rect ABOVE the background photo** (a `fixedDesign` rect), at a low `z` that sits **below** any foreground cutout / headline — so only the background gets tinted and the athletes & text stay crisp (this matches the original). Start from the `rgba(...)` the inspector prints, then tune the exact alpha with `sample-fill.mjs` (step 2.5). The auto-scaffolder (`scaffold-cluster.mjs`) does this for you automatically and records the to-do in `config._notes.tints`.

### 2. Read the original PNG for rasterized-only elements

Some design elements are baked into the rasterized image layers themselves (red corner accents, decorative graphics that appear inside an image element). The SVG inspector can't see them — it only knows the outer image bounds.

For these:
- Open the original PNG side-by-side with the in-progress render
- Read the screenshot **literally** — list what you see (e.g. "4 horizontal red/black bars stacked vertically, ~340px wide top, ~180px wide bottom"). Don't pattern-match to a design concept and code that — code what's literally there.
- Iterate via the compare viewer.

### 2.5 Match shape fills from the source — never eyeball gradients/solids

Any `rect` layer with a color `fill` (solid blocks, gradient bands) must have its
fill **sampled from the source render**, not estimated by eye. Eyeballing a gradient
gets the direction and brightness wrong (e.g. a bright-red→dark fade is easy to invert,
and Canva's reds run far darker than they look). The tool reads the actual pixels:

```
node scripts/sample-fill.mjs out/compare/cluster-N-original.png \
  --config templates/multi-sport-foundations/cluster-N.config.json --id <rectId> --apply
```

What it does:
- Reads the rect's geometry straight from the config (by `id`), samples that region of
  the source render, and emits a paste-ready `"fill": "..."`.
- Auto-detects **solid vs gradient** and the **gradient axis** (vertical `180deg` /
  horizontal `90deg`).
- Takes the **median color across each sample band**, so centered text or a logo sitting
  on top of the fill doesn't pollute the reading.
- **Repairs endpoint bleed**: if a neighboring opaque layer (usually the background photo)
  overlaps the rect's declared top/bottom edge, the contaminated end stop is extrapolated
  back onto the gradient trend instead of trusting the bleed.
- `--apply` writes the fill back into the config rect; omit it to just print and eyeball
  the result first.

Use `--rect x,y,w,h` instead of `--config/--id` for an ad-hoc region. After applying,
re-render and confirm in the compare viewer (step 6).

### 3. Compose JSX with helpers from `_helpers.jsx`

All shared patterns live in `_helpers.jsx`:

| Helper | Use for |
|---|---|
| `<Frame>` | Outer 1080×1920 container |
| `<MediaSlot>` | Photo OR video, unified slot |
| `<ArchedHeadline>` | Curved display text via SVG textPath (numeric `arch` for control) |
| `<TextOverlay>` | Microscript / title / any positioned text |
| `<CornerAccent>` | Stacked horizontal red/black bars (cluster-1 originally; rarely needed) |
| `<HairlineRule>` | Thin horizontal red line |
| `<CityHeadline>` | Large stacked city name (cluster-8 / 8a / 12) |
| `<DarkProtectionGradient>` | Subtle wash for legibility |

Brand tokens (`AA_RED`, `WHITE`, `INK_950`, `FONT_DISPLAY`, `FONT_MONO`, etc.) are exported from `_helpers.jsx` — import them, don't redeclare.

### 4. Editable variables at the top of the file

Every template exposes its variables as constants directly under the `export const WIDTH/HEIGHT`:

```jsx
const MEDIA_PATH = "./assets/...";       // image or video
const HEADLINE_TOP = "FOUNDATIONAL";     // for FYP templates
const HEADLINE_MID = "YOUTH";
const HEADLINE_BOT = "PROGRAM";
const MICROSCRIPT_1 = "...";
const MICROSCRIPT_2 = "...";             // if applicable
const TITLE = "...";                     // if applicable
const CITY = "...";                      // for city templates
```

Don't bury values in component props — surface them at the top.

### 5. Add font preflight markers (REQUIRED)

The renderer's font preflight scans the entry file for literal `fontFamily:` patterns. Without these markers fonts referenced via `_helpers.jsx` imports are missed and the browser falls back to sans-serif:

```jsx
const _FONT_PREFLIGHT = {
  display: { fontFamily: "'Anton', 'Oswald', sans-serif" },
  mono: { fontFamily: "'JetBrains Mono', ui-monospace, monospace" },
};
```

Drop these in any template that uses Anton or JetBrains Mono via the helpers.

### 6. Render and review

```
node .claude/skills/jsx-to-mp4/scripts/render.mjs templates/multi-sport-foundations/cluster-N.jsx
cp out/cluster-N.png out/compare/cluster-N-rendered.png
```

Open `out/compare/compare.html` and compare against `cluster-N-original.png`.

## Fidelity bar (per user agreement)

- **Pixel-perfect not required** — we accept "best we can in reasonable time"
- Composition, brand tokens, type, photo positioning should all match closely
- Decorative accents (corner shapes, exact gradients) can be approximate or omitted if they don't read as design-critical
- The user will reject anything "not in the same ballpark" — iterate until same ballpark, then move on

## Anti-patterns to avoid

- **Don't eyeball gradient/solid fills.** Sample them from the source with `scripts/sample-fill.mjs` (step 2.5) — eyeballing inverts gradient direction and overshoots brightness
- **Don't skip the rect inspector / drop a full-frame color tint.** A brand-color full-frame rect is a *color filter* (Canva puts it behind a semi-transparent photo), not a background — it looks identical in geometry to the throwaway white/black bleed but is design-critical. Run `inspect-svg-rects.mjs` (step 1) and reproduce any `⚠ TINT` as a semi-transparent overlay. This is how cluster-8a lost its red wash; the inspector + scaffolder now catch it, but never override the warning.
- **Watch lettered variations (8a, 2a…).** They don't automatically inherit the sibling cluster's brand layers (tint, banner). Re-run both inspectors on the variation's own SVG rather than assuming it matches the base.
- **Don't pattern-match design concepts.** Read the original literally — "4 horizontal red bars" not "corner accent decoration"
- **Don't add elements that aren't in the original.** Especially defensive ones like protection gradients where the original has none
- **Don't keep iterating fidelity past "ballpark"** — diminishing returns. The user will call out specific things they want refined
- **Don't skip the SVG inspector** — it's faster than visual estimation for anything image-positioned

## Where things live

- `canva-overlays/cluster - N.svg` — original Canva SVG exports (source of truth for image positions)
- `_helpers.jsx` — shared components and brand tokens
- `cluster-N.jsx` — per-template JSX (top-level editable variables, helper composition)
- `assets/` — photos, logos referenced by templates
- `_archive-option-b/` — earlier SVG-composite attempt (kept for reference, not used)
- `../../scripts/inspect-svg-images.mjs` — SVG image-position extractor
- `../../scripts/inspect-svg-rects.mjs` — SVG fill-rect extractor; classifies bleed / **color tint** / block (run alongside the image inspector in step 1)
- `../../scripts/sample-fill.mjs` — samples a rect's fill (solid/gradient) from the source render → paste-ready `fill`
- `../../out/cluster-N.png` — render output
- `../../out/compare/` — side-by-side comparison viewer
