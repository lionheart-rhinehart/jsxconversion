// COACH LOWER-THIRDS — 16:9 — 6s loop
// Animated name plate to overlay on raw coaching footage. The plate slides
// in, holds, and slides out — drop a transparent export over your video.

function CoachLowerThirds({ data = {} }) {
  const coachName = data.coachName ?? 'COACH MIKE TORRES';
  const coachTitle = data.coachTitle ?? 'DIRECTOR OF PERFORMANCE';
  const media = data.media ?? 'assets/photo-group-coaching.jpg';

  const t = useTime();
  const RED = '#c4141d';

  // Slide in 0.3-1.0, hold to 4.5, slide out 4.5-5.5
  let panelX = 0;
  let panelOp = 1;
  if (t < 0.3) { panelX = -100; panelOp = 0; }
  else if (t < 1.0) {
    const p = Easing.easeOutCubic((t - 0.3) / 0.7);
    panelX = -100 + p * 100;
    panelOp = p;
  } else if (t < 4.5) { panelX = 0; panelOp = 1; }
  else if (t < 5.5) {
    const p = Easing.easeInCubic((t - 4.5) / 1.0);
    panelX = -p * 100;
    panelOp = 1 - p;
  } else { panelX = -100; panelOp = 0; }

  // Sub-title types in word-by-word starting 1.2
  const subWords = coachTitle.split(/\s+/);
  const credT = (i) => Math.max(0, Math.min(1, (t - (1.2 + i * 0.12)) / 0.25));

  // Credentials chips
  const chipT = Easing.easeOutCubic(Math.max(0, Math.min(1, (t - 1.8) / 0.5)));

  // Red accent bar extends 0.6-1.4
  const barT = Easing.easeOutCubic(Math.max(0, Math.min(1, (t - 0.6) / 0.6)));

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a0b0d', overflow: 'hidden' }}>
      {/* Background "video" — placeholder coaching footage */}
      <window.TrimmedMedia
        src={media}
        clipStart={data.media_clipStart}
        clipEnd={data.media_clipEnd}
        muted={!data.media_audio}
        style={{
        position: 'absolute', inset: 0,
        width: '100%', height: '100%', objectFit: 'cover',
        objectPosition: '50% 40%',
        filter: 'contrast(1.05) saturate(0.9) brightness(0.7)',
        transform: `scale(${1.02 + 0.02 * (t / 6)})`,
      }}
      />

      {/* Helper hint top-right that this is a lower-thirds overlay (would not be in final) */}
      <div style={{
        position: 'absolute', top: 30, right: 30,
        padding: '8px 12px',
        border: '1px dashed rgba(255,255,255,0.3)',
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: 14, color: 'rgba(255,255,255,0.55)',
        letterSpacing: '0.1em',
      }}>OVERLAY ON YOUR FOOTAGE ↓</div>

      {/* Lower thirds panel */}
      <div style={{
        position: 'absolute',
        left: 80, bottom: 80,
        display: 'flex',
        opacity: panelOp,
        transform: `translateX(${panelX * 6}px)`,
      }}>
        {/* Red accent block */}
        <div style={{
          width: 18,
          background: RED,
          marginRight: 0,
          transform: `scaleY(${barT})`,
          transformOrigin: 'top',
          boxShadow: `4px 0 24px rgba(196,20,29,0.4)`,
        }}/>

        {/* Main plate */}
        <div style={{
          padding: '28px 44px',
          background: 'rgba(10,11,13,0.92)',
          backdropFilter: 'blur(12px)',
          borderTop: '1px solid rgba(255,255,255,0.12)',
          borderRight: '1px solid rgba(255,255,255,0.12)',
          borderBottom: '1px solid rgba(255,255,255,0.12)',
          minWidth: 700,
        }}>
          <div style={{
            fontFamily: 'Anton, sans-serif',
            fontSize: 92, color: '#fff', lineHeight: 0.9,
            letterSpacing: '0.005em',
          }}>{coachName}</div>

          {/* Title typed in */}
          <div style={{
            marginTop: 16,
            display: 'flex', gap: 14, alignItems: 'baseline',
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 24, color: '#c2c6cd', letterSpacing: '0.12em',
          }}>
            {subWords.map((w, i) => (
              <span key={i} style={{
                opacity: credT(i),
                transform: `translateY(${(1 - credT(i)) * 6}px)`,
                display: 'inline-block',
              }}>{w}</span>
            ))}
          </div>

          {/* Credentials chips */}
          <div style={{
            marginTop: 18,
            display: 'flex', gap: 10,
            opacity: chipT,
            transform: `translateY(${(1 - chipT) * 12}px)`,
          }}>
            {['CSCS', 'USATF L2', '15 YRS', 'NCAA D1'].map((c) => (
              <div key={c} style={{
                padding: '6px 12px',
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.2)',
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: 16, color: '#fff',
                letterSpacing: '0.08em',
              }}>{c}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Small AA logo top-left */}
      <div style={{
        position: 'absolute',
        top: 40, left: 40,
        display: 'flex', alignItems: 'center', gap: 12,
        opacity: barT,
      }}>
        <img src="assets/logo.png" style={{ width: 44, height: 44, objectFit: 'contain' }}/>
        <div style={{
          fontFamily: 'Anton, sans-serif',
          fontSize: 24, color: '#fff', lineHeight: 0.9,
        }}>ATHLETES<br/>ACCELERATION</div>
      </div>
    </div>
  );
}

window.CoachLowerThirds = CoachLowerThirds;

const COACH_LT_SPEC = {
  id: 'coach-lt',
  name: 'COACH LOWER THIRDS',
  fields: [
  {
    "key": "duration",
    "label": "Length",
    "type": "slider",
    "default": 6,
    "min": 3,
    "max": 15,
    "step": 0.5,
    "unit": "s"
  },
  {
    "key": "coachName",
    "label": "Coach name",
    "type": "text",
    "default": "COACH MIKE TORRES"
  },
  {
    "key": "coachTitle",
    "label": "Title (typed in word-by-word)",
    "type": "text",
    "default": "DIRECTOR OF PERFORMANCE"
  },
  {
    "key": "media",
    "label": "Background photo or video",
    "type": "image",
    "default": "assets/photo-group-coaching.jpg",
    "sub": "Replace with your raw footage"
  }
],
};
window.COACH_LT_SPEC = COACH_LT_SPEC;
