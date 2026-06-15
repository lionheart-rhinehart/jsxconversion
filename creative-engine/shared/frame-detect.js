// creative-engine/shared/frame-detect.js
//
// SHARED, browser-evaluable "what is a creative frame in this live design?" routine.
// Used by BOTH the runtime re-tagger (creative-engine/shared/runtime-retag.js) and the
// renderer (render-frame.mjs isolates one frame). Editor and renderer MUST agree on the
// frame set, so this is the single source of truth — same idea as apply-overrides.js.
//
// Why it exists: a .dc.html handoff wraps each creative in `.cr-frame`, but a real
// JS-driven export (Campaign B) builds its OWN container at runtime (`.story`, no
// `.cr-frame`). Hardwiring `.cr-frame` finds nothing in those. So we DETECT, in order:
//   1. If `.cr-frame` elements exist → those are the frames (the standalone convention).
//   2. Else → the repeated, stage-sized (≈1080×1920) OUTERMOST containers the design
//      built. Computed width/height is the AUTHORED size (transforms — the gallery
//      `--scale` — don't change layout width), so a scaled `.story` still reports 1080.
//
// Never silently returns a wrong set: a caller that gets [] must flag it (deterministic
// ≠ correct — a script can be reliably wrong on an unseen structure).

(function (root) {
  'use strict';

  var STAGE_W = 1080, STAGE_H = 1920, TOL_W = 48, TOL_H = 64;

  function sizeMatches(el, w, h, tolW, tolH) {
    var cs = el.ownerDocument.defaultView.getComputedStyle(el);
    var cw = parseFloat(cs.width), ch = parseFloat(cs.height);
    return Math.abs(cw - w) <= tolW && Math.abs(ch - h) <= tolH;
  }

  // detect(doc, opts) → ordered Array<Element> of frame roots.
  //   opts.stageW / opts.stageH override the stage size (default 1080×1920).
  //   opts.selector forces a CSS selector (escape hatch; auto-detect is the default).
  function detect(doc, opts) {
    opts = opts || {};
    if (opts.selector) return Array.prototype.slice.call(doc.querySelectorAll(opts.selector));

    var cr = doc.querySelectorAll('.cr-frame');
    if (cr.length) return Array.prototype.slice.call(cr);

    var w = opts.stageW || STAGE_W, h = opts.stageH || STAGE_H;
    var tolW = opts.tolW || TOL_W, tolH = opts.tolH || TOL_H;
    var all = Array.prototype.slice.call(doc.querySelectorAll('body *'));
    // computed width/height is the AUTHORED size — a `transform: scale()` (the gallery
    // thumbnail shrink) does NOT change it, so a scaled-down 1080×1920 cell still matches.
    var candidates = all.filter(function (el) { return sizeMatches(el, w, h, tolW, tolH); });
    if (!candidates.length) return [];

    // The CREATIVES are the most-numerous COHORT of stage-sized elements at one
    // containment depth. Why depth: a `.dc.html` contact sheet has lone wrappers at the
    // top (`dc-root`, `sc-host` — 1 each) and the N creatives one level deeper (N), each
    // of which in turn holds its own full-bleed media (bg div + <video>) deeper still.
    // Campaign B has its `.story` creatives at the shallowest level and their media below.
    // Grouping by "how many other candidates contain me" and taking the fullest level
    // selects the creative cohort and ignores both the wrappers above and the media below.
    // depth(el) = number of OTHER candidates that contain el
    var depthOf = candidates.map(function (el) {
      var d = 0;
      for (var i = 0; i < candidates.length; i++) {
        if (candidates[i] !== el && candidates[i].contains(el)) d++;
      }
      return d;
    });
    var byDepth = {};
    candidates.forEach(function (el, i) { (byDepth[depthOf[i]] = byDepth[depthOf[i]] || []).push(el); });
    // pick the depth with the most members; tie → the SHALLOWEST (outermost) wins.
    var bestDepth = null, bestCount = -1;
    Object.keys(byDepth).map(Number).sort(function (a, b) { return a - b; }).forEach(function (d) {
      if (byDepth[d].length > bestCount) { bestCount = byDepth[d].length; bestDepth = d; }
    });
    return byDepth[bestDepth]; // document order preserved by querySelectorAll
  }

  var api = { detect: detect, STAGE_W: STAGE_W, STAGE_H: STAGE_H };
  root.CEFrames = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : this);
