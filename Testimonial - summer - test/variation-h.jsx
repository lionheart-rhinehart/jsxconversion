// variation-h.jsx — SWISS KINETIC
// 30s · Modernist type-as-architecture. Strict grid, huge numerals, type that
// rotates / stacks / reframes. International Typographic Style — animated.

const VH_W = 1080, VH_H = 1920;
const VH_BG = '#f4f1ea';
const VH_INK = '#0a0a0a';
const VH_RED = '#d72020';
const VH_DIM = 'rgba(10,10,10,0.5)';

// Faint grid that fades in once, then sits quietly
function VHGrid() {
  const t = useTime();
  const p = clamp(t / 0.8, 0, 1);
  return (
    <div style={{
      position: 'absolute', inset: 0,
      opacity: p * 0.4,
      backgroundImage: `
        linear-gradient(to right, rgba(10,10,10,0.06) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(10,10,10,0.06) 1px, transparent 1px)
      `,
      backgroundSize: '90px 90px',
    }}/>
  );
}

// Persistent chrome — small spec text at the corners
function VHChrome() {
  const t = useTime();
  const p = clamp(t / 0.6, 0, 1);
  return (
    <>
      <div style={{
        position: 'absolute', left: 60, top: 60,
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 18, color: VH_INK, fontWeight: 600,
        letterSpacing: '0.32em', textTransform: 'uppercase',
        opacity: p,
      }}>
        AA / 24 · TESTIMONIAL Nº 01
      </div>
      <div style={{
        position: 'absolute', right: 60, top: 60,
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 18, color: VH_RED, fontWeight: 700,
        letterSpacing: '0.32em', textTransform: 'uppercase',
        opacity: p,
      }}>
        ▌ 9:16 / 30s
      </div>
      <div style={{
        position: 'absolute', left: 60, bottom: 60,
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 18, color: VH_INK, fontWeight: 600,
        letterSpacing: '0.32em', textTransform: 'uppercase',
        opacity: p,
      }}>
        ATHLETES ACCELERATION
      </div>
      <div style={{
        position: 'absolute', right: 60, bottom: 60,
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 18, color: VH_DIM, fontWeight: 600,
        letterSpacing: '0.32em', textTransform: 'uppercase',
        opacity: p,
      }}>
        T+{t.toFixed(1)}s
      </div>
      {/* Centre vertical guide that pulses */}
      <div style={{
        position: 'absolute', left: '50%', top: 110, bottom: 110, width: 1,
        background: 'rgba(10,10,10,0.08)',
        opacity: p,
      }}/>
    </>
  );
}

// Travelling red rule — appears, sweeps, pins itself
function VHRule({ y, startT, color = VH_RED, h = 6, holdEnd = 30 }) {
  const t = useTime();
  const inP = clamp((t - startT) / 0.7, 0, 1);
  const inE = Easing.easeInOutCubic(inP);
  const outP = clamp((t - holdEnd) / 0.3, 0, 1);
  if (inP === 0 || outP >= 1) return null;
  return (
    <div style={{
      position: 'absolute', left: 60, top: y, height: h,
      width: `calc((100% - 120px) * ${inE})`,
      background: color,
      opacity: 1 - outP,
    }}/>
  );
}

// ── ACT 1 (0–4s): cold open · the spec block ──────────────────────────
function VHActOne() {
  const t = useTime();
  if (t > 4.5) return null;

  const inP = clamp((t - 0.4) / 0.5, 0, 1);
  const e = Easing.easeOutCubic(inP);
  const outP = clamp((t - 3.9) / 0.4, 0, 1);

  return (
    <div style={{ opacity: 1 - outP }}>
      <VHRule y={520} startT={0.4} holdEnd={4.0}/>
      <div style={{
        position: 'absolute', left: 60, right: 60, top: 560,
        opacity: e,
        transform: `translateY(${(1 - e) * 20}px)`,
      }}>
        <div style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 28, color: VH_INK, fontWeight: 700,
          letterSpacing: '0.32em', textTransform: 'uppercase',
          marginBottom: 32,
        }}>
          Subject ⟶ A 13-year-old athlete
        </div>
        <div style={{
          fontFamily: '"Space Grotesk", "Helvetica Neue", sans-serif',
          fontSize: 180, fontWeight: 700,
          color: VH_INK, lineHeight: 0.88,
          letterSpacing: '-0.04em',
        }}>
          A summer<br/>study in<br/><span style={{ color: VH_RED }}>change.</span>
        </div>
      </div>
      <VHRule y={1380} startT={1.0} holdEnd={4.0}/>
      <div style={{
        position: 'absolute', left: 60, right: 60, top: 1420,
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 24, color: VH_INK, fontWeight: 600,
        letterSpacing: '0.26em', textTransform: 'uppercase',
        opacity: clamp((t - 1.4) / 0.5, 0, 1),
        lineHeight: 1.8,
      }}>
        Duration ⟶ Two months<br/>
        Frequency ⟶ Four days / week<br/>
        Programme ⟶ Speed · Power · Confidence
      </div>
    </div>
  );
}

