// variation-g.jsx — BEFORE / AFTER SPLIT-SCREEN
// 30s · 9:16 vertical split top/bottom. DAY 01 (top) vs DAY 60 (bottom).
// Photos, ticking counters, big stat reveals.

const VG_W = 1080, VG_H = 1920;
const VG_BG = '#0a0707';
const VG_INK = '#f4f1ec';
const VG_RED = '#d72020';
const VG_DIM = 'rgba(244,241,236,0.5)';

// Title intro screen (0–3s)
function VGActOne() {
  const t = useTime();
  if (t > 3.5) return null;
  const inP = clamp((t - 0.3) / 0.6, 0, 1);
  const inE = Easing.easeOutCubic(inP);
  const outP = clamp((t - 2.8) / 0.5, 0, 1);

  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: VG_BG,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      opacity: 1 - outP,
      zIndex: 5,
    }}>
      <div style={{
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 28, fontWeight: 600, color: VG_RED,
        letterSpacing: '0.4em', textTransform: 'uppercase',
        marginBottom: 50,
        opacity: inE,
      }}>
        ─── A 2-Month Study ───
      </div>
      <div style={{
        fontFamily: '"Space Grotesk", sans-serif',
        fontSize: 280, fontWeight: 700,
        color: VG_INK, lineHeight: 0.88,
        letterSpacing: '-0.04em',
        textTransform: 'lowercase',
        opacity: inE,
        transform: `scale(${0.85 + 0.15 * inE})`,
      }}>
        before
      </div>
      <div style={{
        fontFamily: '"Instrument Serif", serif', fontStyle: 'italic',
        fontSize: 110, color: VG_DIM, lineHeight: 1,
        margin: '6px 0',
        opacity: clamp((t - 0.8) / 0.5, 0, 1),
      }}>
        &amp;
      </div>
      <div style={{
        fontFamily: '"Space Grotesk", sans-serif',
        fontSize: 280, fontWeight: 700,
        color: VG_RED, lineHeight: 0.88,
        letterSpacing: '-0.04em',
        textTransform: 'lowercase',
        opacity: clamp((t - 1.2) / 0.5, 0, 1),
        transform: `scale(${0.85 + 0.15 * clamp((t - 1.2) / 0.5, 0, 1)})`,
      }}>
        after.
      </div>
    </div>
  );
}

// Reusable "panel" for top or bottom half (a photo + label + tag)
function VGHalfPanel({ position, src, focusX = 50, focusY = 50, label, day, grade = 'normal', startT, slideFrom = 'top' }) {
  const t = useTime();
  if (t < startT - 0.1) return null;
  const localT = t - startT;
  const inP = clamp(localT / 0.7, 0, 1);
  const inE = Easing.easeOutCubic(inP);

  // Half height + slight overlap region for the dividing line
  const halfTop = position === 'top';
  const slideY = (1 - inE) * (slideFrom === 'top' ? -200 : 200);

  const filter = grade === 'desat'
    ? 'saturate(0.35) contrast(1.15) brightness(0.78)'
    : grade === 'high-contrast'
    ? 'saturate(1.05) contrast(1.25) brightness(0.95)'
    : 'saturate(0.9) contrast(1.2) brightness(0.9)';

  return (
    <div style={{
      position: 'absolute',
      left: 0, right: 0,
      top: halfTop ? 0 : VG_H / 2,
      height: VG_H / 2,
      overflow: 'hidden',
      transform: `translateY(${slideY}px)`,
      opacity: inE,
    }}>
      <img src={src} style={{
        position: 'absolute',
        left: '50%', top: '50%',
        width: '110%', height: '110%',
        transform: 'translate(-50%, -50%)',
        objectFit: 'cover',
        objectPosition: `${focusX}% ${focusY}%`,
        filter,
      }}/>
      {/* darkening gradient from edges */}
      <div style={{
        position: 'absolute', inset: 0,
        background: halfTop
          ? 'linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.15) 50%, rgba(0,0,0,0.85) 100%)'
          : 'linear-gradient(180deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.15) 50%, rgba(0,0,0,0.55) 100%)',
      }}/>

      {/* Label block — top half has it near top, bottom half near bottom */}
      <div style={{
        position: 'absolute',
        left: 60, right: 60,
        ...(halfTop ? { top: 100 } : { bottom: 100 }),
        opacity: clamp((localT - 0.4) / 0.5, 0, 1),
        transform: `translateY(${(1 - clamp((localT - 0.4) / 0.5, 0, 1)) * (halfTop ? -20 : 20)}px)`,
      }}>
        <div style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 26, fontWeight: 700,
          color: position === 'top' ? VG_DIM : VG_RED,
          letterSpacing: '0.4em', textTransform: 'uppercase',
          marginBottom: 16,
        }}>
          {day}
        </div>
        <div style={{
          fontFamily: '"Space Grotesk", sans-serif',
          fontSize: 130, fontWeight: 700,
          color: VG_INK, lineHeight: 0.9,
          letterSpacing: '-0.04em', textTransform: 'lowercase',
        }}>
          {label}
        </div>
      </div>
    </div>
  );
}

