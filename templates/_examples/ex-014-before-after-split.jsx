// before-after-split — generated example. Distinct layout family (squint test).
export default function Example() {
  return (
    <div style={{ width: 1080, height: 1920, position: "relative", overflow: "hidden", background: "#000" }}>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column" }}>
        <div style={{ position: "relative", height: "50%", overflow: "hidden" }}>      <img src="./assets/ex-014-before-after-split-0.jpg" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: "grayscale(1) contrast(1.05)" }} />
          <div style={{ position: "absolute", inset: 0, background: "rgba(10,10,14,0.4)" }} />
          <div style={{ position: "absolute", right: 44, bottom: 36, fontFamily: "Anton", color: "rgba(255,255,255,0.9)", fontSize: 64, textTransform: "uppercase" }}>BEFORE</div>
        </div>
        <div style={{ position: "relative", height: "50%", overflow: "hidden" }}>      <img src="./assets/ex-014-before-after-split-1.jpg" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
          <div style={{ position: "absolute", left: 44, top: 36, fontFamily: "Anton", color: "#fff", fontSize: 64, textTransform: "uppercase" }}>AFTER</div>
        </div>
      </div>
      <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)", background: "#c4141d", color: "#fff", fontFamily: "Anton", fontSize: 88, padding: "10px 40px", borderRadius: 14, textShadow: "0 2px 8px rgba(0,0,0,0.4)" }}>+3" VERT</div>
    </div>
  );
}