// ── ACT 2 (4–11s): the giant "2" lockup transforms to "2 MONTHS" ──────
function VHActTwo() {
  const t = useTime();
  if (t < 4.0 || t > 11.5) return null;
  const localT = t - 4.5;

  // Phase A: a giant 2 slams in centered
  const aP = clamp(localT / 0.5, 0, 1);
  const aE = Easing.easeOutBack(aP);

  // Phase B: the 2 shrinks to make room for "MONTHS" alongside
  const bP = clamp((localT - 2.0) / 0.6, 0, 1);
  const bE = Easing.easeInOutCubic(bP);

  // Phase C: "of training." line slides in below
  const cP = clamp((localT - 3.6) / 0.6, 0, 1);
  const cE = Easing.easeOutCubic(cP);

  // Phase D: fade out
  const outP = clamp((localT - 5.8) / 0.5, 0, 1);

  // Combined scale for the giant 2 — starts huge, settles smaller
  const twoScale = (0.5 + 0.5 * aE) * (1 - bE * 0.55);
  const monthsScale = bE;

  return (
    <div style={{ opacity: 1 - outP }}>
      <VHRule y={300} startT={4.5} holdEnd={11.0}/>
      <div style={{
        position: 'absolute', left: 0, right: 0, top: 360,
        textAlign: 'center',
      }}>
        <div style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 32, color: VH_RED, fontWeight: 700,
          letterSpacing: '0.4em', textTransform: 'uppercase',
          marginBottom: 30,
          opacity: aE,
        }}>
          /// the duration
        </div>
      </div>

      {/* Centered flex lockup: "2" + "months" */}
      <div style={{
        position: 'absolute',
        left: 60, right: 60, top: 800,
        transform: 'translateY(-50%)',
        display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        gap: 30,
        opacity: aE,
      }}>
        <div style={{
          fontFamily: '"Space Grotesk", "Helvetica Neue", sans-serif',
          fontSize: 720,
          fontWeight: 700,
          color: VH_RED,
          lineHeight: 0.78,
          letterSpacing: '-0.08em',
          transform: `scale(${twoScale})`,
          transformOrigin: 'center',
        }}>
          2
        </div>
        <div style={{
          fontFamily: '"Space Grotesk", "Helvetica Neue", sans-serif',
          fontSize: 180,
          fontWeight: 700,
          color: VH_INK,
          lineHeight: 0.88,
          letterSpacing: '-0.04em',
          transform: `scale(${monthsScale})`,
          transformOrigin: 'left center',
          opacity: monthsScale,
          width: monthsScale > 0 ? 'auto' : 0,
          overflow: 'hidden',
          whiteSpace: 'nowrap',
        }}>
          months.
        </div>
      </div>

      <div style={{
        position: 'absolute', left: 60, right: 60, top: 1180,
        textAlign: 'center',
        opacity: cE,
        transform: `translateY(${(1 - cE) * 30}px)`,
        fontFamily: '"Space Grotesk", "Helvetica Neue", sans-serif',
        fontSize: 78, fontWeight: 500,
        color: VH_INK, lineHeight: 1.1, letterSpacing: '-0.02em',
      }}>
        is enough to change<br/>
        <span style={{ color: VH_RED, fontStyle: 'italic', fontFamily: '"Instrument Serif", serif', fontSize: 120, fontWeight: 400 }}>everything.</span>
      </div>

      <VHRule y={1500} startT={9.0} holdEnd={11.0}/>
    </div>
  );
}

