// FRESH-ENGINE-TRANSFER-NOBLESVILLE-D1 — AA "tier-list" reframe (beat D), GRAPHIC / data-viz, NO bg photo.
// Built from scratch on the Athletes Acceleration design system, guided by example ex-082-tier-list:
// a ranked stack on deep INK — a top tier row (red #c4141d) labeled THE ENGINE ranked ABOVE a lower
// muted tier labeled THE PAINT. Each tier = a colored left rank-cap + a raised panel of pill chips.
// Rows slide in stacked (useTime). The reframe is the dominant Anton headline owning the lower band.
// Argument: athleticism (the engine) outranks sport drills (the paint job). All copy via data.*; no clip.

function FreshEngineTransferNoblesvilleD1Reel({ data = {} }) {
  const eyebrow = data.eyebrow ?? 'NOBLESVILLE SPORT PARENTS';
  const reframe = data.reframe ?? 'SPORT DRILLS ARE THE PAINT JOB. ATHLETICISM IS THE ENGINE.';
  const brand = data.brand ?? 'ATHLETES ACCELERATION';

  const RED = (window.__BRAND__ && window.__BRAND__.brand_red || '#c4141d');
  const INK = '#0a0b0d';
  const PANEL = '#15171a';
  const MUTED = '#3a3d44';      // muted tier rank-cap (the paint, ranked below)

  const t = useTime();
  const clamp = (x) => Math.max(0, Math.min(1, x));
  const ease = (x) => Easing.easeOutCubic(clamp(x));
  const inKick = ease((t - 0.10) / 0.35);
  const inEngine = ease((t - 0.35) / 0.5);
  const inPaint = ease((t - 0.70) / 0.5);
  const inHook = ease((t - 1.05) / 0.7);
  const rise = (1 - inHook) * 46;

  // a single tier row: colored rank-cap (label + sub) + raised panel of chips
  const Tier = ({ capColor, capLabel, capSub, chips, prog, chipColor }) => (
    <div style={{ display: 'flex', alignItems: 'stretch', height: 312, marginBottom: 28,
      opacity: prog, transform: `translateX(${(1 - prog) * 46}px)` }}>
      <div style={{ width: 196, background: capColor, borderRadius: '20px 0 0 20px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
        <div style={{ fontFamily: '"Anton", "Oswald", sans-serif', color: '#ffffff', fontSize: 58,
          lineHeight: 0.9, textTransform: 'uppercase', textAlign: 'center' }}>{capLabel}</div>
        <div style={{ fontFamily: '"JetBrains Mono", ui-monospace, monospace', color: 'rgba(255,255,255,0.82)',
          fontSize: 18, letterSpacing: '0.16em', textTransform: 'uppercase' }}>{capSub}</div>
      </div>
      <div style={{ flex: 1, background: PANEL, borderRadius: '0 20px 20px 0',
        display: 'flex', alignItems: 'center', alignContent: 'center', gap: 18, padding: '0 40px', flexWrap: 'wrap' }}>
        {chips.map((c, j) => (
          <div key={j} style={{ border: `2px solid ${chipColor}`, borderRadius: 999, padding: '14px 28px',
            fontFamily: '"Geist", "Inter", sans-serif', fontWeight: 700, fontSize: 36,
            color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.02em' }}>{c}</div>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{ position: 'absolute', inset: 0, background: INK, overflow: 'hidden' }}>
      {/* left red accent column, AA rail */}
      <div style={{ position: 'absolute', left: 0, top: 0, width: 16, height: 1920,
        background: RED, transform: `scaleY(${inKick})`, transformOrigin: 'top' }} />

      {/* mono eyebrow chip, top-left */}
      <div style={{ position: 'absolute', top: 132, left: 96, opacity: inKick }}>
        <TplText field="eyebrow" data={data} base={{}}
          style={{ display: 'inline-block', color: '#ffffff', fontFamily: '"JetBrains Mono", ui-monospace, monospace',
            fontWeight: 700, fontSize: 30, letterSpacing: '0.22em', textTransform: 'uppercase' }}
        >{eyebrow}</TplText>
        <div style={{ width: 84, height: 6, background: RED, marginTop: 16 }} />
      </div>

      {/* ranked tier stack — engine ranked ABOVE paint */}
      <div style={{ position: 'absolute', left: 96, right: 84, top: 312 }}>
        <Tier capColor={RED} capLabel="THE ENGINE" capSub="RANK 1"
          chips={['ATHLETICISM', 'FORCE', 'SPEED', 'POWER']} prog={inEngine} chipColor={RED} />
        <Tier capColor={MUTED} capLabel="THE PAINT" capSub="RANK 2"
          chips={['DRILLS', 'FOOTWORK', 'TECHNIQUE']} prog={inPaint} chipColor={MUTED} />
      </div>

      {/* dominant reframe headline, lower band */}
      <TplText field="reframe" data={data}
        base={{ position: 'absolute', left: 96, right: 84, bottom: 296 }}
        style={{ fontFamily: '"Anton", "Oswald", sans-serif', fontWeight: 400, fontSize: 96, color: '#ffffff',
          lineHeight: 0.9, letterSpacing: '0.004em', textTransform: 'uppercase',
          textShadow: '0 4px 22px rgba(0,0,0,0.65)', opacity: inHook, transform: `translateY(${rise}px)` }}
        maxHeight={620} fitKey={reframe}
      >{reframe}</TplText>

      {/* wordmark, bottom-left */}
      <TplText field="brand" data={data}
        base={{ position: 'absolute', bottom: 96, left: 96, right: 96 }}
        style={{ fontFamily: '"Geist", "Inter", sans-serif', fontWeight: 600, fontSize: 30, color: '#ffffff',
          letterSpacing: '0.2em', textTransform: 'uppercase', opacity: 0.9 }}
      >{brand}</TplText>
    </div>
  );
}

window.FreshEngineTransferNoblesvilleD1Reel = FreshEngineTransferNoblesvilleD1Reel;

const FRESH_ENGINE_TRANSFER_NOBLESVILLE_D1_SPEC = {
  id: 'fresh-engine-transfer-noblesville-D1',
  name: 'ENGINE-TRANSFER D1 — TIER LIST (ENGINE > PAINT)',
  fields: [
    { "key": "duration", "label": "Length", "type": "slider", "default": 6, "min": 4, "max": 10, "step": 0.5, "unit": "s" },
    { "key": "eyebrow", "role": "eyebrow", "label": "Eyebrow", "type": "text", "default": "NOBLESVILLE SPORT PARENTS" },
    { "key": "reframe", "role": "reframe", "label": "Reframe", "type": "text", "default": "SPORT DRILLS ARE THE PAINT JOB. ATHLETICISM IS THE ENGINE." },
    { "key": "brand", "role": "brand", "label": "Brand", "type": "text", "default": "ATHLETES ACCELERATION" }
  ],
};
window.FRESH_ENGINE_TRANSFER_NOBLESVILLE_D1_SPEC = FRESH_ENGINE_TRANSFER_NOBLESVILLE_D1_SPEC;
