// NOW HIRING — 9:16 Reel — 7s loop
// Staff recruitment: WE'RE HIRING, role, key details, CTA.
// Editable: eyebrow, role, type, detail lines, CTA, photo.

const NOW_HIRING_SPEC = {
  id: 'now-hiring',
  name: 'NOW HIRING',
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
    "default": "WE'RE HIRING"
  },
  {
    "key": "role",
    "label": "Role",
    "type": "text",
    "default": "STRENGTH & SPEED COACH"
  },
  {
    "key": "type",
    "label": "Type tag",
    "type": "text",
    "default": "FULL-TIME · ON-SITE"
  },
  {
    "key": "detail1",
    "label": "Detail 1",
    "type": "text",
    "default": "CSCS OR EQUIVALENT PREFERRED"
  },
  {
    "key": "detail2",
    "label": "Detail 2",
    "type": "text",
    "default": "2+ YRS COACHING YOUTH ATHLETES"
  },
  {
    "key": "detail3",
    "label": "Detail 3",
    "type": "text",
    "default": "PASSION FOR DEVELOPMENT > EGO"
  },
  {
    "key": "cta",
    "label": "CTA",
    "type": "text",
    "default": "APPLY → ATHLETESACCEL.COM/JOBS"
  },
  {
    "key": "photo",
    "label": "Photo (bg)",
    "type": "image",
    "default": "assets/photo-group-coaching.jpg",
    "sub": "shown dimmed behind"
  }
],
};

function NowHiringReel({ data = {} }) {
  const t = useTime();
  const RED = '#c4141d';

  const eyebrow = data.eyebrow ?? "WE'RE HIRING";
  const role    = data.role    ?? 'STRENGTH & SPEED COACH';
  const type    = data.type    ?? 'FULL-TIME · ON-SITE';
  const details = [data.detail1 ?? 'CSCS OR EQUIVALENT PREFERRED',
                   data.detail2 ?? '2+ YRS COACHING YOUTH ATHLETES',
                   data.detail3 ?? 'PASSION FOR DEVELOPMENT > EGO'];
  const cta     = data.cta     ?? 'APPLY → ATHLETESACCEL.COM/JOBS';
  const photo   = data.photo   ?? 'assets/photo-group-coaching.jpg';

  const E = Easing;
  const eyebrowT = E.easeOutQuart(Math.max(0, Math.min(1, (t - 0.3) / 0.5)));
  const roleT    = E.easeOutCubic(Math.max(0, Math.min(1, (t - 1.0) / 0.6)));
  const typeT    = Math.max(0, Math.min(1, (t - 1.7) / 0.4));
  const ctaT     = E.easeOutBack(Math.max(0, Math.min(1, (t - 4.0) / 0.5)));
  const logoT    = Math.max(0, Math.min(1, (t - 4.6) / 0.6));

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a0b0d', overflow: 'hidden' }}>
      <img src={photo} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
        opacity: 0.22, filter: 'grayscale(0.4) brightness(0.6)' }}/>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(10,11,13,0.8) 0%, rgba(10,11,13,0.55) 45%, rgba(10,11,13,0.96) 100%)' }}/>

      {/* Eyebrow banner */}
      <div style={{ position: 'absolute', top: 200, left: 0, display: 'flex', overflow: 'hidden' }}>
        <div style={{ background: RED, padding: '20px 60px', transform: `translateX(${(1 - eyebrowT) * -120}%)`,
          clipPath: 'polygon(0 0, 100% 0, 94% 100%, 0 100%)', boxShadow: '0 16px 48px rgba(196,20,29,0.5)' }}>
          <Eyebrow top={150} fontSize={92}>{eyebrow}</Eyebrow>
        </div>
      </div>

      {/* Role */}
      <div style={{ position: 'absolute', top: 420, left: 60, right: 60, opacity: roleT, transform: `translateY(${(1 - roleT) * 22}px)`,
        fontFamily: 'Anton, sans-serif', fontSize: 120, color: '#fff', lineHeight: 0.9, textWrap: 'balance' }}>{role}</div>

      {/* Type tag */}
      <div style={{ position: 'absolute', top: 720, left: 60, opacity: typeT }}>
        <span style={{ display: 'inline-block', border: `2px solid ${RED}`, color: RED, padding: '10px 24px',
          fontFamily: '"JetBrains Mono", monospace', fontSize: 30, letterSpacing: '0.12em', fontWeight: 700 }}>{type}</span>
      </div>

      {/* Detail list */}
      <div style={{ position: 'absolute', top: 870, left: 60, right: 60, display: 'flex', flexDirection: 'column', gap: 18 }}>
        {details.map((d, i) => {
          const dT = Math.max(0, Math.min(1, (t - (2.2 + i * 0.35)) / 0.5));
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 22, opacity: dT,
              transform: `translateX(${(1 - dT) * -30}px)` }}>
              <span style={{ width: 18, height: 18, background: RED, flexShrink: 0, transform: 'rotate(45deg)' }}/>
              <span style={{ fontFamily: '"Geist", sans-serif', fontWeight: 600, fontSize: 38, color: '#e8eaed', letterSpacing: '0.01em' }}>{d}</span>
            </div>
          );
        })}
      </div>

      {/* CTA */}
      <div style={{ position: 'absolute', bottom: 230, left: 60, right: 60, opacity: Math.min(1, ctaT),
        transform: `scale(${0.85 + 0.15 * ctaT})`, transformOrigin: 'left center' }}>
        <div style={{ display: 'inline-block', background: '#fff', color: '#0a0b0d', padding: '20px 36px',
          fontFamily: '"JetBrains Mono", monospace', fontSize: 34, fontWeight: 700, letterSpacing: '0.04em' }}>{cta}</div>
      </div>

      {/* Logo */}
      <div style={{ position: 'absolute', left: 60, bottom: 90, opacity: logoT, display: 'flex', alignItems: 'center', gap: 16 }}>
        <img src="assets/logo.png" style={{ width: 66, height: 66, objectFit: 'contain' }}/>
        <div style={{ fontFamily: 'Anton, sans-serif', fontSize: 38, color: '#fff', lineHeight: 0.9 }}>ATHLETES<br/>ACCELERATION</div>
      </div>
    </div>
  );
}

window.NowHiringReel = NowHiringReel;
window.NOW_HIRING_SPEC = NOW_HIRING_SPEC;
