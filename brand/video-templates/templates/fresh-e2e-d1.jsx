// FRESH-E2E-D1 — 9:16 Reel — sideline emotional, blame lifted line by line
// Beat D (remove the blame). Over a warm coach/athlete frame, three blame-lift
// lines arrive slowly, then the DSI-1 reframe closes. Quiet, declarative, no
// hype. Stage-less.

function FreshE2eD1Reel({ data = {} }) {
  const t = window.useTime ? window.useTime() : 0;
  const E = window.Easing || { easeOutCubic: (x) => x };
  const RED = (window.__BRAND__ && window.__BRAND__.brand_red || '#c4141d');

  const eyebrow = data.eyebrow ?? 'YOUR KID ISN’T THE PROBLEM';
  const line1 = data.line1 ?? 'It was never your kid’s fault.';
  const line2 = data.line2 ?? 'It was never yours.';
  const line3 = data.line3 ?? 'It’s the model every program in town runs.';
  const microscript = data.microscript ?? "They're not falling behind. Their training is pushing them back.";
  const media = data.media ?? 'assets/photo-coach-action.jpg';

  const lines = [line1, line2, line3];
  const at = [0.9, 2.1, 3.3];
  const clamp = (x) => Math.max(0, Math.min(1, x));
  const eyebrowT = clamp((t - 0.2) / 0.4);
  const microP = E.easeOutCubic(clamp((t - 5.0) / 0.7));
  // Slow warm push-in on the frame.
  const zoom = 1.06 + 0.06 * clamp(t / 8);

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a0b0d', overflow: 'hidden' }}>
      {window.TrimmedMedia && <window.TrimmedMedia
        src={media} muted
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.4) saturate(0.7) contrast(1.05)', transform: `scale(${zoom})` }}
      />}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(10,11,13,0.5) 0%, rgba(10,11,13,0.2) 36%, rgba(10,11,13,0.9) 100%)' }}/>

      <TplText field="eyebrow" data={data}
        base={{ position: 'absolute', top: 120, left: 64 }}
        style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 26, color: '#fff', letterSpacing: '0.14em', background: RED, padding: '8px 16px', opacity: eyebrowT, whiteSpace: 'nowrap' }}
        fitKey={eyebrow}
      >// {eyebrow}</TplText>

      {/* Blame-lift lines, large Geist, arriving slowly */}
      <div style={{ position: 'absolute', top: 560, left: 64, right: 64, display: 'flex', flexDirection: 'column', gap: 28 }}>
        {lines.map((line, i) => {
          const p = E.easeOutCubic(clamp((t - at[i]) / 0.7));
          return (
            <div key={i} style={{
              fontFamily: 'Geist, sans-serif', fontWeight: 700, fontSize: 76, color: '#fff', lineHeight: 1.05,
              opacity: p, transform: `translateY(${(1 - p) * 18}px)`,
              textShadow: '0 4px 18px rgba(0,0,0,0.6)',
            }}>{line}</div>
          );
        })}
      </div>

      <TplText field="microscript" data={data}
        base={{ position: 'absolute', bottom: 140, left: 64, right: 64 }}
        style={{ fontFamily: 'Anton, sans-serif', fontSize: 78, color: RED, lineHeight: 0.96, opacity: microP, transform: `translateY(${(1 - microP) * 16}px)`, textShadow: `0 0 28px ${RED}44` }}
        maxHeight={300} fitKey={microscript}
      >{microscript}</TplText>

      {window.ExtrasLayer ? <window.ExtrasLayer data={data} /> : null}
    </div>
  );
}
window.FreshE2eD1Reel = FreshE2eD1Reel;

const FRESH_E2E_D1_SPEC = {
  id: 'fresh-e2e-d1', name: 'D1 — BLAME LIFT (sideline)',
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
        "default": "YOUR KID ISN’T THE PROBLEM"
      },
      {
        "key": "line1",
        "label": "Line 1",
        "type": "text",
        "default": "It was never your kid’s fault."
      },
      {
        "key": "line2",
        "label": "Line 2",
        "type": "text",
        "default": "It was never yours."
      },
      {
        "key": "line3",
        "label": "Line 3",
        "type": "text",
        "default": "It’s the model every program in town runs."
      },
      {
        "key": "microscript",
        "label": "Microscript (red)",
        "type": "text",
        "default": "They're not falling behind. Their training is pushing them back."
      },
      {
        "key": "media",
        "label": "Background photo/clip",
        "type": "image",
        "default": "assets/photo-coach-action.jpg"
      }
    ],
};
window.FRESH_E2E_D1_SPEC = FRESH_E2E_D1_SPEC;
