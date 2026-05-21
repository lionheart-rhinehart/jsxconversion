// CREATIVE A — "The Rule" — :30 — 9:16 (1080×1920)
// Broadcast documentary treatment. Letterbox bars, timecode burn-in, REC dot,
// hard cuts, subtitle pull-quotes, lift HUD ticking down rep-by-rep.

const W = 1080;
const H = 1920;
const DUR = 42;

// ── Palette (pulls from --aa- tokens; mirrored as JS constants for inline use)
const RED = "#c4141d";
const RED_BRIGHT = "#e02828";
const INK_950 = "#0a0b0d";
const INK_800 = "#1f2227";
const INK_700 = "#2c3038";
const WHITE = "#ffffff";

const clamp01 = (v) => Math.max(0, Math.min(1, v));

const FONT_DISP = '"Anton", "Oswald", "Arial Narrow", system-ui, sans-serif';
const FONT_BODY = '"Geist", "Inter", system-ui, sans-serif';
const FONT_MONO = '"JetBrains Mono", ui-monospace, monospace';
const FONT_HAND = '"Caveat", "Bradley Hand", cursive';

// ── Tweaks ───────────────────────────────────────────────────────────────────
const TWEAK_DEFAULTS_A = /*EDITMODE-BEGIN*/{
  "variant": "doc",
  "tagline": "Train fast. Be fast.",
  "location": "Noblesville",
  "showHUD": true,
  "showTimecode": true
}/*EDITMODE-END*/;
const TweakCtxA = React.createContext(TWEAK_DEFAULTS_A);
const useTweakA = () => React.useContext(TweakCtxA);

// ── Helpers ──────────────────────────────────────────────────────────────────
const lerp = (a, b, t) => a + (b - a) * t;
function fmtTC(t) {
  // CMR timecode HH:MM:SS:FF (24fps)
  const ff = Math.floor((t * 24) % 24);
  const ss = Math.floor(t % 60);
  const mm = Math.floor((t / 60) % 60);
  return `00:${String(mm).padStart(2,'0')}:${String(ss).padStart(2,'0')}:${String(ff).padStart(2,'0')}`;
}

// ── Hand-drawn annotation: handwritten label + wobbly arrow to a target ─────
function Annotation({ start, end, label, labelX, labelY, targetX, targetY, color }) {
  return (
    <Sprite start={start} end={end}>
      <AnnotationInner label={label} labelX={labelX} labelY={labelY}
        targetX={targetX} targetY={targetY} color={color}/>
    </Sprite>
  );
}
function AnnotationInner({ label, labelX, labelY, targetX, targetY, color = '#fff' }) {
  const { localTime, duration } = useSprite();
  // Draw arrow over first 0.65s, then label fades in
  const drawT = Math.min(1, localTime / 0.65);
  const labelT = Math.min(1, Math.max(0, (localTime - 0.4) / 0.45));
  const exitT = Math.max(0, 1 - Math.min(1, (duration - localTime) / 0.4));
  const opacity = 1 - exitT;

  // Anchor near the END of the label (right side, slightly above baseline)
  const sx = labelX + 300;
  const sy = labelY + 30;
  // Single hand-drawn arc — curve toward target with a humanizing wobble
  // Tip stops SHORT of target so the arrowhead is the only thing touching it.
  const dx = targetX - sx;
  const dy = targetY - sy;
  const len = Math.sqrt(dx * dx + dy * dy);
  // Pull back 18px so the line ends before the target; arrowhead bridges the gap.
  const pullback = Math.min(18, len * 0.08);
  const tipX = targetX - (dx / len) * pullback;
  const tipY = targetY - (dy / len) * pullback;

  // Control points for a hand-drawn arc — slight overshoot then settle
  const midX = (sx + tipX) / 2 + 40;
  const midY = (sy + tipY) / 2 - 80;
  const pathD = `M ${sx} ${sy} Q ${midX} ${midY} ${tipX} ${tipY}`;

  const pathLen = 600;
  const dashOffset = pathLen * (1 - drawT);

  // Hand-drawn arrowhead — bigger, more visible, two slightly-off-axis strokes.
  const ang = Math.atan2(tipY - midY, tipX - midX);
  const ahLen = 38;
  const ahSpread = 0.5; // radians
  const ax1 = tipX - Math.cos(ang - ahSpread) * ahLen;
  const ay1 = tipY - Math.sin(ang - ahSpread) * ahLen;
  const ax2 = tipX - Math.cos(ang + ahSpread) * ahLen;
  const ay2 = tipY - Math.sin(ang + ahSpread) * ahLen;
  // Two separate strokes with slight wobble for a hand-drawn feel
  const ahA = `M ${tipX} ${tipY} L ${ax1 + 3} ${ay1 - 2}`;
  const ahB = `M ${tipX} ${tipY} L ${ax2 - 2} ${ay2 + 3}`;
  const headT = Math.min(1, Math.max(0, (localTime - 0.55) / 0.2));

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 12, pointerEvents: 'none', opacity }}>
      {/* Handwritten label */}
      <div style={{
        position: 'absolute', left: labelX, top: labelY,
        width: 360,
        fontFamily: FONT_HAND, fontWeight: 700,
        fontSize: 44, lineHeight: 1.05,
        color,
        opacity: labelT,
        transform: `translateX(${(1 - labelT) * -12}px) rotate(-2deg)`,
        textShadow: '0 2px 12px rgba(0,0,0,0.7)',
      }}>
        {label}
      </div>
      {/* Hand-drawn arrow + arrowhead */}
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" style={{
        position: 'absolute', inset: 0, overflow: 'visible',
      }}>
        <path d={pathD}
          stroke={color}
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
          strokeDasharray={pathLen}
          strokeDashoffset={dashOffset}
          style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.6))' }}/>
        <path d={ahA}
          stroke={color}
          strokeWidth="4.5"
          strokeLinecap="round"
          fill="none"
          opacity={headT}
          style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.6))' }}/>
        <path d={ahB}
          stroke={color}
          strokeWidth="4.5"
          strokeLinecap="round"
          fill="none"
          opacity={headT}
          style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.6))' }}/>
      </svg>
    </div>
  );
}

