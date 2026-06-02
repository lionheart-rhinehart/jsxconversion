# Lesson: a stale editor-server silently drops new plan-field writebacks

**Date:** 2026-06-01
**Branch:** main
**Commit:** 0d71bb0
**Area:** editor-server / creative-plan writeback

## Summary

When a script writes a field back into `creative-plan.json` via the editor-server's
single-writer route (`POST /plan/:campaign/:angle/:asset`), the server only persists
fields in its in-memory `ALLOWED` whitelist (`scripts/editor-server.mjs`, ~line 307).
If you add a new field to that whitelist but a **stale editor-server process from before
the edit is still running**, the patch returns **HTTP 200** but the new field is
**silently dropped** — the script thinks it succeeded.

## What happened

Building the Kraken export (`scripts/kraken-export.mjs`), I added `"kraken"` to the
`ALLOWED` list so the exporter could write `asset.kraken = {id,url,folder}` back into the
plan. The first export reported success, but `asset.kraken` never appeared in the plan.
Root cause: an editor-server started earlier (PID 2600 on :5173) was still running the
pre-edit code, accepted the POST (200), and dropped the unknown `kraken` field. The plan's
17 "kraken" string matches were the `needs-kraken-path` flags, masking the absence.

## Fix

Kill and restart the editor-server so it loads the new `ALLOWED`:
```
netstat -ano | grep ":5173" | grep LISTENING   # find PID
taskkill //PID <pid> //F
node scripts/editor-server.mjs > .tmp/editor-server.log 2>&1 &
```
Re-running the export then persisted `asset.kraken` (verified by reading the plan back).

## Prevention

- After editing `editor-server.mjs` (especially the `ALLOWED` whitelist or any route),
  **restart it** before testing — a long-lived dev server does not hot-reload.
- When a writeback "succeeds" (HTTP 200) but the value isn't in the file, suspect a stale
  server before suspecting the script. The single-writer route is intentional (it avoids
  racing the review UI), so routing through it is correct — the gotcha is staleness, not the
  design.
- Optional hardening: have the server log/echo unknown patch keys it drops, so a silent
  drop becomes a visible warning.

## Related

The connector itself (`scripts/lib/kraken.mjs`) reads creds lazily from The Kraken's
`.env.local` and is imported ONLY by the two CLI scripts — never into the render bundle —
to keep the service-role key out of any rendered/committed artifact.
