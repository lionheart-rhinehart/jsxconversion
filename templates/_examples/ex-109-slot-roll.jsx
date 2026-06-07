// SlotSingleDark — generated VIDEO example (self-contained Stage; fallback runtime).
const VW = 1080, VH = 1920;
function SlotSingleDark() {
  const t = useTime();
  const ce = (start, dur = 0.5) => Easing.easeOutCubic(clamp((t - start) / dur, 0, 1));
  const eb = ce(0.1, 0.3);
  const FACE = ["BROAD JUMP", "SLED PUSH", "MED BALL", "HURDLE HOPS", "SPRINT 20", "LATERAL"];
  const prog = Easing.easeOutExpo(ce(0.5, 2.0));
  const offset = (1 - prog) * 1800;
  const lock = ce(2.4, 0.4);
  const items = FACE.map((f, i) => <div key={i} style={{ height: 150, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Anton, sans-serif", fontSize: 80, textTransform: "uppercase", color: (i === 4 && lock > 0.5) ? "#c4141d" : "#fff" }}>{f}</div>);
  const scene = (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "0 60px" }}>
      <div style={{ fontFamily: '"JetBrains Mono", monospace', color: "#c4141d", fontSize: 34, letterSpacing: "0.14em", fontWeight: 700, opacity: eb, marginBottom: 26 }}>TODAY'S DRILL</div>
      <div style={{ position: "relative", width: 760, height: 220, overflow: "hidden", borderTop: "4px solid #c4141d", borderBottom: "4px solid #c4141d" }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 35, transform: "translateY(" + (-offset % 900) + "px)" }}>{items}{items}</div>
      </div>
      <div style={{ fontFamily: "Geist, sans-serif", color: "#cfcfcf", fontSize: 42, fontWeight: 600, marginTop: 44, opacity: lock }}>The board picks. You just go.</div>
    </div>
  );
  return (
    <Stage width={VW} height={VH} duration={5} background="#0c0c11">
      {scene}
    </Stage>
  );
}
window.SlotSingleDark = SlotSingleDark;
