// ListChecklist — generated VIDEO example (self-contained Stage; fallback runtime).
const VW = 1080, VH = 1920;
function ListChecklist() {
  const t = useTime();
  const ce = (start, dur = 0.5) => Easing.easeOutCubic(clamp((t - start) / dur, 0, 1));
  const items = ["A real test on day one", "Coaches who know your sport", "A guarantee in writing"];
  const eb = ce(0.1, 0.3);
  const rows = items.map((s, i) => {
    const g = ce(0.6 + i * 0.5, 0.4);
    return <div key={i} style={{ display: "flex", alignItems: "center", gap: 24, marginBottom: 36, opacity: g }}>
      <svg width="78" height="78" viewBox="0 0 92 92"><rect width="92" height="92" rx="20" fill="rgba(255,255,255,0.16)" /><path d="M28 48 l12 12 l24 -28" stroke="#fff" strokeWidth="8" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="70" strokeDashoffset={70 * (1 - g)} /></svg>
      <div style={{ fontFamily: "Geist, sans-serif", color: "#fff", fontSize: 46, fontWeight: 600 }}>{s}</div>
    </div>;
  });
  const scene = (
    <div style={{ position: "absolute", inset: 0, padding: "130px 70px", boxSizing: "border-box" }}>
      <div style={{ fontFamily: "Anton, sans-serif", color: "#fff", fontSize: 100, textTransform: "uppercase", lineHeight: 0.92, marginBottom: 70, opacity: eb }}>What you<br/>get</div>
      {rows}
    </div>
  );
  return (
    <Stage width={VW} height={VH} duration={4} background="#c4141d">
      {scene}
    </Stage>
  );
}
window.ListChecklist = ListChecklist;
