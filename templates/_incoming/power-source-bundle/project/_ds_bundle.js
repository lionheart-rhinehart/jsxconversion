/* @ds-bundle: {"format":3,"namespace":"PowerSourceDesignSystem_0cec65","components":[{"name":"Badge","sourcePath":"components/core/badges/Badge.jsx"},{"name":"Tag","sourcePath":"components/core/badges/Tag.jsx"},{"name":"Button","sourcePath":"components/core/buttons/Button.jsx"},{"name":"Card","sourcePath":"components/core/cards/Card.jsx"},{"name":"ProgramCard","sourcePath":"components/core/cards/ProgramCard.jsx"},{"name":"Avatar","sourcePath":"components/core/content/Avatar.jsx"},{"name":"SectionHeading","sourcePath":"components/core/content/SectionHeading.jsx"},{"name":"Testimonial","sourcePath":"components/core/content/Testimonial.jsx"},{"name":"Input","sourcePath":"components/core/forms/Input.jsx"},{"name":"StatTile","sourcePath":"components/core/stats/StatTile.jsx"}],"sourceHashes":{"campaign-ads.jsx":"a79adc93cc4d","campaigns/multisport-fb/design-canvas.jsx":"bd8746af6e58","components/core/badges/Badge.jsx":"ae9ab5ceeef9","components/core/badges/Tag.jsx":"ce30e9ef2907","components/core/buttons/Button.jsx":"dd2d197cb6fc","components/core/cards/Card.jsx":"d6b9d58cb3e6","components/core/cards/ProgramCard.jsx":"977bc7fec505","components/core/content/Avatar.jsx":"d0518a1f3173","components/core/content/SectionHeading.jsx":"18648bae2361","components/core/content/Testimonial.jsx":"b3618f2eef38","components/core/forms/Input.jsx":"493a9f067cee","components/core/stats/StatTile.jsx":"aa25e46ffdea","ui_kits/athlete-portal/portal.jsx":"f07c77374967","ui_kits/athlete-portal/screens.jsx":"c893ce318c72","ui_kits/marketing-site/image-slot.js":"9309434cb09c","ui_kits/marketing-site/sections.jsx":"0104aa4c6836","ui_kits/marketing-site/ui.jsx":"5bd3473b1961","videos.js":"26d3df8aa139"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.PowerSourceDesignSystem_0cec65 = window.PowerSourceDesignSystem_0cec65 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// campaign-ads.jsx
try { (() => {
// campaign-ads.jsx — Power Source "Multi-Sport" FB/IG Story creatives (1080×1920)
// 3 angles × 2 directions (photo-led + type-led). Exported to window.
(function () {
  const e = React.createElement;

  /* ---------- shared pieces ---------- */

  function Eyebrow({
    children,
    tone
  }) {
    return e("div", {
      className: "ad-eyebrow" + (tone ? " ad-eyebrow--" + tone : "")
    }, children);
  }
  function TopBar({
    light
  }) {
    return e("div", {
      className: "ad-top"
    }, e("img", {
      src: light ? "assets/logo/power-source-logo.webp" : "assets/logo/logo-reversed.png",
      alt: "Power Source",
      className: light ? "ad-top__logo ad-top__logo--plate" : "ad-top__logo"
    }), e("span", {
      className: "ad-loc"
    }, "Leominster, MA · Est. 1998"));
  }
  function Guarantee() {
    return e("div", {
      className: "ad-guar"
    }, e("div", {
      className: "ad-guar__row"
    }, e("div", {
      className: "ad-guar__item"
    }, e("b", null, "+1"), e("span", null, "MPH")), e("i", {
      className: "ad-guar__div"
    }), e("div", {
      className: "ad-guar__item"
    }, e("b", null, "+3"), e("span", null, "INCHES")), e("i", {
      className: "ad-guar__div"
    }), e("div", {
      className: "ad-guar__item"
    }, e("b", null, "90"), e("span", null, "DAYS"))), e("div", {
      className: "ad-guar__tag"
    }, "Or we keep training them free."));
  }
  function Cta() {
    return e("div", {
      className: "ad-ctaWrap"
    }, e("div", {
      className: "ad-cta"
    }, e("span", {
      className: "ad-cta__label"
    }, "Book the Free Athlete Analysis"), e("span", {
      className: "ad-cta__arrow"
    }, "→")), e("div", {
      className: "ad-cta__meta"
    }, e("span", null, "powersourceleominster.com"), e("i", null), e("span", null, "(978) 678-3145")));
  }

  // a believable scoreboard readout (the "visible numbers" mechanism proof)
  function Scoreboard({
    rows,
    title
  }) {
    return e("div", {
      className: "ad-score"
    }, e("div", {
      className: "ad-score__head"
    }, e("span", {
      className: "ad-score__k"
    }, title || "Athlete Analysis"), e("span", {
      className: "ad-score__live"
    }, e("i", null), "Tracked")), e("div", {
      className: "ad-score__rows"
    }, rows.map((r, i) => e("div", {
      className: "ad-score__row",
      key: i
    }, e("span", {
      className: "ad-score__label"
    }, r.label), e("span", {
      className: "ad-score__vals"
    }, e("span", {
      className: "ad-score__from"
    }, r.from), e("span", {
      className: "ad-score__to"
    }, r.to)), e("span", {
      className: "ad-score__up"
    }, "▲")))));
  }
  function Photo({
    focal,
    src
  }) {
    // Plain <img> base layer — renders and exports reliably across capture
    // pipelines (image-slot's shadow DOM can't be read by PNG export). The
    // real Power Source footage is baked in; swap the src to use a new shot.
    return e("div", {
      className: "ad-photo"
    }, e("img", {
      className: "ad-photo__img",
      src: src,
      alt: "",
      style: {
        objectPosition: focal || "50% 50%"
      }
    }), e("div", {
      className: "ad-grain"
    }));
  }

  /* =========================================================
     ANGLE 1 — SPEED  ("Why hard work isn't enough")
     ========================================================= */

  // 1A — photo-led, verbatim headline
  function Ad_Speed_Photo() {
    return e("div", {
      className: "ad ad--photo",
      "data-screen-label": "Speed · Photo"
    }, e(Photo, {
      id: "ps-speed-photo",
      focal: "54% 42%",
      src: "campaigns/multisport-fb/frames/plyo-jump-speed.jpg",
      placeholder: "Athlete mid-jump — real facility"
    }), e("div", {
      className: "ad-scrim ad-scrim--top"
    }), e(TopBar, null),
    // floating gate readout
    e("div", {
      className: "ad-chip ad-chip--gate"
    }, e("span", {
      className: "ad-chip__k"
    }, "10-YD SPLIT · GATE 2"), e("span", {
      className: "ad-chip__v"
    }, "1.81", e("em", null, "s")), e("span", {
      className: "ad-chip__note"
    }, "speed dropped → set ended")), e("div", {
      className: "ad-scrim ad-scrim--bottom"
    }), e("div", {
      className: "ad-lower"
    }, e(Eyebrow, null, "The Last Rep Lie"), e("h1", {
      className: "ad-h",
      style: {
        fontSize: "80px"
      }
    }, "Here's why most young athletes ", e("span", {
      className: "hl"
    }, "stop getting faster"), "."), e("p", {
      className: "ad-sub"
    }, "(And what you can do about it.)"), e(Guarantee, null), e(Cta, null)));
  }

  // 1B — type-led, punchy alt + the 224% proof
  function Ad_Speed_Type() {
    return e("div", {
      className: "ad ad--type ad--arena",
      "data-screen-label": "Speed · Type"
    }, e("div", {
      className: "ad-arenaGrid"
    }), e("div", {
      className: "ad-boltGlow"
    }), e(TopBar, null), e("div", {
      className: "ad-stack"
    }, e(Eyebrow, null, "Mechanism 01 · The Velocity Drop"), e("h1", {
      className: "ad-h",
      style: {
        fontSize: "100px"
      }
    }, "Hard work isn't making them ", e("span", {
      className: "hl"
    }, "faster"), "."), e("p", {
      className: "ad-lede"
    }, "Those last tired reps train the nervous system to move slow. So we end the set the second speed drops — every rep your athlete does stays fast."), e("div", {
      className: "ad-bigstat"
    }, e("div", {
      className: "ad-bigstat__num"
    }, "224", e("span", {
      className: "ad-bigstat__pct"
    }, "%")), e("div", {
      className: "ad-bigstat__cap"
    }, e("b", null, "more vertical jump"), e("span", null, "vs. the train-to-exhaustion group — with 28% less fatigue."), e("em", null, "Frontiers in Physiology, 2026")))), e("div", {
      className: "ad-foot"
    }, e(Guarantee, null), e(Cta, null)));
  }

  /* =========================================================
     ANGLE 2 — CONFIDENCE / RATIONAL  ("Why 'great job' isn't working")
     ========================================================= */

  // 2A — photo-led, verbatim headline
  function Ad_Conf_Photo() {
    return e("div", {
      className: "ad ad--photo",
      "data-screen-label": "Confidence · Photo"
    }, e(Photo, {
      id: "ps-conf-photo",
      focal: "50% 50%",
      src: "campaigns/multisport-fb/frames/strength-and-conditioning-mixed-mixed.jpg",
      placeholder: "Athlete training under the gym mantra wall"
    }), e("div", {
      className: "ad-scrim ad-scrim--top"
    }), e(TopBar, null), e("div", {
      className: "ad-chip ad-chip--score"
    }, e("span", {
      className: "ad-chip__k"
    }, "Their numbers · this month"), e("div", {
      className: "ad-chip__grid"
    }, e("div", null, e("b", null, "1.81", e("em", null, "s")), e("span", null, "10-yd ▲")), e("div", null, e("b", null, "20.5", e("em", null, "in")), e("span", null, "vert ▲")))), e("div", {
      className: "ad-scrim ad-scrim--bottom"
    }), e("div", {
      className: "ad-lower"
    }, e(Eyebrow, null, "Proof > Praise"), e("h1", {
      className: "ad-h",
      style: {
        fontSize: "80px"
      }
    }, "Here's why most young athletes ", e("span", {
      className: "hl"
    }, "lose confidence"), "."), e("p", {
      className: "ad-sub"
    }, "(And what actually rebuilds it.)"), e(Guarantee, null), e(Cta, null)));
  }

  // 2B — type-led, punchy alt + scoreboard mechanism
  function Ad_Conf_Type() {
    return e("div", {
      className: "ad ad--type ad--arena",
      "data-screen-label": "Confidence · Type"
    }, e("div", {
      className: "ad-arenaGrid"
    }), e("div", {
      className: "ad-boltGlow"
    }), e(TopBar, null), e("div", {
      className: "ad-stack"
    }, e(Eyebrow, null, "Two Kinds of Confidence"), e("h1", {
      className: "ad-h",
      style: {
        fontSize: "104px"
      }
    }, "Praise breaks. ", e("span", {
      className: "hl"
    }, "Proof"), " doesn't."), e("p", {
      className: "ad-lede"
    }, "Confidence built on words cracks under pressure. The kind a kid builds from their own numbers, climbing every week, is the kind that holds when the game is on the line."), e(Scoreboard, {
      title: "What they watch go up",
      rows: [{
        label: "Sprint · 10 yd",
        from: "1.94s",
        to: "1.81s"
      }, {
        label: "Vertical jump",
        from: "17.5 in",
        to: "20.5 in"
      }, {
        label: "Broad jump",
        from: "5'2\"",
        to: "5'8\""
      }]
    })), e("div", {
      className: "ad-foot"
    }, e(Guarantee, null), e(Cta, null)));
  }

  /* =========================================================
     ANGLE 3 — CONFIDENCE / EMOTIONAL  ("When they stop believing")
     ========================================================= */

  // 3A — photo-led, verbatim emotional headline
  function Ad_Believe_Photo() {
    return e("div", {
      className: "ad ad--photo ad--warm",
      "data-screen-label": "Believe · Photo"
    }, e(Photo, {
      id: "ps-believe-photo",
      focal: "46% 52%",
      src: "campaigns/multisport-fb/frames/landmine-lunge-believe.jpg",
      placeholder: "Solo athlete, focused training moment"
    }), e("div", {
      className: "ad-scrim ad-scrim--top"
    }), e(TopBar, null), e("div", {
      className: "ad-scrim ad-scrim--bottom ad-scrim--tall"
    }), e("div", {
      className: "ad-lower"
    }, e(Eyebrow, {
      tone: "soft"
    }, "The quiet car ride home"), e("h1", {
      className: "ad-h",
      style: {
        fontSize: "88px"
      }
    }, "When they stop ", e("span", {
      className: "hl"
    }, "believing"), "."), e("p", {
      className: "ad-sub"
    }, "(And what actually rebuilds it.)"), e(Guarantee, null), e(Cta, null)));
  }

  // 3B — type-led, punchy alt + case-study quote
  function Ad_Believe_Type() {
    return e("div", {
      className: "ad ad--type ad--steel",
      "data-screen-label": "Believe · Type"
    }, e("div", {
      className: "ad-arenaGrid"
    }), e("div", {
      className: "ad-boltGlow ad-boltGlow--soft"
    }), e(TopBar, null), e("div", {
      className: "ad-stack"
    }, e(Eyebrow, {
      tone: "soft"
    }, "You can't hand it to them"), e("h1", {
      className: "ad-h",
      style: {
        fontSize: "96px"
      }
    }, "You can't talk them into ", e("span", {
      className: "hl"
    }, "confidence"), "."), e("p", {
      className: "ad-lede"
    }, "They have to see it for themselves — real sprint times and jump heights, climbing every week. The proof comes first. The belief grows out of it."), e("blockquote", {
      className: "ad-quote"
    }, e("span", {
      className: "ad-quote__mark"
    }, "\u201C"), e("p", null, "He was shy and wouldn't join anything. He got stronger here first — and the confidence followed. Now he plays."), e("cite", null, "— a Power Source parent"))), e("div", {
      className: "ad-foot"
    }, e(Guarantee, null), e(Cta, null)));
  }
  Object.assign(window, {
    Ad_Speed_Photo,
    Ad_Speed_Type,
    Ad_Conf_Photo,
    Ad_Conf_Type,
    Ad_Believe_Photo,
    Ad_Believe_Type
  });
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "campaign-ads.jsx", error: String((e && e.message) || e) }); }

