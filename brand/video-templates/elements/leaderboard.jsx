// LEADERBOARD — Ranked names sliding up/down to settle into final order
// Cycles through a "shuffling" phase then locks into final standings.

function Leaderboard({
  entries = [
    { name: 'JORDAN K.', value: '4.42', meta: 'U17 · FB' },
    { name: 'MAYA R.',   value: '4.51', meta: 'U16 · TF' },
    { name: 'TYLER S.',  value: '4.58', meta: 'U17 · SOC' },
    { name: 'JENNA W.',  value: '4.65', meta: 'U15 · BB' },
    { name: 'CHRIS M.',  value: '4.71', meta: 'U16 · FB' },
  ],
  label = '40 YARD DASH · TOP 5',
  unit = 's',
  highlightTop = 1,
}) {
  const t = window.useTime ? window.useTime() : 0;
  const RED = (window.__BRAND__ && window.__BRAND__.brand_red || '#c4141d');
  const GOLD = '#facc15';

  // Shuffle until 1.6s, then lock.
  const locked = t > 1.6;
  const lockProg = window.Easing
    ? window.Easing.easeOutCubic(Math.max(0, Math.min(1, (t - 1.6) / 0.4)))
    : 1;

  // While shuffling, swap positions every 0.15s
  const order = React.useMemo(() => {
    if (locked) return entries.map((_, i) => i);
    const arr = entries.map((_, i) => i);
    const seed = Math.floor(t / 0.15);
    for (let i = arr.length - 1; i > 0; i--) {
      const j = (i * (seed + 1) * 7) % (i + 1);
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, [Math.floor(t / 0.15), locked, entries]);

  return (
    <div style={{
      width: '100%', height: '100%',
      padding: '5%', boxSizing: 'border-box',
      display: 'flex', flexDirection: 'column',
      fontFamily: '"JetBrains Mono", monospace', color: '#fff',
    }}>
      <div style={{
        fontSize: 'clamp(11px, 1.5vw, 14px)',
        color: RED, letterSpacing: '0.16em', marginBottom: '3%',
      }}>// {label}</div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'clamp(6px, 1vw, 10px)' }}>
        {entries.map((_, slot) => {
          const idx = order[slot];
          const e = entries[idx];
          const rank = slot + 1;
          const isTop = rank <= highlightTop && locked;
          return (
            <div key={idx} style={{
              display: 'flex', alignItems: 'center', gap: 'clamp(8px, 1.6vw, 16px)',
              padding: 'clamp(8px, 1.5vw, 14px) clamp(10px, 2vw, 18px)',
              background: isTop ? 'rgba(196,20,29,0.18)' : 'rgba(31,34,39,0.85)',
              border: isTop ? `2px solid ${RED}` : '1px solid rgba(255,255,255,0.1)',
              boxShadow: isTop ? `0 0 16px rgba(196,20,29,0.4)` : 'none',
              transition: 'background 200ms, border 200ms, box-shadow 200ms, transform 200ms',
              transform: locked && rank === 1 ? `scale(${1 + lockProg * 0.02})` : 'scale(1)',
            }}>
              <div style={{
                fontFamily: 'Anton, sans-serif',
                fontSize: 'clamp(20px, 3.2vw, 34px)',
                color: rank === 1 ? GOLD : isTop ? RED : '#969ca7',
                width: 'clamp(28px, 4.5vw, 48px)',
                flexShrink: 0,
                fontVariantNumeric: 'tabular-nums',
              }}>{String(rank).padStart(2, '0')}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontFamily: 'Anton, sans-serif',
                  fontSize: 'clamp(18px, 2.8vw, 30px)',
                  color: '#fff', lineHeight: 0.95,
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>{e.name}</div>
                <div style={{
                  fontSize: 'clamp(9px, 1.2vw, 12px)',
                  color: '#969ca7',
                  letterSpacing: '0.1em', marginTop: 2,
                }}>{e.meta}</div>
              </div>
              <div style={{
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: 'clamp(18px, 2.8vw, 30px)',
                fontWeight: 700,
                color: '#fff',
                fontVariantNumeric: 'tabular-nums',
              }}>{e.value}<span style={{ color: '#969ca7', fontWeight: 400, marginLeft: 2 }}>{unit}</span></div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

window.Leaderboard = Leaderboard;
window.LEADERBOARD_META = {
  id: 'leaderboard',
  name: 'LEADERBOARD',
  category: 'Sports Visual',
  description: 'Ranked athletes shuffling then locking into final standings. Top spot pulses gold. Use for "fastest of the week", PR rankings, etc.',
  props: ['entries', 'label', 'unit', 'highlightTop'],
};
