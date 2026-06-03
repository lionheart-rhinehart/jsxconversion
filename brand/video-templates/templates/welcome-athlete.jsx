// WELCOME ATHLETE — 9:16 Reel — 7s loop
// New-member intro: photo, WELCOME, name, sport/goal, warm note.
// Editable: eyebrow, name, meta, goal, photo.

const WELCOME_ATHLETE_SPEC = {
  id: 'welcome-athlete',
  name: 'WELCOME ATHLETE',
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
    "default": "NEW TO THE TEAM"
  },
  {
    "key": "name",
    "label": "Name",
    "type": "text",
    "default": "MAYA CHEN"
  },
  {
    "key": "meta",
    "label": "Meta line",
    "type": "text",
    "default": "U14 · VOLLEYBALL · OUTSIDE HITTER"
  },
  {
    "key": "goal",
    "label": "Goal line",
    "type": "text",
    "default": "GOAL: +4\" VERTICAL BY TRYOUTS"
  },
  {
    "key": "photo",
    "label": "Photo or video",
    "type": "image",
    "default": "assets/photo-jump-female.jpg",
    "sub": "image or short video"
  }
],
};

function WelcomeAthleteReel({ data = {} }) {
  const t = useTime();
  const RED = (window.__BRAND__ && window.__BRAND__.brand_red || '#c4141d');

  const eyebrow = data.eyebrow ?? 'NEW TO THE TEAM';
  const name    = data.name    ?? 'MAYA CHEN';
  const meta    = data.meta    ?? 'U14 · VOLLEYBALL · OUTSIDE HITTER';
  const goal    = data.goal    ?? 'GOAL: +4" VERTICAL BY TRYOUTS';
  const photo   = data.photo   ?? 'assets/photo-jump-female.jpg';

  const E = Easing;
  const photoScale = 1.12 - 0.1 * Math.min(1, t / 7);
  const wipeT = E.easeOutQuart(Math.max(0, Math.min(1, (t - 0.3) / 0.6)));
  const welcomeT = E.easeOutCubic(Math.max(0, Math.min(1, (t - 0.9) / 0.5)));
  const nameT = E.easeOutCubic(Math.max(0, Math.min(1, (t - 2.0) / 0.6)));
  const metaT = Math.max(0, Math.min(1, (t - 2.6) / 0.5));
  const goalT = Math.max(0, Math.min(1, (t - 3.6) / 0.6));
  const logoT = Math.max(0, Math.min(1, (t - 4.4) / 0.6));

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a0b0d', overflow: 'hidden' }}>
      {window.TrimmedMedia ? (
        <window.TrimmedMedia src={photo} clipStart={data.photo_clipStart} clipEnd={data.photo_clipEnd} muted={!data.photo_audio}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
            transform: `scale(${photoScale})`, transformOrigin: '50% 35%', filter: 'contrast(1.05) saturate(0.95) brightness(0.8)' }}/>
      ) : (
        <img src={photo} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
          transform: `scale(${photoScale})`, transformOrigin: '50% 35%', filter: 'contrast(1.05) saturate(0.95) brightness(0.8)' }}/>
      )}
      <div style={{ position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, rgba(10,11,13,0.55) 0%, rgba(10,11,13,0) 32%, rgba(10,11,13,0.3) 55%, rgba(10,11,13,0.97) 100%)' }}/>

      {/* Eyebrow strip */}
      <div style={{ position: 'absolute', top: 230, left: 0, height: 90, background: RED, overflow: 'hidden',
        width: `${wipeT * 760}px`, display: 'flex', alignItems: 'center', paddingLeft: 60,
        boxShadow: '0 12px 40px rgba(196,20,29,0.45)' }}>
        <Eyebrow top={150} fontSize={34}>// {eyebrow}</Eyebrow>
      </div>

      {/* WELCOME */}
      <div style={{ position: 'absolute', top: 360, left: 60, right: 60, opacity: welcomeT,
        transform: `translateY(${(1 - welcomeT) * 24}px)`, fontFamily: 'Anton, sans-serif', fontSize: 220, color: '#fff',
        lineHeight: 0.82, letterSpacing: '-0.01em' }}>WEL<span style={{ color: RED }}>COME</span></div>

      {/* Name + meta */}
      <div style={{ position: 'absolute', bottom: 330, left: 60, right: 60 }}>
        <div style={{ fontFamily: 'Anton, sans-serif', fontSize: 110, color: '#fff', lineHeight: 0.92,
          opacity: nameT, transform: `translateX(${(1 - nameT) * -30}px)` }}>{name}</div>
        <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 28, color: '#c2c6cd', marginTop: 12,
          letterSpacing: '0.04em', opacity: metaT }}>{meta}</div>
      </div>

      {/* Goal chip */}
      <div style={{ position: 'absolute', bottom: 250, left: 60, opacity: goalT, transform: `translateY(${(1 - goalT) * 14}px)` }}>
        <span style={{ display: 'inline-block', border: `2px solid ${RED}`, color: '#fff', padding: '12px 24px',
          fontFamily: '"JetBrains Mono", monospace', fontSize: 26, letterSpacing: '0.08em', background: 'rgba(196,20,29,0.12)' }}>{goal}</span>
      </div>

      {/* Logo */}
      <div style={{ position: 'absolute', left: 60, bottom: 90, opacity: logoT, display: 'flex', alignItems: 'center', gap: 16 }}>
        <img src="assets/logo.png" style={{ width: 70, height: 70, objectFit: 'contain' }}/>
        <div style={{ fontFamily: 'Anton, sans-serif', fontSize: 38, color: '#fff', lineHeight: 0.9 }}>ATHLETES<br/>ACCELERATION</div>
      </div>
    </div>
  );
}

window.WelcomeAthleteReel = WelcomeAthleteReel;
window.WELCOME_ATHLETE_SPEC = WELCOME_ATHLETE_SPEC;
