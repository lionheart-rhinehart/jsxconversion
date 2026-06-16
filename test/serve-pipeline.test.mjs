// Tests for the pipeline plumbing (2026-06-16): the publish CORE's frame selection
// (frameIds / limit / all) and the serve.mjs pipeline ENDPOINTS (/package/publish dry-run,
// /package/status). All OFFLINE — dry-run + a no-receipt status touch no network/creds.

import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { publishPackage } from "../creative-engine/dispatch/publish-core.mjs";
import { createServer, pipelineRoutes } from "../creative-engine/editor/serve.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = path.join(here, "..", "creative-engine", "intake", "_packages");
const SLUG = "ce-pipeline-test";
const dir = path.join(PKG_ROOT, SLUG);

function makeFixture() {
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), "<!doctype html><div data-edit-frame=f0></div>");
  fs.writeFileSync(path.join(dir, "intake.json"), JSON.stringify({
    schema: 1, slug: SLUG, entryHtml: "index.html", asset_base: `/x/${SLUG}/`,
    frames: [{ id: "f0", label: "A" }, { id: "f1", label: "B" }, { id: "f2", label: "C" }], ok: true,
  }));
}
const cleanup = () => fs.rmSync(dir, { recursive: true, force: true });
const listen = (s) => new Promise((r) => s.listen(0, () => r(s.address().port)));

test("publishPackage dry-run honors frameIds / limit / all", async () => {
  makeFixture();
  try {
    const all = await publishPackage({ pkgDir: dir, wsId: "ws", live: false });
    assert.deepEqual(all.frames.map((f) => f.id), ["f0", "f1", "f2"], "all frames by default");

    const one = await publishPackage({ pkgDir: dir, wsId: "ws", live: false, frameIds: ["f1"] });
    assert.deepEqual(one.frames.map((f) => f.id), ["f1"], "frameIds selects exactly that frame");

    const lim = await publishPackage({ pkgDir: dir, wsId: "ws", live: false, limit: 2 });
    assert.deepEqual(lim.frames.map((f) => f.id), ["f0", "f1"], "limit takes the first N");

    assert.equal(all.live, false, "dry-run never goes live");
  } finally { cleanup(); }
});

test("publishPackage throws (not exits) without a workspace", async () => {
  makeFixture();
  try {
    await assert.rejects(() => publishPackage({ pkgDir: dir, live: false }), /wsId required/);
  } finally { cleanup(); }
});

test("/package/publish dry-run plans the selected frame; missing wsId asks for one", async () => {
  makeFixture();
  const server = createServer({ ...pipelineRoutes() });
  try {
    const port = await listen(server);
    const post = (b) => fetch(`http://localhost:${port}/package/publish`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(b) }).then((r) => r.json());

    const dry = await post({ pkg: SLUG, scope: "this", frameId: "f1", wsId: "ws" });
    assert.equal(dry.ok, true);
    assert.equal(dry.live, false, "no confirm → dry-run");
    assert.deepEqual(dry.frames.map((f) => f.id), ["f1"]);

    const noWs = await post({ pkg: SLUG, scope: "batch" });
    assert.equal(noWs.ok, false);
    assert.equal(noWs.needWorkspace, true, "no wsId → needWorkspace");

    const badPkg = await post({ pkg: "nope-xyz", wsId: "ws" });
    assert.equal(badPkg.ok, false, "unknown pkg rejected");
  } finally { server.close(); cleanup(); }
});

test("/package/status reports per-frame state (unsent for a fresh fixture)", async () => {
  makeFixture();
  const server = createServer({ ...pipelineRoutes() });
  try {
    const port = await listen(server);
    const r = await fetch(`http://localhost:${port}/package/status?pkg=${SLUG}`).then((x) => x.json());
    assert.equal(r.ok, true);
    assert.equal(r.frames.length, 3);
    assert.ok(r.frames.every((f) => f.sent === false && f.approved === false && f.rendered === false), "no receipt → nothing sent/approved/rendered");
  } finally { server.close(); cleanup(); }
});
