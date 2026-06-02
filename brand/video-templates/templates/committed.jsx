// COMMITTED — 9:16 Reel — 7s loop
// Bold "COMMITTED" stamp slam over a portrait. School + name + sport.
// Editable: athlete, sport line, school, season, photo.

const COMMITTED_SPEC = {
  id: 'committed',
  name: 'COMMITTED',
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
      "key": "name",
      "label": "Athlete name",
      "type": "text",
      "default": "ALEX MORGAN"
    },
    {
      "key": "sport",
      "label": "Sport · pos",
      "type": "text",
      "default": "WOMEN’S SOCCER · MIDFIELD"
    },
    {
      "key": "school",
      "label": "School",
      "type": "text",
      "default": "NORTHGATE COLLEGE"
    },
    {
      "key": "season",
      "label": "Season tag",
      "type": "text",
      "default": "FALL 2026"
    },
    {
      "key": "photo",
      "label": "Photo or video",
      "type": "image",
      "default": "assets/hero-sprint-female.jpg",
      "sub": "image or short video"
    }
  ],
};

function CommittedReel({ data = {} }) {
  const t = useTime();
  const RED = '#c4141d';

  const name   = data.name   ?? 'ALEX MORGAN';
  const sport  = data.sport  ?? 'WOMEN’S SOCCER · MIDFIELD';
  const school = data.school ?? 'NORTHGATE COLLEGE';
  const season = data.season ?? 'FALL 2026';
  const photo  = data.photo  ?? 'assets/hero-sprint-female.jpg';

  const E = Easing;
  const photoScale = 1.12 - 0.1 * Math.min(1, t / 7);

  // Stamp slams in around 0.6s with an overshoot then settle
  const stampRaw = Math.max(0, Math.min(1, (t - 0.5) / 0.35));
  const stampScale = stampRaw < 1 ? 2.4 - 1.4 * E.easeOutCubic(stampRaw) : 1 + 0.02 * Math.sin((t - 0.85) * 14) * Math.exp(-(t - 0.85) * 4);
  const stampOpacity = Math.min(1, stampRaw * 2);

  const schoolT = E.easeOutCubic(Math.max(0, Math.min(1, (t - 2.2) / 0.6)));
  const nameT   = E.easeOutCubic(Math.max(0, Math.min(1, (t - 3.0) / 0.6)));
  const logoT   = Math.max(0, Math.min(1, (t - 4.0) / 0.6));

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a0b0d', overflow: 'hidden' }}>
      <div data-eyebrow style={{ position: 'absolute', top: 90, left: 90, right: 90, fontFamily: '"JetBrains Mono", monospace', fontSize: 34, color: '#c4141d', letterSpacing: '0.06em', textTransform: 'uppercase', zIndex: 5 }}>{data.eyebrow ?? "{city name} SPORT PARENT"}</div>
      {window.TrimmedMedia ? (
        <window.TrimmedMedia src={photo} clipStart={data.photo_clipStart} clipEnd={data.photo_clipEnd} muted={!data.photo_audio}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
            transform: `scale(${photoScale})`, transformOrigin: '50% 38%', filter: 'contrast(1.06) saturate(0.9) brightness(0.8)' }}/>
      ) : (
        <img src={photo} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
          transform: `scale(${photoScale})`, transformOrigin: '50% 38%', filter: 'contrast(1.06) saturate(0.9) brightness(0.8)' }}/>
      )}
      <div style={{ position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, rgba(10,11,13,0.35) 0%, rgba(10,11,13,0) 35%, rgba(10,11,13,0.55) 70%, rgba(10,11,13,0.97) 100%)' }}/>

      {/* COMMITTED stamp */}
      <div style={{ position: 'absolute', top: 560, left: 0, right: 0, textAlign: 'center',
        opacity: stampOpacity, transform: `scale(${stampScale}) rotate(-5deg)`, transformOrigin: 'center' }}>
        <div style={{ display: 'inline-block', background: RED, padding: '8px 40px',
          boxShadow: '0 20px 60px rgba(196,20,29,0.55)', border: '6px solid #fff' }}>
          <div style={{ fontFamily: 'Anton, sans-serif', fontSize: 190, color: '#fff', lineHeight: 0.92, letterSpacing: '0.01em' }}>COMMITTED</div>
        </div>
        <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 28, color: '#fff', letterSpacing: '0.3em', marginTop: 18,
          opacity: stampRaw >= 1 ? 1 : 0 }}>{season}</div>
      </div>

      {/* School + name */}
      <div style={{ position: 'absolute', left: 60, right: 60, bottom: 230 }}>
        <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 26, color: '#969ca7', letterSpacing: '0.16em',
          opacity: schoolT, marginBottom: 8 }}>// NEXT LEVEL</div>
        <div style={{ fontFamily: 'Anton, sans-serif', fontSize: 96, color: RED, lineHeight: 0.92,
          opacity: schoolT, transform: `translateY(${(1 - schoolT) * 24}px)`, textWrap: 'balance' }}>{school}</div>
        <div style={{ fontFamily: 'Anton, sans-serif', fontSize: 66, color: '#fff', lineHeight: 0.95, marginTop: 14,
          opacity: nameT, transform: `translateY(${(1 - nameT) * 20}px)` }}>{name}</div>
        <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 26, color: '#c2c6cd', marginTop: 10, letterSpacing: '0.04em',
          opacity: nameT }}>{sport}</div>
      </div>

      {/* Logo */}
      <div style={{ position: 'absolute', right: 60, bottom: 90, opacity: logoT, display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 24, color: RED, letterSpacing: '0.08em' }}>// ATHLETESACCEL.COM</div>
        <img src="assets/logo.png" style={{ width: 72, height: 72, objectFit: 'contain' }}/>
      </div>

      {window.ConfettiBurst && t > 0.8 && (
        <window.ConfettiBurst count={50} burstAt={0.9} fieldW={1080} fieldH={1920} colors={['#c4141d', '#ffffff', '#f59e0b']}/>
      )}
    </div>
  );
}

window.CommittedReel = CommittedReel;
window.COMMITTED_SPEC = COMMITTED_SPEC;
