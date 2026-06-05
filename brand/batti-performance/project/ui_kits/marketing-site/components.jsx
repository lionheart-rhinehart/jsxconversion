// Batti-Performance kit — shared primitives
const { useState, useEffect, useRef } = React;

// Inline-SVG icon set (Material-compatible clean stroke). Self-contained:
// Google's icon-font CDN is unreachable in this sandbox, so icons ship inline.
// Keyed by Material Symbols names so call sites read like the production system.
const ICON_PATHS = {
  photo_camera: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  close: '<path d="M18 6 6 18M6 6l12 12"/>',
  arrow_forward: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  expand_more: '<path d="m6 9 6 6 6-6"/>',
  directions_run: '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
  bolt: '<path d="M13 2 4 13h7l-1 9 9-12h-7l1-8z"/>',
  self_improvement: '<circle cx="12" cy="7.5" r="5.5"/><path d="m8 13-1 8 5-3 5 3-1-8"/>',
  query_stats: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.6"/>',
  fitness_center: '<path d="M4 9v6M7 7v10M17 7v10M20 9v6M7 12h10"/>',
  trending_up: '<path d="M16 7h6v6"/><path d="m22 7-8.5 8.5-5-5L2 17"/>',
  check_circle: '<circle cx="12" cy="12" r="9"/><path d="m8.5 12 2.4 2.4 4.6-4.8"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  verified: '<path d="M12 3 5 6v6c0 4 3 7 7 9 4-2 7-5 7-9V6z"/><path d="m9 12 2 2 4-4"/>',
  sprint: '<path d="M2 8h12a2.5 2.5 0 1 0-2.5-2.5"/><path d="M2 12h17a2.5 2.5 0 1 1-2.5 2.5"/><path d="M2 16h9a2.5 2.5 0 1 1-2.5 2.5"/>',
  flame: '<path d="M12 3c1 3 4 4.5 4 8a4 4 0 0 1-8 0c0-1.2.6-2.2 1.2-2.8C9.7 9 10 6 12 3z"/>',
};

function Icon({ name, className = "", style }) {
  return (
    <svg
      className={"bp-icon " + className}
      style={style}
      viewBox="0 0 24 24" width="1em" height="1em"
      fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: ICON_PATHS[name] || "" }}
    />
  );
}

// Button (variants: primary | dark | outline | outline-dark)
function Btn({ variant = "primary", lg, icon, children, onClick, href }) {
  const cls = `btn btn-${variant}${lg ? " btn-lg" : ""}`;
  const inner = <>{children}{icon && <Icon name={icon} />}</>;
  if (href) return <a className={cls} href={href} onClick={onClick}>{inner}</a>;
  return <button className={cls} onClick={onClick}>{inner}</button>;
}

function Eyebrow({ children, muted }) {
  return <div className={"eyebrow" + (muted ? " eyebrow--muted" : "")}>{children}</div>;
}

// Photo placeholder — stands in for real training photography
function Photo({ label = "Training photo", icon = "photo_camera", style, className = "" }) {
  return (
    <div className={"ph " + className} data-label={label} style={style}>
      <Icon name={icon} className="ico" />
    </div>
  );
}

Object.assign(window, { Icon, Btn, Eyebrow, Photo });
