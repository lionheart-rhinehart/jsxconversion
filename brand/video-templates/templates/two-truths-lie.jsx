// TWO TRUTHS ONE LIE — 9:16 — three claims, answer reveals at end
function TwoTruthsLieReel({ data = {} }) {
  const t = window.useTime ? window.useTime() : 0;
  const RED = '#c4141d';
  const GREEN = '#15a34a';
  const eyebrow = data.eyebrow ?? '2 TRUTHS · 1 LIE';
  const title = data.title ?? 'CAN YOU SPOT IT?';
  const claim1 = data.claim1 ?? 'YOUR VERTICAL CAN INCREASE 4-6" IN 90 DAYS.';
  const claim2 = data.claim2 ?? 'SPRINTING DEVELOPS POWER MORE THAN SQUATS.';
  const claim3 = data.claim3 ?? 'HEAVIER WEIGHTS ALWAYS BUILD MORE STRENGTH.';
  const lieIndex = (typeof data.lieIndex === 'number') ? data.lieIndex : 3;
  const lieExplain = data.lieExplain ?? "Bar speed matters more than load. After ~80% 1RM, gains plateau.";
  const ctaText = data.ctaText ?? 'GUESS BEFORE THE REVEAL ↓';

  const eT = Math.max(0, Math.min(1, (t-0.2)/0.4));
  const tiT = window.Easing ? window.Easing.easeOutCubic(Math.max(0, Math.min(1, (t-0.4)/0.5))) : 1;
  const c1T = window.Easing ? window.Easing.easeOutCubic(Math.max(0, Math.min(1, (t-1.0)/0.5))) : 1;
  const c2T = window.Easing ? window.Easing.easeOutCubic(Math.max(0, Math.min(1, (t-1.6)/0.5))) : 1;
  const c3T = window.Easing ? window.Easing.easeOutCubic(Math.max(0, Math.min(1, (t-2.2)/0.5))) : 1;
  const revealAt = 4.2;
  const reveal = t > revealAt;
  const revealProg = window.Easing ? window.Easing.easeOutBack(Math.max(0, Math.min(1, (t-revealAt)/0.6))) : 1;
  const explainT = Math.max(0, Math.min(1, (t-5.0)/0.5));
  const ctaT = window.Easing ? window.Easing.easeOutBack(Math.max(0, Math.min(1, (t-6.0)/0.5))) : 1;

  const Card = ({ idx, txt, op }) => {
    const isLie = reveal && idx === lieIndex;
    const isTruth = reveal && idx !== lieIndex;
    const bg = !reveal ? 'rgba(31,34,39,0.85)' : (isLie ? 'rgba(196,20,29,0.18)' : 'rgba(21,163,74,0.12)');
    const border = !reveal ? 'rgba(255,255,255,0.1)' : (isLie ? RED : GREEN);
    return (
      <div style={{
        padding: '22px 24px',
        background: bg,
        border: `2px solid ${border}`,
        opacity: op,
        transform: `translateX(${(1-op) * -28}px) ${isLie ? `scale(${0.95 + 0.08 * revealProg})` : ''}`,
        boxShadow: isLie ? `0 0 28px rgba(196,20,29,0.5)` : 'none',
        position: 'relative',
        transition: 'background 200ms, border 200ms, box-shadow 200ms',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 48, height: 48,
            background: !reveal ? 'rgba(255,255,255,0.08)' : (isLie ? RED : GREEN),
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'Anton, sans-serif', fontSize: 28, color: '#fff',
            flexShrink: 0,
          }}>{!reveal ? idx : (isLie ? '✗' : '✓')}</div>
          <div style={{ fontFamily: 'Anton, sans-serif', fontSize: 38, color: '#fff', lineHeight: 1.0, letterSpacing: '0.005em' }}>{txt}</div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a0b0d', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 110, left: 60, padding: '8px 16px', background: RED, fontFamily: '"JetBrains Mono", monospace', fontSize: 24, color: '#fff', letterSpacing: '0.16em', opacity: eT }}>// {eyebrow}</div>
      <div style={{ position: 'absolute', top: 210, left: 60, right: 60, fontFamily: 'Anton, sans-serif', fontSize: 130, color: '#fff', lineHeight: 0.88, opacity: tiT }}>{title}</div>
      <div style={{ position: 'absolute', top: 530, left: 60, right: 60, display: 'flex', flexDirection: 'column', gap: 22 }}>
        <Card idx={1} txt={claim1} op={c1T}/>
        <Card idx={2} txt={claim2} op={c2T}/>
        <Card idx={3} txt={claim3} op={c3T}/>
      </div>
      {reveal && (
        <div style={{ position: 'absolute', bottom: 230, left: 60, right: 60, padding: '20px 24px', background: RED, opacity: explainT, transform: `translateY(${(1-explainT)*12}px)` }}>
          <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 14, color: 'rgba(255,255,255,0.85)', letterSpacing: '0.16em', marginBottom: 6 }}>// THE LIE WAS #{lieIndex}</div>
          <div style={{ fontFamily: 'Geist, sans-serif', fontSize: 22, color: '#fff', fontWeight: 500, lineHeight: 1.35 }}>{lieExplain}</div>
        </div>
      )}
      <div style={{ position: 'absolute', bottom: 90, left: 60, right: 60, padding: '20px 26px', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', opacity: ctaT }}>
        <div style={{ fontFamily: 'Anton, sans-serif', fontSize: 38, color: RED }}>{ctaText}</div>
        <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 14, color: '#0a0b0d', fontWeight: 700, letterSpacing: '0.1em' }}>@ATHLETESACCEL</div>
      </div>
    </div>
  );
}
window.TwoTruthsLieReel = TwoTruthsLieReel;
const TWO_TRUTHS_LIE_SPEC = { id:'two-truths-lie', name:'TWO TRUTHS ONE LIE', fields:[
  {key:'duration',label:'Length',type:'slider',default:8,min:4,max:15,step:0.5,unit:'s'},
  {key:'eyebrow',label:'Eyebrow',type:'text',default:'2 TRUTHS · 1 LIE'},
  {key:'title',label:'Title',type:'text',default:'CAN YOU SPOT IT?'},
  {key:'claim1',label:'Claim 1',type:'textarea',default:'YOUR VERTICAL CAN INCREASE 4-6" IN 90 DAYS.'},
  {key:'claim2',label:'Claim 2',type:'textarea',default:'SPRINTING DEVELOPS POWER MORE THAN SQUATS.'},
  {key:'claim3',label:'Claim 3',type:'textarea',default:'HEAVIER WEIGHTS ALWAYS BUILD MORE STRENGTH.'},
  {key:'lieIndex',label:'Lie is # (1/2/3)',type:'number',default:3,min:1,max:3,step:1},
  {key:'lieExplain',label:'Why it\'s a lie',type:'textarea',default:'Bar speed matters more than load. After ~80% 1RM, gains plateau.'},
  {key:'ctaText',label:'CTA',type:'text',default:'GUESS BEFORE THE REVEAL ↓'},
]};
window.TWO_TRUTHS_LIE_SPEC = TWO_TRUTHS_LIE_SPEC;
