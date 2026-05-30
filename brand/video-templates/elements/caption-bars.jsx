// CAPTION BARS — Sequential subtitle bars stacking up word-by-word
// Use behind talking-head footage. Props: phrases (array of strings),
// staggerMs (delay between phrases), accentIndices (array of indices to
// highlight in red), align ('bottom' or 'top').

function CaptionBars({
  phrases = ['SPEED IS BUILT', 'IN THE OFF SEASON', 'NOT THE GAME.'],
  staggerMs = 600,
  accentIndices = [2],
  align = 'bottom',
}) {
  const t = window.useTime ? window.useTime() : 0;
  const RED = '#c4141d';
  const accentSet = new Set(accentIndices);

  return (
    <div style={{
      width: '100%', height: '100%',
      padding: '5%',
      boxSizing: 'border-box',
      display: 'flex', flexDirection: 'column',
      justifyContent: align === 'top' ? 'flex-start' : 'flex-end',
      gap: 'clamp(8px, 1.2vw, 14px)',
      fontFamily: 'Anton, sans-serif',
    }}>
      {phrases.map((p, i) => {
        const start = i * (staggerMs / 1000);
        const prog = Math.max(0, Math.min(1, (t - start) / 0.4));
        const eased = window.Easing ? window.Easing.easeOutBack(prog) : prog;
        const isAccent = accentSet.has(i);
        return (
          <div key={i} style={{
            display: 'inline-block',
            alignSelf: 'flex-start',
            padding: '10px 18px',
            background: isAccent ? RED : 'rgba(10,11,13,0.92)',
            border: isAccent ? `2px solid ${RED}` : '1px solid rgba(255,255,255,0.18)',
            color: '#fff',
            fontSize: 'clamp(28px, 5.5vw, 64px)',
            lineHeight: 0.95,
            letterSpacing: '0.01em',
            opacity: eased,
            transform: `translateX(${(1 - eased) * -28}px) scale(${0.92 + 0.08 * eased})`,
            transformOrigin: 'left center',
            boxShadow: isAccent ? `0 8px 24px rgba(196,20,29,0.4)` : '0 4px 12px rgba(0,0,0,0.4)',
          }}>{p}</div>
        );
      })}
    </div>
  );
}

window.CaptionBars = CaptionBars;
window.CAPTION_BARS_META = {
  id: 'caption-bars',
  name: 'CAPTION BARS',
  category: 'Cinematic',
  description: 'Sequential subtitle bars stacking up word-by-word. Drop behind talking-head footage. Accent any line in red.',
  props: ['phrases', 'staggerMs', 'accentIndices', 'align'],
};
