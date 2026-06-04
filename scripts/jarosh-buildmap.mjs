// TEMP one-off: build the by-angle Jarosh media map + repurpose job spec.
// Pulls the 3 source folders, drops promo-labelled items, tags each pool item
// with an angle affinity, assigns to each campaign's assets (type-aware,
// no-repeat-preferred), and emits: jarosh-repurpose.json (job spec) +
// jarosh-download-manifest.json (rows to fetch, with dest dir + cache name).
import { listFolderMedia, cacheFileName } from "./lib/kraken.mjs";
import { readFileSync, writeFileSync } from "node:fs";

const WS = "620313c9-f0ea-43f1-a0f0-102f888e4985";
const SRC_FOLDERS = [
  ["Summer Athlete - Creative", "7a432f97-9dae-42f2-969c-2ac2e8f92f45"],
  ["USED - summer creative", "eb1693ee-bf0e-4e39-ba38-df8d4e095faf"],
  ["IG stories", "9a5d4f27-1f91-424d-8bc4-2a4f9a452106"],
];
// dest angle folders (user mapping): 1=grind-trap, 2=confidence, 3=more-games
const TARGETS = [
  { src: "grind-trap-carmel", dest: "grind-trap-ankeny", destFolder: "angle 1", angle: "grind",
    kw: ["bench","deadlift","squat","sled","strength","nordic","dumbbell","med ball","band","lunge","hamstring","upper body","training"] },
  { src: "confidence-carmel", dest: "confidence-ankeny", destFolder: "angle 2", angle: "confidence",
    kw: ["pr bell","ringing","posing","group shot","talking head","multiple exercises","speaking"] },
  { src: "more-games-carmel", dest: "more-games-ankeny", destFolder: "angle 3", angle: "games",
    kw: ["accel","sprint","hurdl","lateral","shuffle","agility","multi-sport","multi sport","basketball","jump","vertical","running","hurdling"] },
];
// REAL FOOTAGE ONLY. The user wants creatives backed by real athlete footage —
// NOT designed graphics, promos, or finished campaign composites ($100-off summer).
// Exclude anything that isn't raw footage: Promo*, Graphic*, BG OVERLAY / CITY ON
// TOP / CALL AT BOTTOM / Pic # / Vid # (composites). Keeps Action Clip / Talking
// Head / Group Shot / Action Image / raw post + FB exports / raw photo.
const EXCLUDE_RE = /promo|^graphic\b|^bg overlay|^city on top|^call at bottom|^pic #|^vid #/i;

// Guarantee normalization: the source campaigns carry drifted phrasings of the
// guarantee (validator's guaranteeDrift blocks them — the SOURCE fails too).
// User chose "keep AA's verbatim", so normalize every variant to the ONE canonical
// (data/brand tier guarantee). Exact full-string swaps; harmless where absent.
const CANON_GUARANTEE = "+1 mph speed. +3\" vertical. 90 days. Or your training is on us.";
const GUARANTEE_SWAPS = [
  { from: "+1 mph speed. +3\" vertical. 90 days. Or we will train you for free until you do.", to: CANON_GUARANTEE },
  { from: "+1 mph. +3 inches. 90 days. Or we keep training them free.", to: CANON_GUARANTEE },
];

// Coach swaps ONLY (user: copy stays except the coach). AA's Coach Graham Wilkerson
// → Nick Jarosh (founder); credentials → his real background (Cincinnati Reds +
// college, NOT NFL). Ordered: specific credential strings before bare "CSCS".
const COACH_SWAPS = [
  { from: "CSCS · NFL-TRAINED", to: "CINCINNATI REDS · COLLEGE S&C" },
  { from: "CSCS · FOUNDER", to: "FOUNDER" },
  { from: "TRAINED NFL\nATHLETES", to: "PRO & COLLEGE\nATHLETES" },
  { from: "CSCS", to: "FOUNDER" },
  { from: "GRAHAM", to: "NICK" },
  { from: "WILKERSON", to: "JAROSH" },
  // AA proof points = NFL players Graham trained + an NFL-credential claim. False
  // for Nick Jarosh → replace with his real Reds/college background (longer first).
  { from: "TRAINED ZACK MARTIN · TED KARRAS · NICK MARTIN", to: "CINCINNATI REDS · COLLEGE ATHLETICS" },
  { from: "ZACK MARTIN · TED KARRAS · NICK MARTIN", to: "CINCINNATI REDS · COLLEGE ATHLETICS" },
  { from: "The same credential D1 and NFL strength coaches carry.", to: "Built on pro and college strength-and-conditioning experience." },
];

const isVideoMime = (m) => /video\//i.test(m || "");
const isVideoTitleExt = (t) => /\.(mp4|mov|webm|m4v|mkv)$/i.test(t || "");

