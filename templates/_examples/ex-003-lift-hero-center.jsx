// ex-003 — KIND: action-hero-text. Lifting in a dark weight room. Sub-look: a
// CENTERED statement on a heavy all-over scrim (darker, tighter crop) — a third
// distinct execution of the same archetype. Plain static React.
export default function Example() {
  const W = 1080, H = 1920;
  return (
    <div style={{ width: W, height: H, position: "relative", overflow: "hidden", background: "#000" }}>
      <img src="./assets/lifting.jpg" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.52)" }} />
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "0 80px" }}>
        <div style={{ fontFamily: "JetBrains Mono", color: "#ff3b42", fontWeight: 700, fontSize: 30, letterSpacing: "0.1em", marginBottom: 28 }}>STRENGTH BLOCK</div>
        <div style={{ fontFamily: "Anton", color: "#fff", fontSize: 132, lineHeight: 0.9, textTransform: "uppercase" }}>Built in<br/>the off-season</div>
        <div style={{ width: 120, height: 6, background: "#c4141d", marginTop: 36 }} />
      </div>
    </div>
  );
}
