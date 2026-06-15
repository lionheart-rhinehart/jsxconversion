// Regression test for the editor-wiring fix (2026-06-15): the SHARED apply-overrides.js
// must resolve a frame by its `data-edit-frame` stamp ALONE — never require a `.cr-frame`
// class. JS-driven exports (Campaign B `.story`, .dc.html wrappers) are detected at
// runtime and stamped data-edit-frame WITHOUT that class; requiring it made every override
// resolve to null (the editor preview AND the renderer both silently dropped edits).
//
// No DOM lib in the repo, so we hand-roll the *minimum* querySelector contract
// apply-overrides.js depends on: `[data-edit-frame="X"]` (document scope) and a scoped
// `[data-edit-id="Y"]` (frame scope). The mock frame carries NO class, so the old
// `.cr-frame[...]` selector would miss it and this test would fail.

import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

// apply-overrides.js is a browser module (the renderer injects its SOURCE into a headless
// page; it is never `require`d in node). Load it the same way: eval the source with a
// sandbox as `this`, which becomes its global `root`, and read back the CEApply namespace.
const here = path.dirname(fileURLToPath(import.meta.url));
const SRC = fs.readFileSync(path.join(here, "..", "creative-engine", "editor", "apply-overrides.js"), "utf8");
const sandbox = {};
new Function(SRC).call(sandbox);
const CEApply = sandbox.CEApply;

// minimal element with the attribute/style surface apply-overrides touches
function el(attrs = {}) {
  const a = { ...attrs };
  return {
    _attrs: a,
    childNodes: [],
    style: {},
    tagName: a.tagName || "DIV",
    getAttribute: (n) => (n in a ? a[n] : null),
    setAttribute: (n, v) => { a[n] = String(v); },
    removeAttribute: (n) => { delete a[n]; },
  };
}

test("apply-overrides resolves a DETECTED frame (data-edit-frame stamp, no .cr-frame class)", () => {
  // a frame WITHOUT a .cr-frame class (what frame-detect + runtime-retag produce live)
  const target = el({ "data-edit-id": "e1", tagName: "VIDEO", "data-edit-media-kind": "video" });
  const frame = {
    _attrs: { "data-edit-frame": "f0" },          // stamped, but NO class
    getAttribute: function (n) { return this._attrs[n] ?? null; },
    // scoped lookup inside the frame
    querySelector: (sel) => (sel === '[data-edit-id="e1"]' ? target : null),
  };
  const doc = {
    querySelector: (sel) => {
      // the FIX: frameEl must query by the stamp alone. The old code queried
      // '.cr-frame[data-edit-frame="f0"]' — assert that exact string is NOT used.
      assert.ok(!/\.cr-frame/.test(sel), `frame lookup must not require .cr-frame (got: ${sel})`);
      return sel === '[data-edit-frame="f0"]' ? frame : null;
    },
  };

  const resolved = CEApply._targetEl(doc, "f0:e1");
  assert.equal(resolved, target, "override key f0:e1 must resolve to the stamped element");

  const res = CEApply.applyOverrides(doc, { "f0:e1": { src: "swap.mp4" } });
  assert.equal(res.applied, 1, "the override must apply");
  assert.deepEqual(res.missing, [], "nothing missing — the detected frame resolved");
  assert.equal(target.getAttribute("src"), "swap.mp4", "src swap landed on the element");
});
