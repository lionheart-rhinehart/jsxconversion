// FRESH-ENGINE-TRANSFER-NOBLESVILLE-E2 — AA "training-scene" PROOF creative (beat E).
// Built from scratch on the Athletes Acceleration design system, guided by example
// ex-058-training-scene. Media-backed: a full-bleed deadlift training-scene clip with a
// slow Ken-Burns push-in and a heavy lower scrim. The PROOF beat reads DIFFERENT from a
// plain hook: a small mono "MEASURED EVERY SESSION" stamp parks top-right (a measurement
// HUD feel), a thin red ruler tick rail runs the lower band, and the dominant Anton claim
// owns the lower scrim. All copy via data.*; bg clip via data.bgClip (run-campaign maps
// asset.clip -> bgClip and pre-extracts frames). Vertical-native 1080x1920.

function FreshEngineTransferNoblesvilleE2Reel({ data = {} }) {
  const eyebrow = data.eyebrow ?? 'NOBLESVILLE SPORT PARENTS';
  const claim = data.claim ?? 'SAME GATES. SAME TRACKERS. REAL NUMBERS.';
  const brand = data.brand ?? 'ATHLETES ACCELERATION';
  const bgClip = data.bgClip ?? null;

  const RED = (window.__BRAND__ && window.__BRAND__.brand_red || '#c4141d');
  const INK = '#0a0b0d';
  const t = useTime();
  const clamp = (x) => Math.max(0, Math.min(1, x));
  const ease = (x) => Easing.easeOutCubic(clamp(x));
  const inKick = ease((t - 0.10) / 0.35);   // eyebrow chip
  const inStamp = ease((t - 0.30) / 0.40);  // proof stamp, top-right
  const inRail = ease((t - 0.45) / 0.45);   // ruler tick rail wipes in
  const inClaim = ease((t - 0.55) / 0.70);  // dominant claim
  const push = 1 + 0.06 * ease(t / 6);       // slow Ken-Burns push-in over the clip
  const rise = (1 - inClaim) * 52;

  // ruler ticks across the lower band — a measurement motif (real numbers feel)
  const ticks = [];
  for (let i = 0; i <= 18; i++) {
    const tall = i % 3 === 0;
    ticks.push(
      <div key={i} style={{ width: 2, height: tall ? 22 : 12, background: '#ffffff',
        opacity: tall ? 0.85 : 0.45 }} />
    );
  }

  return (
    <div style={{ position: 'absolute', inset: 0, background: INK, overflow: 'hidden' }}>
      {bgClip ? (
        <SyncedVideo src={bgClip}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
            transform: `scale(${push})`, transformOrigin: '50% 42%' }} />
      ) : null}
      {/* legibility scrim — light up top so the lift reads, heavy at the claim band */}
      <div style={{ position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, rgba(10,11,13,0.58) 0%, rgba(10,11,13,0.06) 22%, rgba(10,11,13,0.16) 48%, rgba(10,11,13,0.84) 76%, rgba(10,11,13,0.98) 100%)' }} />

      {/* left red accent column, wipes down */}
      <div style={{ position: 'absolute', left: 0, top: 0, width: 16, height: 1920,
        background: RED, transform: `scaleY(${inRail})`, transformOrigin: 'top' }} />

      {/* mono eyebrow chip, top-left */}
      <div style={{ position: 'absolute', top: 132, left: 96, opacity: inKick }}>
        <TplText field="eyebrow" data={data} base={{}}
          style={{ display: 'inline-block', color: '#ffffff', fontFamily: '"JetBrains Mono", ui-monospace, monospace',
            fontWeight: 700, fontSize: 30, letterSpacing: '0.22em', textTransform: 'uppercase' }}
        >{eyebrow}</TplText>
        <div style={{ width: 84, height: 6, background: RED, marginTop: 16 }} />
      </div>

      {/* PROOF stamp, top-right — small mono, letter-spaced, with a red status dot.
          This is the distinct measurement HUD that separates PROOF from a plain hook. */}
      <div style={{ position: 'absolute', top: 138, right: 96, opacity: inStamp,
        display: 'flex', alignItems: 'center', gap: 12,
        border: '1px solid rgba(255,255,255,0.40)', borderRadius: 4, padding: '10px 16px',
        background: 'rgba(10,11,13,0.32)' }}>
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: RED }} />
        <div style={{ color: '#ffffff', fontFamily: '"JetBrains Mono", ui-monospace, monospace',
          fontWeight: 700, fontSize: 22, letterSpacing: '0.26em', textTransform: 'uppercase' }}>
          MEASURED EVERY SESSION
        </div>
      </div>

      {/* ruler tick rail — measurement motif above the claim */}
      <div style={{ position: 'absolute', left: 96, right: 84, bottom: 470,
        display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
        height: 22, opacity: inRail, transform: `scaleX(${inRail})`, transformOrigin: 'left' }}>
        {ticks}
      </div>

      {/* dominant claim, lower third */}
      <TplText field="claim" data={data}
        base={{ position: 'absolute', left: 96, right: 84, bottom: 286 }}
        style={{ fontFamily: '"Anton", "Oswald", sans-serif', fontWeight: 400, fontSize: 120, color: '#ffffff',
          lineHeight: 0.90, letterSpacing: '0.004em', textTransform: 'uppercase',
          textShadow: '0 4px 22px rgba(0,0,0,0.65)', opacity: inClaim, transform: `translateY(${rise}px)` }}
        maxHeight={760} fitKey={claim}
      >{claim}</TplText>

      {/* wordmark, bottom-left */}
      <TplText field="brand" data={data}
        base={{ position: 'absolute', bottom: 96, left: 96, right: 96 }}
        style={{ fontFamily: '"Geist", "Inter", sans-serif', fontWeight: 600, fontSize: 30, color: '#ffffff',
          letterSpacing: '0.2em', textTransform: 'uppercase', opacity: 0.9 }}
      >{brand}</TplText>
    </div>
  );
}

window.FreshEngineTransferNoblesvilleE2Reel = FreshEngineTransferNoblesvilleE2Reel;

const FRESH_ENGINE_TRANSFER_NOBLESVILLE_E2_SPEC = {
  id: 'fresh-engine-transfer-noblesville-E2',
  name: 'ENGINE-TRANSFER E2 — TRAINING-SCENE PROOF',
  fields: [
    { "key": "duration", "label": "Length", "type": "slider", "default": 6, "min": 4, "max": 10, "step": 0.5, "unit": "s" },
    { "key": "bgClip", "label": "Background clip", "type": "image" },
    { "key": "eyebrow", "role": "eyebrow", "label": "Eyebrow", "type": "text", "default": "NOBLESVILLE SPORT PARENTS" },
    { "key": "claim", "role": "claim", "label": "Claim", "type": "text", "default": "SAME GATES. SAME TRACKERS. REAL NUMBERS." },
    { "key": "brand", "role": "brand", "label": "Brand", "type": "text", "default": "ATHLETES ACCELERATION" }
  ],
};
window.FRESH_ENGINE_TRANSFER_NOBLESVILLE_E2_SPEC = FRESH_ENGINE_TRANSFER_NOBLESVILLE_E2_SPEC;
