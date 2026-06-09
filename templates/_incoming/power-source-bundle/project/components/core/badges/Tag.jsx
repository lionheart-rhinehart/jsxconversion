import React from "react";

function ensureStyles(id, css) {
  if (typeof document === "undefined" || document.getElementById(id)) return;
  const el = document.createElement("style");
  el.id = id;
  el.textContent = css;
  document.head.appendChild(el);
}

const CSS = `
.ps-tag{
  display:inline-flex;align-items:center;gap:7px;
  font-family:var(--font-heading);font-weight:var(--fw-semibold);
  font-size:13px;letter-spacing:.02em;
  padding:6px 12px;border-radius:var(--radius-sm);
  background:var(--ink-800);color:var(--text-body);
  border:1px solid var(--border-default);line-height:1;
}
.ps-tag--active{background:var(--electric-500);color:#fff;border-color:transparent;}
.ps-tag--bolt{background:transparent;color:var(--bolt-300);border-color:var(--bolt-700);}
.ps-tag__x{margin-left:2px;opacity:.6;cursor:pointer;font-family:var(--font-body);}
.ps-tag__x:hover{opacity:1;}
`;

export function Tag({ children, active = false, variant = "default", onRemove, className = "", ...rest }) {
  ensureStyles("ps-tag-styles", CSS);
  const cls = [
    "ps-tag",
    active ? "ps-tag--active" : "",
    variant === "bolt" ? "ps-tag--bolt" : "",
    className,
  ].filter(Boolean).join(" ");
  return (
    <span className={cls} {...rest}>
      {children}
      {onRemove && (
        <span className="ps-tag__x" onClick={onRemove} role="button" aria-label="Remove">×</span>
      )}
    </span>
  );
}
