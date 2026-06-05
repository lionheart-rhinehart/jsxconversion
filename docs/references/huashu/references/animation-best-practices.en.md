# Animation Best Practices (English)

> English translation of `animation-best-practices.md` from the Huashu Design repo (MIT). Positive motion-quality patterns. See the original for the full Chinese.

---

# Animation Best Practices · Positive Motion-Design Grammar

> Distilled "Anthropic-grade" animation design rules, based on a deep teardown of
> Anthropic's three official product films (Claude Design / Claude Code Desktop / Claude for Word).
>
> Use alongside `animation-pitfalls.md` (the anti-patterns checklist) — this file is "**do it this way**,"
> pitfalls is "**don't do this**." The two are orthogonal; read both.
>
> **Constraint statement**: This file captures only **motion logic and expressive style**, and introduces **no specific brand color values**.
> Color decisions go through §1.a Core Asset Protocol (extracted from the brand spec) or the "Design Direction Advisor"
> (the color schemes of each of the 20 philosophies). This reference discusses "**how things move**," not "**what color they are**."

---

## §0 · Who You Are · Identity and Taste

> Before reading any of the technical rules below, read this section first. The rules **emerge from the identity** —
> not the other way around.

### §0.1 Identity Anchor

**You are a motion designer who has studied the motion archives of Anthropic / Apple / Pentagram / Field.io.**

When you make animation, you are not tweaking CSS transitions — you are using digital elements to **simulate a physical world**,
making the viewer's subconscious believe "this is an object with weight, with inertia, that overshoots."

You don't make PowerPoint-style animation. You don't make "fade in / fade out" animation. The animation you make **makes people believe the screen
is a space you can reach into**.

### §0.2 Core Beliefs (3)

1. **Animation is physics, not animation curves.**
   `linear` is a number; `expoOut` is an object. You believe the pixels on the screen deserve to be treated as "objects."
   Every choice of easing is answering the physical question: "How heavy is this element? How much friction does it have?"

2. **Time allocation matters more than curve shape.**
   Slow-Fast-Boom-Stop is your breathing. **Evenly paced animation is a tech demo; rhythmic animation is narrative.**
   Slowing down at the right moment matters more than using the right easing at the wrong moment.

3. **Deferring to the viewer is harder than showing off.**
   Pausing 0.5s before a key result is **craft**, not compromise. **Giving the human brain time to react is the highest virtue of an animator.**
   By default AI makes an animation with no pauses and information density maxed out — that's a beginner. What you do is restraint.

### §0.3 Taste Standard · What Is Beauty

Here is how you judge "good" versus "great." Each one has a **recognition method** — when you look at a candidate animation,
use these questions to judge whether it makes the grade, rather than mechanically checking off 14 rules.

| Dimension of beauty | Recognition method (viewer reaction) |
|---|---|
| **Physical weight** | When the animation ends, the element "**lands**" steadily — it doesn't just "**stop**" there. The viewer's subconscious feels "this has weight" |
| **Deferring to the viewer** | Before key information appears there is a perceptible pause (≥300ms) — the viewer has time to "**see**" before things continue |
| **Negative space** | The ending is an abrupt stop + hold, not a fade to black. The final frame is clear, affirmative, decisive |
| **Restraint** | The whole film has only one spot of "120% polish"; the other 80% is just right — **showing off everywhere is a cheap signal** |
| **Feel** | Arcs (not straight lines), irregularity (not the mechanical rhythm of setInterval), a sense of breathing |
| **Respect** | Show the process of tweaking, show the bug being fixed — **don't hide the work, don't sell "magic."** AI is a collaborator, not a magician |

### §0.4 Self-Check · The Viewer's-First-Reaction Method

After finishing an animation, **what is the viewer's first reaction?** — this is the only metric you optimize.

| Viewer reaction | Rating | Diagnosis |
|---|---|---|
| "Looks pretty smooth" | good | Passable but featureless; you're making PowerPoint |
| "That animation is really smooth" | good+ | The technique is right, but nothing dazzles |
| "That thing really looks like it's **floating up off the desktop**" | great | You touched physical weight |
| "This doesn't look like AI made it" | great+ | You touched the Anthropic threshold |
| "I want to **screenshot** this and share it" | great++ | You got the viewer to spread it on their own |

