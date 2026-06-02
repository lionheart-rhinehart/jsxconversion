// HOT TAKE — 9:16 Reel — uses <LivePoll>
// Engagement poll with live-counting vote bars.

function HotTakeReel({ data = {} }) {
  const t = window.useTime ? window.useTime() : 0;
  const RED = '#c4141d';

  const eyebrow = data.eyebrow ?? 'HOT TAKE TUESDAY';
  const title1 = data.title1 ?? 'WHAT MATTERS';
  const title2 = data.title2 ?? 'MOST?';
  const question = data.question ?? 'WHAT BUILDS A BETTER ATHLETE FIRST?';
  const opt1Label = data.opt1Label ?? 'SPEED';
  const opt1Pct = (typeof data.opt1Pct === 'number') ? data.opt1Pct : 47;
  const opt2Label = data.opt2Label ?? 'STRENGTH';
  const opt2Pct = (typeof data.opt2Pct === 'number') ? data.opt2Pct : 31;
  const opt3Label = data.opt3Label ?? 'POWER';
  const opt3Pct = (typeof data.opt3Pct === 'number') ? data.opt3Pct : 22;
  const totalVotes = (typeof data.totalVotes === 'number') ? data.totalVotes : 1247;
  const verdict = data.verdict ?? 'OUR TAKE: SPEED.';
  const reasoning = data.reasoning ?? 'You can\'t play if you can\'t catch up. Speed unlocks every other skill.';
  const ctaText = data.ctaText ?? 'DROP YOUR TAKE ↓';

  const eyebrowT = Math.max(0, Math.min(1, (t - 0.2) / 0.4));
  const titleT = window.Easing ? window.Easing.easeOutCubic(Math.max(0, Math.min(1, (t - 0.5) / 0.5))) : 1;
  const pollT = Math.max(0, Math.min(1, (t - 1.2) / 0.4));
  const verdictT = window.Easing ? window.Easing.easeOutBack(Math.max(0, Math.min(1, (t - 4.4) / 0.5))) : 1;
  const ctaT = window.Easing ? window.Easing.easeOutBack(Math.max(0, Math.min(1, (t - 5.4) / 0.5))) : 1;

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a0b0d', overflow: 'hidden' }}>
      <Eyebrow top={110} fontSize={24}>// {eyebrow}</Eyebrow>

      <div style={{
        position: 'absolute', top: 200, left: 60, right: 60,
        fontFamily: 'Anton, sans-serif',
        fontSize: 150, color: '#fff', lineHeight: 0.88,
        opacity: titleT,
        transform: `translateY(${(1 - titleT) * 16}px)`,
      }}>{title1}<br/><span style={{ color: RED }}>{title2}</span></div>

      {/* Live poll element */}
      <div style={{
        position: 'absolute', top: 580, left: 60, right: 60, height: 720,
        opacity: pollT,
        transform: `translateY(${(1 - pollT) * 24}px)`,
        background: 'rgba(15,17,21,0.85)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}>
        {window.LivePoll && <window.LivePoll
          options={[
            { label: opt1Label, pct: opt1Pct },
            { label: opt2Label, pct: opt2Pct },
            { label: opt3Label, pct: opt3Pct },
          ]}
          totalVotes={totalVotes}
          label={question}
          winnerColor={RED}
        />}
      </div>

      {/* Verdict */}
      <div style={{
        position: 'absolute', bottom: 230, left: 60, right: 60,
        padding: '22px 28px',
        background: RED,
        opacity: verdictT,
        transform: `scale(${0.94 + 0.06 * verdictT})`,
        boxShadow: '0 12px 36px rgba(196,20,29,0.4)',
      }}>
        <div style={{
          fontFamily: 'Anton, sans-serif',
          fontSize: 48, color: '#fff', lineHeight: 0.95, marginBottom: 8,
        }}>{verdict}</div>
        <div style={{
          fontFamily: 'Geist, sans-serif',
          fontSize: 22, color: 'rgba(255,255,255,0.92)', fontWeight: 500, lineHeight: 1.4,
        }}>{reasoning}</div>
      </div>

      <div style={{
        position: 'absolute', bottom: 90, left: 60, right: 60,
        padding: '22px 28px',
        background: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        opacity: ctaT,
        transform: `translateY(${(1 - ctaT) * 16}px)`,
      }}>
        <div style={{ fontFamily: 'Anton, sans-serif', fontSize: 48, color: RED }}>{ctaText}</div>
        <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 16, color: '#0a0b0d', fontWeight: 700, letterSpacing: '0.1em' }}>COMMENT BELOW</div>
      </div>
    </div>
  );
}

window.HotTakeReel = HotTakeReel;

const HOT_TAKE_SPEC = {
  id: 'hot-take',
  name: 'HOT TAKE',
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
    "default": "HOT TAKE TUESDAY"
  },
  {
    "key": "title1",
    "label": "Title line 1",
    "type": "text",
    "default": "WHAT MATTERS"
  },
  {
    "key": "title2",
    "label": "Title line 2 (red)",
    "type": "text",
    "default": "MOST?"
  },
  {
    "key": "question",
    "label": "Poll question",
    "type": "text",
    "default": "WHAT BUILDS A BETTER ATHLETE FIRST?"
  },
  {
    "key": "opt1Label",
    "label": "Option 1 label",
    "type": "text",
    "default": "SPEED"
  },
  {
    "key": "opt1Pct",
    "label": "Option 1 %",
    "type": "number",
    "default": 47,
    "step": 1,
    "min": 0,
    "max": 100
  },
  {
    "key": "opt2Label",
    "label": "Option 2 label",
    "type": "text",
    "default": "STRENGTH"
  },
  {
    "key": "opt2Pct",
    "label": "Option 2 %",
    "type": "number",
    "default": 31,
    "step": 1,
    "min": 0,
    "max": 100
  },
  {
    "key": "opt3Label",
    "label": "Option 3 label",
    "type": "text",
    "default": "POWER"
  },
  {
    "key": "opt3Pct",
    "label": "Option 3 %",
    "type": "number",
    "default": 22,
    "step": 1,
    "min": 0,
    "max": 100
  },
  {
    "key": "totalVotes",
    "label": "Total votes",
    "type": "number",
    "default": 1247,
    "step": 1,
    "min": 0
  },
  {
    "key": "verdict",
    "label": "Verdict headline",
    "type": "text",
    "default": "OUR TAKE: SPEED."
  },
  {
    "key": "reasoning",
    "label": "Reasoning",
    "type": "textarea",
    "default": "You can't play if you can't catch up. Speed unlocks every other skill."
  },
  {
    "key": "ctaText",
    "label": "CTA text",
    "type": "text",
    "default": "DROP YOUR TAKE ↓"
  }
],
};
window.HOT_TAKE_SPEC = HOT_TAKE_SPEC;