// campaigns/multisport-fb/design-canvas.jsx
try { (() => {
// @ds-adherence-ignore -- omelette starter scaffold (raw elements/hex/px by design)

/* BEGIN USAGE */
// DesignCanvas.jsx — Figma-ish design canvas wrapper
// Warm gray grid bg + Sections + Artboards + PostIt notes.
// Exports (to window): DesignCanvas, DCSection, DCArtboard, DCPostIt.
// Artboards are reorderable (grip-drag), deletable, labels/titles are
// inline-editable, and any artboard can be opened in a fullscreen focus
// overlay (←/→/Esc). State persists to a .design-canvas.state.json sidecar
// via the host bridge. No assets, no deps.
//
// Usage:
//   <DesignCanvas>
//     <DCSection id="onboarding" title="Onboarding" subtitle="First-run variants">
//       <DCArtboard id="a" label="A · Dusk" width={260} height={480}>…</DCArtboard>
//       <DCArtboard id="b" label="B · Minimal" width={260} height={480}>…</DCArtboard>
//     </DCSection>
//   </DesignCanvas>
//
// Artboards are static design frames, not scroll regions — never use
// height: 100% + overflow: auto/scroll on inner elements; size each artboard
// to fit its content (explicit pixel height, or let it grow).
/* END USAGE */

const DC = {
  bg: '#f0eee9',
  grid: 'rgba(0,0,0,0.06)',
  label: 'rgba(60,50,40,0.7)',
  title: 'rgba(40,30,20,0.85)',
  subtitle: 'rgba(60,50,40,0.6)',
  postitBg: '#fef4a8',
  postitText: '#5a4a2a',
  font: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif'
};

// One-time CSS injection (classes are dc-prefixed so they don't collide with
// the hosted design's own styles).
if (typeof document !== 'undefined' && !document.getElementById('dc-styles')) {
  const s = document.createElement('style');
  s.id = 'dc-styles';
  s.textContent = ['.dc-editable{cursor:text;outline:none;white-space:nowrap;border-radius:3px;padding:0 2px;margin:0 -2px}', '.dc-editable:focus{background:#fff;box-shadow:0 0 0 1.5px #c96442}', '[data-dc-slot]{transition:transform .18s cubic-bezier(.2,.7,.3,1)}', '[data-dc-slot].dc-dragging{transition:none;z-index:10;pointer-events:none}', '[data-dc-slot].dc-dragging .dc-card{box-shadow:0 12px 40px rgba(0,0,0,.25),0 0 0 2px #c96442;transform:scale(1.02)}',
  // isolation:isolate contains artboard content's z-indexes so a
  // z-indexed child (sticky navbar etc.) can't paint over .dc-header or
  // the .dc-menu popover that drops into the top of the card.
  '.dc-card{isolation:isolate;transition:box-shadow .15s,transform .15s}', '.dc-card *{scrollbar-width:none}', '.dc-card *::-webkit-scrollbar{display:none}',
  // Per-artboard header: grip + label on the left, delete/expand on the
  // right. Single flex row; when the artboard's on-screen width is too
  // narrow for both the label yields (ellipsis, then hidden entirely below
  // ~4ch via the container query) and the buttons stay on the row.
  '.dc-header{position:absolute;bottom:100%;left:-4px;margin-bottom:calc(4px * var(--dc-inv-zoom,1));z-index:2;', '  display:flex;align-items:center;container-type:inline-size}', '.dc-labelrow{display:flex;align-items:center;gap:4px;height:24px;flex:1 1 auto;min-width:0}', '.dc-grip{flex:0 0 auto;cursor:grab;display:flex;align-items:center;padding:5px 4px;border-radius:4px;transition:background .12s,opacity .12s}', '.dc-grip:hover{background:rgba(0,0,0,.08)}', '.dc-grip:active{cursor:grabbing}', '.dc-labeltext{flex:1 1 auto;min-width:0;cursor:pointer;border-radius:4px;padding:3px 6px;', '  display:flex;align-items:center;transition:background .12s;overflow:hidden}',
  // Below ~4ch of label room: hide the label entirely, and drop the grip to
  // hover-only (same reveal rule as .dc-btns) so a narrow header is clean
  // until the card is moused.
  '@container (max-width: 110px){', '  .dc-labeltext{display:none}', '  .dc-grip{opacity:0}', '  [data-dc-slot]:hover .dc-grip{opacity:1}', '}', '.dc-labeltext:hover{background:rgba(0,0,0,.05)}', '.dc-labeltext .dc-editable{overflow:hidden;text-overflow:ellipsis;max-width:100%}', '.dc-labeltext .dc-editable:focus{overflow:visible;text-overflow:clip}', '.dc-btns{flex:0 0 auto;margin-left:auto;display:flex;gap:2px;opacity:0;transition:opacity .12s}', '[data-dc-slot]:hover .dc-btns,.dc-btns:has(.dc-menu){opacity:1}', '.dc-expand,.dc-kebab{width:22px;height:22px;border-radius:5px;border:none;cursor:pointer;padding:0;', '  background:transparent;color:rgba(60,50,40,.7);display:flex;align-items:center;justify-content:center;', '  font:inherit;transition:background .12s,color .12s}', '.dc-expand:hover,.dc-kebab:hover{background:rgba(0,0,0,.06);color:#2a251f}',
  // Slot hosting an open menu floats above later siblings (which otherwise
  // paint on top — same z-index:auto, later DOM order) so the popup isn't
  // clipped by the next card.
  '[data-dc-slot]:has(.dc-menu){z-index:10}', '.dc-menu{position:absolute;top:100%;right:0;margin-top:4px;background:#fff;border-radius:8px;', '  box-shadow:0 8px 28px rgba(0,0,0,.18),0 0 0 1px rgba(0,0,0,.05);padding:4px;min-width:160px;z-index:10}', '.dc-menu button{display:block;width:100%;padding:7px 10px;border:0;background:transparent;', '  border-radius:5px;font-family:inherit;font-size:13px;font-weight:500;line-height:1.2;', '  color:#29261b;cursor:pointer;text-align:left;transition:background .12s;white-space:nowrap}', '.dc-menu button:hover{background:rgba(0,0,0,.05)}', '.dc-menu hr{border:0;border-top:1px solid rgba(0,0,0,.08);margin:4px 2px}', '.dc-menu .dc-danger{color:#c96442}', '.dc-menu .dc-danger:hover{background:rgba(201,100,66,.1)}',
  // Chrome (titles / labels / buttons) counter-scales against the viewport
  // zoom so it stays a constant on-screen size. --dc-inv-zoom is set by
  // DCViewport on every transform update and inherits to all descendants —
  // any overlay inside the world (e.g. a TweaksPanel on an artboard) can use
  // it the same way.
  //
  // The header uses transform:scale (out-of-flow, so layout impact doesn't
  // matter) with its world-space width set to card-width / inv-zoom so that
  // after counter-scaling its on-screen width exactly matches the card's —
  // that's what lets the container query + text-overflow behave against the
  // card's visible edge at every zoom level.
  //
  // The section head uses CSS zoom instead of transform so its layout box
  // grows with the counter-scale, pushing the card row down — otherwise the
  // constant-screen-size title would overflow into the (shrinking) world-
  // space gap and overlap the artboard headers at low zoom.
  '.dc-header{width:calc((100% + 4px) / var(--dc-inv-zoom,1));', '  transform:scale(var(--dc-inv-zoom,1));transform-origin:bottom left}', '.dc-sectionhead{zoom:var(--dc-inv-zoom,1)}'].join('\n');
  document.head.appendChild(s);
}
const DCCtx = React.createContext(null);

// Recursively unwrap React.Fragment so <>…</> grouping doesn't hide
// DCSection/DCArtboard children from the type-based walks below.
function dcFlatten(children) {
  const out = [];
  React.Children.forEach(children, c => {
    if (c && c.type === React.Fragment) out.push(...dcFlatten(c.props.children));else out.push(c);
  });
  return out;
}

// ─────────────────────────────────────────────────────────────
// DesignCanvas — stateful wrapper around the pan/zoom viewport.
// Owns runtime state (per-section order, renamed titles/labels, hidden
// artboards, focused artboard). Order/titles/labels/hidden persist to a
// .design-canvas.state.json
// sidecar next to the HTML. Reads go via plain fetch() so the saved
// arrangement is visible anywhere the HTML + sidecar are served together
// (omelette preview, direct link, downloaded zip). Writes go through the
// host's window.omelette bridge — editing requires the omelette runtime.
// Focus is ephemeral.
// ─────────────────────────────────────────────────────────────
const DC_STATE_FILE = '.design-canvas.state.json';
function DesignCanvas({
  children,
  minScale,
  maxScale,
  style
}) {
  const [state, setState] = React.useState({
    sections: {},
    focus: null
  });
  // Hold rendering until the sidecar read settles so the saved order/titles
  // appear on first paint (no source-order flash). didRead gates writes until
  // the read settles so the empty initial state can't clobber a slow read;
  // skipNextWrite suppresses the one echo-write that would otherwise follow
  // hydration.
  const [ready, setReady] = React.useState(false);
  const didRead = React.useRef(false);
  const skipNextWrite = React.useRef(false);
  React.useEffect(() => {
    let off = false;
    fetch('./' + DC_STATE_FILE).then(r => r.ok ? r.json() : null).then(saved => {
      if (off || !saved || !saved.sections) return;
      skipNextWrite.current = true;
      setState(s => ({
        ...s,
        sections: saved.sections
      }));
    }).catch(() => {}).finally(() => {
      didRead.current = true;
      if (!off) setReady(true);
    });
    const t = setTimeout(() => {
      if (!off) setReady(true);
    }, 150);
    return () => {
      off = true;
      clearTimeout(t);
    };
  }, []);
  React.useEffect(() => {
    if (!didRead.current) return;
    if (skipNextWrite.current) {
      skipNextWrite.current = false;
      return;
    }
    const t = setTimeout(() => {
      window.omelette?.writeFile(DC_STATE_FILE, JSON.stringify({
        sections: state.sections
      })).catch(() => {});
    }, 250);
    return () => clearTimeout(t);
  }, [state.sections]);

  // Build registries synchronously from children so FocusOverlay can read
  // them in the same render. Fragments are flattened; wrapping in other
  // elements still opts out of focus/reorder.
  const registry = {}; // slotId -> { sectionId, artboard }
  const sectionMeta = {}; // sectionId -> { title, subtitle, slotIds[] }
  const sectionOrder = [];
  dcFlatten(children).forEach(sec => {
    if (!sec || sec.type !== DCSection) return;
    const sid = sec.props.id ?? sec.props.title;
    if (!sid) return;
    sectionOrder.push(sid);
    const persisted = state.sections[sid] || {};
    const abs = [];
    dcFlatten(sec.props.children).forEach(ab => {
      if (!ab || ab.type !== DCArtboard) return;
      const aid = ab.props.id ?? ab.props.label;
      if (aid) abs.push([aid, ab]);
    });
    // hidden is scoped to one source revision — when the agent regenerates
    // (artboard-ID set changes), prior deletes don't apply to new content.
    const srcKey = abs.map(([k]) => k).join('\x1f');
    const hidden = persisted.srcKey === srcKey ? persisted.hidden || [] : [];
    const srcIds = [];
    abs.forEach(([aid, ab]) => {
      if (hidden.includes(aid)) return;
      registry[`${sid}/${aid}`] = {
        sectionId: sid,
        artboard: ab
      };
      srcIds.push(aid);
    });
    const kept = (persisted.order || []).filter(k => srcIds.includes(k));
    sectionMeta[sid] = {
      title: persisted.title ?? sec.props.title,
      subtitle: sec.props.subtitle,
      slotIds: [...kept, ...srcIds.filter(k => !kept.includes(k))]
    };
  });
  const api = React.useMemo(() => ({
    state,
    section: id => state.sections[id] || {},
    patchSection: (id, p) => setState(s => ({
      ...s,
      sections: {
        ...s.sections,
        [id]: {
          ...s.sections[id],
          ...(typeof p === 'function' ? p(s.sections[id] || {}) : p)
        }
      }
    })),
    setFocus: slotId => setState(s => ({
      ...s,
      focus: slotId
    }))
  }), [state]);

  // Esc exits focus; any outside pointerdown commits an in-progress rename.
  React.useEffect(() => {
    const onKey = e => {
      if (e.key === 'Escape') api.setFocus(null);
    };
    const onPd = e => {
      const ae = document.activeElement;
      if (ae && ae.isContentEditable && !ae.contains(e.target)) ae.blur();
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPd, true);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPd, true);
    };
  }, [api]);
  return /*#__PURE__*/React.createElement(DCCtx.Provider, {
    value: api
  }, /*#__PURE__*/React.createElement(DCViewport, {
    minScale: minScale,
    maxScale: maxScale,
    style: style
  }, ready && children), state.focus && registry[state.focus] && /*#__PURE__*/React.createElement(DCFocusOverlay, {
    entry: registry[state.focus],
    sectionMeta: sectionMeta,
    sectionOrder: sectionOrder
  }));
}

// ─────────────────────────────────────────────────────────────
// DCViewport — transform-based pan/zoom (internal)
//
// Input mapping (Figma-style):
//   • trackpad pinch  → zoom   (ctrlKey wheel; Safari gesture* events)
//   • trackpad scroll → pan    (two-finger)
//   • mouse wheel     → zoom   (notched; distinguished from trackpad scroll)
//   • middle-drag / primary-drag-on-bg → pan
//
// Transform state lives in a ref and is written straight to the DOM
// (translate3d + will-change) so wheel ticks don't go through React —
// keeps pans at 60fps on dense canvases.
// ─────────────────────────────────────────────────────────────
function DCViewport({
  children,
  minScale = 0.1,
  maxScale = 8,
  style = {}
}) {
  const vpRef = React.useRef(null);
  const worldRef = React.useRef(null);
  const tf = React.useRef({
    x: 0,
    y: 0,
    scale: 1
  });
  // Persist viewport across reloads so the user lands back where they were
  // after an agent edit or browser refresh. The sandbox origin is already
  // per-project; pathname keeps multiple canvas files in one project apart.
  const tfKey = 'dc-viewport:' + location.pathname;
  const saveT = React.useRef(0);
  const lastPostedScale = React.useRef();
  const apply = React.useCallback(() => {
    const {
      x,
      y,
      scale
    } = tf.current;
    const el = worldRef.current;
    if (!el) return;
    el.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
    // Exposed for zoom-invariant chrome (labels, buttons, TweaksPanel).
    el.style.setProperty('--dc-inv-zoom', String(1 / scale));
    // Keep the host toolbar's % readout in sync with the canvas scale. Pan
    // ticks leave scale unchanged — skip the cross-frame post for those.
    if (lastPostedScale.current !== scale) {
      lastPostedScale.current = scale;
      window.parent.postMessage({
        type: '__dc_zoom',
        scale
      }, '*');
    }
    clearTimeout(saveT.current);
    saveT.current = setTimeout(() => {
      try {
        localStorage.setItem(tfKey, JSON.stringify(tf.current));
      } catch {}
    }, 200);
  }, [tfKey]);
  React.useLayoutEffect(() => {
    const flush = () => {
      clearTimeout(saveT.current);
      try {
        localStorage.setItem(tfKey, JSON.stringify(tf.current));
      } catch {}
    };
    try {
      const s = JSON.parse(localStorage.getItem(tfKey) || 'null');
      if (s && Number.isFinite(s.x) && Number.isFinite(s.y) && Number.isFinite(s.scale)) {
        tf.current = {
          x: s.x,
          y: s.y,
          scale: Math.min(maxScale, Math.max(minScale, s.scale))
        };
        apply();
      }
    } catch {}
    // Flush on pagehide and unmount so a reload within the 200ms debounce
    // window doesn't drop the last pan/zoom.
    window.addEventListener('pagehide', flush);
    return () => {
      window.removeEventListener('pagehide', flush);
      flush();
    };
  }, []);
  React.useEffect(() => {
    const vp = vpRef.current;
    if (!vp) return;
    const zoomAt = (cx, cy, factor) => {
      const r = vp.getBoundingClientRect();
      const px = cx - r.left,
        py = cy - r.top;
      const t = tf.current;
      const next = Math.min(maxScale, Math.max(minScale, t.scale * factor));
      const k = next / t.scale;
      // --dc-inv-zoom consumers (.dc-sectionhead's CSS zoom, each section's
      // marginBottom) reflow on every scale change, vertically shifting the
      // world layout — so a world point mathematically pinned under the cursor
      // drifts as you zoom (content creeps up on zoom-in, down on zoom-out).
      // Anchor the DOM element under the cursor instead: record its screen Y,
      // apply the transform + --dc-inv-zoom, then cancel whatever vertical
      // drift the reflow introduced so it stays put on screen.
      let marker = null,
        markerY0 = 0;
      if (k !== 1) {
        const hit = document.elementFromPoint(cx, cy);
        marker = hit && hit.closest ? hit.closest('[data-dc-slot],[data-dc-section]') : null;
        if (marker) markerY0 = marker.getBoundingClientRect().top;
      }
      // keep the world point under the cursor fixed
      t.x = px - (px - t.x) * k;
      t.y = py - (py - t.y) * k;
      t.scale = next;
      apply();
      if (marker) {
        // A pure zoom around (cx, cy) maps screen Y → cy + (Y - cy) * k. Any
        // departure after the --dc-inv-zoom reflow is the layout drift.
        const drift = marker.getBoundingClientRect().top - (cy + (markerY0 - cy) * k);
        if (Math.abs(drift) > 0.1) {
          t.y -= drift;
          apply();
        }
      }
    };

    // Mouse-wheel vs trackpad-scroll heuristic. A physical wheel sends
    // line-mode deltas (Firefox) or large integer pixel deltas with no X
    // component (Chrome/Safari, typically multiples of 100/120). Trackpad
    // two-finger scroll sends small/fractional pixel deltas, often with
    // non-zero deltaX. ctrlKey is set by the browser for trackpad pinch.
    const isMouseWheel = e => e.deltaMode !== 0 || e.deltaX === 0 && Number.isInteger(e.deltaY) && Math.abs(e.deltaY) >= 40;
    const onWheel = e => {
      e.preventDefault();
      if (isGesturing) return; // Safari: gesture* owns the pinch — discard concurrent wheels
      if ((e.ctrlKey || e.metaKey) && !isMouseWheel(e)) {
        // trackpad pinch, or ctrl/cmd + smooth-scroll mouse. Notched
        // wheels fall through to the fixed-step branch below.
        zoomAt(e.clientX, e.clientY, Math.exp(-e.deltaY * 0.01));
      } else if (isMouseWheel(e)) {
        // notched mouse wheel — fixed-ratio step per click
        zoomAt(e.clientX, e.clientY, Math.exp(-Math.sign(e.deltaY) * 0.18));
      } else {
        // trackpad two-finger scroll — pan
        tf.current.x -= e.deltaX;
        tf.current.y -= e.deltaY;
        apply();
      }
    };

    // Safari sends native gesture* events for trackpad pinch with a smooth
    // e.scale; preferring these over the ctrl+wheel fallback gives a much
    // better feel there. No-ops on other browsers. Safari also fires
    // ctrlKey wheel events during the same pinch — isGesturing makes
    // onWheel drop those entirely so they neither zoom nor pan.
    let gsBase = 1;
    let isGesturing = false;
    const onGestureStart = e => {
      e.preventDefault();
      isGesturing = true;
      gsBase = tf.current.scale;
    };
    const onGestureChange = e => {
      e.preventDefault();
      zoomAt(e.clientX, e.clientY, gsBase * e.scale / tf.current.scale);
    };
    const onGestureEnd = e => {
      e.preventDefault();
      isGesturing = false;
    };

    // Drag-pan: middle button anywhere, or primary button on canvas
    // background (anything that isn't an artboard or an inline editor).
    let drag = null;
    const onPointerDown = e => {
      const onBg = !e.target.closest('[data-dc-slot], .dc-editable');
      if (!(e.button === 1 || e.button === 0 && onBg)) return;
      e.preventDefault();
      vp.setPointerCapture(e.pointerId);
      drag = {
        id: e.pointerId,
        lx: e.clientX,
        ly: e.clientY
      };
      vp.style.cursor = 'grabbing';
    };
    const onPointerMove = e => {
      if (!drag || e.pointerId !== drag.id) return;
      tf.current.x += e.clientX - drag.lx;
      tf.current.y += e.clientY - drag.ly;
      drag.lx = e.clientX;
      drag.ly = e.clientY;
      apply();
    };
    const onPointerUp = e => {
      if (!drag || e.pointerId !== drag.id) return;
      vp.releasePointerCapture(e.pointerId);
      drag = null;
      vp.style.cursor = '';
    };

    // Host-driven zoom (toolbar % menu). Zooms around viewport centre so the
    // visible midpoint stays fixed — matching the host's iframe-zoom feel.
    const onHostMsg = e => {
      const d = e.data;
      if (d && d.type === '__dc_set_zoom' && typeof d.scale === 'number') {
        const r = vp.getBoundingClientRect();
        zoomAt(r.left + r.width / 2, r.top + r.height / 2, d.scale / tf.current.scale);
      } else if (d && d.type === '__dc_probe') {
        // Host's [readyGen] reset asks whether a canvas is present; it
        // fires on the iframe's native 'load', which for canvases with
        // images/fonts is after our mount-time announce, so re-announce.
        // Clear the pan-tick guard so apply() re-posts the current scale
        // even if it's unchanged — the host just reset dcScale to 1.
        window.parent.postMessage({
          type: '__dc_present'
        }, '*');
        lastPostedScale.current = undefined;
        apply();
      }
    };
    window.addEventListener('message', onHostMsg);
    // Announce canvas mode so the host toolbar proxies its % control here
    // instead of scaling the iframe element (which would just shrink the
    // viewport window of an infinite canvas). The apply() that follows emits
    // the initial __dc_zoom so the toolbar % is correct before first pinch.
    // lastPostedScale reset mirrors the __dc_probe handler: the layout
    // effect's restore-path apply() may already have posted the restored
    // scale (before __dc_present), so clear the guard to re-post it in order.
    window.parent.postMessage({
      type: '__dc_present'
    }, '*');
    lastPostedScale.current = undefined;
    apply();
    vp.addEventListener('wheel', onWheel, {
      passive: false
    });
    vp.addEventListener('gesturestart', onGestureStart, {
      passive: false
    });
    vp.addEventListener('gesturechange', onGestureChange, {
      passive: false
    });
    vp.addEventListener('gestureend', onGestureEnd, {
      passive: false
    });
    vp.addEventListener('pointerdown', onPointerDown);
    vp.addEventListener('pointermove', onPointerMove);
    vp.addEventListener('pointerup', onPointerUp);
    vp.addEventListener('pointercancel', onPointerUp);
    return () => {
      window.removeEventListener('message', onHostMsg);
      vp.removeEventListener('wheel', onWheel);
      vp.removeEventListener('gesturestart', onGestureStart);
      vp.removeEventListener('gesturechange', onGestureChange);
      vp.removeEventListener('gestureend', onGestureEnd);
      vp.removeEventListener('pointerdown', onPointerDown);
      vp.removeEventListener('pointermove', onPointerMove);
      vp.removeEventListener('pointerup', onPointerUp);
      vp.removeEventListener('pointercancel', onPointerUp);
    };
  }, [apply, minScale, maxScale]);
  const gridSvg = `url("data:image/svg+xml,%3Csvg width='120' height='120' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M120 0H0v120' fill='none' stroke='${encodeURIComponent(DC.grid)}' stroke-width='1'/%3E%3C/svg%3E")`;
  return /*#__PURE__*/React.createElement("div", {
    ref: vpRef,
    className: "design-canvas",
    style: {
      height: '100vh',
      width: '100vw',
      background: DC.bg,
      overflow: 'hidden',
      overscrollBehavior: 'none',
      touchAction: 'none',
      position: 'relative',
      fontFamily: DC.font,
      boxSizing: 'border-box',
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    ref: worldRef,
    style: {
      position: 'absolute',
      top: 0,
      left: 0,
      transformOrigin: '0 0',
      willChange: 'transform',
      width: 'max-content',
      minWidth: '100%',
      minHeight: '100%',
      padding: '60px 0 80px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: -6000,
      backgroundImage: gridSvg,
      backgroundSize: '120px 120px',
      pointerEvents: 'none',
      zIndex: -1
    }
  }), children));
}

// ─────────────────────────────────────────────────────────────
// DCSection — editable title + h-row of artboards in persisted order
// ─────────────────────────────────────────────────────────────
function DCSection({
  id,
  title,
  subtitle,
  children,
  gap = 48
}) {
  const ctx = React.useContext(DCCtx);
  const sid = id ?? title;
  const all = React.Children.toArray(dcFlatten(children));
  const artboards = all.filter(c => c && c.type === DCArtboard);
  const rest = all.filter(c => !(c && c.type === DCArtboard));
  const sec = ctx && sid && ctx.section(sid) || {};
  // Must match DesignCanvas's srcKey computation exactly (it filters falsy
  // IDs), or onDelete persists a srcKey that DesignCanvas never recognizes.
  const allIds = artboards.map(a => a.props.id ?? a.props.label).filter(Boolean);
  const srcKey = allIds.join('\x1f');
  const hidden = sec.srcKey === srcKey ? sec.hidden || [] : [];
  const srcOrder = allIds.filter(k => !hidden.includes(k));
  const order = React.useMemo(() => {
    const kept = (sec.order || []).filter(k => srcOrder.includes(k));
    return [...kept, ...srcOrder.filter(k => !kept.includes(k))];
  }, [sec.order, srcOrder.join('|')]);
  const byId = Object.fromEntries(artboards.map(a => [a.props.id ?? a.props.label, a]));

  // marginBottom counter-scales so the on-screen gap between sections stays
  // constant — otherwise at low zoom the (world-space) gap collapses while
  // the screen-constant sectionhead below it doesn't, and the title reads as
  // belonging to the section above. paddingBottom below is just enough for
  // the 24px artboard-header (abs-positioned above each card) plus ~8px, so
  // the title sits tight against its own row at every zoom.
  return /*#__PURE__*/React.createElement("div", {
    "data-dc-section": sid,
    style: {
      marginBottom: 'calc(80px * var(--dc-inv-zoom, 1))',
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 60px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "dc-sectionhead",
    style: {
      paddingBottom: 36
    }
  }, /*#__PURE__*/React.createElement(DCEditable, {
    tag: "div",
    value: sec.title ?? title,
    onChange: v => ctx && sid && ctx.patchSection(sid, {
      title: v
    }),
    style: {
      fontSize: 28,
      fontWeight: 600,
      color: DC.title,
      letterSpacing: -0.4,
      marginBottom: 6,
      display: 'inline-block'
    }
  }), subtitle && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 16,
      color: DC.subtitle
    }
  }, subtitle))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap,
      padding: '0 60px',
      alignItems: 'flex-start',
      width: 'max-content'
    }
  }, order.map(k => /*#__PURE__*/React.createElement(DCArtboardFrame, {
    key: k,
    sectionId: sid,
    artboard: byId[k],
    order: order,
    label: (sec.labels || {})[k] ?? byId[k].props.label,
    onRename: v => ctx && ctx.patchSection(sid, x => ({
      labels: {
        ...x.labels,
        [k]: v
      }
    })),
    onReorder: next => ctx && ctx.patchSection(sid, {
      order: next
    }),
    onDelete: () => ctx && ctx.patchSection(sid, x => ({
      hidden: [...(x.srcKey === srcKey ? x.hidden || [] : []), k],
      srcKey
    })),
    onFocus: () => ctx && ctx.setFocus(`${sid}/${k}`)
  }))), rest);
}

// DCArtboard — marker; rendered by DCArtboardFrame via DCSection.
function DCArtboard() {
  return null;
}

