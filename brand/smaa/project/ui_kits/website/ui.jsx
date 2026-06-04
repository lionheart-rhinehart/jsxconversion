/* ============================================================
   SMAA Website UI Kit — shared primitives
   Exposes globals for the other component files.
   ============================================================ */

// ---- Lucide icon helper -------------------------------------
// Renders a Lucide icon by name. Calls lucide.createIcons() after
// mount so the <i data-lucide> placeholders become SVGs.
function Icon({ name, size = 20, color = 'currentColor', stroke = 2, style }) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (window.lucide && ref.current) {
      ref.current.innerHTML = '';
      const el = document.createElement('i');
      el.setAttribute('data-lucide', name);
      ref.current.appendChild(el);
      window.lucide.createIcons({
        attrs: { width: size, height: size, stroke: color, 'stroke-width': stroke },
        nameAttr: 'data-lucide',
      });
    }
  }, [name, size, color, stroke]);
  return <span ref={ref} style={{ display: 'inline-flex', lineHeight: 0, ...style }} aria-hidden="true" />;
}

// ---- Layout ------------------------------------------------
function Container({ children, style, narrow }) {
  return (
    <div style={{ width: '100%', maxWidth: narrow ? 820 : 1160, margin: '0 auto', padding: '0 24px', ...style }}>
      {children}
    </div>
  );
}

function Section({ children, dark, soft, style, id }) {
  const bg = dark ? 'var(--ink-900)' : soft ? 'var(--paper-soft)' : '#fff';
  return (
    <section id={id} style={{ background: bg, padding: '88px 0', ...style }}>
      {children}
    </section>
  );
}

function Eyebrow({ children, onDark, center }) {
  return (
    <div className="smaa-eyebrow" style={{
      color: onDark ? '#5fb0f5' : 'var(--smaa-blue)',
      textAlign: center ? 'center' : 'left',
      marginBottom: 14,
    }}>{children}</div>
  );
}

// ---- CTA button --------------------------------------------
function CTAButton({ children, onClick, variant = 'primary', size = 'md', full, withArrow }) {
  const [hover, setHover] = React.useState(false);
  const [press, setPress] = React.useState(false);
  const pads = size === 'lg' ? '20px 36px' : size === 'sm' ? '12px 20px' : '16px 30px';
  const fs = size === 'lg' ? 18 : size === 'sm' ? 14 : 16;
  const variants = {
    primary: { bg: hover ? 'var(--smaa-blue-600)' : 'var(--smaa-blue)', color: '#fff', border: 'none',
               shadow: '0 8px 20px rgba(1,126,230,.35)' },
    green:   { bg: hover ? 'var(--smaa-green-600)' : 'var(--smaa-green)', color: '#fff', border: 'none',
               shadow: '0 8px 18px rgba(89,190,11,.30)' },
    outline: { bg: hover ? 'var(--smaa-blue)' : 'transparent', color: hover ? '#fff' : 'var(--smaa-blue)',
               border: '2px solid var(--smaa-blue)', shadow: 'none' },
    ghost:   { bg: hover ? 'rgba(255,255,255,.10)' : 'transparent', color: '#fff',
               border: '2px solid rgba(255,255,255,.30)', shadow: 'none' },
  };
  const v = variants[variant];
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => { setHover(false); setPress(false); }}
      onMouseDown={() => setPress(true)} onMouseUp={() => setPress(false)}
      style={{
        fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: fs,
        textTransform: 'uppercase', letterSpacing: '.02em',
        padding: pads, borderRadius: 10, cursor: 'pointer',
        background: v.bg, color: v.color, border: v.border, boxShadow: press ? 'none' : v.shadow,
        width: full ? '100%' : 'auto',
        transform: press ? 'scale(.98)' : hover ? 'translateY(-2px)' : 'none',
        transition: 'all .16s ease', display: 'inline-flex', alignItems: 'center',
        justifyContent: 'center', gap: 10, lineHeight: 1.1,
      }}>
      {children}
      {withArrow && <Icon name="arrow-right" size={fs + 2} />}
    </button>
  );
}

// ---- Scroll-reveal hook ------------------------------------
function useReveal() {
  const ref = React.useRef(null);
  const [shown, setShown] = React.useState(false);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // already in / near viewport on mount? show immediately
    const r = el.getBoundingClientRect();
    if (r.top < (window.innerHeight || 800) + 40) { setShown(true); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { setShown(true); io.disconnect(); } });
    }, { threshold: 0.12 });
    io.observe(el);
    // failsafe: never leave content hidden
    const t = setTimeout(() => setShown(true), 1500);
    return () => { io.disconnect(); clearTimeout(t); };
  }, []);
  return [ref, shown];
}

// CSS-animation based: end state is the element's natural (visible)
// style, so content can NEVER get stuck invisible (failsafe by design).
function Reveal({ children, delay = 0, style }) {
  return (
    <div className="smaa-rise" style={{ animationDelay: delay + 'ms', ...style }}>
      {children}
    </div>
  );
}

Object.assign(window, { Icon, Container, Section, Eyebrow, CTAButton, useReveal, Reveal });