// ── Frame chrome: letterbox, TC, REC indicator, side marks ──────────────────
function Chrome({ section }) {
  const t = useTime();
  const tw = useTweakA();
  const stadium = tw.variant === 'stadium';
  // Blink every ~1s for REC dot
  const blink = Math.floor(t * 2) % 2 === 0;
  const barBg = stadium ? RED : '#000';
  const fgMuted = stadium ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.4)';

  return (
    <React.Fragment>
      {/* Letterbox bars */}
      <div style={{
        position: 'absolute', left: 0, right: 0, top: 0, height: 120,
        background: barBg, zIndex: 10,
      }}/>
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0, height: 120,
        background: barBg, zIndex: 10,
      }}/>

      {/* TC burn-in (top-left, in letterbox) */}
      {tw.showTimecode && (
      <div style={{
        position: 'absolute', top: 44, left: 56, zIndex: 11,
        fontFamily: FONT_MONO, color: WHITE, fontSize: 28, letterSpacing: '0.03em',
        fontWeight: 500, fontVariantNumeric: 'tabular-nums',
        display: 'flex', alignItems: 'center', gap: 16,
      }}>
        <span style={{ color: stadium ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.65)' }}>TC</span>
        <span>{fmtTC(t)}</span>
      </div>
      )}

      {/* REC indicator (top-right, in letterbox) */}
      <div style={{
        position: 'absolute', top: 44, right: 56, zIndex: 11,
        display: 'flex', alignItems: 'center', gap: 12,
        fontFamily: FONT_MONO, color: WHITE, fontSize: 26, letterSpacing: '0.18em',
        fontWeight: 600,
      }}>
        <span style={{
          width: 14, height: 14, borderRadius: '50%',
          background: blink ? RED : 'transparent',
          border: `2px solid ${RED}`,
        }}/>
        <span>REC</span>
      </div>

      {/* Branding mark (bottom-right) */}
      <div style={{
        position: 'absolute', bottom: 44, right: 56, zIndex: 11,
        fontFamily: FONT_MONO, color: stadium ? WHITE : RED_BRIGHT, fontSize: 22, letterSpacing: '0.16em',
        textTransform: 'uppercase', fontWeight: 700,
      }}>
        Athletes Acceleration · {tw.location}
      </div>

      {/* Focus crosshair brackets (corners of the photo area) */}
      <div style={{
        position: 'absolute', top: 140, left: 24, zIndex: 9,
        width: 36, height: 36,
        borderTop: `2px solid ${WHITE}`, borderLeft: `2px solid ${WHITE}`,
      }}/>
      <div style={{
        position: 'absolute', top: 140, right: 24, zIndex: 9,
        width: 36, height: 36,
        borderTop: `2px solid ${WHITE}`, borderRight: `2px solid ${WHITE}`,
      }}/>
      <div style={{
        position: 'absolute', bottom: 140, left: 24, zIndex: 9,
        width: 36, height: 36,
        borderBottom: `2px solid ${WHITE}`, borderLeft: `2px solid ${WHITE}`,
      }}/>
      <div style={{
        position: 'absolute', bottom: 140, right: 24, zIndex: 9,
        width: 36, height: 36,
        borderBottom: `2px solid ${WHITE}`, borderRight: `2px solid ${WHITE}`,
      }}/>
    </React.Fragment>
  );
}

