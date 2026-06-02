# Running two chats at once without clobbering work

You can absolutely have two Claude chats (or any two sessions) working on this
project at the same time. The trick is keeping them out of each other's way. This
page is the habit to follow. It's written for someone newer to git — no prior
knowledge assumed.

## The mental model: desk vs. filing cabinet

- Your project folder (`D:\Claude CODE\jsxconversion`) is a **desk** with **one live
  paper copy** of every file. When a chat edits a file, it scribbles on that paper.
- **Git** is a **filing cabinet**. When you "commit," you file a dated snapshot. Filed
  snapshots are safe forever and can always be brought back.

The danger: if **two chats scribble on the same desk at the same time**, the last one
to write wins, and the other's *unfiled* scribbles disappear. (That's exactly what
happened once here — one chat copied its files onto the other's desk.)

**The only thing that can be permanently lost is work you haven't committed.** Commit
often and even a collision is fully recoverable.

## The Golden Rule

> **One chat = one workspace. Chats meet only through git (commit + merge) — never by
> copying files from one folder into another.**

A **worktree** is git giving each chat its **own desk** (its own folder with its own
copy of every file) while sharing the same filing cabinet. Two chats in two worktrees
can't overwrite each other — they only combine when you merge, and git will *stop and
ask* if they touched the same lines instead of silently discarding work.

## Checklist: starting a 2nd chat safely

1. **In your first chat, commit what you have** (so nothing is "unfiled"):
   - just say: *"commit my work"* — or run `/wrapup-light`.
2. **Make a fresh workspace for the second chat** (one command):
   ```powershell
   ./scripts/new-workspace.ps1 my-second-thing
   ```
   This creates `.claude/worktrees/my-second-thing/` on a new branch `chat/my-second-thing`,
   started from the latest `main`.
3. **Open the second chat in that new folder** (the script prints the exact path).
   Now the two chats are on two desks and cannot clobber each other.
4. **When the second chat's work is done**, bring it in through git: have it open a PR
   and merge to `main` (e.g. *"open a PR and merge"* / `/deploy-light`). Then your first
   chat can `git pull` to pick it up.

## Don't (these are what cause the problem)

- ❌ **Don't run two chats editing the same folder at the same time.** If both are in
  `D:\Claude CODE\jsxconversion`, they share one desk.
- ❌ **Don't copy files from one checkout into another** (`cp`, drag-and-drop, "save to
  both"). That bypasses git's safety net and silently overwrites. If a chat in a
  worktree "needs to test in the main folder," that's the warning sign — let it test in
  its own worktree, or merge first and test after.
- ❌ **Don't have two chats edit the same file/function at the same time.** Split the
  work by area instead (e.g. one chat on templates, one on the renderer). If they truly
  must share a file, do them one after the other, not in parallel.
- ❌ **Don't leave work uncommitted for a long time.** Uncommitted = unprotected.

## If it collides anyway (recovery)

Nothing committed is ever lost. From the affected folder:

```bash
git status                     # shows which files differ from the last commit
git checkout HEAD -- <file>    # restore that file to its last committed version
```

`git checkout HEAD -- path/to/file` throws away the working-tree change and brings back
the committed copy — exactly how the earlier collision was undone.

## TL;DR

- Commit before starting a second chat.
- Give the second chat its own worktree (`new-workspace.ps1`).
- Let them combine through **merge**, never through **copying files**.
- Worst case, `git checkout HEAD -- <file>` brings committed work back.
