# Template-library vision — turn each Claude Design output into a reusable skill

**Date:** 2026-05-21
**Status:** Architecture agreed, sequencing decided. Implementation deferred
until current Andromeda campaign ships.

## The vision in one paragraph

Every JSX/animations design that comes out of Claude Design (claude.ai/design)
gets promoted **once** into a reusable template + slash-command skill. The
skill accepts a config (photos + copy + brand info), compiles the template,
and emits **three asset types** from a single source: 9:16 MP4 video,
hero PNG (single frame), and carousel PNG sequence. The library compounds —
each new design adds another skill to the dictionary. A higher-level
agent (or the user) picks the right skill for the brief. Result: massive
content output, every piece on-brand, none of it boring.

## Target architecture

```
jsxconversion/
├── templates/
│   ├── creative-a-the-rule/
│   │   ├── template.jsx              ← JSX with config placeholders
│   │   ├── schema.json               ← input contract
│   │   ├── animations.jsx            ← shared (bridge-enabled)
│   │   ├── music-sync.jsx            ← shared (URL-param-aware)
│   │   ├── assets/                   ← defaults / examples
│   │   └── README.md                 ← what this template does
│   ├── creative-b-watch-it/
│   ├── creative-c-three-other-places/
│   ├── audio-picker/                 ← already exists
│   └── ...                           ← grows per Claude Design output
├── music-library/                    ← already exists
├── .claude/skills/
│   ├── make-creative-a/   → /make-creative-a
│   ├── make-creative-b/   → /make-creative-b
│   ├── make-creative-c/   → /make-creative-c
│   └── ...                           ← one skill per template
└── .claude/scripts/
    ├── generate-creative.mjs         ← shared engine: config + template → MP4 + PNGs
    └── jsx-to-mp4/                   ← already exists (the renderer)
```

## What's already in place (verified 2026-05-21)

- **Renderer (`jsx-to-mp4`)** uses Puppeteer + ffmpeg. Puppeteer can natively
  produce MP4 (current), PNG screenshots (any frame, any resolution), and
  PDFs (`page.pdf()`). Adding new output formats is ~half-day per format.
- **TWEAK_DEFAULTS already exists in each creative** as the seed of a
  config block. Today it exposes ~5–7 fields:
  - A: variant, tagline, location, showHUD, showTimecode
  - B: variant, tagline, athleteName, athleteAge, showSparkline
  - C: variant, parentName, athleteName, athleteAge, splitImprovement, tagline, showPageChrome
- **Asset paths are plain strings** in JSX (`src="assets/X.jpg"`).
  Substituting them is mechanical.
- **Preview server with HTTP Range, library serving, and pre-decoded
  waveforms** is in place at `_serve_nocache.py`, mirrored to
  `templates/audio-picker/`.
- **Audio picker** with drag-to-seek + dropdown + iframe preview +
  volume control is in place. Reusable.
- **Cross-iframe `postMessage` bridge** is in `animations.jsx` already.
- **URL-param overrides** on `MusicSync` (`?musicStartAt`, `?musicVolume`,
  `?musicMute`) work for runtime config without JSX edits.

## What's still missing (concrete work)

| Task | Est. effort |
|------|-------------|
| Lift all hardcoded copy (PullQuote, MonoCaption, scene labels) into the config block of each template | ~1–2 hrs per creative |
| Lift all asset path strings into config | ~30 min per creative |
| Compile step: `config.json + template.jsx → rendered.jsx` (probably via `window.__CONFIG__` injection, not string templating) | ~half day, one-time |
| Multi-format output in the renderer: PNG-of-frame, PNG-sequence, animated GIF, PDF | ~half day per format |
| Slash-command skill scaffold + per-template wrappers (`/make-creative-{a,b,c}`) | ~half day |
| README documenting how to template-ize the *next* Claude Design output (so the pattern is self-perpetuating) | ~1 hr |

**Total to land Creative A end-to-end as a working skill: ~1 focused session.**
Each subsequent creative is mostly mechanical (~few hours each).

## Honest limits (don't pretend otherwise)

1. **Visual "looks" can't be auto-generated.** A's broadcast-doc feel, B's
   instrument cluster, C's editorial magazine — these are scene
   compositions, not parameters. **New looks require Claude Design runs
   (or hand-coded JSX).** Once a look exists as a template, infinite
   variations are free. The user is good with this — Claude Design stays
   in the workflow.
2. **Music-to-visual-beat sync** is human-in-the-loop. The audio picker
   we built is the realistic solution. Full automation is possible
   (~80% accuracy with beat detection) but probably not worth chasing.
3. **Cross-aspect-ratio design** doesn't translate freely. A 9:16
   vertical doesn't become a horizontal banner without redesign. Each
   format ideally has its own template, or accept that horizontal output
   needs a separate Claude Design run.
4. **Copy quality at scale** needs strong brand-voice prompts to stay
   consistent. Solvable (system prompts + few-shot examples), not free.
