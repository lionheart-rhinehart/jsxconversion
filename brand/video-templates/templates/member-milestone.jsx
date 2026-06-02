// MEMBER MILESTONE — 9:16 Reel — 7s loop
// Consistency celebration: streak flame, big session count, name, note.
// Editable: eyebrow, count, label, name, note, photo.

const MEMBER_MILESTONE_SPEC = {
  id: 'member-milestone',
  name: 'MEMBER MILESTONE',
  fields: [
  {
    "key": "duration",
    "label": "Length",
    "type": "slider",
    "default": 7,
    "min": 4,
    "max": 15,
    "step": 0.5,
    "unit": "s"
  },
  {
    "key": "eyebrow",
    "label": "Eyebrow",
    "type": "text",
    "default": "CONSISTENCY WINS"
  },
  {
    "key": "count",
    "label": "Count",
    "type": "number",
    "default": 100,
    "min": 1,
    "step": 1,
    "sub": "counts up to this"
  },
  {
    "key": "label",
    "label": "Count label",
    "type": "text",
    "default": "SESSIONS LOGGED"
  },
  {
    "key": "name",
    "label": "Name",
    "type": "text",
    "default": "DEVIN CARTER"
  },
  {
    "key": "note",
    "label": "Note",
    "type": "text",
    "default": "Showed up. Did the work. Every single time."
  },
  {
    "key": "photo",
    "label": "Photo (bg)",
    "type": "image",
    "default": "assets/photo-lifting.jpg",
    "sub": "shown dimmed behind"
  }
],
};

function MemberMilestoneReel({ data = {} }) {
  const t = useTime();
  const RED = '#c4141d';

  const eyebrow = data.eyebrow ?? 'CONSISTENCY WINS';
  const count   = Number(data.count ?? 100);
  const label   = data.label   ?? 'SESSIONS LOGGED';
  const name    = data.name    ?? 'DEVIN CARTER';
  const note    = data.note    ?? 'Showed up. Did the work. Every single time.';
  const photo   = data.photo   ?? 'assets/photo-lifting.jpg';

  const E = Easing;
  const eyebrowT = E.easeOutBack(Math.max(0, Math.min(1, (t - 0.3) / 0.4)));
  const flameT   = Math.max(0, Math.min(1, (t - 0.8) / 0.4));
  const nameT    = E.easeOutCubic(Math.max(0, Math.min(1, (t - 3.2) / 0.6)));
  const noteT    = Math.max(0, Math.min(1, (t - 3.9) / 0.6));
  const logoT    = Math.max(0, Math.min(1, (t - 4.6) / 0.6));

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a0b0d', overflow: 'hidden' }}>
      <img src={photo} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
        opacity: 0.18, filter: 'grayscale(0.4) brightness(0.65)' }}/>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(110% 70% at 50% 42%, rgba(245,158,11,0.14) 0%, rgba(10,11,13,0.6) 50%, rgba(10,11,13,0.97) 100%)' }}/>

      {/* Eyebrow */}
      <Eyebrow top={180} fontSize={36} style={{ left: 0, right: 0, textAlign: 'center', opacity: eyebrowT }}>{eyebrow}</Eyebrow>

      {/* Streak flame + count */}
      <div style={{ position: 'absolute', top: 420, left: 0, right: 0, display: 'flex', justifyContent: 'center',
        opacity: flameT, transform: `scale(${0.9 + 0.1 * flameT})` }}>
        {window.StreakFlame && <window.StreakFlame days={count} label={label} size={560}/>}
      </div>

      {/* Name */}
      <div style={{ position: 'absolute', bottom: 360, left: 60, right: 60, textAlign: 'center', opacity: nameT,
        transform: `translateY(${(1 - nameT) * 20}px)` }}>
        <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 26, color: '#969ca7', letterSpacing: '0.2em', marginBottom: 10 }}>// MILESTONE UNLOCKED</div>
        <div style={{ fontFamily: 'Anton, sans-serif', fontSize: 124, color: '#fff', lineHeight: 0.92 }}>{name}</div>
      </div>

      {/* Note */}
      <div style={{ position: 'absolute', bottom: 220, left: 70, right: 70, textAlign: 'center', opacity: noteT,
        fontFamily: '"Geist", sans-serif', fontSize: 36, color: '#c2c6cd', lineHeight: 1.4, fontStyle: 'italic', textWrap: 'pretty' }}>“{note}”</div>

      {/* Logo */}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 90, textAlign: 'center', opacity: logoT,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <img src="assets/logo.png" style={{ width: 60, height: 60, objectFit: 'contain' }}/>
        <div style={{ fontFamily: 'Anton, sans-serif', fontSize: 34, color: '#fff' }}>ATHLETES ACCELERATION</div>
      </div>
    </div>
  );
}

window.MemberMilestoneReel = MemberMilestoneReel;
window.MEMBER_MILESTONE_SPEC = MEMBER_MILESTONE_SPEC;
