// CONF V11 — OUTLINE FILL. The headline starts as a stadium outline and a solid
// white copy fades in over it. Distinct outline→solid device.

function ConfV11Outline({ data = {} }) {
  const eyebrow = data.eyebrow ?? 'MANTENO SPORT PARENTS';
  const headline = data.headline ?? 'WHEN THEY STOP BELIEVING';
  const brand = data.brand ?? 'BATTI-PERFORMANCE';
  const bgClip = data.bgClip ?? null;
  const t = useTime();
  const RED = (window.__BRAND__ && window.__BRAND__.brand_red || '#c4141d');
  const clamp = (x) => Math.max(0, Math.min(1, x));
  const fillT = Easing.easeOutCubic(clamp((t - 0.5) / 0.7));
  const ruleT = Easing.easeOutCubic(clamp((t - 0.3) / 0.4));
  const brandT = clamp((t - 1.8) / 0.4);
  const base = { position: 'absolute', top: 900, left: 64, right: 64 };
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#000000', overflow: 'hidden' }}>
      {bgClip ? <SyncedVideo src={bgClip} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} /> : null}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.45) 45%, rgba(0,0,0,0.9) 100%)' }} />
      <TplText field="eyebrow" data={data} base={{ position: 'absolute', top: 150, left: 64, right: 64 }}
        style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 30, opacity: clamp((t - 0.1) / 0.3) }}>{eyebrow}</TplText>
      <div style={{ position: 'absolute', top: 850, left: 64, width: ruleT * 300, height: 8, background: RED }} />
      {/* outline copy */}
      <div style={{ ...base, fontFamily: 'Saira Condensed, sans-serif', fontWeight: 900, fontSize: 132, lineHeight: 0.9, textTransform: 'uppercase', letterSpacing: '-0.01em', color: 'transparent', WebkitTextStroke: `2px #ffffff` }}>{headline}</div>
      {/* solid copy fades in */}
      <TplText field="headline" data={data} base={base}
        style={{ fontFamily: 'Saira Condensed, sans-serif', fontWeight: 900, fontSize: 132, color: '#ffffff', lineHeight: 0.9, textTransform: 'uppercase', letterSpacing: '-0.01em', opacity: fillT }}
        maxHeight={420} fitKey={headline}>{headline}</TplText>
      <img src={(window.__BRAND__ && window.__BRAND__.logo_motion) || "assets/batti-performance-logo.png"} alt="Batti-Performance" style={{ position: "absolute", bottom: 44, left: 440, width: 200, height: 200, opacity: brandT }} />
    </div>
  );
}
window.ConfV11Outline = ConfV11Outline;
const CONF_V11_SPEC = {
  id: 'conf-v11-outline', name: 'CONF V11 OUTLINE',
  fields: [
    { "key": "duration", "label": "Length", "type": "slider", "default": 4, "min": 2, "max": 6, "step": 0.5, "unit": "s" },
    { "key": "bgClip", "label": "Background clip", "type": "image" },
    { "key": "eyebrow", "role": "eyebrow", "label": "Eyebrow", "type": "text", "default": "MANTENO SPORT PARENTS" },
    { "key": "headline", "role": "claim", "label": "Headline", "type": "text", "default": "WHEN THEY STOP BELIEVING" },
    { "key": "brand", "role": "brand", "label": "Brand", "type": "text", "default": "BATTI-PERFORMANCE" }
  ],
};
window.CONF_V11_SPEC = CONF_V11_SPEC;
