// FRESH-SMOKE-MOTION — "The Last Rep Lie" kinetic hook — 8s vertical reel
// Fresh-authored (compose-creative output) to smoke-test the fresh-creation path.
// Media-free kinetic typography: three traits stack in, the pivot lands in red,
// then the microscript + CTA. Bare bank shape — returns a <div>, reads data.* with
// ?? defaults, registers window.FreshSmokeReel; the runner wraps it in a <Stage>.
// Brand motion: quick, confident, easeOutCubic entrances — no bounce.

function FreshSmokeReel({ data = {} }) {
  const eyebrow = data.eyebrow ?? 'THE LAST REP LIE';
  const line1 = data.line1 ?? 'SHOWS UP.';
  const line2 = data.line2 ?? 'WORKS HARD.';
  const line3 = data.line3 ?? 'NEVER QUITS.';
  const punch = data.punch ?? 'STILL THE SAME SPEED.';
  const microscript = data.microscript ?? "THIS ISN'T BAD LUCK. IT'S PHYSICS.";
  const ctaText = data.ctaText ?? 'BOOK YOUR FREE ASSESSMENT';

  const t = useTime();
  const RED = '#c4141d';

  const clamp01 = (x) => Math.max(0, Math.min(1, x));
  // Staggered trait reveals, then the pivot, microscript, and CTA banner.
  const eyebrowT = clamp01((t - 0.2) / 0.3);
  const l1 = Easing.easeOutCubic(clamp01((t - 0.7) / 0.5));
  const l2 = Easing.easeOutCubic(clamp01((t - 1.3) / 0.5));
  const l3 = Easing.easeOutCubic(clamp01((t - 1.9) / 0.5));
  const punchT = Easing.easeOutCubic(clamp01((t - 2.9) / 0.6));
  const microT = clamp01((t - 4.3) / 0.5);
  const bannerT = Easing.easeOutCubic(clamp01((t - 5.3) / 0.6));

  const rise = (p, px = 18) => `translateY(${(1 - p) * px}px)`;

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a0b0d', overflow: 'hidden' }}>
      {/* subtle red glow corner — finishing accent, not a full wash */}
      <div style={{
        position: 'absolute', top: -200, left: -200,
        width: 620, height: 620,
        background: `radial-gradient(circle, ${RED}22 0%, transparent 60%)`,
        filter: 'blur(20px)',
      }} />

      <TplText field="eyebrow" data={data}
        base={{ position: 'absolute', top: 200, left: 90, right: 90, textAlign: 'center' }}
        style={{
          fontFamily: '"JetBrains Mono", monospace', fontSize: 32, color: RED,
          letterSpacing: '0.18em', opacity: eyebrowT, whiteSpace: 'nowrap',
        }}
        maxWidth={900} fitKey={eyebrow}
      >// {eyebrow}</TplText>

      <TplText field="line1" data={data}
        base={{ position: 'absolute', top: 560, left: 80, right: 80, textAlign: 'center' }}
        style={{ fontFamily: 'Anton, sans-serif', fontSize: 128, color: '#fff', lineHeight: 0.9, opacity: l1, transform: rise(l1) }}
        maxWidth={920} fitKey={line1}
      >{line1}</TplText>

      <TplText field="line2" data={data}
        base={{ position: 'absolute', top: 700, left: 80, right: 80, textAlign: 'center' }}
        style={{ fontFamily: 'Anton, sans-serif', fontSize: 128, color: '#fff', lineHeight: 0.9, opacity: l2, transform: rise(l2) }}
        maxWidth={920} fitKey={line2}
      >{line2}</TplText>

      <TplText field="line3" data={data}
        base={{ position: 'absolute', top: 840, left: 80, right: 80, textAlign: 'center' }}
        style={{ fontFamily: 'Anton, sans-serif', fontSize: 128, color: '#fff', lineHeight: 0.9, opacity: l3, transform: rise(l3) }}
        maxWidth={920} fitKey={line3}
      >{line3}</TplText>

      <TplText field="punch" data={data}
        base={{ position: 'absolute', top: 1080, left: 70, right: 70, textAlign: 'center' }}
        style={{ fontFamily: 'Anton, sans-serif', fontSize: 132, color: RED, lineHeight: 0.92, letterSpacing: '-0.01em', opacity: punchT, transform: rise(punchT, 24) }}
        maxHeight={420} maxWidth={940} fitKey={punch}
      >{punch}</TplText>

      <TplText field="microscript" data={data}
        base={{ position: 'absolute', top: 1420, left: 100, right: 100, textAlign: 'center' }}
        style={{
          fontFamily: '"JetBrains Mono", monospace', fontSize: 38, color: '#d7dbe0',
          letterSpacing: '0.04em', lineHeight: 1.35, opacity: microT, transform: rise(microT),
        }}
        maxWidth={880} fitKey={microscript}
      >{microscript}</TplText>

      {/* Bottom CTA banner — confident slide-up, no bounce */}
      <div style={{
        position: 'absolute', bottom: 90, left: 60, right: 60,
        padding: '32px 40px', background: 'rgba(196,20,29,0.95)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        opacity: bannerT, transform: `translateY(${(1 - bannerT) * 30}px)`,
      }}>
        <TplText field="cta" data={data} base={{}}
          style={{ fontFamily: 'Anton, sans-serif', fontSize: 60, color: '#fff', letterSpacing: '0.005em', whiteSpace: 'nowrap' }}
          maxWidth={760} fitKey={ctaText}
        >{ctaText}</TplText>
        <div style={{
          width: 80, height: 80, background: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'Anton, sans-serif', fontSize: 64, color: RED,
        }}>→</div>
      </div>
    </div>
  );
}

window.FreshSmokeReel = FreshSmokeReel;

const FRESH_SMOKE_SPEC = {
  id: 'fresh-smoke-motion',
  name: 'THE LAST REP LIE',
  fields: [
    { key: 'duration', label: 'Length', type: 'slider', default: 8, min: 4, max: 12, step: 0.5, unit: 's' },
    { key: 'eyebrow', label: 'Eyebrow tag', type: 'text', default: 'THE LAST REP LIE' },
    { key: 'line1', label: 'Trait line 1', type: 'text', default: 'SHOWS UP.' },
    { key: 'line2', label: 'Trait line 2', type: 'text', default: 'WORKS HARD.' },
    { key: 'line3', label: 'Trait line 3', type: 'text', default: 'NEVER QUITS.' },
    { key: 'punch', label: 'Pivot line (red)', type: 'text', default: 'STILL THE SAME SPEED.' },
    { key: 'microscript', label: 'Microscript', type: 'text', default: "THIS ISN'T BAD LUCK. IT'S PHYSICS." },
    { key: 'ctaText', label: 'CTA text', type: 'text', default: 'BOOK YOUR FREE ASSESSMENT' },
  ],
};
window.FRESH_SMOKE_SPEC = FRESH_SMOKE_SPEC;
