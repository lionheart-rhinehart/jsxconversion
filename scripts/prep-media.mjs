#!/usr/bin/env node
// ============================================================================
//  scripts/prep-media.mjs — mint per-asset background media for a campaign from
//  the Kraken cache, using ONLY clips no other campaign has used. STATICS get a
//  frame-grab (.jpg); MOTION gets the clip copied (.mp4). One DISTINCT source clip
//  per asset.
//
//    node scripts/media-dedup.mjs > dedup-result.json   # first: who used what
//    node scripts/prep-media.mjs                          # then: pick from the free pool
//
//  Reads dedup-result.json (the `used` list = clips other campaigns already used)
//  and excludes them. Picks 17 clips of DISTINCT drill types from the free pool,
//  favouring "where it's built" strength/power footage. Overwrites mg-* outputs.
// ============================================================================

import { readdirSync, existsSync, copyFileSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const CACHE = "brand/kraken-cache";
const STATIC_DEST = "templates/multi-sport-foundations/assets";
const MOTION_DEST = "brand/video-templates/assets";
const PREFIX = "mg";
const DEDUP = "dedup-result.json";

// 13 statics + 4 motion. Each gets a DISTINCT drill type, picked from the free
// pool in this priority order (build/power/explosive first — "built, not measured").
const STATIC_IDS = ["A1", "A2", "A3", "A4", "B1", "B2", "C1", "C2", "D1", "D2", "E3", "E4", "F2"];
const MOTION_IDS = ["E1", "E2", "F1", "BR1"];
const DRILL_PRIORITY = [
  "box-jumps", "broad-jump", "broad-jumps", "vertical-jump", "squat-jump", "hurdle-jumps",
  "trap-bar-jumps", "jumping", "sled-push", "deadlift", "med-ball-throw", "kettlebell-squat",
  "kettlebell-squats", "bench-press", "split-squat", "bulgarian-split-squat", "squat",
  "dumbbell-swing", "dumbbell-squats", "weighted-march", "band-work", "lateral-lunge",
  "overhead-carry", "lunge", "hip-thrusts", "pull-ups", "push-ups", "sprinting", "agility-drill",
];

const drillOf = (f) => {
  const m = f.match(/-action-clip-([a-z-]+?)-(high-school|middle-school|mixed|unknown)/);
  return m ? m[1] : null;
};

const dedup = JSON.parse(readFileSync(DEDUP, "utf8"));
const usedSet = new Set(dedup.used);
const cache = readdirSync(CACHE).filter((f) => f.endsWith(".mp4"));
const free = cache.filter((f) => !usedSet.has(f));

// group FREE clips by drill type
const byDrill = {};
for (const f of free) { const d = drillOf(f); if (d) (byDrill[d] = byDrill[d] || []).push(f); }

// pick 17 distinct-drill free clips in priority order
const picks = [];
const usedDrills = new Set();
for (const d of DRILL_PRIORITY) {
  if (picks.length >= 17) break;
  if (usedDrills.has(d)) continue;
  const pool = byDrill[d];
  if (pool && pool.length) { picks.push([d, pool[0]]); usedDrills.add(d); }
}
// top up from any remaining free drills if priority list ran short
if (picks.length < 17) {
  for (const [d, pool] of Object.entries(byDrill)) {
    if (picks.length >= 17) break;
    if (usedDrills.has(d) || !pool.length) continue;
    picks.push([d, pool[0]]); usedDrills.add(d);
  }
}
if (picks.length < 17) { console.error(`[prep] only ${picks.length} free distinct-drill clips — need 17`); process.exit(1); }

const order = [...STATIC_IDS, ...MOTION_IDS];
let ok = 0, fail = 0;
console.log(`[prep] free pool: ${free.length} clips, ${Object.keys(byDrill).length} drill types. Assigning 17:`);
for (let i = 0; i < order.length; i++) {
  const id = order[i];
  const [drill, src] = picks[i];
  const srcPath = join(CACHE, src);
  const isStatic = STATIC_IDS.includes(id);
  if (isStatic) {
    const dest = join(STATIC_DEST, `${PREFIX}-${id}.jpg`);
    rmSync(dest, { force: true });
    const r = spawnSync("ffmpeg", ["-y", "-ss", "1.0", "-i", srcPath, "-frames:v", "1", "-q:v", "3", dest], { stdio: "ignore" });
    if (r.status === 0 && existsSync(dest)) { console.log(`  ${id.padEnd(4)} ${drill.padEnd(16)} → frame ${PREFIX}-${id}.jpg`); ok++; }
    else { console.error(`  ${id}: ffmpeg failed (${src})`); fail++; }
  } else {
    const dest = join(MOTION_DEST, `${PREFIX}-${id}.mp4`);
    rmSync(dest, { force: true });
    copyFileSync(srcPath, dest);
    console.log(`  ${id.padEnd(4)} ${drill.padEnd(16)} → clip  ${PREFIX}-${id}.mp4`);
    ok++;
  }
}
console.log(`[prep] done — ok:${ok} fail:${fail} (17 distinct FREE clips, none used by other campaigns)`);
if (fail) process.exit(1);
