// CREATIVE C — "We Toured Three Other Places" — :35 — 9:16 (1080×1920)
// Editorial magazine treatment. Page-flip transitions, big Anton pull-quotes,
// figure-caption photo insets, bylines, page numbers. Parent voice → athlete voice → the number.

const W = 1080;
const H = 1920;
const DUR = 48;

const RED = "#c4141d";
const RED_BRIGHT = "#e02828";
const INK_950 = "#0a0b0d";
const INK_900 = "#15171a";
const INK_800 = "#1f2227";
const INK_500 = "#6b727f";
const PAPER = "#f5f1e8";
const PAPER_INK = "#1a1a1a";
const PAPER_RULE = "#c8bfa9";
const WHITE = "#ffffff";

const FONT_DISP = '"Anton", "Oswald", "Arial Narrow", system-ui, sans-serif';
const FONT_BODY = '"Geist", "Inter", system-ui, sans-serif';
const FONT_MONO = '"JetBrains Mono", ui-monospace, monospace';

// ── Tweaks ────────────────────────────────────────────────────────────────
const TWEAK_DEFAULTS_C = /*EDITMODE-BEGIN*/{
  "variant": "editorial",
  "parentName": "Jessica M.",
  "athleteName": "Tyler M.",
  "athleteAge": 16,
  "splitImprovement": 0.15,
  "tagline": "Train fast. Be fast.",
  "showPageChrome": true
}/*EDITMODE-END*/;
const TweakCtxC = React.createContext(TWEAK_DEFAULTS_C);
const useTweakC = () => React.useContext(TweakCtxC);
function isBanner(tw) { return tw.variant === 'banner'; }

const clamp01 = (v) => Math.max(0, Math.min(1, v));

// ── Page chrome (top + bottom strip in the magazine spreads) ──────────────
function PageChrome({ pageNum, total, sectionLabel, paper = false, accent }) {
  const tw = useTweakC();
  const banner = isBanner(tw);
  if (!tw.showPageChrome) return null;
  if (banner) return null;
  const fg = paper ? PAPER_INK : WHITE;
  const muted = paper ? '#2b2418' : WHITE;
  const ruleColor = paper ? PAPER_RULE : INK_700;
  return (
    <React.Fragment>
      {/* Top */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 6,
        height: 96, padding: '0 56px',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
        paddingBottom: 14,
      }}>
        <div style={{
          fontFamily: FONT_MONO, fontSize: 18, letterSpacing: '0.16em',
          color: muted, textTransform: 'uppercase', fontWeight: 600,
        }}>
          Field Report · No. 02
        </div>
        <div style={{
          fontFamily: FONT_MONO, fontSize: 18, letterSpacing: '0.16em',
          color: accent || muted, textTransform: 'uppercase', fontWeight: 600,
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span>PG {String(pageNum).padStart(2,'0')}</span>
          <span style={{ color: muted, opacity: 0.65 }}>/ {String(total).padStart(2,'0')}</span>
        </div>
      </div>
      <div style={{
        position: 'absolute', top: 96, left: 56, right: 56, height: 1,
        background: ruleColor, zIndex: 6,
      }}/>
      {/* Bottom rule */}
      <div style={{
        position: 'absolute', bottom: 80, left: 56, right: 56, height: 1,
        background: ruleColor, zIndex: 6,
      }}/>
      {/* Bottom brand strip — section label removed (was editorial-only chrome) */}
      <div style={{
        position: 'absolute', bottom: 28, left: 56, right: 56, zIndex: 6,
        display: 'flex', justifyContent: 'flex-end',
        fontFamily: FONT_MONO, fontSize: 16, letterSpacing: '0.18em',
        color: muted, textTransform: 'uppercase', fontWeight: 700,
      }}>
        <span>athletes acceleration · noblesville</span>
      </div>
    </React.Fragment>
  );
}

// ── Page flip wrapper: each page slides in from below with stagger ────────
function Page({ start, end, paper = false, children }) {
  return (
    <Sprite start={start} end={end}>
      <PageInner paper={paper}>{children}</PageInner>
    </Sprite>
  );
}
function PageInner({ paper, children }) {
  const tw = useTweakC();
  const banner = isBanner(tw);
  const { localTime, duration } = useSprite();
  // Slide up entry over 0.5s
  const entry = clamp01(localTime / 0.5);
  const exit = clamp01(1 - clamp01((duration - localTime) / 0.45));
  // Outgoing page uses a different easing curve via cubic-bezier-like quad
  const ease = (t) => 1 - Math.pow(1 - t, 3);
  const tyEased = (1 - ease(entry)) * H + ease(exit) * -H;
  // Effective bg: banner replaces paper with deep red
  const bg = banner && paper ? RED : (paper ? PAPER : INK_950);
  const fg = banner && paper ? WHITE : (paper ? PAPER_INK : WHITE);
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 4,
      background: bg, color: fg,
      transform: `translateY(${tyEased}px)`,
      willChange: 'transform',
      overflow: 'hidden',
    }}>
      {/* Paper grain texture (only when paper + not banner) */}
      {paper && !banner && (
        <div style={{
          position: 'absolute', inset: 0,
          background:
            'radial-gradient(circle at 20% 30%, rgba(0,0,0,0.025), transparent 70%),' +
            'radial-gradient(circle at 80% 70%, rgba(0,0,0,0.025), transparent 70%)',
          pointerEvents: 'none',
        }}/>
      )}
      {/* Banner texture overlay */}
      {paper && banner && (
        <div style={{
          position: 'absolute', inset: 0,
          background:
            'radial-gradient(circle at 70% 20%, rgba(255,255,255,0.06), transparent 65%),' +
            'repeating-linear-gradient(135deg, rgba(0,0,0,0.04) 0 14px, transparent 14px 28px)',
          pointerEvents: 'none',
        }}/>
      )}
      {children}
    </div>
  );
}

