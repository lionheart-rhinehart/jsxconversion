// FRESH-E2E-B1 — 9:16 Reel — "two more" + live velocity readout ticking down
// Beat B (name the moment). A weight-room clip runs under a velocity readout that
// counts DOWN from a fast rep to a slow one, crossing the 10% threshold line.
// Headline frames it; the DSI-1 microscript closes. Stage-less.

function FreshE2eB1Reel({ data = {} }) {
  const t = window.useTime ? window.useTime() : 0;
  const E = window.Easing || { easeOutCubic: (x) => x, easeInOutCubic: (x) => x };
  const RED = '#c4141d';

  const eyebrow = data.eyebrow ?? 'THE VELOCITY DROP';
  const headline = data.headline ?? "Every coach says 'two more.' Here's what those two reps are teaching.";
  const microscript = data.microscript ?? "The tired rep isn't effort. It's instruction.";
  const media = data.media ?? 'assets/photo-lifting.jpg';
  const vFrom = Number(data.vFrom ?? 0.92);
  const vTo = Number(data.vTo ?? 0.71);

  const clamp = (x) => Math.max(0, Math.min(1, x));
  const eyebrowT = clamp((t - 0.2) / 0.4);
  const headP = E.easeOutCubic(clamp((t - 0.7) / 0.6));
  // Readout counts down between t=1.6 and t=4.6
  const countP = E.easeInOutCubic(clamp((t - 1.6) / 3.0));
  const v = (vFrom + (vTo - vFrom) * countP).toFixed(2);
  const belowThreshold = countP > 0.5; // crossed the 10% line midway
  const microP = E.easeOutCubic(clamp((t - 5.0) / 0.6));

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a0b0d', overflow: 'hidden' }}>
      {window.TrimmedMedia && <window.TrimmedMedia
        src={media} muted
        style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
          filter: 'brightness(0.34) saturate(0.5) contrast(1.1)',
        }}
      />}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(10,11,13,0.6) 0%, rgba(10,11,13,0.3) 40%, rgba(10,11,13,0.9) 100%)' }}/>

      <TplText field="eyebrow" data={data}
        base={{ position: 'absolute', top: 120, left: 64 }}
        style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 26, color: '#fff', letterSpacing: '0.16em', background: RED, padding: '8px 16px', opacity: eyebrowT, whiteSpace: 'nowrap' }}
        fitKey={eyebrow}
      >// {eyebrow}</TplText>

      <TplText field="headline" data={data}
        base={{ position: 'absolute', top: 250, left: 64, right: 64 }}
        style={{ fontFamily: 'Anton, sans-serif', fontSize: 84, color: '#fff', lineHeight: 0.95, opacity: headP, transform: `translateY(${(1 - headP) * 16}px)` }}
        maxHeight={420} fitKey={headline}
      >{headline}</TplText>

      {/* Velocity readout panel */}
      <div style={{
        position: 'absolute', top: 980, left: 64, right: 64,
        padding: '28px 34px', background: 'rgba(10,11,13,0.72)',
        border: `1px solid ${belowThreshold ? RED : 'rgba(255,255,255,0.25)'}`,
        display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
      }}>
        <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 28, color: '#969ca7', letterSpacing: '0.1em' }}>BAR VELOCITY</div>
        <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 110, fontWeight: 800, color: belowThreshold ? RED : '#fff', lineHeight: 1, letterSpacing: '-0.02em' }}>
          {v}<span style={{ fontSize: 36, color: '#969ca7' }}> m/s</span>
        </div>
      </div>
      <div style={{
        position: 'absolute', top: 1150, left: 64, right: 64,
        fontFamily: '"JetBrains Mono", monospace', fontSize: 24, letterSpacing: '0.08em',
        color: belowThreshold ? RED : 'rgba(255,255,255,0.5)', opacity: clamp((t - 1.8) / 0.5),
      }}>{belowThreshold ? '— 10% THRESHOLD CROSSED · SET SHOULD HAVE ENDED' : 'TRACKING TO 10% THRESHOLD'}</div>

      <TplText field="microscript" data={data}
        base={{ position: 'absolute', bottom: 150, left: 64, right: 64 }}
        style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 40, color: '#fff', lineHeight: 1.2, opacity: microP, transform: `translateY(${(1 - microP) * 14}px)` }}
        maxHeight={160} fitKey={microscript}
      >{microscript}</TplText>

      {window.ExtrasLayer ? <window.ExtrasLayer data={data} /> : null}
    </div>
  );
}
window.FreshE2eB1Reel = FreshE2eB1Reel;

const FRESH_E2E_B1_SPEC = {
  id: 'fresh-e2e-b1', name: 'B1 — TWO MORE / VELOCITY READOUT',
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
        "default": "THE VELOCITY DROP"
      },
      {
        "key": "headline",
        "label": "Headline",
        "type": "text",
        "default": "Every coach says 'two more.' Here's what those two reps are teaching."
      },
      {
        "key": "microscript",
        "label": "Microscript",
        "type": "text",
        "default": "The tired rep isn't effort. It's instruction."
      },
      {
        "key": "vFrom",
        "label": "Velocity from",
        "type": "number",
        "default": 0.92
      },
      {
        "key": "vTo",
        "label": "Velocity to",
        "type": "number",
        "default": 0.71
      },
      {
        "key": "media",
        "label": "Background clip/photo",
        "type": "image",
        "default": "assets/photo-lifting.jpg"
      }
    ],
};
window.FRESH_E2E_B1_SPEC = FRESH_E2E_B1_SPEC;
