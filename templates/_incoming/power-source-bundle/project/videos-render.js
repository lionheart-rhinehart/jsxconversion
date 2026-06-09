/* ============================================================
   POWER SOURCE — Multi-Sport VIDEO creatives — DETERMINISTIC RENDER build
   Same 6 creatives + identical anim() code as videos.js, but instead of the
   gallery/lightbox shell this mounts ONE creative full-frame (1080×1920) and
   exposes a frame-accurate seek API so a headless renderer can step the
   timeline:
     window.__mount(id)  -> Promise (mounts creative, loads its videos)
     window.__seek(t_ms) -> Promise (locks WAAPI + counters + typers + bg
                                     video clocks to t, awaits video seeks)
     window.__ids        -> ["1A","1B","2A","2B","3A","3B"]
     window.__CYC        -> master loop length (ms)
   Background <video>s are forced paused (autoplay/loop stripped); each frame
   their currentTime is set to t so the painted frame is deterministic.
   ============================================================ */
(function () {
  const CYC = 8000;              // master loop, ms
  const CLIP = "campaigns/multisport-fb/clips/";
  const LOGO = '<div class="v-logo v-logo--tr" data-a="logo"><img src="assets/logo/logo-reversed.png" alt="Power Source"></div>';
  const GUAR = '<div class="v-guartag" data-a="cta">+1 mph · +3 in · 90 days · or we train them free</div>';
  const CTA = '<div class="v-cta" data-a="cta"><div class="v-cta__btn"><span>Book the Athlete Analysis</span><b>→</b></div></div>';
  const vid = (src, cls, extra = "") => `<video class="${cls}" ${extra} src="${CLIP}${src}" muted playsinline preload="auto"></video>`;

  /* ---------------- timeline registries ---------------- */
  // baseTL is unused for stepping (we set animation.currentTime directly) but
  // kept so the anim() bodies copied verbatim from videos.js still run.
  const baseTL = (document.timeline && document.timeline.currentTime) || performance.now();
  let counters = [];   // {el, from, to, at, dur, dec, fmt}
  let typers = [];     // {el, text, at, dur, caret}

  function kfReveal(at, dur, fromT, exitT) {
    let s = at / CYC, ee = (at + dur) / CYC;
    s = Math.max(0.0005, Math.min(s, 0.9));
    ee = Math.max(s + 0.01, Math.min(ee, 0.92));
    return [
      { offset: 0, opacity: 0, transform: fromT },
      { offset: s, opacity: 0, transform: fromT, easing: "cubic-bezier(.18,1.25,.3,1)" },
      { offset: ee, opacity: 1, transform: "translateX(0px) translateY(0px) scale(1)" },
      { offset: 0.93, opacity: 1, transform: "translateX(0px) translateY(0px) scale(1)", easing: "ease-in" },
      { offset: 1, opacity: 0, transform: exitT || "translateY(-18px)" },
    ];
  }
  function reveal(els, at, dur, fromT, exitT) {
    toArr(els).forEach((el) => {
      const a = el.animate(kfReveal(at, dur, fromT, exitT), { duration: CYC, iterations: Infinity, fill: "both" });
      try { a.startTime = baseTL; } catch (e) {}
    });
  }
  function kfWipe(at, dur, fromClip, toClip, exitClip) {
    let s = at / CYC, ee = (at + dur) / CYC;
    s = Math.max(0.0005, Math.min(s, 0.9)); ee = Math.max(s + 0.01, Math.min(ee, 0.92));
    return [
      { offset: 0, clipPath: fromClip, opacity: 1 },
      { offset: s, clipPath: fromClip, easing: "cubic-bezier(.7,0,.2,1)" },
      { offset: ee, clipPath: toClip },
      { offset: 0.93, clipPath: toClip, easing: "ease-in" },
      { offset: 1, clipPath: exitClip || toClip, opacity: 1 },
    ];
  }
  function wipe(els, at, dur, fromClip, toClip, exitClip) {
    toArr(els).forEach((el) => {
      const a = el.animate(kfWipe(at, dur, fromClip, toClip, exitClip), { duration: CYC, iterations: Infinity, fill: "both" });
      try { a.startTime = baseTL; } catch (e) {}
    });
  }
  function scaleIn(els, at, dur, fromScale, origin) {
    toArr(els).forEach((el) => { el.style.transformOrigin = origin || "center"; });
    reveal(els, at, dur, `scale(${fromScale})`, "scale(1.04)");
  }
  function counter(el, from, to, at, dur, dec, fmt) { if (el) counters.push({ el, from, to, at, dur, dec: dec || 0, fmt }); }
  function typer(el, text, at, dur) { if (el) typers.push({ el, text, at, dur }); }
  function toArr(x) { return x == null ? [] : (x.forEach ? [...x] : [x]); }
  const R = (root, name) => root.querySelectorAll(`[data-a="${name}"]`);
  const r1 = (root, name) => root.querySelector(`[data-a="${name}"]`);

  /* timecode 00:00:FF formatter */
  const tcFmt = (v) => { const s = Math.floor(v); const ff = Math.floor((v - s) * 30); return "00:00:" + String(s * 30 + ff).padStart(2, "0").slice(-2); };

  /* ============================================================
     CREATIVES  (identical content + anim() to videos.js)
     ============================================================ */
  const CREATIVES = [
    /* ---------- 1A SPEED · MEDIA ---------- */
    {
      id: "1A", label: "1A · Speed — Media", note: "Cinematic clip + HUD telemetry",
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
        r1(root, "sweep").animate(
          [ { offset: 0, transform: "translateX(-110%)", opacity: 0 },
            { offset: 0.28, transform: "translateX(-110%)", opacity: 0 },
            { offset: 0.31, opacity: 1 },
            { offset: 0.42, transform: "translateX(110%)", opacity: 1 },
            { offset: 0.45, transform: "translateX(110%)", opacity: 0 },
            { offset: 1, transform: "translateX(110%)", opacity: 0 } ],
          { duration: CYC, iterations: Infinity, fill: "both" }).startTime = baseTL;
        reveal(R(root, "cta"), 3400, 600, "translateY(60px)");
        counter(r1(root, "tc"), 0, 7.6, 0, CYC, 0, tcFmt);
      },
    },

    /* ---------- 1B SPEED · TEXT ---------- */
    {
      id: "1B", label: "1B · Speed — Type", note: "Full-frame kinetic words + count-up",
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
      },
    },

    /* ---------- 2A CONFIDENCE · MEDIA ---------- */
    {
      id: "2A", label: "2A · Confidence — Media", note: "Clip + live count-up stat cards",
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
      },
    },

    /* ---------- 2B CONFIDENCE · TEXT ---------- */
    {
      id: "2B", label: "2B · Confidence — Type", note: "Praise-vs-proof + circle clip",
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
      },
    },

    /* ---------- 3A BELIEVE · MEDIA ---------- */
    {
      id: "3A", label: "3A · Believe — Media", note: "Cinematic film bars + soft script",
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
        r1(root, "barT").animate([{ transform: "translateY(-100%)" }, { offset: 0.1, transform: "translateY(0)" }, { offset: 0.9, transform: "translateY(0)" }, { transform: "translateY(-100%)" }], { duration: CYC, iterations: Infinity, fill: "both" }).startTime = baseTL;
        r1(root, "barB").animate([{ transform: "translateY(100%)" }, { offset: 0.1, transform: "translateY(0)" }, { offset: 0.9, transform: "translateY(0)" }, { transform: "translateY(100%)" }], { duration: CYC, iterations: Infinity, fill: "both" }).startTime = baseTL;
        reveal(R(root, "logo"), 600, 600, "translateY(-20px)");
        reveal(r1(root, "w0"), 900, 700, "translateY(20px)");
        reveal(r1(root, "w1"), 1500, 900, "translateY(26px)");
        reveal(r1(root, "w2"), 2500, 900, "translateY(26px)");
        reveal(R(root, "end"), 3800, 700, "translateY(20px)");
      },
    },

    /* ---------- 3B BELIEVE · TEXT ---------- */
    {
      id: "3B", label: "3B · Believe — Type", note: "Typewriter testimonial + soft clip",
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
      },
    },
  ];

  /* ============================================================
     DETERMINISTIC RENDER API
     ============================================================ */
  const byId = Object.fromEntries(CREATIVES.map((c) => [c.id, c]));
  let mountedVideos = [];

  // Run the counter + typewriter scripts at an absolute loop time t (ms).
  // Mirrors videos.js frame() body but with lt = t (no rAF, no real clock).
  function seekScripts(t) {
    const lt = t;
    const ease = (p) => 1 - Math.pow(1 - p, 3);
    for (const c of counters) {
      let p = (lt - c.at) / c.dur; p = p < 0 ? 0 : p > 1 ? 1 : p;
      const v = c.from + (c.to - c.from) * ease(p);
      c.el.textContent = c.fmt ? c.fmt(v) : v.toFixed(c.dec);
    }
    for (const tp of typers) {
      let p = (lt - tp.at) / tp.dur; p = p < 0 ? 0 : p > 1 ? 1 : p;
      const n = Math.round(tp.text.length * p);
      const blink = (Math.floor(lt / 320) % 2 === 0 && p < 1) ? '<span style="opacity:.6">▌</span>' : "";
      tp.el.innerHTML = tp.text.slice(0, n).replace(/\n/g, "<br>") + blink;
    }
  }

  window.__ids = CREATIVES.map((c) => c.id);
  window.__CYC = CYC;

  // Mount a single creative full-frame and prepare its background videos.
  window.__mount = async function (id) {
    const c = byId[id];
    if (!c) throw new Error("unknown creative id: " + id);
    counters = []; typers = []; mountedVideos = [];
    const root = document.getElementById("root");
    root.innerHTML = "";
    const el = document.createElement("div");
    el.className = "vid";
    el.innerHTML = c.html;
    root.appendChild(el);

    // Force background clips to be paused & seekable (no autoplay/loop).
    mountedVideos = [...el.querySelectorAll("video")];
    mountedVideos.forEach((v) => { v.autoplay = false; v.loop = false; v.muted = true; try { v.pause(); } catch (e) {} });

    // Build the WAAPI animations once (identical to videos.js).
    c.anim(el);

    // Wait for fonts + every clip's metadata so currentTime seeks land.
    try { await document.fonts.ready; } catch (e) {}
    await Promise.all(mountedVideos.map((v) => new Promise((res) => {
      if (v.readyState >= 1 && v.duration) return res();
      const done = () => res();
      v.addEventListener("loadedmetadata", done, { once: true });
      v.addEventListener("error", done, { once: true });
      setTimeout(done, 8000);
    })));
    return c.id;
  };

  // Lock the whole composition to loop time t (ms) and resolve once the
  // background video frames have been seeked + painted.
  window.__seek = async function (t) {
    // 1) WAAPI: pause every animation and pin its currentTime.
    document.getAnimations().forEach((a) => {
      try { a.pause(); a.currentTime = t; } catch (e) {}
    });
    // 2) counters + typewriters
    seekScripts(t);
    // 3) background clips -> the same loop time (all clips are longer than CYC)
    await Promise.all(mountedVideos.map((v) => new Promise((res) => {
      const dur = v.duration || 0;
      let target = t / 1000;
      if (dur && target > dur - 0.05) target = Math.max(0, dur - 0.05);
      if (Math.abs((v.currentTime || 0) - target) < 0.001) return res();
      const done = () => res();
      v.addEventListener("seeked", done, { once: true });
      v.addEventListener("error", done, { once: true });
      setTimeout(done, 4000);
      try { v.currentTime = target; } catch (e) { res(); }
    })));
    // settle a paint frame
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    return t;
  };
})();
