// PRICING & PACKAGES — 9:16 Reel — 8s loop
// Three-tier reveal. Mid-tier is the "RECOMMENDED" one.

function PricingTiersReel({ data = {} }) {
  const eyebrow = data.eyebrow ?? 'PICK YOUR PACE';
  const title1 = data.title1 ?? 'THREE LEVELS.';
  const title2 = data.title2 ?? 'ONE PROMISE.';
  const guarantee = data.guarantee ?? '+1 MPH · +3" · 90 DAYS · OR FREE';
  const guaranteeSub = data.guaranteeSub ?? 'RESULTS GUARANTEED · ATHLETESACCEL.COM';

  const t = useTime();
  const RED = '#c4141d';

  const eyebrowT = Math.max(0, Math.min(1, (t - 0.2) / 0.4));
  const titleT = Easing.easeOutCubic(Math.max(0, Math.min(1, (t - 0.5) / 0.5)));

  const tiers = [
    {
      name: 'FOUNDATION',
      sub: 'BUILD THE BASE',
      price: '249',
      per: '/ MO',
      includes: ['2 SESSIONS / WEEK', 'GROUP TRAINING', 'BASELINE ASSESSMENT', 'QUARTERLY CHECK-IN'],
      recommended: false,
    },
    {
      name: 'ACCELERATE',
      sub: 'MOST POPULAR',
      price: '399',
      per: '/ MO',
      includes: ['4 SESSIONS / WEEK', 'INDIVIDUALIZED PROGRAM', 'MONTHLY DATA REVIEW', 'VIDEO ANALYSIS', '90-DAY GUARANTEE'],
      recommended: true,
    },
    {
      name: 'ELITE',
      sub: 'D1 PIPELINE',
      price: '649',
      per: '/ MO',
      includes: ['UNLIMITED ACCESS', '1-ON-1 COACHING', 'NUTRITION PLAN', 'COLLEGE RECRUITING SUPPORT'],
      recommended: false,
    },
  ];

  const tierT = (i) => Easing.easeOutCubic(Math.max(0, Math.min(1, (t - (1.4 + i * 0.6)) / 0.5)));

  const guarT = Easing.easeOutCubic(Math.max(0, Math.min(1, (t - 5.4) / 0.5)));

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a0b0d', overflow: 'hidden' }}>
      {/* faint red glow */}
      <div style={{
        position: 'absolute',
        top: -300, left: -300,
        width: 800, height: 800,
        background: `radial-gradient(circle, ${RED}25 0%, transparent 60%)`,
        filter: 'blur(40px)',
      }}/>

      <div style={{
        position: 'absolute', top: 110, left: 60, right: 60,
        opacity: eyebrowT,
      }}>
        <Eyebrow top={150} fontSize={28}>// {eyebrow}</Eyebrow>
      </div>

      <div style={{
        position: 'absolute', top: 180, left: 60, right: 60,
        fontFamily: 'Anton, sans-serif',
        fontSize: 140, color: '#fff', lineHeight: 0.88,
        opacity: titleT,
        transform: `translateY(${(1 - titleT) * 18}px)`,
      }}>{title1}<br/><span style={{color: RED}}>{title2}</span></div>

      {/* Tier cards */}
      <div style={{
        position: 'absolute', top: 520, left: 50, right: 50,
        display: 'flex', flexDirection: 'column', gap: 16,
      }}>
        {tiers.map((tier, i) => {
          const r = tierT(i);
          const isRec = tier.recommended;
          return (
            <div key={i} style={{
              position: 'relative',
              padding: '24px 28px',
              background: isRec ? RED : 'rgba(31,34,39,0.85)',
              border: isRec ? `2px solid ${RED}` : '1px solid rgba(255,255,255,0.1)',
              boxShadow: isRec ? '0 16px 48px rgba(196,20,29,0.4)' : 'none',
              opacity: r,
              transform: `translateY(${(1 - r) * 30}px) scale(${isRec ? 1 : 1})`,
            }}>
              {isRec && (
                <div style={{
                  position: 'absolute',
                  top: -16, right: 24,
                  padding: '6px 12px',
                  background: '#fff',
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: 16, fontWeight: 700,
                  color: RED, letterSpacing: '0.1em',
                }}>↘ RECOMMENDED</div>
              )}
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                <div>
                  <div style={{
                    fontFamily: 'Anton, sans-serif',
                    fontSize: 56, color: '#fff', lineHeight: 0.95,
                  }}>{tier.name}</div>
                  <div style={{
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: 16, color: isRec ? 'rgba(255,255,255,0.85)' : '#969ca7',
                    letterSpacing: '0.12em', marginTop: 4,
                  }}>{tier.sub}</div>
                </div>
                <div style={{
                  display: 'flex', alignItems: 'baseline', gap: 4,
                }}>
                  <div style={{
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: 80, color: '#fff', fontWeight: 800,
                    lineHeight: 0.85,
                    fontVariantNumeric: 'tabular-nums',
                  }}><span style={{ fontSize: 36 }}>$</span>{tier.price}</div>
                  <div style={{
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: 18, color: isRec ? 'rgba(255,255,255,0.7)' : '#969ca7',
                    letterSpacing: '0.1em',
                  }}>{tier.per}</div>
                </div>
              </div>
              <div style={{
                marginTop: 14,
                display: 'flex', flexWrap: 'wrap', gap: '6px 14px',
              }}>
                {tier.includes.map((b, j) => (
                  <div key={j} style={{
                    display: 'flex', gap: 6, alignItems: 'center',
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: 14, color: isRec ? 'rgba(255,255,255,0.9)' : '#c2c6cd',
                    letterSpacing: '0.04em',
                  }}>
                    <span style={{
                      color: isRec ? '#fff' : RED,
                      fontWeight: 700,
                    }}>✓</span>
                    {b}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Guarantee strip */}
      <div style={{
        position: 'absolute',
        bottom: 110, left: 60, right: 60,
        padding: '20px 24px',
        background: '#fff',
        textAlign: 'center',
        opacity: guarT,
        transform: `translateY(${(1 - guarT) * 16}px)`,
      }}>
        <div style={{
          fontFamily: 'Anton, sans-serif',
          fontSize: 42, color: RED, letterSpacing: '0.005em',
        }}>{guarantee}</div>
        <div style={{
          marginTop: 6,
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: 14, color: '#0a0b0d', fontWeight: 700,
          letterSpacing: '0.12em',
        }}>{guaranteeSub}</div>
      </div>
    </div>
  );
}

window.PricingTiersReel = PricingTiersReel;

const PRICING_TIERS_SPEC = {
  id: 'pricing-tiers',
  name: 'PRICING TIERS',
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
    "default": "PICK YOUR PACE"
  },
  {
    "key": "title1",
    "label": "Title line 1",
    "type": "text",
    "default": "THREE LEVELS."
  },
  {
    "key": "title2",
    "label": "Title line 2 (red)",
    "type": "text",
    "default": "ONE PROMISE."
  },
  {
    "key": "guarantee",
    "label": "Guarantee headline",
    "type": "text",
    "default": "+1 MPH · +3\" · 90 DAYS · OR FREE"
  },
  {
    "key": "guaranteeSub",
    "label": "Guarantee sub",
    "type": "text",
    "default": "RESULTS GUARANTEED · ATHLETESACCEL.COM"
  }
],
};
window.PRICING_TIERS_SPEC = PRICING_TIERS_SPEC;
