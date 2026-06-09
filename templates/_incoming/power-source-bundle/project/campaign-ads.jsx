// campaign-ads.jsx — Power Source "Multi-Sport" FB/IG Story creatives (1080×1920)
// 3 angles × 2 directions (photo-led + type-led). Exported to window.
(function () {
  const e = React.createElement;

  /* ---------- shared pieces ---------- */

  function Eyebrow({ children, tone }) {
    return e("div", { className: "ad-eyebrow" + (tone ? " ad-eyebrow--" + tone : "") }, children);
  }

  function TopBar({ light }) {
    return e(
      "div",
      { className: "ad-top" },
      e("img", {
        src: light ? "assets/logo/power-source-logo.webp" : "assets/logo/logo-reversed.png",
        alt: "Power Source",
        className: light ? "ad-top__logo ad-top__logo--plate" : "ad-top__logo",
      }),
      e("span", { className: "ad-loc" }, "Leominster, MA · Est. 1998")
    );
  }

  function Guarantee() {
    return e(
      "div",
      { className: "ad-guar" },
      e(
        "div",
        { className: "ad-guar__row" },
        e("div", { className: "ad-guar__item" }, e("b", null, "+1"), e("span", null, "MPH")),
        e("i", { className: "ad-guar__div" }),
        e("div", { className: "ad-guar__item" }, e("b", null, "+3"), e("span", null, "INCHES")),
        e("i", { className: "ad-guar__div" }),
        e("div", { className: "ad-guar__item" }, e("b", null, "90"), e("span", null, "DAYS"))
      ),
      e("div", { className: "ad-guar__tag" }, "Or we keep training them free.")
    );
  }

  function Cta() {
    return e(
      "div",
      { className: "ad-ctaWrap" },
      e(
        "div",
        { className: "ad-cta" },
        e("span", { className: "ad-cta__label" }, "Book the Free Athlete Analysis"),
        e("span", { className: "ad-cta__arrow" }, "→")
      ),
      e(
        "div",
        { className: "ad-cta__meta" },
        e("span", null, "powersourceleominster.com"),
        e("i", null),
        e("span", null, "(978) 678-3145")
      )
    );
  }

  // a believable scoreboard readout (the "visible numbers" mechanism proof)
  function Scoreboard({ rows, title }) {
    return e(
      "div",
      { className: "ad-score" },
      e(
        "div",
        { className: "ad-score__head" },
        e("span", { className: "ad-score__k" }, title || "Athlete Analysis"),
        e("span", { className: "ad-score__live" }, e("i", null), "Tracked")
      ),
      e(
        "div",
        { className: "ad-score__rows" },
        rows.map((r, i) =>
          e(
            "div",
            { className: "ad-score__row", key: i },
            e("span", { className: "ad-score__label" }, r.label),
            e(
              "span",
              { className: "ad-score__vals" },
              e("span", { className: "ad-score__from" }, r.from),
              e("span", { className: "ad-score__to" }, r.to)
            ),
            e("span", { className: "ad-score__up" }, "▲")
          )
        )
      )
    );
  }

  function Photo({ focal, src }) {
    // Plain <img> base layer — renders and exports reliably across capture
    // pipelines (image-slot's shadow DOM can't be read by PNG export). The
    // real Power Source footage is baked in; swap the src to use a new shot.
    return e(
      "div",
      { className: "ad-photo" },
      e("img", {
        className: "ad-photo__img",
        src: src,
        alt: "",
        style: { objectPosition: focal || "50% 50%" },
      }),
      e("div", { className: "ad-grain" })
    );
  }

  /* =========================================================
     ANGLE 1 — SPEED  ("Why hard work isn't enough")
     ========================================================= */

  // 1A — photo-led, verbatim headline
  function Ad_Speed_Photo() {
    return e(
      "div",
      { className: "ad ad--photo", "data-screen-label": "Speed · Photo" },
      e(Photo, {
        id: "ps-speed-photo",
        focal: "54% 42%",
        src: "campaigns/multisport-fb/frames/plyo-jump-speed.jpg",
        placeholder: "Athlete mid-jump — real facility",
      }),
      e("div", { className: "ad-scrim ad-scrim--top" }),
      e(TopBar, null),
      // floating gate readout
      e(
        "div",
        { className: "ad-chip ad-chip--gate" },
        e("span", { className: "ad-chip__k" }, "10-YD SPLIT · GATE 2"),
        e("span", { className: "ad-chip__v" }, "1.81", e("em", null, "s")),
        e("span", { className: "ad-chip__note" }, "speed dropped → set ended")
      ),
      e("div", { className: "ad-scrim ad-scrim--bottom" }),
      e(
        "div",
        { className: "ad-lower" },
        e(Eyebrow, null, "The Last Rep Lie"),
        e(
          "h1",
          { className: "ad-h", style: { fontSize: "80px" } },
          "Here's why most young athletes ",
          e("span", { className: "hl" }, "stop getting faster"),
          "."
        ),
        e("p", { className: "ad-sub" }, "(And what you can do about it.)"),
        e(Guarantee, null),
        e(Cta, null)
      )
    );
  }

  // 1B — type-led, punchy alt + the 224% proof
  function Ad_Speed_Type() {
    return e(
      "div",
      { className: "ad ad--type ad--arena", "data-screen-label": "Speed · Type" },
      e("div", { className: "ad-arenaGrid" }),
      e("div", { className: "ad-boltGlow" }),
      e(TopBar, null),
      e(
        "div",
        { className: "ad-stack" },
        e(Eyebrow, null, "Mechanism 01 · The Velocity Drop"),
        e(
          "h1",
          { className: "ad-h", style: { fontSize: "100px" } },
          "Hard work isn't making them ",
          e("span", { className: "hl" }, "faster"),
          "."
        ),
        e(
          "p",
          { className: "ad-lede" },
          "Those last tired reps train the nervous system to move slow. So we end the set the second speed drops — every rep your athlete does stays fast."
        ),
        e(
          "div",
          { className: "ad-bigstat" },
          e(
            "div",
            { className: "ad-bigstat__num" },
            "224",
            e("span", { className: "ad-bigstat__pct" }, "%")
          ),
          e(
            "div",
            { className: "ad-bigstat__cap" },
            e("b", null, "more vertical jump"),
            e("span", null, "vs. the train-to-exhaustion group — with 28% less fatigue."),
            e("em", null, "Frontiers in Physiology, 2026")
          )
        )
      ),
      e(
        "div",
        { className: "ad-foot" },
        e(Guarantee, null),
        e(Cta, null)
      )
    );
  }

  /* =========================================================
     ANGLE 2 — CONFIDENCE / RATIONAL  ("Why 'great job' isn't working")
     ========================================================= */

  // 2A — photo-led, verbatim headline
  function Ad_Conf_Photo() {
    return e(
      "div",
      { className: "ad ad--photo", "data-screen-label": "Confidence · Photo" },
      e(Photo, {
        id: "ps-conf-photo",
        focal: "50% 50%",
        src: "campaigns/multisport-fb/frames/strength-and-conditioning-mixed-mixed.jpg",
        placeholder: "Athlete training under the gym mantra wall",
      }),
      e("div", { className: "ad-scrim ad-scrim--top" }),
      e(TopBar, null),
      e(
        "div",
        { className: "ad-chip ad-chip--score" },
        e("span", { className: "ad-chip__k" }, "Their numbers · this month"),
        e(
          "div",
          { className: "ad-chip__grid" },
          e("div", null, e("b", null, "1.81", e("em", null, "s")), e("span", null, "10-yd ▲")),
          e("div", null, e("b", null, "20.5", e("em", null, "in")), e("span", null, "vert ▲"))
        )
      ),
      e("div", { className: "ad-scrim ad-scrim--bottom" }),
      e(
        "div",
        { className: "ad-lower" },
        e(Eyebrow, null, "Proof > Praise"),
        e(
          "h1",
          { className: "ad-h", style: { fontSize: "80px" } },
          "Here's why most young athletes ",
          e("span", { className: "hl" }, "lose confidence"),
          "."
        ),
        e("p", { className: "ad-sub" }, "(And what actually rebuilds it.)"),
        e(Guarantee, null),
        e(Cta, null)
      )
    );
  }

  // 2B — type-led, punchy alt + scoreboard mechanism
  function Ad_Conf_Type() {
    return e(
      "div",
      { className: "ad ad--type ad--arena", "data-screen-label": "Confidence · Type" },
      e("div", { className: "ad-arenaGrid" }),
      e("div", { className: "ad-boltGlow" }),
      e(TopBar, null),
      e(
        "div",
        { className: "ad-stack" },
        e(Eyebrow, null, "Two Kinds of Confidence"),
        e(
          "h1",
          { className: "ad-h", style: { fontSize: "104px" } },
          "Praise breaks. ",
          e("span", { className: "hl" }, "Proof"),
          " doesn't."
        ),
        e(
          "p",
          { className: "ad-lede" },
          "Confidence built on words cracks under pressure. The kind a kid builds from their own numbers, climbing every week, is the kind that holds when the game is on the line."
        ),
        e(Scoreboard, {
          title: "What they watch go up",
          rows: [
            { label: "Sprint · 10 yd", from: "1.94s", to: "1.81s" },
            { label: "Vertical jump", from: "17.5 in", to: "20.5 in" },
            { label: "Broad jump", from: "5'2\"", to: "5'8\"" },
          ],
        })
      ),
      e(
        "div",
        { className: "ad-foot" },
        e(Guarantee, null),
        e(Cta, null)
      )
    );
  }

  /* =========================================================
     ANGLE 3 — CONFIDENCE / EMOTIONAL  ("When they stop believing")
     ========================================================= */

  // 3A — photo-led, verbatim emotional headline
  function Ad_Believe_Photo() {
    return e(
      "div",
      { className: "ad ad--photo ad--warm", "data-screen-label": "Believe · Photo" },
      e(Photo, {
        id: "ps-believe-photo",
        focal: "46% 52%",
        src: "campaigns/multisport-fb/frames/landmine-lunge-believe.jpg",
        placeholder: "Solo athlete, focused training moment",
      }),
      e("div", { className: "ad-scrim ad-scrim--top" }),
      e(TopBar, null),
      e("div", { className: "ad-scrim ad-scrim--bottom ad-scrim--tall" }),
      e(
        "div",
        { className: "ad-lower" },
        e(Eyebrow, { tone: "soft" }, "The quiet car ride home"),
        e(
          "h1",
          { className: "ad-h", style: { fontSize: "88px" } },
          "When they stop ",
          e("span", { className: "hl" }, "believing"),
          "."
        ),
        e("p", { className: "ad-sub" }, "(And what actually rebuilds it.)"),
        e(Guarantee, null),
        e(Cta, null)
      )
    );
  }

  // 3B — type-led, punchy alt + case-study quote
  function Ad_Believe_Type() {
    return e(
      "div",
      { className: "ad ad--type ad--steel", "data-screen-label": "Believe · Type" },
      e("div", { className: "ad-arenaGrid" }),
      e("div", { className: "ad-boltGlow ad-boltGlow--soft" }),
      e(TopBar, null),
      e(
        "div",
        { className: "ad-stack" },
        e(Eyebrow, { tone: "soft" }, "You can't hand it to them"),
        e(
          "h1",
          { className: "ad-h", style: { fontSize: "96px" } },
          "You can't talk them into ",
          e("span", { className: "hl" }, "confidence"),
          "."
        ),
        e(
          "p",
          { className: "ad-lede" },
          "They have to see it for themselves — real sprint times and jump heights, climbing every week. The proof comes first. The belief grows out of it."
        ),
        e(
          "blockquote",
          { className: "ad-quote" },
          e("span", { className: "ad-quote__mark" }, "\u201C"),
          e(
            "p",
            null,
            "He was shy and wouldn't join anything. He got stronger here first — and the confidence followed. Now he plays."
          ),
          e("cite", null, "— a Power Source parent")
        )
      ),
      e(
        "div",
        { className: "ad-foot" },
        e(Guarantee, null),
        e(Cta, null)
      )
    );
  }

  Object.assign(window, {
    Ad_Speed_Photo,
    Ad_Speed_Type,
    Ad_Conf_Photo,
    Ad_Conf_Type,
    Ad_Believe_Photo,
    Ad_Believe_Type,
  });
})();
