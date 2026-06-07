// MetricBarBuild — generated VIDEO example (self-contained Stage; fallback runtime).
const VW = 1080, VH = 1920;
function MetricBarBuild() {
  const t = useTime();
  const ce = (start, dur = 0.5) => Easing.easeOutCubic(clamp((t - start) / dur, 0, 1));
  const heads = [320, 470, 610, 770, 980];
  const eb = ce(0.1, 0.3);
  const bars = heads.map((hh, i) => {
    const g = ce(0.5 + i * 0.18, 0.5);
    const bh = hh * g;
    return <rect key={i} x={110 + i * 170} y={1280 - bh} width="120" height={bh} rx="8" fill={i === heads.length - 1 ? "#c4141d" : "#2a2a32"} />;
  });
  const scene = (
    <div style={{ position: "absolute", inset: 0 }}>
      <div style={{ position: "absolute", left: 64, top: 150, right: 64, opacity: eb }}>
        <div style={{ fontFamily: "Anton, sans-serif", color: "#111", fontSize: 78, textTransform: "uppercase", lineHeight: 0.95 }}>Speed gains<br/>by week</div>
        <div style={{ fontFamily: "Geist, sans-serif", color: "#666", fontSize: 34, marginTop: 12 }}>Measured every 2 weeks</div>
      </div>
      <svg viewBox="0 0 1080 1320" style={{ position: "absolute", left: 0, bottom: 120, width: "100%" }}>
        <line x1="90" y1="1280" x2="990" y2="1280" stroke="#ccc" strokeWidth="4" />
        {bars}
      </svg>
      <div style={{ position: "absolute", left: 64, bottom: 60, fontFamily: '"JetBrains Mono", monospace', color: "#c4141d", fontSize: 30, letterSpacing: "0.08em" }}>WEEK 1 → WEEK 10</div>
    </div>
  );
  return (
    <Stage width={VW} height={VH} duration={4} background="#f4f4f2">
      {scene}
    </Stage>
  );
}
window.MetricBarBuild = MetricBarBuild;
