// TRAJECTORY ARC — Ball flight path drawing across screen with landing dot
// SVG-drawn parabolic arc with distance + height callouts.

function TrajectoryArc({
  distance = 65,
  height = 22,
  unit = 'YDS',
  label = 'KICK TRAJECTORY',
  endLabel = 'GOAL',
}) {
  const t = window.useTime ? window.useTime() : 0;
  const RED = (window.__BRAND__ && window.__BRAND__.brand_red || '#c4141d');

  // Draw arc from t=0.3 to t=1.8
  const prog = Math.max(0, Math.min(1, (t - 0.3) / 1.5));
  const eased = window.Easing ? window.Easing.easeOutCubic(prog) : prog;

  // SVG canvas
  const W = 340, H = 200;
  const padL = 30, padR = 30, padT = 30, padB = 40;
  const x0 = padL;
  const x1 = W - padR;
  const ground = H - padB;
  const peakY = padT;

  // Parabolic path - quadratic bezier from (x0, ground) up to (mid, peakY) down to (x1, ground)
  const midX = (x0 + x1) / 2;
  const curveX = (s) => x0 + (x1 - x0) * s; // s in [0,1]
  const curveY = (s) => {
    // -4*peak*s*(s-1) parabola, scaled
    const heightAtS = -4 * (ground - peakY) * s * (s - 1);
    return ground - heightAtS;
  };

  // Build dashed full-path and animated overlay
  const fullPath = [];
  const livePath = [];
  const steps = 60;
  for (let i = 0; i <= steps; i++) {
    const s = i / steps;
    const x = curveX(s).toFixed(1);
    const y = curveY(s).toFixed(1);
    fullPath.push((i === 0 ? 'M ' : 'L ') + x + ' ' + y);
    if (s <= eased) livePath.push((i === 0 ? 'M ' : 'L ') + x + ' ' + y);
  }
  const curX = curveX(eased);
  const curY = curveY(eased);

  return (
    <div style={{
      width: '100%', height: '100%',
      padding: '5%', boxSizing: 'border-box',
      display: 'flex', flexDirection: 'column',
      fontFamily: '"JetBrains Mono", monospace', color: '#fff',
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
        marginBottom: '4%',
      }}>
        <div style={{ fontSize: 'clamp(11px, 1.5vw, 14px)', color: RED, letterSpacing: '0.16em' }}>// {label}</div>
        <div style={{
          fontFamily: '"Anton", sans-serif',
          fontSize: 'clamp(28px, 5vw, 56px)',
          color: '#fff', lineHeight: 0.85,
          fontVariantNumeric: 'tabular-nums',
        }}>{distance}<span style={{ fontSize: '0.5em', color: '#969ca7', marginLeft: 4 }}>{unit}</span></div>
      </div>

      <div style={{ flex: 1, position: 'relative' }}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: '100%', display: 'block' }}>
          {/* Ground line */}
          <line x1={padL} x2={W - padR} y1={ground} y2={ground}
            stroke="rgba(255,255,255,0.2)" strokeWidth="1.5"/>
          {/* Ghost full path */}
          <path d={fullPath.join(' ')} stroke="rgba(255,255,255,0.12)" strokeWidth="1.5"
            fill="none" strokeDasharray="3 3"/>
          {/* Live path */}
          <path d={livePath.join(' ')} stroke={RED} strokeWidth="3"
            fill="none" strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 6px ${RED})` }}/>
          {/* Origin marker */}
          <circle cx={x0} cy={ground} r="4" fill="#fff"/>
          {/* Goal marker */}
          <rect x={x1 - 3} y={ground - 26} width="6" height="26" fill="#fff" opacity="0.4"/>
          <text x={x1} y={ground + 15} textAnchor="middle"
            fontSize="9" fill="#969ca7" fontFamily='"JetBrains Mono", monospace'>{endLabel}</text>
          {/* Cursor / ball */}
          {eased > 0 && eased < 1 && (
            <circle cx={curX} cy={curY} r="7" fill="#fff" stroke={RED} strokeWidth="2"
              style={{ filter: `drop-shadow(0 0 8px ${RED})` }}/>
          )}
          {/* Landing pulse */}
          {eased >= 1 && (
            <g>
              <circle cx={x1} cy={ground} r="10" fill={RED} opacity="0.4"/>
              <circle cx={x1} cy={ground} r="5" fill={RED}/>
            </g>
          )}
        </svg>
        {/* Height callout */}
        <div style={{
          position: 'absolute',
          top: '6%', left: '46%',
          fontSize: 'clamp(10px, 1.2vw, 12px)',
          color: '#969ca7', letterSpacing: '0.1em',
          opacity: eased > 0.45 ? 1 : 0,
          transition: 'opacity 200ms',
        }}>PEAK {height}{unit}</div>
      </div>
    </div>
  );
}

window.TrajectoryArc = TrajectoryArc;
window.TRAJECTORY_ARC_META = {
  id: 'trajectory-arc',
  name: 'TRAJECTORY ARC',
  category: 'Sports Visual',
  description: 'Ball-flight parabolic arc drawing across the screen with peak/distance callouts. Use for kicks, throws, jumps, any ballistic moment.',
  props: ['distance', 'height', 'unit', 'label', 'endLabel'],
};
