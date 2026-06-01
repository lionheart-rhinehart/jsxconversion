// RESULTS RECAP · REEL — 9:16 conversion
function ResultsRecapReel({ data = {} }) {
  const t = window.useTime ? window.useTime() : 0;
  const RED = '#c4141d';
  const GREEN = '#15a34a';
  const eyebrow = data.eyebrow ?? 'SCOREBOARD';
  const dateLabel = data.dateLabel ?? 'WEEKEND · MAY 24';
  const title1 = data.title1 ?? 'OUR ATHLETES';
  const title2 = data.title2 ?? 'HIT.';
  const r1n = data.r1n ?? 'JORDAN K.'; const r1s = data.r1s ?? '34-21'; const r1r = data.r1r ?? 'W'; const r1h = data.r1h ?? 'VARSITY FB · 2 TDs · 110 YDS';
  const r2n = data.r2n ?? 'MAYA R.';   const r2s = data.r2s ?? '3-1';   const r2r = data.r2r ?? 'W'; const r2h = data.r2h ?? 'CLUB SOCCER · HAT TRICK';
  const r3n = data.r3n ?? 'TYLER S.';  const r3s = data.r3s ?? '10.92'; const r3r = data.r3r ?? 'PR'; const r3h = data.r3h ?? 'TRACK · −0.4s SEASON';
  const r4n = data.r4n ?? 'JENNA W.';  const r4s = data.r4s ?? '58-45'; const r4r = data.r4r ?? 'W'; const r4h = data.r4h ?? 'JV BBALL · 18 PTS · 7 REB';
  const ctaText = data.ctaText ?? "WHO'S NEXT? →";
  const ctaMicro = data.ctaMicro ?? 'BUILD YOUR EDGE · ATHLETESACCEL.COM';

  const eT = Math.max(0, Math.min(1, (t-0.2)/0.4));
  const tT = window.Easing ? window.Easing.easeOutCubic(Math.max(0, Math.min(1, (t-0.4)/0.5))) : 1;
  const rowT = (i) => window.Easing ? window.Easing.easeOutCubic(Math.max(0, Math.min(1, (t-(1.2 + i*0.5))/0.45))) : 1;
  const fT = window.Easing ? window.Easing.easeOutCubic(Math.max(0, Math.min(1, (t-5.4)/0.5))) : 1;

  const results = [
    { n: r1n, s: r1s, r: r1r, h: r1h },{ n: r2n, s: r2s, r: r2r, h: r2h },
    { n: r3n, s: r3s, r: r3r, h: r3h },{ n: r4n, s: r4s, r: r4r, h: r4h },
  ];

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a0b0d', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: -200, right: -200, width: 600, height: 600, background: `radial-gradient(circle, ${GREEN}22 0%, transparent 60%)`, filter: 'blur(30px)' }}/>

      <div style={{ position: 'absolute', top: 130, left: 60, right: 60, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 26, color: RED, letterSpacing: '0.18em', opacity: eT }}>// {eyebrow}</div>
        <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 22, color: '#969ca7', letterSpacing: '0.12em', opacity: eT }}>{dateLabel}</div>
      </div>

      <div style={{ position: 'absolute', top: 200, left: 60, right: 60, fontFamily: 'Anton, sans-serif', fontSize: 160, color: '#fff', lineHeight: 0.88, opacity: tT, transform: `translateY(${(1-tT)*16}px)` }}>{title1}<br/><span style={{color:RED}}>{title2}</span></div>

      <div style={{ position: 'absolute', top: 580, left: 60, right: 60, display: 'flex', flexDirection: 'column', gap: 18 }}>
        {results.map((r, i) => {
          const op = rowT(i);
          const isWin = r.r === 'W' || r.r === 'PR';
          return (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 22,
              padding: '24px 28px',
              background: 'rgba(31,34,39,0.85)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderLeft: `5px solid ${isWin ? GREEN : RED}`,
              opacity: op, transform: `translateX(${(1-op)*-26}px)`,
            }}>
              <div style={{
                width: 76, height: 76, background: isWin ? GREEN : RED,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'Anton, sans-serif', fontSize: 42, color: '#fff', flexShrink: 0,
              }}>{r.r}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'Anton, sans-serif', fontSize: 50, color: '#fff', lineHeight: 0.95 }}>{r.n}</div>
                <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 18, color: '#969ca7', letterSpacing: '0.08em', marginTop: 6 }}>{r.h}</div>
              </div>
              <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 48, color: '#fff', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{r.s}</div>
            </div>
          );
        })}
      </div>

      <div style={{ position: 'absolute', bottom: 90, left: 60, right: 60, padding: '24px 28px', background: RED, display: 'flex', alignItems: 'center', justifyContent: 'space-between', opacity: fT, transform: `translateY(${(1-fT)*16}px)` }}>
        <div style={{ fontFamily: 'Anton, sans-serif', fontSize: 52, color: '#fff' }}>{ctaText}</div>
        <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 14, color: '#fff', letterSpacing: '0.1em' }}>{ctaMicro}</div>
      </div>
    </div>
  );
}
window.ResultsRecapReel = ResultsRecapReel;
const RESULTS_RECAP_REEL_SPEC = { id:'results-recap-reel', name:'RESULTS RECAP · REEL', fields:[
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
    "default": "SCOREBOARD"
  },
  {
    "key": "dateLabel",
    "label": "Date label",
    "type": "text",
    "default": "WEEKEND · MAY 24"
  },
  {
    "key": "title1",
    "label": "Title 1",
    "type": "text",
    "default": "OUR ATHLETES"
  },
  {
    "key": "title2",
    "label": "Title 2 (red)",
    "type": "text",
    "default": "HIT."
  },
  {
    "key": "r1n",
    "label": "#1 name",
    "type": "text",
    "default": "JORDAN K."
  },
  {
    "key": "r1s",
    "label": "#1 score",
    "type": "text",
    "default": "34-21"
  },
  {
    "key": "r1r",
    "label": "#1 result",
    "type": "text",
    "default": "W"
  },
  {
    "key": "r1h",
    "label": "#1 highlight",
    "type": "text",
    "default": "VARSITY FB · 2 TDs · 110 YDS"
  },
  {
    "key": "r2n",
    "label": "#2 name",
    "type": "text",
    "default": "MAYA R."
  },
  {
    "key": "r2s",
    "label": "#2 score",
    "type": "text",
    "default": "3-1"
  },
  {
    "key": "r2r",
    "label": "#2 result",
    "type": "text",
    "default": "W"
  },
  {
    "key": "r2h",
    "label": "#2 highlight",
    "type": "text",
    "default": "CLUB SOCCER · HAT TRICK"
  },
  {
    "key": "r3n",
    "label": "#3 name",
    "type": "text",
    "default": "TYLER S."
  },
  {
    "key": "r3s",
    "label": "#3 score",
    "type": "text",
    "default": "10.92"
  },
  {
    "key": "r3r",
    "label": "#3 result",
    "type": "text",
    "default": "PR"
  },
  {
    "key": "r3h",
    "label": "#3 highlight",
    "type": "text",
    "default": "TRACK · −0.4s SEASON"
  },
  {
    "key": "r4n",
    "label": "#4 name",
    "type": "text",
    "default": "JENNA W."
  },
  {
    "key": "r4s",
    "label": "#4 score",
    "type": "text",
    "default": "58-45"
  },
  {
    "key": "r4r",
    "label": "#4 result",
    "type": "text",
    "default": "W"
  },
  {
    "key": "r4h",
    "label": "#4 highlight",
    "type": "text",
    "default": "JV BBALL · 18 PTS · 7 REB"
  },
  {
    "key": "ctaText",
    "label": "CTA",
    "type": "text",
    "default": "WHO'S NEXT? →"
  },
  {
    "key": "ctaMicro",
    "label": "CTA microcopy",
    "type": "text",
    "default": "BUILD YOUR EDGE · ATHLETESACCEL.COM"
  }
]};
window.RESULTS_RECAP_REEL_SPEC = RESULTS_RECAP_REEL_SPEC;
