// creative-engine/render/test-fanout.mjs
//
// Evidence for 5.4 — brand fan-out. 1 master override set → all 6 registry brands.
//   node creative-engine/render/test-fanout.mjs
//
// Proves:
//   - each brand bag differs from the master ONLY in the 5 bound vars
//     (name/color/logo/eyebrow/media) — a per-field diff, asserted (no leak).
//   - all 6 render via the pool, each routed to its own dest folder.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runFanout } from './fanout.mjs';
import { loadRegistry } from './brands.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIX = path.join(__dirname, '_fixture', 'westfield.tagged.html');

// The approved MASTER's override set (what came out of the editor for the master design).
// Empty-ish baseline; fan-out swaps the 5 vars onto it. A real master could carry edits;
// the diff still isolates exactly the brand swaps.
const master = {
  'f0:e11': { text: 'TRAIN WITH PURPOSE' },   // a real master edit — must survive UNCHANGED across brands
};

// Per-design BINDING: which f0 element keys are each of the 5 vars (authored once per
// design from its data-edit-* roles; real keys verified present in the fixture).
const binding = {
  name:    { keys: ['f0:e4'] },
  eyebrow: { keys: ['f0:e6'] },
  logo:    { keys: ['f0:e3'] },
  media:   { keys: ['f0:e0'] },
  color:   { keys: ['f0:e4', 'f0:e8'] },
};

const brandIds = loadRegistry().map((b) => b.id);   // all 6
const outDirs = brandIds.map((id) => path.join(__dirname, '..', '..', 'out', 'fanout', id));
outDirs.forEach((d) => fs.rmSync(d, { recursive: true, force: true }));

console.log('--- fan-out: 1 master → 6 brands (png for speed; mp4 in prod) ---');
const { planned, manifest } = await runFanout({
  master, binding, brandIds, taggedPath: FIX, frameId: 'f0', kind: 'png', poolSize: 3,
  manifestPath: path.join(__dirname, '_out', 'fanout-manifest.json'),
  log: (m) => console.log(m),
});

// ── 5.4 proof: diff each brand bag vs master ────────────────────────────────
console.log('\n=== 5.4 DIFF PROOF (only the 5 vars may change) ===');
const SLOT_FIELDS = new Set(['text', 'src', 'color']);   // the only fields the 5 vars write
let allClean = true;
for (const p of planned) {
  // group changed (key|field) by which brand value they carry
  const masterEdit = 'f0:e11|text';   // the master's own edit
  const touchedMasterEdit = p.changed.includes(masterEdit);
  const onlyBoundFields = p.changed.every((c) => SLOT_FIELDS.has(c.split('|')[1]));
  const clean = p.leaked.length === 0 && !touchedMasterEdit && onlyBoundFields;
  allClean = allClean && clean;
  console.log(`  ${p.brand.id.padEnd(26)} changed: ${p.changed.join(', ')}  ${clean ? '✓' : '✗ LEAK'}`);
}

const rendered = manifest.jobs.filter((j) => j.ok).length;
const routedOk = planned.every((p) => fs.existsSync(p.job.out));
console.log('\nASSERTIONS:');
console.log(`  [${allClean ? 'PASS' : 'FAIL'}] every brand changed ONLY name/color/logo/eyebrow/media (master edit f0:e11 untouched)`);
console.log(`  [${rendered === 6 ? 'PASS' : 'FAIL'}] all 6 brands rendered via the pool (${rendered}/6)`);
console.log(`  [${routedOk ? 'PASS' : 'FAIL'}] each output routed to its brand dest folder`);
