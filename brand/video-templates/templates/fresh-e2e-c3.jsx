// FRESH-E2E-C3 — 9:16 Reel — fast-twitch fiber "erosion" motif
// Beat C. A column of fast-twitch (Type IIX) fiber bars visibly converts to
// slower Type IIA as tired reps accumulate — the muscle is remodeled slower.
// "That's not training. That's erosion." Stage-less.

function FreshE2eC3Reel({ data = {} }) {
  const t = window.useTime ? window.useTime() : 0;
  const E = window.Easing || { easeOutCubic: (x) => x };
  const RED = '#c4141d';
  const GREY = '#5b606b';

  const eyebrow = data.eyebrow ?? 'PHANTOM PROGRESS';
  const headline = data.headline ?? 'Every slow rep remodels the muscle to be slower.';
  const microscript = data.microscript ?? "That's not training. That's erosion.";
  const media = data.media ?? 'assets/photo-lifting.jpg';

  const clamp = (x) => Math.max(0, Math.min(1, x));
  const eyebrowT = clamp((t - 0.2) / 0.4);
  const headP = E.easeOutCubic(clamp((t - 0.7) / 0.6));
  const microP = E.easeOutCubic(clamp((t - 5.2) / 0.6));
  // Conversion sweep: fraction of fibers converted from fast (red) to slow (grey).
  const converted = clamp((t - 1.8) / 3.2);

  const cols = 8, rows = 5, total = cols * rows;
  const cellW = 108, cellH = 64, gap = 14;
  const gridW = cols * cellW + (cols - 1) * gap;
  const x0 = (1080 - gridW) / 2, y0 = 760;
  const nConv = Math.floor(converted * total);

  const cells = [];
  for (let i = 0; i < total; i++) {
    const r = Math.floor(i / cols), c = i % cols;
    const isSlow = i < nConv;
    cells.push(
      <div key={i} style={{
        position: 'absolute', left: x0 + c * (cellW + gap), top: y0 + r * (cellH + gap),
        width: cellW, height: cellH,
        background: isSlow ? GREY : RED,
        opacity: isSlow ? 0.65 : 1,
        boxShadow: isSlow ? 'none' : `0 0 14px ${RED}55`,
        transition: 'none',
      }}/>
    );
  }

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

      <TplText field="headline" data={data}
        base={{ position: 'absolute', top: 250, left: 64, right: 64 }}
        style={{ fontFamily: 'Anton, sans-serif', fontSize: 92, color: '#fff', lineHeight: 0.95, opacity: headP }}
        maxHeight={380} fitKey={headline}
      >{headline}</TplText>

      {cells}
      {/* Legend */}
      <div style={{ position: 'absolute', top: y0 + rows * (cellH + gap) + 20, left: x0, display: 'flex', gap: 40, opacity: clamp((t - 2.0) / 0.6) }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ width: 26, height: 26, background: RED }}/>
          <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 24, color: '#fff' }}>TYPE IIX · FAST</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ width: 26, height: 26, background: GREY }}/>
          <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 24, color: '#969ca7' }}>TYPE IIA · SLOWER</span>
        </div>
      </div>

      <TplText field="microscript" data={data}
        base={{ position: 'absolute', bottom: 150, left: 64, right: 64 }}
        style={{ fontFamily: 'Anton, sans-serif', fontSize: 84, color: RED, lineHeight: 0.95, opacity: microP, transform: `translateY(${(1 - microP) * 16}px)` }}
        maxHeight={200} fitKey={microscript}
      >{microscript}</TplText>

      {window.ExtrasLayer ? <window.ExtrasLayer data={data} /> : null}
    </div>
  );
}
window.FreshE2eC3Reel = FreshE2eC3Reel;

const FRESH_E2E_C3_SPEC = {
  id: 'fresh-e2e-c3', name: 'C3 — FIBER EROSION',
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
        "default": "PHANTOM PROGRESS"
      },
      {
        "key": "headline",
        "label": "Headline",
        "type": "text",
        "default": "Every slow rep remodels the muscle to be slower."
      },
      {
        "key": "microscript",
        "label": "Microscript",
        "type": "text",
        "default": "That's not training. That's erosion."
      },
      {
        "key": "media",
        "label": "Background photo/clip",
        "type": "image",
        "default": "assets/photo-lifting.jpg"
      }
    ],
};
window.FRESH_E2E_C3_SPEC = FRESH_E2E_C3_SPEC;
