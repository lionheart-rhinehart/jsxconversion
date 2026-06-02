// GRAND OPENING COUNTDOWN — 9:16 Reel — 7s loop
// Day-ticker reel for the flagship Westfield grand opening. Numbers can be
// edited to any countdown context.

function CountdownReel({ data = {} }) {
  const eyebrow = data.eyebrow ?? 'FLAGSHIP OPENING';
  const headline = data.headline ?? 'WESTFIELD';
  const subhead = data.subhead ?? 'INDIANA';
  const countdownPrefix = data.countdownPrefix ?? 'OPENING IN';
  const startDays = (typeof data.startDays === 'number') ? data.startDays : 10;
  const minDays = (typeof data.minDays === 'number') ? data.minDays : 7;
  const ctaText = data.ctaText ?? '{ctaText}';
  const ctaMicro = data.ctaMicro ?? '{ctaMicro}';
  const media = data.media ?? 'assets/photo-gym-wide.jpg';

  const t = useTime();

  // Gym photo Ken Burns
  const photoScale = 1.0 + 0.08 * (t / 7);

  // Dark overlay grows for legibility
  const overlayT = Math.min(1, t / 0.5);

  // Eyebrow at 0.4s
  const eyebrowT = Math.max(0, Math.min(1, (t - 0.4) / 0.4));

  // Title two lines at 0.8 and 1.1
  const title1T = Easing.easeOutCubic(Math.max(0, Math.min(1, (t - 0.8) / 0.5)));
  const title2T = Easing.easeOutCubic(Math.max(0, Math.min(1, (t - 1.1) / 0.5)));

  // Number tick: 09 → 08 → 07 across 2-5s, jumping each second visually
  // Show a "days" countdown that decrements each second
  const days = Math.max(minDays, startDays - Math.floor(Math.max(0, t - 1.7)));
  const tickPulse = (() => {
    const sinceTick = (Math.max(0, t - 1.7)) % 1;
    return sinceTick < 0.15 ? 1 - sinceTick / 0.15 : 0;
  })();

  // CTA at 5.5s
  const ctaT = Easing.easeOutBack(Math.max(0, Math.min(1, (t - 5.3) / 0.5)));

  const RED = '#c4141d';

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a0b0d', overflow: 'hidden' }}>
      <window.TrimmedMedia
        src={media}
        clipStart={data.media_clipStart}
        clipEnd={data.media_clipEnd}
        muted={!data.media_audio}
        style={{
          position: 'absolute', inset: 0,
          width: '100%', height: '100%',
          objectFit: 'cover',
          transform: `scale(${photoScale})`,
          transformOrigin: '50% 50%',
          filter: 'brightness(0.4) saturate(0.7) contrast(1.1)',
        }}
      />
      <div style={{
        position: 'absolute', inset: 0,
        background: `linear-gradient(180deg, rgba(10,11,13,${0.5 * overlayT}) 0%, rgba(10,11,13,${0.85 * overlayT}) 100%)`,
      }}/>

      {/* Eyebrow */}
      <Eyebrow top={220} fontSize={32}>// {eyebrow}</Eyebrow>

      {/* Title two-line */}
      <div style={{
        position: 'absolute',
        top: 290, left: 0, right: 0,
        textAlign: 'center',
        fontFamily: 'Anton, sans-serif',
        color: '#fff',
        fontSize: 130,
        lineHeight: 0.88,
        letterSpacing: '-0.005em',
      }}>
        <div style={{ opacity: title1T, transform: `translateY(${(1 - title1T) * 20}px)` }}>{headline}</div>
        <div style={{ opacity: title2T, transform: `translateY(${(1 - title2T) * 20}px)`, color: '#969ca7', fontSize: 64, marginTop: 12 }}>{subhead}</div>
      </div>

      {/* Big countdown number */}
      <div style={{
        position: 'absolute',
        top: 660,
        left: 0, right: 0,
        textAlign: 'center',
      }}>
        <div style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: 30,
          color: '#969ca7',
          letterSpacing: '0.2em',
          marginBottom: 24,
          opacity: title1T,
        }}>{countdownPrefix}</div>
        <div style={{
          position: 'relative',
          display: 'inline-block',
          transform: `scale(${1 + 0.04 * tickPulse})`,
          transition: 'transform 80ms',
        }}>
          <div style={{
            fontFamily: 'Anton, sans-serif',
            fontSize: 580,
            color: '#fff',
            lineHeight: 0.85,
            fontVariantNumeric: 'tabular-nums',
            textShadow: tickPulse > 0.3 ? `0 0 60px ${RED}` : 'none',
          }}>
            {String(days).padStart(2, '0')}
          </div>
          <div style={{
            position: 'absolute',
            inset: -20,
            border: `4px solid ${RED}`,
            opacity: tickPulse * 0.7,
            transform: `scale(${1 + tickPulse * 0.15})`,
          }}/>
        </div>
        <div style={{
          fontFamily: 'Anton, sans-serif',
          fontSize: 130,
          color: RED,
          marginTop: 12,
          letterSpacing: '0.02em',
          opacity: title2T,
        }}>DAYS</div>
      </div>

      {/* CTA */}
      <div style={{
        position: 'absolute',
        bottom: 140, left: 60, right: 60,
        opacity: ctaT,
        transform: `translateY(${(1 - ctaT) * 30}px)`,
      }}>
        <div style={{
          background: RED,
          padding: '36px 48px',
          textAlign: 'center',
          fontFamily: 'Anton, sans-serif',
          fontSize: 72,
          color: '#fff',
          letterSpacing: '0.01em',
          boxShadow: '0 16px 48px rgba(196,20,29,0.5)',
        }}>BOOK FREE ASSESSMENT →</div>
        <div style={{
          marginTop: 24,
          textAlign: 'center',
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: 26,
          color: '#969ca7',
          letterSpacing: '0.12em',
        }}>+1 MPH · +3" VERT · OR TRAINING IS FREE</div>
      </div>
    </div>
  );
}

window.CountdownReel = CountdownReel;

const COUNTDOWN_SPEC = {
  id: 'countdown',
  name: 'COUNTDOWN',
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
    "default": "FLAGSHIP OPENING"
  },
  {
    "key": "headline",
    "label": "Headline",
    "type": "text",
    "default": "WESTFIELD"
  },
  {
    "key": "subhead",
    "label": "Subhead",
    "type": "text",
    "default": "INDIANA"
  },
  {
    "key": "countdownPrefix",
    "label": "Counter label",
    "type": "text",
    "default": "OPENING IN"
  },
  {
    "key": "startDays",
    "label": "Start days",
    "type": "number",
    "default": 10,
    "step": 1,
    "min": 1
  },
  {
    "key": "minDays",
    "label": "End days",
    "type": "number",
    "default": 7,
    "step": 1,
    "min": 0
  },
  {
    "key": "ctaText",
    "label": "CTA text",
    "type": "text",
    "default": "BOOK FREE ASSESSMENT →"
  },
  {
    "key": "ctaMicro",
    "label": "CTA microcopy",
    "type": "text",
    "default": "+1 MPH · +3\" VERT · OR TRAINING IS FREE"
  },
  {
    "key": "media",
    "label": "Photo or video",
    "type": "image",
    "default": "assets/photo-gym-wide.jpg",
    "sub": "image or short video"
  }
],
};
window.COUNTDOWN_SPEC = COUNTDOWN_SPEC;
