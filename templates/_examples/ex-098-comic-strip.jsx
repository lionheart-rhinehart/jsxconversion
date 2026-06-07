// ComicStripLight — generated VIDEO example (self-contained Stage; fallback runtime).
const VW = 1080, VH = 1920;
function ComicStripLight() {
  const t = useTime();
  const ce = (start, dur = 0.5) => Easing.easeOutCubic(clamp((t - start) / dur, 0, 1));
  const eb = ce(0.1, 0.3);
  const panels = [["#f2c14e", "DAY 1", "Can't touch the rim"], ["#e07a5f", "WEEK 6", "Fingertips on net"], ["#c4141d", "DAY 90", "First dunk"]];
  const rows = panels.map((p, i) => {
    const g = Easing.easeOutBack(clamp((t - (0.5 + i * 0.45)) / 0.5, 0, 1));
    return <div key={i} style={{ flex: 1, margin: "0 0 18px", borderRadius: 14, background: p[0], border: "6px solid #0a0b0d", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: 30, boxSizing: "border-box", opacity: clamp(g, 0, 1), transform: "scale(" + (0.86 + 0.14 * g) + ")" }}>
      <div style={{ fontFamily: '"JetBrains Mono", monospace', color: "#0a0b0d", fontSize: 28, fontWeight: 700, letterSpacing: "0.08em" }}>{p[1]}</div>
      <div style={{ fontFamily: "Anton, sans-serif", color: "#0a0b0d", fontSize: 64, textTransform: "uppercase", lineHeight: 0.94 }}>{p[2]}</div>
    </div>;
  });
  const scene = (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", padding: "84px 60px 64px", boxSizing: "border-box" }}>
      <div style={{ fontFamily: "Anton, sans-serif", color: "#fff", fontSize: 84, textTransform: "uppercase", lineHeight: 0.92, marginBottom: 26, opacity: eb }}>The 90-day<br/><span style={{ color: "#f2c14e" }}>glow-up</span></div>
      {rows}
    </div>
  );
  return (
    <Stage width={VW} height={VH} duration={5} background="#1c1c22">
      {scene}
    </Stage>
  );
}
window.ComicStripLight = ComicStripLight;
