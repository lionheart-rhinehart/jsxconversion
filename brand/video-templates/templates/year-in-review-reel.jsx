// YEAR IN REVIEW · REEL — 9:16 conversion
function YearInReviewReel({ data = {} }) {
  const t = window.useTime ? window.useTime() : 0;
  const RED = (window.__BRAND__ && window.__BRAND__.brand_red || '#c4141d');
  const eyebrow = data.eyebrow ?? '2025 · BY THE NUMBERS';
  const title1 = data.title1 ?? 'ONE YEAR.';
  const title2 = data.title2 ?? 'FOUR HUNDRED ATHLETES.';
  const closer = data.closer ?? "WE'RE JUST GETTING STARTED.";
  const ctaText = data.ctaText ?? 'JOIN IN 2026 →';
  const c1v = (typeof data.c1v === 'number') ? data.c1v : 412; const c1l = data.c1l ?? 'ATHLETES TRAINED';
  const c2v = (typeof data.c2v === 'number') ? data.c2v : 1247; const c2l = data.c2l ?? 'PRs SET';
  const c3v = (typeof data.c3v === 'number') ? data.c3v : 28; const c3l = data.c3l ?? 'D1 COMMITS';
  const c4v = (typeof data.c4v === 'number') ? data.c4v : 5; const c4l = data.c4l ?? 'LOCATIONS LIVE';
  const sub1v = data.sub1v ?? '+1.2'; const sub1l = data.sub1l ?? 'AVG MPH GAIN';
  const sub2v = data.sub2v ?? '+4.1″'; const sub2l = data.sub2l ?? 'AVG VERT GAIN';
  const sub3v = data.sub3v ?? '97%'; const sub3l = data.sub3l ?? 'GUARANTEE HIT';
  const sub4v = data.sub4v ?? '$0'; const sub4l = data.sub4l ?? 'WHEN WE MISS';
  const media1 = data.media1 ?? 'assets/hero-sprint-male.jpg';
  const media2 = data.media2 ?? 'assets/photo-lifting.jpg';
  const media3 = data.media3 ?? 'assets/photo-jump-female.jpg';

  const eT = Math.max(0, Math.min(1, (t-0.2)/0.4));
  const tiT = window.Easing ? window.Easing.easeOutCubic(Math.max(0, Math.min(1, (t-0.4)/0.5))) : 1;
  const counters = [
    { v: c1v, l: c1l, delay: 1.3 },{ v: c2v, l: c2l, delay: 1.9 },
    { v: c3v, l: c3l, delay: 2.5 },{ v: c4v, l: c4l, delay: 3.1 },
  ];
  const subT = window.Easing ? window.Easing.easeOutCubic(Math.max(0, Math.min(1, (t-4.6)/0.5))) : 1;
  const closerT = window.Easing ? window.Easing.easeOutCubic(Math.max(0, Math.min(1, (t-6.0)/0.5))) : 1;
  const ctaT = window.Easing ? window.Easing.easeOutBack(Math.max(0, Math.min(1, (t-6.8)/0.5))) : 1;

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a0b0d', overflow: 'hidden' }}>
      {/* Photo strip in background — vertical stack */}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', opacity: 0.18 }}>
        {[media1, media2, media3].map((src, i) => (
          window.TrimmedMedia && <window.TrimmedMedia key={i} src={src} muted style={{ flex: 1, width: '100%', objectFit: 'cover', filter: 'grayscale(0.4) contrast(1.05)' }}/>
        ))}
      </div>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(10,11,13,0.85) 0%, rgba(10,11,13,0.95) 100%)' }}/>

      <Eyebrow top={130} fontSize={26}>// {eyebrow}</Eyebrow>
      <div style={{ position: 'absolute', top: 190, left: 60, right: 60, opacity: tiT, transform: `translateY(${(1-tiT)*16}px)` }}>
        <div style={{ fontFamily: 'Anton, sans-serif', fontSize: 140, color: '#fff', lineHeight: 0.88 }}>{title1}</div>
        <div style={{ marginTop: 8, fontFamily: 'Anton, sans-serif', fontSize: 140, color: RED, lineHeight: 0.88 }}>{title2}</div>
      </div>

      {/* Big counters - 2x2 grid */}
      <div style={{ position: 'absolute', top: 580, left: 60, right: 60, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40 }}>
        {counters.map((c) => {
          const local = Math.max(0, Math.min(1, (t-c.delay)/0.8));
          const op = Math.max(0, Math.min(1, (t-c.delay)/0.4));
          const eased = window.Easing ? window.Easing.easeOutCubic(local) : local;
          const val = Math.round(eased * c.v);
          return (
            <div key={c.l} style={{ opacity: op, transform: `translateY(${(1-op)*20}px)` }}>
              <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 150, color: '#fff', fontWeight: 800, lineHeight: 0.85, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.04em' }}>{val.toLocaleString()}</div>
              <div style={{ marginTop: 14, width: 60, height: 5, background: RED }}/>
              <div style={{ marginTop: 14, fontFamily: 'Anton, sans-serif', fontSize: 30, color: '#fff', letterSpacing: '0.02em' }}>{c.l}</div>
            </div>
          );
        })}
      </div>

      <div style={{ position: 'absolute', top: 1280, left: 60, right: 60, display: 'flex', flexWrap: 'wrap', gap: 24, opacity: subT }}>
        {[[sub1v,sub1l],[sub2v,sub2l],[sub3v,sub3l],[sub4v,sub4l]].map(([v,l]) => (
          <div key={l} style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
            <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 36, fontWeight: 700, color: RED, fontVariantNumeric: 'tabular-nums' }}>{v}</div>
            <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 14, color: '#969ca7', letterSpacing: '0.12em' }}>{l}</div>
          </div>
        ))}
      </div>

      <div style={{ position: 'absolute', bottom: 230, left: 60, right: 60, fontFamily: 'Anton, sans-serif', fontSize: 70, color: '#fff', lineHeight: 0.95, opacity: closerT }}>{closer}</div>

      <div style={{ position: 'absolute', bottom: 90, left: 60, right: 60, padding: '22px 28px', background: RED, display: 'flex', alignItems: 'center', justifyContent: 'space-between', opacity: ctaT }}>
        <div style={{ fontFamily: 'Anton, sans-serif', fontSize: 48, color: '#fff' }}>{ctaText}</div>
        <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 16, color: '#fff', letterSpacing: '0.1em' }}>ATHLETESACCEL.COM</div>
      </div>
    </div>
  );
}
window.YearInReviewReel = YearInReviewReel;
const YEAR_IN_REVIEW_REEL_SPEC = { id:'year-in-review-reel', name:'YEAR IN REVIEW · REEL', fields:[
  {
    "key": "duration",
    "label": "Length",
    "type": "slider",
    "default": 8,
    "min": 4,
    "max": 15,
    "step": 0.5,
    "unit": "s"
  },
  {
    "key": "eyebrow",
    "label": "Eyebrow",
    "type": "text",
    "default": "2025 · BY THE NUMBERS"
  },
  {
    "key": "title1",
    "label": "Title 1",
    "type": "text",
    "default": "ONE YEAR."
  },
  {
    "key": "title2",
    "label": "Title 2 (red)",
    "type": "text",
    "default": "FOUR HUNDRED ATHLETES."
  },
  {
    "key": "c1v",
    "label": "#1 value",
    "type": "number",
    "default": 412
  },
  {
    "key": "c1l",
    "label": "#1 label",
    "type": "text",
    "default": "ATHLETES TRAINED"
  },
  {
    "key": "c2v",
    "label": "#2 value",
    "type": "number",
    "default": 1247
  },
  {
    "key": "c2l",
    "label": "#2 label",
    "type": "text",
    "default": "PRs SET"
  },
  {
    "key": "c3v",
    "label": "#3 value",
    "type": "number",
    "default": 28
  },
  {
    "key": "c3l",
    "label": "#3 label",
    "type": "text",
    "default": "D1 COMMITS"
  },
  {
    "key": "c4v",
    "label": "#4 value",
    "type": "number",
    "default": 5
  },
  {
    "key": "c4l",
    "label": "#4 label",
    "type": "text",
    "default": "LOCATIONS LIVE"
  },
  {
    "key": "sub1v",
    "label": "Sub 1 v",
    "type": "text",
    "default": "+1.2"
  },
  {
    "key": "sub1l",
    "label": "Sub 1 l",
    "type": "text",
    "default": "AVG MPH GAIN"
  },
  {
    "key": "sub2v",
    "label": "Sub 2 v",
    "type": "text",
    "default": "+4.1″"
  },
  {
    "key": "sub2l",
    "label": "Sub 2 l",
    "type": "text",
    "default": "AVG VERT GAIN"
  },
  {
    "key": "sub3v",
    "label": "Sub 3 v",
    "type": "text",
    "default": "97%"
  },
  {
    "key": "sub3l",
    "label": "Sub 3 l",
    "type": "text",
    "default": "GUARANTEE HIT"
  },
  {
    "key": "sub4v",
    "label": "Sub 4 v",
    "type": "text",
    "default": "$0"
  },
  {
    "key": "sub4l",
    "label": "Sub 4 l",
    "type": "text",
    "default": "WHEN WE MISS"
  },
  {
    "key": "closer",
    "label": "Closer",
    "type": "text",
    "default": "WE'RE JUST GETTING STARTED."
  },
  {
    "key": "ctaText",
    "label": "CTA",
    "type": "text",
    "default": "JOIN IN 2026 →"
  },
  {
    "key": "media1",
    "label": "BG photo 1",
    "type": "image",
    "default": "assets/hero-sprint-male.jpg"
  },
  {
    "key": "media2",
    "label": "BG photo 2",
    "type": "image",
    "default": "assets/photo-lifting.jpg"
  },
  {
    "key": "media3",
    "label": "BG photo 3",
    "type": "image",
    "default": "assets/photo-jump-female.jpg"
  }
]};
window.YEAR_IN_REVIEW_REEL_SPEC = YEAR_IN_REVIEW_REEL_SPEC;
