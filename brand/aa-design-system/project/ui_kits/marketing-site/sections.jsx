// Athletes Acceleration · marketing-site UI kit
// Page-level sections.

// Sourced from data/testimonials.json. Curated for AA-aligned outcome language
// (speed, strength, confidence). Genesis-specific phrasing softened where needed.
const TESTIMONIALS = [
  { name: "Danny O'Neil",     role: "Athlete",        date: "2024", quote: "It has helped me become a much better athlete and more explosive on the field. The speed development and strength work has helped me become a more complete athlete." },
  { name: "Erica Shaw",       role: "Parent",         date: "2025", quote: "My son attends the speed and agility training youth classes 2× a week. He loves it. I have seen a huge improvement in his speed, strength and overall athletic performance." },
  { name: "Brandon Merrill",  role: "Parent",         date: "2025", quote: "The training has been extremely beneficial for our 10-year-old's recovery. Not only has it helped him physically, but he has gained confidence to push through difficulties and adversity." },
  { name: "Andy Johnson",     role: "Parent",         date: "2025", quote: "We've been using them for my son's speed and agility training for years. They push the athletes hard, and encourage them along the way. I have seen significant growth in my son as an athlete and young man." },
  { name: "Jaron Turner",     role: "Parent",         date: "2025", quote: "Our son has been going for a few months. He loves it, and we have seen a huge improvement in his strength, speed, and his confidence on the basketball court." },
  { name: "Kim Toomey",       role: "Adult Athlete",  date: "2025", quote: "It has been 2 months and my daughter no longer has any back pain. She is a sophomore in high school and is much stronger. I wasn't expecting my athletic performance to improve so much." },
  { name: "Grace Turner",     role: "Athlete",        date: "2025", quote: "I have never been a part of an actual gym before. They are very encouraging and are always willing to modify the workouts to fit to my needs and my strength. I have never felt so strong." },
  { name: "Jennifer Feeney",  role: "Parent",         date: "2024", quote: "An absolutely life changing experience for me and my family. They helped my son put on 25+ pounds for football season the healthy way. He has accepted an offer to continue playing football with a large Division 2 school." },
];

const LOCATIONS = [
  { city: "Carmel, IN", meta: "11min drive · 4 programs running" },
  { city: "Indianapolis, IN", meta: "18min drive · 4 programs running" },
  { city: "Noblesville, IN", meta: "22min drive · 3 programs running" },
  { city: "Westfield, IN", meta: "Opening soon · Founding members open" },
  { city: "Milford, OH", meta: "Flagship · 5 programs running" },
];

// =========================== HERO ===========================
const Hero = ({ onBook }) => (
  <section className="hero">
    <div className="hero-photo" style={{ backgroundImage: "url('../../assets/hero-sprint-female.jpg')" }} />
    <div className="hero-content kit-container">
      <Eyebrow className="hero-eyebrow eyebrow-badge">Find Your Starting Line</Eyebrow>
      <h1 className="hero-headline">
        Your Kid Has<br />The <span className="accent">Drive.</span><br />We Build The <span className="accent">Athlete.</span>
      </h1>
      <div className="hero-sub">
        <Icon name="verified" fill />
        Guaranteed results in 90 days. Or your training is on us.
      </div>
      <div className="hero-cta-row">
        <Button variant="primary" iconRight="arrow_forward" onClick={onBook}>Book Your Athletic Assessment</Button>
        <Button variant="outline-light" iconRight="chevron_right">See Real Results</Button>
      </div>
    </div>
  </section>
);

