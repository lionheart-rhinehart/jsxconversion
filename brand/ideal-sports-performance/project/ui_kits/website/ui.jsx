/* global React */
// Shared primitives for the ISP website UI kit
const { useState, useEffect, useRef } = React;

// Lucide icon — renders an <i data-lucide> and re-inits the icon set
function Icon({ name, size = 22, color, strokeWidth = 2, style }) {
  const ref = useRef(null);
  useEffect(() => {
    if (window.lucide && ref.current) {
      ref.current.innerHTML = "";
      const el = document.createElement("i");
      el.setAttribute("data-lucide", name);
      ref.current.appendChild(el);
      window.lucide.createIcons({
        attrs: { width: size, height: size, "stroke-width": strokeWidth },
        nameAttr: "data-lucide",
      });
    }
  }, [name, size, strokeWidth]);
  return (
    <span
      ref={ref}
      style={{ display: "inline-flex", color: color || "currentColor", lineHeight: 0, ...style }}
    />
  );
}

function Button({ variant = "primary", size = "md", children, iconRight, onClick, style, type }) {
  const [hover, setHover] = useState(false);
  const [down, setDown] = useState(false);
  const base = {
    fontFamily: "var(--font-body)",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: ".04em",
    border: 0,
    borderRadius: "var(--radius-pill)",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    whiteSpace: "nowrap",
    transition: "all var(--dur) var(--ease)",
    transform: down ? "scale(.97)" : hover ? "translateY(-2px)" : "none",
    padding: size === "sm" ? "9px 18px" : size === "lg" ? "16px 34px" : "13px 26px",
    fontSize: size === "sm" ? 13 : size === "lg" ? 16 : 14.5,
  };
  const variants = {
    primary: {
      background: hover ? "var(--isp-blue-700)" : "var(--isp-blue)",
      color: "#fff",
      boxShadow: down ? "none" : "var(--shadow-blue)",
    },
    secondary: { background: hover ? "#000" : "var(--ink)", color: "#fff" },
    ghost: {
      background: hover ? "var(--isp-blue)" : "transparent",
      color: hover ? "#fff" : "var(--isp-blue)",
      border: "2px solid var(--isp-blue)",
      padding: size === "lg" ? "14px 32px" : "11px 24px",
    },
    light: { background: "rgba(255,255,255,.14)", color: "#fff", backdropFilter: "blur(4px)" },
  };
  return (
    <button
      type={type || "button"}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setDown(false); }}
      onMouseDown={() => setDown(true)}
      onMouseUp={() => setDown(false)}
      style={{ ...base, ...variants[variant], ...style }}
    >
      {children}
      {iconRight && <Icon name={iconRight} size={size === "lg" ? 20 : 17} />}
    </button>
  );
}

function Eyebrow({ children, light, style }) {
  return (
    <span
      style={{
        font: "var(--eyebrow)",
        textTransform: "uppercase",
        letterSpacing: ".18em",
        color: light ? "var(--isp-blue-300)" : "var(--isp-blue)",
        display: "inline-flex",
        alignItems: "center",
        gap: ".6em",
        ...style,
      }}
    >
      <span style={{ width: 28, height: 2, background: "currentColor", display: "inline-block" }} />
      {children}
    </span>
  );
}

Object.assign(window, { Icon, Button, Eyebrow });
