// REACTION STITCH — 9:16 Reel — split screen reaction
// Unique element: top-half video + bottom-half pull-quote response card
function ReactionStitchReel({ data = {} }) {
  const t = window.useTime ? window.useTime() : 0;
  const RED = '#c4141d';

  const eyebrow = data.eyebrow ?? 'REACTION';
  const sourceLabel = data.sourceLabel ?? 'WHAT THEY SAID:';
  const sourceQuote = data.sourceQuote ?? '"YOUTH ATHLETES CAN\'T HANDLE HEAVY LIFTING."';
  const sourceMeta = data.sourceMeta ?? 'INTERNET COMMENT · 2024';
  const responseLabel = data.responseLabel ?? 'OUR RESPONSE:';
  const responseLine1 = data.responseLine1 ?? "WE'VE COACHED";
  const responseLine2 = data.responseLine2 ?? '412 ATHLETES.';
  const responseLine3 = data.responseLine3 ?? '0 INJURIES.';
  const ctaText = data.ctaText ?? 'COME WATCH A SESSION →';
  const media = data.media ?? 'assets/photo-lifting.jpg';

  const eyebrowT = Math.max(0, Math.min(1, (t - 0.3) / 0.4));
  const quoteT = window.Easing ? window.Easing.easeOutCubic(Math.max(0, Math.min(1, (t - 0.7) / 0.5))) : 1;
  const responseT = window.Easing ? window.Easing.easeOutCubic(Math.max(0, Math.min(1, (t - 2.0) / 0.5))) : 1;
  const r1T = Math.max(0, Math.min(1, (t - 2.4) / 0.4));
  const r2T = Math.max(0, Math.min(1, (t - 2.9) / 0.4));
  const r3T = window.Easing ? window.Easing.easeOutBack(Math.max(0, Math.min(1, (t - 3.5) / 0.5))) : 1;
  const ctaT = window.Easing ? window.Easing.easeOutBack(Math.max(0, Math.min(1, (t - 5.4) / 0.5))) : 1;

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a0b0d', overflow: 'hidden' }}>
      {/* Top half: source quote on dark */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '48%',
        background: '#15171a',
        padding: '8% 7%',
        boxSizing: 'border-box',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
      }}>
        <div style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: 22, color: '#969ca7', letterSpacing: '0.18em',
          marginBottom: 14,
          opacity: eyebrowT,
        }}>{sourceLabel}</div>
        <div style={{
          fontFamily: 'Geist, sans-serif',
          fontSize: 56, color: 'rgba(255,255,255,0.5)',
          fontStyle: 'italic',
          fontWeight: 500, lineHeight: 1.2,
          opacity: quoteT,
          transform: `translateY(${(1 - quoteT) * 16}px)`,
        }}>{sourceQuote}</div>
        <div style={{
          marginTop: 18,
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: 18, color: '#6b727f', letterSpacing: '0.12em',
          opacity: quoteT,
        }}>— {sourceMeta}</div>
      </div>

      {/* Divider with eyebrow */}
      <div style={{
        position: 'absolute', top: '48%', left: 0, right: 0, height: 6,
        background: RED,
        boxShadow: `0 0 24px ${RED}`,
      }}/>
      <div style={{
        position: 'absolute', top: 'calc(48% - 22px)', left: '50%',
        transform: 'translateX(-50%)',
        padding: '6px 14px',
        background: RED,
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: 18, color: '#fff', fontWeight: 700,
        letterSpacing: '0.16em',
      }}>// {eyebrow}</div>

      {/* Bottom half: photo backdrop + response */}
      {window.TrimmedMedia && <window.TrimmedMedia
        src={media}
        clipStart={data.media_clipStart}
        clipEnd={data.media_clipEnd}
        muted={!data.media_audio}
        style={{
          position: 'absolute', top: '48%', left: 0, right: 0, bottom: 0,
          width: '100%', height: '52%', objectFit: 'cover',
          filter: 'brightness(0.4) saturate(0.85) contrast(1.1)',
        }}
      />}
      <div style={{
        position: 'absolute', top: '48%', left: 0, right: 0, bottom: 0,
        background: 'linear-gradient(180deg, rgba(10,11,13,0.7) 0%, rgba(10,11,13,0.95) 100%)',
      }}/>

      <div style={{
        position: 'absolute', top: 'calc(48% + 80px)', left: 60, right: 60,
      }}>
        <div style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: 22, color: RED, letterSpacing: '0.18em',
          marginBottom: 14,
          opacity: responseT,
        }}>{responseLabel}</div>
        <div style={{
          fontFamily: 'Anton, sans-serif',
          color: '#fff', fontSize: 130, lineHeight: 0.9,
        }}>
          <div style={{ opacity: r1T, transform: `translateY(${(1 - r1T) * 16}px)` }}>{responseLine1}</div>
          <div style={{ opacity: r2T, transform: `translateY(${(1 - r2T) * 16}px)`, marginTop: 4 }}>{responseLine2}</div>
          <div style={{
            opacity: r3T,
            transform: `translateY(${(1 - r3T) * 16}px) scale(${0.92 + 0.08 * r3T})`,
            transformOrigin: 'left center',
            color: RED,
            textShadow: r3T > 0.95 ? `0 0 24px rgba(196,20,29,0.6)` : 'none',
            marginTop: 4,
          }}>{responseLine3}</div>
        </div>
      </div>

      <div style={{
        position: 'absolute', bottom: 90, left: 60, right: 60,
        padding: '22px 28px', background: RED,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        opacity: ctaT,
      }}>
        <div style={{ fontFamily: 'Anton, sans-serif', fontSize: 40, color: '#fff' }}>{ctaText}</div>
        <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 16, color: '#fff', letterSpacing: '0.1em' }}>ATHLETESACCEL.COM</div>
      </div>
    </div>
  );
}
window.ReactionStitchReel = ReactionStitchReel;
const REACTION_STITCH_SPEC = {
  id: 'reaction-stitch',
  name: 'REACTION STITCH',
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
    "label": "Divider tag",
    "type": "text",
    "default": "REACTION"
  },
  {
    "key": "sourceLabel",
    "label": "Source label",
    "type": "text",
    "default": "WHAT THEY SAID:"
  },
  {
    "key": "sourceQuote",
    "label": "Source quote",
    "type": "textarea",
    "default": "\"YOUTH ATHLETES CAN'T HANDLE HEAVY LIFTING.\""
  },
  {
    "key": "sourceMeta",
    "label": "Source meta",
    "type": "text",
    "default": "INTERNET COMMENT · 2024"
  },
  {
    "key": "responseLabel",
    "label": "Response label",
    "type": "text",
    "default": "OUR RESPONSE:"
  },
  {
    "key": "responseLine1",
    "label": "Response line 1",
    "type": "text",
    "default": "WE'VE COACHED"
  },
  {
    "key": "responseLine2",
    "label": "Response line 2",
    "type": "text",
    "default": "412 ATHLETES."
  },
  {
    "key": "responseLine3",
    "label": "Response line 3 (red)",
    "type": "text",
    "default": "0 INJURIES."
  },
  {
    "key": "ctaText",
    "label": "CTA text",
    "type": "text",
    "default": "COME WATCH A SESSION →"
  },
  {
    "key": "media",
    "label": "Bottom-half photo/video",
    "type": "image",
    "default": "assets/photo-lifting.jpg"
  }
],
};
window.REACTION_STITCH_SPEC = REACTION_STITCH_SPEC;
