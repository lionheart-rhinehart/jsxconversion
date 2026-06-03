---
title: Copy magnets, by-reference binding, and the kicker stack (how verbatim copy lands on a creative)
date: 2026-06-03
branch: claude/thirsty-perlman-8de8bf
---

# How verbatim copy actually lands on a creative

The engine **selects and places** copy; it never writes it. This is the whole
machine for getting Cody's exact words onto a card, plus the gotchas that cost
time this session.

## The copy-library = "fridge magnets"

`scripts/intake-copy.mjs` parses a campaign's `ad-copy.md` (+ `microscripts.md`)
into `campaigns/<name>/copy-library.json` — a flat list of **verbatim units**
(magnets), each `{ id, kind, role, text, chars }`. The planner references a magnet
by `id`; `copy-resolve.mjs` expands id → text **before** anything renders, so a raw
id can never appear on a creative.

**Kinds:** `headline`, `description`, `primaryText`, `altHook`, `imageHeadline`,
`imageSubhead`, `microscript`, and (new this session) **`bodyPara`** + **`bodyLine`**.

### The "cut more magnets" upgrade (this session)

Before: only hooks/headlines/image-captions were magnets; the ad **body** was one
big `primaryText` blob (role `null`, "a source pool"). So proof lines, blame-removal
lines, case-study sentences, and the offer line were NOT referenceable — they had to
be hand-typed into `templateData`, which is a non-verbatim trap (mid-sentence clips
= rewrites).

The fix (`scripts/lib/copy-library.mjs`): split each `PRIMARY TEXT` into
- **`bodyPara`** — one blank-line paragraph, whole (`<ad>.bodyPara.<n>`)
- **`bodyLine`** — one sentence, split at `.!?` only, words never change
  (`<ad>.bodyLine.<para>.<sent>`)

This took one angle's library from **121 → 557 units** and let the ENTIRE angle
(not just A-beat hooks) bind by reference with a clean guard.

## Two ways to bind (both verbatim, both by id)

- **`asset.copyRefs: { role: "<id>" | ["<id>", ...] }`** — drop one magnet into one
  role slot. A pool of N fills the first N slots of that role in document order.
- **`asset.hookRef: "<id>"`** — lay ONE magnet across **kicker → headline → subhead**
  via `splitHook` (roles.mjs): 1 sentence → headline; 2 → headline+subhead; 3+ →
  kicker+headline+subhead. Only chooses break points, never alters words.

`copyByRole` (legacy inline) and `copyRefs` are **mutually exclusive** — if an asset
has any `copyRefs`/`hookRef`, `buildRefPools` wins and legacy `copyByRole` is ignored
entirely (see `fill-core.mjs`: `const copyByRole = refPools ? refPools.pools : buildCopyByRole(asset)`).
To author one slot by reference and another by hand, put the hand one in
`templateData` (explicit always wins, applied separately).

## The kicker stack (the "role upgrade")

Layout standard: **eyebrow (`{CITY} SPORT PARENTS`, white chip, top) → kicker
(lead-in) → headline → subhead.** `cluster-43` is the canonical stacked-hook static.
The `kicker` slot is *present* on the stacked clusters but only **fills when a line
naturally splits into 3 segments** — forcing a kicker onto a 1–2 segment line would
mean inventing a lead-in (a rewrite). Empty kicker on a short line is correct, not a bug.

## Gotchas that cost time

1. **`buildRefPools` gates the FULL hook text against the hook slot's `maxChars`.**
   If the whole hook overflows, it drops to a shorter alt-hook (losing the kicker).
   A long 3-segment hook needs a hook slot with a LARGE `maxChars` (cluster-43's
   headline is `maxChars: 130`) or it silently falls back to a 2-segment line.

2. **Stale `edits/` sidecars override the plan.** `run-campaign.mjs` reuses
   `campaigns/<name>/edits/<angle>__<id>.config.json` if present. After re-authoring
   a plan you MUST `rm` the old sidecars before re-rendering, or you render the old
   copy. (Same root cause as the earlier "eyebrow didn't change" bug — a re-created
   seed sidecar masked the new value.)

3. **Static media is injected by the runner, not the cluster.** A cluster config
   needs NO media layer — if `asset.media` is set, `run-campaign.mjs` injects a
   full-frame `config.media` at z:0 + a legibility scrim + per-text drop-shadows.
   So any clean text-only static (e.g. cluster-43) becomes media-backed for free.

4. **`verbatimGuard` is case-sensitive** (`norm` collapses whitespace but does NOT
   lowercase). Multi-field templates whose `templateData` is UPPERCASED (stat-reveal,
   meet-coach, cluster-31 credentials) will flag as "not from copy-library" even when
   the words are verbatim. It's report-only — fine for credential/label cards, but
   don't claim "guard clean" when those exist. Prefer role-slot clusters + `copyRefs`
   for message copy; reserve `templateData` for true multi-field/label templates.

## Where to look
- `scripts/lib/copy-library.mjs` — the parser (magnet grains)
- `scripts/lib/copy-resolve.mjs` — `buildRefPools` / `resolveHook` / `verbatimGuard`
- `scripts/lib/roles.mjs` — `splitHook`, the 14 roles, `buildEyebrowAnchor`
- `scripts/lib/fill-core.mjs` — `resolveStaticConfig` (the one static fill path)
- `scripts/lib/assemble.mjs` — role pool → slot, document order
- `docs/creative-playbook.md` — the canonical rulebook (hook layout + body magnets)
