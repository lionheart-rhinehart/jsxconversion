// DRILL OF THE DAY — 9:16 Reel — 7s loop
// Single-drill spotlight. Different cadence from the multi-drill workout post.

function DrillOfDayReel({ data = {} }) {
  const dayNumber = data.dayNumber ?? '# 042';
  const eyebrow = data.eyebrow ?? 'DRILL OF THE DAY';
  const drillLine1 = data.drillLine1 ?? 'BAND-RESISTED';
  const drillLine2 = data.drillLine2 ?? 'SPRINT.';
  const whyText = data.whyText ?? 'Overload the acceleration phase. Take the band off and your first 3 steps feel weightless.';
  const ctaText = data.ctaText ?? 'SAVE FOR LATER ↓';
  const media = data.media ?? 'assets/photo-band-work.jpg';

  const t = useTime();
  const RED = '#c4141d';

  const photoScale = 1.08 - 0.05 * Math.min(1, t / 7);

  // Day badge (top)
  const badgeT = Easing.easeOutBack(Math.max(0, Math.min(1, (t - 0.3) / 0.5)));
  // Name slides up
  const nameT = Easing.easeOutCubic(Math.max(0, Math.min(1, (t - 0.9) / 0.5)));
  // Stats block
  const statsT = Easing.easeOutCubic(Math.max(0, Math.min(1, (t - 1.6) / 0.5)));
  // Cue line by line
  const cue1T = Math.max(0, Math.min(1, (t - 2.4) / 0.4));
  const cue2T = Math.max(0, Math.min(1, (t - 3.0) / 0.4));
  const cue3T = Math.max(0, Math.min(1, (t - 3.6) / 0.4));
  // Why
  const whyT = Easing.easeOutCubic(Math.max(0, Math.min(1, (t - 4.6) / 0.5)));
  // CTA
  const ctaT = Easing.easeOutBack(Math.max(0, Math.min(1, (t - 5.6) / 0.5)));

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a0b0d', overflow: 'hidden' }}>
      <window.TrimmedMedia
        src={media}
        clipStart={data.media_clipStart}
        clipEnd={data.media_clipEnd}
        muted={!data.media_audio}
        style={{
        position: 'absolute', inset: 0,
        width: '100%', height: '100%', objectFit: 'cover',
        objectPosition: '50% 40%',
        transform: `scale(${photoScale})`,
        filter: 'contrast(1.08) saturate(0.85) brightness(0.7)',
      }}
      />
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, rgba(10,11,13,0.55) 0%, rgba(10,11,13,0.05) 35%, rgba(10,11,13,0.05) 50%, rgba(10,11,13,0.95) 100%)',
      }}/>

      {/* Day badge */}
      <div style={{
        position: 'absolute', top: 120, left: 60,
        display: 'flex', gap: 14, alignItems: 'center',
        opacity: badgeT,
        transform: `scale(${0.94 + 0.06 * badgeT})`,
      }}>
        <div style={{
          padding: '14px 22px',
          background: RED,
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: 26, fontWeight: 700,
          color: '#fff', letterSpacing: '0.14em',
        }}>{dayNumber}</div>
        <Eyebrow top={150} fontSize={24}>{eyebrow}</Eyebrow>
      </div>

      {/* Name */}
      <div style={{
        position: 'absolute',
        bottom: 1140, left: 60, right: 60,
        opacity: nameT,
        transform: `translateY(${(1 - nameT) * 24}px)`,
      }}>
        <div style={{
          fontFamily: 'Anton, sans-serif',
          fontSize: 200, color: '#fff', lineHeight: 0.85,
        }}>{drillLine1}</div>
        <div style={{
          fontFamily: 'Anton, sans-serif',
          fontSize: 200, color: RED, lineHeight: 0.85,
          marginTop: 4,
        }}>{drillLine2}</div>
      </div>

      {/* Stats strip */}
      <div style={{
        position: 'absolute',
        bottom: 920, left: 60, right: 60,
        display: 'flex', gap: 12,
        opacity: statsT,
        transform: `translateY(${(1 - statsT) * 16}px)`,
      }}>
        {[
          ['6 × 20m', 'VOLUME'],
          ['MED', 'BAND TENSION'],
          ['90s', 'REST'],
        ].map(([v, l]) => (
          <div key={l} style={{
            flex: 1,
            padding: '20px 16px',
            background: 'rgba(10,11,13,0.85)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderTop: `3px solid ${RED}`,
          }}>
            <div style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: 36, color: '#fff', fontWeight: 700,
              fontVariantNumeric: 'tabular-nums',
            }}>{v}</div>
            <div style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: 14, color: '#969ca7',
              letterSpacing: '0.12em', marginTop: 6,
            }}>{l}</div>
          </div>
        ))}
      </div>

      {/* Coaching cues */}
      <div style={{
        position: 'absolute',
        bottom: 460, left: 60, right: 60,
      }}>
        <div style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: 22, color: '#969ca7', letterSpacing: '0.14em',
          marginBottom: 20,
          opacity: cue1T,
        }}>// COACHING CUES</div>
        {[
          { i: 1, txt: 'Lean forward 45°. Stay long.',          op: cue1T },
          { i: 2, txt: 'Drive the knees. Punch the ground.',    op: cue2T },
          { i: 3, txt: 'Three steps, three breaths. Reset.',    op: cue3T },
        ].map((c) => (
          <div key={c.i} style={{
            display: 'flex', gap: 18, alignItems: 'baseline',
            opacity: c.op,
            transform: `translateX(${(1 - c.op) * -20}px)`,
            marginBottom: 12,
          }}>
            <div style={{
              fontFamily: 'Anton, sans-serif',
              fontSize: 44, color: RED, width: 50, flexShrink: 0,
              fontVariantNumeric: 'tabular-nums',
            }}>0{c.i}</div>
            <div style={{
              fontFamily: 'Geist, sans-serif',
              fontSize: 32, color: '#fff', fontWeight: 500, lineHeight: 1.3,
            }}>{c.txt}</div>
          </div>
        ))}
      </div>

      {/* Why */}
      <div style={{
        position: 'absolute',
        bottom: 240, left: 60, right: 60,
        padding: '20px 24px',
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.12)',
        borderLeft: `4px solid ${RED}`,
        opacity: whyT,
        transform: `translateX(${(1 - whyT) * -20}px)`,
      }}>
        <div style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: 16, color: RED, letterSpacing: '0.14em',
          marginBottom: 6,
        }}>WHY IT WORKS</div>
        <div style={{
          fontFamily: 'Geist, sans-serif',
          fontSize: 24, color: '#fff', fontWeight: 500, lineHeight: 1.35,
        }}>{whyText}</div>
      </div>

      {/* CTA */}
      <div style={{
        position: 'absolute',
        bottom: 100, left: 60, right: 60,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        opacity: ctaT,
      }}>
        <div style={{
          fontFamily: 'Anton, sans-serif',
          fontSize: 38, color: '#fff',
        }}>{ctaText}</div>
        <div style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: 18, color: '#969ca7', letterSpacing: '0.1em',
        }}>ATHLETESACCEL.COM</div>
      </div>
    </div>
  );
}

