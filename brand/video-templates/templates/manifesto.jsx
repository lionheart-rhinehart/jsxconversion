// MANIFESTO — 9:16 Reel — bold tagline series over photo, voiceover-ready
// Unique element: kinetic type slamming in one giant phrase at a time

function ManifestoReel({ data = {} }) {
  const t = window.useTime ? window.useTime() : 0;
  const RED = '#c4141d';

  const eyebrow = data.eyebrow ?? 'OUR MANIFESTO';
  const line1 = data.line1 ?? 'TALENT IS GIVEN.';
  const line2 = data.line2 ?? 'WORK ETHIC IS CHOSEN.';
  const line3 = data.line3 ?? 'THE EDGE IS BUILT.';
  const line4 = data.line4 ?? 'WE BUILD EDGES.';
  const accentLine = (typeof data.accentLine === 'number') ? data.accentLine : 4;
  const ctaText = data.ctaText ?? 'BUILD YOURS WITH US →';
  const media = data.media ?? 'assets/photo-lifting.jpg';

  const lines = [line1, line2, line3, line4];
  const lineAt = [1.0, 2.0, 3.0, 4.2]; // when each line slams in

  const eyebrowT = Math.max(0, Math.min(1, (t - 0.3) / 0.4));
  const ctaT = window.Easing ? window.Easing.easeOutBack(Math.max(0, Math.min(1, (t - 6.0) / 0.5))) : 1;

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a0b0d', overflow: 'hidden' }}>
      {window.TrimmedMedia && <window.TrimmedMedia
        src={media}
        clipStart={data.media_clipStart}
        clipEnd={data.media_clipEnd}
        muted={!data.media_audio}
        style={{
          position: 'absolute', inset: 0,
          width: '100%', height: '100%', objectFit: 'cover',
          filter: 'brightness(0.25) saturate(0.4) contrast(1.15)',
          transform: `scale(${1.04 + 0.04 * (t / 7)})`,
        }}
      />}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, rgba(10,11,13,0.5) 0%, rgba(10,11,13,0.85) 100%)',
      }}/>

      <div style={{
        position: 'absolute', top: 110, left: 60,
        padding: '8px 16px',
        background: RED,
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: 24, color: '#fff', letterSpacing: '0.16em',
        opacity: eyebrowT,
      }}>// {eyebrow}</div>

      {/* Kinetic lines stacked vertically center-screen */}
      <div style={{
        position: 'absolute',
        top: '50%', left: 60, right: 60,
        transform: 'translateY(-50%)',
        display: 'flex', flexDirection: 'column', gap: 28,
      }}>
        {lines.map((line, i) => {
          const at = lineAt[i];
          const prog = Math.max(0, Math.min(1, (t - at) / 0.45));
          const eased = window.Easing ? window.Easing.easeOutBack(prog) : prog;
          const isAccent = (i + 1) === accentLine;
          return (
            <div key={i} style={{
              fontFamily: 'Anton, sans-serif',
              fontSize: isAccent ? 140 : 100,
              color: isAccent ? RED : '#fff',
              lineHeight: 0.88,
              opacity: eased,
              transform: `translateX(${(1 - eased) * -40}px) scale(${0.85 + 0.15 * eased})`,
              transformOrigin: 'left center',
              letterSpacing: isAccent ? '-0.005em' : '0.005em',
              textShadow: isAccent ? `0 0 28px rgba(196,20,29,0.5)` : '0 4px 14px rgba(0,0,0,0.6)',
            }}>{line}</div>
          );
        })}
      </div>

      <div style={{
        position: 'absolute', bottom: 90, left: 60, right: 60,
        padding: '22px 28px',
        background: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        opacity: ctaT,
        transform: `translateY(${(1 - ctaT) * 16}px)`,
      }}>
        <div style={{ fontFamily: 'Anton, sans-serif', fontSize: 44, color: RED }}>{ctaText}</div>
        <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 16, color: '#0a0b0d', fontWeight: 700, letterSpacing: '0.1em' }}>ATHLETESACCEL.COM</div>
      </div>
    </div>
  );
}

window.ManifestoReel = ManifestoReel;

const MANIFESTO_SPEC = {
  id: 'manifesto',
  name: 'MANIFESTO',
  fields: [
  {
    "key": "duration",
    "label": "Length",
    "type": "slider",
    "default": 8,
    "min": 4,
    "max": 15,
    "step": 0.5,
    "unit": "s"
  },
  {
    "key": "eyebrow",
    "label": "Eyebrow tag",
    "type": "text",
    "default": "OUR MANIFESTO"
  },
  {
    "key": "line1",
    "label": "Line 1",
    "type": "text",
    "default": "TALENT IS GIVEN."
  },
  {
    "key": "line2",
    "label": "Line 2",
    "type": "text",
    "default": "WORK ETHIC IS CHOSEN."
  },
  {
    "key": "line3",
    "label": "Line 3",
    "type": "text",
    "default": "THE EDGE IS BUILT."
  },
  {
    "key": "line4",
    "label": "Line 4",
    "type": "text",
    "default": "WE BUILD EDGES."
  },
  {
    "key": "accentLine",
    "label": "Accent line (1–4)",
    "type": "number",
    "default": 4,
    "step": 1,
    "min": 1,
    "max": 4
  },
  {
    "key": "ctaText",
    "label": "CTA text",
    "type": "text",
    "default": "BUILD YOURS WITH US →"
  },
  {
    "key": "media",
    "label": "Background photo/video",
    "type": "image",
    "default": "assets/photo-lifting.jpg"
  }
],
};
window.MANIFESTO_SPEC = MANIFESTO_SPEC;
