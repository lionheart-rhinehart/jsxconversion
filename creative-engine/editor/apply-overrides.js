// creative-engine/editor/apply-overrides.js
//
// Phase 2 — the SHARED, deterministic "replay the change-list" function.
//
// This ONE function is used in two places, and that single-source-of-truth is the
// whole point: (1) the live editor calls it to show a preview, and (2) the renderer
// injects this exact file into the headless browser and calls it before capturing
// frames. Identical DOM mutation → the editor preview and the rendered MP4 cannot
// disagree. (Phase-2 evidence 2.4/2.5 lean entirely on this.)
//
// It takes the UNTOUCHED tagged design (the Phase-1 output, with data-edit-* stamps)
// and an override bag keyed to the Phase-1 ids:
//
//   { "fN:eM": { text?: string, src?: string, pos?: {left,top,width,height} } }
//
// It NEVER re-draws the design. It only:
//   - text : replaces the element's own text node(s), leaving child elements intact
//            (so editing one line-span of an animated split headline survives the anim)
//   - src  : swaps an <img>/<video> source, or the url() of a CSS-background element
//   - pos  : sets left/top/width/height (LAYOUT props) — never transform, so a moved
//            element that is also keyframe-animated on transform keeps animating.
//
// No AI, no heuristics at apply time: a stamped id maps to exactly one element.
//
// Works as a browser global (window.CEApplyOverrides) AND when this file's source is
// evaluated inside a puppeteer page (the renderer uses page.addScriptTag).

(function (root) {
  'use strict';

  function frameEl(doc, frameId) {
    return doc.querySelector('.cr-frame[data-edit-frame="' + cssEscape(frameId) + '"]');
  }

  function targetEl(doc, key) {
    // key = "fN:eM"  → scope the id lookup to its own frame so ids stay unique
    var i = key.indexOf(':');
    if (i < 0) return null;
    var f = key.slice(0, i), e = key.slice(i + 1);
    var frame = frameEl(doc, f);
    if (!frame) return null;
    return frame.querySelector('[data-edit-id="' + cssEscape(e) + '"]');
  }

  // minimal CSS.escape fallback (ids/frames are simple [fe0-9] tokens, but be safe)
  function cssEscape(s) {
    if (typeof CSS !== 'undefined' && CSS.escape) return CSS.escape(s);
    return String(s).replace(/[^a-zA-Z0-9_-]/g, function (c) { return '\\' + c; });
  }

  // Replace the element's DIRECT text-node children with `text`, preserving any
  // child elements (icons, carets). If the element has child elements but also its
  // own text, we replace only the first text node and clear the rest.
  function setText(el, text) {
    var kids = Array.prototype.slice.call(el.childNodes);
    var textNodes = kids.filter(function (n) { return n.nodeType === 3 && n.textContent.trim().length; });
    if (textNodes.length === 0) {
      // no existing visible text node (rare) — prepend one
      el.insertBefore(el.ownerDocument.createTextNode(text), el.firstChild);
      return;
    }
    textNodes[0].textContent = text;
    for (var i = 1; i < textNodes.length; i++) textNodes[i].textContent = '';
  }

  function setSrc(el, src) {
    var tag = (el.tagName || '').toLowerCase();
    var kind = el.getAttribute('data-edit-media-kind') || '';
    if (kind === 'css-bg' || /background(?:-image)?\s*:[^;]*url\(/i.test(el.getAttribute('style') || '')) {
      var style = el.getAttribute('style') || '';
      var next = style.replace(/url\(\s*['"]?[^'")]*['"]?\s*\)/i, "url('" + src + "')");
      if (next === style) next = style + (style.trim().endsWith(';') ? '' : ';') + "background-image:url('" + src + "');";
      el.setAttribute('style', next);
      return;
    }
    if (tag === 'video') {
      el.setAttribute('src', src);
      // a swapped clip: keep it behaving like the original bg footage
      try { el.muted = true; el.loop = true; el.autoplay = true; el.load && el.load(); } catch (e) {}
      return;
    }
    // img / picture-source / default
    el.setAttribute('src', src);
  }

  function setPos(el, pos) {
    if (!pos) return;
    // MOVE via margins, RESIZE via width/height — all LAYOUT props, deliberately
    // never `transform` (keyframes own transform). Margins are the universal mover:
    // they offset an element whether it's in flow OR absolutely positioned, and even
    // when it's anchored by BOTH left & right (full-width bars) — unlike left/top,
    // which collides with right/bottom anchoring. No keyframe animates margin, so a
    // dragged element that is also transform-animated keeps animating (Phase-2 2.4).
    if (pos.dx != null) el.style.marginLeft = px(pos.dx);
    if (pos.dy != null) el.style.marginTop = px(pos.dy);
    if (pos.w != null) el.style.width = px(pos.w);
    if (pos.h != null) el.style.height = px(pos.h);
  }

  function px(v) { return (typeof v === 'number') ? v + 'px' : String(v); }

  function applyOne(el, ov) {
    if (!el || !ov) return;
    if (ov.text != null) setText(el, ov.text);
    if (ov.src != null) setSrc(el, ov.src);
    if (ov.pos != null) setPos(el, ov.pos);
  }

  // doc = a Document (browser live edit, or puppeteer page document)
  // overrides = { "fN:eM": {text?,src?,pos?} }
  // returns { applied, missing:[keys] } — missing is surfaced, never silent.
  function applyOverrides(doc, overrides) {
    var applied = 0, missing = [];
    overrides = overrides || {};
    for (var key in overrides) {
      if (!Object.prototype.hasOwnProperty.call(overrides, key)) continue;
      var el = targetEl(doc, key);
      if (!el) { missing.push(key); continue; }
      applyOne(el, overrides[key]);
      applied++;
    }
    return { applied: applied, missing: missing };
  }

  var api = { applyOverrides: applyOverrides, _targetEl: targetEl, _setPos: setPos };
  // export both as a callable (legacy) and as a namespace
  root.CEApplyOverrides = applyOverrides;
  root.CEApply = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : this);
