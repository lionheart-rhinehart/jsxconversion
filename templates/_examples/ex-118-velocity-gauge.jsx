// VeloMeterLight — generated VIDEO example (self-contained Stage; fallback runtime).
const VW = 1080, VH = 1920;
function VeloMeterLight() {
  const t = useTime();
  const ce = (start, dur = 0.5) => Easing.easeOutCubic(clamp((t - start) / dur, 0, 1));
  const eb = ce(0.1, 0.3);
  const N = 16, target = 0.78;
  const fill = ce(0.5, 1.5);
  const lit = Math.round(N * target * fill);
  const val = (0.93 * ce(0.6, 1.5)).toFixed(2);
  const head = ce(2.0, 0.45);
  const segs = Array.from({ length: N }, (_, i) => {
    const on = i < lit;
    const zone = i < N * 0.45 ? "#2f7d3a" : i < N * 0.72 ? "#caa12a" : "#c4141d";
    return <div key={i} style={{ flex: 1, borderRadius: 4, background: on ? zone : "#dcd9d3" }} />;
  });
  const scene = (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 84px" }}>
      <div style={{ fontFamily: '"JetBrains Mono", monospace', color: "#c4141d", fontSize: 34, letterSpacing: "0.14em", fontWeight: 700, opacity: eb, marginBottom: 16 }}>BAR SPEED · BACK SQUAT</div>
      <div style={{ fontFamily: "Anton, sans-serif", color: "#16161b", fontSize: 300, lineHeight: 0.82, opacity: eb }}>{val}<span style={{ fontSize: 96, color: "#c4141d" }}> M/S</span></div>
      <div style={{ display: "flex", gap: 8, height: 92, marginTop: 44 }}>{segs}</div>
      <div style={{ fontFamily: "Geist, sans-serif", color: "#444", fontSize: 42, fontWeight: 600, marginTop: 36, opacity: head }}>Fast bar speed means explosive power</div>
    </div>
  );
  return (
    <Stage width={VW} height={VH} duration={5} background="#f1efec">
      {scene}
    </Stage>
  );
}
window.VeloMeterLight = VeloMeterLight;
