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

`npm test` → **181/181**. All of Phases 0–6 plus the zero-loss rebuild (runtime re-tag + `render-live`),
the intake packager (#2), the editor runtime-retag wiring (#5/#9), and the render-on-approval→render-live
wiring are built and proven with real artifacts (see the roadmap rows for commit + receipt per item).

Key code homes (all clean room, zero imports from `creative-engine-v1/`):
`creative-engine/intake/` (packager + manifest), `creative-engine/editor/` (the one editor + `render-live.mjs`
+ `serve.mjs`), `creative-engine/shared/` (`frame-detect.js` / `runtime-retag.js` / `raf-clock.js`),
`creative-engine/render/` (pool / poller / approvals / fanout), `creative-engine/dispatch/` (Content Library + Meta queue).

## What's NOT done yet (the only remaining work)

1. **The organic live round-trip — needs the OTHER repo (`D:\Claude CODE\The Kraken`).** Our half is proven
   locally (a real approved package renders → fans out → dispatches; see
   `creative-engine/render/test-live-roundtrip.mjs`). But live Kraken has **zero** v2 `embed`/`live-html`
   rows, because the Kraken-side piece isn't built: mount our editor in the approval portal by iframe URL,
   persist the override bag, create the `embed` content rows, and flip `status='approved'`.
   **Full build spec + verified Kraken file paths:** `docs/kraken-editor-mount-handoff.md` (read it first).
2. **Remote-publish step (this repo):** upload a packaged export → Kraken Storage → a public `tagged_url` /
   `asset_base`, so the poller can render a *remotely*-approved design (today only local serving works).
3. **Scheduling** — the calendar leg of dispatch. Deferred by design.
4. **Minor hardening:** intake's friendly error when a package is open in the editor (Windows `EPERM`); a
   `_packages/` cleanup/TTL sweep; SVG `<text>` multi-line `<br>` editing (`creative-engine/editor/apply-overrides.js:62`).

**Out of scope (NOT todos — separate future projects):** the creation/from-scratch engine, a "regenerate this
design" AI button, the cross-project asset-tracking pattern.

---

> *Earlier HANDOFF content (the 2026-06-11 flatten-rebuild churn and the pre-rebuild two-editor system) was
> removed — that approach was abandoned and fully superseded by the v2 rebuild above. The decision history
> lives in `C:\Users\lionh\.claude\plans\that-s-fine-i-don-t-dazzling-waterfall.md` and memory
> `project-claude-design-edit-directly` if you need the "why".*
