// FRESH-ISP-AD-SERIES-1-B2 — ISP "split-panel" mechanism (beat C, Ad 2). Built from
// scratch on the ISP design system: a clean horizontal SPLIT — the throwing clip fills
// the upper ~56% of the frame, a raised ink panel holds the lower ~44% with a blue
// eyebrow, a Barlow Condensed mechanism line, a blue accent bar and the ISP wordmark.
// Distinct from the full-bleed A1 hero. NO AA defaults, NO red, NO guarantee.
// Vertical-native 1080x1920. Copy via data.*; bg clip via data.bgClip.

function FreshIspAdSeries1B2Reel({ data = {} }) {
  const eyebrow = data.eyebrow ?? 'FORT WORTH SPORT PARENTS';
  const hook = data.hook ?? 'THE SAME THING CAPPING YOUR ATHLETE’S VELOCITY IS THE THING PUTTING THE ARM AT RISK.';
  const brand = data.brand ?? 'IDEAL SPORTS PERFORMANCE';
  const bgClip = data.bgClip ?? null;

  const BLUE = (window.__BRAND__ && window.__BRAND__.brand_red) || '#2573b7';
  const INK = '#1c1c1d';
  const PANEL = '#232325';
  const t = useTime();
  const clamp = (x) => Math.max(0, Math.min(1, x));
  const ease = (x) => Easing.easeOutCubic(clamp(x));
  const SPLIT = 1072;                              // panel top edge (≈56% media / 44% panel)
  const inPanel = ease((t - 0.2) / 0.5);
  const inEye = ease((t - 0.45) / 0.4);
  const inHook = ease((t - 0.6) / 0.7);
  const slide = (1 - inPanel) * 90;

  return (
    <div style={{ position: 'absolute', inset: 0, background: INK, overflow: 'hidden' }}>
      {/* media — upper split */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: SPLIT, overflow: 'hidden' }}>
        {bgClip ? <SyncedVideo src={bgClip} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} /> : null}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(28,28,29,0.34) 0%, rgba(28,28,29,0.05) 30%, rgba(28,28,29,0.55) 100%)' }} />
      </div>

      {/* raised ink panel — lower split */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: SPLIT, bottom: 0, background: PANEL,
        transform: `translateY(${slide}px)`, opacity: inPanel }}>
        {/* blue accent bar */}
        <div style={{ position: 'absolute', left: 96, top: 70, width: 130, height: 12, background: BLUE, opacity: inPanel }} />

        {/* eyebrow */}
        <div style={{ position: 'absolute', left: 96, top: 118, opacity: inEye }}>
          <TplText field="eyebrow" data={data} base={{}}
            style={{ color: BLUE, fontFamily: '"Barlow Condensed", "Oswald", sans-serif', fontWeight: 700,
              fontSize: 32, letterSpacing: '0.2em', textTransform: 'uppercase' }}
          >{eyebrow}</TplText>
        </div>

        {/* mechanism line */}
        <TplText field="hook" data={data}
          base={{ position: 'absolute', left: 96, right: 96, top: 196 }}
          style={{ fontFamily: '"Barlow Condensed", "Oswald", sans-serif', fontWeight: 800, fontSize: 76, color: '#ffffff',
            lineHeight: 0.96, letterSpacing: '0.004em', textTransform: 'uppercase', opacity: inHook }}
          maxHeight={430} fitKey={hook}
        >{hook}</TplText>

        {/* wordmark */}
        <TplText field="brand" data={data}
          base={{ position: 'absolute', left: 96, right: 96, bottom: 70 }}
          style={{ fontFamily: '"Barlow", sans-serif', fontWeight: 600, fontSize: 30, color: '#ffffff',
            letterSpacing: '0.2em', textTransform: 'uppercase', opacity: 0.9 }}
        >{brand}</TplText>
      </div>
    </div>
  );
}

window.FreshIspAdSeries1B2Reel = FreshIspAdSeries1B2Reel;

const FRESH_ISP_AD_SERIES_1_B2_SPEC = {
  id: 'fresh-isp-ad-series-1-B2',
  name: 'ISP AD-SERIES-1 B2 — SPLIT PANEL',
  fields: [
    { "key": "duration", "label": "Length", "type": "slider", "default": 6, "min": 4, "max": 10, "step": 0.5, "unit": "s" },
    { "key": "bgClip", "label": "Background clip", "type": "image" },
    { "key": "eyebrow", "role": "eyebrow", "label": "Eyebrow", "type": "text", "default": "FORT WORTH SPORT PARENTS" },
    { "key": "hook", "role": "hook", "label": "Mechanism line", "type": "text", "default": "THE SAME THING CAPPING YOUR ATHLETE’S VELOCITY IS THE THING PUTTING THE ARM AT RISK." },
    { "key": "brand", "role": "brand", "label": "Brand", "type": "text", "default": "IDEAL SPORTS PERFORMANCE" }
  ],
};
window.FRESH_ISP_AD_SERIES_1_B2_SPEC = FRESH_ISP_AD_SERIES_1_B2_SPEC;
