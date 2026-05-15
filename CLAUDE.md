# jsxconversion

Convert JSX files (typically Claude Design output) into MP4 videos for social posting.

## How to use

Hand Claude a `.jsx` (or `.tsx`) file. Claude runs the `jsx-to-mp4` skill in
`.claude/skills/jsx-to-mp4/`, which detects the component type and dispatches
to the right renderer:

- **Remotion compositions** (`<Composition>`, `useCurrentFrame`) → `npx remotion render`
- **Animated React** (Framer Motion, CSS animations, canvas, etc.) → Puppeteer + ffmpeg
- **Static React** → single screenshot looped to target duration

Output lands in `./out/<name>.mp4` (H.264, faststart, social-ready).

## Per-file conventions

The renderer reads parameters from the JSX itself, in this order:

1. Remotion `<Composition>` props (`durationInFrames`, `fps`, `width`, `height`)
2. Top-level exported constants: `DURATION_SECONDS`, `FPS`, `WIDTH`, `HEIGHT`
3. Sibling config: `<name>.config.json`
4. Defaults: 1080×1920 (vertical), 30fps, 8s

Every component must `export default` the React element to render.

## Setup

```
npm install
```

`ffmpeg` must be on PATH. In the cloud session it's installed by
`.claude/hooks/session-start.sh`; locally, install via your package manager.

## Layout

- `.claude/skills/jsx-to-mp4/` — the skill (SKILL.md + scripts/)
- `examples/` — sample inputs
- `out/` — rendered MP4s (gitignored)
