// CREATIVE B — "Watch What Happens" — :32 — 9:16 (1080×1920)
// Tech demo. The frame IS the velocity tracker.
// Instrument cluster: status bar, hero m/s readout, threshold gauge, photo viewport,
// sparkline history, drop alarm. The numbers are the protagonist.

const W = 1080;
const H = 1920;
const DUR = 44;

const RED = "#c4141d";
const RED_BRIGHT = "#e02828";
const AMBER = "#f59e0b";
const GREEN = "#15a34a";
const INK_950 = "#0a0b0d";
const INK_900 = "#15171a";
const INK_800 = "#1f2227";
const INK_700 = "#2c3038";
const INK_500 = "#6b727f";
const WHITE = "#ffffff";

const FONT_DISP = '"Anton", "Oswald", "Arial Narrow", system-ui, sans-serif';
const FONT_BODY = '"Geist", "Inter", system-ui, sans-serif';
const FONT_MONO = '"JetBrains Mono", ui-monospace, monospace';

// ── Tweaks ───────────────────────────────────────────────────────────────────
const TWEAK_DEFAULTS_B = /*EDITMODE-BEGIN*/{
  "variant": "cluster",
  "tagline": "Train fast. Be fast.",
  "athleteName": "J. Rivera",
  "athleteAge": 15,
  "showSparkline": true
}/*EDITMODE-END*/;
const TweakCtxB = React.createContext(TWEAK_DEFAULTS_B);
const useTweakB = () => React.useContext(TweakCtxB);
// CRT green palette for terminal variant
const CRT_GREEN = "#50fa7b";
const CRT_GREEN_DIM = "#1f7a3a";
const CRT_BG = "#04140a";
function isTerminal(tw) { return tw.variant === 'terminal'; }

const lerp = (a, b, t) => a + (b - a) * t;
const clamp01 = (v) => Math.max(0, Math.min(1, v));

// The set: 5 reps, dropping
const REPS = [
  { at: 1.0, v: 0.82, state: 'ok' },
  { at: 3.5, v: 0.80, state: 'ok' },
  { at: 6.0, v: 0.76, state: 'ok' },
  { at: 8.5, v: 0.73, state: 'warn' },
  { at: 11.0, v: 0.71, state: 'alarm' },
];
const BASELINE = 0.82;
const SET_START = 5.5;     // rep window starts here
const SET_END = 17.0;       // rep window ends here

function repStateColor(s, alarm = false) {
  if (s === 'alarm' || alarm) return RED;
  if (s === 'warn') return AMBER;
  return GREEN;
}

// ── Top status bar ─────────────────────────────────────────────────────────
function StatusBar() {
  const t = useTime();
  // "Boot" effect — flicker first 0.4s
  const booted = t > 0.4;
  const blink = Math.floor(t * 2) % 2 === 0;
  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, height: 96,
      background: INK_950,
      borderBottom: `1px solid ${INK_700}`,
      display: 'flex', alignItems: 'center',
      padding: '0 28px',
      gap: 20,
      fontFamily: FONT_MONO, color: WHITE, fontSize: 22,
      letterSpacing: '0.08em', textTransform: 'uppercase',
      zIndex: 10,
    }}>
      {/* Brand mark */}
      <div style={{
        fontFamily: FONT_DISP, fontSize: 36, letterSpacing: '0.005em',
        color: RED_BRIGHT, paddingRight: 18, borderRight: `1px solid ${INK_700}`,
      }}>VEL·TRAK</div>
      <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 18 }}>v2.4</div>

      <div style={{ flex: 1 }}/>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 18 }}>
        <span style={{
          width: 10, height: 10, borderRadius: '50%',
          background: booted ? (blink ? RED : RED_BRIGHT) : '#444',
        }}/>
        <span>{booted ? 'LIVE' : 'BOOT…'}</span>
      </div>

      <div style={{ width: 1, height: 36, background: INK_700 }}/>
      <div style={{ fontSize: 18 }}>SET 03 · SQUAT 225</div>
      <div style={{ width: 1, height: 36, background: INK_700 }}/>
      <div style={{ fontSize: 18, color: 'rgba(255,255,255,0.55)' }}>14:32 EST</div>
    </div>
  );
}

