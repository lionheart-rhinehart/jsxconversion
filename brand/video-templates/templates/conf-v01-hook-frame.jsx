// CONF V01 — HOOK FRAMED. Confidence hook centered between two red rules that
// sweep in from opposite sides (a "framed" device, distinct from the band hooks).
// White-pill eyebrow top, wordmark bottom. Saira Condensed over playing footage.

function ConfV01HookFrame({ data = {} }) {
  const eyebrow = data.eyebrow ?? 'MANTENO SPORT PARENTS';
  const hook = data.hook ?? "YOUR KID DOESN'T NEED TO BE TOLD THEY'RE GOOD. THEY NEED TO SEE IT.";
  const brand = data.brand ?? 'BATTI-PERFORMANCE';
  const bgClip = data.bgClip ?? null;

  const t = useTime();
  const RED = (window.__BRAND__ && window.__BRAND__.brand_red || '#c4141d');
  const clamp = (x) => Math.max(0, Math.min(1, x));
  const topT = Easing.easeOutCubic(clamp((t - 0.2) / 0.45));
  const botT = Easing.easeOutCubic(clamp((t - 0.35) / 0.45));
  const hookT = Easing.easeOutCubic(clamp((t - 0.5) / 0.6));
  const brandT = clamp((t - 1.9) / 0.4);

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#000000', overflow: 'hidden' }}>
      {bgClip ? <SyncedVideo src={bgClip} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} /> : null}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.35) 40%, rgba(0,0,0,0.88) 100%)' }} />

      <TplText field="eyebrow" data={data} base={{ position: 'absolute', top: 150, left: 64, right: 64 }}
        style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 30, opacity: clamp((t - 0.1) / 0.3) }}>{eyebrow}</TplText>

      <div style={{ position: 'absolute', top: 760, right: 0, height: 10, width: `${topT * 78}%`, background: RED }} />
      <TplText field="hook" data={data} base={{ position: 'absolute', top: 820, left: 64, right: 64 }}
        style={{ fontFamily: 'Saira Condensed, sans-serif', fontWeight: 800, fontSize: 104, color: '#ffffff', lineHeight: 0.94, letterSpacing: '-0.01em', textTransform: 'uppercase', opacity: hookT, transform: `translateY(${(1 - hookT) * 20}px)` }}
        maxHeight={520} fitKey={hook}>{hook}</TplText>
      <div style={{ position: 'absolute', top: 1360, left: 0, height: 10, width: `${botT * 78}%`, background: RED }} />

      {/* LOGO — the real Batti badge on a white disc so it stays visible on black */}
      <img src={(window.__BRAND__ && window.__BRAND__.logo_motion) || "assets/batti-performance-logo.png"} alt="Batti-Performance" style={{ position: "absolute", bottom: 44, left: 440, width: 200, height: 200, opacity: brandT }} />
    </div>
  );
}
window.ConfV01HookFrame = ConfV01HookFrame;
const CONF_V01_SPEC = {
  id: 'conf-v01-hook-frame', name: 'CONF V01 HOOK FRAME',
  fields: [
    { "key": "duration", "label": "Length", "type": "slider", "default": 4, "min": 2, "max": 6, "step": 0.5, "unit": "s" },
    { "key": "bgClip", "label": "Background clip", "type": "image" },
    { "key": "eyebrow", "role": "eyebrow", "label": "Eyebrow", "type": "text", "default": "MANTENO SPORT PARENTS" },
    { "key": "hook", "role": "hook", "label": "Hook", "type": "text", "default": "YOUR KID DOESN'T NEED TO BE TOLD THEY'RE GOOD. THEY NEED TO SEE IT." },
    { "key": "brand", "role": "brand", "label": "Brand", "type": "text", "default": "BATTI-PERFORMANCE" }
  ],
};
window.CONF_V01_SPEC = CONF_V01_SPEC;
