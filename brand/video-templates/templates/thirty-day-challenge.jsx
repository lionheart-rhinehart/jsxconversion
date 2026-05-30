// 30-DAY CHALLENGE — 9:16 Reel — uses <CalendarFill>
// Challenge consistency reveal with calendar fill animating across.

function ThirtyDayChallengeReel({ data = {} }) {
  const t = window.useTime ? window.useTime() : 0;
  const RED = '#c4141d';
  const GREEN = '#15a34a';

  const eyebrow = data.eyebrow ?? '30-DAY CHALLENGE';
  const title1 = data.title1 ?? 'SHOW UP';
  const title2 = data.title2 ?? '30 DAYS.';
  const challengeName = data.challengeName ?? 'JUMP ROPE · 5 MIN A DAY';
  const totalDays = (typeof data.totalDays === 'number') ? data.totalDays : 30;
  const completedLabel = data.completedLabel ?? 'YOU DID THIS:';
  const resultStat = data.resultStat ?? '+3.4"';
  const resultLabel = data.resultLabel ?? 'AVERAGE VERTICAL GAIN';
  const ctaText = data.ctaText ?? 'JOIN THE NEXT ROUND →';

  const eyebrowT = Math.max(0, Math.min(1, (t - 0.2) / 0.4));
  const titleT = window.Easing ? window.Easing.easeOutCubic(Math.max(0, Math.min(1, (t - 0.5) / 0.5))) : 1;
  const challengeT = Math.max(0, Math.min(1, (t - 1.0) / 0.4));
  const calT = Math.max(0, Math.min(1, (t - 1.5) / 0.4));
  const resultT = window.Easing ? window.Easing.easeOutBack(Math.max(0, Math.min(1, (t - 5.6) / 0.6))) : 1;
  const ctaT = window.Easing ? window.Easing.easeOutBack(Math.max(0, Math.min(1, (t - 6.6) / 0.5))) : 1;

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
        fontSize: 150, color: '#fff', lineHeight: 0.88,
        opacity: titleT,
        transform: `translateY(${(1 - titleT) * 16}px)`,
      }}>{title1}<br/><span style={{ color: RED }}>{title2}</span></div>

      <div style={{
        position: 'absolute', top: 540, left: 60, right: 60,
        opacity: challengeT,
        padding: '14px 20px',
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.12)',
        borderLeft: `4px solid ${RED}`,
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: 26, color: '#fff', letterSpacing: '0.08em',
      }}>{challengeName}</div>

      {/* Calendar fill element */}
      <div style={{
        position: 'absolute', top: 660, left: 60, right: 60, height: 800,
        opacity: calT,
        transform: `translateY(${(1 - calT) * 20}px)`,
        background: 'rgba(15,17,21,0.85)',
        border: '1px solid rgba(255,255,255,0.08)',
        padding: 16,
        boxSizing: 'border-box',
      }}>
        {window.CalendarFill && <window.CalendarFill
          total={totalDays}
          label="DAY"
          streakLabel="🔥 STREAK"
        />}
      </div>

      {/* Result reveal */}
      <div style={{
        position: 'absolute', bottom: 230, left: 60, right: 60,
        padding: '22px 28px',
        background: GREEN,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        opacity: resultT,
        transform: `scale(${0.94 + 0.06 * resultT})`,
        boxShadow: '0 12px 36px rgba(21,163,74,0.4)',
      }}>
        <div>
          <div style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 14, color: 'rgba(255,255,255,0.75)',
            letterSpacing: '0.16em', marginBottom: 4,
          }}>{completedLabel}</div>
          <div style={{
            fontFamily: 'Anton, sans-serif',
            fontSize: 28, color: '#fff', lineHeight: 0.95,
          }}>{resultLabel}</div>
        </div>
        <div style={{
          fontFamily: 'Anton, sans-serif',
          fontSize: 96, color: '#fff', lineHeight: 0.85,
          fontVariantNumeric: 'tabular-nums',
        }}>{resultStat}</div>
      </div>

      <div style={{
        position: 'absolute', bottom: 90, left: 60, right: 60,
        padding: '22px 28px',
        background: RED,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        opacity: ctaT,
        transform: `translateY(${(1 - ctaT) * 16}px)`,
      }}>
        <div style={{ fontFamily: 'Anton, sans-serif', fontSize: 42, color: '#fff' }}>{ctaText}</div>
        <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 16, color: '#fff', letterSpacing: '0.1em' }}>ATHLETESACCEL.COM</div>
      </div>
    </div>
  );
}

window.ThirtyDayChallengeReel = ThirtyDayChallengeReel;

const THIRTY_DAY_CHALLENGE_SPEC = {
  id: 'thirty-day-challenge',
  name: '30 DAY CHALLENGE',
  fields: [
    { key: 'duration', label: 'Length', type: 'slider', default: 8, min: 4, max: 15, step: 0.5, unit: 's' },
    { key: 'eyebrow', label: 'Eyebrow tag', type: 'text', default: '30-DAY CHALLENGE' },
    { key: 'title1', label: 'Title line 1', type: 'text', default: 'SHOW UP' },
    { key: 'title2', label: 'Title line 2 (red)', type: 'text', default: '30 DAYS.' },
    { key: 'challengeName', label: 'Challenge name', type: 'text', default: 'JUMP ROPE · 5 MIN A DAY' },
    { key: 'totalDays', label: 'Days', type: 'number', default: 30, step: 1, min: 5, max: 100 },
    { key: 'completedLabel', label: 'Result eyebrow', type: 'text', default: 'YOU DID THIS:' },
    { key: 'resultStat', label: 'Result stat', type: 'text', default: '+3.4"' },
    { key: 'resultLabel', label: 'Result label', type: 'text', default: 'AVERAGE VERTICAL GAIN' },
    { key: 'ctaText', label: 'CTA text', type: 'text', default: 'JOIN THE NEXT ROUND →' },
  ],
};
window.THIRTY_DAY_CHALLENGE_SPEC = THIRTY_DAY_CHALLENGE_SPEC;
