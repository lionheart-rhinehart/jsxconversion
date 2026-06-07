// BracketVerticalDark — generated VIDEO example (self-contained Stage; fallback runtime).
const VW = 1080, VH = 1920;
function BracketVerticalDark() {
  const t = useTime();
  const ce = (start, dur = 0.5) => Easing.easeOutCubic(clamp((t - start) / dur, 0, 1));
  const eb = ce(0.1, 0.3);
  const r1 = ce(0.5, 0.4), r2 = ce(1.2, 0.45), r3 = ce(2.0, 0.45);
  const cell = (x, y, lit, label, win) => <div style={{ position: "absolute", left: x, top: y, width: 232, height: 84, borderRadius: 10, background: win ? "#c4141d" : "#17171f", border: "2px solid " + (win ? "#c4141d" : "#2b2b35"), display: "flex", alignItems: "center", justifyContent: "center", boxSizing: "border-box", fontFamily: "Anton, sans-serif", fontSize: 34, color: win ? "#fff" : "#cfcfcf", opacity: lit, transform: "translateY(" + ((1 - lit) * -14) + "px)" }}>{label}</div>;
  const ln = (x1, y1, x2, y2, op) => <path d={"M" + x1 + " " + y1 + " L" + x1 + " " + y2 + " L" + x2 + " " + y2} stroke="#33333d" strokeWidth="4" fill="none" opacity={op} />;
  const scene = (
    <div style={{ position: "absolute", inset: 0 }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 120, textAlign: "center", fontFamily: '"JetBrains Mono", monospace', color: "#c4141d", fontSize: 32, letterSpacing: "0.14em", fontWeight: 700, opacity: eb }}>PLAYOFFS</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 168, textAlign: "center", fontFamily: "Anton, sans-serif", color: "#fff", fontSize: 92, textTransform: "uppercase", opacity: eb }}>Road to #1</div>
      <svg viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
        {ln(176, 444, 424, 444, r1)}{ln(424, 444, 424, 700, r2)}
        {ln(656, 444, 904, 444, r1)}{ln(656, 444, 656, 700, r2)}
        {ln(540, 700, 540, 1020, r3)}
      </svg>
      {cell(60, 360, r1, "Falcons", false)}
      {cell(316, 360, r1, "Hawks", true)}
      {cell(548, 360, r1, "Wolves", true)}
      {cell(788, 360, r1, "Bears", false)}
      {cell(308, 660, r2, "Hawks", true)}
      {cell(540, 660, r2, "Wolves", false)}
      {cell(424, 980, r3, "Hawks", true)}
      <div style={{ position: "absolute", left: 0, right: 0, top: 1090, textAlign: "center", fontFamily: '"JetBrains Mono", monospace', color: "#c4141d", fontSize: 34, fontWeight: 700, letterSpacing: "0.08em", opacity: r3 }}>STATE CHAMPS</div>
    </div>
  );
  return (
    <Stage width={VW} height={VH} duration={5} background="#0c0c11">
      {scene}
    </Stage>
  );
}
window.BracketVerticalDark = BracketVerticalDark;
