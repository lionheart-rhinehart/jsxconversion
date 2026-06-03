// COMPARISON SLIDER — Vertical divider between two values with bar comparison
function ComparisonSlider({
  leftLabel = 'NO TRAINING',
  rightLabel = 'WITH AA',
  leftValue = 5.62,
  rightValue = 4.91,
  unit = 's',
  metric = '40 YD DASH · AVG SENIOR',
  lowerIsBetter = true,
}) {
  const t = window.useTime ? window.useTime() : 0;
  const RED = (window.__BRAND__ && window.__BRAND__.brand_red || '#c4141d');
  const GREEN = '#15a34a';
  const prog = Math.max(0, Math.min(1, t / 2));
  const eased = window.Easing ? window.Easing.easeOutCubic(prog) : prog;
  const lv = leftValue;
  const rv = rightValue;
  const liveR = (lv + (rv - lv) * eased);
  const maxV = Math.max(lv, rv) * 1.15;
  const leftPct = (lv / maxV) * 100;
  const rightPct = (liveR / maxV) * 100;
  const delta = (rv - lv) * eased;
  const better = lowerIsBetter ? (delta < 0) : (delta > 0);

  return (
    <div style={{
      width: '100%', height: '100%', padding: '5%', boxSizing: 'border-box',
      display: 'flex', flexDirection: 'column', justifyContent: 'center',
      fontFamily: '"JetBrains Mono", monospace', color: '#fff', gap: '4%',
    }}>
      <div style={{ fontSize: 'clamp(11px, 1.5vw, 14px)', color: RED, letterSpacing: '0.16em' }}>// {metric}</div>
      {[
        { label: leftLabel, val: lv, color: '#969ca7', pct: leftPct, dim: true },
        { label: rightLabel, val: liveR, color: better ? GREEN : RED, pct: rightPct, dim: false },
      ].map((row, i) => (
        <div key={i}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
            <div style={{ fontFamily: 'Anton, sans-serif', fontSize: 'clamp(20px, 3.4vw, 36px)', color: row.dim ? '#969ca7' : '#fff' }}>{row.label}</div>
            <div style={{
              fontFamily: '"JetBrains Mono", monospace', fontSize: 'clamp(28px, 5vw, 56px)',
              fontWeight: 800, color: row.color, fontVariantNumeric: 'tabular-nums',
            }}>{row.val.toFixed(2)}<span style={{ fontSize: '0.45em', color: '#969ca7', marginLeft: 2 }}>{unit}</span></div>
          </div>
          <div style={{ height: 'clamp(10px, 1.8vw, 18px)', background: 'rgba(255,255,255,0.06)', position: 'relative' }}>
            <div style={{ height: '100%', width: `${row.pct}%`, background: row.color, boxShadow: row.dim ? 'none' : `0 0 12px ${row.color}` }}/>
          </div>
        </div>
      ))}
      <div style={{
        marginTop: '2%', padding: '12px 16px',
        background: better ? 'rgba(21,163,74,0.15)' : 'rgba(196,20,29,0.15)',
        border: `2px solid ${better ? GREEN : RED}`,
        textAlign: 'center',
        fontFamily: 'Anton, sans-serif',
        fontSize: 'clamp(22px, 4vw, 44px)', color: '#fff', letterSpacing: '0.02em',
        opacity: prog > 0.95 ? 1 : 0, transition: 'opacity 200ms',
      }}>{better ? '↓' : '↑'} {Math.abs(delta).toFixed(2)}{unit} {better ? 'FASTER' : 'SLOWER'}</div>
    </div>
  );
}
window.ComparisonSlider = ComparisonSlider;
window.COMPARISON_SLIDER_META = { id:'comparison-slider', name:'COMPARISON SLIDER', category:'Data Viz', description:'Two values compared with growing bars + delta callout. Use for before/after, with/without, us-vs-them.', props:['leftLabel','rightLabel','leftValue','rightValue','unit','metric','lowerIsBetter'] };
