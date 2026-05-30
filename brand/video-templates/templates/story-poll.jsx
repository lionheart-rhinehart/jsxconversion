// STORY POLL — 9:16 Stories — 7s loop
// IG / TikTok story-format engagement card with pulsing answer options.
// Use to drive replies and drive insight into your audience.

function StoryPollReel({ data = {} }) {
  const eyebrow = data.eyebrow ?? 'QUICK QUESTION';
  const questionA = data.questionA ?? "WHAT'S YOUR";
  const questionB = data.questionB ?? "ATHLETE'S";
  const questionC = data.questionC ?? 'BIGGEST GAP?';
  const ctaText = data.ctaText ?? 'TAP THE STICKER →';
  const ctaMicro = data.ctaMicro ?? 'WE PROGRAM AROUND THE WEAK LINK';
  const media = data.media ?? 'assets/photo-agility-mixed.jpg';

  const t = useTime();
  const RED = '#c4141d';

  const photoScale = 1.05 + 0.04 * (t / 7);
  const overlayT = Math.min(1, t / 0.6);

  const eyebrowT = Math.max(0, Math.min(1, (t - 0.3) / 0.4));
  const q1T = Easing.easeOutCubic(Math.max(0, Math.min(1, (t - 0.7) / 0.5)));
  const q2T = Easing.easeOutCubic(Math.max(0, Math.min(1, (t - 1.0) / 0.5)));

  // Options reveal at 1.8, 2.1, 2.4
  const opts = [
    { label: 'SPEED', icon: 'sprint' },
    { label: 'STRENGTH', icon: 'fitness_center' },
    { label: 'POWER', icon: 'bolt' },
  ];
  const optT = (i) => Easing.easeOutBack(Math.max(0, Math.min(1, (t - (1.8 + i * 0.3)) / 0.5)));

  // Cursor pulses through the 3 options
  // Each option highlighted for 0.8s, starting at 3.4
  const cycle = Math.max(0, t - 3.4);
  const activeIdx = cycle < 2.4 ? Math.floor(cycle / 0.8) : -1;

  const ctaT = Easing.easeOutCubic(Math.max(0, Math.min(1, (t - 5.6) / 0.5)));

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a0b0d', overflow: 'hidden' }}>
      {/* Background photo */}
      <window.TrimmedMedia
        src={media}
        clipStart={data.media_clipStart}
        clipEnd={data.media_clipEnd}
        muted={!data.media_audio}
        style={{
        position: 'absolute', inset: 0,
        width: '100%', height: '100%', objectFit: 'cover',
        objectPosition: '50% 40%',
        transform: `scale(${photoScale})`,
        filter: 'contrast(1.05) saturate(0.6) brightness(0.45)',
      }}
      />
      {/* dark overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `rgba(10,11,13,${0.6 * overlayT})`,
      }}/>

      {/* Eyebrow */}
      <div style={{
        position: 'absolute', top: 220, left: 0, right: 0,
        textAlign: 'center',
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: 30, color: RED, letterSpacing: '0.18em',
        opacity: eyebrowT,
        textShadow: '0 1px 12px rgba(0,0,0,0.7)',
      }}>// {eyebrow}</div>

      {/* Question two-line */}
      <div style={{
        position: 'absolute', top: 320, left: 60, right: 60,
        textAlign: 'center',
        fontFamily: 'Anton, sans-serif',
        color: '#fff', fontSize: 130, lineHeight: 0.88,
      }}>
        <div style={{
          opacity: q1T,
          transform: `translateY(${(1 - q1T) * 20}px)`,
        }}>{questionA}<br/>{questionB}</div>
        <div style={{
          marginTop: 18,
          opacity: q2T,
          transform: `translateY(${(1 - q2T) * 20}px)`,
          color: RED,
        }}>{questionC}</div>
      </div>

      {/* Options stacked */}
      <div style={{
        position: 'absolute',
        top: 950, left: 80, right: 80,
        display: 'flex', flexDirection: 'column', gap: 22,
      }}>
        {opts.map((o, i) => {
          const r = optT(i);
          const isActive = activeIdx === i;
          return (
            <div key={i} style={{
              padding: '32px 36px',
              background: isActive ? RED : 'rgba(255,255,255,0.08)',
              border: `2px solid ${isActive ? RED : 'rgba(255,255,255,0.18)'}`,
              backdropFilter: 'blur(12px)',
              display: 'flex', alignItems: 'center', gap: 28,
              opacity: r,
              transform: `scale(${0.94 + 0.06 * r}) ${isActive ? 'translateX(8px)' : ''}`,
              boxShadow: isActive ? `0 12px 36px rgba(196,20,29,0.5)` : 'none',
              transition: 'background 180ms, border 180ms, box-shadow 180ms, transform 180ms',
            }}>
              <div style={{
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: 30, fontWeight: 700,
                color: isActive ? '#fff' : '#969ca7',
                width: 60,
                fontVariantNumeric: 'tabular-nums',
              }}>0{i + 1}</div>
              <div style={{
                fontFamily: 'Anton, sans-serif',
                fontSize: 72, color: '#fff', letterSpacing: '0.01em',
                flex: 1,
              }}>{o.label}</div>
              {/* simple shape icon */}
              <div style={{
                width: 56, height: 56,
                border: `2px solid ${isActive ? '#fff' : 'rgba(255,255,255,0.4)'}`,
                borderRadius: i === 0 ? 28 : i === 1 ? 4 : 0,
                transform: i === 2 ? 'rotate(45deg)' : 'none',
                background: isActive ? '#fff' : 'transparent',
              }}/>
            </div>
          );
        })}
      </div>

      {/* CTA bottom */}
      <div style={{
        position: 'absolute', bottom: 130, left: 60, right: 60,
        textAlign: 'center',
        opacity: ctaT,
        transform: `translateY(${(1 - ctaT) * 16}px)`,
      }}>
        <div style={{
          fontFamily: 'Anton, sans-serif',
          fontSize: 56, color: '#fff', letterSpacing: '0.01em',
        }}>{ctaText}</div>
        <div style={{
          marginTop: 14,
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: 22, color: '#969ca7', letterSpacing: '0.12em',
        }}>{ctaMicro}</div>
      </div>
    </div>
  );
}

window.StoryPollReel = StoryPollReel;

const STORY_POLL_SPEC = {
  id: 'story-poll',
  name: 'STORY POLL',
  fields: [
  {
    "key": "duration",
    "label": "Length",
    "type": "slider",
    "default": 7,
    "min": 3,
    "max": 15,
    "step": 0.5,
    "unit": "s"
  },
  {
    "key": "eyebrow",
    "label": "Eyebrow tag",
    "type": "text",
    "default": "QUICK QUESTION"
  },
  {
    "key": "questionA",
    "label": "Question line 1",
    "type": "text",
    "default": "WHAT'S YOUR"
  },
  {
    "key": "questionB",
    "label": "Question line 2",
    "type": "text",
    "default": "ATHLETE'S"
  },
  {
    "key": "questionC",
    "label": "Question line 3 (red)",
    "type": "text",
    "default": "BIGGEST GAP?"
  },
  {
    "key": "ctaText",
    "label": "CTA text",
    "type": "text",
    "default": "TAP THE STICKER →"
  },
  {
    "key": "ctaMicro",
    "label": "CTA microcopy",
    "type": "text",
    "default": "WE PROGRAM AROUND THE WEAK LINK"
  },
  {
    "key": "media",
    "label": "Background photo or video",
    "type": "image",
    "default": "assets/photo-agility-mixed.jpg"
  }
],
};
window.STORY_POLL_SPEC = STORY_POLL_SPEC;
