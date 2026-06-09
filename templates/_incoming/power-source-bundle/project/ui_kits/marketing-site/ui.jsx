/* Power Source — Marketing kit primitives (self-contained recreation).
   Mirrors the authored components in /components/core using the SAME
   token-driven CSS classes, exposed as window globals for the kit. */

function ensureStyles(id, css) {
  if (document.getElementById(id)) return;
  const el = document.createElement("style");
  el.id = id;
  el.textContent = css;
  document.head.appendChild(el);
}

ensureStyles("ps-kit-styles", `
/* Button */
.ps-btn{--_bg:var(--action-primary);--_bgh:var(--action-primary-hover);--_bgp:var(--action-primary-press);--_fg:var(--action-primary-text);display:inline-flex;align-items:center;justify-content:center;gap:10px;font-family:var(--font-heading);font-weight:var(--fw-bold);text-transform:uppercase;letter-spacing:.06em;border:0;cursor:pointer;white-space:nowrap;text-decoration:none;background:var(--_bg);color:var(--_fg);height:var(--control-h-md);padding:0 var(--control-pad-x);border-radius:var(--radius-md);font-size:14px;transition:background var(--dur-fast) var(--ease-out),box-shadow var(--dur-base) var(--ease-out),transform var(--dur-fast) var(--ease-out);}
.ps-btn:hover{background:var(--_bgh);box-shadow:var(--glow-electric);}
.ps-btn:active{background:var(--_bgp);box-shadow:var(--inset-press);transform:translateY(1px);}
.ps-btn:focus-visible{outline:none;box-shadow:var(--ring-focus);}
.ps-btn--bolt{--_bg:var(--action-bolt);--_bgh:var(--action-bolt-hover);--_bgp:var(--action-bolt-press);--_fg:var(--action-bolt-text);}
.ps-btn--bolt:hover{box-shadow:var(--glow-bolt);}
.ps-btn--secondary{--_bg:var(--surface-steel);--_bgh:var(--steel-600);--_bgp:var(--steel-700);--_fg:#fff;}
.ps-btn--secondary:hover{box-shadow:none;}
.ps-btn--ghost{--_bg:transparent;--_fg:var(--action-ghost-text);box-shadow:inset 0 0 0 var(--bw-1) var(--action-ghost-border);}
.ps-btn--ghost:hover{background:var(--action-ghost-hover);box-shadow:inset 0 0 0 var(--bw-1) var(--border-strong);}
.ps-btn--lg{height:var(--control-h-lg);padding:0 30px;font-size:16px;}
.ps-btn--block{display:flex;width:100%;}
/* Badge */
.ps-badge{display:inline-flex;align-items:center;gap:6px;font-family:var(--font-mono);font-weight:var(--fw-bold);font-size:11px;letter-spacing:.08em;text-transform:uppercase;padding:4px 10px;border-radius:var(--radius-pill);line-height:1.4;background:var(--electric-500);color:#fff;}
.ps-badge .ps-badge__dot{width:6px;height:6px;border-radius:50%;background:currentColor;}
.ps-badge--bolt{background:var(--bolt-400);color:var(--ink-950);}
.ps-badge--outline{background:transparent;color:var(--electric-300);box-shadow:inset 0 0 0 1.5px var(--electric-400);}
.ps-badge--steel{background:rgba(255,255,255,.1);color:#fff;}
/* SectionHeading */
.ps-head{display:flex;flex-direction:column;gap:14px;}
.ps-head--center{align-items:center;text-align:center;}
.ps-head__eyebrow{display:inline-flex;align-items:center;gap:9px;font-family:var(--font-mono);font-weight:var(--fw-bold);font-size:12px;letter-spacing:.18em;text-transform:uppercase;color:var(--electric-300);}
.ps-head__eyebrow::before{content:"";width:22px;height:2px;background:var(--bolt-400);}
.ps-head--center .ps-head__eyebrow::before{display:none;}
.ps-head__title{font-family:var(--font-display);font-weight:var(--fw-extrabold);text-transform:uppercase;line-height:.95;letter-spacing:-.01em;font-size:clamp(34px,4.4vw,56px);color:var(--text-strong);max-width:18ch;text-wrap:balance;}
.ps-head--light .ps-head__title{color:var(--ink-900);}
.ps-head--light .ps-head__eyebrow{color:var(--electric-600);}
.ps-head__sub{font-family:var(--font-body);font-size:var(--fs-body-lg);line-height:1.55;color:var(--text-body);max-width:56ch;text-wrap:pretty;}
.ps-head--light .ps-head__sub{color:var(--text-on-light-muted);}
.ps-head--center .ps-head__sub{margin-inline:auto;}
.ps-head__title .hl{color:var(--bolt-400);}
/* Card */
.ps-card{position:relative;background:var(--surface-raised);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);box-shadow:var(--shadow-md);padding:24px;color:var(--text-body);}
.ps-card--interactive{transition:transform var(--dur-base) var(--ease-out),box-shadow var(--dur-base) var(--ease-out),border-color var(--dur-base) var(--ease-out);cursor:pointer;}
.ps-card--interactive:hover{transform:translateY(-3px);box-shadow:var(--shadow-lg);border-color:var(--border-strong);}
.ps-card--accent-bolt{border-top:var(--bw-3) solid var(--bolt-400);}
.ps-card--accent-electric{border-top:var(--bw-3) solid var(--electric-400);}
/* ProgramCard */
.ps-prog{display:flex;flex-direction:column;gap:14px;height:100%;}
.ps-prog__top{display:flex;align-items:center;justify-content:space-between;gap:12px;}
.ps-prog__icon{width:52px;height:52px;border-radius:var(--radius-md);display:flex;align-items:center;justify-content:center;background:var(--electric-500);color:#fff;flex:none;}
.ps-prog--bolt .ps-prog__icon{background:var(--bolt-400);color:var(--ink-950);}
.ps-prog__icon svg{width:26px;height:26px;}
.ps-prog__meta{font-family:var(--font-mono);font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--text-muted);}
.ps-prog__title{font-family:var(--font-display);font-weight:var(--fw-extrabold);text-transform:uppercase;line-height:1;font-size:26px;color:var(--text-strong);}
.ps-prog__desc{font-family:var(--font-body);font-size:14px;line-height:1.5;color:var(--text-body);flex:1;}
.ps-prog__cta{display:inline-flex;align-items:center;gap:8px;align-self:flex-start;font-family:var(--font-heading);font-weight:var(--fw-bold);text-transform:uppercase;letter-spacing:.06em;font-size:13px;color:var(--electric-300);}
.ps-prog--bolt .ps-prog__cta{color:var(--bolt-300);}
.ps-prog__cta svg{width:16px;height:16px;transition:transform var(--dur-fast) var(--ease-out);}
.ps-card--interactive:hover .ps-prog__cta svg{transform:translateX(4px);}
/* StatTile */
.ps-stat{position:relative;display:flex;flex-direction:column;gap:6px;background:var(--surface-raised);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);padding:22px;overflow:hidden;}
.ps-stat::before{content:"";position:absolute;left:0;top:0;bottom:0;width:var(--bw-3);background:var(--electric-400);}
.ps-stat--bolt::before{background:var(--bolt-400);}
.ps-stat__eyebrow{font-family:var(--font-mono);font-weight:var(--fw-bold);font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:var(--text-muted);}
.ps-stat__value{font-family:var(--font-display);font-weight:var(--fw-black);font-size:54px;line-height:.95;color:var(--text-strong);font-variant-numeric:tabular-nums;letter-spacing:-.01em;display:flex;align-items:baseline;gap:4px;}
.ps-stat__unit{font-size:26px;color:var(--bolt-400);font-weight:var(--fw-extrabold);}
.ps-stat__caption{font-family:var(--font-body);font-size:13px;color:var(--text-body);}
/* Testimonial */
.ps-quote{display:flex;flex-direction:column;gap:18px;background:var(--surface-raised);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);box-shadow:var(--shadow-md);padding:26px;height:100%;box-sizing:border-box;}
.ps-quote__stars{display:flex;gap:3px;color:var(--bolt-400);font-size:15px;letter-spacing:2px;}
.ps-quote__body{font-family:var(--font-body);font-size:16px;line-height:1.55;color:var(--text-strong);text-wrap:pretty;flex:1;}
.ps-quote__foot{display:flex;align-items:center;gap:12px;}
.ps-quote__name{font-family:var(--font-heading);font-weight:var(--fw-bold);font-size:15px;color:var(--text-strong);}
.ps-quote__role{font-family:var(--font-mono);font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--text-muted);display:block;}
/* Avatar */
.ps-avatar{display:inline-flex;align-items:center;justify-content:center;border-radius:50%;overflow:hidden;flex:none;background:var(--steel-500);color:#fff;font-family:var(--font-display);font-weight:var(--fw-extrabold);text-transform:uppercase;width:44px;height:44px;font-size:17px;}
.ps-avatar--bolt{background:var(--bolt-400);color:var(--ink-950);}
/* Input */
.ps-field{display:flex;flex-direction:column;gap:7px;}
.ps-field__label{font-family:var(--font-heading);font-weight:var(--fw-semibold);font-size:13px;color:var(--text-strong);}
.ps-field__req{color:var(--bolt-400);margin-left:3px;}
.ps-input{width:100%;height:var(--control-h-md);background:var(--ink-850);color:var(--text-strong);border:1px solid var(--border-default);border-radius:var(--radius-md);padding:0 14px;font-family:var(--font-body);font-size:15px;box-sizing:border-box;transition:border-color var(--dur-fast) var(--ease-out),box-shadow var(--dur-fast) var(--ease-out);}
.ps-input::placeholder{color:var(--text-muted);}
.ps-input:focus{outline:none;border-color:var(--electric-400);box-shadow:var(--ring-focus);}
`);

