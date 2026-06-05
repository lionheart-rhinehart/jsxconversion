# Animation Pitfalls (English)

> English translation of `animation-pitfalls.md` from the Huashu Design repo (MIT). Motion-quality rules. See the original for the full Chinese.

---

The bugs you hit most often when building animations, and how to avoid them. Every rule comes from a real failure.

Read this before you write an animation — it'll save you a round of iteration.

## 1. Stacked layout — `position: relative` is a non-negotiable obligation

**The pitfall**: A sentence-wrap element wrapped 3 bracket-layers (`position: absolute`). Because `position: relative` was never set on the sentence-wrap, the absolute brackets used `.canvas` as their coordinate system and drifted 200px off the bottom of the screen.

**Rule**:
- Any container holding `position: absolute` children **must** explicitly set `position: relative`.
- Even if you don't visually need an "offset," still write `position: relative` as the coordinate-system anchor.
- If you're writing `.parent { ... }` and any of its children have `.child { position: absolute }`, reflexively give the parent `relative`.

**Quick check**: For every `position: absolute` you write, count up the ancestor chain and confirm the nearest positioned ancestor is the coordinate system you *want*.

## 2. Character traps — don't rely on rare Unicode

**The pitfall**: We wanted to use `␣` (U+2423 OPEN BOX) to visualize a "space token." Neither Noto Serif SC nor Cormorant Garamond has that glyph, so it rendered as blank / tofu and the audience couldn't see it at all.

**Rule**:
- **Every character that appears in the animation must exist in the font you chose.**
- Common rare-character blacklist: `␣ ␀ ␐ ␋ ␨ ↩ ⏎ ⌘ ⌥ ⌃ ⇧ ␦ ␖ ␛`
- To represent meta-characters like "space / enter / tab," use a **CSS-constructed semantic box**:
  ```html
  <span class="space-key">Space</span>
  ```
  ```css
  .space-key {
    display: inline-flex;
    padding: 4px 14px;
    border: 1.5px solid var(--accent);
    border-radius: 4px;
    font-family: monospace;
    font-size: 0.3em;
    letter-spacing: 0.2em;
    text-transform: uppercase;
  }
  ```
- Verify emoji too: some emoji fall back to a gray box outside Noto Emoji — prefer an `emoji` font-family or SVG.

## 3. Data-driven Grid/Flex templates

**The pitfall**: The code had `const N = 6` tokens, but the CSS hardcoded `grid-template-columns: 80px repeat(5, 1fr)`. The 6th token had no column, and the whole matrix went out of alignment.

**Rule**:
- When the count comes from a JS array (`TOKENS.length`), the CSS template should be data-driven too.
- Option A: inject a CSS variable from JS:
  ```js
  el.style.setProperty('--cols', N);
  ```
  ```css
  .grid { grid-template-columns: 80px repeat(var(--cols), 1fr); }
  ```
- Option B: use `grid-auto-flow: column` and let the browser expand automatically.
- **Ban the "fixed number + JS constant" combination** — if N changes, the CSS won't update in sync.

## 4. Transition gaps — scene changes must be continuous

**The pitfall**: Between zoom1 (13–19s) → zoom2 (19.2–23s), the main sentence was already hidden. zoom1 fade out (0.6s) + zoom2 fade in (0.6s) + stagger delay (0.2s+) ≈ 1 full second of pure blank screen. The audience thought the animation had frozen.

**Rule**:
- When switching scenes continuously, fade out and fade in should **cross-overlap** — not "the previous one fully disappears, then the next one begins."
  ```js
  // Bad:
  if (t >= 19) hideZoom('zoom1');      // out at 19.0s
  if (t >= 19.4) showZoom('zoom2');    // in at 19.4s → 0.4s blank in the middle

  // Good:
  if (t >= 18.6) hideZoom('zoom1');    // start fade out 0.4s early
  if (t >= 18.6) showZoom('zoom2');    // fade in at the same time (cross-fade)
  ```
