/* @ds-bundle: {"format":3,"namespace":"AthletesAccelerationDesignSystem_019e2d","components":[],"sourceHashes":{"ui_kits/marketing-site/components.jsx":"4cd0f3592a86","ui_kits/marketing-site/sections.jsx":"f329a3153b80"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.AthletesAccelerationDesignSystem_019e2d = window.AthletesAccelerationDesignSystem_019e2d || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// ui_kits/marketing-site/components.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
// Athletes Acceleration · marketing-site UI kit
// Shared atomic components: Icon, Button, Eyebrow, NavBar, Footer.

const {
  useState,
  useEffect,
  useRef
} = React;
const Icon = ({
  name,
  fill = false,
  size,
  style,
  className = ""
}) => /*#__PURE__*/React.createElement("span", {
  className: `material-symbols-rounded ${fill ? "fill" : ""} ${className}`,
  style: {
    fontSize: size,
    ...style
  }
}, name);
const Eyebrow = ({
  children,
  className = ""
}) => /*#__PURE__*/React.createElement("p", {
  className: `section-eyebrow ${className}`
}, children);
const Button = ({
  variant = "primary",
  size,
  icon,
  iconRight,
  children,
  onClick,
  className = "",
  ...rest
}) => /*#__PURE__*/React.createElement("button", _extends({
  className: `btn btn-${variant}${size ? " btn-" + size : ""} ${className}`,
  onClick: onClick
}, rest), icon && /*#__PURE__*/React.createElement(Icon, {
  name: icon
}), children, iconRight && /*#__PURE__*/React.createElement(Icon, {
  name: iconRight,
  className: "arrow"
}));

// =========================== NAV =================================
const NavBar = ({
  onBook
}) => /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
  className: "nav-banner"
}, /*#__PURE__*/React.createElement("div", {
  className: "nav-banner-inner"
}, /*#__PURE__*/React.createElement("a", {
  href: "#"
}, "Become A Founding Athlete. Opening Soon in Westfield, IN ", /*#__PURE__*/React.createElement(Icon, {
  name: "arrow_forward",
  size: 16
})))), /*#__PURE__*/React.createElement("nav", {
  className: "navbar"
}, /*#__PURE__*/React.createElement("div", {
  className: "kit-container nav-inner"
}, /*#__PURE__*/React.createElement("div", {
  className: "nav-logo"
}, /*#__PURE__*/React.createElement("img", {
  src: "../../assets/logo.png",
  alt: "Athletes Acceleration"
}), /*#__PURE__*/React.createElement("span", {
  className: "nav-wordmark"
}, "Athletes Acceleration", /*#__PURE__*/React.createElement("span", {
  className: "dot"
}, "."))), /*#__PURE__*/React.createElement("div", {
  className: "nav-spacer"
}), /*#__PURE__*/React.createElement("div", {
  className: "nav-links"
}, /*#__PURE__*/React.createElement("a", {
  className: "nav-link"
}, "Programs ", /*#__PURE__*/React.createElement(Icon, {
  name: "expand_more"
})), /*#__PURE__*/React.createElement("a", {
  className: "nav-link"
}, "Training ", /*#__PURE__*/React.createElement(Icon, {
  name: "expand_more"
})), /*#__PURE__*/React.createElement("a", {
  className: "nav-link",
  title: "Locations"
}, /*#__PURE__*/React.createElement(Icon, {
  name: "location_on"
})), /*#__PURE__*/React.createElement(Button, {
  variant: "primary",
  size: "sm",
  iconRight: "arrow_forward",
  onClick: onBook
}, "Book Assessment")))));

