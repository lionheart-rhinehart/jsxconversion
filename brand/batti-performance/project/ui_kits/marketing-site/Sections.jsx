// Batti-Performance kit — content sections (top half)

function CharacterSection() {
  return (
    <section className="bp-section light-band" id="about">
      <div className="bp-container">
        <div className="sec-head">
          <Eyebrow muted>Character built on the field lasts a lifetime</Eyebrow>
          <h2>It isn't just about <span className="accent">winning games</span></h2>
        </div>
        <div className="stmts">
          <div className="stmt">Every time your athlete trains, they're not just developing speed — they're building the person they'll become.</div>
          <div className="stmt">The hard work, discipline, and teamwork they master through sport shapes how they approach every future challenge.</div>
          <div className="stmt">Proper athletic development creates the unshakable foundation they'll stand on for life.</div>
        </div>
      </div>
    </section>
  );
}

const PROMISES = [
  { t: "Breakaway Speed", icon: "directions_run", p: "Sharp, decisive cuts that create separation from defenders and open up plays — the quick-twitch responses that decide competitive moments." },
  { t: "First-Step Dominance", icon: "bolt", p: "Explode off the mark with real acceleration that gives your athlete a crucial edge every single play, and changes how coaches see their potential." },
  { t: "Character Beyond the Game", icon: "self_improvement", p: "Confidence that carries everywhere — at school, at home, with friends. A positive ripple effect through every part of their life." },
];

function PromisesSection() {
  return (
    <section className="bp-section dark-band" id="programs">
      <div className="bp-container">
        <div className="sec-head">
          <Eyebrow>What your athlete walks away with</Eyebrow>
          <h2 style={{ color: "#fff" }}>Built from the <span className="accent">inside out</span></h2>
        </div>
        <div className="cards-3">
          {PROMISES.map((c) => (
            <div className="fcard" key={c.t}>
              <Photo label={c.t} icon={c.icon} />
              <div className="fcard-body">
                <h3>{c.t}</h3>
                <p>{c.p}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function GuaranteeSection({ onApply }) {
  return (
    <section className="bp-section dark-band" style={{ borderTop: "1px solid var(--border-dark)" }}>
      <div className="bp-container">
        <div className="sec-head" style={{ marginBottom: "var(--s-7)" }}>
          <Eyebrow>Guaranteed explosive performance</Eyebrow>
          <h2 style={{ color: "#fff" }}>No other program offers this <span className="accent">accountability</span></h2>
          <p>Your athlete will gain at least these numbers in 30 sessions — or we train them for FREE until they do.</p>
        </div>
        <div className="guar-strip">
          <div className="guar-nums">
            <div className="guar-num"><div className="v">+3<span className="u">″</span></div><div className="l">Vertical jump</div></div>
            <div className="guar-num"><div className="v">+1<span className="u">mph</span></div><div className="l">Top speed</div></div>
            <div className="guar-num"><div className="v">30</div><div className="l">Sessions</div></div>
          </div>
          <div style={{ marginLeft: "auto" }}>
            <Btn variant="primary" lg icon="arrow_forward" onClick={onApply}>Claim your athlete analysis</Btn>
          </div>
        </div>
      </div>
    </section>
  );
}

const STEPS = [
  { n: "01", t: "Precision Assessment", icon: "query_stats", p: "We start with a comprehensive Athletic Performance Assessment that pinpoints exactly where your child's explosive potential is currently locked." },
  { n: "02", t: "Customized Explosive Development", icon: "fitness_center", p: "Your athlete follows a custom-engineered protocol targeting guaranteed gains in vertical, acceleration, and sport-specific agility." },
  { n: "03", t: "Complete Athlete Transformation", icon: "trending_up", p: "They transform physically and mentally — the explosive capability AND the character to use it when it matters most." },
];

function StepsSection() {
  return (
    <section className="bp-section light-band" id="system">
      <div className="bp-container">
        <div className="sec-head">
          <Eyebrow>Our 3 step system</Eyebrow>
          <h2>Assess. Build. <span className="accent">Dominate.</span></h2>
        </div>
        <div className="steps">
          {STEPS.map((s) => (
            <div className="step" key={s.n}>
              <Photo label={`Step ${s.n} — ${s.t}`} icon={s.icon} />
              <div className="step-num">{s.n}</div>
              <h3>{s.t}</h3>
              <p>{s.p}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { CharacterSection, PromisesSection, GuaranteeSection, StepsSection });