// ── Photo plate with cool-doc grading + slow ken-burns ──────────────────────
function PhotoPlate({ src, focal = 'center', zoomFrom = 1.05, zoomTo = 1.15 }) {
  const { progress } = useSprite();
  const tw = useTweakA();
  const scale = lerp(zoomFrom, zoomTo, progress);

  // STADIUM variant: replace photo with red gradient bleed
  if (tw.variant === 'stadium') {
    return (
      <div style={{ position: 'absolute', inset: 0, zIndex: 1, background: RED }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at 50% 30%, rgba(255,255,255,0.18), transparent 60%)',
        }}/>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'repeating-linear-gradient(135deg, rgba(0,0,0,0.05) 0 16px, transparent 16px 32px)',
        }}/>
        {/* Diagonal banner */}
        <div style={{
          position: 'absolute', left: -100, right: -100, top: '40%',
          height: 120, background: 'rgba(10,11,13,0.92)',
          transform: `rotate(${-6 + progress * 1}deg)`,
          opacity: 0.95,
        }}/>
      </div>
    );
  }
  return (
    <div style={{
      position: 'absolute', inset: 0,
      overflow: 'hidden', background: INK_950, zIndex: 1,
    }}>
      <img src={src} alt="" loading="eager" decoding="sync" style={{
        position: 'absolute', inset: 0,
        width: '100%', height: '100%',
        objectFit: 'cover', objectPosition: focal,
        transform: `scale(${scale})`,
        transformOrigin: 'center',
        filter: 'saturate(0.82) contrast(1.08) brightness(0.92)',
      }}/>
      {/* Cool doc tint */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, rgba(15,22,35,0.18) 0%, rgba(15,22,35,0.32) 100%)',
        mixBlendMode: 'multiply',
      }}/>
      {/* Bottom protect gradient for subtitles */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0, height: '55%',
        background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.78) 100%)',
      }}/>
    </div>
  );
}

// ── Subtitle pull-quote in the lower-third ──────────────────────────────────
function PullQuote({ start, end, children, accent }) {
  return (
    <Sprite start={start} end={end}>
      <PullQuoteInner accent={accent}>{children}</PullQuoteInner>
    </Sprite>
  );
}
function PullQuoteInner({ children, accent }) {
  const { localTime, duration } = useSprite();
  // Tight entrance: 280ms fade up
  const entry = Math.min(1, localTime / 0.28);
  const exit = Math.max(0, 1 - Math.min(1, (duration - localTime) / 0.22));
  const opacity = Math.min(entry, 1 - exit);
  const ty = (1 - entry) * 28 + exit * -12;
  return (
    <div style={{
      position: 'absolute',
      left: 64, right: 64, bottom: 200,
      zIndex: 7,
      opacity, transform: `translateY(${ty}px)`,
      willChange: 'transform, opacity',
    }}>
      {accent && (
        <div style={{
          fontFamily: FONT_MONO, fontSize: 22, letterSpacing: '0.16em',
          color: RED_BRIGHT, textTransform: 'uppercase', fontWeight: 600,
          marginBottom: 14,
        }}>// {accent}</div>
      )}
      <div style={{
        fontFamily: FONT_DISP, textTransform: 'uppercase',
        fontSize: 128, lineHeight: 0.88, color: WHITE,
        letterSpacing: '-0.01em',
        textShadow: '0 4px 24px rgba(0,0,0,0.6)',
      }}>
        {children}
      </div>
    </div>
  );
}

