// ============================================================================
//  test/centroids.test.mjs — per-archetype example centroids (T2.0)
// ============================================================================
//  The foundation for cluster-adherence (#15). Locks the centroid manifest's
//  contract: one centroid per (archetype, format), unit-norm, real CLIP+DINOv2
//  embedder matching the example index, every member a real example. A python
//  --selfcheck (skipped-with-note if python/torch absent) confirms unit-norm.
// ============================================================================

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const REPO = join(import.meta.dirname, "..");
const CENTROIDS = join(REPO, "templates/_archetype-centroids.json");
const INDEX = join(REPO, "templates/_example-index.json");

test("centroids manifest exists and is well-formed", () => {
  assert.ok(existsSync(CENTROIDS), "run: python scripts/example-sidecar/build_centroids.py");
  const c = JSON.parse(readFileSync(CENTROIDS, "utf8"));
  assert.equal(c.dim, 1792, "CLIP-L/14 (768) + DINOv2-L (1024) = 1792");
  assert.ok(c.count > 0 && c.centroids.length === c.count);
  assert.ok(!/FALLBACK/i.test(c.embedder), "centroids must be real CLIP+DINOv2, never the fallback space");
});

test("the centroid embedder matches the example index's embedder (same space)", () => {
  const c = JSON.parse(readFileSync(CENTROIDS, "utf8"));
  const idx = JSON.parse(readFileSync(INDEX, "utf8"));
  assert.equal(c.embedder, idx.diversity.embedder, "centroids vs index must share the embedder");
});

test("every centroid is unit-norm and keyed by a real (archetype, format)", () => {
  const c = JSON.parse(readFileSync(CENTROIDS, "utf8"));
  const idx = JSON.parse(readFileSync(INDEX, "utf8"));
  const seen = new Set();
  for (const r of c.centroids) {
    assert.ok(Math.abs(r.norm - 1) < 1e-4, `centroid ${r.archetype}/${r.format} not unit-norm (${r.norm})`);
    assert.ok(["static", "video"].includes(r.format));
    const key = `${r.archetype}/${r.format}`;
    assert.ok(!seen.has(key), `duplicate centroid for ${key}`);
    seen.add(key);
    assert.ok(r.count >= 1 && Array.isArray(r.memberIds) && r.memberIds.length === r.count);
    for (const id of r.memberIds) assert.ok(idx.examples[id], `member ${id} not in the example index`);
  }
});

test("python build_centroids.py --selfcheck passes (skipped if python absent)", () => {
  const r = spawnSync("python", ["scripts/example-sidecar/build_centroids.py", "--selfcheck"], { cwd: REPO, encoding: "utf8" });
  if (r.error && r.error.code === "ENOENT") { console.error("    (skipped: python not on PATH)"); return; }
  assert.equal(r.status, 0, `selfcheck failed: ${r.stderr}`);
});