5. **Photo selection nuance** — AI keyword matching works ("sprint scene
   → sprint photo") but misses authenticity nuance. Approval step
   recommended at first.

## User's scoping decisions

| Question | Answer |
|----------|--------|
| Primary use case | **Many campaigns, many looks** — Claude Design produces new templates as needed; skills accumulate as a dictionary the agent pulls from |
| Output formats | **Vertical video (9:16) + hero static PNG + carousel statics** |
| Trigger | **Slash command, manual** for first version |
| Config input | **Both — JSON if provided, interactive prompt if not** |
| Sequencing | **Finish current campaign first**, *then* templatize Creative A as the proof |

## Sequencing — what happens in what order

### Phase 0: Finish the Andromeda campaign (next)
1. Pick start times for Creative B + C in the audio picker (waveforms
   are now pre-decoded and instant)
2. Render all three creatives to MP4 via `jsx-to-mp4`
3. Mux the chosen audio tracks into the rendered MP4s (ffmpeg
   post-process recipe in the Westfield lesson)
4. Ship the Andromeda campaign

### Phase 1: Templatize Creative A (first templatization)
Using the finished Andromeda campaign as a known-good reference:
1. `templates/creative-a-the-rule/` folder: copy current `creative-a.jsx`,
   `animations.jsx`, `music-sync.jsx`, and `assets/`
2. Lift all hardcoded copy + asset paths into `schema.json` +
   `template.jsx` with `window.__CONFIG__` reads
3. Build `.claude/scripts/generate-creative.mjs`:
   - Accept config (JSON path or interactive)
   - Validate against schema
   - Copy template files into a fresh project folder
   - Substitute config values
   - Run jsx-to-mp4 for MP4
   - Run a new "screenshot frame" path for hero PNG
   - Run that path N times for carousel PNGs
4. Build `.claude/skills/make-creative-a/SKILL.md` wrapping the engine
5. Test: produce an Andromeda-like campaign end-to-end from a config

### Phase 2: Mechanical conversion of B + C
Pattern-match the Creative A work. Should be much faster the second
and third times.

### Phase 3+ (open-ended)
- New Claude Design outputs → new templates (repeat the Phase 1 recipe)
- Eventually: an orchestrating agent that takes a brief and chooses
  which skill(s) to invoke
- Eventually: AI-assisted config generation (the agent fills in
  schema.json from a brief)
- Eventually: file-watcher / cron-based inbox for true automation
  (the user said slash-command is enough for now)

## Config schema (rough draft, to refine in Phase 1)

```json
{
  "campaign": "noblesville-launch-2026",
  "brand": {
    "logo": "assets/logo.png",
    "locations": ["Noblesville", "Carmel", "Westfield", "Indianapolis", "Milford"],
    "url": "athletesaccel.com"
  },
  "talent": {
    "athleteName": "J. Rivera",
    "athleteAge": 15,
    "parentName": "Jessica M."
  },
  "copy": {
    "tagline": "Train fast. Be fast.",
    "headlinePullQuotes": [
      { "at": 0.5, "accent": "The Truth About Youth Sports", "text": "Most facilities count reps." },
      { "at": 4.0, "accent": "The Rule", "text": "We count velocity." }
    ]
  },
  "photos": {
    "coldOpen": "photos/clap.jpg",
    "lift": "photos/squat.jpg",
    "sprint": "photos/sprint.jpg"
  },
  "audio": {
    "src": "music-library/Captain Joz - Unstoppable.mp3",
    "startAt": 14.67,
    "volume": 0.75
  },
  "outputs": {
    "video": { "format": "mp4", "aspect": "9:16" },
    "heroStatic": { "atTime": 35.5, "format": "png" },
    "carousel": { "atTimes": [3.5, 12, 22, 35, 40], "format": "png" }
  }
}
```

## Why this is the right architecture (sanity check)

- **Templates are independent units.** Each is decoupled. No shared
  monolith. Adding a template doesn't touch existing ones.
- **Skills mirror templates 1:1.** Easy mental model. An agent picking
  "the right skill" is just picking which look.
- **Renderer stays single-purpose.** `jsx-to-mp4` keeps its
  classification logic, font preflight, and frame capture. The
  generate-creative engine layers ABOVE it.
- **Config schema can evolve per-template.** Each template's
  `schema.json` defines its own contract. An agent reads the schema
  before generating a config.
- **Output formats compose.** Same compile step → multiple output
  passes. MP4 + PNG + carousel come from one source render.
- **Visual diversity scales with templates, not with skill complexity.**
  Each skill stays simple; variety lives in the template library.

## Where to find things later

- This planning doc: `planning/2026-05-21__template-library-vision.md`
- Audio picker template (already done): `templates/audio-picker/`
- Music library: `music-library/`
- Waveform cache: `<project>/.peaks-cache/`
- Existing creatives (Phase 1 targets): `Andromeda 1 - noblesville test/creative-{a,b,c}.jsx`
- Session lesson for the audio picker build:
  `lessons-learned/2026-05-21__audio-picker-and-preview-server.md`
- Renderer skill: `.claude/skills/jsx-to-mp4/`
