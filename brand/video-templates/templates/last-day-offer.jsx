// LAST DAY — 9:16 Reel — final-day urgency offer with countdown clock
function LastDayOfferReel({ data = {} }) {
  const t = window.useTime ? window.useTime() : 0;
  const RED = '#c4141d';

  const eyebrow = data.eyebrow ?? 'LAST CHANCE';
  const title1 = data.title1 ?? 'TODAY.';
  const title2 = data.title2 ?? 'OR NEVER.';
  const offerLabel = data.offerLabel ?? 'THE DEAL';
  const offerHeadline = data.offerHeadline ?? '50% OFF';
  const offerSub = data.offerSub ?? 'FIRST MONTH · NEW MEMBERS ONLY';
  const closeAtHours = (typeof data.closeAtHours === 'number') ? data.closeAtHours : 11;
  const closeAtMins = (typeof data.closeAtMins === 'number') ? data.closeAtMins : 59;
  const closingNote = data.closingNote ?? 'CLOCK STOPS AT MIDNIGHT.';
  const ctaText = data.ctaText ?? 'CLAIM IT';

  // Pulsing red flash
  const flash = (Math.sin(t * 5) + 1) / 2;

  // Ticking clock (visual: HH:MM:SS, just the seconds advance)
  const second = Math.floor(t) % 60;

  const eyebrowT = Math.max(0, Math.min(1, (t - 0.2) / 0.4));
  const titleT = window.Easing ? window.Easing.easeOutCubic(Math.max(0, Math.min(1, (t - 0.4) / 0.5))) : 1;
  const offerT = window.Easing ? window.Easing.easeOutBack(Math.max(0, Math.min(1, (t - 1.0) / 0.5))) : 1;
  const clockT = Math.max(0, Math.min(1, (t - 1.6) / 0.4));
  const noteT = Math.max(0, Math.min(1, (t - 4.4) / 0.4));
  const ctaT = window.Easing ? window.Easing.easeOutBack(Math.max(0, Math.min(1, (t - 5.2) / 0.5))) : 1;

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a0b0d', overflow: 'hidden' }}>
      {/* Pulsing red glow corners */}
      <div style={{ position: 'absolute', top: -200, left: -200, width: 600, height: 600, background: `radial-gradient(circle, ${RED}${Math.round(flash * 50 + 25).toString(16)} 0%, transparent 60%)`, filter: 'blur(40px)' }}/>
      <div style={{ position: 'absolute', bottom: -200, right: -200, width: 600, height: 600, background: `radial-gradient(circle, ${RED}${Math.round(flash * 50 + 25).toString(16)} 0%, transparent 60%)`, filter: 'blur(40px)' }}/>

      <div style={{ position: 'absolute', top: 110, left: 60, padding: '8px 16px', background: RED, fontFamily: '"JetBrains Mono", monospace', fontSize: 26, color: '#fff', letterSpacing: '0.18em', opacity: eyebrowT, boxShadow: `0 0 ${16 + flash * 24}px rgba(196,20,29,${0.4 + flash * 0.5})` }}>⚠️ // {eyebrow}</div>

      <div style={{ position: 'absolute', top: 200, left: 60, right: 60, fontFamily: 'Anton, sans-serif', fontSize: 180, color: '#fff', lineHeight: 0.88, opacity: titleT }}>{title1}<br/><span style={{ color: RED, textShadow: `0 0 ${20 + flash * 30}px rgba(196,20,29,${0.4 + flash * 0.4})` }}>{title2}</span></div>

      {/* Offer card */}
      <div style={{ position: 'absolute', top: 640, left: 60, right: 60, padding: '40px 32px', background: '#fff', textAlign: 'center', opacity: offerT, transform: `scale(${0.94 + 0.06 * offerT})`, boxShadow: `0 20px 60px rgba(196,20,29,${0.3 + flash * 0.2})` }}>
        <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 22, color: RED, letterSpacing: '0.18em', marginBottom: 14 }}>// {offerLabel}</div>
        <div style={{ fontFamily: 'Anton, sans-serif', fontSize: 240, color: RED, lineHeight: 0.85, letterSpacing: '-0.01em' }}>{offerHeadline}</div>
        <div style={{ marginTop: 16, fontFamily: '"JetBrains Mono", monospace', fontSize: 20, color: '#0a0b0d', letterSpacing: '0.12em' }}>{offerSub}</div>
      </div>

      {/* Countdown clock */}
      <div style={{ position: 'absolute', top: 1280, left: 60, right: 60, padding: '24px 28px', background: '#0a0b0d', border: `2px solid ${RED}`, display: 'flex', justifyContent: 'space-around', alignItems: 'center', opacity: clockT, boxShadow: `inset 0 0 ${20 + flash * 20}px rgba(196,20,29,${0.2 + flash * 0.3})` }}>
        {[['HRS', closeAtHours], ['MIN', closeAtMins], ['SEC', second]].map(([l, v]) => (
          <div key={l} style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'Anton, sans-serif', fontSize: 96, color: '#fff', lineHeight: 0.85, fontVariantNumeric: 'tabular-nums', textShadow: l === 'SEC' ? `0 0 ${8 + flash * 16}px ${RED}` : 'none' }}>{String(v).padStart(2, '0')}</div>
            <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 16, color: '#969ca7', letterSpacing: '0.16em', marginTop: 4 }}>{l}</div>
          </div>
        ))}
      </div>

      <div style={{ position: 'absolute', bottom: 230, left: 60, right: 60, textAlign: 'center', fontFamily: 'Anton, sans-serif', fontSize: 44, color: '#fff', opacity: noteT }}>{closingNote}</div>

      <div style={{ position: 'absolute', bottom: 90, left: 60, right: 60, padding: '26px 28px', background: RED, display: 'flex', alignItems: 'center', justifyContent: 'space-between', opacity: ctaT, boxShadow: `0 12px 36px rgba(196,20,29,${0.4 + flash * 0.3})` }}>
        <div style={{ fontFamily: 'Anton, sans-serif', fontSize: 56, color: '#fff' }}>{ctaText} →</div>
        <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 16, color: '#fff', letterSpacing: '0.1em' }}>ATHLETESACCEL.COM</div>
      </div>
    </div>
  );
}
window.LastDayOfferReel = LastDayOfferReel;
const LAST_DAY_OFFER_SPEC = {
  id: 'last-day-offer', name: 'LAST DAY',
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
    "label": "Eyebrow",
    "type": "text",
    "default": "LAST CHANCE"
  },
  {
    "key": "title1",
    "label": "Title 1",
    "type": "text",
    "default": "TODAY."
  },
  {
    "key": "title2",
    "label": "Title 2 (red)",
    "type": "text",
    "default": "OR NEVER."
  },
  {
    "key": "offerLabel",
    "label": "Offer label",
    "type": "text",
    "default": "THE DEAL"
  },
  {
    "key": "offerHeadline",
    "label": "Offer headline",
    "type": "text",
    "default": "50% OFF"
  },
  {
    "key": "offerSub",
    "label": "Offer sub",
    "type": "text",
    "default": "FIRST MONTH · NEW MEMBERS ONLY"
  },
  {
    "key": "closeAtHours",
    "label": "Hours left",
    "type": "number",
    "default": 11,
    "step": 1,
    "min": 0,
    "max": 99
  },
  {
    "key": "closeAtMins",
    "label": "Mins left",
    "type": "number",
    "default": 59,
    "step": 1,
    "min": 0,
    "max": 59
  },
  {
    "key": "closingNote",
    "label": "Closing line",
    "type": "text",
    "default": "CLOCK STOPS AT MIDNIGHT."
  },
  {
    "key": "ctaText",
    "label": "CTA",
    "type": "text",
    "default": "CLAIM IT"
  }
],
};
window.LAST_DAY_OFFER_SPEC = LAST_DAY_OFFER_SPEC;
