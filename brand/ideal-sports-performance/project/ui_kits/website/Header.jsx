/* global React, Button, Icon */
const { useState: useStateHdr, useEffect: useEffectHdr } = React;

const ISP_NAV = [
  { label: "Baseball", id: "baseball" },
  { label: "Sports", id: "sports" },
  { label: "Adult Training", id: "adult" },
  { label: "Contact", id: "contact" },
];

function Header({ onNav, active }) {
  const [scrolled, setScrolled] = useStateHdr(false);
  const [open, setOpen] = useStateHdr(false);
  useEffectHdr(() => {
    const root = document.getElementById("isp-scroll") || window;
    const onScroll = () => {
      const y = root === window ? window.scrollY : root.scrollTop;
      setScrolled(y > 24);
    };
    root.addEventListener("scroll", onScroll);
    return () => root.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: scrolled ? "rgba(255,255,255,.88)" : "rgba(255,255,255,1)",
        backdropFilter: scrolled ? "blur(10px)" : "none",
        borderBottom: `1px solid ${scrolled ? "var(--border)" : "transparent"}`,
        transition: "all var(--dur) var(--ease)",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "12px 28px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 20,
        }}
      >
        <a href="#" onClick={(e) => { e.preventDefault(); onNav("home"); }} style={{ display: "flex" }}>
          <img src="../../assets/logo-full.png" alt="Ideal Sports Performance" style={{ height: 46 }} />
        </a>

        <nav style={{ display: "flex", alignItems: "center", gap: 4 }} className="isp-desktop-nav">
          {ISP_NAV.map((n) => (
            <a
              key={n.id}
              href={`#${n.id}`}
              onClick={(e) => { e.preventDefault(); onNav(n.id); }}
              style={{
                font: "var(--label)",
                textTransform: "uppercase",
                letterSpacing: ".06em",
                color: active === n.id ? "var(--isp-blue)" : "var(--ink)",
                textDecoration: "none",
                padding: "10px 14px",
                borderRadius: 8,
              }}
            >
              {n.label}
            </a>
          ))}
          <Button size="sm" iconRight="arrow-right" onClick={() => onNav("contact")} style={{ marginLeft: 8 }}>
            Try ISP Free
          </Button>
        </nav>

        <button
          className="isp-burger"
          onClick={() => setOpen((o) => !o)}
          style={{ display: "none", background: "none", border: 0, cursor: "pointer", color: "var(--ink)" }}
          aria-label="Menu"
        >
          <Icon name={open ? "x" : "menu"} size={26} />
        </button>
      </div>

      {open && (
        <div style={{ padding: "8px 28px 18px", borderTop: "1px solid var(--border)" }} className="isp-mobile-nav">
          {ISP_NAV.map((n) => (
            <a
              key={n.id}
              href={`#${n.id}`}
              onClick={(e) => { e.preventDefault(); onNav(n.id); setOpen(false); }}
              style={{
                display: "block",
                font: "var(--h4)",
                textTransform: "uppercase",
                color: "var(--ink)",
                textDecoration: "none",
                padding: "12px 4px",
                borderBottom: "1px solid var(--border)",
              }}
            >
              {n.label}
            </a>
          ))}
          <Button onClick={() => { onNav("contact"); setOpen(false); }} style={{ marginTop: 14, width: "100%", justifyContent: "center" }}>
            Try ISP Free
          </Button>
        </div>
      )}
    </header>
  );
}

Object.assign(window, { Header, ISP_NAV });
