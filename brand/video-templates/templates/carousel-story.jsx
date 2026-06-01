// CAROUSEL STORY — 9:16 Reel — sequential image slides with caption hooks
// Voiceover-ready: 4 images Ken-burnsed with overlay captions, paced ~2s each
function CarouselStoryReel({ data = {} }) {
  const t = window.useTime ? window.useTime() : 0;
  const RED = '#c4141d';

  const eyebrow = data.eyebrow ?? 'OUR STORY · 90 SECONDS';
  const slides = [
    { media: data.slide1Media ?? 'assets/photo-gym-wide.jpg',     caption: data.slide1Caption ?? 'WE STARTED IN ONE GYM.' },
    { media: data.slide2Media ?? 'assets/photo-group-coaching.jpg', caption: data.slide2Caption ?? 'WITH ONE BELIEF.' },
    { media: data.slide3Media ?? 'assets/photo-lifting.jpg',      caption: data.slide3Caption ?? 'KIDS DESERVE BETTER COACHING.' },
    { media: data.slide4Media ?? 'assets/hero-sprint-male.jpg',   caption: data.slide4Caption ?? '412 ATHLETES LATER...' },
  ];
  const finalLine = data.finalLine ?? "WE'RE JUST WARMING UP.";
  const ctaText = data.ctaText ?? 'BE PART OF IT →';

  const slideDur = 1.4;
  const slideOf = (i) => ({ from: 0.4 + i * slideDur, to: 0.4 + (i + 1) * slideDur });

  const eyebrowT = Math.max(0, Math.min(1, (t - 0.2) / 0.3));
  const finalT = window.Easing ? window.Easing.easeOutCubic(Math.max(0, Math.min(1, (t - 6.4) / 0.5))) : 1;
  const ctaT = window.Easing ? window.Easing.easeOutBack(Math.max(0, Math.min(1, (t - 7.2) / 0.5))) : 1;

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a0b0d', overflow: 'hidden' }}>
      {/* Slides */}
      {slides.map((s, i) => {
        const { from, to } = slideOf(i);
        const active = t >= from && t <= to + 0.2;
        if (!active) return null;
        const inT = Math.max(0, Math.min(1, (t - from) / 0.25));
        const outT = Math.max(0, Math.min(1, (t - to) / 0.2));
        const op = inT * (1 - outT);
        const localT = (t - from) / (to - from);
        const scale = 1.05 + 0.06 * localT;
        return (
          <React.Fragment key={i}>
            {window.TrimmedMedia && <window.TrimmedMedia
              src={s.media}
              clipStart={data[`slide${i+1}Media_clipStart`]}
              clipEnd={data[`slide${i+1}Media_clipEnd`]}
              muted={!data[`slide${i+1}Media_audio`]}
              style={{
                position: 'absolute', inset: 0,
                width: '100%', height: '100%', objectFit: 'cover',
                opacity: op,
                transform: `scale(${scale})`,
                filter: 'contrast(1.05) saturate(0.9) brightness(0.7)',
              }}
            />}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(180deg, rgba(10,11,13,0.3) 0%, rgba(10,11,13,0) 30%, rgba(10,11,13,0) 50%, rgba(10,11,13,0.92) 100%)',
              opacity: op,
            }}/>
            {/* Slide counter */}
            <div style={{
              position: 'absolute', top: 110, right: 60,
              padding: '6px 12px',
              background: 'rgba(10,11,13,0.8)',
              border: '1px solid rgba(255,255,255,0.18)',
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: 20, color: '#fff', letterSpacing: '0.1em',
              opacity: op,
              fontVariantNumeric: 'tabular-nums',
            }}>{String(i + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}</div>
            {/* Caption */}
            <div style={{
              position: 'absolute', bottom: 380, left: 60, right: 60,
              fontFamily: 'Anton, sans-serif',
              fontSize: 100, color: '#fff', lineHeight: 0.92,
              opacity: op,
              transform: `translateY(${(1 - inT) * 18}px)`,
            }}>{s.caption}</div>
          </React.Fragment>
        );
      })}

      <div style={{
        position: 'absolute', top: 110, left: 60,
        padding: '8px 14px', background: RED,
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: 22, color: '#fff', letterSpacing: '0.16em',
        opacity: eyebrowT,
      }}>// {eyebrow}</div>

      {/* Final line */}
      {t > 6.3 && (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'rgba(10,11,13,0.92)',
          opacity: Math.max(0, Math.min(1, (t - 6.3) / 0.3)),
        }}/>
      )}
      {t > 6.3 && (
        <div style={{
          position: 'absolute', top: '50%', left: 60, right: 60,
          transform: 'translateY(-50%)',
          textAlign: 'center',
          fontFamily: 'Anton, sans-serif',
          fontSize: 130, color: '#fff', lineHeight: 0.9,
          opacity: finalT,
          transform: `translateY(-50%) scale(${0.92 + 0.08 * finalT})`,
        }}>{finalLine}</div>
      )}

      <div style={{
        position: 'absolute', bottom: 90, left: 60, right: 60,
        padding: '22px 28px', background: RED,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        opacity: ctaT,
      }}>
        <div style={{ fontFamily: 'Anton, sans-serif', fontSize: 44, color: '#fff' }}>{ctaText}</div>
        <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 16, color: '#fff', letterSpacing: '0.1em' }}>ATHLETESACCEL.COM</div>
      </div>
    </div>
  );
}
window.CarouselStoryReel = CarouselStoryReel;
const CAROUSEL_STORY_SPEC = {
  id: 'carousel-story',
  name: 'CAROUSEL STORY',
  fields: [
  {
    "key": "duration",
    "label": "Length",
    "type": "slider",
    "default": 9,
    "min": 6,
    "max": 15,
    "step": 0.5,
    "unit": "s"
  },
  {
    "key": "eyebrow",
    "label": "Eyebrow",
    "type": "text",
    "default": "OUR STORY · 90 SECONDS"
  },
  {
    "key": "slide1Caption",
    "label": "Slide 1 caption",
    "type": "text",
    "default": "WE STARTED IN ONE GYM."
  },
  {
    "key": "slide1Media",
    "label": "Slide 1 photo/video",
    "type": "image",
    "default": "assets/photo-gym-wide.jpg"
  },
  {
    "key": "slide2Caption",
    "label": "Slide 2 caption",
    "type": "text",
    "default": "WITH ONE BELIEF."
  },
  {
    "key": "slide2Media",
    "label": "Slide 2 photo/video",
    "type": "image",
    "default": "assets/photo-group-coaching.jpg"
  },
  {
    "key": "slide3Caption",
    "label": "Slide 3 caption",
    "type": "text",
    "default": "KIDS DESERVE BETTER COACHING."
  },
  {
    "key": "slide3Media",
    "label": "Slide 3 photo/video",
    "type": "image",
    "default": "assets/photo-lifting.jpg"
  },
  {
    "key": "slide4Caption",
    "label": "Slide 4 caption",
    "type": "text",
    "default": "412 ATHLETES LATER..."
  },
  {
    "key": "slide4Media",
    "label": "Slide 4 photo/video",
    "type": "image",
    "default": "assets/hero-sprint-male.jpg"
  },
  {
    "key": "finalLine",
    "label": "Final line",
    "type": "text",
    "default": "WE'RE JUST WARMING UP."
  },
  {
    "key": "ctaText",
    "label": "CTA text",
    "type": "text",
    "default": "BE PART OF IT →"
  }
],
};
window.CAROUSEL_STORY_SPEC = CAROUSEL_STORY_SPEC;
