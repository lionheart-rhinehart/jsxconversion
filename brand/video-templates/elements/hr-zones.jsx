// HR ZONES — Heart-rate graph with colored zone bands
// Trace draws across showing BPM rising through Z1/Z2/Z3/Z4/Z5.

function HRZones({
  peakBpm = 178,
  restBpm = 62,
  maxBpm = 200,
  durationLabel = '12 MIN',
  label = 'HEART RATE',
}) {
  const t = window.useTime ? window.useTime() : 0;
  const RED = (window.__BRAND__ && window.__BRAND__.brand_red || '#c4141d');

  // Generate plausible BPM curve: rest → ramp → plateau with oscillation
  const samples = 60;
  const data = [];
  for (let i = 0; i <= samples; i++) {
    const s = i / samples;
    const base =
      s < 0.15 ? restBpm + (peakBpm * 0.4 - restBpm) * (s / 0.15) :
      s < 0.4  ? peakBpm * 0.4 + (peakBpm - peakBpm * 0.4) * ((s - 0.15) / 0.25) :
      s < 0.75 ? peakBpm + Math.sin(s * 22) * 6 :
      peakBpm + (restBpm * 1.3 - peakBpm) * ((s - 0.75) / 0.25);
    data.push(Math.max(restBpm, Math.min(maxBpm, base)));
  }

  const W = 360, H = 220, padL = 36, padR = 16, padT = 18, padB = 28;
  const xR = W - padL - padR;
  const yR = H - padT - padB;
  const xAt = (i) => padL + (i / samples) * xR;
  const yAt = (bpm) => padT + yR - (bpm / maxBpm) * yR;

  // Zone bands by BPM thresholds (% of max)
  const zones = [
    { from: 0.5, to: 0.6, color: '#6b7280', label: 'Z1' },
    { from: 0.6, to: 0.7, color: '#15a34a', label: 'Z2' },
    { from: 0.7, to: 0.8, color: '#f59e0b', label: 'Z3' },
    { from: 0.8, to: 0.9, color: '#ea580c', label: 'Z4' },
    { from: 0.9, to: 1.0, color: (window.__BRAND__ && window.__BRAND__.brand_red || '#c4141d'), label: 'Z5' },
  ];

  const prog = Math.max(0, Math.min(1, t / 2.4));
  const eased = window.Easing ? window.Easing.easeOutCubic(prog) : prog;
  const cutoff = Math.floor(eased * samples);
  let path = '';
  for (let i = 0; i <= cutoff; i++) {
    path += (i === 0 ? 'M ' : 'L ') + xAt(i).toFixed(1) + ' ' + yAt(data[i]).toFixed(1) + ' ';
  }
  const curX = xAt(cutoff), curY = yAt(data[cutoff] || restBpm);
  const curBpm = Math.round(data[cutoff] || restBpm);

  return (
    <div style={{
      width: '100%', height: '100%',
      padding: '5%', boxSizing: 'border-box',
      display: 'flex', flexDirection: 'column',
      fontFamily: '"JetBrains Mono", monospace', color: '#fff',
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
        marginBottom: '3%',
      }}>
        <div style={{ fontSize: 'clamp(11px, 1.5vw, 14px)', color: RED, letterSpacing: '0.16em' }}>// {label}</div>
        <div style={{ fontSize: 'clamp(10px, 1.3vw, 13px)', color: '#969ca7', letterSpacing: '0.1em' }}>{durationLabel}</div>
      </div>

      <div style={{ flex: 1, position: 'relative' }}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: '100%', display: 'block' }}>
          {/* Zone bands */}
          {zones.map((z, i) => (
            <g key={i}>
              <rect x={padL} y={yAt(maxBpm * z.to)} width={xR}
                height={yAt(maxBpm * z.from) - yAt(maxBpm * z.to)}
                fill={z.color} opacity="0.08"/>
              <text x={W - padR - 4} y={yAt(maxBpm * (z.to + z.from) / 2) + 3}
                textAnchor="end" fontSize="9" fill={z.color}
                fontFamily='"JetBrains Mono", monospace' fontWeight="700">{z.label}</text>
            </g>
          ))}
          {/* Y axis */}
          <text x={padL - 4} y={yAt(restBpm) + 3} textAnchor="end"
            fontSize="9" fill="#969ca7" fontFamily='"JetBrains Mono", monospace'>{restBpm}</text>
          <text x={padL - 4} y={yAt(peakBpm) + 3} textAnchor="end"
            fontSize="9" fill="#fff" fontFamily='"JetBrains Mono", monospace'>{peakBpm}</text>
          {/* Trace */}
          <path d={path} stroke={RED} strokeWidth="2.5" fill="none" strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 6px ${RED})` }}/>
          {/* Cursor */}
          {cutoff > 0 && cutoff < samples && (
            <circle cx={curX} cy={curY} r="4" fill="#fff" stroke={RED} strokeWidth="2"/>
          )}
        </svg>
        {/* Live BPM readout */}
        <div style={{
          position: 'absolute', top: 8, left: '40%',
          fontSize: 'clamp(28px, 5vw, 56px)',
          fontWeight: 800, color: '#fff', lineHeight: 0.85,
          fontVariantNumeric: 'tabular-nums',
        }}>{curBpm}<span style={{ fontSize: '0.4em', color: '#969ca7', marginLeft: 4 }}>BPM</span></div>
      </div>
    </div>
  );
}

window.HRZones = HRZones;
window.HR_ZONES_META = {
  id: 'hr-zones',
  name: 'HR ZONES',
  category: 'Data Viz',
  description: 'Heart-rate trace drawing across with colored zone bands (Z1-Z5). Live BPM readout. Use for conditioning posts.',
  props: ['peakBpm', 'restBpm', 'maxBpm', 'durationLabel', 'label'],
};
