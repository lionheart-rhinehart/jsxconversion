export default function Chrome() {
  return (
    <div style={{ width: 1080, height: 1920, position: "relative", overflow: "hidden", background: "#f4f4f2" }}>
      <div style={{ position: "absolute", left: 56, top: 80, width: 968, height: 1040, borderRadius: 28, background: "#00ff00" }} />
      <div style={{ position: "absolute", left: 56, right: 56, top: 1200 }}>
        <div style={{ width: 96, height: 8, background: "#c4141d", marginBottom: 24 }} />
        <div style={{ fontFamily: "Anton, sans-serif", color: "#111", fontSize: 118, lineHeight: 0.92, textTransform: "uppercase" }}>Where Carmel<br/>trains all winter</div>
        <div style={{ fontFamily: '"JetBrains Mono", monospace', color: "#666", fontSize: 30, marginTop: 22, letterSpacing: "0.04em" }}>ATHLETES ACCELERATION · CARMEL, IN</div>
      </div>
    </div>
  );
}
