/* Castille Academy marketing · page sections */
const A = '../../assets/';

function Hero({ onBook }) {
  return (
    <section style={{ position: 'relative', minHeight: 660, display: 'flex', alignItems: 'flex-end', background: 'var(--ca-ink-900)', marginTop: -82 }}>
      <img src={A + 'hero-sprint-female.jpg'} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(1) contrast(1.08) brightness(0.74)' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.15) 38%, rgba(0,0,0,0.9) 100%)', mixBlendMode: 'multiply' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(0,0,0,0.65) 0%, transparent 58%)' }} />
      <div style={{ position: 'relative', zIndex: 2, maxWidth: 1200, margin: '0 auto', width: '100%', padding: '0 32px 76px' }}>
        <Eyebrow tone="bone" style={{ marginBottom: 18 }}>The Castille Method</Eyebrow>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(52px, 7vw, 104px)', lineHeight: 0.98, letterSpacing: '-0.015em', color: 'var(--ca-paper-100)', margin: 0, maxWidth: 880 }}>
          The Making<br />of an <span style={{ color: 'var(--ca-red-500)' }}>Athlete.</span>
        </h1>
        <p style={{ fontFamily: 'var(--font-serif)', fontSize: 19, lineHeight: 1.5, color: 'var(--ca-ink-200)', margin: '22px 0 30px', maxWidth: 470 }}>
          Assessed, measured, developed. A curriculum for speed, strength and craft — and one number that proves the work.
        </p>
        <div style={{ display: 'flex', gap: 14 }}>
          <Button variant="primary" icon="arrow-right" onClick={onBook}>Book Your Assessment</Button>
          <Button variant="ghost-bone">View the Method</Button>
        </div>
      </div>
    </section>
  );
}

