// FRESH-ENGINE-TRANSFER-NOBLESVILLE-C1 — AA "anatomy-diagram" graphic (beat C). NO bg photo.
// Built from scratch on the Athletes Acceleration design system, guided by example
// ex-121-anatomy-diagram. THE CONCEPT: literally diagram "the engine under every sport" —
// a simple athlete figure rendered in INK, with a glowing red ENGINE CORE pulsing at the
// hips/core, FORCE arrows firing outward, and mono callout labels (FORCE / SPEED / POWER)
// easing in one by one. The claim is the dominant Anton headline owning the lower third.
// useTime() INSIDE the body; every text node colored + TplText-wrapped. AA rails exactly.
// Vertical-native 1080x1920. Graphic/data-viz archetype → photo-free (no bgClip).

function FreshEngineTransferNoblesvilleC1Reel({ data = {} }) {
  const eyebrow = data.eyebrow ?? 'NOBLESVILLE SPORT PARENTS';
  const claim = data.claim ?? 'SPEED AND POWER ARE THE ENGINE. EVERY SPORT SKILL RUNS ON IT.';
  const brand = data.brand ?? 'ATHLETES ACCELERATION';

  const RED = (window.__BRAND__ && window.__BRAND__.brand_red || '#c4141d');
  const RED_DEEP = (window.__BRAND__ && window.__BRAND__.brand_red_deep || '#a30f17');
  const INK = '#0a0b0d';
  const PANEL = '#15171a';
  const FIG = '#1b1c22';

  const t = useTime();
  const clamp = (x) => Math.max(0, Math.min(1, x));
  const ease = (x) => Easing.easeOutCubic(clamp(x));

  // timeline — figure draws, core ignites, three force arrows + labels fire in sequence
  const inEyebrow = ease((t - 0.10) / 0.30);
  const inFig = ease((t - 0.35) / 0.55);
  const inCore = ease((t - 0.85) / 0.45);
  const inForce = ease((t - 1.25) / 0.50);   // top-right: FORCE
  const inSpeed = ease((t - 1.60) / 0.50);   // lower-left: SPEED
  const inPower = ease((t - 1.95) / 0.50);   // lower-right: POWER
  const inClaim = ease((t - 2.35) / 0.70);
  const rise = (1 - inClaim) * 48;

  // steady engine pulse for the glowing core (only after it ignites)
  const pulse = (0.55 + 0.45 * (0.5 + 0.5 * Math.sin(t * 4))) * inCore;

  // arrow geometry (drawn from the core outward)
  const arrow = (len, drawn) => len * (1 - drawn);

  return (
    <div style={{ position: 'absolute', inset: 0, background: INK, overflow: 'hidden' }}>
      {/* faint raised panel behind the diagram to seat it */}
      <div style={{ position: 'absolute', left: 64, right: 64, top: 300, height: 980,
        background: PANEL, borderRadius: 28, opacity: 0.55 * inFig }} />

      {/* mono eyebrow chip, top-center */}
      <div style={{ position: 'absolute', top: 132, left: 96, right: 96, textAlign: 'center', opacity: inEyebrow }}>
        <TplText field="eyebrow" data={data} base={{}}
          style={{ display: 'inline-block', color: '#ffffff', fontFamily: '"JetBrains Mono", ui-monospace, monospace',
            fontWeight: 700, fontSize: 30, letterSpacing: '0.22em', textTransform: 'uppercase' }}
        >{eyebrow}</TplText>
        <div style={{ width: 84, height: 6, background: RED, margin: '16px auto 0' }} />
      </div>

      {/* the engine-under-every-sport diagram */}
      <svg viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        {/* athlete figure in ink (head, torso, legs) — draws in */}
        <g opacity={inFig}>
          <circle cx="540" cy="470" r="58" fill={FIG} />
          <rect x="476" y="540" width="128" height="300" rx="40" fill={FIG} />
          <rect x="492" y="838" width="46" height="360" rx="23" fill={FIG} />
          <rect x="542" y="838" width="46" height="360" rx="23" fill={FIG} />
        </g>

        {/* glowing engine core at the hips/center of mass — ignites + pulses */}
        <ellipse cx="540" cy="800" rx="96" ry="118" fill={RED} opacity={0.30 * pulse} />
        <ellipse cx="540" cy="800" rx="60" ry="76" fill={RED} opacity={0.85 * inCore} />
        <ellipse cx="540" cy="800" rx="26" ry="32" fill="#ffffff" opacity={0.85 * pulse} />

        {/* FORCE arrow — up-right */}
        <g opacity={inForce}>
          <line x1="600" y1="760" x2="838" y2="612" stroke={RED} strokeWidth="6"
            strokeLinecap="round" strokeDasharray="280" strokeDashoffset={arrow(280, inForce)} />
          <polygon points="838,612 808,612 832,640" fill={RED} opacity={inForce} />
          <circle cx="600" cy="760" r="10" fill={RED} />
        </g>

        {/* SPEED arrow — down-left */}
        <g opacity={inSpeed}>
          <line x1="486" y1="840" x2="242" y2="1010" stroke={RED} strokeWidth="6"
            strokeLinecap="round" strokeDasharray="296" strokeDashoffset={arrow(296, inSpeed)} />
          <polygon points="242,1010 272,1010 250,982" fill={RED} opacity={inSpeed} />
          <circle cx="486" cy="840" r="10" fill={RED} />
        </g>

        {/* POWER arrow — down-right */}
        <g opacity={inPower}>
          <line x1="594" y1="840" x2="838" y2="1010" stroke={RED} strokeWidth="6"
            strokeLinecap="round" strokeDasharray="296" strokeDashoffset={arrow(296, inPower)} />
          <polygon points="838,1010 808,1010 830,982" fill={RED} opacity={inPower} />
          <circle cx="594" cy="840" r="10" fill={RED} />
        </g>
      </svg>

      {/* mono callout labels — fire in with their arrows */}
      <div style={{ position: 'absolute', left: 856, top: 588, opacity: inForce,
        color: '#ffffff', fontFamily: '"JetBrains Mono", ui-monospace, monospace',
        fontWeight: 700, fontSize: 30, letterSpacing: '0.18em', textTransform: 'uppercase' }}>FORCE</div>
      <div style={{ position: 'absolute', left: 96, top: 1000, opacity: inSpeed,
        color: '#ffffff', fontFamily: '"JetBrains Mono", ui-monospace, monospace',
        fontWeight: 700, fontSize: 30, letterSpacing: '0.18em', textTransform: 'uppercase' }}>SPEED</div>
      <div style={{ position: 'absolute', left: 856, top: 1000, opacity: inPower,
        color: '#ffffff', fontFamily: '"JetBrains Mono", ui-monospace, monospace',
        fontWeight: 700, fontSize: 30, letterSpacing: '0.18em', textTransform: 'uppercase' }}>POWER</div>

      {/* core label — small mono tag under the glowing core */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 936, textAlign: 'center', opacity: inCore,
        color: RED, fontFamily: '"JetBrains Mono", ui-monospace, monospace',
        fontWeight: 700, fontSize: 26, letterSpacing: '0.20em', textTransform: 'uppercase' }}>THE ENGINE</div>

      {/* dominant claim headline, lower third */}
      <TplText field="claim" data={data}
        base={{ position: 'absolute', left: 96, right: 84, bottom: 286 }}
        style={{ fontFamily: '"Anton", "Oswald", sans-serif', fontWeight: 400, fontSize: 116, color: '#ffffff',
          lineHeight: 0.90, letterSpacing: '0.004em', textTransform: 'uppercase',
          textShadow: '0 4px 22px rgba(0,0,0,0.65)', opacity: inClaim, transform: `translateY(${rise}px)` }}
        maxHeight={720} fitKey={claim}
      >{claim}</TplText>

      {/* short red rule above the wordmark */}
      <div style={{ position: 'absolute', left: 96, bottom: 152, width: 84, height: 6, background: RED_DEEP, opacity: inClaim }} />

      {/* wordmark, bottom-left */}
      <TplText field="brand" data={data}
        base={{ position: 'absolute', bottom: 96, left: 96, right: 96 }}
        style={{ fontFamily: '"Geist", "Inter", sans-serif', fontWeight: 600, fontSize: 30, color: '#ffffff',
          letterSpacing: '0.2em', textTransform: 'uppercase', opacity: 0.9 }}
      >{brand}</TplText>
    </div>
  );
}

window.FreshEngineTransferNoblesvilleC1Reel = FreshEngineTransferNoblesvilleC1Reel;

const FRESH_ENGINE_TRANSFER_NOBLESVILLE_C1_SPEC = {
  id: 'fresh-engine-transfer-noblesville-C1',
  name: 'ENGINE-TRANSFER C1 — ANATOMY DIAGRAM',
  fields: [
    { "key": "duration", "label": "Length", "type": "slider", "default": 6, "min": 4, "max": 10, "step": 0.5, "unit": "s" },
    { "key": "eyebrow", "role": "eyebrow", "label": "Eyebrow", "type": "text", "default": "NOBLESVILLE SPORT PARENTS" },
    { "key": "claim", "role": "claim", "label": "Claim", "type": "text", "default": "SPEED AND POWER ARE THE ENGINE. EVERY SPORT SKILL RUNS ON IT." },
    { "key": "brand", "role": "brand", "label": "Brand", "type": "text", "default": "ATHLETES ACCELERATION" }
  ],
};
window.FRESH_ENGINE_TRANSFER_NOBLESVILLE_C1_SPEC = FRESH_ENGINE_TRANSFER_NOBLESVILLE_C1_SPEC;
