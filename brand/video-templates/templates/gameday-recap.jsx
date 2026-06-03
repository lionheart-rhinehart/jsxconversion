// GAME DAY RECAP — 9:16 Reel — uses <Scoreboard>
// Friday night W/L scorecard reel with the LED scoreboard as the centerpiece.

function GameDayRecapReel({ data = {} }) {
  const t = window.useTime ? window.useTime() : 0;
  const RED = (window.__BRAND__ && window.__BRAND__.brand_red || '#c4141d');

  const eyebrow = data.eyebrow ?? 'FRIDAY NIGHT W';
  const title1 = data.title1 ?? 'OUR ATHLETES';
  const title2 = data.title2 ?? 'BALLED OUT.';
  const home = data.home ?? 'CARMEL';
  const away = data.away ?? 'NOBLE.';
  const homeScore = (typeof data.homeScore === 'number') ? data.homeScore : 34;
  const awayScore = (typeof data.awayScore === 'number') ? data.awayScore : 21;
  const period = data.period ?? 'FINAL';
  const clock = data.clock ?? '00:00';
  const highlight1 = data.highlight1 ?? 'JORDAN K.';
  const highlight1Stat = data.highlight1Stat ?? '2 TDs · 110 YDS RUSHING';
  const highlight2 = data.highlight2 ?? 'TYLER S.';
  const highlight2Stat = data.highlight2Stat ?? '12 TACKLES · 1 SACK';
  const ctaText = data.ctaText ?? 'GET FASTER. GET STRONGER.';

  const eyebrowT = Math.max(0, Math.min(1, (t - 0.2) / 0.4));
  const titleT = window.Easing ? window.Easing.easeOutCubic(Math.max(0, Math.min(1, (t - 0.5) / 0.5))) : 1;
  const boardT = Math.max(0, Math.min(1, (t - 1.2) / 0.4));
  const hi1T = window.Easing ? window.Easing.easeOutCubic(Math.max(0, Math.min(1, (t - 4.0) / 0.5))) : 1;
  const hi2T = window.Easing ? window.Easing.easeOutCubic(Math.max(0, Math.min(1, (t - 4.5) / 0.5))) : 1;
  const ctaT = window.Easing ? window.Easing.easeOutBack(Math.max(0, Math.min(1, (t - 5.6) / 0.5))) : 1;

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a0b0d', overflow: 'hidden' }}>
      <Eyebrow top={110} fontSize={24}>// {eyebrow}</Eyebrow>

      <div style={{
        position: 'absolute', top: 200, left: 60, right: 60,
        fontFamily: 'Anton, sans-serif',
        fontSize: 130, color: '#fff', lineHeight: 0.88,
        opacity: titleT,
        transform: `translateY(${(1 - titleT) * 16}px)`,
      }}>{title1}<br/><span style={{ color: RED }}>{title2}</span></div>

      {/* Scoreboard */}
      <div style={{
        position: 'absolute', top: 540, left: 40, right: 40, height: 600,
        opacity: boardT,
        transform: `translateY(${(1 - boardT) * 24}px)`,
      }}>
        {window.Scoreboard && <window.Scoreboard
          home={home} away={away}
          homeFinal={homeScore} awayFinal={awayScore}
          period={period} clock={clock}
        />}
      </div>

      {/* Highlight callouts */}
      <div style={{
        position: 'absolute', bottom: 280, left: 60, right: 60,
        display: 'flex', flexDirection: 'column', gap: 12,
      }}>
        {[{ name: highlight1, stat: highlight1Stat, op: hi1T },
          { name: highlight2, stat: highlight2Stat, op: hi2T }].map((h, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 18,
            padding: '16px 20px',
            background: 'rgba(31,34,39,0.85)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderLeft: `4px solid #15a34a`,
            opacity: h.op,
            transform: `translateX(${(1 - h.op) * -24}px)`,
          }}>
            <div style={{
              width: 46, height: 46,
              background: '#15a34a',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'Anton, sans-serif',
              fontSize: 24, color: '#fff',
            }}>⭐</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontFamily: 'Anton, sans-serif',
                fontSize: 38, color: '#fff', lineHeight: 0.95,
              }}>{h.name}</div>
              <div style={{
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: 16, color: '#969ca7',
                letterSpacing: '0.1em', marginTop: 4,
              }}>{h.stat}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{
        position: 'absolute', bottom: 90, left: 60, right: 60,
        padding: '22px 28px',
        background: RED,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        opacity: ctaT,
        transform: `translateY(${(1 - ctaT) * 16}px)`,
      }}>
        <div style={{ fontFamily: 'Anton, sans-serif', fontSize: 40, color: '#fff' }}>{ctaText}</div>
        <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 16, color: '#fff', letterSpacing: '0.1em' }}>ATHLETESACCEL.COM</div>
      </div>
    </div>
  );
}

window.GameDayRecapReel = GameDayRecapReel;

const GAMEDAY_RECAP_SPEC = {
  id: 'gameday-recap',
  name: 'GAME DAY RECAP',
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
    "default": "FRIDAY NIGHT W"
  },
  {
    "key": "title1",
    "label": "Title line 1",
    "type": "text",
    "default": "OUR ATHLETES"
  },
  {
    "key": "title2",
    "label": "Title line 2 (red)",
    "type": "text",
    "default": "BALLED OUT."
  },
  {
    "key": "home",
    "label": "Home team abbr",
    "type": "text",
    "default": "CARMEL"
  },
  {
    "key": "away",
    "label": "Away team abbr",
    "type": "text",
    "default": "NOBLE."
  },
  {
    "key": "homeScore",
    "label": "Home score",
    "type": "number",
    "default": 34,
    "step": 1,
    "min": 0
  },
  {
    "key": "awayScore",
    "label": "Away score",
    "type": "number",
    "default": 21,
    "step": 1,
    "min": 0
  },
  {
    "key": "period",
    "label": "Period label",
    "type": "text",
    "default": "FINAL"
  },
  {
    "key": "clock",
    "label": "Clock",
    "type": "text",
    "default": "00:00"
  },
  {
    "key": "highlight1",
    "label": "Star 1 name",
    "type": "text",
    "default": "JORDAN K."
  },
  {
    "key": "highlight1Stat",
    "label": "Star 1 stat",
    "type": "text",
    "default": "2 TDs · 110 YDS RUSHING"
  },
  {
    "key": "highlight2",
    "label": "Star 2 name",
    "type": "text",
    "default": "TYLER S."
  },
  {
    "key": "highlight2Stat",
    "label": "Star 2 stat",
    "type": "text",
    "default": "12 TACKLES · 1 SACK"
  },
  {
    "key": "ctaText",
    "label": "CTA text",
    "type": "text",
    "default": "GET FASTER. GET STRONGER."
  }
],
};
window.GAMEDAY_RECAP_SPEC = GAMEDAY_RECAP_SPEC;
