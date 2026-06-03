// LOGO STING · REEL — 9:16 conversion
function LogoStingReel({ data = {} }) {
  const t = window.useTime ? window.useTime() : 0;
  const RED = (window.__BRAND__ && window.__BRAND__.brand_red || '#c4141d');
  const wordmark1 = data.wordmark1 ?? 'ATHLETES';
  const wordmark2 = data.wordmark2 ?? 'ACCELERATION';
  const tagline = data.tagline ?? 'THE DRIVE IS THEIRS.\nWE BUILD THE ATHLETE.';
  const url = data.url ?? 'ATHLETESACCEL.COM';

  const phase1 = Math.max(0, Math.min(1, t / 0.15));
  const flashOp = t < 0.3 ? 1 : Math.max(0, 1 - (t-0.3)/0.3);
  const logoIn = window.Easing ? window.Easing.easeOutBack(Math.max(0, Math.min(1, (t-0.3)/0.5))) : 1;
  const wordmarkT = window.Easing ? window.Easing.easeOutCubic(Math.max(0, Math.min(1, (t-0.7)/0.4))) : 1;
  const urlT = window.Easing ? window.Easing.easeOutCubic(Math.max(0, Math.min(1, (t-1.1)/0.4))) : 1;
  const tagT = window.Easing ? window.Easing.easeOutCubic(Math.max(0, Math.min(1, (t-1.4)/0.4))) : 1;
  const fadeOut = t > 2.6 ? 1 - (t-2.6)/0.4 : 1;

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a0b0d', overflow: 'hidden' }}>
      <Eyebrow top={90} fontSize={34}>{data.eyebrow ?? "{city name} SPORT PARENT"}</Eyebrow>
      <div style={{ position: 'absolute', inset: 0, background: RED, opacity: flashOp, transform: `scaleY(${1 - Math.max(0,(t-0.15)/0.35)})`, transformOrigin: 'center' }}/>

      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', opacity: fadeOut, padding: '0 60px' }}>
        <img src="assets/logo.png" style={{ width: 360, height: 360, objectFit: 'contain', opacity: logoIn, transform: `scale(${0.6 + 0.4 * logoIn})` }}/>
        <div style={{ marginTop: 36, fontFamily: 'Anton, sans-serif', fontSize: 130, color: '#fff', lineHeight: 0.9, opacity: wordmarkT, transform: `translateY(${(1-wordmarkT)*16}px)`, textAlign: 'center' }}>{wordmark1}<br/><span style={{color:RED}}>{wordmark2}</span></div>
        <div style={{ marginTop: 22, width: 200 * wordmarkT, height: 5, background: RED }}/>
        <div style={{ marginTop: 36, fontFamily: '"JetBrains Mono", monospace', fontSize: 30, color: '#969ca7', letterSpacing: '0.18em', opacity: tagT, textAlign: 'center', whiteSpace: 'pre-line' }}>{tagline}</div>
        <div style={{ marginTop: 36, padding: '14px 28px', background: '#fff', fontFamily: '"JetBrains Mono", monospace', fontSize: 32, color: '#0a0b0d', fontWeight: 700, letterSpacing: '0.12em', opacity: urlT, transform: `translateY(${(1-urlT)*10}px)` }}>{url}</div>
      </div>
    </div>
  );
}
window.LogoStingReel = LogoStingReel;
const LOGO_STING_REEL_SPEC = { id:'logo-sting-reel', name:'LOGO STING · REEL', fields:[
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
      "key": "eyebrow",
      "role": "eyebrow",
      "label": "Eyebrow",
      "type": "text",
      "default": "{city name} SPORT PARENT"
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
      "type": "textarea",
      "default": "THE DRIVE IS THEIRS.\nWE BUILD THE ATHLETE."
    },
    {
      "key": "url",
      "label": "URL",
      "type": "text",
      "default": "ATHLETESACCEL.COM"
    }
  ]};
window.LOGO_STING_REEL_SPEC = LOGO_STING_REEL_SPEC;
