/* global React, Icon */
function Footer({ onNav }) {
  return (
    <footer style={{ background: "var(--ink)", color: "#fff", padding: "var(--space-8) 28px var(--space-6)" }}>
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "1.4fr 1fr 1fr",
          gap: 40,
          alignItems: "start",
        }}
        className="isp-footer-grid"
      >
        <div>
          <img src="../../assets/logo-on-dark.png" alt="Ideal Sports Performance & Fitness" style={{ height: 56, marginBottom: 16 }} />
          <p style={{ font: "var(--body-sm)", color: "var(--fg-on-dark-muted)", maxWidth: 320, margin: 0 }}>
            Premier performance training facility in Fort Worth, TX. Coached, individualized programs that build velocity, speed and durability.
          </p>
          <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
            {[
              ["instagram", <svg key="ig" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="#fff" stroke="none" /></svg>],
              ["facebook", <svg key="fb" width="18" height="18" viewBox="0 0 24 24" fill="#fff" stroke="none"><path d="M14 9h3l.4-3H14V4.3c0-.8.3-1.3 1.5-1.3H17V.2C16.6.1 15.6 0 14.5 0 12 0 10.3 1.5 10.3 4v2H7.5v3h2.8v9H14V9z" /></svg>],
              ["map-pin", <Icon key="mp" name="map-pin" size={18} color="#fff" />],
            ].map(([key, node]) => (
              <span key={key} style={{ width: 40, height: 40, borderRadius: 999, background: "rgba(255,255,255,.08)", display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                {node}
              </span>
            ))}
          </div>
        </div>

        <div>
          <h4 style={{ font: "var(--h4)", textTransform: "uppercase", color: "#fff", margin: "0 0 14px" }}>Programs</h4>
          {[["Baseball Performance", "baseball"], ["Sports Performance", "sports"], ["Adult Training", "adult"]].map(([t, id]) => (
            <a key={id} href={`#${id}`} onClick={(e) => { e.preventDefault(); onNav(id); }} style={{ display: "block", color: "var(--fg-on-dark-muted)", textDecoration: "none", fontSize: 14, padding: "6px 0" }}>{t}</a>
          ))}
        </div>

        <div>
          <h4 style={{ font: "var(--h4)", textTransform: "uppercase", color: "#fff", margin: "0 0 14px" }}>Visit</h4>
          <div style={{ color: "var(--fg-on-dark-muted)", fontSize: 14, lineHeight: 1.7 }}>
            3800 Southwest Blvd<br />Fort Worth, TX 76116<br />1 (817) 301‑5644
          </div>
        </div>
      </div>
      <div style={{ maxWidth: 1200, margin: "0 auto", borderTop: "1px solid rgba(255,255,255,.1)", marginTop: 36, paddingTop: 20, display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <span style={{ font: "var(--caption)", color: "rgba(255,255,255,.45)", textTransform: "uppercase", letterSpacing: ".08em" }}>© 2026 Ideal Sports Performance & Fitness</span>
        <span style={{ font: "var(--caption)", color: "rgba(255,255,255,.45)", textTransform: "uppercase", letterSpacing: ".08em" }}>Privacy Policy</span>
      </div>
    </footer>
  );
}
Object.assign(window, { Footer });
