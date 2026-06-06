// ex-005 — KIND: training-scene. Group session, environment-led. Sub-look #2:
// centered lower band instead of corner anchor; many bodies in frame, place +
// people dominate, text supports. Plain static React.
export default function Example() {
  const W = 1080, H = 1920;
  return (
    <div style={{ width: W, height: H, position: "relative", overflow: "hidden", background: "#000" }}>
      <img src="./assets/group-coaching.jpg" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 360, background: "linear-gradient(0deg, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.0) 100%)" }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 110, textAlign: "center", padding: "0 70px" }}>
        <div style={{ fontFamily: "Geist", color: "#fff", fontSize: 44, fontWeight: 600, lineHeight: 1.15 }}>Small groups. Real coaching. Every athlete seen.</div>
      </div>
    </div>
  );
}
