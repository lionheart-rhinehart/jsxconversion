// RADAR CHART — Spider/radar chart of 5–6 athletic attributes
function RadarChart({
  attrs = [
    { label: 'SPEED',     value: 88 },
    { label: 'STRENGTH',  value: 72 },
    { label: 'POWER',     value: 91 },
    { label: 'AGILITY',   value: 78 },
    { label: 'STAMINA',   value: 65 },
    { label: 'MOBILITY',  value: 80 },
  ],
  label = 'ATHLETE PROFILE',
  athleteName = 'JORDAN K.',
}) {
  const t = window.useTime ? window.useTime() : 0;
  const RED = '#c4141d';
  const prog = Math.max(0, Math.min(1, t / 1.8));
  const eased = window.Easing ? window.Easing.easeOutCubic(prog) : prog;

  const cx = 100, cy = 100, r = 78;
  const n = attrs.length;
  const angleFor = (i) => -Math.PI/2 + (i * 2 * Math.PI) / n;
  const point = (val, i) => {
    const a = angleFor(i);
    const rr = (val / 100) * r * eased;
    return [cx + rr * Math.cos(a), cy + rr * Math.sin(a)];
  };
  const polygon = attrs.map((a, i) => point(a.value, i).map((v) => v.toFixed(1)).join(',')).join(' ');

  return (
    <div style={{
      width: '100%', height: '100%', padding: '5%', boxSizing: 'border-box',
      display: 'flex', flexDirection: 'column',
      fontFamily: '"JetBrains Mono", monospace', color: '#fff',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '3%' }}>
        <div style={{ fontSize: 'clamp(11px, 1.5vw, 14px)', color: RED, letterSpacing: '0.16em' }}>// {label}</div>
        <div style={{ fontFamily: 'Anton, sans-serif', fontSize: 'clamp(16px, 2.6vw, 28px)', color: '#fff' }}>{athleteName}</div>
      </div>
      <div style={{ flex: 1, position: 'relative' }}>
        <svg viewBox="0 0 200 200" style={{ width: '100%', height: '100%' }}>
          {/* Concentric grid */}
          {[0.25, 0.5, 0.75, 1].map((s, i) => (
            <polygon key={i} points={attrs.map((_, j) => {
              const a = angleFor(j);
              return `${cx + r*s*Math.cos(a)},${cy + r*s*Math.sin(a)}`;
            }).join(' ')} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5"/>
          ))}
          {/* Axes */}
          {attrs.map((_, i) => {
            const a = angleFor(i);
            return <line key={i} x1={cx} y1={cy} x2={cx+r*Math.cos(a)} y2={cy+r*Math.sin(a)} stroke="rgba(255,255,255,0.12)" strokeWidth="0.6"/>;
          })}
          {/* Data polygon */}
          <polygon points={polygon} fill={RED} fillOpacity="0.25" stroke={RED} strokeWidth="2"
            style={{ filter: `drop-shadow(0 0 6px ${RED})` }}/>
          {/* Points */}
          {attrs.map((a, i) => {
            const [x, y] = point(a.value, i);
            return <circle key={i} cx={x} cy={y} r="2.5" fill="#fff" stroke={RED} strokeWidth="1.2"/>;
          })}
          {/* Labels */}
          {attrs.map((a, i) => {
            const ang = angleFor(i);
            const lx = cx + (r + 12) * Math.cos(ang);
            const ly = cy + (r + 12) * Math.sin(ang);
            return <text key={i} x={lx} y={ly} textAnchor="middle" dominantBaseline="middle"
              fontSize="7" fill="#fff" fontFamily='"JetBrains Mono", monospace' fontWeight="700">{a.label}</text>;
          })}
        </svg>
      </div>
    </div>
  );
}
window.RadarChart = RadarChart;
window.RADAR_CHART_META = { id:'radar-chart', name:'RADAR CHART', category:'Data Viz', description:'6-axis spider chart of athletic attributes. Use for athlete profiles, "what we measure", comparison breakdowns.', props:['attrs','label','athleteName'] };
