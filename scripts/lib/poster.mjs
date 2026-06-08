// ============================================================================
//  scripts/lib/poster.mjs — pick a representative still frame from an MP4
// ============================================================================
//  Shared by the example sidecar (render-examples.mjs) and the campaign perceptual
//  sidecar (#15 on video outputs). Samples a few deterministic timestamps and keeps
//  the LARGEST-bytes frame — a decoder-free non-blank heuristic (a black/transition
//  frame compresses tiny). Deterministic so re-runs are stable. Returns the dest path
//  on success, or null (ffmpeg failed on every seek). NODE-ONLY; needs ffmpeg on PATH.
// ============================================================================

import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, copyFileSync, existsSync, statSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";

const FRACS = [0.4, 0.5, 0.6, 0.95]; // 0.95 catches a count-up's final value frame

// Probe duration with ffprobe (seconds), or null if unavailable.
export function probeDuration(mp4Path) {
  const r = spawnSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", mp4Path], { encoding: "utf8" });
  if (r.status !== 0) return null;
  const d = parseFloat((r.stdout || "").trim());
  return Number.isFinite(d) && d > 0 ? d : null;
}

export function extractPoster(mp4Path, durationSec, destPng) {
  const dur = (Number.isFinite(durationSec) && durationSec > 0) ? durationSec : (probeDuration(mp4Path) || 3.0);
  const tmp = mkdtempSync(join(tmpdir(), "poster-"));
  try {
    let best = null, bestSize = -1;
    for (const f of FRACS) {
      const t = Math.max(0, dur * f);
      const cand = join(tmp, `${Math.round(f * 100)}.png`);
      const r = spawnSync("ffmpeg", ["-y", "-ss", String(t), "-i", mp4Path, "-frames:v", "1", cand], { stdio: "ignore" });
      if (r.status === 0 && existsSync(cand)) {
        const sz = statSync(cand).size;
        if (sz > bestSize) { bestSize = sz; best = cand; }
      }
    }
    if (!best) return null;
    mkdirSync(dirname(destPng), { recursive: true });
    copyFileSync(best, destPng);
    return destPng;
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
}
