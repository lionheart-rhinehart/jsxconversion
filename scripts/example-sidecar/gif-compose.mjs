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
//  composeGif({ chromePng, clips, durationSec, fps, outMp4 }) → true | throws.
//    clips = [{ clipPath, rect:{x,y,w,h}, grayscale? }] — one or more media layers
//    (e.g. before/after = two clips, one grayscale). Layered in order, then the keyed
//    chrome is overlaid last.
// ============================================================================

import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";

const KEY = "0x00ff00";

export function composeGif({ chromePng, clips, durationSec, fps = 30, outMp4 }) {
  if (!existsSync(chromePng)) throw new Error(`gif-compose: chrome PNG missing: ${chromePng}`);
  if (!Array.isArray(clips) || clips.length === 0) throw new Error("gif-compose: no clips");
  for (const c of clips) if (!existsSync(c.clipPath)) throw new Error(`gif-compose: clip missing: ${c.clipPath}`);

  // input 0 = chrome still; inputs 1..N = the clips (looped to fill the duration).
  const inputs = ["-loop", "1", "-t", String(durationSec), "-i", chromePng];
  for (const c of clips) inputs.push("-stream_loop", "-1", "-t", String(durationSec), "-i", c.clipPath);

  // base canvas → cover-crop each clip into its rect and overlay → key the chrome → overlay.
  // colorkey similarity 0.30 / blend 0.12 removes pure green incl. the anti-aliased edge
  // without eating opaque chrome (verified: no green fringe at the rect boundary).
  const parts = [`color=c=black:s=1080x1920:r=${fps}:d=${durationSec}[base0]`];
  clips.forEach((c, i) => {
    const { x, y, w, h } = c.rect;
    const gray = c.grayscale ? ",hue=s=0" : "";
    parts.push(`[${i + 1}:v]scale=${w}:${h}:force_original_aspect_ratio=increase,crop=${w}:${h}${gray},setsar=1[clip${i}]`);
    parts.push(`[base${i}][clip${i}]overlay=${x}:${y}:shortest=1[base${i + 1}]`);
  });
  parts.push(`[0:v]colorkey=${KEY}:0.30:0.12[chrome]`);
  parts.push(`[base${clips.length}][chrome]overlay=0:0:shortest=1,format=yuv420p[out]`);

  const args = [
    "-y", ...inputs,
    "-filter_complex", parts.join(";"),
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
