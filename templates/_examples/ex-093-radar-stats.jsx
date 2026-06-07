// RadarHexDark — generated VIDEO example (self-contained Stage; fallback runtime).
const VW = 1080, VH = 1920;
function RadarHexDark() {
  const t = useTime();
  const ce = (start, dur = 0.5) => Easing.easeOutCubic(clamp((t - start) / dur, 0, 1));
  const eb = ce(0.1, 0.3);
  const N = 6, cx = 540, cy = 1000, R = 380;
  const vals = [0.9, 0.75, 0.82, 0.6, 0.7, 0.88];
  const labels = ["SPEED", "POWER", "AGILITY", "MOBILITY", "STRENGTH", "STAMINA"];
  const pt = (i, r) => { const a = -Math.PI / 2 + i * 2 * Math.PI / N; return [cx + Math.cos(a) * r, cy + Math.sin(a) * r]; };
  const prog = ce(0.5, 1.8) * N;
  const poly = vals.map((v, i) => { const seg = clamp(prog - i, 0, 1); const p = pt(i, R * v * seg); return p[0] + "," + p[1]; }).join(" ");
  const ring1 = vals.map((v, i) => { const p = pt(i, R); return p[0] + "," + p[1]; }).join(" ");
  const ring2 = vals.map((v, i) => { const p = pt(i, R * 0.5); return p[0] + "," + p[1]; }).join(" ");
  const scene = (
    <div style={{ position: "absolute", inset: 0 }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 130, textAlign: "center", fontFamily: '"JetBrains Mono", monospace', color: "#c4141d", fontSize: 32, letterSpacing: "0.14em", fontWeight: 700, opacity: eb }}>SCOUTING REPORT</div>
      <svg viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
        <polygon points={ring1} fill="none" stroke="#23232b" strokeWidth="2" />
        <polygon points={ring2} fill="none" stroke="#23232b" strokeWidth="2" />
        <polygon points={poly} fill="rgba(196,20,29,0.22)" stroke="#c4141d" strokeWidth="6" strokeLinejoin="round" />
        {labels.map((l, i) => { const p = pt(i, R + 56); return <text key={i} x={p[0]} y={p[1]} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="24" fontWeight="700" fill="#cfcfcf" opacity={clamp(prog - i, 0, 1)}>{l}</text>; })}
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1480, textAlign: "center", fontFamily: "Geist, sans-serif", color: "#9a9aa3", fontSize: 40, fontWeight: 600, opacity: ce(2.6, 0.45) }}>Every athlete gets a full workup</div>
    </div>
  );
  return (
    <Stage width={VW} height={VH} duration={5} background="#0a0b0d">
      {scene}
    </Stage>
  );
}
window.RadarHexDark = RadarHexDark;
