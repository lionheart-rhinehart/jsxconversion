import React from "react";

function ensureStyles(id, css) {
  if (typeof document === "undefined" || document.getElementById(id)) return;
  const el = document.createElement("style");
  el.id = id;
  el.textContent = css;
  document.head.appendChild(el);
}

const CSS = `
.ps-stat{
  position:relative;display:flex;flex-direction:column;gap:6px;
  background:var(--surface-raised);
  border:1px solid var(--border-subtle);
  border-radius:var(--radius-lg);
  padding:22px 22px 20px;
  overflow:hidden;
}
.ps-stat::before{content:"";position:absolute;left:0;top:0;bottom:0;width:var(--bw-3);background:var(--electric-400);}
.ps-stat--bolt::before{background:var(--bolt-400);}
.ps-stat__eyebrow{
  font-family:var(--font-mono);font-weight:var(--fw-bold);
  font-size:11px;letter-spacing:.16em;text-transform:uppercase;
  color:var(--text-muted);
}
.ps-stat__value{
  font-family:var(--font-display);font-weight:var(--fw-black);
  font-size:54px;line-height:.95;color:var(--text-strong);
  font-variant-numeric:tabular-nums;letter-spacing:-.01em;
  display:flex;align-items:baseline;gap:4px;
}
.ps-stat__unit{font-size:26px;color:var(--bolt-400);font-weight:var(--fw-extrabold);}
.ps-stat__caption{font-family:var(--font-body);font-size:13px;color:var(--text-body);}
.ps-stat__trend{
  font-family:var(--font-mono);font-size:12px;font-weight:var(--fw-bold);
  display:inline-flex;align-items:center;gap:4px;margin-top:2px;
}
.ps-stat__trend--up{color:var(--success);}
.ps-stat__trend--down{color:var(--success);}
.ps-stat__trend--flat{color:var(--text-muted);}
`;

export function StatTile({
  value,
  unit = null,
  eyebrow = null,
  caption = null,
  trend = null,
  accent = "electric",
  className = "",
  ...rest
}) {
  ensureStyles("ps-stat-styles", CSS);
  const cls = ["ps-stat", accent === "bolt" ? "ps-stat--bolt" : "", className].filter(Boolean).join(" ");
  return (
    <div className={cls} {...rest}>
      {eyebrow && <div className="ps-stat__eyebrow">{eyebrow}</div>}
      <div className="ps-stat__value">
        {value}
        {unit && <span className="ps-stat__unit">{unit}</span>}
      </div>
      {caption && <div className="ps-stat__caption">{caption}</div>}
      {trend && (
        <span className={`ps-stat__trend ps-stat__trend--${trend.dir || "flat"}`}>
          {trend.dir === "up" ? "▲" : trend.dir === "down" ? "▼" : "■"} {trend.label}
        </span>
      )}
    </div>
  );
}
