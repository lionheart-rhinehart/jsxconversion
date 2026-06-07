// StopwatchDigitalDark — generated VIDEO example (self-contained Stage; fallback runtime).
const VW = 1080, VH = 1920;
function StopwatchDigitalDark() {
  const t = useTime();
  const ce = (start, dur = 0.5) => Easing.easeOutCubic(clamp((t - start) / dur, 0, 1));
  const eb = ce(0.1, 0.3);
  const p = ce(0.5, 2.2);
  const total = 45 - Math.round(45 * p);
  const mm = Math.floor(total / 60).toString().padStart(2, "0");
  const ss = (total % 60).toString().padStart(2, "0");
  const ticks = Array.from({ length: 30 }, (_, i) => <div key={i} style={{ flex: 1, height: i % 5 === 0 ? 56 : 36, background: (i / 30) < (1 - p) ? "#c4141d" : "#23232b" }} />);
  const head = ce(2.4, 0.45);
  const scene = (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 70px" }}>
      <div style={{ fontFamily: '"JetBrains Mono", monospace', color: "#c4141d", fontSize: 36, letterSpacing: "0.16em", fontWeight: 700, opacity: eb, marginBottom: 20, textAlign: "center" }}>WORK INTERVAL</div>
      <div style={{ fontFamily: "JetBrains Mono, monospace", color: "#fff", fontWeight: 800, fontSize: 340, lineHeight: 0.9, textAlign: "center", letterSpacing: "0.02em" }}>{mm}:{ss}</div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 64, marginTop: 50 }}>{ticks}</div>
      <div style={{ fontFamily: "Geist, sans-serif", color: "#cfcfcf", fontSize: 42, fontWeight: 600, marginTop: 44, textAlign: "center", opacity: head }}>Beat the clock, earn the rest</div>
    </div>
  );
  return (
    <Stage width={VW} height={VH} duration={5} background="#0a0b0d">
      {scene}
    </Stage>
  );
}
window.StopwatchDigitalDark = StopwatchDigitalDark;
