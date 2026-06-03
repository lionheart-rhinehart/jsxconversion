// {eyebrow} — 9:16 Reel — 8s loop
// Photo-led with 3 numbered cue points. Use to teach drill technique.

function DrillHowToReel({ data = {} }) {
  const eyebrow = data.eyebrow ?? 'DRILL HOW-TO';
  const drillLine1 = data.drillLine1 ?? 'BOX';
  const drillLine2 = data.drillLine2 ?? 'JUMP';
  const ctaText = data.ctaText ?? 'TRY IT THIS WEEK.';
  const media = data.media ?? 'assets/photo-box-jump.jpg';

  const t = useTime();
  const RED = (window.__BRAND__ && window.__BRAND__.brand_red || '#c4141d');

  const photoScale = 1.06 + 0.04 * (t / 8);
  const eyebrowT = Math.max(0, Math.min(1, (t - 0.3) / 0.4));
  const titleT  = Easing.easeOutCubic(Math.max(0, Math.min(1, (t - 0.7) / 0.5)));

  const cues = [
    { num: '01', cue: 'ATHLETIC STANCE', desc: 'Feet shoulder-width. Hips loaded. Eyes ahead.' },
    { num: '02', cue: 'EXPLODE THROUGH HIPS', desc: 'Triple extension. Arms swing hard. Drive vertical.' },
    { num: '03', cue: 'SOFT LANDING', desc: 'Quiet feet. Re-load. Reset between reps.' },
  ];

  const cueT = (i) => Easing.easeOutCubic(Math.max(0, Math.min(1, (t - (2.0 + i * 1.1)) / 0.5)));

  // Bottom "TRY IT" bar
  const ctaT = Easing.easeOutBack(Math.max(0, Math.min(1, (t - 5.8) / 0.6)));

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a0b0d', overflow: 'hidden' }}>
      {/* Top half: photo */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0,
        height: '52%',
        overflow: 'hidden',
      }}>
        <window.TrimmedMedia
        src={media}
        clipStart={data.media_clipStart}
        clipEnd={data.media_clipEnd}
        muted={!data.media_audio}
        style={{
          width: '100%', height: '100%', objectFit: 'cover',
          objectPosition: '50% 40%',
          transform: `scale(${photoScale})`,
          filter: 'contrast(1.05) saturate(0.95) brightness(0.85)',
        }}
      />
        {/* fade to black at bottom */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, rgba(10,11,13,0.4) 0%, rgba(10,11,13,0) 30%, rgba(10,11,13,0.9) 100%)',
        }}/>
        {/* Eyebrow over photo */}
        <Eyebrow top={80} left={60} fontSize={26} style={{ opacity: eyebrowT }}>{eyebrow}</Eyebrow>
        {/* Title */}
        <div style={{
          position: 'absolute', bottom: 60, left: 60, right: 60,
          fontFamily: 'Anton, sans-serif',
          fontSize: 200, color: '#fff', lineHeight: 0.85,
          opacity: titleT,
          transform: `translateY(${(1 - titleT) * 20}px)`,
        }}>{drillLine1}<br/>{drillLine2}</div>
      </div>

      {/* Cues */}
      <div style={{
        position: 'absolute',
        top: '54%', left: 60, right: 60,
        display: 'flex', flexDirection: 'column', gap: 28,
      }}>
        {cues.map((c, i) => {
          const r = cueT(i);
          return (
            <div key={i} style={{
              display: 'flex', gap: 28, alignItems: 'flex-start',
              opacity: r,
              transform: `translateX(${(1 - r) * -30}px)`,
            }}>
              <div style={{
                fontFamily: 'Anton, sans-serif',
                fontSize: 96, color: RED,
                lineHeight: 0.85, width: 130, flexShrink: 0,
                fontVariantNumeric: 'tabular-nums',
              }}>{c.num}</div>
              <div style={{ flex: 1, paddingTop: 8 }}>
                <div style={{
                  fontFamily: 'Anton, sans-serif',
                  fontSize: 56, color: '#fff', lineHeight: 0.95,
                  marginBottom: 12,
                }}>{c.cue}</div>
                <div style={{
                  fontFamily: 'Geist, sans-serif',
                  fontSize: 28, color: '#c2c6cd',
                  lineHeight: 1.4,
                }}>{c.desc}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* CTA */}
      <div style={{
        position: 'absolute', bottom: 100, left: 60, right: 60,
        padding: '24px 28px',
        background: 'rgba(196,20,29,0.95)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        opacity: ctaT,
        transform: `translateY(${(1 - ctaT) * 20}px)`,
      }}>
        <div style={{
          fontFamily: 'Anton, sans-serif',
          fontSize: 46, color: '#fff',
        }}>{ctaText}</div>
        <div style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: 20, color: '#fff', letterSpacing: '0.1em',
        }}>FULL PROGRAM →</div>
      </div>
    </div>
  );
}

window.DrillHowToReel = DrillHowToReel;

const DRILL_HOWTO_SPEC = {
  id: 'drill-howto',
  name: 'DRILL HOW TO',
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
    "default": "DRILL HOW-TO"
  },
  {
    "key": "drillLine1",
    "label": "Drill name (line 1)",
    "type": "text",
    "default": "BOX"
  },
  {
    "key": "drillLine2",
    "label": "Drill name (line 2)",
    "type": "text",
    "default": "JUMP"
  },
  {
    "key": "ctaText",
    "label": "CTA text",
    "type": "text",
    "default": "TRY IT THIS WEEK."
  },
  {
    "key": "media",
    "label": "Photo or video",
    "type": "image",
    "default": "assets/photo-box-jump.jpg"
  }
],
};
window.DRILL_HOWTO_SPEC = DRILL_HOWTO_SPEC;
