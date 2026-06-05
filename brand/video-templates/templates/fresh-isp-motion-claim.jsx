// FRESH-ISP-MOTION-CLAIM — ISP-native mechanism/claim motion (beat C). Center-set
// Barlow Condensed claim with a blue accent + Barlow support line over a scrimmed
// ISP training clip. Built from scratch on the ISP design system. Distinct layout
// from the hook (center vs lower-third). Every color explicit ISP. Copy via data.*.

function FreshIspMotionClaim({ data = {} }) {
  const eyebrow = data.eyebrow ?? 'FORT WORTH SPORT PARENTS';
  const claim = data.claim ?? 'VELOCITY COMES FROM HOW AN ATHLETE MOVES.';
  const support = data.support ?? '';
  const brand = data.brand ?? 'IDEAL SPORTS PERFORMANCE';
  const bgClip = data.bgClip ?? null;

  const BLUE = (window.__BRAND__ && window.__BRAND__.brand_red) || '#2573b7';
  const t = useTime();
  const clamp = (x) => Math.max(0, Math.min(1, x));
  const ease = (x) => Easing.easeOutCubic(clamp(x));
  const inEye = ease((t - 0.1) / 0.4);
  const inClaim = ease((t - 0.4) / 0.7);
  const inSup = ease((t - 0.9) / 0.5);

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#1c1c1d', overflow: 'hidden' }}>
      {bgClip ? <SyncedVideo src={bgClip} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} /> : null}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(28,28,29,0.5) 0%, rgba(28,28,29,0.78) 42%, rgba(28,28,29,0.86) 60%, rgba(28,28,29,0.92) 100%)' }} />

      <div style={{ position: 'absolute', top: 150, left: 96, opacity: inEye }}>
        <TplText field="eyebrow" data={data} base={{}}
          style={{ display: 'inline-block', background: '#ffffff', color: BLUE, fontFamily: '"Barlow", sans-serif',
            fontWeight: 700, fontSize: 34, letterSpacing: '0.16em', textTransform: 'uppercase', padding: '13px 28px', borderRadius: 999 }}
        >{eyebrow}</TplText>
      </div>

      <div style={{ position: 'absolute', left: 100, top: 700, width: 150, height: 14, background: BLUE, opacity: inClaim }} />
      <TplText field="claim" data={data}
        base={{ position: 'absolute', top: 760, left: 96, right: 96 }}
        style={{ fontFamily: '"Barlow Condensed", "Anton", sans-serif', fontWeight: 800, fontSize: 116, color: '#ffffff',
          lineHeight: 0.92, letterSpacing: '0.004em', textTransform: 'uppercase', opacity: inClaim }}
        maxHeight={520} fitKey={claim}
      >{claim}</TplText>

      <TplText field="support" data={data}
        base={{ position: 'absolute', top: 1340, left: 98, right: 96 }}
        style={{ fontFamily: '"Barlow", sans-serif', fontWeight: 600, fontSize: 42, color: BLUE,
          lineHeight: 1.14, opacity: inSup }}
        maxHeight={260} fitKey={support}
      >{support}</TplText>

      <TplText field="brand" data={data}
        base={{ position: 'absolute', bottom: 78, left: 96, right: 96 }}
        style={{ fontFamily: '"Barlow", sans-serif', fontWeight: 600, fontSize: 30, color: '#ffffff',
          letterSpacing: '0.2em', textTransform: 'uppercase', opacity: 0.9 }}
      >{brand}</TplText>
    </div>
  );
}

window.FreshIspMotionClaim = FreshIspMotionClaim;

const FRESH_ISP_MOTION_CLAIM_SPEC = {
  id: 'fresh-isp-motion-claim',
  name: 'ISP MOTION CLAIM',
  fields: [
    { "key": "duration", "label": "Length", "type": "slider", "default": 6, "min": 4, "max": 10, "step": 0.5, "unit": "s" },
    { "key": "bgClip", "label": "Background clip", "type": "image" },
    { "key": "eyebrow", "role": "eyebrow", "label": "Eyebrow", "type": "text", "default": "FORT WORTH SPORT PARENTS" },
    { "key": "claim", "role": "mechanism", "label": "Claim", "type": "text", "default": "VELOCITY COMES FROM HOW AN ATHLETE MOVES." },
    { "key": "support", "role": "reframe", "label": "Support line", "type": "text", "default": "" },
    { "key": "brand", "role": "brand", "label": "Brand", "type": "text", "default": "IDEAL SPORTS PERFORMANCE" }
  ],
};
window.FRESH_ISP_MOTION_CLAIM_SPEC = FRESH_ISP_MOTION_CLAIM_SPEC;
