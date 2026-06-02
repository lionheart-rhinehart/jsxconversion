// FIVE-STAR REVIEW — 9:16 Reel — 8s loop
// Testimonial card: 5 stars pop in, quote types in, reviewer credited.
// Editable: source, rating, quote, reviewer, reviewer meta, photo.

const FIVE_STAR_REVIEW_SPEC = {
  id: 'five-star-review',
  name: 'FIVE-STAR REVIEW',
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
      "role": "eyebrow",
      "label": "Eyebrow",
      "type": "text",
      "default": "// ATHLETES ACCELERATION"
    },
    {
      "key": "source",
      "label": "Source tag",
      "type": "text",
      "default": "GOOGLE REVIEW"
    },
    {
      "key": "rating",
      "label": "Rating",
      "type": "slider",
      "default": 5,
      "min": 1,
      "max": 5,
      "step": 0.5,
      "unit": "★"
    },
    {
      "key": "quote",
      "label": "Quote",
      "type": "textarea",
      "default": "My son added 4 inches to his vertical in one season. The coaches actually care — best decision we made for his athletic career."
    },
    {
      "key": "reviewer",
      "label": "Reviewer",
      "type": "text",
      "default": "SARAH M."
    },
    {
      "key": "meta",
      "label": "Reviewer meta",
      "type": "text",
      "default": "PARENT · 2 SEASONS"
    },
    {
      "key": "photo",
      "label": "Photo (bg)",
      "type": "image",
      "default": "assets/photo-group-coaching.jpg",
      "sub": "shown dimmed behind"
    }
  ],
};

function FiveStarReviewReel({ data = {} }) {
  const t = useTime();
  const RED = '#c4141d', AMBER = '#f59e0b';

  const source   = data.source   ?? 'GOOGLE REVIEW';
  const rating   = Number(data.rating ?? 5);
  const quote    = data.quote    ?? '';
  const reviewer = data.reviewer ?? 'SARAH M.';
  const meta     = data.meta     ?? 'PARENT · 2 SEASONS';
  const photo    = data.photo    ?? 'assets/photo-group-coaching.jpg';

  const E = Easing;
  const sourceT = E.easeOutBack(Math.max(0, Math.min(1, (t - 0.3) / 0.4)));
  const starsIn = t > 0.7;
  // type-on the quote
  const quoteStart = 2.0, quoteDur = 2.2;
  const qp = Math.max(0, Math.min(1, (t - quoteStart) / quoteDur));
  const shown = Math.floor(qp * quote.length);
  const quoteShown = quote.slice(0, shown);
  const reviewerT = Math.max(0, Math.min(1, (t - 4.6) / 0.6));
  const logoT = Math.max(0, Math.min(1, (t - 5.2) / 0.6));

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a0b0d', overflow: 'hidden' }}>
      <div data-eyebrow style={{ position: 'absolute', top: 90, left: 90, right: 90, fontFamily: '"JetBrains Mono", monospace', fontSize: 34, color: '#c4141d', letterSpacing: '0.06em', textTransform: 'uppercase', zIndex: 5 }}>{data.eyebrow ?? "// ATHLETES ACCELERATION"}</div>
      <img src={photo} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
        opacity: 0.16, filter: 'grayscale(0.45) brightness(0.6)' }}/>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(10,11,13,0.85) 0%, rgba(10,11,13,0.55) 45%, rgba(10,11,13,0.96) 100%)' }}/>

      {/* Big quote mark */}
      <div style={{ position: 'absolute', top: 120, left: 60, fontFamily: 'Anton, sans-serif', fontSize: 360,
        color: RED, lineHeight: 0.7, opacity: 0.22 }}>“</div>

      {/* Source tag */}
      <div style={{ position: 'absolute', top: 240, left: 60, opacity: sourceT, transform: `translateY(${(1 - sourceT) * -14}px)` }}>
        <span style={{ display: 'inline-block', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.16)',
          color: '#fff', padding: '12px 26px', fontFamily: '"JetBrains Mono", monospace', fontSize: 28, letterSpacing: '0.14em' }}>
          // {source}
        </span>
      </div>

      {/* Stars */}
      <div style={{ position: 'absolute', top: 380, left: 60, right: 60, display: 'flex', justifyContent: 'flex-start',
        opacity: starsIn ? 1 : 0 }}>
        {window.StarRating && <window.StarRating rating={rating} size={130} gap={20} color={AMBER}/>}
      </div>

      {/* Quote (type-on) */}
      <div style={{ position: 'absolute', top: 580, left: 60, right: 70, fontFamily: '"Geist", sans-serif',
        fontWeight: 600, fontSize: 72, color: '#fff', lineHeight: 1.12, letterSpacing: '-0.01em', textWrap: 'pretty' }}>
        {quoteShown}<span style={{ opacity: qp < 1 && Math.floor(t * 2) % 2 ? 1 : 0, color: RED }}>|</span>
      </div>

      {/* Reviewer */}
      <div style={{ position: 'absolute', bottom: 250, left: 60, right: 60, opacity: reviewerT,
        transform: `translateX(${(1 - reviewerT) * -30}px)`, display: 'flex', alignItems: 'center', gap: 24 }}>
        <div style={{ width: 8, height: 80, background: RED }}/>
        <div>
          <div style={{ fontFamily: 'Anton, sans-serif', fontSize: 72, color: '#fff', lineHeight: 0.95 }}>{reviewer}</div>
          <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 26, color: '#969ca7', letterSpacing: '0.08em', marginTop: 6 }}>{meta}</div>
        </div>
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

window.FiveStarReviewReel = FiveStarReviewReel;
window.FIVE_STAR_REVIEW_SPEC = FIVE_STAR_REVIEW_SPEC;
