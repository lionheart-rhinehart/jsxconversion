/* ============================================================
   SMAA Website UI Kit — Header (sticky nav)
   ============================================================ */
function Header({ onGetStarted }) {
  const [scrolled, setScrolled] = React.useState(false);
  const [menu, setMenu] = React.useState(false);
  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12 ||
      (document.querySelector('.smaa-scroll')?.scrollTop || 0) > 12);
    const sc = document.querySelector('.smaa-scroll');
    (sc || window).addEventListener('scroll', onScroll);
    return () => (sc || window).removeEventListener('scroll', onScroll);
  }, []);

  const links = ['Start Here', 'Schedule & Pricing', 'Success Stories'];
  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: scrolled ? 'rgba(11,18,25,.86)' : 'var(--ink-900)',
      backdropFilter: scrolled ? 'blur(10px)' : 'none',
      borderBottom: '1px solid ' + (scrolled ? 'rgba(255,255,255,.08)' : 'transparent'),
      transition: 'all .2s ease',
    }}>
      <Container style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 76, gap: 20 }}>
        <a href="#top" style={{ display: 'flex', alignItems: 'center' }}>
          <img src="../../assets/logo.webp" alt="Southern Maine Athlete Academy"
               style={{ height: 38 }} />
        </a>

        <nav className="smaa-desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: 30 }}>
          {links.map(l => (
            <a key={l} href="#" onClick={e => e.preventDefault()}
               className="smaa-navlink"
               style={{ color: 'var(--fg-on-dark2)', fontSize: 14, fontWeight: 600,
                 textDecoration: 'none', letterSpacing: '.01em' }}>{l}</a>
          ))}
          <CTAButton size="sm" onClick={onGetStarted}>Get Started</CTAButton>
        </nav>

        <button className="smaa-burger" onClick={() => setMenu(m => !m)}
          style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', color: '#fff' }}>
          <Icon name={menu ? 'x' : 'menu'} size={26} color="#fff" />
        </button>
      </Container>

      {menu && (
        <div className="smaa-mobile-menu" style={{ background: 'var(--ink-800)', padding: '12px 24px 20px',
          display: 'flex', flexDirection: 'column', gap: 6 }}>
          {links.map(l => (
            <a key={l} href="#" onClick={e => { e.preventDefault(); setMenu(false); }}
               style={{ color: '#fff', fontSize: 16, fontWeight: 600, padding: '10px 0',
                 textDecoration: 'none', borderBottom: '1px solid rgba(255,255,255,.08)' }}>{l}</a>
          ))}
          <div style={{ marginTop: 10 }}>
            <CTAButton full onClick={() => { setMenu(false); onGetStarted(); }}>Get Started</CTAButton>
          </div>
        </div>
      )}
    </header>
  );
}
Object.assign(window, { Header });
