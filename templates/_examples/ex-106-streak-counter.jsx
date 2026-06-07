// StreakCellsLight — generated VIDEO example (self-contained Stage; fallback runtime).
const VW = 1080, VH = 1920;
function StreakCellsLight() {
  const t = useTime();
  const ce = (start, dur = 0.5) => Easing.easeOutCubic(clamp((t - start) / dur, 0, 1));
  const eb = ce(0.1, 0.3);
  const N = 24;
  const lit = Math.round(N * ce(0.5, 1.7));
  const val = Math.round(24 * ce(0.6, 1.6));
  const head = ce(2.2, 0.45);
  const cells = Array.from({ length: N }, (_, i) => <div key={i} style={{ width: 64, height: 64, borderRadius: 12, background: i < lit ? "#c4141d" : "#dcd9d3" }} />);
  const scene = (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 80px" }}>
      <div style={{ fontFamily: '"JetBrains Mono", monospace', color: "#c4141d", fontSize: 34, letterSpacing: "0.14em", fontWeight: 700, opacity: eb, marginBottom: 6 }}>SESSION STREAK</div>
      <div style={{ fontFamily: "Anton, sans-serif", color: "#16161b", fontSize: 340, lineHeight: 0.82 }}>{val}<span style={{ fontSize: 100, color: "#c4141d" }}> DAYS</span></div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginTop: 36, maxWidth: 920 }}>{cells}</div>
      <div style={{ fontFamily: "Geist, sans-serif", color: "#444", fontSize: 44, fontWeight: 600, marginTop: 40, opacity: head }}>Show up. Stack the days. Get faster.</div>
    </div>
  );
  return (
    <Stage width={VW} height={VH} duration={5} background="#f3f1ee">
      {scene}
    </Stage>
  );
}
window.StreakCellsLight = StreakCellsLight;