// ── Velocity HUD readout (top-right of the photo area, inside the frame) ────
function VelocityHUD({ start, end, reps }) {
  return (
    <Sprite start={start} end={end}>
      <VelocityHUDInner reps={reps} start={start}/>
    </Sprite>
  );
}
function VelocityHUDInner({ reps, start }) {
  const tw = useTweakA();
  if (!tw.showHUD) return null;
  const t = useTime();
  // Find the currently active rep
  let activeIdx = 0;
  for (let i = 0; i < reps.length; i++) {
    if (t >= start + reps[i].at) activeIdx = i;
  }
  const rep = reps[activeIdx];
  const isLast = activeIdx === reps.length - 1;
  const drop = ((reps[0].v - rep.v) / reps[0].v) * 100;

  // Pulse on rep change
  const sinceRep = t - (start + rep.at);
  const pulse = Math.max(0, 1 - sinceRep * 2);

  return (
    <div style={{
      position: 'absolute', top: 200, right: 64, zIndex: 8,
      width: 360, padding: '22px 24px',
      background: 'rgba(10,11,13,0.82)',
      borderTop: `1px solid ${isLast ? RED : 'rgba(255,255,255,0.18)'}`,
      borderRight: `1px solid ${isLast ? RED : 'rgba(255,255,255,0.18)'}`,
      borderBottom: `1px solid ${isLast ? RED : 'rgba(255,255,255,0.18)'}`,
      borderLeft: `3px solid ${isLast ? RED : RED_BRIGHT}`,
      color: WHITE, fontFamily: FONT_MONO,
      transform: `scale(${1 + pulse * 0.03})`,
      transformOrigin: 'top right',
      backdropFilter: 'blur(6px)',
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontSize: 18, letterSpacing: '0.14em', textTransform: 'uppercase',
        color: 'rgba(255,255,255,0.6)', marginBottom: 10,
      }}>
        <span>Bar Velocity</span>
        <span style={{ color: isLast ? RED : RED_BRIGHT, fontWeight: 600 }}>● LIVE</span>
      </div>
      <div style={{
        fontSize: 84, lineHeight: 1, letterSpacing: '-0.02em',
        fontWeight: 700, fontVariantNumeric: 'tabular-nums',
        color: isLast ? RED : WHITE,
      }}>
        {rep.v.toFixed(2)}
        <span style={{ fontSize: 30, marginLeft: 8, color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>m/s</span>
      </div>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginTop: 14, fontSize: 18, letterSpacing: '0.06em',
      }}>
        <span style={{ color: 'rgba(255,255,255,0.55)' }}>REP {activeIdx + 1}/5</span>
        <span style={{
          color: isLast ? RED : (drop > 8 ? '#f59e0b' : '#15a34a'),
          fontWeight: 600,
        }}>{drop >= 0 ? '−' : '+'}{Math.abs(drop).toFixed(1)}%</span>
      </div>
      {/* Sparkline of completed reps */}
      <div style={{
        marginTop: 14, height: 36,
        position: 'relative',
        borderTop: '1px solid rgba(255,255,255,0.12)',
        paddingTop: 8,
      }}>
        <svg viewBox="0 0 320 28" width="320" height="28" style={{ display: 'block' }}>
          {reps.slice(0, activeIdx + 1).map((r, i, arr) => {
            if (i === 0) return null;
            const x1 = ((i - 1) / (reps.length - 1)) * 320;
            const x2 = (i / (reps.length - 1)) * 320;
            const min = 0.55, max = 0.90;
            const y1 = 28 - ((arr[i - 1].v - min) / (max - min)) * 28;
            const y2 = 28 - ((r.v - min) / (max - min)) * 28;
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
              stroke={i === reps.length - 1 ? RED : WHITE} strokeWidth="2"/>;
          })}
          {reps.slice(0, activeIdx + 1).map((r, i) => {
            const x = (i / (reps.length - 1)) * 320;
            const min = 0.55, max = 0.90;
            const y = 28 - ((r.v - min) / (max - min)) * 28;
            return <circle key={i} cx={x} cy={y} r={3}
              fill={i === activeIdx ? RED : WHITE}/>;
          })}
        </svg>
      </div>
    </div>
  );
}

// ── DROP / END SET overlay flash ────────────────────────────────────────────
function EndSetFlash({ start, end }) {
  return (
    <Sprite start={start} end={end}>
      <EndSetFlashInner/>
    </Sprite>
  );
}
function EndSetFlashInner() {
  const { localTime, duration } = useSprite();
  // Strobe 3x in first 0.6s
  const strobe = localTime < 0.6 ? (Math.floor(localTime * 10) % 2 === 0 ? 1 : 0) : 1;
  const opacity = strobe;
  return (
    <React.Fragment>
      <div style={{
        position: 'absolute', inset: 0, zIndex: 6,
        background: 'rgba(196,20,29,0.18)', opacity,
        pointerEvents: 'none',
      }}/>
      {/* Big stamp */}
      <div style={{
        position: 'absolute', left: 64, top: 700, zIndex: 8,
        opacity,
        transform: `rotate(-3deg)`,
        padding: '22px 32px',
        border: `4px solid ${RED}`,
        background: 'rgba(0,0,0,0.6)',
      }}>
        <div style={{
          fontFamily: FONT_DISP, fontSize: 92, lineHeight: 0.88,
          color: RED, textTransform: 'uppercase', letterSpacing: '-0.005em',
        }}>End Set</div>
        <div style={{
          fontFamily: FONT_MONO, fontSize: 22, color: WHITE,
          letterSpacing: '0.16em', textTransform: 'uppercase', marginTop: 6, fontWeight: 600,
        }}>Drop −13.4% · Threshold met</div>
      </div>
    </React.Fragment>
  );
}

