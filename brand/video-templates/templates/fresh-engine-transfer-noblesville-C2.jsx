// FRESH-ENGINE-TRANSFER-NOBLESVILLE-C2 — AA "training-scene" mechanism creative (beat C).
// Built from scratch on the Athletes Acceleration design system, guided by example
// ex-057-training-scene: full-bleed med-ball-slam training clip with a slow Ken-Burns push-in,
// a left-edge red accent column that wipes down, a mono eyebrow chip top-left, and a HUGE
// Anton CLAIM owning the lower third (the dominant element). Differs from A1 by being
// mechanism-flavored: a small mono "THE MECHANISM" kicker over the claim and a short red
// underline rule wiping in beneath it. Heavy bottom scrim for legibility, AA wordmark
// bottom-left. Vertical-native 1080x1920. All copy via data.*; bg clip via data.bgClip
// (run-campaign maps asset.clip -> bgClip and pre-extracts frames).

function FreshEngineTransferNoblesvilleC2Reel({ data = {} }) {
  const eyebrow = data.eyebrow ?? 'NOBLESVILLE SPORT PARENTS';
  const claim = data.claim ?? 'TRAIN THE ENGINE. NOT ONE DRILL.';
  const brand = data.brand ?? 'ATHLETES ACCELERATION';
  const bgClip = data.bgClip ?? null;

  const RED = (window.__BRAND__ && window.__BRAND__.brand_red || '#c4141d');
  const INK = '#0a0b0d';
  const t = useTime();
  const clamp = (x) => Math.max(0, Math.min(1, x));
  const ease = (x) => Easing.easeOutCubic(clamp(x));
  const inKick = ease((t - 0.10) / 0.35);
  const inCol = ease((t - 0.25) / 0.45);
  const inKicker = ease((t - 0.38) / 0.5);
  const inClaim = ease((t - 0.48) / 0.7);
  const inRule = ease((t - 0.85) / 0.5);
  const push = 1 + 0.06 * ease(t / 6);          // slow Ken-Burns push-in over the clip
  const rise = (1 - inClaim) * 52;

  return (
    <div style={{ position: 'absolute', inset: 0, background: INK, overflow: 'hidden' }}>
      {bgClip ? (
        <SyncedVideo src={bgClip}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
            transform: `scale(${push})`, transformOrigin: '50% 42%' }} />
      ) : null}
      {/* legibility scrim — light up top so the action reads, heavy at the claim band */}
      <div style={{ position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, rgba(10,11,13,0.60) 0%, rgba(10,11,13,0.04) 24%, rgba(10,11,13,0.18) 50%, rgba(10,11,13,0.86) 78%, rgba(10,11,13,0.98) 100%)' }} />

      {/* left red accent column, wipes down */}
      <div style={{ position: 'absolute', left: 0, top: 0, width: 16, height: 1920,
        background: RED, transform: `scaleY(${inCol})`, transformOrigin: 'top' }} />

      {/* mono eyebrow chip, top-left */}
      <div style={{ position: 'absolute', top: 132, left: 96, opacity: inKick }}>
        <TplText field="eyebrow" data={data} base={{}}
          style={{ display: 'inline-block', color: '#ffffff', fontFamily: '"JetBrains Mono", ui-monospace, monospace',
            fontWeight: 700, fontSize: 30, letterSpacing: '0.22em', textTransform: 'uppercase' }}
        >{eyebrow}</TplText>
        <div style={{ width: 84, height: 6, background: RED, marginTop: 16 }} />
      </div>

      {/* mechanism kicker — small mono label above the claim */}
      <div style={{ position: 'absolute', left: 96, right: 84, bottom: 470, opacity: inKicker }}>
        <span style={{ display: 'inline-block', color: RED,
          fontFamily: '"JetBrains Mono", ui-monospace, monospace', fontWeight: 700,
          fontSize: 26, letterSpacing: '0.28em', textTransform: 'uppercase' }}>THE MECHANISM</span>
      </div>

      {/* dominant claim, lower third */}
      <TplText field="claim" data={data}
        base={{ position: 'absolute', left: 96, right: 84, bottom: 300 }}
        style={{ fontFamily: '"Anton", "Oswald", sans-serif', fontWeight: 400, fontSize: 128, color: '#ffffff',
          lineHeight: 0.88, letterSpacing: '0.004em', textTransform: 'uppercase',
          textShadow: '0 4px 22px rgba(0,0,0,0.65)', opacity: inClaim, transform: `translateY(${rise}px)` }}
        maxHeight={740} fitKey={claim}
      >{claim}</TplText>

      {/* short red underline rule beneath the claim, wipes in */}
      <div style={{ position: 'absolute', left: 96, bottom: 264, width: 168, height: 8,
        background: RED, transform: `scaleX(${inRule})`, transformOrigin: 'left' }} />

      {/* wordmark, bottom-left */}
      <TplText field="brand" data={data}
        base={{ position: 'absolute', bottom: 96, left: 96, right: 96 }}
        style={{ fontFamily: '"Geist", "Inter", sans-serif', fontWeight: 600, fontSize: 30, color: '#ffffff',
          letterSpacing: '0.2em', textTransform: 'uppercase', opacity: 0.9 }}
      >{brand}</TplText>
    </div>
  );
}

window.FreshEngineTransferNoblesvilleC2Reel = FreshEngineTransferNoblesvilleC2Reel;

const FRESH_ENGINE_TRANSFER_NOBLESVILLE_C2_SPEC = {
  id: 'fresh-engine-transfer-noblesville-C2',
  name: 'ENGINE-TRANSFER C2 — TRAINING SCENE (MECHANISM)',
  fields: [
    { "key": "duration", "label": "Length", "type": "slider", "default": 6, "min": 4, "max": 10, "step": 0.5, "unit": "s" },
    { "key": "bgClip", "label": "Background clip", "type": "image" },
    { "key": "eyebrow", "role": "eyebrow", "label": "Eyebrow", "type": "text", "default": "NOBLESVILLE SPORT PARENTS" },
    { "key": "claim", "role": "claim", "label": "Claim", "type": "text", "default": "TRAIN THE ENGINE. NOT ONE DRILL." },
    { "key": "brand", "role": "brand", "label": "Brand", "type": "text", "default": "ATHLETES ACCELERATION" }
  ],
};
window.FRESH_ENGINE_TRANSFER_NOBLESVILLE_C2_SPEC = FRESH_ENGINE_TRANSFER_NOBLESVILLE_C2_SPEC;
