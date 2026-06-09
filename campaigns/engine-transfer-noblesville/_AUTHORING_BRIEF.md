# Authoring brief — engine-transfer-noblesville (Athletes Acceleration, Noblesville)

You are authoring ONE fresh creative template for the AA "engine / transfer" campaign (angle: "the
engine under every sport" — sport skill rides on top of athleticism; force/speed/power is the engine).
Audience: skeptical multi-sport parents. Voice: head-coach-to-parent, declarative, metric-driven.

## Brand rails (NON-NEGOTIABLE — Athletes Acceleration)
- **Accent (one only):** `#c4141d` (read `(window.__BRAND__ && window.__BRAND__.brand_red) || '#c4141d'` in motion). Deep variant `#a30f17`.
- **Ink fields:** `#0a0b0d` (deepest bg), `#15171a` (raised panel). **Surface/text:** `#ffffff`.
- **Fonts:** Display = `'Anton', 'Oswald', sans-serif` (UPPERCASE headlines + giant numerals). Body = `'Geist', 'Inter', sans-serif`. Metrics/eyebrow = `'JetBrains Mono', ui-monospace, monospace` (letter-spaced, uppercase).
- **NO emoji. NO exclamation points. NO hype adjectives.** One accent per frame. One dominant element. Pass the squint test.
- 1080×1920 vertical (9:16). Edge padding ~64–96px. Avoid the bottom ~270px (platform UI) for key text.
- Eyebrow chip default text: `NOBLESVILLE SPORT PARENTS`. Brand wordmark default: `ATHLETES ACCELERATION`.
- Guarantee (verbatim ONLY if used): `+1 mph speed. +3" vertical. 90 days. Or your training is on us.`

## How copy fills (do NOT hardcode the campaign copy)
The renderer injects the real verbatim copy at render time via the role-aware join: each template field
that carries a `role` gets the copy bound to that role in the plan. So you author the template with
**role-tagged fields + sensible on-theme DEFAULT text** (the defaults below). The real copy fills at render.
Your job: expose the right role field(s), make it look right, animate it cleanly.

## MOTION output (video / gif) — Claude Design Stage component
Emit into `brand/video-templates/templates/<filename>.jsx`. Shape (copy this contract exactly):
- `function <ComponentName>({ data = {} }) { ... }` reading `data.<key> ?? <default>` for every field.
- **Call `useTime()` INSIDE the component body** (it returns a number `t` in seconds). NEVER at module top.
  Available globals (no imports): `useTime`, `Easing` (e.g. `Easing.easeOutCubic`), `SyncedVideo`, `TplText`.
- Give EVERY text node an explicit `color`. Wrap editable text in `<TplText field="<key>" data={data} base={{...position...}} style={{...}}>{value}</TplText>`.
- Background CLIP (only for media-backed assets): read `const bgClip = data.bgClip ?? null;` and render
  `{bgClip ? <SyncedVideo src={bgClip} style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover'}} /> : null}`
  then a legibility scrim gradient over it. The field MUST be named `bgClip` (the runner maps the clip to it).
- End with `window.<ComponentName> = <ComponentName>;` and a `const <SPEC_CONST> = { id:'<filename>', name:'...', fields:[ {key:'duration',type:'slider',default:6,min:4,max:10,step:0.5,unit:'s'}, (bgClip if media:) {key:'bgClip',label:'Background clip',type:'image'}, {key:'eyebrow',role:'eyebrow',type:'text',default:'NOBLESVILLE SPORT PARENTS'}, {key:'<roleKey>',role:'<role>',type:'text',default:'<default>'}, ... ] };` then `window.<SPEC_CONST> = <SPEC_CONST>;`
- The reference template `brand/video-templates/templates/fresh-engine-transfer-noblesville-A1.jsx` (an action-hero with a bg clip) shows the exact idiom — READ IT FIRST.
- Data-viz archetypes (anatomy-diagram, sprint-trace, velocity-gauge, radar-stats, tier-list, star-testimonial, calendar-fill, comic-strip): build the named visual (an engine/anatomy diagram, a velocity trace, a gauge, a radar, a ranked list, a quote card, a 90-day calendar, a 2-panel comic) in INK with the red accent + your role text. Read the example's `renderedImagePath` PNG (path given) to see the visual target. NO background photo on these (graphic/data-viz stay photo-free).

## STATIC output (image) — config + thin JSX via _helpers.jsx
Emit a PAIR into `templates/multi-sport-foundations/`:
- `<filename>.config.json`: `{ "width":1080, "height":1920, "media"?:{...}, "fixedDesign":[...], "elements":[...] }`.
  Each editable text element carries `tag`, `role` (one of the 13 roles), `accepts` (other roles), `maxChars`.
  For a MEDIA-backed static (you'll be told a clip path): set top-level `"media": { "path": "<clip path>", "tag":"bg_media", "z":0, "videoStartTime":1 }` for full-bleed, OR a split/cutout per the archetype. Add a scrim element for legibility.
- `<filename>.jsx`: thin shell. MUST contain the two markers `// _FONT_PREFLIGHT: Anton, Geist, JetBrains Mono` and import the config, render `<LayerStack config={config} />` via `./_helpers.jsx`. Do NOT include `<Stage>`, `useTime`, or animation tokens (those route to the video renderer). READ an existing `templates/multi-sport-foundations/fresh-*.config.json` + its `.jsx` as the shape reference, and `./_helpers.jsx` for `LayerStack`/`renderTextLayer`.

## Rules for YOU (the sub-agent)
1. Write ONLY your template file(s). Do NOT touch `creative-plan.json` (the orchestrator sets `asset.template`).
2. Match the brand rails exactly. No emoji, no `!`. One accent (`#c4141d`).
3. Report back: the exact filename(s) written + the window component/SPEC global names.