// =========================== FOOTER =================================
const Footer = () => /*#__PURE__*/React.createElement("footer", {
  className: "footer"
}, /*#__PURE__*/React.createElement("div", {
  className: "kit-container"
}, /*#__PURE__*/React.createElement("div", {
  className: "footer-grid"
}, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
  className: "footer-brand"
}, /*#__PURE__*/React.createElement("img", {
  src: "../../assets/logo.png",
  alt: ""
}), /*#__PURE__*/React.createElement("span", {
  className: "nav-wordmark"
}, "Athletes Acceleration", /*#__PURE__*/React.createElement("span", {
  className: "dot"
}, "."))), /*#__PURE__*/React.createElement("p", {
  className: "footer-sub"
}, "Get training tips, performance insights, and early access to new programs."), /*#__PURE__*/React.createElement("form", {
  className: "footer-join",
  onSubmit: e => e.preventDefault()
}, /*#__PURE__*/React.createElement("input", {
  type: "email",
  placeholder: "Your email"
}), /*#__PURE__*/React.createElement("button", {
  type: "submit"
}, "Join"))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h5", null, /*#__PURE__*/React.createElement(Icon, {
  name: "bolt"
}), " Train"), /*#__PURE__*/React.createElement("ul", null, /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", null, "Speed Training")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", null, "Strength Training")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", null, "Power Training")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", null, "Multi-Sport Foundation")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", null, "Competitive Edge")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", null, "College Prep")))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h5", null, /*#__PURE__*/React.createElement(Icon, {
  name: "location_on"
}), " Locations"), /*#__PURE__*/React.createElement("ul", null, /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", null, "Milford, OH")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", null, "Indianapolis, IN")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", null, "Carmel, IN")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", null, "Noblesville, IN")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", null, "Westfield, IN")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", null, "View All Locations \u2192")))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h5", null, "Company"), /*#__PURE__*/React.createElement("ul", null, /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", null, "About Us")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", null, "Our Methodology")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", null, "Results")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", null, "Careers")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", null, "Contact"))))), /*#__PURE__*/React.createElement("div", {
  className: "footer-bottom"
}, /*#__PURE__*/React.createElement("span", null, "\xA9 2026 Athletes Acceleration Sports Performance. All rights reserved."), /*#__PURE__*/React.createElement("span", {
  style: {
    display: 'flex',
    gap: 18
  }
}, /*#__PURE__*/React.createElement("a", null, "Privacy Policy"), /*#__PURE__*/React.createElement("a", null, "Terms of Service"), /*#__PURE__*/React.createElement("a", null, "Accessibility")))));
Object.assign(window, {
  Icon,
  Eyebrow,
  Button,
  NavBar,
  Footer
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/marketing-site/components.jsx", error: String((e && e.message) || e) }); }

// ui_kits/marketing-site/sections.jsx
try { (() => {
// Athletes Acceleration · marketing-site UI kit
// Page-level sections.

// Sourced from data/testimonials.json. Curated for AA-aligned outcome language
// (speed, strength, confidence). Genesis-specific phrasing softened where needed.
const TESTIMONIALS = [{
  name: "Danny O'Neil",
  role: "Athlete",
  date: "2024",
  quote: "It has helped me become a much better athlete and more explosive on the field. The speed development and strength work has helped me become a more complete athlete."
}, {
  name: "Erica Shaw",
  role: "Parent",
  date: "2025",
  quote: "My son attends the speed and agility training youth classes 2× a week. He loves it. I have seen a huge improvement in his speed, strength and overall athletic performance."
}, {
  name: "Brandon Merrill",
  role: "Parent",
  date: "2025",
  quote: "The training has been extremely beneficial for our 10-year-old's recovery. Not only has it helped him physically, but he has gained confidence to push through difficulties and adversity."
}, {
  name: "Andy Johnson",
  role: "Parent",
  date: "2025",
  quote: "We've been using them for my son's speed and agility training for years. They push the athletes hard, and encourage them along the way. I have seen significant growth in my son as an athlete and young man."
}, {
  name: "Jaron Turner",
  role: "Parent",
  date: "2025",
  quote: "Our son has been going for a few months. He loves it, and we have seen a huge improvement in his strength, speed, and his confidence on the basketball court."
}, {
  name: "Kim Toomey",
  role: "Adult Athlete",
  date: "2025",
  quote: "It has been 2 months and my daughter no longer has any back pain. She is a sophomore in high school and is much stronger. I wasn't expecting my athletic performance to improve so much."
}, {
  name: "Grace Turner",
  role: "Athlete",
  date: "2025",
  quote: "I have never been a part of an actual gym before. They are very encouraging and are always willing to modify the workouts to fit to my needs and my strength. I have never felt so strong."
}, {
  name: "Jennifer Feeney",
  role: "Parent",
  date: "2024",
  quote: "An absolutely life changing experience for me and my family. They helped my son put on 25+ pounds for football season the healthy way. He has accepted an offer to continue playing football with a large Division 2 school."
}];
const LOCATIONS = [{
  city: "Carmel, IN",
  meta: "11min drive · 4 programs running"
}, {
  city: "Indianapolis, IN",
  meta: "18min drive · 4 programs running"
}, {
  city: "Noblesville, IN",
  meta: "22min drive · 3 programs running"
}, {
  city: "Westfield, IN",
  meta: "Opening soon · Founding members open"
}, {
  city: "Milford, OH",
  meta: "Flagship · 5 programs running"
}];

// =========================== HERO ===========================
const Hero = ({
  onBook
}) => /*#__PURE__*/React.createElement("section", {
  className: "hero"
}, /*#__PURE__*/React.createElement("div", {
  className: "hero-photo",
  style: {
    backgroundImage: "url('../../assets/hero-sprint-female.jpg')"
  }
}), /*#__PURE__*/React.createElement("div", {
  className: "hero-content kit-container"
}, /*#__PURE__*/React.createElement(Eyebrow, {
  className: "hero-eyebrow eyebrow-badge"
}, "Find Your Starting Line"), /*#__PURE__*/React.createElement("h1", {
  className: "hero-headline"
}, "Your Kid Has", /*#__PURE__*/React.createElement("br", null), "The ", /*#__PURE__*/React.createElement("span", {
  className: "accent"
}, "Drive."), /*#__PURE__*/React.createElement("br", null), "We Build The ", /*#__PURE__*/React.createElement("span", {
  className: "accent"
}, "Athlete.")), /*#__PURE__*/React.createElement("div", {
  className: "hero-sub"
}, /*#__PURE__*/React.createElement(Icon, {
  name: "verified",
  fill: true
}), "Guaranteed results in 90 days. Or your training is on us."), /*#__PURE__*/React.createElement("div", {
  className: "hero-cta-row"
}, /*#__PURE__*/React.createElement(Button, {
  variant: "primary",
  iconRight: "arrow_forward",
  onClick: onBook
}, "Book Your Athletic Assessment"), /*#__PURE__*/React.createElement(Button, {
  variant: "outline-light",
  iconRight: "chevron_right"
}, "See Real Results"))));

// =========================== PILLARS ===========================
const Pillars = () => {
  const items = [{
    num: "01",
    icon: "sprint",
    verb: "Accelerate",
    noun: "Speed",
    text: "First step quickness, max velocity, multi-directional speed. We rebuild the biomechanical sequence of the sprint."
  }, {
    num: "02",
    icon: "fitness_center",
    verb: "Dominate",
    noun: "Strength",
    text: "Velocity-based training and multi-planar movements. Functional armor that transfers to the field."
  }, {
    num: "03",
    icon: "bolt",
    verb: "Unleash",
    noun: "Power",
    text: "Plyometric progressions, med ball work, rate of force development. The bridge between strength and game-day."
  }];
  return /*#__PURE__*/React.createElement("section", {
    className: "section section--dark"
  }, /*#__PURE__*/React.createElement("div", {
    className: "kit-container"
  }, /*#__PURE__*/React.createElement(Eyebrow, null, "The Truth About Youth Sports"), /*#__PURE__*/React.createElement("h2", {
    className: "section-headline"
  }, "Most Young Athletes", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
    className: "accent"
  }, "Never Reach"), " Their Ceiling."), /*#__PURE__*/React.createElement("p", {
    style: {
      maxWidth: '60ch',
      marginTop: 24,
      color: 'rgba(255,255,255,0.7)',
      fontSize: 17,
      lineHeight: 1.6
    }
  }, "Talent isn't enough. Without dedicated speed, strength, and power training, athlete potential turns into plateau. We eliminate the guesswork through our three core pillars."), /*#__PURE__*/React.createElement("div", {
    className: "pillars"
  }, items.map(p => /*#__PURE__*/React.createElement("div", {
    className: "pillar-card",
    key: p.num
  }, /*#__PURE__*/React.createElement("div", {
    className: "pillar-num"
  }, p.num), /*#__PURE__*/React.createElement("div", {
    className: "pillar-icon"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: p.icon,
    fill: true
  })), /*#__PURE__*/React.createElement("h3", {
    className: "pillar-title"
  }, /*#__PURE__*/React.createElement("span", {
    className: "accent"
  }, p.verb, ":"), /*#__PURE__*/React.createElement("br", null), p.noun), /*#__PURE__*/React.createElement("p", {
    className: "pillar-tagline"
  }, p.text))))));
};

// =========================== PROGRAMS ===========================
const Programs = () => {
  const items = [{
    n: "01",
    age: "Ages 8–12",
    title: "Multi-Sport Foundation",
    icon: "child_care",
    bullets: ["Running Mechanics", "Bodyweight Strength", "Agility Games"]
  }, {
    n: "02",
    age: "Ages 13–15",
    title: "Competitive Edge",
    icon: "sprint",
    bullets: ["Intro to Lifting", "Vertical Jump", "First Step Quickness"]
  }, {
    n: "03",
    age: "Ages 16–18",
    title: "College Prep",
    icon: "school",
    bullets: ["Max Strength", "Sport Specific Power", "Recruiting Support"]
  }];
  return /*#__PURE__*/React.createElement("section", {
    className: "section"
  }, /*#__PURE__*/React.createElement("div", {
    className: "kit-container"
  }, /*#__PURE__*/React.createElement(Eyebrow, null, "Built For Every Stage"), /*#__PURE__*/React.createElement("h2", {
    className: "section-headline"
  }, "Programs Designed For", /*#__PURE__*/React.createElement("br", null), "Specific Developmental Needs."), /*#__PURE__*/React.createElement("div", {
    className: "programs"
  }, items.map(p => /*#__PURE__*/React.createElement("a", {
    className: "prog-card",
    key: p.n
  }, /*#__PURE__*/React.createElement("div", {
    className: "prog-head"
  }, /*#__PURE__*/React.createElement("div", {
    className: "prog-icon"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: p.icon
  })), /*#__PURE__*/React.createElement("span", {
    className: "prog-num"
  }, p.n)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "prog-age"
  }, p.age), /*#__PURE__*/React.createElement("h3", {
    className: "prog-title"
  }, p.title)), /*#__PURE__*/React.createElement("ul", {
    className: "prog-bullets"
  }, p.bullets.map(b => /*#__PURE__*/React.createElement("li", {
    key: b
  }, b))), /*#__PURE__*/React.createElement("span", {
    className: "prog-cta"
  }, "Learn more ", /*#__PURE__*/React.createElement(Icon, {
    name: "arrow_forward"
  })))))));
};

