// Regression test for media INTERCHANGEABILITY (2026-06-15): a swap must key off the
// INCOMING media's type, not the slot's original element. Dropping a video into a static
// <img> slot must turn it into a <video> (an <img> can't play video → the "blank video"
// bug Cody hit); dropping an image into a <video> slot must turn it into an <img>. The
// element-replacement must carry the data-edit-* ids over so the slot stays findable, and
// because apply-overrides.js is the SHARED preview+render function, this fixes both at once.
//
// No DOM lib in the repo, so we hand-roll the minimum contract apply-overrides.js touches:
// ownerDocument.createElement, an `attributes` list, setAttribute, and replaceWith (which
// swaps the node inside its frame's children so a re-query resolves the NEW element).

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

// ── tiny DOM ────────────────────────────────────────────────────────────────
function makeEl(tagName, attrs = {}) {
  const a = { ...attrs };
  const el = {
    tagName: tagName.toUpperCase(),
    childNodes: [],
    style: {},
    parent: null,
    muted: undefined, loop: undefined, autoplay: undefined, playsInline: undefined,
    get attributes() { return Object.keys(a).map((name) => ({ name, value: a[name] })); },
    getAttribute: (n) => (n in a ? a[n] : null),
    setAttribute: (n, v) => { a[n] = String(v); },
    removeAttribute: (n) => { delete a[n]; },
    load() { this._loaded = true; },
    replaceWith(next) {
      const arr = this.parent.children;
      const i = arr.indexOf(this);
      if (i >= 0) { arr[i] = next; next.parent = this.parent; }
    },
  };
  return el;
}
function makeDoc(frameId, target) {
  const frame = {
    children: [target],
    getAttribute: (n) => (n === "data-edit-frame" ? frameId : null),
    querySelector(sel) {
      const m = /\[data-edit-id="([^"]+)"\]/.exec(sel);
      if (!m) return null;
      return this.children.find((c) => c.getAttribute("data-edit-id") === m[1]) || null;
    },
  };
  const doc = {
    createElement: (tag) => makeEl(tag),
    querySelector: (sel) => (sel === `[data-edit-frame="${frameId}"]` ? frame : null),
  };
  // ownerDocument back-reference for replaceMediaEl's createElement
  target.ownerDocument = doc;
  target.parent = frame;
  return { doc, frame };
}

test("video swapped into an <img> slot becomes a <video> (carries the id, plays)", () => {
  const img = makeEl("img", { "data-edit-id": "e1", "data-edit-media-kind": "image", class: "hero", src: "old.jpg" });
  const { doc, frame } = makeDoc("f0", img);

  const res = CEApply.applyOverrides(doc, { "f0:e1": { src: "/clips/sprint.mp4" } });
  assert.equal(res.applied, 1);

  const now = frame.children[0];
  assert.equal(now.tagName, "VIDEO", "the <img> must be replaced by a <video>");
  assert.equal(now.getAttribute("data-edit-id"), "e1", "id carried over so the slot stays findable");
  assert.equal(now.getAttribute("data-edit-media-kind"), "video", "media-kind updated");
  assert.equal(now.getAttribute("class"), "hero", "styling class carried over");
  assert.equal(now.getAttribute("src"), "/clips/sprint.mp4");
  assert.equal(now.muted, true);
  assert.equal(now.loop, true);
});

test("image swapped into a <video> slot becomes an <img>", () => {
  const vid = makeEl("video", { "data-edit-id": "e1", "data-edit-media-kind": "video", src: "old.mp4" });
  const { doc, frame } = makeDoc("f0", vid);

  CEApply.applyOverrides(doc, { "f0:e1": { src: "/photos/team.jpg" } });
  const now = frame.children[0];
  assert.equal(now.tagName, "IMG", "the <video> must be replaced by an <img>");
  assert.equal(now.getAttribute("data-edit-id"), "e1");
  assert.equal(now.getAttribute("data-edit-media-kind"), "image");
  assert.equal(now.getAttribute("src"), "/photos/team.jpg");
});

test("same-type swap (video into video) keeps the element in place", () => {
  const vid = makeEl("video", { "data-edit-id": "e1", "data-edit-media-kind": "video", src: "old.mp4" });
  const { doc, frame } = makeDoc("f0", vid);

  CEApply.applyOverrides(doc, { "f0:e1": { src: "/clips/new.mp4" } });
  const now = frame.children[0];
  assert.equal(now, vid, "no element replacement for a same-type swap");
  assert.equal(now.getAttribute("src"), "/clips/new.mp4");
});
