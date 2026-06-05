// BATTI MECHANISM (motion) — full-bleed statement over playing footage.
// One big Saira Condensed statement rises in over a bottom-weighted scrim, marked
// by a short red rule (Batti's statement device). Vertical 1080x1920.

function BattiMechanismMotion({ data = {} }) {
  const eyebrow = data.eyebrow ?? 'MANTENO SPORT PARENTS';
  const statement = data.statement ?? 'IT MEMORIZES THE SPEED.';
  const brand = data.brand ?? 'BATTI-PERFORMANCE';
  const bgClip = data.bgClip ?? null;

  const t = useTime();
  const RED = (window.__BRAND__ && window.__BRAND__.brand_red || '#c4141d');
  const clamp = (x) => Math.max(0, Math.min(1, x));
  const eyeT = clamp((t - 0.1) / 0.3);
  const ruleT = Easing.easeOutCubic(clamp((t - 0.3) / 0.4));
  const stT = Easing.easeOutCubic(clamp((t - 0.5) / 0.6));
  const brandT = clamp((t - 1.7) / 0.4);

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#000000', overflow: 'hidden' }}>
      {bgClip ? <SyncedVideo src={bgClip} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} /> : null}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.15) 28%, rgba(0,0,0,0.35) 56%, rgba(0,0,0,0.92) 100%)' }} />

      <TplText field="eyebrow" data={data} base={{ position: 'absolute', top: 150, left: 64, right: 64 }}
        style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 30, color: RED, letterSpacing: '0.22em', textTransform: 'uppercase', opacity: eyeT }}>{eyebrow}</TplText>

      <div style={{ position: 'absolute', top: 1244, left: 64, height: 7, width: ruleT * 240, background: RED }} />

      <TplText field="statement" data={data} base={{ position: 'absolute', top: 1292, left: 64, right: 64 }}
        style={{ fontFamily: 'Saira Condensed, sans-serif', fontWeight: 900, fontSize: 116, color: '#ffffff', lineHeight: 0.9, letterSpacing: '-0.01em', textTransform: 'uppercase', textShadow: '0 2px 24px rgba(0,0,0,0.7)', opacity: stT, transform: `translateY(${(1 - stT) * 22}px)` }}
        maxHeight={420} fitKey={statement}>{statement}</TplText>

      <TplText field="brand" data={data} base={{ position: 'absolute', bottom: 96, left: 64, right: 64 }}
        style={{ fontFamily: 'Saira Condensed, sans-serif', fontWeight: 900, fontSize: 30, color: '#ffffff', letterSpacing: '0.02em', textTransform: 'uppercase', opacity: brandT }}>{brand}</TplText>
    </div>
  );
}

window.BattiMechanismMotion = BattiMechanismMotion;

const BATTI_MECHANISM_MOTION_SPEC = {
  id: 'batti-mechanism-motion',
  name: 'BATTI MECHANISM (motion)',
  fields: [
    { "key": "duration", "label": "Length", "type": "slider", "default": 4, "min": 2, "max": 6, "step": 0.5, "unit": "s" },
    { "key": "bgClip", "label": "Background clip", "type": "image" },
    { "key": "eyebrow", "role": "eyebrow", "label": "Eyebrow", "type": "text", "default": "MANTENO SPORT PARENTS" },
    { "key": "statement", "role": "mechanism", "label": "Statement", "type": "text", "default": "IT MEMORIZES THE SPEED." },
    { "key": "brand", "role": "brand", "label": "Brand", "type": "text", "default": "BATTI-PERFORMANCE" }
  ],
};
window.BATTI_MECHANISM_MOTION_SPEC = BATTI_MECHANISM_MOTION_SPEC;
