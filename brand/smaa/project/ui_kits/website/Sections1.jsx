/* ============================================================
   SMAA Website UI Kit — Hero · Benefits · Steps
   ============================================================ */

function Hero({ onGetStarted }) {
  return (
    <div id="top" style={{ background: 'var(--ink-900)', position: 'relative', overflow: 'hidden' }}>
      {/* subtle blue glow */}
      <div style={{ position: 'absolute', top: -120, left: '50%', transform: 'translateX(-50%)',
        width: 700, height: 380, background: 'radial-gradient(ellipse, rgba(1,126,230,.30), transparent 70%)',
        pointerEvents: 'none' }} />
      <Container style={{ position: 'relative', paddingTop: 70, paddingBottom: 0, textAlign: 'center' }}>
        <Reveal>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.14)',
            borderRadius: 999, padding: '7px 16px', marginBottom: 26 }}>
            <Icon name="map-pin" size={15} color="#5fb0f5" />
            <span style={{ color: '#fff', fontSize: 13, fontWeight: 600, letterSpacing: '.02em' }}>
              Portland &amp; Saco, Maine</span>
          </div>
        </Reveal>
        <Reveal delay={60}>
          <h1 className="smaa-hero" style={{ color: '#fff', maxWidth: 920, margin: '0 auto',
            textShadow: '0 2px 30px rgba(0,0,0,.4)' }}>
            Southern Maine's Premier Private<br /><span style={{ color: '#5fb0f5' }}>Soccer Training</span> &amp; Athletic Development
          </h1>
        </Reveal>
        <Reveal delay={120}>
          <p className="smaa-lead" style={{ color: 'var(--fg-on-dark2)', maxWidth: 680,
            margin: '22px auto 30px' }}>
            We help soccer players 7 and older master the ball, develop athleticism, and boost
            confidence — so they stand out on the field and earn more playing time.
          </p>
        </Reveal>
        <Reveal delay={170}>
          <CTAButton size="lg" withArrow onClick={onGetStarted}>Get Started — Free 1:1 Evaluation</CTAButton>
        </Reveal>
        <Reveal delay={230}>
          <div style={{ position: 'relative', marginTop: 54 }}>
            <img src="../../assets/hero.webp" alt="Athletes training at SMAA"
              style={{ width: '100%', maxWidth: 980, borderRadius: '18px 18px 0 0',
                boxShadow: '0 -10px 60px rgba(1,126,230,.25)', display: 'block', margin: '0 auto' }} />
          </div>
        </Reveal>
      </Container>
    </div>
  );
}

function Benefits() {
  const items = [
    ['target', 'Stand out on the soccer field'],
    ['timer', 'Play more minutes'],
    ['zap', 'Become faster, stronger & more athletic'],
    ['trophy', 'Get better at soccer'],
    ['heart', 'Build real, lasting confidence'],
    ['shield', 'Reduce their risk of injury'],
  ];
  return (
    <Section soft>
      <Container>
        <Reveal style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto 46px' }}>
          <Eyebrow center>For Soccer Parents</Eyebrow>
          <h2 className="smaa-h1">Do You Want Your Child To…</h2>
        </Reveal>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 18 }}>
          {items.map(([icon, label], i) => (
            <Reveal key={label} delay={i * 50}>
              <div className="smaa-benefit" style={{ display: 'flex', alignItems: 'center', gap: 16,
                background: '#fff', borderRadius: 14, padding: '20px 22px', boxShadow: 'var(--shadow-sm)',
                transition: 'transform .16s ease, box-shadow .16s ease' }}>
                <span style={{ flex: 'none', width: 46, height: 46, borderRadius: 12,
                  background: 'var(--smaa-blue-050)', display: 'flex', alignItems: 'center',
                  justifyContent: 'center' }}>
                  <Icon name={icon} size={22} color="var(--smaa-blue)" />
                </span>
                <span style={{ fontWeight: 700, fontSize: 17, color: 'var(--fg1)' }}>{label}</span>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal style={{ textAlign: 'center', marginTop: 40 }}>
          <p className="smaa-h3" style={{ maxWidth: 760, margin: '0 auto 22px', fontWeight: 800,
            color: 'var(--fg1)' }}>
            Then get started below and watch your child succeed, develop, and thrive!
          </p>
        </Reveal>
      </Container>
    </Section>
  );
}

function Steps({ onGetStarted }) {
  const steps = [
    ['step1.webp', '01', 'Schedule a 1:1 Gameplan Session',
      "In a personalized 45-minute session, we'll talk through your goals, run a full evaluation, and see if SMAA is the right fit for your family."],
    ['step3.webp', '02', 'Choose the Perfect Program',
      "We'll recommend the best training option for your child based on their goals and abilities, with a clear path to measurable progress."],
    ['founder.webp', '03', 'Join Our Community',
      "Sign up, schedule your classes, and join a community of dedicated athletes. We're here to help your child succeed every step of the way."],
  ];
  return (
    <Section>
      <Container>
        <Reveal style={{ textAlign: 'center', maxWidth: 680, margin: '0 auto 50px' }}>
          <Eyebrow center>How It Works</Eyebrow>
          <h2 className="smaa-h1">Get Started in Three Simple Steps</h2>
        </Reveal>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 26 }}>
          {steps.map(([img, n, title, body], i) => (
            <Reveal key={n} delay={i * 80}>
              <div style={{ background: '#fff', borderRadius: 16, overflow: 'hidden',
                boxShadow: 'var(--shadow-md)', height: '100%' }}>
                <div style={{ height: 180, background: `url(../../assets/${img}) center/cover`,
                  position: 'relative' }}>
                  <span style={{ position: 'absolute', top: 14, left: 14, width: 44, height: 44,
                    borderRadius: 10, background: 'var(--smaa-blue)', color: '#fff',
                    fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: 'var(--shadow-cta)' }}>{n}</span>
                </div>
                <div style={{ padding: '22px 24px 26px' }}>
                  <h3 className="smaa-h3" style={{ marginBottom: 8 }}>{title}</h3>
                  <p className="smaa-body" style={{ fontSize: 15 }}>{body}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal style={{ textAlign: 'center', marginTop: 44 }}>
          <CTAButton size="lg" withArrow onClick={onGetStarted}>Claim Your Free Evaluation</CTAButton>
        </Reveal>
      </Container>
    </Section>
  );
}

Object.assign(window, { Hero, Benefits, Steps });
