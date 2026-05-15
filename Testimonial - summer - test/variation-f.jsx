// variation-f.jsx — CINEMATIC DOC TRAILER
// 30s · Netflix sports-doc trailer feel. Letterboxed 2.39:1 black bars,
// full-bleed photos with slow Ken Burns zooms, editorial chapter cards,
// typewriter subtitles, dramatic spacing.

const VF_W = 1080, VF_H = 1920;
const VF_BLACK = '#050505';
const VF_INK = '#f4f1ec';
const VF_RED = '#d72020';
const VF_DIM = 'rgba(244,241,236,0.55)';

// 2.39:1 letterbox bars top + bottom of the action area (vertical version).
// On 9:16, we crop the "cinematic frame" to ~16:7.5 in the middle.
function VFLetterbox() {
  const t = useTime();
  // Bars slide in at start, hold throughout, slide out near end
  const inP = clamp(t / 0.6, 0, 1);
  const outP = clamp((t - 29.0) / 0.5, 0, 1);
  const barH = 280 * inP * (1 - outP);

  return (
    <>
      <div style={{
        position: 'absolute', left: 0, right: 0, top: 0, height: barH,
        background: VF_BLACK,
        zIndex: 10,
      }}/>
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0, height: barH,
        background: VF_BLACK,
        zIndex: 10,
      }}/>
      {/* film grain texture overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), radial-gradient(rgba(0,0,0,0.04) 1px, transparent 1px)`,
        backgroundSize: '3px 3px, 5px 5px',
        backgroundPosition: '0 0, 1.5px 1.5px',
        mixBlendMode: 'overlay',
        opacity: 0.6,
        pointerEvents: 'none',
        zIndex: 9,
      }}/>
    </>
  );
}

// Top + bottom chrome inside the bars: tiny timecode + film slate info
function VFChrome() {
  const t = useTime();
  const inP = clamp(t / 1.0, 0, 1);
  return (
    <>
      {/* top-left timecode */}
      <div style={{
        position: 'absolute', left: 50, top: 100,
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 22, fontWeight: 600, color: VF_INK,
        letterSpacing: '0.18em',
        opacity: inP * 0.7,
        zIndex: 12,
      }}>
        {(() => {
          const total = Math.floor(t * 24);
          const sec = Math.floor(t);
          const frame = total % 24;
          return `00:00:${String(sec).padStart(2, '0')}:${String(frame).padStart(2, '0')}`;
        })()}
      </div>
      {/* top-right red dot REC */}
      <div style={{
        position: 'absolute', right: 50, top: 100,
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 22, fontWeight: 600, color: VF_RED,
        letterSpacing: '0.24em', textTransform: 'uppercase',
        opacity: inP * 0.9,
        display: 'flex', alignItems: 'center', gap: 10,
        zIndex: 12,
      }}>
        <span style={{
          display: 'inline-block', width: 12, height: 12, borderRadius: 6,
          background: VF_RED, boxShadow: `0 0 14px ${VF_RED}`,
          animation: 'vf-blink 1.4s infinite',
        }}/>
        REC
      </div>
      {/* bottom slate */}
      <div style={{
        position: 'absolute', left: 50, right: 50, bottom: 100,
        display: 'flex', justifyContent: 'space-between',
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 20, fontWeight: 600, color: VF_INK,
        letterSpacing: '0.22em', textTransform: 'uppercase',
        opacity: inP * 0.7,
        zIndex: 12,
      }}>
        <span>AA · DOC · 001</span>
        <span style={{ color: VF_RED }}>9:16 / 30s</span>
      </div>
      <style>{`@keyframes vf-blink { 0%, 100% { opacity: 1 } 50% { opacity: 0.3 } }`}</style>
    </>
  );
}

