// variation-a.jsx — BOLD / KINETIC
// Hard cuts, ultra-condensed display type, red accent bar, carbon-fiber black.
// 10s · pulls "Stronger. Faster. Confident." from the testimonial.

const VA_W = 1080, VA_H = 1920;
const VA_RED = '#d72020';
const VA_RED_DEEP = '#7a0d0d';

// Carbon-fibre weave background (CSS gradients) + slow vignette pulse.
function VACarbonBg() {
  const t = useTime();
  // subtle drift on the texture
  const drift = (t * 8) % 28;
  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: `
        radial-gradient(120% 70% at 50% 40%, #1a1413 0%, #0a0707 55%, #050303 100%),
        repeating-linear-gradient(45deg, rgba(255,255,255,0.025) 0 2px, transparent 2px 6px),
        repeating-linear-gradient(-45deg, rgba(255,255,255,0.025) 0 2px, transparent 2px 6px)
      `,
      backgroundPosition: `0 0, ${drift}px 0, ${-drift}px 0`,
    }}/>
  );
}

// Diagonal red streaks that sweep across at every "hit".
function VAStreaks() {
  const t = useTime();
  // Streak hits at scene transitions
  const hits = [0.3, 2.3, 4.0, 5.6, 7.2, 8.8];
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      {hits.map((h, i) => {
        const dt = t - h;
        if (dt < -0.1 || dt > 0.6) return null;
        const p = clamp((dt + 0.1) / 0.7, 0, 1);
        const eased = Easing.easeOutExpo(p);
        const x = -200 + eased * 1600;
        const opacity = (1 - p) * 0.85;
        return (
          <div key={i} style={{
            position: 'absolute',
            top: 200 + (i % 3) * 500,
            left: x,
            width: 1600, height: 8,
            background: `linear-gradient(90deg, transparent, ${VA_RED} 30%, #fff 50%, ${VA_RED} 70%, transparent)`,
            transform: `rotate(-${8 + (i % 3) * 2}deg)`,
            opacity,
            filter: 'blur(0.5px)',
            boxShadow: `0 0 40px ${VA_RED}`,
          }}/>
        );
      })}
    </div>
  );
}

// Each "scene" — text slams up, red wipe bar, camera-shake on hit.
// Auto-shrinks if the rendered text would overflow the 1080px stage.
function VASlam({ text, sub, accent = false, eyebrow = null, size = 280 }) {
  const textRef = React.useRef(null);
  const [autoScale, setAutoScale] = React.useState(1);

  React.useLayoutEffect(() => {
    if (!textRef.current) return;
    // Reset to 1 before measuring; otherwise stale scale taints the next read.
    textRef.current.style.transform = '';
    const w = textRef.current.scrollWidth;
    const maxW = VA_W * 0.92;
    setAutoScale(w > maxW ? maxW / w : 1);
  }, [text, size]);

  const fontSize = size;
  const { localTime, duration } = useSprite();
  const inT = clamp(localTime / 0.35, 0, 1);
  const inEased = Easing.easeOutBack(inT);
  const outDur = 0.25;
  const outT = clamp((localTime - (duration - outDur)) / outDur, 0, 1);
  const outEased = Easing.easeInQuad(outT);

  // shake on the hit
  const shake = Math.max(0, 1 - localTime / 0.35);
  const shx = Math.sin(localTime * 80) * shake * 6;
  const shy = Math.cos(localTime * 70) * shake * 4;

  // red accent bar wipes through at hit
  const barP = clamp(localTime / 0.45, 0, 1);
  const barW = Easing.easeOutExpo(barP) * VA_W * 1.2;

  return (
    <div style={{
      position: 'absolute', inset: 0,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      transform: `translate(${shx}px, ${shy}px)`,
      opacity: 1 - outEased,
    }}>
      {/* red wipe bar — sits behind the text */}
      <div style={{
        position: 'absolute',
        left: '50%', top: '50%',
        width: barW, height: accent ? 180 : 24,
        marginLeft: -barW / 2, marginTop: -12,
        background: accent
          ? `linear-gradient(90deg, transparent, ${VA_RED} 12%, ${VA_RED} 88%, transparent)`
          : `linear-gradient(90deg, transparent, ${VA_RED} 30%, ${VA_RED} 70%, transparent)`,
        opacity: accent ? 0.95 : 0.85 * (1 - barP * 0.4),
        mixBlendMode: 'normal',
      }}/>

      {eyebrow && (
        <div style={{
          fontFamily: 'JetBrains Mono, ui-monospace, monospace',
          fontSize: 36,
          color: VA_RED,
          letterSpacing: '0.42em',
          textTransform: 'uppercase',
          marginBottom: 28,
          opacity: inEased,
          transform: `translateY(${(1 - inEased) * -20}px)`,
        }}>
          {eyebrow}
        </div>
      )}

      <div ref={textRef} style={{
        fontFamily: 'Anton, "Archivo Black", sans-serif',
        fontSize,
        color: '#fff',
        letterSpacing: '-0.01em',
        lineHeight: 0.88,
        textTransform: 'uppercase',
        transform: `translateY(${(1 - inEased) * 90}px) scaleY(${(0.85 + 0.15 * inEased)}) scaleX(${autoScale})`,
        transformOrigin: 'bottom center',
        opacity: inEased,
        textShadow: '0 6px 32px rgba(0,0,0,0.7)',
        textAlign: 'center',
        WebkitTextStroke: '0 transparent',
        whiteSpace: 'nowrap',
      }}>
        {text}
      </div>

      {sub && (
        <div style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 32,
          color: 'rgba(255,255,255,0.7)',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          marginTop: 36,
          opacity: clamp((localTime - 0.25) / 0.4, 0, 1),
        }}>
          {sub}
        </div>
      )}
    </div>
  );
}

