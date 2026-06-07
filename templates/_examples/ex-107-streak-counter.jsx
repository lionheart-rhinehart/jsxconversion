// StreakFlameDark — generated VIDEO example (self-contained Stage; fallback runtime).
const VW = 1080, VH = 1920;
function StreakFlameDark() {
  const t = useTime();
  const ce = (start, dur = 0.5) => Easing.easeOutCubic(clamp((t - start) / dur, 0, 1));
  const eb = ce(0.1, 0.3);
  const grow = ce(0.5, 0.7);
  const flick = 0.92 + 0.08 * Math.sin(t * 9);
  const val = Math.round(31 * ce(0.6, 1.4));
  const head = ce(2.2, 0.45);
  const scene = (
    <div style={{ position: "absolute", inset: 0 }}>
      <svg viewBox="0 0 200 280" style={{ position: "absolute", left: "50%", top: 380, width: 560, transform: "translateX(-50%) scaleY(" + (grow * flick) + ")", transformOrigin: "bottom" }}>
        <path d="M100 20 C150 90 170 130 150 190 C140 240 60 240 50 190 C40 150 70 150 70 120 C70 150 95 150 100 110 C105 150 130 150 130 175 C140 130 110 80 100 20 Z" fill="#c4141d" />
        <path d="M100 120 C125 160 130 185 115 215 C108 238 72 238 75 205 C77 180 95 180 95 160 C95 180 105 175 100 120 Z" fill="#f2a23e" />
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: 560, textAlign: "center", fontFamily: "Anton, sans-serif", color: "#fff", fontSize: 200, opacity: eb }}>{val}</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 800, textAlign: "center", fontFamily: '"JetBrains Mono", monospace', color: "#f2a23e", fontSize: 36, letterSpacing: "0.12em", fontWeight: 700, opacity: eb }}>WEEK STREAK</div>
      <div style={{ position: "absolute", left: 80, right: 80, top: 1280, textAlign: "center", fontFamily: "Geist, sans-serif", color: "#cfcfcf", fontSize: 44, fontWeight: 600, opacity: head }}>Consistency is the real cheat code</div>
    </div>
  );
  return (
    <Stage width={VW} height={VH} duration={5} background="#0a0b0d">
      {scene}
    </Stage>
  );
}
window.StreakFlameDark = StreakFlameDark;
