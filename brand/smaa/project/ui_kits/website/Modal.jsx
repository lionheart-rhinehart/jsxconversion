/* ============================================================
   SMAA Website UI Kit — Get Started modal (lead funnel)
   ============================================================ */
function GetStartedModal({ open, onClose }) {
  const [submitted, setSubmitted] = React.useState(false);
  const [form, setForm] = React.useState({ parent: '', email: '', phone: '', age: '', location: 'Portland' });

  React.useEffect(() => {
    if (open) { setSubmitted(false); setForm({ parent: '', email: '', phone: '', age: '', location: 'Portland' }); }
    const onKey = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  if (!open) return null;
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const field = { fontFamily: 'var(--font-sans)', fontSize: 15, padding: '13px 15px',
    border: '1.5px solid var(--paper-line)', borderRadius: 10, background: '#fff', color: 'var(--fg1)',
    width: '100%', outline: 'none' };
  const label = { fontSize: 13, fontWeight: 700, color: 'var(--fg1)', marginBottom: 6, display: 'block' };

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(11,18,25,.62)', backdropFilter: 'blur(4px)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', padding: 20,
      animation: 'smaaFade .2s ease' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 18,
        width: '100%', maxWidth: 460, boxShadow: 'var(--shadow-lg)', overflow: 'hidden',
        animation: 'smaaPop .22s ease' }}>
        <div style={{ background: 'var(--ink-900)', padding: '22px 26px', position: 'relative' }}>
          <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'none',
            border: 'none', cursor: 'pointer' }}>
            <Icon name="x" size={22} color="rgba(255,255,255,.7)" />
          </button>
          <div className="smaa-eyebrow" style={{ color: '#5fb0f5' }}>Free 1:1 Evaluation</div>
          <div style={{ color: '#fff', fontFamily: 'var(--font-sans)', fontWeight: 800, fontSize: 22,
            marginTop: 4 }}>Book Your Gameplan Session</div>
        </div>

        {submitted ? (
          <div style={{ padding: '40px 30px', textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--smaa-green-050)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
              <Icon name="check" size={34} color="var(--smaa-green)" stroke={3} />
            </div>
            <h3 className="smaa-h3" style={{ marginBottom: 8 }}>You're all set, {form.parent.split(' ')[0] || 'Coach'}!</h3>
            <p className="smaa-body" style={{ fontSize: 15, marginBottom: 24 }}>
              Our team will reach out within 24 hours to schedule {form.age ? `your ${form.age}-year-old's` : 'your'} free
              evaluation at our {form.location} studio.</p>
            <CTAButton full onClick={onClose}>Done</CTAButton>
          </div>
        ) : (
          <form onSubmit={e => { e.preventDefault(); setSubmitted(true); }}
            style={{ padding: '24px 26px 28px', display: 'flex', flexDirection: 'column', gap: 15 }}>
            <div>
              <label style={label}>Parent Name</label>
              <input style={field} required value={form.parent} onChange={set('parent')} placeholder="Jane Doe" />
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <label style={label}>Email</label>
                <input style={field} type="email" required value={form.email} onChange={set('email')} placeholder="jane@email.com" />
              </div>
              <div style={{ width: 110 }}>
                <label style={label}>Child's Age</label>
                <input style={field} type="number" min="7" max="18" required value={form.age} onChange={set('age')} placeholder="10" />
              </div>
            </div>
            <div>
              <label style={label}>Phone</label>
              <input style={field} type="tel" value={form.phone} onChange={set('phone')} placeholder="(207) 555-0123" />
            </div>
            <div>
              <label style={label}>Preferred Studio</label>
              <select style={field} value={form.location} onChange={set('location')}>
                <option>Portland</option><option>Saco</option>
              </select>
            </div>
            <div style={{ marginTop: 6 }}>
              <CTAButton full withArrow>Claim My Free Evaluation</CTAButton>
            </div>
            <p style={{ fontSize: 12, color: 'var(--fg3)', textAlign: 'center', margin: 0 }}>
              No obligation. We'll confirm your session within 24 hours.</p>
          </form>
        )}
      </div>
    </div>
  );
}
Object.assign(window, { GetStartedModal });