- Or use an "anchor element" (such as the main sentence) as the visual link between scenes, briefly re-showing it during the zoom transition.
- Do the math on your CSS transition durations so you don't trigger the next one before the current transition finishes.

## 5. Pure Render principle — animation state must be seekable

**The pitfall**: We used `setTimeout` + `fireOnce(key, fn)` to chain-trigger animation states. Normal playback was fine, but during frame-by-frame recording / seeking to an arbitrary time, the earlier setTimeouts had already fired and we couldn't "go back in time."

**Rule**:
- Ideally, `render(t)` is a **pure function**: given t, it outputs a unique DOM state.
- If you must use side effects (like toggling classes), use a `fired` set with an explicit reset:
  ```js
  const fired = new Set();
  function fireOnce(key, fn) { if (!fired.has(key)) { fired.add(key); fn(); } }
  function reset() { fired.clear(); /* clear all .show classes */ }
  ```
- Expose `window.__seek(t)` for Playwright / debugging:
  ```js
  window.__seek = (t) => { reset(); render(t); };
  ```
- Animation-related setTimeouts shouldn't span >1 second, or seeking backwards will scramble them.

## 6. Measuring before fonts load = measuring wrong

**The pitfall**: On `DOMContentLoaded`, the code called `charRect(idx)` to measure bracket positions while the font hadn't loaded yet, so each character's width was the fallback font's width and all positions were wrong. Once the font loaded (~500ms later), the bracket's `left: Xpx` was still the old value — a permanent offset.

**Rule**:
- Any layout code that depends on DOM measurement (`getBoundingClientRect`, `offsetWidth`) **must** be wrapped in `document.fonts.ready.then()`:
  ```js
  document.fonts.ready.then(() => {
    requestAnimationFrame(() => {
      buildBrackets(...);  // fonts are ready now, measurement is accurate
      tick();              // animation starts
    });
  });
  ```
- The extra `requestAnimationFrame` gives the browser one frame to commit layout.
- If using the Google Fonts CDN, add `<link rel="preconnect">` to speed up the first load.

## 7. Recording prep — leave handles for video export

**The pitfall**: Playwright `recordVideo` defaults to 25fps and starts recording the moment the context is created. The first ~2 seconds of page load and font load get recorded. The delivered video starts with 2 seconds of blank / white flash.

**Rule**:
- Provide a `render-video.js` tool that handles: warmup navigate → reload to restart the animation → wait the duration → ffmpeg trim the head + convert to H.264 MP4.
- The animation's **frame 0** must be the complete initial state with final layout already in place (not blank or loading).
- Want 60fps? Post-process with ffmpeg `minterpolate`; don't count on the browser's source frame rate.
- Want a GIF? Two-stage palette (`palettegen` + `paletteuse`) can compress a 30s 1080p animation down to 3MB.

See `video-export.md` for the full script invocation.

## 8. Batch export — tmp directories must carry a PID to prevent concurrency clashes

**The pitfall**: We used `render-video.js` to record 3 HTML files in 3 parallel processes. Because `TMP_DIR` was named only with `Date.now()`, three processes started in the same millisecond and shared the same tmp directory. The first to finish cleaned up the tmp dir, and the other two hit `ENOENT` reading the directory — all crashed.

**Rule**:
- Any temp directory that multiple processes might share must include a **PID or random suffix** in its name:
  ```js
  const TMP_DIR = path.join(DIR, '.video-tmp-' + Date.now() + '-' + process.pid);
  ```
- If you really want multi-file parallelism, use shell `&` + `wait` rather than forking inside one node script.
- When batch-recording multiple HTML files, the conservative move is to run them **serially** (2 or fewer can go parallel; 3+ should honestly queue up).

## 9. Progress bars / replay buttons in the recording — Chrome elements pollute the video

**The pitfall**: The animation HTML added a `.progress` bar, a `.replay` button, and a `.counter` timestamp to make playback easy to debug for humans. When recorded to the delivered MP4, these elements appeared at the bottom of the video — like accidentally screen-capturing the dev tools.