// ── Sprint timer HUD ────────────────────────────────────────────────────────
function SprintHUD({ start, end }) {
  return (
    <Sprite start={start} end={end}>
      <SprintHUDInner start={start}/>
    </Sprite>
  );
}
function SprintHUDInner({ start }) {
  const tw = useTweakA();
  if (!tw.showHUD) return null;
  const t = useTime() - start;
  // Run a timer that counts up to 1.42s in the first ~1.4s, then locks
  const split = Math.min(1.42, t * 0.9);
  const locked = t > 1.6;
  return (
    <div style={{
      position: 'absolute', top: 200, right: 64, zIndex: 8,
      width: 380, padding: '22px 24px',
      background: 'rgba(10,11,13,0.82)',
      borderTop: `1px solid ${locked ? RED : 'rgba(255,255,255,0.18)'}`,
      borderRight: `1px solid ${locked ? RED : 'rgba(255,255,255,0.18)'}`,
      borderBottom: `1px solid ${locked ? RED : 'rgba(255,255,255,0.18)'}`,
      borderLeft: `3px solid ${RED_BRIGHT}`,
      color: WHITE, fontFamily: FONT_MONO,
      backdropFilter: 'blur(6px)',
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontSize: 18, letterSpacing: '0.14em', textTransform: 'uppercase',
        color: 'rgba(255,255,255,0.6)', marginBottom: 10,
      }}>
        <span>10-Yard Split</span>
        <span style={{ color: locked ? RED : RED_BRIGHT, fontWeight: 600 }}>
          {locked ? '◼ LOCKED' : '● LIVE'}
        </span>
      </div>
      <div style={{
        fontSize: 110, lineHeight: 1, letterSpacing: '-0.03em',
        fontWeight: 700, fontVariantNumeric: 'tabular-nums',
        color: locked ? RED : WHITE,
      }}>
        {split.toFixed(2)}<span style={{ fontSize: 36, marginLeft: 8, color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>s</span>
      </div>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginTop: 12, fontSize: 16,
      }}>
        <span style={{ color: 'rgba(255,255,255,0.5)' }}>PR baseline 1.57s</span>
        <span style={{ color: '#15a34a', fontWeight: 600 }}>−0.15s</span>
      </div>
    </div>
  );
}

// ── Section label that slides in from left ─────────────────────────────────
function SectionTitle({ start, end, eyebrow, line1, line2 }) {
  return (
    <Sprite start={start} end={end}>
      <SectionTitleInner eyebrow={eyebrow} line1={line1} line2={line2}/>
    </Sprite>
  );
}
function SectionTitleInner({ eyebrow, line1, line2 }) {
  const { localTime, duration } = useSprite();
  const entry = Math.min(1, localTime / 0.4);
  const exit = Math.max(0, 1 - Math.min(1, (duration - localTime) / 0.3));
  const opacity = Math.min(entry, 1 - exit);
  const tx = (1 - entry) * -40;
  return (
    <div style={{
      position: 'absolute', top: 180, left: 64, zIndex: 7,
      opacity, transform: `translateX(${tx}px)`,
    }}>
      <div style={{
        fontFamily: FONT_MONO, fontSize: 22, letterSpacing: '0.18em',
        color: RED_BRIGHT, fontWeight: 600, textTransform: 'uppercase',
        marginBottom: 12,
      }}>// {eyebrow}</div>
      <div style={{
        fontFamily: FONT_DISP, fontSize: 92, lineHeight: 0.88,
        color: WHITE, textTransform: 'uppercase', letterSpacing: '-0.005em',
        textShadow: '0 4px 24px rgba(0,0,0,0.5)',
      }}>
        {line1}<br/>
        {line2}
      </div>
    </div>
  );
}