// ── Eyebrow ────────────────────────────────────────────────────────────────
function Eyebrow({ children, paper, accent }) {
  return (
    <div style={{
      fontFamily: FONT_MONO, fontSize: 22, letterSpacing: '0.18em',
      color: accent || (paper ? RED : RED_BRIGHT),
      textTransform: 'uppercase', fontWeight: 600,
    }}>// {children}</div>
  );
}

// ── Big Anton pull-quote ───────────────────────────────────────────────────
function PullQuote({ children, paper, size = 156, lineHeight = 0.88 }) {
  const tw = useTweakC();
  const banner = isBanner(tw);
  return (
    <div style={{
      fontFamily: FONT_DISP, fontSize: banner ? Math.round(size * 1.18) : size, lineHeight,
      color: paper ? PAPER_INK : WHITE,
      textTransform: 'uppercase', letterSpacing: '-0.01em',
    }}>{children}</div>
  );
}

// ── Byline — figure-caption style ─────────────────────────────────────────
function Byline({ name, meta, paper }) {
  const fg = paper ? PAPER_INK : WHITE;
  const muted = paper ? '#2b2418' : 'rgba(255,255,255,0.85)';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <div style={{
        width: 48, height: 4,
        background: paper ? RED : RED_BRIGHT,
      }}/>
      <div>
        <div style={{
          fontFamily: FONT_MONO, fontSize: 22, letterSpacing: '0.04em',
          color: fg, fontWeight: 700, textTransform: 'uppercase',
        }}>{name}</div>
        <div style={{
          fontFamily: FONT_MONO, fontSize: 15, letterSpacing: '0.16em',
          color: muted, textTransform: 'uppercase', marginTop: 4, fontWeight: 500,
        }}>{meta}</div>
      </div>
    </div>
  );
}

