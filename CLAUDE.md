# aa-creative-engine

Creative engine for **Athletes Acceleration** (youth sports performance, ages 8–18, locations across IN + OH). Turns JSX templates into branded ad creatives — vertical videos for Reels/Stories/Shorts and static images for feed posts — ready for Meta/Facebook campaigns.

## Two outputs, one source

The same JSX template can produce:

- **MP4 video** (default — animated React, Remotion, or Claude Design output)
- **Static PNG/JPG** (single frame, lifted from the first paint or a specified `t=` mark)

Both run through the same renderer; the output mode is per-file.

## How to use

Hand Claude a `.jsx` (or `.tsx`) file. Claude runs the `jsx-to-mp4` skill in
`.claude/skills/jsx-to-mp4/`, which detects the component type and dispatches
to the right renderer:

- **Remotion compositions** (`<Composition>`, `useCurrentFrame`) → `npx remotion render`
- **Claude Design** (`<Stage>` / `<Sprite>` / `useTime`) → puppeteer + shipped runtime
- **Animated React** (Framer Motion, CSS animations, canvas, etc.) → Puppeteer + ffmpeg
- **Static React** → single screenshot (looped if MP4 output requested)

Output lands in `./out/<name>.mp4` (or `.png`/`.jpg` for static).

## Brand

`brand/` is the single source of truth for Athletes Acceleration identity — colors, type, fonts, voice, photography, and reusable React components. **Read `brand/README.md` and `brand/aa-design-system/project/README.md` before authoring any new creative.** The kit defines:

- Brand red `#c4141d`, ink scale, chrome accent
- Type: Anton (display), Geist (body), JetBrains Mono (mono/metrics)
- Voice: head-coach-to-parent, declarative, metric-driven, no emoji/exclamation points
- The guarantee: **+1 mph speed, +3" vertical, 90 days, or training is free** (verbatim, never paraphrased)
- Three pillars: ACCELERATE (speed), DOMINATE (strength), UNLEASH (power)

## Per-file render parameters

The renderer reads parameters from the JSX itself, in this order:

1. `<Stage>` props (Claude Design)
2. Remotion `<Composition>` props
3. Top-level exported constants: `DURATION_SECONDS`, `FPS`, `WIDTH`, `HEIGHT`
4. Sibling config: `<name>.config.json`
5. Defaults: 1080×1920 (vertical), 30fps, 10s

Every component must `export default` the React element to render.

## Setup

```
npm install
```

`ffmpeg` must be on PATH. In the cloud session it's installed by
`.claude/hooks/session-start.sh`; locally, install via your package manager.

## Layout

- `.claude/skills/jsx-to-mp4/` — the renderer skill (SKILL.md + scripts/)
- `brand/` — Athletes Acceleration design system, fonts, photos, components
- `fonts/` — font binaries (Anton, Geist, JetBrains Mono, etc.) for the renderer's font preflight
- `templates/` — reusable JSX scaffolds for common ad formats
- `examples/` — sample inputs
- `out/` — rendered creatives (gitignored)

## Campaign workflow (manual, for now)

Today this is a Claude-Code-driven workflow: hand Claude a campaign brief in chat, it authors JSX templates per angle, the renderer produces MP4s + statics, you ship them. After a handful of campaigns produce repeatable patterns, the next step is wrapping this in a Claude Agent SDK service for autonomous brief-in / creatives-out.
