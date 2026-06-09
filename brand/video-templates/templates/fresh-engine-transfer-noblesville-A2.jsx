// FRESH-ENGINE-TRANSFER-NOBLESVILLE-A2 — AA "comic-strip" cold hook (beat A).
// Built from scratch on the Athletes Acceleration design system, guided by example
// ex-098-comic-strip: a stacked 3-panel comic in INK (#0a0b0d) — each panel a raised
// ink card with a thick red divider rule, popping in on easeOutBack. The hook is the
// dominant Anton headline that owns the strip; mono eyebrow chip up top, AA wordmark
// bottom. NO background photo (graphic/data-viz archetype stays photo-free). One accent
// (#c4141d). Vertical-native 1080x1920. All copy via data.* (role-tagged + TplText).

function FreshEngineTransferNoblesvilleA2Reel({ data = {} }) {
  const eyebrow = data.eyebrow ?? 'NOBLESVILLE SPORT PARENTS';
  const hook = data.hook ?? 'SPEED AND POWER ARE THE ENGINE. EVERY SPORT SKILL RUNS ON IT.';
  const brand = data.brand ?? 'ATHLETES ACCELERATION';

  const RED = (window.__BRAND__ && window.__BRAND__.brand_red || '#c4141d');
  const RED_DEEP = (window.__BRAND__ && window.__BRAND__.brand_red_deep || '#a30f17');
  const INK = '#0a0b0d';
  const PANEL = '#15171a';
  const t = useTime();
  const clamp = (x) => Math.max(0, Math.min(1, x));
  const ease = (x) => Easing.easeOutCubic(clamp(x));
  const back = (x) => Easing.easeOutBack(clamp(x));

  const inKick = ease((t - 0.10) / 0.32);
  const inHook = ease((t - 0.35) / 0.6);
  const rise = (1 - inHook) * 40;

  // 3 comic panels — the "engine" frames: each is an ink card with a red corner tab.
  // The labels are static scaffolding (not editable copy); the dominant editable text is the hook.
  const panels = [
    ['01', 'THE ENGINE'],
    ['02', 'THE TRANSFER'],
    ['03', 'THE RESULT'],
  ];

  return (
    <div style={{ position: 'absolute', inset: 0, background: INK, overflow: 'hidden' }}>
      {/* faint top-down ink wash for depth (no photo) */}
      <div style={{ position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, rgba(21,23,26,0.55) 0%, rgba(10,11,13,0) 32%, rgba(10,11,13,0) 70%, rgba(21,23,26,0.45) 100%)' }} />

      {/* mono eyebrow chip, top-left */}
      <div style={{ position: 'absolute', top: 120, left: 96, opacity: inKick }}>
        <TplText field="eyebrow" data={data} base={{}}
          style={{ display: 'inline-block', color: '#ffffff', fontFamily: '"JetBrains Mono", ui-monospace, monospace',
            fontWeight: 700, fontSize: 30, letterSpacing: '0.22em', textTransform: 'uppercase' }}
        >{eyebrow}</TplText>
        <div style={{ width: 84, height: 6, background: RED, marginTop: 16 }} />
      </div>

      {/* dominant hook — owns the upper strip */}
      <TplText field="hook" data={data}
        base={{ position: 'absolute', left: 96, right: 84, top: 224 }}
        style={{ fontFamily: '"Anton", "Oswald", sans-serif', fontWeight: 400, fontSize: 120, color: '#ffffff',
          lineHeight: 0.9, letterSpacing: '0.004em', textTransform: 'uppercase',
          opacity: inHook, transform: `translateY(${rise}px)` }}
        maxHeight={620} fitKey={hook}
      >{hook}</TplText>

      {/* comic-strip: 3 stacked ink panels with a red divider rule, popping in sequentially */}
      <div style={{ position: 'absolute', left: 96, right: 84, bottom: 270, top: 920,
        display: 'flex', flexDirection: 'column', gap: 22 }}>
        {panels.map((p, i) => {
          const g = back((t - (0.7 + i * 0.4)) / 0.55);
          return (
            <div key={i} style={{ flex: 1, position: 'relative', borderRadius: 16,
              background: PANEL, border: `4px solid ${RED}`,
              display: 'flex', alignItems: 'center', padding: '0 32px', boxSizing: 'border-box',
              opacity: clamp(g, 0, 1), transform: `scale(${0.9 + 0.1 * clamp(g, 0, 1)})`, transformOrigin: 'left center' }}>
              {/* red index tab */}
              <div style={{ fontFamily: '"Anton", "Oswald", sans-serif', fontWeight: 400, fontSize: 96,
                color: RED, lineHeight: 0.8, marginRight: 30 }}>{p[0]}</div>
              <div style={{ fontFamily: '"Anton", "Oswald", sans-serif', fontWeight: 400, fontSize: 56,
                color: '#ffffff', textTransform: 'uppercase', lineHeight: 0.92, letterSpacing: '0.01em' }}>{p[1]}</div>
            </div>
          );
        })}
      </div>

      {/* wordmark, bottom-left */}
      <TplText field="brand" data={data}
        base={{ position: 'absolute', bottom: 96, left: 96, right: 96 }}
        style={{ fontFamily: '"Geist", "Inter", sans-serif', fontWeight: 600, fontSize: 30, color: '#ffffff',
          letterSpacing: '0.2em', textTransform: 'uppercase', opacity: 0.9 }}
      >{brand}</TplText>
    </div>
  );
}

window.FreshEngineTransferNoblesvilleA2Reel = FreshEngineTransferNoblesvilleA2Reel;

const FRESH_ENGINE_TRANSFER_NOBLESVILLE_A2_SPEC = {
  id: 'fresh-engine-transfer-noblesville-A2',
  name: 'ENGINE-TRANSFER A2 — COMIC STRIP',
  fields: [
    { "key": "duration", "label": "Length", "type": "slider", "default": 5, "min": 4, "max": 10, "step": 0.5, "unit": "s" },
    { "key": "eyebrow", "role": "eyebrow", "label": "Eyebrow", "type": "text", "default": "NOBLESVILLE SPORT PARENTS" },
    { "key": "hook", "role": "hook", "label": "Hook", "type": "text", "default": "SPEED AND POWER ARE THE ENGINE. EVERY SPORT SKILL RUNS ON IT." },
    { "key": "brand", "role": "brand", "label": "Brand", "type": "text", "default": "ATHLETES ACCELERATION" }
  ],
};
window.FRESH_ENGINE_TRANSFER_NOBLESVILLE_A2_SPEC = FRESH_ENGINE_TRANSFER_NOBLESVILLE_A2_SPEC;