// Full-bleed photo with slow Ken Burns zoom anchored on the focal point.
// The focal point stays in frame because scale's origin = focal point.
function VFCinePhoto({ src, focusX = 50, focusY = 50, startT, endT, zoomFrom = 1.02, zoomTo = 1.08, grade = 'normal' }) {
  const t = useTime();
  if (t < startT - 0.5 || t > endT + 0.5) return null;
  const dur = endT - startT;
  const localT = clamp(t - startT, 0, dur);
  const p = localT / dur;

  const inP = clamp((t - startT) / 0.6, 0, 1);
  const outP = clamp((t - (endT - 0.6)) / 0.6, 0, 1);

  const zoom = zoomFrom + (zoomTo - zoomFrom) * p;

  const filter = grade === 'desat'
    ? 'saturate(0.4) contrast(1.12) brightness(0.78)'
    : grade === 'high-contrast'
    ? 'saturate(0.9) contrast(1.18) brightness(0.85)'
    : grade === 'warm'
    ? 'saturate(0.9) contrast(1.12) brightness(0.85) sepia(0.12)'
    : 'saturate(0.85) contrast(1.15) brightness(0.85)';

  return (
    <div style={{
      position: 'absolute', inset: 0,
      overflow: 'hidden',
      opacity: inP * (1 - outP),
      background: VF_BLACK,
    }}>
      <img src={src} style={{
        position: 'absolute',
        left: 0, top: 0,
        width: '100%', height: '100%',
        objectFit: 'cover',
        objectPosition: `${focusX}% ${focusY}%`,
        transform: `scale(${zoom})`,
        transformOrigin: `${focusX}% ${focusY}%`,
        filter,
      }}/>
      {/* Stronger gradient overlay for text legibility — darker at top (chapter card) and bottom (subtitles) */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.15) 35%, rgba(0,0,0,0.15) 60%, rgba(0,0,0,0.85) 100%)',
      }}/>
      {/* Left-edge dark scrim where chapter cards sit */}
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0, width: '60%',
        background: 'linear-gradient(90deg, rgba(0,0,0,0.65) 0%, transparent 100%)',
      }}/>
    </div>
  );
}

// Chapter card: "I." big roman numeral + chapter title
function VFChapter({ num, title, sub, startT, endT, x = 60, y = 1100 }) {
  const t = useTime();
  if (t < startT - 0.3 || t > endT) return null;
  const localT = t - startT;
  const inP = clamp(localT / 0.7, 0, 1);
  const inE = Easing.easeOutCubic(inP);
  const outP = clamp((t - (endT - 0.6)) / 0.6, 0, 1);

  return (
    <div style={{
      position: 'absolute', left: x, right: x, top: y,
      zIndex: 11,
      opacity: inE * (1 - outP),
      transform: `translateY(${(1 - inE) * 30}px)`,
    }}>
      {/* Backing scrim to anchor the text */}
      <div style={{
        position: 'absolute',
        left: -20, top: -20, right: 40, bottom: -20,
        background: 'linear-gradient(135deg, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.55) 80%, transparent 100%)',
        backdropFilter: 'blur(6px)',
        zIndex: -1,
      }}/>
      {/* small red hairline */}
      <div style={{
        width: 80 * inE, height: 3, background: VF_RED, marginBottom: 20,
      }}/>
      <div style={{
        fontFamily: '"Instrument Serif", serif', fontStyle: 'italic',
        fontSize: 32, color: VF_RED,
        letterSpacing: '0.04em',
        marginBottom: 14,
      }}>
        Chapter {num}
      </div>
      <div style={{
        fontFamily: '"Instrument Serif", serif',
        fontSize: 130, fontWeight: 400,
        color: VF_INK,
        letterSpacing: '-0.02em', lineHeight: 0.92,
        textTransform: 'lowercase',
        textShadow: '0 2px 20px rgba(0,0,0,0.8)',
      }}>
        {title}
      </div>
      {sub && (
        <div style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 22, fontWeight: 600, color: VF_INK,
          letterSpacing: '0.24em', textTransform: 'uppercase',
          marginTop: 22,
          opacity: clamp((localT - 0.5) / 0.5, 0, 1) * 0.85,
        }}>
          {sub}
        </div>
      )}
    </div>
  );
}

