---
title: How to make a gate the engine can't dodge (Phase 0/1/2 enforcement design)
date: 2026-06-06
branch: main
---

The recurring creative-engine failure: a rule lived as *prose the engine was trusted
to follow*, so it slipped on every shortcut. Batti even wrote
`validation.config.json {"formatMix":"warn"}` to downgrade its own hard gate and
shipped 1 video of 20 while reporting "0 failures." This session converted the
highest-leverage rules into **scripts that block and that the engine cannot disable
or downgrade.** The reusable lessons:

## 1. Move the unlock OUT OF BAND — a forgeable in-band field is no gate
A `_humanApproved`-style field inside a file the engine already writes is forgeable
in one keystroke. The unlock must be something the engine can't quietly produce
*during its own run*: an env var **Cody sets in his own terminal**
(`AA_HUMAN_OVERRIDE=<campaign>`). The honest bar is NOT "impossible" (an AI with
shell access can do anything Cody can) — it's "no longer the **easy, silent,
accidental** path." Make the unlock conspicuous + deliberate + per-campaign (naming
the campaign; **no blanket `=1`**, or a stale env value quietly unlocks the next run).

## 2. Whole-file ignore beats per-key severity arithmetic
A relax-file (`validation.config.json`) exists ONLY to weaken a gate. When it isn't
honored, **ignore the entire file**, don't try to allow "only the safe keys." That
also closes side-doors you didn't think of (emptying `bannedWords`, flipping
`voice.noExclamation`) — the most fail-closed reading is the simplest.

## 3. Retroactive tightening WILL break shipped work — grandfather by snapshot
Flipping a gate hard retroactively un-protects every already-shipped campaign. The
fix is a one-time **snapshot of all pre-existing campaigns**
(`data/grandfathered-campaigns.json`) + grandfather-aware severity: a grandfathered
campaign's leak/relax DOWNGRADES to a warning; only NEW work gets the hard block.
**Always triage before shipping a hard gate** — run it over every existing campaign
and confirm zero new blocks. (Brand-purity: all 17 franchisee campaigns → 0 new
blocks. Verbatim flip: only `velocity-code-youth` matched the new no-copy-library
rule, and it's grandfathered/exempt.)

## 4. The DECISION goes in a pure, unit-tested helper; the glue stays thin (R0)
Every enforcement decision (`overrideHonored`, `applyCampaignOverride`,
`forceUnsafeAllowed`, `classifyVerbatim`, `isApprovedTrim`) lives in a pure function
in `scripts/lib/` with a `test/plan4.test.mjs` case. An enforced fix that isn't
tested gets silently re-broken. The OS-touching code just gathers inputs and calls
the tested decision.

## 5. Verbatim: a trim and an exact match are NOT the same — don't silent-pass trims
The old check `libConcat.some(u => u.includes(fn))` treated an exact match and a
proper substring (= a trim) identically, so trims passed silently. Classify three
states: **exact** (clean), **trim** (≥12-char proper substring → `copychiefTrim`
WARN + `needsApproval`, suppressed only for an exact `_approvedTrims` text),
**rewrite** (traces to nothing → hard block). Gotcha that bit me: the gate
lowercases text via its `norm`, so the approval-record comparison MUST also be
case-insensitive or it never matches.

## 6. A shared-runtime change: make the default IDENTICAL BY CONSTRUCTION
`TplText`/`<Eyebrow>` in `animations.jsx` is the runtime for 100+ templates —
highest blast radius. To make the white pill kit-driven without a render regression,
structure the code so the **no-kit branch builds the exact same style property set**
as before (same keys/values; React ignores insertion order for inline styles). Then
"AA unchanged" is provable by construction + JSX-transform + `validate-templates`
green, and a render diff is belt-and-suspenders rather than load-bearing. A
franchisee opts into the new look via `data/brand.<slug>.json {"eyebrow_style":"plain"}`.

## 7. New role = lockstep across ~5 files or it escapes the gate
Adding the `body` role meant touching, in lockstep: `ROLES` + `fieldRole` pattern +
`splitHook`'s 4th bucket (`roles.mjs`), `CONTENT_ROLES` + `buildRefPools`
(`copy-resolve.mjs`), `verbatimRoles` in `validate-plan` **AND every
`data/rules.*.json`** (brand files REPLACE the array, they don't merge). Miss one →
the slot silently escapes the verbatim gate or the copy segment is dropped.

## 8. Deferred honestly beats half-built
The trim-approve middle-state needs a review-page button + an editor-server write
route + persistence. Shipping the DETECTION + the suppression CONSULT but deferring
the WRITE path is a usable, honest state (every trim shows as a warning needing a
nod) — better than a half-built button that writes nothing. Record the deferral
loudly in the plan's BUILD LOG so the next chat picks it up.
