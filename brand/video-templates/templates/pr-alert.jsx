// PR ALERT — 9:16 Reel — 6s loop
// Action photo + slamming type + counter ticking up to the PR.
// Editable via Tweaks panel: eyebrow, gain value/unit, stat label,
// athlete name + meta, and photo.

const PR_ALERT_SPEC = {
  id: 'pr-alert',
  name: 'PR ALERT',
  fields: [
  {
    "key": "duration",
    "label": "Length",
    "type": "slider",
    "default": 6,
    "min": 3,
    "max": 15,
    "step": 0.5,
    "unit": "s",
    "sub": "total loop length"
  },
  {
    "key": "eyebrow",
    "label": "Eyebrow tag",
    "type": "text",
    "default": "PR ALERT"
  },
  {
    "key": "gainValue",
    "label": "Gain value",
    "type": "number",
    "default": 3,
    "step": 0.1,
    "min": 0,
    "sub": "animates 0 → value"
  },
  {
    "key": "gainUnit",
    "label": "Unit",
    "type": "select",
    "default": "\"",
    "options": [
      "\"",
      "mph",
      "lb",
      "s",
      "reps"
    ]
  },
  {
    "key": "gainLabel",
    "label": "Stat name",
    "type": "text",
    "default": "VERTICAL JUMP"
  },
  {
    "key": "name",
    "label": "Athlete name",
    "type": "text",
    "default": "MARCUS J."
  },
  {
    "key": "meta",
    "label": "Meta line",
    "type": "text",
    "default": "U16 · SOCCER · 90-DAY GAIN"
  },
  {
    "key": "photo",
    "label": "Photo or video",
    "type": "image",
    "default": "assets/photo-jump-male.jpg",
    "sub": "image or short video"
  }
],
};

