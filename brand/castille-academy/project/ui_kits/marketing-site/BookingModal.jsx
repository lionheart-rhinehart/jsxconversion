/* Castille Academy marketing · Booking assessment modal (fake multi-step flow) */
function BookingModal({ open, onClose }) {
  const [step, setStep] = React.useState(0);
  const [data, setData] = React.useState({ name: '', age: 'Rise · 12–15', sport: 'Soccer', campus: 'Carmel', slot: '' });
  React.useEffect(() => { if (open) { setStep(0); setData({ name: '', age: 'Rise · 12–15', sport: 'Soccer', campus: 'Carmel', slot: '' }); } }, [open]);
  if (!open) return null;
  const set = (k, v) => setData((d) => ({ ...d, [k]: v }));
  const steps = ['Athlete', 'Sport', 'Schedule', 'Confirmed'];

  const seg = (opts, k) => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {opts.map((o) => (
        <button key={o} onClick={() => set(k, o)} style={{
          fontFamily: 'var(--font-cond)', fontWeight: 600, fontSize: 13, letterSpacing: '0.06em', textTransform: 'uppercase',
          padding: '10px 15px', borderRadius: 'var(--r-md)', cursor: 'pointer',
          border: '1px solid ' + (data[k] === o ? 'var(--ca-ink-900)' : 'var(--ca-ink-200)'),
          background: data[k] === o ? 'var(--ca-ink-900)' : 'var(--ca-white)',
          color: data[k] === o ? 'var(--ca-paper-100)' : 'var(--fg-2)' }}>{o}</button>
      ))}
    </div>
  );
  const label = (t) => <div style={{ fontFamily: 'var(--font-cond)', fontWeight: 600, fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--fg-2)', marginBottom: 9 }}>{t}</div>;

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: 'min(560px, 100%)', background: 'var(--ca-paper-50)', borderRadius: 'var(--r-xl)', boxShadow: 'var(--shadow-4)', overflow: 'hidden' }}>
        <div style={{ background: 'var(--ca-ink-900)', padding: '20px 26px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Wordmark tone="bone" size={17} />
          <button onClick={onClose} style={{ background: 'transparent', border: 0, color: 'var(--ca-ink-300)', cursor: 'pointer', display: 'flex' }}><i data-lucide="x" style={{ width: 20, height: 20 }} /></button>
        </div>
        <div style={{ display: 'flex', gap: 6, padding: '16px 26px 0' }}>
          {steps.map((s, i) => (
            <div key={s} style={{ flex: 1, height: 4, borderRadius: 999, background: i <= step ? 'var(--ca-red-500)' : 'var(--ca-ink-200)' }} />
          ))}
        </div>
        <div style={{ padding: 26 }}>
          {step === 0 && (
            <div>
              <Eyebrow style={{ marginBottom: 8 }}>Step 1 · Athlete</Eyebrow>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 27, color: 'var(--ca-ink-900)', margin: '0 0 20px' }}>Who are we assessing?</h3>
              {label('Athlete name')}
              <input autoFocus value={data.name} onChange={(e) => set('name', e.target.value)} placeholder="First and last name" style={{ width: '100%', fontFamily: 'var(--font-body)', fontSize: 15, padding: '12px 14px', border: '1px solid var(--ca-ink-200)', borderRadius: 'var(--r-md)', outline: 'none', marginBottom: 18, background: '#fff' }} />
              {label('Age group')}
              {seg(['Prep · 8–11', 'Rise · 12–15', 'Varsity · 16–18'], 'age')}
            </div>
          )}
          {step === 1 && (
            <div>
              <Eyebrow style={{ marginBottom: 8 }}>Step 2 · Sport</Eyebrow>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 27, color: 'var(--ca-ink-900)', margin: '0 0 20px' }}>What do they play?</h3>
              {label('Primary sport')}
              {seg(['Soccer', 'Basketball', 'Football', 'Track', 'Baseball', 'Volleyball', 'Other'], 'sport')}
            </div>
          )}
          {step === 2 && (
            <div>
              <Eyebrow style={{ marginBottom: 8 }}>Step 3 · Schedule</Eyebrow>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 27, color: 'var(--ca-ink-900)', margin: '0 0 20px' }}>Pick a campus and time.</h3>
              {label('Campus')}
              <div style={{ marginBottom: 18 }}>{seg(['Carmel', 'Indianapolis', 'Noblesville', 'Westfield'], 'campus')}</div>
              {label('Assessment slot')}
              {seg(['Sat 9:00 AM', 'Sat 11:00 AM', 'Tue 4:30 PM', 'Thu 5:30 PM'], 'slot')}
            </div>
          )}
          {step === 3 && (
            <div style={{ textAlign: 'center', padding: '8px 0' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(47,125,84,0.14)', color: 'var(--ca-success)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}><i data-lucide="check" style={{ width: 30, height: 30 }} /></div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 30, color: 'var(--ca-ink-900)', margin: '0 0 10px' }}>You're booked.</h3>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--fg-2)', margin: '0 auto', maxWidth: 360 }}>
                {(data.name || 'Your athlete')}'s assessment is set for <b style={{ color: 'var(--ca-ink-900)' }}>{data.slot || 'Sat 9:00 AM'}</b> at the <b style={{ color: 'var(--ca-ink-900)' }}>{data.campus}</b> campus. We'll email the intake form and end the session with their first Castille Index.
              </p>
            </div>
          )}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 26px 26px' }}>
          {step > 0 && step < 3 ? <Button variant="text" onClick={() => setStep(step - 1)}>Back</Button> : <span />}
          {step < 3 && <Button variant="primary" icon="arrow-right" onClick={() => setStep(step + 1)}>{step === 2 ? 'Confirm Booking' : 'Continue'}</Button>}
          {step === 3 && <Button variant="navy" onClick={onClose} style={{ marginLeft: 'auto' }}>Done</Button>}
        </div>
      </div>
    </div>
  );
}
Object.assign(window, { BookingModal });
