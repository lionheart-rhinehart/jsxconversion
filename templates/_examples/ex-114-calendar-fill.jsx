// CalendarMonthLight — generated VIDEO example (self-contained Stage; fallback runtime).
const VW = 1080, VH = 1920;
function CalendarMonthLight() {
  const t = useTime();
  const ce = (start, dur = 0.5) => Easing.easeOutCubic(clamp((t - start) / dur, 0, 1));
  const eb = ce(0.1, 0.3);
  const sessionDays = [2, 4, 5, 9, 11, 12, 16, 18, 19, 23, 25, 26, 30];
  const fillN = Math.round(sessionDays.length * ce(0.5, 1.7));
  const head = ce(2.2, 0.45);
  const cells = Array.from({ length: 35 }, (_, i) => {
    const day = i + 1;
    const si = sessionDays.indexOf(day);
    const isS = si >= 0 && si < fillN;
    return <div key={i} style={{ height: 118, borderRadius: 12, background: isS ? "#c4141d" : "#eae7e1", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: '"JetBrains Mono", monospace', fontSize: 30, fontWeight: 700, color: isS ? "#fff" : "#bdb8af" }}>{day <= 31 ? day : ""}</div>;
  });
  const scene = (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 54px" }}>
      <div style={{ fontFamily: '"JetBrains Mono", monospace', color: "#c4141d", fontSize: 32, letterSpacing: "0.12em", fontWeight: 700, opacity: eb, marginBottom: 8 }}>SUMMER PROGRAM</div>
      <div style={{ fontFamily: "Anton, sans-serif", color: "#16161b", fontSize: 88, textTransform: "uppercase", lineHeight: 0.92, marginBottom: 34, opacity: eb }}>13 sessions,<br/>one month</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 14 }}>{cells}</div>
      <div style={{ fontFamily: "Geist, sans-serif", color: "#444", fontSize: 40, fontWeight: 600, marginTop: 34, opacity: head }}>Three days a week. We handle the plan.</div>
    </div>
  );
  return (
    <Stage width={VW} height={VH} duration={5} background="#f3f1ee">
      {scene}
    </Stage>
  );
}
window.CalendarMonthLight = CalendarMonthLight;
