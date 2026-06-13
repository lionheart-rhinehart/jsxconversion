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
  const mediaLibrary = opts.mediaLibrary || [];
  const baseHref = opts.baseHref || '';
  const onChange = opts.onChange || function () {};

  let overrides = clone(opts.overrides || {});
  const undoStack = [];
  const redoStack = [];

  let frameIds = [];
  let curFrame = null;          // "fN"
  let scale = 1;                // stage px → screen px
  let selectedKey = null;       // "fN:eM"
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
      <span class="ce-spacer"></span>
      <button class="ce-btn ce-undo" disabled>↶ Undo</button>
      <button class="ce-btn ce-redo" disabled>↷ Redo</button>
      <button class="ce-btn ce-primary ce-save">Save change-list</button>
    </div>
    <div class="ce-stage">
      <iframe class="ce-frame-host" referrerpolicy="no-referrer"></iframe>
      <div class="ce-overlay"><div class="ce-badge"></div><div class="ce-handle ce-se"></div></div>
    </div>
    <div class="ce-footer">
      <span class="ce-hint">${editable ? 'Click text to retype · click a photo/clip to swap · drag to move · corner to resize' : 'View only'}</span>
      <div class="ce-swapbar">
        <input type="text" class="ce-swap-url" placeholder="Paste a Kraken media URL / path…">
        <button class="ce-btn ce-swap-apply">Swap</button>
        <div class="ce-thumbs"></div>
        <button class="ce-btn ce-swap-close">Done</button>
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
    swapbar: rootEl.querySelector('.ce-swapbar'),
    swapUrl: rootEl.querySelector('.ce-swap-url'),
    swapApply: rootEl.querySelector('.ce-swap-apply'),
    swapClose: rootEl.querySelector('.ce-swap-close'),
    thumbs: rootEl.querySelector('.ce-thumbs'),
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

  // re-render a given override state from the pristine baseline (used by undo/redo)
  async function rerenderPristine() {
    await loadIframe();
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
  function clearSelection() { selectedKey = null; els.overlay.classList.remove('ce-on'); els.props.style.display = 'none'; closeSwap(); }

  function select(el) {
    selectedKey = keyForEl(el);
    syncProps(el);
    syncOverlay();
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
    if (suppressClick) { suppressClick = false; return; } // this click ended a drag
    if (editingEl) return; // a click inside an active editor stays in the editor
    const el = resolveTarget(e);
    if (!el) { commitTextEdit(); clearSelection(); return; }
    e.preventDefault(); e.stopPropagation();
    commitTextEdit();            // clicking elsewhere commits any open edit
    select(el);
    if (el.hasAttribute('data-edit-media')) openSwap(el);
    else closeSwap();
  }

  function onDblClick(e) {
    if (!editable) return;
    const el = resolveTarget(e);
    if (!el || !el.hasAttribute('data-edit-text')) return;
    e.preventDefault(); e.stopPropagation();
    select(el);
    startTextEdit(el);
  }

  // dragging (move) — SAFE nudge via margins (never re-architects the layout). For
  // already-absolutely-positioned elements (most design boxes) this moves them cleanly
  // with no effect on neighbors; for in-flow text it nudges predictably. preventDefault
  // on mousedown stops the browser's native text-selection from hijacking the drag.
  // NOTE: true free-float (lift an in-flow element clear of its siblings) needs the
  // "flatten layout to absolute" foundation — a dedicated rebuild, not this interim.
  let drag = null;
  function onDown(e) {
    if (!editable) return;
    if (editingEl) return; // let contenteditable handle its own pointer
    const el = resolveTarget(e);
    if (!el) return;
    e.preventDefault();    // suppress native selection so a drag moves instead of highlights
    select(el);
    const key = keyForEl(el);
    const basePos = (overrides[key] || {}).pos || {};
    drag = { el, key, startX: e.clientX, startY: e.clientY, baseDx: basePos.dx || 0, baseDy: basePos.dy || 0, moved: false };
  }

  function onMove(e) {
    if (!drag) return;
    const dx = (e.clientX - drag.startX) / scale;
    const dy = (e.clientY - drag.startY) / scale;
    if (Math.abs(e.clientX - drag.startX) + Math.abs(e.clientY - drag.startY) > 3) drag.moved = true;
    if (!drag.moved) return;
    drag.el.style.marginLeft = (drag.baseDx + dx) + 'px';
    drag.el.style.marginTop = (drag.baseDy + dy) + 'px';
    syncOverlay();
  }
  function onUp() {
    if (drag && drag.moved) {
      suppressClick = true;
      const dx = Math.round(parseFloat(drag.el.style.marginLeft) || 0);
      const dy = Math.round(parseFloat(drag.el.style.marginTop) || 0);
      setOverride(drag.key, { pos: Object.assign({}, (overrides[drag.key] || {}).pos, { dx, dy }) });
    }
    drag = null;
    if (resize) {
      const key = keyForEl(resize.el);
      setOverride(key, { pos: Object.assign({}, (overrides[key] || {}).pos, {
        w: Math.round(resize.el.offsetWidth), h: Math.round(resize.el.offsetHeight) }) });
      resize = null;
    }
  }

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
    if (drag) { const r = els.iframe.getBoundingClientRect(); onMove(mapToIframe(e, r)); }
    if (resize) onResizeMove(e);
  });
  window.addEventListener('mouseup', onUp);
  // also track inside iframe (where the events originate)
  function wireIframeMouse() {
    const w = iwin();
    w.addEventListener('mousemove', (e) => { if (drag) onMove(e); if (resize) onResizeMove(e); });
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
  }
  function applySwap(src) {
    if (!swapTarget || !src) return;
    const key = keyForEl(swapTarget);
    setOverride(key, { src });
    // reflect live
    const w = iwin(); w.CEApply.applyOverrides(idoc(), { [key]: { src } });
    syncOverlay();
  }
  function closeSwap() { els.swapbar.classList.remove('ce-on'); swapTarget = null; }

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
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); e.shiftKey ? redo() : undo(); }
    if ((e.ctrlKey || e.metaKey) && e.key === 'y') { e.preventDefault(); redo(); }
  });

  // ── boot ──────────────────────────────────────────────────────────────────
  (async function boot() {
    await loadIframe();
    wireIframe(); wireIframeMouse();
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