const cx = (...a) => a.filter(Boolean).join(" ");

function Button({ children, variant = "primary", size = "md", fullWidth, className, ...rest }) {
  return <button className={cx("ps-btn", variant !== "primary" && `ps-btn--${variant}`, size === "lg" && "ps-btn--lg", fullWidth && "ps-btn--block", className)} {...rest}>{children}</button>;
}
function Badge({ children, variant = "electric", dot, className, ...rest }) {
  return <span className={cx("ps-badge", variant !== "electric" && `ps-badge--${variant}`, className)} {...rest}>{dot && <span className="ps-badge__dot" />}{children}</span>;
}
function SectionHeading({ eyebrow, title, subtitle, align = "left", tone = "dark", className }) {
  return (
    <div className={cx("ps-head", align === "center" && "ps-head--center", tone === "light" && "ps-head--light", className)}>
      {eyebrow && <span className="ps-head__eyebrow">{eyebrow}</span>}
      <h2 className="ps-head__title">{title}</h2>
      {subtitle && <p className="ps-head__sub">{subtitle}</p>}
    </div>
  );
}
function Card({ children, accent = "none", interactive, className, ...rest }) {
  return <div className={cx("ps-card", accent !== "none" && `ps-card--accent-${accent}`, interactive && "ps-card--interactive", className)} {...rest}>{children}</div>;
}
function Icon({ name, size = 24 }) {
  // Render Lucide icons as React-owned SVG (NO lucide.createIcons DOM mutation,
  // which corrupts React reconciliation when a parent re-renders).
  const lib = (typeof window !== "undefined" && window.lucide && window.lucide.icons) || {};
  const pascal = String(name).replace(/(^|-)([a-z])/g, (_, __, c) => c.toUpperCase());
  let node = lib[pascal];
  if (node && !Array.isArray(node) && node.length === undefined && node.default) node = node.default;
  const sz = size || 24;
  if (!node || !node.length) return <svg width={sz} height={sz} viewBox="0 0 24 24" aria-hidden="true" />;
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={sz} height={sz} viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {node.map((child, i) => React.createElement(child[0], { key: i, ...child[1] }))}
    </svg>
  );
}
function ProgramCard({ title, description, meta, icon, cta = "Learn More", accent = "electric", onClick }) {
  return (
    <Card interactive accent={accent} onClick={onClick} className={accent === "bolt" ? "ps-prog--bolt" : ""}>
      <div className="ps-prog">
        <div className="ps-prog__top"><div className="ps-prog__icon"><Icon name={icon} /></div>{meta && <span className="ps-prog__meta">{meta}</span>}</div>
        <div className="ps-prog__title">{title}</div>
        <div className="ps-prog__desc">{description}</div>
        <span className="ps-prog__cta">{cta} <Icon name="arrow-right" /></span>
      </div>
    </Card>
  );
}
function StatTile({ value, unit, eyebrow, caption, accent = "electric" }) {
  return (
    <div className={cx("ps-stat", accent === "bolt" && "ps-stat--bolt")}>
      {eyebrow && <div className="ps-stat__eyebrow">{eyebrow}</div>}
      <div className="ps-stat__value">{value}{unit && <span className="ps-stat__unit">{unit}</span>}</div>
      {caption && <div className="ps-stat__caption">{caption}</div>}
    </div>
  );
}
function Avatar({ name = "", accent = "steel" }) {
  const initials = name.trim().split(/\s+/).slice(0, 2).map(w => w[0]).join("");
  return <span className={cx("ps-avatar", accent === "bolt" && "ps-avatar--bolt")}>{initials}</span>;
}
function Testimonial({ quote, name, role, rating = 5 }) {
  return (
    <figure className="ps-quote">
      <div className="ps-quote__stars">{"★".repeat(rating)}{"☆".repeat(5 - rating)}</div>
      <blockquote className="ps-quote__body">{quote}</blockquote>
      <figcaption className="ps-quote__foot"><Avatar name={name} accent="bolt" /><span><span className="ps-quote__name">{name}</span><span className="ps-quote__role">{role}</span></span></figcaption>
    </figure>
  );
}
function Input({ label, required, ...rest }) {
  return (
    <div className="ps-field">
      {label && <label className="ps-field__label">{label}{required && <span className="ps-field__req">*</span>}</label>}
      <input className="ps-input" {...rest} />
    </div>
  );
}

Object.assign(window, { Button, Badge, SectionHeading, Card, ProgramCard, StatTile, Avatar, Testimonial, Input, Icon });
