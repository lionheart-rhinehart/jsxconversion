/* Castille Academy marketing · Nav + Footer */
const { useState: useStateNav, useEffect: useEffectNav } = React;

function Nav({ onBook }) {
  const [scrolled, setScrolled] = useStateNav(false);
  const [open, setOpen] = useStateNav(false);
  useEffectNav(() => {
    const el = document.getElementById('site-scroll');
    const onScroll = () => setScrolled((el ? el.scrollTop : window.scrollY) > 60);
    const target = el || window;
    target.addEventListener('scroll', onScroll);
    return () => target.removeEventListener('scroll', onScroll);
  }, []);
  const links = ['Programs', 'Method', 'Campuses', 'Results'];
  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: scrolled ? 'rgba(0,0,0,0.9)' : 'transparent',
      backdropFilter: scrolled ? 'blur(16px)' : 'none',
      borderBottom: scrolled ? '1px solid var(--ca-ink-700)' : '1px solid transparent',
      transition: 'all var(--dur-base) var(--ease-out)',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '18px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Wordmark tone="bone" size={19} />
        <nav style={{ display: 'flex', gap: 30 }}>
          {links.map((l, i) => (
            <a key={l} href="#" style={{ fontFamily: 'var(--font-cond)', fontWeight: 600, fontSize: 14, letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none', color: i === 0 ? 'var(--ca-red-500)' : 'var(--ca-ink-200)' }}>{l}</a>
          ))}
        </nav>
        <Button variant="primary" onClick={onBook} style={{ padding: '11px 18px', fontSize: 14 }}>Book Assessment</Button>
      </div>
    </header>
  );
}

function Footer() {
  const cols = [
    { h: 'Programs', items: ['Prep · 8–11', 'Rise · 12–15', 'Varsity · 16–18', 'Adult Performance'] },
    { h: 'Academy', items: ['The Method', 'The Castille Index', 'Our Coaches', 'Careers'] },
    { h: 'Campuses', items: ['Carmel', 'Indianapolis', 'Noblesville', 'Westfield'] },
  ];
  return (
    <footer style={{ background: 'var(--ca-ink-950)', color: 'var(--ca-paper-100)', padding: '72px 32px 36px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1fr', gap: 40, paddingBottom: 40, borderBottom: '1px solid var(--ca-ink-700)' }}>
          <div>
            <Wordmark tone="bone" size={20} />
            <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 15, color: 'var(--ca-ink-300)', margin: '18px 0 0', maxWidth: 260 }}>Disciplina · Vis · Victoria</p>
          </div>
          {cols.map((c) => (
            <div key={c.h}>
              <div style={{ fontFamily: 'var(--font-cond)', fontWeight: 600, fontSize: 12, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--ca-red-300)', marginBottom: 16 }}>{c.h}</div>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 11 }}>
                {c.items.map((it) => <li key={it}><a href="#" style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ca-ink-200)', textDecoration: 'none' }}>{it}</a></li>)}
              </ul>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 24 }}>
          <span style={{ fontFamily: 'var(--font-cond)', fontWeight: 500, fontSize: 12, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ca-ink-400)' }}>© MMXXIV Castille Academy · Est. MMXXIV</span>
          <div style={{ display: 'flex', gap: 16, color: 'var(--ca-ink-300)' }}>
            <a href="#" aria-label="Instagram" style={{ color: 'inherit', display: 'flex' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>
            </a>
            <a href="#" aria-label="YouTube" style={{ color: 'inherit', display: 'flex' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><rect x="2.5" y="6" width="19" height="12" rx="3.5"/><path d="M10.5 9.2v5.6l4.6-2.8z" fill="currentColor" stroke="none"/></svg>
            </a>
            <a href="#" aria-label="X" style={{ color: 'inherit', display: 'flex' }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 3h3.2l-7 8 8.2 10.9h-6.4l-5-6.6-5.8 6.6H1.5l7.5-8.6L1 3h6.6l4.5 6zm-1.1 16.9h1.8L7.6 4.8H5.7z"/></svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

Object.assign(window, { Nav, Footer });
