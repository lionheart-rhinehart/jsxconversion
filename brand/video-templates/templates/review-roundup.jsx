// REVIEW ROUNDUP — 9:16 Reel — 8s loop
// Aggregate proof: big average rating + N reviews, then three short
// review cards slide up in sequence. Editable: avg, count, 3 reviews.

const REVIEW_ROUNDUP_SPEC = {
  id: 'review-roundup',
  name: 'REVIEW ROUNDUP',
  fields: [
  {
    "key": "duration",
    "label": "Length",
    "type": "slider",
    "default": 8,
    "min": 4,
    "max": 15,
    "step": 0.5,
    "unit": "s"
  },
  {
    "key": "eyebrow",
    "label": "Eyebrow",
    "type": "text",
    "default": "WHAT FAMILIES SAY"
  },
  {
    "key": "avg",
    "label": "Avg rating",
    "type": "text",
    "default": "4.9"
  },
  {
    "key": "count",
    "label": "Review count",
    "type": "text",
    "default": "180+ REVIEWS"
  },
  {
    "key": "r1",
    "label": "Review 1",
    "type": "text",
    "default": "Coaches who actually know youth development. — JEN R."
  },
  {
    "key": "r2",
    "label": "Review 2",
    "type": "text",
    "default": "My daughter is faster AND more confident. — MIKE T."
  },
  {
    "key": "r3",
    "label": "Review 3",
    "type": "text",
    "default": "Worth every dollar. Real measurable gains. — PRIYA K."
  }
],
};

function ReviewRoundupReel({ data = {} }) {
  const t = useTime();
  const RED = '#c4141d', AMBER = '#f59e0b';

  const eyebrow = data.eyebrow ?? 'WHAT FAMILIES SAY';
  const avg     = data.avg     ?? '4.9';
  const count   = data.count   ?? '180+ REVIEWS';
  const reviews = [data.r1 ?? '', data.r2 ?? '', data.r3 ?? ''];

  const E = Easing;
  const eyebrowT = E.easeOutBack(Math.max(0, Math.min(1, (t - 0.3) / 0.4)));
  const avgT     = E.easeOutCubic(Math.max(0, Math.min(1, (t - 0.8) / 0.6)));
  const starsIn  = t > 1.2;
  const logoT    = Math.max(0, Math.min(1, (t - 5.4) / 0.6));

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a0b0d', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(100% 60% at 50% 22%, rgba(245,158,11,0.12) 0%, rgba(10,11,13,0.7) 55%, #0a0b0d 100%)' }}/>

      {/* Eyebrow */}
      <Eyebrow top={150} fontSize={34} style={{ left: 0, right: 0, textAlign: 'center', opacity: eyebrowT }}>{eyebrow}</Eyebrow>

      {/* Avg rating block */}
      <div style={{ position: 'absolute', top: 240, left: 0, right: 0, textAlign: 'center', opacity: avgT,
        transform: `translateY(${(1 - avgT) * 20}px)` }}>
        <div style={{ fontFamily: 'Anton, sans-serif', fontSize: 280, color: '#fff', lineHeight: 0.82 }}>{avg}</div>
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: -10, opacity: starsIn ? 1 : 0 }}>
          {window.StarRating && <window.StarRating rating={Math.round(parseFloat(avg) * 2) / 2} size={86} gap={12} color={AMBER}/>}
        </div>
        <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 32, color: '#969ca7', letterSpacing: '0.16em', marginTop: 20 }}>{count}</div>
      </div>

      {/* Review cards */}
      <div style={{ position: 'absolute', bottom: 230, left: 60, right: 60, display: 'flex', flexDirection: 'column', gap: 22 }}>
        {reviews.map((r, i) => {
          const rT = E.easeOutCubic(Math.max(0, Math.min(1, (t - (2.6 + i * 0.55)) / 0.6)));
          return (
            <div key={i} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              borderLeft: `5px solid ${RED}`, padding: '26px 30px', opacity: rT,
              transform: `translateY(${(1 - rT) * 40}px)` }}>
              <div style={{ display: 'flex', gap: 5, marginBottom: 12 }}>
                {[0,1,2,3,4].map((s) => (
                  <span key={s} style={{ color: AMBER, fontSize: 30 }}>★</span>
                ))}
              </div>
              <div style={{ fontFamily: '"Geist", sans-serif', fontWeight: 500, fontSize: 36, color: '#e8eaed',
                lineHeight: 1.3, textWrap: 'pretty' }}>{r}</div>
            </div>
          );
        })}
      </div>

      {/* Logo */}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 90, textAlign: 'center', opacity: logoT,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <img src="assets/logo.png" style={{ width: 60, height: 60, objectFit: 'contain' }}/>
        <div style={{ fontFamily: 'Anton, sans-serif', fontSize: 34, color: '#fff' }}>ATHLETES ACCELERATION</div>
      </div>
    </div>
  );
}

window.ReviewRoundupReel = ReviewRoundupReel;
window.REVIEW_ROUNDUP_SPEC = REVIEW_ROUNDUP_SPEC;