**The difference between great and good is not technical correctness — it's taste judgment.** Technically correct + right taste = great.
Technically correct + empty taste = good. Technically wrong = you haven't started.

### §0.5 The Relationship Between Identity and Rules

The technical rules in §1-§8 below are the **execution means** of this identity in concrete situations — not a standalone rule list.

- Hit a situation the rules don't cover → go back to §0 and judge by **identity**, don't guess blindly.
- Hit a conflict between rules → go back to §0 and judge by **taste standard** which one matters more.
- Want to break a rule → first answer: "Which beauty in §0.3 does this serve?" If you can answer, break it; if not, don't.

Good. Read on.

---

## Overview · Animation Is Physics, Unfolded in Three Layers

The root of the cheap feeling in most AI-generated animation is that **they behave like "numbers," not "objects."**
Real-world objects have mass, inertia, elasticity, and overshoot. The root of the "premium feel" in Anthropic's three films
is precisely that they give digital elements a full set of **physical-world motion rules**.

These rules have 3 layers:

1. **Narrative rhythm layer**: the time allocation of Slow-Fast-Boom-Stop
2. **Motion curve layer**: Expo Out / Overshoot / Spring — reject linear
3. **Expressive language layer**: showing the process, mouse arcs, Logo morph-and-converge

---

## 1. Narrative Rhythm · The 5-Part Slow-Fast-Boom-Stop Structure

Without exception, Anthropic's three films follow this structure:

| Segment | Share | Pace | Function |
|---|---|---|---|
| **S1 Trigger** | ~15% | Slow | Gives humans reaction time, establishes realism |
| **S2 Generate** | ~15% | Medium | The visual wow moment appears |
| **S3 Process** | ~40% | Fast | Shows controllability / density / detail |
| **S4 Burst** | ~20% | Boom | Camera pulls back / 3D pop-out / multi-panel surge |
| **S5 Landing** | ~10% | Still | Brand Logo + abrupt stop |

**Concrete duration mapping** (using a 15-second animation as example):
S1 Trigger 2s · S2 Generate 2s · S3 Process 6s · S4 Burst 3s · S5 Landing 2s

**Things you must not do:**
- ❌ Even pacing (same information density every second) — viewer fatigue
- ❌ Sustained high density — no peak, no memorable moment
- ❌ A fading ending (fade out to transparent) — it should be an **abrupt stop**

**Self-check**: Sketch 5 thumbnails with pen and paper, each representing the climax frame of one segment. If the 5 images look much the same,
your rhythm didn't land.

---

## 2. Easing Philosophy · Reject linear, Embrace Physics

Every motion in Anthropic's three films uses Bézier curves with a sense of "damping." The default cubic easeOut
(`1-(1-t)³`) **isn't sharp enough** — the start isn't fast enough, the stop isn't steady enough.

### Three Core Easings (built into animations.jsx)

```js
// 1. Expo Out · fast launch, slow braking (most common, default primary easing)
// CSS equivalent: cubic-bezier(0.16, 1, 0.3, 1)
Easing.expoOut(t) // = t === 1 ? 1 : 1 - Math.pow(2, -10 * t)

// 2. Overshoot · elastic toggle / button pop-out
// CSS equivalent: cubic-bezier(0.34, 1.56, 0.64, 1)
Easing.overshoot(t)

// 3. Spring physics · geometry settling home, natural landing
Easing.spring(t)
```

### Usage Mapping

| Scenario | Which easing |
|---|---|
| Card rise-in / panel entrance / Terminal fade / focus overlay | **`expoOut`** (primary easing, most common) |
| Toggle switch / button pop-out / emphasis interaction | `overshoot` |
| Preview geometry settling / physical landing / UI element jiggle | `spring` |
| Sustained motion (e.g. mouse-trail interpolation) | `easeInOut` (preserves symmetry) |

### Counterintuitive Insight

