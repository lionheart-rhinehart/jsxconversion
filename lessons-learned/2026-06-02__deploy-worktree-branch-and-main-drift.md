# Deploying a worktree feature branch: `--no-pull` first, and watch for `main` drift

- **Date:** 2026-06-02
- **Branch:** claude/stupefied-ptolemy-2e9bdb
- **Merged as:** 73baece (squash, PR #16)

## What happened

Ran `/full-deploy-light` to ship the in-page Kraken media browser. The commit half
succeeded immediately, but the deploy half tripped twice before it merged.

## Gotchas + fixes

1. **First push of a brand-new branch fails the pre-push rebase.**
   `git pull --rebase` errors with `couldn't find remote ref <branch>` because the
   branch doesn't exist on the remote yet — there's nothing to rebase against.
   **Fix:** on the *first* deploy of a new branch, run `/full-deploy-light --no-pull`
   (or `node ~/.claude/scripts/light-deploy.mjs full --no-pull`).

2. **`main` advanced mid-session → squash-merge blocked as "not cleanly mergeable."**
   While this feature was in flight, another PR (#17, a copy-library system) merged to
   `main` and touched the same files (`SKILL.md`, `PROCESS.md`, `editor-server.mjs`).
   **Fix:** `git fetch origin main && git merge origin/main`, resolve the conflict
   (here only `SKILL.md` — combined both edits rather than picking one side), confirm
   no markers remain (`git grep -nE "^(<<<<<<<|=======|>>>>>>>)"`), syntax-check the
   touched scripts (`node --check`), commit the merge, push, then `gh pr merge 16 --squash`.
   The existing PR picks up the new commits — re-running the deploy script just errored
   with "a pull request ... already exists", so merge the existing PR directly.

3. **`gh pr merge --delete-branch` fails its local checkout in a worktree setup.**
   It errors `fatal: 'main' is already used by worktree` — but the **merge still
   succeeds on GitHub**. The post-merge local branch-switch is what fails, not the merge.
   Delete the remote branch yourself: `git push origin --delete <branch>`.

4. **Editing a protected zone during conflict resolution needs an unlock.**
   `.claude/skills/` is zone-protected, so resolving a conflict in `SKILL.md` required
   `/unlock-skills` first; re-locking (`zone-lock.ps1`) runs a TypeScript verification
   gate (0 → 0 errors here, so it passed).

## Takeaway

For a worktree feature branch: deploy with `--no-pull` the first time, and if the PR
won't merge, it's almost always `main` drift — merge `main` in, resolve, push, merge
the existing PR by number. Don't let the deploy script re-create the PR.
