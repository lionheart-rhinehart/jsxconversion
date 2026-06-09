// FRESH-ENGINE-TRANSFER-NOBLESVILLE-C3 — AA "sprint-trace" data-viz GRAPHIC (beat C, NO bg photo).
// Built from scratch on the Athletes Acceleration design system, guided by example
// ex-083-sprint-trace: an INK frame with a mono eyebrow chip top, a giant Anton claim headline
// owning the upper field, then a framed panel holding an accelerating speed/velocity TRACE — a
// red curve drawn left-to-right across mono axis ticks/labels, with a glowing red area-fill
// underneath and a leading dot that rides the curve as it builds. The trace LENGTH is driven by
// useTime() so the curve visibly accelerates in over the duration. Conveys speed/power building:
// the "engine" under every sport. One accent (#c4141d). All copy via data.* role fields. No media.

function FreshEngineTransferNoblesvilleC3Reel({ data = {} }) {
  const eyebrow = data.eyebrow ?? 'NOBLESVILLE SPORT PARENTS';
  const claim = data.claim ?? 'A GREAT SWING STILL HAS TO BE POWERED BY SOMETHING.';
  const brand = data.brand ?? 'ATHLETES ACCELERATION';

  const RED = (window.__BRAND__ && window.__BRAND__.brand_red || '#c4141d');
  const RED_DEEP = (window.__BRAND__ && window.__BRAND__.brand_red_deep || '#a30f17');
  const INK = '#0a0b0d';
  const PANEL = '#15171a';

  const t = useTime();
  const clamp = (x) => Math.max(0, Math.min(1, x));
  const ease = (x) => Easing.easeOutCubic(clamp(x));

  // staged entrances
  const inEyebrow = ease((t - 0.10) / 0.35);
  const inClaim = ease((t - 0.35) / 0.7);
  const inPanel = ease((t - 0.70) / 0.5);
  const riseClaim = (1 - inClaim) * 44;

  // --- the trace itself ---------------------------------------------------
  // Panel geometry (absolute coords inside the 1080x1920 stage).
  const PX = 96;            // panel left
  const PW = 888;           // panel width
  const PY = 980;           // panel top
  const PH = 720;           // panel height
  // Plot box inside the panel (leave room for axis labels).
  const plotL = PX + 96;
  const plotR = PX + PW - 56;
  const plotT = PY + 150;
  const plotB = PY + PH - 96;
  const plotW = plotR - plotL;
  const plotH = plotB - plotT;

  // An accelerating-then-plateauing speed curve (sprint velocity over distance):
  // fast rise out of the blocks, flattening toward top speed. y in [0..1], 0=bottom.
  const curveY = (x) => 1 - Math.pow(1 - x, 1.9); // ease-out shape -> accelerates early, plateaus late
  // The trace DRAWS in: progress sweeps 0->1 across the duration (gated behind panel entrance).
  const draw = ease((t - 0.95) / 3.4);

  const SAMPLES = 64;
  const drawnPts = [];
  for (let i = 0; i <= SAMPLES; i++) {
    const xn = (i / SAMPLES) * draw;       // only sample up to the current draw progress
    const px = plotL + xn * plotW;
    const py = plotB - curveY(xn) * plotH;
    drawnPts.push([px, py]);
  }
  const headX = plotL + draw * plotW;
  const headY = plotB - curveY(draw) * plotH;

  const linePath = drawnPts.length > 1
    ? 'M ' + drawnPts.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' L ')
    : '';
  const areaPath = drawnPts.length > 1
    ? `${linePath} L ${headX.toFixed(1)} ${plotB} L ${plotL.toFixed(1)} ${plotB} Z`
    : '';

  // mono axis tick labels (distance along x, speed up y) — generic, not campaign copy
  const xTicks = [
    { x: plotL, label: '0y' },
    { x: plotL + plotW * 0.5, label: '20y' },
    { x: plotR, label: '40y' },
  ];
  const yTicks = [
    { y: plotB, label: '0' },
    { y: plotB - plotH * 0.5, label: '11' },
    { y: plotB - plotH * 0.92, label: '21' },
  ];

  const monoLabel = {
    fontFamily: '"JetBrains Mono", ui-monospace, monospace',
    fontWeight: 700,
    fontSize: 24,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
  };

  return (
    <div style={{ position: 'absolute', inset: 0, background: INK, overflow: 'hidden' }}>
      {/* mono eyebrow chip, top-left */}
      <div style={{ position: 'absolute', top: 132, left: 96, opacity: inEyebrow }}>
        <TplText field="eyebrow" data={data} base={{}}
          style={{ display: 'inline-block', color: '#ffffff', fontFamily: '"JetBrains Mono", ui-monospace, monospace',
            fontWeight: 700, fontSize: 30, letterSpacing: '0.22em', textTransform: 'uppercase' }}
        >{eyebrow}</TplText>
        <div style={{ width: 84, height: 6, background: RED, marginTop: 16 }} />
      </div>

      {/* dominant claim headline, upper field */}
      <TplText field="claim" data={data}
        base={{ position: 'absolute', left: 96, right: 84, top: 252 }}
        style={{ fontFamily: '"Anton", "Oswald", sans-serif', fontWeight: 400, fontSize: 116, color: '#ffffff',
          lineHeight: 0.90, letterSpacing: '0.004em', textTransform: 'uppercase',
          textShadow: '0 4px 22px rgba(0,0,0,0.55)', opacity: inClaim, transform: `translateY(${riseClaim}px)` }}
        maxHeight={620} fitKey={claim}
      >{claim}</TplText>

      {/* ===== the sprint-trace panel ===== */}
      <div style={{ position: 'absolute', left: PX, top: PY, width: PW, height: PH,
        background: PANEL, border: '1px solid rgba(255,255,255,0.08)', borderRadius: 4,
        opacity: inPanel, transform: `translateY(${(1 - inPanel) * 28}px)` }} />

      {/* panel mono caption */}
      <div style={{ position: 'absolute', left: PX + 40, top: PY + 44, opacity: inPanel }}>
        <span style={{ ...monoLabel, color: RED }}>// SPEED OVER DISTANCE</span>
      </div>

      {/* peak readout, top-right of panel */}
      <div style={{ position: 'absolute', left: PX, top: PY + 36, width: PW - 40, textAlign: 'right',
        opacity: clamp((draw - 0.6) / 0.4) }}>
        <span style={{ fontFamily: '"Anton", "Oswald", sans-serif', fontWeight: 400, fontSize: 84,
          color: '#ffffff', letterSpacing: '0.01em', lineHeight: 0.9 }}>17.4</span>
        <span style={{ ...monoLabel, fontSize: 18, color: '#7d8288', marginLeft: 10 }}>MPH</span>
      </div>

      {/* SVG plot: gridlines, axes, area fill, accelerating trace, leading dot */}
      <svg width="1080" height="1920" viewBox="0 0 1080 1920"
        style={{ position: 'absolute', inset: 0, opacity: inPanel, pointerEvents: 'none' }}>
        <defs>
          <linearGradient id="c3TraceFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={RED} stopOpacity="0.42" />
            <stop offset="100%" stopColor={RED} stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* y gridlines */}
        {yTicks.map((tk, i) => (
          <line key={`g${i}`} x1={plotL} y1={tk.y} x2={plotR} y2={tk.y}
            stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
        ))}
        {/* baseline + left axis */}
        <line x1={plotL} y1={plotB} x2={plotR} y2={plotB} stroke="rgba(255,255,255,0.22)" strokeWidth="2" />
        <line x1={plotL} y1={plotT} x2={plotL} y2={plotB} stroke="rgba(255,255,255,0.22)" strokeWidth="2" />

        {/* area fill under the drawn trace */}
        {areaPath ? <path d={areaPath} fill="url(#c3TraceFill)" /> : null}
        {/* the accelerating trace line */}
        {linePath ? (
          <path d={linePath} fill="none" stroke={RED} strokeWidth="7"
            strokeLinecap="round" strokeLinejoin="round"
            style={{ filter: 'drop-shadow(0 0 10px rgba(196,20,29,0.55))' }} />
        ) : null}
        {/* leading dot riding the curve */}
        {draw > 0.001 ? (
          <g>
            <circle cx={headX} cy={headY} r="16" fill={RED} opacity="0.30" />
            <circle cx={headX} cy={headY} r="10" fill="#ffffff" stroke={RED} strokeWidth="4" />
          </g>
        ) : null}
      </svg>

      {/* x tick labels (mono) */}
      {xTicks.map((tk, i) => (
        <div key={`x${i}`} style={{ position: 'absolute', left: tk.x - 40, top: plotB + 14, width: 80,
          textAlign: 'center', opacity: inPanel }}>
          <span style={{ ...monoLabel, color: '#7d8288' }}>{tk.label}</span>
        </div>
      ))}
      {/* y tick labels (mono) */}
      {yTicks.map((tk, i) => (
        <div key={`y${i}`} style={{ position: 'absolute', left: PX + 24, top: tk.y - 14, width: 56,
          textAlign: 'right', opacity: inPanel }}>
          <span style={{ ...monoLabel, color: '#7d8288' }}>{tk.label}</span>
        </div>
      ))}

      {/* wordmark, bottom-left (clear of platform UI + panel) */}
      <TplText field="brand" data={data}
        base={{ position: 'absolute', bottom: 96, left: 96, right: 96 }}
        style={{ fontFamily: '"Geist", "Inter", sans-serif', fontWeight: 600, fontSize: 30, color: '#ffffff',
          letterSpacing: '0.2em', textTransform: 'uppercase', opacity: 0.9 * inPanel }}
      >{brand}</TplText>
    </div>
  );
}

window.FreshEngineTransferNoblesvilleC3Reel = FreshEngineTransferNoblesvilleC3Reel;

const FRESH_ENGINE_TRANSFER_NOBLESVILLE_C3_SPEC = {
  id: 'fresh-engine-transfer-noblesville-C3',
  name: 'ENGINE-TRANSFER C3 — SPRINT TRACE',
  fields: [
    { "key": "duration", "label": "Length", "type": "slider", "default": 6, "min": 4, "max": 10, "step": 0.5, "unit": "s" },
    { "key": "eyebrow", "role": "eyebrow", "label": "Eyebrow", "type": "text", "default": "NOBLESVILLE SPORT PARENTS" },
    { "key": "claim", "role": "claim", "label": "Claim", "type": "text", "default": "A GREAT SWING STILL HAS TO BE POWERED BY SOMETHING." },
    { "key": "brand", "role": "brand", "label": "Brand", "type": "text", "default": "ATHLETES ACCELERATION" }
  ],
};
window.FRESH_ENGINE_TRANSFER_NOBLESVILLE_C3_SPEC = FRESH_ENGINE_TRANSFER_NOBLESVILLE_C3_SPEC;