Most product promo animation is **too fast and too hard.** `linear` makes digital elements feel like a machine, `easeOut` is the baseline pass,
and `expoOut` is the technical root of "premium feel" — it gives digital elements a kind of **physical-world weight**.

---

## 3. Motion Language · 8 Shared Principles

### 3.1 Don't Use Pure Black or Pure White for the Base

Not one of Anthropic's three films uses `#FFFFFF` or `#000000` as its main base color. A **neutral with a color temperature**
(warm or cool) has the material feel of "paper / canvas / desktop," which weakens the machine feeling.

**Concrete color-value decisions** go through §1.a Core Asset Protocol (extracted from the brand spec) or the "Design Direction Advisor"
(the base-color scheme of each of the 20 philosophies). This reference gives no specific color values — that is a **brand decision**, not a motion rule.

### 3.2 Easing Is Never linear

See §2.

### 3.3 Slow-Fast-Boom-Stop Narrative

See §1.

### 3.4 Show the "Process," Not the "Magic Result"

- Claude Design shows tweaking parameters and dragging sliders (not one-click perfect generation)
- Claude Code shows code errors + AI fixing them (not a first-try success)
- Claude for Word shows the Redline edit process of red deletions and green additions (not jumping straight to the final draft)

**The shared subtext**: the product is a **collaborator, a pair engineer, a senior editor** — not a one-click magician.
This precisely targets professional users' pain points around "controllability" and "authenticity."

**Anti-AI-slop**: by default AI makes "magic one-click success" animation (one click → perfect result),
which is the common denominator. **Do the opposite** — show the process, show the tweaking, show the bug and the fix —
that is the source of brand recognizability.

### 3.5 Hand-Drawn Mouse Trails (Arc + Perlin Noise)

A real person's mouse motion is not a straight line; it's "accelerate from the start → arc → decelerate and correct → click."
A mouse trail that AI interpolates straight has a **subconscious repulsion** to it.

```js
// Quadratic Bézier interpolation (start → control point → end)
function bezierQuadratic(p0, p1, p2, t) {
  const x = (1-t)*(1-t)*p0[0] + 2*(1-t)*t*p1[0] + t*t*p2[0];
  const y = (1-t)*(1-t)*p0[1] + 2*(1-t)*t*p1[1] + t*t*p2[1];
  return [x, y];
}

// Path: start → offset midpoint → end (creates an arc)
const path = [[100, 100], [targetX - 200, targetY + 80], [targetX, targetY]];

// Then layer on tiny Perlin Noise (±2px) to create "hand tremor"
const jitterX = (simpleNoise(t * 10) - 0.5) * 4;
const jitterY = (simpleNoise(t * 10 + 100) - 0.5) * 4;
```

### 3.6 Logo "Morph-and-Converge"

In all three Anthropic films the Logo entrance **is never a simple fade-in** — it **morphs out of the previous visual element**.

**The shared pattern**: in the final 1-2 seconds, do a Morph / Rotate / Converge, letting the whole narrative "collapse" onto the brand point.

**Low-cost implementation** (without a true morph):
have the previous visual element "collapse" into a color block (scale → 0.1, translate toward center),
then have the color block "expand" out into the wordmark. Use a 150ms hard cut + motion blur for the transition
(`filter: blur(6px)` → `0`).

```js
<Sprite start={13} end={14}>
  {/* Collapse: previous element scale 0.1, opacity held, filter blur increases */}
  const scale = interpolate(t, [0, 0.5], [1, 0.1], Easing.expoOut);
  const blur = interpolate(t, [0, 0.5], [0, 6]);
</Sprite>
<Sprite start={13.5} end={15}>
  {/* Expand: Logo scales from color-block center 0.1 → 1, blur 6 → 0 */}
  const scale = interpolate(t, [0, 0.6], [0.1, 1], Easing.overshoot);
  const blur = interpolate(t, [0, 0.6], [6, 0]);
</Sprite>
```

### 3.7 Serif + Sans-Serif Dual Typefaces

- **Brand / narration**: serif (has "academic feel / publication feel / taste")
- **UI / code / data**: sans-serif + monospace