// ── Figure photo (inset with caption) ─────────────────────────────────────
function Figure({ src, label, caption, paper, height = 540 }) {
  const tw = useTweakC();
  // Banner variant: hide figures entirely for a billboard feel
  if (isBanner(tw)) return null;
  return (
    <div style={{ width: '100%' }}>
      <div style={{
        position: 'relative', width: '100%', height,
        background: paper ? '#dcd5c1' : INK_900,
        overflow: 'hidden',
        border: paper ? `1px solid ${PAPER_RULE}` : `1px solid ${INK_800}`,
      }}>
        <img src={src} alt="" style={{
          position: 'absolute', inset: 0,
          width: '100%', height: '100%', objectFit: 'cover',
          filter: paper
            ? 'grayscale(0.18) saturate(0.7) contrast(1.04) brightness(0.94)'
            : 'saturate(0.82) contrast(1.06) brightness(0.92)',
        }}/>
        {paper && (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(180deg, rgba(245,241,232,0) 60%, rgba(245,241,232,0.18) 100%)',
            mixBlendMode: 'multiply',
          }}/>
        )}
      </div>
      <div style={{
        marginTop: 10,
        display: 'flex', justifyContent: 'space-between',
        fontFamily: FONT_MONO, fontSize: 14, letterSpacing: '0.16em',
        color: paper ? '#2b2418' : 'rgba(255,255,255,0.82)',
        textTransform: 'uppercase', fontWeight: 700,
      }}>
        <span>{label}</span>
        <span>{caption}</span>
      </div>
    </div>
  );
}

// ── SCENE 1: parent opening (paper) ────────────────────────────────────────
function ScenePage1() {
  const tw = useTweakC();
  const { localTime } = useSprite();
  const t1 = clamp01(localTime / 0.6);
  const t2 = clamp01((localTime - 0.6) / 0.6);
  const t3 = clamp01((localTime - 1.4) / 0.6);
  const t4 = clamp01((localTime - 2.6) / 0.6);
  return (
    <div style={{ position: 'absolute', inset: 0, padding: '140px 56px 100px' }}>
      <PageChrome pageNum={1} total={4} sectionLabel="01 · The Parent" paper/>

      <div style={{ opacity: t1, transform: `translateY(${(1-t1)*16}px)` }}>
        <Eyebrow paper>From a Noblesville parent</Eyebrow>
      </div>

      <div style={{ marginTop: 36, opacity: t2, transform: `translateY(${(1-t2)*24}px)` }}>
        <PullQuote paper size={172} lineHeight={0.88}>
          "We toured<br/>
          <span style={{ color: RED }}>three other</span><br/>
          places before<br/>
          we came here."
        </PullQuote>
      </div>

      <div style={{
        marginTop: 60, opacity: t3,
        display: 'grid', gridTemplateColumns: '1fr', gap: 24,
        maxWidth: 880,
      }}>
        <Figure src="assets/photo-gym-wide.jpg"
          label="Fig. 01" caption="AA Noblesville · Training Floor"
          paper height={460}/>
      </div>

      <div style={{
        position: 'absolute', left: 56, right: 56, bottom: 130,
        opacity: t4, transform: `translateY(${(1-t4)*10}px)`,
      }}>
        <Byline name={tw.parentName} meta="Mother · 6 months in" paper/>
      </div>
    </div>
  );
}

