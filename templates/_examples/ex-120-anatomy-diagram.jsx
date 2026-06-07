// AnatomyCalloutsLight — generated VIDEO example (self-contained Stage; fallback runtime).
const VW = 1080, VH = 1920;
function AnatomyCalloutsLight() {
  const t = useTime();
  const ce = (start, dur = 0.5) => Easing.easeOutCubic(clamp((t - start) / dur, 0, 1));
  const eb = ce(0.1, 0.3);
  const fig = ce(0.4, 0.5);
  const c1 = ce(1.1, 0.4), c2 = ce(1.6, 0.4), c3 = ce(2.1, 0.4);
  const tag = (x, y, lit, label) => <div style={{ position: "absolute", left: x, top: y, fontFamily: '"JetBrains Mono", monospace', fontSize: 30, fontWeight: 700, letterSpacing: "0.06em", color: "#16161b", opacity: lit, transform: "translateX(" + ((1 - lit) * 14) + "px)" }}>{label}</div>;
  const scene = (
    <div style={{ position: "absolute", inset: 0 }}>
      <div style={{ position: "absolute", left: 64, top: 130, fontFamily: '"JetBrains Mono", monospace', color: "#c4141d", fontSize: 32, letterSpacing: "0.12em", fontWeight: 700, opacity: eb }}>WHAT MAKES YOU FAST</div>
      <div style={{ position: "absolute", left: 64, top: 176, fontFamily: "Anton, sans-serif", color: "#16161b", fontSize: 96, textTransform: "uppercase", lineHeight: 0.9, opacity: eb }}>The sprint<br/>engine</div>
      <svg viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: fig }}>
        <circle cx="540" cy="560" r="62" fill="#16161b" />
        <rect x="470" y="640" width="140" height="300" rx="40" fill="#16161b" />
        <rect x="406" y="660" width="56" height="250" rx="28" fill="#16161b" transform="rotate(8 434 660)" />
        <rect x="618" y="660" width="56" height="250" rx="28" fill="#16161b" transform="rotate(-8 646 660)" />
        <rect x="486" y="930" width="50" height="320" rx="25" fill="#16161b" />
        <rect x="544" y="930" width="50" height="320" rx="25" fill="#16161b" />
        <circle cx="540" cy="780" r="11" fill="#c4141d" opacity={c1} />
        <circle cx="512" cy="1010" r="11" fill="#c4141d" opacity={c2} />
        <circle cx="568" cy="1170" r="11" fill="#c4141d" opacity={c3} />
        <path d="M540 780 L760 780" stroke="#c4141d" strokeWidth="4" strokeDasharray="220" strokeDashoffset={220 * (1 - c1)} />
        <path d="M512 1010 L300 1010" stroke="#c4141d" strokeWidth="4" strokeDasharray="212" strokeDashoffset={212 * (1 - c2)} />
        <path d="M568 1170 L788 1170" stroke="#c4141d" strokeWidth="4" strokeDasharray="220" strokeDashoffset={220 * (1 - c3)} />
      </svg>
      {tag(772, 764, c1, "CORE")}
      {tag(150, 994, c2, "GLUTES")}
      {tag(800, 1154, c3, "HAMSTRINGS")}
    </div>
  );
  return (
    <Stage width={VW} height={VH} duration={5} background="#eef0f2">
      {scene}
    </Stage>
  );
}
window.AnatomyCalloutsLight = AnatomyCalloutsLight;
