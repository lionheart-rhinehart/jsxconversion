// CAMP ANNOUNCEMENT — 1:1 Feed — 7s loop
// Summer / clinic event registration push. Spots-left counter creates urgency.

function CampAnnounceSquare({ data = {} }) {
  const eyebrow = data.eyebrow ?? 'SUMMER 2026';
  const title1 = data.title1 ?? 'SPEED';
  const title2 = data.title2 ?? 'CAMP.';
  const subhead = data.subhead ?? '5 DAYS · 10 HOURS · 1 PR';
  const dates = data.dates ?? 'JUN 24–28';
  const hours = data.hours ?? '9A–11A';
  const ages = data.ages ?? '11–14';
  const totalSpots = (typeof data.totalSpots === 'number') ? data.totalSpots : 24;
  const ctaText = data.ctaText ?? 'RESERVE YOUR SPOT';
  const media = data.media ?? 'assets/photo-group-coaching.jpg';

  const t = useTime();
  const RED = '#c4141d';

  const photoScale = 1.05 + 0.04 * (t / 7);
  const eyebrowT = Math.max(0, Math.min(1, (t - 0.2) / 0.4));

  const titleT = Easing.easeOutCubic(Math.max(0, Math.min(1, (t - 0.6) / 0.5)));

  // Stat block (dates / ages / spots)
  const blockT = Easing.easeOutCubic(Math.max(0, Math.min(1, (t - 1.6) / 0.5)));

  // Spots-left ticker: drops from 24 to 7 across 2.4-5.2s
  const ticker = (() => {
    const u = Math.max(0, Math.min(1, (t - 2.4) / 2.8));
    return Math.round(totalSpots - u * (totalSpots - 7));
  })();
  const tickPulse = (() => {
    const sinceTick = (Math.max(0, t - 2.4)) % 0.3;
    return sinceTick < 0.1 ? 1 - sinceTick / 0.1 : 0;
  })();

  const ctaT = Easing.easeOutBack(Math.max(0, Math.min(1, (t - 5.4) / 0.5)));

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a0b0d', overflow: 'hidden' }}>
      <window.TrimmedMedia
        src={media}
        clipStart={data.media_clipStart}
        clipEnd={data.media_clipEnd}
        muted={!data.media_audio}
        style={{
        position: 'absolute', inset: 0,
        width: '100%', height: '100%', objectFit: 'cover',
        transform: `scale(${photoScale})`,
        filter: 'brightness(0.35) saturate(0.7) contrast(1.1)',
      }}
      />
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, rgba(10,11,13,0.6) 0%, rgba(10,11,13,0.9) 100%)',
      }}/>

      <Eyebrow top={70} fontSize={20}>// {eyebrow}</Eyebrow>

      {/* Title */}
      <div style={{
        position: 'absolute', top: 140, left: 70, right: 70,
        opacity: titleT,
        transform: `translateY(${(1 - titleT) * 18}px)`,
      }}>
        <div style={{
          fontFamily: 'Anton, sans-serif',
          fontSize: 200, color: '#fff', lineHeight: 0.82,
        }}>{title1}</div>
        <div style={{
          fontFamily: 'Anton, sans-serif',
          fontSize: 200, color: RED, lineHeight: 0.82, marginTop: 6,
        }}>{title2}</div>
        <div style={{
          marginTop: 14,
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: 20, color: '#969ca7', letterSpacing: '0.14em',
        }}>{subhead}</div>
      </div>

      {/* Date / ages / spots block */}
      <div style={{
        position: 'absolute',
        bottom: 270, left: 60, right: 60,
        display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14,
        opacity: blockT,
        transform: `translateY(${(1 - blockT) * 20}px)`,
      }}>
        {/* Dates */}
        <div style={{
          padding: '18px 18px',
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.12)',
        }}>
          <div style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 13, color: '#969ca7',
            letterSpacing: '0.14em', marginBottom: 6,
          }}>DATES</div>
          <div style={{
            fontFamily: 'Anton, sans-serif',
            fontSize: 46, color: '#fff', lineHeight: 0.9,
          }}>{dates}</div>
          <div style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 14, color: '#fff', marginTop: 6,
            letterSpacing: '0.08em',
          }}>{hours}</div>
        </div>

        {/* Ages */}
        <div style={{
          padding: '18px 18px',
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.12)',
        }}>
          <div style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 13, color: '#969ca7',
            letterSpacing: '0.14em', marginBottom: 6,
          }}>AGES</div>
          <div style={{
            fontFamily: 'Anton, sans-serif',
            fontSize: 46, color: '#fff', lineHeight: 0.9,
          }}>{ages}</div>
          <div style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 14, color: '#fff', marginTop: 6,
            letterSpacing: '0.08em',
          }}>ALL SPORTS</div>
        </div>

        {/* Spots ticker */}
        <div style={{
          padding: '18px 18px',
          background: RED,
          border: `1px solid ${RED}`,
          position: 'relative',
          boxShadow: tickPulse > 0.3 ? `0 0 36px rgba(196,20,29,0.6)` : 'none',
        }}>
          <div style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 13, color: 'rgba(255,255,255,0.75)',
            letterSpacing: '0.14em', marginBottom: 6,
          }}>SPOTS LEFT</div>
          <div style={{
            fontFamily: 'Anton, sans-serif',
            fontSize: 88, color: '#fff', lineHeight: 0.85,
            fontVariantNumeric: 'tabular-nums',
            transform: `scale(${1 + 0.08 * tickPulse})`,
            transformOrigin: 'left',
            transition: 'transform 80ms',
          }}>{String(ticker).padStart(2, '0')}</div>
          <div style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 12, color: '#fff', marginTop: 4,
            letterSpacing: '0.08em',
          }}>OF {totalSpots}</div>
        </div>
      </div>

      {/* CTA */}
      <div style={{
        position: 'absolute',
        bottom: 80, left: 60, right: 60,
        padding: '22px 28px',
        background: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        opacity: ctaT,
        transform: `translateY(${(1 - ctaT) * 16}px)`,
      }}>
        <div style={{
          fontFamily: 'Anton, sans-serif',
          fontSize: 52, color: RED,
        }}>{ctaText}</div>
        <div style={{
          width: 56, height: 56,
          background: RED,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'Anton, sans-serif',
          fontSize: 40, color: '#fff',
        }}>→</div>
      </div>
    </div>
  );
}

