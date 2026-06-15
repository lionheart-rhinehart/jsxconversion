#!/usr/bin/env node
// creative-engine/intake/cleanup-packages.mjs
//
// Disk hygiene for the intake working set. Every intake run copies an export (~20-30MB)
// into `_packages/<slug>/`, and the test suites leave throwaway packages behind
// (`ce-intake-test-*`, `ce-rlp-*`) — they accumulate to GBs over time. This prunes them.
//
// DRY-RUN BY DEFAULT (matches the repo's destructive-op discipline): it prints what it
// WOULD remove + reclaimed MB and writes nothing. Pass --apply to actually delete.
//
//   node creative-engine/intake/cleanup-packages.mjs                 # dry-run, test pkgs only
//   node creative-engine/intake/cleanup-packages.mjs --apply         # delete the test pkgs
//   node creative-engine/intake/cleanup-packages.mjs --max-age-days 30 [--apply]
//        # also prune REAL packages whose intake.json createdFrom.at is older than N days
//
// Classification:
//   - test/ephemeral: slug matches ^ce-intake-test- or ^ce-rlp-  → always a candidate.
//   - real: pruned ONLY with --max-age-days N, and only if older than N days.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const PACKAGES_DIR = path.join(__dirname, '_packages');

const TEST_PREFIX = /^(ce-intake-test-|ce-rlp-)/;

function dirSizeBytes(dir) {
  let total = 0;
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return 0; }
  for (const e of entries) {
    const p = path.join(dir, e.name);
    try {
      if (e.isDirectory()) total += dirSizeBytes(p);
      else total += fs.statSync(p).size;
    } catch { /* vanished mid-walk — ignore */ }
  }
  return total;
}

// Read a package's intake.json createdFrom.at (ISO). Returns ms epoch or null.
function packageCreatedAt(pkgDir) {
  try {
    const m = JSON.parse(fs.readFileSync(path.join(pkgDir, 'intake.json'), 'utf8'));
    const at = m && m.createdFrom && m.createdFrom.at;
    const t = at ? Date.parse(at) : NaN;
    return Number.isFinite(t) ? t : null;
  } catch { return null; }
}

// Decide what to prune. `nowMs` + `dir` are injected so tests are deterministic (no
// Date.now() hidden inside, and a temp fixture stands in for the real _packages/).
// Returns { candidates:[{slug,bytes,reason}], kept:[…] } — NO deletion.
export function planCleanup({ maxAgeDays = null, nowMs = Date.now(), dir = PACKAGES_DIR } = {}) {
  const candidates = [];
  const kept = [];
  let slugs = [];
  try { slugs = fs.readdirSync(dir, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name); }
  catch { return { candidates, kept }; }   // no _packages dir yet → nothing to do

  for (const slug of slugs) {
    const pkgDir = path.join(dir, slug);
    const bytes = dirSizeBytes(pkgDir);
    if (TEST_PREFIX.test(slug)) {
      candidates.push({ slug, pkgDir, bytes, reason: 'test package' });
      continue;
    }
    if (maxAgeDays != null) {
      const at = packageCreatedAt(pkgDir);
      const ageDays = at == null ? null : (nowMs - at) / 86400000;
      if (ageDays != null && ageDays > maxAgeDays) {
        candidates.push({ slug, pkgDir, bytes, reason: `real, ${ageDays.toFixed(0)}d old > ${maxAgeDays}d` });
        continue;
      }
    }
    kept.push({ slug, bytes });
  }
  return { candidates, kept };
}

export function cleanupPackages({ apply = false, maxAgeDays = null, log = console.log, nowMs = Date.now(), dir = PACKAGES_DIR } = {}) {
  const { candidates, kept } = planCleanup({ maxAgeDays, nowMs, dir });
  const mb = (b) => (b / 1024 / 1024).toFixed(1);
  const reclaim = candidates.reduce((a, c) => a + c.bytes, 0);

  log(`[cleanup] ${candidates.length} package(s) to prune, ${kept.length} kept  (${apply ? 'APPLYING' : 'DRY-RUN'})`);
  for (const c of candidates) {
    log(`  ${apply ? '✗ removed' : '· would remove'}  ${c.slug}  (${mb(c.bytes)} MB — ${c.reason})`);
    if (apply) { try { fs.rmSync(c.pkgDir, { recursive: true, force: true }); } catch (e) { log(`     ! failed: ${e.message}`); } }
  }
  log(`[cleanup] ${apply ? 'reclaimed' : 'would reclaim'} ${mb(reclaim)} MB` + (apply ? '' : '  (pass --apply to delete)'));
  return { removed: apply ? candidates.map((c) => c.slug) : [], wouldRemove: candidates.map((c) => c.slug), reclaimedMB: Number(mb(reclaim)) };
}

const isMain = process.argv[1] && process.argv[1].endsWith('cleanup-packages.mjs');
if (isMain) {
  const args = process.argv.slice(2);
  const apply = args.includes('--apply');
  const i = args.indexOf('--max-age-days');
  const maxAgeDays = i >= 0 ? Math.max(0, parseInt(args[i + 1], 10)) : null;
  cleanupPackages({ apply, maxAgeDays });
}
