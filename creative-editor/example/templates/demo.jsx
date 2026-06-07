import config from "./demo.config.json";
export const WIDTH = config.width;
export const HEIGHT = config.height;
function Demo() {
  return (
    <div style={{ width: config.width, height: config.height, position: "relative", background: "#0a0b0d" }}>
      <img src="./assets/sample.jpg" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      <div style={{ position: "absolute", bottom: 120, left: 60, color: "#fff", fontSize: 96, fontWeight: 800 }}>DEMO</div>
    </div>
  );
}
export default Demo;
