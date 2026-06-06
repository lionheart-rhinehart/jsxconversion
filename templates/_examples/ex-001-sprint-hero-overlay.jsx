// ex-001 — KIND: action-hero-text. Full-bleed athlete-in-motion footage + bold
// overlay statement. Brand is incidental; the ARCHETYPE is "hero footage, big
// text laid over a bottom scrim." Plain static React component (no animation hints).
export default function Example() {
  const W = 1080, H = 1920;
  return (
    <div style={{ width: W, height: H, position: "relative", overflow: "hidden", background: "#000" }}>
      <img
        src="./assets/sprint-male.jpg"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
      />
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.0) 35%, rgba(0,0,0,0.55) 72%, rgba(0,0,0,0.92) 100%)",
      }} />
      <div style={{
        position: "absolute", left: 70, top: 150,
        background: "#ffffff", color: "#c4141d", padding: "10px 22px", borderRadius: 8,
        fontFamily: "JetBrains Mono", fontWeight: 700, fontSize: 32, letterSpacing: "0.04em",
      }}>CARMEL SPORT PARENTS</div>
      <div style={{ position: "absolute", left: 64, right: 64, bottom: 210 }}>
        <div style={{ width: 240, height: 7, background: "#c4141d", marginBottom: 28 }} />
        <div style={{
          fontFamily: "Anton", color: "#fff", fontSize: 148, lineHeight: 0.92,
          textTransform: "uppercase", letterSpacing: "-0.01em", textShadow: "0 2px 24px rgba(0,0,0,0.75)",
        }}>Faster by<br/>the fall</div>
      </div>
    </div>
  );
}
