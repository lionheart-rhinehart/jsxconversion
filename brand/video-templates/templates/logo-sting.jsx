// LOGO STING — 16:9 — 3s loop
// Quick brand outro to stamp on the end of any video. Hard cut → red flash
// → logo lockup → URL.

function LogoSting({ data = {} }) {
  const wordmark1 = data.wordmark1 ?? 'ATHLETES';
  const wordmark2 = data.wordmark2 ?? 'ACCELERATION';
  const tagline = data.tagline ?? 'THE DRIVE IS THEIRS. WE BUILD THE ATHLETE.';
  const url = data.url ?? 'ATHLETESACCEL.COM';

  const t = useTime();
  const RED = '#c4141d';

  // 0.0-0.15  : red flash takes screen
  // 0.15-0.5  : flash collapses to a band, logo zooms in
  // 0.5-1.0   : logo settles, wordmark reveals
  // 1.0-2.5   : hold
  // 2.5-3.0   : fade slightly for loop

  const phase1 = Math.max(0, Math.min(1, t / 0.15));
  const flashOp = t < 0.3 ? 1 : Math.max(0, 1 - (t - 0.3) / 0.3);

  const logoIn = Easing.easeOutBack(Math.max(0, Math.min(1, (t - 0.3) / 0.5)));
  const wordmarkT = Easing.easeOutCubic(Math.max(0, Math.min(1, (t - 0.7) / 0.4)));
  const urlT = Easing.easeOutCubic(Math.max(0, Math.min(1, (t - 1.1) / 0.4)));
  const tagT = Easing.easeOutCubic(Math.max(0, Math.min(1, (t - 1.4) / 0.4)));

  const fadeOut = t > 2.6 ? 1 - (t - 2.6) / 0.4 : 1;

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a0b0d', overflow: 'hidden' }}>
      {/* Initial red flash */}
      <div style={{
        position: 'absolute', inset: 0,
        background: RED,
        opacity: flashOp,
        transform: `scaleY(${1 - Math.max(0, (t - 0.15) / 0.35)})`,
        transformOrigin: 'center',
      }}/>

      {/* Two converging red bars */}
      <div style={{
        position: 'absolute',
        top: 0, bottom: 0, left: '50%',
        width: '50%',
        background: RED,
        transform: `translateX(${(1 - Math.max(0, Math.min(1, (t - 0.4) / 0.5))) * 100}%)`,
        opacity: t > 0.4 && t < 0.9 ? 0.18 : 0,
      }}/>
      <div style={{
        position: 'absolute',
        top: 0, bottom: 0, right: '50%',
        width: '50%',
        background: RED,
        transform: `translateX(-${(1 - Math.max(0, Math.min(1, (t - 0.4) / 0.5))) * 100}%)`,
        opacity: t > 0.4 && t < 0.9 ? 0.18 : 0,
      }}/>

      {/* Logo + wordmark centered */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column',
        opacity: fadeOut,
      }}>
        <img src="assets/logo.png" style={{
          width: 220, height: 220, objectFit: 'contain',
          opacity: logoIn,
          transform: `scale(${0.6 + 0.4 * logoIn})`,
        }}/>
        <div style={{
          marginTop: 24,
          fontFamily: 'Anton, sans-serif',
          fontSize: 120, color: '#fff', lineHeight: 0.9,
          letterSpacing: '0.005em',
          opacity: wordmarkT,
          transform: `translateY(${(1 - wordmarkT) * 16}px)`,
          textAlign: 'center',
        }}>{wordmark1} <span style={{color: RED}}>{wordmark2}</span></div>

        <div style={{
          marginTop: 16,
          width: 160 * wordmarkT, height: 4,
          background: RED,
        }}/>

        <div style={{
          marginTop: 28,
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: 28, color: '#969ca7', letterSpacing: '0.18em',
          opacity: tagT,
        }}>{tagline}</div>

        <div style={{
          marginTop: 28,
          padding: '12px 24px',
          background: '#fff',
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: 28, color: '#0a0b0d', fontWeight: 700,
          letterSpacing: '0.12em',
          opacity: urlT,
          transform: `translateY(${(1 - urlT) * 10}px)`,
        }}>{url}</div>
      </div>
    </div>
  );
}

window.LogoSting = LogoSting;

const LOGO_STING_SPEC = {
  id: 'logo-sting',
  name: 'LOGO STING',
  fields: [
  {
    "key": "duration",
    "label": "Length",
    "type": "slider",
    "default": 3,
    "min": 2,
    "max": 8,
    "step": 0.5,
    "unit": "s"
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
    "key": "tagline",
    "label": "Tagline",
    "type": "text",
    "default": "THE DRIVE IS THEIRS. WE BUILD THE ATHLETE."
  },
  {
    "key": "url",
    "label": "URL",
    "type": "text",
    "default": "ATHLETESACCEL.COM"
  }
],
};
window.LOGO_STING_SPEC = LOGO_STING_SPEC;
