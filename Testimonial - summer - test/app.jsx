// app.jsx — three-column layout hosting all 3 variations side-by-side.

function App() {
  const [focus, setFocus] = React.useState(null); // null | 'A' | 'B' | 'C'

  React.useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setFocus(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const variants = [
    {
      id: 'A', name: 'Bold · Kinetic',
      tag: 'For Reels / paid ads',
      desc: 'Hard cuts, ultra-condensed type, red accent slashes. "Stronger. Faster. Confident." beat-driven.',
      Comp: VariationA, themeBg: '#0a0707', themeFg: '#fff', accent: '#d72020', duration: '10s',
    },
    {
      id: 'B', name: 'Premium · Editorial',
      tag: 'For brand story / web',
      desc: 'Newspaper-pull-quote on bright white. Large italic serif builds word-by-word with red accents.',
      Comp: VariationB, themeBg: '#ffffff', themeFg: '#0a0a0a', accent: '#d72020', duration: '10s',
    },
    {
      id: 'C', name: 'Warm · Human',
      tag: 'For stories / community',
      desc: 'White paper, italic serif + handwritten red script. "His confidence is off the charts" with a drawn underline.',
      Comp: VariationC, themeBg: '#ffffff', themeFg: '#0a0a0a', accent: '#d72020', duration: '10s',
    },
    {
      id: 'D', name: 'Stadium · Scoreboard',
      tag: 'For locations / case study',
      desc: 'Broadcast HUD on black. Animated stat bars for strength + speed — then the confidence bar literally bursts off the chart.',
      Comp: VariationD, themeBg: '#0a0707', themeFg: '#fff', accent: '#d72020', duration: '10s',
    },
    {
      id: 'E', name: 'Text Message · Thread',
      tag: 'For Reels / authentic-feel',
      desc: 'The mom texting the coach over the course of 2 months. iMessage-style bubbles, reactions, typing indicators. Reads as a screenshot of a real conversation.',
      Comp: VariationE, themeBg: '#000000', themeFg: '#fff', accent: '#d72020', duration: '30s',
    },
    {
      id: 'F', name: 'Cinematic · Doc Trailer',
      tag: 'For trailers / Netflix-style',
      desc: 'Letterboxed 2.39:1 with full-bleed photos, slow Ken Burns zooms, chapter cards (I. The Start, II. The Work, III. The Change), typewriter subtitles. Reads like a sports doc trailer.',
      Comp: VariationF, themeBg: '#050505', themeFg: '#fff', accent: '#d72020', duration: '30s',
    },
    {
      id: 'G', name: 'Before · After Split',
      tag: 'For results / case study',
      desc: 'Vertical split screen — DAY 01 (desaturated, top) vs DAY 60 (vivid, bottom). Center stat band ticks up: +38% speed, +42% power, +99% confidence. Photos do the work.',
      Comp: VariationG, themeBg: '#0a0707', themeFg: '#fff', accent: '#d72020', duration: '30s',
    },
    {
      id: 'H', name: 'Swiss · Kinetic',
      tag: 'For brand / poster / web',
      desc: 'Type-as-architecture in a strict grid. Giant "2" transforms into "2 MONTHS", stacked words rotate in, modernist composition throughout.',
      Comp: VariationH, themeBg: '#f4f1ea', themeFg: '#0a0a0a', accent: '#d72020', duration: '30s',
    },
  ];

  return (
    <div className="page">
      <header className="page-header">
        <div className="masthead">
          <div className="masthead-eyebrow">Testimonial · 9:16 · the spectrum</div>
          <h1>Eight directions for the Athletes Acceleration testimonial</h1>
          <p className="subhead">
            The full range — from short kinetic cuts (A–D, 10s) to longer narrative pieces (E–H, 30s).
            Same parent testimonial, eight wildly different visual vocabularies: bold sports, editorial, hand-drawn,
            scoreboard, text-message thread, cinematic doc trailer, before/after split, Swiss modernist.
            All on brand red / black / white. Hit play on any; click any card to focus.
          </p>
        </div>
        <div className="legend">
          <span><kbd>space</kbd> play/pause</span>
          <span><kbd>←</kbd>/<kbd>→</kbd> scrub</span>
          <span><kbd>0</kbd> restart</span>
          <span><kbd>esc</kbd> exit focus</span>
        </div>
      </header>

      <div className="grid">
        {variants.map(v => (
          <VariantCard key={v.id} variant={v} onFocus={() => setFocus(v.id)}/>
        ))}
      </div>

      <footer className="page-footer">
        <div>Source quote: <em>"…he has not only gained speed and power in the 2 months, but his confidence is off the charts… I never thought I'd see the day my son would love to run and work out."</em></div>
      </footer>

      {focus && (
        <FocusOverlay
          variant={variants.find(v => v.id === focus)}
          onClose={() => setFocus(null)}
        />
      )}
    </div>
  );
}

function VariantCard({ variant, onFocus }) {
  const { Comp, name, tag, desc, id, themeBg, themeFg, accent } = variant;
  return (
    <div className="card" style={{ '--accent': accent }}>
      <div className="card-meta">
        <div className="card-id">{id}</div>
        <div className="card-text">
          <div className="card-name">{name}</div>
          <div className="card-tag">{tag} · <span style={{color: accent}}>{variant.duration || '10s'}</span></div>
        </div>
        <button className="focus-btn" onClick={onFocus} title="Open fullscreen">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2 5V2h3M9 2h3v3M12 9v3H9M5 12H2V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
      </div>
      <div className="card-frame" style={{ background: themeBg }}>
        <Comp/>
      </div>
      <div className="card-desc">{desc}</div>
    </div>
  );
}

function FocusOverlay({ variant, onClose }) {
  const { Comp, name, id, themeBg } = variant;
  return (
    <div className="focus-overlay" onClick={onClose}>
      <div className="focus-header">
        <div className="focus-label">
          <span className="focus-id">{id}</span> {name}
        </div>
        <button className="focus-close" onClick={onClose}>
          Close · <kbd>esc</kbd>
        </button>
      </div>
      <div className="focus-stage" onClick={(e) => e.stopPropagation()} style={{ background: themeBg }}>
        <Comp/>
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App/>);
