// VeloBarsDark — generated VIDEO example (self-contained Stage; fallback runtime).
const VW = 1080, VH = 1920;
function VeloBarsDark() {
  const t = useTime();
  const ce = (start, dur = 0.5) => Easing.easeOutCubic(clamp((t - start) / dur, 0, 1));
  const eb = ce(0.1, 0.3);
  const target = 0.82;
  const h = target * ce(0.5, 1.6);
  const val = (1.18 * ce(0.6, 1.6)).toFixed(2);
  const head = ce(2.0, 0.45);
  const scene = (
    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: 76, padding: "120px 70px", boxSizing: "border-box" }}>
      <div style={{ position: "relative", width: 220, height: 1180, borderRadius: 24, background: "#16161d", overflow: "hidden", flexShrink: 0 }}>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: "45%", background: "rgba(47,125,58,0.16)" }} />
        <div style={{ position: "absolute", left: 0, right: 0, bottom: "45%", height: "27%", background: "rgba(202,161,42,0.16)" }} />
        <div style={{ position: "absolute", left: 0, right: 0, bottom: "72%", height: "28%", background: "rgba(196,20,29,0.16)" }} />
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: (h * 100) + "%", background: "linear-gradient(to top, #2f7d3a, #caa12a, #c4141d)" }} />
        <div style={{ position: "absolute", left: 0, right: 0, bottom: "82%", height: 6, background: "#fff", opacity: 0.8 }} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", maxWidth: 540 }}>
        <div style={{ fontFamily: '"JetBrains Mono", monospace', color: "#c4141d", fontSize: 32, letterSpacing: "0.14em", fontWeight: 700, opacity: eb, marginBottom: 14 }}>PEAK BAR SPEED</div>
        <div style={{ fontFamily: "Anton, sans-serif", color: "#fff", fontSize: 260, lineHeight: 0.8 }}>{val}</div>
        <div style={{ fontFamily: '"JetBrains Mono", monospace', color: "#9a9aa3", fontSize: 44, letterSpacing: "0.08em", marginTop: 6, opacity: eb }}>METERS / SEC</div>
        <div style={{ fontFamily: "Geist, sans-serif", color: "#cfcfcf", fontSize: 40, fontWeight: 600, marginTop: 30, opacity: head, lineHeight: 1.2 }}>Hit the red zone and the rep is explosive</div>
      </div>
    </div>
  );
  return (
    <Stage width={VW} height={VH} duration={5} background="#0a0b0d">
      {scene}
    </Stage>
  );
}
window.VeloBarsDark = VeloBarsDark;
