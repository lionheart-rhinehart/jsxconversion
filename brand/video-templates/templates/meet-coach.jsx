// MEET THE COACH — 9:16 Reel — 8s loop
// Single staff intro. Different from coach-lower-thirds (which is an overlay).

function MeetCoachReel({ data = {} }) {
  const eyebrow = data.eyebrow ?? 'MEET YOUR COACH';
  const coachFirst = data.coachFirst ?? 'COACH';
  const coachLast = data.coachLast ?? 'TORRES.';
  const coachTitle = data.coachTitle ?? 'DIRECTOR OF PERFORMANCE';
  const ctaText = data.ctaText ?? 'TRAIN WITH HIM →';
  const ctaMicro = data.ctaMicro ?? 'BOOK FREE ASSESSMENT';
  const media = data.media ?? 'assets/photo-coach-action.jpg';

  const t = useTime();
  const RED = '#c4141d';

  const photoScale = 1.06 - 0.04 * Math.min(1, t / 8);
  const eyebrowT = Math.max(0, Math.min(1, (t - 0.3) / 0.4));
  const nameT = Easing.easeOutCubic(Math.max(0, Math.min(1, (t - 0.7) / 0.5)));
  const titleT = Easing.easeOutCubic(Math.max(0, Math.min(1, (t - 1.1) / 0.5)));
  const chipsT = Easing.easeOutCubic(Math.max(0, Math.min(1, (t - 1.8) / 0.5)));

  // Quote types in word by word from 2.6
  const words = ['I', 'DON\u2019T', 'COACH', 'POTENTIAL.', 'I', 'COACH', 'WHAT', 'YOU', 'SHOW', 'ME.'];
  const wordT = (i) => Math.max(0, Math.min(1, (t - (2.6 + i * 0.16)) / 0.25));

  const factsT = Easing.easeOutCubic(Math.max(0, Math.min(1, (t - 5.6) / 0.5)));
  const ctaT = Easing.easeOutBack(Math.max(0, Math.min(1, (t - 6.6) / 0.5)));

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a0b0d', overflow: 'hidden' }}>
      {/* Coach photo on top half */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0,
        height: '54%',
        overflow: 'hidden',
      }}>
        <window.TrimmedMedia
        src={media}
        clipStart={data.media_clipStart}
        clipEnd={data.media_clipEnd}
        muted={!data.media_audio}
        style={{
          width: '100%', height: '100%', objectFit: 'cover',
          objectPosition: '60% 30%',
          transform: `scale(${photoScale})`,
          filter: 'contrast(1.05) saturate(0.85)',
        }}
      />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, rgba(10,11,13,0.55) 0%, rgba(10,11,13,0) 35%, rgba(10,11,13,0) 60%, rgba(10,11,13,0.98) 100%)',
        }}/>

        {/* Eyebrow */}
        <div style={{
          position: 'absolute', top: 100, left: 60,
          padding: '8px 16px',
          background: RED,
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: 24, color: '#fff', letterSpacing: '0.16em',
          opacity: eyebrowT,
        }}>// {eyebrow}</div>
      </div>

      {/* Name */}
      <div style={{
        position: 'absolute',
        top: 850, left: 60, right: 60,
        opacity: nameT,
        transform: `translateY(${(1 - nameT) * 24}px)`,
      }}>
        <div style={{
          fontFamily: 'Anton, sans-serif',
          fontSize: 200, color: '#fff', lineHeight: 0.85,
        }}>{coachFirst}</div>
        <div style={{
          fontFamily: 'Anton, sans-serif',
          fontSize: 200, color: RED, lineHeight: 0.85, marginTop: 6,
        }}>{coachLast}</div>
      </div>

      {/* Title */}
      <div style={{
        position: 'absolute',
        top: 1280, left: 60, right: 60,
        opacity: titleT,
        transform: `translateY(${(1 - titleT) * 12}px)`,
      }}>
        <div style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: 26, color: '#fff', letterSpacing: '0.14em',
        }}>{coachTitle}</div>
      </div>

      {/* Cred chips */}
      <div style={{
        position: 'absolute',
        top: 1350, left: 60, right: 60,
        display: 'flex', gap: 10, flexWrap: 'wrap',
        opacity: chipsT,
        transform: `translateY(${(1 - chipsT) * 14}px)`,
      }}>
        {['CSCS', 'USATF L2', '15 YRS', 'NCAA D1', 'PhD KIN'].map((c) => (
          <div key={c} style={{
            padding: '8px 14px',
            border: '1px solid rgba(255,255,255,0.22)',
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 18, color: '#fff',
            letterSpacing: '0.08em',
          }}>{c}</div>
        ))}
      </div>

      {/* Quote */}
      <div style={{
        position: 'absolute',
        top: 1480, left: 60, right: 60,
        fontFamily: 'Anton, sans-serif',
        fontSize: 60, color: '#fff', lineHeight: 1.05,
        display: 'flex', flexWrap: 'wrap', gap: '0 16px',
      }}>
        {words.map((w, i) => {
          const r = wordT(i);
          const isAccent = w === 'WHAT' || w === 'YOU' || w === 'SHOW' || w === 'ME.';
          return (
            <span key={i} style={{
              opacity: r,
              transform: `translateY(${(1 - r) * 12}px)`,
              color: isAccent ? RED : '#fff',
              display: 'inline-block',
            }}>{w}</span>
          );
        })}
      </div>

      {/* Quick facts */}
      <div style={{
        position: 'absolute',
        bottom: 180, left: 60, right: 60,
        display: 'flex', gap: 12,
        opacity: factsT,
      }}>
        {[
          ['237', 'ATHLETES'],
          ['12', 'D1 COMMITS'],
          ['8 YRS', 'AT AA'],
        ].map(([v, l]) => (
          <div key={l} style={{
            flex: 1,
            padding: '14px 16px',
            background: 'rgba(255,255,255,0.06)',
            borderLeft: `3px solid ${RED}`,
          }}>
            <div style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: 32, color: '#fff', fontWeight: 700,
              fontVariantNumeric: 'tabular-nums',
            }}>{v}</div>
            <div style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: 12, color: '#969ca7',
              letterSpacing: '0.12em', marginTop: 4,
            }}>{l}</div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div style={{
        position: 'absolute',
        bottom: 80, left: 60, right: 60,
        padding: '20px 24px',
        background: RED,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        opacity: ctaT,
        transform: `translateY(${(1 - ctaT) * 16}px)`,
      }}>
        <div style={{
          fontFamily: 'Anton, sans-serif',
          fontSize: 36, color: '#fff',
        }}>{ctaText}</div>
        <div style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: 16, color: '#fff', letterSpacing: '0.1em',
        }}>{ctaMicro}</div>
      </div>
    </div>
  );
}