// ── Photo viewport (small tile, with scope brackets) ───────────────────────
function PhotoViewport({ src, top = 130, height = 580 }) {
  const t = useTime();
  // Slow scale
  const scale = 1 + (Math.sin(t * 0.5) * 0.01 + (t * 0.003));
  return (
    <div style={{
      position: 'absolute', left: 28, right: 28,
      top, height,
      background: INK_950,
      overflow: 'hidden',
      border: `1px solid ${INK_700}`,
    }}>
      <img src={src} alt="" style={{
        position: 'absolute', inset: 0,
        width: '100%', height: '100%', objectFit: 'cover',
        objectPosition: '40% 50%',
        filter: 'saturate(0.85) contrast(1.06) brightness(0.86)',
        transform: `scale(${scale})`,
        transformOrigin: '40% 50%',
      }}/>
      {/* Dark vignette */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at 40% 50%, transparent 30%, rgba(0,0,0,0.55) 90%)',
      }}/>
      {/* Scope brackets at corners */}
      {['tl', 'tr', 'bl', 'br'].map((p) => (
        <div key={p} style={{
          position: 'absolute',
          ...(p[0] === 't' ? { top: 12 } : { bottom: 12 }),
          ...(p[1] === 'l' ? { left: 12 } : { right: 12 }),
          width: 28, height: 28,
          borderTop: p[0] === 't' ? `2px solid ${RED_BRIGHT}` : 'none',
          borderBottom: p[0] === 'b' ? `2px solid ${RED_BRIGHT}` : 'none',
          borderLeft: p[1] === 'l' ? `2px solid ${RED_BRIGHT}` : 'none',
          borderRight: p[1] === 'r' ? `2px solid ${RED_BRIGHT}` : 'none',
        }}/>
      ))}
      {/* Center crosshair */}
      <div style={{
        position: 'absolute', left: '40%', top: '50%',
        width: 60, height: 60,
        transform: 'translate(-50%, -50%)',
        border: `1px solid ${RED_BRIGHT}`,
        borderRadius: '50%',
      }}>
        <div style={{
          position: 'absolute', left: '50%', top: -16, width: 1, height: 16,
          background: RED_BRIGHT, transform: 'translateX(-50%)',
        }}/>
        <div style={{
          position: 'absolute', left: '50%', bottom: -16, width: 1, height: 16,
          background: RED_BRIGHT, transform: 'translateX(-50%)',
        }}/>
        <div style={{
          position: 'absolute', top: '50%', left: -16, height: 1, width: 16,
          background: RED_BRIGHT, transform: 'translateY(-50%)',
        }}/>
        <div style={{
          position: 'absolute', top: '50%', right: -16, height: 1, width: 16,
          background: RED_BRIGHT, transform: 'translateY(-50%)',
        }}/>
      </div>
      {/* Top-left tag */}
      <div style={{
        position: 'absolute', top: 24, left: 56,
        fontFamily: FONT_MONO, fontSize: 18, letterSpacing: '0.16em',
        color: WHITE, textTransform: 'uppercase', fontWeight: 600,
        background: 'rgba(0,0,0,0.6)', padding: '6px 10px',
      }}>
        INPUT · BAR-MOUNT
      </div>
      <div style={{
        position: 'absolute', top: 24, right: 56,
        fontFamily: FONT_MONO, fontSize: 18, letterSpacing: '0.16em',
        color: RED_BRIGHT, textTransform: 'uppercase', fontWeight: 600,
        background: 'rgba(0,0,0,0.6)', padding: '6px 10px',
      }}>
        ● TRACKING
      </div>
    </div>
  );
}

