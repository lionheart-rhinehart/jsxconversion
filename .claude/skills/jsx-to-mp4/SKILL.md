---
name: jsx-to-mp4
description: Convert a JSX/TSX React component file into an MP4 video suitable for social posting. Detects Remotion vs animated React vs static, reads per-file render params, runs the matching renderer, and writes to ./out/<name>.mp4. Trigger when the user hands you a .jsx or .tsx file and asks for an MP4, video, render, or social post.
---

# JSX → MP4 conversion

When the user gives you a `.jsx` or `.tsx` file and asks for an MP4 (or any
phrasing implying video output — "render it", "make it a video", "for
Instagram/TikTok/Reels"), run this skill.

## Steps

1. **Locate the input file.** If the user pasted JSX inline or attached
   via an upload path, copy it into `examples/<short-name>.jsx` first.
2. **Ensure deps are installed.** Run `npm install` if `node_modules/` is
   missing. Confirm `ffmpeg` is on PATH (`ffmpeg -version`). On a fresh
   cloud session the SessionStart hook handles ffmpeg; locally, ask the
   user to install if missing.
3. **Font preflight — REQUIRED, before any render.** Designs are authored
   against specific typefaces and must not fall back to system fonts.
   `scripts/fonts.mjs` (`detectFonts` + `ensureFontsForFile`) scans the
   JSX for `fontFamily` declarations, filters out CSS generics
   (`sans-serif`, `monospace`, etc.), and for each remaining family
   checks `fonts/<Family_Name>/`. Any missing family is downloaded from
   Google Fonts (CSS + TTF binaries) into the repo and cached there. The
   renderer invokes this automatically at startup; if you're running the
   step manually for diagnosis use:
   ```
   node -e "import('./.claude/skills/jsx-to-mp4/scripts/fonts.mjs').then(m => m.ensureFontsForFile('examples/<file>.jsx', '/tmp')).then(r => console.log(r))"
   ```
   If a download fails (404 — font not on Google Fonts, or no network),
   STOP. Don't substitute. Tell the user which font couldn't be sourced
   and ask how to proceed (drop the file into `fonts/<Family_Name>/`
   manually, or change the design).
4. **Run the renderer:**
   ```
   node .claude/skills/jsx-to-mp4/scripts/render.mjs <path-to-jsx>
   ```
   Handles classification (Claude Design / Remotion / animated / static),
   parameter resolution, bundling, capture, and ffmpeg encoding.
5. **Verify the output.** Check `out/<name>.mp4` exists and is non-empty.
   Report duration, resolution, and fps from the script's stdout.
6. **Hand off.** Use `SendUserFile` to deliver the MP4 with a one-line
   caption (resolution + duration).

## Per-file render parameters

The renderer reads parameters in this priority order:

1. Remotion `<Composition>` props (`durationInFrames`, `fps`, `width`, `height`)
2. Top-level exported constants in the JSX file:
   - `export const DURATION_SECONDS = 10`
   - `export const FPS = 30`
   - `export const WIDTH = 1080`
   - `export const HEIGHT = 1920`
3. Sibling JSON: `<input-basename>.config.json` with the same keys
4. Built-in defaults: 1080×1920, 30fps, 8s

## Conventions the JSX must follow

- **Must `export default`** the React component (or a Remotion `RemotionRoot`).
- **Self-contained:** any extra deps the JSX imports must already be in
  `package.json` or be one of the pre-installed packages (react, react-dom,
  framer-motion, remotion). If a JSX file imports something exotic, add it to
  `package.json` and `npm install` before rendering.
- **Static components** are rendered as a single frame looped to
  `DURATION_SECONDS`. If the component animates via CSS keyframes or JS
  timers, classify it as animated instead (see classifier heuristics in
  `scripts/classify.mjs`).

## Common pitfalls

- **Fonts:** handled by the preflight in step 3. Components reference
  fonts via `fontFamily: 'Anton, ...'` — the design author doesn't need
  to add `@font-face`; the preflight downloads and wires it up. Cached
  in `fonts/<Family_Name>/`.
- **Aspect ratio mismatch:** if WIDTH/HEIGHT don't match the component's
  layout, you'll get letterboxing. Default is vertical (1080×1920) for
  Reels/TikTok/Shorts. For square posts, set `WIDTH=1080 HEIGHT=1080`.
- **Long renders:** animated renders are roughly real-time-per-second of
  output. A 30-second 1080p video takes ~30s+ to render. Don't time out
  the bash call; pass `timeout: 600000` for anything over 30 seconds of
  output duration.

## When the user wants to iterate

If the output isn't right (wrong duration, wrong size, animation cut off),
ask which parameter to change, edit the constants at the top of the JSX
file (not a CLI flag — keep params with the file so they persist), and
re-run the render command.
