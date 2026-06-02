// {eyebrow} — 9:16 Reel — 8s loop
// Stat-card slide-up over an action photo. Use to highlight an athlete's
// 90-day measurable gains.

function AthleteSpotlightReel({ data = {} }) {
  const eyebrow = data.eyebrow ?? 'ATHLETE SPOTLIGHT';
  const athleteFirst = data.athleteFirst ?? 'JORDAN';
  const athleteLast = data.athleteLast ?? 'K.';
  const athleteMeta = data.athleteMeta ?? 'U17 · FOOTBALL · CARMEL, IN';
  const ctaText = data.ctaText ?? 'RESULTS GUARANTEED';
  const media = data.media ?? 'assets/hero-sprint-male.jpg';

  const t = useTime();

  // Photo
  const photoScale = 1.08 - 0.08 * Math.min(1, t / 8);

  // Tag line at 0.6
  const tagT = Math.max(0, Math.min(1, (t - 0.6) / 0.4));

  // Name big slides in 1.0
  const nameT = Easing.easeOutCubic(Math.max(0, Math.min(1, (t - 1.0) / 0.5)));

  // 3 stat rows reveal staggered
  const stat1T = Easing.easeOutCubic(Math.max(0, Math.min(1, (t - 2.3) / 0.5)));
  const stat2T = Easing.easeOutCubic(Math.max(0, Math.min(1, (t - 2.9) / 0.5)));
  const stat3T = Easing.easeOutCubic(Math.max(0, Math.min(1, (t - 3.5) / 0.5)));

  // 90-day banner at 4.8
  const bannerT = Easing.easeOutBack(Math.max(0, Math.min(1, (t - 4.8) / 0.5)));

  const RED = '#c4141d';

  const StatRow = ({ label, before, after, gain, reveal, delay }) => {
    // count-up inside the row
    const innerT = Math.max(0, Math.min(1, (t - delay - 0.4) / 1.0));
    const eased = Easing.easeOutCubic(innerT);
    const value = (parseFloat(before) + (parseFloat(after) - parseFloat(before)) * eased).toFixed(after.includes('.') ? 1 : 0);
    return (
      <div style={{
        display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
        padding: '24px 0',
        borderBottom: '1px solid rgba(255,255,255,0.12)',
        opacity: reveal,
        transform: `translateX(${(1 - reveal) * -30}px)`,
      }}>
        <div style={{
          fontFamily: 'Anton, sans-serif',
          fontSize: 56, color: '#fff', letterSpacing: '0.01em',
        }}>{label}</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 24 }}>
          <div style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 56, color: '#fff', fontWeight: 700,
            fontVariantNumeric: 'tabular-nums',
          }}>{value}</div>
          <div style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 30, color: RED, fontWeight: 600,
          }}>{gain}</div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a0b0d', overflow: 'hidden' }}>
      <window.TrimmedMedia
        src={media}
        clipStart={data.media_clipStart}
        clipEnd={data.media_clipEnd}
        muted={!data.media_audio}
        style={{
          position: 'absolute', inset: 0,
          width: '100%', height: '100%',
          objectFit: 'cover', objectPosition: '50% 30%',
          transform: `scale(${photoScale})`,
          filter: 'contrast(1.05) saturate(0.85) brightness(0.7)',
        }}
      />
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, rgba(10,11,13,0.2) 0%, rgba(10,11,13,0.1) 35%, rgba(10,11,13,0.85) 65%, rgba(10,11,13,0.98) 100%)',
      }}/>

      {/* Top tag */}
      <Eyebrow top={140} left={60} fontSize={30} style={{ opacity: tagT }}>{eyebrow}</Eyebrow>

      {/* Name */}
      <div style={{
        position: 'absolute',
        bottom: 1020, left: 60, right: 60,
        opacity: nameT,
        transform: `translateY(${(1 - nameT) * 30}px)`,
      }}>
        <div style={{
          fontFamily: 'Anton, sans-serif',
          fontSize: 180,
          color: '#fff',
          lineHeight: 0.88,
        }}>{athleteFirst} <span style={{color: RED}}>{athleteLast}</span></div>
        <div style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: 28,
          color: '#c2c6cd',
          marginTop: 16,
          letterSpacing: '0.06em',
        }}>{athleteMeta}</div>
      </div>

      {/* Stat block */}
      <div style={{
        position: 'absolute',
        bottom: 340, left: 60, right: 60,
      }}>
        <div style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: 26,
          color: '#969ca7',
          letterSpacing: '0.16em',
          marginBottom: 16,
          opacity: stat1T,
        }}>// 90-DAY GAINS</div>
        <StatRow label="40 YD DASH" before="5.42" after="5.12" gain="−0.30s" reveal={stat1T} delay={2.3}/>
        <StatRow label="VERTICAL" before="24.0" after="28.5" gain="+4.5″" reveal={stat2T} delay={2.9}/>
        <StatRow label="BENCH 1RM" before="155" after="195" gain="+40 LB" reveal={stat3T} delay={3.5}/>
      </div>

      {/* Banner */}
      <div style={{
        position: 'absolute',
        bottom: 120, left: 60, right: 60,
        padding: '28px 36px',
        background: RED,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        opacity: bannerT,
        transform: `scale(${0.96 + 0.04 * bannerT})`,
        boxShadow: '0 12px 36px rgba(196,20,29,0.4)',
      }}>
        <div style={{
          fontFamily: 'Anton, sans-serif',
          fontSize: 56,
          color: '#fff',
        }}>{ctaText}</div>
        <div style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: 22,
          color: '#fff',
          letterSpacing: '0.08em',
        }}>ATHLETESACCEL.COM</div>
      </div>
    </div>
  );
}

window.AthleteSpotlightReel = AthleteSpotlightReel;

const ATHLETE_SPOTLIGHT_SPEC = {
  id: 'athlete-spotlight',
  name: 'ATHLETE SPOTLIGHT',
  fields: [
  {
    "key": "duration",
    "label": "Length",
    "type": "slider",
    "default": 8,
    "min": 3,
    "max": 15,
    "step": 0.5,
    "unit": "s"
  },
  {
    "key": "eyebrow",
    "label": "Eyebrow tag",
    "type": "text",
    "default": "ATHLETE SPOTLIGHT"
  },
  {
    "key": "athleteFirst",
    "label": "First name",
    "type": "text",
    "default": "JORDAN"
  },
  {
    "key": "athleteLast",
    "label": "Last name",
    "type": "text",
    "default": "K."
  },
  {
    "key": "athleteMeta",
    "label": "Meta line",
    "type": "text",
    "default": "U17 · FOOTBALL · CARMEL, IN"
  },
  {
    "key": "ctaText",
    "label": "CTA text",
    "type": "text",
    "default": "RESULTS GUARANTEED"
  },
  {
    "key": "media",
    "label": "Photo or video",
    "type": "image",
    "default": "assets/hero-sprint-male.jpg",
    "sub": "image or short video"
  }
],
};
window.ATHLETE_SPOTLIGHT_SPEC = ATHLETE_SPOTLIGHT_SPEC;
