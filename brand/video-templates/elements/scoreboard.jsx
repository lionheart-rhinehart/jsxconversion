// SCOREBOARD — LED dot-matrix style scoreboard counting up
// Two teams + period clock. Numbers tick up in believable cadence.

function Scoreboard({ home = 'HOME', away = 'AWAY', homeFinal = 34, awayFinal = 21, period = 'FINAL', clock = '00:00' }) {
  const t = window.useTime ? window.useTime() : 0;
  const RED = '#c4141d';

  // Animate scores climbing 0 → final over 1.8s
  const prog = Math.max(0, Math.min(1, t / 1.8));
  const eased = window.Easing ? window.Easing.easeOutCubic(prog) : prog;
  const h = Math.round(eased * homeFinal);
  const a = Math.round(eased * awayFinal);

  // Tick pulse when scores change
  const lastH = React.useRef(h);
  const lastA = React.useRef(a);
  const [hPulse, setHPulse] = React.useState(0);
  const [aPulse, setAPulse] = React.useState(0);
  React.useEffect(() => {
    if (h !== lastH.current) { setHPulse(1); lastH.current = h; setTimeout(() => setHPulse(0), 200); }
  }, [h]);
  React.useEffect(() => {
    if (a !== lastA.current) { setAPulse(1); lastA.current = a; setTimeout(() => setAPulse(0), 200); }
  }, [a]);

  const ScoreDisplay = ({ value, pulse }) => (
    <div style={{
      fontFamily: '"JetBrains Mono", monospace',
      fontSize: 'clamp(56px, 14vw, 140px)',
      fontWeight: 800,
      lineHeight: 0.9,
      color: pulse ? RED : '#ff8e3c',
      textShadow: pulse
        ? `0 0 24px ${RED}, 0 0 8px ${RED}`
        : '0 0 16px rgba(255,142,60,0.8), 0 0 4px rgba(255,142,60,1)',
      fontVariantNumeric: 'tabular-nums',
      transform: `scale(${1 + pulse * 0.08})`,
      transition: 'transform 100ms, color 100ms, text-shadow 100ms',
      letterSpacing: '-0.04em',
    }}>{String(value).padStart(2, '0')}</div>
  );

  return (
    <div style={{
      width: '100%', height: '100%',
      background: '#0a0b0d',
      padding: '4%',
      boxSizing: 'border-box',
      display: 'flex', flexDirection: 'column', justifyContent: 'center',
      fontFamily: '"JetBrains Mono", monospace', color: '#fff',
    }}>
      {/* Bezel container */}
      <div style={{
        background: '#15171a',
        border: '2px solid rgba(255,255,255,0.08)',
        padding: '6% 5%',
        position: 'relative',
        borderRadius: 4,
      }}>
        {/* Period strip */}
        <div style={{
          textAlign: 'center', marginBottom: '4%',
          fontSize: 'clamp(11px, 1.5vw, 14px)',
          color: '#ff8e3c',
          letterSpacing: '0.4em',
          textShadow: '0 0 8px rgba(255,142,60,0.6)',
        }}>{period} · {clock}</div>

        {/* Teams + scores */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          alignItems: 'center',
          gap: '4%',
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: 'clamp(11px, 1.6vw, 15px)',
              color: '#969ca7', letterSpacing: '0.3em', marginBottom: 6,
            }}>{home}</div>
            <ScoreDisplay value={h} pulse={hPulse}/>
          </div>

          <div style={{
            fontSize: 'clamp(28px, 6vw, 56px)',
            color: 'rgba(255,255,255,0.18)',
            fontWeight: 800,
          }}>·</div>

          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: 'clamp(11px, 1.6vw, 15px)',
              color: '#969ca7', letterSpacing: '0.3em', marginBottom: 6,
            }}>{away}</div>
            <ScoreDisplay value={a} pulse={aPulse}/>
          </div>
        </div>

        {/* W indicator */}
        <div style={{
          marginTop: '5%',
          textAlign: 'center',
          fontSize: 'clamp(13px, 1.8vw, 18px)',
          fontWeight: 700,
          letterSpacing: '0.2em',
          color: '#15a34a',
          opacity: prog > 0.95 ? 1 : 0,
          transition: 'opacity 200ms',
        }}>{h > a ? `${home} WINS` : a > h ? `${away} WINS` : '—'}</div>
      </div>
    </div>
  );
}

window.Scoreboard = Scoreboard;
window.SCOREBOARD_META = {
  id: 'scoreboard',
  name: 'SCOREBOARD',
  category: 'Sports Visual',
  description: 'LED dot-matrix style game scoreboard with animated score climb + period clock. Pulses red on each point.',
  props: ['home', 'away', 'homeFinal', 'awayFinal', 'period', 'clock'],
};
