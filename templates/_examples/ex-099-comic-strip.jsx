// ComicGridDark — generated VIDEO example (self-contained Stage; fallback runtime).
const VW = 1080, VH = 1920;
function ComicGridDark() {
  const t = useTime();
  const ce = (start, dur = 0.5) => Easing.easeOutCubic(clamp((t - start) / dur, 0, 1));
  const eb = ce(0.1, 0.3);
  const cells = [["#c4141d", "POW!"], ["#f2c14e", "ZOOM"], ["#3a86a8", "BAM!"], ["#16161b", "WIN"]];
  const grid = cells.map((c, i) => {
    const g = Easing.easeOutBack(clamp((t - (0.5 + i * 0.3)) / 0.5, 0, 1));
    return <div key={i} style={{ background: c[0], border: "6px solid #fff", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", opacity: clamp(g, 0, 1), transform: "scale(" + (0.8 + 0.2 * g) + ")" }}>
      <div style={{ fontFamily: "Anton, sans-serif", color: "#fff", fontSize: 96, textTransform: "uppercase", transform: "rotate(-6deg)" }}>{c[1]}</div>
    </div>;
  });
  const scene = (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", padding: "96px 64px", boxSizing: "border-box" }}>
      <div style={{ fontFamily: "Anton, sans-serif", color: "#fff", fontSize: 92, textTransform: "uppercase", lineHeight: 0.9, marginBottom: 40, opacity: eb }}>Every rep<br/>is a panel</div>
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr 1fr", gap: 22 }}>{grid}</div>
    </div>
  );
  return (
    <Stage width={VW} height={VH} duration={5} background="#0c0c11">
      {scene}
    </Stage>
  );
}
window.ComicGridDark = ComicGridDark;