// ── ACT 3 (11–18s): word stack — SPEED / POWER / CONFIDENCE rotating ─
function VHActThree() {
  const t = useTime();
  if (t < 11.0 || t > 18.5) return null;
  const localT = t - 11.5;

  const words = [
    { text: 'speed', startT: 0.0, color: VH_INK },
    { text: 'power', startT: 0.7, color: VH_INK },
    { text: 'confidence.', startT: 1.4, color: VH_RED, big: true },
  ];

  const outP = clamp((localT - 5.5) / 0.5, 0, 1);

  return (
    <div style={{ opacity: 1 - outP }}>
      <div style={{
        position: 'absolute', left: 60, top: 360,
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 28, color: VH_RED, fontWeight: 700,
        letterSpacing: '0.4em', textTransform: 'uppercase',
        opacity: clamp(localT / 0.4, 0, 1),
      }}>
        /// the gains
      </div>
      <VHRule y={460} startT={11.5} holdEnd={18.0}/>

      {/* The stacked words */}
      <div style={{
        position: 'absolute', left: 60, right: 60, top: 540,
      }}>
        {words.map((w, i) => {
          const p = clamp((localT - w.startT) / 0.5, 0, 1);
          const e = Easing.easeOutBack(p);
          return (
            <div key={i} style={{
              fontFamily: '"Space Grotesk", "Helvetica Neue", sans-serif',
              fontSize: w.big ? 180 : 200,
              fontWeight: 700,
              color: w.color,
              lineHeight: 0.95,
              letterSpacing: '-0.05em',
              textTransform: 'lowercase',
              opacity: e,
              transform: `translateX(${(1 - e) * -60}px) skewX(${(1 - e) * -8}deg)`,
              marginBottom: -10,
            }}>
              {w.text}{w.big ? '' : ','}
            </div>
          );
        })}
      </div>

      {/* Footnote: "/0001, /0002, /0003" indices */}
      <div style={{
        position: 'absolute', right: 60, top: 540,
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 22, color: VH_DIM, fontWeight: 600,
        letterSpacing: '0.24em',
        textAlign: 'right',
        lineHeight: 2.6,
      }}>
        {words.map((w, i) => (
          <div key={i} style={{
            opacity: clamp((localT - w.startT - 0.2) / 0.4, 0, 1),
          }}>
            /000{i + 1}
          </div>
        ))}
      </div>

      <VHRule y={1500} startT={16.6} holdEnd={18.0}/>
    </div>
  );
}

// ── ACT 4 (18–24s): big architectural OFF / THE / CHARTS lockup ──────
function VHActFour() {
  const t = useTime();
  if (t < 18.0 || t > 24.5) return null;
  const localT = t - 18.5;

  const stamps = [
    { text: 'OFF',    startT: 0.1, align: 'left',   color: VH_INK },
    { text: 'THE',    startT: 0.7, align: 'center', color: VH_INK },
    { text: 'CHARTS', startT: 1.4, align: 'right',  color: VH_RED },
  ];

  const outP = clamp((localT - 5.0) / 0.5, 0, 1);

  return (
    <div style={{ opacity: 1 - outP }}>
      <div style={{
        position: 'absolute', left: 60, top: 320,
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 28, color: VH_RED, fontWeight: 700,
        letterSpacing: '0.4em', textTransform: 'uppercase',
        opacity: clamp(localT / 0.4, 0, 1),
      }}>
        /// the result
      </div>
      <div style={{
        position: 'absolute', left: 60, right: 60, top: 380,
        fontFamily: '"Space Grotesk", "Helvetica Neue", sans-serif',
        fontSize: 56, fontWeight: 500,
        color: VH_INK,
        letterSpacing: '-0.02em',
        lineHeight: 1.1,
        opacity: clamp((localT - 0.2) / 0.5, 0, 1),
      }}>
        His confidence is
      </div>

      {/* Three stacked words, each in its own row, each pinned to a different alignment */}
      <div style={{
        position: 'absolute', left: 60, right: 60, top: 580,
      }}>
        {stamps.map((s, i) => {
          const p = clamp((localT - s.startT) / 0.55, 0, 1);
          const e = Easing.easeOutBack(p);
          return (
            <div key={i} style={{
              display: 'flex', justifyContent: s.align === 'left' ? 'flex-start' : s.align === 'right' ? 'flex-end' : 'center',
              marginBottom: 4,
              opacity: e,
              transform: `translateX(${(1 - e) * (s.align === 'right' ? -80 : s.align === 'left' ? 80 : 0)}px) scale(${0.85 + 0.15 * e})`,
              transformOrigin: s.align === 'right' ? 'right center' : s.align === 'left' ? 'left center' : 'center',
            }}>
              <div style={{
                fontFamily: '"Space Grotesk", "Helvetica Neue", sans-serif',
                fontSize: s.text === 'CHARTS' ? 220 : 300,
                fontWeight: 700,
                color: s.color,
                lineHeight: 0.84,
                letterSpacing: '-0.05em',
                textTransform: 'lowercase',
              }}>
                {s.text}
              </div>
            </div>
          );
        })}
      </div>

      <VHRule y={1600} startT={20.6} holdEnd={24.0}/>
      <div style={{
        position: 'absolute', left: 60, right: 60, top: 1640,
        textAlign: 'right',
        fontFamily: '"Instrument Serif", serif', fontStyle: 'italic',
        fontSize: 52, color: VH_INK,
        opacity: clamp((localT - 2.6) / 0.6, 0, 1),
      }}>
        — a mom, after two months.
      </div>
    </div>
  );
}

