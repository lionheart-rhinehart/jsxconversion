// MetricCounterBar — generated VIDEO example (self-contained Stage; fallback runtime).
const VW = 1080, VH = 1920;
function MetricCounterBar() {
  const t = useTime();
  const ce = (start, dur = 0.5) => Easing.easeOutCubic(clamp((t - start) / dur, 0, 1));
  const eb = ce(0.1, 0.3);
  const p = ce(0.6, 1.2);
  const val = Math.round(92 * p);
  const sub = ce(2.0, 0.5);
  const scene = (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 80px" }}>
      <div style={{ fontFamily: '"JetBrains Mono", monospace', color: "#c4141d", fontSize: 34, letterSpacing: "0.14em", fontWeight: 700, marginBottom: 6, opacity: eb }}>VERTICAL JUMP</div>
      <div style={{ fontFamily: "Anton, sans-serif", color: "#fff", fontSize: 400, lineHeight: 0.82 }}>{val}<span style={{ color: "#c4141d", fontSize: 170 }}>%</span></div>
      <div style={{ width: "100%", maxWidth: 760, height: 18, borderRadius: 9, background: "#22222a", marginTop: 24, overflow: "hidden" }}>
        <div style={{ width: (p * 100) + "%", height: "100%", background: "#c4141d" }} />
      </div>
      <div style={{ fontFamily: "Geist, sans-serif", color: "#bdbdbd", fontSize: 40, fontWeight: 600, marginTop: 22, opacity: sub }}>improved in 90 days</div>
    </div>
  );
  return (
    <Stage width={VW} height={VH} duration={4} background="#0a0b0d">
      {scene}
    </Stage>
  );
}
window.MetricCounterBar = MetricCounterBar;
