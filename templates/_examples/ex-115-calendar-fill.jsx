// CalendarWeekDark — generated VIDEO example (self-contained Stage; fallback runtime).
const VW = 1080, VH = 1920;
function CalendarWeekDark() {
  const t = useTime();
  const ce = (start, dur = 0.5) => Easing.easeOutCubic(clamp((t - start) / dur, 0, 1));
  const eb = ce(0.1, 0.3);
  const days = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
  const active = [0, 2, 4];
  const head = ce(2.2, 0.45);
  const cols = days.map((d, i) => {
    const isA = active.indexOf(i) >= 0;
    const g = ce(0.5 + i * 0.12, 0.4);
    return <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
      <div style={{ fontFamily: '"JetBrains Mono", monospace', color: "#7a7a85", fontSize: 26, fontWeight: 700, opacity: g }}>{d}</div>
      <div style={{ width: "100%", height: 340, borderRadius: 16, background: isA ? "#c4141d" : "#17171f", opacity: isA ? g : 0.5 }} />
    </div>;
  });
  const scene = (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 50px" }}>
      <div style={{ fontFamily: "Anton, sans-serif", color: "#fff", fontSize: 92, textTransform: "uppercase", lineHeight: 0.92, marginBottom: 50, opacity: eb }}>Your training<br/>week</div>
      <div style={{ display: "flex", gap: 16 }}>{cols}</div>
      <div style={{ fontFamily: "Geist, sans-serif", color: "#cfcfcf", fontSize: 42, fontWeight: 600, marginTop: 44, opacity: head }}>Three focused days beats seven random ones</div>
    </div>
  );
  return (
    <Stage width={VW} height={VH} duration={5} background="#0c0c11">
      {scene}
    </Stage>
  );
}
window.CalendarWeekDark = CalendarWeekDark;
