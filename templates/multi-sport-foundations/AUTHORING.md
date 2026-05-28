# Authoring Multi-Sport Foundations templates

Process for building each `cluster-N.jsx` template. Follow this every time so design fidelity stays consistent and we don't re-discover the same lessons per template.

## Per-template workflow

### 1. Inspect the SVG for measurable elements (FIRST, every time)

Before writing any JSX, run:

```
node scripts/inspect-svg-images.mjs "templates/multi-sport-foundations/canva-overlays/cluster - N.svg"
```

This dumps every `<image>` element in the SVG body with its rendered pixel position and size, extracted from the surrounding `<g transform="matrix(...)">` wrapper. Output looks like:

```
#0  src=663x756  → px=1907x2174 @(-391,-254)
#1  src=809x803  → px=153x152 @(465,199)
#2  src=6000x4000 → px=2930x1953 @(-698,-17)
...
```

Use this for **anything positioned as an SVG image element** — main photos, logos, banner overlays, photo cells in multi-photo layouts. These give you EXACT pixel coordinates.

### 2. Read the original PNG for rasterized-only elements

Some design elements are baked into the rasterized image layers themselves (red corner accents, decorative graphics that appear inside an image element). The SVG inspector can't see them — it only knows the outer image bounds.

For these:
- Open the original PNG side-by-side with the in-progress render
- Read the screenshot **literally** — list what you see (e.g. "4 horizontal red/black bars stacked vertically, ~340px wide top, ~180px wide bottom"). Don't pattern-match to a design concept and code that — code what's literally there.
- Iterate via the compare viewer.

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
- `../../out/cluster-N.png` — render output
- `../../out/compare/` — side-by-side comparison viewer
