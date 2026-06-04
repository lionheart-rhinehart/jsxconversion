/* Castille Academy · shared primitives for UI kits.
   Exposes: Icon, useLucide, Button, Eyebrow, Wordmark, Crest, IndexRing,
            SectionLabel, Photo, Stars  → window */
const { useState, useEffect, useRef } = React;

/* Re-render Lucide icons after React commits. */
function useLucide() {
  useEffect(() => { if (window.lucide) window.lucide.createIcons(); });
}
function Icon({ name, size = 18, stroke = 1.75, style }) {
  return <i data-lucide={name} style={{ width: size, height: size, strokeWidth: stroke, display: 'inline-flex', ...style }} />;
}

function Button({ children, variant = 'primary', icon, onClick, style, type }) {
  const base = {
    display: 'inline-flex', alignItems: 'center', gap: 9, cursor: 'pointer',
    fontFamily: 'var(--font-cond)', fontWeight: 600, fontSize: 15,
    letterSpacing: '0.09em', textTransform: 'uppercase', lineHeight: 1,
    borderRadius: 'var(--r-md)', border: '1px solid transparent',
    padding: '14px 24px', transition: 'all var(--dur-base) var(--ease-out)',
    textDecoration: 'none', whiteSpace: 'nowrap',
  };
  const variants = {
    primary: { background: 'var(--ca-red-500)', color: 'var(--ca-ink-950)' },
    navy: { background: 'var(--ca-ink-900)', color: 'var(--ca-paper-100)' },
    ghost: { background: 'transparent', color: 'var(--ca-ink-800)', borderColor: 'var(--ca-ink-300)' },
    'ghost-bone': { background: 'transparent', color: 'var(--ca-paper-100)', borderColor: 'rgba(246,246,246,0.4)' },
    text: { background: 'transparent', color: 'var(--ca-red-600)', padding: '14px 4px' },
  };
  const [hover, setHover] = useState(false);
  const hoverStyle = hover ? {
    primary: { background: 'var(--ca-red-600)', transform: 'translateY(-1px)', boxShadow: 'var(--shadow-red)' },
    navy: { background: 'var(--ca-ink-800)', transform: 'translateY(-1px)', boxShadow: 'var(--shadow-3)' },
    ghost: { borderColor: 'var(--ca-ink-900)', background: 'var(--ca-ink-50)' },
    'ghost-bone': { borderColor: 'var(--ca-paper-100)', background: 'rgba(246,246,246,0.08)' },
    text: { color: 'var(--ca-red-700)', gap: 13 },
  }[variant] : {};
  return (
    <button type={type || 'button'} onClick={onClick}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ ...base, ...variants[variant], ...hoverStyle, ...style }}>
      {children}{icon && <Icon name={icon} size={17} />}
    </button>
  );
}

function Eyebrow({ children, tone = 'brass', style }) {
  const c = { brass: 'var(--ca-red-600)', navy: 'var(--ca-ink-500)', bone: 'var(--ca-red-500)' }[tone];
  return <div style={{ fontFamily: 'var(--font-cond)', fontWeight: 600, fontSize: 13, letterSpacing: '0.22em', textTransform: 'uppercase', color: c, ...style }}>{children}</div>;
}

function Crest({ size = 38, tone = 'bone' }) {
  const color = tone === 'bone' ? 'var(--ca-red-300)' : 'var(--ca-red-600)';
  const border = tone === 'bone' ? 'var(--ca-red-400)' : 'var(--ca-red-500)';
  return (
    <div style={{ width: size * 0.9, height: size, border: `1.5px solid ${border}`,
      borderRadius: `${size*0.12}px ${size*0.12}px ${size*0.45}px ${size*0.45}px / ${size*0.1}px ${size*0.1}px ${size*0.55}px ${size*0.55}px`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--font-display)', fontSize: size * 0.55, lineHeight: 1, color }}>C</div>
  );
}

function Wordmark({ tone = 'bone', size = 19 }) {
  const main = tone === 'bone' ? 'var(--ca-paper-100)' : 'var(--ca-ink-900)';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
      <Crest size={size * 2} tone={tone} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <b style={{ fontFamily: 'var(--font-display)', fontSize: size, letterSpacing: '0.02em', color: main, lineHeight: 1 }}>Castille</b>
        <span style={{ fontFamily: 'var(--font-cond)', fontWeight: 600, fontSize: size * 0.5, letterSpacing: '0.42em', color: 'var(--ca-red-500)', textTransform: 'uppercase' }}>Academy</span>
      </div>
    </div>
  );
}

/* Castille Index ring — conic brass arc + center value. */
function IndexRing({ value = 74, size = 118, label = 'Index', dark = true }) {
  const track = dark ? 'var(--ca-ink-800)' : 'var(--ca-ink-100)';
  const center = dark ? 'var(--ca-ink-900)' : 'var(--ca-white)';
  const valColor = dark ? 'var(--ca-paper-100)' : 'var(--ca-ink-900)';
  return (
    <div style={{ position: 'relative', width: size, height: size, borderRadius: '50%',
      background: `conic-gradient(var(--ca-red-500) 0 ${value}%, ${track} ${value}% 100%)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <div style={{ position: 'absolute', inset: size * 0.094, borderRadius: '50%', background: center }} />
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1 }}>
        <b style={{ fontFamily: 'var(--font-cond)', fontWeight: 800, fontSize: size * 0.39, color: valColor, fontVariantNumeric: 'tabular-nums' }}>{value}</b>
        <span style={{ fontFamily: 'var(--font-cond)', fontWeight: 600, fontSize: size * 0.078, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--ca-red-400)', marginTop: 2 }}>{label}</span>
      </div>
    </div>
  );
}

function SectionLabel({ no, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 28 }}>
      {no && <span style={{ fontFamily: 'var(--font-cond)', fontWeight: 700, fontSize: 15, color: 'var(--ca-red-500)', letterSpacing: '0.1em' }}>{no}</span>}
      <Eyebrow>{children}</Eyebrow>
      <span style={{ flex: 1, height: 1, background: 'var(--ca-paper-300)' }} />
    </div>
  );
}

function Photo({ src, label, height = '100%', radius = 0, flat = false, style }) {
  return (
    <div className={'ca-photo' + (flat ? ' ca-photo--flat' : '')} style={{ height, borderRadius: radius, ...style }}>
      <img src={src} alt={label || ''} />
      {label && <span style={{ position: 'absolute', left: 16, bottom: 13, zIndex: 2, whiteSpace: 'nowrap',
        fontFamily: 'var(--font-cond)', fontWeight: 700, fontSize: 13, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ca-paper-100)' }}>{label}</span>}
    </div>
  );
}

function Stars({ n = 5, size = 15 }) {
  return <div style={{ display: 'flex', gap: 3, color: 'var(--ca-red-500)' }}>
    {Array.from({ length: n }).map((_, i) => <i key={i} data-lucide="star" style={{ width: size, height: size, fill: 'currentColor' }} />)}
  </div>;
}

Object.assign(window, { useLucide, Icon, Button, Eyebrow, Crest, Wordmark, IndexRing, SectionLabel, Photo, Stars });
