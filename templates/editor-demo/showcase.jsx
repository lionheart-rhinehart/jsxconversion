// Demo template for trying the detached editor. Config-driven so the editor
// preview and the rendered PNG match. Self-contained (no _helpers, no fonts).
import config from "./showcase.config.json";

export const WIDTH = config.width;
export const HEIGHT = config.height;

function Showcase() {
  return (
    <div style={{ width: config.width, height: config.height, position: "relative", background: "#0a0b0d", overflow: "hidden" }}>
      <img src="./assets/photo.jpg" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(10,11,13,0.15) 40%, rgba(10,11,13,0.85) 100%)" }} />
      {(config.elements || []).map((el) => (
        <div key={el.id} style={{
          position: "absolute", left: el.x, top: el.y, color: el.color,
          fontSize: el.fontSize, fontWeight: el.fontWeight, lineHeight: el.lineHeight || 1.1,
          textShadow: "0 2px 14px rgba(0,0,0,0.9)", maxWidth: 940,
          transform: el.rotate ? ("rotate(" + el.rotate + "deg)") : undefined,
          transformOrigin: "center center",
        }}>{el.text}</div>
      ))}
    </div>
  );
}

export default Showcase;
