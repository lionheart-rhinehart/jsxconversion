// ex-010 — KIND: coach-direct-address. COMPOSED coach portrait, intentional framing,
// a lower-third name/title bar — the "talking to camera, on purpose" look. Separated
// from authentic-selfie by deliberate composition + the credential bar. Plain static React.
export default function Example() {
  const W = 1080, H = 1920;
  return (
    <div style={{ width: W, height: H, position: "relative", overflow: "hidden", background: "#111" }}>
      <img src="./assets/coach-action.jpg" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.0) 45%, rgba(0,0,0,0.88) 100%)" }} />
      <div style={{ position: "absolute", left: 64, right: 64, bottom: 150 }}>
        <div style={{ fontFamily: "Anton", color: "#fff", fontSize: 96, lineHeight: 0.92, textTransform: "uppercase" }}>Speed is coachable</div>
      </div>
      <div style={{ position: "absolute", left: 64, bottom: 80, borderLeft: "6px solid #c4141d", paddingLeft: 20 }}>
        <div style={{ fontFamily: "Geist", color: "#fff", fontSize: 38, fontWeight: 700 }}>Coach Graham Wilkerson</div>
        <div style={{ fontFamily: "JetBrains Mono", color: "#c9c9c9", fontSize: 26, letterSpacing: "0.04em" }}>DIRECTOR OF PERFORMANCE</div>
      </div>
    </div>
  );
}
