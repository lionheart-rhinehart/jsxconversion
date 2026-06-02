// SPRINT BREAKDOWN — 9:16 Reel — uses <SprintTrace>
// Educational reel breaking down a 40yd sprint with a live speed curve.

function SprintBreakdownReel({ data = {} }) {
  const t = window.useTime ? window.useTime() : 0;
  const RED = '#c4141d';

  const eyebrow = data.eyebrow ?? 'YOUR 40 YARD BREAKDOWN';
  const title1 = data.title1 ?? 'EVERY YARD';
  const title2 = data.title2 ?? 'COUNTS.';
  const athleteName = data.athleteName ?? 'JORDAN K.';
  const peakSpeed = (typeof data.peakSpeed === 'number') ? data.peakSpeed : 21.4;
  const peakAt = (typeof data.peakAt === 'number') ? data.peakAt : 30;
  const distance = (typeof data.distance === 'number') ? data.distance : 40;
  const time40 = data.time40 ?? '4.61s';
  const insightLabel = data.insightLabel ?? 'WHERE YOU WIN OR LOSE';
  const insight = data.insight ?? 'Top speed peaks at 30 yards. Beyond that, conditioning takes over.';
  const ctaText = data.ctaText ?? 'TIME YOURS →';

  const eyebrowT = Math.max(0, Math.min(1, (t - 0.2) / 0.4));
  const title1T = window.Easing ? window.Easing.easeOutCubic(Math.max(0, Math.min(1, (t - 0.4) / 0.5))) : 1;
  const title2T = window.Easing ? window.Easing.easeOutCubic(Math.max(0, Math.min(1, (t - 0.7) / 0.5))) : 1;
  const traceT = Math.max(0, Math.min(1, (t - 1.4) / 0.4));
  const insightT = Math.max(0, Math.min(1, (t - 5.0) / 0.5));
  const ctaT = window.Easing ? window.Easing.easeOutBack(Math.max(0, Math.min(1, (t - 6.0) / 0.5))) : 1;

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a0b0d', overflow: 'hidden' }}>
      <Eyebrow top={110} fontSize={28}>// {eyebrow}</Eyebrow>

      <div style={{
        position: 'absolute', top: 180, left: 60, right: 60,
        fontFamily: 'Anton, sans-serif',
        fontSize: 150, color: '#fff', lineHeight: 0.88,
      }}>
        <div style={{ opacity: title1T, transform: `translateY(${(1 - title1T) * 16}px)` }}>{title1}</div>
        <div style={{ color: RED, opacity: title2T, transform: `translateY(${(1 - title2T) * 16}px)`, marginTop: 4 }}>{title2}</div>
      </div>

      {/* Athlete name + time chip */}
      <div style={{
        position: 'absolute', top: 540, left: 60, right: 60,
        display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
        opacity: traceT,
      }}>
        <div style={{
          fontFamily: 'Anton, sans-serif',
          fontSize: 50, color: '#fff', lineHeight: 0.95,
        }}>{athleteName}</div>
        <div style={{
          padding: '8px 14px',
          background: RED,
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: 32, fontWeight: 700, color: '#fff',
          letterSpacing: '0.06em',
          fontVariantNumeric: 'tabular-nums',
        }}>{time40}</div>
      </div>

      {/* Sprint trace element */}
      <div style={{
        position: 'absolute', top: 660, left: 60, right: 60, height: 600,
        opacity: traceT,
        transform: `translateY(${(1 - traceT) * 20}px)`,
        background: 'rgba(15,17,21,0.85)',
        border: '1px solid rgba(255,255,255,0.08)',
        padding: 12,
        boxSizing: 'border-box',
      }}>
        {window.SprintTrace && <window.SprintTrace
          peakSpeed={peakSpeed} peakAt={peakAt} distance={distance}
          unit="MPH" label="SPEED OVER DISTANCE"
        />}
      </div>

      <div style={{
        position: 'absolute', bottom: 230, left: 60, right: 60,
        padding: '20px 24px',
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.12)',
        borderLeft: `4px solid ${RED}`,
        opacity: insightT,
        transform: `translateX(${(1 - insightT) * -16}px)`,
      }}>
        <div style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: 16, color: RED, letterSpacing: '0.14em', marginBottom: 6,
        }}>// {insightLabel}</div>
        <div style={{
          fontFamily: 'Geist, sans-serif',
          fontSize: 26, color: '#fff', fontWeight: 500, lineHeight: 1.35,
        }}>{insight}</div>
      </div>

      <div style={{
        position: 'absolute', bottom: 90, left: 60, right: 60,
        padding: '22px 28px',
        background: RED,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        opacity: ctaT,
        transform: `translateY(${(1 - ctaT) * 16}px)`,
      }}>
        <div style={{ fontFamily: 'Anton, sans-serif', fontSize: 48, color: '#fff' }}>{ctaText}</div>
        <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 18, color: '#fff', letterSpacing: '0.1em' }}>BOOK ASSESSMENT</div>
      </div>
    </div>
  );
}

window.SprintBreakdownReel = SprintBreakdownReel;

const SPRINT_BREAKDOWN_SPEC = {
  id: 'sprint-breakdown',
  name: 'SPRINT BREAKDOWN',
  fields: [
  {
    "key": "duration",
    "label": "Length",
    "type": "slider",
    "default": 8,
    "min": 4,
    "max": 15,
    "step": 0.5,
    "unit": "s"
  },
  {
    "key": "eyebrow",
    "label": "Eyebrow tag",
    "type": "text",
    "default": "YOUR 40 YARD BREAKDOWN"
  },
  {
    "key": "title1",
    "label": "Title line 1",
    "type": "text",
    "default": "EVERY YARD"
  },
  {
    "key": "title2",
    "label": "Title line 2 (red)",
    "type": "text",
    "default": "COUNTS."
  },
  {
    "key": "athleteName",
    "label": "Athlete name",
    "type": "text",
    "default": "JORDAN K."
  },
  {
    "key": "time40",
    "label": "40yd time",
    "type": "text",
    "default": "4.61s"
  },
  {
    "key": "peakSpeed",
    "label": "Peak speed (mph)",
    "type": "number",
    "default": 21.4,
    "step": 0.1,
    "min": 5,
    "max": 40
  },
  {
    "key": "peakAt",
    "label": "Peak at (yards)",
    "type": "number",
    "default": 30,
    "step": 1,
    "min": 5,
    "max": 100
  },
  {
    "key": "distance",
    "label": "Total distance (yards)",
    "type": "number",
    "default": 40,
    "step": 5,
    "min": 10,
    "max": 120
  },
  {
    "key": "insightLabel",
    "label": "Insight tag",
    "type": "text",
    "default": "WHERE YOU WIN OR LOSE"
  },
  {
    "key": "insight",
    "label": "Insight text",
    "type": "textarea",
    "default": "Top speed peaks at 30 yards. Beyond that, conditioning takes over."
  },
  {
    "key": "ctaText",
    "label": "CTA text",
    "type": "text",
    "default": "TIME YOURS →"
  }
],
};
window.SPRINT_BREAKDOWN_SPEC = SPRINT_BREAKDOWN_SPEC;
