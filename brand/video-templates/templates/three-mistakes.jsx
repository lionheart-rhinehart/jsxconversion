// 3 MISTAKES — 9:16 Reel — educational with ✗ wrong/✓ right comparisons
// Unique element: side-by-side WRONG vs RIGHT mini-cards revealing in sequence.

function ThreeMistakesReel({ data = {} }) {
  const t = window.useTime ? window.useTime() : 0;
  const RED = '#c4141d';
  const GREEN = '#15a34a';

  const eyebrow = data.eyebrow ?? 'BIG 3 MISTAKES';
  const title1 = data.title1 ?? "YOU'RE BENCHING";
  const title2 = data.title2 ?? 'IT WRONG.';
  const drillName = data.drillName ?? 'BENCH PRESS';
  const wrong1 = data.wrong1 ?? 'FLARED ELBOWS';
  const right1 = data.right1 ?? 'TUCK TO 45°';
  const wrong2 = data.wrong2 ?? 'NO LEG DRIVE';
  const right2 = data.right2 ?? 'PUSH THE FLOOR';
  const wrong3 = data.wrong3 ?? 'BOUNCING OFF CHEST';
  const right3 = data.right3 ?? 'PAUSE. CONTROL.';
  const ctaText = data.ctaText ?? 'FIX YOUR FORM →';

  const eyebrowT = Math.max(0, Math.min(1, (t - 0.2) / 0.4));
  const titleT = window.Easing ? window.Easing.easeOutCubic(Math.max(0, Math.min(1, (t - 0.5) / 0.5))) : 1;
  const subT = Math.max(0, Math.min(1, (t - 1.1) / 0.4));
  const rowT = (i) => window.Easing ? window.Easing.easeOutCubic(Math.max(0, Math.min(1, (t - (1.6 + i * 0.7)) / 0.5))) : 1;
  const ctaT = window.Easing ? window.Easing.easeOutBack(Math.max(0, Math.min(1, (t - 5.4) / 0.5))) : 1;

  const Row = ({ wrong, right, op, idx }) => (
    <div style={{
      opacity: op,
      transform: `translateY(${(1 - op) * 18}px)`,
    }}>
      <div style={{
        display: 'flex',
        gap: 10,
        marginBottom: 6,
      }}>
        <div style={{
          flex: 1,
          padding: '18px 18px',
          background: 'rgba(196,20,29,0.12)',
          border: `2px solid ${RED}`,
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <div style={{
            width: 40, height: 40,
            background: RED,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'Anton, sans-serif',
            fontSize: 28, color: '#fff', flexShrink: 0,
          }}>✗</div>
          <div style={{
            fontFamily: 'Anton, sans-serif',
            fontSize: 34, color: '#fff', lineHeight: 0.95,
          }}>{wrong}</div>
        </div>
        <div style={{
          flex: 1,
          padding: '18px 18px',
          background: 'rgba(21,163,74,0.12)',
          border: `2px solid ${GREEN}`,
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <div style={{
            width: 40, height: 40,
            background: GREEN,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'Anton, sans-serif',
            fontSize: 28, color: '#fff', flexShrink: 0,
          }}>✓</div>
          <div style={{
            fontFamily: 'Anton, sans-serif',
            fontSize: 34, color: '#fff', lineHeight: 0.95,
          }}>{right}</div>
        </div>
      </div>
      <div style={{
        position: 'relative',
        height: 26,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{
          fontFamily: 'Anton, sans-serif',
          fontSize: 80, color: 'transparent',
          WebkitTextStroke: `2px ${RED}`,
          opacity: 0.4,
          fontVariantNumeric: 'tabular-nums',
          lineHeight: 1,
        }}>0{idx}</div>
      </div>
    </div>
  );

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a0b0d', overflow: 'hidden' }}>
      <div style={{
        position: 'absolute', top: 110, left: 60, right: 60,
        opacity: eyebrowT,
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: 28, color: RED, letterSpacing: '0.18em',
      }}>// {eyebrow}</div>

      <div style={{
        position: 'absolute', top: 180, left: 60, right: 60,
        fontFamily: 'Anton, sans-serif',
        fontSize: 140, color: '#fff', lineHeight: 0.88,
        opacity: titleT,
        transform: `translateY(${(1 - titleT) * 16}px)`,
      }}>{title1}<br/><span style={{ color: RED }}>{title2}</span></div>

      <div style={{
        position: 'absolute', top: 540, left: 60, right: 60,
        padding: '10px 14px',
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.12)',
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: 18, color: '#fff',
        letterSpacing: '0.16em',
        opacity: subT,
      }}>EXERCISE: {drillName}</div>

      <div style={{
        position: 'absolute', top: 640, left: 60, right: 60,
        display: 'flex', flexDirection: 'column', gap: 16,
      }}>
        <Row wrong={wrong1} right={right1} op={rowT(0)} idx={1}/>
        <Row wrong={wrong2} right={right2} op={rowT(1)} idx={2}/>
        <Row wrong={wrong3} right={right3} op={rowT(2)} idx={3}/>
      </div>

      <div style={{
        position: 'absolute', bottom: 90, left: 60, right: 60,
        padding: '22px 28px',
        background: RED,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        opacity: ctaT,
        transform: `translateY(${(1 - ctaT) * 16}px)`,
      }}>
        <div style={{ fontFamily: 'Anton, sans-serif', fontSize: 44, color: '#fff' }}>{ctaText}</div>
        <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 16, color: '#fff', letterSpacing: '0.1em' }}>ATHLETESACCEL.COM</div>
      </div>
    </div>
  );
}

window.ThreeMistakesReel = ThreeMistakesReel;

const THREE_MISTAKES_SPEC = {
  id: 'three-mistakes',
  name: '3 MISTAKES',
  fields: [
    { key: 'duration', label: 'Length', type: 'slider', default: 7, min: 4, max: 15, step: 0.5, unit: 's' },
    { key: 'eyebrow', label: 'Eyebrow tag', type: 'text', default: 'BIG 3 MISTAKES' },
    { key: 'title1', label: 'Title line 1', type: 'text', default: "YOU'RE BENCHING" },
    { key: 'title2', label: 'Title line 2 (red)', type: 'text', default: 'IT WRONG.' },
    { key: 'drillName', label: 'Exercise', type: 'text', default: 'BENCH PRESS' },
    { key: 'wrong1', label: 'Wrong #1', type: 'text', default: 'FLARED ELBOWS' },
    { key: 'right1', label: 'Right #1', type: 'text', default: 'TUCK TO 45°' },
    { key: 'wrong2', label: 'Wrong #2', type: 'text', default: 'NO LEG DRIVE' },
    { key: 'right2', label: 'Right #2', type: 'text', default: 'PUSH THE FLOOR' },
    { key: 'wrong3', label: 'Wrong #3', type: 'text', default: 'BOUNCING OFF CHEST' },
    { key: 'right3', label: 'Right #3', type: 'text', default: 'PAUSE. CONTROL.' },
    { key: 'ctaText', label: 'CTA text', type: 'text', default: 'FIX YOUR FORM →' },
  ],
};
window.THREE_MISTAKES_SPEC = THREE_MISTAKES_SPEC;
