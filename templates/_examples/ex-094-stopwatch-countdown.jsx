// StopwatchArcLight — generated VIDEO example (self-contained Stage; fallback runtime).
const VW = 1080, VH = 1920;
function StopwatchArcLight() {
  const t = useTime();
  const ce = (start, dur = 0.5) => Easing.easeOutCubic(clamp((t - start) / dur, 0, 1));
  const eb = ce(0.1, 0.3);
  const R = 320, C = 2 * Math.PI * R;
  const sweep = ce(0.5, 2.2);
  const remain = (10 - Math.round(10 * sweep)).toString().padStart(2, "0");
  const head = ce(2.4, 0.45);
  const scene = (
    <div style={{ position: "absolute", inset: 0 }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 180, textAlign: "center", fontFamily: '"JetBrains Mono", monospace', color: "#c4141d", fontSize: 36, letterSpacing: "0.16em", fontWeight: 700, opacity: eb }}>REST CLOCK</div>
      <svg viewBox="0 0 800 800" style={{ position: "absolute", left: "50%", top: 480, width: 760, transform: "translateX(-50%)" }}>
        <circle cx="400" cy="400" r={R} stroke="#dcd9d3" strokeWidth="36" fill="none" />
        <circle cx="400" cy="400" r={R} stroke="#c4141d" strokeWidth="36" fill="none" strokeLinecap="round" strokeDasharray={(C * sweep).toFixed(1) + " " + C.toFixed(1)} transform="rotate(-90 400 400)" />
        <text x="400" y="400" textAnchor="middle" dominantBaseline="central" fontFamily="JetBrains Mono, monospace" fontWeight="800" fontSize="280" fill="#16161b">:{remain}</text>
      </svg>
      <div style={{ position: "absolute", left: 80, right: 80, top: 1330, textAlign: "center", fontFamily: "Geist, sans-serif", color: "#444", fontSize: 44, fontWeight: 600, opacity: head }}>Full rest is part of the program</div>
    </div>
  );
  return (
    <Stage width={VW} height={VH} duration={5} background="#f1efec">
      {scene}
    </Stage>
  );
}
window.StopwatchArcLight = StopwatchArcLight;
