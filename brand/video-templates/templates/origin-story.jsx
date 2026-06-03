// ORIGIN STORY — 9:16 — timeline year-by-year reveal of brand milestones
function OriginStoryReel({ data = {} }) {
  const t = window.useTime ? window.useTime() : 0;
  const RED = (window.__BRAND__ && window.__BRAND__.brand_red || '#c4141d');
  const eyebrow = data.eyebrow ?? 'OUR STORY';
  const title1 = data.title1 ?? 'STARTED IN';
  const title2 = data.title2 ?? 'A GARAGE.';
  const milestones = [
    { year: data.y1 ?? '2013', text: data.t1 ?? 'ONE GYM. ONE COACH.', op: 0 },
    { year: data.y2 ?? '2017', text: data.t2 ?? 'FIRST D1 COMMIT.', op: 0 },
    { year: data.y3 ?? '2020', text: data.t3 ?? '90-DAY GUARANTEE LAUNCHED.', op: 0 },
    { year: data.y4 ?? '2023', text: data.t4 ?? 'FIVE FACILITIES OPEN.', op: 0 },
    { year: data.y5 ?? '2026', text: data.t5 ?? 'WESTFIELD FLAGSHIP.', op: 0 },
  ];
  const ctaText = data.ctaText ?? "WE'RE JUST WARMING UP →";

  const eT = Math.max(0, Math.min(1, (t-0.2)/0.4));
  const tiT = window.Easing ? window.Easing.easeOutCubic(Math.max(0, Math.min(1, (t-0.4)/0.5))) : 1;
  const msT = (i) => window.Easing ? window.Easing.easeOutCubic(Math.max(0, Math.min(1, (t-(1.4+i*0.6))/0.5))) : 1;
  const ctaT = window.Easing ? window.Easing.easeOutBack(Math.max(0, Math.min(1, (t-5.6)/0.5))) : 1;

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a0b0d', overflow: 'hidden' }}>
      <Eyebrow top={110} fontSize={24}>// {eyebrow}</Eyebrow>
      <div style={{ position: 'absolute', top: 200, left: 60, right: 60, fontFamily: 'Anton, sans-serif', fontSize: 130, color: '#fff', lineHeight: 0.88, opacity: tiT }}>{title1}<br/><span style={{color:RED}}>{title2}</span></div>

      {/* Vertical timeline */}
      <div style={{ position: 'absolute', top: 580, left: 110, bottom: 220, width: 4, background: 'rgba(255,255,255,0.15)' }}/>

      <div style={{ position: 'absolute', top: 560, left: 60, right: 60, display: 'flex', flexDirection: 'column', gap: 36 }}>
        {milestones.map((m, i) => {
          const op = msT(i);
          const isLast = i === milestones.length - 1;
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 24, opacity: op, transform: `translateX(${(1-op)*-20}px)` }}>
              <div style={{ position: 'relative', width: 56, flexShrink: 0, display: 'flex', justifyContent: 'center' }}>
                <div style={{ width: 24, height: 24, background: isLast ? RED : '#fff', border: `4px solid ${isLast ? '#fff' : RED}`, borderRadius: '50%', marginTop: 12, boxShadow: isLast ? `0 0 20px ${RED}` : 'none' }}/>
              </div>
              <div>
                <div style={{ fontFamily: 'Anton, sans-serif', fontSize: 56, color: isLast ? RED : '#fff', lineHeight: 0.85, fontVariantNumeric: 'tabular-nums' }}>{m.year}</div>
                <div style={{ marginTop: 6, fontFamily: 'Anton, sans-serif', fontSize: 38, color: '#fff', lineHeight: 0.95, letterSpacing: '0.005em' }}>{m.text}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ position: 'absolute', bottom: 90, left: 60, right: 60, padding: '22px 28px', background: RED, display: 'flex', alignItems: 'center', justifyContent: 'space-between', opacity: ctaT }}>
        <div style={{ fontFamily: 'Anton, sans-serif', fontSize: 44, color: '#fff' }}>{ctaText}</div>
        <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 16, color: '#fff', letterSpacing: '0.1em' }}>ATHLETESACCEL.COM</div>
      </div>
    </div>
  );
}
window.OriginStoryReel = OriginStoryReel;
const ORIGIN_STORY_SPEC = { id:'origin-story', name:'ORIGIN STORY', fields:[
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
    "label": "Eyebrow",
    "type": "text",
    "default": "OUR STORY"
  },
  {
    "key": "title1",
    "label": "Title 1",
    "type": "text",
    "default": "STARTED IN"
  },
  {
    "key": "title2",
    "label": "Title 2 (red)",
    "type": "text",
    "default": "A GARAGE."
  },
  {
    "key": "y1",
    "label": "Year 1",
    "type": "text",
    "default": "2013"
  },
  {
    "key": "t1",
    "label": "Milestone 1",
    "type": "text",
    "default": "ONE GYM. ONE COACH."
  },
  {
    "key": "y2",
    "label": "Year 2",
    "type": "text",
    "default": "2017"
  },
  {
    "key": "t2",
    "label": "Milestone 2",
    "type": "text",
    "default": "FIRST D1 COMMIT."
  },
  {
    "key": "y3",
    "label": "Year 3",
    "type": "text",
    "default": "2020"
  },
  {
    "key": "t3",
    "label": "Milestone 3",
    "type": "text",
    "default": "90-DAY GUARANTEE LAUNCHED."
  },
  {
    "key": "y4",
    "label": "Year 4",
    "type": "text",
    "default": "2023"
  },
  {
    "key": "t4",
    "label": "Milestone 4",
    "type": "text",
    "default": "FIVE FACILITIES OPEN."
  },
  {
    "key": "y5",
    "label": "Year 5 (red)",
    "type": "text",
    "default": "2026"
  },
  {
    "key": "t5",
    "label": "Milestone 5",
    "type": "text",
    "default": "WESTFIELD FLAGSHIP."
  },
  {
    "key": "ctaText",
    "label": "CTA",
    "type": "text",
    "default": "WE'RE JUST WARMING UP →"
  }
]};
window.ORIGIN_STORY_SPEC = ORIGIN_STORY_SPEC;
