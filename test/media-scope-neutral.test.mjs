// Phase A — the editor is brand-AGNOSTIC. Locks the "no brand photos leak when no
// brand is attached" guarantee so it can't silently regress.
import { test } from "node:test";
import assert from "node:assert/strict";
import { join } from "node:path";
import { listingRoots, AA_BRAND_SLUG } from "../scripts/lib/media-scope.mjs";

const SHARED = ["brand/aa/uploads", "brand/aa/assets"];
const MUSIC = "music-library";

test("NEUTRAL (no brand attached): music only — ZERO brand photo roots", () => {
  const roots = listingRoots({ attached: false, brandSlug: null, sharedRoots: SHARED, musicRoot: MUSIC });
  assert.deepEqual(roots, [MUSIC]);
  // the leak we are preventing: SHARED brand roots must NOT appear
  for (const r of SHARED) assert.ok(!roots.includes(r), `brand root leaked: ${r}`);
});

test("NEUTRAL with no music root → empty", () => {
  assert.deepEqual(listingRoots({ attached: false, brandSlug: null, sharedRoots: SHARED }), []);
});

test("ATTACHED + AA brand → full shared set (back-compat)", () => {
  assert.deepEqual(
    listingRoots({ attached: true, brandSlug: AA_BRAND_SLUG, sharedRoots: SHARED, musicRoot: MUSIC }),
    SHARED,
  );
});

test("ATTACHED + null brand (legacy AA campaign) → full shared set", () => {
  assert.deepEqual(
    listingRoots({ attached: true, brandSlug: null, sharedRoots: SHARED, musicRoot: MUSIC }),
    SHARED,
  );
});

test("ATTACHED + franchisee brand → that kit's dirs + music only (no AA photos)", () => {
  const roots = listingRoots({
    attached: true, brandSlug: "smaa", sharedRoots: SHARED, musicRoot: MUSIC, kitDir: "brand/smaa",
  });
  assert.deepEqual(roots, [MUSIC, join("brand/smaa", "assets"), join("brand/smaa", "uploads")]);
  for (const r of SHARED) assert.ok(!roots.includes(r), `AA root leaked under franchisee: ${r}`);
});
