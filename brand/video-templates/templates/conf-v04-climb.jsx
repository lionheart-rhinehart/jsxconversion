// CONF V04 — DATA CLIMB. The visible-numbers mechanism: a row of bars rises to
// increasing heights (data climbing), then the statement lands. Distinct data
// motif over playing footage.

function ConfV04Climb({ data = {} }) {
  const eyebrow = data.eyebrow ?? 'MANTENO SPORT PARENTS';
  const statement = data.statement ?? 'REAL SPRINT TIMES AND JUMP HEIGHTS ON A SCREEN, CLIMBING EVERY WEEK.';
  const brand = data.brand ?? 'BATTI-PERFORMANCE';
  const bgClip = data.bgClip ?? null;

  const t = useTime();
  const RED = (window.__BRAND__ && window.__BRAND__.brand_red || '#c4141d');
  const clamp = (x) => Math.max(0, Math.min(1, x));
  const stT = Easing.easeOutCubic(clamp((t - 1.0) / 0.6));
  const brandT = clamp((t - 2.0) / 0.4);
  const bars = [0.32, 0.46, 0.6, 0.78, 1.0];

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#000000', overflow: 'hidden' }}>
      {bgClip ? <SyncedVideo src={bgClip} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} /> : null}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.45) 45%, rgba(0,0,0,0.92) 100%)' }} />

      <TplText field="eyebrow" data={data} base={{ position: 'absolute', top: 150, left: 64, right: 64 }}
        style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 30, opacity: clamp((t - 0.1) / 0.3) }}>{eyebrow}</TplText>

      {/* baseline */}
      <div style={{ position: 'absolute', top: 980, left: 64, width: 952, height: 5, background: 'rgba(255,255,255,0.4)' }} />
      {bars.map((h, i) => {
        const bt = Easing.easeOutCubic(clamp((t - (0.25 + i * 0.13)) / 0.4));
        const full = h * 460;
        return <div key={i} style={{ position: 'absolute', top: 980 - full * bt, left: 96 + i * 184, width: 132, height: full * bt, background: i === bars.length - 1 ? RED : '#ffffff' }} />;
      })}

      <TplText field="statement" data={data} base={{ position: 'absolute', top: 1100, left: 64, right: 64 }}
        style={{ fontFamily: 'Saira Condensed, sans-serif', fontWeight: 800, fontSize: 90, color: '#ffffff', lineHeight: 0.96, textTransform: 'uppercase', letterSpacing: '-0.005em', opacity: stT, transform: `translateY(${(1 - stT) * 18}px)` }}
        maxHeight={520} fitKey={statement}>{statement}</TplText>

      <img src={(window.__BRAND__ && window.__BRAND__.logo_motion) || "assets/batti-performance-logo.png"} alt="Batti-Performance" style={{ position: "absolute", bottom: 44, left: 440, width: 200, height: 200, opacity: brandT }} />
    </div>
  );
}
window.ConfV04Climb = ConfV04Climb;
const CONF_V04_SPEC = {
  id: 'conf-v04-climb', name: 'CONF V04 DATA CLIMB',
  fields: [
    { "key": "duration", "label": "Length", "type": "slider", "default": 4, "min": 2, "max": 6, "step": 0.5, "unit": "s" },
    { "key": "bgClip", "label": "Background clip", "type": "image" },
    { "key": "eyebrow", "role": "eyebrow", "label": "Eyebrow", "type": "text", "default": "MANTENO SPORT PARENTS" },
    { "key": "statement", "role": "mechanism", "label": "Statement", "type": "text", "default": "REAL SPRINT TIMES AND JUMP HEIGHTS ON A SCREEN, CLIMBING EVERY WEEK." },
    { "key": "brand", "role": "brand", "label": "Brand", "type": "text", "default": "BATTI-PERFORMANCE" }
  ],
};
window.CONF_V04_SPEC = CONF_V04_SPEC;
