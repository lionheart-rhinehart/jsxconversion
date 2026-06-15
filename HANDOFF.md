# HANDOFF — /creative-engine v2 (current state: 2026-06-15)

> **Live phase ledger / single source of truth:** `docs/creative-engine-roadmap.md`.
> **Cross-session memory:** `project-creative-engine-v2-rebuild`.
> **Master plan (full scope + Execution Checklist):** `C:\Users\lionh\.claude\plans\so-i-see-that-memoized-parnas.md`.

## Where things stand

The clean-room **v2 editing pipeline is complete in THIS repo** and is the active system:

```
drop any export → INTAKE (#2 packager) → EDIT (one portable editor) → APPROVE (contract)
   → RENDER (zero-loss render-live, on approval) → brand FAN-OUT → DISPATCH (Content Library / Meta-staged)
```

`npm test` → **190/190**. All of Phases 0–6 plus the zero-loss rebuild (runtime re-tag + `render-live`),
the intake packager (#2), the editor runtime-retag wiring (#5/#9), the render-on-approval→render-live
wiring, **and remote-publish (off-laptop) + the wired `/creative-engine` runbook** are built and proven
with real artifacts (see the roadmap rows for commit + receipt per item).

Key code homes (all clean room, zero imports from `creative-engine-v1/`):
`creative-engine/intake/` (packager + manifest), `creative-engine/editor/` (the one editor + `render-live.mjs`
+ `serve.mjs`), `creative-engine/shared/` (`frame-detect.js` / `runtime-retag.js` / `raf-clock.js`),
`creative-engine/render/` (pool / poller / approvals / fanout), `creative-engine/dispatch/` (Content Library + Meta queue).

## What's NOT done yet (the only remaining work)

> **Remote-publish (this repo) and the Kraken-side editor mount / embed-row creation / override
> persistence are BOTH DONE + verified (2026-06-15).** Remote-publish shipped in commit `3744abd`
> (`creative-engine/dispatch/publish-package.mjs` + the poller's download-and-serve branch) and was proven
> end-to-end off-laptop. The Kraken side is built + verified per the Kraken repo's own status
> (`project_creative-engine-kraken-loop-verified`). The `/creative-engine` skill is now a wired runbook so
> the whole flow is drivable from the slash command.

1. **The single uninterrupted HUMAN-driven prod round-trip** — both halves are proven independently and the
   simulated round-trip renders an edited MP4 from Storage with no `localhost`. What remains is one clean
   pass where a real person opens the portal, edits, and clicks Approve. (This is a verification run, not
   unbuilt code — it's the active acceptance test.)
2. **Scheduling** — the calendar leg of dispatch. Deferred by design.
3. **Minor hardening:** **DONE** — intake friendly lock error (`normalize.mjs`) + a `_packages/` cleanup
   sweep (`creative-engine/intake/cleanup-packages.mjs`). **Still deferred:** SVG `<text>` multi-line
   editing (`creative-engine/editor/apply-overrides.js:62`) — no real design uses multi-line SVG text.

**Out of scope (NOT todos — separate future projects):** the creation/from-scratch engine, a "regenerate this
design" AI button, the cross-project asset-tracking pattern.

---

> *Earlier HANDOFF content (the 2026-06-11 flatten-rebuild churn and the pre-rebuild two-editor system) was
> removed — that approach was abandoned and fully superseded by the v2 rebuild above. The decision history
> lives in `C:\Users\lionh\.claude\plans\that-s-fine-i-don-t-dazzling-waterfall.md` and memory
> `project-claude-design-edit-directly` if you need the "why".*