// Typewriter-style subtitle at the bottom of the action area
function VFSubtitle({ text, startT, endT, accent = false }) {
  const t = useTime();
  if (t < startT - 0.1 || t > endT) return null;
  const localT = t - startT;

  // Type characters in over 0.7s for shortish lines, scales w/ length
  const chars = text.length;
  const typeDur = Math.min(1.4, Math.max(0.6, chars * 0.025));
  const typeP = clamp(localT / typeDur, 0, 1);
  const shown = Math.floor(typeP * chars);

  const outP = clamp((t - (endT - 0.4)) / 0.4, 0, 1);

  return (
    <div style={{
      position: 'absolute', left: 60, right: 60, bottom: 380,
      zIndex: 11,
      opacity: 1 - outP,
      textAlign: 'center',
    }}>
      <div style={{
        display: 'inline-block',
        fontFamily: accent ? '"Instrument Serif", serif' : '"Space Grotesk", sans-serif',
        fontStyle: accent ? 'italic' : 'normal',
        fontSize: accent ? 64 : 44,
        fontWeight: accent ? 400 : 500,
        color: VF_INK,
        background: 'rgba(0,0,0,0.78)',
        backdropFilter: 'blur(10px)',
        padding: accent ? '22px 34px' : '16px 26px',
        lineHeight: 1.2,
        letterSpacing: accent ? '-0.01em' : '0',
        maxWidth: '90%',
        textWrap: 'pretty',
        boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
      }}>
        {text.substring(0, shown)}
        {typeP < 1 && (
          <span style={{
            display: 'inline-block', width: '0.5em',
            background: VF_INK,
            opacity: Math.sin(localT * 10) > 0 ? 1 : 0,
            color: 'transparent',
          }}>|</span>
        )}
      </div>
    </div>
  );
}

// ── ACT 1 (0–4s): cold open · title card on black ───────────────────────
function VFActOne() {
  const t = useTime();
  if (t > 4.5) return null;
  const inP = clamp((t - 0.4) / 0.7, 0, 1);
  const inE = Easing.easeOutCubic(inP);
  const outP = clamp((t - 3.8) / 0.5, 0, 1);

  return (
    <>
      {/* Solid black background for the cold open */}
      <div style={{ position: 'absolute', inset: 0, background: VF_BLACK, opacity: 1 - outP, zIndex: 0 }}/>

      <div style={{
        position: 'absolute', left: 60, right: 60, top: '50%',
        transform: 'translateY(-50%)',
        textAlign: 'center',
        opacity: inE * (1 - outP),
        zIndex: 11,
      }}>
        <div style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 24, fontWeight: 600, color: VF_DIM,
          letterSpacing: '0.4em', textTransform: 'uppercase',
          marginBottom: 40,
          opacity: clamp((t - 0.6) / 0.5, 0, 1),
        }}>
          A short film by
        </div>
        <div style={{
          fontFamily: '"Instrument Serif", serif', fontStyle: 'italic',
          fontSize: 110, fontWeight: 400, color: VF_INK,
          letterSpacing: '-0.02em', lineHeight: 1.05,
          opacity: clamp((t - 1.0) / 0.6, 0, 1),
          transform: `translateY(${(1 - clamp((t - 1.0) / 0.6, 0, 1)) * 20}px)`,
        }}>
          Athletes<br/>Acceleration
        </div>
        <div style={{
          width: 160, height: 3, background: VF_RED, margin: '50px auto',
          transform: `scaleX(${clamp((t - 1.8) / 0.6, 0, 1)})`,
        }}/>
        <div style={{
          fontFamily: '"Space Grotesk", sans-serif', fontSize: 40, fontWeight: 500,
          color: VF_INK, letterSpacing: '-0.01em',
          opacity: clamp((t - 2.0) / 0.6, 0, 1),
        }}>
          A two-month study
          <br/>in <span style={{ fontStyle: 'italic', fontFamily: '"Instrument Serif", serif', color: VF_RED, fontWeight: 400 }}>becoming</span>.
        </div>
      </div>
    </>
  );
}

// ── ACT 2 (4–11s): Chapter I · THE START ────────────────────────────────
function VFActTwo() {
  const t = useTime();
  if (t < 4.0 || t > 11.5) return null;

  return (
    <>
      <VFCinePhoto src="assets/photo-coach-crew.png" focusX={50} focusY={35}
        startT={4.5} endT={11.0}
        zoomFrom={1.0} zoomTo={1.06}
        grade="desat"/>

      <VFChapter num="I" title="The start." sub="Two months ago" startT={5.0} endT={9.0} y={1050}/>
      <VFSubtitle text="They came in like every other group of kids." startT={9.2} endT={11.2}/>
    </>
  );
}

