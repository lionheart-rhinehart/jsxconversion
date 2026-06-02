// SCHEDULE DROP — 9:16 Reel — 7s loop
// This week's classes. Use Sunday/Monday to drive the week's bookings.

function ScheduleDropReel({ data = {} }) {
  const eyebrow = data.eyebrow ?? 'ON THE CLOCK';
  const title1 = data.title1 ?? 'THIS';
  const title2 = data.title2 ?? 'WEEK.';
  const weekLabel = data.weekLabel ?? 'WEEK OF MAY 25 · CARMEL, IN';
  const ctaText = data.ctaText ?? 'BOOK YOUR SPOT →';
  const ctaUrl = data.ctaUrl ?? 'ATHLETESACCEL.COM';
  const media = data.media ?? 'assets/photo-conditioning.jpg';

  const t = useTime();
  const RED = '#c4141d';

  const eyebrowT = Math.max(0, Math.min(1, (t - 0.2) / 0.4));
  const titleT = Easing.easeOutCubic(Math.max(0, Math.min(1, (t - 0.5) / 0.5)));
  const dateT = Math.max(0, Math.min(1, (t - 1.0) / 0.4));

  const classes = [
    { day: 'MON', time: '4:30P', name: 'ACCELERATE',  sub: 'SPEED · U13-15',     full: false },
    { day: 'TUE', time: '5:30P', name: 'DOMINATE',    sub: 'STRENGTH · U16-18',  full: false },
    { day: 'WED', time: '4:30P', name: 'UNLEASH',     sub: 'POWER · U13-15',     full: true  },
    { day: 'THU', time: '5:30P', name: 'ACCELERATE',  sub: 'SPEED · U16-18',     full: false },
    { day: 'FRI', time: '6:30P', name: 'OPEN GYM',    sub: 'ALL AGES',           full: false },
  ];

  const rowT = (i) => Easing.easeOutCubic(Math.max(0, Math.min(1, (t - (1.6 + i * 0.4)) / 0.45)));

  const ctaT = Easing.easeOutBack(Math.max(0, Math.min(1, (t - 5.0) / 0.5)));

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
        filter: 'brightness(0.18) saturate(0.5)',
        transform: `scale(${1.05 + 0.02 * (t / 7)})`,
      }}
      />

      <div style={{
        position: 'absolute', top: 110, left: 60, right: 60,
        opacity: eyebrowT,
      }}>
        <Eyebrow top={150} fontSize={28}>// {eyebrow}</Eyebrow>
      </div>

      <div style={{
        position: 'absolute', top: 180, left: 60, right: 60,
        fontFamily: 'Anton, sans-serif',
        fontSize: 150, color: '#fff', lineHeight: 0.88,
        opacity: titleT,
        transform: `translateY(${(1 - titleT) * 18}px)`,
      }}>{title1}<br/><span style={{color: RED}}>{title2}</span></div>

      <div style={{
        position: 'absolute',
        top: 510, left: 60,
        opacity: dateT,
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: 22, color: '#969ca7',
        letterSpacing: '0.12em',
      }}>{weekLabel}</div>

      {/* Class list */}
      <div style={{
        position: 'absolute',
        top: 580, left: 60, right: 60,
        display: 'flex', flexDirection: 'column', gap: 14,
      }}>
        {classes.map((c, i) => {
          const r = rowT(i);
          return (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 24,
              padding: '22px 26px',
              background: c.full ? 'rgba(196,20,29,0.12)' : 'rgba(31,34,39,0.85)',
              border: c.full ? `1px solid ${RED}` : '1px solid rgba(255,255,255,0.08)',
              opacity: r,
              transform: `translateX(${(1 - r) * -30}px)`,
            }}>
              <div style={{
                fontFamily: 'Anton, sans-serif',
                fontSize: 60, color: RED, lineHeight: 0.85,
                width: 110, flexShrink: 0,
              }}>{c.day}</div>
              <div style={{
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: 32, color: '#fff', fontWeight: 700,
                width: 140, fontVariantNumeric: 'tabular-nums',
              }}>{c.time}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontFamily: 'Anton, sans-serif',
                  fontSize: 44, color: '#fff', lineHeight: 0.95,
                }}>{c.name}</div>
                <div style={{
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: 16, color: '#969ca7', letterSpacing: '0.08em', marginTop: 4,
                }}>{c.sub}</div>
              </div>
              <div style={{
                padding: '6px 12px',
                background: c.full ? RED : 'transparent',
                border: `1px solid ${c.full ? RED : 'rgba(255,255,255,0.2)'}`,
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: 16, fontWeight: 700,
                color: c.full ? '#fff' : '#969ca7',
                letterSpacing: '0.08em',
              }}>{c.full ? 'FULL' : 'OPEN'}</div>
            </div>
          );
        })}
      </div>

      {/* CTA */}
      <div style={{
        position: 'absolute', bottom: 110, left: 60, right: 60,
        padding: '24px 28px',
        background: RED,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        opacity: ctaT,
        transform: `translateY(${(1 - ctaT) * 20}px)`,
      }}>
        <div style={{
          fontFamily: 'Anton, sans-serif',
          fontSize: 50, color: '#fff',
        }}>{ctaText}</div>
        <div style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: 20, color: '#fff', letterSpacing: '0.1em',
        }}>{ctaUrl}</div>
      </div>
    </div>
  );
}

window.ScheduleDropReel = ScheduleDropReel;

const SCHEDULE_DROP_SPEC = {
  id: 'schedule-drop',
  name: 'SCHEDULE DROP',
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
    "key": "eyebrow",
    "label": "Eyebrow tag",
    "type": "text",
    "default": "ON THE CLOCK"
  },
  {
    "key": "title1",
    "label": "Title line 1",
    "type": "text",
    "default": "THIS"
  },
  {
    "key": "title2",
    "label": "Title line 2 (red)",
    "type": "text",
    "default": "WEEK."
  },
  {
    "key": "weekLabel",
    "label": "Week + location",
    "type": "text",
    "default": "WEEK OF MAY 25 · CARMEL, IN"
  },
  {
    "key": "ctaText",
    "label": "CTA text",
    "type": "text",
    "default": "BOOK YOUR SPOT →"
  },
  {
    "key": "ctaUrl",
    "label": "CTA URL",
    "type": "text",
    "default": "ATHLETESACCEL.COM"
  },
  {
    "key": "media",
    "label": "Background photo or video",
    "type": "image",
    "default": "assets/photo-conditioning.jpg"
  }
],
};
window.SCHEDULE_DROP_SPEC = SCHEDULE_DROP_SPEC;
