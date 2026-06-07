// KineticSlamStack — generated VIDEO example (self-contained Stage; fallback runtime).
const VW = 1080, VH = 1920;
function KineticSlamStack() {
  const t = useTime();
  const ce = (start, dur = 0.5) => Easing.easeOutCubic(clamp((t - start) / dur, 0, 1));
  const slam = (s) => { const p = Easing.easeOutBack(clamp((t - s) / 0.4, 0, 1)); return { opacity: clamp((t - s) / 0.2, 0, 1), transform: "scale(" + (0.6 + 0.4 * p) + ")" }; };
  const scene = (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 40px" }}>
      <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 38, letterSpacing: "0.1em", color: "#fff", marginBottom: 18, ...slam(0.2) }}>NO</div>
      <div style={{ fontFamily: "Anton, sans-serif", fontSize: 360, lineHeight: 0.8, textTransform: "uppercase", color: "#fff", letterSpacing: "-0.02em", transformOrigin: "left center", ...slam(0.6) }}>OFF<br/>DAYS</div>
      <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 36, letterSpacing: "0.1em", color: "#fff", marginTop: 26, ...slam(1.3) }}>SUMMER PERFORMANCE PROGRAM</div>
    </div>
  );
  return (
    <Stage width={VW} height={VH} duration={4} background="#c4141d">
      {scene}
    </Stage>
  );
}
window.KineticSlamStack = KineticSlamStack;
