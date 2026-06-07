// ListStepsReveal — generated VIDEO example (self-contained Stage; fallback runtime).
const VW = 1080, VH = 1920;
function ListStepsReveal() {
  const t = useTime();
  const ce = (start, dur = 0.5) => Easing.easeOutCubic(clamp((t - start) / dur, 0, 1));
  const steps = ["Test the athlete first", "Build the right strength base", "Re-test and prove the gain"];
  const eb = ce(0.1, 0.3);
  const rows = steps.map((s, i) => {
    const g = ce(0.6 + i * 0.45, 0.4);
    return <div key={i} style={{ display: "flex", alignItems: "center", gap: 28, marginBottom: 40, borderBottom: "1px solid #23232b", paddingBottom: 28, opacity: g, transform: "translateX(" + ((1 - g) * -30) + "px)" }}>
      <div style={{ fontFamily: "Anton, sans-serif", color: "#c4141d", fontSize: 140, lineHeight: 0.9, width: 120 }}>{i + 1}</div>
      <div style={{ fontFamily: "Geist, sans-serif", color: "#fff", fontSize: 46, fontWeight: 600 }}>{s}</div>
    </div>;
  });
  const scene = (
    <div style={{ position: "absolute", inset: 0, padding: "120px 72px", boxSizing: "border-box" }}>
      <div style={{ fontFamily: "Anton, sans-serif", color: "#fff", fontSize: 92, textTransform: "uppercase", lineHeight: 0.95, marginBottom: 64, opacity: eb }}>3 steps to a<br/><span style={{ color: "#c4141d" }}>faster season</span></div>
      {rows}
    </div>
  );
  return (
    <Stage width={VW} height={VH} duration={4} background="#101015">
      {scene}
    </Stage>
  );
}
window.ListStepsReveal = ListStepsReveal;
