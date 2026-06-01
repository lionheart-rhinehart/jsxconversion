// BACK TO SCHOOL — 9:16 Reel — 7s loop
// Seasonal push: train for the season ahead. Headline, 3 hooks, CTA.
// Editable: eyebrow, headline, 3 hooks, CTA, photo.

const BACK_TO_SCHOOL_SPEC = {
  id: 'back-to-school',
  name: 'BACK TO SCHOOL',
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
    "label": "Eyebrow",
    "type": "text",
    "default": "BACK-TO-SCHOOL SEASON"
  },
  {
    "key": "headline",
    "label": "Headline",
    "type": "text",
    "default": "SHOW UP FASTER THAN YOU LEFT"
  },
  {
    "key": "hook1",
    "label": "Hook 1",
    "type": "text",
    "default": "BEAT TRYOUT NERVES WITH REAL NUMBERS"
  },
  {
    "key": "hook2",
    "label": "Hook 2",
    "type": "text",
    "default": "AFTER-SCHOOL SLOTS · 3:30–8PM"
  },
  {
    "key": "hook3",
    "label": "Hook 3",
    "type": "text",
    "default": "STUDENT PRICING THROUGH SEPT"
  },
  {
    "key": "cta",
    "label": "CTA",
    "type": "text",
    "default": "LOCK YOUR SLOT → LINK IN BIO"
  },
  {
    "key": "photo",
    "label": "Photo or video",
    "type": "image",
    "default": "assets/photo-agility-mixed.jpg",
    "sub": "image or short video"
  }
],
};

function BackToSchoolReel({ data = {} }) {
  const t = useTime();
  const RED = '#c4141d';

  const eyebrow  = data.eyebrow  ?? 'BACK-TO-SCHOOL SEASON';
  const headline = data.headline ?? 'SHOW UP FASTER THAN YOU LEFT';
  const hooks    = [data.hook1 ?? '', data.hook2 ?? '', data.hook3 ?? ''];
  const cta      = data.cta      ?? 'LOCK YOUR SLOT → LINK IN BIO';
  const photo    = data.photo    ?? 'assets/photo-agility-mixed.jpg';

  const E = Easing;
  const photoScale = 1.12 - 0.1 * Math.min(1, t / 7);
  const eyebrowT = E.easeOutQuart(Math.max(0, Math.min(1, (t - 0.3) / 0.5)));
  const headT    = E.easeOutCubic(Math.max(0, Math.min(1, (t - 0.9) / 0.6)));
  const ctaT     = E.easeOutBack(Math.max(0, Math.min(1, (t - 4.2) / 0.5)));
  const logoT    = Math.max(0, Math.min(1, (t - 4.8) / 0.6));

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a0b0d', overflow: 'hidden' }}>
      {window.TrimmedMedia ? (
        <window.TrimmedMedia src={photo} clipStart={data.photo_clipStart} clipEnd={data.photo_clipEnd} muted={!data.photo_audio}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
            transform: `scale(${photoScale})`, transformOrigin: '50% 30%', filter: 'contrast(1.05) saturate(0.92) brightness(0.62)' }}/>
      ) : (
        <img src={photo} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
          transform: `scale(${photoScale})`, transformOrigin: '50% 30%', filter: 'contrast(1.05) saturate(0.92) brightness(0.62)' }}/>
      )}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(10,11,13,0.7) 0%, rgba(10,11,13,0.3) 35%, rgba(10,11,13,0.85) 70%, rgba(10,11,13,0.97) 100%)' }}/>

      {/* Eyebrow */}
      <div style={{ position: 'absolute', top: 180, left: 60, opacity: eyebrowT, transform: `translateX(${(1 - eyebrowT) * -30}px)` }}>
        <span style={{ display: 'inline-block', background: RED, color: '#fff', padding: '14px 30px',
          fontFamily: '"JetBrains Mono", monospace', fontSize: 32, fontWeight: 700, letterSpacing: '0.14em' }}>// {eyebrow}</span>
      </div>

      {/* Headline */}
      <div style={{ position: 'absolute', top: 300, left: 60, right: 60, opacity: headT, transform: `translateY(${(1 - headT) * 24}px)`,
        fontFamily: 'Anton, sans-serif', fontSize: 150, color: '#fff', lineHeight: 0.88, textWrap: 'balance' }}>{headline}</div>

      {/* Hooks */}
      <div style={{ position: 'absolute', bottom: 400, left: 60, right: 60, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {hooks.map((h, i) => {
          const hT = E.easeOutCubic(Math.max(0, Math.min(1, (t - (1.8 + i * 0.4)) / 0.5)));
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 20, opacity: hT,
              transform: `translateX(${(1 - hT) * -30}px)` }}>
              <span style={{ fontFamily: 'Anton, sans-serif', fontSize: 44, color: RED, lineHeight: 1, width: 60 }}>0{i + 1}</span>
              <span style={{ fontFamily: '"Geist", sans-serif', fontWeight: 600, fontSize: 38, color: '#e8eaed', letterSpacing: '0.01em' }}>{h}</span>
            </div>
          );
        })}
      </div>

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

window.BackToSchoolReel = BackToSchoolReel;
window.BACK_TO_SCHOOL_SPEC = BACK_TO_SCHOOL_SPEC;
