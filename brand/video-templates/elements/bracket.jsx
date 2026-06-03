// BRACKET — 8-team single-elimination bracket with winners advancing
function Bracket({
  r1 = [['SPEED','POWER'],['STRENGTH','MOBILITY'],['NUTRITION','SLEEP'],['MINDSET','RECOVERY']],
  r1Winners = [0,0,1,0],
  r2Winners = [0,0],
  champion = 'SPEED',
  label = 'WHAT MATTERS MOST?',
}) {
  const t = window.useTime ? window.useTime() : 0;
  const RED = (window.__BRAND__ && window.__BRAND__.brand_red || '#c4141d');
  // Reveal: r1 at 0.3, r2 at 1.8, champion at 3.2
  const r1T = (i) => Math.max(0, Math.min(1, (t - (0.3 + i * 0.1)) / 0.3));
  const r2T = (i) => Math.max(0, Math.min(1, (t - (1.8 + i * 0.2)) / 0.4));
  const champT = window.Easing ? window.Easing.easeOutBack(Math.max(0, Math.min(1, (t - 3.2) / 0.6))) : 1;

  const Slot = ({ name, won, op }) => (
    <div style={{
      padding: 'clamp(6px, 1vw, 10px) clamp(8px, 1.2vw, 14px)',
      background: won ? RED : 'rgba(31,34,39,0.85)',
      border: `1px solid ${won ? RED : 'rgba(255,255,255,0.1)'}`,
      fontFamily: 'Anton, sans-serif',
      fontSize: 'clamp(11px, 1.5vw, 16px)',
      color: '#fff', lineHeight: 0.95, letterSpacing: '0.02em',
      opacity: op,
      marginBottom: 3,
    }}>{name}</div>
  );

  return (
    <div style={{
      width: '100%', height: '100%', padding: '4%',
      boxSizing: 'border-box',
      fontFamily: '"JetBrains Mono", monospace', color: '#fff',
      display: 'flex', flexDirection: 'column',
    }}>
      <div style={{ fontSize: 'clamp(11px, 1.5vw, 14px)', color: RED, letterSpacing: '0.16em', marginBottom: '3%' }}>// {label}</div>
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr 1.4fr', gap: 'clamp(8px, 1.5vw, 18px)', alignItems: 'center' }}>
        {/* Round 1 — 4 matchups */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(8px, 1.5vw, 14px)' }}>
          {r1.map((m, i) => (
            <div key={i}>
              <Slot name={m[0]} won={r1Winners[i] === 0 && t > 1.0} op={r1T(i*2)}/>
              <Slot name={m[1]} won={r1Winners[i] === 1 && t > 1.0} op={r1T(i*2+1)}/>
            </div>
          ))}
        </div>
        {/* Round 2 — 2 matchups */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-around', height: '100%' }}>
          {[[r1[0][r1Winners[0]], r1[1][r1Winners[1]]], [r1[2][r1Winners[2]], r1[3][r1Winners[3]]]].map((m, i) => (
            <div key={i}>
              <Slot name={m[0]} won={r2Winners[i] === 0 && t > 2.6} op={r2T(i*2)}/>
              <Slot name={m[1]} won={r2Winners[i] === 1 && t > 2.6} op={r2T(i*2+1)}/>
            </div>
          ))}
        </div>
        {/* Champion */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ fontSize: 'clamp(10px, 1.2vw, 12px)', color: '#969ca7', letterSpacing: '0.16em', marginBottom: 8, opacity: champT }}>CHAMPION</div>
          <div style={{
            padding: 'clamp(10px, 2vw, 18px) clamp(12px, 2.4vw, 22px)',
            background: '#fff', border: `3px solid ${RED}`,
            boxShadow: `0 0 24px ${RED}`,
            opacity: champT,
            transform: `scale(${0.8 + 0.2 * champT})`,
          }}>
            <div style={{
              fontFamily: 'Anton, sans-serif',
              fontSize: 'clamp(28px, 5vw, 56px)',
              color: RED, lineHeight: 0.9,
            }}>{champion}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
window.Bracket = Bracket;
window.BRACKET_META = { id:'bracket', name:'BRACKET', category:'Engagement', description:'8-team single-elim bracket. Slots fill, winners advance, champion crowned in white-on-red.', props:['r1','r1Winners','r2Winners','champion','label'] };