// Per-artboard export (kind: 'png' | 'html'). Both paths share the same
// self-contained clone: computed styles baked in, @font-face / <img> /
// inline-style background-image urls inlined as data URIs. PNG wraps the
// clone in foreignObject→canvas at 3× the artboard's natural width×height
// (same pipeline the host uses for page captures); HTML wraps it in a
// minimal standalone document. Both are independent of viewport zoom.
async function dcExport(node, w, h, name, kind) {
  try {
    await document.fonts.ready;
  } catch {}
  const toDataURL = url => fetch(url).then(r => r.blob()).then(b => new Promise(res => {
    const fr = new FileReader();
    fr.onload = () => res(fr.result);
    fr.onerror = () => res(url);
    fr.readAsDataURL(b);
  })).catch(() => url);

  // Collect @font-face rules. ss.cssRules throws SecurityError on
  // cross-origin sheets (e.g. fonts.googleapis.com) — in that case fetch
  // the CSS text directly (those endpoints send ACAO:*) and regex-extract
  // the blocks. @import and @media/@supports are walked so nested
  // @font-face rules aren't missed.
  const fontRules = [],
    pending = [],
    seen = new Set();
  const scrapeCss = href => {
    if (seen.has(href)) return;
    seen.add(href);
    pending.push(fetch(href).then(r => r.text()).then(css => {
      for (const m of css.match(/@font-face\s*{[^}]*}/g) || []) fontRules.push({
        css: m,
        base: href
      });
      for (const m of css.matchAll(/@import\s+(?:url\()?['"]?([^'")\s;]+)/g)) scrapeCss(new URL(m[1], href).href);
    }).catch(() => {}));
  };
  const walk = (rules, base) => {
    for (const r of rules) {
      if (r.type === CSSRule.FONT_FACE_RULE) fontRules.push({
        css: r.cssText,
        base
      });else if (r.type === CSSRule.IMPORT_RULE && r.styleSheet) {
        const ibase = r.styleSheet.href || base;
        try {
          walk(r.styleSheet.cssRules, ibase);
        } catch {
          scrapeCss(ibase);
        }
      } else if (r.cssRules) walk(r.cssRules, base);
    }
  };
  for (const ss of document.styleSheets) {
    const base = ss.href || location.href;
    try {
      walk(ss.cssRules, base);
    } catch {
      if (ss.href) scrapeCss(ss.href);
    }
  }
  while (pending.length) await pending.shift();
  const fontCss = (await Promise.all(fontRules.map(async rule => {
    let out = rule.css,
      m;
    const re = /url\((['"]?)([^'")]+)\1\)/g;
    while (m = re.exec(rule.css)) {
      if (m[2].indexOf('data:') === 0) continue;
      let abs;
      try {
        abs = new URL(m[2], rule.base).href;
      } catch {
        continue;
      }
      out = out.split(m[0]).join('url("' + (await toDataURL(abs)) + '")');
    }
    return out;
  }))).join('\n');
  const cloneStyled = src => {
    if (src.nodeType === 8 || src.nodeType === 1 && src.tagName === 'SCRIPT') return document.createTextNode('');
    const dst = src.cloneNode(false);
    if (src.nodeType === 1) {
      const cs = getComputedStyle(src);
      let txt = '';
      for (let i = 0; i < cs.length; i++) txt += cs[i] + ':' + cs.getPropertyValue(cs[i]) + ';';
      dst.setAttribute('style', txt + 'animation:none;transition:none;');
      if (src.tagName === 'CANVAS') try {
        const im = document.createElement('img');
        im.src = src.toDataURL();
        im.setAttribute('style', txt);
        return im;
      } catch {}
    }
    for (let c = src.firstChild; c; c = c.nextSibling) dst.appendChild(cloneStyled(c));
    return dst;
  };
  const clone = cloneStyled(node);
  clone.setAttribute('xmlns', 'http://www.w3.org/1999/xhtml');
  // Drop the card's own shadow/radius so the export is a flush w×h rect;
  // the artboard's own background (if any) is already in the computed style.
  clone.style.boxShadow = 'none';
  clone.style.borderRadius = '0';
  const jobs = [];
  clone.querySelectorAll('img').forEach(el => {
    const s = el.getAttribute('src');
    if (s && s.indexOf('data:') !== 0) jobs.push(toDataURL(el.src).then(d => el.setAttribute('src', d)));
  });
  [clone, ...clone.querySelectorAll('*')].forEach(el => {
    const bg = el.style.backgroundImage;
    if (!bg) return;
    let m;
    const re = /url\(["']?([^"')]+)["']?\)/g;
    while (m = re.exec(bg)) {
      const tok = m[0],
        url = m[1];
      if (url.indexOf('data:') === 0) continue;
      jobs.push(toDataURL(url).then(d => {
        el.style.backgroundImage = el.style.backgroundImage.split(tok).join('url("' + d + '")');
      }));
    }
  });
  await Promise.all(jobs);
  const xml = new XMLSerializer().serializeToString(clone);
  const save = (blob, ext) => {
    if (!blob) return;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name + '.' + ext;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };
  if (kind === 'html') {
    const html = '<!doctype html><html><head><meta charset="utf-8"><title>' + name + '</title>' + (fontCss ? '<style>' + fontCss + '</style>' : '') + '</head><body style="margin:0">' + xml + '</body></html>';
    return save(new Blob([html], {
      type: 'text/html'
    }), 'html');
  }

  // PNG: the SVG's own width/height must be the output resolution — an
  // <img>-loaded SVG rasterizes at its intrinsic size, so sizing it at 1×
  // and ctx.scale()-ing up would just upscale a 1× bitmap. viewBox maps the
  // w×h foreignObject onto the px·w × px·h SVG canvas so the browser renders
  // the HTML at full resolution.
  const px = 3;
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + w * px + '" height="' + h * px + '" viewBox="0 0 ' + w + ' ' + h + '"><foreignObject width="' + w + '" height="' + h + '">' + (fontCss ? '<style><![CDATA[' + fontCss + ']]></style>' : '') + xml + '</foreignObject></svg>';
  const img = new Image();
  await new Promise((res, rej) => {
    img.onload = res;
    img.onerror = () => rej(new Error('svg load failed'));
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  });
  const cv = document.createElement('canvas');
  cv.width = w * px;
  cv.height = h * px;
  cv.getContext('2d').drawImage(img, 0, 0);
  cv.toBlob(blob => save(blob, 'png'), 'image/png');
}
function DCArtboardFrame({
  sectionId,
  artboard,
  label,
  order,
  onRename,
  onReorder,
  onFocus,
  onDelete
}) {
  const {
    id: rawId,
    label: rawLabel,
    width = 260,
    height = 480,
    children,
    style = {}
  } = artboard.props;
  const id = rawId ?? rawLabel;
  const ref = React.useRef(null);
  const cardRef = React.useRef(null);
  const menuRef = React.useRef(null);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [confirming, setConfirming] = React.useState(false);

  // ⋯ menu: close on any outside pointerdown. Two-click delete lives inside
  // the menu — first click arms the row, second commits; closing disarms.
  React.useEffect(() => {
    if (!menuOpen) {
      setConfirming(false);
      return;
    }
    const off = e => {
      if (!menuRef.current || !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('pointerdown', off, true);
    return () => document.removeEventListener('pointerdown', off, true);
  }, [menuOpen]);
  const doExport = kind => {
    setMenuOpen(false);
    if (!cardRef.current) return;
    const name = String(label || id || 'artboard').replace(/[^\w\s.-]+/g, '_');
    dcExport(cardRef.current, width, height, name, kind).catch(e => console.error('[design-canvas] export failed:', e));
  };

  // Live drag-reorder: dragged card sticks to cursor; siblings slide into
  // their would-be slots in real time via transforms. DOM order only
  // changes on drop.
  const onGripDown = e => {
    e.preventDefault();
    e.stopPropagation();
    const me = ref.current;
    // translateX is applied in local (pre-scale) space but pointer deltas and
    // getBoundingClientRect().left are screen-space — divide by the viewport's
    // current scale so the dragged card tracks the cursor at any zoom level.
    const scale = me.getBoundingClientRect().width / me.offsetWidth || 1;
    const peers = Array.from(document.querySelectorAll(`[data-dc-section="${sectionId}"] [data-dc-slot]`));
    const homes = peers.map(el => ({
      el,
      id: el.dataset.dcSlot,
      x: el.getBoundingClientRect().left
    }));
    const slotXs = homes.map(h => h.x);
    const startIdx = order.indexOf(id);
    const startX = e.clientX;
    let liveOrder = order.slice();
    me.classList.add('dc-dragging');
    const layout = () => {
      for (const h of homes) {
        if (h.id === id) continue;
        const slot = liveOrder.indexOf(h.id);
        h.el.style.transform = `translateX(${(slotXs[slot] - h.x) / scale}px)`;
      }
    };
    const move = ev => {
      const dx = ev.clientX - startX;
      me.style.transform = `translateX(${dx / scale}px)`;
      const cur = homes[startIdx].x + dx;
      let nearest = 0,
        best = Infinity;
      for (let i = 0; i < slotXs.length; i++) {
        const d = Math.abs(slotXs[i] - cur);
        if (d < best) {
          best = d;
          nearest = i;
        }
      }
      if (liveOrder.indexOf(id) !== nearest) {
        liveOrder = order.filter(k => k !== id);
        liveOrder.splice(nearest, 0, id);
        layout();
      }
    };
    const up = () => {
      document.removeEventListener('pointermove', move);
      document.removeEventListener('pointerup', up);
      const finalSlot = liveOrder.indexOf(id);
      me.classList.remove('dc-dragging');
      me.style.transform = `translateX(${(slotXs[finalSlot] - homes[startIdx].x) / scale}px)`;
      // After the settle transition, kill transitions + clear transforms +
      // commit the reorder in the same frame so there's no visual snap-back.
      setTimeout(() => {
        for (const h of homes) {
          h.el.style.transition = 'none';
          h.el.style.transform = '';
        }
        if (liveOrder.join('|') !== order.join('|')) onReorder(liveOrder);
        requestAnimationFrame(() => requestAnimationFrame(() => {
          for (const h of homes) h.el.style.transition = '';
        }));
      }, 180);
    };
    document.addEventListener('pointermove', move);
    document.addEventListener('pointerup', up);
  };
  return /*#__PURE__*/React.createElement("div", {
    ref: ref,
    "data-dc-slot": id,
    style: {
      position: 'relative',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "dc-header",
    "data-omelette-chrome": "",
    style: {
      color: DC.label
    },
    onPointerDown: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("div", {
    className: "dc-labelrow"
  }, /*#__PURE__*/React.createElement("div", {
    className: "dc-grip",
    onPointerDown: onGripDown,
    title: "Drag to reorder"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "9",
    height: "13",
    viewBox: "0 0 9 13",
    fill: "currentColor"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "2",
    cy: "2",
    r: "1.1"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "7",
    cy: "2",
    r: "1.1"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "2",
    cy: "6.5",
    r: "1.1"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "7",
    cy: "6.5",
    r: "1.1"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "2",
    cy: "11",
    r: "1.1"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "7",
    cy: "11",
    r: "1.1"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "dc-labeltext",
    onClick: onFocus,
    title: "Click to focus"
  }, /*#__PURE__*/React.createElement(DCEditable, {
    value: label,
    onChange: onRename,
    onClick: e => e.stopPropagation(),
    style: {
      fontSize: 15,
      fontWeight: 500,
      color: DC.label,
      lineHeight: 1
    }
  }))), /*#__PURE__*/React.createElement("div", {
    className: "dc-btns"
  }, /*#__PURE__*/React.createElement("div", {
    ref: menuRef,
    style: {
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "dc-kebab",
    title: "More",
    onClick: () => setMenuOpen(o => !o)
  }, /*#__PURE__*/React.createElement("svg", {
    width: "12",
    height: "12",
    viewBox: "0 0 12 12",
    fill: "currentColor"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "2.5",
    cy: "6",
    r: "1.1"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "6",
    cy: "6",
    r: "1.1"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "9.5",
    cy: "6",
    r: "1.1"
  }))), menuOpen && /*#__PURE__*/React.createElement("div", {
    className: "dc-menu",
    onPointerDown: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => doExport('png')
  }, "Download PNG"), /*#__PURE__*/React.createElement("button", {
    onClick: () => doExport('html')
  }, "Download HTML"), /*#__PURE__*/React.createElement("hr", null), /*#__PURE__*/React.createElement("button", {
    className: "dc-danger",
    onClick: () => {
      if (confirming) {
        setMenuOpen(false);
        onDelete();
      } else setConfirming(true);
    }
  }, confirming ? 'Click again to delete' : 'Delete'))), /*#__PURE__*/React.createElement("button", {
    className: "dc-expand",
    onClick: onFocus,
    title: "Focus"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "12",
    height: "12",
    viewBox: "0 0 12 12",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.6",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M7 1h4v4M5 11H1V7M11 1L7.5 4.5M1 11l3.5-3.5"
  }))))), /*#__PURE__*/React.createElement("div", {
    ref: cardRef,
    className: "dc-card",
    style: {
      borderRadius: 2,
      boxShadow: '0 1px 3px rgba(0,0,0,.08),0 4px 16px rgba(0,0,0,.06)',
      overflow: 'hidden',
      width,
      height,
      background: '#fff',
      ...style
    }
  }, children || /*#__PURE__*/React.createElement("div", {
    style: {
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#bbb',
      fontSize: 13,
      fontFamily: DC.font
    }
  }, id)));
}

// Inline rename — commits on blur or Enter.
function DCEditable({
  value,
  onChange,
  style,
  tag = 'span',
  onClick
}) {
  const T = tag;
  return /*#__PURE__*/React.createElement(T, {
    className: "dc-editable",
    contentEditable: true,
    suppressContentEditableWarning: true,
    onClick: onClick,
    onPointerDown: e => e.stopPropagation(),
    onBlur: e => onChange && onChange(e.currentTarget.textContent),
    onKeyDown: e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        e.currentTarget.blur();
      }
    },
    style: style
  }, value);
}

// ─────────────────────────────────────────────────────────────
// Focus mode — overlay one artboard; ←/→ within section, ↑/↓ across
// sections, Esc or backdrop click to exit.
// ─────────────────────────────────────────────────────────────
function DCFocusOverlay({
  entry,
  sectionMeta,
  sectionOrder
}) {
  const ctx = React.useContext(DCCtx);
  const {
    sectionId,
    artboard
  } = entry;
  const sec = ctx.section(sectionId);
  const meta = sectionMeta[sectionId];
  const peers = meta.slotIds;
  const aid = artboard.props.id ?? artboard.props.label;
  const idx = peers.indexOf(aid);
  const secIdx = sectionOrder.indexOf(sectionId);
  const go = d => {
    const n = peers[(idx + d + peers.length) % peers.length];
    if (n) ctx.setFocus(`${sectionId}/${n}`);
  };
  const goSection = d => {
    // Sections whose artboards are all deleted have slotIds:[] — step past
    // them to the next non-empty section so ↑/↓ doesn't dead-end.
    const n = sectionOrder.length;
    for (let i = 1; i < n; i++) {
      const ns = sectionOrder[((secIdx + d * i) % n + n) % n];
      const first = sectionMeta[ns] && sectionMeta[ns].slotIds[0];
      if (first) {
        ctx.setFocus(`${ns}/${first}`);
        return;
      }
    }
  };
  React.useEffect(() => {
    const k = e => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        go(-1);
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        go(1);
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        goSection(-1);
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        goSection(1);
      }
    };
    document.addEventListener('keydown', k);
    return () => document.removeEventListener('keydown', k);
  });
  const {
    width = 260,
    height = 480,
    children
  } = artboard.props;
  const [vp, setVp] = React.useState({
    w: window.innerWidth,
    h: window.innerHeight
  });
  React.useEffect(() => {
    const r = () => setVp({
      w: window.innerWidth,
      h: window.innerHeight
    });
    window.addEventListener('resize', r);
    return () => window.removeEventListener('resize', r);
  }, []);
  const scale = Math.max(0.1, Math.min((vp.w - 200) / width, (vp.h - 260) / height, 2));
  const [ddOpen, setDd] = React.useState(false);
  const Arrow = ({
    dir,
    onClick
  }) => /*#__PURE__*/React.createElement("button", {
    onClick: e => {
      e.stopPropagation();
      onClick();
    },
    style: {
      position: 'absolute',
      top: '50%',
      [dir]: 28,
      transform: 'translateY(-50%)',
      border: 'none',
      background: 'rgba(255,255,255,.08)',
      color: 'rgba(255,255,255,.9)',
      width: 44,
      height: 44,
      borderRadius: 22,
      fontSize: 18,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'background .15s'
    },
    onMouseEnter: e => e.currentTarget.style.background = 'rgba(255,255,255,.18)',
    onMouseLeave: e => e.currentTarget.style.background = 'rgba(255,255,255,.08)'
  }, /*#__PURE__*/React.createElement("svg", {
    width: "18",
    height: "18",
    viewBox: "0 0 18 18",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: dir === 'left' ? 'M11 3L5 9l6 6' : 'M7 3l6 6-6 6'
  })));

  // Portal to body so position:fixed is the real viewport regardless of any
  // transform on DesignCanvas's ancestors (including the canvas zoom itself).
  return ReactDOM.createPortal(/*#__PURE__*/React.createElement("div", {
    onClick: () => ctx.setFocus(null),
    onWheel: e => e.preventDefault(),
    style: {
      position: 'fixed',
      inset: 0,
      zIndex: 100,
      background: 'rgba(24,20,16,.6)',
      backdropFilter: 'blur(14px)',
      fontFamily: DC.font,
      color: '#fff'
    }
  }, /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 72,
      display: 'flex',
      alignItems: 'flex-start',
      padding: '16px 20px 0',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setDd(o => !o),
    style: {
      border: 'none',
      background: 'transparent',
      color: '#fff',
      cursor: 'pointer',
      padding: '6px 8px',
      borderRadius: 6,
      textAlign: 'left',
      fontFamily: 'inherit'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 18,
      fontWeight: 600,
      letterSpacing: -0.3
    }
  }, meta.title), /*#__PURE__*/React.createElement("svg", {
    width: "11",
    height: "11",
    viewBox: "0 0 11 11",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.8",
    strokeLinecap: "round",
    style: {
      opacity: .7
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M2 4l3.5 3.5L9 4"
  }))), meta.subtitle && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      fontSize: 13,
      opacity: .6,
      fontWeight: 400,
      marginTop: 2
    }
  }, meta.subtitle)), ddOpen && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: '100%',
      left: 0,
      marginTop: 4,
      background: '#2a251f',
      borderRadius: 8,
      boxShadow: '0 8px 32px rgba(0,0,0,.4)',
      padding: 4,
      minWidth: 200,
      zIndex: 10
    }
  }, sectionOrder.filter(sid => sectionMeta[sid].slotIds.length).map(sid => /*#__PURE__*/React.createElement("button", {
    key: sid,
    onClick: () => {
      setDd(false);
      const f = sectionMeta[sid].slotIds[0];
      if (f) ctx.setFocus(`${sid}/${f}`);
    },
    style: {
      display: 'block',
      width: '100%',
      textAlign: 'left',
      border: 'none',
      cursor: 'pointer',
      background: sid === sectionId ? 'rgba(255,255,255,.1)' : 'transparent',
      color: '#fff',
      padding: '8px 12px',
      borderRadius: 5,
      fontSize: 14,
      fontWeight: sid === sectionId ? 600 : 400,
      fontFamily: 'inherit'
    }
  }, sectionMeta[sid].title)))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement("button", {
    onClick: () => ctx.setFocus(null),
    onMouseEnter: e => e.currentTarget.style.background = 'rgba(255,255,255,.12)',
    onMouseLeave: e => e.currentTarget.style.background = 'transparent',
    style: {
      border: 'none',
      background: 'transparent',
      color: 'rgba(255,255,255,.7)',
      width: 32,
      height: 32,
      borderRadius: 16,
      fontSize: 20,
      cursor: 'pointer',
      lineHeight: 1,
      transition: 'background .12s'
    }
  }, "\xD7")), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 64,
      bottom: 56,
      left: 100,
      right: 100,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      width: width * scale,
      height: height * scale,
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width,
      height,
      transform: `scale(${scale})`,
      transformOrigin: 'top left',
      background: '#fff',
      borderRadius: 2,
      overflow: 'hidden',
      boxShadow: '0 20px 80px rgba(0,0,0,.4)'
    }
  }, children || /*#__PURE__*/React.createElement("div", {
    style: {
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#bbb'
    }
  }, aid))), /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      fontSize: 14,
      fontWeight: 500,
      opacity: .85,
      textAlign: 'center'
    }
  }, (sec.labels || {})[aid] ?? artboard.props.label, /*#__PURE__*/React.createElement("span", {
    style: {
      opacity: .5,
      marginLeft: 10,
      fontVariantNumeric: 'tabular-nums'
    }
  }, idx + 1, " / ", peers.length))), /*#__PURE__*/React.createElement(Arrow, {
    dir: "left",
    onClick: () => go(-1)
  }), /*#__PURE__*/React.createElement(Arrow, {
    dir: "right",
    onClick: () => go(1)
  }), /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      position: 'absolute',
      bottom: 20,
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      gap: 8
    }
  }, peers.map((p, i) => /*#__PURE__*/React.createElement("button", {
    key: p,
    onClick: () => ctx.setFocus(`${sectionId}/${p}`),
    style: {
      border: 'none',
      padding: 0,
      cursor: 'pointer',
      width: 6,
      height: 6,
      borderRadius: 3,
      background: i === idx ? '#fff' : 'rgba(255,255,255,.3)'
    }
  })))), document.body);
}

// ─────────────────────────────────────────────────────────────
// Post-it — absolute-positioned sticky note
// ─────────────────────────────────────────────────────────────
function DCPostIt({
  children,
  top,
  left,
  right,
  bottom,
  rotate = -2,
  width = 180
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top,
      left,
      right,
      bottom,
      width,
      background: DC.postitBg,
      padding: '14px 16px',
      fontFamily: '"Comic Sans MS", "Marker Felt", "Segoe Print", cursive',
      fontSize: 14,
      lineHeight: 1.4,
      color: DC.postitText,
      boxShadow: '0 2px 8px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.08)',
      transform: `rotate(${rotate}deg)`,
      zIndex: 5
    }
  }, children);
}
Object.assign(window, {
  DesignCanvas,
  DCSection,
  DCArtboard,
  DCPostIt
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "campaigns/multisport-fb/design-canvas.jsx", error: String((e && e.message) || e) }); }

