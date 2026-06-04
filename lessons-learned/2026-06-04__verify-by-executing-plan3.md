---
title: Verify by executing, not by reading — Plan 3 infra hardening
date: 2026-06-04
branch: main
---

# Verify by executing, not by reading

Executing Plan 3 (creative-engine infra/reliability) produced the clearest
example yet of why operational verification beats code review — it caught a fix
that was wrong in a way no amount of re-reading would have surfaced.

## The headline lesson: the sweep targeted the wrong process

The orphaned-Chrome leak (Jarosh: "33 chrome orphaned") was meant to be cleaned
by an orphan-sweep on `dev` start. I wrote it to reap `chrome-headless-shell`
processes — which *reads* perfectly: that's the classic puppeteer headless
process name, the comments were tidy, the unit tests passed, and a live run
reported a clean `0/0`.

It was useless. Puppeteer v23 with `headless: true` runs the **full `chrome.exe`**
out of `…\.cache\puppeteer\…`, **not** `chrome-headless-shell`. The sweep would
have scanned zero and reaped nothing, forever, silently. The only thing that
exposed it was *actually launching puppeteer and looking at the process list* —
`chrome.exe: 49`, executablePath under the puppeteer cache.

**Takeaway:** for anything that touches OS processes, file paths, or external
tools, "the code looks right and the unit tests pass" is not evidence it works.
Run it against the real thing and observe. A green `0/0` from a probe that's
looking for the wrong name is worse than no probe — it reads as "verified."

## Corollaries that fell out of the same fix

- **Don't pass backslash patterns through Node→PowerShell.** A PowerShell
  `-like '*\.cache\puppeteer\*'` arrived mangled (`*.cachepuppeteer*`, matched 0).
  `-like '*puppeteer*'` worked. The robust fix was to stop escaping in PowerShell
  entirely: emit `pid|ppid|path` and do the path match in JS, where the regex
  behaves.
- **Match the discriminator, not the convenient field.** ~39 of 46 `chrome.exe`
  report a **null** `ExecutablePath` (sandboxed children). Filtering on the path
  catches only the path-bearing *roots* — which is correct, because tree-kill
  (`/T`) reaps their children. Identifying by the puppeteer-cache path is also
  what makes the sweep **safe**: the user's real Program-Files Chrome (42 live
  processes during the test) is never touched.
- **Understand the failure mode before "fixing" it.** Killing a render's node
  parent made chrome **self-exit** (puppeteer's debugging pipe breaks → chrome
  shuts down). So the leak is an *edge* case (hung chrome), and the editor's `/T`
  abort is belt-and-suspenders. Reproducing the bug taught me the bug wasn't
  what the ticket implied.

## Process lessons

- **A lot of a plan can already be done — verify each requirement against current
  code before writing anything.** Much of Plan 3 (the `/render-asset` abort
  tree-kill, the renderers' `try/finally browser.close()`, the dev free-port
  probe + restart reaping, `--replace`, editor picks already rendering on
  statics, Save+Render already surfacing real stderr) had landed in prior
  sessions. Re-implementing it would have churned working code. The real work was
  the genuine gaps; the audit to find them was half the job.
- **"Done" vs "verified-by-inspection" vs "real residual" is worth stating
  plainly.** When asked "is it completely done?", separating those three honestly
  is what surfaced both the residual (no SIGINT handler on the `run-campaign` CLI)
  and the appetite to actually run the skipped checks — which is what caught the
  sweep bug.
- **Make the OS-touching glue thin and put the decision in a pure, tested helper.**
  `selectOrphans` / `filterPuppeteerCache` / `scopeMediaRoots` / `staleRenderReason`
  / `findFreePort` are all pure and unit-tested; the spawn/fs wrappers just feed
  them. That's the project's existing Plan 2 pattern and it paid off — the bug was
  in the *listing* glue, and the pure decision logic was already proven correct.
