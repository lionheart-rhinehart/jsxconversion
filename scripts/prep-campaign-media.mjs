#!/usr/bin/env node
// ============================================================================
//  scripts/prep-campaign-media.mjs — plan-driven, per-campaign media mint.
//
//    node scripts/prep-campaign-media.mjs <campaign> [--angle <id>]
//
//  Reads campaigns/<campaign>/creative-plan.json and, for every asset, fills the
//  media it declares from THAT campaign's own Kraken cache
//  (brand/kraken-cache/<campaign>/), one DISTINCT source clip per asset (distinct
//  drill type where possible), favouring build/power footage first.
//    • static assets  → frame-grab to the path in asset.media  (./assets/<f>.jpg,
//                       resolved under templates/multi-sport-foundations/)
//    • motion assets  → the .mp4 copied to the path in asset.clip (repo-relative)
//
//  Generalises the AA-hardcoded scripts/prep-media.mjs (flat cache / fixed 17-id
//  list / "mg" prefix) so any campaign — incl. franchisees — can mint cleanly.
//  Hand placement stays sacred: this fills BACKGROUND media only; it never moves
//  a layer.
// ============================================================================

import { readdirSync, existsSync, copyFileSync, readFileSync, rmSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { spawnSync } from "node:child_process";

const CACHE_ROOT = "brand/kraken-cache";
const STATIC_BASE = "templates/multi-sport-foundations"; // asset.media is "./assets/..." relative to here

const args = process.argv.slice(2);
const campaign = args.find((a) => !a.startsWith("--"));
const angleId = args.includes("--angle") ? args[args.indexOf("--angle") + 1] : null;
if (!campaign) { console.error("usage: node scripts/prep-campaign-media.mjs <campaign> [--angle <id>]"); process.exit(2); }

const planPath = join("campaigns", campaign, "creative-plan.json");
if (!existsSync(planPath)) { console.error(`[prep] no plan at ${planPath}`); process.exit(1); }
const plan = JSON.parse(readFileSync(planPath, "utf8"));

const cacheDir = join(CACHE_ROOT, campaign);
if (!existsSync(cacheDir)) { console.error(`[prep] no cache at ${cacheDir} — pull media first (kraken-pull --per-campaign)`); process.exit(1); }

// Build/power footage first ("built, not measured"), then speed/agility, then the rest.
const DRILL_PRIORITY = [
  "box-jump", "box-jumps", "broad-jump", "broad-jumps", "vertical-jump", "squat-jump",
  "hurdle-jumps", "trap-bar-jumps", "jumping", "sled-push", "deadlift", "med-ball-throw",
  "kettlebell-squat", "kettlebell-squats", "bench-press", "split-squat", "bulgarian-split-squat",
  "squat", "dumbbell-swing", "dumbbell-squats", "weighted-march", "band-work", "lateral-lunge",
  "overhead-carry", "lunge", "hip-thrusts", "pull-ups", "push-ups", "sprinting", "agility-drill",
];
const drillOf = (f) => {
  const m = f.match(/-action-clip-([a-z-]+?)-(high-school|middle-school|mixed|unknown)/);
  return m ? m[1] : "_other";
};

const cacheClips = readdirSync(cacheDir).filter((f) => f.endsWith(".mp4"));
if (!cacheClips.length) { console.error(`[prep] no .mp4 in ${cacheDir}`); process.exit(1); }
const byDrill = {};
for (const f of cacheClips) (byDrill[drillOf(f)] = byDrill[drillOf(f)] || []).push(f);

// Ordered, distinct-drill pick pool: priority drills first, then any remaining.
const orderedDrills = [...DRILL_PRIORITY.filter((d) => byDrill[d]), ...Object.keys(byDrill).filter((d) => !DRILL_PRIORITY.includes(d))];
const usedSrc = new Set();
const usedDrills = new Set();
function nextClip() {
  // first pass: a DISTINCT drill type not used yet (scene diversity)
  for (const d of orderedDrills) {
    if (usedDrills.has(d)) continue;
    const pool = (byDrill[d] || []).filter((f) => !usedSrc.has(f));
    if (pool.length) { usedSrc.add(pool[0]); usedDrills.add(d); return pool[0]; }
  }
  // drills exhausted — fall back to any unused clip from any drill
  for (const d of orderedDrills) {
    const pool = (byDrill[d] || []).filter((f) => !usedSrc.has(f));
    if (pool.length) { usedSrc.add(pool[0]); return pool[0]; }
  }
  const any = cacheClips.find((f) => !usedSrc.has(f));
  if (any) { usedSrc.add(any); return any; }
  return null;
}

const angles = (plan.angles || []).filter((a) => !angleId || a.id === angleId);
let ok = 0, fail = 0, skip = 0;
for (const angle of angles) {
  console.log(`\n[prep] ${campaign} / ${angle.id}:`);
  for (const asset of angle.assets || []) {
    const isStatic = asset.format === "static";
    const decl = isStatic ? asset.media : asset.clip;
    if (!decl) { console.warn(`  ${asset.id}: no ${isStatic ? "media" : "clip"} path in plan — skip`); skip++; continue; }
    const src = nextClip();
    if (!src) { console.error(`  ${asset.id}: cache exhausted`); fail++; continue; }
    const srcPath = join(cacheDir, src);
    const drill = drillOf(src);
    const dest = isStatic ? join(STATIC_BASE, decl.replace(/^\.\//, "")) : decl;
    mkdirSync(dirname(dest), { recursive: true });
    rmSync(dest, { force: true });
    if (isStatic) {
      // representative bright frame (thumbnail), not a fixed seek
      const r = spawnSync("ffmpeg", ["-y", "-i", srcPath, "-vf", "thumbnail", "-frames:v", "1", "-q:v", "3", dest], { stdio: "ignore" });
      if (r.status === 0 && existsSync(dest)) { console.log(`  ${asset.id.padEnd(4)} ${drill.padEnd(16)} → frame ${decl}`); ok++; }
      else { console.error(`  ${asset.id}: ffmpeg frame-grab failed (${src})`); fail++; }
    } else {
      copyFileSync(srcPath, dest); console.log(`  ${asset.id.padEnd(4)} ${drill.padEnd(16)} → clip  ${decl}`); ok++;
    }
  }
}
console.log(`\n[prep] done — ok:${ok} fail:${fail} skip:${skip} (distinct source clips: ${usedSrc.size})`);
if (fail) process.exit(1);
