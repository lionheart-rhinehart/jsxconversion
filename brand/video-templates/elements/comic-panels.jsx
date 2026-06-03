// COMIC PANELS — 4-panel comic-book grid reveal
// Each panel snaps in like a polaroid drop with a caption strip.

function ComicPanels({
  panels = [
    { media: 'assets/photo-coach-action.jpg', caption: 'DAY ONE' },
    { media: 'assets/photo-lifting.jpg',       caption: 'WEEK FOUR' },
    { media: 'assets/photo-jump-male.jpg',     caption: 'WEEK EIGHT' },
    { media: 'assets/hero-sprint-male.jpg',    caption: 'NOW.' },
  ],
  accentLast = true,
}) {
  const t = window.useTime ? window.useTime() : 0;
  const RED = (window.__BRAND__ && window.__BRAND__.brand_red || '#c4141d');

  return (
    <div style={{
      width: '100%', height: '100%',
      padding: '3%', boxSizing: 'border-box',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gridTemplateRows: '1fr 1fr',
      gap: 'clamp(8px, 1.5vw, 16px)',
    }}>
      {panels.slice(0, 4).map((p, i) => {
        const at = 0.3 + i * 0.45;
        const prog = window.Easing
          ? window.Easing.easeOutBack(Math.max(0, Math.min(1, (t - at) / 0.5)))
          : Math.max(0, Math.min(1, (t - at) / 0.5));
        const rot = [-2, 1.5, -1.5, 2.5][i];
        const isAccent = accentLast && i === panels.length - 1;
        return (
          <div key={i} style={{
            position: 'relative',
            background: '#fff',
            padding: 6,
            paddingBottom: 28,
            boxShadow: '0 12px 32px rgba(0,0,0,0.5)',
            opacity: prog,
            transform: `scale(${0.7 + 0.3 * prog}) rotate(${rot * prog}deg)`,
            transformOrigin: 'center',
            border: isAccent ? `4px solid ${RED}` : 'none',
          }}>
            <div style={{
              width: '100%', height: '100%',
              position: 'absolute', inset: 6, bottom: 28,
              overflow: 'hidden',
            }}>
              {window.TrimmedMedia
                ? <window.TrimmedMedia src={p.media}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'contrast(1.1) saturate(0.95)' }}/>
                : <img src={p.media} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>}
            </div>
            <div style={{
              position: 'absolute', bottom: 6, left: 6, right: 6,
              textAlign: 'center',
              fontFamily: 'Anton, sans-serif',
              fontSize: 'clamp(14px, 2.4vw, 22px)',
              color: isAccent ? RED : '#0a0b0d',
              lineHeight: 0.95,
              letterSpacing: '0.02em',
            }}>{p.caption}</div>
          </div>
        );
      })}
    </div>
  );
}

window.ComicPanels = ComicPanels;
window.COMIC_PANELS_META = {
  id: 'comic-panels',
  name: 'COMIC PANELS',
  category: 'Cinematic',
  description: '4 polaroid-style panels snapping into a comic-book grid. Use for transformation series, progress timelines, or visual storytelling.',
  props: ['panels', 'accentLast'],
};
