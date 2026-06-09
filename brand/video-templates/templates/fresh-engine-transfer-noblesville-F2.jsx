// FRESH-ENGINE-TRANSFER-NOBLESVILLE-F2 — AA "calendar-fill" offer graphic (90-day theme).
// Built from scratch on the Athletes Acceleration design system, modeled on example
// ex-114-calendar-fill: a 90-day grid that FILLS with red over time (the guarantee window),
// driven by useTime(). Re-skinned onto AA INK rails (the example used a light bg) — deep
// ink field, ONE red accent (#c4141d), mono "90 DAYS" label, a dominant Anton hook headline,
// and the CTA in the bottom band. GRAPHIC / data-viz archetype: NO background photo.
// All copy via data.* role fields; nothing hardcoded from the campaign. Vertical 1080x1920.

function FreshEngineTransferNoblesvilleF2Reel({ data = {} }) {
  const eyebrow = data.eyebrow ?? 'NOBLESVILLE SPORT PARENTS';
  const hook = data.hook ?? 'THE FIRST STEP IS THE ATHLETE ANALYSIS.';
  const cta = data.cta ?? 'BOOK THE ATHLETE ANALYSIS';
  const brand = data.brand ?? 'ATHLETES ACCELERATION';

  const RED = (window.__BRAND__ && window.__BRAND__.brand_red || '#c4141d');
  const INK = '#0a0b0d';
  const PANEL = '#15171a';

  const t = useTime();
  const clamp = (x) => Math.max(0, Math.min(1, x));
  const ease = (x) => Easing.easeOutCubic(clamp(x));

  const inEye = ease((t - 0.10) / 0.30);
  const inHook = ease((t - 0.35) / 0.60);
  const inGrid = ease((t - 0.70) / 0.40);
  const inCta = ease((t - 0.55) / 0.60);

  // 90-day calendar grid: 9 columns x 10 rows = 90 cells.
  // Fills with red over the run, left-to-right top-to-bottom, like the window closing.
  const TOTAL = 90;
  const COLS = 9;
  const ROWS = 10;
  const fillFrac = ease((t - 0.80) / 3.6);          // sweep from ~0.8s to ~4.4s
  const filledN = Math.round(TOTAL * fillFrac);
  const riseHook = (1 - inHook) * 46;

  const cells = Array.from({ length: TOTAL }, (_, i) => {
    const isFilled = i < filledN;
    // gentle per-cell pop as the sweep reaches it
    const cellPop = ease((fillFrac - i / TOTAL) * 26);
    return (
      <div key={i} style={{
        aspectRatio: '1 / 1',
        borderRadius: 7,
        background: isFilled ? RED : PANEL,
        border: isFilled ? `1px solid ${RED}` : '1px solid rgba(255,255,255,0.06)',
        transform: isFilled ? `scale(${0.82 + 0.18 * cellPop})` : 'scale(0.82)',
        opacity: inGrid,
        boxShadow: isFilled ? '0 2px 10px rgba(196,20,29,0.35)' : 'none',
      }} />
    );
  });

  return (
    <div style={{ position: 'absolute', inset: 0, background: INK, overflow: 'hidden' }}>
      {/* subtle top vignette so the eyebrow band reads */}
      <div style={{ position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0) 22%, rgba(0,0,0,0) 72%, rgba(0,0,0,0.55) 100%)' }} />

      {/* left red accent column, wipes down */}
      <div style={{ position: 'absolute', left: 0, top: 0, width: 16, height: 1920,
        background: RED, transform: `scaleY(${inEye})`, transformOrigin: 'top' }} />

      {/* mono eyebrow chip, top-left */}
      <div style={{ position: 'absolute', top: 132, left: 96, opacity: inEye }}>
        <TplText field="eyebrow" data={data} base={{}}
          style={{ display: 'inline-block', color: '#ffffff', fontFamily: '"JetBrains Mono", ui-monospace, monospace',
            fontWeight: 700, fontSize: 30, letterSpacing: '0.22em', textTransform: 'uppercase' }}
        >{eyebrow}</TplText>
        <div style={{ width: 84, height: 6, background: RED, marginTop: 16 }} />
      </div>

      {/* dominant headline */}
      <TplText field="hook" data={data}
        base={{ position: 'absolute', left: 96, right: 84, top: 248 }}
        style={{ fontFamily: '"Anton", "Oswald", sans-serif', fontWeight: 400, fontSize: 104, color: '#ffffff',
          lineHeight: 0.90, letterSpacing: '0.004em', textTransform: 'uppercase',
          textShadow: '0 4px 22px rgba(0,0,0,0.55)', opacity: inHook, transform: `translateY(${riseHook}px)` }}
        maxHeight={420} fitKey={hook}
      >{hook}</TplText>

      {/* "90 DAYS" mono label above the grid */}
      <div style={{ position: 'absolute', left: 96, top: 700, opacity: inGrid,
        display: 'flex', alignItems: 'baseline', gap: 18 }}>
        <span style={{ fontFamily: '"JetBrains Mono", ui-monospace, monospace', fontWeight: 700,
          fontSize: 34, letterSpacing: '0.12em', color: RED, textTransform: 'uppercase' }}>90 DAYS</span>
        <span style={{ fontFamily: '"JetBrains Mono", ui-monospace, monospace', fontWeight: 700,
          fontSize: 22, letterSpacing: '0.18em', color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase' }}>THE GUARANTEE WINDOW</span>
      </div>

      {/* 90-day calendar grid — fills red over time */}
      <div style={{ position: 'absolute', left: 96, right: 96, top: 770,
        display: 'grid', gridTemplateColumns: `repeat(${COLS}, 1fr)`, gridTemplateRows: `repeat(${ROWS}, 1fr)`,
        gap: 14, height: 980 }}>
        {cells}
      </div>

      {/* CTA in the bottom band, above platform UI */}
      <div style={{ position: 'absolute', left: 96, right: 96, bottom: 188, opacity: inCta }}>
        <div style={{ display: 'inline-block', background: RED, padding: '22px 38px', borderRadius: 10 }}>
          <TplText field="cta" data={data} base={{}}
            style={{ display: 'inline-block', fontFamily: '"Anton", "Oswald", sans-serif', fontWeight: 400,
              fontSize: 46, color: '#ffffff', letterSpacing: '0.01em', textTransform: 'uppercase', lineHeight: 1.0 }}
            fitKey={cta}
          >{cta}</TplText>
        </div>
      </div>

      {/* wordmark, bottom-left */}
      <TplText field="brand" data={data}
        base={{ position: 'absolute', bottom: 96, left: 96, right: 96 }}
        style={{ fontFamily: '"Geist", "Inter", sans-serif', fontWeight: 600, fontSize: 30, color: '#ffffff',
          letterSpacing: '0.2em', textTransform: 'uppercase', opacity: 0.9 }}
      >{brand}</TplText>
    </div>
  );
}

window.FreshEngineTransferNoblesvilleF2Reel = FreshEngineTransferNoblesvilleF2Reel;

const FRESH_ENGINE_TRANSFER_NOBLESVILLE_F2_SPEC = {
  id: 'fresh-engine-transfer-noblesville-F2',
  name: 'ENGINE-TRANSFER F2 — CALENDAR FILL (90 DAYS)',
  fields: [
    { "key": "duration", "label": "Length", "type": "slider", "default": 6, "min": 4, "max": 10, "step": 0.5, "unit": "s" },
    { "key": "eyebrow", "role": "eyebrow", "label": "Eyebrow", "type": "text", "default": "NOBLESVILLE SPORT PARENTS" },
    { "key": "hook", "role": "hook", "label": "Hook", "type": "text", "default": "THE FIRST STEP IS THE ATHLETE ANALYSIS." },
    { "key": "cta", "role": "cta", "label": "CTA", "type": "text", "default": "BOOK THE ATHLETE ANALYSIS" },
    { "key": "brand", "role": "brand", "label": "Brand", "type": "text", "default": "ATHLETES ACCELERATION" }
  ],
};
window.FRESH_ENGINE_TRANSFER_NOBLESVILLE_F2_SPEC = FRESH_ENGINE_TRANSFER_NOBLESVILLE_F2_SPEC;
