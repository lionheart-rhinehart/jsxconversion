// YEAR IN REVIEW — 16:9 — 8s loop
// Aggregate stats montage. Use end-of-year or end-of-season.

function YearInReviewHorizontal({ data = {} }) {
  const eyebrow = data.eyebrow ?? '2025 · BY THE NUMBERS';
  const title1 = data.title1 ?? 'ONE YEAR.';
  const title2 = data.title2 ?? 'FOUR HUNDRED ATHLETES.';
  const closer = data.closer ?? "WE'RE JUST GETTING STARTED.";
  const closerAccent = data.closerAccent ?? 'GETTING STARTED.';
  const ctaText = data.ctaText ?? 'JOIN IN 2026 →';
  const media1 = data.media1 ?? 'assets/hero-sprint-male.jpg';
  const media2 = data.media2 ?? 'assets/photo-lifting.jpg';
  const media3 = data.media3 ?? 'assets/photo-jump-female.jpg';

  const t = useTime();
  const RED = (window.__BRAND__ && window.__BRAND__.brand_red || '#c4141d');

  const eyebrowT = Math.max(0, Math.min(1, (t - 0.2) / 0.4));
  const titleT = Easing.easeOutCubic(Math.max(0, Math.min(1, (t - 0.5) / 0.5)));

  // 4 big counters animate up
  const counters = [
    { value: 412, suffix: '',     label: 'ATHLETES TRAINED',   delay: 1.3 },
    { value: 1247, suffix: '',    label: 'PRs SET',            delay: 1.9 },
    { value: 28, suffix: '',      label: 'D1 COMMITS',         delay: 2.5 },
    { value: 5, suffix: '',       label: 'LOCATIONS LIVE',     delay: 3.1 },
  ];

  // sub-stats grid
  const subT = Easing.easeOutCubic(Math.max(0, Math.min(1, (t - 4.0) / 0.5)));

  // closer
  const closerT = Easing.easeOutCubic(Math.max(0, Math.min(1, (t - 5.8) / 0.5)));
  const ctaT = Easing.easeOutBack(Math.max(0, Math.min(1, (t - 6.6) / 0.5)));

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a0b0d', overflow: 'hidden' }}>
      {/* Photo strip background — montage of 3 across */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex',
        opacity: 0.18,
      }}>
        {[media1, media2, media3].map((src, i) => (
          <window.TrimmedMedia key={i} src={src} muted style={{
            flex: 1, objectFit: 'cover',
            filter: 'grayscale(0.4) contrast(1.05)',
          }}/>
        ))}
      </div>
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, rgba(10,11,13,0.85) 0%, rgba(10,11,13,0.95) 100%)',
      }}/>

      {/* Eyebrow + title */}
      <div style={{
        position: 'absolute', top: 70, left: 70,
        opacity: eyebrowT,
      }}>
        <Eyebrow top={150} fontSize={22}>// {eyebrow}</Eyebrow>
      </div>

      <div style={{
        position: 'absolute', top: 110, left: 70,
        opacity: titleT,
        transform: `translateY(${(1 - titleT) * 16}px)`,
      }}>
        <div style={{
          fontFamily: 'Anton, sans-serif',
          fontSize: 110, color: '#fff', lineHeight: 0.88,
        }}>{title1}</div>
        <div style={{
          fontFamily: 'Anton, sans-serif',
          fontSize: 110, color: RED, lineHeight: 0.88,
          marginTop: 4,
        }}>{title2}</div>
      </div>

      {/* Big counter row */}
      <div style={{
        position: 'absolute',
        top: 380, left: 70, right: 70,
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16,
      }}>
        {counters.map((c) => {
          const local = Math.max(0, Math.min(1, (t - c.delay) / 0.8));
          const op = Math.max(0, Math.min(1, (t - c.delay) / 0.4));
          const eased = Easing.easeOutCubic(local);
          const val = Math.round(eased * c.value);
          return (
            <div key={c.label} style={{
              opacity: op,
              transform: `translateY(${(1 - op) * 20}px)`,
            }}>
              <div style={{
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: 160, color: '#fff', fontWeight: 800,
                lineHeight: 0.85,
                fontVariantNumeric: 'tabular-nums',
                letterSpacing: '-0.04em',
              }}>{val.toLocaleString()}</div>
              <div style={{
                marginTop: 14,
                width: 60, height: 4, background: RED,
              }}/>
              <div style={{
                marginTop: 14,
                fontFamily: 'Anton, sans-serif',
                fontSize: 24, color: '#fff',
                letterSpacing: '0.02em',
              }}>{c.label}</div>
            </div>
          );
        })}
      </div>

      {/* Smaller sub-stats strip */}
      <div style={{
        position: 'absolute',
        bottom: 170, left: 70, right: 70,
        display: 'flex', gap: 24, alignItems: 'center',
        opacity: subT,
        transform: `translateY(${(1 - subT) * 14}px)`,
      }}>
        {[
          ['+1.2', 'AVG MPH GAIN'],
          ['+4.1″', 'AVG VERT GAIN'],
          ['97%', 'GUARANTEE HIT'],
          ['$0', 'WHEN WE MISS'],
        ].map(([v, l]) => (
          <div key={l} style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
            <div style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: 36, fontWeight: 700,
              color: RED,
              fontVariantNumeric: 'tabular-nums',
            }}>{v}</div>
            <div style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: 14, color: '#969ca7',
              letterSpacing: '0.12em',
            }}>{l}</div>
          </div>
        ))}
      </div>

      {/* Closer + CTA */}
      <div style={{
        position: 'absolute',
        bottom: 60, left: 70,
        opacity: closerT,
      }}>
        <div style={{
          fontFamily: 'Anton, sans-serif',
          fontSize: 56, color: '#fff', lineHeight: 0.9,
        }}>{closer.replace(closerAccent, '')}<span style={{color: RED}}>{closerAccent}</span></div>
      </div>

      <div style={{
        position: 'absolute',
        bottom: 60, right: 70,
        padding: '18px 24px',
        background: RED,
        opacity: ctaT,
        transform: `translateY(${(1 - ctaT) * 14}px)`,
        boxShadow: '0 12px 36px rgba(196,20,29,0.4)',
      }}>
        <div style={{
          fontFamily: 'Anton, sans-serif',
          fontSize: 36, color: '#fff',
        }}>{ctaText}</div>
      </div>
    </div>
  );
}

