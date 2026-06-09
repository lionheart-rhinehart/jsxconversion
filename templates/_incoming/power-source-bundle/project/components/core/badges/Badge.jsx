import React from "react";

function ensureStyles(id, css) {
  if (typeof document === "undefined" || document.getElementById(id)) return;
  const el = document.createElement("style");
  el.id = id;
  el.textContent = css;
  document.head.appendChild(el);
}

const CSS = `
.ps-badge{
  display:inline-flex;align-items:center;gap:6px;
  font-family:var(--font-mono);font-weight:var(--fw-bold);
  font-size:11px;letter-spacing:.08em;text-transform:uppercase;
  padding:4px 10px;border-radius:var(--radius-pill);
  line-height:1.4;white-space:nowrap;
  background:var(--electric-500);color:#fff;
}
.ps-badge .ps-badge__dot{width:6px;height:6px;border-radius:50%;background:currentColor;opacity:.9;}
.ps-badge--bolt{background:var(--bolt-400);color:var(--ink-950);}
.ps-badge--steel{background:var(--steel-500);color:#fff;}
.ps-badge--success{background:var(--success);color:#fff;}
.ps-badge--danger{background:var(--danger);color:#fff;}
.ps-badge--neutral{background:var(--ink-700);color:var(--text-body);}
.ps-badge--outline{background:transparent;color:var(--electric-300);box-shadow:inset 0 0 0 1.5px var(--electric-400);}
`;

export function Badge({ children, variant = "electric", dot = false, className = "", ...rest }) {
  ensureStyles("ps-badge-styles", CSS);
  const cls = [
    "ps-badge",
    variant !== "electric" ? `ps-badge--${variant}` : "",
    className,
  ].filter(Boolean).join(" ");
  return (
    <span className={cls} {...rest}>
      {dot && <span className="ps-badge__dot" />}
      {children}
    </span>
  );
}
