import React from "react";

function ensureStyles(id, css) {
  if (typeof document === "undefined" || document.getElementById(id)) return;
  const el = document.createElement("style");
  el.id = id;
  el.textContent = css;
  document.head.appendChild(el);
}

const CSS = `
.ps-field{display:flex;flex-direction:column;gap:7px;}
.ps-field__label{
  font-family:var(--font-heading);font-weight:var(--fw-semibold);
  font-size:13px;letter-spacing:.02em;color:var(--text-strong);
}
.ps-field__req{color:var(--bolt-400);margin-left:3px;}
.ps-field__wrap{position:relative;display:flex;align-items:center;}
.ps-field__icon{position:absolute;left:14px;display:flex;color:var(--text-muted);pointer-events:none;}
.ps-field__icon svg,.ps-field__icon i{width:18px;height:18px;}
.ps-input{
  width:100%;height:var(--control-h-md);
  background:var(--ink-850);color:var(--text-strong);
  border:1px solid var(--border-default);
  border-radius:var(--radius-md);
  padding:0 14px;font-family:var(--font-body);font-size:15px;
  transition:border-color var(--dur-fast) var(--ease-out),box-shadow var(--dur-fast) var(--ease-out);
}
.ps-input::placeholder{color:var(--text-muted);}
.ps-input:hover{border-color:var(--border-strong);}
.ps-input:focus{outline:none;border-color:var(--electric-400);box-shadow:var(--ring-focus);}
.ps-input--icon{padding-left:42px;}
.ps-input--error{border-color:var(--danger);}
.ps-input--error:focus{box-shadow:0 0 0 3px rgba(217,72,63,.4);}
.ps-input:disabled{opacity:.5;cursor:not-allowed;}
.ps-field__help{font-family:var(--font-body);font-size:12px;color:var(--text-muted);}
.ps-field__help--error{color:var(--danger);}
`;

export function Input({
  label,
  required = false,
  icon = null,
  error = null,
  helper = null,
  id,
  className = "",
  ...rest
}) {
  ensureStyles("ps-input-styles", CSS);
  const inputId = id || (label ? `ps-${String(label).toLowerCase().replace(/\s+/g, "-")}` : undefined);
  const inputCls = [
    "ps-input",
    icon ? "ps-input--icon" : "",
    error ? "ps-input--error" : "",
    className,
  ].filter(Boolean).join(" ");
  return (
    <div className="ps-field">
      {label && (
        <label className="ps-field__label" htmlFor={inputId}>
          {label}
          {required && <span className="ps-field__req">*</span>}
        </label>
      )}
      <div className="ps-field__wrap">
        {icon && <span className="ps-field__icon">{icon}</span>}
        <input id={inputId} className={inputCls} aria-invalid={!!error} {...rest} />
      </div>
      {(error || helper) && (
        <span className={`ps-field__help ${error ? "ps-field__help--error" : ""}`}>
          {error || helper}
        </span>
      )}
    </div>
  );
}
