// POSITION RANKINGS — 9:16 Reel — uses <TierList>
function PositionRankingsReel({ data = {} }) {
  const t = window.useTime ? window.useTime() : 0;
  const RED = '#c4141d';

  const eyebrow = data.eyebrow ?? 'OPINIONATED RANKINGS';
  const title1 = data.title1 ?? 'EVERY LIFT';
  const title2 = data.title2 ?? 'RANKED.';
  const subhead = data.subhead ?? 'FOR YOUTH ATHLETES · BUILD THE BASE';
  const sCsv = data.sCsv ?? 'DEADLIFT,SPRINT';
  const aCsv = data.aCsv ?? 'BACK SQUAT,BOX JUMP,POWER CLEAN';
  const bCsv = data.bCsv ?? 'BENCH PRESS,ROW';
  const cCsv = data.cCsv ?? 'BICEP CURL,CALF RAISE';
  const sLabel = data.sLabel ?? 'GOD TIER';
  const aLabel = data.aLabel ?? 'GREAT';
  const bLabel = data.bLabel ?? 'GOOD';
  const cLabel = data.cLabel ?? 'SITUATIONAL';
  const ctaText = data.ctaText ?? 'AGREE? DISAGREE? ↓';

  const parseCsv = (s) => s.split(',').map((x) => x.trim()).filter(Boolean);
  const tiers = [
    { tier: 'S', label: sLabel, items: parseCsv(sCsv), color: '#c4141d' },
    { tier: 'A', label: aLabel, items: parseCsv(aCsv), color: '#f59e0b' },
    { tier: 'B', label: bLabel, items: parseCsv(bCsv), color: '#15a34a' },
    { tier: 'C', label: cLabel, items: parseCsv(cCsv), color: '#6b727f' },
  ];

  const eyebrowT = Math.max(0, Math.min(1, (t - 0.2) / 0.4));
  const titleT = window.Easing ? window.Easing.easeOutCubic(Math.max(0, Math.min(1, (t - 0.4) / 0.5))) : 1;
  const subT = Math.max(0, Math.min(1, (t - 0.9) / 0.4));
  const tierT = Math.max(0, Math.min(1, (t - 1.2) / 0.4));
  const ctaT = window.Easing ? window.Easing.easeOutBack(Math.max(0, Math.min(1, (t - 6.0) / 0.5))) : 1;

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a0b0d', overflow: 'hidden' }}>
      <div style={{
        position: 'absolute', top: 110, left: 60,
        padding: '8px 16px', background: RED,
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: 24, color: '#fff', letterSpacing: '0.16em',
        opacity: eyebrowT,
      }}>// {eyebrow}</div>

      <div style={{
        position: 'absolute', top: 200, left: 60, right: 60,
        fontFamily: 'Anton, sans-serif',
        fontSize: 140, color: '#fff', lineHeight: 0.88,
        opacity: titleT, transform: `translateY(${(1 - titleT) * 16}px)`,
      }}>{title1}<br/><span style={{ color: RED }}>{title2}</span></div>

      <div style={{
        position: 'absolute', top: 530, left: 60, right: 60,
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: 22, color: '#969ca7', letterSpacing: '0.12em',
        opacity: subT,
      }}>{subhead}</div>

      <div style={{
        position: 'absolute', top: 620, left: 40, right: 40, bottom: 240,
        opacity: tierT, transform: `translateY(${(1 - tierT) * 20}px)`,
      }}>
        {window.TierList && <window.TierList tiers={tiers}/>}
      </div>

      <div style={{
        position: 'absolute', bottom: 90, left: 60, right: 60,
        padding: '22px 28px', background: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        opacity: ctaT,
      }}>
        <div style={{ fontFamily: 'Anton, sans-serif', fontSize: 44, color: RED }}>{ctaText}</div>
        <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 16, color: '#0a0b0d', fontWeight: 700, letterSpacing: '0.1em' }}>COMMENT BELOW</div>
      </div>
    </div>
  );
}
window.PositionRankingsReel = PositionRankingsReel;
const POSITION_RANKINGS_SPEC = {
  id: 'position-rankings',
  name: 'TIER RANKINGS',
  fields: [
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
    "default": "OPINIONATED RANKINGS"
  },
  {
    "key": "title1",
    "label": "Title 1",
    "type": "text",
    "default": "EVERY LIFT"
  },
  {
    "key": "title2",
    "label": "Title 2 (red)",
    "type": "text",
    "default": "RANKED."
  },
  {
    "key": "subhead",
    "label": "Subhead",
    "type": "text",
    "default": "FOR YOUTH ATHLETES · BUILD THE BASE"
  },
  {
    "key": "sLabel",
    "label": "S tier label",
    "type": "text",
    "default": "GOD TIER"
  },
  {
    "key": "sCsv",
    "label": "S items (comma)",
    "type": "text",
    "default": "DEADLIFT,SPRINT"
  },
  {
    "key": "aLabel",
    "label": "A tier label",
    "type": "text",
    "default": "GREAT"
  },
  {
    "key": "aCsv",
    "label": "A items (comma)",
    "type": "text",
    "default": "BACK SQUAT,BOX JUMP,POWER CLEAN"
  },
  {
    "key": "bLabel",
    "label": "B tier label",
    "type": "text",
    "default": "GOOD"
  },
  {
    "key": "bCsv",
    "label": "B items (comma)",
    "type": "text",
    "default": "BENCH PRESS,ROW"
  },
  {
    "key": "cLabel",
    "label": "C tier label",
    "type": "text",
    "default": "SITUATIONAL"
  },
  {
    "key": "cCsv",
    "label": "C items (comma)",
    "type": "text",
    "default": "BICEP CURL,CALF RAISE"
  },
  {
    "key": "ctaText",
    "label": "CTA text",
    "type": "text",
    "default": "AGREE? DISAGREE? ↓"
  }
],
};
window.POSITION_RANKINGS_SPEC = POSITION_RANKINGS_SPEC;
