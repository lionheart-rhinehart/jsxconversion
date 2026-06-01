// PLAY OF THE WEEK — 9:16 Reel — uses <TrajectoryArc>
function PlayOfWeekReel({ data = {} }) {
  const t = window.useTime ? window.useTime() : 0;
  const RED = '#c4141d';

  const eyebrow = data.eyebrow ?? 'PLAY OF THE WEEK';
  const title1 = data.title1 ?? 'WHEN TRAINING';
  const title2 = data.title2 ?? 'SHOWS UP.';
  const athleteName = data.athleteName ?? 'JORDAN K.';
  const athleteMeta = data.athleteMeta ?? 'U17 · 32 YARD TD RUN';
  const distance = (typeof data.distance === 'number') ? data.distance : 65;
  const height = (typeof data.height === 'number') ? data.height : 22;
  const trajUnit = data.trajUnit ?? 'YDS';
  const trajLabel = data.trajLabel ?? 'PLAY DISTANCE';
  const endLabel = data.endLabel ?? 'END ZONE';
  const insight = data.insight ?? 'Built in the weight room. Delivered on Friday night.';
  const ctaText = data.ctaText ?? 'BUILD YOURS →';
  const media = data.media ?? 'assets/photo-running.jpg';

  const eyebrowT = Math.max(0, Math.min(1, (t - 0.2) / 0.4));
  const titleT = window.Easing ? window.Easing.easeOutCubic(Math.max(0, Math.min(1, (t - 0.5) / 0.5))) : 1;
  const nameT = window.Easing ? window.Easing.easeOutCubic(Math.max(0, Math.min(1, (t - 1.0) / 0.5))) : 1;
  const arcT = Math.max(0, Math.min(1, (t - 1.4) / 0.4));
  const insightT = Math.max(0, Math.min(1, (t - 5.0) / 0.5));
  const ctaT = window.Easing ? window.Easing.easeOutBack(Math.max(0, Math.min(1, (t - 5.8) / 0.5))) : 1;

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
          filter: 'brightness(0.25) saturate(0.5)',
        }}
      />}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, rgba(10,11,13,0.5) 0%, rgba(10,11,13,0.95) 100%)',
      }}/>

      <div style={{
        position: 'absolute', top: 110, left: 60,
        padding: '8px 16px', background: RED,
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: 24, color: '#fff', letterSpacing: '0.16em',
        opacity: eyebrowT,
      }}>// {eyebrow}</div>

      <div style={{
        position: 'absolute', top: 200, left: 60, right: 60,
        fontFamily: 'Anton, sans-serif',
        fontSize: 140, color: '#fff', lineHeight: 0.88,
        opacity: titleT, transform: `translateY(${(1 - titleT) * 16}px)`,
      }}>{title1}<br/><span style={{ color: RED }}>{title2}</span></div>

      {/* Athlete name */}
      <div style={{
        position: 'absolute', top: 540, left: 60, right: 60,
        opacity: nameT,
      }}>
        <div style={{ fontFamily: 'Anton, sans-serif', fontSize: 56, color: '#fff', lineHeight: 0.95 }}>{athleteName}</div>
        <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 20, color: '#969ca7', letterSpacing: '0.12em', marginTop: 6 }}>{athleteMeta}</div>
      </div>

      {/* Trajectory arc */}
      <div style={{
        position: 'absolute', top: 720, left: 40, right: 40, height: 580,
        opacity: arcT, transform: `translateY(${(1 - arcT) * 16}px)`,
        background: 'rgba(15,17,21,0.85)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}>
        {window.TrajectoryArc && <window.TrajectoryArc
          distance={distance} height={height} unit={trajUnit}
          label={trajLabel} endLabel={endLabel}
        />}
      </div>

      <div style={{
        position: 'absolute', bottom: 230, left: 60, right: 60,
        padding: '20px 24px',
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.12)',
        borderLeft: `4px solid ${RED}`,
        opacity: insightT,
      }}>
        <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 16, color: RED, letterSpacing: '0.14em', marginBottom: 6 }}>// HOW IT HAPPENED</div>
        <div style={{ fontFamily: 'Geist, sans-serif', fontSize: 26, color: '#fff', fontWeight: 500, lineHeight: 1.35 }}>{insight}</div>
      </div>

      <div style={{
        position: 'absolute', bottom: 90, left: 60, right: 60,
        padding: '22px 28px', background: RED,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        opacity: ctaT,
      }}>
        <div style={{ fontFamily: 'Anton, sans-serif', fontSize: 44, color: '#fff' }}>{ctaText}</div>
        <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 16, color: '#fff', letterSpacing: '0.1em' }}>ATHLETESACCEL.COM</div>
      </div>
    </div>
  );
}
window.PlayOfWeekReel = PlayOfWeekReel;
const PLAY_OF_WEEK_SPEC = {
  id: 'play-of-week',
  name: 'PLAY OF THE WEEK',
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
    "label": "Eyebrow",
    "type": "text",
    "default": "PLAY OF THE WEEK"
  },
  {
    "key": "title1",
    "label": "Title 1",
    "type": "text",
    "default": "WHEN TRAINING"
  },
  {
    "key": "title2",
    "label": "Title 2 (red)",
    "type": "text",
    "default": "SHOWS UP."
  },
  {
    "key": "athleteName",
    "label": "Athlete name",
    "type": "text",
    "default": "JORDAN K."
  },
  {
    "key": "athleteMeta",
    "label": "Athlete meta",
    "type": "text",
    "default": "U17 · 32 YARD TD RUN"
  },
  {
    "key": "distance",
    "label": "Trajectory distance",
    "type": "number",
    "default": 65,
    "step": 1,
    "min": 5,
    "max": 200
  },
  {
    "key": "height",
    "label": "Peak height",
    "type": "number",
    "default": 22,
    "step": 1,
    "min": 1,
    "max": 100
  },
  {
    "key": "trajUnit",
    "label": "Unit",
    "type": "text",
    "default": "YDS"
  },
  {
    "key": "trajLabel",
    "label": "Trajectory label",
    "type": "text",
    "default": "PLAY DISTANCE"
  },
  {
    "key": "endLabel",
    "label": "End-zone label",
    "type": "text",
    "default": "END ZONE"
  },
  {
    "key": "insight",
    "label": "Insight text",
    "type": "textarea",
    "default": "Built in the weight room. Delivered on Friday night."
  },
  {
    "key": "ctaText",
    "label": "CTA text",
    "type": "text",
    "default": "BUILD YOURS →"
  },
  {
    "key": "media",
    "label": "Background photo/video",
    "type": "image",
    "default": "assets/photo-running.jpg"
  }
],
};
window.PLAY_OF_WEEK_SPEC = PLAY_OF_WEEK_SPEC;
