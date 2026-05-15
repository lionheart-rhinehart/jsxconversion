// variation-d.jsx — STADIUM / SCOREBOARD
// Sports-broadcast HUD aesthetic on black. Stat bars for STRENGTH, SPEED, then
// CONFIDENCE literally bursts off the chart (visual punchline).
// 10s · brand palette: black, white, AA red.

const VD_W = 1080, VD_H = 1920;
const VD_RED = '#d72020';
const VD_RED_HOT = '#ff3838';
const VD_INK = '#f4f1ec';
const VD_DIM = 'rgba(244,241,236,0.5)';

// Black bg with subtle scanlines + faint stadium glow
function VDBg() {
  const t = useTime();
  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: `
        radial-gradient(70% 60% at 50% 30%, rgba(215,32,32,0.12) 0%, transparent 65%),
        radial-gradient(80% 50% at 50% 100%, rgba(215,32,32,0.08) 0%, transparent 60%),
        #0a0707
      `,
    }}>
      {/* scanlines */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `repeating-linear-gradient(0deg, rgba(255,255,255,0.02) 0 1px, transparent 1px 3px)`,
        pointerEvents: 'none',
      }}/>
      {/* subtle vignette */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(100% 80% at 50% 50%, transparent 50%, rgba(0,0,0,0.7) 100%)`,
        pointerEvents: 'none',
      }}/>
    </div>
  );
}

// HUD chrome — corner brackets + top/bottom chyron strips
function VDChrome() {
  const t = useTime();
  const inP = clamp(t / 0.8, 0, 1);
  const inE = Easing.easeOutCubic(inP);

  const Bracket = ({ corner }) => {
    const positions = {
      tl: { top: 60, left: 60, rotate: 0 },
      tr: { top: 60, right: 60, rotate: 90 },
      br: { bottom: 60, right: 60, rotate: 180 },
      bl: { bottom: 60, left: 60, rotate: 270 },
    };
    const p = positions[corner];
    return (
      <div style={{
        position: 'absolute', ...p,
        transform: `rotate(${p.rotate}deg) scale(${inE})`,
        opacity: inE,
        transformOrigin: 'center',
      }}>
        <svg width="50" height="50" viewBox="0 0 50 50">
          <path d="M 4 20 L 4 4 L 20 4" stroke={VD_RED} strokeWidth="3" fill="none" strokeLinecap="square"/>
        </svg>
      </div>
    );
  };

  return (
    <>
      <Bracket corner="tl"/>
      <Bracket corner="tr"/>
      <Bracket corner="br"/>
      <Bracket corner="bl"/>

      {/* top chyron */}
      <div style={{
        position: 'absolute', left: 80, right: 80, top: 90,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 22,
        letterSpacing: '0.28em',
        textTransform: 'uppercase',
        fontWeight: 600,
        opacity: inE,
      }}>
        <div style={{ color: VD_RED, display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{
            width: 12, height: 12, borderRadius: 6, background: VD_RED,
            boxShadow: `0 0 12px ${VD_RED}`,
            animation: 'vd-blink 1.2s infinite',
          }}/>
          REC · Live
        </div>
        <div style={{ color: VD_INK }}>
          AA · Case Nº 01
        </div>
      </div>

      {/* bottom progress ticker */}
      <div style={{
        position: 'absolute', left: 80, right: 80, bottom: 110,
        display: 'flex', alignItems: 'center', gap: 24,
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 22,
        color: VD_DIM,
        letterSpacing: '0.2em',
        textTransform: 'uppercase',
        fontWeight: 600,
        opacity: inE,
      }}>
        <div>13 y/o athlete</div>
        <div style={{ flex: 1, height: 2, background: 'rgba(244,241,236,0.15)', position: 'relative' }}>
          <div style={{
            position: 'absolute', left: 0, top: 0, bottom: 0,
            width: `${(t / 10) * 100}%`, background: VD_RED,
          }}/>
        </div>
        <div style={{ color: VD_RED }}>{`T+${t.toFixed(1)}s`.padStart(7, ' ')}</div>
      </div>

      {/* blink keyframes */}
      <style>{`@keyframes vd-blink { 0%, 100% { opacity: 1 } 50% { opacity: 0.3 } }`}</style>
    </>
  );
}

// Header title for the 'progress report'
function VDHeader() {
  const t = useTime();
  const startT = 0.4;
  const exitT = 8.6;
  const p = clamp((t - startT) / 0.7, 0, 1);
  const e = Easing.easeOutCubic(p);
  const exitP = clamp((t - exitT) / 0.4, 0, 1);
  return (
    <div style={{
      position: 'absolute',
      left: 0, right: 0, top: 200,
      textAlign: 'center',
      opacity: e * (1 - exitP),
      transform: `translateY(${(1 - e) * -20}px)`,
    }}>
      <div style={{
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 26,
        color: VD_RED,
        letterSpacing: '0.42em',
        textTransform: 'uppercase',
        fontWeight: 600,
        marginBottom: 16,
      }}>
        ── Progress Report ──
      </div>
      <div style={{
        fontFamily: 'Anton, sans-serif',
        fontSize: 130,
        color: VD_INK,
        letterSpacing: '-0.01em',
        lineHeight: 0.92,
        textTransform: 'uppercase',
      }}>
        2 Months in.
      </div>
      <div style={{
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 24,
        color: VD_DIM,
        letterSpacing: '0.28em',
        textTransform: 'uppercase',
        marginTop: 16,
        fontWeight: 500,
      }}>
        4 days / week · all summer
      </div>
    </div>
  );
}

// One stat bar — label, animated fill, ticking counter
function VDStat({ label, value, startT, fillEnd, color = VD_RED, burst = false, y }) {
  const t = useTime();
  const labelP = clamp((t - startT) / 0.4, 0, 1);
  const labelE = Easing.easeOutCubic(labelP);

  // bar fills over 0.9s after label appears
  const barStart = startT + 0.25;
  const barDur = 0.9;
  const barP = clamp((t - barStart) / barDur, 0, 1);
  const barE = Easing.easeOutQuart(barP);

  // For the "burst" stat (confidence), the bar overshoots and breaks the frame
  // visual: fill goes past 100% and a "MAX" indicator flashes
  const burstP = burst ? clamp((t - (barStart + barDur)) / 0.45, 0, 1) : 0;
  const burstE = Easing.easeOutBack(burstP);

  // Counter ticks up from 0 to value during the bar animation
  const counter = Math.floor(barE * value);

  // Exit (only for non-burst stats — strength and speed fade out before confidence finale)
  const exitT = burst ? 9.6 : 4.0; // burst holds till outro; non-burst exits when next stat starts
  const exitP = clamp((t - exitT) / 0.5, 0, 1);
  const exitE = Easing.easeInQuad(exitP);

  const fillPct = burst
    ? barE * 100 + burstE * 40 // overshoots past 100%
    : barE * fillEnd;

  if (labelP === 0) return null;

  return (
    <div style={{
      position: 'absolute',
      left: 90, right: 90,
      top: y,
      opacity: labelE * (1 - exitE),
      transform: `translateY(${(1 - labelE) * 20}px)`,
    }}>
      {/* label row */}
      <div style={{
        display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
        marginBottom: 18,
      }}>
        <div style={{
          fontFamily: 'Anton, sans-serif',
          fontSize: burst ? 110 : 84,
          color: burst ? color : VD_INK,
          letterSpacing: '0.02em',
          textTransform: 'uppercase',
          lineHeight: 1,
        }}>
          {label}
        </div>
        <div style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: burst ? 80 : 64,
          color: color,
          fontWeight: 700,
          letterSpacing: '-0.01em',
        }}>
          {burst && burstP > 0.3
            ? '∞'
            : `+${counter}${typeof value === 'number' && !burst ? '%' : ''}`}
        </div>
      </div>

      {/* bar track */}
      <div style={{
        position: 'relative',
        height: burst ? 36 : 28,
        background: 'rgba(244,241,236,0.1)',
        border: '1px solid rgba(244,241,236,0.2)',
        overflow: burst ? 'visible' : 'hidden',
      }}>
        {/* fill */}
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0,
          width: `${Math.min(fillPct, 100)}%`,
          background: `linear-gradient(90deg, ${color} 0%, ${VD_RED_HOT} 100%)`,
          boxShadow: `0 0 20px ${color}99`,
        }}/>
        {/* tick marks */}
        {[25, 50, 75].map(p => (
          <div key={p} style={{
            position: 'absolute', left: `${p}%`, top: 4, bottom: 4,
            width: 1, background: 'rgba(244,241,236,0.2)',
          }}/>
        ))}
        {/* burst overflow — bar continues past the edge with arrow */}
        {burst && burstP > 0 && (
          <>
            <div style={{
              position: 'absolute',
              left: '100%', top: 0, bottom: 0,
              width: burstE * 80,
              background: `linear-gradient(90deg, ${VD_RED_HOT}, ${VD_RED_HOT}aa, transparent)`,
              boxShadow: `0 0 30px ${VD_RED_HOT}`,
            }}/>
            <div style={{
              position: 'absolute',
              left: 'calc(100% + 80px)', top: '50%',
              transform: `translateY(-50%) translateX(${(1 - burstE) * -20}px)`,
              opacity: burstE,
              fontFamily: 'Anton, sans-serif',
              fontSize: 44,
              color: VD_RED_HOT,
              textShadow: `0 0 20px ${VD_RED_HOT}`,
              letterSpacing: '0.04em',
              whiteSpace: 'nowrap',
            }}>
              MAX →
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Final big hero — "OFF THE CHARTS." takes over
function VDHero() {
  const t = useTime();
  const startT = 7.0;
  const exitT = 9.3;
  const p = clamp((t - startT) / 0.55, 0, 1);
  const e = Easing.easeOutBack(p);
  const exitP = clamp((t - exitT) / 0.4, 0, 1);

  // shake on entry
  const shake = clamp((1 - (t - startT) / 0.4), 0, 1);
  const shx = Math.sin((t - startT) * 90) * shake * 5;
  const shy = Math.cos((t - startT) * 80) * shake * 4;

  if (p === 0) return null;

  return (
    <div style={{
      position: 'absolute',
      left: 0, right: 0, top: 1320,
      textAlign: 'center',
      opacity: e * (1 - exitP),
      transform: `translateY(${(1 - e) * 30}px) translate(${shx}px, ${shy}px)`,
    }}>
      <div style={{
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 30,
        color: VD_INK,
        letterSpacing: '0.42em',
        textTransform: 'uppercase',
        marginBottom: 22,
        fontWeight: 600,
      }}>
        His confidence is
      </div>
      <div style={{
        fontFamily: 'Anton, sans-serif',
        fontSize: 200,
        color: VD_RED,
        letterSpacing: '-0.01em',
        lineHeight: 0.9,
        textTransform: 'uppercase',
        textShadow: `0 0 60px ${VD_RED}aa, 0 0 120px ${VD_RED}55`,
      }}>
        Off the<br/>Charts.
      </div>
    </div>
  );
}

// Outro
function VDOutro() {
  const t = useTime();
  const startT = 9.0;
  const p = clamp((t - startT) / 0.7, 0, 1);
  const e = Easing.easeOutCubic(p);
  if (p === 0) return null;
  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      opacity: e,
      background: 'rgba(10,7,7,0.92)',
      backdropFilter: 'blur(4px)',
    }}>
      <img src="assets/logo.png" style={{
        width: 520, height: 520, objectFit: 'contain',
        filter: 'drop-shadow(0 0 60px rgba(215,32,32,0.5))',
        transform: `scale(${0.9 + 0.1 * e})`,
      }}/>
      <div style={{
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 28,
        color: VD_RED,
        marginTop: 16,
        letterSpacing: '0.3em',
        textTransform: 'uppercase',
        fontWeight: 600,
      }}>
        @athletes_acceleration
      </div>
    </div>
  );
}

function VariationD() {
  return (
    <Stage width={VD_W} height={VD_H} duration={10} background="#0a0707" persistKey="aa-vd">
      <VDBg/>
      <VDChrome/>
      <VDHeader/>

      {/* Three stacked stat bars */}
      <VDStat label="Strength" value={38} startT={2.0} fillEnd={78} y={720}/>
      <VDStat label="Speed"    value={42} startT={3.4} fillEnd={82} y={870}/>
      <VDStat label="Confidence" value={99} startT={5.0} fillEnd={100} burst y={1020}/>

      <VDHero/>
      <VDOutro/>
    </Stage>
  );
}

window.VariationD = VariationD;
