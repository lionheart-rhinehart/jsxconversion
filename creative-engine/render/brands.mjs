// creative-engine/render/brands.mjs
//
// 5.4 — the brand registry + the clone-and-swap-5-vars primitive.
//
// Brand fan-out: take ONE approved master's override set → clone it per chosen brand
// → swap ONLY these 5 vars: name, color, logo, eyebrow (city+sport), media. Everything
// else stays byte-identical. The whole guarantee of fan-out is "zero extra work for 6
// clients" — so the swap must be SURGICAL and PROVABLE (a diff shows only the 5).
//
// HOW THE 5 VARS MAP TO THE OVERRIDE BAG: every var is just an override field on a
// known element key (apply-overrides.js already supports text/src/color):
//   name    → { text }   on the brand-name element
//   eyebrow → { text }   on the eyebrow (city·sport) element
//   logo    → { src  }   on the logo element
//   media   → { src  }   on the hero media element
//   color   → { color }  on each color-bearing element (a LIST of keys)
//
// The mapping from var → which element key(s) is the per-design BINDING (authored once
// per design from its data-edit-* roles; deterministic, not AI). The registry holds the
// VALUES. cloneForBrand merges {value → field} for each bound slot onto the master.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_REGISTRY = path.join(__dirname, 'brands', 'registry.json');

// var → which override FIELD it writes
const FIELD_FOR_SLOT = { name: 'text', eyebrow: 'text', logo: 'src', media: 'src', color: 'color' };
export const SWAP_SLOTS = Object.keys(FIELD_FOR_SLOT);

export function loadRegistry(file = DEFAULT_REGISTRY) {
  const raw = JSON.parse(fs.readFileSync(file, 'utf8'));
  return raw.brands || [];
}

export function getBrands(ids, file = DEFAULT_REGISTRY) {
  const all = loadRegistry(file);
  if (!ids || !ids.length) return all;
  const byId = Object.fromEntries(all.map((b) => [b.id, b]));
  return ids.map((id) => {
    if (!byId[id]) throw new Error(`brand "${id}" not in registry`);
    return byId[id];
  });
}

// Clone the master override bag and swap ONLY the 5 bound vars for `brand`.
// binding: { name:{keys,...}, color:{keys}, logo:{keys}, eyebrow:{keys}, media:{keys} }
//   each slot → { keys: ["fN:eM", ...] }  (color is typically a list; others single)
// Returns a NEW override bag (master untouched).
export function cloneForBrand(masterOverrides, binding, brand) {
  const out = JSON.parse(JSON.stringify(masterOverrides || {}));
  for (const slot of SWAP_SLOTS) {
    const bind = binding[slot];
    const value = brand[slot];
    if (!bind || value == null) continue;            // slot not bound for this design, or no brand value
    const field = FIELD_FOR_SLOT[slot];
    const keys = Array.isArray(bind.keys) ? bind.keys : [bind.keys];
    for (const key of keys) {
      out[key] = Object.assign({}, out[key], { [field]: value });
    }
  }
  return out;
}

// Which override keys the binding is ALLOWED to touch — used by the diff proof.
export function boundKeys(binding) {
  const set = new Set();
  for (const slot of SWAP_SLOTS) {
    const bind = binding[slot];
    if (!bind) continue;
    (Array.isArray(bind.keys) ? bind.keys : [bind.keys]).forEach((k) => set.add(`${k}|${FIELD_FOR_SLOT[slot]}`));
  }
  return set;
}
