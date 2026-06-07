// ============================================================================
//  scripts/example-sidecar/render-examples.mjs  — Track B, step 1 of the sidecar
// ============================================================================
//  Render each manifest example's <id>.jsx to templates/_examples/<id>.png (the
//  labeled artifact the CLIP/DINOv2 + Gemini pass reads), then run render-QA so a
//  blank/failed still never reaches the embedding matrix. For a VIDEO example the
//  poster frame is the .png and the .mp4 is copied alongside (not in this slice —
//  all-static — but the path is here for when motion examples land).
//
//  RUNS SEQUENTIALLY on purpose: the static renderer launches puppeteer/Chrome per
//  file; parallel Chrome is the documented Windows leak path (see the plan's
//  cross-cutting risks). A hard per-render timeout guards a hung browser. Scale by
//  raising CONCURRENCY with a bounded pool — never unbounded.
//
//  Output: scripts/example-sidecar/render-report.json
//    { generatedAt:null, results:[ { id, format, ok, png, mp4|null, reason } ] }
//  Only ok:true rows are embedded downstream (embed.py reads this report).
//
//  Node-only. New file (Track B); imports nothing from Track A's working set.
// ============================================================================

import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, copyFileSync, readFileSync, writeFileSync, rmSync, statSync, mkdtempSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { verifyRender } from "../lib/render-qa.mjs";
import { composeGif } from "./gif-compose.mjs";
import { EXAMPLES_DIR, exampleImagePath, exampleMotionPath } from "../lib/example-library.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..", "..");
const RENDERER = join(ROOT, ".claude", "skills", "jsx-to-mp4", "scripts", "render.mjs");
const OUT_DIR = join(ROOT, "out");
const REPORT = join(HERE, "render-report.json");
const RENDER_TIMEOUT_MS = 120000;

