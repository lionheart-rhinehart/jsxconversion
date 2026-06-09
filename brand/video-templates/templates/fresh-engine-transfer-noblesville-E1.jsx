// FRESH-ENGINE-TRANSFER-NOBLESVILLE-E1 — AA "star-testimonial" PROOF creative (beat E).
// Built from scratch on the Athletes Acceleration design system, guided by example
// ex-076-star-testimonial. GRAPHIC / data-viz archetype — NO background photo (photo-free
// by rule). A parent quote card on deep INK: a HUGE red quotation glyph anchors the upper
// left, a mono eyebrow chip sits beside it, a row of five small red stars rates the review,
// and the testimonial QUOTE owns the frame as the dominant element (large Geist, sentence
// case preserved — we do NOT force-uppercase a human quote). A byline sits under the quote,
// AA wordmark bottom-left. useTime() inside the body eases the quote + stars in cleanly.
// All copy via data.*; one accent (#c4141d). Vertical-native 1080x1920.

function FreshEngineTransferNoblesvilleE1Reel({ data = {} }) {
  const eyebrow = data.eyebrow ?? 'NOBLESVILLE SPORT PARENTS';
  const testimonial = data.testimonial ?? 'One mom told us her son built his foundation with us the right way, and it carried all the way to a D2 scholarship.';
  const byline = data.byline ?? 'AA PARENT';
  const brand = data.brand ?? 'ATHLETES ACCELERATION';

  const RED = (window.__BRAND__ && window.__BRAND__.brand_red || '#c4141d');
  const INK = '#0a0b0d';
  const PANEL = '#15171a';
  const t = useTime();
  const clamp = (x) => Math.max(0, Math.min(1, x));
  const ease = (x) => Easing.easeOutCubic(clamp(x));

  const inMark = ease((t - 0.08) / 0.40);   // giant quote glyph
  const inKick = ease((t - 0.20) / 0.40);   // eyebrow chip
  const inQuote = ease((t - 0.55) / 0.80);  // dominant testimonial
  const inByline = ease((t - 1.20) / 0.50); // byline under the quote
  const riseQuote = (1 - inQuote) * 40;

  // five small red stars — each pops in staggered (rating reveal)
  const Star = ({ k }) => {
    const s = ease((t - (0.85 + k * 0.10)) / 0.30);
    return (
      <div key={k} style={{ opacity: s, transform: `scale(${0.6 + 0.4 * s})`, transformOrigin: 'center' }}>
        <svg width="56" height="56" viewBox="0 0 24 24" fill={RED} aria-hidden="true">
          <path d="M12 2.2l2.95 5.98 6.6.96-4.78 4.66 1.13 6.58L12 17.27l-5.9 3.1 1.13-6.58L2.45 9.14l6.6-.96L12 2.2z" />
        </svg>
      </div>
    );
  };

  return (
    <div style={{ position: 'absolute', inset: 0, background: INK, overflow: 'hidden' }}>
      {/* subtle raised vignette to give the ink depth (no photo) */}
      <div style={{ position: 'absolute', inset: 0,
        background: 'radial-gradient(120% 80% at 18% 28%, rgba(21,23,26,0.9) 0%, rgba(10,11,13,0) 60%)' }} />

      {/* left red accent column, wipes down */}
      <div style={{ position: 'absolute', left: 0, top: 0, width: 16, height: 1920,
        background: RED, transform: `scaleY(${inKick})`, transformOrigin: 'top' }} />

      {/* GIANT red quotation glyph — anchors the card upper-left, sits behind the eyebrow */}
      <div style={{ position: 'absolute', top: 96, left: 80,
        fontFamily: 'Georgia, "Times New Roman", serif', fontSize: 300, lineHeight: 0.8,
        color: RED, fontWeight: 700, opacity: 0.22 * inMark,
        transform: `translateY(${(1 - inMark) * 18}px)` }}>&ldquo;</div>

      {/* mono eyebrow chip, top-left (over the glyph) */}
      <div style={{ position: 'absolute', top: 156, left: 96, opacity: inKick }}>
        <TplText field="eyebrow" data={data}
          base={{ display: 'inline-block', padding: '12px 22px', background: PANEL,
            border: `1px solid ${RED}`, borderRadius: 6 }}
          style={{ color: RED, fontFamily: '"JetBrains Mono", ui-monospace, monospace',
            fontWeight: 700, fontSize: 28, letterSpacing: '0.18em', textTransform: 'uppercase' }}
          fitKey={eyebrow}
        >{eyebrow}</TplText>
      </div>

      {/* five red stars — staggered rating reveal */}
      <div style={{ position: 'absolute', top: 300, left: 92, display: 'flex', gap: 22, alignItems: 'center' }}>
        {[0, 1, 2, 3, 4].map((k) => <Star key={k} k={k} />)}
      </div>

      {/* DOMINANT testimonial quote — large Geist, sentence case preserved (a human quote) */}
      <TplText field="testimonial" data={data}
        base={{ position: 'absolute', left: 96, right: 96, top: 430 }}
        style={{ fontFamily: '"Geist", "Inter", sans-serif', fontWeight: 600, fontSize: 92,
          color: '#ffffff', lineHeight: 1.04, letterSpacing: '-0.01em',
          textShadow: '0 4px 22px rgba(0,0,0,0.55)',
          opacity: inQuote, transform: `translateY(${riseQuote}px)` }}
        maxHeight={980} fitKey={testimonial}
      >{testimonial}</TplText>

      {/* byline under the quote */}
      <div style={{ position: 'absolute', bottom: 300, left: 96, right: 96, opacity: inByline,
        transform: `translateX(${(1 - inByline) * -20}px)` }}>
        <div style={{ width: 64, height: 5, background: RED, marginBottom: 18 }} />
        <TplText field="byline" data={data} base={{}}
          style={{ fontFamily: '"Anton", "Oswald", sans-serif', fontWeight: 400, fontSize: 52,
            color: '#ffffff', letterSpacing: '0.02em', textTransform: 'uppercase' }}
          fitKey={byline}
        >{byline}</TplText>
      </div>

      {/* wordmark, bottom-left */}
      <TplText field="brand" data={data}
        base={{ position: 'absolute', bottom: 96, left: 96, right: 96 }}
        style={{ fontFamily: '"Geist", "Inter", sans-serif', fontWeight: 600, fontSize: 30,
          color: '#ffffff', letterSpacing: '0.2em', textTransform: 'uppercase', opacity: 0.9 }}
      >{brand}</TplText>
    </div>
  );
}

