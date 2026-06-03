# Fixed the light wrapup/deploy commands: lessons-before-commit + worktree/PR robustness

- **Date:** 2026-06-02
- **Branch:** claude/deploy-tooling-lessons

## What prompted it

The deploy gotchas in [the sibling lesson](2026-06-02__deploy-worktree-branch-and-main-drift.md)
weren't one-offs — they were bugs in `~/.claude/scripts/light-deploy.mjs` and stale ordering in the
command docs. Fixed both so the next deploy doesn't repeat them.

## Changes made

**Lessons prompt now fires BEFORE the commit** (`full-deploy-light.md`, `wrapup-light.md`). It used to
run after the script had already committed/pushed/merged, so the lesson landed uncommitted and had to
be shipped separately. Now it's Step 1 → the lesson is staged + committed (+ pushed + merged) with the
work. Frontmatter drops the commit SHA (the commit doesn't exist yet) and reads the branch via
`git rev-parse --abbrev-ref HEAD`. The heavy `/wrapup` already did it this way (lessons Step 6 →
commit Step 9) — it was the model. (`wrapup-local` has no lessons; `deploy-light` never commits — both
left alone.)

**`light-deploy.mjs` deploy flow hardened (3 fixes in `doDeploy`):**
1. **Pull gate** uses `git ls-remote --heads origin <branch>` (does the remote branch actually exist)
   instead of `@{upstream}` (which is merely *configured* on a fresh worktree branch). A not-yet-pushed
   branch now skips the rebase with a note instead of failing "couldn't find remote ref".
2. **PR create reuses an existing open PR** (`gh pr list --head <branch> --base <base> --state open
   --json number,url`) instead of hard-failing "a pull request already exists" — so re-running after a
   manual conflict fix just merges the open PR.
3. **Merge-conflict error is actionable** — on "not mergeable / cannot be cleanly created" it appends
   the recovery: `git fetch origin <base> && git merge origin/<base>` → resolve → commit → push →
   re-run (reuses the PR).

## Takeaways

- **Write the lesson before the commit, always.** A lesson that lands after the push is a lesson you
  have to ship twice.
- **Don't redeploy a squash-merged branch.** Its commits look "ahead" of main but the content is
  already there (squash diverges history) — a new PR re-surfaces the whole diff and won't merge
  cleanly. Branch fresh off `origin/main` to ship a follow-up (this lesson did exactly that).
- **`@{upstream}` configured ≠ remote ref exists.** `git ls-remote` is the source of truth for "is
  this branch on the remote yet."
- These are live config files (`~/.claude/...`), zone-protected (protection + commands zones) — unlock
  to edit, and the lock re-runs a TypeScript verification gate.
