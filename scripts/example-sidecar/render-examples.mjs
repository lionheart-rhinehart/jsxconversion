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
import { existsSync, mkdirSync, copyFileSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { verifyRender } from "../lib/render-qa.mjs";
import { EXAMPLES_DIR, exampleImagePath, exampleMotionPath } from "../lib/example-library.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..", "..");
const RENDERER = join(ROOT, ".claude", "skills", "jsx-to-mp4", "scripts", "render.mjs");
const OUT_DIR = join(ROOT, "out");
const REPORT = join(HERE, "render-report.json");
const RENDER_TIMEOUT_MS = 120000;

function loadManifest() {
  const path = join(HERE, "examples.manifest.json");
  const m = JSON.parse(readFileSync(path, "utf8"));
  if (!Array.isArray(m.examples)) throw new Error("manifest.examples must be an array");
  return m.examples;
}

// Render one example's JSX → out/<id>.<ext>, then QA, then copy to the contract path.
function renderOne(ex) {
  const srcJsx = join(ROOT, EXAMPLES_DIR, `${ex.id}.jsx`);
  if (!existsSync(srcJsx)) return { id: ex.id, format: ex.format, ok: false, png: null, mp4: null, reason: `source missing: ${EXAMPLES_DIR}/${ex.id}.jsx` };

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
  // video: copy the clip; the poster .png must come from a frame-extract step (TODO motion).
  const destMp4 = join(ROOT, exampleMotionPath(ex.id));
  copyFileSync(produced, destMp4);
  return { id: ex.id, format: ex.format, ok: false, png: null, mp4: exampleMotionPath(ex.id), reason: "video example: poster-frame extraction not implemented in the static slice" };
}

function main() {
  const examples = loadManifest();
  mkdirSync(OUT_DIR, { recursive: true }); // ensure out/ exists; per-example cleanup happens in renderOne (never nuke the whole dir)
  const results = [];
  for (const ex of examples) {
    process.stderr.write(`[render] ${ex.id} … `);
    const res = renderOne(ex);
    process.stderr.write(`${res.ok ? "ok" : "FAIL — " + res.reason}\n`);
    results.push(res);
  }
  writeFileSync(REPORT, JSON.stringify({ generatedAt: null, results }, null, 2) + "\n");
  const pass = results.filter((r) => r.ok).length;
  process.stderr.write(`[render] ${pass}/${results.length} passed QA → ${REPORT}\n`);
  // Non-zero exit only if EVERY render failed (a total breakage worth stopping on);
  // partial failures are recorded and the pipeline proceeds with the survivors.
  process.exit(pass === 0 ? 1 : 0);
}

main();
