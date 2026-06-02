// editing.jsx — Tweaks panel infrastructure for video templates.
//
// Each template defines a SPEC (id + name + array of fields). The
// useTemplateEdits hook returns a merged `data` object the template reads,
// plus a setField/reset API.  Edits persist to localStorage.
//
// Field types:
//   text       → single-line input
//   textarea   → multi-line
//   number     → numeric input
//   slider     → range slider with value display
//   select     → dropdown
//   color      → swatch picker
//   image      → drop-zone for photo OR video. When a video, an inline
//                trim timeline appears so the user can pick which portion
//                of the source clip plays inside the template loop.
//                The window can be shrunk below template length, which
//                loops the clip multiple times.

const EDIT_STORAGE_PREFIX = 'aa-edits:';

// ── Storage status pub/sub ────────────────────────
// Components subscribe to storage health (free space %, last error).
// When a write fails (quota or otherwise), all listeners are notified so the
// EditPanel can surface a banner without us having to thread a callback
// through the React tree.
const _storageListeners = new Set();
let _storageStatus = { lastError: null, lastErrorTime: 0, percentFull: null };
function _broadcastStatus() {
  _storageListeners.forEach((fn) => fn(_storageStatus));
}
function _setStorageError(message) {
  _storageStatus = { ..._storageStatus, lastError: message, lastErrorTime: Date.now() };
  _broadcastStatus();
}
function _setStoragePercentFull(pct) {
  _storageStatus = { ..._storageStatus, percentFull: pct };
  _broadcastStatus();
}
function useStorageStatus() {
  const [s, setS] = React.useState(_storageStatus);
  React.useEffect(() => {
    _storageListeners.add(setS);
    return () => _storageListeners.delete(setS);
  }, []);
  return s;
}

// Estimate localStorage usage. localStorage budget is ~5MB per origin but
// varies by browser. We total bytes from every key starting with our prefix,
// plus a sampling of other top-level keys, and divide by an assumed 5MB cap.
function _measureStorage() {
  try {
    let bytes = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      const v = localStorage.getItem(k);
      if (v != null) bytes += k.length + v.length;
    }
    // Assume 5MB ceiling. Browsers vary 2.5–10MB.
    const cap = 5 * 1024 * 1024;
    _setStoragePercentFull(Math.min(100, Math.round((bytes / cap) * 100)));
  } catch {}
}

