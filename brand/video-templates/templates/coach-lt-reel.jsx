// COACH LOWER-THIRDS · REEL — 9:16 conversion (overlay on raw vertical footage)
function CoachLowerThirdsReel({ data = {} }) {
  const t = window.useTime ? window.useTime() : 0;
  const RED = '#c4141d';
  const coachName = data.coachName ?? 'COACH MIKE TORRES';
  const coachTitle = data.coachTitle ?? 'DIRECTOR OF PERFORMANCE';
  const credsCsv = data.credsCsv ?? 'CSCS,USATF L2,15 YRS,NCAA D1';
  const media = data.media ?? 'assets/photo-group-coaching.jpg';
  const creds = credsCsv.split(',').map(s => s.trim()).filter(Boolean);

  let panelX = 0, panelOp = 1;
  if (t < 0.3) { panelX = -100; panelOp = 0; }
  else if (t < 1.0) { const p = window.Easing ? window.Easing.easeOutCubic((t-0.3)/0.7) : 1; panelX = -100 + p * 100; panelOp = p; }
  else if (t < 4.5) { panelX = 0; panelOp = 1; }
  else if (t < 5.5) { const p = window.Easing ? window.Easing.easeInCubic((t-4.5)/1.0) : 1; panelX = -p * 100; panelOp = 1 - p; }
  else { panelX = -100; panelOp = 0; }

  const subWords = coachTitle.split(/\s+/);
  const credT = (i) => Math.max(0, Math.min(1, (t-(1.2 + i*0.12))/0.25));
  const chipT = window.Easing ? window.Easing.easeOutCubic(Math.max(0, Math.min(1, (t-1.8)/0.5))) : 1;
  const barT = window.Easing ? window.Easing.easeOutCubic(Math.max(0, Math.min(1, (t-0.6)/0.6))) : 1;

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a0b0d', overflow: 'hidden' }}>
      <div data-eyebrow style={{ position: 'absolute', top: 90, left: 90, right: 90, fontFamily: '"JetBrains Mono", monospace', fontSize: 34, color: '#c4141d', letterSpacing: '0.06em', textTransform: 'uppercase', zIndex: 5 }}>{data.eyebrow ?? "// ATHLETES ACCELERATION"}</div>
      {window.TrimmedMedia && <window.TrimmedMedia src={media} clipStart={data.media_clipStart} clipEnd={data.media_clipEnd} muted={!data.media_audio} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'contrast(1.05) saturate(0.9) brightness(0.7)' }}/>}

      {/* Helper hint top-right */}
      <div style={{ position: 'absolute', top: 30, right: 30, padding: '8px 12px', border: '1px dashed rgba(255,255,255,0.3)', fontFamily: '"JetBrains Mono", monospace', fontSize: 14, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.1em' }}>OVERLAY ON YOUR FOOTAGE ↓</div>

      {/* Lower thirds (positioned in bottom-half for vertical) */}
      <div style={{ position: 'absolute', left: 60, bottom: 280, display: 'flex', opacity: panelOp, transform: `translateX(${panelX * 6}px)` }}>
        <div style={{ width: 22, background: RED, transform: `scaleY(${barT})`, transformOrigin: 'top', boxShadow: `4px 0 24px rgba(196,20,29,0.4)` }}/>
        <div style={{ padding: '34px 50px', background: 'rgba(10,11,13,0.92)', backdropFilter: 'blur(12px)', borderTop: '1px solid rgba(255,255,255,0.12)', borderRight: '1px solid rgba(255,255,255,0.12)', borderBottom: '1px solid rgba(255,255,255,0.12)', minWidth: 880 }}>
          <div style={{ fontFamily: 'Anton, sans-serif', fontSize: 108, color: '#fff', lineHeight: 0.9, letterSpacing: '0.005em' }}>{coachName}</div>
          <div style={{ marginTop: 20, display: 'flex', gap: 16, alignItems: 'baseline', fontFamily: '"JetBrains Mono", monospace', fontSize: 28, color: '#c2c6cd', letterSpacing: '0.12em' }}>
            {subWords.map((w,i) => <span key={i} style={{ opacity: credT(i), transform: `translateY(${(1-credT(i))*6}px)`, display:'inline-block' }}>{w}</span>)}
          </div>
          <div style={{ marginTop: 22, display: 'flex', gap: 12, opacity: chipT, transform: `translateY(${(1-chipT)*12}px)`, flexWrap: 'wrap' }}>
            {creds.map((c) => (
              <div key={c} style={{ padding: '8px 14px', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', fontFamily: '"JetBrains Mono", monospace', fontSize: 20, color: '#fff', letterSpacing: '0.08em' }}>{c}</div>
            ))}
          </div>
        </div>
      </div>

      {/* AA logo top-left */}
      <div style={{ position: 'absolute', top: 50, left: 50, display: 'flex', alignItems: 'center', gap: 14, opacity: barT }}>
        <img src="assets/logo.png" style={{ width: 60, height: 60, objectFit: 'contain' }}/>
        <div style={{ fontFamily: 'Anton, sans-serif', fontSize: 28, color: '#fff', lineHeight: 0.9 }}>ATHLETES<br/>ACCELERATION</div>
      </div>
    </div>
  );
}
window.CoachLowerThirdsReel = CoachLowerThirdsReel;
const COACH_LT_REEL_SPEC = { id:'coach-lt-reel', name:'COACH LOWER-THIRDS · REEL', fields:[
    {
      "key": "duration",
      "label": "Length",
      "type": "slider",
      "default": 6,
      "min": 4,
      "max": 15,
      "step": 0.5,
      "unit": "s"
    },
    {
      "key": "eyebrow",
      "role": "eyebrow",
      "label": "Eyebrow",
      "type": "text",
      "default": "// ATHLETES ACCELERATION"
    },
    {
      "key": "coachName",
      "label": "Coach name",
      "type": "text",
      "default": "COACH MIKE TORRES"
    },
    {
      "key": "coachTitle",
      "label": "Title (typed in)",
      "type": "text",
      "default": "DIRECTOR OF PERFORMANCE"
    },
    {
      "key": "credsCsv",
      "label": "Credentials (comma)",
      "type": "text",
      "default": "CSCS,USATF L2,15 YRS,NCAA D1"
    },
    {
      "key": "media",
      "label": "Background photo/video",
      "type": "image",
      "default": "assets/photo-group-coaching.jpg"
    }
  ]};
window.COACH_LT_REEL_SPEC = COACH_LT_REEL_SPEC;