window.CampAnnounceSquare = CampAnnounceSquare;

const CAMP_ANNOUNCE_SPEC = {
  id: 'camp-announce',
  name: 'CAMP ANNOUNCE',
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
    "default": "SUMMER 2026"
  },
  {
    "key": "title1",
    "label": "Title line 1",
    "type": "text",
    "default": "SPEED"
  },
  {
    "key": "title2",
    "label": "Title line 2 (red)",
    "type": "text",
    "default": "CAMP."
  },
  {
    "key": "subhead",
    "label": "Subhead",
    "type": "text",
    "default": "5 DAYS · 10 HOURS · 1 PR"
  },
  {
    "key": "dates",
    "label": "Dates",
    "type": "text",
    "default": "JUN 24–28"
  },
  {
    "key": "hours",
    "label": "Hours",
    "type": "text",
    "default": "9A–11A"
  },
  {
    "key": "ages",
    "label": "Ages",
    "type": "text",
    "default": "11–14"
  },
  {
    "key": "totalSpots",
    "label": "Total spots",
    "type": "number",
    "default": 24,
    "step": 1,
    "min": 1
  },
  {
    "key": "ctaText",
    "label": "CTA text",
    "type": "text",
    "default": "RESERVE YOUR SPOT"
  },
  {
    "key": "media",
    "label": "Background photo or video",
    "type": "image",
    "default": "assets/photo-group-coaching.jpg"
  }
],
};
window.CAMP_ANNOUNCE_SPEC = CAMP_ANNOUNCE_SPEC;
