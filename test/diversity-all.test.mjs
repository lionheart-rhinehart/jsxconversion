// ============================================================================
//  test/diversity-all.test.mjs — unified 109-example similarity map (T2.7)
// ============================================================================

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const REPO = join(import.meta.dirname, "..");
const MAP = join(REPO, "templates/_similarity-map.json");
const INDEX = join(REPO, "templates/_example-index.json");

test("the similarity map covers the full example set with valid pairs", () => {
  assert.ok(existsSync(MAP), "run: python scripts/example-sidecar/diversity_all.py");
  const m = JSON.parse(readFileSync(MAP, "utf8"));
  const idx = JSON.parse(readFileSync(INDEX, "utf8"));
  assert.equal(m.count, Object.keys(idx.examples).length, "count = the full example set (additive, not the per-pass 45)");
  assert.ok(Array.isArray(m.archetypePairs) && m.archetypePairs.length > 0);
  const archs = new Set(Object.values(idx.examples).map((e) => e.archetype));
  for (const p of m.archetypePairs) {
    assert.ok(archs.has(p.a) && archs.has(p.b), `pair archetypes are real (${p.a}/${p.b})`);
    assert.ok(typeof p.cosine === "number" && p.cosine >= -1 && p.cosine <= 1);
  }
  // sorted descending (closest pairs first — the selector reads the top)
  for (let i = 1; i < m.archetypePairs.length; i++) {
    assert.ok(m.archetypePairs[i - 1].cosine >= m.archetypePairs[i].cosine, "pairs sorted by similarity");
  }
  assert.ok(m.diversityAll && typeof m.diversityAll.vendi === "number");
});

test("python diversity_all.py --selfcheck passes (skipped if python absent)", () => {
  const r = spawnSync("python", ["scripts/example-sidecar/diversity_all.py", "--selfcheck"], { cwd: REPO, encoding: "utf8" });
  if (r.error && r.error.code === "ENOENT") { console.error("    (skipped: python not on PATH)"); return; }
  assert.equal(r.status, 0, `selfcheck failed: ${r.stderr}`);
});
