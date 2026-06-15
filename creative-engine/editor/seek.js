// creative-engine/editor/seek.js
//
// The SHARED, deterministic "freeze the design at timestamp t" routine. Like
// apply-overrides.js, this ONE function runs in both the live editor capture and the
// headless renderer, so a given t produces the same pixels in both — the guarantee
// the Phase-2 evidence rests on.
//
// Why this exists: naively `video.currentTime = t; await 'seeked'` is NOT reliable
// when the clip was just swapped (the override calls load(), which resets time to 0
// and reloads asynchronously) and when the element still has autoplay. The seek can
// silently land back on frame 0, and two browser contexts then disagree. This routine
// pauses + de-loops every video, waits for it to be seekable, sets currentTime, and
// VERIFIES it stuck (retrying), then waits for the decoded frame to paint. CSS
// (Web-Animations) timelines are paused and pinned to t the same way.

(function (root) {
  'use strict';

  function raf2() { return new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))); }

  async function ready(v) {
    if (v.readyState >= 2) return;             // HAVE_CURRENT_DATA
    await new Promise((res) => {
      const done = () => res();
      v.addEventListener('loadeddata', done, { once: true });
      v.addEventListener('canplay', done, { once: true });
      setTimeout(done, 3000);
    });
  }

  async function seekTo(v, target) {
    for (let attempt = 0; attempt < 4; attempt++) {
      await new Promise((res) => {
        let done = false; const fin = () => { if (!done) { done = true; res(); } };
        v.addEventListener('seeked', fin, { once: true });
        try { v.pause(); v.currentTime = target; } catch (e) { fin(); }
        setTimeout(fin, 800);
      });
      if (Math.abs(v.currentTime - target) < 0.05) break; // it stuck
    }
    // wait for the decoded frame to actually be presented
    await new Promise((res) => {
      let done = false; const fin = () => { if (!done) { done = true; res(); } };
      if (v.requestVideoFrameCallback) v.requestVideoFrameCallback(() => fin());
      setTimeout(fin, 250);
    });
  }

  async function seekVideo(v, tMs) {
    try { v.pause(); v.loop = false; v.autoplay = false; } catch (e) {}
    // MONTAGE branch (Phase D): a <video> tagged with __ceMontage is driven, not looped.
    // Pick the on-screen clip + offset with the SAME frame-exact math the renderer used
    // (window.CEMontage.montageAt), swap to that clip's src, and seek to in+localOffset.
    // No `% duration` here — montageAt already wrapped the cycle. If the math helper isn't
    // loaded (e.g. a non-editor context), fall through to the plain loop below.
    var mont = v.__ceMontage;
    if (mont && root.CEMontage && Array.isArray(mont.clips) && mont.clips.length) {
      const fps = mont.fps || 30;
      const at = root.CEMontage.montageAt(mont.clips, fps, tMs);
      if (at.clipIndex >= 0 && at.clip && at.clip.src) {
        const cur = v.currentSrc || v.getAttribute('src') || '';
        if (cur.indexOf(at.clip.src) < 0) { v.setAttribute('src', at.clip.src); try { v.load && v.load(); } catch (e) {} }
        await ready(v);
        if (!v.duration || !isFinite(v.duration) || v.duration <= 0) return;
        await seekTo(v, Math.min(v.duration - 1e-3, (Number(at.clip.in) || 0) + at.localOffsetMs / 1000));
        return;
      }
    }
    await ready(v);
    if (!v.duration || !isFinite(v.duration) || v.duration <= 0) return;
    await seekTo(v, (tMs / 1000) % v.duration);
  }

  // root = the element/document to freeze; tMs = timeline position in ms.
  // opts.noRaf: skip the rAF paint-settle. The renderer drives the design's rAF with an
  //   injected JS clock (creative-engine/shared/raf-clock.js) that only ticks when the
  //   renderer advances it — so page requestAnimationFrame won't fire on its own and
  //   awaiting raf2() would hang. We still pin WAAPI/CSS (the JS clock doesn't drive the
  //   document timeline) and seek <video> (real-time decode/events).
  async function seekFrame(root, tMs, opts) {
    opts = opts || {};
    const doc = root.ownerDocument || root;
    await (doc.fonts ? doc.fonts.ready : Promise.resolve());
    // pin every CSS keyframe timeline
    doc.getAnimations({ subtree: true }).forEach((a) => { try { a.pause(); a.currentTime = tMs; } catch (e) {} });
    const scope = root.querySelectorAll ? root : doc;
    const vids = Array.prototype.slice.call(scope.querySelectorAll('video'));
    await Promise.all(vids.map((v) => seekVideo(v, tMs)));
    // re-pin animations once more (in case a swap/seek nudged the clock) + settle paint
    doc.getAnimations({ subtree: true }).forEach((a) => { try { a.pause(); a.currentTime = tMs; } catch (e) {} });
    if (!opts.noRaf) await raf2();
  }

  root.CESeek = seekFrame;
  if (typeof module !== 'undefined' && module.exports) module.exports = { seekFrame: seekFrame };
})(typeof window !== 'undefined' ? window : this);
