// FRESH-ENGINE-TRANSFER-NOBLESVILLE-D2 — AA "velocity-gauge" reframe (graphic, NO bg photo).
// Built from scratch on the Athletes Acceleration design system, guided by example
// ex-087-velocity-gauge (a single radial speedometer on INK). DELIBERATELY distinct from a
// single-gauge: this is a TWO-gauge COMPARISON. A small, dim grey "PAINT" gauge whose needle
// barely lifts off zero sits beside a big, bright red "ENGINE" gauge whose needle sweeps high —
// making the point that the engine, not the paint, is what actually moves the needle. Both
// needles are driven by useTime(); the reframe is the dominant Anton headline below. Mono labels,
// AA rails (one red accent, ink fields), vertical-native 1080x1920. All copy via data.*. NO bg photo.

function FreshEngineTransferNoblesvilleD2Reel({ data = {} }) {
  const eyebrow = data.eyebrow ?? 'NOBLESVILLE SPORT PARENTS';
  const reframe = data.reframe ?? 'MOST FAMILIES SPEND IT ALL ON PAINT, NEVER THE ENGINE.';
  const brand = data.brand ?? 'ATHLETES ACCELERATION';

  const RED = (window.__BRAND__ && window.__BRAND__.brand_red || '#c4141d');
  const INK = '#0a0b0d';
  const PANEL = '#15171a';
  const DIM = '#3a3d42';
  const GREY = '#6b7178';

  const t = useTime();
  const clamp = (x) => Math.max(0, Math.min(1, x));
  const ease = (x) => Easing.easeOutCubic(clamp(x));

  const inEyebrow = ease((t - 0.05) / 0.3);
  const inGauges  = ease((t - 0.35) / 0.5);
  const inHead    = ease((t - 0.9) / 0.7);
  // needle sweeps: paint barely lifts, engine sweeps high (slight settle handled by ease)
  const sweep     = ease((t - 0.55) / 1.5);

  // --- radial gauge geometry (180deg arc, opening downward) ---
  // Angle convention: 180deg (left) -> 0deg (right), needle travels along the top semicircle.
  const polar = (cx, cy, r, deg) => {
    const a = (deg * Math.PI) / 180;
    return [cx - r * Math.cos(a), cy - r * Math.sin(a)]; // 180=left, 90=top, 0=right
  };
  const arcPath = (cx, cy, r, fromDeg, toDeg) => {
    const [x0, y0] = polar(cx, cy, r, fromDeg);
    const [x1, y1] = polar(cx, cy, r, toDeg);
    const large = Math.abs(toDeg - fromDeg) > 180 ? 1 : 0;
    const sweepFlag = toDeg < fromDeg ? 1 : 0;
    return `M ${x0} ${y0} A ${r} ${r} 0 ${large} ${sweepFlag} ${x1} ${y1}`;
  };
  // value 0..1 -> angle on the 180..0 arc
  const valDeg = (v) => 180 - 180 * clamp(v);

  // Gauge renderer (returns an absolutely-positioned block)
  function Gauge({ left, top, size, value, color, trackColor, glow, label, readout, big }) {
    const r = size * 0.42;
    const cx = size / 2;
    const cy = size * 0.62;        // arc opens downward; pivot sits low
    const stroke = big ? 26 : 18;
    const deg = valDeg(value);
    const [nx, ny] = polar(cx, cy, r, deg);
    const pivotR = big ? 16 : 11;
    return (
      <div style={{ position: 'absolute', left, top, width: size, opacity: inGauges }}>
        <svg width={size} height={size * 0.78} viewBox={`0 0 ${size} ${size * 0.78}`}
          style={{ display: 'block', overflow: 'visible' }}>
          {/* track (full arc) */}
          <path d={arcPath(cx, cy, r, 180, 0)} fill="none" stroke={trackColor}
            strokeWidth={stroke} strokeLinecap="round" />
          {/* value arc */}
          <path d={arcPath(cx, cy, r, 180, valDeg(value))} fill="none" stroke={color}
            strokeWidth={stroke} strokeLinecap="round"
            style={glow ? { filter: `drop-shadow(0 0 14px ${color})` } : undefined} />
          {/* needle */}
          <line x1={cx} y1={cy} x2={nx} y2={ny} stroke="#ffffff"
            strokeWidth={big ? 7 : 5} strokeLinecap="round" />
          {/* pivot */}
          <circle cx={cx} cy={cy} r={pivotR} fill={color}
            style={glow ? { filter: `drop-shadow(0 0 10px ${color})` } : undefined} />
        </svg>
        <div style={{ textAlign: 'center', marginTop: big ? -6 : 4 }}>
          <div style={{ fontFamily: '"JetBrains Mono", ui-monospace, monospace', fontWeight: 700,
            fontSize: big ? 34 : 24, color: big ? color : GREY, letterSpacing: '0.18em',
            textTransform: 'uppercase' }}>{label}</div>
          <div style={{ fontFamily: '"JetBrains Mono", ui-monospace, monospace', fontWeight: 700,
            fontSize: big ? 26 : 18, color: big ? '#ffffff' : DIM, letterSpacing: '0.10em',
            textTransform: 'uppercase', marginTop: 8, opacity: 0.85 }}>{readout}</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: 'absolute', inset: 0, background: INK, overflow: 'hidden' }}>
      {/* mono eyebrow chip, top-left */}
      <div style={{ position: 'absolute', top: 132, left: 96, opacity: inEyebrow }}>
        <TplText field="eyebrow" data={data} base={{}}
          style={{ display: 'inline-block', color: '#ffffff', fontFamily: '"JetBrains Mono", ui-monospace, monospace',
            fontWeight: 700, fontSize: 30, letterSpacing: '0.22em', textTransform: 'uppercase' }}
        >{eyebrow}</TplText>
        <div style={{ width: 84, height: 6, background: RED, marginTop: 16 }} />
      </div>

      {/* the two-gauge comparison panel */}
      <div style={{ position: 'absolute', left: 64, right: 64, top: 320,
        background: PANEL, borderRadius: 22, padding: '54px 40px 44px', height: 740 }}>
        {/* PAINT — small, dim, barely moves */}
        <Gauge left={56} top={150} size={300}
          value={0.12 * sweep} color={GREY} trackColor={DIM} glow={false}
          label="PAINT" readout="SPORT DRILLS" big={false} />
        {/* ENGINE — big, bright red, sweeps high */}
        <Gauge left={372} top={70} size={500}
          value={0.86 * sweep} color={RED} trackColor={DIM} glow={true}
          label="ENGINE" readout="FORCE · SPEED · POWER" big={true} />
      </div>

      {/* dominant reframe headline, lower third */}
      <TplText field="reframe" data={data}
        base={{ position: 'absolute', left: 96, right: 84, bottom: 286 }}
        style={{ fontFamily: '"Anton", "Oswald", sans-serif', fontWeight: 400, fontSize: 116, color: '#ffffff',
          lineHeight: 0.9, letterSpacing: '0.004em', textTransform: 'uppercase',
          textShadow: '0 4px 22px rgba(0,0,0,0.55)', opacity: inHead,
          transform: `translateY(${(1 - inHead) * 46}px)` }}
        maxHeight={620} fitKey={reframe}
      >{reframe}</TplText>

      {/* wordmark, bottom-left */}
      <TplText field="brand" data={data}
        base={{ position: 'absolute', bottom: 96, left: 96, right: 96 }}
        style={{ fontFamily: '"Geist", "Inter", sans-serif', fontWeight: 600, fontSize: 30, color: '#ffffff',
          letterSpacing: '0.2em', textTransform: 'uppercase', opacity: 0.9 }}
      >{brand}</TplText>
    </div>
  );
}

window.FreshEngineTransferNoblesvilleD2Reel = FreshEngineTransferNoblesvilleD2Reel;

const FRESH_ENGINE_TRANSFER_NOBLESVILLE_D2_SPEC = {
  id: 'fresh-engine-transfer-noblesville-D2',
  name: 'ENGINE-TRANSFER D2 — VELOCITY GAUGE (PAINT vs ENGINE)',
  fields: [
    { "key": "duration", "label": "Length", "type": "slider", "default": 6, "min": 4, "max": 10, "step": 0.5, "unit": "s" },
    { "key": "eyebrow", "role": "eyebrow", "label": "Eyebrow", "type": "text", "default": "NOBLESVILLE SPORT PARENTS" },
    { "key": "reframe", "role": "reframe", "label": "Reframe", "type": "text", "default": "MOST FAMILIES SPEND IT ALL ON PAINT, NEVER THE ENGINE." },
    { "key": "brand", "role": "brand", "label": "Brand", "type": "text", "default": "ATHLETES ACCELERATION" }
  ],
};
window.FRESH_ENGINE_TRANSFER_NOBLESVILLE_D2_SPEC = FRESH_ENGINE_TRANSFER_NOBLESVILLE_D2_SPEC;
