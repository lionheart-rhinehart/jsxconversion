// Batti-Performance kit — content sections (bottom half)

function ApproachSection() {
  return (
    <section className="bp-section grey-band" id="results">
      <div className="bp-container">
        <div className="approach">
          <div>
            <Eyebrow>The difference is in our approach</Eyebrow>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, textTransform: "uppercase", fontSize: "clamp(2.2rem,4vw,3.2rem)", lineHeight: ".92", letterSpacing: "-.008em", margin: "0 0 var(--s-3)" }}>
              We build athletes from the <span className="accent">inside out</span>
            </h2>
            <div className="proof-list">
              <div className="proof"><Icon name="check_circle" /><span><b>2,257+</b> athletes developed since 2015 — measurable speed gains and real character growth.</span></div>
              <div className="proof"><Icon name="check_circle" /><span><b>100%</b> guaranteed results: a minimum +3″ vertical and +1 mph speed improvement.</span></div>
              <div className="proof"><Icon name="check_circle" /><span><b>92%</b> of parents report increased confidence that extends well beyond sports.</span></div>
            </div>
          </div>
          <blockquote className="quote">
            <p>"In just three weeks at Batti-Performance I feel stronger, more confident, and healthier. Ronnie pushes you to reach your goals and Marissa makes everything easy. I look forward to every session."</p>
            <cite>— Omar F. · Batti-Performance athlete</cite>
          </blockquote>
        </div>
      </div>
    </section>
  );
}

function AthleteWall() {
  const shots = ["bolt", "sprint", "fitness_center", "trending_up", "directions_run", "query_stats", "self_improvement", "flame"];
  return (
    <section className="bp-section dark-band">
      <div className="bp-container">
        <div className="sec-head"><Eyebrow>Just a few of our athletes</Eyebrow></div>
        <div className="wall">
          {shots.map((s, i) => <Photo key={i} label="Athlete" icon={s} />)}
        </div>
      </div>
    </section>
  );
}

function WhySection() {
  return (
    <section className="bp-section dark-band" style={{ borderTop: "1px solid var(--border-dark)" }}>
      <div className="bp-container">
        <div className="sec-head" style={{ marginBottom: "var(--s-6)" }}>
          <Eyebrow>Why the protocol consistently produces results</Eyebrow>
          <h2 style={{ color: "#fff" }}>We don't sell <span className="accent">hope</span>. We sell numbers.</h2>
        </div>
        <div className="why-grid">
          <p>You've probably seen countless programs promising the world. The youth-sports landscape is crowded with big claims and disappointing results. Since 2015 we've taken a fundamentally different approach with <b>2,257 athletes and counting</b>.</p>
          <p>Our guarantee isn't marketing fluff — it's based on consistent, measurable outcomes. Why these specific metrics? Because our research shows they represent the precise threshold where athletic performance <b>visibly shifts on the field</b>. The real differentiator is that we grow confidence and capability together. What good is explosive speed if your athlete doesn't believe they can use it when it matters?</p>
        </div>
      </div>
    </section>
  );
}

const FAQS = [
  { q: "How does the guarantee work?", a: "Your athlete gains at least +3″ vertical and +1 mph speed within 30 sessions. If they don't hit those numbers, we keep training them free until they do." },
  { q: "What ages do you train?", a: "We develop youth and competitive athletes across all major sports, customizing the protocol to each athlete's assessment." },
  { q: "What times are your classes?", a: "Sessions run mornings through evenings, six days a week. Exact times vary by location — claim your athlete analysis and we'll match you to a slot." },
  { q: "Where are you located?", a: "Orland Park, IL (HQ), Manteno, IL, and Gilbert, AZ. Every location runs the same guaranteed protocol." },
];

const LOCS = [
  { city: "Orland Park, IL", addr: "15541 S 70th Ct, Orland Park, IL", phone: "(708) 897-4327" },
  { city: "Manteno, IL", addr: "310 Section Line Rd, Manteno, IL 60950", phone: "(708) 897-4327" },
  { city: "Gilbert, AZ", addr: "425 W Guadalupe Rd, Unit 115, Gilbert, AZ 85233", phone: "(815) 614-0774" },
];

function FaqLocations() {
  const [open, setOpen] = useState(0);
  return (
    <section className="bp-section light-band" id="locations">
      <div className="bp-container">
        <div className="faq-loc">
          <div>
            <Eyebrow muted>Common questions</Eyebrow>
            <div className="faq">
              {FAQS.map((f, i) => (
                <div key={i}>
                  <button className={"faq-q" + (open === i ? " open" : "")} onClick={() => setOpen(open === i ? -1 : i)}>
                    <span className="t">{f.q}</span>
                    <Icon name="expand_more" />
                  </button>
                  <div className={"faq-a" + (open === i ? " open" : "")}>
                    <div className="faq-a-inner">{f.a}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <Eyebrow muted>Locations</Eyebrow>
            {LOCS.map((l) => (
              <div className="loc-card" key={l.city}>
                <div className="city">{l.city}</div>
                <div className="addr">{l.addr}</div>
                <div className="phone">{l.phone}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { ApproachSection, AthleteWall, WhySection, FaqLocations });