// ── Big text takeover for "Train fast. Be fast." ───────────────────────────
function BigTakeover({ start, end }) {
  return (
    <Sprite start={start} end={end}>
      <BigTakeoverInner/>
    </Sprite>
  );
}
function BigTakeoverInner() {
  const tw = useTweakA();
  const stadium = tw.variant === 'stadium';
  const { localTime, duration } = useSprite();
  // Parse tagline into two lines on first ". " or fallback
  const parts = tw.tagline.split(/\.\s+/);
  const line1 = (parts[0] || 'Train fast') + (tw.tagline.includes('.') ? '.' : '');
  const line2 = parts.length > 1 ? (parts.slice(1).join('. ').replace(/\.$/, '') + '.') : '';
  // Two lines stagger in
  const l1 = Math.min(1, localTime / 0.45);
  const l2 = Math.min(1, Math.max(0, (localTime - 0.35) / 0.45));
  const l3 = Math.min(1, Math.max(0, (localTime - 1.0) / 0.4));
  const exit = Math.max(0, 1 - Math.min(1, (duration - localTime) / 0.3));
  const masterOp = 1 - exit;

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 7,
      display: 'flex', flexDirection: 'column', justifyContent: 'center',
      alignItems: 'flex-start',
      padding: '0 64px',
      opacity: masterOp,
    }}>
      <div style={{
        fontFamily: FONT_MONO, fontSize: 22, letterSpacing: '0.18em',
        color: stadium ? WHITE : RED_BRIGHT, fontWeight: 600, textTransform: 'uppercase',
        marginBottom: 36, opacity: l1,
      }}>// The Rule</div>
      <div style={{
        fontFamily: FONT_DISP, fontSize: line1.length > 14 ? 180 : 240, lineHeight: 0.86,
        color: stadium ? 'transparent' : WHITE,
        WebkitTextStroke: stadium ? `3px ${WHITE}` : 'none',
        textTransform: 'uppercase', letterSpacing: '-0.015em',
        opacity: l1, transform: `translateX(${(1-l1) * -30}px)`,
      }}>
        {line1}
      </div>
      {line2 && (
      <div style={{
        fontFamily: FONT_DISP, fontSize: line2.length > 14 ? 180 : 240, lineHeight: 0.86,
        color: stadium ? WHITE : RED, textTransform: 'uppercase', letterSpacing: '-0.015em',
        opacity: l2, transform: `translateX(${(1-l2) * -30}px)`,
        marginTop: 14,
      }}>
        {line2}
      </div>
      )}
      <div style={{
        marginTop: 36, opacity: l3,
        fontFamily: FONT_MONO, fontSize: 28, letterSpacing: '0.18em',
        color: stadium ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.7)', textTransform: 'uppercase', fontWeight: 500,
        borderTop: `2px solid ${stadium ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.3)'}`, paddingTop: 24,
      }}>That's the rule.</div>
    </div>
  );
}

// ── Scene 4 background (variant-aware) ─────────────────────────────────────
function Scene4Background() {
  const tw = useTweakA();
  const stadium = tw.variant === 'stadium';
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 1,
      background: stadium ? RED : INK_950,
    }}>
      {!stadium && (
        <React.Fragment>
          <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(ellipse at 30% 30%, rgba(196,20,29,0.18), transparent 60%)',
          }}/>
          <div style={{
            position: 'absolute', inset: 0,
            background: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.015) 0 2px, transparent 2px 4px)',
            mixBlendMode: 'overlay',
          }}/>
        </React.Fragment>
      )}
      {stadium && (
        <React.Fragment>
          <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(ellipse at 50% 30%, rgba(255,255,255,0.16), transparent 70%)',
          }}/>
          <div style={{
            position: 'absolute', inset: 0,
            background: 'repeating-linear-gradient(135deg, rgba(0,0,0,0.05) 0 16px, transparent 16px 32px)',
          }}/>
        </React.Fragment>
      )}
    </div>
  );
}

