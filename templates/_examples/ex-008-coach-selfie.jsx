// ex-008 — KIND: authentic-selfie (UGC lane). A single athlete face fills the frame,
// raw, arm's-length feel; minimal caption. Tight crop = the signal that separates
// this from the composed coach-direct-address. Plain static React.
export default function Example() {
  const W = 1080, H = 1920;
  return (
    <div style={{ width: W, height: H, position: "relative", overflow: "hidden", background: "#000" }}>
      <img src="./assets/jump-male.jpg" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", transform: "scale(1.6)", transformOrigin: "50% 28%" }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 300, background: "linear-gradient(0deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 100%)" }} />
      <div style={{ position: "absolute", left: 48, right: 48, bottom: 80 }}>
        <div style={{ fontFamily: "Geist", color: "#fff", fontSize: 50, fontWeight: 700, lineHeight: 1.08 }}>"Six weeks in and I finally dunked. This stuff works."</div>
      </div>
    </div>
  );
}
