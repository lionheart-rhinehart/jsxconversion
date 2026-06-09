// FRESH-ENGINE-TRANSFER-NOBLESVILLE-C6 — AA "radar-stats" motion graphic (beat C, NO bg photo).
// Built from scratch on the Athletes Acceleration design system, guided by example
// ex-072-radar-stats: a 5-axis spider chart on INK — concentric chrome guide rings + spokes,
// mono axis labels (SPEED / POWER / FORCE / FIRST STEP / ACCELERATION), and a red (#c4141d)
// filled polygon that EXPANDS outward from center as the clip plays (useTime drives the
// expansion + a soft glow pulse — "when the engine grows, it shows up everywhere"). The claim
// is the dominant Anton headline up top. Data-viz archetype: photo-free by rule. Every text
// node is colored + TplText-wrapped. Vertical-native 1080x1920. All copy via data.*.

function FreshEngineTransferNoblesvilleC6Reel({ data = {} }) {
  const eyebrow = data.eyebrow ?? 'NOBLESVILLE SPORT PARENTS';
  const claim = data.claim ?? 'WHEN THE ENGINE GROWS, IT SHOWS UP EVERYWHERE.';
  const brand = data.brand ?? 'ATHLETES ACCELERATION';

  const RED = (window.__BRAND__ && window.__BRAND__.brand_red || '#c4141d');
  const INK = '#0a0b0d';
  const PANEL = '#15171a';
  const CHROME = 'rgba(255,255,255,0.16)';

  const t = useTime();
  const clamp = (x) => Math.max(0, Math.min(1, x));
  const ease = (x) => Easing.easeOutCubic(clamp(x));

  const inKick = ease((t - 0.10) / 0.35);   // eyebrow
  const inClaim = ease((t - 0.30) / 0.7);    // headline
  const inRings = ease((t - 0.55) / 0.6);    // chart frame fades/draws in
  const grow = ease((t - 0.85) / 1.9);       // the engine growing — polygon expands outward

  // soft glow pulse once the polygon is mostly out
  const pulse = 0.5 + 0.5 * Math.sin((t - 0.85) * 2.2);
  const glow = 10 + 16 * grow * (0.4 + 0.6 * pulse);

  const rise = (1 - inClaim) * 46;

  // --- radar geometry (5 axes), centered in the lower-mid of the frame ---
  const CX = 540;
  const CY = 1180;
  const R = 380;                                // max ring radius
  const N = 5;
  // each axis: label + a "current" value 0..1 (the per-quality reach of the engine)
  const AXES = [
    { label: 'SPEED', v: 0.92 },
    { label: 'POWER', v: 0.84 },
    { label: 'FORCE', v: 0.78 },
    { label: 'FIRST STEP', v: 0.88 },
    { label: 'ACCELERATION', v: 0.95 },
  ];
  // start at top (-90deg), go clockwise
  const angleAt = (i) => (-90 + (360 / N) * i) * (Math.PI / 180);
  const ptAt = (i, radius) => ({
    x: CX + radius * Math.cos(angleAt(i)),
    y: CY + radius * Math.sin(angleAt(i)),
  });

  // guide rings: 4 concentric pentagons
  const RING_FRACS = [0.25, 0.5, 0.75, 1.0];
  const ringPoints = (frac) =>
    AXES.map((_, i) => ptAt(i, R * frac)).map((p) => `${p.x},${p.y}`).join(' ');

  // the filled data polygon, scaled by `grow`
  const dataPoints = AXES.map((a, i) => ptAt(i, R * a.v * grow))
    .map((p) => `${p.x},${p.y}`)
    .join(' ');

  return (
    <div style={{ position: 'absolute', inset: 0, background: INK, overflow: 'hidden' }}>
      {/* subtle vignette / center lift so the chart sits on a raised field */}
      <div style={{ position: 'absolute', inset: 0,
        background: `radial-gradient(120% 70% at 50% 62%, ${PANEL} 0%, ${INK} 70%)` }} />

      {/* left red accent column, anchors the AA rail */}
      <div style={{ position: 'absolute', left: 0, top: 0, width: 16, height: 1920,
        background: RED, transform: `scaleY(${inRings})`, transformOrigin: 'top' }} />

      {/* mono eyebrow chip, top-left */}
      <div style={{ position: 'absolute', top: 128, left: 96, opacity: inKick }}>
        <TplText field="eyebrow" data={data} base={{}}
          style={{ display: 'inline-block', color: '#ffffff', fontFamily: '"JetBrains Mono", ui-monospace, monospace',
            fontWeight: 700, fontSize: 30, letterSpacing: '0.22em', textTransform: 'uppercase' }}
        >{eyebrow}</TplText>
        <div style={{ width: 84, height: 6, background: RED, marginTop: 16 }} />
      </div>

      {/* dominant headline — the claim, owns the upper band */}
      <TplText field="claim" data={data}
        base={{ position: 'absolute', left: 96, right: 84, top: 230 }}
        style={{ fontFamily: '"Anton", "Oswald", sans-serif', fontWeight: 400, fontSize: 104, color: '#ffffff',
          lineHeight: 0.9, letterSpacing: '0.004em', textTransform: 'uppercase',
          textShadow: '0 4px 22px rgba(0,0,0,0.6)', opacity: inClaim, transform: `translateY(${rise}px)` }}
        maxHeight={520} fitKey={claim}
      >{claim}</TplText>

      {/* the radar / spider chart */}
      <svg viewBox="0 0 1080 1920" width="1080" height="1920"
        style={{ position: 'absolute', inset: 0, opacity: inRings }}>
        {/* spokes */}
        {AXES.map((_, i) => {
          const p = ptAt(i, R);
          return (
            <line key={`spoke-${i}`} x1={CX} y1={CY} x2={p.x} y2={p.y}
              stroke={CHROME} strokeWidth={2} />
          );
        })}
        {/* concentric guide pentagons */}
        {RING_FRACS.map((frac, i) => (
          <polygon key={`ring-${i}`} points={ringPoints(frac)}
            fill="none" stroke={CHROME} strokeWidth={i === RING_FRACS.length - 1 ? 2.5 : 1.5} />
        ))}
        {/* the engine polygon — red fill, expands outward with `grow` */}
        <polygon points={dataPoints}
          fill="rgba(196,20,29,0.34)" stroke={RED} strokeWidth={5}
          strokeLinejoin="round"
          style={{ filter: `drop-shadow(0 0 ${glow}px ${RED})` }} />
        {/* vertex dots */}
        {AXES.map((a, i) => {
          const p = ptAt(i, R * a.v * grow);
          return (
            <circle key={`dot-${i}`} cx={p.x} cy={p.y} r={9}
              fill={RED} stroke="#ffffff" strokeWidth={2.5}
              style={{ filter: `drop-shadow(0 0 ${glow * 0.7}px ${RED})` }} />
          );
        })}
        {/* center hub */}
        <circle cx={CX} cy={CY} r={5} fill={CHROME} />
      </svg>

      {/* axis labels — mono, positioned just outside each vertex */}
      {AXES.map((a, i) => {
        const lp = ptAt(i, R + 56);
        // horizontal anchoring by which side the axis points
        const cos = Math.cos(angleAt(i));
        const align = Math.abs(cos) < 0.25 ? 'center' : cos > 0 ? 'left' : 'right';
        const tx = align === 'center' ? '-50%' : align === 'left' ? '0%' : '-100%';
        return (
          <div key={`label-${i}`}
            style={{ position: 'absolute', left: lp.x, top: lp.y - 14,
              transform: `translateX(${tx})`, opacity: inRings,
              color: '#ffffff', fontFamily: '"JetBrains Mono", ui-monospace, monospace',
              fontWeight: 700, fontSize: 27, letterSpacing: '0.14em', textTransform: 'uppercase',
              whiteSpace: 'nowrap', textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}>
            {a.label}
          </div>
        );
      })}

      {/* wordmark, bottom-left */}
      <TplText field="brand" data={data}
        base={{ position: 'absolute', bottom: 96, left: 96, right: 96 }}
        style={{ fontFamily: '"Geist", "Inter", sans-serif', fontWeight: 600, fontSize: 30, color: '#ffffff',
          letterSpacing: '0.2em', textTransform: 'uppercase', opacity: 0.9 }}
      >{brand}</TplText>
    </div>
  );
}

window.FreshEngineTransferNoblesvilleC6Reel = FreshEngineTransferNoblesvilleC6Reel;

const FRESH_ENGINE_TRANSFER_NOBLESVILLE_C6_SPEC = {
  id: 'fresh-engine-transfer-noblesville-C6',
  name: 'ENGINE-TRANSFER C6 — RADAR STATS',
  fields: [
    { "key": "duration", "label": "Length", "type": "slider", "default": 6, "min": 4, "max": 10, "step": 0.5, "unit": "s" },
    { "key": "eyebrow", "role": "eyebrow", "label": "Eyebrow", "type": "text", "default": "NOBLESVILLE SPORT PARENTS" },
    { "key": "claim", "role": "claim", "label": "Claim", "type": "text", "default": "WHEN THE ENGINE GROWS, IT SHOWS UP EVERYWHERE." },
    { "key": "brand", "role": "brand", "label": "Brand", "type": "text", "default": "ATHLETES ACCELERATION" }
  ],
};
window.FRESH_ENGINE_TRANSFER_NOBLESVILLE_C6_SPEC = FRESH_ENGINE_TRANSFER_NOBLESVILLE_C6_SPEC;
