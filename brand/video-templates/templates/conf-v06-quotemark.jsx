// CONF V06 — QUOTE MARK. Giant red opening quote glyph, then a centered reframe
// line. Distinct centered-quote device (vs the left-border quote).

function ConfV06QuoteMark({ data = {} }) {
  const eyebrow = data.eyebrow ?? 'MANTENO SPORT PARENTS';
  const quote = data.quote ?? 'THEY HAVE TO SEE IT.';
  const brand = data.brand ?? 'BATTI-PERFORMANCE';
  const bgClip = data.bgClip ?? null;
  const t = useTime();
  const RED = (window.__BRAND__ && window.__BRAND__.brand_red || '#c4141d');
  const clamp = (x) => Math.max(0, Math.min(1, x));
  const qmT = Easing.easeOutBack(clamp((t - 0.2) / 0.5));
  const qT = Easing.easeOutCubic(clamp((t - 0.6) / 0.6));
  const brandT = clamp((t - 1.7) / 0.4);
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#000000', overflow: 'hidden' }}>
      {bgClip ? <SyncedVideo src={bgClip} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} /> : null}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.66) 0%, rgba(0,0,0,0.5) 45%, rgba(0,0,0,0.85) 100%)' }} />
      <TplText field="eyebrow" data={data} base={{ position: 'absolute', top: 150, left: 64, right: 64 }}
        style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 30, opacity: clamp((t - 0.1) / 0.3) }}>{eyebrow}</TplText>
      <div style={{ position: 'absolute', top: 660, left: 0, right: 0, textAlign: 'center', fontFamily: 'Saira Condensed, sans-serif', fontWeight: 900, fontSize: 360, color: RED, lineHeight: 0.6, opacity: clamp(qmT), transform: `scale(${0.7 + qmT * 0.3})` }}>&ldquo;</div>
      <TplText field="quote" data={data} base={{ position: 'absolute', top: 1000, left: 80, right: 80, textAlign: 'center' }}
        style={{ fontFamily: 'Saira Condensed, sans-serif', fontWeight: 800, fontSize: 104, color: '#ffffff', lineHeight: 0.98, textTransform: 'uppercase', textAlign: 'center', letterSpacing: '-0.01em', opacity: qT, transform: `translateY(${(1 - qT) * 16}px)` }}
        maxHeight={460} fitKey={quote}>{quote}</TplText>
      <img src={(window.__BRAND__ && window.__BRAND__.logo_motion) || "assets/batti-performance-logo.png"} alt="Batti-Performance" style={{ position: "absolute", bottom: 44, left: 440, width: 200, height: 200, opacity: brandT }} />
    </div>
  );
}
window.ConfV06QuoteMark = ConfV06QuoteMark;
const CONF_V06_SPEC = {
  id: 'conf-v06-quotemark', name: 'CONF V06 QUOTE MARK',
  fields: [
    { "key": "duration", "label": "Length", "type": "slider", "default": 4, "min": 2, "max": 6, "step": 0.5, "unit": "s" },
    { "key": "bgClip", "label": "Background clip", "type": "image" },
    { "key": "eyebrow", "role": "eyebrow", "label": "Eyebrow", "type": "text", "default": "MANTENO SPORT PARENTS" },
    { "key": "quote", "role": "reframe", "label": "Quote", "type": "text", "default": "THEY HAVE TO SEE IT." },
    { "key": "brand", "role": "brand", "label": "Brand", "type": "text", "default": "BATTI-PERFORMANCE" }
  ],
};
window.CONF_V06_SPEC = CONF_V06_SPEC;
