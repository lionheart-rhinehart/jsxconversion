// CONF V02 — TWO KINDS. Vertical split: the hook's two halves stacked in two
// zones divided by a red rule that wipes across — top "breaks" (grey), bottom
// "holds" (white). Distinct split-screen device. Over playing footage.

function ConfV02TwoKinds({ data = {} }) {
  const eyebrow = data.eyebrow ?? 'MANTENO SPORT PARENTS';
  const line1 = data.line1 ?? 'THE KIND THAT BREAKS UNDER PRESSURE.';
  const line2 = data.line2 ?? "AND THE KIND THAT DOESN'T.";
  const brand = data.brand ?? 'BATTI-PERFORMANCE';
  const bgClip = data.bgClip ?? null;

  const t = useTime();
  const RED = (window.__BRAND__ && window.__BRAND__.brand_red || '#c4141d');
  const clamp = (x) => Math.max(0, Math.min(1, x));
  const divT = Easing.easeOutCubic(clamp((t - 0.3) / 0.5));
  const l1T = Easing.easeOutCubic(clamp((t - 0.45) / 0.5));
  const l2T = Easing.easeOutCubic(clamp((t - 1.0) / 0.5));
  const brandT = clamp((t - 1.9) / 0.4);

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#000000', overflow: 'hidden' }}>
      {bgClip ? <SyncedVideo src={bgClip} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} /> : null}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 960, background: 'rgba(0,0,0,0.78)' }} />
      <div style={{ position: 'absolute', top: 960, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.55)' }} />

      <TplText field="eyebrow" data={data} base={{ position: 'absolute', top: 150, left: 64, right: 64 }}
        style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 30, opacity: clamp((t - 0.1) / 0.3) }}>{eyebrow}</TplText>

      <TplText field="line1" data={data} base={{ position: 'absolute', top: 620, left: 64, right: 64 }}
        style={{ fontFamily: 'Saira Condensed, sans-serif', fontWeight: 800, fontSize: 92, color: '#8a8a8a', lineHeight: 0.94, textTransform: 'uppercase', letterSpacing: '-0.01em', opacity: l1T, transform: `translateY(${(1 - l1T) * 16}px)` }}
        maxHeight={300} fitKey={line1}>{line1}</TplText>

      <div style={{ position: 'absolute', top: 952, left: 0, height: 12, width: `${divT * 100}%`, background: RED }} />

      <TplText field="line2" data={data} base={{ position: 'absolute', top: 1020, left: 64, right: 64 }}
        style={{ fontFamily: 'Saira Condensed, sans-serif', fontWeight: 900, fontSize: 110, color: '#ffffff', lineHeight: 0.94, textTransform: 'uppercase', letterSpacing: '-0.01em', opacity: l2T, transform: `translateY(${(1 - l2T) * 16}px)` }}
        maxHeight={360} fitKey={line2}>{line2}</TplText>

      <img src={(window.__BRAND__ && window.__BRAND__.logo_motion) || "assets/batti-performance-logo.png"} alt="Batti-Performance" style={{ position: "absolute", bottom: 44, left: 440, width: 200, height: 200, opacity: brandT }} />
    </div>
  );
}
window.ConfV02TwoKinds = ConfV02TwoKinds;
const CONF_V02_SPEC = {
  id: 'conf-v02-twokinds', name: 'CONF V02 TWO KINDS',
  fields: [
    { "key": "duration", "label": "Length", "type": "slider", "default": 4, "min": 2, "max": 6, "step": 0.5, "unit": "s" },
    { "key": "bgClip", "label": "Background clip", "type": "image" },
    { "key": "eyebrow", "role": "eyebrow", "label": "Eyebrow", "type": "text", "default": "MANTENO SPORT PARENTS" },
    { "key": "line1", "role": "hook", "label": "Line 1 (grey)", "type": "text", "default": "THE KIND THAT BREAKS UNDER PRESSURE." },
    { "key": "line2", "role": "hook", "label": "Line 2 (white)", "type": "text", "default": "AND THE KIND THAT DOESN'T." },
    { "key": "brand", "role": "brand", "label": "Brand", "type": "text", "default": "BATTI-PERFORMANCE" }
  ],
};
window.CONF_V02_SPEC = CONF_V02_SPEC;
