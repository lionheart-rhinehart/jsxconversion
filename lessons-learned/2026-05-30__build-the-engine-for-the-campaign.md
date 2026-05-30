# Build the engine for the campaign

**Date:** 2026-05-30
**Branch:** main
**Commit:** 0b79d8b

## What happened

This session designed and built the first version of `/creative-engine` — a
campaign-in, approved-creatives-out pipeline. Input: a brand + a full marketing
campaign (reverse brief + ad copy + microscripts). Output: ~10-20 angle-coherent
creatives per angle (video / GIF / static), reviewed on a page, then rendered in
the background. Eight phases shipped (plan contract, review page + API, fill-core
refactor, `__CONFIG__` motion injection, campaign runner, the two skills, docs),
all statically verified. The one deferred item is the live-render test pass.

## The decisions that mattered

1. **Build the engine for the campaign, not the creative.** The big architecture
   fork was per-template `/make-*` skills (the older approved plan) vs. one
   campaign-aware `/creative-engine` + `creative-plan.json`. We chose the engine
   because the *unit of work is a coordinated campaign* (angles × ratio ×
   repetition-cap × freshness-floor × matched copy), and that orchestration has no
   home in per-template skills — you'd build the engine on top of them anyway. We
   went **hybrid**: kept the old plan's good bones (typed per-template
   `*_SPEC.fields` contracts, a shared render engine, `window.__CONFIG__`
   injection) and deferred the per-template wrappers. Superseded the old doc in
   place rather than letting two visions silently coexist.

2. **Source selection is fit-first, not a fixed ratio.** No hardcoded
   template:fresh split. Prefer a bank template when one truly expresses the
   message; bound it with a repetition cap (≤~3 reuses/skeleton/angle) and a
   freshness floor (~45% now, tapering as the bank grows). The observed split is an
   *output*, not an input. Fresh generation isn't a rival to the bank — it's how
   the bank grows (the flywheel), which answers the "we'll burn through 72
   templates" fear.

## The disciplines worth repeating

3. **Dry-run the plan before writing code — read the REAL files.** The single
   highest-value move was an execution dry-run: trace each step against the actual
   source, not a summary. It caught showstoppers that would've been 2am bugs:
   - bank video templates render their *default* copy because the mount path passed
     no props (→ the `window.__CONFIG__` mechanism);
   - `render.mjs` writes `out/<basename>.<ext>` with no output-path arg and no gif
     path → same-template background renders collide in `out/` and `.tmp/`
     (→ unique per-cell basenames + render-then-move + a gif post-step);
   - the gallery is bound to its folder via relative `<script>`/CSS (→ host
     `review.html` *inside* `brand/video-templates/`, don't copy it out).
   "No skimming" applied to our own design, not just the brief.

4. **Reuse-first, enforced by the user.** Every instinct to build new got
   redirected to something already in the repo: the review page reuses the video
   gallery's card/modal CSS + the photo-picker's status badges; the API extends
   `editor-server.mjs` rather than adding a second server. Audit before authoring.

5. **Verify with gates, not vibes.** The fill-core refactor was proven with a
   byte-for-byte 0-diff gate (original inline algorithm vs. the extracted module).
   The review API was proven with a GET → patch → persist → revert round-trip. Skill
   edits went through the zone unlock/lock TS gate. Static verification (syntax,
   JSON validity, round-trips) is cheap and catches most things — but it is NOT the
   same as a real render. We were honest that the motion `__CONFIG__` path is built
   but unproven until a pixel comes out the other end.

## For the next session

- The **deferred live-render test pass** is the real proving ground: one static
  (cluster fill), one motion (the `__CONFIG__` spike — most likely to surface
  issues: Stage wrapper, element loading, font preflight), one gif. Approve a card
  on the page, run `node scripts/run-campaign.mjs velocity-code-youth`, watch
  thumbnails fill in, fix what the first real render surfaces.
- Then prove ONE `fresh` (compose-creative) asset before scaling generation.
- Servers: `editor-server.mjs` (:5173) + `brand/video-templates/serve.mjs` (:5599);
  page at `http://localhost:5599/review.html?campaign=velocity-code-youth`.
- Canonical map: `docs/PROCESS.md`.
