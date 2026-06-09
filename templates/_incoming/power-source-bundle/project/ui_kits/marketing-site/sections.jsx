/* Power Source — Marketing site sections. Reads primitives from window. */

const LOGO = "../../assets/logo/power-source-logo.webp";
const LOGO_REVERSED = "../../assets/logo/logo-reversed.png";
const NAV = ["Programs", "Coaches", "Reviews", "Approach"];

function Header({ onStart, scrolled }) {
  const [open, setOpen] = React.useState(false);
  return (
    <header className={"mk-header" + (scrolled ? " is-scrolled" : "")}>
      <div className="mk-container mk-header__row">
        <a className="mk-logo" href="#top"><img src={LOGO_REVERSED} alt="Power Source" /></a>
        <nav className="mk-nav">
          {NAV.map((n) => <a key={n} href={"#" + n.toLowerCase()}>{n}</a>)}
        </nav>
        <div className="mk-header__right">
          <a className="mk-phone" href="tel:9786783145"><Icon name="phone" /> (978) 678-3145</a>
          <Button variant="bolt" onClick={onStart}>Start Training</Button>
        </div>
      </div>
    </header>
  );
}

function Hero({ onStart }) {
  return (
    <section className="mk-hero" id="top">
      <div className="mk-hero__bg" />
      <div className="mk-container mk-hero__grid">
        <div className="mk-hero__copy">
          <Badge variant="outline" dot>Est. 1998 · Leominster, MA</Badge>
          <h1 className="mk-hero__title">Train Hard.<br /><span className="hl">Rise Higher.</span><br />Compete Stronger.</h1>
          <p className="mk-hero__sub">From strength to agility to injury-prevention, we help Leominster athletes level up their game with science-based coaching and proven results.</p>
          <div className="mk-hero__cta">
            <Button variant="bolt" size="lg" onClick={onStart}>Claim 2 Free Sessions <Icon name="arrow-right" /></Button>
            <Button variant="ghost" size="lg" as="a" href="#programs" onClick={(e)=>{e.preventDefault();document.getElementById('programs').scrollIntoView({behavior:'smooth'});}}>Explore Programs</Button>
          </div>
          <div className="mk-hero__trust">
            <div><b>28+</b><span>years coaching</span></div>
            <div><b>1000s</b><span>of families</span></div>
            <div><b>4</b><span>core programs</span></div>
          </div>
        </div>
        <div className="mk-hero__media">
          <image-slot id="ps-hero" class="mk-hero__slot" shape="rounded" radius="16" placeholder="Drop a training-floor photo"></image-slot>
          <div className="mk-hero__chip">
            <span className="mk-hero__chip-k">Champion mindset</span>
            <span className="mk-hero__chip-v">Where every athlete is treated like a champion.</span>
          </div>
        </div>
      </div>
    </section>
  );
}

const PROGRAMS = [
  { icon: "user", meta: "Ages 8–18", title: "Youth Personal Training", desc: "1:1 athletic development that builds speed, strength and the habits of a champion.", accent: "electric" },
  { icon: "zap", meta: "Speed · Agility", title: "Speed School", desc: "Sprint mechanics, footwork and explosive power — get measurably faster.", accent: "bolt" },
  { icon: "dumbbell", meta: "Adults", title: "Adult Personal Training", desc: "Meet you where you are on day one and build genuine, lasting progress.", accent: "electric" },
  { icon: "users", meta: "Small group", title: "Adult Team Training", desc: "Strength & conditioning with like-minded people chasing like-minded goals.", accent: "bolt" },
];

function Programs() {
  return (
    <section className="mk-section" id="programs">
      <div className="mk-container">
        <SectionHeading align="center" eyebrow="The Programs"
          title={<>Built for <span className="hl">every athlete</span></>}
          subtitle="Personalized coaching for life and sport — one athlete at a time, at any level." />
        <div className="mk-programs">
          {PROGRAMS.map((p) => (
            <ProgramCard key={p.title} icon={p.icon} meta={p.meta} title={p.title} description={p.desc} accent={p.accent} cta="Learn More" />
          ))}
        </div>
      </div>
    </section>
  );
}

