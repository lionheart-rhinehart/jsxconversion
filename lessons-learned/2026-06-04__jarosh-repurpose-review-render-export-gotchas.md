---
title: Jarosh repurpose — review/render/export gotchas (status-stuck cards, resource saturation, debug stderr)
date: 2026-06-04
branch: main
---

Lessons from finishing the Jarosh Performance franchisee repurpose (3 angles cloned
from the Carmel set, reviewed card-by-card, exported to Kraken). These are the
non-obvious traps that cost the most time.

## 1. A card stuck at status `"rendering"` silently SKIPS the Kraken export

`kraken-export.mjs` only pushes assets with `status:"rendered"` + an existing output
file (`run-campaign`/export gate at `kraken-export.mjs:158`). If a render is
**interrupted** (killed mid-flight, machine saturated, editor request abandoned), the
asset is left at `status:"rendering"` — the start-of-render patch ran, the
end-of-render patch never did. The export then **skips it with no error** (counts it
under `skipped:N`), so the card just quietly never reaches the destination folder.

- **Symptom:** dry-run shows `pushed:19 skipped:1` and one card you *know* you tweaked
  is missing from the WOULD-push list (hit this on more-games **F2**).
- **Diagnose:** `node -e "...find(z=>z.id==='F2').status"` → `"rendering"`, not `"rendered"`.
- **Fix:** re-run `node scripts/run-campaign.mjs <campaign> --only <id> --all` — a clean
  render flips the status to `rendered` (deterministic, so same media → same pixels).
- **Always sanity-check the dry-run `skipped` count before the real export.** `skipped`
  is not always benign — it can mean "a card you care about is stuck," not just
  "intentionally excluded."

## 2. "The template can't take a new clip" was actually a saturated machine

D1 (a `fresh-e2e-d1` motion template) failed to render with every replacement clip and
I was about to conclude the bespoke template was tied to its original media. It wasn't —
the machine was **saturated with leaked render processes** (orphaned
`chrome-headless-shell` from killed renders), so new renders OOM'd / errored with a
generic `exit 1`. Once the orphans were cleared, the *exact same* clip swap rendered
fine on the first try.

- **Before blaming code for an intermittent render failure, check machine state**
  (`Get-Process node,chrome` counts, CPU time). A render that "fails only sometimes"
  or "fails after a long busy session" is a resource problem, not a logic problem.
- Killing a parent `node` on Windows does **not** reap its puppeteer chrome grandchild —
  use `taskkill /T /F` on the PID tree. This is the root of the orphan pile-up.

## 3. `run-campaign` swallows the real render error — surface it to debug

On a motion failure, `run-campaign` prints a generic `✗ motion render failed (exit 1)`
but the actual renderer stderr is already captured in `res.log` and just not printed.
A one-line temporary edit at the failure branch —
`if (res.log) console.error(res.log.split("\n").slice(-25).join("\n"))` — surfaces the
real error. (Worth considering as a permanent `--verbose` behavior; I reverted it after
debugging to keep the diff scoped.)

- **Gotcha while capturing it:** piping the run through `grep` swallowed everything and
  produced an empty file. Redirect the full run to a file (`> /tmp/x.txt 2>&1`) and read
  the tail — don't filter a long-running render's output through grep mid-stream.

## 4. Franchisee identity leaks hide in non-obvious fields

The brand-name swap only matched the full `"ATHLETES ACCELERATION"` string, so identity
leaked through anything that stored the name/url **split or baked**:
- BR1 logo-sting's `wordmark1`/`wordmark2` (split "ATHLETES" / "ACCELERATION").
- Baked CTA urls hardcoded in template JSX (`ATHLETESACCEL.COM`) rather than read from
  `window.__BRAND__.url`.

Fix pattern: a `patchIdentityLeaks()` pass over the cloned plan for the split fields, and
make templates read the url from the brand token instead of hardcoding. (Same class of
bug as the SMAA `brand_name` leak — assume every franchisee repurpose has a few.)

## 5. Review-before-export is a real workflow, not a nicety

The repurpose orchestrator renders **and** exports with no human gate. The user wanted to
review each angle first. The decoupled flow that worked: clone-only → `run-campaign --all`
per campaign (no export) → review on `review.html` → per-card tweaks → `kraken-export.mjs`
**only after the user approves that angle**. Export each angle to its own folder
immediately on approval rather than batching all three at the end.

## 6. Per-card review tweaks are visual, not just textual

The approved fixes this round were almost all about what the footage *shows*: drop
talking-head frames that still have spotlight-overlay text, de-duplicate repeated
clips/photos across cards, kill a jacked-up bg+fg double-loop, move/zoom a static crop so
the athlete's face is visible, and swap "meet the coach" cards for an on-message proof
angle. Copy stays verbatim (guarantee included) — only the *coach* copy changes for a
franchisee. When in doubt, the template/clip must match the angle's **meaning**, not just
fill the copy slot.
