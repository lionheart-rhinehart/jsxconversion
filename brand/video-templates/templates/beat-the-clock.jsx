// BEAT THE CLOCK — 9:16 Reel — uses <Stopwatch>
function BeatTheClockReel({ data = {} }) {
  const t = window.useTime ? window.useTime() : 0;
  const RED = '#c4141d';

  const eyebrow = data.eyebrow ?? 'BEAT THE CLOCK';
  const title1 = data.title1 ?? "YOU'VE GOT";
  const title2 = data.title2 ?? '12 SECONDS.';
  const challenge = data.challenge ?? 'BURPEES FOR TIME · 10 REPS';
  const targetSeconds = (typeof data.targetSeconds === 'number') ? data.targetSeconds : 12.43;
  const recordValue = (typeof data.recordValue === 'number') ? data.recordValue : 11.92;
  const recordLabel = data.recordLabel ?? 'GYM RECORD';
  const insight = data.insight ?? "Can you beat 11.92? Drop your time in the comments.";
  const ctaText = data.ctaText ?? 'POST YOUR TIME ↓';

  const eyebrowT = Math.max(0, Math.min(1, (t - 0.2) / 0.4));
  const titleT = window.Easing ? window.Easing.easeOutCubic(Math.max(0, Math.min(1, (t - 0.5) / 0.5))) : 1;
  const challT = Math.max(0, Math.min(1, (t - 1.0) / 0.4));
  const swT = Math.max(0, Math.min(1, (t - 1.4) / 0.4));
  const insightT = Math.max(0, Math.min(1, (t - 4.6) / 0.5));
  const ctaT = window.Easing ? window.Easing.easeOutBack(Math.max(0, Math.min(1, (t - 5.6) / 0.5))) : 1;

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a0b0d', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 110, left: 60, padding: '8px 16px', background: RED, fontFamily: '"JetBrains Mono", monospace', fontSize: 24, color: '#fff', letterSpacing: '0.16em', opacity: eyebrowT }}>// {eyebrow}</div>
      <div style={{ position: 'absolute', top: 200, left: 60, right: 60, fontFamily: 'Anton, sans-serif', fontSize: 150, color: '#fff', lineHeight: 0.88, opacity: titleT }}>{title1}<br/><span style={{ color: RED }}>{title2}</span></div>

      <div style={{ position: 'absolute', top: 540, left: 60, right: 60, padding: '14px 20px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderLeft: `4px solid ${RED}`, fontFamily: '"JetBrains Mono", monospace', fontSize: 24, color: '#fff', letterSpacing: '0.08em', opacity: challT }}>{challenge}</div>

      <div style={{ position: 'absolute', top: 660, left: 40, right: 40, height: 880, opacity: swT, background: 'rgba(15,17,21,0.85)', border: '1px solid rgba(255,255,255,0.08)' }}>
        {window.Stopwatch && <window.Stopwatch targetSeconds={targetSeconds} label="YOUR TIME" recordValue={recordValue} recordLabel={recordLabel}/>}
      </div>

      <div style={{ position: 'absolute', bottom: 230, left: 60, right: 60, padding: '18px 22px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', opacity: insightT }}>
        <div style={{ fontFamily: 'Geist, sans-serif', fontSize: 26, color: '#fff', fontWeight: 500, lineHeight: 1.35 }}>{insight}</div>
      </div>

      <div style={{ position: 'absolute', bottom: 90, left: 60, right: 60, padding: '22px 28px', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', opacity: ctaT }}>
        <div style={{ fontFamily: 'Anton, sans-serif', fontSize: 44, color: RED }}>{ctaText}</div>
        <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 16, color: '#0a0b0d', fontWeight: 700, letterSpacing: '0.1em' }}>COMMENT BELOW</div>
      </div>
    </div>
  );
}
window.BeatTheClockReel = BeatTheClockReel;
const BEAT_THE_CLOCK_SPEC = {
  id: 'beat-the-clock', name: 'BEAT THE CLOCK',
  fields: [
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
    "default": "BEAT THE CLOCK"
  },
  {
    "key": "title1",
    "label": "Title 1",
    "type": "text",
    "default": "YOU'VE GOT"
  },
  {
    "key": "title2",
    "label": "Title 2 (red)",
    "type": "text",
    "default": "12 SECONDS."
  },
  {
    "key": "challenge",
    "label": "Challenge name",
    "type": "text",
    "default": "BURPEES FOR TIME · 10 REPS"
  },
  {
    "key": "targetSeconds",
    "label": "Your time (s)",
    "type": "number",
    "default": 12.43,
    "step": 0.01,
    "min": 0
  },
  {
    "key": "recordValue",
    "label": "Record time (s)",
    "type": "number",
    "default": 11.92,
    "step": 0.01,
    "min": 0
  },
  {
    "key": "recordLabel",
    "label": "Record label",
    "type": "text",
    "default": "GYM RECORD"
  },
  {
    "key": "insight",
    "label": "Prompt text",
    "type": "textarea",
    "default": "Can you beat 11.92? Drop your time in the comments."
  },
  {
    "key": "ctaText",
    "label": "CTA",
    "type": "text",
    "default": "POST YOUR TIME ↓"
  }
],
};
window.BEAT_THE_CLOCK_SPEC = BEAT_THE_CLOCK_SPEC;