// Final stat card — "2 MONTHS." with framing
function VAStatCard() {
  const { localTime, duration } = useSprite();
  const inT = clamp(localTime / 0.45, 0, 1);
  const inEased = Easing.easeOutCubic(inT);
  const outT = clamp((localTime - (duration - 0.3)) / 0.3, 0, 1);

  return (
    <div style={{
      position: 'absolute', inset: 0,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      opacity: 1 - outT,
    }}>
      <div style={{
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 30,
        color: VA_RED,
        letterSpacing: '0.5em',
        textTransform: 'uppercase',
        marginBottom: 40,
        transform: `translateY(${(1 - inEased) * -20}px)`,
        opacity: inEased,
      }}>
        in just
      </div>
      <div style={{
        fontFamily: 'Anton, sans-serif',
        fontSize: 420,
        color: '#fff',
        letterSpacing: '-0.02em',
        lineHeight: 0.85,
        textShadow: `0 0 80px ${VA_RED}88`,
        transform: `scale(${0.6 + 0.4 * inEased})`,
      }}>
        2
      </div>
      <div style={{
        fontFamily: 'Anton, sans-serif',
        fontSize: 180,
        color: VA_RED,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        marginTop: -10,
        transform: `translateY(${(1 - inEased) * 30}px)`,
        opacity: inEased,
      }}>
        Months.
      </div>
      <div style={{
        marginTop: 48,
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 28,
        color: 'rgba(255,255,255,0.75)',
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
        textAlign: 'center',
        opacity: clamp((localTime - 0.3) / 0.4, 0, 1),
      }}>
        4 days a week.<br/>all summer long.
      </div>
    </div>
  );
}

function VAOutro() {
  const { localTime, duration } = useSprite();
  const inT = clamp(localTime / 0.6, 0, 1);
  const inEased = Easing.easeOutCubic(inT);

  return (
    <div style={{
      position: 'absolute', inset: 0,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: 30,
      opacity: inEased,
    }}>
      <img src="assets/logo.png" style={{
        width: 540, height: 540,
        objectFit: 'contain',
        transform: `scale(${0.85 + 0.15 * inEased})`,
        filter: 'drop-shadow(0 0 60px rgba(215,32,32,0.4))',
      }}/>
      <div style={{
        fontFamily: 'Anton, sans-serif',
        fontSize: 96,
        color: '#fff',
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        marginTop: 20,
      }}>
        Get AA Ready.
      </div>
      <div style={{
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 32,
        color: VA_RED,
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
      }}>
        @athletes_acceleration
      </div>
    </div>
  );
}

