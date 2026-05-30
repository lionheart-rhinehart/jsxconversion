// 90-DAY STAT REVEAL — 1:1 Feed Post — 6s loop
// Three guarantee stats animate in sequentially. Use as a brand-anchor post.

function StatRevealSquare({ data = {} }) {
  const eyebrow = data.eyebrow ?? '90-DAY GUARANTEE';
  const title1 = data.title1 ?? 'WE GUARANTEE';
  const title2 = data.title2 ?? 'RESULTS.';
  const ctaText = data.ctaText ?? 'BOOK YOUR FREE ASSESSMENT';

  const t = useTime();
  const RED = '#c4141d';

  // Three stat reveals
  const s1T = Easing.easeOutCubic(Math.max(0, Math.min(1, (t - 0.8) / 0.5)));
  const s2T = Easing.easeOutCubic(Math.max(0, Math.min(1, (t - 1.6) / 0.5)));
  const s3T = Easing.easeOutCubic(Math.max(0, Math.min(1, (t - 2.4) / 0.5)));

  // Count-up values
  const v1 = (Easing.easeOutCubic(Math.max(0, Math.min(1, (t - 1.0) / 0.7))) * 1).toFixed(0);
  const v2 = (Easing.easeOutCubic(Math.max(0, Math.min(1, (t - 1.8) / 0.7))) * 3).toFixed(0);
  const v3 = Easing.easeOutCubic(Math.max(0, Math.min(1, (t - 2.6) / 0.7)));

  // Bottom banner at 4
  const bannerT = Easing.easeOutBack(Math.max(0, Math.min(1, (t - 4.0) / 0.6)));

  // Eyebrow
  const eyebrowT = Math.max(0, Math.min(1, (t - 0.2) / 0.3));

  const Stat = ({ value, suffix, label, reveal, accent }) => (
    <div style={{
      flex: 1,
      borderRight: '1px solid rgba(255,255,255,0.12)',
      padding: '0 32px',
      opacity: reveal,
      transform: `translateY(${(1 - reveal) * 20}px)`,
    }}>
      <div style={{
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: 180,
        color: '#fff',
        fontWeight: 800,
        lineHeight: 0.85,
        fontVariantNumeric: 'tabular-nums',
        letterSpacing: '-0.03em',
      }}>
        <span style={{ color: accent ? RED : '#fff' }}>+</span>{value}<span style={{ fontSize: 100, color: '#969ca7' }}>{suffix}</span>
      </div>
      <div style={{
        marginTop: 24,
        fontFamily: 'Anton, sans-serif',
        fontSize: 56,
        color: '#fff',
        letterSpacing: '0.005em',
      }}>{label}</div>
    </div>
  );

  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: '#0a0b0d',
      overflow: 'hidden',
    }}>
      {/* subtle red glow corner */}
      <div style={{
        position: 'absolute',
        top: -200, right: -200,
        width: 600, height: 600,
        background: `radial-gradient(circle, ${RED}22 0%, transparent 60%)`,
        filter: 'blur(20px)',
      }}/>

      <div style={{
        position: 'absolute',
        top: 100, left: 100,
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: 28,
        color: RED,
        letterSpacing: '0.18em',
        opacity: eyebrowT,
      }}>// {eyebrow}</div>

      <div style={{
        position: 'absolute',
        top: 160, left: 100, right: 100,
        fontFamily: 'Anton, sans-serif',
        fontSize: 120,
        color: '#fff',
        lineHeight: 0.9,
        opacity: eyebrowT,
        transform: `translateY(${(1 - eyebrowT) * 12}px)`,
      }}>{title1}<br/><span style={{color: RED}}>{title2}</span></div>

      {/* Stats row */}
      <div style={{
        position: 'absolute',
        top: 530, left: 60, right: 60,
        display: 'flex',
        alignItems: 'flex-start',
        height: 320,
      }}>
        <Stat value={v1} suffix=" MPH" label="SPEED" reveal={s1T} accent/>
        <Stat value={v2} suffix={'"'} label="VERTICAL" reveal={s2T} accent/>
        <div style={{
          flex: 1,
          padding: '0 32px',
          opacity: s3T,
          transform: `translateY(${(1 - s3T) * 20}px)`,
        }}>
          <div style={{
            fontFamily: 'Anton, sans-serif',
            fontSize: 144,
            color: '#fff',
            lineHeight: 0.85,
            letterSpacing: '0.01em',
          }}>OR IT'S<br/><span style={{color: RED}}>FREE.</span></div>
        </div>
      </div>

      {/* Bottom CTA banner */}
      <div style={{
        position: 'absolute',
        bottom: 80, left: 60, right: 60,
        padding: '32px 40px',
        background: 'rgba(196,20,29,0.95)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        opacity: bannerT,
        transform: `translateY(${(1 - bannerT) * 30}px)`,
      }}>
        <div style={{
          fontFamily: 'Anton, sans-serif',
          fontSize: 64, color: '#fff', letterSpacing: '0.005em',
        }}>{ctaText}</div>
        <div style={{
          width: 80, height: 80,
          background: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'Anton, sans-serif',
          fontSize: 64, color: RED,
        }}>→</div>
      </div>
    </div>
  );
}

window.StatRevealSquare = StatRevealSquare;

const STAT_REVEAL_SPEC = {
  id: 'stat-reveal',
  name: 'STAT REVEAL',
  fields: [
  {
    "key": "duration",
    "label": "Length",
    "type": "slider",
    "default": 6,
    "min": 3,
    "max": 15,
    "step": 0.5,
    "unit": "s"
  },
  {
    "key": "eyebrow",
    "label": "Eyebrow tag",
    "type": "text",
    "default": "90-DAY GUARANTEE"
  },
  {
    "key": "title1",
    "label": "Title line 1",
    "type": "text",
    "default": "WE GUARANTEE"
  },
  {
    "key": "title2",
    "label": "Title line 2 (red)",
    "type": "text",
    "default": "RESULTS."
  },
  {
    "key": "ctaText",
    "label": "CTA text",
    "type": "text",
    "default": "BOOK YOUR FREE ASSESSMENT"
  }
],
};
window.STAT_REVEAL_SPEC = STAT_REVEAL_SPEC;
