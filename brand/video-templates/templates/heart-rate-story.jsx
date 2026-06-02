// HEART RATE STORY — 9:16 Reel — uses <HRZones>
function HeartRateStoryReel({ data = {} }) {
  const t = window.useTime ? window.useTime() : 0;
  const RED = '#c4141d';

  const eyebrow = data.eyebrow ?? 'CONDITIONING TRUTH';
  const title1 = data.title1 ?? 'YOUR HEART';
  const title2 = data.title2 ?? 'TELLS THE STORY.';
  const session = data.session ?? '12 MIN · ASSAULT BIKE INTERVALS';
  const peakBpm = (typeof data.peakBpm === 'number') ? data.peakBpm : 178;
  const restBpm = (typeof data.restBpm === 'number') ? data.restBpm : 62;
  const maxBpm = (typeof data.maxBpm === 'number') ? data.maxBpm : 200;
  const insight = data.insight ?? 'If you never touch Zone 5, you never grow Zone 5. Train the top.';
  const ctaText = data.ctaText ?? 'BUILD YOUR ENGINE →';

  const eyebrowT = Math.max(0, Math.min(1, (t - 0.2) / 0.4));
  const titleT = window.Easing ? window.Easing.easeOutCubic(Math.max(0, Math.min(1, (t - 0.5) / 0.5))) : 1;
  const sessT = Math.max(0, Math.min(1, (t - 1.1) / 0.4));
  const chartT = Math.max(0, Math.min(1, (t - 1.4) / 0.4));
  const insightT = Math.max(0, Math.min(1, (t - 4.6) / 0.5));
  const ctaT = window.Easing ? window.Easing.easeOutBack(Math.max(0, Math.min(1, (t - 5.6) / 0.5))) : 1;

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a0b0d', overflow: 'hidden' }}>
      <Eyebrow top={110} fontSize={28}>// {eyebrow}</Eyebrow>
      <div style={{ position: 'absolute', top: 180, left: 60, right: 60, fontFamily: 'Anton, sans-serif', fontSize: 140, color: '#fff', lineHeight: 0.88, opacity: titleT, transform: `translateY(${(1 - titleT) * 16}px)` }}>{title1}<br/><span style={{ color: RED }}>{title2}</span></div>

      <div style={{ position: 'absolute', top: 540, left: 60, padding: '10px 16px', background: RED, fontFamily: '"JetBrains Mono", monospace', fontSize: 22, color: '#fff', letterSpacing: '0.14em', opacity: sessT }}>{session}</div>

      <div style={{ position: 'absolute', top: 640, left: 40, right: 40, height: 800, opacity: chartT, transform: `translateY(${(1 - chartT) * 20}px)`, background: 'rgba(15,17,21,0.85)', border: '1px solid rgba(255,255,255,0.08)' }}>
        {window.HRZones && <window.HRZones peakBpm={peakBpm} restBpm={restBpm} maxBpm={maxBpm} durationLabel={session.split('·')[0]} label="HEART RATE"/>}
      </div>

      <div style={{ position: 'absolute', bottom: 230, left: 60, right: 60, padding: '20px 24px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderLeft: `4px solid ${RED}`, opacity: insightT }}>
        <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 16, color: RED, letterSpacing: '0.14em', marginBottom: 6 }}>// THE TAKEAWAY</div>
        <div style={{ fontFamily: 'Geist, sans-serif', fontSize: 26, color: '#fff', fontWeight: 500, lineHeight: 1.35 }}>{insight}</div>
      </div>

      <div style={{ position: 'absolute', bottom: 90, left: 60, right: 60, padding: '22px 28px', background: RED, display: 'flex', alignItems: 'center', justifyContent: 'space-between', opacity: ctaT }}>
        <div style={{ fontFamily: 'Anton, sans-serif', fontSize: 44, color: '#fff' }}>{ctaText}</div>
        <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 16, color: '#fff', letterSpacing: '0.1em' }}>ATHLETESACCEL.COM</div>
      </div>
    </div>
  );
}
window.HeartRateStoryReel = HeartRateStoryReel;
const HEART_RATE_STORY_SPEC = {
  id: 'heart-rate-story', name: 'HEART RATE STORY',
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
    "default": "CONDITIONING TRUTH"
  },
  {
    "key": "title1",
    "label": "Title 1",
    "type": "text",
    "default": "YOUR HEART"
  },
  {
    "key": "title2",
    "label": "Title 2 (red)",
    "type": "text",
    "default": "TELLS THE STORY."
  },
  {
    "key": "session",
    "label": "Session label",
    "type": "text",
    "default": "12 MIN · ASSAULT BIKE INTERVALS"
  },
  {
    "key": "peakBpm",
    "label": "Peak BPM",
    "type": "number",
    "default": 178,
    "step": 1,
    "min": 60,
    "max": 240
  },
  {
    "key": "restBpm",
    "label": "Rest BPM",
    "type": "number",
    "default": 62,
    "step": 1,
    "min": 30,
    "max": 120
  },
  {
    "key": "maxBpm",
    "label": "Max BPM",
    "type": "number",
    "default": 200,
    "step": 1,
    "min": 100,
    "max": 240
  },
  {
    "key": "insight",
    "label": "Insight",
    "type": "textarea",
    "default": "If you never touch Zone 5, you never grow Zone 5. Train the top."
  },
  {
    "key": "ctaText",
    "label": "CTA",
    "type": "text",
    "default": "BUILD YOUR ENGINE →"
  }
],
};
window.HEART_RATE_STORY_SPEC = HEART_RATE_STORY_SPEC;