function readEdits(id) {
  try {
    const raw = localStorage.getItem(EDIT_STORAGE_PREFIX + id);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}
function writeEdits(id, edits) {
  try {
    localStorage.setItem(EDIT_STORAGE_PREFIX + id, JSON.stringify(edits));
    _measureStorage();
  } catch (e) {
    // Most likely QuotaExceededError. Tell the panel to show a banner.
    const isQuota = e && (e.name === 'QuotaExceededError' || /quota/i.test(String(e.message || '')));
    _setStorageError(isQuota
      ? 'STORAGE FULL · EDIT NOT SAVED · USE A SMALLER CLIP'
      : 'SAVE FAILED · ' + (e && e.message ? e.message : 'UNKNOWN'));
  }
}

function useTemplateEdits(spec) {
  const [edits, setEdits] = React.useState(() => readEdits(spec.id));

  // If the spec id changes (e.g. a Modal that was mounted with a null-spec
  // gets a real item later), re-read storage for the new id. Hooks initialize
  // once on mount; without this they'd keep showing the old/default values.
  const lastIdRef = React.useRef(spec.id);
  if (lastIdRef.current !== spec.id) {
    lastIdRef.current = spec.id;
    // Schedule a state update for after this render
    Promise.resolve().then(() => setEdits(readEdits(spec.id)));
  }

  const defaults = React.useMemo(() => {
    const d = {};
    for (const f of spec.fields) d[f.key] = f.default;
    return d;
  }, [spec]);

  const data = React.useMemo(() => ({ ...defaults, ...edits }), [defaults, edits]);

  const setField = React.useCallback((key, value) => {
    setEdits((prev) => {
      const next = { ...prev, [key]: value };
      writeEdits(spec.id, next);
      return next;
    });
  }, [spec.id]);

  // Atomic multi-key update — keeps clipStart/clipEnd in lockstep when
  // dragging the trim window.
  const setFields = React.useCallback((patch) => {
    setEdits((prev) => {
      const next = { ...prev, ...patch };
      writeEdits(spec.id, next);
      return next;
    });
  }, [spec.id]);

  const reset = React.useCallback(() => {
    setEdits({});
    try { localStorage.removeItem(EDIT_STORAGE_PREFIX + spec.id); } catch {}
  }, [spec.id]);

  return { data, setField, setFields, reset };
}

// ── Media helpers ───────────────────────────────────

function isVideoSrc(src) {
  if (!src) return false;
  if (src.startsWith('data:video/')) return true;
  return /\.(mp4|mov|webm|m4v)(\?|$)/i.test(src);
}

// TrimmedMedia — drop-in replacement for <img>/<video> in templates.
// Loops the video between [clipStart, clipEnd]. Used inside the actual
// template animations so trimmed videos loop correctly during playback.
function TrimmedMedia({ src, clipStart = 0, clipEnd = null, muted = true, style = {}, alt = '' }) {
  const videoRef = React.useRef(null);
  const isVideo = isVideoSrc(src);
  // Deterministic render: when run-campaign pre-extracted the clip to frames
  // (window.__bgFrames, already trimmed to [clipStart,clipEnd]), render a stable
  // <img data-bgframe> the render driver fills per frame — a wall-clock <video>
  // hyperloops/freezes in the headless frame-by-frame capture. Live preview keeps
  // the normal <video> below.
  const bf = (typeof window !== 'undefined') ? window.__bgFrames : null;
  const useFrames = isVideo && bf && bf.base && bf.count > 0;

  React.useEffect(() => {
    if (useFrames || !isVideo || !videoRef.current) return;
    const v = videoRef.current;
    const onMeta = () => {
      if (clipStart > 0) {
        try { v.currentTime = clipStart; } catch {}
      }
    };
    const onTime = () => {
      if (clipEnd != null && v.currentTime >= clipEnd) {
        try { v.currentTime = clipStart; } catch {}
      } else if (v.currentTime < clipStart - 0.05) {
        try { v.currentTime = clipStart; } catch {}
      }
    };
    v.addEventListener('loadedmetadata', onMeta);
    v.addEventListener('timeupdate', onTime);
    return () => {
      v.removeEventListener('loadedmetadata', onMeta);
      v.removeEventListener('timeupdate', onTime);
    };
  }, [isVideo, clipStart, clipEnd, src, useFrames]);

  if (useFrames) {
    return <img data-bgframe="1" alt={alt} style={style}/>;
  }
  if (isVideo) {
    return <video ref={videoRef} src={src} autoPlay loop muted={muted} playsInline style={style}/>;
  }
  return <img src={src} alt={alt} style={style}/>;
}

// ── Form controls ───────────────────────────────────

function FieldRow({ label, sub, children }) {
  return (
    <div className="tp-field">
      <div className="tp-field-head">
        <div className="tp-field-label">{label}</div>
        {sub && <div className="tp-field-sub">{sub}</div>}
      </div>
      {children}
    </div>
  );
}

function TextField({ value, onChange, multiline }) {
  if (multiline) {
    return <textarea className="tp-input tp-textarea" value={value || ''} onChange={(e) => onChange(e.target.value)} rows={3}/>;
  }
  return <input type="text" className="tp-input" value={value || ''} onChange={(e) => onChange(e.target.value)}/>;
}

function NumberField({ value, onChange, step = 1, min, max }) {
  return (
    <input
      type="number"
      className="tp-input tp-number"
      value={value ?? ''}
      step={step}
      min={min}
      max={max}
      onChange={(e) => {
        const v = e.target.value;
        if (v === '') onChange('');
        else onChange(parseFloat(v));
      }}
    />
  );
}

function SliderField({ value, onChange, min = 0, max = 10, step = 0.1, unit = '' }) {
  const v = value ?? min;
  return (
    <div className="tp-slider-row">
      <input
        type="range"
        className="tp-slider"
        min={min} max={max} step={step}
        value={v}
        onChange={(e) => onChange(parseFloat(e.target.value))}
      />
      <div className="tp-slider-value">{Number(v).toFixed(step < 1 ? 1 : 0)}{unit}</div>
    </div>
  );
}

function SelectField({ value, onChange, options }) {
  return (
    <select className="tp-input tp-select" value={value || ''} onChange={(e) => onChange(e.target.value)}>
      {options.map((o) => (
        typeof o === 'string'
          ? <option key={o} value={o}>{o}</option>
          : <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

function ColorField({ value, onChange, options }) {
  return (
    <div className="tp-swatches">
      {options.map((c) => (
        <button
          key={c}
          type="button"
          className={'tp-swatch' + (value === c ? ' is-active' : '')}
          style={{ background: c }}
          onClick={() => onChange(c)}
          aria-label={c}
        />
      ))}
    </div>
  );
}

// ── MediaField — photo OR video drop zone, with timeline trim ──────

function MediaField({ field, data, setFields, templateDuration = 6 }) {
  const fileRef = React.useRef(null);
  const videoRef = React.useRef(null);     // the drop-zone <video>
  const trackRef = React.useRef(null);     // the trim timeline track
  const dragRef = React.useRef(null);      // active pointer drag state

  const [isOver, setIsOver] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [videoDur, setVideoDur] = React.useState(null);
  const [scrubTime, setScrubTime] = React.useState(null); // null = playing
  const [paused, setPaused] = React.useState(false);

  const key = field.key;
  const defaultSrc = field.default;
  const value = data[key];
  const isCustom = value && value !== defaultSrc;
  const previewSrc = value || defaultSrc;
  const previewIsVideo = isVideoSrc(previewSrc);
  const withAudio = !!data[key + '_audio'];

  // Clip window math. clipEnd is clamped to videoDur; if not set, defaults
  // to clipStart + templateDuration (so a fresh drop fills the loop).
  const rawStart = Number(data[key + '_clipStart']) || 0;
  const clipStart = Math.max(0, rawStart);
  const rawEnd = data[key + '_clipEnd'];
  const haveEnd = typeof rawEnd === 'number' && rawEnd > clipStart;
  const fallbackEnd = clipStart + templateDuration;
  const upper = videoDur != null ? videoDur : fallbackEnd;
  const clipEnd = Math.min(haveEnd ? rawEnd : fallbackEnd, upper);
  const clipLen = Math.max(0.1, clipEnd - clipStart);
  const loops = templateDuration > 0 ? templateDuration / clipLen : 1;

  // Probe duration of the source video
  React.useEffect(() => {
    if (!previewIsVideo) { setVideoDur(null); return; }
    const v = document.createElement('video');
    v.src = previewSrc;
    v.muted = true;
    v.preload = 'metadata';
    const onMeta = () => {
      if (isFinite(v.duration) && v.duration > 0) setVideoDur(v.duration);
    };
    v.addEventListener('loadedmetadata', onMeta);
    return () => v.removeEventListener('loadedmetadata', onMeta);
  }, [previewSrc, previewIsVideo]);

  // Drive the preview video: scrub > pause > play within window
  React.useEffect(() => {
    const v = videoRef.current;
    if (!v || !previewIsVideo) return;
    if (scrubTime != null) {
      v.pause();
      try { v.currentTime = scrubTime; } catch {}
    } else if (paused) {
      v.pause();
    } else {
      // Ensure we're inside the window before resuming
      if (v.currentTime < clipStart || v.currentTime > clipEnd) {
        try { v.currentTime = clipStart; } catch {}
      }
      v.play().catch(() => {});
    }
  }, [scrubTime, paused, clipStart, clipEnd, previewIsVideo]);

  // Loop within the window when playing
  React.useEffect(() => {
    const v = videoRef.current;
    if (!v || !previewIsVideo) return;
    const onTime = () => {
      if (scrubTime != null || paused) return;
      if (v.currentTime >= clipEnd) {
        try { v.currentTime = clipStart; } catch {}
      }
    };
    v.addEventListener('timeupdate', onTime);
    return () => v.removeEventListener('timeupdate', onTime);
  }, [clipStart, clipEnd, scrubTime, paused, previewIsVideo]);

  // ── File handling ──
  const handleFile = (file) => {
    if (!file) return;
    const isImage = file.type.startsWith('image/');
    const isVideoFile = file.type.startsWith('video/');
    if (!isImage && !isVideoFile) {
      setError('IMAGE OR VIDEO ONLY');
      setTimeout(() => setError(null), 2500);
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setError('FILE > 8MB · MAY NOT PERSIST');
      setTimeout(() => setError(null), 4000);
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setFields({
        [key]: e.target.result,
        [key + '_clipStart']: 0,
        [key + '_clipEnd']: null,
      });
      setPaused(false);
      setScrubTime(null);
    };
    reader.onerror = () => {
      setError('READ FAILED');
      setTimeout(() => setError(null), 2500);
    };
    reader.readAsDataURL(file);
  };

  const resetMedia = () => {
    setFields({
      [key]: defaultSrc,
      [key + '_clipStart']: 0,
      [key + '_clipEnd']: null,
    });
    setPaused(false);
    setScrubTime(null);
  };

  // ── Timeline interaction ──
  const pxToTime = (clientX) => {
    const r = trackRef.current?.getBoundingClientRect();
    if (!r || !videoDur) return 0;
    const pct = (clientX - r.left) / r.width;
    return Math.max(0, Math.min(videoDur, pct * videoDur));
  };

  const onWindowDown = (e) => {
    if (!videoDur) return;
    e.stopPropagation();
    e.preventDefault();
    const t = pxToTime(e.clientX);
    dragRef.current = { mode: 'move', offset: t - clipStart };
    setScrubTime(clipStart);
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };

  const onResizeDown = (e) => {
    if (!videoDur) return;
    e.stopPropagation();
    e.preventDefault();
    dragRef.current = { mode: 'resize' };
    setScrubTime(clipEnd);
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };

  React.useEffect(() => {
    const onMove = (e) => {
      if (!dragRef.current || !videoDur) return;
      const t = pxToTime(e.clientX);
      if (dragRef.current.mode === 'move') {
        const newStart = Math.max(0, Math.min(videoDur - clipLen, t - dragRef.current.offset));
        const newEnd = newStart + clipLen;
        setFields({
          [key + '_clipStart']: newStart,
          [key + '_clipEnd']: newEnd,
        });
        setScrubTime(newStart);
      } else if (dragRef.current.mode === 'resize') {
        // Resize end. Max length is templateDuration. Min length is 0.3s.
        const maxEnd = Math.min(videoDur, clipStart + templateDuration);
        const newEnd = Math.max(clipStart + 0.3, Math.min(maxEnd, t));
        setFields({
          [key + '_clipStart']: clipStart,
          [key + '_clipEnd']: newEnd,
        });
        setScrubTime(newEnd);
      }
    };
    const onUp = () => {
      if (dragRef.current) {
        dragRef.current = null;
        setScrubTime(null);
      }
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };
  }, [videoDur, clipStart, clipLen, templateDuration, key, setFields]);

  // ── Render ──
  const startPct = videoDur ? (clipStart / videoDur) * 100 : 0;
  const widthPct = videoDur ? (clipLen / videoDur) * 100 : 0;

  // Compute tick interval — about 1 tick every 60-80px feels right
  const tickStep = videoDur
    ? (videoDur > 30 ? 5 : videoDur > 15 ? 2 : 1)
    : 1;
  const tickCount = videoDur ? Math.floor(videoDur / tickStep) + 1 : 0;

  return (
    <div className="tp-media">
      <div
        className={'tp-image' + (isOver ? ' is-over' : '')}
        onClick={() => fileRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setIsOver(true); }}
        onDragLeave={() => setIsOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsOver(false);
          handleFile(e.dataTransfer.files?.[0]);
        }}
      >
        {previewSrc && (
          previewIsVideo
            ? <video ref={videoRef} src={previewSrc} autoPlay loop muted={!withAudio} playsInline
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
              />
            : <img src={previewSrc} alt=""
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
              />
        )}
        <div className="tp-image-overlay">
          <div className="tp-image-label">
            {error
              ? <span style={{ color: '#ff8e8e' }}>{error}</span>
              : (isCustom
                  ? `YOUR ${previewIsVideo ? 'VIDEO' : 'PHOTO'} · CLICK TO REPLACE`
                  : 'DROP IMAGE OR VIDEO · CLICK')}
          </div>
        </div>
        {isCustom && (
          <button
            type="button"
            className="tp-image-reset"
            onClick={(e) => { e.stopPropagation(); resetMedia(); }}
            title="Reset to default"
          >×</button>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*,video/*"
          style={{ display: 'none' }}
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </div>

      {/* Trim timeline — only shown for videos with known duration */}
      {previewIsVideo && videoDur && (
        <div className="tp-trim">
          <div className="tp-trim-head">
            <div className="tp-trim-head-left">
              <div className="tp-trim-label">TRIM CLIP</div>
              <div className="tp-trim-applied" title="Trim is live in the preview">
                <span className="tp-trim-dot"/> APPLIED
              </div>
            </div>
            <button
              type="button"
              className="tp-trim-play"
              onClick={(e) => { e.stopPropagation(); setPaused((p) => !p); }}
            >{paused ? '▶ PLAY' : '❚❚ PAUSE'}</button>
          </div>

          {/* Track */}
          <div className="tp-trim-track" ref={trackRef}>
            {/* Tick marks */}
            {Array.from({ length: tickCount }).map((_, i) => {
              const tSec = i * tickStep;
              const pct = (tSec / videoDur) * 100;
              return (
                <div key={i} className="tp-trim-tick" style={{ left: `${pct}%` }}>
                  <div className="tp-trim-tick-label">{tSec}s</div>
                </div>
              );
            })}
            {/* Window */}
            <div
              className="tp-trim-window"
              style={{ left: `${startPct}%`, width: `${widthPct}%` }}
              onPointerDown={onWindowDown}
              title="Drag to move the clip window"
            >
              <div className="tp-trim-window-label">
                {clipLen.toFixed(1)}s
              </div>
              <div
                className="tp-trim-resize"
                onPointerDown={onResizeDown}
                title="Drag to shorten / lengthen the window"
              />
            </div>
            {/* Scrub indicator */}
            {scrubTime != null && (
              <div className="tp-trim-scrub" style={{ left: `${(scrubTime / videoDur) * 100}%` }}/>
            )}
          </div>

          {/* Info row */}
          <div className="tp-trim-info">
            <div className="tp-trim-info-cell">
              <span className="tp-trim-info-label">START</span>
              <span className="tp-trim-info-value">{clipStart.toFixed(1)}s</span>
            </div>
            <div className="tp-trim-info-cell">
              <span className="tp-trim-info-label">END</span>
              <span className="tp-trim-info-value">{clipEnd.toFixed(1)}s</span>
            </div>
            <div className="tp-trim-info-cell">
              <span className="tp-trim-info-label">LENGTH</span>
              <span className="tp-trim-info-value">{clipLen.toFixed(1)}s</span>
            </div>
            <div className="tp-trim-info-cell">
              <span className="tp-trim-info-label">LOOPS</span>
              <span className="tp-trim-info-value" style={{ color: loops > 1.05 ? '#c4141d' : undefined }}>
                {loops.toFixed(loops > 1.05 ? 1 : 0)}×
              </span>
            </div>
          </div>

          <div className="tp-trim-hint">
            DRAG THE RED WINDOW · DRAG THE RIGHT EDGE TO SHORTEN
          </div>

          {/* Audio toggle */}
          <div className="tp-trim-audio">
            <div className="tp-trim-audio-label">AUDIO</div>
            <div className="tp-trim-audio-buttons">
              <button
                type="button"
                className={'tp-trim-audio-btn' + (!withAudio ? ' is-active' : '')}
                onClick={(e) => { e.stopPropagation(); setFields({ [key + '_audio']: false }); }}
              >MUTED</button>
              <button
                type="button"
                className={'tp-trim-audio-btn' + (withAudio ? ' is-active' : '')}
                onClick={(e) => { e.stopPropagation(); setFields({ [key + '_audio']: true }); }}
              >NATIVE AUDIO</button>
            </div>
            {withAudio && (
              <div className="tp-trim-audio-hint">
                CLICK PREVIEW IF YOU DON'T HEAR SOUND (BROWSER POLICY)
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── EditPanel ───────────────────────────────────────

function EditPanel({ spec, data, setField, setFields, reset, templateDuration = 6 }) {
  const status = useStorageStatus();
  React.useEffect(() => { _measureStorage(); }, []);
  const showQuotaWarn = status.percentFull != null && status.percentFull > 75;
  // Surface a recent error for ~6s
  const showError = status.lastError && (Date.now() - status.lastErrorTime) < 6500;

  // Effective template duration: prefer the edited `duration` from data
  // (so trim window-length-cap follows the slider), fall back to prop.
  const effDur = (typeof data.duration === 'number' && data.duration > 0) ? data.duration : templateDuration;

  return (
    <div className="tp-panel">
      <div className="tp-header">
        <div>
          <div className="tp-eyebrow">// EDIT</div>
          <div className="tp-title">{spec.name}</div>
        </div>
        <button type="button" className="tp-reset" onClick={reset}>RESET</button>
      </div>

      {(showError || showQuotaWarn) && (
        <div className={'tp-storage-banner' + (showError ? ' is-error' : '')}>
          {showError
            ? <>⚠️ {status.lastError}</>
            : <>⚠️ STORAGE {status.percentFull}% FULL · LARGE UPLOADS MAY FAIL</>}
        </div>
      )}

      <div className="tp-fields">
        {spec.fields.map((f) => {
          const v = data[f.key];
          const set = (val) => setField(f.key, val);
          return (
            <FieldRow key={f.key} label={f.label} sub={f.sub}>
              {f.type === 'text'    && <TextField value={v} onChange={set}/>}
              {f.type === 'textarea'&& <TextField value={v} onChange={set} multiline/>}
              {f.type === 'number'  && <NumberField value={v} onChange={set} step={f.step} min={f.min} max={f.max}/>}
              {f.type === 'slider'  && <SliderField value={v} onChange={set} min={f.min} max={f.max} step={f.step} unit={f.unit}/>}
              {f.type === 'select'  && <SelectField value={v} onChange={set} options={f.options}/>}
              {f.type === 'color'   && <ColorField  value={v} onChange={set} options={f.options}/>}
              {f.type === 'image'   && <MediaField  field={f} data={data} setFields={setFields} templateDuration={effDur}/>}
            </FieldRow>
          );
        })}
      </div>

      <div className="tp-footer">
        <div className="tp-footer-mono">// CHANGES PERSIST PER TEMPLATE</div>
      </div>
    </div>
  );
}

Object.assign(window, {
  useTemplateEdits,
  useStorageStatus,
  EditPanel,
  EDIT_STORAGE_PREFIX,
  isVideoSrc,
  TrimmedMedia,
});
