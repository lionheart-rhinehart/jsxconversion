// CONF V09 — OFFER (centered). Distinct offer layout: centered offer headline, the
// locked guarantee in a bordered box (top+bottom rules), full-width red CTA.

function ConfV09Offer({ data = {} }) {
  const eyebrow = data.eyebrow ?? 'MANTENO SPORT PARENTS';
  const offer = data.offer ?? 'THE FIRST STEP IN IS THE ATHLETE ANALYSIS.';
  const guarantee = data.guarantee ?? 'Your athlete will gain AT LEAST 3 inches on their vertical jump and 1mph in speed in 30 sessions — or we train them for FREE until they achieve these results.';
  const cta = data.cta ?? 'CLAIM YOUR ATHLETE ANALYSIS NOW';
  const brand = data.brand ?? 'BATTI-PERFORMANCE';
  const bgClip = data.bgClip ?? null;
  const t = useTime();
  const RED = (window.__BRAND__ && window.__BRAND__.brand_red || '#c4141d');
  const clamp = (x) => Math.max(0, Math.min(1, x));
  const oT = Easing.easeOutCubic(clamp((t - 0.3) / 0.5));
  const gT = clamp((t - 0.9) / 0.5);
  const ctaT = Easing.easeOutBack(clamp((t - 1.5) / 0.5));
  const brandT = clamp((t - 2.1) / 0.4);
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#000000', overflow: 'hidden' }}>
      {bgClip ? <SyncedVideo src={bgClip} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} /> : null}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.4) 30%, rgba(0,0,0,0.86) 55%, rgba(0,0,0,0.96) 100%)' }} />
      <TplText field="eyebrow" data={data} base={{ position: 'absolute', top: 150, left: 64, right: 64 }}
        style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 30, opacity: clamp((t - 0.1) / 0.3) }}>{eyebrow}</TplText>
      <TplText field="offer" data={data} base={{ position: 'absolute', top: 1010, left: 64, right: 64, textAlign: 'center' }}
        style={{ fontFamily: 'Saira Condensed, sans-serif', fontWeight: 900, fontSize: 82, color: '#ffffff', lineHeight: 0.92, textTransform: 'uppercase', textAlign: 'center', letterSpacing: '-0.01em', opacity: oT }}
        maxHeight={210} fitKey={offer}>{offer}</TplText>
      <div style={{ position: 'absolute', top: 1268, left: 64, right: 64, height: 4, background: RED, opacity: gT }} />
      <TplText field="guarantee" data={data} base={{ position: 'absolute', top: 1290, left: 80, right: 80, textAlign: 'center' }}
        style={{ fontFamily: 'Saira Condensed, sans-serif', fontWeight: 600, fontSize: 40, color: '#ffffff', lineHeight: 1.12, textAlign: 'center', opacity: gT }}
        maxHeight={280} fitKey={guarantee}>{guarantee}</TplText>
      <div style={{ position: 'absolute', top: 1568, left: 64, right: 64, height: 4, background: RED, opacity: gT }} />
      <div style={{ position: 'absolute', top: 1620, left: 64, right: 64, height: 104, background: RED, borderRadius: 4, opacity: clamp(ctaT * 2), transform: `translateY(${(1 - ctaT) * 18}px)` }} />
      <TplText field="cta" data={data} base={{ position: 'absolute', top: 1652, left: 64, right: 64, textAlign: 'center' }}
        style={{ fontFamily: 'Saira Condensed, sans-serif', fontWeight: 800, fontSize: 38, color: '#ffffff', letterSpacing: '0.03em', textTransform: 'uppercase', textAlign: 'center', opacity: clamp(ctaT * 2), transform: `translateY(${(1 - ctaT) * 18}px)` }}>{cta}</TplText>
      <img src={(window.__BRAND__ && window.__BRAND__.logo_motion) || "assets/batti-performance-logo.png"} alt="Batti-Performance" style={{ position: "absolute", bottom: 14, left: 465, width: 150, height: 150, opacity: brandT }} />
    </div>
  );
}
window.ConfV09Offer = ConfV09Offer;
const CONF_V09_SPEC = {
  id: 'conf-v09-offer', name: 'CONF V09 OFFER',
  fields: [
    { "key": "duration", "label": "Length", "type": "slider", "default": 5, "min": 3, "max": 7, "step": 0.5, "unit": "s" },
    { "key": "bgClip", "label": "Background clip", "type": "image" },
    { "key": "eyebrow", "role": "eyebrow", "label": "Eyebrow", "type": "text", "default": "MANTENO SPORT PARENTS" },
    { "key": "offer", "role": "offer", "label": "Offer", "type": "text", "default": "THE FIRST STEP IN IS THE ATHLETE ANALYSIS." },
    { "key": "guarantee", "role": "guarantee", "label": "Guarantee (locked)", "type": "text", "default": "Your athlete will gain AT LEAST 3 inches on their vertical jump and 1mph in speed in 30 sessions — or we train them for FREE until they achieve these results." },
    { "key": "cta", "role": "cta", "label": "CTA", "type": "text", "default": "CLAIM YOUR ATHLETE ANALYSIS NOW" },
    { "key": "brand", "role": "brand", "label": "Brand", "type": "text", "default": "BATTI-PERFORMANCE" }
  ],
};
window.CONF_V09_SPEC = CONF_V09_SPEC;
