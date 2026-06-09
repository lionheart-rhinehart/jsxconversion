import React from "react";
import { Avatar } from "./Avatar.jsx";

function ensureStyles(id, css) {
  if (typeof document === "undefined" || document.getElementById(id)) return;
  const el = document.createElement("style");
  el.id = id;
  el.textContent = css;
  document.head.appendChild(el);
}

const CSS = `
.ps-quote{
  display:flex;flex-direction:column;gap:18px;
  background:var(--surface-raised);
  border:1px solid var(--border-subtle);
  border-radius:var(--radius-lg);
  box-shadow:var(--shadow-md);
  padding:26px;position:relative;
}
.ps-quote__mark{
  font-family:var(--font-display);font-weight:var(--fw-black);
  font-size:64px;line-height:.5;color:var(--bolt-400);height:24px;
}
.ps-quote__stars{display:flex;gap:3px;color:var(--bolt-400);font-size:15px;letter-spacing:2px;}
.ps-quote__body{
  font-family:var(--font-body);font-size:17px;line-height:1.55;color:var(--text-strong);
  text-wrap:pretty;flex:1;
}
.ps-quote__foot{display:flex;align-items:center;gap:12px;}
.ps-quote__name{font-family:var(--font-heading);font-weight:var(--fw-bold);font-size:15px;color:var(--text-strong);}
.ps-quote__role{font-family:var(--font-mono);font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--text-muted);}
`;

export function Testimonial({
  quote,
  name,
  role = null,
  avatarSrc = null,
  rating = 5,
  className = "",
  ...rest
}) {
  ensureStyles("ps-quote-styles", CSS);
  return (
    <figure className={`ps-quote ${className}`} {...rest}>
      {rating ? (
        <div className="ps-quote__stars" aria-label={`${rating} out of 5`}>
          {"★".repeat(rating)}{"☆".repeat(Math.max(0, 5 - rating))}
        </div>
      ) : (
        <div className="ps-quote__mark">&ldquo;</div>
      )}
      <blockquote className="ps-quote__body">{quote}</blockquote>
      <figcaption className="ps-quote__foot">
        <Avatar name={name} src={avatarSrc} accent="bolt" />
        <span>
          <span className="ps-quote__name">{name}</span>
          {role && <span className="ps-quote__role" style={{ display: "block" }}>{role}</span>}
        </span>
      </figcaption>
    </figure>
  );
}
