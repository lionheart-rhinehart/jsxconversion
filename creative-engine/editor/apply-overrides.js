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
    // Match by the data-edit-frame stamp ALONE — never the legacy `.cr-frame` class. A
    // JS-driven export's frames (Campaign B `.story`, .dc.html wrappers) are found by
    // frame-detect.js and stamped data-edit-frame WITHOUT a .cr-frame class; requiring
    // that class made every override resolve to null on those designs. The static
    // .cr-frame convention still carries the same stamp, so this matches both.
    return doc.querySelector('[data-edit-frame="' + cssEscape(frameId) + '"]');
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

  // Classify a media URL by its file extension. Any media must be swappable into any
  // slot regardless of what was there originally (a static <img> slot must accept a
  // video, and a <video> slot must accept a photo) — so we key off the INCOMING src's
  // type, not the live element's tag. Query string / hash are stripped before testing.
  var VIDEO_EXT = /\.(mp4|webm|mov|m4v|mkv|avi|ogv)(?:[?#]|$)/i;
  var IMAGE_EXT = /\.(jpe?g|png|gif|webp|avif|svg)(?:[?#]|$)/i;
  function mediaKindOf(src) {
    var s = String(src || '');
    if (VIDEO_EXT.test(s)) return 'video';
    if (IMAGE_EXT.test(s)) return 'image';
    return ''; // unknown — caller keeps the current element type
  }

  // Make `el` behave like the original background footage when it's a <video>.
  function asBgVideo(el) {
    try { el.muted = true; el.loop = true; el.autoplay = true; el.playsInline = true; el.setAttribute('playsinline', ''); el.load && el.load(); } catch (e) {}
  }

  // Replace a media element with a NEW element of `newTag`, carrying over every
  // attribute that keeps it findable + styled (data-edit-* ids, class, inline style
  // incl. the translate/rotate/width/height set by setPos). The src and media-kind
  // stamp are overwritten with the incoming media. Returns the new element.
  function replaceMediaEl(el, newTag, src, newKind) {
    var doc = el.ownerDocument;
    var next = doc.createElement(newTag);
    var attrs = el.attributes;
    for (var i = 0; i < attrs.length; i++) {
      var a = attrs[i];
      var n = a.name.toLowerCase();
      if (n === 'src' || n === 'poster' || n === 'srcset') continue; // media-specific, reset below
      try { next.setAttribute(a.name, a.value); } catch (e) {}
    }
    next.setAttribute('data-edit-media-kind', newKind);
    next.setAttribute('src', src);
    if (newTag === 'video') asBgVideo(next);
    el.replaceWith(next);
    return next;
  }

  function setSrc(el, src) {
    var tag = (el.tagName || '').toLowerCase();
    var kind = el.getAttribute('data-edit-media-kind') || '';
    var incoming = mediaKindOf(src); // 'video' | 'image' | '' (unknown)

    // CSS-background slot. An image swap rewrites the url(); a VIDEO swap can't live in
    // a background, so replace the bg element with a cover <video> (same box/attrs).
    if (kind === 'css-bg' || /background(?:-image)?\s*:[^;]*url\(/i.test(el.getAttribute('style') || '')) {
      if (incoming === 'video') {
        var v = replaceMediaEl(el, 'video', src, 'video');
        // strip the now-meaningless background-image url() and make it fill its box
        var st = (v.getAttribute('style') || '').replace(/background(?:-image)?\s*:[^;]*url\([^)]*\)\s*;?/i, '');
        if (!/object-fit/i.test(st)) st += (st.trim().endsWith(';') || !st.trim() ? '' : ';') + 'object-fit:cover;';
        v.setAttribute('style', st);
        return;
      }
      var style = el.getAttribute('style') || '';
      var next = style.replace(/url\(\s*['"]?[^'")]*['"]?\s*\)/i, "url('" + src + "')");
      if (next === style) next = style + (style.trim().endsWith(';') ? '' : ';') + "background-image:url('" + src + "');";
      el.setAttribute('style', next);
      return;
    }

    // Type-CHANGING swaps: the element's tag can't carry the incoming media, so swap the
    // element itself. <img> ← video → become a <video>; <video> ← image → become an <img>.
    if (tag === 'img' && incoming === 'video') { replaceMediaEl(el, 'video', src, 'video'); return; }
    if (tag === 'video' && incoming === 'image') { replaceMediaEl(el, 'img', src, 'image'); return; }

    // Same-type (or unknown-type) swap: set src in place.
    if (tag === 'video') {
      el.setAttribute('src', src);
      asBgVideo(el); // a swapped clip: keep it behaving like the original bg footage
      return;
    }
    // img / picture-source / default
    el.setAttribute('src', src);
  }

  // MOVE via the individual `translate` property (NOT margins, NOT the `transform`
  // shorthand). It's a separate property that COMPOSES with the keyframe `transform`,
  // so it (a) moves freely in 2D — no margin-collapse vertical lock, (b) causes NO
  // reflow — moving one element never shifts its siblings, and (c) keeps the animation
  // playing. RESIZE stays width/height. Proven by the 2026-06-12 spike.
  function setPos(el, pos) {
    if (!pos) return;
    if (pos.tx != null || pos.ty != null) {
      el.style.translate = (Number(pos.tx) || 0) + 'px ' + (Number(pos.ty) || 0) + 'px';
    }
    if (pos.w != null) el.style.width = px(pos.w);
    if (pos.h != null) el.style.height = px(pos.h);
  }

  function px(v) { return (typeof v === 'number') ? v + 'px' : String(v); }

  // MONTAGE (Phase D, LIVE only): tag a single <video> with its portable montage bag
  // (clips + totalDuration). The actual clip-cycling is driven by a rAF loop in editor.js
  // (the headless RENDERER never sees `montage` — render-frame.mjs expands it to a concat
  // {src} before this runs). We only attach metadata here so the driver can find it; the
  // driver itself lives in the editor, off the shared/headless path.
  function setMontage(el, montage) {
    el.__ceMontage = montage || null;
    // surface to a host-installed driver hook so applying a bag (incl. undo replay) restarts it
    var doc = el.ownerDocument, win = doc && doc.defaultView;
    if (win && typeof win.__ceMontageChanged === 'function') { try { win.__ceMontageChanged(el); } catch (e) {} }
  }

  function applyOne(el, ov) {
    if (!el || !ov) return;
    if (ov.text != null) setText(el, ov.text);
    if (ov.src != null) setSrc(el, ov.src);
    if (ov.montage != null) setMontage(el, ov.montage);
    if (ov.pos != null) setPos(el, ov.pos);
    if (ov.color != null) el.style.color = ov.color;
    if (ov.fontSize != null) el.style.fontSize = px(ov.fontSize);
    // ROTATE via the individual `rotate` property — composes with the keyframe transform,
    // no wrapper, no DOM surgery.
    if (ov.rotate != null) el.style.rotate = (Number(ov.rotate) || 0) + 'deg';
  }

  // doc = a Document (browser live edit, or puppeteer page document)
  // overrides = { "fN:eM": {text?,src?,pos?} }
  // returns { applied, missing:[keys] } — missing is surfaced, never silent.
  function applyOverrides(doc, overrides) {
    var applied = 0, missing = [];
    overrides = overrides || {};
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
