// SIGNING DAY — 9:16 Reel — 8s loop
// Athlete commits to the next level. Photo, "SIGNING DAY" banner,
// college reveal, name plate, confetti payoff.
// Editable: eyebrow, athlete, class/sport, school, level tag, photo.

const SIGNING_DAY_SPEC = {
  id: 'signing-day',
  name: 'SIGNING DAY',
  fields: [
    { key: 'duration',  label: 'Length',       type: 'slider', default: 8, min: 4, max: 15, step: 0.5, unit: 's' },
    { key: 'eyebrow',   label: 'Eyebrow tag',  type: 'text',   default: 'SIGNING DAY' },
    { key: 'name',      label: 'Athlete name', type: 'text',   default: 'JORDAN REESE' },
    { key: 'meta',      label: 'Class · sport', type: 'text',  default: "CLASS OF '26 · BASEBALL · RHP" },
    { key: 'school',    label: 'Commits to',   type: 'text',   default: 'STATE UNIVERSITY' },
    { key: 'level',     label: 'Level tag',    type: 'select', default: 'D1 COMMIT', options: ['D1 COMMIT', 'D2 COMMIT', 'D3 COMMIT', 'NAIA COMMIT', 'JUCO COMMIT', 'PRO CONTRACT'] },
    { key: 'photo',     label: 'Photo or video', type: 'image', default: 'assets/photo-coach-action.jpg', sub: 'image or short video' },
  ],
};

function SigningDayReel({ data = {} }) {
  const t = useTime();
  const RED = '#c4141d';

  const eyebrow = data.eyebrow ?? 'SIGNING DAY';
  const name    = data.name    ?? 'JORDAN REESE';
  const meta    = data.meta    ?? "CLASS OF '26 · BASEBALL · RHP";
  const school  = data.school  ?? 'STATE UNIVERSITY';
  const level   = data.level   ?? 'D1 COMMIT';
  const photo   = data.photo   ?? 'assets/photo-coach-action.jpg';

  const E = Easing;
  const photoScale = 1.14 - 0.12 * Math.min(1, t / 8);
  const bannerT = E.easeOutQuart(Math.max(0, Math.min(1, (t - 0.3) / 0.5)));
  const levelT  = E.easeOutBack(Math.max(0, Math.min(1, (t - 1.0) / 0.5)));
  const commitsT = Math.max(0, Math.min(1, (t - 1.8) / 0.4));
  const schoolT = E.easeOutCubic(Math.max(0, Math.min(1, (t - 2.3) / 0.6)));
  const nameT   = E.easeOutCubic(Math.max(0, Math.min(1, (t - 3.4) / 0.6)));
  const logoT   = Math.max(0, Math.min(1, (t - 4.4) / 0.6));

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a0b0d', overflow: 'hidden' }}>
      {window.TrimmedMedia ? (
        <window.TrimmedMedia src={photo} clipStart={data.photo_clipStart} clipEnd={data.photo_clipEnd} muted={!data.photo_audio}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
            transform: `scale(${photoScale})`, transformOrigin: '50% 35%', filter: 'contrast(1.05) saturate(0.95) brightness(0.78)' }}/>
      ) : (
        <img src={photo} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
          transform: `scale(${photoScale})`, transformOrigin: '50% 35%', filter: 'contrast(1.05) saturate(0.95) brightness(0.78)' }}/>
      )}
      <div style={{ position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, rgba(10,11,13,0.7) 0%, rgba(10,11,13,0.1) 28%, rgba(10,11,13,0.2) 50%, rgba(10,11,13,0.97) 100%)' }}/>

      {/* Top banner */}
      <div style={{ position: 'absolute', top: 150, left: 0, right: 0, display: 'flex', justifyContent: 'center', overflow: 'hidden' }}>
        <div style={{ background: RED, padding: '20px 52px', transform: `translateY(${(1 - bannerT) * -120}px)`,
          boxShadow: '0 16px 48px rgba(196,20,29,0.5)', clipPath: 'polygon(4% 0, 100% 0, 96% 100%, 0 100%)' }}>
          <div style={{ fontFamily: '"JetBrains Mono", monospace', color: '#fff', fontSize: 40, fontWeight: 700, letterSpacing: '0.16em' }}>// {eyebrow}</div>
        </div>
      </div>

      {/* Level tag stamp */}
      <div style={{ position: 'absolute', top: 320, left: 0, right: 0, textAlign: 'center',
        opacity: Math.min(1, levelT), transform: `scale(${0.6 + 0.4 * levelT}) rotate(-4deg)`, transformOrigin: 'center' }}>
        <span style={{ display: 'inline-block', border: '5px solid #fff', color: '#fff', padding: '10px 34px',
          fontFamily: 'Anton, sans-serif', fontSize: 76, letterSpacing: '0.04em',
          boxShadow: '0 0 0 4px rgba(196,20,29,0.5), inset 0 0 0 4px rgba(196,20,29,0.3)' }}>{level}</span>
      </div>

      {/* Commits to */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1100, textAlign: 'center' }}>
        <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 30, color: '#969ca7',
          letterSpacing: '0.3em', opacity: commitsT }}>COMMITS TO</div>
        <div style={{ fontFamily: 'Anton, sans-serif', fontSize: 124, color: '#fff', lineHeight: 0.9, marginTop: 16,
          opacity: schoolT, transform: `translateY(${(1 - schoolT) * 30}px)`, padding: '0 50px', textWrap: 'balance' }}>
          <span style={{ color: RED }}>{school}</span>
        </div>
      </div>

      {/* Name plate */}
      <div style={{ position: 'absolute', left: 60, right: 60, bottom: 250, padding: '30px 40px',
        background: 'rgba(10,11,13,0.72)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.12)',
        borderLeft: `5px solid ${RED}`, opacity: nameT, transform: `translateX(${(1 - nameT) * -40}px)` }}>
        <div style={{ fontFamily: 'Anton, sans-serif', fontSize: 78, color: '#fff', lineHeight: 0.95 }}>{name}</div>
        <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 26, color: '#c2c6cd', marginTop: 10, letterSpacing: '0.04em' }}>{meta}</div>
      </div>

      {/* Logo */}
      <div style={{ position: 'absolute', left: 60, bottom: 80, opacity: logoT, display: 'flex', alignItems: 'center', gap: 18 }}>
        <img src="assets/logo.png" style={{ width: 84, height: 84, objectFit: 'contain' }}/>
        <div style={{ fontFamily: 'Anton, sans-serif', fontSize: 40, color: '#fff', lineHeight: 0.9 }}>ATHLETES<br/>ACCELERATION</div>
      </div>

      {/* Confetti payoff */}
      {window.ConfettiBurst && t > 2.0 && (
        <window.ConfettiBurst count={70} burstAt={2.1} fieldW={1080} fieldH={1920}/>
      )}
    </div>
  );
}

window.SigningDayReel = SigningDayReel;
window.SIGNING_DAY_SPEC = SIGNING_DAY_SPEC;
