// STREAK FLAME — pulsing flame with a number counting up.
// Props: days, label, unit, color, animateMs, size
// Flame is a single teardrop path + inner core; pulses with playback.

function StreakFlame({ days = 100, label = 'DAY STREAK', color = '#f59e0b', coreColor = (window.__BRAND__ && window.__BRAND__.brand_red || '#c4141d'), animateMs = 1500, size = 360 }) {
  const t = window.useTime ? window.useTime() : 0;
  const Easing = window.Easing || { easeOutCubic: (x) => x };

  const prog = Math.max(0, Math.min(1, (t * 1000) / animateMs));
  const eased = Easing.easeOutCubic(prog);
  const n = Math.round(eased * days);

  // gentle flicker pulse
  const pulse = 1 + 0.04 * Math.sin(t * 7) + 0.03 * Math.sin(t * 13 + 1);
  const flameH = size * 0.62;

  // teardrop flame path in a 100x130 viewBox
  const flamePath = "M50 4 C58 30 86 44 86 82 C86 108 70 126 50 126 C30 126 14 108 14 82 C14 56 38 50 38 28 C44 38 50 44 50 4 Z";
  const corePath  = "M50 56 C56 70 68 78 68 96 C68 110 60 120 50 120 C40 120 32 110 32 96 C32 84 44 82 44 70 C46 76 50 74 50 56 Z";

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{ width: flameH * (100 / 130), height: flameH, transform: `scale(${pulse})`, transformOrigin: 'center bottom' }}>
        <svg viewBox="0 0 100 130" width="100%" height="100%"
          style={{ filter: `drop-shadow(0 0 ${size * 0.05}px ${color}cc)` }}>
          <path d={flamePath} fill={color}/>
          <path d={corePath} fill={coreColor}/>
        </svg>
      </div>
      <div style={{
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: size * 0.34, fontWeight: 800, color: '#fff',
        lineHeight: 0.9, marginTop: -size * 0.04, fontVariantNumeric: 'tabular-nums',
      }}>{n}</div>
      <div style={{
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: size * 0.06, color: '#969ca7', letterSpacing: '0.16em', marginTop: 6,
      }}>{label}</div>
    </div>
  );
}

window.StreakFlame = StreakFlame;
window.STREAK_FLAME_META = {
  id: 'streak-flame',
  name: 'STREAK FLAME',
  category: 'Data Viz',
  description: 'Pulsing flame with a number counting up. Add to: attendance streaks, session milestones, consistency callouts.',
  props: ['days', 'label', 'color', 'size'],
};
