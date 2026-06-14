---
title: creative-engine-v1 is read-only (attribute) — and why exFAT can't do better
date: 2026-06-12
branch: main
---

# The "welded shut" archive — what's actually true

## The hole that started it
Zone protection (`check-zone-protection.ps1` + `check-zone-bash.ps1`) is **heuristic**: it blocks the
AI's Edit/Write tools and shell write-*patterns*, but a program invoked from the terminal that writes
internally — `node -e "require('fs').writeFileSync('creative-engine-v1/x','y')"` — matches no pattern and
**slips through**. That's how a probe wrote into the "read-only" archive. A pattern list can never be
airtight; only the OS filesystem can.

## The blocker: D: is exFAT
`D:\Claude CODE` is an **exFAT** volume (`Get-Volume -DriveLetter D` → FileSystem=exFAT). exFAT stores
**no ACLs at all** — `icacls /deny` reports "Successfully processed" but the DACL stays null ("all users
full control") and writes still succeed. A true NTFS deny-write wall is **impossible on this drive**.

Verified facts (receipts, not theory):
- **NTFS deny-ACL (tested on a C:\ temp dir):** blocks overwrite **and** delete **and** new-file — a real
  wall. (Only works because C: is NTFS.)
- **exFAT read-only attribute (tested on the real folder):** blocks **overwrite only**. It does **NOT**
  block delete (node `unlinkSync` removed README.md in testing → restored via `git checkout HEAD -- …`)
  and does **NOT** block new-file creation.

## What is in place now
`~/.claude/zone-weld.ps1` (filesystem-aware helper) applied the **read-only attribute** to all 15 files in
`creative-engine-v1/`. So: **existing archived files can't be edited in place**, the AI's Edit/Write tools
are still refused by the zone hook, and reads work. Delete/new-file are not enforceable on exFAT —
accepted. Cody chose to **keep this and stop** ("leave it alone moving forward"); further hardening
(moving to NTFS for a true wall, or patching the bash hook to catch node/python write+delete — both
verified to work) was **descoped**, recorded for future.

## To edit v1 in the future
`powershell -File ~/.claude/zone-weld.ps1 -Action unweld` → edit → `... -Action weld`. (The helper auto-
detects the filesystem: deny-ACL on NTFS, read-only attribute on exFAT.)

## Meta-lesson (the one that bit twice this session)
**Don't recommend a fix you haven't verified end-to-end.** I called the attribute approach "blocks
overwrite and delete" without testing delete — it doesn't. Then nearly called the NTFS move "proven"
having only tested overwrite. Verify **every** claimed effect (overwrite, delete, AND new-file) with a
real probe before presenting it as a fact or a recommendation.
