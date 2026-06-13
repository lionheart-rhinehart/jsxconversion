// creative-engine/editor/editor.js
//
// Phase 2 — THE one portable editor. Self-contained, host-agnostic (mounts in the
// review page AND inside Kraken: same code, a permissions flag toggles view⟷edit).
//
//   import { mountEditor } from './editor.js'
//   const ed = mountEditor({
//     container, html /* Phase-1 tagged HTML */, permissions:'edit'|'view',
//     mediaLibrary:[{src,type,label}], overrides:{}, onChange(ov){} })
//   ed.getOverrides()   // { "fN:eM": {text?,src?,pos?} }
//
// The design lives inside an <iframe> so its CSS never collides with the editor
// chrome. Editing writes a deterministic OVERRIDE BAG keyed to the Phase-1 ids; we
// never re-draw the design. The SAME apply-overrides.js that runs here also runs in
// the renderer, so the preview and the MP4 agree by construction.
//
// Position edits move LEFT/TOP (layout) — never transform — so a dragged element
// that is also keyframe-animated on transform keeps animating in the render.

// apply-overrides.js is loaded as a global (window.CEApply) by the host page BEFORE
// this module, and is also injected INTO the iframe document. We reference the
// iframe's copy at apply time.

const IFRAME_CSS = `
  html,body{margin:0!important;background:#0a0b0d!important;}
  body>*{display:none!important;}
  #ce-canvas{display:flex!important;position:fixed!important;inset:0!important;
    align-items:center;justify-content:center;background:#0a0b0d;overflow:hidden;}
  #ce-fit{position:relative;}
  #ce-fit>.cr-frame{transform-origin:top left!important;}
  [data-edit-id]{outline:0;}
  body.ce-edit [data-edit-id]:hover{outline:1px dashed rgba(196,20,29,.7);outline-offset:1px;cursor:pointer;}
  body.ce-edit [data-edit-text].ce-editing{outline:2px solid #c4141d;cursor:text;}
`;

function clone(o) { return JSON.parse(JSON.stringify(o || {})); }