// ── HERO velocity readout panel ────────────────────────────────────────────
function HeroReadout({ top, height, currentRep, currentValue, state, totalReps, drop, repIdx }) {
  const t = useTime();
  // Pulse on rep change
  const pulse = state === 'idle' ? 0 : 0; // animated outside
  const isAlarm = state === 'alarm';
  const isWarn = state === 'warn';
  const accent = isAlarm ? RED : isWarn ? AMBER : GREEN;
  const valueColor = isAlarm ? RED : WHITE;
  // Threshold bar
  const dropPct = clamp01(drop / 15); // 15% as full scale
  return (
    <div style={{
      position: 'absolute', left: 28, right: 28, top, height,
      background: INK_900, border: `1px solid ${INK_700}`,
      padding: '28px 32px',
      display: 'flex', flexDirection: 'column',
      color: WHITE, fontFamily: FONT_MONO,
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div style={{
          fontSize: 22, letterSpacing: '0.16em', textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.55)',
        }}>Bar Velocity · m/s</div>
        <div style={{
          fontSize: 18, letterSpacing: '0.14em', textTransform: 'uppercase',
          color: accent, fontWeight: 600,
        }}>{state.toUpperCase()}</div>
      </div>
      {/* THE NUMBER */}
      <div style={{
        marginTop: 8,
        fontSize: 360, lineHeight: 0.88, letterSpacing: '-0.04em',
        fontWeight: 700, fontVariantNumeric: 'tabular-nums',
        color: valueColor,
      }}>
        {currentValue.toFixed(2)}
      </div>
      {/* Below */}
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        marginTop: 4, alignItems: 'flex-end',
      }}>
        <div>
          <div style={{
            fontSize: 16, letterSpacing: '0.14em',
            color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase',
          }}>Rep</div>
          <div style={{
            fontSize: 64, fontWeight: 700, marginTop: 2,
            color: WHITE, fontVariantNumeric: 'tabular-nums',
            letterSpacing: '-0.02em',
          }}>{repIdx + 1}<span style={{
            fontSize: 28, color: 'rgba(255,255,255,0.4)', marginLeft: 4,
          }}>/ {totalReps}</span></div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{
            fontSize: 16, letterSpacing: '0.14em',
            color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase',
          }}>Δ vs Rep 1</div>
          <div style={{
            fontSize: 64, fontWeight: 700, marginTop: 2,
            color: accent, fontVariantNumeric: 'tabular-nums',
            letterSpacing: '-0.02em',
          }}>{drop > 0 ? '−' : '+'}{Math.abs(drop).toFixed(1)}%</div>
        </div>
      </div>
      {/* Threshold gauge */}
      <div style={{ marginTop: 18 }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          fontSize: 14, letterSpacing: '0.14em', textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.45)', marginBottom: 8,
        }}>
          <span>0%</span>
          <span style={{ color: RED, fontWeight: 600 }}>−10% End Set</span>
          <span>−15%</span>
        </div>
        <div style={{
          position: 'relative', height: 14,
          background: INK_700, overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', left: 0, top: 0, bottom: 0,
            width: `${dropPct * 100}%`,
            background: `linear-gradient(90deg, ${GREEN}, ${AMBER}, ${RED})`,
            transition: 'width 220ms cubic-bezier(0.2,0.7,0.2,1)',
          }}/>
          {/* Threshold tick at 10/15 = 66.67% */}
          <div style={{
            position: 'absolute', left: '66.67%', top: -4, bottom: -4,
            width: 2, background: RED,
          }}/>
        </div>
      </div>
    </div>
  );
}

