// PARENT QUOTE · REEL — 9:16 conversion of 1:1 Quote Card
function QuoteCardReel({ data = {} }) {
  const t = window.useTime ? window.useTime() : 0;
  const RED = (window.__BRAND__ && window.__BRAND__.brand_red || '#c4141d');
  const eyebrow = data.eyebrow ?? 'PARENT TESTIMONIAL';
  const quoteText = data.quoteText ?? 'MY KID GAINED 4 INCHES ON HIS VERTICAL IN 8 WEEKS.';
  const bylineName = data.bylineName ?? 'SARAH M.';
  const bylineMeta = data.bylineMeta ?? 'PARENT · U14 BASKETBALL · NOBLESVILLE';
  const statsLabel = data.statsLabel ?? "HER ATHLETE'S 90-DAY DATA";
  const stat1Val = data.stat1Val ?? '+4.2"'; const stat1Lbl = data.stat1Lbl ?? 'VERT';
  const stat2Val = data.stat2Val ?? '−0.4s'; const stat2Lbl = data.stat2Lbl ?? '40YD';
  const stat3Val = data.stat3Val ?? '+25LB'; const stat3Lbl = data.stat3Lbl ?? 'BENCH';
  const media = data.media ?? 'assets/photo-coach-action.jpg';

  const words = quoteText.split(/\s+/);
  const wordStart = 1.0, wordStep = 0.16;
  const photoScale = 1.04 + 0.04 * (t / 8);
  const eyebrowT = Math.max(0, Math.min(1, (t-0.3)/0.4));
  const bylineT = window.Easing ? window.Easing.easeOutCubic(Math.max(0, Math.min(1, (t-(wordStart + words.length*wordStep + 0.3))/0.5))) : 1;
  const statsT = window.Easing ? window.Easing.easeOutCubic(Math.max(0, Math.min(1, (t-(wordStart + words.length*wordStep + 1.0))/0.5))) : 1;

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a0b0d', overflow: 'hidden' }}>
      {window.TrimmedMedia && <window.TrimmedMedia src={media} clipStart={data.media_clipStart} clipEnd={data.media_clipEnd} muted={!data.media_audio} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${photoScale})`, filter: 'contrast(1.05) saturate(0.7) brightness(0.45)' }}/>}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(10,11,13,0.85) 0%, rgba(10,11,13,0.5) 50%, rgba(10,11,13,0.95) 100%)' }}/>

      <Eyebrow top={130} fontSize={28}>// {eyebrow}</Eyebrow>

      <div style={{ position: 'absolute', top: 240, left: 70, fontFamily: 'Georgia, serif', fontSize: 380, color: RED, lineHeight: 1, opacity: 0.18 }}>"</div>

      <div style={{ position: 'absolute', top: 350, left: 60, right: 60, fontFamily: 'Anton, sans-serif', fontSize: 130, color: '#fff', lineHeight: 0.96, display: 'flex', flexWrap: 'wrap', gap: '0 28px' }}>
        {words.map((w, i) => {
          const wt = Math.max(0, Math.min(1, (t - (wordStart + i * wordStep)) / 0.25));
          const eased = window.Easing ? window.Easing.easeOutCubic(wt) : wt;
          const isAccent = /\d/.test(w) || w.includes('INCHES') || w.includes('WEEKS');
          return <span key={i} style={{ opacity: eased, transform: `translateY(${(1-eased)*14}px)`, color: isAccent ? RED : '#fff', display: 'inline-block' }}>{w}</span>;
        })}
      </div>

      <div style={{ position: 'absolute', bottom: 460, left: 60, right: 60, opacity: bylineT, transform: `translateX(${(1-bylineT)*-20}px)` }}>
        <div style={{ width: 80, height: 5, background: RED, marginBottom: 22 }}/>
        <div style={{ fontFamily: 'Anton, sans-serif', fontSize: 80, color: '#fff' }}>{bylineName}</div>
        <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 22, color: '#c2c6cd', marginTop: 10, letterSpacing: '0.08em' }}>{bylineMeta}</div>
      </div>

      <div style={{ position: 'absolute', bottom: 180, left: 60, right: 60, opacity: statsT, transform: `translateY(${(1-statsT)*14}px)` }}>
        <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 20, color: '#969ca7', letterSpacing: '0.12em', marginBottom: 18 }}>// {statsLabel}</div>
        <div style={{ display: 'flex', gap: 40 }}>
          {[[stat1Val,stat1Lbl],[stat2Val,stat2Lbl],[stat3Val,stat3Lbl]].map(([v,l]) => (
            <div key={l}>
              <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 64, fontWeight: 700, color: RED, lineHeight: 1 }}>{v}</div>
              <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 18, color: '#969ca7', marginTop: 6, letterSpacing: '0.1em' }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ position: 'absolute', bottom: 90, left: 60, display: 'flex', alignItems: 'center', gap: 16 }}>
        <img src="assets/logo.png" style={{ width: 72, height: 72, objectFit: 'contain' }}/>
        <div style={{ fontFamily: 'Anton, sans-serif', fontSize: 32, color: '#fff', lineHeight: 0.9 }}>ATHLETES<br/>ACCELERATION</div>
      </div>
    </div>
  );
}
window.QuoteCardReel = QuoteCardReel;
const QUOTE_CARD_REEL_SPEC = { id:'quote-card-reel', name:'PARENT QUOTE · REEL', fields:[
  {
    "key": "duration",
    "label": "Length",
    "type": "slider",
    "default": 8,
    "min": 4,
    "max": 15,
    "step": 0.5,
    "unit": "s"
  },
  {
    "key": "eyebrow",
    "label": "Eyebrow",
    "type": "text",
    "default": "PARENT TESTIMONIAL"
  },
  {
    "key": "quoteText",
    "label": "Quote",
    "type": "textarea",
    "default": "MY KID GAINED 4 INCHES ON HIS VERTICAL IN 8 WEEKS."
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
    "key": "stat1Val",
    "label": "Stat 1 value",
    "type": "text",
    "default": "+4.2\""
  },
  {
    "key": "stat1Lbl",
    "label": "Stat 1 label",
    "type": "text",
    "default": "VERT"
  },
  {
    "key": "stat2Val",
    "label": "Stat 2 value",
    "type": "text",
    "default": "−0.4s"
  },
  {
    "key": "stat2Lbl",
    "label": "Stat 2 label",
    "type": "text",
    "default": "40YD"
  },
  {
    "key": "stat3Val",
    "label": "Stat 3 value",
    "type": "text",
    "default": "+25LB"
  },
  {
    "key": "stat3Lbl",
    "label": "Stat 3 label",
    "type": "text",
    "default": "BENCH"
  },
  {
    "key": "media",
    "label": "Background photo/video",
    "type": "image",
    "default": "assets/photo-coach-action.jpg"
  }
]};
window.QUOTE_CARD_REEL_SPEC = QUOTE_CARD_REEL_SPEC;
