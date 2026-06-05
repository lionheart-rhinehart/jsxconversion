// Batti-Performance kit — Footer
function Footer({ onApply }) {
  return (
    <footer className="ft">
      <div className="bp-container">
        <div className="ft-grid">
          <div>
            <Logo />
            <p style={{ color: "var(--fg-muted-dark)", maxWidth: 320, marginTop: "var(--s-4)", fontSize: 15 }}>
              Where athletes come to dominate. Guaranteed +3″ vertical and +1 mph speed in 30 sessions — or we train them free.
            </p>
            <div style={{ marginTop: "var(--s-5)" }}>
              <Btn variant="primary" onClick={onApply} icon="arrow_forward">Apply Now</Btn>
            </div>
          </div>
          <div>
            <h4>Explore</h4>
            <a href="#programs">Programs</a>
            <a href="#system">The System</a>
            <a href="#results">Results</a>
            <a href="#locations">Locations</a>
            <a href="#about">About Us</a>
          </div>
          <div>
            <h4>Locations</h4>
            <a href="#locations">Orland Park, IL</a>
            <a href="#locations">Manteno, IL</a>
            <a href="#locations">Gilbert, AZ</a>
            <h4 style={{ marginTop: "var(--s-5)" }}>Contact</h4>
            <a href="tel:7088974327">(708) 897-4327</a>
          </div>
        </div>
        <div className="ft-bottom">
          <span>© {new Date().getFullYear()} Batti-Performance, LLC. All rights reserved.</span>
          <span style={{ display: "flex", gap: 20 }}>
            <a href="#" style={{ display: "inline", padding: 0 }}>Privacy</a>
            <a href="#" style={{ display: "inline", padding: 0 }}>Terms of Service</a>
          </span>
        </div>
      </div>
    </footer>
  );
}
Object.assign(window, { Footer });
