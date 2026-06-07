// ============================================================================
//  scripts/example-sidecar/gif-compose.mjs — A3 action-clip GIF compositor
// ============================================================================
//  Builds an action-clip "GIF" (a short looping athlete clip playing inside a HELD
//  design) WITHOUT the locked renderer's deterministic-video path. Approach (Plan A3):
//    1. the design CHROME is rendered as a static PNG with the media region filled a
//       chroma-key color (#00ff00) — done by render-examples via the jsx-to-mp4 renderer;
//    2. here, ffmpeg scales/crops the clip to COVER the media rect, lays it on a black
//       canvas, then overlays the chrome with the key color removed (colorkey).
//  Fully deterministic (ffmpeg), no headless <video> hyperloop, no locked-zone edit.
//
//  composeGif({ chromePng, clipPath, rect, durationSec, fps, outMp4 }) → true | throws.
//    rect = { x, y, w, h } the media region in the 1080×1920 frame.
// ============================================================================

import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";

const KEY = "0x00ff00";

export function composeGif({ chromePng, clipPath, rect, durationSec, fps = 30, outMp4 }) {
  if (!existsSync(chromePng)) throw new Error(`gif-compose: chrome PNG missing: ${chromePng}`);
  if (!existsSync(clipPath)) throw new Error(`gif-compose: clip missing: ${clipPath}`);
  const { x, y, w, h } = rect;
  // cover-crop the clip to the media rect; black base; overlay clip; overlay keyed chrome.
  // colorkey similarity 0.30 / blend 0.12 removes pure green incl. the anti-aliased edge
  // without eating opaque chrome (verified: no green fringe at the rect boundary).
  const fc = [
    `[1:v]scale=${w}:${h}:force_original_aspect_ratio=increase,crop=${w}:${h},setsar=1[clip]`,
    `color=c=black:s=1080x1920:r=${fps}:d=${durationSec}[bg]`,
    `[bg][clip]overlay=${x}:${y}:shortest=1[base]`,
    `[0:v]colorkey=${KEY}:0.30:0.12[chrome]`,
    `[base][chrome]overlay=0:0:shortest=1,format=yuv420p[out]`,
  ].join(";");
  const args = [
    "-y",
    "-loop", "1", "-t", String(durationSec), "-i", chromePng,    // input 0: chrome still
    "-stream_loop", "-1", "-t", String(durationSec), "-i", clipPath, // input 1: clip (looped to fill)
    "-filter_complex", fc,
    "-map", "[out]",
    "-t", String(durationSec), "-r", String(fps),
    "-c:v", "libx264", "-pix_fmt", "yuv420p",
    // match the renderer's BT.709 tagging so the GIF's color matches the static set.
    "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709", "-color_range", "tv",
    "-crf", "20", "-movflags", "+faststart",
    outMp4,
  ];
  const r = spawnSync("ffmpeg", args, { encoding: "utf8" });
  if (r.status !== 0) {
    const tail = `${r.stderr || ""}`.trim().split("\n").slice(-3).join(" | ");
    throw new Error(`gif-compose: ffmpeg exit ${r.status}: ${tail}`);
  }
  if (!existsSync(outMp4)) throw new Error(`gif-compose: ffmpeg ok but ${outMp4} not produced`);
  return true;
}
