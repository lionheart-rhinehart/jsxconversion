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

// Phase D — shared FRAME-EXACT montage math. The SAME functions drive the live preview
// (the rAF driver below) and the renderer (render-frame.mjs imports them), so a clip
// boundary cuts at the identical instant in both (F2). Pure math: browser-safe import.
import { clipFrames, montageAt, cycleDurationMs, normalizeMontage, normalizeAudio } from './montage.mjs';

const IFRAME_CSS = `
  html,body{margin:0!important;background:#0a0b0d!important;}
  body>*{display:none!important;}
  #ce-canvas{display:flex!important;position:fixed!important;inset:0!important;
    align-items:center;justify-content:center;background:#0a0b0d;overflow:hidden;}
  #ce-fit{position:relative;}
  #ce-fit>[data-edit-frame]{transform-origin:top left!important;}
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
  const audioProvider = opts.audioProvider || null;   // { list(), upload(file) } | null
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
      <span class="ce-hint">${editable ? 'Click to select · drag to move · double-click to edit text, or swap / build a montage on a photo or clip · corner to resize' : 'View only'}</span>
      <span class="ce-spacer"></span>
      <button class="ce-btn ce-edit-montage" style="display:none;" title="Swap media or build/arrange a montage on the selected slot">🎬 Edit media…</button>
    </div>
    <div class="ce-media-backdrop"></div>
    <div class="ce-media-modal">
      <div class="ce-mm-head">
        <span class="ce-mm-title">// Media</span>
        <span class="ce-mm-tabs">
          <button class="ce-btn ce-mm-tab ce-mm-tab-browse ce-on">⛓ Browse library</button>
          <button class="ce-btn ce-mm-tab ce-mm-tab-arrange">🎬 Arrange montage <span class="ce-mm-count"></span></button>
        </span>
        <span class="ce-spacer"></span>
        <button class="ce-btn ce-primary ce-swap-close">Done</button>
      </div>

      <div class="ce-kraken-grid">
        <div class="ce-kgrid-bar">
          <span class="ce-kraken" style="display:none;align-items:center;gap:6px;">
            <button class="ce-btn ce-kraken-open" title="Open the live Content Library">⛓ Library ▾</button>
            <select class="ce-select ce-kraken-ws" style="display:none;" title="Workspace"></select>
            <select class="ce-select ce-kraken-folder" style="display:none;" title="Folder"></select>
          </span>
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
          <input type="text" class="ce-swap-url" placeholder="…or paste a media URL / path">
          <button class="ce-btn ce-swap-apply">Use URL</button>
          <div class="ce-thumbs"></div>
          <span class="ce-kgrid-spacer"></span>
          <span class="ce-kgrid-sel">Click a clip to select · Ctrl-click to pick several · then use the button →</span>
          <button class="ce-btn ce-primary ce-kraken-use" disabled>Use this clip</button>
        </div>
      </div>

      <div class="ce-montage-panel">
        <div class="ce-mont-bar">
          <span class="ce-mont-title">Clips play in order — click a clip to trim</span>
          <span class="ce-mont-spacer"></span>
          <label class="ce-mont-trans">Between clips
            <select class="ce-select ce-mont-trans-type">
              <option value="cut">Cut</option>
              <option value="crossfade">Crossfade</option>
            </select>
          </label>
          <label class="ce-mont-fade" style="display:none;">Fade <input type="number" class="ce-mont-fade-dur" min="0.1" max="2" step="0.1" style="width:54px;"> s</label>
          <label class="ce-mont-dur" title="Total length of the finished video — clips loop to fill it (min = your clips played once)">Length
            <input type="range" class="ce-mont-total-range" min="1" max="90" step="0.5">
            <input type="number" class="ce-mont-total" min="1" max="90" step="0.5" style="width:54px;"> s</label>
          <button class="ce-btn ce-mont-music" title="Play all clips back-to-back — add music if you want">▸ Preview ♪</button>
          <button class="ce-btn ce-primary ce-mont-add" title="Browse the library to add more clips">＋ Add clips</button>
          <button class="ce-btn ce-mont-clear" title="Clear the montage (revert to a single clip)">Clear</button>
        </div>
        <div class="ce-mont-strip"></div>
        <div class="ce-mont-trimmer"></div>
        <div class="ce-mont-foot"><span class="ce-mont-info"></span></div>
      </div>

      <div class="ce-audio-panel">
        <div class="ce-aud-head">
          <span class="ce-aud-title">Audio</span>
          <span class="ce-aud-modes">
            <button class="ce-btn ce-aud-mode" data-m="native" title="The clip's own sound">Native</button>
            <button class="ce-btn ce-aud-mode" data-m="music" title="A music track">My audio</button>
            <button class="ce-btn ce-aud-mode" data-m="both" title="Both, mixed">Both</button>
            <button class="ce-btn ce-aud-mode" data-m="mute" title="Silent">Mute</button>
          </span>
          <span class="ce-spacer"></span>
          <button class="ce-btn ce-primary ce-aud-done">✓ Done</button>
        </div>
        <div class="ce-aud-pick">
          <select class="ce-select ce-aud-list" title="Music library"></select>
          <label class="ce-btn ce-aud-upload-btn" title="Upload a track from your computer">⤴ Upload<input type="file" class="ce-aud-upload" accept="audio/*" style="display:none;"></label>
          <input type="text" class="ce-aud-url" placeholder="…or paste an audio URL / path">
          <button class="ce-btn ce-aud-url-go">Use</button>
        </div>
        <div class="ce-aud-wavewrap">
          <canvas class="ce-aud-wave"></canvas>
          <div class="ce-aud-mark" title="Start point"></div>
          <div class="ce-aud-head-line"></div>
        </div>
        <div class="ce-aud-controls">
          <button class="ce-btn ce-aud-play" title="Play (synced with the clip)">▶ Play</button>
          <span class="ce-aud-time">start 0.0s</span>
          <span class="ce-spacer"></span>
          <label class="ce-aud-vol">Vol <input type="range" class="ce-aud-vol-range" min="0" max="1.5" step="0.05"></label>
          <span class="ce-aud-status"></span>
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
    editMontage: rootEl.querySelector('.ce-edit-montage'),
    mediaModal: rootEl.querySelector('.ce-media-modal'),
    mediaBackdrop: rootEl.querySelector('.ce-media-backdrop'),
    mmTabBrowse: rootEl.querySelector('.ce-mm-tab-browse'),
    mmTabArrange: rootEl.querySelector('.ce-mm-tab-arrange'),
    mmCount: rootEl.querySelector('.ce-mm-count'),
    swapUrl: rootEl.querySelector('.ce-swap-url'),
    swapApply: rootEl.querySelector('.ce-swap-apply'),
    swapClose: rootEl.querySelector('.ce-swap-close'),
    thumbs: rootEl.querySelector('.ce-thumbs'),
    montPanel: rootEl.querySelector('.ce-montage-panel'),
    montStrip: rootEl.querySelector('.ce-mont-strip'),
    montTrimmer: rootEl.querySelector('.ce-mont-trimmer'),
    montTotal: rootEl.querySelector('.ce-mont-total'),
    montTotalRange: rootEl.querySelector('.ce-mont-total-range'),
    montTransType: rootEl.querySelector('.ce-mont-trans-type'),
    montFade: rootEl.querySelector('.ce-mont-fade'),
    montFadeDur: rootEl.querySelector('.ce-mont-fade-dur'),
    montAdd: rootEl.querySelector('.ce-mont-add'),
    montClear: rootEl.querySelector('.ce-mont-clear'),
    montMusic: rootEl.querySelector('.ce-mont-music'),
    montInfo: rootEl.querySelector('.ce-mont-info'),
    audPanel: rootEl.querySelector('.ce-audio-panel'),
    audTitle: rootEl.querySelector('.ce-aud-title'),
    audModes: Array.from(rootEl.querySelectorAll('.ce-aud-mode')),
    audDone: rootEl.querySelector('.ce-aud-done'),
    audPick: rootEl.querySelector('.ce-aud-pick'),
    audList: rootEl.querySelector('.ce-aud-list'),
    audUpload: rootEl.querySelector('.ce-aud-upload'),
    audUrl: rootEl.querySelector('.ce-aud-url'),
    audUrlGo: rootEl.querySelector('.ce-aud-url-go'),
    audWaveWrap: rootEl.querySelector('.ce-aud-wavewrap'),
    audWave: rootEl.querySelector('.ce-aud-wave'),
    audMark: rootEl.querySelector('.ce-aud-mark'),
    audHeadLine: rootEl.querySelector('.ce-aud-head-line'),
    audPlay: rootEl.querySelector('.ce-aud-play'),
    audTime: rootEl.querySelector('.ce-aud-time'),
    audVol: rootEl.querySelector('.ce-aud-vol-range'),
    audStatus: rootEl.querySelector('.ce-aud-status'),
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
        resolve();   // tagging is async (waits for the design's JS to build) — see tagLive()
      });
      // Inject the SHARED browser modules + a marker style INTO the document. A <base href>
      // makes the design's relative asset paths (assets/vid/…) resolve against the design's
      // real folder even though we mount it via srcdoc (host-agnostic) AND lets its external
      // <script src> load + run, so the design ANIMATES LIVE.
      //   • frame-detect.js  → window.CEFrames  ("which elements are the creative frames")
      //   • runtime-retag.js → window.CEReTag   ("stamp data-edit-* ids on the LIVE DOM")
      //   • apply-overrides.js → window.CEApply ("replay the override bag" — same fn the renderer uses)
      // These are the EXACT modules the renderer injects, so the ids match by construction.
      // raf-clock.js is POINTEDLY omitted — it's the renderer's deterministic freeze clock;
      // the live editor must animate freely.
      const applySrc = window.__CE_APPLY_SRC__ || '';
      const frameDetectSrc = window.__CE_FRAME_DETECT_SRC__ || '';
      const retagSrc = window.__CE_RETAG_SRC__ || '';
      const baseTag = baseHref ? `<base href="${baseHref}">` : '';
      const tools = [frameDetectSrc, retagSrc, applySrc]
        .filter(Boolean).map((s) => `<script>${s}</script>`).join('');
      const injected = html
        .replace(/<head([^>]*)>/i, `<head$1>${baseTag}`)
        .replace(/<\/head>/i, `<style id="ce-iframe-css">${IFRAME_CSS}</style></head>`)
        .replace(/<\/body>/i, `${tools}</body>`);
      els.iframe.srcdoc = injected;
    });
  }

  // ── RUNTIME RE-TAG (zero-loss v2) ─────────────────────────────────────────
  // A real Claude Design export is JS-driven: the design's own scripts BUILD the frames
  // at runtime AFTER the iframe's load event (and REBUILD them on reload/interaction),
  // wiping any static tag. So we wait for the build to settle, then stamp data-edit-* ids
  // on the LIVE DOM with the SHARED window.CEReTag — the EXACT module the renderer injects.
  // Identical code + a deterministic document-order walk → identical ids → an override
  // keyed "fN:eM" hits the same element in the editor preview and the rendered MP4.

  // wait for the design's motor to finish building: fonts ready, then poll CEFrames.detect
  // until it finds frames (a few rAFs of headroom for rAF/DOMContentLoaded-driven builds),
  // bounded so a structurally-unrecognized design FAILS LOUDLY instead of hanging.
  function nextFrame() { return new Promise((r) => { const w = iwin(); (w ? w.requestAnimationFrame : requestAnimationFrame)(() => r()); }); }
  async function waitForBuild() {
    const w = iwin(), d = idoc();
    try { if (w && w.document.fonts) await w.document.fonts.ready; } catch (e) {}
    for (let attempt = 0; attempt < 60; attempt++) {           // ≈60 rAFs ≈ 1s ceiling
      const found = (w && w.CEFrames) ? w.CEFrames.detect(d, {}) : [];
      if (found && found.length) return found.length;
      await nextFrame();
    }
    return 0;
  }

  // tagLive() — stamp the live DOM + (re)build the frame dropdown. Returns the CEReTag
  // report. Used at boot, after undo/redo's reload, and by the rebuild watcher.
  async function tagLive() {
    const w = iwin(), d = idoc();
    if (!w || !w.CEReTag || !w.CEFrames) {
      throw new Error('[editor] CEReTag/CEFrames not injected into the iframe — host must hand __CE_RETAG_SRC__ + __CE_FRAME_DETECT_SRC__');
    }
    const n = await waitForBuild();
    if (!n) {
      // NEVER silent — same discipline as the renderer (render-live.mjs throws on 0 frames).
      throw new Error('[editor] runtime re-tag found ZERO frames — the design built no recognizable 1080×1920 frames (structure unrecognized, NOT silently skipped).');
    }
    const report = w.CEReTag.tag(d, {});   // stamps data-edit-frame / -id / -text / -media …
    indexFrames();
    return report;
  }

  // build frameIds + the dropdown from the DETECTED frames (CEReTag stamps data-edit-frame
  // on every frame it finds, whether or not it carries the legacy .cr-frame class).
  function indexFrames() {
    const d = idoc();
    const frames = Array.from(d.querySelectorAll('[data-edit-frame]'));
    frameIds = frames.map((f) => f.getAttribute('data-edit-frame'));
    const total = frames.length;
    // label each creative by its human name when the design tags figures with data-label
    // (e.g. "1A · Live Gap HUD"); otherwise fall back to a positional name.
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

    const frame = d.querySelector('[data-edit-frame="' + fid + '"]');
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
    syncMontageDrivers();
  }

  // ── montage live preview driver (Phase D3) ────────────────────────────────
  // apply-overrides.js tags the <video> with `el.__ceMontage = {clips,totalDuration,fps}`
  // (the SAME node — metadata, never a layer model). A rAF loop uses the shared
  // montageAt() to pick the on-screen clip + offset and swaps `video.src` at each cut.
  // To smooth the reload flash at cuts (F5), every distinct clip src is preloaded into a
  // hidden buffer <video> so the swap hits cache. The RENDER is seamless regardless (it's
  // a pre-built concat) — this driver only powers the editor's live preview.
  const montageDrivers = new Map();   // el → {raf, buffers, stopped, imgOv}
  // a montage can MIX photos + videos. Classify a clip src so the driver shows an image
  // clip via an <img> overlay (a <video> can't paint a still) and only video-buffers videos.
  const MONT_IMG_EXT = /\.(jpe?g|png|gif|webp|avif|bmp|tiff?)(?:[?#]|$)/i;
  function isImgClip(src) { return MONT_IMG_EXT.test(String(src || '')); }
  function stopMontageDriver(el) {
    const dr = montageDrivers.get(el); if (!dr) return;
    dr.stopped = true;
    try { iwin().cancelAnimationFrame(dr.raf); } catch (e) {}
    Object.keys(dr.buffers || {}).forEach((s) => { try { dr.buffers[s].remove(); } catch (e) {} });
    try { if (dr.imgOv) dr.imgOv.remove(); } catch (e) {}
    montageDrivers.delete(el);
  }
  function startMontageDriver(el) {
    stopMontageDriver(el);
    const mont = el.__ceMontage;
    if (!mont || !Array.isArray(mont.clips) || !mont.clips.length) return;
    const fps = mont.fps || 30, win = iwin(), d = idoc();
    const totalMs = Math.max(1, (Number(mont.totalDuration) || 1) * 1000);
    // hidden preload buffers — one per distinct VIDEO src (F5). Image clips are painted by
    // the overlay below, so they don't get a <video> buffer.
    const buffers = {};
    mont.clips.forEach((c) => {
      if (isImgClip(c.src) || buffers[c.src]) return;
      const b = d.createElement('video');
      b.src = c.src; b.muted = true; b.preload = 'auto'; b.playsInline = true;
      b.style.cssText = 'position:absolute;left:-9999px;top:0;width:2px;height:2px;opacity:0;pointer-events:none;';
      d.body.appendChild(b); buffers[c.src] = b;
    });
    // overlay <img> for image clips — positioned (position:fixed → iframe-viewport coords)
    // over el's post-transform box each frame, so it tracks any scale/transform on el.
    const imgOv = d.createElement('img');
    imgOv.style.cssText = 'position:fixed;object-fit:cover;z-index:2147483646;pointer-events:none;display:none;';
    d.body.appendChild(imgOv);
    try { el.pause(); } catch (e) {}
    el.loop = false; el.autoplay = false; el.muted = true;
    let curSrc = null, t0 = null;
    const driver = { raf: 0, buffers, stopped: false, imgOv };
    function step(now) {
      if (driver.stopped || el.__ceMontage !== mont) return;
      if (t0 == null) t0 = now;
      const tMs = (now - t0) % totalMs;
      const at = montageAt(mont.clips, fps, tMs);
      if (at.clipIndex >= 0 && at.clip) {
        const want = at.clip.src, localT = (Number(at.clip.in) || 0) + at.localOffsetMs / 1000;
        if (isImgClip(want)) {
          // image clip: cover el's box with the overlay; keep the <video> paused underneath
          if (want !== curSrc) { curSrc = want; imgOv.src = want; try { el.pause(); } catch (e) {} }
          try {
            const r = el.getBoundingClientRect();
            imgOv.style.left = r.left + 'px'; imgOv.style.top = r.top + 'px';
            imgOv.style.width = r.width + 'px'; imgOv.style.height = r.height + 'px';
            imgOv.style.display = 'block';
          } catch (e) {}
        } else {
          if (imgOv.style.display !== 'none') imgOv.style.display = 'none';
          if (want !== curSrc) {
            curSrc = want;
            el.setAttribute('src', want);
            try { el.load && el.load(); } catch (e) {}
            el.addEventListener('loadeddata', function once() {
              try { el.currentTime = localT; el.play(); } catch (e) {}
            }, { once: true });
          } else if (el.readyState >= 2 && Math.abs(el.currentTime - localT) > 0.3) {
            try { el.currentTime = localT; } catch (e) {}     // drift-correct (clip just looped)
          } else { try { if (el.paused) el.play(); } catch (e) {} }
        }
      }
      driver.raf = win.requestAnimationFrame(step);
    }
    driver.raf = win.requestAnimationFrame(step);
    montageDrivers.set(el, driver);
  }
  // start/stop drivers to match the current __ceMontage tags in the live DOM
  function syncMontageDrivers() {
    const d = idoc(); if (!d) return;
    Array.from(d.querySelectorAll('video')).forEach((v) => {
      if (v.__ceMontage && v.__ceMontage.clips && v.__ceMontage.clips.length) {
        if (!montageDrivers.has(v)) startMontageDriver(v);
      } else if (montageDrivers.has(v)) { stopMontageDriver(v); }
    });
  }
  // expose the shared math + a change-hook INTO the iframe window: apply-overrides.js
  // calls win.__ceMontageChanged(el) whenever a montage override is (re)applied — incl.
  // undo's pristine replay — so the driver always tracks the live tag. seek.js reads
  // win.CEMontage.montageAt for deterministic freezes.
  function installIframeMontageHooks() {
    const w = iwin(); if (!w) return;
    w.CEMontage = { clipFrames, montageAt, cycleDurationMs, normalizeMontage };
    w.__ceMontageChanged = (el) => { if (el.__ceMontage && el.__ceMontage.clips && el.__ceMontage.clips.length) startMontageDriver(el); else stopMontageDriver(el); };
  }

  // re-render a given override state from the pristine baseline (used by undo/redo).
  // loadIframe() swaps in a FRESH iframe document, so every per-document listener must be
  // re-bound or the editor goes dead after an undo (select/drag/dblclick + shortcuts).
  async function rerenderPristine() {
    stopRebuildWatch();          // the watcher is bound to the OLD document
    montageDrivers.clear();      // the old iframe document is gone; its drivers died with it
    await loadIframe();
    await tagLive();             // the fresh document's JS rebuilt the DOM → re-stamp ids
    wireIframe(); wireIframeMouse(); wireIframeKeys(); installIframeMontageHooks();
    showFrame(curFrame);         // relocates the frame + applyAll() replays the override bag
    startRebuildWatch();
  }

  // ── rebuild watch (#9 — "tags survive a live DOM rebuild") ────────────────
  // A JS-driven design can rebuild its own DOM at runtime (a reload, an internal re-render),
  // which wipes our data-edit-* stamps AND the #ce-canvas relocation. When that happens we
  // re-stamp (deterministic ids → same fN:eM) and re-apply the current override bag, so a
  // text edit / media swap / drag is never lost. We watch only for the CATASTROPHE — the
  // relocated frame detaching or #ce-canvas vanishing — NOT every attribute tweak, so the
  // editor's own edits (translate, contenteditable, applyOverrides) don't trigger it. A
  // suspend flag fences our own re-stamp so the observer can't loop on itself.
  let rebuildObserver = null, suspendWatch = false, rebuildPending = false;
  function rebuildHappened() {
    const d = idoc(); if (!d) return false;
    const frame = curFrame && d.querySelector('[data-edit-frame="' + curFrame + '"]');
    return !frame || !frame.isConnected || !d.getElementById('ce-canvas');
  }
  async function reTagAndReapply() {
    suspendWatch = true;
    // the design rebuilt its own DOM, so our previous relocation is gone — drop the stale
    // bookkeeping so showFrame() relocates the freshly-rebuilt frame cleanly (no ghost node).
    frameHome = null;
    montageDrivers.clear();
    try { await tagLive(); showFrame(curFrame); }   // re-stamp ids → showFrame → applyAll() replays the bag
    catch (e) { console.error('[editor] re-tag after rebuild failed (surfaced, not silent):', e.message); }
    finally { suspendWatch = false; }
  }
  function startRebuildWatch() {
    stopRebuildWatch();
    const d = idoc(); const w = iwin(); if (!d || !w || typeof w.MutationObserver !== 'function') return;
    rebuildObserver = new w.MutationObserver(() => {
      if (suspendWatch || rebuildPending) return;
      if (!rebuildHappened()) return;
      rebuildPending = true;
      // coalesce a burst of mutations into one re-stamp on the next tick
      setTimeout(() => { rebuildPending = false; if (rebuildHappened()) reTagAndReapply(); }, 0);
    });
    rebuildObserver.observe(d.documentElement, { childList: true, subtree: true });
  }
  function stopRebuildWatch() { if (rebuildObserver) { try { rebuildObserver.disconnect(); } catch (e) {} rebuildObserver = null; } }

  // ── selection + overlay ───────────────────────────────────────────────────
  function elForKey(key) {
    const w = iwin();
    return w && w.CEApply ? w.CEApply._targetEl(idoc(), key) : null;
  }
  function keyForEl(el) {
    const frame = el.closest('[data-edit-frame]');
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
    closeMediaModal();
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
    // a single MEDIA slot selected → offer the "Edit media…" entry (swap / build montage)
    const soloEl = (n === 1 && selectedKey) ? elForKey(selectedKey) : null;
    const isMedia = !!(soloEl && soloEl.hasAttribute('data-edit-media') && !soloEl.hasAttribute('data-edit-brandkit'));
    els.editMontage.style.display = (editable && isMedia) ? 'inline-flex' : 'none';
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
      if (m) { e.preventDefault(); e.stopPropagation(); commitTextEdit(); select(m); openMediaModal(m); return; }
    }
    const el = resolveTarget(e);
    if (!el) { commitTextEdit(); clearSelection(); return; }
    e.preventDefault(); e.stopPropagation();
    commitTextEdit();            // clicking elsewhere commits any open edit
    if (e.shiftKey) { toggleInSelection(keyForEl(el)); }  // multi-select
    else { select(el); }         // single click only selects (so you can drag to move)
  }

  // Double-click = change content: text → edit it; media → open the media modal (Browse,
  // or Arrange if the slot already carries a montage). Consistent + drag-proof.
  function onDblClick(e) {
    if (!editable) return;
    const el = resolveTarget(e);
    if (!el) return;
    e.preventDefault(); e.stopPropagation();
    select(el);
    if (el.hasAttribute('data-edit-text')) startTextEdit(el);
    else if (el.hasAttribute('data-edit-media')) openMediaModal(el);
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
    const frame = idoc().querySelector('[data-edit-frame="' + curFrame + '"]');
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
    const frame = idoc().querySelector('[data-edit-frame="' + curFrame + '"]');
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

  // ── media modal (Browse ⟷ Arrange) ────────────────────────────────────────
  // ONE roomy centered overlay replaces the old cramped footer strip. It holds two
  // sections — the Kraken Browse grid and the montage Arrange filmstrip — toggled by the
  // header tabs. Double-clicking a media slot opens it (Arrange if the slot already has a
  // montage, else Browse). The interaction model: pick clips in Browse (Ctrl-click for
  // several) → 1 clip swaps, 2+ build a montage → Arrange opens to reorder/trim.
  let swapTarget = null;
  function hasMontage(el) {
    if (!el) return false;
    const m = (overrides[keyForEl(el)] || {}).montage;
    return !!(m && Array.isArray(m.clips) && m.clips.length);
  }
  function populateThumbs() {
    els.thumbs.innerHTML = '';
    mediaLibrary.forEach((m) => {
      const t = m.type === 'video' ? document.createElement('video') : document.createElement('img');
      t.src = m.src; if (m.type === 'video') { t.muted = true; }
      t.title = m.label || m.src;
      t.addEventListener('click', () => applySwap(m.src));
      els.thumbs.appendChild(t);
    });
  }
  function openMediaModal(el, section) {
    el = el || swapTarget;
    if (!el || !el.hasAttribute('data-edit-media') || el.hasAttribute('data-edit-brandkit')) return;
    swapTarget = el;
    els.mediaModal.classList.add('ce-on');
    els.mediaBackdrop.classList.add('ce-on');
    populateThumbs();
    els.kraken.style.display = 'none';
    // NOTE: don't probe Kraken here — showSection() probes only in Browse. Probing while
    // opening straight to Arrange would autoOpenPin() the Kraken grid behind the trim view
    // and break the layout (the grid steals panel height).
    showSection(section || (hasMontage(el) ? 'arrange' : 'browse'), el);
  }
  // toggle Browse ⟷ Arrange. Reuses the inner panels' existing `.ce-on` (now in-flow
  // inside the modal). Arrange seeds/shows the filmstrip via openMontage.
  function showSection(section, el) {
    const arrange = section === 'arrange';
    els.montPanel.classList.toggle('ce-on', arrange);
    els.krakenGrid.classList.toggle('ce-on', !arrange);
    els.mmTabArrange.classList.toggle('ce-on', arrange);
    els.mmTabBrowse.classList.toggle('ce-on', !arrange);
    if (arrange) openMontage(el || swapTarget || montageTarget);
    else if (remoteBrowse) ensureKrakenProbe();
    updateMmCount();
  }
  function updateMmCount() {
    const m = montageState || ((swapTarget && (overrides[keyForEl(swapTarget)] || {}).montage));
    const n = m && m.clips ? m.clips.length : 0;
    els.mmCount.textContent = n ? `(${n})` : '';
  }
  // a plain SWAP: replace the slot's media with one clip. Driver-clobber fix — a montage
  // running on this node would rewrite video.src every rAF frame, so stop it + drop the
  // montage override first, or the swap silently reverts.
  function applySwap(src) {
    if (!src) return;
    const target = swapTarget || montageTarget;
    // in "add" mode (the montage ＋ Add flow), any pick APPENDS a clip instead of replacing.
    if (montageAddMode) {
      ensureMontageStarted(target);
      montageState.clips.push({ src, in: 0, out: 3 });
      commitMontage(); montageAddMode = false; showSection('arrange', target);
      return;
    }
    if (!target) return;
    const key = keyForEl(target);
    stopMontageDriver(target); target.__ceMontage = null;        // driver-clobber fix
    pushHistory();
    const next = Object.assign({}, overrides[key], { src });
    delete next.montage;                                          // a plain swap replaces any montage
    overrides[key] = next;
    commit();
    const w = iwin(); if (w && w.CEApply) w.CEApply.applyOverrides(idoc(), { [key]: { src } });
    syncOverlay();
  }
  function closeMediaModal() {
    stopTrimPlay();
    montMode = false;
    if (els.audPanel) els.audPanel.classList.remove('ce-on');
    audioPlaying = false; try { cancelAnimationFrame(audioRaf); } catch (e) {} if (audioEl) { try { audioEl.pause(); } catch (e) {} }
    els.mediaModal.classList.remove('ce-on');
    els.mediaBackdrop.classList.remove('ce-on');
    els.krakenGrid.classList.remove('ce-on'); els.montPanel.classList.remove('ce-on');
    if (els.kgridTiles) els.kgridTiles.innerHTML = '';
    els.krakenWs.style.display = 'none'; els.krakenFolder.style.display = 'none';
    if (playingMedia) { try { playingMedia.pause(); } catch (e) {} playingMedia = null; }
    selectedRows = [];
    if (els.krakenUse) els.krakenUse.disabled = true;
    swapTarget = null;
    montageAddMode = false; montageTarget = null; montageKey = null; montageState = null;
  }

  // ── montage filmstrip (Phase D1) ──────────────────────────────────────────
  // Builds the portable `montage:{clips:[{src,in,out}], totalDuration}` override on ONE
  // media slot. The working copy lives in `montageState`; every edit commits it through
  // the normal override path (so undo works) AND re-applies it to the iframe (so
  // apply-overrides.js re-tags the <video> and the rAF driver restarts).
  let montageTarget = null, montageKey = null, montageAddMode = false, montageState = null;
  let montageUserTotal = false;   // has the user typed an explicit total? (else auto = cycle)
  let activeClip = -1;            // which clip's trim panel is open (index into clips), -1 = none
  function ensureTransition() {   // every working montage carries a transition (default cut)
    if (montageState && !montageState.transition) montageState.transition = { type: 'cut', duration: 0.4 };
  }
  // trim-panel playback (the active clip's preview). Lives at module scope so a trimmer
  // rebuild / clip switch / modal close can stop any in-flight loop.
  let trimPlay = null;            // { video, raf } | null
  let montMode = false;          // trim window open in montage-wide music scope (♪ Music)
  function stopTrimPlay() {
    if (!trimPlay) return;
    try { cancelAnimationFrame(trimPlay.raf); } catch (e) {}
    try { trimPlay.video.pause(); } catch (e) {}
    // ▸ Preview stacks <video>s in a stage div (trimPlay.video is the div, not a media element),
    // so pause them explicitly too.
    if (els.montTrimmer) els.montTrimmer.querySelectorAll('.ce-tr-vid').forEach((v) => { try { v.pause(); } catch (e) {} });
    trimPlay = null;
    audioStop();                 // the single Play drives the <audio> too — stop it together
  }
  function currentMediaSrc(el) {
    const ov = overrides[keyForEl(el)] || {};
    return ov.src || el.getAttribute('src') || (el.currentSrc || '');
  }
  // initialize the working montage for `el` WITHOUT seeding a clip (used when building from
  // a multi-selection — the montage = exactly the clips the user picks).
  function ensureMontageStarted(el) {
    if (!el) return;
    const key = keyForEl(el);
    if (montageState && montageKey === key) return;   // already building this slot
    montageTarget = el; montageKey = key;
    const existing = (overrides[key] || {}).montage;
    montageUserTotal = pinnedFromExisting(existing);
    montageState = (existing && Array.isArray(existing.clips) && existing.clips.length)
      ? clone(existing) : { clips: [], totalDuration: 3 };
    ensureTransition();
  }
  // The total is "user-pinned" ONLY when the saved total clearly EXCEEDS the clip cycle (the user
  // deliberately extended it to loop-to-fill). Just having clips must NOT pin it — that was the bug
  // that disabled auto-extend and truncated added clips to "only clip 1".
  function pinnedFromExisting(existing) {
    if (!existing || !Array.isArray(existing.clips) || !existing.clips.length) return false;
    const cycleSec = cycleDurationMs(existing.clips, 30) / 1000;
    return Number(existing.totalDuration) > cycleSec + 0.05;
  }
  // open the Arrange filmstrip for `el`. If the slot has no montage yet, seed it with the
  // slot's current media as clip 1 (a sensible starting point for hand-building).
  function openMontage(el) {
    el = el || swapTarget || montageTarget;
    if (!el || !el.hasAttribute('data-edit-media')) return;
    const key = keyForEl(el);
    const sameSlot = montageState && montageKey === key;
    if (!sameSlot) {
      montageTarget = el; montageKey = key;
      const existing = (overrides[key] || {}).montage;
      montageUserTotal = pinnedFromExisting(existing);
      montageState = (existing && Array.isArray(existing.clips) && existing.clips.length)
        ? clone(existing)
        : { clips: (currentMediaSrc(el) ? [{ src: currentMediaSrc(el), in: 0, out: 3 }] : []), totalDuration: 3 };
    }
    ensureTransition();
    // Entering Arrange shows the strip with NO trimmer open (so reorder/delete are fully
    // usable); the trimmer opens only when the user clicks a clip card. Keep an existing
    // selection if we're re-opening the same slot; otherwise start closed.
    if (!sameSlot) activeClip = -1;
    else if (activeClip >= montageState.clips.length) activeClip = -1;
    els.montTotal.value = montageState.totalDuration;
    refreshArrange();
  }
  // re-render the whole Arrange view (strip + trimmer + transition controls + info)
  function refreshArrange() {
    renderFilmstrip(montageState);
    renderTrimmer();
    syncTransUI();
  }
  // the natural length of ONE pass through all clips (the floor for totalDuration)
  function montCycleSec() { return (montageState && montageState.clips.length) ? cycleDurationMs(montageState.clips, 30) / 1000 : 1; }
  // reflect totalDuration onto every total control (bar slider+number, and the in-preview slider);
  // the slider min = the cycle, so the user can extend (loop-to-fill) but never shrink below clips.
  function syncTotalUI() {
    if (!montageState) return;
    const total = Math.round((Number(montageState.totalDuration) || 1) * 10) / 10;
    const cyc = Math.max(1, Math.round(montCycleSec() * 10) / 10);
    if (els.montTotal) els.montTotal.value = total;
    if (els.montTotalRange) { els.montTotalRange.min = cyc; els.montTotalRange.value = total; }
    const pr = els.montTrimmer && els.montTrimmer.querySelector('.ce-tr-total-range');
    const pn = els.montTrimmer && els.montTrimmer.querySelector('.ce-tr-total-read');
    if (pr) { pr.min = cyc; pr.value = total; }
    if (pn) pn.textContent = total + 's';
  }
  // commit the working montage → bag + live DOM (so the driver picks it up)
  function commitMontage() {
    if (!montageKey || !montageState) return;
    const trans = montageState.transition;     // preserve the working transition across normalize
    // Total length rules (so all clips ALWAYS play — the "only clip 1" bug was total < cycle):
    //  • unpinned → track the natural cycle (every clip plays once);
    //  • FLOOR at the cycle even when pinned — a montage can never be shorter than its clips
    //    (trim a clip to shorten it); the user can only extend it (loop-to-fill) up to 90s.
    if (montageState.clips.length) {
      const cycleSec = Math.max(1, cycleDurationMs(montageState.clips, 30) / 1000);
      if (!montageUserTotal) montageState.totalDuration = cycleSec;
      montageState.totalDuration = Math.min(90, Math.max(cycleSec, Number(montageState.totalDuration) || cycleSec));
      syncTotalUI();
    }
    const norm = normalizeMontage(Object.assign({}, montageState, { transition: trans }), 30);
    montageState = clone(norm);
    setOverride(montageKey, { montage: norm });
    const w = iwin(); if (w && w.CEApply) w.CEApply.applyOverrides(idoc(), { [montageKey]: overrides[montageKey] });
    refreshArrange();
    updateMmCount();
  }
  function addMontageClip(src) {
    if (!montageState) return;
    montageState.clips.push({ src, in: 0, out: 3 });
    commitMontage();
  }
  function deleteClip(i) { if (!montageState) return; montageState.clips.splice(i, 1); if (activeClip >= montageState.clips.length) activeClip = montageState.clips.length - 1; commitMontage(); }
  function moveClip(i, dir) {
    if (!montageState) return;
    const j = i + dir; if (j < 0 || j >= montageState.clips.length) return;
    const a = montageState.clips; const t = a[i]; a[i] = a[j]; a[j] = t; commitMontage();
  }
  function updateClip(i, patch) {
    if (!montageState || !montageState.clips[i]) return;
    Object.assign(montageState.clips[i], patch);
    const c = montageState.clips[i];
    if (!(c.out > c.in)) c.out = c.in + 0.1;      // keep a positive trim window
    commitMontage();
  }
  function clearMontage() {
    if (!montageKey) return;
    const cur = clone(overrides[montageKey] || {});
    const firstSrc = montageState && montageState.clips[0] ? montageState.clips[0].src : null;
    delete cur.montage;
    if (firstSrc) cur.src = firstSrc;
    pushHistory();
    if (Object.keys(cur).length) overrides[montageKey] = cur; else delete overrides[montageKey];
    commit();
    const tgt = montageTarget;
    if (tgt) {
      stopMontageDriver(tgt); tgt.__ceMontage = null;
      const w = iwin(); if (w && w.CEApply) w.CEApply.applyOverrides(idoc(), { [montageKey]: cur });
    }
    // back to Browse so the user can pick a fresh clip/montage for this slot
    montageState = null; montageKey = null; montageUserTotal = false;
    swapTarget = tgt; showSection('browse', tgt);
  }
  // Filmstrip = big, clickable cards (no more number steppers). Clicking a card opens its
  // visual trim panel below. Order badge + reorder ◀▶ + delete ✕ stay on the card.
  function renderFilmstrip(m) {
    els.montStrip.innerHTML = '';
    if (!m.clips.length) {
      els.montStrip.innerHTML = '<span class="ce-mont-empty">No clips yet — click “＋ Add clips” to browse the library.</span>';
    }
    m.clips.forEach((c, i) => {
      const item = document.createElement('div');
      item.className = 'ce-mont-clip' + (i === activeClip ? ' ce-active' : '');
      const len = Math.max(0, (Number(c.out) || 0) - (Number(c.in) || 0)).toFixed(1);
      item.innerHTML =
        `<div class="ce-mc-head"><span class="ce-mc-n">${i + 1}</span>
          <button class="ce-btn ce-mc-up"${i === 0 ? ' disabled' : ''} title="Move earlier">◀</button>
          <button class="ce-btn ce-mc-dn"${i === m.clips.length - 1 ? ' disabled' : ''} title="Move later">▶</button>
          <button class="ce-btn ce-mc-del" title="Remove clip">✕</button></div>
        ${isImgClip(c.src) ? '<img class="ce-mc-thumb">' : '<video class="ce-mc-thumb" muted playsinline preload="metadata"></video>'}
        <div class="ce-mc-read">in ${(+c.in).toFixed(1)} – out ${(+c.out).toFixed(1)} · ${len}s</div>`;
      item.querySelector('.ce-mc-thumb').src = c.src;
      // click the card (not its buttons) → make it the active clip + open the trim panel
      item.addEventListener('click', (e) => { if (e.target.closest('.ce-btn')) return; activeClip = i; renderFilmstrip(montageState); renderTrimmer(); });
      item.querySelector('.ce-mc-up').addEventListener('click', (e) => { e.stopPropagation(); moveClip(i, -1); });
      item.querySelector('.ce-mc-dn').addEventListener('click', (e) => { e.stopPropagation(); moveClip(i, 1); });
      item.querySelector('.ce-mc-del').addEventListener('click', (e) => { e.stopPropagation(); deleteClip(i); });
      els.montStrip.appendChild(item);
    });
    const fr = clipFrames(m.clips, 30);
    const tr = m.transition && m.transition.type === 'crossfade' ? ` · crossfade ${m.transition.duration}s (applies in export)` : '';
    els.montInfo.textContent = m.clips.length
      ? `${m.clips.length} clip(s) · cycle ${(cycleDurationMs(m.clips, 30) / 1000).toFixed(1)}s · loops to fill ${m.totalDuration}s${tr}`
      : '';
  }

  // ── visual trim panel (the active clip) ───────────────────────────────────
  // A bar spanning [0 … source duration] with draggable in/out handles + a draggable
  // middle (slide the window). Dragging scrubs the preview video to that edge; release
  // commits in/out via updateClip → commitMontage (one undo step per drag).
  function renderTrimmer() {
    const host = els.montTrimmer; if (!host) return;
    stopTrimPlay();                 // kill any playback from the previous render before rebuilding
    // detach the persistent audio panel before we blow away the trim host (it's re-homed INTO
    // .ce-tr-controls each render so the trimmer + audio live in ONE window; moving the node
    // keeps every els.aud* ref + listener intact). Park it on montPanel while we rebuild.
    if (els.audPanel && host.contains(els.audPanel)) els.montPanel.appendChild(els.audPanel);
    host.innerHTML = '';
    if (!montageState || (!montMode && (activeClip < 0 || !montageState.clips[activeClip]))) {
      host.classList.remove('ce-on');
      els.montPanel.classList.remove('ce-trimming');   // show the strip again
      els.audPanel.classList.remove('ce-on');
      return;
    }
    host.classList.add('ce-on');
    els.montPanel.classList.add('ce-trimming');         // focused trim view (strip hidden)
    const clip = montMode ? null : montageState.clips[activeClip];
    const headTxt = montMode
      ? 'Preview — all clips play back-to-back; set the total length and add music (optional) below'
      : `Clip ${activeClip + 1} — drag the ends to trim · drag the middle to slide · click the bar to scrub`;
    host.innerHTML =
      `<div class="ce-tr-head"><span class="ce-tr-hint">${headTxt}</span></div>
       ${montMode ? '<div class="ce-tr-stage"></div>' : (isImgClip(clip.src) ? '<img class="ce-tr-video">' : '<video class="ce-tr-video" muted playsinline preload="auto"></video>')}
       <div class="ce-tr-controls">
         <div class="ce-tr-transport">
           <button class="ce-btn ce-tr-play" title="Play">▶ Play</button>
           ${montMode ? '' : '<label class="ce-tr-fullmode"><input type="checkbox"> Play full clip</label>'}
           <span class="ce-tr-time">0.0s</span>
           ${montMode ? '<label class="ce-tr-total" title="Total length — clips loop to fill it (up to 90s)">Length <input type="range" class="ce-tr-total-range" min="1" max="90" step="0.5"><span class="ce-tr-total-read">0s</span></label>' : ''}
           <span class="ce-spacer"></span>
         </div>
         ${montMode ? '' : '<div class="ce-tr-bar"><div class="ce-tr-fill"><span class="ce-tr-h ce-tr-in" title="Start"></span><span class="ce-tr-h ce-tr-out" title="End"></span></div><div class="ce-tr-playhead"></div></div>'}
         <div class="ce-tr-foot"><span class="ce-tr-read">${montMode ? 'whole video' : 'loading…'}</span><button class="ce-btn ce-primary ce-tr-done" title="Close — your changes are already saved">✓ Done</button></div>
       </div>`;
    // re-home the audio panel INTO the trim controls (inline, under the bar) + open it
    const controls = host.querySelector('.ce-tr-controls');
    if (els.audPanel && controls) { controls.appendChild(els.audPanel); openAudioPanel(montMode ? 'montage' : 'clip'); }
    const video = host.querySelector('.ce-tr-video');
    const bar = host.querySelector('.ce-tr-bar');
    const fill = host.querySelector('.ce-tr-fill');
    const read = host.querySelector('.ce-tr-read');
    const playBtn = host.querySelector('.ce-tr-play');
    const fullChk = host.querySelector('.ce-tr-fullmode input');
    const timeEl = host.querySelector('.ce-tr-time');
    const playhead = host.querySelector('.ce-tr-playhead');
    let dur = 0;
    // the single Play drives the <audio> too; video mute follows the chosen mode
    const wantNative = () => { const m = (audioWork || {}).mode; return m === 'native' || m === 'both'; };
    const setVideoMute = () => { video.muted = !wantNative(); };
    const setHeadLine = () => { if (audioEl && waveDur && els.audHeadLine) els.audHeadLine.style.left = Math.max(0, Math.min(100, (audioEl.currentTime / waveDur) * 100)) + '%'; };
    function resetPlayBtn() { if (playBtn) playBtn.textContent = '▶ Play'; }
    function pausePlay() { stopTrimPlay(); resetPlayBtn(); }
    const isPlaying = () => !!(trimPlay && trimPlay.video === video && !video.paused);

    if (montMode) {
      // ── ▸ Preview: play the WHOLE montage smoothly. One <video> per distinct clip src is stacked
      // in the stage and ALL play continuously (muted), each looping its own [in,out] segment — so
      // every clip always has a live frame. Switching clips is then a pure OPACITY flip with nothing
      // to "wake up": no reload, no seek-on-show, no blank-frame flash. The <audio> rides Play. ──
      const stage = host.querySelector('.ce-tr-stage');
      const clips = (montageState && montageState.clips) || [], fps = 30;
      const totalMsNow = () => Math.max(1, (Number(montageState && montageState.totalDuration) || 1) * 1000);
      // one <video> per DISTINCT src, with its trimmed segment (first clip that uses it)
      const segs = new Map();
      clips.forEach((c) => {
        if (segs.has(c.src)) return;
        let v, seg;
        if (isImgClip(c.src)) {            // still image clip — a stacked <img>, no playback/seek
          v = document.createElement('img');
          v.className = 'ce-tr-vid'; v.src = c.src;
          seg = { el: v, in: 0, out: Number(c.out) || 1, img: true };
        } else {
          v = document.createElement('video');
          v.className = 'ce-tr-vid'; v.muted = true; v.playsInline = true; v.preload = 'auto'; v.loop = false; v.src = c.src;
          seg = { el: v, in: Math.max(0, Number(c.in) || 0), out: Number(c.out) || (Number(c.in) || 0) + 1 };
          v.addEventListener('loadedmetadata', () => { try { v.currentTime = seg.in; } catch (e) {} }, { once: true });
          try { v.load(); } catch (e) {}
        }
        stage.appendChild(v); segs.set(c.src, seg);
      });
      let shown = null, t0 = null, lastTMs = 0;
      const montIsPlaying = () => !!(trimPlay && trimPlay.video === stage && shown && !shown.paused);
      function warmAndLoop() {            // keep every clip playing inside its own [in,out] segment
        segs.forEach((seg) => {
          if (seg.img) return;            // a still image has nothing to warm/loop
          const v = seg.el;
          if (v.readyState >= 2 && (v.currentTime >= seg.out - 0.02 || v.currentTime < seg.in - 0.05)) {
            try { v.currentTime = seg.in; } catch (e) {}
          }
          if (v.paused) { try { v.play(); } catch (e) {} }
        });
      }
      function show(src) {                // opacity-flip to the (already-playing) clip — instant, no seek
        const seg = segs.get(src); if (!seg) return; const v = seg.el;
        if (shown && shown !== v) { shown.classList.remove('ce-on'); shown.muted = true; }
        if (shown !== v) { v.classList.add('ce-on'); shown = v; }
        v.muted = !wantNative();
      }
      function montStep(now) {
        if (!trimPlay || trimPlay.video !== stage || !stage.isConnected) { stopTrimPlay(); resetPlayBtn(); return; }
        if (t0 == null) t0 = now;
        const totalMs = totalMsNow();
        const tMs = (now - t0) % totalMs;
        if (tMs < lastTMs) audioRewind();   // wrapped past the total → loop the music back to its start
        lastTMs = tMs;
        warmAndLoop();
        const at = montageAt(clips, fps, tMs);
        if (at && at.clip) show(at.clip.src);
        if (timeEl) timeEl.textContent = (tMs / 1000).toFixed(1) + 's';
        setHeadLine();
        trimPlay.raf = requestAnimationFrame(montStep);
      }
      function startPlay() {
        stopTrimPlay();
        t0 = null; lastTMs = 0; shown = null;
        trimPlay = { video: stage, raf: requestAnimationFrame(montStep) };
        warmAndLoop();
        audioStart();
        playBtn.textContent = '⏸ Pause';
      }
      playBtn.addEventListener('click', () => { montIsPlaying() ? pausePlay() : startPlay(); });
      // in-preview length slider (bound to the same total; commitMontage floors at the cycle)
      const trRange = host.querySelector('.ce-tr-total-range');
      const trRead = host.querySelector('.ce-tr-total-read');
      if (trRange) {
        trRange.addEventListener('input', () => { if (trRead) trRead.textContent = trRange.value + 's'; });
        trRange.addEventListener('change', () => setTotal(trRange.value));
      }
      syncTotalUI();   // seed the slider/readout from the current total
      host.querySelector('.ce-tr-done').addEventListener('click', () => { stopTrimPlay(); montMode = false; activeClip = -1; refreshArrange(); });
      return;
    }

    // ── still IMAGE clip: no source timeline to scrub. Show the image; the only editable
    //    dimension is how long it displays (out − in, with in pinned at 0). The right handle
    //    sets that length against a synthetic timeline. ──────────────────────────────────
    if (clip && isImgClip(clip.src)) {
      video.src = clip.src;
      if (playBtn) { playBtn.disabled = true; playBtn.style.display = 'none'; }
      const inH = host.querySelector('.ce-tr-in'); if (inH) inH.style.display = 'none';
      if (playhead) playhead.style.display = 'none';
      clip.in = 0;
      const synthDur = () => Math.max(10, (clip.out || 1) + 5);   // room to drag the length out
      const layoutImg = () => {
        const d = synthDur();
        const R = Math.max(0, Math.min(100, (clip.out / d) * 100));
        fill.style.left = '0%'; fill.style.width = R + '%';
        read.textContent = `still image · shows for ${(clip.out - clip.in).toFixed(1)}s — drag the right edge to change its length`;
      };
      layoutImg();
      const startOutDrag = (e) => {
        e.preventDefault(); e.stopPropagation();
        const rect = bar.getBoundingClientRect(); const startX = e.clientX, outRec = clip.out, d = synthDur();
        const move = (ev) => { const dx = ((ev.clientX - startX) / rect.width) * d; clip.out = Math.max(0.2, Math.min(d, outRec + dx)); layoutImg(); };
        const up = () => { document.removeEventListener('mousemove', move, true); document.removeEventListener('mouseup', up, true); updateClip(activeClip, { in: 0, out: Math.round(clip.out * 10) / 10 }); };
        document.addEventListener('mousemove', move, true); document.addEventListener('mouseup', up, true);
      };
      const outH = host.querySelector('.ce-tr-out'); if (outH) outH.addEventListener('mousedown', startOutDrag);
      host.querySelector('.ce-tr-done').addEventListener('click', () => { stopTrimPlay(); activeClip = -1; refreshArrange(); });
      return;
    }

    // ── per-clip trim + audio (the default) ──────────────────────────────────────
    const setPlayhead = (t) => { if (playhead && dur) playhead.style.left = Math.max(0, Math.min(100, (t / dur) * 100)) + '%'; };
    const layout = () => {
      if (!dur) return;
      const L = Math.max(0, Math.min(100, (clip.in / dur) * 100));
      const R = Math.max(0, Math.min(100, (clip.out / dur) * 100));
      fill.style.left = L + '%'; fill.style.width = Math.max(0, R - L) + '%';
      read.textContent = `in ${clip.in.toFixed(1)}s · out ${clip.out.toFixed(1)}s · length ${(clip.out - clip.in).toFixed(1)}s · source ${dur.toFixed(1)}s`;
    };
    const onMeta = () => {
      dur = video.duration || 0;
      if (dur && clip.out > dur) clip.out = dur;
      layout();
      try { video.currentTime = clip.in; } catch (e) {}
      setPlayhead(clip.in);
    };
    // attach BEFORE setting src (a cached/fast metadata load would otherwise fire before
    // the listener exists, leaving the bar stuck on "loading…"); also cover already-loaded.
    video.addEventListener('loadedmetadata', onMeta, { once: true });
    video.src = clip.src;
    if (video.readyState >= 1 && video.duration) onMeta();
    const scrub = (t) => { try { video.currentTime = Math.max(0, Math.min(dur || t, t)); } catch (e) {} setPlayhead(video.currentTime); };

    // ── playback (rAF loop; modeled on the montage driver) ─────────────────────
    // Selection mode loops [clip.in, clip.out]; "Play full clip" loops [0, dur].
    const rangeStart = () => (fullChk.checked ? 0 : clip.in);
    const rangeEnd = () => (fullChk.checked ? (dur || clip.out) : clip.out);
    function tick() {
      if (!trimPlay || trimPlay.video !== video || !video.isConnected) { stopTrimPlay(); resetPlayBtn(); return; }
      const t = video.currentTime;
      if (t >= rangeEnd() - 0.02 || t < rangeStart() - 0.05) { try { video.currentTime = rangeStart(); } catch (e) {} audioRewind(); }
      setPlayhead(video.currentTime);
      if (timeEl) timeEl.textContent = video.currentTime.toFixed(1) + 's';
      setHeadLine();
      trimPlay.raf = requestAnimationFrame(tick);
    }
    function startPlay() {
      if (!dur) return;
      stopTrimPlay();
      setVideoMute();
      try { if (video.currentTime < rangeStart() || video.currentTime >= rangeEnd() - 0.02) video.currentTime = rangeStart(); } catch (e) {}
      const p = video.play(); if (p && p.catch) p.catch(() => {});
      trimPlay = { video, raf: requestAnimationFrame(tick) };
      audioStart();                // start the picked track from its start point, synced
      playBtn.textContent = '⏸ Pause';
    }
    playBtn.addEventListener('click', () => { isPlaying() ? pausePlay() : startPlay(); });
    fullChk.addEventListener('change', () => { if (isPlaying()) startPlay(); });   // restart in the new mode

    // ── click the bar to scrub (unless the click ended a drag or hit a handle) ──
    let justDragged = false;
    bar.addEventListener('click', (e) => {
      if (justDragged) { justDragged = false; return; }
      if (e.target.classList.contains('ce-tr-h')) return;
      if (!dur) return;
      const rect = bar.getBoundingClientRect();
      pausePlay();
      scrub(((e.clientX - rect.left) / rect.width) * dur);
    });

    function startDrag(mode, e) {
      if (!dur) return;
      e.preventDefault(); e.stopPropagation();
      pausePlay();                 // trimming pauses playback
      const rect = bar.getBoundingClientRect();
      const startX = e.clientX, inRec = clip.in, outRec = clip.out, len = outRec - inRec;
      let moved = false;
      const move = (ev) => {
        if (Math.abs(ev.clientX - startX) > 2) moved = true;
        const dx = ((ev.clientX - startX) / rect.width) * dur;
        if (mode === 'in') { clip.in = Math.min(Math.max(0, inRec + dx), clip.out - 0.1); scrub(clip.in); }
        else if (mode === 'out') { clip.out = Math.max(Math.min(dur, outRec + dx), clip.in + 0.1); scrub(clip.out); }
        else { let ni = Math.min(Math.max(0, inRec + dx), dur - len); clip.in = ni; clip.out = ni + len; scrub(clip.in); }
        layout();
      };
      const up = () => {
        document.removeEventListener('mousemove', move, true);
        document.removeEventListener('mouseup', up, true);
        if (moved) justDragged = true;   // suppress the click-to-scrub that follows a drag
        updateClip(activeClip, { in: Math.round(clip.in * 10) / 10, out: Math.round(clip.out * 10) / 10 });
      };
      document.addEventListener('mousemove', move, true);
      document.addEventListener('mouseup', up, true);
    }
    host.querySelector('.ce-tr-in').addEventListener('mousedown', (e) => startDrag('in', e));
    host.querySelector('.ce-tr-out').addEventListener('mousedown', (e) => startDrag('out', e));
    fill.addEventListener('mousedown', (e) => { if (e.target.classList.contains('ce-tr-h')) return; startDrag('move', e); });
    // ✓ Done — trim + audio already auto-saved; this just closes the trimmer and returns to
    // the full strip (activeClip < 0 makes renderTrimmer hide the panel).
    host.querySelector('.ce-tr-done').addEventListener('click', () => { stopTrimPlay(); activeClip = -1; refreshArrange(); });
  }

  // reflect the working transition onto the bar controls (and show the fade field for crossfade)
  function syncTransUI() {
    const t = (montageState && montageState.transition) || { type: 'cut', duration: 0.4 };
    els.montTransType.value = t.type;
    els.montFade.style.display = (t.type === 'crossfade') ? 'inline-flex' : 'none';
    els.montFadeDur.value = t.duration;
  }

  // ── audio picker (per-clip + montage-wide) ──────────────────────────────────
  // One panel, two scopes: 'clip' writes montageState.clips[activeClip].audio (via updateClip);
  // 'montage' writes montageState.audio. mode = native | music | both | mute. Waveform (Web
  // Audio decode) lets you drag the start point; preview plays the clip video + the picked
  // track synced. Bag is portable; only the renderer mixes it (montage.mjs buildMontageAudio).
  let audioScope = null, audioWork = null, audioEl = null, audioRaf = 0, audioPlaying = false;
  let waveDur = 0, wavePeaks = null, audioListCache = null;
  const defaultAudio = () => ({ mode: 'native', volume: 0.85, startAt: 0 });
  function curAudioTarget() { return audioScope === 'clip' ? (montageState && montageState.clips[activeClip]) : montageState; }
  function openAudioPanel(scope) {
    if (!montageState) return;
    if (scope === 'clip' && (activeClip < 0 || !montageState.clips[activeClip])) return;
    audioScope = scope; audioStop();
    audioWork = clone((scope === 'clip' ? montageState.clips[activeClip].audio : montageState.audio) || defaultAudio());
    els.audTitle.textContent = scope === 'clip' ? 'Audio for this clip' : 'Music for the whole video';
    els.audPanel.classList.add('ce-on');
    els.audStatus.textContent = '';
    loadAudioList();
    renderAudioPanel();
  }
  function closeAudioPanel() {
    audioStop();
    els.audPanel.classList.remove('ce-on');
    audioScope = null; audioWork = null; wavePeaks = null; waveDur = 0;
  }
  // re-sync the live A/V when the audio choice changes mid-playback (mode/track/volume):
  // flip the preview video's mute and (re)start or stop the <audio> to match the new mode.
  function reSyncIfPlaying() {
    if (!trimPlay) return;
    const v = els.montTrimmer.querySelector('.ce-tr-video');
    const m = (audioWork || {}).mode;
    if (v) v.muted = !(m === 'native' || m === 'both');
    audioStart();
  }
  async function loadAudioList() {
    if (!audioProvider) { els.audList.innerHTML = '<option value="">(no library — paste a path)</option>'; return; }
    try {
      const r = audioListCache || (audioListCache = await audioProvider.list());
      const items = (r && r.items) || [];
      els.audList.innerHTML = '<option value="">— pick a track —</option>' + items.map((it) => `<option value="${it.url}">${it.name}</option>`).join('');
      if (audioWork && audioWork.src) els.audList.value = audioWork.src;
    } catch (e) { els.audList.innerHTML = '<option value="">(library unavailable)</option>'; }
  }
  function renderAudioPanel() {
    const a = audioWork || defaultAudio();
    els.audModes.forEach((b) => b.classList.toggle('ce-on', b.getAttribute('data-m') === a.mode));
    const needsMusic = a.mode === 'music' || a.mode === 'both';
    els.audPick.style.display = needsMusic ? 'flex' : 'none';
    els.audWaveWrap.style.display = needsMusic ? 'block' : 'none';
    els.audVol.parentElement.style.display = needsMusic ? 'inline-flex' : 'none';
    els.audVol.value = a.volume != null ? a.volume : 0.85;
    els.audTime.textContent = 'start ' + (a.startAt || 0).toFixed(1) + 's';
    if (needsMusic && a.src) ensureWaveform(a.src); else { wavePeaks = null; clearWave(); }
  }
  // persist the audio choice to the bag WITHOUT a full Arrange rebuild — refreshArrange would
  // tear down + re-decode the waveform and interrupt playback on every tweak. Audio is
  // render-only (not in the live montage driver), so no iframe re-apply is needed either.
  function commitAudio() {
    if (!audioScope || !audioWork || !montageKey || !montageState) return;
    const norm = normalizeAudio(audioWork) || defaultAudio();
    if (audioScope === 'clip') { if (montageState.clips[activeClip]) montageState.clips[activeClip].audio = norm; }
    else montageState.audio = norm;
    const out = normalizeMontage(Object.assign({}, montageState, { transition: montageState.transition }), 30);
    montageState = clone(out);
    setOverride(montageKey, { montage: out });
  }

  // ── waveform (Web Audio decode → peaks → canvas) ──
  async function ensureWaveform(src) {
    els.audStatus.textContent = 'Loading waveform…';
    try {
      const buf = await (await fetch(src)).arrayBuffer();
      const Ctx = window.AudioContext || window.webkitAudioContext;
      const ac = new Ctx();
      const ab = await ac.decodeAudioData(buf);
      waveDur = ab.duration; wavePeaks = computePeaks(ab, 1000);
      try { ac.close(); } catch (e) {}
      drawWave(); placeMark(); els.audStatus.textContent = '';
    } catch (e) { wavePeaks = null; waveDur = 0; clearWave(); els.audStatus.textContent = 'waveform n/a'; }
  }
  function computePeaks(ab, n) {
    const ch = ab.getChannelData(0); const block = Math.max(1, Math.floor(ch.length / n));
    const peaks = new Float32Array(n);
    for (let i = 0; i < n; i++) { let m = 0; const s = i * block; for (let j = 0; j < block; j++) { const v = Math.abs(ch[s + j] || 0); if (v > m) m = v; } peaks[i] = m; }
    return peaks;
  }
  function clearWave() { const c = els.audWave, ctx = c.getContext('2d'); if (ctx) ctx.clearRect(0, 0, c.width, c.height); }
  function drawWave() {
    if (!wavePeaks) return;
    const c = els.audWave, W = els.audWaveWrap.clientWidth || 600, H = 96, dpr = window.devicePixelRatio || 1;
    c.width = W * dpr; c.height = H * dpr; c.style.width = W + 'px'; c.style.height = H + 'px';
    const ctx = c.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = 'rgba(196,20,29,.85)'; const mid = H / 2, n = wavePeaks.length, bw = Math.max(1, W / n);
    for (let i = 0; i < n; i++) { const x = (i / n) * W, h = wavePeaks[i] * (H * 0.92); ctx.fillRect(x, mid - h / 2, bw, h); }
  }
  function placeMark() { if (waveDur && audioWork) els.audMark.style.left = Math.max(0, Math.min(100, ((audioWork.startAt || 0) / waveDur) * 100)) + '%'; }
  function waveXToTime(clientX) { const r = els.audWaveWrap.getBoundingClientRect(); return Math.max(0, Math.min(waveDur, ((clientX - r.left) / r.width) * waveDur)); }
  els.audWaveWrap.addEventListener('mousedown', (e) => {
    if (!waveDur || !audioWork) return;
    const move = (ev) => {
      audioWork.startAt = Math.round(waveXToTime(ev.clientX) * 10) / 10;
      placeMark(); els.audTime.textContent = 'start ' + audioWork.startAt.toFixed(1) + 's';
      if (audioEl) { try { audioEl.currentTime = audioWork.startAt; } catch (er) {} }
    };
    const up = () => { document.removeEventListener('mousemove', move, true); document.removeEventListener('mouseup', up, true); commitAudio(); };
    document.addEventListener('mousemove', move, true); document.addEventListener('mouseup', up, true);
    move(e);
  });

  // ── audio playback driven by the trim window's single Play (audioStart/audioStop) ──
  // The trim/montage rAF loop owns the video + the waveform playhead (setHeadLine); these
  // only own the <audio> element. mode/native handling lives in the trim startPlay (mute).
  function audioStop() {
    if (audioEl) { try { audioEl.pause(); } catch (e) {} }
  }
  // loop the music back to its chosen start (called when the montage wraps past the total, or a
  // clip loops) so the audio stays bounded to the length instead of running on forever.
  function audioRewind() {
    if (audioEl && !audioEl.paused) { try { audioEl.currentTime = (audioWork && audioWork.startAt) || 0; } catch (e) {} }
  }
  function audioStart() {
    const a = audioWork; if (!a) return;
    const usesMusic = (a.mode === 'music' || a.mode === 'both') && a.src;
    if (!usesMusic) { audioStop(); return; }
    if (!audioEl) { audioEl = document.createElement('audio'); audioEl.className = 'ce-aud-el'; }
    if (!audioEl.isConnected) els.audPanel.appendChild(audioEl);
    if (audioEl.getAttribute('src') !== a.src) { audioEl.setAttribute('src', a.src); audioEl.load(); }
    audioEl.volume = Math.min(1, a.volume || 0.85);
    try { audioEl.currentTime = a.startAt || 0; } catch (e) {}
    audioEl.play().catch(() => {});
  }

  // wiring (the standalone ✓ Done / ▶ Play in the panel are hidden — the trim window owns them)
  els.audDone.addEventListener('click', closeAudioPanel);
  els.audModes.forEach((b) => b.addEventListener('click', () => { if (!audioWork) return; audioWork.mode = b.getAttribute('data-m'); renderAudioPanel(); commitAudio(); reSyncIfPlaying(); }));
  els.audVol.addEventListener('input', () => { if (!audioWork) return; audioWork.volume = Number(els.audVol.value); if (audioEl) audioEl.volume = Math.min(1, audioWork.volume); });
  els.audVol.addEventListener('change', () => { if (audioWork) commitAudio(); });
  els.audList.addEventListener('change', () => { if (audioWork && els.audList.value) { audioWork.src = els.audList.value; audioWork.startAt = 0; renderAudioPanel(); commitAudio(); reSyncIfPlaying(); } });
  els.audUrlGo.addEventListener('click', () => { const v = els.audUrl.value.trim(); if (audioWork && v) { audioWork.src = v; audioWork.startAt = 0; renderAudioPanel(); commitAudio(); reSyncIfPlaying(); } });
  els.audUpload.addEventListener('change', async (e) => {
    const file = e.target.files && e.target.files[0]; if (!file || !audioProvider) return;
    els.audStatus.textContent = 'Uploading…';
    try {
      const r = await audioProvider.upload(file);
      if (r && r.url) { audioListCache = null; await loadAudioList(); audioWork.src = r.url; audioWork.startAt = 0; els.audList.value = r.url; renderAudioPanel(); commitAudio(); reSyncIfPlaying(); els.audStatus.textContent = 'Uploaded ✓'; }
      else els.audStatus.textContent = 'Upload failed';
    } catch (err) { els.audStatus.textContent = 'Upload error'; }
  });
  // ♪ Music — open the same unified window in montage scope (whole-video music)
  els.montMusic.addEventListener('click', () => { if (!montageState) return; montMode = true; renderTrimmer(); });

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

  // Kraken unavailable: hide the live-library controls but KEEP the Browse section open —
  // the static thumbnails + paste-URL still work (degraded, never a dead editor).
  function hideKraken(why) {
    els.kraken.style.display = 'none';
    els.krakenWs.style.display = 'none'; els.krakenFolder.style.display = 'none';
    if (els.kgridTiles) els.kgridTiles.innerHTML = '<span class="ce-kgrid-msg">Live library unavailable — use the thumbnails or paste a path below.</span>';
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
  // Open the live library inside the Browse section: jump straight to a locked folder, or
  // show the workspace picker for manual browsing. (No close-toggle — the modal tab owns
  // visibility now; this just loads content into the always-present Browse grid.)
  async function openKraken() {
    if (!remoteBrowse) return hideKraken('no provider');
    const ok = await ensureKrakenProbe();
    if (!ok) return hideKraken('probe failed');
    await ensurePinLoaded();
    if (pinnedState && pinnedState.wsId) { await openToPin(); return; }   // jump straight to the locked folder
    fillSelect(els.krakenWs, krakenWsCache || [], (w) => w.id, (w) => w.label || w.name, 'Workspace…');
    els.krakenFolder.style.display = 'none';
  }
  async function loadKrakenFolders(wsId) {
    if (els.kgridTiles) els.kgridTiles.innerHTML = '';
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
  let selectedRows = [];         // ORDERED multi-selection (row objects); index+1 = badge number
  let playingMedia = null;

  async function loadKrakenFiles(wsId, folderId) {
    krakenWsId = wsId;
    els.krakenGrid.classList.add('ce-on');
    els.kgridTiles.innerHTML = '<span class="ce-kgrid-msg">Loading…</span>';
    selectedRows = []; updateKrakenSelectionUI();
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
      tile.dataset.kid = row.id;
      const media = row.type === 'video' ? document.createElement('video') : document.createElement('img');
      media.src = row.url;
      if (row.type === 'video') { media.muted = true; media.loop = true; media.preload = 'metadata'; media.playsInline = true; }
      const badge = document.createElement('span');
      badge.className = 'ce-ktile-badge';
      badge.textContent = row.type === 'video' ? '▶ VIDEO' : 'IMG';
      const num = document.createElement('span');     // multi-select order badge (1,2,3…)
      num.className = 'ce-ktile-num'; num.style.display = 'none';
      tile.append(media, badge, num);
      tile.title = row.title || row.id;
      // plain click = select THIS one (+ preview); Ctrl/⌘-click = toggle into the multi-selection
      tile.addEventListener('click', (e) => previewKrakenTile(row, tile, media, e.ctrlKey || e.metaKey));
      tile.addEventListener('dblclick', () => useSelectedKraken());
      els.kgridTiles.appendChild(tile);
    });
    applyTileZoom();
    updateKrakenSelectionUI();   // restore badges after a re-render (filter/sort/zoom)
  }

  // Tile-size slider: value = how many tiles fit ACROSS (1 = one full-width tile … 10 =
  // smallest/densest). The grid uses repeat(N, 1fr), so the columns ALWAYS stretch to
  // fill the panel edge-to-edge — there's never a leftover gap on the right at any size.
  function applyTileZoom() {
    els.kgridTiles.style.setProperty('--ce-cols', Number(els.kzRange.value) || 5);
  }

  // Click a tile: plain = select just this one (+ preview); Ctrl/⌘ = toggle it in/out of the
  // ordered multi-selection. Previewing (inline play) is decoupled — it always plays the
  // clicked clip; selection is what the primary button acts on.
  function selIndex(id) { return selectedRows.findIndex((r) => r.id === id); }
  function previewKrakenTile(row, tile, media, additive) {
    if (additive) {
      const i = selIndex(row.id);
      if (i >= 0) selectedRows.splice(i, 1); else selectedRows.push(row);
    } else {
      selectedRows = [row];
    }
    if (playingMedia && playingMedia !== media) { try { playingMedia.pause(); } catch (e) {} }
    if (media && media.tagName === 'VIDEO') { try { media.currentTime = 0; media.play(); playingMedia = media; } catch (e) {} }
    updateKrakenSelectionUI();
  }
  // Reflect selectedRows onto the tiles (outline + numbered order badge) and the reactive
  // primary button. 0 = disabled; 1 (and not building) = "Use this clip"; otherwise
  // "Add N clips → montage" (2+, or add-mode, or the slot already has a montage).
  function updateKrakenSelectionUI() {
    // prune phantom selections: keep only rows that have a tile in the CURRENT grid (a
    // filter/sort/folder change can drop a selected tile — it shouldn't keep counting).
    const ids = new Set(Array.from(els.kgridTiles.querySelectorAll('.ce-ktile')).map((t) => t.dataset.kid));
    selectedRows = selectedRows.filter((r) => ids.has(String(r.id)));
    Array.from(els.kgridTiles.querySelectorAll('.ce-ktile')).forEach((t) => {
      const idx = selIndex(t.dataset.kid);
      t.classList.toggle('ce-sel', idx >= 0);
      const num = t.querySelector('.ce-ktile-num');
      if (num) { if (idx >= 0) { num.textContent = String(idx + 1); num.style.display = 'flex'; } else num.style.display = 'none'; }
    });
    const n = selectedRows.length;
    const target = swapTarget || montageTarget;
    const building = n >= 2 || montageAddMode || hasMontage(target);
    els.krakenUse.disabled = n === 0;
    els.krakenUse.textContent = (n >= 1 && building) ? `Add ${n} clip${n === 1 ? '' : 's'} → montage`
      : (n === 1 ? 'Use this clip' : 'Use this clip');
    els.kgridSel.textContent = n === 0
      ? 'Click a clip to select · Ctrl-click to pick several · then use the button →'
      : `${n} selected${n >= 2 ? ' — builds a montage in this order' : ''}`;
  }
  // USE/ADD: pull every selected clip to the cache (sequential — pulls are independent),
  // then dispatch: a single clip on a plain slot swaps; multiple (or add-mode / an existing
  // montage) build/extend a montage and open Arrange.
  async function useSelectedKraken() {
    if (!selectedRows.length || !krakenWsId) return;
    const rows = selectedRows.slice();
    els.krakenUse.disabled = true;
    const prev = els.krakenUse.textContent;
    const paths = [];
    try {
      for (let i = 0; i < rows.length; i++) {
        els.krakenUse.textContent = `Pulling ${i + 1}/${rows.length}…`;
        const tile = els.kgridTiles.querySelector(`.ce-ktile[data-kid="${rows[i].id}"]`);
        if (tile) tile.classList.add('ce-ktile-busy');
        const res = await remoteBrowse.pull({ ws: krakenWsId, row: rows[i] });
        if (tile) tile.classList.remove('ce-ktile-busy');
        if (!res || res.available === false || !res.path) { els.kgridSel.textContent = 'Pull failed: ' + ((res && res.error) || 'unknown'); return; }
        paths.push(res.path);
      }
    } catch (e) { els.kgridSel.textContent = 'Pull error: ' + (e && e.message); return; }
    finally { els.krakenUse.textContent = prev; els.krakenUse.disabled = false; }
    dispatchPicked(paths);
  }
  // route pulled clips: plain single swap, or build/extend the montage + open Arrange.
  function dispatchPicked(paths) {
    if (!paths.length) return;
    const target = swapTarget || montageTarget;
    const building = paths.length >= 2 || montageAddMode || hasMontage(target);
    if (!building && paths.length === 1) { applySwap(paths[0]); closeMediaModal(); return; }
    ensureMontageStarted(target);
    paths.forEach((p) => montageState.clips.push({ src: p, in: 0, out: 3 }));
    commitMontage();
    montageAddMode = false;
    selectedRows = [];
    showSection('arrange', target);
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
  // on EVERY modal-open (after the probe): jump to the locked folder if one is pinned;
  // otherwise show the workspace picker so the user can start browsing immediately.
  async function autoOpenPin() {
    if (els.montPanel.classList.contains('ce-on')) return;   // in Arrange — don't open the grid over it
    await ensurePinLoaded();
    if (pinnedState && pinnedState.wsId) openToPin();
    else fillSelect(els.krakenWs, krakenWsCache || [], (w) => w.id, (w) => w.label || w.name, 'Workspace…');
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
  els.swapClose.addEventListener('click', closeMediaModal);
  els.mediaBackdrop.addEventListener('click', closeMediaModal);

  // media-modal entry + tabs
  els.editMontage.addEventListener('click', () => {
    const el = selectedKey ? elForKey(selectedKey) : null;
    if (el) openMediaModal(el);
  });
  els.mmTabBrowse.addEventListener('click', () => showSection('browse', swapTarget || montageTarget));
  els.mmTabArrange.addEventListener('click', () => showSection('arrange', swapTarget || montageTarget));

  // montage controls (Phase D1)
  els.montClear.addEventListener('click', clearMontage);
  els.montAdd.addEventListener('click', () => {
    // ＋ Add clips: arm add-mode and flip to Browse so the next pick(s) APPEND to the montage.
    montageAddMode = true;
    showSection('browse', montageTarget || swapTarget);
  });
  // Total-length controls (slider + number, both bound). setTotal pins + commits; commitMontage
  // floors at the cycle (≥ all clips once) and clamps ≤ 90, then syncTotalUI reflects it back.
  function setTotal(v) {
    if (!montageState) return;
    montageUserTotal = true;
    montageState.totalDuration = Number(v) || montageState.totalDuration;
    commitMontage();
  }
  els.montTotal.addEventListener('change', () => setTotal(els.montTotal.value));
  // slider: live-preview the number while dragging; commit on release
  els.montTotalRange.addEventListener('input', () => { if (els.montTotal) els.montTotal.value = els.montTotalRange.value; });
  els.montTotalRange.addEventListener('change', () => setTotal(els.montTotalRange.value));
  // transition controls (Phase D v2)
  els.montTransType.addEventListener('change', () => {
    if (!montageState) return;
    ensureTransition();
    montageState.transition.type = els.montTransType.value === 'crossfade' ? 'crossfade' : 'cut';
    els.montFade.style.display = (montageState.transition.type === 'crossfade') ? 'inline-flex' : 'none';
    commitMontage();
  });
  els.montFadeDur.addEventListener('change', () => {
    if (!montageState) return;
    ensureTransition();
    montageState.transition.duration = Number(els.montFadeDur.value) || 0.4;
    commitMontage();
  });

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
    await tagLive();             // wait for the design's JS to build, then stamp live ids
    wireIframe(); wireIframeMouse(); wireIframeKeys(); installIframeMontageHooks();
    showFrame(curFrame);
    startRebuildWatch();         // survive a later self-rebuild by the design's own JS
    syncButtons();
  })();

  return {
    getOverrides: () => clone(overrides),
    setOverrides: async (ov) => { overrides = clone(ov || {}); await rerenderPristine(); },
    showFrame, undo, redo,
    destroy: () => rootEl.remove(),
  };
}
