// CONFETTI BURST — deterministic falling/bursting confetti, loop-friendly.
// Props: count, colors, burstAt (s), size, gravity
// Particles are seeded by index so playback is stable & scrubbable.

function ConfettiBurst({ count = 60, colors, burstAt = 0.2, size = 1, gravity = 1, fieldW = 1080, fieldH = 1920 }) {
  const t = window.useTime ? window.useTime() : 0;
  const PALETTE = colors || ['#c4141d', '#f59e0b', '#15a34a', '#ffffff', '#1d6fb8'];

  // simple deterministic pseudo-random from an integer seed
  const rand = (seed) => {
    const x = Math.sin(seed * 12.9898) * 43758.5453;
    return x - Math.floor(x);
  };

  const local = Math.max(0, t - burstAt);

  const pieces = [];
  for (let i = 0; i < count; i++) {
    const r1 = rand(i + 1);
    const r2 = rand(i + 7.3);
    const r3 = rand(i + 13.1);
    const r4 = rand(i + 21.7);

    const startX = fieldW * (0.15 + 0.7 * r1);
    const vx = (r2 - 0.5) * 380;               // horizontal drift px/s
    const vy0 = -(220 + r3 * 360);             // initial upward burst px/s
    const g = 620 * gravity;                   // gravity px/s^2

    const x = startX + vx * local;
    const y = fieldH * 0.42 + vy0 * local + 0.5 * g * local * local;

    const rot = (r4 * 720 + local * 360 * (r2 > 0.5 ? 1 : -1));
    const w = (10 + r3 * 16) * size;
    const h = (14 + r1 * 18) * size;
    const color = PALETTE[i % PALETTE.length];
    // fade out as it falls past bottom
    const opacity = y > fieldH * 1.05 ? 0 : Math.min(1, local * 4);

    pieces.push(
      <div key={i} style={{
        position: 'absolute',
        left: x, top: y,
        width: w, height: h,
        background: color,
        opacity,
        transform: `rotate(${rot}deg)`,
        borderRadius: r2 > 0.6 ? '50%' : 2,
      }}/>
    );
  }

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {pieces}
    </div>
  );
}

window.ConfettiBurst = ConfettiBurst;
window.CONFETTI_BURST_META = {
  id: 'confetti-burst',
  name: 'CONFETTI BURST',
  category: 'FX',
  description: 'Deterministic confetti burst, scrubbable and loop-friendly. Pass fieldW/fieldH to match canvas. Add to: celebrations, birthdays, signing day, PRs.',
  props: ['count', 'colors', 'burstAt', 'size', 'gravity', 'fieldW', 'fieldH'],
};
