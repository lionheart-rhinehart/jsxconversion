// StarBigRed — generated VIDEO example (self-contained Stage; fallback runtime).
const VW = 1080, VH = 1920;
function StarBigRed() {
  const t = useTime();
  const ce = (start, dur = 0.5) => Easing.easeOutCubic(clamp((t - start) / dur, 0, 1));
  const eb = ce(0.1, 0.3);
  const draw = ce(0.5, 1.1);
  const rating = (5 * ce(0.7, 1.2)).toFixed(1);
  const q = ce(2.0, 0.5);
  const scene = (
    <div style={{ position: "absolute", inset: 0 }}>
      <svg viewBox="0 0 92 92" style={{ position: "absolute", left: "50%", top: 360, width: 620, transform: "translateX(-50%)" }}>
        <path d="M46 10 l11 24 26 3 -19.5 18 5.5 26 -23 -13 -23 13 5.5 -26 -19.5 -18 26 -3 z" fill="none" stroke="#fff" strokeWidth="3" strokeDasharray="320" strokeDashoffset={320 * (1 - draw)} />
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: 600, textAlign: "center", fontFamily: "Anton, sans-serif", color: "#fff", fontSize: 200, opacity: eb }}>{rating}</div>
      <div style={{ position: "absolute", left: 80, right: 80, top: 980, textAlign: "center", fontFamily: "Anton, sans-serif", color: "#fff", fontSize: 76, lineHeight: 1.04, textTransform: "uppercase", opacity: q }}>"Best decision we've made for her training."</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1320, textAlign: "center", fontFamily: '"JetBrains Mono", monospace', color: "#ffd2d4", fontSize: 30, letterSpacing: "0.1em", opacity: q }}>200+ FIVE-STAR REVIEWS</div>
    </div>
  );
  return (
    <Stage width={VW} height={VH} duration={5} background="#c4141d">
      {scene}
    </Stage>
  );
}
window.StarBigRed = StarBigRed;
