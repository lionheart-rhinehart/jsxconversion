// 90-DAY STAT REVEAL — 1:1 Feed Post — 6s loop
// Three guarantee stats animate in sequentially. Use as a brand-anchor post.

function StatRevealSquare({ data = {} }) {
  const eyebrow = data.eyebrow ?? '90-DAY GUARANTEE';
  const title1 = data.title1 ?? 'WE GUARANTEE';
  const title2 = data.title2 ?? 'RESULTS.';
  const ctaText = data.ctaText ?? 'BOOK YOUR FREE ASSESSMENT';
  // Stats are data-driven (editable in the COPY tab); literals are the defaults.
  const stat1Value = data.stat1Value ?? 1;
  const stat1Unit = data.stat1Unit ?? ' MPH';
  const stat1Label = data.stat1Label ?? 'SPEED';
  const stat2Value = data.stat2Value ?? 3;
  const stat2Unit = data.stat2Unit ?? '"';
  const stat2Label = data.stat2Label ?? 'VERTICAL';
  const freeLine1 = data.freeLine1 ?? "OR IT'S";
  const freeLine2 = data.freeLine2 ?? 'FREE.';

  const t = useTime();
  const RED = (window.__BRAND__ && window.__BRAND__.brand_red || '#c4141d');

  // Three stat reveals
  const s1T = Easing.easeOutCubic(Math.max(0, Math.min(1, (t - 0.8) / 0.5)));
  const s2T = Easing.easeOutCubic(Math.max(0, Math.min(1, (t - 1.6) / 0.5)));
  const s3T = Easing.easeOutCubic(Math.max(0, Math.min(1, (t - 2.4) / 0.5)));

  // Count-up values (target = editable stat value)
  const v1 = (Easing.easeOutCubic(Math.max(0, Math.min(1, (t - 1.0) / 0.7))) * Number(stat1Value || 0)).toFixed(0);
  const v2 = (Easing.easeOutCubic(Math.max(0, Math.min(1, (t - 1.8) / 0.7))) * Number(stat2Value || 0)).toFixed(0);
  const v3 = Easing.easeOutCubic(Math.max(0, Math.min(1, (t - 2.6) / 0.7)));

  // Bottom banner at 4
  const bannerT = Easing.easeOutBack(Math.max(0, Math.min(1, (t - 4.0) / 0.6)));

  // Eyebrow
  const eyebrowT = Math.max(0, Math.min(1, (t - 0.2) / 0.3));

  // Stats are rendered below as movable TplText units (number + label stacked).
  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: '#0a0b0d',
      overflow: 'hidden',
    }}>
      {/* subtle red glow corner */}
      <div style={{
        position: 'absolute',
        top: -200, right: -200,
        width: 600, height: 600,
        background: `radial-gradient(circle, ${RED}22 0%, transparent 60%)`,
        filter: 'blur(20px)',
      }}/>

      <TplText field="eyebrow" data={data}
        base={{ position: 'absolute', top: 100, left: 100, padding: '10px 22px', background: '#fff', borderRadius: 8 }}
        style={{
          fontFamily: '"JetBrains Mono", monospace', fontSize: 28, color: RED, fontWeight: 700,
          letterSpacing: '0.08em', opacity: eyebrowT, whiteSpace: 'nowrap',
        }}
        maxWidth={880} fitKey={eyebrow}
      >{eyebrow}</TplText>

      <TplText field="title" data={data}
        base={{ position: 'absolute', top: 160, left: 100, right: 100 }}
        style={{
          fontFamily: 'Anton, sans-serif', fontSize: 120, color: '#fff', lineHeight: 0.9,
          opacity: eyebrowT, transform: `translateY(${(1 - eyebrowT) * 12}px)`,
        }}
        maxHeight={350} fitKey={title1 + '|' + title2}
      >{title1}<br/><span style={{color: RED}}>{title2}</span></TplText>

      {/* Stat dividers (decorative, not movable) */}
      <div style={{ position: 'absolute', top: 530, left: 380, width: 1, height: 300, background: 'rgba(255,255,255,0.12)', opacity: s2T }}/>
      <div style={{ position: 'absolute', top: 530, left: 700, width: 1, height: 300, background: 'rgba(255,255,255,0.12)', opacity: s3T }}/>

      {/* Each stat is ONE movable unit (number + label stacked, as the original).
          Inner sizes are em-relative so resizing the unit scales it proportionally. */}
      <TplText field="stat1" data={data} base={{ position: 'absolute', top: 530, left: 92, width: 256 }}
        style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 180, fontWeight: 800, lineHeight: 0.85, letterSpacing: '-0.03em', color: '#fff', opacity: s1T, transform: `translateY(${(1 - s1T) * 20}px)` }}>
        <div><span style={{ color: RED }}>+</span>{v1}<span style={{ fontSize: '0.556em', color: '#969ca7' }}>{stat1Unit}</span></div>
        <div style={{ fontFamily: 'Anton, sans-serif', fontWeight: 400, fontSize: '0.311em', lineHeight: 1, letterSpacing: '0.005em', marginTop: '0.13em' }}>{stat1Label}</div>
      </TplText>

      <TplText field="stat2" data={data} base={{ position: 'absolute', top: 530, left: 412, width: 256 }}
        style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 180, fontWeight: 800, lineHeight: 0.85, letterSpacing: '-0.03em', color: '#fff', opacity: s2T, transform: `translateY(${(1 - s2T) * 20}px)` }}>
        <div><span style={{ color: RED }}>+</span>{v2}<span style={{ fontSize: '0.556em', color: '#969ca7' }}>{stat2Unit}</span></div>
        <div style={{ fontFamily: 'Anton, sans-serif', fontWeight: 400, fontSize: '0.311em', lineHeight: 1, letterSpacing: '0.005em', marginTop: '0.13em' }}>{stat2Label}</div>
      </TplText>

      <TplText field="orfree" data={data}
        base={{ position: 'absolute', top: 530, left: 732, width: 300 }}
        style={{ fontFamily: 'Anton, sans-serif', fontSize: 144, color: '#fff', lineHeight: 0.85, letterSpacing: '0.01em', opacity: s3T, transform: `translateY(${(1 - s3T) * 20}px)` }}
      >{freeLine1}<br/><span style={{color: RED}}>{freeLine2}</span></TplText>

      {/* Bottom CTA banner */}
      <div style={{
        position: 'absolute',
        bottom: 80, left: 60, right: 60,
        padding: '32px 40px',
        background: 'rgba(196,20,29,0.95)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        opacity: bannerT,
        transform: `translateY(${(1 - bannerT) * 30}px)`,
      }}>
        <TplText field="cta" data={data} base={{}}
          style={{
            fontFamily: 'Anton, sans-serif', fontSize: 64, color: '#fff',
            letterSpacing: '0.005em', whiteSpace: 'nowrap',
          }}
          maxWidth={760} fitKey={ctaText}
        >{ctaText}</TplText>
        <div style={{
          width: 80, height: 80,
          background: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'Anton, sans-serif',
          fontSize: 64, color: RED,
        }}>→</div>
      </div>
    </div>
  );
}

