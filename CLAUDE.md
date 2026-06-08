# aa-creative-engine

Creative engine for **Athletes Acceleration** (youth sports performance, ages 8–18, locations across
IN + OH). Turns JSX templates into branded ad creatives — vertical videos for Reels/Stories/Shorts and
static images for feed posts — ready for Meta/Facebook campaigns.

This file is the **handbook**: the standing rules + a map, loaded into every chat. It *points to* the
detailed manuals (`docs/PROCESS.md`, `docs/MAP.md`) rather than repeating them. For the full
where-everything-lives map and naming detail, see **`docs/MAP.md`**.

---

## How we work together (rules, not suggestions)

These four are binding for every chat on this repo. They exist because each one has bitten us before.

1. **Explain at a marketer's level.** Cody is a marketer, not a developer. Introduce any technical
   idea (git, branches, hooks, renders) in plain language with a concrete analogy *from the first
   sentence* — proactively, and define each term on first use. Don't wait to be asked.

2. **Git workflow — work in `main`, finish by deploying.** (Analogy: one shared desk, and you always
   file your work in the cabinet before you leave.)
   - Keep the Claude Desktop **worktree toggle OFF** → every chat works in the **one `main` checkout**.
   - Session start auto-syncs (`git pull --ff-only`) via the SessionStart hook — no action needed.
   - **Finish every session with `/full-deploy-light`** (on `main` it commits + pushes, no PR).
   - **Never end a session on `/save-progress`** — it commits locally *without pushing*, stranding the
     work. `/save-progress` is a mid-work checkpoint only.

3. **Parallel chats — split only when you must, and only through git.** Default is the single shared
   `main` checkout (rule 2). Run a **separate worktree per chat** *only* when two chats genuinely work
   at once on **different files** — then follow **`docs/parallel-chats.md`** and start the second one
   with `./scripts/new-workspace.ps1 <name>`. **Never copy files between checkouts** — combine through
   commit + merge, never by copying folders (that silently overwrites uncommitted work).

4. **Creative-engine non-negotiables.** `docs/PROCESS.md` is the canonical end-to-end map — read it
   before touching campaign intake, planning, the review page, or the render runner. And:
   - **Each creative MIRRORS its example's media.** The engine builds a new design modeled on a
     chosen example; if that example carries media (a real image/video/clip from Kraken), the new
     design must too — if the example is media-free (a graphic/data-viz design), the new design may
     be too. Enforced in `validate-plan.mjs` (Law #0 keys on the bound example's `mediaStyleAccepts`).
     *(Supersedes the old blanket "every creative carries media / no bare type cards" — the
     2026-06-06 media-integration findings proved graphic/data-viz designs must stay photo-free;
     full-bleed media collapses their distinctness. If a design does carry media, no full-bleed on a
     graphic — cutout / split-panel / ≤20% accent only.)*
   - **The guarantee is verbatim, never paraphrased:** *+1 mph speed. +3" vertical. 90 days. Or your
     training is on us.*
   - **Voice:** head-coach-to-parent, declarative, metric-driven — no emoji, no exclamation points.
   - Brand source of truth is `brand/` — read `brand/README.md` + `brand/aa-design-system/project/README.md`
     before authoring any new creative; role/template rules live in `docs/creative-playbook.md`.

5. **Multi-chat work — keep the status ledger honest.** Big efforts span many chats and context resets, and
   the truth of *what's actually built* gets lost (it did — the generation-quality layer was "designed" in
   one chat and looked done for days). **`docs/creative-engine-status.md` is the single source of truth.**
   Read it before resuming creative-engine work. When you build a ledger item, update its row with the
   **commit hash + the test that proves it** *before you wrap up* — a phase is "done" ONLY with commit+test
   cited; "designed in a chat" never counts. If the ledger looks wrong, rebuild it from `list_sessions` +
   `search_session_transcripts` + `git log` (recovery routine is in the file).

---

## The map (where things live)

Compact version — full detail, plus what's legacy vs. active, in **`docs/MAP.md`**.

