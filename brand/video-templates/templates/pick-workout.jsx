// PICK YOUR WORKOUT — 9:16 Reel — uses <SlotRoll>
// Random workout-of-the-day reveal with slot-machine reels.

function PickYourWorkoutReel({ data = {} }) {
  const t = window.useTime ? window.useTime() : 0;
  const RED = (window.__BRAND__ && window.__BRAND__.brand_red || '#c4141d');

  const eyebrow = data.eyebrow ?? 'TODAY\'S WORKOUT';
  const title1 = data.title1 ?? "DON'T THINK.";
  const title2 = data.title2 ?? 'JUST TRAIN.';
  const slotLabel = data.slotLabel ?? 'TODAY YOU TRAIN';
  const finalLine = data.finalLine ?? "TOMORROW'S WORKOUT? DROPS IN 24 HRS.";
  const pick1 = data.pick1 ?? 'LEGS';
  const pick2 = data.pick2 ?? 'EXPLOSIVE';
  const pick3 = data.pick3 ?? 'TUESDAY';
  const reel1Csv = data.reel1Csv ?? 'LEGS,PUSH,PULL,CORE,SPEED';
  const reel2Csv = data.reel2Csv ?? 'HEAVY,EXPLOSIVE,BUILD,BURN,BLAST';
  const reel3Csv = data.reel3Csv ?? 'MONDAY,TUESDAY,WEDNESDAY,THURSDAY,FRIDAY';
  const ctaText = data.ctaText ?? 'BOOK A SESSION →';

  const reel1 = reel1Csv.split(',').map((s) => s.trim());
  const reel2 = reel2Csv.split(',').map((s) => s.trim());
  const reel3 = reel3Csv.split(',').map((s) => s.trim());

  const eyebrowT = Math.max(0, Math.min(1, (t - 0.2) / 0.4));
  const titleT = window.Easing ? window.Easing.easeOutCubic(Math.max(0, Math.min(1, (t - 0.5) / 0.5))) : 1;
  const slotT = Math.max(0, Math.min(1, (t - 1.2) / 0.4));
  const finalT = window.Easing ? window.Easing.easeOutCubic(Math.max(0, Math.min(1, (t - 5.0) / 0.5))) : 1;
  const ctaT = window.Easing ? window.Easing.easeOutBack(Math.max(0, Math.min(1, (t - 5.8) / 0.5))) : 1;

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a0b0d', overflow: 'hidden' }}>
      {/* Faint diagonal red gradient backdrop */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(circle at 80% 20%, ${RED}22 0%, transparent 60%)`,
      }}/>

      <Eyebrow top={110} fontSize={28}>// {eyebrow}</Eyebrow>

      <div style={{
        position: 'absolute', top: 180, left: 60, right: 60,
        fontFamily: 'Anton, sans-serif',
        fontSize: 150, color: '#fff', lineHeight: 0.88,
        opacity: titleT,
        transform: `translateY(${(1 - titleT) * 16}px)`,
      }}>{title1}<br/><span style={{ color: RED }}>{title2}</span></div>

      {/* Slot roll element */}
      <div style={{
        position: 'absolute', top: 580, left: 60, right: 60, height: 760,
        opacity: slotT,
        transform: `translateY(${(1 - slotT) * 24}px)`,
        background: 'rgba(15,17,21,0.85)',
        border: '1px solid rgba(255,255,255,0.08)',
        padding: 18,
        boxSizing: 'border-box',
      }}>
        {window.SlotRoll && <window.SlotRoll
          reel1={reel1} reel2={reel2} reel3={reel3}
          pick1={pick1} pick2={pick2} pick3={pick3}
          label={slotLabel}
        />}
      </div>

      <div style={{
        position: 'absolute', bottom: 230, left: 60, right: 60,
        textAlign: 'center',
        opacity: finalT,
        transform: `translateY(${(1 - finalT) * 12}px)`,
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: 22, color: '#969ca7',
        letterSpacing: '0.12em',
      }}>{finalLine}</div>

      <div style={{
        position: 'absolute', bottom: 90, left: 60, right: 60,
        padding: '22px 28px',
        background: RED,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        opacity: ctaT,
        transform: `translateY(${(1 - ctaT) * 16}px)`,
      }}>
        <div style={{ fontFamily: 'Anton, sans-serif', fontSize: 48, color: '#fff' }}>{ctaText}</div>
        <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 18, color: '#fff', letterSpacing: '0.1em' }}>ATHLETESACCEL.COM</div>
      </div>
    </div>
  );
}

window.PickYourWorkoutReel = PickYourWorkoutReel;

const PICK_WORKOUT_SPEC = {
  id: 'pick-workout',
  name: 'PICK YOUR WORKOUT',
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
    "label": "Eyebrow tag",
    "type": "text",
    "default": "TODAY'S WORKOUT"
  },
  {
    "key": "title1",
    "label": "Title line 1",
    "type": "text",
    "default": "DON'T THINK."
  },
  {
    "key": "title2",
    "label": "Title line 2 (red)",
    "type": "text",
    "default": "JUST TRAIN."
  },
  {
    "key": "slotLabel",
    "label": "Slot label",
    "type": "text",
    "default": "TODAY YOU TRAIN"
  },
  {
    "key": "pick1",
    "label": "Reel 1 result",
    "type": "text",
    "default": "LEGS"
  },
  {
    "key": "pick2",
    "label": "Reel 2 result",
    "type": "text",
    "default": "EXPLOSIVE"
  },
  {
    "key": "pick3",
    "label": "Reel 3 result",
    "type": "text",
    "default": "TUESDAY"
  },
  {
    "key": "reel1Csv",
    "label": "Reel 1 options (comma)",
    "type": "text",
    "default": "LEGS,PUSH,PULL,CORE,SPEED"
  },
  {
    "key": "reel2Csv",
    "label": "Reel 2 options (comma)",
    "type": "text",
    "default": "HEAVY,EXPLOSIVE,BUILD,BURN,BLAST"
  },
  {
    "key": "reel3Csv",
    "label": "Reel 3 options (comma)",
    "type": "text",
    "default": "MONDAY,TUESDAY,WEDNESDAY,THURSDAY,FRIDAY"
  },
  {
    "key": "finalLine",
    "label": "Subline",
    "type": "text",
    "default": "TOMORROW'S WORKOUT? DROPS IN 24 HRS."
  },
  {
    "key": "ctaText",
    "label": "CTA text",
    "type": "text",
    "default": "BOOK A SESSION →"
  }
],
};
window.PICK_WORKOUT_SPEC = PICK_WORKOUT_SPEC;
