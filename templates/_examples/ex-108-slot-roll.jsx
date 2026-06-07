// SlotReelsLight — generated VIDEO example (self-contained Stage; fallback runtime).
const VW = 1080, VH = 1920;
function SlotReelsLight() {
  const t = useTime();
  const ce = (start, dur = 0.5) => Easing.easeOutCubic(clamp((t - start) / dur, 0, 1));
  const eb = ce(0.1, 0.3);
  const FACE = ["SPEED", "JUMP", "AGILITY", "POWER", "CORE", "SPRINT"];
  const reel = (x, stopT, finalIdx) => {
    const settled = clamp((t - stopT) / 0.4, 0, 1);
    const spin = clamp((stopT + 0.4 - t) / stopT, 0, 1);
    const idx = settled >= 1 ? finalIdx : Math.floor((t * 22) % FACE.length);
    return <div key={x} style={{ flex: 1, height: 220, borderRadius: 16, background: "#fff", border: "4px solid " + (settled >= 1 ? "#c4141d" : "#dad7d1"), display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
      <div style={{ fontFamily: "Anton, sans-serif", fontSize: 64, textTransform: "uppercase", color: settled >= 1 ? "#c4141d" : "#16161b", transform: "translateY(" + (spin * -18) + "px)", opacity: 0.5 + 0.5 * (1 - spin) }}>{FACE[idx]}</div>
    </div>;
  };
  const scene = (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 60px" }}>
      <div style={{ fontFamily: "Anton, sans-serif", color: "#16161b", fontSize: 96, textTransform: "uppercase", lineHeight: 0.92, marginBottom: 50, opacity: eb }}>Spin your<br/><span style={{ color: "#c4141d" }}>focus block</span></div>
      <div style={{ display: "flex", gap: 22 }}>{reel(0, 1.2, 0)}{reel(1, 1.8, 5)}{reel(2, 2.4, 3)}</div>
      <div style={{ fontFamily: '"JetBrains Mono", monospace', color: "#777", fontSize: 32, letterSpacing: "0.08em", marginTop: 40, opacity: ce(2.8, 0.4) }}>TODAY: SPEED · SPRINT · POWER</div>
    </div>
  );
  return (
    <Stage width={VW} height={VH} duration={5} background="#f3f1ee">
      {scene}
    </Stage>
  );
}
window.SlotReelsLight = SlotReelsLight;
