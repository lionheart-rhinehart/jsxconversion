// HYPE INTRO · REEL — 9:16 conversion of 16:9 Hype Intro
function HypeIntroReel({ data = {} }) {
  const t = window.useTime ? window.useTime() : 0;
  const RED = '#c4141d';
  const tag1 = data.tag1 ?? 'THE DRIVE';
  const tag2 = data.tag2 ?? 'IS THEIRS.';
  const tag3 = data.tag3 ?? 'THE ATHLETE';
  const tag4 = data.tag4 ?? 'IS OURS TO BUILD.';
  const guarantee = data.guarantee ?? '+1 MPH · +3" · 90 DAYS';
  const wordmark1 = data.wordmark1 ?? 'ATHLETES';
  const wordmark2 = data.wordmark2 ?? 'ACCELERATION';
  const url = data.url ?? 'ATHLETESACCEL.COM';
  const media1 = data.media1 ?? 'assets/hero-sprint-male.jpg';
  const media2 = data.media2 ?? 'assets/photo-jump-male.jpg';
  const media3 = data.media3 ?? 'assets/photo-squat.jpg';

  const photos = [
    { src: media1, from: 0.3, to: 0.8 },
    { src: media2, from: 0.8, to: 1.3 },
    { src: media3, from: 1.3, to: 1.8 },
  ];

  const logoIn = window.Easing ? window.Easing.easeOutBack(Math.max(0, Math.min(1, (t-1.8)/0.5))) : 1;
  const tag1T = window.Easing ? window.Easing.easeOutCubic(Math.max(0, Math.min(1, (t-2.6)/0.4))) : 1;
  const tag2T = window.Easing ? window.Easing.easeOutCubic(Math.max(0, Math.min(1, (t-2.9)/0.4))) : 1;
  const tag3T = window.Easing ? window.Easing.easeOutCubic(Math.max(0, Math.min(1, (t-3.4)/0.4))) : 1;
  const tag4T = window.Easing ? window.Easing.easeOutCubic(Math.max(0, Math.min(1, (t-3.7)/0.4))) : 1;
  const guarT = window.Easing ? window.Easing.easeOutCubic(Math.max(0, Math.min(1, (t-5.0)/0.4))) : 1;

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a0b0d', overflow: 'hidden' }}>
      {photos.map((p, i) => {
        const active = t >= p.from && t <= p.to + 0.15;
        if (!active) return null;
        const inT = Math.max(0, Math.min(1, (t - p.from) / 0.12));
        const outT = Math.max(0, Math.min(1, (t - p.to) / 0.12));
        const op = inT * (1 - outT);
        const sc = 1.05 + (t - p.from) * 0.04;
        return (
          window.TrimmedMedia && <window.TrimmedMedia key={i} src={p.src} muted style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: op, transform: `scale(${sc})`, filter: 'contrast(1.15) saturate(0.85) brightness(0.95)' }}/>
        );
      })}

      {/* Red flashes */}
      {[0.3, 0.8, 1.3, 1.8].map((cut, i) => {
        const cT = Math.max(0, Math.min(1, (t-cut)/0.12));
        if (cT >= 1) return null;
        return <div key={i} style={{ position: 'absolute', top: 0, bottom: 0, left: `${cT*100-100}%`, width: '120%', background: RED, transform: 'skewX(-15deg)', transformOrigin: 'top left' }}/>;
      })}

      {/* Logo lockup centered */}
      {t > 1.8 && t < 2.8 && (
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: `translate(-50%, -50%) scale(${0.85 + 0.15 * logoIn})`, textAlign: 'center' }}>
          <img src="assets/logo.png" style={{ width: 280, height: 280, objectFit: 'contain', marginBottom: 20 }}/>
          <div style={{ fontFamily: 'Anton, sans-serif', fontSize: 80, color: '#fff', lineHeight: 0.9 }}>{wordmark1}<br/><span style={{color:RED}}>{wordmark2}</span></div>
        </div>
      )}

      {/* Tagline phase */}
      {t > 2.5 && t < 5.6 && (
        <>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(10,11,13,0.78)', opacity: Math.max(0, Math.min(1, (t-2.5)/0.4)) }}/>
          <div style={{ position: 'absolute', top: '50%', left: 60, right: 60, transform: 'translateY(-50%)', textAlign: 'center' }}>
            <div style={{ fontFamily: 'Anton, sans-serif', fontSize: 150, color: '#fff', lineHeight: 0.92, opacity: tag1T, transform: `translateY(${(1-tag1T)*20}px)` }}>{tag1}</div>
            <div style={{ marginTop: 8, fontFamily: 'Anton, sans-serif', fontSize: 150, color: '#fff', lineHeight: 0.92, opacity: tag2T, transform: `translateY(${(1-tag2T)*20}px)` }}>{tag2}</div>
            <div style={{ marginTop: 36, fontFamily: 'Anton, sans-serif', fontSize: 150, color: RED, lineHeight: 0.92, opacity: tag3T, transform: `translateY(${(1-tag3T)*20}px)` }}>{tag3}</div>
            <div style={{ marginTop: 8, fontFamily: 'Anton, sans-serif', fontSize: 150, color: RED, lineHeight: 0.92, opacity: tag4T, transform: `translateY(${(1-tag4T)*20}px)` }}>{tag4}</div>
          </div>
        </>
      )}

      {t > 5.0 && (
        <div style={{ position: 'absolute', bottom: 80, left: 60, right: 60, padding: '24px 28px', background: RED, opacity: guarT }}>
          <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 28, fontWeight: 700, color: '#fff', letterSpacing: '0.06em', textAlign: 'center', marginBottom: 10 }}>{guarantee}</div>
          <div style={{ fontFamily: 'Anton, sans-serif', fontSize: 40, color: '#fff', textAlign: 'center' }}>{url}</div>
        </div>
      )}
    </div>
  );
}
window.HypeIntroReel = HypeIntroReel;
const HYPE_INTRO_REEL_SPEC = { id:'hype-intro-reel', name:'HYPE INTRO · REEL', fields:[
  {key:'duration',label:'Length',type:'slider',default:6,min:4,max:12,step:0.5,unit:'s'},
  {key:'tag1',label:'Tag line 1 (white)',type:'text',default:'THE DRIVE'},
  {key:'tag2',label:'Tag line 2 (white)',type:'text',default:'IS THEIRS.'},
  {key:'tag3',label:'Tag line 3 (red)',type:'text',default:'THE ATHLETE'},
  {key:'tag4',label:'Tag line 4 (red)',type:'text',default:'IS OURS TO BUILD.'},
  {key:'guarantee',label:'Guarantee',type:'text',default:'+1 MPH · +3" · 90 DAYS'},
  {key:'wordmark1',label:'Wordmark (white)',type:'text',default:'ATHLETES'},
  {key:'wordmark2',label:'Wordmark (red)',type:'text',default:'ACCELERATION'},
  {key:'url',label:'URL',type:'text',default:'ATHLETESACCEL.COM'},
  {key:'media1',label:'Cut 1',type:'image',default:'assets/hero-sprint-male.jpg'},
  {key:'media2',label:'Cut 2',type:'image',default:'assets/photo-jump-male.jpg'},
  {key:'media3',label:'Cut 3',type:'image',default:'assets/photo-squat.jpg'},
]};
window.HYPE_INTRO_REEL_SPEC = HYPE_INTRO_REEL_SPEC;
