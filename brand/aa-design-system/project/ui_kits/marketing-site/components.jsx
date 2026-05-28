// Athletes Acceleration · marketing-site UI kit
// Shared atomic components: Icon, Button, Eyebrow, NavBar, Footer.

const { useState, useEffect, useRef } = React;

const Icon = ({ name, fill = false, size, style, className = "" }) => (
  <span
    className={`material-symbols-rounded ${fill ? "fill" : ""} ${className}`}
    style={{ fontSize: size, ...style }}
  >
    {name}
  </span>
);

const Eyebrow = ({ children, className = "" }) => (
  <p className={`section-eyebrow ${className}`}>{children}</p>
);

const Button = ({ variant = "primary", size, icon, iconRight, children, onClick, className = "", ...rest }) => (
  <button className={`btn btn-${variant}${size ? " btn-" + size : ""} ${className}`} onClick={onClick} {...rest}>
    {icon && <Icon name={icon} />}
    {children}
    {iconRight && <Icon name={iconRight} className="arrow" />}
  </button>
);

// =========================== NAV =================================
const NavBar = ({ onBook }) => (
  <>
    <div className="nav-banner">
      <div className="nav-banner-inner">
        <a href="#">Become A Founding Athlete. Opening Soon in Westfield, IN <Icon name="arrow_forward" size={16} /></a>
      </div>
    </div>
    <nav className="navbar">
      <div className="kit-container nav-inner">
        <div className="nav-logo">
          <img src="../../assets/logo.png" alt="Athletes Acceleration" />
          <span className="nav-wordmark">Athletes Acceleration<span className="dot">.</span></span>
        </div>
        <div className="nav-spacer" />
        <div className="nav-links">
          <a className="nav-link">Programs <Icon name="expand_more" /></a>
          <a className="nav-link">Training <Icon name="expand_more" /></a>
          <a className="nav-link" title="Locations"><Icon name="location_on" /></a>
          <Button variant="primary" size="sm" iconRight="arrow_forward" onClick={onBook}>Book Assessment</Button>
        </div>
      </div>
    </nav>
  </>
);

// =========================== FOOTER =================================
const Footer = () => (
  <footer className="footer">
    <div className="kit-container">
      <div className="footer-grid">
        <div>
          <div className="footer-brand">
            <img src="../../assets/logo.png" alt="" />
            <span className="nav-wordmark">Athletes Acceleration<span className="dot">.</span></span>
          </div>
          <p className="footer-sub">Get training tips, performance insights, and early access to new programs.</p>
          <form className="footer-join" onSubmit={e => e.preventDefault()}>
            <input type="email" placeholder="Your email" />
            <button type="submit">Join</button>
          </form>
        </div>
        <div>
          <h5><Icon name="bolt" /> Train</h5>
          <ul>
            <li><a>Speed Training</a></li>
            <li><a>Strength Training</a></li>
            <li><a>Power Training</a></li>
            <li><a>Multi-Sport Foundation</a></li>
            <li><a>Competitive Edge</a></li>
            <li><a>College Prep</a></li>
          </ul>
        </div>
        <div>
          <h5><Icon name="location_on" /> Locations</h5>
          <ul>
            <li><a>Milford, OH</a></li>
            <li><a>Indianapolis, IN</a></li>
            <li><a>Carmel, IN</a></li>
            <li><a>Noblesville, IN</a></li>
            <li><a>Westfield, IN</a></li>
            <li><a>View All Locations →</a></li>
          </ul>
        </div>
        <div>
          <h5>Company</h5>
          <ul>
            <li><a>About Us</a></li>
            <li><a>Our Methodology</a></li>
            <li><a>Results</a></li>
            <li><a>Careers</a></li>
            <li><a>Contact</a></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2026 Athletes Acceleration Sports Performance. All rights reserved.</span>
        <span style={{display:'flex', gap: 18}}>
          <a>Privacy Policy</a><a>Terms of Service</a><a>Accessibility</a>
        </span>
      </div>
    </div>
  </footer>
);

Object.assign(window, { Icon, Eyebrow, Button, NavBar, Footer });
