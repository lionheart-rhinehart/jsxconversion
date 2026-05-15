// Claude Design runtime shim.
// Provides the globals that Claude Design JSX files expect:
//   <Stage>, <Sprite>, useTime(), useSprite(), Easing, clamp, React (global)
// The renderer drives the clock externally via window.__setTime(t) and
// re-renders the root each frame.

(function () {
  const R = window.React;
  if (!R) throw new Error("React must be loaded before runtime.js");

  window.clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

  window.Easing = {
    linear: (t) => t,
    easeInQuad: (t) => t * t,
    easeOutQuad: (t) => 1 - (1 - t) * (1 - t),
    easeInOutQuad: (t) =>
      t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,
    easeInCubic: (t) => t * t * t,
    easeOutCubic: (t) => 1 - Math.pow(1 - t, 3),
    easeInOutCubic: (t) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
    easeInExpo: (t) => (t === 0 ? 0 : Math.pow(2, 10 * t - 10)),
    easeOutExpo: (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
    easeInOutExpo: (t) => {
      if (t === 0) return 0;
      if (t === 1) return 1;
      return t < 0.5
        ? Math.pow(2, 20 * t - 10) / 2
        : (2 - Math.pow(2, -20 * t + 10)) / 2;
    },
    easeInBack: (t) => {
      const c1 = 1.70158,
        c3 = c1 + 1;
      return c3 * t * t * t - c1 * t * t;
    },
    easeOutBack: (t) => {
      const c1 = 1.70158,
        c3 = c1 + 1;
      return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
    },
    easeInOutBack: (t) => {
      const c1 = 1.70158,
        c2 = c1 * 1.525;
      return t < 0.5
        ? (Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2)) / 2
        : (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2;
    },
    easeOutBounce: (t) => {
      const n1 = 7.5625,
        d1 = 2.75;
      if (t < 1 / d1) return n1 * t * t;
      if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
      if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
      return n1 * (t -= 2.625 / d1) * t + 0.984375;
    },
  };

  // The controllable clock.
  let __time = 0;
  window.__setTime = (t) => {
    __time = t;
  };
  window.__getTime = () => __time;

  // useTime: returns the current stage time. Components read this each render;
  // the renderer re-renders the root after each __setTime call.
  window.useTime = () => __time;

  const SpriteContext = R.createContext({ localTime: 0, duration: 0 });
  window.useSprite = () => R.useContext(SpriteContext);

  // <Sprite start={s} end={e}>children</Sprite>
  // Children mount only while __time is inside [start, end].
  window.Sprite = function Sprite(props) {
    const t = __time;
    const { start, end, children } = props;
    if (t < start || t >= end) return null;
    const localTime = t - start;
    const duration = end - start;
    return R.createElement(
      SpriteContext.Provider,
      { value: { localTime, duration } },
      children,
    );
  };

  // <Stage width height duration background persistKey>children</Stage>
  // Just a fixed-size positioning container for the composition.
  window.Stage = function Stage(props) {
    const { width, height, background, children } = props;
    return R.createElement(
      "div",
      {
        style: {
          position: "relative",
          width: width + "px",
          height: height + "px",
          background: background || "#000",
          overflow: "hidden",
        },
      },
      children,
    );
  };
})();
