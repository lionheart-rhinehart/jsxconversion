// FRESH-ISP-AD-SERIES-1-C2 — ISP "training-scene" proof (beat E, Ad 3). Built from
// scratch on the ISP design system: the WIDE training floor owns the frame (environment
// dominant, the athletes small), with restrained chrome — a blue eyebrow, a thin blue
// rule, and a Barlow Condensed claim held in the lower band, plus the ISP wordmark.
// Distinct from the headline-dominant A1 hero. Carries real ISP media (mirrors ex-057).
// NO AA defaults, NO red, NO guarantee. Vertical-native 1080x1920. Copy via data.*.

function FreshIspAdSeries1C2Reel({ data = {} }) {
  const eyebrow = data.eyebrow ?? 'FORT WORTH SPORT PARENTS';
  const claim = data.claim ?? 'THE SYSTEM BEHIND 100+ MLB DRAFT PICKS WORKS THE SAME ON A 14-YEAR-OLD AS IT DOES ON A FIRST-ROUNDER.';
  const brand = data.brand ?? 'IDEAL SPORTS PERFORMANCE';
  const bgClip = data.bgClip ?? null;

  const BLUE = (window.__BRAND__ && window.__BRAND__.brand_red) || '#2573b7';
  const INK = '#1c1c1d';
  const t = useTime();
  const clamp = (x) => Math.max(0, Math.min(1, x));
  const ease = (x) => Easing.easeOutCubic(clamp(x));
  const drift = 1 + 0.04 * ease(t / 6);            // gentle wide-scene drift
  const inEye = ease((t - 0.2) / 0.4);
  const inRule = ease((t - 0.5) / 0.4);
  const inClaim = ease((t - 0.65) / 0.7);

  return (
    <div style={{ position: 'absolute', inset: 0, background: INK, overflow: 'hidden' }}>
      {bgClip ? (
        <SyncedVideo src={bgClip}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
            transform: `scale(${drift})`, transformOrigin: '50% 45%' }} />
      ) : null}
      {/* light top scrim for the eyebrow, heavy bottom band for the claim */}
      <div style={{ position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, rgba(28,28,29,0.55) 0%, rgba(28,28,29,0.04) 20%, rgba(28,28,29,0.04) 52%, rgba(28,28,29,0.80) 78%, rgba(28,28,29,0.97) 100%)' }} />

      {/* eyebrow */}
      <div style={{ position: 'absolute', top: 132, left: 96, opacity: inEye }}>
        <TplText field="eyebrow" data={data} base={{}}
          style={{ display: 'inline-block', background: '#ffffff', color: BLUE, fontFamily: '"Barlow", sans-serif',
            fontWeight: 700, fontSize: 32, letterSpacing: '0.16em', textTransform: 'uppercase',
            padding: '12px 26px', borderRadius: 999 }}
        >{eyebrow}</TplText>
      </div>

      {/* thin blue rule above the claim */}
      <div style={{ position: 'absolute', left: 96, top: 1396, width: 130, height: 10, background: BLUE, opacity: inRule }} />

      {/* claim — lower band, restrained size (scene stays dominant) */}
      <TplText field="claim" data={data}
        base={{ position: 'absolute', left: 96, right: 96, top: 1444 }}
        style={{ fontFamily: '"Barlow Condensed", "Oswald", sans-serif', fontWeight: 700, fontSize: 58, color: '#ffffff',
          lineHeight: 0.98, letterSpacing: '0.004em', textTransform: 'uppercase',
          textShadow: '0 3px 18px rgba(0,0,0,0.6)', opacity: inClaim }}
        maxHeight={300} fitKey={claim}
      >{claim}</TplText>

      {/* wordmark */}
      <TplText field="brand" data={data}
        base={{ position: 'absolute', bottom: 88, left: 96, right: 96 }}
        style={{ fontFamily: '"Barlow", sans-serif', fontWeight: 600, fontSize: 30, color: '#ffffff',
          letterSpacing: '0.2em', textTransform: 'uppercase', opacity: 0.9 }}
      >{brand}</TplText>
    </div>
  );
}

window.FreshIspAdSeries1C2Reel = FreshIspAdSeries1C2Reel;

const FRESH_ISP_AD_SERIES_1_C2_SPEC = {
  id: 'fresh-isp-ad-series-1-C2',
  name: 'ISP AD-SERIES-1 C2 — TRAINING SCENE',
  fields: [
    { "key": "duration", "label": "Length", "type": "slider", "default": 6, "min": 4, "max": 10, "step": 0.5, "unit": "s" },
    { "key": "bgClip", "label": "Background clip", "type": "image" },
    { "key": "eyebrow", "role": "eyebrow", "label": "Eyebrow", "type": "text", "default": "FORT WORTH SPORT PARENTS" },
    { "key": "claim", "role": "claim", "label": "Claim", "type": "text", "default": "THE SYSTEM BEHIND 100+ MLB DRAFT PICKS WORKS THE SAME ON A 14-YEAR-OLD AS IT DOES ON A FIRST-ROUNDER." },
    { "key": "brand", "role": "brand", "label": "Brand", "type": "text", "default": "IDEAL SPORTS PERFORMANCE" }
  ],
};
window.FRESH_ISP_AD_SERIES_1_C2_SPEC = FRESH_ISP_AD_SERIES_1_C2_SPEC;
