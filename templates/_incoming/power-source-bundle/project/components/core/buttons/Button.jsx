import React from "react";

/* Inject component CSS once (keeps the component self-contained). */
function ensureStyles(id, css) {
  if (typeof document === "undefined") return;
  if (document.getElementById(id)) return;
  const el = document.createElement("style");
  el.id = id;
  el.textContent = css;
  document.head.appendChild(el);
}

const CSS = `
.ps-btn{
  --_bg: var(--action-primary);
  --_bgh: var(--action-primary-hover);
  --_bgp: var(--action-primary-press);
  --_fg: var(--action-primary-text);
  display:inline-flex;align-items:center;justify-content:center;gap:10px;
  font-family:var(--font-heading);font-weight:var(--fw-bold);
  text-transform:uppercase;letter-spacing:.06em;
  border:0;cursor:pointer;white-space:nowrap;text-decoration:none;
  background:var(--_bg);color:var(--_fg);
  height:var(--control-h-md);padding:0 var(--control-pad-x);
  border-radius:var(--radius-md);font-size:14px;
  transition:background var(--dur-fast) var(--ease-out),
             box-shadow var(--dur-base) var(--ease-out),
             transform var(--dur-fast) var(--ease-out);
}
.ps-btn:hover{background:var(--_bgh);box-shadow:var(--glow-electric);text-decoration:none;}
.ps-btn:active{background:var(--_bgp);box-shadow:var(--inset-press);transform:translateY(1px);}
.ps-btn:focus-visible{outline:none;box-shadow:var(--ring-focus);}
.ps-btn--bolt{--_bg:var(--action-bolt);--_bgh:var(--action-bolt-hover);--_bgp:var(--action-bolt-press);--_fg:var(--action-bolt-text);}
.ps-btn--bolt:hover{box-shadow:var(--glow-bolt);}
.ps-btn--secondary{--_bg:var(--surface-steel);--_bgh:var(--steel-600);--_bgp:var(--steel-700);--_fg:#fff;}
.ps-btn--secondary:hover{box-shadow:none;}
.ps-btn--ghost{--_bg:transparent;--_fg:var(--action-ghost-text);box-shadow:inset 0 0 0 var(--bw-1) var(--action-ghost-border);}
.ps-btn--ghost:hover{background:var(--action-ghost-hover);box-shadow:inset 0 0 0 var(--bw-1) var(--border-strong);}
.ps-btn--ghost:active{background:var(--action-ghost-hover);}
.ps-btn--sm{height:var(--control-h-sm);padding:0 16px;font-size:13px;}
.ps-btn--lg{height:var(--control-h-lg);padding:0 30px;font-size:16px;}
.ps-btn--block{display:flex;width:100%;}
.ps-btn:disabled,.ps-btn[aria-disabled="true"]{opacity:.45;cursor:not-allowed;box-shadow:none;transform:none;pointer-events:none;}
`;

export function Button({
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  disabled = false,
  iconLeft = null,
  iconRight = null,
  as = "button",
  className = "",
  ...rest
}) {
  ensureStyles("ps-btn-styles", CSS);
  const cls = [
    "ps-btn",
    variant !== "primary" ? `ps-btn--${variant}` : "",
    size !== "md" ? `ps-btn--${size}` : "",
    fullWidth ? "ps-btn--block" : "",
    className,
  ].filter(Boolean).join(" ");

  const Comp = as;
  const extra = Comp === "button" ? { disabled, type: rest.type || "button" } : { "aria-disabled": disabled || undefined };

  return (
    <Comp className={cls} {...extra} {...rest}>
      {iconLeft}
      {children}
      {iconRight}
    </Comp>
  );
}