// ── Sparkline history panel ───────────────────────────────────────────────
function HistoryPanel({ top, height, reps, activeIdx }) {
  const visible = reps.slice(0, activeIdx + 1);
  const w = 1080 - 56 - 64;
  return (
    <div style={{
      position: 'absolute', left: 28, right: 28, top, height,
      background: INK_900, border: `1px solid ${INK_700}`,
      padding: '24px 32px', color: WHITE, fontFamily: FONT_MONO,
      overflow: 'hidden',
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
      }}>
        <div style={{
          fontSize: 22, letterSpacing: '0.16em', textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.55)',
        }}>Set History · 5-rep</div>
        <div style={{
          fontSize: 16, letterSpacing: '0.14em', textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.4)',
        }}>m/s</div>
      </div>
      {/* Graph */}
      <div style={{ marginTop: 16, position: 'relative', height: height - 90 }}>
        <svg viewBox={`0 0 ${w} ${height - 90}`} width="100%" height={height - 90} preserveAspectRatio="none">
          {/* Threshold line at -10% from BASELINE = 0.738 */}
          <line x1={0} y1={mapY(0.738, height - 90)} x2={w} y2={mapY(0.738, height - 90)}
            stroke={RED} strokeDasharray="6 6" strokeWidth="1.5" opacity="0.6"/>
          <text x={w - 8} y={mapY(0.738, height - 90) - 8} fill={RED}
            fontFamily={FONT_MONO} fontSize="16" textAnchor="end" letterSpacing="0.1em">
            −10% THRESHOLD
          </text>
          {/* Lines */}
          {visible.map((r, i, arr) => {
            if (i === 0) return null;
            const x1 = ((i - 1) / (REPS.length - 1)) * w;
            const x2 = (i / (REPS.length - 1)) * w;
            const y1 = mapY(arr[i - 1].v, height - 90);
            const y2 = mapY(r.v, height - 90);
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
              stroke={r.state === 'alarm' ? RED : WHITE} strokeWidth="3"/>;
          })}
          {/* Dots */}
          {visible.map((r, i) => {
            const x = (i / (REPS.length - 1)) * w;
            const y = mapY(r.v, height - 90);
            const color = repStateColor(r.state);
            return (
              <g key={i}>
                <circle cx={x} cy={y} r={i === activeIdx ? 12 : 7}
                  fill={color}/>
                {i === activeIdx && (
                  <circle cx={x} cy={y} r={20} fill="none" stroke={color} strokeWidth="2" opacity="0.5"/>
                )}
                <text x={x} y={y - 22} fill={WHITE}
                  fontFamily={FONT_MONO} fontSize="20" fontWeight="700" textAnchor="middle"
                  style={{ fontVariantNumeric: 'tabular-nums' }}>{r.v.toFixed(2)}</text>
                <text x={x} y={mapY(0.55, height - 90) + 26} fill="rgba(255,255,255,0.5)"
                  fontFamily={FONT_MONO} fontSize="14" textAnchor="middle" letterSpacing="0.1em">
                  R{i + 1}
                </text>
              </g>
            );
          })}
          {/* Future rep ghosts */}
          {reps.slice(activeIdx + 1).map((r, ii) => {
            const i = activeIdx + 1 + ii;
            const x = (i / (REPS.length - 1)) * w;
            return (
              <g key={`g${i}`}>
                <circle cx={x} cy={mapY(0.78, height - 90)} r={5} fill="rgba(255,255,255,0.12)"/>
                <text x={x} y={mapY(0.55, height - 90) + 26} fill="rgba(255,255,255,0.25)"
                  fontFamily={FONT_MONO} fontSize="14" textAnchor="middle" letterSpacing="0.1em">
                  R{i + 1}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
  function mapY(v, h) {
    const min = 0.55, max = 0.90;
    return h - ((v - min) / (max - min)) * h * 0.78 - 16;
  }
}

// ── Big mono caption strip ────────────────────────────────────────────────
function MonoCaption({ start, end, text, accent }) {
  return (
    <Sprite start={start} end={end}>
      <MonoCaptionInner text={text} accent={accent}/>
    </Sprite>
  );
}
function MonoCaptionInner({ text, accent }) {
  const { localTime, duration } = useSprite();
  const entry = clamp01(localTime / 0.2);
  const exit = clamp01(1 - clamp01((duration - localTime) / 0.18));
  const op = Math.min(entry, 1 - exit);
  return (
    <div style={{
      position: 'absolute', left: 28, right: 28, top: 600,
      background: 'rgba(10,11,13,0.96)',
      border: `1px solid ${accent || RED}`,
      borderLeft: `4px solid ${accent || RED}`,
      padding: '18px 24px',
      fontFamily: FONT_MONO, color: WHITE,
      fontSize: 34, letterSpacing: '0.04em', lineHeight: 1.2,
      textTransform: 'uppercase', fontWeight: 700,
      opacity: op, transform: `translateY(${(1-entry) * 16 + exit * -10}px)`,
      zIndex: 8,
      boxShadow: '0 12px 32px rgba(0,0,0,0.45)',
    }}>
      <span style={{ color: accent || RED }}>{">"} </span>{text}
    </div>
  );
}

// ── Cold open: "Watch the number." ────────────────────────────────────────
function ColdOpen({ start, end }) {
  return (
    <Sprite start={start} end={end}>
      <ColdOpenInner/>
    </Sprite>
  );
}
function ColdOpenInner() {
  const { localTime, duration } = useSprite();
  const fadeIn = clamp01(localTime / 0.6);
  const fadeOut = clamp01(1 - clamp01((duration - localTime) / 0.5));
  const op = Math.min(fadeIn, 1 - fadeOut);
  // Cursor blink
  const cursorOn = Math.floor(localTime * 2) % 2 === 0;
  // Slow ken-burns scale on background photo
  const bgScale = 1.05 + (localTime / duration) * 0.06;
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 10,
      background: INK_950,
      opacity: op,
    }}>
      {/* Full-bleed sprint photo behind the headline */}
      <div style={{
        position: 'absolute', inset: 0, overflow: 'hidden',
      }}>
        <img src="assets/sprint-shredmill.jpg" alt="" loading="eager" decoding="sync" style={{
          position: 'absolute', inset: 0,
          width: '100%', height: '100%', objectFit: 'cover',
          objectPosition: '50% 50%',
          transform: `scale(${bgScale})`,
          transformOrigin: 'center',
          filter: 'saturate(0.85) contrast(1.15) brightness(0.6)',
        }}/>
        {/* Dark vignette for text legibility */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, rgba(10,11,13,0.55) 0%, rgba(10,11,13,0.35) 40%, rgba(10,11,13,0.85) 100%)',
        }}/>
      </div>

      {/* Headline */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        alignItems: 'flex-start', padding: '0 56px',
      }}>
        <div style={{
          fontFamily: FONT_DISP, fontSize: 192, lineHeight: 0.86,
          color: WHITE, textTransform: 'uppercase', letterSpacing: '-0.015em',
          textShadow: '0 6px 24px rgba(0,0,0,0.7)',
        }}>
          This is<br/>
          why you<br/>
          <span style={{ color: RED }}>lift fast.</span>
          <span style={{
            display: 'inline-block', width: 32, height: 180,
            background: cursorOn ? RED : 'transparent',
            marginLeft: 12, verticalAlign: 'top',
          }}/>
        </div>
      </div>
    </div>
  );
}

