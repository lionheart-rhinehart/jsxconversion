// creative-engine/editor/montage.mjs
//
// Phase D — multi-clip montage on ONE <video> slot.
//
// This is a CLEAN-ROOM helper. It imports NOTHING from
// scripts/lib/layer-config-video.mjs: that file's renderMultiClipSequence() renders
// each clip through the lossy "layer model" we're escaping and concats with `-c copy`
// (which only works when every clip already shares codec/fps/dims — arbitrary Kraken
// clips won't). We mined its ffmpeg invocation patterns read-only and reimplemented.
//
// TWO jobs, kept apart so this file is safe to load in a browser AND in Node:
//
//   (A) PURE TIMELINE MATH — `clipFrames()` / `montageAt()` / `cycleDurationMs()`.
//       Boundaries are defined in WHOLE FRAMES at a fixed FPS, never seconds, so the
//       live preview clock and the rendered concat cut at the identical instant (F2).
//       Browser-safe: no Node imports at the top of this file. BOTH the live driver
//       (editor.js) and seek.js use these (seek.js reads them off `window.CEMontage`,
//       which we attach below).
//
//   (B) RENDER — `buildMontageSource()`. Node-only; it DYNAMICALLY imports
//       node:child_process/fs/path INSIDE the function, so the top level stays
//       importable from the browser. Per clip: ffmpeg-trim [in,out], normalize to the
//       stage box at the fixed fps, and force EXACTLY clipFrames[i] frames (`-frames:v`)
//       so the actual segment length == montageAt()'s math. Then concat with the concat
//       FILTER (re-encode, hard cuts) — never `-c copy`.

const STAGE_W = 1080, STAGE_H = 1920;
const MIN_TOTAL = 1, MAX_TOTAL = 30;   // totalDuration clamp (seconds)

// frames per clip = round((out-in) * fps), at least 1. `clips` = [{src,in,out}, …]
export function clipFrames(clips, fps) {
  const f = Number(fps) || 30;
  return (clips || []).map((c) => {
    const dur = Math.max(0, (Number(c.out) || 0) - (Number(c.in) || 0));
    return Math.max(1, Math.round(dur * f));
  });
}

// total frames in ONE cycle (the concat is one cycle; it loops to fill totalDuration)
export function cycleFrames(clips, fps) {
  return clipFrames(clips, fps).reduce((a, b) => a + b, 0);
}
export function cycleDurationMs(clips, fps) {
  const f = Number(fps) || 30;
  return cycleFrames(clips, f) / f * 1000;
}

// Given a timeline position tMs, which clip is on screen and how far into it.
//   frame  = round(tMs/1000*fps) % cycleFrames     (loops the cycle forever)
//   walk the per-clip frame counts to find {clipIndex, frameInClip}
//   localOffsetMs = frameInClip / fps * 1000        (offset from the clip's `in`)
// Returns {clipIndex, frameInClip, localOffsetMs, clip}. Empty clips → clipIndex -1.
export function montageAt(clips, fps, tMs) {
  const f = Number(fps) || 30;
  const frames = clipFrames(clips, f);
  const cyc = frames.reduce((a, b) => a + b, 0);
  if (!cyc) return { clipIndex: -1, frameInClip: 0, localOffsetMs: 0, clip: null };
  let frame = Math.round((Number(tMs) || 0) / 1000 * f) % cyc;
  if (frame < 0) frame += cyc;
  for (let i = 0; i < frames.length; i++) {
    if (frame < frames[i]) {
      return { clipIndex: i, frameInClip: frame, localOffsetMs: frame / f * 1000, clip: clips[i] };
    }
    frame -= frames[i];
  }
  // unreachable (frame < cyc), but stay safe
  const last = frames.length - 1;
  return { clipIndex: last, frameInClip: frames[last] - 1, localOffsetMs: (frames[last] - 1) / f * 1000, clip: clips[last] };
}

// clamp/normalize the global transition. A crossfade can't exceed the shortest clip (or 2s);
// cut is the default. Shape stays tiny + portable: {type:'cut'|'crossfade', duration:<seconds>}.
export function normalizeTransition(t, clips) {
  const type = (t && t.type === 'crossfade') ? 'crossfade' : 'cut';
  let dur = Number(t && t.duration);
  if (!isFinite(dur) || dur <= 0) dur = 0.4;
  const durs = (clips || []).map((c) => Math.max(0, (Number(c.out) || 0) - (Number(c.in) || 0)));
  const shortest = durs.length ? Math.min(...durs) : 1;
  dur = Math.min(dur, 2, Math.max(0.1, shortest - 0.1));   // < shortest clip, ≤ 2s
  dur = Math.max(0.1, dur);
  return { type, duration: Math.round(dur * 100) / 100 };
}

// clamp/normalize a montage override bag value to a safe, portable shape
export function normalizeMontage(m, fps) {
  const f = Number(fps) || 30;
  const clips = (m && Array.isArray(m.clips) ? m.clips : [])
    .filter((c) => c && c.src)
    .map((c) => {
      const inS = Math.max(0, Number(c.in) || 0);
      let outS = Number(c.out);
      if (!isFinite(outS) || outS <= inS) outS = inS + 1;   // default 1s if unset/bad
      return { src: String(c.src), in: inS, out: outS };
    });
  let total = Number(m && m.totalDuration);
  if (!isFinite(total) || total <= 0) total = Math.min(MAX_TOTAL, Math.max(MIN_TOTAL, cycleDurationMs(clips, f) / 1000));
  total = Math.min(MAX_TOTAL, Math.max(MIN_TOTAL, total));
  return { clips, totalDuration: total, fps: f, transition: normalizeTransition(m && m.transition, clips) };
}

