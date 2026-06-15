// creative-engine/shared/runtime-retag.js
//
// SHARED, browser-evaluable RUNTIME re-tagger. The companion to the static
// intake/tag-design.mjs — same heuristics, but it stamps data-edit-* ids on the LIVE
// DOM *after the design's own JS has built it*, instead of splicing the source byte
// stream.
//
// Why a runtime tagger at all: a real Claude Design export is JS-driven — the design's
// scripts build (and on every load REBUILD) the frames at runtime, wiping any static
// tags. So tagging must happen in-browser, after build, in BOTH places that load the
// live design: the editor (before it shows edits) and the renderer (before it captures).
// Identical code both sides → identical ids → an override bag keyed `fN:eM` maps the
// same element in the editor preview and the rendered MP4.
//
// Determinism: the design builds the same DOM in the same order every load, so a plain
// document-order walk yields STABLE ids. No AI, no per-design config.
//
// Never silently skips: an unrecognized tag is still tagged (stays positionable) AND
// pushed to the report's `flagged` list.
//
// Depends on CEFrames (frame-detect.js) being loaded first.

(function (root) {
  'use strict';

  var KNOWN_TAGS = new Set([
    'div', 'section', 'article', 'header', 'footer', 'main', 'aside', 'nav', 'figure', 'figcaption',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'a', 'button', 'label', 'small', 'strong', 'b',
    'em', 'i', 'u', 'mark', 'sub', 'sup', 'br', 'hr', 'blockquote', 'ul', 'ol', 'li', 'time', 'abbr',
    'img', 'video', 'picture', 'source', 'audio',
    'svg', 'text', 'tspan', 'g', 'path', 'rect', 'circle', 'ellipse', 'line', 'polygon', 'polyline',
    'defs', 'clippath', 'lineargradient', 'radialgradient', 'stop', 'mask', 'use', 'pattern', 'filter',
    'fegaussianblur', 'feoffset', 'feblend', 'femerge', 'femergenode', 'fecolormatrix', 'tref',
  ]);
  var MEDIA_TAGS = new Set(['img', 'video', 'audio', 'source']);
  var BG_URL_RE = /background(?:-image)?\s*:[^;"']*url\(/i;
  var LOGO_RE = /logo|brand|wordmark|lockup/i;

  function tagOf(el) { return (el.tagName || '').toLowerCase(); }
  function attr(el, n) { return el.getAttribute(n) || ''; }

  function isMediaEl(el) {
    if (MEDIA_TAGS.has(tagOf(el))) return true;
    return BG_URL_RE.test(attr(el, 'style'));
  }
  function mediaSrc(el) {
    var m = attr(el, 'style').match(/url\(\s*['"]?([^'")]+)/i);
    return attr(el, 'src') || attr(el, 'poster') || (m ? m[1] : '');
  }
  function isLogo(el) {
    return LOGO_RE.test(mediaSrc(el)) || LOGO_RE.test(attr(el, 'alt')) ||
      LOGO_RE.test(attr(el, 'class')) || el.getAttribute('data-edit-logo') === '1';
  }
  function isBrandKit(el) {
    return isLogo(el) || /\/(brand|logo|kit)\//i.test(mediaSrc(el));
  }
  // direct human-readable text node (not whitespace), ignoring text inside child elements
  function hasDirectText(el) {
    for (var i = 0; i < el.childNodes.length; i++) {
      var n = el.childNodes[i];
      if (n.nodeType === 3 && n.textContent.trim().length > 0) return true;
    }
    return false;
  }
  function textMode(el) {
    var t = tagOf(el);
    return (t === 'text' || t === 'tspan' || t === 'tref') ? 'svg' : 'plain';
  }

  // stamp one frame root; mutates the DOM, returns per-frame counts + flagged/media.
  function tagFrame(frame, frameIdx) {
    var media = [], flagged = [];
    var all = frame.querySelectorAll('*');
    var els = []; // {el, id}
    var n = 0;
    for (var i = 0; i < all.length; i++) {
      var el = all[i];
      var tag = tagOf(el);
      if (!tag) continue;
      var id = 'e' + (n++);
      el.setAttribute('data-edit-id', id);
      el.setAttribute('data-edit-pos', '1'); // every element is positionable
      els.push({ el: el, id: id });

      if (isMediaEl(el)) {
        el.setAttribute('data-edit-media', '1');
        var brandKit = isBrandKit(el);
        if (isLogo(el)) el.setAttribute('data-edit-logo', '1');
        var kind = tag === 'video' ? 'video' : (BG_URL_RE.test(attr(el, 'style')) ? 'css-bg' : 'image');
        el.setAttribute('data-edit-media-kind', kind);
        if (brandKit) el.setAttribute('data-edit-brandkit', '1');
        media.push({ frame: frameIdx, id: id, tag: tag, kind: kind, src: mediaSrc(el), brandKit: brandKit });
      }
      if (hasDirectText(el)) {
        el.setAttribute('data-edit-text', '1');
        el.setAttribute('data-edit-mode', textMode(el));
      }
      if (!KNOWN_TAGS.has(tag)) {
        flagged.push({ frame: frameIdx, id: id, tag: tag, reason: 'unrecognized tag <' + tag + '>',
          snippet: (el.outerHTML || '').slice(0, 120) });
      }
    }

    // split-headline groups: a text child with ≥2 text siblings under a non-text parent
    // gets data-edit-split=<parentId> so Phase-2 can re-distribute an edit across the split.
    var byEl = new Map(els.map(function (e) { return [e.el, e]; }));
    for (var j = 0; j < els.length; j++) {
      var e = els[j];
      if (e.el.getAttribute('data-edit-text') !== '1') continue;
      var parent = e.el.parentNode;
      var pe = parent && byEl.get(parent);
      if (!pe) continue;
      var sibs = Array.prototype.filter.call(parent.childNodes, function (c) {
        return c.nodeType === 1 && byEl.get(c) && c.getAttribute('data-edit-text') === '1';
      });
      if (sibs.length >= 2 && pe.el.getAttribute('data-edit-text') !== '1') {
        e.el.setAttribute('data-edit-split', pe.id);
      }
    }
    return { count: els.length, media: media, flagged: flagged,
      textCount: els.filter(function (e) { return e.el.getAttribute('data-edit-text') === '1'; }).length };
  }

  // tag(doc, opts) → stamps the whole live document, returns a coverage report.
  function tag(doc, opts) {
    doc = doc || document;
    var frames = (root.CEFrames || module.require('./frame-detect.js')).detect(doc, opts || {});
    var report = { frames: frames.length, tagged: 0, text: 0, media: 0, flagged: [], manifest: [], perFrame: [] };
    frames.forEach(function (frame, i) {
      frame.setAttribute('data-edit-frame', 'f' + i);
      if (!frame.classList.contains('cr-frame')) frame.setAttribute('data-edit-frame-detected', '1');
      var r = tagFrame(frame, i);
      report.tagged += r.count; report.text += r.textCount; report.media += r.media.length;
      report.flagged.push.apply(report.flagged, r.flagged);
      report.manifest.push.apply(report.manifest, r.media);
      report.perFrame.push({ frame: i, tagged: r.count, text: r.textCount, media: r.media.length, flagged: r.flagged.length });
    });
    report.framesEmpty = frames.length === 0; // caller MUST flag this (never silent)
    return report;
  }

  var api = { tag: tag };
  root.CEReTag = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : this);
