// StarCardLight — generated VIDEO example (self-contained Stage; fallback runtime).
const VW = 1080, VH = 1920;
function StarCardLight() {
  const t = useTime();
  const ce = (start, dur = 0.5) => Easing.easeOutCubic(clamp((t - start) / dur, 0, 1));
  const eb = ce(0.1, 0.3);
  const star = '<path d="M46 12 l10 22 24 3 -18 17 5 24 -21 -12 -21 12 5 -24 -18 -17 24 -3 z"/>';
  const stars = Array.from({ length: 5 }, (_, i) => {
    const g = clamp((t - (0.5 + i * 0.18)) / 0.3, 0, 1);
    return <svg key={i} width="120" height="120" viewBox="0 0 92 92" style={{ opacity: g, transform: "scale(" + (0.6 + 0.4 * g) + ")" }}><path d="M46 12 l10 22 24 3 -18 17 5 24 -21 -12 -21 12 5 -24 -18 -17 24 -3 z" fill="#e0a526" /></svg>;
  });
  const q = ce(1.6, 0.5);
  const by = ce(2.4, 0.4);
  void star;
  const scene = (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 84px" }}>
      <div style={{ display: "flex", gap: 6, opacity: eb, marginBottom: 36 }}>{stars}</div>
      <div style={{ fontFamily: "Anton, sans-serif", color: "#16161b", fontSize: 92, lineHeight: 1.02, textTransform: "uppercase", opacity: q, transform: "translateY(" + ((1 - q) * 16) + "px)" }}>"My son finally believes he belongs on the field."</div>
      <div style={{ width: 96, height: 8, background: "#c4141d", margin: "40px 0 22px", opacity: by }} />
      <div style={{ fontFamily: "Geist, sans-serif", color: "#444", fontSize: 42, fontWeight: 700, opacity: by }}>Jenna M. · soccer mom, Carmel</div>
    </div>
  );
  return (
    <Stage width={VW} height={VH} duration={5} background="#f3f1ee">
      {scene}
    </Stage>
  );
}
window.StarCardLight = StarCardLight;
