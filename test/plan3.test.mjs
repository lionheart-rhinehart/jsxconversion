// ============================================================================
//  test/plan3.test.mjs — regression tests for the Plan 3 infra/reliability fixes
// ============================================================================
//  Pure-logic only (no spawning, no network, no fs side effects): the OS-touching
//  glue stays thin and delegates the DECISION to these tested helpers (the R0
//  principle — an enforced fix can't silently regress). Run: `npm test`.
// ============================================================================

import { test } from "node:test";
import assert from "node:assert/strict";
import { join } from "node:path";

import { createServer } from "node:net";
import { selectOrphans, parseProcLines, filterPuppeteerCache } from "../scripts/lib/orphan-sweep.mjs";
import { scopeMediaRoots, isAABrand, AA_BRAND_SLUG } from "../scripts/lib/media-scope.mjs";
import { staleRenderReason } from "../scripts/lib/export-accounting.mjs";
import { findFreePort } from "../scripts/lib/free-port.mjs";

// ── J: orphan-sweep selects only shells whose parent is dead ────────────────────
test("J orphan-sweep: a headless-shell with a dead parent is reaped", () => {
  const procs = [
    { pid: 100, ppid: 9 },   // parent 9 is DEAD → orphan
    { pid: 200, ppid: 10 },  // parent 10 is ALIVE → spare (active render)
  ];
  const alive = new Set([10]);
  const kill = selectOrphans(procs, (pid) => alive.has(pid));
  assert.deepEqual(kill, [100]);
});

test("J orphan-sweep: a missing/zero parent pid counts as orphan", () => {
  const kill = selectOrphans([{ pid: 1, ppid: 0 }, { pid: 2, ppid: null }], () => true);
  assert.deepEqual(kill, [1, 2]);
});

test("J orphan-sweep: every live-parent shell is spared (no false kill)", () => {
  const procs = [{ pid: 1, ppid: 50 }, { pid: 2, ppid: 51 }];
  assert.deepEqual(selectOrphans(procs, () => true), []);
});

test("J orphan-sweep: parseProcLines parses 'pid|ppid|path' lines, ignores noise", () => {
  const out = parseProcLines("100|9|C:\\x\\chrome.exe\r\n200|10|\nnot-a-row\n\n300|1|/p/c");
  assert.deepEqual(out, [
    { pid: 100, ppid: 9, path: "C:\\x\\chrome.exe" },
    { pid: 200, ppid: 10, path: "" },
    { pid: 300, ppid: 1, path: "/p/c" },
  ]);
});

test("J orphan-sweep: filterPuppeteerCache keeps cache-path procs, drops browser + null-path", () => {
  const procs = [
    { pid: 1, ppid: 9, path: "C:\\Users\\me\\.cache\\puppeteer\\chrome\\win64-131\\chrome-win64\\chrome.exe" }, // render
    { pid: 2, ppid: 1, path: "" },                                              // sandboxed child (null path)
    { pid: 3, ppid: 9, path: "C:\\Program Files\\Google\\Chrome\\chrome.exe" }, // user's real browser
    { pid: 4, ppid: 9, path: "/home/me/.cache/puppeteer/chrome/linux-131/chrome" }, // posix render
  ];
  assert.deepEqual(filterPuppeteerCache(procs), [{ pid: 1, ppid: 9 }, { pid: 4, ppid: 9 }]);
});

// ── I: dev-server free-port auto-increment ──────────────────────────────────────
test("I free-port: an occupied base port increments to the next free one", async () => {
  // Bind a real socket on a base port, then prove the probe steps PAST it.
  const base = 5740;
  const blocker = createServer();
  await new Promise((res, rej) => { blocker.once("error", rej); blocker.listen(base, res); });
  try {
    const p = await findFreePort(base);
    assert.ok(p > base, `expected a port above the occupied ${base}, got ${p}`);
  } finally {
    await new Promise((res) => blocker.close(res));
  }
});

test("I free-port: a free base port is returned as-is", async () => {
  const base = 5760;
  const p = await findFreePort(base);
  assert.equal(p, base);
});

// ── K: media picker scoping ─────────────────────────────────────────────────────
const AA_ROOTS = ["brand/aa-design-system/project/uploads", "brand/aa-design-system/project/assets", "music-library"];

test("K media-scope: AA / legacy brand keeps the full shared set", () => {
  assert.deepEqual(scopeMediaRoots({ brandSlug: AA_BRAND_SLUG, sharedRoots: AA_ROOTS }), AA_ROOTS);
  assert.deepEqual(scopeMediaRoots({ brandSlug: null, sharedRoots: AA_ROOTS }), AA_ROOTS);
});

test("K media-scope: a franchisee gets neutral audio + its own kit only (no AA roots)", () => {
  const roots = scopeMediaRoots({
    brandSlug: "smaa", sharedRoots: AA_ROOTS,
    musicRoot: "music-library", kitDir: join("brand", "smaa"),
  });
  assert.deepEqual(roots, ["music-library", join("brand", "smaa", "assets"), join("brand", "smaa", "uploads")]);
  // The leak we're closing: no AA design-system root may appear.
  assert.ok(!roots.some((r) => String(r).includes("aa-design-system")));
});

test("K media-scope: a kit-less franchisee still excludes AA media (audio only)", () => {
  const roots = scopeMediaRoots({ brandSlug: "smaa", sharedRoots: AA_ROOTS, musicRoot: "music-library", kitDir: null });
  assert.deepEqual(roots, ["music-library"]);
});

test("K media-scope: isAABrand treats empty/aa-slug as AA, a franchisee as not", () => {
  assert.equal(isAABrand(null), true);
  assert.equal(isAABrand(""), true);
  assert.equal(isAABrand(AA_BRAND_SLUG), true);
  assert.equal(isAABrand("smaa"), false);
});

// ── F: export staleness guard ───────────────────────────────────────────────────
test("F staleness: a never-edited asset is current (null)", () => {
  assert.equal(staleRenderReason({ renderedAt: "2026-06-04T00:00:00Z" }), null);
  assert.equal(staleRenderReason({}), null);
});

test("F staleness: edited AFTER the last render is stale", () => {
  const r = staleRenderReason({ editedAt: "2026-06-04T02:00:00Z", renderedAt: "2026-06-04T01:00:00Z" });
  assert.ok(r && /after last render/.test(r));
});

test("F staleness: edited but never rendered is stale", () => {
  assert.match(staleRenderReason({ editedAt: "2026-06-04T02:00:00Z" }), /never rendered/);
});

test("F staleness: rendered AFTER the edit is current (null)", () => {
  assert.equal(staleRenderReason({ editedAt: "2026-06-04T01:00:00Z", renderedAt: "2026-06-04T02:00:00Z" }), null);
});

test("F staleness: an unparseable editedAt does not block (null)", () => {
  assert.equal(staleRenderReason({ editedAt: "not-a-date", renderedAt: "2026-06-04T01:00:00Z" }), null);
});
