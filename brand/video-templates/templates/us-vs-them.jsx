// US VS THEM — 9:16 — uses <ComparisonSlider>
function UsVsThemReel({ data = {} }) {
  const t = window.useTime ? window.useTime() : 0;
  const RED = (window.__BRAND__ && window.__BRAND__.brand_red || '#c4141d');
  const eyebrow = data.eyebrow ?? 'THE DIFFERENCE';
  const title1 = data.title1 ?? 'AVG SENIOR.';
  const title2 = data.title2 ?? 'AA SENIOR.';
  const metric = data.metric ?? '40 YD DASH · 12-MONTH AVG';
  const leftLabel = data.leftLabel ?? 'NO TRAINING';
  const rightLabel = data.rightLabel ?? 'WITH AA';
  const leftValue = (typeof data.leftValue === 'number') ? data.leftValue : 5.62;
  const rightValue = (typeof data.rightValue === 'number') ? data.rightValue : 4.91;
  const unit = data.unit ?? 's';
  const lowerIsBetter = (data.lowerIsBetter !== false);
  const insight = data.insight ?? 'Same age. Same school. Different system.';
  const ctaText = data.ctaText ?? 'BUILD YOUR DIFFERENCE →';

  const eT = Math.max(0, Math.min(1, (t-0.2)/0.4));
  const tiT = window.Easing ? window.Easing.easeOutCubic(Math.max(0, Math.min(1, (t-0.4)/0.5))) : 1;
  const cT = Math.max(0, Math.min(1, (t-1.0)/0.4));
  const iT = Math.max(0, Math.min(1, (t-4.6)/0.5));
  const ctaT = window.Easing ? window.Easing.easeOutBack(Math.max(0, Math.min(1, (t-5.4)/0.5))) : 1;

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a0b0d', overflow: 'hidden' }}>
      <Eyebrow top={110} fontSize={24}>// {eyebrow}</Eyebrow>
      <div style={{ position: 'absolute', top: 200, left: 60, right: 60, fontFamily: 'Anton, sans-serif', fontSize: 130, color: '#fff', lineHeight: 0.88, opacity: tiT }}>{title1}<br/><span style={{color:RED}}>{title2}</span></div>
      <div style={{ position: 'absolute', top: 620, left: 40, right: 40, height: 880, opacity: cT, background: 'rgba(15,17,21,0.85)', border: '1px solid rgba(255,255,255,0.08)' }}>
        {window.ComparisonSlider && <window.ComparisonSlider leftLabel={leftLabel} rightLabel={rightLabel} leftValue={leftValue} rightValue={rightValue} unit={unit} metric={metric} lowerIsBetter={lowerIsBetter}/>}
      </div>
      <div style={{ position: 'absolute', bottom: 230, left: 60, right: 60, padding: '18px 22px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderLeft: `4px solid ${RED}`, opacity: iT }}>
        <div style={{ fontFamily: 'Geist, sans-serif', fontSize: 26, color: '#fff', fontWeight: 500, lineHeight: 1.35 }}>{insight}</div>
      </div>
      <div style={{ position: 'absolute', bottom: 90, left: 60, right: 60, padding: '22px 28px', background: RED, display: 'flex', alignItems: 'center', justifyContent: 'space-between', opacity: ctaT }}>
        <div style={{ fontFamily: 'Anton, sans-serif', fontSize: 44, color: '#fff' }}>{ctaText}</div>
        <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 16, color: '#fff', letterSpacing: '0.1em' }}>ATHLETESACCEL.COM</div>
      </div>
    </div>
  );
}
window.UsVsThemReel = UsVsThemReel;
const US_VS_THEM_SPEC = { id:'us-vs-them', name:'US VS THEM', fields:[
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
    "label": "Eyebrow",
    "type": "text",
    "default": "THE DIFFERENCE"
  },
  {
    "key": "title1",
    "label": "Title 1",
    "type": "text",
    "default": "AVG SENIOR."
  },
  {
    "key": "title2",
    "label": "Title 2 (red)",
    "type": "text",
    "default": "AA SENIOR."
  },
  {
    "key": "metric",
    "label": "Metric label",
    "type": "text",
    "default": "40 YD DASH · 12-MONTH AVG"
  },
  {
    "key": "leftLabel",
    "label": "Left label",
    "type": "text",
    "default": "NO TRAINING"
  },
  {
    "key": "rightLabel",
    "label": "Right label",
    "type": "text",
    "default": "WITH AA"
  },
  {
    "key": "leftValue",
    "label": "Left value",
    "type": "number",
    "default": 5.62,
    "step": 0.01,
    "min": 0
  },
  {
    "key": "rightValue",
    "label": "Right value",
    "type": "number",
    "default": 4.91,
    "step": 0.01,
    "min": 0
  },
  {
    "key": "unit",
    "label": "Unit",
    "type": "text",
    "default": "s"
  },
  {
    "key": "insight",
    "label": "Insight",
    "type": "textarea",
    "default": "Same age. Same school. Different system."
  },
  {
    "key": "ctaText",
    "label": "CTA",
    "type": "text",
    "default": "BUILD YOUR DIFFERENCE →"
  }
]};
window.US_VS_THEM_SPEC = US_VS_THEM_SPEC;
