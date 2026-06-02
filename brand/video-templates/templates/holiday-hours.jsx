// HOLIDAY HOURS — 9:16 Reel — 6s loop
// Clean info card: holiday name, hours rows, reopen note. No photo needed.
// Editable: holiday, subtitle, 3 schedule rows, reopen note.

const HOLIDAY_HOURS_SPEC = {
  id: 'holiday-hours',
  name: 'HOLIDAY HOURS',
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
      "key": "eyebrow",
      "role": "eyebrow",
      "label": "Eyebrow",
      "type": "text",
      "default": "{city name} SPORT PARENT"
    },
    {
      "key": "holiday",
      "label": "Holiday",
      "type": "text",
      "default": "HOLIDAY HOURS"
    },
    {
      "key": "subtitle",
      "label": "Subtitle",
      "type": "text",
      "default": "PLAN YOUR TRAINING AROUND THE BREAK"
    },
    {
      "key": "d1day",
      "label": "Row 1 day",
      "type": "text",
      "default": "DEC 24 — EVE"
    },
    {
      "key": "d1hrs",
      "label": "Row 1 hrs",
      "type": "text",
      "default": "6AM – 12PM"
    },
    {
      "key": "d2day",
      "label": "Row 2 day",
      "type": "text",
      "default": "DEC 25 — DAY"
    },
    {
      "key": "d2hrs",
      "label": "Row 2 hrs",
      "type": "text",
      "default": "CLOSED"
    },
    {
      "key": "d3day",
      "label": "Row 3 day",
      "type": "text",
      "default": "DEC 26 — 31"
    },
    {
      "key": "d3hrs",
      "label": "Row 3 hrs",
      "type": "text",
      "default": "8AM – 4PM"
    },
    {
      "key": "reopen",
      "label": "Reopen note",
      "type": "text",
      "default": "FULL SCHEDULE RESUMES JAN 2"
    }
  ],
};

function HolidayHoursReel({ data = {} }) {
  const t = useTime();
  const RED = '#c4141d';

  const holiday  = data.holiday  ?? 'HOLIDAY HOURS';
  const subtitle = data.subtitle ?? 'PLAN YOUR TRAINING AROUND THE BREAK';
  const rows = [
    { day: data.d1day ?? 'DEC 24 — EVE', hrs: data.d1hrs ?? '6AM – 12PM' },
    { day: data.d2day ?? 'DEC 25 — DAY', hrs: data.d2hrs ?? 'CLOSED' },
    { day: data.d3day ?? 'DEC 26 — 31',  hrs: data.d3hrs ?? '8AM – 4PM' },
  ];
  const reopen = data.reopen ?? 'FULL SCHEDULE RESUMES JAN 2';

  const E = Easing;
  const titleT = E.easeOutCubic(Math.max(0, Math.min(1, (t - 0.3) / 0.6)));
  const subT   = Math.max(0, Math.min(1, (t - 0.9) / 0.5));
  const reopenT = E.easeOutBack(Math.max(0, Math.min(1, (t - 3.6) / 0.5)));
  const logoT  = Math.max(0, Math.min(1, (t - 4.2) / 0.6));

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a0b0d', overflow: 'hidden' }}>
      <div data-eyebrow style={{ position: 'absolute', top: 90, left: 90, right: 90, fontFamily: '"JetBrains Mono", monospace', fontSize: 34, color: '#c4141d', letterSpacing: '0.06em', textTransform: 'uppercase', zIndex: 5 }}>{data.eyebrow ?? "{city name} SPORT PARENT"}</div>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(120% 70% at 50% 18%, rgba(196,20,29,0.16) 0%, rgba(10,11,13,0.7) 55%, #0a0b0d 100%)' }}/>
      {/* corner ticks */}
      <div style={{ position: 'absolute', top: 80, left: 60, width: 70, height: 70, borderTop: `5px solid ${RED}`, borderLeft: `5px solid ${RED}` }}/>
      <div style={{ position: 'absolute', bottom: 80, right: 60, width: 70, height: 70, borderBottom: `5px solid ${RED}`, borderRight: `5px solid ${RED}` }}/>

      {/* Title */}
      <div style={{ position: 'absolute', top: 230, left: 60, right: 60, textAlign: 'center', opacity: titleT,
        transform: `translateY(${(1 - titleT) * 22}px)` }}>
        <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 32, color: RED, letterSpacing: '0.24em', marginBottom: 18 }}>// NOTICE</div>
        <div style={{ fontFamily: 'Anton, sans-serif', fontSize: 168, color: '#fff', lineHeight: 0.84, textWrap: 'balance' }}>{holiday}</div>
        <div style={{ fontFamily: '"Geist", sans-serif', fontWeight: 500, fontSize: 34, color: '#969ca7', marginTop: 22,
          opacity: subT, letterSpacing: '0.02em' }}>{subtitle}</div>
      </div>

      {/* Schedule rows */}
      <div style={{ position: 'absolute', top: 800, left: 60, right: 60, display: 'flex', flexDirection: 'column', gap: 4 }}>
        {rows.map((r, i) => {
          const rT = E.easeOutCubic(Math.max(0, Math.min(1, (t - (1.6 + i * 0.4)) / 0.5)));
          const closed = /closed/i.test(r.hrs);
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '30px 36px', background: i % 2 ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.06)',
              borderLeft: `5px solid ${closed ? RED : 'rgba(255,255,255,0.2)'}`, opacity: rT,
              transform: `translateX(${(1 - rT) * 40}px)` }}>
              <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 38, color: '#e8eaed', letterSpacing: '0.04em' }}>{r.day}</span>
              <span style={{ fontFamily: 'Anton, sans-serif', fontSize: 56, color: closed ? RED : '#fff', lineHeight: 1 }}>{r.hrs}</span>
            </div>
          );
        })}
      </div>

      {/* Reopen note */}
      <div style={{ position: 'absolute', bottom: 250, left: 60, right: 60, textAlign: 'center', opacity: Math.min(1, reopenT),
        transform: `scale(${0.85 + 0.15 * reopenT})` }}>
        <span style={{ display: 'inline-block', background: RED, color: '#fff', padding: '18px 38px',
          fontFamily: 'Anton, sans-serif', fontSize: 52, letterSpacing: '0.02em' }}>{reopen}</span>
      </div>

      {/* Logo */}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 100, textAlign: 'center', opacity: logoT,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <img src="assets/logo.png" style={{ width: 60, height: 60, objectFit: 'contain' }}/>
        <div style={{ fontFamily: 'Anton, sans-serif', fontSize: 34, color: '#fff' }}>ATHLETES ACCELERATION</div>
      </div>
    </div>
  );
}

window.HolidayHoursReel = HolidayHoursReel;
window.HOLIDAY_HOURS_SPEC = HOLIDAY_HOURS_SPEC;
