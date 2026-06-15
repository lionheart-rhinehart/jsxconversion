// creative-engine/shared/raf-clock.js
//
// SHARED, browser-injected DETERMINISTIC CLOCK for the renderer. Installed at
// document-start (before the design's own scripts), it replaces the page's
// requestAnimationFrame / performance.now with a clock WE drive frame-by-frame.
//
// Why not CDP virtual time: measured (.tmp/vidtest2.mjs) that under
// Emulation.setVirtualTimePolicy the <video> media pipeline never decodes a seeked frame
// (readyState stalls at 1, 'seeked' never fires) AND Page.captureScreenshot deadlocks on
// a quiet compositor. rAF count-ups need a controllable clock; <video> needs REAL time.
// A JS-level fake clock gives both: the page runs in real time (video decodes, capture
// works), while the design's requestAnimationFrame/performance.now are advanced
// deterministically by us — so raw rAF count-ups (which froze under the old static seek —
// .tmp/spike2.mjs) render the right value at every frame.
//
// Division of labor (unchanged): this drives rAF/performance.now. seek.js still pins
// WAAPI/CSS currentTime and seeks <video> (now in real time, so it actually decodes).
//
// The design captures `start = performance.now()` when it builds; at build our clock
// reads 0, so frame i maps cleanly to clock time i/fps with no extra anchoring.

(function (root) {
  'use strict';
  if (root.__ceClock) return; // idempotent

  var base = 0;                 // our virtual "now" in ms
  var rafQueue = [];            // pending requestAnimationFrame callbacks
  var nextId = 1;

  var origRAF = root.requestAnimationFrame;
  var origCAF = root.cancelAnimationFrame;

  // freeze performance.now to OUR clock (the count-up reads this)
  try {
    var perf = root.performance;
    Object.defineProperty(perf, 'now', { configurable: true, value: function () { return base; } });
  } catch (e) { try { root.performance.now = function () { return base; }; } catch (e2) {} }

  root.requestAnimationFrame = function (cb) { var id = nextId++; rafQueue.push({ id: id, cb: cb }); return id; };
  root.cancelAnimationFrame = function (id) {
    for (var i = 0; i < rafQueue.length; i++) { if (rafQueue[i].id === id) { rafQueue.splice(i, 1); return; } }
  };

  // run every currently-queued rAF callback once, stamped at time t. Callbacks that
  // re-request (count-ups loop until done) land in a fresh queue for the NEXT tick.
  function tick(t) {
    base = t;
    var q = rafQueue; rafQueue = [];
    for (var i = 0; i < q.length; i++) { try { q[i].cb(t); } catch (e) {} }
  }

  root.__ceClock = {
    now: function () { return base; },
    // advance to `target` ms, ticking rAF in `step`-ms substeps so both time-based
    // (count-ups) and incremental animations integrate correctly. Forward-or-equal only.
    advanceTo: function (target, step) {
      step = step || 16;
      if (target <= base) { tick(target); return; }
      while (base + step < target) { tick(base + step); }
      tick(target);
    },
    _origRAF: origRAF, _origCAF: origCAF,
  };
})(typeof window !== 'undefined' ? window : this);