window.FreshEngineTransferNoblesvilleE1Reel = FreshEngineTransferNoblesvilleE1Reel;

const FRESH_ENGINE_TRANSFER_NOBLESVILLE_E1_SPEC = {
  id: 'fresh-engine-transfer-noblesville-E1',
  name: 'ENGINE-TRANSFER E1 — STAR TESTIMONIAL',
  fields: [
    { "key": "duration", "label": "Length", "type": "slider", "default": 7, "min": 4, "max": 10, "step": 0.5, "unit": "s" },
    { "key": "eyebrow", "role": "eyebrow", "label": "Eyebrow", "type": "text", "default": "NOBLESVILLE SPORT PARENTS" },
    { "key": "testimonial", "role": "testimonial", "label": "Testimonial quote", "type": "textarea", "default": "One mom told us her son built his foundation with us the right way, and it carried all the way to a D2 scholarship." },
    { "key": "byline", "role": "byline", "label": "Byline", "type": "text", "default": "AA PARENT" },
    { "key": "brand", "role": "brand", "label": "Brand", "type": "text", "default": "ATHLETES ACCELERATION" }
  ],
};
window.FRESH_ENGINE_TRANSFER_NOBLESVILLE_E1_SPEC = FRESH_ENGINE_TRANSFER_NOBLESVILLE_E1_SPEC;
