// ANATOMY LESSON — 9:16 Reel — uses <AnatomyCallouts>
// Educational reel teaching which muscles power a specific movement.

function AnatomyLessonReel({ data = {} }) {
  const t = window.useTime ? window.useTime() : 0;
  const RED = '#c4141d';

  const eyebrow = data.eyebrow ?? 'ANATOMY LESSON';
  const title1 = data.title1 ?? 'WHAT MAKES YOU';
  const title2 = data.title2 ?? 'FAST.';
  const movement = data.movement ?? 'THE SPRINT';
  const callout1Label = data.callout1Label ?? 'CORE';
  const callout1X = (typeof data.callout1X === 'number') ? data.callout1X : 50;
  const callout1Y = (typeof data.callout1Y === 'number') ? data.callout1Y : 32;
  const callout2Label = data.callout2Label ?? 'GLUTES';
  const callout2X = (typeof data.callout2X === 'number') ? data.callout2X : 60;
  const callout2Y = (typeof data.callout2Y === 'number') ? data.callout2Y : 58;
  const callout3Label = data.callout3Label ?? 'HAMSTRING';
  const callout3X = (typeof data.callout3X === 'number') ? data.callout3X : 40;
  const callout3Y = (typeof data.callout3Y === 'number') ? data.callout3Y : 70;
  const callout4Label = data.callout4Label ?? 'CALF';
  const callout4X = (typeof data.callout4X === 'number') ? data.callout4X : 62;
  const callout4Y = (typeof data.callout4Y === 'number') ? data.callout4Y : 84;
  const insight = data.insight ?? 'Power flows hip → knee → ground. Train the chain, not the parts.';
  const ctaText = data.ctaText ?? 'TRAIN THE CHAIN →';

  const eyebrowT = Math.max(0, Math.min(1, (t - 0.2) / 0.4));
  const titleT = window.Easing ? window.Easing.easeOutCubic(Math.max(0, Math.min(1, (t - 0.5) / 0.5))) : 1;
  const movT = Math.max(0, Math.min(1, (t - 1.0) / 0.4));
  const figT = Math.max(0, Math.min(1, (t - 1.4) / 0.4));
  const insightT = Math.max(0, Math.min(1, (t - 5.4) / 0.5));
  const ctaT = window.Easing ? window.Easing.easeOutBack(Math.max(0, Math.min(1, (t - 6.2) / 0.5))) : 1;

  const callouts = [
    { x: callout1X, y: callout1Y, label: callout1Label, side: callout1X < 50 ? 'left' : 'right' },
    { x: callout2X, y: callout2Y, label: callout2Label, side: callout2X < 50 ? 'left' : 'right' },
    { x: callout3X, y: callout3Y, label: callout3Label, side: callout3X < 50 ? 'left' : 'right' },
    { x: callout4X, y: callout4Y, label: callout4Label, side: callout4X < 50 ? 'left' : 'right' },
  ];

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a0b0d', overflow: 'hidden' }}>
      <div style={{
        position: 'absolute', top: 110, left: 60, right: 60,
        opacity: eyebrowT,
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: 28, color: RED, letterSpacing: '0.18em',
      }}>// {eyebrow}</div>

      <div style={{
        position: 'absolute', top: 180, left: 60, right: 60,
        fontFamily: 'Anton, sans-serif',
        fontSize: 140, color: '#fff', lineHeight: 0.88,
        opacity: titleT,
        transform: `translateY(${(1 - titleT) * 16}px)`,
      }}>{title1}<br/><span style={{ color: RED }}>{title2}</span></div>

      <div style={{
        position: 'absolute', top: 540, left: 60,
        padding: '10px 16px',
        background: RED,
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: 24, color: '#fff', letterSpacing: '0.14em',
        opacity: movT,
      }}>{movement}</div>

      {/* Anatomy callouts element */}
      <div style={{
        position: 'absolute', top: 620, left: 80, right: 80, height: 900,
        opacity: figT,
        transform: `scale(${0.92 + 0.08 * figT})`,
      }}>
        {window.AnatomyCallouts && <window.AnatomyCallouts callouts={callouts}/>}
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
        }}>// THE TAKEAWAY</div>
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
        <div style={{ fontFamily: 'Anton, sans-serif', fontSize: 44, color: '#fff' }}>{ctaText}</div>
        <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 16, color: '#fff', letterSpacing: '0.1em' }}>ATHLETESACCEL.COM</div>
      </div>
    </div>
  );
}

window.AnatomyLessonReel = AnatomyLessonReel;

const ANATOMY_LESSON_SPEC = {
  id: 'anatomy-lesson',
  name: 'ANATOMY LESSON',
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
    "default": "ANATOMY LESSON"
  },
  {
    "key": "title1",
    "label": "Title line 1",
    "type": "text",
    "default": "WHAT MAKES YOU"
  },
  {
    "key": "title2",
    "label": "Title line 2 (red)",
    "type": "text",
    "default": "FAST."
  },
  {
    "key": "movement",
    "label": "Movement label",
    "type": "text",
    "default": "THE SPRINT"
  },
  {
    "key": "callout1Label",
    "label": "Callout 1 label",
    "type": "text",
    "default": "CORE"
  },
  {
    "key": "callout1X",
    "label": "Callout 1 X %",
    "type": "number",
    "default": 50,
    "step": 1,
    "min": 0,
    "max": 100
  },
  {
    "key": "callout1Y",
    "label": "Callout 1 Y %",
    "type": "number",
    "default": 32,
    "step": 1,
    "min": 0,
    "max": 100
  },
  {
    "key": "callout2Label",
    "label": "Callout 2 label",
    "type": "text",
    "default": "GLUTES"
  },
  {
    "key": "callout2X",
    "label": "Callout 2 X %",
    "type": "number",
    "default": 60,
    "step": 1,
    "min": 0,
    "max": 100
  },
  {
    "key": "callout2Y",
    "label": "Callout 2 Y %",
    "type": "number",
    "default": 58,
    "step": 1,
    "min": 0,
    "max": 100
  },
  {
    "key": "callout3Label",
    "label": "Callout 3 label",
    "type": "text",
    "default": "HAMSTRING"
  },
  {
    "key": "callout3X",
    "label": "Callout 3 X %",
    "type": "number",
    "default": 40,
    "step": 1,
    "min": 0,
    "max": 100
  },
  {
    "key": "callout3Y",
    "label": "Callout 3 Y %",
    "type": "number",
    "default": 70,
    "step": 1,
    "min": 0,
    "max": 100
  },
  {
    "key": "callout4Label",
    "label": "Callout 4 label",
    "type": "text",
    "default": "CALF"
  },
  {
    "key": "callout4X",
    "label": "Callout 4 X %",
    "type": "number",
    "default": 62,
    "step": 1,
    "min": 0,
    "max": 100
  },
  {
    "key": "callout4Y",
    "label": "Callout 4 Y %",
    "type": "number",
    "default": 84,
    "step": 1,
    "min": 0,
    "max": 100
  },
  {
    "key": "insight",
    "label": "Insight",
    "type": "textarea",
    "default": "Power flows hip → knee → ground. Train the chain, not the parts."
  },
  {
    "key": "ctaText",
    "label": "CTA text",
    "type": "text",
    "default": "TRAIN THE CHAIN →"
  }
],
};
window.ANATOMY_LESSON_SPEC = ANATOMY_LESSON_SPEC;
