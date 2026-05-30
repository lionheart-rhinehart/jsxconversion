// BEFORE / AFTER — 9:16 Reel — 6s loop
// A vertical wipe revealing the "after" half. Use for transformation posts.

function BeforeAfterReel({ data = {} }) {
  const eyebrow = data.eyebrow ?? '90-DAY TRANSFORMATION';
  const beforeLabel = data.beforeLabel ?? 'BEFORE';
  const afterLabel = data.afterLabel ?? 'AFTER';
  const beforeDay = data.beforeDay ?? '00';
  const afterDay = data.afterDay ?? '90';
  const statLabel = data.statLabel ?? '40 YD DASH · MEASURED RESULTS';
  const beforeValue = data.beforeValue ?? '5.42';
  const afterValue = data.afterValue ?? '5.12';
  const statDelta = data.statDelta ?? '−0.30s';
  const mediaBefore = data.mediaBefore ?? 'assets/photo-running.jpg';
  const mediaAfter = data.mediaAfter ?? 'assets/hero-sprint-male.jpg';

  const t = useTime();
  const RED = '#c4141d';

  // Wipe sweeps right at 1.0-2.6s, holds, sweeps back at 4.6-5.6s
  const cycle = t;
  let wipe = 0;
  if (cycle < 1.0) wipe = 0;
  else if (cycle < 2.6) wipe = Easing.easeInOutCubic((cycle - 1.0) / 1.6);
  else if (cycle < 4.6) wipe = 1;
  else if (cycle < 5.6) wipe = 1 - Easing.easeInOutCubic((cycle - 4.6) / 1.0);
  else wipe = 0;

  // Eyebrow + headline
  const eyebrowT = Math.max(0, Math.min(1, (t - 0.2) / 0.4));
  const titleT = Easing.easeOutCubic(Math.max(0, Math.min(1, (t - 0.5) / 0.5)));

  // Stat panel
  const statT = Easing.easeOutCubic(Math.max(0, Math.min(1, (t - 2.6) / 0.5)));

  // labels
  const beforeOp = wipe < 0.95 ? 1 : 0;
  const afterOp = wipe > 0.05 ? 1 : 0;

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a0b0d', overflow: 'hidden' }}>
      {/* BEFORE photo full bleed */}
      <window.TrimmedMedia
        src={mediaBefore}
        clipStart={data.mediaBefore_clipStart}
        clipEnd={data.mediaBefore_clipEnd}
        muted={!data.mediaBefore_audio}
        style={{
        position: 'absolute', inset: 0,
        width: '100%', height: '100%', objectFit: 'cover',
        objectPosition: '50% 40%',
        filter: 'grayscale(0.8) contrast(0.95) brightness(0.7)',
      }}
      />
      {/* AFTER photo revealed by wipe — clip from left */}
      <div style={{
        position: 'absolute', inset: 0,
        clipPath: `inset(0 0 0 ${(1 - wipe) * 100}%)`,
      }}>
        <window.TrimmedMedia
          src={mediaAfter}
          clipStart={data.mediaAfter_clipStart}
          clipEnd={data.mediaAfter_clipEnd}
          muted={!data.mediaAfter_audio}
          style={{
          width: '100%', height: '100%', objectFit: 'cover',
          objectPosition: '50% 40%',
          filter: 'contrast(1.1) saturate(1.05) brightness(0.95)',
        }}
        />
      </div>

      {/* Wipe line */}
      <div style={{
        position: 'absolute',
        left: `${wipe * 100}%`,
        top: 0, bottom: 0,
        width: 6,
        background: RED,
        boxShadow: `0 0 24px ${RED}`,
        transform: 'translateX(-3px)',
      }}>
        {/* Drag handle indicator */}
        <div style={{
          position: 'absolute',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 64, height: 64,
          background: '#fff',
          borderRadius: 32,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'Anton, sans-serif',
          fontSize: 36, color: RED,
          boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
        }}>⇆</div>
      </div>

      {/* Bottom dark overlay for text legibility */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, rgba(10,11,13,0.6) 0%, rgba(10,11,13,0) 28%, rgba(10,11,13,0) 55%, rgba(10,11,13,0.95) 100%)',
      }}/>

      {/* BEFORE label */}
      <div style={{
        position: 'absolute',
        top: 220, left: 50,
        opacity: beforeOp,
        transition: 'opacity 200ms',
      }}>
        <div style={{
          padding: '6px 14px',
          background: 'rgba(10,11,13,0.85)',
          border: '1px solid #969ca7',
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: 22, color: '#969ca7', letterSpacing: '0.18em',
          marginBottom: 10, display: 'inline-block',
        }}>{beforeLabel}</div>
        <div style={{
          fontFamily: 'Anton, sans-serif',
          fontSize: 80, color: '#fff', lineHeight: 0.9,
          textShadow: '0 2px 12px rgba(0,0,0,0.6)',
        }}>DAY <span style={{color: '#969ca7'}}>{beforeDay}</span></div>
      </div>
      {/* AFTER label */}
      <div style={{
        position: 'absolute',
        top: 220, right: 50, textAlign: 'right',
        opacity: afterOp,
        transition: 'opacity 200ms',
      }}>
        <div style={{
          padding: '6px 14px',
          background: RED,
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: 22, color: '#fff', letterSpacing: '0.18em',
          marginBottom: 10, display: 'inline-block',
        }}>{afterLabel}</div>
        <div style={{
          fontFamily: 'Anton, sans-serif',
          fontSize: 80, color: '#fff', lineHeight: 0.9,
          textShadow: '0 2px 12px rgba(0,0,0,0.6)',
        }}>DAY <span style={{color: RED}}>{afterDay}</span></div>
      </div>

      {/* Top eyebrow */}
      <div style={{
        position: 'absolute',
        top: 100, left: 0, right: 0,
        textAlign: 'center',
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: 26, color: '#fff',
        letterSpacing: '0.2em',
        opacity: eyebrowT,
        textShadow: '0 1px 8px rgba(0,0,0,0.8)',
      }}>// {eyebrow}</div>

      {/* Bottom stat callout */}
      <div style={{
        position: 'absolute',
        bottom: 110, left: 50, right: 50,
        padding: '28px 32px',
        background: 'rgba(10,11,13,0.85)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.12)',
        borderLeft: `4px solid ${RED}`,
        opacity: statT,
        transform: `translateY(${(1 - statT) * 30}px)`,
      }}>
        <div style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: 22, color: '#969ca7', letterSpacing: '0.1em', marginBottom: 14,
        }}>{statLabel}</div>
        <div style={{
          display: 'flex', alignItems: 'baseline', gap: 22,
        }}>
          <div style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 84, fontWeight: 800,
            color: '#969ca7',
            fontVariantNumeric: 'tabular-nums',
            textDecoration: 'line-through',
          }}>{beforeValue}</div>
          <div style={{
            fontFamily: 'Anton, sans-serif',
            fontSize: 56, color: RED, lineHeight: 0.9,
          }}>→</div>
          <div style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 96, fontWeight: 800,
            color: '#fff',
            fontVariantNumeric: 'tabular-nums',
          }}>{afterValue}</div>
          <div style={{
            marginLeft: 'auto',
            padding: '8px 16px',
            background: RED,
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 28, color: '#fff', fontWeight: 700,
            letterSpacing: '0.05em',
          }}>{statDelta}</div>
        </div>
      </div>
    </div>
  );
}

