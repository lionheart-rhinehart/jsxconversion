import React from "react";
import { Card } from "./Card.jsx";

function ensureStyles(id, css) {
  if (typeof document === "undefined" || document.getElementById(id)) return;
  const el = document.createElement("style");
  el.id = id;
  el.textContent = css;
  document.head.appendChild(el);
}

const CSS = `
.ps-prog{display:flex;flex-direction:column;gap:14px;min-height:100%;}
.ps-prog__top{display:flex;align-items:center;justify-content:space-between;gap:12px;}
.ps-prog__icon{
  width:52px;height:52px;border-radius:var(--radius-md);
  display:flex;align-items:center;justify-content:center;
  background:var(--electric-500);color:#fff;flex:none;
}
.ps-prog--bolt .ps-prog__icon{background:var(--bolt-400);color:var(--ink-950);}
.ps-prog__icon svg, .ps-prog__icon i{width:26px;height:26px;}
.ps-prog__meta{
  font-family:var(--font-mono);font-size:11px;letter-spacing:.1em;text-transform:uppercase;
  color:var(--text-muted);
}
.ps-prog__title{
  font-family:var(--font-display);font-weight:var(--fw-extrabold);
  text-transform:uppercase;letter-spacing:-.005em;line-height:1;
  font-size:26px;color:var(--text-strong);
}
.ps-prog__desc{font-family:var(--font-body);font-size:14px;line-height:1.5;color:var(--text-body);flex:1;}
.ps-prog__cta{
  display:inline-flex;align-items:center;gap:8px;align-self:flex-start;
  font-family:var(--font-heading);font-weight:var(--fw-bold);
  text-transform:uppercase;letter-spacing:.06em;font-size:13px;
  color:var(--electric-300);
}
.ps-prog--bolt .ps-prog__cta{color:var(--bolt-300);}
.ps-prog__cta .arr{transition:transform var(--dur-fast) var(--ease-out);}
.ps-card--interactive:hover .ps-prog__cta .arr{transform:translateX(4px);}
`;

export function ProgramCard({
  title,
  description,
  meta = null,
  icon = null,
  cta = "Learn More",
  accent = "electric",
  onClick,
  className = "",
  ...rest
}) {
  ensureStyles("ps-prog-styles", CSS);
  return (
    <Card
      interactive
      accent={accent}
      onClick={onClick}
      className={`${accent === "bolt" ? "ps-prog--bolt" : ""} ${className}`}
      {...rest}
    >
      <div className="ps-prog">
        <div className="ps-prog__top">
          <div className="ps-prog__icon">{icon}</div>
          {meta && <span className="ps-prog__meta">{meta}</span>}
        </div>
        <div className="ps-prog__title">{title}</div>
        <div className="ps-prog__desc">{description}</div>
        <span className="ps-prog__cta">{cta} <span className="arr">→</span></span>
      </div>
    </Card>
  );
}
