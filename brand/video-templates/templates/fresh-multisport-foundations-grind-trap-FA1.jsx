// FRESH — multisport-foundations / grind-trap / FA1  (30s full-arc VSL)
// The long-form ad copy as a vertical caption film. Beats sequence over time:
// A hook -> C mechanism -> D reframe -> E proof -> F guarantee -> CTA + brand.
// A beat ticker (top) and progress bar (bottom) run throughout. Vertical-native
// 1080x1920, captions carry the whole message (muted view), every text colored.
// Rendered by the runner inside <Stage duration={30}> (useTime() runs in-Stage).

function GrindArcVSL({ data = {} }) {
  const eyebrow = data.eyebrow ?? '// AGES 8-12 · HAMILTON COUNTY, IN';
  const hook = data.hook ?? 'YOUR YOUNG ATHLETE\nTRAINS HARD.\nSTILL THE SAME SPEED.';
  const mech1 = data.mech1 ?? 'THE TIRED REPS ARE\nREHEARSING SLOW.';
  const mech2 = data.mech2 ?? 'SO THE SET ENDS THE\nSECOND SPEED DROPS.';
  const reframe = data.reframe ?? "THIS WAS NEVER\nYOUR KID'S FAULT.";
  const statValue = data.statValue ?? '224%';
  const statLabel = data.statLabel ?? 'GREATER VERTICAL JUMP';
  const proofCite = data.proofCite ?? 'WANG 2026 · CSCS · NFL-TRAINED';
  const guarantee = data.guarantee ?? '+1 mph speed. +3" vertical.\n90 days. Or your training is on us.';
  const cta = data.cta ?? 'BOOK THE FREE\nATHLETE ANALYSIS';
  const brand = data.brand ?? 'ATHLETES ACCELERATION';
  const bgClip = data.bgClip ?? null;

  const t = useTime();
  const RED = '#c4141d';
  const INK = '#0a0b0d';
  const clamp = (x) => Math.max(0, Math.min(1, x));
  // fade-in over 0.45s after start, fade-out over 0.45s before end
  const fade = (s, e) => Math.max(0, Math.min(clamp((t - s) / 0.45), 1 - clamp((t - (e - 0.45)) / 0.45)));
  const rise = (s) => (1 - Easing.easeOutCubic(clamp((t - s) / 0.5))) * 18;

  // Beat windows (seconds)
  const A = [0, 3.4], C1 = [3.4, 7.8], C2 = [7.8, 12.2], D = [12.2, 16.6],
    E = [16.6, 22.6], F = [22.6, 27.2], CTA = [27.2, 30];

  const beats = [
    { k: 'A', s: 0 }, { k: 'C', s: 3.4 }, { k: 'D', s: 12.2 },
    { k: 'E', s: 16.6 }, { k: 'F', s: 22.6 },
  ];
  const activeBeat = beats.reduce((acc, b) => (t >= b.s ? b.k : acc), 'A');

  const cap = {
    position: 'absolute', left: 86, right: 86, top: 720,
    fontFamily: 'Anton, sans-serif', fontSize: 130, lineHeight: 0.92,
    letterSpacing: '0.005em', textTransform: 'uppercase', whiteSpace: 'pre-line',
    color: '#ffffff',
  };

  return (
    <div style={{ position: 'absolute', inset: 0, background: INK, overflow: 'hidden' }}>
      {bgClip ? <SyncedVideo src={bgClip} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} /> : null}
      {bgClip ? <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(10,11,13,0.6) 0%, rgba(10,11,13,0.5) 45%, rgba(10,11,13,0.85) 100%)' }} /> : null}
      {/* red glow */}
      <div style={{ position: 'absolute', top: -200, right: -200, width: 640, height: 640,
        background: `radial-gradient(circle, ${RED}1f 0%, transparent 60%)`, filter: 'blur(20px)' }} />

      {/* beat ticker */}
      <div style={{ position: 'absolute', top: 120, left: 90, right: 90, display: 'flex', gap: 24,
        fontFamily: '"JetBrains Mono", monospace', fontSize: 30, letterSpacing: '0.1em' }}>
        {['A', 'C', 'D', 'E', 'F'].map((k) => (
          <span key={k} style={{ color: k === activeBeat ? RED : '#3a3d42' }}>{k}</span>
        ))}
      </div>

      {/* A — context anchor + hook */}
      <div style={{ position: 'absolute', top: 540, left: 90, right: 90,
        fontFamily: '"JetBrains Mono", monospace', fontSize: 34, color: RED,
        letterSpacing: '0.06em', textTransform: 'uppercase', opacity: fade(A[0], A[1]) }}>{eyebrow}</div>
      <div style={{ ...cap, opacity: fade(A[0], A[1]), transform: `translateY(${rise(A[0])}px)` }}>{hook}</div>

      {/* C — mechanism (two beats) */}
      <div style={{ ...cap, opacity: fade(C1[0], C1[1]), transform: `translateY(${rise(C1[0])}px)` }}>
        {mech1.split('\n').map((ln, i) => <div key={i}>{i === 1 ? <span style={{ color: RED }}>{ln}</span> : ln}</div>)}
      </div>
      <div style={{ ...cap, opacity: fade(C2[0], C2[1]), transform: `translateY(${rise(C2[0])}px)` }}>{mech2}</div>

      {/* D — reframe */}
      <div style={{ ...cap, opacity: fade(D[0], D[1]), transform: `translateY(${rise(D[0])}px)` }}>{reframe}</div>

      {/* E — proof */}
      <div style={{ position: 'absolute', left: 86, right: 86, top: 640, opacity: fade(E[0], E[1]) }}>
        <div style={{ fontFamily: 'Anton, sans-serif', fontSize: 300, lineHeight: 0.9, color: RED,
          letterSpacing: '-0.01em', transform: `translateY(${rise(E[0])}px)` }}>{statValue}</div>
        <div style={{ fontFamily: 'Anton, sans-serif', fontSize: 72, lineHeight: 0.95, color: '#ffffff',
          textTransform: 'uppercase', marginTop: 12 }}>{statLabel}</div>
        <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 34, color: '#9aa0a6',
          letterSpacing: '0.05em', textTransform: 'uppercase', marginTop: 40 }}>{proofCite}</div>
      </div>

      {/* F — guarantee (red band) */}
      <div style={{ position: 'absolute', left: 70, right: 70, top: 820, padding: '46px 54px',
        background: RED, opacity: fade(F[0], F[1]), transform: `translateY(${rise(F[0])}px)` }}>
        <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 52, fontWeight: 700,
          lineHeight: 1.25, color: '#ffffff', whiteSpace: 'pre-line' }}>{guarantee}</div>
      </div>

      {/* CTA + brand */}
      <div style={{ position: 'absolute', left: 86, right: 86, top: 780, opacity: fade(CTA[0], CTA[1]),
        transform: `translateY(${rise(CTA[0])}px)` }}>
        <div style={{ fontFamily: 'Anton, sans-serif', fontSize: 120, lineHeight: 0.92, color: '#ffffff',
          textTransform: 'uppercase', whiteSpace: 'pre-line' }}>{cta}</div>
        <div style={{ marginTop: 48, display: 'inline-block', background: RED, padding: '24px 40px',
          fontFamily: 'Anton, sans-serif', fontSize: 44, color: '#ffffff', letterSpacing: '0.02em' }}>FREE · NO PITCH →</div>
      </div>

      {/* brand wordmark (always, lower) */}
      <div style={{ position: 'absolute', bottom: 120, left: 90, right: 90,
        fontFamily: '"JetBrains Mono", monospace', fontSize: 30, color: '#ffffff',
        letterSpacing: '0.14em', textTransform: 'uppercase', opacity: 0.85 }}>{brand}</div>

      {/* progress bar */}
      <div style={{ position: 'absolute', bottom: 60, left: 90, right: 90, height: 5, background: '#26282c' }}>
        <div style={{ height: '100%', width: `${clamp(t / 30) * 100}%`, background: RED }} />
      </div>
    </div>
  );
}