// ── End card with logo + CTA + guarantee ────────────────────────────────────
function EndCard({ start, end }) {
  return (
    <Sprite start={start} end={end}>
      <EndCardInner/>
    </Sprite>
  );
}
function EndCardInner() {
  const tw = useTweakA();
  const parts = tw.tagline.split(/\.\s+/);
  const line1 = (parts[0] || 'Train fast') + (tw.tagline.includes('.') ? '.' : '');
  const line2 = parts.length > 1 ? (parts.slice(1).join('. ').replace(/\.$/, '') + '.') : '';
  const { localTime } = useSprite();
  const t1 = clamp01(localTime / 0.45);
  const t2 = clamp01((localTime - 0.6) / 0.45);
  const t3 = clamp01((localTime - 1.3) / 0.4);
  const t4 = clamp01((localTime - 1.9) / 0.5);
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 12,
      background: INK_950,
      display: 'flex', flexDirection: 'column', justifyContent: 'center',
      alignItems: 'center', padding: '0 56px',
    }}>
      <div style={{ opacity: t1, transform: `translateY(${(1-t1)*16}px)`, textAlign: 'center' }}>
        <img src="assets/logo.png" alt="" style={{ height: 220, width: 'auto' }}/>
        <div style={{
          marginTop: 22,
          fontFamily: FONT_MONO, fontSize: 22, letterSpacing: '0.24em',
          color: RED_BRIGHT, textTransform: 'uppercase', fontWeight: 600,
        }}>The Velocity Code</div>
      </div>

      <div style={{
        marginTop: 56, opacity: t2,
        fontFamily: FONT_DISP, fontSize: line1.length > 14 ? 110 : 144, lineHeight: 0.88,
        color: WHITE, textTransform: 'uppercase', letterSpacing: '-0.01em',
        textAlign: 'center',
      }}>
        {line1}{line2 && (<React.Fragment><br/><span style={{ color: RED }}>{line2}</span></React.Fragment>)}
      </div>

      <div style={{
        marginTop: 44, opacity: t3,
        padding: '22px 32px', background: RED,
        fontFamily: FONT_DISP, fontSize: 80, color: WHITE,
        textTransform: 'uppercase', textAlign: 'center', lineHeight: 1,
        boxShadow: '0 12px 32px rgba(196,20,29,0.4)',
      }}>
        Get Faster<br/>Today
      </div>

      <div style={{
        marginTop: 40, opacity: t4,
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
        width: '100%', maxWidth: 880,
        border: `1px solid ${INK_700}`,
      }}>
        {[
          { v: '+1', u: 'mph speed' },
          { v: '+3"', u: 'vertical' },
          { v: '90', u: 'days · or free' },
        ].map((d, i) => (
          <div key={i} style={{
            padding: '18px 14px', textAlign: 'center',
            borderRight: i < 2 ? `1px solid ${INK_700}` : 'none',
          }}>
            <div style={{
              fontFamily: FONT_MONO, fontSize: 52, fontWeight: 700,
              color: WHITE, fontVariantNumeric: 'tabular-nums',
              letterSpacing: '-0.02em',
            }}>{d.v}</div>
            <div style={{
              fontFamily: FONT_MONO, fontSize: 13, letterSpacing: '0.14em',
              color: 'rgba(255,255,255,0.88)', textTransform: 'uppercase',
              marginTop: 6, fontWeight: 600,
            }}>{d.u}</div>
          </div>
        ))}
      </div>
      {/* Locations — solid red band, white text */}
      <div style={{
        position: 'absolute', bottom: 56, left: 28, right: 28, textAlign: 'center',
        opacity: t4,
      }}>
        <div style={{
          fontFamily: FONT_MONO, fontSize: 22, letterSpacing: '0.2em',
          color: RED_BRIGHT, textTransform: 'uppercase', fontWeight: 700,
          marginBottom: 14,
        }}>athletesaccel.com</div>
        <div style={{
          display: 'inline-block',
          padding: '14px 24px',
          background: RED,
          fontFamily: FONT_MONO, fontSize: 18, letterSpacing: '0.22em',
          color: WHITE, textTransform: 'uppercase', fontWeight: 700,
        }}>
          Noblesville · Carmel · Westfield · Indianapolis · Milford
        </div>
      </div>
    </div>
  );
}

// ── Hard-cut white flash transition ────────────────────────────────────────
function CutFlash({ at }) {
  const t = useTime();
  const sinceCut = t - at;
  if (sinceCut < 0 || sinceCut > 0.12) return null;
  const op = sinceCut < 0.04 ? 1 : 1 - (sinceCut - 0.04) / 0.08;
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 20,
      background: WHITE, opacity: Math.max(0, op),
      pointerEvents: 'none',
    }}/>
  );
}

