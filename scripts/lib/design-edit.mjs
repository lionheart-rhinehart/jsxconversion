// ============================================================================
//  scripts/lib/design-edit.mjs — the "edit Claude Design files DIRECTLY" core.
// ----------------------------------------------------------------------------
//  ONE faithful surface, used three ways (editor stage / review cards / export):
//  the real `.cr-frame` HTML is the render; edits are surgical OVERRIDES keyed to
//  a stable `data-edit-id`. The design is NEVER re-created — original + overrides
//  = the edited design, so fidelity is guaranteed.
//
//  This module is the single source of truth for:
//    TAGGER_BODY    — assigns deterministic data-edit-id + text/media/pos flags.
//                     Runs at EXTRACT time (puppeteer) so ids bake into the slice
//                     and are identical for editor, render, and review cards.
//    APPLIER_BODY   — applies window.__DESIGN_OVERRIDES__ to the tagged nodes.
//                     Injected into the served standalone HTML (runs in-browser).
//    wrapStandalone — assembles a faithful standalone doc from a fragment slice.
//
//  Both *_BODY are strings (function bodies) so they run unchanged in the browser
//  AND inside puppeteer's page context — there is no second copy to drift.
// ============================================================================

// --- TAGGER ---------------------------------------------------------------
// function(frame){ ... } — walks `frame` (a .cr-frame root) in document order and
// assigns: data-edit-id="e<n>"; data-edit-text="1" (immediate non-ws text node);
// data-edit-media="1" (<img>/<video>); data-edit-logo="1" (media whose src looks
// like a logo); data-edit-pos="1" (computed position absolute/fixed). One id per
// element; an element may carry several flags (e.g. the eyebrow is text+pos).
export const TAGGER_BODY = `
  var n = 0;
  var hasOwnText = function (el) {
    for (var i = 0; i < el.childNodes.length; i++) {
      var c = el.childNodes[i];
      if (c.nodeType === 3 && c.nodeValue && c.nodeValue.trim()) return true;
    }
    return false;
  };
  var walk = function (el) {
    var tag = el.tagName;
    var isMedia = tag === 'IMG' || tag === 'VIDEO';
    var isText = hasOwnText(el);
    var pos = '';
    try { pos = (el.ownerDocument.defaultView || window).getComputedStyle(el).position; } catch (e) {}
    var isPos = pos === 'absolute' || pos === 'fixed';
    if (isMedia || isText || isPos) {
      el.setAttribute('data-edit-id', 'e' + (n++));
      if (isText) el.setAttribute('data-edit-text', '1');
      if (isMedia) {
        el.setAttribute('data-edit-media', '1');
        var src = (el.getAttribute('src') || '') + ' ' + (el.getAttribute('poster') || '');
        if (/logo/i.test(src)) el.setAttribute('data-edit-logo', '1');
      }
      if (isPos) el.setAttribute('data-edit-pos', '1');
    }
    for (var i = 0; i < el.children.length; i++) walk(el.children[i]);
  };
  walk(frame);
  return n;
`;

// --- APPLIER --------------------------------------------------------------
// Applies window.__DESIGN_OVERRIDES__ = { edits:{ <id>:{style?,html?,src?,poster?,
// pos?,hidden?,z?} }, added?:[...] } onto the tagged nodes. Phase 1 handles `edits`
// (added[] overlay rendering is wired in Phase 2). Safe to run on any tagged doc.
export const APPLIER_BODY = `
  var ov = window.__DESIGN_OVERRIDES__ || {};
  var edits = ov.edits || {};
  var byId = function (id) { return document.querySelector('[data-edit-id="' + id + '"]'); };
  Object.keys(edits).forEach(function (id) {
    var el = byId(id); if (!el) return;
    var e = edits[id] || {};
    if (e.hidden) { el.style.display = 'none'; return; }
    // cssText carries the FULL inline visual state (original inline styles + edits) — set
    // it first so the edited look is restored exactly; html/src then layer on top.
    if (typeof e.cssText === 'string') { try { el.style.cssText = e.cssText; } catch (x) {} }
    if (typeof e.html === 'string') el.innerHTML = e.html;
    if (typeof e.src === 'string') { try { el.setAttribute('src', e.src); } catch (x) {} }
    if (typeof e.poster === 'string') { try { el.setAttribute('poster', e.poster); } catch (x) {} }
    if (e.style && typeof e.style === 'object') {
      Object.keys(e.style).forEach(function (k) { try { el.style[k] = e.style[k]; } catch (x) {} });
    }
    if (e.pos && typeof e.pos === 'object') {
      el.style.position = 'absolute';
      if (e.pos.left != null) el.style.left = e.pos.left + 'px';
      if (e.pos.top != null) el.style.top = e.pos.top + 'px';
    }
    if (e.z != null) el.style.zIndex = String(e.z);
  });
`;

// --- STANDALONE WRAPPER ----------------------------------------------------
// Builds a faithful, self-contained 1080x1920 doc from a fragment slice (the
// verbatim `.cr-frame` outerHTML, already tagged). The fragment carries inline
// transform:scale from the gallery grid — we force it to full size at 0,0.
export function wrapStandalone({ fragmentHtml, keyframesCss = "", dsHref = "", overrides = {}, assetBase = "" }) {
  const base = assetBase ? `<base href="${assetBase}">` : "";
  const ds = dsHref ? `<link rel="stylesheet" href="${dsHref}">` : "";
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
${base}
${ds}
<style>
  html, body { margin: 0; padding: 0; background: #0a0b0d; }
  /* the slice keeps the gallery's transform:scale + grid margins — normalize it
     to a full-bleed 1080x1920 design at the origin (fidelity: only geometry of the
     OUTER frame is overridden; everything inside is the untouched design). */
  .cr-frame { position: absolute !important; left: 0 !important; top: 0 !important;
              margin: 0 !important; transform: none !important; }
${keyframesCss}
</style>
</head>
<body>
${fragmentHtml}
<script>window.__DESIGN_OVERRIDES__ = ${JSON.stringify(overrides)};</script>
<script>(function(){${APPLIER_BODY}})();</script>
</body>
</html>`;
}

// label "1A · Live Gap HUD · ..." -> "1A" (matches westfield-review-render.mjs)
export const labelToId = (label) => (String(label).split("·")[0] || label).trim().replace(/[^A-Za-z0-9]/g, "");
