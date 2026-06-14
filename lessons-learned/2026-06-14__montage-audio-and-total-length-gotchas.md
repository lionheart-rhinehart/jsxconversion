---
title: Montage editor — audio-in-one-window + total-length gotchas (the "only clip 1 plays" bug)
date: 2026-06-14
branch: main
---

Three traps from building the montage audio + length controls in `creative-engine/editor/`. All cost
real back-and-forth; write them down so the next session doesn't re-pay.

## 1. "See + hear together" means INLINE, not an overlay

The audio picker was first built as a separate panel `.ce-audio-panel { position:absolute; inset:0;
z-index:10 }` — a full-screen cover over the montage panel, with **no `<video>` in it**. So choosing
audio hid the very clip you were scoring it against (Cody: "the audio and video need to be in the
same window"). Fix: **de-overlay it** to an inline flow section and **re-home the persistent node**
into `.ce-tr-controls` on each `renderTrimmer()` (`controls.appendChild(els.audPanel)`), rather than
re-building the markup. Moving the existing node keeps every `els.aud*` ref + once-bound listener
intact — no re-wiring, no lost handlers.

**Why:** a picker you toggle *to* (separate panel / extra button) fights the task. The thing you're
auditioning audio against must be visible at the same time, in the same window.

**How to apply:** when a control modifies media, render it beside a live preview of that media, not
in a panel that covers it. Re-home a persistent DOM node to preserve wiring instead of re-emitting markup.

## 2. The "only clip 1 plays" bug = total length shorter than the clip cycle

Symptom: ▸ Preview (and the design canvas, and the render) played only the first clip on a loop, not
all three. Root cause chain:
- `montageAt(clips, fps, tMs)` loops the **full clip cycle** internally (`% cyc`). But the preview
  driver feeds it `tMs = elapsed % totalMs`. If `totalDuration` < the clips' cycle, `tMs` never
  reaches the later clips → stuck on clip 1. The **render truncates the same way** (output is
  `totalDuration` long; the cycle fills/truncates to it).
- And `montageUserTotal = !!(existing.clips.length)` on open *pinned* the total just because clips
  existed, which **disabled the auto-extend** in `commitMontage` — so adding a clip never grew the
  total to fit it.

Fix (one invariant, enforced in BOTH the editor and the renderer): **`totalDuration` can never fall
below the clip cycle.** Added the floor to `normalizeMontage` (`floor = max(MIN_TOTAL, cycleSec)`),
so the render is correct regardless of how the bag was written, plus the editor floors on every
commit. And pin `montageUserTotal` only when the saved total *exceeds* the cycle (the user
deliberately extended it), via `pinnedFromExisting()`.

**Why:** a montage can't be shorter than its clips played once — anything less silently drops clips,
and it looks like a playback bug, not a length setting.

**How to apply:** when a "total length" governs a looped/concatenated timeline, floor it at the
natural cycle length in the **normalize** step (single source of truth for editor + render). Never
let "has content" stand in for "user pinned a value."

## 3. Commit-on-every-input re-decodes the waveform / kills playback

`commitMontage()` calls `refreshArrange()` → rebuilds the trimmer → re-decodes the waveform and stops
playback. Wiring the volume slider's `input` (fires continuously) straight to `commitAudio()` made it
re-decode on every pixel of drag. Fix: **persist audio to the bag without a full Arrange rebuild**
(`commitAudio` writes `setOverride` directly, no `refreshArrange`), and commit the volume slider on
`change` (release), live-updating `audioEl.volume` on `input`.

**How to apply:** continuous inputs (sliders) → live-update cheap state on `input`, persist on
`change`. Keep a "commit to bag" path that doesn't trigger the heavy re-render.

## Testing note (carries the 2026-06-12 lesson)
All of this was verified with **real `page.mouse` / real playback** in headless puppeteer
(`phase-d-audio-live`, `phase-d-montage-length`), asserting on actual state: `video.src` cycling
through all clip srcs, `audioEl.currentTime` advancing then wrapping, `montage.totalDuration` in the
bag. Synthetic events would have hidden every one of these.