window.StatRevealSquare = StatRevealSquare;

const STAT_REVEAL_SPEC = {
  id: 'stat-reveal',
  name: 'STAT REVEAL',
  fields: [
  {
    "key": "duration",
    "label": "Length",
    "type": "slider",
    "default": 6,
    "min": 3,
    "max": 15,
    "step": 0.5,
    "unit": "s"
  },
  {
    "key": "eyebrow",

    "role": "eyebrow",
    "label": "Eyebrow tag",
    "type": "text",
    "default": "90-DAY GUARANTEE"
  },
  {
    "key": "title1",

    "role": "claim",
    "label": "Title line 1",
    "type": "text",
    "default": "WE GUARANTEE"
  },
  {
    "key": "title2",

    "role": "claim",
    "label": "Title line 2 (red)",
    "type": "text",
    "default": "RESULTS."
  },
  {
    "key": "ctaText",

    "role": "cta",
    "label": "CTA text",
    "type": "text",
    "default": "BOOK YOUR FREE ASSESSMENT"
  },
  { "key": "stat1Value", "role": "stat", "label": "Stat 1 — number", "type": "number", "default": 1 },
  { "key": "stat1Unit",  "role": "stat", "label": "Stat 1 — unit",   "type": "text",   "default": " MPH" },
  { "key": "stat1Label", "role": "stat", "label": "Stat 1 — label",  "type": "text",   "default": "SPEED" },
  { "key": "stat2Value", "role": "stat", "label": "Stat 2 — number", "type": "number", "default": 3 },
  { "key": "stat2Unit",  "role": "stat", "label": "Stat 2 — unit",   "type": "text",   "default": "\"" },
  { "key": "stat2Label", "role": "stat", "label": "Stat 2 — label",  "type": "text",   "default": "VERTICAL" },
  { "key": "freeLine1",  "role": "guarantee", "label": "Free line 1",     "type": "text",   "default": "OR IT'S" },
  { "key": "freeLine2",  "role": "guarantee", "label": "Free line 2 (red)","type": "text",  "default": "FREE." }
],
};
window.STAT_REVEAL_SPEC = STAT_REVEAL_SPEC;