// Poster-frame extraction for a VIDEO example: the contract's labeled artifact is a
// representative still (CLIP/DINOv2 + Gemini read it). Extract candidate frames at a
// few fixed fractions of the clip and keep the LARGEST-bytes one — a flat/black/
// transition frame compresses tiny, so largest-bytes is a decoder-free non-blank
// heuristic (mirrors embed.py's blank-std intent; render-qa house rule: no Node image
// decoder). Deterministic (fixed fractions) so re-runs are stable. Returns the dest
// path on success, or null (ffmpeg failed on every seek).
function extractPoster(mp4Path, durationSec, destPng) {
  const fracs = [0.4, 0.5, 0.6, 0.95]; // 0.95 catches a count-up's final value frame
  const tmp = mkdtempSync(join(tmpdir(), "poster-"));
  try {
    let best = null, bestSize = -1;
    for (const f of fracs) {
      const t = Math.max(0, durationSec * f);
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

function loadManifest() {
  const path = join(HERE, "examples.manifest.json");
  const m = JSON.parse(readFileSync(path, "utf8"));
  if (!Array.isArray(m.examples)) throw new Error("manifest.examples must be an array");
  return m.examples;
}

// Finalize a video example: copy the mp4 to the contract path, extract + QA a poster.
// Shared by the Stage-motion and GIF-composite paths.
function finalizeVideo(ex, producedMp4, durationSec) {
  const destMp4 = join(ROOT, exampleMotionPath(ex.id));
  mkdirSync(dirname(destMp4), { recursive: true });
  copyFileSync(producedMp4, destMp4);
  const destPng = join(ROOT, exampleImagePath(ex.id));
  const poster = extractPoster(producedMp4, durationSec, destPng);
  if (!poster) return { id: ex.id, format: ex.format, ok: false, png: null, mp4: exampleMotionPath(ex.id), reason: "poster extraction produced no frame" };
  const posterQa = verifyRender(destPng, { kind: "png" });
  if (!posterQa.ok) return { id: ex.id, format: ex.format, ok: false, png: null, mp4: exampleMotionPath(ex.id), reason: `poster frame blocked: ${posterQa.reason}` };
  return { id: ex.id, format: ex.format, ok: true, png: exampleImagePath(ex.id), mp4: exampleMotionPath(ex.id), reason: "ok" };
}

// GIF (A3): render the CHROME (static, green media region) via the renderer, then
// ffmpeg-composite the clip behind the keyed chrome → <id>.mp4, then poster it.
function renderGif(ex, srcJsx) {
  for (const f of [`${ex.id}.png`, `${ex.id}.mp4`, `${ex.id}-chrome.png`]) rmSync(join(OUT_DIR, f), { force: true });
  // 1) render the chrome (the example .jsx is a static React component over chroma-key)
  const r = spawnSync("node", [RENDERER, srcJsx], { cwd: ROOT, encoding: "utf8", timeout: RENDER_TIMEOUT_MS });
  if (r.status !== 0) {
    const tail = `${r.stderr || ""}`.trim().split("\n").slice(-3).join(" | ");
    return { id: ex.id, format: ex.format, ok: false, png: null, mp4: null, reason: `chrome render exit ${r.status}: ${tail}` };
  }
  const chromePng = join(OUT_DIR, `${ex.id}.png`);
  if (!existsSync(chromePng)) return { id: ex.id, format: ex.format, ok: false, png: null, mp4: null, reason: "chrome png not produced" };
  // 2) composite the clip(s) behind the keyed chrome
  const g = ex.gif || {};
  const clips = (g.clips || []).map((c) => ({ clipPath: join(ROOT, c.clip || ""), rect: c.rect, grayscale: !!c.grayscale }));
  for (const c of clips) {
    if (!existsSync(c.clipPath)) return { id: ex.id, format: ex.format, ok: false, png: null, mp4: null, reason: `gif clip missing: ${c.clipPath} (run kraken-pull?)` };
  }
  const outMp4 = join(OUT_DIR, `${ex.id}.mp4`);
  try {
    composeGif({ chromePng, clips, durationSec: g.duration, outMp4 });
  } catch (e) {
    return { id: ex.id, format: ex.format, ok: false, png: null, mp4: null, reason: `gif compose failed: ${e.message}` };
  }
  // 3) QA the composite (frozen-black catches a dead composite), then finalize
  const qa = verifyRender(outMp4, { kind: "mp4" });
  if (!qa.ok) return { id: ex.id, format: ex.format, ok: false, png: null, mp4: null, reason: `gif QA blocked: ${qa.reason}` };
  if (qa.skipped || qa.durationSec == null) return { id: ex.id, format: ex.format, ok: false, png: null, mp4: null, reason: "no ffmpeg/duration → cannot poster gif" };
  return finalizeVideo(ex, outMp4, qa.durationSec);
}

// Render one example's JSX → out/<id>.<ext>, then QA, then copy to the contract path.
function renderOne(ex) {
  const srcJsx = join(ROOT, EXAMPLES_DIR, `${ex.id}.jsx`);
  if (!existsSync(srcJsx)) return { id: ex.id, format: ex.format, ok: false, png: null, mp4: null, reason: `source missing: ${EXAMPLES_DIR}/${ex.id}.jsx` };

  if (ex.render === "gif-composite") return renderGif(ex, srcJsx);

  // Clean ONLY this example's own prior output (never the whole out/ dir — other
  // chats + the dev editor server keep tracked files there) so a stale file can't
  // masquerade as a fresh render.
  for (const ext of [".png", ".mp4"]) rmSync(join(OUT_DIR, `${ex.id}${ext}`), { force: true });

  const r = spawnSync("node", [RENDERER, srcJsx], { cwd: ROOT, encoding: "utf8", timeout: RENDER_TIMEOUT_MS });
  if (r.error) return { id: ex.id, format: ex.format, ok: false, png: null, mp4: null, reason: `renderer spawn error: ${r.error.message}` };
  if (r.status !== 0) {
    const tail = `${r.stderr || ""}`.trim().split("\n").slice(-3).join(" | ");
    return { id: ex.id, format: ex.format, ok: false, png: null, mp4: null, reason: `renderer exit ${r.status}: ${tail}` };
  }

  // render.mjs writes out/<basename>.<png|mp4>. Static → png; video → mp4 (+ we still
  // need a poster png; emitted by a later motion step — not exercised in the static slice).
  const isStatic = ex.format === "static";
  const producedExt = isStatic ? ".png" : ".mp4";
  const produced = join(OUT_DIR, `${ex.id}${producedExt}`);
  if (!existsSync(produced)) return { id: ex.id, format: ex.format, ok: false, png: null, mp4: null, reason: `renderer reported success but ${ex.id}${producedExt} not found in out/` };

  // QA the produced artifact (PNG size-floor / MP4 frozen-black) BEFORE trusting it.
  const qaKind = isStatic ? "png" : "mp4";
  const qa = verifyRender(produced, { kind: qaKind });
  if (!qa.ok) return { id: ex.id, format: ex.format, ok: false, png: null, mp4: null, reason: `render-QA blocked: ${qa.reason}` };

  // Copy into the contract location. For the static slice the PNG is the artifact.
  const destPng = join(ROOT, exampleImagePath(ex.id));
  mkdirSync(dirname(destPng), { recursive: true });
  if (isStatic) {
    copyFileSync(produced, destPng);
    return { id: ex.id, format: ex.format, ok: true, png: exampleImagePath(ex.id), mp4: null, reason: qa.skipped ? qa.reason : "ok" };
  }
  // video (Stage motion): verifyRender(mp4) returns durationSec; if ffmpeg was
  // unavailable it returns {skipped:true} with NO durationSec → we cannot extract a
  // poster, so this example can't be embedded. Fail THIS row cleanly. (Plan D-2.)
  if (qa.skipped || qa.durationSec == null) {
    const destMp4 = join(ROOT, exampleMotionPath(ex.id));
    mkdirSync(dirname(destMp4), { recursive: true });
    copyFileSync(produced, destMp4);
    return { id: ex.id, format: ex.format, ok: false, png: null, mp4: exampleMotionPath(ex.id), reason: "no ffmpeg/duration → cannot extract poster frame" };
  }
  return finalizeVideo(ex, produced, qa.durationSec);
}

function main() {
  // --only=<id> re-renders a SINGLE example (used by the viewer's live edit→render
  // loop) and merges its result into the existing render-report, leaving the other
  // rows untouched. No flag = render the whole manifest.
  const onlyArg = process.argv.find((a) => a.startsWith("--only="));
  const onlyId = onlyArg ? onlyArg.slice("--only=".length) : null;

  const all = loadManifest();
  const examples = onlyId ? all.filter((e) => e.id === onlyId) : all;
  if (onlyId && examples.length === 0) { process.stderr.write(`[render] no manifest example with id "${onlyId}"\n`); process.exit(1); }
  mkdirSync(OUT_DIR, { recursive: true }); // ensure out/ exists; per-example cleanup happens in renderOne (never nuke the whole dir)

  let results = [];
  for (const ex of examples) {
    process.stderr.write(`[render] ${ex.id} … `);
    const res = renderOne(ex);
    process.stderr.write(`${res.ok ? "ok" : "FAIL — " + res.reason}\n`);
    results.push(res);
  }
  if (onlyId && existsSync(REPORT)) {
    // merge the single result back into the prior report
    const prior = JSON.parse(readFileSync(REPORT, "utf8")).results || [];
    const merged = prior.filter((r) => r.id !== onlyId).concat(results);
    results = merged;
  }
  writeFileSync(REPORT, JSON.stringify({ generatedAt: null, results }, null, 2) + "\n");
  // Exit reflects THIS run's batch (the examples actually rendered), so a --only
  // failure is a non-zero exit even if other prior rows in the report passed.
  const batchPass = examples.filter((ex) => results.find((r) => r.id === ex.id && r.ok)).length;
  process.stderr.write(`[render] ${batchPass}/${examples.length} passed QA → ${REPORT}\n`);
  // Non-zero exit only if EVERY render in this batch failed.
  process.exit(batchPass === 0 ? 1 : 0);
}

main();
