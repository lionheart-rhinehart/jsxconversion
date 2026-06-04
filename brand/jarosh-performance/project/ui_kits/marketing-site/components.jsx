// Jarosh Performance · marketing-site UI kit
// Shared atomic components: Icon, Button, Eyebrow, Tag, NavBar, Footer.

const { useState, useEffect, useRef } = React;

const Icon = ({ name, fill = false, size, style, className = "" }) => (
  <span className={`material-symbols-rounded ${fill ? "fill" : ""} ${className}`} style={{ fontSize: size, ...style }}>{name}</span>
);

const Eyebrow = ({ children, className = "" }) => (
  <p className={`section-eyebrow ${className}`}>{children}</p>
);

// Bracket-tag eyebrow: [ THE BASELINE ]
const Tag = ({ children, className = "" }) => (
  <p className={`tag-eyebrow ${className}`}>{children}</p>
);

const Button = ({ variant = "primary", size, icon, iconRight, children, onClick, className = "", ...rest }) => (
  <button className={`btn btn-${variant}${size ? " btn-" + size : ""} ${className}`} onClick={onClick} {...rest}>
    {icon && <Icon name={icon} />}
    {children}
    {iconRight && <Icon name={iconRight} className="arrow" />}
  </button>
);

const LogoLockup = ({ light = false }) => (
  <div className="nav-logo">
    <img src="../../assets/logo-mark.svg" alt="Jarosh Performance" />
    <span className="nav-wordmark">
      <span className="n1" style={light ? { color: "#fff" } : null}>Jarosh</span>
      <span className="n2">Performance</span>
    </span>
  </div>
);

// =========================== NAV =================================
const NavBar = ({ onBook }) => (
  <>
    <div className="nav-banner">
      <div className="nav-banner-inner">
        <a href="#"><Icon name="bolt" />Now enrolling for the Winter SUPERCHARGED intake — Ankeny, IA <Icon name="arrow_forward" /></a>
      </div>
    </div>
    <nav className="navbar">
      <div className="kit-container nav-inner">
        <LogoLockup />
        <div className="nav-spacer" />
        <div className="nav-links">
          <a className="nav-link">Programs <Icon name="expand_more" /></a>
          <a className="nav-link">The Method</a>
          <a className="nav-link">Results</a>
          <a className="nav-link" title="Location"><Icon name="location_on" /></a>
          <Button variant="primary" size="sm" iconRight="arrow_forward" onClick={onBook}>Book An Assessment</Button>
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
            <img src="../../assets/logo-mark.svg" alt="" />
            <span className="nav-wordmark"><span className="n1">Jarosh</span><span className="n2">Performance</span></span>
          </div>
          <p className="footer-sub">Speed · Agility · Strength · Power. Measured progress for the next generation of athletes. Ankeny, IA.</p>
          <form className="footer-join" onSubmit={e => e.preventDefault()}>
            <input type="email" placeholder="Parent email" />
            <button type="submit">Join</button>
          </form>
        </div>
        <div>
          <h5><Icon name="bolt" /> Train</h5>
          <ul>
            <li><a>SUPERCHARGED Speed</a></li>
            <li><a>Agility &amp; Change of Direction</a></li>
            <li><a>Strength Development</a></li>
            <li><a>Power &amp; Explosiveness</a></li>
            <li><a>Female Athlete Program</a></li>
            <li><a>1-on-1 Coaching</a></li>
          </ul>
        </div>
        <div>
          <h5><Icon name="straighten" /> Programs</h5>
          <ul>
            <li><a>Foundations (8–12)</a></li>
            <li><a>Competitive Edge (13–15)</a></li>
            <li><a>College Prep (16–18)</a></li>
            <li><a>In-Season Maintenance</a></li>
            <li><a>The Baseline Assessment</a></li>
          </ul>
        </div>
        <div>
          <h5>Facility</h5>
          <ul>
            <li><a>About Nick Jarosh</a></li>
            <li><a>The Method</a></li>
            <li><a>Results &amp; Data</a></li>
            <li><a>405 SE Magazine Rd, Ankeny</a></li>
            <li><a>(515) 371-5881</a></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2026 Jarosh Performance. All rights reserved.</span>
        <span style={{display:'flex', gap: 18}}>
          <a>Privacy</a><a>Terms</a><a>#notjustaspeedprogram</a>
        </span>
      </div>
    </div>
  </footer>
);

Object.assign(window, { Icon, Eyebrow, Tag, Button, LogoLockup, NavBar, Footer });
