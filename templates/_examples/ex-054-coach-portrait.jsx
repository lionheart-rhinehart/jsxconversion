export default function Chrome() {
  return (
    <div style={{ width: 1080, height: 1920, position: "relative", overflow: "hidden", background: "#00ff00" }}>
      <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: "54%", background: "#00ff00" }} />
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "46%", background: "#16161b", display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 44px" }}>
        <div style={{ fontFamily: '"JetBrains Mono", monospace', color: "#c4141d", fontSize: 26, letterSpacing: "0.08em", marginBottom: 20 }}>MEET YOUR COACH</div>
        <div style={{ fontFamily: "Anton, sans-serif", color: "#fff", fontSize: 84, lineHeight: 0.94, textTransform: "uppercase" }}>20 years on the floor</div>
        <div style={{ width: 80, height: 6, background: "#c4141d", margin: "28px 0" }} />
        <div style={{ fontFamily: "Geist, sans-serif", color: "#fff", fontSize: 36, fontWeight: 700 }}>Coach Devon Hayes</div>
        <div style={{ fontFamily: '"JetBrains Mono", monospace', color: "#9a9aa3", fontSize: 24, marginTop: 4 }}>HEAD OF STRENGTH</div>
      </div>
    </div>
  );
}