// ── ACT 5 (24–30s): outro — quote + logo + CTA in strict grid ─────────
function VHActFive() {
  const t = useTime();
  if (t < 24.0) return null;
  const localT = t - 24.5;

  const p = clamp(localT / 0.6, 0, 1);
  const e = Easing.easeOutCubic(p);

  return (
    <div style={{ opacity: e }}>
      <VHRule y={320} startT={24.5} h={6} holdEnd={30}/>
      <div style={{
        position: 'absolute', left: 60, right: 60, top: 380,
        fontFamily: '"Instrument Serif", serif',
        fontStyle: 'italic', fontSize: 80, fontWeight: 400,
        color: VH_INK,
        letterSpacing: '-0.02em', lineHeight: 1.1,
        textWrap: 'pretty',
        opacity: clamp((localT - 0.4) / 0.6, 0, 1),
        transform: `translateY(${(1 - clamp((localT - 0.4) / 0.6, 0, 1)) * 20}px)`,
      }}>
        "I never thought I'd see the day my son would <span style={{ color: VH_RED, fontWeight: 500 }}>love</span> to run and work out."
      </div>

      <VHRule y={1100} startT={26.0} h={6} holdEnd={30}/>
      <div style={{
        position: 'absolute', left: 60, right: 60, top: 1180,
        display: 'flex', alignItems: 'center', gap: 40,
        opacity: clamp((localT - 2.0) / 0.6, 0, 1),
      }}>
        <img src="assets/logo.png" style={{
          width: 280, height: 280, objectFit: 'contain',
        }}/>
        <div>
          <div style={{
            fontFamily: '"Space Grotesk", "Helvetica Neue", sans-serif',
            fontSize: 110, fontWeight: 700,
            color: VH_INK,
            letterSpacing: '-0.04em', lineHeight: 0.9,
          }}>
            be next.
          </div>
          <div style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 22, color: VH_RED, fontWeight: 700,
            letterSpacing: '0.32em', textTransform: 'uppercase',
            marginTop: 16,
          }}>
            @athletes_<br/>acceleration
          </div>
        </div>
      </div>

      <VHRule y={1700} startT={27.2} h={6} holdEnd={30}/>
      <div style={{
        position: 'absolute', left: 60, right: 60, top: 1740,
        display: 'flex', justifyContent: 'space-between',
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 20, color: VH_DIM, fontWeight: 600,
        letterSpacing: '0.28em', textTransform: 'uppercase',
        opacity: clamp((localT - 3.4) / 0.6, 0, 1),
      }}>
        <span>END / 30s</span>
        <span style={{ color: VH_RED }}>get aa ready</span>
      </div>
    </div>
  );
}

function VariationH() {
  return (
    <Stage width={VH_W} height={VH_H} duration={30} background={VH_BG} persistKey="aa-vh">
      <VHGrid/>
      <VHChrome/>
      <VHActOne/>
      <VHActTwo/>
      <VHActThree/>
      <VHActFour/>
      <VHActFive/>
    </Stage>
  );
}

window.VariationH = VariationH;
