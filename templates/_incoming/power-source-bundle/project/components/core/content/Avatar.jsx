import React from "react";

function ensureStyles(id, css) {
  if (typeof document === "undefined" || document.getElementById(id)) return;
  const el = document.createElement("style");
  el.id = id;
  el.textContent = css;
  document.head.appendChild(el);
}

const CSS = `
.ps-avatar{
  display:inline-flex;align-items:center;justify-content:center;
  border-radius:50%;overflow:hidden;flex:none;
  background:var(--steel-500);color:#fff;
  font-family:var(--font-display);font-weight:var(--fw-extrabold);
  text-transform:uppercase;letter-spacing:.02em;
  width:44px;height:44px;font-size:17px;
}
.ps-avatar img{width:100%;height:100%;object-fit:cover;}
.ps-avatar--sm{width:32px;height:32px;font-size:13px;}
.ps-avatar--lg{width:64px;height:64px;font-size:24px;}
.ps-avatar--bolt{background:var(--bolt-400);color:var(--ink-950);}
.ps-avatar--ring{box-shadow:0 0 0 2px var(--ink-950),0 0 0 4px var(--electric-400);}
`;

export function Avatar({
  src = null,
  name = "",
  size = "md",
  accent = "steel",
  ring = false,
  className = "",
  ...rest
}) {
  ensureStyles("ps-avatar-styles", CSS);
  const initials = name
    ? name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join("")
    : "";
  const cls = [
    "ps-avatar",
    size !== "md" ? `ps-avatar--${size}` : "",
    accent === "bolt" ? "ps-avatar--bolt" : "",
    ring ? "ps-avatar--ring" : "",
    className,
  ].filter(Boolean).join(" ");
  return (
    <span className={cls} {...rest}>
      {src ? <img src={src} alt={name} /> : initials}
    </span>
  );
}
