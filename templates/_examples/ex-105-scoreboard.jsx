// ScoreboardLedDark — generated VIDEO example (self-contained Stage; fallback runtime).
const VW = 1080, VH = 1920;
function ScoreboardLedDark() {
  const t = useTime();
  const ce = (start, dur = 0.5) => Easing.easeOutCubic(clamp((t - start) / dur, 0, 1));
  const eb = ce(0.1, 0.3);
  const v = Math.round(112 * ce(0.6, 1.6));
  const head = ce(2.2, 0.45);
  const scene = (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 60px" }}>
      <div style={{ fontFamily: '"JetBrains Mono", monospace', color: "#c4141d", fontSize: 34, letterSpacing: "0.16em", fontWeight: 700, opacity: eb, marginBottom: 20 }}>SEASON POINTS</div>
      <div style={{ background: "#101015", border: "3px solid #1d1d26", borderRadius: 20, padding: "60px 40px", textAlign: "center" }}>
        <div style={{ fontFamily: "JetBrains Mono, monospace", color: "#ff3b3b", fontWeight: 800, fontSize: 360, lineHeight: 0.86, textShadow: "0 0 40px rgba(255,59,59,0.5)" }}>{v}</div>
        <div style={{ height: 5, background: "#c4141d", margin: "30px auto", width: "60%" }} />
        <div style={{ fontFamily: '"JetBrains Mono", monospace', color: "#7a7a85", fontSize: 38, letterSpacing: "0.14em" }}>TEAM RECORD</div>
      </div>
      <div style={{ fontFamily: "Geist, sans-serif", color: "#cfcfcf", fontSize: 42, fontWeight: 600, marginTop: 40, textAlign: "center", opacity: head }}>Numbers that put us on the map</div>
    </div>
  );
  return (
    <Stage width={VW} height={VH} duration={5} background="#08080b">
      {scene}
    </Stage>
  );
}
window.ScoreboardLedDark = ScoreboardLedDark;
