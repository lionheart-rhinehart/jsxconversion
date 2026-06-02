// ATHLETE PROFILE — 9:16 — uses <RadarChart>
function AthleteProfileReel({ data = {} }) {
  const t = window.useTime ? window.useTime() : 0;
  const RED = '#c4141d';
  const eyebrow = data.eyebrow ?? 'ATHLETE PROFILE';
  const title1 = data.title1 ?? 'WHAT WE';
  const title2 = data.title2 ?? 'MEASURE.';
  const athleteName = data.athleteName ?? 'JORDAN K.';
  const athleteMeta = data.athleteMeta ?? 'U17 · FB · CARMEL';
  const speed = (typeof data.speed === 'number') ? data.speed : 88;
  const strength = (typeof data.strength === 'number') ? data.strength : 72;
  const power = (typeof data.power === 'number') ? data.power : 91;
  const agility = (typeof data.agility === 'number') ? data.agility : 78;
  const stamina = (typeof data.stamina === 'number') ? data.stamina : 65;
  const mobility = (typeof data.mobility === 'number') ? data.mobility : 80;
  const insight = data.insight ?? 'We score every athlete on 6 axes. The weak link is the priority.';
  const ctaText = data.ctaText ?? 'GET YOUR BASELINE →';

  const eT = Math.max(0, Math.min(1, (t-0.2)/0.4));
  const tiT = window.Easing ? window.Easing.easeOutCubic(Math.max(0, Math.min(1, (t-0.4)/0.5))) : 1;
  const nT = Math.max(0, Math.min(1, (t-1.0)/0.4));
  const rT = Math.max(0, Math.min(1, (t-1.4)/0.4));
  const iT = Math.max(0, Math.min(1, (t-4.6)/0.5));
  const ctaT = window.Easing ? window.Easing.easeOutBack(Math.max(0, Math.min(1, (t-5.4)/0.5))) : 1;

  const attrs = [
    {label:'SPEED', value: speed},{label:'STRENGTH', value: strength},
    {label:'POWER', value: power},{label:'AGILITY', value: agility},
    {label:'STAMINA', value: stamina},{label:'MOBILITY', value: mobility},
  ];

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a0b0d', overflow: 'hidden' }}>
      <Eyebrow top={110} fontSize={24}>// {eyebrow}</Eyebrow>
      <div style={{ position: 'absolute', top: 200, left: 60, right: 60, fontFamily: 'Anton, sans-serif', fontSize: 150, color: '#fff', lineHeight: 0.88, opacity: tiT }}>{title1}<br/><span style={{color:RED}}>{title2}</span></div>
      <div style={{ position: 'absolute', top: 540, left: 60, right: 60, opacity: nT, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div style={{ fontFamily: 'Anton, sans-serif', fontSize: 56, color: '#fff' }}>{athleteName}</div>
        <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 20, color: '#969ca7', letterSpacing: '0.12em' }}>{athleteMeta}</div>
      </div>
      <div style={{ position: 'absolute', top: 640, left: 40, right: 40, height: 880, opacity: rT, background: 'rgba(15,17,21,0.85)', border: '1px solid rgba(255,255,255,0.08)' }}>
        {window.RadarChart && <window.RadarChart attrs={attrs} athleteName={athleteName}/>}
      </div>
      <div style={{ position: 'absolute', bottom: 230, left: 60, right: 60, padding: '18px 22px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderLeft: `4px solid ${RED}`, opacity: iT }}>
        <div style={{ fontFamily: 'Geist, sans-serif', fontSize: 24, color: '#fff', fontWeight: 500, lineHeight: 1.35 }}>{insight}</div>
      </div>
      <div style={{ position: 'absolute', bottom: 90, left: 60, right: 60, padding: '22px 28px', background: RED, display: 'flex', alignItems: 'center', justifyContent: 'space-between', opacity: ctaT }}>
        <div style={{ fontFamily: 'Anton, sans-serif', fontSize: 44, color: '#fff' }}>{ctaText}</div>
        <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 16, color: '#fff', letterSpacing: '0.1em' }}>BOOK ASSESSMENT</div>
      </div>
    </div>
  );
}
window.AthleteProfileReel = AthleteProfileReel;
const ATHLETE_PROFILE_SPEC = { id:'athlete-profile', name:'ATHLETE PROFILE', fields:[
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
    "default": "ATHLETE PROFILE"
  },
  {
    "key": "title1",
    "label": "Title 1",
    "type": "text",
    "default": "WHAT WE"
  },
  {
    "key": "title2",
    "label": "Title 2 (red)",
    "type": "text",
    "default": "MEASURE."
  },
  {
    "key": "athleteName",
    "label": "Athlete",
    "type": "text",
    "default": "JORDAN K."
  },
  {
    "key": "athleteMeta",
    "label": "Meta",
    "type": "text",
    "default": "U17 · FB · CARMEL"
  },
  {
    "key": "speed",
    "label": "Speed 0-100",
    "type": "number",
    "default": 88,
    "min": 0,
    "max": 100,
    "step": 1
  },
  {
    "key": "strength",
    "label": "Strength 0-100",
    "type": "number",
    "default": 72,
    "min": 0,
    "max": 100,
    "step": 1
  },
  {
    "key": "power",
    "label": "Power 0-100",
    "type": "number",
    "default": 91,
    "min": 0,
    "max": 100,
    "step": 1
  },
  {
    "key": "agility",
    "label": "Agility 0-100",
    "type": "number",
    "default": 78,
    "min": 0,
    "max": 100,
    "step": 1
  },
  {
    "key": "stamina",
    "label": "Stamina 0-100",
    "type": "number",
    "default": 65,
    "min": 0,
    "max": 100,
    "step": 1
  },
  {
    "key": "mobility",
    "label": "Mobility 0-100",
    "type": "number",
    "default": 80,
    "min": 0,
    "max": 100,
    "step": 1
  },
  {
    "key": "insight",
    "label": "Insight",
    "type": "textarea",
    "default": "We score every athlete on 6 axes. The weak link is the priority."
  },
  {
    "key": "ctaText",
    "label": "CTA",
    "type": "text",
    "default": "GET YOUR BASELINE →"
  }
]};
window.ATHLETE_PROFILE_SPEC = ATHLETE_PROFILE_SPEC;
