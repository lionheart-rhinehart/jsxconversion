// ATHLETE BIRTHDAY — 9:16 Reel — 7s loop
// Birthday shoutout: photo, confetti, HAPPY BIRTHDAY, name, message.
// Editable: greeting, name, age line, message, photo.

const ATHLETE_BIRTHDAY_SPEC = {
  id: 'athlete-birthday',
  name: 'ATHLETE BIRTHDAY',
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
      "key": "greeting",
      "label": "Greeting",
      "type": "text",
      "default": "HAPPY BIRTHDAY"
    },
    {
      "key": "name",
      "label": "Name",
      "type": "text",
      "default": "TYLER B."
    },
    {
      "key": "ageline",
      "label": "Age / tag",
      "type": "text",
      "default": "TURNING 15 · 3 YEARS STRONG"
    },
    {
      "key": "message",
      "label": "Message",
      "type": "text",
      "default": "Keep chasing it. The whole AA family is behind you."
    },
    {
      "key": "photo",
      "label": "Photo or video",
      "type": "image",
      "default": "assets/photo-medball-female.jpg",
      "sub": "image or short video"
    }
  ],
};

function AthleteBirthdayReel({ data = {} }) {
  const t = useTime();
  const RED = (window.__BRAND__ && window.__BRAND__.brand_red || '#c4141d');

  const greeting = data.greeting ?? 'HAPPY BIRTHDAY';
  const name     = data.name     ?? 'TYLER B.';
  const ageline  = data.ageline  ?? 'TURNING 15 · 3 YEARS STRONG';
  const message  = data.message  ?? 'Keep chasing it. The whole AA family is behind you.';
  const photo    = data.photo    ?? 'assets/photo-medball-female.jpg';

  const E = Easing;
  const photoScale = 1.12 - 0.1 * Math.min(1, t / 7);
  const greetT = E.easeOutBack(Math.max(0, Math.min(1, (t - 0.4) / 0.5)));
  const nameT  = E.easeOutBack(Math.max(0, Math.min(1, (t - 1.1) / 0.5)));
  const ageT   = Math.max(0, Math.min(1, (t - 1.8) / 0.5));
  const msgT   = Math.max(0, Math.min(1, (t - 3.2) / 0.6));
  const logoT  = Math.max(0, Math.min(1, (t - 4.2) / 0.6));

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a0b0d', overflow: 'hidden' }}>
      <Eyebrow top={90} fontSize={34}>{data.eyebrow ?? "{city name} SPORT PARENT"}</Eyebrow>
      {window.TrimmedMedia ? (
        <window.TrimmedMedia src={photo} clipStart={data.photo_clipStart} clipEnd={data.photo_clipEnd} muted={!data.photo_audio}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
            transform: `scale(${photoScale})`, transformOrigin: '50% 38%', filter: 'contrast(1.04) saturate(0.95) brightness(0.82)' }}/>
      ) : (
        <img src={photo} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
          transform: `scale(${photoScale})`, transformOrigin: '50% 38%', filter: 'contrast(1.04) saturate(0.95) brightness(0.82)' }}/>
      )}
      <div style={{ position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, rgba(10,11,13,0.5) 0%, rgba(10,11,13,0) 30%, rgba(10,11,13,0.3) 55%, rgba(10,11,13,0.97) 100%)' }}/>

      {/* Greeting */}
      <div style={{ position: 'absolute', top: 220, left: 60, right: 60, textAlign: 'center', opacity: Math.min(1, greetT),
        transform: `scale(${0.7 + 0.3 * greetT})` }}>
        <div style={{ fontFamily: 'Anton, sans-serif', fontSize: 118, color: '#fff', lineHeight: 0.88, textWrap: 'balance' }}>
          {greeting.split(' ').map((w, i) => <div key={i} style={{ color: i % 2 ? RED : '#fff' }}>{w}</div>)}
        </div>
      </div>

      {/* Name plate */}
      <div style={{ position: 'absolute', bottom: 380, left: 60, right: 60, textAlign: 'center' }}>
        <div style={{ display: 'inline-block', background: RED, padding: '12px 44px', opacity: Math.min(1, nameT),
          transform: `scale(${0.7 + 0.3 * nameT}) rotate(-2deg)`, boxShadow: '0 16px 48px rgba(196,20,29,0.5)' }}>
          <div style={{ fontFamily: 'Anton, sans-serif', fontSize: 124, color: '#fff', lineHeight: 0.92 }}>{name}</div>
        </div>
        <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 30, color: '#fff', letterSpacing: '0.14em', marginTop: 22,
          opacity: ageT }}>{ageline}</div>
      </div>

      {/* Message */}
      <div style={{ position: 'absolute', bottom: 230, left: 70, right: 70, textAlign: 'center', opacity: msgT,
        transform: `translateY(${(1 - msgT) * 14}px)`, fontFamily: '"Geist", sans-serif', fontSize: 36, color: '#c2c6cd',
        lineHeight: 1.4, fontStyle: 'italic', textWrap: 'pretty' }}>“{message}”</div>

      {/* Logo */}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 90, textAlign: 'center', opacity: logoT,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <img src="assets/logo.png" style={{ width: 60, height: 60, objectFit: 'contain' }}/>
        <div style={{ fontFamily: 'Anton, sans-serif', fontSize: 34, color: '#fff' }}>ATHLETES ACCELERATION</div>
      </div>

      {window.ConfettiBurst && t > 0.6 && (
        <window.ConfettiBurst count={75} burstAt={0.7} fieldW={1080} fieldH={1920}/>
      )}
    </div>
  );
}

window.AthleteBirthdayReel = AthleteBirthdayReel;
window.ATHLETE_BIRTHDAY_SPEC = ATHLETE_BIRTHDAY_SPEC;
