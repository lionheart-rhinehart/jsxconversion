// CONF V07 — CAPTION. Footage-forward: the emotional line sits in the bottom third
// as a subtitle-style caption with a short red tick. Distinct caption device.

function ConfV07Caption({ data = {} }) {
  const eyebrow = data.eyebrow ?? 'MANTENO SPORT PARENTS';
  const line = data.line ?? "THE HARDEST PART ISN'T WATCHING THEM LOSE. IT'S WATCHING THEM STOP BELIEVING THEY CAN WIN.";
  const brand = data.brand ?? 'BATTI-PERFORMANCE';
  const bgClip = data.bgClip ?? null;
  const t = useTime();
  const RED = (window.__BRAND__ && window.__BRAND__.brand_red || '#c4141d');
  const clamp = (x) => Math.max(0, Math.min(1, x));
  const tickT = Easing.easeOutCubic(clamp((t - 0.3) / 0.4));
  const lT = Easing.easeOutCubic(clamp((t - 0.5) / 0.6));
  const brandT = clamp((t - 1.9) / 0.4);
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#000000', overflow: 'hidden' }}>
      {bgClip ? <SyncedVideo src={bgClip} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} /> : null}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0) 35%, rgba(0,0,0,0.55) 62%, rgba(0,0,0,0.95) 100%)' }} />
      <TplText field="eyebrow" data={data} base={{ position: 'absolute', top: 150, left: 64, right: 64 }}
        style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 30, opacity: clamp((t - 0.1) / 0.3) }}>{eyebrow}</TplText>
      <div style={{ position: 'absolute', top: 1300, left: 64, width: tickT * 120, height: 8, background: RED }} />
      <TplText field="line" data={data} base={{ position: 'absolute', top: 1340, left: 64, right: 64 }}
        style={{ fontFamily: 'Saira Condensed, sans-serif', fontWeight: 700, fontSize: 72, color: '#ffffff', lineHeight: 1.0, textTransform: 'uppercase', letterSpacing: '0', opacity: lT, transform: `translateY(${(1 - lT) * 16}px)` }}
        maxHeight={380} fitKey={line}>{line}</TplText>
      <img src={(window.__BRAND__ && window.__BRAND__.logo_motion) || "assets/batti-performance-logo.png"} alt="Batti-Performance" style={{ position: "absolute", bottom: 44, left: 440, width: 200, height: 200, opacity: brandT }} />
    </div>
  );
}
window.ConfV07Caption = ConfV07Caption;
const CONF_V07_SPEC = {
  id: 'conf-v07-caption', name: 'CONF V07 CAPTION',
  fields: [
    { "key": "duration", "label": "Length", "type": "slider", "default": 4, "min": 2, "max": 6, "step": 0.5, "unit": "s" },
    { "key": "bgClip", "label": "Background clip", "type": "image" },
    { "key": "eyebrow", "role": "eyebrow", "label": "Eyebrow", "type": "text", "default": "MANTENO SPORT PARENTS" },
    { "key": "line", "role": "hook", "label": "Line", "type": "text", "default": "THE HARDEST PART ISN'T WATCHING THEM LOSE. IT'S WATCHING THEM STOP BELIEVING THEY CAN WIN." },
    { "key": "brand", "role": "brand", "label": "Brand", "type": "text", "default": "BATTI-PERFORMANCE" }
  ],
};
window.CONF_V07_SPEC = CONF_V07_SPEC;