// ── SCENE 2: comparison page (dark) ───────────────────────────────────────
function ScenePage2() {
  const { localTime } = useSprite();
  const t0 = clamp01(localTime / 0.5);
  const t1 = clamp01((localTime - 0.6) / 0.4);
  const t2 = clamp01((localTime - 1.0) / 0.4);
  const t3 = clamp01((localTime - 1.4) / 0.4);
  const t4 = clamp01((localTime - 2.2) / 0.5);
  const t5 = clamp01((localTime - 4.5) / 0.6);
  const cards = [
    { tag: 'Facility 01', word: 'Speed', t: t1 },
    { tag: 'Facility 02', word: 'Strength', t: t2 },
    { tag: 'Facility 03', word: 'Confidence', t: t3 },
  ];
  return (
    <div style={{ position: 'absolute', inset: 0, padding: '140px 56px 100px' }}>
      <PageChrome pageNum={2} total={4} sectionLabel="02 · The Sales Pitch"/>

      <div style={{ opacity: t0 }}>
        <Eyebrow>What everyone said</Eyebrow>
      </div>

      <div style={{
        marginTop: 22, opacity: t0,
        fontFamily: FONT_DISP, fontSize: 96, lineHeight: 0.92,
        color: WHITE, textTransform: 'uppercase', letterSpacing: '-0.005em',
      }}>
        They all said<br/>
        the <span style={{ color: WHITE }}>same things.</span>
      </div>

      {/* Three faded cards */}
      <div style={{
        marginTop: 56,
        display: 'grid', gridTemplateColumns: '1fr', gap: 16,
      }}>
        {cards.map((c, i) => (
          <div key={i} style={{
            opacity: c.t,
            transform: `translateY(${(1 - c.t) * 24}px)`,
            border: `1px solid ${INK_700}`,
            background: INK_900,
            padding: '22px 28px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <div>
              <div style={{
                fontFamily: FONT_MONO, fontSize: 16, letterSpacing: '0.18em',
                color: WHITE, textTransform: 'uppercase',
                marginBottom: 8, fontWeight: 700,
              }}>{c.tag}</div>
              <div style={{
                fontFamily: FONT_DISP, fontSize: 76, lineHeight: 1,
                color: WHITE, textTransform: 'uppercase',
                letterSpacing: '-0.005em',
              }}>{c.word}.</div>
            </div>
            <div style={{
              fontFamily: FONT_MONO, fontSize: 13, letterSpacing: '0.18em',
              color: RED_BRIGHT, textTransform: 'uppercase', fontWeight: 700,
            }}>same pitch</div>
          </div>
        ))}
      </div>

      <div style={{
        marginTop: 56, opacity: t4, transform: `translateY(${(1-t4)*20}px)`,
      }}>
        <PullQuote size={144} lineHeight={0.86}>
          Nobody else<br/>
          showed us<br/>
          <span style={{ color: RED_BRIGHT }}>a number.</span>
        </PullQuote>
      </div>

      <div style={{
        position: 'absolute', left: 56, right: 56, bottom: 128,
        opacity: t5,
        fontFamily: FONT_MONO, fontSize: 26, letterSpacing: '0.04em',
        color: WHITE, textTransform: 'uppercase', fontWeight: 700,
        borderTop: `1px solid ${INK_700}`, paddingTop: 18,
      }}>
        {">"} They just told us to <span style={{ color: RED_BRIGHT }}>trust them.</span>
      </div>
    </div>
  );
}

const INK_700 = "#2c3038";

// ── SCENE 3: athlete page (paper) ─────────────────────────────────────────
function ScenePage3() {
  const tw = useTweakC();
  const { localTime } = useSprite();
  const t1 = clamp01(localTime / 0.5);
  const t2 = clamp01((localTime - 0.5) / 0.55);
  const t3 = clamp01((localTime - 1.4) / 0.55);
  const t4 = clamp01((localTime - 2.4) / 0.5);
  return (
    <div style={{ position: 'absolute', inset: 0, padding: '140px 56px 100px' }}>
      <PageChrome pageNum={3} total={4} sectionLabel="03 · The Athlete" paper/>

      <div style={{ opacity: t1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Eyebrow paper>Her son, {tw.athleteName.split(' ')[0]} · Age {tw.athleteAge}</Eyebrow>
      </div>

      <div style={{ marginTop: 32, opacity: t2, transform: `translateY(${(1-t2)*22}px)` }}>
        <PullQuote paper size={156} lineHeight={0.88}>
          "I'd never<br/>
          been told<br/>
          <span style={{ color: RED }}>to stop</span><br/>
          before."
        </PullQuote>
      </div>

      <div style={{
        marginTop: 36, opacity: t3, transform: `translateY(${(1-t3)*18}px)`,
      }}>
        <Figure src="assets/jump-mid-air.jpg"
          label="Fig. 02" caption={`${tw.athleteName.split(' ')[0]} · Plyo Block`}
          paper height={460}/>
      </div>

      <div style={{
        position: 'absolute', left: 56, right: 56, bottom: 130,
        opacity: t4, transform: `translateY(${(1-t4)*10}px)`,
      }}>
        <Byline name={tw.athleteName} meta="Athlete · 6 months in" paper/>
      </div>
    </div>
  );
}

// ── SCENE 4: the number reveal (dark) ─────────────────────────────────────
function ScenePage4() {
  const tw = useTweakC();
  const { localTime } = useSprite();
  const t1 = clamp01(localTime / 0.45);
  const t2 = clamp01((localTime - 0.5) / 0.45);
  const t3 = clamp01((localTime - 1.0) / 0.5);
  const t4 = clamp01((localTime - 1.7) / 0.7);
  // Count down the improvement
  const finalT = clamp01((localTime - 1.7) / 1.4);
  const countVal = finalT < 1 ? (0.00 + tw.splitImprovement * finalT) : tw.splitImprovement;
  return (
    <div style={{ position: 'absolute', inset: 0, padding: '140px 56px 100px' }}>
      <PageChrome pageNum={4} total={4} sectionLabel="04 · The Result"
        accent={RED_BRIGHT}/>

      <div style={{ opacity: t1, marginTop: 24 }}>
        <Eyebrow>What changed</Eyebrow>
      </div>

      <div style={{
        marginTop: 36, opacity: t2,
        fontFamily: FONT_DISP, fontSize: 96, lineHeight: 0.92,
        color: WHITE, textTransform: 'uppercase', letterSpacing: '-0.005em',
      }}>
        By month two.
      </div>

      <div style={{
        marginTop: 14, opacity: t3,
        fontFamily: FONT_DISP, fontSize: 56, lineHeight: 1,
        color: WHITE, textTransform: 'uppercase', letterSpacing: '-0.005em',
      }}>
        10-yard split, <span style={{ color: RED_BRIGHT }}>down</span>
      </div>

      {/* HUGE number */}
      <div style={{
        position: 'absolute', left: 0, right: 0,
        top: 720,
        opacity: t4,
        textAlign: 'center',
      }}>
        <div style={{
          fontFamily: FONT_MONO, fontSize: 480,
          fontWeight: 700, lineHeight: 0.88,
          color: RED, fontVariantNumeric: 'tabular-nums',
          letterSpacing: '-0.05em',
          textShadow: '0 0 80px rgba(196,20,29,0.4)',
        }}>
          −{countVal.toFixed(2)}<span style={{ fontSize: 200 }}>s</span>
        </div>
        <div style={{
          marginTop: 32,
          fontFamily: FONT_MONO, fontSize: 28,
          letterSpacing: '0.18em', textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.7)', fontWeight: 600,
        }}>
          Faster · Measured · Repeatable
        </div>
      </div>

      <div style={{
        position: 'absolute', left: 56, right: 56, bottom: 130,
        opacity: clamp01((localTime - 3.0) / 0.5),
        fontFamily: FONT_MONO, fontSize: 22, letterSpacing: '0.16em',
        color: WHITE, textTransform: 'uppercase', fontWeight: 700,
        textAlign: 'center',
        borderTop: `1px solid ${INK_700}`, paddingTop: 20,
      }}>
        {">"} 10-yard baseline <span style={{ color: 'rgba(255,255,255,0.75)' }}>1.57s</span> → <span style={{ color: RED_BRIGHT }}>{(1.57 - tw.splitImprovement).toFixed(2)}s</span>
      </div>
    </div>
  );
}

// ── SCENE 5: parent closes (paper) ────────────────────────────────────────
function ScenePage5() {
  const tw = useTweakC();
  const { localTime } = useSprite();
  const t1 = clamp01(localTime / 0.55);
  const t2 = clamp01((localTime - 0.7) / 0.55);
  return (
    <div style={{ position: 'absolute', inset: 0, padding: '140px 56px 100px' }}>
      <PageChrome pageNum={'∞'} total={4} sectionLabel="Closing · The Parent" paper/>

      <div style={{ opacity: t1, marginTop: 8 }}>
        <Eyebrow paper>Six months in</Eyebrow>
      </div>

      <div style={{
        marginTop: 56, opacity: t1, transform: `translateY(${(1-t1)*20}px)`,
      }}>
        <PullQuote paper size={172} lineHeight={0.85}>
          "We don't<br/>
          <span style={{ color: RED }}>compare</span><br/>
          facilities<br/>
          anymore."
        </PullQuote>
      </div>

      <div style={{
        marginTop: 48, opacity: t2, transform: `translateY(${(1-t2)*16}px)`,
        fontFamily: FONT_DISP, fontSize: 80, lineHeight: 0.92,
        color: PAPER_INK, textTransform: 'uppercase', letterSpacing: '-0.005em',
        borderTop: `2px solid ${PAPER_RULE}`, paddingTop: 36,
        maxWidth: 760,
      }}>
        We just<br/>
        <span style={{ color: RED }}>train here.</span>
      </div>

      <div style={{
        position: 'absolute', left: 56, right: 56, bottom: 130,
        opacity: t2,
      }}>
        <Byline name={tw.parentName} meta="Closing remark" paper/>
      </div>
    </div>
  );
}

// ── End card ──────────────────────────────────────────────────────────────
function EndCardC({ start, end }) {
  return (
    <Sprite start={start} end={end}>
      <EndCardCInner/>
    </Sprite>
  );
}
function EndCardCInner() {
  const tw = useTweakC();
  const parts = tw.tagline.split(/\.\s+/);
  const line1 = (parts[0] || 'Train fast') + (tw.tagline.includes('.') ? '.' : '');
  const line2 = parts.length > 1 ? (parts.slice(1).join('. ').replace(/\.$/, '') + '.') : '';
  const { localTime } = useSprite();
  const t1 = clamp01(localTime / 0.45);
  const t2 = clamp01((localTime - 0.6) / 0.45);
  const t3 = clamp01((localTime - 1.3) / 0.4);
  const t4 = clamp01((localTime - 1.9) / 0.5);
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 12,
      background: INK_950,
      display: 'flex', flexDirection: 'column', justifyContent: 'center',
      alignItems: 'center', padding: '0 56px',
    }}>
      <div style={{ opacity: t1, transform: `translateY(${(1-t1)*16}px)`, textAlign: 'center' }}>
        <img src="assets/logo.png" alt="" style={{ height: 220, width: 'auto' }}/>
        <div style={{
          marginTop: 22,
          fontFamily: FONT_MONO, fontSize: 22, letterSpacing: '0.24em',
          color: RED_BRIGHT, textTransform: 'uppercase', fontWeight: 600,
        }}>The Velocity Code</div>
      </div>

      <div style={{
        marginTop: 56, opacity: t2,
        fontFamily: FONT_DISP, fontSize: line1.length > 14 ? 110 : 144, lineHeight: 0.88,
        color: WHITE, textTransform: 'uppercase', letterSpacing: '-0.01em',
        textAlign: 'center',
      }}>
        {line1}{line2 && (<React.Fragment><br/><span style={{ color: RED }}>{line2}</span></React.Fragment>)}
      </div>

      <div style={{
        marginTop: 44, opacity: t3,
        padding: '22px 32px', background: RED,
        fontFamily: FONT_DISP, fontSize: 80, color: WHITE,
        textTransform: 'uppercase', textAlign: 'center', lineHeight: 1,
        boxShadow: '0 12px 32px rgba(196,20,29,0.4)',
      }}>
        Get Faster<br/>Today
      </div>

      <div style={{
        marginTop: 40, opacity: t4,
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
        width: '100%', maxWidth: 880,
        border: `1px solid ${INK_700}`,
      }}>
        {[
          { v: '+1', u: 'mph speed' },
          { v: '+3"', u: 'vertical' },
          { v: '90', u: 'days · or free' },
        ].map((d, i) => (
          <div key={i} style={{
            padding: '18px 14px', textAlign: 'center',
            borderRight: i < 2 ? `1px solid ${INK_700}` : 'none',
          }}>
            <div style={{
              fontFamily: FONT_MONO, fontSize: 52, fontWeight: 700,
              color: WHITE, fontVariantNumeric: 'tabular-nums',
              letterSpacing: '-0.02em',
            }}>{d.v}</div>
            <div style={{
              fontFamily: FONT_MONO, fontSize: 13, letterSpacing: '0.14em',
              color: 'rgba(255,255,255,0.88)', textTransform: 'uppercase',
              marginTop: 6, fontWeight: 600,
            }}>{d.u}</div>
          </div>
        ))}
      </div>
      {/* Locations — solid red band, white text */}
      <div style={{
        position: 'absolute', bottom: 56, left: 28, right: 28, textAlign: 'center',
        opacity: t4,
      }}>
        <div style={{
          fontFamily: FONT_MONO, fontSize: 22, letterSpacing: '0.2em',
          color: RED_BRIGHT, textTransform: 'uppercase', fontWeight: 700,
          marginBottom: 14,
        }}>athletesaccel.com</div>
        <div style={{
          display: 'inline-block',
          padding: '14px 24px',
          background: RED,
          fontFamily: FONT_MONO, fontSize: 18, letterSpacing: '0.22em',
          color: WHITE, textTransform: 'uppercase', fontWeight: 700,
        }}>
          Noblesville · Carmel · Westfield · Indianapolis · Milford
        </div>
      </div>
    </div>
  );
}

