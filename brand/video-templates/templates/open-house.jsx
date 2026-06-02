// OPEN HOUSE — 9:16 Reel — 7s loop
// Location reveal / grand opening event teaser.

function OpenHouseReel({ data = {} }) {
  const eyebrow = data.eyebrow ?? 'FLAGSHIP OPEN HOUSE';
  const title1 = data.title1 ?? 'WESTFIELD';
  const title2 = data.title2 ?? 'IS OPEN.';
  const dateDay = data.dateDay ?? 'SAT';
  const dateLong = data.dateLong ?? 'JUN 14';
  const hoursLabel = data.hoursLabel ?? 'DOORS';
  const hours = data.hours ?? '10A–4P';
  const addressLine = data.addressLine ?? '17920 SPRING MILL RD · WESTFIELD, IN 46074';
  const ctaText = data.ctaText ?? "RSVP · IT'S FREE";
  const ctaUrl = data.ctaUrl ?? 'ATHLETESACCEL.COM/OPEN';
  const media = data.media ?? 'assets/photo-gym-wide.jpg';

  const t = useTime();
  const RED = '#c4141d';

  const photoScale = 1.0 + 0.07 * (t / 7);
  const overlayT = Math.min(1, t / 0.5);
  const eyebrowT = Math.max(0, Math.min(1, (t - 0.4) / 0.4));

  const titleT1 = Easing.easeOutCubic(Math.max(0, Math.min(1, (t - 0.8) / 0.5)));
  const titleT2 = Easing.easeOutCubic(Math.max(0, Math.min(1, (t - 1.1) / 0.5)));

  // Date block
  const dateT = Easing.easeOutBack(Math.max(0, Math.min(1, (t - 1.8) / 0.5)));

  // Bullets
  const bulletT = (i) => Easing.easeOutCubic(Math.max(0, Math.min(1, (t - (2.6 + i * 0.4)) / 0.4)));

  // Address
  const addrT = Easing.easeOutCubic(Math.max(0, Math.min(1, (t - 4.4) / 0.5)));

  // CTA
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
        filter: 'brightness(0.4) saturate(0.8) contrast(1.1)',
      }}
      />
      <div style={{
        position: 'absolute', inset: 0,
        background: `linear-gradient(180deg, rgba(10,11,13,${0.6 * overlayT}) 0%, rgba(10,11,13,${0.95 * overlayT}) 100%)`,
      }}/>

      {/* Eyebrow */}
      <Eyebrow top={130} fontSize={24}>// {eyebrow}</Eyebrow>

      {/* Big title */}
      <div style={{
        position: 'absolute', top: 230, left: 60, right: 60,
      }}>
        <div style={{
          fontFamily: 'Anton, sans-serif',
          fontSize: 220, color: '#fff', lineHeight: 0.82,
          opacity: titleT1,
          transform: `translateY(${(1 - titleT1) * 30}px)`,
        }}>{title1}</div>
        <div style={{
          fontFamily: 'Anton, sans-serif',
          fontSize: 220, color: 'transparent',
          WebkitTextStroke: `3px ${RED}`,
          lineHeight: 0.82, marginTop: 8,
          opacity: titleT2,
          transform: `translateY(${(1 - titleT2) * 30}px)`,
        }}>{title2}</div>
      </div>

      {/* Date block */}
      <div style={{
        position: 'absolute', top: 760, left: 60, right: 60,
        padding: '28px 32px',
        background: RED,
        display: 'flex', alignItems: 'center', gap: 32,
        opacity: dateT,
        transform: `scale(${0.94 + 0.06 * dateT})`,
        boxShadow: '0 12px 36px rgba(196,20,29,0.4)',
      }}>
        <div>
          <div style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 16, color: 'rgba(255,255,255,0.7)',
            letterSpacing: '0.18em',
          }}>{dateDay}</div>
          <div style={{
            fontFamily: 'Anton, sans-serif',
            fontSize: 110, color: '#fff', lineHeight: 0.85,
          }}>{dateLong}</div>
        </div>
        <div style={{ width: 2, height: 100, background: 'rgba(255,255,255,0.3)' }}/>
        <div>
          <div style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 16, color: 'rgba(255,255,255,0.7)',
            letterSpacing: '0.18em',
          }}>{hoursLabel}</div>
          <div style={{
            fontFamily: 'Anton, sans-serif',
            fontSize: 110, color: '#fff', lineHeight: 0.85,
          }}>{hours}</div>
        </div>
      </div>

      {/* What you get */}
      <div style={{
        position: 'absolute', top: 1020, left: 60, right: 60,
        display: 'flex', flexDirection: 'column', gap: 14,
      }}>
        {[
          'FREE ASSESSMENTS · BRING YOUR ATHLETE',
          'MEET THE COACHES · LIVE DRILL DEMOS',
          'FOOD · SWAG · DOOR PRIZES',
        ].map((b, i) => {
          const r = bulletT(i);
          return (
            <div key={i} style={{
              display: 'flex', gap: 18, alignItems: 'center',
              opacity: r,
              transform: `translateX(${(1 - r) * -24}px)`,
            }}>
              <div style={{
                width: 14, height: 14,
                background: RED,
                flexShrink: 0,
              }}/>
              <div style={{
                fontFamily: 'Anton, sans-serif',
                fontSize: 42, color: '#fff', letterSpacing: '0.01em',
                lineHeight: 1,
              }}>{b}</div>
            </div>
          );
        })}
      </div>

      {/* Address */}
      <div style={{
        position: 'absolute',
        bottom: 290, left: 60, right: 60,
        padding: '18px 22px',
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.12)',
        opacity: addrT,
        transform: `translateY(${(1 - addrT) * 16}px)`,
      }}>
        <div style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: 14, color: RED,
          letterSpacing: '0.16em',
          marginBottom: 6,
        }}>// FIND US</div>
        <div style={{
          fontFamily: 'Geist, sans-serif',
          fontSize: 28, color: '#fff', fontWeight: 600, lineHeight: 1.25,
        }}>{addressLine}</div>
      </div>

      {/* CTA */}
      <div style={{
        position: 'absolute',
        bottom: 90, left: 60, right: 60,
        padding: '22px 28px',
        background: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        opacity: ctaT,
        transform: `translateY(${(1 - ctaT) * 16}px)`,
      }}>
        <div style={{
          fontFamily: 'Anton, sans-serif',
          fontSize: 50, color: RED,
        }}>{ctaText}</div>
        <div style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: 18, color: '#0a0b0d', fontWeight: 700,
          letterSpacing: '0.1em',
        }}>{ctaUrl}</div>
      </div>
    </div>
  );
}

