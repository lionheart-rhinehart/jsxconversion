export default function Chrome() {
  return (
    <div style={{ width: 1080, height: 1920, position: "relative", overflow: "hidden", background: "#f1efec" }}>
      <div style={{ position: "absolute", left: 64, right: 64, top: 150 }}>
        <div style={{ fontFamily: '"JetBrains Mono", monospace', color: "#c4141d", fontSize: 30, letterSpacing: "0.1em", fontWeight: 700, marginBottom: 18 }}>SMALL-GROUP COACHING</div>
        <div style={{ fontFamily: "Anton, sans-serif", color: "#16161b", fontSize: 120, lineHeight: 0.9, textTransform: "uppercase" }}>Every athlete<br/>gets seen</div>
      </div>
            <div style={{ position: "absolute", left: 64, top: 660, width: 952, height: 560, borderRadius: 24, background: "#00ff00" }} />
      <div style={{ position: "absolute", left: 64, right: 64, top: 1280 }}>
        <div style={{ width: 96, height: 8, background: "#c4141d", marginBottom: 22 }} />
        <div style={{ fontFamily: "Geist, sans-serif", color: "#444", fontSize: 40, fontWeight: 600, lineHeight: 1.3 }}>No more than eight athletes to a coach, every session.</div>
      </div>
    </div>
  );
}