// ── Alarm flash overlay when rep 5 drops below threshold ─────────────────
function AlarmFlash({ start, end }) {
  return (
    <Sprite start={start} end={end}>
      <AlarmFlashInner/>
    </Sprite>
  );
}
function AlarmFlashInner() {
  const { localTime } = useSprite();
  // Strobe red 4x in first 0.6s
  const strobe = localTime < 0.6 ? (Math.floor(localTime * 14) % 2 === 0 ? 1 : 0) : 1;
  return (
    <React.Fragment>
      {/* Red border edge alert */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 9,
        boxShadow: `inset 0 0 0 12px ${RED}`,
        opacity: strobe, pointerEvents: 'none',
      }}/>
      {/* Center stamp */}
      <div style={{
        position: 'absolute', left: 0, right: 0,
        top: 1180,
        textAlign: 'center', zIndex: 11,
        opacity: strobe,
      }}>
        <div style={{
          display: 'inline-block',
          padding: '24px 48px',
          background: RED,
          fontFamily: FONT_DISP, fontSize: 140, lineHeight: 0.86,
          color: WHITE, textTransform: 'uppercase', letterSpacing: '-0.01em',
          transform: 'rotate(-1.5deg)',
        }}>
          End Set
        </div>
      </div>
    </React.Fragment>
  );
}

