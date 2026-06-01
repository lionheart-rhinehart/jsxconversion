// BRACKET REEL — 9:16 — uses <Bracket>
function BracketReel({ data = {} }) {
  const t = window.useTime ? window.useTime() : 0;
  const RED = '#c4141d';
  const eyebrow = data.eyebrow ?? 'THE TOURNAMENT';
  const title1 = data.title1 ?? 'WHAT MATTERS';
  const title2 = data.title2 ?? 'MOST?';
  const champion = data.champion ?? 'SPEED';
  const label = data.label ?? 'WHAT BUILDS THE BEST ATHLETE?';
  const m1a = data.m1a ?? 'SPEED'; const m1b = data.m1b ?? 'POWER';
  const m2a = data.m2a ?? 'STRENGTH'; const m2b = data.m2b ?? 'MOBILITY';
  const m3a = data.m3a ?? 'NUTRITION'; const m3b = data.m3b ?? 'SLEEP';
  const m4a = data.m4a ?? 'MINDSET'; const m4b = data.m4b ?? 'RECOVERY';
  const w1 = (typeof data.w1 === 'number') ? data.w1 : 0;
  const w2 = (typeof data.w2 === 'number') ? data.w2 : 0;
  const w3 = (typeof data.w3 === 'number') ? data.w3 : 1;
  const w4 = (typeof data.w4 === 'number') ? data.w4 : 0;
  const sf1 = (typeof data.sf1 === 'number') ? data.sf1 : 0;
  const sf2 = (typeof data.sf2 === 'number') ? data.sf2 : 0;
  const ctaText = data.ctaText ?? 'DEBATE IT IN THE COMMENTS ↓';

  const eT = Math.max(0, Math.min(1, (t - 0.2) / 0.4));
  const tiT = window.Easing ? window.Easing.easeOutCubic(Math.max(0, Math.min(1, (t - 0.4) / 0.5))) : 1;
  const bT = Math.max(0, Math.min(1, (t - 0.9) / 0.4));
  const ctaT = window.Easing ? window.Easing.easeOutBack(Math.max(0, Math.min(1, (t - 5.6) / 0.5))) : 1;

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a0b0d', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 110, left: 60, padding: '8px 16px', background: RED, fontFamily: '"JetBrains Mono", monospace', fontSize: 24, color: '#fff', letterSpacing: '0.16em', opacity: eT }}>// {eyebrow}</div>
      <div style={{ position: 'absolute', top: 200, left: 60, right: 60, fontFamily: 'Anton, sans-serif', fontSize: 150, color: '#fff', lineHeight: 0.88, opacity: tiT }}>{title1}<br/><span style={{color:RED}}>{title2}</span></div>
      <div style={{ position: 'absolute', top: 560, left: 40, right: 40, height: 1050, opacity: bT, background: 'rgba(15,17,21,0.85)', border: '1px solid rgba(255,255,255,0.08)' }}>
        {window.Bracket && <window.Bracket
          r1={[[m1a,m1b],[m2a,m2b],[m3a,m3b],[m4a,m4b]]}
          r1Winners={[w1,w2,w3,w4]}
          r2Winners={[sf1,sf2]}
          champion={champion}
          label={label}/>}
      </div>
      <div style={{ position: 'absolute', bottom: 90, left: 60, right: 60, padding: '22px 28px', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', opacity: ctaT }}>
        <div style={{ fontFamily: 'Anton, sans-serif', fontSize: 40, color: RED }}>{ctaText}</div>
        <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 14, color: '#0a0b0d', fontWeight: 700, letterSpacing: '0.1em' }}>@ATHLETESACCEL</div>
      </div>
    </div>
  );
}
window.BracketReel = BracketReel;
const BRACKET_SPEC = { id:'bracket-reel', name:'BRACKET REEL', fields:[
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
    "default": "THE TOURNAMENT"
  },
  {
    "key": "title1",
    "label": "Title 1",
    "type": "text",
    "default": "WHAT MATTERS"
  },
  {
    "key": "title2",
    "label": "Title 2 (red)",
    "type": "text",
    "default": "MOST?"
  },
  {
    "key": "label",
    "label": "Bracket label",
    "type": "text",
    "default": "WHAT BUILDS THE BEST ATHLETE?"
  },
  {
    "key": "m1a",
    "label": "Match 1 · A",
    "type": "text",
    "default": "SPEED"
  },
  {
    "key": "m1b",
    "label": "Match 1 · B",
    "type": "text",
    "default": "POWER"
  },
  {
    "key": "w1",
    "label": "Match 1 winner (0/1)",
    "type": "number",
    "default": 0,
    "min": 0,
    "max": 1,
    "step": 1
  },
  {
    "key": "m2a",
    "label": "Match 2 · A",
    "type": "text",
    "default": "STRENGTH"
  },
  {
    "key": "m2b",
    "label": "Match 2 · B",
    "type": "text",
    "default": "MOBILITY"
  },
  {
    "key": "w2",
    "label": "Match 2 winner (0/1)",
    "type": "number",
    "default": 0,
    "min": 0,
    "max": 1,
    "step": 1
  },
  {
    "key": "m3a",
    "label": "Match 3 · A",
    "type": "text",
    "default": "NUTRITION"
  },
  {
    "key": "m3b",
    "label": "Match 3 · B",
    "type": "text",
    "default": "SLEEP"
  },
  {
    "key": "w3",
    "label": "Match 3 winner (0/1)",
    "type": "number",
    "default": 1,
    "min": 0,
    "max": 1,
    "step": 1
  },
  {
    "key": "m4a",
    "label": "Match 4 · A",
    "type": "text",
    "default": "MINDSET"
  },
  {
    "key": "m4b",
    "label": "Match 4 · B",
    "type": "text",
    "default": "RECOVERY"
  },
  {
    "key": "w4",
    "label": "Match 4 winner (0/1)",
    "type": "number",
    "default": 0,
    "min": 0,
    "max": 1,
    "step": 1
  },
  {
    "key": "sf1",
    "label": "Semi 1 winner (0/1)",
    "type": "number",
    "default": 0,
    "min": 0,
    "max": 1,
    "step": 1
  },
  {
    "key": "sf2",
    "label": "Semi 2 winner (0/1)",
    "type": "number",
    "default": 0,
    "min": 0,
    "max": 1,
    "step": 1
  },
  {
    "key": "champion",
    "label": "Champion",
    "type": "text",
    "default": "SPEED"
  },
  {
    "key": "ctaText",
    "label": "CTA",
    "type": "text",
    "default": "DEBATE IT IN THE COMMENTS ↓"
  }
]};
window.BRACKET_SPEC = BRACKET_SPEC;
