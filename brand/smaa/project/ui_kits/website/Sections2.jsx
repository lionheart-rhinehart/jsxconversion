/* ============================================================
   SMAA Website UI Kit — Difference · Founder · Guarantee
                          Reviews · FreeTools · Footer
   ============================================================ */

function Difference() {
  const items = [
    ['Individual Attention', 'Small-group training means real coaching and individualized feedback every session.'],
    ['Caring Coaches', 'Coaches who genuinely care about each athlete’s growth, confidence, and long-term success.'],
    ['Confidence Through Development', 'As athletes build skills and athleticism, confidence follows — on and off the field.'],
    ['Results That Matter', 'Meaningful progress in speed, strength, coordination, and game performance.'],
    ['Positive Environment', 'Challenging, encouraging, and fun — a place athletes look forward to every week.'],
  ];
  return (
    <Section dark>
      <Container>
        <Reveal style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto 48px' }}>
          <Eyebrow onDark center>The SMAA Difference</Eyebrow>
          <h2 className="smaa-h1" style={{ color: '#fff' }}>We're Not Just Another Training Facility</h2>
        </Reveal>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(290px,1fr))', gap: 18 }}>
          {items.map(([t, b], i) => (
            <Reveal key={t} delay={i * 50}>
              <div style={{ display: 'flex', gap: 14, background: 'var(--ink-800)',
                border: '1px solid var(--ink-700)', borderRadius: 14, padding: '22px 22px', height: '100%' }}>
                <span style={{ flex: 'none', width: 30, height: 30, borderRadius: 8,
                  background: 'rgba(89,190,11,.15)', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', marginTop: 2 }}>
                  <Icon name="check" size={18} color="var(--smaa-green)" stroke={3} />
                </span>
                <div>
                  <div style={{ color: '#fff', fontWeight: 700, fontSize: 17, marginBottom: 5 }}>{t}</div>
                  <div style={{ color: 'var(--fg-on-dark2)', fontSize: 14.5, lineHeight: 1.55 }}>{b}</div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}

function Founder() {
  const creds = [
    'Master’s Degree in Coaching', 'B.S. in Exercise Science',
    'Certified Strength & Conditioning Specialist (CSCS)', 'College · Club · ODP · HS Coach',
    'Former College Player', '10 Years Coaching Experience',
  ];
  return (
    <Section soft>
      <Container style={{ display: 'grid', gridTemplateColumns: 'minmax(280px,420px) 1fr', gap: 56,
        alignItems: 'center' }} className="smaa-founder-grid">
        <Reveal>
          <div style={{ position: 'relative' }}>
            <img src="../../assets/founder.webp" alt="Jeremy Longchamp"
              style={{ width: '100%', borderRadius: 18, boxShadow: 'var(--shadow-lg)', display: 'block' }} />
            <div style={{ position: 'absolute', left: 18, bottom: 18, background: 'var(--smaa-blue)',
              color: '#fff', padding: '10px 16px', borderRadius: 12, boxShadow: 'var(--shadow-cta)' }}>
              <div style={{ fontWeight: 800, fontSize: 16 }}>Jeremy Longchamp</div>
              <div style={{ fontSize: 12.5, opacity: .9, fontWeight: 600 }}>MS, CSCS · Founder</div>
            </div>
          </div>
        </Reveal>
        <Reveal delay={80}>
          <Eyebrow>Meet Our Team</Eyebrow>
          <h2 className="smaa-h2" style={{ marginBottom: 16 }}>Coaching Backed by Real Credentials</h2>
          <p className="smaa-body" style={{ marginBottom: 22 }}>
            SMAA was founded by Jeremy Longchamp — a certified strength coach and former college
            player who has spent a decade developing athletes at every level of the game.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 20px' }}>
            {creds.map(c => (
              <div key={c} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <Icon name="check" size={18} color="var(--smaa-green)" stroke={3} style={{ marginTop: 2 }} />
                <span style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--fg1)' }}>{c}</span>
              </div>
            ))}
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}

function Guarantee() {
  return (
    <Section style={{ background: 'var(--smaa-blue)', padding: '72px 0' }}>
      <Container narrow style={{ textAlign: 'center' }}>
        <Reveal>
          <Icon name="badge-check" size={52} color="#fff" />
          <div className="smaa-eyebrow" style={{ color: 'rgba(255,255,255,.85)', marginTop: 14 }}>
            Our Ironclad Commitment</div>
          <h2 className="smaa-h2" style={{ color: '#fff', margin: '8px auto 18px', maxWidth: 720 }}>
            Real Progress in 30 Days — Guaranteed</h2>
          <p style={{ color: 'rgba(255,255,255,.92)', fontSize: 19, lineHeight: 1.55, maxWidth: 660,
            margin: '0 auto', fontWeight: 500 }}>
            If your child doesn't feel more confident, improve their skills, or show measurable
            progress after one month with us, we'll keep training them <strong>free until they do.</strong>
          </p>
        </Reveal>
      </Container>
    </Section>
  );
}

function Reviews() {
  const data = [
    ['Sarah M.', 'Soccer Parent · Portland', "My daughter is faster, more confident, and finally getting real playing time. The coaches genuinely care."],
    ['Mike D.', 'Soccer Parent · Saco', "Best decision we made this year. The 1:1 attention is something her club team just can't offer."],
    ['Jen R.', 'Soccer Parent · Portland', "He actually looks forward to training. His touch and confidence have completely transformed."],
  ];
  return (
    <Section>
      <Container>
        <Reveal style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 44px' }}>
          <Eyebrow center>Success Stories</Eyebrow>
          <h2 className="smaa-h1">Don't Just Take Our Word For It</h2>
        </Reveal>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 22 }}>
          {data.map(([name, role, quote], i) => (
            <Reveal key={name} delay={i * 70}>
              <div style={{ background: '#fff', borderRadius: 16, padding: 26, boxShadow: 'var(--shadow-md)',
                height: '100%', display: 'flex', flexDirection: 'column' }}>
                <div style={{ color: 'var(--star)', fontSize: 19, letterSpacing: 3, marginBottom: 12 }}>★★★★★</div>
                <p style={{ fontSize: 16, lineHeight: 1.6, color: 'var(--fg1)', fontWeight: 500, flex: 1 }}>
                  "{quote}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 18 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--smaa-blue)',
                    color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: 15 }}>{name[0]}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{name}</div>
                    <div style={{ color: 'var(--fg3)', fontSize: 12.5 }}>{role}</div>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}

function FreeTools({ onGetStarted }) {
  const tools = [
    ['play-circle', '12-Minute At-Home Touch Routine', 'The daily routine that has helped hundreds of players transform their foot speed and confidence.'],
    ['list-checks', '5 Drills for Fundamental Skills', 'Proven drills to improve your child’s dribbling, footskills, and confidence on the ball.'],
    ['dumbbell', '5 Favorite Athleticism Exercises', 'Jumpstart development with our favorite exercises for speed, strength, and injury prevention.'],
  ];
  return (
    <Section soft>
      <Container>
        <Reveal style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 44px' }}>
          <Eyebrow center>Free Resources</Eyebrow>
          <h2 className="smaa-h1">Access Our Free Tools for Excellence</h2>
        </Reveal>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 22 }}>
          {tools.map(([icon, title, body], i) => (
            <Reveal key={title} delay={i * 70}>
              <div style={{ background: '#fff', borderRadius: 16, padding: 28, boxShadow: 'var(--shadow-sm)',
                height: '100%', display: 'flex', flexDirection: 'column' }}>
                <span style={{ width: 52, height: 52, borderRadius: 13, background: 'var(--smaa-green-050)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                  <Icon name={icon} size={26} color="var(--smaa-green-600)" />
                </span>
                <h3 className="smaa-h3" style={{ marginBottom: 8, fontSize: 19 }}>{title}</h3>
                <p className="smaa-body" style={{ fontSize: 14.5, flex: 1 }}>{body}</p>
                <div style={{ marginTop: 18 }}>
                  <CTAButton variant="outline" size="sm" onClick={onGetStarted}>Click to Access</CTAButton>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}

function Footer({ onGetStarted }) {
  const locs = [
    ['160 Presumpscot Street', 'Portland, ME 04103'],
    ['73 Industrial Park Road', 'Saco, ME 04072'],
  ];
  return (
    <footer style={{ background: 'var(--ink-900)', paddingTop: 72 }}>
      <Container>
        <div style={{ textAlign: 'center', borderBottom: '1px solid var(--ink-700)', paddingBottom: 56 }}>
          <Reveal>
            <h2 className="smaa-h1" style={{ color: '#fff', maxWidth: 720, margin: '0 auto 14px' }}>
              Don't Wait — Start Today</h2>
            <p className="smaa-lead" style={{ color: 'var(--fg-on-dark2)', maxWidth: 600,
              margin: '0 auto 28px' }}>
              The sooner your child starts, the sooner the benefits compound. Unlock joyful
              athletic development today.</p>
            <CTAButton size="lg" withArrow onClick={onGetStarted}>Get Started — Free 1:1 Evaluation</CTAButton>
          </Reveal>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 30,
          padding: '44px 0' }}>
          <div style={{ maxWidth: 280 }}>
            <img src="../../assets/logo.webp" alt="SMAA" style={{ height: 40, marginBottom: 16 }} />
            <p style={{ color: 'var(--fg-on-dark2)', fontSize: 13.5, lineHeight: 1.6 }}>
              Southern Maine's premier private soccer training and athletic development.</p>
            <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
              {['instagram', 'facebook'].map(s => (
                <a key={s} href="#" onClick={e => e.preventDefault()}
                  style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--ink-800)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '1px solid var(--ink-700)' }}>
                  <Icon name={s} size={18} color="#fff" />
                </a>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 50, flexWrap: 'wrap' }}>
            {locs.map(([a, b]) => (
              <div key={a}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                  <Icon name="map-pin" size={16} color="#5fb0f5" />
                  <span style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>
                    {b.split(',')[0]}</span>
                </div>
                <div style={{ color: 'var(--fg-on-dark2)', fontSize: 13.5, lineHeight: 1.6 }}>{a}<br />{b}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ borderTop: '1px solid var(--ink-700)', padding: '22px 0',
          display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <span style={{ color: 'var(--fg3)', fontSize: 12.5 }}>© 2026 Southern Maine Athlete Academy</span>
          <a href="#" onClick={e => e.preventDefault()}
            style={{ color: 'var(--fg3)', fontSize: 12.5, textDecoration: 'none' }}>Privacy Policy</a>
        </div>
      </Container>
    </footer>
  );
}

Object.assign(window, { Difference, Founder, Guarantee, Reviews, FreeTools, Footer });