// =========================== METHOD ===========================
const Method = ({
  onBook
}) => {
  const steps = [{
    num: "01",
    title: "Precision Assessment",
    text: "Day one: we baseline your athlete's 10/20/40 speed, vertical jump, and full mobility screen. No guessing. Just data."
  }, {
    num: "02",
    title: "Customized Training Protocol",
    text: "We build a program around their specific gaps. Not a one-size-fits-all template. Every session targets what actually moves the needle."
  }, {
    num: "03",
    title: "Measurable Transformation",
    text: "+1 mph speed. +3″ vertical. Monthly retesting proves the progress. That's why we guarantee the results."
  }];
  return /*#__PURE__*/React.createElement("section", {
    className: "section section--gray"
  }, /*#__PURE__*/React.createElement("div", {
    className: "kit-container"
  }, /*#__PURE__*/React.createElement(Eyebrow, null, "The Athletes Acceleration Method"), /*#__PURE__*/React.createElement("h2", {
    className: "section-headline"
  }, "Assess. Build.", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
    className: "accent"
  }, "Dominate."), /*#__PURE__*/React.createElement("br", null), "That's The System."), /*#__PURE__*/React.createElement("div", {
    className: "method"
  }, steps.map(s => /*#__PURE__*/React.createElement("div", {
    className: "method-step",
    key: s.num
  }, /*#__PURE__*/React.createElement("div", {
    className: "method-num"
  }, s.num), /*#__PURE__*/React.createElement("h4", {
    className: "method-title"
  }, s.title), /*#__PURE__*/React.createElement("p", {
    className: "method-text"
  }, s.text)))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 56
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    iconRight: "arrow_forward",
    onClick: onBook
  }, "Book Your Free Assessment"))));
};

