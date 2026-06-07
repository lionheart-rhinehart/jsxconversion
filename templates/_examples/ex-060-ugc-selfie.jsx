export default function Chrome() {
  return (
    <div style={{ width: 1080, height: 1920, position: "relative", overflow: "hidden", background: "#00ff00" }}>
      <div style={{ position: "absolute", left: 48, top: 120, background: "#fff", color: "#111", padding: "16px 24px", borderRadius: 18, fontFamily: "Caveat, cursive", fontSize: 60, fontWeight: 700, transform: "rotate(-4deg)" }}>day 1 vs day 90</div>
      <div style={{ position: "absolute", left: "50%", bottom: 70, transform: "translateX(-50%)", display: "flex", alignItems: "center", gap: 12, background: "rgba(0,0,0,0.6)", padding: "10px 20px", borderRadius: 999 }}>
        <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#c4141d", color: "#fff", fontFamily: "Anton, sans-serif", fontSize: 22, display: "flex", alignItems: "center", justifyContent: "center" }}>AA</div>
        <div style={{ fontFamily: '"JetBrains Mono", monospace', color: "#fff", fontSize: 26, letterSpacing: "0.06em" }}>@athletesacceleration</div>
      </div>
    </div>
  );
}
