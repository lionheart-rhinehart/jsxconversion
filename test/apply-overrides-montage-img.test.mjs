// Regression test (2026-06-15): applying a MONTAGE to an image slot must convert the
// <img> into a <video>. The montage driver swaps the element's src per clip; if the slot
// stays an <img>, setting <img>.src to a video clip renders BLACK (an <img> can't play
// video). This is the montage-path twin of the single-swap img→video fix — both must
// guarantee the montage/video host is a <video>. (Cody's "montage + audio → black".)

import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const SRC = fs.readFileSync(path.join(here, "..", "creative-engine", "editor", "apply-overrides.js"), "utf8");
const sandbox = {};
new Function(SRC).call(sandbox);
const CEApply = sandbox.CEApply;

function makeEl(tagName, attrs = {}) {
  const a = { ...attrs };
  const el = {
    tagName: tagName.toUpperCase(), childNodes: [], style: {}, parent: null,
    __ceMontage: undefined,
    get attributes() { return Object.keys(a).map((name) => ({ name, value: a[name] })); },
    getAttribute: (n) => (n in a ? a[n] : null),
    setAttribute: (n, v) => { a[n] = String(v); },
    removeAttribute: (n) => { delete a[n]; },
    load() {},
    replaceWith(next) { const arr = this.parent.children; const i = arr.indexOf(this); if (i >= 0) { arr[i] = next; next.parent = this.parent; } },
  };
  return el;
}
function makeDoc(frameId, target) {
  const frame = {
    children: [target],
    getAttribute: (n) => (n === "data-edit-frame" ? frameId : null),
    querySelector(sel) { const m = /\[data-edit-id="([^"]+)"\]/.exec(sel); return m ? this.children.find((c) => c.getAttribute("data-edit-id") === m[1]) || null : null; },
  };
  const doc = { createElement: (tag) => makeEl(tag), querySelector: (sel) => (sel === `[data-edit-frame="${frameId}"]` ? frame : null) };
  doc.defaultView = {}; // no __ceMontageChanged hook → setMontage's host-driver call is skipped (guarded)
  target.ownerDocument = doc; target.parent = frame;
  return { doc, frame };
}

test("montage on an <img> slot converts it to a <video> carrying the id + montage", () => {
  const img = makeEl("img", { "data-edit-id": "e0", "data-edit-media-kind": "image", class: "bg", src: "old.jpg" });
  const { doc, frame } = makeDoc("f0", img);

  CEApply.applyOverrides(doc, {
    "f0:e0": { montage: { clips: [{ src: "/clips/a.mp4", in: 0, out: 2 }, { src: "/clips/b.mp4", in: 0, out: 2 }], totalDuration: 4, fps: 30 } },
  });

  const now = frame.children[0];
  assert.equal(now.tagName, "VIDEO", "img slot must become a <video> for the montage driver");
  assert.equal(now.getAttribute("data-edit-id"), "e0", "id carried over");
  assert.equal(now.getAttribute("data-edit-media-kind"), "video");
  assert.equal(now.getAttribute("src"), "/clips/a.mp4", "seeded with the first clip");
  assert.ok(now.__ceMontage && now.__ceMontage.clips.length === 2, "montage metadata attached to the VIDEO");
});

test("montage on an existing <video> stays the same element", () => {
  const vid = makeEl("video", { "data-edit-id": "e0", "data-edit-media-kind": "video", src: "old.mp4" });
  const { doc, frame } = makeDoc("f0", vid);
  CEApply.applyOverrides(doc, { "f0:e0": { montage: { clips: [{ src: "/clips/a.mp4", in: 0, out: 2 }], totalDuration: 2, fps: 30 } } });
  assert.equal(frame.children[0], vid, "no element replacement when the slot is already a <video>");
  assert.ok(vid.__ceMontage, "montage attached");
});
