// ex-015 — KIND: list-steps. Sequential NUMBERED cards ("3 things…"), each a row with
// a big index + a small image chip + a line. The enumerated stack is the archetype
// signal (editorial, not a photo hero). Plain static React.
export default function Example() {
  const W = 1080, H = 1920;
  const rows = [
    { n: "1", img: "./assets/sprint-male.jpg", t: "Test the athlete first" },
    { n: "2", img: "./assets/lifting.jpg", t: "Build the right strength base" },
    { n: "3", img: "./assets/jump-female.jpg", t: "Re-test and prove the gain" },
  ];
  return (
    <div style={{ width: W, height: H, position: "relative", overflow: "hidden", background: "#101015", padding: "120px 72px", boxSizing: "border-box" }}>
      <div style={{ fontFamily: "Anton", color: "#fff", fontSize: 92, textTransform: "uppercase", lineHeight: 0.95, marginBottom: 60 }}>3 steps to a<br/><span style={{ color: "#c4141d" }}>faster fall season</span></div>
      {rows.map((r, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 28, marginBottom: 44 }}>
          <div style={{ fontFamily: "Anton", color: "#c4141d", fontSize: 130, lineHeight: 1, width: 110 }}>{r.n}</div>
          <div style={{ width: 150, height: 150, borderRadius: 14, overflow: "hidden", flexShrink: 0 }}>
            <img src={r.img} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <div style={{ fontFamily: "Geist", color: "#fff", fontSize: 42, fontWeight: 600 }}>{r.t}</div>
        </div>
      ))}
    </div>
  );
}
