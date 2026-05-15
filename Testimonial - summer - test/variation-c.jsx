// variation-c.jsx — WARM & HUMAN (on-brand)
// Brand palette: white paper, deep black ink, AA red accent.
// Warmth comes from typography (italic serif + handwritten Caveat) and
// gentler pacing — not from beige/peach color.
// 10s · "His confidence is off the charts."

const VC_W = 1080, VC_H = 1920;
const VC_BG = '#ffffff';
const VC_INK = '#0a0a0a';
const VC_RED = '#d72020';
const VC_MUTE = '#888888';

function VCBg() {
  const t = useTime();
  // A very subtle red glow that drifts to give the white some warmth
  const a = (Math.sin(t * 0.4) + 1) / 2;
  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: `
        radial-gradient(60% 50% at ${30 + a * 40}% ${30 + a * 30}%, rgba(215,32,32,0.06) 0%, transparent 60%),
        radial-gradient(60% 50% at ${70 - a * 30}% ${70 - a * 20}%, rgba(10,10,10,0.03) 0%, transparent 60%),
        ${VC_BG}
      `,
    }}/>
  );
}

// Small lead-in tag at the top
function VCEyebrow() {
  const t = useTime();
  const p = clamp(t / 0.6, 0, 1);
  const exitP = clamp((t - 9.0) / 0.6, 0, 1);
  return (
    <div style={{
      position: 'absolute',
      left: '50%', top: 220,
      transform: `translateX(-50%) translateY(${(1 - p) * -16}px)`,
      opacity: p * (1 - exitP),
      display: 'flex', alignItems: 'center', gap: 18,
    }}>
      <div style={{ width: 40, height: 2, background: VC_RED }}/>
      <div style={{
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 28,
        color: VC_INK,
        letterSpacing: '0.4em',
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
        fontWeight: 600,
      }}>
        Two months in
      </div>
      <div style={{ width: 40, height: 2, background: VC_RED }}/>
    </div>
  );
}

// Main quote — soft buildup
function VCQuote() {
  const t = useTime();
  const exitP = clamp((t - 8.6) / 0.6, 0, 1);

  const line = (text, start, opts = {}) => {
    const p = clamp((t - start) / 0.8, 0, 1);
    const eased = Easing.easeOutCubic(p);
    return (
      <div style={{
        fontFamily: opts.script
          ? '"Caveat", cursive'
          : '"Fraunces", "Cormorant Garamond", serif',
        fontStyle: opts.italic ? 'italic' : 'normal',
        fontWeight: opts.weight || 500,
        fontSize: opts.size || 180,
        color: opts.color || VC_INK,
        lineHeight: 0.95,
        letterSpacing: '-0.02em',
        textWrap: 'balance',
        textAlign: 'center',
        opacity: eased,
        transform: `translateY(${(1 - eased) * 26}px) scale(${0.96 + 0.04 * eased})`,
        marginBottom: opts.mb != null ? opts.mb : 28,
        position: 'relative',
      }}>
        {text}
        {opts.underline && (
          <VCUnderline startT={opts.underline} />
        )}
      </div>
    );
  };

  return (
    <div style={{
      position: 'absolute',
      left: 0, right: 0,
      top: '50%', transform: `translateY(-50%) translateY(${-exitP * 40}px)`,
      opacity: 1 - exitP,
      padding: '0 80px',
    }}>
      {line('His', 0.8, { size: 140, color: VC_MUTE, italic: true, weight: 400, mb: 10 })}
      {line('confidence', 1.2, { size: 220, weight: 700, mb: 20 })}
      {line('is', 2.4, { size: 140, color: VC_MUTE, italic: true, weight: 400, mb: 14 })}
      <div style={{ position: 'relative', display: 'inline-block', left: '50%', transform: 'translateX(-50%)' }}>
        {line('off the charts.', 3.0, {
          script: true,
          size: 280,
          color: VC_RED,
          weight: 700,
          mb: 0,
          underline: 4.3,
        })}
      </div>
    </div>
  );
}

// Hand-drawn underline (SVG path) — strokes in over 0.9s
function VCUnderline({ startT }) {
  const t = useTime();
  const p = clamp((t - startT) / 0.9, 0, 1);
  const eased = Easing.easeInOutCubic(p);
  return (
    <svg
      viewBox="0 0 800 80"
      style={{
        position: 'absolute',
        left: '50%', bottom: -50,
        width: '92%',
        transform: 'translateX(-50%)',
        overflow: 'visible',
      }}
    >
      <path
        d="M 20 50 Q 200 30 400 45 T 780 35"
        stroke={VC_RED}
        strokeWidth={10}
        strokeLinecap="round"
        fill="none"
        pathLength="1"
        strokeDasharray="1"
        strokeDashoffset={1 - eased}
        style={{ filter: 'drop-shadow(0 2px 6px rgba(215,32,32,0.35))' }}
      />
    </svg>
  );
}

// Attribution + AA sign-off
function VCAttribution() {
  const t = useTime();
  const startT = 6.4;
  const p = clamp((t - startT) / 0.8, 0, 1);
  const eased = Easing.easeOutCubic(p);
  const exitP = clamp((t - 8.6) / 0.5, 0, 1);
  return (
    <div style={{
      position: 'absolute',
      left: 0, right: 0,
      bottom: 280,
      textAlign: 'center',
      opacity: eased * (1 - exitP),
      transform: `translateY(${(1 - eased) * 14}px)`,
    }}>
      <div style={{
        fontFamily: '"Fraunces", serif',
        fontStyle: 'italic',
        fontWeight: 500,
        fontSize: 56,
        color: VC_INK,
        letterSpacing: '-0.01em',
      }}>
        — words from an AA mom
      </div>
      <div style={{
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 26,
        color: VC_RED,
        letterSpacing: '0.2em',
        textTransform: 'uppercase',
        marginTop: 24,
        fontWeight: 600,
      }}>
        about her 13-year-old · 2 months in
      </div>
    </div>
  );
}

// Outro — logo + soft tagline
function VCOutro() {
  const t = useTime();
  const startT = 8.6;
  const p = clamp((t - startT) / 0.9, 0, 1);
  const eased = Easing.easeOutCubic(p);
  if (p === 0) return null;
  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      opacity: eased,
      transform: `scale(${0.94 + 0.06 * eased})`,
    }}>
      <img src="assets/logo.png" style={{
        width: 520, height: 520, objectFit: 'contain',
        filter: 'drop-shadow(0 12px 40px rgba(215,32,32,0.3))',
      }}/>
      <div style={{
        fontFamily: '"Caveat", cursive',
        fontSize: 96,
        color: VC_RED,
        marginTop: 8,
        letterSpacing: '0.01em',
      }}>
        come see for yourself.
      </div>
      <div style={{
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 26,
        color: VC_INK,
        marginTop: 24,
        letterSpacing: '0.28em',
        textTransform: 'uppercase',
        fontWeight: 600,
      }}>
        @athletes_acceleration
      </div>
    </div>
  );
}

function VariationC() {
  return (
    <Stage width={VC_W} height={VC_H} duration={10} background={VC_BG} persistKey="aa-vc">
      <VCBg/>
      <VCEyebrow/>
      <VCQuote/>
      <VCAttribution/>
      <VCOutro/>
    </Stage>
  );
}

window.VariationC = VariationC;
