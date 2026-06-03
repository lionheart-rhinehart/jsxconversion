// {eyebrow} — 9:16 Reel — 8s loop
// Stack-reveal of 4 numbered drills. Post weekly as a programming preview.

function WorkoutOfWeekReel({ data = {} }) {
  const eyebrow = data.eyebrow ?? 'WORKOUT OF THE WEEK';
  const weekLabel = data.weekLabel ?? 'WEEK 23 · LOWER POWER';
  const ctaText = data.ctaText ?? 'OR YOUR TRAINING IS FREE.';
  const ctaMicro = data.ctaMicro ?? 'BOOK YOUR ASSESSMENT · ATHLETESACCEL.COM';
  const media = data.media ?? 'assets/photo-lifting.jpg';

  const t = useTime();
  const RED = (window.__BRAND__ && window.__BRAND__.brand_red || '#c4141d');

  const headerT = Math.max(0, Math.min(1, (t - 0.2) / 0.4));
  const titleT  = Easing.easeOutCubic(Math.max(0, Math.min(1, (t - 0.5) / 0.5)));

  const drills = [
    { num: '01', name: 'BOX JUMP',          spec: '4 × 6',          tag: 'EXPLOSIVE POWER' },
    { num: '02', name: 'BACK SQUAT',        spec: '4 × 5 @ 80%',    tag: 'MAX STRENGTH'     },
    { num: '03', name: 'BAND-RESISTED SPRINT', spec: '6 × 20m',     tag: 'ACCELERATION'     },
    { num: '04', name: 'KB SWING',          spec: '3 × 12',         tag: 'POSTERIOR CHAIN'  },
  ];

  // Drill stagger: start at 1.4, each +0.6
  const drillReveal = (i) => Easing.easeOutCubic(Math.max(0, Math.min(1, (t - (1.4 + i * 0.6)) / 0.5)));

  const footerT = Easing.easeOutCubic(Math.max(0, Math.min(1, (t - 5.4) / 0.6)));

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a0b0d', overflow: 'hidden' }}>
      {/* Subtle photo bg, far darkened */}
      <window.TrimmedMedia
        src={media}
        clipStart={data.media_clipStart}
        clipEnd={data.media_clipEnd}
        muted={!data.media_audio}
        style={{
        position: 'absolute', inset: 0,
        width: '100%', height: '100%', objectFit: 'cover',
        filter: 'brightness(0.18) saturate(0.5) contrast(1.1)',
        transform: `scale(${1.05 + 0.03 * (t / 8)})`,
      }}
      />

      {/* Header */}
      <div style={{
        position: 'absolute', top: 110, left: 60, right: 60,
        opacity: headerT,
      }}>
        <Eyebrow fontSize={28} style={{ position: 'static' }}>{eyebrow}</Eyebrow>
        <div style={{
          marginTop: 8,
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: 22, color: '#969ca7', letterSpacing: '0.12em',
        }}>{weekLabel}</div>
      </div>

      {/* Title */}
      <div style={{
        position: 'absolute', top: 240, left: 60, right: 60,
        fontFamily: 'Anton, sans-serif',
        color: '#fff',
        fontSize: 150,
        lineHeight: 0.88,
        opacity: titleT,
        transform: `translateY(${(1 - titleT) * 20}px)`,
      }}>BUILD <span style={{color: RED}}>POWER.</span><br/>EVERY REP.</div>

      {/* Drills stack */}
      <div style={{
        position: 'absolute', top: 700, left: 60, right: 60,
        display: 'flex', flexDirection: 'column', gap: 18,
      }}>
        {drills.map((d, i) => {
          const r = drillReveal(i);
          return (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 28,
              padding: '24px 28px',
              background: 'rgba(31,34,39,0.85)',
              borderLeft: `4px solid ${RED}`,
              backdropFilter: 'blur(8px)',
              opacity: r,
              transform: `translateX(${(1 - r) * -40}px)`,
            }}>
              <div style={{
                fontFamily: 'Anton, sans-serif',
                fontSize: 84, color: 'transparent',
                WebkitTextStroke: `2px ${RED}`,
                lineHeight: 0.85,
                width: 110, flexShrink: 0,
                fontVariantNumeric: 'tabular-nums',
              }}>{d.num}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontFamily: 'Anton, sans-serif',
                  fontSize: 50, color: '#fff', lineHeight: 0.95,
                }}>{d.name}</div>
                <div style={{
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: 18, color: '#969ca7', letterSpacing: '0.1em',
                  marginTop: 6,
                }}>{d.tag}</div>
              </div>
              <div style={{
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: 32, color: '#fff', fontWeight: 700,
                fontVariantNumeric: 'tabular-nums',
              }}>{d.spec}</div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div style={{
        position: 'absolute', bottom: 110, left: 60, right: 60,
        padding: '24px 28px',
        background: RED,
        textAlign: 'center',
        opacity: footerT,
        transform: `translateY(${(1 - footerT) * 20}px)`,
      }}>
        <div style={{
          fontFamily: 'Anton, sans-serif',
          fontSize: 50, color: '#fff', letterSpacing: '0.005em',
        }}>{ctaText}</div>
        <div style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: 22, color: '#fff', opacity: 0.85,
          letterSpacing: '0.12em', marginTop: 8,
        }}>{ctaMicro}</div>
      </div>
    </div>
  );
}

window.WorkoutOfWeekReel = WorkoutOfWeekReel;

const WORKOUT_SPEC = {
  id: 'workout',
  name: 'WORKOUT OF WEEK',
  fields: [
  {
    "key": "duration",
    "label": "Length",
    "type": "slider",
    "default": 8,
    "min": 3,
    "max": 15,
    "step": 0.5,
    "unit": "s"
  },
  {
    "key": "eyebrow",
    "label": "Eyebrow tag",
    "type": "text",
    "default": "WORKOUT OF THE WEEK"
  },
  {
    "key": "weekLabel",
    "label": "Week label",
    "type": "text",
    "default": "WEEK 23 · LOWER POWER"
  },
  {
    "key": "ctaText",
    "label": "CTA headline",
    "type": "text",
    "default": "OR YOUR TRAINING IS FREE."
  },
  {
    "key": "ctaMicro",
    "label": "CTA microcopy",
    "type": "text",
    "default": "BOOK YOUR ASSESSMENT · ATHLETESACCEL.COM"
  },
  {
    "key": "media",
    "label": "Background photo or video",
    "type": "image",
    "default": "assets/photo-lifting.jpg"
  }
],
};
window.WORKOUT_SPEC = WORKOUT_SPEC;
