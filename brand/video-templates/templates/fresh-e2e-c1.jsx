// FRESH-E2E-C1 — 9:16 Reel — muscle-memory "recording" waveform overlay
// Beat C (reveal the mechanism). A sprint clip runs under a recording-style
// waveform that is tall/sharp at first then FLATTENS as the rep slows — the
// nervous system records the speed that actually happens. Stage-less.

function FreshE2eC1Reel({ data = {} }) {
  const t = window.useTime ? window.useTime() : 0;
  const E = window.Easing || { easeOutCubic: (x) => x };
  const RED = '#c4141d';

  const eyebrow = data.eyebrow ?? 'THE RECORDING';
  const headline = data.headline ?? 'The nervous system records the speed that actually happens. Not the speed you meant.';
  const microscript = data.microscript ?? 'Muscle memory remembers the speed, not just the move.';
  const media = data.media ?? 'assets/photo-running.jpg';

  const clamp = (x) => Math.max(0, Math.min(1, x));
  const eyebrowT = clamp((t - 0.2) / 0.4);
  const headP = E.easeOutCubic(clamp((t - 0.7) / 0.6));
  const microP = E.easeOutCubic(clamp((t - 5.0) / 0.6));
  // Flatten factor: 1 = full amplitude, 0 = flat line. Decays after t=2.
  const flat = 1 - clamp((t - 2.0) / 2.6);

  // Build a static set of bars; amplitude scales by flat + a per-bar wave.
  const bars = 48;
  const waveTop = 980, waveH = 150;
  const arr = [];
  for (let i = 0; i < bars; i++) {
    const seed = Math.abs(Math.sin(i * 12.9898) * 43758.5453) % 1;
    const live = clamp((t * 6 - i) / 6); // sweep reveal left→right
    const amp = (0.25 + seed * 0.75) * flat * live;
    arr.push(amp);
  }

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a0b0d', overflow: 'hidden' }}>
      {window.TrimmedMedia && <window.TrimmedMedia
        src={media} muted
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.32) saturate(0.5) contrast(1.1)' }}
      />}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(10,11,13,0.6) 0%, rgba(10,11,13,0.25) 38%, rgba(10,11,13,0.9) 100%)' }}/>

      <TplText field="eyebrow" data={data}
        base={{ position: 'absolute', top: 120, left: 64 }}
        style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 26, color: '#fff', letterSpacing: '0.16em', background: RED, padding: '8px 16px', opacity: eyebrowT, whiteSpace: 'nowrap' }}
        fitKey={eyebrow}
      >// {eyebrow}</TplText>

      <TplText field="headline" data={data}
        base={{ position: 'absolute', top: 250, left: 64, right: 64 }}
        style={{ fontFamily: 'Anton, sans-serif', fontSize: 82, color: '#fff', lineHeight: 0.95, opacity: headP }}
        maxHeight={460} fitKey={headline}
      >{headline}</TplText>

      {/* Waveform: center line + symmetric bars */}
      <div style={{ position: 'absolute', top: waveTop, left: 64, right: 64, height: waveH * 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {arr.map((amp, i) => (
          <div key={i} style={{
            width: 8, height: Math.max(4, amp * waveH * 2),
            background: amp > 0.5 * (1) ? RED : 'rgba(255,255,255,0.85)',
            borderRadius: 4,
          }}/>
        ))}
      </div>
      <div style={{ position: 'absolute', top: waveTop + waveH, left: 64, right: 64, borderTop: '1px solid rgba(255,255,255,0.2)' }}/>

      <TplText field="microscript" data={data}
        base={{ position: 'absolute', bottom: 150, left: 64, right: 64 }}
        style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 38, color: '#fff', lineHeight: 1.2, opacity: microP, transform: `translateY(${(1 - microP) * 14}px)` }}
        maxHeight={160} fitKey={microscript}
      >{microscript}</TplText>

      {window.ExtrasLayer ? <window.ExtrasLayer data={data} /> : null}
    </div>
  );
}
window.FreshE2eC1Reel = FreshE2eC1Reel;

const FRESH_E2E_C1_SPEC = {
  id: 'fresh-e2e-c1', name: 'C1 — RECORDING WAVEFORM',
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
        "default": "THE RECORDING"
      },
      {
        "key": "headline",
        "label": "Headline",
        "type": "text",
        "default": "The nervous system records the speed that actually happens. Not the speed you meant."
      },
      {
        "key": "microscript",
        "label": "Microscript",
        "type": "text",
        "default": "Muscle memory remembers the speed, not just the move."
      },
      {
        "key": "media",
        "label": "Background clip/photo",
        "type": "image",
        "default": "assets/photo-running.jpg"
      }
    ],
};
window.FRESH_E2E_C1_SPEC = FRESH_E2E_C1_SPEC;
