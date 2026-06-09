// FRESH-ENGINE-TRANSFER-NOBLESVILLE-C5 — AA "kinetic-text" graphic (beat C, NO bg photo).
// Built from scratch on the Athletes Acceleration design system, guided by example
// ex-051-kinetic-text (KineticSlamStack): bold word-by-word typography on a deep INK field,
// the claim reveals one word at a time in Anton uppercase, key words slammed in red (#c4141d).
// useTime() drives the word reveal inside the component body. Mono eyebrow chip up top, AA
// wordmark bottom-left, a single red accent rail. Graphic/data-viz archetype = photo-free.
// Vertical-native 1080x1920. All copy via data.*; every text node explicitly colored + TplText-wrapped.

function FreshEngineTransferNoblesvilleC5Reel({ data = {} }) {
  const eyebrow = data.eyebrow ?? 'NOBLESVILLE SPORT PARENTS';
  const claim = data.claim ?? 'YOU MAKE THEM BETTER AT EVERY MOVE THE SPORT ASKS FOR.';
  const brand = data.brand ?? 'ATHLETES ACCELERATION';

  const RED = (window.__BRAND__ && window.__BRAND__.brand_red || '#c4141d');
  const INK = '#0a0b0d';
  const WHITE = '#ffffff';

  const t = useTime();
  const clamp = (x) => Math.max(0, Math.min(1, x));
  const ease = (x) => Easing.easeOutCubic(clamp(x));
  const easeBack = (x) => Easing.easeOutBack(clamp(x));

  const inKick = ease((t - 0.10) / 0.35);   // eyebrow chip
  const inCol = ease((t - 0.20) / 0.45);     // red rail wipe
  const inBrand = ease((t - 0.55) / 0.6);    // wordmark

  // Word-by-word kinetic reveal of the claim. Each word slams in (scale + opacity) on a stagger.
  const words = String(claim).trim().split(/\s+/);
  // Emphasize the load-bearing words of this angle in red — match on the cleaned token.
  const EMPHASIZE = new Set(['EVERY', 'MOVE', 'BETTER', 'SPORT', 'ENGINE', 'FORCE', 'SPEED', 'POWER', 'FASTER', 'STRONGER']);
  const STAGGER = 0.16;
  const START = 0.5;

  return (
    <div style={{ position: 'absolute', inset: 0, background: INK, overflow: 'hidden' }}>
      {/* single red accent rail, left edge, wipes down */}
      <div style={{ position: 'absolute', left: 0, top: 0, width: 16, height: 1920,
        background: RED, transform: `scaleY(${inCol})`, transformOrigin: 'top' }} />

      {/* mono eyebrow chip, top-left */}
      <div style={{ position: 'absolute', top: 132, left: 96, opacity: inKick }}>
        <TplText field="eyebrow" data={data} base={{}}
          style={{ display: 'inline-block', color: WHITE, fontFamily: '"JetBrains Mono", ui-monospace, monospace',
            fontWeight: 700, fontSize: 30, letterSpacing: '0.22em', textTransform: 'uppercase' }}
        >{eyebrow}</TplText>
        <div style={{ width: 84, height: 6, background: RED, marginTop: 16 }} />
      </div>

      {/* dominant kinetic claim — word-by-word, centered band, owns the middle */}
      <TplText field="claim" data={data}
        base={{ position: 'absolute', left: 96, right: 84, top: 540, bottom: 360 }}
        style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center',
          fontFamily: '"Anton", "Oswald", sans-serif', fontWeight: 400, fontSize: 150, lineHeight: 0.9,
          letterSpacing: '0.004em', textTransform: 'uppercase', color: WHITE }}
        maxHeight={1020} fitKey={claim}
      >
        <span style={{ display: 'block' }}>
          {words.map((w, i) => {
            const s = START + i * STAGGER;
            const op = clamp((t - s) / 0.22);
            const p = easeBack((t - s) / 0.42);
            const isRed = EMPHASIZE.has(w.replace(/[^A-Za-z]/g, '').toUpperCase());
            return (
              <span key={i}
                style={{ display: 'inline-block', marginRight: '0.28em',
                  color: isRed ? RED : WHITE, opacity: op,
                  transform: `translateY(${(1 - p) * 26}px) scale(${0.7 + 0.3 * p})`,
                  transformOrigin: 'left center',
                  textShadow: '0 4px 22px rgba(0,0,0,0.6)' }}
              >{w}</span>
            );
          })}
        </span>
      </TplText>

      {/* wordmark, bottom-left */}
      <TplText field="brand" data={data}
        base={{ position: 'absolute', bottom: 96, left: 96, right: 96 }}
        style={{ fontFamily: '"Geist", "Inter", sans-serif', fontWeight: 600, fontSize: 30, color: WHITE,
          letterSpacing: '0.2em', textTransform: 'uppercase', opacity: 0.9 * inBrand }}
      >{brand}</TplText>
    </div>
  );
}

window.FreshEngineTransferNoblesvilleC5Reel = FreshEngineTransferNoblesvilleC5Reel;

const FRESH_ENGINE_TRANSFER_NOBLESVILLE_C5_SPEC = {
  id: 'fresh-engine-transfer-noblesville-C5',
  name: 'ENGINE-TRANSFER C5 — KINETIC TEXT',
  fields: [
    { "key": "duration", "label": "Length", "type": "slider", "default": 5, "min": 4, "max": 10, "step": 0.5, "unit": "s" },
    { "key": "eyebrow", "role": "eyebrow", "label": "Eyebrow", "type": "text", "default": "NOBLESVILLE SPORT PARENTS" },
    { "key": "claim", "role": "claim", "label": "Claim", "type": "text", "default": "YOU MAKE THEM BETTER AT EVERY MOVE THE SPORT ASKS FOR." },
    { "key": "brand", "role": "brand", "label": "Brand", "type": "text", "default": "ATHLETES ACCELERATION" }
  ],
};
window.FRESH_ENGINE_TRANSFER_NOBLESVILLE_C5_SPEC = FRESH_ENGINE_TRANSFER_NOBLESVILLE_C5_SPEC;
