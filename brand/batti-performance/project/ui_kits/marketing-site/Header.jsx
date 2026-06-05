// Batti-Performance kit — Header + mobile drawer
const NAV = [
  { label: "Programs", href: "#programs" },
  { label: "The System", href: "#system" },
  { label: "Results", href: "#results" },
  { label: "Locations", href: "#locations" },
  { label: "About", href: "#about" },
];

function Logo({ size = "md" }) {
  return (
    <a className="hd-logo" href="#top">
      <img className="hd-mark-img" src="../../assets/logo-monogram.png" alt="Batti-Performance monogram" />
      <span className="hd-word"><span className="r">BATTI</span>&#8211;PERFORMANCE</span>
    </a>
  );
}

function Header({ onApply }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <>
      <header className={"hd" + (scrolled ? " scrolled" : "")}>
        <div className="bp-container hd-inner">
          <Logo />
          <nav className="hd-nav">
            {NAV.map((n) => <a key={n.label} href={n.href}>{n.label}</a>)}
          </nav>
          <div className="hd-right">
            <Btn variant="primary" onClick={onApply}>Apply Now</Btn>
            <button className="hd-burger" onClick={() => setOpen(true)} aria-label="Menu"><Icon name="menu" /></button>
          </div>
        </div>
      </header>

      <div className={"drawer" + (open ? " open" : "")}>
        <div className="drawer-top">
          <Logo />
          <button onClick={() => setOpen(false)} aria-label="Close"><Icon name="close" style={{ fontSize: 30 }} /></button>
        </div>
        <nav className="drawer-nav">
          {NAV.map((n) => <a key={n.label} href={n.href} onClick={() => setOpen(false)}>{n.label}</a>)}
        </nav>
        <div style={{ marginTop: "auto" }}>
          <Btn variant="primary" lg onClick={() => { setOpen(false); onApply(); }}>Apply Now</Btn>
        </div>
      </div>
    </>
  );
}

Object.assign(window, { Header, Logo });
