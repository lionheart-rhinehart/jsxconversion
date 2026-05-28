---
name: jsx-to-mp4
description: Convert a JSX/TSX React component file into an MP4 video suitable for social posting. Detects Remotion vs Claude Design vs animated React vs static, reads per-file render params, runs the matching renderer, and writes to ./out/<name>.mp4. Trigger when the user hands you a .jsx or .tsx file and asks for an MP4, video, render, or social post.
---

# JSX → MP4 conversion

## The one command

```
node .claude/skills/jsx-to-mp4/scripts/render.mjs <path-to-jsx>
```

That's it. The renderer is responsible for everything: classification,
font preflight, runtime selection, frame capture, encoding, and
failure handling. Do not pre-process the JSX, substitute fonts, or
skip preflight steps — they live in `render.mjs` for a reason.

If the render fails it exits non-zero with a clear message naming what
went wrong. Pass the error back to the user verbatim. Do not "work
around" it by re-running with different parameters unless the user
asks for that.

## What the renderer does, in order

1. **Classification** — `claude-design` (uses `<Stage>` / `<Sprite>` /
   `useTime`), `remotion`, `animated`, or `static`.
2. **Parameter resolution** — `<Stage>` props → `<Composition>`
   props → exported constants → sibling `.config.json` → defaults
   (1080×1920, 30fps, 10s).
3. **Font preflight (strict, no substitution).** Every primary
   fontFamily referenced in the JSX must resolve to a real font
   binary via one of:
   - Project-shipped fonts: `<projectDir>/fonts/<Family Name>/`
   - Local cache: `<repoRoot>/fonts/<Family Name>/`
   - Google Fonts — only when the response uses
     `fonts.gstatic.com/s/` URLs. Google's `/l/font?kit=...`
     substitution path is rejected; licensed names like
     "Helvetica Neue" and "Segoe Print" come back through that
     path and are not the real font.

   Only the **primary** (first non-generic, non-vendor-prefixed)
   font in each fallback chain is enforced. Fallback fonts after
   the primary are advisory — they're never used if the primary
   loads.

   If a primary is unresolvable, the renderer halts with the family
   name and an explicit instruction to drop the .ttf into the
   project's fonts/ folder. Do not "fix" this by editing the JSX
   to remove the font reference.
4. **Runtime selection.** For `claude-design` projects, if the
   sibling `animations.jsx` exists, the shipped runtime is used.
   The renderer overrides only `Stage` (to drive time
   deterministically instead of via `requestAnimationFrame`);
   everything else (`Sprite`, `TextSprite`, `ImageSprite`,
   `RectSprite`, `Easing`, `interpolate`) is the design author's
   code, untouched. This is why renders match the Claude Design
   preview pixel-for-pixel.
5. **Frame capture.** Puppeteer steps `window.__renderTime`
   frame-by-frame and pipes screenshots straight to ffmpeg's
   stdin — no PNGs on disk.
6. **Encode.** H.264 yuv420p, faststart, CRF 20.

## Project-folder convention (Claude Design)

A Claude Design folder downloaded into the repo should contain:

- `animations.jsx` — the design runtime (Stage / Sprite / Easing / ...)
- `<name>.html` — the preview shell (Google Fonts links, CSS resets)
- One or more `variation-*.jsx` files, each ending with
  `window.<Name> = <Name>` so the renderer knows what to mount
- `assets/` — images referenced by `<img src="assets/...">`
- `app.jsx`, `design-canvas.jsx`, `screenshots/`, `uploads/` —
  unused by the renderer; safe to keep

When the user passes a path to a variation file, the renderer finds
its siblings automatically. Nothing in this skill needs to be
re-configured per design.

## Per-file render parameters

In priority order:

1. `<Stage width={W} height={H} duration={S}>` props (Claude Design)
2. Remotion `<Composition>` props
3. Exported constants: `DURATION_SECONDS`, `FPS`, `WIDTH`, `HEIGHT`
4. Sibling `<input-basename>.config.json`
5. Built-in defaults: 1080×1920, 30fps, 10s

## When something halts

| Symptom | Meaning | Fix |
|---------|---------|-----|
| `Font preflight failed: ... not available` | A primary font isn't on Google Fonts and isn't shipped in the project | Drop the .ttf into `<projectDir>/fonts/<Family Name>/` |
| `Shipped runtime not found` | Variation pointed at but `animations.jsx` missing | Re-export the full Claude Design folder |
| `Variation file does not register a global` | Missing `window.X = X` at file bottom | Add the line |
| `ffmpeg not found` | Missing system dep | `apt install ffmpeg` (or run `.claude/hooks/session-start.sh`) |

## Hand-off

When the render succeeds, deliver via `SendUserFile` with a one-line
caption (resolution + duration). Don't paste the ffmpeg log into chat.

## Iteration

If the user wants a tweak (different duration, different size, etc.),
edit the constants at the top of the JSX file (not a CLI flag —
params stay with the file) and re-run the command.
