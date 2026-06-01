// FRESH-E2E-C2 — 9:16 Reel — "slow code" terminal aesthetic
// Beat C. Lines of code type into a terminal over a faint strength-training
// frame; the comment reveals that working harder is writing slower code.
// Stage-less.

function FreshE2eC2Reel({ data = {} }) {
  const t = window.useTime ? window.useTime() : 0;
  const E = window.Easing || { easeOutCubic: (x) => x };
  const RED = '#c4141d';
  const GREEN = '#6da354';

  const eyebrow = data.eyebrow ?? 'SLOW CODE';
  const headline = data.headline ?? 'Working harder is writing slower code.';
  const microscript = data.microscript ?? 'The harder they grind, the deeper the slow groove.';
  const media = data.media ?? 'assets/photo-lifting.jpg';

  const clamp = (x) => Math.max(0, Math.min(1, x));
  const codeLines = [
    { txt: '> athlete.train(effort = MAX)', c: '#969ca7' },
    { txt: '  rep[8].velocity = 0.71 m/s  // -23%', c: '#969ca7' },
    { txt: '  WARNING: pattern encoded at fatigued speed', c: RED },
    { txt: '  nervous_system.default = SLOW', c: RED },
    { txt: '> result: harder work, slower athlete', c: GREEN },
  ];
  const lineAt = [0.8, 1.5, 2.3, 3.1, 4.0];

  const eyebrowT = clamp((t - 0.2) / 0.4);
  const headP = E.easeOutCubic(clamp((t - 4.8) / 0.6));
  const microP = E.easeOutCubic(clamp((t - 5.6) / 0.6));

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a0b0d', overflow: 'hidden' }}>
      {window.TrimmedMedia && <window.TrimmedMedia
        src={media} muted
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.16) saturate(0.3) contrast(1.1)' }}
      />}

      <TplText field="eyebrow" data={data}
        base={{ position: 'absolute', top: 120, left: 64 }}
        style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 26, color: '#fff', letterSpacing: '0.16em', background: RED, padding: '8px 16px', opacity: eyebrowT, whiteSpace: 'nowrap' }}
        fitKey={eyebrow}
      >// {eyebrow}</TplText>

      {/* Terminal panel */}
      <div style={{
        position: 'absolute', top: 300, left: 64, right: 64,
        background: 'rgba(8,9,11,0.82)', border: '1px solid rgba(255,255,255,0.14)',
        padding: '34px 30px', minHeight: 560,
      }}>
        <div style={{ display: 'flex', gap: 10, marginBottom: 28 }}>
          <span style={{ width: 14, height: 14, borderRadius: 7, background: '#3a3d44' }}/>
          <span style={{ width: 14, height: 14, borderRadius: 7, background: '#3a3d44' }}/>
          <span style={{ width: 14, height: 14, borderRadius: 7, background: '#3a3d44' }}/>
          <span style={{ marginLeft: 14, fontFamily: '"JetBrains Mono", monospace', fontSize: 22, color: '#5b606b' }}>velocity-code — bash</span>
        </div>
        {codeLines.map((ln, i) => {
          const p = clamp((t - lineAt[i]) / 0.35);
          return (
            <div key={i} style={{
              fontFamily: '"JetBrains Mono", monospace', fontSize: 34, color: ln.c, lineHeight: 1.5,
              opacity: p, whiteSpace: 'pre-wrap',
            }}>{ln.txt}{p > 0 && p < 1 ? '█' : ''}</div>
          );
        })}
      </div>

      <TplText field="headline" data={data}
        base={{ position: 'absolute', top: 960, left: 64, right: 64 }}
        style={{ fontFamily: 'Anton, sans-serif', fontSize: 96, color: '#fff', lineHeight: 0.95, opacity: headP, transform: `translateY(${(1 - headP) * 16}px)` }}
        maxHeight={320} fitKey={headline}
      >{headline}</TplText>

      <TplText field="microscript" data={data}
        base={{ position: 'absolute', bottom: 150, left: 64, right: 64 }}
        style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 36, color: RED, lineHeight: 1.2, opacity: microP }}
        maxHeight={150} fitKey={microscript}
      >{microscript}</TplText>

      {window.ExtrasLayer ? <window.ExtrasLayer data={data} /> : null}
    </div>
  );
}
window.FreshE2eC2Reel = FreshE2eC2Reel;

const FRESH_E2E_C2_SPEC = {
  id: 'fresh-e2e-c2', name: 'C2 — SLOW CODE TERMINAL',
  fields: [
      {
        "key": "duration",
        "label": "Length",
        "type": "slider",
        "default": 8,
        "min": 5,
        "max": 12,
        "step": 0.5,
        "unit": "s"
      },
      {
        "key": "eyebrow",
        "label": "Eyebrow tag",
        "type": "text",
        "default": "SLOW CODE"
      },
      {
        "key": "headline",
        "label": "Headline",
        "type": "text",
        "default": "Working harder is writing slower code."
      },
      {
        "key": "microscript",
        "label": "Microscript",
        "type": "text",
        "default": "The harder they grind, the deeper the slow groove."
      },
      {
        "key": "media",
        "label": "Background photo/clip",
        "type": "image",
        "default": "assets/photo-lifting.jpg"
      }
    ],
};
window.FRESH_E2E_C2_SPEC = FRESH_E2E_C2_SPEC;
