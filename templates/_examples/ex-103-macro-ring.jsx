// MacroLegendDark — generated VIDEO example (self-contained Stage; fallback runtime).
const VW = 1080, VH = 1920;
function MacroLegendDark() {
  const t = useTime();
  const ce = (start, dur = 0.5) => Easing.easeOutCubic(clamp((t - start) / dur, 0, 1));
  const eb = ce(0.1, 0.3);
  const sweep = ce(0.5, 1.8);
  const R = 300, C = 2 * Math.PI * R;
  const segs = [[0.45, "#c4141d", "PROTEIN"], [0.33, "#e0a526", "CARBS"], [0.22, "#3a7d44", "FATS"]];
  let acc = 0;
  const head = ce(2.2, 0.45);
  const scene = (
    <div style={{ position: "absolute", inset: 0 }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 150, textAlign: "center", fontFamily: '"JetBrains Mono", monospace', color: "#c4141d", fontSize: 32, letterSpacing: "0.14em", fontWeight: 700, opacity: eb }}>DAILY MACROS</div>
      <svg viewBox="0 0 800 800" style={{ position: "absolute", left: "50%", top: 380, width: 700, transform: "translateX(-50%)" }}>
        <circle cx="400" cy="400" r={R} stroke="#1a1a22" strokeWidth="60" fill="none" />
        {segs.map((s, i) => { const start = acc; acc += s[0]; return <circle key={i} cx="400" cy="400" r={R} stroke={s[1]} strokeWidth="60" fill="none" strokeDasharray={(C * s[0] * sweep).toFixed(1) + " " + C.toFixed(1)} strokeDashoffset={(-C * start * sweep).toFixed(1)} transform="rotate(-90 400 400)" />; })}
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1180, display: "flex", justifyContent: "center", gap: 40, opacity: head }}>
        {segs.map((s, i) => <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}><div style={{ width: 26, height: 26, borderRadius: 6, background: s[1] }} /><div style={{ fontFamily: '"JetBrains Mono", monospace', color: "#cfcfcf", fontSize: 30, fontWeight: 700 }}>{s[2]}</div></div>)}
      </div>
    </div>
  );
  return (
    <Stage width={VW} height={VH} duration={5} background="#0c0c11">
      {scene}
    </Stage>
  );
}
window.MacroLegendDark = MacroLegendDark;
