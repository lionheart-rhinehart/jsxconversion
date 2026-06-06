// ex-004 — KIND: training-scene. Wide gym, the PLACE dominates; text is small and
// anchored in a corner, not a hero statement. Distinct from action-hero-text by
// composition (environment-led, low text weight). Plain static React.
export default function Example() {
  const W = 1080, H = 1920;
  return (
    <div style={{ width: W, height: H, position: "relative", overflow: "hidden", background: "#000" }}>
      <img src="./assets/gym-wide.jpg" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(0deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.0) 40%)" }} />
      <div style={{ position: "absolute", left: 64, bottom: 96 }}>
        <div style={{ width: 64, height: 6, background: "#c4141d", marginBottom: 18 }} />
        <div style={{ fontFamily: "Geist", color: "#fff", fontSize: 46, fontWeight: 700, lineHeight: 1.1, maxWidth: 760 }}>Where Carmel athletes train all winter</div>
        <div style={{ fontFamily: "JetBrains Mono", color: "#cfcfcf", fontSize: 26, marginTop: 16, letterSpacing: "0.04em" }}>ATHLETES ACCELERATION · CARMEL, IN</div>
      </div>
    </div>
  );
}