window.BeforeAfterReel = BeforeAfterReel;

const BEFORE_AFTER_SPEC = {
  id: 'before-after',
  name: 'BEFORE / AFTER',
  fields: [
  {
    "key": "duration",
    "label": "Length",
    "type": "slider",
    "default": 6,
    "min": 3,
    "max": 15,
    "step": 0.5,
    "unit": "s"
  },
  {
    "key": "eyebrow",
    "label": "Eyebrow tag",
    "type": "text",
    "default": "90-DAY TRANSFORMATION"
  },
  {
    "key": "beforeLabel",
    "label": "Left label",
    "type": "text",
    "default": "BEFORE"
  },
  {
    "key": "afterLabel",
    "label": "Right label",
    "type": "text",
    "default": "AFTER"
  },
  {
    "key": "beforeDay",
    "label": "Left day",
    "type": "text",
    "default": "00"
  },
  {
    "key": "afterDay",
    "label": "Right day",
    "type": "text",
    "default": "90"
  },
  {
    "key": "statLabel",
    "label": "Stat label",
    "type": "text",
    "default": "40 YD DASH · MEASURED RESULTS"
  },
  {
    "key": "beforeValue",
    "label": "Before value",
    "type": "text",
    "default": "5.42"
  },
  {
    "key": "afterValue",
    "label": "After value",
    "type": "text",
    "default": "5.12"
  },
  {
    "key": "statDelta",
    "label": "Delta",
    "type": "text",
    "default": "−0.30s"
  },
  {
    "key": "mediaBefore",
    "label": "BEFORE photo/video",
    "type": "image",
    "default": "assets/photo-running.jpg"
  },
  {
    "key": "mediaAfter",
    "label": "AFTER photo/video",
    "type": "image",
    "default": "assets/hero-sprint-male.jpg"
  }
],
};
window.BEFORE_AFTER_SPEC = BEFORE_AFTER_SPEC;
