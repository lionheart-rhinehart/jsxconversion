// SprintLaneDark — generated VIDEO example (self-contained Stage; fallback runtime).
const VW = 1080, VH = 1920;
function SprintLaneDark() {
  const t = useTime();
  const ce = (start, dur = 0.5) => Easing.easeOutCubic(clamp((t - start) / dur, 0, 1));
  const eb = ce(0.1, 0.3);
  const prog = ce(0.5, 1.9);
  const x = 90 + prog * 900;
  const head = ce(2.4, 0.4);
  const lanes = [720, 940, 1160];
  const ticks = Array.from({ length: 9 }, (_, i) => 90 + i * 112.5);
  const scene = (
    <div style={{ position: "absolute", inset: 0 }}>
      <div style={{ position: "absolute", left: 64, top: 150, fontFamily: '"JetBrains Mono", monospace', color: "#c4141d", fontSize: 32, letterSpacing: "0.14em", fontWeight: 700, opacity: eb }}>40-YARD DASH</div>
      <div style={{ position: "absolute", left: 64, top: 196, fontFamily: "Anton, sans-serif", color: "#fff", fontSize: 88, textTransform: "uppercase", lineHeight: 0.9, opacity: eb }}>Trace the<br/>top end</div>
      <svg viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
        {lanes.map((ly, li) => <rect key={"l" + li} x="60" y={ly} width="960" height="170" rx="14" fill="#13131a" />)}
        {lanes.map((ly, li) => ticks.map((tx, i) => <line key={"t" + li + "-" + i} x1={tx} y1={ly + 22} x2={tx} y2={ly + 148} stroke="#26262f" strokeWidth="3" />))}
        <line x1="90" y1="1025" x2={x} y2="1025" stroke="#c4141d" strokeWidth="14" strokeLinecap="round" />
        <circle cx={x} cy="1025" r="30" fill="#c4141d" />
      </svg>
      <div style={{ position: "absolute", left: 64, right: 64, top: 1430, fontFamily: '"JetBrains Mono", monospace', color: "#cfcfcf", fontSize: 40, letterSpacing: "0.03em", opacity: head }}>SPLIT {(4.9 - prog * 0.6).toFixed(2)}s · 22.4 MPH PEAK</div>
    </div>
  );
  return (
    <Stage width={VW} height={VH} duration={5} background="#0a0b0d">
      {scene}
    </Stage>
  );
}
window.SprintLaneDark = SprintLaneDark;
