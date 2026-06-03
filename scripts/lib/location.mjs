// ============================================================================
//  scripts/lib/location.mjs — campaign↔location reconciliation
// ============================================================================
//  AA's architecture is ONE city per campaign clone (grind-trap-carmel,
//  grind-trap-milford, …). Default mode ("clone") therefore only CHECKS that a
//  campaign resolves to a single city and that every creative shows it — no
//  mutation. Optional mode ("rotation") distributes cities across an angle's
//  assets; off by default so it never fights the clone workflow.
//
//  NODE-ONLY (reads data/*.json from disk).
// ============================================================================

import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { cityLabel } from "./roles.mjs";

// The location slugs set on a plan (angle.location ∪ plan.location), truthy only.
export function planLocations(plan) {
  const set = new Set();
  if (plan && typeof plan.location === "string" && plan.location.trim()) set.add(plan.location.trim());
  for (const a of (plan && plan.angles) || []) {
    if (a && typeof a.location === "string" && a.location.trim()) set.add(a.location.trim());
  }
  return [...set];
}

// Read a location tier's city tag, normalized UPPER (e.g. "carmel" → "CARMEL").
// Returns { slug, city, tierFound }.
export function locationCity(slug, dataDir) {
  if (!slug) return { slug: null, city: null, tierFound: false };
  const p = join(dataDir, `location.${slug}.json`);
  if (!existsSync(p)) return { slug, city: null, tierFound: false };
  try {
    const tags = JSON.parse(readFileSync(p, "utf8")).tags || {};
    const label = cityLabel(tags.city);
    return { slug, city: label ? label.toUpperCase() : null, tierFound: true };
  } catch {
    return { slug, city: null, tierFound: false };
  }
}

// Derive the campaign's canonical single city (clone model).
//   { slug, city, tierFound, ambiguous, count }
// ambiguous=true when a single campaign carries >1 location (use rotation mode).
export function cloneCity(plan, dataDir) {
  const locs = planLocations(plan);
  if (locs.length === 0) return { slug: null, city: null, tierFound: false, ambiguous: false, count: 0 };
  if (locs.length > 1) return { slug: null, city: null, tierFound: false, ambiguous: true, count: locs.length };
  return { ...locationCity(locs[0], dataDir), ambiguous: false, count: 1 };
}

// All location slugs that have a data/location.<slug>.json tier (for rotation).
export function availableLocations(dataDir) {
  try {
    return readdirSync(dataDir)
      .map((f) => /^location\.(.+)\.json$/.exec(f))
      .filter(Boolean)
      .map((m) => m[1]);
  } catch {
    return [];
  }
}

// Optional rotation mode (off by default). Deterministic round-robin over each
// angle's assets in document order; idempotent — only sets where unset, so
// hand-pins stick. MUTATES the plan in place; the caller persists it. Run at
// AUTHORING only (S9), never while the single-writer editor-server is serving.
export function assignLocations(plan, { locations, dataDir } = {}) {
  const pool = (locations && locations.length ? locations : availableLocations(dataDir)).filter(Boolean);
  if (!pool.length) return plan;
  for (const angle of (plan && plan.angles) || []) {
    let i = 0;
    for (const a of angle.assets || []) {
      if (!a.location) a.location = pool[i % pool.length];
      i++;
    }
  }
  return plan;
}
