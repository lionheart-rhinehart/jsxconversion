// CALENDAR FILL — 30 boxes filling green sequentially with streak counter
// Use for "30-day challenge", program completion, consistency posts.

function CalendarFill({ total = 30, label = 'DAY', streakLabel = '🔥 STREAK', missDays = [] }) {
  const t = window.useTime ? window.useTime() : 0;
  const RED = '#c4141d';
  const GREEN = '#15a34a';

  // Fill across 3.5 seconds
  const prog = Math.max(0, Math.min(1, t / 3.5));
  const filledCount = Math.floor(prog * total);

  const cols = total >= 28 ? 7 : 5;
  const rows = Math.ceil(total / cols);

  // Count actual streak (skipping missDays)
  const missSet = new Set(missDays);
  let streak = 0;
  for (let i = 1; i <= filledCount; i++) {
    if (!missSet.has(i)) streak++;
    else streak = 0;
  }

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
        <div>
          <div style={{ fontSize: 'clamp(11px, 1.5vw, 14px)', color: '#969ca7', letterSpacing: '0.14em' }}>{label}</div>
          <div style={{
            fontFamily: '"Anton", sans-serif',
            fontSize: 'clamp(40px, 8vw, 84px)',
            color: '#fff', lineHeight: 0.85,
            fontVariantNumeric: 'tabular-nums',
          }}>{filledCount}<span style={{ color: '#434954' }}> / {total}</span></div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 'clamp(11px, 1.5vw, 14px)', color: '#969ca7', letterSpacing: '0.14em' }}>{streakLabel}</div>
          <div style={{
            fontFamily: '"Anton", sans-serif',
            fontSize: 'clamp(40px, 8vw, 84px)',
            color: GREEN, lineHeight: 0.85,
            fontVariantNumeric: 'tabular-nums',
            textShadow: streak > 0 ? '0 0 16px rgba(21,163,74,0.6)' : 'none',
          }}>{streak}</div>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gap: 'clamp(4px, 0.8vw, 8px)',
        flex: 1,
      }}>
        {Array.from({ length: total }).map((_, i) => {
          const day = i + 1;
          const filled = day <= filledCount;
          const isMiss = missSet.has(day);
          const isLast = day === filledCount;
          const bg = !filled
            ? 'rgba(255,255,255,0.04)'
            : isMiss ? RED : GREEN;
          return (
            <div key={day} style={{
              position: 'relative',
              background: bg,
              border: `1px solid ${filled ? 'transparent' : 'rgba(255,255,255,0.1)'}`,
              borderRadius: 2,
              transition: 'background 80ms, transform 80ms',
              transform: isLast ? 'scale(1.08)' : 'scale(1)',
              boxShadow: isLast ? `0 0 12px ${isMiss ? RED : GREEN}` : 'none',
              minHeight: '2vh',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{
                fontSize: 'clamp(8px, 1vw, 11px)',
                color: filled ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.3)',
                fontWeight: 600,
              }}>{day}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

window.CalendarFill = CalendarFill;
window.CALENDAR_FILL_META = {
  id: 'calendar-fill',
  name: 'CALENDAR FILL',
  category: 'Counter',
  description: '30 (or N) boxes filling green sequentially. Tracks streak. Missed days show red. Great for consistency / challenge posts.',
  props: ['total', 'label', 'streakLabel', 'missDays'],
};
