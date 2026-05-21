// ── MusicSync ─────────────────────────────────────────────────────────────
// Preview-only audio sync. Hooks an <audio> element into the Stage timeline
// so play/pause/scrub on the playback bar drives the music. Fades in at start
// and out at the end of the clip.
//
// Renderer behavior: the deterministic Stage runs with playing:false during
// MP4 capture, so audio never plays during render. Music gets muxed into the
// rendered MP4 via a separate ffmpeg pass.
//
// Autoplay handling: Stage persists `playing` across reloads, so on mount
// the timeline may already be in "playing" state — but the browser still
// requires a user gesture before audio.play() will work. We gate audio
// playback on a `unlocked` flag that flips true on the first real click /
// keypress / touch anywhere on the page. Until then audio stays paused.

function MusicSync({ src, startAt = 0, volume = 0.85, fadeIn = 1.0, fadeOut = 1.5 }) {
  const audioRef = React.useRef(null);
  const { time, duration, playing } = useTimeline();
  const [unlocked, setUnlocked] = React.useState(false);
  const loggedReady = React.useRef(false);

  // URL-param overrides — lets the audio picker test new values via
  // ?musicStartAt=14.67&musicVolume=0.6 without editing JSX. Each one falls
  // through to the prop default if the param isn't present or invalid.
  const params = React.useMemo(() => {
    try { return new URLSearchParams(location.search); } catch (_) { return null; }
  }, []);
  const overrideNum = (name, min, max) => {
    if (!params || !params.has(name)) return undefined;
    const n = parseFloat(params.get(name));
    if (isNaN(n)) return undefined;
    if (min != null && n < min) return undefined;
    if (max != null && n > max) return undefined;
    return n;
  };
  const startOverride = overrideNum('musicStartAt', 0);
  const volOverride = overrideNum('musicVolume', 0, 1);
  const muteOverride = params?.get('musicMute') === '1';
  if (startOverride !== undefined) startAt = startOverride;
  if (volOverride !== undefined) volume = volOverride;

  // When loaded inside the audio picker iframe, the picker passes
  // ?musicMute=1 so we don't double up on audio (picker + iframe both
  // playing the same track creates a phase-offset "reverb"). The picker is
  // then the sole audio source.
  React.useEffect(() => {
    if (audioRef.current) audioRef.current.muted = muteOverride;
  }, [muteOverride]);

  // First-gesture audio unlock. Capture phase so we run before React's
  // synthetic event system; we briefly play+pause inside the gesture handler,
  // which permanently unlocks this <audio> element for subsequent play() calls.
  React.useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    let done = false;
    const unlock = () => {
      if (done) return;
      done = true;
      const p = a.play();
      if (p && typeof p.then === 'function') {
        p.then(() => {
          a.pause();
          a.currentTime = startAt;
          setUnlocked(true);
        }).catch((err) => {
          console.warn('[MusicSync] unlock failed:', err.message);
          // Still set unlocked so we don't keep waiting; subsequent play() may
          // work if the user clicks again.
          setUnlocked(true);
        });
      } else {
        setUnlocked(true);
      }
      document.removeEventListener('pointerdown', unlock, true);
      document.removeEventListener('keydown', unlock, true);
      document.removeEventListener('touchstart', unlock, true);
    };
    document.addEventListener('pointerdown', unlock, true);
    document.addEventListener('keydown', unlock, true);
    document.addEventListener('touchstart', unlock, true);
    return () => {
      document.removeEventListener('pointerdown', unlock, true);
      document.removeEventListener('keydown', unlock, true);
      document.removeEventListener('touchstart', unlock, true);
    };
  }, [src, startAt]);

  // Play/pause follows the Stage. Gated on `unlocked` so we never call play()
  // before the user has interacted with the document.
  // NOTE: no cleanup-pause here — pausing in cleanup races against the next
  // effect's play() call ("play() request was interrupted by pause()"), which
  // is why pause→play stopped working in the previous version.
  React.useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    if (playing && unlocked) {
      const p = a.play();
      if (p && typeof p.then === 'function') {
        p.catch((err) => console.warn('[MusicSync] play() rejected:', err.message));
      }
    } else {
      a.pause();
    }
  }, [playing, unlocked]);

  // Unmount-only cleanup
  React.useEffect(() => () => {
    const a = audioRef.current;
    if (a) { try { a.pause(); } catch (_) {} }
  }, []);

  // Seek audio only when playing — otherwise paused-state currentTime drift
  // is irrelevant and seeking re-triggers canplay on every frame.
  React.useEffect(() => {
    if (!playing || !unlocked) return;
    const a = audioRef.current;
    if (!a) return;
    const target = startAt + time;
    if (Math.abs(a.currentTime - target) > 0.3) {
      try { a.currentTime = target; } catch (_) {}
    }
  }, [time, startAt, playing, unlocked]);

  // Fade in/out at clip boundaries
  React.useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    let vol = volume;
    if (fadeIn > 0 && time < fadeIn) vol = volume * (time / fadeIn);
    if (fadeOut > 0 && time > duration - fadeOut) {
      vol = volume * Math.max(0, (duration - time) / fadeOut);
    }
    a.volume = Math.max(0, Math.min(1, vol));
  }, [time, duration, volume, fadeIn, fadeOut]);

  return (
    <React.Fragment>
      <audio
        ref={audioRef}
        src={src}
        preload="auto"
        onError={(e) => console.error('[MusicSync] audio error for ' + src, e.nativeEvent)}
        onCanPlay={() => {
          if (!loggedReady.current) {
            loggedReady.current = true;
            console.log('[MusicSync] ready:', src);
          }
        }}
      />
      {!unlocked && (
        <div style={{
          position: 'absolute', left: '50%', top: 24,
          transform: 'translateX(-50%)', zIndex: 999,
          padding: '6px 12px',
          background: 'rgba(0,0,0,0.7)',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: 4,
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 11, letterSpacing: '0.12em',
          color: 'rgba(255,255,255,0.85)',
          textTransform: 'uppercase',
          pointerEvents: 'none',
        }}>
          Click anywhere to enable audio
        </div>
      )}
    </React.Fragment>
  );
}

window.MusicSync = MusicSync;
