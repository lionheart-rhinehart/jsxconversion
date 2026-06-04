---
title: "CLAUDE.md as binding law, a navigation MAP, and verify-before-acting"
date: 2026-06-04
branch: main
---

Restructured `CLAUDE.md` into a real handbook + added `docs/MAP.md` + unified the split
`lessons-learned/`. Three durable lessons came out of the process itself.

## 1. CLAUDE.md is binding law; memories are only hints — promote durable rules
The harness loads `CLAUDE.md` into every chat and tells it *"these instructions OVERRIDE any default
behavior and you MUST follow them exactly."* Memories, by contrast, are loaded as *background context*
a chat may or may not act on, and they're tied to one person/machine. So a hard-won rule that lives
only as a memory is a **hint**, not a **rule**. The fix: promote stable, always-true operating rules
(git workflow, "explain at a marketer's level," parallel-chats, creative-engine non-negotiables) into
`CLAUDE.md` so every chat obeys by default — the same theme as the hardening effort: *make the right
thing happen automatically.* Keep volatile stuff (current bugs, in-flight campaigns) OUT of the
handbook — that belongs in `HANDOFF.md`/memories or it goes stale and lies to every chat.

## 2. Verify summaries against the real files before acting
An Explore/summary pass is great for breadth but **hallucinates specifics**. In this session a folder
map asserted `templates/multi-sport-foundations/_role-index.json` (real file is
`templates/_role-index.json`) and claimed `*.mp4/*.png` were gitignored (they are not). Both would
have shipped wrong info into the very map meant to be authoritative. Rule: before you act on a
summary's specific claims (paths, gitignore status, "this is dead"), confirm each against disk
(`Test-Path`, `git ls-files`, read the file). Cheap checks; expensive if skipped.

## 3. A docs-only change can still brick the deploy gate — trace the gates, not just the diff
"It's just docs, what could break?" The last step is `/full-deploy-light`, which runs gates:
- The **pre-commit hook is active** (`core.hooksPath=scripts/githooks` → runs `validate-templates.mjs`
  on every commit). An unrelated non-compliant template would block an innocent docs commit. → Run the
  validator as a **preflight** before editing.
- `.deploy-check.json` requires ≥8 mp4s ≥100KB in `summer/**/*.mp4` — and there are **exactly 8**.
  `summer/` *looks* like a retired test folder but is **load-bearing**: delete/move it and every deploy
  aborts. (Latent bug: the gate should point at real campaign output, not a test run.)
- Moving a file can dangle a reference inside the **locked** `.claude/skills/` zone (needed
  `/unlock-skills` to fix one link). The "one safe move" reached further than it looked.

Takeaway: before shipping, trace the **commit/deploy gates and cross-references**, not only the visible
diff. The dry-run + "what breaks at 2am" review earned their keep here.
