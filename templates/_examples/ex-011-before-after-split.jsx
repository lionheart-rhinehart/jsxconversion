// ex-011 — KIND: before-after-split. HARD dual-frame, same athlete two states,
// stacked top/bottom with a hairline divider + WEEK labels. The split layout is the
// archetype signal. Plain static React.
export default function Example() {
  const W = 1080, H = 1920;
  const Pane = ({ src, label, tint }) => (
    <div style={{ position: "relative", width: "100%", height: "50%", overflow: "hidden" }}>
      <img src={src} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      <div style={{ position: "absolute", inset: 0, background: tint }} />
      <div style={{ position: "absolute", left: 48, top: 40, fontFamily: "JetBrains Mono", color: "#fff", fontSize: 34, fontWeight: 700, letterSpacing: "0.08em", background: "rgba(0,0,0,0.55)", padding: "8px 18px" }}>{label}</div>
    </div>
  );
  return (
    <div style={{ width: W, height: H, position: "relative", overflow: "hidden", background: "#000" }}>
      <Pane src="./assets/conditioning.jpg" label="WEEK 1" tint="rgba(20,20,30,0.45)" />
      <div style={{ height: 6, background: "#c4141d" }} />
      <Pane src="./assets/sprint-male.jpg" label="WEEK 12" tint="rgba(196,20,29,0.12)" />
      <div style={{ position: "absolute", left: 0, right: 0, top: "50%", transform: "translateY(-50%)", textAlign: "center", fontFamily: "Anton", color: "#fff", fontSize: 120, textShadow: "0 4px 18px rgba(0,0,0,0.9)" }}>+1 MPH</div>
    </div>
  );
}
