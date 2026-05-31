// PARENT QUOTE CARD — 1:1 Feed Post — 7s loop
// Animated testimonial. Quote types in word-by-word over a coach photo.

function QuoteCardSquare({ data = {} }) {
  const eyebrow = data.eyebrow ?? 'PARENT TESTIMONIAL';
  const quoteText = data.quoteText ?? 'MY KID GAINED 4 INCHES ON HIS VERTICAL IN 8 WEEKS.';
  const bylineName = data.bylineName ?? 'SARAH M.';
  const bylineMeta = data.bylineMeta ?? 'PARENT · U14 BASKETBALL · NOBLESVILLE';
  const statsLabel = data.statsLabel ?? "HER ATHLETE'S 90-DAY DATA";
  const stats = data.stats ?? '+4.2"|VERT · −0.4s|40YD · +25LB|BENCH';
  const statPairs = stats.split(/\s*·\s*/).map((p) => p.split('|')).filter((p) => p[0]);
  const media = data.media ?? 'assets/photo-coach-action.jpg';
  // Build words array from editable quote
  const _quoteWords = quoteText.split(/\s+/);

  const t = useTime();
  const RED = '#c4141d';

  const words = _quoteWords;
  // word-by-word from 1.2s, 0.18s per word
  const wordStart = 1.2;
  const wordStep = 0.18;

  // Photo darken layer
  const photoScale = 1.04 + 0.04 * (t / 7);
  const eyebrowT = Math.max(0, Math.min(1, (t - 0.3) / 0.4));

  // Byline at 3.4
  const bylineT = Easing.easeOutCubic(Math.max(0, Math.min(1, (t - 3.4) / 0.5)));

  // Stats bar at 4.4
  const statsT = Easing.easeOutCubic(Math.max(0, Math.min(1, (t - 4.4) / 0.5)));

  // Logo at 5.5
  const logoT = Math.max(0, Math.min(1, (t - 5.5) / 0.5));

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
          objectPosition: '70% 50%',
          transform: `scale(${photoScale})`,
          filter: 'contrast(1.05) saturate(0.7) brightness(0.55)',
        }}
      />
      {/* Left dark overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(90deg, rgba(10,11,13,0.95) 0%, rgba(10,11,13,0.85) 50%, rgba(10,11,13,0.3) 100%)',
      }}/>

      {/* Eyebrow */}
      <TplText field="eyebrow" data={data}
        base={{ position: 'absolute', top: 100, left: 100 }}
        style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 26, color: RED, letterSpacing: '0.18em', opacity: eyebrowT }}
        fitKey={eyebrow}
      >// {eyebrow}</TplText>

      {/* Big quote mark */}
      <div style={{
        position: 'absolute',
        top: 130, left: 90,
        fontFamily: 'Georgia, serif',
        fontSize: 360,
        color: RED,
        lineHeight: 1,
        opacity: 0.18,
      }}>"</div>

      {/* Quote text - words appear in sequence */}
      <TplText field="quoteText" data={data}
        base={{ position: 'absolute', top: 280, left: 100, right: 380, display: 'flex', flexWrap: 'wrap', gap: '0 24px' }}
        style={{ fontFamily: 'Anton, sans-serif', fontSize: 110, color: '#fff', lineHeight: 0.95, letterSpacing: '0.005em' }}
        fitKey={quoteText}
      >
        {words.map((w, i) => {
          const wt = Math.max(0, Math.min(1, (t - (wordStart + i * wordStep)) / 0.25));
          const eased = Easing.easeOutCubic(wt);
          const isAccent = w === '4 INCHES' || w === '8 WEEKS.';
          return (
            <span key={i} style={{
              opacity: eased,
              transform: `translateY(${(1 - eased) * 14}px)`,
              color: isAccent ? RED : '#fff',
              display: 'inline-block',
            }}>{w}</span>
          );
        })}
      </TplText>

      {/* Byline */}
      <div style={{
        position: 'absolute',
        bottom: 260, left: 100,
        opacity: bylineT,
        transform: `translateX(${(1 - bylineT) * -20}px)`,
      }}>
        <div style={{
          width: 56, height: 4,
          background: RED,
          marginBottom: 20,
        }}/>
        <TplText field="bylineName" data={data} base={{}}
          style={{ fontFamily: 'Anton, sans-serif', fontSize: 52, color: '#fff' }} fitKey={bylineName}
        >{bylineName}</TplText>
        <TplText field="bylineMeta" data={data} base={{ marginTop: 8 }}
          style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 22, color: '#c2c6cd', letterSpacing: '0.08em' }} fitKey={bylineMeta}
        >{bylineMeta}</TplText>
      </div>

      {/* Stats strip bottom right */}
      <div style={{
        position: 'absolute',
        bottom: 100, right: 100,
        textAlign: 'right',
        opacity: statsT,
        transform: `translateY(${(1 - statsT) * 16}px)`,
      }}>
        <TplText field="statsLabel" data={data} base={{ marginBottom: 12 }}
          style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 22, color: '#969ca7', letterSpacing: '0.12em' }} fitKey={statsLabel}
        >{statsLabel}</TplText>
        <div style={{
          display: 'flex', gap: 32, justifyContent: 'flex-end',
        }}>
          {statPairs.map(([v, l]) => (
            <div key={l}>
              <div style={{
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: 44,
                fontWeight: 700,
                color: RED,
                lineHeight: 1,
              }}>{v}</div>
              <div style={{
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: 18,
                color: '#969ca7',
                marginTop: 4,
                letterSpacing: '0.08em',
              }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Logo bottom left */}
      <div style={{
        position: 'absolute',
        bottom: 100, left: 100,
        display: 'flex', alignItems: 'center', gap: 16,
        opacity: logoT,
      }}>
        <img src="assets/logo.png" style={{ width: 60, height: 60, objectFit: 'contain' }}/>
        <div style={{
          fontFamily: 'Anton, sans-serif',
          fontSize: 28,
          color: '#fff',
          lineHeight: 0.9,
        }}>ATHLETES<br/>ACCELERATION</div>
      </div>
    </div>
  );
}

window.QuoteCardSquare = QuoteCardSquare;

const QUOTE_CARD_SPEC = {
  id: 'quote-card',
  name: 'QUOTE CARD',
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
    "default": "PARENT TESTIMONIAL"
  },
  {
    "key": "quoteText",
    "label": "Quote (one line)",
    "type": "textarea",
    "default": "MY KID GAINED 4 INCHES ON HIS VERTICAL IN 8 WEEKS.",
    "sub": "word-by-word reveal"
  },
  {
    "key": "bylineName",
    "label": "Quoted by",
    "type": "text",
    "default": "SARAH M."
  },
  {
    "key": "bylineMeta",
    "label": "Byline meta",
    "type": "text",
    "default": "PARENT · U14 BASKETBALL · NOBLESVILLE"
  },
  {
    "key": "statsLabel",
    "label": "Stats label",
    "type": "text",
    "default": "HER ATHLETE'S 90-DAY DATA"
  },
  {
    "key": "stats",
    "label": "Stat chips (value|label · …)",
    "type": "text",
    "default": "+4.2\"|VERT · −0.4s|40YD · +25LB|BENCH"
  },
  {
    "key": "media",
    "label": "Background photo or video",
    "type": "image",
    "default": "assets/photo-coach-action.jpg"
  }
],
};
window.QUOTE_CARD_SPEC = QUOTE_CARD_SPEC;
