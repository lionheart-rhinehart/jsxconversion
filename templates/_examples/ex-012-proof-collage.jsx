// ex-012 — KIND: proof-collage. Grid/mosaic of faces + a star rating + short quotes.
// The MOSAIC of multiple stills is the archetype signal (vs one hero image). Plain static React.
export default function Example() {
  const W = 1080, H = 1920;
  const photos = ["./assets/jump-female.jpg", "./assets/sprint-male.jpg", "./assets/agility-female.jpg", "./assets/box-jump.jpg"];
  return (
    <div style={{ width: W, height: H, position: "relative", overflow: "hidden", background: "#0c0c0c", padding: 40, boxSizing: "border-box" }}>
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div style={{ fontFamily: "JetBrains Mono", color: "#ffb300", fontSize: 52, letterSpacing: "0.2em" }}>★★★★★</div>
        <div style={{ fontFamily: "Anton", color: "#fff", fontSize: 64, textTransform: "uppercase", marginTop: 8 }}>Parents are talking</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gridGap: 16 }}>
        {photos.map((p, i) => (
          <div key={i} style={{ position: "relative", height: 440, borderRadius: 14, overflow: "hidden" }}>
            <img src={p} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
            <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "16px 14px", background: "linear-gradient(0deg, rgba(0,0,0,0.85), rgba(0,0,0,0))", fontFamily: "Geist", color: "#fff", fontSize: 24, fontWeight: 600 }}>"Best decision we made this year."</div>
          </div>
        ))}
      </div>
    </div>
  );
}
