// SLOT ROLL — 3 reels of options spin then lock in
// Each reel spins for a slightly different duration then snaps to its
// final value. Use for "pick your workout", random matchups, etc.

function SlotRoll({
  reel1 = ['LEGS', 'PUSH', 'PULL', 'CORE', 'SPEED'],
  reel2 = ['HEAVY', 'EXPLOSIVE', 'BUILD', 'BURN', 'BLAST'],
  reel3 = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'],
  pick1 = 'LEGS',
  pick2 = 'EXPLOSIVE',
  pick3 = 'TUESDAY',
  label = 'TODAY YOU TRAIN',
}) {
  const t = window.useTime ? window.useTime() : 0;
  const RED = (window.__BRAND__ && window.__BRAND__.brand_red || '#c4141d');

  // Reels stop at 1.4, 1.9, 2.4
  const stops = [1.4, 1.9, 2.4];
  const targets = [pick1, pick2, pick3];
  const reels = [reel1, reel2, reel3];

  const Reel = ({ items, target, stopAt, idx }) => {
    const spinning = t < stopAt;
    let display;
    if (spinning) {
      // Cycle through items at 12hz
      const cycle = Math.floor(t * 12 + idx * 3) % items.length;
      display = items[cycle];
    } else {
      display = target;
    }
    const justStopped = !spinning && t < stopAt + 0.3;
    return (
      <div style={{
        flex: 1,
        height: '100%',
        background: '#15171a',
        border: `2px solid ${spinning ? 'rgba(255,255,255,0.15)' : RED}`,
        boxShadow: justStopped ? `0 0 24px ${RED}` : (spinning ? 'inset 0 0 16px rgba(0,0,0,0.6)' : 'none'),
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden',
        position: 'relative',
        transition: 'box-shadow 120ms, border-color 120ms',
      }}>
        {/* Top/bottom fade for spinning */}
        {spinning && (
          <>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '30%',
              background: 'linear-gradient(180deg, #15171a 0%, transparent 100%)', zIndex: 2 }}/>
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '30%',
              background: 'linear-gradient(0deg, #15171a 0%, transparent 100%)', zIndex: 2 }}/>
          </>
        )}
        <div style={{
          fontFamily: '"Anton", sans-serif',
          fontSize: 'clamp(28px, 6vw, 72px)',
          color: spinning ? '#969ca7' : '#fff',
          letterSpacing: '0.02em',
          textAlign: 'center',
          padding: '0 8%',
          lineHeight: 0.9,
          transform: justStopped ? 'scale(1.06)' : 'scale(1)',
          transition: 'transform 120ms, color 120ms',
        }}>{display}</div>
      </div>
    );
  };

  const allDone = t > stops[2] + 0.5;

  return (
    <div style={{
      width: '100%', height: '100%',
      padding: '5%', boxSizing: 'border-box',
      display: 'flex', flexDirection: 'column',
      fontFamily: '"JetBrains Mono", monospace', color: '#fff',
    }}>
      <div style={{
        fontSize: 'clamp(11px, 1.5vw, 14px)',
        color: RED, letterSpacing: '0.18em',
        textAlign: 'center', marginBottom: '4%',
      }}>// {label}</div>

      <div style={{
        flex: 1,
        display: 'flex', gap: 'clamp(6px, 1vw, 14px)',
      }}>
        {reels.map((r, i) => <Reel key={i} items={r} target={targets[i]} stopAt={stops[i]} idx={i}/>)}
      </div>

      <div style={{
        marginTop: '4%',
        textAlign: 'center',
        fontSize: 'clamp(11px, 1.4vw, 14px)',
        color: allDone ? '#15a34a' : 'rgba(255,255,255,0.3)',
        letterSpacing: '0.2em',
        fontWeight: 700,
        opacity: allDone ? 1 : 0.6,
        transition: 'opacity 200ms, color 200ms',
      }}>{allDone ? '✓ LOCKED IN' : 'ROLLING...'}</div>
    </div>
  );
}

window.SlotRoll = SlotRoll;
window.SLOT_ROLL_META = {
  id: 'slot-roll',
  name: 'SLOT ROLL',
  category: 'Counter',
  description: '3 slot-machine reels spinning then locking in. Use for "pick your workout", matchup reveals, random surprise content.',
  props: ['reel1', 'reel2', 'reel3', 'pick1', 'pick2', 'pick3', 'label'],
};
