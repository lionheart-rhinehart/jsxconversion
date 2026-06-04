// ============================================================================
//  scripts/lib/media-scope.mjs — scope the media picker to the brand (Plan 3 · K)
// ============================================================================
//  The editor's media picker listed EVERY brand's media (AA design-system roots
//  are always on disk), so a franchisee campaign showed AA photos alongside its
//  own — a brand leak waiting to be placed. This decides WHICH media roots the
//  picker LISTS for a campaign: AA (or an unbranded/legacy plan) keeps the full
//  shared set; a franchisee sees only neutral audio + its own kit's media. The
//  per-campaign Kraken cache is added by the caller either way (always in-scope).
// ============================================================================
import { join } from "node:path";

// The AA brand slug — plan.brand matches data/brand.<slug>.json. A null/empty
// brand is a legacy AA plan (AA literals are legitimate there).
export const AA_BRAND_SLUG = "athletes-acceleration";

export function isAABrand(slug) {
  return !slug || slug === AA_BRAND_SLUG;
}

// Pure: return the brand-scoped LISTING roots (excluding the Kraken cache, which
// the caller appends per-campaign).
//   - AA / unknown brand → `sharedRoots` unchanged (back-compat).
//   - franchisee brand   → neutral audio + that kit's own asset dirs ONLY.
export function scopeMediaRoots({ brandSlug, sharedRoots = [], musicRoot = null, kitDir = null }) {
  if (isAABrand(brandSlug)) return [...sharedRoots];
  const roots = [];
  if (musicRoot) roots.push(musicRoot);
  if (kitDir) roots.push(join(kitDir, "assets"), join(kitDir, "uploads"));
  return roots;
}