// ── ACT 3 (11–19s): Chapter II · THE WORK · cycling photos ──────────────
function VFActThree() {
  const t = useTime();
  if (t < 11.0 || t > 19.5) return null;

  return (
    <>
      {/* Three quick photo cuts */}
      <VFCinePhoto src="assets/photo-sprint.jpg" focusX={62} focusY={35}
        startT={11.3} endT={14.0}
        zoomFrom={1.0} zoomTo={1.07}
        grade="high-contrast"/>

      <VFCinePhoto src="assets/photo-squat.jpg" focusX={55} focusY={40}
        startT={14.0} endT={16.6}
        zoomFrom={1.02} zoomTo={1.08}
        grade="high-contrast"/>

      <VFCinePhoto src="assets/photo-vertical.png" focusX={42} focusY={30}
        startT={16.6} endT={19.2}
        zoomFrom={1.0} zoomTo={1.08}
        grade="high-contrast"/>

      <VFChapter num="II" title="The work." sub="Four days a week" startT={11.6} endT={14.5} y={1050}/>

      <VFSubtitle text="Speed. Power. Precision." startT={14.4} endT={16.5} accent/>
      <VFSubtitle text="Every rep. Every rest. Every rep again." startT={16.7} endT={19.2}/>
    </>
  );
}

// ── ACT 4 (19–26s): Chapter III · THE CHANGE · the testimonial moment ──
function VFActFour() {
  const t = useTime();
  if (t < 19.0 || t > 26.5) return null;
  const localT = t - 19.5;

  return (
    <>
      <VFCinePhoto src="assets/photo-group.png" focusX={50} focusY={35}
        startT={19.5} endT={26.0}
        zoomFrom={1.0} zoomTo={1.07}
        grade="warm"/>

      <VFChapter num="III" title="The change." startT={19.8} endT={22.5} y={1000}/>

      <VFSubtitle text="His confidence is off the charts." startT={22.6} endT={26.2} accent/>
    </>
  );
}

// ── ACT 5 (26–30s): outro — pull-quote + logo + CTA ─────────────────────
function VFActFive() {
  const t = useTime();
  if (t < 25.8) return null;
  const localT = t - 26.2;
  const inP = clamp(localT / 0.7, 0, 1);
  const inE = Easing.easeOutCubic(inP);

  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: VF_BLACK,
      opacity: inE,
      zIndex: 8,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        fontFamily: '"Instrument Serif", serif', fontStyle: 'italic',
        fontSize: 72, fontWeight: 400,
        color: VF_INK,
        letterSpacing: '-0.02em', lineHeight: 1.15,
        textAlign: 'center',
        padding: '0 60px',
        opacity: clamp((localT - 0.3) / 0.6, 0, 1),
        transform: `translateY(${(1 - clamp((localT - 0.3) / 0.6, 0, 1)) * 20}px)`,
        marginBottom: 50,
        textWrap: 'pretty',
      }}>
        "I never thought I'd see the day my son would <span style={{ color: VF_RED }}>love</span> to run and work out."
      </div>
      <div style={{
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 22, fontWeight: 600, color: VF_DIM,
        letterSpacing: '0.32em', textTransform: 'uppercase',
        marginBottom: 60,
        opacity: clamp((localT - 0.9) / 0.5, 0, 1),
      }}>
        — A Mom · After 2 Months
      </div>

      <img src="assets/logo.png" style={{
        width: 320, height: 320, objectFit: 'contain',
        filter: 'drop-shadow(0 0 60px rgba(215,32,32,0.5))',
        opacity: clamp((localT - 1.5) / 0.6, 0, 1),
        transform: `scale(${0.92 + 0.08 * clamp((localT - 1.5) / 0.6, 0, 1)})`,
      }}/>
      <div style={{
        fontFamily: '"Space Grotesk", sans-serif', fontSize: 60, fontWeight: 700,
        color: VF_INK, letterSpacing: '-0.02em',
        marginTop: 10,
        opacity: clamp((localT - 2.0) / 0.6, 0, 1),
      }}>
        Get AA Ready.
      </div>
      <div style={{
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 24, fontWeight: 700, color: VF_RED,
        letterSpacing: '0.32em', textTransform: 'uppercase',
        marginTop: 26,
        opacity: clamp((localT - 2.4) / 0.6, 0, 1),
      }}>
        @athletes_acceleration
      </div>
    </div>
  );
}

function VariationF() {
  return (
    <Stage width={VF_W} height={VF_H} duration={30} background={VF_BLACK} persistKey="aa-vf">
      <VFActOne/>
      <VFActTwo/>
      <VFActThree/>
      <VFActFour/>
      <VFActFive/>
      <VFLetterbox/>
      <VFChrome/>
    </Stage>
  );
}

window.VariationF = VariationF;