```
brand/         Athletes Acceleration design system + per-franchisee brand kits, fonts, photos, components
campaigns/     One folder per campaign: brief + ad-copy + microscripts + creative-plan + edits/
data/          Shared JSON tier: brand.* / location.* / campaign.* / rules.*  (the cascade)
templates/     Static JSX bank (multi-sport-foundations/cluster-*.jsx) + per-template assets
scripts/       Pipeline CLIs (run-campaign, kraken-*, fill-template…) + scripts/lib/ shared modules
docs/          PROCESS.md (canonical), MAP.md (this map), creative-engine-status.md (BUILT-vs-designed ledger), creative-playbook, copy-role-schema, parallel-chats
lessons-learned/  Dated gotchas (YYYY-MM-DD__slug.md) — new ones land here on every deploy
fonts/         Font binaries for the renderer's preflight
out/           Rendered creatives — gitignored (machine-local)
.claude/skills/   The 6 skills (jsx-to-mp4, creative-engine, compose-creative, repurpose-campaign, restart-dev, skill-creator) — LOCKED zone
```

---

## Naming scheme

| Thing | Convention | Example |
|---|---|---|
| Campaign folder | `<angle>-<location>` or `<campaign-slug>` | `confidence-ankeny`, `multisport-foundations` |
| Data file | `<type>.<name>.json` (brand/location/campaign/rules) | `data/location.ankeny.json` |
| Static template | `cluster-<N>.jsx` + `cluster-<N>.config.json` | `cluster-12.jsx` |
| Per-asset edit | `proof-<angle>__<beat>.config.json` in `campaigns/<c>/edits/` | `proof-confidence__A1.config.json` |
| Lesson | `YYYY-MM-DD__<slug>.md` in root `lessons-learned/` | `2026-06-04__re-verify-live-state.md` |
| Output | `out/campaigns/<campaign>/<angle>/<id>.<ext>` (gitignored) | — |

---

## What this builds — two outputs, one source

The same JSX template can produce an **MP4 video** (default) or a **static PNG/JPG** (single frame).
Both run through the same renderer; output mode is per-file. Hand Claude a `.jsx`/`.tsx` and the
`jsx-to-mp4` skill detects the type and dispatches:

- **Remotion** (`<Composition>`, `useCurrentFrame`) → `npx remotion render`
- **Claude Design** (`<Stage>`/`<Sprite>`/`useTime`) → puppeteer + shipped runtime
- **Animated React** (Framer Motion, CSS, canvas) → Puppeteer + ffmpeg
- **Static React** → single screenshot (looped if MP4 requested)

Output lands in `./out/<name>.mp4` (or `.png`/`.jpg`). Deep detail: `.claude/skills/jsx-to-mp4/SKILL.md`.

### Per-file render parameters (read in this order)
1. `<Stage>` props (Claude Design) → 2. Remotion `<Composition>` props → 3. top-level exports
(`DURATION_SECONDS`, `FPS`, `WIDTH`, `HEIGHT`) → 4. sibling `<name>.config.json` → 5. defaults
(1080×1920 vertical, 30fps, 10s). Every component must `export default` the element to render.

### Brand quick reference
Red `#c4141d`, ink scale, chrome accent · Anton (display), Geist (body), JetBrains Mono (metrics) ·
three pillars: ACCELERATE (speed), DOMINATE (strength), UNLEASH (power). Full kit in `brand/`.

---

## Setup

```
npm install
```

`ffmpeg` must be on PATH (cloud: installed by `.claude/hooks/session-start.sh`; locally via your
package manager). `npm install` also wires the pre-commit template validator (`scripts/githooks/`).

---

## Where to look things up

- **`docs/PROCESS.md`** — canonical end-to-end pipeline (intake → plan → review → render → export).
- **`docs/MAP.md`** — full navigation map: every folder, what's legacy vs. active, the data cascade.
- **`docs/creative-playbook.md`** — which roles each beat needs + how to pick templates.
- **`docs/copy-role-schema.md`** — the copy field taxonomy.
- **`docs/parallel-chats.md`** — running two chats without clobbering.
- **`lessons-learned/`** — dated gotchas from past sessions.
- **`brand/README.md`** + **`brand/aa-design-system/project/README.md`** — the brand bible.
- **`HANDOFF.md`** — current open problems (changes session to session; not a standing rule).
