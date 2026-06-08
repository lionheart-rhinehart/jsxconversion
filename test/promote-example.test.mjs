// ============================================================================
//  test/promote-example.test.mjs — harvest an approved creative into the library (T2.5)
// ============================================================================

import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { nextExampleSeq, deriveSlotShape, buildEntry, appendToLibrary } from "../scripts/lib/promote-example.mjs";
import { makeExampleId, validateExampleIndex, INDEX_PATH, exampleImagePath } from "../scripts/lib/example-library.mjs";

test("nextExampleSeq = max existing seq + 1", () => {
  assert.equal(nextExampleSeq({ examples: { "ex-001-a": {}, "ex-014-b": {}, "ex-009-c": {} } }), 15);
  assert.equal(nextExampleSeq({ examples: {} }), 1);
});

test("deriveSlotShape keeps the role/capacity skeleton, not the words", () => {
  const shape = deriveSlotShape({ fields: [
    { key: "stat", role: "stat", maxChars: 8, text: "+4\"" },
    { key: "sub", role: "claim", maxChars: 40, text: "Foundational program" },
    { key: "deco", role: null, text: "ignored (no role)" },
  ] });
  assert.deepEqual(shape.roleSet.sort(), ["claim", "stat"]);
  assert.equal(shape.slots.length, 2);
  assert.equal(shape.slots[0].maxChars, 8);
});

test("buildEntry returns a contract-VALID entry; a bad archetype throws", () => {
  const id = makeExampleId(200, "harvested giant stat");
  const entry = buildEntry({ exampleId: id, archetype: "giant-stat", format: "static",
    mediaStyleAccepts: [], slotShape: { slots: [{ id: "stat", role: "stat", maxChars: 8, required: true }], roleSet: ["stat"] } });
  assert.equal(entry.renderedImagePath, exampleImagePath(id));
  assert.throws(() => buildEntry({ exampleId: id, archetype: "not-an-archetype", format: "static",
    slotShape: { slots: [{ id: "x", role: "stat", maxChars: 8, required: true }], roleSet: ["stat"] } }), /invalid/);
});

test("appendToLibrary lands a valid entry, copies the image, refuses a duplicate", () => {
  const root = mkdtempSync(join(tmpdir(), "promote-"));
  try {
    mkdirSync(join(root, "templates"), { recursive: true });
    writeFileSync(join(root, INDEX_PATH), JSON.stringify({ schema: "example-library/v2", examples: {} }));
    const src = join(root, "render.png"); writeFileSync(src, Buffer.alloc(4096, 1)); // a non-empty fake render

    const id = makeExampleId(201, "harvested quote");
    const entry = buildEntry({ exampleId: id, archetype: "quote-card", format: "static",
      mediaStyleAccepts: [], slotShape: { slots: [{ id: "quote", role: "testimonial", maxChars: 120, required: true }], roleSet: ["testimonial"] } });
    appendToLibrary({ root, exampleId: id, entry, sourceImage: src });

    const index = JSON.parse(readFileSync(join(root, INDEX_PATH), "utf8"));
    assert.ok(index.examples[id], "new example is in the index");
    assert.equal(validateExampleIndex(index).errors.length, 0, "the index still validates");
    assert.throws(() => appendToLibrary({ root, exampleId: id, entry, sourceImage: src }), /already exists/);
  } finally { rmSync(root, { recursive: true, force: true }); }
});
