export default function Chrome() {
  return (
    <div style={{ width: 1080, height: 1920, position: "relative", overflow: "hidden", background: "#00ff00" }}>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 600, background: "#c4141d", display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 56px", boxSizing: "border-box" }}>
        <div style={{ fontFamily: '"JetBrains Mono", monospace', color: "#ffd2d4", fontSize: 30, letterSpacing: "0.1em", fontWeight: 700, marginBottom: 18 }}>AGES 8–18 · IN + OH</div>
        <div style={{ fontFamily: "Anton, sans-serif", color: "#fff", fontSize: 160, lineHeight: 0.88, textTransform: "uppercase" }}>Earn the<br/>starting spot</div>
      </div>
    </div>
  );
}
