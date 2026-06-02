// FUEL UP — 9:16 Reel — 7s loop
// Nutrition card: meal name, macro ring, P/C/F legend, tagline.
// Editable: eyebrow, meal, tagline, protein, carbs, fat, calories, photo.

const FUEL_UP_SPEC = {
  id: 'fuel-up',
  name: 'FUEL UP',
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
    "default": "FUEL UP"
  },
  {
    "key": "meal",
    "label": "Meal name",
    "type": "text",
    "default": "POST-LIFT RECOVERY BOWL"
  },
  {
    "key": "tagline",
    "label": "Tagline",
    "type": "text",
    "default": "EAT TO PERFORM · NOT TO RESTRICT"
  },
  {
    "key": "protein",
    "label": "Protein (g)",
    "type": "number",
    "default": 42,
    "min": 0,
    "step": 1
  },
  {
    "key": "carbs",
    "label": "Carbs (g)",
    "type": "number",
    "default": 58,
    "min": 0,
    "step": 1
  },
  {
    "key": "fat",
    "label": "Fat (g)",
    "type": "number",
    "default": 16,
    "min": 0,
    "step": 1
  },
  {
    "key": "calories",
    "label": "Calories",
    "type": "number",
    "default": 580,
    "min": 0,
    "step": 10
  },
  {
    "key": "photo",
    "label": "Meal photo (bg)",
    "type": "image",
    "default": "assets/photo-gym-wide.jpg",
    "sub": "shown dimmed behind"
  }
],
};

function FuelUpReel({ data = {} }) {
  const t = useTime();
  const RED = '#c4141d', AMBER = '#f59e0b', GREEN = '#15a34a';

  const eyebrow  = data.eyebrow  ?? 'FUEL UP';
  const meal     = data.meal     ?? 'POST-LIFT RECOVERY BOWL';
  const tagline  = data.tagline  ?? 'EAT TO PERFORM · NOT TO RESTRICT';
  const protein  = Number(data.protein  ?? 42);
  const carbs    = Number(data.carbs    ?? 58);
  const fat      = Number(data.fat      ?? 16);
  const calories = Number(data.calories ?? 580);
  const photo    = data.photo    ?? 'assets/photo-gym-wide.jpg';

  const E = Easing;
  const eyebrowT = E.easeOutBack(Math.max(0, Math.min(1, (t - 0.3) / 0.4)));
  const mealT    = E.easeOutCubic(Math.max(0, Math.min(1, (t - 0.7) / 0.5)));
  const ringT    = Math.max(0, Math.min(1, (t - 1.2) / 0.4));
  const legendT  = E.easeOutCubic(Math.max(0, Math.min(1, (t - 3.0) / 0.6)));
  const tagT     = Math.max(0, Math.min(1, (t - 4.0) / 0.6));

  const legend = [
    { label: 'PROTEIN', val: protein, color: RED },
    { label: 'CARBS',   val: carbs,   color: AMBER },
    { label: 'FAT',     val: fat,     color: GREEN },
  ];

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a0b0d', overflow: 'hidden' }}>
      <img src={photo} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
        opacity: 0.16, filter: 'grayscale(0.4) brightness(0.7)' }}/>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(120% 80% at 50% 38%, rgba(196,20,29,0.12) 0%, rgba(10,11,13,0.6) 55%, rgba(10,11,13,0.96) 100%)' }}/>

      {/* Eyebrow */}
      <Eyebrow top={170} fontSize={38} style={{ left: 0, right: 0, textAlign: 'center', opacity: eyebrowT }}>{eyebrow}</Eyebrow>

      {/* Meal name */}
      <div style={{ position: 'absolute', top: 310, left: 80, right: 80, textAlign: 'center', opacity: mealT,
        transform: `translateY(${(1 - mealT) * 18}px)`, fontFamily: 'Anton, sans-serif', fontSize: 88, color: '#fff',
        lineHeight: 0.94, textWrap: 'balance' }}>{meal}</div>

      {/* Macro ring */}
      <div style={{ position: 'absolute', top: 620, left: 0, right: 0, display: 'flex', justifyContent: 'center',
        opacity: ringT, transform: `scale(${0.85 + 0.15 * ringT})` }}>
        {window.MacroRing && <window.MacroRing protein={protein} carbs={carbs} fat={fat} calories={calories} size={520}/>}
      </div>

      {/* Legend */}
      <div style={{ position: 'absolute', bottom: 360, left: 60, right: 60, display: 'flex', gap: 18,
        opacity: legendT, transform: `translateY(${(1 - legendT) * 20}px)` }}>
        {legend.map((m) => (
          <div key={m.label} style={{ flex: 1, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
            borderTop: `4px solid ${m.color}`, padding: '20px 16px', textAlign: 'center' }}>
            <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 56, fontWeight: 800, color: '#fff',
              fontVariantNumeric: 'tabular-nums', lineHeight: 0.9 }}>{m.val}<span style={{ fontSize: 26, color: '#969ca7' }}>g</span></div>
            <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 20, color: m.color, letterSpacing: '0.12em', marginTop: 8 }}>{m.label}</div>
          </div>
        ))}
      </div>

      {/* Tagline */}
      <div style={{ position: 'absolute', bottom: 200, left: 60, right: 60, textAlign: 'center', opacity: tagT,
        fontFamily: '"JetBrains Mono", monospace', fontSize: 28, color: '#c2c6cd', letterSpacing: '0.08em' }}>{tagline}</div>

      {/* Logo */}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 90, textAlign: 'center', opacity: tagT,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <img src="assets/logo.png" style={{ width: 64, height: 64, objectFit: 'contain' }}/>
        <div style={{ fontFamily: 'Anton, sans-serif', fontSize: 36, color: '#fff' }}>ATHLETES ACCELERATION</div>
      </div>
    </div>
  );
}

window.FuelUpReel = FuelUpReel;
window.FUEL_UP_SPEC = FUEL_UP_SPEC;
