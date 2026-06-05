// BATTI STAT (motion) — big tabular number scales in over playing footage, with a
// red unit and an outline stadium numeral (Batti's number device). Vertical.

function BattiStatMotion({ data = {} }) {
  const eyebrow = data.eyebrow ?? 'MANTENO SPORT PARENTS';
  const statValue = data.statValue ?? '224';
  const statUnit = data.statUnit ?? '%';
  const statLabel = data.statLabel ?? 'MORE VERTICAL JUMP THAN THE GRIND-IT-OUT GROUP';
  const claim = data.claim ?? "SO +1 MPH IN 30 SESSIONS ISN'T AGGRESSIVE.";
  const brand = data.brand ?? 'BATTI-PERFORMANCE';
  const bgClip = data.bgClip ?? null;

  const t = useTime();
  const RED = (window.__BRAND__ && window.__BRAND__.brand_red || '#c4141d');
  const clamp = (x) => Math.max(0, Math.min(1, x));
  const eyeT = clamp((t - 0.1) / 0.3);
  const numT = Easing.easeOutBack(clamp((t - 0.3) / 0.55));
  const labT = clamp((t - 0.9) / 0.4);
  const claimT = Easing.easeOutCubic(clamp((t - 1.3) / 0.5));
  const brandT = clamp((t - 1.9) / 0.4);

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#000000', overflow: 'hidden' }}>
      {bgClip ? <SyncedVideo src={bgClip} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} /> : null}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.5) 42%, rgba(0,0,0,0.55) 70%, rgba(0,0,0,0.92) 100%)' }} />

      <TplText field="eyebrow" data={data} base={{ position: 'absolute', top: 150, left: 64, right: 64 }}
        style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 30, color: RED, letterSpacing: '0.22em', textTransform: 'uppercase', opacity: eyeT }}>{eyebrow}</TplText>

      <div style={{ position: 'absolute', top: 360, left: 56, display: 'flex', alignItems: 'flex-start', opacity: clamp(numT * 2), transform: `scale(${0.7 + numT * 0.3})`, transformOrigin: 'left top' }}>
        <span style={{ fontFamily: 'Saira Condensed, sans-serif', fontWeight: 900, fontSize: 400, color: '#ffffff', lineHeight: 0.8, letterSpacing: '-0.02em' }}>{statValue}</span>
        <span style={{ fontFamily: 'Saira Condensed, sans-serif', fontWeight: 900, fontSize: 220, color: RED, lineHeight: 0.9 }}>{statUnit}</span>
      </div>

      <div style={{ position: 'absolute', top: 832, left: 64, height: 6, width: 560, background: RED, opacity: labT }} />
      <TplText field="statLabel" data={data} base={{ position: 'absolute', top: 858, left: 68, right: 64 }}
        style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 30, color: '#ffffff', letterSpacing: '0.1em', textTransform: 'uppercase', opacity: labT }}>{statLabel}</TplText>

      <TplText field="claim" data={data} base={{ position: 'absolute', top: 1470, left: 64, right: 64 }}
        style={{ fontFamily: 'Saira Condensed, sans-serif', fontWeight: 800, fontSize: 76, color: '#ffffff', lineHeight: 0.96, letterSpacing: '-0.005em', textTransform: 'uppercase', opacity: claimT, transform: `translateY(${(1 - claimT) * 16}px)` }}
        maxHeight={300} fitKey={claim}>{claim}</TplText>

      <TplText field="brand" data={data} base={{ position: 'absolute', bottom: 96, left: 64, right: 64 }}
        style={{ fontFamily: 'Saira Condensed, sans-serif', fontWeight: 900, fontSize: 30, color: '#ffffff', letterSpacing: '0.02em', textTransform: 'uppercase', opacity: brandT }}>{brand}</TplText>
    </div>
  );
}

window.BattiStatMotion = BattiStatMotion;

const BATTI_STAT_MOTION_SPEC = {
  id: 'batti-stat-motion',
  name: 'BATTI STAT (motion)',
  fields: [
    { "key": "duration", "label": "Length", "type": "slider", "default": 4, "min": 2, "max": 6, "step": 0.5, "unit": "s" },
    { "key": "bgClip", "label": "Background clip", "type": "image" },
    { "key": "eyebrow", "role": "eyebrow", "label": "Eyebrow", "type": "text", "default": "MANTENO SPORT PARENTS" },
    { "key": "statValue", "role": "stat", "label": "Stat value", "type": "text", "default": "224" },
    { "key": "statUnit", "role": "stat", "label": "Stat unit (red)", "type": "text", "default": "%" },
    { "key": "statLabel", "role": "stat", "label": "Stat label", "type": "text", "default": "MORE VERTICAL JUMP THAN THE GRIND-IT-OUT GROUP" },
    { "key": "claim", "role": "claim", "label": "Claim", "type": "text", "default": "SO +1 MPH IN 30 SESSIONS ISN'T AGGRESSIVE." },
    { "key": "brand", "role": "brand", "label": "Brand", "type": "text", "default": "BATTI-PERFORMANCE" }
  ],
};
window.BATTI_STAT_MOTION_SPEC = BATTI_STAT_MOTION_SPEC;