**A single typeface is always wrong.** Serif gives "taste," sans-serif gives "function."

Concrete typeface choices go through the brand spec (the Display / Body / Mono three-stack of brand-spec.md) or the
Design Direction Advisor's 20 philosophies. This reference gives no specific typefaces — that is a **brand decision**.

### 3.8 Focus Shift = Background Dimming + Foreground Sharpening + Flash Guide

A focus shift is **not just** lowering opacity. The complete recipe is:

```js
// Filter combination for non-focused elements
tile.style.filter = `
  brightness(${1 - 0.5 * focusIntensity})
  saturate(${1 - 0.3 * focusIntensity})
  blur(${focusIntensity * 4}px)        // ← key: only adding blur really makes it "recede"
`;
tile.style.opacity = 0.4 + 0.6 * (1 - focusIntensity);

// After the focus completes, do a 150ms Flash highlight at the focus position to guide the gaze back
focusOverlay.animate([
  { background: 'rgba(255,255,255,0.3)' },
  { background: 'rgba(255,255,255,0)' }
], { duration: 150, easing: 'ease-out' });
```

**Why blur is mandatory**: relying on opacity + brightness alone, the out-of-focus elements are still "sharp,"
so visually there's no "receding to the background" effect. blur(4-8px) makes the non-focus truly drop a layer of depth.

---

## 4. Concrete Motion Techniques (Copy-Paste-Ready Code Snippets)

### 4.1 FLIP / Shared Element Transition

A button "expands" into an input field — **not** the button disappearing + a new panel appearing. The core is **the same DOM element**
transitioning between two states, not two elements cross-fading.

```jsx
// Using Framer Motion layoutId
<motion.div layoutId="design-button">Design</motion.div>
// ↓ same layoutId after click
<motion.div layoutId="design-button">
  <input placeholder="Describe your design..." />
</motion.div>
```

For a native implementation, see https://aerotwist.com/blog/flip-your-animations/

### 4.2 "Breathing" Expansion (width→height)

A panel expands **not by pulling width and height at the same time**, but:
- First 40% of the time: pull width only (keep height small)
- Last 60% of the time: hold width, grow height

This simulates the physical-world feeling of "first unfold, then fill with water."

```js
const widthT = interpolate(t, [0, 0.4], [0, 1], Easing.expoOut);
const heightT = interpolate(t, [0.3, 1], [0, 1], Easing.expoOut);
style.width = `${widthT * targetW}px`;
style.height = `${heightT * targetH}px`;
```

### 4.3 Staggered Fade-up (30ms stagger)

When table rows, card columns, or list items enter, **delay each element by 30ms**, with `translateY` returning from 10px to 0.

```js
rows.forEach((row, i) => {
  const localT = Math.max(0, t - i * 0.03);  // 30ms stagger
  row.style.opacity = interpolate(localT, [0, 0.3], [0, 1], Easing.expoOut);
  row.style.transform = `translateY(${
    interpolate(localT, [0, 0.3], [10, 0], Easing.expoOut)
  }px)`;
});
```

### 4.4 Nonlinear Breathing · Hold 0.5s Before the Key Result

The machine executes fast and continuously, but **hover for 0.5 seconds before the key result appears**, giving the viewer's brain reaction time.

```jsx
// Typical scenario: AI finishes generating → hover 0.5s → result emerges
<Sprite start={8} end={8.5}>
  {/* 0.5s pause — nothing moves, let the viewer stare at the loading state */}
  <LoadingState />
</Sprite>
<Sprite start={8.5} end={10}>
  <ResultAppear />
</Sprite>
```

**Counter-example**: AI finishes generating and instantly cuts seamlessly to the result — the viewer has no reaction time, information is lost.

### 4.5 Chunk Reveal · Simulating Token Streaming

AI-generated text **should not pop out one character at a time with `setInterval`** (like old-movie subtitles); use **chunk reveal**
— 2-5 characters appearing at once, at irregular intervals, simulating real token-streaming output.