export function mountEditor(opts) {
  const { container, html } = opts;
  const permissions = opts.permissions || 'edit';
  const editable = permissions === 'edit';
  // Pluggable media provider (Phase C2). Back-compat: a bare `mediaLibrary` array
  // still works. A provider can also carry a `remoteBrowse` (the live Kraken bridge);
  // when it's null/absent — or when the served routes report unavailable — the Kraken
  // UI stays hidden and the static library + paste-path still drive the swap bar.
  const mediaProvider = opts.mediaProvider || {};
  const mediaLibrary = mediaProvider.staticLibrary || opts.mediaLibrary || [];
  const remoteBrowse = mediaProvider.remoteBrowse || null;
  const baseHref = opts.baseHref || '';
  const onChange = opts.onChange || function () {};

  let overrides = clone(opts.overrides || {});
  const undoStack = [];
  const redoStack = [];

  let frameIds = [];
  let curFrame = null;          // "fN"
  let scale = 1;                // stage px → screen px
  let selection = [];           // ordered ["fN:eM", …]; primary = last
  let selectedKey = null;       // primary key (last of `selection`) — props/resize target
  let frameHome = null;         // { parent, next } to restore a relocated .cr-frame

  // ── build chrome ─────────────────────────────────────────────────────────
  const rootEl = document.createElement('div');
  rootEl.className = 'ce-editor';
  rootEl.innerHTML = `
    <div class="ce-toolbar">
      <span class="ce-tag">// CreativeEngine</span>
      <span class="ce-title">Editor</span>
      <select class="ce-select ce-frames"></select>
      <span class="ce-props" style="display:none;align-items:center;gap:8px;">
        <input type="color" class="ce-prop-color" title="Text color" style="width:30px;height:28px;padding:0;border:1px solid #2c3038;background:#1f2227;border-radius:6px;">
        <button class="ce-btn ce-fs-dn" title="Smaller">A−</button>
        <input type="number" class="ce-prop-fs" title="Font size (px)" style="width:64px;" min="4" max="400">
        <button class="ce-btn ce-fs-up" title="Bigger">A+</button>
        <input type="number" class="ce-prop-rot" title="Rotate (°)" style="width:60px;" step="1" placeholder="0°">
      </span>
      <span class="ce-group-ctl" style="display:none;align-items:center;gap:6px;">
        <button class="ce-btn ce-group" title="Group selected (Ctrl+G)">⧉ Group</button>
        <button class="ce-btn ce-ungroup" title="Ungroup (Ctrl+Shift+G)" style="display:none;">⤢ Ungroup</button>
        <span class="ce-selcount" style="font-size:12px;color:var(--ce-dim, #969ca7);"></span>
      </span>
      <span class="ce-spacer"></span>
      <button class="ce-btn ce-undo" disabled>↶ Undo</button>
      <button class="ce-btn ce-redo" disabled>↷ Redo</button>
      <button class="ce-btn ce-primary ce-save">Save change-list</button>
    </div>
    <div class="ce-stage">
      <iframe class="ce-frame-host" referrerpolicy="no-referrer"></iframe>
      <div class="ce-multi"></div>
      <div class="ce-guides"></div>
      <div class="ce-marquee"></div>
      <div class="ce-overlay"><div class="ce-badge"></div><div class="ce-handle ce-se"></div></div>
    </div>
    <div class="ce-footer">
      <span class="ce-hint">${editable ? 'Click to select · drag to move · double-click to edit text / swap a photo or clip · corner to resize' : 'View only'}</span>
      <div class="ce-swapbar">
        <input type="text" class="ce-swap-url" placeholder="Paste a media URL / path…">
        <button class="ce-btn ce-swap-apply">Swap</button>
        <div class="ce-thumbs"></div>
        <span class="ce-kraken" style="display:none;align-items:center;gap:6px;">
          <button class="ce-btn ce-kraken-open" title="Browse the live Content Library">⛓ Kraken ▾</button>
          <select class="ce-select ce-kraken-ws" style="display:none;" title="Workspace"></select>
          <select class="ce-select ce-kraken-folder" style="display:none;" title="Folder"></select>
        </span>
        <button class="ce-btn ce-swap-close">Done</button>
      </div>
      <div class="ce-kraken-grid">
        <div class="ce-kgrid-bar">
          <span class="ce-kgrid-title"></span>
          <span class="ce-kgrid-filter">
            <button class="ce-btn ce-kf ce-on" data-f="all">All</button>
            <button class="ce-btn ce-kf" data-f="video">▶ Video</button>
            <button class="ce-btn ce-kf" data-f="image">▣ Photo</button>
          </span>
          <input type="search" class="ce-ksearch" placeholder="Filter by name…">
          <select class="ce-select ce-ksort" title="Sort">
            <option value="recent">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="name">Name A–Z</option>
            <option value="namez">Name Z–A</option>
          </select>
          <span class="ce-kgrid-zoom" title="Thumbnail size (tiles across)">
            <span class="ce-kz-ic ce-kz-big">▢</span>
            <input type="range" class="ce-kz-range" min="1" max="10" value="5">
            <span class="ce-kz-ic ce-kz-small">▦</span>
          </span>
          <span class="ce-kgrid-spacer"></span>
          <button class="ce-btn ce-kraken-lock" title="Pin this folder as the default for this project">🔒 Lock</button>
        </div>
        <div class="ce-kgrid-tiles"></div>
        <div class="ce-kgrid-foot">
          <span class="ce-kgrid-sel">Click a clip to preview · then “Use this”.</span>
          <button class="ce-btn ce-primary ce-kraken-use" disabled>Use this media</button>
        </div>
      </div>
    </div>`;
  container.appendChild(rootEl);

  const els = {
    frames: rootEl.querySelector('.ce-frames'),
    undo: rootEl.querySelector('.ce-undo'),
    redo: rootEl.querySelector('.ce-redo'),
    save: rootEl.querySelector('.ce-save'),
    stage: rootEl.querySelector('.ce-stage'),
    iframe: rootEl.querySelector('.ce-frame-host'),
    overlay: rootEl.querySelector('.ce-overlay'),
    badge: rootEl.querySelector('.ce-badge'),
    seHandle: rootEl.querySelector('.ce-se'),
    multi: rootEl.querySelector('.ce-multi'),
    guides: rootEl.querySelector('.ce-guides'),
    marquee: rootEl.querySelector('.ce-marquee'),
    groupCtl: rootEl.querySelector('.ce-group-ctl'),
    groupBtn: rootEl.querySelector('.ce-group'),
    ungroupBtn: rootEl.querySelector('.ce-ungroup'),
    selCount: rootEl.querySelector('.ce-selcount'),
    swapbar: rootEl.querySelector('.ce-swapbar'),
    swapUrl: rootEl.querySelector('.ce-swap-url'),
    swapApply: rootEl.querySelector('.ce-swap-apply'),
    swapClose: rootEl.querySelector('.ce-swap-close'),
    thumbs: rootEl.querySelector('.ce-thumbs'),
    kraken: rootEl.querySelector('.ce-kraken'),
    krakenOpen: rootEl.querySelector('.ce-kraken-open'),
    krakenWs: rootEl.querySelector('.ce-kraken-ws'),
    krakenFolder: rootEl.querySelector('.ce-kraken-folder'),
    krakenGrid: rootEl.querySelector('.ce-kraken-grid'),
    kgridTitle: rootEl.querySelector('.ce-kgrid-title'),
    kgridTiles: rootEl.querySelector('.ce-kgrid-tiles'),
    kgridSel: rootEl.querySelector('.ce-kgrid-sel'),
    kfBtns: Array.from(rootEl.querySelectorAll('.ce-kf')),
    kSearch: rootEl.querySelector('.ce-ksearch'),
    kSort: rootEl.querySelector('.ce-ksort'),
    kzRange: rootEl.querySelector('.ce-kz-range'),
    krakenLock: rootEl.querySelector('.ce-kraken-lock'),
    krakenUse: rootEl.querySelector('.ce-kraken-use'),
    props: rootEl.querySelector('.ce-props'),
    propColor: rootEl.querySelector('.ce-prop-color'),
    propFs: rootEl.querySelector('.ce-prop-fs'),
    fsDn: rootEl.querySelector('.ce-fs-dn'),
    fsUp: rootEl.querySelector('.ce-fs-up'),
    propRot: rootEl.querySelector('.ce-prop-rot'),
  };

  function idoc() { return els.iframe.contentDocument; }
  function iwin() { return els.iframe.contentWindow; }

  // ── load the design into the iframe ──────────────────────────────────────
  function loadIframe() {
    return new Promise((resolve) => {
      els.iframe.addEventListener('load', function onload() {
        els.iframe.removeEventListener('load', onload);
        injectIframeRuntime();
        resolve();
      });
      // inject our apply-overrides + a marker style INTO the document. A <base href>
      // makes the design's relative asset paths (assets/vid/…) resolve against the
      // design's real folder even though we mount it via srcdoc (host-agnostic).
      const applySrc = window.__CE_APPLY_SRC__ || '';
      const baseTag = baseHref ? `<base href="${baseHref}">` : '';
      const injected = html
        .replace(/<head([^>]*)>/i, `<head$1>${baseTag}`)
        .replace(/<\/head>/i, `<style id="ce-iframe-css">${IFRAME_CSS}</style></head>`)
        .replace(/<\/body>/i, `<script>${applySrc}</script></body>`);
      els.iframe.srcdoc = injected;
    });
  }

  function injectIframeRuntime() {
    const d = idoc();
    const frames = Array.from(d.querySelectorAll('.cr-frame[data-edit-frame]'));
    frameIds = frames.map((f) => f.getAttribute('data-edit-frame'));
    const total = frames.length;
    // label each creative by its human name (the design tags figures with data-label,
    // e.g. "1A · Live Gap HUD") rather than the internal frame id.
    els.frames.innerHTML = frames.map((f, i) => {
      const fig = f.closest('[data-label]');
      const label = fig ? fig.getAttribute('data-label').split('·')[0].trim() : '';
      const name = label ? `${label} — creative ${i + 1} of ${total}` : `Creative ${i + 1} of ${total}`;
      return `<option value="${f.getAttribute('data-edit-frame')}">${name}</option>`;
    }).join('');
    if (!curFrame || frameIds.indexOf(curFrame) < 0) curFrame = frameIds[0];
    els.frames.value = curFrame;
  }

  // relocate the chosen .cr-frame into a fit-to-screen canvas, apply overrides
  function showFrame(fid) {
    const d = idoc();
    // restore a previously-relocated frame
    if (frameHome && frameHome.node) {
      if (frameHome.next) frameHome.parent.insertBefore(frameHome.node, frameHome.next);
      else frameHome.parent.appendChild(frameHome.node);
      frameHome.node.style.transform = frameHome.transform || '';
      frameHome = null;
    }
    const old = d.getElementById('ce-canvas'); if (old) old.remove();

    const frame = d.querySelector('.cr-frame[data-edit-frame="' + fid + '"]');
    if (!frame) return;
    curFrame = fid;
    els.frames.value = fid;

    frameHome = { node: frame, parent: frame.parentNode, next: frame.nextSibling,
      transform: frame.style.transform };

    const canvas = d.createElement('div'); canvas.id = 'ce-canvas';
    const fit = d.createElement('div'); fit.id = 'ce-fit';
    canvas.appendChild(fit); fit.appendChild(frame);
    d.body.appendChild(canvas);
    d.body.classList.toggle('ce-edit', editable);

    fitFrame(frame, fit);
    applyAll();
    window.addEventListener('resize', () => fitFrame(frame, fit));
    clearSelection();
  }

  function fitFrame(frame, fit) {
    const W = 1080, H = 1920;
    const sw = els.stage.clientWidth, sh = els.stage.clientHeight;
    scale = Math.min(sw / W, sh / H) * 0.94;
    frame.style.transform = `scale(${scale})`;
    frame.style.transformOrigin = 'top left';
    fit.style.width = (W * scale) + 'px';
    fit.style.height = (H * scale) + 'px';
    syncOverlay();
  }

  // ── apply current overrides onto the live iframe DOM ──────────────────────
  function applyAll() {
    const w = iwin();
    if (w && w.CEApply) w.CEApply.applyOverrides(idoc(), overrides);
  }

  // re-render a given override state from the pristine baseline (used by undo/redo).
  // loadIframe() swaps in a FRESH iframe document, so every per-document listener must be
  // re-bound or the editor goes dead after an undo (select/drag/dblclick + shortcuts).
  async function rerenderPristine() {
    await loadIframe();
    wireIframe(); wireIframeMouse(); wireIframeKeys();
    showFrame(curFrame);
  }

  // ── selection + overlay ───────────────────────────────────────────────────
  function elForKey(key) {
    const w = iwin();
    return w && w.CEApply ? w.CEApply._targetEl(idoc(), key) : null;
  }
  function keyForEl(el) {
    const frame = el.closest('.cr-frame[data-edit-frame]');
    if (!frame) return null;
    return frame.getAttribute('data-edit-frame') + ':' + el.getAttribute('data-edit-id');
  }

  // Resolve the element the user MEANT to click. Designs stack full-bleed gradient
  // overlays on top of the text/media, so the topmost element at the cursor is often a
  // non-editable cover. Walk the stack (front→back) and prefer the most specific editable
  // (text or media) beneath the cursor; fall back to the topmost tagged element.
  function resolveTarget(e) {
    const d = idoc();
    let stack = [];
    if (d.elementsFromPoint) stack = d.elementsFromPoint(e.clientX, e.clientY) || [];
    const tagged = stack.map((n) => n.closest && n.closest('[data-edit-id]')).filter(Boolean);
    const textOrMedia = tagged.find((n) => n.hasAttribute('data-edit-text') || n.hasAttribute('data-edit-media'));
    return textOrMedia || tagged[0] || (e.target.closest && e.target.closest('[data-edit-id]')) || null;
  }
  // C1 — first editable MEDIA under the cursor, regardless of how many non-media covers
  // (gradients/filters) are stacked on top of it.
  function mediaUnderPoint(e) {
    const d = idoc();
    const stack = (d.elementsFromPoint && d.elementsFromPoint(e.clientX, e.clientY)) || [];
    for (let i = 0; i < stack.length; i++) {
      const m = stack[i].closest && stack[i].closest('[data-edit-media]');
      if (m) return m;
    }
    return null;
  }
  // ── groups (editor metadata; never a DOM node) ────────────────────────────
  // Stored in the override bag under the reserved "__groups__" key, which
  // apply-overrides.js skips (it's not an element). Shape: [{id, members:[keys]}].
  function groupsList() { return Array.isArray(overrides.__groups__) ? overrides.__groups__ : []; }
  function groupOf(key) { return groupsList().find((g) => g.members.indexOf(key) >= 0) || null; }
  // expand a set of keys so selecting any group member selects the whole group
  function expandGroups(keys) {
    const out = [];
    keys.forEach((k) => {
      const g = groupOf(k);
      const members = g ? g.members : [k];
      members.forEach((m) => { if (out.indexOf(m) < 0) out.push(m); });
    });
    return out;
  }

  // ── selection (a SET of keys; primary = last, drives props/resize) ─────────
  function clearSelection() {
    selection = []; selectedKey = null;
    els.overlay.classList.remove('ce-on');
    els.props.style.display = 'none';
    els.groupCtl.style.display = 'none';
    els.multi.innerHTML = '';
    closeSwap();
  }

  // Replace the whole selection. `keys` is normalized: invalid keys dropped, groups
  // expanded, deduped. Primary (props/resize target) = the last surviving key.
  function setSelection(keys) {
    const seen = {};
    selection = expandGroups(keys).filter((k) => {
      if (seen[k] || !elForKey(k)) return false; seen[k] = 1; return true;
    });
    selectedKey = selection.length ? selection[selection.length - 1] : null;
    const primaryEl = selectedKey ? elForKey(selectedKey) : null;
    if (primaryEl) syncProps(primaryEl); else els.props.style.display = 'none';
    syncSelectionUI();
  }
  // shift-click: toggle one element's key in/out of the current selection
  function toggleInSelection(key) {
    const g = groupOf(key);
    const members = g ? g.members : [key];
    const has = members.every((m) => selection.indexOf(m) >= 0);
    let next = selection.slice();
    if (has) next = next.filter((k) => members.indexOf(k) < 0); // remove the group/element
    else members.forEach((m) => { if (next.indexOf(m) < 0) next.push(m); });
    setSelection(next);
  }
  function select(el) { setSelection([keyForEl(el)]); }

  function syncSelectionUI() {
    syncOverlay();                 // primary box (handles + badge)
    // secondary outline boxes for the rest of the selection
    els.multi.innerHTML = '';
    if (selection.length > 1) {
      selection.forEach((k) => {
        if (k === selectedKey) return;
        const el = elForKey(k); if (!el) return;
        const box = boxFor(el); if (!box) return;
        const d = document.createElement('div');
        d.className = 'ce-selbox';
        Object.assign(d.style, { left: box.left + 'px', top: box.top + 'px', width: box.w + 'px', height: box.h + 'px' });
        els.multi.appendChild(d);
      });
    }
    // group controls: show when ≥2 selected; Ungroup when the selection equals a group
    const n = selection.length;
    els.groupCtl.style.display = (editable && n >= 2) ? 'inline-flex' : 'none';
    els.selCount.textContent = n >= 2 ? `${n} selected` : '';
    const wholeGroupSelected = (() => {
      if (n < 2) return false;
      const g = groupOf(selection[0]);
      return !!g && g.members.length === n && g.members.every((m) => selection.indexOf(m) >= 0);
    })();
    els.groupBtn.style.display = wholeGroupSelected ? 'none' : '';
    els.ungroupBtn.style.display = wholeGroupSelected ? '' : 'none';
  }

  // map an iframe element's rect into stage (chrome) coordinates
  function boxFor(el) {
    const ir = els.iframe.getBoundingClientRect();
    const sr = els.stage.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    if (!r.width && !r.height) return null;
    return { left: (ir.left - sr.left) + r.left, top: (ir.top - sr.top) + r.top, w: r.width, h: r.height };
  }

  // show the text-property bar (color / size / rotate) for a selected text element,
  // seeded from its current computed values + any existing override.
  function syncProps(el) {
    const isText = el.hasAttribute('data-edit-text');
    els.props.style.display = (editable && isText) ? 'inline-flex' : 'none';
    if (!isText) return;
    const cs = iwin().getComputedStyle(el);
    const ov = overrides[selectedKey] || {};
    els.propColor.value = rgbToHex(ov.color || cs.color);
    els.propFs.value = Math.round(parseFloat(ov.fontSize != null ? ov.fontSize : cs.fontSize)) || '';
    els.propRot.value = ov.rotate != null ? ov.rotate : '';
  }
  function rgbToHex(c) {
    const m = /rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(c || '');
    if (!m) return /^#/.test(c) ? c : '#ffffff';
    return '#' + [1, 2, 3].map((i) => (+m[i]).toString(16).padStart(2, '0')).join('');
  }

  function syncOverlay() {
    if (!selectedKey) { els.overlay.classList.remove('ce-on'); return; }
    const el = elForKey(selectedKey); if (!el) { els.overlay.classList.remove('ce-on'); return; }
    const ir = els.iframe.getBoundingClientRect();
    const sr = els.stage.getBoundingClientRect();
    const r = el.getBoundingClientRect(); // already includes the scale transform
    const left = (ir.left - sr.left) + r.left;
    const top = (ir.top - sr.top) + r.top;
    Object.assign(els.overlay.style, { left: left + 'px', top: top + 'px', width: r.width + 'px', height: r.height + 'px' });
    els.overlay.classList.add('ce-on');
    els.badge.textContent = selectedKey + (el.hasAttribute('data-edit-media') ? ' · media' : el.hasAttribute('data-edit-text') ? ' · text' : ' · box');
    els.seHandle.style.display = editable ? 'block' : 'none';
  }

  // ── history ───────────────────────────────────────────────────────────────
  function pushHistory() { undoStack.push(clone(overrides)); redoStack.length = 0; syncButtons(); }
  function syncButtons() { els.undo.disabled = !undoStack.length; els.redo.disabled = !redoStack.length; }
  function commit() { onChange(clone(overrides)); syncButtons(); }

  function setOverride(key, patch) {
    pushHistory();
    overrides[key] = Object.assign({}, overrides[key], patch);
    commit();
  }

  // apply many element patches as ONE undo step (group move writes each member's pos)
  function setManyOverrides(patchByKey) {
    pushHistory();
    Object.keys(patchByKey).forEach((key) => {
      overrides[key] = Object.assign({}, overrides[key], patchByKey[key]);
    });
    commit();
  }
  // set the reserved __groups__ metadata as one undo step
  function setGroups(arr) {
    pushHistory();
    if (arr && arr.length) overrides.__groups__ = arr; else delete overrides.__groups__;
    commit();
  }

  async function undo() {
    if (!undoStack.length) return;
    redoStack.push(clone(overrides));
    overrides = undoStack.pop();
    await rerenderPristine(); commit();
  }
  async function redo() {
    if (!redoStack.length) return;
    undoStack.push(clone(overrides));
    overrides = redoStack.pop();
    await rerenderPristine(); commit();
  }

  // ── interactions inside the iframe ────────────────────────────────────────
  let editingEl = null;
  function wireIframe() {
    const d = idoc();
    d.addEventListener('mousedown', onDown, true);
    d.addEventListener('click', onClick, true);
    d.addEventListener('dblclick', onDblClick, true);
  }

  // Canva model: a single click only SELECTS (and, for media, opens the swap bar);
  // editing text requires a DOUBLE-click. A drag (>3px) suppresses the click entirely.
  let suppressClick = false;
  function onClick(e) {
    if (!editable) return;
    if (suppressClick) { suppressClick = false; return; } // this click ended a drag/marquee
    if (editingEl) return; // a click inside an active editor stays in the editor
    // C1 — Alt-click GRABS the media beneath a full-bleed overlay (gradient/filter):
    // walk the cursor's element stack for the first [data-edit-media]. Fixes "I had to
    // move the filter to grab the video." Pure selection → opens the existing swap bar.
    if (e.altKey) {
      const m = mediaUnderPoint(e);
      if (m) { e.preventDefault(); e.stopPropagation(); commitTextEdit(); select(m); openSwap(m); return; }
    }
    const el = resolveTarget(e);
    if (!el) { commitTextEdit(); clearSelection(); return; }
    e.preventDefault(); e.stopPropagation();
    commitTextEdit();            // clicking elsewhere commits any open edit
    if (e.shiftKey) { toggleInSelection(keyForEl(el)); }  // multi-select
    else { select(el); }         // single click only selects (so you can drag to move)
    closeSwap();
  }

  // Double-click = change content: text → edit it; media → open the swap bar. Consistent
  // and drag-proof (a single click + tiny movement no longer accidentally opens the bar).
  function onDblClick(e) {
    if (!editable) return;
    const el = resolveTarget(e);
    if (!el) return;
    e.preventDefault(); e.stopPropagation();
    select(el);
    if (el.hasAttribute('data-edit-text')) startTextEdit(el);
    else if (el.hasAttribute('data-edit-media')) openSwap(el);
  }

  // dragging (move) — TRUE free 2D float via the individual `translate` property. It
  // composes with the keyframe `transform` (never overwrites it), causes no reflow, and
  // has no axis lock. preventDefault on mousedown stops native text-selection hijacking
  // the drag. See onMove. (Replaces the old margins/absolute-promotion approaches.)
  let drag = null;
  let marquee = null;
  function onDown(e) {
    if (!editable) return;
    if (editingEl) return; // let contenteditable handle its own pointer
    if (e.shiftKey) return; // shift = additive select; defer to onClick (no drag)
    const el = resolveTarget(e);
    if (!el) {              // empty canvas → start a marquee box (iframe-viewport coords)
      e.preventDefault();
      marquee = { x0: e.clientX, y0: e.clientY, x1: e.clientX, y1: e.clientY, moved: false };
      return;
    }
    e.preventDefault();    // suppress native selection so a drag moves instead of highlights
    const key = keyForEl(el);
    // if the clicked element is already part of a multi-selection, keep it and drag the
    // whole set; otherwise (re)select just this one (group-expanded).
    if (selection.indexOf(key) < 0 || selection.length <= 1) select(el);
    // build the drag set: every selected member moves rigidly together, each keeping its
    // own base translate so each writes its own `pos` (a group is never a DOM node).
    const members = {};
    selection.forEach((k) => {
      const mEl = elForKey(k); if (!mEl) return;
      const bp = (overrides[k] || {}).pos || {};
      members[k] = { el: mEl, baseTx: bp.tx || 0, baseTy: bp.ty || 0, tx: bp.tx || 0, ty: bp.ty || 0 };
    });
    drag = { members, primaryKey: selectedKey, startX: e.clientX, startY: e.clientY, moved: false };
  }

  // MOVE via the individual `translate` property — free 2D, no reflow, composes with the
  // keyframe transform (proven by the 2026-06-12 spike). Delta is in design px (÷ scale).
  // The whole selection moves by the same delta; alignment guides snap the PRIMARY element
  // (and the snap offset shifts every member equally so the group stays rigid).
  function onMove(e) {
    if (marquee) { marquee.x1 = e.clientX; marquee.y1 = e.clientY;
      if (Math.abs(e.clientX - marquee.x0) + Math.abs(e.clientY - marquee.y0) > 3) marquee.moved = true;
      drawMarquee(); return; }
    if (!drag) return;
    let dx = (e.clientX - drag.startX) / scale;
    let dy = (e.clientY - drag.startY) / scale;
    if (Math.abs(e.clientX - drag.startX) + Math.abs(e.clientY - drag.startY) > 3) drag.moved = true;
    if (!drag.moved) return;
    // first place every member at the tentative delta…
    Object.keys(drag.members).forEach((k) => {
      const m = drag.members[k];
      m.el.style.translate = (m.baseTx + dx) + 'px ' + (m.baseTy + dy) + 'px';
    });
    // …then compute snap on the primary and re-apply the corrected delta to everyone
    const snap = computeGuides(drag.members, drag.primaryKey);
    if (snap && (snap.adjX || snap.adjY)) {
      dx += snap.adjX / scale; dy += snap.adjY / scale;
      Object.keys(drag.members).forEach((k) => {
        const m = drag.members[k];
        m.el.style.translate = (m.baseTx + dx) + 'px ' + (m.baseTy + dy) + 'px';
      });
    }
    Object.keys(drag.members).forEach((k) => { const m = drag.members[k]; m.tx = m.baseTx + dx; m.ty = m.baseTy + dy; });
    syncSelectionUI();
  }
  function onUp() {
    if (marquee) {
      if (marquee.moved) { suppressClick = true; selectInMarquee(marquee); }
      marquee = null; els.marquee.classList.remove('ce-on');
    }
    if (drag && drag.moved) {
      suppressClick = true;
      const patch = {};
      Object.keys(drag.members).forEach((k) => {
        const m = drag.members[k];
        patch[k] = { pos: Object.assign({}, (overrides[k] || {}).pos, { tx: Math.round(m.tx), ty: Math.round(m.ty) }) };
      });
      setManyOverrides(patch);
    }
    drag = null;
    clearGuides();
    if (resize) {
      const key = keyForEl(resize.el);
      setOverride(key, { pos: Object.assign({}, (overrides[key] || {}).pos, {
        w: Math.round(resize.el.offsetWidth), h: Math.round(resize.el.offsetHeight) }) });
      resize = null;
    }
  }

  // ── marquee (rubber-band) selection ───────────────────────────────────────
  function drawMarquee() {
    const ir = els.iframe.getBoundingClientRect();
    const sr = els.stage.getBoundingClientRect();
    const x = Math.min(marquee.x0, marquee.x1), y = Math.min(marquee.y0, marquee.y1);
    const w = Math.abs(marquee.x1 - marquee.x0), h = Math.abs(marquee.y1 - marquee.y0);
    Object.assign(els.marquee.style, {
      left: ((ir.left - sr.left) + x) + 'px', top: ((ir.top - sr.top) + y) + 'px',
      width: w + 'px', height: h + 'px' });
    els.marquee.classList.add('ce-on');
  }
  function selectInMarquee(mq) {
    const rx0 = Math.min(mq.x0, mq.x1), ry0 = Math.min(mq.y0, mq.y1);
    const rx1 = Math.max(mq.x0, mq.x1), ry1 = Math.max(mq.y0, mq.y1);
    const frame = idoc().querySelector('.cr-frame[data-edit-frame="' + curFrame + '"]');
    if (!frame) return;
    const enclosed = [];
    frame.querySelectorAll('[data-edit-id]').forEach((el) => {
      const r = el.getBoundingClientRect();   // iframe-viewport coords, same as marquee
      if (!r.width && !r.height) return;
      // require the element to be fully enclosed by the marquee (Canva-style)
      if (r.left >= rx0 && r.top >= ry0 && r.right <= rx1 && r.bottom <= ry1) enclosed.push(el);
    });
    // TOP-LEVEL ONLY: a marquee grabs whole objects, not their inner spans. Drop any
    // enclosed element that has an enclosed tagged ANCESTOR — keep only the outermost
    // tagged node of each nesting chain (matches Canva; sub-pieces are reachable by click).
    const set = new Set(enclosed);
    const tops = enclosed.filter((el) => {
      let p = el.parentElement;
      while (p && p !== frame) { if (set.has(p)) return false; p = p.parentElement; }
      return true;
    });
    setSelection(tops.map(keyForEl));
  }

  // ── alignment guides + snap + distance readout (parent-doc chrome only) ─────
  // Runs entirely in the editor chrome — NEVER writes transform into the iframe DOM.
  // Reuses the same iframe→stage rect mapping as syncOverlay. Snaps the PRIMARY box's
  // edges/centers to sibling edges/centers within SNAP px; draws guide lines + a live
  // "px to nearest neighbor" badge. Returns {adjX,adjY} in SCREEN px (onMove ÷ scale).
  const SNAP = 6;
  function computeGuides(members, primaryKey) {
    const primary = members[primaryKey] && members[primaryKey].el;
    if (!primary) { clearGuides(); return null; }
    const pr = primary.getBoundingClientRect();        // iframe-viewport coords (post-move)
    const moving = {}; Object.keys(members).forEach((k) => { moving[k] = 1; });
    const frame = idoc().querySelector('.cr-frame[data-edit-frame="' + curFrame + '"]');
    if (!frame) { clearGuides(); return null; }

    // x guides at primary L / CX / R ; y guides at T / CY / B
    const px = { L: pr.left, C: pr.left + pr.width / 2, R: pr.right };
    const py = { T: pr.top, C: pr.top + pr.height / 2, B: pr.bottom };
    let bestX = null, bestY = null;            // {adj, line}
    let nearest = null, nearestD = Infinity;

    frame.querySelectorAll('[data-edit-id]').forEach((el) => {
      if (moving[keyForEl(el)]) return;
      const r = el.getBoundingClientRect();
      if (!r.width && !r.height) return;
      const cx = { L: r.left, C: r.left + r.width / 2, R: r.right };
      const cy = { T: r.top, C: r.top + r.height / 2, B: r.bottom };
      ['L', 'C', 'R'].forEach((a) => ['L', 'C', 'R'].forEach((b) => {
        const d = cx[b] - px[a];
        if (Math.abs(d) <= SNAP && (!bestX || Math.abs(d) < Math.abs(bestX.adj))) bestX = { adj: d, line: cx[b] };
      }));
      ['T', 'C', 'B'].forEach((a) => ['T', 'C', 'B'].forEach((b) => {
        const d = cy[b] - py[a];
        if (Math.abs(d) <= SNAP && (!bestY || Math.abs(d) < Math.abs(bestY.adj))) bestY = { adj: d, line: cy[b] };
      }));
      // nearest neighbor for the distance badge (center-to-center)
      const dc = Math.hypot((cx.C - px.C), (cy.C - py.C));
      if (dc < nearestD) { nearestD = dc; nearest = { r, cx, cy }; }
    });

    drawGuides(bestX, bestY, pr, nearest);
    return { adjX: bestX ? bestX.adj : 0, adjY: bestY ? bestY.adj : 0 };
  }

  function drawGuides(bestX, bestY, pr, nearest) {
    const ir = els.iframe.getBoundingClientRect();
    const sr = els.stage.getBoundingClientRect();
    const ox = ir.left - sr.left, oy = ir.top - sr.top;
    let html = '';
    if (bestX) html += `<div class="ce-guide ce-guide-v" style="left:${ox + bestX.line}px;"></div>`;
    if (bestY) html += `<div class="ce-guide ce-guide-h" style="top:${oy + bestY.line}px;"></div>`;
    // distance-to-neighbor badge: edge gaps to the nearest sibling
    if (nearest) {
      const gapX = Math.round(Math.max(0, Math.max(nearest.r.left - pr.right, pr.left - nearest.r.right)) / scale);
      const gapY = Math.round(Math.max(0, Math.max(nearest.r.top - pr.bottom, pr.top - nearest.r.bottom)) / scale);
      html += `<div class="ce-dist" style="left:${ox + pr.left}px;top:${oy + pr.top - 22}px;">↔ ${gapX}px · ↕ ${gapY}px</div>`;
    }
    els.guides.innerHTML = html;
    els.guides.classList.add('ce-on');
  }
  function clearGuides() { els.guides.innerHTML = ''; els.guides.classList.remove('ce-on'); }

  // resize via the SE handle (operates in stage coords)
  let resize = null;
  els.seHandle.addEventListener('mousedown', (e) => {
    if (!editable || !selectedKey) return;
    const el = elForKey(selectedKey); if (!el) return;
    resize = { el, startX: e.clientX, startY: e.clientY, baseW: el.offsetWidth, baseH: el.offsetHeight };
    e.preventDefault(); e.stopPropagation();
  });
  function onResizeMove(e) {
    if (!resize) return;
    const dw = (e.clientX - resize.startX) / scale;
    const dh = (e.clientY - resize.startY) / scale;
    resize.el.style.width = Math.max(8, resize.baseW + dw) + 'px';
    resize.el.style.height = Math.max(8, resize.baseH + dh) + 'px';
    syncOverlay();
  }

  // parent-level mouse tracking (drag started in iframe, mouse may leave it)
  window.addEventListener('mousemove', (e) => {
    if (drag || marquee) { const r = els.iframe.getBoundingClientRect(); onMove(mapToIframe(e, r)); }
    if (resize) onResizeMove(e);
  });
  window.addEventListener('mouseup', onUp);
  // also track inside iframe (where the events originate)
  function wireIframeMouse() {
    const w = iwin();
    w.addEventListener('mousemove', (e) => { if (drag || marquee) onMove(e); if (resize) onResizeMove(e); });
    w.addEventListener('mouseup', onUp);
  }
  function mapToIframe(e, r) { return { clientX: e.clientX - r.left, clientY: e.clientY - r.top }; }

  // ── text editing (contenteditable) ───────────────────────────────────────
  function startTextEdit(el) {
    commitTextEdit();
    editingEl = el;
    el.classList.add('ce-editing');
    el.setAttribute('contenteditable', 'true');
    el.focus();
    const range = idoc().createRange(); range.selectNodeContents(el);
    const sel = iwin().getSelection(); sel.removeAllRanges(); sel.addRange(range);
    el.addEventListener('keydown', textKeydown);
    el.addEventListener('blur', commitTextEdit);
  }
  function textKeydown(e) {
    // Enter = NEW LINE (let contenteditable insert it); Esc / Ctrl+Enter = commit.
    if (e.key === 'Escape' || (e.key === 'Enter' && (e.ctrlKey || e.metaKey))) {
      e.preventDefault(); commitTextEdit();
    }
  }
  function commitTextEdit() {
    if (!editingEl) return;
    const el = editingEl; editingEl = null;
    el.removeEventListener('keydown', textKeydown);
    el.removeEventListener('blur', commitTextEdit);
    el.classList.remove('ce-editing');
    el.removeAttribute('contenteditable');
    const key = keyForEl(el);
    // innerText preserves the line breaks the user typed (portable newlines)
    const text = (el.innerText || el.textContent || '').replace(/\s+$/, '');
    const prev = (overrides[key] || {}).text;
    if (text !== prev && text !== el.getAttribute('data-ce-orig')) setOverride(key, { text });
    syncOverlay();
  }

  // ── media swap bar ────────────────────────────────────────────────────────
  let swapTarget = null;
  function openSwap(el) {
    if (el.hasAttribute('data-edit-brandkit')) { /* brand-kit asset: not swappable */ closeSwap(); return; }
    swapTarget = el;
    els.swapbar.classList.add('ce-on');
    els.thumbs.innerHTML = '';
    mediaLibrary.forEach((m) => {
      const t = m.type === 'video' ? document.createElement('video') : document.createElement('img');
      t.src = m.src; if (m.type === 'video') { t.muted = true; }
      t.title = m.label || m.src;
      t.addEventListener('click', () => applySwap(m.src));
      els.thumbs.appendChild(t);
    });
    // C2 — the live-Kraken button appears ONLY after we've confirmed the bridge is
    // actually reachable (server up + creds present). Hidden by default; the probe
    // reveals it. This avoids a button that appears and then collapses on click when
    // the routes aren't wired (stale server) or creds are missing.
    els.kraken.style.display = 'none';
    if (remoteBrowse) ensureKrakenProbe();
  }
  function applySwap(src) {
    if (!swapTarget || !src) return;
    const key = keyForEl(swapTarget);
    setOverride(key, { src });
    // reflect live
    const w = iwin(); w.CEApply.applyOverrides(idoc(), { [key]: { src } });
    syncOverlay();
  }
  function closeSwap() {
    els.swapbar.classList.remove('ce-on'); swapTarget = null;
    els.krakenGrid.classList.remove('ce-on'); if (els.kgridTiles) els.kgridTiles.innerHTML = '';
    els.krakenWs.style.display = 'none'; els.krakenFolder.style.display = 'none';
    if (playingMedia) { try { playingMedia.pause(); } catch (e) {} playingMedia = null; }
    selectedRow = null; selectedTileEl = null;
    if (els.krakenUse) els.krakenUse.disabled = true;
  }

  // ── live Kraken browser (Phase C3) ────────────────────────────────────────
  // Drives the injected `remoteBrowse` bridge (served host → /kraken/* → kraken.mjs).
  // Every call degrades the SAME way (F6): if the bridge is missing, throws, or reports
  // available:false (no creds / bare host), we hide the Kraken UI and leave the static
  // library + paste-path fully working — never a dead editor, never a 500 surfaced.
  // One-shot availability probe (cached). Resolves true only when the bridge answers
  // with workspaces; reveals the button on success, stays hidden on any failure
  // (stale server → 404 → fetch throws; missing creds → available:false). Same clean
  // degradation either way — the user never sees a button that does nothing.
  let krakenProbe = null;       // Promise<boolean>
  let krakenWsCache = null;     // workspaces from the probe (reused by openKraken)
  function ensureKrakenProbe() {
    if (!krakenProbe) {
      krakenProbe = Promise.resolve(remoteBrowse.workspaces()).then((r) => {
        if (r && r.available !== false) { krakenWsCache = r.items || []; return true; }
        if (r && r.error) console.info('[editor] Kraken unavailable —', r.error);
        return false;
      }).catch((e) => { console.info('[editor] Kraken unreachable —', e && e.message); return false; });
    }
    krakenProbe.then((ok) => { if (ok && swapTarget) { els.kraken.style.display = 'inline-flex'; autoOpenPin(); } });
    return krakenProbe;
  }

  function hideKraken(why) {
    els.kraken.style.display = 'none';
    els.krakenWs.style.display = 'none'; els.krakenFolder.style.display = 'none';
    els.krakenGrid.classList.remove('ce-on'); if (els.kgridTiles) els.kgridTiles.innerHTML = '';
    if (why) console.info('[editor] Kraken browser unavailable —', why);
  }
  function fillSelect(sel, items, valueOf, labelOf, placeholder) {
    sel.innerHTML = `<option value="">${placeholder}</option>` +
      items.map((it) => `<option value="${valueOf(it)}">${labelOf(it)}</option>`).join('');
    sel.style.display = '';
  }
  // Clicking ⛓ Kraken: if a folder is LOCKED, drop straight into it (no manual ws/folder
  // clicking — that's the whole point of the lock). Otherwise open the workspace picker
  // for manual browsing. Clicking again while open closes it.
  async function openKraken() {
    if (!remoteBrowse) return hideKraken('no provider');
    const isOpen = els.krakenGrid.classList.contains('ce-on') || els.krakenWs.style.display !== 'none';
    if (isOpen) {
      els.krakenWs.style.display = 'none'; els.krakenFolder.style.display = 'none';
      els.krakenGrid.classList.remove('ce-on'); if (els.kgridTiles) els.kgridTiles.innerHTML = ''; return;
    }
    const ok = await ensureKrakenProbe();
    if (!ok) return hideKraken('probe failed');
    await ensurePinLoaded();
    if (pinnedState && pinnedState.wsId) { await openToPin(); return; }   // jump straight to the locked folder
    fillSelect(els.krakenWs, krakenWsCache || [], (w) => w.id, (w) => w.label || w.name, 'Workspace…');
    els.krakenFolder.style.display = 'none'; els.krakenGrid.classList.remove('ce-on'); if (els.kgridTiles) els.kgridTiles.innerHTML = '';
  }
  async function loadKrakenFolders(wsId) {
    els.krakenGrid.classList.remove('ce-on'); if (els.kgridTiles) els.kgridTiles.innerHTML = '';
    if (!wsId) { els.krakenFolder.style.display = 'none'; return; }
    try {
      const res = await remoteBrowse.folders(wsId);
      if (!res || res.available === false) return hideKraken(res && res.error);
      // a workspace's media can also live at the root (no folder) → offer it explicitly.
      const items = [{ id: '', name: '— root —' }].concat(res.items || []);
      fillSelect(els.krakenFolder, items, (f) => f.id, (f) => f.name, 'Folder…');
    } catch (e) { hideKraken(e && e.message); }
  }
  // ── thumbnail grid: filter (All/Video/Photo) + badges + click-to-PREVIEW ──────
  // A click PREVIEWS (plays a video inline / highlights a photo) — it does NOT pull.
  // The explicit "Use this media" button (or a double-click) does the download+swap,
  // so previewing never triggers a heavy download and the select control stays small.
  let krakenFiles = [];          // current folder's rows
  let krakenFilter = 'all';      // all | video | image
  let krakenSort = 'recent';     // recent | oldest | name | namez
  let krakenWsId = null;         // current workspace (for pull)
  let selectedRow = null, selectedTileEl = null, playingMedia = null;

  async function loadKrakenFiles(wsId, folderId) {
    krakenWsId = wsId;
    els.krakenGrid.classList.add('ce-on');
    els.kgridTiles.innerHTML = '<span class="ce-kgrid-msg">Loading…</span>';
    setKrakenSelection(null);
    try {
      const res = await remoteBrowse.files(wsId, folderId);
      if (!res || res.available === false) { els.kgridTiles.innerHTML = ''; return hideKraken(res && res.error); }
      krakenFiles = res.items || [];
      renderKrakenTiles();
      updateLockBtn();
    } catch (e) { els.kgridTiles.innerHTML = ''; hideKraken(e && e.message); }
  }

  function renderKrakenTiles() {
    const q = (els.kSearch.value || '').trim().toLowerCase();
    let rows = krakenFiles
      .filter((r) => krakenFilter === 'all' || r.type === krakenFilter)
      .filter((r) => !q || String(r.title || '').toLowerCase().includes(q));
    // sort: newest/oldest by created_at, or by name. slice() so we never mutate the cache.
    const byDate = (a, b) => String(a.created_at || '').localeCompare(String(b.created_at || ''));
    const byName = (a, b) => String(a.title || '').localeCompare(String(b.title || ''), undefined, { sensitivity: 'base' });
    rows = rows.slice();
    if (krakenSort === 'recent') rows.sort((a, b) => byDate(b, a));
    else if (krakenSort === 'oldest') rows.sort(byDate);
    else if (krakenSort === 'name') rows.sort(byName);
    else if (krakenSort === 'namez') rows.sort((a, b) => byName(b, a));
    const nV = krakenFiles.filter((r) => r.type === 'video').length;
    const nI = krakenFiles.filter((r) => r.type === 'image').length;
    const shown = rows.length === krakenFiles.length ? `${krakenFiles.length}` : `${rows.length}/${krakenFiles.length}`;
    els.kgridTitle.textContent = `${shown} item${krakenFiles.length === 1 ? '' : 's'} · ${nV} video · ${nI} photo`;
    els.kgridTiles.innerHTML = '';
    if (!rows.length) { els.kgridTiles.innerHTML = '<span class="ce-kgrid-msg">No media here.</span>'; return; }
    rows.forEach((row) => {
      const tile = document.createElement('div');
      tile.className = 'ce-ktile';
      const media = row.type === 'video' ? document.createElement('video') : document.createElement('img');
      media.src = row.url;
      if (row.type === 'video') { media.muted = true; media.loop = true; media.preload = 'metadata'; media.playsInline = true; }
      const badge = document.createElement('span');
      badge.className = 'ce-ktile-badge';
      badge.textContent = row.type === 'video' ? '▶ VIDEO' : 'IMG';
      tile.append(media, badge);
      tile.title = row.title || row.id;
      tile.addEventListener('click', () => previewKrakenTile(row, tile, media));
      tile.addEventListener('dblclick', () => useSelectedKraken());
      els.kgridTiles.appendChild(tile);
    });
    applyTileZoom();
  }

  // Tile-size slider: value = how many tiles fit ACROSS (1 = one full-width tile … 10 =
  // smallest/densest). The grid uses repeat(N, 1fr), so the columns ALWAYS stretch to
  // fill the panel edge-to-edge — there's never a leftover gap on the right at any size.
  function applyTileZoom() {
    els.kgridTiles.style.setProperty('--ce-cols', Number(els.kzRange.value) || 5);
  }

  // PREVIEW only: highlight + play the video; never pulls.
  function previewKrakenTile(row, tile, media) {
    setKrakenSelection(row, tile);
    if (playingMedia && playingMedia !== media) { try { playingMedia.pause(); } catch (e) {} }
    if (media && media.tagName === 'VIDEO') { try { media.currentTime = 0; media.play(); playingMedia = media; } catch (e) {} }
  }
  function setKrakenSelection(row, tile) {
    selectedRow = row; selectedTileEl = tile || null;
    Array.from(els.kgridTiles.querySelectorAll('.ce-ktile.ce-sel')).forEach((t) => t.classList.remove('ce-sel'));
    if (tile) tile.classList.add('ce-sel');
    els.krakenUse.disabled = !row;
    els.kgridSel.textContent = row ? `Selected: ${row.title || row.id}  (${row.type})` : 'Click a clip to preview · then “Use this”.';
  }
  // USE: download the selected file to the cache + swap it in (the heavy step).
  async function useSelectedKraken() {
    if (!selectedRow || !krakenWsId) return;
    els.krakenUse.disabled = true;
    const prev = els.krakenUse.textContent; els.krakenUse.textContent = 'Pulling…';
    if (selectedTileEl) selectedTileEl.classList.add('ce-ktile-busy');
    try {
      const res = await remoteBrowse.pull({ ws: krakenWsId, row: selectedRow });
      if (!res || res.available === false || !res.path) { els.kgridSel.textContent = 'Pull failed: ' + ((res && res.error) || 'unknown'); return; }
      applySwap(res.path);   // PROJECT_ROOT-rooted "/brand/kraken-cache/…" URL
      els.kgridSel.textContent = 'Swapped in ✓  ' + (selectedRow.title || '');
    } catch (e) { els.kgridSel.textContent = 'Pull error: ' + (e && e.message); }
    finally { els.krakenUse.textContent = prev; els.krakenUse.disabled = false;
      if (selectedTileEl) selectedTileEl.classList.remove('ce-ktile-busy'); }
  }

  // ── lock/pin the current workspace+folder as this project's default (C-polish) ──
  // Persisted via the bridge (server-side file, keyed by the design) so it survives
  // reloads and other chats. Lock at ANY level: workspace-only, or workspace+folder.
  let pinnedState = null;        // {wsId,wsLabel,folderId,folderName} | null
  function currentPin() {
    const wsId = els.krakenWs.value; if (!wsId) return null;
    const wsLabel = els.krakenWs.options[els.krakenWs.selectedIndex] ? els.krakenWs.options[els.krakenWs.selectedIndex].textContent : '';
    const folderId = els.krakenFolder.style.display !== 'none' ? (els.krakenFolder.value || '') : '';
    const fOpt = els.krakenFolder.options[els.krakenFolder.selectedIndex];
    const folderName = (els.krakenFolder.style.display !== 'none' && fOpt) ? fOpt.textContent : '';
    return { wsId, wsLabel, folderId, folderName };
  }
  function pinMatchesNow() {
    const c = currentPin();
    return !!(pinnedState && c && pinnedState.wsId === c.wsId && (pinnedState.folderId || '') === (c.folderId || ''));
  }
  function updateLockBtn() {
    const locked = pinMatchesNow();
    els.krakenLock.textContent = locked ? '🔓 Unlock' : '🔒 Lock';
    els.krakenLock.classList.toggle('ce-on', locked);
    els.krakenLock.title = locked
      ? 'This folder is pinned as the default for this project — click to unpin'
      : 'Pin this workspace/folder as the default for this project';
  }
  async function toggleLock() {
    if (!remoteBrowse.setPin) return;
    const next = pinMatchesNow() ? null : currentPin();
    try { await remoteBrowse.setPin(next); pinnedState = next; } catch (e) { console.info('[editor] pin save failed —', e && e.message); }
    updateLockBtn();
  }
  // load the saved pin ONCE (cached) into pinnedState — used by both auto-open paths.
  let pinLoaded = null;
  function ensurePinLoaded() {
    if (!pinLoaded) {
      pinLoaded = (remoteBrowse.getPin ? Promise.resolve(remoteBrowse.getPin()) : Promise.resolve(null))
        .then((r) => { if (r && r.pin && r.pin.wsId) pinnedState = r.pin; return pinnedState; })
        .catch(() => pinnedState);
    }
    return pinLoaded;
  }
  // JUMP straight to the pinned workspace+folder and show its media — no manual clicking.
  // Idempotent, so it can run on every swap-open and on the Kraken button.
  async function openToPin() {
    if (!pinnedState || !pinnedState.wsId) return false;
    fillSelect(els.krakenWs, krakenWsCache || [], (w) => w.id, (w) => w.label || w.name, 'Workspace…');
    els.krakenWs.value = pinnedState.wsId;
    await loadKrakenFolders(pinnedState.wsId);
    if (pinnedState.folderId) els.krakenFolder.value = pinnedState.folderId;
    await loadKrakenFiles(pinnedState.wsId, pinnedState.folderId || null);
    updateLockBtn();
    return true;
  }
  // on EVERY swap-open (after the probe): if a folder is locked, open straight to it.
  async function autoOpenPin() {
    await ensurePinLoaded();
    if (pinnedState && pinnedState.wsId) openToPin();
  }

  els.krakenOpen.addEventListener('click', openKraken);
  els.krakenWs.addEventListener('change', () => { loadKrakenFolders(els.krakenWs.value); updateLockBtn(); });
  els.krakenFolder.addEventListener('change', () => loadKrakenFiles(els.krakenWs.value, els.krakenFolder.value));
  els.krakenLock.addEventListener('click', toggleLock);
  els.krakenUse.addEventListener('click', useSelectedKraken);
  els.kfBtns.forEach((b) => b.addEventListener('click', () => {
    krakenFilter = b.getAttribute('data-f');
    els.kfBtns.forEach((x) => x.classList.toggle('ce-on', x === b));
    renderKrakenTiles();
  }));
  els.kSearch.addEventListener('input', () => renderKrakenTiles());
  els.kSort.addEventListener('change', () => { krakenSort = els.kSort.value; renderKrakenTiles(); });
  // restore the saved tile size, then live-resize on drag (and persist the choice).
  try { const saved = localStorage.getItem('ce-kraken-cols'); if (saved) els.kzRange.value = saved; } catch (e) {}
  els.kzRange.addEventListener('input', () => {
    applyTileZoom();
    try { localStorage.setItem('ce-kraken-cols', els.kzRange.value); } catch (e) {}
  });

  // ── toolbar wiring ────────────────────────────────────────────────────────
  els.frames.addEventListener('change', () => showFrame(els.frames.value));
  els.undo.addEventListener('click', undo);
  els.redo.addEventListener('click', redo);
  els.save.addEventListener('click', () => onChange(clone(overrides), { save: true }));
  els.swapApply.addEventListener('click', () => applySwap(els.swapUrl.value.trim()));
  els.swapClose.addEventListener('click', closeSwap);

  // text property controls (color / font-size / rotate) — set the override + live-apply
  function applyProp(patch) {
    if (!selectedKey) return;
    setOverride(selectedKey, patch);
    iwin().CEApply.applyOverrides(idoc(), { [selectedKey]: overrides[selectedKey] });
    syncOverlay();
  }
  els.propColor.addEventListener('input', () => applyProp({ color: els.propColor.value }));
  els.propFs.addEventListener('change', () => applyProp({ fontSize: Number(els.propFs.value) }));
  els.fsUp.addEventListener('click', () => { els.propFs.value = (Number(els.propFs.value) || 0) + 4; applyProp({ fontSize: Number(els.propFs.value) }); });
  els.fsDn.addEventListener('click', () => { els.propFs.value = Math.max(4, (Number(els.propFs.value) || 0) - 4); applyProp({ fontSize: Number(els.propFs.value) }); });
  els.propRot.addEventListener('change', () => applyProp({ rotate: Number(els.propRot.value) || 0 }));

  // ── group / ungroup ───────────────────────────────────────────────────────
  function doGroup() {
    if (selection.length < 2) return;
    const members = selection.slice();
    // drop any existing groups that overlap these members, then add one fresh group
    const id = 'g:' + members.join('+');
    const keep = groupsList().filter((g) => !g.members.some((m) => members.indexOf(m) >= 0));
    setGroups(keep.concat([{ id, members }]));
    setSelection(members);   // re-sync UI (now Ungroup shows)
  }
  function doUngroup() {
    if (!selection.length) return;
    const keep = groupsList().filter((g) => !g.members.some((m) => selection.indexOf(m) >= 0));
    setGroups(keep);
    setSelection(selection.slice());
  }
  els.groupBtn.addEventListener('click', doGroup);
  els.ungroupBtn.addEventListener('click', doUngroup);

  // shortcut handler — bound to BOTH the parent window AND the iframe window, because a
  // keydown while focus is inside the design iframe never bubbles out to the parent (which
  // is why Ctrl+G was hitting the browser's "Find Next" instead of grouping). preventDefault
  // on the iframe copy stops the browser default too. stopPropagation avoids double-firing.
  function onShortcut(e) {
    if (!(e.ctrlKey || e.metaKey)) return;
    const k = (e.key || '').toLowerCase();
    if (k === 'g') { e.preventDefault(); e.stopPropagation(); e.shiftKey ? doUngroup() : doGroup(); }
    else if (k === 'z') { e.preventDefault(); e.stopPropagation(); e.shiftKey ? redo() : undo(); }
    else if (k === 'y') { e.preventDefault(); e.stopPropagation(); redo(); }
  }
  window.addEventListener('keydown', onShortcut);
  // (re)bind on the iframe each time its document loads — see wireIframe()
  function wireIframeKeys() { const w = iwin(); if (w) w.addEventListener('keydown', onShortcut, true); }

  // ── boot ──────────────────────────────────────────────────────────────────
  (async function boot() {
    await loadIframe();
    wireIframe(); wireIframeMouse(); wireIframeKeys();
    showFrame(curFrame);
    syncButtons();
  })();

  return {
    getOverrides: () => clone(overrides),
    setOverrides: async (ov) => { overrides = clone(ov || {}); await rerenderPristine(); },
    showFrame, undo, redo,
    destroy: () => rootEl.remove(),
  };
}
