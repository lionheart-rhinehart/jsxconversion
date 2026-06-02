// CAMP ANNOUNCEMENT · REEL — 9:16 conversion
function CampAnnounceReel({ data = {} }) {
  const t = window.useTime ? window.useTime() : 0;
  const RED = '#c4141d';
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

  const photoScale = 1.05 + 0.04 * (t / 7);
  const eyebrowT = Math.max(0, Math.min(1, (t-0.2)/0.4));
  const titleT = window.Easing ? window.Easing.easeOutCubic(Math.max(0, Math.min(1, (t-0.6)/0.5))) : 1;
  const blockT = window.Easing ? window.Easing.easeOutCubic(Math.max(0, Math.min(1, (t-1.6)/0.5))) : 1;
  const u = Math.max(0, Math.min(1, (t-2.4)/2.8));
  const ticker = Math.round(totalSpots - u * (totalSpots - 7));
  const sinceTick = (Math.max(0, t-2.4)) % 0.3;
  const tickPulse = sinceTick < 0.1 ? 1 - sinceTick / 0.1 : 0;
  const ctaT = window.Easing ? window.Easing.easeOutBack(Math.max(0, Math.min(1, (t-5.4)/0.5))) : 1;

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a0b0d', overflow: 'hidden' }}>
      {window.TrimmedMedia && <window.TrimmedMedia src={media} clipStart={data.media_clipStart} clipEnd={data.media_clipEnd} muted={!data.media_audio} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${photoScale})`, filter: 'brightness(0.32) saturate(0.7) contrast(1.1)' }}/>}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(10,11,13,0.6) 0%, rgba(10,11,13,0.9) 100%)' }}/>

      <Eyebrow top={130} fontSize={24}>// {eyebrow}</Eyebrow>

      <div style={{ position: 'absolute', top: 250, left: 60, right: 60, opacity: titleT, transform: `translateY(${(1-titleT)*18}px)` }}>
        <div style={{ fontFamily: 'Anton, sans-serif', fontSize: 240, color: '#fff', lineHeight: 0.82 }}>{title1}</div>
        <div style={{ fontFamily: 'Anton, sans-serif', fontSize: 240, color: RED, lineHeight: 0.82, marginTop: 8 }}>{title2}</div>
        <div style={{ marginTop: 24, fontFamily: '"JetBrains Mono", monospace', fontSize: 26, color: '#969ca7', letterSpacing: '0.14em' }}>{subhead}</div>
      </div>

      <div style={{ position: 'absolute', bottom: 380, left: 60, right: 60, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 18, opacity: blockT, transform: `translateY(${(1-blockT)*20}px)` }}>
        <div style={{ padding: '24px 20px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}>
          <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 16, color: '#969ca7', letterSpacing: '0.14em', marginBottom: 8 }}>DATES</div>
          <div style={{ fontFamily: 'Anton, sans-serif', fontSize: 64, color: '#fff', lineHeight: 0.9 }}>{dates}</div>
          <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 18, color: '#fff', marginTop: 8, letterSpacing: '0.08em' }}>{hours}</div>
        </div>
        <div style={{ padding: '24px 20px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}>
          <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 16, color: '#969ca7', letterSpacing: '0.14em', marginBottom: 8 }}>AGES</div>
          <div style={{ fontFamily: 'Anton, sans-serif', fontSize: 64, color: '#fff', lineHeight: 0.9 }}>{ages}</div>
          <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 18, color: '#fff', marginTop: 8, letterSpacing: '0.08em' }}>ALL SPORTS</div>
        </div>
        <div style={{ padding: '24px 20px', background: RED, position: 'relative', boxShadow: tickPulse > 0.3 ? `0 0 36px rgba(196,20,29,0.6)` : 'none' }}>
          <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 16, color: 'rgba(255,255,255,0.75)', letterSpacing: '0.14em', marginBottom: 8 }}>SPOTS LEFT</div>
          <div style={{ fontFamily: 'Anton, sans-serif', fontSize: 120, color: '#fff', lineHeight: 0.85, fontVariantNumeric: 'tabular-nums', transform: `scale(${1 + tickPulse * 0.08})`, transformOrigin: 'left', transition: 'transform 80ms' }}>{String(ticker).padStart(2,'0')}</div>
          <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 16, color: '#fff', marginTop: 4, letterSpacing: '0.08em' }}>OF {totalSpots}</div>
        </div>
      </div>

      <div style={{ position: 'absolute', bottom: 90, left: 60, right: 60, padding: '26px 32px', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', opacity: ctaT, transform: `translateY(${(1-ctaT)*16}px)` }}>
        <div style={{ fontFamily: 'Anton, sans-serif', fontSize: 56, color: RED }}>{ctaText}</div>
        <div style={{ width: 64, height: 64, background: RED, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Anton, sans-serif', fontSize: 44, color: '#fff' }}>→</div>
      </div>
    </div>
  );
}
window.CampAnnounceReel = CampAnnounceReel;
const CAMP_ANNOUNCE_REEL_SPEC = { id:'camp-announce-reel', name:'CAMP ANNOUNCE · REEL', fields:[
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
    "default": "SUMMER 2026"
  },
  {
    "key": "title1",
    "label": "Title 1",
    "type": "text",
    "default": "SPEED"
  },
  {
    "key": "title2",
    "label": "Title 2 (red)",
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
    "label": "CTA",
    "type": "text",
    "default": "RESERVE YOUR SPOT"
  },
  {
    "key": "media",
    "label": "Background photo/video",
    "type": "image",
    "default": "assets/photo-group-coaching.jpg"
  }
]};
window.CAMP_ANNOUNCE_REEL_SPEC = CAMP_ANNOUNCE_REEL_SPEC;