// ── Coach explanation card (15-25s) ──────────────────────────────────────
function CoachExplain({ start, end }) {
  return (
    <Sprite start={start} end={end}>
      <CoachExplainInner/>
    </Sprite>
  );
}
function CoachExplainInner() {
  const { localTime, duration } = useSprite();
  const photoIn = clamp01(localTime / 0.4);
  const t1 = clamp01(localTime / 0.5);
  const t2 = clamp01((localTime - 2.5) / 0.4);
  const t3 = clamp01((localTime - 5.5) / 0.4);
  const fadeOut = clamp01(1 - clamp01((duration - localTime) / 0.4));
  const op = 1 - fadeOut;

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 8,
      background: INK_950, opacity: op,
    }}>
      {/* Photo at top, ~half height */}
      <div style={{
        position: 'absolute', left: 0, right: 0, top: 0, height: 820,
        overflow: 'hidden',
        opacity: photoIn,
      }}>
        <img src="assets/coach-explain.jpg" alt="" loading="eager" decoding="sync" style={{
          width: '100%', height: '100%', objectFit: 'cover',
          objectPosition: '50% 45%',
          filter: 'saturate(0.88) contrast(1.1) brightness(0.85)',
          transform: `scale(${1.05 + photoIn * 0.04})`, transformOrigin: 'center',
        }}/>
        <div style={{
          position: 'absolute', left: 0, right: 0, bottom: 0, height: '55%',
          background: 'linear-gradient(180deg, transparent, rgba(10,11,13,1))',
        }}/>
      </div>

      {/* Caption stack — bottom half, moved up since lower-third is removed */}
      <div style={{
        position: 'absolute', left: 56, right: 56, top: 820,
      }}>
        <div style={{
          fontFamily: FONT_MONO, fontSize: 24, letterSpacing: '0.18em',
          color: RED_BRIGHT, textTransform: 'uppercase', fontWeight: 700,
          marginBottom: 32, opacity: t1,
        }}>// why we end the set</div>

        <div style={{
          fontFamily: FONT_DISP, fontSize: 144, lineHeight: 0.88,
          color: WHITE, textTransform: 'uppercase', letterSpacing: '-0.01em',
          opacity: t1, transform: `translateY(${(1-t1) * 24}px)`,
          marginBottom: 40,
        }}>
          Every rep<br/>
          below the zone<br/>
          teaches the<br/>
          nervous system<br/>
          <span style={{ color: RED }}>to fire slow.</span>
        </div>

        {/* Make this stand out — bumped color/size and added red accent bar */}
        <div style={{
          opacity: t3, marginTop: 28,
          borderLeft: `4px solid ${RED}`,
          paddingLeft: 22,
          fontFamily: FONT_MONO, fontSize: 30,
          color: WHITE,
          letterSpacing: '0.04em', textTransform: 'uppercase', fontWeight: 700,
          lineHeight: 1.3,
        }}>
          Most kids spend their entire career<br/>
          below their power zone.<br/>
          <span style={{ color: RED_BRIGHT }}>That's why they plateau.</span>
        </div>
      </div>
    </div>
  );
}

