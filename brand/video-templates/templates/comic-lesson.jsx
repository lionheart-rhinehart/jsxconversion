// COMIC LESSON — 9:16 Reel — uses <ComicPanels>
function ComicLessonReel({ data = {} }) {
  const t = window.useTime ? window.useTime() : 0;
  const RED = '#c4141d';

  const eyebrow = data.eyebrow ?? 'PROGRESSION';
  const title1 = data.title1 ?? '90 DAYS.';
  const title2 = data.title2 ?? '4 PHOTOS.';
  const cap1 = data.cap1 ?? 'DAY ONE'; const cap2 = data.cap2 ?? 'WEEK 4';
  const cap3 = data.cap3 ?? 'WEEK 8';  const cap4 = data.cap4 ?? 'NOW.';
  const media1 = data.media1 ?? 'assets/photo-coach-action.jpg';
  const media2 = data.media2 ?? 'assets/photo-lifting.jpg';
  const media3 = data.media3 ?? 'assets/photo-jump-male.jpg';
  const media4 = data.media4 ?? 'assets/hero-sprint-male.jpg';
  const closer = data.closer ?? 'CONSISTENCY > INTENSITY.';
  const ctaText = data.ctaText ?? 'START YOUR 90 →';

  const eyebrowT = Math.max(0, Math.min(1, (t - 0.2) / 0.4));
  const titleT = window.Easing ? window.Easing.easeOutCubic(Math.max(0, Math.min(1, (t - 0.4) / 0.5))) : 1;
  const panelsT = Math.max(0, Math.min(1, (t - 0.9) / 0.4));
  const closerT = window.Easing ? window.Easing.easeOutBack(Math.max(0, Math.min(1, (t - 4.4) / 0.5))) : 1;
  const ctaT = window.Easing ? window.Easing.easeOutBack(Math.max(0, Math.min(1, (t - 5.4) / 0.5))) : 1;

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a0b0d', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 110, left: 60, padding: '8px 16px', background: RED, fontFamily: '"JetBrains Mono", monospace', fontSize: 24, color: '#fff', letterSpacing: '0.16em', opacity: eyebrowT }}>// {eyebrow}</div>
      <div style={{ position: 'absolute', top: 200, left: 60, right: 60, fontFamily: 'Anton, sans-serif', fontSize: 150, color: '#fff', lineHeight: 0.88, opacity: titleT }}>{title1}<br/><span style={{ color: RED }}>{title2}</span></div>

      <div style={{ position: 'absolute', top: 580, left: 40, right: 40, height: 900, opacity: panelsT }}>
        {window.ComicPanels && <window.ComicPanels panels={[
          { media: media1, caption: cap1 },
          { media: media2, caption: cap2 },
          { media: media3, caption: cap3 },
          { media: media4, caption: cap4 },
        ]} accentLast={true}/>}
      </div>

      <div style={{ position: 'absolute', bottom: 230, left: 60, right: 60, textAlign: 'center', fontFamily: 'Anton, sans-serif', fontSize: 64, color: '#fff', lineHeight: 0.95, opacity: closerT, transform: `scale(${0.92 + 0.08 * closerT})` }}>{closer}</div>

      <div style={{ position: 'absolute', bottom: 90, left: 60, right: 60, padding: '22px 28px', background: RED, display: 'flex', alignItems: 'center', justifyContent: 'space-between', opacity: ctaT }}>
        <div style={{ fontFamily: 'Anton, sans-serif', fontSize: 44, color: '#fff' }}>{ctaText}</div>
        <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 16, color: '#fff', letterSpacing: '0.1em' }}>ATHLETESACCEL.COM</div>
      </div>
    </div>
  );
}
window.ComicLessonReel = ComicLessonReel;
const COMIC_LESSON_SPEC = {
  id: 'comic-lesson', name: 'COMIC LESSON',
  fields: [
    { key: 'duration', label: 'Length', type: 'slider', default: 7, min: 4, max: 15, step: 0.5, unit: 's' },
    { key: 'eyebrow', label: 'Eyebrow', type: 'text', default: 'PROGRESSION' },
    { key: 'title1', label: 'Title 1', type: 'text', default: '90 DAYS.' },
    { key: 'title2', label: 'Title 2 (red)', type: 'text', default: '4 PHOTOS.' },
    { key: 'cap1', label: 'Panel 1 caption', type: 'text', default: 'DAY ONE' },
    { key: 'media1', label: 'Panel 1 photo/video', type: 'image', default: 'assets/photo-coach-action.jpg' },
    { key: 'cap2', label: 'Panel 2 caption', type: 'text', default: 'WEEK 4' },
    { key: 'media2', label: 'Panel 2 photo/video', type: 'image', default: 'assets/photo-lifting.jpg' },
    { key: 'cap3', label: 'Panel 3 caption', type: 'text', default: 'WEEK 8' },
    { key: 'media3', label: 'Panel 3 photo/video', type: 'image', default: 'assets/photo-jump-male.jpg' },
    { key: 'cap4', label: 'Panel 4 caption (accent)', type: 'text', default: 'NOW.' },
    { key: 'media4', label: 'Panel 4 photo/video', type: 'image', default: 'assets/hero-sprint-male.jpg' },
    { key: 'closer', label: 'Closer line', type: 'text', default: 'CONSISTENCY > INTENSITY.' },
    { key: 'ctaText', label: 'CTA', type: 'text', default: 'START YOUR 90 →' },
  ],
};
window.COMIC_LESSON_SPEC = COMIC_LESSON_SPEC;
