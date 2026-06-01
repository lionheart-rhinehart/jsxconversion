// FRESH-E2E-A1 — 9:16 Reel — kinetic typography, sprint cutting to slow-mo
// Beat A (stop the scroll). Three credit lines stamp in over a sprint clip, then
// the turn line slams red as the footage desaturates/slows. Closes on the
// physics microscript. Stage-less (the campaign runner wraps it).

function FreshE2eA1Reel({ data = {} }) {
  const t = window.useTime ? window.useTime() : 0;
  const E = window.Easing || { easeOutBack: (x) => x, easeOutCubic: (x) => x };
  const RED = '#c4141d';

  const eyebrow = data.eyebrow ?? 'THE LAST REP LIE';
  const line1 = data.line1 ?? 'SHOWS UP.';
  const line2 = data.line2 ?? 'WORKS HARD.';
  const line3 = data.line3 ?? 'NEVER QUITS.';
  const turn = data.turn ?? 'STILL THE SAME SPEED.';
  const microscript = data.microscript ?? "This isn't bad luck. This is physics.";
  const media = data.media ?? 'assets/photo-running.jpg';

  const credits = [line1, line2, line3];
  const at = [0.6, 1.2, 1.8];
  const turnAt = 3.0;
  const microAt = 4.4;

  const clamp = (x) => Math.max(0, Math.min(1, x));
  const eyebrowT = clamp((t - 0.2) / 0.4);
  const turnP = E.easeOutBack(clamp((t - turnAt) / 0.5));
  const microP = E.easeOutCubic(clamp((t - microAt) / 0.6));

  // Footage "decelerates": as the turn lands, drain color + add a slow zoom-out.
  const slow = clamp((t - turnAt) / 1.4);
  const sat = 0.55 - 0.45 * slow;
  const bright = 0.42 - 0.18 * slow;

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a0b0d', overflow: 'hidden' }}>
      {window.TrimmedMedia && <window.TrimmedMedia
        src={media} muted
        style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
          filter: `brightness(${bright}) saturate(${sat}) contrast(1.12)`,
          transform: `scale(${1.12 - 0.12 * slow})`,
        }}
      />}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, rgba(10,11,13,0.55) 0%, rgba(10,11,13,0.2) 38%, rgba(10,11,13,0.88) 100%)',
      }}/>

      <TplText field="eyebrow" data={data}
        base={{ position: 'absolute', top: 120, left: 64 }}
        style={{
          fontFamily: '"JetBrains Mono", monospace', fontSize: 26, color: '#fff',
          letterSpacing: '0.16em', background: RED, padding: '8px 16px', opacity: eyebrowT, whiteSpace: 'nowrap',
        }} fitKey={eyebrow}
      >// {eyebrow}</TplText>

      {/* Credit lines stack from upper third */}
      <div style={{ position: 'absolute', top: 360, left: 64, right: 64, display: 'flex', flexDirection: 'column', gap: 6 }}>
        {credits.map((line, i) => {
          const p = E.easeOutBack(clamp((t - at[i]) / 0.4));
          const fade = turnP > 0 ? (1 - 0.45 * turnP) : 1;
          return (
            <div key={i} style={{
              fontFamily: 'Anton, sans-serif', fontSize: 96, color: '#fff', lineHeight: 0.92,
              opacity: p * fade, transform: `translateX(${(1 - p) * -36}px)`,
              textShadow: '0 4px 16px rgba(0,0,0,0.7)',
            }}>{line}</div>
          );
        })}
      </div>

      <TplText field="turn" data={data}
        base={{ position: 'absolute', top: 760, left: 64, right: 64 }}
        style={{
          fontFamily: 'Anton, sans-serif', fontSize: 150, color: RED, lineHeight: 0.88,
          opacity: turnP, transform: `translateY(${(1 - turnP) * 26}px)`,
          textShadow: '0 0 32px rgba(196,20,29,0.5)',
        }} maxHeight={520} fitKey={turn}
      >{turn}</TplText>

      <TplText field="microscript" data={data}
        base={{ position: 'absolute', bottom: 150, left: 64, right: 64 }}
        style={{
          fontFamily: '"JetBrains Mono", monospace', fontSize: 38, color: '#fff', lineHeight: 1.2,
          letterSpacing: '0.01em', opacity: microP, transform: `translateY(${(1 - microP) * 14}px)`,
        }} maxHeight={160} fitKey={microscript}
      >{microscript}</TplText>

      {window.ExtrasLayer ? <window.ExtrasLayer data={data} /> : null}
    </div>
  );
}
window.FreshE2eA1Reel = FreshE2eA1Reel;

const FRESH_E2E_A1_SPEC = {
  id: 'fresh-e2e-a1', name: 'A1 — GRIND CREDITS (kinetic)',
  fields: [
      {
        "key": "duration",
        "label": "Length",
        "type": "slider",
        "default": 8,
        "min": 4,
        "max": 12,
        "step": 0.5,
        "unit": "s"
      },
      {
        "key": "eyebrow",
        "label": "Eyebrow tag",
        "type": "text",
        "default": "THE LAST REP LIE"
      },
      {
        "key": "line1",
        "label": "Credit 1",
        "type": "text",
        "default": "SHOWS UP."
      },
      {
        "key": "line2",
        "label": "Credit 2",
        "type": "text",
        "default": "WORKS HARD."
      },
      {
        "key": "line3",
        "label": "Credit 3",
        "type": "text",
        "default": "NEVER QUITS."
      },
      {
        "key": "turn",
        "label": "Turn line (red)",
        "type": "text",
        "default": "STILL THE SAME SPEED."
      },
      {
        "key": "microscript",
        "label": "Microscript",
        "type": "text",
        "default": "This isn't bad luck. This is physics."
      },
      {
        "key": "media",
        "label": "Background clip/photo",
        "type": "image",
        "default": "assets/photo-running.jpg"
      }
    ],
};
window.FRESH_E2E_A1_SPEC = FRESH_E2E_A1_SPEC;
