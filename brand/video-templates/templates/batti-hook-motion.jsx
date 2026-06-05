// BATTI HOOK (motion) — Batti-native stop-the-scroll hook over playing footage.
// Vertical 1080x1920. Single Saira Condensed stacked-caps hook rises in over a
// bottom-weighted scrim, marked by a red rule that sweeps in. Plain mono-red
// eyebrow (Batti's one eyebrow format), wordmark. Captions carry the message.

function BattiHookMotion({ data = {} }) {
  const eyebrow = data.eyebrow ?? 'MANTENO SPORT PARENTS';
  const hook = data.hook ?? "SIX MONTHS. EVERY PRACTICE. NEVER QUIT. STILL THE SAME SPEED. THIS IS PHYSICS.";
  const brand = data.brand ?? 'BATTI-PERFORMANCE';
  const bgClip = data.bgClip ?? null;

  const t = useTime();
  const RED = (window.__BRAND__ && window.__BRAND__.brand_red || '#c4141d');
  const clamp = (x) => Math.max(0, Math.min(1, x));
  const eyeT = clamp((t - 0.1) / 0.3);
  const barT = Easing.easeOutCubic(clamp((t - 0.25) / 0.4));
  const hookT = Easing.easeOutCubic(clamp((t - 0.45) / 0.6));
  const brandT = clamp((t - 1.8) / 0.4);

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#000000', overflow: 'hidden' }}>
      {bgClip ? <SyncedVideo src={bgClip} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} /> : null}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.05) 30%, rgba(0,0,0,0.4) 58%, rgba(0,0,0,0.95) 100%)' }} />

      <div style={{ position: 'absolute', top: 1226, left: 0, height: 8, width: `${barT * 100}%`, background: RED }} />

      <TplText field="eyebrow" data={data} base={{ position: 'absolute', top: 1266, left: 64, right: 64 }}
        style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 30, color: RED, letterSpacing: '0.22em', textTransform: 'uppercase', opacity: eyeT }}>{eyebrow}</TplText>

      <TplText field="hook" data={data} base={{ position: 'absolute', top: 1332, left: 64, right: 64 }}
        style={{ fontFamily: 'Saira Condensed, sans-serif', fontWeight: 800, fontSize: 88, color: '#ffffff', lineHeight: 0.95, letterSpacing: '-0.01em', textTransform: 'uppercase', opacity: hookT, transform: `translateY(${(1 - hookT) * 20}px)` }}
        maxHeight={460} fitKey={hook}>{hook}</TplText>

      <img src={(window.__BRAND__ && window.__BRAND__.logo_motion) || "assets/batti-performance-logo.png"} alt="Batti-Performance" style={{ position: "absolute", bottom: 44, left: 440, width: 200, height: 200, opacity: brandT }} />
    </div>
  );
}

window.BattiHookMotion = BattiHookMotion;

const BATTI_HOOK_MOTION_SPEC = {
  id: 'batti-hook-motion',
  name: 'BATTI HOOK (motion)',
  fields: [
    { "key": "duration", "label": "Length", "type": "slider", "default": 4, "min": 2, "max": 6, "step": 0.5, "unit": "s" },
    { "key": "bgClip", "label": "Background clip", "type": "image" },
    { "key": "eyebrow", "role": "eyebrow", "label": "Eyebrow", "type": "text", "default": "MANTENO SPORT PARENTS" },
    { "key": "hook", "role": "hook", "label": "Hook", "type": "text", "default": "SIX MONTHS. EVERY PRACTICE. NEVER QUIT. STILL THE SAME SPEED. THIS IS PHYSICS." },
    { "key": "brand", "role": "brand", "label": "Brand", "type": "text", "default": "BATTI-PERFORMANCE" }
  ],
};
window.BATTI_HOOK_MOTION_SPEC = BATTI_HOOK_MOTION_SPEC;
