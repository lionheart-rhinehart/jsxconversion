# AA Video Templates

A library of **72 brand-locked animated video templates** and **22 reusable signature
elements** for Athletes Acceleration social content — implemented from the Claude Design
handoff "template creation - test run" (`Video Templates Gallery.html`).

Built on top of [`brand/aa-design-system/`](../aa-design-system/) (the visual system:
colors, type, components). This folder is the *templates* layer that sits on that system.

## Quick start

The pages load `.jsx` via Babel-standalone over XHR, which browsers block under `file://`.
Serve over HTTP:

```bash
node brand/video-templates/serve.mjs
# then open the printed http://localhost:5599/ URL
```

Three browseable pages:

| Page | What it is |
|---|---|
| **Video Templates Gallery.html** | Scrollable index of all 72 templates, grouped into 11 content pillars. Click any card → fullscreen preview + live **Tweaks** edit panel (text fields, photo/video drop with trim + audio, loop-length slider). Edits persist per-template in `localStorage`. |
| **Elements Library.html** | The 22 signature elements (gauges, charts, tickers, cinematic effects) shown animating in isolation, each with its `id` and prop list. |
| **Social Video Templates.html** | The original pannable design-canvas view (spatial comparison). |

## Layout

```
video-templates/
├── Video Templates Gallery.html   # primary index page (start here)
├── Elements Library.html          # element catalog
├── Social Video Templates.html    # pannable canvas view
├── serve.mjs                      # static server (gallery needs HTTP)
├── animations.jsx                 # runtime: Stage, Sprite, useTime, Easing, interpolate…
├── editing.jsx                    # Tweaks panel: useTemplateEdits, EditPanel, TrimmedMedia
├── design-canvas.jsx              # canvas chrome for the Social page
├── elements/   (22 .jsx)          # signature elements
├── templates/  (72 .jsx)          # the templates
└── assets/                        # logo, fonts, brand photography, aa-tokens.css
```

## How a template is wired

Each template is a plain `<script type="text/babel">` module that registers itself on
`window`, so the gallery's catalog can reference it:

```jsx
function PRAlertReel({ data }) { /* … uses useTime(), Easing, Sprite, etc. */ }
const PR_ALERT_SPEC = { id: 'pr-alert', name: 'PR ALERT', fields: [ /* editable fields */ ] };
window.PRAlertReel = PRAlertReel;
window.PR_ALERT_SPEC = PR_ALERT_SPEC;
```

`animations.jsx` and `editing.jsx` expose the shared runtime via `Object.assign(window, …)`.
The gallery (`Video Templates Gallery.html`) holds the catalog arrays (`REELS`, `SQUARES`,
`HORIZ`) that map each `id` to its component + spec, and renders the cards / modal.

- **64** reels (9:16 · 1080×1920), **4** square (1:1 · 1080×1080), **4** horizontal (16:9 · 1920×1080).
- **Signature elements:** velocity-meter, sprint-trace, scoreboard, calendar-fill, slot-roll,
  live-poll, caption-bars, audio-waveform, anatomy-callouts, leaderboard, trajectory-arc,
  tier-list, hr-zones, comic-panels, stopwatch, bracket, comparison-slider, radar-chart,
  star-rating, macro-ring, confetti-burst, streak-flame.

## Editing a template

Open the gallery, click a card with the red **EDITABLE** badge, and use the Tweaks panel:
type copy into fields, drop a photo or short clip onto a media slot (drag the trim window,
toggle mute/native audio), and set the loop length. Changes persist in `localStorage` per
template; **RESET** reverts. To post, screen-record one full loop of the fullscreen preview.

> Media uploads live in browser `localStorage` (~5 MB cap, shared across all edits). Keep
> clips short and compressed; the panel shows a storage warning before it overflows.

## Rendering to MP4 (future)

These templates use the same Claude Design `<Stage>` / `<Sprite>` / `useTime` runtime the
repo's `jsx-to-mp4` skill already supports, so wiring individual templates into the renderer
(JSX → MP4) is a natural follow-up — it is **not** done yet. Today this folder is a
browse / preview / in-browser-edit library.

## Provenance

Exported from Claude Design (`claude.ai/design`), project "template creation - test run".
Full design conversation is preserved in the repo at the bundle's `chats/` (see git history
for the `.design-bundle` import).
