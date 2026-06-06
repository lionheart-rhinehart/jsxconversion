// ex-006 — KIND: giant-stat. One huge numeral OWNS the frame; the photo is a faint
// backdrop. The number is the subject, not the athlete. Plain static React.
export default function Example() {
  const W = 1080, H = 1920;
  return (
    <div style={{ width: W, height: H, position: "relative", overflow: "hidden", background: "#0a0a0a" }}>
      <img src="./assets/agility-female.jpg" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.18 }} />
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontFamily: "JetBrains Mono", color: "#c4141d", fontSize: 34, letterSpacing: "0.12em", fontWeight: 700, marginBottom: 10 }}>VERTICAL JUMP</div>
        <div style={{ fontFamily: "Anton", color: "#fff", fontSize: 540, lineHeight: 0.8 }}>92<span style={{ fontSize: 200, color: "#c4141d" }}>%</span></div>
        <div style={{ fontFamily: "Geist", color: "#bdbdbd", fontSize: 40, fontWeight: 600, marginTop: 18 }}>improved in 90 days</div>
      </div>
    </div>
  );
}
