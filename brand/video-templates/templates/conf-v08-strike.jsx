// CONF V08 — STRIKE. A claim with a red strike-through line that draws across it
// (the "on loan / temporary" idea made visual). Distinct strike device.

function ConfV08Strike({ data = {} }) {
  const eyebrow = data.eyebrow ?? 'MANTENO SPORT PARENTS';
  const claim = data.claim ?? 'PRAISE IS ON LOAN.';
  const sub = data.sub ?? 'NOBODY CAN TALK THEM OUT OF A NUMBER THEY WATCHED GO UP.';
  const brand = data.brand ?? 'BATTI-PERFORMANCE';
  const bgClip = data.bgClip ?? null;
  const t = useTime();
  const RED = (window.__BRAND__ && window.__BRAND__.brand_red || '#c4141d');
  const clamp = (x) => Math.max(0, Math.min(1, x));
  const cT = Easing.easeOutCubic(clamp((t - 0.3) / 0.5));
  const strikeT = Easing.easeOutCubic(clamp((t - 0.9) / 0.5));
  const sT = clamp((t - 1.4) / 0.5);
  const brandT = clamp((t - 2.0) / 0.4);
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#000000', overflow: 'hidden' }}>
      {bgClip ? <SyncedVideo src={bgClip} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} /> : null}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.45) 45%, rgba(0,0,0,0.9) 100%)' }} />
      <TplText field="eyebrow" data={data} base={{ position: 'absolute', top: 150, left: 64, right: 64 }}
        style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 30, opacity: clamp((t - 0.1) / 0.3) }}>{eyebrow}</TplText>
      <TplText field="claim" data={data} base={{ position: 'absolute', top: 820, left: 64, right: 64 }}
        style={{ fontFamily: 'Saira Condensed, sans-serif', fontWeight: 900, fontSize: 132, color: '#ffffff', lineHeight: 0.9, textTransform: 'uppercase', letterSpacing: '-0.01em', opacity: cT }}
        maxHeight={300} fitKey={claim}>{claim}</TplText>
      <div style={{ position: 'absolute', top: 905, left: 60, height: 14, width: `${strikeT * 88}%`, background: RED }} />
      <TplText field="sub" data={data} base={{ position: 'absolute', top: 1140, left: 64, right: 64 }}
        style={{ fontFamily: 'Saira Condensed, sans-serif', fontWeight: 700, fontSize: 64, color: '#e0e0e0', lineHeight: 1.0, textTransform: 'uppercase', opacity: sT, transform: `translateY(${(1 - sT) * 14}px)` }}
        maxHeight={300} fitKey={sub}>{sub}</TplText>
      <img src={(window.__BRAND__ && window.__BRAND__.logo_motion) || "assets/batti-performance-logo.png"} alt="Batti-Performance" style={{ position: "absolute", bottom: 44, left: 440, width: 200, height: 200, opacity: brandT }} />
    </div>
  );
}
window.ConfV08Strike = ConfV08Strike;
const CONF_V08_SPEC = {
  id: 'conf-v08-strike', name: 'CONF V08 STRIKE',
  fields: [
    { "key": "duration", "label": "Length", "type": "slider", "default": 4, "min": 2, "max": 6, "step": 0.5, "unit": "s" },
    { "key": "bgClip", "label": "Background clip", "type": "image" },
    { "key": "eyebrow", "role": "eyebrow", "label": "Eyebrow", "type": "text", "default": "MANTENO SPORT PARENTS" },
    { "key": "claim", "role": "claim", "label": "Claim (struck)", "type": "text", "default": "PRAISE IS ON LOAN." },
    { "key": "sub", "role": "reframe", "label": "Sub", "type": "text", "default": "NOBODY CAN TALK THEM OUT OF A NUMBER THEY WATCHED GO UP." },
    { "key": "brand", "role": "brand", "label": "Brand", "type": "text", "default": "BATTI-PERFORMANCE" }
  ],
};
window.CONF_V08_SPEC = CONF_V08_SPEC;
