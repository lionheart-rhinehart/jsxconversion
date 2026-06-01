// VOICEOVER STAT STACK — 9:16 Reel — uses <AudioWaveform>
// 4 escalating stats appearing one-by-one with a live audio waveform at top.

function VoiceoverStackReel({ data = {} }) {
  const t = window.useTime ? window.useTime() : 0;
  const RED = '#c4141d';

  const eyebrow = data.eyebrow ?? 'BY THE NUMBERS';
  const headline = data.headline ?? 'THIS IS WHAT WORKS.';
  const stat1Value = data.stat1Value ?? '90';
  const stat1Unit = data.stat1Unit ?? 'DAYS';
  const stat1Label = data.stat1Label ?? 'TO MEASURABLE CHANGE';
  const stat2Value = data.stat2Value ?? '4×';
  const stat2Unit = data.stat2Unit ?? 'PER WEEK';
  const stat2Label = data.stat2Label ?? 'STRUCTURED SESSIONS';
  const stat3Value = data.stat3Value ?? '+1';
  const stat3Unit = data.stat3Unit ?? 'MPH';
  const stat3Label = data.stat3Label ?? 'AVERAGE SPEED GAIN';
  const stat4Value = data.stat4Value ?? '0';
  const stat4Unit = data.stat4Unit ?? 'EXCUSES';
  const stat4Label = data.stat4Label ?? 'WE TRACK EVERYTHING';
  const ctaText = data.ctaText ?? 'BOOK YOUR ASSESSMENT';

  const eyebrowT = Math.max(0, Math.min(1, (t - 0.2) / 0.4));
  const wfT = Math.max(0, Math.min(1, (t - 0.4) / 0.4));
  const headlineT = window.Easing ? window.Easing.easeOutCubic(Math.max(0, Math.min(1, (t - 0.8) / 0.5))) : 1;

  const stats = [
    { v: stat1Value, u: stat1Unit, l: stat1Label, at: 1.6 },
    { v: stat2Value, u: stat2Unit, l: stat2Label, at: 2.4 },
    { v: stat3Value, u: stat3Unit, l: stat3Label, at: 3.2 },
    { v: stat4Value, u: stat4Unit, l: stat4Label, at: 4.0 },
  ];
  const statT = (at) => window.Easing
    ? window.Easing.easeOutCubic(Math.max(0, Math.min(1, (t - at) / 0.5)))
    : Math.max(0, Math.min(1, (t - at) / 0.5));

  const ctaT = window.Easing ? window.Easing.easeOutBack(Math.max(0, Math.min(1, (t - 5.4) / 0.5))) : 1;

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a0b0d', overflow: 'hidden' }}>
      {/* Waveform at top */}
      <div style={{
        position: 'absolute', top: 80, left: 40, right: 40, height: 220,
        opacity: wfT,
        transform: `translateY(${(1 - wfT) * -12}px)`,
        background: 'rgba(15,17,21,0.85)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}>
        {window.AudioWaveform && <window.AudioWaveform
          barCount={36} color={RED} label="// VOICEOVER · LIVE"
        />}
      </div>

      <div style={{
        position: 'absolute', top: 340, left: 60, right: 60,
        opacity: eyebrowT,
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: 26, color: RED, letterSpacing: '0.18em',
      }}>// {eyebrow}</div>

      <div style={{
        position: 'absolute', top: 400, left: 60, right: 60,
        fontFamily: 'Anton, sans-serif',
        fontSize: 100, color: '#fff', lineHeight: 0.9,
        opacity: headlineT,
        transform: `translateY(${(1 - headlineT) * 16}px)`,
      }}>{headline}</div>

      {/* Stack of stats */}
      <div style={{
        position: 'absolute', top: 600, left: 60, right: 60,
        display: 'flex', flexDirection: 'column', gap: 14,
      }}>
        {stats.map((s, i) => {
          const op = statT(s.at);
          return (
            <div key={i} style={{
              display: 'flex', alignItems: 'baseline', gap: 24,
              padding: '20px 24px',
              background: 'rgba(31,34,39,0.85)',
              borderLeft: `4px solid ${RED}`,
              opacity: op,
              transform: `translateX(${(1 - op) * -28}px)`,
            }}>
              <div style={{
                fontFamily: 'Anton, sans-serif',
                fontSize: 120, color: '#fff', lineHeight: 0.85,
                fontVariantNumeric: 'tabular-nums',
                width: 220, flexShrink: 0,
              }}>{s.v}<span style={{ fontSize: 56, color: '#969ca7', marginLeft: 6 }}>{s.u}</span></div>
              <div style={{
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: 22, color: '#fff', letterSpacing: '0.08em',
              }}>{s.l}</div>
            </div>
          );
        })}
      </div>

      <div style={{
        position: 'absolute', bottom: 90, left: 60, right: 60,
        padding: '22px 28px',
        background: RED,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        opacity: ctaT,
        transform: `translateY(${(1 - ctaT) * 16}px)`,
      }}>
        <div style={{ fontFamily: 'Anton, sans-serif', fontSize: 44, color: '#fff' }}>{ctaText}</div>
        <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 16, color: '#fff', letterSpacing: '0.1em' }}>ATHLETESACCEL.COM</div>
      </div>
    </div>
  );
}

window.VoiceoverStackReel = VoiceoverStackReel;

const VOICEOVER_STACK_SPEC = {
  id: 'voiceover-stack',
  name: 'VOICEOVER STAT STACK',
  fields: [
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
    "label": "Eyebrow tag",
    "type": "text",
    "default": "BY THE NUMBERS"
  },
  {
    "key": "headline",
    "label": "Headline",
    "type": "text",
    "default": "THIS IS WHAT WORKS."
  },
  {
    "key": "stat1Value",
    "label": "Stat 1 value",
    "type": "text",
    "default": "90"
  },
  {
    "key": "stat1Unit",
    "label": "Stat 1 unit",
    "type": "text",
    "default": "DAYS"
  },
  {
    "key": "stat1Label",
    "label": "Stat 1 label",
    "type": "text",
    "default": "TO MEASURABLE CHANGE"
  },
  {
    "key": "stat2Value",
    "label": "Stat 2 value",
    "type": "text",
    "default": "4×"
  },
  {
    "key": "stat2Unit",
    "label": "Stat 2 unit",
    "type": "text",
    "default": "PER WEEK"
  },
  {
    "key": "stat2Label",
    "label": "Stat 2 label",
    "type": "text",
    "default": "STRUCTURED SESSIONS"
  },
  {
    "key": "stat3Value",
    "label": "Stat 3 value",
    "type": "text",
    "default": "+1"
  },
  {
    "key": "stat3Unit",
    "label": "Stat 3 unit",
    "type": "text",
    "default": "MPH"
  },
  {
    "key": "stat3Label",
    "label": "Stat 3 label",
    "type": "text",
    "default": "AVERAGE SPEED GAIN"
  },
  {
    "key": "stat4Value",
    "label": "Stat 4 value",
    "type": "text",
    "default": "0"
  },
  {
    "key": "stat4Unit",
    "label": "Stat 4 unit",
    "type": "text",
    "default": "EXCUSES"
  },
  {
    "key": "stat4Label",
    "label": "Stat 4 label",
    "type": "text",
    "default": "WE TRACK EVERYTHING"
  },
  {
    "key": "ctaText",
    "label": "CTA text",
    "type": "text",
    "default": "BOOK YOUR ASSESSMENT"
  }
],
};
window.VOICEOVER_STACK_SPEC = VOICEOVER_STACK_SPEC;