// components/core/badges/Badge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function ensureStyles(id, css) {
  if (typeof document === "undefined" || document.getElementById(id)) return;
  const el = document.createElement("style");
  el.id = id;
  el.textContent = css;
  document.head.appendChild(el);
}
const CSS = `
.ps-badge{
  display:inline-flex;align-items:center;gap:6px;
  font-family:var(--font-mono);font-weight:var(--fw-bold);
  font-size:11px;letter-spacing:.08em;text-transform:uppercase;
  padding:4px 10px;border-radius:var(--radius-pill);
  line-height:1.4;white-space:nowrap;
  background:var(--electric-500);color:#fff;
}
.ps-badge .ps-badge__dot{width:6px;height:6px;border-radius:50%;background:currentColor;opacity:.9;}
.ps-badge--bolt{background:var(--bolt-400);color:var(--ink-950);}
.ps-badge--steel{background:var(--steel-500);color:#fff;}
.ps-badge--success{background:var(--success);color:#fff;}
.ps-badge--danger{background:var(--danger);color:#fff;}
.ps-badge--neutral{background:var(--ink-700);color:var(--text-body);}
.ps-badge--outline{background:transparent;color:var(--electric-300);box-shadow:inset 0 0 0 1.5px var(--electric-400);}
`;
function Badge({
  children,
  variant = "electric",
  dot = false,
  className = "",
  ...rest
}) {
  ensureStyles("ps-badge-styles", CSS);
  const cls = ["ps-badge", variant !== "electric" ? `ps-badge--${variant}` : "", className].filter(Boolean).join(" ");
  return /*#__PURE__*/React.createElement("span", _extends({
    className: cls
  }, rest), dot && /*#__PURE__*/React.createElement("span", {
    className: "ps-badge__dot"
  }), children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/badges/Badge.jsx", error: String((e && e.message) || e) }); }

// components/core/badges/Tag.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function ensureStyles(id, css) {
  if (typeof document === "undefined" || document.getElementById(id)) return;
  const el = document.createElement("style");
  el.id = id;
  el.textContent = css;
  document.head.appendChild(el);
}
const CSS = `
.ps-tag{
  display:inline-flex;align-items:center;gap:7px;
  font-family:var(--font-heading);font-weight:var(--fw-semibold);
  font-size:13px;letter-spacing:.02em;
  padding:6px 12px;border-radius:var(--radius-sm);
  background:var(--ink-800);color:var(--text-body);
  border:1px solid var(--border-default);line-height:1;
}
.ps-tag--active{background:var(--electric-500);color:#fff;border-color:transparent;}
.ps-tag--bolt{background:transparent;color:var(--bolt-300);border-color:var(--bolt-700);}
.ps-tag__x{margin-left:2px;opacity:.6;cursor:pointer;font-family:var(--font-body);}
.ps-tag__x:hover{opacity:1;}
`;
function Tag({
  children,
  active = false,
  variant = "default",
  onRemove,
  className = "",
  ...rest
}) {
  ensureStyles("ps-tag-styles", CSS);
  const cls = ["ps-tag", active ? "ps-tag--active" : "", variant === "bolt" ? "ps-tag--bolt" : "", className].filter(Boolean).join(" ");
  return /*#__PURE__*/React.createElement("span", _extends({
    className: cls
  }, rest), children, onRemove && /*#__PURE__*/React.createElement("span", {
    className: "ps-tag__x",
    onClick: onRemove,
    role: "button",
    "aria-label": "Remove"
  }, "\xD7"));
}
Object.assign(__ds_scope, { Tag });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/badges/Tag.jsx", error: String((e && e.message) || e) }); }

// components/core/buttons/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Inject component CSS once (keeps the component self-contained). */
function ensureStyles(id, css) {
  if (typeof document === "undefined") return;
  if (document.getElementById(id)) return;
  const el = document.createElement("style");
  el.id = id;
  el.textContent = css;
  document.head.appendChild(el);
}
const CSS = `
.ps-btn{
  --_bg: var(--action-primary);
  --_bgh: var(--action-primary-hover);
  --_bgp: var(--action-primary-press);
  --_fg: var(--action-primary-text);
  display:inline-flex;align-items:center;justify-content:center;gap:10px;
  font-family:var(--font-heading);font-weight:var(--fw-bold);
  text-transform:uppercase;letter-spacing:.06em;
  border:0;cursor:pointer;white-space:nowrap;text-decoration:none;
  background:var(--_bg);color:var(--_fg);
  height:var(--control-h-md);padding:0 var(--control-pad-x);
  border-radius:var(--radius-md);font-size:14px;
  transition:background var(--dur-fast) var(--ease-out),
             box-shadow var(--dur-base) var(--ease-out),
             transform var(--dur-fast) var(--ease-out);
}
.ps-btn:hover{background:var(--_bgh);box-shadow:var(--glow-electric);text-decoration:none;}
.ps-btn:active{background:var(--_bgp);box-shadow:var(--inset-press);transform:translateY(1px);}
.ps-btn:focus-visible{outline:none;box-shadow:var(--ring-focus);}
.ps-btn--bolt{--_bg:var(--action-bolt);--_bgh:var(--action-bolt-hover);--_bgp:var(--action-bolt-press);--_fg:var(--action-bolt-text);}
.ps-btn--bolt:hover{box-shadow:var(--glow-bolt);}
.ps-btn--secondary{--_bg:var(--surface-steel);--_bgh:var(--steel-600);--_bgp:var(--steel-700);--_fg:#fff;}
.ps-btn--secondary:hover{box-shadow:none;}
.ps-btn--ghost{--_bg:transparent;--_fg:var(--action-ghost-text);box-shadow:inset 0 0 0 var(--bw-1) var(--action-ghost-border);}
.ps-btn--ghost:hover{background:var(--action-ghost-hover);box-shadow:inset 0 0 0 var(--bw-1) var(--border-strong);}
.ps-btn--ghost:active{background:var(--action-ghost-hover);}
.ps-btn--sm{height:var(--control-h-sm);padding:0 16px;font-size:13px;}
.ps-btn--lg{height:var(--control-h-lg);padding:0 30px;font-size:16px;}
.ps-btn--block{display:flex;width:100%;}
.ps-btn:disabled,.ps-btn[aria-disabled="true"]{opacity:.45;cursor:not-allowed;box-shadow:none;transform:none;pointer-events:none;}
`;
function Button({
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  disabled = false,
  iconLeft = null,
  iconRight = null,
  as = "button",
  className = "",
  ...rest
}) {
  ensureStyles("ps-btn-styles", CSS);
  const cls = ["ps-btn", variant !== "primary" ? `ps-btn--${variant}` : "", size !== "md" ? `ps-btn--${size}` : "", fullWidth ? "ps-btn--block" : "", className].filter(Boolean).join(" ");
  const Comp = as;
  const extra = Comp === "button" ? {
    disabled,
    type: rest.type || "button"
  } : {
    "aria-disabled": disabled || undefined
  };
  return /*#__PURE__*/React.createElement(Comp, _extends({
    className: cls
  }, extra, rest), iconLeft, children, iconRight);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/buttons/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/cards/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function ensureStyles(id, css) {
  if (typeof document === "undefined" || document.getElementById(id)) return;
  const el = document.createElement("style");
  el.id = id;
  el.textContent = css;
  document.head.appendChild(el);
}
const CSS = `
.ps-card{
  position:relative;
  background:var(--surface-raised);
  border:1px solid var(--border-subtle);
  border-radius:var(--radius-lg);
  box-shadow:var(--shadow-md);
  padding:24px;
  color:var(--text-body);
}
.ps-card--steel{background:var(--grad-steel);border-color:var(--border-default);color:#d6deeb;}
.ps-card--light{background:var(--surface-invert);border-color:var(--border-on-light);color:var(--text-on-light);box-shadow:var(--shadow-light-md);}
.ps-card--accent-bolt{border-top:var(--bw-3) solid var(--bolt-400);}
.ps-card--accent-electric{border-top:var(--bw-3) solid var(--electric-400);}
.ps-card--interactive{transition:transform var(--dur-base) var(--ease-out),box-shadow var(--dur-base) var(--ease-out),border-color var(--dur-base) var(--ease-out);cursor:pointer;}
.ps-card--interactive:hover{transform:translateY(-3px);box-shadow:var(--shadow-lg);border-color:var(--border-strong);}
`;
function Card({
  children,
  variant = "raised",
  accent = "none",
  interactive = false,
  className = "",
  style,
  ...rest
}) {
  ensureStyles("ps-card-styles", CSS);
  const cls = ["ps-card", variant !== "raised" ? `ps-card--${variant}` : "", accent !== "none" ? `ps-card--accent-${accent}` : "", interactive ? "ps-card--interactive" : "", className].filter(Boolean).join(" ");
  return /*#__PURE__*/React.createElement("div", _extends({
    className: cls,
    style: style
  }, rest), children);
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/cards/Card.jsx", error: String((e && e.message) || e) }); }

// components/core/cards/ProgramCard.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function ensureStyles(id, css) {
  if (typeof document === "undefined" || document.getElementById(id)) return;
  const el = document.createElement("style");
  el.id = id;
  el.textContent = css;
  document.head.appendChild(el);
}
const CSS = `
.ps-prog{display:flex;flex-direction:column;gap:14px;min-height:100%;}
.ps-prog__top{display:flex;align-items:center;justify-content:space-between;gap:12px;}
.ps-prog__icon{
  width:52px;height:52px;border-radius:var(--radius-md);
  display:flex;align-items:center;justify-content:center;
  background:var(--electric-500);color:#fff;flex:none;
}
.ps-prog--bolt .ps-prog__icon{background:var(--bolt-400);color:var(--ink-950);}
.ps-prog__icon svg, .ps-prog__icon i{width:26px;height:26px;}
.ps-prog__meta{
  font-family:var(--font-mono);font-size:11px;letter-spacing:.1em;text-transform:uppercase;
  color:var(--text-muted);
}
.ps-prog__title{
  font-family:var(--font-display);font-weight:var(--fw-extrabold);
  text-transform:uppercase;letter-spacing:-.005em;line-height:1;
  font-size:26px;color:var(--text-strong);
}
.ps-prog__desc{font-family:var(--font-body);font-size:14px;line-height:1.5;color:var(--text-body);flex:1;}
.ps-prog__cta{
  display:inline-flex;align-items:center;gap:8px;align-self:flex-start;
  font-family:var(--font-heading);font-weight:var(--fw-bold);
  text-transform:uppercase;letter-spacing:.06em;font-size:13px;
  color:var(--electric-300);
}
.ps-prog--bolt .ps-prog__cta{color:var(--bolt-300);}
.ps-prog__cta .arr{transition:transform var(--dur-fast) var(--ease-out);}
.ps-card--interactive:hover .ps-prog__cta .arr{transform:translateX(4px);}
`;
function ProgramCard({
  title,
  description,
  meta = null,
  icon = null,
  cta = "Learn More",
  accent = "electric",
  onClick,
  className = "",
  ...rest
}) {
  ensureStyles("ps-prog-styles", CSS);
  return /*#__PURE__*/React.createElement(__ds_scope.Card, _extends({
    interactive: true,
    accent: accent,
    onClick: onClick,
    className: `${accent === "bolt" ? "ps-prog--bolt" : ""} ${className}`
  }, rest), /*#__PURE__*/React.createElement("div", {
    className: "ps-prog"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ps-prog__top"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ps-prog__icon"
  }, icon), meta && /*#__PURE__*/React.createElement("span", {
    className: "ps-prog__meta"
  }, meta)), /*#__PURE__*/React.createElement("div", {
    className: "ps-prog__title"
  }, title), /*#__PURE__*/React.createElement("div", {
    className: "ps-prog__desc"
  }, description), /*#__PURE__*/React.createElement("span", {
    className: "ps-prog__cta"
  }, cta, " ", /*#__PURE__*/React.createElement("span", {
    className: "arr"
  }, "\u2192"))));
}
Object.assign(__ds_scope, { ProgramCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/cards/ProgramCard.jsx", error: String((e && e.message) || e) }); }

// components/core/content/Avatar.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function ensureStyles(id, css) {
  if (typeof document === "undefined" || document.getElementById(id)) return;
  const el = document.createElement("style");
  el.id = id;
  el.textContent = css;
  document.head.appendChild(el);
}
const CSS = `
.ps-avatar{
  display:inline-flex;align-items:center;justify-content:center;
  border-radius:50%;overflow:hidden;flex:none;
  background:var(--steel-500);color:#fff;
  font-family:var(--font-display);font-weight:var(--fw-extrabold);
  text-transform:uppercase;letter-spacing:.02em;
  width:44px;height:44px;font-size:17px;
}
.ps-avatar img{width:100%;height:100%;object-fit:cover;}
.ps-avatar--sm{width:32px;height:32px;font-size:13px;}
.ps-avatar--lg{width:64px;height:64px;font-size:24px;}
.ps-avatar--bolt{background:var(--bolt-400);color:var(--ink-950);}
.ps-avatar--ring{box-shadow:0 0 0 2px var(--ink-950),0 0 0 4px var(--electric-400);}
`;
function Avatar({
  src = null,
  name = "",
  size = "md",
  accent = "steel",
  ring = false,
  className = "",
  ...rest
}) {
  ensureStyles("ps-avatar-styles", CSS);
  const initials = name ? name.trim().split(/\s+/).slice(0, 2).map(w => w[0]).join("") : "";
  const cls = ["ps-avatar", size !== "md" ? `ps-avatar--${size}` : "", accent === "bolt" ? "ps-avatar--bolt" : "", ring ? "ps-avatar--ring" : "", className].filter(Boolean).join(" ");
  return /*#__PURE__*/React.createElement("span", _extends({
    className: cls
  }, rest), src ? /*#__PURE__*/React.createElement("img", {
    src: src,
    alt: name
  }) : initials);
}
Object.assign(__ds_scope, { Avatar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/content/Avatar.jsx", error: String((e && e.message) || e) }); }

// components/core/content/SectionHeading.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function ensureStyles(id, css) {
  if (typeof document === "undefined" || document.getElementById(id)) return;
  const el = document.createElement("style");
  el.id = id;
  el.textContent = css;
  document.head.appendChild(el);
}
const CSS = `
.ps-head{display:flex;flex-direction:column;gap:14px;}
.ps-head--center{align-items:center;text-align:center;}
.ps-head__eyebrow{
  display:inline-flex;align-items:center;gap:9px;
  font-family:var(--font-mono);font-weight:var(--fw-bold);
  font-size:12px;letter-spacing:.18em;text-transform:uppercase;
  color:var(--electric-300);
}
.ps-head__eyebrow::before{content:"";width:22px;height:2px;background:var(--bolt-400);}
.ps-head--center .ps-head__eyebrow::before{display:none;}
.ps-head__title{
  font-family:var(--font-display);font-weight:var(--fw-extrabold);
  text-transform:uppercase;line-height:.95;letter-spacing:-.01em;
  font-size:clamp(34px,4.4vw,56px);color:var(--text-strong);
  max-width:16ch;text-wrap:balance;
}
.ps-head--center .ps-head__title{max-width:18ch;}
.ps-head--light .ps-head__title{color:var(--ink-900);}
.ps-head--light .ps-head__eyebrow{color:var(--electric-500);}
.ps-head__sub{
  font-family:var(--font-body);font-size:var(--fs-body-lg);line-height:1.55;
  color:var(--text-body);max-width:56ch;text-wrap:pretty;
}
.ps-head--light .ps-head__sub{color:var(--text-on-light-muted);}
.ps-head--center .ps-head__sub{margin-inline:auto;}
.ps-head__title .hl{color:var(--bolt-400);}
`;
function SectionHeading({
  eyebrow = null,
  title,
  subtitle = null,
  align = "left",
  tone = "dark",
  className = "",
  ...rest
}) {
  ensureStyles("ps-head-styles", CSS);
  const cls = ["ps-head", align === "center" ? "ps-head--center" : "", tone === "light" ? "ps-head--light" : "", className].filter(Boolean).join(" ");
  return /*#__PURE__*/React.createElement("div", _extends({
    className: cls
  }, rest), eyebrow && /*#__PURE__*/React.createElement("span", {
    className: "ps-head__eyebrow"
  }, eyebrow), /*#__PURE__*/React.createElement("h2", {
    className: "ps-head__title"
  }, title), subtitle && /*#__PURE__*/React.createElement("p", {
    className: "ps-head__sub"
  }, subtitle));
}
Object.assign(__ds_scope, { SectionHeading });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/content/SectionHeading.jsx", error: String((e && e.message) || e) }); }

// components/core/content/Testimonial.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function ensureStyles(id, css) {
  if (typeof document === "undefined" || document.getElementById(id)) return;
  const el = document.createElement("style");
  el.id = id;
  el.textContent = css;
  document.head.appendChild(el);
}
const CSS = `
.ps-quote{
  display:flex;flex-direction:column;gap:18px;
  background:var(--surface-raised);
  border:1px solid var(--border-subtle);
  border-radius:var(--radius-lg);
  box-shadow:var(--shadow-md);
  padding:26px;position:relative;
}
.ps-quote__mark{
  font-family:var(--font-display);font-weight:var(--fw-black);
  font-size:64px;line-height:.5;color:var(--bolt-400);height:24px;
}
.ps-quote__stars{display:flex;gap:3px;color:var(--bolt-400);font-size:15px;letter-spacing:2px;}
.ps-quote__body{
  font-family:var(--font-body);font-size:17px;line-height:1.55;color:var(--text-strong);
  text-wrap:pretty;flex:1;
}
.ps-quote__foot{display:flex;align-items:center;gap:12px;}
.ps-quote__name{font-family:var(--font-heading);font-weight:var(--fw-bold);font-size:15px;color:var(--text-strong);}
.ps-quote__role{font-family:var(--font-mono);font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--text-muted);}
`;
function Testimonial({
  quote,
  name,
  role = null,
  avatarSrc = null,
  rating = 5,
  className = "",
  ...rest
}) {
  ensureStyles("ps-quote-styles", CSS);
  return /*#__PURE__*/React.createElement("figure", _extends({
    className: `ps-quote ${className}`
  }, rest), rating ? /*#__PURE__*/React.createElement("div", {
    className: "ps-quote__stars",
    "aria-label": `${rating} out of 5`
  }, "★".repeat(rating), "☆".repeat(Math.max(0, 5 - rating))) : /*#__PURE__*/React.createElement("div", {
    className: "ps-quote__mark"
  }, "\u201C"), /*#__PURE__*/React.createElement("blockquote", {
    className: "ps-quote__body"
  }, quote), /*#__PURE__*/React.createElement("figcaption", {
    className: "ps-quote__foot"
  }, /*#__PURE__*/React.createElement(__ds_scope.Avatar, {
    name: name,
    src: avatarSrc,
    accent: "bolt"
  }), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("span", {
    className: "ps-quote__name"
  }, name), role && /*#__PURE__*/React.createElement("span", {
    className: "ps-quote__role",
    style: {
      display: "block"
    }
  }, role))));
}
Object.assign(__ds_scope, { Testimonial });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/content/Testimonial.jsx", error: String((e && e.message) || e) }); }

// components/core/forms/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function ensureStyles(id, css) {
  if (typeof document === "undefined" || document.getElementById(id)) return;
  const el = document.createElement("style");
  el.id = id;
  el.textContent = css;
  document.head.appendChild(el);
}
const CSS = `
.ps-field{display:flex;flex-direction:column;gap:7px;}
.ps-field__label{
  font-family:var(--font-heading);font-weight:var(--fw-semibold);
  font-size:13px;letter-spacing:.02em;color:var(--text-strong);
}
.ps-field__req{color:var(--bolt-400);margin-left:3px;}
.ps-field__wrap{position:relative;display:flex;align-items:center;}
.ps-field__icon{position:absolute;left:14px;display:flex;color:var(--text-muted);pointer-events:none;}
.ps-field__icon svg,.ps-field__icon i{width:18px;height:18px;}
.ps-input{
  width:100%;height:var(--control-h-md);
  background:var(--ink-850);color:var(--text-strong);
  border:1px solid var(--border-default);
  border-radius:var(--radius-md);
  padding:0 14px;font-family:var(--font-body);font-size:15px;
  transition:border-color var(--dur-fast) var(--ease-out),box-shadow var(--dur-fast) var(--ease-out);
}
.ps-input::placeholder{color:var(--text-muted);}
.ps-input:hover{border-color:var(--border-strong);}
.ps-input:focus{outline:none;border-color:var(--electric-400);box-shadow:var(--ring-focus);}
.ps-input--icon{padding-left:42px;}
.ps-input--error{border-color:var(--danger);}
.ps-input--error:focus{box-shadow:0 0 0 3px rgba(217,72,63,.4);}
.ps-input:disabled{opacity:.5;cursor:not-allowed;}
.ps-field__help{font-family:var(--font-body);font-size:12px;color:var(--text-muted);}
.ps-field__help--error{color:var(--danger);}
`;
function Input({
  label,
  required = false,
  icon = null,
  error = null,
  helper = null,
  id,
  className = "",
  ...rest
}) {
  ensureStyles("ps-input-styles", CSS);
  const inputId = id || (label ? `ps-${String(label).toLowerCase().replace(/\s+/g, "-")}` : undefined);
  const inputCls = ["ps-input", icon ? "ps-input--icon" : "", error ? "ps-input--error" : "", className].filter(Boolean).join(" ");
  return /*#__PURE__*/React.createElement("div", {
    className: "ps-field"
  }, label && /*#__PURE__*/React.createElement("label", {
    className: "ps-field__label",
    htmlFor: inputId
  }, label, required && /*#__PURE__*/React.createElement("span", {
    className: "ps-field__req"
  }, "*")), /*#__PURE__*/React.createElement("div", {
    className: "ps-field__wrap"
  }, icon && /*#__PURE__*/React.createElement("span", {
    className: "ps-field__icon"
  }, icon), /*#__PURE__*/React.createElement("input", _extends({
    id: inputId,
    className: inputCls,
    "aria-invalid": !!error
  }, rest))), (error || helper) && /*#__PURE__*/React.createElement("span", {
    className: `ps-field__help ${error ? "ps-field__help--error" : ""}`
  }, error || helper));
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/forms/Input.jsx", error: String((e && e.message) || e) }); }

// components/core/stats/StatTile.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function ensureStyles(id, css) {
  if (typeof document === "undefined" || document.getElementById(id)) return;
  const el = document.createElement("style");
  el.id = id;
  el.textContent = css;
  document.head.appendChild(el);
}
const CSS = `
.ps-stat{
  position:relative;display:flex;flex-direction:column;gap:6px;
  background:var(--surface-raised);
  border:1px solid var(--border-subtle);
  border-radius:var(--radius-lg);
  padding:22px 22px 20px;
  overflow:hidden;
}
.ps-stat::before{content:"";position:absolute;left:0;top:0;bottom:0;width:var(--bw-3);background:var(--electric-400);}
.ps-stat--bolt::before{background:var(--bolt-400);}
.ps-stat__eyebrow{
  font-family:var(--font-mono);font-weight:var(--fw-bold);
  font-size:11px;letter-spacing:.16em;text-transform:uppercase;
  color:var(--text-muted);
}
.ps-stat__value{
  font-family:var(--font-display);font-weight:var(--fw-black);
  font-size:54px;line-height:.95;color:var(--text-strong);
  font-variant-numeric:tabular-nums;letter-spacing:-.01em;
  display:flex;align-items:baseline;gap:4px;
}
.ps-stat__unit{font-size:26px;color:var(--bolt-400);font-weight:var(--fw-extrabold);}
.ps-stat__caption{font-family:var(--font-body);font-size:13px;color:var(--text-body);}
.ps-stat__trend{
  font-family:var(--font-mono);font-size:12px;font-weight:var(--fw-bold);
  display:inline-flex;align-items:center;gap:4px;margin-top:2px;
}
.ps-stat__trend--up{color:var(--success);}
.ps-stat__trend--down{color:var(--success);}
.ps-stat__trend--flat{color:var(--text-muted);}
`;
function StatTile({
  value,
  unit = null,
  eyebrow = null,
  caption = null,
  trend = null,
  accent = "electric",
  className = "",
  ...rest
}) {
  ensureStyles("ps-stat-styles", CSS);
  const cls = ["ps-stat", accent === "bolt" ? "ps-stat--bolt" : "", className].filter(Boolean).join(" ");
  return /*#__PURE__*/React.createElement("div", _extends({
    className: cls
  }, rest), eyebrow && /*#__PURE__*/React.createElement("div", {
    className: "ps-stat__eyebrow"
  }, eyebrow), /*#__PURE__*/React.createElement("div", {
    className: "ps-stat__value"
  }, value, unit && /*#__PURE__*/React.createElement("span", {
    className: "ps-stat__unit"
  }, unit)), caption && /*#__PURE__*/React.createElement("div", {
    className: "ps-stat__caption"
  }, caption), trend && /*#__PURE__*/React.createElement("span", {
    className: `ps-stat__trend ps-stat__trend--${trend.dir || "flat"}`
  }, trend.dir === "up" ? "▲" : trend.dir === "down" ? "▼" : "■", " ", trend.label));
}
Object.assign(__ds_scope, { StatTile });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/stats/StatTile.jsx", error: String((e && e.message) || e) }); }