// ── RENDER (Node only — dynamic imports keep the top level browser-safe) ──────
// clips = [{src,in,out}] with already-RESOLVED absolute filesystem paths (the caller
// resolves /brand/… and campaign-relative srcs first). fps fixed. Writes ONE concat
// mp4 to outPath (one cycle); the renderer loops it via t % duration to fill total.
// Returns { ok, path, frames, reason }.
export async function buildMontageSource(clips, fps, outPath, opts = {}) {
  const { spawnSync } = await import('node:child_process');
  const fs = await import('node:fs');
  const path = await import('node:path');
  const f = Number(fps) || 30;
  const list = (clips || []).filter((c) => c && c.src);
  if (!list.length) return { ok: false, reason: 'montage has no clips' };

  const frames = clipFrames(list, f);
  const tmpDir = opts.tmpDir || path.join(path.dirname(outPath), '.montage-' + path.basename(outPath, path.extname(outPath)));
  fs.rmSync(tmpDir, { recursive: true, force: true });
  fs.mkdirSync(tmpDir, { recursive: true });
  const segFiles = [];

  // 1) per-clip: trim [in,out], normalize to the stage box (cover-crop), fix fps + sar,
  //    and force EXACTLY frames[i] frames so the segment length matches montageAt().
  const vf = `scale=${STAGE_W}:${STAGE_H}:force_original_aspect_ratio=increase,` +
             `crop=${STAGE_W}:${STAGE_H},fps=${f},setsar=1`;
  for (let i = 0; i < list.length; i++) {
    const c = list[i];
    const dur = Math.max(1 / f, (Number(c.out) || 0) - (Number(c.in) || 0));
    const seg = path.join(tmpDir, `seg_${String(i).padStart(3, '0')}.mp4`);
    const args = ['-y', '-loglevel', 'error',
      '-ss', String(Number(c.in) || 0), '-i', c.src, '-t', String(dur),
      '-an', '-vf', vf, '-frames:v', String(frames[i]),
      '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-r', String(f), seg];
    const r = spawnSync('ffmpeg', args, { encoding: 'utf8' });
    if (r.status !== 0 || !fs.existsSync(seg)) {
      const tail = String(r.stderr || r.error?.message || '').trim().split(/\r?\n/).filter(Boolean).slice(-2).join(' | ');
      fs.rmSync(tmpDir, { recursive: true, force: true });
      return { ok: false, reason: `clip ${i + 1} trim/normalize failed: ${tail || 'ffmpeg'}` };
    }
    segFiles.push(seg);
  }

  // 2) combine the normalized segments into ONE cycle. Two modes:
  //    • cut       → concat FILTER (re-encode, hard cuts) — frame-exact, total = Σ frames.
  //    • crossfade → xfade filter CHAIN (each transition overlaps D seconds, so the cycle
  //                  SHORTENS by (N-1)·D). Render-only — the live preview keeps hard cuts.
  const trans = normalizeTransition(opts.transition, list);
  const segDur = frames.map((n) => n / f);          // seconds per segment (frame-exact)
  const inputs = [];
  segFiles.forEach((s) => { inputs.push('-i', s); });

  let filter, totalFrames = frames.reduce((a, b) => a + b, 0);
  const fadeOk = trans.type === 'crossfade' && segFiles.length >= 2 && segDur.every((d) => d > trans.duration + 1e-3);
  if (trans.type === 'crossfade' && !fadeOk) {
    console.warn('[montage] crossfade skipped (need ≥2 clips each longer than the fade) — using hard cuts');
  }
  if (fadeOk) {
    const D = trans.duration;
    let acc = segDur[0], prev = '[0:v]', chain = [];
    for (let i = 1; i < segFiles.length; i++) {
      const offset = Math.max(0, acc - D);
      const out = (i === segFiles.length - 1) ? '[v]' : `[x${i}]`;
      chain.push(`${prev}[${i}:v]xfade=transition=fade:duration=${D.toFixed(4)}:offset=${offset.toFixed(4)}${out}`);
      prev = out; acc = acc + segDur[i] - D;
    }
    filter = chain.join(';');
    totalFrames = Math.round(acc * f);              // cycle frames after overlaps
  } else {
    filter = segFiles.map((_, i) => `[${i}:v]`).join('') + `concat=n=${segFiles.length}:v=1:a=0[v]`;
  }

  const cc = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', ...inputs,
    '-filter_complex', filter, '-map', '[v]', '-fps_mode', 'cfr', '-r', String(f),
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', outPath], { encoding: 'utf8' });
  fs.rmSync(tmpDir, { recursive: true, force: true });
  if (cc.status !== 0 || !fs.existsSync(outPath)) {
    const tail = String(cc.stderr || cc.error?.message || '').trim().split(/\r?\n/).filter(Boolean).slice(-2).join(' | ');
    return { ok: false, reason: (fadeOk ? 'xfade' : 'concat') + ' failed: ' + (tail || 'ffmpeg') };
  }
  return { ok: true, path: outPath, frames: totalFrames, crossfaded: fadeOk };
}

// Expose the PURE math to classic-script consumers (seek.js is injected as a plain
// <script>, not a module, so it can't `import` — it reads window.CEMontage instead).
if (typeof window !== 'undefined') {
  window.CEMontage = { clipFrames, cycleFrames, cycleDurationMs, montageAt, normalizeMontage, normalizeTransition };
}
