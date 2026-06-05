// FRESH-ISP-MOTION-HOOK — ISP-native motion hook (beat A/B). Built from scratch
// on the ISP design system: full-bleed training clip + diagonal ink scrim, a white
// pill eyebrow in ISP blue, a Barlow Condensed hook that rises into the lower third,
// a blue accent bar, the ISP wordmark. NO AA defaults, NO guarantee, NO red — every
// color is explicit ISP. Vertical-native 1080x1920. All copy arrives via data.*.

function FreshIspMotionHook({ data = {} }) {
  const eyebrow = data.eyebrow ?? 'FORT WORTH SPORT PARENTS';
  const hook = data.hook ?? 'WHY MOST YOUNG PITCHERS STOP GAINING VELOCITY';
  const brand = data.brand ?? 'IDEAL SPORTS PERFORMANCE';
  const bgClip = data.bgClip ?? null;

  const BLUE = (window.__BRAND__ && window.__BRAND__.brand_red) || '#2573b7';
  const INK = '#1c1c1d';
  const t = useTime();
  const clamp = (x) => Math.max(0, Math.min(1, x));
  const ease = (x) => Easing.easeOutCubic(clamp(x));
  const inEye = ease((t - 0.1) / 0.4);
  const inBar = ease((t - 0.35) / 0.4);
  const inHook = ease((t - 0.45) / 0.6);
  const rise = (1 - inHook) * 44;

  return (
    <div style={{ position: 'absolute', inset: 0, background: INK, overflow: 'hidden' }}>
      {bgClip ? <SyncedVideo src={bgClip} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} /> : null}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(28,28,29,0.55) 0%, rgba(28,28,29,0.10) 26%, rgba(28,28,29,0.55) 62%, rgba(28,28,29,0.97) 100%)' }} />

      {/* eyebrow pill */}
      <div style={{ position: 'absolute', top: 150, left: 96, opacity: inEye }}>
        <TplText field="eyebrow" data={data} base={{}}
          style={{ display: 'inline-block', background: '#ffffff', color: BLUE, fontFamily: '"Barlow", sans-serif',
            fontWeight: 700, fontSize: 34, letterSpacing: '0.16em', textTransform: 'uppercase',
            padding: '13px 28px', borderRadius: 999 }}
        >{eyebrow}</TplText>
      </div>

      {/* blue accent bar */}
      <div style={{ position: 'absolute', left: 100, top: 1178, width: 116, height: 12, background: BLUE, opacity: inBar }} />

      {/* hook */}
      <TplText field="hook" data={data}
        base={{ position: 'absolute', top: 1216, left: 96, right: 96 }}
        style={{ fontFamily: '"Barlow Condensed", "Anton", sans-serif', fontWeight: 800, fontSize: 104, color: '#ffffff',
          lineHeight: 0.9, letterSpacing: '0.004em', textTransform: 'uppercase',
          opacity: inHook, transform: `translateY(${rise}px)` }}
        maxHeight={430} fitKey={hook}
      >{hook}</TplText>

      {/* wordmark */}
      <TplText field="brand" data={data}
        base={{ position: 'absolute', bottom: 78, left: 96, right: 96 }}
        style={{ fontFamily: '"Barlow", sans-serif', fontWeight: 600, fontSize: 30, color: '#ffffff',
          letterSpacing: '0.2em', textTransform: 'uppercase', opacity: 0.9 }}
      >{brand}</TplText>
    </div>
  );
}

window.FreshIspMotionHook = FreshIspMotionHook;

const FRESH_ISP_MOTION_HOOK_SPEC = {
  id: 'fresh-isp-motion-hook',
  name: 'ISP MOTION HOOK',
  fields: [
    { "key": "duration", "label": "Length", "type": "slider", "default": 6, "min": 4, "max": 10, "step": 0.5, "unit": "s" },
    { "key": "bgClip", "label": "Background clip", "type": "image" },
    { "key": "eyebrow", "role": "eyebrow", "label": "Eyebrow", "type": "text", "default": "FORT WORTH SPORT PARENTS" },
    { "key": "hook", "role": "hook", "label": "Hook", "type": "text", "default": "WHY MOST YOUNG PITCHERS STOP GAINING VELOCITY" },
    { "key": "brand", "role": "brand", "label": "Brand", "type": "text", "default": "IDEAL SPORTS PERFORMANCE" }
  ],
};
window.FRESH_ISP_MOTION_HOOK_SPEC = FRESH_ISP_MOTION_HOOK_SPEC;
