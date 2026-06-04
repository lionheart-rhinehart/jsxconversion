// Jarosh Performance · marketing-site UI kit
// Page-level sections. Reconstructed copy in the brand voice — not verbatim.

// Testimonial voice adapted from public Jarosh/NJF reviews (paraphrased), with
// measured-outcome tags added to fit the data-forward system.
const TESTIMONIALS = [
  { name: "Andy J.", role: "Parent", quote: "His workouts and programs are based on real numbers and results. If you want to get faster, this is the place to be.", gain: "−0.2s · 40yd" },
  { name: "The Triplets' Mom", role: "Volleyball", quote: "They appreciate the measurable progress and feedback. My biggest concern was proper technique — the coaching here nailed it.", gain: "+4″ vert" },
  { name: "Erica S.", role: "Parent", quote: "My son does speed & agility twice a week and loves it. Huge improvement in his speed, strength, and overall athletic performance.", gain: "+12% speed" },
  { name: "College Athlete", role: "Returner", quote: "Any break I get from college training, I come back to Nick's. I've made the biggest jumps in my speed while training here.", gain: "PR · 10yd" },
  { name: "Jaron T.", role: "Parent", quote: "A few months in and we've seen a huge improvement in his strength, speed, and his confidence on the court.", gain: "+0.3s split" },
  { name: "Softball Family", role: "Parent", quote: "Sport-specific training that supplements her school lifting. He works with what they've already done — and the data shows it.", gain: "+8% RFD" },
];

const LOCATIONS = [
  { city: "Ankeny, IA — Flagship", meta: "405 SE Magazine Rd · 6 programs running", live: true },
  { city: "SUPERCHARGED Clinic", meta: "Jan 5 · Acceleration intensive · capped" },
  { city: "Female Athlete Class", meta: "Tue / Thu · HS + MS · enrolling" },
];

// =========================== HERO (data) ===========================
const Hero = ({ onBook }) => (
  <section className="hero">
    <div className="hero-grid" />
    <div className="hero-glow" />
    <div className="hero-inner kit-container">
      <div>
        <Tag>The Baseline</Tag>
        <h1 className="hero-headline">Faster Isn't<br />A Guess.<br />It's A <span className="accent">Measurement.</span></h1>
        <div className="hero-sub">
          <Icon name="verified" fill />
          We baseline every athlete on day one — speed, vertical, force, mobility. Then we build the gaps and retest. Not just a speed program.
        </div>
        <div className="hero-cta-row">
          <Button variant="primary" iconRight="arrow_forward" onClick={onBook}>Book An Assessment</Button>
          <Button variant="outline-light" iconRight="show_chart">See The Data</Button>
        </div>
        <div className="hero-metricstrip">
          <div className="hero-ms"><span className="v">−0.18<span className="u">s</span></span><span className="k">Avg 10-yd gain / 90d</span></div>
          <div className="hero-ms"><span className="v">+3.5<span className="u">″</span></span><span className="k">Avg vertical / 90d</span></div>
          <div className="hero-ms"><span className="v">15<span className="u">yrs</span></span><span className="k">Coaching experience</span></div>
        </div>
      </div>

      {/* live instrument panel */}
      <div className="instrument">
        <div className="instrument-head">
          <span className="live"><span className="pulse" />Now Measuring</span>
          <span className="who">ATHLETE #0427 · HS</span>
        </div>
        <div className="instrument-body">
          <div className="imt"><div className="k">10-yd split</div><div className="v">1.58<span className="u">s</span></div><div className="d"><Icon name="trending_up" fill />−0.18s</div></div>
          <div className="imt"><div className="k">Top speed</div><div className="v">18.4<span className="u">mph</span></div><div className="d"><Icon name="trending_up" fill />+6%</div></div>
          <div className="imt"><div className="k">Vertical</div><div className="v">36.5<span className="u">″</span></div><div className="d"><Icon name="trending_up" fill />+3.5″</div></div>
          <div className="imt"><div className="k">Force output</div><div className="v">+22<span className="u">%</span></div><div className="d"><Icon name="trending_up" fill />vs base</div></div>
        </div>
        <div className="instrument-foot">
          <svg className="bar" width="100%" height="46" viewBox="0 0 320 46" preserveAspectRatio="none">
            <line x1="0" y1="45" x2="320" y2="45" stroke="#232932" strokeWidth="1" />
            <polyline points="0,40 45,37 90,38 135,28 180,24 225,16 270,12 320,5" fill="none" stroke="#fa3f36" strokeWidth="2" />
          </svg>
        </div>
      </div>
    </div>
  </section>
);

