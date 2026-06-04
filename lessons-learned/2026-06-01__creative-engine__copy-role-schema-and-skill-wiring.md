---
created: 2026-06-01
area: creative-engine
title: Copy-role schema + wiring the skills to the playbook
tags: [copy-role-schema, motion, claude-design, planning, protected-zones, process]
---

# Lessons — Copy-role schema + skill wiring (2026-06-01)

Session built the copy-role schema (separate a slot's marketing ROLE from its visual TREATMENT,
join copy→slot by role), validated it with a render spike, then wired `/creative-engine` +
`/compose-creative` to plan by `docs/creative-playbook.md` via a generated `templates/_role-index.json`.

---

## 1. Motion renders blank if `useTime()` is called in the Stage HOST
**Problem:** The full-arc video came out as just the background — every time-gated scene had
opacity 0. Cause: `useTime()` was called at the top of the component that *returns* `<Stage>`, so it
ran **outside** the timeline provider and returned `t = 0`; everything gated on `t` was invisible
(only un-gated layers like the bg/brand showed).
**Fix:** read time **inside a child** of `<Stage>` — `FullArcReel` returns `<Stage><ArcContent/></Stage>`
and `ArcContent` calls `useTime()`. Bank templates work because the runner mounts them *as children*.
**Prevention:** baked into `docs/creative-playbook.md` ("Motion authoring rules") and
`compose-creative/SKILL.md`: *call `useTime()` inside `<Stage>`, never in the host.* Also: give every
text an explicit `color` (unset → black → invisible on dark bg), and author **vertical-native**
(a 1:1 template dropped in 1080×1920 top-loads and leaves a void).

## 2. Fill by `id`, not `tag` — that's what kills the duplicate-tag bug
**Problem:** Two slots tagged `headline` both received the same copy (tag-keyed substitution),
so a hook and a program-name couldn't coexist.
**Fix:** `assemble()` returns an **id-keyed** map; `applyById` fills the exact element. Copy lands by
role, by unique id — verified in a real render (hook→`headline_top`, lockup retained).
**Prevention:** identity = `id`; `tag` is treatment, `role` is function. Don't key fills on `tag`.

## 3. `maxChars` must be treatment-aware, not generic
**Problem:** A bulk script set `maxChars: 48` on all display slots; a 35-char hook routed into
cluster-1's arched 158px slot (sized for the one word "FOUNDATIONAL") overflowed.
**Fix:** derive `maxChars` from each slot's **default-text length × 1.4** (the default was authored
to fit the treatment). Overflow **warns, never truncates**.
**Prevention:** when a value's capacity depends on rendering (font size/arch/width), seed the budget
from the known-good default, not a constant.

## 4. Validate before you lock — the spike + adversarial review caught real gaps
**Problem:** It's tempting to design a schema/rulebook on a whiteboard and build straight away.
**What worked:** (a) a **render spike** (13 statics + 2 videos) *before* locking the playbook surfaced
the eyebrow-legibility and vertical-void issues; (b) a **dry-run + "2am" senior-review pass** before
implementing the skill-wiring caught gaps the plan missed:
- the index glob was `cluster-*` only → would miss `fresh-e2e-*` real templates and risk indexing
  generated `.fill`/`.camp-` variants;
- the index listed only **default roles** → no static matched beat-F, over-rejecting to `fresh`;
  fix was to also index each slot's **`accepts`** list (hijackable slots);
- **`compose-creative` was unwired** → ~45% of assets (`source:"fresh"`) would ignore the playbook;
- `cluster-5/6/7` are **tagless** → invisible to role annotation/selection (pre-existing).
**Prevention:** for schema/process changes, render a representative spike and trace import chains +
data shapes + "what existing feature touches this" *before* committing. The cost of the dry-run was
minutes; each gap would have been a silent quality regression.

## 5. Selection ≠ fill (two different mechanisms)
**Problem:** Easy to assume "pick a role-fit template" also fills it. It doesn't.
**Fix/clarity:** the role-index only *selects*. Copy then lands via the **auto-join**
(`buildCopyByRole`: headline→beat-role, microscript→reframe) **plus** `templateData` for precise,
multi-field fill. A multi-field template (e.g. `stat-reveal`) with no `templateData` renders defaults.
**Prevention:** documented explicitly in `creative-engine/SKILL.md` so the planner writes
`templateData` for rich templates.

## 6. Canonicalize a verbatim string in ONE place
**Problem:** The guarantee existed in 3 wordings (global CLAUDE.md "or training is free", the
design-system "Or your training is on us", and a stale copy in `creative-engine/SKILL.md`).
**Fix:** single source `GUARANTEE_TEXT` in `scripts/lib/roles.mjs`; `guarantee` role auto-fill-locked;
SKILL.md references the constant instead of pasting a 4th copy.
**Prevention:** brand-verbatim/legal strings live in one constant; everything points at it.

## 7. Protected zones + a shared working tree
**Problem:** A parallel chat (the e2e test) edits the same repo. `/lock-all` would lock *all* zones —
including one the other chat might have unlocked mid-run — and concurrent `SKILL.md` edits clobber.
**Fix:** `git status`/diff the target file before editing; do all edits per file in one batch (the
zone re-locks after 10 min); **don't `/lock-all`** when a sibling session may be using a zone — let
the targeted unlock auto-expire instead.
**Prevention:** treat the working tree as shared; coordinate via a handoff doc
(`docs/HANDOFF-copy-role-schema.md`).

## 8. Back-compat via graceful fallback made a big migration safe
The role-aware paths fall back to the legacy tag/regex behavior when a config/template has no
`role`, and the planner reads the index "**if present**." So annotating templates lazily (most of the
~82 motion bank is still roleless) never breaks anything — it just isn't role-ready yet.