// Center divider — small horizontal rule with label that animates in
function VGDivider({ startT }) {
  const t = useTime();
  const p = clamp((t - startT) / 0.6, 0, 1);
  const e = Easing.easeOutCubic(p);
  if (p === 0) return null;
  return (
    <div style={{
      position: 'absolute',
      left: 0, right: 0,
      top: VG_H / 2 - 60,
      height: 120,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 6,
    }}>
      <div style={{ width: 60 * e, height: 3, background: VG_RED }}/>
      <div style={{
        margin: '0 24px',
        padding: '10px 22px',
        background: VG_BG,
        border: `2px solid ${VG_RED}`,
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 24, fontWeight: 700, color: VG_RED,
        letterSpacing: '0.32em', textTransform: 'uppercase',
        transform: `scale(${e})`,
      }}>
        VS
      </div>
      <div style={{ width: 60 * e, height: 3, background: VG_RED }}/>
    </div>
  );
}

// ── ACT 2 (3–8s): top half lands with DAY 01 + photo ────────────────────
function VGActTwo() {
  const t = useTime();
  if (t < 3.0) return null;
  return (
    <VGHalfPanel position="top" src="assets/photo-coach-crew.png"
      focusX={45} focusY={45}
      day="Day 01"
      label="nervous."
      grade="desat"
      startT={3.3}
      slideFrom="top"/>
  );
}

// ── ACT 3 (7–12s): bottom half slides in with DAY 60 + photo ───────────
function VGActThree() {
  const t = useTime();
  if (t < 7.0) return null;
  return (
    <VGHalfPanel position="bottom" src="assets/photo-sprint.jpg"
      focusX={62} focusY={40}
      day="Day 60"
      label="unstoppable."
      grade="high-contrast"
      startT={7.3}
      slideFrom="bottom"/>
  );
}

// Ticking counter — number animates from `from` to `to` over `dur`
function VGCounter({ from, to, startT, dur = 1.6 }) {
  const t = useTime();
  const p = clamp((t - startT) / dur, 0, 1);
  const eased = Easing.easeOutCubic(p);
  const val = from + (to - from) * eased;
  return <>{Math.round(val)}</>;
}

