// BATTI OFFER (motion) — offer + locked guarantee block + red CTA over playing
// footage. The guarantee sits in a red-left-border block (Batti's quote device);
// the CTA button slides up last. Vertical 1080x1920.

function BattiOfferMotion({ data = {} }) {
  const eyebrow = data.eyebrow ?? 'MANTENO SPORT PARENTS';
  const offer = data.offer ?? 'THE FIRST STEP IN IS THE ATHLETE ANALYSIS.';
  const guarantee = data.guarantee ?? 'Your athlete will gain AT LEAST 3 inches on their vertical jump and 1mph in speed in 30 sessions — or we train them for FREE until they achieve these results.';
  const cta = data.cta ?? 'BOOK YOUR FREE ASSESSMENT';
  const brand = data.brand ?? 'BATTI-PERFORMANCE';
  const bgClip = data.bgClip ?? null;

  const t = useTime();
  const RED = (window.__BRAND__ && window.__BRAND__.brand_red || '#c4141d');
  const clamp = (x) => Math.max(0, Math.min(1, x));
  const eyeT = clamp((t - 0.1) / 0.3);
  const offT = Easing.easeOutCubic(clamp((t - 0.3) / 0.5));
  const guarT = clamp((t - 0.9) / 0.5);
  const ctaT = Easing.easeOutBack(clamp((t - 1.5) / 0.5));
  const brandT = clamp((t - 2.0) / 0.4);

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#000000', overflow: 'hidden' }}>
      {bgClip ? <SyncedVideo src={bgClip} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} /> : null}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.2) 28%, rgba(0,0,0,0.82) 52%, rgba(0,0,0,0.95) 100%)' }} />

      <TplText field="eyebrow" data={data} base={{ position: 'absolute', top: 1024, left: 64, right: 64 }}
        style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 30, color: RED, letterSpacing: '0.22em', textTransform: 'uppercase', opacity: eyeT }}>{eyebrow}</TplText>

      <TplText field="offer" data={data} base={{ position: 'absolute', top: 1088, left: 64, right: 64 }}
        style={{ fontFamily: 'Saira Condensed, sans-serif', fontWeight: 900, fontSize: 80, color: '#ffffff', lineHeight: 0.9, letterSpacing: '-0.01em', textTransform: 'uppercase', opacity: offT, transform: `translateY(${(1 - offT) * 16}px)` }}
        maxHeight={210} fitKey={offer}>{offer}</TplText>

      <div style={{ position: 'absolute', top: 1310, left: 64, width: 8, height: 280, background: RED, opacity: guarT }} />
      <TplText field="guarantee" data={data} base={{ position: 'absolute', top: 1320, left: 100, right: 64 }}
        style={{ fontFamily: 'Saira Condensed, sans-serif', fontWeight: 600, fontSize: 42, color: '#ffffff', lineHeight: 1.12, opacity: guarT }}
        maxHeight={300} fitKey={guarantee}>{guarantee}</TplText>

      <div style={{ position: 'absolute', top: 1640, left: 64, right: 64, height: 104, background: RED, borderRadius: 4, opacity: clamp(ctaT * 2), transform: `translateY(${(1 - ctaT) * 20}px)` }} />
      <TplText field="cta" data={data} base={{ position: 'absolute', top: 1672, left: 64, right: 64, textAlign: 'center' }}
        style={{ fontFamily: 'Saira Condensed, sans-serif', fontWeight: 800, fontSize: 40, color: '#ffffff', letterSpacing: '0.04em', textTransform: 'uppercase', textAlign: 'center', opacity: clamp(ctaT * 2), transform: `translateY(${(1 - ctaT) * 20}px)` }}>{cta}</TplText>

      <img src={(window.__BRAND__ && window.__BRAND__.logo_motion) || "assets/batti-performance-logo.png"} alt="Batti-Performance" style={{ position: "absolute", bottom: 14, left: 465, width: 150, height: 150, opacity: brandT }} />
    </div>
  );
}

window.BattiOfferMotion = BattiOfferMotion;

const BATTI_OFFER_MOTION_SPEC = {
  id: 'batti-offer-motion',
  name: 'BATTI OFFER (motion)',
  fields: [
    { "key": "duration", "label": "Length", "type": "slider", "default": 5, "min": 3, "max": 7, "step": 0.5, "unit": "s" },
    { "key": "bgClip", "label": "Background clip", "type": "image" },
    { "key": "eyebrow", "role": "eyebrow", "label": "Eyebrow", "type": "text", "default": "MANTENO SPORT PARENTS" },
    { "key": "offer", "role": "offer", "label": "Offer", "type": "text", "default": "THE FIRST STEP IN IS THE ATHLETE ANALYSIS." },
    { "key": "guarantee", "role": "guarantee", "label": "Guarantee (locked)", "type": "text", "default": "Your athlete will gain AT LEAST 3 inches on their vertical jump and 1mph in speed in 30 sessions — or we train them for FREE until they achieve these results." },
    { "key": "cta", "role": "cta", "label": "CTA", "type": "text", "default": "BOOK YOUR FREE ASSESSMENT" },
    { "key": "brand", "role": "brand", "label": "Brand", "type": "text", "default": "BATTI-PERFORMANCE" }
  ],
};
window.BATTI_OFFER_MOTION_SPEC = BATTI_OFFER_MOTION_SPEC;
