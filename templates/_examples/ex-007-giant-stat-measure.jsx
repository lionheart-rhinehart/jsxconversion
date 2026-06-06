// ex-007 — KIND: giant-stat. Sub-look #2: a measurement figure on a red field with
// a thin dark photo strip — the numeral still owns the frame, different palette +
// layout from ex-006. Plain static React.
export default function Example() {
  const W = 1080, H = 1920;
  return (
    <div style={{ width: W, height: H, position: "relative", overflow: "hidden", background: "#c4141d" }}>
      <img src="./assets/squat.jpg" style={{ position: "absolute", left: 0, right: 0, bottom: 0, width: "100%", height: 420, objectFit: "cover", opacity: 0.45 }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 240, textAlign: "center" }}>
        <div style={{ fontFamily: "Geist", color: "#fff", fontSize: 44, fontWeight: 700, opacity: 0.9 }}>Average added vertical</div>
        <div style={{ fontFamily: "Anton", color: "#fff", fontSize: 420, lineHeight: 0.85, marginTop: 10 }}>+3<span style={{ fontSize: 180 }}>in</span></div>
        <div style={{ fontFamily: "JetBrains Mono", color: "#fff", fontSize: 30, letterSpacing: "0.1em", marginTop: 8, opacity: 0.85 }}>OR YOUR TRAINING IS ON US</div>
      </div>
    </div>
  );
}
