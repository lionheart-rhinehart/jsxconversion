export default function Chrome() {
  return (
    <div style={{ width: 1080, height: 1920, position: "relative", overflow: "hidden", background: "#00ff00" }}>
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "52%", background: "#00ff00" }} />
      <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: "48%", background: "#c4141d", display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 44px" }}>
        <div style={{ fontFamily: "Anton, sans-serif", color: "#fff", fontSize: 86, lineHeight: 0.95, textTransform: "uppercase" }}>Speed is coachable</div>
        <div style={{ width: 80, height: 6, background: "#fff", margin: "28px 0" }} />
        <div style={{ fontFamily: "Geist, sans-serif", color: "#fff", fontSize: 38, fontWeight: 700 }}>Coach Graham Wilkerson</div>
        <div style={{ fontFamily: '"JetBrains Mono", monospace', color: "#ffd2d4", fontSize: 26, letterSpacing: "0.04em", marginTop: 4 }}>DIRECTOR OF PERFORMANCE</div>
      </div>
    </div>
  );
}