window.OpenHouseReel = OpenHouseReel;

const OPEN_HOUSE_SPEC = {
  id: 'open-house',
  name: 'OPEN HOUSE',
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
    "default": "FLAGSHIP OPEN HOUSE"
  },
  {
    "key": "title1",
    "label": "Title line 1",
    "type": "text",
    "default": "WESTFIELD"
  },
  {
    "key": "title2",
    "label": "Title line 2 (outline)",
    "type": "text",
    "default": "IS OPEN."
  },
  {
    "key": "dateDay",
    "label": "Day of week",
    "type": "text",
    "default": "SAT"
  },
  {
    "key": "dateLong",
    "label": "Date",
    "type": "text",
    "default": "JUN 14"
  },
  {
    "key": "hoursLabel",
    "label": "Hours label",
    "type": "text",
    "default": "DOORS"
  },
  {
    "key": "hours",
    "label": "Hours",
    "type": "text",
    "default": "10A–4P"
  },
  {
    "key": "addressLine",
    "label": "Address",
    "type": "text",
    "default": "17920 SPRING MILL RD · WESTFIELD, IN 46074"
  },
  {
    "key": "ctaText",
    "label": "CTA text",
    "type": "text",
    "default": "RSVP · IT'S FREE"
  },
  {
    "key": "ctaUrl",
    "label": "CTA URL",
    "type": "text",
    "default": "ATHLETESACCEL.COM/OPEN"
  },
  {
    "key": "media",
    "label": "Background photo or video",
    "type": "image",
    "default": "assets/photo-gym-wide.jpg"
  }
],
};
window.OPEN_HOUSE_SPEC = OPEN_HOUSE_SPEC;
