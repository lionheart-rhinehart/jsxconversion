// DID YOU KNOW — 9:16 — single big fact reveal with source citation
function DidYouKnowReel({ data = {} }) {
  const t = window.useTime ? window.useTime() : 0;
  const RED = (window.__BRAND__ && window.__BRAND__.brand_red || '#c4141d');
  const eyebrow = data.eyebrow ?? 'DID YOU KNOW';
  const factPrefix = data.factPrefix ?? 'YOUTH ATHLETES WHO LIFT';
  const factBig = data.factBig ?? '4× PER WEEK';
  const factSuffix = data.factSuffix ?? 'CUT INJURY RISK BY';
  const factPercent = data.factPercent ?? '68%';
  const sourceLabel = data.sourceLabel ?? 'SOURCE';
  const source = data.source ?? 'BR J SPORTS MED · META-ANALYSIS 2024';
  const insight = data.insight ?? 'Strong tissue handles stress. Untrained tissue breaks.';
  const ctaText = data.ctaText ?? 'BUILD YOUR ARMOR →';

  const eT = Math.max(0, Math.min(1, (t-0.2)/0.4));
  const p1T = window.Easing ? window.Easing.easeOutCubic(Math.max(0, Math.min(1, (t-0.5)/0.5))) : 1;
  const b1T = window.Easing ? window.Easing.easeOutBack(Math.max(0, Math.min(1, (t-1.0)/0.5))) : 1;
  const sT = window.Easing ? window.Easing.easeOutCubic(Math.max(0, Math.min(1, (t-1.6)/0.5))) : 1;
  const pctT = window.Easing ? window.Easing.easeOutBack(Math.max(0, Math.min(1, (t-2.2)/0.6))) : 1;
  const srcT = Math.max(0, Math.min(1, (t-3.4)/0.4));
  const iT = Math.max(0, Math.min(1, (t-4.4)/0.5));
  const ctaT = window.Easing ? window.Easing.easeOutBack(Math.max(0, Math.min(1, (t-5.4)/0.5))) : 1;

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a0b0d', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: -200, right: -150, width: 500, height: 500, background: `radial-gradient(circle, ${RED}33 0%, transparent 60%)`, filter: 'blur(40px)' }}/>
      <Eyebrow top={110} fontSize={24}>// {eyebrow}</Eyebrow>

      <TplText field="factPrefix" data={data} fitKey={factPrefix}
        base={{ position: 'absolute', top: 280, left: 60, right: 60 }}
        style={{ fontFamily: 'Anton, sans-serif', fontSize: 80, color: '#fff', lineHeight: 0.95, opacity: p1T }}
      >{factPrefix}</TplText>
      <TplText field="factBig" data={data} fitKey={factBig}
        base={{ position: 'absolute', top: 440, left: 60, right: 60 }}
        style={{ fontFamily: 'Anton, sans-serif', fontSize: 200, color: RED, lineHeight: 0.85, opacity: b1T, transform: `scale(${0.92 + 0.08*b1T})`, textShadow: `0 0 36px rgba(196,20,29,0.5)` }}
      >{factBig}</TplText>
      <TplText field="factSuffix" data={data} fitKey={factSuffix}
        base={{ position: 'absolute', top: 720, left: 60, right: 60 }}
        style={{ fontFamily: 'Anton, sans-serif', fontSize: 80, color: '#fff', lineHeight: 0.95, opacity: sT }}
      >{factSuffix}</TplText>
      <TplText field="factPercent" data={data} fitKey={factPercent}
        base={{ position: 'absolute', top: 880, left: 60, right: 60 }}
        style={{ fontFamily: 'Anton, sans-serif', fontSize: 320, color: RED, lineHeight: 0.85, opacity: pctT, transform: `scale(${0.85 + 0.15*pctT})`, textShadow: `0 0 48px rgba(196,20,29,0.7)`, letterSpacing: '-0.04em' }}
      >{factPercent}</TplText>

      <div style={{ position: 'absolute', bottom: 360, left: 60, right: 60, padding: '12px 16px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', opacity: srcT, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 14, color: '#15a34a', letterSpacing: '0.16em' }}>// {sourceLabel}</div>
        <TplText field="source" data={data} fitKey={source}
          base={{}} style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 16, color: '#fff', letterSpacing: '0.08em' }}
        >{source}</TplText>
      </div>

      <div style={{ position: 'absolute', bottom: 230, left: 60, right: 60, padding: '18px 22px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderLeft: `4px solid ${RED}`, opacity: iT }}>
        <TplText field="insight" data={data} fitKey={insight}
          base={{}} style={{ fontFamily: 'Geist, sans-serif', fontSize: 26, color: '#fff', fontWeight: 500, lineHeight: 1.35 }}
        >{insight}</TplText>
      </div>
      <div style={{ position: 'absolute', bottom: 90, left: 60, right: 60, padding: '22px 28px', background: RED, display: 'flex', alignItems: 'center', justifyContent: 'space-between', opacity: ctaT }}>
        <TplText field="ctaText" data={data} fitKey={ctaText}
          base={{}} style={{ fontFamily: 'Anton, sans-serif', fontSize: 44, color: '#fff' }}
        >{ctaText}</TplText>
        <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 16, color: '#fff', letterSpacing: '0.1em' }}>ATHLETESACCEL.COM</div>
      </div>
    </div>
  );
}
window.DidYouKnowReel = DidYouKnowReel;
const DID_YOU_KNOW_SPEC = { id:'did-you-know', name:'DID YOU KNOW', fields:[
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
    "label": "Eyebrow",
    "type": "text",
    "default": "DID YOU KNOW"
  },
  {
    "key": "factPrefix",
    "label": "Fact prefix",
    "type": "text",
    "default": "YOUTH ATHLETES WHO LIFT"
  },
  {
    "key": "factBig",
    "label": "Big phrase",
    "type": "text",
    "default": "4× PER WEEK"
  },
  {
    "key": "factSuffix",
    "label": "Fact suffix",
    "type": "text",
    "default": "CUT INJURY RISK BY"
  },
  {
    "key": "factPercent",
    "label": "Percent/headline",
    "type": "text",
    "default": "68%"
  },
  {
    "key": "sourceLabel",
    "label": "Source label",
    "type": "text",
    "default": "SOURCE"
  },
  {
    "key": "source",
    "label": "Source",
    "type": "text",
    "default": "BR J SPORTS MED · META-ANALYSIS 2024"
  },
  {
    "key": "insight",
    "label": "Insight",
    "type": "textarea",
    "default": "Strong tissue handles stress. Untrained tissue breaks."
  },
  {
    "key": "ctaText",
    "label": "CTA",
    "type": "text",
    "default": "BUILD YOUR ARMOR →"
  }
]};
window.DID_YOU_KNOW_SPEC = DID_YOU_KNOW_SPEC;
