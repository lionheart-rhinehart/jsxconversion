// FRESH-ISP-MOTION-STATEMENT — ISP-native two-line statement motion (beat B/D).
// A bold two-part line (white then ISP blue) that lands word-stacked center-frame
// over a lightly scrimmed clip — a punchy reframe/hook distinct from the lower-third
// hook. Built from scratch on the ISP design system. Copy via data.*.

function FreshIspMotionStatement({ data = {} }) {
  const eyebrow = data.eyebrow ?? 'FORT WORTH SPORT PARENTS';
  const line1 = data.line1 ?? 'CHASING VELO';
  const line2 = data.line2 ?? "DOESN'T HAVE TO RISK THE ARM.";
  const brand = data.brand ?? 'IDEAL SPORTS PERFORMANCE';
  const bgClip = data.bgClip ?? null;

  const BLUE = (window.__BRAND__ && window.__BRAND__.brand_red) || '#2573b7';
  const t = useTime();
  const clamp = (x) => Math.max(0, Math.min(1, x));
  const ease = (x) => Easing.easeOutCubic(clamp(x));
  const inEye = ease((t - 0.1) / 0.4);
  const in1 = ease((t - 0.4) / 0.5);
  const in2 = ease((t - 0.95) / 0.55);

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#1c1c1d', overflow: 'hidden' }}>
      {bgClip ? <SyncedVideo src={bgClip} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} /> : null}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(28,28,29,0.55) 0%, rgba(28,28,29,0.7) 45%, rgba(28,28,29,0.8) 70%, rgba(28,28,29,0.94) 100%)' }} />

      <div style={{ position: 'absolute', top: 150, left: 96, opacity: inEye }}>
        <TplText field="eyebrow" data={data} base={{}}
          style={{ display: 'inline-block', background: '#ffffff', color: BLUE, fontFamily: '"Barlow", sans-serif',
            fontWeight: 700, fontSize: 34, letterSpacing: '0.16em', textTransform: 'uppercase', padding: '13px 28px', borderRadius: 999 }}
        >{eyebrow}</TplText>
      </div>

      <TplText field="line1" data={data}
        base={{ position: 'absolute', top: 700, left: 96, right: 96 }}
        style={{ fontFamily: '"Barlow Condensed", "Anton", sans-serif', fontWeight: 800, fontSize: 124, color: '#ffffff',
          lineHeight: 0.9, letterSpacing: '0.004em', textTransform: 'uppercase', opacity: in1, transform: `translateY(${(1 - in1) * 30}px)` }}
        maxHeight={300} fitKey={line1}
      >{line1}</TplText>

      <TplText field="line2" data={data}
        base={{ position: 'absolute', top: 920, left: 96, right: 96 }}
        style={{ fontFamily: '"Barlow Condensed", "Anton", sans-serif', fontWeight: 800, fontSize: 124, color: BLUE,
          lineHeight: 0.9, letterSpacing: '0.004em', textTransform: 'uppercase', opacity: in2, transform: `translateY(${(1 - in2) * 30}px)` }}
        maxHeight={520} fitKey={line2}
      >{line2}</TplText>

      <TplText field="brand" data={data}
        base={{ position: 'absolute', bottom: 78, left: 96, right: 96 }}
        style={{ fontFamily: '"Barlow", sans-serif', fontWeight: 600, fontSize: 30, color: '#ffffff',
          letterSpacing: '0.2em', textTransform: 'uppercase', opacity: 0.9 }}
      >{brand}</TplText>
    </div>
  );
}

window.FreshIspMotionStatement = FreshIspMotionStatement;

const FRESH_ISP_MOTION_STATEMENT_SPEC = {
  id: 'fresh-isp-motion-statement',
  name: 'ISP MOTION STATEMENT',
  fields: [
    { "key": "duration", "label": "Length", "type": "slider", "default": 6, "min": 4, "max": 10, "step": 0.5, "unit": "s" },
    { "key": "bgClip", "label": "Background clip", "type": "image" },
    { "key": "eyebrow", "role": "eyebrow", "label": "Eyebrow", "type": "text", "default": "FORT WORTH SPORT PARENTS" },
    { "key": "line1", "role": "hook", "label": "Line 1 (white)", "type": "text", "default": "CHASING VELO" },
    { "key": "line2", "role": "reframe", "label": "Line 2 (blue)", "type": "text", "default": "DOESN'T HAVE TO RISK THE ARM." },
    { "key": "brand", "role": "brand", "label": "Brand", "type": "text", "default": "IDEAL SPORTS PERFORMANCE" }
  ],
};
window.FRESH_ISP_MOTION_STATEMENT_SPEC = FRESH_ISP_MOTION_STATEMENT_SPEC;