// ── ACT 4 (11–22s): center band shows stat counters ticking up ──────────
function VGActFour() {
  const t = useTime();
  if (t < 11.0 || t > 22.5) return null;
  const localT = t - 11.5;
  const inP = clamp(localT / 0.6, 0, 1);
  const e = Easing.easeOutCubic(inP);
  const outP = clamp((t - 21.5) / 0.6, 0, 1);

  const stats = [
    { label: 'speed',      unit: '%', from: 0, to: 38,  startT: 1.4 },
    { label: 'power',      unit: '%', from: 0, to: 42,  startT: 3.4 },
    { label: 'confidence', unit: '%', from: 0, to: 99,  startT: 5.4, accent: true },
  ];

  return (
    <div style={{
      position: 'absolute',
      left: 0, right: 0,
      top: VG_H / 2 - 60,
      height: 120,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 7,
      opacity: e * (1 - outP),
    }}>
      {/* the VS chip from VGDivider stays, this band overlays beneath it briefly then takes over */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 32,
        background: VG_BG,
        border: `2px solid ${VG_RED}`,
        padding: '20px 32px',
        transform: `scale(${0.9 + 0.1 * e})`,
      }}>
        {stats.map((s, i) => {
          const visible = localT >= s.startT;
          if (!visible) {
            return (
              <div key={i} style={{
                fontFamily: '"Space Grotesk", sans-serif',
                fontSize: 60, fontWeight: 700,
                color: VG_DIM,
                opacity: 0.2,
                minWidth: 100, textAlign: 'center',
              }}>
                ──
              </div>
            );
          }
          return (
            <React.Fragment key={i}>
              {i > 0 && <div style={{ width: 2, height: 50, background: 'rgba(244,241,236,0.2)' }}/>}
              <div style={{ textAlign: 'center', minWidth: 130 }}>
                <div style={{
                  fontFamily: '"Space Grotesk", sans-serif',
                  fontSize: 60, fontWeight: 700,
                  color: s.accent ? VG_RED : VG_INK,
                  letterSpacing: '-0.03em', lineHeight: 1,
                }}>
                  +<VGCounter from={s.from} to={s.to} startT={11.5 + s.startT}/>{s.unit}
                </div>
                <div style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 16, fontWeight: 700,
                  color: VG_DIM, letterSpacing: '0.24em', textTransform: 'uppercase',
                  marginTop: 6,
                }}>
                  {s.label}
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

// ── ACT 5 (22–28s): full-bleed quote moment ─────────────────────────────
function VGActFive() {
  const t = useTime();
  if (t < 21.5 || t > 28.5) return null;
  const localT = t - 22.0;
  const inP = clamp(localT / 0.7, 0, 1);
  const e = Easing.easeOutCubic(inP);
  const outP = clamp((t - 27.6) / 0.6, 0, 1);

  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: `rgba(10,7,7,${e * 0.94})`,
      backdropFilter: `blur(${e * 12}px)`,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      zIndex: 9,
      opacity: e * (1 - outP),
      padding: '0 60px',
      textAlign: 'center',
    }}>
      <div style={{
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 28, fontWeight: 600, color: VG_RED,
        letterSpacing: '0.4em', textTransform: 'uppercase',
        marginBottom: 50,
      }}>
        Two months later
      </div>
      <div style={{
        fontFamily: '"Instrument Serif", serif', fontStyle: 'italic',
        fontSize: 96, fontWeight: 400,
        color: VG_INK,
        letterSpacing: '-0.02em', lineHeight: 1.1,
        textWrap: 'pretty',
        opacity: clamp((localT - 0.4) / 0.6, 0, 1),
        transform: `translateY(${(1 - clamp((localT - 0.4) / 0.6, 0, 1)) * 20}px)`,
      }}>
        "His confidence is <span style={{ color: VG_RED }}>off the charts</span>."
      </div>
      <div style={{
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 24, fontWeight: 600, color: VG_DIM,
        letterSpacing: '0.28em', textTransform: 'uppercase',
        marginTop: 50,
        opacity: clamp((localT - 1.4) / 0.6, 0, 1),
      }}>
        ── A Mom ──
      </div>
    </div>
  );
}

// ── ACT 6 (28–30s): outro ──────────────────────────────────────────────
function VGActSix() {
  const t = useTime();
  if (t < 27.8) return null;
  const localT = t - 28.0;
  const inP = clamp(localT / 0.6, 0, 1);
  const e = Easing.easeOutCubic(inP);

  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: VG_BG,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      opacity: e, zIndex: 10,
    }}>
      <img src="assets/logo.png" style={{
        width: 480, height: 480, objectFit: 'contain',
        filter: 'drop-shadow(0 0 60px rgba(215,32,32,0.5))',
        transform: `scale(${0.92 + 0.08 * e})`,
      }}/>
      <div style={{
        fontFamily: '"Space Grotesk", sans-serif',
        fontSize: 90, fontWeight: 700,
        color: VG_INK, letterSpacing: '-0.03em',
        marginTop: 14,
        opacity: clamp((localT - 0.3) / 0.5, 0, 1),
      }}>
        Be next.
      </div>
      <div style={{
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 24, fontWeight: 700,
        color: VG_RED, letterSpacing: '0.32em', textTransform: 'uppercase',
        marginTop: 28,
        opacity: clamp((localT - 0.6) / 0.5, 0, 1),
      }}>
        @athletes_acceleration
      </div>
    </div>
  );
}

// Persistent corner chrome
function VGChrome() {
  const t = useTime();
  if (t < 3.3 || t > 22.0) return null;
  const p = clamp((t - 3.5) / 0.5, 0, 1);
  return (
    <>
      <div style={{
        position: 'absolute', left: 60, top: 60,
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 20, fontWeight: 700, color: VG_INK,
        letterSpacing: '0.3em', textTransform: 'uppercase',
        opacity: p * 0.8, zIndex: 8,
      }}>
        AA · CASE Nº 01
      </div>
      <div style={{
        position: 'absolute', right: 60, bottom: 60,
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 20, fontWeight: 700, color: VG_RED,
        letterSpacing: '0.3em', textTransform: 'uppercase',
        opacity: p * 0.8, zIndex: 8,
      }}>
        T+{t.toFixed(1)}s
      </div>
    </>
  );
}

function VariationG() {
  return (
    <Stage width={VG_W} height={VG_H} duration={30} background={VG_BG} persistKey="aa-vg">
      <VGActOne/>
      <VGActTwo/>
      <VGActThree/>
      <VGDivider startT={8.5}/>
      <VGActFour/>
      <VGActFive/>
      <VGActSix/>
      <VGChrome/>
    </Stage>
  );
}

window.VariationG = VariationG;
