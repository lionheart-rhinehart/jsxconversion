#!/usr/bin/env node
// ============================================================================
//  scripts/media-dedup.mjs — figure out which Kraken-cache clips campaigns
//  ALREADY used (so a new campaign can pick only untouched footage).
//
//    node scripts/media-dedup.mjs            (report: used vs free cache clips)
//
//  Two signals identify a "used" cache clip:
//    • MOTION: a campaign's <id>.mp4 is a BYTE COPY of a cache clip → sha256 match.
//    • STATIC: a campaign's <id>.jpg is a FRAME GRAB of a cache clip → average-hash
//      (aHash) match. We sample several timestamps per cache clip (the old grab's
//      timestamp is unknown) and match within a small Hamming distance.
//  Words never matter here — this is pure pixel provenance.
// ============================================================================

import { readdirSync, existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";

const CACHE = "brand/kraken-cache";
const STATIC_DIR = "templates/multi-sport-foundations/assets";
const MOTION_DIR = "brand/video-templates/assets";
// campaigns to treat as ALREADY-USED (prefixes of their per-asset media files)
const USED_PREFIXES = ["msf", "conf"]; // angle 1, angle 2
const SELF_PREFIX = "mg";              // angle 3 (the one we're fixing)
const FRAME_TS = [0.5, 1.3, 2.2];      // timestamps to sample per clip
const AHASH_MATCH = 12;                // Hamming <= this ⇒ same footage

const sha = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");

// 64-bit average hash from an image/clip frame, via ffmpeg → 8x8 gray raw bytes.
function aHashFromArgs(inputArgs) {
  const r = spawnSync("ffmpeg", [...inputArgs, "-frames:v", "1",
    "-vf", "scale=8:8,format=gray", "-f", "rawvideo", "-"],
    { maxBuffer: 1 << 20 });
  if (r.status !== 0 || !r.stdout || r.stdout.length < 64) return null;
  const px = r.stdout.subarray(0, 64);
  let sum = 0; for (const v of px) sum += v; const avg = sum / 64;
  let hi = 0n, lo = 0n;
  for (let i = 0; i < 64; i++) {
    const bit = px[i] > avg ? 1n : 0n;
    if (i < 32) hi |= bit << BigInt(i); else lo |= bit << BigInt(i - 32);
  }
  return { hi, lo };
}
const aHashImage = (p) => { const h = aHashFromArgs(["-i", p]); return h ? [h] : []; };
const aHashClip = (p) => FRAME_TS.map((t) => aHashFromArgs(["-ss", String(t), "-i", p])).filter(Boolean);
function hamming(a, b) {
  const pc = (x) => { let c = 0n; while (x) { c += x & 1n; x >>= 1n; } return Number(c); };
  return pc(a.hi ^ b.hi) + pc(a.lo ^ b.lo);
}
const minDist = (set, hashes) => {
  let m = 64; for (const h of hashes) for (const s of set) m = Math.min(m, hamming(h, s)); return m;
};

console.error("[dedup] hashing campaign media (msf/conf) …");
const usedSha = new Set();        // sha256 of used mp4s
const usedAhash = [];             // aHash list of used stills/clip-frames
const listed = (dir, pred) => existsSync(dir) ? readdirSync(dir).filter(pred) : [];
for (const pre of USED_PREFIXES) {
  for (const f of listed(MOTION_DIR, (f) => f.startsWith(pre + "-") && f.endsWith(".mp4"))) {
    usedSha.add(sha(join(MOTION_DIR, f))); usedAhash.push(...aHashClip(join(MOTION_DIR, f)));
  }
  for (const f of listed(STATIC_DIR, (f) => f.startsWith(pre + "-") && /\.(jpg|jpeg|png)$/.test(f)))
    usedAhash.push(...aHashImage(join(STATIC_DIR, f)));
}
// angle-1 referenced one cache clip DIRECTLY — mark its sha used too (handled by cache scan below)

console.error(`[dedup] used: ${usedSha.size} mp4 sha + ${usedAhash.length} aHash frames. Scanning ${CACHE} …`);
const cache = readdirSync(CACHE).filter((f) => f.endsWith(".mp4"));
const used = [], free = [];
let i = 0;
for (const f of cache) {
  const p = join(CACHE, f);
  let reason = null;
  if (usedSha.has(sha(p))) reason = "sha";
  if (!reason) { const d = minDist(usedAhash, aHashClip(p)); if (d <= AHASH_MATCH) reason = `ahash:${d}`; }
  (reason ? used : free).push(f);
  if (++i % 40 === 0) console.error(`  …${i}/${cache.length}`);
}
console.log(JSON.stringify({ cacheTotal: cache.length, usedByOthers: used.length, free: free.length, used, free }, null, 2));
