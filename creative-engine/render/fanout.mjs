// creative-engine/render/fanout.mjs
//
// 5.4 — orchestrate the brand fan-out: 1 approved master → N brands → pooled render →
// route each output to that brand's destination folder.
//
//   masterOverrides + binding + chosen brands
//     → cloneForBrand() per brand (swap ONLY the 5 vars)
//     → one render job per brand (out = brand.dest/<id>.<ext>)
//     → runPool() renders them N-at-a-time
//
// Includes diffOverrides() — the PROOF primitive: it returns exactly which
// (elementKey, field) pairs differ between the master and a brand bag, so the
// evidence can assert "only name/color/logo/eyebrow/media changed".

import path from 'node:path';
import { runPool } from './pool.mjs';
import { cloneForBrand, getBrands, boundKeys } from './brands.mjs';

// Flatten an override bag to a map of "fN:eM|field" → value, for diffing.
function flatten(bag) {
  const flat = {};
  for (const key of Object.keys(bag || {})) {
    if (key.indexOf('__') === 0) continue;
    const ov = bag[key] || {};
    for (const field of Object.keys(ov)) flat[`${key}|${field}`] = JSON.stringify(ov[field]);
  }
  return flat;
}

// Return the (key|field) entries that differ between master and brand bag.
export function diffOverrides(master, brand) {
  const a = flatten(master), b = flatten(brand);
  const changed = [];
  for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) {
    if (a[k] !== b[k]) changed.push(k);
  }
  return changed;
}

// Build the per-brand jobs (no render). Returns [{ brand, overrides, job, changed }].
export function planFanout({ master, binding, brands, taggedPath, frameId, kind = 'mp4' }) {
  const allowed = boundKeys(binding);
  return brands.map((brand) => {
    const overrides = cloneForBrand(master, binding, brand);
    const changed = diffOverrides(master, overrides);
    const out = path.join(brand.dest, `${brand.id}.${kind === 'png' ? 'png' : 'mp4'}`);
    return {
      brand,
      overrides,
      changed,
      // any changed key NOT in the allowed (bound) set is a leak — the proof catches it
      leaked: changed.filter((c) => !allowed.has(c)),
      job: { id: brand.id, taggedPath, frameId, overrides, kind, out, dest: brand.dest },
    };
  });
}

// Full fan-out: plan → pooled render → manifest. opts mostly forwarded to runPool.
export async function runFanout({ master, binding, brandIds, taggedPath, frameId, kind = 'mp4', poolSize, manifestPath, registryFile, log = () => {} }) {
  const brands = getBrands(brandIds, registryFile);
  const planned = planFanout({ master, binding, brands, taggedPath, frameId, kind });
  for (const p of planned) {
    if (p.leaked.length) throw new Error(`brand ${p.brand.id}: override leak beyond the 5 vars: ${p.leaked.join(', ')}`);
    log(`  ${p.brand.id}: swaps ${p.changed.length} field(s) → ${p.job.out}`);
  }
  const manifest = await runPool(planned.map((p) => p.job), {
    size: poolSize, batchId: 'fanout', manifestPath,
    onResult: (r) => log(`  ${r.ok ? '✓' : '✗'} ${r.id} ${r.ms}ms${r.error ? ' ← ' + r.error.split('\n')[0] : ''}`),
  });
  return { planned, manifest };
}
