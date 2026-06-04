// ============================================================================
//  scripts/lib/clip-cap.mjs — bound bg-frame extraction (the OOM gate)
// ============================================================================
//  A motion bg clip is pre-extracted to PNG frames at render FPS so SyncedVideo
//  can show a deterministic <img> per render frame. WITHOUT a cap a long source
//  clip extracts every frame: a 26s clip @ 30fps = 780 PNGs decoded into memory →
//  OOM (the observed failure). But the displayed index is round(t·fps) % count
//  with render time t in [0, exportDuration) — so any frame past exportDuration is
//  NEVER shown. Extracting beyond it is pure waste. We cap the extraction window
//  to the export duration, then clamp to a hard frame ceiling as a memory backstop.
//
//  Pure + unit-testable; run-campaign.mjs feeds it the resolved durations.
// ============================================================================

// Hard ceiling on extracted bg frames regardless of export duration (20s @ 30fps).
export const MAX_BG_FRAMES = 600;

// Decide how many seconds of a bg clip to extract.
//   requestedSpanSec  — the user's trim span [clipStart,clipEnd] in seconds, or
//                       null for "the whole clip from clipStart on"
//   exportDurationSec — the rendered clip length D (frames past it never display)
//   fps               — extraction fps (render fps)
//   maxFrames         — hard memory ceiling
// Returns { spanSec, frames, capped, note }.
export function capBgExtraction({ requestedSpanSec, exportDurationSec, fps = 30, maxFrames = MAX_BG_FRAMES }) {
  const f = fps > 0 ? fps : 30;
  const byDuration = Math.max(1, Number(exportDurationSec) || 1);
  let spanSec = (typeof requestedSpanSec === "number" && requestedSpanSec > 0) ? requestedSpanSec : byDuration;
  const reasons = [];
  let capped = false;

  if (spanSec > byDuration) { spanSec = byDuration; capped = true; reasons.push(`export duration ${byDuration}s`); }
  const frameCeilingSec = maxFrames / f;
  if (spanSec > frameCeilingSec) { spanSec = frameCeilingSec; capped = true; reasons.push(`${maxFrames}-frame ceiling`); }

  const frames = Math.max(1, Math.ceil(spanSec * f));
  return {
    spanSec,
    frames,
    capped,
    note: capped ? `capped extraction to ${spanSec.toFixed(1)}s (${reasons.join(" + ")})` : null,
  };
}
