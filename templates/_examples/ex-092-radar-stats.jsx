// RadarPentaLight — generated VIDEO example (self-contained Stage; fallback runtime).
const VW = 1080, VH = 1920;
function RadarPentaLight() {
  const t = useTime();
  const ce = (start, dur = 0.5) => Easing.easeOutCubic(clamp((t - start) / dur, 0, 1));
  const eb = ce(0.1, 0.3);
  const draw = ce(0.5, 1.6);
  const head = ce(2.2, 0.45);
  const N = 5, cx = 540, cy = 1180, R = 360;
  const vals = [0.92, 0.68, 0.85, 0.6, 0.8];
  const labels = ["SPEED", "POWER", "AGILITY", "STRENGTH", "STAMINA"];
  const pt = (i, r) => { const a = -Math.PI / 2 + i * 2 * Math.PI / N; return [cx + Math.cos(a) * r, cy + Math.sin(a) * r]; };
  const poly = vals.map((v, i) => { const p = pt(i, R * v * draw); return p[0] + "," + p[1]; }).join(" ");
  const ring = vals.map((v, i) => { const p = pt(i, R); return p[0] + "," + p[1]; }).join(" ");
  const scene = (
    <div style={{ position: "absolute", inset: 0 }}>
      <div style={{ position: "absolute", left: 64, top: 150, fontFamily: '"JetBrains Mono", monospace', color: "#c4141d", fontSize: 32, letterSpacing: "0.12em", fontWeight: 700, opacity: eb }}>ATHLETE PROFILE</div>
      <div style={{ position: "absolute", left: 64, top: 196, fontFamily: "Anton, sans-serif", color: "#16161b", fontSize: 96, textTransform: "uppercase", lineHeight: 0.9, opacity: eb }}>The full<br/>picture</div>
      <svg viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
        <polygon points={ring} fill="none" stroke="#cdd2d6" strokeWidth="2" />
        <polygon points={poly} fill="rgba(196,20,29,0.16)" stroke="#c4141d" strokeWidth="6" strokeLinejoin="round" />
        {labels.map((l, i) => { const p = pt(i, R + 54); return <text key={i} x={p[0]} y={p[1]} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="26" fontWeight="700" fill="#16161b" opacity={head}>{l}</text>; })}
      </svg>
    </div>
  );
  return (
    <Stage width={VW} height={VH} duration={5} background="#eef0f2">
      {scene}
    </Stage>
  );
}
window.RadarPentaLight = RadarPentaLight;
