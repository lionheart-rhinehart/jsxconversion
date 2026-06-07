// metric-reveal — generated example. Distinct layout family (squint test).
export default function Example() {
  return (
    <div style={{ width: 1080, height: 1920, position: "relative", overflow: "hidden", background: "#0d0d12" }}>
      <div style={{ position: "absolute", left: 64, top: 120, right: 64, textAlign: "center" }}>
        <div style={{ fontFamily: "JetBrains Mono", color: "#c4141d", fontSize: 32, letterSpacing: "0.12em", fontWeight: 700 }}>ON-TIME TO GOAL</div>
      </div>
      <svg viewBox="0 0 720 720" style={{ position: "absolute", left: "50%", top: 470, width: 720, transform: "translateX(-50%)" }}>
        <circle cx="360" cy="360" r="300" stroke="#22222a" stroke-width="56" fill="none"/>
        <circle cx="360" cy="360" r="300" stroke="#c4141d" stroke-width="56" fill="none" stroke-linecap="round" stroke-dasharray="1696 1885" transform="rotate(-90 360 360)"/>
        <text x="360" y="360" text-anchor="middle" dominant-baseline="central" font-family="Anton" font-size="240" fill="#fff">90%</text>
      </svg>
      <div style={{ position: "absolute", left: 64, right: 64, bottom: 150, textAlign: "center" }}>
        <div style={{ fontFamily: "Anton", color: "#fff", fontSize: 70, textTransform: "uppercase", lineHeight: 0.96 }}>Hit their target<br/>by day 90</div>
      </div>
    </div>
  );
}
