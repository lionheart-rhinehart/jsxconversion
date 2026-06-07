// KineticWordReveal — generated VIDEO example (self-contained Stage; fallback runtime).
const VW = 1080, VH = 1920;
function KineticWordReveal() {
  const t = useTime();
  const ce = (start, dur = 0.5) => Easing.easeOutCubic(clamp((t - start) / dur, 0, 1));
  const a = ce(0.2, 0.35), b = ce(0.7, 0.35), c = ce(1.2, 0.35);
  const line = (op) => ({ fontFamily: "Anton, sans-serif", fontSize: 200, lineHeight: 0.9, textTransform: "uppercase", opacity: op, transform: "translateY(" + ((1 - op) * 26) + "px)" });
  const scene = (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 56px" }}>
      <div style={{ ...line(a), color: "#fff" }}>TRAIN</div>
      <div style={{ ...line(b), color: "#0a0a0a", background: "#c4141d", display: "inline-block", padding: "0 18px", width: "fit-content" }}>LIKE IT</div>
      <div style={{ ...line(c), color: "#fff" }}>MATTERS</div>
    </div>
  );
  return (
    <Stage width={VW} height={VH} duration={4} background="#111">
      {scene}
    </Stage>
  );
}
window.KineticWordReveal = KineticWordReveal;
