// FRESH-ISP-MOTION-PROOF — ISP-native proof/stat motion (beat E). A giant ISP-blue
// Barlow Condensed number scales in, with a white label, a secondary proof row, and
// a claim, over a heavily ink-washed clip. Stat values are factual ISP proof-of-record.
// Built from scratch on the ISP design system. Copy via data.*; numbers are defaults.

function FreshIspMotionProof({ data = {} }) {
  const eyebrow = data.eyebrow ?? 'FORT WORTH SPORT PARENTS';
  const statValue = data.statValue ?? '100+';
  const statLabel = data.statLabel ?? 'MLB DRAFT PICKS';
  const statRow = data.statRow ?? '1500+ ATHLETES TRAINED   ·   6 FIRST-ROUND PICKS';
  const claim = data.claim ?? 'A PROCESS LEAVING FINGERPRINTS, NOT A TALENT COLLECTION.';
  const brand = data.brand ?? 'IDEAL SPORTS PERFORMANCE';
  const bgClip = data.bgClip ?? null;

  const BLUE = (window.__BRAND__ && window.__BRAND__.brand_red) || '#2573b7';
  const t = useTime();
  const clamp = (x) => Math.max(0, Math.min(1, x));
  const ease = (x) => Easing.easeOutCubic(clamp(x));
  const inEye = ease((t - 0.1) / 0.4);
  const pop = Easing.easeOutBack(clamp((t - 0.4) / 0.6));
  const inLabel = ease((t - 0.85) / 0.5);
  const inClaim = ease((t - 1.15) / 0.6);

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#1c1c1d', overflow: 'hidden' }}>
      {bgClip ? <SyncedVideo src={bgClip} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} /> : null}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(28,28,29,0.8) 0%, rgba(28,28,29,0.84) 55%, rgba(28,28,29,0.95) 100%)' }} />

      <div style={{ position: 'absolute', top: 150, left: 96, opacity: inEye }}>
        <TplText field="eyebrow" data={data} base={{}}
          style={{ display: 'inline-block', background: '#ffffff', color: BLUE, fontFamily: '"Barlow", sans-serif',
            fontWeight: 700, fontSize: 34, letterSpacing: '0.16em', textTransform: 'uppercase', padding: '13px 28px', borderRadius: 999 }}
        >{eyebrow}</TplText>
      </div>

      <div style={{ position: 'absolute', top: 470, left: 90, right: 90, opacity: clamp(pop),
        transform: `scale(${0.7 + clamp(pop) * 0.3})`, transformOrigin: 'left top' }}>
        <TplText field="statValue" data={data} base={{}}
          style={{ fontFamily: '"Barlow Condensed", "Anton", sans-serif', fontWeight: 800, fontSize: 320, color: BLUE, lineHeight: 0.82, letterSpacing: '-0.01em' }}
        >{statValue}</TplText>
      </div>

      <TplText field="statLabel" data={data}
        base={{ position: 'absolute', top: 860, left: 100, right: 90 }}
        style={{ fontFamily: '"Barlow Condensed", "Anton", sans-serif', fontWeight: 700, fontSize: 92, color: '#ffffff',
          lineHeight: 0.94, textTransform: 'uppercase', opacity: inLabel }}
      >{statLabel}</TplText>

      <TplText field="statRow" data={data}
        base={{ position: 'absolute', top: 1010, left: 100, right: 90 }}
        style={{ fontFamily: '"Barlow", sans-serif', fontWeight: 600, fontSize: 40, color: '#7db0e3',
          letterSpacing: '0.04em', textTransform: 'uppercase', opacity: inLabel }}
      >{statRow}</TplText>

      <TplText field="claim" data={data}
        base={{ position: 'absolute', top: 1180, left: 96, right: 96 }}
        style={{ fontFamily: '"Barlow Condensed", "Anton", sans-serif', fontWeight: 700, fontSize: 64, color: '#ffffff',
          lineHeight: 0.98, textTransform: 'uppercase', opacity: inClaim }}
        maxHeight={360} fitKey={claim}
      >{claim}</TplText>

      <TplText field="brand" data={data}
        base={{ position: 'absolute', bottom: 78, left: 96, right: 96 }}
        style={{ fontFamily: '"Barlow", sans-serif', fontWeight: 600, fontSize: 30, color: '#ffffff',
          letterSpacing: '0.2em', textTransform: 'uppercase', opacity: 0.9 }}
      >{brand}</TplText>
    </div>
  );
}

window.FreshIspMotionProof = FreshIspMotionProof;

const FRESH_ISP_MOTION_PROOF_SPEC = {
  id: 'fresh-isp-motion-proof',
  name: 'ISP MOTION PROOF',
  fields: [
    { "key": "duration", "label": "Length", "type": "slider", "default": 6, "min": 4, "max": 10, "step": 0.5, "unit": "s" },
    { "key": "bgClip", "label": "Background clip", "type": "image" },
    { "key": "eyebrow", "role": "eyebrow", "label": "Eyebrow", "type": "text", "default": "FORT WORTH SPORT PARENTS" },
    { "key": "statValue", "role": "proof", "label": "Hero stat", "type": "text", "default": "100+" },
    { "key": "statLabel", "role": "proof", "label": "Stat label", "type": "text", "default": "MLB DRAFT PICKS" },
    { "key": "statRow", "role": "proof", "label": "Secondary proof row", "type": "text", "default": "1500+ ATHLETES TRAINED   ·   6 FIRST-ROUND PICKS" },
    { "key": "claim", "role": "claim", "label": "Claim", "type": "text", "default": "A PROCESS LEAVING FINGERPRINTS, NOT A TALENT COLLECTION." },
    { "key": "brand", "role": "brand", "label": "Brand", "type": "text", "default": "IDEAL SPORTS PERFORMANCE" }
  ],
};
window.FRESH_ISP_MOTION_PROOF_SPEC = FRESH_ISP_MOTION_PROOF_SPEC;