function Pillars() {
  const items = [
    { no: '01', icon: 'zap', t: 'Velocity', d: 'Acceleration, top speed and change of direction. Every metre timed, never guessed.', img: A + 'photo-sprint-mixed.jpg' },
    { no: '02', icon: 'dumbbell', t: 'Force', d: 'Strength and power built through progressive, age-appropriate loading and clean mechanics.', img: A + 'photo-lifting.jpg' },
    { no: '03', icon: 'target', t: 'Craft', d: 'Coordination, mobility and resilience — the quiet durability of a complete athlete.', img: A + 'photo-agility-female.jpg' },
  ];
  return (
    <section style={{ background: 'var(--ca-paper-100)', padding: '96px 32px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <SectionLabel no="—">Three Disciplines</SectionLabel>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40, gap: 40 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(34px,4vw,58px)', lineHeight: 1, color: 'var(--ca-ink-900)', margin: 0, maxWidth: 620 }}>One Standard, Measured Three Ways.</h2>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 16, color: 'var(--fg-2)', maxWidth: 320, margin: 0 }}>Talent is a starting line, not a plan. We develop the whole athlete across the disciplines that decide games.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
          {items.map((p) => (
            <div key={p.no} style={{ position: 'relative', borderRadius: 'var(--r-lg)', overflow: 'hidden', background: 'var(--ca-ink-900)', minHeight: 380, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
              <img src={p.img} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(1) brightness(0.46) contrast(1.12)' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.92) 78%)' }} />
              <span style={{ position: 'absolute', top: 18, right: 22, fontFamily: 'var(--font-display)', fontSize: 56, color: 'transparent', WebkitTextStroke: '1px rgba(210,81,74,0.55)', lineHeight: 1 }}>{p.no}</span>
              <div style={{ position: 'relative', zIndex: 2, padding: 26 }}>
                <Icon name={p.icon} size={26} style={{ color: 'var(--ca-red-400)', marginBottom: 16 }} />
                <h3 style={{ fontFamily: 'var(--font-cond)', fontWeight: 700, fontSize: 26, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--ca-paper-100)', margin: '0 0 8px' }}>{p.t}</h3>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: 1.55, color: 'var(--ca-ink-200)', margin: 0 }}>{p.d}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function IndexSection() {
  const rows = [{ t: 'Velocity', v: 71 }, { t: 'Force', v: 78 }, { t: 'Craft', v: 73 }];
  return (
    <section style={{ background: 'var(--ca-ink-900)', color: 'var(--ca-paper-100)', padding: '96px 32px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 0.9fr', gap: 64, alignItems: 'center' }}>
        <div>
          <Eyebrow tone="bone" style={{ marginBottom: 18 }}>The Castille Index</Eyebrow>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(34px,4vw,56px)', lineHeight: 1, color: 'var(--ca-paper-100)', margin: '0 0 20px' }}>A Number That<br />Holds Us Accountable.</h2>
          <p style={{ fontFamily: 'var(--font-serif)', fontSize: 18, lineHeight: 1.55, color: 'var(--ca-ink-200)', margin: '0 0 16px', maxWidth: 460 }}>
            Every athlete is scored 0–100 at intake across speed, power and craft. We re-measure every block — so progress is something you can see, not something we ask you to take on faith.
          </p>
          <div style={{ display: 'flex', gap: 28, marginTop: 28 }}>
            <Stat v="+12" u="pts" l="Avg. gain / season" dark />
            <Stat v="4" u="" l="Re-tests / year" dark />
          </div>
        </div>
        <div style={{ background: 'var(--ca-ink-850)', border: '1px solid var(--ca-ink-700)', borderRadius: 'var(--r-lg)', padding: 32, boxShadow: 'var(--shadow-4)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
            <div>
              <div style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 16, color: 'var(--ca-paper-100)' }}>Mara Ellison</div>
              <div style={{ fontFamily: 'var(--font-cond)', fontWeight: 600, fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ca-ink-300)' }}>Rise · Soccer · Block 3</div>
            </div>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-cond)', fontWeight: 600, fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', background: 'rgba(47,125,84,0.18)', color: '#7fd0a0', padding: '5px 11px', borderRadius: 999 }}><i data-lucide="trending-up" style={{ width: 13, height: 13 }} />+18</span>
          </div>
          <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
            <IndexRing value={74} size={130} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {rows.map((r) => (
                <div key={r.t} style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-cond)', fontWeight: 600, fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    <span style={{ color: 'var(--ca-ink-200)' }}>{r.t}</span><span style={{ color: 'var(--ca-red-300)' }}>{r.v}</span>
                  </div>
                  <div style={{ height: 6, borderRadius: 999, background: 'var(--ca-ink-700)' }}><i style={{ display: 'block', height: '100%', width: r.v + '%', borderRadius: 999, background: 'var(--ca-red-400)' }} /></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ v, u, l, dark }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <b style={{ fontFamily: 'var(--font-cond)', fontWeight: 800, fontSize: 50, lineHeight: 0.9, color: dark ? 'var(--ca-paper-100)' : 'var(--ca-ink-900)', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.01em' }}>{v}<span style={{ fontSize: 22, color: 'var(--ca-red-500)' }}>{u && ' ' + u}</span></b>
      <span style={{ fontFamily: 'var(--font-cond)', fontWeight: 600, fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', color: dark ? 'var(--ca-ink-300)' : 'var(--fg-3)', marginTop: 6 }}>{l}</span>
    </div>
  );
}

function Programs({ onBook }) {
  const progs = [
    { tier: 'Prep · Foundation', t: 'Multi-Sport Prep', age: 'Ages 8–11', img: A + 'photo-agility-mixed.jpg', meta: ['2× / week · 8-week block', 'Movement literacy first'] },
    { tier: 'Rise · Development', t: 'Multi-Sport Rise', age: 'Ages 12–15', img: A + 'photo-jump-female.jpg', meta: ['2× / week · 10-week block', 'Small group · 6:1 ratio'] },
    { tier: 'Varsity · Performance', t: 'Varsity Force', age: 'Ages 16–18', img: A + 'photo-lifting.jpg', meta: ['3× / week · 12-week block', 'Index review every 4 weeks'] },
  ];
  return (
    <section style={{ background: 'var(--ca-paper-100)', padding: '96px 32px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <SectionLabel no="—">Programs by Age</SectionLabel>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(34px,4vw,56px)', lineHeight: 1, color: 'var(--ca-ink-900)', margin: '0 0 40px', maxWidth: 640 }}>A Curriculum That Grows With Your Athlete.</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 22 }}>
          {progs.map((p) => (
            <ProgramCard key={p.t} p={p} onBook={onBook} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ProgramCard({ p, onBook }) {
  const [hover, setHover] = React.useState(false);
  return (
    <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ background: 'var(--ca-white)', border: '1px solid var(--ca-ink-200)', borderRadius: 'var(--r-lg)', overflow: 'hidden', boxShadow: hover ? 'var(--shadow-3)' : 'var(--shadow-2)', transition: 'box-shadow var(--dur-base) var(--ease-out)', display: 'flex', flexDirection: 'column' }}>
      <Photo src={p.img} label={p.age} height={160} />
      <div style={{ padding: '18px 20px 22px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <span style={{ fontFamily: 'var(--font-cond)', fontWeight: 600, fontSize: 11.5, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--ca-red-600)' }}>{p.tier}</span>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 26, color: 'var(--ca-ink-900)', margin: '4px 0 12px', lineHeight: 1.05 }}>{p.t}</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 18 }}>
          {p.meta.map((m, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-body)', fontSize: 13.5, color: 'var(--fg-3)' }}>
              <i data-lucide={i === 0 ? 'calendar' : 'users'} style={{ width: 15, height: 15, color: 'var(--ca-ink-400)' }} />{m}
            </div>
          ))}
        </div>
        <div style={{ marginTop: 'auto' }}>
          <Button variant="ghost" onClick={onBook} style={{ width: '100%', justifyContent: 'center', padding: '11px 18px', fontSize: 14 }}>Book a Trial</Button>
        </div>
      </div>
    </div>
  );
}

function Campuses() {
  const c = [
    { n: 'Carmel', a: 'Flagship · 14,000 sq ft', img: A + 'photo-gym-wide.jpg' },
    { n: 'Indianapolis', a: 'North · Established 2024', img: A + 'photo-conditioning.jpg' },
    { n: 'Noblesville', a: 'Opening Fall', img: A + 'photo-group-coaching.jpg' },
    { n: 'Westfield', a: 'Opening Fall', img: A + 'photo-coach-action.jpg' },
  ];
  return (
    <section style={{ background: 'var(--ca-paper-50)', padding: '96px 32px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <SectionLabel no="—">Campuses</SectionLabel>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(34px,4vw,56px)', lineHeight: 1, color: 'var(--ca-ink-900)', margin: 0 }}>Four Campuses Across Indiana.</h2>
          <Button variant="text" icon="arrow-right">Find Your Nearest</Button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
          {c.map((x) => (
            <div key={x.n}>
              <Photo src={x.img} height={220} radius={8} />
              <div style={{ marginTop: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <i data-lucide="map-pin" style={{ width: 15, height: 15, color: 'var(--ca-red-600)' }} />
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 21, color: 'var(--ca-ink-900)' }}>{x.n}</span>
                </div>
                <div style={{ fontFamily: 'var(--font-cond)', fontWeight: 600, fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--fg-3)', marginTop: 4 }}>{x.a}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Testimonial() {
  return (
    <section style={{ background: 'var(--ca-paper-100)', padding: '40px 32px 96px' }}>
      <div style={{ maxWidth: 880, margin: '0 auto', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 22 }}><Stars n={5} size={18} /></div>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(26px,3.2vw,40px)', lineHeight: 1.18, color: 'var(--ca-ink-900)', margin: 0 }}>
          "Her Index went from 61 to 79 in two blocks. But the bigger change is the confidence — she walks onto the pitch like she <span style={{ color: 'var(--ca-red-500)' }}>belongs.</span>"
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 11, marginTop: 26 }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--ca-ink-900)', color: 'var(--ca-red-300)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: 17 }}>J</div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 14, color: 'var(--ca-ink-900)' }}>Julie H.</div>
            <div style={{ fontFamily: 'var(--font-cond)', fontWeight: 600, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--fg-3)' }}>Parent · Soccer · Carmel</div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CTA({ onBook }) {
  return (
    <section style={{ position: 'relative', background: 'var(--ca-ink-900)', overflow: 'hidden' }}>
      <img src={A + 'photo-running.jpg'} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(1) brightness(0.4) contrast(1.12)' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.85), rgba(0,0,0,0.7))' }} />
      <div style={{ position: 'relative', zIndex: 2, maxWidth: 1200, margin: '0 auto', padding: '88px 32px', textAlign: 'center' }}>
        <Eyebrow tone="bone" style={{ marginBottom: 18 }}>Find Your Index</Eyebrow>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(36px,5vw,72px)', lineHeight: 1, color: 'var(--ca-paper-100)', margin: '0 0 14px' }}>Start With a Measurement.</h2>
        <p style={{ fontFamily: 'var(--font-serif)', fontSize: 18, color: 'var(--ca-ink-200)', margin: '0 auto 30px', maxWidth: 480 }}>A full assessment takes 60 minutes and ends with your athlete's Castille Index and a recommended block.</p>
        <Button variant="primary" icon="arrow-right" onClick={onBook} style={{ padding: '16px 28px', fontSize: 16 }}>Book Your Assessment</Button>
      </div>
    </section>
  );
}

Object.assign(window, { Hero, Pillars, IndexSection, Programs, Campuses, Testimonial, CTA });