// ── ROOT timeline ──────────────────────────────────────────────────────────
function CreativeA() {
  const t = useTime();
  // Determine section label for chrome
  let section = 'Cold open';
  if (t > 6.1) section = 'Lift · Velocity';
  if (t > 18.0) section = 'Sprint · Split';
  if (t > 32.5) section = 'The Rule';
  if (t > 38.0) section = 'End Card';

  return (
    <React.Fragment>
      {/* ── SCENE 1: COLD OPEN — coach in frame ── */}
      <Sprite start={0} end={6.2}>
        <PhotoPlate src="assets/coach-clap.jpg" focal="50% 30%" zoomFrom={1.04} zoomTo={1.12}/>
      </Sprite>

      <PullQuote start={0.5} end={4.0} accent="The Truth About Youth Sports">
        Most facilities<br/>
        count <span style={{ color: 'rgba(255,255,255,0.55)' }}>reps.</span>
      </PullQuote>

      <PullQuote start={4.0} end={6.2} accent="The Rule">
        We count<br/>
        <span style={{ color: RED_BRIGHT }}>velocity.</span>
      </PullQuote>

      {/* ── SCENE 2: BARBELL LIFT — HUD ticks down ── */}
      <CutFlash at={6.2}/>
      <Sprite start={6.2} end={18.0}>
        <PhotoPlate src="assets/photo-squat.jpg" focal="40% 50%" zoomFrom={1.06} zoomTo={1.16}/>
      </Sprite>

      <VelocityHUD start={6.4} end={17.6} reps={[
        { at: 0.3, v: 0.82 },
        { at: 2.4, v: 0.80 },
        { at: 4.5, v: 0.76 },
        { at: 6.6, v: 0.73 },
        { at: 8.8, v: 0.71 },
      ]}/>

      {/* Hand-drawn callout pointing at the HUD — explains what we're measuring */}
      <Annotation start={8.6} end={14.5}
        label={"velocity tracker\nmeasures bar speed\nevery rep"}
        labelX={90} labelY={560}
        targetX={585} targetY={380}
        color={WHITE}/>

      <PullQuote start={7.0} end={12.5} accent="How We Train">
        Every lift.<br/>
        Every rep.<br/>
        <span style={{ color: RED_BRIGHT }}>measured.</span>
      </PullQuote>

      <EndSetFlash start={15.6} end={18.0}/>

      <PullQuote start={15.7} end={18.0}>
        Drop 10%.<br/>
        <span style={{ color: RED_BRIGHT }}>Set ends.</span>
      </PullQuote>

      {/* ── SCENE 3: SPRINT — split time HUD + parent VO quotes ── */}
      <CutFlash at={18.0}/>
      <Sprite start={18.0} end={32.5}>
        <PhotoPlate src="assets/hero-sprint-male.jpg" focal="55% 50%" zoomFrom={1.05} zoomTo={1.16}/>
      </Sprite>

      <SprintHUD start={18.2} end={32.0}/>

      {/* Hand-drawn callout pointing at the sprint HUD */}
      <Annotation start={19.4} end={24.6}
        label={"laser timing gates\ncaptures every\nyard split"}
        labelX={90} labelY={560}
        targetX={565} targetY={380}
        color={WHITE}/>

      <PullQuote start={18.6} end={22.8} accent="What Parents See">
        Most parents<br/>
        think we go<br/>
        <span style={{ color: 'rgba(255,255,255,0.55)' }}>easy on them.</span>
      </PullQuote>

      <PullQuote start={23.1} end={27.3} accent="The Science">
        Every slow rep<br/>
        teaches their<br/>
        body <span style={{ color: RED_BRIGHT }}>to be slow.</span>
      </PullQuote>

      <PullQuote start={27.6} end={32.4} accent="What's Actually Happening">
        Your athlete isn't<br/>
        here to get tired.<br/>
        <span style={{ color: RED_BRIGHT }}>They're here</span><br/>
        <span style={{ color: RED_BRIGHT }}>to get faster.</span>
      </PullQuote>

      {/* ── SCENE 4: THE RULE — big takeover ── */}
      <CutFlash at={32.5}/>
      <Sprite start={32.5} end={38.0}>
        <Scene4Background/>
      </Sprite>
      <BigTakeover start={32.6} end={38.0}/>

      {/* ── END CARD ── */}
      <CutFlash at={38.0}/>
      <EndCard start={38.0} end={DUR}/>

      {/* Chrome stays through 0–38; suppress during end card */}
      {t < 38.0 && <Chrome section={section}/>}

      {/* TC update label for comment context */}
      <ScreenLabel/>
    </React.Fragment>
  );
}

function ScreenLabel() {
  const t = useTime();
  React.useEffect(() => {
    const sec = Math.floor(t);
    const root = document.querySelector('[data-vid-root]');
    if (root) root.setAttribute('data-screen-label', `creative-a · t=${sec}s`);
  }, [Math.floor(t)]);
  return null;
}

// ── Mount ──────────────────────────────────────────────────────────────────
function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS_A);
  return (
    <TweakCtxA.Provider value={t}>
      <div data-vid-root="A" style={{ position: 'absolute', inset: 0 }}>
        <Stage width={W} height={H} duration={DUR} background={INK_950} persistKey="creative-a">
          <CreativeA/>
          <MusicSync src="audio/unstoppable.mp3" startAt={14.67} volume={0.75} fadeIn={1.2} fadeOut={1.8}/>
        </Stage>
      </div>
      <TweaksPanel title="Creative A · Tweaks">
        <TweakSection label="Visual treatment"/>
        <TweakRadio label="Variant"
          value={t.variant}
          options={['doc', 'stadium']}
          onChange={(v) => setTweak('variant', v)}/>
        <TweakToggle label="Show HUD readouts"
          value={t.showHUD}
          onChange={(v) => setTweak('showHUD', v)}/>
        <TweakToggle label="Show timecode burn-in"
          value={t.showTimecode}
          onChange={(v) => setTweak('showTimecode', v)}/>
        <TweakSection label="Copy"/>
        <TweakText label="Closing tagline"
          value={t.tagline}
          onChange={(v) => setTweak('tagline', v)}/>
        <TweakText label="Location tag"
          value={t.location}
          onChange={(v) => setTweak('location', v)}/>
      </TweaksPanel>
    </TweakCtxA.Provider>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
