// FRESH-E2E-B2 — 9:16 loop (exported as GIF) — velocity-bar dataviz
// Beat B. Five rep-bars build left to right; each is shorter than the last and
// the run crosses a dashed 10% threshold line, after which bars turn red. Clean
// data aesthetic, no footage. Stage-less; runner renders mp4 then → gif.

function FreshE2eB2Reel({ data = {} }) {
  const t = window.useTime ? window.useTime() : 0;
  const E = window.Easing || { easeOutCubic: (x) => x };
  const RED = (window.__BRAND__ && window.__BRAND__.brand_red || '#c4141d');

  const eyebrow = data.eyebrow ?? 'THE 10% RULE';
  const headline = data.headline ?? '0.92 m/s, then 0.71. A 23% drop.';
  const microscript = data.microscript ?? 'We measure to the hundredth. Everyone else guesses.';

  const clamp = (x) => Math.max(0, Math.min(1, x));
  // Five reps, each a velocity value descending past the 10% threshold (0.83).
  const reps = [0.92, 0.88, 0.83, 0.77, 0.71];
  const threshold = 0.83; // 10% below the fastest (0.92)
  const maxV = 0.95;
  const baseY = 1180, maxH = 560, x0 = 110, gap = 178, barW = 120;

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a0b0d', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: -150, right: -150, width: 520, height: 520, background: `radial-gradient(circle, ${RED}22 0%, transparent 60%)`, filter: 'blur(20px)' }}/>

      <TplText field="eyebrow" data={data}
        base={{ position: 'absolute', top: 120, left: 64 }}
        style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 28, color: '#fff', letterSpacing: '0.16em', background: RED, padding: '8px 16px', whiteSpace: 'nowrap' }}
        fitKey={eyebrow}
      >// {eyebrow}</TplText>

      <TplText field="headline" data={data}
        base={{ position: 'absolute', top: 230, left: 64, right: 64 }}
        style={{ fontFamily: 'Anton, sans-serif', fontSize: 92, color: '#fff', lineHeight: 0.95 }}
        maxHeight={300} fitKey={headline}
      >{headline}</TplText>

      {/* Threshold line */}
      <div style={{
        position: 'absolute', left: 64, right: 64,
        top: baseY - (threshold / maxV) * maxH,
        borderTop: `2px dashed ${RED}`, opacity: clamp((t - 0.5) / 0.5),
      }}/>
      <div style={{
        position: 'absolute', right: 70,
        top: baseY - (threshold / maxV) * maxH - 40,
        fontFamily: '"JetBrains Mono", monospace', fontSize: 22, color: RED, letterSpacing: '0.08em',
        opacity: clamp((t - 0.5) / 0.5),
      }}>10% THRESHOLD</div>

      {/* Rep bars */}
      {reps.map((v, i) => {
        const appear = E.easeOutCubic(clamp((t - (0.6 + i * 0.45)) / 0.4));
        const h = (v / maxV) * maxH * appear;
        const below = v < threshold;
        return (
          <div key={i}>
            <div style={{
              position: 'absolute', left: x0 + i * gap, width: barW, top: baseY - h, height: h,
              background: below ? RED : 'rgba(255,255,255,0.85)',
              boxShadow: below ? `0 0 24px ${RED}66` : 'none',
            }}/>
            <div style={{
              position: 'absolute', left: x0 + i * gap, width: barW, top: baseY + 16, textAlign: 'center',
              fontFamily: '"JetBrains Mono", monospace', fontSize: 26, color: below ? RED : '#969ca7', opacity: appear,
            }}>{v.toFixed(2)}</div>
            <div style={{
              position: 'absolute', left: x0 + i * gap, width: barW, top: baseY + 52, textAlign: 'center',
              fontFamily: '"JetBrains Mono", monospace', fontSize: 20, color: '#5b606b', opacity: appear,
            }}>REP {i + 1}</div>
          </div>
        );
      })}

      <TplText field="microscript" data={data}
        base={{ position: 'absolute', bottom: 130, left: 64, right: 64 }}
        style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 38, color: '#fff', textAlign: 'center', letterSpacing: '0.08em' }}
        fitKey={microscript}
      >{microscript}</TplText>

      {window.ExtrasLayer ? <window.ExtrasLayer data={data} /> : null}
    </div>
  );
}
window.FreshE2eB2Reel = FreshE2eB2Reel;

const FRESH_E2E_B2_SPEC = {
  id: 'fresh-e2e-b2', name: 'B2 — VELOCITY BAR DROP',
  fields: [
      {
        "key": "duration",
        "label": "Length",
        "type": "slider",
        "default": 6,
        "min": 4,
        "max": 10,
        "step": 0.5,
        "unit": "s"
      },
      {
        "key": "eyebrow",
        "label": "Eyebrow tag",
        "type": "text",
        "default": "THE 10% RULE"
      },
      {
        "key": "headline",
        "label": "Headline",
        "type": "text",
        "default": "0.92 m/s, then 0.71. A 23% drop."
      },
      {
        "key": "microscript",
        "label": "Microscript",
        "type": "text",
        "default": "We measure to the hundredth. Everyone else guesses."
      }
    ],
};
window.FRESH_E2E_B2_SPEC = FRESH_E2E_B2_SPEC;
