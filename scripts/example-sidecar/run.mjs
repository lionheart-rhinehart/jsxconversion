// ============================================================================
//  scripts/example-sidecar/run.mjs  — Track B sidecar, single entry point
// ============================================================================
//  Runs the whole render → embed → label → assemble pipeline in order and stops on
//  the first HARD failure. Each stage is its own process (Node renders/validates;
//  Python embeds/labels) so a crash in one is isolated + legible.
//
//    1. render-examples.mjs  (node)   manifest → templates/_examples/<id>.png + QA
//    2. embed.py             (python) CLIP+DINOv2 → embeddings.{artifact.json,vectors.npz}
//    3. label.py             (python) Gemini kind cross-check → labels.json (no-op w/o key)
//    4. build-index.mjs      (node)   validate + write templates/_example-index.json
//
//  Usage:  node scripts/example-sidecar/run.mjs
//    PYTHON=python3 node scripts/example-sidecar/run.mjs   # override the interpreter
//  New file (Track B).
// ============================================================================

import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const PYTHON = process.env.PYTHON || "python";

const stages = [
  { name: "render", cmd: "node", args: [join(HERE, "render-examples.mjs")] },
  { name: "embed", cmd: PYTHON, args: [join(HERE, "embed.py")] },
  { name: "label", cmd: PYTHON, args: [join(HERE, "label.py")] },
  { name: "build-index", cmd: "node", args: [join(HERE, "build-index.mjs")] },
];

for (const s of stages) {
  process.stderr.write(`\n=== [${s.name}] ===\n`);
  const r = spawnSync(s.cmd, s.args, { stdio: "inherit" });
  if (r.error) { process.stderr.write(`[run] ${s.name} spawn error: ${r.error.message}\n`); process.exit(1); }
  if (r.status !== 0) { process.stderr.write(`[run] ${s.name} failed (exit ${r.status}) — stopping\n`); process.exit(r.status || 1); }
}
process.stderr.write("\n[run] pipeline complete → templates/_example-index.json\n");
