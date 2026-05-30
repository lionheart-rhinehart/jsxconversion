// LIVE POLL — horizontal bars filling with vote percentages
// Use for engagement posts, opinion polls, "what should we work on" content.

function LivePoll({
  options = [
    { label: 'SPEED', pct: 42 },
    { label: 'STRENGTH', pct: 31 },
    { label: 'POWER', pct: 27 },
  ],
  totalVotes = 1247,
  label = 'WHAT DO YOU TRAIN MOST?',
  winnerColor = '#c4141d',
}) {
  const t = window.useTime ? window.useTime() : 0;
  const RED = '#c4141d';

  // Bars fill over 2.0s
  const prog = Math.max(0, Math.min(1, t / 2.0));
  const eased = window.Easing ? window.Easing.easeOutCubic(prog) : prog;

  // Total votes climbs simultaneously
  const votesEased = window.Easing ? window.Easing.easeOutCubic(prog) : prog;
  const liveVotes = Math.round(votesEased * totalVotes);

  // Winner = highest %
  const winnerIdx = options.reduce((mi, o, i, arr) => o.pct > arr[mi].pct ? i : mi, 0);

  return (
    <div style={{
      width: '100%', height: '100%',
      padding: '5%', boxSizing: 'border-box',
      display: 'flex', flexDirection: 'column', justifyContent: 'center',
      fontFamily: '"JetBrains Mono", monospace', color: '#fff',
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
        marginBottom: '4%',
      }}>
        <div style={{
          fontSize: 'clamp(11px, 1.5vw, 14px)',
          color: RED, letterSpacing: '0.16em',
        }}>// LIVE POLL</div>
        <div style={{
          fontSize: 'clamp(11px, 1.4vw, 13px)',
          color: '#969ca7', letterSpacing: '0.1em',
          fontVariantNumeric: 'tabular-nums',
        }}>{liveVotes.toLocaleString()} VOTES</div>
      </div>

      <div style={{
        fontFamily: '"Anton", sans-serif',
        fontSize: 'clamp(22px, 3.5vw, 38px)',
        color: '#fff', lineHeight: 0.95,
        marginBottom: '5%',
      }}>{label}</div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(8px, 1.6vw, 16px)' }}>
        {options.map((o, i) => {
          const isWinner = i === winnerIdx;
          const livePct = Math.round(o.pct * eased);
          return (
            <div key={i}>
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
                marginBottom: 4,
              }}>
                <div style={{
                  fontFamily: '"Anton", sans-serif',
                  fontSize: 'clamp(16px, 2.4vw, 26px)',
                  color: '#fff',
                }}>{o.label}{isWinner && eased > 0.95 && <span style={{ color: winnerColor, marginLeft: 8 }}>✓</span>}</div>
                <div style={{
                  fontSize: 'clamp(14px, 2vw, 22px)',
                  fontWeight: 700,
                  color: isWinner ? winnerColor : '#fff',
                  fontVariantNumeric: 'tabular-nums',
                }}>{livePct}%</div>
              </div>
              <div style={{
                height: 'clamp(8px, 1.4vw, 14px)',
                background: 'rgba(255,255,255,0.06)',
                overflow: 'hidden',
                position: 'relative',
              }}>
                <div style={{
                  height: '100%',
                  width: `${livePct}%`,
                  background: isWinner ? winnerColor : 'rgba(255,255,255,0.55)',
                  boxShadow: isWinner ? `0 0 12px ${winnerColor}` : 'none',
                  transition: 'background 200ms',
                }}/>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

window.LivePoll = LivePoll;
window.LIVE_POLL_META = {
  id: 'live-poll',
  name: 'LIVE POLL',
  category: 'Engagement',
  description: 'Horizontal bars filling with percentages, live vote counter, winner highlighted in red. Use for engagement posts.',
  props: ['options', 'totalVotes', 'label', 'winnerColor'],
};
