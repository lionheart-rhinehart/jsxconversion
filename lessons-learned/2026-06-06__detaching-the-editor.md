---
title: Detaching the image/video editor — find the real coupling, harden the plan, don't destabilize the live thing
date: 2026-06-06
branch: main
---

## Context

The editor felt "locked to the multisport-foundations campaign." Goal: make it a
project-wide tool that plugs into anything. Shipped Phases 1–4 (multi-root resolver,
`npm run edit` launcher, motion auto-discovery, per-brand banks, a standalone
`creative-editor/` module).

## Lessons

**1. Verify the ACTUAL coupling before a big "pull it out" refactor.**
The editor was never campaign-locked — its server + review page already opened every
campaign (that's how Jarosh/SMAA/Batti/ISP got reviewed). The real coupling was narrow:
the static-template bank was a single folder *named after the first campaign*
(`templates/multi-sport-foundations`), hard-coded in ~18 files. The fix was a shared
resolver (`scripts/lib/template-roots.mjs`), not an extraction. Diagnosing the true
coupling turned a scary refactor into a contained one.

**2. The browser hard-codes things the server doesn't.**
The first plan only touched the server, but `out/editor/editor.html` built media URLs
from the literal `/templates/multi-sport-foundations/` in 5 spots — so widening the
server alone would have left fresh templates' photos 404'ing. Fix: the server sends the
base via an `X-Template-Base` header; the client uses it. When decoupling a path, trace
it through BOTH tiers.

**3. Adversarial review against the REAL repo catches premise errors.**
The "2am review" pass found that two files I'd planned to DELETE as "dead"
(`fresh-multisport-foundations-grind-trap-A1/FA1.jsx`) were referenced by ~12 live
campaigns — a repo-wide grep proved it. Deleting them would have broken those renders.
"Dead" is a claim to verify with grep, not assume.

**4. Two resolvers must agree, or you edit one thing and render another.**
The editor preview and the shell-out renderer both resolve a template id → dir. They
MUST import the one resolver module; never re-derive the path locally. (Same discipline
the `_approvedTrims`/edits-first ordering already enforces elsewhere.)

**5. Don't speculatively rewire a live, in-use system.**
Phase 4c (extract the editor as a drop-in module) was built as a self-contained
`creative-editor/` package that boots and verifies standalone — but AA's
`editor-server.mjs` was deliberately NOT rewired onto it. It's in daily use, there's no
second host repo to validate against yet, and a 1,150-line rewire mid-use is pure risk
for no present benefit. Build the capability, prove it in isolation, document the
consolidation, and wait for a real reason to flip the switch.

**6. Touch the compliance gate surgically.**
`validate-plan.mjs` is the gate (verbatim guarantee, formatMix, AA_HUMAN_OVERRIDE). It
needed the resolver too, but the change was exactly one line (template-dir resolution);
the 78-test suite — including the full P0/P1/P2 gate suite — was the proof nothing in the
gate logic moved.