function PRAlertReel({ data = {} }) {
  const t = useTime();

  // Read fields with fallbacks to spec defaults
  const eyebrow   = data.eyebrow   ?? 'PR ALERT';
  const gainValue = Number(data.gainValue ?? 3.0);
  const gainUnit  = data.gainUnit  ?? '"';
  const gainLabel = data.gainLabel ?? 'VERTICAL JUMP';
  const name      = data.name      ?? 'MARCUS J.';
  const meta      = data.meta      ?? 'U16 · SOCCER · 90-DAY GAIN';
  const photo     = data.photo     ?? 'assets/photo-jump-male.jpg';

  const photoScale = 1.12 - 0.12 * Math.min(1, t / 6);

  const stripT = Easing.easeOutQuart(Math.max(0, Math.min(1, (t - 0.3) / 0.4)));
  const stripX = -100 + stripT * 200;
  const eyebrowT = Easing.easeOutBack(Math.max(0, Math.min(1, (t - 0.6) / 0.4)));

  const numProgress = Math.max(0, Math.min(1, (t - 1.0) / 2.0));
  const numEased = Easing.easeOutCubic(numProgress);
  // Determine decimal precision based on whether default has decimals
  const showDecimals = !Number.isInteger(gainValue);
  const numValue = showDecimals
    ? (numEased * gainValue).toFixed(1)
    : Math.round(numEased * gainValue).toString();

  const labelT = Math.max(0, Math.min(1, (t - 1.4) / 0.4));
  const nameT  = Easing.easeOutCubic(Math.max(0, Math.min(1, (t - 3.5) / 0.6)));
  const logoT  = Math.max(0, Math.min(1, (t - 4.8) / 0.6));

  const RED = '#c4141d';

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a0b0d', overflow: 'hidden' }}>
      {window.TrimmedMedia ? (
        <window.TrimmedMedia
          src={photo}
          clipStart={data.photo_clipStart}
          clipEnd={data.photo_clipEnd}
          muted={!data.photo_audio}
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            objectFit: 'cover',
            transform: `scale(${photoScale})`,
            transformOrigin: '50% 40%',
            filter: 'contrast(1.05) saturate(0.92) brightness(0.85)',
          }}
        />
      ) : (
        <img src={photo} alt="" style={{
          position: 'absolute', inset: 0,
          width: '100%', height: '100%',
          objectFit: 'cover',
          transform: `scale(${photoScale})`,
          transformOrigin: '50% 40%',
          filter: 'contrast(1.05) saturate(0.92) brightness(0.85)',
        }}/>
      )}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, rgba(10,11,13,0.45) 0%, rgba(10,11,13,0) 30%, rgba(10,11,13,0) 50%, rgba(10,11,13,0.95) 100%)',
      }}/>

      {/* Red strip + eyebrow */}
      <div style={{
        position: 'absolute',
        top: 220, left: 0, right: 0,
        height: 120,
        background: RED,
        transform: `translateX(${stripX}%) skewY(-3deg)`,
        display: 'flex', alignItems: 'center',
        paddingLeft: 80,
        boxShadow: '0 12px 40px rgba(196,20,29,0.5)',
      }}>
        <Eyebrow top={150} fontSize={36}>// {eyebrow}</Eyebrow>
      </div>

      {/* Big number */}
      <div style={{
        position: 'absolute',
        left: 0, right: 0, top: 580,
        textAlign: 'center',
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: 480,
        fontWeight: 800,
        color: '#fff',
        lineHeight: 0.9,
        fontVariantNumeric: 'tabular-nums',
        letterSpacing: '-0.04em',
        opacity: numProgress > 0 ? 1 : 0,
        transform: `scale(${0.8 + 0.2 * numEased})`,
        transformOrigin: 'center',
      }}>
        <span style={{ color: RED, fontSize: 280, verticalAlign: 'top', display: 'inline-block', marginRight: -10, marginTop: 60 }}>+</span>
        {numValue}
        <span style={{ fontSize: 220, verticalAlign: 'top', marginTop: 60, display: 'inline-block' }}>{gainUnit}</span>
      </div>

      {/* Label */}
      <div style={{
        position: 'absolute',
        left: 0, right: 0, top: 1180,
        textAlign: 'center',
        fontFamily: 'Anton, sans-serif',
        fontSize: 96,
        color: '#fff',
        letterSpacing: '0.02em',
        opacity: labelT,
        transform: `translateY(${(1 - labelT) * 20}px)`,
      }}>{gainLabel}</div>

      {/* Athlete card */}
      <div style={{
        position: 'absolute',
        left: 60, right: 60,
        bottom: 280,
        padding: '32px 40px',
        background: 'rgba(10,11,13,0.7)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.12)',
        borderLeft: `4px solid ${RED}`,
        opacity: nameT,
        transform: `translateX(${(1 - nameT) * -40}px)`,
      }}>
        <div style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: 22, color: '#969ca7',
          letterSpacing: '0.1em', marginBottom: 12,
        }}>// ATHLETE</div>
        <div style={{
          fontFamily: 'Anton, sans-serif',
          fontSize: 84, color: '#fff', lineHeight: 0.95,
        }}>{name}</div>
        <div style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: 26, color: '#c2c6cd', marginTop: 12,
          letterSpacing: '0.04em',
        }}>{meta}</div>
      </div>

      {/* AA logo bottom */}
      <div style={{
        position: 'absolute',
        left: 60, bottom: 80,
        opacity: logoT,
        display: 'flex', alignItems: 'center', gap: 20,
      }}>
        <img src="assets/logo.png" style={{ width: 100, height: 100, objectFit: 'contain' }}/>
        <div style={{
          fontFamily: 'Anton, sans-serif',
          fontSize: 44, color: '#fff', lineHeight: 0.9,
        }}>ATHLETES<br/>ACCELERATION</div>
      </div>
      <div style={{
        position: 'absolute',
        right: 60, bottom: 110,
        opacity: logoT,
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: 26, color: RED,
        letterSpacing: '0.08em',
      }}>// ATHLETESACCEL.COM</div>
    </div>
  );
}

window.PRAlertReel = PRAlertReel;
window.PR_ALERT_SPEC = PR_ALERT_SPEC;
