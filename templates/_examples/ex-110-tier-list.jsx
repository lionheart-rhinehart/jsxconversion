// TierBandsLight — generated VIDEO example (self-contained Stage; fallback runtime).
const VW = 1080, VH = 1920;
function TierBandsLight() {
  const t = useTime();
  const ce = (start, dur = 0.5) => Easing.easeOutCubic(clamp((t - start) / dur, 0, 1));
  const eb = ce(0.1, 0.3);
  const tiers = [["S", "#c4141d", ["Game speed", "Vertical jump"]], ["A", "#e0822e", ["Lateral agility", "Core strength"]], ["B", "#3a7d44", ["Mobility", "Conditioning"]]];
  const rows = tiers.map((tr, i) => {
    const g = ce(0.5 + i * 0.35, 0.4);
    return <div key={i} style={{ display: "flex", alignItems: "stretch", height: 200, marginBottom: 22, opacity: g, transform: "translateX(" + ((1 - g) * 40) + "px)" }}>
      <div style={{ width: 150, background: tr[1], borderRadius: "16px 0 0 16px", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Anton, sans-serif", color: "#fff", fontSize: 110 }}>{tr[0]}</div>
      <div style={{ flex: 1, background: "#fff", borderRadius: "0 16px 16px 0", display: "flex", alignItems: "center", gap: 18, padding: "0 32px", flexWrap: "wrap" }}>
        {tr[2].map((c, j) => <div key={j} style={{ background: "#f0ece6", borderRadius: 999, padding: "16px 28px", fontFamily: "Geist, sans-serif", fontWeight: 700, fontSize: 40, color: "#16161b" }}>{c}</div>)}
      </div>
    </div>;
  });
  const scene = (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 60px" }}>
      <div style={{ fontFamily: "Anton, sans-serif", color: "#16161b", fontSize: 92, textTransform: "uppercase", lineHeight: 0.92, marginBottom: 50, opacity: eb }}>What we<br/><span style={{ color: "#c4141d" }}>build first</span></div>
      {rows}
    </div>
  );
  return (
    <Stage width={VW} height={VH} duration={5} background="#f3f1ee">
      {scene}
    </Stage>
  );
}
window.TierBandsLight = TierBandsLight;
