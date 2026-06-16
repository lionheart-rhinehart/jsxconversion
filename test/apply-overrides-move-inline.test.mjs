// Regression test for moving INLINE text elements (2026-06-15).
//
// The move mechanism used the CSS `translate` property, which has NO effect on non-replaced
// INLINE boxes (a plain display:inline <span> — exactly how kicker/headline/subhead text is
// marked up). Result: the blue selection appeared but the text would not move (Cody's bug).
// The fix: apply-overrides.js `applyOffset()` keeps `translate` for transformable elements
// but uses position:relative + left/top for inline text (which DOES offset an inline box).
// This is the SHARED function used by both the editor preview and the renderer.

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

// minimal element whose ownerDocument.defaultView.getComputedStyle reports a chosen
// display/position — that's all applyOffset inspects.
function el(tagName, display, position) {
  const style = {};
  const e = {
    tagName: tagName.toUpperCase(),
    style,
    getAttribute: () => null,
  };
  e.ownerDocument = { defaultView: { getComputedStyle: () => ({ display, position }) } };
  return e;
}

test("inline <span> moves via position:relative + left/top (NOT translate)", () => {
  const span = el("span", "inline", "static");
  CEApply.applyOffset(span, 120, 80);
  assert.equal(span.style.position, "relative", "static inline element is promoted to position:relative");
  assert.equal(span.style.left, "120px");
  assert.equal(span.style.top, "80px");
  assert.ok(!span.style.translate, "translate must NOT be used on inline text (it is a no-op there)");
});

test("block <div> moves via translate (composes with keyframe animation)", () => {
  const div = el("div", "block", "static");
  CEApply.applyOffset(div, 120, 80);
  assert.equal(div.style.translate, "120px 80px");
  assert.ok(!div.style.left && !div.style.top, "block uses translate, not left/top");
});

test("inline-block element is transformable → translate", () => {
  const ib = el("span", "inline-block", "static");
  CEApply.applyOffset(ib, 10, 20);
  assert.equal(ib.style.translate, "10px 20px");
});

test("replaced inline media (img) is transformable → translate", () => {
  const img = el("img", "inline", "static");
  CEApply.applyOffset(img, 5, 6);
  assert.equal(img.style.translate, "5px 6px", "img is replaced → transformable even when display:inline");
});

test("inline element already positioned (relative) is not re-promoted but still offset", () => {
  const span = el("span", "inline", "relative");
  CEApply.applyOffset(span, 3, 4);
  // position was already non-static → left/top still set; position untouched-or-relative
  assert.equal(span.style.left, "3px");
  assert.equal(span.style.top, "4px");
});
