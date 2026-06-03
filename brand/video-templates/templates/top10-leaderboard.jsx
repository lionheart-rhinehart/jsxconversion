// TOP 10 LEADERBOARD — 9:16 Reel — uses <Leaderboard>
function Top10LeaderboardReel({ data = {} }) {
  const t = window.useTime ? window.useTime() : 0;
  const RED = (window.__BRAND__ && window.__BRAND__.brand_red || '#c4141d');

  const eyebrow = data.eyebrow ?? 'THIS WEEK\'S FASTEST';
  const title1 = data.title1 ?? 'TOP 5';
  const title2 = data.title2 ?? '40 YD DASH.';
  const e1n = data.e1n ?? 'JORDAN K.'; const e1v = data.e1v ?? '4.42'; const e1m = data.e1m ?? 'U17 · FB';
  const e2n = data.e2n ?? 'MAYA R.';   const e2v = data.e2v ?? '4.51'; const e2m = data.e2m ?? 'U16 · TF';
  const e3n = data.e3n ?? 'TYLER S.';  const e3v = data.e3v ?? '4.58'; const e3m = data.e3m ?? 'U17 · SOC';
  const e4n = data.e4n ?? 'JENNA W.';  const e4v = data.e4v ?? '4.65'; const e4m = data.e4m ?? 'U15 · BB';
  const e5n = data.e5n ?? 'CHRIS M.';  const e5v = data.e5v ?? '4.71'; const e5m = data.e5m ?? 'U16 · FB';
  const boardLabel = data.boardLabel ?? '40 YARD DASH · TOP 5';
  const boardUnit = data.boardUnit ?? 's';
  const ctaText = data.ctaText ?? 'NEXT WEEK = YOU.';

  const eyebrowT = Math.max(0, Math.min(1, (t - 0.2) / 0.4));
  const titleT = window.Easing ? window.Easing.easeOutCubic(Math.max(0, Math.min(1, (t - 0.4) / 0.5))) : 1;
  const boardT = Math.max(0, Math.min(1, (t - 1.0) / 0.4));
  const ctaT = window.Easing ? window.Easing.easeOutBack(Math.max(0, Math.min(1, (t - 5.4) / 0.5))) : 1;

  const entries = [
    { name: e1n, value: e1v, meta: e1m },
    { name: e2n, value: e2v, meta: e2m },
    { name: e3n, value: e3v, meta: e3m },
    { name: e4n, value: e4v, meta: e4m },
    { name: e5n, value: e5v, meta: e5m },
  ];

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

      <div style={{
        position: 'absolute', top: 560, left: 40, right: 40, height: 1050,
        opacity: boardT,
        transform: `translateY(${(1 - boardT) * 20}px)`,
        background: 'rgba(15,17,21,0.85)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}>
        {window.Leaderboard && <window.Leaderboard
          entries={entries} label={boardLabel} unit={boardUnit} highlightTop={1}
        />}
      </div>

      <div style={{
        position: 'absolute', bottom: 90, left: 60, right: 60,
        padding: '22px 28px', background: RED,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        opacity: ctaT, transform: `translateY(${(1 - ctaT) * 16}px)`,
      }}>
        <div style={{ fontFamily: 'Anton, sans-serif', fontSize: 44, color: '#fff' }}>{ctaText}</div>
        <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 16, color: '#fff', letterSpacing: '0.1em' }}>BOOK ASSESSMENT</div>
      </div>
    </div>
  );
}
window.Top10LeaderboardReel = Top10LeaderboardReel;
const TOP10_LEADERBOARD_SPEC = {
  id: 'top10-leaderboard',
  name: 'TOP 10 LEADERBOARD',
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
    "default": "THIS WEEK'S FASTEST"
  },
  {
    "key": "title1",
    "label": "Title 1",
    "type": "text",
    "default": "TOP 5"
  },
  {
    "key": "title2",
    "label": "Title 2 (red)",
    "type": "text",
    "default": "40 YD DASH."
  },
  {
    "key": "boardLabel",
    "label": "Board label",
    "type": "text",
    "default": "40 YARD DASH · TOP 5"
  },
  {
    "key": "boardUnit",
    "label": "Unit",
    "type": "text",
    "default": "s"
  },
  {
    "key": "e1n",
    "label": "#1 name",
    "type": "text",
    "default": "JORDAN K."
  },
  {
    "key": "e1v",
    "label": "#1 value",
    "type": "text",
    "default": "4.42"
  },
  {
    "key": "e1m",
    "label": "#1 meta",
    "type": "text",
    "default": "U17 · FB"
  },
  {
    "key": "e2n",
    "label": "#2 name",
    "type": "text",
    "default": "MAYA R."
  },
  {
    "key": "e2v",
    "label": "#2 value",
    "type": "text",
    "default": "4.51"
  },
  {
    "key": "e2m",
    "label": "#2 meta",
    "type": "text",
    "default": "U16 · TF"
  },
  {
    "key": "e3n",
    "label": "#3 name",
    "type": "text",
    "default": "TYLER S."
  },
  {
    "key": "e3v",
    "label": "#3 value",
    "type": "text",
    "default": "4.58"
  },
  {
    "key": "e3m",
    "label": "#3 meta",
    "type": "text",
    "default": "U17 · SOC"
  },
  {
    "key": "e4n",
    "label": "#4 name",
    "type": "text",
    "default": "JENNA W."
  },
  {
    "key": "e4v",
    "label": "#4 value",
    "type": "text",
    "default": "4.65"
  },
  {
    "key": "e4m",
    "label": "#4 meta",
    "type": "text",
    "default": "U15 · BB"
  },
  {
    "key": "e5n",
    "label": "#5 name",
    "type": "text",
    "default": "CHRIS M."
  },
  {
    "key": "e5v",
    "label": "#5 value",
    "type": "text",
    "default": "4.71"
  },
  {
    "key": "e5m",
    "label": "#5 meta",
    "type": "text",
    "default": "U16 · FB"
  },
  {
    "key": "ctaText",
    "label": "CTA text",
    "type": "text",
    "default": "NEXT WEEK = YOU."
  }
],
};
window.TOP10_LEADERBOARD_SPEC = TOP10_LEADERBOARD_SPEC;