// ── ROOT TIMELINE ─────────────────────────────────────────────────────────
function CreativeC() {
  return (
    <React.Fragment>
      {/* Bg base */}
      <div style={{ position: 'absolute', inset: 0, background: INK_950 }}/>

      <Page start={0.0} end={7.0} paper><ScenePage1/></Page>
      <Page start={7.0} end={19.0}><ScenePage2/></Page>
      <Page start={19.0} end={30.0} paper><ScenePage3/></Page>
      <Page start={30.0} end={39.0}><ScenePage4/></Page>
      <Page start={39.0} end={45.0} paper><ScenePage5/></Page>
      <EndCardC start={45.0} end={DUR}/>

      <ScreenLabel/>
    </React.Fragment>
  );
}

function ScreenLabel() {
  const t = useTime();
  React.useEffect(() => {
    const sec = Math.floor(t);
    const root = document.querySelector('[data-vid-root]');
    if (root) root.setAttribute('data-screen-label', `creative-c · t=${sec}s`);
  }, [Math.floor(t)]);
  return null;
}

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS_C);
  return (
    <TweakCtxC.Provider value={t}>
      <div data-vid-root="C" style={{ position: 'absolute', inset: 0 }}>
        <Stage width={W} height={H} duration={DUR} background={INK_950} persistKey="creative-c">
          <CreativeC/>
          <MusicSync src="audio/bora-instrumental.mp3" startAt={0.00} volume={0.65} fadeIn={1.5} fadeOut={2.0}/>
        </Stage>
      </div>
      <TweaksPanel title="Creative C · Tweaks">
        <TweakSection label="Visual treatment"/>
        <TweakRadio label="Variant"
          value={t.variant}
          options={['editorial', 'banner']}
          onChange={(v) => setTweak('variant', v)}/>
        <TweakToggle label="Show page chrome"
          value={t.showPageChrome}
          onChange={(v) => setTweak('showPageChrome', v)}/>
        <TweakSection label="Cast"/>
        <TweakText label="Parent name"
          value={t.parentName}
          onChange={(v) => setTweak('parentName', v)}/>
        <TweakText label="Athlete name"
          value={t.athleteName}
          onChange={(v) => setTweak('athleteName', v)}/>
        <TweakNumber label="Athlete age"
          value={t.athleteAge}
          min={8} max={18} step={1}
          onChange={(v) => setTweak('athleteAge', v)}/>
        <TweakSection label="Result"/>
        <TweakSlider label="10-yd split improvement"
          value={t.splitImprovement}
          min={0.05} max={0.30} step={0.01}
          unit="s"
          onChange={(v) => setTweak('splitImprovement', v)}/>
        <TweakSection label="Copy"/>
        <TweakText label="Closing tagline"
          value={t.tagline}
          onChange={(v) => setTweak('tagline', v)}/>
      </TweaksPanel>
    </TweakCtxC.Provider>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
