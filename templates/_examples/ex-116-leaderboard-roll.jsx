// LeaderRowsLight — generated VIDEO example (self-contained Stage; fallback runtime).
const VW = 1080, VH = 1920;
function LeaderRowsLight() {
  const t = useTime();
  const ce = (start, dur = 0.5) => Easing.easeOutCubic(clamp((t - start) / dur, 0, 1));
  const eb = ce(0.1, 0.3);
  const board = [["1", "Maya R.", 0.95], ["2", "Jordan P.", 0.82], ["3", "Eli T.", 0.74], ["4", "Sam K.", 0.66], ["5", "Avery L.", 0.58]];
  const rows = board.map((b, i) => {
    const g = ce(0.5 + i * 0.22, 0.4);
    return <div key={i} style={{ display: "flex", alignItems: "center", gap: 26, marginBottom: 24, opacity: g, transform: "translateX(" + ((1 - g) * -40) + "px)" }}>
      <div style={{ width: 96, fontFamily: "Anton, sans-serif", color: i === 0 ? "#c4141d" : "#16161b", fontSize: 92 }}>{b[0]}</div>
      <div style={{ width: 300, fontFamily: "Geist, sans-serif", fontWeight: 700, fontSize: 46, color: "#16161b" }}>{b[1]}</div>
      <div style={{ flex: 1, height: 44, background: "#e7e3dd", borderRadius: 8, overflow: "hidden" }}><div style={{ width: (b[2] * g * 100) + "%", height: "100%", background: i === 0 ? "#c4141d" : "#16161b" }} /></div>
    </div>;
  });
  const scene = (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 64px" }}>
      <div style={{ fontFamily: "Anton, sans-serif", color: "#16161b", fontSize: 90, textTransform: "uppercase", lineHeight: 0.92, marginBottom: 56, opacity: eb }}>This week's<br/><span style={{ color: "#c4141d" }}>top movers</span></div>
      {rows}
    </div>
  );
  return (
    <Stage width={VW} height={VH} duration={5} background="#f3f1ee">
      {scene}
    </Stage>
  );
}
window.LeaderRowsLight = LeaderRowsLight;
