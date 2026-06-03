// LIMITED SPOTS — 9:16 Reel — urgency / availability ticker
// Unique element: spots-remaining counter that ticks down with a pulsing
// red border + horizontal "fill bar" showing % sold out
function LimitedSpotsReel({ data = {} }) {
  const t = window.useTime ? window.useTime() : 0;
  const RED = (window.__BRAND__ && window.__BRAND__.brand_red || '#c4141d');
  const AMBER = '#f59e0b';

  const eyebrow = data.eyebrow ?? 'LIMITED AVAILABILITY';
  const title1 = data.title1 ?? 'FALL SLOTS';
  const title2 = data.title2 ?? 'ARE GOING.';
  const programName = data.programName ?? 'ACCELERATE · FALL 2026';
  const totalSlots = (typeof data.totalSlots === 'number') ? data.totalSlots : 40;
  const startRemaining = (typeof data.startRemaining === 'number') ? data.startRemaining : 12;
  const endRemaining = (typeof data.endRemaining === 'number') ? data.endRemaining : 4;
  const fillLabel = data.fillLabel ?? 'BOOKED:';
  const closingBy = data.closingBy ?? 'CLOSES SUN AT MIDNIGHT';
  const ctaText = data.ctaText ?? 'CLAIM YOUR SPOT';

  const eyebrowT = Math.max(0, Math.min(1, (t - 0.2) / 0.4));
  const titleT = window.Easing ? window.Easing.easeOutCubic(Math.max(0, Math.min(1, (t - 0.4) / 0.5))) : 1;
  const progT = Math.max(0, Math.min(1, (t - 1.0) / 0.4));
  const tickerProg = Math.max(0, Math.min(1, (t - 1.2) / 2.6));
  const tickerEased = window.Easing ? window.Easing.easeOutCubic(tickerProg) : tickerProg;
  const remaining = Math.round(startRemaining - (startRemaining - endRemaining) * tickerEased);
  const booked = totalSlots - remaining;
  const fillPct = (booked / totalSlots) * 100;

  const closingT = Math.max(0, Math.min(1, (t - 4.4) / 0.4));
  const ctaT = window.Easing ? window.Easing.easeOutBack(Math.max(0, Math.min(1, (t - 5.6) / 0.5))) : 1;

  // Pulse pulsing on the counter
  const pulse = (Math.sin(t * 4) + 1) / 2;

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a0b0d', overflow: 'hidden' }}>
      <div style={{
        position: 'absolute', top: -200, right: -200,
        width: 600, height: 600,
        background: `radial-gradient(circle, ${RED}33 0%, transparent 60%)`,
        filter: 'blur(40px)',
      }}/>

      <Eyebrow top={110} fontSize={24}>// {eyebrow}</Eyebrow>

      <div style={{
        position: 'absolute', top: 200, left: 60, right: 60,
        fontFamily: 'Anton, sans-serif',
        fontSize: 150, color: '#fff', lineHeight: 0.88,
        opacity: titleT, transform: `translateY(${(1 - titleT) * 16}px)`,
      }}>{title1}<br/><span style={{ color: RED }}>{title2}</span></div>

      <div style={{
        position: 'absolute', top: 540, left: 60, right: 60,
        opacity: progT,
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: 22, color: '#969ca7', letterSpacing: '0.14em',
      }}>{programName}</div>

      {/* Counter card */}
      <div style={{
        position: 'absolute', top: 640, left: 60, right: 60,
        padding: '40px 40px',
        background: 'rgba(31,34,39,0.85)',
        border: `3px solid ${RED}`,
        opacity: progT,
        transform: `scale(${1 + pulse * 0.012})`,
        boxShadow: `0 0 ${40 + pulse * 30}px rgba(196,20,29,${0.3 + pulse * 0.3})`,
      }}>
        <div style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: 22, color: '#969ca7', letterSpacing: '0.16em',
          marginBottom: 16,
        }}>SPOTS REMAINING</div>
        <div style={{
          fontFamily: 'Anton, sans-serif',
          fontSize: 360, color: RED, lineHeight: 0.85,
          fontVariantNumeric: 'tabular-nums',
          textShadow: `0 0 ${20 + pulse * 30}px rgba(196,20,29,${0.5 + pulse * 0.4})`,
        }}>{remaining}<span style={{ fontSize: 90, color: '#969ca7' }}> / {totalSlots}</span></div>

        {/* Fill bar */}
        <div style={{ marginTop: 28 }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 18, color: '#969ca7', letterSpacing: '0.1em',
            marginBottom: 10,
          }}>
            <span>{fillLabel}</span>
            <span style={{ color: '#fff' }}>{booked}/{totalSlots} ({Math.round(fillPct)}%)</span>
          </div>
          <div style={{
            height: 22,
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.12)',
            overflow: 'hidden',
            position: 'relative',
          }}>
            <div style={{
              height: '100%',
              width: `${fillPct}%`,
              background: fillPct > 80 ? RED : AMBER,
              boxShadow: `0 0 12px ${fillPct > 80 ? RED : AMBER}`,
              transition: 'width 200ms linear, background 200ms',
            }}/>
          </div>
        </div>
      </div>

      <div style={{
        position: 'absolute', bottom: 230, left: 60, right: 60,
        padding: '14px 20px',
        background: AMBER,
        textAlign: 'center',
        fontFamily: 'Anton, sans-serif',
        fontSize: 38, color: '#0a0b0d', letterSpacing: '0.01em',
        opacity: closingT,
        transform: `translateY(${(1 - closingT) * 12}px) scale(${1 + pulse * 0.008})`,
      }}>⏰ {closingBy}</div>

      <div style={{
        position: 'absolute', bottom: 90, left: 60, right: 60,
        padding: '22px 28px', background: RED,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        opacity: ctaT,
        boxShadow: `0 12px 36px rgba(196,20,29,${0.4 + pulse * 0.3})`,
      }}>
        <div style={{ fontFamily: 'Anton, sans-serif', fontSize: 48, color: '#fff' }}>{ctaText} →</div>
        <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 16, color: '#fff', letterSpacing: '0.1em' }}>ATHLETESACCEL.COM</div>
      </div>
    </div>
  );
}
window.LimitedSpotsReel = LimitedSpotsReel;
const LIMITED_SPOTS_SPEC = {
  id: 'limited-spots',
  name: 'LIMITED SPOTS',
  fields: [
  {
    "key": "duration",
    "label": "Length",
    "type": "slider",
    "default": 7,
    "min": 4,
    "max": 15,
    "step": 0.5,
    "unit": "s"
  },
  {
    "key": "eyebrow",
    "label": "Eyebrow",
    "type": "text",
    "default": "LIMITED AVAILABILITY"
  },
  {
    "key": "title1",
    "label": "Title 1",
    "type": "text",
    "default": "FALL SLOTS"
  },
  {
    "key": "title2",
    "label": "Title 2 (red)",
    "type": "text",
    "default": "ARE GOING."
  },
  {
    "key": "programName",
    "label": "Program name",
    "type": "text",
    "default": "ACCELERATE · FALL 2026"
  },
  {
    "key": "totalSlots",
    "label": "Total slots",
    "type": "number",
    "default": 40,
    "step": 1,
    "min": 1
  },
  {
    "key": "startRemaining",
    "label": "Start remaining",
    "type": "number",
    "default": 12,
    "step": 1,
    "min": 0
  },
  {
    "key": "endRemaining",
    "label": "End remaining",
    "type": "number",
    "default": 4,
    "step": 1,
    "min": 0
  },
  {
    "key": "fillLabel",
    "label": "Fill bar label",
    "type": "text",
    "default": "BOOKED:"
  },
  {
    "key": "closingBy",
    "label": "Closing line",
    "type": "text",
    "default": "CLOSES SUN AT MIDNIGHT"
  },
  {
    "key": "ctaText",
    "label": "CTA text",
    "type": "text",
    "default": "CLAIM YOUR SPOT"
  }
],
};
window.LIMITED_SPOTS_SPEC = LIMITED_SPOTS_SPEC;
