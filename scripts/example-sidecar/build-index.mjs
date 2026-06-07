// ============================================================================
//  scripts/example-sidecar/build-index.mjs  — Track B, step 4 (final) of the sidecar
// ============================================================================
//  Fold the four sidecar artifacts into ONE contract-conformant index:
//    manifest (kind/format/mediaStyleAccepts/slotShape)
//      + render-report (which examples passed render-QA → are eligible)
//      + embeddings.artifact (clusterMetrics: subLook/silhouette/cosines/NN + batch)
//      + labels (labeledBy provenance + any gemini-vs-authored disagreement flag)
//    → templates/_example-index.json
//
//  THE GATE: every assembled entry is run through validateExampleIndex (the locked
//  Track-A∥B contract module). If ANY entry has errors, this script PRINTS them and
//  EXITS NON-ZERO WITHOUT WRITING — a non-conformant entry is a drift the contract
//  must catch HERE, in Track B, not later in a campaign. Warnings are surfaced but
//  don't block.
//
//  Big embedding vectors are NOT copied in — they stay in embeddings.vectors.npz,
//  referenced by the diversity block, so the index stays small + diffable.
//
//  Node-only. New file (Track B). The ONLY writer of templates/_example-index.json.
// ============================================================================

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  INDEX_PATH, exampleImagePath, exampleMotionPath, exampleSourcePaths,
  validateExampleIndex,
} from "../lib/example-library.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..", "..");

const readJson = (p) => JSON.parse(readFileSync(p, "utf8"));

function main() {
  const manifest = readJson(join(HERE, "examples.manifest.json"));
  const report = readJson(join(HERE, "render-report.json"));
  const artifactPath = join(HERE, "embeddings.artifact.json");
  const videoArtifactPath = join(HERE, "embeddings.video.artifact.json");
  const labelsPath = join(HERE, "labels.json");
  const artifact = existsSync(artifactPath) ? readJson(artifactPath) : { examples: {}, batch: {} };
  // Video examples are embedded in a SEPARATE pass (a GIF poster ≈ its static sibling
  // by design; mixing them would inflate within-archetype cosine). Fold both. (Plan A3/D-2.)
  const videoArtifact = existsSync(videoArtifactPath) ? readJson(videoArtifactPath) : { examples: {}, batch: {} };
  const labels = existsSync(labelsPath) ? readJson(labelsPath) : { labels: {}, labeledBy: "unlabeled" };

  const okIds = new Set(report.results.filter((r) => r.ok && r.png).map((r) => r.id));
  const labeledAt = new Date().toISOString();
  const labeledBy = labels.labeledBy || "unlabeled";

  const examples = {};
  let skipped = 0;
  for (const ex of manifest.examples) {
    if (!okIds.has(ex.id)) { skipped++; continue; } // never index an example that failed render-QA
    // metrics come from the format-matched artifact (static or video); ids are disjoint.
    const m = artifact.examples?.[ex.id] ?? videoArtifact.examples?.[ex.id] ?? {};
    const embedder = artifact.examples?.[ex.id] ? artifact.embedder : (videoArtifact.examples?.[ex.id] ? videoArtifact.embedder : null);
    const lab = labels.labels?.[ex.id] || {};

    const clusterMetrics = {
      subLook: m.subLook ?? null,
      labeledBy,
      labeledAt,
      embedder: embedder ?? null,
      intraArchetypeMaxCosine: m.intraArchetypeMaxCosine ?? null,
      meanCrossArchetypeCosine: m.meanCrossArchetypeCosine ?? null,
      silhouette: m.silhouette ?? null,
      nearestNeighbor: m.nearestNeighbor ?? null,
    };
    // Surface a vision-LLM disagreement (when Gemini ran) so it's visible in the index.
    if (lab.agrees === false && lab.geminiArchetype) {
      clusterMetrics.labelDisagreement = { geminiArchetype: lab.geminiArchetype, authoredArchetype: lab.authoredArchetype };
    }

    const sourceJsx = exampleSourcePaths(ex.id).jsx;
    examples[ex.id] = {
      archetype: ex.archetype,
      format: ex.format,
      mediaStyleAccepts: ex.mediaStyleAccepts,
      slotShape: ex.slotShape,
      renderedImagePath: exampleImagePath(ex.id),
      ...(ex.format === "video" && existsSync(join(ROOT, exampleMotionPath(ex.id))) ? { motionPath: exampleMotionPath(ex.id) } : {}),
      ...(existsSync(join(ROOT, sourceJsx)) ? { sourcePath: sourceJsx } : {}),
      clusterMetrics,
    };
  }

  const index = {
    note: "Example-library index (Track B). One entry per render-QA-passed example: kind + media-style accepts + copy slotShape + the rendered artifact path + perceptual clusterMetrics. Produced by scripts/example-sidecar (render → QA → embed[CLIP+DINOv2] → label → assemble). Schema authority: scripts/lib/example-library.mjs.",
    schema: "example-library/v2",
    generatedAt: labeledAt,
    diversity: artifact.batch ?? {},        // static 'measured spectrum'
    ...(videoArtifact.batch && Object.keys(videoArtifact.batch).length ? { diversityVideo: videoArtifact.batch } : {}),
    examples,
  };

  // THE GATE — validate before writing.
  const { errors, warnings, count } = validateExampleIndex(index);
  for (const w of warnings) process.stderr.write(`[build-index] warn: ${w}\n`);
  if (errors.length) {
    process.stderr.write(`\n[build-index] REFUSING TO WRITE — ${errors.length} contract violation(s):\n`);
    for (const e of errors) process.stderr.write(`  ✗ ${e}\n`);
    process.exit(1);
  }

  const outPath = join(ROOT, INDEX_PATH);
  writeFileSync(outPath, JSON.stringify(index, null, 2) + "\n");
  process.stderr.write(`[build-index] wrote ${INDEX_PATH} — ${count} examples, 0 errors, ${warnings.length} warning(s)` +
    (skipped ? `, ${skipped} skipped (failed render-QA)` : "") + "\n");
  const b = index.diversity || {};
  process.stderr.write(`[build-index] diversity: maxCrossArchetype=${b.maxCrossArchetypeCosine} meanCrossArchetype=${b.meanCrossArchetypeCosine} ` +
    `meanSilhouette=${b.meanSilhouette} vendi=${b.vendiScore} maxIntraArchetype=${b.maxIntraArchetypeCosine} (labeledBy=${labeledBy})\n`);
}

main();
