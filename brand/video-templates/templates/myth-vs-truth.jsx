// MYTH VS TRUTH — 9:16 Reel — bust a common training myth
// Unique element: red-strike crossing through the myth, green truth revealing.

function MythVsTruthReel({ data = {} }) {
  const t = window.useTime ? window.useTime() : 0;
  const RED = '#c4141d';
  const GREEN = '#15a34a';

  const eyebrow = data.eyebrow ?? 'TRAINING MYTH BUSTED';
  const mythLabel = data.mythLabel ?? 'YOU\'VE BEEN TOLD';
  const myth = data.myth ?? 'LIFTING WEIGHTS WILL STUNT YOUR GROWTH.';
  const truthLabel = data.truthLabel ?? 'THE TRUTH';
  const truth = data.truth ?? 'PROPERLY COACHED LIFTING IS THE SAFEST SPORT FOR YOUTH ATHLETES.';
  const sourceLabel = data.sourceLabel ?? 'SOURCE';
  const source = data.source ?? 'NSCA POSITION STATEMENT · 2024';
  const ctaText = data.ctaText ?? 'STOP BELIEVING THE BS →';

  const eyebrowT = Math.max(0, Math.min(1, (t - 0.2) / 0.4));
  const mythLabelT = Math.max(0, Math.min(1, (t - 0.6) / 0.4));
  const mythT = window.Easing ? window.Easing.easeOutCubic(Math.max(0, Math.min(1, (t - 0.9) / 0.5))) : 1;
  // Strike line draws across at 2.0
  const strikeT = window.Easing ? window.Easing.easeOutCubic(Math.max(0, Math.min(1, (t - 2.0) / 0.6))) : 1;
  // Truth label + content reveal at 2.9
  const truthLabelT = Math.max(0, Math.min(1, (t - 2.9) / 0.4));
  const truthT = window.Easing ? window.Easing.easeOutCubic(Math.max(0, Math.min(1, (t - 3.2) / 0.6))) : 1;
  const sourceT = Math.max(0, Math.min(1, (t - 4.4) / 0.4));
  const ctaT = window.Easing ? window.Easing.easeOutBack(Math.max(0, Math.min(1, (t - 5.6) / 0.5))) : 1;

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a0b0d', overflow: 'hidden' }}>
      <div style={{
        position: 'absolute', top: 110, left: 60,
        padding: '8px 16px',
        background: RED,
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: 24, color: '#fff', letterSpacing: '0.16em',
        opacity: eyebrowT,
      }}>// {eyebrow}</div>

      {/* MYTH block */}
      <div style={{
        position: 'absolute', top: 240, left: 60, right: 60,
      }}>
        <div style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: 22, color: RED, letterSpacing: '0.18em',
          marginBottom: 14,
          opacity: mythLabelT,
        }}>{mythLabel}</div>
        <div style={{
          position: 'relative',
          fontFamily: 'Anton, sans-serif',
          fontSize: 84, color: '#969ca7', lineHeight: 0.95,
          opacity: mythT,
          transform: `translateY(${(1 - mythT) * 16}px)`,
        }}>
          {myth}
          {/* Strike line */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: 0,
            width: `${strikeT * 100}%`,
            height: 8,
            background: RED,
            transformOrigin: 'left center',
            transform: 'translateY(-50%) skewY(-2deg)',
            boxShadow: `0 0 16px ${RED}`,
          }}/>
        </div>
      </div>

      {/* TRUTH block */}
      <div style={{
        position: 'absolute', top: 940, left: 60, right: 60,
      }}>
        <div style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: 22, color: GREEN, letterSpacing: '0.18em',
          marginBottom: 14,
          opacity: truthLabelT,
        }}>{truthLabel}</div>
        <div style={{
          fontFamily: 'Anton, sans-serif',
          fontSize: 84, color: '#fff', lineHeight: 0.95,
          opacity: truthT,
          transform: `translateY(${(1 - truthT) * 18}px)`,
        }}>{truth}</div>

        {/* Highlight underline that draws under last word */}
        <div style={{
          marginTop: 18,
          height: 6,
          width: `${truthT * 40}%`,
          background: GREEN,
          boxShadow: `0 0 14px ${GREEN}`,
        }}/>
      </div>

      {/* Source */}
      <div style={{
        position: 'absolute', bottom: 220, left: 60, right: 60,
        padding: '14px 18px',
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.12)',
        opacity: sourceT,
        transform: `translateY(${(1 - sourceT) * 10}px)`,
        display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
      }}>
        <div style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: 14, color: GREEN, letterSpacing: '0.16em',
        }}>// {sourceLabel}</div>
        <div style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: 18, color: '#fff', letterSpacing: '0.08em',
        }}>{source}</div>
      </div>

      <div style={{
        position: 'absolute', bottom: 90, left: 60, right: 60,
        padding: '22px 28px',
        background: RED,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        opacity: ctaT,
        transform: `translateY(${(1 - ctaT) * 16}px)`,
      }}>
        <div style={{ fontFamily: 'Anton, sans-serif', fontSize: 40, color: '#fff' }}>{ctaText}</div>
        <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 16, color: '#fff', letterSpacing: '0.1em' }}>ATHLETESACCEL.COM</div>
      </div>
    </div>
  );
}

window.MythVsTruthReel = MythVsTruthReel;

const MYTH_VS_TRUTH_SPEC = {
  id: 'myth-vs-truth',
  name: 'MYTH VS TRUTH',
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
    "label": "Eyebrow tag",
    "type": "text",
    "default": "TRAINING MYTH BUSTED"
  },
  {
    "key": "mythLabel",
    "label": "Myth label",
    "type": "text",
    "default": "YOU'VE BEEN TOLD"
  },
  {
    "key": "myth",
    "label": "The myth",
    "type": "textarea",
    "default": "LIFTING WEIGHTS WILL STUNT YOUR GROWTH."
  },
  {
    "key": "truthLabel",
    "label": "Truth label",
    "type": "text",
    "default": "THE TRUTH"
  },
  {
    "key": "truth",
    "label": "The truth",
    "type": "textarea",
    "default": "PROPERLY COACHED LIFTING IS THE SAFEST SPORT FOR YOUTH ATHLETES."
  },
  {
    "key": "sourceLabel",
    "label": "Source label",
    "type": "text",
    "default": "SOURCE"
  },
  {
    "key": "source",
    "label": "Source citation",
    "type": "text",
    "default": "NSCA POSITION STATEMENT · 2024"
  },
  {
    "key": "ctaText",
    "label": "CTA text",
    "type": "text",
    "default": "STOP BELIEVING THE BS →"
  }
],
};
window.MYTH_VS_TRUTH_SPEC = MYTH_VS_TRUTH_SPEC;
