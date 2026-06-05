// CONF V12 — RED WIPE. A red panel wipes left→right and clears to reveal the
// reframe line behind it. Distinct wipe-reveal device.

function ConfV12Wipe({ data = {} }) {
  const eyebrow = data.eyebrow ?? 'MANTENO SPORT PARENTS';
  const claim = data.claim ?? 'THERE ARE TWO KINDS OF CONFIDENCE.';
  const brand = data.brand ?? 'BATTI-PERFORMANCE';
  const bgClip = data.bgClip ?? null;
  const t = useTime();
  const RED = (window.__BRAND__ && window.__BRAND__.brand_red || '#c4141d');
  const clamp = (x) => Math.max(0, Math.min(1, x));
  const enter = Easing.easeInOutCubic(clamp((t - 0.2) / 0.45));
  const exit = Easing.easeInOutCubic(clamp((t - 0.75) / 0.5));
  const cT = clamp((t - 0.9) / 0.3);
  const brandT = clamp((t - 1.8) / 0.4);
  const left = exit * 100;
  const right = 100 - enter * 100;
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#000000', overflow: 'hidden' }}>
      {bgClip ? <SyncedVideo src={bgClip} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} /> : null}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.45) 45%, rgba(0,0,0,0.9) 100%)' }} />
      <TplText field="eyebrow" data={data} base={{ position: 'absolute', top: 150, left: 64, right: 64 }}
        style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 30, opacity: clamp((t - 0.1) / 0.3) }}>{eyebrow}</TplText>
      <TplText field="claim" data={data} base={{ position: 'absolute', top: 880, left: 64, right: 64 }}
        style={{ fontFamily: 'Saira Condensed, sans-serif', fontWeight: 900, fontSize: 124, color: '#ffffff', lineHeight: 0.9, textTransform: 'uppercase', letterSpacing: '-0.01em', opacity: cT }}
        maxHeight={460} fitKey={claim}>{claim}</TplText>
      {/* red wipe panel: enters from right, exits to the right */}
      <div style={{ position: 'absolute', top: 840, left: `${left}%`, right: `${right}%`, height: 540, background: RED }} />
      <img src={(window.__BRAND__ && window.__BRAND__.logo_motion) || "assets/batti-performance-logo.png"} alt="Batti-Performance" style={{ position: "absolute", bottom: 44, left: 440, width: 200, height: 200, opacity: brandT }} />
    </div>
  );
}
window.ConfV12Wipe = ConfV12Wipe;
const CONF_V12_SPEC = {
  id: 'conf-v12-wipe', name: 'CONF V12 RED WIPE',
  fields: [
    { "key": "duration", "label": "Length", "type": "slider", "default": 4, "min": 2, "max": 6, "step": 0.5, "unit": "s" },
    { "key": "bgClip", "label": "Background clip", "type": "image" },
    { "key": "eyebrow", "role": "eyebrow", "label": "Eyebrow", "type": "text", "default": "MANTENO SPORT PARENTS" },
    { "key": "claim", "role": "claim", "label": "Claim", "type": "text", "default": "THERE ARE TWO KINDS OF CONFIDENCE." },
    { "key": "brand", "role": "brand", "label": "Brand", "type": "text", "default": "BATTI-PERFORMANCE" }
  ],
};
window.CONF_V12_SPEC = CONF_V12_SPEC;
