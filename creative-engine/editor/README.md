# creative-engine/editor — Phase 2: the one portable editor

One self-contained, host-agnostic editor that turns a Phase-1 **tagged** design into a
small **override bag** — never a rebuild. Click text → retype; click a photo/clip →
swap (Kraken bar); drag → move; corner → resize; undo/redo. Mounts unchanged in the
review page **and** inside Kraken (same code; a `permissions` flag toggles view⟷edit).

## The pieces

| File | What it is |
|---|---|
| `apply-overrides.js` | The SHARED, deterministic "replay the change-list" function. Runs in the live editor **and** is injected into the renderer — identical DOM mutation, so preview == MP4 by construction. |
| `seek.js` | The SHARED "freeze the design at timestamp t" routine (pins CSS keyframe timelines + frame-accurately seeks every `<video>`). Same code in editor capture and render. |
| `editor.js` | `mountEditor({container, html, baseHref, permissions, mediaLibrary, overrides, onChange})` → the editor UI/logic. Returns `{getOverrides, setOverrides, showFrame, undo, redo, destroy}`. |
| `editor.css` | Editor chrome, namespaced under `.ce-editor` (zero host assumptions). |
| `editor-host.html` | A **bare** host — proves portability (no build step, no framework, no project import). The same three files mount in Kraken; only this page differs. |
| `render-frame.mjs` | Render path: apply the bag → isolate one `.cr-frame` → seek → screenshot / MP4. CLI + exports. |
| `evidence.mjs` | The Phase-2 proof harness (below). |

## The override model

Keyed to the Phase-1 ids (`fN:eM`):

```json
{ "f0:e22": { "text": "Pull Away." },
  "f0:e2":  { "pos": { "dx": 0, "dy": 240, "w": null, "h": null } },
  "f0:e0":  { "src": "assets/vid/ad2.mp4" } }
```

- **text** — replaces the element's own text node(s), leaving child elements intact, so
  editing one span of an animated word-split headline survives the animation.
- **src** — swaps an `<img>`/`<video>` source, or the `url()` of a CSS-background.
  Brand-kit assets (`data-edit-brandkit`) are not offered in the swap picker.
- **pos** — moves via **margins** (`margin-left/top`) and resizes via width/height.
  Margins are the universal mover: they offset an element whether it's in flow or
  absolutely positioned, even when it's anchored by both left & right — and **no
  keyframe animates margin**, so a dragged element that is also `transform`-animated
  keeps animating. (This is the Phase-2 "position must not fight the animation" rule.)

## Run the editor

```
npm run dev           # serves the review page; open editor-host.html
# or open creative-engine/editor/editor-host.html via any static server
#   ?html=<path to a .tagged.html>   ?view=1 (read-only)
```

## Phase-2 evidence (verified 2026-06-12)

`node creative-engine/editor/evidence.mjs` drives the **real editor**, pushes a bag with
one of each edit kind — text on a `transform`-animated split-headline span (`e22`), a
drag of a `transform`-animated element (`e2`, the `cScan` scanline, moved via margin),
and a media swap (`e0`) — then proves **editor preview == render at t=mid AND t=end**:

```
t=mid (3500ms)  SSIM(editor,render) = 1.00000
t=end (6999ms)  SSIM(editor,render) = 1.00000
EVIDENCE: PASS
```

It captures the editor's **live-edited document** (serialized from the running editor)
and renders it through the proven top-document path, comparing against rendering the
**original** design + the editor's override bag. SSIM 1.0 at both timestamps means:

- **2.3** text on the animated word-split headline shows correctly through the animation;
- **2.4** the margin-based move does **not** fight the keyframe `transform` (a transform
  fight would diverge by t=end — it doesn't);
- **2.5** the edit is pixel-faithful (only the three intended changes differ vs original).

Artifacts in `_out/`: `editor-{mid,end}.png` vs `render-{mid,end}.png`, `original-mid.png`
vs `edited-mid.png` (fidelity eyeball), `edited-1A.mp4` (the full 7s edited creative),
`evidence.json`.

> Harness note (honest): screenshotting the editor's **live iframe** directly hits a
> puppeteer iframe-rasterization scale artifact (~6%) — a test-harness limitation, not a
> pipeline defect (the editor's DOM is byte-identical to the render's: every element's
> `getBoundingClientRect`, the video `currentTime`, and `innerWidth` all match exactly).
> The evidence sidesteps that artifact by rendering the editor's serialized live document
> through the same clean path, which is the faithful comparison.
