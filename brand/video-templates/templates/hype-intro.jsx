// HYPE INTRO — 16:9 — 5s loop
// Fast-cut brand sting. Use as YouTube channel intro / video bumper /
// web hero looping video.

function HypeIntro({ data = {} }) {
  const tag1 = data.tag1 ?? 'THE DRIVE IS THEIRS.';
  const tag2 = data.tag2 ?? 'THE ATHLETE IS OURS TO BUILD.';
  const guarantee = data.guarantee ?? '+1 MPH SPEED · +3" VERTICAL · 90 DAYS';
  const wordmark1 = data.wordmark1 ?? 'ATHLETES';
  const wordmark2 = data.wordmark2 ?? 'ACCELERATION';
  const url = data.url ?? 'ATHLETESACCEL.COM';
  const media1 = data.media1 ?? 'assets/hero-sprint-male.jpg';
  const media2 = data.media2 ?? 'assets/photo-jump-male.jpg';
  const media3 = data.media3 ?? 'assets/photo-squat.jpg';

  const t = useTime();
  const RED = '#c4141d';

  // Fast-cut sequence of photos with quick swaps
  // 0.0-0.3 : black + red wipe
  // 0.3-0.7 : photo 1 (sprint)
  // 0.7-1.0 : photo 2 (jump)
  // 1.0-1.3 : photo 3 (lift)
  // 1.3-1.8 : red wipe + logo lockup zoom in
  // 1.8-3.2 : tagline reveal line by line
  // 3.2-4.5 : guarantee strip
  // 4.5-5.0 : url + fade
  const photos = [
    { src: media1, from: 0.3, to: 0.7 },
    { src: media2, from: 0.7, to: 1.0 },
    { src: media3, from: 1.0, to: 1.3 },
  ];

  // Red wipe in 0-0.3
  const wipeT = Easing.easeOutQuart(Math.max(0, Math.min(1, t / 0.3)));

  // Logo phase 1.3+
  const logoIn = Easing.easeOutBack(Math.max(0, Math.min(1, (t - 1.3) / 0.5)));
  const logoHold = t >= 1.3 && t < 3.5;
  const logoOpacity = logoHold ? 1 : Math.max(0, Math.min(1, (t - 1.3) / 0.4));

  // Tagline phase 1.9+
  const tag1T = Easing.easeOutCubic(Math.max(0, Math.min(1, (t - 1.9) / 0.4)));
  const tag2T = Easing.easeOutCubic(Math.max(0, Math.min(1, (t - 2.3) / 0.4)));

  // Guarantee 3.2+
  const guarT = Easing.easeOutCubic(Math.max(0, Math.min(1, (t - 3.3) / 0.5)));

  // URL 4.2+
  const urlT = Easing.easeOutCubic(Math.max(0, Math.min(1, (t - 4.2) / 0.4)));

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a0b0d', overflow: 'hidden' }}>
      <div data-eyebrow style={{ position: 'absolute', top: 90, left: 90, right: 90, fontFamily: '"JetBrains Mono", monospace', fontSize: 34, color: '#c4141d', letterSpacing: '0.06em', textTransform: 'uppercase', zIndex: 5 }}>{data.eyebrow ?? "// ATHLETES ACCELERATION"}</div>
      {/* Photo cuts */}
      {photos.map((p, i) => {
        const active = t >= p.from && t <= p.to + 0.1;
        if (!active) return null;
        const inT = Math.max(0, Math.min(1, (t - p.from) / 0.1));
        const outT = Math.max(0, Math.min(1, (t - p.to) / 0.1));
        const op = inT * (1 - outT);
        const sc = 1.05 + (t - p.from) * 0.04;
        return (
          <window.TrimmedMedia key={i} src={p.src} muted style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            objectFit: 'cover',
            opacity: op,
            transform: `scale(${sc})`,
            filter: 'contrast(1.15) saturate(0.85) brightness(0.95)',
          }}/>
        );
      })}

      {/* Red flash strips that wipe across at cuts */}
      {[0.3, 0.7, 1.0, 1.3].map((cut, i) => {
        const cT = Math.max(0, Math.min(1, (t - cut) / 0.12));
        if (cT >= 1) return null;
        return (
          <div key={i} style={{
            position: 'absolute',
            top: 0, bottom: 0,
            left: `${cT * 100 - 100}%`,
            width: '120%',
            background: RED,
            transform: 'skewX(-15deg)',
            transformOrigin: 'top left',
          }}/>
        );
      })}

      {/* Logo lockup */}
      <div style={{
        position: 'absolute',
        top: '50%', left: '50%',
        transform: `translate(-50%, -50%) scale(${0.85 + 0.15 * logoIn})`,
        opacity: logoOpacity,
        textAlign: 'center',
      }}>
        <img src="assets/logo.png" style={{
          width: 220, height: 220, objectFit: 'contain',
          marginBottom: 16,
        }}/>
        <div style={{
          fontFamily: 'Anton, sans-serif',
          fontSize: 110,
          color: '#fff',
          lineHeight: 0.88,
          letterSpacing: '0.01em',
        }}>{wordmark1} <span style={{color: RED}}>{wordmark2}</span></div>
        <div style={{
          marginTop: 12,
          width: 120, height: 4,
          background: RED,
          margin: '12px auto 0',
        }}/>
      </div>

      {/* Tagline appears below logo as it fades out (2.5+) */}
      {t > 2.5 && t < 4.5 && (
        <>
          {/* darken bg as tagline appears */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'rgba(10,11,13,0.78)',
            opacity: Math.max(0, Math.min(1, (t - 2.5) / 0.4)),
          }}/>
          <div style={{
            position: 'absolute',
            top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            width: '90%',
          }}>
            <div style={{
              fontFamily: 'Anton, sans-serif',
              fontSize: 130,
              color: '#fff',
              lineHeight: 0.9,
              opacity: tag1T,
              transform: `translateY(${(1 - tag1T) * 30}px)`,
            }}>{tag1}</div>
            <div style={{
              marginTop: 24,
              fontFamily: 'Anton, sans-serif',
              fontSize: 130,
              color: RED,
              lineHeight: 0.9,
              opacity: tag2T,
              transform: `translateY(${(1 - tag2T) * 30}px)`,
            }}>{tag2}</div>
          </div>
        </>
      )}

      {/* Guarantee strip bottom */}
      {t > 3.2 && (
        <div style={{
          position: 'absolute',
          bottom: 60, left: 60, right: 60,
          padding: '24px 36px',
          background: RED,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          opacity: guarT,
          transform: `translateY(${(1 - guarT) * 20}px)`,
        }}>
          <div style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 28,
            fontWeight: 700,
            color: '#fff',
            letterSpacing: '0.06em',
          }}>{guarantee}</div>
          <div style={{
            fontFamily: 'Anton, sans-serif',
            fontSize: 32,
            color: '#fff',
            opacity: urlT,
          }}>{url}</div>
        </div>
      )}
    </div>
  );
}

