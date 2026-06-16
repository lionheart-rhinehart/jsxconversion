// Test: the editor's Save round-trip. POST a bag to /package/overrides?pkg=<slug> →
// it persists to _packages/<slug>/overrides.json; GET returns it. Also: an unknown/invalid
// slug is rejected, and traversal (../) cannot escape the _packages tree. (Part B1.)

import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createServer, overridesRoutes } from "../creative-engine/editor/serve.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = path.join(here, "..", "creative-engine", "intake", "_packages");
const SLUG = "ce-save-rt-test";
const dir = path.join(PKG_ROOT, SLUG);

function listen(server) {
  return new Promise((res) => server.listen(0, () => res(server.address().port)));
}

test("Save persists the bag into the package and GET returns it", async () => {
  fs.mkdirSync(dir, { recursive: true });            // pkgDirFor requires the dir to exist
  const server = createServer({ ...overridesRoutes() });
  try {
    const port = await listen(server);
    const base = `http://localhost:${port}/package/overrides`;
    const bag = { "f0:e21": { pos: { tx: 12, ty: 8 } }, "f0:e1": { text: "Hi" } };

    const post = await (await fetch(`${base}?pkg=${SLUG}`, {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ overrides: bag }),
    })).json();
    assert.equal(post.ok, true, "POST returns ok");
    assert.equal(post.keys, 2);

    // file on disk
    const onDisk = JSON.parse(fs.readFileSync(path.join(dir, "overrides.json"), "utf8"));
    assert.deepEqual(onDisk, bag, "overrides.json written with the exact bag");

    // GET round-trips it
    const get = await (await fetch(`${base}?pkg=${SLUG}`)).json();
    assert.deepEqual(get.overrides, bag, "GET returns the saved bag");

    // unknown slug rejected
    const bad = await (await fetch(`${base}?pkg=does-not-exist-xyz`, {
      method: "POST", headers: { "content-type": "application/json" }, body: "{}",
    })).json();
    assert.equal(bad.ok, false, "unknown pkg rejected");

    // traversal cannot escape _packages
    const trav = await (await fetch(`${base}?pkg=${encodeURIComponent("../../..")}`, {
      method: "POST", headers: { "content-type": "application/json" }, body: "{}",
    })).json();
    assert.equal(trav.ok, false, "traversal slug rejected");
  } finally {
    server.close();
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
