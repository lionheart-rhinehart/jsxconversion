export default function Chrome() {
  return (
    <div style={{ width: 1080, height: 1920, position: "relative", overflow: "hidden", background: "#00ff00" }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 957, background: "#00ff00" }} />
            <div style={{ position: "absolute", left: 0, top: 963, width: 1080, height: 957, background: "#00ff00" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 957, height: 6, background: "#c4141d" }} />
      <div style={{ position: "absolute", left: 48, top: 40, fontFamily: '"JetBrains Mono", monospace', color: "#fff", fontSize: 36, fontWeight: 700, letterSpacing: "0.08em", background: "rgba(0,0,0,0.55)", padding: "8px 18px" }}>WEEK 1</div>
      <div style={{ position: "absolute", left: 48, top: 1003, fontFamily: '"JetBrains Mono", monospace', color: "#fff", fontSize: 36, fontWeight: 700, letterSpacing: "0.08em", background: "rgba(196,20,29,0.95)", padding: "8px 18px" }}>WEEK 12</div>
      <div style={{ position: "absolute", left: "50%", top: 957, transform: "translate(-50%,-50%)", background: "#0a0a0a", color: "#fff", fontFamily: "Anton, sans-serif", fontSize: 96, padding: "8px 34px" }}>+1 MPH</div>
    </div>
  );
}
