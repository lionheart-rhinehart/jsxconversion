// VELOCITY-DROP — mechanism animation (beat C). Bars "perform" rep by rep and
// fall; when velocity crosses the 10% threshold the bars turn red and a red
// cutoff line fires with "SET ENDS HERE" — the set stops. The graph carries the
// mechanism; the coach is a lower-third credential. Vertical-native 1080x1920.
// Rendered inside <Stage duration> by the runner (useTime runs in-Stage).

function VelocityDrop({ data = {} }) {
  const eyebrow = data.eyebrow ?? 'CITY SPORTS PARENTS';
  const claim = data.claim ?? 'THE SET ENDS THE SECOND SPEED DROPS.';
  const coachName = data.coachName ?? 'COACH GRAHAM WILKERSON';
  const credentials = data.credentials ?? 'CSCS · NFL-TRAINED';
  const brand = data.brand ?? 'ATHLETES ACCELERATION';
  const bgClip = data.bgClip ?? null;

  const t = useTime();
  const RED = '#c4141d';
  const clamp = (x) => Math.max(0, Math.min(1, x));
  const ease = (x) => Easing.easeOutCubic(clamp(x));

  // 8 reps; bars fall in sequence. Last 3 are below the 10% cutoff (red).
  const bars = [330, 318, 308, 300, 292, 270, 250, 232];
  const baseline = 1320, chartX = 90, barW = 80, gap = 37;
  const cutoffH = 286; // 10% below the fastest rep
  const capT = ease((t - 0.2) / 0.4);            // caption
  const cutoffT = ease((t - 2.4) / 0.5);          // cutoff line + label after rep 5
  const coachT = ease((t - 5.2) / 0.5);           // coach lower-third

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a0b0d', overflow: 'hidden' }}>
      {bgClip ? <video src={bgClip} autoPlay muted playsInline loop style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} /> : null}
      {bgClip ? <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(10,11,13,0.55) 0%, rgba(10,11,13,0.45) 45%, rgba(10,11,13,0.85) 100%)' }} /> : null}
      <div style={{ position: 'absolute', top: 150, left: 90,
        fontFamily: '"JetBrains Mono", monospace', fontSize: 32, color: RED, fontWeight: 700,
        display: 'inline-block', background: '#fff', padding: '10px 22px', borderRadius: 8,
        letterSpacing: '0.04em', textTransform: 'uppercase', opacity: ease((t - 0.05) / 0.3) }}>
        {eyebrow}
      </div>
      <div style={{ position: 'absolute', top: 360, left: 86, right: 86,
        fontFamily: 'Anton, sans-serif', fontSize: 104, color: '#fff', lineHeight: 0.95,
        textTransform: 'uppercase', opacity: capT, transform: `translateY(${(1 - capT) * 14}px)` }}>
        {claim}
      </div>

      {/* baseline */}
      <div style={{ position: 'absolute', left: chartX, top: baseline, width: 900, height: 3, background: '#3a3d42' }} />

      {/* bars grow rep by rep */}
      {bars.map((h, i) => {
        const appear = ease((t - (0.6 + i * 0.32)) / 0.35);
        const hh = h * appear;
        const below = h < cutoffH;
        const color = below ? RED : (i === 4 ? '#9aa0a6' : '#ffffff');
        return (
          <div key={i} style={{ position: 'absolute', left: chartX + i * (barW + gap),
            top: baseline - hh, width: barW, height: hh, background: color, opacity: appear }} />
        );
      })}

      {/* 10% cutoff line + label */}
      <div style={{ position: 'absolute', left: chartX, top: baseline - cutoffH, width: 900 * cutoffT,
        height: 5, background: RED }} />
      <div style={{ position: 'absolute', left: 600, top: baseline - cutoffH - 52, width: 390, textAlign: 'right',
        fontFamily: '"JetBrains Mono", monospace', fontSize: 28, color: RED, letterSpacing: '0.04em',
        textTransform: 'uppercase', opacity: cutoffT }}>10% DROP · SET ENDS HERE</div>
      <div style={{ position: 'absolute', left: chartX, top: baseline + 20, width: 900,
        fontFamily: '"JetBrains Mono", monospace', fontSize: 28, color: '#9aa0a6', letterSpacing: '0.06em',
        textTransform: 'uppercase', opacity: capT }}>BAR VELOCITY · REP BY REP</div>

      {/* coach lower-third */}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 150, padding: '0 90px',
        opacity: coachT, transform: `translateY(${(1 - coachT) * 20}px)` }}>
        <div style={{ width: 90, height: 6, background: RED, marginBottom: 18 }} />
        <div style={{ fontFamily: 'Anton, sans-serif', fontSize: 52, color: '#fff', textTransform: 'uppercase', lineHeight: 1 }}>{coachName}</div>
        <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 30, color: '#9aa0a6', letterSpacing: '0.06em', textTransform: 'uppercase', marginTop: 10 }}>{credentials}</div>
      </div>

      <div style={{ position: 'absolute', bottom: 70, left: 90, right: 90,
        fontFamily: '"JetBrains Mono", monospace', fontSize: 28, color: '#fff',
        letterSpacing: '0.14em', textTransform: 'uppercase', opacity: 0.85 }}>{brand}</div>
    </div>
  );
}

window.VelocityDrop = VelocityDrop;

const VELOCITY_DROP_SPEC = {
  id: 'velocity-drop',
  name: 'VELOCITY DROP (mechanism)',
  fields: [
    { "key": "duration", "label": "Length", "type": "slider", "default": 9, "min": 6, "max": 15, "step": 0.5, "unit": "s" },
    { "key": "eyebrow", "role": "eyebrow", "label": "Eyebrow", "type": "text", "default": "CITY SPORTS PARENTS" },
    { "key": "claim", "role": "mechanism", "label": "Mechanism caption", "type": "text", "default": "THE SET ENDS THE SECOND SPEED DROPS." },
    { "key": "coachName", "role": "byline", "label": "Coach name", "type": "text", "default": "COACH GRAHAM WILKERSON" },
    { "key": "credentials", "role": "proof", "label": "Credentials", "type": "text", "default": "CSCS · NFL-TRAINED" },
    { "key": "brand", "role": "brand", "label": "Brand", "type": "text", "default": "ATHLETES ACCELERATION" }
  ],
};
window.VELOCITY_DROP_SPEC = VELOCITY_DROP_SPEC;
