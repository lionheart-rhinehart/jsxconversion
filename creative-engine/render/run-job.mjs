// creative-engine/render/run-job.mjs
//
// 5.2 — ONE render, run as a CHILD PROCESS of the verified v2 renderer
// (creative-engine/editor/render-frame.mjs). Child-process isolation is the whole
// point: a per-job timeout becomes child.kill(), a crash is just a non-zero exit
// code, and NEITHER can corrupt the parent scheduler or wedge the rest of the batch.
// In-process Promise.all could not give that guarantee.
//
// Adds: per-job timeout + retry-once. Returns a structured result EITHER way — a
// failed job is reported, never thrown past the pool (no silent drops).

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RENDER_FRAME = path.resolve(__dirname, '..', 'editor', 'render-frame.mjs');   // STATIC: tagged file + seek
const RENDER_LIVE = path.resolve(__dirname, '..', 'editor', 'render-live.mjs');     // ZERO-LOSS: http url + JS clock

export const DEFAULT_TIMEOUT_MS = 5 * 60 * 1000;   // 5 min/render — headless Chrome + ffmpeg

// Build the renderer argv for a job. Two renderers, ONE flag grammar:
//   live  (job.live)  → render-live.mjs <http-url>  <frameId>  (JS-driven exports; <video> seeks over HTTP)
//   static            → render-frame.mjs <tagged-file> <frameId>  (pre-tagged file, current behavior)
// Only the executable + first positional differ; --overrides / --at / --mp4 are identical for both
// (render-live.mjs:166-179, render-frame.mjs CLI). PNG (single frame at atMs) or MP4.
function buildArgs(job, ovPath) {
  const args = job.live
    ? [RENDER_LIVE, job.url, job.frameId]
    : [RENDER_FRAME, job.taggedPath, job.frameId];
  if (ovPath) args.push('--overrides', ovPath);
  if (job.kind === 'png') {
    args.push('--at', String(job.atMs ?? 0), job.out);
  } else {
    args.push('--mp4', job.out);
  }
  return args;
}

// Spawn one render-frame child; resolve {ok, code, signal, timedOut, stderr}.
function spawnOnce(job, ovPath, timeoutMs) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, buildArgs(job, ovPath), {
      stdio: ['ignore', 'ignore', 'pipe'],
    });
    let stderr = '';
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      try { child.kill('SIGKILL'); } catch (_) {}
    }, timeoutMs);
    child.stderr.on('data', (d) => { stderr += d.toString(); if (stderr.length > 8000) stderr = stderr.slice(-8000); });
    child.on('error', (err) => {
      clearTimeout(timer);
      resolve({ ok: false, code: null, signal: null, timedOut, stderr: String(err && err.message || err) });
    });
    child.on('close', (code, signal) => {
      clearTimeout(timer);
      const ok = !timedOut && code === 0 && fs.existsSync(job.out) && fs.statSync(job.out).size > 0;
      resolve({ ok, code, signal, timedOut, stderr: stderr.trim().split(/\r?\n/).slice(-6).join('\n') });
    });
  });
}

// Run one job with timeout + retry-once. `job`: {id, taggedPath, frameId, overrides,
// out, kind:'mp4'|'png', atMs?, timeoutMs?}. Always resolves a result object.
export async function runJob(job) {
  const t0 = Date.now();
  const timeoutMs = job.timeoutMs || DEFAULT_TIMEOUT_MS;
  // overrides → a temp JSON file the child reads (the CLI takes --overrides <file>)
  let ovPath = null;
  if (job.overrides && Object.keys(job.overrides).length) {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ce-job-'));
    ovPath = path.join(dir, 'ov.json');
    fs.writeFileSync(ovPath, JSON.stringify(job.overrides));
  }
  fs.mkdirSync(path.dirname(job.out), { recursive: true });

  const MAX_ATTEMPTS = 2;   // initial try + retry-once
  let attempts = 0;
  let last = null;
  try {
    for (let i = 1; i <= MAX_ATTEMPTS; i++) {
      attempts = i;
      last = await spawnOnce(job, ovPath, timeoutMs);
      if (last.ok) break;
    }
  } finally {
    if (ovPath) { try { fs.rmSync(path.dirname(ovPath), { recursive: true, force: true }); } catch (_) {} }
  }

  return {
    id: job.id,
    out: job.out,
    ok: last.ok,
    attempts,
    ms: Date.now() - t0,
    error: last.ok ? null : (last.timedOut ? `timeout after ${timeoutMs}ms` : `exit ${last.code}${last.signal ? '/' + last.signal : ''}: ${last.stderr || '(no stderr)'}`),
  };
}
