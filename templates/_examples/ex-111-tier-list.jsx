// TierColumnsDark — generated VIDEO example (self-contained Stage; fallback runtime).
const VW = 1080, VH = 1920;
function TierColumnsDark() {
  const t = useTime();
  const ce = (start, dur = 0.5) => Easing.easeOutCubic(clamp((t - start) / dur, 0, 1));
  const eb = ce(0.1, 0.3);
  const cols = [["S", "#c4141d", ["Speed", "Power"]], ["A", "#e0822e", ["Agility", "Strength"]], ["B", "#3a7d44", ["Mobility", "Engine"]]];
  const els = cols.map((c, i) => {
    const g = ce(0.5 + i * 0.3, 0.45);
    return <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", opacity: g, transform: "translateY(" + ((1 - g) * 32) + "px)" }}>
      <div style={{ background: c[1], borderRadius: "16px 16px 0 0", textAlign: "center", padding: "20px 0", fontFamily: "Anton, sans-serif", color: "#fff", fontSize: 100 }}>{c[0]}</div>
      <div style={{ flex: 1, background: "#15151c", borderRadius: "0 0 16px 16px", padding: "30px 18px", display: "flex", flexDirection: "column", gap: 18 }}>
        {c[2].map((x, j) => <div key={j} style={{ fontFamily: "Geist, sans-serif", fontWeight: 700, fontSize: 38, color: "#e8e8ec", textAlign: "center" }}>{x}</div>)}
      </div>
    </div>;
  });
  const scene = (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", padding: "130px 56px", boxSizing: "border-box" }}>
      <div style={{ fontFamily: "Anton, sans-serif", color: "#fff", fontSize: 92, textTransform: "uppercase", lineHeight: 0.92, marginBottom: 50, opacity: eb }}>Priority<br/>tiers</div>
      <div style={{ flex: 1, display: "flex", gap: 22 }}>{els}</div>
    </div>
  );
  return (
    <Stage width={VW} height={VH} duration={5} background="#0c0c11">
      {scene}
    </Stage>
  );
}
window.TierColumnsDark = TierColumnsDark;
