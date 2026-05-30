// STAR RATING — five stars that fill + pop in sequence
// Props: rating (0–5, supports halves), size, gap, color, animateMs
// Animates each star filling left→right with a little overshoot pop.

function StarRating({ rating = 5, size = 120, gap = 18, color = '#f59e0b', animateMs = 1400 }) {
  const t = window.useTime ? window.useTime() : 0;
  const Easing = window.Easing || { easeOutBack: (x) => x };

  const stars = [0, 1, 2, 3, 4];
  const perStar = animateMs / 1000 / 5; // seconds each star gets to pop

  const StarPath = "M12 2l2.9 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l7.1-1.01L12 2z";

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      gap,
    }}>
      {stars.map((i) => {
        const startT = i * perStar;
        const p = Math.max(0, Math.min(1, (t - startT) / perStar));
        const eased = Easing.easeOutBack(p);
        // fill amount for this star (1 = full, 0.5 = half, 0 = empty)
        const fillAmt = Math.max(0, Math.min(1, rating - i));
        const pop = 0.4 + 0.6 * eased;
        const gradId = `star-grad-${i}`;
        return (
          <svg key={i} viewBox="0 0 24 24" width={size} height={size}
            style={{
              transform: `scale(${pop})`,
              opacity: Math.min(1, p * 1.4),
              filter: p > 0 ? `drop-shadow(0 0 ${size * 0.06}px ${color}aa)` : 'none',
            }}>
            <defs>
              <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="0">
                <stop offset={`${fillAmt * 100}%`} stopColor={color}/>
                <stop offset={`${fillAmt * 100}%`} stopColor="rgba(255,255,255,0.14)"/>
              </linearGradient>
            </defs>
            <path d={StarPath} fill={`url(#${gradId})`}
              stroke={color} strokeWidth={fillAmt > 0 ? 0 : 1} strokeOpacity="0.4"/>
          </svg>
        );
      })}
    </div>
  );
}

window.StarRating = StarRating;
window.STAR_RATING_META = {
  id: 'star-rating',
  name: 'STAR RATING',
  category: 'Data Viz',
  description: 'Five stars that fill and pop in sequence. Supports half-stars. Add to: reviews, testimonials, rating reveals.',
  props: ['rating', 'size', 'gap', 'color'],
};
