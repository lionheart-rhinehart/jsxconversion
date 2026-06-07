// CountUpHeroLight — generated VIDEO example (self-contained Stage; fallback runtime).
const VW = 1080, VH = 1920;
function CountUpHeroLight() {
  const t = useTime();
  const ce = (start, dur = 0.5) => Easing.easeOutCubic(clamp((t - start) / dur, 0, 1));
  const eb = ce(0.1, 0.3);
  const p = ce(0.5, 1.6);
  const val = Math.round(430 * p);
  const uw = ce(0.6, 1.3);
  const head = ce(2.0, 0.45);
  const scene = (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 70px" }}>
      <div style={{ fontFamily: '"JetBrains Mono", monospace', color: "#c4141d", fontSize: 36, letterSpacing: "0.16em", fontWeight: 700, opacity: eb, marginBottom: 8 }}>ATHLETES TRAINED</div>
      <div style={{ fontFamily: "Anton, sans-serif", color: "#16161b", fontSize: 460, lineHeight: 0.8 }}><span style={{ color: "#c4141d" }}>+</span>{val}</div>
      <div style={{ width: 540, height: 12, background: "#dcd9d3", marginTop: 22, overflow: "hidden" }}><div style={{ width: (uw * 100) + "%", height: "100%", background: "#c4141d" }} /></div>
      <div style={{ fontFamily: "Geist, sans-serif", color: "#444", fontSize: 46, fontWeight: 600, marginTop: 30, opacity: head }}>and counting, since 2014</div>
    </div>
  );
  return (
    <Stage width={VW} height={VH} duration={5} background="#f3f1ee">
      {scene}
    </Stage>
  );
}
window.CountUpHeroLight = CountUpHeroLight;