// Bottom progress ticker
function VATicker() {
  const t = useTime();
  const p = clamp(t / 10, 0, 1);
  return (
    <div style={{
      position: 'absolute', left: 80, right: 80, bottom: 70,
      display: 'flex', alignItems: 'center', gap: 24,
      fontFamily: 'JetBrains Mono, monospace',
      color: 'rgba(255,255,255,0.5)',
      fontSize: 22,
      letterSpacing: '0.18em',
      textTransform: 'uppercase',
    }}>
      <div>AA · Testimonial</div>
      <div style={{ flex: 1, height: 2, background: 'rgba(255,255,255,0.15)', position: 'relative' }}>
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0,
          width: `${p * 100}%`, background: VA_RED,
        }}/>
      </div>
      <div>{String(Math.floor(t * 10)).padStart(3, '0')}</div>
    </div>
  );
}

// Opening hook — quick label that frames the testimonial before the kinetic
// STRONGER/FASTER/CONFIDENT beat sequence.
function VAIntro() {
  const { localTime, duration } = useSprite();
  const inT = clamp(localTime / 0.45, 0, 1);
  const inEased = Easing.easeOutCubic(inT);
  const outT = clamp((localTime - (duration - 0.3)) / 0.3, 0, 1);
  const outEased = Easing.easeInQuad(outT);

  // Arrow that slides right over the hold
  const arrowP = clamp((localTime - 0.4) / 1.2, 0, 1);
  const arrowX = Easing.easeInOutCubic(arrowP) * 40;

  return (
    <div style={{
      position: 'absolute', inset: 0,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      opacity: (1 - outEased),
      gap: 30,
    }}>
      <div style={{
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 36,
        color: VA_RED,
        letterSpacing: '0.42em',
        textTransform: 'uppercase',
        opacity: inEased,
        transform: `translateY(${(1 - inEased) * -20}px)`,
      }}>
        A parent wrote
      </div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 22,
        opacity: inEased,
      }}>
        <div style={{
          height: 4, width: 180 + arrowX, background: '#fff',
          boxShadow: `0 0 24px ${VA_RED}`,
        }}/>
        <svg width="60" height="60" viewBox="0 0 60 60" fill="none" style={{ transform: `translateX(${arrowX}px)` }}>
          <path d="M10 30 L50 30 M36 16 L50 30 L36 44" stroke="#fff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <div style={{
        fontFamily: 'Anton, sans-serif',
        fontSize: 150,
        color: '#fff',
        letterSpacing: '-0.01em',
        textTransform: 'uppercase',
        lineHeight: 0.9,
        textAlign: 'center',
        marginTop: 10,
        transform: `translateY(${(1 - inEased) * 40}px) scale(${0.94 + 0.06 * inEased})`,
        textShadow: '0 6px 32px rgba(0,0,0,0.7)',
        opacity: inEased,
      }}>
        13 years old.<br/>One summer.
      </div>
    </div>
  );
}

function VariationA() {
  return (
    <Stage width={VA_W} height={VA_H} duration={10} background="#0a0707" persistKey="aa-va">
      <VACarbonBg/>
      <VAStreaks/>

      <Sprite start={0.2} end={2.3}>
        <VAIntro/>
      </Sprite>

      <Sprite start={2.3} end={4.0}>
        <VASlam text="Stronger." accent />
      </Sprite>

      <Sprite start={4.0} end={5.55}>
        <VASlam text="Faster." accent />
      </Sprite>

      <Sprite start={5.55} end={7.2}>
        <VASlam text="Confident." accent />
      </Sprite>

      <Sprite start={7.2} end={8.7}>
        <VAStatCard/>
      </Sprite>

      <Sprite start={8.7} end={10}>
        <VAOutro/>
      </Sprite>

      <VATicker/>
    </Stage>
  );
}

window.VariationA = VariationA;
