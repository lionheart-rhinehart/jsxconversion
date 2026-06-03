// ANATOMY CALLOUTS — Body diagram with leader lines pointing to muscles/joints
// Stylized human figure (SVG) with red callout dots that animate in sequence.
// Props: callouts (array of {x, y, label, side: 'left'|'right'}), figure ('full'|'lower'|'upper').

function AnatomyCallouts({
  callouts = [
    { x: 38, y: 30, label: 'CORE', side: 'left' },
    { x: 62, y: 58, label: 'GLUTES', side: 'right' },
    { x: 30, y: 68, label: 'HAMSTRING', side: 'left' },
    { x: 70, y: 82, label: 'CALF', side: 'right' },
  ],
  figure = 'full',
}) {
  const t = window.useTime ? window.useTime() : 0;
  const RED = (window.__BRAND__ && window.__BRAND__.brand_red || '#c4141d');

  // Sequential reveal — one callout every 0.5s starting at 0.4s
  const revealAt = (i) => 0.4 + i * 0.5;

  return (
    <div style={{
      width: '100%', height: '100%',
      padding: '4%',
      boxSizing: 'border-box',
      position: 'relative',
      fontFamily: '"JetBrains Mono", monospace', color: '#fff',
      display: 'flex', justifyContent: 'center', alignItems: 'center',
    }}>
      <svg viewBox="0 0 100 100" style={{ height: '100%', width: 'auto', maxWidth: '100%' }}>
        {/* Stylized figure (simplified) */}
        <g stroke="rgba(255,255,255,0.4)" strokeWidth="0.6" fill="none">
          {/* Head */}
          <circle cx="50" cy="10" r="5"/>
          {/* Torso */}
          <path d="M 45 15 L 40 30 L 38 50 L 42 60 L 50 60 L 58 60 L 62 50 L 60 30 L 55 15 Z"/>
          {/* Arms */}
          <path d="M 45 18 L 32 25 L 28 42 L 30 50"/>
          <path d="M 55 18 L 68 25 L 72 42 L 70 50"/>
          {/* Legs */}
          <path d="M 44 60 L 40 78 L 36 95"/>
          <path d="M 50 60 L 50 78 L 50 95"/>
          <path d="M 56 60 L 60 78 L 64 95"/>
        </g>
      </svg>

      {/* Callouts */}
      {callouts.map((c, i) => {
        const startT = revealAt(i);
        const prog = Math.max(0, Math.min(1, (t - startT) / 0.4));
        const eased = window.Easing ? window.Easing.easeOutCubic(prog) : prog;
        const onLeft = c.side === 'left';

        // Position dot
        const dotStyle = {
          position: 'absolute',
          left: `${c.x}%`,
          top: `${c.y}%`,
          width: 14, height: 14,
          borderRadius: '50%',
          background: RED,
          boxShadow: `0 0 16px ${RED}`,
          transform: `translate(-50%, -50%) scale(${eased})`,
        };
        // Leader line + label
        const lineLen = onLeft ? c.x : (100 - c.x);
        const labelStyle = {
          position: 'absolute',
          top: `${c.y}%`,
          [onLeft ? 'right' : 'left']: `${100 - c.x}%`,
          transform: `translateY(-50%) translateX(${onLeft ? -16 : 16}px)`,
          padding: '4px 10px',
          background: 'rgba(10,11,13,0.92)',
          border: `1px solid ${RED}`,
          color: '#fff',
          fontSize: 'clamp(11px, 1.5vw, 16px)',
          letterSpacing: '0.12em',
          fontWeight: 700,
          whiteSpace: 'nowrap',
          opacity: eased,
        };
        return (
          <React.Fragment key={i}>
            <div style={dotStyle}/>
            <div style={{
              position: 'absolute',
              top: `${c.y}%`,
              left: onLeft ? `${Math.min(c.x, 14)}%` : `${c.x}%`,
              width: onLeft ? `${c.x - 14}%` : `${85 - c.x}%`,
              height: 1,
              background: RED,
              opacity: eased * 0.7,
              transform: 'translateY(-50%)',
            }}/>
            <div style={labelStyle}>{c.label}</div>
          </React.Fragment>
        );
      })}
    </div>
  );
}

window.AnatomyCallouts = AnatomyCallouts;
window.ANATOMY_CALLOUTS_META = {
  id: 'anatomy-callouts',
  name: 'ANATOMY CALLOUTS',
  category: 'Data Viz',
  description: 'Stylized body diagram with red callout dots pointing to muscles/joints. Use for educational anatomy posts.',
  props: ['callouts', 'figure'],
};
