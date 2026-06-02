// SEASON-CLOCK — retarget offer (beat F). A season fills month by month while
// the speed never moves ("ANOTHER SEASON. SAME SPEED."), then resolves to the
// offer: see the number first + the verbatim guarantee + CTA. Distinct motion
// from stat-reveal so F1 and F3 don't look alike. Vertical-native 1080x1920.

function SeasonClock({ data = {} }) {
  const eyebrow = data.eyebrow ?? 'CITY SPORTS PARENTS';
  const line1 = data.line1 ?? 'ANOTHER SEASON.';
  const line2 = data.line2 ?? 'SAME SPEED.';
  const offer = data.offer ?? 'SEE THE NUMBER FIRST.';
  const guarantee = data.guarantee ?? '+1 mph speed. +3" vertical. 90 days. Or your training is on us.';
  const cta = data.cta ?? 'BOOK THE FREE ATHLETE ANALYSIS';
  const brand = data.brand ?? 'ATHLETES ACCELERATION';
  const bgClip = data.bgClip ?? null;

  const t = useTime();
  const RED = '#c4141d';
  const clamp = (x) => Math.max(0, Math.min(1, x));
  const ease = (x) => Easing.easeOutCubic(clamp(x));
  const FLIP = 3.6;
  const s1 = clamp(1 - (t - FLIP) / 0.5);      // scene 1 fades out at flip
  const s2 = ease((t - FLIP) / 0.5);            // scene 2 fades in
  const fill = ease((t - 0.4) / 2.6);           // season fills over ~3s
  const stamp = Easing.easeOutBack(clamp((t - 2.5) / 0.5));

  const TRACK_X = 90, TRACK_W = 900, TRACK_Y = 980;

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a0b0d', overflow: 'hidden' }}>
      {bgClip ? <video src={bgClip} autoPlay muted playsInline loop style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} /> : null}
      {bgClip ? <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(10,11,13,0.55) 0%, rgba(10,11,13,0.45) 45%, rgba(10,11,13,0.85) 100%)' }} /> : null}
      {/* SCENE 1 — the season that changed nothing */}
      <div style={{ position: 'absolute', inset: 0, opacity: s1 }}>
        <div style={{ position: 'absolute', top: 150, left: 90,
          fontFamily: '"JetBrains Mono", monospace', fontSize: 32, color: RED, fontWeight: 700,
          display: 'inline-block', background: '#fff', padding: '10px 22px', borderRadius: 8,
          letterSpacing: '0.04em', textTransform: 'uppercase', opacity: ease((t - 0.05) / 0.3) }}>
          {eyebrow}
        </div>
        <div style={{ position: 'absolute', top: 620, left: 86, right: 86,
          fontFamily: 'Anton, sans-serif', fontSize: 150, color: '#fff', lineHeight: 0.9,
          textTransform: 'uppercase', opacity: ease((t - 0.3) / 0.4) }}>{line1}</div>

        {/* season track */}
        <div style={{ position: 'absolute', left: TRACK_X, top: TRACK_Y, width: TRACK_W, height: 10, background: '#26282c' }} />
        <div style={{ position: 'absolute', left: TRACK_X, top: TRACK_Y, width: TRACK_W * fill, height: 10, background: RED }} />
        {Array.from({ length: 12 }, (_, i) => (
          <div key={i} style={{ position: 'absolute', left: TRACK_X + (TRACK_W / 11) * i - 2, top: TRACK_Y - 8, width: 4, height: 26,
            background: (fill * 11 >= i) ? RED : '#3a3d42' }} />
        ))}
        <div style={{ position: 'absolute', left: TRACK_X, top: TRACK_Y + 40,
          fontFamily: '"JetBrains Mono", monospace', fontSize: 28, color: '#9aa0a6', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          12 MONTHS · MORE GAMES · MORE REPS
        </div>

        <div style={{ position: 'absolute', top: 1120, left: 86, right: 86,
          fontFamily: 'Anton, sans-serif', fontSize: 150, color: RED, lineHeight: 0.9,
          textTransform: 'uppercase', opacity: stamp, transform: `scale(${0.9 + stamp * 0.1})` }}>{line2}</div>
      </div>

      {/* SCENE 2 — the offer */}
      <div style={{ position: 'absolute', inset: 0, opacity: s2 }}>
        <div style={{ position: 'absolute', top: 360, left: 86, right: 86,
          fontFamily: 'Anton, sans-serif', fontSize: 132, color: '#fff', lineHeight: 0.92,
          textTransform: 'uppercase' }}>{offer}</div>
        <div style={{ position: 'absolute', top: 820, left: 70, right: 70, padding: '46px 54px', background: RED }}>
          <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 50, fontWeight: 700,
            lineHeight: 1.25, color: '#fff', whiteSpace: 'pre-line' }}>{guarantee}</div>
        </div>
        <div style={{ position: 'absolute', top: 1300, left: 70, right: 70, padding: '34px 40px', background: RED,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: 'Anton, sans-serif', fontSize: 50, color: '#fff', letterSpacing: '0.01em' }}>{cta}</span>
          <span style={{ fontFamily: 'Anton, sans-serif', fontSize: 50, color: '#fff' }}>→</span>
        </div>
      </div>

      <div style={{ position: 'absolute', bottom: 70, left: 90, right: 90,
        fontFamily: '"JetBrains Mono", monospace', fontSize: 28, color: '#fff',
        letterSpacing: '0.14em', textTransform: 'uppercase', opacity: 0.85 }}>{brand}</div>
    </div>
  );
}

window.SeasonClock = SeasonClock;

const SEASON_CLOCK_SPEC = {
  id: 'season-clock',
  name: 'SEASON CLOCK (retarget offer)',
  fields: [
    { "key": "duration", "label": "Length", "type": "slider", "default": 7, "min": 5, "max": 12, "step": 0.5, "unit": "s" },
    { "key": "eyebrow", "role": "eyebrow", "label": "Eyebrow", "type": "text", "default": "CITY SPORTS PARENTS" },
    { "key": "line1", "role": "hook", "label": "Scene 1 line 1", "type": "text", "default": "ANOTHER SEASON." },
    { "key": "line2", "role": "hook", "label": "Scene 1 line 2 (red)", "type": "text", "default": "SAME SPEED." },
    { "key": "offer", "role": "offer", "label": "Offer line", "type": "text", "default": "SEE THE NUMBER FIRST." },
    { "key": "guarantee", "role": "guarantee", "label": "Guarantee (verbatim)", "type": "text", "default": "+1 mph speed. +3\" vertical. 90 days. Or your training is on us." },
    { "key": "cta", "role": "cta", "label": "CTA", "type": "text", "default": "BOOK THE FREE ATHLETE ANALYSIS" },
    { "key": "brand", "role": "brand", "label": "Brand", "type": "text", "default": "ATHLETES ACCELERATION" }
  ],
};
window.SEASON_CLOCK_SPEC = SEASON_CLOCK_SPEC;
