// A DAY AT AA — 9:16 Reel — timestamp-driven montage walkthrough
function DayAtAAReel({ data = {} }) {
  const t = window.useTime ? window.useTime() : 0;
  const RED = '#c4141d';

  const eyebrow = data.eyebrow ?? 'A DAY AT AA';
  const title1 = data.title1 ?? 'HERE\'S WHAT';
  const title2 = data.title2 ?? 'A DAY LOOKS LIKE.';
  const slides = [
    { time: data.time1 ?? '5:30 AM', caption: data.cap1 ?? 'COACH GETS HERE.',     media: data.media1 ?? 'assets/photo-gym-wide.jpg' },
    { time: data.time2 ?? '6:00 AM', caption: data.cap2 ?? 'FIRST ATHLETES IN.',   media: data.media2 ?? 'assets/photo-coach-action.jpg' },
    { time: data.time3 ?? '9:00 AM', caption: data.cap3 ?? 'TEAM SESSIONS BEGIN.', media: data.media3 ?? 'assets/photo-group-coaching.jpg' },
    { time: data.time4 ?? '4:00 PM', caption: data.cap4 ?? 'AFTER-SCHOOL RUSH.',   media: data.media4 ?? 'assets/photo-lifting.jpg' },
    { time: data.time5 ?? '9:30 PM', caption: data.cap5 ?? 'LAST REP CLOCKED.',    media: data.media5 ?? 'assets/photo-jump-male.jpg' },
  ];
  const ctaText = data.ctaText ?? 'COME SEE IT YOURSELF →';

  const slideDur = 1.1;
  const eyebrowT = Math.max(0, Math.min(1, (t - 0.2) / 0.4));
  const titleT = window.Easing ? window.Easing.easeOutCubic(Math.max(0, Math.min(1, (t - 0.4) / 0.5))) : 1;
  const ctaT = window.Easing ? window.Easing.easeOutBack(Math.max(0, Math.min(1, (t - 7.0) / 0.5))) : 1;

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a0b0d', overflow: 'hidden' }}>
      {/* Background slides */}
      {slides.map((s, i) => {
        const from = 1.3 + i * slideDur;
        const to = from + slideDur;
        const active = t >= from && t <= to + 0.2;
        if (!active) return null;
        const inT = Math.max(0, Math.min(1, (t - from) / 0.2));
        const outT = Math.max(0, Math.min(1, (t - to) / 0.2));
        const op = inT * (1 - outT);
        const localT = (t - from) / (to - from);
        return (
          <React.Fragment key={i}>
            {window.TrimmedMedia && <window.TrimmedMedia src={s.media} style={{
              position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
              opacity: op, transform: `scale(${1.05 + 0.05 * localT})`,
              filter: 'brightness(0.6) saturate(0.85) contrast(1.05)',
            }}/>}
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(10,11,13,0.4) 0%, rgba(10,11,13,0) 30%, rgba(10,11,13,0) 50%, rgba(10,11,13,0.95) 100%)', opacity: op }}/>
            {/* Big timestamp */}
            <div style={{ position: 'absolute', bottom: 600, left: 60, opacity: op }}>
              <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 26, color: RED, letterSpacing: '0.18em', marginBottom: 8 }}>// {String(i + 1).padStart(2, '0')} OF {String(slides.length).padStart(2, '0')}</div>
              <div style={{ fontFamily: 'Anton, sans-serif', fontSize: 160, color: '#fff', lineHeight: 0.85, fontVariantNumeric: 'tabular-nums' }}>{s.time}</div>
              <div style={{ marginTop: 14, fontFamily: 'Anton, sans-serif', fontSize: 60, color: RED, lineHeight: 0.95 }}>{s.caption}</div>
            </div>
          </React.Fragment>
        );
      })}

      {/* Front matter (until ~1.3s) */}
      {t < 1.4 && (
        <>
          <div style={{ position: 'absolute', top: 110, left: 60, padding: '8px 16px', background: RED, fontFamily: '"JetBrains Mono", monospace', fontSize: 24, color: '#fff', letterSpacing: '0.16em', opacity: eyebrowT }}>// {eyebrow}</div>
          <div style={{ position: 'absolute', top: 220, left: 60, right: 60, fontFamily: 'Anton, sans-serif', fontSize: 140, color: '#fff', lineHeight: 0.88, opacity: titleT }}>{title1}<br/><span style={{ color: RED }}>{title2}</span></div>
        </>
      )}

      <div style={{ position: 'absolute', bottom: 90, left: 60, right: 60, padding: '22px 28px', background: RED, display: 'flex', alignItems: 'center', justifyContent: 'space-between', opacity: ctaT }}>
        <div style={{ fontFamily: 'Anton, sans-serif', fontSize: 44, color: '#fff' }}>{ctaText}</div>
        <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 16, color: '#fff', letterSpacing: '0.1em' }}>BOOK A TOUR</div>
      </div>
    </div>
  );
}
window.DayAtAAReel = DayAtAAReel;
const DAY_AT_AA_SPEC = {
  id: 'day-at-aa', name: 'A DAY AT AA',
  fields: [
  {
    "key": "duration",
    "label": "Length",
    "type": "slider",
    "default": 9,
    "min": 6,
    "max": 15,
    "step": 0.5,
    "unit": "s"
  },
  {
    "key": "eyebrow",
    "label": "Eyebrow",
    "type": "text",
    "default": "A DAY AT AA"
  },
  {
    "key": "title1",
    "label": "Title 1",
    "type": "text",
    "default": "HERE'S WHAT"
  },
  {
    "key": "title2",
    "label": "Title 2 (red)",
    "type": "text",
    "default": "A DAY LOOKS LIKE."
  },
  {
    "key": "time1",
    "label": "Slide 1 time",
    "type": "text",
    "default": "5:30 AM"
  },
  {
    "key": "cap1",
    "label": "Slide 1 caption",
    "type": "text",
    "default": "COACH GETS HERE."
  },
  {
    "key": "media1",
    "label": "Slide 1 media",
    "type": "image",
    "default": "assets/photo-gym-wide.jpg"
  },
  {
    "key": "time2",
    "label": "Slide 2 time",
    "type": "text",
    "default": "6:00 AM"
  },
  {
    "key": "cap2",
    "label": "Slide 2 caption",
    "type": "text",
    "default": "FIRST ATHLETES IN."
  },
  {
    "key": "media2",
    "label": "Slide 2 media",
    "type": "image",
    "default": "assets/photo-coach-action.jpg"
  },
  {
    "key": "time3",
    "label": "Slide 3 time",
    "type": "text",
    "default": "9:00 AM"
  },
  {
    "key": "cap3",
    "label": "Slide 3 caption",
    "type": "text",
    "default": "TEAM SESSIONS BEGIN."
  },
  {
    "key": "media3",
    "label": "Slide 3 media",
    "type": "image",
    "default": "assets/photo-group-coaching.jpg"
  },
  {
    "key": "time4",
    "label": "Slide 4 time",
    "type": "text",
    "default": "4:00 PM"
  },
  {
    "key": "cap4",
    "label": "Slide 4 caption",
    "type": "text",
    "default": "AFTER-SCHOOL RUSH."
  },
  {
    "key": "media4",
    "label": "Slide 4 media",
    "type": "image",
    "default": "assets/photo-lifting.jpg"
  },
  {
    "key": "time5",
    "label": "Slide 5 time",
    "type": "text",
    "default": "9:30 PM"
  },
  {
    "key": "cap5",
    "label": "Slide 5 caption",
    "type": "text",
    "default": "LAST REP CLOCKED."
  },
  {
    "key": "media5",
    "label": "Slide 5 media",
    "type": "image",
    "default": "assets/photo-jump-male.jpg"
  },
  {
    "key": "ctaText",
    "label": "CTA",
    "type": "text",
    "default": "COME SEE IT YOURSELF →"
  }
],
};
window.DAY_AT_AA_SPEC = DAY_AT_AA_SPEC;
