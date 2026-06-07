// MacroTripleLight — generated VIDEO example (self-contained Stage; fallback runtime).
const VW = 1080, VH = 1920;
function MacroTripleLight() {
  const t = useTime();
  const ce = (start, dur = 0.5) => Easing.easeOutCubic(clamp((t - start) / dur, 0, 1));
  const eb = ce(0.1, 0.3);
  const sweep = ce(0.5, 1.7);
  const rings = [[300, "#c4141d", 0.82], [232, "#e0a526", 0.66], [164, "#3a7d44", 0.9]];
  const head = ce(2.2, 0.45);
  const scene = (
    <div style={{ position: "absolute", inset: 0 }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 170, textAlign: "center", fontFamily: '"JetBrains Mono", monospace', color: "#c4141d", fontSize: 34, letterSpacing: "0.14em", fontWeight: 700, opacity: eb }}>FUEL THE WORK</div>
      <svg viewBox="0 0 800 800" style={{ position: "absolute", left: "50%", top: 470, width: 740, transform: "translateX(-50%)" }}>
        {rings.map((r, i) => { const C = 2 * Math.PI * r[0]; return <g key={i}><circle cx="400" cy="400" r={r[0]} stroke="#e4e1db" strokeWidth="34" fill="none" /><circle cx="400" cy="400" r={r[0]} stroke={r[1]} strokeWidth="34" fill="none" strokeLinecap="round" strokeDasharray={(C * r[2] * sweep).toFixed(1) + " " + C.toFixed(1)} transform="rotate(-90 400 400)" /></g>; })}
        <text x="400" y="380" textAnchor="middle" fontFamily="Anton, sans-serif" fontSize="120" fill="#16161b">{Math.round(2100 * sweep)}</text>
        <text x="400" y="460" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="34" fontWeight="700" fill="#777">KCAL / DAY</text>
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1330, textAlign: "center", fontFamily: "Anton, sans-serif", color: "#16161b", fontSize: 76, textTransform: "uppercase", opacity: head }}>Eat to perform</div>
    </div>
  );
  return (
    <Stage width={VW} height={VH} duration={5} background="#f3f1ee">
      {scene}
    </Stage>
  );
}
window.MacroTripleLight = MacroTripleLight;