// =========================== PILLARS (four) ===========================
const Pillars = () => {
  const items = [
    { num: "01", icon: "sprint",          title: "Speed",    metric: "10/20/40 · top-end velocity", text: "Rebuild the sprint from the first step. Acceleration mechanics measured on every rep." },
    { num: "02", icon: "shuffle",         title: "Agility",  metric: "Change-of-direction · 5-10-5", text: "Cut, plant, and reaccelerate. The footwork that gets your athlete to the ball first." },
    { num: "03", icon: "fitness_center",  title: "Strength", metric: "Force · max output", text: "Functional, multi-planar strength that transfers to the field. Tested, not guessed." },
    { num: "04", icon: "bolt",            title: "Power",    metric: "RFD · vertical · broad jump", text: "Rate of force development — the bridge between the weight room and game day." },
  ];
  return (
    <section className="section section--dark">
      <div className="kit-container">
        <Tag>Not Just A Speed Program</Tag>
        <h2 className="section-headline">Four Systems.<br /><span className="accent">One Measured</span> Athlete.</h2>
        <p className="section-sub">Speed, agility, strength, and power don't develop in isolation. We train all four and tie them together with the one thing most programs skip — the data.</p>
        <div className="pillars">
          {items.map(p => (
            <div className="pillar-card calib-grid" key={p.num}>
              <div className="pillar-num">{p.num}</div>
              <div className="pillar-icon"><Icon name={p.icon} fill /></div>
              <h3 className="pillar-title">{p.title}</h3>
              <p className="pillar-metric">{p.metric}</p>
              <p className="pillar-tagline">{p.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// =========================== METHOD / LOOP ===========================
const Method = ({ onBook }) => {
  const steps = [
    { num: "01", icon: "straighten", title: "Test", text: "Day one is a full workup — 10/20/40 splits, vertical, broad jump, force, and a movement screen. That number is the starting line." },
    { num: "02", icon: "build", title: "Build", text: "We program around the specific gaps the data exposes. No template. Every session targets what actually moves the needle." },
    { num: "03", icon: "timeline", title: "Retest", text: "Monthly retesting proves the progress — or tells us what to change. The loop is the method. The data keeps us honest." },
  ];
  return (
    <section className="section section--gray">
      <div className="kit-container">
        <Eyebrow>The Method</Eyebrow>
        <h2 className="section-headline">Test. Build.<br /><span className="accent">Retest.</span> Repeat.</h2>
        <div className="method">
          {steps.map(s => (
            <div className="method-step" key={s.num}>
              <div className="method-num">{s.num}</div>
              <h4 className="method-title"><Icon name={s.icon} />{s.title}</h4>
              <p className="method-text">{s.text}</p>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 48 }}>
          <Button variant="primary" iconRight="arrow_forward" onClick={onBook}>Start Your Baseline</Button>
        </div>
      </div>
    </section>
  );
};

// =========================== RESULTS ===========================
const Results = () => {
  const metrics = [
    { k: "Avg 10-yd gain", v: "−0.18", u: "s", d: "in 90 days" },
    { k: "Avg vertical gain", v: "+3.5", u: "″", d: "in 90 days" },
    { k: "Force output", v: "+22", u: "%", d: "vs baseline" },
    { k: "Athletes retested", v: "100", u: "%", d: "monthly" },
  ];
  const trackRef = useRef(null);
  const scroll = dir => { const el = trackRef.current; if (el) el.scrollBy({ left: dir * 378, behavior: "smooth" }); };
  return (
    <section className="section">
      <div className="kit-container">
        <Eyebrow>Measured Progress</Eyebrow>
        <h2 className="section-headline">Parents Don't Take<br />Our Word For It.<br /><span className="accent">They Read The Chart.</span></h2>
        <div className="metric-row">
          {metrics.map(m => (
            <div className="mtile" key={m.k}>
              <div className="k">{m.k}</div>
              <div className="v">{m.v}<span className="u">{m.u}</span></div>
              <div className="d"><Icon name="trending_up" fill />{m.d}</div>
            </div>
          ))}
        </div>
        <div className="testimonial-row">
          <div className="testimonial-track" ref={trackRef}>
            {TESTIMONIALS.map(t => (
              <div className="testimonial-card" key={t.name}>
                <div className="testimonial-stars">{Array.from({length:5}).map((_,i)=><Icon key={i} name="star" fill />)}</div>
                <p className="testimonial-quote">"{t.quote}"</p>
                <p className="testimonial-byline"><span><b>{t.name}</b> · {t.role}</span><span className="gaintag">{t.gain}</span></p>
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

// =========================== SUPERCHARGED FEATURE ===========================
const Supercharged = ({ onBook }) => (
  <section className="section section--dark">
    <div className="kit-container">
      <div className="feature">
        <div className="feature-photo photo-slot">
          <span className="reg tl" /><span className="reg tr" /><span className="reg bl" /><span className="reg br" />
          <span className="slot-label"><Icon name="add_photo_alternate" />Athlete photo<br />acceleration / sprint</span>
        </div>
        <div className="feature-body">
          <Tag>Supercharged</Tag>
          <h2 className="section-headline" style={{ fontSize: "clamp(38px,4.4vw,64px)" }}>The Elite<br /><span className="accent">Acceleration</span> System.</h2>
          <p className="section-sub" style={{ marginTop: 18 }}>One step behind is a coaching problem, not a talent problem. SUPERCHARGED rebuilds the first three steps — low-volume, high-quality, fully measured.</p>
          <ul className="feature-list">
            <li><Icon name="check" />First-step quickness <span className="val">−0.08s</span></li>
            <li><Icon name="check" />Max velocity mechanics <span className="val">+1.1 mph</span></li>
            <li><Icon name="check" />In-season safe (low volume) <span className="val">2× / wk</span></li>
            <li><Icon name="check" />Every rep timed &amp; logged <span className="val">100%</span></li>
          </ul>
          <div className="hero-cta-row">
            <Button variant="primary" iconRight="arrow_forward" onClick={onBook}>Join The Next Intake</Button>
          </div>
        </div>
      </div>
    </div>
  </section>
);

// =========================== GUARANTEE ===========================
const Guarantee = () => (
  <section className="guarantee calib-grid">
    <div className="kit-container guarantee-grid">
      <div>
        <span className="guarantee-verified"><Icon name="verified" fill size={14} />The Guarantee</span>
        <h2 className="guarantee-headline">We Put The Numbers<br /><span className="accent">On The Line.</span></h2>
      </div>
      <div>
        <div className="guarantee-stats">
          <div className="guarantee-stat"><div className="stat-num">−0.18<span className="stat-unit">s</span></div><div className="stat-label">10-yd split</div></div>
          <div className="guarantee-stat"><div className="stat-num">+3.5<span className="stat-unit">″</span></div><div className="stat-label">vertical</div></div>
          <div className="guarantee-stat"><div className="stat-num">90<span className="stat-unit">days</span></div><div className="stat-label">retest cycle</div></div>
        </div>
        <p className="guarantee-prose">Every athlete starts with a baseline. Every session is tracked. Every month, we retest. If the data doesn't move, we adjust the program until it does — that's the standard, in writing.</p>
      </div>
    </div>
  </section>
);

// =========================== BOOKING / LOCATION ===========================
const Booking = ({ onBook }) => {
  const [form, setForm] = useState({ athlete: "", age: "", sport: "Softball", program: "The Baseline Assessment" });
  const up = patch => setForm(f => ({ ...f, ...patch }));
  return (
    <section className="booking" id="book">
      <div className="kit-container booking-grid">
        <div>
          <Eyebrow>Find Your Starting Line</Eyebrow>
          <h2 className="section-headline" style={{ fontSize: "clamp(34px,4.2vw,58px)" }}>Book The<br />Baseline.</h2>
          <p className="booking-trust">Trusted by <b>hundreds of Ankeny-area families</b> · 100% recommend</p>
          <div className="loc-card" style={{ marginTop: 24 }}>
            {LOCATIONS.map((l, i) => (
              <React.Fragment key={l.city}>
                {i > 0 && <div className="loc-divider" />}
                <div className="loc-row">
                  <span className="pin"><Icon name={l.live ? "location_on" : "event"} fill /></span>
                  <div><div className="loc-name">{l.city}</div><div className="loc-meta">{l.meta}</div></div>
                  <Icon name="chevron_right" style={{ marginLeft: "auto", color: "var(--fg-3)" }} />
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>
        <div>
          <form className="bform" onSubmit={e => { e.preventDefault(); onBook(); }}>
            <div className="bfield"><label>Athlete's name</label><input value={form.athlete} onChange={e => up({ athlete: e.target.value })} placeholder="First and last name" /></div>
            <div className="bform-row">
              <div className="bfield"><label>Age</label><input value={form.age} onChange={e => up({ age: e.target.value })} placeholder="14" inputMode="numeric" /></div>
              <div className="bfield"><label>Primary sport</label>
                <select value={form.sport} onChange={e => up({ sport: e.target.value })}>
                  <option>Softball</option><option>Baseball</option><option>Basketball</option><option>Football</option><option>Soccer</option><option>Volleyball</option><option>Multi-sport</option>
                </select>
              </div>
            </div>
            <div className="bfield"><label>Program of interest</label>
              <select value={form.program} onChange={e => up({ program: e.target.value })}>
                <option>The Baseline Assessment</option><option>SUPERCHARGED Speed</option><option>Foundations (8–12)</option><option>Competitive Edge (13–15)</option><option>College Prep (16–18)</option><option>Female Athlete Program</option>
              </select>
            </div>
            <Button variant="primary" iconRight="arrow_forward" type="submit">Request My Assessment</Button>
          </form>
        </div>
      </div>
    </section>
  );
};

// =========================== FINAL CTA ===========================
const FinalCTA = ({ onBook }) => (
  <section className="final-cta">
    <div className="photo-slot">
      <span className="reg tl" /><span className="reg tr" /><span className="reg bl" /><span className="reg br" />
      <span className="slot-label"><Icon name="add_photo_alternate" />Wide gym / group photo</span>
    </div>
    <div className="final-cta-shade" />
    <div className="final-cta-content">
      <div className="kit-container">
        <Tag>The Clock Is Running</Tag>
        <h2 className="final-cta-headline">Every Month<br />Without Data Is A<br /><span className="accent">Month Behind.</span></h2>
        <p style={{ maxWidth: "46ch", color: "rgba(255,255,255,0.78)", fontSize: 17, lineHeight: 1.55, margin: "0 0 30px" }}>
          The competition isn't measuring. Your athlete should be. Book the baseline and start building progress you can actually see.
        </p>
        <div className="hero-cta-row">
          <Button variant="primary" iconRight="arrow_forward" onClick={onBook}>Book An Assessment</Button>
          <Button variant="outline-light" iconRight="calendar_month">View Schedule</Button>
        </div>
      </div>
    </div>
  </section>
);

Object.assign(window, { Hero, Pillars, Method, Results, Supercharged, Guarantee, Booking, FinalCTA });
