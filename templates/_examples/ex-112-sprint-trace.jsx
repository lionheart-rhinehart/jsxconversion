// SprintCurveLight — generated VIDEO example (self-contained Stage; fallback runtime).
const VW = 1080, VH = 1920;
function SprintCurveLight() {
  const t = useTime();
  const ce = (start, dur = 0.5) => Easing.easeOutCubic(clamp((t - start) / dur, 0, 1));
  const eb = ce(0.1, 0.3);
  const draw = ce(0.5, 1.8);
  const L = 1500;
  const head = ce(2.4, 0.4);
  const splits = [[320, 1160], [600, 720], [880, 560]];
  const scene = (
    <div style={{ position: "absolute", inset: 0 }}>
      <div style={{ position: "absolute", left: 64, top: 150, fontFamily: '"JetBrains Mono", monospace', color: "#c4141d", fontSize: 32, letterSpacing: "0.12em", fontWeight: 700, opacity: eb }}>40-YARD BREAKDOWN</div>
      <div style={{ position: "absolute", left: 64, top: 196, fontFamily: "Anton, sans-serif", color: "#16161b", fontSize: 92, textTransform: "uppercase", lineHeight: 0.9, opacity: eb }}>Where you<br/>accelerate</div>
      <svg viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
        <line x1="120" y1="1360" x2="980" y2="1360" stroke="#cdd2d6" strokeWidth="3" />
        <path d="M120 1300 C340 1300 380 800 600 720 C800 648 840 580 980 560" fill="none" stroke="#c4141d" strokeWidth="9" strokeLinecap="round" strokeDasharray={L} strokeDashoffset={L * (1 - draw)} />
        {splits.map((s, i) => <circle key={i} cx={s[0]} cy={s[1]} r="15" fill="#16161b" opacity={clamp(draw * 1.6 - i * 0.35, 0, 1)} />)}
      </svg>
      <div style={{ position: "absolute", left: 64, right: 64, top: 1430, fontFamily: '"JetBrains Mono", monospace', color: "#777", fontSize: 30, letterSpacing: "0.05em", opacity: head }}>0–10 YD EXPLOSIVE · 10–40 TOP SPEED</div>
    </div>
  );
  return (
    <Stage width={VW} height={VH} duration={5} background="#eef0f2">
      {scene}
    </Stage>
  );
}
window.SprintCurveLight = SprintCurveLight;