window.DrillOfDayReel = DrillOfDayReel;

const DRILL_OF_DAY_SPEC = {
  id: 'drill-of-day',
  name: 'DRILL OF DAY',
  fields: [
  {
    "key": "duration",
    "label": "Length",
    "type": "slider",
    "default": 7,
    "min": 3,
    "max": 15,
    "step": 0.5,
    "unit": "s"
  },
  {
    "key": "dayNumber",
    "label": "Day number",
    "type": "text",
    "default": "# 042"
  },
  {
    "key": "eyebrow",
    "label": "Eyebrow tag",
    "type": "text",
    "default": "DRILL OF THE DAY"
  },
  {
    "key": "drillLine1",
    "label": "Drill name line 1",
    "type": "text",
    "default": "BAND-RESISTED"
  },
  {
    "key": "drillLine2",
    "label": "Drill name line 2 (red)",
    "type": "text",
    "default": "SPRINT."
  },
  {
    "key": "whyText",
    "label": "Why it works",
    "type": "textarea",
    "default": "Overload the acceleration phase. Take the band off and your first 3 steps feel weightless."
  },
  {
    "key": "ctaText",
    "label": "CTA text",
    "type": "text",
    "default": "SAVE FOR LATER ↓"
  },
  {
    "key": "media",
    "label": "Photo or video",
    "type": "image",
    "default": "assets/photo-band-work.jpg"
  }
],
};
window.DRILL_OF_DAY_SPEC = DRILL_OF_DAY_SPEC;
