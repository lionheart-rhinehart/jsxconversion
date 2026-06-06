// ex-013 — KIND: versus ("this, not that"). Two-column head-to-head contrast, a
// dark/muted side vs a branded side, small image in each. The vertical split +
// opposed columns is the archetype signal. Plain static React.
export default function Example() {
  const W = 1080, H = 1920;
  const Col = ({ src, kicker, line, bg, accent }) => (
    <div style={{ position: "relative", width: "50%", height: "100%", background: bg, display: "flex", flexDirection: "column" }}>
      <div style={{ position: "relative", height: 760, overflow: "hidden" }}>
        <img src={src} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.85 }} />
      </div>
      <div style={{ padding: "40px 36px" }}>
        <div style={{ fontFamily: "JetBrains Mono", color: accent, fontSize: 28, letterSpacing: "0.08em", marginBottom: 14 }}>{kicker}</div>
        <div style={{ fontFamily: "Anton", color: "#fff", fontSize: 60, lineHeight: 0.95, textTransform: "uppercase", whiteSpace: "pre-line" }}>{line}</div>
      </div>
    </div>
  );
  return (
    <div style={{ width: W, height: H, position: "relative", overflow: "hidden", display: "flex", background: "#000" }}>
      <Col src="./assets/conditioning.jpg" kicker="OPEN GYM" line={"Left to\nfigure it out"} bg="#1a1a1a" accent="#8a8a8a" />
      <div style={{ width: 6, background: "#c4141d" }} />
      <Col src="./assets/agility-female.jpg" kicker="ATHLETES ACCELERATION" line={"Coached\nevery rep"} bg="#111" accent="#ff3b42" />
    </div>
  );
}
