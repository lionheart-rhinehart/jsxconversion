import React from "react";

function ensureStyles(id, css) {
  if (typeof document === "undefined" || document.getElementById(id)) return;
  const el = document.createElement("style");
  el.id = id;
  el.textContent = css;
  document.head.appendChild(el);
}

const CSS = `
.ps-head{display:flex;flex-direction:column;gap:14px;}
.ps-head--center{align-items:center;text-align:center;}
.ps-head__eyebrow{
  display:inline-flex;align-items:center;gap:9px;
  font-family:var(--font-mono);font-weight:var(--fw-bold);
  font-size:12px;letter-spacing:.18em;text-transform:uppercase;
  color:var(--electric-300);
}
.ps-head__eyebrow::before{content:"";width:22px;height:2px;background:var(--bolt-400);}
.ps-head--center .ps-head__eyebrow::before{display:none;}
.ps-head__title{
  font-family:var(--font-display);font-weight:var(--fw-extrabold);
  text-transform:uppercase;line-height:.95;letter-spacing:-.01em;
  font-size:clamp(34px,4.4vw,56px);color:var(--text-strong);
  max-width:16ch;text-wrap:balance;
}
.ps-head--center .ps-head__title{max-width:18ch;}
.ps-head--light .ps-head__title{color:var(--ink-900);}
.ps-head--light .ps-head__eyebrow{color:var(--electric-500);}
.ps-head__sub{
  font-family:var(--font-body);font-size:var(--fs-body-lg);line-height:1.55;
  color:var(--text-body);max-width:56ch;text-wrap:pretty;
}
.ps-head--light .ps-head__sub{color:var(--text-on-light-muted);}
.ps-head--center .ps-head__sub{margin-inline:auto;}
.ps-head__title .hl{color:var(--bolt-400);}
`;

export function SectionHeading({
  eyebrow = null,
  title,
  subtitle = null,
  align = "left",
  tone = "dark",
  className = "",
  ...rest
}) {
  ensureStyles("ps-head-styles", CSS);
  const cls = [
    "ps-head",
    align === "center" ? "ps-head--center" : "",
    tone === "light" ? "ps-head--light" : "",
    className,
  ].filter(Boolean).join(" ");
  return (
    <div className={cls} {...rest}>
      {eyebrow && <span className="ps-head__eyebrow">{eyebrow}</span>}
      <h2 className="ps-head__title">{title}</h2>
      {subtitle && <p className="ps-head__sub">{subtitle}</p>}
    </div>
  );
}
