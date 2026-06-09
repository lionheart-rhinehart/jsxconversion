// FRESH-ISP-AD-SERIES-1-C1 — ISP "count-up-stats" proof (beat E, Ad 3). Built from
// scratch on the ISP design system: a graphic/data-viz reveal — a verbatim headline up
// top, then a giant ISP-blue Barlow Condensed numeral that COUNTS UP to the hero stat,
// a white stat label, a secondary proof row, the ISP wordmark. Media-free (mirrors its
// graphic example ex-091). Stat numerals are factual ISP proof-of-record (verbatim-
// exempt). NO AA defaults, NO red, NO guarantee. Vertical-native 1080x1920.

function FreshIspAdSeries1C1Reel({ data = {} }) {
  const eyebrow = data.eyebrow ?? 'FORT WORTH SPORT PARENTS';
  const hook = data.hook ?? '100+ MLB DRAFT PICKS FROM ONE GYM ISN’T LUCK';
  const statValue = data.statValue ?? '100+';
  const statLabel = data.statLabel ?? 'MLB DRAFT PICKS';
  const statRow = data.statRow ?? '1500+ ATHLETES TRAINED   ·   6 FIRST-ROUND PICKS';
  const brand = data.brand ?? 'IDEAL SPORTS PERFORMANCE';

  const BLUE = (window.__BRAND__ && window.__BRAND__.brand_red) || '#2573b7';
  const INK = '#1c1c1d';
  const t = useTime();
  const clamp = (x) => Math.max(0, Math.min(1, x));
  const ease = (x) => Easing.easeOutCubic(clamp(x));

  // Count-up: animate the leading integer of the hero stat 0 -> N over ~1.3s, keep any
  // non-digit suffix (e.g. the "+"). Factual proof numeral — exempt from the copy gate.
  const m = String(statValue).match(/^(\d+)(.*)$/);
  const target = m ? parseInt(m[1], 10) : 0;
  const suffix = m ? m[2] : '';
  const prog = ease((t - 0.35) / 1.3);
  const shown = m ? `${Math.round(target * prog)}${prog >= 1 ? suffix : ''}` : statValue;

  const inEye = ease((t - 0.1) / 0.35);
  const inHook = ease((t - 0.18) / 0.5);
  const inBar = ease((t - 1.7) / 0.4);
  const inLabel = ease((t - 1.8) / 0.5);
  const inRow = ease((t - 2.0) / 0.5);

  return (
    <div style={{ position: 'absolute', inset: 0, background: INK, overflow: 'hidden' }}>
      {/* subtle blue radial wash so the field isn't flat */}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(120% 70% at 50% 36%, rgba(37,115,183,0.18) 0%, rgba(28,28,29,0) 60%)' }} />

      {/* eyebrow */}
      <div style={{ position: 'absolute', top: 150, left: 96, opacity: inEye }}>
        <TplText field="eyebrow" data={data} base={{}}
          style={{ display: 'inline-block', background: '#ffffff', color: BLUE, fontFamily: '"Barlow", sans-serif',
            fontWeight: 700, fontSize: 34, letterSpacing: '0.16em', textTransform: 'uppercase',
            padding: '13px 28px', borderRadius: 999 }}
        >{eyebrow}</TplText>
      </div>

      {/* headline (verbatim) */}
      <TplText field="hook" data={data}
        base={{ position: 'absolute', top: 290, left: 96, right: 96 }}
        style={{ fontFamily: '"Barlow Condensed", "Oswald", sans-serif', fontWeight: 800, fontSize: 70, color: '#ffffff',
          lineHeight: 0.96, letterSpacing: '0.004em', textTransform: 'uppercase', opacity: inHook }}
        maxHeight={320} fitKey={hook}
      >{hook}</TplText>

      {/* hero count-up numeral */}
      <div style={{ position: 'absolute', top: 640, left: 90, right: 90, textAlign: 'center',
        fontFamily: '"Barlow Condensed", "Oswald", sans-serif', fontWeight: 800, fontSize: 420, color: BLUE,
        lineHeight: 0.82, letterSpacing: '-0.02em', textShadow: '0 0 26px rgba(37,115,183,0.45)' }}>{shown}</div>

      {/* blue accent bar */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1150, margin: '0 auto', width: 150, height: 12, background: BLUE, opacity: inBar }} />

      {/* stat label */}
      <div style={{ position: 'absolute', top: 1200, left: 96, right: 96, textAlign: 'center',
        fontFamily: '"Barlow Condensed", "Oswald", sans-serif', fontWeight: 700, fontSize: 96, color: '#ffffff',
        lineHeight: 0.94, letterSpacing: '0.01em', textTransform: 'uppercase', opacity: inLabel }}>{statLabel}</div>

      {/* secondary proof row */}
      <div style={{ position: 'absolute', top: 1340, left: 96, right: 96, textAlign: 'center',
        fontFamily: '"Barlow", sans-serif', fontWeight: 600, fontSize: 40, color: '#7db0e3',
        letterSpacing: '0.04em', textTransform: 'uppercase', opacity: inRow }}>{statRow}</div>

      {/* wordmark */}
      <TplText field="brand" data={data}
        base={{ position: 'absolute', bottom: 96, left: 96, right: 96, textAlign: 'center' }}
        style={{ fontFamily: '"Barlow", sans-serif', fontWeight: 600, fontSize: 30, color: '#ffffff',
          letterSpacing: '0.2em', textTransform: 'uppercase', opacity: 0.9 }}
      >{brand}</TplText>
    </div>
  );
}

window.FreshIspAdSeries1C1Reel = FreshIspAdSeries1C1Reel;

const FRESH_ISP_AD_SERIES_1_C1_SPEC = {
  id: 'fresh-isp-ad-series-1-C1',
  name: 'ISP AD-SERIES-1 C1 — COUNT-UP STATS',
  fields: [
    { "key": "duration", "label": "Length", "type": "slider", "default": 7, "min": 4, "max": 10, "step": 0.5, "unit": "s" },
    { "key": "eyebrow", "role": "eyebrow", "label": "Eyebrow", "type": "text", "default": "FORT WORTH SPORT PARENTS" },
    { "key": "hook", "role": "hook", "label": "Headline", "type": "text", "default": "100+ MLB DRAFT PICKS FROM ONE GYM ISN’T LUCK" },
    { "key": "statValue", "role": "proof", "label": "Hero stat", "type": "text", "default": "100+" },
    { "key": "statLabel", "role": "proof", "label": "Stat label", "type": "text", "default": "MLB DRAFT PICKS" },
    { "key": "statRow", "role": "proof", "label": "Secondary proof row", "type": "text", "default": "1500+ ATHLETES TRAINED   ·   6 FIRST-ROUND PICKS" },
    { "key": "brand", "role": "brand", "label": "Brand", "type": "text", "default": "IDEAL SPORTS PERFORMANCE" }
  ],
};
window.FRESH_ISP_AD_SERIES_1_C1_SPEC = FRESH_ISP_AD_SERIES_1_C1_SPEC;
