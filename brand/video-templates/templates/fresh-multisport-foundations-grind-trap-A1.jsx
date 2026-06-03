// FRESH — multisport-foundations / grind-trap / A1  (3s GIF hook)
// Beat A (stop-the-scroll). The DSI-#1 lead micro-script resolves on a near-black
// frame: "THE TIRED REP ISN'T EFFORT." lands, then "IT'S INSTRUCTION." snaps in
// red. Vertical-native 1080x1920. Captions carry the whole message (muted view).
// Promotable to a named motion bank template + _SPEC.

function GrindHookReel({ data = {} }) {
  const eyebrow = data.eyebrow ?? 'CITY SPORTS PARENTS';
  const line1 = data.line1 ?? "THE TIRED REP\nISN'T EFFORT.";
  const line2 = data.line2 ?? "IT'S INSTRUCTION.";
  const brand = data.brand ?? 'ATHLETES ACCELERATION';
  const bgClip = data.bgClip ?? null;

  const t = useTime();
  const RED = '#c4141d';
  const clamp = (x) => Math.max(0, Math.min(1, x));

  const eyeT = clamp((t - 0.1) / 0.3);
  const l1T = Easing.easeOutCubic(clamp((t - 0.3) / 0.45));
  const l2T = Easing.easeOutBack(clamp((t - 1.2) / 0.5));
  const brandT = clamp((t - 1.9) / 0.4);

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a0b0d', overflow: 'hidden' }}>
      {bgClip ? <SyncedVideo src={bgClip} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} /> : null}
      {bgClip ? <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(10,11,13,0.5) 0%, rgba(10,11,13,0.4) 45%, rgba(10,11,13,0.82) 100%)' }} /> : null}
      {/* subtle red glow */}
      <div style={{ position: 'absolute', bottom: -220, left: -160, width: 640, height: 640,
        background: `radial-gradient(circle, ${RED}22 0%, transparent 60%)`, filter: 'blur(20px)' }} />

      <TplText field="eyebrow" data={data} base={{ position: 'absolute', top: 690, left: 90 }} style={{ fontSize: 40, opacity: eyeT }}>{eyebrow}</TplText>

      <TplText field="line1" data={data}
        base={{ position: 'absolute', top: 790, left: 86, right: 86 }}
        style={{ fontFamily: 'Anton, sans-serif', fontSize: 138, color: '#ffffff', lineHeight: 0.9,
          letterSpacing: '0.005em', textTransform: 'uppercase',
          opacity: l1T, transform: `translateY(${(1 - l1T) * 16}px)` }}
        maxHeight={300} fitKey={line1}
      >{line1}</TplText>

      <TplText field="line2" data={data}
        base={{ position: 'absolute', top: 1090, left: 86, right: 86 }}
        style={{ fontFamily: 'Anton, sans-serif', fontSize: 138, color: RED, lineHeight: 0.9,
          letterSpacing: '0.005em', textTransform: 'uppercase',
          opacity: l2T, transform: `translateY(${(1 - l2T) * 18}px)` }}
        maxHeight={340} fitKey={line2}
      >{line2}</TplText>

      <TplText field="brand" data={data}
        base={{ position: 'absolute', bottom: 110, left: 90, right: 90 }}
        style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 32, color: '#ffffff',
          letterSpacing: '0.14em', textTransform: 'uppercase', opacity: brandT }}
      >{brand}</TplText>
    </div>
  );
}

window.GrindHookReel = GrindHookReel;

const GRIND_HOOK_SPEC = {
  id: 'fresh-multisport-foundations-grind-trap-A1',
  name: 'GRIND HOOK (A1)',
  fields: [
    {
      "key": "duration",
      "label": "Length",
      "type": "slider",
      "default": 3,
      "min": 2,
      "max": 6,
      "step": 0.5,
      "unit": "s"
    },
    {
      "key": "bgClip",
      "label": "Background clip",
      "type": "image"
    },
    {
      "key": "eyebrow",
      "role": "eyebrow",
      "label": "Eyebrow",
      "type": "text",
      "default": "// THE LAST REP LIE"
    },
    {
      "key": "line1",
      "role": "hook",
      "label": "Hook line 1",
      "type": "text",
      "default": "THE TIRED REP\nISN'T EFFORT."
    },
    {
      "key": "line2",
      "role": "hook",
      "label": "Hook line 2 (red)",
      "type": "text",
      "default": "IT'S INSTRUCTION."
    },
    {
      "key": "brand",
      "role": "brand",
      "label": "Brand",
      "type": "text",
      "default": "ATHLETES ACCELERATION"
    }
  ],
};
window.GRIND_HOOK_SPEC = GRIND_HOOK_SPEC;
