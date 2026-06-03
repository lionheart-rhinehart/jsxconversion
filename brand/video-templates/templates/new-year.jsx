// NEW YEAR — 9:16 Reel — 7s loop
// Resolution push: big year flips in, "NEW YEAR / NEW SPEED" headline,
// promise line, CTA. Editable: year, line1, line2, promise, cta, photo.

const NEW_YEAR_SPEC = {
  id: 'new-year',
  name: 'NEW YEAR',
  fields: [
    {
      "key": "duration",
      "label": "Length",
      "type": "slider",
      "default": 7,
      "min": 4,
      "max": 15,
      "step": 0.5,
      "unit": "s"
    },
    {
      "key": "eyebrow",
      "role": "eyebrow",
      "label": "Eyebrow",
      "type": "text",
      "default": "{city name} SPORT PARENT"
    },
    {
      "key": "year",
      "label": "Year",
      "type": "text",
      "default": "2027"
    },
    {
      "key": "line1",
      "label": "Headline 1",
      "type": "text",
      "default": "NEW YEAR"
    },
    {
      "key": "line2",
      "label": "Headline 2",
      "type": "text",
      "default": "NEW SPEED"
    },
    {
      "key": "promise",
      "label": "Promise",
      "type": "text",
      "default": "Resolutions fade. Programs deliver. Start January with a plan that measures every rep."
    },
    {
      "key": "cta",
      "label": "CTA",
      "type": "text",
      "default": "JAN INTAKE OPEN → LINK IN BIO"
    },
    {
      "key": "photo",
      "label": "Photo or video",
      "type": "image",
      "default": "assets/hero-sprint-male.jpg",
      "sub": "image or short video"
    }
  ],
};

function NewYearReel({ data = {} }) {
  const t = useTime();
  const RED = (window.__BRAND__ && window.__BRAND__.brand_red || '#c4141d');

  const year    = data.year    ?? '2027';
  const line1   = data.line1   ?? 'NEW YEAR';
  const line2   = data.line2   ?? 'NEW SPEED';
  const promise = data.promise ?? 'Resolutions fade. Programs deliver. Start January with a plan that measures every rep.';
  const cta     = data.cta     ?? 'JAN INTAKE OPEN → LINK IN BIO';
  const photo   = data.photo   ?? 'assets/hero-sprint-male.jpg';

  const E = Easing;
  const photoScale = 1.14 - 0.12 * Math.min(1, t / 7);
  // year scales down from huge to settle
  const yearRaw = Math.max(0, Math.min(1, (t - 0.2) / 0.7));
  const yearEased = E.easeOutCubic(yearRaw);
  const yearScale = 2.0 - 1.0 * yearEased;
  const line1T = E.easeOutCubic(Math.max(0, Math.min(1, (t - 1.4) / 0.5)));
  const line2T = E.easeOutCubic(Math.max(0, Math.min(1, (t - 1.8) / 0.5)));
  const promiseT = Math.max(0, Math.min(1, (t - 2.8) / 0.6));
  const ctaT   = E.easeOutBack(Math.max(0, Math.min(1, (t - 4.2) / 0.5)));
  const logoT  = Math.max(0, Math.min(1, (t - 4.8) / 0.6));

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a0b0d', overflow: 'hidden' }}>
      <Eyebrow top={90} fontSize={34}>{data.eyebrow ?? "{city name} SPORT PARENT"}</Eyebrow>
      {window.TrimmedMedia ? (
        <window.TrimmedMedia src={photo} clipStart={data.photo_clipStart} clipEnd={data.photo_clipEnd} muted={!data.photo_audio}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
            transform: `scale(${photoScale})`, transformOrigin: '50% 35%', filter: 'contrast(1.06) saturate(0.9) brightness(0.55)' }}/>
      ) : (
        <img src={photo} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
          transform: `scale(${photoScale})`, transformOrigin: '50% 35%', filter: 'contrast(1.06) saturate(0.9) brightness(0.55)' }}/>
      )}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(10,11,13,0.6) 0%, rgba(10,11,13,0.35) 40%, rgba(10,11,13,0.88) 72%, rgba(10,11,13,0.97) 100%)' }}/>

      {/* Big year */}
      <div style={{ position: 'absolute', top: 260, left: 0, right: 0, textAlign: 'center', opacity: Math.min(1, yearRaw * 1.5),
        transform: `scale(${yearScale})`, transformOrigin: 'center' }}>
        <div style={{ fontFamily: 'Anton, sans-serif', fontSize: 360, color: 'transparent', lineHeight: 0.82,
          WebkitTextStroke: `4px ${RED}`, letterSpacing: '0.02em' }}>{year}</div>
      </div>

      {/* Headlines */}
      <div style={{ position: 'absolute', top: 720, left: 60, right: 60 }}>
        <div style={{ fontFamily: 'Anton, sans-serif', fontSize: 170, color: '#fff', lineHeight: 0.86,
          opacity: line1T, transform: `translateX(${(1 - line1T) * -40}px)` }}>{line1}</div>
        <div style={{ fontFamily: 'Anton, sans-serif', fontSize: 170, color: RED, lineHeight: 0.86,
          opacity: line2T, transform: `translateX(${(1 - line2T) * 40}px)` }}>{line2}</div>
      </div>

      {/* Promise */}
      <div style={{ position: 'absolute', bottom: 360, left: 60, right: 80, opacity: promiseT,
        transform: `translateY(${(1 - promiseT) * 16}px)`, fontFamily: '"Geist", sans-serif', fontWeight: 400,
        fontSize: 38, color: '#c2c6cd', lineHeight: 1.45, textWrap: 'pretty' }}>{promise}</div>

      {/* CTA */}
      <div style={{ position: 'absolute', bottom: 230, left: 60, right: 60, opacity: Math.min(1, ctaT),
        transform: `scale(${0.85 + 0.15 * ctaT})`, transformOrigin: 'left center' }}>
        <div style={{ display: 'inline-block', background: '#fff', color: '#0a0b0d', padding: '20px 38px',
          fontFamily: '"JetBrains Mono", monospace', fontSize: 34, fontWeight: 700 }}>{cta}</div>
      </div>

      {/* Logo */}
      <div style={{ position: 'absolute', left: 60, bottom: 90, opacity: logoT, display: 'flex', alignItems: 'center', gap: 16 }}>
        <img src="assets/logo.png" style={{ width: 66, height: 66, objectFit: 'contain' }}/>
        <div style={{ fontFamily: 'Anton, sans-serif', fontSize: 38, color: '#fff', lineHeight: 0.9 }}>ATHLETES<br/>ACCELERATION</div>
      </div>
    </div>
  );
}

window.NewYearReel = NewYearReel;
window.NEW_YEAR_SPEC = NEW_YEAR_SPEC;