function Proof() {
  return (
    <section className="mk-section mk-proof" id="proof">
      <div className="mk-container">
        <SectionHeading eyebrow="Measured · Tracked · Proven"
          title={<>Real numbers that <span className="hl">prove it</span></>}
          subtitle="The exact gains our athletes make in speed, strength and explosiveness — written down and tracked every session." />
        <div className="mk-stats">
          <StatTile accent="electric" eyebrow="40-yd dash" value="−0.34" unit="s" caption="avg improvement / 12 wks" />
          <StatTile accent="bolt" eyebrow="Vertical jump" value="+4.2" unit="in" caption="measured & tracked" />
          <StatTile accent="electric" eyebrow="Squat strength" value="+38" unit="%" caption="first season avg" />
          <StatTile accent="bolt" eyebrow="Retention" value="92" unit="%" caption="families re-enroll" />
        </div>
      </div>
    </section>
  );
}

const REVIEWS = [
  { name: "Julie E", role: "Hockey parent · 6 yrs", quote: "My expectations have been exceeded. Their strength, balance and speed are amazing — and they keep the coaches' handwritten notes of encouragement." },
  { name: "Jen L", role: "Youth athlete parent", quote: "It's the personal connection that makes this place special. Three years later my son still looks forward to going multiple times a week." },
  { name: "Tina D", role: "Hockey parent", quote: "Best decision ever. Big improvement in his strength — even other parents noticed his skating — plus a real boost in confidence." },
];

function Testimonials() {
  return (
    <section className="mk-section" id="reviews">
      <div className="mk-container">
        <SectionHeading align="center" eyebrow="Proven Results"
          title={<>Trusted by <span className="hl">Leominster families</span></>}
          subtitle="See how our training transforms confidence, performance and mindset." />
        <div className="mk-reviews">
          {REVIEWS.map((r) => <Testimonial key={r.name} {...r} />)}
        </div>
      </div>
    </section>
  );
}

const STEPS = [
  { n: "01", icon: "clipboard-list", title: "Fill Out Form", desc: "Tell us about your athlete so we can get you set up quickly." },
  { n: "02", icon: "user-check", title: "Meet Your Coach", desc: "We review goals, strengths and needs to build the right plan." },
  { n: "03", icon: "flame", title: "Start Training", desc: "Hit the floor and begin building strength, speed and confidence." },
];

function GetStarted({ onStart }) {
  return (
    <section className="mk-section mk-steps-sec" id="approach">
      <div className="mk-container">
        <SectionHeading align="center" eyebrow="How To Get Started"
          title={<>Three steps to <span className="hl">train like a champion</span></>} />
        <div className="mk-steps">
          {STEPS.map((s) => (
            <div className="mk-step" key={s.n}>
              <span className="mk-step__n">{s.n}</span>
              <div className="mk-step__icon"><Icon name={s.icon} /></div>
              <h3 className="mk-step__title">{s.title}</h3>
              <p className="mk-step__desc">{s.desc}</p>
            </div>
          ))}
        </div>
        <div className="mk-steps__cta"><Button variant="bolt" size="lg" onClick={onStart}>Claim 2 Free Sessions</Button></div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="mk-footer">
      <div className="mk-container mk-footer__grid">
        <div>
          <img className="mk-footer__logo" src={LOGO_REVERSED} alt="Power Source" />
          <p className="mk-footer__tag">Train Hard. Rise Higher. Compete Stronger.</p>
          <div className="mk-social">
            <a href="https://instagram.com/powersource_athletics/" aria-label="Instagram">IG</a>
            <a href="https://facebook.com/powersourcetraining/" aria-label="Facebook">FB</a>
            <a href="https://youtube.com/@jimherrick1150" aria-label="YouTube">YT</a>
          </div>
        </div>
        <div className="mk-footer__col">
          <h4>Programs</h4>
          {PROGRAMS.map((p) => <a key={p.title} href="#programs">{p.title}</a>)}
        </div>
        <div className="mk-footer__col">
          <h4>Contact</h4>
          <a href="https://maps.google.com">450 Research Dr, Suite B<br />Leominster, MA 01453</a>
          <a href="tel:9786783145">(978) 678-3145</a>
        </div>
      </div>
      <div className="mk-container mk-footer__bottom">
        <span>© 2026 Power Source. All rights reserved.</span>
        <span>Terms · Privacy</span>
      </div>
    </footer>
  );
}

Object.assign(window, { Header, Hero, Programs, Proof, Testimonials, GetStarted, Footer, PROGRAMS });
