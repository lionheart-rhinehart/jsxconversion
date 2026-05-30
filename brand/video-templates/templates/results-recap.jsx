// RESULTS RECAP — 1:1 Feed — 7s loop
// Weekend scoreboard. Highlights AA athletes' game-day performance.

function ResultsRecapSquare({ data = {} }) {
  const eyebrow = data.eyebrow ?? 'SCOREBOARD';
  const dateLabel = data.dateLabel ?? 'WEEKEND · MAY 24';
  const title1 = data.title1 ?? 'OUR ATHLETES';
  const title2 = data.title2 ?? 'HIT.';
  const ctaText = data.ctaText ?? "WHO'S NEXT? →";
  const ctaMicro = data.ctaMicro ?? 'BUILD YOUR EDGE · ATHLETESACCEL.COM';

  const t = useTime();
  const RED = '#c4141d';
  const GREEN = '#15a34a';

  const eyebrowT = Math.max(0, Math.min(1, (t - 0.2) / 0.4));
  const titleT = Easing.easeOutCubic(Math.max(0, Math.min(1, (t - 0.5) / 0.5)));

  const results = [
    { name: 'JORDAN K.',  sport: 'VARSITY FB', score: '34-21', result: 'W', highlight: '2 TDs · 110 YDS' },
    { name: 'MAYA R.',    sport: 'CLUB SOCCER', score: '3-1',  result: 'W', highlight: 'HAT TRICK' },
    { name: 'TYLER S.',   sport: 'TRACK · 100M', score: '10.92', result: 'PR', highlight: '−0.4s SEASON' },
    { name: 'JENNA W.',   sport: 'JV BASKETBALL', score: '58-45', result: 'W', highlight: '18 PTS · 7 REB' },
  ];

  const rowT = (i) => Easing.easeOutCubic(Math.max(0, Math.min(1, (t - (1.4 + i * 0.5)) / 0.45)));

  const footerT = Easing.easeOutCubic(Math.max(0, Math.min(1, (t - 5.4) / 0.5)));

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a0b0d', overflow: 'hidden' }}>
      <div style={{
        position: 'absolute',
        top: -200, right: -200, width: 600, height: 600,
        background: `radial-gradient(circle, ${GREEN}22 0%, transparent 60%)`,
        filter: 'blur(30px)',
      }}/>

      {/* Header */}
      <div style={{
        position: 'absolute', top: 70, left: 70, right: 70,
        display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
      }}>
        <div style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: 22, color: RED, letterSpacing: '0.18em',
          opacity: eyebrowT,
        }}>// {eyebrow}</div>
        <div style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: 18, color: '#969ca7', letterSpacing: '0.12em',
          opacity: eyebrowT,
        }}>{dateLabel}</div>
      </div>

      <div style={{
        position: 'absolute', top: 110, left: 70, right: 70,
        fontFamily: 'Anton, sans-serif',
        fontSize: 110, color: '#fff', lineHeight: 0.85,
        opacity: titleT,
        transform: `translateY(${(1 - titleT) * 16}px)`,
      }}>{title1}<br/><span style={{color: RED}}>{title2}</span></div>

      {/* Result rows */}
      <div style={{
        position: 'absolute', top: 380, left: 70, right: 70,
        display: 'flex', flexDirection: 'column', gap: 14,
      }}>
        {results.map((r, i) => {
          const op = rowT(i);
          const isWin = r.result === 'W' || r.result === 'PR';
          return (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 16,
              padding: '18px 22px',
              background: 'rgba(31,34,39,0.85)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderLeft: `4px solid ${isWin ? GREEN : RED}`,
              opacity: op,
              transform: `translateX(${(1 - op) * -24}px)`,
            }}>
              <div style={{
                width: 56, height: 56,
                background: isWin ? GREEN : RED,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'Anton, sans-serif',
                fontSize: 32, color: '#fff',
                flexShrink: 0,
              }}>{r.result}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontFamily: 'Anton, sans-serif',
                  fontSize: 38, color: '#fff', lineHeight: 0.95,
                }}>{r.name}</div>
                <div style={{
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: 14, color: '#969ca7',
                  letterSpacing: '0.1em', marginTop: 4,
                }}>{r.sport} · {r.highlight}</div>
              </div>
              <div style={{
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: 36, color: '#fff', fontWeight: 700,
                fontVariantNumeric: 'tabular-nums',
              }}>{r.score}</div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div style={{
        position: 'absolute',
        bottom: 80, left: 70, right: 70,
        padding: '20px 24px',
        background: RED,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        opacity: footerT,
        transform: `translateY(${(1 - footerT) * 16}px)`,
      }}>
        <div style={{
          fontFamily: 'Anton, sans-serif',
          fontSize: 42, color: '#fff',
        }}>{ctaText}</div>
        <div style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: 14, color: '#fff', letterSpacing: '0.1em',
        }}>{ctaMicro}</div>
      </div>
    </div>
  );
}

window.ResultsRecapSquare = ResultsRecapSquare;

const RESULTS_RECAP_SPEC = {
  id: 'results-recap',
  name: 'RESULTS RECAP',
  fields: [
  {
    "key": "duration",
    "label": "Length",
    "type": "slider",
    "default": 7,
    "min": 3,
    "max": 15,
    "step": 0.5,
    "unit": "s"
  },
  {
    "key": "eyebrow",
    "label": "Eyebrow tag",
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
    "label": "Title line 1",
    "type": "text",
    "default": "OUR ATHLETES"
  },
  {
    "key": "title2",
    "label": "Title line 2 (red)",
    "type": "text",
    "default": "HIT."
  },
  {
    "key": "ctaText",
    "label": "CTA text",
    "type": "text",
    "default": "WHO'S NEXT? →"
  },
  {
    "key": "ctaMicro",
    "label": "CTA microcopy",
    "type": "text",
    "default": "BUILD YOUR EDGE · ATHLETESACCEL.COM"
  }
],
};
window.RESULTS_RECAP_SPEC = RESULTS_RECAP_SPEC;
