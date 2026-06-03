// COACH POV — 9:16 Reel — uses <CaptionBars>
// Talking-head footage with caption bars stacking up as the coach speaks.

function CoachPOVReel({ data = {} }) {
  const t = window.useTime ? window.useTime() : 0;
  const RED = (window.__BRAND__ && window.__BRAND__.brand_red || '#c4141d');

  const eyebrow = data.eyebrow ?? 'COACH POV';
  const coachName = data.coachName ?? 'COACH TORRES';
  const coachTitle = data.coachTitle ?? 'DIRECTOR OF PERFORMANCE';
  const caption1 = data.caption1 ?? 'SPEED IS BUILT';
  const caption2 = data.caption2 ?? 'IN THE OFF SEASON';
  const caption3 = data.caption3 ?? 'NOT THE GAME.';
  const accentLast = (data.accentLast !== false);
  const ctaText = data.ctaText ?? 'OFF-SEASON STARTS NOW →';
  const media = data.media ?? 'assets/photo-coach-action.jpg';

  const eyebrowT = Math.max(0, Math.min(1, (t - 0.3) / 0.4));
  const nameT = window.Easing ? window.Easing.easeOutCubic(Math.max(0, Math.min(1, (t - 0.6) / 0.5))) : 1;
  const ctaT = window.Easing ? window.Easing.easeOutBack(Math.max(0, Math.min(1, (t - 5.4) / 0.5))) : 1;

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a0b0d', overflow: 'hidden' }}>
      {window.TrimmedMedia && <window.TrimmedMedia
        src={media}
        clipStart={data.media_clipStart}
        clipEnd={data.media_clipEnd}
        muted={!data.media_audio}
        style={{
          position: 'absolute', inset: 0,
          width: '100%', height: '100%', objectFit: 'cover',
          objectPosition: '50% 30%',
          filter: 'contrast(1.05) saturate(0.9) brightness(0.65)',
        }}
      />}
      {/* Bottom dark gradient */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, rgba(10,11,13,0.7) 0%, rgba(10,11,13,0) 20%, rgba(10,11,13,0) 50%, rgba(10,11,13,0.95) 100%)',
      }}/>

      {/* Eyebrow */}
      <Eyebrow top={100} fontSize={22}>// {eyebrow}</Eyebrow>

      {/* Coach name plate top-right */}
      <div style={{
        position: 'absolute', top: 100, right: 60,
        textAlign: 'right',
        opacity: nameT,
        transform: `translateX(${(1 - nameT) * 20}px)`,
      }}>
        <div style={{
          fontFamily: 'Anton, sans-serif',
          fontSize: 60, color: '#fff', lineHeight: 0.9,
        }}>{coachName}</div>
        <div style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: 18, color: '#969ca7',
          letterSpacing: '0.14em', marginTop: 8,
        }}>{coachTitle}</div>
      </div>

      {/* Caption bars element fills lower 60% */}
      <div style={{
        position: 'absolute',
        top: 700, bottom: 230,
        left: 40, right: 40,
      }}>
        {window.CaptionBars && <window.CaptionBars
          phrases={[caption1, caption2, caption3].filter(Boolean)}
          staggerMs={700}
          accentIndices={accentLast ? [2] : []}
          align="bottom"
        />}
      </div>

      <div style={{
        position: 'absolute', bottom: 90, left: 60, right: 60,
        padding: '22px 28px',
        background: RED,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        opacity: ctaT,
        transform: `translateY(${(1 - ctaT) * 16}px)`,
      }}>
        <div style={{ fontFamily: 'Anton, sans-serif', fontSize: 44, color: '#fff' }}>{ctaText}</div>
        <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 16, color: '#fff', letterSpacing: '0.1em' }}>BOOK ASSESSMENT</div>
      </div>
    </div>
  );
}

window.CoachPOVReel = CoachPOVReel;

const COACH_POV_SPEC = {
  id: 'coach-pov',
  name: 'COACH POV',
  fields: [
  {
    "key": "duration",
    "label": "Length",
    "type": "slider",
    "default": 7,
    "min": 4,
    "max": 15,
    "step": 0.5,
    "unit": "s"
  },
  {
    "key": "eyebrow",
    "label": "Eyebrow tag",
    "type": "text",
    "default": "COACH POV"
  },
  {
    "key": "coachName",
    "label": "Coach name",
    "type": "text",
    "default": "COACH TORRES"
  },
  {
    "key": "coachTitle",
    "label": "Coach title",
    "type": "text",
    "default": "DIRECTOR OF PERFORMANCE"
  },
  {
    "key": "caption1",
    "label": "Caption 1",
    "type": "text",
    "default": "SPEED IS BUILT"
  },
  {
    "key": "caption2",
    "label": "Caption 2",
    "type": "text",
    "default": "IN THE OFF SEASON"
  },
  {
    "key": "caption3",
    "label": "Caption 3 (red)",
    "type": "text",
    "default": "NOT THE GAME."
  },
  {
    "key": "ctaText",
    "label": "CTA text",
    "type": "text",
    "default": "OFF-SEASON STARTS NOW →"
  },
  {
    "key": "media",
    "label": "Background photo/video",
    "type": "image",
    "default": "assets/photo-coach-action.jpg",
    "sub": "drop your raw coaching footage"
  }
],
};
window.COACH_POV_SPEC = COACH_POV_SPEC;
