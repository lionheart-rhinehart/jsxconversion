// FRESH-E2E-A3 — 9:16 loop (exported as GIF) — typographic flip
// Beat A. Snaps between two questions on a ~1.5s cadence so the loop reads as a
// back-and-forth: getting faster, or just more tired? Closes each cycle on the
// mono microscript. Stage-less; the runner renders mp4 then ffmpeg → gif.

function FreshE2eA3Reel({ data = {} }) {
  const t = window.useTime ? window.useTime() : 0;
  const RED = (window.__BRAND__ && window.__BRAND__.brand_red || '#c4141d');

  const questionA = data.questionA ?? 'GETTING FASTER?';
  const questionB = data.questionB ?? 'OR JUST MORE TIRED?';
  const microscript = data.microscript ?? 'TRAIN FAST TO BE FAST';

  const clamp = (x) => Math.max(0, Math.min(1, x));
  // Flip cadence: 1.5s per face. Compute phase within a 3s cycle.
  const cycle = 3.0;
  const phase = (t % cycle) / cycle; // 0..1
  const showB = phase >= 0.5;
  const local = showB ? (phase - 0.5) / 0.5 : phase / 0.5; // 0..1 within current face
  // Snap-in then hold: ease the first 25% of each face.
  const snap = clamp(local / 0.25);
  const ease = 1 - Math.pow(1 - snap, 3);

  const active = showB ? questionB : questionA;
  const color = showB ? RED : '#fff';

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a0b0d', overflow: 'hidden' }}>
      <Eyebrow top={90} fontSize={34}>{data.eyebrow ?? "{city name} SPORT PARENT"}</Eyebrow>
      {/* red glow that pulses on the B (tired) face */}
      <div style={{
        position: 'absolute', top: '38%', left: '50%', width: 900, height: 900,
        transform: 'translate(-50%,-50%)',
        background: `radial-gradient(circle, ${RED}${showB ? '33' : '11'} 0%, transparent 62%)`,
        filter: 'blur(20px)',
      }}/>

      <div style={{
        position: 'absolute', top: '50%', left: 64, right: 64, transform: 'translateY(-50%)',
        textAlign: 'center',
      }}>
        <div style={{
          fontFamily: 'Anton, sans-serif', fontSize: 160, color, lineHeight: 0.9,
          opacity: ease,
          transform: `translateY(${(1 - ease) * 30}px) scale(${0.9 + 0.1 * ease})`,
          textShadow: showB ? `0 0 34px ${RED}66` : '0 4px 18px rgba(0,0,0,0.6)',
        }}>{active}</div>
      </div>

      <TplText field="microscript" data={data}
        base={{ position: 'absolute', bottom: 150, left: 64, right: 64 }}
        style={{
          fontFamily: '"JetBrains Mono", monospace', fontSize: 40, color: '#fff', textAlign: 'center',
          letterSpacing: '0.14em', opacity: 0.9,
        }} fitKey={microscript}
      >// {microscript}</TplText>

      {window.ExtrasLayer ? <window.ExtrasLayer data={data} /> : null}
    </div>
  );
}
window.FreshE2eA3Reel = FreshE2eA3Reel;

const FRESH_E2E_A3_SPEC = {
  id: 'fresh-e2e-a3', name: 'A3 — FASTER / TIRED FLIP',
  fields: [
    {
      "key": "duration",
      "label": "Length",
      "type": "slider",
      "default": 6,
      "min": 3,
      "max": 9,
      "step": 0.5,
      "unit": "s"
    },
    {
      "key": "eyebrow",
      "role": "eyebrow",
      "label": "Eyebrow",
      "type": "text",
      "default": "{city name} SPORT PARENT"
    },
    {
      "key": "questionA",
      "label": "Question A (white)",
      "type": "text",
      "default": "GETTING FASTER?"
    },
    {
      "key": "questionB",
      "label": "Question B (red)",
      "type": "text",
      "default": "OR JUST MORE TIRED?"
    },
    {
      "key": "microscript",
      "label": "Microscript",
      "type": "text",
      "default": "TRAIN FAST TO BE FAST"
    }
  ],
};
window.FRESH_E2E_A3_SPEC = FRESH_E2E_A3_SPEC;