// ui_kits/athlete-portal/portal.jsx
try { (() => {
/* Power Source — Athlete Portal: app shell + widgets.
   Reuses base primitives from ../marketing-site/ui.jsx (Button, Badge,
   Avatar, Input, StatTile, Icon). Defines portal-specific UI here. */

(function () {
  function ensureStyles(id, css) {
    if (document.getElementById(id)) return;
    const el = document.createElement("style");
    el.id = id;
    el.textContent = css;
    document.head.appendChild(el);
  }
  ensureStyles("ps-portal-styles", `
  .ap{display:grid;grid-template-columns:248px 1fr;min-height:100vh;background:var(--surface-base);}
  /* Sidebar */
  .ap-side{background:var(--ink-900);border-right:1px solid var(--border-subtle);display:flex;flex-direction:column;padding:22px 16px;position:sticky;top:0;height:100vh;box-sizing:border-box;}
  .ap-side__logo{display:flex;align-items:center;gap:10px;padding:4px 8px 22px;}
  .ap-side__logo img{height:34px;}
  .ap-nav{display:flex;flex-direction:column;gap:4px;}
  .ap-nav__item{display:flex;align-items:center;gap:12px;padding:11px 12px;border-radius:var(--radius-md);font-family:var(--font-heading);font-weight:600;font-size:14px;color:var(--text-body);cursor:pointer;border:1px solid transparent;transition:background var(--dur-fast) var(--ease-out),color var(--dur-fast) var(--ease-out);}
  .ap-nav__item svg{width:19px;height:19px;}
  .ap-nav__item:hover{background:var(--ink-800);color:var(--text-strong);}
  .ap-nav__item.is-active{background:var(--electric-500);color:#fff;border-color:transparent;box-shadow:var(--shadow-md);}
  .ap-side__spacer{flex:1;}
  .ap-coach{background:var(--surface-steel);border:1px solid var(--border-default);border-radius:var(--radius-lg);padding:14px;display:flex;gap:11px;align-items:center;}
  .ap-coach__meta b{display:block;font-family:var(--font-heading);font-weight:700;font-size:13px;color:#fff;}
  .ap-coach__meta span{font-family:var(--font-mono);font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:var(--electric-200);}
  /* Topbar */
  .ap-main{display:flex;flex-direction:column;min-width:0;}
  .ap-top{display:flex;align-items:center;gap:18px;padding:20px 32px;border-bottom:1px solid var(--border-subtle);position:sticky;top:0;background:rgba(5,6,8,.82);backdrop-filter:blur(12px);z-index:50;}
  .ap-top__title{font-family:var(--font-display);font-weight:800;text-transform:uppercase;font-size:26px;letter-spacing:-.01em;color:var(--text-strong);line-height:1;}
  .ap-top__right{margin-left:auto;display:flex;align-items:center;gap:14px;}
  .ap-streak{display:inline-flex;align-items:center;gap:7px;font-family:var(--font-mono);font-weight:700;font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:var(--bolt-300);background:rgba(225,204,66,.1);border:1px solid var(--bolt-800);border-radius:var(--radius-pill);padding:7px 13px;}
  .ap-streak svg{width:15px;height:15px;}
  .ap-content{padding:28px 32px 48px;display:flex;flex-direction:column;gap:22px;}
  /* Section label */
  .ap-label{font-family:var(--font-mono);font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:var(--text-muted);margin-bottom:2px;}
  /* Grid helpers */
  .ap-row{display:grid;gap:18px;}
  .ap-row--3{grid-template-columns:repeat(3,1fr);}
  .ap-row--4{grid-template-columns:repeat(4,1fr);}
  .ap-row--hero{grid-template-columns:1.6fr 1fr;}
  /* Session card */
  .ap-session{position:relative;overflow:hidden;background:var(--grad-steel);border:1px solid var(--border-default);border-radius:var(--radius-xl);padding:26px;display:flex;flex-direction:column;gap:18px;}
  .ap-session::after{content:"";position:absolute;right:-40px;top:-40px;width:180px;height:180px;border-radius:50%;background:radial-gradient(circle,rgba(225,204,66,.18),transparent 70%);}
  .ap-session__when{font-family:var(--font-mono);font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:var(--bolt-300);}
  .ap-session__focus{font-family:var(--font-display);font-weight:800;text-transform:uppercase;font-size:34px;line-height:.95;color:#fff;letter-spacing:-.01em;}
  .ap-session__meta{display:flex;gap:22px;flex-wrap:wrap;}
  .ap-session__meta div{display:flex;flex-direction:column;gap:3px;}
  .ap-session__meta dt{font-family:var(--font-mono);font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--steel-200);}
  .ap-session__meta dd{margin:0;font-family:var(--font-heading);font-weight:600;font-size:15px;color:#fff;}
  .ap-session__actions{display:flex;gap:12px;position:relative;}
  /* Generic card */
  .ap-card{background:var(--surface-raised);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);padding:20px;box-shadow:var(--shadow-md);}
  .ap-card__head{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;}
  .ap-card__title{font-family:var(--font-heading);font-weight:700;font-size:16px;color:var(--text-strong);}
  .ap-card__link{font-family:var(--font-mono);font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:var(--electric-300);cursor:pointer;}
  /* Progress bar */
  .ap-prog{display:flex;flex-direction:column;gap:8px;}
  .ap-prog__top{display:flex;justify-content:space-between;align-items:baseline;}
  .ap-prog__name{font-family:var(--font-heading);font-weight:600;font-size:14px;color:var(--text-strong);}
  .ap-prog__val{font-family:var(--font-mono);font-size:12px;color:var(--text-muted);}
  .ap-prog__track{height:8px;border-radius:var(--radius-pill);background:var(--ink-700);overflow:hidden;}
  .ap-prog__fill{height:100%;border-radius:var(--radius-pill);background:var(--grad-electric);}
  .ap-prog__fill--bolt{background:var(--grad-bolt);}
  /* Schedule list */
  .ap-sched{display:flex;flex-direction:column;}
  .ap-sched__row{display:flex;align-items:center;gap:14px;padding:13px 0;border-bottom:1px solid var(--border-subtle);}
  .ap-sched__row:last-child{border-bottom:0;}
  .ap-sched__day{width:46px;flex:none;text-align:center;}
  .ap-sched__day b{display:block;font-family:var(--font-display);font-weight:800;font-size:20px;color:var(--text-strong);line-height:1;}
  .ap-sched__day span{font-family:var(--font-mono);font-size:10px;text-transform:uppercase;letter-spacing:.08em;color:var(--text-muted);}
  .ap-sched__info{flex:1;}
  .ap-sched__info b{display:block;font-family:var(--font-heading);font-weight:600;font-size:14px;color:var(--text-strong);}
  .ap-sched__info span{font-size:12px;color:var(--text-muted);}
  /* Coach note */
  .ap-note{background:var(--surface-raised);border:1px solid var(--border-subtle);border-left:var(--bw-3) solid var(--bolt-400);border-radius:var(--radius-lg);padding:20px;}
  .ap-note__q{font-family:var(--font-body);font-style:italic;font-size:15px;line-height:1.55;color:var(--text-strong);}
  .ap-note__by{margin-top:12px;display:flex;align-items:center;gap:10px;font-family:var(--font-mono);font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:var(--text-muted);}
  /* Login */
  .ap-login{min-height:100vh;display:grid;place-items:center;background:var(--grad-arena);padding:24px;}
  .ap-login__card{width:400px;max-width:100%;background:var(--ink-850);border:1px solid var(--border-default);border-top:var(--bw-3) solid var(--bolt-400);border-radius:var(--radius-xl);box-shadow:var(--shadow-xl);padding:34px;}
  .ap-login__logo{height:46px;margin-bottom:22px;}
  .ap-login__title{font-family:var(--font-display);font-weight:800;text-transform:uppercase;font-size:30px;color:#fff;line-height:.95;margin-bottom:6px;}
  .ap-login__sub{font-size:14px;color:var(--text-body);margin-bottom:22px;}
  .ap-login__form{display:flex;flex-direction:column;gap:14px;}
  .ap-login__row{display:flex;justify-content:space-between;align-items:center;font-size:12px;}
  .ap-login__row a{color:var(--electric-300);font-family:var(--font-mono);}
  .ap-pill-tabs{display:flex;gap:6px;background:var(--ink-800);padding:4px;border-radius:var(--radius-pill);margin-bottom:22px;}
  .ap-pill-tabs button{flex:1;border:0;background:transparent;color:var(--text-muted);font-family:var(--font-heading);font-weight:600;font-size:13px;text-transform:uppercase;letter-spacing:.04em;padding:8px;border-radius:var(--radius-pill);cursor:pointer;}
  .ap-pill-tabs button.is-active{background:var(--electric-500);color:#fff;}
  @media(max-width:880px){.ap{grid-template-columns:1fr;}.ap-side{display:none;}.ap-row--hero,.ap-row--3,.ap-row--4{grid-template-columns:1fr;}}
  `);
  const cx = (...a) => a.filter(Boolean).join(" ");
  function ProgressBar({
    name,
    value,
    max = 100,
    label,
    accent = "electric"
  }) {
    const pct = Math.min(100, Math.round(value / max * 100));
    return /*#__PURE__*/React.createElement("div", {
      className: "ap-prog"
    }, /*#__PURE__*/React.createElement("div", {
      className: "ap-prog__top"
    }, /*#__PURE__*/React.createElement("span", {
      className: "ap-prog__name"
    }, name), /*#__PURE__*/React.createElement("span", {
      className: "ap-prog__val"
    }, label || pct + "%")), /*#__PURE__*/React.createElement("div", {
      className: "ap-prog__track"
    }, /*#__PURE__*/React.createElement("div", {
      className: cx("ap-prog__fill", accent === "bolt" && "ap-prog__fill--bolt"),
      style: {
        width: pct + "%"
      }
    })));
  }
  function NavItem({
    icon,
    label,
    active,
    onClick
  }) {
    return /*#__PURE__*/React.createElement("div", {
      className: cx("ap-nav__item", active && "is-active"),
      onClick: onClick
    }, /*#__PURE__*/React.createElement(Icon, {
      name: icon
    }), " ", label);
  }
  Object.assign(window, {
    ProgressBar,
    NavItem
  });
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/athlete-portal/portal.jsx", error: String((e && e.message) || e) }); }

// ui_kits/athlete-portal/screens.jsx
try { (() => {
/* Power Source — Athlete Portal screens. */

const P_LOGO = "../../assets/logo/logo-reversed.png";
const NAV_ITEMS = [{
  id: "dashboard",
  icon: "layout-dashboard",
  label: "Dashboard"
}, {
  id: "program",
  icon: "list-checks",
  label: "My Program"
}, {
  id: "progress",
  icon: "trending-up",
  label: "Progress"
}, {
  id: "schedule",
  icon: "calendar-days",
  label: "Schedule"
}, {
  id: "profile",
  icon: "user",
  label: "Profile"
}];
function Sidebar({
  view,
  setView
}) {
  return /*#__PURE__*/React.createElement("aside", {
    className: "ap-side"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ap-side__logo"
  }, /*#__PURE__*/React.createElement("img", {
    src: P_LOGO,
    alt: "Power Source"
  })), /*#__PURE__*/React.createElement("nav", {
    className: "ap-nav"
  }, NAV_ITEMS.map(n => /*#__PURE__*/React.createElement(NavItem, {
    key: n.id,
    icon: n.icon,
    label: n.label,
    active: view === n.id,
    onClick: () => setView(n.id)
  }))), /*#__PURE__*/React.createElement("div", {
    className: "ap-side__spacer"
  }), /*#__PURE__*/React.createElement("div", {
    className: "ap-coach"
  }, /*#__PURE__*/React.createElement(Avatar, {
    name: "Coach Jim",
    accent: "bolt"
  }), /*#__PURE__*/React.createElement("div", {
    className: "ap-coach__meta"
  }, /*#__PURE__*/React.createElement("b", null, "Coach Jim"), /*#__PURE__*/React.createElement("span", null, "Your trainer"))));
}
function Topbar({
  title,
  onLogout
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "ap-top"
  }, /*#__PURE__*/React.createElement("h1", {
    className: "ap-top__title"
  }, title), /*#__PURE__*/React.createElement("div", {
    className: "ap-top__right"
  }, /*#__PURE__*/React.createElement("span", {
    className: "ap-streak"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "flame"
  }), " 14-day streak"), /*#__PURE__*/React.createElement(Avatar, {
    name: "Jordan Vega"
  }), /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    onClick: onLogout,
    size: "md"
  }, "Log out")));
}
function SectionLabel({
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "ap-label"
  }, children);
}
function DashboardView() {
  return /*#__PURE__*/React.createElement("div", {
    className: "ap-content"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(SectionLabel, null, "Tuesday \xB7 June 9"), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: 800,
      textTransform: "uppercase",
      fontSize: 30,
      color: "var(--text-strong)",
      lineHeight: .95,
      letterSpacing: "-.01em"
    }
  }, "Welcome back, ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--bolt-400)"
    }
  }, "Jordan"))), /*#__PURE__*/React.createElement("div", {
    className: "ap-row ap-row--hero"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ap-session"
  }, /*#__PURE__*/React.createElement("span", {
    className: "ap-session__when"
  }, "Next Session \xB7 Today 4:30 PM"), /*#__PURE__*/React.createElement("div", {
    className: "ap-session__focus"
  }, "Speed & Explosiveness"), /*#__PURE__*/React.createElement("dl", {
    className: "ap-session__meta"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("dt", null, "Coach"), /*#__PURE__*/React.createElement("dd", null, "Coach Jim")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("dt", null, "Block"), /*#__PURE__*/React.createElement("dd", null, "Week 4 \xB7 Lower")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("dt", null, "Duration"), /*#__PURE__*/React.createElement("dd", null, "60 min"))), /*#__PURE__*/React.createElement("div", {
    className: "ap-session__actions"
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "bolt"
  }, "Check In"), /*#__PURE__*/React.createElement(Button, {
    variant: "ghost"
  }, "View Plan"))), /*#__PURE__*/React.createElement("div", {
    className: "ap-row",
    style: {
      gridTemplateColumns: "1fr",
      gap: 18
    }
  }, /*#__PURE__*/React.createElement(StatTile, {
    accent: "electric",
    eyebrow: "Sessions",
    value: "38",
    caption: "this season"
  }), /*#__PURE__*/React.createElement(StatTile, {
    accent: "bolt",
    eyebrow: "Attendance",
    value: "96",
    unit: "%",
    caption: "last 30 days"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "ap-row ap-row--3"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ap-card",
    style: {
      gridColumn: "span 2"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "ap-card__head"
  }, /*#__PURE__*/React.createElement("span", {
    className: "ap-card__title"
  }, "Performance vs. baseline"), /*#__PURE__*/React.createElement("span", {
    className: "ap-card__link"
  }, "View all")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(ProgressBar, {
    name: "40-yd dash",
    value: 78,
    label: "\u22120.34s",
    accent: "bolt"
  }), /*#__PURE__*/React.createElement(ProgressBar, {
    name: "Vertical jump",
    value: 64,
    label: "+4.2 in"
  }), /*#__PURE__*/React.createElement(ProgressBar, {
    name: "Back squat",
    value: 88,
    label: "+38%",
    accent: "bolt"
  }), /*#__PURE__*/React.createElement(ProgressBar, {
    name: "Conditioning",
    value: 52,
    label: "+12%"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "ap-note"
  }, /*#__PURE__*/React.createElement("p", {
    className: "ap-note__q"
  }, "\"Great work holding form on your last set, Jordan. Drive those knees on sprints this week \u2014 you're close to a PR.\""), /*#__PURE__*/React.createElement("div", {
    className: "ap-note__by"
  }, /*#__PURE__*/React.createElement(Avatar, {
    name: "Coach Jim",
    accent: "bolt"
  }), " Coach Jim \xB7 2 days ago"))), /*#__PURE__*/React.createElement("div", {
    className: "ap-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ap-card__head"
  }, /*#__PURE__*/React.createElement("span", {
    className: "ap-card__title"
  }, "This week"), /*#__PURE__*/React.createElement("span", {
    className: "ap-card__link"
  }, "Full schedule")), /*#__PURE__*/React.createElement("div", {
    className: "ap-sched"
  }, [{
    d: "TUE",
    n: "9",
    t: "Speed & Explosiveness",
    s: "4:30 PM · Coach Jim",
    b: "bolt"
  }, {
    d: "THU",
    n: "11",
    t: "Upper Strength",
    s: "4:30 PM · Coach Mia",
    b: "electric"
  }, {
    d: "SAT",
    n: "13",
    t: "Team Conditioning",
    s: "9:00 AM · Group",
    b: "electric"
  }].map(r => /*#__PURE__*/React.createElement("div", {
    className: "ap-sched__row",
    key: r.n
  }, /*#__PURE__*/React.createElement("div", {
    className: "ap-sched__day"
  }, /*#__PURE__*/React.createElement("b", null, r.n), /*#__PURE__*/React.createElement("span", null, r.d)), /*#__PURE__*/React.createElement("div", {
    className: "ap-sched__info"
  }, /*#__PURE__*/React.createElement("b", null, r.t), /*#__PURE__*/React.createElement("span", null, r.s)), /*#__PURE__*/React.createElement(Badge, {
    variant: r.b === "bolt" ? "bolt" : "steel"
  }, r.b === "bolt" ? "Today" : "Booked"))))));
}
function ProgramView() {
  const blocks = [{
    title: "Dynamic Warm-up",
    meta: "8 min · mobility",
    done: true
  }, {
    title: "Sprint Mechanics",
    meta: "4 × 20yd · full recovery",
    done: true
  }, {
    title: "Trap-bar Deadlift",
    meta: "5 × 3 @ RPE 7",
    done: false
  }, {
    title: "Box Jumps",
    meta: "4 × 4 · reset each rep",
    done: false
  }, {
    title: "Sled Pushes",
    meta: "6 × 15yd",
    done: false
  }, {
    title: "Core Finisher",
    meta: "3 rounds",
    done: false
  }];
  return /*#__PURE__*/React.createElement("div", {
    className: "ap-content"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ap-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ap-card__head"
  }, /*#__PURE__*/React.createElement("span", {
    className: "ap-card__title"
  }, "Week 4 \xB7 Lower Power"), /*#__PURE__*/React.createElement(Badge, {
    variant: "electric",
    dot: true
  }, "In progress")), /*#__PURE__*/React.createElement(ProgressBar, {
    name: "Today's plan",
    value: 2,
    max: 6,
    label: "2 / 6 done"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      marginTop: 18
    }
  }, blocks.map((b, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    className: "ap-sched__row",
    style: {
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 26,
      height: 26,
      borderRadius: "50%",
      flex: "none",
      display: "grid",
      placeItems: "center",
      background: b.done ? "var(--success)" : "transparent",
      border: b.done ? "0" : "2px solid var(--border-strong)",
      color: "#fff"
    }
  }, b.done && /*#__PURE__*/React.createElement(Icon, {
    name: "check"
  })), /*#__PURE__*/React.createElement("div", {
    className: "ap-sched__info"
  }, /*#__PURE__*/React.createElement("b", {
    style: {
      color: b.done ? "var(--text-muted)" : "var(--text-strong)",
      textDecoration: b.done ? "line-through" : "none"
    }
  }, b.title), /*#__PURE__*/React.createElement("span", null, b.meta)), !b.done && /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    size: "md"
  }, "Log"))))));
}
function ProgressView() {
  return /*#__PURE__*/React.createElement("div", {
    className: "ap-content"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ap-row ap-row--4"
  }, /*#__PURE__*/React.createElement(StatTile, {
    accent: "bolt",
    eyebrow: "40-yd dash",
    value: "5.21",
    unit: "s",
    caption: "\u25BC from 5.55"
  }), /*#__PURE__*/React.createElement(StatTile, {
    accent: "electric",
    eyebrow: "Vertical",
    value: "26.4",
    unit: "in",
    caption: "\u25B2 from 22.2"
  }), /*#__PURE__*/React.createElement(StatTile, {
    accent: "bolt",
    eyebrow: "Back squat",
    value: "245",
    unit: "lb",
    caption: "\u25B2 from 178"
  }), /*#__PURE__*/React.createElement(StatTile, {
    accent: "electric",
    eyebrow: "Broad jump",
    value: "8'2",
    caption: "\u25B2 from 7'5"
  })), /*#__PURE__*/React.createElement("div", {
    className: "ap-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ap-card__head"
  }, /*#__PURE__*/React.createElement("span", {
    className: "ap-card__title"
  }, "Season trend"), /*#__PURE__*/React.createElement("span", {
    className: "ap-card__link"
  }, "Export")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "flex-end",
      gap: 10,
      height: 160,
      padding: "8px 0"
    }
  }, [40, 52, 48, 63, 60, 72, 78, 75, 84, 88, 92].map((h, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      flex: 1,
      height: h + "%",
      borderRadius: "4px 4px 0 0",
      background: i === 10 ? "var(--bolt-400)" : "var(--electric-500)",
      opacity: i === 10 ? 1 : .55 + i * .03
    }
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: 11,
      color: "var(--text-muted)",
      letterSpacing: ".04em"
    }
  }, "Composite performance index \xB7 last 11 sessions")));
}
function Login({
  onAuth
}) {
  const [tab, setTab] = React.useState("login");
  React.useEffect(() => {
    if (window.lucide) window.lucide.createIcons();
  });
  return /*#__PURE__*/React.createElement("div", {
    className: "ap-login"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ap-login__card"
  }, /*#__PURE__*/React.createElement("img", {
    className: "ap-login__logo",
    src: P_LOGO,
    alt: "Power Source"
  }), /*#__PURE__*/React.createElement("div", {
    className: "ap-pill-tabs"
  }, /*#__PURE__*/React.createElement("button", {
    className: tab === "login" ? "is-active" : "",
    onClick: () => setTab("login")
  }, "Member Login"), /*#__PURE__*/React.createElement("button", {
    className: tab === "join" ? "is-active" : "",
    onClick: () => setTab("join")
  }, "New Athlete")), /*#__PURE__*/React.createElement("h2", {
    className: "ap-login__title"
  }, tab === "login" ? "Welcome back" : "Join the team"), /*#__PURE__*/React.createElement("p", {
    className: "ap-login__sub"
  }, tab === "login" ? "Log in to see today's plan and your progress." : "Create your athlete profile to get started."), /*#__PURE__*/React.createElement("form", {
    className: "ap-login__form",
    onSubmit: e => {
      e.preventDefault();
      onAuth();
    }
  }, tab === "join" && /*#__PURE__*/React.createElement(Input, {
    label: "Athlete name",
    required: true,
    placeholder: "First & last"
  }), /*#__PURE__*/React.createElement(Input, {
    label: "Email",
    required: true,
    type: "email",
    placeholder: "you@email.com",
    defaultValue: "jordan@email.com"
  }), /*#__PURE__*/React.createElement(Input, {
    label: "Password",
    required: true,
    type: "password",
    placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022",
    defaultValue: "powersource"
  }), /*#__PURE__*/React.createElement("div", {
    className: "ap-login__row"
  }, /*#__PURE__*/React.createElement("span", null), /*#__PURE__*/React.createElement("a", {
    href: "#"
  }, "Forgot password?")), /*#__PURE__*/React.createElement(Button, {
    variant: "bolt",
    fullWidth: true,
    type: "submit"
  }, tab === "login" ? "Log In" : "Create Account"))));
}
Object.assign(window, {
  Sidebar,
  Topbar,
  DashboardView,
  ProgramView,
  ProgressView,
  Login,
  NAV_ITEMS
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/athlete-portal/screens.jsx", error: String((e && e.message) || e) }); }

// ui_kits/marketing-site/image-slot.js
try { (() => {
// @ds-adherence-ignore -- omelette starter scaffold (raw elements/hex/px by design)
/* BEGIN USAGE */
/**
 * <image-slot> — user-fillable image placeholder.
 *
 * Drop this into a deck, mockup, or page wherever you want the user to
 * supply an image. You control the slot's shape and size; the user fills it
 * by dragging an image file onto it (or clicking to browse). The dropped
 * image persists across reloads via a .image-slots.state.json sidecar —
 * same read-via-fetch / write-via-window.omelette pattern as
 * design_canvas.jsx, so the filled slot shows on share links, downloaded
 * zips, and PPTX export. Outside the omelette runtime the slot is read-only.
 *
 * The host bridge only allows sidecar writes at the project root, so the
 * HTML that uses this component is assumed to live at the project root too
 * (same constraint as design_canvas.jsx).
 *
 * Attributes:
 *   id           Persistence key. REQUIRED for the drop to survive reload —
 *                every slot on the page needs a distinct id.
 *   shape        'rect' | 'rounded' | 'circle' | 'pill'   (default 'rounded')
 *                'circle' applies 50% border-radius; on a non-square slot
 *                that's an ellipse — set equal width and height for a true
 *                circle.
 *   radius       Corner radius in px for 'rounded'.       (default 12)
 *   mask         Any CSS clip-path value. Overrides `shape` — use this for
 *                hexagons, blobs, arbitrary polygons.
 *   fit          object-fit: cover | contain | fill.       (default 'cover')
 *                With cover (the default) double-clicking the filled slot
 *                enters a reframe mode: the whole image spills past the mask
 *                (translucent outside, opaque inside), drag to reposition,
 *                corner-drag to scale. The crop persists alongside the image
 *                in the sidecar. contain/fill stay static.
 *   position     object-position for fit=contain|fill.     (default '50% 50%')
 *   placeholder  Empty-state caption.                      (default 'Drop an image')
 *   src          Optional initial/fallback image URL. A user drop overrides
 *                it; clearing the drop reveals src again.
 *
 * Size and layout come from ordinary CSS on the element — width/height
 * inline or from a parent grid — so it composes with any layout.
 *
 * Usage:
 *   <image-slot id="hero"   style="width:800px;height:450px" shape="rounded" radius="20"
 *               placeholder="Drop a hero image"></image-slot>
 *   <image-slot id="avatar" style="width:120px;height:120px" shape="circle"></image-slot>
 *   <image-slot id="kite"   style="width:300px;height:300px"
 *               mask="polygon(50% 0, 100% 50%, 50% 100%, 0 50%)"></image-slot>
 */
/* END USAGE */

(() => {
  const STATE_FILE = '.image-slots.state.json';
  // 2× a ~600px slot in a 1920-wide deck — retina-sharp without making the
  // sidecar enormous. A 1200px WebP at q=0.85 is ~150-300KB.
  const MAX_DIM = 1200;
  // Raster formats only. SVG is excluded (can carry script; createImageBitmap
  // on SVG blobs is inconsistent). GIF is excluded because the canvas
  // re-encode keeps only the first frame, so an animated GIF would silently
  // go still — better to reject than surprise.
  const ACCEPT = ['image/png', 'image/jpeg', 'image/webp', 'image/avif'];

  // ── Shared sidecar store ────────────────────────────────────────────────
  // One fetch + immediate write-on-change for every <image-slot> on the
  // page. Reads via fetch() so viewing works anywhere the HTML and sidecar
  // are served together; writes go through window.omelette.writeFile, which
  // the host allowlists to *.state.json basenames only.
  const subs = new Set();
  let slots = {};
  // ids explicitly cleared before the sidecar fetch resolved — otherwise
  // the merge below can't tell "never set" from "just deleted" and would
  // resurrect the sidecar's stale value.
  const tombstones = new Set();
  let loaded = false;
  let loadP = null;
  function load() {
    if (loadP) return loadP;
    loadP = fetch(STATE_FILE).then(r => r.ok ? r.json() : null).then(j => {
      // Merge: sidecar loses to any in-memory change that raced ahead of
      // the fetch (drop or clear) so neither is clobbered by hydration.
      if (j && typeof j === 'object') {
        const merged = Object.assign({}, j, slots);
        // A framing-only write that raced ahead of hydration must not
        // drop a user image that's only on disk — inherit u from the
        // sidecar for any in-memory entry that lacks one.
        for (const k in slots) {
          if (merged[k] && !merged[k].u && j[k]) {
            merged[k].u = typeof j[k] === 'string' ? j[k] : j[k].u;
          }
        }
        for (const id of tombstones) delete merged[id];
        slots = merged;
      }
      tombstones.clear();
    }).catch(() => {}).then(() => {
      loaded = true;
      subs.forEach(fn => fn());
    });
    return loadP;
  }

  // Serialize writes so two near-simultaneous drops on different slots
  // can't reorder at the backend and leave the sidecar with only the
  // first. A save requested mid-flight just marks dirty and re-fires on
  // completion with the then-current slots.
  let saving = false;
  let saveDirty = false;
  function save() {
    if (saving) {
      saveDirty = true;
      return;
    }
    const w = window.omelette && window.omelette.writeFile;
    if (!w) return;
    saving = true;
    Promise.resolve(w(STATE_FILE, JSON.stringify(slots))).catch(() => {}).then(() => {
      saving = false;
      if (saveDirty) {
        saveDirty = false;
        save();
      }
    });
  }
  const S_MAX = 5;
  const clampS = s => Math.max(1, Math.min(S_MAX, s));

  // Normalize a stored slot value. Pre-reframe sidecars stored a bare
  // data-URL string; newer ones store {u, s, x, y}. Either shape is valid.
  function getSlot(id) {
    const v = slots[id];
    if (!v) return null;
    return typeof v === 'string' ? {
      u: v,
      s: 1,
      x: 0,
      y: 0
    } : v;
  }
  function setSlot(id, val) {
    if (!id) return;
    if (val) {
      slots[id] = val;
      tombstones.delete(id);
    } else {
      delete slots[id];
      if (!loaded) tombstones.add(id);
    }
    subs.forEach(fn => fn());
    // A drop is rare + high-value — write immediately so nav-away can't lose
    // it. Gate on the initial read so we don't overwrite a sidecar we haven't
    // merged yet; the merge in load() keeps this change once the read lands.
    if (loaded) save();else load().then(save);
  }

  // ── Image downscale ─────────────────────────────────────────────────────
  // Encode through a canvas so the sidecar carries resized bytes, not the
  // raw upload. Longest side is capped at 2× the slot's rendered width
  // (retina) and at MAX_DIM. WebP keeps alpha and is ~10× smaller than PNG
  // for photos, so there's no need for per-image format picking.
  async function toDataUrl(file, targetW) {
    const bitmap = await createImageBitmap(file);
    try {
      const cap = Math.min(MAX_DIM, Math.max(1, Math.round(targetW * 2)) || MAX_DIM);
      const scale = Math.min(1, cap / Math.max(bitmap.width, bitmap.height));
      const w = Math.max(1, Math.round(bitmap.width * scale));
      const h = Math.max(1, Math.round(bitmap.height * scale));
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      canvas.getContext('2d').drawImage(bitmap, 0, 0, w, h);
      return canvas.toDataURL('image/webp', 0.85);
    } finally {
      bitmap.close && bitmap.close();
    }
  }

  // ── Custom element ──────────────────────────────────────────────────────
  const stylesheet = ':host{display:inline-block;position:relative;vertical-align:top;' + '  font:13px/1.3 system-ui,-apple-system,sans-serif;color:rgba(0,0,0,.55);width:240px;height:160px}' + '.frame{position:absolute;inset:0;overflow:hidden;background:rgba(0,0,0,.04)}' +
  // .frame img (clipped) and .spill (unclipped ghost + handles) share the
  // same left/top/width/height in frame-%, computed by _applyView(), so the
  // inside-mask crop and the outside-mask spill stay pixel-aligned.
  '.frame img{position:absolute;max-width:none;transform:translate(-50%,-50%);' + '  -webkit-user-drag:none;user-select:none;touch-action:none}' +
  // Reframe mode (double-click): the full image spills past the mask. The
  // spill layer is sized to the IMAGE bounds so its corners are where the
  // resize handles belong. The ghost <img> inside is translucent; the real
  // clipped <img> underneath shows the opaque in-mask crop.
  '.spill{position:absolute;transform:translate(-50%,-50%);display:none;z-index:1;' + '  cursor:grab;touch-action:none}' + ':host([data-panning]) .spill{cursor:grabbing}' + '.spill .ghost{position:absolute;inset:0;width:100%;height:100%;opacity:.35;' + '  pointer-events:none;-webkit-user-drag:none;user-select:none;' + '  box-shadow:0 0 0 1px rgba(0,0,0,.2),0 12px 32px rgba(0,0,0,.2)}' + '.spill .handle{position:absolute;width:12px;height:12px;border-radius:50%;' + '  background:#fff;box-shadow:0 0 0 1.5px #c96442,0 1px 3px rgba(0,0,0,.3);' + '  transform:translate(-50%,-50%)}' + '.spill .handle[data-c=nw]{left:0;top:0;cursor:nwse-resize}' + '.spill .handle[data-c=ne]{left:100%;top:0;cursor:nesw-resize}' + '.spill .handle[data-c=sw]{left:0;top:100%;cursor:nesw-resize}' + '.spill .handle[data-c=se]{left:100%;top:100%;cursor:nwse-resize}' + ':host([data-reframe]){z-index:10}' + ':host([data-reframe]) .spill{display:block}' + ':host([data-reframe]) .frame{box-shadow:0 0 0 2px #c96442}' + '.empty{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;' + '  justify-content:center;gap:6px;text-align:center;padding:12px;box-sizing:border-box;' + '  cursor:pointer;user-select:none}' + '.empty svg{opacity:.45}' + '.empty .cap{max-width:90%;font-weight:500;letter-spacing:.01em}' + '.empty .sub{font-size:11px}' + '.empty .sub u{text-underline-offset:2px;text-decoration-color:rgba(0,0,0,.25)}' + '.empty:hover .sub u{color:rgba(0,0,0,.75);text-decoration-color:currentColor}' + ':host([data-over]) .frame{outline:2px solid #c96442;outline-offset:-2px;' + '  background:rgba(201,100,66,.10)}' + '.ring{position:absolute;inset:0;pointer-events:none;border:1.5px dashed rgba(0,0,0,.25);' + '  transition:border-color .12s}' + ':host([data-over]) .ring{border-color:#c96442}' + ':host([data-filled]) .ring{display:none}' +
  // Controls sit BELOW the mask (top:100%), absolutely positioned so the
  // author-declared slot height is unaffected. The gap is padding, not a
  // top offset, so the hover target stays contiguous with the frame.
  '.ctl{position:absolute;top:100%;left:50%;transform:translateX(-50%);padding-top:8px;' + '  display:flex;gap:6px;opacity:0;pointer-events:none;transition:opacity .12s;z-index:2;' + '  white-space:nowrap}' + ':host([data-filled][data-editable]:hover) .ctl,:host([data-reframe]) .ctl' + '  {opacity:1;pointer-events:auto}' + '.ctl button{appearance:none;border:0;border-radius:6px;padding:5px 10px;cursor:pointer;' + '  background:rgba(0,0,0,.65);color:#fff;font:11px/1 system-ui,-apple-system,sans-serif;' + '  backdrop-filter:blur(6px)}' + '.ctl button:hover{background:rgba(0,0,0,.8)}' + '.err{position:absolute;left:8px;bottom:8px;right:8px;color:#b3261e;font-size:11px;' + '  background:rgba(255,255,255,.85);padding:4px 6px;border-radius:5px;pointer-events:none}';
  const icon = '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' + 'stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' + '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>' + '<path d="m21 15-5-5L5 21"/></svg>';
  class ImageSlot extends HTMLElement {
    static get observedAttributes() {
      return ['shape', 'radius', 'mask', 'fit', 'position', 'placeholder', 'src', 'id'];
    }
    constructor() {
      super();
      const root = this.attachShadow({
        mode: 'open'
      });
      // .spill and .ctl sit OUTSIDE .frame so overflow:hidden + border-radius
      // on the frame (circle, pill, rounded) can't clip them.
      root.innerHTML = '<style>' + stylesheet + '</style>' + '<div class="frame" part="frame">' + '  <img part="image" alt="" draggable="false" style="display:none">' + '  <div class="empty" part="empty">' + icon + '    <div class="cap"></div>' + '    <div class="sub">or <u>browse files</u></div></div>' + '  <div class="ring" part="ring"></div>' + '</div>' + '<div class="spill">' + '  <img class="ghost" alt="" draggable="false">' + '  <div class="handle" data-c="nw"></div><div class="handle" data-c="ne"></div>' + '  <div class="handle" data-c="sw"></div><div class="handle" data-c="se"></div>' + '</div>' + '<div class="ctl"><button data-act="replace" title="Replace image">Replace</button>' + '  <button data-act="clear" title="Remove image">Remove</button></div>' + '<input type="file" accept="' + ACCEPT.join(',') + '" hidden>';
      this._frame = root.querySelector('.frame');
      this._ring = root.querySelector('.ring');
      this._img = root.querySelector('.frame img');
      this._empty = root.querySelector('.empty');
      this._cap = root.querySelector('.cap');
      this._sub = root.querySelector('.sub');
      this._spill = root.querySelector('.spill');
      this._ghost = root.querySelector('.ghost');
      this._err = null;
      this._input = root.querySelector('input');
      this._depth = 0;
      this._gen = 0;
      this._view = {
        s: 1,
        x: 0,
        y: 0
      };
      this._subFn = () => this._render();
      // Shadow-DOM listeners live with the shadow DOM — bound once here so
      // disconnect/reconnect (e.g. React remount) doesn't stack handlers.
      this._empty.addEventListener('click', () => this._input.click());
      root.addEventListener('click', e => {
        const act = e.target && e.target.getAttribute && e.target.getAttribute('data-act');
        if (act === 'replace') {
          this._exitReframe(true);
          this._input.click();
        }
        if (act === 'clear') {
          this._exitReframe(false);
          this._gen++;
          this._local = null;
          if (this.id) setSlot(this.id, null);else this._render();
        }
      });
      this._input.addEventListener('change', () => {
        const f = this._input.files && this._input.files[0];
        if (f) this._ingest(f);
        this._input.value = '';
      });
      // naturalWidth/Height aren't known until load — re-apply so the cover
      // baseline is computed from real dimensions, not the 100%×100% fallback.
      this._img.addEventListener('load', () => this._applyView());
      // Gated on editable + fit=cover so share links and contain/fill slots
      // stay static.
      this.addEventListener('dblclick', e => {
        if (!this.hasAttribute('data-editable') || !this._reframes()) return;
        e.preventDefault();
        if (this.hasAttribute('data-reframe')) this._exitReframe(true);else this._enterReframe();
      });
      // Pan + resize both originate on the spill layer. A handle pointerdown
      // drives an aspect-locked resize anchored at the opposite corner; any
      // other pointerdown on the spill pans. Offsets are frame-% so a
      // reframed slot survives responsive resize / PPTX export.
      this._spill.addEventListener('pointerdown', e => {
        if (e.button !== 0 || !this.hasAttribute('data-reframe')) return;
        e.preventDefault();
        e.stopPropagation();
        this._spill.setPointerCapture(e.pointerId);
        const rect = this.getBoundingClientRect();
        const fw = rect.width || 1,
          fh = rect.height || 1;
        const corner = e.target.getAttribute && e.target.getAttribute('data-c');
        let move;
        if (corner) {
          // Resize about the OPPOSITE corner. Viewport-px throughout (rect
          // fw/fh, not clientWidth) so the math survives a transform:scale()
          // ancestor — deck_stage renders slides scaled-to-fit.
          const iw = this._img.naturalWidth || 1,
            ih = this._img.naturalHeight || 1;
          const base = Math.max(fw / iw, fh / ih);
          const sx = corner.includes('e') ? 1 : -1;
          const sy = corner.includes('s') ? 1 : -1;
          const s0 = this._view.s;
          const w0 = iw * base * s0,
            h0 = ih * base * s0;
          const cx0 = (50 + this._view.x) / 100 * fw;
          const cy0 = (50 + this._view.y) / 100 * fh;
          const ox = cx0 - sx * w0 / 2,
            oy = cy0 - sy * h0 / 2;
          const diag0 = Math.hypot(w0, h0);
          const ux = sx * w0 / diag0,
            uy = sy * h0 / diag0;
          move = ev => {
            const proj = (ev.clientX - rect.left - ox) * ux + (ev.clientY - rect.top - oy) * uy;
            const s = clampS(s0 * proj / diag0);
            const d = diag0 * s / s0;
            this._view.s = s;
            this._view.x = (ox + ux * d / 2) / fw * 100 - 50;
            this._view.y = (oy + uy * d / 2) / fh * 100 - 50;
            this._clampView();
            this._applyView();
          };
        } else {
          this.setAttribute('data-panning', '');
          const start = {
            px: e.clientX,
            py: e.clientY,
            x: this._view.x,
            y: this._view.y
          };
          move = ev => {
            this._view.x = start.x + (ev.clientX - start.px) / fw * 100;
            this._view.y = start.y + (ev.clientY - start.py) / fh * 100;
            this._clampView();
            this._applyView();
          };
        }
        const up = () => {
          try {
            this._spill.releasePointerCapture(e.pointerId);
          } catch {}
          this._spill.removeEventListener('pointermove', move);
          this._spill.removeEventListener('pointerup', up);
          this._spill.removeEventListener('pointercancel', up);
          this.removeAttribute('data-panning');
          this._dragUp = null;
        };
        // Stashed so _exitReframe (Escape / outside-click mid-drag) can
        // tear the capture + listeners down synchronously.
        this._dragUp = up;
        this._spill.addEventListener('pointermove', move);
        this._spill.addEventListener('pointerup', up);
        this._spill.addEventListener('pointercancel', up);
      });
      // Wheel zoom stays available inside reframe mode as a trackpad nicety —
      // zooms toward the cursor (offset' = cursor·(1-k) + offset·k).
      this.addEventListener('wheel', e => {
        if (!this.hasAttribute('data-reframe')) return;
        e.preventDefault();
        const r = this.getBoundingClientRect();
        const cx = (e.clientX - r.left) / r.width * 100 - 50;
        const cy = (e.clientY - r.top) / r.height * 100 - 50;
        const prev = this._view.s;
        const next = clampS(prev * Math.pow(1.0015, -e.deltaY));
        if (next === prev) return;
        const k = next / prev;
        this._view.s = next;
        this._view.x = cx * (1 - k) + this._view.x * k;
        this._view.y = cy * (1 - k) + this._view.y * k;
        this._clampView();
        this._applyView();
      }, {
        passive: false
      });
    }
    connectedCallback() {
      // Warn once per page — an id-less slot works for the session but
      // cannot persist, and two id-less slots would share nothing.
      if (!this.id && !ImageSlot._warned) {
        ImageSlot._warned = true;
        console.warn('<image-slot> without an id will not persist its dropped image.');
      }
      this.addEventListener('dragenter', this);
      this.addEventListener('dragover', this);
      this.addEventListener('dragleave', this);
      this.addEventListener('drop', this);
      subs.add(this._subFn);
      // width%/height% in _applyView encode the frame aspect at call time —
      // a host resize (responsive grid, pane divider) would stretch the
      // image until the next _render. Re-render on size change: _render()
      // re-seeds _view from stored before clamp/apply, so a shrink→grow
      // cycle round-trips instead of ratcheting x/y toward the narrower
      // frame's clamp range.
      this._ro = new ResizeObserver(() => this._render());
      this._ro.observe(this);
      load();
      this._render();
    }
    disconnectedCallback() {
      subs.delete(this._subFn);
      this.removeEventListener('dragenter', this);
      this.removeEventListener('dragover', this);
      this.removeEventListener('dragleave', this);
      this.removeEventListener('drop', this);
      if (this._ro) {
        this._ro.disconnect();
        this._ro = null;
      }
      this._exitReframe(false);
    }
    _enterReframe() {
      if (this.hasAttribute('data-reframe')) return;
      this.setAttribute('data-reframe', '');
      this._applyView();
      // Close on click outside (the spill handler stopPropagation()s so
      // in-image drags don't reach this) and on Escape. Listeners are held
      // on the instance so _exitReframe / disconnectedCallback can detach
      // exactly what was attached.
      this._outside = e => {
        if (e.composedPath && e.composedPath().includes(this)) return;
        this._exitReframe(true);
      };
      this._esc = e => {
        if (e.key === 'Escape') this._exitReframe(true);
      };
      document.addEventListener('pointerdown', this._outside, true);
      document.addEventListener('keydown', this._esc, true);
    }
    _exitReframe(commit) {
      if (!this.hasAttribute('data-reframe')) return;
      if (this._dragUp) this._dragUp();
      this.removeAttribute('data-reframe');
      this.removeAttribute('data-panning');
      if (this._outside) document.removeEventListener('pointerdown', this._outside, true);
      if (this._esc) document.removeEventListener('keydown', this._esc, true);
      this._outside = this._esc = null;
      if (commit) this._commitView();
    }
    attributeChangedCallback() {
      if (this.shadowRoot) this._render();
    }

    // handleEvent — one listener object for all four drag events keeps the
    // add/remove symmetric and the depth counter correct.
    handleEvent(e) {
      if (e.type === 'dragenter' || e.type === 'dragover') {
        // Without preventDefault the browser never fires 'drop'.
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
        if (e.type === 'dragenter') this._depth++;
        this.setAttribute('data-over', '');
      } else if (e.type === 'dragleave') {
        // dragenter/leave fire for every descendant crossing — count depth
        // so hovering the icon inside the empty state doesn't flicker.
        if (--this._depth <= 0) {
          this._depth = 0;
          this.removeAttribute('data-over');
        }
      } else if (e.type === 'drop') {
        e.preventDefault();
        e.stopPropagation();
        this._depth = 0;
        this.removeAttribute('data-over');
        const f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
        if (f) this._ingest(f);
      }
    }
    async _ingest(file) {
      this._setError(null);
      if (!file || ACCEPT.indexOf(file.type) < 0) {
        this._setError('Drop a PNG, JPEG, WebP, or AVIF image.');
        return;
      }
      // toDataUrl can take hundreds of ms on a large photo. A Clear or a
      // newer drop during that window would be clobbered when this await
      // resumes — bump + capture a generation so stale encodes bail.
      const gen = ++this._gen;
      try {
        const w = this.clientWidth || this.offsetWidth || MAX_DIM;
        const url = await toDataUrl(file, w);
        if (gen !== this._gen) return;
        // Only exit reframe once the new image is in hand — a rejected type
        // or decode failure leaves the in-progress crop untouched.
        this._exitReframe(false);
        const val = {
          u: url,
          s: 1,
          x: 0,
          y: 0
        };
        setSlot(this.id || '', val);
        // Keep a session-local copy for id-less slots so the drop still
        // shows, even though it cannot persist.
        if (!this.id) {
          this._local = val;
          this._render();
        }
      } catch (err) {
        if (gen !== this._gen) return;
        this._setError('Could not read that image.');
        console.warn('<image-slot> ingest failed:', err);
      }
    }
    _setError(msg) {
      if (this._err) {
        this._err.remove();
        this._err = null;
      }
      if (!msg) return;
      const d = document.createElement('div');
      d.className = 'err';
      d.textContent = msg;
      this.shadowRoot.appendChild(d);
      this._err = d;
      setTimeout(() => {
        if (this._err === d) {
          d.remove();
          this._err = null;
        }
      }, 3000);
    }

    // Reframing (pan/resize) is only meaningful for fit=cover — contain/fill
    // keep the old object-fit path and double-click is a no-op.
    _reframes() {
      return this.hasAttribute('data-filled') && (this.getAttribute('fit') || 'cover') === 'cover';
    }

    // Cover-baseline geometry, shared by clamp/apply/resize. Null until the
    // img has loaded (naturalWidth is 0 before that) or when the slot has no
    // layout box — ResizeObserver fires with a 0×0 rect under display:none,
    // and clamping against a degenerate 1×1 frame would silently pull the
    // stored pan toward zero.
    _geom() {
      const iw = this._img.naturalWidth,
        ih = this._img.naturalHeight;
      const fw = this.clientWidth,
        fh = this.clientHeight;
      if (!iw || !ih || !fw || !fh) return null;
      return {
        iw,
        ih,
        fw,
        fh,
        base: Math.max(fw / iw, fh / ih)
      };
    }
    _clampView() {
      // Pan range on each axis is half the overflow past the frame edge.
      const g = this._geom();
      if (!g) return;
      const mx = Math.max(0, (g.iw * g.base * this._view.s / g.fw - 1) * 50);
      const my = Math.max(0, (g.ih * g.base * this._view.s / g.fh - 1) * 50);
      this._view.x = Math.max(-mx, Math.min(mx, this._view.x));
      this._view.y = Math.max(-my, Math.min(my, this._view.y));
    }
    _applyView() {
      const g = this._geom();
      const fit = this.getAttribute('fit') || 'cover';
      if (fit !== 'cover' || !g) {
        // Non-cover, or dimensions not known yet (before img load).
        this._img.style.width = '100%';
        this._img.style.height = '100%';
        this._img.style.left = '50%';
        this._img.style.top = '50%';
        this._img.style.objectFit = fit;
        this._img.style.objectPosition = this.getAttribute('position') || '50% 50%';
        return;
      }
      // Cover baseline: img fills the frame on its tighter axis at s=1, so
      // pan works immediately on the overflowing axis without zooming first.
      // Width/height and left/top are all frame-% — depends only on the
      // frame aspect ratio, so a responsive resize keeps the same crop. The
      // spill layer mirrors the same box so its corners = image corners.
      const k = g.base * this._view.s;
      const w = g.iw * k / g.fw * 100 + '%';
      const h = g.ih * k / g.fh * 100 + '%';
      const l = 50 + this._view.x + '%';
      const t = 50 + this._view.y + '%';
      this._img.style.width = w;
      this._img.style.height = h;
      this._img.style.left = l;
      this._img.style.top = t;
      this._img.style.objectFit = '';
      this._spill.style.width = w;
      this._spill.style.height = h;
      this._spill.style.left = l;
      this._spill.style.top = t;
    }
    _commitView() {
      const v = {
        s: this._view.s,
        x: this._view.x,
        y: this._view.y
      };
      if (this._userUrl) v.u = this._userUrl;
      // Framing-only (no u) persists too so an author-src slot remembers its
      // crop; clearing the sidecar still falls through to src=.
      if (this.id) setSlot(this.id, v);else {
        this._local = v;
      }
    }
    _render() {
      // Shape / mask. Presets use border-radius so the dashed ring can
      // follow the rounded outline; clip-path is only applied for an
      // explicit `mask` (the ring is hidden there since a rectangle
      // dashed border chopped by an arbitrary polygon looks broken).
      const mask = this.getAttribute('mask');
      const shape = (this.getAttribute('shape') || 'rounded').toLowerCase();
      let radius = '';
      if (shape === 'circle') radius = '50%';else if (shape === 'pill') radius = '9999px';else if (shape === 'rounded') {
        const n = parseFloat(this.getAttribute('radius'));
        radius = (Number.isFinite(n) ? n : 12) + 'px';
      }
      this._frame.style.borderRadius = mask ? '' : radius;
      this._frame.style.clipPath = mask || '';
      this._ring.style.borderRadius = mask ? '' : radius;
      this._ring.style.display = mask ? 'none' : '';

      // Controls and reframe entry gate on this so share links stay read-only.
      const editable = !!(window.omelette && window.omelette.writeFile);
      this.toggleAttribute('data-editable', editable);
      this._sub.style.display = editable ? '' : 'none';

      // Content. The sidecar is also writable by the agent's write_file
      // tool, so its value isn't guaranteed canvas-originated — only accept
      // data:image/ URLs from it. The `src` attribute is author-controlled
      // (Claude wrote it into the HTML) so it passes through unchanged.
      let stored = this.id ? getSlot(this.id) : this._local;
      if (stored && stored.u && !/^data:image\//i.test(stored.u)) stored = null;
      const srcAttr = this.getAttribute('src') || '';
      this._userUrl = stored && stored.u || null;
      const url = this._userUrl || srcAttr;
      // Don't clobber an in-flight reframe with a store-triggered re-render.
      if (!this.hasAttribute('data-reframe')) {
        this._view = {
          s: stored && Number.isFinite(stored.s) ? clampS(stored.s) : 1,
          x: stored && Number.isFinite(stored.x) ? stored.x : 0,
          y: stored && Number.isFinite(stored.y) ? stored.y : 0
        };
      }
      this._cap.textContent = this.getAttribute('placeholder') || 'Drop an image';
      // Toggle via style.display — the [hidden] attribute alone loses to
      // the display:flex / display:block rules in the stylesheet above.
      if (url) {
        if (this._img.getAttribute('src') !== url) {
          this._img.src = url;
          this._ghost.src = url;
        }
        this._img.style.display = 'block';
        this._empty.style.display = 'none';
        this.setAttribute('data-filled', '');
        this._clampView();
        this._applyView();
      } else {
        this._img.style.display = 'none';
        this._img.removeAttribute('src');
        this._ghost.removeAttribute('src');
        this._empty.style.display = 'flex';
        this.removeAttribute('data-filled');
      }
    }
  }
  if (!customElements.get('image-slot')) {
    customElements.define('image-slot', ImageSlot);
  }
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/marketing-site/image-slot.js", error: String((e && e.message) || e) }); }

// ui_kits/marketing-site/sections.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Power Source — Marketing site sections. Reads primitives from window. */

const LOGO = "../../assets/logo/power-source-logo.webp";
const LOGO_REVERSED = "../../assets/logo/logo-reversed.png";
const NAV = ["Programs", "Coaches", "Reviews", "Approach"];
function Header({
  onStart,
  scrolled
}) {
  const [open, setOpen] = React.useState(false);
  return /*#__PURE__*/React.createElement("header", {
    className: "mk-header" + (scrolled ? " is-scrolled" : "")
  }, /*#__PURE__*/React.createElement("div", {
    className: "mk-container mk-header__row"
  }, /*#__PURE__*/React.createElement("a", {
    className: "mk-logo",
    href: "#top"
  }, /*#__PURE__*/React.createElement("img", {
    src: LOGO_REVERSED,
    alt: "Power Source"
  })), /*#__PURE__*/React.createElement("nav", {
    className: "mk-nav"
  }, NAV.map(n => /*#__PURE__*/React.createElement("a", {
    key: n,
    href: "#" + n.toLowerCase()
  }, n))), /*#__PURE__*/React.createElement("div", {
    className: "mk-header__right"
  }, /*#__PURE__*/React.createElement("a", {
    className: "mk-phone",
    href: "tel:9786783145"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "phone"
  }), " (978) 678-3145"), /*#__PURE__*/React.createElement(Button, {
    variant: "bolt",
    onClick: onStart
  }, "Start Training"))));
}
function Hero({
  onStart
}) {
  return /*#__PURE__*/React.createElement("section", {
    className: "mk-hero",
    id: "top"
  }, /*#__PURE__*/React.createElement("div", {
    className: "mk-hero__bg"
  }), /*#__PURE__*/React.createElement("div", {
    className: "mk-container mk-hero__grid"
  }, /*#__PURE__*/React.createElement("div", {
    className: "mk-hero__copy"
  }, /*#__PURE__*/React.createElement(Badge, {
    variant: "outline",
    dot: true
  }, "Est. 1998 \xB7 Leominster, MA"), /*#__PURE__*/React.createElement("h1", {
    className: "mk-hero__title"
  }, "Train Hard.", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
    className: "hl"
  }, "Rise Higher."), /*#__PURE__*/React.createElement("br", null), "Compete Stronger."), /*#__PURE__*/React.createElement("p", {
    className: "mk-hero__sub"
  }, "From strength to agility to injury-prevention, we help Leominster athletes level up their game with science-based coaching and proven results."), /*#__PURE__*/React.createElement("div", {
    className: "mk-hero__cta"
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "bolt",
    size: "lg",
    onClick: onStart
  }, "Claim 2 Free Sessions ", /*#__PURE__*/React.createElement(Icon, {
    name: "arrow-right"
  })), /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    size: "lg",
    as: "a",
    href: "#programs",
    onClick: e => {
      e.preventDefault();
      document.getElementById('programs').scrollIntoView({
        behavior: 'smooth'
      });
    }
  }, "Explore Programs")), /*#__PURE__*/React.createElement("div", {
    className: "mk-hero__trust"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("b", null, "28+"), /*#__PURE__*/React.createElement("span", null, "years coaching")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("b", null, "1000s"), /*#__PURE__*/React.createElement("span", null, "of families")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("b", null, "4"), /*#__PURE__*/React.createElement("span", null, "core programs")))), /*#__PURE__*/React.createElement("div", {
    className: "mk-hero__media"
  }, /*#__PURE__*/React.createElement("image-slot", {
    id: "ps-hero",
    class: "mk-hero__slot",
    shape: "rounded",
    radius: "16",
    placeholder: "Drop a training-floor photo"
  }), /*#__PURE__*/React.createElement("div", {
    className: "mk-hero__chip"
  }, /*#__PURE__*/React.createElement("span", {
    className: "mk-hero__chip-k"
  }, "Champion mindset"), /*#__PURE__*/React.createElement("span", {
    className: "mk-hero__chip-v"
  }, "Where every athlete is treated like a champion.")))));
}
const PROGRAMS = [{
  icon: "user",
  meta: "Ages 8–18",
  title: "Youth Personal Training",
  desc: "1:1 athletic development that builds speed, strength and the habits of a champion.",
  accent: "electric"
}, {
  icon: "zap",
  meta: "Speed · Agility",
  title: "Speed School",
  desc: "Sprint mechanics, footwork and explosive power — get measurably faster.",
  accent: "bolt"
}, {
  icon: "dumbbell",
  meta: "Adults",
  title: "Adult Personal Training",
  desc: "Meet you where you are on day one and build genuine, lasting progress.",
  accent: "electric"
}, {
  icon: "users",
  meta: "Small group",
  title: "Adult Team Training",
  desc: "Strength & conditioning with like-minded people chasing like-minded goals.",
  accent: "bolt"
}];
function Programs() {
  return /*#__PURE__*/React.createElement("section", {
    className: "mk-section",
    id: "programs"
  }, /*#__PURE__*/React.createElement("div", {
    className: "mk-container"
  }, /*#__PURE__*/React.createElement(SectionHeading, {
    align: "center",
    eyebrow: "The Programs",
    title: /*#__PURE__*/React.createElement(React.Fragment, null, "Built for ", /*#__PURE__*/React.createElement("span", {
      className: "hl"
    }, "every athlete")),
    subtitle: "Personalized coaching for life and sport \u2014 one athlete at a time, at any level."
  }), /*#__PURE__*/React.createElement("div", {
    className: "mk-programs"
  }, PROGRAMS.map(p => /*#__PURE__*/React.createElement(ProgramCard, {
    key: p.title,
    icon: p.icon,
    meta: p.meta,
    title: p.title,
    description: p.desc,
    accent: p.accent,
    cta: "Learn More"
  })))));
}
function Proof() {
  return /*#__PURE__*/React.createElement("section", {
    className: "mk-section mk-proof",
    id: "proof"
  }, /*#__PURE__*/React.createElement("div", {
    className: "mk-container"
  }, /*#__PURE__*/React.createElement(SectionHeading, {
    eyebrow: "Measured \xB7 Tracked \xB7 Proven",
    title: /*#__PURE__*/React.createElement(React.Fragment, null, "Real numbers that ", /*#__PURE__*/React.createElement("span", {
      className: "hl"
    }, "prove it")),
    subtitle: "The exact gains our athletes make in speed, strength and explosiveness \u2014 written down and tracked every session."
  }), /*#__PURE__*/React.createElement("div", {
    className: "mk-stats"
  }, /*#__PURE__*/React.createElement(StatTile, {
    accent: "electric",
    eyebrow: "40-yd dash",
    value: "\u22120.34",
    unit: "s",
    caption: "avg improvement / 12 wks"
  }), /*#__PURE__*/React.createElement(StatTile, {
    accent: "bolt",
    eyebrow: "Vertical jump",
    value: "+4.2",
    unit: "in",
    caption: "measured & tracked"
  }), /*#__PURE__*/React.createElement(StatTile, {
    accent: "electric",
    eyebrow: "Squat strength",
    value: "+38",
    unit: "%",
    caption: "first season avg"
  }), /*#__PURE__*/React.createElement(StatTile, {
    accent: "bolt",
    eyebrow: "Retention",
    value: "92",
    unit: "%",
    caption: "families re-enroll"
  }))));
}
const REVIEWS = [{
  name: "Julie E",
  role: "Hockey parent · 6 yrs",
  quote: "My expectations have been exceeded. Their strength, balance and speed are amazing — and they keep the coaches' handwritten notes of encouragement."
}, {
  name: "Jen L",
  role: "Youth athlete parent",
  quote: "It's the personal connection that makes this place special. Three years later my son still looks forward to going multiple times a week."
}, {
  name: "Tina D",
  role: "Hockey parent",
  quote: "Best decision ever. Big improvement in his strength — even other parents noticed his skating — plus a real boost in confidence."
}];
function Testimonials() {
  return /*#__PURE__*/React.createElement("section", {
    className: "mk-section",
    id: "reviews"
  }, /*#__PURE__*/React.createElement("div", {
    className: "mk-container"
  }, /*#__PURE__*/React.createElement(SectionHeading, {
    align: "center",
    eyebrow: "Proven Results",
    title: /*#__PURE__*/React.createElement(React.Fragment, null, "Trusted by ", /*#__PURE__*/React.createElement("span", {
      className: "hl"
    }, "Leominster families")),
    subtitle: "See how our training transforms confidence, performance and mindset."
  }), /*#__PURE__*/React.createElement("div", {
    className: "mk-reviews"
  }, REVIEWS.map(r => /*#__PURE__*/React.createElement(Testimonial, _extends({
    key: r.name
  }, r))))));
}
const STEPS = [{
  n: "01",
  icon: "clipboard-list",
  title: "Fill Out Form",
  desc: "Tell us about your athlete so we can get you set up quickly."
}, {
  n: "02",
  icon: "user-check",
  title: "Meet Your Coach",
  desc: "We review goals, strengths and needs to build the right plan."
}, {
  n: "03",
  icon: "flame",
  title: "Start Training",
  desc: "Hit the floor and begin building strength, speed and confidence."
}];
function GetStarted({
  onStart
}) {
  return /*#__PURE__*/React.createElement("section", {
    className: "mk-section mk-steps-sec",
    id: "approach"
  }, /*#__PURE__*/React.createElement("div", {
    className: "mk-container"
  }, /*#__PURE__*/React.createElement(SectionHeading, {
    align: "center",
    eyebrow: "How To Get Started",
    title: /*#__PURE__*/React.createElement(React.Fragment, null, "Three steps to ", /*#__PURE__*/React.createElement("span", {
      className: "hl"
    }, "train like a champion"))
  }), /*#__PURE__*/React.createElement("div", {
    className: "mk-steps"
  }, STEPS.map(s => /*#__PURE__*/React.createElement("div", {
    className: "mk-step",
    key: s.n
  }, /*#__PURE__*/React.createElement("span", {
    className: "mk-step__n"
  }, s.n), /*#__PURE__*/React.createElement("div", {
    className: "mk-step__icon"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: s.icon
  })), /*#__PURE__*/React.createElement("h3", {
    className: "mk-step__title"
  }, s.title), /*#__PURE__*/React.createElement("p", {
    className: "mk-step__desc"
  }, s.desc)))), /*#__PURE__*/React.createElement("div", {
    className: "mk-steps__cta"
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "bolt",
    size: "lg",
    onClick: onStart
  }, "Claim 2 Free Sessions"))));
}
function Footer() {
  return /*#__PURE__*/React.createElement("footer", {
    className: "mk-footer"
  }, /*#__PURE__*/React.createElement("div", {
    className: "mk-container mk-footer__grid"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("img", {
    className: "mk-footer__logo",
    src: LOGO_REVERSED,
    alt: "Power Source"
  }), /*#__PURE__*/React.createElement("p", {
    className: "mk-footer__tag"
  }, "Train Hard. Rise Higher. Compete Stronger."), /*#__PURE__*/React.createElement("div", {
    className: "mk-social"
  }, /*#__PURE__*/React.createElement("a", {
    href: "https://instagram.com/powersource_athletics/",
    "aria-label": "Instagram"
  }, "IG"), /*#__PURE__*/React.createElement("a", {
    href: "https://facebook.com/powersourcetraining/",
    "aria-label": "Facebook"
  }, "FB"), /*#__PURE__*/React.createElement("a", {
    href: "https://youtube.com/@jimherrick1150",
    "aria-label": "YouTube"
  }, "YT"))), /*#__PURE__*/React.createElement("div", {
    className: "mk-footer__col"
  }, /*#__PURE__*/React.createElement("h4", null, "Programs"), PROGRAMS.map(p => /*#__PURE__*/React.createElement("a", {
    key: p.title,
    href: "#programs"
  }, p.title))), /*#__PURE__*/React.createElement("div", {
    className: "mk-footer__col"
  }, /*#__PURE__*/React.createElement("h4", null, "Contact"), /*#__PURE__*/React.createElement("a", {
    href: "https://maps.google.com"
  }, "450 Research Dr, Suite B", /*#__PURE__*/React.createElement("br", null), "Leominster, MA 01453"), /*#__PURE__*/React.createElement("a", {
    href: "tel:9786783145"
  }, "(978) 678-3145"))), /*#__PURE__*/React.createElement("div", {
    className: "mk-container mk-footer__bottom"
  }, /*#__PURE__*/React.createElement("span", null, "\xA9 2026 Power Source. All rights reserved."), /*#__PURE__*/React.createElement("span", null, "Terms \xB7 Privacy")));
}
Object.assign(window, {
  Header,
  Hero,
  Programs,
  Proof,
  Testimonials,
  GetStarted,
  Footer,
  PROGRAMS
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/marketing-site/sections.jsx", error: String((e && e.message) || e) }); }

// ui_kits/marketing-site/ui.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Power Source — Marketing kit primitives (self-contained recreation).
   Mirrors the authored components in /components/core using the SAME
   token-driven CSS classes, exposed as window globals for the kit. */

function ensureStyles(id, css) {
  if (document.getElementById(id)) return;
  const el = document.createElement("style");
  el.id = id;
  el.textContent = css;
  document.head.appendChild(el);
}
ensureStyles("ps-kit-styles", `
/* Button */
.ps-btn{--_bg:var(--action-primary);--_bgh:var(--action-primary-hover);--_bgp:var(--action-primary-press);--_fg:var(--action-primary-text);display:inline-flex;align-items:center;justify-content:center;gap:10px;font-family:var(--font-heading);font-weight:var(--fw-bold);text-transform:uppercase;letter-spacing:.06em;border:0;cursor:pointer;white-space:nowrap;text-decoration:none;background:var(--_bg);color:var(--_fg);height:var(--control-h-md);padding:0 var(--control-pad-x);border-radius:var(--radius-md);font-size:14px;transition:background var(--dur-fast) var(--ease-out),box-shadow var(--dur-base) var(--ease-out),transform var(--dur-fast) var(--ease-out);}
.ps-btn:hover{background:var(--_bgh);box-shadow:var(--glow-electric);}
.ps-btn:active{background:var(--_bgp);box-shadow:var(--inset-press);transform:translateY(1px);}
.ps-btn:focus-visible{outline:none;box-shadow:var(--ring-focus);}
.ps-btn--bolt{--_bg:var(--action-bolt);--_bgh:var(--action-bolt-hover);--_bgp:var(--action-bolt-press);--_fg:var(--action-bolt-text);}
.ps-btn--bolt:hover{box-shadow:var(--glow-bolt);}
.ps-btn--secondary{--_bg:var(--surface-steel);--_bgh:var(--steel-600);--_bgp:var(--steel-700);--_fg:#fff;}
.ps-btn--secondary:hover{box-shadow:none;}
.ps-btn--ghost{--_bg:transparent;--_fg:var(--action-ghost-text);box-shadow:inset 0 0 0 var(--bw-1) var(--action-ghost-border);}
.ps-btn--ghost:hover{background:var(--action-ghost-hover);box-shadow:inset 0 0 0 var(--bw-1) var(--border-strong);}
.ps-btn--lg{height:var(--control-h-lg);padding:0 30px;font-size:16px;}
.ps-btn--block{display:flex;width:100%;}
/* Badge */
.ps-badge{display:inline-flex;align-items:center;gap:6px;font-family:var(--font-mono);font-weight:var(--fw-bold);font-size:11px;letter-spacing:.08em;text-transform:uppercase;padding:4px 10px;border-radius:var(--radius-pill);line-height:1.4;background:var(--electric-500);color:#fff;}
.ps-badge .ps-badge__dot{width:6px;height:6px;border-radius:50%;background:currentColor;}
.ps-badge--bolt{background:var(--bolt-400);color:var(--ink-950);}
.ps-badge--outline{background:transparent;color:var(--electric-300);box-shadow:inset 0 0 0 1.5px var(--electric-400);}
.ps-badge--steel{background:rgba(255,255,255,.1);color:#fff;}
/* SectionHeading */
.ps-head{display:flex;flex-direction:column;gap:14px;}
.ps-head--center{align-items:center;text-align:center;}
.ps-head__eyebrow{display:inline-flex;align-items:center;gap:9px;font-family:var(--font-mono);font-weight:var(--fw-bold);font-size:12px;letter-spacing:.18em;text-transform:uppercase;color:var(--electric-300);}
.ps-head__eyebrow::before{content:"";width:22px;height:2px;background:var(--bolt-400);}
.ps-head--center .ps-head__eyebrow::before{display:none;}
.ps-head__title{font-family:var(--font-display);font-weight:var(--fw-extrabold);text-transform:uppercase;line-height:.95;letter-spacing:-.01em;font-size:clamp(34px,4.4vw,56px);color:var(--text-strong);max-width:18ch;text-wrap:balance;}
.ps-head--light .ps-head__title{color:var(--ink-900);}
.ps-head--light .ps-head__eyebrow{color:var(--electric-600);}
.ps-head__sub{font-family:var(--font-body);font-size:var(--fs-body-lg);line-height:1.55;color:var(--text-body);max-width:56ch;text-wrap:pretty;}
.ps-head--light .ps-head__sub{color:var(--text-on-light-muted);}
.ps-head--center .ps-head__sub{margin-inline:auto;}
.ps-head__title .hl{color:var(--bolt-400);}
/* Card */
.ps-card{position:relative;background:var(--surface-raised);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);box-shadow:var(--shadow-md);padding:24px;color:var(--text-body);}
.ps-card--interactive{transition:transform var(--dur-base) var(--ease-out),box-shadow var(--dur-base) var(--ease-out),border-color var(--dur-base) var(--ease-out);cursor:pointer;}
.ps-card--interactive:hover{transform:translateY(-3px);box-shadow:var(--shadow-lg);border-color:var(--border-strong);}
.ps-card--accent-bolt{border-top:var(--bw-3) solid var(--bolt-400);}
.ps-card--accent-electric{border-top:var(--bw-3) solid var(--electric-400);}
/* ProgramCard */
.ps-prog{display:flex;flex-direction:column;gap:14px;height:100%;}
.ps-prog__top{display:flex;align-items:center;justify-content:space-between;gap:12px;}
.ps-prog__icon{width:52px;height:52px;border-radius:var(--radius-md);display:flex;align-items:center;justify-content:center;background:var(--electric-500);color:#fff;flex:none;}
.ps-prog--bolt .ps-prog__icon{background:var(--bolt-400);color:var(--ink-950);}
.ps-prog__icon svg{width:26px;height:26px;}
.ps-prog__meta{font-family:var(--font-mono);font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--text-muted);}
.ps-prog__title{font-family:var(--font-display);font-weight:var(--fw-extrabold);text-transform:uppercase;line-height:1;font-size:26px;color:var(--text-strong);}
.ps-prog__desc{font-family:var(--font-body);font-size:14px;line-height:1.5;color:var(--text-body);flex:1;}
.ps-prog__cta{display:inline-flex;align-items:center;gap:8px;align-self:flex-start;font-family:var(--font-heading);font-weight:var(--fw-bold);text-transform:uppercase;letter-spacing:.06em;font-size:13px;color:var(--electric-300);}
.ps-prog--bolt .ps-prog__cta{color:var(--bolt-300);}
.ps-prog__cta svg{width:16px;height:16px;transition:transform var(--dur-fast) var(--ease-out);}
.ps-card--interactive:hover .ps-prog__cta svg{transform:translateX(4px);}
/* StatTile */
.ps-stat{position:relative;display:flex;flex-direction:column;gap:6px;background:var(--surface-raised);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);padding:22px;overflow:hidden;}
.ps-stat::before{content:"";position:absolute;left:0;top:0;bottom:0;width:var(--bw-3);background:var(--electric-400);}
.ps-stat--bolt::before{background:var(--bolt-400);}
.ps-stat__eyebrow{font-family:var(--font-mono);font-weight:var(--fw-bold);font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:var(--text-muted);}
.ps-stat__value{font-family:var(--font-display);font-weight:var(--fw-black);font-size:54px;line-height:.95;color:var(--text-strong);font-variant-numeric:tabular-nums;letter-spacing:-.01em;display:flex;align-items:baseline;gap:4px;}
.ps-stat__unit{font-size:26px;color:var(--bolt-400);font-weight:var(--fw-extrabold);}
.ps-stat__caption{font-family:var(--font-body);font-size:13px;color:var(--text-body);}
/* Testimonial */
.ps-quote{display:flex;flex-direction:column;gap:18px;background:var(--surface-raised);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);box-shadow:var(--shadow-md);padding:26px;height:100%;box-sizing:border-box;}
.ps-quote__stars{display:flex;gap:3px;color:var(--bolt-400);font-size:15px;letter-spacing:2px;}
.ps-quote__body{font-family:var(--font-body);font-size:16px;line-height:1.55;color:var(--text-strong);text-wrap:pretty;flex:1;}
.ps-quote__foot{display:flex;align-items:center;gap:12px;}
.ps-quote__name{font-family:var(--font-heading);font-weight:var(--fw-bold);font-size:15px;color:var(--text-strong);}
.ps-quote__role{font-family:var(--font-mono);font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--text-muted);display:block;}
/* Avatar */
.ps-avatar{display:inline-flex;align-items:center;justify-content:center;border-radius:50%;overflow:hidden;flex:none;background:var(--steel-500);color:#fff;font-family:var(--font-display);font-weight:var(--fw-extrabold);text-transform:uppercase;width:44px;height:44px;font-size:17px;}
.ps-avatar--bolt{background:var(--bolt-400);color:var(--ink-950);}
/* Input */
.ps-field{display:flex;flex-direction:column;gap:7px;}
.ps-field__label{font-family:var(--font-heading);font-weight:var(--fw-semibold);font-size:13px;color:var(--text-strong);}
.ps-field__req{color:var(--bolt-400);margin-left:3px;}
.ps-input{width:100%;height:var(--control-h-md);background:var(--ink-850);color:var(--text-strong);border:1px solid var(--border-default);border-radius:var(--radius-md);padding:0 14px;font-family:var(--font-body);font-size:15px;box-sizing:border-box;transition:border-color var(--dur-fast) var(--ease-out),box-shadow var(--dur-fast) var(--ease-out);}
.ps-input::placeholder{color:var(--text-muted);}
.ps-input:focus{outline:none;border-color:var(--electric-400);box-shadow:var(--ring-focus);}
`);
const cx = (...a) => a.filter(Boolean).join(" ");
function Button({
  children,
  variant = "primary",
  size = "md",
  fullWidth,
  className,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("button", _extends({
    className: cx("ps-btn", variant !== "primary" && `ps-btn--${variant}`, size === "lg" && "ps-btn--lg", fullWidth && "ps-btn--block", className)
  }, rest), children);
}
function Badge({
  children,
  variant = "electric",
  dot,
  className,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("span", _extends({
    className: cx("ps-badge", variant !== "electric" && `ps-badge--${variant}`, className)
  }, rest), dot && /*#__PURE__*/React.createElement("span", {
    className: "ps-badge__dot"
  }), children);
}
function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "left",
  tone = "dark",
  className
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: cx("ps-head", align === "center" && "ps-head--center", tone === "light" && "ps-head--light", className)
  }, eyebrow && /*#__PURE__*/React.createElement("span", {
    className: "ps-head__eyebrow"
  }, eyebrow), /*#__PURE__*/React.createElement("h2", {
    className: "ps-head__title"
  }, title), subtitle && /*#__PURE__*/React.createElement("p", {
    className: "ps-head__sub"
  }, subtitle));
}
function Card({
  children,
  accent = "none",
  interactive,
  className,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    className: cx("ps-card", accent !== "none" && `ps-card--accent-${accent}`, interactive && "ps-card--interactive", className)
  }, rest), children);
}
function Icon({
  name,
  size = 24
}) {
  // Render Lucide icons as React-owned SVG (NO lucide.createIcons DOM mutation,
  // which corrupts React reconciliation when a parent re-renders).
  const lib = typeof window !== "undefined" && window.lucide && window.lucide.icons || {};
  const pascal = String(name).replace(/(^|-)([a-z])/g, (_, __, c) => c.toUpperCase());
  let node = lib[pascal];
  if (node && !Array.isArray(node) && node.length === undefined && node.default) node = node.default;
  const sz = size || 24;
  if (!node || !node.length) return /*#__PURE__*/React.createElement("svg", {
    width: sz,
    height: sz,
    viewBox: "0 0 24 24",
    "aria-hidden": "true"
  });
  return /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: sz,
    height: sz,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true"
  }, node.map((child, i) => React.createElement(child[0], {
    key: i,
    ...child[1]
  })));
}
function ProgramCard({
  title,
  description,
  meta,
  icon,
  cta = "Learn More",
  accent = "electric",
  onClick
}) {
  return /*#__PURE__*/React.createElement(Card, {
    interactive: true,
    accent: accent,
    onClick: onClick,
    className: accent === "bolt" ? "ps-prog--bolt" : ""
  }, /*#__PURE__*/React.createElement("div", {
    className: "ps-prog"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ps-prog__top"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ps-prog__icon"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: icon
  })), meta && /*#__PURE__*/React.createElement("span", {
    className: "ps-prog__meta"
  }, meta)), /*#__PURE__*/React.createElement("div", {
    className: "ps-prog__title"
  }, title), /*#__PURE__*/React.createElement("div", {
    className: "ps-prog__desc"
  }, description), /*#__PURE__*/React.createElement("span", {
    className: "ps-prog__cta"
  }, cta, " ", /*#__PURE__*/React.createElement(Icon, {
    name: "arrow-right"
  }))));
}
function StatTile({
  value,
  unit,
  eyebrow,
  caption,
  accent = "electric"
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: cx("ps-stat", accent === "bolt" && "ps-stat--bolt")
  }, eyebrow && /*#__PURE__*/React.createElement("div", {
    className: "ps-stat__eyebrow"
  }, eyebrow), /*#__PURE__*/React.createElement("div", {
    className: "ps-stat__value"
  }, value, unit && /*#__PURE__*/React.createElement("span", {
    className: "ps-stat__unit"
  }, unit)), caption && /*#__PURE__*/React.createElement("div", {
    className: "ps-stat__caption"
  }, caption));
}
function Avatar({
  name = "",
  accent = "steel"
}) {
  const initials = name.trim().split(/\s+/).slice(0, 2).map(w => w[0]).join("");
  return /*#__PURE__*/React.createElement("span", {
    className: cx("ps-avatar", accent === "bolt" && "ps-avatar--bolt")
  }, initials);
}
function Testimonial({
  quote,
  name,
  role,
  rating = 5
}) {
  return /*#__PURE__*/React.createElement("figure", {
    className: "ps-quote"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ps-quote__stars"
  }, "★".repeat(rating), "☆".repeat(5 - rating)), /*#__PURE__*/React.createElement("blockquote", {
    className: "ps-quote__body"
  }, quote), /*#__PURE__*/React.createElement("figcaption", {
    className: "ps-quote__foot"
  }, /*#__PURE__*/React.createElement(Avatar, {
    name: name,
    accent: "bolt"
  }), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("span", {
    className: "ps-quote__name"
  }, name), /*#__PURE__*/React.createElement("span", {
    className: "ps-quote__role"
  }, role))));
}
function Input({
  label,
  required,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "ps-field"
  }, label && /*#__PURE__*/React.createElement("label", {
    className: "ps-field__label"
  }, label, required && /*#__PURE__*/React.createElement("span", {
    className: "ps-field__req"
  }, "*")), /*#__PURE__*/React.createElement("input", _extends({
    className: "ps-input"
  }, rest)));
}
Object.assign(window, {
  Button,
  Badge,
  SectionHeading,
  Card,
  ProgramCard,
  StatTile,
  Avatar,
  Testimonial,
  Input,
  Icon
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/marketing-site/ui.jsx", error: String((e && e.message) || e) }); }

// videos.js
try { (() => {
/* ============================================================
   POWER SOURCE — Multi-Sport VIDEO creatives engine (vanilla JS)
   6 looping Story videos. Distinct motion language vs the static ads.
   WAAPI for transforms (seamless infinite loops), rAF for counters/
   typewriters. Gallery + move-node lightbox.
   ============================================================ */
(function () {
  const CYC = 8000; // master loop, ms
  const CLIP = "campaigns/multisport-fb/clips/";
  const LOGO = '<div class="v-logo v-logo--tr" data-a="logo"><img src="assets/logo/logo-reversed.png" alt="Power Source"></div>';
  const GUAR = '<div class="v-guartag" data-a="cta">+1 mph · +3 in · 90 days · or we train them free</div>';
  const CTA = '<div class="v-cta" data-a="cta"><div class="v-cta__btn"><span>Book the Athlete Analysis</span><b>→</b></div></div>';
  const vid = (src, cls, extra = "") => `<video class="${cls}" ${extra} src="${CLIP}${src}" autoplay muted loop playsinline preload="auto"></video>`;
  const SCALE_THUMB = 0.30185;

  /* ---------------- timeline registries ---------------- */
  const baseTL = document.timeline && document.timeline.currentTime || performance.now();
  const counters = []; // {el, from, to, at, dur, dec, fmt}
  const typers = []; // {el, text, at, dur, caret}

  function kfReveal(at, dur, fromT, exitT) {
    let s = at / CYC,
      ee = (at + dur) / CYC;
    s = Math.max(0.0005, Math.min(s, 0.9));
    ee = Math.max(s + 0.01, Math.min(ee, 0.92));
    return [{
      offset: 0,
      opacity: 0,
      transform: fromT
    }, {
      offset: s,
      opacity: 0,
      transform: fromT,
      easing: "cubic-bezier(.18,1.25,.3,1)"
    }, {
      offset: ee,
      opacity: 1,
      transform: "translateX(0px) translateY(0px) scale(1)"
    }, {
      offset: 0.93,
      opacity: 1,
      transform: "translateX(0px) translateY(0px) scale(1)",
      easing: "ease-in"
    }, {
      offset: 1,
      opacity: 0,
      transform: exitT || "translateY(-18px)"
    }];
  }
  function reveal(els, at, dur, fromT, exitT) {
    toArr(els).forEach(el => {
      const a = el.animate(kfReveal(at, dur, fromT, exitT), {
        duration: CYC,
        iterations: Infinity,
        fill: "both"
      });
      try {
        a.startTime = baseTL;
      } catch (e) {}
    });
  }
  function kfWipe(at, dur, fromClip, toClip, exitClip) {
    let s = at / CYC,
      ee = (at + dur) / CYC;
    s = Math.max(0.0005, Math.min(s, 0.9));
    ee = Math.max(s + 0.01, Math.min(ee, 0.92));
    return [{
      offset: 0,
      clipPath: fromClip,
      opacity: 1
    }, {
      offset: s,
      clipPath: fromClip,
      easing: "cubic-bezier(.7,0,.2,1)"
    }, {
      offset: ee,
      clipPath: toClip
    }, {
      offset: 0.93,
      clipPath: toClip,
      easing: "ease-in"
    }, {
      offset: 1,
      clipPath: exitClip || toClip,
      opacity: 1
    }];
  }
  function wipe(els, at, dur, fromClip, toClip, exitClip) {
    toArr(els).forEach(el => {
      const a = el.animate(kfWipe(at, dur, fromClip, toClip, exitClip), {
        duration: CYC,
        iterations: Infinity,
        fill: "both"
      });
      try {
        a.startTime = baseTL;
      } catch (e) {}
    });
  }
  function scaleIn(els, at, dur, fromScale, origin) {
    toArr(els).forEach(el => {
      el.style.transformOrigin = origin || "center";
    });
    reveal(els, at, dur, `scale(${fromScale})`, "scale(1.04)");
  }
  function counter(el, from, to, at, dur, dec, fmt) {
    if (el) counters.push({
      el,
      from,
      to,
      at,
      dur,
      dec: dec || 0,
      fmt
    });
  }
  function typer(el, text, at, dur) {
    if (el) typers.push({
      el,
      text,
      at,
      dur
    });
  }
  function toArr(x) {
    return x == null ? [] : x.forEach ? [...x] : [x];
  }
  const R = (root, name) => root.querySelectorAll(`[data-a="${name}"]`);
  const r1 = (root, name) => root.querySelector(`[data-a="${name}"]`);

  /* ---------------- rAF: counters + typewriters ---------------- */
  function frame() {
    const now = document.timeline && document.timeline.currentTime || performance.now();
    const lt = (now - baseTL) % CYC;
    const ease = p => 1 - Math.pow(1 - p, 3);
    for (const c of counters) {
      let p = (lt - c.at) / c.dur;
      p = p < 0 ? 0 : p > 1 ? 1 : p;
      const v = c.from + (c.to - c.from) * ease(p);
      c.el.textContent = c.fmt ? c.fmt(v) : v.toFixed(c.dec);
    }
    for (const t of typers) {
      let p = (lt - t.at) / t.dur;
      p = p < 0 ? 0 : p > 1 ? 1 : p;
      const n = Math.round(t.text.length * p);
      const blink = Math.floor(lt / 320) % 2 === 0 && p < 1 ? '<span style="opacity:.6">▌</span>' : "";
      t.el.innerHTML = t.text.slice(0, n).replace(/\n/g, "<br>") + blink;
    }
    requestAnimationFrame(frame);
  }

  /* timecode 00:00:FF formatter */
  const tcFmt = v => {
    const s = Math.floor(v);
    const ff = Math.floor((v - s) * 30);
    return "00:00:" + String(s * 30 + ff).padStart(2, "0").slice(-2);
  };

  /* ============================================================
     CREATIVES
     ============================================================ */
  const CREATIVES = [/* ---------- 1A SPEED · MEDIA ---------- */
  {
    id: "1A",
    label: "1A · Speed — Media",
    note: "Cinematic clip + HUD telemetry",
    sec: 0,
    html: `
        ${vid("agility-speed.mp4", "v-fill")}
        <div class="v-grade v-grade--cine"></div><div class="v-scan"></div><div class="v-vig"></div>
        <span class="v-tick v-tick--tl"></span><span class="v-tick v-tick--br"></span>
        <div class="v-hud v-hud--tl" data-a="hud"><span class="v-rec"><i></i>REC</span><div class="v-tc" data-a="tc">00:00:00</div></div>
        ${LOGO}
        <div class="v-sweep" data-a="sweep" style="top:55%;width:100%;transform:translateX(-110%)"></div>
        <div class="v-stage v-stage--lower">
          <span class="v-eyebrow" data-a="w0">The Last Rep Lie</span>
          <h1 class="v-kin" style="font-size:150px;margin-top:14px">
            <span class="v-word" data-a="w1">EVERY</span>
            <span class="v-word" data-a="w2">REP.</span>
            <span class="v-word v-word--hl" data-a="w3">FAST.</span>
          </h1>
          <p class="v-sub" data-a="w4" style="margin-top:20px;max-width:24ch">The set ends the moment speed drops — so nothing slow ever gets rehearsed.</p>
        </div>
        ${CTA}${GUAR}`,
    anim(root) {
      reveal(R(root, "hud"), 200, 500, "translateY(-20px)");
      reveal(R(root, "logo"), 350, 500, "translateY(-20px)");
      reveal(r1(root, "w0"), 500, 500, "translateY(40px)");
      reveal(r1(root, "w1"), 800, 480, "translateY(90px)");
      reveal(r1(root, "w2"), 1100, 480, "translateY(90px)");
      reveal(r1(root, "w3"), 1450, 500, "translateY(90px) scale(.8)");
      reveal(r1(root, "w4"), 1950, 520, "translateY(30px)");
      // sweep across
      r1(root, "sweep").animate([{
        offset: 0,
        transform: "translateX(-110%)",
        opacity: 0
      }, {
        offset: 0.28,
        transform: "translateX(-110%)",
        opacity: 0
      }, {
        offset: 0.31,
        opacity: 1
      }, {
        offset: 0.42,
        transform: "translateX(110%)",
        opacity: 1
      }, {
        offset: 0.45,
        transform: "translateX(110%)",
        opacity: 0
      }, {
        offset: 1,
        transform: "translateX(110%)",
        opacity: 0
      }], {
        duration: CYC,
        iterations: Infinity,
        fill: "both"
      }).startTime = baseTL;
      reveal(R(root, "cta"), 3400, 600, "translateY(60px)");
      counter(r1(root, "tc"), 0, 7.6, 0, CYC, 0, tcFmt);
    }
  }, /* ---------- 1B SPEED · TEXT ---------- */
  {
    id: "1B",
    label: "1B · Speed — Type",
    note: "Full-frame kinetic words + count-up",
    sec: 0,
    html: `
        <div class="v-arena"></div><div class="v-grid"></div>
        <div class="v-strip" data-a="strip" style="top:0;right:0;width:300px;height:1920px">
          ${vid("jump.mp4", "")}
          <div style="position:absolute;inset:0;background:linear-gradient(90deg,rgba(5,7,11,.96),rgba(5,7,11,.15))"></div>
        </div>
        ${LOGO}
        <div class="v-stage" style="top:250px;right:360px">
          <span class="v-eyebrow" data-a="w0">Mechanism 01 · The Velocity Drop</span>
          <h1 class="v-kin" style="font-size:172px;margin-top:20px">
            <span class="v-word" data-a="w1">HARD</span>
            <span class="v-word" data-a="w2">WORK</span>
            <span class="v-word v-word--out" data-a="w3">ISN'T</span>
            <span class="v-word v-word--hl" data-a="w4">ENOUGH.</span>
          </h1>
        </div>
        <div class="v-stage" style="top:1130px;right:360px">
          <div class="v-bignum" style="font-size:230px"><span data-a="num">0</span><span style="font-size:96px">%</span></div>
          <p class="v-sub" data-a="numc" style="margin-top:6px;max-width:18ch">more vertical jump vs. training to exhaustion.<br><span style="font-family:var(--font-mono);font-size:22px;color:var(--bolt-300)">Frontiers in Physiology, 2026</span></p>
        </div>
        ${GUAR}`,
    anim(root) {
      wipe(r1(root, "strip"), 200, 700, "inset(0 0 100% 0)", "inset(0 0 0% 0)", "inset(0 0 0% 0)");
      reveal(R(root, "logo"), 300, 500, "translateY(-20px)");
      reveal(r1(root, "w0"), 400, 500, "translateY(30px)");
      reveal(r1(root, "w1"), 700, 460, "translateY(80px)");
      reveal(r1(root, "w2"), 1000, 460, "translateY(80px)");
      reveal(r1(root, "w3"), 1300, 460, "translateY(80px)");
      reveal(r1(root, "w4"), 1650, 480, "translateY(80px) scale(.85)");
      reveal(r1(root, "num").parentElement, 2400, 500, "translateY(50px)");
      reveal(r1(root, "numc"), 3000, 500, "translateY(30px)");
      counter(r1(root, "num"), 0, 224, 2400, 1300, 0);
    }
  }, /* ---------- 2A CONFIDENCE · MEDIA ---------- */
  {
    id: "2A",
    label: "2A · Confidence — Media",
    note: "Clip + live count-up stat cards",
    sec: 1,
    html: `
        ${vid("deadlift.mp4", "v-fill")}
        <div class="v-grade v-grade--cine"></div><div class="v-vig"></div>
        <span class="v-tick v-tick--tr"></span><span class="v-tick v-tick--bl"></span>
        <div class="v-hud v-hud--tl" data-a="hud"><span class="v-rec"><i style="background:#3fae6b;box-shadow:0 0 14px #3fae6b"></i>LIVE</span><div class="v-tc">Athlete Analysis</div></div>
        ${LOGO}
        <div class="v-stat" style="top:240px">
          <div class="v-statrow" data-a="s1"><span class="v-statrow__lab">Sprint · 10 yd</span><span class="v-statrow__val"><span data-a="c1">1.94</span><em>s</em> <span class="v-statrow__up">▲</span></span></div>
          <div class="v-statrow" data-a="s2"><span class="v-statrow__lab">Vertical jump</span><span class="v-statrow__val"><span data-a="c2">17.5</span><em>in</em> <span class="v-statrow__up">▲</span></span></div>
        </div>
        <div class="v-stage v-stage--lower">
          <span class="v-eyebrow" data-a="w0">Proof &gt; Praise</span>
          <h1 class="v-kin" style="font-size:130px;margin-top:14px"><span class="v-word" data-a="w1">PROOF YOU</span><span class="v-word v-word--hl" data-a="w2">CAN SEE.</span></h1>
        </div>
        ${CTA}${GUAR}`,
    anim(root) {
      reveal(R(root, "hud"), 200, 500, "translateY(-20px)");
      reveal(R(root, "logo"), 300, 500, "translateY(-20px)");
      reveal(r1(root, "s1"), 700, 520, "translateX(-60px)");
      reveal(r1(root, "s2"), 1000, 520, "translateX(-60px)");
      reveal(r1(root, "w0"), 1700, 500, "translateY(30px)");
      reveal(r1(root, "w1"), 1950, 480, "translateY(80px)");
      reveal(r1(root, "w2"), 2300, 480, "translateY(80px)");
      reveal(R(root, "cta"), 3500, 600, "translateY(60px)");
      counter(r1(root, "c1"), 1.94, 1.81, 1100, 1500, 2);
      counter(r1(root, "c2"), 17.5, 20.5, 1100, 1500, 1);
    }
  }, /* ---------- 2B CONFIDENCE · TEXT ---------- */
  {
    id: "2B",
    label: "2B · Confidence — Type",
    note: "Praise-vs-proof + circle clip",
    sec: 1,
    html: `
        <div class="v-arena"></div><div class="v-grid"></div>
        ${LOGO}
        <div class="v-stage" style="top:210px">
          <span class="v-eyebrow" data-a="w0">Two kinds of confidence</span>
          <h1 class="v-kin" style="font-size:124px;margin-top:18px">
            <span class="v-word v-word--outw" data-a="w1">PRAISE</span>
            <span class="v-word" data-a="w2" style="font-size:38px;color:#8a93a3;font-family:var(--font-mono);font-weight:400;letter-spacing:.18em;line-height:1.4;display:block;margin-top:8px">Cracks under pressure</span>
            <span class="v-word v-word--hl" data-a="w3" style="margin-top:26px">PROOF</span>
            <span class="v-word" data-a="w4" style="font-size:38px;color:var(--electric-200);font-family:var(--font-mono);font-weight:400;letter-spacing:.18em;line-height:1.4;display:block;margin-top:8px">Holds when the game is on the line</span>
          </h1>
        </div>
        <div class="v-circle" data-a="circle" style="width:540px;height:540px;left:50%;margin-left:-270px;bottom:280px">${vid("squat.mp4", "")}</div>
        <div class="v-guartag" data-a="cta">Real sprint times &amp; jump heights — climbing every week</div>`,
    anim(root) {
      reveal(R(root, "logo"), 300, 500, "translateY(-20px)");
      reveal(r1(root, "w0"), 400, 500, "translateY(30px)");
      reveal(r1(root, "w1"), 700, 480, "translateY(60px)");
      reveal(r1(root, "w2"), 1050, 480, "translateY(24px)");
      reveal(r1(root, "w3"), 1500, 480, "translateY(60px) scale(.85)");
      reveal(r1(root, "w4"), 1850, 480, "translateY(24px)");
      scaleIn(r1(root, "circle"), 2200, 620, 0.2, "center");
      reveal(R(root, "cta"), 3200, 500, "translateY(30px)");
    }
  }, /* ---------- 3A BELIEVE · MEDIA ---------- */
  {
    id: "3A",
    label: "3A · Believe — Media",
    note: "Cinematic film bars + soft script",
    sec: 2,
    html: `
        ${vid("warmup.mp4", "v-fill")}
        <div class="v-grade v-grade--warm"></div><div class="v-vig"></div>
        <div class="v-cinebar v-cinebar--t" data-a="barT"></div>
        <div class="v-cinebar v-cinebar--b" data-a="barB"></div>
        ${LOGO}
        <div class="v-stage" style="bottom:430px;text-align:center">
          <span class="v-eyebrow v-eyebrow--blue" data-a="w0">The quiet car ride home</span>
          <h1 class="v-kin v-script" style="font-size:92px;text-transform:none;font-weight:600;line-height:1.08;margin-top:20px">
            <span class="v-word" data-a="w1" style="display:block">She stopped shrinking.</span>
            <span class="v-word v-word--hl" data-a="w2" style="display:block;margin-top:8px">She started believing.</span>
          </h1>
        </div>
        <div class="v-guartag" data-a="end" style="left:50%;transform:translateX(-50%);text-align:center;bottom:120px">Book the free Athlete Analysis →</div>`,
    anim(root) {
      r1(root, "barT").animate([{
        transform: "translateY(-100%)"
      }, {
        offset: 0.1,
        transform: "translateY(0)"
      }, {
        offset: 0.9,
        transform: "translateY(0)"
      }, {
        transform: "translateY(-100%)"
      }], {
        duration: CYC,
        iterations: Infinity,
        fill: "both"
      }).startTime = baseTL;
      r1(root, "barB").animate([{
        transform: "translateY(100%)"
      }, {
        offset: 0.1,
        transform: "translateY(0)"
      }, {
        offset: 0.9,
        transform: "translateY(0)"
      }, {
        transform: "translateY(100%)"
      }], {
        duration: CYC,
        iterations: Infinity,
        fill: "both"
      }).startTime = baseTL;
      reveal(R(root, "logo"), 600, 600, "translateY(-20px)");
      reveal(r1(root, "w0"), 900, 700, "translateY(20px)");
      reveal(r1(root, "w1"), 1500, 900, "translateY(26px)");
      reveal(r1(root, "w2"), 2500, 900, "translateY(26px)");
      reveal(R(root, "end"), 3800, 700, "translateY(20px)");
    }
  }, /* ---------- 3B BELIEVE · TEXT ---------- */
  {
    id: "3B",
    label: "3B · Believe — Type",
    note: "Typewriter testimonial + soft clip",
    sec: 2,
    html: `
        <div class="v-arena v-arena--steel"></div><div class="v-grid"></div>
        <div class="v-softmask" data-a="mask" style="top:130px;left:50%;margin-left:-360px;width:720px;height:540px">${vid("moody.mp4", "")}</div>
        ${LOGO}
        <div class="v-stage" style="top:790px">
          <span class="v-eyebrow v-eyebrow--blue" data-a="w0">A Power Source parent</span>
          <p class="v-script" data-a="quote" style="font-size:62px;font-weight:500;line-height:1.26;color:#fff;margin:20px 0 0;min-height:360px"></p>
          <cite data-a="cite" style="font-family:var(--font-mono);font-size:24px;color:var(--electric-200);font-style:normal;letter-spacing:.08em;text-transform:uppercase">— their words, not ours</cite>
        </div>
        ${CTA}`,
    anim(root) {
      scaleIn(r1(root, "mask"), 200, 700, 0.6, "center top");
      reveal(R(root, "logo"), 300, 500, "translateY(-20px)");
      reveal(r1(root, "w0"), 700, 500, "translateY(24px)");
      typer(r1(root, "quote"), "He was shy and wouldn't join anything.\nHe got stronger here first.\nThe confidence followed.\nNow he plays.", 1200, 4200);
      reveal(r1(root, "cite"), 5700, 500, "translateY(20px)");
      reveal(R(root, "cta"), 6100, 500, "translateY(60px)");
    }
  }];

  /* ============================================================
     GALLERY + LIGHTBOX
     ============================================================ */
  const SECTIONS = [{
    title: "Angle 1 · Speed",
    sub: "“Why hard work isn’t enough” — media cut + kinetic-type cut"
  }, {
    title: "Angle 2 · Confidence (proof)",
    sub: "“Confidence built on data, not praise” — media + type"
  }, {
    title: "Angle 3 · Confidence (emotional)",
    sub: "“When they stop believing” — cinematic + testimonial"
  }];
  function build() {
    const root = document.getElementById("root");
    const head = document.createElement("div");
    head.className = "vg-head";
    head.innerHTML = `<h1>Multi-Sport Foundation — <span class="hl">Story Videos</span></h1>
      <p>6 looping motion creatives · 1080×1920 (9:16) · real Power Source footage. One media-led + one type-led per angle — a deliberately different motion language from the static set. Click any creative to play it full size (← → to flip, Esc to close).</p>`;
    root.appendChild(head);
    const lb = document.createElement("div");
    lb.className = "vlb";
    lb.innerHTML = `<button class="vlb__nav" data-nav="-1">‹</button>
      <div class="vlb__col"><div class="vlb__stage" id="vlbStage"></div><div class="vlb__cap" id="vlbCap"></div></div>
      <button class="vlb__nav" data-nav="1">›</button><button class="vlb__close">✕</button>`;
    document.body.appendChild(lb);
    const stage = lb.querySelector("#vlbStage");
    const cap = lb.querySelector("#vlbCap");
    let openIdx = -1;
    function fitLB() {
      if (openIdx < 0) return;
      const s = Math.min((window.innerHeight - 130) / 1920, (window.innerWidth - 220) / 1080);
      const c = CREATIVES[openIdx];
      c.el.style.transform = `scale(${s})`;
      stage.style.width = 1080 * s + "px";
      stage.style.height = 1920 * s + "px";
    }
    function open(i) {
      openIdx = (i + CREATIVES.length) % CREATIVES.length;
      const c = CREATIVES[openIdx];
      stage.innerHTML = "";
      stage.appendChild(c.el);
      cap.innerHTML = `<b>${c.label}</b> &nbsp; 1080 × 1920 · ${openIdx + 1} / ${CREATIVES.length}`;
      lb.classList.add("open");
      fitLB();
      playAll();
    }
    function close() {
      if (openIdx < 0) return;
      const c = CREATIVES[openIdx];
      c.el.style.transform = `scale(${SCALE_THUMB})`;
      c.home.appendChild(c.el);
      lb.classList.remove("open");
      openIdx = -1;
    }
    lb.addEventListener("click", e => {
      if (e.target === lb) return close();
      const nav = e.target.closest("[data-nav]");
      if (nav) return open(openIdx + +nav.dataset.nav);
      if (e.target.closest(".vlb__close")) return close();
    });
    window.addEventListener("keydown", e => {
      if (openIdx < 0) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") open(openIdx + 1);
      if (e.key === "ArrowLeft") open(openIdx - 1);
    });
    window.addEventListener("resize", fitLB);
    SECTIONS.forEach((sec, si) => {
      const s = document.createElement("section");
      s.className = "vg-sec";
      s.innerHTML = `<div class="vg-sec__h"><h2>${sec.title}</h2><p>${sec.sub}</p></div><div class="vg-row"></div>`;
      const row = s.querySelector(".vg-row");
      CREATIVES.forEach((c, i) => {
        if (c.sec !== si) return;
        const card = document.createElement("figure");
        card.className = "vg-card";
        const thumb = document.createElement("div");
        thumb.className = "vg-thumb";
        thumb.innerHTML = `<span class="vg-thumb__tag">${c.id}</span>`;
        const el = document.createElement("div");
        el.className = "vid";
        el.style.transform = `scale(${SCALE_THUMB})`;
        el.style.transformOrigin = "top left";
        el.innerHTML = c.html;
        thumb.appendChild(el);
        card.appendChild(thumb);
        const capEl = document.createElement("figcaption");
        capEl.className = "vg-cap";
        capEl.innerHTML = `<b>${c.label}</b><span>${c.note}</span>`;
        card.appendChild(capEl);
        row.appendChild(card);
        c.el = el;
        c.home = thumb;
        c.idx = i;
        thumb.addEventListener("click", () => open(i));
        c.anim(el);
      });
      root.appendChild(s);
    });
    requestAnimationFrame(frame);
    playAll();
  }
  function playAll() {
    document.querySelectorAll("video").forEach(v => {
      const p = v.play();
      if (p && p.catch) p.catch(() => {});
    });
  }
  ["click", "touchstart", "keydown", "pointerdown"].forEach(ev => window.addEventListener(ev, playAll, {
    passive: true
  }));
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) playAll();
  });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", build);else build();
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "videos.js", error: String((e && e.message) || e) }); }

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Tag = __ds_scope.Tag;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.ProgramCard = __ds_scope.ProgramCard;

__ds_ns.Avatar = __ds_scope.Avatar;

__ds_ns.SectionHeading = __ds_scope.SectionHeading;

__ds_ns.Testimonial = __ds_scope.Testimonial;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.StatTile = __ds_scope.StatTile;

})();
