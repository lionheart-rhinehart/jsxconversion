// ex-002 — KIND: action-hero-text. Athlete mid-jump, full-bleed. Sub-look differs
// from ex-001: TOP-anchored statement bar over a lighter top scrim (different
// composition + lighting), Saira Condensed. Plain static React.
export default function Example() {
  const W = 1080, H = 1920;
  return (
    <div style={{ width: W, height: H, position: "relative", overflow: "hidden", background: "#000" }}>
      <img src="./assets/jump-female.jpg" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 32%, rgba(0,0,0,0.0) 60%)" }} />
      <div style={{ position: "absolute", left: 64, right: 64, top: 120 }}>
        <div style={{ fontFamily: "JetBrains Mono", color: "#c4141d", fontWeight: 700, fontSize: 30, letterSpacing: "0.06em", marginBottom: 20 }}>WESTFIELD SPORT PARENTS</div>
        <div style={{ fontFamily: "Saira Condensed", color: "#fff", fontSize: 120, fontWeight: 900, lineHeight: 0.92, textTransform: "uppercase", letterSpacing: "-0.01em" }}>Three inches<br/>higher</div>
        <div style={{ width: 200, height: 6, background: "#c4141d", marginTop: 26 }} />
      </div>
    </div>
  );
}