window.YearInReviewHorizontal = YearInReviewHorizontal;

const YEAR_IN_REVIEW_SPEC = {
  id: 'year-in-review',
  name: 'YEAR IN REVIEW',
  fields: [
  {
    "key": "duration",
    "label": "Length",
    "type": "slider",
    "default": 8,
    "min": 3,
    "max": 15,
    "step": 0.5,
    "unit": "s"
  },
  {
    "key": "eyebrow",
    "label": "Eyebrow tag",
    "type": "text",
    "default": "2025 · BY THE NUMBERS"
  },
  {
    "key": "title1",
    "label": "Title line 1",
    "type": "text",
    "default": "ONE YEAR."
  },
  {
    "key": "title2",
    "label": "Title line 2 (red)",
    "type": "text",
    "default": "FOUR HUNDRED ATHLETES."
  },
  {
    "key": "closer",
    "label": "Closer line",
    "type": "text",
    "default": "WE'RE JUST GETTING STARTED."
  },
  {
    "key": "closerAccent",
    "label": "Closer accent (red portion)",
    "type": "text",
    "default": "GETTING STARTED.",
    "sub": "must match end of closer line"
  },
  {
    "key": "ctaText",
    "label": "CTA text",
    "type": "text",
    "default": "JOIN IN 2026 →"
  },
  {
    "key": "media1",
    "label": "Background 1 of 3",
    "type": "image",
    "default": "assets/hero-sprint-male.jpg"
  },
  {
    "key": "media2",
    "label": "Background 2 of 3",
    "type": "image",
    "default": "assets/photo-lifting.jpg"
  },
  {
    "key": "media3",
    "label": "Background 3 of 3",
    "type": "image",
    "default": "assets/photo-jump-female.jpg"
  }
],
};
window.YEAR_IN_REVIEW_SPEC = YEAR_IN_REVIEW_SPEC;
