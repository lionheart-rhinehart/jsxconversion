// variation-b.jsx — PREMIUM EDITORIAL
// Brand palette: bright white paper, deep black ink, AA red accent.
// 10s · "I never thought I'd see the day my son would love to run."

const VB_W = 1080, VB_H = 1920;
const VB_PAPER = '#ffffff';
const VB_INK = '#0a0a0a';
const VB_RED = '#d72020';
const VB_MUTE = '#777777';

// Crisp white background with the faintest grid
function VBPaper() {
  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: VB_PAPER,
      backgroundImage: `
        radial-gradient(circle at 30% 20%, rgba(215,32,32,0.025), transparent 50%),
        radial-gradient(circle at 70% 80%, rgba(10,10,10,0.025), transparent 50%)
      `,
    }}/>
  );
}

// Editorial chrome — masthead + hairlines + red accent rule
function VBChrome() {
  const t = useTime();
  const lineP = clamp(t / 1.0, 0, 1);
  const lineEased = Easing.easeOutQuart(lineP);
  return (
    <>
      {/* top horizontal hairline */}
      <div style={{
        position: 'absolute', left: 80, top: 140,
        width: `calc((${VB_W}px - 160px) * ${lineEased})`,
        height: 1,
        background: VB_INK,
      }}/>
      {/* bottom horizontal hairline */}
      <div style={{
        position: 'absolute', left: 80, bottom: 140,
        width: `calc((${VB_W}px - 160px) * ${lineEased})`,
        height: 1,
        background: VB_INK,
      }}/>
      {/* left vertical RED accent line */}
      <div style={{
        position: 'absolute', left: 80, top: 240,
        width: 3,
        height: `calc((${VB_H}px - 380px) * ${clamp((t - 0.4) / 1.2, 0, 1)})`,
        background: VB_RED,
        transformOrigin: 'top',
        boxShadow: `0 0 12px rgba(215,32,32,0.35)`,
      }}/>

      {/* masthead */}
      <div style={{
        position: 'absolute', left: 80, top: 80,
        fontFamily: '"Instrument Serif", serif',
        fontSize: 38,
        fontStyle: 'italic',
        color: VB_INK,
        letterSpacing: '-0.01em',
        opacity: clamp(t / 0.8, 0, 1),
      }}>
        Testimonial
      </div>
      <div style={{
        position: 'absolute', right: 80, top: 90,
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 22,
        color: VB_RED,
        letterSpacing: '0.24em',
        textTransform: 'uppercase',
        textAlign: 'right',
        opacity: clamp(t / 0.8, 0, 1),
        fontWeight: 600,
      }}>
        Nº 01 · Summer
      </div>

      {/* footer text */}
      <div style={{
        position: 'absolute', left: 80, bottom: 80,
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 22,
        color: VB_INK,
        letterSpacing: '0.24em',
        textTransform: 'uppercase',
        opacity: clamp(t / 0.8, 0, 1),
        fontWeight: 600,
      }}>
        Athletes Acceleration
      </div>
      <div style={{
        position: 'absolute', right: 80, bottom: 80,
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 22,
        color: VB_RED,
        letterSpacing: '0.24em',
        textTransform: 'uppercase',
        opacity: clamp((t - 0.4) / 0.8, 0, 1),
        fontWeight: 600,
      }}>
        {String(Math.min(10, Math.floor(t * 10) / 10)).padEnd(3, '0').padStart(3, '0').slice(0,3)}″
      </div>
    </>
  );
}