// =========================== TESTIMONIALS ===========================
const Testimonials = () => {
  const trackRef = React.useRef(null);
  const scroll = dir => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({
      left: dir * 380,
      behavior: 'smooth'
    });
  };
  return /*#__PURE__*/React.createElement("section", {
    className: "section"
  }, /*#__PURE__*/React.createElement("div", {
    className: "kit-container"
  }, /*#__PURE__*/React.createElement(Eyebrow, null, "Real Results"), /*#__PURE__*/React.createElement("h2", {
    className: "section-headline"
  }, "Parents Don't Have", /*#__PURE__*/React.createElement("br", null), "To Take Our", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
    className: "accent"
  }, "Word For It.")), /*#__PURE__*/React.createElement("div", {
    className: "testimonial-row"
  }, /*#__PURE__*/React.createElement("div", {
    className: "testimonial-track",
    ref: trackRef
  }, TESTIMONIALS.map(t => /*#__PURE__*/React.createElement("div", {
    className: "testimonial-card",
    key: t.name
  }, /*#__PURE__*/React.createElement("div", {
    className: "testimonial-stars"
  }, Array.from({
    length: 5
  }).map((_, i) => /*#__PURE__*/React.createElement(Icon, {
    key: i,
    name: "star",
    fill: true
  }))), /*#__PURE__*/React.createElement("p", {
    className: "testimonial-quote"
  }, "\u201C", t.quote, "\u201D"), /*#__PURE__*/React.createElement("p", {
    className: "testimonial-byline"
  }, /*#__PURE__*/React.createElement("b", null, t.name), ". ", t.role)))), /*#__PURE__*/React.createElement("div", {
    className: "testimonial-arrows"
  }, /*#__PURE__*/React.createElement("button", {
    className: "testimonial-arrow",
    onClick: () => scroll(-1)
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "arrow_back"
  })), /*#__PURE__*/React.createElement("button", {
    className: "testimonial-arrow",
    onClick: () => scroll(1)
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "arrow_forward"
  }))))));
};

