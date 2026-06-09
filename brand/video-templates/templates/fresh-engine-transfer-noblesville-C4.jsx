// FRESH-ENGINE-TRANSFER-NOBLESVILLE-C4 — AA "velocity-gauge" mechanism creative (beat C).
// Built from scratch on the Athletes Acceleration design system, guided by example
// ex-087-velocity-gauge: a radial speedometer / gauge on INK whose needle sweeps up — "the
// engine". A muted track arc, a red accent fill-arc that fills as the needle climbs, mono tick
// labels around the dial, and a glowing needle hinged on a center hub. The dial is the kinetic
// signature; the dominant element is the giant Anton CLAIM headline below it. Mono eyebrow chip
// top-left, AA wordmark bottom-left. NO background photo (data-viz stays photo-free). All copy
// via data.*; needle sweep driven by useTime(). Vertical-native 1080x1920.

function FreshEngineTransferNoblesvilleC4Reel({ data = {} }) {
  const eyebrow = data.eyebrow ?? 'NOBLESVILLE SPORT PARENTS';
  const claim = data.claim ?? 'THE ENGINE IS THE ATHLETIC PART.';
  const brand = data.brand ?? 'ATHLETES ACCELERATION';

  const RED = (window.__BRAND__ && window.__BRAND__.brand_red || '#c4141d');
  const RED_DEEP = (window.__BRAND__ && window.__BRAND__.brand_red_deep || '#a30f17');
  const INK = '#0a0b0d';
  const PANEL = '#15171a';
  const MUTED = '#969ca7';

  const t = useTime();
  const clamp = (x) => Math.max(0, Math.min(1, x));
  const ease = (x) => Easing.easeOutCubic(clamp(x));

  // Entrance timings
  const inKick = ease((t - 0.10) / 0.35);   // eyebrow
  const inDial = ease((t - 0.30) / 0.55);    // dial panel
  const inClaim = ease((t - 1.55) / 0.70);   // dominant claim, after the sweep reads
  const inRule = ease((t - 1.95) / 0.45);

  // Needle sweep — eased over ~1.0s starting at 0.45s. A small settle wobble at the end.
  const sweepRaw = ease((t - 0.45) / 1.05);
  const settle = Math.sin(clamp((t - 1.50) / 0.5) * Math.PI) * (1 - clamp((t - 1.50) / 0.5)) * 0.018;
  const sweep = clamp(sweepRaw + (sweepRaw > 0.99 ? settle : 0));

  // Gauge geometry — 180deg arc opening upward (semicircle). Left = 180deg, right = 360deg.
  // We draw in an SVG viewBox of 0..400 (x) by 0..230 (y); center hub at (200, 200).
  const cx = 200, cy = 200, r = 150;
  const a0 = Math.PI;        // start angle (left, pointing -x)
  const a1 = 0;              // end angle (right, pointing +x)
  const ang = a0 + (a1 - a0) * sweep;     // current needle angle (radians)
  const pt = (radius, a) => [cx + radius * Math.cos(a), cy - radius * Math.sin(a)];

  // Arc path helper (large-arc semicircle from angle aStart->aEnd along the top)
  const arcPath = (radius, aStart, aEnd) => {
    const [sx, sy] = pt(radius, aStart);
    const [ex, ey] = pt(radius, aEnd);
    const large = Math.abs(aEnd - aStart) > Math.PI ? 1 : 0;
    // sweep-flag 0 keeps us riding the upper semicircle (screen-y inverted)
    return `M ${sx} ${sy} A ${radius} ${radius} 0 ${large} 0 ${ex} ${ey}`;
  };

  const [nx, ny] = pt(r - 18, ang);        // needle tip
  const [bx, by] = pt(-22, ang);           // needle tail (behind hub)

  // Tick labels around the dial (0 .. MAX), mono — the "speed" scale
  const ticks = [0, 1, 2, 3, 4, 5];
  const tickEls = ticks.map((tk, i) => {
    const f = i / (ticks.length - 1);
    const a = a0 + (a1 - a0) * f;
    const [lx, ly] = pt(r + 28, a);
    return (
      <text key={tk} x={lx} y={ly}
        fill={MUTED} fontFamily='"JetBrains Mono", ui-monospace, monospace'
        fontSize={15} letterSpacing={1} textAnchor="middle" dominantBaseline="middle">{tk}</text>
    );
  });
  // minor tick strokes on the rim
  const rimTicks = [];
  for (let i = 0; i <= 20; i++) {
    const f = i / 20;
    const a = a0 + (a1 - a0) * f;
    const major = i % 4 === 0;
    const [ix, iy] = pt(r - 6, a);
    const [ox, oy] = pt(r - (major ? 22 : 14), a);
    rimTicks.push(
      <line key={`rt-${i}`} x1={ix} y1={iy} x2={ox} y2={oy}
        stroke={major ? '#ffffff' : '#3a3e44'} strokeWidth={major ? 2 : 1.5}
        opacity={major ? 0.55 : 0.4} />
    );
  }

  return (
    <div style={{ position: 'absolute', inset: 0, background: INK, overflow: 'hidden' }}>
      {/* left red accent column, wipes down */}
      <div style={{ position: 'absolute', left: 0, top: 0, width: 16, height: 1920,
        background: RED, transform: `scaleY(${ease((t - 0.20) / 0.45)})`, transformOrigin: 'top' }} />

      {/* mono eyebrow chip, top-left */}
      <div style={{ position: 'absolute', top: 132, left: 96, opacity: inKick }}>
        <TplText field="eyebrow" data={data} base={{}}
          style={{ display: 'inline-block', color: '#ffffff', fontFamily: '"JetBrains Mono", ui-monospace, monospace',
            fontWeight: 700, fontSize: 30, letterSpacing: '0.22em', textTransform: 'uppercase' }}
        >{eyebrow}</TplText>
        <div style={{ width: 84, height: 6, background: RED, marginTop: 16 }} />
      </div>

      {/* THE GAUGE — radial speedometer panel, the kinetic signature */}
      <div style={{ position: 'absolute', top: 360, left: 96, right: 96, height: 560,
        background: PANEL, border: '1px solid rgba(255,255,255,0.08)',
        opacity: inDial, transform: `translateY(${(1 - inDial) * 22}px)`,
        boxSizing: 'border-box', padding: '40px 48px 36px',
        display: 'flex', flexDirection: 'column' }}>

        {/* panel header — mono lift/engine label */}
        <div style={{ fontFamily: '"JetBrains Mono", ui-monospace, monospace', fontSize: 20,
          color: MUTED, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 8 }}>
          THE ENGINE · OUTPUT
        </div>

        {/* the dial */}
        <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg viewBox="0 0 400 240" width="100%" height="100%"
            style={{ maxHeight: 320, overflow: 'visible' }}>
            <defs>
              <linearGradient id="c4-arc" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={RED_DEEP} />
                <stop offset="100%" stopColor={RED} />
              </linearGradient>
              <filter id="c4-glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="4" result="b" />
                <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>

            {/* track arc (full, muted) */}
            <path d={arcPath(r, a0, a1)} fill="none" stroke="#2a2d33" strokeWidth={22} strokeLinecap="round" />
            {/* red fill arc — fills to the needle */}
            <path d={arcPath(r, a0, ang)} fill="none" stroke="url(#c4-arc)" strokeWidth={22}
              strokeLinecap="round" filter="url(#c4-glow)" />

            {/* rim ticks + scale labels */}
            {rimTicks}
            {tickEls}

            {/* needle */}
            <line x1={bx} y1={by} x2={nx} y2={ny}
              stroke="#ffffff" strokeWidth={5} strokeLinecap="round" filter="url(#c4-glow)" />
            {/* center hub */}
            <circle cx={cx} cy={cy} r={16} fill={RED} />
            <circle cx={cx} cy={cy} r={7} fill="#ffffff" />
          </svg>
        </div>

        {/* live readout under the dial */}
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 6, marginTop: 2 }}>
          <span style={{ fontFamily: '"Anton", "Oswald", sans-serif', fontSize: 80, color: RED, lineHeight: 1 }}>
            {(sweep * 5).toFixed(1)}
          </span>
          <span style={{ fontFamily: '"JetBrains Mono", ui-monospace, monospace', fontSize: 24, color: MUTED,
            letterSpacing: '0.1em' }}>m/s</span>
        </div>
      </div>

      {/* mechanism kicker — small mono label above the claim */}
      <div style={{ position: 'absolute', left: 96, right: 84, bottom: 470, opacity: inRule }}>
        <span style={{ display: 'inline-block', color: RED,
          fontFamily: '"JetBrains Mono", ui-monospace, monospace', fontWeight: 700,
          fontSize: 26, letterSpacing: '0.28em', textTransform: 'uppercase' }}>THE MECHANISM</span>
      </div>

      {/* dominant claim, lower third — the dominant element */}
      <TplText field="claim" data={data}
        base={{ position: 'absolute', left: 96, right: 84, bottom: 300 }}
        style={{ fontFamily: '"Anton", "Oswald", sans-serif', fontWeight: 400, fontSize: 118, color: '#ffffff',
          lineHeight: 0.88, letterSpacing: '0.004em', textTransform: 'uppercase',
          textShadow: '0 4px 22px rgba(0,0,0,0.65)', opacity: inClaim, transform: `translateY(${(1 - inClaim) * 52}px)` }}
        maxHeight={700} fitKey={claim}
      >{claim}</TplText>

      {/* short red underline rule beneath the claim, wipes in */}
      <div style={{ position: 'absolute', left: 96, bottom: 264, width: 168, height: 8,
        background: RED, transform: `scaleX(${inRule})`, transformOrigin: 'left' }} />

      {/* wordmark, bottom-left */}
      <TplText field="brand" data={data}
        base={{ position: 'absolute', bottom: 96, left: 96, right: 96 }}
        style={{ fontFamily: '"Geist", "Inter", sans-serif', fontWeight: 600, fontSize: 30, color: '#ffffff',
          letterSpacing: '0.2em', textTransform: 'uppercase', opacity: 0.9 }}
      >{brand}</TplText>
    </div>
  );
}

window.FreshEngineTransferNoblesvilleC4Reel = FreshEngineTransferNoblesvilleC4Reel;

const FRESH_ENGINE_TRANSFER_NOBLESVILLE_C4_SPEC = {
  id: 'fresh-engine-transfer-noblesville-C4',
  name: 'ENGINE-TRANSFER C4 — VELOCITY GAUGE (MECHANISM)',
  fields: [
    { "key": "duration", "label": "Length", "type": "slider", "default": 5, "min": 4, "max": 10, "step": 0.5, "unit": "s" },
    { "key": "eyebrow", "role": "eyebrow", "label": "Eyebrow", "type": "text", "default": "NOBLESVILLE SPORT PARENTS" },
    { "key": "claim", "role": "claim", "label": "Claim", "type": "text", "default": "THE ENGINE IS THE ATHLETIC PART." },
    { "key": "brand", "role": "brand", "label": "Brand", "type": "text", "default": "ATHLETES ACCELERATION" }
  ],
};
window.FRESH_ENGINE_TRANSFER_NOBLESVILLE_C4_SPEC = FRESH_ENGINE_TRANSFER_NOBLESVILLE_C4_SPEC;
