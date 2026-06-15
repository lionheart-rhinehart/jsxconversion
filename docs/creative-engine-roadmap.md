# /creative-engine v2 — Phase Roadmap (live follow-along)

**What this is:** the at-a-glance status of the `/creative-engine` rebuild, so any chat (or Cody) can
see where things stand without regenerating it. **Update the box + status line when a phase lands.**

- Master plan (full detail + Execution Checklist): `~/.claude/plans/so-i-see-that-memoized-parnas.md`
- Cross-session memory: `project-creative-engine-v2-rebuild`
- **Goal:** a finished Claude Design goes in → edit → approve → render once → ship (and fan out to many brands).
- **Rules:** clean room (no imports from `creative-engine-v1/`), one phase per chat, evidence over assertion.

**STATUS LINE:** Phases 0–6 ✅ + Intake Packager (#2) ✅ + Editor runtime-retag wiring (#5/#9) ✅ + Render-on-approval → render-live ✅ + **Remote-publish (off-laptop) ✅ + `/creative-engine` skill wired into an executable runbook ✅** · **pipeline complete AND drivable from the slash command** (drop any export → intake → edit → approve/publish → portal approve → render LIVE → fan-out → dispatch). *Remaining: the single HUMAN-driven prod round-trip (acceptance test) + scheduling (deferred).* `npm test` 190/190.

## ✅ Remote-publish + `/creative-engine` runbook — the loop runs off-laptop, drivable from the slash command  *(DONE 2026-06-15)*
`creative-engine/dispatch/publish-package.mjs` uploads a package's whole tree to the `content-bundles`
Storage bucket + registers one `content_outputs`(embed)+`approvals`(token,pending) row per frame at public
URLs (DRY-RUN default, `--live`, deduped on slug+frame_id). The poller gained a download-and-serve branch
(`render/poller.mjs`+`approvals.mjs`: `isRemotePackage` → `materializeRemotePackage` pulls via `files.json`
into `render/_state/remote-cache/`, sidestepping Storage's text/plain HTML downgrade). Spike proved only the
entry HTML is downgraded (peer JS/CSS/fonts keep type) so `asset_base` = the absolute Storage folder URL
(Kraken view route injects `<base href>`). PROVEN off-laptop: publish carmel f0 → prod portal served it as
text/html → simulated edit+approve → poller pulled from Storage + rendered a 1080×1920/30fps/7s/1.39MB MP4
with the edit, **no localhost**. Commit `3744abd`; `test/remote-package-gate.test.mjs`. Then the
`.claude/skills/creative-engine/SKILL.md` runbook was wired so each step runs its real script (`approve` →
publish-package, `render` → scoped poller), making the whole pipeline drivable from `/creative-engine`.
Pre-test hardening: intake friendly lock error + `_packages/` cleanup sweep. `npm test` 190/190. Lesson:
`lessons-learned/2026-06-15__remote-publish-download-and-serve.md`.

## ✅ Render-on-approval wired to render-live (local-but-real round-trip)  *(DONE 2026-06-15)*
The poller/pool/fan-out were built (Phase 5) against the OLD static `render-frame` (freezes JS-driven
animations). Wired them to the zero-loss `render-live` via two job fields (`job.live`+`job.url`) and one
liveness gate (`render:'live-html' && !file://` → keeps the Westfield static fixture + all tests green).
The poller owns ONE HTTP server per cycle (serve.mjs, frame-map pattern) so `<video>` Range-seeks; closed
in `finally` after `runPool`. `creative-engine/render/test-live-roundtrip.mjs`: real Carmel → PNG 526KB +
**MP4 1.42MB** (210 frames, MOTION CONFIRMED via ffprobe frame-diff) → fan-out 2 brands → dispatch DRY-RUN
routed → 0 live Kraken writes (10/10). `test/render-live-path.test.mjs` (bare-checkout safe). npm test
181/181. Live recon: Kraken has 0 v2 embed/live-html rows → organic round-trip blocked on the Kraken repo.
Lesson: `lessons-learned/2026-06-15__render-on-approval-wired-to-render-live.md`.

## ✅ Intake Packager (#2) — the front door  *(DONE 2026-06-15)*
`creative-engine/intake/package-export.mjs <path>` (.zip/folder/.dc.html) → detect → normalize-copy into
`_packages/<slug>/` → headless frame map via render-live `openLive` (SAME eyes as renderer) → `intake.json`
(entryHtml, asset_base, kind, frames[], counts, flagged, brokenAssets, ok) + 1 poster/frame. Never silent:
0 frames→exit 2; broken assets→flag+exit 3 but still write. `editor-host.html?pkg=<slug>` loads from the
manifest; frame_id crack closed (manifest sets `metadata.frame_id`; `approvals.mjs` throws on live-html
without it). Receipts: Carmel campaign-b 10/ok, Westfield cr-frame 36, AA .dc.html 20, neg→2, broken→3.
`test/intake-package.test.mjs`; npm test 179/179. Lesson: `lessons-learned/2026-06-15__intake-packager-front-door.md`.

---

## ✅ Phase 0 — Clean room & guardrails  *(DONE)*
Old skills archived to `creative-engine-v1/` (locked read-only), new `/creative-engine` command + clean
code home, docs updated.

## ✅ Phase 1 — Intake + TAG  *(DONE)*
Deterministic tagger → 791 elements across 36 Westfield designs, 0 silent skips. Kraken handoff doc written.

## ✅ Phase 2 — The one portable editor  *(DONE — landed on main)*
Click-text / swap-media / drag / resize / undo-redo, override model. Pixel-perfect (SSIM 1.00000)
editor-vs-render. *Known deferred: a montage-preview flicker — cosmetic only, not a blocker.*

## ✅ Phase 3 — Media manifest & naming  *(DONE — verified + tested)*
- [x] 3.1 unique ID + descriptive slug + tags (incl. motion/static)
- [x] 3.2 query-by-meaning returns the exact asset from a collision folder
- [x] independent regression test on main (`test/manifest-select.test.mjs`; `npm test` 173/0)

## ✅ Phase 4 — Approval (this repo's part: editor URL + contract)  *(DONE 2026-06-14)*
- [x] 4.1 editor is iframe-mountable by URL with a permission flag: `editor-host.html?view=1` = view+comment
      lane (Kraken's annotation overlay on top), no param = edit lane. **Integration = iframe-by-URL, NOT
      a code-imported bundle** (verified: Kraken iframes all content + has no editor-import path). The
      earlier importable bundle was deleted as the wrong artifact.
- [x] 4.2 handoff doc + Supabase status-field contract — `docs/kraken-editor-mount-handoff.md`; approvals
      fields re-verified against The Kraken (`status='approved'` trigger, no `rendered_at`/`overrides` cols).
- [x] 4.3 approval→render trigger documented — Kraken writes `status='approved'`; a local poller (Phase 5)
      picks it up (option-B rendered-ledger). Edit-lane overrides leave the iframe via `postMessage`
      (`{type:'ce-overrides'}` → parent); editor emitter added + verified.
> Scope note: the actual Kraken `<iframe>` + message-listener + client-editor mount is the **Kraken repo's**
> task (separate chat) — per the master plan, not gated here. This repo ships the URL + the contract.

## ✅ Phase 5 — Render-on-approval + brand fan-out  *(DONE 2026-06-14)*
Clean room at `creative-engine/render/` (zero v1 imports; wraps `editor/render-frame.mjs`).
- [x] 5.1 pooled render queue (`pool.mjs` + `probe.mjs`) — N-at-a-time, conservative ceiling 4; test-pool overlap 2.5×, no thrash.
- [x] 5.2 failure isolation + manifest (`run-job.mjs` child-process + timeout/retry-once, `manifest.mjs`) — 2 poison jobs killed mid-batch, 6/6 good survived, both failures recorded.
- [x] 5.3 local render poller (`poller.mjs` + `ledger.mjs` + `approvals.mjs`) — option-B `(id,updated_at)` ledger; fixture proves pickup / skip / re-render. Read-only `approvals` helpers added to `scripts/lib/kraken.mjs`.
- [x] 5.4 brand fan-out (`brands.mjs` + `brands/registry.json` + `fanout.mjs`) — 1 master → 6 brands; `diffOverrides()` proves only name/color/logo/eyebrow/media changed; routed to dest folders.
> Live cross-repo round-trip (Kraken approves → poller renders) = FINAL verification with the Kraken chat; proven here against a local fixture.

## ✅ Phase 6 — Dispatch (final screen)  *(DONE 2026-06-14)*
Clean room at `creative-engine/dispatch/` (zero v1 imports; reuses `scripts/lib/kraken.mjs`; reads
Phase-5 manifests as data).
- [x] 6.1 Content Library dispatch + brand fan-out auto-route (`content-library.mjs` + `lib/dispatch-jobs.mjs`) —
      DRY-RUN default, `--live` push. LIVE PROOF: AA fixture → ingested → filed into folder
      `creative-engine-dispatch-test` in AA's own workspace (content id `3ac74364`), read back from
      that folder; re-run = `deduped` (idempotent). 6-brand fan-out auto-routes each to its own
      workspace+folder; 2 unresolved registry workspaces flagged (no silent drop).
- [x] 6.2 Meta / Facebook queue (`meta-queue.mjs`) — STAGED publish-plan only; `liveFired=false`,
      `published=0`, `publishCall=null`. third-eye-ads is read-only insights (no publish tool exists).
- [ ] (schedule — later, deliberately out of scope)
> Known registry gap surfaced (not a dispatch bug): `castille-academy` / `ideal-sports-performance`
> brand `workspace` slugs don't resolve to a Kraken workspace (ideal → `isp`/`isp-fort-worth`). Fix in
> the Phase-5 registry, not here — dispatch correctly flags it loudly.

---

### Safe parallel work (which phases can run at once)
- Phases touch **different folders by design** → run in separate **worktrees**, merge through git, never copy files.
- Done-by-folder: Phase 2/4 = `creative-engine/editor/`; Phase 3 = `creative-engine/manifest/`; Phase 5 = render; Phase 6 = dispatch.
- Rule of thumb: two chats are safe to run together only if they touch **different folders**.
