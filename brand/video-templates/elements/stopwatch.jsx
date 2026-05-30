// STOPWATCH — Analog stopwatch face with sweeping hand + digital readout
// Counts up from 0 to targetSeconds. Use for time-challenge content.

function Stopwatch({
  targetSeconds = 12.43,
  label = 'YOUR TIME',
  unitLabel = 's',
  recordValue = 11.92,
  recordLabel = 'CURRENT RECORD',
}) {
  const t = window.useTime ? window.useTime() : 0;
  const RED = '#c4141d';

  // Sweep over 2 seconds
  const sweepDur = 2.0;
  const prog = Math.max(0, Math.min(1, t / sweepDur));
  const eased = window.Easing ? window.Easing.easeOutCubic(prog) : prog;
  const display = eased * targetSeconds;
  const angle = -90 + (display / 60) * 360;

  // Centiseconds for digital
  const secs = Math.floor(display);
  const cs = Math.floor((display % 1) * 100);
  const isFinal = t > sweepDur + 0.2;
  const beatRecord = isFinal && targetSeconds < recordValue;

  return (
    <div style={{
      width: '100%', height: '100%',
      padding: '5%', boxSizing: 'border-box',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      fontFamily: '"JetBrains Mono", monospace', color: '#fff',
    }}>
      <div style={{
        fontSize: 'clamp(11px, 1.5vw, 14px)',
        color: RED, letterSpacing: '0.18em', marginBottom: '3%',
      }}>// {label}</div>

      {/* Stopwatch face */}
      <div style={{
        position: 'relative',
        width: 'clamp(180px, 36vw, 360px)',
        aspectRatio: '1',
      }}>
        <svg viewBox="0 0 200 200" style={{ width: '100%', height: '100%' }}>
          {/* Outer ring */}
          <circle cx="100" cy="100" r="92" fill="#15171a" stroke={isFinal ? (beatRecord ? '#15a34a' : RED) : 'rgba(255,255,255,0.18)'} strokeWidth="4"
            style={{ filter: isFinal ? `drop-shadow(0 0 16px ${beatRecord ? '#15a34a' : RED})` : 'none', transition: 'all 200ms' }}/>
          {/* Tick marks */}
          {Array.from({ length: 60 }).map((_, i) => {
            const a = (i * 6) * Math.PI / 180;
            const isMajor = i % 5 === 0;
            const r1 = isMajor ? 80 : 84;
            const r2 = 88;
            return (
              <line key={i}
                x1={100 + r1 * Math.sin(a)} y1={100 - r1 * Math.cos(a)}
                x2={100 + r2 * Math.sin(a)} y2={100 - r2 * Math.cos(a)}
                stroke="rgba(255,255,255,0.3)" strokeWidth={isMajor ? 1.5 : 0.6}/>
            );
          })}
          {/* Hand */}
          <line x1="100" y1="100"
            x2={100 + 76 * Math.cos(angle * Math.PI / 180)}
            y2={100 + 76 * Math.sin(angle * Math.PI / 180)}
            stroke={RED} strokeWidth="3" strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 4px ${RED})` }}/>
          <circle cx="100" cy="100" r="6" fill={RED}/>
        </svg>
      </div>

      {/* Digital readout */}
      <div style={{
        marginTop: '4%',
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: 'clamp(36px, 8vw, 80px)',
        fontWeight: 800, color: '#fff', lineHeight: 0.9,
        fontVariantNumeric: 'tabular-nums',
        letterSpacing: '-0.03em',
      }}>{String(secs).padStart(2,'0')}.<span style={{ color: '#969ca7' }}>{String(cs).padStart(2,'0')}</span><span style={{ fontSize: '0.45em', color: '#969ca7', marginLeft: 6 }}>{unitLabel}</span></div>

      {/* Record callout */}
      <div style={{
        marginTop: 8,
        fontSize: 'clamp(11px, 1.4vw, 14px)',
        color: beatRecord ? '#15a34a' : '#969ca7',
        letterSpacing: '0.12em',
        fontWeight: 700,
      }}>{beatRecord
        ? `🏆 NEW RECORD · BEAT ${recordValue.toFixed(2)}${unitLabel}`
        : `${recordLabel}: ${recordValue.toFixed(2)}${unitLabel}`}</div>
    </div>
  );
}

window.Stopwatch = Stopwatch;
window.STOPWATCH_META = {
  id: 'stopwatch',
  name: 'STOPWATCH',
  category: 'Sports Visual',
  description: 'Analog stopwatch with sweeping hand + digital readout, animates to target time. Beat-the-record detection.',
  props: ['targetSeconds', 'label', 'unitLabel', 'recordValue', 'recordLabel'],
};