// Pull quote — builds word-by-word, key words in red
// Builds toward the confidence angle as the punchline.
function VBQuote() {
  const t = useTime();
  // Three-beat buildup: physical → physical → mental punchline
  // Each "chunk" is a logical phrase with its own entry timing.
  // [text, startTime, accent?]
  const chunks = [
    ['He', 1.4, false],
    ['gained', 1.55, false],
    ['speed.', 1.75, false],
    ['He', 2.5, false],
    ['gained', 2.65, false],
    ['power.', 2.85, false],
    ['His', 3.9, false],
    ['confidence', 4.1, true],
    ['is', 4.6, false],
    ['off', 4.85, true],
    ['the', 5.1, true],
    ['charts.', 5.35, true],
  ];
  const exitT = 8.0;
  const exitP = clamp((t - exitT) / 0.6, 0, 1);

  return (
    <div style={{
      position: 'absolute',
      left: 80, right: 80,
      top: 340,
      opacity: 1 - exitP,
      transform: `translateY(${-exitP * 30}px)`,
    }}>
      {/* opening quotation mark */}
      <div style={{
        fontFamily: '"Instrument Serif", serif',
        fontSize: 280,
        color: VB_RED,
        lineHeight: 0.5,
        height: 100,
        opacity: clamp((t - 0.8) / 0.6, 0, 1),
        marginBottom: 20,
        textShadow: '0 4px 24px rgba(215,32,32,0.2)',
      }}>
        “
      </div>

      <div style={{
        fontFamily: '"Instrument Serif", "Cormorant Garamond", serif',
        fontSize: 124,
        fontStyle: 'italic',
        fontWeight: 400,
        lineHeight: 1.04,
        color: VB_INK,
        letterSpacing: '-0.02em',
        textWrap: 'pretty',
      }}>
        {chunks.map(([w, wt, isAccent], i) => {
          const p = clamp((t - wt) / 0.5, 0, 1);
          const eased = Easing.easeOutCubic(p);
          // Insert a soft line break before "His"
          const lineBreakBefore = w === 'His';
          return (
            <React.Fragment key={i}>
              {lineBreakBefore && <br/>}
              <span style={{
                display: 'inline-block',
                opacity: eased,
                transform: `translateY(${(1 - eased) * 18}px)`,
                marginRight: '0.28em',
                color: isAccent ? VB_RED : VB_INK,
                fontWeight: isAccent ? 500 : 400,
              }}>
                {w}
              </span>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

// Attribution + signature block
function VBAttribution() {
  const t = useTime();
  const startT = 6.6;
  const exitT = 9.5;
  const p = clamp((t - startT) / 0.8, 0, 1);
  const eased = Easing.easeOutCubic(p);
  const exitP = clamp((t - exitT) / 0.4, 0, 1);

  return (
    <div style={{
      position: 'absolute', left: 80, right: 80,
      bottom: 360,
      opacity: eased * (1 - exitP),
      transform: `translateY(${(1 - eased) * 20}px)`,
    }}>
      <div style={{
        width: 120, height: 2,
        background: VB_RED,
        marginBottom: 32,
      }}/>
      <div style={{
        fontFamily: '"Instrument Serif", serif',
        fontSize: 56,
        fontStyle: 'italic',
        color: VB_INK,
        letterSpacing: '-0.01em',
        lineHeight: 1.15,
      }}>
        — An AA parent
      </div>
      <div style={{
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 26,
        color: VB_MUTE,
        letterSpacing: '0.16em',
        textTransform: 'uppercase',
        marginTop: 20,
        lineHeight: 1.5,
        fontWeight: 500,
      }}>
        13-year-old athlete<br/>
        Summer training · 4 days / week
      </div>
    </div>
  );
}

// Outro logo — sits where the quote was
function VBOutro() {
  const t = useTime();
  const startT = 8.4;
  const p = clamp((t - startT) / 0.8, 0, 1);
  const eased = Easing.easeOutCubic(p);
  if (p === 0) return null;
  return (
    <div style={{
      position: 'absolute',
      left: '50%', top: 580,
      transform: `translateX(-50%) translateY(${(1 - eased) * 20}px) scale(${0.95 + 0.05 * eased})`,
      opacity: eased,
      textAlign: 'center',
    }}>
      <img src="assets/logo.png" style={{
        width: 380, height: 380, objectFit: 'contain',
        filter: 'drop-shadow(0 8px 30px rgba(215,32,32,0.25))',
      }}/>
      <div style={{
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 24,
        color: VB_RED,
        marginTop: 30,
        letterSpacing: '0.28em',
        textTransform: 'uppercase',
        fontWeight: 600,
      }}>
        Train this summer
      </div>
    </div>
  );
}

function VariationB() {
  return (
    <Stage width={VB_W} height={VB_H} duration={10} background={VB_PAPER} persistKey="aa-vb">
      <VBPaper/>
      <VBChrome/>
      <VBQuote/>
      <VBAttribution/>
      <VBOutro/>
    </Stage>
  );
}

window.VariationB = VariationB;
