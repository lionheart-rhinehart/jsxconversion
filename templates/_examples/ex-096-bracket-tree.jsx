// BracketLatticeLight — generated VIDEO example (self-contained Stage; fallback runtime).
const VW = 1080, VH = 1920;
function BracketLatticeLight() {
  const t = useTime();
  const ce = (start, dur = 0.5) => Easing.easeOutCubic(clamp((t - start) / dur, 0, 1));
  const eb = ce(0.1, 0.3);
  const r1 = ce(0.5, 0.4), r2 = ce(1.2, 0.45), r3 = ce(2.0, 0.45);
  const cell = (x, y, w, lit, label, win) => <div style={{ position: "absolute", left: x, top: y, width: w, height: 92, borderRadius: 10, background: win ? "#c4141d" : "#fff", border: "3px solid " + (win ? "#c4141d" : "#dad7d1"), display: "flex", alignItems: "center", paddingLeft: 22, boxSizing: "border-box", fontFamily: "Anton, sans-serif", fontSize: 38, color: win ? "#fff" : "#16161b", opacity: lit, transform: "translateX(" + ((1 - lit) * -18) + "px)" }}>{label}</div>;
  const ln = (x1, y1, x2, y2, op) => <path d={"M" + x1 + " " + y1 + " L" + x2 + " " + y1 + " L" + x2 + " " + y2 + " L" + x1 + " " + y2} stroke="#c9c6c0" strokeWidth="4" fill="none" opacity={op} />;
  const scene = (
    <div style={{ position: "absolute", inset: 0 }}>
      <div style={{ position: "absolute", left: 64, top: 132, fontFamily: '"JetBrains Mono", monospace', color: "#c4141d", fontSize: 32, letterSpacing: "0.12em", fontWeight: 700, opacity: eb }}>SUMMER SHOWDOWN</div>
      <div style={{ position: "absolute", left: 64, top: 178, fontFamily: "Anton, sans-serif", color: "#16161b", fontSize: 96, textTransform: "uppercase", lineHeight: 0.9, opacity: eb }}>Bracket<br/>night</div>
      <svg viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
        {ln(364, 606, 404, 706, r1)}{ln(364, 806, 404, 706, r1)}
        {ln(364, 1066, 404, 1166, r1)}{ln(364, 1266, 404, 1166, r1)}
        {ln(704, 706, 744, 936, r2)}{ln(704, 1166, 744, 936, r2)}
      </svg>
      {cell(64, 560, 300, r1, "Falcons", false)}
      {cell(64, 760, 300, r1, "Hawks", true)}
      {cell(64, 1020, 300, r1, "Wolves", true)}
      {cell(64, 1220, 300, r1, "Bears", false)}
      {cell(404, 660, 300, r2, "Hawks", true)}
      {cell(404, 1120, 300, r2, "Wolves", false)}
      {cell(744, 890, 300, r3, "Hawks", true)}
      <div style={{ position: "absolute", left: 744, top: 1000, width: 300, fontFamily: '"JetBrains Mono", monospace', color: "#c4141d", fontSize: 30, fontWeight: 700, letterSpacing: "0.06em", opacity: r3 }}>CHAMPION</div>
    </div>
  );
  return (
    <Stage width={VW} height={VH} duration={5} background="#f1efec">
      {scene}
    </Stage>
  );
}
window.BracketLatticeLight = BracketLatticeLight;
