// VELOCITY METER — half-circle gauge with sweeping needle
// Props: value, max, label, unit, target, animated, duration
// Animates from 0 to value over `duration` seconds when inside a Stage.

function VelocityMeter({ value = 0.85, max = 1.2, label = 'BAR SPEED', unit = 'm/s', target = 0.8, animateMs = 1800 }) {
  const t = window.useTime ? window.useTime() : 0;
  const RED = '#c4141d';
  const GREEN = '#15a34a';
  const AMBER = '#f59e0b';

  // Animate 0 → value
  const prog = Math.max(0, Math.min(1, (t * 1000) / animateMs));
  const eased = window.Easing ? window.Easing.easeOutCubic(prog) : prog;
  const v = eased * value;
  const pct = Math.max(0, Math.min(1, v / max));

  // Color zones based on % of max
  const color = pct < 0.5 ? RED : pct < 0.75 ? AMBER : GREEN;

  // Gauge geometry — half-circle from 180° to 360° (left to right)
  // SVG viewBox 200x140 with arc center at (100, 110)
  const cx = 100, cy = 110, r = 80;
  const angle = Math.PI + Math.PI * pct;
  const needleX = cx + r * 0.92 * Math.cos(angle);
  const needleY = cy + r * 0.92 * Math.sin(angle);

  // Target tick
  const tgtPct = Math.max(0, Math.min(1, target / max));
  const tgtAngle = Math.PI + Math.PI * tgtPct;
  const tgtX = cx + r * Math.cos(tgtAngle);
  const tgtY = cy + r * Math.sin(tgtAngle);

  return (
    <div style={{
      position: 'relative',
      width: '100%', height: '100%',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      fontFamily: '"JetBrains Mono", monospace',
      color: '#fff',
    }}>
      <svg viewBox="0 0 200 140" style={{ width: '100%', height: 'auto' }}>
        {/* Track */}
        <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          stroke="rgba(255,255,255,0.1)" strokeWidth="14" fill="none" strokeLinecap="round"/>
        {/* Filled portion */}
        <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${needleX} ${needleY}`}
          stroke={color} strokeWidth="14" fill="none" strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 8px ${color})` }}/>
        {/* Target line */}
        <line x1={cx + (r - 12) * Math.cos(tgtAngle)} y1={cy + (r - 12) * Math.sin(tgtAngle)}
          x2={tgtX} y2={tgtY}
          stroke="#fff" strokeWidth="2" strokeDasharray="2 2"/>
        {/* Needle */}
        <line x1={cx} y1={cy} x2={needleX} y2={needleY}
          stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
        <circle cx={cx} cy={cy} r="6" fill={color}/>
      </svg>

      <div style={{
        marginTop: '4%',
        fontSize: 'clamp(48px, 10vw, 96px)',
        fontWeight: 800,
        lineHeight: 0.9,
        fontVariantNumeric: 'tabular-nums',
        color: color,
      }}>{v.toFixed(2)}<span style={{ fontSize: '0.45em', color: '#969ca7', marginLeft: 4 }}>{unit}</span></div>

      <div style={{
        marginTop: 8,
        fontSize: 'clamp(11px, 1.5vw, 16px)',
        color: '#969ca7',
        letterSpacing: '0.14em',
      }}>{label} · TARGET {target.toFixed(2)}{unit}</div>
    </div>
  );
}

window.VelocityMeter = VelocityMeter;
window.VELOCITY_METER_META = {
  id: 'velocity-meter',
  name: 'VELOCITY METER',
  category: 'Data Viz',
  description: 'Half-circle gauge sweeping to a value. Color zones (red/amber/green) auto-shift by % of max. Add to: VBT, strength tests, any "PR" reveal.',
  props: ['value', 'max', 'label', 'unit', 'target'],
};
