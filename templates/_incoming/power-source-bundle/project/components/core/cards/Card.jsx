import React from "react";

function ensureStyles(id, css) {
  if (typeof document === "undefined" || document.getElementById(id)) return;
  const el = document.createElement("style");
  el.id = id;
  el.textContent = css;
  document.head.appendChild(el);
}

const CSS = `
.ps-card{
  position:relative;
  background:var(--surface-raised);
  border:1px solid var(--border-subtle);
  border-radius:var(--radius-lg);
  box-shadow:var(--shadow-md);
  padding:24px;
  color:var(--text-body);
}
.ps-card--steel{background:var(--grad-steel);border-color:var(--border-default);color:#d6deeb;}
.ps-card--light{background:var(--surface-invert);border-color:var(--border-on-light);color:var(--text-on-light);box-shadow:var(--shadow-light-md);}
.ps-card--accent-bolt{border-top:var(--bw-3) solid var(--bolt-400);}
.ps-card--accent-electric{border-top:var(--bw-3) solid var(--electric-400);}
.ps-card--interactive{transition:transform var(--dur-base) var(--ease-out),box-shadow var(--dur-base) var(--ease-out),border-color var(--dur-base) var(--ease-out);cursor:pointer;}
.ps-card--interactive:hover{transform:translateY(-3px);box-shadow:var(--shadow-lg);border-color:var(--border-strong);}
`;

export function Card({
  children,
  variant = "raised",
  accent = "none",
  interactive = false,
  className = "",
  style,
  ...rest
}) {
  ensureStyles("ps-card-styles", CSS);
  const cls = [
    "ps-card",
    variant !== "raised" ? `ps-card--${variant}` : "",
    accent !== "none" ? `ps-card--accent-${accent}` : "",
    interactive ? "ps-card--interactive" : "",
    className,
  ].filter(Boolean).join(" ");
  return (
    <div className={cls} style={style} {...rest}>
      {children}
    </div>
  );
}
