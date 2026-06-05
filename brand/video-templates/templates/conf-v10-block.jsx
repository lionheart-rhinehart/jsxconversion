// CONF V10 — RED BLOCK. A red square grows beside the headline as it reveals; a
// subhead drops below. Distinct "leading-block" headline device.

function ConfV10Block({ data = {} }) {
  const eyebrow = data.eyebrow ?? 'MANTENO SPORT PARENTS';
  const headline = data.headline ?? 'WHY "GREAT JOB" ISN’T WORKING';
  const sub = data.sub ?? '(AND WHAT ACTUALLY REBUILDS IT)';
  const brand = data.brand ?? 'BATTI-PERFORMANCE';
  const bgClip = data.bgClip ?? null;
  const t = useTime();
  const RED = (window.__BRAND__ && window.__BRAND__.brand_red || '#c4141d');
  const clamp = (x) => Math.max(0, Math.min(1, x));
  const blkT = Easing.easeOutBack(clamp((t - 0.25) / 0.45));
  const hT = Easing.easeOutCubic(clamp((t - 0.45) / 0.55));
  const sT = clamp((t - 1.1) / 0.5);
  const brandT = clamp((t - 1.9) / 0.4);
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#000000', overflow: 'hidden' }}>
      {bgClip ? <SyncedVideo src={bgClip} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} /> : null}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.4) 42%, rgba(0,0,0,0.9) 100%)' }} />
      <TplText field="eyebrow" data={data} base={{ position: 'absolute', top: 150, left: 64, right: 64 }}
        style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 30, opacity: clamp((t - 0.1) / 0.3) }}>{eyebrow}</TplText>
      <div style={{ position: 'absolute', top: 900, left: 64, width: 96 * blkT, height: 96 * blkT, background: RED }} />
      <TplText field="headline" data={data} base={{ position: 'absolute', top: 1030, left: 64, right: 64 }}
        style={{ fontFamily: 'Saira Condensed, sans-serif', fontWeight: 900, fontSize: 118, color: '#ffffff', lineHeight: 0.9, textTransform: 'uppercase', letterSpacing: '-0.01em', opacity: hT, transform: `translateY(${(1 - hT) * 18}px)` }}
        maxHeight={360} fitKey={headline}>{headline}</TplText>
      <TplText field="sub" data={data} base={{ position: 'absolute', top: 1430, left: 64, right: 64 }}
        style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 34, color: '#d8d8d8', letterSpacing: '0.08em', textTransform: 'uppercase', opacity: sT }}
        maxHeight={120} fitKey={sub}>{sub}</TplText>
      <img src={(window.__BRAND__ && window.__BRAND__.logo_motion) || "assets/batti-performance-logo.png"} alt="Batti-Performance" style={{ position: "absolute", bottom: 44, left: 440, width: 200, height: 200, opacity: brandT }} />
    </div>
  );
}
window.ConfV10Block = ConfV10Block;
const CONF_V10_SPEC = {
  id: 'conf-v10-block', name: 'CONF V10 RED BLOCK',
  fields: [
    { "key": "duration", "label": "Length", "type": "slider", "default": 4, "min": 2, "max": 6, "step": 0.5, "unit": "s" },
    { "key": "bgClip", "label": "Background clip", "type": "image" },
    { "key": "eyebrow", "role": "eyebrow", "label": "Eyebrow", "type": "text", "default": "MANTENO SPORT PARENTS" },
    { "key": "headline", "role": "claim", "label": "Headline", "type": "text", "default": "WHY \"GREAT JOB\" ISN'T WORKING" },
    { "key": "sub", "role": "reframe", "label": "Sub", "type": "text", "default": "(AND WHAT ACTUALLY REBUILDS IT)" },
    { "key": "brand", "role": "brand", "label": "Brand", "type": "text", "default": "BATTI-PERFORMANCE" }
  ],
};
window.CONF_V10_SPEC = CONF_V10_SPEC;