// ── End takeover ────────────────────────────────────────────────────────
function EndTakeover({ start, end }) {
  return (
    <Sprite start={start} end={end}>
      <EndTakeoverInner/>
    </Sprite>
  );
}
function EndTakeoverInner() {
  const tw = useTweakB();
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

// ── ROOT ────────────────────────────────────────────────────────────────
function CreativeB() {
  const tw = useTweakB();
  const t = useTime();
  const terminal = isTerminal(tw);

  // Phase: 0-3.5 cold open, 3.5-14 instrument cluster (5 reps), 14-15.5 alarm hold,
  //         15.5-26 coach explain, 26-32 end takeover.

  // Compute current active rep within instrument-cluster window
  let activeIdx = 0;
  for (let i = 0; i < REPS.length; i++) {
    if (t - SET_START >= REPS[i].at) activeIdx = i;
  }
  // Animate value smoothly from previous to current as well as pop on rep
  let displayValue;
  if (t < SET_START + REPS[0].at) {
    displayValue = 0;
  } else if (activeIdx < REPS.length - 1) {
    // hold at current rep value
    displayValue = REPS[activeIdx].v;
  } else {
    displayValue = REPS[activeIdx].v;
  }
  // Pop on rep: scale from 1.06 -> 1.0 quickly
  const sinceRep = t - (SET_START + REPS[activeIdx].at);
  const pop = sinceRep < 0.35 ? Math.max(0, 1 - sinceRep / 0.35) : 0;
  const state = REPS[activeIdx].state;
  const drop = ((BASELINE - REPS[activeIdx].v) / BASELINE) * 100;

  return (
    <div style={{
      position: 'absolute', inset: 0,
      filter: terminal ? 'sepia(1) hue-rotate(70deg) saturate(2.4) contrast(1.05)' : 'none',
    }}>
      {/* Always-on background */}
      <div style={{ position: 'absolute', inset: 0, background: terminal ? CRT_BG : INK_950 }}/>

      {/* COLD OPEN */}
      <ColdOpen start={0} end={5.5}/>

      {/* INSTRUMENT CLUSTER 5.5–22s */}
      <Sprite start={5.5} end={22.0}>
        <StatusBar/>
        <PhotoViewport src="assets/photo-squat.jpg" top={130} height={540}/>
        <div style={{
          position: 'absolute', left: 28, right: 28, top: 700,
          height: 740,
          transform: `scale(${1 + pop * 0.018})`,
          transformOrigin: 'center top',
        }}>
          <HeroReadout top={0} height={740}
            currentRep={activeIdx + 1}
            currentValue={displayValue}
            state={state}
            totalReps={5}
            drop={drop}
            repIdx={activeIdx}/>
        </div>
        <HistoryPanel top={1460} height={380} reps={REPS} activeIdx={activeIdx}/>
        <div style={{
          position: 'absolute', left: 28, right: 28, bottom: 0, height: 60,
          background: INK_950, borderTop: `1px solid ${INK_700}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 24px',
          fontFamily: FONT_MONO, fontSize: 16, letterSpacing: '0.14em',
          color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase',
        }}>
          <span>ATHLETE · {tw.athleteName} · AGE {tw.athleteAge}</span>
          <span style={{ color: RED_BRIGHT }}>● 30HZ TELEMETRY</span>
        </div>
      </Sprite>

      {/* Captions over the instrument cluster. Coach VO counts the visible reps 3, 4, 5. */}
      <MonoCaption start={11.7} end={13.4} text="Three…"/>
      <MonoCaption start={14.2} end={15.9} text="Four…"/>
      <MonoCaption start={16.7} end={18.3} text="Five."/>
      <MonoCaption start={18.4} end={20.5} text="Drop −10%. End the set." accent={RED}/>
      <MonoCaption start={20.6} end={22.0} text="Most facilities never see this." accent={AMBER}/>

      {/* Alarm flash at rep 5 hits */}
      <AlarmFlash start={16.5} end={22.0}/>

      {/* COACH EXPLAINS 22–36s */}
      <CoachExplain start={22.0} end={36.0}/>

      {/* END TAKEOVER 36–44 */}
      <EndTakeover start={36.0} end={DUR}/>

      {/* Terminal scan lines overlay (applied AFTER filter so it doesn't get tinted twice) */}
      {terminal && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 200,
          background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.18) 0 2px, transparent 2px 4px)',
          pointerEvents: 'none',
        }}/>
      )}
      {terminal && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 201,
          background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.55) 100%)',
          pointerEvents: 'none',
        }}/>
      )}

      <ScreenLabel/>
    </div>
  );
}

function ScreenLabel() {
  const t = useTime();
  React.useEffect(() => {
    const sec = Math.floor(t);
    const root = document.querySelector('[data-vid-root]');
    if (root) root.setAttribute('data-screen-label', `creative-b · t=${sec}s`);
  }, [Math.floor(t)]);
  return null;
}

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS_B);
  return (
    <TweakCtxB.Provider value={t}>
      <div data-vid-root="B" style={{ position: 'absolute', inset: 0 }}>
        <Stage width={W} height={H} duration={DUR} background={INK_950} persistKey="creative-b">
          <CreativeB/>
          <MusicSync src="audio/dark-star.mp3" startAt={0.00} volume={0.7} fadeIn={1.0} fadeOut={1.8}/>
        </Stage>
      </div>
      <TweaksPanel title="Creative B · Tweaks">
        <TweakSection label="Visual treatment"/>
        <TweakRadio label="Variant"
          value={t.variant}
          options={['cluster', 'terminal']}
          onChange={(v) => setTweak('variant', v)}/>
        <TweakToggle label="Show sparkline"
          value={t.showSparkline}
          onChange={(v) => setTweak('showSparkline', v)}/>
        <TweakSection label="Copy"/>
        <TweakText label="Athlete name"
          value={t.athleteName}
          onChange={(v) => setTweak('athleteName', v)}/>
        <TweakNumber label="Athlete age"
          value={t.athleteAge}
          min={8} max={18} step={1}
          onChange={(v) => setTweak('athleteAge', v)}/>
        <TweakText label="Closing tagline"
          value={t.tagline}
          onChange={(v) => setTweak('tagline', v)}/>
      </TweaksPanel>
    </TweakCtxB.Provider>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
