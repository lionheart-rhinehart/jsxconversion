// FRESH-ISP-AD-SERIES-1-A1 — ISP "action-hero" cold hook (beat A). Built from scratch
// on the ISP design system, distinct from the fresh-isp-motion-hook skeleton:
// full-bleed pitcher clip with a slow push-in, a left-edge blue accent column that
// wipes down, a small mono kicker top-left, and a HUGE Barlow Condensed headline that
// owns the lower-center (the dominant element). Heavy bottom scrim for legibility,
// ISP wordmark bottom-left. NO AA defaults, NO red, NO guarantee — every color is ISP.
// Vertical-native 1080x1920. All copy arrives via data.*; bg clip via data.bgClip.

function FreshIspAdSeries1A1Reel({ data = {} }) {
  const eyebrow = data.eyebrow ?? 'FORT WORTH SPORT PARENTS';
  const hook = data.hook ?? 'WHY MOST YOUNG PITCHERS STOP GAINING VELOCITY';
  const brand = data.brand ?? 'IDEAL SPORTS PERFORMANCE';
  const bgClip = data.bgClip ?? null;

  const BLUE = (window.__BRAND__ && window.__BRAND__.brand_red) || '#2573b7';
  const INK = '#1c1c1d';
  const t = useTime();
  const clamp = (x) => Math.max(0, Math.min(1, x));
  const ease = (x) => Easing.easeOutCubic(clamp(x));
  const inKick = ease((t - 0.10) / 0.35);
  const inCol = ease((t - 0.25) / 0.45);
  const inHook = ease((t - 0.40) / 0.7);
  const push = 1 + 0.06 * ease(t / 6);          // slow Ken-Burns push-in over the clip
  const rise = (1 - inHook) * 52;

  return (
    <div style={{ position: 'absolute', inset: 0, background: INK, overflow: 'hidden' }}>
      {bgClip ? (
        <SyncedVideo src={bgClip}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
            transform: `scale(${push})`, transformOrigin: '60% 38%' }} />
      ) : null}
      {/* legibility scrim — light up top so the action reads, heavy at the headline band */}
      <div style={{ position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, rgba(28,28,29,0.62) 0%, rgba(28,28,29,0.06) 24%, rgba(28,28,29,0.20) 50%, rgba(28,28,29,0.86) 78%, rgba(28,28,29,0.98) 100%)' }} />

      {/* left blue accent column, wipes down */}
      <div style={{ position: 'absolute', left: 0, top: 0, width: 16, height: 1920,
        background: BLUE, transform: `scaleY(${inCol})`, transformOrigin: 'top' }} />

      {/* mono kicker, top-left */}
      <div style={{ position: 'absolute', top: 132, left: 96, opacity: inKick }}>
        <TplText field="eyebrow" data={data} base={{}}
          style={{ display: 'inline-block', color: '#ffffff', fontFamily: '"Barlow Condensed", "Oswald", sans-serif',
            fontWeight: 700, fontSize: 32, letterSpacing: '0.22em', textTransform: 'uppercase' }}
        >{eyebrow}</TplText>
        <div style={{ width: 84, height: 6, background: BLUE, marginTop: 16 }} />
      </div>

      {/* dominant headline, lower-center */}
      <TplText field="hook" data={data}
        base={{ position: 'absolute', left: 96, right: 84, bottom: 286 }}
        style={{ fontFamily: '"Barlow Condensed", "Oswald", sans-serif', fontWeight: 800, fontSize: 138, color: '#ffffff',
          lineHeight: 0.86, letterSpacing: '0.002em', textTransform: 'uppercase',
          textShadow: '0 4px 22px rgba(0,0,0,0.65)', opacity: inHook, transform: `translateY(${rise}px)` }}
        maxHeight={760} fitKey={hook}
      >{hook}</TplText>

      {/* wordmark, bottom-left */}
      <TplText field="brand" data={data}
        base={{ position: 'absolute', bottom: 96, left: 96, right: 96 }}
        style={{ fontFamily: '"Barlow", sans-serif', fontWeight: 600, fontSize: 30, color: '#ffffff',
          letterSpacing: '0.2em', textTransform: 'uppercase', opacity: 0.9 }}
      >{brand}</TplText>
    </div>
  );
}

window.FreshIspAdSeries1A1Reel = FreshIspAdSeries1A1Reel;

const FRESH_ISP_AD_SERIES_1_A1_SPEC = {
  id: 'fresh-isp-ad-series-1-A1',
  name: 'ISP AD-SERIES-1 A1 — ACTION HERO',
  fields: [
    { "key": "duration", "label": "Length", "type": "slider", "default": 6, "min": 4, "max": 10, "step": 0.5, "unit": "s" },
    { "key": "bgClip", "label": "Background clip", "type": "image" },
    { "key": "eyebrow", "role": "eyebrow", "label": "Eyebrow", "type": "text", "default": "FORT WORTH SPORT PARENTS" },
    { "key": "hook", "role": "hook", "label": "Hook", "type": "text", "default": "WHY MOST YOUNG PITCHERS STOP GAINING VELOCITY" },
    { "key": "brand", "role": "brand", "label": "Brand", "type": "text", "default": "IDEAL SPORTS PERFORMANCE" }
  ],
};
window.FRESH_ISP_AD_SERIES_1_A1_SPEC = FRESH_ISP_AD_SERIES_1_A1_SPEC;
