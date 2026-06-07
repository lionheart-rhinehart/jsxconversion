// ScoreboardArenaLight — generated VIDEO example (self-contained Stage; fallback runtime).
const VW = 1080, VH = 1920;
function ScoreboardArenaLight() {
  const t = useTime();
  const ce = (start, dur = 0.5) => Easing.easeOutCubic(clamp((t - start) / dur, 0, 1));
  const eb = ce(0.1, 0.3);
  const hs = Math.round(4 * ce(0.6, 1.4));
  const as = Math.round(2 * ce(0.9, 1.3));
  const head = ce(2.2, 0.45);
  const panel = (label, score, bg) => <div style={{ flex: 1, background: bg, borderRadius: 16, padding: "40px 0", textAlign: "center" }}>
    <div style={{ fontFamily: '"JetBrains Mono", monospace', color: "#fff", fontSize: 36, letterSpacing: "0.1em", fontWeight: 700, opacity: 0.8 }}>{label}</div>
    <div style={{ fontFamily: "Anton, sans-serif", color: "#fff", fontSize: 280, lineHeight: 0.9 }}>{score}</div>
  </div>;
  const scene = (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 56px" }}>
      <div style={{ fontFamily: "Anton, sans-serif", color: "#16161b", fontSize: 92, textTransform: "uppercase", lineHeight: 0.92, marginBottom: 40, opacity: eb }}>Friday night<br/>lights</div>
      <div style={{ display: "flex", gap: 22 }}>{panel("HOME", hs, "#16161b")}{panel("AWAY", as, "#c4141d")}</div>
      <div style={{ marginTop: 26, background: "#16161b", borderRadius: 12, padding: "22px", textAlign: "center", fontFamily: "JetBrains Mono, monospace", color: "#fff", fontSize: 40, letterSpacing: "0.1em", opacity: head }}>4TH · 02:14</div>
    </div>
  );
  return (
    <Stage width={VW} height={VH} duration={5} background="#e9eaec">
      {scene}
    </Stage>
  );
}
window.ScoreboardArenaLight = ScoreboardArenaLight;