window.HypeIntro = HypeIntro;

const HYPE_INTRO_SPEC = {
  id: 'hype-intro',
  name: 'HYPE INTRO',
  fields: [
    {
      "key": "duration",
      "label": "Length",
      "type": "slider",
      "default": 5,
      "min": 3,
      "max": 12,
      "step": 0.5,
      "unit": "s"
    },
    {
      "key": "eyebrow",
      "role": "eyebrow",
      "label": "Eyebrow",
      "type": "text",
      "default": "// ATHLETES ACCELERATION"
    },
    {
      "key": "tag1",
      "label": "Tagline line 1 (white)",
      "type": "text",
      "default": "THE DRIVE IS THEIRS."
    },
    {
      "key": "tag2",
      "label": "Tagline line 2 (red)",
      "type": "text",
      "default": "THE ATHLETE IS OURS TO BUILD."
    },
    {
      "key": "guarantee",
      "label": "Guarantee strip",
      "type": "text",
      "default": "+1 MPH SPEED · +3\" VERTICAL · 90 DAYS"
    },
    {
      "key": "wordmark1",
      "label": "Wordmark (white)",
      "type": "text",
      "default": "ATHLETES"
    },
    {
      "key": "wordmark2",
      "label": "Wordmark (red)",
      "type": "text",
      "default": "ACCELERATION"
    },
    {
      "key": "url",
      "label": "URL",
      "type": "text",
      "default": "ATHLETESACCEL.COM"
    },
    {
      "key": "media1",
      "label": "Cut 1 (photo/video)",
      "type": "image",
      "default": "assets/hero-sprint-male.jpg"
    },
    {
      "key": "media2",
      "label": "Cut 2 (photo/video)",
      "type": "image",
      "default": "assets/photo-jump-male.jpg"
    },
    {
      "key": "media3",
      "label": "Cut 3 (photo/video)",
      "type": "image",
      "default": "assets/photo-squat.jpg"
    }
  ],
};
window.HYPE_INTRO_SPEC = HYPE_INTRO_SPEC;