```js
// Split into chunks rather than characters
const chunks = text.split(/(\s+|,\s*|\.\s*|;\s*)/);  // split by word + punctuation
let i = 0;
function reveal() {
  if (i >= chunks.length) return;
  element.textContent += chunks[i++];
  const delay = 40 + Math.random() * 80;  // irregular 40-120ms
  setTimeout(reveal, delay);
}
reveal();
```

### 4.6 Anticipation → Action → Follow-through

Three of Disney's 12 principles. Anthropic uses them very explicitly:

- **Anticipation**: before the action begins there's a small reverse motion (the button shrinks slightly, then pops out)
- **Action**: the main motion itself
- **Follow-through**: there's a lingering aftermath after the action ends (the card settles, then a slight bounce)

```js
// The complete three-part card entrance
const anticip = interpolate(t, [0, 0.2], [1, 0.95], Easing.easeIn);     // anticipation
const action  = interpolate(t, [0.2, 0.7], [0.95, 1.05], Easing.expoOut); // action
const settle  = interpolate(t, [0.7, 1], [1.05, 1], Easing.spring);       // settle/bounce
// final scale = product of the three, or applied piecewise
```

**Counter-example**: animation with only Action and no Anticipation + Follow-through looks like "PowerPoint animation."

### 4.7 3D Perspective + translateZ Layering

To get the "tilted 3D + floating cards" character, add perspective to the container and give individual elements different translateZ:

```css
.stage-wrap {
  perspective: 2400px;
  perspective-origin: 50% 30%;  /* line of sight slightly looking down */
}
.card-grid {
  transform-style: preserve-3d;
  transform: rotateX(8deg) rotateY(-4deg);  /* golden ratio */
}
.card:nth-child(3n) { transform: translateZ(30px); }
.card:nth-child(5n) { transform: translateZ(-20px); }
.card:nth-child(7n) { transform: translateZ(60px); }
```

**Why rotateX 8° / rotateY -4° is the golden ratio:**
- Greater than 10° → the distortion is too strong, it looks like it's "falling over"
- Less than 5° → it looks like "skewing" rather than "perspective"
- The asymmetric ratio of 8° × -4° simulates the natural angle of "the camera looking down from the top-left of the desk"

### 4.8 Diagonal Pan · Move X and Y Together

Camera motion is not purely up/down or purely left/right, but **moves X and Y simultaneously** to simulate diagonal movement:

```js
const panX = Math.sin(flowT * 0.22) * 40;
const panY = Math.sin(flowT * 0.35) * 30;
stage.style.transform = `
  translate(-50%, -50%)
  rotateX(8deg) rotateY(-4deg)
  translate3d(${panX}px, ${panY}px, 0)
`;
```

**Key**: the frequencies of X and Y differ (0.22 vs 0.35), to avoid the Lissajous loop becoming regular.

---

## 5. Scene Recipes (Three Narrative Templates)

The three videos in the reference material correspond to three product personalities. **Pick the one that fits your product best**; don't mix them.

### Recipe A · Apple Keynote Dramatic (Claude Design type)

**Suits**: major version launches, hero animations, visual-wow-first
**Rhythm**: Slow-Fast-Boom-Stop, strong arc
**Easing**: `expoOut` throughout + a little `overshoot`
**SFX density**: high (~0.4/s), with SFX pitch tuned to the BGM scale
**BGM**: IDM / minimal tech electronica, cool + precise
**Convergence**: camera snaps back → drop → Logo morph → ethereal single tone → abrupt stop

### Recipe B · One-Take Tool (Claude Code type)

**Suits**: developer tools, productivity apps, flow-state scenarios
**Rhythm**: sustained steady flow, no obvious peak
**Easing**: `spring` physics + `expoOut`
**SFX density**: **0** (editing rhythm driven purely by BGM)
**BGM**: Lo-fi Hip-hop / Boom-bap, 85-90 BPM
**Core technique**: land key UI actions on the BGM kick/snare transients — "**the music's groove is the interaction SFX**"

### Recipe C · Office-Productivity Narrative (Claude for Word type)

