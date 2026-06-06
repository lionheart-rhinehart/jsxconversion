---
title: Handing off a tool to a project you can't see
date: 2026-06-06
branch: main
---

Packaged the AA Weekly Birthday generator (`automation/`) to move into the **Kraken** project, where a
different team/agent will wire the PushPress → graphic → approval automation. I can't see the Kraken's
codebase or runtime. What made the handoff actually usable:

## 1. Make the deliverable self-contained, then PROVE it
The renderer read its font from the parent repo's `fonts/` — invisible until the folder is moved. Fix:
bundle every dependency *inside* the handoff folder (`automation/assets/fonts/`) and repoint the code. Then
the proof, not the assumption: **copy the folder to a temp dir outside the repo and run it there.** It
rendered identically → genuinely portable. A handoff folder that "should be self-contained" isn't until
you've run it with no parent repo around.

## 2. Define a hard, machine-checkable contract — not prose
The Kraken doesn't need to understand the design; it needs an exact I/O contract: one input shape
(`{ dateRange, athletes[] }`), one output (1080×1350 PNG path on stdout as JSON), and **distinct exit
codes** (0 ok / 2 bad data / 3 missing asset / 4 Chrome failed) so the automation can branch on success
without parsing logs. "It prints a path" is not a contract; "exit 0 + `{output}` JSON, else non-zero" is.

## 3. Flag what you can't verify as "TO CONFIRM" — don't guess
Two things were genuinely unknowable from here: the Kraken's runtime (does it have Node + system Chrome,
or is it serverless?) and PushPress's exact birthday endpoint/field (their live docs were behind a login).
Guessing would have produced confident-but-wrong instructions. Instead the doc marks each as **TO CONFIRM**
with the options/decisions the implementer must make (e.g. serverless → worker VM vs hosted headless-Chrome
vs bundled chromium; PushPress → match on month+day, ignore birth year). An honest gap beats a plausible
fabrication in a handoff someone will act on cold.

## 4. Write the handoff for the next agent, not for yourself
The reader is a fresh session with zero context. So: where to get it (repo + commit), how to install it
(copy the *whole* folder, not just the HTML), a self-test to run first (`data.example.json` → `test.png`),
and an implementer checklist. The companion `KRAKEN-INTEGRATION.md` is structured so an agent can execute
it top-to-bottom without asking anyone.

> Pairs with [[2026-06-05__birthday-template-tilted-design]] (building the generator itself).
