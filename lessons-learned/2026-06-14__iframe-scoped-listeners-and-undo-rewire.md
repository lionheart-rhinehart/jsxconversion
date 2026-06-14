---
title: "Editor-in-an-iframe: bind shortcuts INSIDE the iframe, and re-wire every listener after a reload"
date: 2026-06-14
branch: main
---

# Two bugs, one root cause: the design lives in an `<iframe>`, and iframes are their own world

The creative-engine editor mounts the design inside an `<iframe>` (so the design's CSS
can't collide with the editor chrome). Phase B shipped multi-select / group / guides and
"passed" my real-mouse smoke test — but Cody hit two things the test didn't cover, both
caused by forgetting that an iframe is a separate document with its own event loop.

## 1. Keyboard shortcuts must be bound INSIDE the iframe, not just on the parent window

`Ctrl+G` (group) opened the **browser's Find** instead of grouping. Why: my shortcut
handler was on the parent `window`, but a `keydown` that happens while focus is inside the
iframe **does not bubble out to the parent**. So the parent handler never ran, and the
browser's native Ctrl+G ("Find Next") won by default.

- Fix: bind the SAME handler to BOTH `window` and the iframe's `contentWindow`
  (`iwin().addEventListener('keydown', onShortcut, true)`), and `preventDefault()` +
  `stopPropagation()` in it. Now whichever document has focus, the shortcut fires and the
  browser default is suppressed.
- Rule: any keyboard affordance in an iframe-hosted editor must be wired inside the iframe
  too. Test it with focus actually inside the iframe (click design content first, *then*
  press the key) — testing with focus on the chrome hides the bug.

## 2. Re-wire EVERY per-document listener after the iframe reloads

Undo/redo works by `rerenderPristine()` → reload the iframe from the pristine HTML, then
re-apply the override bag. But reloading the iframe swaps in a **brand-new document** —
every listener attached to the old document (mousedown/click/dblclick + the in-iframe mouse
tracking + the new shortcut handler) is **gone**. The editor went dead after a single undo:
clicks selected nothing, drag did nothing. The smoke test missed it because it drove edits
without ever undoing mid-session.

- Fix: `rerenderPristine()` must call the full wiring set again
  (`wireIframe(); wireIframeMouse(); wireIframeKeys();`) right after `loadIframe()`, exactly
  like `boot()` does. Anything that recreates the iframe document must re-run ALL of boot's
  per-document wiring — not just the apply step.
- Rule: if a code path replaces the iframe document, treat it like a fresh mount. Grep for
  every `addEventListener` that targets `idoc()`/`iwin()` and make sure the reload path
  re-binds all of them.

## Meta-lesson
A green automated test proves the path it drove, never the paths it skipped. Both bugs lived
in gaps my smoke test didn't exercise (focus-inside-iframe keypress; undo-then-interact). When
the user reports a bug, add that exact scenario to the harness as a permanent regression — I
did (the Phase B smoke now asserts Ctrl+G-with-iframe-focus and select-still-works-after-undo).