// =========================== GUARANTEE ===========================
const Guarantee = () => /*#__PURE__*/React.createElement("section", {
  className: "guarantee"
}, /*#__PURE__*/React.createElement("div", {
  className: "kit-container guarantee-grid"
}, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
  className: "guarantee-verified"
}, /*#__PURE__*/React.createElement(Icon, {
  name: "verified",
  fill: true,
  size: 14
}), "The Guarantee"), /*#__PURE__*/React.createElement("h2", {
  className: "guarantee-headline"
}, "We Put Our Money", /*#__PURE__*/React.createElement("br", null), "Where ", /*#__PURE__*/React.createElement("span", {
  className: "accent"
}, "Our Mouth Is."))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
  className: "guarantee-stats"
}, /*#__PURE__*/React.createElement("div", {
  className: "guarantee-stat"
}, /*#__PURE__*/React.createElement("div", {
  className: "stat-num"
}, "+1", /*#__PURE__*/React.createElement("span", {
  className: "stat-unit"
}, "mph")), /*#__PURE__*/React.createElement("div", {
  className: "stat-label"
}, "Speed")), /*#__PURE__*/React.createElement("div", {
  className: "guarantee-stat"
}, /*#__PURE__*/React.createElement("div", {
  className: "stat-num"
}, "+3", /*#__PURE__*/React.createElement("span", {
  className: "stat-unit"
}, "\u2033")), /*#__PURE__*/React.createElement("div", {
  className: "stat-label"
}, "Vertical")), /*#__PURE__*/React.createElement("div", {
  className: "guarantee-stat"
}, /*#__PURE__*/React.createElement("div", {
  className: "stat-num"
}, "90", /*#__PURE__*/React.createElement("span", {
  className: "stat-unit"
}, "days")), /*#__PURE__*/React.createElement("div", {
  className: "stat-label"
}, "Or We Train Them Free"))), /*#__PURE__*/React.createElement("p", {
  className: "guarantee-prose"
}, "Every athlete starts with a baseline assessment. Every session is tracked. Every month, we retest. The data proves the progress. And if it doesn't, you don't pay until it does."))));

