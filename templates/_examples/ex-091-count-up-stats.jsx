// CountUpTriadLight — generated VIDEO example (self-contained Stage; fallback runtime).
const VW = 1080, VH = 1920;
function CountUpTriadLight() {
  const t = useTime();
  const ce = (start, dur = 0.5) => Easing.easeOutCubic(clamp((t - start) / dur, 0, 1));
  const eb = ce(0.1, 0.3);
  const stats = [[12, "MPH TOP SPEED", 0.5], [38, "IN VERTICAL", 0.8], [9, "LBS LEANER", 1.1]];
  const cols = stats.map((s, i) => {
    const g = ce(s[2], 1.2);
    const v = Math.round(s[0] * g);
    return <div key={i} style={{ flex: 1, textAlign: "center" }}>
      <div style={{ fontFamily: "Anton, sans-serif", color: i === 1 ? "#c4141d" : "#16161b", fontSize: 256, lineHeight: 0.8 }}>{v}</div>
      <div style={{ fontFamily: '"JetBrains Mono", monospace', color: "#777", fontSize: 26, letterSpacing: "0.06em", marginTop: 22 }}>{s[1]}</div>
    </div>;
  });
  const scene = (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 56px" }}>
      <div style={{ fontFamily: "Anton, sans-serif", color: "#16161b", fontSize: 100, textTransform: "uppercase", lineHeight: 0.9, marginBottom: 86, opacity: eb }}>One summer.<br/><span style={{ color: "#c4141d" }}>Three wins.</span></div>
      <div style={{ display: "flex", gap: 30 }}>{cols}</div>
    </div>
  );
  return (
    <Stage width={VW} height={VH} duration={5} background="#eef0f2">
      {scene}
    </Stage>
  );
}
window.CountUpTriadLight = CountUpTriadLight;
