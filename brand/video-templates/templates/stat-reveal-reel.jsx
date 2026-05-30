// STAT REVEAL · REEL — 9:16 conversion of 1:1 Stat Reveal
function StatRevealReel({ data = {} }) {
  const t = window.useTime ? window.useTime() : 0;
  const RED = '#c4141d';
  const eyebrow = data.eyebrow ?? '90-DAY GUARANTEE';
  const title1 = data.title1 ?? 'WE GUARANTEE';
  const title2 = data.title2 ?? 'RESULTS.';
  const ctaText = data.ctaText ?? 'BOOK YOUR FREE ASSESSMENT';

  const s1T = window.Easing ? window.Easing.easeOutCubic(Math.max(0, Math.min(1, (t - 0.8) / 0.5))) : 1;
  const s2T = window.Easing ? window.Easing.easeOutCubic(Math.max(0, Math.min(1, (t - 1.6) / 0.5))) : 1;
  const s3T = window.Easing ? window.Easing.easeOutCubic(Math.max(0, Math.min(1, (t - 2.4) / 0.5))) : 1;
  const v1 = (Math.max(0, Math.min(1, (t - 1.0) / 0.7)) * 1).toFixed(0);
  const v2 = (Math.max(0, Math.min(1, (t - 1.8) / 0.7)) * 3).toFixed(0);
  const bannerT = window.Easing ? window.Easing.easeOutBack(Math.max(0, Math.min(1, (t - 4.0) / 0.6))) : 1;
  const eyebrowT = Math.max(0, Math.min(1, (t - 0.2) / 0.3));

  const Stat = ({ value, suffix, label, reveal, accent }) => (
    <div style={{
      padding: '40px 50px',
      borderBottom: '1px solid rgba(255,255,255,0.12)',
      opacity: reveal, transform: `translateY(${(1-reveal)*20}px)`,
    }}>
      <div style={{
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: 220, color: '#fff', fontWeight: 800,
        lineHeight: 0.85, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.03em',
      }}><span style={{ color: accent ? RED : '#fff' }}>+</span>{value}<span style={{ fontSize: 110, color: '#969ca7' }}>{suffix}</span></div>
      <div style={{ marginTop: 18, fontFamily: 'Anton, sans-serif', fontSize: 72, color: '#fff' }}>{label}</div>
    </div>
  );

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a0b0d', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: -200, right: -200, width: 600, height: 600, background: `radial-gradient(circle, ${RED}22 0%, transparent 60%)`, filter: 'blur(20px)' }}/>

      <div style={{ position: 'absolute', top: 130, left: 60, padding: '8px 16px', background: RED, fontFamily: '"JetBrains Mono", monospace', fontSize: 26, color: '#fff', letterSpacing: '0.16em', opacity: eyebrowT }}>// {eyebrow}</div>

      <div style={{ position: 'absolute', top: 230, left: 60, right: 60, fontFamily: 'Anton, sans-serif', fontSize: 170, color: '#fff', lineHeight: 0.9, opacity: eyebrowT }}>{title1}<br/><span style={{color:RED}}>{title2}</span></div>

      <div style={{ position: 'absolute', top: 700, left: 40, right: 40, display: 'flex', flexDirection: 'column' }}>
        <Stat value={v1} suffix=" MPH" label="SPEED" reveal={s1T} accent/>
        <Stat value={v2} suffix={'"'} label="VERTICAL" reveal={s2T} accent/>
        <div style={{ padding: '40px 50px', opacity: s3T, transform: `translateY(${(1-s3T)*20}px)` }}>
          <div style={{ fontFamily: 'Anton, sans-serif', fontSize: 180, color: '#fff', lineHeight: 0.85 }}>OR IT'S <span style={{color:RED}}>FREE.</span></div>
        </div>
      </div>

      <div style={{ position: 'absolute', bottom: 90, left: 60, right: 60, padding: '28px 32px', background: RED, display: 'flex', alignItems: 'center', justifyContent: 'space-between', opacity: bannerT, transform: `translateY(${(1-bannerT)*20}px)` }}>
        <div style={{ fontFamily: 'Anton, sans-serif', fontSize: 50, color: '#fff' }}>{ctaText}</div>
        <div style={{ width: 64, height: 64, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Anton, sans-serif', fontSize: 48, color: RED }}>→</div>
      </div>
    </div>
  );
}
window.StatRevealReel = StatRevealReel;
const STAT_REVEAL_REEL_SPEC = { id:'stat-reveal-reel', name:'STAT REVEAL · REEL', fields:[
  {key:'duration',label:'Length',type:'slider',default:6,min:3,max:15,step:0.5,unit:'s'},
  {key:'eyebrow',label:'Eyebrow',type:'text',default:'90-DAY GUARANTEE'},
  {key:'title1',label:'Title 1',type:'text',default:'WE GUARANTEE'},
  {key:'title2',label:'Title 2 (red)',type:'text',default:'RESULTS.'},
  {key:'ctaText',label:'CTA',type:'text',default:'BOOK YOUR FREE ASSESSMENT'},
]};
window.STAT_REVEAL_REEL_SPEC = STAT_REVEAL_REEL_SPEC;
