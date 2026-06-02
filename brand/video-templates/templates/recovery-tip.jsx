// RECOVERY TIP — 9:16 Reel — 7s loop
// Calm, clean recovery education card. Category tab, big stat, tip headline,
// supporting detail. Editable: category, stat, unit, headline, detail, photo.

const RECOVERY_TIP_SPEC = {
  id: 'recovery-tip',
  name: 'RECOVERY TIP',
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
      "key": "category",
      "label": "Category",
      "type": "select",
      "default": "SLEEP",
      "options": [
        "SLEEP",
        "HYDRATION",
        "MOBILITY",
        "NUTRITION",
        "STRESS"
      ]
    },
    {
      "key": "stat",
      "label": "Big stat",
      "type": "text",
      "default": "8–10"
    },
    {
      "key": "unit",
      "label": "Stat unit",
      "type": "text",
      "default": "HOURS / NIGHT"
    },
    {
      "key": "headline",
      "label": "Headline",
      "type": "text",
      "default": "SLEEP IS THE #1 PERFORMANCE DRUG"
    },
    {
      "key": "detail",
      "label": "Detail",
      "type": "textarea",
      "default": "Growth hormone peaks in deep sleep. Skimp on it and you blunt every adaptation you trained for today."
    },
    {
      "key": "photo",
      "label": "Photo (bg)",
      "type": "image",
      "default": "assets/photo-conditioning.jpg",
      "sub": "shown dimmed behind"
    }
  ],
};

function RecoveryTipReel({ data = {} }) {
  const t = useTime();
  const RED = '#c4141d';

  const category = data.category ?? 'SLEEP';
  const stat     = data.stat     ?? '8–10';
  const unit     = data.unit     ?? 'HOURS / NIGHT';
  const headline = data.headline ?? 'SLEEP IS THE #1 PERFORMANCE DRUG';
  const detail   = data.detail   ?? 'Growth hormone peaks in deep sleep. Skimp on it and you blunt every adaptation you trained for today.';
  const photo    = data.photo    ?? 'assets/photo-conditioning.jpg';

  const E = Easing;
  const tabT   = E.easeOutBack(Math.max(0, Math.min(1, (t - 0.3) / 0.4)));
  const statT  = E.easeOutCubic(Math.max(0, Math.min(1, (t - 0.8) / 0.6)));
  const headT  = E.easeOutCubic(Math.max(0, Math.min(1, (t - 1.8) / 0.6)));
  const lineT  = Math.max(0, Math.min(1, (t - 2.4) / 0.5));
  const detailT = Math.max(0, Math.min(1, (t - 3.0) / 0.6));
  const logoT  = Math.max(0, Math.min(1, (t - 4.2) / 0.6));

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a0b0d', overflow: 'hidden' }}>
      <div data-eyebrow style={{ position: 'absolute', top: 90, left: 90, right: 90, fontFamily: '"JetBrains Mono", monospace', fontSize: 34, color: '#c4141d', letterSpacing: '0.06em', textTransform: 'uppercase', zIndex: 5 }}>{data.eyebrow ?? "{city name} SPORT PARENT"}</div>
      <img src={photo} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
        opacity: 0.2, filter: 'grayscale(0.5) brightness(0.6)' }}/>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(10,11,13,0.85) 0%, rgba(10,11,13,0.55) 45%, rgba(10,11,13,0.95) 100%)' }}/>

      {/* Category tab */}
      <div style={{ position: 'absolute', top: 200, left: 60, opacity: tabT, transform: `translateX(${(1 - tabT) * -30}px)` }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 14, background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.14)', borderLeft: `5px solid ${RED}`, padding: '14px 26px' }}>
          <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 28, color: RED, letterSpacing: '0.16em', fontWeight: 700 }}>// RECOVERY</span>
          <span style={{ fontFamily: 'Anton, sans-serif', fontSize: 40, color: '#fff', letterSpacing: '0.04em' }}>{category}</span>
        </div>
      </div>

      {/* Big stat */}
      <div style={{ position: 'absolute', top: 420, left: 60, right: 60, opacity: statT, transform: `translateY(${(1 - statT) * 26}px)` }}>
        <div style={{ fontFamily: 'Anton, sans-serif', fontSize: 300, color: '#fff', lineHeight: 0.82,
          letterSpacing: '-0.02em' }}>{stat}</div>
        <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 40, color: RED, letterSpacing: '0.2em', marginTop: 4 }}>{unit}</div>
      </div>

      {/* Divider line */}
      <div style={{ position: 'absolute', top: 940, left: 60, height: 4, background: RED, width: `${lineT * (1080 - 120)}px` }}/>

      {/* Headline */}
      <div style={{ position: 'absolute', top: 990, left: 60, right: 60, opacity: headT, transform: `translateY(${(1 - headT) * 20}px)`,
        fontFamily: 'Anton, sans-serif', fontSize: 92, color: '#fff', lineHeight: 0.94, textWrap: 'balance' }}>{headline}</div>

      {/* Detail */}
      <div style={{ position: 'absolute', bottom: 280, left: 60, right: 80, opacity: detailT, transform: `translateY(${(1 - detailT) * 16}px)`,
        fontFamily: '"Geist", sans-serif', fontSize: 38, color: '#c2c6cd', lineHeight: 1.45, fontWeight: 400, textWrap: 'pretty' }}>{detail}</div>

      {/* Logo */}
      <div style={{ position: 'absolute', left: 60, bottom: 90, opacity: logoT, display: 'flex', alignItems: 'center', gap: 16 }}>
        <img src="assets/logo.png" style={{ width: 70, height: 70, objectFit: 'contain' }}/>
        <div style={{ fontFamily: 'Anton, sans-serif', fontSize: 38, color: '#fff', lineHeight: 0.9 }}>ATHLETES<br/>ACCELERATION</div>
      </div>
    </div>
  );
}

window.RecoveryTipReel = RecoveryTipReel;
window.RECOVERY_TIP_SPEC = RECOVERY_TIP_SPEC;
