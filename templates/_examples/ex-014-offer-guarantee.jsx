// ex-014 — KIND: offer-guarantee. Structured deal: offer headline + verbatim
// guarantee + CTA button, with a small support image strip. The card/structured
// layout (not a photo hero) is the archetype signal. Plain static React.
export default function Example() {
  const W = 1080, H = 1920;
  return (
    <div style={{ width: W, height: H, position: "relative", overflow: "hidden", background: "#0d0d0d", display: "flex", flexDirection: "column" }}>
      <div style={{ position: "relative", height: 560, overflow: "hidden" }}>
        <img src="./assets/box-jump.jpg" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(13,13,13,0) 50%, rgba(13,13,13,1) 100%)" }} />
      </div>
      <div style={{ padding: "0 72px", marginTop: -40 }}>
        <div style={{ fontFamily: "JetBrains Mono", color: "#c4141d", fontSize: 30, letterSpacing: "0.1em" }}>SUMMER PERFORMANCE CAMP</div>
        <div style={{ fontFamily: "Anton", color: "#fff", fontSize: 110, lineHeight: 0.92, textTransform: "uppercase", marginTop: 14 }}>8 weeks. 3 days a week.</div>
        <div style={{ marginTop: 36, padding: "28px 32px", border: "2px solid #c4141d", borderRadius: 16 }}>
          <div style={{ fontFamily: "Geist", color: "#fff", fontSize: 40, fontWeight: 700, lineHeight: 1.2 }}>+1 mph speed. +3" vertical. 90 days. Or your training is on us.</div>
        </div>
        <div style={{ marginTop: 40, display: "inline-block", background: "#c4141d", color: "#fff", fontFamily: "Anton", fontSize: 48, textTransform: "uppercase", padding: "22px 48px", borderRadius: 10 }}>Claim your spot</div>
      </div>
    </div>
  );
}
