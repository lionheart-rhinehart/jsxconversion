// AUDIO WAVEFORM — Equalizer bars bouncing like a sound wave
// Pseudo-randomized bar heights driven by sine waves. Props: barCount,
// color, label, frequency (animation speed multiplier).

function AudioWaveform({
  barCount = 32,
  color = (window.__BRAND__ && window.__BRAND__.brand_red || '#c4141d'),
  label = '// VOICEOVER',
  frequency = 1.0,
}) {
  const t = window.useTime ? window.useTime() : 0;
  const RED = color;

  // Per-bar height driven by stacked sines for organic feel
  const heights = [];
  for (let i = 0; i < barCount; i++) {
    const phase = i * 0.42;
    const v =
      0.5 + 0.32 * Math.sin(t * 5.2 * frequency + phase) +
      0.15 * Math.sin(t * 11.7 * frequency + phase * 1.7) +
      0.05 * Math.sin(t * 23.1 * frequency + phase * 0.5);
    heights.push(Math.max(0.05, Math.min(1, v)));
  }

  return (
    <div style={{
      width: '100%', height: '100%',
      padding: '5%',
      boxSizing: 'border-box',
      display: 'flex', flexDirection: 'column',
      fontFamily: '"JetBrains Mono", monospace', color: '#fff',
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
        marginBottom: '4%',
      }}>
        <div style={{
          fontSize: 'clamp(11px, 1.5vw, 14px)',
          color: RED, letterSpacing: '0.16em',
        }}>{label}</div>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          fontSize: 'clamp(10px, 1.2vw, 12px)',
          color: '#969ca7', letterSpacing: '0.14em',
        }}>
          <span style={{
            display: 'inline-block',
            width: 8, height: 8,
            borderRadius: '50%',
            background: RED,
            boxShadow: `0 0 8px ${RED}`,
            animation: 'pulse 1.2s ease-in-out infinite',
          }}/>
          LIVE
        </div>
      </div>

      <div style={{
        flex: 1,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 'clamp(2px, 0.4vw, 4px)',
      }}>
        {heights.map((h, i) => (
          <div key={i} style={{
            flex: 1,
            height: `${h * 100}%`,
            background: `linear-gradient(180deg, ${RED} 0%, rgba(196,20,29,0.6) 50%, ${RED} 100%)`,
            borderRadius: 1,
            transition: 'height 60ms linear',
            boxShadow: h > 0.7 ? `0 0 8px ${RED}` : 'none',
          }}/>
        ))}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}

window.AudioWaveform = AudioWaveform;
window.AUDIO_WAVEFORM_META = {
  id: 'audio-waveform',
  name: 'AUDIO WAVEFORM',
  category: 'Cinematic',
  description: 'Equalizer bars bouncing like a live mic. Use behind voiceover content to signal "audio-first".',
  props: ['barCount', 'color', 'label', 'frequency'],
};
