// BATTI QUOTE (motion) — editorial reframe line set off by a red left border
// (Batti's quote device) that draws down before the line fades up. Over footage.

function BattiQuoteMotion({ data = {} }) {
  const eyebrow = data.eyebrow ?? 'MANTENO SPORT PARENTS';
  const quote = data.quote ?? "AND A FAST REP ISN'T JUST A NUMBER.";
  const brand = data.brand ?? 'BATTI-PERFORMANCE';
  const bgClip = data.bgClip ?? null;

  const t = useTime();
  const RED = (window.__BRAND__ && window.__BRAND__.brand_red || '#c4141d');
  const clamp = (x) => Math.max(0, Math.min(1, x));
  const eyeT = clamp((t - 0.1) / 0.3);
  const borderT = Easing.easeOutCubic(clamp((t - 0.3) / 0.5));
  const qT = Easing.easeOutCubic(clamp((t - 0.6) / 0.6));
  const brandT = clamp((t - 1.7) / 0.4);

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#000000', overflow: 'hidden' }}>
      {bgClip ? <SyncedVideo src={bgClip} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} /> : null}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.5) 45%, rgba(0,0,0,0.82) 100%)' }} />

      <TplText field="eyebrow" data={data} base={{ position: 'absolute', top: 150, left: 64, right: 64 }}
        style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 30, color: RED, letterSpacing: '0.22em', textTransform: 'uppercase', opacity: eyeT }}>{eyebrow}</TplText>

      <div style={{ position: 'absolute', top: 820, left: 64, width: 9, height: borderT * 420, background: RED }} />

      <TplText field="quote" data={data} base={{ position: 'absolute', top: 832, left: 104, right: 64 }}
        style={{ fontFamily: 'Saira Condensed, sans-serif', fontWeight: 700, fontSize: 78, color: '#ffffff', lineHeight: 1.02, letterSpacing: '-0.005em', textTransform: 'uppercase', opacity: qT, transform: `translateY(${(1 - qT) * 18}px)` }}
        maxHeight={420} fitKey={quote}>{quote}</TplText>

      <TplText field="brand" data={data} base={{ position: 'absolute', bottom: 96, left: 64, right: 64 }}
        style={{ fontFamily: 'Saira Condensed, sans-serif', fontWeight: 900, fontSize: 30, color: '#ffffff', letterSpacing: '0.02em', textTransform: 'uppercase', opacity: brandT }}>{brand}</TplText>
    </div>
  );
}

window.BattiQuoteMotion = BattiQuoteMotion;

const BATTI_QUOTE_MOTION_SPEC = {
  id: 'batti-quote-motion',
  name: 'BATTI QUOTE (motion)',
  fields: [
    { "key": "duration", "label": "Length", "type": "slider", "default": 4, "min": 2, "max": 6, "step": 0.5, "unit": "s" },
    { "key": "bgClip", "label": "Background clip", "type": "image" },
    { "key": "eyebrow", "role": "eyebrow", "label": "Eyebrow", "type": "text", "default": "MANTENO SPORT PARENTS" },
    { "key": "quote", "role": "reframe", "label": "Quote / reframe", "type": "text", "default": "AND A FAST REP ISN'T JUST A NUMBER." },
    { "key": "brand", "role": "brand", "label": "Brand", "type": "text", "default": "BATTI-PERFORMANCE" }
  ],
};
window.BATTI_QUOTE_MOTION_SPEC = BATTI_QUOTE_MOTION_SPEC;