**Rule**:
- Manage the "chrome elements" meant for humans (progress bar / replay button / footer / masthead / counter / phase labels) separately from the video content itself.
- **Convention class name** `.no-record`: any element with this class is auto-hidden by the recording script.
- The script side (`render-video.js`) injects CSS by default to hide common chrome class names:
  ```
  .progress .counter .phases .replay .masthead .footer .no-record [data-role="chrome"]
  ```
- Inject via Playwright's `addInitScript` (takes effect before every navigate, stable across reloads).
- To see the raw HTML (with chrome), add a `--keep-chrome` flag.

## 10. The first few seconds of the recording repeat — warmup frame leak

**The pitfall**: The old `render-video.js` flow was `goto → wait fonts 1.5s → reload → wait duration`. Recording started the moment the context was created, so during warmup the animation had already played a stretch, and after the reload it restarted from 0. The result: the first few seconds of the video were "mid-animation + cut + animation starting from 0" — a strong sense of repetition.

**Rule**:
- **Warmup and Record must use separate contexts**:
  - Warmup context (no `recordVideo` option): only loads the url, waits for fonts, then closes.
  - Record context (with `recordVideo`): starts from a fresh state, records the animation from t=0.
- ffmpeg `-ss trim` can only shave off Playwright's tiny startup latency (~0.3s); it **cannot** be used to mask warmup frames — the source must be clean.
- Closing the record context = the webm file is written to disk; this is a Playwright constraint.
- Relevant code pattern:
  ```js
  // Phase 1: warmup (throwaway)
  const warmupCtx = await browser.newContext({ viewport });
  const warmupPage = await warmupCtx.newPage();
  await warmupPage.goto(url, { waitUntil: 'networkidle' });
  await warmupPage.waitForTimeout(1200);
  await warmupCtx.close();

  // Phase 2: record (fresh)
  const recordCtx = await browser.newContext({ viewport, recordVideo });
  const page = await recordCtx.newPage();
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(DURATION * 1000);
  await page.close();
  await recordCtx.close();
  ```

## 11. Don't draw "fake chrome" inside the frame — decorative player UI collides with real chrome

**The pitfall**: The animation used a `Stage` component that already ships a scrubber + timecode + pause button (these are `.no-record` chrome, auto-hidden on export). I then drew a "magazine-page-number-feel decorative progress bar" at the bottom of the frame — something like `00:60 ──── CLAUDE-DESIGN / ANATOMY` — feeling rather pleased with myself. **The result**: the user saw two progress bars — one from the Stage controller, one I'd drawn as decoration. Visually they collided completely and read as a bug. "Why is there another progress bar inside the video?"

**Rule**:

- The Stage already provides scrubber + timecode + pause/replay buttons. **Do not draw** progress indicators, current timecode, copyright credit bars, or chapter counters inside the frame — they'll either collide with the chrome or be filler slop (violating the "earn its place" principle).
- "Page-number feel," "magazine feel," "bottom credit bar" — these **decorative urges** are high-frequency filler that AI adds automatically. Every appearance should set off an alarm: does it actually convey irreplaceable information, or is it just filling empty space?
- If you're convinced a bottom strip must exist (e.g. the animation's subject literally *is* a player UI), it must be **narratively necessary** and **visually distinct from the Stage scrubber** (different position, different form, different tone).

**Element-ownership test** (every element drawn into the canvas must be able to answer):

| What it belongs to | Treatment |
|------------|------|
| Narrative content of a specific scene | OK, keep it |
| Global chrome (control/debug use) | Add `.no-record` class, hide on export |
| **Neither part of any scene nor chrome** | **Delete.** This is ownerless — necessarily filler slop |

**Self-check (3 seconds before delivery)**: Take a static screenshot and ask yourself —

- Is there anything in the frame "that looks like video player UI" (a horizontal progress bar, a timecode, control-button shapes)?
- If so, does deleting it hurt the narrative? If not, delete it.
- Does the same class of information (progress / time / credit) appear twice? Merge it into the single chrome location.