**Suits**: enterprise software, document/spreadsheet/calendar tools, professionalism-first
**Rhythm**: multiple scenes with hard cuts + Dolly In/Out
**Easing**: `overshoot` (toggle) + `expoOut` (panel)
**SFX density**: medium (~0.3/s), mainly UI clicks
**BGM**: Jazzy Instrumental, minor key, BPM 90-95
**Core highlight**: one scene must have the "whole-film highlight" — 3D pop-out / lifting off the plane

---

## 6. Counter-Examples · This Is AI Slop

| Anti-pattern | Why it's wrong | Correct approach |
|---|---|---|
| `transition: all 0.3s ease` | `ease` is a cousin of linear, all elements at the same speed | Use `expoOut` + per-element stagger |
| All entrances are `opacity 0→1` | No sense of motion direction | Pair with `translateY 10→0` + Anticipation |
| Logo fades in | No sense of narrative convergence | Morph / Converge / collapse-and-expand |
| Mouse moves in a straight line | Subconscious machine feeling | Bézier arc + Perlin Noise |
| Typing pops one char at a time (setInterval) | Like old-movie subtitles | Chunk Reveal, random intervals |
| No hover before the key result | Viewer has no reaction time | 0.5s hover before the result |
| Focus shift only changes opacity | Non-focus elements are still sharp | opacity + brightness + **blur** |
| Pure black base / pure white base | Cyber feeling / glare fatigue | Neutral with color temperature (via brand spec) |
| All animation equally fast | No rhythm | Slow-Fast-Boom-Stop |
| Fade-out ending | No sense of decision | Abrupt stop (hold the final frame) |

---

## 7. Self-Check Checklist (60 Seconds Before Delivery)

- [ ] Is the narrative structure Slow-Fast-Boom-Stop, not even pacing?
- [ ] Is the default easing `expoOut`, not `easeOut` or `linear`?
- [ ] Do toggles / button pop-outs use `overshoot`?
- [ ] Do card / list entrances have a 30ms stagger?
- [ ] Is there a 0.5s hover before the key result?
- [ ] Does typing use Chunk Reveal, not setInterval single-char?
- [ ] Does the focus shift add blur (not just opacity)?
- [ ] Is the Logo a morph-and-converge (Morph), not a fade-in?
- [ ] Is the base color not pure black / pure white (has color temperature)?
- [ ] Does the text have a serif + sans-serif hierarchy?
- [ ] Is the ending an abrupt stop, not a fade?
- [ ] (If there's a mouse) Is the mouse trail an arc, not a straight line?
- [ ] Does the SFX density match the product personality (see Recipes A/B/C)?
- [ ] Is there a 6-8dB loudness difference between BGM and SFX? (see `audio-design-rules.md`)

---

## 8. Relationship to Other References

| reference | Role | Relationship |
|---|---|---|
| `animation-pitfalls.md` | Technical anti-patterns (16) | "**Don't do this**" · the flip side of this file |
| `animations.md` | Stage/Sprite engine usage | The basics of **how to write** animation |
| `audio-design-rules.md` | Dual-track audio rules | The rules for **scoring** animation |
| `sfx-library.md` | A list of 37 SFX | The SFX **asset library** |
| `apple-gallery-showcase.md` | Apple gallery showcase style | A focused study of one specific motion style |
| **this file** | Positive motion-design grammar | "**Do it this way**" |

**Call order**:
1. First look at the four positioning questions in SKILL.md workflow Step 3 (decides narrative role and visual temperature)
2. After settling on a direction, read this file to determine the **motion language** (Recipe A/B/C)
3. When writing code, refer to `animations.md` and `animation-pitfalls.md`
4. When exporting video, go through `audio-design-rules.md` + `sfx-library.md`

---

## Appendix · Source Material for This File

- Anthropic official animation teardown: `参考动画/BEST-PRACTICES.md` in the Huashu project directory
- Anthropic audio teardown: `AUDIO-BEST-PRACTICES.md` in the same directory
- 3 reference videos: `ref-{1,2,3}.mp4` + the corresponding `gemini-ref-*.md` / `audio-ref-*.md`
- **Strict filtering**: this reference includes no specific brand color values, typeface names, or product names.
  Color/typeface decisions go through §1.a Core Asset Protocol or the 20 design philosophies.
