// VBT BAR SPEED — 9:16 Reel — uses <VelocityMeter>
// Educational reel explaining velocity-based training with a live bar-speed
// gauge as the centerpiece visual.

function VBTBarSpeedReel({ data = {} }) {
  const t = window.useTime ? window.useTime() : 0;
  const RED = (window.__BRAND__ && window.__BRAND__.brand_red || '#c4141d');

  const eyebrow = data.eyebrow ?? 'VELOCITY-BASED TRAINING';
  const title1 = data.title1 ?? "DON'T LIFT";
  const title2 = data.title2 ?? 'JUST HEAVY.';
  const subhead = data.subhead ?? 'LIFT FAST. THEN HEAVY.';
  const liftLabel = data.liftLabel ?? 'BACK SQUAT · 80% 1RM';
  const targetValue = (typeof data.targetValue === 'number') ? data.targetValue : 0.85;
  const peakValue = (typeof data.peakValue === 'number') ? data.peakValue : 0.93;
  const maxValue = (typeof data.maxValue === 'number') ? data.maxValue : 1.2;
  const insight = data.insight ?? 'Below 0.5 m/s? You\'re grinding. Stop sets when speed drops.';
  const ctaText = data.ctaText ?? 'TRAIN SMARTER →';

  // Eyebrow / title in first ~1s
  const eyebrowT = Math.max(0, Math.min(1, (t - 0.2) / 0.4));
  const title1T = window.Easing ? window.Easing.easeOutCubic(Math.max(0, Math.min(1, (t - 0.4) / 0.5))) : 1;
  const title2T = window.Easing ? window.Easing.easeOutCubic(Math.max(0, Math.min(1, (t - 0.7) / 0.5))) : 1;
  const subT = Math.max(0, Math.min(1, (t - 1.2) / 0.4));
  const meterT = Math.max(0, Math.min(1, (t - 1.6) / 0.4));
  const insightT = Math.max(0, Math.min(1, (t - 4.6) / 0.5));
  const ctaT = window.Easing ? window.Easing.easeOutBack(Math.max(0, Math.min(1, (t - 5.8) / 0.5))) : 1;

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

      <div style={{
        position: 'absolute', top: 530, left: 60, right: 60,
        opacity: subT,
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: 22, color: '#969ca7', letterSpacing: '0.12em',
      }}>{subhead}</div>

      {/* The signature element — Velocity Meter */}
      <div style={{
        position: 'absolute', top: 620, left: 60, right: 60, height: 700,
        opacity: meterT,
        transform: `translateY(${(1 - meterT) * 20}px)`,
      }}>
        <div style={{
          height: '100%',
          background: 'rgba(15,17,21,0.85)',
          border: '1px solid rgba(255,255,255,0.08)',
          padding: 36,
          boxSizing: 'border-box',
          display: 'flex', flexDirection: 'column',
        }}>
          <div style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 20, color: '#969ca7',
            letterSpacing: '0.12em', marginBottom: 16,
          }}>{liftLabel}</div>
          <div style={{ flex: 1, position: 'relative' }}>
            {window.VelocityMeter && <window.VelocityMeter
              value={peakValue} max={maxValue} target={targetValue}
              label="BAR SPEED" unit="m/s"
            />}
          </div>
        </div>
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
        }}>// COACH NOTE</div>
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
        <div style={{
          fontFamily: 'Anton, sans-serif',
          fontSize: 48, color: '#fff',
        }}>{ctaText}</div>
        <div style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: 18, color: '#fff', letterSpacing: '0.1em',
        }}>ATHLETESACCEL.COM</div>
      </div>
    </div>
  );
}

window.VBTBarSpeedReel = VBTBarSpeedReel;

const VBT_BAR_SPEED_SPEC = {
  id: 'vbt-bar-speed',
  name: 'VBT BAR SPEED',
  fields: [
  {
    "key": "duration",
    "label": "Length",
    "type": "slider",
    "default": 7,
    "min": 4,
    "max": 15,
    "step": 0.5,
    "unit": "s"
  },
  {
    "key": "eyebrow",
    "label": "Eyebrow tag",
    "type": "text",
    "default": "VELOCITY-BASED TRAINING"
  },
  {
    "key": "title1",
    "label": "Title line 1",
    "type": "text",
    "default": "DON'T LIFT"
  },
  {
    "key": "title2",
    "label": "Title line 2 (red)",
    "type": "text",
    "default": "JUST HEAVY."
  },
  {
    "key": "subhead",
    "label": "Subhead",
    "type": "text",
    "default": "LIFT FAST. THEN HEAVY."
  },
  {
    "key": "liftLabel",
    "label": "Lift label",
    "type": "text",
    "default": "BACK SQUAT · 80% 1RM"
  },
  {
    "key": "targetValue",
    "label": "Target speed (m/s)",
    "type": "number",
    "default": 0.85,
    "step": 0.05,
    "min": 0.2,
    "max": 2
  },
  {
    "key": "peakValue",
    "label": "Peak speed (m/s)",
    "type": "number",
    "default": 0.93,
    "step": 0.05,
    "min": 0.2,
    "max": 2
  },
  {
    "key": "maxValue",
    "label": "Gauge max (m/s)",
    "type": "number",
    "default": 1.2,
    "step": 0.1,
    "min": 0.5,
    "max": 3
  },
  {
    "key": "insight",
    "label": "Coach insight",
    "type": "textarea",
    "default": "Below 0.5 m/s? You're grinding. Stop sets when speed drops."
  },
  {
    "key": "ctaText",
    "label": "CTA text",
    "type": "text",
    "default": "TRAIN SMARTER →"
  }
],
};
window.VBT_BAR_SPEED_SPEC = VBT_BAR_SPEED_SPEC;