// ---- 1. pull pool (exclude promos) ----
const pool = [];
for (const [fname, fid] of SRC_FOLDERS) {
  const rows = await listFolderMedia(WS, fid);
  for (const r of rows) {
    const title = r.title || "";
    if (EXCLUDE_RE.test(title)) continue; // real footage only — drop promo/graphic/composite
    const mime = r?.metadata?.mime_type || "";
    const isVideo = r.type === "video" || isVideoMime(mime) || isVideoTitleExt(title);
    pool.push({ id: r.id, row: r, title, isVideo, cache: cacheFileName(r), used: 0 });
  }
}
const vids = pool.filter((p) => p.isVideo);
const imgs = pool.filter((p) => !p.isVideo);
console.error(`pool: ${pool.length} (video:${vids.length} image:${imgs.length}) — REAL FOOTAGE ONLY (promo/graphic/composite excluded)`);

// ---- 2. angle affinity: assign each pool item to its best angle by keyword ----
function bestAngle(title) {
  const T = title.toLowerCase();
  let best = null, bestN = 0;
  for (const t of TARGETS) {
    const n = t.kw.reduce((a, k) => a + (T.includes(k) ? 1 : 0), 0);
    if (n > bestN) { bestN = n; best = t.angle; }
  }
  return best; // null if no keyword hit → goes to the shared pool
}
for (const p of pool) p.angle = bestAngle(p.title);

// per-angle queues (angle-matched first, then any), separated by type
function queueFor(angle, wantVideo) {
  const typed = (wantVideo ? vids : pool); // statics accept anything; motion needs video
  const matched = typed.filter((p) => p.angle === angle);
  const rest = typed.filter((p) => p.angle !== angle);
  return [...matched, ...rest]; // prefer angle-matched, then spill to others
}

// ---- 3. assign per campaign ----
const manifest = []; // {rowId, dest, cache, title}
const seenDownload = new Set();
const stageStatic = "templates/multi-sport-foundations/assets/jarosh"; // TEMPLATE_DIR-relative served
const stageMotion = "brand/kraken-cache";

function pick(queue, usedInAngle) {
  // prefer least-used, not-yet-used-in-this-angle
  let cand = queue.filter((p) => !usedInAngle.has(p.id));
  if (!cand.length) cand = queue.slice(); // allow repeat if exhausted
  cand.sort((a, b) => a.used - b.used);
  return cand[0];
}

const targetsOut = [];
for (const t of TARGETS) {
  const plan = JSON.parse(readFileSync(`campaigns/${t.src}/creative-plan.json`, "utf8"));
  const assets = plan.angles ? plan.angles.flatMap((a) => a.assets || []) : (plan.assets || []);
  const map = {};
  const usedInAngle = new Set();
  const vQ = queueFor(t.angle, true);
  const aQ = queueFor(t.angle, false);
  let nStatic = 0, nMotion = 0;
  for (const a of assets) {
    const isStatic = a.format === "static" || (a.media != null && a.clip == null);
    const queue = isStatic ? aQ : vQ;
    const choice = pick(queue, usedInAngle);
    if (!choice) continue;
    choice.used++; usedInAngle.add(choice.id);
    const destDir = isStatic ? stageStatic : stageMotion;
    const rel = isStatic ? `./assets/jarosh/${choice.cache}` : `${stageMotion}/${choice.cache}`;
    map[a.id] = rel;
    if (!seenDownload.has(choice.id + "|" + destDir)) {
      seenDownload.add(choice.id + "|" + destDir);
      manifest.push({ rowId: choice.id, destDir, cache: choice.cache, title: choice.title });
    }
    if (isStatic) nStatic++; else nMotion++;
  }
  console.error(`${t.src} → ${t.dest} [${t.destFolder}]: ${assets.length} assets (static:${nStatic} motion:${nMotion})`);
  targetsOut.push({
    source: t.src, dest: t.dest, location: "ankeny",
    textSwaps: [{ from: "CARMEL", to: "ANKENY" }, ...GUARANTEE_SWAPS, ...COACH_SWAPS],
    media: { policy: "replace", map },
    workspace: "jarosh", destFolder: t.destFolder,
  });
}

const spec = {
  brand: "jarosh-performance",
  dimensions: ["colors", "identity", "fonts", "location", "media"],
  targets: targetsOut,
};
writeFileSync("jarosh-repurpose.json", JSON.stringify(spec, null, 2));
writeFileSync("jarosh-download-manifest.json", JSON.stringify(manifest, null, 2));
console.error(`\nwrote jarosh-repurpose.json (${targetsOut.length} targets) + jarosh-download-manifest.json (${manifest.length} unique files to fetch)`);
