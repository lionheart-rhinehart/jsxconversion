# /creative-engine v2 — Phase Roadmap (live follow-along)

**What this is:** the at-a-glance status of the `/creative-engine` rebuild, so any chat (or Cody) can
see where things stand without regenerating it. **Update the box + status line when a phase lands.**

- Master plan (full detail + Execution Checklist): `~/.claude/plans/so-i-see-that-memoized-parnas.md`
- Cross-session memory: `project-creative-engine-v2-rebuild`
- **Goal:** a finished Claude Design goes in → edit → approve → render once → ship (and fan out to many brands).
- **Rules:** clean room (no imports from `creative-engine-v1/`), one phase per chat, evidence over assertion.

**STATUS LINE:** Phases 0–4 ✅ (this repo's part) · **Phase 5 NEXT** (render-on-approval + brand fan-out).

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

## ⬜ Phase 5 — Render-on-approval + brand fan-out
- [ ] 5.1 pooled render queue (N-at-a-time, no thrash)
- [ ] 5.2 failure isolation + manifest (no silent drops)
- [ ] 5.3 local render poller (watches Supabase for approvals)
- [ ] 5.4 brand fan-out: 1 master → N brands, swap only name / color / logo / eyebrow / media

## ⬜ Phase 6 — Dispatch (final screen)
- [ ] 6.1 Content Library → pick folder  *(build first)*
- [ ] 6.2 Meta / Facebook queue
- [ ] (schedule — later)

---

### Safe parallel work (which phases can run at once)
- Phases touch **different folders by design** → run in separate **worktrees**, merge through git, never copy files.
- Done-by-folder: Phase 2/4 = `creative-engine/editor/`; Phase 3 = `creative-engine/manifest/`; Phase 5 = render; Phase 6 = dispatch.
- Rule of thumb: two chats are safe to run together only if they touch **different folders**.
