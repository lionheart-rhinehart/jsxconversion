// ============================================================================
//  scripts/lib/render-qa.mjs — post-render truth check (G3a)
// ============================================================================
//  After a render "succeeds" (file exists), confirm it's actually a USABLE
//  creative — not a black/frozen video (the a40f632 "hyperloop"/black-bg class)
//  or a blank still. DECODER-FREE and ffprobe-FREE by design (S2): Node has no
//  image decoder and ffprobe/lavfi isn't guaranteed on PATH, so we use only
//  `ffmpeg` (already required by the pipeline) and compare extracted frame BYTES.
//
//  Tool-resilient: if ffmpeg is missing we DEGRADE (skipped, ok:true) rather than
//  fail every asset — a missing binary must never zero out a batch.
//
//  verifyRender(absPath, { kind, expectSeconds }) → { ok, severity, reason, durationSec? }
//    kind: "mp4" | "gif" | "png"
//    severity: "block" (real failure) — only set when ok=false
// ============================================================================

import { spawnSync } from "node:child_process";
import { existsSync, statSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

let _ffmpegOk = null;
function ffmpegAvailable() {
  if (_ffmpegOk === null) {
    try { _ffmpegOk = spawnSync("ffmpeg", ["-version"], { stdio: "ignore" }).status === 0; }
    catch { _ffmpegOk = false; }
  }
  return _ffmpegOk;
}

// Parse "Duration: HH:MM:SS.ss" from ffmpeg's stderr (no output file needed —
// ffmpeg prints stream info then exits). Returns seconds or null.
function probeDurationSec(absPath) {
  const r = spawnSync("ffmpeg", ["-i", absPath], { encoding: "utf8" });
  const text = `${r.stderr || ""}`;
  const m = text.match(/Duration:\s*(\d+):(\d+):(\d+(?:\.\d+)?)/);
  if (!m) return null;
  return Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3]);
}

// Extract one frame at time t to a PNG and return its bytes (or null).
function frameBytes(absPath, t, outPng) {
  const r = spawnSync("ffmpeg", ["-y", "-ss", String(t), "-i", absPath, "-frames:v", "1", outPng], { stdio: "ignore" });
  if (r.status !== 0 || !existsSync(outPng)) return null;
  try { return readFileSync(outPng); } catch { return null; }
}

const eqBuf = (a, b) => a && b && a.length === b.length && a.equals(b);

export function verifyRender(absPath, { kind = "mp4", expectSeconds = null } = {}) {
  if (!existsSync(absPath)) return { ok: false, severity: "block", reason: "output file missing" };
  const size = statSync(absPath).size;

  // Static still: decoder-free, only a size floor catches an empty/blank PNG.
  if (kind === "png") {
    if (size < 2048) return { ok: false, severity: "block", reason: `PNG suspiciously small (${size}B) — likely blank/failed` };
    return { ok: true };
  }

  // Motion (mp4/gif). Degrade gracefully if ffmpeg is unavailable.
  if (!ffmpegAvailable()) return { ok: true, skipped: true, reason: "ffmpeg unavailable — QA skipped" };
  if (size < 1024) return { ok: false, severity: "block", reason: `video suspiciously small (${size}B)` };

  const dur = probeDurationSec(absPath);
  if (dur == null || dur <= 0.05) return { ok: false, severity: "block", reason: `no/zero duration (${dur})` };
  if (expectSeconds && expectSeconds > 0) {
    const ratio = Math.abs(dur - expectSeconds) / expectSeconds;
    if (ratio > 0.35) return { ok: false, severity: "block", reason: `duration ${dur.toFixed(2)}s off expected ${expectSeconds}s`, durationSec: dur };
  }

  // Frozen/black detection: sample 5 frames across the clip; if EVERY sampled
  // frame is byte-identical, nothing animated → dead render (black/frozen). A real
  // animation differs in at least one sample. Decoder-free (PNG bytes compare).
  const tmp = mkdtempSync(join(tmpdir(), "rqa-"));
  try {
    const ts = [0.05, dur * 0.25, dur * 0.5, dur * 0.75, Math.max(0, dur - 0.1)];
    const frames = [];
    for (let i = 0; i < ts.length; i++) {
      const b = frameBytes(absPath, ts[i], join(tmp, `f${i}.png`));
      if (b) frames.push(b);
    }
    if (frames.length >= 3) {
      const allSame = frames.every((f) => eqBuf(f, frames[0]));
      if (allSame) return { ok: false, severity: "block", reason: "all sampled frames identical — black/frozen render (footage didn't composite)", durationSec: dur };
    }
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }

  return { ok: true, durationSec: dur };
}
