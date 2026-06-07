// AnatomyMuscleDark — generated VIDEO example (self-contained Stage; fallback runtime).
const VW = 1080, VH = 1920;
function AnatomyMuscleDark() {
  const t = useTime();
  const ce = (start, dur = 0.5) => Easing.easeOutCubic(clamp((t - start) / dur, 0, 1));
  const eb = ce(0.1, 0.3);
  const fig = ce(0.4, 0.5);
  const pulse = 0.55 + 0.45 * (0.5 + 0.5 * Math.sin(t * 4));
  const lead = ce(1.2, 0.5);
  const head = ce(2.0, 0.45);
  const scene = (
    <div style={{ position: "absolute", inset: 0 }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 130, textAlign: "center", fontFamily: '"JetBrains Mono", monospace', color: "#c4141d", fontSize: 32, letterSpacing: "0.14em", fontWeight: 700, opacity: eb }}>POWER STARTS HERE</div>
      <svg viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: fig }}>
        <rect x="476" y="520" width="128" height="300" rx="40" fill="#1b1c22" />
        <rect x="492" y="800" width="44" height="360" rx="22" fill="#1b1c22" />
        <rect x="544" y="800" width="44" height="360" rx="22" fill="#1b1c22" />
        <ellipse cx="540" cy="840" rx="92" ry="120" fill="#c4141d" opacity={pulse * fig} />
        <path d="M620 840 L820 760" stroke="#c4141d" strokeWidth="4" strokeDasharray="216" strokeDashoffset={216 * (1 - lead)} />
        <circle cx="620" cy="840" r="11" fill="#c4141d" opacity={lead} />
      </svg>
      <div style={{ position: "absolute", left: 740, top: 700, fontFamily: "Anton, sans-serif", color: "#fff", fontSize: 88, textTransform: "uppercase", lineHeight: 0.86, opacity: lead }}>Glutes</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1240, textAlign: "center", fontFamily: "Geist, sans-serif", color: "#cfcfcf", fontSize: 44, fontWeight: 600, opacity: head, padding: "0 80px", boxSizing: "border-box" }}>The biggest sprint muscle most kids never train</div>
    </div>
  );
  return (
    <Stage width={VW} height={VH} duration={5} background="#0a0b0d">
      {scene}
    </Stage>
  );
}
window.AnatomyMuscleDark = AnatomyMuscleDark;
