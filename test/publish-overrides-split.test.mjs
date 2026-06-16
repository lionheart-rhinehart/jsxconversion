// Test: a saved editor override bag is split per-frame for publish, so each frame's
// approval row carries ONLY its own edits (keys "fN:…"), and editor-metadata ("__…")
// keys never leak onto an approval. (Part B3 — carry local edits into publish, no render.)

import { test } from "node:test";
import assert from "node:assert/strict";
import { frameOverrides, countEdits } from "../creative-engine/dispatch/overrides-split.mjs";

const bag = {
  "f0:e1": { text: "Hello" },
  "f0:e21": { pos: { tx: 12, ty: 8 } },
  "f1:e3": { src: "/clips/a.mp4" },
  "f2:e9": { text: "x" },
  "__groups__": [{ id: "g1", members: ["f0:e1", "f0:e21"] }],
};

test("a frame gets only its own keys", () => {
  assert.deepEqual(frameOverrides(bag, "f0"), {
    "f0:e1": { text: "Hello" },
    "f0:e21": { pos: { tx: 12, ty: 8 } },
  });
  assert.deepEqual(frameOverrides(bag, "f1"), { "f1:e3": { src: "/clips/a.mp4" } });
});

test("a prefix is not matched loosely (f1 must not catch f10)", () => {
  const b = { "f1:e0": { text: "a" }, "f10:e0": { text: "b" } };
  assert.deepEqual(frameOverrides(b, "f1"), { "f1:e0": { text: "a" } });
});

test("editor metadata (__groups__) never lands on a frame", () => {
  for (const fid of ["f0", "f1", "f2"]) {
    assert.ok(!("__groups__" in frameOverrides(bag, fid)), `${fid} must not carry __groups__`);
  }
});

test("countEdits ignores metadata keys", () => {
  assert.equal(countEdits(bag), 4);                 // 4 element edits, __groups__ excluded
  assert.equal(countEdits(frameOverrides(bag, "f0")), 2);
  assert.equal(countEdits({ "__groups__": [] }), 0);
  assert.equal(countEdits({}), 0);
});

test("empty / missing bag is safe", () => {
  assert.deepEqual(frameOverrides(null, "f0"), {});
  assert.deepEqual(frameOverrides({}, "f0"), {});
});
