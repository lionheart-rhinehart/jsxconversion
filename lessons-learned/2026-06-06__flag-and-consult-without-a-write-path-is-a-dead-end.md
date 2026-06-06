---
title: A flag + consult with no write path is a dead end
date: 2026-06-06
branch: main
---

When you add a "soft gate" (a warning that needs human approval rather than a hard
block), it has **three** parts, not two: the **flag** (detect it), the **consult**
(check whether it's been approved), and the **write** (record the approval). This
session, the flag + consult shipped earlier but the write path was deferred — so
every copychief trim showed as an un-actionable warning forever. A consult with no
writer is a locked door with no key.

**Two gotchas in the write path itself:**

- **Static vs. motion store approvals in different places.** Static creatives keep
  `_approvedTrims` in the per-asset *edits-config file*
  (`campaigns/<c>/edits/<angle>__<asset>.config.json`); motion creatives keep it
  inside the plan's `templateData`. One route (`POST /approve-trim` in
  `editor-server.mjs`), two branches — the validator already read both, so the
  writer had to match both. For static, the edits config may not exist yet (the
  asset was never hand-edited), so the route resolves it from the fill on first
  touch, mirroring `GET /campaign-config`.

- **Put the actionable data on the violation, not just in the message string.** The
  flag's human-readable message had the trimmed text buried in it, but the review
  button needed the *exact* slot id + text as real fields. Adding `field` + `text`
  to the `copychiefTrim` violation object (in `validate-plan.mjs`) — instead of
  making the UI parse the message — is what let the button act on it cleanly and
  stamp precisely what the gate re-reads.

**Verification note:** the consult side was already unit-tested, so the new tests
focused on the *write shape* (does stamping `_approvedTrims[field]=text` back where
the gate consults it actually suppress the flag?) for both static and motion. The
route itself — which binds a port on load, so it can't be imported into a unit test
— was proven by booting `editor-server` on a throwaway port (not the live :5173)
and curling the round trip.
