// ============================================================================
//  FULL-ARC VALIDATION — A→F in one 30s vertical video (1080×1920)
// ============================================================================
//  Spike: proves the playbook's "all 6 beats = video only, sequenced over time"
//  claim, authored VERTICAL-NATIVE (fills the frame, no square-template void).
//  Claude Design <Stage> + useTime. Solid-ink bg + bold AA typography so the
//  message is carried entirely in burned-in captions (85% watch muted).
// ============================================================================

const RED = '#c4141d';
const INK = '#0a0b0d';
const GREY = '#969ca7';
const DISPLAY = 'Anton, sans-serif';
const MONO = '"JetBrains Mono", monospace';

// Font preflight markers (renderer scans this file for literal fontFamily).
const _FONT_PREFLIGHT = {
  display: { fontFamily: 'Anton, sans-serif' },
  mono: { fontFamily: '"JetBrains Mono", monospace' },
};

// Fade window: 0→1 over `f`s after `a`, hold, 1→0 over `f`s before `b`.
function win(t, a, b, f) {
  f = f || 0.45;
  if (t <= a || t >= b) return 0;
  return Math.max(0, Math.min(1, Math.min((t - a) / f, (b - t) / f)));
}
// Rise: translateY that settles as the scene fades in.
function rise(show) { return `translateY(${(1 - show) * 28}px)`; }

function Beat({ show, label, time }) {
  return (
    <div style={{
      position: 'absolute', top: 120, left: 90, right: 90,
      fontFamily: MONO, fontSize: 28, color: RED, letterSpacing: '0.18em',
      textTransform: 'uppercase', opacity: show, whiteSpace: 'nowrap',
    }}>// {time} · {label}</div>
  );
}

function Scene({ show, children, justify }) {
  return (
    <div style={{
      position: 'absolute', inset: 0,
      display: 'flex', flexDirection: 'column',
      justifyContent: justify || 'center', alignItems: 'flex-start',
      padding: '0 90px', opacity: show,
    }}>{children}</div>
  );
}