window.MeetCoachReel = MeetCoachReel;

const MEET_COACH_SPEC = {
  id: 'meet-coach',
  name: 'MEET COACH',
  fields: [
  {
    "key": "duration",
    "label": "Length",
    "type": "slider",
    "default": 8,
    "min": 3,
    "max": 15,
    "step": 0.5,
    "unit": "s"
  },
  {
    "key": "eyebrow",
    "label": "Eyebrow tag",
    "type": "text",
    "default": "MEET YOUR COACH"
  },
  {
    "key": "coachFirst",
    "label": "Coach first name",
    "type": "text",
    "default": "COACH"
  },
  {
    "key": "coachLast",
    "label": "Coach last name (red)",
    "type": "text",
    "default": "TORRES."
  },
  {
    "key": "coachTitle",
    "label": "Title",
    "type": "text",
    "default": "DIRECTOR OF PERFORMANCE"
  },
  {
    "key": "ctaText",
    "label": "CTA text",
    "type": "text",
    "default": "TRAIN WITH HIM →"
  },
  {
    "key": "ctaMicro",
    "label": "CTA microcopy",
    "type": "text",
    "default": "BOOK FREE ASSESSMENT"
  },
  {
    "key": "media",
    "label": "Coach photo or video",
    "type": "image",
    "default": "assets/photo-coach-action.jpg"
  }
],
};
window.MEET_COACH_SPEC = MEET_COACH_SPEC;
