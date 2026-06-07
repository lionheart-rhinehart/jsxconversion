// LeaderPodiumDark — generated VIDEO example (self-contained Stage; fallback runtime).
const VW = 1080, VH = 1920;
function LeaderPodiumDark() {
  const t = useTime();
  const ce = (start, dur = 0.5) => Easing.easeOutCubic(clamp((t - start) / dur, 0, 1));
  const eb = ce(0.1, 0.3);
  const podium = [["2", "Jordan", 0.72, "#9aa0a6"], ["1", "Maya", 1.0, "#c4141d"], ["3", "Eli", 0.56, "#b07a3a"]];
  const bars = podium.map((p, i) => {
    const g = ce(0.5 + i * 0.2, 0.5);
    const h = 200 + p[2] * 640 * g;
    return <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end", alignItems: "center" }}>
      <div style={{ fontFamily: "Geist, sans-serif", color: "#fff", fontWeight: 700, fontSize: 42, marginBottom: 16, opacity: g }}>{p[1]}</div>
      <div style={{ width: "82%", height: h, background: p[3], borderRadius: "14px 14px 0 0", display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: 26 }}>
        <div style={{ fontFamily: "Anton, sans-serif", color: "#fff", fontSize: 130 }}>{p[0]}</div>
      </div>
    </div>;
  });
  const scene = (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", padding: "130px 60px 0", boxSizing: "border-box" }}>
      <div style={{ fontFamily: "Anton, sans-serif", color: "#fff", fontSize: 92, textTransform: "uppercase", lineHeight: 0.92, marginBottom: 30, opacity: eb }}>Leaderboard<br/><span style={{ color: "#c4141d" }}>finals</span></div>
      <div style={{ flex: 1, display: "flex", gap: 24, alignItems: "flex-end" }}>{bars}</div>
    </div>
  );
  return (
    <Stage width={VW} height={VH} duration={5} background="#0a0b0d">
      {scene}
    </Stage>
  );
}
window.LeaderPodiumDark = LeaderPodiumDark;
