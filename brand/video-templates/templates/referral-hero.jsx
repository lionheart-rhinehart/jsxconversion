// REFERRAL HERO — 9:16 — credit current athlete for bringing a friend
function ReferralHeroReel({ data = {} }) {
  const t = window.useTime ? window.useTime() : 0;
  const RED = '#c4141d';
  const GREEN = '#15a34a';
  const eyebrow = data.eyebrow ?? 'REFERRAL HERO';
  const title1 = data.title1 ?? 'BRING A FRIEND.';
  const title2 = data.title2 ?? 'GET A MONTH.';
  const hero = data.hero ?? 'JORDAN K.';
  const heroMeta = data.heroMeta ?? 'U17 · 2 REFERRALS THIS MONTH';
  const rewardAmount = data.rewardAmount ?? 'FREE MONTH';
  const rewardSub = data.rewardSub ?? 'PER FRIEND WHO SIGNS UP';
  const friendsLabel = data.friendsLabel ?? "FRIENDS WHO TRAIN";
  const friend1 = data.friend1 ?? 'TYLER S.';
  const friend2 = data.friend2 ?? 'MARCUS R.';
  const ctaText = data.ctaText ?? 'GET YOUR CODE';
  const media = data.media ?? 'assets/hero-sprint-male.jpg';

  const eT = Math.max(0, Math.min(1, (t-0.2)/0.4));
  const tiT = window.Easing ? window.Easing.easeOutCubic(Math.max(0, Math.min(1, (t-0.4)/0.5))) : 1;
  const hT = window.Easing ? window.Easing.easeOutCubic(Math.max(0, Math.min(1, (t-1.0)/0.5))) : 1;
  const rT = window.Easing ? window.Easing.easeOutBack(Math.max(0, Math.min(1, (t-1.6)/0.6))) : 1;
  const f1T = Math.max(0, Math.min(1, (t-3.2)/0.4));
  const f2T = Math.max(0, Math.min(1, (t-3.8)/0.4));
  const ctaT = window.Easing ? window.Easing.easeOutBack(Math.max(0, Math.min(1, (t-5.4)/0.5))) : 1;

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a0b0d', overflow: 'hidden' }}>
      {window.TrimmedMedia && <window.TrimmedMedia src={media} clipStart={data.media_clipStart} clipEnd={data.media_clipEnd} muted={!data.media_audio} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.3) saturate(0.85) contrast(1.1)' }}/>}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(10,11,13,0.55) 0%, rgba(10,11,13,0.95) 100%)' }}/>

      <div style={{ position: 'absolute', top: 110, left: 60, padding: '8px 16px', background: RED, fontFamily: '"JetBrains Mono", monospace', fontSize: 24, color: '#fff', letterSpacing: '0.16em', opacity: eT }}>// {eyebrow}</div>
      <div style={{ position: 'absolute', top: 200, left: 60, right: 60, fontFamily: 'Anton, sans-serif', fontSize: 130, color: '#fff', lineHeight: 0.88, opacity: tiT }}>{title1}<br/><span style={{color:RED}}>{title2}</span></div>

      <div style={{ position: 'absolute', top: 560, left: 60, right: 60, padding: '18px 22px', background: 'rgba(31,34,39,0.85)', borderLeft: `4px solid ${RED}`, opacity: hT }}>
        <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 14, color: RED, letterSpacing: '0.16em', marginBottom: 6 }}>// THIS MONTH'S HERO</div>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <div style={{ fontFamily: 'Anton, sans-serif', fontSize: 64, color: '#fff', lineHeight: 0.95 }}>{hero}</div>
          <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 18, color: '#969ca7', letterSpacing: '0.1em' }}>{heroMeta}</div>
        </div>
      </div>

      <div style={{ position: 'absolute', top: 760, left: 60, right: 60, padding: '32px 28px', background: GREEN, textAlign: 'center', opacity: rT, transform: `scale(${0.92 + 0.08*rT})`, boxShadow: '0 12px 36px rgba(21,163,74,0.4)' }}>
        <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 18, color: 'rgba(255,255,255,0.75)', letterSpacing: '0.18em', marginBottom: 6 }}>HIS REWARD</div>
        <div style={{ fontFamily: 'Anton, sans-serif', fontSize: 140, color: '#fff', lineHeight: 0.85 }}>{rewardAmount}</div>
        <div style={{ marginTop: 8, fontFamily: '"JetBrains Mono", monospace', fontSize: 16, color: '#fff', letterSpacing: '0.12em' }}>{rewardSub}</div>
      </div>

      <div style={{ position: 'absolute', top: 1100, left: 60, right: 60 }}>
        <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 14, color: '#969ca7', letterSpacing: '0.14em', marginBottom: 12 }}>// {friendsLabel}</div>
        {[{n:friend1,o:f1T},{n:friend2,o:f2T}].map((f,i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', marginBottom: 8, opacity: f.o, transform: `translateX(${(1-f.o)*-20}px)` }}>
            <div style={{ width: 36, height: 36, background: RED, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Anton, sans-serif', fontSize: 22, color: '#fff' }}>+</div>
            <div style={{ fontFamily: 'Anton, sans-serif', fontSize: 32, color: '#fff' }}>{f.n}</div>
          </div>
        ))}
      </div>

      <div style={{ position: 'absolute', bottom: 90, left: 60, right: 60, padding: '24px 28px', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', opacity: ctaT }}>
        <div style={{ fontFamily: 'Anton, sans-serif', fontSize: 50, color: RED }}>{ctaText} →</div>
        <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 14, color: '#0a0b0d', fontWeight: 700, letterSpacing: '0.1em' }}>ATHLETESACCEL.COM/REFER</div>
      </div>
    </div>
  );
}
window.ReferralHeroReel = ReferralHeroReel;
const REFERRAL_HERO_SPEC = { id:'referral-hero', name:'REFERRAL HERO', fields:[
  {key:'duration',label:'Length',type:'slider',default:7,min:4,max:15,step:0.5,unit:'s'},
  {key:'eyebrow',label:'Eyebrow',type:'text',default:'REFERRAL HERO'},
  {key:'title1',label:'Title 1',type:'text',default:'BRING A FRIEND.'},
  {key:'title2',label:'Title 2 (red)',type:'text',default:'GET A MONTH.'},
  {key:'hero',label:'Hero name',type:'text',default:'JORDAN K.'},
  {key:'heroMeta',label:'Hero meta',type:'text',default:'U17 · 2 REFERRALS THIS MONTH'},
  {key:'rewardAmount',label:'Reward',type:'text',default:'FREE MONTH'},
  {key:'rewardSub',label:'Reward sub',type:'text',default:'PER FRIEND WHO SIGNS UP'},
  {key:'friendsLabel',label:'Friends label',type:'text',default:'FRIENDS WHO TRAIN'},
  {key:'friend1',label:'Friend 1',type:'text',default:'TYLER S.'},
  {key:'friend2',label:'Friend 2',type:'text',default:'MARCUS R.'},
  {key:'ctaText',label:'CTA',type:'text',default:'GET YOUR CODE'},
  {key:'media',label:'Background photo/video',type:'image',default:'assets/hero-sprint-male.jpg'},
]};
window.REFERRAL_HERO_SPEC = REFERRAL_HERO_SPEC;
