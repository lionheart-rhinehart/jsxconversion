// MetricRingReveal — generated VIDEO example (self-contained Stage; fallback runtime).
const VW = 1080, VH = 1920;
function MetricRingReveal() {
  const t = useTime();
  const ce = (start, dur = 0.5) => Easing.easeOutCubic(clamp((t - start) / dur, 0, 1));
  const R = 300, C = 2 * Math.PI * R, TARGET = 0.9;
  const eb = ce(0.1, 0.3);
  const sweep = TARGET * ce(0.5, 1.4);          // ring fills 0 -> 90%
  const dash = (C * sweep).toFixed(1) + " " + C.toFixed(1);
  const val = Math.round(100 * sweep);          // center counter 0 -> 90
  const head = ce(2.4, 0.5);
  const scene = (
    <div style={{ position: "absolute", inset: 0 }}>
      <div style={{ position: "absolute", left: 64, right: 64, top: 120, textAlign: "center", fontFamily: '"JetBrains Mono", monospace', color: "#c4141d", fontSize: 32, letterSpacing: "0.12em", fontWeight: 700, opacity: eb }}>ON-TIME TO GOAL</div>
      <svg viewBox="0 0 720 720" style={{ position: "absolute", left: "50%", top: 470, width: 720, transform: "translateX(-50%)" }}>
        <circle cx="360" cy="360" r={R} stroke="#22222a" strokeWidth="56" fill="none" />
        <circle cx="360" cy="360" r={R} stroke="#c4141d" strokeWidth="56" fill="none" strokeLinecap="round" strokeDasharray={dash} transform="rotate(-90 360 360)" />
        <text x="360" y="360" textAnchor="middle" dominantBaseline="central" fontFamily="Anton, sans-serif" fontSize="240" fill="#fff">{val}%</text>
      </svg>
      <div style={{ position: "absolute", left: 64, right: 64, bottom: 150, textAlign: "center", fontFamily: "Anton, sans-serif", color: "#fff", fontSize: 70, textTransform: "uppercase", lineHeight: 0.96, opacity: head, transform: "translateY(" + ((1 - head) * 16) + "px)" }}>Hit their target<br/>by day 90</div>
    </div>
  );
  return (
    <Stage width={VW} height={VH} duration={4} background="#0d0d12">
      {scene}
    </Stage>
  );
}
window.MetricRingReveal = MetricRingReveal;
