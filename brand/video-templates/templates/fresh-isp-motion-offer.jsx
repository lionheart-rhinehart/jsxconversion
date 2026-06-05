// FRESH-ISP-MOTION-OFFER — ISP-native offer motion (beat F). Bottom-anchored offer
// headline over a scrimmed clip, with a rounded ISP-blue pill CTA that slides in.
// ISP has NO guarantee — the standing offer is the free first session. Built from
// scratch on the ISP design system. Copy via data.*; CTA is exempt free-form.

function FreshIspMotionOffer({ data = {} }) {
  const eyebrow = data.eyebrow ?? 'FORT WORTH SPORT PARENTS';
  const offer = data.offer ?? 'YOUR FIRST SESSION AT ISP IS FREE';
  const subline = data.subline ?? '';
  const cta = data.cta ?? 'BOOK A FREE FIRST SESSION';
  const brand = data.brand ?? 'IDEAL SPORTS PERFORMANCE';
  const bgClip = data.bgClip ?? null;

  const BLUE = (window.__BRAND__ && window.__BRAND__.brand_red) || '#2573b7';
  const t = useTime();
  const clamp = (x) => Math.max(0, Math.min(1, x));
  const ease = (x) => Easing.easeOutCubic(clamp(x));
  const inEye = ease((t - 0.1) / 0.4);
  const inOffer = ease((t - 0.4) / 0.7);
  const inCta = Easing.easeOutBack(clamp((t - 1.0) / 0.6));

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#1c1c1d', overflow: 'hidden' }}>
      {bgClip ? <SyncedVideo src={bgClip} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} /> : null}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(28,28,29,0.5) 0%, rgba(28,28,29,0.18) 28%, rgba(28,28,29,0.62) 60%, rgba(28,28,29,0.97) 100%)' }} />

      <div style={{ position: 'absolute', top: 150, left: 96, opacity: inEye }}>
        <TplText field="eyebrow" data={data} base={{}}
          style={{ display: 'inline-block', background: '#ffffff', color: BLUE, fontFamily: '"Barlow", sans-serif',
            fontWeight: 700, fontSize: 34, letterSpacing: '0.16em', textTransform: 'uppercase', padding: '13px 28px', borderRadius: 999 }}
        >{eyebrow}</TplText>
      </div>

      <div style={{ position: 'absolute', left: 100, top: 1100, width: 150, height: 14, background: BLUE, opacity: inOffer }} />
      <TplText field="offer" data={data}
        base={{ position: 'absolute', top: 1160, left: 96, right: 96 }}
        style={{ fontFamily: '"Barlow Condensed", "Anton", sans-serif', fontWeight: 800, fontSize: 110, color: '#ffffff',
          lineHeight: 0.9, letterSpacing: '0.004em', textTransform: 'uppercase', opacity: inOffer }}
        maxHeight={360} fitKey={offer}
      >{offer}</TplText>

      <div style={{ position: 'absolute', top: 1560, left: 96, opacity: clamp(inCta), transform: `translateY(${(1 - clamp(inCta)) * 24}px)` }}>
        <TplText field="cta" data={data} base={{}}
          style={{ display: 'inline-block', background: BLUE, color: '#ffffff', fontFamily: '"Barlow", sans-serif',
            fontWeight: 700, fontSize: 40, letterSpacing: '0.06em', textTransform: 'uppercase', padding: '22px 44px', borderRadius: 999 }}
        >{cta}</TplText>
      </div>

      <TplText field="brand" data={data}
        base={{ position: 'absolute', bottom: 64, left: 96, right: 96 }}
        style={{ fontFamily: '"Barlow", sans-serif', fontWeight: 600, fontSize: 28, color: '#ffffff',
          letterSpacing: '0.2em', textTransform: 'uppercase', opacity: 0.85 }}
      >{brand}</TplText>
    </div>
  );
}

window.FreshIspMotionOffer = FreshIspMotionOffer;

const FRESH_ISP_MOTION_OFFER_SPEC = {
  id: 'fresh-isp-motion-offer',
  name: 'ISP MOTION OFFER',
  fields: [
    { "key": "duration", "label": "Length", "type": "slider", "default": 6, "min": 4, "max": 10, "step": 0.5, "unit": "s" },
    { "key": "bgClip", "label": "Background clip", "type": "image" },
    { "key": "eyebrow", "role": "eyebrow", "label": "Eyebrow", "type": "text", "default": "FORT WORTH SPORT PARENTS" },
    { "key": "offer", "role": "offer", "label": "Offer headline", "type": "text", "default": "YOUR FIRST SESSION AT ISP IS FREE" },
    { "key": "subline", "role": "reframe", "label": "Subline", "type": "text", "default": "" },
    { "key": "cta", "role": "cta", "label": "CTA", "type": "text", "default": "BOOK A FREE FIRST SESSION" },
    { "key": "brand", "role": "brand", "label": "Brand", "type": "text", "default": "IDEAL SPORTS PERFORMANCE" }
  ],
};
window.FRESH_ISP_MOTION_OFFER_SPEC = FRESH_ISP_MOTION_OFFER_SPEC;
