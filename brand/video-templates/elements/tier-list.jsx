// TIER LIST — S / A / B / C tier rows with items slotting in
// Items animate from off-screen into their assigned tier. Use for rankings,
// "best drills", "strongest athletes by sport", any opinionated list.

function TierList({
  tiers = [
    { tier: 'S', label: 'GOD TIER',     items: ['DEADLIFT', 'SPRINT'], color: (window.__BRAND__ && window.__BRAND__.brand_red || '#c4141d') },
    { tier: 'A', label: 'GREAT',         items: ['SQUAT', 'BOX JUMP', 'CLEAN'],     color: '#f59e0b' },
    { tier: 'B', label: 'GOOD',          items: ['BENCH', 'ROW'],                    color: '#15a34a' },
    { tier: 'C', label: 'SITUATIONAL',   items: ['CURLS', 'CALF RAISE'],            color: '#6b727f' },
  ],
}) {
  const t = window.useTime ? window.useTime() : 0;

  // Each item appears 0.18s after the previous one, sequentially across tiers
  let itemCounter = 0;
  return (
    <div style={{
      width: '100%', height: '100%',
      padding: '5%', boxSizing: 'border-box',
      display: 'flex', flexDirection: 'column',
      gap: 'clamp(6px, 1.2vw, 12px)',
      fontFamily: '"JetBrains Mono", monospace', color: '#fff',
    }}>
      {tiers.map((row, ri) => {
        // Tier label box appears immediately, slides in from left
        const labelProg = window.Easing
          ? window.Easing.easeOutBack(Math.max(0, Math.min(1, (t - 0.2 - ri * 0.2) / 0.4)))
          : 1;
        return (
          <div key={ri} style={{
            display: 'flex',
            gap: 'clamp(6px, 1vw, 10px)',
            flex: 1,
            alignItems: 'stretch',
          }}>
            <div style={{
              width: 'clamp(60px, 12vw, 110px)',
              background: row.color,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
              opacity: labelProg,
              transform: `translateX(${(1 - labelProg) * -20}px)`,
              boxShadow: `0 4px 12px ${row.color}44`,
            }}>
              <div style={{
                fontFamily: 'Anton, sans-serif',
                fontSize: 'clamp(28px, 6vw, 64px)',
                color: '#fff', lineHeight: 0.85,
              }}>{row.tier}</div>
              <div style={{
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: 'clamp(8px, 1vw, 11px)',
                color: 'rgba(255,255,255,0.8)',
                letterSpacing: '0.12em',
                marginTop: 4,
                textAlign: 'center',
                padding: '0 4px',
              }}>{row.label}</div>
            </div>

            <div style={{
              flex: 1,
              background: 'rgba(31,34,39,0.85)',
              border: '1px solid rgba(255,255,255,0.08)',
              display: 'flex', flexWrap: 'wrap',
              gap: 'clamp(4px, 0.8vw, 8px)',
              padding: 'clamp(8px, 1.5vw, 14px)',
              alignItems: 'center',
            }}>
              {row.items.map((item, ii) => {
                const at = 0.6 + itemCounter * 0.18;
                itemCounter++;
                const prog = window.Easing
                  ? window.Easing.easeOutBack(Math.max(0, Math.min(1, (t - at) / 0.35)))
                  : 1;
                return (
                  <div key={ii} style={{
                    padding: 'clamp(6px, 1.2vw, 10px) clamp(10px, 1.8vw, 16px)',
                    background: '#0a0b0d',
                    border: `2px solid ${row.color}`,
                    fontFamily: 'Anton, sans-serif',
                    fontSize: 'clamp(14px, 2.4vw, 26px)',
                    color: '#fff',
                    letterSpacing: '0.02em',
                    lineHeight: 0.95,
                    opacity: prog,
                    transform: `translateY(${(1 - prog) * 16}px) scale(${0.9 + 0.1 * prog})`,
                  }}>{item}</div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

window.TierList = TierList;
window.TIER_LIST_META = {
  id: 'tier-list',
  name: 'TIER LIST',
  category: 'Layout',
  description: 'S/A/B/C tier rows with items slotting in sequentially. Use for opinionated rankings: best drills, strongest sports, must-do exercises.',
  props: ['tiers'],
};
