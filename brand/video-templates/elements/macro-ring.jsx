// MACRO RING — single ring split into protein / carbs / fat arcs
// with calories counting up in the center.
// Props: protein, carbs, fat (grams), calories, animateMs, size

function MacroRing({ protein = 40, carbs = 55, fat = 18, calories = 560, animateMs = 1600, size = 360 }) {
  const t = window.useTime ? window.useTime() : 0;
  const Easing = window.Easing || { easeOutCubic: (x) => x };
  const RED = '#c4141d';
  const GREEN = '#15a34a';
  const AMBER = '#f59e0b';

  const prog = Math.max(0, Math.min(1, (t * 1000) / animateMs));
  const eased = Easing.easeOutCubic(prog);

  const total = Math.max(1, protein + carbs + fat);
  const segs = [
    { label: 'PROTEIN', val: protein, color: RED },
    { label: 'CARBS',   val: carbs,   color: AMBER },
    { label: 'FAT',     val: fat,     color: GREEN },
  ];

  // Geometry: full circle, viewBox 200x200, r 80, gap between segments
  const cx = 100, cy = 100, r = 80;
  const C = 2 * Math.PI * r;
  const gapDeg = 6; // visual gap between arcs in degrees
  let acc = -90; // start at top

  const arcs = segs.map((s) => {
    const frac = s.val / total;
    const sweep = frac * 360 - gapDeg;
    const a0 = acc + gapDeg / 2;
    acc += frac * 360;
    const len = (Math.max(0, sweep) / 360) * C;
    return { ...s, a0, len };
  });

  const calNow = Math.round(eased * calories);

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg viewBox="0 0 200 200" width={size} height={size} style={{ transform: 'rotate(0deg)' }}>
        {arcs.map((a, i) => (
          <circle key={i}
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke={a.color}
            strokeWidth="16"
            strokeLinecap="butt"
            strokeDasharray={`${a.len * eased} ${C}`}
            transform={`rotate(${a.a0} ${cx} ${cy})`}
            style={{ filter: `drop-shadow(0 0 5px ${a.color}88)` }}
          />
        ))}
      </svg>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        fontFamily: '"JetBrains Mono", monospace', color: '#fff',
      }}>
        <div style={{ fontSize: size * 0.2, fontWeight: 800, lineHeight: 0.9, fontVariantNumeric: 'tabular-nums' }}>{calNow}</div>
        <div style={{ fontSize: size * 0.05, color: '#969ca7', letterSpacing: '0.14em', marginTop: 4 }}>CALORIES</div>
      </div>
    </div>
  );
}

window.MacroRing = MacroRing;
window.MACRO_RING_META = {
  id: 'macro-ring',
  name: 'MACRO RING',
  category: 'Data Viz',
  description: 'Ring split into protein/carbs/fat arcs with calories counting up in the center. Add to: nutrition, fuel, recovery content.',
  props: ['protein', 'carbs', 'fat', 'calories', 'size'],
};
