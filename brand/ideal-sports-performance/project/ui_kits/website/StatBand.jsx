/* global React */
function StatBand() {
  const stats = [
    { num: "+6", unit: "mph", label: "Avg velocity gain" },
    { num: "12", unit: "wk", label: "Throwing plan cycle" },
    { num: "300", unit: "+", label: "Athletes coached" },
    { num: "1st", unit: "", label: "Class always free" },
  ];
  return (
    <section style={{ background: "var(--ink)", padding: "var(--space-8) 28px" }}>
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 24,
        }}
      >
        {stats.map((s, i) => (
          <div key={i} style={{ textAlign: "center", borderLeft: i ? "1px solid rgba(255,255,255,.1)" : "none" }}>
            <div style={{ font: "var(--stat)", color: "#fff", fontVariantNumeric: "tabular-nums", lineHeight: ".85" }}>
              {s.num}
              {s.unit && <span style={{ fontSize: "0.5em", color: "var(--isp-blue-300)" }}>{s.unit}</span>}
            </div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".1em", fontSize: 13, color: "var(--fg-on-dark-muted)", marginTop: 10 }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
Object.assign(window, { StatBand });
