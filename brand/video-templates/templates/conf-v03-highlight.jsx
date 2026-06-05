// CONF V03 — HIGHLIGHT. A single statement; a red highlighter bar wipes in behind
// the first line before the words land. Distinct "highlighter" device over footage.

function ConfV03Highlight({ data = {} }) {
  const eyebrow = data.eyebrow ?? 'MANTENO SPORT PARENTS';
  const claim = data.claim ?? "ENCOURAGEMENT CAN'T FIX THIS.";
  const sub = data.sub ?? 'IT GETS SOLVED WITH EVIDENCE.';
  const brand = data.brand ?? 'BATTI-PERFORMANCE';
  const bgClip = data.bgClip ?? null;

  const t = useTime();
  const RED = (window.__BRAND__ && window.__BRAND__.brand_red || '#c4141d');
  const clamp = (x) => Math.max(0, Math.min(1, x));
  const hiT = Easing.easeOutCubic(clamp((t - 0.3) / 0.45));
  const cT = clamp((t - 0.55) / 0.4);
  const sT = Easing.easeOutCubic(clamp((t - 1.1) / 0.5));
  const brandT = clamp((t - 1.9) / 0.4);

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#000000', overflow: 'hidden' }}>
      {bgClip ? <SyncedVideo src={bgClip} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} /> : null}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.45) 45%, rgba(0,0,0,0.9) 100%)' }} />

      <TplText field="eyebrow" data={data} base={{ position: 'absolute', top: 150, left: 64, right: 64 }}
        style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 30, opacity: clamp((t - 0.1) / 0.3) }}>{eyebrow}</TplText>

      <div style={{ position: 'absolute', top: 1086, left: 56, height: 150, width: `${hiT * 86}%`, background: RED }} />
      <TplText field="claim" data={data} base={{ position: 'absolute', top: 1096, left: 64, right: 64 }}
        style={{ fontFamily: 'Saira Condensed, sans-serif', fontWeight: 900, fontSize: 124, color: '#ffffff', lineHeight: 0.92, textTransform: 'uppercase', letterSpacing: '-0.01em', opacity: cT }}
        maxHeight={300} fitKey={claim}>{claim}</TplText>

      <TplText field="sub" data={data} base={{ position: 'absolute', top: 1320, left: 64, right: 64 }}
        style={{ fontFamily: 'Saira Condensed, sans-serif', fontWeight: 700, fontSize: 62, color: '#d8d8d8', lineHeight: 0.98, textTransform: 'uppercase', letterSpacing: '0', opacity: sT, transform: `translateY(${(1 - sT) * 14}px)` }}
        maxHeight={200} fitKey={sub}>{sub}</TplText>

      <img src={(window.__BRAND__ && window.__BRAND__.logo_motion) || "assets/batti-performance-logo.png"} alt="Batti-Performance" style={{ position: "absolute", bottom: 44, left: 440, width: 200, height: 200, opacity: brandT }} />
    </div>
  );
}
window.ConfV03Highlight = ConfV03Highlight;
const CONF_V03_SPEC = {
  id: 'conf-v03-highlight', name: 'CONF V03 HIGHLIGHT',
  fields: [
    { "key": "duration", "label": "Length", "type": "slider", "default": 4, "min": 2, "max": 6, "step": 0.5, "unit": "s" },
    { "key": "bgClip", "label": "Background clip", "type": "image" },
    { "key": "eyebrow", "role": "eyebrow", "label": "Eyebrow", "type": "text", "default": "MANTENO SPORT PARENTS" },
    { "key": "claim", "role": "claim", "label": "Claim (highlighted)", "type": "text", "default": "ENCOURAGEMENT CAN'T FIX THIS." },
    { "key": "sub", "role": "reframe", "label": "Sub", "type": "text", "default": "IT GETS SOLVED WITH EVIDENCE." },
    { "key": "brand", "role": "brand", "label": "Brand", "type": "text", "default": "BATTI-PERFORMANCE" }
  ],
};
window.CONF_V03_SPEC = CONF_V03_SPEC;