function ArcContent() {
  const t = useTime();

  const hook = win(t, 0.2, 5.2);
  const blame = win(t, 5.2, 10.2);
  const mech = win(t, 10.2, 15.2);
  const proof = win(t, 15.2, 23.2);
  const offer = win(t, 23.2, 30.5);
  const cta = win(t, 27.4, 30);

  // count-ups for the proof stats
  const c1 = (Math.max(0, Math.min(1, (t - 16) / 1.2)) * 4.2).toFixed(1);
  const c2 = (Math.max(0, Math.min(1, (t - 16.6) / 1.2)) * 0.4).toFixed(1);
  const prog = Math.max(0, Math.min(1, t / 30));

  return (
    <React.Fragment>
      {/* soft red glow corner, persistent */}
      <div style={{ position: 'absolute', top: -220, right: -220, width: 640, height: 640,
        background: `radial-gradient(circle, ${RED}22 0%, transparent 60%)`, filter: 'blur(20px)' }} />

      {/* A — HOOK */}
      <Beat show={hook} time="0:00" label="Stop the scroll" />
      <Scene show={hook}>
        <div style={{ fontFamily: DISPLAY, color: '#fff', fontSize: 132, lineHeight: 0.97,
          textTransform: 'uppercase', transform: rise(hook) }}>
          STILL TRAINING<br />HARD — BUT NOT<br /><span style={{ color: RED }}>GETTING FASTER?</span>
        </div>
      </Scene>

      {/* D — REMOVE BLAME (the signature) */}
      <Beat show={blame} time="0:05" label="Remove the blame" />
      <Scene show={blame}>
        <div style={{ fontFamily: DISPLAY, color: '#fff', fontSize: 124, lineHeight: 0.98,
          textTransform: 'uppercase', transform: rise(blame) }}>
          YOUR ATHLETE<br />ISN'T THE PROBLEM.<br /><span style={{ color: RED }}>THE PLAN WAS.</span>
        </div>
      </Scene>

      {/* C — MECHANISM */}
      <Beat show={mech} time="0:10" label="Reveal the mechanism" />
      <Scene show={mech}>
        <div style={{ fontFamily: DISPLAY, color: '#fff', fontSize: 116, lineHeight: 0.99,
          textTransform: 'uppercase', transform: rise(mech) }}>
          IT'S NOT MORE REPS.<br />IT'S THE RIGHT ONES —<br /><span style={{ color: RED }}>MEASURED.</span>
        </div>
        <div style={{ fontFamily: MONO, color: GREY, fontSize: 34, marginTop: 40,
          letterSpacing: '0.06em', textTransform: 'uppercase' }}>EVERY REP TRACKED · 90-DAY DATA</div>
      </Scene>

      {/* E — PROOF */}
      <Beat show={proof} time="0:15" label="Prove it" />
      <Scene show={proof}>
        <div style={{ display: 'flex', gap: 60, transform: rise(proof) }}>
          <div>
            <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 150, color: '#fff', lineHeight: 0.85, letterSpacing: '-0.03em' }}>
              <span style={{ color: RED }}>+</span>{c1}<span style={{ fontSize: 64, color: GREY }}>"</span>
            </div>
            <div style={{ fontFamily: DISPLAY, fontSize: 44, color: '#fff', marginTop: 10 }}>VERTICAL</div>
          </div>
          <div>
            <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 150, color: '#fff', lineHeight: 0.85, letterSpacing: '-0.03em' }}>
              <span style={{ color: RED }}>−</span>{c2}<span style={{ fontSize: 64, color: GREY }}>s</span>
            </div>
            <div style={{ fontFamily: DISPLAY, fontSize: 44, color: '#fff', marginTop: 10 }}>40-YARD</div>
          </div>
        </div>
        <div style={{ fontFamily: DISPLAY, color: '#fff', fontSize: 60, lineHeight: 1.05, marginTop: 70, transform: rise(proof) }}>
          "MY SON FINALLY BEAT HIS<br />TEAMMATE OFF THE LINE."
        </div>
        <div style={{ fontFamily: MONO, color: GREY, fontSize: 30, marginTop: 28, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          — SARAH M. · PARENT · U14
        </div>
      </Scene>

      {/* F — OFFER + GUARANTEE */}
      <Beat show={offer} time="0:23" label="The offer" />
      <Scene show={offer}>
        <div style={{ fontFamily: DISPLAY, color: '#fff', fontSize: 132, lineHeight: 0.96,
          textTransform: 'uppercase', transform: rise(offer) }}>
          BOOK A FREE<br />ASSESSMENT.
        </div>
        <div style={{ fontFamily: DISPLAY, color: '#fff', fontSize: 50, lineHeight: 1.12, marginTop: 50, transform: rise(offer) }}>
          +1 MPH SPEED. +3" VERTICAL.<br />90 DAYS. <span style={{ color: RED }}>OR YOUR TRAINING IS ON US.</span>
        </div>
      </Scene>

      {/* CTA banner — bottom, last beat */}
      <div style={{
        position: 'absolute', bottom: 90, left: 60, right: 60, padding: '34px 44px',
        background: RED, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        opacity: cta, transform: `translateY(${(1 - cta) * 30}px)`,
      }}>
        <div style={{ fontFamily: DISPLAY, fontSize: 60, color: '#fff', whiteSpace: 'nowrap' }}>CLAIM YOUR SPOT</div>
        <div style={{ width: 76, height: 76, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: DISPLAY, fontSize: 56, color: RED }}>→</div>
      </div>

      {/* persistent brand + progress bar */}
      <div style={{ position: 'absolute', bottom: 30, left: 90, fontFamily: MONO, fontSize: 24, color: GREY, letterSpacing: '0.14em' }}>ATHLETES ACCELERATION</div>
      <div style={{ position: 'absolute', bottom: 0, left: 0, height: 8, width: `${prog * 100}%`, background: RED }} />
    </React.Fragment>
  );
}

function FullArcReel() {
  return (
    <Stage width={1080} height={1920} duration={30} fps={30} background={INK}>
      <ArcContent />
    </Stage>
  );
}

window.FullArcReel = FullArcReel;
