---
title: "Proving editor==render: the video-seek + iframe-screenshot landmines"
date: 2026-06-12
branch: main
---

# Proving "editor preview == rendered MP4" — five landmines, in the order they bit

Phase 2 of the creative-engine rebuild needed one hard receipt: a frame edited in the
browser editor must equal the rendered MP4 frame at the same timestamp (SSIM ≥ 0.98).
The editor and renderer share the same DOM-mutation code (`apply-overrides.js`) and the
same animation-freeze code (`seek.js`), so they *should* agree by construction. They
didn't, and the gap took five fixes. Each looked like "the edit is wrong" but every one
was a **capture/transport artifact** — the DOM was provably identical the whole time.

The meta-lesson: **when two pipelines that share their core disagree, measure the DOM
before blaming the logic.** One `getBoundingClientRect` + `video.currentTime` dump in
both contexts (they matched exactly) would have saved hours of chasing the override code.

### 1. An HTTP server that doesn't honor Range requests → `<video>` can't seek
The renderer loads the design over `file://` (fully seekable). The editor loads over a
local static server. A naive static server returns the whole file with `200` and no
`Accept-Ranges`. **Without `206 Partial Content`, a browser cannot seek a `<video>`** —
`video.currentTime = 3.5` silently stays `0`, so the editor froze on frame 0 while the
renderer was at 3.5s. Same file, same code, different frame. Fix: the server must parse
`Range:` and reply `206` with `Content-Range`. This is the #1 thing to check any time a
headless/served `<video>` won't scrub.

### 2. Puppeteer screenshot of an element INSIDE an iframe rescales ~6%
`elementHandle.screenshot()` on an element that lives in a child frame (and, it turned
out, even a full-page clip over an iframe) rasterizes the iframe surface at a slightly
different scale (~6% smaller here) — even though `innerWidth`, `devicePixelRatio`, and
every `getBoundingClientRect` are identical to a top-level render. This is a harness
limitation, not a pipeline defect. Fix: don't screenshot through the live iframe.
Serialize the editor's live-edited document (`frame.content()`), strip the injected
`<base>`, and render it through the **same top-document path** as the renderer. A
bare-iframe-vs-top-document control proved a top-doc render of iframe content is SSIM
**1.0** — so the artifact is purely the screenshot-through-iframe step.

### 3. `srcdoc` needs a `<base href>` or every relative asset 404s
The editor mounts the design via `iframe.srcdoc` (for CSS isolation + portability). An
`srcdoc` document has no URL, so relative paths like `assets/vid/ad1.mp4` resolve against
the *host page* → 404. Inject `<base href="<design folder>">` right after `<head>`.

### 4. Frame-accurate video needs `requestVideoFrameCallback`, raced with a timeout
`seeked` fires before the decoded frame is *painted*. Two contexts can screenshot a
one-frame-different image. Wait on `video.requestVideoFrameCallback`. But on an already-
painted *paused* video it may never re-fire — so race it with a `setTimeout` fallback.

### 5. Moving the frame to `<body>` for a clean capture re-triggers the editor's hide rule
The editor injects `body>*{display:none}` to hide gallery chrome. Reparent the design
frame to `<body>` for an isolated render and that rule hides it → black frame. Remove the
editor's injected `<style id="ce-iframe-css">` before reparenting (the renderer's
`isolateFrame` now does this defensively).

## The design decision that came out of it
Position edits move via **`margin-left`/`margin-top`**, never `transform`. Margins offset
an element whether it's in flow or absolutely positioned — even when anchored by both
`left` and `right` (full-width bars) — and **no keyframe animates margin**, so a dragged,
transform-animated element keeps animating. This is cleaner than the plan's original
wrapper/CSS-var idea, and the t=mid AND t=end SSIM=1.0 proves it doesn't fight the
animation (a transform fight would diverge by t=end).
