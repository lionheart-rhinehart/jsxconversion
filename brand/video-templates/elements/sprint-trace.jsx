// SPRINT TRACE — line graph drawing across showing speed vs distance
// Curve mimics an actual acceleration profile. Peak speed callout pops at top.

function SprintTrace({ peakSpeed = 21.4, peakAt = 30, distance = 40, unit = 'MPH', label = 'SPRINT SPEED' }) {
  const t = window.useTime ? window.useTime() : 0;
  const RED = '#c4141d';

  // Animate draw over 2.4s
  const prog = Math.max(0, Math.min(1, t / 2.4));
  const eased = window.Easing ? window.Easing.easeOutCubic(prog) : prog;

  // Sprint curve: rapid accel from 0 → peak around peakAt, slight decline after
  const samples = 60;
  const W = 320, H = 180, padL = 32, padR = 16, padT = 32, padB = 28;
  const xRange = W - padL - padR;
  const yRange = H - padT - padB;

  const data = [];
  for (let i = 0; i <= samples; i++) {
    const dist = (i / samples) * distance;
    // Sigmoid-ish accel then mild fall
    const k = dist / peakAt;
    const accelPart = 1 - Math.exp(-2.2 * k);
    const taper = dist > peakAt ? Math.max(0.85, 1 - (dist - peakAt) / (distance * 1.8)) : 1;
    const speed = accelPart * peakSpeed * taper;
    data.push({ dist, speed });
  }

  // Build path
  const x = (d) => padL + (d / distance) * xRange;
  const y = (s) => padT + yRange - (s / (peakSpeed * 1.05)) * yRange;

  // Drawn-up-to length
  const cutoff = Math.floor(eased * data.length);
  let path = '';
  for (let i = 0; i < cutoff; i++) {
    path += (i === 0 ? 'M ' : 'L ') + x(data[i].dist).toFixed(1) + ' ' + y(data[i].speed).toFixed(1) + ' ';
  }

  // Current cursor
  const cur = data[Math.max(0, cutoff - 1)] || data[0];
  const curX = x(cur.dist), curY = y(cur.speed);

  // Y-axis ticks
  const yTicks = [0, Math.round(peakSpeed * 0.5), Math.round(peakSpeed)];

  return (
    <div style={{
      position: 'relative', width: '100%', height: '100%',
      fontFamily: '"JetBrains Mono", monospace', color: '#fff',
      padding: '4%', boxSizing: 'border-box',
    }}>
      {/* Label */}
      <div style={{
        fontSize: 'clamp(10px, 1.4vw, 14px)',
        color: RED, letterSpacing: '0.18em', marginBottom: 4,
      }}>// {label}</div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto' }}>
        {/* Grid */}
        {yTicks.map((tick, i) => (
          <g key={i}>
            <line x1={padL} x2={W - padR} y1={y(tick)} y2={y(tick)}
              stroke="rgba(255,255,255,0.08)" strokeWidth="1"/>
            <text x={padL - 4} y={y(tick) + 4} textAnchor="end"
              fontSize="10" fill="#969ca7" fontFamily='"JetBrains Mono", monospace'>{tick}</text>
          </g>
        ))}
        {/* X tick labels */}
        {[0, distance / 2, distance].map((d, i) => (
          <text key={i} x={x(d)} y={H - 8} textAnchor="middle"
            fontSize="10" fill="#969ca7" fontFamily='"JetBrains Mono", monospace'>{Math.round(d)}y</text>
        ))}
        {/* Area under curve */}
        {cutoff > 1 && (
          <path d={path + ` L ${curX} ${y(0)} L ${padL} ${y(0)} Z`}
            fill={RED} opacity="0.15"/>
        )}
        {/* Line */}
        <path d={path} stroke={RED} strokeWidth="3" fill="none" strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 6px ${RED})` }}/>
        {/* Cursor */}
        {cutoff > 0 && (
          <circle cx={curX} cy={curY} r="5" fill="#fff" stroke={RED} strokeWidth="2"/>
        )}
      </svg>

      {/* Peak callout */}
      <div style={{
        position: 'absolute', top: '12%', right: '6%',
        textAlign: 'right',
        opacity: eased > 0.85 ? 1 : 0,
        transition: 'opacity 200ms',
      }}>
        <div style={{ fontSize: 'clamp(10px, 1.2vw, 12px)', color: '#969ca7', letterSpacing: '0.1em' }}>PEAK</div>
        <div style={{
          fontSize: 'clamp(32px, 5vw, 56px)',
          fontWeight: 800, color: '#fff',
          fontVariantNumeric: 'tabular-nums', lineHeight: 0.9,
        }}>{(cur.speed).toFixed(1)}</div>
        <div style={{ fontSize: 'clamp(10px, 1.2vw, 12px)', color: RED, letterSpacing: '0.14em' }}>{unit}</div>
      </div>
    </div>
  );
}

window.SprintTrace = SprintTrace;
window.SPRINT_TRACE_META = {
  id: 'sprint-trace',
  name: 'SPRINT TRACE',
  category: 'Data Viz',
  description: 'Line graph drawing left-to-right showing acceleration curve over distance. Peak callout appears when curve completes.',
  props: ['peakSpeed', 'peakAt', 'distance', 'unit', 'label'],
};
