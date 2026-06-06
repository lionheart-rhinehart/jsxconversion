// ex-009 — KIND: authentic-selfie. Sub-look #2: athlete face-fill with a small
// handwritten-style caption sticker, brighter/outdoor feel. Same raw UGC archetype,
// different subject + treatment. Plain static React.
export default function Example() {
  const W = 1080, H = 1920;
  return (
    <div style={{ width: W, height: H, position: "relative", overflow: "hidden", background: "#000" }}>
      <img src="./assets/sprint-female.jpg" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", transform: "scale(1.5)", transformOrigin: "55% 25%" }} />
      <div style={{ position: "absolute", left: 60, top: 130, background: "rgba(255,255,255,0.92)", color: "#111", padding: "14px 22px", borderRadius: 14, fontFamily: "Caveat", fontSize: 56, fontWeight: 700, transform: "rotate(-4deg)" }}>day 1 vs day 90</div>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 70, textAlign: "center" }}>
        <div style={{ fontFamily: "JetBrains Mono", color: "#fff", fontSize: 28, letterSpacing: "0.08em", textShadow: "0 2px 8px rgba(0,0,0,0.8)" }}>@ATHLETESACCELERATION</div>
      </div>
    </div>
  );
}
