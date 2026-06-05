// CONF V05 — STAT 92 (centered). The 92% proof stat centered big with a label
// above and below — a CENTERED stat layout (distinct from the left-aligned stat).

function ConfV05Stat92({ data = {} }) {
  const eyebrow = data.eyebrow ?? 'MANTENO SPORT PARENTS';
  const statValue = data.statValue ?? '92';
  const statUnit = data.statUnit ?? '%';
  const labelTop = data.labelTop ?? 'OF OUR PARENTS REPORT';
  const labelBot = data.labelBot ?? 'THEIR KID COMES OUT MORE CONFIDENT';
  const brand = data.brand ?? 'BATTI-PERFORMANCE';
  const bgClip = data.bgClip ?? null;

  const t = useTime();
  const RED = (window.__BRAND__ && window.__BRAND__.brand_red || '#c4141d');
  const clamp = (x) => Math.max(0, Math.min(1, x));
  const numT = Easing.easeOutBack(clamp((t - 0.3) / 0.55));
  const tT = clamp((t - 0.2) / 0.4);
  const bT = clamp((t - 0.95) / 0.4);
  const brandT = clamp((t - 1.7) / 0.4);

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#000000', overflow: 'hidden' }}>
      {bgClip ? <SyncedVideo src={bgClip} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} /> : null}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0.9) 100%)' }} />

      <TplText field="eyebrow" data={data} base={{ position: 'absolute', top: 150, left: 64, right: 64 }}
        style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 30, opacity: clamp((t - 0.1) / 0.3) }}>{eyebrow}</TplText>

      <TplText field="labelTop" data={data} base={{ position: 'absolute', top: 660, left: 64, right: 64, textAlign: 'center' }}
        style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 32, color: '#ffffff', letterSpacing: '0.16em', textTransform: 'uppercase', textAlign: 'center', opacity: tT }}>{labelTop}</TplText>

      <div style={{ position: 'absolute', top: 720, left: 0, right: 0, display: 'flex', justifyContent: 'center', alignItems: 'flex-start', opacity: clamp(numT * 2), transform: `scale(${0.7 + numT * 0.3})` }}>
        <span style={{ fontFamily: 'Saira Condensed, sans-serif', fontWeight: 900, fontSize: 440, color: '#ffffff', lineHeight: 0.8, letterSpacing: '-0.03em' }}>{statValue}</span>
        <span style={{ fontFamily: 'Saira Condensed, sans-serif', fontWeight: 900, fontSize: 240, color: RED, lineHeight: 0.9 }}>{statUnit}</span>
      </div>

      <div style={{ position: 'absolute', top: 1240, left: '50%', width: 160, height: 6, background: RED, transform: 'translateX(-50%)', opacity: bT }} />
      <TplText field="labelBot" data={data} base={{ position: 'absolute', top: 1280, left: 64, right: 64, textAlign: 'center' }}
        style={{ fontFamily: 'Saira Condensed, sans-serif', fontWeight: 800, fontSize: 70, color: '#ffffff', lineHeight: 0.98, textTransform: 'uppercase', textAlign: 'center', opacity: bT }}
        maxHeight={260} fitKey={labelBot}>{labelBot}</TplText>

      <img src={(window.__BRAND__ && window.__BRAND__.logo_motion) || "assets/batti-performance-logo.png"} alt="Batti-Performance" style={{ position: "absolute", bottom: 44, left: 440, width: 200, height: 200, opacity: brandT }} />
    </div>
  );
}
window.ConfV05Stat92 = ConfV05Stat92;
const CONF_V05_SPEC = {
  id: 'conf-v05-stat92', name: 'CONF V05 STAT 92',
  fields: [
    { "key": "duration", "label": "Length", "type": "slider", "default": 4, "min": 2, "max": 6, "step": 0.5, "unit": "s" },
    { "key": "bgClip", "label": "Background clip", "type": "image" },
    { "key": "eyebrow", "role": "eyebrow", "label": "Eyebrow", "type": "text", "default": "MANTENO SPORT PARENTS" },
    { "key": "statValue", "role": "stat", "label": "Stat value", "type": "text", "default": "92" },
    { "key": "statUnit", "role": "stat", "label": "Unit", "type": "text", "default": "%" },
    { "key": "labelTop", "role": "stat", "label": "Label top", "type": "text", "default": "OF OUR PARENTS REPORT" },
    { "key": "labelBot", "role": "proof", "label": "Label bottom", "type": "text", "default": "THEIR KID COMES OUT MORE CONFIDENT" },
    { "key": "brand", "role": "brand", "label": "Brand", "type": "text", "default": "BATTI-PERFORMANCE" }
  ],
};
window.CONF_V05_SPEC = CONF_V05_SPEC;