// =========================== PILLARS ===========================
const Pillars = () => {
  const items = [
    { num: "01", icon: "sprint", verb: "Accelerate", noun: "Speed", text: "First step quickness, max velocity, multi-directional speed. We rebuild the biomechanical sequence of the sprint." },
    { num: "02", icon: "fitness_center", verb: "Dominate", noun: "Strength", text: "Velocity-based training and multi-planar movements. Functional armor that transfers to the field." },
    { num: "03", icon: "bolt", verb: "Unleash", noun: "Power", text: "Plyometric progressions, med ball work, rate of force development. The bridge between strength and game-day." },
  ];
  return (
    <section className="section section--dark">
      <div className="kit-container">
        <Eyebrow>The Truth About Youth Sports</Eyebrow>
        <h2 className="section-headline">Most Young Athletes<br /><span className="accent">Never Reach</span> Their Ceiling.</h2>
        <p style={{maxWidth: '60ch', marginTop: 24, color: 'rgba(255,255,255,0.7)', fontSize: 17, lineHeight: 1.6}}>
          Talent isn't enough. Without dedicated speed, strength, and power training, athlete potential turns into plateau. We eliminate the guesswork through our three core pillars.
        </p>
        <div className="pillars">
          {items.map(p => (
            <div className="pillar-card" key={p.num}>
              <div className="pillar-num">{p.num}</div>
              <div className="pillar-icon"><Icon name={p.icon} fill /></div>
              <h3 className="pillar-title"><span className="accent">{p.verb}:</span><br />{p.noun}</h3>
              <p className="pillar-tagline">{p.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// =========================== PROGRAMS ===========================
const Programs = () => {
  const items = [
    { n: "01", age: "Ages 8–12", title: "Multi-Sport Foundation", icon: "child_care", bullets: ["Running Mechanics", "Bodyweight Strength", "Agility Games"] },
    { n: "02", age: "Ages 13–15", title: "Competitive Edge",     icon: "sprint",     bullets: ["Intro to Lifting", "Vertical Jump", "First Step Quickness"] },
    { n: "03", age: "Ages 16–18", title: "College Prep",          icon: "school",     bullets: ["Max Strength", "Sport Specific Power", "Recruiting Support"] },
  ];
  return (
    <section className="section">
      <div className="kit-container">
        <Eyebrow>Built For Every Stage</Eyebrow>
        <h2 className="section-headline">Programs Designed For<br />Specific Developmental Needs.</h2>
        <div className="programs">
          {items.map(p => (
            <a className="prog-card" key={p.n}>
              <div className="prog-head">
                <div className="prog-icon"><Icon name={p.icon} /></div>
                <span className="prog-num">{p.n}</span>
              </div>
              <div>
                <div className="prog-age">{p.age}</div>
                <h3 className="prog-title">{p.title}</h3>
              </div>
              <ul className="prog-bullets">
                {p.bullets.map(b => <li key={b}>{b}</li>)}
              </ul>
              <span className="prog-cta">Learn more <Icon name="arrow_forward" /></span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

// =========================== METHOD ===========================
const Method = ({ onBook }) => {
  const steps = [
    { num: "01", title: "Precision Assessment",        text: "Day one: we baseline your athlete's 10/20/40 speed, vertical jump, and full mobility screen. No guessing. Just data." },
    { num: "02", title: "Customized Training Protocol", text: "We build a program around their specific gaps. Not a one-size-fits-all template. Every session targets what actually moves the needle." },
    { num: "03", title: "Measurable Transformation",    text: "+1 mph speed. +3″ vertical. Monthly retesting proves the progress. That's why we guarantee the results." },
  ];
  return (
    <section className="section section--gray">
      <div className="kit-container">
        <Eyebrow>The Athletes Acceleration Method</Eyebrow>
        <h2 className="section-headline">Assess. Build.<br /><span className="accent">Dominate.</span><br />That's The System.</h2>
        <div className="method">
          {steps.map(s => (
            <div className="method-step" key={s.num}>
              <div className="method-num">{s.num}</div>
              <h4 className="method-title">{s.title}</h4>
              <p className="method-text">{s.text}</p>
            </div>
          ))}
        </div>
        <div style={{marginTop: 56}}>
          <Button variant="primary" iconRight="arrow_forward" onClick={onBook}>Book Your Free Assessment</Button>
        </div>
      </div>
    </section>
  );
};

// =========================== TESTIMONIALS ===========================
const Testimonials = () => {
  const trackRef = React.useRef(null);
  const scroll = dir => {
    const el = trackRef.current; if (!el) return;
    el.scrollBy({ left: dir * 380, behavior: 'smooth' });
  };
  return (
    <section className="section">
      <div className="kit-container">
        <Eyebrow>Real Results</Eyebrow>
        <h2 className="section-headline">Parents Don't Have<br />To Take Our<br /><span className="accent">Word For It.</span></h2>
        <div className="testimonial-row">
          <div className="testimonial-track" ref={trackRef}>
            {TESTIMONIALS.map(t => (
              <div className="testimonial-card" key={t.name}>
                <div className="testimonial-stars">{Array.from({length:5}).map((_,i)=><Icon key={i} name="star" fill />)}</div>
                <p className="testimonial-quote">“{t.quote}”</p>
                <p className="testimonial-byline"><b>{t.name}</b>. {t.role}</p>
              </div>
            ))}
          </div>
          <div className="testimonial-arrows">
            <button className="testimonial-arrow" onClick={() => scroll(-1)}><Icon name="arrow_back" /></button>
            <button className="testimonial-arrow" onClick={() => scroll(1)}><Icon name="arrow_forward" /></button>
          </div>
        </div>
      </div>
    </section>
  );
};

// =========================== GUARANTEE ===========================
const Guarantee = () => (
  <section className="guarantee">
    <div className="kit-container guarantee-grid">
      <div>
        <span className="guarantee-verified"><Icon name="verified" fill size={14} />The Guarantee</span>
        <h2 className="guarantee-headline">We Put Our Money<br />Where <span className="accent">Our Mouth Is.</span></h2>
      </div>
      <div>
        <div className="guarantee-stats">
          <div className="guarantee-stat">
            <div className="stat-num">+1<span className="stat-unit">mph</span></div>
            <div className="stat-label">Speed</div>
          </div>
          <div className="guarantee-stat">
            <div className="stat-num">+3<span className="stat-unit">″</span></div>
            <div className="stat-label">Vertical</div>
          </div>
          <div className="guarantee-stat">
            <div className="stat-num">90<span className="stat-unit">days</span></div>
            <div className="stat-label">Or We Train Them Free</div>
          </div>
        </div>
        <p className="guarantee-prose">
          Every athlete starts with a baseline assessment. Every session is tracked. Every month, we retest. The data proves the progress. And if it doesn't, you don't pay until it does.
        </p>
      </div>
    </div>
  </section>
);

// =========================== LOCATION FINDER ===========================
const LocationFinder = () => {
  const [zip, setZip] = React.useState('');
  const [submitted, setSubmitted] = React.useState(false);
  return (
    <section className="locfind">
      <div className="kit-container locfind-grid">
        <div>
          <Eyebrow>Find Your Starting Line</Eyebrow>
          <h2 className="section-headline" style={{fontSize: 'clamp(36px,4.5vw,64px)'}}>Locate Your<br />Nearest Facility.</h2>
          <p className="locfind-trust" style={{marginTop: 24}}>Trusted by <b>thousands of parents</b></p>
          <form className="zip-form" onSubmit={e => { e.preventDefault(); setSubmitted(true); }}>
            <input value={zip} onChange={e => setZip(e.target.value)} placeholder="Enter ZIP code" inputMode="numeric" />
            <button type="submit">GO <Icon name="arrow_forward" size={16} /></button>
          </form>
        </div>
        <div className="loc-list">
          {LOCATIONS.map(l => (
            <div className="loc-item" key={l.city}>
              <Icon name="location_on" fill />
              <div>
                <div className="loc-item-name">{l.city}</div>
                <div className="loc-item-meta">{l.meta}</div>
              </div>
              <Icon name="chevron_right" className="chev" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// =========================== FINAL CTA ===========================
const FinalCTA = ({ onBook }) => (
  <section className="final-cta">
    <div className="final-cta-photo" style={{ backgroundImage: "url('../../assets/photo-jump-male.jpg')" }} />
    <div className="final-cta-content kit-container">
      <Eyebrow className="eyebrow-badge">The Clock Is Ticking</Eyebrow>
      <h2 className="final-cta-headline">The Longer You Wait,<br />The More They<br /><span className="accent">Fall Behind.</span></h2>
      <p style={{maxWidth:'48ch', color:'rgba(255,255,255,0.75)', fontSize:17, lineHeight:1.55, margin:'0 0 32px'}}>
        The competition isn't resting. Secure your child's spot in our next intake and start building their athletic future today.
      </p>
      <div className="hero-cta-row">
        <Button variant="primary" iconRight="arrow_forward" onClick={onBook}>Book Assessment</Button>
        <Button variant="outline-light" iconRight="chevron_right">View Schedules</Button>
      </div>
    </div>
  </section>
);

Object.assign(window, { Hero, Pillars, Programs, Method, Testimonials, Guarantee, LocationFinder, FinalCTA });