window.GrindArcVSL = GrindArcVSL;

const GRIND_ARC_SPEC = {
  id: 'fresh-multisport-foundations-grind-trap-FA1',
  name: 'GRIND ARC VSL (FA1)',
  fields: [
    {
      "key": "duration",
      "label": "Length",
      "type": "slider",
      "default": 30,
      "min": 15,
      "max": 45,
      "step": 1,
      "unit": "s"
    },
    {
      "key": "bgClip",
      "label": "Background clip",
      "type": "image"
    },
    {
      "key": "eyebrow",
      "role": "eyebrow",
      "label": "A: Context anchor",
      "type": "text",
      "default": "// AGES 8-12 · HAMILTON COUNTY, IN"
    },
    {
      "key": "hook",
      "role": "hook",
      "label": "A: Hook",
      "type": "text",
      "default": "YOUR YOUNG ATHLETE\nTRAINS HARD.\nSTILL THE SAME SPEED."
    },
    {
      "key": "mech1",
      "role": "mechanism",
      "label": "C: Mechanism 1",
      "type": "text",
      "default": "THE TIRED REPS ARE\nREHEARSING SLOW."
    },
    {
      "key": "mech2",
      "role": "mechanism",
      "label": "C: Mechanism 2",
      "type": "text",
      "default": "SO THE SET ENDS THE\nSECOND SPEED DROPS."
    },
    {
      "key": "reframe",
      "role": "reframe",
      "label": "D: Reframe",
      "type": "text",
      "default": "THIS WAS NEVER\nYOUR KID'S FAULT."
    },
    {
      "key": "statValue",
      "role": "stat",
      "label": "E: Stat value",
      "type": "text",
      "default": "224%"
    },
    {
      "key": "statLabel",
      "role": "stat",
      "label": "E: Stat label",
      "type": "text",
      "default": "GREATER VERTICAL JUMP"
    },
    {
      "key": "proofCite",
      "role": "proof",
      "label": "E: Proof citation",
      "type": "text",
      "default": "WANG 2026 · CSCS · NFL-TRAINED"
    },
    {
      "key": "guarantee",
      "role": "guarantee",
      "label": "F: Guarantee (verbatim)",
      "type": "text",
      "default": "+1 mph speed. +3\" vertical.\n90 days. Or your training is on us."
    },
    {
      "key": "cta",
      "role": "cta",
      "label": "CTA",
      "type": "text",
      "default": "BOOK THE FREE\nATHLETE ANALYSIS"
    },
    {
      "key": "brand",
      "role": "brand",
      "label": "Brand",
      "type": "text",
      "default": "ATHLETES ACCELERATION"
    }
  ],
};
window.GRIND_ARC_SPEC = GRIND_ARC_SPEC;