**Counterexamples**: drawing `00:42 ──── PROJECT NAME` at the bottom, a "CH 03 / 06" chapter counter in the bottom-right, a version number "v0.3.1" along the edge — all fake-chrome filler.

## 12. Leading blank + recording-start offset — the `__ready` × tick × lastTick triple trap

**Pitfall (A · leading blank)**: A 60-second animation exported to MP4 has 2–3 seconds of blank page at the front. `ffmpeg --trim=0.3` can't cut it.

**Pitfall (B · start offset, a real incident 2026-04-20)**: A 24-second video where the user perceived "the first frame doesn't play until 19 seconds in." What actually happened: the animation started recording at t=5, recorded to t=24, then looped back to t=0 and recorded another 5 seconds to the end — so the last 5 seconds of the video were the animation's real beginning.

**Root cause** (both pitfalls share one root cause):

Playwright `recordVideo` starts writing WebM the instant `newContext()` is called, while Babel/React/fonts take L seconds (2–6s) to load. The recording script waits for `window.__ready = true` as the "animation starts here" anchor — and it must be strictly paired with the animation's `time = 0`. There are two common mistakes:

| Mistake | Symptom |
|------|------|
| `__ready` set in `useEffect` or a synchronous setup phase (before tick's first frame) | The recording script thinks the animation has started, but WebM is still recording the blank page → **leading blank** |
| tick's `lastTick = performance.now()` initialized at the **top level of the script** | The L seconds of font loading get counted into the first frame's `dt`, `time` instantly jumps to L → the whole recording lags L seconds → **start offset** |

**✅ The correct, complete starter tick template** (hand-written animations must use this skeleton):

```js
// ━━━━━━ state ━━━━━━
let time = 0;
let playing = false;   // ❗ don't play by default; wait until fonts are ready to start
let lastTick = null;   // ❗ sentinel — force dt to 0 on tick's first frame (don't use performance.now())
const fired = new Set();

// ━━━━━━ tick ━━━━━━
function tick(now) {
  if (lastTick === null) {
    lastTick = now;
    window.__ready = true;   // ✅ pair: "recording start" and "animation t=0" on the same frame
    render(0);               // render once more to ensure the DOM is ready (fonts are ready by now)
    requestAnimationFrame(tick);
    return;
  }
  const dt = (now - lastTick) / 1000;   // only after the first frame does dt begin to advance
  lastTick = now;

  if (playing) {
    let t = time + dt;
    if (t >= DURATION) {
      t = window.__recording ? DURATION - 0.001 : 0;  // don't loop while recording; leave 0.001s to keep the last frame
      if (!window.__recording) fired.clear();
    }
    time = t;
    render(time);
  }
  requestAnimationFrame(tick);
}

// ━━━━━━ boot ━━━━━━
// Don't rAF immediately at the top level — wait until fonts finish loading to start
document.fonts.ready.then(() => {
  render(0);                 // draw the initial frame first (fonts are ready)
  playing = true;
  requestAnimationFrame(tick);  // the first tick will pair __ready + t=0
});

// ━━━━━━ seek interface (for render-video's defensive correction) ━━━━━━
window.__seek = (t) => { fired.clear(); time = t; lastTick = null; render(t); };
```

**Why this template is correct**:

| Step | Why it must be this way |
|------|-------------|
| `lastTick = null` + first-frame `return` | Avoids counting the L seconds from "script load to tick's first execution" into animation time |
| `playing = false` by default | During font loading, even if `tick` runs, it doesn't advance time, avoiding render misalignment |
| `__ready` set on tick's first frame | The recording script starts its clock at this instant, and the corresponding frame is the animation's true t=0 |
| Start tick only inside `document.fonts.ready.then(...)` | Sidesteps font-fallback width measurement and avoids a font jump on the first frame |
| `window.__seek` exists | Lets `render-video.js` proactively correct — a second line of defense |

**The corresponding defense on the recording-script side**:
1. `addInitScript` injects `window.__recording = true` (before page goto).
2. `waitForFunction(() => window.__ready === true)`, recording this offset for the ffmpeg trim.
3. **Additionally**: after `__ready`, proactively `page.evaluate(() => window.__seek && window.__seek(0))` to force any HTML time drift to zero — a second line of defense against HTML that doesn't strictly follow the starter template.

**How to verify**: after exporting the MP4
```bash
ffmpeg -i video.mp4 -ss 0 -vframes 1 frame-0.png
ffmpeg -i video.mp4 -ss $DURATION-0.1 -vframes 1 frame-end.png
```
The first frame must be the animation's t=0 initial state (not mid-animation, not black); the last frame must be the animation's final state (not some moment from a second loop).

**Reference implementation**: the Stage component in `assets/animations.jsx` and `scripts/render-video.js` already implement this protocol. Hand-written HTML must apply the starter tick template — every line of it defends against a specific bug.

## 13. No looping during recording — the `window.__recording` signal

**The pitfall**: The animation Stage defaults to `loop=true` (handy for previewing in the browser). `render-video.js` waits an extra 300ms of buffer after recording the duration seconds before stopping, and those 300ms let the Stage enter the next loop. When ffmpeg `-t DURATION` clips it, the last 0.5–1s falls into the next loop — the video's ending suddenly jumps back to the first frame (Scene 1), and viewers think the video is buggy.

**Root cause**: There's no "I'm recording" handshake protocol between the recording script and the HTML. The HTML doesn't know it's being recorded and keeps looping per its browser-interaction behavior.

**Rule**:

1. **Recording script**: inject `window.__recording = true` in `addInitScript` (before page goto):
   ```js
   await recordCtx.addInitScript(() => { window.__recording = true; });
   ```

2. **Stage component**: detect this signal and force loop=false:
   ```js
   const effectiveLoop = (typeof window !== 'undefined' && window.__recording) ? false : loop;
   // ...
   if (next >= duration) return effectiveLoop ? 0 : duration - 0.001;
   //                                                       ↑ leave 0.001 so a Sprite with end=duration isn't switched off
   ```

3. **The ending Sprite's fadeOut**: in a recording scenario it should be set to `fadeOut={0}`, otherwise the video's end fades to transparent/dark — the user expects to stop on a clear final frame, not a fade-out. For hand-written HTML, it's recommended to set `fadeOut={0}` on the ending Sprite.

**Reference implementation**: the Stage in `assets/animations.jsx` and `scripts/render-video.js` both have the handshake built in. Hand-written Stage must implement `__recording` detection — otherwise recording will hit this pitfall.

**Verification**: after exporting the MP4, `ffmpeg -ss 19.8 -i video.mp4 -frames:v 1 end.png`, and check whether the last 0.2 second is still the expected final frame, with no sudden switch to another scene.

## 14. 60fps video defaults to frame duplication — minterpolate has poor compatibility

**The pitfall**: The 60fps MP4 produced by `convert-formats.sh` using `minterpolate=fps=60:mi_mode=mci...` could not be opened in some versions of macOS QuickTime / Safari (all black, or outright refused). VLC / Chrome could open it.

**Root cause**: The H.264 elementary stream that minterpolate outputs contains certain SEI / SPS fields that some players have trouble parsing.

**Rule**:

- Default 60fps to the simple `fps=60` filter (frame duplication) for broad compatibility (QuickTime/Safari/Chrome/VLC all open it).
- Enable high-quality interpolation explicitly with a `--minterpolate` flag — but you **must test it locally** on the target player before delivery.
- The value of the 60fps label is **the upload platform's algorithmic recognition** (on Bilibili / YouTube, a 60fps marker gets priority distribution); the actual perceived smoothness improvement for CSS animations is marginal.
- Add `-profile:v high -level 4.0` to improve general H.264 compatibility.

**`convert-formats.sh` now defaults to compatibility mode.** If you need high-quality interpolation, add the `--minterpolate` flag:
```bash
bash convert-formats.sh input.mp4 --minterpolate
```

## 15. The `file://` + external `.jsx` CORS trap — single-file delivery must inline the engine

**The pitfall**: The animation HTML loaded the engine externally with `<script type="text/babel" src="animations.jsx"></script>`. Double-clicking to open locally (`file://` protocol) → Babel Standalone fetches the `.jsx` via XHR → Chrome reports `Cross origin requests are only supported for protocol schemes: http, https, chrome, chrome-extension...` → the whole page goes black. It doesn't fire `pageerror`, only a console error, so it's easily misdiagnosed as "the animation didn't trigger."

Starting an HTTP server may not save you either — when the machine has a global proxy, even `localhost` goes through the proxy and returns 502 / connection failure.

**Rule**:

- **Single-file delivery (an HTML that works on double-click)** → `animations.jsx` must be **inlined** inside a `<script type="text/babel">...</script>` tag, not loaded via `src="animations.jsx"`.
- **Multi-file project (demoed by starting an HTTP server)** → external loading is fine, but at delivery clearly state the `python3 -m http.server 8000` command.
- The deciding question: are you delivering an "HTML file" or a "project directory with a server"? The former uses inlining.
- The Stage component / animations.jsx is often 200+ lines — pasting it into the HTML `<script>` block is completely acceptable, don't worry about the size.

**Minimum verification**: double-click the HTML you generated; do **not** open it through any server. Only if the Stage displays the animation's first frame correctly does it pass.

## 16. Cross-scene inverted-color context — don't hardcode colors on in-frame elements

**The pitfall**: In a multi-scene animation, elements that **appear across every scene** — `ChapterLabel` / `SceneNumber` / `Watermark` — hardcoded `color: '#1A1A1A'` (dark text) in the component. The first 4 scenes had light backgrounds and were fine; by the 5th, a black-background scene, the "05" and the watermark simply vanished — no error, no check triggered, critical info invisible.

**Rule**:

- **In-frame elements reused across multiple scenes** (chapter label / scene number / timecode / watermark / copyright bar) **must not hardcode color values.**
- Use one of three approaches instead:
  1. **`currentColor` inheritance**: the element only writes `color: currentColor`, and the parent scene container sets `color: <computed value>`.
  2. **invert prop**: the component accepts `<ChapterLabel invert />` to manually toggle light/dark.
  3. **Auto-compute from the background**: `color: contrast-color(var(--scene-bg))` (the CSS 4 new API, or a JS check).
- Before delivery, use Playwright to grab **a representative frame of each scene** and eyeball whether the "cross-scene elements" are all visible.

The insidiousness of this pitfall is that **there's no bug alarm**. Only human eyes or OCR can catch it.

## 17. Truly self-contained, offline / no-CDN — fully inline React/Babel, and the engine must be transpiled too

**The pitfall (2026-05 Miyou promo animation)**: The animation HTML used `<script src="https://unpkg.com/react...">` + `<script src=".../@babel/standalone">` over CDN. The machine had a global proxy, and during Playwright recording, chromium hit `net::ERR_CONNECTION_CLOSED` connecting to unpkg / Google Fonts:

1. React/ReactDOM didn't load → `window.React undefined`.
2. Babel didn't load → the JSX inside `<script type="text/babel">` ran as plain JS → `Unexpected token '<'`.

After fixing React/Babel, we hit a second pitfall: **inlining the `animations.jsx` engine as a plain `<script>` still threw `Unexpected token '<'` → `window.Animations is undefined`**. Root cause: **the `animations.jsx` engine itself contains JSX** (`Stage`/`Sprite` components `return (<div>...)`), and it was originally designed to be loaded via `<script type="text/babel">` and transpiled by Babel. We only transpiled the app code and forgot to transpile the engine → that engine's JSX never got compiled.

**Rule** (when building a truly self-contained single file that's "double-click to open / offline / recordable by Playwright"):

- **Inline React + ReactDOM locally**: `curl` down `react.production.min.js` (~10KB) + `react-dom.production.min.js` (~131KB) locally, inline them into `<script>`, no CDN.
- **Pre-compile with Babel at build time, ship no Babel at runtime**: use `@babel/standalone` (downloaded once, build-only) in node via `Babel.transform(src, {presets:['react']}).code` to turn JSX → `React.createElement`. **Both the app and the `animations.jsx` engine must go through transform** — the engine contains JSX; skipping it guarantees `Unexpected token '<'`.
- **Switch fonts to system fonts**: the Google Fonts CDN is likewise cut off by the proxy. Chinese animations use the system fonts `'PingFang SC'` (sans) / `'Songti SC'` (serif), no network dependency. `document.fonts.ready` resolves immediately for system fonts, so recording doesn't stall.
- **Inline image assets as base64**: `<img src="png/x.png">` relative paths render under `file://`, but for true portability (no missing images when the file is moved), inline as base64 data URLs; for big background images, convert to JPEG and compress first, then base64.
- **Templatize the build**: leave `__REACT__/__REACTDOM__/__ASSETS__/__ENGINE__` tokens in the HTML template plus a chunk of `type="text/jsx-source"` app source, and a node build script reads the tokens and injects (vendor verbatim; engine + app through Babel) → writes out the final single file. To change the animation, just edit the template and re-run the build.

**Verification**: Playwright `page.evaluate(()=>({React:typeof window.React, Animations:typeof window.Animations}))` — both should be `object`. Either being `undefined` → the corresponding `<script>` threw (most likely un-transpiled JSX).

**Relationship to pitfall #15**: #15 says "single files shouldn't `src=`-link an external `.jsx` (file:// CORS)"; this pitfall goes further — even the **remote CDNs for React/Babel/fonts get cut off on a restricted network**, so true self-containment requires fully inlining + transpiling at build time.

## Quick self-check list (5 seconds before you start)

- [ ] Does every `position: absolute` element's parent have `position: relative`?
- [ ] Do all special characters in the animation (`␣` `⌘` `emoji`) exist in the font?
- [ ] Does the Grid/Flex template's count match the JS data's length?
- [ ] Is there a cross-fade between scene changes, with no pure blank >0.3s?
- [ ] Is DOM-measurement code wrapped in `document.fonts.ready.then()`?
- [ ] Is `render(t)` pure, or does it have an explicit reset mechanism?
- [ ] Is frame 0 a complete initial state, not blank?
- [ ] Is there no "fake chrome" decoration in the frame (progress bar / timecode / bottom credit bar colliding with the Stage scrubber)?
- [ ] Does the animation tick set `window.__ready = true` synchronously on the first frame? (Built into animations.jsx; for hand-written HTML, add it yourself.)
- [ ] Does the Stage detect `window.__recording` and force loop=false? (Must add for hand-written HTML.)
- [ ] Is the ending Sprite's `fadeOut` set to 0 (so the video ends on a clear frame)?
- [ ] Does the 60fps MP4 default to frame-duplication mode (compatibility), with `--minterpolate` added only for high quality?
- [ ] After export, did you grab frame 0 + the last frame to verify they're the animation's initial/final states?
- [ ] For specific brands (Stripe/Anthropic/Lovart/...): did you complete the "brand-asset protocol" (SKILL.md §1.a five steps)? Did you write `brand-spec.md`?
- [ ] For single-file HTML delivery: is `animations.jsx` inlined, not `src="..."`? (External .jsx under file:// causes a CORS black screen.)
- [ ] Do cross-scene elements (chapter label / watermark / scene number) avoid hardcoded colors? Are they visible against every scene's background?
- [ ] For offline / truly self-contained: React+ReactDOM inlined locally, **both the app and the `animations.jsx` engine transpiled through Babel**, fonts using system fonts? (See pitfall #17; the engine contains JSX — skipping transpilation guarantees `Unexpected token '<'`.)
