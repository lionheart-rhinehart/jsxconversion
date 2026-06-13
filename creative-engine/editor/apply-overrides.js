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
    var isSvg = (el.getAttribute && el.getAttribute('data-edit-mode') === 'svg');
    // Multi-line: for plain (non-SVG) text the new value may contain "\n" — render as
    // <br>. SVG <text>/<tspan> can't take <br>, so it stays single-line (deferred).
    if (!isSvg && text.indexOf('\n') >= 0) {
      var parts = String(text).split('\n');
      // wipe existing text nodes, then rebuild first text-owner with <br>-joined lines,
      // preserving any non-text child elements (icons/carets) after it.
      var kids0 = Array.prototype.slice.call(el.childNodes);
      kids0.forEach(function (n) { if (n.nodeType === 3) el.removeChild(n); });
      var doc = el.ownerDocument, frag = doc.createDocumentFragment();
      parts.forEach(function (line, i) {
        if (i) frag.appendChild(doc.createElement('br'));
        frag.appendChild(doc.createTextNode(line));
      });
      el.insertBefore(frag, el.firstChild);
      return;
    }
    var kids = Array.prototype.slice.call(el.childNodes);
    var textNodes = kids.filter(function (n) { return n.nodeType === 3 && n.textContent.trim().length; });
    if (textNodes.length === 0) {
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
    // All LAYOUT props, never `transform` (keyframes own transform). Two move modes:
    //  - mode:"absolute" → position:absolute + left/top: free-float anywhere, lets an
    //    in-flow element lift above its siblings (Phase-A A1).
    //  - default (margins dx/dy) → the universal in-flow nudge that never collides with
    //    left/right anchoring. RESIZE is width/height. None of these fight the animation.
    if (pos.mode === 'absolute') {
      el.style.position = 'absolute';
      if (pos.left != null) el.style.left = px(pos.left);
      if (pos.top != null) el.style.top = px(pos.top);
      el.style.right = 'auto'; el.style.bottom = 'auto';
    } else {
      if (pos.dx != null) el.style.marginLeft = px(pos.dx);
      if (pos.dy != null) el.style.marginTop = px(pos.dy);
    }
    if (pos.w != null) el.style.width = px(pos.w);
    if (pos.h != null) el.style.height = px(pos.h);
  }

  function px(v) { return (typeof v === 'number') ? v + 'px' : String(v); }

  // Rotate via a WRAPPER the keyframes never target — putting transform on the animated
  // node itself would be overwritten at render. Idempotent: reuse an existing wrapper.
  function setRotate(el, deg) {
    var wrap = el.parentNode && el.parentNode.getAttribute &&
      el.parentNode.getAttribute('data-ce-rot') != null ? el.parentNode : null;
    if (!wrap) {
      wrap = el.ownerDocument.createElement('span');
      wrap.setAttribute('data-ce-rot', '1');
      wrap.style.display = 'inline-block';
      wrap.style.transformOrigin = 'center';
      el.parentNode.insertBefore(wrap, el);
      wrap.appendChild(el);
    }
    wrap.style.transform = 'rotate(' + (Number(deg) || 0) + 'deg)';
  }

  function applyOne(el, ov) {
    if (!el || !ov) return;
    if (ov.text != null) setText(el, ov.text);
    if (ov.src != null) setSrc(el, ov.src);
    if (ov.pos != null) setPos(el, ov.pos);
    if (ov.color != null) el.style.color = ov.color;
    if (ov.fontSize != null) el.style.fontSize = px(ov.fontSize);
    if (ov.rotate != null) setRotate(el, ov.rotate);
  }

  // doc = a Document (browser live edit, or puppeteer page document)
  // overrides = { "fN:eM": {text?,src?,pos?} }
  // returns { applied, missing:[keys] } — missing is surfaced, never silent.
  function applyOverrides(doc, overrides) {
    var applied = 0, missing = [];
    overrides = overrides || {};
    // freeze parent heights first (so a child promoted out of flow can't collapse a
    // bottom-anchored container). __frozen__ = { "fN:eM": heightPx }.
    var frozen = overrides.__frozen__ || {};
    for (var fk in frozen) {
      if (!Object.prototype.hasOwnProperty.call(frozen, fk)) continue;
      var fel = targetEl(doc, fk); if (fel) fel.style.height = frozen[fk] + 'px';
    }
    for (var key in overrides) {
      if (!Object.prototype.hasOwnProperty.call(overrides, key)) continue;
      if (key.indexOf('__') === 0) continue; // editor metadata (e.g. "__groups__", "__frozen__"), not an element
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