// =========================== LOCATION FINDER ===========================
const LocationFinder = () => {
  const [zip, setZip] = React.useState('');
  const [submitted, setSubmitted] = React.useState(false);
  return /*#__PURE__*/React.createElement("section", {
    className: "locfind"
  }, /*#__PURE__*/React.createElement("div", {
    className: "kit-container locfind-grid"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Eyebrow, null, "Find Your Starting Line"), /*#__PURE__*/React.createElement("h2", {
    className: "section-headline",
    style: {
      fontSize: 'clamp(36px,4.5vw,64px)'
    }
  }, "Locate Your", /*#__PURE__*/React.createElement("br", null), "Nearest Facility."), /*#__PURE__*/React.createElement("p", {
    className: "locfind-trust",
    style: {
      marginTop: 24
    }
  }, "Trusted by ", /*#__PURE__*/React.createElement("b", null, "thousands of parents")), /*#__PURE__*/React.createElement("form", {
    className: "zip-form",
    onSubmit: e => {
      e.preventDefault();
      setSubmitted(true);
    }
  }, /*#__PURE__*/React.createElement("input", {
    value: zip,
    onChange: e => setZip(e.target.value),
    placeholder: "Enter ZIP code",
    inputMode: "numeric"
  }), /*#__PURE__*/React.createElement("button", {
    type: "submit"
  }, "GO ", /*#__PURE__*/React.createElement(Icon, {
    name: "arrow_forward",
    size: 16
  })))), /*#__PURE__*/React.createElement("div", {
    className: "loc-list"
  }, LOCATIONS.map(l => /*#__PURE__*/React.createElement("div", {
    className: "loc-item",
    key: l.city
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "location_on",
    fill: true
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "loc-item-name"
  }, l.city), /*#__PURE__*/React.createElement("div", {
    className: "loc-item-meta"
  }, l.meta)), /*#__PURE__*/React.createElement(Icon, {
    name: "chevron_right",
    className: "chev"
  }))))));
};

// =========================== FINAL CTA ===========================
const FinalCTA = ({
  onBook
}) => /*#__PURE__*/React.createElement("section", {
  className: "final-cta"
}, /*#__PURE__*/React.createElement("div", {
  className: "final-cta-photo",
  style: {
    backgroundImage: "url('../../assets/photo-jump-male.jpg')"
  }
}), /*#__PURE__*/React.createElement("div", {
  className: "final-cta-content kit-container"
}, /*#__PURE__*/React.createElement(Eyebrow, {
  className: "eyebrow-badge"
}, "The Clock Is Ticking"), /*#__PURE__*/React.createElement("h2", {
  className: "final-cta-headline"
}, "The Longer You Wait,", /*#__PURE__*/React.createElement("br", null), "The More They", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
  className: "accent"
}, "Fall Behind.")), /*#__PURE__*/React.createElement("p", {
  style: {
    maxWidth: '48ch',
    color: 'rgba(255,255,255,0.75)',
    fontSize: 17,
    lineHeight: 1.55,
    margin: '0 0 32px'
  }
}, "The competition isn't resting. Secure your child's spot in our next intake and start building their athletic future today."), /*#__PURE__*/React.createElement("div", {
  className: "hero-cta-row"
}, /*#__PURE__*/React.createElement(Button, {
  variant: "primary",
  iconRight: "arrow_forward",
  onClick: onBook
}, "Book Assessment"), /*#__PURE__*/React.createElement(Button, {
  variant: "outline-light",
  iconRight: "chevron_right"
}, "View Schedules"))));
Object.assign(window, {
  Hero,
  Pillars,
  Programs,
  Method,
  Testimonials,
  Guarantee,
  LocationFinder,
  FinalCTA
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/marketing-site/sections.jsx", error: String((e && e.message) || e) }); }

})();
