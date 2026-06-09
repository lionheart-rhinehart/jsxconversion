// FRESH-ENGINE-TRANSFER-NOBLESVILLE-D3 — AA "kinetic-text" reframe (beat D, NO bg photo).
// Built from scratch on the Athletes Acceleration design system, guided by example
// ex-050-kinetic-text (a 3-line stacked word-reveal). This sibling is deliberately DIFFERENT:
// a two-line "X / Y" emphasis on a deep INK field. Line 1 ("THE MECHANICS WERE NEVER THE
// PROBLEM.") types in clean, then a red rule strikes THROUGH it left-to-right — the
// pattern-interrupt — and Line 2 ("THE ENGINE WAS.") slams in on its own red plate as the
// dominant element. useTime() drives the whole reveal from inside the body. Graphic/data-viz
// archetype → photo-free by rule. Vertical-native 1080x1920. All copy via data.* roles.

function FreshEngineTransferNoblesvilleD3Reel({ data = {} }) {
  const eyebrow = data.eyebrow ?? 'NOBLESVILLE SPORT PARENTS';
  const claim = data.claim ?? 'THE MECHANICS WERE NEVER THE PROBLEM. THE ENGINE WAS.';
  const brand = data.brand ?? 'ATHLETES ACCELERATION';

  const RED = (window.__BRAND__ && window.__BRAND__.brand_red || '#c4141d');
  const INK = '#0a0b0d';
  const PANEL = '#15171a';

  // Split the claim into a setup line + a punch line at the last sentence break.
  // "... PROBLEM. THE ENGINE WAS." -> setup = "THE MECHANICS WERE NEVER THE PROBLEM.",
  // punch = "THE ENGINE WAS." Falls back gracefully for any role-injected copy.
  const splitClaim = (s) => {
    const m = String(s).trim().match(/^(.*[.!?])\s+(\S.*)$/);
    if (m) return [m[1].trim(), m[2].trim()];
    const words = String(s).trim().split(/\s+/);
    if (words.length > 3) {
      const cut = Math.ceil(words.length / 2);
      return [words.slice(0, cut).join(' '), words.slice(cut).join(' ')];
    }
    return [String(s).trim(), ''];
  };
  const [setupLine, punchLine] = splitClaim(claim);

  const t = useTime();
  const clamp = (x) => Math.max(0, Math.min(1, x));
  const ce = (start, dur = 0.5) => Easing.easeOutCubic(clamp((t - start) / dur, 0, 1));

  const inEyebrow = ce(0.10, 0.30);
  const inSetup = ce(0.45, 0.55);   // setup line fades + rises in
  const strike = ce(1.35, 0.45);    // red rule strikes THROUGH the setup line
  const dimSetup = ce(1.55, 0.40);  // setup dims once struck
  const inPunch = ce(1.95, 0.40);   // punch plate slams in
  const inBrand = ce(2.55, 0.40);

  const setupRise = (1 - inSetup) * 30;
  const punchRise = (1 - inPunch) * 40;
  const punchScale = 0.92 + 0.08 * inPunch;
  const setupOpacity = inSetup * (1 - 0.55 * dimSetup);

  return (
    <div style={{ position: 'absolute', inset: 0, background: INK, overflow: 'hidden' }}>
      {/* subtle raised vignette panel so the type field reads as a deliberate stage */}
      <div style={{ position: 'absolute', inset: 0,
        background: 'radial-gradient(120% 90% at 50% 42%, ' + PANEL + ' 0%, ' + INK + ' 70%)' }} />

      {/* top red rule + mono eyebrow chip */}
      <div style={{ position: 'absolute', top: 150, left: 96, right: 96, opacity: inEyebrow }}>
        <div style={{ width: 84, height: 6, background: RED, marginBottom: 22,
          transform: `scaleX(${inEyebrow})`, transformOrigin: 'left' }} />
        <TplText field="eyebrow" data={data} base={{}}
          style={{ display: 'block', color: '#ffffff', fontFamily: '"JetBrains Mono", ui-monospace, monospace',
            fontWeight: 700, fontSize: 30, letterSpacing: '0.22em', textTransform: 'uppercase' }}
        >{eyebrow}</TplText>
      </div>

      {/* SETUP line — types/rises in, then a red rule strikes through it */}
      <div style={{ position: 'absolute', left: 96, right: 96, top: 560 }}>
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <TplText field="claim" data={data}
            base={{}}
            style={{ display: 'block', fontFamily: '"Anton", "Oswald", sans-serif', fontWeight: 400,
              fontSize: 92, color: '#ffffff', lineHeight: 0.94, letterSpacing: '0.004em',
              textTransform: 'uppercase', opacity: setupOpacity, transform: `translateY(${setupRise}px)` }}
            maxHeight={420} fitKey={setupLine}
          >{setupLine}</TplText>
          {/* the strike-through rule */}
          <div style={{ position: 'absolute', left: 0, top: '46%', height: 10, background: RED,
            width: `${strike * 100}%`, maxWidth: '100%', boxShadow: '0 2px 14px rgba(196,20,29,0.55)' }} />
        </div>
      </div>

      {/* PUNCH line — dominant element, slams onto its own red plate */}
      <div style={{ position: 'absolute', left: 96, right: 96, top: 1040,
        opacity: inPunch, transform: `translateY(${punchRise}px) scale(${punchScale})`,
        transformOrigin: 'left center' }}>
        <TplText field="claim" data={data}
          base={{ display: 'inline-block', background: RED, padding: '14px 30px' }}
          style={{ fontFamily: '"Anton", "Oswald", sans-serif', fontWeight: 400, fontSize: 150,
            color: '#0a0b0d', lineHeight: 0.9, letterSpacing: '0.006em', textTransform: 'uppercase',
            textShadow: '0 3px 18px rgba(0,0,0,0.35)' }}
          maxHeight={620} fitKey={punchLine}
        >{punchLine}</TplText>
      </div>

      {/* wordmark, bottom-left (clear of platform UI) */}
      <TplText field="brand" data={data}
        base={{ position: 'absolute', bottom: 96, left: 96, right: 96 }}
        style={{ fontFamily: '"Geist", "Inter", sans-serif', fontWeight: 600, fontSize: 30, color: '#ffffff',
          letterSpacing: '0.2em', textTransform: 'uppercase', opacity: 0.9 * inBrand }}
      >{brand}</TplText>
    </div>
  );
}

window.FreshEngineTransferNoblesvilleD3Reel = FreshEngineTransferNoblesvilleD3Reel;

const FRESH_ENGINE_TRANSFER_NOBLESVILLE_D3_SPEC = {
  id: 'fresh-engine-transfer-noblesville-D3',
  name: 'ENGINE-TRANSFER D3 — KINETIC TEXT (STRIKE + PUNCH)',
  fields: [
    { "key": "duration", "label": "Length", "type": "slider", "default": 5, "min": 4, "max": 10, "step": 0.5, "unit": "s" },
    { "key": "eyebrow", "role": "eyebrow", "label": "Eyebrow", "type": "text", "default": "NOBLESVILLE SPORT PARENTS" },
    { "key": "claim", "role": "claim", "label": "Claim", "type": "text", "default": "THE MECHANICS WERE NEVER THE PROBLEM. THE ENGINE WAS." },
    { "key": "brand", "role": "brand", "label": "Brand", "type": "text", "default": "ATHLETES ACCELERATION" }
  ],
};
window.FRESH_ENGINE_TRANSFER_NOBLESVILLE_D3_SPEC = FRESH_ENGINE_TRANSFER_NOBLESVILLE_D3_SPEC;
